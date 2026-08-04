import { useState, useEffect } from 'react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { updateAppSettings } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Facebook, Twitter, Instagram, Youtube, MessageCircle, Video, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { adminPath } from '@/config/admin';

export default function AdminSocial() {
  const navigate = useNavigate();
  const { appSettings, refreshSettings } = useAppSettings();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    social_facebook: appSettings?.social_facebook || '',
    social_twitter: appSettings?.social_twitter || '',
    social_instagram: appSettings?.social_instagram || '',
    social_youtube: appSettings?.social_youtube || '',
    social_whatsapp: appSettings?.social_whatsapp || '',
    social_tiktok: appSettings?.social_tiktok || '',
  });

  // Sync state when appSettings loads
  useEffect(() => {
    if (appSettings) {
      setFormData({
        social_facebook: appSettings.social_facebook || '',
        social_twitter: appSettings.social_twitter || '',
        social_instagram: appSettings.social_instagram || '',
        social_youtube: appSettings.social_youtube || '',
        social_whatsapp: appSettings.social_whatsapp || '',
        social_tiktok: appSettings.social_tiktok || '',
      });
    }
  }, [appSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    if (!appSettings) return;
    
    setSaving(true);
    try {
      await updateAppSettings(appSettings.id, {
        social_facebook: formData.social_facebook.trim() || null,
        social_twitter: formData.social_twitter.trim() || null,
        social_instagram: formData.social_instagram.trim() || null,
        social_youtube: formData.social_youtube.trim() || null,
        social_whatsapp: formData.social_whatsapp.trim() || null,
        social_tiktok: formData.social_tiktok.trim() || null,
      });
      
      await refreshSettings();
      toast.success('Social media links updated successfully');
    } catch (error) {
      console.error('Failed to save social settings:', error);
      toast.error('Failed to save social settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(adminPath('settings'))} className="lg:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Social Media Settings</h2>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Enter the full URL for your social media profiles. Leave blank to hide.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="social_facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" /> Facebook URL
            </Label>
            <Input 
              id="social_facebook"
              name="social_facebook"
              placeholder="https://facebook.com/yourpage"
              value={formData.social_facebook}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="social_twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" /> Twitter (X) URL
            </Label>
            <Input 
              id="social_twitter"
              name="social_twitter"
              placeholder="https://twitter.com/yourhandle"
              value={formData.social_twitter}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="social_instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" /> Instagram URL
            </Label>
            <Input 
              id="social_instagram"
              name="social_instagram"
              placeholder="https://instagram.com/yourprofile"
              value={formData.social_instagram}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="social_youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" /> YouTube URL
            </Label>
            <Input 
              id="social_youtube"
              name="social_youtube"
              placeholder="https://youtube.com/c/yourchannel"
              value={formData.social_youtube}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="social_whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> WhatsApp Link
            </Label>
            <Input 
              id="social_whatsapp"
              name="social_whatsapp"
              placeholder="https://wa.me/1234567890"
              value={formData.social_whatsapp}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="social_tiktok" className="flex items-center gap-2">
              <Video className="h-4 w-4" /> TikTok URL
            </Label>
            <Input 
              id="social_tiktok"
              name="social_tiktok"
              placeholder="https://tiktok.com/@yourprofile"
              value={formData.social_tiktok}
              onChange={handleChange}
            />
          </div>
          
          <div className="pt-4">
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Saving...' : 'Save Social Links'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}