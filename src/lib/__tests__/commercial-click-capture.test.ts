import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Commercial click path: rendered CTA -> trackCommercialClick -> PostHog.
 *
 * A production canary saw PostHog pageviews on /gear/best-roasting-pan-for-duck
 * with zero `affiliate_click` events, so these tests pin the whole handler
 * chain with a fully mocked PostHog SDK:
 *
 *  - both real money CTAs (Amazon roasting pan, US Wellness duck fat) capture
 *    `affiliate_click` with a path-only payload;
 *  - the dedupe window suppresses replays but not a different placement.
 *
 * Note: PostHog's SDK silently drops every request from automated browsers
 * (`navigator.webdriver === true`), so headless end-to-end runs can show no
 * ingestion while this chain is correct. These unit assertions are the
 * authoritative check; see docs/analytics-verification-runbook.md.
 */

const sdk = {
  init: vi.fn(),
  capture: vi.fn(),
  set_config: vi.fn(),
  startSessionRecording: vi.fn(),
  stopSessionRecording: vi.fn(),
};

vi.mock("posthog-js", () => ({ default: sdk }));

const HOST = "deliciousduck.com";

function setLocation(pathname: string) {
  vi.stubGlobal("window", {
    location: { hostname: HOST, pathname, search: "", origin: `https://${HOST}` },
    dataLayer: [],
  });
}

/** Fresh module graph with PostHog initialized on a public route. */
async function loadAnalytics(pathname: string, gtag: (...args: unknown[]) => void) {
  vi.resetModules();
  setLocation(pathname);
  const posthogModule = await import("@/lib/posthog");
  posthogModule.initPostHog(pathname);
  const analytics = await import("@/lib/analytics");
  const links = await import("@/data/commercial-links");
  (window as unknown as { gtag: unknown }).gtag = gtag;
  sdk.capture.mockClear();
  return { analytics, links };
}

function affiliateCaptures() {
  return sdk.capture.mock.calls.filter((call) => call[0] === "affiliate_click");
}

beforeEach(() => {
  for (const fn of Object.values(sdk)) fn.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("commercial click capture", () => {
  it("captures affiliate_click for the Amazon roasting-pan CTA", async () => {
    const gtag = vi.fn();
    const { analytics, links } = await loadAnalytics(
      "/gear/best-roasting-pan-for-duck",
      gtag,
    );
    const link = links.commercialLinkById("amazon-roasting-pan-rack");
    expect(link).toBeDefined();

    analytics.trackCommercialClick({ link: link!, placement: "gear-roasting-pan-primary" });

    const captures = affiliateCaptures();
    expect(captures).toHaveLength(1);
    const params = captures[0]![1] as Record<string, unknown>;
    expect(params["commercial_link_id"]).toBe("amazon-roasting-pan-rack");
    expect(params["placement"]).toBe("gear-roasting-pan-primary");
    expect(params["source_path"]).toBe("/gear/best-roasting-pan-for-duck");
    expect(params["affiliate"]).toBe(true);
    // GA4 receives the same event name.
    expect(gtag.mock.calls.some((call) => call[1] === "affiliate_click")).toBe(true);
  });

  it("captures affiliate_click for the US Wellness duck-fat CTA", async () => {
    const { analytics, links } = await loadAnalytics(
      "/ingredients/duck-fat",
      vi.fn(),
    );
    const link = links.commercialLinkById("us-wellness-duck-fat");
    expect(link).toBeDefined();

    analytics.trackCommercialClick({ link: link!, placement: "duck-fat-buy" });

    const captures = affiliateCaptures();
    expect(captures).toHaveLength(1);
    expect((captures[0]![1] as Record<string, unknown>)["commercial_link_id"]).toBe(
      "us-wellness-duck-fat",
    );
    expect((captures[0]![1] as Record<string, unknown>)["affiliate"]).toBe(true);
  });

  it("captures merchant_click, never affiliate_click, for a direct seller", async () => {
    const { analytics, links } = await loadAnalytics(
      "/buy/where-to-buy-duck-online",
      vi.fn(),
    );
    const link = links.commercialLinkById("culver-duck")!;
    analytics.trackCommercialClick({ link, placement: "buy_duck_primary_options" });
    expect(affiliateCaptures()).toHaveLength(0);
    const merchant = sdk.capture.mock.calls.filter((call) => call[0] === "merchant_click");
    expect(merchant).toHaveLength(1);
    expect((merchant[0]![1] as Record<string, unknown>)["affiliate"]).toBe(false);
  });

  it("sends no PII: payload keys are allowlisted and path-only", async () => {
    const { analytics, links } = await loadAnalytics(
      "/gear/best-roasting-pan-for-duck",
      vi.fn(),
    );
    const link = links.commercialLinkById("amazon-roasting-pan-rack")!;
    analytics.trackCommercialClick({ link, placement: "gear-roasting-pan-primary" });

    const params = affiliateCaptures()[0]![1] as Record<string, unknown>;
    for (const value of Object.values(params)) {
      if (typeof value !== "string") continue;
      expect(value).not.toContain("@");
      expect(value).not.toContain("?");
      expect(value).not.toContain("https://deliciousduck.com");
    }
  });

  it("dedupes an immediate replay but not a second placement", async () => {
    const { analytics, links } = await loadAnalytics(
      "/gear/best-roasting-pan-for-duck",
      vi.fn(),
    );
    const link = links.commercialLinkById("amazon-roasting-pan-rack")!;

    analytics.trackCommercialClick({ link, placement: "gear-roasting-pan-primary" });
    analytics.trackCommercialClick({ link, placement: "gear-roasting-pan-primary" });
    expect(affiliateCaptures()).toHaveLength(1);

    analytics.trackCommercialClick({ link, placement: "gear-roasting-pan-secondary" });
    expect(affiliateCaptures()).toHaveLength(2);
  });
});

describe("rendered CTA wiring", () => {
  it("CommercialLink attaches an onClick that calls trackCommercialClick", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/site/CommercialLink.tsx"),
      "utf8",
    );
    expect(source).toContain("trackCommercialClick");
    expect(source).toMatch(/onClick=\{/);
    // The anchor must stay a real anchor so the destination is unchanged.
    expect(source).toMatch(/<a\b/);
  });

  it("routes comparison-card CTAs through the same registry-backed taxonomy", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/site/Commerce.tsx"), "utf8");
    expect(source).toContain("trackCommercialClick");
    expect(source).not.toContain("trackAffiliateClick");
  });
});
