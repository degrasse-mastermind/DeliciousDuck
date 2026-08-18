import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AMAZON_REQUIRED_STATEMENT, AMAZON_TAG, isTaggedAmazonUrl } from "@/data/amazon";
import { commercialLinkById, relForLink } from "@/data/commercial-links";
import { AFFILIATE_DISCLOSURE_SENTENCE } from "@/data/comparisons";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const flat = (p: string) => read(p).replace(/\s+/g, " ");

const GEAR_GUIDES = [
  "src/routes/gear.best-pan-for-duck-breast.tsx",
  "src/routes/gear.best-knife-for-scoring-duck.tsx",
  "src/routes/gear.best-thermometer-for-duck.tsx",
  "src/routes/gear.best-roasting-pan-for-duck.tsx",
];

const publicRoutes = () =>
  readdirSync(join(process.cwd(), "src/routes"))
    .filter((f) => f.endsWith(".tsx") && !f.startsWith("internal."))
    .map((f) => `src/routes/${f}`);

const SITE_COMPONENTS = () =>
  readdirSync(join(process.cwd(), "src/components/site"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => `src/components/site/${f}`);

describe("gear guides carry one commission disclosure only", () => {
  it("has no body-level commission sentence beyond the single banner", () => {
    for (const p of GEAR_GUIDES) {
      const text = flat(p);
      expect(text, p).not.toMatch(/we may earn a commission/i);
      expect(text, p).not.toMatch(/affiliate links to retail categories/i);
      // The one disclosure comes from the shared banner component.
      expect((text.match(/<DisclosureBanner/g) ?? []).length, p).toBeLessThanOrEqual(1);
    }
    expect(AFFILIATE_DISCLOSURE_SENTENCE).toBe(
      "Some links on this page are affiliate links, meaning we may earn a commission if you buy through them, at no extra cost to you.",
    );
  });

  it("keeps the hands-on-testing point without commission prose", () => {
    expect(flat("src/routes/gear.best-pan-for-duck-breast.tsx")).toContain(
      "None of the categories above reflects a hands-on test by DeliciousDuck.",
    );
    expect(flat("src/routes/gear.best-knife-for-scoring-duck.tsx")).toContain(
      "None of the categories above reflects a hands-on test by DeliciousDuck.",
    );
    const thermo = flat("src/routes/gear.best-thermometer-for-duck.tsx");
    expect(thermo).toContain("research-stage brand candidate based on its published");
    expect(thermo).toContain("has not hands-on tested any model");
  });
});

describe("no relationship-ledger prose on public surfaces", () => {
  it("drops paid/unpaid ledger phrasing from routes and site components", () => {
    for (const p of [...publicRoutes(), ...SITE_COMPONENTS()]) {
      const text = flat(p);
      expect(text, p).not.toMatch(/no affiliate relationship/i);
      expect(text, p).not.toMatch(/unpaid link/i);
      expect(text, p).not.toMatch(/we earn nothing/i);
      expect(text, p).not.toMatch(/no commission/i);
    }
  });

  it("links EvaluationNote to editorial standards only", () => {
    const text = flat("src/components/site/Commerce.tsx");
    const note = text.slice(text.indexOf("export function EvaluationNote"));
    const body = note.slice(0, note.indexOf("export function ComparisonCard"));
    expect(body).toContain("/editorial-standards");
    expect(body).not.toContain("/affiliate-disclosure");
  });

  it("keeps the required Amazon footer statement", () => {
    expect(AMAZON_REQUIRED_STATEMENT).toBe(
      "As an Amazon Associate I earn from qualifying purchases.",
    );
    expect(read("src/components/site/Footer.tsx")).toContain("AMAZON_REQUIRED_STATEMENT");
  });
});

describe("Amazon CTA labels are specific and metadata is intact", () => {
  const EXPECTED: Record<string, string> = {
    "amazon-instant-read-thermometer": "Shop instant-read thermometers on Amazon",
    "amazon-leave-in-probe-thermometer": "Shop leave-in thermometers on Amazon",
    "amazon-roasting-pan-rack": "Shop roasting pans on Amazon",
    "amazon-sheet-pan-rack": "Shop sheet pans and racks on Amazon",
    "amazon-cast-iron-skillet": "Shop cast-iron skillets on Amazon",
    "amazon-carbon-steel-skillet": "Shop carbon-steel skillets on Amazon",
    "amazon-stainless-clad-skillet": "Shop stainless-clad skillets on Amazon",
    "amazon-utility-knife": "Shop utility knives on Amazon",
    "amazon-boning-knife": "Shop boning knives on Amazon",
  };

  it("labels all nine categories specifically", () => {
    expect(Object.keys(EXPECTED)).toHaveLength(9);
    for (const [id, label] of Object.entries(EXPECTED)) {
      const link = commercialLinkById(id)!;
      expect(link, id).toBeDefined();
      expect(link.ctaLabel, id).toBe(label);
      expect(link.ctaLabel, id).not.toBe("Browse this category on Amazon");
    }
  });

  it("preserves destination, tag, and rel on all nine links", () => {
    for (const id of Object.keys(EXPECTED)) {
      const link = commercialLinkById(id)!;
      expect(isTaggedAmazonUrl(link.url), id).toBe(true);
      expect(link.url, id).toContain(`tag=${AMAZON_TAG}`);
      expect(relForLink(link), id).toBe("sponsored nofollow noopener");
    }
  });

  it("keeps the tracked commercial link component wired to analytics", () => {
    const text = read("src/components/site/CommercialLink.tsx");
    expect(text).toContain("trackCommercialClick({ link, placement })");
  });
});
