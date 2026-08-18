import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : walk(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

const FILES = walk(SRC);

const BYLINE_COMPONENTS = [
  join(SRC, "components/site/DecisionGuide.tsx"),
  join(SRC, "components/site/AcquisitionArticle.tsx"),
];

describe("shared byline cleanup", () => {
  it("renders 'How we judge' linked to editorial standards", () => {
    for (const f of BYLINE_COMPONENTS) {
      const src = readFileSync(f, "utf8");
      expect(src, f).toContain("How we judge");
      expect(src, f).toContain('to="/editorial-standards"');
      // Only one editorial-standards link in the metadata line.
      expect(src.match(/How we judge/g)?.length, f).toBe(1);
    }
  });

  it("keeps the Updated date as a separate metadata item", () => {
    for (const f of BYLINE_COMPONENTS) {
      const src = readFileSync(f, "utf8");
      expect(src, f).toContain("Updated");
      expect(src, f).toContain("<time dateTime=");
    }
  });

  it("has no visible author byline or review sentence anywhere in src", () => {
    for (const f of FILES) {
      const src = readFileSync(f, "utf8");
      expect(src, f).not.toContain("By DeliciousDuck Editorial");
      expect(src, f).not.toContain("Reviewed against our editorial standards");
      expect(src, f).not.toMatch(/>\s*By\s+</);
      expect(src, f).not.toMatch(/\bBy <span/);
      expect(src, f).not.toMatch(/\bBy \{/);
    }
  });

  it("no longer carries a rendered reviewedBy field", () => {
    for (const f of [join(SRC, "data/decision-guides.ts"), join(SRC, "data/acquisition-cluster.ts")]) {
      expect(readFileSync(f, "utf8"), f).not.toContain("reviewedBy");
    }
  });
});
