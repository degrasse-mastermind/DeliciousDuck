import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { DECISION_GUIDES, decisionGuide } from "../decision-guides";
import { GUIDES, guideByPath } from "../guides";
import { COMMERCIAL_LINKS, commercialLinkById } from "../commercial-links";
import { TOOLS } from "../tools";
import { INGREDIENTS } from "../ingredients";
import { RECIPES } from "../recipes";

const ROUTES_DIR = path.join(process.cwd(), "src", "routes");

function readRoute(routePath: string): string {
  const file = `${routePath.replace(/^\//, "").replace(/\//g, ".")}.tsx`;
  return fs.readFileSync(path.join(ROUTES_DIR, file), "utf8");
}

/** Every publicly linkable path the site knows about. */
const KNOWN_PATHS = new Set<string>([
  "/",
  "/cook",
  "/learn",
  "/buy",
  "/gear",
  "/ingredients",
  "/tools",
  "/recipes",
  "/search",
  "/about",
  "/affiliate-disclosure",
  "/editorial-standards",
  "/privacy",
  "/terms",
  ...GUIDES.map((g) => g.path),
  ...INGREDIENTS.map((i) => i.path),
  ...TOOLS.filter((t) => t.to).map((t) => t.to!),
  ...RECIPES.map((r) => `/recipes/${r.slug}`),
]);

const DECISION_PAGES = DECISION_GUIDES.map((g) => g.path);

