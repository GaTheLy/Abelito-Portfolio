// Medium sync for /writing.
//
// Medium publishes a public RSS feed per user, so the essay list can come from
// the source of truth instead of a hand-maintained array — publish a post and
// the site picks it up on the next revalidation. No API key, no OAuth.
//
// The parser is deliberately hand-rolled: the feed shape is small and fixed,
// and an XML dependency would be a lot of surface for four fields. It's pure,
// so lib/site.test.ts exercises it against a fixture with no network.

export const MEDIUM_HANDLE = "abelitovisese";
export const MEDIUM_PROFILE = `https://medium.com/@${MEDIUM_HANDLE}`;
const FEED = `https://medium.com/feed/@${MEDIUM_HANDLE}`;

export interface MediumPost {
  title: string;
  url: string;
  /** ISO date, or "" when the feed omits it. */
  date: string;
  tags: string[];
  /** First couple of sentences, plain text — Medium has no subtitle field. */
  excerpt: string;
}

function unwrap(value: string): string {
  return value
    .replace(/^\s*<!\[CDATA\[/, "")
    .replace(/\]\]>\s*$/, "")
    .trim();
}

function decode(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function tag(item: string, name: string): string {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(item);
  return m ? decode(unwrap(m[1])) : "";
}

/** Trim to whole sentences so an excerpt never ends mid-word. */
function excerptFrom(html: string, max = 190): string {
  const text = decode(unwrap(html))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return stop > 80 ? cut.slice(0, stop + 1) : `${cut.replace(/\s+\S*$/, "")}…`;
}

export function parseMediumFeed(xml: string): MediumPost[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items
    .map((item) => {
      const raw = tag(item, "pubDate");
      const parsed = raw ? new Date(raw) : null;
      return {
        // Medium appends a title full-stop on some posts; keep it as written.
        title: tag(item, "title"),
        // The feed uses the subdomain form and adds tracking params.
        url: tag(item, "link").split("?")[0].replace(/^https:\/\/[\w-]+\.medium\.com/, MEDIUM_PROFILE),
        date: parsed && !Number.isNaN(parsed.valueOf()) ? parsed.toISOString() : "",
        tags: [...item.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/g)].map((m) =>
          decode(unwrap(m[1])),
        ),
        excerpt: excerptFrom(tag(item, "content:encoded")),
      };
    })
    .filter((p) => p.title && p.url);
}

/**
 * Live list for /writing. Revalidated hourly, so a new post appears without a
 * deploy. On any failure it returns null and the page says the list is
 * temporarily unavailable rather than rendering a stale or invented one.
 */
export async function fetchMediumPosts(): Promise<MediumPost[] | null> {
  try {
    const res = await fetch(FEED, {
      headers: { "user-agent": "abelitovisese.com" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const posts = parseMediumFeed(await res.text());
    return posts.length ? posts : null;
  } catch {
    return null;
  }
}
