import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RECIPE_CONTENT } from "@/data/recipe-content";
import { RECIPES } from "@/data/recipes";
import {
  RECIPE_CONVERSION_SLUGS,
  allConversionPlacementIds,
  recipeConversionPlacements,
} from "@/data/conversion-paths";

/**
 * Guardrails for the recipe-to-money-page paths on Roasted Whole Duck and
 * Duck Leg Confit, plus the two image roles on Roasted Whole Duck.
 */
const ROUTE = readFileSync("src/routes/recipes.$slug.tsx", "utf8");
const placements = (slug: string) => {
  const c = RECIPE_CONTENT[slug]!;
  return recipeConversionPlacements(slug, c.equipment, c.sourcing);
};

describe("roasted whole duck: tracked commercial path", () => {
  const rows = placements("roasted-whole-duck");

  it("renders the required destinations exactly once each", () => {
    const dests = rows.map((r) => r.destination);
    expect(dests).toContain("/gear/best-roasting-pan-for-duck");
    expect(dests).toContain("/gear/best-thermometer-for-duck");
    expect(dests).toContain("/buy/where-to-buy-duck-online");
    expect(new Set(dests).size).toBe(dests.length);
  });

  it("registers the stable placement ids", () => {
    const ids = allConversionPlacementIds();
    for (const id of [
      "recipe_roasted_whole_duck_equipment_best_roasting_pan_for_duck",
      "recipe_roasted_whole_duck_equipment_best_thermometer_for_duck",
      "recipe_roasted_whole_duck_sourcing_where_to_buy_duck_online",
    ]) {
      expect(ids).toContain(id);
    }
  });

  it("links commercial destinations in the module only", () => {
    expect(RECIPE_CONTENT["roasted-whole-duck"]!.linksInModuleOnly).toBe(true);
    expect((RECIPE_CONVERSION_SLUGS as readonly string[])).toContain("roasted-whole-duck");
  });

  it("keeps the photograph for cards and schema and the other image on the page", () => {
    const recipe = RECIPES.find((r) => r.slug === "roasted-whole-duck")!;
    expect(recipe.image).toMatch(/roasted-whole-duck-card/);
    expect(recipe.imageAlt).toBe(
      "Whole roasted duck with crisp mahogany skin, roast potatoes and thyme",
    );
    expect(recipe.illustration).toMatch(/recipe-whole-roast/);
    expect(recipe.illustration).not.toBe(recipe.image);
    expect(ROUTE).toContain("image: recipe.image");
  });
});

describe("duck leg confit: tracked commercial path", () => {
  const rows = placements("duck-leg-confit");

  it("renders the required destinations exactly once each", () => {
    const dests = rows.map((r) => r.destination);
    expect(dests).toContain("/gear/best-dutch-oven-for-duck-confit");
    expect(dests).toContain("/buy/duck-fat-buying-guide");
    expect(dests).toContain("/buy/where-to-buy-duck-online");
    expect(new Set(dests).size).toBe(dests.length);
  });

  it("registers the stable placement ids", () => {
    const ids = allConversionPlacementIds();
    for (const id of [
      "recipe_duck_leg_confit_equipment_best_dutch_oven_for_duck_confit",
      "recipe_duck_leg_confit_sourcing_duck_fat_buying_guide",
      "recipe_duck_leg_confit_sourcing_where_to_buy_duck_online",
    ]) {
      expect(ids).toContain(id);
    }
  });

  it("links commercial destinations in the module only", () => {
    expect(RECIPE_CONTENT["duck-leg-confit"]!.linksInModuleOnly).toBe(true);
    expect((RECIPE_CONVERSION_SLUGS as readonly string[])).toContain("duck-leg-confit");
  });
});

describe("no raw merchant links in recipe modules", () => {
  it("keeps every recipe equipment and sourcing target internal", () => {
    for (const slug of RECIPE_CONVERSION_SLUGS) {
      for (const row of placements(slug)) {
        expect(row.destination.startsWith("/")).toBe(true);
      }
    }
  });
});

describe("thanksgiving alias", () => {
  const ALIAS = readFileSync("src/routes/learn.duck-vs-turkey-for-thanksgiving.tsx", "utf8");

  it("permanently redirects to the canonical article without rendering content", () => {
    expect(ALIAS).toContain('to: "/learn/duck-vs-turkey-thanksgiving"');
    expect(ALIAS).toContain("statusCode: 301");
    expect(ALIAS).not.toContain("component:");
  });
});
