/**
 * Renders the plain-text job description format: paragraphs, plus lines that
 * start with "- " as bullet lists. Short lines before a list become subheadings.
 */
export function RichText({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const blocks: ({ kind: 'p' | 'h'; text: string } | { kind: 'ul'; items: string[] })[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;
    if (/^[-•*]\s+/.test(line)) {
      const item = line.replace(/^[-•*]\s+/, '');
      const last = blocks[blocks.length - 1];
      if (last && last.kind === 'ul') last.items.push(item);
      else blocks.push({ kind: 'ul', items: [item] });
      continue;
    }
    const next = lines.slice(i + 1).find((l) => l.trim());
    const isHeading = line.length < 60 && !/[.!?]$/.test(line) && !!next && /^[-•*]\s+/.test(next.trim());
    blocks.push({ kind: isHeading ? 'h' : 'p', text: line.replace(/:$/, '') });
  }

  return (
    <div className="space-y-4 leading-relaxed text-ink-soft">
      {blocks.map((b, i) =>
        b.kind === 'ul' ? (
          <ul key={i} className="space-y-2">
            {b.items.map((item, j) => (
              <li key={j} className="flex gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-ink/40" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : b.kind === 'h' ? (
          <h3 key={i} className="pt-2 font-semibold text-ink">
            {b.text}
          </h3>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </div>
  );
}
