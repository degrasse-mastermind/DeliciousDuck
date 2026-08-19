import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONVERSION_PATHS,
  CONVERSION_PATH_CLICK_EVENT,
  RECIPE_CONVERSION_SLUGS,
  allConversionPlacementIds,
  buildConversionPathClickEvent,
  conversionPathByPlacement,
  conversionPathsForSource,
  recipeConversionPlacements,
  recipePlacementId,
} from "@/data/conversion-paths";
import { RECIPE_CONTENT } from "@/data/recipe-content";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const idTokenised = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** `/gear/best-pan-for-duck-breast` -> `src/routes/gear.best-pan-for-duck-breast.tsx` */
function routeFileFor(path: string): string {
  const segments = path.split("/").filter(Boolean);
  const base = `src/routes/${segments.join(".")}`;
  // Hub paths such as "/gear" render from their `.index.tsx` leaf, not the layout.
  return existsSync(resolve(process.cwd(), `${base}.index.tsx`)) ? `${base}.index.tsx` : `${base}.tsx`;
}

const routeExists = (path: string) => {
  // Recipe URLs resolve through the dynamic `$slug` route, keyed on the data.
  const recipe = /^\/recipes\/([a-z0-9-]+)$/.exec(path);
  if (recipe) return Boolean(RECIPE_CONTENT[recipe[1]!]);
  return (
    existsSync(resolve(process.cwd(), routeFileFor(path))) ||
    existsSync(resolve(process.cwd(), `src/routes/${path.split("/").filter(Boolean).join(".")}.index.tsx`))
  );
};

/* ------------------------------------------------------------------ *
 * Placement map integrity
 * ------------------------------------------------------------------ */

describe("conversion placement map", () => {
  it("has unique, descriptive placement ids across static and recipe placements", () => {
    const ids = allConversionPlacementIds();
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9_]+$/);
      expect(id.length).toBeGreaterThan(8);
    }
  });

  it("only points at internal routes that exist", () => {
    for (const path of CONVERSION_PATHS) {
      expect(path.destination.startsWith("/")).toBe(true);
      expect(path.sourcePath.startsWith("/")).toBe(true);
      expect(path.destination).not.toContain("?");
      expect(routeExists(path.destination), path.destination).toBe(true);
      expect(routeExists(path.sourcePath), path.sourcePath).toBe(true);
      expect(path.sourcePath).not.toBe(path.destination);
    }
  });

  it("uses specific, honest anchor text", () => {
    for (const path of CONVERSION_PATHS) {
      expect(path.anchor.length).toBeGreaterThan(15);
      expect(path.anchor).not.toMatch(/click here|read more|learn more|shop now|buy now/i);
      expect(path.reason.length).toBeGreaterThan(20);
    }
  });

  it("never claims testing, endorsement, price, rating or availability", () => {
    const prose = CONVERSION_PATHS.map((p) => `${p.anchor} ${p.reason}`).join(" ");
    for (const banned of [
      /we tested/i,
      /hands-on/i,
      /\bendorse/i,
      /\$\d/,
      /\bin stock\b/i,
      /\bdiscount\b/i,
      /\bstar rating\b/i,
    ]) {
      expect(prose).not.toMatch(banned);
    }
  });
});

/* ------------------------------------------------------------------ *
 * The mappings DEL-12 requires
 * ------------------------------------------------------------------ */

