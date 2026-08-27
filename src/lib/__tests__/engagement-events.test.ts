import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  COMMERCIAL_PAGE_VIEW_PARAMS,
  ENGAGEMENT_EVENTS,
  LEAD_MAGNET_DOWNLOAD_PARAMS,
  OUTBOUND_SOCIAL_CLICK_PARAMS,
  assetFormatForPath,
  buildCommercialPageViewEvent,
  buildLeadMagnetDownloadEvent,
  buildOutboundSocialClickEvent,
  classifyCommercialRoute,
  hostForUrl,
  isCommercialRoute,
  safePath,
  slugForPath,
} from "@/lib/engagement-events";
import {
  ANALYTICS_EVENTS,
  resetCommercialPageViewDedupe,
  trackCommercialPageView,
  trackLeadMagnetDownload,
  trackOutboundSocialClick,
} from "@/lib/analytics";
import { COMMERCIAL_EVENTS } from "@/lib/commercial-events";
import { SOCIAL_LINKS } from "@/data/social-links";
import { FIELD_GUIDE } from "@/data/starter-guide";

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

/** Values that must never appear in any analytics payload. */
const PII_SHAPED = [
  "cook@example.com",
  "?t=opaque-mailbox-token",
  "utm_campaign=welcome",
  "subscriber-id-1234",
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  resetCommercialPageViewDedupe();
});

/** Capture gtag calls without a browser. */
function captureEvents() {
  const calls: Array<{ name: string; params: Record<string, unknown> }> = [];
  const gtag = vi.fn((kind: string, name: string, params: Record<string, unknown>) => {
    if (kind === "event") calls.push({ name, params });
  });
  vi.stubGlobal("window", {
    gtag,
    dataLayer: [],
    // Canonical production host: analytics only emit on deliciousduck.com.
    location: {
      hostname: "deliciousduck.com",
      pathname: "/buy/where-to-buy-duck-online",
      search: "",
      origin: "https://deliciousduck.com",
    },
  });
  return calls;
}

describe("event names are stable and additive", () => {
  it("uses the exact required snake_case names", () => {
    expect(ENGAGEMENT_EVENTS.commercialPageView).toBe("commercial_page_view");
    expect(ENGAGEMENT_EVENTS.leadMagnetDownload).toBe("lead_magnet_download");
    expect(ENGAGEMENT_EVENTS.outboundSocialClick).toBe("outbound_social_click");
  });

  it("registers the new events in the shared analytics event map", () => {
    expect(ANALYTICS_EVENTS.commercialPageView).toBe("commercial_page_view");
    expect(ANALYTICS_EVENTS.leadMagnetDownload).toBe("lead_magnet_download");
    expect(ANALYTICS_EVENTS.outboundSocialClick).toBe("outbound_social_click");
  });

  it("does not change existing outbound-commerce event meanings", () => {
    expect(COMMERCIAL_EVENTS.merchantClick).toBe("merchant_click");
    expect(COMMERCIAL_EVENTS.affiliateClick).toBe("affiliate_click");
    expect(ANALYTICS_EVENTS.newsletterSignup).toBe("newsletter_signup");
  });
});

describe("path and host normalization", () => {
  it("strips query strings and hashes", () => {
    expect(safePath("/buy/how-to-choose-duck?utm_campaign=welcome")).toBe(
      "/buy/how-to-choose-duck",
    );
    expect(safePath("/newsletter/unsubscribe?t=secret#done")).toBe("/newsletter/unsubscribe");
    expect(safePath("/gear#top")).toBe("/gear");
    expect(safePath(undefined)).toBe("(unknown)");
    expect(safePath("")).toBe("(unknown)");
  });

  it("derives slugs from the normalized path only", () => {
    expect(slugForPath("/gear/best-pan-for-duck-breast?x=1")).toBe("best-pan-for-duck-breast");
    expect(slugForPath("/")).toBe("home");
  });

  it("reduces destinations to a bare host", () => {
    expect(hostForUrl("https://www.example.com/profile?ref=abc")).toBe("example.com");
    expect(hostForUrl("not-a-url")).toBe("(invalid)");
  });
});

