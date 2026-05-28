'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAssets, getUploadUrl } from '@/lib/api';
import type { Asset } from '@athlete-planner/contracts';
import { Upload, Copy, Image } from 'lucide-react';

export default function AssetsPage() {
  const { session } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file: File) {
    if (!session) return;
    setUploading(true);
    try {
      // Get presigned URL
      const { uploadUrl, publicUrl } = await getUploadUrl(session.accessToken, {
        filename: file.name,
        contentType: file.type,
      });
      // Upload to storage
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      alert(`Uploaded! URL: ${publicUrl}`);
      loadAssets();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Assets</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
      />

      {loading ? (
        <div className="text-on-surface-variant">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-lg border border-outline bg-surface overflow-hidden group">
              <div className="aspect-square bg-surface-variant flex items-center justify-center">
                {asset.mimeType?.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" />
                ) : (
                  <Image size={32} className="text-on-surface-variant" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-on-surface truncate" title={asset.fileName}>{asset.fileName}</p>
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => copyToClipboard(asset.url)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 text-xs text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-variant transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
          {assets.length === 0 && (
            <p className="col-span-full text-on-surface-variant text-sm">No assets yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
