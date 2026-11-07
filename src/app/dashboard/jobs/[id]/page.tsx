import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCompany } from '@/lib/company';
import type { Job } from '@/lib/types';
import { PageHeader } from '../../_components/ui';
import { JobForm } from '../JobForm';
import { getDict } from '@/i18n/server';

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const { supabase, company } = await requireCompany();
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .eq('company_id', company.id)
    .maybeSingle();
  if (!data) notFound();
  const job = data as Job;
  const { locale, t } = getDict();

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/dashboard/jobs" className="text-sm text-ink-mute hover:text-ink">{t.dash.jobs.back}</Link>
      <div className="mt-3">
        <PageHeader title={job.title} sub={t.dash.jobs.editSub} />
      </div>
      <JobForm job={job} t={t.dash} locale={locale} />
    </div>
  );
}
