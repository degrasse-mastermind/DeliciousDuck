import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { recipeBySlug } from "@/data/recipe-content";
import { SOURCES } from "@/data/sources";

const PATH = "/learn/duck-vs-turkey-thanksgiving";
const FILE = "src/routes/learn.duck-vs-turkey-thanksgiving.tsx";
const code = readFileSync(FILE, "utf8");
/** Answer strings from the single FAQ array the page renders and serializes. */
/** Page source with whitespace collapsed, for assertions on wrapped prose. */
const NORM = code.replace(/\s+/g, " ");
const FAQ_TEXT = (code.slice(code.indexOf("const FAQ = ["), code.indexOf("function Page()")).match(
  /a: "(?:[^"\\]|\\.)*"/g,
) ?? []).map((m) => m.slice(4, -1));

describe("duck vs turkey holiday decision guide", () => {
  it("is registered once in both registries", () => {
    const guide = guideByPath(PATH)!;
    const page = acquisitionPage(PATH)!;
    expect(guide).toBeTruthy();
    expect(page).toBeTruthy();
    expect(guide.pillar).toBe("learn");
    expect(guide.cluster).toBe("whole-duck");
    expect(guide.seoTitle.length).toBeLessThanOrEqual(65);
    expect(guide.description.length).toBeGreaterThan(80);
    expect(guide.description.length).toBeLessThanOrEqual(200);
    expect(page.updated <= "2026-08-17").toBe(true);
  });

  it("renders exactly one H1 through the shared shell", () => {
    // ArticleShell/PageHeader owns the single H1; the page must not add another.
    expect(code).toContain("<ArticleShell");
    expect(code).toContain("title={GUIDE.title}");
    expect(/<h1[\s>]/.test(code)).toBe(false);
  });

  it("declares a self-referencing canonical and article Open Graph", () => {
    expect(code).toContain("path: GUIDE.path");
    expect(code).toContain('ogType: "article"');
    expect(code).toContain("breadcrumbSchema");
    expect(code).toContain("articleSchema");
  });

  it("emits FAQ schema only for questions rendered on the page", () => {
    expect(code).toContain("ldScript(faqSchema(FAQ))");
    expect(code).toContain("<FaqList items={FAQ} />");
    for (const unsupported of ["recipeSchema", "productSchema", "aggregateRating", "reviewSchema"]) {
      expect(code.includes(unsupported)).toBe(false);
    }
  });

  it("puts a verdict and a side-by-side comparison above the detail", () => {
    const verdict = code.indexOf('id="verdict"');
    const compare = code.indexOf('id="compare"');
    const tradeoffs = code.indexOf('id="tradeoffs"');
    expect(verdict).toBeGreaterThan(-1);
    expect(compare).toBeGreaterThan(verdict);
    expect(tradeoffs).toBeGreaterThan(compare);
    for (const factor of [
      "Flavour",
      "Texture",
      "Serving yield",
      "Oven and logistics",
      "Cost and availability",
      "Leftovers",
      "Guest familiarity",
      "Who should choose it",
    ]) {
      expect(code.includes(`"${factor}"`), `comparison is missing ${factor}`).toBe(true);
    }
  });

  it("cites authoritative sources next to the safety claims", () => {
    expect(code).toContain("<SafetyNote>");
    expect(code).toContain('id="safety-sources"');
    expect(code).toContain("<SourceNotes ids={PAGE.sourceIds} />");
    for (const id of acquisitionPage(PATH)!.sourceIds) {
      expect(SOURCES[id], `unknown source ${id}`).toBeTruthy();
      expect(SOURCES[id]!.url.startsWith("https://")).toBe(true);
    }
    const ids = acquisitionPage(PATH)!.sourceIds;
    for (const required of [
      "usdaPoultryTemp",
      "usdaTurkeyRoasting",
      "usdaThawing",
      "usdaDangerZone",
      "usdaLeftovers",
    ]) {
      expect(ids, `missing source ${required}`).toContain(required);
    }
    // Current official FSIS URL for the turkey consumer guide.
    expect(SOURCES["usdaTurkeyRoasting"]!.url).toBe(
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/lets-talk-turkey-roasting",
    );
    // No obsolete FSIS paths anywhere in the registry.
    for (const source of Object.values(SOURCES)) {
      expect(source.url.includes("lets-talk-turkey-consumer-guide")).toBe(false);
    }
    // Only USDA-verified temperature figures appear on the page: the 165°F
    // minimum, the danger-zone/leftover figures, and the two oven settings that
    // USDA's own planning charts use (350°F for duckling, 325°F for turkey).
    const temps = code.match(/\d{2,3}°F/g) ?? [];
    expect(new Set(temps)).toEqual(new Set(["165°F", "140°F", "90°F", "40°F", "350°F", "325°F"]));
    // Verified USDA turkey figures, each attributed to USDA in the same sentence.
    expect(code).toContain("24 hours of refrigerator thawing for every 4 to 5 lb");
    expect(code).toContain("20-minute stand");
    expect(code).toContain("one hour if the room");
    expect(code).toContain("three to four days");
  });

  it("attributes the 1 lb per person allowance to USDA and to turkey only", () => {
    const mentions = code.match(/[^.]*1 lb[^.]*\./g) ?? [];
    expect(mentions.length).toBeGreaterThan(0);
    for (const sentence of mentions) {
      expect(sentence, `unattributed allowance: ${sentence}`).toMatch(/USDA/);
      expect(sentence).toMatch(/turkey/i);
      expect(sentence.toLowerCase().includes("duck")).toBe(false);
    }
  });

  it("publishes no edible-yield percentage or servings-per-bird figure for duck", () => {
    expect(code.includes("40%")).toBe(false);
    expect(/\d+\s*%/.test(code)).toBe(false);
    for (const banned of [
      "four servings per bird",
      "one bird for four",
      "feeds roughly four",
      "about four people",
      "four people per whole duck",
      "edible cooked yield",
      "of raw weight",
    ]) {
      expect(code.toLowerCase().includes(banned.toLowerCase()), `page states "${banned}"`).toBe(
        false,
      );
    }
    // Readers are sent to the calculator, framed as a planning estimate.
    expect(code).toContain("/tools/whole-duck-serving-calculator");
    expect(code.toLowerCase()).toContain("planning assumptions");
    expect(code.toLowerCase()).toContain("less edible meat");
  });

  it("invents no prices, testing, or popularity data", () => {
    const lower = code.toLowerCase();
    for (const banned of [
      "we tested",
      "our tests",
      "our testing",
      "most popular",
      "cheapest",
      "% of americans",
      "out of 5",
      "per pound",
    ]) {
      expect(lower.includes(banned), `page claims "${banned}"`).toBe(false);
    }
    expect(/\$\d/.test(code)).toBe(false);
    expect(/<a\s[^>]*href=["']https?:/i.test(code)).toBe(false);
  });

  it("links the useful funnel paths without over-commercializing", () => {
    const required = [
      "/cook/whole-roast-duck",
      "/tools/whole-duck-serving-calculator",
      "/buy/where-to-buy-duck-online",
      "/gear/best-thermometer-for-duck",
      "/learn/how-to-thaw-duck",
      "/learn/whole-duck-cooking-time",
    ];
    for (const target of required) {
      expect(code.includes(target), `page does not link ${target}`).toBe(true);
    }
    expect(code).toContain('interest="whole-duck"');
    // One newsletter unit and one commercial funnel band only.
    expect(code.match(/<NewsletterSignup/g)!.length).toBe(1);
    expect(code.match(/<DecisionNextSteps/g)!.length).toBe(1);
    expect(code.includes("CommercialLink")).toBe(false);
  });

  it("is discoverable from the sitemap, hub and neighbouring guides", () => {
    const sitemap = readFileSync("src/routes/sitemap[.]xml.ts", "utf8");
    expect(sitemap).toContain("GUIDES");
    expect(readFileSync("src/routes/learn.index.tsx", "utf8")).toContain(PATH);
    expect(guideByPath("/cook/whole-roast-duck")!.related).toContain(PATH);
    expect(guideByPath("/learn/whole-duck-cooking-time")!.related).toContain(PATH);
  });

  it("keeps the primary keyword out of stuffing territory", () => {
    const text = code.toLowerCase();
    const hits = (text.match(/thanksgiving/g) ?? []).length;
    expect(hits).toBeGreaterThan(2);
    expect(hits).toBeLessThan(20);
  });
  it("locks USDA's approximate roasting ranges and their attribution", () => {
    // Duck: FSIS "Duck and Goose from Farm to Table" planning chart.
    expect(code).toContain("30 to 35 min/lb");
    expect(code).toContain("350°F");
    expect(code).toContain("Whole duckling, 4 to 6 lb");
    // Turkey: FSIS "Let's Talk Turkey" unstuffed chart at an oven no lower than 325°F.
    expect(code).toContain("2¾ to 3 hours");
    expect(code).toContain("4½ to 5 hours");
    expect(code).toContain("Unstuffed turkey, 8 to 12 pounds");
    expect(code).toContain("Unstuffed turkey, 20 to 24 pounds");
    // Every range is labelled approximate and subordinate to the thermometer.
    expect(code.toLowerCase()).toContain("approximate");
    expect(NORM).toContain("planning numbers, not doneness rules");
    // Cited next to the claim, not only in the page footer.
    expect(code).toContain('id="timing-sources"');
    expect(code).toContain('ids={["usdaPoultryPrep", "usdaTurkeyRoasting"]}');
    expect(SOURCES["usdaPoultryPrep"]!.url).toBe(
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/duck-and-goose-farm-table",
    );
  });

  it("frames the two-stage roast as method, not a safety alternative", () => {
    expect(code).toContain('id="method"');
    expect(NORM).toContain("not a safety alternative");
    expect(code).toContain("/learn/whole-duck-cooking-time");
  });

  it("states USDA stuffing guidance without calling cavity stuffing fine", () => {
    const stuffing = FAQ_TEXT.find((t) => t.toLowerCase().includes("stuffing"))!;
    expect(stuffing).toBeTruthy();
    expect(stuffing).toMatch(/USDA recommends cooking stuffing separately/);
    expect(stuffing).toMatch(/165°F/);
    expect(stuffing.toLowerCase()).toContain("center of the stuffing");
    expect(acquisitionPage(PATH)!.sourceIds).toContain("usdaStuffing");
    expect(SOURCES["usdaStuffing"]!.url).toBe(
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/stuffing-and-food-safety",
    );
    for (const banned of ["stuffing is fine", "perfectly fine to stuff", "it is safe to stuff"]) {
      expect(NORM.toLowerCase().includes(banned), `page claims "${banned}"`).toBe(false);
    }
  });

  it("publishes no banned yield, serving or guest-count thresholds", () => {
    const text = (code + JSON.stringify(acquisitionPage(PATH))).toLowerCase();
    for (const banned of [
      "40% edible",
      "four servings per duck",
      "feeds 4-6",
      "feeds 4 to 6",
      "feeds four to six",
      "two to six",
      "10 or more guests",
      "ten or more guests",
      "three ducks",
      "12-person turkey",
      "pekin ducks weigh",
      "commercial pekin",
    ]) {
      expect(text.includes(banned), `claims "${banned}"`).toBe(false);
    }
    // No fixed guest-count verdict anywhere in the decision framing.
    expect(/feeds\s+\d/.test(text)).toBe(false);
    expect(/cooking for (two|three|four|five|six|\d)/.test(text)).toBe(false);
  });

  it("adds the expanded decision material and keeps the single-unit layout", () => {
    for (const id of ["timing", "method", "menu", "alternatives", "framework", "constraints"]) {
      expect(code.includes(`id="${id}"`), `missing section ${id}`).toBe(true);
    }
    expect(code.match(/<VerdictChoice/g)!.length).toBe(1);
    expect(code.match(/<NewsletterSignup/g)!.length).toBe(1);
    expect(code.match(/<DecisionNextSteps/g)!.length).toBe(1);
    // Duck is framed as a different centrepiece, not a turkey substitute.
    expect(NORM.toLowerCase()).toContain("does not do a turkey's job");
    // Pairing guidance is marked editorial rather than USDA fact.
    expect(code).toContain("editorial pairing guidance");
    // Portioned alternatives link verified recipe routes via the dynamic route.
    for (const slug of ["pan-seared-duck-breast", "duck-leg-confit", "roasted-whole-duck"]) {
      expect(code.includes(`slug: "${slug}"`), `missing recipe link ${slug}`).toBe(true);
      expect(recipeBySlug(slug), `unknown recipe ${slug}`).toBeTruthy();
    }
    // Unique analytics placements on the one conversion unit.
    const placements = code.match(/placement: "([^"]+)"/g) ?? [];
    expect(new Set(placements).size).toBe(placements.length);
  });

  it("keeps FAQ schema synchronized with the rendered FAQ list", () => {
    // FAQ is a single source array rendered once and serialized once.
    expect(code.match(/const FAQ = \[/g)!.length).toBe(1);
    expect(code.match(/faqSchema\(FAQ\)/g)!.length).toBe(1);
    expect(code.match(/<FaqList items=\{FAQ\} \/>/g)!.length).toBe(1);
    expect(FAQ_TEXT.length).toBeGreaterThanOrEqual(9);
  });
});
