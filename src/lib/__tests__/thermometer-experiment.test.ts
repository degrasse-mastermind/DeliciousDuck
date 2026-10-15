import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { commercialLinkById, relForLink } from "@/data/commercial-links";
import { AMAZON_TAG } from "@/data/amazon";
import { guideByPath } from "@/data/guides";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("reviewed thermometer choices", () => {
  it.each([
    ["amazon-tp19h-thermometer", "B07XXSYLL8"],
    ["amazon-tp16-thermometer", "B017613C3C"],
  ])("keeps %s on its canonical product with the existing tag", (id, asin) => {
    const link = commercialLinkById(id)!;
    expect(link).toBeDefined();
    const url = new URL(link.url);
    expect(url.origin + url.pathname).toBe(`https://www.amazon.com/dp/${asin}`);
    expect(url.searchParams.getAll("tag")).toEqual([AMAZON_TAG]);
    expect(link.relationship).toBe("affiliate_active");
    expect(relForLink(link)).toBe("sponsored nofollow noopener");
    expect(link.disclosureLabel).toContain("may earn a commission");
  });

  it("places disclosure before researched picks and states the evidence basis", () => {
    const page = read("src/routes/gear.best-thermometer-for-duck.tsx");
    expect(page.indexOf("<DisclosureBanner")).toBeLessThan(
      page.indexOf('"amazon-tp19h-thermometer"'),
    );
    expect(page).toContain("not hands-on tests");
    expect(page).toContain("amazon-tp16-thermometer");
  });

  it("requires measured safety minimum without assumed carryover clearance", () => {
    const page = read("src/routes/learn.duck-breast-temperature-doneness.tsx");
    expect(page).toContain("165°F (74°C) measured before removal");
    expect(page).not.toContain("160°F");
    expect(page).not.toMatch(
      /free of the pathogens|removes the safety question|settles at|can climb 8-10/,
    );
    expect(page).toContain("Carryover varies");
    expect(page.replace(/\s+/g, " ")).toContain("below USDA's recommended minimum");
  });

  it("keeps the shared answer consistent with the measured endpoint", () => {
    const answer = guideByPath("/learn/duck-breast-temperature-doneness")!.answer;
    expect(answer).toContain("measured 165°F");
    expect(answer).not.toMatch(/Pull duck breast at 130|carryover takes/);
  });

  it("requires a measurement for confit and all whole-bird check locations", () => {
    const page = read("src/routes/learn.duck-breast-temperature-doneness.tsx");
    expect(page).not.toContain("the meat passes 165°F long before");
    expect(page).toContain("innermost thigh and wing and the thickest part of the breast");
    expect(page).toContain("Measure the meat at 165°F");
  });

  it("keeps email drafts on site guides with review-only unsubscribe placeholders", () => {
    const drafts = read("docs/thermometer-experiment-email-drafts.txt");
    expect(drafts).not.toMatch(/amazon\.com|tag=|deliciousduck-20/);
    expect(drafts).toContain("REVIEW DRAFTS ONLY");
    expect(drafts).toContain("not a working unsubscribe link");
    expect(drafts).toContain("https://deliciousduck.com/learn/thanksgiving-duck-dinner");
  });
});
