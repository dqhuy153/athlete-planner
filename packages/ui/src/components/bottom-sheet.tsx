'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Content area max height (default 80vh). The sheet accounts for BottomNav height on mobile. */
  maxHeight?: string;
  children: React.ReactNode;
}

/**
 * Reusable bottom sheet — slides up from the bottom.
 * z-index is set to z-[200] so it always appears above:
 *   - BottomNav (z-40)
 *   - Regular popovers
 * Bottom padding is auto-adjusted to clear the fixed BottomNav on mobile.
 */
export function BottomSheet({ open, onClose, maxHeight = '82vh', children }: BottomSheetProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — above BottomNav */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[199] bg-black/70"
          />
          {/* Sheet — above backdrop */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="fixed bottom-0 inset-x-0 z-[200] max-w-2xl mx-auto"
            style={{ maxHeight }}
            role="dialog"
            aria-label="Bottom sheet dialog"
          >
            {/* Extra bottom padding clears the BottomNav (h-20 = 80px) on mobile */}
            <div
              className="bg-surface-container-low rounded-t-3xl border-t border-primary/20 overflow-y-auto scrollbar-gold"
              style={{ maxHeight, paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 88px)' }}
            >
              {/* Drag handle */}
              <div className="sticky top-0 flex justify-center pt-3 pb-1 bg-surface-container-low rounded-t-3xl">
                <div className="w-12 h-1 bg-outline-variant rounded-full" />
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
