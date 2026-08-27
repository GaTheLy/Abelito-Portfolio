// The storytelling centrepiece, and the longest page by design.
//
// IMPORTANT: everything from the draft banner to the end of "The three turns",
// plus the "Where I'm going" aspirations, is a DRAFT of Abelito's voice written
// from his CV and one conversation. Dates, roles, metrics and awards are
// sourced; memories and motivations are reconstruction. The amber banners must
// stay until he rewrites the prose in his own words.

export const DRAFT_NOTICE =
  "Everything from here to the end of **The three turns** is a draft of your voice, written from your CV and our conversation. The dates, roles, metrics and awards are sourced — the memories, motivations and feelings are my reconstruction. Rewrite them in your words before this goes live; a real anecdote in your own phrasing will beat anything I can infer.";

export const photoSlots = [
  { ratio: "4/3", prompt: "A photo that feels like you" },
  { ratio: "3/4", prompt: "Somewhere you love" },
  { ratio: "3/4", prompt: "Your people" },
];

export interface Chapter {
  eyebrow: string;
  title: string;
  /** Rendered as a two-column newspaper block when true. */
  twoColumn?: boolean;
  paragraphs: string[];
  imageSlot?: { ratio: string; prompt: string };
  pullquote?: string;
  cards?: { label: string; title: string; body: string }[];
}

export const chapters: Chapter[] = [
  {
    eyebrow: "CHAPTER 01 · WHERE THIS CAME FROM",
    title: "Taking things apart, professionally.",
    twoColumn: true,
    paragraphs: [
      "I've always wanted the back off things. Not to fix them — just to see whether the inside matched what I'd imagined. It usually didn't, which is the part I got addicted to.",
      "Petra Christian University turned that into maths. The first thing I built that mattered was a traffic system: Malang's intersections run on fixed timers and guesswork, so I pointed models at CCTV feeds until they could tell me whether a road was actually jammed. Sensor-grade answers, no sensors.",
      "The Apple Developer Academy taught me the harder skill, which is finishing. Three products in a year, each one a lesson in how little of this job is modelling and how much of it is latency, state and interface. I arrived thinking I was there to learn ML. I left knowing how to ship.",
      "Now it's language. Retrieval that cites its sources, agent loops that log what every step cost, evaluations that catch a regression before a user does. Same instinct as the screwdriver — I don't trust a thing until I've seen its insides.",
      "I'd rather be honest about being early than perform seniority I haven't earned. What I do have is nine shipped systems and a habit of finishing what I start.",
    ],
  },
  {
    eyebrow: "CHAPTER 02 · FEB—DEC 2025",
    title: "The year I learned to finish.",
    paragraphs: [
      "University gave me models. The Apple Developer Academy gave me deadlines and strangers — designers and product people who didn't care how elegant the architecture was if the thing felt broken in their hands. That combination did more for me than another year of theory would have.",
      "Three products came out of that year. **Talkative** taught me that latency is a product decision — testers called the same model smart at two seconds and broken at six. **GerakinAja** taught me that a rep is a sequence, and that writing the rules down beat throwing more data at the problem. **Cire** taught me that the cost of a system is a design constraint, not an invoice you read later.",
      "We won Hackfest that April with a computer-vision pipeline for image-based semantic search inside a B2B marketplace. Competitions compress the whole lesson into a weekend: you find out fast that deciding what to cut is the actual skill.",
    ],
    imageSlot: { ratio: "4/5", prompt: "The Academy year" },
    pullquote:
      "I arrived thinking I was there to learn machine learning. I left knowing how to ship — which turned out to be the rarer thing.",
  },
  {
    eyebrow: "CHAPTER 03 · THE FIRST INVOICE",
    title: "Someone paid me, and everything got serious.",
    paragraphs: [
      "A cooking school in Surabaya was running its whole business out of one WhatsApp inbox, and I built the agent that took it over. What I'd actually taken on was the difference between a demo and a dependency: a wrong answer here wasn't a bad benchmark score, it was somebody's booking.",
      "So I grounded every factual answer in documents the studio wrote themselves, and I left a human in the loop on money — the agent never approves a payment. That wasn't a technical limitation. It was the thing that made them trust it.",
      "The hardest part wasn't the model at all — it was state. Real conversations pause, wander and resume days later, and building something that could pick a person back up mid-flow taught me more about conversational systems than any paper had.",
    ],
  },
  {
    eyebrow: "CHAPTER 04 · 2026",
    title: "Three rooms, three different ways to be wrong.",
    paragraphs: [],
    cards: [
      {
        label: "JAN—MAR · AXRAIL",
        title: "Write it down first",
        body: "Spec-driven development felt slow for a week, then stopped costing me rewrites entirely. Also where I learned that security is a feature — zero critical findings in a third-party pen test is a number I'm quietly proud of.",
      },
      {
        label: "FEB—APR · KINETIXPRO",
        title: "A dataset is a loop",
        body: "I stopped thinking of data as something you have and started treating it as something you run: eight services turning raw footage into labels, and labels back into a better model.",
      },
      {
        label: "JUN — NOW · DATASAUR",
        title: "Language, at someone else's scale",
        body: "LLM and NLP systems on a platform other engineers depend on. Two months in, which is the honest number — and the reason I keep the specifics for a conversation rather than a webpage.",
      },
    ],
    pullquote:
      "I've never shipped the same kind of ML system twice. That's either a gap or a superpower, and I've decided it's the second one.",
  },
];

