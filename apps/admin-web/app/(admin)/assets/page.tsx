'use client';

import { useEffect, useState, useRef, useCallback, DragEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getAssets,
  deleteAsset,
  presignAssetUpload,
  confirmAssetUpload,
  getCloudinaryPresign,
  confirmCloudinaryUpload,
} from '@/lib/api';
import type { Asset } from '@athlete-planner/contracts';
import { StorageProvider } from '@athlete-planner/contracts';
import {
  Upload, Copy, Trash2, X, ChevronLeft, ChevronRight,
  ExternalLink, Check, Cloud, HardDrive, ImageIcon, Film,
  FileText as FileIcon, RefreshCw,
} from 'lucide-react';
import { ConfirmModal } from '@athlete-planner/ui';
import { useToast } from '@/components/ui/toast';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function fileExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function AssetIcon({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.startsWith('image/')) return <ImageIcon size={28} className="text-on-surface-variant" />;
  if (mimeType?.startsWith('video/')) return <Film size={28} className="text-on-surface-variant" />;
  return <FileIcon size={28} className="text-on-surface-variant" />;
}

function ProviderBadge({ provider }: { provider: StorageProvider }) {
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

// ── Preview Modal ─────────────────────────────────────────────────────────────

interface PreviewModalProps {
  asset: Asset;
  assets: Asset[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onNavigate: (asset: Asset) => void;
}

function PreviewModal({ asset, assets, onClose, onDelete, onNavigate }: PreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const idx = assets.findIndex((a) => a.id === asset.id);
  const prev = idx > 0 ? assets[idx - 1] : null;
  const next = idx < assets.length - 1 ? assets[idx + 1] : null;

  function copy() {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // Keyboard nav
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

          {/* Nav arrows */}
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

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
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

// ── Upload Zone ───────────────────────────────────────────────────────────────

type UploadProvider = 'r2' | 'cloudinary';

interface UploadState {
  provider: UploadProvider;
  dragging: boolean;
  uploading: boolean;
  progress: string;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type ProviderFilter = 'all' | 'r2' | 'cloudinary';

export default function AssetsPage() {
  const { session } = useAuth();
  const { push } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all');
  const [preview, setPreview] = useState<Asset | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    provider: 'r2',
    dragging: false,
    uploading: false,
    progress: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) return;
    loadAssets();
  }, [session]);

  async function loadAssets() {
    setLoading(true);
    try {
      const res = await getAssets(session!.accessToken);
      setAssets(res);
    } catch (e: any) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredAssets = assets.filter((a) => {
    if (providerFilter === 'all') return true;
    if (providerFilter === 'r2') return a.storageProvider === StorageProvider.R2;
    return a.storageProvider === StorageProvider.CLOUDINARY;
  });

  // ── Upload ──

  async function uploadFile(file: File) {
    if (!session) return;
    const ext = fileExt(file.name);
    setUploadState((s) => ({ ...s, uploading: true, progress: 'Preparing…' }));

    try {
      if (uploadState.provider === 'r2') {
        setUploadState((s) => ({ ...s, progress: 'Getting upload URL…' }));
        const { uploadUrl, key } = await presignAssetUpload(session.accessToken, {
          contentType: file.type,
          ext,
          category: 'assets',
        });
        setUploadState((s) => ({ ...s, progress: 'Uploading to R2…' }));
        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        setUploadState((s) => ({ ...s, progress: 'Confirming…' }));
        await confirmAssetUpload(session.accessToken, {
          key,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          category: 'assets',
        });
      } else {
        setUploadState((s) => ({ ...s, progress: 'Getting Cloudinary signature…' }));
        const params = await getCloudinaryPresign(session.accessToken, {
          contentType: file.type,
          category: 'assets',
        });
        setUploadState((s) => ({ ...s, progress: 'Uploading to Cloudinary…' }));
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', params.signature);
        formData.append('timestamp', String(params.timestamp));
        formData.append('api_key', params.apiKey);
        formData.append('folder', params.folder);
        formData.append('public_id', params.publicId);
        const cdnRes = await fetch(
          `https://api.cloudinary.com/v1_1/${params.cloudName}/auto/upload`,
          { method: 'POST', body: formData },
        );
        if (!cdnRes.ok) throw new Error('Cloudinary upload failed');
        const cdnData = await cdnRes.json();
        setUploadState((s) => ({ ...s, progress: 'Confirming…' }));
        await confirmCloudinaryUpload(session.accessToken, {
          secureUrl: cdnData.secure_url,
          publicId: cdnData.public_id,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          category: 'assets',
        });
      }
      setUploadState((s) => ({ ...s, progress: '' }));
      loadAssets();
    } catch (e: any) {
      push({ title: e.message || 'Upload failed', tone: 'error' });
    } finally {
      setUploadState((s) => ({ ...s, uploading: false, dragging: false, progress: '' }));
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setUploadState((s) => ({ ...s, dragging: true }));
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    setUploadState((s) => ({ ...s, dragging: false }));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setUploadState((s) => ({ ...s, dragging: false }));
    handleFiles(e.dataTransfer.files);
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(id);
  }

  async function executeDelete(id: string) {
    if (!session) return;
    setDeleting(true);
    try {
      await deleteAsset(session.accessToken, id);
      setPreview(null);
      loadAssets();
    } catch (e: any) {
      push({ title: e.message || 'Failed to delete asset', tone: 'error' });
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  }

  function copyUrl(url: string, e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Assets</h1>
        <button
          onClick={loadAssets}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface-variant hover:text-foreground border border-border rounded-lg hover:border-border/60 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Upload zone */}
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
                    onClick={() => setUploadState((s) => ({ ...s, provider: p }))}
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
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {(['all', 'r2', 'cloudinary'] as ProviderFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setProviderFilter(f)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              providerFilter === f
                ? 'border-accent text-accent'
                : 'border-transparent text-on-surface-variant hover:text-foreground'
            }`}
          >
            {f === 'all' ? `All (${assets.length})` : f === 'r2' ? `R2 (${assets.filter((a) => a.storageProvider === StorageProvider.R2).length})` : `Cloudinary (${assets.filter((a) => a.storageProvider === StorageProvider.CLOUDINARY).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-on-surface-variant text-sm">Loading…</div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon size={40} className="text-on-surface-variant mb-3" />
          <p className="text-on-surface-variant text-sm">No assets yet</p>
          <p className="text-on-surface-variant text-xs mt-1">Upload files to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setPreview(asset)}
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
                  onClick={(e) => copyUrl(asset.url, e)}
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
      )}

      {preview && (
        <PreviewModal
          asset={preview}
          assets={filteredAssets}
          onClose={() => setPreview(null)}
          onDelete={handleDelete}
          onNavigate={setPreview}
        />
      )}

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Delete asset"
        message="This asset will be permanently deleted and cannot be recovered."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => confirmDeleteId && executeDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
