import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { Job, Verdict } from './types';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/** Pull the forced tool call out of a Claude response. */
function toolInput(res: Anthropic.Messages.Message, name: string): Record<string, unknown> {
  for (const block of res.content) {
    if (block.type === 'tool_use' && block.name === name) {
      return block.input as Record<string, unknown>;
    }
  }
  throw new Error(`Claude did not return ${name}`);
}

const asStringList = (v: unknown, max: number): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, max) : [];

// ─────────────────────────────────────────────────────────────
// Candidate screening
// ─────────────────────────────────────────────────────────────

export interface Screening {
  score: number;
  verdict: Verdict;
  summary: string;
  strengths: string[];
  gaps: string[];
  questions: string[];
}

export interface CandidateInput {
  fullName: string;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  coverLetter?: string | null;
  cvPdfBase64?: string | null;
}

const SCREENING_SYSTEM = `You are a careful, fair recruiting assistant. You screen job applications against the employer's own requirements and give the hiring team a short, honest first read.

Rules:
- Judge ONLY job-relevant evidence: skills, experience, outcomes, qualifications, and how they match the stated requirements.
- Ignore and never mention name, gender, age, nationality, ethnicity, religion, marital status, photo, or anything else unrelated to the job.
- Do not reward keyword stuffing; look for concrete evidence.
- If information is missing (e.g. no CV), say so and score conservatively without inventing facts.
- You are advising a human. Never tell them to reject someone; describe fit and open questions.

Scoring guide: 80–100 strong match on most must-haves; 55–79 possible match with gaps worth exploring; 0–54 weak match for this specific role.`;

const SCREENING_TOOL: Anthropic.Messages.Tool = {
  name: 'record_assessment',
  description: 'Record the structured screening assessment for this application.',
  input_schema: {
    type: 'object',
    properties: {
      score: { type: 'integer', minimum: 0, maximum: 100, description: 'Overall fit for this role, 0-100.' },
      verdict: { type: 'string', enum: ['strong', 'possible', 'weak'] },
      summary: {
        type: 'string',
        description: 'One or two plain sentences a busy recruiter can read in 5 seconds.',
      },
      strengths: {
        type: 'array',
        items: { type: 'string' },
        description: 'Up to 3 concrete, evidence-based strengths relative to the requirements.',
      },
      gaps: {
        type: 'array',
        items: { type: 'string' },
        description: 'Up to 3 requirements that are missing or unclear.',
      },
      interview_questions: {
        type: 'array',
        items: { type: 'string' },
        description: '3 targeted interview questions that would resolve the open points.',
      },
    },
    required: ['score', 'verdict', 'summary', 'strengths', 'gaps', 'interview_questions'],
  },
};

function verdictFor(score: number): Verdict {
  if (score >= 80) return 'strong';
  if (score >= 55) return 'possible';
  return 'weak';
}

export async function screenCandidate(job: Job, candidate: CandidateInput): Promise<Screening> {
  const content: Anthropic.Messages.ContentBlockParam[] = [];

  if (candidate.cvPdfBase64) {
    content.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: candidate.cvPdfBase64 },
    });
  }

  content.push({
    type: 'text',
    text: `## Role
Title: ${job.title}
Department: ${job.department ?? 'n/a'}
Location: ${job.location ?? 'n/a'} (${job.work_mode}, ${job.employment_type})

### Job description
${job.description || 'n/a'}

### Must-have requirements (set by the hiring team)
${job.requirements || 'n/a'}

## Application
CV attached: ${candidate.cvPdfBase64 ? 'yes (see document above)' : 'no'}
LinkedIn: ${candidate.linkedinUrl || 'not provided'}
Portfolio: ${candidate.portfolioUrl || 'not provided'}

### Cover letter / message
${candidate.coverLetter?.trim() || 'not provided'}

Assess this application against the requirements and record your assessment.`,
  });

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SCREENING_SYSTEM,
    tools: [SCREENING_TOOL],
    tool_choice: { type: 'tool', name: SCREENING_TOOL.name },
    messages: [{ role: 'user', content }],
  });

  const out = toolInput(res, SCREENING_TOOL.name);
  const rawScore = Number(out.score);
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 0;
  // Keep the verdict consistent with the score, whatever the model said.
  const verdict = verdictFor(score);

  return {
    score,
    verdict,
    summary: typeof out.summary === 'string' ? out.summary.trim() : '',
    strengths: asStringList(out.strengths, 3),
    gaps: asStringList(out.gaps, 3),
    questions: asStringList(out.interview_questions, 3),
  };
}

// ─────────────────────────────────────────────────────────────
// Job post writer
// ─────────────────────────────────────────────────────────────

export interface JobDraft {
  description: string;
  requirements: string;
}

const JOB_TOOL: Anthropic.Messages.Tool = {
  name: 'write_job_post',
  description: 'Return the drafted job post.',
  input_schema: {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        description:
          'Plain text job description: a 2-3 sentence intro, then a line "What you will do" followed by 4-6 lines starting with "- ", then a line "What we offer" followed by 3-5 lines starting with "- ". No markdown headings, no bold.',
      },
      requirements: {
        type: 'string',
        description: '4-6 must-have requirements, one per line, each starting with "- ". Specific and verifiable.',
      },
    },
    required: ['description', 'requirements'],
  },
};

export async function draftJobPost(input: {
  companyName: string;
  title: string;
  location?: string | null;
  workMode?: string | null;
  notes?: string | null;
}): Promise<JobDraft> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1200,
    system:
      'You write clear, inclusive, jargon-free job posts. Use gender-neutral language, avoid clichés like "rockstar" or "ninja", and avoid inflated requirements that discourage good applicants.',
    tools: [JOB_TOOL],
    tool_choice: { type: 'tool', name: JOB_TOOL.name },
    messages: [
      {
        role: 'user',
        content: `Company: ${input.companyName}
Role: ${input.title}
Location: ${input.location || 'not specified'} (${input.workMode || 'not specified'})
Hiring manager notes: ${input.notes?.trim() || 'none'}

Write the job post.`,
      },
    ],
  });

  const out = toolInput(res, JOB_TOOL.name);
  return {
    description: typeof out.description === 'string' ? out.description.trim() : '',
    requirements: typeof out.requirements === 'string' ? out.requirements.trim() : '',
  };
}
