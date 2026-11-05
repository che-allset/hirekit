import type { Company } from '@/lib/types';
import { initials } from '@/lib/utils';

export function CompanyBadge({ company, size = 'md' }: { company: Company; size?: 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-14 w-14 text-xl rounded-2xl' : 'h-9 w-9 text-sm rounded-xl';
  return (
    <span
      className={`flex flex-none items-center justify-center font-semibold text-white ${dims}`}
      style={{ backgroundColor: company.brand_color }}
      aria-hidden="true"
    >
      {initials(company.name)}
    </span>
  );
}
