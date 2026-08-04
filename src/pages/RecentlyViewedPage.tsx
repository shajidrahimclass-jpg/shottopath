import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentlyViewed, clearRecentlyViewed } from '@/db/api';
import type { RecentlyViewed } from '@/types';
import { Clock, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';

export default function RecentlyViewedPage() {
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

  const getProductImage = (item: RecentlyViewed): string => {
    const p = item.product;
    if (!p) return '';
    return p.thumbnail || p.image_url || '';
  };

  return (
    <MainLayout>
      <PageMeta title="Recently Viewed" description="Products you have recently viewed on Shotopath" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Recently Viewed
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                History is kept for 14 days
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg bg-muted" />
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
            <h2 className="text-xl font-semibold">No recently viewed products</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Products you view will appear here for 14 days.
            </p>
            <Button onClick={() => navigate('/products')}>Browse Products</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 group overflow-hidden"
                  onClick={() => navigate(`/products/${product.slug || product.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {getProductImage(item) ? (
                        <img
                          src={getProductImage(item)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-base font-bold text-primary">
                        ৳{product.price.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Viewed {new Date(item.viewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
