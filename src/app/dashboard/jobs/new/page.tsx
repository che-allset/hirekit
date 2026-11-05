import Link from 'next/link';
import { PageHeader } from '../../_components/ui';
import { JobForm } from '../JobForm';

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/dashboard/jobs" className="text-sm text-ink-mute hover:text-ink">← Jobs</Link>
      <div className="mt-3">
        <PageHeader title="New job" sub="Publish a role to your careers page and website widget." />
      </div>
      <JobForm />
    </div>
  );
}
