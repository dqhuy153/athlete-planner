'use client';

/**
 * CardImage — Reusable tarot card image component with built-in lightbox preview.
 *
 * Best-practices applied:
 * - Portal-based fullscreen modal so it's never clipped by parent overflow
 * - Framer Motion enter/exit animation (scale + fade)
 * - Keyboard: Escape to close
 * - Aspect-ratio 2/3 preserved in lightbox
 * - Reversed-card indicator (rotate 180° + badge)
 * - Glass-morphism overlay matching Orbit design system
 * - `previewable` prop: set false to disable lightbox (e.g., when parent handles click)
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export interface CardImageProps {
  /** Hosted image URL (Cloudinary / R2 public URL) */
  imageUrl?: string | null;
  /** English card name */
  name?: string;
  /** Vietnamese card name */
  nameVi?: string;
  arcana?: string;
  isReversed?: boolean;
  /** className for the wrapper div */
  className?: string;
  /** className for the <img> element */
  imgClassName?: string;
  /** Enable click-to-preview lightbox. Default: true */
  previewable?: boolean;
  /** Fallback JSX when imageUrl is empty */
  fallback?: React.ReactNode;
  /** Override the click handler (disables built-in preview) */
  onClick?: (e: React.MouseEvent) => void;
  /** Inline style for the wrapper div */
  style?: React.CSSProperties;
}

export function CardLightbox({
  imageUrl,
  name,
  nameVi,
  arcana,
  isReversed,
  onClose,
}: Pick<CardImageProps, 'imageUrl' | 'name' | 'nameVi' | 'arcana' | 'isReversed'> & {
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const displayName = nameVi || name || '';
  const subName = nameVi && name ? name : '';

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="card-lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/88 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Card container */}
      <motion.div
        key="card-lightbox-content"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed inset-0 z-[201] flex items-center justify-center p-6 pointer-events-none"
      >
        <div
          className="pointer-events-auto flex flex-col items-center gap-4 max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card image */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.25)] border border-primary/40"
            style={{
              aspectRatio: '2 / 3',
              maxHeight: 'min(72vh, 540px)',
              maxWidth: 'min(48vw, 360px)',
              width: '100%',
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={displayName}
                className={cn(
                  'w-full h-full object-contain select-none transition-transform duration-300',
                  isReversed && 'rotate-180',
                )}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                <span className="text-5xl opacity-40">❆</span>
              </div>
            )}

            {/* Reversed badge */}
            {isReversed && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-500/80 text-black text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                ↻ Ngược
              </div>
            )}

            {/* Arcana chip */}
            {arcana && (
              <div className="absolute top-2 left-2 bg-background/70 backdrop-blur-sm text-[9px] text-primary uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border border-primary/30">
                {arcana}
              </div>
            )}
          </div>

          {/* Card name badge */}
          {(displayName || subName) && (
            <div className="soft-card rounded-xl px-5 py-3 border border-primary/30 text-center max-w-xs pointer-events-auto">
              {displayName && (
                <p className="font-serif text-lg text-on-surface leading-tight">{displayName}</p>
              )}
              {subName && (
                <p className="text-xs text-on-surface-variant mt-0.5">{subName}</p>
              )}
            </div>
          )}

          {/* Close hint */}
          <p className="text-[10px] text-white/40 mt-1">Nhấn bất kỳ đâu hoặc ESC để đóng</p>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

export function CardImage({
  imageUrl,
  name,
  nameVi,
  arcana,
  isReversed,
  className,
  imgClassName,
  previewable = true,
  fallback,
  onClick,
  style,
}: CardImageProps) {
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (onClick) {
        onClick(e);
        return;
      }
      if (previewable && imageUrl) {
        e.stopPropagation();
        setOpen(true);
      }
    },
    [onClick, previewable, imageUrl],
  );

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden',
          previewable && imageUrl && !onClick && 'cursor-zoom-in group',
          className,
        )}
        style={style}
        onClick={handleClick}
      >
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={nameVi || name || ''}
              className={cn('w-full h-full object-contain', imgClassName)}
              draggable={false}
            />
            {/* Hover overlay hint */}
            {previewable && !onClick && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-lg drop-shadow-lg"></span>
              </div>
            )}
          </>
        ) : (
          fallback ?? (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
              <span className="text-2xl">❆</span>
            </div>
          )
        )}
      </div>

      {/* Lightbox — only mount when open */}
      {open && (
        <CardLightbox
          imageUrl={imageUrl}
          name={name}
          nameVi={nameVi}
          arcana={arcana}
          isReversed={isReversed}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
