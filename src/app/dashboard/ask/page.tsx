import { requireCompany } from '@/lib/company';
import { PageHeader } from '../_components/ui';
import { AskPanel } from './AskPanel';
import { getDict } from '@/i18n/server';
import { fmt } from '@/i18n';

export default async function AskPage() {
  const { supabase, company } = await requireCompany();
  const { locale, t } = getDict();
  const [{ data: jobs }, { count }] = await Promise.all([
    supabase.from('jobs').select('id,title').eq('company_id', company.id).order('created_at', { ascending: false }),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.dash.ask.title}
        sub={fmt(t.dash.ask.sub, { n: count ?? 0 })}
      />
      <AskPanel key={locale} jobs={(jobs ?? []) as { id: string; title: string }[]} t={t.dash.ask} />
    </div>
  );
}
