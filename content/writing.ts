import type { MediumPost } from "../lib/medium.ts";

// Writing lives on Medium and is pulled from its RSS feed at request time
// (revalidated hourly), so publishing a post is all it takes to update the site.
//
// The list below is the same two posts as a static fallback: it keeps /writing
// working if the feed is unreachable, and it's what content/corpus.ts feeds the
// chat, so the chat knows about the writing without making a network call.
// It goes stale only as a fallback — the live page always prefers the feed.

export const WRITING_INTRO =
  "I write to find out what I actually think. It lives on Medium, and it's personal rather than technical — attachment, growing up, the things that are harder to be precise about than a retrieval benchmark.";

/** Mirrors the feed. Update when a post is published if you want the chat to
 *  know about it immediately; /writing itself syncs on its own. */
export const knownPosts: MediumPost[] = [
  {
    title: "Love.",
    url: "https://medium.com/@abelitovisese/love-03112fc84578",
    date: "2025-07-20T12:01:53.000Z",
    tags: ["poem", "love"],
    excerpt:
      "For me, love isn't about expensive gifts or fancy dinners. It's the way my eyes glow when I spot you in a room full of people.",
  },
  {
    title: "Unlearning Detachment: A Journey of Grasping Non-attachment",
    url: "https://medium.com/@abelitovisese/unlearning-detachment-a-journey-of-grasping-non-attachment-79738cf31980",
    date: "2025-06-10T19:01:54.000Z",
    tags: ["twenty-something", "adulthood", "attachment", "life", "unlearning"],
    excerpt:
      "A while ago, I had a quick conversation with some friends about attachment and detachment.",
  },
];

/** The technical writing the rest of the site alludes to — evals, hybrid
 *  retrieval, the state machine behind Manna — is NOT written yet. It stays
 *  named here so the page can be honest about it rather than implying essays
 *  that don't exist. Delete an entry once it's published. */
export const unwritten = [
  "A vibe check is not an eval — freezing a benchmark before you tune.",
  "Dense search knows what you meant. BM25 knows what you typed.",
  "The chatbot was easy. The state machine took three weeks.",
];