describe("cornerstone intent paths", () => {
  const expected: [string, string, string][] = [
    ["/learn/how-to-score-duck-breast", "/gear/best-knife-for-scoring-duck", "score_breast_to_knife_guide"],
    ["/learn/whole-duck-cooking-time", "/gear/best-thermometer-for-duck", "whole_duck_timing_to_thermometer_guide"],
    ["/learn/how-to-thaw-duck", "/buy/where-to-buy-duck-online", "thaw_duck_to_sourcing_guide"],
    ["/tools/whole-duck-serving-calculator", "/buy/where-to-buy-duck-online", "serving_calculator_to_sourcing_guide"],
  ];

  it.each(expected)("%s links to %s as %s", (source, destination, placement) => {
    const path = conversionPathByPlacement(placement);
    expect(path).toBeDefined();
    expect(path!.sourcePath).toBe(source);
    expect(path!.destination).toBe(destination);
    expect(path!.direction).toBe("cornerstone_to_commercial");
  });

  it("renders a conversion module on each mapped source route with the right sourcePath", () => {
    const sources = [...new Set(CONVERSION_PATHS.map((p) => p.sourcePath))];
    for (const source of sources) {
      const file = read(routeFileFor(source));
      // Duck-fat supporting pages render the render/buy/substitute module
      // instead of the generic nav, so the buying guide is offered once.
      const module = file.includes("ConversionPaths") ? "ConversionPaths" : "DuckFatDecision";
      expect(file, source).toContain(module);
      expect(file, source).toContain(`sourcePath="${source}"`);
    }
  });

});

describe("commercial support paths", () => {
  const commercialSources = [
    "/gear/best-thermometer-for-duck",
    "/gear/best-knife-for-scoring-duck",
    "/gear/best-pan-for-duck-breast",
    "/buy/where-to-buy-duck-online",
  ];

  it.each(commercialSources)("%s links back to editorial validation", (source) => {
    const paths = conversionPathsForSource(source);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path.direction).toBe("commercial_to_editorial");
      expect(path.destination.startsWith("/learn/")).toBe(true);
    }
  });

  it("keeps every key commercial guide within one click of a cornerstone route", () => {
    const commercialDestinations = CONVERSION_PATHS.filter(
      (p) => p.direction === "cornerstone_to_commercial",
    ).map((p) => p.destination);
    for (const guide of ["/gear/best-knife-for-scoring-duck", "/gear/best-thermometer-for-duck", "/buy/where-to-buy-duck-online"]) {
      expect(commercialDestinations).toContain(guide);
    }
  });

  it("preserves the existing proximate disclosure modules on commercial routes", () => {
    expect(read("src/routes/gear.best-thermometer-for-duck.tsx")).toContain("DisclosureBanner");
    expect(read("src/routes/gear.best-pan-for-duck-breast.tsx")).toContain("DisclosureBanner");
    expect(read("src/routes/buy.where-to-buy-duck-online.tsx")).toContain("Disclosure");
  });

  it("adds no outbound merchant URLs in the conversion-path layer", () => {
    for (const file of ["src/data/conversion-paths.ts", "src/components/site/ConversionPaths.tsx"]) {
      expect(read(file)).not.toMatch(/https?:\/\/(?!schema\.org)/);
    }
  });
});

describe("recipe context paths", () => {
  it("covers the three recipes from their own recipe data", () => {
    for (const slug of RECIPE_CONVERSION_SLUGS) {
      const content = RECIPE_CONTENT[slug];
      expect(content, slug).toBeDefined();
      const destinations = [
        ...content!.equipment.map((e) => e.to).filter(Boolean),
        ...content!.sourcing.map((s) => s.to),
      ] as string[];
      expect(destinations.length).toBeGreaterThan(0);
      for (const destination of destinations) expect(routeExists(destination), destination).toBe(true);
    }
  });

  it("gives every rendered recipe link a unique, destination-specific placement id", () => {
    for (const slug of RECIPE_CONVERSION_SLUGS) {
      const content = RECIPE_CONTENT[slug]!;
      const rows = recipeConversionPlacements(slug, content.equipment, content.sourcing);
      expect(rows.length).toBeGreaterThan(1);
      const ids = rows.map((r) => r.placement);
      expect(new Set(ids).size, `${slug}: ${ids.join(", ")}`).toBe(ids.length);
      for (const row of rows) {
        expect(row.placement).toMatch(/^[a-z0-9_]+$/);
        expect(row.placement).toContain(idTokenised(slug));
        expect(row.placement).toContain(row.intent);
        expect(row.placement.endsWith(idTokenised(row.destination.split("/").pop()!))).toBe(true);
        // stable across calls
        expect(recipePlacementId(slug, row.intent, row.destination)).toBe(row.placement);
      }
    }
  });

  it("has no duplicate placement id anywhere in the full placement map", () => {
    const ids = allConversionPlacementIds();
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });

  it("renders the recipe module from shared data, not per-recipe hardcoding", () => {
    const file = read("src/routes/recipes.$slug.tsx");
    expect(file).toContain("RecipeConversionPaths");
    expect(file).toContain("RECIPE_CONVERSION_SLUGS");
    expect(file).toContain("equipment={content.equipment}");
    expect(file).toContain("sourcing={content.sourcing}");
  });

  it("frames equipment guidance by category rather than product endorsement", () => {
    expect(read("src/components/site/ConversionPaths.tsx")).toContain(
      "The guides work at the level of category and material.",
    );
  });
});

