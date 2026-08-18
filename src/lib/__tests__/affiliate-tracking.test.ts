import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  isAmazonUrl,
  isImpactUrl,
  trackingToken,
  withAffiliateTracking,
} from "@/lib/affiliate-tracking";
import { COMMERCIAL_LINKS } from "@/data/commercial-links";
import { AMAZON_TAG, isTaggedAmazonUrl } from "@/data/amazon";
import { US_WELLNESS_DUCK_FAT_URL } from "@/data/affiliates";

describe("affiliate click attribution", () => {
  it("builds safe, non-PII sub-id tokens", () => {
    expect(trackingToken("/buy/duck-fat-buying-guide", "quick-picks")).toBe(
      "buy-duck-fat-buying-guide-quick-picks",
    );
    expect(trackingToken("/", "hero")).toBe("hero");
    expect(trackingToken("/x", "a".repeat(200)).length).toBeLessThanOrEqual(80);
    expect(trackingToken("/x?q=secret@mail.com", "p")).not.toContain("@");
  });

  it("adds Impact subId1/sharedid to the US Wellness duck-fat deep link", () => {
    const out = withAffiliateTracking(US_WELLNESS_DUCK_FAT_URL, {
      placement: "fat-quick-picks",
      sourcePath: "/buy/duck-fat-buying-guide",
    });
    const url = new URL(out);
    expect(isImpactUrl(url)).toBe(true);
    expect(url.origin + url.pathname).toBe(US_WELLNESS_DUCK_FAT_URL);
    const token = trackingToken("/buy/duck-fat-buying-guide", "fat-quick-picks");
    expect(url.searchParams.get("subId1")).toBe(token);
    expect(url.searchParams.get("sharedid")).toBe(token);
  });

  it("adds ascsubtag to Amazon gear links and never disturbs the Associates tag", () => {
    for (const link of COMMERCIAL_LINKS.filter((l) => /amazon\.com/.test(l.url))) {
      const out = withAffiliateTracking(link.url, {
        placement: "gear-guide",
        sourcePath: "/gear/best-thermometer-for-duck",
      });
      const url = new URL(out);
      expect(isAmazonUrl(url)).toBe(true);
      expect(url.searchParams.getAll("tag")).toEqual([AMAZON_TAG]);
      expect(isTaggedAmazonUrl(out)).toBe(true);
      expect(url.searchParams.get("ascsubtag")).toBe(
        trackingToken("/gear/best-thermometer-for-duck", "gear-guide"),
      );
    }
  });

  it("leaves non-network destinations untouched", () => {
    const plain = "https://www.thermoworks.com/";
    expect(withAffiliateTracking(plain, { placement: "p", sourcePath: "/gear" })).toBe(plain);
    expect(withAffiliateTracking("not a url", { placement: "p", sourcePath: "/" })).toBe("not a url");
  });

  it("is applied by the shared CommercialLink renderer", () => {
    const src = readFileSync(join(process.cwd(), "src/components/site/CommercialLink.tsx"), "utf8");
    expect(src).toContain("withAffiliateTracking(link.url");
    expect(src).toContain("href={href}");
    expect(src).not.toContain("href={link.url}");
  });
});
