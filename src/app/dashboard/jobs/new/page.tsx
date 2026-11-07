import Link from 'next/link';
import { PageHeader } from '../../_components/ui';
import { JobForm } from '../JobForm';
import { getDict } from '@/i18n/server';

export default function NewJobPage() {
  const { locale, t } = getDict();
  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/dashboard/jobs" className="text-sm text-ink-mute hover:text-ink">{t.dash.jobs.back}</Link>
      <div className="mt-3">
        <PageHeader title={t.dash.jobs.newTitle} sub={t.dash.jobs.newSub} />
      </div>
      <JobForm t={t.dash} locale={locale} />
    </div>
  );
}
