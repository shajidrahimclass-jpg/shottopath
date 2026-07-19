import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAppSettings } from '@/db/api';
import type { AppSettings } from '@/types';
import { setAdminBasePath } from '@/config/admin';

interface AppSettingsContextType {
  appSettings: AppSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

// Inject or remove Google Analytics gtag.js script
function applyGoogleAnalytics(gaId: string | null | undefined) {
  const currentGaId = document.querySelector('script[data-ga="src"]')?.getAttribute('src')?.split('id=')[1];
  
  if (currentGaId === gaId) return;

  // Remove any existing GA scripts
  document.querySelectorAll('script[data-ga]').forEach(el => el.remove());
  if (!gaId) return;

  const script1 = document.createElement('script');
  script1.setAttribute('data-ga', 'src');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.setAttribute('data-ga', 'init');
  script2.text = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { send_page_view: true });`;
  document.head.appendChild(script2);
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const settings = await getAppSettings();
      setAppSettings(settings);

      // Update admin base path if available
      if (settings?.admin_url_path) {
        setAdminBasePath(settings.admin_url_path);
      }

      // Inject Google Analytics
      applyGoogleAnalytics(settings?.google_analytics_id);

      // Update document title and favicon
      if (settings) {
        document.title = settings.site_title;

        if (settings.favicon_url) {
          const existingLinks = document.querySelectorAll("link[rel*='icon']");
          existingLinks.forEach(link => link.remove());

          const faviconUrl = settings.favicon_url.includes('?')
            ? `${settings.favicon_url}&t=${Date.now()}`
            : `${settings.favicon_url}?t=${Date.now()}`;

          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/png';
          link.href = faviconUrl;
          document.head.appendChild(link);

          const appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          appleLink.href = faviconUrl;
          document.head.appendChild(appleLink);
        }
      }
    } catch (error) {
      console.error('Failed to load app settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <AppSettingsContext.Provider value={{ appSettings, loading, refreshSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
