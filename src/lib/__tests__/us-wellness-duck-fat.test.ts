/**
 * Regression cover for the 2026-08-18 US Wellness Meats catalogue correction.
 *
 * Their live duck collection lists rendered duck fat and duck livers only — no
 * whole duck, breast, or leg quarters. These tests keep the site from ever
 * implying otherwise, and pin the verified duck-fat deep link.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  US_WELLNESS_CATALOGUE_REVIEW,
  US_WELLNESS_DUCK_FAT_URL,
  isMonetized,
  merchantById,
} from "@/data/affiliates";
import {
  COMMERCIAL_LINKS,
  COMMERCIAL_PLACEMENTS,
  commercialLinkById,
  isAffiliateActive,
  relForLink,
} from "@/data/commercial-links";
import { DUCK_MERCHANTS } from "@/data/comparisons";
import { DEEP_LINKS, PAGE_REVENUE_MAP } from "@/data/revenue";
import { RECIPE_CONTENT, recipeNeedsDuckFat } from "@/data/recipe-content";
import { buildCommercialClickEvent } from "@/lib/commercial-events";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const uswLinks = COMMERCIAL_LINKS.filter((l) => l.merchantId === "us-wellness-meats");
const fatLink = commercialLinkById("us-wellness-duck-fat");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const publicSources = walk(resolve(process.cwd(), "src/routes"))
  .concat(walk(resolve(process.cwd(), "src/components")))
  .filter((f) => /\.tsx?$/.test(f) && !f.includes("__tests__") && !f.includes("/internal."));

describe("verified duck fat deep link", () => {
  it("is exactly the owner-supplied URL", () => {
    expect(US_WELLNESS_DUCK_FAT_URL).toBe("https://grasslandbeefllc.sjv.io/xJoWgR");
  });

  it("powers the only US Wellness commercial link, in the duck_fat category", () => {
    expect(uswLinks).toHaveLength(1);
    expect(fatLink).toBeDefined();
    expect(fatLink!.url).toBe(US_WELLNESS_DUCK_FAT_URL);
    expect(fatLink!.category).toBe("duck_fat");
    expect(fatLink!.relationship).toBe("affiliate_active");
    expect(isAffiliateActive(fatLink!)).toBe(true);
    expect(relForLink(fatLink!)).toBe("sponsored nofollow noopener");
    expect(fatLink!.ctaLabel).toMatch(/duck fat/i);
  });

  it("is never altered, appended to, or duplicated into variants", () => {
    const slugs = new Set<string>();
    for (const file of publicSources.concat(
      walk(resolve(process.cwd(), "src/data")).filter(
        (f) => /\.ts$/.test(f) && !f.includes("__tests__"),
      ),
    )) {
      for (const match of read(file).matchAll(/grasslandbeefllc\.sjv\.io\/([A-Za-z0-9]+)/g)) {
        slugs.add(match[1]!);
      }
    }
    // 2R7EN0 stays in the registry for monetization state and history only.
    expect([...slugs].sort()).toEqual(["2R7EN0", "xJoWgR"]);
    expect(new URL(US_WELLNESS_DUCK_FAT_URL).search).toBe("");
  });

  it("keeps US Wellness monetized as a merchant", () => {
    const merchant = merchantById("us-wellness-meats")!;
    expect(merchant.status).toBe("active");
    expect(isMonetized(merchant)).toBe(true);
    expect(merchant.lastCheckedDate).toBe("2026-08-18");
  });

  it("emits affiliate_click attributed to us-wellness-meats without the tracking path", () => {
    const event = buildCommercialClickEvent({
      link: fatLink!,
      placement: "duck_fat_sources",
      sourcePath: "/buy/duck-fat-buying-guide",
    });
    expect(event.name).toBe("affiliate_click");
    expect(event.params.merchant_id).toBe("us-wellness-meats");
    expect(event.params.category).toBe("duck_fat");
    expect(JSON.stringify(event.params)).not.toContain("xJoWgR");
  });
});

describe("no US Wellness duck-meat placements", () => {
  it("registers no US Wellness duck_source row", () => {
    expect(COMMERCIAL_LINKS.some((l) => l.merchantId === "us-wellness-meats" && l.category === "duck_source")).toBe(
      false,
    );
  });

  it("keeps US Wellness out of duck-meat sourcing placements", () => {
    const meatPlacements = [
      "buy_duck_primary_options",
      "choose_duck_sources",
      "duck_breast_next_steps",
    ];
    for (const placement of COMMERCIAL_PLACEMENTS.filter((p) => meatPlacements.includes(p.placement))) {
      const merchants = placement.linkIds.map((id) => commercialLinkById(id)!.merchantId);
      expect(merchants).not.toContain("us-wellness-meats");
    }
  });

  it("only ever places the US Wellness link in duck-fat contexts", () => {
    const placements = COMMERCIAL_PLACEMENTS.filter((p) =>
      p.linkIds.includes("us-wellness-duck-fat"),
    );
    expect(placements.length).toBeGreaterThan(0);
    for (const p of placements) {
      expect(["duck_fat_sources", "duck_fat_specialty_note", "recipe_sourcing"]).toContain(
        p.placement,
      );
    }
  });

  it("drops US Wellness from the duck-seller comparison", () => {
    expect(DUCK_MERCHANTS.some((r) => r.merchantId === "us-wellness-meats")).toBe(false);
    expect(DUCK_MERCHANTS.some((r) => /wellness/i.test(r.name))).toBe(false);
  });

  it("relabels the revenue slot around rendered duck fat", () => {
    const slot = DEEP_LINKS.find((d) => d.id === "sourcing-us-wellness")!;
    expect(slot.name).toMatch(/duck fat/i);
    expect(slot.name).not.toMatch(/pasture-raised duck\b/i);
    expect(slot.useCase).not.toMatch(/frozen duck cuts|duck meat/i);

    const meatPage = PAGE_REVENUE_MAP.find((p) => p.path === "/buy/where-to-buy-duck-online")!;
    const uswSlot = meatPage.slots.find((s) => s.merchantId === "us-wellness-meats")!;
    expect(uswSlot.intent).toMatch(/duck fat/i);
    const fatPage = PAGE_REVENUE_MAP.find((p) => p.path === "/buy/duck-fat-buying-guide")!;
    expect(fatPage.slots.some((s) => s.merchantId === "us-wellness-meats" && s.role === "primary")).toBe(
      true,
    );
  });

  it("only offers the fat link on recipes whose ingredients call for duck fat", () => {
    expect(recipeNeedsDuckFat("duck-leg-confit")).toBe(true);
    expect(recipeNeedsDuckFat("pan-seared-duck-breast")).toBe(false);
    expect(recipeNeedsDuckFat("nope")).toBe(false);
    for (const [slug, content] of Object.entries(RECIPE_CONTENT)) {
      const declared = content.ingredientGroups.some((g) =>
        g.items.some((i) => /duck fat/i.test(i)),
      );
      expect(recipeNeedsDuckFat(slug)).toBe(declared);
    }
    // Recipe pages no longer render merchant CTAs at all: cut-level availability
    // moves, so they route to the sourcing guide, and to the fat guide when the
    // recipe actually calls for rendered fat.
    const source = read("src/routes/recipes.$slug.tsx");
    expect(source).not.toContain("<CommercialCallout");
    expect(source).not.toContain("us-wellness");
    expect(source).toContain("/buy/where-to-buy-duck-online");
    expect(source).toContain("needsDuckFat ?");
    expect(source).toContain("/buy/duck-fat-buying-guide");
  });
});

describe("public copy makes no duck-meat or stock claims for US Wellness", () => {
  const banned = [
    /US Wellness[^.]{0,120}\b(whole duck|whole bird|duck breast|breasts|leg quarters|duck legs|frozen duck cuts|duck meat)\b(?![^.]{0,80}\bnot\b)/i,
    /US Wellness[^.]{0,120}\bsold out\b/i,
    /US Wellness[^.]{0,120}\bin stock\b/i,
  ];

  it("never claims US Wellness currently sells duck meat, and never quotes live stock", () => {
    const offenders: string[] = [];
    for (const file of publicSources) {
      const text = read(file).replace(/\s+/g, " ");
      if (!text.includes("US Wellness")) continue;
      for (const pattern of banned) {
        if (pattern.test(text)) offenders.push(`${file} :: ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("says plainly on the sourcing page that US Wellness is the duck-fat link, not duck meat", () => {
    const text = read("src/routes/buy.where-to-buy-duck-online.tsx").replace(/\s+/g, " ");
    expect(text).toContain("Duck fat, not duck meat");
    expect(text).toMatch(/not go there expecting a whole bird/i);
    expect(text).not.toMatch(/artagnan/i);
  });

  it("does not repeat unsubstantiated merchant production or health claims", () => {
    for (const file of publicSources) {
      const text = read(file).replace(/\s+/g, " ");
      if (!text.includes("US Wellness")) continue;
      expect(text).not.toMatch(/\b(healthier|nutrient-dense|superior nutrition|grass-fed benefits)\b/i);
    }
  });

  it("records the manual catalogue review in internal data only", () => {
    expect(US_WELLNESS_CATALOGUE_REVIEW.reviewedDate).toBe("2026-08-18");
    expect(US_WELLNESS_CATALOGUE_REVIEW.products.map((p) => p.orderableAtReview)).toEqual([
      true,
      false,
    ]);
    expect(US_WELLNESS_CATALOGUE_REVIEW.absentAtReview).toContain("Duck breast");
    // Sold-out status is internal: it must not leak into rendered copy.
    for (const file of publicSources) {
      expect(read(file)).not.toContain("US_WELLNESS_CATALOGUE_REVIEW");
    }
  });
});

describe("duck liver stays unmonetized", () => {
  it("has no liver affiliate link anywhere", () => {
    expect(COMMERCIAL_LINKS.some((l) => /\bliver/i.test(l.id) || /\bliver/i.test(l.useFor))).toBe(
      false,
    );
    for (const file of publicSources) {
      const text = read(file);
      if (!/liver/i.test(text)) continue;
      expect(text).not.toContain("grasslandbeefllc.sjv.io");
    }
  });
});

describe("disclosure precedes the US Wellness affiliate CTA", () => {
  it("renders the disclosure banner before the duck fat callout on the buying guide", () => {
    const text = read("src/routes/buy.duck-fat-buying-guide.tsx");
    const banner = text.indexOf("<DisclosureBanner");
    const callout = text.indexOf('placement="duck_fat_sources"');
    expect(banner).toBeGreaterThan(-1);
    expect(callout).toBeGreaterThan(banner);
    expect(text).toMatch(/us-wellness-duck-fat/);
    // Editorial independence language stays put.
    expect(text.replace(/\s+/g, " ")).toContain("not ordered from any of them for a hands-on review");
  });

  it("renders the disclosure banner before the specialty note on the sourcing page", () => {
    const text = read("src/routes/buy.where-to-buy-duck-online.tsx");
    expect(text.indexOf('placement="duck_fat_specialty_note"')).toBeGreaterThan(
      text.indexOf("<DisclosureBanner"),
    );
  });

  it("keeps recipe pages free of merchant CTAs and disclosure banners they do not need", () => {
    const text = read("src/routes/recipes.$slug.tsx");
    expect(text).not.toContain("<CommercialCallout");
    expect(text).not.toContain("grasslandbeefllc");
  });
});

describe("other merchant states unchanged", () => {
  it("keeps D'Artagnan declined and unpaid", () => {
    const m = merchantById("dartagnan")!;
    expect(m.status).toBe("declined");
    expect(m.affiliateUrl).toBeUndefined();
    expect(isMonetized(m)).toBe(false);
    expect(commercialLinkById("dartagnan-duck")!.relationship).toBe("direct");
    expect(relForLink(commercialLinkById("dartagnan-duck")!)).toBe("noopener");
  });

  it("keeps ThermoWorks declined and unpaid", () => {
    const m = merchantById("thermoworks")!;
    expect(m.status).toBe("declined");
    expect(m.affiliateUrl).toBeUndefined();
    expect(isMonetized(m)).toBe(false);
  });

  it("leaves Amazon as the gear-only affiliate", () => {
    const amazonLinks = COMMERCIAL_LINKS.filter((l) => l.merchantId === "amazon");
    expect(amazonLinks.length).toBeGreaterThan(0);
    for (const link of amazonLinks) {
      expect(link.url).toContain("tag=deliciousduck-20");
      expect(link.category).not.toBe("duck_source");
      expect(link.category).not.toBe("duck_fat");
    }
  });
});