describe("commercial_page_view", () => {
  it("classifies commercial routes and ignores everything else", () => {
    expect(classifyCommercialRoute("/buy")).toEqual({
      contentType: "buy_duck",
      surface: "buying_guides",
    });
    expect(classifyCommercialRoute("/gear/best-thermometer-for-duck")).toEqual({
      contentType: "gear",
      surface: "gear_guides",
    });
    expect(classifyCommercialRoute("/ingredients/orange-with-duck")).toEqual({
      contentType: "ingredients",
      surface: "ingredient_guides",
    });
    for (const path of ["/", "/cook/whole-roast-duck", "/tools", "/search", "/privacy"]) {
      expect(classifyCommercialRoute(path)).toBeNull();
    }
  });

  it("never classifies internal routes as commercial", () => {
    expect(isCommercialRoute("/internal/commercial-links")).toBe(false);
  });

  it("builds only allowlisted parameters", () => {
    const event = buildCommercialPageViewEvent({
      path: "/buy/duck-fat-buying-guide?utm_campaign=welcome#buy",
    });
    expect(event).not.toBeNull();
    expect(event!.name).toBe("commercial_page_view");
    expect(Object.keys(event!.params).sort()).toEqual([...COMMERCIAL_PAGE_VIEW_PARAMS].sort());
    expect(event!.params).toEqual({
      page_path: "/buy/duck-fat-buying-guide",
      source_path: "/buy/duck-fat-buying-guide",
      content_type: "buy_duck",
      content_slug: "duck-fat-buying-guide",
      commercial_surface: "buying_guides",
    });
  });

  it("returns null for non-commercial routes", () => {
    expect(buildCommercialPageViewEvent({ path: "/cook/duck-leg-confit" })).toBeNull();
    expect(buildCommercialPageViewEvent({ path: undefined })).toBeNull();
  });

  it("fires once per navigation and suppresses replay for the same navigation", () => {
    const calls = captureEvents();
    const only = () => calls.filter((c) => c.name === "commercial_page_view");
    // Initial hydration + StrictMode/effect replay for the same navigation.
    trackCommercialPageView({ path: "/gear/best-pan-for-duck-breast" });
    trackCommercialPageView({ path: "/gear/best-pan-for-duck-breast" });
    // Same normalized path with a query string is still the same navigation.
    trackCommercialPageView({ path: "/gear/best-pan-for-duck-breast?utm_medium=email" });
    expect(only()).toHaveLength(1);

    // A later SPA navigation into another commercial route.
    trackCommercialPageView({ path: "/buy/fresh-vs-frozen-duck" });
    expect(only()).toHaveLength(2);
  });

  it("emits A, B, A for a legitimate return navigation", () => {
    const calls = captureEvents();
    const paths = () =>
      calls.filter((c) => c.name === "commercial_page_view").map((c) => c.params["page_path"]);
    trackCommercialPageView({ path: "/buy/fresh-vs-frozen-duck" });
    trackCommercialPageView({ path: "/gear/best-pan-for-duck-breast" });
    trackCommercialPageView({ path: "/buy/fresh-vs-frozen-duck" });
    expect(paths()).toEqual([
      "/buy/fresh-vs-frozen-duck",
      "/gear/best-pan-for-duck-breast",
      "/buy/fresh-vs-frozen-duck",
    ]);
  });

  it("re-emits after a detour through a non-commercial route", () => {
    const calls = captureEvents();
    const only = () => calls.filter((c) => c.name === "commercial_page_view");
    trackCommercialPageView({ path: "/buy/fresh-vs-frozen-duck" });
    trackCommercialPageView({ path: "/tools/recipe-scaler" });
    trackCommercialPageView({ path: "/buy/fresh-vs-frozen-duck" });
    expect(only()).toHaveLength(2);
  });

  it("emits nothing for a non-commercial route, even on replay", () => {
    const calls = captureEvents();
    trackCommercialPageView({ path: "/tools/recipe-scaler" });
    trackCommercialPageView({ path: "/tools/recipe-scaler" });
    expect(calls).toHaveLength(0);
  });


  it("is wired to client route changes in the root route, separate from page_view", () => {
    const root = read("src/routes/__root.tsx");
    expect(root).toContain("trackCommercialPageView({ path: pathname })");
    // The automatic first page_view and the SPA page_view path are untouched.
    expect(root).toContain("trackPageView(pathname");
    expect(root).toContain("firstView.current");
  });
});

