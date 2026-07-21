// Pure ranking core — NO app/data imports, so its self-check runs under bare
// Node. The data-driven index lives in retrieve.ts.

export type NavTarget =
  | { kind: "chunk"; slug: string; index: number }
  | { kind: "agent"; agentId: string }
  | { kind: "connect" };

export interface Unit {
  target: NavTarget;
  label: string;
  names: string[]; // primary identity (project/section name) — weight 5
  terms: string[]; // block labels, tags, keywords — weight 3
  text: string; // free content — weight 1
}

export interface Retrieved {
  target: NavTarget;
  label: string;
  score: number;
}

// Any match at or above this is a match worth keeping (used by the self-check).
export const MIN_SCORE = 2;

// Jump instantly only on a strong match (a name hit, or several keyword hits).
// Below this the caller hands off to Tier-2 RAG for a grounded answer.
export const NAV_THRESHOLD = 5;

const STOP = new Set([
  "the", "a", "an", "of", "to", "is", "are", "am", "in", "on", "at", "for",
  "and", "or", "me", "i", "my", "s", "do", "does", "did", "can", "could",
  "would", "please", "it", "this", "that", "with", "from", "as", "be",
]);

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (t) => t.length > 1 && !STOP.has(t),
  );
}

export function scoreUnit(queryTokens: string[], unit: Unit): number {
  const nameSet = new Set(unit.names);
  const termSet = new Set(unit.terms);
  const textSet = new Set(tokenize(unit.text));
  let score = 0;
  for (const token of queryTokens) {
    // Name outweighs label so "manna timeline" stays in Manna even if Manna has
    // no timeline block (lands on Manna) rather than jumping to Datasaur's.
    if (nameSet.has(token)) score += 5;
    else if (termSet.has(token)) score += 3;
    else if (textSet.has(token)) score += 1;
  }
  return score;
}

// Rank units against the query; return the best few with score > 0.
export function rank(query: string, units: Unit[], k = 4): Retrieved[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  return units
    .map((u) => ({ target: u.target, label: u.label, score: scoreUnit(tokens, u) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
