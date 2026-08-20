import { describe, expect, it } from "vitest";
import {
  brokenEditorialTargets,
  editorialInboundCounts,
  guidesWithoutRecipeLink,
  indexablePages,
  oneWayPairs,
  recipesWithoutGuideLink,
  recipesWithoutSiblingLink,
} from "@/lib/internal-links";
import { sitemapPaths } from "@/lib/sitemap";

describe("internal-link graph", () => {
  it("points every editorial link at a real, indexable page", () => {
    expect(brokenEditorialTargets(sitemapPaths())).toEqual([]);
  });

  it("gives every page at least three editorial inbound links", () => {
    const thin = [...editorialInboundCounts().entries()].filter(([, n]) => n < 3);
    expect(thin).toEqual([]);
  });

  it("keeps guide and ingredient links reciprocal", () => {
    expect(oneWayPairs()).toEqual([]);
  });

  it("links every recipe up to a technique or reference guide", () => {
    expect(recipesWithoutGuideLink()).toEqual([]);
  });

  it("links every cook and learn guide down to at least one recipe", () => {
    expect(guidesWithoutRecipeLink()).toEqual([]);
  });

  it("links every recipe sideways to another recipe", () => {
    expect(recipesWithoutSiblingLink()).toEqual([]);
  });

  it("audits the whole indexable surface", () => {
    expect(indexablePages().length).toBeGreaterThan(40);
  });
});
