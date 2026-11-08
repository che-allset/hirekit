export type Stage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
export type Verdict = 'strong' | 'possible' | 'weak';
export type AiStatus = 'pending' | 'done' | 'failed';

export const STAGES: { key: Stage; label: string }[] = [
  { key: 'applied', label: 'Applied' },
  { key: 'screening', label: 'Screening' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
];

export const WORK_MODES = ['On-site', 'Hybrid', 'Remote'] as const;
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  tagline: string | null;
  website: string | null;
  brand_color: string;
  /** Dashboard language, used for the recruiter's notification emails (migration 003). */
  locale?: string;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  location: string | null;
  work_mode: string;
  employment_type: string;
  salary_range: string | null;
  description: string;
  requirements: string;
  status: 'open' | 'closed';
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  cover_letter: string | null;
  cv_path: string | null;
  stage: Stage;
  ai_status: AiStatus;
  ai_score: number | null;
  ai_verdict: Verdict | null;
  ai_summary: string | null;
  ai_strengths: string[];
  ai_gaps: string[];
  ai_questions: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PlanKey = 'trial' | 'starter' | 'growth' | 'scale';

export interface BillingRow {
  company_id: string;
  plan: PlanKey;
  billing_interval: 'month' | 'year' | null;
  status: string;
  trial_ends_at: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export type IntegrationProvider = 'google' | 'microsoft' | 'zoom';
export type MeetingType = 'google_meet' | 'teams' | 'zoom' | 'custom';

export interface Interview {
  id: string;
  company_id: string;
  application_id: string;
  meeting_type: MeetingType;
  calendar: 'google' | 'microsoft' | null;
  starts_at: string;
  duration_min: number;
  join_url: string | null;
  calendar_event_id: string | null;
  zoom_meeting_id: string | null;
  status: 'scheduled' | 'cancelled';
  created_at: string;
}
