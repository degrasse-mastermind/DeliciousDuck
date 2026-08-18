/**
 * GA4 route-aware kill switch.
 *
 * `window['ga-disable-<measurement-id>']` is the documented property that stops
 * all measurement for a property — including gtag's enhanced-measurement
 * browser-history pageviews. These tests pin the suspend/restore behaviour for
 * direct internal loads and public -> internal -> public SPA transitions, plus
 * the query/hash stripping of the pageview payload and the presence of the
 * early history guard in the generated bootstrap source.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ANALYTICS_BLOCKED_PATH_PREFIXES,
  gaDisableFlagKey,
  gtagBootstrapScript,
  syncGaRoutePolicy,
} from "../analytics-gate";

// posthog-js touches module-scope browser globals on import; the GA tests care
// only about gtag, so the SDK is stubbed out entirely.
vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    set_config: vi.fn(),
    startSessionRecording: vi.fn(),
    stopSessionRecording: vi.fn(),
  },
}));

const MEASUREMENT_ID = "G-E15CFY209D";
const FLAG = gaDisableFlagKey(MEASUREMENT_ID);

/** Minimal browser stub — node environment, no jsdom, fully deterministic. */
function setLocation(hostname: string, path: string, search = "", hash = "") {
  const existing = (globalThis as unknown as { window?: Record<string, unknown> }).window;
  const win: Record<string, unknown> = existing ?? {};
  win["location"] = {
    hostname,
    pathname: path,
    search,
    hash,
    origin: `https://${hostname}`,
    href: `https://${hostname}${path}${search}${hash}`,
  };
  win["localStorage"] = win["localStorage"] ?? { getItem: () => null };
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", { cookie: "", title: "Test" });
}

function win(): Record<string, unknown> {
  return (globalThis as unknown as { window: Record<string, unknown> }).window;
}

function readFlag(): unknown {
  return win()[FLAG];
}

describe("GA disable flag key", () => {
  it("uses the documented property name", () => {
    expect(FLAG).toBe("ga-disable-G-E15CFY209D");
  });
});

describe("syncGaRoutePolicy", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps GA disabled on a direct internal load", () => {
    setLocation("deliciousduck.com", "/internal/kitchen-test-sheet");
    expect(syncGaRoutePolicy(MEASUREMENT_ID)).toBe(false);
    expect(readFlag()).toBe(true);
  });

  it("suspends and restores across public -> internal -> public navigation", () => {
    setLocation("deliciousduck.com", "/");
    expect(syncGaRoutePolicy(MEASUREMENT_ID)).toBe(true);
    expect(readFlag()).toBe(false);

    setLocation("deliciousduck.com", "/internal/kitchen-test-sheet");
    expect(syncGaRoutePolicy(MEASUREMENT_ID, "/internal/kitchen-test-sheet")).toBe(false);
    expect(readFlag()).toBe(true);

    setLocation("deliciousduck.com", "/gear/best-roasting-pan-for-duck");
    expect(syncGaRoutePolicy(MEASUREMENT_ID, "/gear/best-roasting-pan-for-duck")).toBe(true);
    expect(readFlag()).toBe(false);
  });

  it("blocks every configured prefix, and /api too", () => {
    for (const prefix of ANALYTICS_BLOCKED_PATH_PREFIXES) {
      setLocation("deliciousduck.com", `${prefix}/anything`);
      expect(syncGaRoutePolicy(MEASUREMENT_ID, `${prefix}/anything`)).toBe(false);
      expect(readFlag()).toBe(true);
    }
  });

  it("stays disabled on preview and noncanonical hosts, public path or not", () => {
    for (const host of [
      "localhost",
      "id-preview--7d297173.lovable.app",
      "duck-kitchen-quest.lovable.app",
    ]) {
      setLocation(host, "/");
      expect(syncGaRoutePolicy(MEASUREMENT_ID, "/")).toBe(false);
      expect(readFlag()).toBe(true);
    }
  });

  it("never writes persistent consent state", () => {
    setLocation("deliciousduck.com", "/internal/x");
    syncGaRoutePolicy(MEASUREMENT_ID, "/internal/x");
    expect((win()["localStorage"] as Storage).getItem(FLAG)).toBeNull();
    expect((globalThis as unknown as { document: { cookie: string } }).document.cookie).toBe("");
  });
});

describe("pageview payload stays path-only", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("drops query strings and hashes from a token URL", async () => {
    setLocation("deliciousduck.com", "/newsletter/unsubscribe", "?t=secret-token", "#done");
    const pushed: unknown[][] = [];
    win()["gtag"] = (...args: unknown[]) => {
      pushed.push(args);
    };
    const { trackPageView } = await import("../analytics");
    trackPageView("/newsletter/unsubscribe");
    const params = pushed.at(-1)?.[2] as Record<string, unknown>;
    expect(params["page_path"]).toBe("/newsletter/unsubscribe");
    expect(params["page_location"]).toBe("https://deliciousduck.com/newsletter/unsubscribe");
    expect(JSON.stringify(pushed)).not.toContain("secret-token");
  });

  it("emits nothing at all on a blocked route and leaves GA disabled", async () => {
    setLocation("deliciousduck.com", "/internal/kitchen-test-sheet");
    const pushed: unknown[][] = [];
    win()["gtag"] = (...args: unknown[]) => {
      pushed.push(args);
    };
    const { trackPageView } = await import("../analytics");
    trackPageView("/internal/kitchen-test-sheet");
    expect(pushed).toHaveLength(0);
    expect(readFlag()).toBe(true);
  });
});

describe("bootstrap source", () => {
  const source = gtagBootstrapScript(MEASUREMENT_ID);

  it("sets the disable flag before the tag is requested", () => {
    expect(source.indexOf("syncDisableFlag()")).toBeLessThan(
      source.indexOf("googletagmanager.com"),
    );
  });

  it("guards pushState, replaceState and history events", () => {
    expect(source).toContain("'pushState', 'replaceState'");
    expect(source).toContain("addEventListener('popstate', syncDisableFlag, true)");
    expect(source).toContain("addEventListener('hashchange', syncDisableFlag, true)");
  });

  it("keeps the first pageview path-only and the flag name documented", () => {
    expect(source).toContain('"ga-disable-G-E15CFY209D"');
    expect(source).toContain("page_location: location.origin + location.pathname");
    expect(source).not.toContain("location.href");
    expect(source).not.toContain("location.search");
  });
});
