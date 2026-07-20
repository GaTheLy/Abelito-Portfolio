// Dependency-free self-check for the M1 router. Run: `node lib/orchestrator/classify.check.ts`
// (Node strips the TS types natively.) Fails loudly if the routing logic breaks.
import assert from "node:assert/strict";
import { classify, CONFIDENCE_THRESHOLD } from "./classify.ts";

// Gibberish → honest fallback with a real, below-threshold score.
const g = classify("asdf qwerty zxcv");
assert.equal(g.route, "/fallback");
assert.equal(g.agentId, null);
assert.ok(g.confidence < CONFIDENCE_THRESHOLD, "gibberish should be low confidence");

// A clear builder prompt → builder, above threshold.
const b = classify("show me your ai and ml engineering projects");
assert.equal(b.agentId, "builder");
assert.equal(b.route, "/builder");
assert.ok(b.confidence >= CONFIDENCE_THRESHOLD);

// Every agent is reachable via its own keywords.
assert.equal(classify("your content brand and videos").agentId, "creator");
assert.equal(classify("cars investing and hobbies").agentId, "hobbyist");
assert.equal(classify("who are you, tell me your story").agentId, "origin");

// More matches ⇒ higher confidence (saturating, never fabricated).
assert.ok(classify("ai ml llm nlp model").confidence > classify("ai").confidence);

console.log("classify.check: OK");
