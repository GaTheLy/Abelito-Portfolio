import { parseBlocks, type Block, type BlockInput } from "../lib/blocks.ts";
import type { RailContext } from "../lib/rail.ts";
import type { TopicId } from "./answers.ts";
import { projectBySlug, LAUNCH_WIP } from "./projects.ts";

// The full case studies. One template, fixed section order:
//
//   OVERVIEW → MY ROLE → PROBLEM → APPROACH → ARCHITECTURE → RESULTS
//   → STACK → TIMELINE → LESSON
//
// Two studies insert one honesty section before STACK: Manna's WHAT'S NOT
// REAL and traffic's WHAT'S WEAK. The first six labels and the last are fixed — the
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
        label: "Manna Cooking Studio",
        note: "Also won by structure rather than a bigger model — there, a database row the agent reads instead of a price it guesses.",
        href: "/projects/manna",
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
    h1: "Three surfaces, one database, nobody typing replies.",
    standfirst:
      "A cooking studio's entire booking journey — browse, reserve, pay, confirm — built end to end as a demo. A customer website, an admin dashboard and a WhatsApp agent, all reading and writing the same real-time database.",
    meta: [
      { key: "CONTEXT", value: "Self-directed demo · never deployed" },
      { key: "USE CASE", value: "Manna Cooking Studio, Malang" },
      { key: "SURFACES", value: "Website · dashboard · WhatsApp" },
      { key: "OUTCOME", value: "One journey, three surfaces, no inbox" },
    ],
    questions: [
      { label: "How is it grounded so it can't invent a price?", topic: "evals" },
      { label: "Why three surfaces instead of just a bot?", topic: "manna" },
      { label: "Would you build this for a real studio?", topic: "rate" },
    ],
    related: [
      {
        label: "Traffic congestion detection",
        note: "The other end of the same instinct — reading a messy real-world signal and giving it enough structure to act on.",
        href: "/projects/traffic",
      },
      {
        label: "Talkative",
        note: "Also checks the model against a known answer — a target phoneme string instead of a database row.",
        href: "/projects/talkative",
      },
    ],
    sections: [
      {
        label: "OVERVIEW",
        blocks: [
          {
            type: "text",
            md: "A full-stack booking platform for a cooking studio, built as my own demonstration of what an end-to-end AI-integrated system actually costs to assemble. Three surfaces — a customer-facing website, an admin dashboard, and a WhatsApp agent — sit on one Supabase database, so a slot booked on the web disappears from the bot's availability in the same breath.",
          },
          {
            type: "text",
            md: "The interesting half is the agent. Every factual answer it gives — price, duration, difficulty, how many seats are left — is retrieved from the live database rather than generated, and no booking is confirmed until a human has looked at the payment proof.",
          },
          {
            type: "callout",
            label: "DEMO · NOT DEPLOYED",
            text: "This is an independent personal project. Manna Cooking Studio is used strictly as an example use case — the system has never run in their operations, and nothing on this page is a business outcome.",
          },
        ],
      },
      {
        label: "MY ROLE",
        blocks: [
          {
            type: "text",
            md: "Sole engineer, and the person who decided what it should be. The schema, the customer site, the admin dashboard, the WhatsApp agent, the retrieval layer and the booking flow that runs across all three. There was no client to hand me requirements, which meant scoping was the first piece of work rather than the free one.",
          },
        ],
      },
      {
        label: "PROBLEM",
        blocks: [
          {
            type: "text",
            md: "Small studios run on messaging apps and spreadsheets, and the seams between them are where bookings get lost. I picked the three failures that show up first:",
          },
          {
            type: "list",
            items: [
              "**Scattered enquiries.** Class questions arrive across separate WhatsApp threads, so availability lives in whoever answered last.",
              "**Spreadsheet tracking.** Bookings kept by hand have no real-time state — double-bookings and missed reservations are a matter of timing, not carelessness.",
              "**Manual payment confirmation.** A customer sends a screenshot and waits. The gap between proof and confirmation is where the reservation feels unreal to both sides.",
            ],
          },
          {
            type: "text",
            md: "None of that is an AI problem. It's a *shared state* problem — which is exactly why the model is the smallest part of what follows.",
          },
        ],
      },
      {
        label: "APPROACH",
        blocks: [
          {
            type: "text",
            md: "One database, three ways in. Supabase holds classes, sessions, bookings and assets; React and TypeScript on the front, Node and Express behind, Google Gemini for the conversational layer. Each surface owns a different job and none of them owns a copy of the truth.",
          },
          {
            type: "table",
            columns: [
              { label: "SURFACE" },
              { label: "WHAT IT OWNS" },
              { label: "WHY IT EXISTS" },
            ],
            rows: [
              {
                cells: [
                  "Customer website",
                  "Browsing, live search by category and difficulty, a three-step booking wizard showing remaining capacity",
                  "The funnel. It ends by handing the customer to WhatsApp, where they already are",
                ],
              },
              {
                cells: [
                  "WhatsApp agent",
                  "Onboarding, class recommendations, grounded Q&A, order capture, payment proof, the final receipt",
                  "The surface people actually use. No app to install, no account to make",
                ],
                highlight: true,
              },
              {
                cells: [
                  "Admin dashboard",
                  "Class CRUD, session scheduling, booking and payment verification, gallery assets, occupancy and revenue view",
                  "Replaces the spreadsheet, and is the only place a payment gets approved",
                ],
              },
            ],
          },
          {
            type: "text",
            md: "The agent's grounding is the part I'd defend hardest. Rather than answering from the model's own sense of what a cooking class costs, it retrieves pricing, duration and **live slot counts straight from the database** and answers from that — retrieval-augmented generation where the corpus is the operational data itself, not a folder of documents that goes stale the moment a schedule changes.",
          },
          {
            type: "text",
            md: "It also reads the *user* rather than just the query: someone who says they've never cooked before gets steered to a beginner class, and a follow-up about curriculum or format resolves against the same retrieved record instead of restarting the conversation.",
          },
          {
            type: "image",
            caption: "Customer website — the three-step booking wizard, with remaining capacity shown per slot.",
            ratio: "16 / 9",
          },
          {
            type: "text",
            md: "Money is where the automation deliberately stops. The agent extracts the booking parameters from natural conversation — name, participant count, class, slot — then pauses. An administrator opens the payment proof in the dashboard and approves, rejects or reschedules; only then does the confirmation and its generated PDF receipt go out. **Human-in-the-loop is not a limitation here, it's the feature.**",
          },
          {
            type: "image",
            caption: "Admin dashboard — booking and verification, with the uploaded payment proof and approve / reschedule / cancel actions.",
            ratio: "16 / 9",
          },
          {
            type: "image",
            caption: "The WhatsApp conversation end to end — greeting, class recommendation, grounded answer, order capture, receipt.",
            ratio: "9 / 16",
          },
        ],
      },
      {
        label: "ARCHITECTURE",
        blocks: [
          {
            type: "mermaid",
            kind: "flowchart LR",
            alt: "A customer website, an admin dashboard and a WhatsApp agent all read and write one Supabase database. The agent answers questions through a retrieval layer that queries live database records rather than the model's own knowledge. Bookings pause at a human admin verification step before a confirmation and PDF receipt are issued.",
            code: [
              '  web["customer website"] --> db[("Supabase · one real-time DB")]',
              '  wa["WhatsApp agent · Gemini"] --> rag["retrieval over live records"]',
              "  rag --> db",
              '  dash["admin dashboard"] --> db',
              '  db --> verify["payment verification · human"]',
              '  verify --> out["confirmation + PDF receipt"]',
              "  class rag emphasis",
              "  class verify draft",
              "  class out terminal",
            ].join("\n"),
          },
          {
            type: "text",
            md: "There is no second store and no sync job. The dashboard's schedule blocks *are* the availability the agent quotes — which is the whole reason the three surfaces can't contradict each other.",
          },
          {
            type: "mermaid",
            kind: "sequenceDiagram",
            alt: "A customer browses classes on the website, which hands them to WhatsApp. The agent answers questions from retrieved data and captures the order, then sends the payment proof to an admin. Once the admin approves, the agent returns a confirmation and a generated PDF receipt.",
            code: [
              "  participant C as Customer",
              "  participant W as Website",
              "  participant B as WhatsApp agent",
              "  participant A as Admin",
              "  C->>W: browse classes, check a slot",
              "  W->>C: hand off to WhatsApp",
              "  C->>B: ask about price, level, availability",
              "  B->>C: answer from retrieved live records",
              "  C->>B: confirm details, send payment proof",
              "  B->>A: pause for verification",
              "  A-->>B: approve",
              "  B-->>C: confirmation + PDF receipt",
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
              { value: "3", label: "SURFACES ON ONE DATABASE", lead: true },
              { value: "3", label: "STEPS IN THE BOOKING WIZARD" },
              { value: "<2 min", label: "DESIGN TARGET, BROWSE TO BOOKED" },
              { value: "0", label: "REAL DEPLOYMENTS" },
            ],
          },
          {
            type: "text",
            md: "What the build actually demonstrates is narrower than a case study usually claims, so here it is plainly: a booking can be started on the web and finished in WhatsApp; the agent's factual answers come from the same rows the dashboard edits; and no reservation reaches a customer without a person having approved the money.",
          },
          {
            type: "callout",
            label: "NOT MEASURED",
            text: "These are properties of the build, not outcomes. There is no production traffic behind them — no adoption number, no admin hours saved, no error rate. If any figure here is ever restated as impact, it needs a real deployment first.",
          },
        ],
      },
      {
        label: "WHAT'S NOT REAL",
        blocks: [
          {
            type: "text",
            md: "The studio never used this. Manna Cooking Studio is an example use case chosen to make the demo concrete, not a client — there was no engagement, no handover, and no one's actual bookings ever went through it.",
          },
          {
            type: "text",
            md: "Which means the hardest test never happened. Real conversations pause for days, arrive out of order and resume with a payment screenshot and no context; I've designed for that, but a demo can't tell me whether the design survives it. The parts I'd expect to break first are session re-entry and anything that assumes a customer answers the question you actually asked.",
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
                text: "Schema first. Classes, sessions, bookings and assets in Supabase — the shared truth all three surfaces would have to agree on.",
              },
              {
                label: "PHASE 02",
                text: "The customer website. Browsing, live search and the three-step booking wizard, ending in a hand-off to WhatsApp.",
              },
              {
                label: "PHASE 03",
                text: "The WhatsApp agent. Retrieval over live records, order capture from natural conversation, and the pause for payment verification.",
              },
              {
                label: "PHASE 04",
                text: "The admin dashboard. Class and session management, payment approval, and the occupancy view that closes the loop.",
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
            text: "Building all three surfaces myself is what taught me the thing one of them alone never would: an agent is only as trustworthy as the schema underneath it. The model didn't stop inventing prices because I prompted it better — it stopped because there was a row to read.",
          },
        ],
      },
    ],
  },

  {
    slug: "talkative",
    h1: "“Close enough” is not feedback.",
    standfirst:
      "Language apps tell you that you were wrong. Talkative tells you *which sound* you missed — and which one you added that shouldn't be there. Phoneme by phoneme, on the device, in under two seconds.",
    meta: [
      { key: "CONTEXT", value: "Team product · Academy 2025" },
      { key: "WHERE", value: "iOS · runs on the device" },
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
        label: "Manna Cooking Studio",
        note: "Also checks the model against a known answer — a database row instead of a target phoneme string.",
        href: "/projects/manna",
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
            md: "A pronunciation coach that scores speech phoneme by phoneme rather than word by word. The sentence you're meant to say is turned into its phonetic spelling; the sentence you actually said is read back the same way; the two are lined up, and every symbol gets its own score. **44+ phoneme classes, under two seconds per utterance**, running on the phone. Built with a team at the Apple Developer Academy in 2025.",
          },
          {
            type: "text",
            md: "The part that separates it from a spelling checker for speech is what it catches. Most models are trained to *ignore* the sounds that don't belong, because they're looking for meaning. A pronunciation coach has to do the opposite — the sound you added is exactly the thing worth telling you about.",
          },
        ],
      },
      {
        label: "MY ROLE",
        blocks: [
          {
            type: "text",
            md: "iOS developer and AI engineer — the app and the model under it. SwiftUI on the front, the phoneme recognition and the alignment that scores it, the latency work, and the conversion that moved the whole thing onto the device. Interaction design was my teammates'.",
          },
        ],
      },
      {
        label: "PROBLEM",
        blocks: [
          {
            type: "text",
            md: "Learning a language is intimidating less because of grammar than because of the fear of sounding wrong — and most pronunciation apps answer that fear with a pass/fail. Two gaps in the existing tools do the damage:",
          },
          {
            type: "list",
            items: [
              "**The black box.** Speech-to-text tells a learner *what* they said, never *how*. The engine flags the whole word wrong even when one sound was off, so a red line under “Think” doesn't say whether the mistake was the *Th* (tongue position) or the *ink* (vowel shape).",
              "**Extra sounds are invisible.** Learners don't only substitute sounds, they insert them — “school-uh” for “school” — or swallow the ending consonant. Speech models are built to treat that as noise on the way to meaning. For a coach, that noise *is* the lesson.",
            ],
          },
          {
            type: "text",
            md: "So the question the build had to answer: **how might we give precise, phoneme-level feedback so a learner can practise with confidence?**",
          },
        ],
      },
      {
        label: "APPROACH",
        blocks: [
          {
            type: "text",
            md: "Work below the word, on both sides of the comparison. eSpeak-NG converts the target sentence into the phoneme string it *should* be — grapheme-to-phoneme, deterministic, no model involved. A Wav2Vec2Phoneme model reads the recording into the phoneme string it *actually* was. Aligning those two strings is where every kind of error becomes visible at once.",
          },
          {
            type: "text",
            md: "The two strings are scored against each other with **Levenshtein distance**, and picking an edit-distance metric is what makes the second problem from above disappear on its own. Its three operations *are* the three ways a learner goes wrong: a **substitution** is a swapped sound, a **deletion** is a swallowed one, and an **insertion** is the extra sound nobody else was looking for. The gaps in the table below are those deletions and insertions — no special case, just what the algorithm already returns.",
          },
          {
            type: "table",
            columns: [{ label: "TARGET" }, { label: "USER SAID" }, { label: "SCORE", align: "right" }],
            rows: [
              { cells: ["æ", "aɪ", "0%"] },
              { cells: ["t", "—", "0%"] },
              { cells: ["m", "m", "76%"], highlight: true },
              { cells: ["ə", "ə", "82%"], highlight: true },
              { cells: ["s", "z", "0%"] },
              { cells: ["f", "p", "0%"] },
              { cells: ["ɪɹ", "ɪɹ", "92%"], highlight: true },
              { cells: ["—", "s", "—"] },
            ],
            footnote:
              "One word — “atmosphere” — as the app scores it. A dash in TARGET is a sound the learner added; a dash in USER SAID is one they swallowed. Neither is a substitution, and a word-level checker sees both as the same single red cross.",
          },
          {
            type: "text",
            md: "The feedback lands on the text itself rather than in a report: a 0–100% phonetic match score for the utterance, correct phonemes in green and mispronunciations in red, and any error word tappable to see how the articulation differed from the target sound.",
          },
          {
            type: "figures",
            items: [
              {
                src: "/assets/talkative/practice.png",
                caption: "Custom Mode — reading your own script aloud, current phrase highlighted, waveform live.",
                // Both shots are ~1:2, not 9:16. Shared so the pair sits level.
                ratio: "1 / 2",
              },
              {
                src: "/assets/talkative/evaluation.png",
                caption: "Evaluation detail — expected against heard, per sound, with the exact miss named.",
                ratio: "1 / 2",
              },
            ],
          },
          {
            type: "text",
            md: "It didn't start on the phone. The first working version served a PyTorch model from a REST backend and the round trip dominated everything — the latency pass that got it under two seconds was byte-stream decoding, not a better model. Converting to CoreML afterwards took the network out of the loop entirely, which is also what made it usable offline.",
          },
        ],
      },
      {
        label: "ARCHITECTURE",
        blocks: [
          {
            type: "mermaid",
            kind: "flowchart LR",
            alt: "Two inputs run in parallel. The target sentence, Hello World, is converted by eSpeak-NG into the target phoneme string h-schwa-l-o-u w-open-e-length-l-d. The user's sound input is converted by Wav2Vec2Phoneme into the phoneme string they actually produced, h-a-l-o w-open-e-r-l-d. Both strings meet at a pronunciation scorer running a Levenshtein distance algorithm, whose output drives the feedback UI.",
            code: [
              '  sent["target sentence: Hello World"] -->|eSpeak-NG| tgt["target phonemes: həloʊ wɜːld"]',
              '  audio["user sound input"] -->|Wav2Vec2Phoneme| got["input phonemes: halo wɜrld"]',
              '  tgt --> scorer["pronunciation scorer: Levenshtein distance"]',
              "  got --> scorer",
              '  scorer --> ui["feedback UI"]',
              "  class scorer emphasis",
              "  class ui terminal",
            ].join("\n"),
          },
          {
            type: "text",
            md: "Both halves run on the phone, which is why the score arrives while the learner is still looking at the sentence they just read.",
          },
        ],
      },
      {
        label: "RESULTS",
        blocks: [
          {
            type: "metrics",
            items: [
              { value: "<2s", label: "PER UTTERANCE", lead: true },
              { value: "44+", label: "PHONEME CLASSES SCORED" },
              { value: "0–100%", label: "PHONETIC MATCH SCORE" },
              { value: "3", label: "ERROR TYPES CAUGHT" },
            ],
          },
          {
            type: "text",
            md: "The three error types are the whole argument, and they come free with the metric — substitution, deletion and insertion are exactly what Levenshtein distance counts. A word-level checker collapses all three into one red cross.",
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
                text: "Dropped below the word — eSpeak-NG for the target phonemes, Wav2Vec2Phoneme for the spoken ones, aligned so omissions and insertions show up too.",
              },
              {
                label: "PHASE 03",
                text: "Served from a REST backend. The latency pass on byte-stream decoding took it under two seconds and testers changed their minds.",
              },
              {
                label: "PHASE 04",
                text: "Converted to CoreML and moved on-device. The network left the loop, and so did the requirement to have one.",
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
            text: "Latency is a product decision. Nothing about the model changed when I got it under two seconds — I changed how the bytes arrived. Testers called the fast version “smart” and the slow one “broken.” Same scores, both times.",
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

/** Cycles through every study, so "NEXT CASE STUDY" never dead-ends. */
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
