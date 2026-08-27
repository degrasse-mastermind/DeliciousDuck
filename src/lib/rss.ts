/**
 * RSS 2.0 feed builder.
 *
 * Every item is derived from the same registries that power the content
 * routes — `GUIDES` (Cook / Learn / Buy / Gear), `INGREDIENTS`, `RECIPES`, and
 * the starter guide — so publishing a page automatically publishes it to the
 * feed. Nothing here is hardcoded per URL.
 *
 * `pubDate` sources, in order of preference:
 *  1. `PAGE_DATES[path].published` — the real first-commit date of the page's
 *     own route file (static article routes).
 *  2. `Recipe.datePublished` — recipes share one route file, so their date
 *     lives on the data item itself.
 *
 * Hubs, tools, legal, and query-driven routes are deliberately absent: the feed
 * carries articles and recipes only.
 */

import { GUIDES } from "@/data/guides";
import { INGREDIENTS } from "@/data/ingredients";
import { RECIPES } from "@/data/recipes";
import { STARTER_GUIDE } from "@/data/starter-guide";
import { PAGE_DATES } from "@/data/page-dates";
import { SITE } from "@/data/site";
import { sketchForPath } from "@/lib/sketch-art";
import { absUrl } from "@/lib/seo";

export const RSS_PATH = "/rss.xml";

export interface FeedItem {
  path: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /**
   * Absolute URL of the same hero image that backs the page's `og:image`.
   * Omitted when the page genuinely has no image in the content data.
   */
  image?: string;
}

const FALLBACK_DATE = "2026-08-27";

const publishedDate = (path: string): string => PAGE_DATES[path]?.published ?? FALLBACK_DATE;

/**
 * The article-page image source, resolved exactly the way the pages and
 * `distribution-metadata` resolve `og:image`: the bound illustration for a
 * given route. Returns undefined when a path has no art bound to it.
 */
function articleImage(path: string): { image: string } | Record<string, never> {
  const art = sketchForPath(path);
  return art?.src ? { image: absUrl(art.src) } : {};
}

/** MIME type for an enclosure, derived from the real asset extension. */
export function imageMimeType(url: string): string {
  const ext = (url.split("?")[0] ?? "").toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return "image/jpeg";
  }
}

/** Every feed-eligible article and recipe, newest first. */
export function feedItems(): FeedItem[] {
  const items: FeedItem[] = [
    {
      path: STARTER_GUIDE.path,
      title: STARTER_GUIDE.title,
      description: STARTER_GUIDE.description,
      date: publishedDate(STARTER_GUIDE.path),
    },
    ...GUIDES.map((g) => ({
      path: g.path,
      title: g.title,
      description: g.description,
      date: publishedDate(g.path),
    })),
    ...INGREDIENTS.map((i) => ({
      path: i.path,
      title: i.title,
      description: i.description,
      date: publishedDate(i.path),
    })),
    ...RECIPES.map((r) => ({
      path: `/recipes/${r.slug}`,
      title: r.name,
      description: r.description,
      date: r.datePublished,
    })),
  ];

  const seen = new Set<string>();
  return items
    .filter((item) => {
      if (seen.has(item.path)) return false;
      seen.add(item.path);
      return true;
    })
    .sort((a, b) => (a.date === b.date ? a.title.localeCompare(b.title) : b.date.localeCompare(a.date)));
}

/** XML text escaping — link and title accuracy matters most downstream. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date, which RSS 2.0 requires for `pubDate`/`lastBuildDate`. */
export function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toUTCString();
}

export function rssXml(baseUrl: string = SITE.url): string {
  const items = feedItems().map((item) => {
    const url = `${baseUrl}${item.path}`;
    return [
      `    <item>`,
      `      <title>${escapeXml(item.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <description>${escapeXml(item.description)}</description>`,
      `      <pubDate>${rfc822(item.date)}</pubDate>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `    </item>`,
    ].join("\n");
  });

  const newest = feedItems()[0]?.date ?? FALLBACK_DATE;

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    `  <channel>`,
    `    <title>${escapeXml(SITE.name)}</title>`,
    `    <link>${escapeXml(baseUrl)}</link>`,
    `    <description>${escapeXml(SITE.description)}</description>`,
    `    <language>en-us</language>`,
    `    <lastBuildDate>${rfc822(newest)}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(`${baseUrl}${RSS_PATH}`)}" rel="self" type="application/rss+xml" />`,
    ...items,
    `  </channel>`,
    `</rss>`,
  ].join("\n");
}
