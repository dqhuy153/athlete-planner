'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface NavigationGuardModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
  title?: string;
  description?: string;
}

/**
 * Warning modal shown when user tries to navigate away during a critical operation
 * (reading loading, AI streaming, etc.).
 */
export function NavigationGuardModal({
  isOpen,
  onStay,
  onLeave,
  title = 'Đừng rời đi ngay!',
  description,
}: NavigationGuardModalProps) {
  const defaultDesc =
    'Bài đọc của bạn đang được Orbit Reader tạo. Nếu rời đi bây giờ, bài có thể bị lỗi.\n\nBạn vẫn có thể vào **Nhật ký chữa lành** để xem lại lịch sử bài đọc sau nhé.';

  const displayDesc = description ?? defaultDesc;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="nav-guard-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70"
          onClick={onStay}
        >
          <motion.div
            key="nav-guard-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-surface-container-low rounded-2xl p-6 max-w-sm w-full border border-amber-500/30 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-label={title}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center font-serif text-lg text-on-surface mb-2">{title}</h2>

            {/* Description */}
            <div className="text-center text-sm text-on-surface-variant leading-relaxed mb-6 whitespace-pre-line">
              {displayDesc.split('**').map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="text-on-surface font-semibold">
                    {part}
                  </strong>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onStay}
                className="w-full bg-gradient-to-b from-primary to-[#b8952b] text-on-primary rounded-full py-3 font-semibold text-sm active:scale-95 transition-transform"
              >
                Ở lại & tiếp tục
              </button>
              <button
                onClick={onLeave}
                className="w-full bg-surface-container/60 border border-outline-variant/50 text-on-surface-variant rounded-full py-2.5 text-sm hover:text-on-surface transition-colors"
              >
                Vẫn rời đi
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
