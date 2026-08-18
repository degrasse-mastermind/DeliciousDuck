import { describe, expect, it } from "vitest";
import {
  ANALYTICS_BLOCKED_PATH_PREFIXES,
  PRODUCTION_ANALYTICS_HOSTS,
  gtagBootstrapScript,
  isAnalyticsAllowedPath,
  isProductionAnalyticsHost,
  shouldEmitAnalytics,
} from "@/lib/analytics-gate";
import { safePath } from "@/lib/engagement-events";

describe("production analytics host gating", () => {
  it("allows only the canonical public hosts", () => {
    expect(PRODUCTION_ANALYTICS_HOSTS).toEqual(["deliciousduck.com", "www.deliciousduck.com"]);
    for (const host of PRODUCTION_ANALYTICS_HOSTS) {
      expect(isProductionAnalyticsHost(host)).toBe(true);
      expect(isProductionAnalyticsHost(host.toUpperCase())).toBe(true);
    }
  });

  it("rejects preview, editor, localhost and lookalike hosts", () => {
    const blocked = [
      "id-preview--7d297173-9e35-42c7-a3d5-1000d17e9f47.lovable.app",
      "duck-kitchen-quest.lovable.app",
      "lovable.dev",
      "preview.deliciousduck.com",
      "staging.deliciousduck.com",
      "deliciousduck.com.evil.example",
      "localhost",
      "127.0.0.1",
      "",
      undefined,
      null,
    ];
    for (const host of blocked) {
      expect(isProductionAnalyticsHost(host)).toBe(false);
      expect(shouldEmitAnalytics({ hostname: host, path: "/" })).toBe(false);
    }
  });
});

describe("path gating", () => {
  it("blocks internal tooling and raw API paths", () => {
    expect(ANALYTICS_BLOCKED_PATH_PREFIXES).toEqual(["/internal", "/api"]);
    for (const path of [
      "/internal",
      "/internal/growth-dashboard",
      "/internal/revenue-switchboard",
      "/api",
      "/api/generate-sketch",
      "/api/webhooks/resend",
    ]) {
      expect(isAnalyticsAllowedPath(path)).toBe(false);
      expect(shouldEmitAnalytics({ hostname: "deliciousduck.com", path })).toBe(false);
    }
  });

  it("allows public content paths on a canonical host", () => {
    for (const path of [
      "/",
      "/recipes",
      "/recipes/duck-leg-confit",
      "/gear/best-dutch-oven-for-duck-confit",
      "/buy/duck-fat-buying-guide",
      "/tools",
      "/newsletter/unsubscribe",
      "/internally-linked-guide",
    ]) {
      expect(isAnalyticsAllowedPath(path)).toBe(true);
      expect(shouldEmitAnalytics({ hostname: "www.deliciousduck.com", path })).toBe(true);
    }
  });
});

describe("sensitive-data exclusions", () => {
  it("never lets a mailbox token or query string through the path normalizer", () => {
    expect(safePath("/newsletter/unsubscribe?t=secret-token")).toBe("/newsletter/unsubscribe");
    expect(safePath("/newsletter/preferences?t=abc#interests")).toBe("/newsletter/preferences");
  });

  it("gates on the path only, ignoring query strings", () => {
    expect(isAnalyticsAllowedPath("/internal/growth-dashboard?ga_debug=1")).toBe(false);
    expect(isAnalyticsAllowedPath("/recipes?q=duck")).toBe(true);
  });

  it("bootstrap script gates on host and path and never sends a query string", () => {
    const script = gtagBootstrapScript("G-TEST123");
    expect(script).toContain("deliciousduck.com");
    expect(script).toContain("/internal");
    expect(script).toContain("location.origin + path");
    expect(script).not.toContain("location.href");
    expect(script).not.toContain("location.search");
  });
});
