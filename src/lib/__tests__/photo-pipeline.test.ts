import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ASSETS = join(process.cwd(), "src/assets");
const manifest = JSON.parse(readFileSync(join(ASSETS, "photo-manifest.json"), "utf8")) as Record<
  string,
  { tone: string; variants: Record<string, number> }
>;

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("photography responsive pipeline", () => {
  it("every JPEG photo has generated WebP variants and a tone", () => {
    const photos = readdirSync(ASSETS)
      .filter((f) => f.endsWith(".jpg"))
      .map((f) => f.replace(/\.jpg$/, ""));
    expect(photos.length).toBeGreaterThan(10);
    for (const name of photos) {
      expect(manifest[name], `${name} missing from photo-manifest.json`).toBeTruthy();
      expect(manifest[name]!.tone).toMatch(/^#[0-9a-f]{6}$/);
      expect(existsSync(join(ASSETS, `${name}-700.webp`))).toBe(true);
    }
  });

  it("variant widths are never upscaled past the small slot", () => {
    for (const [name, entry] of Object.entries(manifest)) {
      const small = entry.variants["700"]!;
      const large = entry.variants["1400"];
      expect(small, name).toBeLessThanOrEqual(700);
      if (large !== undefined) expect(large, name).toBeGreaterThan(small);
    }
  });

  it("recipe cards and heroes render through the shared Photograph component", () => {
    const card = read("src/components/site/RecipeCard.tsx");
    expect(card).toContain("<Photograph");
    expect(card).toContain("PHOTO_SIZES.card");
    expect(card).not.toMatch(/<img\b/);

    const detail = read("src/routes/recipes.$slug.tsx");
    expect(detail).toContain("<Photograph");
    expect(detail).toContain("PHOTO_SIZES.hero");
  });

  it("Photograph carries srcset, sizes, intrinsic size, tone and lazy defaults", () => {
    const src = read("src/components/site/Photograph.tsx");
    expect(src).toContain("srcSet");
    expect(src).toContain("sizes");
    expect(src).toContain("backgroundColor: tone");
    expect(src).toContain('loading={priority ? "eager" : "lazy"}');
    expect(src).toContain("PHOTO_RATIO.width");
  });

  it("pillar tiles and the homepage hero use responsive photo sources", () => {
    expect(read("src/components/site/CategoryTile.tsx")).toContain("photoSrcSet(pillar.image)");
    expect(read("src/routes/index.tsx")).toContain("photoSrcSet(heroImg)");
  });
});
