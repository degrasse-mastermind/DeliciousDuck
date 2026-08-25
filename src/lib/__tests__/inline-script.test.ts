import { describe, expect, it } from "vitest";

import { minifyInlineScript } from "@/lib/inline-script";
import { qaExclusionBootstrapScript } from "@/lib/qa-exclusion";
import { gtagBootstrapScript } from "@/lib/analytics-gate";

describe("minifyInlineScript", () => {
  it("drops indentation, blank lines and comment-only lines", () => {
    const out = minifyInlineScript(`
      (function () {
        // explanatory comment
        var a = 1;

        /* block comment */
        return a;
      })();
    `);
    expect(out).toBe("(function () {\nvar a = 1;\nreturn a;\n})();");
  });

  it("keeps protocol-relative and https URLs inside string literals intact", () => {
    const out = minifyInlineScript(`var src = 'https://example.com/tag.js?id=1'; // load`);
    expect(out).toContain("https://example.com/tag.js?id=1");
  });

  it("shrinks the head bootstraps without losing their behaviour markers", () => {
    for (const source of [qaExclusionBootstrapScript(), gtagBootstrapScript("G-TEST123")]) {
      const out = minifyInlineScript(source);
      expect(out.length).toBeLessThan(source.length);
      expect(out).not.toMatch(/^\s+/m);
      expect(out.split("(").length).toBe(source.split("(").length);
    }
  });

  it("keeps the gtag bootstrap's measurement id and loader hook", () => {
    const out = minifyInlineScript(gtagBootstrapScript("G-TEST123"));
    expect(out).toContain("G-TEST123");
    expect(out).toContain("googletagmanager.com");
  });
});
