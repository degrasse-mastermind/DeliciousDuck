import { describe, expect, it } from "vitest";
import { SKETCH } from "../sketch-art";
import { sketchNameFromSrc, sketchPreloadHref, sketchSrcSet } from "../sketch-sources";

describe("sketchNameFromSrc", () => {
  it("keeps hyphenated names intact", () => {
    expect(sketchNameFromSrc("/assets/wild-vs-farmed.jpg")).toBe("wild-vs-farmed");
    expect(sketchNameFromSrc("/assets/sliced-breast.jpg")).toBe("sliced-breast");
    expect(sketchNameFromSrc("/assets/fruit-pairings.jpg")).toBe("fruit-pairings");
    expect(sketchNameFromSrc("/assets/gear-flatlay.jpg")).toBe("gear-flatlay");
    expect(sketchNameFromSrc("/assets/ducks-flight.jpg")).toBe("ducks-flight");
  });

  it("strips build hashes and variant widths", () => {
    expect(sketchNameFromSrc("/assets/wild-vs-farmed-Bk3xQ1a2.jpg")).toBe("wild-vs-farmed");
    expect(sketchNameFromSrc("/assets/confit-1400.webp")).toBe("confit");
    expect(sketchNameFromSrc("/assets/confit-700.webp")).toBe("confit");
  });
});

describe("responsive coverage", () => {
  it("resolves 700w and 1400w sources for every registry sketch", () => {
    const missing = Object.entries(SKETCH)
      .filter(([, art]) => {
        const set = sketchSrcSet(art.src);
        return !set || !set.includes("700w") || !set.includes("1400w");
      })
      .map(([key]) => key);
    expect(missing).toEqual([]);
  });

  it("preloads a webp variant rather than the JPEG", () => {
    for (const art of Object.values(SKETCH)) {
      expect(sketchPreloadHref(art.src)).toMatch(/\.webp$/);
    }
  });
});
