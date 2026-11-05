import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_SLUG } from '@/lib/demo';
import { DEMO_APPLICATIONS, DEMO_COMPANY, DEMO_JOBS } from '@/lib/seed-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Creates (or resets) the demo workspace. Protected by SEED_SECRET.
 * Visit /api/seed?secret=YOUR_SECRET once after deploying.
 */
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret');
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const admin = createAdminClient();

  // 1. Demo user (create, or find and reset password)
  let userId: string | null = null;
  const created = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (created.data.user) {
    userId = created.data.user.id;
  } else {
    const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const existing = list.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);
    if (!existing) return NextResponse.json({ error: created.error?.message ?? 'Could not create demo user' }, { status: 500 });
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD });
  }

  // 2. Fresh company (cascade removes old jobs + applications)
  await admin.from('companies').delete().eq('owner_id', userId);
  await admin.from('companies').delete().eq('slug', DEMO_SLUG);
  const { data: company, error: companyError } = await admin
    .from('companies')
    .insert({ owner_id: userId, slug: DEMO_SLUG, ...DEMO_COMPANY })
    .select('id')
    .single();
  if (companyError || !company) {
    return NextResponse.json({ error: companyError?.message ?? 'Company insert failed' }, { status: 500 });
  }

  // 3. Jobs
  const now = Date.now();
  const jobIds: Record<string, string> = {};
  for (const j of DEMO_JOBS) {
    const { key, daysAgo, ...fields } = j;
    const { data, error } = await admin
      .from('jobs')
      .insert({ ...fields, company_id: company.id, created_at: new Date(now - daysAgo * 864e5).toISOString() })
      .select('id')
      .single();
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Job insert failed' }, { status: 500 });
    jobIds[key] = data.id;
  }

  // 4. Applications with pre-computed AI assessments (no API cost for demo data)
  const rows = DEMO_APPLICATIONS.map((a) => ({
    job_id: jobIds[a.job],
    company_id: company.id,
    full_name: a.full_name,
    email: a.email,
    phone: a.phone ?? null,
    linkedin_url: a.linkedin_url ?? null,
    cover_letter: a.cover_letter,
    stage: a.stage,
    ai_status: 'done',
    ai_score: a.score,
    ai_verdict: a.verdict,
    ai_summary: a.summary,
    ai_strengths: a.strengths,
    ai_gaps: a.gaps,
    ai_questions: a.questions,
    notes: a.notes ?? null,
    created_at: new Date(now - a.hoursAgo * 36e5).toISOString(),
  }));
  const { error: appsError } = await admin.from('applications').insert(rows);
  if (appsError) return NextResponse.json({ error: appsError.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    message: 'Demo workspace ready.',
    login: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    careersPage: `/careers/${DEMO_SLUG}`,
    widgetDemo: '/demo.html',
  });
}
