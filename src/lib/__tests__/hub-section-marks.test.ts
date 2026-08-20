import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HUB_SECTION_MARKS } from "@/components/site/HubSectionMark";

const HUB_ROUTES = [
  "src/routes/cook.index.tsx",
  "src/routes/learn.index.tsx",
  "src/routes/buy.index.tsx",
  "src/routes/gear.index.tsx",
  "src/routes/ingredients.index.tsx",
];

describe("hub section marks", () => {
  it("every hub route carries at least one editorial mark", () => {
    for (const route of HUB_ROUTES) {
      expect(readFileSync(route, "utf8")).toContain("HubSectionMark");
    }
  });

  it("never repeats a mark id within one hub page", () => {
    for (const route of HUB_ROUTES) {
      const ids = [...readFileSync(route, "utf8").matchAll(/mark="([a-z-]+)"/g)].map((m) => m[1]);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("only references registered mark ids", () => {
    const registered = new Set(Object.keys(HUB_SECTION_MARKS));
    for (const route of HUB_ROUTES) {
      for (const m of readFileSync(route, "utf8").matchAll(/mark="([a-z-]+)"/g)) {
        expect(registered.has(m[1] ?? "")).toBe(true);
      }
    }
  });
});
