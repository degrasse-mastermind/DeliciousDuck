import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GUIDES, guideByPath } from "@/data/guides";
import { decisionGuide } from "@/data/decision-guides";
import {
  COMMERCIAL_PLACEMENTS,
  commercialLinkById,
  relForLink,
} from "@/data/commercial-links";
import { AMAZON_TAG, AMAZON_CATEGORIES, isTaggedAmazonUrl } from "@/data/amazon";
import { CONVERSION_PATHS, buildConversionPathClickEvent } from "@/data/conversion-paths";
import { buildCommercialClickEvent } from "@/lib/commercial-events";
import { trackingToken, withAffiliateTracking } from "@/lib/affiliate-tracking";
import { RECIPE_CONTENT } from "@/data/recipe-content";
import { US_WELLNESS_DUCK_FAT_URL } from "@/data/affiliates";
import { sitemapPaths } from "@/lib/sitemap";

const PATH = "/gear/best-dutch-oven-for-duck-confit";
const ROUTE_FILE = "src/routes/gear.best-dutch-oven-for-duck-confit.tsx";
const routeSource = readFileSync(ROUTE_FILE, "utf8");
const PLACEMENT = "confit_vessel_options";
const VESSEL_IDS = [
  "amazon-enameled-dutch-oven",
  "amazon-stainless-dutch-oven",
  "amazon-covered-ceramic-casserole",
];

describe("confit vessel guide — route, canonical, sitemap", () => {
  it("registers the guide with search-aligned metadata", () => {
    const guide = guideByPath(PATH)!;
    expect(guide).toBeTruthy();
    expect(guide.pillar).toBe("gear");
    expect(guide.kind).toBe("money");
    expect(guide.seoTitle).toContain("Duck Confit");
    expect(guide.description.length).toBeLessThan(160);
    expect(GUIDES.filter((g) => g.path === PATH)).toHaveLength(1);
  });

  it("declares the matching file route and self-canonical head", () => {
    expect(routeSource).toContain(`createFileRoute("${PATH}")`);
    expect(routeSource).toContain("path: GUIDE.path");
    expect(routeSource).toContain("pageMeta(");
  });

  it("is emitted in the sitemap through the guides registry", () => {
    expect(sitemapPaths()).toContain(PATH);
    expect(GUIDES.some((g) => g.path === PATH)).toBe(true);
  });

  it("appears on the gear index through the pillar filter", () => {
    expect(guideByPath(PATH)!.pillar).toBe("gear");
    const gearIndex = readFileSync("src/routes/gear.index.tsx", "utf8");
    expect(gearIndex).toContain('guidesByPillar("gear")');
    expect(gearIndex).toContain('sourcePath="/gear"');
  });

  it("emits breadcrumb and FAQ structured data", () => {
    expect(routeSource).toContain("breadcrumbSchema");
    expect(routeSource).toContain("faqSchema(FAQ)");
  });
});

