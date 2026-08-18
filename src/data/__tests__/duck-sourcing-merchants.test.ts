/**
 * Regression cover for the 2026-08-18 sourcing architecture:
 * - US Wellness is duck fat only, on the verified xJoWgR deep link.
 * - D'Artagnan is declined and unmonetized, kept only on catalogue merit.
 * - Culver Duck, TastyDuck and Fossil Farms render as direct and unpaid.
 */
import { describe, expect, it } from "vitest";
import {
  MERCHANTS,
  US_WELLNESS_DUCK_FAT_URL,
  isMonetized,
  merchantById,
} from "@/data/affiliates";
import {
  COMMERCIAL_LINKS,
  COMMERCIAL_PLACEMENTS,
  commercialLinkById,
  commercialLinksByCategory,
  relForLink,
} from "@/data/commercial-links";
import { DUCK_MERCHANTS } from "@/data/comparisons";

const UNPAID = ["culver-duck", "tastyduck-jurgielewicz", "fossil-farms", "wild-fork"] as const;

describe("US Wellness is duck fat only", () => {
  it("uses the exact verified duck fat deep link", () => {
    expect(US_WELLNESS_DUCK_FAT_URL).toBe("https://grasslandbeefllc.sjv.io/xJoWgR");
    const m = merchantById("us-wellness-meats")!;
    expect(m.status).toBe("active");
    expect(m.affiliateUrl).toBe(US_WELLNESS_DUCK_FAT_URL);
    const link = commercialLinkById("us-wellness-duck-fat")!;
    expect(link.category).toBe("duck_fat");
    expect(link.url).toBe(US_WELLNESS_DUCK_FAT_URL);
    expect(relForLink(link)).toContain("sponsored");
  });

  it("never appears in a duck-meat sourcing link or placement", () => {
    const uswLinks = COMMERCIAL_LINKS.filter((l) => l.merchantId === "us-wellness-meats");
    expect(uswLinks.length).toBeGreaterThan(0);
    for (const link of uswLinks) {
      expect(link.category).toBe("duck_fat");
    }
    for (const placement of COMMERCIAL_PLACEMENTS) {
      const ids = placement.linkIds.filter((id) =>
        COMMERCIAL_LINKS.some((l) => l.id === id && l.merchantId === "us-wellness-meats"),
      );
      if (ids.length === 0) continue;
      expect(placement.placement).toMatch(/fat/i);
    }
    expect(DUCK_MERCHANTS.some((r) => r.merchantId === "us-wellness-meats")).toBe(false);
  });

  it("has no recipe sourcing placement at all", () => {
    expect(COMMERCIAL_PLACEMENTS.some((p) => p.placement === "recipe_sourcing")).toBe(false);
  });
});

describe("D'Artagnan is removed site-wide", () => {
  it("has no merchant, link, comparison row or placement entry", () => {
    expect(merchantById("dartagnan")).toBeUndefined();
    expect(commercialLinkById("dartagnan-duck")).toBeUndefined();
    expect(MERCHANTS.some((m) => /artagnan/i.test(m.name))).toBe(false);
    expect(COMMERCIAL_LINKS.some((l) => /artagnan/i.test(l.url))).toBe(false);
    expect(DUCK_MERCHANTS.some((r) => /artagnan/i.test(r.name))).toBe(false);
    for (const placement of COMMERCIAL_PLACEMENTS) {
      expect(placement.linkIds.some((id) => /artagnan/i.test(id)), placement.placement).toBe(false);
    }
  });

  it("appears in no source file under src/routes or src/data", () => {
    const roots = ["src/routes", "src/data", "src/components", "src/lib"];
    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of readdirSync(root, { recursive: true }) as string[]) {
        const full = join(root, file);
        if (!/\.(ts|tsx)$/.test(full)) continue;
        if (!statSync(full).isFile()) continue;
        if (full.includes("__tests__") || full.endsWith(".test.ts")) continue;
        if (/artagnan/i.test(readFileSync(full, "utf8"))) offenders.push(full);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("verified direct sellers stay direct and unpaid", () => {
  it("registers every unpaid seller without an affiliate URL", () => {
    for (const id of UNPAID) {
      const m = merchantById(id)!;
      expect(m, id).toBeTruthy();
      expect(isMonetized(m), id).toBe(false);
      expect(m.affiliateUrl, id).toBeUndefined();
    }
  });

  it("renders their links as direct relationships", () => {
    for (const id of UNPAID) {
      const links = COMMERCIAL_LINKS.filter((l) => l.merchantId === id);
      expect(links.length, id).toBeGreaterThan(0);
      for (const link of links) {
        expect(link.relationship, `${id}/${link.id}`).toBe("direct");
      }
    }
  });

  it("leads the sourcing comparison with unpaid duck specialists", () => {
    expect(DUCK_MERCHANTS.map((r) => r.id)).toEqual([
      "culver-duck",
      "tastyduck-jurgielewicz",
      "fossil-farms",
      "dartagnan",
      "wild-fork",
    ]);
    for (const row of DUCK_MERCHANTS) {
      expect(row.affiliateStatus, row.id).toBe("none");
      expect(row.decisionFactors["relationship"], row.id).toMatch(/we earn nothing/i);
    }
  });

  it("keeps a duck fat option list that is not US Wellness only", () => {
    const fat = commercialLinksByCategory("duck_fat");
    expect(fat.some((l) => l.merchantId === "us-wellness-meats")).toBe(true);
    expect(fat.some((l) => l.merchantId !== "us-wellness-meats")).toBe(true);
  });

  it("does not monetize any newly added seller by accident", () => {
    const monetized = MERCHANTS.filter(isMonetized).map((m) => m.id).sort();
    expect(monetized).toEqual(["amazon", "us-wellness-meats"]);
  });
});
