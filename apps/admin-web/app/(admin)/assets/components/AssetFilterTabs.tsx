'use client';

import { StorageProvider } from '@athlete-planner/contracts';
import type { Asset } from '@athlete-planner/contracts';

export type ProviderFilter = 'all' | 'r2' | 'cloudinary';

interface AssetFilterTabsProps {
  assets: Asset[];
  providerFilter: ProviderFilter;
  onChange: (filter: ProviderFilter) => void;
}

export function AssetFilterTabs({ assets, providerFilter, onChange }: AssetFilterTabsProps) {
  return (
    <div className="flex gap-1 mb-5 border-b border-border">
      {(['all', 'r2', 'cloudinary'] as ProviderFilter[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
            providerFilter === f
              ? 'border-accent text-accent'
              : 'border-transparent text-on-surface-variant hover:text-foreground'
          }`}
        >
          {f === 'all'
            ? `All (${assets.length})`
            : f === 'r2'
            ? `R2 (${assets.filter((a) => a.storageProvider === StorageProvider.R2).length})`
            : `Cloudinary (${assets.filter((a) => a.storageProvider === StorageProvider.CLOUDINARY).length})`}
        </button>
      ))}
    </div>
  );
}
