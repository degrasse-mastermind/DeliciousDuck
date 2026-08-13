import { describe, expect, it } from "vitest";
import {
  SKETCH_CONTEXTS,
  alternateFrame,
  resolveSketchVariant,
  steppedIntensity,
} from "../sketch-variants";

describe("sketch variants", () => {
  it("gives every context a complete spec", () => {
    for (const spec of Object.values(SKETCH_CONTEXTS)) {
      expect(spec.sizes).toMatch(/vw|px/);
      expect(["figure", "band", "backdrop", "aside"]).toContain(spec.role);
      expect(["whisper", "soft", "bold"]).toContain(spec.intensity);
    }
  });

  it("frames article breaks and bleeds section breaks", () => {
    expect(resolveSketchVariant("articleBreak").frame).toBe("framed");
    expect(resolveSketchVariant("sectionBreak").frame).toBe("bleed");
  });

  it("keeps tool panels and pull quotes at whisper", () => {
    expect(resolveSketchVariant("toolPanel").intensity).toBe("whisper");
    expect(resolveSketchVariant("pullQuote").intensity).toBe("whisper");
  });

  it("preloads only the page header", () => {
    expect(resolveSketchVariant("pageHeader").eager).toBe(true);
    expect(resolveSketchVariant("ctaStrip").eager).toBe(false);
  });

  it("applies overrides on top of a preset", () => {
    const spec = resolveSketchVariant("ctaStrip", { intensity: "bold", position: "left" });
    expect(spec.intensity).toBe("bold");
    expect(spec.position).toBe("left");
    expect(spec.role).toBe("backdrop");
  });

  it("falls back to the article break preset", () => {
    // @ts-expect-error unknown context at runtime
    expect(resolveSketchVariant("nope").frame).toBe("framed");
  });

  it("alternates framing and steps intensity down", () => {
    expect([0, 1, 2].map(alternateFrame)).toEqual(["framed", "bleed", "framed"]);
    expect([0, 1, 5].map(steppedIntensity)).toEqual(["soft", "whisper", "whisper"]);
  });
});
