'use client';

import { Copy, Film, Cloud, HardDrive, ImageIcon } from 'lucide-react';
import type { Asset } from '@athlete-planner/contracts';
import { StorageProvider } from '@athlete-planner/contracts';
import { AssetIcon, formatBytes } from './AssetHelpers';

interface AssetGridProps {
  assets: Asset[];
  onSelect: (asset: Asset) => void;
  onCopyUrl: (url: string, e: React.MouseEvent) => void;
}

export function AssetGrid({ assets, onSelect, onCopyUrl }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon size={40} className="text-on-surface-variant mb-3" />
        <p className="text-on-surface-variant text-sm">No assets yet</p>
        <p className="text-on-surface-variant text-xs mt-1">Upload files to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {assets.map((asset) => (
        <div
          key={asset.id}
          onClick={() => onSelect(asset)}
          className="group cursor-pointer rounded-[20px] border border-border bg-surface overflow-hidden hover:border-border/60 transition-colors"
        >
          <div className="aspect-square bg-background flex items-center justify-center overflow-hidden relative">
            {asset.mimeType?.startsWith('image/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.url}
                alt={asset.fileName}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : asset.mimeType?.startsWith('video/') ? (
              <Film size={28} className="text-on-surface-variant" />
            ) : (
              <AssetIcon mimeType={asset.mimeType} />
            )}
            {/* Provider badge overlay */}
            <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {asset.storageProvider === StorageProvider.CLOUDINARY ? (
                <span className="p-1 rounded-md bg-black/60 backdrop-blur-sm">
                  {/* TODO: design token needed — #A78BFA (purple) not in MA design system */}
                  <Cloud size={10} className="text-[#A78BFA]" />
                </span>
              ) : (
                <span className="p-1 rounded-md bg-black/60 backdrop-blur-sm">
                  <HardDrive size={10} className="text-accent" />
                </span>
              )}
            </div>
            {/* Copy button overlay */}
            <button
              onClick={(e) => onCopyUrl(asset.url, e)}
              className="absolute bottom-1.5 right-1.5 p-1.5 rounded-md bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-accent"
              title="Copy URL"
            >
              <Copy size={11} />
            </button>
          </div>
          <div className="px-2 py-1.5">
            <p className="text-[10px] text-on-surface-variant truncate">{asset.fileName}</p>
            <p className="text-[10px] text-on-surface-variant font-mono">{formatBytes(asset.size)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
