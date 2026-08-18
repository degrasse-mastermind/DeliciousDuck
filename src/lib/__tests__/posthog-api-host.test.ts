import { describe, expect, it } from "vitest";

import {
  POSTHOG_DIRECT_HOST,
  POSTHOG_PROXY_HOST,
  POSTHOG_UI_HOST,
  postHogApiHost,
  resolvePostHogApiHost,
} from "@/lib/posthog";

/**
 * PostHog managed reverse proxy is activated in preview. With no configured
 * override the SDK must ingest through the first-party proxy.
 */
describe("resolvePostHogApiHost", () => {
  it("defaults to the activated proxy host", () => {
    expect(resolvePostHogApiHost(undefined)).toBe(POSTHOG_PROXY_HOST);
    expect(resolvePostHogApiHost("")).toBe(POSTHOG_PROXY_HOST);
    expect(resolvePostHogApiHost("   ")).toBe(POSTHOG_PROXY_HOST);
  });

  it("accepts a plain absolute HTTPS origin", () => {
    expect(resolvePostHogApiHost("https://e.example.com")).toBe("https://e.example.com");
    expect(resolvePostHogApiHost("https://e.example.com/")).toBe("https://e.example.com");
  });

  it("rejects unsafe or malformed values and falls back to the proxy host", () => {
    for (const bad of [
      "http://e.example.com",
      "//e.example.com",
      "e.example.com",
      "https://user:pass@e.example.com",
      "https://e.example.com?x=1",
      "https://e.example.com#frag",
      "https://e.example.com/ingest",
      "javascript:alert(1)",
      "not a url",
    ]) {
      expect(resolvePostHogApiHost(bad)).toBe(POSTHOG_PROXY_HOST);
    }
  });

  it("keeps the UI host on the normal PostHog app", () => {
    expect(POSTHOG_UI_HOST).toBe("https://us.posthog.com");
  });

  it("exposes a direct US host constant for rollback", () => {
    expect(POSTHOG_DIRECT_HOST).toBe("https://us.i.posthog.com");
  });

  it("reads the build-time variable and stays on the proxy default when unset", () => {
    const configured = import.meta.env["VITE_POSTHOG_API_HOST"];
    if (!configured) expect(postHogApiHost()).toBe(POSTHOG_PROXY_HOST);
    else expect(postHogApiHost()).toBe(resolvePostHogApiHost(configured));
  });
});
