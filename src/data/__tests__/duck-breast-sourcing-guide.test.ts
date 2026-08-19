/**
 * Regression cover for the duck-breast buying guide at
 * /buy/where-to-buy-duck-breast-online.
 *
 * Guards the things this page is easy to break: unique metadata and schema, an
 * unfabricated seller comparison, its own illustration rather than an inherited
 * one, exactly one link per commercial destination, and the reciprocal internal
 * paths that keep it separate from the general sourcing guide.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BREAST_SELLERS, BREAST_SELLER_FACTORS, DUCK_MERCHANTS } from "@/data/comparisons";
import { GUIDES, guideByPath } from "@/data/guides";
import { decisionGuide } from "@/data/decision-guides";
import {
  COMMERCIAL_PLACEMENTS,
  commercialLinkById,
  isAffiliateActive,
  relationshipLabel,
} from "@/data/commercial-links";
import { CONVERSION_PATHS, conversionPathsForSource } from "@/data/conversion-paths";
import { SKETCH, sketchForPath, sketchRotationForPath } from "@/lib/sketch-art";
import { sitemapPaths } from "@/lib/sitemap";

const PATH = "/buy/where-to-buy-duck-breast-online";
const GENERAL = "/buy/where-to-buy-duck-online";
const ROUTE = "src/routes/buy.where-to-buy-duck-breast-online.tsx";

const src = readFileSync(ROUTE, "utf8");

describe("registration and metadata", () => {
  it("is registered as a buy-pillar money guide", () => {
    const guide = guideByPath(PATH)!;
    expect(guide).toBeDefined();
    expect(guide.pillar).toBe("buy");
    expect(guide.kind).toBe("money");
  });

  it("keeps its title and description distinct from the general sourcing guide", () => {
    const guide = guideByPath(PATH)!;
    const general = guideByPath(GENERAL)!;
    expect(guide.seoTitle).not.toBe(general.seoTitle);
    expect(guide.description).not.toBe(general.description);
    expect(guide.seoTitle.length).toBeLessThanOrEqual(75);
    expect(guide.description.length).toBeLessThanOrEqual(165);
    expect(guide.seoTitle.toLowerCase()).toContain("duck breast");
  });

  it("has a unique title across the whole guide registry", () => {
    const titles = GUIDES.map((g) => g.seoTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("is in the sitemap exactly once", () => {
    const hits = sitemapPaths().filter((p) => p === PATH);
    expect(hits).toHaveLength(1);
  });

  it("emits canonical metadata plus breadcrumb, article and FAQ schema", () => {
    expect(src).toContain("pageMeta(");
    expect(src).toContain("breadcrumbSchema(");
    expect(src).toContain("articleSchema(");
    expect(src).toContain("faqSchema(FAQ)");
    expect(src).toContain('path: GUIDE.path');
  });

  it("renders exactly one H1 through the article shell", () => {
    expect(src.match(/<ArticleShell/g)).toHaveLength(1);
    expect(src).not.toContain("<h1");
  });
});

describe("decision guide data", () => {
  const dg = decisionGuide(PATH)!;

  it("exists with quick picks, best-for rows and a matrix", () => {
    expect(dg).toBeDefined();
    expect(dg.quickPicks.length).toBeGreaterThanOrEqual(5);
    expect(dg.bestFor.length).toBeGreaterThanOrEqual(4);
    expect(dg.matrix.options.length).toBe(4);
    expect(dg.matrix.rows.length).toBeGreaterThanOrEqual(4);
    for (const row of dg.matrix.rows) {
      expect(row.values).toHaveLength(dg.matrix.options.length);
    }
  });

  it("states an evidence basis without claiming hands-on testing", () => {
    const prose = [dg.evaluationStandard, dg.evidenceBasis, ...dg.methodology].join(" ");
    expect(prose.length).toBeGreaterThan(0);
    expect(prose).not.toMatch(/we tested|our testing|hands-on|foolproof|we cooked/i);
  });

  it("uses the shared byline convention, never a personal 'By' line", () => {
    expect(src).toContain("<EditorialByline");
    expect(src).not.toMatch(/\bBy [A-Z][a-z]+/);
  });
});

describe("seller comparison", () => {
  it("covers the same four duck-meat sellers, read for breast", () => {
    expect(BREAST_SELLERS).toHaveLength(4);
    const merchants = BREAST_SELLERS.map((r) => r.merchantId);
    expect(new Set(merchants)).toEqual(new Set(DUCK_MERCHANTS.map((r) => r.merchantId)));
    expect(new Set(BREAST_SELLERS.map((r) => r.id)).size).toBe(4);
  });

  it("fills every declared comparison factor for every seller", () => {
    for (const row of BREAST_SELLERS) {
      for (const factor of BREAST_SELLER_FACTORS) {
        expect(row.decisionFactors[factor.key], `${row.id}.${factor.key}`).toBeTruthy();
      }
      expect(row.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.pros.length).toBeGreaterThan(0);
      expect(row.tradeoffs.length).toBeGreaterThan(0);
    }
  });

  it("never fabricates prices, weights, stock, ratings or delivery promises", () => {
    const prose = BREAST_SELLERS.flatMap((r) => [
      r.bestFor,
      r.note ?? "",
      ...r.pros,
      ...r.tradeoffs,
      ...Object.values(r.decisionFactors),
    ]).join(" ");
    expect(prose).not.toMatch(/\$\d/);
    expect(prose).not.toMatch(/\b\d+(\.\d+)?\s?(lb|lbs|oz|pounds|ounces|g|kg)\b/i);
    expect(prose).not.toMatch(/\b\d+(\.\d+)?\s?(stars?|\/5)\b/i);
    expect(prose).not.toMatch(/in stock|always available|guaranteed|arrives in \d/i);
    expect(prose).not.toMatch(/we tested|hands-on|best duck breast on the market/i);
  });

  it("shows the same disclosure and comparison modules the site uses elsewhere", () => {
    expect(src).toContain("<DisclosureBanner");
    expect(src).toContain("<QuickDecision");
    expect(src).toContain("<ComparisonTable");
    expect(src).toContain("BREAST_SELLERS");
    expect(src).not.toContain("DUCK_MERCHANTS");
  });

  it("does not repeat the general guide's seller-card block", () => {
    expect(src).not.toContain("<ComparisonCard");
    expect(src).not.toContain("<DuckBreastJourney");
  });
});

describe("commercial links and tracking", () => {
  it("registers one breast placement pointing at duck-meat links only", () => {
    const placement = COMMERCIAL_PLACEMENTS.find((p) => p.path === PATH)!;
    expect(placement).toBeDefined();
    expect(placement.placement).toBe("buy_duck_breast_primary_options");
    expect(src).toContain(placement.placement);
    for (const id of placement.linkIds) {
      const link = commercialLinkById(id)!;
      expect(link, id).toBeDefined();
      expect(link.category, id).toBe("duck_source");
    }
  });

  it("routes every outbound link through the tracked commercial components", () => {
    expect(src).toContain("<CommercialCallout");
    expect(src).not.toMatch(/<a\s[^>]*href="https?:/);
  });

  it("offers exactly one tracked CTA per seller, in one module", () => {
    expect(src.match(/<CommercialCallout/g)).toHaveLength(1);
    expect(src).not.toContain("<CommercialLink");
    const ids = src
      .slice(src.indexOf("<CommercialCallout"), src.indexOf("<MethodologyPanel"))
      .match(/"[a-z-]+-duck"/g)!;
    // Four sellers, each named exactly once inside the single decision surface.
    expect(new Set(ids).size).toBe(4);
    expect(ids.filter((id) => id.includes("-duck"))).toHaveLength(4);
  });

  it("labels each seller relationship from the registry, never claiming an unpaid commission", () => {
    expect(src).toContain("showRelationship");
    for (const id of ["culver-duck", "tastyduck-duck", "fossil-farms-duck", "wild-fork-duck"]) {
      const link = commercialLinkById(id)!;
      const label = relationshipLabel(link);
      expect(label, id).toBe(
        isAffiliateActive(link)
          ? "Affiliate link · we may earn a commission"
          : "Editorial link · no paid relationship",
      );
    }
  });

  it("links the general sourcing guide once, as a contextual aside", () => {
    expect(src.split(`"${GENERAL}"`).length - 1).toBe(1);
  });
});

describe("internal conversion paths", () => {
  it("hands off once to each intended cook/gear destination", () => {
    const paths = conversionPathsForSource(PATH);
    expect(paths).toHaveLength(5);
    const destinations = paths.map((p) => p.destination);
    expect(new Set(destinations).size).toBe(5);
    expect(destinations.sort()).toEqual(
      [
        "/cook/how-to-cook-duck-breast",
        "/gear/best-pan-for-duck-breast",
        "/gear/best-thermometer-for-duck",
        "/learn/duck-breast-temperature-doneness",
        "/recipes/pan-seared-duck-breast",
      ].sort(),
    );
    for (const p of paths) {
      expect(p.direction).toBe("commercial_to_editorial");
    }
    expect(src.match(/<ConversionPaths/g)).toHaveLength(1);
    expect(src).toContain(`sourcePath="${PATH}"`);
  });

  it("does not repeat the same destinations as related-guide cards", () => {
    expect(src).not.toContain("<RelatedGuides");
  });

  it("is fed by the breast cornerstones", () => {
    const feeders = CONVERSION_PATHS.filter((p) => p.destination === PATH).map((p) => p.sourcePath);
    expect(feeders).toContain("/cook/how-to-cook-duck-breast");
    expect(feeders).toContain("/learn/duck-breast-temperature-doneness");
  });

  it("is reachable from the pan-seared recipe's sourcing module", () => {
    const content = readFileSync("src/data/recipe-content.ts", "utf8");
    const recipe = content.slice(
      content.indexOf('"pan-seared-duck-breast": {'),
      content.indexOf('"duck-leg-confit": {'),
    );
    expect(recipe).toContain(PATH);
    expect(recipe).not.toContain(`to: "${GENERAL}"`);
  });

  it("keeps a two-way link with the general sourcing guide so neither cannibalises the other", () => {
    const general = readFileSync(`src/routes/buy.where-to-buy-duck-online.tsx`, "utf8");
    expect(general).toContain(PATH);
    expect(src).toContain(GENERAL);
    expect(guideByPath(GENERAL)!.related).toContain(PATH);
  });

  it("has unique placement ids across the whole registry", () => {
    const ids = CONVERSION_PATHS.map((p) => p.placement);
    expect(new Set(ids).size).toBe(ids.length);
  });
});


describe("illustration", () => {
  it("binds its own duck-breast package drawing, not an inherited one", () => {
    const art = sketchForPath(PATH)!;
    expect(art).toBeDefined();
    expect(art.src).toBe(SKETCH.duckBreastPackages.src);
    expect(art.alt.toLowerCase()).toContain("duck breast");
    expect(art.transparent).toBe(true);
  });

  it("shows the package hero and no repeated companion drawings", () => {
    const rotation = sketchRotationForPath(PATH).map((a) => a.src);
    expect(rotation).toEqual([SKETCH.duckBreastPackages.src]);
    // Zero or one skillet illustration — here, zero.
    expect(rotation.filter((s) => s === SKETCH.duckBreastPan.src)).toHaveLength(0);
    expect(rotation).not.toContain(SKETCH.duckFat.src);
  });

  it("uses a stable project asset for the hero and its social metadata", () => {
    expect(src).toContain('from "@/assets/sketch/duck-breast-packages.png"');
    expect(src).toContain("image: SOCIAL_IMAGE");
    expect(src).not.toMatch(/lovable\.app|id-preview/);
  });
});

describe("copy safety", () => {
  it("keeps the safety facts and avoids institutional throat-clearing", () => {
    expect(src).toMatch(/40°F/);
    expect(src).toMatch(/refrigerator/i);
    expect(src).not.toMatch(/USDA (recommends|guidance|says)|according to USDA|per USDA/i);
  });

  it("makes no testing, superlative or guarantee claims", () => {
    expect(src).not.toMatch(/we tested|our testing|hands-on testing|foolproof|guaranteed/i);
  });
});
