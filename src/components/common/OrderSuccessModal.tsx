import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderSuccessModalProps {
  open: boolean;
  onAnimationComplete?: () => void;
}

export function OrderSuccessModal({ open, onAnimationComplete }: OrderSuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      // Small delay before showing confetti for better effect
      const timer = setTimeout(() => {
        setShowConfetti(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#16a34a', '#db2777', '#dc2626', '#eab308'],
          zIndex: 10000,
        });
      }, 300);

      // Call completion handler after animation finishes
      const completionTimer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 2500);

      return () => {
        clearTimeout(timer);
        clearTimeout(completionTimer);
      };
    } else {
      setShowConfetti(false);
    }
  }, [open, onAnimationComplete]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
            className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl shadow-2xl border"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", duration: 0.6, bounce: 0.5 }}
              className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-6"
            >
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-500" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl font-bold text-center mb-2"
            >
              Order Confirmed!
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-center"
            >
              Redirecting to your orders...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
