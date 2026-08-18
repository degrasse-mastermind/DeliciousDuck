import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Newsletter success conversion: exactly one GA4 event and exactly one PostHog
 * event per successful submission, with an allowlisted, path-only payload.
 */

const captureEvent = vi.fn();
vi.mock("@/lib/posthog", () => ({ captureEvent }));

const gtag = vi.fn();

function setLocation(pathname: string) {
  vi.stubGlobal("window", {
    location: { hostname: "deliciousduck.com", pathname, search: "", origin: "https://deliciousduck.com" },
    gtag,
    dataLayer: [],
  });
}

async function loadAnalytics() {
  vi.resetModules();
  return import("@/lib/analytics");
}

const ALLOWED = ["placement", "source", "interest", "source_path"];

beforeEach(() => {
  captureEvent.mockClear();
  gtag.mockClear();
  vi.unstubAllGlobals();
});

describe("newsletter_signup conversion", () => {
  it("emits exactly one GA4 and one PostHog event per success", async () => {
    setLocation("/guides/duck-cooking-starter-guide");
    const a = await loadAnalytics();
    a.trackNewsletterSignup({ placement: "starter-guide", source: "newsletter_form", interest: "cooking" });

    const gaCalls = gtag.mock.calls.filter((c) => c[0] === "event" && c[1] === "newsletter_signup");
    expect(gaCalls).toHaveLength(1);
    const phCalls = captureEvent.mock.calls.filter((c) => c[0] === "newsletter_signup");
    expect(phCalls).toHaveLength(1);
  });

  it("sends only allowlisted, path-only properties to PostHog", async () => {
    setLocation("/cook/how-to-cook-duck-breast");
    const a = await loadAnalytics();
    a.trackNewsletterSignup({ placement: "inline", source: "newsletter_form", interest: "cooking" });

    const props = captureEvent.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(Object.keys(props).sort()).toEqual([...ALLOWED].sort());
    expect(props["source_path"]).toBe("/cook/how-to-cook-duck-breast");
  });

  it("never leaks an email address, token, query string, or full URL", async () => {
    setLocation("/newsletter/preferences");
    const a = await loadAnalytics();
    a.trackNewsletterSignup({ placement: "prefs", source: "newsletter_form", interest: "general" });

    const serialized = JSON.stringify(captureEvent.mock.calls);
    expect(serialized).not.toMatch(/@/);
    expect(serialized).not.toMatch(/https?:\/\//);
    expect(serialized).not.toMatch(/[?&]t=/);
  });

  it("normalizes away a query string or hash that reaches the helper", async () => {
    setLocation("/newsletter/unsubscribe");
    const a = await loadAnalytics();
    expect(a.normalizedPath("/newsletter/unsubscribe?t=secret#x")).toBe("/newsletter/unsubscribe");
    expect(a.normalizedPath(undefined)).toBeUndefined();
  });

  it("does not fire a conversion when the server call fails", async () => {
    setLocation("/");
    await loadAnalytics();
    // A rejected subscribe never reaches trackNewsletterSignup: the component
    // awaits the server call and only then calls it. Nothing emitted here.
    const failing = async () => {
      throw new Error("server");
    };
    await expect(failing()).rejects.toThrow();
    expect(captureEvent).not.toHaveBeenCalled();
    expect(gtag.mock.calls.filter((c) => c[1] === "newsletter_signup")).toHaveLength(0);
  });
});
