import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROUTES = join(process.cwd(), "src/routes");
const DATA = join(process.cwd(), "src/data");
const COMPONENTS = join(process.cwd(), "src/components");

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === "__tests__") return [];
    const p = join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

const publicFiles = [...walk(ROUTES), ...walk(COMPONENTS), ...walk(DATA)].filter(
  (p) => !p.includes("routes/internal.") && !p.includes("routes/api"),
);

/**
 * Pages where the identity of the safety authority genuinely helps the reader:
 * anywhere a culinary convention is deliberately contrasted with the official
 * safe minimum. See docs/editorial-style-guide.md.
 */
const ATTRIBUTION_ALLOWED = [
  "components/site/SafetyNote.tsx",
  "components/tools/DonenessGuide.tsx",
  "routes/tools.duck-doneness-guide.tsx",
  "routes/learn.duck-breast-temperature-doneness.tsx",
  "routes/learn.duck-vs-turkey-thanksgiving.tsx",
  "routes/guides.duck-cooking-starter-guide.tsx",
  "data/sources.ts",
  "data/acquisition-cluster.ts",
  "data/duck-drop.ts",
];

const isAllowed = (path: string) =>
  ATTRIBUTION_ALLOWED.some((frag) => path.replace(/\\/g, "/").includes(frag));

describe("editorial voice: quiet attribution", () => {
  const CLUTTER =
    /USDA (?:recommends|guidance is|guidance on|guidance treats|says|advises)|according to USDA|per USDA guidance|per USDA\b/;

  it("keeps institutional throat-clearing out of ordinary body copy", () => {
    const offenders = publicFiles
      .filter((p) => !isAllowed(p))
      .filter((p) => CLUTTER.test(readFileSync(p, "utf8")))
      .map((p) => p.replace(process.cwd() + "/", ""));

    expect(offenders).toEqual([]);
  });

  it("caps total institutional mentions across the public surface", () => {
    const total = publicFiles.reduce(
      (n, p) => n + (readFileSync(p, "utf8").match(/USDA/g)?.length ?? 0),
      0,
    );
    // Registry notes plus the doneness/safety pages that need the attribution.
    expect(total).toBeLessThanOrEqual(85);
  });

  it("keeps the centralised safety wording intact", async () => {
    const { USDA_SAFETY_LINE } = await import("@/data/sources");
    expect(USDA_SAFETY_LINE).toContain("165°F");
    expect(USDA_SAFETY_LINE).toContain("food thermometer");
  });
});

describe("editorial voice: unsupported claims", () => {
  it("never asserts first-person testing outside an explicit denial or policy", () => {
    const offenders: string[] = [];
    for (const p of publicFiles) {
      const text = readFileSync(p, "utf8");
      for (const m of text.matchAll(/(.{0,60})\bwe (?:have )?tested\b/gi)) {
        const before = m[1] ?? "";
        const denies = /not|never|un|no /i.test(before);
        if (!denies) offenders.push(`${p.replace(process.cwd() + "/", "")}: ${m[0].trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("bans padded authority phrasing", () => {
    const BANNED = /(.{0,140})\b(reader-approved|foolproof|guaranteed results|scientifically proven)\b/gi;
    const offenders: string[] = [];
    for (const file of publicFiles) {
      for (const m of readFileSync(file, "utf8").matchAll(BANNED)) {
        const sentence = (m[1] ?? "") + m[0];
        // "we will never describe an unvalidated recipe as ... foolproof" is policy copy.
        if (/\bnever\b|\bdo not\b|\bwe don't\b/i.test(sentence)) continue;
        offenders.push(`${file.replace(process.cwd() + "/", "")}: ${m[2]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("editorial voice: the style guide is discoverable", () => {
  it("exists and is linked from the README", () => {
    const guide = readFileSync(join(process.cwd(), "docs/editorial-style-guide.md"), "utf8");
    expect(guide).toMatch(/Voice/);
    expect(guide).toMatch(/Sourcing and attribution/);
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    expect(readme).toContain("docs/editorial-style-guide.md");
  });
});
