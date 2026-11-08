/** Builds a minimal iCalendar invite (RFC 5545) that opens in any calendar app. */
export function buildIcs(e: {
  uid: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string | null;
  organizer?: { name: string; email?: string | null };
  attendee?: { name: string; email: string };
}) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
  // Lines longer than 75 octets must be folded.
  const fold = (line: string) => line.match(/.{1,73}/g)!.join('\r\n ');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HireKit//Interviews//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.uid}@hirekit`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(e.end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.description)}`,
    ...(e.location ? [`LOCATION:${esc(e.location)}`, ...(/^https?:/.test(e.location) ? [`URL:${e.location}`] : [])] : []),
    ...(e.organizer?.email ? [`ORGANIZER;CN=${esc(e.organizer.name)}:mailto:${e.organizer.email}`] : []),
    ...(e.attendee ? [`ATTENDEE;CN=${esc(e.attendee.name)};ROLE=REQ-PARTICIPANT:mailto:${e.attendee.email}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
