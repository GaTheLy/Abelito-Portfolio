import { parseBlocks, type Block, type BlockInput } from "../lib/blocks.ts";
import type { RailContext } from "../lib/rail.ts";
import type { TopicId } from "./answers.ts";
import { projectBySlug } from "./projects.ts";

// The four full case studies. One template, fixed section order:
//
//   OVERVIEW → MY ROLE → PROBLEM → APPROACH → ARCHITECTURE → RESULTS
//   → STACK → TIMELINE → LESSON      (Manna inserts WHAT BROKE before LESSON)
//
// The ARCHITECTURE diagrams are real mermaid, drafted from each project's own
// APPROACH copy. They need Abelito's eye for technical accuracy before launch —
// that's a review, not a blocker.

export interface CaseStudy {
  slug: string;
  /** These are arguments, not titles. */
  h1: string;
  standfirst: string;
  /** The 4-cell scan strip. Deliberately does NOT repeat role or stack —
   *  those have their own sections. */
  meta: { key: string; value: string }[];
  sections: { label: string; blocks: Block[] }[];
  /** Three questions written for this project, shown in the 340px rail. */
  questions: { label: string; topic: TopicId }[];
  related: { label: string; note: string; href: string }[];
}

interface CaseInput extends Omit<CaseStudy, "sections"> {
  sections: { label: string; blocks: BlockInput[] }[];
}

/** STACK always comes from the project record — README is explicit that there
 *  must not be a second list anywhere. */
function stackSection(slug: string): { label: string; blocks: BlockInput[] } {
  const project = projectBySlug(slug);
  if (!project) throw new Error(`case study "${slug}" has no matching project record`);
  return { label: "STACK", blocks: [{ type: "stack", tags: project.stack }] };
}

const ACADEMY_DATES_NOTE: BlockInput = {
  type: "callout",
  label: "CONFIRM",
  text: "Confirm the real phase dates against your Academy cycles.",
};

