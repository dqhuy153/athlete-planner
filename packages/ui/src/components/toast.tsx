'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone?: 'success' | 'error' | 'info' | 'warning';
  // Optional action rendered as a button on the toast. The toast will be dismissed when the action is clicked.
  action?: { label: string; onClick: () => void };
};

const ToastContext = React.createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { ...t, id };
    setToasts((arr) => [...arr, toast]);
    const timer = window.setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 4000);
    // If the toast has an action, render a button that will call the provided handler and dismiss the toast.
    // We don't keep a registry of timers for simplicity; dismissing twice is harmless.
    return id;
  }, []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`pointer-events-auto rounded-xl px-4 py-3 border shadow-lg ${
                t.tone === 'error'
                  ? 'bg-surface-container-low border-error/40 text-error'
                  : t.tone === 'success'
                    ? 'bg-surface-container-low border-primary/40 text-primary'
                    : t.tone === 'warning'
                      ? 'bg-surface-container-low border-amber-400/40 text-amber-400'
                      : 'bg-surface-container-low border-outline-variant text-on-surface'
              } flex items-center justify-between gap-3`}
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{t.title}</p>
                {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
              </div>
              {t.action && (
                <div>
                  <button
                    onClick={() => {
                      try { t.action?.onClick(); } catch { /* noop */ }
                      setToasts((arr) => arr.filter((x) => x.id !== t.id));
                    }}
                    className="text-sm text-primary underline"
                  >
                    {t.action.label}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
