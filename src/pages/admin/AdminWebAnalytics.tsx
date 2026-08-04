import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { updateAppSettings } from '@/db/api';
import { toast } from 'sonner';
import {
  BarChart2,
  Globe,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Info,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { adminPath } from '@/config/admin';

export default function AdminWebAnalytics() {
  const { appSettings, refreshSettings } = useAppSettings();
  const navigate = useNavigate();
  const [gaId, setGaId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (appSettings) {
      setGaId(appSettings.google_analytics_id || '');
    }
  }, [appSettings]);

  const isValidGaId = (id: string) =>
    /^G-[A-Z0-9]{8,12}$/.test(id.trim()) || id.trim() === '';

  const handleSave = async () => {
    if (!appSettings) return;
    if (gaId && !isValidGaId(gaId)) {
      toast.error('Invalid Measurement ID format. Use G-XXXXXXXXXX');
      return;
    }
    setSaving(true);
    try {
      await updateAppSettings(appSettings.id, {
        google_analytics_id: gaId.trim() || null,
      });
      await refreshSettings();
      toast.success(gaId ? 'Google Analytics enabled!' : 'Google Analytics removed');
    } catch (err) {
      toast.error('Failed to save analytics settings');
    } finally {
      setSaving(false);
    }
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(`<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId || 'G-XXXXXXXXXX'}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId || 'G-XXXXXXXXXX'}');
</script>`);
    toast.success('Code snippet copied!');
  };

  const isActive = !!appSettings?.google_analytics_id;

  const steps = [
    {
      num: '01',
      title: 'Create a Google Analytics account',
      desc: 'Go to analytics.google.com and sign in with your Google account.',
      link: 'https://analytics.google.com',
      linkLabel: 'Open Google Analytics',
    },
    {
      num: '02',
      title: 'Create a new GA4 property',
      desc: 'Click "Admin" → "Create Property". Choose GA4 and fill in your website details.',
    },
    {
      num: '03',
      title: 'Get your Measurement ID',
      desc: 'Under your property → "Data Streams" → select Web → copy the Measurement ID (starts with G-).',
    },
    {
      num: '04',
      title: 'Paste it above and save',
      desc: 'Paste the ID in the field above and click Save. Analytics will activate automatically.',
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(adminPath('settings'))}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">Web Analytics</h1>
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={isActive ? 'bg-primary text-primary-foreground' : ''}
            >
              {isActive ? (
                <><CheckCircle className="h-3 w-3 mr-1" />Active</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" />Not configured</>
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect Google Analytics GA4 to track visitors and page performance
          </p>
        </div>
      </div>

      {/* Status banner */}
      {isActive && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary">Tracking active</p>
            <p className="text-xs text-muted-foreground truncate">
              Measurement ID: <span className="font-mono">{appSettings?.google_analytics_id}</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              window.open(
                `https://analytics.google.com/analytics/web/#/p${appSettings?.google_analytics_id?.replace('G-', '')}/reports/reportinghub`,
                '_blank'
              )
            }
            className="shrink-0 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            View Reports
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Config card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-4 w-4 text-primary" />
              GA4 Configuration
            </CardTitle>
            <CardDescription>Enter your Measurement ID to enable tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ga-measurement-id">Measurement ID</Label>
              <div className="flex gap-2">
                <Input
                  id="ga-measurement-id"
                  value={gaId}
                  onChange={(e) => setGaId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className={`font-mono ${gaId && !isValidGaId(gaId) ? 'border-destructive' : ''}`}
                />
              </div>
              {gaId && !isValidGaId(gaId) && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Format must be G-XXXXXXXXXX
                </p>
              )}
              {gaId && isValidGaId(gaId) && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Valid Measurement ID
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5 shrink-0" />
                Find this in Google Analytics → Admin → Data Streams → Web stream
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || (gaId !== '' && !isValidGaId(gaId))}
                className="btn-glow flex-1"
              >
                {saving ? 'Saving...' : gaId ? 'Save & Activate' : 'Remove Analytics'}
              </Button>
              {gaId && isValidGaId(gaId) && (
                <Button variant="outline" size="icon" onClick={copySnippet} title="Copy gtag snippet">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats links card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Quick Links
            </CardTitle>
            <CardDescription>Access your analytics reports directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: 'Real-time visitors',
                desc: 'Who\'s on your site right now',
                url: 'https://analytics.google.com',
                icon: Globe,
              },
              {
                label: 'Audience reports',
                desc: 'Demographics & device breakdown',
                url: 'https://analytics.google.com',
                icon: BarChart2,
              },
              {
                label: 'Acquisition reports',
                desc: 'Traffic sources & campaigns',
                url: 'https://analytics.google.com',
                icon: TrendingUp,
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (!isActive) {
                    toast.error('Set up Analytics first to access reports');
                    return;
                  }
                  window.open(item.url, '_blank');
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  isActive
                    ? 'border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer'
                    : 'border-border/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            ))}
            {!isActive && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                Configure your Measurement ID first
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Setup guide */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Setup Guide
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex gap-3 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{step.num}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    {step.linkLabel}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
