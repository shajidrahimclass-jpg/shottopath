import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAppDownloads } from '@/db/api';
import type { AppDownload } from '@/types';

/**
 * Smart banner shown on Android/mobile devices prompting APK download.
 * Auto-dismissed and remembered via localStorage.
 * Never shown on desktop or if already dismissed.
 */
export function MobileAppBanner() {
  const [visible, setVisible] = useState(false);
  const [apk, setApk] = useState<AppDownload | null>(null);

  useEffect(() => {
    // Only show on Android mobile browsers
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const dismissed = localStorage.getItem('apk_banner_dismissed');
    if (!isAndroid || !isMobile || dismissed) return;

    getAppDownloads()
      .then((downloads) => {
        const found = downloads.find(
          (d) => (d.platform === 'apk' || d.platform === 'google_play') && d.is_active
        );
        if (found) {
          setApk(found);
          setTimeout(() => setVisible(true), 2000);
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('apk_banner_dismissed', '1');
    setVisible(false);
  };

  const handleDownload = () => {
    const url = apk?.file_url || apk?.link_url;
    if (url) window.open(url, '_blank');
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {visible && apk && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[9998] bg-card border-b shadow-md"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            {/* App icon placeholder */}
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">Shottopath App</p>
              <p className="text-xs text-muted-foreground leading-tight">
                Better experience in the app
              </p>
            </div>

            {/* Download CTA */}
            <Button
              size="sm"
              className="shrink-0 h-8 text-xs px-3"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
