'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Company } from '@/lib/types';
import { initials } from '@/lib/utils';
import { saveSettings } from '../actions';

const PRESETS = ['#4A45E0', '#0F766E', '#E11D48', '#EA580C', '#0E1116', '#2563EB'];

export function SettingsForm({ company }: { company: Company }) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: company.name,
    tagline: company.tagline ?? '',
    website: company.website ?? '',
    brand_color: company.brand_color,
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof values, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setStatus('idle');
  };

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setStatus('saving');
        const res = await saveSettings(values);
        if (res.error) {
          setError(res.error);
          setStatus('idle');
        } else {
          setStatus('saved');
          router.refresh();
        }
      }}
    >
      {/* Live preview */}
      <div className="overflow-hidden rounded-2xl border border-black/5">
        <div className="p-5 text-white" style={{ backgroundColor: values.brand_color }}>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-xs font-semibold">
              {initials(values.name || 'Co')}
            </span>
            <span className="text-sm font-semibold">{values.name || 'Your company'}</span>
          </div>
          <p className="mt-6 font-display text-2xl">Join {values.name || 'us'}</p>
          {values.tagline && <p className="mt-1 text-sm text-white/80">{values.tagline}</p>}
        </div>
        <div className="bg-paper p-4">
          <div className="flex items-center justify-between rounded-xl bg-white p-3 text-sm shadow-sm">
            <span className="font-medium">Example role</span>
            <span className="h-6 w-6 rounded-full" style={{ backgroundColor: values.brand_color }} />
          </div>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="name">Company name</label>
        <input id="name" className="input" value={values.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="tagline">Tagline</label>
        <input
          id="tagline"
          className="input"
          value={values.tagline}
          onChange={(e) => set('tagline', e.target.value)}
          placeholder="We build software that keeps Europe moving."
        />
      </div>
      <div>
        <label className="label" htmlFor="website">Website</label>
        <input
          id="website"
          className="input"
          value={values.website}
          onChange={(e) => set('website', e.target.value)}
          placeholder="https://example.com"
        />
      </div>
      <div>
        <span className="label">Brand colour</span>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Use ${c}`}
              onClick={() => set('brand_color', c)}
              className="h-8 w-8 rounded-full ring-offset-2 transition"
              style={{
                backgroundColor: c,
                boxShadow: values.brand_color.toLowerCase() === c.toLowerCase() ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : undefined,
              }}
            />
          ))}
          <input
            type="color"
            value={values.brand_color}
            onChange={(e) => set('brand_color', e.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-black/10 bg-white"
            aria-label="Custom colour"
          />
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={status === 'saving'} className="btn-primary w-full">
        {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save branding'}
      </button>
    </form>
  );
}
