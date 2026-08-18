import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { GUIDES } from "@/data/guides";
import { INGREDIENTS } from "@/data/ingredients";
import { RECIPES } from "@/data/recipes";
import { TOOLS } from "@/data/tools";
import { STARTER_GUIDE } from "@/data/starter-guide";
import { SITE } from "@/data/site";
import {
  isSitemapEligiblePath,
  sitemapEntries,
  sitemapPaths,
  sitemapXml,
} from "@/lib/sitemap";

const BASE = process.env["CANONICAL_TEST_BASE_URL"] ?? "http://localhost:8080";

async function fetchServedPaths(): Promise<string[] | null> {
  try {
    const res = await fetch(`${BASE}/sitemap.xml`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const xml = await res.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!.replace(SITE.url, "") || "/");
  } catch {
    return null;
  }
}

const servedPaths = await fetchServedPaths();

describe("robots.txt directives", () => {
  const robots = readFileSync("public/robots.txt", "utf8");
  const blocks = robots
    .split(/\n(?=User-agent:)/)
    .filter((b) => b.trim().startsWith("User-agent:"));

  it("allows normal public crawling", () => {
    expect(robots).not.toMatch(/^Disallow: \/$/m);
    expect(blocks.length).toBeGreaterThan(1);
    for (const block of blocks) expect(block).toMatch(/Allow: \//);
  });

  it("blocks internal, API and mailbox-token surfaces for every user-agent", () => {
    for (const block of blocks) {
      const agent = /User-agent: (.+)/.exec(block)?.[1];
      expect(block, `agent ${agent}`).toMatch(/Disallow: \/internal\//);
      expect(block, `agent ${agent}`).toMatch(/Disallow: \/api\//);
      expect(block, `agent ${agent}`).toMatch(/Disallow: \/newsletter\//);
    }
  });

  it("keeps search-result URLs out of general crawling", () => {
    const wildcard = blocks.find((b) => b.includes("User-agent: *"))!;
    expect(wildcard).toMatch(/Disallow: \/search/);
  });

  it("points at the canonical sitemap", () => {
    expect(robots).toContain("Sitemap: https://deliciousduck.com/sitemap.xml");
  });
});

describe("sitemap builder (deterministic, no server required)", () => {
  const paths = sitemapPaths();
  const entries = sitemapEntries();

  it("includes every intended public canonical route", () => {
    const required = [
      "/",
      "/recipes",
      "/cook",
      "/learn",
      "/buy",
      "/gear",
      "/ingredients",
      "/tools",
      "/gear/best-roasting-pan-for-duck",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      "/affiliate-disclosure",
      "/editorial-standards",
      STARTER_GUIDE.path,
      ...RECIPES.map((r) => `/recipes/${r.slug}`),
      ...GUIDES.map((g) => g.path),
      ...INGREDIENTS.map((i) => i.path),
      ...TOOLS.filter((t) => t.status === "live" && t.to).map((t) => t.to!),
    ];
    expect(required.filter((p) => !paths.includes(p))).toEqual([]);
  });

  it("excludes internal, API, token, search, alias and malformed paths", () => {
    const offenders = paths.filter(
      (p) =>
        p.startsWith("/internal") ||
        p.startsWith("/api") ||
        p.startsWith("/newsletter") ||
        p.startsWith("/search") ||
        p.includes("?") ||
        p.includes("#") ||
        p.includes("$") ||
        p.includes("*") ||
        p.includes("//") ||
        !p.startsWith("/") ||
        (p !== "/" && p.endsWith("/")),
    );
    expect(offenders).toEqual([]);
  });

  it("rejects ineligible paths at the builder level", () => {
    for (const bad of [
      "/internal",
      "/internal/growth-dashboard",
      "/api/generate-sketch",
      "/newsletter/unsubscribe",
      "/search",
      "/recipes/",
      "recipes",
      "/recipes/$slug",
      "/buy?utm_source=x",
      "/buy//duck",
    ]) {
      expect(isSitemapEligiblePath(bad), bad).toBe(false);
    }
    for (const good of ["/", "/recipes", "/gear/best-roasting-pan-for-duck"]) {
      expect(isSitemapEligiblePath(good), good).toBe(true);
    }
  });

  it("omits omitted tool routes that are not live", () => {
    for (const tool of TOOLS.filter((t) => t.status !== "live" || !t.to)) {
      if (tool.to) expect(paths).not.toContain(tool.to);
    }
  });

  it("lists each canonical URL exactly once", () => {
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.length).toBeGreaterThan(55);
  });

  it("serialises absolute production URLs the route returns verbatim", () => {
    const xml = sitemapXml();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
    expect(locs.length).toBe(entries.length);
    expect(locs.every((l) => l.startsWith(`${SITE.url}/`))).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it("is the same builder the /sitemap.xml route uses", () => {
    const route = readFileSync("src/routes/sitemap[.]xml.ts", "utf8");
    expect(route).toContain('from "@/lib/sitemap"');
    expect(route).toContain("sitemapXml()");
  });
});

/** Optional smoke test: only runs when a dev server is reachable. */
describe.skipIf(!servedPaths)("served sitemap matches the builder", () => {
  it("returns exactly the builder's paths", () => {
    expect(servedPaths!.sort()).toEqual(sitemapPaths().sort());
  });
});
