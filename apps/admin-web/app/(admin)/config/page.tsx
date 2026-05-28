'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAppConfig, updateAppConfig } from '@/lib/api';
import { Save } from 'lucide-react';

export default function ConfigPage() {
  const { session } = useAuth();
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session) return;
    loadConfig();
  }, [session]);

  async function loadConfig() {
    setLoading(true);
    try {
      const res = await getAppConfig(session!.accessToken);
      setConfig(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    try {
      await updateAppConfig(session.accessToken, config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  function updateValue(key: string, value: any) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">App Config</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save size={16} />
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <div className="text-on-surface-variant">Loading...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(config).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-on-surface mb-1">{key}</label>
              {typeof value === 'boolean' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateValue(key, e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-on-surface-variant">{value ? 'Enabled' : 'Disabled'}</span>
                </div>
              ) : typeof value === 'number' ? (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateValue(key, Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-background border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <input
                  type="text"
                  value={String(value ?? '')}
                  onChange={(e) => updateValue(key, e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          ))}
          {Object.keys(config).length === 0 && (
            <p className="text-on-surface-variant text-sm">No config entries yet. Add them via the API.</p>
          )}
        </div>
      )}
    </div>
  );
}
