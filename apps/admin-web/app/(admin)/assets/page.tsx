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
import { RefreshCw } from 'lucide-react';
import { ConfirmModal } from '@athlete-planner/ui';
import { useToast } from '@/components/ui/toast';
import { AssetUploadZone, type UploadState, type UploadProvider } from './components/AssetUploadZone';
import { AssetFilterTabs, type ProviderFilter } from './components/AssetFilterTabs';
import { AssetGrid } from './components/AssetGrid';
import { AssetPreviewModal } from './components/AssetPreviewModal';
import { fileExt } from './components/AssetHelpers';

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

      <AssetUploadZone
        uploadState={uploadState}
        fileInputRef={fileInputRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onProviderChange={(provider: UploadProvider) => setUploadState((s) => ({ ...s, provider }))}
        onFileChange={handleFiles}
      />

      <AssetFilterTabs
        assets={assets}
        providerFilter={providerFilter}
        onChange={setProviderFilter}
      />

      {loading ? (
        <div className="text-on-surface-variant text-sm">Loading…</div>
      ) : (
        <AssetGrid
          assets={filteredAssets}
          onSelect={setPreview}
          onCopyUrl={copyUrl}
        />
      )}

      {preview && (
        <AssetPreviewModal
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
