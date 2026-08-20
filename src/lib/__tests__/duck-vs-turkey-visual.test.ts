import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SKETCH, sketchForPath } from "@/lib/sketch-art";
import { routeInventory } from "@/lib/sketch-usage";

const PATH = "/learn/duck-vs-turkey-thanksgiving";
const page = readFileSync("src/routes/learn.duck-vs-turkey-thanksgiving.tsx", "utf8");
const shell = readFileSync("src/components/site/ArticleShell.tsx", "utf8");
const header = readFileSync("src/components/site/Header.tsx", "utf8");
const registry = readFileSync("src/lib/sketch-art.ts", "utf8");

const ASSET_DIR = "src/assets/sketch";

/** Minimal PNG IHDR reader: width, height, colour type. */
function readPng(file: string) {
  const buf = readFileSync(file);
  expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    colorType: buf.readUInt8(25),
  };
}

describe("duck vs turkey hero artwork", () => {
  it("ships a transparent 1400x800 master with alpha-preserving WebP variants", () => {
    const png = readPng(`${ASSET_DIR}/duck-vs-turkey.png`);
    expect(png.width).toBe(1400);
    expect(png.height).toBe(800);
    // 6 = truecolour with alpha. 2 (truecolour, no alpha) would mean the
    // transparency was flattened on export.
    expect(png.colorType).toBe(6);

    for (const variant of ["duck-vs-turkey-700.webp", "duck-vs-turkey-1400.webp"]) {
      const file = `${ASSET_DIR}/${variant}`;
      expect(existsSync(file), `missing ${variant}`).toBe(true);
      const buf = readFileSync(file);
      expect(buf.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(buf.subarray(8, 12).toString("ascii")).toBe("WEBP");
      // Alpha survives as either an ALPH chunk (lossy) or VP8L (lossless).
      const head = buf.subarray(0, 64).toString("ascii");
      expect(/ALPH|VP8L|VP8X/.test(head), `${variant} has no alpha container`).toBe(true);
    }
  });

  it("is registered as transparent so it is never multiplied onto the page", () => {
    expect(SKETCH.duckVsTurkey.transparent).toBe(true);
    expect(SKETCH.duckVsTurkey.alt.toLowerCase()).toContain("turkey");
    const figure = readFileSync("src/components/site/SketchFigure.tsx", "utf8");
    expect(figure).toContain("art.transparent");
  });

  it("binds the route explicitly in BY_PATH rather than by keyword fallback", () => {
    expect(registry).toContain(`"${PATH}": "duckVsTurkey"`);
    expect(sketchForPath(PATH)).toBe(SKETCH.duckVsTurkey);
    expect(sketchForPath(PATH)).not.toBe(SKETCH.ducksFlight);
    // Trailing slash and casing resolve to the same binding.
    expect(sketchForPath("/Learn/Duck-Vs-Turkey-Thanksgiving/")).toBe(SKETCH.duckVsTurkey);
  });

  it("never lets another published route inherit the comparison image", () => {
    const leaked = routeInventory().filter(
      (p) => p !== PATH && sketchForPath(p) === SKETCH.duckVsTurkey,
    );
    expect(leaked).toEqual([]);
  });

  it("only reaches the comparison art through turkey/Thanksgiving keywords", () => {
    expect(sketchForPath("/learn/thanksgiving-duck-planner")).toBe(SKETCH.duckVsTurkey);
    // Generic holiday-adjacent slugs keep their own art.
    expect(sketchForPath("/cook/whole-roast-duck")).toBe(SKETCH.wholeRoastDuck);
    expect(sketchForPath("/learn/how-to-carve-a-duck")).toBe(SKETCH.carving);
    expect(registry.includes('["holiday"')).toBe(false);
  });
});

describe("duck vs turkey page sequencing and next steps", () => {
  it("opts out of blind auto-placement", () => {
    expect(page).toContain("autoSketch={false}");
  });

  it("places exactly one thermometer illustration with the safety section", () => {
    const slots = page.match(/<SketchSlot/g) ?? [];
    expect(slots.length).toBe(1);
    expect(page).toContain("art={SKETCH.thermometer}");

    const safety = page.indexOf('id="safety"');
    const slot = page.indexOf("<SketchSlot");
    const leftovers = page.indexOf('id="leftovers"');
    expect(safety).toBeGreaterThan(-1);
    expect(slot).toBeGreaterThan(safety);
    expect(slot).toBeLessThan(leftovers);
  });

  it("uses neither the scoring art nor a second copy of the hero in body", () => {
    expect(page.includes("SKETCH.scoring")).toBe(false);
    expect(page.includes("SKETCH.ducksFlight")).toBe(false);
    expect(page.includes("SKETCH.duckVsTurkey")).toBe(false);
  });

  it("shows one split next-step unit immediately after the verdict", () => {
    const choices = page.match(/<VerdictChoice/g) ?? [];
    expect(choices.length).toBe(1);
    const verdict = page.indexOf('id="verdict"');
    const choice = page.indexOf("<VerdictChoice");
    const compare = page.indexOf('id="compare"');
    expect(choice).toBeGreaterThan(verdict);
    expect(choice).toBeLessThan(compare);

    // Both branches are useful internal routes, no merchant CTA.
    for (const to of [
      "/tools/whole-duck-serving-calculator",
      "/cook/whole-roast-duck",
      "/cook/how-to-cook-duck-breast",
      "/cook/duck-leg-confit",
    ]) {
      expect(page.includes(to), `split CTA missing ${to}`).toBe(true);
    }
  });

  it("keeps split-CTA analytics placements unique and page-scoped", () => {
    const placements = [...page.matchAll(/placement: "([^"]+)"/g)].map((m) => m[1]!);
    expect(placements.length).toBe(4);
    expect(new Set(placements).size).toBe(placements.length);
    for (const p of placements) expect(p.startsWith("duck-vs-turkey-verdict-")).toBe(true);
  });

  it("still carries exactly one newsletter and one conversion band", () => {
    expect((page.match(/<NewsletterSignup/g) ?? []).length).toBe(1);
    expect((page.match(/<DecisionNextSteps/g) ?? []).length).toBe(1);
    expect(page.includes("CommercialLink")).toBe(false);
    expect(page.includes("AffiliateCallout")).toBe(false);
  });

  it("keeps FAQs and related guides after the decisive next step", () => {
    expect(page.indexOf("<VerdictChoice")).toBeLessThan(page.indexOf("<FaqList"));
    expect(page.indexOf("<FaqList")).toBeLessThan(page.indexOf("<RelatedGuides"));
  });
});

describe("comparison table mobile affordance", () => {
  it("offers a scroll hint and edge fade that resolve at the end of the track", () => {
    expect(shell).toContain("Scroll to compare");
    expect(shell).toContain("End of table");
    expect(shell).toContain("setAtEnd");
    expect(shell).toContain("aria-describedby");
  });

  it("stays a semantic, keyboard-reachable table", () => {
    expect(shell).toContain('scope="row"');
    expect(shell).toContain('scope="col"');
    expect(shell).toContain('role="group"');
    expect(shell).toContain("tabIndex={0}");
    expect(shell).toContain("focus-visible:outline");
    expect(shell).toContain("<caption");
  });

  it("respects reduced motion and clips its own overflow", () => {
    expect(shell).toContain("motion-safe:transition-opacity");
    expect(shell).toContain("overflow-x-auto");
    expect(shell).toContain('aria-hidden="true"');
  });
});

describe("mobile header lead-magnet CTA", () => {
  it("adds a compact Free Guide button below lg only", () => {
    expect(header).toContain("data-mobile-guide-cta");
    const cta = header.slice(header.indexOf("data-mobile-guide-cta"));
    expect(cta).toContain("lg:hidden");
    expect(cta).toContain("min-h-11");
    expect(cta).toContain("bg-primary");
    expect(cta).toContain("text-primary-foreground");
    expect(cta).toContain("focus-visible:outline");
    expect(header).toContain("Free Guide");
  });

  it("links the existing lead-magnet destination", () => {
    expect(header).toContain('hash="starter-guide"');
    expect((header.match(/hash="starter-guide"/g) ?? []).length).toBe(3);
  });

  it("preserves the desktop header actions with a compact search affordance", () => {
    expect(header).toContain('className="hidden items-center gap-3 lg:flex"');
    expect(header).toContain('aria-label="Search DeliciousDuck"');
    expect(header).toContain("<SearchField");
    expect(header).toContain("Free Guide");
  });
});
