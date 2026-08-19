import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  FIELD_GUIDE_ANCHOR_ID,
  HOMEPAGE_COMMERCE_CARDS,
  HOMEPAGE_INTENT_ROUTES,
  homepagePlacementIds,
} from "@/data/homepage-intent";
import {
  CONVERSION_INTENTS,
  allConversionPlacementIds,
} from "@/data/conversion-paths";

const routeSource = readFileSync("src/routes/index.tsx", "utf8");
const routerSource = readFileSync("src/components/site/HomeIntentRouter.tsx", "utf8");
const newsletterSource = readFileSync("src/components/site/NewsletterSignup.tsx", "utf8");

describe("homepage intent router", () => {
  it("offers exactly four starting points", () => {
    expect(HOMEPAGE_INTENT_ROUTES).toHaveLength(4);
  });

  it("maps each intent to its intended destination", () => {
    const map = Object.fromEntries(HOMEPAGE_INTENT_ROUTES.map((r) => [r.placement, r.to]));
    expect(map["home_intent_cook_tonight"]).toBe("/recipes");
    expect(map["home_intent_buy_duck"]).toBe("/buy/where-to-buy-duck-online");
    expect(map["home_intent_choose_gear"]).toBe("/gear/best-roasting-pan-for-duck");
    expect(map["home_intent_field_guide"]).toBe(`#${FIELD_GUIDE_ANCHOR_ID}`);
  });

  it("uses internal destinations only", () => {
    for (const item of [...HOMEPAGE_INTENT_ROUTES, ...HOMEPAGE_COMMERCE_CARDS]) {
      expect(item.to.startsWith("/") || item.to.startsWith("#")).toBe(true);
      expect(item.to).not.toMatch(/https?:/);
    }
  });

  it("uses allowlisted compact intents", () => {
    for (const item of [...HOMEPAGE_INTENT_ROUTES, ...HOMEPAGE_COMMERCE_CARDS]) {
      expect(CONVERSION_INTENTS).toContain(item.intent);
    }
  });

  it("registers every placement id in the shared registry, uniquely", () => {
    const ids = homepagePlacementIds();
    expect(new Set(ids).size).toBe(ids.length);
    const registry = allConversionPlacementIds();
    for (const id of ids) expect(registry).toContain(id);
  });

  it("never repeats a homepage destination", () => {
    const destinations = [...HOMEPAGE_INTENT_ROUTES, ...HOMEPAGE_COMMERCE_CARDS].map((i) => i.to);
    expect(new Set(destinations).size).toBe(destinations.length);
  });

  it("renders once, immediately after the hero", () => {
    expect(routeSource.match(/<HomeIntentRouter \/>/g)).toHaveLength(1);
    expect(routeSource.indexOf("<HomeIntentRouter />")).toBeGreaterThan(
      routeSource.indexOf("<Hero />"),
    );
    expect(routeSource.indexOf("<HomeIntentRouter />")).toBeLessThan(
      routeSource.indexOf("<JourneySection />"),
    );
  });

  it("keeps a single h1 on the homepage", () => {
    expect(routeSource.match(/<h1/g)).toHaveLength(1);
    expect(routerSource).not.toMatch(/<h1/);
  });

  it("tracks internal clicks with the internal conversion helper only", () => {
    expect(routerSource).toContain("trackConversionPathClick");
    expect(routerSource).not.toContain("affiliate_click");
    expect(routerSource).not.toContain("trackNewsletterSignup");
  });

  it("adds no merchant links or commercial claims", () => {
    expect(routerSource).not.toMatch(/https?:\/\//);
    expect(routerSource).not.toMatch(/\$\d/);
  });
});

describe("field guide anchor", () => {
  it("matches the id the newsletter section renders", () => {
    expect(newsletterSource).toContain('id = "starter-guide"');
    expect(FIELD_GUIDE_ANCHOR_ID).toBe("starter-guide");
  });

  it("scrolls and focuses without recording a signup", () => {
    expect(routerSource).toContain("scrollIntoView");
    expect(routerSource).toContain("prefers-reduced-motion");
    expect(routerSource).toContain(`${"`"}\${FIELD_GUIDE_ANCHOR_ID}-email${"`"}`);
  });
});

describe("homepage commerce cards", () => {
  it("covers the established money pages, once each", () => {
    const destinations = HOMEPAGE_COMMERCE_CARDS.map((c) => c.to);
    expect(destinations).toEqual([
      "/gear/best-thermometer-for-duck",
      "/gear/best-pan-for-duck-breast",
      "/buy/duck-fat-buying-guide",
    ]);
  });

  it("uses placement ids distinct from the above-the-fold router", () => {
    for (const card of HOMEPAGE_COMMERCE_CARDS) {
      expect(card.placement.startsWith("home_commerce_")).toBe(true);
    }
    for (const route of HOMEPAGE_INTENT_ROUTES) {
      expect(route.placement.startsWith("home_intent_")).toBe(true);
    }
  });
});
