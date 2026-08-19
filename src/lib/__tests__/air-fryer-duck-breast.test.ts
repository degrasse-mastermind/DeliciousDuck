import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RECIPES } from "@/data/recipes";
import { RECIPE_CONTENT } from "@/data/recipe-content";
import { RECIPE_CONVERSION_SLUGS, allConversionPlacementIds } from "@/data/conversion-paths";
import {
  AIR_FRYER_INBOUND_PLACEMENTS,
  AIR_FRYER_NEWSLETTER_PLACEMENT,
  AIR_FRYER_OUTBOUND_PLACEMENTS,
  AIR_FRYER_RECIPE_PATH,
  AIR_FRYER_VS_SKILLET,
  airFryerPlacementIds,
} from "@/data/air-fryer-inbound";
import { sitemapPaths } from "@/lib/sitemap";
import { pageMeta } from "@/lib/seo";
import { SKETCH, sketchForPath, sketchRotationForPath } from "@/lib/sketch-art";

const SLUG = "air-fryer-duck-breast";
const read = (p: string) => readFileSync(p, "utf8");

const recipe = RECIPES.find((r) => r.slug === SLUG)!;
const content = RECIPE_CONTENT[SLUG]!;

describe("air fryer duck breast: registration", () => {
  it("is registered in the recipe data, sitemap and conversion slugs", () => {
    expect(recipe).toBeTruthy();
    expect(content).toBeTruthy();
    expect(sitemapPaths()).toContain(AIR_FRYER_RECIPE_PATH);
    expect(RECIPE_CONVERSION_SLUGS as readonly string[]).toContain(SLUG);
  });

  it("binds its own photograph to both the hero and the card", () => {
    expect(recipe.image).toContain("recipe-air-fryer-duck-breast");
    expect(recipe.cardImage).toContain("recipe-air-fryer-duck-breast-card");
    // Never inherits another recipe's art, and has no illustration override.
    expect(recipe.illustration).toBeUndefined();
    expect(recipe.imageAlt).toMatch(/crisp/i);
    const others = RECIPES.filter((r) => r.slug !== SLUG);
    expect(others.some((r) => r.image === recipe.image)).toBe(false);
    expect(others.some((r) => r.cardImage && r.cardImage === recipe.cardImage)).toBe(false);
  });

  it("keeps the untested verification gate", () => {
    expect(recipe.verification).toBe("editorialDraft");
    expect(recipe.validation.lastKitchenTest).toBeNull();
  });

  it("cards prefer the card crop while schema keeps the full-size image", () => {
    expect(read("src/components/site/RecipeCard.tsx")).toContain(
      "recipe.cardImage ?? recipe.image",
    );
    const route = read("src/routes/recipes.$slug.tsx");
    expect(route).toContain("image: recipe.image");
  });
});

describe("air fryer duck breast: method integrity", () => {
  const text = JSON.stringify(content).toLowerCase();

  it("renders low, drains the fat, then crisps high", () => {
    const titles = content.steps.map((s) => s.title.toLowerCase());
    expect(titles.some((t) => t.includes("render low"))).toBe(true);
    expect(titles.some((t) => t.includes("drain"))).toBe(true);
    expect(titles.some((t) => t.includes("crisp high"))).toBe(true);
    expect(titles.some((t) => t.includes("rest"))).toBe(true);
  });

  it("is thermometer-led and treats times as ranges", () => {
    expect(text).toContain("130–135°f");
    expect(text).toContain("165°f");
    expect(content.verifyNote?.body).toMatch(/starting point|wattage|fan strength/i);
    expect(content.guidanceNote).toMatch(/starting ranges/i);
  });

  it("cooks skin-side up and scores skin and fat only", () => {
    expect(text).toContain("skin-side up");
    expect(text).toMatch(/stopping short of the meat|without cutting into/);
  });

  it("never tells the reader to add water unconditionally", () => {
    const drawerWater =
      JSON.stringify(content).match(/[^.]*water[^.]*(drawer|appliance|basket)[^.]*\./gi) ??
      JSON.stringify(content).match(/[^.]*(drawer|appliance|basket)[^.]*water[^.]*\./gi) ??
      [];
    expect(drawerWater.length).toBeGreaterThan(0);
    for (const sentence of drawerWater) {
      expect(sentence.toLowerCase()).toMatch(/manufacturer|permits|only if|do not/);
    }
  });

  it("makes no superlative or firsthand-testing claims", () => {
    for (const banned of [
      "restaurant-quality",
      "foolproof",
      "we tested",
      "perfect every time",
      "guaranteed",
    ]) {
      expect(text).not.toContain(banned);
    }
  });
});

