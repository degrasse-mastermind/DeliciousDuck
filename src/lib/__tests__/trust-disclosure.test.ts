import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LEGAL_LINKS } from "@/data/site";

/** DEL-5 trust/disclosure coverage: contact route, footer/sitemap wiring, corrected copy. */
const read = (p: string) => readFileSync(p, "utf8");

describe("contact route", () => {
  const src = read("src/routes/contact.tsx");

  it("registers the /contact file route with unique metadata", () => {
    expect(src).toContain('createFileRoute("/contact")');
    expect(src).toContain('title: "Contact DeliciousDuck"');
    expect(src).toContain('path: "/contact"');
  });

  it("uses hello@deliciousduck.com as the single contact address", () => {
    expect(src).toContain('const EMAIL = "hello@deliciousduck.com";');
    expect(src).not.toMatch(/privacy@|corrections@/);
  });

  it("offers subject suggestions and no contact form or response-time promise", () => {
    for (const subject of ["General question", "Correction", "Privacy request", "Partnership enquiry"]) {
      expect(src).toContain(subject);
    }
    expect(src).not.toContain("<form");
    expect(src).not.toMatch(/within \d+ (hours|business days)/i);
  });
});

describe("contact discoverability", () => {
  it("appears in the footer legal links", () => {
    expect(LEGAL_LINKS.some((l) => l.to === "/contact" && l.label === "Contact")).toBe(true);
  });

  it("appears in the XML sitemap entries", () => {
    expect(read("src/routes/sitemap[.]xml.ts")).toContain('{ path: "/contact"');
  });

  it("is linked from the about page closing trust links", () => {
    expect(read("src/routes/about.tsx")).toContain('<Link to="/contact"');
  });
});

describe("corrected trust copy", () => {
  it("privacy uses hello@ with a subject hint and non-stale change wording", () => {
    const src = read("src/routes/privacy.tsx");
    expect(src).not.toContain("privacy@deliciousduck.com");
    expect(src).toContain("hello@deliciousduck.com");
    expect(src).toContain("Privacy request");
    expect(src).not.toContain("including switching the newsletter on");
    expect(src).toContain("before that change takes effect");
    expect(src).toContain("Resend");
  });

  it("terms uses hello@ with a Correction subject and links to /contact", () => {
    const src = read("src/routes/terms.tsx");
    expect(src).not.toContain("corrections@deliciousduck.com");
    expect(src).toContain("mailto:hello@deliciousduck.com?subject=Correction");
    expect(src).toContain('href="/contact"');
  });

  it("affiliate disclosure separates affiliate, sponsored, and editorial coverage", () => {
    const src = read("src/routes/affiliate-disclosure.tsx");
    expect(src).toContain("qualifying action");
    expect(src).toContain("&ldquo;Sponsored&rdquo;");
    expect(src).toContain("omission of");
    expect(src).toContain("not evidence of hands-on");
    expect(src).toContain("do not currently claim any specific merchant partnerships");
  });

  it("sourcing page drops the absolute food-safety guarantee claim", () => {
    const src = read("src/routes/buy.where-to-buy-duck-online.tsx");
    expect(src).not.toContain("only way to guarantee food safety");
    expect(src).toContain("cold\n          chain across multi-day transit");
  });
});
