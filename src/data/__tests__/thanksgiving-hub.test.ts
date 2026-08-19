/**
 * Thanksgiving duck dinner planning hub.
 *
 * Proves the hub is registered once, renders the modules the cluster tests
 * expect, hands off to each intended destination exactly once with a unique
 * tracked placement, carries no outbound merchant link, and never inherits the
 * duck-versus-turkey comparison artwork.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  THANKSGIVING_HUB_PATH,
  THANKSGIVING_PLAN,
  thanksgivingHubPlacementIds,
} from "@/data/thanksgiving-hub";
import { allConversionPlacementIds } from "@/data/conversion-paths";
import { guideByPath } from "@/data/guides";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { sketchForPath, sketchRotationForPath, SKETCH } from "@/lib/sketch-art";
import { sitemapPaths } from "@/lib/sitemap";

const ROUTE = "src/routes/learn.thanksgiving-duck-dinner.tsx";
const code = readFileSync(ROUTE, "utf8");

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
    const compare = readFileSync("src/routes/learn.duck-vs-turkey-thanksgiving.tsx", "utf8");
    expect(compare).toContain(THANKSGIVING_HUB_PATH);
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
      "/cook/whole-roast-duck",
      "/learn/how-to-carve-a-duck",
      "/gear/best-roasting-pan-for-duck",
      "/gear/best-thermometer-for-duck",
      "/recipes/duck-fat-roasted-potatoes",
    ]) {
      expect(destinations).toContain(expected);
    }
  });

  it("keeps every hand-off internal and measured", () => {
    const ids = thanksgivingHubPlacementIds();
    expect(new Set(ids).size).toBe(ids.length);
    for (const step of THANKSGIVING_PLAN) {
      expect(step.to.startsWith("/")).toBe(true);
      expect(step.to).not.toMatch(/https?:|\?|#/);
      expect(step.placement).toMatch(/^[a-z0-9_]+$/);
      expect(step.placement.length).toBeGreaterThan(8);
      expect(step.why.length).toBeGreaterThan(20);
    }
    const all = allConversionPlacementIds();
    for (const id of ids) expect(all).toContain(id);
    expect(new Set(all).size).toBe(all.length);
  });

  it("makes no price, availability or testing claim", () => {
    const prose = JSON.stringify(THANKSGIVING_PLAN).toLowerCase();
    for (const banned of ["we tested", "hands-on", "$", "in stock", "discount", "cheapest"]) {
      expect(prose.includes(banned), banned).toBe(false);
    }
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
      "items={PAGE.funnel}",
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

  it("carries no outbound merchant link or tracking parameter", () => {
    expect(/href=["']https?:/i.test(code)).toBe(false);
    for (const banned of ["amazon.com", "grasslandbeefllc", "tag=deliciousduck-20", "utm_"]) {
      expect(code.includes(banned), banned).toBe(false);
    }
  });

  it("never inherits the duck-versus-turkey comparison artwork", () => {
    expect(sketchForPath(THANKSGIVING_HUB_PATH)).toBe(SKETCH.ovenRoast);
    const rotation = sketchRotationForPath(THANKSGIVING_HUB_PATH);
    expect(rotation).not.toContain(SKETCH.duckVsTurkey);
    expect(new Set(rotation).size).toBe(rotation.length);
  });
});
