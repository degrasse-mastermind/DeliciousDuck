/**
 * Thanksgiving duck dinner planning hub.
 *
 * Proves the hub is registered once, renders the modules the cluster tests
 * expect, hands off to each intended destination exactly once with a unique
 * tracked placement, carries no outbound merchant link, tells the truth about
 * the single-oven schedule, makes no seller/stock claim, prints, and never
 * inherits or repeats another page's artwork.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  THANKSGIVING_CHECKLIST,
  THANKSGIVING_HUB_PATH,
  THANKSGIVING_INBOUND_PLACEMENTS,
  THANKSGIVING_LEFTOVERS,
  THANKSGIVING_PLAN,
  THANKSGIVING_PRINT_PLACEMENT,
  THANKSGIVING_TABLE_CHOICES,
  thanksgivingHubPlacementIds,
  thanksgivingStepsIn,
} from "@/data/thanksgiving-hub";
import { allConversionPlacementIds } from "@/data/conversion-paths";
import { guideByPath } from "@/data/guides";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { sketchForPath, sketchRotationForPath, SKETCH } from "@/lib/sketch-art";
import { sitemapPaths } from "@/lib/sitemap";

const ROUTE = "src/routes/learn.thanksgiving-duck-dinner.tsx";
const code = readFileSync(ROUTE, "utf8");
const plan = readFileSync("src/components/site/ThanksgivingPlan.tsx", "utf8");
const styles = readFileSync("src/styles.css", "utf8");
const read = (p: string) => readFileSync(p, "utf8");

describe("thanksgiving hub registration", () => {
  it("is registered in the guide registry, the cluster and the sitemap", () => {
    const guide = guideByPath(THANKSGIVING_HUB_PATH)!;
    expect(guide).toBeDefined();
    expect(guide.cluster).toBe("whole-duck");
    expect(guide.description.length).toBeLessThanOrEqual(170);
    expect(acquisitionPage(THANKSGIVING_HUB_PATH)).toBeDefined();
    expect(sitemapPaths()).toContain(THANKSGIVING_HUB_PATH);
  });

  it("is reachable from the duck-versus-turkey comparison", () => {
    const compare = read("src/routes/learn.duck-vs-turkey-thanksgiving.tsx");
    expect(compare).toContain("THANKSGIVING_INBOUND_PLACEMENTS.duckVsTurkey");
    expect(code).toContain("/learn/duck-vs-turkey-thanksgiving");
  });
});

describe("thanksgiving hub plan", () => {
  it("offers each intended destination exactly once", () => {
    const destinations = THANKSGIVING_PLAN.map((s) => s.to);
    expect(new Set(destinations).size).toBe(destinations.length);
    for (const expected of [
      "/tools/whole-duck-serving-calculator",
      "/buy/where-to-buy-duck-online",
      "/learn/how-to-thaw-duck",
      "/tools/duck-cooking-time-planner",
      "/recipes/roasted-whole-duck",
      "/cook/whole-roast-duck",
      "/learn/how-to-carve-a-duck",
      "/gear/best-roasting-pan-for-duck",
      "/gear/best-thermometer-for-duck",
      "/recipes/duck-fat-roasted-potatoes",
      "/buy/duck-fat-buying-guide",
    ]) {
      expect(destinations).toContain(expected);
    }
  });

  it("labels the recipe and the technique hand-off distinctly", () => {
    const recipe = THANKSGIVING_PLAN.find((s) => s.to === "/recipes/roasted-whole-duck")!;
    const technique = THANKSGIVING_PLAN.find((s) => s.to === "/cook/whole-roast-duck")!;
    expect(recipe.kind).toBe("recipe");
    expect(technique.kind).toBe("technique");
    expect(recipe.linkLabel).not.toBe(technique.linkLabel);
  });

  it("keeps every hand-off internal and measured", () => {
    const ids = thanksgivingHubPlacementIds();
    expect(new Set(ids).size).toBe(ids.length);
    for (const step of [...THANKSGIVING_PLAN, ...THANKSGIVING_LEFTOVERS]) {
      expect(step.to.startsWith("/")).toBe(true);
      expect(step.to).not.toMatch(/https?:|\?|#/);
      expect(step.placement).toMatch(/^[a-z0-9_]+$/);
      expect(step.placement.length).toBeGreaterThan(8);
    }
    const all = allConversionPlacementIds();
    for (const id of ids) expect(all).toContain(id);
    expect(new Set(all).size).toBe(all.length);
  });

  it("gives each destination exactly one owning module", () => {
    expect(thanksgivingStepsIn("table").map((s) => s.to)).toEqual([
      "/tools/whole-duck-serving-calculator",
    ]);
    expect(thanksgivingStepsIn("commercial").map((s) => s.to)).toEqual([
      "/buy/where-to-buy-duck-online",
      "/gear/best-roasting-pan-for-duck",
      "/gear/best-thermometer-for-duck",
      "/buy/duck-fat-buying-guide",
    ]);
    // The generic funnel band is gone, so nothing re-offers those destinations.
    expect(code).not.toContain("items={PAGE.funnel}");
  });

  it("makes no price, availability or testing claim", () => {
    const prose = JSON.stringify([
      THANKSGIVING_PLAN,
      THANKSGIVING_TABLE_CHOICES,
      THANKSGIVING_LEFTOVERS,
      THANKSGIVING_CHECKLIST,
    ]).toLowerCase();
    for (const banned of [
      "we tested",
      "hands-on",
      "$",
      "in stock",
      "discount",
      "cheapest",
      "dispatch",
      "sell through",
      "sizes sell",
      "ships frozen",
      "good sizes go first",
    ]) {
      expect(prose.includes(banned), banned).toBe(false);
    }
  });
});

describe("thanksgiving hub table choice", () => {
  it("covers small, full and larger or mixed tables with a tradeoff each", () => {
    expect(THANKSGIVING_TABLE_CHOICES).toHaveLength(3);
    expect(THANKSGIVING_TABLE_CHOICES[0]!.guests).toContain("2 to 4");
    expect(THANKSGIVING_TABLE_CHOICES[1]!.guests).toContain("5 to 8");
    expect(THANKSGIVING_TABLE_CHOICES[2]!.guests.toLowerCase()).toMatch(/larger|mixed/);
    for (const choice of THANKSGIVING_TABLE_CHOICES) {
      expect(choice.suits.length).toBeGreaterThan(30);
      expect(choice.tradeoff.length).toBeGreaterThan(30);
    }
    // Capacity is the 5-to-8 tradeoff, and turkey/portioned duck the larger one.
    expect(THANKSGIVING_TABLE_CHOICES[1]!.tradeoff.toLowerCase()).toContain("oven");
    expect(THANKSGIVING_TABLE_CHOICES[2]!.tradeoff.toLowerCase()).toMatch(/turkey|breast|confit/);
    expect(code).toContain("<ThanksgivingTableChoice />");
  });
});

describe("thanksgiving hub schedule truthfulness", () => {
  it("never implies fresh potatoes cook during a 20-minute rest", () => {
    expect(code).not.toMatch(/Rest, 20 minutes",\s*"Potatoes in the poured-off duck fat/);
    expect(code).toMatch(/re-crisp/i);
    expect(code).toMatch(/10 to 12 minutes/);
    expect(code.toLowerCase()).toContain("cannot be started from raw");
  });

  it("carries no counter-tempering language", () => {
    for (const banned of ["tempering on the counter", "temper on the counter", "bird tempering"]) {
      expect(code.toLowerCase().includes(banned), banned).toBe(false);
    }
    // Danger-zone guidance stays.
    expect(code).toContain("40°F and 140°F");
  });

  it("never suggests a cooked whole duck waits out a turkey", () => {
    const mixed = THANKSGIVING_TABLE_CHOICES.find((c) => /larger or mixed/i.test(c.guests))!;
    const surfaces = [mixed.tradeoff, code, read("src/routes/learn.duck-vs-turkey-thanksgiving.tsx")];
    for (const text of surfaces) {
      const lower = text.toLowerCase();
      for (const banned of [
        "rest it while the turkey finishes",
        "turkey finishes",
        "roast the duck first and rest it",
      ]) {
        expect(lower.includes(banned), banned).toBe(false);
      }
    }
    // The bounded overlap and both fallbacks stay.
    expect(mixed.tradeoff).toMatch(/20-minute rest overlaps the turkey's final cooking or resting window/);
    expect(mixed.tradeoff).toMatch(/second oven/);
    expect(mixed.tradeoff).toMatch(/portioned course/);
    expect(mixed.tradeoff).not.toMatch(/\b\d+\s*(hours|hrs|min\/lb)\b/);
    expect(code).toMatch(/second oven or serve portioned duck/);
  });

  it("makes no seller dispatch, stock or sell-through claim", () => {
    const lower = code.toLowerCase();
    for (const banned of [
      "dispatch days",
      "sizes sell through",
      "good sizes go first",
      "stock and dispatch",
      "ships frozen on set",
    ]) {
      expect(lower.includes(banned), banned).toBe(false);
    }
  });
});

describe("thanksgiving hub printable plan", () => {
  it("prints without a popup and reports through the analytics helper", () => {
    expect(code).toContain("<ThanksgivingPrintablePlan />");
    expect(plan).toContain("window.print()");
    expect(plan).not.toContain("window.open");
    expect(plan).toContain("trackPlanPrint");
    expect(THANKSGIVING_PRINT_PLACEMENT).toBe("thanksgiving_hub_print_plan");
    expect(plan).toContain("THANKSGIVING_PRINT_PLACEMENT");
    expect(plan).not.toMatch(/type="email"/);
  });

  it("has a checklist covering the whole holiday", () => {
    const items = THANKSGIVING_CHECKLIST.flatMap((g) => g.items).join(" ").toLowerCase();
    for (const topic of [
      "guest count",
      "delivery date",
      "refrigerator",
      "thermometer",
      "oven",
      "make-ahead",
      "salted",
      "schedule",
      "carve",
      "leftovers",
      "fat",
    ]) {
      expect(items, topic).toContain(topic);
    }
    expect(plan).toContain('type="checkbox"');
  });

  it("has print rules that drop chrome and print empty boxes", () => {
    const print = styles.slice(styles.indexOf("@media print"));
    expect(print).toContain("[data-print-hide]");
    expect(print).toMatch(/input\[type="checkbox"\]/);
    expect(print).toContain("appearance: none !important");
    expect(print).toMatch(/img,\s*svg,\s*figure \{\s*display: none !important;/);
    // Newsletter form and commercial module are chrome on paper.
    expect(code).toContain('<div data-print-hide className="mt-16">');
    expect(plan).toContain("data-print-hide");
  });
});

describe("thanksgiving hub commercial and leftovers modules", () => {
  it("renders one buyer-guide link each, with no merchant button", () => {
    expect(code).toContain("<ThanksgivingCommercialModule />");
    const module = plan.slice(plan.indexOf("ThanksgivingCommercialModule"));
    expect(module).not.toMatch(/https?:/);
  });

  it("points the leftovers section only at routes that exist", () => {
    expect(code).toContain("<ThanksgivingLeftovers />");
    for (const item of THANKSGIVING_LEFTOVERS) {
      const file = `src/routes/${item.to.split("/").filter(Boolean).join(".")}.tsx`;
      expect(() => read(file), item.to).not.toThrow();
    }
    expect(plan).toContain("three to four days");
  });
});

describe("thanksgiving hub reciprocal links", () => {
  const sources: Array<[keyof typeof THANKSGIVING_INBOUND_PLACEMENTS, string]> = [
    ["duckVsTurkey", "src/routes/learn.duck-vs-turkey-thanksgiving.tsx"],
    ["wholeRoastMethod", "src/routes/cook.whole-roast-duck.tsx"],
    ["thawingGuide", "src/routes/learn.how-to-thaw-duck.tsx"],
    ["servingCalculator", "src/routes/tools.whole-duck-serving-calculator.tsx"],
    ["sourcingGuide", "src/routes/buy.where-to-buy-duck-online.tsx"],
    ["roastedWholeDuckRecipe", "src/routes/recipes.$slug.tsx"],
    ["duckFatPotatoes", "src/routes/recipes.$slug.tsx"],
  ];

  it("adds exactly one tracked hub link per source page", () => {
    for (const [key, file] of sources) {
      const src = read(file);
      const id = `THANKSGIVING_INBOUND_PLACEMENTS.${key}`;
      expect(src.split(id).length - 1, `${file} ${key}`).toBe(1);
      expect(src, file).toContain("<ThanksgivingHubLink");
      // No untracked duplicate of the hub URL anywhere on the page.
      expect(src.split(THANKSGIVING_HUB_PATH).length - 1, `${file} raw hub link`).toBe(0);
    }
  });

  it("has unique inbound placements registered for tracking", () => {
    const ids = Object.values(THANKSGIVING_INBOUND_PLACEMENTS);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(allConversionPlacementIds()).toContain(id);
  });
});

describe("thanksgiving hub route", () => {
  it("renders the shared transparency, plan and funnel modules", () => {
    for (const marker of [
      `createFileRoute("${THANKSGIVING_HUB_PATH}")`,
      "<AnswerFirst page={PAGE} />",
      "<ArticleByline page={PAGE} />",
      "<ArticleBasis page={PAGE} />",
      "<SourceNotes ids={PAGE.sourceIds} />",
      "<FaqList items={FAQ} />",
      "faqSchema(FAQ)",
      "articleSchema",
      "breadcrumbSchema",
      "<ThanksgivingPlan",
      "<SafetyNote>",
    ]) {
      expect(code, marker).toContain(marker);
    }
    expect(code).not.toContain("recipeSchema");
  });

  it("instruments the newsletter placement", () => {
    expect(code).toContain('id="thanksgiving_duck_dinner_hub"');
    const newsletter = read("src/components/site/NewsletterSignup.tsx");
    expect(newsletter).toContain("data-placement={id}");
  });

  it("carries no outbound merchant link or tracking parameter", () => {
    expect(/href=["']https?:/i.test(code)).toBe(false);
    for (const banned of ["amazon.com", "grasslandbeefllc", "tag=deliciousduck-20", "utm_"]) {
      expect(code.includes(banned), banned).toBe(false);
    }
  });

  it("uses a durable local social asset, not a preview host", () => {
    expect(code).toContain("SOCIAL_IMAGE");
    expect(code).toContain("SKETCH.thanksgivingPlan.src");
    expect(code).toContain("image: SOCIAL_IMAGE");
    expect(code).not.toMatch(/r2\.dev|pub-[a-f0-9]{8}/);
    expect(SKETCH.thanksgivingPlan.src).toMatch(/thanksgiving-plan/);
  });

  it("has a unique hero and no repeated illustration", () => {
    expect(sketchForPath(THANKSGIVING_HUB_PATH)).toBe(SKETCH.thanksgivingPlan);
    const rotation = sketchRotationForPath(THANKSGIVING_HUB_PATH);
    expect(rotation).not.toContain(SKETCH.duckVsTurkey);
    expect(rotation).not.toContain(SKETCH.wholeRoastDuck);
    expect(new Set(rotation).size).toBe(rotation.length);
    // No hand-placed illustration on the page can repeat the rotation art.
    expect(code).not.toContain("<SketchSlot");
    // The hero drawing belongs to this page alone.
    const others = Object.entries(SKETCH).filter(([k]) => k !== "thanksgivingPlan");
    for (const [, art] of others) expect(art.src).not.toBe(SKETCH.thanksgivingPlan.src);
  });
});
