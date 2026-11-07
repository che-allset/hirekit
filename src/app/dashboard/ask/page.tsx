import { requireCompany } from '@/lib/company';
import { PageHeader } from '../_components/ui';
import { AskPanel } from './AskPanel';

export default async function AskPage() {
  const { supabase, company } = await requireCompany();
  const [{ data: jobs }, { count }] = await Promise.all([
    supabase.from('jobs').select('id,title').eq('company_id', company.id).order('created_at', { ascending: false }),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Ask your pipeline"
        sub={`Ask anything about your ${count ?? 0} candidates in plain language. Answers come only from their applications and your notes.`}
      />
      <AskPanel jobs={(jobs ?? []) as { id: string; title: string }[]} />
    </div>
  );
}
