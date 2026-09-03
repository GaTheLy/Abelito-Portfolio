// The project index. README is explicit that this page must stay data-driven —
// "the project page is going to grow" — so this array drives /projects, the
// Home feature grid, and every case study's STACK chips. Every count shown
// anywhere on the site is derived from here, never written by hand.

export const CATEGORIES = [
  "All",
  "LLM & Agents",
  "Computer Vision",
  "Voice & Audio",
  "Cloud & Infra",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SORTS = [
  { id: "new", label: "Newest" },
  { id: "old", label: "Oldest" },
  { id: "az", label: "A–Z" },
  { id: "depth", label: "Most detailed" },
] as const;

export type SortId = (typeof SORTS)[number]["id"];

export interface Project {
  slug: string;
  name: string;
  cat: Exclude<Category, "All">;
  year: number;
  /** Small-caps line under the title, e.g. "2025 · CLIENT PROJECT". */
  meta: string;
  badge: string;
  /** Has a full case study — the card routes to /projects/[slug]. */
  deep?: boolean;
  blurb: string;
  stack: string[];
  metric: string;
  /** Extra search keywords. Never displayed — they only widen the haystack. */
  keys: string;
}

export const projects: Project[] = [
  {
    slug: "manna",
    name: "Manna Cooking Studio",
    cat: "LLM & Agents",
    year: 2025,
    meta: "2025 · CLIENT PROJECT",
    badge: "REAL CLIENT",
    deep: true,
    blurb:
      "A WhatsApp agent that replaced a cooking school's entire booking desk. RAG-grounded answers, a stateful booking flow, and calendar sync — running 24/7.",
    stack: [
      "TypeScript",
      "Node",
      "Baileys · WhatsApp",
      "Gemini",
      "Gemini embeddings",
      "ChromaDB",
      "Sheets API",
      "Calendar API",
    ],
    metric: "~80% admin cut",
    keys: "rag retrieval chatbot whatsapp booking client freelance paid state machine chroma gemini typescript",
  },
  {
    slug: "traffic",
    name: "Traffic congestion detection",
    cat: "Computer Vision",
    year: 2025,
    meta: "2025 · UNDERGRADUATE THESIS",
    badge: "THESIS",
    deep: true,
    blurb:
      "Sensor-grade congestion readings from CCTV alone — parallel YOLO11 models, four traffic-flow features, and a classifier that reads how traffic behaves instead of counting it.",
    stack: [
      "Python",
      "YOLO11",
      "PyTorch",
      "OpenCV",
      "Lucas-Kanade flow",
      "scikit-learn · SVM",
      "SSIM sampling",
      "Roboflow",
    ],
    metric: "97.5% at 18–22 FPS",
    keys: "yolo opencv svm neural network optical flow traffic congestion cctv malang detection segmentation occupancy density roboflow thesis python",
  },
  {
    slug: "talkative",
    name: "Talkative",
    cat: "Voice & Audio",
    year: 2025,
    meta: "2025 · APPLE DEVELOPER ACADEMY",
    badge: "VOICE AI",
    deep: true,
    blurb:
      "A pronunciation coach that names the sound you missed. Wav2Vec2, Librosa DSP and DTW alignment across 44+ phoneme classes on streaming audio.",
    stack: ["Python", "Django REST", "PyTorch", "Wav2Vec2", "Librosa", "NumPy", "DTW"],
    metric: "<2s per utterance",
    keys: "speech audio wav2vec phoneme pronunciation dtw librosa django latency streaming",
  },
  {
    slug: "gerakin",
    name: "GerakinAja",
    cat: "Computer Vision",
    year: 2025,
    meta: "2025 · APPLE DEVELOPER ACADEMY",
    badge: "ON-DEVICE",
    deep: true,
    blurb:
      "Rep counting and form correction from pose alone — a CoreML action classifier, a 5-state automaton and 4 biomechanical validators, all on the phone.",
    stack: ["Swift", "Apple Vision", "CoreML", "Create ML", "AVFoundation"],
    metric: "<200ms per frame",
    keys: "pose coreml vision swift on-device offline fitness automaton classifier apple",
  },
];

/** Search haystack — README §Controls panel defines this exactly. */
function haystack(p: Project): string {
  return [p.name, p.blurb, p.cat, p.metric, p.keys, p.stack.join(" ")].join(" ").toLowerCase();
}

export interface Filters {
  query: string;
  cat: Category;
  sort: SortId;
  deepOnly: boolean;
}

/**
 * Filter + sort, the single implementation used by the page and the tests.
 *
 * Matching rule: lowercase the query, split on whitespace, require EVERY token
 * to appear in the haystack. So "phoneme latency" finds Talkative and nothing
 * else, and "bm25" finds Riset.
 */
export function selectProjects({ query, cat, sort, deepOnly }: Filters): Project[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const filtered = projects.filter((p) => {
    if (deepOnly && !p.deep) return false;
    if (cat !== "All" && p.cat !== cat) return false;
    if (tokens.length === 0) return true;
    const hay = haystack(p);
    return tokens.every((token) => hay.includes(token));
  });

  const byName = (a: Project, b: Project) => a.name.localeCompare(b.name);

  const comparators: Record<SortId, (a: Project, b: Project) => number> = {
    new: (a, b) => b.year - a.year || byName(a, b),
    old: (a, b) => a.year - b.year || byName(a, b),
    az: byName,
    depth: (a, b) => Number(Boolean(b.deep)) - Number(Boolean(a.deep)) || b.year - a.year,
  };

  return [...filtered].sort(comparators[sort]);
}

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Slugs that have a full case study, in page order. Drives the "NEXT CASE
 *  STUDY" cycle and the /projects/[slug] static params. */
export const caseStudySlugs = projects.filter((p) => p.deep).map((p) => p.slug);
