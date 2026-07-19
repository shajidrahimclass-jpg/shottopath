import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout, MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getOrders, cancelOrder } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { OrderWithItems } from '@/types';
import { Package, ChevronRight, MessageCircle, XCircle, ShoppingBag, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import { InvoiceDialog } from '@/components/InvoiceDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  shipped:    'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  delivered:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export default function MobileOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderWithItems | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading before deciding to redirect
    if (authLoading) return;
    if (!user) { navigate(MOBILE_ROUTES.login); return; }
    fetchOrders();

    const ch = supabase.channel('mobile-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const data = await getOrders(user.id);
      setOrders(data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrder(orderToCancel, '');
      toast.success('Order cancelled');
      fetchOrders();
    } catch { toast.error('Failed to cancel order'); }
    finally { setCancelling(false); setCancelDialogOpen(false); }
  };

  return (
    <MobileLayout>
      <PageMeta title="My Orders" />
      <div className="px-4 py-4 space-y-4">
        <h1 className="text-lg font-bold">My Orders</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}><CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-4 w-48 bg-muted" />
                <Skeleton className="h-4 w-24 bg-muted" />
              </CardContent></Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
            <p className="text-base font-semibold">No orders yet</p>
            <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
            <Button onClick={() => navigate(MOBILE_ROUTES.products)}>Browse Products</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_COLORS[order.status] || 'bg-muted text-foreground'}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5">
                    {order.items?.slice(0, 2).map(item => (
                      <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Package className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate flex-1">{item.product_name}</span>
                        <span className="shrink-0 font-medium">×{item.quantity}</span>
                      </div>
                    ))}
                    {(order.items?.length ?? 0) > 2 && (
                      <p className="text-xs text-muted-foreground">+{order.items.length - 2} more items</p>
                    )}
                  </div>

                  <Separator />

                  {/* Total + actions */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-primary">৳{order.total.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-3"
                        onClick={() => { setInvoiceOrder(order); setInvoiceOpen(true); }}
                      >
                        <Receipt className="h-3.5 w-3.5 mr-1" />
                        Invoice
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-3"
                        onClick={() => navigate(`${MOBILE_ROUTES.chat}?orderId=${order.id}`)}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />
                        Chat
                      </Button>
                      {['pending', 'processing'].includes(order.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs px-3 text-destructive hover:bg-destructive/10"
                          onClick={() => { setOrderToCancel(order.id); setCancelDialogOpen(true); }}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="h-4" />
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Dialog */}
      {invoiceOrder && (
        <InvoiceDialog
          open={invoiceOpen}
          onOpenChange={setInvoiceOpen}
          order={invoiceOrder}
        />
      )}
    </MobileLayout>
  );
}
