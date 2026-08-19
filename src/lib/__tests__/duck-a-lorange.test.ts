import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RECIPE_CONTENT } from "@/data/recipe-content";
import { RECIPES } from "@/data/recipes";
import { recipeConversionPlacements } from "@/data/conversion-paths";

/**
 * Correction guardrails for /recipes/duck-a-lorange.
 *
 * Three things this page must not drift back into: duplicated commercial
 * destinations, marmalade described as an acid, and a loose storage window on a
 * finished sauce containing stock, drippings and butter.
 */
const SLUG = "duck-a-lorange";
const content = RECIPE_CONTENT[SLUG]!;
const recipe = RECIPES.find((r) => r.slug === SLUG)!;
const ROUTE = readFileSync("src/routes/recipes.$slug.tsx", "utf8").replace(/\r\n/g, "\n");

const allProse = JSON.stringify(content);

describe("duck a l'orange: single commercial path per destination", () => {
  it("links each commercial destination exactly once, through the module", () => {
    expect(content.linksInModuleOnly).toBe(true);
    const rows = recipeConversionPlacements(SLUG, content.equipment, content.sourcing);
    expect(rows.map((r) => r.placement)).toEqual([
      "recipe_duck_a_lorange_equipment_best_thermometer_for_duck",
      "recipe_duck_a_lorange_equipment_best_roasting_pan_for_duck",
      "recipe_duck_a_lorange_sourcing_where_to_buy_duck_online",
    ]);
    // No commercial destination is repeated in the related-guide list.
    for (const row of rows) expect(content.related).not.toContain(row.destination);
  });

  it("suppresses the duplicate equipment links and sourcing modules on that page", () => {
    expect(ROUTE).toContain("item.to && !linksInModuleOnly");
    expect(ROUTE).toContain("{!linksInModuleOnly && (\n        <ShopThisGuide");
    expect(ROUTE).toContain("showConversionModule && !linksInModuleOnly");
    expect(ROUTE).toContain("showConversionModule && linksInModuleOnly");
  });
});

describe("duck a l'orange: sauce corrections", () => {
  it("never presents marmalade as an acid or as interchangeable with lemon or vinegar", () => {
    expect(allProse).not.toMatch(/marmalade or (?:\d+ tsp )?lemon/i);
    expect(allProse).not.toMatch(/Sharpen with marmalade/i);
    expect(allProse).not.toMatch(/marmalade[^"]{0,30}(?:is|as) an? acid/i);
    expect(allProse).not.toMatch(/(?:lemon|vinegar)[^"]{0,20}or[^"]{0,20}marmalade/i);
    const gastrique = content.ingredientGroups.find((g) => /gastrique/i.test(g.heading))!;
    expect(gastrique.items.some((i) => /lemon juice or extra red wine vinegar/i.test(i))).toBe(true);
    expect(
      gastrique.items.some((i) => /marmalade \(optional\)/i.test(i) && /sweetness/i.test(i)),
    ).toBe(true);
  });

  it("keeps acid as the sharpening lever in the method and troubleshooting", () => {
    const step = content.steps.find((s) => /Rest the duck/i.test(s.title))!;
    expect(step.body).toMatch(/those are the acid/i);
    expect(step.body).toMatch(/sharp first and sweet second/i);
    const fix = content.quackFix.find((q) => /tastes like marmalade/i.test(q.symptom))!;
    expect(fix.fixNow).toMatch(/Marmalade will not fix this/i);
  });
});

describe("duck a l'orange: safety and claim corrections", () => {
  it("stores the finished sauce for 3-4 days, never a week", () => {
    expect(allProse).not.toMatch(/keeps a week/i);
    const sauce = content.leftovers.find((l) => /gastrique/i.test(l.part))!;
    expect(sauce.use).toMatch(/3–4 days refrigerated/);
  });

  it("marks the lower breast pull temperature against the official minimum", () => {
    const faq = content.faq.find((f) => /duck breasts instead/i.test(f.q))!;
    expect(faq.a).toContain("130–135°F");
    expect(faq.a).toContain("165°F (73.9°C)");
    expect(faq.a).toMatch(/culinary convention, not a safety one/i);
  });

  it("claims no fixed rendered-fat yield", () => {
    expect(allProse).not.toMatch(/several hundred millilitres/i);
    const fat = content.leftovers.find((l) => /Rendered fat/i.test(l.part))!;
    expect(fat.use).toMatch(/depends on the size and breed/i);
  });

  it("keeps the recipe metadata and honest image alt intact", () => {
    expect(recipe.recipeYield).toBe("4 servings");
    expect(recipe.imageAlt).toBeTruthy();
    expect(recipe.verification).toBe("editorialDraft");
  });
});

describe("duck a l'orange: two distinct image roles", () => {
  it("uses the photograph for cards, JSON-LD and social previews", () => {
    expect(recipe.image).toMatch(/duck-a-lorange-card/);
    expect(recipe.imageAlt).toBe(
      "Whole roast Duck à l’Orange with crisp mahogany skin and orange gastrique",
    );
    // Route metadata and Recipe schema both read recipe.image, not the illustration.
    expect(ROUTE).toContain("image: recipe.image");
  });

  it("uses the illustration as the detail-page visual", () => {
    expect(recipe.illustration).toMatch(/duck-a-lorange-illustration/);
    expect(recipe.illustrationAlt).toMatch(/illustration/i);
    expect(recipe.illustration).not.toBe(recipe.image);
    expect(ROUTE).toContain("src={recipe.illustration ?? recipe.image}");
  });

  it("leaves other recipe thumbnails untouched", () => {
    for (const r of RECIPES.filter((r) => r.slug !== SLUG)) {
      expect(r.image).not.toMatch(/duck-a-lorange/);
      expect(r.illustration ?? "").not.toMatch(/duck-a-lorange/);
    }
  });
});
