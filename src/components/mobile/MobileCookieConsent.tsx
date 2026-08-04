import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileCookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('mobile_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mobile_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('mobile_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[60px] left-0 right-0 z-50 p-4"
        >
          <div className="bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-2xl p-5">
            <h3 className="font-semibold text-base mb-2">We value your privacy</h3>
            <p className="text-xs text-muted-foreground mb-4">
              We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={handleAccept} size="sm" className="flex-1">
                Accept All
              </Button>
              <Button onClick={handleDecline} size="sm" variant="outline" className="flex-1">
                Decline
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
