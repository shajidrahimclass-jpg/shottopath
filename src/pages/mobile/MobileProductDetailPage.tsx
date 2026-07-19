/**
 * Mobile product detail — full-screen hero image, glass info panel, gradient CTA bar.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout, MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getProductBySlug, getProductReviews, addToRecentlyViewed } from '@/db/api';
import type { CartItem } from '@/types';
import type { Product, ReviewWithUser } from '@/types';
import { ShoppingCart, ArrowLeft, Star, Package, ChevronLeft, ChevronRight, Gift, Zap, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType, getDeviceImages } from '@/hooks/useDeviceType';
import { ProductOptionsDialog } from '@/components/ProductOptionsDialog';
import { maskUsername } from '@/lib/utils';
import PageMeta from '@/components/common/PageMeta';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function MobileProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { appSettings, loading: settingsLoading } = useAppSettings();
  const { deviceType } = useDeviceType();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'cart' | 'buyNow'>('cart');
  const [wishlisted, setWishlisted] = useState(false);
  const [imgTouch, setImgTouch] = useState(0);

  // Load product independently — never gated on auth state
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const prod = await getProductBySlug(slug);
        setProduct(prod);
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  // Load reviews separately — failure silently shows empty reviews (never blocks product)
  useEffect(() => {
    if (!slug) return;
    getProductReviews(slug)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [slug]);

  // Track recently viewed only when signed in
  useEffect(() => {
    if (product && user) addToRecentlyViewed(product.id).catch(() => {});
  }, [product?.id, user]);

  const images = product
    ? (() => {
        const gallery = getDeviceImages(deviceType, product.pc_images, product.mobile_images) || [];
        const mainImage = product.thumbnail || product.image_url || '';
        // Prepend thumbnail as the main embedded image if not already present
        if (mainImage && !gallery.includes(mainImage)) {
          return [mainImage, ...gallery];
        }
        if (gallery.length === 0 && product.image_url) return [product.image_url];
        return gallery.length > 0 ? gallery : [];
      })()
    : [];

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  // Reactive force sign-in gate
  useEffect(() => {
    if (!settingsLoading && appSettings !== null && !user && appSettings.force_sign_in === true) {
      navigate(MOBILE_ROUTES.login);
    }
  }, [settingsLoading, appSettings, user, navigate]);

  const handleAction = (type: 'cart' | 'buyNow') => {
    if (!settingsLoading && appSettings !== null && !user && appSettings.force_sign_in === true) { navigate(MOBILE_ROUTES.login); return; }
    setActionType(type); setDialogOpen(true);
  };

  const handleImgTouch = (e: React.TouchEvent) => setImgTouch(e.touches[0].clientX);
  const handleImgRelease = (e: React.TouchEvent) => {
    const delta = imgTouch - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40 && images.length > 1) {
      if (delta > 0) setImgIndex(i => (i + 1) % images.length);
      else setImgIndex(i => (i - 1 + images.length) % images.length);
    }
  };

  if (loading) return (
    <MobileLayout>
      <div>
        <Skeleton className="w-full aspect-[4/5] bg-muted" />
        <div className="px-4 pt-4 space-y-3">
          <Skeleton className="h-6 w-3/4 bg-muted" />
          <Skeleton className="h-5 w-1/3 bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-2/3 bg-muted" />
        </div>
      </div>
    </MobileLayout>
  );

  if (!product) return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-3">
        <Package className="h-14 w-14 text-muted-foreground/30" />
        <p className="font-black text-base">Product not found</p>
        <button onClick={() => navigate(MOBILE_ROUTES.products)}
          className="px-5 h-10 rounded-xl text-white text-sm font-bold"
          style={{ background: 'var(--gradient-primary)' }}>
          Browse Products
        </button>
      </div>
    </MobileLayout>
  );

  return (
    <MobileLayout>
      <PageMeta title={product.name} />

      {/* ── Full-screen hero image gallery ───────────────── */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-muted select-none"
           onTouchStart={handleImgTouch} onTouchEnd={handleImgRelease}>
        {images.length > 0 && images[0] ? (
          <>
            {images.map((src, i) => (
              <img key={i} src={src} alt={`${product.name} ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${i === imgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} />
            ))}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-20 w-20 text-muted-foreground/20" />
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20 pointer-events-none" />

        {/* Back btn */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white rounded-full p-2.5 active:scale-90 transition-transform z-10">
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Wishlist */}
        <button onClick={() => setWishlisted(w => !w)}
          className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-full p-2.5 active:scale-90 transition-transform z-10">
          <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
        </button>

        {/* Image nav arrows */}
        {images.length > 1 && (
          <>
            <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-2 active:scale-90 transition-transform z-10">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-2 active:scale-90 transition-transform z-10">
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button key={i} onClick={() => setImgIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === imgIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        {/* Out of stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-black text-base bg-black/60 px-4 py-2 rounded-2xl">Out of Stock</span>
          </div>
        )}

        {/* Floating thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
            {images.slice(0, 5).map((src, i) => (
              <button key={i} onClick={() => setImgIndex(i)}
                className={`h-10 w-10 rounded-xl overflow-hidden border-2 transition-all ${i === imgIndex ? 'border-white scale-105' : 'border-white/30 opacity-60'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Product info panel ───────────────────────────── */}
      <div className="px-4 pt-5 pb-32 space-y-5">

        {/* Title row */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-xl font-black leading-tight flex-1 text-balance">{product.name}</h1>
            {product.is_gift_card && (
              <Badge className="shrink-0 gap-1 text-xs border-0" style={{ background: 'var(--gradient-primary)' }}>
                <Gift className="h-3 w-3" />Gift
              </Badge>
            )}
          </div>

          {/* Price + stock */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-black bg-clip-text text-transparent"
                  style={{ backgroundImage: 'var(--gradient-primary)' }}>
              ৳{product.price.toLocaleString()}
            </span>
            {product.stock > 0 ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/40 px-2.5 py-1 rounded-full">
                In Stock ({product.stock})
              </span>
            ) : (
              <span className="text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Rating row */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-muted/40 rounded-2xl p-4">
            <h3 className="font-black text-sm mb-2">About this product</h3>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              {product.description}
            </p>
          </div>
        )}

        {/* Variants */}
        {(product.colors?.length > 0 || product.sizes?.length > 0) && (
          <div className="space-y-4">
            {product.colors?.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Colors</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <span key={c} className="px-3.5 py-1.5 rounded-full border border-border/60 text-xs font-bold bg-muted/40">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <span key={s} className="px-3.5 py-1.5 rounded-full border border-border/60 text-xs font-bold bg-muted/40">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <h3 className="font-black text-sm mb-3">Reviews ({reviews.length})</h3>
            <div className="space-y-2.5">
              {reviews.slice(0, 3).map(r => (
                <div key={r.id} className="bg-muted/40 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black">
                      {r.is_anonymous ? maskUsername(r.user.username) : r.user.username}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky glass CTA bar ─────────────────────────── */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
        <div className="bg-background/85 backdrop-blur-xl border border-border/50 rounded-2xl px-4 py-3 flex gap-3 shadow-xl"
             style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
          {/* Cart btn */}
          <button
            disabled={product.stock === 0}
            onClick={() => handleAction('cart')}
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm border-2 border-primary text-primary active:scale-95 transition-transform disabled:opacity-40">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          {/* Buy now — gradient */}
          <button
            disabled={product.stock === 0}
            onClick={() => handleAction('buyNow')}
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm text-white active:scale-95 transition-transform disabled:opacity-40 shadow-md"
            style={{ background: 'var(--gradient-primary)' }}>
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      </div>

      {product && (
        <ProductOptionsDialog
          product={product}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={(options) => {
            if (!product) return;
            if (actionType === 'cart') {
              const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
              const idx = cart.findIndex(i => i.product.id === product.id && i.selectedColor === options.color && i.selectedSize === options.size);
              if (idx >= 0) cart[idx].quantity += options.quantity;
              else cart.push({ product, quantity: options.quantity, selectedColor: options.color, selectedSize: options.size });
              localStorage.setItem('cart', JSON.stringify(cart));
              window.dispatchEvent(new Event('storage'));
              toast.success(`Added ${options.quantity} item(s) to cart`);
              setDialogOpen(false);
            } else {
              localStorage.setItem('buyNowProduct', JSON.stringify({ product, quantity: options.quantity, selectedColor: options.color, selectedSize: options.size }));
              navigate(`${MOBILE_ROUTES.checkout}?buyNow=true`);
            }
          }}
          actionType={actionType}
        />
      )}
    </MobileLayout>
  );
}
