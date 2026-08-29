import { test } from "node:test";
import assert from "node:assert/strict";

import { MATCH, QLABEL, TOPIC_IDS, GUARDED, routeQuestion } from "../content/answers.ts";
import { answerBlocks } from "../content/answer-blocks.ts";
import { caseStudies, railContext } from "../content/case-studies.ts";
import { projects, selectProjects, caseStudySlugs } from "../content/projects.ts";
import { blockSchema } from "./blocks.ts";
import { parseMediumFeed } from "./medium.ts";

// Everything with a branch, a loop or a rule lives here. Runs under bare
// `node --test` — content/ and lib/ deliberately use relative imports so no
// loader, bundler or test framework is needed.

// ── Project search ──────────────────────────────────────────────────────────

const base = { query: "", cat: "All", sort: "new", deepOnly: false } as const;

test("search requires EVERY token to match, not any", () => {
  // README's worked examples.
  const phoneme = selectProjects({ ...base, query: "phoneme latency" });
  assert.deepEqual(
    phoneme.map((p) => p.slug),
    ["talkative"],
  );

  const bm25 = selectProjects({ ...base, query: "bm25" });
  assert.deepEqual(
    bm25.map((p) => p.slug),
    ["riset"],
  );

  // "yolo" alone is broad; adding a second token must narrow, never widen.
  const yolo = selectProjects({ ...base, query: "yolo" });
  const yoloTracking = selectProjects({ ...base, query: "yolo tracking" });
  assert.ok(yolo.length > yoloTracking.length);
  assert.ok(yoloTracking.every((p) => yolo.some((q) => q.slug === p.slug)));
});

test("search covers stack and hidden keywords, not just the blurb", () => {
  // "chroma" appears only in Manna's stack + keys, never in its blurb.
  assert.deepEqual(
    selectProjects({ ...base, query: "chroma" }).map((p) => p.slug),
    ["manna"],
  );
});

test("no match returns empty rather than falling back to everything", () => {
  assert.equal(selectProjects({ ...base, query: "kubernetes helm chart" }).length, 0);
});

test("filters compose", () => {
  const cv = selectProjects({ ...base, cat: "Computer Vision" });
  assert.ok(cv.length > 0);
  assert.ok(cv.every((p) => p.cat === "Computer Vision"));

  const deep = selectProjects({ ...base, deepOnly: true });
  assert.equal(deep.length, caseStudySlugs.length);
  assert.ok(deep.every((p) => p.deep));

  const both = selectProjects({ ...base, cat: "Computer Vision", deepOnly: true });
  assert.ok(both.every((p) => p.cat === "Computer Vision" && p.deep));
});

test("each sort orders as specified", () => {
  const years = (s: "new" | "old") => selectProjects({ ...base, sort: s }).map((p) => p.year);
  assert.deepEqual(years("new"), [...years("new")].sort((a, b) => b - a));
  assert.deepEqual(years("old"), [...years("old")].sort((a, b) => a - b));

  const names = selectProjects({ ...base, sort: "az" }).map((p) => p.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));

  // "Most detailed" puts every case study ahead of every non-case-study.
  const depth = selectProjects({ ...base, sort: "depth" });
  const lastDeep = depth.findLastIndex((p) => p.deep);
  const firstShallow = depth.findIndex((p) => !p.deep);
  assert.ok(lastDeep < firstShallow);
});

test("sorts are stable in count — filtering is the only thing that removes", () => {
  for (const sort of ["new", "old", "az", "depth"] as const) {
    assert.equal(selectProjects({ ...base, sort }).length, projects.length);
  }
});

// ── Chat routing ────────────────────────────────────────────────────────────

test("every topic is reachable and no earlier pattern shadows a later one", () => {
  for (const [regex, topic] of MATCH) {
    // The topic's own question must route to that topic — if an earlier
    // pattern claims it, this fails and the MATCH order needs revisiting.
    assert.equal(
      routeQuestion(QLABEL[topic]),
      topic,
      `"${QLABEL[topic]}" should route to "${topic}"`,
    );
    assert.ok(regex.test(QLABEL[topic].toLowerCase()), `${topic} regex must match its own label`);
  }
});

