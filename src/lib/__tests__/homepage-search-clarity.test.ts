import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PILLARS, SITE } from "@/data/site";

const home = readFileSync("src/routes/index.tsx", "utf8");

describe("homepage hero semantics", () => {
  it("uses the search-aligned H1 exactly once", () => {
    const h1s = [...home.matchAll(/<h1[\s>]/g)];
    expect(h1s.length).toBe(1);
    expect(home).toMatch(/<h1[^>]*>\s*Duck Recipes, Cooking Guides &amp; Buying Advice/);
  });

  it("keeps the brand line prominent but not as the H1", () => {
    expect(home).toContain("Better Duck.");
    expect(home).toContain("A More Delicious World.");
    expect(SITE.tagline).toBe("Better Duck. A More Delicious World.");
    const brandIndex = home.indexOf("Better Duck.");
    const h1Index = home.indexOf("<h1");
    expect(brandIndex).toBeLessThan(h1Index);
    expect(home.slice(brandIndex - 200, brandIndex)).not.toContain("<h1");
  });

  it("mentions the site's search territory in supporting copy", () => {
    for (const term of [
      "duck breast",
      "whole roast duck",
      "crisp skin",
      "duck fat",
      "equipment",
      "buy duck",
    ]) {
      expect(home.toLowerCase()).toContain(term.toLowerCase());
    }
  });

  it("sends the primary CTA to /recipes and keeps the tool CTA on /tools", () => {
    expect(home).toMatch(/to="\/recipes"[\s\S]{0,200}Explore the Recipes/);
    expect(home).toMatch(/to="\/tools"[\s\S]{0,200}Try a Cooking Tool/);
    expect(home).not.toMatch(/to="\/cook"[\s\S]{0,120}Explore the Recipes/);
  });

  it("preserves the WebSite structured data", () => {
    expect(home).toContain("websiteSchema()");
  });
});

describe("pillar labels carry reader/search language", () => {
  const expected: Record<string, string> = {
    cook: "Duck Recipes & Cooking Techniques",
    learn: "How to Cook Duck: Beginner Guides",
    buy: "Where to Buy Duck & How to Choose It",
    gear: "Best Gear for Cooking Duck",
    ingredients: "Duck Fat, Sauces, Sides & Seasonings",
    tools: "Duck Cooking Times, Temperatures & Calculators",
  };

  it("keeps the six pillar names and upgrades their descriptors", () => {
    expect(PILLARS.map((p) => p.label)).toEqual([
      "Cook",
      "Learn",
      "Buy",
      "Gear",
      "Ingredients",
      "Tools",
    ]);
    for (const pillar of PILLARS) {
      expect(pillar.kicker).toBe(expected[pillar.key]);
      // Secondary personality copy is retained.
      expect(pillar.blurb.length).toBeGreaterThan(60);
    }
  });
});
