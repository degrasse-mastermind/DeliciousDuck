/**
 * Structured-data validation for CI.
 *
 * Crawls the sitemap of a running server, parses every JSON-LD block, and fails
 * on anything that would make Google discard the markup: invalid JSON, a missing
 * @context/@type, a required field absent for the declared type, a relative or
 * placeholder URL, or visible-FAQ/FAQPage drift risks (empty answers).
 *
 * It validates shape and self-consistency, not Google's full rich-result
 * eligibility — that still needs the Rich Results Test for spot checks.
 *
 * Usage: bun run scripts/validate-structured-data.ts [baseUrl]
 */

const BASE = (process.argv[2] ?? process.env["VALIDATE_BASE_URL"] ?? "http://localhost:8080").replace(
  /\/$/,
  "",
);

interface Problem {
  url: string;
  type: string;
  message: string;
}

const REQUIRED_FIELDS: Record<string, string[]> = {
  Article: ["headline"],
  NewsArticle: ["headline"],
  BlogPosting: ["headline"],
  Recipe: ["name", "recipeIngredient", "recipeInstructions"],
  FAQPage: ["mainEntity"],
  Product: ["name"],
  BreadcrumbList: ["itemListElement"],
  ItemList: ["itemListElement"],
  Organization: ["name"],
  WebSite: ["name"],
  HowTo: ["name", "step"],
};

function isBadUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (!/^https?:\/\//i.test(value)) return true;
  return /example\.com|localhost|your-domain|placeholder|TODO/i.test(value);
}

function walkUrls(node: unknown, path: string, out: Problem[], url: string): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walkUrls(item, `${path}[${i}]`, out, url));
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const here = `${path}.${key}`;
    if (
      (key === "url" || key === "@id" || key === "image" || key === "logo" || key === "sameAs") &&
      isBadUrl(value)
    ) {
      out.push({ url, type: "url", message: `${here} is not an absolute production URL: ${String(value)}` });
    }
    walkUrls(value, here, out, url);
  }
}

function validateNode(node: unknown, url: string, out: Problem[]): void {
  if (Array.isArray(node)) {
    node.forEach((item) => validateNode(item, url, out));
    return;
  }
  if (!node || typeof node !== "object") {
    out.push({ url, type: "shape", message: "JSON-LD block is not an object" });
    return;
  }
  const obj = node as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) {
    obj["@graph"].forEach((item) => validateNode(item, url, out));
    return;
  }

  const type = obj["@type"];
  if (typeof type !== "string" && !Array.isArray(type)) {
    out.push({ url, type: "shape", message: "JSON-LD block has no @type" });
    return;
  }
  if (!obj["@context"]) {
    out.push({ url, type: "shape", message: `@context missing on ${String(type)}` });
  }

  const types = Array.isArray(type) ? type.map(String) : [String(type)];
  for (const t of types) {
    for (const field of REQUIRED_FIELDS[t] ?? []) {
      const value = obj[field];
      const empty =
        value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
      if (empty) out.push({ url, type: t, message: `${t} is missing required field "${field}"` });
    }
  }

  if (types.includes("FAQPage") && Array.isArray(obj["mainEntity"])) {
    for (const [i, q] of (obj["mainEntity"] as Array<Record<string, unknown>>).entries()) {
      const answer = (q?.["acceptedAnswer"] as Record<string, unknown> | undefined)?.["text"];
      if (!q?.["name"]) out.push({ url, type: "FAQPage", message: `mainEntity[${i}] has no question name` });
      if (typeof answer !== "string" || answer.trim() === "") {
        out.push({ url, type: "FAQPage", message: `mainEntity[${i}] has an empty acceptedAnswer.text` });
      }
    }
  }

  walkUrls(obj, String(types[0]), out, url);
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": "DeliciousDuck-StructuredDataCI" } });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return await res.text();
}

async function sitemapPaths(): Promise<string[]> {
  const xml = await fetchText(`${BASE}/sitemap.xml`);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!.trim());
  if (locs.length === 0) throw new Error("sitemap.xml contained no <loc> entries");
  return locs.map((loc) => {
    try {
      return new URL(loc).pathname;
    } catch {
      return loc;
    }
  });
}

async function main() {
  const paths = await sitemapPaths();
  const problems: Problem[] = [];
  let blocks = 0;

  for (const path of paths) {
    const url = `${BASE}${path}`;
    let html: string;
    try {
      html = await fetchText(url);
    } catch (error) {
      problems.push({ url, type: "fetch", message: (error as Error).message });
      continue;
    }
    const scripts = [
      ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    ];
    if (scripts.length === 0) {
      // Policy and standards pages carry no rich-result-eligible entity, so
      // absent JSON-LD there is correct rather than a regression.
      if (!SCHEMA_EXEMPT_PATHS.has(path)) {
        problems.push({ url, type: "coverage", message: "no JSON-LD found on this page" });
      }
      continue;
    }
    for (const match of scripts) {
      blocks += 1;
      let parsed: unknown;
      try {
        parsed = JSON.parse(match[1]!);
      } catch (error) {
        problems.push({ url, type: "json", message: `unparseable JSON-LD: ${(error as Error).message}` });
        continue;
      }
      validateNode(parsed, url, problems);
    }
  }

  console.log(`Checked ${paths.length} URLs and ${blocks} JSON-LD blocks against ${BASE}`);
  if (problems.length === 0) {
    console.log("Structured data OK.");
    return;
  }
  console.error(`\n${problems.length} structured-data problem(s):`);
  for (const p of problems) console.error(`  [${p.type}] ${p.url}\n    ${p.message}`);
  process.exit(1);
}

await main();
