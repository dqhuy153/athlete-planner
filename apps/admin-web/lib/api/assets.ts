import type { Asset } from '@athlete-planner/contracts';
import { apiFetch } from './_client';

export function getAssets(
  accessToken: string,
  params?: { provider?: string; category?: string },
): Promise<Asset[]> {
  const query = new URLSearchParams();
  if (params?.provider) query.set('provider', params.provider);
  if (params?.category) query.set('category', params.category);
  return apiFetch(`/admin/assets?${query}`, accessToken);
}

export function deleteAsset(accessToken: string, id: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/admin/assets/${id}`, accessToken, { method: 'DELETE' });
}

export function presignAssetUpload(
  accessToken: string,
  data: { contentType: string; ext: string; category?: string },
): Promise<{ uploadUrl: string; key: string }> {
  const q = new URLSearchParams({ contentType: data.contentType, ext: data.ext });
  if (data.category) q.set('category', data.category);
  return apiFetch(`/admin/assets/presign-upload?${q}`, accessToken);
}

export function confirmAssetUpload(
  accessToken: string,
  data: { key: string; fileName: string; mimeType?: string; size?: number; category?: string; userId?: string },
): Promise<Asset> {
  return apiFetch('/admin/assets/confirm-upload', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getCloudinaryPresign(
  accessToken: string,
  data: { contentType: string; category?: string },
): Promise<{ signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string; publicId: string }> {
  const q = new URLSearchParams({ contentType: data.contentType });
  if (data.category) q.set('category', data.category);
  return apiFetch(`/admin/assets/cloudinary-presign?${q}`, accessToken);
}

export function confirmCloudinaryUpload(
  accessToken: string,
  data: { secureUrl: string; publicId?: string; fileName: string; mimeType?: string; size?: number; category?: string; userId?: string },
): Promise<Asset> {
  return apiFetch('/admin/assets/confirm-cloudinary', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Legacy: kept for backward compat during transition
export function getUploadUrl(
  accessToken: string,
  data: { filename: string; contentType: string },
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  return apiFetch('/admin/assets/upload-url', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getStorageStats(
  accessToken: string,
): Promise<{ totalBytes: number; assetCount: number }> {
  return apiFetch('/admin/assets/storage-stats', accessToken);
}
