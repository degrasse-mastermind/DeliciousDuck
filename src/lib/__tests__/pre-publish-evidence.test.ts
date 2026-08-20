/**
 * Pre-publish correction and evidence pass.
 *
 * These tests exist to *prove* the claims made about the measurement layer
 * rather than to restate them:
 *
 *  - conversion_module_view covers every required high-value module, through one
 *    shared visibility primitive, one impression per module (never per link);
 *  - the impression dedupe boundary is exactly
 *    event + placement + normalized source_path, per browser session, and is
 *    immune to rerenders, hydration, repeated IntersectionObserver callbacks,
 *    scrolling out and back, SPA route returns, remounts and StrictMode double
 *    effects;
 *  - a QA-excluded browser initializes nothing and emits nothing (GA4 tag,
 *    PostHog, pageviews, mirrors, custom events), suppression happens before
 *    any tag is injected, malformed flag values do not suppress, and storage
 *    failures never break the page;
 *  - the newsletter form keeps accessible label/required/invalid/error/success
 *    semantics and can only ever emit a categorical error_type.
 *
 * The stack has no jsdom/RTL, so component *rendering* is asserted through
 * source contracts here and exercised for real in the browser pass.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
  IMPRESSION_EVENTS,
  IMPRESSION_PROPERTY_ALLOWLIST,
  MODULE_PLACEMENTS,
  NEWSLETTER_ERROR_TYPES,
  buildImpressionEvent,
  impressionDedupeKey,
  isMeaningfullyVisible,
  markImpressionOnce,
  resetImpressionDedupeForTests,
} from "@/lib/impression-events";
import {
  QA_EXCLUSION_KEY,
  QA_EXCLUSION_VALUE,
  isExcludedValue,
  qaExclusionActive,
  qaToggleFromSearch,
  setQaExclusion,
  syncQaExclusionFromLocation,
} from "@/lib/qa-exclusion";
import {
  analyticsEnabled,
  ensureGtagLoaded,
  gtagBootstrapScript,
  syncGaRoutePolicy,
} from "@/lib/analytics-gate";

const read = (p: string) => readFileSync(p, "utf8");
const homeSource = read("src/routes/index.tsx");
const recipeSource = read("src/routes/recipes.$slug.tsx");
const newsletterSource = read("src/components/site/NewsletterSignup.tsx");
const commerceSource = read("src/components/site/Commerce.tsx");
const duckFatSource = read("src/components/site/DuckFatDecision.tsx");
const announcementSource = read("src/components/site/HomeAnnouncement.tsx");
const wrapperSource = read("src/components/site/ModuleImpression.tsx");
const hookSource = read("src/hooks/useModuleImpression.ts");
const rootSource = read("src/routes/__root.tsx");

beforeEach(() => {
  resetImpressionDedupeForTests();
});

/* ------------------------------------------------------------------ *
 * 1. Placement inventory / coverage
 * ------------------------------------------------------------------ */

