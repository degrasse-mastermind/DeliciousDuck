import { describe, expect, it } from "vitest";
import {
  SKETCH_RENDER,
  SKETCH_STYLE_SUFFIX,
  sketchPrompt,
} from "@/lib/sketch-style";

describe("sketchPrompt", () => {
  it("appends the canonical style contract to the subject", () => {
    const prompt = sketchPrompt("a duck leg confit crisping in a skillet");
    expect(prompt.startsWith("a duck leg confit crisping in a skillet. ")).toBe(true);
    expect(prompt).toContain(SKETCH_STYLE_SUFFIX);
    expect(prompt.endsWith(".")).toBe(true);
  });

  it("normalizes trailing punctuation and whitespace", () => {
    expect(sketchPrompt("  a whole roast duck.  ")).toContain("a whole roast duck. Loose");
  });

  it("locks the shared palette, background and grounding language", () => {
    expect(SKETCH_STYLE_SUFFIX).toContain("plain solid white background");
    expect(SKETCH_STYLE_SUFFIX).toContain("warm terracotta, cream, kraft tan and soft charcoal");
    expect(SKETCH_STYLE_SUFFIX).toContain("faint horizontal pencil line");
    expect(SKETCH_STYLE_SUFFIX).toContain("no photorealism");
  });

  it("exposes consistent render tokens", () => {
    expect(SKETCH_RENDER.blend).toContain("mix-blend-multiply");
    expect(Object.keys(SKETCH_RENDER.intensity)).toEqual(["whisper", "soft", "bold"]);
  });
});
