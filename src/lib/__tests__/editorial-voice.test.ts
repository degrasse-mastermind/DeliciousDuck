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
    const BANNED = /\b(reader-approved|foolproof|guaranteed results|scientifically proven)\b/gi;
    const offenders: string[] = [];
    for (const file of publicFiles) {
      const text = readFileSync(file, "utf8");
      for (const m of text.matchAll(BANNED)) {
        // Policy copy that promises we will NOT use these words is fine.
        const context = text.slice(Math.max(0, (m.index ?? 0) - 200), m.index ?? 0);
        if (/\bnever\b|\bdo not\b|\bwe don't\b/i.test(context)) continue;
        offenders.push(`${file.replace(process.cwd() + "/", "")}: ${m[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
  it("states the gear evaluation basis positively, without testing-flavoured hedges", () => {
    const gear = readFileSync(join(ROUTES, "gear.index.tsx"), "utf8");
    expect(gear).toContain("compared using published specifications");
    expect(gear).not.toMatch(/hands-on review pending/i);
    expect(gear).not.toMatch(/not because we have tested/i);
  });

  /**
   * Files that *define* the documented-testing tiers or record the evidence a
   * tier requires. They describe the standard rather than claim it in reader copy.
   */
  const HANDS_ON_ALLOWED = [
    "components/site/RecipeTrustBox.tsx",
    "data/revenue.ts",
    "data/growth-ops.ts",
    "data/duck-drop.ts",
  ];

  it("flags undocumented first-person hands-on experience claims", () => {
    // Narrow, meaning-bearing claims only: an explicit kitchen of our own, or
    // an emphasised assertion that we cook/test the thing ourselves.
    const CLAIM =
      /\b(?:from|in) our (?:test )?kitchen\b|\bwe (?:have )?actually (?:cook|cooked)\b|\bwe personally (?:cook|cooked|test|tested)\b/gi;
    const offenders: string[] = [];
    for (const file of publicFiles) {
      const rel = file.replace(process.cwd() + "/", "").replace(/\\/g, "/");
      if (HANDS_ON_ALLOWED.some((frag) => rel.includes(frag))) continue;
      const text = readFileSync(file, "utf8");
      for (const m of text.matchAll(CLAIM)) {
        // Copy that explicitly denies hands-on testing is honest and allowed.
        const context = text.slice(Math.max(0, (m.index ?? 0) - 120), m.index ?? 0);
        if (/\bnot\b|\bnever\b|\bno\b|\byet\b|\bwhen\b/i.test(context)) continue;
        offenders.push(`${rel}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});


describe("editorial voice: preferred safety vocabulary", () => {
  it("labels structural safety headings by the official minimum, not the authority", () => {
    const offenders = publicFiles
      .filter((p) => /Food safety: the USDA number|USDA safety minimum/.test(readFileSync(p, "utf8")))
      .map((p) => p.replace(process.cwd() + "/", ""));
    expect(offenders).toEqual([]);

    const safetyNote = readFileSync(join(COMPONENTS, "site/SafetyNote.tsx"), "utf8");
    expect(safetyNote).toContain("Food safety: the official minimum");
  });

  it("keeps the doneness FAQ question and schema in sync on the official-minimum wording", async () => {
    const route = readFileSync(join(ROUTES, "tools.duck-doneness-guide.tsx"), "utf8");
    expect(route).toContain("Why is duck breast sometimes served below the official safe minimum?");
    expect(route).not.toMatch(/Why does breast doneness differ from USDA guidance\?/);
    // One FAQ array feeds both the visible list and the schema.
    expect(route.match(/Why is duck breast sometimes served below the official safe minimum\?/g))
      .toHaveLength(1);
    expect(route).toContain("165°F (73.9°C)");
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
