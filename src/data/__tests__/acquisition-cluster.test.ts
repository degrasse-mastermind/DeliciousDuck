import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ACQUISITION_PAGES, acquisitionPage } from "@/data/acquisition-cluster";
import { INGREDIENTS } from "@/data/ingredients";
import { GUIDES, guideByPath } from "@/data/guides";
import { SOURCES } from "@/data/sources";
import { COMMERCIAL_LINKS } from "@/data/commercial-links";

const ROUTE_FILE: Record<string, string> = {
  "/buy/what-cut-of-duck-to-buy": "src/routes/buy.what-cut-of-duck-to-buy.tsx",
  "/buy/how-much-duck-per-person": "src/routes/buy.how-much-duck-per-person.tsx",
  "/buy/fresh-vs-frozen-duck": "src/routes/buy.fresh-vs-frozen-duck.tsx",
  "/buy/how-to-choose-duck": "src/routes/buy.how-to-choose-duck.tsx",
  "/learn/duck-vs-turkey-thanksgiving": "src/routes/learn.duck-vs-turkey-thanksgiving.tsx",
};


function src(path: string): string {
  return readFileSync(ROUTE_FILE[path]!, "utf8");
}

describe("acquisition cluster registry", () => {
  it("has one entry per cluster route with a route file", () => {
    expect(ACQUISITION_PAGES.length).toBe(Object.keys(ROUTE_FILE).length);
    for (const page of ACQUISITION_PAGES) {
      expect(ROUTE_FILE[page.path], `missing route file for ${page.path}`).toBeTruthy();
    }
  });

  it("owns a unique search intent per page", () => {
    const intents = ACQUISITION_PAGES.map((p) => p.intent.toLowerCase());
    expect(new Set(intents).size).toBe(intents.length);
  });

  it("is registered in the guide registry with unique titles and descriptions", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const page of ACQUISITION_PAGES) {
      const guide = guideByPath(page.path);
      expect(guide, `${page.path} is not in GUIDES`).toBeTruthy();
      expect(guide!.seoTitle.length).toBeGreaterThan(20);
      titles.add(guide!.seoTitle);
      descriptions.add(guide!.description);
    }
    expect(titles.size).toBe(ACQUISITION_PAGES.length);
    expect(descriptions.size).toBe(ACQUISITION_PAGES.length);
  });

  it("has no duplicate seoTitle or path anywhere in the guide registry", () => {
    const paths = GUIDES.map((g) => g.path);
    expect(new Set(paths).size).toBe(paths.length);
    const titles = GUIDES.map((g) => g.seoTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("cites only real source ids", () => {
    for (const page of ACQUISITION_PAGES) {
      expect(page.sourceIds.length).toBeGreaterThan(0);
      for (const id of page.sourceIds) {
        expect(SOURCES[id as keyof typeof SOURCES], `unknown source ${id}`).toBeTruthy();
      }
    }
  });

  it("states editorial transparency on every page", () => {
    for (const page of ACQUISITION_PAGES) {
      expect(page.byline).toBe("DeliciousDuck Editorial");
      expect(page.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(page.basedOn.length).toBeGreaterThanOrEqual(2);
      expect(page.evidenceBasis.length).toBeGreaterThan(40);
      expect(page.evidenceBasis.toLowerCase()).not.toMatch(/have not|not tested|hands-on/);
    }
  });

  it("gives a complete first-viewport answer", () => {
    for (const page of ACQUISITION_PAGES) {
      expect(page.answer.length).toBeGreaterThan(120);
    }
  });

  it("funnels forward to internal routes that exist", () => {
    const known = new Set<string>([
      ...GUIDES.map((g) => g.path),
      ...INGREDIENTS.map((i) => i.path),
      "/tools/whole-duck-serving-calculator",
      "/tools/duck-doneness-guide",
      "/tools/duck-cooking-time-planner",
      "/tools/what-should-i-cook",
    ]);
    for (const page of ACQUISITION_PAGES) {
      expect(page.funnel.length).toBeGreaterThanOrEqual(1);
      for (const item of page.funnel) {
        expect(item.to.startsWith("/")).toBe(true);
        expect(item.to).not.toBe(page.path);
        expect(known.has(item.to), `${page.path} funnels to unknown ${item.to}`).toBe(true);
        expect(item.why.length).toBeGreaterThan(20);
      }
    }
  });

  it("funnels every page into at least one decision guide or calculator", () => {
    const targets = new Set([
      "/buy/where-to-buy-duck-online",
      "/buy/duck-fat-buying-guide",
      "/gear/best-thermometer-for-duck",
      "/gear/best-pan-for-duck-breast",
      "/tools/whole-duck-serving-calculator",
    ]);
    for (const page of ACQUISITION_PAGES) {
      expect(page.funnel.some((f) => targets.has(f.to)), page.path).toBe(true);
    }
  });

  it("carries no commercial claims in the registry", () => {
    const json = JSON.stringify(ACQUISITION_PAGES).toLowerCase();
    for (const banned of [
      "$",
      " usd ",
      "affiliate link",
      "commission",
      "% off",
      "discount",
      "in stock",
      "we tested",
      "our testing",
      "rating",
      "out of 5",
    ]) {
      expect(json.includes(banned), `registry mentions ${banned}`).toBe(false);
    }
  });
});

describe("acquisition cluster route files", () => {
  it("declares its own canonical path, title and single H1 source", () => {
    for (const page of ACQUISITION_PAGES) {
      const code = src(page.path);
      expect(code).toContain(`createFileRoute("${page.path}")`);
      expect(code).toContain(`guideByPath("${page.path}")`);
      expect(code).toContain(`acquisitionPage("${page.path}")`);
      // Title/H1 come from the single guide-registry entry, so they cannot diverge.
      expect(code).toContain("title: GUIDE.seoTitle");
      expect(code).toContain("title={GUIDE.title}");
      expect(code).toContain("path: GUIDE.path");
    }
  });

  it("emits only schema whose content is visible on the page", () => {
    for (const page of ACQUISITION_PAGES) {
      const code = src(page.path);
      expect(code).toContain("breadcrumbSchema");
      expect(code).toContain("articleSchema");
      // FAQ schema is only allowed alongside a rendered FaqList of the same items.
      if (code.includes("faqSchema(FAQ)")) {
        expect(code).toContain("<FaqList items={FAQ} />");
      }
      for (const unsupported of ["recipeSchema", "productSchema", "aggregateRating", "offerSchema"]) {
        expect(code.includes(unsupported), `${page.path} emits ${unsupported}`).toBe(false);
      }
    }
  });

  it("renders transparency, sources and a funnel band", () => {
    for (const page of ACQUISITION_PAGES) {
      const code = src(page.path);
      expect(code).toContain("<AnswerFirst page={PAGE} />");
      expect(code).toContain("<ArticleByline page={PAGE} />");
      expect(code).toContain("<ArticleBasis page={PAGE} />");
      expect(code).toContain("<SourceNotes ids={PAGE.sourceIds} />");
      expect(code).toContain("items={PAGE.funnel}");
    }
  });

  it("uses no raw merchant anchors or tracking parameters", () => {
    const merchantHosts = new Set(
      COMMERCIAL_LINKS.map((l) => {
        try {
          return new URL(l.url).hostname.replace(/^www\./, "");
        } catch {
          return "";
        }
      }).filter(Boolean),
    );
    for (const page of ACQUISITION_PAGES) {
      const code = src(page.path);
      expect(/<a\s[^>]*href=["']https?:/i.test(code), `${page.path} has a raw external anchor`).toBe(
        false,
      );
      for (const host of merchantHosts) {
        expect(code.includes(host), `${page.path} hardcodes ${host}`).toBe(false);
      }
      for (const param of ["utm_", "?tag=", "irclickid", "impact.com", "affiliate"]) {
        expect(code.includes(param), `${page.path} mentions ${param}`).toBe(false);
      }
    }
  });

  it("makes no price, rating or testing claims in page copy", () => {
    for (const page of ACQUISITION_PAGES) {
      const code = src(page.path);
      for (const banned of ["we tested", "our tests", "our testing", "out of 5", "% off", "cheapest"]) {
        expect(code.toLowerCase().includes(banned), `${page.path} claims "${banned}"`).toBe(false);
      }
      expect(/\$\d/.test(code), `${page.path} states a price`).toBe(false);
    }
  });

  it("links only to internal routes that exist", () => {
    const known = new Set<string>([
      ...GUIDES.map((g) => g.path),
      ...INGREDIENTS.map((i) => i.path),
      "/",
      "/buy",
      "/cook",
      "/learn",
      "/gear",
      "/ingredients",
      "/recipes",
      "/tools",
      "/about",
      "/search",
      "/editorial-standards",
      "/affiliate-disclosure",
      "/privacy",
      "/terms",
      "/tools/whole-duck-serving-calculator",
      "/tools/duck-doneness-guide",
      "/tools/duck-cooking-time-planner",
      "/tools/what-should-i-cook",
      "/tools/duck-fat-render-calculator",
      "/tools/duck-pairing-finder",
      // Dynamic recipe route: the slug is validated separately against
      // RECIPES in the recipe-content registry.
      "/recipes/$slug",
    ]);
    for (const page of ACQUISITION_PAGES) {
      const code = src(page.path);
      for (const m of code.matchAll(/to="(\/[^"]*)"/g)) {
        expect(known.has(m[1]!), `${page.path} links to unknown route ${m[1]}`).toBe(true);
      }
    }
  });
});

describe("cluster discoverability and back-links", () => {
  it("is included in sitemap and search through the guide registry", () => {
    const sitemap = readFileSync("src/routes/sitemap[.]xml.ts", "utf8");
    const search = readFileSync("src/routes/search.tsx", "utf8");
    expect(sitemap).toMatch(/GUIDES/);
    expect(search).toMatch(/GUIDES/);
    for (const page of ACQUISITION_PAGES) {
      expect(guideByPath(page.path)!.path).toBe(page.path);
    }
  });

  it("keeps utility routes out of the guide registry", () => {
    for (const guide of GUIDES) {
      expect(guide.path.startsWith("/internal/")).toBe(false);
      expect(guide.path.startsWith("/api/")).toBe(false);
    }
  });

  it("is linked back from its own pillar hub and the sourcing decision guide", () => {
    const buyHub = readFileSync("src/routes/buy.index.tsx", "utf8");
    const learnHub = readFileSync("src/routes/learn.index.tsx", "utf8");
    const sourcing = guideByPath("/buy/where-to-buy-duck-online")!;
    for (const page of ACQUISITION_PAGES) {
      const hub = page.path.startsWith("/buy/") ? buyHub : learnHub;
      expect(hub.includes(page.path), `pillar hub does not link ${page.path}`).toBe(true);
    }
    expect(sourcing.related).toContain("/buy/what-cut-of-duck-to-buy");
    expect(sourcing.related).toContain("/buy/fresh-vs-frozen-duck");
  });


  it("connects the mail-order thaw path in both directions", () => {
    const thaw = readFileSync("src/routes/learn.how-to-thaw-duck.tsx", "utf8");
    expect(thaw).toContain("/buy/fresh-vs-frozen-duck");
    expect(acquisitionPage("/buy/fresh-vs-frozen-duck")!.funnel.map((f) => f.to)).toContain(
      "/learn/how-to-thaw-duck",
    );
  });
});

describe("breed claim containment", () => {
  const BREED_WORDS = /pekin|moulard|muscovy|magret/i;

  it("publishes no breed-specific cooking claims on the acquisition cluster or sourcing guide", () => {
    const files = [
      ...Object.values(ROUTE_FILE),
      "src/routes/buy.where-to-buy-duck-online.tsx",
      "src/routes/buy.index.tsx",
      "src/data/acquisition-cluster.ts",
    ];
    for (const file of files) {
      const body = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(BREED_WORDS.test(body), `breed-specific claim in ${file}`).toBe(false);
    }
  });

  it("does not route to the retired breed page anywhere", () => {
    const files = [...Object.values(ROUTE_FILE), "src/data/guides.ts", "src/data/acquisition-cluster.ts"];
    for (const file of files) {
      const body = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(body.includes("duck-breeds-for-cooking"), file).toBe(false);
    }
  });
});
