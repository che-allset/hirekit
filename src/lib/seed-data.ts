import type { Stage, Verdict } from './types';

/** Fictional demo company used to showcase HireKit. All people and data are made up. */
export const DEMO_COMPANY = {
  name: 'Northwind Labs',
  tagline: 'We build route planning and warehouse software that keeps European logistics moving.',
  website: 'https://example.com',
  brand_color: '#0F766E',
};

export interface SeedJob {
  key: string;
  title: string;
  department: string;
  location: string;
  work_mode: 'On-site' | 'Hybrid' | 'Remote';
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary_range: string;
  description: string;
  requirements: string;
  status: 'open' | 'closed';
  daysAgo: number;
}

export const DEMO_JOBS: SeedJob[] = [
  {
    key: 'fullstack',
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Berlin',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary_range: '€75–92k',
    daysAgo: 12,
    status: 'open',
    description: `Northwind Labs helps 300+ mid-sized logistics companies plan routes and run warehouses. You will join a team of six engineers and own features end to end, from database to UI.

What you will do
- Build and ship features across our TypeScript stack (Next.js, Node, Postgres)
- Design APIs that warehouse scanners and partner systems rely on every day
- Improve performance of route calculations for customers with 10,000+ daily stops
- Review code and mentor two mid-level engineers
- Work directly with customers to understand problems before writing code

What we offer
- Hybrid setup with an office in Berlin-Kreuzberg, 2 office days a week
- 30 days of holiday and a €1,500 yearly learning budget
- Company pension scheme and Urban Sports Club membership
- A calm, low-meeting culture with clear ownership`,
    requirements: `- 5+ years of professional software engineering experience
- Strong TypeScript on both frontend and backend
- Production experience with PostgreSQL (schema design, query tuning)
- Experience designing and maintaining REST or GraphQL APIs
- Comfortable mentoring others and giving thoughtful code reviews`,
  },
  {
    key: 'designer',
    title: 'Product Designer',
    department: 'Product',
    location: 'Remote (EU)',
    work_mode: 'Remote',
    employment_type: 'Full-time',
    salary_range: '€60–75k',
    daysAgo: 9,
    status: 'open',
    description: `Our users are dispatchers and warehouse leads who spend eight hours a day in our software. We need a designer who loves making complex workflows feel simple.

What you will do
- Own the design of our dispatcher web app from research to shipped UI
- Run interviews and usability tests with real warehouse teams
- Evolve our design system together with engineering
- Turn messy operational problems into clear, testable prototypes

What we offer
- Fully remote within the EU, with team meetups twice a year in Berlin
- Hardware and home office budget
- 30 days of holiday`,
    requirements: `- 3+ years designing B2B or SaaS products
- A portfolio showing complex workflows or data-heavy interfaces
- Hands-on user research experience (interviews, usability testing)
- Advanced Figma skills, including working with a design system`,
  },
  {
    key: 'csm',
    title: 'Customer Success Manager (DACH)',
    department: 'Customer Success',
    location: 'Munich',
    work_mode: 'On-site',
    employment_type: 'Full-time',
    salary_range: '€55–65k + bonus',
    daysAgo: 6,
    status: 'open',
    description: `You will be the trusted partner for 40 of our customers in Germany, Austria and Switzerland, helping them get real value from Northwind every week.

What you will do
- Onboard new customers and run training sessions on site
- Own renewals and spot expansion opportunities
- Turn customer feedback into clear input for the product team
- Build playbooks that help us scale customer success

What we offer
- Office in central Munich with a small, friendly team
- Performance bonus tied to customer retention
- Travel to customer sites across DACH`,
    requirements: `- 3+ years in customer success or account management for B2B software
- Fluent German and English
- Proven record of improving retention or expansion
- Confident running trainings and workshops`,
  },
  {
    key: 'analyst',
    title: 'Data Analyst',
    department: 'Operations',
    location: 'Berlin',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary_range: '€55–68k',
    daysAgo: 3,
    status: 'open',
    description: `Help our customers and our own team make better decisions with data from millions of deliveries.

What you will do
- Build dashboards and reports used by customers and leadership
- Analyse delivery performance and find patterns that save customers money
- Work with engineering to improve our data pipelines

What we offer
- Hybrid setup in Berlin
- Learning budget and conference tickets`,
    requirements: `- 2+ years in a data analyst role
- Strong SQL
- Experience with a BI tool (Metabase, Looker, Power BI or similar)
- Python or R for analysis`,
  },
  {
    key: 'intern',
    title: 'Marketing Intern',
    department: 'Marketing',
    location: 'Berlin',
    work_mode: 'Hybrid',
    employment_type: 'Internship',
    salary_range: '€1,600 / month',
    daysAgo: 40,
    status: 'closed',
    description: `A six-month internship supporting our marketing team with content and events.`,
    requirements: `- Currently enrolled in a degree programme
- Strong writing skills in English`,
  },
];