/* ------------------------------------------------------------------ *
 * Measurement
 * ------------------------------------------------------------------ */

describe("conversion click event", () => {
  it("emits five stable, PII-free parameters", () => {
    const event = buildConversionPathClickEvent({
      destination: "/gear/best-thermometer-for-duck",
      intent: "temperature_verification",
      placement: "whole_duck_timing_to_thermometer_guide",
      sourcePath: "/learn/whole-duck-cooking-time?token=abc#top",
    });
    expect(event.name).toBe(CONVERSION_PATH_CLICK_EVENT);
    expect(Object.keys(event.params).sort()).toEqual([
      "destination_path",
      "destination_slug",
      "intent",
      "placement",
      "source_path",
    ]);
    expect(event.params.source_path).toBe("/learn/whole-duck-cooking-time");
    expect(event.params.destination_slug).toBe("best-thermometer-for-duck");
    const serialized = JSON.stringify(event.params);
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("?");
    expect(serialized).not.toContain("@");
  });

  it("registers the event name once in the analytics registry", () => {
    const analytics = read("src/lib/analytics.ts");
    expect(analytics).toContain("internalConversionClick: CONVERSION_PATH_CLICK_EVENT");
    expect(analytics).toContain("export function trackConversionPathClick");
    // affiliate_click semantics untouched
    expect(analytics).toContain("affiliateClick: COMMERCIAL_EVENTS.affiliateClick");
  });

  it("documents the placement map: source, destination, intent, placement id", () => {
    const map = CONVERSION_PATHS.map(
      (p) => `${p.sourcePath} -> ${p.destination} [${p.intent}] #${p.placement}`,
    );
    expect(map.length).toBeGreaterThanOrEqual(28);
    expect(map).toMatchInlineSnapshot(`
      [
        "/learn/how-to-score-duck-breast -> /gear/best-knife-for-scoring-duck [equipment] #score_breast_to_knife_guide",
        "/learn/whole-duck-cooking-time -> /gear/best-thermometer-for-duck [temperature_verification] #whole_duck_timing_to_thermometer_guide",
        "/learn/how-to-thaw-duck -> /buy/where-to-buy-duck-online [sourcing] #thaw_duck_to_sourcing_guide",
        "/cook/whole-roast-duck -> /buy/where-to-buy-duck-online [sourcing] #whole_roast_duck_to_sourcing_guide",
        "/cook/whole-roast-duck -> /gear/best-roasting-pan-for-duck [equipment] #whole_roast_duck_to_roasting_pan_guide",
        "/buy/how-to-choose-duck -> /buy/where-to-buy-duck-online [sourcing] #choose_duck_to_sourcing_guide",
        "/buy/what-cut-of-duck-to-buy -> /buy/where-to-buy-duck-online [sourcing] #what_cut_to_sourcing_guide",
        "/buy/how-much-duck-per-person -> /buy/where-to-buy-duck-online [sourcing] #how_much_duck_to_sourcing_guide",
        "/buy/fresh-vs-frozen-duck -> /buy/where-to-buy-duck-online [sourcing] #fresh_vs_frozen_to_sourcing_guide",
        "/learn/duck-vs-turkey-thanksgiving -> /buy/where-to-buy-duck-online [sourcing] #thanksgiving_to_sourcing_guide",
        "/cook/how-to-cook-duck-breast -> /buy/where-to-buy-duck-online [sourcing] #cook_breast_to_sourcing_guide",
        "/learn/why-duck-skin-isnt-crispy -> /gear/best-pan-for-duck-breast [equipment] #crisp_skin_to_pan_guide",
        "/learn/duck-breast-temperature-doneness -> /gear/best-thermometer-for-duck [temperature_verification] #breast_doneness_to_thermometer_guide",
        "/tools/duck-doneness-guide -> /gear/best-thermometer-for-duck [temperature_verification] #doneness_guide_to_thermometer_guide",
        "/cook/duck-leg-confit -> /buy/where-to-buy-duck-online [sourcing] #confit_to_sourcing_guide",
        "/cook/duck-leg-confit -> /buy/duck-fat-buying-guide [sourcing] #confit_to_duck_fat_guide",
        "/learn/how-to-render-duck-fat -> /buy/duck-fat-buying-guide [sourcing] #render_fat_to_duck_fat_guide",
        "/cook/ways-to-use-duck-fat -> /buy/duck-fat-buying-guide [sourcing] #use_duck_fat_to_duck_fat_guide",
        "/ingredients/duck-fat-vs-butter-oil -> /buy/duck-fat-buying-guide [sourcing] #fat_vs_butter_to_duck_fat_guide",
        "/tools/duck-fat-substitution-calculator -> /buy/duck-fat-buying-guide [sourcing] #fat_substitution_to_duck_fat_guide",
        "/tools/whole-duck-serving-calculator -> /buy/where-to-buy-duck-online [sourcing] #serving_calculator_to_sourcing_guide",
        "/gear/best-thermometer-for-duck -> /learn/whole-duck-cooking-time [technique_validation] #thermometer_guide_to_whole_duck_timing",
        "/gear/best-thermometer-for-duck -> /learn/duck-breast-temperature-doneness [temperature_verification] #thermometer_guide_to_breast_doneness",
        "/gear/best-knife-for-scoring-duck -> /learn/how-to-score-duck-breast [technique_validation] #knife_guide_to_scoring_technique",
        "/buy/where-to-buy-duck-online -> /learn/how-to-thaw-duck [technique_validation] #sourcing_guide_to_thawing",
        "/buy/duck-fat-buying-guide -> /learn/how-to-render-duck-fat [technique_validation] #duck_fat_guide_to_rendering",
        "/buy/duck-fat-buying-guide -> /cook/ways-to-use-duck-fat [technique_validation] #duck_fat_guide_to_uses",
        "/gear/best-pan-for-duck-breast -> /learn/why-duck-skin-isnt-crispy [technique_validation] #pan_guide_to_crisp_skin_troubleshooting",
        "/gear -> /gear/best-dutch-oven-for-duck-confit [equipment] #gear_index_to_confit_vessel_guide",
        "/cook/duck-leg-confit -> /gear/best-dutch-oven-for-duck-confit [equipment] #confit_to_vessel_guide",
        "/buy/duck-fat-buying-guide -> /gear/best-dutch-oven-for-duck-confit [equipment] #duck_fat_guide_to_confit_vessel_guide",
        "/learn/how-to-render-duck-fat -> /gear/best-dutch-oven-for-duck-confit [equipment] #render_fat_to_confit_vessel_guide",
        "/gear/best-dutch-oven-for-duck-confit -> /cook/duck-leg-confit [technique_validation] #confit_vessel_guide_to_confit_method",
        "/gear/best-dutch-oven-for-duck-confit -> /buy/duck-fat-buying-guide [sourcing] #confit_vessel_guide_to_duck_fat_guide",
      ]
    `);
  });
});
