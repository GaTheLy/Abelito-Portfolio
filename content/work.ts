// The employment history behind /work. Each role closes with "what it changed"
// — the point of the page is the lesson, not the job title.

export interface Role {
  company: string;
  title: string;
  dates: string;
  /** Compact label for the home page's route rail. */
  shortDate: string;
  /** One-clause summary for the same rail. */
  oneLine: string;
  /** Vermilion dates — the current role. */
  current?: boolean;
  place: string;
  note?: string;
  intro?: string;
  bullets?: string[];
  tags?: string[];
  /** The pull-quote each block closes with. */
  changed?: string;
  /** Apple Academy shows product cards instead of bullets. */
  products?: { name: string; blurb: string; href?: string; ask?: string }[];
}

export const roles: Role[] = [
  {
    company: "Datasaur",
    title: "AI Engineer",
    dates: "JUN 2026 — NOW",
    shortDate: "NOW",
    oneLine: "AI Engineer, LLM & NLP systems.",
    current: true,
    place: "Remote · Indonesia",
    note: "Kept high-level: the work is internal.",
    intro:
      "LLM and NLP systems at an NLP data platform — the domain I'd been aiming at since the first RAG pipeline I built for someone else's business. Two months in, which is the honest number, and the reason the chat on the right has an answer ready for that question.",
    tags: ["LLM systems", "NLP", "Production"],
  },
  {
    company: "KinetixPro",
    title: "AI/ML Engineer Intern · computer vision",
    dates: "FEB — APR 2026",
    shortDate: "FEB—APR 26",
    oneLine: "computer-vision active learning.",
    place: "Singapore · Remote",
    bullets: [
      "Architected an end-to-end computer-vision **active learning monorepo** — 8 integrated microservices under Docker Compose and the NVIDIA Container Toolkit, covering YOLOv7 automated labelling, continuous training and dataset QA.",
      "Built a high-throughput video sampling engine with OpenCV and FFmpeg, pulling critical frames straight from MediaMTX RTSP live streams to feed continuous evaluation loops.",
      "Deployed GPU-accelerated inference endpoints with automated dataset sync to cloud storage — decoupled MLOps, not a notebook.",
    ],
    changed:
      "I stopped thinking of a dataset as a thing you have, and started treating it as a loop you run.",
  },
  {
    company: "Axrail",
    title: "AWS Cloud Engineer Trainee",
    dates: "JAN — MAR 2026",
    shortDate: "JAN—MAR 26",
    oneLine: "Bedrock agents, RAG and MCP tools.",
    place: "Malaysia · Remote",
    note: "AWS Partner",
    bullets: [
      "Built a **conversational commerce agent** on AWS Bedrock (Nova Lite) with the Strands Agents framework — RAG retrieval through Bedrock Knowledge Bases, cross-session memory, live order-trend analysis, and MCP tool-use orchestration in a 5-iteration agent loop. Customers place orders in natural language over WebSocket.",
      "Automated an enterprise timesheet system: AppSync GraphQL, 12 DynamoDB tables, 5 EventBridge-scheduled Lambdas handling provisioning, SES reminders, submission enforcement, YTD chargeability via DynamoDB Streams, and biweekly archival.",
      "Designed a multi-tenant serverless data platform in AWS CDK — 11 decoupled micro-stacks stitched through SSM Parameter Store, with OpenSearch indexing, SQS FIFO queues and Step Functions for third-party payment orchestration.",
      "Shipped production-grade security: Cognito RBAC, API Gateway authorizers, Bedrock Guardrails, input sanitisation, per-user rate limiting — **zero critical findings** in a third-party penetration test.",
    ],
    changed:
      "Spec-driven development. Writing the requirements and design docs before the code felt slow for about a week, then stopped costing me rewrites entirely.",
  },
  {
    company: "Apple Developer Academy",
    title: "Developer & Domain Expert Intern",
    dates: "FEB — DEC 2025",
    shortDate: "FEB—DEC 25",
    oneLine: "three shipped products.",
    place: "Surabaya, Indonesia",
    note: "Graduated Dec 2025",
    intro:
      "A year of finishing things. Three products, each one a different lesson in how much of ML engineering is actually latency, state and interface.",
    products: [
      {
        name: "Talkative",
        blurb: "Phoneme-level pronunciation scoring, <2s, 44+ classes.",
        href: "/projects/talkative",
      },
      {
        name: "Cire",
        blurb: "Edge-to-cloud CV: 3 streams, 30 FPS, ~80% fewer API calls.",
        ask: "cv",
      },
      {
        name: "GerakinAja",
        blurb: "On-device pose analysis, rep counting, form correction.",
        href: "/projects/gerakin",
      },
    ],
  },
];

export const education = [
  {
    shortDate: "2021—2025",
    title: "Petra Christian University",
    line: "BSc Computer Science — Data Science & Analytics, 2021–2025",
    note: "GPA 3.61 · cum laude · Most Outstanding Freshman in Data Science, 2022",
  },
  { shortDate: "2026", title: "AWS Certified Developer — Associate", line: "2026" },
  {
    shortDate: "2023",
    title: "DeepLearning.AI",
    line: "Mathematics for ML · Machine Learning · TensorFlow Developer, Advanced Techniques, Data & Deployment",
    note: "2023",
  },
];

export const honours = [
  {
    title: "1st place — Hackfest 2025",
    line: "Ciputra University, Apr 2025. A computer-vision pipeline for image-based semantic visual search inside a B2B marketplace.",
  },
  {
    title: "4th place — Jogjakarta Finance Case Competition",
    line: "Universitas Gadjah Mada, May 2024. Financial restructuring valuation and workforce projections for a telecom merger — the reason markets still interest me.",
  },
];
