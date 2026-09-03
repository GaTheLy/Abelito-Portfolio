import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { caseStudySlugs } from "@/content/projects";

// Case-study URLs are derived, so adding a fifth one lists itself.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/projects", "/writing", "/creator", "/about", "/connect"];
  const cases = caseStudySlugs.map((slug) => `/projects/${slug}`);

  return [...pages, ...cases].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/projects" || path === "/work" ? 0.8 : 0.6,
  }));
}
