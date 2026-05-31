'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAppConfigs, updateAppConfigKey } from '@/lib/api';
import type { AppConfigEntry } from '@/lib/api';
import {
  Save, RotateCcw, Shield, Zap, CreditCard, Info,
  Check, AlertTriangle,
} from 'lucide-react';

// ── Config schema ─────────────────────────────────────────────────────────────

type ConfigType = 'number' | 'boolean' | 'string';

interface ConfigDef {
  key: string;
  label: string;
  description: string;
  type: ConfigType;
  defaultValue: string | number | boolean;
  unit?: string;
  min?: number;
  max?: number;
}

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  items: ConfigDef[];
}

const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: 'free-tier',
    title: 'Free Tier Limits',
    description: 'Resource limits enforced for FREE-tier users.',
    icon: <Shield size={18} className="text-accent" />,
    items: [
      { key: 'FREE_TIER_MAX_EXERCISES', label: 'Max Private Exercises', description: 'Maximum number of user-created private exercises.', type: 'number', defaultValue: 10, min: 1, max: 100 },
      { key: 'FREE_TIER_PLANNING_DAYS', label: 'Planning Horizon', description: 'How many days ahead FREE users can plan.', type: 'number', defaultValue: 14, unit: 'days', min: 1, max: 90 },
      { key: 'FREE_TIER_HISTORY_DAYS', label: 'History Retention', description: 'Rolling window of schedule history available to FREE users.', type: 'number', defaultValue: 30, unit: 'days', min: 7, max: 365 },
      { key: 'FREE_TIER_MAX_ITEMS_PER_DAY', label: 'Max Items per Day', description: 'Maximum schedule items per day for FREE users.', type: 'number', defaultValue: 8, min: 1, max: 50 },
    ],
  },
  {
    id: 'features',
    title: 'Feature Flags',
    description: 'Toggle product features on or off globally.',
    icon: <Zap size={18} className="text-warning" />,
    items: [
      { key: 'GARMIN_EXPORT_ENABLED', label: 'Garmin FIT Export', description: 'Allow PRO users to export workouts as Garmin FIT files.', type: 'boolean', defaultValue: true },
      { key: 'AI_GENERATE_ENABLED', label: 'Content Generation', description: 'Allow admins to generate exercise content via AI.', type: 'boolean', defaultValue: true },
      { key: 'BLOG_ENABLED', label: 'Blog Section', description: 'Show the blog section in the web app navigation.', type: 'boolean', defaultValue: true },
      { key: 'MAINTENANCE_MODE', label: 'Maintenance Mode', description: 'Block all user access and show maintenance page.', type: 'boolean', defaultValue: false },
    ],
  },
  {
    id: 'payment',
    title: 'Payment Settings',
    description: 'Pricing and currency configuration.',
    // TODO: design token needed — #7C3AED (purple) not in MA design system
    icon: <CreditCard size={18} className="text-[#7C3AED]" />,
    items: [
      { key: 'PRO_PRICE_VND', label: 'PRO Price', description: 'One-time PRO tier price charged via PayOS.', type: 'number', defaultValue: 199000, unit: 'VND', min: 1000 },
      { key: 'CURRENCY', label: 'Currency Code', description: 'ISO 4217 currency code for payment display.', type: 'string', defaultValue: 'VND' },
    ],
  },
  {
    id: 'app-info',
    title: 'App Info',
    description: 'General application metadata.',
    icon: <Info size={18} className="text-on-surface-variant" />,
    items: [
      { key: 'APP_NAME', label: 'Application Name', description: 'Display name used in the app UI and emails.', type: 'string', defaultValue: 'The Sport Notebook' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDefault(def: ConfigDef): any {
  return def.defaultValue;
}

// ── ConfigInput ───────────────────────────────────────────────────────────────

interface ConfigInputProps {
  def: ConfigDef;
  value: any;
  onChange: (val: any) => void;
  onSave?: (val: any) => void;
}

function ConfigInput({ def, value, onChange, onSave }: ConfigInputProps) {
  if (def.type === 'boolean') {
    const checked = value === true || value === 'true';
    return (
      <button
        type="button"
        onClick={() => { const next = !checked; onChange(next); onSave?.(next); }}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
          checked ? 'bg-accent' : 'bg-surface-3'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    );
  }
  if (def.type === 'number') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value ?? def.defaultValue}
          min={def.min}
          max={def.max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-28 px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {def.unit && <span className="text-sm text-on-surface-variant">{def.unit}</span>}
      </div>
    );
  }
  return (
    <input
      type="text"
      value={value ?? String(def.defaultValue)}
      onChange={(e) => onChange(e.target.value)}
      className="w-full max-w-xs px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ConfigPage() {
  const { session } = useAuth();
  const [configMap, setConfigMap] = useState<Record<string, any>>({});
  const [pendingMap, setPendingMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // key being saved
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    loadConfig();
  }, [session]);

  async function loadConfig() {
    setLoading(true);
    setError('');
    try {
      const entries = await getAppConfigs(session!.accessToken);
      const map: Record<string, any> = {};
      for (const e of entries) map[e.key] = e.value;
      setConfigMap(map);
      setPendingMap(map);
    } catch (e: any) {
      setError(e.message || 'Failed to load config.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key: string, value: any) {
    setPendingMap((m) => ({ ...m, [key]: value }));
  }

  function isDirty(key: string): boolean {
    // Deep compare using JSON
    return JSON.stringify(pendingMap[key]) !== JSON.stringify(configMap[key]);
  }

  async function saveKey(def: ConfigDef, overrideValue?: any) {
    if (!session) return;
    const value = overrideValue !== undefined ? overrideValue : (pendingMap[def.key] ?? def.defaultValue);
    setSaving(def.key);
    setError('');
    try {
      await updateAppConfigKey(session.accessToken, def.key, value, def.label);
      setConfigMap((m) => ({ ...m, [def.key]: value }));
      setSavedKeys((s) => new Set([...s, def.key]));
      setTimeout(() => setSavedKeys((s) => { const n = new Set(s); n.delete(def.key); return n; }), 2000);
    } catch (e: any) {
      setError(e.message || `Failed to save ${def.key}.`);
    } finally {
      setSaving(null);
    }
  }

  function resetKey(def: ConfigDef) {
    setPendingMap((m) => ({ ...m, [def.key]: def.defaultValue }));
  }

  if (loading) {
    return (
      <div className="p-8 text-on-surface-variant text-sm">Loading config…</div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">App Config</h1>
        <p className="text-sm text-on-surface-variant mt-1">Runtime configuration for The Sport Notebook.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {CONFIG_SECTIONS.map((section) => (
          <div key={section.id} className="rounded-[20px] border border-border bg-surface overflow-hidden">
            {/* Section header */}
            <div className="flex items-start gap-3 px-5 py-4 border-b border-border">
              <div className="mt-0.5">{section.icon}</div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">{section.description}</p>
              </div>
            </div>

            {/* Config items */}
            <div className="divide-y divide-surface-2">
              {section.items.map((def) => {
                const dirty = isDirty(def.key);
                const saved = savedKeys.has(def.key);
                const isSaving = saving === def.key;

                return (
                  <div key={def.key} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{def.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{def.description}</p>
                      <p className="text-[10px] text-on-surface-variant/60 font-mono mt-1">{def.key}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ConfigInput
                        def={def}
                        value={pendingMap[def.key] ?? configMap[def.key]}
                        onChange={(val) => handleChange(def.key, val)}
                        onSave={(val) => {
                          if (def.type === 'boolean') {
                            handleChange(def.key, val);
                            saveKey(def, val);
                          }
                        }}
                      />
                      {def.type !== 'boolean' && (
                        <>
                          {dirty && (
                            <button
                              onClick={() => resetKey(def)}
                              title="Reset to saved"
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface-variant hover:bg-surface-3 transition-colors"
                            >
                              <RotateCcw size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => saveKey(def)}
                            disabled={!dirty || isSaving}
                            title="Save"
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              saved
                                ? 'bg-success/10 text-success border border-success/20'
                                : dirty
                                ? 'bg-accent text-black hover:opacity-90'
                                : 'border border-border text-on-surface-variant cursor-default'
                            }`}
                          >
                            {saved ? (
                              <><Check size={12} /> Saved</>
                            ) : isSaving ? (
                              'Saving…'
                            ) : (
                              <><Save size={12} /> Save</>
                            )}
                          </button>
                        </>
                      )}
                      {def.type === 'boolean' && saved && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <Check size={12} /> Saved
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
