import { MainLayout } from '@/components/layouts/MainLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import PageMeta from '@/components/common/PageMeta';

export default function PrivacyPage() {
  const { appSettings } = useAppSettings();

  return (
    <MainLayout>
      <PageMeta
        title="Privacy Policy"
        description="View our privacy policy to understand how we collect and use your data."
      />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-full">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-balance">
              Privacy Policy
            </h1>
          </div>
        </div>

        {/* Content */}
        {appSettings?.privacy_policy ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <div
                className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-foreground"
                dangerouslySetInnerHTML={{ __html: appSettings.privacy_policy }}
              />
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
            <Shield className="h-12 w-12 opacity-40" />
            <p className="text-base font-medium">No privacy policy available.</p>
            <p className="text-sm">Please contact customer support for more details.</p>
          </div>
        )}

        {appSettings?.updated_at && (
          <p className="text-xs text-muted-foreground mt-8 text-right">
            Last updated: {new Date(appSettings.updated_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </MainLayout>
  );
}