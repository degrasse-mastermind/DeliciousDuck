import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * PostHog SPA route-policy coverage.
 *
 * The SDK is fully mocked: these tests assert which SDK calls the route policy
 * makes for public -> internal -> public transitions, direct internal loads,
 * and noncanonical hosts. No network, no real posthog-js behaviour.
 */

const sdk = {
  init: vi.fn(),
  capture: vi.fn(),
  set_config: vi.fn(),
  startSessionRecording: vi.fn(),
  stopSessionRecording: vi.fn(),
};

vi.mock("posthog-js", () => ({ default: sdk }));

async function loadModule() {
  vi.resetModules();
  return import("@/lib/posthog");
}

function setLocation(hostname: string, pathname: string) {
  vi.stubGlobal("window", {
    location: { hostname, pathname, search: "", origin: `https://${hostname}` },
  });
}

beforeEach(() => {
  for (const fn of Object.values(sdk)) fn.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("initialization gating", () => {
  it("initializes on a canonical production host", async () => {
    setLocation("deliciousduck.com", "/");
    const ph = await loadModule();
    ph.initPostHog();
    expect(sdk.init).toHaveBeenCalledTimes(1);
    const config = sdk.init.mock.calls[0]![1] as Record<string, unknown>;
    expect(config["capture_pageview"]).toBe(false);
    expect(config["autocapture"]).toBe(true);
  });

  it("never initializes on preview or noncanonical hosts", async () => {
    for (const host of [
      "localhost",
      "duck-kitchen-quest.lovable.app",
      "id-preview--7d297173.lovable.app",
      "staging.deliciousduck.com",
    ]) {
      setLocation(host, "/");
      const ph = await loadModule();
      ph.initPostHog();
      ph.syncPostHogRoutePolicy("/");
      ph.captureEvent("affiliate_click", { merchant: "amazon" });
      ph.capturePostHogPageView("/");
      expect(sdk.init, host).not.toHaveBeenCalled();
      expect(sdk.capture, host).not.toHaveBeenCalled();
      expect(sdk.set_config, host).not.toHaveBeenCalled();
      expect(sdk.stopSessionRecording, host).not.toHaveBeenCalled();
      sdk.init.mockClear();
      sdk.capture.mockClear();
      sdk.set_config.mockClear();
      sdk.stopSessionRecording.mockClear();
    }
  });

  it("does not initialize on a direct internal load, even on production", async () => {
    setLocation("deliciousduck.com", "/internal/growth-dashboard");
    const ph = await loadModule();
    ph.initPostHog();
    ph.syncPostHogRoutePolicy("/internal/growth-dashboard");
    ph.capturePostHogPageView("/internal/growth-dashboard");
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.capture).not.toHaveBeenCalled();
  });
});

describe("SPA navigation policy: public -> internal -> public", () => {
  it("suspends automatic capture and recording on internal routes and restores them on return", async () => {
    setLocation("deliciousduck.com", "/");
    const ph = await loadModule();
    ph.initPostHog();

    // Public route: policy already matches the init config, so no churn.
    ph.syncPostHogRoutePolicy("/");
    expect(sdk.set_config).not.toHaveBeenCalled();
    ph.capturePostHogPageView("/");
    expect(sdk.capture).toHaveBeenCalledTimes(1);
    sdk.capture.mockClear();

    // Client-side navigation into internal tooling.
    setLocation("deliciousduck.com", "/internal/growth-dashboard");
    ph.syncPostHogRoutePolicy("/internal/growth-dashboard");
    expect(sdk.set_config).toHaveBeenCalledWith({
      autocapture: false,
      capture_pageleave: false,
      capture_pageview: false,
    });
    expect(sdk.stopSessionRecording).toHaveBeenCalledTimes(1);
    expect(sdk.startSessionRecording).not.toHaveBeenCalled();

    // No pageview or custom event may leave from an internal route.
    ph.capturePostHogPageView("/internal/growth-dashboard");
    ph.captureEvent("newsletter_signup", { placement: "internal" });
    expect(sdk.capture).not.toHaveBeenCalled();

    // Repeated navigation inside /internal does not thrash the SDK.
    sdk.set_config.mockClear();
    ph.syncPostHogRoutePolicy("/internal/commercial-links");
    ph.syncPostHogRoutePolicy("/api/generate-sketch");
    expect(sdk.set_config).not.toHaveBeenCalled();
    expect(sdk.stopSessionRecording).toHaveBeenCalledTimes(1);

    // Back to a public route in the same SPA session.
    setLocation("deliciousduck.com", "/gear/best-roasting-pan-for-duck");
    ph.syncPostHogRoutePolicy("/gear/best-roasting-pan-for-duck");
    expect(sdk.set_config).toHaveBeenLastCalledWith({
      autocapture: true,
      capture_pageleave: true,
      capture_pageview: false,
    });
    expect(sdk.startSessionRecording).toHaveBeenCalledTimes(1);
    ph.capturePostHogPageView("/gear/best-roasting-pan-for-duck");
    expect(sdk.capture).toHaveBeenCalledTimes(1);
  });

  it("uses no persistent cross-session opt-out API", async () => {
    setLocation("deliciousduck.com", "/");
    const ph = await loadModule();
    ph.initPostHog();
    ph.syncPostHogRoutePolicy("/internal/growth-dashboard");
    expect(sdk).not.toHaveProperty("opt_out_capturing.mock");
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync("src/lib/posthog.ts", "utf8"),
    );
    expect(source).not.toMatch(/opt_out_capturing|opt_in_capturing/);
  });
});

describe("PII exclusions survive the policy sync", () => {
  it("sends path-only pageviews and never a query string", async () => {
    setLocation("deliciousduck.com", "/newsletter/unsubscribe");
    const ph = await loadModule();
    ph.initPostHog();
    ph.syncPostHogRoutePolicy("/newsletter/unsubscribe");
    ph.capturePostHogPageView("/newsletter/unsubscribe?t=opaque-mailbox-token");
    const serialized = JSON.stringify(sdk.capture.mock.calls);
    expect(serialized).not.toContain("opaque-mailbox-token");
    expect(serialized).not.toContain("?t=");
  });
});