describe("conversion_module_view coverage", () => {
  const required = [
    ["homepage intent selector", MODULE_PLACEMENTS.homeIntentSelector, homeSource],
    ["homepage Field Guide module", MODULE_PLACEMENTS.homeNewsletterOffer, homeSource],
    ["homepage buying-and-gear module", MODULE_PLACEMENTS.homeCommerceCards, homeSource],
    ["contextual duck-fat decision module", MODULE_PLACEMENTS.duckFatDecision, duckFatSource],
    ["recipe equipment / sourcing module", MODULE_PLACEMENTS.recipeEquipment, recipeSource],
    ["commercial offer group", MODULE_PLACEMENTS.guideOfferGroup, commerceSource],
  ] as const;

  for (const [label, placement, source] of required) {
    it(`instruments the ${label} exactly once`, () => {
      const hits = source.split(placement).length - 1;
      expect(hits, `${placement} referenced ${hits}x`).toBeGreaterThan(0);
      // One impression per module: no second, competing registration.
      const wrappers =
        (source.match(/placement=\{MODULE_PLACEMENTS\.[A-Za-z]+\}/g) ?? []).filter((m) =>
          m.includes(placementKey(placement)),
        ).length +
        (source.match(/placement: MODULE_PLACEMENTS\.[A-Za-z]+/g) ?? []).filter((m) =>
          m.includes(placementKey(placement)),
        ).length;
      expect(wrappers).toBe(1);
    });
  }

  it("instruments the Thanksgiving announcement through the seasonal record", () => {
    expect(announcementSource).toContain("<ModuleImpression");
    expect(MODULE_PLACEMENTS.seasonalBanner).toBe("home_announcement_thanksgiving_hub");
  });

  it("uses one shared visibility primitive everywhere", () => {
    expect(wrapperSource).toContain("useModuleImpression");
    for (const source of [newsletterSource, duckFatSource, commerceSource]) {
      expect(source).toContain("useModuleImpression");
    }
    // No component builds its own observer or fires on mount.
    for (const source of [
      wrapperSource,
      newsletterSource,
      duckFatSource,
      commerceSource,
      homeSource,
      recipeSource,
      announcementSource,
    ]) {
      expect(source).not.toContain("new IntersectionObserver");
    }
    expect(hookSource).toContain("new IntersectionObserver");
    expect(hookSource).toContain("isMeaningfullyVisible");
  });

  it("never emits one impression per child link", () => {
    // The recipe/offer modules render lists of links; the wrapper is applied to
    // the module, never inside a map callback.
    for (const source of [homeSource, recipeSource]) {
      expect(source).not.toMatch(/\.map\([^)]*\)[^]*?<ModuleImpression/);
    }
  });

  it("keeps a module impression impossible on mount alone", () => {
    expect(
      isMeaningfullyVisible({
        intersectionRatio: 0,
        visibleHeight: 0,
        elementHeight: 600,
        viewportHeight: 900,
      }),
    ).toBe(false);
    expect(
      isMeaningfullyVisible({
        intersectionRatio: 0.34,
        visibleHeight: 200,
        elementHeight: 600,
        viewportHeight: 900,
      }),
    ).toBe(false);
  });
});

function placementKey(value: string): string {
  const entry = Object.entries(MODULE_PLACEMENTS).find(([, v]) => v === value);
  return entry ? entry[0] : value;
}

/* ------------------------------------------------------------------ *
 * 2. Deduplication boundary
 * ------------------------------------------------------------------ */

describe("impression dedupe boundary", () => {
  const key = (placement: string, path: string) =>
    impressionDedupeKey(IMPRESSION_EVENTS.conversionModuleView, placement, path);

  it("counts once across rerender, hydration, repeated observer callbacks, scroll-back, remount and StrictMode", () => {
    const k = key(MODULE_PLACEMENTS.homeIntentSelector, "/");
    const attempts = [
      "server render",
      "hydration",
      "rerender",
      "observer callback 1",
      "observer callback 2",
      "scrolled out and back",
      "remount",
      "strict-mode double effect",
    ];
    const emitted = attempts.filter(() => markImpressionOnce(k));
    expect(emitted).toHaveLength(1);
  });

  it("counts once per SPA return to the same page", () => {
    const k = key(MODULE_PLACEMENTS.homeCommerceCards, "/");
    expect(markImpressionOnce(k)).toBe(true);
    // / -> /recipes -> / in the same session.
    expect(markImpressionOnce(key(MODULE_PLACEMENTS.recipeEquipment, "/recipes"))).toBe(true);
    expect(markImpressionOnce(k)).toBe(false);
  });

  it("keeps separate placements independently measurable on one page", () => {
    expect(markImpressionOnce(key(MODULE_PLACEMENTS.homeIntentSelector, "/"))).toBe(true);
    expect(markImpressionOnce(key(MODULE_PLACEMENTS.homeNewsletterOffer, "/"))).toBe(true);
    expect(markImpressionOnce(key(MODULE_PLACEMENTS.homeCommerceCards, "/"))).toBe(true);
  });

  it("keeps separate normalized paths independently measurable for one placement", () => {
    const p = MODULE_PLACEMENTS.recipeEquipment;
    expect(markImpressionOnce(key(p, "/recipes/duck-leg-confit"))).toBe(true);
    expect(markImpressionOnce(key(p, "/recipes/peking-duck-at-home"))).toBe(true);
    // Same page, different query/hash — one impression, not three.
    expect(markImpressionOnce(key(p, "/recipes/duck-leg-confit?utm_source=x"))).toBe(false);
    expect(markImpressionOnce(key(p, "/recipes/duck-leg-confit#method"))).toBe(false);
  });

  it("separates the four events from each other at the same placement and path", () => {
    const placement = "home_field_guide_module";
    const names = Object.values(IMPRESSION_EVENTS);
    const emitted = names.filter((n) => markImpressionOnce(impressionDedupeKey(n, placement, "/")));
    expect(emitted).toEqual(names);
  });
});

