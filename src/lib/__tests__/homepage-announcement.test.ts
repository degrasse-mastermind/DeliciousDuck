import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  HOME_ANNOUNCEMENT,
  homeAnnouncementPlacementIds,
} from "@/data/homepage-announcement";
import { CONVERSION_INTENTS, allConversionPlacementIds } from "@/data/conversion-paths";
import { SKETCH } from "@/lib/sketch-art";

const routeSource = readFileSync("src/routes/index.tsx", "utf8");
const bannerSource = readFileSync("src/components/site/HomeAnnouncement.tsx", "utf8");
const headerSource = readFileSync("src/components/site/Header.tsx", "utf8");
const rootSource = readFileSync("src/routes/__root.tsx", "utf8");
const stylesSource = readFileSync("src/styles.css", "utf8");
const hubSource = readFileSync("src/routes/learn.thanksgiving-duck-dinner.tsx", "utf8");
const sourcingSource = readFileSync("src/routes/buy.where-to-buy-duck-breast-online.tsx", "utf8");

const NON_HOMEPAGE_ROUTES = [
  "src/routes/learn.thanksgiving-duck-dinner.tsx",
  "src/routes/recipes.index.tsx",
  "src/routes/buy.index.tsx",
  "src/routes/tools.index.tsx",
];

describe("homepage seasonal announcement", () => {
  it("uses the exact approved copy", () => {
    expect(HOME_ANNOUNCEMENT.eyebrow).toBe("THANKSGIVING DUCK PLAN");
    expect(HOME_ANNOUNCEMENT.message).toBe("Menu, timeline, bird count & printable checklist");
    expect(HOME_ANNOUNCEMENT.ctaLabel).toBe("Plan the feast");
  });

  it("points at the Thanksgiving hub with one internal destination", () => {
    expect(HOME_ANNOUNCEMENT.to).toBe("/learn/thanksgiving-duck-dinner");
    expect(HOME_ANNOUNCEMENT.to).not.toMatch(/https?:/);
  });

  it("registers its placement id in the shared registry", () => {
    const ids = homeAnnouncementPlacementIds();
    expect(ids).toEqual(["home_announcement_thanksgiving_hub"]);
    expect(allConversionPlacementIds()).toContain("home_announcement_thanksgiving_hub");
    expect(CONVERSION_INTENTS).toContain(HOME_ANNOUNCEMENT.intent);
  });

  it("renders exactly once on the homepage, after the header and before the hero", () => {
    expect(routeSource.match(/<HomeAnnouncement \/>/g)).toHaveLength(1);
    expect(routeSource.indexOf("<HomeAnnouncement />")).toBeLessThan(
      routeSource.indexOf("<Hero />"),
    );
    // The global header/nav is rendered by the root shell above <Outlet />, and
    // the banner is not part of it.
    expect(rootSource).not.toContain("HomeAnnouncement");
    expect(headerSource).not.toContain("HomeAnnouncement");
    expect(rootSource.indexOf("<Header />")).toBeLessThan(rootSource.indexOf("<Outlet />"));
  });

  it("does not appear on representative non-homepage routes", () => {
    for (const file of NON_HOMEPAGE_ROUTES) {
      expect(readFileSync(file, "utf8")).not.toContain("HomeAnnouncement");
    }
  });

  it("exposes exactly one anchor, carrying the placement and shared tracking", () => {
    expect(bannerSource.match(/<Link/g)).toHaveLength(1);
    expect(bannerSource).not.toMatch(/<button/);
    expect(bannerSource).toContain("data-placement={announcement.placement}");
    expect(bannerSource).toContain("trackConversionPathClick");
    // Tracking happens on activation only — never during render.
    expect(bannerSource).toContain("onClick={() =>");
    expect(bannerSource).not.toMatch(/useEffect|posthog|gtag|impression/i);
    // Standard link behaviour preserved: no preventDefault, no manual navigation.
    expect(bannerSource).not.toContain("preventDefault");
    expect(bannerSource).not.toContain("window.location");
  });

  it("keeps the copy out of images and adds no heading", () => {
    expect(bannerSource).not.toMatch(/<h[1-6]/);
    expect(routeSource.match(/<h1/g) ?? []).toHaveLength(1);
    expect(routeSource).toContain('path: "/"');
  });

  it("uses the stable Thanksgiving illustration decoratively", () => {
    expect(bannerSource).toContain("SKETCH[announcement.art]");
    expect(HOME_ANNOUNCEMENT.art).toBe("thanksgivingPlan");
    expect(SKETCH.thanksgivingPlan.src).toBeTruthy();
    expect(bannerSource).toContain('alt=""');
    expect(bannerSource).toContain('aria-hidden="true"');
    // The hub's descriptive alt text is never repeated on the homepage.
    expect(bannerSource).not.toContain(SKETCH.thanksgivingPlan.alt);
  });

  it("is a plain seasonal strip: no dismiss, sticky, storage or date logic", () => {
    expect(bannerSource).not.toMatch(/dismiss|localStorage|sessionStorage|new Date|Date\.now/);
    expect(bannerSource).not.toMatch(/sticky|fixed/);
    expect(bannerSource).not.toMatch(/animate-/);
  });

  it("has an accessible link name, visible focus style and print suppression", () => {
    expect(bannerSource).toContain('aria-label={announcement.ctaAccessibleName}');
    expect(HOME_ANNOUNCEMENT.ctaAccessibleName).toBe("Plan your Thanksgiving duck dinner");
    expect(bannerSource).toContain("focus-visible:outline");
    expect(bannerSource).toContain("data-print-hide");
    expect(bannerSource).toContain("motion-reduce:transition-none");
  });

  it("styles itself from design tokens", () => {
    expect(bannerSource).toContain("bg-forest-deep");
    expect(bannerSource).toContain("text-cranberry");
    expect(bannerSource).toContain("paper-grain");
    expect(stylesSource).toContain("--cranberry:");
    expect(stylesSource).toContain("@utility paper-grain");
    expect(bannerSource).not.toMatch(/text-white|bg-black|#[0-9a-fA-F]{6}/);
  });

  it("leaves the Thanksgiving hub, its print rules and reciprocal paths intact", () => {
    expect(hubSource).toContain("thanksgiving-duck-dinner");
    expect(hubSource).toContain("data-print");
    expect(stylesSource).toContain("[data-print-hide]");
    expect(sourcingSource).toContain("breast_sourcing_to_pan_guide");
  });
});
