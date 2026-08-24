/**
 * Measurement closure sprint — event contracts, path normalization, visibility
 * rules, QA exclusion, seasonal scheduling, and the surfaces that use them.
 *
 * These are contract tests, not vanity coverage: each one fails if a future edit
 * could inflate a count, leak PII into an event, or resurrect the duplicated
 * homepage heading.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import {
  DESTINATION_TYPES,
  IMPRESSION_EVENTS,
  IMPRESSION_PROPERTY_ALLOWLIST,
  MODULE_PLACEMENTS,
  MODULE_TYPES,
  NEWSLETTER_ERROR_TYPES,
  buildImpressionEvent,
  contentSlugFrom,
  contentTypeFromPath,
  impressionDedupeKey,
  isMeaningfullyVisible,
  markImpressionOnce,
  normalizeEventPath,
  resetImpressionDedupeForTests,
} from "@/lib/impression-events";
import {
  QA_EXCLUSION_KEY,
  QA_EXCLUSION_PARAM,
  QA_EXCLUSION_VALUE,
  qaToggleFromSearch,
} from "@/lib/qa-exclusion";
import {
  SEASONAL_PROMOTIONS,
  activeSeasonalPromotion,
  isPromotionActive,
  isValidPromotion,
  seasonalPromotionPlacementIds,
} from "@/data/seasonal-promotions";
import { allConversionPlacementIds } from "@/data/conversion-paths";

const newsletterSource = readFileSync("src/components/site/NewsletterSignup.tsx", "utf8");
const homeSource = readFileSync("src/routes/index.tsx", "utf8");
const headerSource = readFileSync("src/components/site/Header.tsx", "utf8");
const gateSource = readFileSync("src/lib/analytics-gate.ts", "utf8");
const rootSource = readFileSync("src/routes/__root.tsx", "utf8");

beforeEach(() => {
  resetImpressionDedupeForTests();
});

describe("event contracts", () => {
  it("names exactly the impression + newsletter funnel events", () => {
    expect(Object.values(IMPRESSION_EVENTS)).toEqual([
      "newsletter_offer_view",
      "newsletter_form_start",
      "newsletter_form_error",
      "conversion_module_view",
      // Double opt-in funnel: asked-for confirmation, then the real conversion.
      "newsletter_confirm_required",
      "newsletter_confirmed",
    ]);
  });

  it("drops any property outside the per-event allowlist", () => {
    const built = buildImpressionEvent("newsletter_offer_view", {
      placement: "home_field_guide_module",
      sourcePath: "/",
      // Not allowed on this event — must not appear.
      moduleType: "newsletter_offer",
      errorType: "server",
    });
    expect(Object.keys(built.params).sort()).toEqual([
      "content_slug",
      "content_type",
      "placement",
      "source_path",
    ]);
  });

  it("only ever emits a categorical error_type", () => {
    for (const type of NEWSLETTER_ERROR_TYPES) {
      const built = buildImpressionEvent("newsletter_form_error", {
        placement: "p",
        sourcePath: "/learn/x",
        errorType: type,
      });
      expect(built.params["error_type"]).toBe(type);
    }
    const bogus = buildImpressionEvent("newsletter_form_error", {
      placement: "p",
      sourcePath: "/learn/x",
      errorType: "cat@example.com" as never,
    });
    expect(bogus.params["error_type"]).toBeUndefined();
  });

  it("carries module taxonomy on conversion_module_view only", () => {
    const built = buildImpressionEvent("conversion_module_view", {
      placement: MODULE_PLACEMENTS.homeIntentSelector,
      sourcePath: "/",
      moduleType: "intent_selector",
      destinationType: "internal",
      intent: "sourcing",
    });
    expect(built.params["module_type"]).toBe("intent_selector");
    expect(built.params["destination_type"]).toBe("internal");
    expect(MODULE_TYPES).toContain("seasonal_banner");
    expect(DESTINATION_TYPES).toContain("merchant");
  });

  it("mirrors the GA4 allowlist in PostHog", () => {
    const posthogSource = readFileSync("src/lib/posthog.ts", "utf8");
    expect(posthogSource).toContain("IMPRESSION_PROPERTY_ALLOWLIST");
    expect(Object.keys(IMPRESSION_PROPERTY_ALLOWLIST)).toHaveLength(
      Object.values(IMPRESSION_EVENTS).length,
    );
  });
});

describe("path normalization", () => {
  it("strips query strings and hashes", () => {
    expect(normalizeEventPath("/learn/x?email=a@b.com#top")).toBe("/learn/x");
    expect(normalizeEventPath("/?utm_source=news")).toBe("/");
  });

  it("derives coarse content type and slug", () => {
    expect(contentTypeFromPath("/recipes/duck-a-lorange")).toBe("recipes");
    expect(contentSlugFrom("/recipes/duck-a-lorange")).toBe("duck-a-lorange");
    expect(contentTypeFromPath("/")).toBe("home");
    expect(contentSlugFrom("/")).toBe("home");
  });

  it("never lets a raw email reach a payload", () => {
    const built = buildImpressionEvent("newsletter_form_error", {
      placement: "p",
      sourcePath: "/subscribe?email=cook@example.com",
      errorType: "invalid_format",
    });
    expect(JSON.stringify(built.params)).not.toContain("@");
  });
});

describe("session deduplication", () => {
  it("emits once per event + placement + path", () => {
    const key = impressionDedupeKey("conversion_module_view", "m", "/?x=1");
    expect(markImpressionOnce(key)).toBe(true);
    expect(markImpressionOnce(key)).toBe(false);
    // Same module on a different page is a separate impression.
    expect(markImpressionOnce(impressionDedupeKey("conversion_module_view", "m", "/learn/x"))).toBe(
      true,
    );
  });

  it("treats query-string variants of one page as the same impression", () => {
    expect(markImpressionOnce(impressionDedupeKey("newsletter_offer_view", "m", "/?a=1"))).toBe(
      true,
    );
    expect(markImpressionOnce(impressionDedupeKey("newsletter_offer_view", "m", "/?a=2"))).toBe(
      false,
    );
  });
});

describe("visibility rule", () => {
  const box = (elementHeight: number, visibleHeight: number, viewportHeight = 800) => ({
    intersectionRatio: visibleHeight / elementHeight,
    visibleHeight,
    elementHeight,
    viewportHeight,
  });

  it("fires a short module at 35% visible", () => {
    expect(isMeaningfullyVisible(box(400, 140))).toBe(true);
  });

  it("does not fire a short module barely peeking in", () => {
    expect(isMeaningfullyVisible(box(400, 40))).toBe(false);
  });

  it("fires a tall module on the 180px band even below 35%", () => {
    const input = box(2000, 200);
    expect(input.intersectionRatio).toBeLessThan(0.35);
    expect(isMeaningfullyVisible(input)).toBe(true);
  });
});

describe("QA exclusion", () => {
  it("reads the documented query parameter in both directions", () => {
    expect(qaToggleFromSearch(`?${QA_EXCLUSION_PARAM}=1`)).toBe("on");
    expect(qaToggleFromSearch(`?${QA_EXCLUSION_PARAM}=0`)).toBe("off");
    expect(qaToggleFromSearch("?other=1")).toBeNull();
  });

  it("suppresses the gate and the pre-tag bootstrap", () => {
    expect(gateSource).toContain("qaExclusionActive()");
    // The bootstrap serializes the shared constants rather than restating them.
    expect(gateSource).toContain("JSON.stringify(QA_EXCLUSION_KEY)");
    expect(gateSource).toContain("JSON.stringify(QA_EXCLUSION_VALUE)");
    expect(QA_EXCLUSION_KEY).toBe("dd_analytics_optout");
    expect(QA_EXCLUSION_VALUE).toBe("1");
    // The bootstrap must consult exclusion before injecting gtag.
    expect(gateSource.indexOf("qaExcluded")).toBeLessThan(gateSource.indexOf("var hostOk"));
    expect(rootSource).toContain("qaExclusionBootstrapScript()");
    expect(rootSource).toContain("syncQaExclusionFromLocation()");
  });
});

describe("seasonal promotions", () => {
  const promotion = SEASONAL_PROMOTIONS[0]!;

  it("keeps every record valid and internally destined", () => {
    for (const record of SEASONAL_PROMOTIONS) {
      expect(isValidPromotion(record)).toBe(true);
      expect(record.destination.startsWith("/")).toBe(true);
      expect(record.destination).not.toMatch(/https?:/);
    }
  });

  it("renders nothing before the window opens or after it closes", () => {
    expect(isPromotionActive(promotion, new Date("2026-01-01T00:00:00Z"))).toBe(false);
    expect(isPromotionActive(promotion, new Date("2027-01-01T00:00:00Z"))).toBe(false);
    expect(activeSeasonalPromotion(new Date("2027-01-01T00:00:00Z"))).toBeNull();
  });

  it("is active inside the configured window", () => {
    expect(isPromotionActive(promotion, new Date("2026-11-20T12:00:00Z"))).toBe(true);
    expect(activeSeasonalPromotion(new Date("2026-11-20T12:00:00Z"))?.id).toBe(promotion.id);
  });

  it("keeps the approved placement registered", () => {
    expect(seasonalPromotionPlacementIds()).toEqual(["home_announcement_thanksgiving_hub"]);
    expect(allConversionPlacementIds()).toContain("home_announcement_thanksgiving_hub");
    expect(promotion.placement).toBe(MODULE_PLACEMENTS.seasonalBanner);
  });
});

describe("instrumented surfaces", () => {
  it("measures the newsletter funnel without touching the address", () => {
    expect(newsletterSource).toContain("trackNewsletterOfferView");
    expect(newsletterSource).toContain("trackNewsletterFormStart");
    expect(newsletterSource).toContain('errorType: "invalid_format"');
    expect(newsletterSource).toContain("classifyFailure(cause)");
    // The email value is never handed to an analytics helper.
    expect(newsletterSource).not.toMatch(/track[A-Za-z]*\({[^}]*email/);
  });

  it("wraps the high-value homepage modules exactly once each", () => {
    // Intent selector, Field Guide offer, buying-and-gear cards.
    expect(homeSource.match(/<ModuleImpression/g)).toHaveLength(3);
    expect(homeSource).toContain("MODULE_PLACEMENTS.homeIntentSelector");
    expect(homeSource).toContain("MODULE_PLACEMENTS.homeNewsletterOffer");
    expect(homeSource).toContain("MODULE_PLACEMENTS.homeCommerceCards");
  });

  it("exposes one accessible H2 for the buying and gear section", () => {
    expect(homeSource).not.toContain('id="shop-heading" className="sr-only"');
    expect(homeSource).toContain('aria-labelledby="shop-heading"');
    expect(homeSource).toContain('id="shop-heading"');
    expect(homeSource).toContain('Buying Duck & Equipping the Duck Kitchen');
    expect(homeSource.match(/<h1/g) ?? []).toHaveLength(1);
  });

  it("lets keyboard users escape the expandable search", () => {
    expect(headerSource).toContain('event.key === "Escape"');
    expect(headerSource).toContain("searchToggleRef.current?.focus()");
    // Inline expansion, not a dialog: no trap that would block Tab.
    expect(headerSource).not.toContain("aria-modal");
  });
});
