export const HANDLE = "@abelitovisese";

export const formats = [
  {
    n: "FORMAT 01",
    title: "Explainers",
    body: "One concept, one minute, no jargon debt. Embeddings, retrieval, why your bot lies to you with total confidence.",
  },
  {
    n: "FORMAT 02",
    title: "This week in AI",
    body: "Sourced by **Riset**, my own research agent, then filtered by a human who has to say it out loud.",
  },
  {
    n: "FORMAT 03",
    title: "Day in the life",
    body: "What this job is actually like — including the afternoons where the demo doesn't work and nobody knows why.",
  },
];

/** Placeholder tiles until the real TikTok embed IDs arrive. `url` stays
 *  undefined and the tile renders as the specced dashed 9:16 well. */
export const videos: { caption: string; url?: string }[] = [
  { caption: '"Why your RAG bot lies to you"' },
  { caption: "Embeddings, explained with a map" },
  { caption: "This week: re-ranking results" },
  { caption: "A day of debugging retrieval" },
];

export const needsEmbeds = videos.some((v) => !v.url);