export const turns = [
  {
    title: "Counting cars didn't work",
    body: "Twenty cars moving freely and twenty cars stopped look identical to a counter. I spent weeks trying to detect my way out before realising the answer was in how the detections *moved*. Since then my first question on any problem is what I'm actually measuring.",
  },
  {
    title: 'The same model read as "smart" once it got faster',
    body: "Identical scores — I'd only changed how the bytes arrived. Watching people's judgement of intelligence move with latency rearranged what I think engineering is for.",
  },
  {
    title: "Real users don't behave like flowcharts",
    body: "My first booking flow assumed a conversation runs start to finish. Now I design for the pause, the abandon and the return before I design the happy path.",
  },
];

export const interests = [
  {
    title: "Cars",
    tag: "MECHANICAL",
    body: "I'll lose an evening to why a gearbox is geared the way it is. A drivetrain is a system with no marketing department — every part is there because it has to be, and you can trace exactly what happens when one gives up.",
  },
  {
    title: "Markets",
    tag: "FINANCIAL",
    body: "I spent a competition season modelling a telecom merger for fun and placed 4th at UGM's finance case competition. Investing is the same instinct as engineering: form a thesis, write down why, then find out how wrong you were.",
  },
  {
    title: "Explaining things",
    tag: "OUT LOUD",
    body: "I make short AI explainers on TikTok. It started as a way to check my own understanding — if I can't say it in sixty seconds, I didn't understand it — and turned into the reason I read papers on time.",
  },
  {
    title: "Yours to add",
    tag: "NEEDS YOU",
    open: true,
    body: "Padel? Food in Malang? Music while you code? Tell me the one you'd actually talk about for ten minutes and I'll write it properly — this card should be the most specific thing on the page, not the vaguest.",
  },
];

export const people = {
  paragraphs: [
    "Nothing on this site was built alone, and the projects with my name on them are the ones where somebody else told me the truth early.",
    "The Apple Developer Academy put me in a cohort of designers and product people who were unimpressed by clever models and only cared whether the thing worked in someone's hands. Talkative and GerakinAja exist because teammates kept asking the annoying question — *would you actually use this?* — until the answer was yes. I got better at engineering by working next to people who weren't engineers.",
    "Outside work it's the same handful of friends since university — the group chat that gets the half-finished idea before anyone else does, and tells me when it's boring.",
  ],
  prompt:
    "This is your space: name them, tell the story of one, drop the photo — a real anecdote here does more than any project card.",
};

export const beliefs = [
  {
    title: "The model is rarely where the problem lives",
    body: "Every system I've shipped was won somewhere else: in the features, the batching, the state, or the humans doing the labelling.",
  },
  {
    title: "A vibe check is not an eval",
    body: "If I can't show you a number that moved, I didn't improve anything — I just changed something. Freeze the benchmark before you tune.",
  },
  {
    title: "Keep a human on the money",
    body: "Automate the tedium, not the accountability. The constraint that looks like a limitation is usually the reason someone trusts the system.",
  },
  {
    title: "Explain it or you don't know it",
    body: "Sixty seconds, no jargon debt. Teaching in public is the cheapest way I've found to discover what I've been faking.",
  },
  {
    title: "Say the honest number",
    body: "Two months at Datasaur. Estimated, not measured. I'd rather be the person whose caveats you can trust.",
  },
  {
    title: "Finish things",
    body: "A shipped B beats an unshipped A. The Academy year burned this in and I haven't wanted to unlearn it.",
  },
];

export const going = {
  title: "I want to build the systems people quietly rely on.",
  horizons: [
    {
      label: "THIS YEAR",
      title: "Depth over breadth",
      body: "Get genuinely excellent at evaluation — the part most teams skip. Ship Riset properly, publish the eval harness, and keep the channel honest enough that engineers watch it too.",
    },
    {
      label: "THREE YEARS",
      title: "Own something end to end",
      body: "A retrieval or agent system I've carried for years, not months — through the boring middle, the migration nobody wants, and the on-call night that teaches you what you actually built.",
    },
    {
      label: "THE LONG BET",
      title: "AI that works in Indonesia",
      body: "Most of what I've built solved local problems with global tools — traffic on Malang's roads, a Surabaya studio's inbox. I want more of my work to be useful here first, and to help more Indonesian engineers get in early.",
    },
  ],
  knownFor:
    "Being the engineer whose systems can prove they're working — and whose caveats you can trust.",
  notChasing:
    "A title before the substance, or a following bigger than my understanding. I'd rather be early and honest about it than senior on paper.",
};

export const RIGHT_NOW_UPDATED = "UPDATED AUG 2026";

export const rightNow = [
  {
    key: "WORKING",
    body: "AI Engineer at **Datasaur** on LLM and NLP systems. Two months in, still in the phase where every week rewires something I thought I knew.",
  },
  {
    key: "BUILDING",
    body: "**Riset**, evenings — the eval harness is the current front. I want the numbers honest before I let an agent pick what I publish.",
  },
  {
    key: "LEARNING",
    body: "Evaluation discipline properly — RAGAS, DeepEval, judge rubrics — and the unfashionable half of agent engineering: cost, retries, and what happens on the fifth iteration.",
  },
  {
    key: "OPEN TO",
    body: "Conversations about retrieval systems, agent tooling and CV pipelines — and scoped contract builds where a working thing matters more than a deck.",
  },
];
