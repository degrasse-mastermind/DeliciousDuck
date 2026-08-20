import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("photo and meta presentation rules", () => {
  it("recipe heroes use the shorter 3:2 crop while cards stay 4:3", () => {
    expect(read("src/routes/recipes.$slug.tsx")).toContain('ratio="3/2"');
    expect(read("src/components/site/RecipeCard.tsx")).not.toContain("ratio=");
  });

  it("Photograph keeps an intrinsic size for every crop", () => {
    const src = read("src/components/site/Photograph.tsx");
    for (const ratio of ["4/3", "3/2", "16/9"]) expect(src).toContain(`"${ratio}"`);
    expect(src).toContain("width={crop.width}");
    expect(src).toContain("height={crop.height}");
  });

  it("cards and detail headers share one stacked stats component", () => {
    expect(read("src/components/site/RecipeCard.tsx")).toContain("<MetaStats");
    expect(read("src/components/site/ArticleShell.tsx")).toContain("<MetaStats");
    expect(read("src/routes/recipes.$slug.tsx")).toContain("stats={[");
  });

  it("recipe hero photographs always carry a caption", () => {
    const detail = read("src/routes/recipes.$slug.tsx");
    expect(detail).toContain("content.imageCaption ?");
    expect((detail.match(/<figcaption/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("the article rail is tightened, not left as dead whitespace", () => {
    expect(read("src/components/site/ArticleShell.tsx")).toContain(
      "lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-12",
    );
  });
});
