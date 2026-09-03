import { parseBlocks, type Block, type BlockInput } from "../lib/blocks.ts";
import type { RailContext } from "../lib/rail.ts";
import type { TopicId } from "./answers.ts";
import { projectBySlug } from "./projects.ts";

// Mirror of the WIP set in projects.ts — filters the case study array in
// production so routes, the next-study cycle and hasChatPanel all stay in sync.
const LAUNCH_WIP = new Set(
  process.env.NEXT_PUBLIC_LAUNCH_MODE === "1"
    ? ["manna", "talkative", "gerakin"]
    : [],
);

// The four full case studies. One template, fixed section order:
//
//   OVERVIEW → MY ROLE → PROBLEM → APPROACH → ARCHITECTURE → RESULTS
//   → STACK → TIMELINE → LESSON
//
// Two studies insert one honesty section before STACK: Manna's WHAT BROKE and
// traffic's WHAT'S WEAK. The first six labels and the last are fixed — the
// content-integrity test enforces exactly that much.
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
      "Malang's CCTV cameras were already pointed at the road. My thesis turned them into a congestion sensor — two YOLO11 models, four traffic-flow features, and a classifier that calls the jam at 18–22 frames a second.",
    meta: [
      { key: "CONTEXT", value: "Undergraduate thesis · defended 2025" },
      { key: "WHERE", value: "Petra Christian University" },
      { key: "FEEDS", value: "Malang City CCTV · Diskominfo" },
      { key: "OUTCOME", value: "97.5% accuracy · 18–22 FPS" },
    ],
    questions: [
      { label: "Why not just count the vehicles?", topic: "cv" },
      { label: "How do you know 97.5% is real?", topic: "evals" },
      { label: "Where else have you used YOLO?", topic: "cv" },
    ],
    related: [
      {
        label: "Talkative",
        note: "Also reads raw sensor data — audio waveforms instead of video frames — to find structure in a noisy signal.",
        href: "/projects/talkative",
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
            md: "A congestion sensor built entirely out of a CCTV feed. Two fine-tuned YOLO11n models — one detecting vehicles, one segmenting the road surface — turn every frame into six numbers describing how traffic is *behaving*, and a small classifier reads those numbers as congested or not. **97.5% accuracy on the unseen test set**, with the whole pipeline running at 18–22 FPS. My undergraduate thesis at Petra Christian University, defended in 2025 against live feeds from Malang City.",
          },
          {
            type: "text",
            md: "Malang is a hard case on purpose. Indonesian traffic is heterogeneous and motorcycle-dominated — motorcycles are over **83% of vehicles nationally** — so a detector trained on car-shaped Western traffic has very little to say about it, and a model that can't see motorbikes can't see the jam.",
          },
        ],
      },
      {
        label: "MY ROLE",
        blocks: [
          {
            type: "text",
            md: "Sole engineer. I collected and hand-annotated all three datasets, fine-tuned both YOLO11 models, wrote the feature-extraction layer that turns boxes and masks into traffic numbers, trained and compared the two classifiers, ran the evaluation — and defended the whole thing.",
          },
        ],
      },
      {
        label: "PROBLEM",
        blocks: [
          {
            type: "text",
            md: "Congestion in Indonesian cities is measured badly or not at all, and it is expensive either way.",
          },
          {
            type: "list",
            items: [
              "**The cost is national-scale.** Congestion is estimated to cost IDR 63.4 trillion a year in lost economic activity and transport efficiency (DirJen Kemenhub, 2024).",
              "**The instruments are the obstacle.** Existing monitoring depends on costly, invasive hardware — in-ground loops, roadside sensors — or trades away accuracy to run in real time (Cui et al., 2020). Most intersections therefore go unmeasured.",
              "**Vision systems take the easy signal.** Earlier camera-based work classifies on vehicle count alone, ignoring density, occupancy and speed. Twenty vehicles moving freely and twenty vehicles stopped are the same count.",
            ],
          },
          {
            type: "text",
            md: "So the thesis had two questions to answer: does classifying on **four traffic-flow features** — flow, occupancy, density and speed — detect congestion more accurately than counting? And how accurate is YOLO11 in the first place on a vehicle population that is mostly motorbikes?",
          },
        ],
      },
      {
        label: "APPROACH",
        blocks: [
          {
            type: "text",
            md: "Measure behaviour, not headcount. The detector's job is not to answer the question — it is to produce the raw material the four features are computed from.",
          },
          { type: "heading", text: "The four features" },
          {
            type: "table",
            columns: [
              { label: "Feature" },
              { label: "Derived from" },
              { label: "What it catches" },
            ],
            rows: [
              {
                cells: [
                  "Flow",
                  "Per-class detection counts — `flow_car`, `flow_motorbike`",
                  "How much traffic is passing",
                ],
              },
              {
                cells: [
                  "Density",
                  "Detected vehicle area against segmented road area — `density_car`, `density_motorbike`",
                  "How tightly packed it is",
                ],
              },
              {
                cells: [
                  "Occupancy",
                  "Share of the drivable road covered by vehicles",
                  "How full the asphalt is",
                ],
              },
              {
                cells: ["Speed", "Frame-to-frame motion of detections", "Whether it is moving at all"],
              },
            ],
            footnote:
              "Six columns in the dataset — flow and density are split by vehicle class — plus the binary `congested` label.",
          },
          {
            type: "text",
            md: "Road segmentation is what makes density and occupancy mean anything. Without it, density is vehicles-per-frame, which changes with camera angle rather than with traffic.",
          },
          { type: "heading", text: "Three datasets, all hand-labelled" },
          {
            type: "table",
            columns: [{ label: "Dataset" }, { label: "Size" }, { label: "Labelling" }, { label: "Augmentation" }],
            rows: [
              {
                cells: [
                  "Vehicle detection",
                  "850 images · 2 classes",
                  "Bounding boxes by hand in Roboflow",
                  "Brightness, exposure, blur",
                ],
              },
              {
                cells: [
                  "Road segmentation",
                  "430 images",
                  "Polygons by hand in Roboflow",
                  "Rotation, horizontal flip, colour correction",
                ],
              },
              {
                cells: [
                  "Congestion classification",
                  "20,113 rows · 6 features",
                  "Generated by the pipeline, labelled `congested`",
                  "—",
                ],
              },
            ],
            footnote:
              "The classification set is near-balanced — 10,059 not congested (50.01%) against 10,054 congested (49.99%) — which is what makes accuracy a fair headline number rather than a flattering one.",
          },
          {
            type: "image",
            src: "/assets/traffic/detection-dataset.png",
            caption: "Vehicle detection dataset — a raw CCTV frame beside the same frame with Car and Motorbike boxes.",
            ratio: "16 / 9",
          },
          {
            type: "image",
            src: "/assets/traffic/segmentation-dataset.png",
            caption: "Road segmentation dataset — the same street with the drivable surface drawn as polygons.",
            ratio: "16 / 9",
          },
        ],
      },
      {
        label: "ARCHITECTURE",
        blocks: [
          {
            type: "mermaid",
            kind: "flowchart LR",
            alt: "A Malang CCTV stream feeds three things in parallel: a YOLO11n vehicle detector, a YOLO11n-seg road-surface segmenter, and a speed measurement taken from frame-to-frame motion. The detector produces flow; detector and segmenter together produce density and occupancy. Flow, density, occupancy and speed go to a classifier — a neural network or an SVM — which outputs congested or not congested.",
            code: [
              '  cctv["CCTV stream · Malang"] --> veh["YOLO11n · vehicles"]',
              '  cctv --> road["YOLO11n-seg · road surface"]',
              '  cctv --> speed["speed · frame-to-frame motion"]',
              '  veh --> flow["flow · car + motorbike"]',
              '  veh --> dens["density"]',
              '  road --> dens',
              '  veh --> occ["occupancy"]',
              '  road --> occ',
              '  flow --> clf["classifier · NN or SVM"]',
              '  dens --> clf',
              '  occ --> clf',
              '  speed --> clf',
              '  clf --> out["congested / not congested"]',
              "  class veh,road emphasis",
              "  class out terminal",
            ].join("\n"),
          },
          {
            type: "text",
            md: "Two branches of a single frame meet again at the feature vector: the detector says *what and how many*, the segmenter says *out of how much road*, and the motion between frames says *how fast*. Only then does anything classify.",
          },
          { type: "heading", text: "How each model was trained" },
          {
            type: "mermaid",
            kind: "flowchart TB",
            alt: "Training flow shared by all three models: the Roboflow dataset is split and pre-processed with augmentation, pretrained weights are loaded, hyperparameters are set, the model is trained and saved. Evaluation then runs the saved model over the held-out validation split and reports precision, recall and mAP.",
            code: [
              '  ds["dataset · split"] --> pre["pre-processing + augmentation"]',
              '  pre --> load["load pretrained weights"]',
              '  load --> hp["set hyperparameters"]',
              '  hp --> train["train"]',
              '  train --> saved["saved model"]',
              '  saved --> infer["inference on held-out split"]',
              '  val["validation data"] --> infer',
              '  infer --> metrics["evaluate · P, R, mAP"]',
              "  class train emphasis",
              "  class metrics terminal",
            ].join("\n"),
          },
          {
            type: "text",
            md: "The same shape ran three times — YOLO11n for detection, YOLO11n-seg for segmentation, and the classifiers over the extracted features. Only the dataset and the metrics change; the SVM adds a grid search over its hyperparameters in the training step.",
          },
          {
            type: "text",
            md: "**Speed** is measured using Lucas-Kanade sparse optical flow — tracking the pixel displacement of detected vehicle centroids frame-to-frame and converting it to a normalised speed feature. Combined with SSIM-based frame sampling to skip visually redundant frames, this keeps the pipeline at 18–22 FPS on real CCTV footage.",
          },
        ],
      },
      {
        label: "RESULTS",
        blocks: [
          {
            type: "metrics",
            items: [
              { value: "97.5%", label: "CONGESTION ACCURACY · TEST SET", lead: true },
              { value: "90.8%", label: "VEHICLE DETECTION mAP@50" },
              { value: "72.7%", label: "ROAD SEGMENTATION MASK mAP@50" },
              { value: "18–22", label: "FPS END TO END" },
            ],
          },
          { type: "heading", text: "Vehicle detection — YOLO11n" },
          {
            type: "table",
            columns: [
              { label: "Class" },
              { label: "P", align: "right" },
              { label: "R", align: "right" },
              { label: "mAP@50", align: "right" },
              { label: "mAP@50-95", align: "right" },
            ],
            rows: [
              { cells: ["All", "0.853", "0.831", "0.908", "0.682"], highlight: true },
              { cells: ["Car", "0.862", "0.907", "0.952", "0.799"] },
              { cells: ["Motorbike", "0.844", "0.754", "0.864", "0.564"] },
            ],
            footnote: "14.4 ms per image — fast enough to run on the live stream rather than on stored clips.",
          },
          {
            type: "text",
            md: "Cars are close to solved at 95.2% mAP@50. Motorbikes are the honest number: **75.4% recall**, and mAP@50-95 of 56.4%. They are small, they cluster, and in a queue they physically occlude one another — which is exactly the condition the system is meant to detect.",
          },
          {
            type: "image",
            src: "/assets/traffic/detection-eval.png",
            caption: "Detection evaluation — normalised confusion matrix and the precision-recall curve per class.",
            ratio: "6 / 4",
          },
          {
            type: "image",
            src: "/assets/traffic/detection-samples.png",
            caption: "Detection on free-flowing traffic, and on a dense high-occlusion queue at the same junction.",
            ratio: "16 / 9",
          },
          { type: "heading", text: "Road segmentation — YOLO11n-seg" },
          {
            type: "metrics",
            items: [
              { value: "72.7%", label: "MASK mAP@50" },
              { value: "83.1%", label: "PRECISION" },
              { value: "67.1%", label: "RECALL" },
              { value: "48.2%", label: "MASK mAP@50-95" },
            ],
          },
          {
            type: "text",
            md: "Decent in daylight and clearly the weaker half of the pipeline at night: glare and uneven street lighting break the road mask into fragments, and everything computed against road area degrades with it.",
          },
          {
            type: "image",
            src: "/assets/traffic/segmentation-samples.png",
            caption: "Segmentation in daylight against the same model at night — one clean mask, three fragmented ones.",
            ratio: "16 / 9",
          },
          { type: "heading", text: "Feature extraction" },
          {
            type: "text",
            md: "The raw YOLO outputs — boxes and masks — are converted per frame into the six numerical features, printed alongside the overlay while the stream runs. This is the layer that made the dataset: 20,113 rows of real traffic state.",
          },
          {
            type: "image",
            src: "/assets/traffic/feature-extraction.png",
            caption: "Live feature extraction — FPS, car and motorbike counts, density, occupancy and speed per frame.",
            ratio: "16 / 9",
          },
          { type: "heading", text: "The classifier — two of them" },
          {
            type: "table",
            columns: [
              { label: "Model" },
              { label: "Accuracy", align: "right" },
              { label: "Precision", align: "right" },
              { label: "Recall", align: "right" },
              { label: "F1", align: "right" },
            ],
            rows: [
              {
                cells: ["Neural network", "97.54%", "98%", "98%", "98%"],
                highlight: true,
              },
              { cells: ["SVM · grid-searched", "97.38%", "98.2%", "96.5%", "97.35%"] },
            ],
            footnote:
              "NN figures are the macro average over both classes; its test ROC AUC is 0.9967. The deck quotes the NN at 97.54% on the results slide and 97.57% in the conclusion — confirm which is final.",
          },
          {
            type: "text",
            md: "Both were trained on the same 20,113 rows and both land within two-tenths of a percent of each other, which says more about the features than about either model. The neural network is the one the conclusion runs on.",
          },
          {
            type: "code",
            caption: "PYTORCH · TrafficClassifier",
            code: [
              "TrafficClassifier(",
              "  (layer_1):     Linear(in_features=6, out_features=64, bias=True)",
              "  (relu1):       ReLU()",
              "  (dropout1):    Dropout(p=0.3, inplace=False)",
              "  (layer_2):     Linear(in_features=64, out_features=32, bias=True)",
              "  (relu2):       ReLU()",
              "  (dropout2):    Dropout(p=0.3, inplace=False)",
              "  (output_layer):Linear(in_features=32, out_features=1, bias=True)",
              "  (sigmoid):     Sigmoid()",
              ")",
            ].join("\n"),
          },
          {
            type: "text",
            md: "Six inputs, two hidden layers of 64 and 32 units, ReLU with 0.3 dropout on each, one sigmoid output. Small on purpose — the features carry the signal, so the model doesn't have to.",
          },
          {
            type: "image",
            src: "/assets/traffic/classifier-live.png",
            caption: "The classifier live on the stream — the same junction called Not Congested and Congested.",
            ratio: "16 / 9",
          },
        ],
      },
      {
        label: "WHAT'S WEAK",
        blocks: [
          {
            type: "text",
            md: "Two numbers in the results are worse than the headline, and both were in the defence rather than hidden behind it.",
          },
          {
            type: "cards",
            columns: 2,
            items: [
              {
                label: "WEAKEST NUMBER",
                title: "Motorbike recall — 75.4%",
                tone: "warn",
                body: [
                  "One in four motorbikes is missed in dense, heavily occluded queues",
                  "Fix: occlusion-specific augmentation",
                  "Fix: DeepSORT tracking to hold identity through a crowd",
                  "Fix: more high-occlusion training examples",
                ],
              },
              {
                label: "SECOND WEAKEST",
                title: "Segmentation mAP@50-95 — 48.2%",
                tone: "warn",
                body: [
                  "Mask precision falls off at night — glare and uneven lighting",
                  "Fix: more night-time and multi-angle images",
                  "Fix: evaluate alternative segmentation architectures",
                ],
              },
            ],
          },
          {
            type: "text",
            md: "And a scope limit worth stating plainly: every number here is measured on Malang City CCTV. The thesis makes no claim about other cities, other camera heights, or other traffic mixes.",
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
                label: "OCT — DEC 2024 · PROPOSAL",
                text: "Literature review, problem scoping and proposal document — establishing the four-feature hypothesis and choosing YOLO11 as the detector.",
              },
              {
                label: "JAN 2025 · PROPOSAL DEFENCE",
                text: "Proposal defended and approved at Petra Christian University.",
              },
              {
                label: "JAN — MAY 2025 · BUILD",
                text: "Dataset sampling and labelling in Roboflow (850 detection frames, 430 segmentation frames), fine-tuning both YOLO11n models, extracting 20,113 feature rows, and training the NN and SVM classifiers.",
              },
              {
                label: "JUN 2025 · THESIS DEFENCE",
                text: "Full pipeline — detection, segmentation, Lucas-Kanade speed, classification — running live at 18–22 FPS. 97.5% accuracy on the unseen test set.",
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
            text: "The feature engineering beat the bigger model. Counting vehicles is the obvious signal and the wrong one — twenty moving and twenty stopped are the same count. Once flow, density, occupancy and speed were right, two hidden layers were enough to separate them, and a grid-searched SVM landed within two-tenths of a percent of the network. The work was never in the classifier.",
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
        label: "Traffic congestion detection",
        note: "The same discipline of reading a messy signal — congestion from CCTV, intent from WhatsApp — and giving it structure.",
        href: "/projects/traffic",
      },
      {
        label: "GerakinAja",
        note: "Also shipped on a real platform; also about what 'done' means to the person using it.",
        href: "/projects/gerakin",
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
        label: "Traffic congestion detection",
        note: "Also on-device intelligence — same instinct to keep inference tight and avoid the network call.",
        href: "/projects/traffic",
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

/** Validated at module load — a malformed block fails the build, not the page.
 *  WIP studies are omitted in production (NEXT_PUBLIC_LAUNCH_MODE=1) so the
 *  next-study cycle, static params and hasChatPanel all stay consistent. */
export const caseStudies: CaseStudy[] = raw
  .filter((c) => !LAUNCH_WIP.has(c.slug))
  .map((c) => ({
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
 * The section outline is NOT here — it lives in the page's left column, where
 * an anchor can actually move the reader. What the rail keeps is the scope.
 */
export function railContext(pathname: string): RailContext | null {
  const match = /^\/projects\/([^/]+)$/.exec(pathname);
  if (!match) return null;

  const study = caseStudyBySlug(match[1]);
  if (!study) return null;

  return {
    slug: study.slug,
    // The project record owns the short name — there is no second list.
    name: projectBySlug(study.slug)?.name ?? study.slug,
  };
}

/** Where the chat panel renders: Home, and a case study. Everywhere else it was
 *  a column of chips that navigated you away. Shell, ChatPanel and TopBar all
 *  read this one function so the layout and the top bar's Ask link can't drift. */
export function hasChatPanel(pathname: string): boolean {
  return pathname === "/" || railContext(pathname) !== null;
}

/** Section anchor id, shared by the page's contents list and its headings so
 *  the two can never disagree. */
export function sectionId(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
