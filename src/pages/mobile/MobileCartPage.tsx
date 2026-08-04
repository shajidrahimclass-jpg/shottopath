import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout, MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import { Badge } from '@/components/ui/badge';
import type { CartItem } from '@/types';
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType, getDeviceImages, getDeviceThumbnail } from '@/hooks/useDeviceType';
import PageMeta from '@/components/common/PageMeta';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function MobileCartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appSettings, loading: settingsLoading } = useAppSettings();
  const { deviceType } = useDeviceType();

  const load = () => {
    try {
      const raw = localStorage.getItem('cart');
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  };

  useEffect(() => {
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const save = (updated: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setItems(updated);
  };

  const updateQty = (idx: number, delta: number) => {
    const updated = [...items];
    updated[idx].quantity = Math.max(1, updated[idx].quantity + delta);
    save(updated);
  };

  const remove = (idx: number) => {
    save(items.filter((_, i) => i !== idx));
    toast.success('Item removed');
  };

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const getThumb = (p: CartItem['product']) => {
    const imgs = getDeviceImages(deviceType, p.pc_images, p.mobile_images);
    return getDeviceThumbnail(deviceType, p.pc_thumbnail, p.mobile_thumbnail, p.thumbnail)
      || imgs?.[0] || p.image_url || '';
  };

  const handleCheckout = () => {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    navigate(MOBILE_ROUTES.checkout);
  };

  return (
    <MobileLayout>
      <PageMeta title="Cart" />

      {/* ── Gradient page header ─────────────────────────── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-primary)' }}>
            My Cart
          </h1>
          {items.length > 0 && (
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {itemCount} item{itemCount !== 1 ? 's' : ''} · ৳{subtotal.toLocaleString()}
            </p>
          )}
        </div>
        {items.length > 0 && (
          <button onClick={() => save([])}
            className="text-xs text-destructive font-bold px-3 py-1.5 rounded-xl bg-destructive/10 active:scale-95 transition-transform">
            Clear all
          </button>
        )}
      </div>

      <div className="px-3 space-y-3 pb-6">
        {items.length === 0 ? (
          /* ── Empty state ──────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="h-24 w-24 rounded-3xl flex items-center justify-center"
                 style={{ background: 'var(--gradient-primary)', opacity: 0.12 }}>
              <ShoppingCart className="h-10 w-10" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <p className="font-black text-base">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add products to get started</p>
            </div>
            <button onClick={() => navigate(MOBILE_ROUTES.products)}
              className="px-6 h-11 rounded-xl text-white text-sm font-black active:scale-95 transition-transform shadow-md"
              style={{ background: 'var(--gradient-primary)' }}>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* ── Cart items ────────────────────────────── */}
            {items.map((item, idx) => {
              const thumb = getThumb(item.product);
              return (
                <div key={`${item.product.id}-${idx}`}
                  className="flex gap-3 bg-card rounded-2xl overflow-hidden border border-border/40 shadow-sm active:scale-[0.99] transition-transform">
                  {/* Thumb */}
                  <div className="relative w-28 h-28 shrink-0 bg-muted overflow-hidden rounded-l-2xl">
                    {thumb ? (
                      <img src={thumb} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 absolute inset-0 m-auto text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-between gap-1.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <p className="text-sm font-bold leading-tight line-clamp-2 flex-1">
                        {item.product.name}
                      </p>
                      <button onClick={() => remove(idx)}
                        className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {(item.selectedColor || item.selectedSize) && (
                      <div className="flex gap-1 flex-wrap">
                        {item.selectedColor && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-bold">{item.selectedColor}</Badge>
                        )}
                        {item.selectedSize && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-bold">{item.selectedSize}</Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-border/60 bg-muted/40">
                        <button onClick={() => updateQty(idx, -1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground active:bg-muted transition-colors">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-black w-7 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(idx, 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground active:bg-muted transition-colors">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-black text-primary">
                        ৳{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Order summary card ────────────────────── */}
            <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-black text-sm">Order Summary</h2>
              </div>
              <div className="h-px bg-border/50" />
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">
                    Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                  </span>
                  <span className="font-bold">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Delivery</span>
                  <span className="text-green-600 font-bold text-xs">At checkout</span>
                </div>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="font-black text-sm">Total</span>
                <span className="text-2xl font-black bg-clip-text text-transparent"
                      style={{ backgroundImage: 'var(--gradient-primary)' }}>
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* ── Checkout CTA ──────────────────────────── */}
            <button onClick={handleCheckout}
              className="w-full h-14 rounded-2xl flex items-center justify-between px-6 text-white font-black text-sm active:scale-[0.98] transition-transform shadow-lg"
              style={{ background: 'var(--gradient-primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Checkout Now
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-xs font-bold">৳{subtotal.toLocaleString()}</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </button>

            <button onClick={() => navigate(MOBILE_ROUTES.products)}
              className="w-full text-center text-sm text-primary font-bold py-1 active:opacity-70 transition-opacity">
              ← Continue Shopping
            </button>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