describe("confit vessel guide — editorial shape", () => {
  const dg = decisionGuide(PATH)!;

  it("has Quick Picks led by using what you already own", () => {
    expect(dg.quickPicks.length).toBeGreaterThanOrEqual(4);
    expect(dg.quickPicks[0]!.choice).toMatch(/use what you own/i);
    expect(routeSource).toMatch(/Use what you own/);
  });

  it("compares category-level vessels only, in the matrix", () => {
    expect(dg.matrix.options).toEqual([
      "Enameled cast iron",
      "Stainless / deep sauté",
      "Covered ceramic",
      "Oversized stockpot",
    ]);
    for (const row of dg.matrix.rows) {
      expect(row.values).toHaveLength(dg.matrix.options.length);
    }
    const criteria = dg.matrix.rows.map((r) => r.criterion.toLowerCase()).join("|");
    for (const needed of ["heat", "fit", "depth", "weight", "stovetop", "cleaning", "best use"]) {
      expect(criteria, needed).toContain(needed);
    }
  });

  it("renders the measure-before-you-buy checklist and vessel-effect section", () => {
    expect(routeSource).toContain('id="measure"');
    expect(routeSource).toContain('id="how-vessel-changes-cook"');
    expect(routeSource).toContain('id="mistakes"');
    expect(routeSource).toMatch(/single snug layer|one snug layer/i);
  });

  it("teaches fit rather than a universal quart size", () => {
    const surfaces = `${routeSource}\n${JSON.stringify(dg)}`;
    expect(surfaces).not.toMatch(/\b\d+(\.\d+)?[- ]?(quart|qt|litre|liter|l)\b/i);
    expect(surfaces).not.toMatch(/\$\d/);
    expect(surfaces).not.toMatch(/\b(we tested|we cooked|lab test|star rating|reviews?\b.*\d)/i);
  });

  it("keeps safety facts sourced and citations quiet", () => {
    expect(routeSource).toContain("SourceMark");
    expect(routeSource).toContain('SourceNotes ids={["usdaPoultryTemp"');
    expect(routeSource).toContain("165°F (74°C)");
    expect(routeSource).not.toMatch(/USDA (recommends|guidance|says)/i);
  });

  it("shows exactly one commission disclosure and no duplicate commission copy", () => {
    expect(routeSource.match(/<DisclosureBanner/g) ?? []).toHaveLength(1);
    expect(routeSource).not.toMatch(/commission/i);
  });

  it("carries no banned negative-methodology or byline phrases", () => {
    const banned = [
      /\bBy\s+DeliciousDuck/i,
      /not (yet )?tested/i,
      /we (have )?not (yet )?/i,
      /haven't (tested|done)/i,
      /working draft/i,
      /reviewed by/i,
      /no hands-on/i,
    ];
    for (const pattern of banned) {
      expect(routeSource.match(pattern)?.[0] ?? null, String(pattern)).toBeNull();
    }
    expect(routeSource).toContain("EditorialByline");
  });
});

