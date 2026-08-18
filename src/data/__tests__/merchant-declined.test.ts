import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  MERCHANTS,
  activationReadiness,
  isDeclined,
  isMonetized,
  isPendingApproval,
  merchantById,
  resolveCommerceLink,
  type Merchant,
} from "@/data/affiliates";
import { commercialLinkById, relationshipForMerchant } from "@/data/commercial-links";
import { revenueSummary, DEEP_LINKS } from "@/data/revenue";

const read = (p: string) => readFileSync(p, "utf8");

const declinedFixture = (over: Partial<Merchant> = {}): Merchant => ({
  id: "fixture",
  name: "Fixture Merchant",
  status: "declined",
  directUrl: "https://example.com/",
  statusReviewed: "2026-08",
  activation: {
    approvalConfirmed: true,
    termsReviewed: true,
    trackingUrlPresent: true,
    testClickComplete: true,
    disclosureVerified: true,
    ga4AffiliateVerified: true,
  },
  ...over,
});

describe("declined merchant state", () => {
  it("is never monetized or pending, even with every gate ticked", () => {
    const merchant = declinedFixture();
    expect(isDeclined(merchant)).toBe(true);
    expect(isMonetized(merchant)).toBe(false);
    expect(isPendingApproval(merchant)).toBe(false);
  });

  it("reads as declined in readiness, never ready-to-activate or live", () => {
    const readiness = activationReadiness(declinedFixture());
    expect(readiness.level).toBe("declined");
    expect(readiness.label).toMatch(/declined/i);
    expect(readiness.nextAction).not.toMatch(/wait for|approval is read|set status: "active"/i);
  });

  it("cannot be monetized even if an affiliate URL is somehow present", () => {
    const merchant = declinedFixture({ affiliateUrl: "https://tracking.example.com/x" });
    expect(isMonetized(merchant)).toBe(false);
    expect(activationReadiness(merchant).level).toBe("declined");
    const link = resolveCommerceLink({ merchantId: merchant.id, directUrl: merchant.directUrl });
    expect(link.isAffiliate).toBe(false);
  });

  it("maps to a plain direct commercial relationship", () => {
    expect(relationshipForMerchant(declinedFixture())).toBe("direct");
  });
});

describe("ThermoWorks registry row", () => {
  const thermoworks = merchantById("thermoworks")!;

  it("records the declined decision truthfully with no affiliate URL", () => {
    expect(thermoworks.status).toBe("declined");
    expect(thermoworks.statusReviewed).toBe("2026-08");
    expect(thermoworks.declinedDate).toBe("2026-08");
    expect(thermoworks.affiliateUrl).toBeUndefined();
    expect(thermoworks.approvalDate).toBeUndefined();
    expect(thermoworks.directUrl).toBe("https://www.thermoworks.com/");
  });

  it("keeps the historical application facts in the internal note", () => {
    expect(thermoworks.internalNote).toMatch(/declined without a stated reason/i);
    expect(thermoworks.internalNote).toMatch(/submitted/i);
    expect(thermoworks.internalNote).toMatch(/site-verification/i);
  });

  it("renders as a direct link with an earn-nothing disclosure", () => {
    const link = commercialLinkById("thermoworks-thermometer")!;
    expect(link.relationship).toBe("direct");
    expect(link.disclosureLabel).toBe("Direct link to the seller");
    expect(link.url).toBe("https://www.thermoworks.com/");
  });

  it("is excluded from pending and reported as declined in the switchboard summary", () => {
    const summary = revenueSummary();
    expect(summary.pendingMerchants).not.toContain("ThermoWorks");
    expect(summary.declinedMerchants).toContain("ThermoWorks");
    // ThermoWorks stays unmonetized even though other programs are now live.
    expect(summary.activeMerchants ?? []).not.toContain("ThermoWorks");
  });

  it("marks the thermometer deep-link slot declined rather than awaiting approval", () => {
    const slot = DEEP_LINKS.find((d) => d.id === "thermometer-thermoworks")!;
    expect(slot.status).toBe("declined");
    expect(slot.affiliateUrl).toBeUndefined();
    expect(slot.note).toMatch(/declined/i);
  });
});

describe("public copy never implies a ThermoWorks relationship", () => {
  const PUBLIC_FILES = [
    "src/routes/gear.best-thermometer-for-duck.tsx",
    "src/routes/gear.index.tsx",
    "src/routes/learn.duck-breast-temperature-doneness.tsx",
    "src/routes/learn.why-duck-skin-isnt-crispy.tsx",
    "src/routes/cook.how-to-cook-duck-breast.tsx",
    "src/data/comparisons.ts",
  ];

  it("makes no approval, partnership, or forthcoming-activation claim", () => {
    for (const file of PUBLIC_FILES) {
      const src = read(file);
      expect(src, file).not.toMatch(
        /(affiliate partner|our partner|approved (?:us|program)|once (?:approved|we are approved)|pending approval|awaiting approval|when (?:the|our) program goes live)/i,
      );
    }
  });

  it("keeps every merchant registry row unmonetized while nothing is active", () => {
    for (const merchant of MERCHANTS) {
      if (isMonetized(merchant)) continue;
      expect(merchant.affiliateUrl).toBeUndefined();
    }
  });
});