test("unknown questions fall back rather than guessing", () => {
  assert.equal(routeQuestion("write me a poem about kubernetes"), "fallback");
  assert.equal(routeQuestion(""), "fallback");
  assert.equal(routeQuestion("       "), "fallback");
});

test("routing is case-insensitive", () => {
  assert.equal(routeQuestion("WHAT'S YOUR RATE?"), "rate");
  assert.equal(routeQuestion("Tell me about BM25"), "rag");
});

test("guarded topics are reachable by the questions that trigger them", () => {
  // These three must never be model-generated, so their routing has to be
  // reliable — a miss here would send a rate question to the LLM.
  assert.equal(routeQuestion("what's your rate?"), "rate");
  assert.equal(routeQuestion("are you actually good?"), "good");
  assert.equal(routeQuestion("why only 2 months at datasaur?"), "datasaur");
  for (const topic of GUARDED) assert.ok(TOPIC_IDS.includes(topic));
});

// ── Content integrity ───────────────────────────────────────────────────────

test("all nine authored answers parse against the block schema", () => {
  for (const topic of TOPIC_IDS) {
    const blocks = answerBlocks[topic];
    assert.ok(blocks?.length, `${topic} has no blocks`);
    for (const block of blocks) assert.doesNotThrow(() => blockSchema.parse(block));
  }
});

test("every followup points somewhere real", () => {
  const slugs = new Set(projects.map((p) => p.slug));
  for (const topic of TOPIC_IDS) {
    for (const block of answerBlocks[topic]) {
      if (block.type !== "followups") continue;
      for (const item of block.items) {
        assert.ok(item.topic || item.href, `${topic}: followup "${item.label}" has no target`);
        if (item.topic) assert.ok(TOPIC_IDS.includes(item.topic));
        // A /projects/<slug> link must name a project that exists.
        const caseLink = item.href && /^\/projects\/(.+)$/.exec(item.href);
        if (caseLink) assert.ok(slugs.has(caseLink[1]), `dead link: ${item.href}`);
      }
    }
  }
});

test("every case study has a matching project record and the fixed section order", () => {
  const required = ["OVERVIEW", "MY ROLE", "PROBLEM", "APPROACH", "ARCHITECTURE", "RESULTS"];
  for (const study of caseStudies) {
    const project = projects.find((p) => p.slug === study.slug);
    assert.ok(project, `${study.slug} has no project record`);
    assert.ok(project.deep, `${study.slug} has a case study but isn't marked deep`);

    const labels = study.sections.map((s) => s.label);
    assert.deepEqual(labels.slice(0, required.length), required);
    assert.equal(labels.at(-1), "LESSON");

    // STACK must be the project record's list — never a second one.
    const stack = study.sections
      .find((s) => s.label === "STACK")
      ?.blocks.find((b) => b.type === "stack");
    assert.ok(stack && stack.type === "stack");
    assert.deepEqual(stack.tags, project.stack);
  }
});

test("every project marked deep actually has a case study", () => {
  for (const slug of caseStudySlugs) {
    assert.ok(caseStudies.some((c) => c.slug === slug), `${slug} is deep but has no case study`);
  }
});

test("rail context is derived from the page, and only exists for case studies", () => {
  assert.equal(railContext("/"), null);
  assert.equal(railContext("/projects"), null);
  assert.equal(railContext("/projects/does-not-exist"), null);
  assert.equal(railContext("/projects/traffic/extra"), null);

  const rail = railContext("/projects/traffic");
  assert.ok(rail);
  // The outline must be the page's real sections, in order — not a copy.
  const study = caseStudies.find((c) => c.slug === "traffic")!;
  assert.deepEqual(rail.sections, study.sections.map((s) => s.label));
  assert.equal(rail.questions.length, 3);
});