describe("confit vessel guide — commerce", () => {
  it("adds three central Amazon category destinations, never raw page URLs", () => {
    for (const id of VESSEL_IDS) {
      expect(Object.keys(AMAZON_CATEGORIES)).toContain(id);
      const link = commercialLinkById(id)!;
      expect(link).toBeTruthy();
      expect(isTaggedAmazonUrl(link.url)).toBe(true);
      expect(new URL(link.url).pathname).toBe("/s");
      expect(link.category).toBe("confit_vessel");
      expect(link.ctaLabel).toMatch(/^Shop .+ on Amazon$/);
      expect(relForLink(link)).toBe("sponsored nofollow noopener");
    }
    expect(routeSource).not.toMatch(/https?:\/\/(www\.)?amazon\.com/);
    expect(routeSource).not.toMatch(/https?:\/\//);
  });

  it("registers the stable placement centrally", () => {
    const placement = COMMERCIAL_PLACEMENTS.find(
      (p) => p.path === PATH && p.placement === PLACEMENT,
    )!;
    expect(placement).toBeTruthy();
    expect(placement.linkIds).toEqual(VESSEL_IDS);
    expect(routeSource).toContain(`placement="${PLACEMENT}"`);
  });

  it("gives each vessel link a unique placement-specific ascsubtag with the tag intact", () => {
    const tags = new Set<string>();
    for (const id of VESSEL_IDS) {
      const link = commercialLinkById(id)!;
      const out = withAffiliateTracking(link.url, { placement: PLACEMENT, sourcePath: PATH });
      const url = new URL(out);
      expect(url.searchParams.getAll("tag")).toEqual([AMAZON_TAG]);
      expect(url.searchParams.get("ascsubtag")).toBe(trackingToken(PATH, PLACEMENT));
      tags.add(`${url.searchParams.get("k")}|${url.searchParams.get("ascsubtag")}`);
    }
    expect(tags.size).toBe(VESSEL_IDS.length);
    expect(trackingToken(PATH, PLACEMENT)).not.toBe(
      trackingToken("/gear/best-thermometer-for-duck", "thermometer_options"),
    );
  });

  it("builds an affiliate_click payload for each vessel link", () => {
    for (const id of VESSEL_IDS) {
      const event = buildCommercialClickEvent({
        link: commercialLinkById(id)!,
        placement: PLACEMENT,
        sourcePath: PATH,
      });
      expect(event.name).toBe("affiliate_click");
      expect(event.params.placement).toBe(PLACEMENT);
      expect(event.params.commercial_link_id).toBe(id);
      expect(JSON.stringify(event.params)).not.toContain("ascsubtag");
    }
  });

  it("leaves existing US Wellness and Amazon tracking untouched", () => {
    const uw = new URL(
      withAffiliateTracking(US_WELLNESS_DUCK_FAT_URL, {
        placement: "duck_fat_sources",
        sourcePath: "/buy/duck-fat-buying-guide",
      }),
    );
    const token = trackingToken("/buy/duck-fat-buying-guide", "duck_fat_sources");
    expect(uw.searchParams.get("subId1")).toBe(token);
    expect(uw.searchParams.get("sharedid")).toBe(token);
    expect(AMAZON_TAG).toBe("deliciousduck-20");
    const thermometer = COMMERCIAL_PLACEMENTS.find(
      (p) => p.placement === "thermometer_options",
    )!;
    expect(thermometer.linkIds).toEqual([
      "amazon-instant-read-thermometer",
      "amazon-leave-in-probe-thermometer",
    ]);
  });
});

describe("confit vessel guide — internal funnel", () => {
  const feeders = [
    ["/cook/duck-leg-confit", "confit_to_vessel_guide"],
    ["/buy/duck-fat-buying-guide", "duck_fat_guide_to_confit_vessel_guide"],
    ["/learn/how-to-render-duck-fat", "render_fat_to_confit_vessel_guide"],
    ["/gear", "gear_index_to_confit_vessel_guide"],
  ] as const;

  it("feeds the guide from every mapped source with a stable placement", () => {
    for (const [sourcePath, placement] of feeders) {
      const path = CONVERSION_PATHS.find((p) => p.placement === placement)!;
      expect(path, placement).toBeTruthy();
      expect(path.sourcePath).toBe(sourcePath);
      expect(path.destination).toBe(PATH);
      const event = buildConversionPathClickEvent({
        destination: path.destination,
        intent: path.intent,
        placement: path.placement,
        sourcePath: path.sourcePath,
      });
      expect(event.name).toBe("internal_conversion_click");
      expect(event.params.destination_path).toBe(PATH);
      expect(event.params.placement).toBe(placement);
    }
  });

  it("feeds the guide from the confit recipe equipment pathway", () => {
    const confit = RECIPE_CONTENT["duck-leg-confit"]!;
    const pot = confit.equipment.find((e) => e.to === PATH)!;
    expect(pot).toBeTruthy();
    expect(pot.linkLabel).toBeTruthy();
  });

  it("keeps feeder pages free of merchant links and returns from the guide", () => {
    for (const file of [
      "src/routes/cook.duck-leg-confit.tsx",
      "src/routes/learn.how-to-render-duck-fat.tsx",
      "src/routes/gear.index.tsx",
      "src/routes/recipes.$slug.tsx",
    ]) {
      expect(readFileSync(file, "utf8")).not.toMatch(/amazon\.com/i);
    }
    const back = CONVERSION_PATHS.filter((p) => p.sourcePath === PATH).map((p) => p.destination);
    expect(back).toContain("/cook/duck-leg-confit");
    expect(back).toContain("/buy/duck-fat-buying-guide");
  });

  it("keeps every placement id unique", () => {
    const ids = CONVERSION_PATHS.map((p) => p.placement);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
