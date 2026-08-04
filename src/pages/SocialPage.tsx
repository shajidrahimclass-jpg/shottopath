import { MainLayout } from '@/components/layouts/MainLayout';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Twitter, Instagram, Youtube, MessageCircle, Video } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

export default function SocialPage() {
  const { appSettings } = useAppSettings();

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: appSettings?.social_facebook, color: 'text-blue-600' },
    { name: 'Twitter', icon: Twitter, url: appSettings?.social_twitter, color: 'text-sky-500' },
    { name: 'Instagram', icon: Instagram, url: appSettings?.social_instagram, color: 'text-pink-600' },
    { name: 'YouTube', icon: Youtube, url: appSettings?.social_youtube, color: 'text-red-600' },
    { name: 'WhatsApp', icon: MessageCircle, url: appSettings?.social_whatsapp, color: 'text-green-500' },
    { name: 'TikTok', icon: Video, url: appSettings?.social_tiktok, color: 'text-black dark:text-white' },
  ].filter(link => link.url);

  return (
    <MainLayout>
      <PageMeta
        title="Social Media Links"
        description="Connect with us on our social media platforms."
      />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Connect With Us</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Stay updated with our latest news, products, and exclusive offers by following us on social media.
          </p>
        </div>

        {socialLinks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                    <CardContent className="flex flex-col items-center justify-center p-8 gap-4 text-center h-full">
                      <div className={`p-4 rounded-full bg-muted group-hover:scale-110 transition-transform duration-300 ${link.color}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-lg">{link.name}</h3>
                      <p className="text-sm text-muted-foreground">Follow us on {link.name}</p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No social media links configured yet.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}