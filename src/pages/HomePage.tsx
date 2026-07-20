import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { DownloadPromoBanner } from '@/components/DownloadPromoBanner';
import { getProducts, getActiveBanners } from '@/db/api';
import type { Product, Banner } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShoppingCart, Package, TrendingUp, Shield, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType, getDeviceImages, getDeviceThumbnail } from '@/hooks/useDeviceType';
import { motion } from 'framer-motion';
import PageMeta from '@/components/common/PageMeta';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { PullToRefresh } from '@/components/PullToRefresh';
import { ProductOptionsDialog } from '@/components/ProductOptionsDialog';
import { ProductUserManualDialog } from '@/components/ProductUserManualDialog';
import { toast } from 'sonner';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deviceType, isTransitioning } = useDeviceType();
  const { appSettings } = useAppSettings();

  // Helper function to get display image for a product
  const getProductDisplayImage = (product: Product): string => {
    const deviceImages = getDeviceImages(
      deviceType,
      product.pc_images,
      product.mobile_images
    );
    
    // Priority: device-specific thumbnail > regular thumbnail > first device image > image_url
    const thumbnail = getDeviceThumbnail(
      deviceType,
      product.pc_thumbnail,
      product.mobile_thumbnail,
      product.thumbnail
    );
    
    return thumbnail ||
           (deviceImages && deviceImages.length > 0 ? deviceImages[0] : '') ||
           product.image_url || 
           '';
  };

  useEffect(() => {
    // Redirect logged-in users to products catalog
    if (user) {
      navigate('/products');
      return;
    }

    fetchData();

    // Listen for stock updates
    const handleStockUpdate = () => {
      fetchData();
    };

    window.addEventListener('stockUpdated', handleStockUpdate);

    return () => {
      window.removeEventListener('stockUpdated', handleStockUpdate);
    };
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [productsData, bannersData] = await Promise.all([
        getProducts(6),
        getActiveBanners('home'),
      ]);
      
      // Sort products: in-stock first, then out-of-stock
      // A product is out of stock if stock is 0 OR stock is less than minimum quantity
      const inStockProducts = productsData.filter(p => p.stock > 0 && p.stock >= (p.min_quantity || 1));
      const outOfStockProducts = productsData.filter(p => p.stock === 0 || p.stock < (p.min_quantity || 1));
      const sortedProducts = [...inStockProducts, ...outOfStockProducts];
      
      setProducts(sortedProducts);
      setBanners(bannersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  // Auto-rotate banners every 3 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const addToCart = (product: Product) => {
    setSelectedProduct(product);
    
    // Check if manual exists and show dialog first
    if (product.user_manual) {
      setShowManualDialog(true);
      return;
    }
    
    // Otherwise show options dialog directly
    setDialogOpen(true);
  };

  const handleAcceptManual = () => {
    setShowManualDialog(false);
    // After accepting manual, show options dialog
    setDialogOpen(true);
  };

  const handleOptionsConfirm = (options: { 
    color?: string; 
    size?: string; 
    quantity: number;
    bundleItems?: Array<{ product: Product; quantity: number }>;
  }) => {
    if (!selectedProduct) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Add main product
    const existingItemIndex = cart.findIndex(
      (item: { product: Product; selectedColor?: string; selectedSize?: string }) =>
        item.product.id === selectedProduct.id &&
        item.selectedColor === options.color &&
        item.selectedSize === options.size
    );

    if (existingItemIndex >= 0) {
      const newQuantity = cart[existingItemIndex].quantity + options.quantity;
      // Check if new quantity exceeds stock
      if (newQuantity > selectedProduct.stock) {
        toast.error(`Cannot add more items. Maximum available: ${selectedProduct.stock}`);
        return;
      }
      cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Check if quantity exceeds stock
      if (options.quantity > selectedProduct.stock) {
        toast.error(`Cannot add more items. Maximum available: ${selectedProduct.stock}`);
        return;
      }
      cart.push({
        product: selectedProduct,
        quantity: options.quantity,
        selectedColor: options.color,
        selectedSize: options.size,
      });
    }

    // Add bundle items
    if (options.bundleItems && options.bundleItems.length > 0) {
      for (const bundleItem of options.bundleItems) {
        const existingBundleIndex = cart.findIndex(
          (item: { product: Product }) => item.product.id === bundleItem.product.id
        );
        
        if (existingBundleIndex >= 0) {
          const newQuantity = cart[existingBundleIndex].quantity + bundleItem.quantity;
          // Check if new quantity exceeds stock
          if (newQuantity > bundleItem.product.stock) {
            toast.error(`Cannot add ${bundleItem.product.name}. Maximum available: ${bundleItem.product.stock}`);
            return;
          }
          cart[existingBundleIndex].quantity = newQuantity;
        } else {
          // Check if quantity exceeds stock
          if (bundleItem.quantity > bundleItem.product.stock) {
            toast.error(`Cannot add ${bundleItem.product.name}. Maximum available: ${bundleItem.product.stock}`);
            return;
          }
          cart.push({
            product: bundleItem.product,
            quantity: bundleItem.quantity,
          });
        }
      }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    
    const totalItems = options.quantity + (options.bundleItems?.reduce((sum, item) => sum + item.quantity, 0) || 0);
    toast.success(`Added ${totalItems} item(s) to cart`);
    navigate('/cart');
  };

  return (
    <MainLayout>
      <PageMeta 
        title={appSettings?.site_title || 'Shottopoth - Your Trusted E-Commerce Platform'}
        description={appSettings?.site_description || 'Shop the best products at Shottopoth. Quality products, great prices, and excellent customer service.'}
      />
      <PullToRefresh onRefresh={handleRefresh}>
        {/* Dynamic Banner Carousel */}
        {banners.length > 0 ? (
          <section className="relative w-full overflow-hidden bg-muted"
            style={{ aspectRatio: '21/9', minHeight: '180px', maxHeight: '520px' }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentBannerIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              {banner.link ? (
                <a href={banner.link} className="block w-full h-full">
                  <img
                    src={banner.image_url}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover object-center protected-image"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                  />
                </a>
              ) : (
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover object-center protected-image"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                />
              )}
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 md:p-8">
                  <div className="container mx-auto">
                    <h2 className="text-lg md:text-2xl lg:text-4xl font-bold text-white line-clamp-2">{banner.title}</h2>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-primary/80 text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm shadow-lg"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-primary/80 text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm shadow-lg"
                aria-label="Next banner"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentBannerIndex
                      ? 'bg-primary w-8 shadow-glow'
                      : 'bg-white/60 hover:bg-white/90'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="relative gradient-animated text-white py-14 md:py-28 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-2xl animate-float" style={{animationDelay:"1.5s"}} />
            <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-xl animate-float" style={{animationDelay:"0.8s"}} />
          </div>
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {"Welcome to Shottopath"}
              </motion.h1>
              <motion.p 
                className="text-base md:text-lg mb-6 md:mb-8 text-white/90 max-w-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Discover amazing products at great prices. Shop now and enjoy fast delivery across Bangladesh.
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button size="lg" variant="secondary" onClick={() => navigate('/products')} className="btn-glow ripple font-bold shadow-xl text-base px-8">
                  Browse Products
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}
      <section className="py-10 md:py-16 animate-fade-in-up">
        <div className="container mx-auto px-4">
          {/* Download Promo Banner */}
          <div className="mb-12">
            <DownloadPromoBanner />
          </div>

          <motion.div 
            className="flex flex-wrap justify-between items-start md:items-center gap-3 mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2 className="text-3xl font-bold mb-2"><span className="gradient-text">Featured Products</span></h2>
              <p className="text-muted-foreground">Check out our latest and most popular items</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')} className="btn-glow border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200">
              View All
            </Button>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square w-full shimmer" />
                  <CardContent className="p-3 md:p-4">
                    <div className="h-5 w-3/4 mb-3 rounded shimmer" />
                    <div className="h-4 w-1/2 rounded shimmer" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 stagger">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${Math.min(index * 60, 300)}ms`, animationFillMode: 'both' }}
                >
                  <Card className="group overflow-hidden card-lift transition-smooth bg-card border border-border/60 p-0 h-full rounded-xl shadow-sm">
                    <div
                      className="relative aspect-square w-full bg-white cursor-pointer overflow-hidden flex items-center justify-center rounded-t-xl"
                      onClick={() => navigate(`/products/${product.slug || product.id}`)}
                    >
                      {isTransitioning ? (
                        /* Loading skeleton during device transition */
                        <div className="w-full h-full animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent mx-auto" />
                            <p className="text-xs text-muted-foreground">Loading...</p>
                          </div>
                        </div>
                      ) : getProductDisplayImage(product) ? (
                        <>
                          <motion.img
                            src={getProductDisplayImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover object-center protected-image"
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                            whileHover={{ scale: 1.1, rotate: 2 }}
                            transition={{ duration: 0.4 }}
                          />
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                          
                          {/* Gift Card Badge */}
                          {product.is_gift_card && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg flex items-center gap-1 md:gap-1.5 text-xs md:text-sm font-semibold z-10 hover:scale-110 transition-transform duration-300">
                                    <Gift className="h-3 w-3 md:h-4 md:w-4" />
                                    <span>Gift Card</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>This is a digital gift card product</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 md:p-4">
                    <h3
                      className="font-semibold mb-1 md:mb-2 cursor-pointer hover:text-primary transition-colors text-sm md:text-base truncate"
                      title={product.name}
                      onClick={() => navigate(`/products/${product.slug || product.id}`)}
                    >
                      {product.name}
                    </h3>
                    <p 
                      className="hidden md:block text-sm text-muted-foreground mb-3 truncate"
                      title={product.description || ''}
                    >
                      {product.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-lg md:text-2xl font-bold text-primary">৳{product.price}</span>
                      <Button size="sm" onClick={() => addToCart(product)} className="btn-glow ripple font-medium">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed Section */}
      <section className="container mx-auto px-4 py-12">
        <RecentlyViewed />
      </section>
      </PullToRefresh>

      {/* Product Options Dialog */}
      {selectedProduct && (
        <ProductOptionsDialog
          product={selectedProduct}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={handleOptionsConfirm}
          actionType="cart"
        />
      )}
      {/* Product User Manual Dialog */}
      {selectedProduct && selectedProduct.user_manual && (
        <ProductUserManualDialog
          product={selectedProduct}
          open={showManualDialog}
          onAccept={handleAcceptManual}
          onCancel={() => setShowManualDialog(false)}
          pageSource="home_page"
        />
      )}
    </MainLayout>
  );
}
