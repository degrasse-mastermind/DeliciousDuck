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

import { sketchPlacements } from "@/components/site/SketchAutoLayout";
import { sketchRotationForPath } from "@/lib/sketch-art";

describe("sketchPlacements", () => {
  it("skips short pages", () => {
    expect(sketchPlacements({ sections: 3 })).toEqual([]);
    expect(sketchPlacements({ sections: 5 })).toEqual([]);
  });
  it("spaces placements and never trails the last block", () => {
    expect(sketchPlacements({ sections: 9 })).toEqual([4, 8]);
    expect(sketchPlacements({ sections: 8 })).toEqual([4]);
  });
  it("caps placements", () => {
    expect(sketchPlacements({ sections: 40 }).length).toBe(3);
  });
});

describe("sketchRotationForPath", () => {
  it("leads with the route art and adds unique companions", () => {
    const rot = sketchRotationForPath("/cook/duck-leg-confit");
    expect(rot[0]).toBe(SKETCH.confit);
    expect(new Set(rot).size).toBe(rot.length);
    expect(rot.length).toBeGreaterThan(2);
  });
  it("is empty for opted-out routes", () => {
    expect(sketchRotationForPath("/internal/growth")).toEqual([]);
  });
});
