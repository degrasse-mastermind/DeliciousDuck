import { describe, expect, it } from "vitest";
import {
  BACKGROUND_OPTIONS,
  DEFAULT_REGEN_OPTIONS,
  LINE_OPTIONS,
  PALETTE_OPTIONS,
  SHADING_OPTIONS,
  buildSketchPrompt,
  isHouseStyle,
} from "../sketch-regen";
import { SKETCH_STYLE, sketchPrompt } from "../sketch-style";

describe("sketch regeneration options", () => {
  it("matches the house prompt when nothing is changed", () => {
    expect(buildSketchPrompt("a roast duck")).toBe(sketchPrompt("a roast duck"));
  });

  it("keeps the medium, composition and avoid clauses in every variant", () => {
    const prompt = buildSketchPrompt("a duck leg", {
      palette: "cooler",
      line: "bold",
      background: "bare",
      shading: "bold",
    });
    expect(prompt).toContain(SKETCH_STYLE.medium);
    expect(prompt).toContain(SKETCH_STYLE.composition);
    expect(prompt).toContain(SKETCH_STYLE.avoid);
  });

  it("substitutes the selected clauses", () => {
    const prompt = buildSketchPrompt("a duck breast", {
      palette: "warmer",
      background: "shadow",
    });
    expect(prompt).toContain(PALETTE_OPTIONS.warmer.clause);
    expect(prompt).toContain(BACKGROUND_OPTIONS.shadow.clause);
    expect(prompt).not.toContain(SKETCH_STYLE.palette);
  });

  it("appends an optional note last", () => {
    const prompt = buildSketchPrompt("a jar of fat", { note: "crisper skin." });
    expect(prompt.endsWith("crisper skin.")).toBe(true);
  });

  it("detects house style", () => {
    expect(isHouseStyle(DEFAULT_REGEN_OPTIONS)).toBe(true);
    expect(isHouseStyle({ ...DEFAULT_REGEN_OPTIONS, line: "sketchy" })).toBe(false);
    expect(isHouseStyle({ ...DEFAULT_REGEN_OPTIONS, note: "  " })).toBe(true);
  });

  it("gives every option a non-empty clause", () => {
    for (const set of [PALETTE_OPTIONS, LINE_OPTIONS, BACKGROUND_OPTIONS, SHADING_OPTIONS]) {
      for (const option of Object.values(set)) {
        expect(option.clause.length).toBeGreaterThan(10);
        expect(option.label.length).toBeGreaterThan(2);
      }
    }
  });

  it("stays deterministic for the same options", () => {
    const opts = { palette: "richer", line: "fine" } as const;
    expect(buildSketchPrompt("a duck", opts)).toBe(buildSketchPrompt("a duck", opts));
  });
});
