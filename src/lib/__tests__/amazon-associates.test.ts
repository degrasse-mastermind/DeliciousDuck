import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AMAZON_REQUIRED_STATEMENT,
  AMAZON_TAG,
  amazonSearchUrl,
  isTaggedAmazonUrl,
} from "@/data/amazon";
import { MERCHANTS, isMonetized, merchantById } from "@/data/affiliates";
import {
  COMMERCIAL_LINKS,
  COMMERCIAL_PLACEMENTS,
  isAffiliateActive,
  relForLink,
} from "@/data/commercial-links";
import { buildCommercialClickEvent } from "@/lib/commercial-events";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const amazonLinks = COMMERCIAL_LINKS.filter((l) => l.merchantId === "amazon");

describe("Amazon Associates activation", () => {
  it("registers Amazon as active with the assigned tracking ID", () => {
    const amazon = merchantById("amazon")!;
    expect(amazon.program).toBe("Amazon Associates");
    expect(amazon.publisherId).toBe("deliciousduck-20");
    expect(AMAZON_TAG).toBe("deliciousduck-20");
    expect(amazon.status).toBe("active");
    expect(isMonetized(amazon)).toBe(true);
    expect(amazon.statusReviewed.startsWith("2026-08")).toBe(true);
  });

  it("builds every Special Link with the tag exactly once", () => {
    expect(amazonLinks.length).toBeGreaterThan(0);
    for (const link of amazonLinks) {
      const parsed = new URL(link.url);
      expect(parsed.protocol).toBe("https:");
      expect(parsed.hostname.endsWith("amazon.com")).toBe(true);
      expect(parsed.searchParams.getAll("tag")).toEqual([AMAZON_TAG]);
      expect((link.url.match(/tag=deliciousduck-20/g) ?? []).length).toBe(1);
      expect(isTaggedAmazonUrl(link.url)).toBe(true);
    }
    expect(isTaggedAmazonUrl("https://www.amazon.com/s?k=pan")).toBe(false);
    expect(isTaggedAmazonUrl(amazonSearchUrl("cast iron skillet"))).toBe(true);
  });

  it("uses sponsored nofollow rel and affiliate_active state", () => {
    for (const link of amazonLinks) {
      expect(isAffiliateActive(link)).toBe(true);
      expect(relForLink(link)).toBe("sponsored nofollow noopener");
    }
  });

  it("never links duck meat through Amazon", () => {
    for (const link of amazonLinks) {
      expect(link.category).not.toBe("duck_source");
      expect(link.category).not.toBe("duck_fat");
      expect(link.url.toLowerCase()).not.toContain("duck");
    }
  });

  it("places Amazon links only on gear money pages", () => {
    const amazonIds = new Set(amazonLinks.map((l) => l.id));
    const paths = COMMERCIAL_PLACEMENTS.filter((p) => p.linkIds.some((id) => amazonIds.has(id))).map(
      (p) => p.path,
    );
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) expect(path.startsWith("/gear/")).toBe(true);
  });

  it("emits distinguishable click events per merchant", () => {
    const amazonEvent = buildCommercialClickEvent({
      link: amazonLinks[0]!,
      placement: "pan_category_options",
      sourcePath: "/gear/best-pan-for-duck-breast",
    });
    expect(amazonEvent.name).toBe("affiliate_click");
    expect(amazonEvent.params.merchant_id).toBe("amazon");
    expect(amazonEvent.params.destination_host).toBe("amazon.com");
    expect(JSON.stringify(amazonEvent.params)).not.toContain("tag=");

    const usWellness = COMMERCIAL_LINKS.find((l) => l.merchantId === "us-wellness-meats")!;
    const uswEvent = buildCommercialClickEvent({
      link: usWellness,
      placement: "buy_duck_primary_options",
      sourcePath: "/buy/where-to-buy-duck-online",
    });
    expect(uswEvent.params.merchant_id).toBe("us-wellness-meats");
    expect(uswEvent.params.merchant_id).not.toBe(amazonEvent.params.merchant_id);
  });
});

describe("other merchants stay truthful", () => {
  it("keeps US Wellness active on the canonical tracking URL", () => {
    const m = merchantById("us-wellness-meats")!;
    expect(m.status).toBe("active");
    expect(m.affiliateUrl).toBe("https://grasslandbeefllc.sjv.io/2R7EN0");
  });

  it("keeps D'Artagnan pending and ThermoWorks declined, neither monetized", () => {
    const dartagnan = merchantById("dartagnan")!;
    expect(dartagnan.status).toBe("applied");
    expect(isMonetized(dartagnan)).toBe(false);
    const tw = merchantById("thermoworks")!;
    expect(tw.status).toBe("declined");
    expect(tw.affiliateUrl).toBeUndefined();
    expect(isMonetized(tw)).toBe(false);
  });

  it("monetizes only Amazon and US Wellness", () => {
    expect(MERCHANTS.filter(isMonetized).map((m) => m.id).sort()).toEqual([
      "amazon",
      "us-wellness-meats",
    ]);
  });
});

describe("disclosure requirements", () => {
  it("shows the exact Amazon statement site-wide and on the disclosure page", () => {
    expect(AMAZON_REQUIRED_STATEMENT).toBe(
      "As an Amazon Associate I earn from qualifying purchases.",
    );
    expect(read("src/components/site/Footer.tsx")).toContain("AMAZON_REQUIRED_STATEMENT");
    const page = read("src/routes/affiliate-disclosure.tsx").replace(/\s+/g, " ");
    expect(page).toContain("as an Amazon Associate I earn from qualifying purchases.");
  });

  it("removes stale blanket 'no affiliate relationship' copy from public pages", () => {
    for (const file of [
      "src/routes/buy.where-to-buy-duck-online.tsx",
      "src/routes/gear.best-pan-for-duck-breast.tsx",
      "src/routes/gear.best-knife-for-scoring-duck.tsx",
      "src/routes/affiliate-disclosure.tsx",
    ]) {
      const text = read(file).replace(/\s+/g, " ");
      expect(text).not.toContain("no affiliate relationship is currently active");
      expect(text).not.toContain("We do not currently claim any specific merchant partnerships");
    }
  });

  it("renders the page disclosure banner before the first affiliate module", () => {
    for (const file of [
      "src/routes/gear.best-pan-for-duck-breast.tsx",
      "src/routes/gear.best-roasting-pan-for-duck.tsx",
      "src/routes/gear.best-thermometer-for-duck.tsx",
      "src/routes/gear.best-knife-for-scoring-duck.tsx",
      "src/routes/buy.where-to-buy-duck-online.tsx",
    ]) {
      const text = read(file);
      const banner = text.indexOf("<DisclosureBanner");
      const callout = text.indexOf("<CommercialCallout");
      expect(banner).toBeGreaterThan(-1);
      expect(callout).toBeGreaterThan(banner);
    }
  });
});

describe("Amazon links never reach email or downloads", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });

  it("keeps Special Links out of newsletter, email, and download source paths", () => {
    const offenders = walk(resolve(process.cwd(), "src"))
      .filter((f) => /newsletter|email|unsubscribe|download|pdf|duck-drop/i.test(f))
      .filter((f) => /\.(ts|tsx)$/.test(f))
      .filter((f) => !f.includes("__tests__"))
      .filter((f) => {
        const text = readFileSync(f, "utf8");
        return (
          text.includes("amazon.com") ||
          text.includes(AMAZON_TAG) ||
          text.includes("amazonSearchUrl") ||
          text.includes("amazonCategoryUrl")
        );
      });
    expect(offenders).toEqual([]);
  });
});
