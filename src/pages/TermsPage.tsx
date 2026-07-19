import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { getActiveTerms } from '@/db/api';
import type { TermsAndConditions } from '@/types';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';

export default function TermsPage() {
  const [terms, setTerms] = useState<TermsAndConditions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await getActiveTerms();
        setTerms(data);
      } catch (error) {
        console.error('이용약관 불러오기 실패:', error);
        toast.error('이용약관을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  return (
    <MainLayout>
      <PageMeta
        title={terms?.title || '이용약관'}
        description="Shottopoth 이용약관 및 서비스 조건을 확인하세요."
      />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-full">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-7 w-48 bg-muted" />
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-balance">
                {terms?.title || '이용약관'}
              </h1>
            )}
          </div>
        </div>

        {/* 본문 */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className={`h-4 bg-muted ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
            ))}
          </div>
        ) : terms ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <div
                className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-foreground"
                dangerouslySetInnerHTML={{ __html: terms.content }}
              />
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
            <FileText className="h-12 w-12 opacity-40" />
            <p className="text-base font-medium">현재 이용약관이 없습니다.</p>
            <p className="text-sm">더 자세한 내용은 고객 지원에 문의해 주세요.</p>
          </div>
        )}

        {terms?.updated_at && (
          <p className="text-xs text-muted-foreground mt-8 text-right">
            최종 업데이트: {new Date(terms.updated_at).toLocaleDateString('ko-KR')}
          </p>
        )}
      </div>
    </MainLayout>
  );
}