const raw: CaseInput[] = [
  {
    slug: "traffic",
    h1: "Counting cars is not measuring traffic.",
    standfirst:
      "Cities buy loop sensors and radar to answer one question — is this road jammed? The cameras were already there. So I built the answer out of the cameras.",
    meta: [
      { key: "CONTEXT", value: "Undergraduate thesis" },
      { key: "YEAR", value: "2025" },
      { key: "WHERE", value: "Petra Christian University, Surabaya" },
      { key: "OUTCOME", value: "97.4% accuracy at 14.4ms" },
    ],
    questions: [
      { label: "Why not just count the vehicles?", topic: "cv" },
      { label: "How do you know 97.4% is real?", topic: "evals" },
      { label: "Where else have you used YOLO?", topic: "cv" },
    ],
    related: [
      {
        label: "Padel court analytics",
        note: "Tracking that survives occlusion — the same motion-over-counts instinct.",
        href: "/projects?q=padel",
      },
      {
        label: "GerakinAja",
        note: "Also chose a state machine over a bigger model.",
        href: "/projects/gerakin",
      },
    ],
    sections: [
      {
        label: "OVERVIEW",
        blocks: [
          {
            type: "text",
            md: "A camera-only congestion sensor. Two YOLO11 models, optical flow and an SVM turn an ordinary CCTV feed into a live congestion signal — 97.4% accurate at 14.4ms per classification, with no roadside hardware to install or maintain. Built as my undergraduate thesis at Petra Christian University and defended in 2025.",
          },
        ],
      },
      {
        label: "MY ROLE",
        blocks: [
          {
            type: "text",
            md: "Sole engineer. Dataset collection and annotation, both detection models, the optical-flow feature pipeline, the classifier, the evaluation — and the thesis that had to defend all of it.",
          },
        ],
      },
      {
        label: "PROBLEM",
        blocks: [
          {
            type: "text",
            md: "Congestion monitoring in Indonesian cities means hardware — inductive loops, radar, manual counts. Expensive to install and worse to maintain, so most intersections simply aren't measured. Meanwhile CCTV is everywhere and watched only by humans. The cheap answer would be to count vehicles per frame, and the cheap answer is wrong: twenty cars moving freely and twenty cars stopped look identical to a counter.",
          },
        ],
      },
      {
        label: "APPROACH",
        blocks: [
          {
            type: "text",
            md: "Two YOLO11 models in parallel: one detecting vehicles, one segmenting the drivable road — so density is measured against actual asphalt rather than the frame. Lucas-Kanade optical flow turns detections into velocity; velocity plus density becomes occupancy. An SVM classifies congestion from those motion features instead of from a raw count.",
          },
          {
            type: "text",
            md: "Frame sampling is global rather than fixed-interval, so the pipeline spends its compute on frames that actually differ.",
          },
        ],
      },
      {
        label: "ARCHITECTURE",
        blocks: [
          {
            type: "mermaid",
            kind: "flowchart LR",
            alt: "An RTSP CCTV feed passes through SSIM frame sampling, then splits into two parallel YOLO11 models — one detecting vehicles, one segmenting the road. Both feed Lucas-Kanade optical flow, which produces occupancy, density and velocity as one feature vector for an SVM congestion classifier.",
            code: [
              '  rtsp["RTSP / CCTV"] --> ssim["SSIM frame sampling"]',
              '  ssim --> veh["YOLO11 · vehicles"]',
              '  ssim --> road["YOLO11 · road seg"]',
              '  veh --> flow["Lucas-Kanade flow"]',
              '  road --> flow',
              '  flow --> svm["SVM · congestion"]',
              "  class veh,road emphasis",
              "  class svm terminal",
            ].join("\n"),
          },
          {
            type: "text",
            md: "Occupancy, density and velocity reach the classifier as one feature vector — the road-segmentation branch is what makes density mean anything.",
          },
        ],
      },
      {
        label: "RESULTS",
        blocks: [
          {
            type: "metrics",
            items: [
              { value: "97.4%", label: "SVM CONGESTION ACCURACY", lead: true },
              { value: "90.8%", label: "YOLO11 VEHICLE DETECTION mAP" },
              { value: "14.4ms", label: "CLASSIFIER INFERENCE" },
              { value: "0", label: "ROADSIDE SENSORS REQUIRED" },
            ],
          },
        ],
      },
      stackSection("traffic"),
      {
        label: "TIMELINE",
        blocks: [
          {
            type: "timeline",
            entries: [
              {
                label: "WEEKS 1—3",
                text: "Naive counting baseline. Worked on empty roads, failed at every queue.",
              },
              {
                label: "WEEKS 4—7",
                text: "Added road segmentation. Density measured against asphalt, not pixels.",
              },
              {
                label: "WEEKS 8—11",
                text: "Optical flow in. Velocity turned out to matter more than volume.",
              },
              {
                label: "WEEK 12",
                text: "SVM over the flow features. 97.4% at 14.4ms, thesis defended.",
                current: true,
              },
            ],
          },
        ],
      },
      {
        label: "LESSON",
        blocks: [
          {
            type: "lesson",
            text: "The feature engineering beat the bigger model. I spent weeks trying to detect my way out of the problem before realising the answer was in how the detections *moved* — and a 14ms classifier is what made it deployable on hardware a city can actually afford.",
          },
        ],
      },
    ],
  },

  {
    slug: "manna",
    h1: "A whole business was running out of one WhatsApp inbox.",
    standfirst:
      "Manna Cooking Studio teaches classes in Surabaya. Every booking, price question and payment receipt arrived as a message to one person's phone. I replaced the phone.",
    meta: [
      { key: "CONTEXT", value: "Paid client project" },
      { key: "CLIENT", value: "Manna Cooking Studio, Surabaya" },
      { key: "SURFACE", value: "The studio's own WhatsApp number" },
      { key: "OUTCOME", value: "24/7 coverage · ~80% less admin" },
    ],
    questions: [
      { label: "How did you stop it hallucinating prices?", topic: "evals" },
      { label: "What broke with real users?", topic: "manna" },
      { label: "What did the client actually pay for?", topic: "rate" },
    ],
    related: [
      {
        label: "Riset",
        note: "The same hybrid-retrieval instinct, pointed at research papers.",
        href: "/projects?q=riset",
      },
      {
        label: "Axrail commerce agent",
        note: "Conversational ordering again — this time on Bedrock, at production scale.",
        href: "/projects?q=axrail",
      },
    ],
    sections: [
      {
        label: "OVERVIEW",
        blocks: [
          {
            type: "text",
            md: "A WhatsApp agent that runs a cooking school's booking desk. RAG-grounded answers drawn from the studio's own documents, a four-step stateful booking flow with human payment approval, and live sync to Google Sheets and Calendar. My first paying client, and the project that taught me most about conversations in the wild.",
          },
        ],
      },
      {
        label: "MY ROLE",
        blocks: [
          {
            type: "text",
            md: "Sole engineer, and the person on the phone with the client. Scoping, curating the grounding documents with the owner, the RAG layer, the booking state machine, deployment onto their existing number — and the support conversations after launch, which is where the real requirements showed up.",
          },
        ],
      },
      {
        label: "PROBLEM",
        blocks: [
          {
            type: "text",
            md: "Availability, pricing, payment proof, calendar — all of it went through one person typing replies, during office hours only. Enquiries that arrived at 10pm were answered at 9am, by which point some of them had booked elsewhere. The studio didn't need a smarter chatbot; it needed the inbox to stop being a single point of failure.",
          },
        ],
      },
      {
        label: "APPROACH",
        blocks: [
          {
            type: "text",
            md: "An agent that lives on the studio's existing WhatsApp number — TypeScript with Baileys for the transport, Gemini for generation. Every factual answer is grounded: a RAG layer over ChromaDB with Gemini embeddings, indexed across 10+ curated documents the studio wrote themselves, so pricing and policy come from *their* words rather than the model's.",
          },
          {
            type: "text",
            md: "The harder half was the booking. A stateful conversation engine does intent extraction, then walks a multi-step flow — class selection → scheduling → payment proof → admin verification — writing through to Google Sheets and Calendar so inventory and appointments stay real-time.",
          },
        ],
      },
      {
        label: "ARCHITECTURE",
        blocks: [
          {
            type: "mermaid",
            kind: "flowchart LR",
            alt: "Messages arrive over WhatsApp via Baileys and go through intent extraction, which routes either to a RAG layer over ChromaDB for factual questions, or to a booking state machine. The booking path requires human admin verification of payment before writing through to Google Sheets and Calendar.",
            code: [
              '  wa["WhatsApp · Baileys"] --> intent["intent extraction"]',
              '  intent --> rag["RAG · ChromaDB"]',
              '  intent --> booking["booking state machine"]',
              '  booking --> admin["admin verification · human"]',
              '  admin --> sync["Sheets + Calendar"]',
              '  rag --> reply["grounded reply"]',
              "  class rag,booking emphasis",
              "  class admin draft",
              "  class sync terminal",
            ].join("\n"),
          },
          {
            type: "text",
            md: "Admin verification sits between payment proof and the calendar write — a human still approves money.",
          },
        ],
      },
      {
        label: "RESULTS",
        blocks: [
          {
            type: "metrics",
            items: [
              { value: "100%", label: "OF INBOUND HANDLED, 24/7", lead: true },
              { value: "~80%", label: "ADMIN WORKLOAD REMOVED (EST.)" },
              { value: "10+", label: "GROUNDING DOCUMENTS" },
              { value: "4", label: "STEPS IN THE BOOKING FLOW" },
            ],
          },
        ],
      },
      stackSection("manna"),
      {
        label: "TIMELINE",
        blocks: [
          {
            type: "timeline",
            entries: [
              {
                label: "PHASE 01",
                text: "Sat with the owner and turned the inbox into 10+ written documents. Nothing technical yet.",
              },
              {
                label: "PHASE 02",
                text: "RAG over those docs, answering questions only. Shipped read-only first, deliberately.",
              },
              {
                label: "PHASE 03",
                text: "Booking flow, payment proof and admin verification. Sheets and Calendar writes go live.",
              },
              {
                label: "PHASE 04",
                text: "Real users broke the state machine. Persistent sessions and re-entry paths fixed it.",
                current: true,
              },
            ],
          },
        ],
      },
      {
        label: "WHAT BROKE",
        blocks: [
          {
            type: "text",
            md: "Real people don't finish flows. They ask about a class, disappear for two days, then send a payment screenshot with no context. The first version treated every message as a fresh turn and cheerfully asked which class they meant — the studio owner noticed before I did.",
          },
          {
            type: "text",
            md: "The fix was expiring state with a memory of its own: sessions that persist across days, and a re-entry path that reconstructs where someone was instead of restarting them.",
          },
          {
            type: "callout",
            label: "INFERRED — CONFIRM",
            text: "This section was reconstructed from the shape of the project rather than from notes. Confirm the specifics before launch.",
          },
        ],
      },
      {
        label: "LESSON",
        blocks: [
          {
            type: "lesson",
            text: "The model was the easy part. Nearly all the work was *state* — and the thing that made the client trust it wasn't fluency, it was that a human still approves every payment.",
          },
        ],
      },
    ],
  },

  {
    slug: "talkative",
    h1: "“Close enough” is not feedback.",
    standfirst:
      "Language apps tell you that you were wrong. Talkative tells you *which sound* you missed — phoneme by phoneme, on streaming audio, in under two seconds.",
    meta: [
      { key: "CONTEXT", value: "Team product · I owned the ML backend" },
      { key: "WHERE", value: "Apple Developer Academy, 2025" },
      { key: "DOMAIN", value: "Speech · phoneme-level scoring" },
      { key: "OUTCOME", value: "<2s per utterance, 44+ phonemes" },
    ],
    questions: [
      { label: "Why phonemes instead of words?", topic: "cv" },
      { label: "How did you get it under two seconds?", topic: "evals" },
      { label: "What was the Academy year like?", topic: "datasaur" },
    ],
    related: [
      {
        label: "GerakinAja",
        note: "The other Academy build — also latency-bound, also on-device.",
        href: "/projects/gerakin",
      },
      {
        label: "Traffic congestion detection",
        note: "Another case of features beating a bigger model.",
        href: "/projects/traffic",
      },
    ],
    sections: [
      {
        label: "OVERVIEW",
        blocks: [
          {
            type: "text",
            md: "A pronunciation coach that scores speech phoneme by phoneme rather than word by word. Wav2Vec2 frame logits, Librosa DSP features and dynamic time warping give a learner a score for each of 44+ phonemes in under two seconds of streaming audio. Built with a team at the Apple Developer Academy in 2025.",
          },
        ],
      },
      {
        label: "MY ROLE",
        blocks: [
          {
            type: "text",
            md: "ML backend. The inference engine, the phoneme scoring and DTW alignment, the Django REST API around it, and the latency work that took it from unusable to under two seconds. Interaction design and the iOS client were my teammates'.",
          },
        ],
      },
      {
        label: "PROBLEM",
        blocks: [
          {
            type: "text",
            md: "A learner says a word wrong and gets a red cross. That tells them nothing actionable — the useful information is *where* in the word their mouth did the wrong thing. Off-the-shelf speech-to-text won't give you that: it returns the word it thinks you meant, which is precisely the information that hides the mistake.",
          },
        ],
      },
      {
        label: "APPROACH",
        blocks: [
          {
            type: "text",
            md: "Work below the word. A Wav2Vec2 model in PyTorch produces frame-level phonetic logits; Librosa handles the DSP side — MFCC and energy features from the raw stream. Dynamic time warping then aligns the learner's audio against the reference so each of 44+ phoneme classes gets its own score, even when the learner speaks slower or faster than the model.",
          },
          {
            type: "text",
            md: "Served from a Django REST backend so the phone stays thin, with byte-stream decoding optimised so scoring starts before the utterance is finished.",
          },
        ],
      },
      {
        label: "ARCHITECTURE",
        blocks: [
          {
            type: "mermaid",
            kind: "flowchart LR",
            alt: "Microphone audio is decoded as a byte stream and follows two parallel paths: Wav2Vec2 producing frame logits, and Librosa DSP producing MFCC and energy features. Both converge on DTW alignment, which emits scores for 44-plus phoneme classes to the feedback UI, in under two seconds per utterance.",
            code: [
              '  mic["mic · streaming"] --> dec["byte-stream decode"]',
              '  dec --> w2v["Wav2Vec2 · frame logits"]',
              '  dec --> dsp["Librosa DSP · MFCC / energy"]',
              '  w2v --> dtw["DTW alignment"]',
              '  dsp --> dtw',
              '  dtw --> scores["44+ phoneme scores"]',
              '  scores --> ui["feedback UI · &lt;2s"]',
              "  class w2v,dsp emphasis",
              "  class ui terminal",
            ].join("\n"),
          },
        ],
      },
      {
        label: "RESULTS",
        blocks: [
          {
            type: "metrics",
            items: [
              { value: "<2s", label: "LATENCY PER UTTERANCE", lead: true },
              { value: "44+", label: "PHONEME CLASSES SCORED" },
              { value: "DTW", label: "ALIGNMENT METHOD" },
              { value: "1", label: "SHIPPED APP, ACADEMY 2025" },
            ],
          },
        ],
      },
      stackSection("talkative"),
      {
        label: "TIMELINE",
        blocks: [
          {
            type: "timeline",
            entries: [
              {
                label: "PHASE 01",
                text: "Word-level scoring with off-the-shelf speech-to-text. Accurate, and useless as feedback.",
              },
              {
                label: "PHASE 02",
                text: "Dropped below the word — Wav2Vec2 logits plus DTW alignment for per-phoneme scores.",
              },
              {
                label: "PHASE 03",
                text: "Latency pass. Byte-stream decoding took it under two seconds and testers changed their minds.",
                current: true,
              },
            ],
          },
          ACADEMY_DATES_NOTE,
        ],
      },
      {
        label: "LESSON",
        blocks: [
          {
            type: "lesson",
            text: "Latency is a product decision. Nothing about the model changed when I got it under two seconds — I changed how the bytes arrived. Testers called the fast version “smart” and the slow one “broken.” Same scores, both times.",
          },
        ],
      },
    ],
  },

  {
    slug: "gerakin",
    h1: "A form coach that never leaves the phone.",
    standfirst:
      "Counting reps is easy. Knowing that a rep was *bad* — and saying so while the person is still moving — needs pose, physics and a state machine, all running on-device at 30 frames a second.",
    meta: [
      { key: "CONTEXT", value: "Team product · I owned the ML pipeline" },
      { key: "WHERE", value: "Apple Developer Academy, 2025" },
      { key: "DOMAIN", value: "Pose estimation · on-device" },
      { key: "OUTCOME", value: "<200ms per frame, fully offline" },
    ],
    questions: [
      { label: "Why a state machine and not a classifier?", topic: "cv" },
      { label: "How do you validate 'good form'?", topic: "evals" },
      { label: "What else have you shipped on-device?", topic: "cv" },
    ],
    related: [
      {
        label: "Talkative",
        note: "The other Academy build — latency as a product decision.",
        href: "/projects/talkative",
      },
      {
        label: "Cire",
        note: "Edge-to-cloud CV, where the win was batching rather than the model.",
        href: "/projects?q=cire",
      },
    ],
    sections: [
      {
        label: "OVERVIEW",
        blocks: [
          {
            type: "text",
            md: "An offline form coach. Apple Vision keypoints feed a CoreML action classifier, a five-state automaton counts only complete reps, and four biomechanical validators explain what went wrong — all on the phone, at 30 FPS, with no network calls. Apple Developer Academy, 2025.",
          },
        ],
      },
      {
        label: "MY ROLE",
        blocks: [
          {
            type: "text",
            md: "ML pipeline. Pose feature extraction, training the action classifier on 60-frame sequences, the rep-counting automaton and the constraint validators. The app shell and interaction design were the team's.",
          },
        ],
      },
      {
        label: "PROBLEM",
        blocks: [
          {
            type: "text",
            md: "Home workouts fail quietly: nobody tells you your back rounded on rep seven. A cloud model could judge it, but you can't stream a gym camera to a server and still be useful — the correction has to arrive while the movement is happening, and it has to work in a basement with no signal.",
          },
        ],
      },
      {
        label: "APPROACH",
        blocks: [
          {
            type: "text",
            md: "Apple Vision extracts 18 skeletal keypoints per frame. A custom CoreML action classifier — trained on 60-frame pose sequences — reads the movement rather than the posture, so it can tell a controlled descent from a collapse.",
          },
          {
            type: "text",
            md: "Counting is a **5-state finite automaton**, not a threshold: a rep only counts if the movement passes through every phase in order. Four biomechanical constraint validators run alongside it to catch the specific ways form breaks, which is what turns “wrong” into “your knee is travelling inward”.",
          },
        ],
      },
      {
        label: "ARCHITECTURE",
        blocks: [
          {
            type: "mermaid",
            kind: "flowchart TB",
            alt: "A 30 FPS camera feed goes to Apple Vision, extracting 18 skeletal keypoints, then to a CoreML classifier over a 60-frame window. Its output drives both a five-state rep automaton and four biomechanical constraint validators in parallel, which together produce a rep count plus a specific correction. No step leaves the device.",
            code: [
              '  cam["camera · 30 FPS"] --> vision["Vision · 18 keypoints"]',
              '  vision --> coreml["CoreML · 60-frame window"]',
              '  coreml --> fsm["5-state automaton"]',
              '  coreml --> validators["4 constraint validators"]',
              '  fsm --> out["count + correction"]',
              '  validators --> out',
              "  class fsm,validators emphasis",
              "  class out terminal",
            ].join("\n"),
          },
          {
            type: "text",
            md: "There is no network hop anywhere in this diagram — that's the whole design constraint.",
          },
        ],
      },
      {
        label: "RESULTS",
        blocks: [
          {
            type: "metrics",
            items: [
              { value: "<200ms", label: "PER-FRAME LATENCY", lead: true },
              { value: "18", label: "SKELETAL KEYPOINTS" },
              { value: "60", label: "FRAME POSE SEQUENCE" },
              { value: "0", label: "NETWORK CALLS PER SESSION" },
            ],
          },
        ],
      },
      stackSection("gerakin"),
      {
        label: "TIMELINE",
        blocks: [
          {
            type: "timeline",
            entries: [
              {
                label: "PHASE 01",
                text: "Per-frame pose classification. Counted phantom reps whenever someone shifted their weight.",
              },
              {
                label: "PHASE 02",
                text: "Moved to 60-frame sequences and a five-state automaton — a rep must pass every phase in order.",
              },
              {
                label: "PHASE 03",
                text: "Added four biomechanical validators, turning “wrong” into a specific, sayable correction.",
                current: true,
              },
            ],
          },
          ACADEMY_DATES_NOTE,
        ],
      },
      {
        label: "LESSON",
        blocks: [
          {
            type: "lesson",
            text: "The classifier alone was never enough. A rep is a sequence, and modelling it as one — automaton plus explicit physical constraints — did more for accuracy than any amount of extra training data. Sometimes the right answer is to write the rules down.",
          },
        ],
      },
    ],
  },
];

/** Validated at module load — a malformed block fails the build, not the page. */
export const caseStudies: CaseStudy[] = raw.map((c) => ({
  ...c,
  sections: c.sections.map((s) => ({ label: s.label, blocks: parseBlocks(s.blocks) })),
}));

export function caseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

/** Cycles through the four, so "NEXT CASE STUDY" never dead-ends. */
export function nextCaseStudy(slug: string): CaseStudy {
  const i = caseStudies.findIndex((c) => c.slug === slug);
  return caseStudies[(i + 1) % caseStudies.length];
}

/**
 * The 340px rail's page-aware context. Returns null for every route that isn't
 * a case study, which is the signal for the generic "ASK ME ANYTHING" panel.
 *
 * The section outline is derived from the case study's own sections, so it can
 * never drift from what's actually on the page.
 */
export function railContext(pathname: string): RailContext | null {
  const match = /^\/projects\/([^/]+)$/.exec(pathname);
  if (!match) return null;

  const study = caseStudyBySlug(match[1]);
  if (!study) return null;

  return {
    title: study.h1,
    sections: study.sections.map((s) => s.label),
    questions: study.questions,
    related: study.related,
  };
}
