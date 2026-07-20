import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout, MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getProducts, getActiveBanners, getCategories } from '@/db/api';
import type { Product, Banner, Category } from '@/types';
import { ShoppingCart, ChevronLeft, ChevronRight, Zap, Shield, Package, Gift, Tag, ArrowRight, Star, Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType, getDeviceImages, getDeviceThumbnail } from '@/hooks/useDeviceType';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function MobileHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { deviceType } = useDeviceType();
  const { appSettings } = useAppSettings();

  // Signed-in users skip the landing page and go straight to the shop
  useEffect(() => {
    if (!authLoading && user) {
      navigate(MOBILE_ROUTES.products, { replace: true });
    }
  }, [user, authLoading]);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, bans, cats] = await Promise.all([
          getProducts(10),
          getActiveBanners('home'),
          getCategories(),
        ]);
        setProducts(prods);
        setBanners(bans);
        setCategories(cats.filter(c => c.is_active).slice(0, 8));
      } catch {
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setBannerIndex(i => (i + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  const getThumb = (p: Product) => {
    const imgs = getDeviceImages(deviceType, p.pc_images, p.mobile_images);
    return getDeviceThumbnail(deviceType, p.pc_thumbnail, p.mobile_thumbnail, p.thumbnail)
      || (imgs && imgs.length > 0 ? imgs[0] : '')
      || p.image_url || '';
  };

  const addToCart = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const idx = cart.findIndex((i: { product: Product }) => i.product.id === p.id);
      if (idx >= 0) cart[idx].quantity += 1;
      else cart.push({ product: p, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      toast.success(`Added to cart`, { description: p.name, duration: 2000 });
    } catch { toast.error('Failed to add to cart'); }
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) setBannerIndex(i => (i + 1) % banners.length);
      else setBannerIndex(i => (i - 1 + banners.length) % banners.length);
    }
  };

  const features = [
    { icon: Zap,     label: 'Fast',     sub: 'Delivery',  grad: 'from-amber-400 to-orange-500'  },
    { icon: Shield,  label: 'Secure',   sub: 'Payment',   grad: 'from-green-400 to-emerald-600' },
    { icon: Package, label: 'Easy',     sub: 'Returns',   grad: 'from-blue-400 to-indigo-500'   },
    { icon: Gift,    label: 'Daily',    sub: 'Deals',     grad: 'from-pink-400 to-rose-500'     },
  ];

  const catGrads = [
    'from-pink-400 to-rose-500',
    'from-blue-400 to-indigo-500',
    'from-amber-400 to-orange-500',
    'from-green-400 to-emerald-500',
    'from-purple-400 to-violet-600',
    'from-red-400 to-pink-600',
    'from-teal-400 to-cyan-600',
    'from-orange-400 to-yellow-500',
  ];

  return (
    <MobileLayout>
      <PageMeta title={appSettings?.site_title || 'Shottopoth'} description={appSettings?.site_description || ''} />

      <div className="pb-4">

        {/* ── Hero Banner — edge-to-edge, fully responsive ──── */}
        {loading ? (
          <Skeleton className="w-full aspect-[16/7] md:aspect-[21/8] bg-muted" />
        ) : banners.length > 0 ? (
          <div
            className="relative w-full aspect-[4/3] md:aspect-[16/7] overflow-hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {banners.map((b, i) => (
              <div key={b.id}
                className={`absolute inset-0 transition-all duration-700 ${i === bannerIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                <img src={b.image_url ?? ''} alt={b.title ?? undefined} className="w-full h-full object-cover object-center" />
              </div>
            ))}
            {/* Deep gradient overlay */}
            <div className="absolute inset-0"
                 style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
            {banners[bannerIndex]?.title && (
              <div className="absolute bottom-0 inset-x-0 px-4 pb-5">
                <p className="text-white text-base font-black leading-tight drop-shadow-lg text-balance">
                  {banners[bannerIndex].title}
                </p>
              </div>
            )}
            {/* Nav arrows */}
            {banners.length > 1 && (
              <>
                <button onClick={() => setBannerIndex(i => (i - 1 + banners.length) % banners.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-1.5 active:scale-90 transition-transform">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setBannerIndex(i => (i + 1) % banners.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-1.5 active:scale-90 transition-transform">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-4 right-4 flex gap-1.5">
                  {banners.map((_, i) => (
                    <button key={i} onClick={() => setBannerIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full aspect-[4/3] md:aspect-[16/7] overflow-hidden relative"
               style={{ background: 'var(--gradient-primary)' }}>
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
              <Package className="h-12 w-12 opacity-90" />
              <p className="text-lg font-black">Quality Products</p>
              <p className="text-xs opacity-70 font-medium">Shop the best deals today</p>
            </div>
          </div>
        )}

        {/* ── Feature tiles ────────────────────────────────── */}
        <div className="px-3 pt-4 grid grid-cols-4 gap-2.5">
          {features.map(({ icon: Icon, label, sub, grad }) => (
            <div key={label}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-gradient-to-br ${grad} shadow-sm active:scale-95 transition-transform`}>
              <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
              <span className="text-[10px] font-black text-white leading-none">{label}</span>
              <span className="text-[9px] text-white/80 font-medium">{sub}</span>
            </div>
          ))}
        </div>

        {/* ── Categories ───────────────────────────────────── */}
        {(loading || categories.length > 0) && (
          <div className="pt-5">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-base font-black tracking-tight bg-clip-text text-transparent"
                  style={{ backgroundImage: 'var(--gradient-primary)' }}>
                Shop by Category
              </h2>
              <button onClick={() => navigate(MOBILE_ROUTES.products)}
                className="text-xs text-primary font-bold flex items-center gap-0.5">
                See all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              <div className="flex gap-3 px-4 overflow-x-auto pb-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                    <Skeleton className="h-16 w-16 rounded-2xl bg-muted" />
                    <Skeleton className="h-2.5 w-12 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
                {categories.map((cat, i) => (
                  <button key={cat.id}
                    onClick={() => navigate(`${MOBILE_ROUTES.products}?category=${encodeURIComponent(cat.name)}`)}
                    className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition-transform">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${catGrads[i % catGrads.length]} flex items-center justify-center overflow-hidden shadow-md`}>
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                      ) : (
                        <Tag className="h-7 w-7 text-white" strokeWidth={2} />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-center w-16 truncate leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Featured Products — image-dominant cards ─────── */}
        <div className="pt-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                Hot Products
              </span>
            </h2>
            <button onClick={() => navigate(MOBILE_ROUTES.products)}
              className="text-xs text-primary font-bold flex items-center gap-0.5">
              See all <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 px-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-[3/4] bg-muted" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground px-4">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">No products yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-4">
              {products.map((p) => (
                <div key={p.id}
                  className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-150 shadow-md hover:shadow-xl"
                  style={{ aspectRatio: '3/4' }}
                  onClick={() => p.slug && navigate(MOBILE_ROUTES.productDetail(p.slug))}>

                  {/* Full-bleed image */}
                  {getThumb(p) ? (
                    <img src={getThumb(p)} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Gradient info overlay at bottom */}
                  <div className="absolute inset-0"
                       style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 45%, transparent 75%)' }} />

                  {/* Out of stock overlay */}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Out of Stock</span>
                    </div>
                  )}

                  {/* Gift badge */}
                  {p.is_gift_card && (
                    <Badge className="absolute top-2 left-2 text-[9px] px-1.5 h-4 bg-primary gap-0.5 shadow-sm">
                      <Gift className="h-2.5 w-2.5" />Gift
                    </Badge>
                  )}

                  {/* Low stock badge */}
                  {p.stock > 0 && p.stock <= 5 && (
                    <Badge className="absolute top-2 right-2 text-[9px] px-1.5 h-4 bg-amber-500 text-white border-0 shadow-sm">
                      Only {p.stock}
                    </Badge>
                  )}

                  {/* Bottom info */}
                  <div className="absolute bottom-0 inset-x-0 p-2.5">
                    <p className="text-white text-[11px] font-bold leading-tight truncate mb-1.5" title={p.name}>{p.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-black">৳{p.price.toLocaleString()}</span>
                      <button
                        disabled={p.stock === 0}
                        onClick={(e) => addToCart(p, e)}
                        className="h-7 w-7 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 shadow-md"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── New Arrivals horizontal scroll ──────────────── */}
        {!loading && products.length > 4 && (
          <div className="pt-5">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>New Arrivals</span>
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
              {products.slice(0, 7).map(p => (
                <div key={`new-${p.id}`}
                  className="shrink-0 w-28 cursor-pointer active:scale-95 transition-transform"
                  onClick={() => p.slug && navigate(MOBILE_ROUTES.productDetail(p.slug))}>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-1.5 shadow-sm">
                    {getThumb(p) ? (
                      <img src={getThumb(p)} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 absolute inset-0 m-auto text-muted-foreground/30" />
                    )}
                    {/* New badge */}
                    <span className="absolute top-1 left-1 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--gradient-primary)' }}>NEW</span>
                  </div>
                  <p className="text-[11px] font-bold truncate">{p.name}</p>
                  <p className="text-[11px] font-black text-primary">৳{p.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Guest CTA banner ─────────────────────────────── */}
        {!user && (
          <div className="mx-3 mt-5 rounded-2xl p-5 text-white relative overflow-hidden"
               style={{ background: 'var(--gradient-primary)' }}>
            <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-10 -left-5 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
            <p className="text-base font-black relative">Join Shottopoth Today!</p>
            <p className="text-xs text-white/80 mt-1 relative font-medium">Unlock exclusive deals & track all your orders</p>
            <button
              className="mt-3.5 px-4 h-9 rounded-xl bg-white text-sm font-black relative active:scale-95 transition-transform"
              style={{ color: 'hsl(var(--primary))' }}
              onClick={() => navigate(MOBILE_ROUTES.login)}
            >
              Sign In / Register
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
