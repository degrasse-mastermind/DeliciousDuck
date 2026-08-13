import { describe, it, expect } from "vitest";
import { sketchForPath, SKETCH } from "@/lib/sketch-art";

describe("sketchForPath fallbacks", () => {
  it("keeps exact mappings", () => {
    expect(sketchForPath("/cook/duck-leg-confit")).toBe(SKETCH.confit);
  });
  it("handles trailing slash + case", () => {
    expect(sketchForPath("/Cook/Duck-Leg-Confit/")).toBe(SKETCH.confit);
  });
  it("keyword-matches unmapped routes", () => {
    expect(sketchForPath("/cook/duck-breast-sous-vide")).toBe(SKETCH.duckBreastPan);
    expect(sketchForPath("/learn/how-to-store-duck-fat")).toBe(SKETCH.duckFat);
    expect(sketchForPath("/ingredients/blackberry-gastrique")).toBe(SKETCH.fruitPairings);
  });
  it("falls back to section then site default", () => {
    expect(sketchForPath("/gear/xyz")).toBe(SKETCH.gearFlatlay);
    expect(sketchForPath("/something-new")).toBe(SKETCH.ducksFlight);
  });
  it("opts out of internal, legal and home", () => {
    for (const p of ["/", "/internal/growth", "/privacy", "/terms"]) {
      expect(sketchForPath(p)).toBeNull();
    }
  });
});