export interface SeedApplication {
  job: string;
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  cover_letter: string;
  stage: Stage;
  score: number;
  verdict: Verdict;
  summary: string;
  strengths: string[];
  gaps: string[];
  questions: string[];
  notes?: string;
  hoursAgo: number;
}

export const DEMO_APPLICATIONS: SeedApplication[] = [
  {
    job: 'fullstack',
    full_name: 'Amara Okafor',
    email: 'amara.okafor@example.com',
    linkedin_url: 'https://www.linkedin.com/in/example',
    cover_letter:
      'I have spent the last seven years building TypeScript products, most recently leading a migration of a 2 TB Postgres database to a partitioned schema with zero downtime. I mentor three engineers and care a lot about calm, well-reviewed code. Logistics software is a space I would love to go deep on.',
    stage: 'applied',
    score: 92,
    verdict: 'strong',
    summary:
      'Seven years of full-stack TypeScript with a led Postgres migration at scale and active mentoring. Meets all five must-haves.',
    strengths: [
      'Led a zero-downtime migration of a 2 TB Postgres database',
      '7 years of TypeScript across frontend and backend',
      'Currently mentors three engineers',
    ],
    gaps: ['No direct logistics or routing domain experience mentioned'],
    questions: [
      'Walk us through how you planned the zero-downtime Postgres migration.',
      'How do you approach API versioning when partners depend on your endpoints?',
      'What does a good code review from you look like?',
    ],
    hoursAgo: 5,
  },
  {
    job: 'fullstack',
    full_name: 'Jonas Becker',
    email: 'jonas.becker@example.com',
    cover_letter:
      'Frontend engineer with 4 years of React and TypeScript experience. I have built design systems and recently started working on Node APIs. Looking to grow into a full-stack role.',
    stage: 'screening',
    score: 64,
    verdict: 'possible',
    summary:
      'Solid frontend TypeScript engineer growing into backend work; Postgres depth and seniority are below the bar for this role.',
    strengths: ['4 years of React and TypeScript', 'Built and maintained a design system', 'Some Node API experience'],
    gaps: ['Below the 5-year experience requirement', 'No production PostgreSQL experience described', 'No mentoring experience mentioned'],
    questions: [
      'What is the most complex backend feature you have shipped?',
      'Have you designed or tuned a database schema? Tell us about it.',
      'How would you feel about a mid-level position with a growth plan?',
    ],
    notes: 'Strong frontend portfolio. Could be a fit for a mid-level role later this year.',
    hoursAgo: 30,
  },
  {
    job: 'fullstack',
    full_name: 'Sofia Kowalski',
    email: 'sofia.kowalski@example.com',
    cover_letter:
      'Staff engineer at a freight marketplace, 9 years of experience. I built our pricing API (GraphQL, Postgres) and run our engineering mentoring programme. Moving to Berlin this spring.',
    stage: 'offer',
    score: 95,
    verdict: 'strong',
    summary:
      'Nine years of experience at a freight marketplace, built a GraphQL/Postgres pricing API and runs a mentoring programme. Excellent domain fit.',
    strengths: ['Directly relevant freight/logistics experience', 'Designed a high-traffic GraphQL API on Postgres', 'Runs an engineering mentoring programme'],
    gaps: ['Relocation timing to Berlin should be confirmed'],
    questions: [
      'What would you change first in a routing product used by 300 customers?',
      'How did you scale the pricing API under peak load?',
      'What is your timeline for moving to Berlin?',
    ],
    notes: 'Great final round. Offer sent on Tuesday, waiting to hear back.',
    hoursAgo: 220,
  },
  {
    job: 'fullstack',
    full_name: 'Liam Hughes',
    email: 'liam.hughes@example.com',
    cover_letter: 'I am a WordPress developer looking for a new challenge. I know PHP, some JavaScript and MySQL.',
    stage: 'rejected',
    score: 31,
    verdict: 'weak',
    summary: 'WordPress/PHP background without TypeScript, PostgreSQL or API design experience for this senior role.',
    strengths: ['Web development experience with PHP and MySQL'],
    gaps: ['No TypeScript experience', 'No PostgreSQL or API design experience', 'Seniority below requirement'],
    questions: ['Which JavaScript projects are you most proud of?', 'Have you built an API from scratch?', 'What are you looking to learn next?'],
    hoursAgo: 150,
  },
  {
    job: 'designer',
    full_name: 'Mei Tanaka',
    email: 'mei.tanaka@example.com',
    linkedin_url: 'https://www.linkedin.com/in/example',
    cover_letter:
      'Product designer with 5 years at B2B SaaS companies, most recently designing a fleet management dashboard used by 2,000 dispatchers. I run weekly user interviews and maintain our Figma design system.',
    stage: 'interview',
    score: 89,
    verdict: 'strong',
    summary: 'Five years of B2B SaaS design including a fleet dashboard for dispatchers, with regular user research and design system ownership.',
    strengths: ['Designed a fleet management dashboard for dispatchers', 'Runs weekly user interviews', 'Maintains a Figma design system'],
    gaps: ['Portfolio link not provided in the application'],
    questions: [
      'Show us a workflow you simplified and how you measured the impact.',
      'How do you run usability tests with busy operational users?',
      'How do you decide when to extend the design system?',
    ],
    notes: 'Portfolio review with Hanna on Thursday.',
    hoursAgo: 72,
  },
  {
    job: 'designer',
    full_name: 'Lucas Martin',
    email: 'lucas.martin@example.com',
    cover_letter: 'Visual designer with a background in branding and marketing websites. I am excited to move into product design.',
    stage: 'applied',
    score: 47,
    verdict: 'weak',
    summary: 'Strong visual and brand design background, but little evidence of product design for complex B2B workflows or user research.',
    strengths: ['Branding and visual design skills', 'Experience with marketing websites'],
    gaps: ['No B2B or SaaS product design experience', 'No user research experience mentioned', 'Design system experience unclear'],
    questions: [
      'Have you designed any multi-step workflow or app interface?',
      'How do you validate a design with users?',
      'What draws you to operational software?',
    ],
    hoursAgo: 20,
  },
  {
    job: 'designer',
    full_name: 'Ana Ribeiro',
    email: 'ana.ribeiro@example.com',
    cover_letter:
      'Three years designing internal tools for an e-commerce warehouse team. I love data-heavy screens and have run usability tests on the warehouse floor.',
    stage: 'applied',
    score: 78,
    verdict: 'possible',
    summary: 'Three years designing warehouse internal tools with on-site usability testing; strong domain fit, design system depth less clear.',
    strengths: ['Designed internal tools for warehouse teams', 'Ran usability tests on the warehouse floor', 'Comfortable with data-heavy interfaces'],
    gaps: ['Design system experience not described', 'Exactly at the 3-year minimum'],
    questions: [
      'What did you learn from testing on the warehouse floor?',
      'Have you contributed to or built a design system?',
      'Tell us about a design decision you changed after research.',
    ],
    hoursAgo: 9,
  },
  {
    job: 'csm',
    full_name: 'Lea Müller',
    email: 'lea.mueller@example.com',
    phone: '+49 151 0000 0000',
    cover_letter:
      'Customer Success Manager with 4 years at a B2B SaaS company in Munich. I own 35 accounts, introduced onboarding playbooks that reduced churn by 18%, and run monthly customer trainings in German and English.',
    stage: 'interview',
    score: 87,
    verdict: 'strong',
    summary: 'Four years of B2B SaaS customer success in Munich with an 18% churn reduction and bilingual trainings. Meets all must-haves.',
    strengths: ['Reduced churn by 18% with onboarding playbooks', 'Runs trainings in German and English', 'Owns a book of 35 accounts'],
    gaps: ['No logistics industry experience', 'Level of CRM tooling (e.g. Salesforce) unclear'],
    questions: [
      'Walk us through the playbook that reduced churn by 18%.',
      'How do you handle a customer who is unhappy before renewal?',
      'Which CRM tools have you used day to day?',
    ],
    notes: 'Very strong first call. Second interview with the Head of CS booked.',
    hoursAgo: 48,
  },
  {
    job: 'csm',
    full_name: 'Tobias Schneider',
    email: 'tobias.schneider@example.com',
    cover_letter:
      'Account manager at a logistics company for 2 years. I speak German natively and good English. I want to move into software.',
    stage: 'screening',
    score: 61,
    verdict: 'possible',
    summary: 'Logistics account manager with native German; useful domain knowledge, but below the experience bar and no SaaS retention track record.',
    strengths: ['Logistics industry knowledge', 'Native German, good English'],
    gaps: ['2 years of experience versus 3 required', 'No B2B software experience', 'No retention or expansion results described'],
    questions: [
      'What results did you achieve with your accounts?',
      'Have you run trainings or workshops?',
      'Why the move into software now?',
    ],
    hoursAgo: 26,
  },
  {
    job: 'analyst',
    full_name: 'Diego Ramírez',
    email: 'diego.ramirez@example.com',
    cover_letter:
      'Data analyst with 3 years of experience. I write SQL every day, built our company dashboards in Metabase and use Python for forecasting delivery volumes.',
    stage: 'applied',
    score: 84,
    verdict: 'strong',
    summary: 'Three years as a data analyst with daily SQL, Metabase dashboards and Python forecasting of delivery volumes. Covers all must-haves.',
    strengths: ['Daily SQL work', 'Built company dashboards in Metabase', 'Python forecasting of delivery volumes'],
    gaps: ['Experience working with engineering on pipelines not mentioned'],
    questions: [
      'Tell us about a forecast that changed a business decision.',
      'How do you make sure a dashboard is actually used?',
      'Have you worked with dbt or data pipelines?',
    ],
    hoursAgo: 3,
  },
  {
    job: 'analyst',
    full_name: 'Hannah Weber',
    email: 'hannah.weber@example.com',
    cover_letter: 'Recent economics graduate. I used R and Stata during my studies and completed an online SQL course.',
    stage: 'applied',
    score: 52,
    verdict: 'weak',
    summary: 'Recent graduate with R and introductory SQL; promising, but no professional analyst experience or BI tooling yet.',
    strengths: ['Statistical analysis with R and Stata', 'Completed SQL training'],
    gaps: ['No professional analyst experience', 'No BI tool experience mentioned'],
    questions: [
      'Tell us about the most interesting dataset you analysed.',
      'How comfortable are you writing SQL joins and window functions?',
      'Would a junior position interest you?',
    ],
    hoursAgo: 14,
  },
  {
    job: 'csm',
    full_name: 'Clara Fischer',
    email: 'clara.fischer@example.com',
    cover_letter:
      'Six years in customer success for HR software in Vienna. Fluent German and English. I grew net revenue retention from 98% to 112% across my portfolio.',
    stage: 'hired',
    score: 93,
    verdict: 'strong',
    summary: 'Six years in B2B SaaS customer success with NRR growth from 98% to 112% and fluent German and English.',
    strengths: ['Grew net revenue retention from 98% to 112%', 'Six years in B2B SaaS customer success', 'Fluent German and English'],
    gaps: ['Based in Vienna; on-site Munich role requires relocation'],
    questions: ['How did you drive expansion revenue?', 'What does your ideal onboarding look like?', 'What is your timeline to relocate?'],
    notes: 'Signed! Starts on the 1st of next month.',
    hoursAgo: 400,
  },
];
