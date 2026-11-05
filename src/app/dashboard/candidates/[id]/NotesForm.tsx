'use client';

import { useState } from 'react';
import { saveNotes } from '../../actions';

export function NotesForm({ id, initial }: { id: string; initial: string }) {
  const [notes, setNotes] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const dirty = notes !== initial && status !== 'saved';

  return (
    <form
      className="mt-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus('saving');
        const res = await saveNotes(id, notes);
        setStatus(res.error ? 'error' : 'saved');
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
        placeholder="Impressions, interview feedback, next steps…"
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-ink-mute">
          {status === 'saved' ? 'Saved ✓' : status === 'error' ? 'Could not save' : dirty ? 'Unsaved changes' : ''}
        </span>
        <button type="submit" disabled={status === 'saving'} className="btn-ghost px-3 py-1.5 text-xs">
          {status === 'saving' ? 'Saving…' : 'Save notes'}
        </button>
      </div>
    </form>
  );
}
