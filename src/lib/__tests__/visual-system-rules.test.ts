import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RECIPES } from "@/data/recipes";
import { sketchForPath, sketchRotationForPath, SKETCH } from "@/lib/sketch-art";
import { sitemapPaths } from "@/lib/sitemap";

const read = (p: string) => readFileSync(p, "utf8");

describe("media rule: illustration for commercial/learn, photography for recipes", () => {
  it("gives no drawing to any individual recipe route", () => {
    const recipePaths = sitemapPaths().filter((p) => p.startsWith("/recipes/"));
    expect(recipePaths.length).toBeGreaterThan(3);
    for (const p of recipePaths) {
      expect(sketchForPath(p), p).toBeNull();
      expect(sketchRotationForPath(p), p).toEqual([]);
    }
  });

  it("keeps illustrations on hubs, commercial, learn, gear and tools templates", () => {
    expect(sketchForPath("/recipes")).toBe(SKETCH.slicedBreast);
    for (const p of ["/buy/duck-fat-buying-guide", "/gear/best-thermometer-for-duck", "/tools"]) {
      expect(sketchForPath(p), p).not.toBeNull();
    }
  });

  it("carries no illustration overrides in recipe data", () => {
    const src = read("src/data/recipes.ts");
    expect(src).not.toContain("illustration?:");
    for (const r of RECIPES) expect("illustration" in r, r.slug).toBe(false);
  });

  it("renders the photograph as the recipe detail lead visual", () => {
    const route = read("src/routes/recipes.$slug.tsx");
    expect(route).toContain("src={recipe.image}");
    expect(route).not.toContain("recipe.illustration");
  });
});

describe("no dead dark-mode tokens", () => {
  const css = read("src/styles.css");

  it("drops the unused .dark token block", () => {
    expect(css).not.toMatch(/^\.dark \{/m);
    expect(css).not.toContain("--sidebar-ring: oklch(0.76 0.12 78)");
  });

  it("keeps the class-based dark variant so stray dark: utilities stay inert", () => {
    expect(css).toContain("@custom-variant dark (&:is(.dark *))");
  });
});

describe("card hover affordances", () => {
  it("scales the image and reveals a gold rule on recipe cards", () => {
    const card = read("src/components/site/RecipeCard.tsx");
    expect(card).toContain("group-hover:scale-[1.06]");
    expect(card).toContain("bg-gold");
    expect(card).toContain("group-hover:scale-x-100");
  });

  it("reveals a gold rule on guide cards and category tiles", () => {
    for (const file of [
      "src/components/site/GuideGrid.tsx",
      "src/components/site/CategoryTile.tsx",
    ]) {
      const src = read(file);
      expect(src, file).toContain("bg-gold");
      expect(src, file).toContain("group-hover:scale-x-100");
    }
    expect(read("src/components/site/CategoryTile.tsx")).toContain("group-hover:scale-[1.06]");
  });
});

describe("recipe card meta stats", () => {
  it("stacks Total / Serves / Level with generous tracking instead of one dense row", () => {
    const card = read("src/components/site/RecipeCard.tsx");
    expect(card).toContain("grid-cols-3");
    expect(read("src/components/site/MetaStats.tsx")).toContain("tracking-[0.16em]");
    for (const label of ['label: "Total"', 'label: "Serves"', 'label: "Level"']) {
      expect(card).toContain(label);
    }
  });
});