describe("decision-guide registry integrity", () => {
  it("has a unique, published route for every entry", () => {
    const seen = new Set<string>();
    for (const g of DECISION_GUIDES) {
      expect(seen.has(g.path), `duplicate decision guide: ${g.path}`).toBe(false);
      seen.add(g.path);
      expect(guideByPath(g.path), `no GUIDES entry for ${g.path}`).toBeTruthy();
    }
  });

  it("declares a methodology, an evaluation standard, and a not-tested statement", () => {
    for (const g of DECISION_GUIDES) {
      expect(g.evaluationStandard.length).toBeGreaterThan(40);
      expect(g.methodology.length).toBeGreaterThanOrEqual(2);
      expect(g.notTested.length).toBeGreaterThan(40);
      expect(g.notTested.toLowerCase()).toMatch(/not (hands-on tested|placed|bought|tested)|have not/);
      expect(g.byline.length).toBeGreaterThan(0);
      expect(g.reviewedBy.length).toBeGreaterThan(0);
    }
  });

  it("carries a valid ISO updated date", () => {
    for (const g of DECISION_GUIDES) {
      expect(g.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(`${g.updated}T00:00:00Z`).getTime())).toBe(false);
    }
  });

  it("has a rectangular, accessible matrix with at least three criteria", () => {
    for (const g of DECISION_GUIDES) {
      expect(g.matrix.options.length).toBeGreaterThanOrEqual(3);
      expect(g.matrix.rows.length).toBeGreaterThanOrEqual(3);
      expect(g.matrix.caption.length).toBeGreaterThan(10);
      expect(g.matrix.criterionLabel.length).toBeGreaterThan(2);
      expect(new Set(g.matrix.options).size).toBe(g.matrix.options.length);
      for (const row of g.matrix.rows) {
        expect(row.values.length, `${g.path} / ${row.criterion}`).toBe(g.matrix.options.length);
        for (const v of row.values) expect(v.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("gives quick picks and unranked best-for guidance", () => {
    for (const g of DECISION_GUIDES) {
      expect(g.quickPicks.length).toBeGreaterThanOrEqual(3);
      expect(g.bestFor.length).toBeGreaterThanOrEqual(3);
      for (const b of g.bestFor) {
        expect(b.forWhom.length).toBeGreaterThan(10);
        expect(b.notFor.length).toBeGreaterThan(5);
      }
    }
  });

  it("contains no prices, ratings, rankings, or commission claims", () => {
    const raw = fs.readFileSync(path.join(process.cwd(), "src/data/decision-guides.ts"), "utf8");
    expect(raw).not.toMatch(/\$\d/);
    expect(raw).not.toMatch(/\b\d(\.\d)?\s*(\/\s*5|stars?|out of 5)\b/i);
    expect(raw).not.toMatch(/\b(commission rate|discount code|coupon|% off|best overall|our #1|rank(ed)? #)\b/i);
    expect(raw).not.toMatch(/\bwe tested\b|\bin our tests\b|\bhands-on test(ed|ing) (showed|found)\b/i);
  });

  it("never hardcodes a merchant URL", () => {
    const raw = fs.readFileSync(path.join(process.cwd(), "src/data/decision-guides.ts"), "utf8");
    expect(raw).not.toMatch(/https?:\/\//);
  });
});

describe("decision-guide pages", () => {
  it("renders the full framework on every decision page", () => {
    for (const p of DECISION_PAGES) {
      const src = readRoute(p);
      expect(src, `${p} byline`).toContain("<EditorialByline guide={DG} />");
      expect(src, `${p} methodology`).toContain("<MethodologyPanel guide={DG} />");
      expect(src, `${p} quick decision`).toContain("<QuickDecision guide={DG} />");
      expect(src, `${p} matrix`).toContain("<DecisionMatrixTable guide={DG} />");
      expect(src, `${p} best-for`).toContain("<BestForGrid guide={DG} />");
      expect(src, `${p} disclosure`).toContain("<DisclosureBanner />");
      expect(src, `${p} faq`).toContain("<FaqList items={FAQ} />");
      expect(src, `${p} framework binding`).toContain(`decisionGuide("${p}")`);
    }
  });

  it("declares canonical/OG metadata and breadcrumb + FAQ schema", () => {
    for (const p of DECISION_PAGES) {
      const src = readRoute(p);
      expect(src, `${p} pageMeta`).toContain("pageMeta({");
      expect(src, `${p} ogType`).toContain('ogType: "article"');
      expect(src, `${p} breadcrumbs`).toContain("breadcrumbSchema([");
      expect(src, `${p} faq schema`).toContain("faqSchema(FAQ)");
      expect(src, `${p} noindex`).not.toContain("noindex");
    }
  });

  it("uses no raw outbound merchant anchors — only registry-backed components", () => {
    const registryHosts = COMMERCIAL_LINKS.map((l) => new URL(l.url).hostname.replace(/^www\./, ""));
    for (const p of DECISION_PAGES) {
      const src = readRoute(p);
      const external = src.match(/href=["']https?:\/\/[^"']+/g) ?? [];
      expect(external, `${p} has raw external anchors: ${external.join(", ")}`).toEqual([]);
      for (const host of registryHosts) {
        expect(src, `${p} hardcodes ${host}`).not.toContain(host);
      }
    }
  });

  it("only references commercial links that exist in the registry", () => {
    for (const p of DECISION_PAGES) {
      const src = readRoute(p);
      const blocks = src.match(/linkIds=\{\[([^\]]*)\]\}/g) ?? [];
      for (const block of blocks) {
        for (const id of block.match(/"([a-z0-9-]+)"/g) ?? []) {
          const clean = id.replace(/"/g, "");
          expect(commercialLinkById(clean), `${p} references unknown link ${clean}`).toBeTruthy();
        }
      }
    }
  });

  it("keeps every internal link on a real route", () => {
    for (const p of DECISION_PAGES) {
      const src = readRoute(p);
      for (const m of src.matchAll(/to="(\/[^"]*)"/g)) {
        expect(KNOWN_PATHS.has(m[1]), `${p} links to unknown route ${m[1]}`).toBe(true);
      }
    }
  });
});

describe("no fake affiliate state on commercial pages", () => {
  it("keeps ThermoWorks at its registry-derived relationship", () => {
    const link = commercialLinkById("thermoworks-thermometer");
    expect(link).toBeTruthy();
    expect(link!.relationship).toBe("affiliate_pending");
    expect(link!.disclosureLabel).toBe("Direct link — we earn nothing");
  });

  it("has no affiliate_active entry without a real tracking destination", () => {
    for (const link of COMMERCIAL_LINKS) {
      if (link.relationship === "affiliate_active") {
        expect(link.url).toMatch(/^https:\/\//);
      }
    }
  });

  it("never claims commissions in decision-page prose while every program is pending", () => {
    const anyActive = COMMERCIAL_LINKS.some((l) => l.relationship === "affiliate_active");
    if (anyActive) return;
    for (const p of DECISION_PAGES) {
      const src = readRoute(p);
      expect(src, `${p} claims commission`).not.toMatch(/we earn a commission|we may earn a commission/i);
    }
  });
});

describe("commercial funnel internal linking", () => {
  const FUNNEL: Record<string, string[]> = {
    "/cook/how-to-cook-duck-breast": [
      "/gear/best-pan-for-duck-breast",
      "/gear/best-thermometer-for-duck",
      "/buy/where-to-buy-duck-online",
    ],
    "/learn/why-duck-skin-isnt-crispy": [
      "/gear/best-pan-for-duck-breast",
      "/gear/best-thermometer-for-duck",
    ],
    "/learn/duck-breast-temperature-doneness": [
      "/gear/best-thermometer-for-duck",
      "/gear/best-pan-for-duck-breast",
    ],
    "/cook/whole-roast-duck": ["/gear/best-thermometer-for-duck", "/buy/where-to-buy-duck-online"],
    "/cook/duck-leg-confit": ["/buy/duck-fat-buying-guide", "/gear/best-thermometer-for-duck"],
  };

  it("sends technique pages forward to the matching decision guide", () => {
    for (const [from, targets] of Object.entries(FUNNEL)) {
      const src = readRoute(from);
      expect(src, `${from} missing funnel band`).toContain("<DecisionNextSteps");
      for (const target of targets) {
        expect(src, `${from} → ${target}`).toContain(`"${target}"`);
      }
    }
  });

  it("sends decision guides back to the cooking method that justifies the purchase", () => {
    const BACK: Record<string, string[]> = {
      "/gear/best-thermometer-for-duck": [
        "/learn/duck-breast-temperature-doneness",
        "/cook/how-to-cook-duck-breast",
      ],
      "/gear/best-pan-for-duck-breast": [
        "/cook/how-to-cook-duck-breast",
        "/learn/why-duck-skin-isnt-crispy",
      ],
      "/buy/where-to-buy-duck-online": ["/cook/how-to-cook-duck-breast", "/learn/how-to-thaw-duck"],
      "/buy/duck-fat-buying-guide": ["/learn/how-to-render-duck-fat", "/cook/duck-leg-confit"],
    };
    for (const [from, targets] of Object.entries(BACK)) {
      const guide = guideByPath(from)!;
      const src = readRoute(from);
      for (const target of targets) {
        const linked = src.includes(`"${target}"`) || guide.related.includes(target);
        expect(linked, `${from} → ${target}`).toBe(true);
      }
    }
  });
});

describe("discoverability", () => {
  it("keeps every decision page in the guide registry that feeds sitemap and search", () => {
    for (const p of DECISION_PAGES) {
      const g = guideByPath(p)!;
      expect(g.kind).toBe("money");
      expect(g.teaser.length).toBeGreaterThan(10);
      expect(g.description.length).toBeGreaterThan(60);
      expect(decisionGuide(p)).toBeTruthy();
    }
  });

  it("excludes internal QA routes from the sitemap source", () => {
    const sitemap = fs.readFileSync(path.join(ROUTES_DIR, "sitemap[.]xml.ts"), "utf8");
    expect(sitemap).not.toContain("/internal/");
    for (const g of GUIDES) expect(g.path.startsWith("/internal")).toBe(false);
  });
});
