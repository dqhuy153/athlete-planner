'use client';

import { useEffect, useState } from 'react';
import {
  Copy, Trash2, X, ChevronLeft, ChevronRight,
  ExternalLink, Check, FileText as FileIcon,
} from 'lucide-react';
import type { Asset } from '@athlete-planner/contracts';
import { formatBytes, fileExt, ProviderBadge, Row } from './AssetHelpers';

interface PreviewModalProps {
  asset: Asset;
  assets: Asset[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onNavigate: (asset: Asset) => void;
}

export function AssetPreviewModal({ asset, assets, onClose, onDelete, onNavigate }: PreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const idx = assets.findIndex((a) => a.id === asset.id);
  const prev = idx > 0 ? assets[idx - 1] : null;
  const next = idx < assets.length - 1 ? assets[idx + 1] : null;

  function copy() {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && prev) onNavigate(prev);
      if (e.key === 'ArrowRight' && next) onNavigate(next);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, onClose, onNavigate]);

  const isImage = asset.mimeType?.startsWith('image/');
  const isVideo = asset.mimeType?.startsWith('video/');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-5xl mx-4 max-h-[90vh] rounded-[20px] overflow-hidden border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media area */}
        <div className="flex-1 flex items-center justify-center bg-background min-h-64 relative">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.url} alt={asset.fileName} className="max-w-full max-h-[80vh] object-contain" />
          ) : isVideo ? (
            <video src={asset.url} controls className="max-w-full max-h-[80vh]" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-on-surface-variant">
              <FileIcon size={56} />
              <span className="text-sm">{fileExt(asset.fileName).toUpperCase()}</span>
            </div>
          )}

          {prev && (
            <button
              onClick={() => onNavigate(prev)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {next && (
            <button
              onClick={() => onNavigate(next)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Info sidebar */}
        <div className="w-64 shrink-0 flex flex-col border-l border-border p-4 overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-foreground break-all leading-snug">{asset.fileName}</p>
            <button onClick={onClose} className="ml-2 p-1 text-on-surface-variant hover:text-foreground shrink-0 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            <Row label="Type" value={asset.mimeType ?? '—'} />
            <Row label="Size" value={formatBytes(asset.size)} mono />
            <Row label="Provider" value={<ProviderBadge provider={asset.storageProvider} />} />
            <Row label="Uploaded" value={new Date(asset.createdAt).toLocaleDateString()} />
            {asset.uploadedBy && <Row label="By" value={asset.uploadedBy.slice(0, 8) + '…'} mono />}
          </div>

          {/* URL */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-on-surface-variant mb-1.5">URL</p>
            <div className="flex items-center gap-1 p-2 rounded-lg bg-background border border-border">
              <p className="flex-1 text-[10px] text-on-surface-variant font-mono truncate">{asset.url}</p>
              <button onClick={copy} className="shrink-0 p-1 text-on-surface-variant hover:text-accent transition-colors">
                {copied ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs border border-border rounded-lg text-on-surface-variant hover:text-foreground hover:border-border/60 transition-colors"
            >
              <ExternalLink size={12} /> Open
            </a>
            <button
              onClick={() => onDelete(asset.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-error/20 rounded-lg text-error hover:bg-error/10 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
