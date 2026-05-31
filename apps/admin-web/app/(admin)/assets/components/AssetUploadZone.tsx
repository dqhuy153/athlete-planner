'use client';

import { DragEvent, RefObject } from 'react';
import { Upload, RefreshCw, Cloud, HardDrive } from 'lucide-react';

export type UploadProvider = 'r2' | 'cloudinary';

export interface UploadState {
  provider: UploadProvider;
  dragging: boolean;
  uploading: boolean;
  progress: string;
}

interface AssetUploadZoneProps {
  uploadState: UploadState;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onProviderChange: (provider: UploadProvider) => void;
  onFileChange: (files: FileList | null) => void;
}

export function AssetUploadZone({
  uploadState,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onProviderChange,
  onFileChange,
}: AssetUploadZoneProps) {
  return (
    <>
      <div
        className={`mb-6 rounded-[20px] border-2 border-dashed transition-colors cursor-pointer ${
          uploadState.dragging
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-border/60 bg-surface'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploadState.uploading && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          {uploadState.uploading ? (
            <>
              <RefreshCw size={28} className="text-accent animate-spin" />
              <p className="text-sm text-on-surface-variant">{uploadState.progress}</p>
            </>
          ) : (
            <>
              <Upload size={28} className={uploadState.dragging ? 'text-accent' : 'text-on-surface-variant'} />
              <div className="text-center">
                <p className="text-sm font-medium text-on-surface-variant">
                  {uploadState.dragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">Images, videos, and other files</p>
              </div>
              {/* Provider selector */}
              <div
                className="flex items-center gap-1 rounded-lg border border-border bg-background p-1"
                onClick={(e) => e.stopPropagation()}
              >
                {(['r2', 'cloudinary'] as UploadProvider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => onProviderChange(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      uploadState.provider === p
                        ? 'bg-surface-3 text-foreground'
                        : 'text-on-surface-variant hover:text-on-surface-variant'
                    }`}
                  >
                    {p === 'r2' ? <HardDrive size={12} /> : <Cloud size={12} />}
                    {p === 'r2' ? 'R2 Storage' : 'Cloudinary'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,.pdf,.txt,.md"
        onChange={(e) => onFileChange(e.target.files)}
      />
    </>
  );
}
