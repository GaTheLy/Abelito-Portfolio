import type { MetadataRoute } from "next";
import { SITE_URL, HIDDEN_ROUTES } from "@/lib/site";
import { caseStudySlugs } from "@/content/projects";

// Case-study URLs are derived, so a new one lists itself.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/projects", "/writing", "/creator", "/about", "/connect"].filter(
    (path) => !HIDDEN_ROUTES.has(path),
  );
  const cases = caseStudySlugs.map((slug) => `/projects/${slug}`);

  return [...pages, ...cases].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/projects" || path === "/work" ? 0.8 : 0.6,
  }));
}
