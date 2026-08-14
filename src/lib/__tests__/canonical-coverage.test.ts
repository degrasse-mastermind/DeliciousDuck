import { describe, expect, it } from "vitest";
import { absUrl } from "@/lib/seo";
import { SITE } from "@/data/site";

/**
 * DEL-18 regression coverage.
 *
 * Acceptance is rendered HTML, not metadata objects: this suite enumerates the
 * routes advertised in sitemap.xml and asserts each rendered document contains
 * exactly one absolute, self-referencing canonical. It runs against the running
 * dev server (or CANONICAL_TEST_BASE_URL) and skips when no server is reachable,
 * so unit-only CI runs stay green.
 */
const BASE = process.env["CANONICAL_TEST_BASE_URL"] ?? "http://localhost:8080";

async function serverUp() {
  try {
    const res = await fetch(`${BASE}/sitemap.xml`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

const up = await serverUp();

describe("canonical normalization", () => {
  it("canonicalises the homepage with a trailing slash", () => {
    expect(absUrl("/")).toBe("https://deliciousduck.com/");
  });

  it("strips query strings and hashes and trailing slashes", () => {
    expect(absUrl("/privacy?utm_source=x#top")).toBe("https://deliciousduck.com/privacy");
    expect(absUrl("/buy/how-to-choose-duck/")).toBe("https://deliciousduck.com/buy/how-to-choose-duck");
  });

  it("uses the production origin", () => {
    expect(SITE.url).toBe("https://deliciousduck.com");
  });
});

describe.skipIf(!up)("rendered canonical coverage across sitemap routes", () => {
  it("every sitemap route renders exactly one absolute self-referencing canonical", async () => {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
    expect(locs.length).toBeGreaterThan(20);

    const failures: string[] = [];

    for (const loc of locs) {
      const path = loc.replace(SITE.url, "") || "/";
      expect(loc.startsWith(`${SITE.url}/`)).toBe(true);
      if (path === "/search" || path.startsWith("/internal/")) {
        failures.push(`${path}: non-indexable route present in sitemap`);
        continue;
      }

      const res = await fetch(`${BASE}${path}`);
      if (res.status !== 200) {
        failures.push(`${path}: HTTP ${res.status}`);
        continue;
      }
      const html = await res.text();
      const found = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*>/g)].map((m) => m[0]!);
      if (found.length !== 1) {
        failures.push(`${path}: ${found.length} canonical tags`);
        continue;
      }
      const href = /href="([^"]+)"/.exec(found[0]!)?.[1];
      if (!href || !href.startsWith("https://deliciousduck.com")) {
        failures.push(`${path}: non-absolute or wrong-origin canonical (${href})`);
        continue;
      }
      const expected = absUrl(path);
      if (href !== expected) {
        failures.push(`${path}: canonical ${href} does not self-reference (expected ${expected})`);
      }
    }

    expect(failures).toEqual([]);
  }, 180_000);

  it("keeps /search and /internal/* noindex and out of the sitemap", async () => {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    expect(xml).not.toContain("/search");
    expect(xml).not.toContain("/internal/");

    for (const path of ["/search", "/internal/growth-dashboard"]) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      expect(html).toMatch(/name="robots"[^>]*content="noindex/);
      expect(html).not.toContain('rel="canonical"');
    }
  }, 60_000);
});
