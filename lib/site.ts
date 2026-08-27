/** Canonical origin. Used by metadataBase, the sitemap and robots, so they can
 *  never disagree. Vercel injects the deployment URL for previews; production
 *  falls back to the real domain. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, "")}`
  : "https://abelitovisese.com";
