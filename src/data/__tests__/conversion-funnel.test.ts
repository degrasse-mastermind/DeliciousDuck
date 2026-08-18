/**
 * High-intent internal conversion funnel.
 *
 * Proves the priority feeder pages link to the intended money page, that each
 * feeder actually renders the module, and that the sourcing rules from the
 * previous sprint still hold: no D'Artagnan anywhere, US Wellness duck-fat only
 * at the exact affiliate URL, Amazon equipment-only on the right tag.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONVERSION_PATHS,
  buildConversionPathClickEvent,
  conversionPathsForSource,
} from "@/data/conversion-paths";
import { COMMERCIAL_LINKS, COMMERCIAL_PLACEMENTS } from "@/data/commercial-links";
import { MERCHANTS, US_WELLNESS_DUCK_FAT_URL, merchantById } from "@/data/affiliates";

const SOURCING = "/buy/where-to-buy-duck-online";
const FAT = "/buy/duck-fat-buying-guide";
const THERMOMETER = "/gear/best-thermometer-for-duck";

/** Feeder page -> destinations it must offer. */
const FUNNEL: Record<string, string[]> = {
  "/cook/whole-roast-duck": [SOURCING, "/gear/best-roasting-pan-for-duck"],
  "/buy/how-to-choose-duck": [SOURCING],
  "/buy/what-cut-of-duck-to-buy": [SOURCING],
  "/buy/how-much-duck-per-person": [SOURCING],
  "/buy/fresh-vs-frozen-duck": [SOURCING],
  "/learn/duck-vs-turkey-thanksgiving": [SOURCING],
  "/cook/how-to-cook-duck-breast": [SOURCING],
  "/learn/why-duck-skin-isnt-crispy": ["/gear/best-pan-for-duck-breast"],
  "/learn/duck-breast-temperature-doneness": [THERMOMETER],
  "/tools/duck-doneness-guide": [THERMOMETER],
  "/cook/duck-leg-confit": [SOURCING, FAT],
  "/learn/how-to-render-duck-fat": [FAT],
  "/cook/ways-to-use-duck-fat": [FAT],
  "/ingredients/duck-fat-vs-butter-oil": [FAT],
  "/tools/duck-fat-substitution-calculator": [FAT],
};

/** Feeder path -> the route file that must render the module. */
function routeFile(path: string): string {
  const file = path.replace(/^\//, "").replace(/\//g, ".");
  return join("src/routes", `${file}.tsx`);
}

describe("priority feeder pages reach the money pages", () => {
  it("maps every feeder to its intended destinations", () => {
    for (const [source, destinations] of Object.entries(FUNNEL)) {
      const mapped = conversionPathsForSource(source).map((p) => p.destination);
      expect(mapped.length, source).toBeGreaterThan(0);
      for (const destination of destinations) {
        expect(mapped, source).toContain(destination);
      }
    }
  });

  it("renders the module on every feeder route with the matching sourcePath", () => {
    for (const source of Object.keys(FUNNEL)) {
      const text = readFileSync(routeFile(source), "utf8");
      expect(text, source).toContain("<ConversionPaths");
      expect(text, source).toContain(`sourcePath="${source}"`);
    }
  });

  it("keeps each feeder to at most two internal steps", () => {
    const bySource = new Map<string, number>();
    for (const path of CONVERSION_PATHS) {
      bySource.set(path.sourcePath, (bySource.get(path.sourcePath) ?? 0) + 1);
    }
    for (const [source, count] of bySource) {
      expect(count, source).toBeLessThanOrEqual(2);
    }
  });

  it("uses problem-oriented anchors and never a generic shop CTA", () => {
    for (const path of CONVERSION_PATHS) {
      expect(path.anchor.length, path.placement).toBeGreaterThan(8);
      expect(path.anchor, path.placement).not.toMatch(/shop now|buy now|click here|order now/i);
    }
  });

  it("only ever points at internal routes, never a merchant", () => {
    for (const path of CONVERSION_PATHS) {
      expect(path.destination.startsWith("/"), path.placement).toBe(true);
      expect(path.destination, path.placement).not.toMatch(/https?:|\?|#/);
    }
  });

  it("keeps placement ids unique so reporting can separate source pages", () => {
    const ids = CONVERSION_PATHS.map((p) => p.placement);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("conversion tracking carries destination, source and placement", () => {
  it("builds a PII-free event for a money-page click", () => {
    const path = CONVERSION_PATHS.find((p) => p.placement === "confit_to_duck_fat_guide")!;
    const event = buildConversionPathClickEvent({
      destination: path.destination,
      intent: path.intent,
      placement: path.placement,
      sourcePath: path.sourcePath,
    });
    expect(event.name).toBe("internal_conversion_click");
    expect(event.params.destination_path).toBe(FAT);
    expect(event.params.source_path).toBe("/cook/duck-leg-confit");
    expect(event.params.placement).toBe("confit_to_duck_fat_guide");
    expect(JSON.stringify(event)).not.toMatch(/@|token|http/i);
  });
});

describe("sourcing rules survive the funnel sprint", () => {
  it("keeps D'Artagnan absent from data, routes and components", () => {
    expect(merchantById("dartagnan")).toBeUndefined();
    expect(MERCHANTS.some((m) => /artagnan/i.test(m.name))).toBe(false);
    const offenders: string[] = [];
    for (const root of ["src/routes", "src/data", "src/components", "src/lib"]) {
      for (const rel of readdirSync(root, { recursive: true }) as string[]) {
        const full = join(root, rel);
        if (!/\.(ts|tsx)$/.test(full) || !statSync(full).isFile()) continue;
        if (full.includes("__tests__")) continue;
        if (/artagnan/i.test(readFileSync(full, "utf8"))) offenders.push(full);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps US Wellness on duck fat only, at the exact affiliate URL", () => {
    expect(US_WELLNESS_DUCK_FAT_URL).toBe("https://grasslandbeefllc.sjv.io/xJoWgR");
    expect(merchantById("us-wellness-meats")!.affiliateUrl).toBe(US_WELLNESS_DUCK_FAT_URL);
    for (const link of COMMERCIAL_LINKS.filter((l) => l.merchantId === "us-wellness-meats")) {
      expect(link.category, link.id).toBe("duck_fat");
      expect(link.url, link.id).toBe(US_WELLNESS_DUCK_FAT_URL);
    }
    for (const placement of COMMERCIAL_PLACEMENTS) {
      const hasUsw = placement.linkIds.some((id) =>
        COMMERCIAL_LINKS.some((l) => l.id === id && l.merchantId === "us-wellness-meats"),
      );
      if (hasUsw) expect(placement.placement).toMatch(/fat/i);
    }
  });

  it("keeps Amazon equipment-only on the deliciousduck-20 tag", () => {
    const amazon = COMMERCIAL_LINKS.filter((l) => l.merchantId === "amazon");
    expect(amazon.length).toBeGreaterThan(0);
    for (const link of amazon) {
      expect(link.url, link.id).toContain("tag=deliciousduck-20");
      expect(link.category, link.id).not.toBe("duck_source");
    }
  });

  it("adds no outbound merchant CTA to editorial feeder pages", () => {
    for (const source of Object.keys(FUNNEL)) {
      if (source.startsWith("/buy/")) continue;
      const text = readFileSync(routeFile(source), "utf8");
      expect(text, source).not.toMatch(/grasslandbeefllc|amazon\.com|tag=deliciousduck-20/);
    }
  });
});
