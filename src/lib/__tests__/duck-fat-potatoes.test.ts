import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RECIPES } from "@/data/recipes";
import { RECIPE_CONTENT, recipeNeedsDuckFat, recipePath } from "@/data/recipe-content";
import { allConversionPlacementIds, conversionPathsForSource } from "@/data/conversion-paths";
import { duckFatDecisionFor, duckFatDecisionPlacementIds } from "@/data/duck-fat-decision";
import { sitemapPaths } from "@/lib/sitemap";

/**
 * Guardrails for the duck-fat funnel:
 * recipe -> buying guide / substitution tool, and both surfaces back again.
 */
const SLUG = "duck-fat-roasted-potatoes";
const PATH = `/recipes/${SLUG}`;
const recipe = RECIPES.find((r) => r.slug === SLUG);
const content = RECIPE_CONTENT[SLUG];

const ROUTE = readFileSync("src/routes/recipes.$slug.tsx", "utf8");
const HOME = readFileSync("src/routes/index.tsx", "utf8");
const TOOL = readFileSync("src/routes/tools.duck-fat-substitution-calculator.tsx", "utf8");
const GUIDE = readFileSync("src/routes/buy.duck-fat-buying-guide.tsx", "utf8");

describe("duck fat roasted potatoes: registration", () => {
  it("exists in both the card registry and the content registry", () => {
    expect(recipe).toBeTruthy();
    expect(content).toBeTruthy();
    expect(recipePath(SLUG)).toBe(PATH);
  });

  it("carries the photograph plus descriptive alt text", () => {
    expect(recipe!.image).toMatch(/duck-fat-roasted-potatoes-card/);
    expect(recipe!.imageAlt).toMatch(/duck fat roasted potatoes/i);
    // No on-page illustration for this recipe: the photograph carries every role.
    expect(recipe!.illustration).toBeUndefined();
    expect(ROUTE).toContain("image: recipe.image");
  });

  it("appears in the sitemap and on the homepage recipe grid", () => {
    expect(sitemapPaths()).toContain(PATH);
    const homepageSlugs = RECIPES.slice(0, 6).map((r) => r.slug);
    expect(homepageSlugs).toContain(SLUG);
    expect(HOME).toContain("RECIPES.slice(0, 6)");
    // Cornerstone recipes are not displaced.
    for (const cornerstone of [
      "pan-seared-duck-breast",
      "duck-a-lorange",
      "duck-leg-confit",
      "roasted-whole-duck",
    ]) {
      expect(homepageSlugs).toContain(cornerstone);
    }
  });

  it("has complete, schema-ready recipe data", () => {
    expect(recipe!.prepTimeMinutes).toBeGreaterThan(0);
    expect(recipe!.cookTimeMinutes).toBeGreaterThan(0);
    expect(recipe!.recipeYield).toMatch(/4/);
    expect(content!.ingredientGroups.flatMap((g) => g.items).length).toBeGreaterThan(4);
    expect(content!.steps.length).toBeGreaterThanOrEqual(6);
    expect(content!.faq.length).toBeGreaterThanOrEqual(4);
    expect(content!.quackFix.length).toBeGreaterThanOrEqual(3);
    // Weights with volume equivalents.
    expect(content!.ingredientGroups[0]!.items.join(" ")).toMatch(/kg[\s\S]*lb/);
    expect(content!.ingredientGroups[0]!.items.join(" ")).toMatch(/90 g \(about ⅓ cup\)/);
  });

  it("makes no firsthand testing claim", () => {
    const prose = JSON.stringify(content);
    expect(prose).not.toMatch(/we tested|our tests|foolproof|best in the world/i);
    expect(recipe!.verification).toBe("editorialDraft");
  });
});

describe("duck fat roasted potatoes: commercial module", () => {
  const set = duckFatDecisionFor(PATH);

  it("renders the render/buy/substitute fork on the recipe", () => {
    expect(set).toBeTruthy();
    expect(ROUTE).toContain("<DuckFatDecision sourcePath={path} />");
    const destinations = set!.options.map((o) => o.to);
    expect(destinations).toContain("/buy/duck-fat-buying-guide");
    expect(destinations).toContain("/tools/duck-fat-substitution-calculator");
    expect(destinations).toContain("/learn/how-to-render-duck-fat");
    expect(new Set(destinations).size).toBe(destinations.length);
  });

  it("uses one stable registered placement id per destination", () => {
    const ids = [...duckFatDecisionPlacementIds(), ...allConversionPlacementIds()];
    for (const id of [
      "duck_fat_choice_potatoes_recipe_render",
      "duck_fat_choice_potatoes_recipe_buy",
      "duck_fat_choice_potatoes_recipe_substitute",
      "fat_substitution_to_potatoes_recipe",
      "duck_fat_guide_to_potatoes_recipe",
      "render_fat_to_potatoes_recipe",
    ]) {
      expect(ids).toContain(id);
    }
    expect(new Set(allConversionPlacementIds()).size).toBe(allConversionPlacementIds().length);
  });

  it("keeps merchant links off the recipe page", () => {
    expect(content!.linksInModuleOnly).toBe(true);
    expect(content!.sourcing).toEqual([]);
    expect(JSON.stringify(content)).not.toMatch(/https?:\/\//);
    expect(recipeNeedsDuckFat(SLUG)).toBe(true);
  });
});

describe("duck fat funnel: return paths", () => {
  it("links the recipe from the substitution tool exactly once", () => {
    const rows = conversionPathsForSource("/tools/duck-fat-substitution-calculator");
    const toRecipe = rows.filter((r) => r.destination === PATH);
    expect(toRecipe).toHaveLength(1);
    expect(TOOL).toContain('sourcePath="/tools/duck-fat-substitution-calculator"');
  });

  it("links the recipe from the buying guide exactly once, keeping the affiliate CTA", () => {
    const rows = conversionPathsForSource("/buy/duck-fat-buying-guide");
    expect(rows.filter((r) => r.destination === PATH)).toHaveLength(1);
    expect(GUIDE).toContain('placement="duck_fat_sources"');
    expect(GUIDE).toContain('linkIds={["us-wellness-duck-fat", "culver-duck-fat"]}');
    expect(GUIDE).toContain("<DisclosureBanner />");
    expect(GUIDE).toContain('id="storage"');
  });

  it("links the recipe from the render guide exactly once", () => {
    const rows = conversionPathsForSource("/learn/how-to-render-duck-fat");
    expect(rows.filter((r) => r.destination === PATH)).toHaveLength(1);
  });

  it("keeps every funnel destination internal", () => {
    for (const source of [
      PATH,
      "/tools/duck-fat-substitution-calculator",
      "/buy/duck-fat-buying-guide",
      "/learn/how-to-render-duck-fat",
    ]) {
      for (const row of conversionPathsForSource(source)) {
        expect(row.destination.startsWith("/")).toBe(true);
      }
    }
  });
});
