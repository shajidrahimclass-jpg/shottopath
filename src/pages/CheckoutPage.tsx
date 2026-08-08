import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { MobileLayout, MOBILE_ROUTES, MOBILE_BASE } from '@/components/layouts/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogDescription } from '@/components/ui/dialog';
import { TermsDialog } from '@/components/TermsDialog';
import { RefundsDialog } from '@/components/RefundsDialog';
import { ProductUserManualDialog } from '@/components/ProductUserManualDialog';
import { useAuth } from '@/contexts/AuthContext';
import { getDeliveryAddresses, getDeliveryLocations, getVoucherByCode, checkoutOrder, createNotification, getPaymentGateways, createDeliveryAddress } from '@/db/api';
import type { CartItem, DeliveryAddress, DeliveryLocation, Voucher, PaymentGateway } from '@/types';
import { toast } from 'sonner';
import { OrderSuccessModal } from '@/components/common/OrderSuccessModal';
import { Plus, MapPin, User, Phone, Home, CheckCircle2, Loader2, Save, MessageSquare, CreditCard, Briefcase, MoreHorizontal, FileText, Clock } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function CheckoutPage() {
  const { user, profile } = useAuth();
  const { appSettings, loading: settingsLoading } = useAppSettings();
  const isMobileRoute = window.location.pathname.includes('/mobile/');
  const Layout = isMobileRoute ? MobileLayout : MainLayout;
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<'full' | 'delivery_only'>('full');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Bangladesh',
    landmark: '',
    address: '',
    address_type: 'home' as 'home' | 'office' | 'other',
    is_default: false,
  });
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [paymentGateways, setPaymentGateways] = useState<{ bkash_number?: string; nagad_number?: string }>({});
  const [locationSearch, setLocationSearch] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [selectedManualProduct, setSelectedManualProduct] = useState<CartItem['product'] | null>(null);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [refundsDialogOpen, setRefundsDialogOpen] = useState(false);
  const [useProfileAddress, setUseProfileAddress] = useState(false);
  const [giftCardEmail, setGiftCardEmail] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [agreedToEmailWarning, setAgreedToEmailWarning] = useState(false);
  // Guest checkout info (when user is not logged in)
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    if (!settingsLoading && appSettings !== null && !user && appSettings.force_sign_in === true) {
      navigate(isMobileRoute ? MOBILE_ROUTES.login : '/login', { state: { from: '/checkout' } });
      return;
    }

    // Check if user is banned
    if (profile?.role === 'banned') {
      toast.error('Your account has been banned. You cannot make purchases.');
      
      // Send notification to user
      createNotification({
        user_id: user?.id ?? null,
        title: 'Purchase Attempt Blocked',
        message: 'Your account has been banned and you cannot make purchases. Please contact support for assistance.',
        type: 'system',
        order_id: null,
        read: false,
      }).catch(console.error);
      
      navigate('/');
      return;
    }

    // Check if this is a Buy Now checkout
    const urlParams = new URLSearchParams(window.location.search);
    const buyNowParam = urlParams.get('buyNow');
    
    if (buyNowParam === 'true') {
      const buyNowProduct = localStorage.getItem('buyNowProduct');
      if (buyNowProduct) {
        setCartItems([JSON.parse(buyNowProduct)]);
        setIsBuyNow(true);
      } else {
        navigate(isMobileRoute ? MOBILE_ROUTES.products : '/products');
        return;
      }
    } else {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cart.length === 0) {
        navigate(isMobileRoute ? MOBILE_ROUTES.cart : '/cart');
        return;
      }
      setCartItems(cart);
    }

    loadData();
  }, [user, profile, navigate, appSettings, settingsLoading]);

  // Reset payment method if it's not available for the selected location
  useEffect(() => {
    if (selectedLocation && selectedPayment) {
      const location = locations.find(loc => loc.id === selectedLocation);
      const availableMethods = location?.payment_methods || [];
      
      // Check if the currently selected payment method is available for this location
      if (!availableMethods.includes(selectedPayment)) {
        setSelectedPayment('');
        toast.info('Payment method changed due to location selection');
      }
    }
  }, [selectedLocation, locations, selectedPayment]);

  const loadData = async () => {
    try {
      const [addressesData, locationsData, gatewaysData] = await Promise.all([
        user ? getDeliveryAddresses(user.id) : Promise.resolve([]),
        getDeliveryLocations(),
        getPaymentGateways(),
      ]);

      setAddresses(addressesData);
      setLocations(locationsData.filter(l => l.is_active !== false));

      // Extract Bkash and Nagad numbers from gateways
      const bkashGateway = gatewaysData.find(g => g.name.toLowerCase() === 'bkash');
      const nagadGateway = gatewaysData.find(g => g.name.toLowerCase() === 'nagad');
      
      setPaymentGateways({
        bkash_number: bkashGateway?.config?.account_number as string,
        nagad_number: nagadGateway?.config?.account_number as string,
      });

      if (addressesData.length > 0) {
        const defaultAddr = addressesData.find(a => a.is_default) || addressesData[0];
        setSelectedAddress(defaultAddr.id);
      }

      if (locationsData.length > 0) {
        setSelectedLocation(locationsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load checkout data');
    }
  };

  const applyVoucher = async () => {
    if (!voucherCode) return;

    try {
      const voucher = await getVoucherByCode(voucherCode);

      if (!voucher) {
        toast.error('Invalid voucher code');
        return;
      }

      if (!voucher.is_active) {
        toast.error('This voucher is not active');
        return;
      }

      if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit) {
        toast.error('Voucher usage limit reached');
        return;
      }

      if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
        toast.error('Voucher has expired');
        return;
      }

      // Check minimum order amount
      const currentSubtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      if (voucher.minimum_amount && currentSubtotal < voucher.minimum_amount) {
        toast.error(`Minimum order amount of ৳${voucher.minimum_amount.toFixed(2)} required to use this voucher`);
        return;
      }

      setAppliedVoucher(voucher);
      toast.success('Voucher applied successfully');
    } catch (error) {
      console.error('Failed to apply voucher:', error);
      toast.error('Failed to apply voucher');
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.name || !newAddress.phone || (!newAddress.address && !newAddress.street)) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      // Guest user: just add to local state
      const fakeAddress = {
        id: `guest_${Date.now()}`,
        ...newAddress,
        user_id: null as unknown as string,
        created_at: new Date().toISOString()
      };
      setAddresses([...addresses, fakeAddress as DeliveryAddress]);
      setSelectedAddress(fakeAddress.id);
      setIsAddressDialogOpen(false);
      toast.success('Address applied successfully');
      return;
    }

    try {
      setLoading(true);
      const savedAddress = await createDeliveryAddress({
        user_id: user?.id ?? null,
        label: newAddress.label,
        name: newAddress.name,
        phone: newAddress.phone,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        zip_code: newAddress.zip_code,
        country: newAddress.country,
        landmark: newAddress.landmark,
        address: newAddress.address,
        address_type: newAddress.address_type,
        is_default: newAddress.is_default || addresses.length === 0,
      });
      
      setAddresses([...addresses, savedAddress]);
      setSelectedAddress(savedAddress.id);
      setNewAddress({
        label: 'Home',
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Bangladesh',
        landmark: '',
        address: '',
        address_type: 'home',
        is_default: false,
      });
      setIsAddressDialogOpen(false);
      toast.success('Address saved successfully');
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'office':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const handleUseProfileAddress = () => {
    if (!profile || !profile.full_name || !profile.phone || !profile.address) {
      toast.error('Please complete your profile address first');
      return;
    }

    setNewAddress({
      label: 'Home',
      name: profile.full_name,
      phone: profile.phone,
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'Bangladesh',
      landmark: '',
      address: profile.address,
      address_type: 'home',
      is_default: false,
    });
    setUseProfileAddress(true);
    toast.success('Profile address loaded');
  };

  const handlePlaceOrder = async () => {
    // Check if cart contains only gift card products
    const hasOnlyGiftCards = cartItems.every(item => item.product.is_gift_card);
    const hasGiftCard = cartItems.some(item => item.product.is_gift_card);
    
    // For gift card only orders, skip address/location validation
    if (hasOnlyGiftCards) {
      if (!selectedPayment) {
        toast.error('Please select a payment method');
        return;
      }
    } else {
      if (!selectedAddress || !selectedLocation || !selectedPayment) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    // Guest checkout validation
    if (!user) {
      if (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()) {
        toast.error('Please fill in your name, phone, and email to continue as guest');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Validate gift card email if cart contains gift card products
    if (hasGiftCard) {
      if (!giftCardEmail.trim()) {
        toast.error('Please provide an email address for gift card delivery');
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(giftCardEmail)) {
        toast.error('Please provide a valid email address');
        return;
      }
      
      if (!agreedToEmailWarning) {
        toast.error('Please confirm that you have read the email warning');
        return;
      }
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and refunds policy');
      return;
    }

    // Validate stock availability for all items
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        toast.error(`${item.product.name}: Only ${item.product.stock} items available in stock`);
        return;
      }
      
      // Validate minimum quantity requirement
      const minQty = item.product.min_quantity || 1;
      if (item.quantity < minQty) {
        toast.error(`${item.product.name}: Minimum order quantity is ${minQty} items. Please update your cart.`);
        return;
      }
    }

    // For gift card only orders, skip address/location validation
    let address, location;
    if (!hasOnlyGiftCards) {
      address = addresses.find(a => a.id === selectedAddress);
      location = locations.find(l => l.id === selectedLocation);

      if (!address || !location) {
        toast.error('Invalid address or location');
        return;
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let discount = 0;

    if (appliedVoucher) {
      if (appliedVoucher.type === 'percentage') {
        discount = (subtotal * appliedVoucher.value) / 100;
      } else {
        discount = appliedVoucher.value;
      }
    }

    const deliveryCharge = hasOnlyGiftCards ? 0 : (location?.charge || 0);
    const total = subtotal + deliveryCharge - discount;

    // For digital payments (bKash/Nagad), redirect to payment page
    if (selectedPayment === 'bkash' || selectedPayment === 'nagad') {
      const hasGiftCard = cartItems.some(item => item.product.is_gift_card);
      const orderData = {
        user_id: user?.id ?? null,
        status: 'pending' as const,
        subtotal,
        delivery_charge: deliveryCharge,
        discount,
        total,
        delivery_location_id: hasOnlyGiftCards ? null : location!.id,
        delivery_address: hasOnlyGiftCards ? {
          name: 'Gift Card - Digital Delivery',
          phone: 'N/A',
          address: 'Digital delivery to email'
        } : {
          name: address!.name,
          phone: address!.phone,
          address: address!.address,
        },
        payment_method: selectedPayment,
        voucher_code: appliedVoucher?.code || null,
        notes: orderNotes.trim() || null,
        gift_card_email: hasGiftCard ? giftCardEmail.trim() : null,
        guest_email: !user ? guestEmail.trim() : null,
        guest_name: !user ? guestName.trim() : null,
        guest_phone: !user ? guestPhone.trim() : null,
      };

      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        selected_color: item.selectedColor || null,
        selected_size: item.selectedSize || null,
      }));

      // Get payment gateway number
      const paymentGatewayNumber = selectedPayment === 'bkash' 
        ? paymentGateways.bkash_number 
        : paymentGateways.nagad_number;

      // Navigate to payment page with order data
      navigate(isMobileRoute ? `${MOBILE_ROUTES.home}/payment` : '/payment', {
        state: {
          orderData,
          orderItems,
          paymentMethod: selectedPayment,
          paymentGatewayNumber,
          paymentAmount,
          isBuyNow,
        }
      });
      return;
    }

    // For COD, create order directly (Note: COD is not available for gift cards)
    setLoading(true);

    try {
      const hasGiftCard = cartItems.some(item => item.product.is_gift_card);
      const orderData = {
        user_id: user?.id ?? null,
        status: 'pending' as const,
        subtotal,
        delivery_charge: deliveryCharge,
        discount,
        total,
        delivery_location_id: hasOnlyGiftCards ? null : location!.id,
        delivery_address: hasOnlyGiftCards ? {
          name: 'Gift Card - Digital Delivery',
          phone: 'N/A',
          address: 'Digital delivery to email'
        } : {
          name: address!.name,
          phone: address!.phone,
          address: address!.address,
        },
        payment_method: selectedPayment,
        payment_amount: null,
        payment_details: null,
        transaction_id: null,
        voucher_code: appliedVoucher?.code || null,
        notes: orderNotes.trim() || null,
        gift_card_email: hasGiftCard ? giftCardEmail.trim() : null,
        guest_email: !user ? guestEmail.trim() : null,
        guest_name: !user ? guestName.trim() : null,
        guest_phone: !user ? guestPhone.trim() : null,
        disappearing_chat: false
      };

      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        selected_color: item.selectedColor || null,
        selected_size: item.selectedSize || null,
      }));

      // Create order directly for COD
      const orderResult = await checkoutOrder(user?.id ?? null, orderData, orderItems);
      setCreatedOrderId(orderResult.order_id);

      // Create notification
      if (user) {
        await createNotification({
          user_id: user.id,
          type: 'order',
          title: 'Order Confirmed',
          message: `Your order #${orderResult.order_id.slice(0, 8)} has been placed successfully!`,
          read: false,
          order_id: orderResult.order_id,
        });
      }

      // Clear cart or buy now data
      if (isBuyNow) {
        localStorage.removeItem('buyNowProduct');
      } else {
        localStorage.removeItem('cart');
      }

      setSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Failed to place order:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error?.message) {
        if (error.message.includes('Insufficient stock')) {
          errorMessage = error.message; // Show the specific stock error
        } else if (error.message.includes('delivery_address')) {
          errorMessage = 'Invalid delivery address. Please check your address details.';
        } else if (error.message.includes('payment_method')) {
          errorMessage = 'Invalid payment method selected.';
        } else if (error.message.includes('user_id')) {
          errorMessage = `Error: ${error.message}`;
        } else if (error.message.includes('delivery_location_id')) {
          errorMessage = 'Invalid delivery location. Please select a valid location.';
        } else if (error.message.includes('product_id')) {
          errorMessage = 'One or more products are no longer available.';
        } else if (error.message.includes('violates check constraint')) {
          errorMessage = 'Invalid order data. Please check all fields.';
        } else if (error.message.includes('null value')) {
          errorMessage = 'Missing required information. Please fill all required fields.';
        } else {
          errorMessage = `Order failed: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const location = locations.find(l => l.id === selectedLocation);
  
  // Check if cart contains only gift card products
  const hasOnlyGiftCards = cartItems.length > 0 && cartItems.every(item => item.product.is_gift_card);
  const hasGiftCards = cartItems.some(item => item.product.is_gift_card);
  
  // Gift card orders have no delivery charge
  const deliveryCharge = hasOnlyGiftCards ? 0 : (location?.charge || 0);
  
  let discount = 0;

  if (appliedVoucher) {
    if (appliedVoucher.type === 'percentage') {
      discount = (subtotal * appliedVoucher.value) / 100;
    } else {
      discount = appliedVoucher.value;
    }
  }

  const total = subtotal + deliveryCharge - discount;

  // Helper: human-readable payment method label
  const paymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash_on_delivery: 'Cash on Delivery',
      bkash: 'bKash',
      nagad: 'Nagad',
    };
    return labels[method] ?? method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Filter payment methods based on user role and cart contents
  let availablePaymentMethods = location?.payment_methods || [];

  // If user is suspended, remove Cash on Delivery option
  if (profile?.role === 'suspended') {
    availablePaymentMethods = availablePaymentMethods.filter(method => method !== 'cash_on_delivery');
  }

  // If cart contains gift cards, remove Cash on Delivery option
  if (hasGiftCards) {
    availablePaymentMethods = availablePaymentMethods.filter(method => method !== 'cash_on_delivery');
  }

  // Filtered locations based on search
  const filteredLocations = locationSearch.trim()
    ? locations.filter(l => l.name.toLowerCase().includes(locationSearch.toLowerCase()))
    : locations;

  // Whether selected payment supports amount choice
  const isDigitalPayment = selectedPayment === 'bkash' || selectedPayment === 'nagad';
  const selectedPaymentGatewayNumber = selectedPayment === 'bkash'
    ? paymentGateways.bkash_number
    : selectedPayment === 'nagad'
      ? paymentGateways.nagad_number
      : undefined;

  return (
    <Layout>
      <PageMeta 
        title="Checkout - Complete Your Order"
        description="Complete your purchase securely. Multiple payment options available with fast delivery."
      />
      <div className="container mx-auto px-4 py-6 md:py-8 animate-in fade-in duration-500">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Hide delivery address for gift card only orders */}
            {!hasOnlyGiftCards && (
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                    <span className="truncate">Delivery Address</span>
                  </CardTitle>
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1 md:gap-2 border-2 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105 text-xs md:text-sm shrink-0"
                      >
                        <Plus className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Add New</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Add New Address
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        {/* Address Type Selection */}
                        <div className="space-y-2">
                          <Label>Address Type</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['home', 'office', 'other'] as const).map((type) => (
                              <Button
                                key={type}
                                type="button"
                                variant={newAddress.address_type === type ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => setNewAddress({ ...newAddress, address_type: type })}
                              >
                                {getAddressTypeIcon(type)}
                                <span className="ml-2 capitalize">{type}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Label */}
                        <div className="space-y-2">
                          <Label htmlFor="label">Address Label</Label>
                          <Input
                            id="label"
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                            placeholder="e.g., Home, Office, Parents House"
                          />
                          <p className="text-xs text-muted-foreground">Give this address a memorable name</p>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                              placeholder="Recipient's full name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                              placeholder="+880 1XXX-XXXXXX"
                              required
                            />
                          </div>
                        </div>

                        {/* Street Address */}
                        <div className="space-y-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            placeholder="House/Flat number, Street name"
                          />
                        </div>

                        {/* City, State, ZIP */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              placeholder="City"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State/Division</Label>
                            <Input
                              id="state"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              placeholder="State or Division"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip">ZIP/Postal Code</Label>
                            <Input
                              id="zip"
                              value={newAddress.zip_code}
                              onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                              placeholder="ZIP Code"
                            />
                          </div>
                        </div>

                        {/* Country */}
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select
                            value={newAddress.country}
                            onValueChange={(value) => setNewAddress({ ...newAddress, country: value })}
                          >
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="Pakistan">Pakistan</SelectItem>
                              <SelectItem value="Nepal">Nepal</SelectItem>
                              <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Landmark */}
                        <div className="space-y-2">
                          <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
                          <Input
                            id="landmark"
                            value={newAddress.landmark}
                            onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                            placeholder="e.g., Near City Hospital, Opposite Park"
                          />
                          <p className="text-xs text-muted-foreground">Help delivery person find you easily</p>
                        </div>

                        {/* Full Address (Fallback) */}
                        <div className="space-y-2">
                          <Label htmlFor="address">Complete Address</Label>
                          <Textarea
                            id="address"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                            placeholder="Full address including all details"
                            rows={3}
                          />
                        </div>

                        {/* Set as Default */}
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <Label htmlFor="default">Set as Default Address</Label>
                            <p className="text-sm text-muted-foreground">
                              Use this address as default for checkout
                            </p>
                          </div>
                          <Switch
                            id="default"
                            checked={newAddress.is_default}
                            onCheckedChange={(checked) => setNewAddress({ ...newAddress, is_default: checked })}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsAddressDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            className="flex-1"
                            onClick={handleSaveAddress}
                            disabled={loading || !newAddress.name || !newAddress.phone || (!newAddress.address && !newAddress.street)}
                          >
                            {loading ? 'Saving...' : 'Add Address'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {/* Guest info form — shown only when not logged in */}
                {!user && (
                  <div className="mb-4 space-y-3 p-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5">
                    <p className="text-sm font-semibold text-primary">Guest Information (required)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="guest-name">Full Name *</Label>
                        <Input
                          id="guest-name"
                          value={guestName}
                          onChange={e => setGuestName(e.target.value)}
                          placeholder="Your full name"
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="guest-phone">Phone Number *</Label>
                        <Input
                          id="guest-phone"
                          value={guestPhone}
                          onChange={e => setGuestPhone(e.target.value)}
                          placeholder="e.g. 01XXXXXXXXX"
                          className="border-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="guest-email">Email Address *</Label>
                      <Input
                        id="guest-email"
                        type="email"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="border-2"
                      />
                      <p className="text-xs text-muted-foreground">Used to track your order status</p>
                    </div>
                  </div>
                )}
                {addresses.length === 0 ? (
                  <div className="text-center py-6 md:py-8 space-y-3">
                    <div className="mx-auto w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center">
                      <MapPin className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">No saved addresses yet</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Add a new address to continue</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    <div className="space-y-2 md:space-y-3">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id} 
                          className={`relative rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                            selectedAddress === addr.id 
                              ? 'border-primary bg-primary/10 shadow-md' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-2 md:gap-3 p-3 md:p-4">
                            <RadioGroupItem 
                              value={addr.id} 
                              id={addr.id} 
                              className="mt-1 shrink-0" 
                            />
                            <Label htmlFor={addr.id} className="flex-1 cursor-pointer space-y-1.5 md:space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
                                <p className="font-bold text-sm md:text-base">{addr.name}</p>
                                {addr.is_default && (
                                  <Badge variant="secondary" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                <Phone className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                                <p>{addr.phone}</p>
                              </div>
                              <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                                <Home className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0 mt-0.5" />
                                <p className="flex-1 break-words">{addr.address}</p>
                              </div>
                            </Label>
                            {selectedAddress === addr.id && (
                              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0 animate-in zoom-in duration-200" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
            )}

            {/* Hide delivery location for gift card only orders */}
            {!hasOnlyGiftCards && (
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Delivery Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-3">
                {/* Search box */}
                <Input
                  placeholder="Search location..."
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                  className="border-2 focus:border-primary"
                />
                {/* Scrollable list */}
                <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation}>
                  {filteredLocations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No locations match your search.</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredLocations.map((loc) => {
                      const isSelected = selectedLocation === loc.id;
                      return (
                        <div
                          key={loc.id}
                          className={`relative rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary/8 shadow-md ring-1 ring-primary/30'
                              : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedLocation(loc.id)}
                        >
                          <RadioGroupItem value={loc.id} id={loc.id} className="sr-only" />
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5">
                              <CheckCircle2 className="h-4 w-4 text-primary animate-in zoom-in duration-200" />
                            </div>
                          )}
                          <div className="p-3.5 pr-8 space-y-1.5">
                            <Label htmlFor={loc.id} className="cursor-pointer block">
                              <p className={`font-bold text-sm leading-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                {loc.name}
                              </p>
                            </Label>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>{loc.duration || `${loc.min_days}–${loc.max_days} days`}</span>
                            </div>
                            <p className={`text-base font-black ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {loc.charge === 0 ? 'Free' : `৳${loc.charge}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
                {/* Selected summary */}
                {location && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Selected: <strong className="text-foreground">{location.name}</strong> — ৳{location.charge} · {location.duration || `${location.min_days}–${location.max_days} days`}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* Payment Method Card */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                {profile?.role === 'suspended' && (
                  <div className="p-2.5 md:p-3 bg-destructive/10 border-2 border-destructive/20 rounded-lg">
                    <p className="text-xs md:text-sm text-destructive">
                      <strong>Note:</strong> Cash on Delivery is not available for suspended accounts.
                    </p>
                  </div>
                )}
                {hasGiftCards && (
                  <div className="p-2.5 md:p-3 bg-primary/10 border-2 border-primary/20 rounded-lg">
                    <p className="text-xs md:text-sm text-primary-foreground">
                      <strong>Important:</strong> Gift card delivery takes approximately 24 hours after payment confirmation.
                    </p>
                  </div>
                )}
                {availablePaymentMethods.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Please select a delivery location first to see available payment methods.
                  </p>
                )}
                <RadioGroup value={selectedPayment} onValueChange={(v) => { setSelectedPayment(v); setPaymentAmount('full'); }}>
                  <div className="space-y-2 md:space-y-3">
                    {availablePaymentMethods.map((method) => (
                      <div
                        key={method}
                        className={`rounded-xl border-2 transition-all ${
                          selectedPayment === method
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4">
                          <RadioGroupItem value={method} id={`pm-${method}`} className="shrink-0" />
                          <Label htmlFor={`pm-${method}`} className="cursor-pointer flex-1">
                            <span className="font-semibold text-sm md:text-base">{paymentMethodLabel(method)}</span>
                            {method === 'cash_on_delivery' && (
                              <p className="text-xs text-muted-foreground mt-0.5">Pay when your order arrives</p>
                            )}
                            {(method === 'bkash' || method === 'nagad') && (
                              <p className="text-xs text-muted-foreground mt-0.5">Online mobile payment</p>
                            )}
                          </Label>
                          {selectedPayment === method && (
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 animate-in zoom-in duration-200" />
                          )}
                        </div>

                        {/* Inline payment amount selector for bKash / Nagad */}
                        {selectedPayment === method && isDigitalPayment && (
                          <div className="px-3 pb-3 md:px-4 md:pb-4 space-y-2 border-t border-primary/20 pt-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Select amount to pay now</p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setPaymentAmount('full')}
                                className={`rounded-lg border-2 p-3 text-left transition-all ${
                                  paymentAmount === 'full'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/40'
                                }`}
                              >
                                <p className="text-xs font-bold">Full Payment</p>
                                <p className="text-sm font-bold text-primary">৳{total.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Pay entire order now</p>
                              </button>
                              {deliveryCharge > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentAmount('delivery_only')}
                                  className={`rounded-lg border-2 p-3 text-left transition-all ${
                                    paymentAmount === 'delivery_only'
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border hover:border-primary/40'
                                  }`}
                                >
                                  <p className="text-xs font-bold">Delivery Only</p>
                                  <p className="text-sm font-bold text-primary">৳{deliveryCharge.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">Rest paid on delivery</p>
                                </button>
                              )}
                            </div>
                            {/* Show account number if configured */}
                            {selectedPaymentGatewayNumber && (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-primary/30 text-xs">
                                <span className="text-muted-foreground">Send to:</span>
                                <span className="font-bold text-primary font-mono">{selectedPaymentGatewayNumber}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Gift Card Email Card - Only show if cart contains gift card products */}
            {cartItems.some(item => item.product.is_gift_card) && (
              <Card className="border-2 shadow-lg border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    Gift Card Delivery Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gift-card-email" className="text-sm md:text-base">
                      Email Address for Gift Card Delivery <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="gift-card-email"
                      type="email"
                      value={giftCardEmail}
                      onChange={(e) => setGiftCardEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="border-2 focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-destructive font-medium mb-3">
                      ⚠️ Important: You must provide your email address correctly. "Shottopath" will not be responsible if you provide an incorrect email address.
                    </p>
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="email-warning"
                        checked={agreedToEmailWarning}
                        onCheckedChange={(checked) => setAgreedToEmailWarning(checked as boolean)}
                        className="mt-0.5 shrink-0"
                      />
                      <Label htmlFor="email-warning" className="cursor-pointer text-xs md:text-sm leading-relaxed">
                        I confirm that I have read and understood the warning above
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Notes Card */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Order Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-2">
                  <Label htmlFor="order-notes" className="text-sm md:text-base">
                    Add any special instructions or notes for your order
                  </Label>
                  <Textarea
                    id="order-notes"
                    value={orderNotes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setOrderNotes(value);
                      }
                    }}
                    placeholder="E.g., Please call before delivery, Leave at door, etc."
                    className="border-2 focus:border-primary min-h-[100px]"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {orderNotes.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions Card */}
            <Card className="border-2 shadow-lg border-primary/20">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-2 md:gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-0.5 md:mt-1 shrink-0"
                  />
                  <Label htmlFor="terms" className="cursor-pointer text-xs md:text-sm leading-relaxed">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setTermsDialogOpen(true);
                      }}
                      className="font-semibold text-primary hover:underline focus:outline-none focus:underline"
                    >
                      Terms and Conditions
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setRefundsDialogOpen(true);
                      }}
                      className="font-semibold text-primary hover:underline focus:outline-none focus:underline"
                    >
                      Refunds Policy
                    </button>
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-4">
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span className="font-medium">৳{deliveryCharge.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm md:text-base text-success">
                      <span>Discount</span>
                      <span className="font-medium">-৳{discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-base md:text-lg">
                  <span>Total</span>
                  <span className="text-primary">৳{total.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Label>Voucher Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Enter code"
                    />
                    <Button onClick={applyVoucher} variant="outline">
                      Apply
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddress || !selectedLocation || !selectedPayment || !agreedToTerms}
                >
                  {loading ? 'Processing...' : (selectedPayment === 'bkash' || selectedPayment === 'nagad') ? 'Proceed to Payment' : 'Place Order'}
                </Button>
                {!agreedToTerms && (
                  <p className="text-xs text-destructive text-center">
                    Please agree to the terms and refunds policy to continue
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Dialog */}
      <TermsDialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />
      <RefundsDialog open={refundsDialogOpen} onOpenChange={setRefundsDialogOpen} />
      
      <OrderSuccessModal 
        open={successModalOpen}
        guestOrderId={!user ? createdOrderId : null}
        guestPhone={!user ? (addresses.find(a => a.id === selectedAddress)?.phone || newAddress.phone || '') : undefined}
        guestEmail={!user ? guestEmail : undefined}
        isMobileRoute={isMobileRoute}
        onAnimationComplete={() => {
          if (user) {
            navigate(isMobileRoute ? MOBILE_ROUTES.orders : '/orders');
          }
          // Guest flow is handled inside the modal via CTA buttons
        }}
      />
    </Layout>
  );
}
