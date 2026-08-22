/**
 * Shared sitemap builder.
 *
 * The `/sitemap.xml` server route is a thin wrapper around these pure
 * functions, so the route's exact output is unit-testable without a running
 * HTTP server: tests assert on `sitemapEntries()` / `sitemapPaths()` directly.
 *
 * Excluded by construction (never add them here):
 * `/internal/*`, `/api/*`, `/newsletter/*` (mailbox-token surfaces),
 * `/search` (query-driven), and any non-canonical alias or `$param` route.
 */

import { GUIDES } from "@/data/guides";
import { STARTER_GUIDE } from "@/data/starter-guide";
import { INGREDIENTS } from "@/data/ingredients";
import { RECIPES } from "@/data/recipes";
import { TOOLS } from "@/data/tools";
import { SITE } from "@/data/site";
import { PAGE_DATES } from "@/data/page-dates";

export const SITEMAP_BASE_URL = SITE.url;

/** Path prefixes that must never appear in the sitemap. */
export const SITEMAP_EXCLUDED_PREFIXES = [
  "/internal",
  "/api",
  "/newsletter",
  "/search",
] as const;

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapEntry {
  path: string;
  changefreq?: ChangeFreq;
  priority?: string;
}

/** True when a path is a canonical, indexable, sitemap-eligible route. */
export function isSitemapEligiblePath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path !== "/" && path.endsWith("/")) return false;
  if (/[?#$*\s]/.test(path)) return false;
  if (path.includes("//")) return false;
  return !SITEMAP_EXCLUDED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Every public canonical route, deduplicated and filtered.
 * Dynamic recipe URLs mirror the `$slug` route's data source.
 */
export function sitemapEntries(): SitemapEntry[] {
  const candidates: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/cook", changefreq: "weekly", priority: "0.9" },
    { path: "/recipes", changefreq: "weekly", priority: "0.9" },
    ...RECIPES.map((r) => ({
      path: `/recipes/${r.slug}`,
      changefreq: "monthly" as const,
      priority: "0.9",
    })),
    { path: "/learn", changefreq: "weekly", priority: "0.9" },
    { path: "/buy", changefreq: "monthly", priority: "0.8" },
    { path: "/gear", changefreq: "monthly", priority: "0.8" },
    { path: "/ingredients", changefreq: "monthly", priority: "0.7" },
    { path: "/tools", changefreq: "monthly", priority: "0.8" },
    { path: STARTER_GUIDE.path, changefreq: "monthly", priority: "0.9" },
    ...GUIDES.map((g) => ({
      path: g.path,
      changefreq: "monthly" as const,
      priority: g.kind === "money" ? "0.8" : "0.9",
    })),
    ...INGREDIENTS.map((i) => ({
      path: i.path,
      changefreq: "monthly" as const,
      priority: "0.9",
    })),
    ...TOOLS.filter((t) => t.status === "live" && t.to).map((t) => ({
      path: t.to!,
      changefreq: "monthly" as const,
      priority: "0.7",
    })),
    { path: "/about", changefreq: "yearly", priority: "0.5" },
    { path: "/contact", changefreq: "yearly", priority: "0.4" },
    { path: "/partners", changefreq: "monthly", priority: "0.5" },
    { path: "/affiliate-disclosure", changefreq: "yearly", priority: "0.3" },
    { path: "/editorial-standards", changefreq: "yearly", priority: "0.3" },
    { path: "/privacy", changefreq: "yearly", priority: "0.2" },
    { path: "/terms", changefreq: "yearly", priority: "0.2" },
  ];

  const seen = new Set<string>();
  return candidates.filter((e) => {
    if (!isSitemapEligiblePath(e.path) || seen.has(e.path)) return false;
    seen.add(e.path);
    return true;
  });
}

/** Convenience view for tests and link audits. */
export function sitemapPaths(): string[] {
  return sitemapEntries().map((e) => e.path);
}

/**
 * `<lastmod>` for one path, or `undefined`.
 *
 * The only source is `PAGE_DATES`, generated from the git history of that
 * page's own route file — a real, page-specific revision date. Paths with no
 * entry (the dynamic `/recipes/$slug` pages, whose content lives in a shared
 * data module and so has no per-URL timestamp) get no `<lastmod>` at all
 * rather than a build-time or crawl-time stand-in, which would tell crawlers
 * every page changed whenever the site was rebuilt.
 */
export function sitemapLastmod(path: string): string | undefined {
  return PAGE_DATES[path]?.modified;
}

/** Serialises the entries as a sitemap 0.9 document. */
export function sitemapXml(baseUrl: string = SITEMAP_BASE_URL): string {
  const urls = sitemapEntries().map((e) => {
    const lastmod = sitemapLastmod(e.path);
    return [
      `  <url>`,
      `    <loc>${baseUrl}${e.path}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}