describe("air fryer duck breast: comparison and commercial restraint", () => {
  it("compares the skillet honestly without declaring a winner", () => {
    const compare = read("src/components/site/AirFryerMethodCompare.tsx");
    expect(compare).toContain("Skillet versus air fryer");
    expect(compare).toMatch(/Neither method is the better one/);
    expect(AIR_FRYER_VS_SKILLET.length).toBeGreaterThanOrEqual(5);
    for (const row of AIR_FRYER_VS_SKILLET) {
      expect(row.airFryer.length).toBeGreaterThan(10);
      expect(row.skillet.length).toBeGreaterThan(10);
    }
  });

  it("routes every commercial CTA through the single conversion module", () => {
    expect(content.linksInModuleOnly).toBe(true);
    const destinations = [
      ...content.equipment.flatMap((e) => (e.to ? [e.to] : [])),
      ...content.sourcing.map((s) => s.to),
    ];
    expect(destinations).toEqual([
      "/gear/best-thermometer-for-duck",
      "/gear/best-knife-for-scoring-duck",
      "/buy/where-to-buy-duck-breast-online",
    ]);
    // Internal only: no merchant or Amazon URLs anywhere in the page data.
    expect(JSON.stringify(content)).not.toMatch(/https?:\/\//);
    expect(new Set(destinations).size).toBe(destinations.length);
  });

  it("recommends no air fryer model", () => {
    const text = JSON.stringify(content).toLowerCase();
    expect(text).not.toMatch(/best air fryer|we recommend the/);
  });
});

describe("air fryer duck breast: link network and analytics", () => {
  const inbound: [string, string][] = [
    ["src/routes/recipes.$slug.tsx", AIR_FRYER_INBOUND_PLACEMENTS.panSearedRecipe],
    ["src/routes/cook.how-to-cook-duck-breast.tsx", AIR_FRYER_INBOUND_PLACEMENTS.breastMethodGuide],
    ["src/routes/learn.how-to-score-duck-breast.tsx", AIR_FRYER_INBOUND_PLACEMENTS.scoringGuide],
    [
      "src/routes/learn.duck-breast-temperature-doneness.tsx",
      AIR_FRYER_INBOUND_PLACEMENTS.donenessGuide,
    ],
    [
      "src/routes/buy.where-to-buy-duck-breast-online.tsx",
      AIR_FRYER_INBOUND_PLACEMENTS.breastSourcingGuide,
    ],
  ];

  it("links inbound exactly once per source page", () => {
    for (const [file, placement] of inbound) {
      const source = read(file);
      const uses = source.split("<AirFryerRecipeLink").length - 1;
      expect(uses, file).toBe(1);
      const key = Object.entries(AIR_FRYER_INBOUND_PLACEMENTS).find(
        ([, value]) => value === placement,
      )![0];
      expect(source, file).toContain(`AIR_FRYER_INBOUND_PLACEMENTS.${key}`);
    }
  });

  it("registers every placement id, uniquely", () => {
    const ids = airFryerPlacementIds();
    expect(new Set(ids).size).toBe(ids.length);
    const registered = allConversionPlacementIds();
    for (const id of ids) expect(registered).toContain(id);
    // Recipe module placements are derived from the recipe data.
    expect(registered.filter((id) => id.includes("air_fryer")).length).toBeGreaterThan(ids.length);
  });

  it("uses the shared tracked link helper rather than raw anchors", () => {
    const link = read("src/components/site/AirFryerRecipeLink.tsx");
    expect(link).toContain("TrackedHubLink");
    expect(link).not.toContain("<a ");
    expect(read("src/components/site/AirFryerMethodCompare.tsx")).not.toContain("<a ");
    for (const key of Object.keys(AIR_FRYER_OUTBOUND_PLACEMENTS)) {
      expect(read("src/components/site/AirFryerMethodCompare.tsx")).toContain(
        `AIR_FRYER_OUTBOUND_PLACEMENTS.${key}`,
      );
    }
  });

  it("shows one honest Duck Drop signup with a unique placement", () => {
    const route = read("src/routes/recipes.$slug.tsx");
    expect(route).toContain("AIR_FRYER_NEWSLETTER_PLACEMENT");
    expect(AIR_FRYER_NEWSLETTER_PLACEMENT).toBe("air-fryer-duck-breast-field-guide");
    expect(route.split("<NewsletterSignup").length - 1).toBe(1);
  });
});

describe("air fryer duck breast: hero art and photograph integrity", () => {
  it("no longer binds the reused sliced-breast drawing to this route", () => {
    const art = read("src/lib/sketch-art.ts");
    expect(art).not.toContain('"/recipes/air-fryer-duck-breast": "slicedBreast"');
    expect(sketchForPath(AIR_FRYER_RECIPE_PATH)).toBeNull();
    expect(sketchRotationForPath(AIR_FRYER_RECIPE_PATH)).toEqual([]);
    // Other routes keep their drawings.
    expect(sketchForPath("/recipes")).toBe(SKETCH.slicedBreast);
  });

  it("keeps the unique photograph as the recipe, card and social image", () => {
    expect(recipe.image).toContain("recipe-air-fryer-duck-breast");
    expect(recipe.image).not.toContain("sliced-breast");
    expect(recipe.cardImage).toContain("recipe-air-fryer-duck-breast-card");
    const route = read("src/routes/recipes.$slug.tsx");
    expect(route).toContain("image: recipe.image");
    const meta = pageMeta({
      title: "t",
      description: "d",
      path: AIR_FRYER_RECIPE_PATH,
      ogType: "article",
      image: recipe.image,
    }).meta;
    const og = meta.filter((m: Record<string, string>) => m["property"] === "og:image");
    const tw = meta.filter((m: Record<string, string>) => m["name"] === "twitter:image");
    expect(og).toHaveLength(1);
    expect(tw).toHaveLength(1);
    expect(og[0]!["content"]).toMatch(
      /^https:\/\/deliciousduck\.com\/.*recipe-air-fryer-duck-breast/,
    );
    expect(tw[0]!["content"]).toBe(og[0]!["content"]);
  });
});

describe("air fryer duck breast: optional sauce and description accuracy", () => {
  it("labels the cherry sauce optional in the caption and the alt text", () => {
    expect(content.imageCaption?.text).toMatch(/optional dark cherry sauce/i);
    expect(content.imageCaption?.to).toBe("/ingredients/cherry-plum-with-duck");
    expect(recipe.imageAlt).toMatch(/optional dark cherry sauce/i);
    expect(read("src/routes/recipes.$slug.tsx")).toContain("content.imageCaption");
  });

  it("keeps cherry sauce out of the ingredients, steps and schema", () => {
    const core = JSON.stringify([content.ingredientGroups, content.steps]).toLowerCase();
    expect(core).not.toContain("cherry");
  });

  it("drops the smoke-free absolute from the meta description", () => {
    expect(recipe.description).not.toContain("without a smoking kitchen");
    expect(recipe.description).toBe(
      "Air fryer duck breast with crisp skin: render the fat gently, finish at high heat, and use a thermometer while managing smoke and hot rendered fat.",
    );
    // Smoke management is still taught on the page.
    expect(JSON.stringify(content).toLowerCase()).toContain("smok");
  });
});
