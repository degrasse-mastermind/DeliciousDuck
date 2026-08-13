import { describe, expect, it, vi, afterEach } from "vitest";
import {
  COMMERCIAL_LINKS,
  COMMERCIAL_PLACEMENTS,
  DISCLOSURE_LABELS,
  auditCommercialLinks,
  commercialLinkById,
  destinationHost,
  isAffiliateActive,
  relForLink,
  relationshipForMerchant,
  type CommercialLinkEntry,
} from "@/data/commercial-links";
import { MERCHANTS, isMonetized } from "@/data/affiliates";
import {
  ALLOWED_EVENT_PARAMS,
  buildCommercialClickEvent,
  eventNameForRelationship,
  safeSourcePath,
} from "@/lib/commercial-events";
import { trackCommercialClick } from "@/lib/analytics";

const sample = (over: Partial<CommercialLinkEntry> = {}): CommercialLinkEntry => ({
  id: "sample",
  merchant: "Sample Merchant",
  url: "https://example.com/duck",
  category: "duck_source",
  relationship: "direct",
  disclosureLabel: DISCLOSURE_LABELS.direct,
  lastVerified: "2026-08",
  useFor: "Testing only.",
  ...over,
});

describe("registry integrity", () => {
  it("has unique ids and no audit errors", () => {
    const ids = COMMERCIAL_LINKS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    const errors = auditCommercialLinks(COMMERCIAL_LINKS, new Date("2026-08-13T00:00:00Z"))
      .filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
  });

  it("uses only https destinations without query strings", () => {
    for (const link of COMMERCIAL_LINKS) {
      const parsed = new URL(link.url);
      expect(parsed.protocol).toBe("https:");
      if (link.relationship !== "affiliate_active") expect(parsed.search).toBe("");
    }
  });

  it("only claims affiliate status when the merchant registry is monetized", () => {
    for (const link of COMMERCIAL_LINKS) {
      const merchant = MERCHANTS.find((m) => m.id === link.merchantId);
      expect(link.relationship === "affiliate_active").toBe(isMonetized(merchant));
      expect(link.disclosureLabel).toBe(DISCLOSURE_LABELS[link.relationship]);
    }
  });

  it("maps merchant status to relationship conservatively", () => {
    expect(relationshipForMerchant(undefined)).toBe("direct");
    expect(
      relationshipForMerchant({
        id: "x",
        name: "X",
        status: "applied",
        statusReviewed: "2026-08",
        activation: {
          approvalConfirmed: false,
          termsReviewed: false,
          trackingUrlPresent: false,
          testClickComplete: false,
          disclosureVerified: false,
          ga4AffiliateVerified: false,
        },
      }),
    ).toBe("affiliate_pending");
  });

  it("flags an unbacked affiliate_active row", () => {
    const issues = auditCommercialLinks([
      sample({ id: "fake", merchantId: "dartagnan", relationship: "affiliate_active", disclosureLabel: DISCLOSURE_LABELS.affiliate_active }),
    ]);
    expect(issues.some((i) => i.code === "unbacked_affiliate_status")).toBe(true);
  });

  it("flags unsafe protocols, missing urls, stale dates and duplicates", () => {
    const codes = auditCommercialLinks(
      [
        sample({ id: "dupe", url: "javascript:alert(1)" as string }),
        sample({ id: "dupe", url: "" }),
        sample({ id: "old", lastVerified: "2020-01" }),
        sample({ id: "bad", url: "not-a-url" }),
      ],
      new Date("2026-08-13T00:00:00Z"),
    ).map((i) => i.code);
    expect(codes).toContain("duplicate_id");
    expect(codes).toContain("unsafe_protocol");
    expect(codes).toContain("unparseable_url");
    expect(codes).toContain("missing_url");
    expect(codes).toContain("stale_verification");
  });
});

describe("relationship to rel mapping", () => {
  it("uses sponsored nofollow noopener only for active affiliate links", () => {
    expect(relForLink(sample({ relationship: "affiliate_active" }))).toBe(
      "sponsored nofollow noopener",
    );
    for (const relationship of ["direct", "affiliate_pending", "owned"] as const) {
      const rel = relForLink(sample({ relationship }));
      expect(rel).toBe("noopener");
      expect(rel).not.toContain("sponsored");
    }
  });

  it("today's registry renders no sponsored links", () => {
    expect(COMMERCIAL_LINKS.some(isAffiliateActive)).toBe(false);
  });
});

describe("event payloads", () => {
  it("names events by relationship", () => {
    expect(eventNameForRelationship("affiliate_active")).toBe("affiliate_click");
    expect(eventNameForRelationship("affiliate_pending")).toBe("merchant_click");
    expect(eventNameForRelationship("direct")).toBe("merchant_click");
  });

  it("carries only allowed, PII-free parameters and no query strings", () => {
    const event = buildCommercialClickEvent({
      link: sample({ url: "https://shop.example.com/x?token=secret" }),
      placement: "buy_duck_options",
      sourcePath: "/newsletter/preferences?token=abc123#top",
    });
    expect(Object.keys(event.params).sort()).toEqual([...ALLOWED_EVENT_PARAMS].sort());
    expect(event.params.source_path).toBe("/newsletter/preferences");
    expect(event.params.destination_host).toBe("shop.example.com");
    const serialized = JSON.stringify(event.params);
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("@");
    expect(serialized).not.toContain("?");
  });

  it("normalizes unknown paths", () => {
    expect(safeSourcePath(undefined)).toBe("(unknown)");
    expect(safeSourcePath("?a=b")).toBe("/");
  });
});

describe("tracking never blocks navigation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("swallows a throwing gtag", () => {
    const gtag = vi.fn(() => {
      throw new Error("blocked");
    });
    vi.stubGlobal("window", {
      location: { pathname: "/buy/where-to-buy-duck-online", search: "" },
      dataLayer: [],
      gtag,
    });
    expect(() =>
      trackCommercialClick({ link: sample({ id: "safe-click" }), placement: "test" }),
    ).not.toThrow();
  });

  it("no-ops without a browser", () => {
    expect(() =>
      trackCommercialClick({ link: sample({ id: "ssr" }), placement: "test" }),
    ).not.toThrow();
  });
});

describe("placements and journeys", () => {
  it("references registered ids on real routes", () => {
    for (const placement of COMMERCIAL_PLACEMENTS) {
      expect(placement.linkIds.length).toBeGreaterThan(0);
      for (const id of placement.linkIds) expect(commercialLinkById(id)).toBeDefined();
      expect(placement.path.startsWith("/")).toBe(true);
    }
  });

  it("covers the three commercial journeys", () => {
    const paths = COMMERCIAL_PLACEMENTS.map((p) => p.path);
    expect(paths).toContain("/buy/where-to-buy-duck-online");
    expect(paths).toContain("/cook/how-to-cook-duck-breast");
    expect(paths).toContain("/learn/duck-breast-temperature-doneness");
  });

  it("gives duck-breast readers a sourcing step and a thermometer step", () => {
    const breast = COMMERCIAL_PLACEMENTS.find((p) => p.path === "/cook/how-to-cook-duck-breast");
    expect(breast).toBeDefined();
    const categories = breast!.linkIds.map((id) => commercialLinkById(id)!.category);
    expect(categories).toContain("duck_source");
    expect(categories).toContain("thermometer");
  });

  it("derives hosts without www", () => {
    expect(destinationHost("https://www.dartagnan.com/")).toBe("dartagnan.com");
    expect(destinationHost("not a url")).toBe("");
  });
});
