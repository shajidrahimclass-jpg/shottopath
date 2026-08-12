import React, { useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';

import getRoutes from './routes';

import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AppSettingsProvider, useAppSettings } from '@/contexts/AppSettingsContext';
import { KeyboardShortcutsProvider } from '@/contexts/KeyboardShortcutsContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import { AnnouncementPopup } from '@/components/common/AnnouncementPopup';
import { KeyboardShortcutsOverlay } from '@/components/KeyboardShortcutsOverlay';
import { MobileCookieConsent } from '@/components/mobile/MobileCookieConsent';
import { MobileAppBanner } from '@/components/MobileAppBanner';
import { Toaster } from 'sonner';

const AppRoutes: React.FC = () => {
  const { appSettings, loading } = useAppSettings();
  
  // Regenerate routes when app settings change (including admin URL)
  const routes = useMemo(() => getRoutes(), [appSettings?.admin_url_path]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={route.element}
        />
      ))}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppSettingsProvider>
      <Router>
        <AuthProvider>
          <WishlistProvider>
            <KeyboardShortcutsProvider>
              <RouteGuard>
                <IntersectObserver />
                <AnnouncementPopup />
                <AppRoutes />
                <KeyboardShortcutsOverlay />
                <MobileAppBanner />
                <MobileCookieConsent />
                <Toaster />
              </RouteGuard>
            </KeyboardShortcutsProvider>
          </WishlistProvider>
        </AuthProvider>
      </Router>
    </AppSettingsProvider>
  );
};

export default App;
