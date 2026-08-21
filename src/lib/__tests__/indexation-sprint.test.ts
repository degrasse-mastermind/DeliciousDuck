/**
 * Indexation + emerging-winners regression tests.
 *
 * These lock the failures this sprint repaired, all of which were invisible to
 * the previous suite because they lived in the gap between declared data and
 * rendered HTML:
 *  - `related` paths that no registry could resolve were silently dropped, so
 *    recipes had one crawlable inbound link while the graph data claimed more.
 *  - the sitemap emitted no `<lastmod>` at all.
 *  - a merchant URL 404ed on two commercial pages.
 *  - the starter guide repeated one generic anchor four times.
 */

import { describe, expect, it } from "vitest";
import { GUIDES } from "@/data/guides";
import { INGREDIENTS } from "@/data/ingredients";
import { RECIPE_CONTENT } from "@/data/recipe-content";
import { MERCHANTS } from "@/data/affiliates";
import { DEEP_LINKS } from "@/data/revenue";
import { PAGE_DATES } from "@/data/page-dates";
import { relatedItem, unresolvableRelatedPaths } from "@/lib/related-items";
import { sitemapLastmod, sitemapPaths, sitemapXml } from "@/lib/sitemap";

/** Every `related` list on the site, with the page that declares it. */
function allRelatedLists(): { owner: string; paths: readonly string[] }[] {
  return [
    ...GUIDES.map((g) => ({ owner: g.path, paths: g.related })),
    ...INGREDIENTS.map((i) => ({ owner: i.path, paths: i.related })),
    ...Object.values(RECIPE_CONTENT).map((r) => ({
      owner: `/recipes/${r.slug}`,
      paths: r.related,
    })),
  ];
}

describe("related-link resolution", () => {
  it("resolves every declared related path, so none is dropped at render time", () => {
    const broken = allRelatedLists()
      .map(({ owner, paths }) => ({ owner, unresolved: unresolvableRelatedPaths(paths) }))
      .filter((r) => r.unresolved.length > 0);
    expect(broken).toEqual([]);
  });

  it("resolves recipe paths, which were previously filtered out entirely", () => {
    const item = relatedItem("/recipes/oven-roasted-duck-breast");
    expect(item?.title).toBeTruthy();
    expect(item?.teaser).toBeTruthy();
  });

  it("gives every resolved item a title and a teaser to render", () => {
    for (const { paths } of allRelatedLists()) {
      for (const path of paths) {
        const item = relatedItem(path);
        expect(item, path).toBeDefined();
        expect(item!.title.length, path).toBeGreaterThan(2);
        expect(item!.teaser.length, path).toBeGreaterThan(10);
      }
    }
  });

  it("never links a page to itself", () => {
    for (const { owner, paths } of allRelatedLists()) {
      expect(paths, owner).not.toContain(owner);
    }
  });
});

describe("internal support for the thin recipes SEMrush flagged", () => {
  const THIN = ["/recipes/oven-roasted-duck-breast", "/recipes/peking-duck-at-home"] as const;

  it("gives each at least three distinct editorial inbound links", () => {
    for (const target of THIN) {
      const sources = allRelatedLists()
        .filter(({ owner, paths }) => owner !== target && paths.includes(target))
        .map((r) => r.owner);
      expect(new Set(sources).size, `${target} inbound: ${sources.join(", ")}`).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("sitemap lastmod", () => {
  it("emits a real lastmod for pages with a page-specific revision date", () => {
    const xml = sitemapXml();
    const count = xml.split("<lastmod>").length - 1;
    expect(count).toBeGreaterThan(50);
  });

  it("uses only registry dates — never a build-time or crawl-time stand-in", () => {
    for (const path of sitemapPaths()) {
      const lastmod = sitemapLastmod(path);
      if (lastmod === undefined) continue;
      expect(lastmod).toBe(PAGE_DATES[path]?.modified);
      expect(lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("omits lastmod rather than inventing one for dynamic recipe URLs", () => {
    const missing = sitemapPaths().filter((p) => !sitemapLastmod(p));
    for (const path of missing) expect(path.startsWith("/recipes/")).toBe(true);
  });
});

describe("commercial links", () => {
  const dead = "fossilfarms.com/collections/duck";

  it("no longer points at the retired Fossil Farms duck landing page", () => {
    const urls = [
      ...MERCHANTS.map((m) => m.directUrl ?? ""),
      ...DEEP_LINKS.map((d) => d.directUrl ?? ""),
    ];
    for (const url of urls) expect(url.includes(dead)).toBe(false);
  });

  it("keeps the affiliate registry and the deep link on the same Fossil Farms URL", () => {
    const merchant = MERCHANTS.find((m) => m.id === "fossil-farms");
    const link = DEEP_LINKS.find((d) => d.id === "sourcing-fossil-farms");
    expect(merchant?.directUrl).toBeTruthy();
    expect(link?.directUrl).toBe(merchant?.directUrl);
  });
});
