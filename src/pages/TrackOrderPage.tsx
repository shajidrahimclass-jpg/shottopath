import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { MobileLayout } from '@/components/layouts/MobileLayout';
import { MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import PageMeta from '@/components/common/PageMeta';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search, Package, MapPin, CreditCard, Clock, Truck, CheckCircle2, ChevronRight, RefreshCw, XCircle } from 'lucide-react';
import { getGuestOrder } from '@/db/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TrackOrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobileRoute = location.pathname.includes('/cjwjkkeojejdhishwihswugudhijeid/mobile');

  const urlOrderId = searchParams.get('id') || '';
  const urlPhone = searchParams.get('phone') || '';

  const [orderIdInput, setOrderIdInput] = useState(urlOrderId);
  const [phoneInput, setPhoneInput] = useState(urlPhone);
  
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);

  const fetchOrder = async (id: string, phone: string) => {
    if (!id || !phone) return;
    
    setLoading(true);
    try {
      const data = await getGuestOrder(id, phone);
      if (!data) {
        toast.error('Order not found. Please check your Order ID and Phone Number.');
        setOrderData(null);
      } else {
        setOrderData(data);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlOrderId && urlPhone) {
      fetchOrder(urlOrderId, urlPhone);
    }
  }, [urlOrderId, urlPhone]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput || !phoneInput) {
      toast.error('Please enter both Order ID and Phone Number');
      return;
    }
    
    // Update URL to make it shareable
    const params = new URLSearchParams();
    params.set('id', orderIdInput.trim());
    params.set('phone', phoneInput.trim());
    navigate({ search: params.toString() }, { replace: true });
    
    fetchOrder(orderIdInput.trim(), phoneInput.trim());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing': return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const content = (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-200px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">
          Enter your order ID and the phone number used during checkout to track your order status.
        </p>
      </div>

      <Card className="mb-8 border-2 shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="e.g. 01712345678"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto mt-4 md:mt-0 px-8">
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Track
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {orderData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Status Card */}
          <Card className="border-2 overflow-hidden border-primary/20">
            <div className="bg-primary/5 p-6 border-b">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">Order #{orderData.order.id.slice(0, 8).toUpperCase()}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Placed on {format(new Date(orderData.order.created_at), 'MMMM dd, yyyy h:mm a')}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full border font-semibold flex items-center gap-2 w-max ${getStatusColor(orderData.order.status)}`}>
                  {getStatusIcon(orderData.order.status)}
                  <span className="capitalize">{orderData.order.status}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{orderData.order.delivery_address.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{orderData.order.delivery_address.phone}</p>
                  <p className="text-sm text-muted-foreground mt-2">{orderData.order.delivery_address.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium uppercase">{orderData.order.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">৳{orderData.order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span className="font-medium">৳{orderData.order.delivery_charge.toFixed(2)}</span>
                  </div>
                  {orderData.order.discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-red-500">
                      <span>Discount</span>
                      <span>-৳{orderData.order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t flex justify-between items-center font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary text-lg">৳{orderData.order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Items ({orderData.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors border">
                    <div className="h-16 w-16 bg-muted rounded-md overflow-hidden shrink-0">
                      {item.product_thumbnail ? (
                        <img src={item.product_thumbnail} alt={item.product_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm md:text-base truncate">{item.product_name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        {item.selected_color && <span>Color: {item.selected_color}</span>}
                        {item.selected_size && <span>Size: {item.selected_size}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">৳{item.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  if (isMobileRoute) {
    return (
      <MobileLayout>
        <PageMeta title="Track Order" description="Track your order status" />
        {content}
      </MobileLayout>
    );
  }

  return (
    <MainLayout>
      <PageMeta title="Track Order" description="Track your order status" />
      {content}
    </MainLayout>
  );
}