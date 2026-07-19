import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout, MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { getProducts, getCategories } from '@/db/api';
import type { Product, Category } from '@/types';
import {
  ShoppingCart, Package, Search, Gift, Grid2X2, List,
  X, SlidersHorizontal, ChevronDown, Zap, Tag, Flame,
  Sparkles, TrendingUp, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeviceType, getDeviceImages, getDeviceThumbnail } from '@/hooks/useDeviceType';
import PageMeta from '@/components/common/PageMeta';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'popular'>('default');
  const [showSort, setShowSort] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { deviceType } = useDeviceType();
  const { user } = useAuth();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p); setFiltered(p); setCategories(c); })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCat(cat);
  }, [searchParams]);

  useEffect(() => {
    let result = products;
    if (activeCat !== 'all') result = result.filter(p => p.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'popular') result = [...result].sort((a, b) => b.stock - a.stock);
    setFiltered(result);
  }, [search, activeCat, products, sortBy]);

  const getThumb = (p: Product) => {
    const imgs = getDeviceImages(deviceType, p.pc_images, p.mobile_images);
    return getDeviceThumbnail(deviceType, p.pc_thumbnail, p.mobile_thumbnail, p.thumbnail)
      || (imgs?.[0] ?? '') || p.image_url || '';
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
      toast.success('Added to cart', { description: p.name, duration: 2000 });
    } catch { toast.error('Failed to add to cart'); }
  };

  const sortLabels = {
    default: 'Default',
    popular: '⭐ Most Popular',
    price_asc: '↑ Price: Low → High',
    price_desc: '↓ Price: High → Low',
  };

  // Flash sale — first 3 in-stock products
  const flashItems = products.filter(p => p.stock > 0).slice(0, 5);
  // Featured row — top-priced products
  const featuredItems = [...products].sort((a, b) => b.price - a.price).slice(0, 6);

  const isSearchActive = search.trim() || activeCat !== 'all';

  return (
    <MobileLayout>
      <PageMeta title="Shop" />

      {/* ── Sticky search + filter bar ──────────────────────── */}
      <div className="sticky top-14 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-3 py-3 space-y-2.5">
        <div className="relative flex items-center gap-2">
          {/* Search pill */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input ref={searchRef} placeholder="Search products…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-8 h-10 text-sm rounded-xl bg-muted/50 border-transparent focus:border-primary" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort pill */}
          <div className="relative shrink-0">
            <button onClick={() => setShowSort(s => !s)}
              className={`flex items-center gap-1 h-10 px-3 rounded-xl text-xs font-bold transition-all ${
                showSort || sortBy !== 'default'
                  ? 'text-white shadow-sm'
                  : 'bg-muted/60 text-muted-foreground border border-border'
              }`}
              style={showSort || sortBy !== 'default' ? { background: 'var(--gradient-primary)' } : {}}>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <ChevronDown className={`h-3 w-3 transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>
            {showSort && (
              <div className="absolute right-0 top-12 z-50 bg-background/98 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl overflow-hidden min-w-52">
                {(Object.keys(sortLabels) as Array<keyof typeof sortLabels>).map(key => (
                  <button key={key} onClick={() => { setSortBy(key); setShowSort(false); }}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold transition-colors ${
                      sortBy === key ? 'text-primary bg-primary/8' : 'hover:bg-muted/60'
                    }`}>
                    {sortLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex bg-muted/60 rounded-xl overflow-hidden border border-border/50 shrink-0">
            <button onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-all ${viewMode === 'grid' ? 'text-white' : 'text-muted-foreground'}`}
              style={viewMode === 'grid' ? { background: 'var(--gradient-primary)' } : {}}>
              <Grid2X2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2.5 transition-all ${viewMode === 'list' ? 'text-white' : 'text-muted-foreground'}`}
              style={viewMode === 'list' ? { background: 'var(--gradient-primary)' } : {}}>
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {[{ id: 'all', name: 'All', is_active: true } as Category & { id: string }, ...categories.filter(c => c.is_active)].map(c => {
            const isActive = activeCat === c.name || (c.id === 'all' && activeCat === 'all');
            return (
              <button key={c.id} onClick={() => setActiveCat(c.id === 'all' ? 'all' : c.name)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  isActive ? 'text-white shadow-sm' : 'bg-muted/60 text-muted-foreground border border-border/60'
                }`}
                style={isActive ? { background: 'var(--gradient-primary)' } : {}}>
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Flash Sale strip (only when not filtering) ─────────── */}
      {!isSearchActive && !loading && flashItems.length > 0 && (
        <div className="pt-4">
          <div className="mx-3 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-400" />
              <span className="text-sm font-black tracking-tight" style={{ backgroundImage: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Flash Deals
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">Limited time</span>
          </div>
          <div className="flex gap-3 overflow-x-auto px-3 pb-2" style={{ scrollbarWidth: 'none' }}>
            {flashItems.map(p => (
              <button key={`flash-${p.id}`}
                className="shrink-0 w-36 bg-card rounded-2xl overflow-hidden active:scale-95 transition-transform shadow-md border border-border/40 flex flex-col text-left"
                onClick={() => navigate(MOBILE_ROUTES.productDetail(p.slug ?? p.id))}>
                <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: '1/1' }}>
                  {getThumb(p) ? (
                    <img src={getThumb(p)} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Flash badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                    <Zap className="h-2.5 w-2.5 fill-black" />DEAL
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold leading-snug line-clamp-2 mb-1">{p.name}</p>
                  <p className="text-sm font-black text-primary">৳{p.price.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Promo banner (guest only, no filter) ───────────────── */}
      {!isSearchActive && !loading && !user && (
        <div className="mx-3 mt-3 rounded-2xl overflow-hidden relative"
             style={{ background: 'var(--gradient-primary)' }}>
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm leading-tight">Join Shottopoth</p>
              <p className="text-white/80 text-[11px] mt-0.5 font-medium leading-snug">Sign in to track orders &amp; unlock deals</p>
            </div>
            <button
              onClick={() => navigate(MOBILE_ROUTES.login)}
              className="shrink-0 bg-white text-xs font-black px-3 h-8 rounded-xl active:scale-95 transition-transform"
              style={{ color: 'hsl(var(--primary))' }}>
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* ── Featured collection row (no filter) ────────────────── */}
      {!isSearchActive && !loading && featuredItems.length > 0 && (
        <div className="pt-4">
          <div className="mx-3 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
              <span className="text-sm font-black">Top Picks</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-semibold">
              <TrendingUp className="h-3 w-3" /> Trending
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto px-3 pb-2" style={{ scrollbarWidth: 'none' }}>
            {featuredItems.map(p => (
              <button key={`feat-${p.id}`}
                className="shrink-0 w-28 text-left active:scale-95 transition-transform"
                onClick={() => navigate(MOBILE_ROUTES.productDetail(p.slug ?? p.id))}>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-1.5 shadow-sm">
                  {getThumb(p) ? (
                    <img src={getThumb(p)} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 absolute inset-0 m-auto text-muted-foreground/30" />
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">Sold Out</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-bold truncate leading-tight">{p.name}</p>
                <p className="text-[11px] font-black text-primary">৳{p.price.toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── All products section ────────────────────────────────── */}
      <div className="px-3 pt-4 pb-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500 fill-orange-400" />
            <span className="text-sm font-black">
              {isSearchActive ? 'Search Results' : 'All Products'}
            </span>
          </div>
          {!loading && (
            <span className="text-xs text-muted-foreground font-semibold">
              <span className="font-black text-foreground">{filtered.length}</span> item{filtered.length !== 1 ? 's' : ''}
              {activeCat !== 'all' ? ` · ${activeCat}` : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {[...Array(6)].map((_, i) =>
              viewMode === 'grid' ? (
                <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border/40">
                  <Skeleton className="aspect-square bg-muted" />
                  <div className="p-2.5 space-y-2">
                    <Skeleton className="h-3 w-3/4 bg-muted" />
                    <Skeleton className="h-3 w-1/2 bg-muted" />
                    <Skeleton className="h-5 w-1/3 bg-muted" />
                  </div>
                </div>
              ) : (
                <div key={i} className="rounded-2xl bg-muted/40 p-3 flex gap-3">
                  <Skeleton className="h-24 w-24 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-3.5 w-3/4 bg-muted" />
                    <Skeleton className="h-3 w-1/2 bg-muted" />
                    <Skeleton className="h-3 w-1/3 bg-muted" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground space-y-3">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-muted flex items-center justify-center">
              <Package className="h-10 w-10 opacity-30" />
            </div>
            <p className="font-black text-base text-foreground">Nothing found</p>
            <p className="text-xs text-muted-foreground">Try different keywords or categories</p>
            {isSearchActive && (
              <button onClick={() => { setSearch(''); setActiveCat('all'); }}
                className="px-5 h-10 rounded-xl text-white text-sm font-bold active:scale-95 transition-transform"
                style={{ background: 'var(--gradient-primary)' }}>
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid view — clean card: image + info panel ─────── */
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(p => (
              <div
                key={p.id}
                className="bg-card rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-all shadow-sm border border-border/40 flex flex-col"
                onClick={() => navigate(MOBILE_ROUTES.productDetail(p.slug ?? p.id))}
              >
                {/* Image */}
                <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: '1/1' }}>
                  {getThumb(p) ? (
                    <img src={getThumb(p)} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-full">Out of Stock</span>
                    </div>
                  )}
                  {p.is_gift_card && (
                    <Badge className="absolute top-2 left-2 text-[9px] px-1.5 h-4 bg-primary gap-0.5 border-0">
                      <Gift className="h-2.5 w-2.5" />Gift
                    </Badge>
                  )}
                  {p.stock > 0 && p.stock <= 5 && (
                    <Badge className="absolute top-2 right-2 text-[9px] px-1.5 h-4 bg-amber-500 text-white border-0">
                      {p.stock} left
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-2.5 gap-1.5">
                  <p className="text-xs font-semibold leading-snug line-clamp-2 text-foreground">{p.name}</p>
                  {p.category && (
                    <span className="text-[10px] text-primary font-medium">{p.category}</span>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-sm font-black text-primary">৳{p.price.toLocaleString()}</span>
                    <button
                      disabled={p.stock === 0}
                      onClick={e => addToCart(p, e)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 shrink-0"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── List view ───────────────────────────────────────── */
          <div className="space-y-2.5">
            {filtered.map(p => (
              <div key={p.id}
                className="flex gap-3 bg-card rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-all shadow-sm border border-border/40"
                onClick={() => navigate(MOBILE_ROUTES.productDetail(p.slug ?? p.id))}>
                <div className="relative w-28 shrink-0 bg-muted overflow-hidden rounded-l-2xl" style={{ aspectRatio: '1/1' }}>
                  {getThumb(p) ? (
                    <img src={getThumb(p)} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 absolute inset-0 m-auto text-muted-foreground/30" />
                  )}
                  {p.is_gift_card && (
                    <Badge className="absolute top-1 left-1 text-[9px] px-1 h-4 bg-primary border-0">
                      <Tag className="h-2.5 w-2.5" />Gift
                    </Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-bold leading-tight line-clamp-2 mb-1">{p.name}</p>
                    {p.category && (
                      <span className="inline-block text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full mb-1">{p.category}</span>
                    )}
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">{p.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-sm font-black text-primary">৳{p.price.toLocaleString()}</span>
                      {p.stock === 0 ? (
                        <span className="ml-2 text-[10px] text-destructive font-bold">Out of stock</span>
                      ) : p.stock <= 5 ? (
                        <span className="ml-2 text-[10px] text-amber-600 font-bold">Only {p.stock} left</span>
                      ) : null}
                    </div>
                    <button disabled={p.stock === 0} onClick={e => addToCart(p, e)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 shadow-sm shrink-0"
                      style={{ background: 'var(--gradient-primary)' }}>
                      <ShoppingCart className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="h-4" />
      </div>

      {showSort && <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />}
    </MobileLayout>
  );
}
