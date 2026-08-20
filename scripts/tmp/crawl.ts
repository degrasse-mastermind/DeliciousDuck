import { sitemapPaths } from "@/lib/sitemap";
const BASE = "http://localhost:8080";
const paths = sitemapPaths();
const inbound = new Map<string, Set<string>>();
for (const p of paths) {
  const html = await (await fetch(BASE + p)).text();
  const main = html.split(/<footer/)[0] ?? html;
  const hrefs = new Set([...main.matchAll(/href="(\/[^"#?]*)"/g)].map(m=>m[1]!.replace(/\/$/,"")||"/"));
  for (const h of hrefs) {
    if (h === p) continue;
    if (!inbound.has(h)) inbound.set(h, new Set());
    inbound.get(h)!.add(p);
  }
}
const PRIORITY = ["/buy/where-to-buy-duck-online","/buy/duck-fat-buying-guide","/cook/how-to-cook-duck-breast","/cook/whole-roast-duck","/learn/how-to-render-duck-fat","/learn/whole-duck-cooking-time","/learn/why-duck-skin-isnt-crispy","/recipes/duck-leg-confit","/recipes/duck-a-lorange","/gear/best-pan-for-duck-breast","/gear/best-roasting-pan-for-duck","/guides/duck-cooking-starter-guide","/recipes/oven-roasted-duck-breast","/recipes/peking-duck-at-home"];
for (const p of PRIORITY) {
  const s = [...(inbound.get(p) ?? [])];
  console.log(p, s.length, JSON.stringify(s));
}
console.log("--- pages with <3 rendered inbound (excluding nav/footer-only) ---");
for (const p of paths) {
  const n = inbound.get(p)?.size ?? 0;
  if (n < 3) console.log("  ", p, n, JSON.stringify([...(inbound.get(p)??[])]));
}
