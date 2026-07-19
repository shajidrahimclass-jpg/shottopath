import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layouts/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentlyViewed, clearRecentlyViewed } from '@/db/api';
import type { RecentlyViewed } from '@/types';
import { Clock, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';

export default function MobileRecentlyViewedPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecentlyViewed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getRecentlyViewed();
      setItems(data);
    } catch {
      toast.error('Failed to load recently viewed products');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearRecentlyViewed();
      setItems([]);
      toast.success('Viewing history cleared');
    } catch {
      toast.error('Failed to clear history');
    }
  };

  return (
    <MobileLayout>
      <PageMeta title="Recently Viewed" />
      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recently Viewed
            </h1>
            <p className="text-xs text-muted-foreground">History kept for 14 days</p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear} className="gap-1 text-xs h-8">
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg bg-muted" />
                <Skeleton className="h-3 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <ShoppingBag className="h-14 w-14 mx-auto text-muted-foreground opacity-30" />
            <p className="text-base font-semibold">No recently viewed products</p>
            <p className="text-sm text-muted-foreground">Products you view will appear here for 14 days.</p>
            <Button onClick={() => navigate('/mobile/products')}>Browse Products</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              const img = product.thumbnail || product.image_url || '';
              return (
                <Card
                  key={item.id}
                  className="cursor-pointer active:scale-95 transition-transform overflow-hidden"
                  onClick={() => navigate(`/mobile/products/${product.slug || product.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {img ? (
                        <img src={img} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <Badge className="absolute top-1.5 right-1.5 bg-orange-500 text-white text-[10px] px-1.5 py-0.5">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <div className="p-2.5 space-y-0.5">
                      <h3 className="font-medium text-xs line-clamp-2 min-h-[2.5rem] leading-snug">{product.name}</h3>
                      <p className="text-sm font-bold text-primary">৳{product.price.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(item.viewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        <div className="h-4" />
      </div>
    </MobileLayout>
  );
}