test("measurement intent beats subject matter", () => {
  // Regressions this ordering exists to prevent — all three used to land on
  // `rag` because they contain retrieval words.
  assert.equal(routeQuestion("how do you know your retrieval is any good?"), "evals");
  assert.equal(routeQuestion("tell me about RAGAS"), "evals");
  assert.equal(routeQuestion("how do you measure your embeddings?"), "evals");
  // …but a plain retrieval question still routes to rag.
  assert.equal(routeQuestion("show me your best RAG work"), "rag");
  assert.equal(routeQuestion("what embedding model do you use?"), "rag");
});

test("`rate` matches the word, not substrings of other words", () => {
  assert.notEqual(routeQuestion("how do you generate answers?"), "rate");
  assert.notEqual(routeQuestion("do you iterate on prompts?"), "rate");
  assert.equal(routeQuestion("what is your rate?"), "rate");
});

test("every 'same obsession' link lands on something specific", () => {
  const slugs = new Set(projects.map((p) => p.slug));
  for (const study of caseStudies) {
    // Labels are React keys in the rail — duplicates silently drop a link.
    const labels = study.related.map((r) => r.label);
    assert.equal(new Set(labels).size, labels.length, `${study.slug}: duplicate related label`);

    for (const item of study.related) {
      const caseLink = /^\/projects\/([^?]+)$/.exec(item.href);
      if (caseLink) {
        assert.ok(slugs.has(caseLink[1]), `${study.slug}: dead link ${item.href}`);
        continue;
      }
      // A search link must actually find the project it names, and only it.
      const query = new URL(item.href, "https://x").searchParams.get("q");
      assert.ok(query, `${study.slug}: "${item.label}" points at the bare index`);
      const found = selectProjects({ ...base, query });
      assert.equal(found.length, 1, `${study.slug}: "?q=${query}" matched ${found.length}`);
    }
  }
});

// ── Medium feed ─────────────────────────────────────────────────────────────

const FEED = `<?xml version="1.0"?><rss><channel>
<item>
  <title><![CDATA[Love.]]></title>
  <link>https://abelitovisese.medium.com/love-03112fc84578?source=rss-abc</link>
  <pubDate>Sun, 20 Jul 2025 12:01:53 GMT</pubDate>
  <category><![CDATA[poem]]></category>
  <category><![CDATA[love]]></category>
  <content:encoded><![CDATA[<p>For me, love isn&#39;t about gifts. It is the way my eyes glow. And more besides, at considerable length, going well past any reasonable excerpt boundary so the trimming has something to do.</p>]]></content:encoded>
</item>
<item>
  <title><![CDATA[Only a title]]></title>
  <link>https://abelitovisese.medium.com/x-1</link>
</item>
<item><title><![CDATA[No link, must be dropped]]></title></item>
</channel></rss>`;

test("medium feed parses titles, tags, dates and normalised urls", () => {
  const posts = parseMediumFeed(FEED);
  // The third item has no link and must not survive.
  assert.equal(posts.length, 2);

  const [love] = posts;
  assert.equal(love.title, "Love.");
  // Tracking params stripped, subdomain rewritten to the canonical profile form.
  assert.equal(love.url, "https://medium.com/@abelitovisese/love-03112fc84578");
  assert.equal(love.date.slice(0, 10), "2025-07-20");
  assert.deepEqual(love.tags, ["poem", "love"]);
  assert.ok(love.excerpt.startsWith("For me, love isn't about gifts."), love.excerpt);
  assert.ok(!love.excerpt.includes("<p>"), "html must be stripped");
  assert.ok(love.excerpt.length <= 191, "excerpt must be trimmed");
});

test("medium parser survives a missing date and missing tags", () => {
  const [, sparse] = parseMediumFeed(FEED);
  assert.equal(sparse.title, "Only a title");
  assert.equal(sparse.date, "");
  assert.deepEqual(sparse.tags, []);
  assert.equal(sparse.excerpt, "");
});

test("medium parser returns empty for junk rather than throwing", () => {
  assert.deepEqual(parseMediumFeed(""), []);
  assert.deepEqual(parseMediumFeed("<rss><channel></channel></rss>"), []);
});
