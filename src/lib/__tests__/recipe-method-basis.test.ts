import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RECIPES } from "@/data/recipes";

/**
 * Recipe disclosure QA: unverified recipes carry quiet "Method basis" metadata,
 * never a conspicuous negative status panel, and the "Kitchen verified" record
 * stays behind the full internal evidence gate.
 */
const read = (p: string) => readFileSync(p, "utf8");
const TRUST_BOX = read("src/components/site/RecipeTrustBox.tsx");

const NEGATIVE_PHRASES = [
  "Editorial working draft",
  "Not yet kitchen tested",
  "has not yet been cooked",
  "not been tested",
  "hasn't been tested",
  "Illustrative, not of this cook",
];

describe("unverified recipe pages", () => {
  it("render quiet Method basis microcopy instead of a status panel", () => {
    expect(TRUST_BOX).toContain("Method basis: ");
    expect(TRUST_BOX).toContain(
      "established culinary technique and published food-safety guidance",
    );
    expect(TRUST_BOX).toContain('aria-label="Recipe method basis"');
    // Subdued metadata styling, not a bordered callout panel.
    expect(TRUST_BOX).toContain("border-t border-border pt-3 text-xs");
  });

  it("keeps a restrained editorial-standards link and the temperature reminder", () => {
    expect(TRUST_BOX).toContain('href="/editorial-standards"');
    expect(TRUST_BOX).toContain("Cook to the stated internal temperatures");
  });

  it("renders no conspicuous negative testing or validation-ledger copy", () => {
    for (const phrase of NEGATIVE_PHRASES) {
      expect(TRUST_BOX, phrase).not.toContain(phrase);
    }
    // No draft-state ledger rows.
    expect(TRUST_BOX).not.toMatch(/Not yet|working draft/i);
  });
});

describe("kitchen-verified evidence gate", () => {
  it("requires the verification flag, a test date, and a passing outcome", () => {
    expect(TRUST_BOX).toContain('recipe.verification === "kitchenVerified"');
    expect(TRUST_BOX).toContain("Boolean(v.lastKitchenTest)");
    expect(TRUST_BOX).toContain('v.outcome === "pass" || v.outcome === "pass-with-revisions"');
  });

  it("only shows the verified record and test date behind that gate", () => {
    const verifiedBlock = TRUST_BOX.slice(TRUST_BOX.indexOf("if (!verified)"));
    expect(verifiedBlock).toContain("Kitchen verified");
    expect(verifiedBlock).toContain("{v.lastKitchenTest}");
  });

  it("has no published recipe currently claiming a kitchen test", () => {
    for (const r of RECIPES) {
      if (r.verification !== "kitchenVerified") continue;
      expect(r.validation.lastKitchenTest, r.slug).toBeTruthy();
      expect(["pass", "pass-with-revisions"], r.slug).toContain(r.validation.outcome);
    }
  });
});

describe("public recipe surfaces", () => {
  const PUBLIC = [
    "src/routes/recipes.$slug.tsx",
    "src/routes/recipes.index.tsx",
    "src/components/site/RelatedGuides.tsx",
    "src/routes/ingredients.cherry-plum-with-duck.tsx",
  ];

  it("carry no working-draft or untested status prose", () => {
    for (const p of PUBLIC) {
      const text = read(p).replace(/\s+/g, " ");
      expect(text, p).not.toMatch(/working draft|not yet kitchen tested|untested/i);
    }
  });
});
