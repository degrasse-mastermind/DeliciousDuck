import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GTAG_LOADED_KEY,
  GTAG_LOADER_KEY,
  ensureGtagLoaded,
  gaDisableFlagKey,
  gtagBootstrapScript,
  syncGaRoutePolicy,
} from "@/lib/analytics-gate";

/**
 * Lazy GA4 initialization across SPA state transitions.
 *
 * The inline bootstrap is executed in a sandbox where `window === globalThis`,
 * exactly as in a browser, so `dataLayer` resolution and the one-shot loader
 * behave the same. Nothing here touches the network.
 */

const ID = "G-TEST123";
const DISABLE_KEY = gaDisableFlagKey(ID);

type Bag = Record<string, unknown>;

let injectedScripts: { src?: string }[] = [];

function setLocation(hostname: string, pathname: string) {
  vi.stubGlobal("location", {
    hostname,
    pathname,
    search: "",
    origin: `https://${hostname}`,
  });
}

function bootstrap() {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function(gtagBootstrapScript(ID))();
}

function dataLayerEvents(): unknown[][] {
  const layer = (globalThis as Bag)["dataLayer"] as unknown[] | undefined;
  return (layer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
}

function pageViewCount(): number {
  return dataLayerEvents().filter(
    (args) => args[0] === "config" || (args[0] === "event" && args[1] === "page_view"),
  ).length;
}

beforeEach(() => {
  injectedScripts = [];
  const g = globalThis as Bag;
  delete g["dataLayer"];
  delete g["gtag"];
  delete g[GTAG_LOADED_KEY];
  delete g[GTAG_LOADER_KEY];
  delete g[DISABLE_KEY];
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal("history", { pushState: () => {}, replaceState: () => {} });
  vi.stubGlobal("addEventListener", () => {});
  vi.stubGlobal("document", {
    head: {
      appendChild: (node: { src?: string }) => {
        injectedScripts.push(node);
        return node;
      },
    },
    createElement: () => ({}) as { src?: string },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  const g = globalThis as Bag;
  delete g["dataLayer"];
  delete g["gtag"];
  delete g[GTAG_LOADED_KEY];
  delete g[GTAG_LOADER_KEY];
  delete g[DISABLE_KEY];
});

describe("public direct load", () => {
  it("loads gtag once and emits exactly one pageview", () => {
    setLocation("deliciousduck.com", "/");
    bootstrap();
    expect(injectedScripts).toHaveLength(1);
    expect(injectedScripts[0]!.src).toContain(`id=${ID}`);
    expect(pageViewCount()).toBe(1);
    expect((globalThis as Bag)[DISABLE_KEY]).toBe(false);

    // The router effect's ensure() must never load a second tag.
    expect(ensureGtagLoaded(ID, "/")).toBe("already");
    expect(injectedScripts).toHaveLength(1);
    expect(pageViewCount()).toBe(1);
  });
});

describe("internal direct load", () => {
  it("loads nothing and stays silent", () => {
    setLocation("deliciousduck.com", "/internal/growth-dashboard");
    bootstrap();
    expect(injectedScripts).toHaveLength(0);
    expect(pageViewCount()).toBe(0);
    expect((globalThis as Bag)[DISABLE_KEY]).toBe(true);
    expect(ensureGtagLoaded(ID, "/internal/growth-dashboard")).toBe("blocked");
    expect(ensureGtagLoaded(ID, "/api/generate-sketch")).toBe("blocked");
    expect(injectedScripts).toHaveLength(0);
  });

  it("initializes lazily exactly once on the first public navigation", () => {
    setLocation("deliciousduck.com", "/internal/growth-dashboard");
    bootstrap();
    expect(injectedScripts).toHaveLength(0);

    // SPA navigation to the home page via the DeliciousDuck wordmark link.
    setLocation("deliciousduck.com", "/");
    expect(ensureGtagLoaded(ID, "/")).toBe("loaded");
    expect(injectedScripts).toHaveLength(1);
    expect(pageViewCount()).toBe(1);
    expect((globalThis as Bag)[DISABLE_KEY]).toBe(false);

    // A further public navigation must not re-load or re-configure the tag.
    setLocation("deliciousduck.com", "/recipes");
    expect(ensureGtagLoaded(ID, "/recipes")).toBe("already");
    expect(injectedScripts).toHaveLength(1);
    expect(pageViewCount()).toBe(1);
  });
});

describe("public -> internal -> public", () => {
  it("suspends GA on the blocked route and restores it without reloading", () => {
    setLocation("deliciousduck.com", "/");
    bootstrap();
    expect(injectedScripts).toHaveLength(1);

    setLocation("deliciousduck.com", "/internal/commercial-links");
    expect(syncGaRoutePolicy(ID, "/internal/commercial-links")).toBe(false);
    expect((globalThis as Bag)[DISABLE_KEY]).toBe(true);
    expect(ensureGtagLoaded(ID, "/internal/commercial-links")).toBe("blocked");

    setLocation("deliciousduck.com", "/gear/best-pan-for-duck-breast");
    expect(syncGaRoutePolicy(ID, "/gear/best-pan-for-duck-breast")).toBe(true);
    expect((globalThis as Bag)[DISABLE_KEY]).toBe(false);
    expect(ensureGtagLoaded(ID, "/gear/best-pan-for-duck-breast")).toBe("already");
    expect(injectedScripts).toHaveLength(1);
  });
});

describe("noncanonical hosts and PII", () => {
  it("never loads on preview or localhost, even after navigation", () => {
    for (const host of ["localhost", "duck-kitchen-quest.lovable.app", "staging.deliciousduck.com"]) {
      injectedScripts = [];
      delete (globalThis as Bag)[GTAG_LOADED_KEY];
      delete (globalThis as Bag)[GTAG_LOADER_KEY];
      setLocation(host, "/internal/growth-dashboard");
      bootstrap();
      setLocation(host, "/");
      expect(ensureGtagLoaded(ID, "/"), host).toBe("blocked");
      expect(injectedScripts, host).toHaveLength(0);
      expect((globalThis as Bag)[DISABLE_KEY], host).toBe(true);
    }
  });

  it("keeps the lazy pageview path-only", () => {
    setLocation("deliciousduck.com", "/internal/growth-dashboard");
    bootstrap();
    setLocation("deliciousduck.com", "/newsletter/unsubscribe");
    (globalThis.location as unknown as { search: string }).search = "?t=opaque-mailbox-token";
    expect(ensureGtagLoaded(ID, "/newsletter/unsubscribe")).toBe("loaded");
    const serialized = JSON.stringify(dataLayerEvents());
    expect(serialized).not.toContain("opaque-mailbox-token");
    expect(serialized).toContain("/newsletter/unsubscribe");
  });
});

describe("stale browser location during SPA navigation", () => {
  it("loads gtag using the router path when location.pathname still shows the internal route", () => {
    setLocation("deliciousduck.com", "/internal/growth-dashboard");
    bootstrap();
    expect(injectedScripts).toHaveLength(0);
    expect((globalThis as Bag)[DISABLE_KEY]).toBe(true);

    // Router already reports "/" while `location` has not settled yet.
    const result = ensureGtagLoaded(ID, "/");
    expect(result).toBe("loaded");
    expect(injectedScripts).toHaveLength(1);
    expect((globalThis as Bag)[DISABLE_KEY]).toBe(false);
    // Exactly one pageview, stamped with the public path, never the internal one.
    expect(pageViewCount()).toBe(1);
    const config = dataLayerEvents().find((args) => args[0] === "config");
    expect(config?.[2]).toMatchObject({
      page_path: "/",
      page_location: "https://deliciousduck.com/",
    });

    // Second navigation must not load again or emit another pageview.
    expect(ensureGtagLoaded(ID, "/recipes")).toBe("already");
    expect(injectedScripts).toHaveLength(1);
    expect(pageViewCount()).toBe(1);
  });

  it("reports blocked (never 'already') when the route is not allowed", () => {
    setLocation("deliciousduck.com", "/");
    bootstrap();
    // A public direct load already loaded the tag.
    expect(injectedScripts).toHaveLength(1);
    expect(ensureGtagLoaded(ID, "/internal/growth-dashboard")).toBe("blocked");
    expect(injectedScripts).toHaveLength(1);
  });

  it("declines the load for a blocked router path even when location looks public", () => {
    setLocation("deliciousduck.com", "/internal/growth-dashboard");
    bootstrap();
    setLocation("deliciousduck.com", "/");
    const loader = (globalThis as Bag)[GTAG_LOADER_KEY] as (p?: string) => boolean;
    expect(loader("/api/generate-sketch")).toBe(false);
    expect((globalThis as Bag)[GTAG_LOADED_KEY]).toBeFalsy();
    expect(injectedScripts).toHaveLength(0);
  });
});
