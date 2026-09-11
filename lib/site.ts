/** Canonical origin. Used by metadataBase, the sitemap and robots, so they can
 *  never disagree. Vercel injects the deployment URL for previews; production
 *  falls back to the real domain.
 *
 *  www, not the apex: the apex 308s to www, and link-preview crawlers
 *  (WhatsApp, LinkedIn, iMessage) won't follow a redirect to fetch og:image —
 *  an apex origin here is what made shared links show up as bare URLs. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, "")}`
  : "https://www.abelitovisese.com";

/** Pages that aren't live yet. NEXT_PUBLIC_LAUNCH_MODE=1 is set in Vercel's
 *  production environment only, so locally they stay fully navigable. In
 *  production each one is disabled in the nav, left out of the sitemap, a 404
 *  on direct access, and never offered as a chat followup. */
export const HIDDEN_ROUTES: ReadonlySet<string> = new Set(
  process.env.NEXT_PUBLIC_LAUNCH_MODE === "1" ? ["/creator", "/about"] : [],
);
