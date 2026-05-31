'use client';

import { ImageIcon, Film, FileText as FileIcon, Cloud, HardDrive } from 'lucide-react';
import { StorageProvider } from '@athlete-planner/contracts';

export function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function fileExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export function AssetIcon({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.startsWith('image/')) return <ImageIcon size={28} className="text-on-surface-variant" />;
  if (mimeType?.startsWith('video/')) return <Film size={28} className="text-on-surface-variant" />;
  return <FileIcon size={28} className="text-on-surface-variant" />;
}

export function ProviderBadge({ provider }: { provider: StorageProvider }) {
  if (provider === StorageProvider.CLOUDINARY) {
    return (
      // TODO: design token needed — #7C3AED/#A78BFA (purple) not in MA design system
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/20">
        <Cloud size={9} /> Cloudinary
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
      <HardDrive size={9} /> R2
    </span>
  );
}

export function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-on-surface-variant mb-0.5">{label}</p>
      {typeof value === 'string' ? (
        <p className={`text-xs text-foreground ${mono ? 'font-mono' : ''}`}>{value}</p>
      ) : (
        value
      )}
    </div>
  );
}
