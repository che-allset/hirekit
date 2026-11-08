'use client';

import { useState } from 'react';
import { saveNotes } from '../../actions';
import type { Dict } from '@/i18n';

export function NotesForm({ id, initial, t }: { id: string; initial: string; t: Dict['dash']['candidates'] }) {
  const [notes, setNotes] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const dirty = notes !== initial && status !== 'saved';

  return (
    <form
      className="mt-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus('saving');
        try {
          const res = await saveNotes(id, notes);
          setStatus(res.error ? 'error' : 'saved');
        } catch {
          setStatus('error');
        }
      }}
    >
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setStatus('idle');
        }}
        rows={6}
        className="input resize-y"
        placeholder={t.notesPh}
        aria-label={t.notes}
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-ink-mute" aria-live="polite">
          {status === 'saved' ? t.saved : status === 'error' ? t.couldNotSave : dirty ? t.unsaved : ''}
        </span>
        <button type="submit" disabled={status === 'saving'} className="btn-ghost px-3 py-1.5 text-xs">
          {status === 'saving' ? t.saving : t.saveNotes}
        </button>
      </div>
    </form>
  );
}
