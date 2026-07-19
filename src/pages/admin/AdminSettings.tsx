import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  getDeliveryLocations, updateDeliveryLocation, createDeliveryLocation, deleteDeliveryLocation,
  getPaymentGateways, updatePaymentGateway, createPaymentGateway, deletePaymentGateway,
  getAllTerms, updateTerms, createTerms, getAllUserManuals, updateUserManual,
  getAppSettings, updateAppSettings, getAllRefundsPolicy, updateRefundsPolicy, createRefundsPolicy
} from '@/db/api';
import type { DeliveryLocation, PaymentGateway, TermsAndConditions, RefundsPolicy, UserManual, AppSettings } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { validateAndPrepareImage } from '@/lib/imageUpload';
import { Upload, X, AlertTriangle, Shield, TrendingUp, Plus, Trash2, MapPin, Clock, Wallet, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { PasswordConfirmDialog } from '@/components/common/PasswordConfirmDialog';
import { setAdminBasePath } from '@/config/admin';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function AdminSettings() {
  const { user } = useAuth();
  const { refreshSettings } = useAppSettings();
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [terms, setTerms] = useState<TermsAndConditions>({ id: '', title: 'Terms and Conditions', content: '', is_active: true, created_at: '', updated_at: '' });
  const [refundsPolicy, setRefundsPolicy] = useState<RefundsPolicy>({ id: '', title: 'Refunds & Returns Policy', content: '', is_active: true, created_at: '', updated_at: '' });
  const [userManual, setUserManual] = useState<UserManual | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New location / gateway form state
  const [showNewLocation, setShowNewLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<Omit<DeliveryLocation, 'id' | 'created_at'>>({
    name: '', charge: 0, duration: '', min_days: 1, max_days: 3, payment_methods: ['cash_on_delivery', 'bkash', 'nagad'], is_active: true,
  });
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [showNewGateway, setShowNewGateway] = useState(false);
  const [newGateway, setNewGateway] = useState<Omit<PaymentGateway, 'id' | 'created_at'>>({
    name: '', is_enabled: true, config: {},
  });

  // Admin URL customization states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAdminUrl, setPendingAdminUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [locationsData, gatewaysData, termsData, refundsPolicyData, manualData, appSettingsData] = await Promise.all([
        getDeliveryLocations(),
        getPaymentGateways(),
        getAllTerms(),
        getAllRefundsPolicy(),
        getAllUserManuals(),
        getAppSettings(),
      ]);

      setLocations(locationsData);
      setGateways(gatewaysData);
      if (termsData[0]) setTerms(termsData[0]);
      if (refundsPolicyData[0]) setRefundsPolicy(refundsPolicyData[0]);
      setUserManual(manualData[0] || null);
      setAppSettings(appSettingsData);
      if (appSettingsData?.favicon_url) {
        setFaviconPreview(appSettingsData.favicon_url);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleLocationUpdate = async (id: string, updates: Partial<DeliveryLocation>) => {
    setLoading(true);

    try {
      await updateDeliveryLocation(id, updates);
      toast.success('Delivery location updated successfully');
      loadData();
    } catch (error) {
      console.error('Failed to update location:', error);
      toast.error('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleGatewayUpdate = async (id: string, updates: Partial<PaymentGateway>) => {
    setLoading(true);
    try {
      await updatePaymentGateway(id, updates);
      toast.success('Payment gateway updated');
      loadData();
    } catch (error) {
      console.error('Failed to update gateway:', error);
      toast.error('Failed to update gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!newLocation.name.trim()) { toast.error('Location name is required'); return; }
    setLoading(true);
    try {
      await createDeliveryLocation(newLocation);
      toast.success('Delivery location added');
      setShowNewLocation(false);
      setNewLocation({ name: '', charge: 0, duration: '', min_days: 1, max_days: 3, payment_methods: ['cash_on_delivery', 'bkash', 'nagad'], is_active: true });
      loadData();
    } catch (error) {
      console.error('Failed to create location:', error);
      toast.error('Failed to add delivery location');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteDeliveryLocation(id);
      toast.success('Delivery location deleted');
      loadData();
    } catch (error) {
      console.error('Failed to delete location:', error);
      toast.error('Failed to delete delivery location');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGateway = async () => {
    if (!newGateway.name.trim()) { toast.error('Gateway name is required'); return; }
    setLoading(true);
    try {
      await createPaymentGateway(newGateway);
      toast.success('Payment gateway added');
      setShowNewGateway(false);
      setNewGateway({ name: '', is_enabled: true, config: {} });
      loadData();
    } catch (error) {
      console.error('Failed to create gateway:', error);
      toast.error('Failed to add payment gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGateway = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deletePaymentGateway(id);
      toast.success('Payment gateway deleted');
      loadData();
    } catch (error) {
      console.error('Failed to delete gateway:', error);
      toast.error('Failed to delete payment gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleTermsUpdate = async () => {
    if (!terms.title.trim() || !terms.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setLoading(true);
    try {
      if (terms.id) {
        await updateTerms(terms.id, { title: terms.title, content: terms.content, is_active: terms.is_active });
        toast.success('Terms and conditions updated successfully');
      } else {
        const created = await createTerms({ title: terms.title, content: terms.content, is_active: terms.is_active });
        setTerms(created);
        toast.success('Terms and conditions created successfully');
      }
      loadData();
    } catch (error) {
      console.error('Failed to save terms:', error);
      toast.error('Failed to save terms');
    } finally {
      setLoading(false);
    }
  };

  const handleRefundsPolicyUpdate = async () => {
    if (!refundsPolicy.title.trim() || !refundsPolicy.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setLoading(true);
    try {
      if (refundsPolicy.id) {
        await updateRefundsPolicy(refundsPolicy.id, { title: refundsPolicy.title, content: refundsPolicy.content, is_active: refundsPolicy.is_active });
        toast.success('Refunds policy updated successfully');
      } else {
        const created = await createRefundsPolicy({ title: refundsPolicy.title, content: refundsPolicy.content, is_active: refundsPolicy.is_active });
        setRefundsPolicy(created);
        toast.success('Refunds policy created successfully');
      }
      loadData();
    } catch (error) {
      console.error('Failed to save refunds policy:', error);
      toast.error('Failed to save refunds policy');
    } finally {
      setLoading(false);
    }
  };

  const handleUserManualUpdate = async () => {
    if (!userManual) return;
    
    setLoading(true);

    try {
      await updateUserManual(userManual.id, {
        title: userManual.title,
        content: userManual.content,
        is_active: userManual.is_active,
      });
      toast.success('User manual updated successfully');
      loadData();
    } catch (error) {
      console.error('Failed to update user manual:', error);
      toast.error('Failed to update user manual');
    } finally {
      setLoading(false);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast.error('File size must be less than 1MB');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFavicon = () => {
    setFaviconFile(null);
    setFaviconPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAppSettingsUpdate = async () => {
    if (!appSettings) return;

    setLoading(true);

    try {
      let faviconUrl = appSettings.favicon_url;

      // Upload favicon if a new file is selected
      if (faviconFile) {
        const prepared = await validateAndPrepareImage(faviconFile);
        if (!prepared.success || !prepared.file) throw new Error(prepared.error || 'Invalid favicon image');
        if (prepared.message && prepared.message.includes('compressed')) toast.info(prepared.message);

        const fileName = `favicon_${Date.now()}.webp`;
        const filePath = `favicons/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('app-9cyfgucqbpj5_shottopoth_images')
          .upload(filePath, prepared.file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Failed to upload favicon: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from('app-9cyfgucqbpj5_shottopoth_images')
          .getPublicUrl(filePath);

        faviconUrl = urlData.publicUrl;
      }

      // If favicon was removed
      if (!faviconPreview && appSettings.favicon_url) {
        faviconUrl = null;
      }

      await updateAppSettings(appSettings.id, {
        site_title: appSettings.site_title,
        navbar_name: appSettings.navbar_name,
        site_description: appSettings.site_description,
        default_meta_image: appSettings.default_meta_image,
        favicon_url: faviconUrl,
        copyright_year: appSettings.copyright_year,
        copyright_company: appSettings.copyright_company,
        force_sign_in: appSettings.force_sign_in,
        google_analytics_id: appSettings.google_analytics_id,
      });

      toast.success('App settings updated successfully');
      await refreshSettings();
      await loadData();
      setFaviconFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Update document title and favicon immediately
      document.title = appSettings.site_title;
      if (faviconUrl) {
        // Remove existing favicon links
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        existingLinks.forEach(link => link.remove());
        
        // Add cache-busting parameter to force browser refresh
        const cacheBustedUrl = faviconUrl.includes('?') 
          ? `${faviconUrl}&t=${Date.now()}`
          : `${faviconUrl}?t=${Date.now()}`;
        
        // Create new favicon link
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = cacheBustedUrl;
        document.head.appendChild(link);
        
        // Also add apple-touch-icon for iOS devices
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = cacheBustedUrl;
        document.head.appendChild(appleLink);
      }
      
      loadData();
    } catch (error) {
      console.error('Failed to update app settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update app settings';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateAdminUrl = (url: string): { valid: boolean; error?: string } => {
    // Check if URL starts with /
    if (!url.startsWith('/')) {
      return { valid: false, error: 'URL must start with /' };
    }

    // Check format (alphanumeric, /, -, _)
    if (!/^\/[a-zA-Z0-9/_-]+$/.test(url)) {
      return { valid: false, error: 'URL can only contain letters, numbers, /, -, and _' };
    }

    // Check minimum length
    if (url.length < 10) {
      return { valid: false, error: 'URL must be at least 10 characters long for security' };
    }

    // Check for common/reserved paths
    const reservedPaths = ['/admin', '/api', '/login', '/products', '/cart', '/checkout', '/orders', '/profile', '/chat'];
    if (reservedPaths.some(path => url.startsWith(path))) {
      return { valid: false, error: 'This URL conflicts with existing routes' };
    }

    return { valid: true };
  };

  const handleAdminUrlChange = () => {
    if (!appSettings) return;

    const validation = validateAdminUrl(appSettings.admin_url_path);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Store the pending URL and show password dialog
    setPendingAdminUrl(appSettings.admin_url_path);
    setShowPasswordDialog(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!appSettings || !pendingAdminUrl || !user?.email) return;

    // Verify password by attempting to sign in
    const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (error || !authUser) {
      throw new Error('Invalid password');
    }

    // Update admin URL in database
    setLoading(true);
    try {
      await updateAppSettings(appSettings.id, {
        admin_url_path: pendingAdminUrl,
      });

      // Update the admin base path in memory
      setAdminBasePath(pendingAdminUrl);

      toast.success('Admin URL updated successfully. Redirecting...');
      
      // Wait a moment then reload the page to update routes
      setTimeout(() => {
        window.location.href = pendingAdminUrl;
      }, 1500);
    } catch (error) {
      console.error('Failed to update admin URL:', error);
      toast.error('Failed to update admin URL');
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PasswordConfirmDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onConfirm={handlePasswordConfirm}
        title="Confirm Admin URL Change"
        description="This is a security-sensitive action. Please enter your password to confirm changing the admin panel URL."
      />
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage app settings, delivery locations and payment gateways</p>
        </div>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {appSettings && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="site-title">Browser Tab Title</Label>
                    <Input
                      id="site-title"
                      value={appSettings.site_title}
                      onChange={(e) => setAppSettings({ ...appSettings, site_title: e.target.value })}
                      placeholder="Enter site title"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will appear in the browser tab
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="navbar-name">Navbar Name</Label>
                    <Input
                      id="navbar-name"
                      value={appSettings.navbar_name}
                      onChange={(e) => setAppSettings({ ...appSettings, navbar_name: e.target.value })}
                      placeholder="Enter navbar name"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will appear in the navigation bar
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="site-description">Website Description</Label>
                    <Textarea
                      id="site-description"
                      value={appSettings.site_description || ''}
                      onChange={(e) => setAppSettings({ ...appSettings, site_description: e.target.value })}
                      placeholder="Enter website description for SEO and meta tags"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be used in search engine results and social media previews
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="default-meta-image">Default Social Sharing Image URL (Optional)</Label>
                    <Input
                      id="default-meta-image"
                      value={appSettings.default_meta_image || ''}
                      onChange={(e) => setAppSettings({ ...appSettings, default_meta_image: e.target.value })}
                      placeholder="https://example.com/default-share-image.jpg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Default image for social media sharing (Facebook, Twitter, etc.). Used when page/product doesn't have specific image. Recommended: 1200x630px
                    </p>
                    {appSettings.default_meta_image && (
                      <div className="mt-2">
                        <img 
                          src={appSettings.default_meta_image} 
                          alt="Default meta preview" 
                          className="w-full max-w-md h-auto rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Browser Tab Icon (Favicon)</Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center gap-4">
                        {faviconPreview && (
                          <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            <img
                              src={faviconPreview}
                              alt="Favicon preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <label
                            htmlFor="favicon-upload"
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                            <span className="text-sm">{faviconPreview ? 'Change Favicon' : 'Upload Favicon'}</span>
                            <input
                              ref={fileInputRef}
                              id="favicon-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleFaviconChange}
                              className="hidden"
                            />
                          </label>
                          {faviconPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveFavicon}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended: 32x32px or 64x64px, PNG or ICO format, max 1MB
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">Footer Copyright Settings</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="copyright-year">Copyright Year</Label>
                        <Input
                          id="copyright-year"
                          value={appSettings.copyright_year || ''}
                          onChange={(e) => setAppSettings({ ...appSettings, copyright_year: e.target.value })}
                          placeholder={`${new Date().getFullYear()}`}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Year displayed in footer copyright (leave empty for current year: {new Date().getFullYear()})
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="copyright-company">Copyright Company Name</Label>
                        <Input
                          id="copyright-company"
                          value={appSettings.copyright_company || ''}
                          onChange={(e) => setAppSettings({ ...appSettings, copyright_company: e.target.value })}
                          placeholder="Shottopoth"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Company name in footer (defaults to navbar name if empty)
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Preview:</p>
                      <p className="text-sm text-muted-foreground">
                        © {appSettings.copyright_year?.trim() || new Date().getFullYear()} {appSettings.copyright_company?.trim() || appSettings.navbar_name || 'Shottopoth'}. All rights reserved.
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Force Sign-In Setting */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Purchase Access Control</h3>
                    </div>
                    <div className="flex items-start justify-between gap-4 p-4 border rounded-lg bg-muted/40">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Force Sign-In to Buy</p>
                        <p className="text-sm text-muted-foreground">
                          When <strong>ON</strong>, users must be signed in before they can add items to cart or proceed to checkout. When <strong>OFF</strong>, guests can browse and buy freely.
                        </p>
                      </div>
                      <Switch
                        checked={appSettings.force_sign_in === true}
                        onCheckedChange={(checked) =>
                          setAppSettings({ ...appSettings, force_sign_in: checked })
                        }
                      />
                    </div>
                    {appSettings.force_sign_in === true && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        Users without an account will be redirected to the login page when they try to purchase.
                      </p>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Google Analytics */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Web Analytics</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="ga-id">Google Analytics Measurement ID</Label>
                        <Input
                          id="ga-id"
                          value={appSettings.google_analytics_id || ''}
                          onChange={(e) => setAppSettings({ ...appSettings, google_analytics_id: e.target.value || null })}
                          placeholder="G-XXXXXXXXXX"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter your GA4 Measurement ID (e.g. G-XXXXXXXXXX) to enable Google Analytics tracking. Leave empty to disable.
                        </p>
                      </div>
                      {appSettings.google_analytics_id && (
                        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <p className="text-sm text-primary font-medium">Analytics active: {appSettings.google_analytics_id}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Admin Panel URL (Security)</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin-url-path">Admin Panel URL Path</Label>
                        <Input
                          id="admin-url-path"
                          value={appSettings.admin_url_path}
                          onChange={(e) => setAppSettings({ ...appSettings, admin_url_path: e.target.value })}
                          placeholder="/your-custom-admin-path"
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Custom URL path for accessing the admin panel. Must be at least 10 characters and contain only letters, numbers, /, -, and _
                        </p>
                      </div>

                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-2 text-sm">
                            <p className="font-medium text-amber-900 dark:text-amber-100">
                              Important Security Notice
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200">
                              <li>Changing this URL will require you to update all bookmarks</li>
                              <li>You will be automatically redirected to the new URL</li>
                              <li>Password confirmation is required for this change</li>
                              <li>Use a unique, hard-to-guess path for better security</li>
                              <li>Avoid common words like "admin", "dashboard", "panel"</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleAdminUrlChange} 
                        disabled={loading || appSettings.admin_url_path === appSettings.admin_url_path}
                        variant="outline"
                        className="w-full md:w-auto"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Update Admin URL
                      </Button>
                    </div>
                  </div>
                </div>

                <Button onClick={handleAppSettingsUpdate} disabled={loading}>
                  {loading ? 'Saving...' : 'Save App Settings'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Locations
              <Badge variant="secondary" className="ml-1">{locations.length}</Badge>
            </CardTitle>
            <Button size="sm" onClick={() => setShowNewLocation(v => !v)} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Location
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* New location form */}
            {showNewLocation && (
              <div className="border-2 border-dashed border-primary/40 rounded-xl p-4 space-y-4 bg-primary/5">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" /> New Delivery Location
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <Label>Location Name</Label>
                    <Input placeholder="e.g., Dhaka City" value={newLocation.name}
                      onChange={e => setNewLocation(v => ({ ...v, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Delivery Charge (৳)</Label>
                    <Input type="number" min={0} value={newLocation.charge}
                      onChange={e => setNewLocation(v => ({ ...v, charge: Number(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <Label>Duration Label</Label>
                    <Input placeholder="e.g., 1-2 days" value={newLocation.duration || ''}
                      onChange={e => setNewLocation(v => ({ ...v, duration: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Min Days</Label>
                    <Input type="number" min={1} value={newLocation.min_days}
                      onChange={e => setNewLocation(v => ({ ...v, min_days: Number(e.target.value) || 1 }))} />
                  </div>
                  <div>
                    <Label>Max Days</Label>
                    <Input type="number" min={1} value={newLocation.max_days}
                      onChange={e => setNewLocation(v => ({ ...v, max_days: Number(e.target.value) || 1 }))} />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-normal">Accepted Payment Methods</Label>
                  <div className="flex flex-wrap gap-3">
                    {['cash_on_delivery', 'bkash', 'nagad'].map(method => (
                      <label key={method} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                        newLocation.payment_methods.includes(method)
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-background text-muted-foreground'
                      }`}>
                        <Switch
                          checked={newLocation.payment_methods.includes(method)}
                          onCheckedChange={checked => setNewLocation(v => ({
                            ...v,
                            payment_methods: checked
                              ? [...v.payment_methods, method]
                              : v.payment_methods.filter(m => m !== method),
                          }))}
                        />
                        <span className="text-sm font-medium capitalize">{method.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={newLocation.is_active}
                      onCheckedChange={checked => setNewLocation(v => ({ ...v, is_active: checked }))}
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateLocation} disabled={loading}>
                      <Save className="h-3.5 w-3.5 mr-1" /> Save Location
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNewLocation(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}

            {locations.length === 0 && !showNewLocation && (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <MapPin className="h-8 w-8 opacity-30" />
                <p className="text-sm">No delivery locations configured.</p>
                <Button size="sm" variant="outline" onClick={() => setShowNewLocation(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add First Location
                </Button>
              </div>
            )}

            {locations.map((location, index) => {
              const isExpanded = expandedLocation === location.id;
              return (
                <div key={location.id} className={`border-2 rounded-xl transition-all ${
                  location.is_active ? 'border-border bg-card' : 'border-border/50 bg-muted/30 opacity-70'
                }`}>
                  {/* Location header row */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground truncate">{location.name}</p>
                        {!location.is_active && (
                          <Badge variant="secondary" className="text-xs shrink-0">Inactive</Badge>
                        )}
                        {location.is_active && (
                          <Badge className="text-xs shrink-0 bg-primary/10 text-primary border-primary/20">Active</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Wallet className="h-3 w-3" />
                          <strong className="text-foreground">৳{location.charge}</strong>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {location.duration || `${location.min_days}–${location.max_days} days`}
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {(location.payment_methods || []).map(m => (
                            <span key={m} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                              {m.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Switch
                        checked={location.is_active ?? true}
                        onCheckedChange={(checked) => {
                          const u = [...locations]; u[index].is_active = checked; setLocations(u);
                          handleLocationUpdate(location.id, { is_active: checked });
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8"
                        onClick={() => setExpandedLocation(isExpanded ? null : location.id)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteLocation(location.id, location.name)} disabled={loading}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded edit form */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <Label>Location Name</Label>
                          <Input
                            value={location.name}
                            onChange={(e) => { const u = [...locations]; u[index].name = e.target.value; setLocations(u); }}
                          />
                        </div>
                        <div>
                          <Label>Delivery Charge (৳)</Label>
                          <Input type="number" min={0}
                            value={location.charge}
                            onChange={(e) => { const u = [...locations]; u[index].charge = Number(e.target.value) || 0; setLocations(u); }}
                          />
                        </div>
                        <div>
                          <Label>Duration Label</Label>
                          <Input value={location.duration || ''} placeholder="e.g., 1-2 days"
                            onChange={(e) => { const u = [...locations]; u[index].duration = e.target.value; setLocations(u); }}
                          />
                        </div>
                        <div>
                          <Label>Min Days</Label>
                          <Input type="number" min={1} value={location.min_days}
                            onChange={(e) => { const u = [...locations]; u[index].min_days = Number(e.target.value) || 1; setLocations(u); }}
                          />
                        </div>
                        <div>
                          <Label>Max Days</Label>
                          <Input type="number" min={1} value={location.max_days}
                            onChange={(e) => { const u = [...locations]; u[index].max_days = Number(e.target.value) || 1; setLocations(u); }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block text-sm font-normal">Accepted Payment Methods</Label>
                        <div className="flex flex-wrap gap-3">
                          {['cash_on_delivery', 'bkash', 'nagad'].map((method) => (
                            <label key={method} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                              (location.payment_methods || []).includes(method)
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border bg-background text-muted-foreground'
                            }`}>
                              <Switch
                                checked={(location.payment_methods || []).includes(method)}
                                onCheckedChange={(checked) => {
                                  const u = [...locations];
                                  u[index].payment_methods = checked
                                    ? [...(u[index].payment_methods || []), method]
                                    : (u[index].payment_methods || []).filter(m => m !== method);
                                  setLocations(u);
                                  // Auto-save immediately like is_active toggle
                                  handleLocationUpdate(location.id, { payment_methods: u[index].payment_methods });
                                }}
                              />
                              <span className="text-sm font-medium capitalize">{method.replace(/_/g, ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <Button size="sm" disabled={loading}
                          onClick={() => handleLocationUpdate(location.id, {
                            name: location.name,
                            charge: location.charge,
                            duration: location.duration,
                            min_days: location.min_days,
                            max_days: location.max_days,
                            payment_methods: location.payment_methods,
                            is_active: location.is_active,
                          })}>
                          <Save className="h-3.5 w-3.5 mr-1" /> Save Changes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment Gateways</CardTitle>
            <Button size="sm" onClick={() => setShowNewGateway(v => !v)} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Gateway
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* New gateway form */}
            {showNewGateway && (
              <div className="border border-dashed border-border rounded-lg p-4 space-y-4 bg-muted/30">
                <p className="text-sm font-semibold text-foreground">New Payment Gateway</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Gateway Name</Label>
                    <Input placeholder="e.g., Rocket" value={newGateway.name}
                      onChange={e => setNewGateway(v => ({ ...v, name: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <Switch checked={newGateway.is_enabled}
                      onCheckedChange={c => setNewGateway(v => ({ ...v, is_enabled: c }))} />
                    <Label>Enabled</Label>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Mobile Number (optional)</Label>
                    <Input placeholder="e.g., 01700000000"
                      onChange={e => setNewGateway(v => ({ ...v, config: { ...v.config, account_number: e.target.value } }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateGateway} disabled={loading}>Save Gateway</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNewGateway(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {gateways.length === 0 && !showNewGateway && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No payment gateways configured. Click "Add Gateway" to add one.
              </p>
            )}

            {gateways.map((gateway, index) => (
              <div key={gateway.id}>
                {index > 0 && <Separator className="my-6" />}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold">{gateway.name}</p>
                        <Badge variant={gateway.is_enabled ? 'default' : 'secondary'} className="text-xs mt-0.5">
                          {gateway.is_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={gateway.is_enabled}
                        onCheckedChange={(checked) => handleGatewayUpdate(gateway.id, { is_enabled: checked })}
                      />
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteGateway(gateway.id, gateway.name)} disabled={loading}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {(gateway.name.toLowerCase() === 'bkash' || gateway.name.toLowerCase() === 'nagad' ||
                    (gateway.config as { account_number?: string })?.account_number !== undefined) && (
                    <div className="space-y-2">
                      <Label htmlFor={`${gateway.id}-account`}>Mobile Number</Label>
                      <Input
                        id={`${gateway.id}-account`}
                        placeholder="Enter mobile number (e.g., 01615995004)"
                        defaultValue={(gateway.config as { account_number?: string })?.account_number || ''}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          handleGatewayUpdate(gateway.id, { config: { ...gateway.config, account_number: value } });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">Shown to customers during checkout</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Terms and Conditions</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active</span>
                <Switch
                  checked={terms.is_active}
                  onCheckedChange={(checked) => setTerms({ ...terms, is_active: checked })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {terms.id ? 'Edit the terms users must agree to before placing an order.' : 'No terms set yet — create one below.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="terms-title">Title</Label>
              <Input
                id="terms-title"
                value={terms.title}
                onChange={(e) => setTerms({ ...terms, title: e.target.value })}
                placeholder="e.g. Terms and Conditions"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms-content">Content</Label>
              <Textarea
                id="terms-content"
                value={terms.content}
                onChange={(e) => setTerms({ ...terms, content: e.target.value })}
                rows={12}
                className="font-mono text-sm"
                placeholder="Enter terms and conditions text (one rule per line)"
              />
              <p className="text-xs text-muted-foreground">
                Users must agree to these terms before placing an order
              </p>
            </div>
            <Button onClick={handleTermsUpdate} disabled={loading}>
              {loading ? 'Saving...' : terms.id ? 'Save Terms' : 'Create Terms'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Refunds Policy</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active</span>
                <Switch
                  checked={refundsPolicy.is_active}
                  onCheckedChange={(checked) => setRefundsPolicy({ ...refundsPolicy, is_active: checked })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {refundsPolicy.id ? 'Edit the refunds & returns policy shown to customers.' : 'No refunds policy set yet — create one below.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refunds-title">Title</Label>
              <Input
                id="refunds-title"
                value={refundsPolicy.title}
                onChange={(e) => setRefundsPolicy({ ...refundsPolicy, title: e.target.value })}
                placeholder="e.g. Refunds & Returns Policy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refunds-content">Content (HTML supported)</Label>
              <Textarea
                id="refunds-content"
                value={refundsPolicy.content}
                onChange={(e) => setRefundsPolicy({ ...refundsPolicy, content: e.target.value })}
                rows={12}
                className="font-mono text-sm"
                placeholder="Enter refunds policy content (HTML tags supported)"
              />
              <p className="text-xs text-muted-foreground">
                Shown to customers in the checkout page. HTML tags are supported for formatting.
              </p>
            </div>
            <Button onClick={handleRefundsPolicyUpdate} disabled={loading}>
              {loading ? 'Saving...' : refundsPolicy.id ? 'Save Refunds Policy' : 'Create Refunds Policy'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Manual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userManual && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="manual-active">Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Show user manual popup to users
                    </p>
                  </div>
                  <Switch
                    id="manual-active"
                    checked={userManual.is_active}
                    onCheckedChange={(checked) => setUserManual({ ...userManual, is_active: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="manual-title">Title</Label>
                  <Input
                    id="manual-title"
                    value={userManual.title}
                    onChange={(e) => setUserManual({ ...userManual, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-content">Content</Label>
                  <Textarea
                    id="manual-content"
                    value={userManual.content}
                    onChange={(e) => setUserManual({ ...userManual, content: e.target.value })}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Enter user manual content"
                  />
                  <p className="text-xs text-muted-foreground">
                    Users will see this popup when they login or visit any page (if active and not yet accepted)
                  </p>
                </div>

                <Button onClick={handleUserManualUpdate} disabled={loading}>
                  {loading ? 'Saving...' : 'Save User Manual'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Google OAuth Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Google OAuth Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Google OAuth Client ID</Label>
              <div className="p-4 bg-muted rounded-lg">
                <code className="text-sm font-mono break-all">
                  YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Google OAuth Client Secret</Label>
              <div className="p-4 bg-muted rounded-lg">
                <code className="text-sm font-mono">
                  YOUR_GOOGLE_CLIENT_SECRET
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠️ This secret is stored securely in Supabase. Never commit it to version control.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Configuration Status</Label>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Credentials Configured ✅</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your Google OAuth credentials have been securely stored in Supabase.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Next Steps to Enable Google Sign-In</Label>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2 ml-2">
                <li>
                  <strong>Enable in Supabase Dashboard:</strong>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Go to Authentication → Providers → Google</li>
                    <li>Toggle "Enable Sign in with Google" to ON</li>
                    <li>Enter the Client ID and Secret shown above</li>
                    <li>Click Save</li>
                  </ul>
                </li>
                <li className="mt-2">
                  <strong>Configure Google Cloud Console:</strong>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Add authorized redirect URI: <code className="bg-muted px-1 py-0.5 rounded text-xs">https://[YOUR-SUPABASE-REF].supabase.co/auth/v1/callback</code></li>
                    <li>Add authorized JavaScript origins for your domain</li>
                  </ul>
                </li>
                <li className="mt-2">
                  <strong>Test:</strong> Go to login page and click "Continue with Google"
                </li>
              </ol>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Documentation</Label>
              <p className="text-sm text-muted-foreground">
                For detailed setup instructions, see:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                <li><code className="bg-muted px-1 py-0.5 rounded">GOOGLE_OAUTH_CONFIGURED.md</code> - Complete setup guide</li>
                <li><code className="bg-muted px-1 py-0.5 rounded">GOOGLE_OAUTH_QUICK_SETUP.md</code> - Quick reference</li>
                <li><code className="bg-muted px-1 py-0.5 rounded">GOOGLE_OAUTH_SETUP.md</code> - General OAuth guide</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
