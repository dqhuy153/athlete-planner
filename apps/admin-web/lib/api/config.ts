import { apiFetch } from './_client';

export interface AppConfigEntry {
  key: string;
  value: any;
  label?: string | null;
}

export function getAppConfigs(accessToken: string): Promise<AppConfigEntry[]> {
  return apiFetch('/admin/config', accessToken);
}

export function updateAppConfigKey(
  accessToken: string,
  key: string,
  value: any,
  label?: string,
): Promise<AppConfigEntry> {
  return apiFetch(`/admin/config/${key}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify({ value, label }),
  });
}
