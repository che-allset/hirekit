'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EMPLOYMENT_TYPES, WORK_MODES, type Job } from '@/lib/types';
import { deleteJob, generateJobDraft, saveJob, type JobInput } from '../actions';
import type { Dict, Locale } from '@/i18n';

export function JobForm({ job, t, locale }: { job?: Job; t: Dict['dash']; locale: Locale }) {
  const f = t.jobs.form;
  const [values, setValues] = useState<JobInput>({
    title: job?.title ?? '',
    department: job?.department ?? '',
    location: job?.location ?? '',
    work_mode: job?.work_mode ?? 'Hybrid',
    employment_type: job?.employment_type ?? 'Full-time',
    salary_range: job?.salary_range ?? '',
    description: job?.description ?? '',
    requirements: job?.requirements ?? '',
    status: job?.status ?? 'open',
  });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) => setValues((v) => ({ ...v, [key]: value }));

  async function onDraft() {
    setError(null);
    setDrafting(true);
    let res: Awaited<ReturnType<typeof generateJobDraft>>;
    try {
      res = await generateJobDraft({
        title: values.title,
        location: values.location,
        workMode: values.work_mode,
        notes,
        locale,
      });
    } catch {
      res = { error: t.errors.generic };
    } finally {
      setDrafting(false);
    }
    if (res.error) return setError(res.error);
    setValues((v) => ({ ...v, description: res.description ?? v.description, requirements: res.requirements ?? v.requirements }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await saveJob(job?.id ?? null, values);
      // saveJob redirects on success
      if (res?.error) setError(res.error);
    } catch (err) {
      // A redirect after a successful save is not an error.
      if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) throw err;
      setError(t.errors.generic);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="title">{f.title}</label>
            <input
              id="title"
              className="input"
              required
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={f.titlePh}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="department">{f.department}</label>
              <input id="department" className="input" value={values.department} onChange={(e) => set('department', e.target.value)} placeholder={f.departmentPh} />
            </div>
            <div>
              <label className="label" htmlFor="location">{f.location}</label>
              <input id="location" className="input" value={values.location} onChange={(e) => set('location', e.target.value)} placeholder={f.locationPh} />
            </div>
            <div>
              <label className="label" htmlFor="work_mode">{f.workMode}</label>
              <select id="work_mode" className="input" value={values.work_mode} onChange={(e) => set('work_mode', e.target.value)}>
                {WORK_MODES.map((m) => <option key={m} value={m}>{t.workModes[m] ?? m}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="employment_type">{f.employmentType}</label>
              <select id="employment_type" className="input" value={values.employment_type} onChange={(e) => set('employment_type', e.target.value)}>
                {EMPLOYMENT_TYPES.map((m) => <option key={m} value={m}>{t.employmentTypes[m] ?? m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="salary_range">{f.salary} <span className="font-normal text-ink-mute">{f.salaryHint}</span></label>
            <input id="salary_range" className="input" value={values.salary_range} onChange={(e) => set('salary_range', e.target.value)} placeholder="€65–80k" />
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="description">{f.description}</label>
            <textarea
              id="description"
              rows={12}
              className="input resize-y leading-relaxed"
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={f.descriptionPh}
            />
            <p className="mt-1.5 text-xs text-ink-mute">{f.descriptionHint}</p>
          </div>
          <div>
            <label className="label" htmlFor="requirements">{f.requirements}</label>
            <textarea
              id="requirements"
              rows={6}
              className="input resize-y leading-relaxed"
              value={values.requirements}
              onChange={(e) => set('requirements', e.target.value)}
              placeholder={'- 5+ years with TypeScript\n- Experience running Postgres in production'}
            />
            <p className="mt-1.5 text-xs text-ink-mute">
              {f.requirementsHint}
            </p>
          </div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-2xl bg-ink p-6 text-white">
          <p className="flex items-center gap-2 font-semibold">
            <span className="text-lime-accent">✦</span> {f.aiTitle}
          </p>
          <p className="mt-1 text-sm text-white/70">
            {f.aiBody}
          </p>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-lime-accent/50"
            placeholder={f.aiPh}
          />
          <button
            type="button"
            onClick={onDraft}
            disabled={drafting}
            className="btn mt-3 w-full bg-lime-accent text-ink hover:brightness-95"
          >
            {drafting ? f.aiWriting : values.description ? f.aiRewrite : f.aiWrite}
          </button>
        </section>

        <section className="card space-y-4 p-6">
          <label className="flex items-center justify-between gap-3 text-sm font-medium">
            {f.accepting}
            <input
              type="checkbox"
              className="h-5 w-5 accent-[#4A45E0]"
              checked={values.status === 'open'}
              onChange={(e) => set('status', e.target.checked ? 'open' : 'closed')}
            />
          </label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? f.saving : job ? f.save : f.publish}
          </button>
          {job && (
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                if (!confirm(f.confirmDelete)) return;
                setError(null);
                setDeleting(true);
                try {
                  const res = await deleteJob(job.id);
                  if (res?.error) {
                    setError(res.error);
                    setDeleting(false);
                  } else {
                    router.push('/dashboard/jobs');
                  }
                } catch {
                  setError(t.errors.saveFailed);
                  setDeleting(false);
                }
              }}
              className="w-full text-center text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              {deleting ? '…' : f.delete}
            </button>
          )}
        </section>
      </aside>
    </form>
  );
}
