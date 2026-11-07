'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { askAboutCandidates } from '../actions';

type Turn = {
  question: string;
  jobTitle: string | null;
  answer?: string;
  candidates?: { id: string; reason: string }[];
  names?: Record<string, string>;
  error?: string;
};

const SUGGESTIONS = [
  'Who should I interview first, and why?',
  'Who has customer-facing experience and speaks German?',
  'Compare my top three engineering candidates.',
  'Which strong candidates haven’t been moved past Applied yet?',
];

export function AskPanel({ jobs }: { jobs: { id: string; title: string }[] }) {
  const [question, setQuestion] = useState('');
  const [jobId, setJobId] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  async function ask(q: string) {
    const text = q.trim();
    if (!text || pending) return;
    const jobTitle = jobs.find((j) => j.id === jobId)?.title ?? null;
    setTurns((t) => [...t, { question: text, jobTitle }]);
    setQuestion('');
    setPending(true);
    const res = await askAboutCandidates(text, jobId || null);
    setPending(false);
    setTurns((t) => {
      const copy = [...t];
      const last = copy[copy.length - 1]!;
      copy[copy.length - 1] = res.error
        ? { ...last, error: res.error }
        : { ...last, answer: res.result!.answer, candidates: res.result!.candidates, names: res.result!.names };
      return copy;
    });
  }

  return (
    <div>
      {turns.length === 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="rounded-[14px] border border-graphite/10 bg-white p-5 text-left font-bold shadow-card transition-colors hover:border-graphite/40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {turns.map((t, i) => (
          <div key={i} className="space-y-3">
            <div className="ml-auto max-w-[85%] rounded-[14px] rounded-br-[4px] bg-graphite px-5 py-3.5 text-white sm:max-w-[70%]">
              {t.question}
              {t.jobTitle && <p className="mt-1 text-xs text-white/60">About: {t.jobTitle}</p>}
            </div>

            <div className="max-w-[95%] rounded-[14px] rounded-bl-[4px] bg-white p-5 shadow-card sm:max-w-[85%]">
              {!t.answer && !t.error && (
                <p className="flex items-center gap-3 text-graphite-600">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-graphite/15 border-t-graphite" />
                  Reading your candidates…
                </p>
              )}
              {t.error && <p className="text-flag">{t.error}</p>}
              {t.answer && (
                <>
                  <p className="whitespace-pre-line leading-relaxed">{t.answer}</p>
                  {t.candidates && t.candidates.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {t.candidates.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/dashboard/candidates/${c.id}`}
                            className="flex flex-col gap-0.5 rounded-[10px] border border-graphite/10 px-4 py-3 hover:border-graphite/40 sm:flex-row sm:items-center sm:gap-3"
                          >
                            <span className="font-bold">{t.names?.[c.id] ?? 'Candidate'}</span>
                            <span className="text-sm text-graphite-600">{c.reason}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="sticky bottom-4 mt-8 rounded-[16px] border border-graphite/10 bg-white p-3 shadow-lift"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={500}
            placeholder="Ask about your candidates…"
            className="input flex-1 border-transparent focus:border-graphite"
            aria-label="Your question"
          />
          <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="input sm:w-56" aria-label="Limit to a role">
            <option value="">All roles</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <button type="submit" disabled={pending || !question.trim()} className="btn-signal">
            {pending ? 'Thinking…' : 'Ask'}
          </button>
        </div>
        <p className="px-2 pt-2 text-xs text-graphite-400">
          Answers use only job-relevant information. Questions about age, gender, nationality and similar are declined.
        </p>
      </form>
    </div>
  );
}