describe("lead_magnet_download", () => {
  it("builds only allowlisted parameters", () => {
    const event = buildLeadMagnetDownloadEvent({
      assetId: "duck-fundamentals-field-guide",
      assetPath: FIELD_GUIDE.path,
      placement: "field-guide_postsignup",
      sourcePath: "/cook/how-to-cook-duck-breast?utm_campaign=welcome",
    });
    expect(event.name).toBe("lead_magnet_download");
    expect(Object.keys(event.params).sort()).toEqual([...LEAD_MAGNET_DOWNLOAD_PARAMS].sort());
    expect(event.params).toEqual({
      asset_id: "duck-fundamentals-field-guide",
      asset_format: "pdf",
      placement: "field-guide_postsignup",
      source_path: "/cook/how-to-cook-duck-breast",
      content_slug: "how-to-cook-duck-breast",
      lead_magnet_name: "duck_the_fundamentals",
      lead_magnet_version: 2,
      lead_magnet_pages: 28,
    });
  });

  it("derives asset_format from the asset path", () => {
    expect(assetFormatForPath("/downloads/guide.pdf")).toBe("pdf");
    expect(assetFormatForPath("/downloads/guide.PDF?v=2")).toBe("pdf");
    expect(assetFormatForPath("/downloads/guide")).toBe("file");
  });

  it("fires once per click burst and carries no PII", () => {
    const calls = captureEvents();
    trackLeadMagnetDownload({
      assetId: "duck-fundamentals-field-guide",
      assetPath: FIELD_GUIDE.path,
      placement: "field-guide_postsignup",
    });
    trackLeadMagnetDownload({
      assetId: "duck-fundamentals-field-guide",
      assetPath: FIELD_GUIDE.path,
      placement: "field-guide_postsignup",
    });
    const sent = calls.filter((c) => c.name === "lead_magnet_download");
    expect(sent).toHaveLength(1);
    const serialized = JSON.stringify(sent[0]!.params);
    for (const bad of PII_SHAPED) expect(serialized).not.toContain(bad);
    expect(serialized).not.toContain("@");
  });

  it("covers every live PDF entry point through the shared tracked link", () => {
    // Audit: the post-signup button is the only rendered download surface.
    const surfaces = ["src/components/site/NewsletterSignup.tsx"];
    for (const file of surfaces) {
      const src = read(file);
      expect(src).toContain("LeadMagnetDownloadLink");
      // No ad hoc anchor pointing straight at the PDF path.
      expect(src).not.toContain("href={FIELD_GUIDE.path}");
    }
    const helper = read("src/components/site/TrackedLinks.tsx");
    expect(helper).toContain("trackLeadMagnetDownload");
  });
});

describe("outbound_social_click", () => {
  it("builds only allowlisted parameters and host-only destinations", () => {
    const event = buildOutboundSocialClickEvent({
      platform: "instagram",
      url: "https://www.instagram.com/example/?hl=en",
      placement: "footer",
      sourcePath: "/?utm_campaign=welcome",
    });
    expect(event.name).toBe("outbound_social_click");
    expect(Object.keys(event.params).sort()).toEqual([...OUTBOUND_SOCIAL_CLICK_PARAMS].sort());
    expect(event.params).toEqual({
      platform: "instagram",
      placement: "footer",
      destination_host: "instagram.com",
      source_path: "/",
    });
  });

  it("fires once per click burst", () => {
    const calls = captureEvents();
    const args = {
      platform: "youtube",
      url: "https://www.youtube.com/@example",
      placement: "footer",
    };
    trackOutboundSocialClick(args);
    trackOutboundSocialClick(args);
    expect(calls.filter((c) => c.name === "outbound_social_click")).toHaveLength(1);
  });

  it("invents no social URLs while no public profile exists", () => {
    expect(SOCIAL_LINKS).toHaveLength(0);
    const registry = read("src/data/social-links.ts");
    for (const host of ["instagram.com", "youtube.com", "facebook.com", "tiktok.com", "x.com"]) {
      expect(registry).not.toContain(`https://${host}`);
    }
  });
});
