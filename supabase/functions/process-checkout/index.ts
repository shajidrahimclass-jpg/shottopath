import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { p_order, p_items, p_user_id } = await req.json();

    if (!p_order || !p_items || !Array.isArray(p_items)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: p_order and p_items' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key — bypasses RLS and PostgREST schema cache entirely
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // ── Insert order ────────────────────────────────────────────────────────
    const orderInsert: Record<string, unknown> = {
      status:               p_order.status ?? 'pending',
      payment_method:       p_order.payment_method,
      payment_status:       p_order.payment_status ?? 'pending',
      payment_amount:       p_order.payment_amount ?? null,
      payment_details:      p_order.payment_details ?? null,
      transaction_id:       p_order.transaction_id ?? null,
      subtotal:             p_order.subtotal,
      delivery_charge:      p_order.delivery_charge ?? 0,
      discount:             p_order.discount ?? 0,
      total:                p_order.total,
      delivery_address:     p_order.delivery_address,
      delivery_location_id: p_order.delivery_location_id ?? null,
      voucher_code:         p_order.voucher_code ?? null,
      notes:                p_order.notes ?? null,
      gift_card_email:      p_order.gift_card_email ?? null,
      guest_email:          p_order.guest_email ?? null,
      guest_name:           p_order.guest_name ?? null,
      guest_phone:          p_order.guest_phone ?? null,
      disappearing_chat:    p_order.disappearing_chat ?? false,
    };

    // Only set user_id if provided (guest orders have no user_id)
    if (p_user_id) {
      orderInsert.user_id = p_user_id;
    }

    const { data: orderRow, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderErr) {
      console.error('Order insert error:', orderErr);
      return new Response(
        JSON.stringify({ error: orderErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderId = orderRow.id;

    // ── Insert order items & update stock ───────────────────────────────────
    for (const item of p_items) {
      // Check stock
      const { data: product, error: stockErr } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (stockErr || !product) {
        // Rollback order
        await supabaseAdmin.from('orders').delete().eq('id', orderId);
        return new Response(
          JSON.stringify({ error: `Product not found: ${item.product_name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (product.stock < item.quantity) {
        await supabaseAdmin.from('orders').delete().eq('id', orderId);
        return new Response(
          JSON.stringify({ error: `Insufficient stock for: ${item.product_name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert order item
      const { error: itemErr } = await supabaseAdmin.from('order_items').insert({
        order_id:      orderId,
        product_id:    item.product_id,
        product_name:  item.product_name,
        product_price: item.product_price,
        quantity:      item.quantity,
      });

      if (itemErr) {
        await supabaseAdmin.from('orders').delete().eq('id', orderId);
        return new Response(
          JSON.stringify({ error: itemErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Decrement stock
      const { error: updateErr } = await supabaseAdmin
        .from('products')
        .update({ stock: product.stock - item.quantity })
        .eq('id', item.product_id);

      if (updateErr) {
        console.error('Stock update error:', updateErr);
        // Non-fatal — order is placed, log and continue
      }
    }

    return new Response(
      JSON.stringify({ order: orderRow }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('process-checkout error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
