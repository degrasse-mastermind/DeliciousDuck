import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { SOURCES } from "@/data/sources";

const PATH = "/learn/duck-vs-turkey-thanksgiving";
const FILE = "src/routes/learn.duck-vs-turkey-thanksgiving.tsx";
const code = readFileSync(FILE, "utf8");

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
    expect(acquisitionPage(PATH)!.sourceIds).toContain("usdaTurkeyRoasting");
    // Every temperature claim on the page is the USDA poultry minimum.
    const temps = code.match(/\d{2,3}°F/g) ?? [];
    expect(new Set(temps)).toEqual(new Set(["165°F", "140°F", "40°F"]));
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
});
