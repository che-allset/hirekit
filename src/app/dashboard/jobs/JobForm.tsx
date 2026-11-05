'use client';

import { useState } from 'react';
import { EMPLOYMENT_TYPES, WORK_MODES, type Job } from '@/lib/types';
import { deleteJob, generateJobDraft, saveJob, type JobInput } from '../actions';

export function JobForm({ job }: { job?: Job }) {
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

  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) => setValues((v) => ({ ...v, [key]: value }));

  async function onDraft() {
    setError(null);
    setDrafting(true);
    const res = await generateJobDraft({
      title: values.title,
      location: values.location,
      workMode: values.work_mode,
      notes,
    });
    setDrafting(false);
    if (res.error) return setError(res.error);
    setValues((v) => ({ ...v, description: res.description ?? v.description, requirements: res.requirements ?? v.requirements }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await saveJob(job?.id ?? null, values);
    // saveJob redirects on success
    if (res?.error) setError(res.error);
    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="title">Job title</label>
            <input
              id="title"
              className="input"
              required
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="department">Department</label>
              <input id="department" className="input" value={values.department} onChange={(e) => set('department', e.target.value)} placeholder="Engineering" />
            </div>
            <div>
              <label className="label" htmlFor="location">Location</label>
              <input id="location" className="input" value={values.location} onChange={(e) => set('location', e.target.value)} placeholder="Berlin" />
            </div>
            <div>
              <label className="label" htmlFor="work_mode">Work mode</label>
              <select id="work_mode" className="input" value={values.work_mode} onChange={(e) => set('work_mode', e.target.value)}>
                {WORK_MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="employment_type">Employment type</label>
              <select id="employment_type" className="input" value={values.employment_type} onChange={(e) => set('employment_type', e.target.value)}>
                {EMPLOYMENT_TYPES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="salary_range">Salary range <span className="font-normal text-ink-mute">(optional, recommended)</span></label>
            <input id="salary_range" className="input" value={values.salary_range} onChange={(e) => set('salary_range', e.target.value)} placeholder="€65–80k" />
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="description">Job description</label>
            <textarea
              id="description"
              rows={12}
              className="input resize-y leading-relaxed"
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={'Intro paragraph…\n\nWhat you will do\n- …\n- …'}
            />
            <p className="mt-1.5 text-xs text-ink-mute">Start lines with “- ” to make bullet points.</p>
          </div>
          <div>
            <label className="label" htmlFor="requirements">Must-have requirements</label>
            <textarea
              id="requirements"
              rows={6}
              className="input resize-y leading-relaxed"
              value={values.requirements}
              onChange={(e) => set('requirements', e.target.value)}
              placeholder={'- 5+ years with TypeScript\n- Experience running Postgres in production'}
            />
            <p className="mt-1.5 text-xs text-ink-mute">
              The AI scores every applicant against this list. Be specific.
            </p>
          </div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-2xl bg-ink p-6 text-white">
          <p className="flex items-center gap-2 font-semibold">
            <span className="text-lime-accent">✦</span> Draft with AI
          </p>
          <p className="mt-1 text-sm text-white/70">
            Add a title and a few notes. Claude writes an inclusive job post and a must-have list.
          </p>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-lime-accent/50"
            placeholder="e.g. small team, owns the API, Postgres + Node, mentoring 2 juniors, German a plus"
          />
          <button
            type="button"
            onClick={onDraft}
            disabled={drafting}
            className="btn mt-3 w-full bg-lime-accent text-ink hover:brightness-95"
          >
            {drafting ? 'Writing…' : values.description ? 'Rewrite with AI' : 'Write it for me'}
          </button>
        </section>

        <section className="card space-y-4 p-6">
          <label className="flex items-center justify-between gap-3 text-sm font-medium">
            Accepting applications
            <input
              type="checkbox"
              className="h-5 w-5 accent-[#4A45E0]"
              checked={values.status === 'open'}
              onChange={(e) => set('status', e.target.checked ? 'open' : 'closed')}
            />
          </label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? 'Saving…' : job ? 'Save changes' : 'Publish job'}
          </button>
          {job && (
            <button
              type="button"
              onClick={async () => {
                if (confirm('Delete this job and all its applications? This cannot be undone.')) await deleteJob(job.id);
              }}
              className="w-full text-center text-xs text-red-600 hover:underline"
            >
              Delete job
            </button>
          )}
        </section>
      </aside>
    </form>
  );
}
