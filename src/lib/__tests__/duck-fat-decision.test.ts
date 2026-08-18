import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DUCK_FAT_BUYING_GUIDE,
  DUCK_FAT_DECISIONS,
  duckFatDecisionFor,
  duckFatDecisionPlacementIds,
} from "@/data/duck-fat-decision";
import { allConversionPlacementIds } from "@/data/conversion-paths";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const routeFileFor = (path: string) => `src/routes/${path.split("/").filter(Boolean).join(".")}.tsx`;

describe("duck-fat render/buy/substitute module", () => {
  it("covers the three supporting pages in the cluster", () => {
    expect(DUCK_FAT_DECISIONS.map((d) => d.sourcePath).sort()).toEqual([
      "/cook/ways-to-use-duck-fat",
      "/ingredients/duck-fat-vs-butter-oil",
      "/learn/how-to-render-duck-fat",
    ]);
  });

  it("offers all three choices, with the buying guide exactly once per page", () => {
    for (const set of DUCK_FAT_DECISIONS) {
      expect(set.options.map((o) => o.choice)).toEqual(["render", "buy", "substitute"]);
      const buyLinks = set.options.filter((o) => o.to === DUCK_FAT_BUYING_GUIDE);
      expect(buyLinks, set.sourcePath).toHaveLength(1);
      expect(buyLinks[0]!.intent).toBe("sourcing");
    }
  });

  it("only links internal routes that exist, and never links a page to itself", () => {
    for (const set of DUCK_FAT_DECISIONS) {
      for (const option of set.options) {
        if (!option.to) continue;
        expect(option.to.startsWith("/")).toBe(true);
        expect(option.to).not.toContain("?");
        expect(option.to).not.toBe(set.sourcePath);
        expect(existsSync(resolve(process.cwd(), routeFileFor(option.to))), option.to).toBe(true);
        expect(option.placement, option.to).toBeTruthy();
        expect(option.linkLabel!.length).toBeGreaterThan(8);
      }
    }
  });

  it("keeps merchant detail out of the module", () => {
    const prose = DUCK_FAT_DECISIONS.flatMap((s) => [
      s.heading,
      s.intro,
      ...s.options.flatMap((o) => [o.when, o.verdict, o.why]),
    ]).join(" ");
    for (const banned of [
      /we tested/i,
      /hands-on/i,
      /\bendorse/i,
      /\$\d/,
      /\bin stock\b/i,
      /\bdiscount\b/i,
      /amazon|wellness|http/i,
      /shop now|buy now|click here/i,
    ]) {
      expect(prose).not.toMatch(banned);
    }
  });

  it("registers every placement id, uniquely, in the site-wide placement list", () => {
    const ids = duckFatDecisionPlacementIds();
    expect(ids.length).toBe(8);
    expect(new Set(ids).size).toBe(ids.length);
    const all = allConversionPlacementIds();
    for (const id of ids) {
      expect(id).toMatch(/^duck_fat_choice_[a-z0-9_]+$/);
      expect(all).toContain(id);
    }
    expect(new Set(all).size).toBe(all.length);
  });

  it("renders on each supporting route, and the buying guide is not also offered by the generic nav", () => {
    for (const set of DUCK_FAT_DECISIONS) {
      const file = read(routeFileFor(set.sourcePath));
      expect(file, set.sourcePath).toContain(`<DuckFatDecision sourcePath="${set.sourcePath}"`);
      if (file.includes("<ConversionPaths")) {
        expect(file, set.sourcePath).toContain("omit={[");
      }
      // No second inline link to the money page competing with the module.
      const buyLinks = file.match(/to="\/buy\/duck-fat-buying-guide"/g) ?? [];
      expect(buyLinks.length, set.sourcePath).toBeLessThanOrEqual(1);
    }
  });

  it("returns nothing for an unmapped page", () => {
    expect(duckFatDecisionFor("/cook/duck-confit")).toBeUndefined();
  });
});
