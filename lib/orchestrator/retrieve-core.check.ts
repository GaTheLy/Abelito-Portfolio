// Dependency-free self-check for the ranking core. Run:
// `node lib/orchestrator/retrieve-core.check.ts` (Node strips the TS types).
import assert from "node:assert/strict";
import { rank, MIN_SCORE, type Unit } from "./retrieve-core.ts";

// Synthetic index mirroring the real one. NOTE: Manna deliberately has NO
// timeline unit (like the real placeholder data) to lock the name>label rule.
const units: Unit[] = [
  { target: { kind: "chunk", slug: "manna", index: 0 }, label: "Manna · Overview", names: ["manna"], terms: ["overview"], text: "manna product overview" },
  { target: { kind: "chunk", slug: "manna", index: 4 }, label: "Manna · Stack", names: ["manna"], terms: ["stack", "react"], text: "react node aws" },
  { target: { kind: "chunk", slug: "datasaur", index: 0 }, label: "Datasaur · Overview", names: ["datasaur"], terms: ["overview"], text: "datasaur overview" },
  { target: { kind: "chunk", slug: "datasaur", index: 7 }, label: "Datasaur · Timeline", names: ["datasaur"], terms: ["timeline"], text: "datasaur history dates" },
  { target: { kind: "chunk", slug: "datasaur", index: 6 }, label: "Datasaur · Stack", names: ["datasaur"], terms: ["stack", "pytorch", "typescript"], text: "typescript python pytorch" },
  { target: { kind: "agent", agentId: "builder" }, label: "Builder", names: ["builder"], terms: ["projects", "ml", "ai", "engineering"], text: "machine learning projects" },
  { target: { kind: "connect" }, label: "Connect", names: ["connect", "contact"], terms: ["email", "resume"], text: "reach out email resume" },
];

const top = (q: string) => rank(q, units)[0];

// THE fix: a named project outranks a bare block-label match, so "manna timeline"
// stays in Manna (its overview) instead of jumping to Datasaur's timeline.
assert.equal(top("manna timeline").label, "Manna · Overview");

// Direct chunk jumps by name + block still win when the block exists.
assert.equal(top("datasaur timeline").label, "Datasaur · Timeline");
assert.equal(top("datasaur overview").label, "Datasaur · Overview");
assert.equal(top("datasaur pytorch").label, "Datasaur · Stack");
assert.equal(top("manna").label, "Manna · Overview");

// Section + keyword routing.
assert.equal(top("your ml projects").label, "Builder");
assert.equal(top("how do i contact you").label, "Connect");

assert.ok(rank("datasaur timeline", units)[0].score > MIN_SCORE);
assert.equal(rank("asdfqwer zxcvbn", units).length, 0);

console.log("retrieve-core.check: OK");
