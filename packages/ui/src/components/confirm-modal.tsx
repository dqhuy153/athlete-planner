'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from './card';
import { Button } from './button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
  loading,
  children,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <Card className="relative rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <div className="flex items-start gap-3">
          {destructive && (
            <div className="p-2 rounded-lg bg-error/10">
              <AlertTriangle size={20} className="text-error" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-on-surface">{title}</h3>
            <p className="text-sm text-on-surface-variant mt-1">{message}</p>
            {children && <div className="mt-3">{children}</div>}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm"
          >
            {loading ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
