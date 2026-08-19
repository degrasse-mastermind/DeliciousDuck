import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * PostHog lazy initialization across SPA state transitions.
 *
 * The SDK is fully mocked: these tests assert init/capture counts for public
 * direct loads, internal direct loads, and both transition directions.
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

function pageViews() {
  return sdk.capture.mock.calls.filter((call) => call[0] === "$pageview");
}

beforeEach(() => {
  for (const fn of Object.values(sdk)) fn.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("public direct load", () => {
  it("initializes once and captures exactly one pageview", async () => {
    setLocation("deliciousduck.com", "/");
    const ph = await loadModule();
    ph.initPostHog("/");
    ph.initPostHog("/");
    ph.capturePostHogPageView("/");
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(pageViews()).toHaveLength(1);
  });
});

describe("internal direct load", () => {
  it("stays silent on the blocked route", async () => {
    setLocation("deliciousduck.com", "/internal/growth-dashboard");
    const ph = await loadModule();
    ph.initPostHog("/internal/growth-dashboard");
    ph.syncPostHogRoutePolicy("/internal/growth-dashboard");
    ph.capturePostHogPageView("/internal/growth-dashboard");
    ph.captureEvent("affiliate_click", { merchant: "amazon" });
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.capture).not.toHaveBeenCalled();
  });

  it("initializes lazily exactly once when the session reaches a public route", async () => {
    setLocation("deliciousduck.com", "/internal/growth-dashboard");
    const ph = await loadModule();
    ph.initPostHog("/internal/growth-dashboard");
    expect(sdk.init).not.toHaveBeenCalled();

    // SPA navigation to the home page.
    setLocation("deliciousduck.com", "/");
    ph.syncPostHogRoutePolicy("/");
    ph.initPostHog("/");
    ph.capturePostHogPageView("/");
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(pageViews()).toHaveLength(1);
    // No suspend/restore churn happened, so no config thrash and no
    // persistent opt-out state.
    expect(sdk.set_config).not.toHaveBeenCalled();

    // Next public navigation: no second init, one more pageview.
    setLocation("deliciousduck.com", "/recipes");
    ph.syncPostHogRoutePolicy("/recipes");
    ph.initPostHog("/recipes");
    ph.capturePostHogPageView("/recipes");
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(pageViews()).toHaveLength(2);
  });
});

describe("public -> internal -> public", () => {
  it("suspends and restores without re-initializing", async () => {
    setLocation("deliciousduck.com", "/");
    const ph = await loadModule();
    ph.initPostHog("/");
    ph.capturePostHogPageView("/");

    setLocation("deliciousduck.com", "/internal/revenue-switchboard");
    ph.syncPostHogRoutePolicy("/internal/revenue-switchboard");
    ph.initPostHog("/internal/revenue-switchboard");
    ph.capturePostHogPageView("/internal/revenue-switchboard");
    expect(sdk.stopSessionRecording).toHaveBeenCalledTimes(1);
    expect(pageViews()).toHaveLength(1);

    setLocation("deliciousduck.com", "/gear/best-pan-for-duck-breast");
    ph.syncPostHogRoutePolicy("/gear/best-pan-for-duck-breast");
    ph.initPostHog("/gear/best-pan-for-duck-breast");
    ph.capturePostHogPageView("/gear/best-pan-for-duck-breast");
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.startSessionRecording).not.toHaveBeenCalled();
    expect(sdk.stopSessionRecording).toHaveBeenCalledTimes(2);
    expect(pageViews()).toHaveLength(2);
  });
});
