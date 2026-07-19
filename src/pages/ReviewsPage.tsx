import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Search, MessageSquare, Package } from 'lucide-react';
import { toast } from 'sonner';
import { getAllReviews } from '@/db/api';
import type { ReviewWithUser } from '@/types';
import { maskUsername } from '@/lib/utils';
import PageMeta from '@/components/common/PageMeta';

export default function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [filtered, setFiltered] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    getAllReviews()
      .then((data) => {
        setReviews(data);
        setFiltered(data);
      })
      .catch((err) => {
        console.error('리뷰 불러오기 실패:', err);
        toast.error('리뷰를 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, []);

  // 검색 + 별점 필터 적용
  useEffect(() => {
    let result = reviews;
    if (selectedRating !== null) {
      result = result.filter((r) => r.rating === selectedRating);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.comment?.toLowerCase().includes(q) ||
          r.product?.name?.toLowerCase().includes(q) ||
          r.user.username.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, selectedRating, reviews]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const ratingCount = (r: number) => reviews.filter((x) => x.rating === r).length;

  return (
    <MainLayout>
      <PageMeta title="고객 리뷰" description="Shottopoth 고객 리뷰를 확인하세요." />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-balance">고객 리뷰</h1>
          </div>
          {!loading && reviews.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(avgRating) ? 'fill-warning text-warning' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-lg">{avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">
                ({reviews.length}개 리뷰)
              </span>
            </div>
          )}
        </div>

        {/* 필터 영역 */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="상품명, 리뷰 내용으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedRating === null ? 'default' : 'outline'}
              onClick={() => setSelectedRating(null)}
            >
              전체 ({reviews.length})
            </Button>
            {[5, 4, 3, 2, 1].map((r) => (
              <Button
                key={r}
                size="sm"
                variant={selectedRating === r ? 'default' : 'outline'}
                onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                disabled={ratingCount(r) === 0}
              >
                <Star className="h-3 w-3 mr-1 fill-current" />
                {r} ({ratingCount(r)})
              </Button>
            ))}
          </div>
        </div>

        {/* 리뷰 목록 */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-4 w-16 bg-muted" />
                  </div>
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-2/3 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4 text-muted-foreground">
            <MessageSquare className="h-12 w-12 opacity-40" />
            <p className="font-medium">해당 조건의 리뷰가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filtered.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-4 md:pt-5 px-4 md:px-5 pb-4">
                  {/* 상품명 */}
                  {review.product && (
                    <button
                      onClick={() => navigate(`/products/${review.product!.slug}`)}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline mb-2"
                    >
                      <Package className="h-3 w-3 shrink-0" />
                      <span className="truncate">{review.product.name}</span>
                    </button>
                  )}

                  {/* 작성자 + 별점 + 날짜 */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {review.is_anonymous
                          ? maskUsername(review.user.username)
                          : review.user.username}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? 'fill-warning text-warning'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>

                  {/* 리뷰 내용 */}
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 text-pretty">
                      {review.comment}
                    </p>
                  )}

                  {/* 첨부 이미지 */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`리뷰 이미지 ${idx + 1}`}
                          className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  )}

                  {/* 도움됨 */}
                  <div className="flex items-center gap-3 mt-2">
                    {review.helpful_count >= 5 && (
                      <Badge variant="secondary" className="text-xs">
                        가장 도움됨
                      </Badge>
                    )}
                    {(review.helpful_count + review.not_helpful_count) > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(
                          (review.helpful_count /
                            (review.helpful_count + review.not_helpful_count)) *
                            100
                        )}
                        % 도움됨
                      </span>
                    )}
                  </div>

                  {/* 관리자 응답 */}
                  {review.responses && review.responses.filter((r) => r.is_admin).length > 0 && (
                    <div className="mt-3 border-t pt-3 space-y-2">
                      {review.responses
                        .filter((r) => r.is_admin)
                        .map((resp) => (
                          <div key={resp.id} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold">관리자</span>
                              <Badge variant="default" className="text-xs px-1.5 py-0 h-4">
                                Admin
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(resp.created_at).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <p className="text-xs text-foreground">{resp.content}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
