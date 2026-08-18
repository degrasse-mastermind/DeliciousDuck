import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ROASTING_PANS, ROASTING_PAN_FACTORS } from "@/data/comparisons";

const ROUTE = "src/routes/gear.best-roasting-pan-for-duck.tsx";
const routeSource = readFileSync(ROUTE, "utf8");
const dataSource = readFileSync("src/data/comparisons.ts", "utf8");
const surfaces = `${routeSource}\n${dataSource}`;

/**
 * The approved brief for this guide prohibits invented universal dimensions,
 * fat volumes, and construction/performance claims. These patterns are the
 * exact claims editorial QA removed; they may only return alongside a directly
 * cited primary or manufacturer source registered in the source registry.
 */
const BANNED_CLAIMS: [RegExp, string][] = [
  [/13\s*[×x]\s*9/i, "invented universal pan dimension (13 × 9)"],
  [/14\s*[×x]\s*10/i, "invented universal pan dimension (14 × 10)"],
  [/16\s*[×x]\s*13/i, "invented universal pan dimension (16 × 13)"],
  [/\b12\s*(in|inch)\b/i, "invented universal 12-inch pan recommendation"],
  [/2\.5\s*[–-]\s*3\s*(in|inch)/i, "invented 2.5–3 inch depth rule"],
  [/sweet spot/i, "unsupported universal 'sweet spot' claim"],
  [/\b1\s*(in|inch)\b[^.]{0,30}(rim|clearance)/i, "fixed 1-inch rim/clearance rule"],
  [/\b1\s*(to|[–-])\s*1\.5\s*cups?/i, "invented rendered-fat volume"],
  [/under a cup/i, "invented rendered-fat volume"],
  [/pour off at least once|two pours|pour off more often/i, "invented pour count/frequency"],
  [/riveted rather than spot-welded/i, "unsupported construction claim"],
  [/won't warp|warps? at roasting|bow under/i, "unsupported warping/bowing claim"],
  [/should i add water[\s\S]{0,120}\bno\b/i, "universal 'no water' instruction"],
  [/\bthe best (choice|setup|pan)\b/i, "absolute 'best' claim"],
  [/most reliable choice|best of the three/i, "absolute superiority claim"],
];

describe("best roasting pan guide — comparison shape", () => {
  it("presents exactly four labelled setups", () => {
    expect(ROASTING_PANS).toHaveLength(4);
    expect(ROASTING_PANS.map((r) => r.id)).toEqual([
      "roaster-with-rack",
      "rimmed-sheet-with-rack",
      "cast-iron-setup",
      "disposable-foil-fallback",
    ]);
  });

  it("scores every setup on every decision factor", () => {
    for (const row of ROASTING_PANS) {
      for (const factor of ROASTING_PAN_FACTORS) {
        expect(row.decisionFactors[factor.key], `${row.id}/${factor.key}`).toBeTruthy();
      }
    }
  });

  it("treats the foil tray as a supported fallback, not a guarantee", () => {
    const foil = ROASTING_PANS.find((r) => r.id === "disposable-foil-fallback")!;
    const text = JSON.stringify(foil).toLowerCase();
    expect(text).toContain("sheet pan");
    expect(text).toMatch(/packaging|instructions/);
  });

  it("renders the four-setup comparison and the measured fit method", () => {
    expect(routeSource).toContain("Compare the four setups");
    expect(routeSource).toContain("FIT_METHOD");
    expect(routeSource).toMatch(/Measure bird and rack together/);
    expect(routeSource).toMatch(/clears? your oven|fits your oven/i);
    expect(routeSource).toMatch(/maximum oven temperature|maker's temperature/i);
  });

  it("compares flat and V racks", () => {
    expect(routeSource).toContain("Flat rack");
    expect(routeSource).toContain("V rack");
  });

  it("covers glass and ceramic suitability in the FAQ", () => {
    expect(routeSource).toMatch(/glass (or|and) ceramic/i);
    expect(routeSource).toMatch(/manufacturer's instructions/i);
  });

  it("binds page art explicitly instead of relying on keyword fallback", () => {
    expect(routeSource).toContain("autoSketch={false}");
    const art = readFileSync("src/lib/sketch-art.ts", "utf8");
    expect(art).toContain('"/gear/best-roasting-pan-for-duck": "roastingPans"');
    expect(art).toMatch(/roastingPans:\s*\{[\s\S]{0,300}transparent:\s*true/);
  });
});

describe("best roasting pan guide — removed claims stay removed", () => {
  for (const [pattern, label] of BANNED_CLAIMS) {
    it(`does not reintroduce: ${label}`, () => {
      const match = surfaces.match(pattern);
      expect(match?.[0] ?? null, `${label} found: ${match?.[0] ?? ""}`).toBeNull();
    });
  }
});
