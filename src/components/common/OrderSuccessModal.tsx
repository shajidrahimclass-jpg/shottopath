import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, UserPlus, Search, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OrderSuccessModalProps {
  open: boolean;
  onAnimationComplete?: () => void;
  // Guest info — when present, shows "create account" CTA instead of auto-redirecting
  guestOrderId?: string | null;
  guestPhone?: string;
  guestEmail?: string;
  isMobileRoute?: boolean;
}

const MOBILE_BASE = '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op';

export function OrderSuccessModal({
  open,
  onAnimationComplete,
  guestOrderId,
  guestPhone,
  guestEmail,
  isMobileRoute,
}: OrderSuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const navigate = useNavigate();

  // Is this a guest order (no logged-in user)?
  const isGuest = Boolean(guestOrderId);

  useEffect(() => {
    if (open) {
      const confettiTimer = setTimeout(() => {
        setShowConfetti(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#16a34a', '#db2777', '#dc2626', '#eab308'],
          zIndex: 10000,
        });
      }, 300);

      // For logged-in users: auto-redirect after 2.5s via onAnimationComplete
      // For guests: show options panel after animation
      const completionTimer = setTimeout(() => {
        if (isGuest) {
          setShowGuestOptions(true);
        } else if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 2500);

      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(completionTimer);
      };
    } else {
      setShowConfetti(false);
      setShowGuestOptions(false);
    }
  }, [open, isGuest, onAnimationComplete]);

  const handleTrackOrder = () => {
    const params = new URLSearchParams();
    if (guestOrderId) params.set('id', guestOrderId);
    if (guestPhone) params.set('phone', guestPhone);
    const trackUrl = `/track-order?${params.toString()}`;
    navigate(isMobileRoute ? `${MOBILE_BASE}${trackUrl}` : trackUrl);
  };

  const handleCreateAccount = () => {
    const signupUrl = isMobileRoute ? `${MOBILE_BASE}/login?tab=signup` : '/login?tab=signup';
    navigate(signupUrl);
  };

  const handleContinueShopping = () => {
    navigate(isMobileRoute ? `${MOBILE_BASE}/products` : '/products');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
            className="w-full max-w-sm bg-card rounded-2xl shadow-2xl border overflow-hidden"
          >
            {/* Success header */}
            <div className="flex flex-col items-center p-8 pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', duration: 0.6, bounce: 0.5 }}
                className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4"
              >
                <CheckCircle2 className="w-14 h-14 text-green-600 dark:text-green-500" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-center mb-1"
              >
                Order Confirmed!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground text-center text-sm"
              >
                {isGuest
                  ? 'Your order has been placed successfully.'
                  : 'Redirecting to your orders…'}
              </motion.p>
            </div>

            {/* Guest CTA panel — slides in after confetti */}
            <AnimatePresence>
              {isGuest && showGuestOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="border-t px-6 pb-6 pt-4 space-y-3"
                >
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    Save your order history and get faster checkout next time
                  </p>

                  {/* Primary CTA — create account */}
                  <Button
                    className="w-full gap-2"
                    onClick={handleCreateAccount}
                  >
                    <UserPlus className="h-4 w-4" />
                    Create a Free Account
                  </Button>

                  {/* Track order */}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleTrackOrder}
                  >
                    <Search className="h-4 w-4" />
                    Track My Order
                  </Button>

                  {/* Skip */}
                  <button
                    onClick={handleContinueShopping}
                    className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 py-1 transition-colors"
                  >
                    Continue shopping
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
