import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildPartnerInquiryClickEvent,
  isPartnerPlacement,
  PARTNER_EVENTS,
  PARTNER_INQUIRY_CLICK_PARAMS,
  PARTNER_PROPERTY_ALLOWLIST,
} from "@/lib/partner-events";
import { ANALYTICS_EVENTS } from "@/lib/analytics";
import { sitemapPaths } from "@/lib/sitemap";
import { LEGAL_LINKS } from "@/data/site";

const route = readFileSync("src/routes/partners.tsx", "utf8");

describe("partner_inquiry_click contract", () => {
  it("exposes one stable event name", () => {
    expect(PARTNER_EVENTS.inquiryClick).toBe("partner_inquiry_click");
    expect(ANALYTICS_EVENTS.partnerInquiryClick).toBe("partner_inquiry_click");
  });

  it("allows exactly one property", () => {
    expect([...PARTNER_INQUIRY_CLICK_PARAMS]).toEqual(["placement"]);
    expect(PARTNER_PROPERTY_ALLOWLIST["partner_inquiry_click"]).toEqual(["placement"]);
  });

  it("builds a payload containing only the placement", () => {
    const event = buildPartnerInquiryClickEvent({ placement: "partners_offer" });
    expect(event).not.toBeNull();
    expect(event!.name).toBe("partner_inquiry_click");
    expect(Object.keys(event!.params)).toEqual(["placement"]);
    expect(event!.params.placement).toBe("partners_offer");
  });

  it("rejects placements outside the allowlist", () => {
    for (const bad of ["", "hero", "hello@deliciousduck.com", "/partners?x=1", "brand-name"]) {
      expect(isPartnerPlacement(bad), bad).toBe(false);
      expect(buildPartnerInquiryClickEvent({ placement: bad }), bad).toBeNull();
    }
  });
});

describe("/partners page contract", () => {
  it("is a canonical, sitemap-eligible route", () => {
    expect(sitemapPaths()).toContain("/partners");
    expect(route).toContain('path: "/partners"');
  });

  it("has exactly one H1, provided by the shared page header", () => {
    expect(route).toContain("<PageHeader");
    expect(route).not.toContain("<h1");
  });

  it("prefills the inquiry mailto with subject and body only", () => {
    expect(route).toContain("mailto:${EMAIL}?subject=${subject}&body=${body}");
    expect(route).toContain('encodeURIComponent("Founding Partnership Inquiry — [Brand Name]")');
    for (const field of ["Brand / company:", "Website:", "Desired timing:"]) {
      expect(route).toContain(field);
    }
  });

  it("sends no brand, contact, or message data to analytics", () => {
    expect(route).toContain("trackPartnerInquiryClick({ placement })");
    expect(route).not.toMatch(/trackPartnerInquiryClick\(\{[^}]*(email|brand|message|url)/i);
  });

  it("makes no guarantee or personal-testing claims", () => {
    expect(route).toContain("No guaranteed traffic, rankings, or sales");
    expect(route).toContain("cannot buy rankings");
    expect(route).not.toMatch(/\bwe tested\b/i);
  });

  it("is linked from the footer's about grouping, not consumer navigation", () => {
    expect(LEGAL_LINKS).toEqual(
      expect.arrayContaining([{ label: "Partner With Us", to: "/partners" }]),
    );
    expect(readFileSync("src/components/site/Header.tsx", "utf8")).not.toContain("/partners");
  });
});
