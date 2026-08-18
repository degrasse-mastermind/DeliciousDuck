import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AFFILIATE_DISCLOSURE_SENTENCE } from "@/data/comparisons";
import { DISCLOSURE_LABELS } from "@/data/commercial-links";
import { CTA } from "@/lib/cta";

const ROUTES = join(process.cwd(), "src/routes");
const COMPONENTS = join(process.cwd(), "src/components/site");

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const publicRoutes = () =>
  readdirSync(ROUTES)
    .filter((f) => f.endsWith(".tsx") && !f.startsWith("internal."))
    .map((f) => `src/routes/${f}`);

describe("one plain-language affiliate disclosure", () => {
  it("uses the exact required core sentence, in one place", () => {
    expect(AFFILIATE_DISCLOSURE_SENTENCE).toBe(
      "Some links on this page are affiliate links, meaning we may earn a commission if you buy through them, at no extra cost to you.",
    );
    const banner = read("src/components/site/Commerce.tsx");
    expect(banner).toContain("AFFILIATE_DISCLOSURE_SENTENCE");
    expect(banner).toContain("How we choose recommendations");
  });

  it("renders the page-level disclosure at most once per route", () => {
    for (const p of publicRoutes()) {
      const occurrences = read(p).match(/<DisclosureBanner/g) ?? [];
      expect(occurrences.length, p).toBeLessThanOrEqual(1);
    }
  });

  it("never repeats a commission sentence in prose or the footer", () => {
    for (const p of [...publicRoutes(), "src/components/site/Footer.tsx"]) {
      const text = read(p).replace(/\s+/g, " ");
      expect(text, p).not.toMatch(/we may earn a commission/i);
      expect(text, p).not.toMatch(/this one is an affiliate link/i);
    }
  });
});

describe("no commission ledger on non-affiliate links", () => {
  it("keeps status labels neutral", () => {
    expect(DISCLOSURE_LABELS.direct).toBe("Direct link to the seller");
    expect(DISCLOSURE_LABELS.affiliate_pending).toBe("Direct link to the seller");
    for (const label of Object.values(DISCLOSURE_LABELS)) {
      expect(label).not.toMatch(/earn nothing|no commission/i);
    }
  });

  it("drops 'No commission' badges from commercial link UI", () => {
    const text = read("src/components/site/CommercialLink.tsx");
    expect(text).not.toMatch(/No commission/);
    expect(text).not.toMatch(/earn nothing/i);
  });

  it("keeps 'we earn nothing' out of public routes and site components", () => {
    const files = [
      ...publicRoutes(),
      ...readdirSync(COMPONENTS)
        .filter((f) => f.endsWith(".tsx"))
        .map((f) => `src/components/site/${f}`),
    ];
    for (const p of files) {
      expect(read(p), p).not.toMatch(/we earn nothing|no commission/i);
    }
  });
});

describe("CTA hierarchy", () => {
  it("clears a 44px tap target and shows a focus ring on every button level", () => {
    for (const level of [CTA.primary, CTA.commercial, CTA.secondary, CTA.secondaryOnDark]) {
      expect(level).toContain("min-h-11");
      expect(level).toContain("focus-visible:outline");
    }
  });

  it("differentiates levels by more than colour", () => {
    expect(CTA.secondary).toContain("border");
    expect(CTA.commercial).toContain("bg-forest");
    expect(CTA.primary).toContain("bg-accent");
    // Tertiary links stay underlined text, never button-styled.
    expect(CTA.tertiary).toContain("underline");
    expect(CTA.tertiary).not.toContain("rounded-sm");
  });

  it("labels outbound commercial CTAs specifically", () => {
    const text = read("src/components/site/Commerce.tsx");
    expect(text).toContain("`Shop ${shopNoun} at ${row.name}`");
    expect(text).not.toMatch(/Visit seller/i);
  });
});
