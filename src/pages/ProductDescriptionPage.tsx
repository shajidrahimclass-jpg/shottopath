import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Package } from 'lucide-react';
import { getProductBySlug } from '@/db/api';
import type { Product } from '@/types';
import PageMeta from '@/components/common/PageMeta';

export default function ProductDescriptionPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug)
      .then(data => {
        if (!data) navigate('/products', { replace: true });
        else setProduct(data);
      })
      .catch(() => navigate('/products', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  return (
    <MainLayout>
      {product && (
        <PageMeta
          title={`${product.name} — 商品描述`}
          description={product.description?.slice(0, 160) ?? ''}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 -ml-2 gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/products/${slug}`)}
        >
          <ChevronLeft className="h-4 w-4" />
          返回商品详情
        </Button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3 bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-5/6 bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-4/5 bg-muted" />
          </div>
        ) : product ? (
          <article className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-1">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-balance leading-snug">
                  {product.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">商品描述</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Description body */}
            {product.description ? (
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            ) : (
              <p className="text-muted-foreground italic">该商品暂无详细描述。</p>
            )}

            {/* Bottom CTA */}
            <div className="pt-4 border-t border-border">
              <Button
                className="w-full md:w-auto"
                onClick={() => navigate(`/products/${slug}`)}
              >
                查看商品 / 加入购物车
              </Button>
            </div>
          </article>
        ) : null}
      </div>
    </MainLayout>
  );
}