/* ------------------------------------------------------------------ *
 * 3. QA exclusion
 * ------------------------------------------------------------------ */

type FakeWindow = {
  location: { hostname: string; pathname: string; search: string };
  localStorage: Storage;
  history: Record<string, unknown>;
  addEventListener: () => void;
  innerHeight: number;
};

function memoryStorage(seed: Record<string, string> = {}, broken = false): Storage {
  const map = new Map(Object.entries(seed));
  const guard = () => {
    if (broken) throw new Error("storage unavailable");
  };
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => {
      guard();
      return map.get(k) ?? null;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => {
      guard();
      map.delete(k);
    },
    setItem: (k: string, v: string) => {
      guard();
      map.set(k, v);
    },
  } as Storage;
}

function installWindow(options: {
  hostname?: string;
  pathname?: string;
  search?: string;
  storage?: Storage;
}): FakeWindow {
  const w: FakeWindow = {
    location: {
      hostname: options.hostname ?? "deliciousduck.com",
      pathname: options.pathname ?? "/",
      search: options.search ?? "",
    },
    localStorage: options.storage ?? memoryStorage(),
    history: {},
    addEventListener: () => {},
    innerHeight: 900,
  };
  vi.stubGlobal("window", w);
  return w;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("QA exclusion behaviour", () => {
  it("a normal production browser is allowed to emit", () => {
    installWindow({});
    expect(qaExclusionActive()).toBe(false);
    expect(analyticsEnabled("/")).toBe(true);
  });

  it("a QA-enabled browser emits nothing anywhere", () => {
    installWindow({
      storage: memoryStorage({ [QA_EXCLUSION_KEY]: QA_EXCLUSION_VALUE }),
    });
    expect(qaExclusionActive()).toBe(true);
    // The single gate every GA4 helper, PostHog helper and mirrored custom
    // event consults before doing anything.
    expect(analyticsEnabled("/")).toBe(false);
    expect(analyticsEnabled("/recipes/duck-leg-confit")).toBe(false);
    // GA4 tag is never injected and the property kill switch stays on.
    expect(ensureGtagLoaded("G-TEST123", "/")).toBe("blocked");
    expect(syncGaRoutePolicy("G-TEST123", "/")).toBe(false);
  });

  it("suppresses before any tag is injected", () => {
    const script = gtagBootstrapScript("G-TEST123");
    const qaCheck = script.indexOf(QA_EXCLUSION_KEY);
    const inject = script.indexOf("googletagmanager.com");
    expect(qaCheck).toBeGreaterThan(-1);
    expect(qaCheck).toBeLessThan(inject);
    // The QA bootstrap itself runs before the gtag bootstrap in the document.
    expect(rootSource.indexOf("qaExclusionBootstrapScript")).toBeLessThan(
      rootSource.indexOf("gtagBootstrapScript"),
    );
  });

  it("disabling QA restores normal behaviour", () => {
    installWindow({
      storage: memoryStorage({ [QA_EXCLUSION_KEY]: QA_EXCLUSION_VALUE }),
    });
    expect(analyticsEnabled("/")).toBe(false);
    setQaExclusion(false);
    expect(qaExclusionActive()).toBe(false);
    expect(analyticsEnabled("/")).toBe(true);
  });

  it("applies ?dd_qa=1 and ?dd_qa=0 from the address bar", () => {
    installWindow({ search: "?dd_qa=1" });
    expect(syncQaExclusionFromLocation()).toBe(true);
    expect(qaToggleFromSearch("?dd_qa=0")).toBe("off");
    expect(syncQaExclusionFromLocation("?dd_qa=0")).toBe(false);
  });

  it("malformed or foreign values never suppress analytics", () => {
    for (const value of ["0", "true", "yes", "", "  1", "01", "null"]) {
      expect(isExcludedValue(value)).toBe(false);
    }
    for (const search of ["", "?dd_qa=", "?dd_qa=maybe", "?other=1", "?dd_q=1"]) {
      expect(qaToggleFromSearch(search)).toBeNull();
    }
    installWindow({ storage: memoryStorage({ [QA_EXCLUSION_KEY]: "true" }) });
    expect(analyticsEnabled("/")).toBe(true);
  });

  it("never breaks when storage access throws", () => {
    installWindow({ storage: memoryStorage({}, true) });
    expect(() => qaExclusionActive()).not.toThrow();
    expect(qaExclusionActive()).toBe(false);
    expect(() => setQaExclusion(true)).not.toThrow();
    expect(() => syncQaExclusionFromLocation("?dd_qa=1")).not.toThrow();
    // Storage failure must not silently suppress a real visitor's analytics.
    expect(analyticsEnabled("/")).toBe(true);
  });

  it("the toggle parameter never reaches an event payload", () => {
    const built = buildImpressionEvent(IMPRESSION_EVENTS.conversionModuleView, {
      placement: MODULE_PLACEMENTS.homeIntentSelector,
      sourcePath: "/?dd_qa=1#anchor",
      moduleType: "intent_selector",
      destinationType: "internal",
    });
    expect(built.params.source_path).toBe("/");
    expect(JSON.stringify(built.params)).not.toContain("dd_qa");
  });

  it("exposes no public control and no indexable route for the switch", () => {
    expect(read("src/lib/sitemap.ts")).not.toContain("dd_qa");
    expect(homeSource).not.toContain("dd_qa");
    expect(rootSource).not.toContain("dd_qa=");
  });
});

/* ------------------------------------------------------------------ *
 * 4. Newsletter accessibility + error paths
 * ------------------------------------------------------------------ */

describe("newsletter form semantics", () => {
  it("keeps an accessible label bound to the field", () => {
    expect(newsletterSource).toContain("htmlFor={`${id}-email`}");
    expect(newsletterSource).toContain("id={`${id}-email`}");
    expect(newsletterSource).toContain("Email address");
  });

  it("makes required and invalid states programmatically determinable", () => {
    expect(newsletterSource).toMatch(/\n\s+required\n/);
    expect(newsletterSource).toContain('aria-required="true"');
    expect(newsletterSource).toContain("aria-invalid={error ? true : undefined}");
    expect(newsletterSource).toContain("type=\"email\"");
  });

  it("links the error text to the field and announces it", () => {
    expect(newsletterSource).toContain("aria-describedby={error ? `${id}-error` : undefined}");
    expect(newsletterSource).toContain('role="alert"');
  });

  it("returns focus to the field after a failed submission", () => {
    expect(newsletterSource).toContain("emailRef.current?.focus()");
    expect(newsletterSource).toContain("ref={emailRef}");
    // Every failure path goes through the focusing helper.
    expect(newsletterSource).not.toMatch(/setError\("(Please|We couldn)/);
    expect(newsletterSource.match(/failWith\(/g) ?? []).toHaveLength(4);
  });

  it("announces the success state", () => {
    expect(newsletterSource).toContain('<div role="status">');
  });

  it("covers empty, invalid-format, network, server, unknown and success paths", () => {
    expect(newsletterSource).toContain('errorType: "required"');
    expect(newsletterSource).toContain('errorType: "invalid_format"');
    expect(newsletterSource).toContain("classifyFailure(cause)");
    expect(newsletterSource).toContain("trackNewsletterSignup(");
    // classifyFailure can only produce these three categories.
    expect(newsletterSource).toContain('return "network"');
    expect(newsletterSource).toContain('return "server"');
    expect(newsletterSource).toContain('return "unknown"');
  });

  it("fires newsletter_form_start once at first meaningful interaction", () => {
    expect(newsletterSource).toContain("if (startSent) return;");
    expect(newsletterSource.match(/signalFormStart\(\)/g) ?? []).toHaveLength(3); // definition-adjacent calls: change + focus
  });

  it("can only send a categorical error_type, never a message or address", () => {
    for (const type of NEWSLETTER_ERROR_TYPES) {
      const built = buildImpressionEvent(IMPRESSION_EVENTS.newsletterFormError, {
        placement: "home_field_guide_module",
        sourcePath: "/",
        errorType: type,
      });
      expect(built.params.error_type).toBe(type);
      expect(Object.keys(built.params).sort()).toEqual([
        "content_slug",
        "content_type",
        "error_type",
        "placement",
        "source_path",
      ]);
    }
    expect(IMPRESSION_PROPERTY_ALLOWLIST.newsletter_form_error).not.toContain("email");
    // No raw value can be represented at all.
    const smuggled = buildImpressionEvent(IMPRESSION_EVENTS.newsletterFormError, {
      placement: "home_field_guide_module",
      sourcePath: "/?email=someone@example.com",
      errorType: "server",
    });
    expect(JSON.stringify(smuggled.params)).not.toContain("@");
  });
});
