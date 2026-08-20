/**
 * Internal-link graph.
 *
 * Every editorial link on the site is declared in data — guide `related`,
 * ingredient `related`, recipe `related`/`sourcing`/`equipment`/`leftovers`,
 * plus hub membership and the footer. This module reads those declarations and
 * exposes the graph so tests can enforce the linking rules instead of trusting
 * that each new page was wired up by hand.
 */

import { GUIDES } from "@/data/guides";
import { INGREDIENTS } from "@/data/ingredients";
import { RECIPES } from "@/data/recipes";
import { RECIPE_CONTENT } from "@/data/recipe-content";
import { TOOLS } from "@/data/tools";
import { FOOTER_COLUMNS, NAV_LINKS } from "@/data/site";

export type LinkSource = "editorial" | "hub" | "nav";

export interface LinkEdge {
  from: string;
  to: string;
  source: LinkSource;
}

export const recipePath = (slug: string) => `/recipes/${slug}`;

/** Every page the link rules apply to. */
export function indexablePages(): string[] {
  return [
    ...GUIDES.map((g) => g.path),
    ...INGREDIENTS.map((i) => i.path),
    ...RECIPES.map((r) => recipePath(r.slug)),
    ...TOOLS.filter((t) => t.status === "live" && t.to).map((t) => t.to!),
  ];
}

/** Editorial (in-content) links only — the ones that carry topical weight. */
export function editorialEdges(): LinkEdge[] {
  const edges: LinkEdge[] = [];
  const push = (from: string, to: string | undefined) => {
    if (to && to.startsWith("/") && to !== from) edges.push({ from, to, source: "editorial" });
  };

  for (const g of GUIDES) for (const to of g.related) push(g.path, to);
  for (const i of INGREDIENTS) for (const to of i.related) push(i.path, to);

  for (const content of Object.values(RECIPE_CONTENT)) {
    const from = recipePath(content.slug);
    for (const to of content.related) push(from, to);
    for (const s of content.sourcing) push(from, s.to);
    for (const e of content.equipment) push(from, e.to);
    for (const l of content.leftovers) push(from, l.to);
    if (content.imageCaption?.to) push(from, content.imageCaption.to);
  }

  return edges;
}

/** Hub + footer + nav links: real, but they don't count as topical support. */
export function structuralEdges(): LinkEdge[] {
  const edges: LinkEdge[] = [];
  for (const g of GUIDES) edges.push({ from: `/${g.pillar}`, to: g.path, source: "hub" });
  for (const i of INGREDIENTS) edges.push({ from: "/ingredients", to: i.path, source: "hub" });
  for (const r of RECIPES) edges.push({ from: "/recipes", to: recipePath(r.slug), source: "hub" });
  for (const t of TOOLS)
    if (t.status === "live" && t.to) edges.push({ from: "/tools", to: t.to, source: "hub" });
  for (const col of FOOTER_COLUMNS)
    for (const l of col.links) edges.push({ from: "*footer", to: l.to, source: "nav" });
  for (const l of NAV_LINKS) edges.push({ from: "*nav", to: l.to, source: "nav" });
  return edges;
}

export function allEdges(): LinkEdge[] {
  return [...editorialEdges(), ...structuralEdges()];
}

/** Distinct editorial inbound links per page. */
export function editorialInboundCounts(): Map<string, number> {
  const seen = new Map<string, Set<string>>();
  for (const e of editorialEdges()) {
    if (!seen.has(e.to)) seen.set(e.to, new Set());
    seen.get(e.to)!.add(e.from);
  }
  const counts = new Map<string, number>();
  for (const page of indexablePages()) counts.set(page, seen.get(page)?.size ?? 0);
  return counts;
}

/** Pages with fewer than `min` distinct editorial inbound links. */
export function underLinkedPages(min = 3): { path: string; inbound: number }[] {
  return [...editorialInboundCounts().entries()]
    .filter(([, n]) => n < min)
    .map(([path, inbound]) => ({ path, inbound }))
    .sort((a, b) => a.inbound - b.inbound || a.path.localeCompare(b.path));
}

/** Editorial links pointing at a path no page serves. */
export function brokenEditorialTargets(knownPaths: Iterable<string>): LinkEdge[] {
  const known = new Set(knownPaths);
  return editorialEdges().filter((e) => !known.has(e.to));
}

const outMap = () => {
  const map = new Map<string, Set<string>>();
  for (const e of editorialEdges()) {
    if (!map.has(e.from)) map.set(e.from, new Set());
    map.get(e.from)!.add(e.to);
  }
  return map;
};

/**
 * Same-cluster guide pairs where A links to B but B never links back.
 *
 * Reciprocity is only expected inside a cluster — a breast guide pointing at
 * the thermometer guide, say. Cross-cluster links stay deliberately one-way so
 * the funnel keeps its direction instead of turning into a link mesh.
 */
export function oneWayPairs(): { from: string; to: string }[] {
  const out = outMap();
  const cluster = new Map(GUIDES.map((g) => [g.path, g.cluster] as const));
  const pairs: { from: string; to: string }[] = [];
  for (const [from, targets] of out) {
    const fromCluster = cluster.get(from);
    if (!fromCluster) continue;
    for (const to of targets) {
      if (cluster.get(to) !== fromCluster) continue;
      if (!out.get(to)?.has(from)) pairs.push({ from, to });
    }
  }
  return pairs.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
}

/** Recipes that never link up to a technique/reference guide. */
export function recipesWithoutGuideLink(): string[] {
  const out = outMap();
  const guidePaths = new Set(GUIDES.map((g) => g.path));
  return RECIPES.map((r) => recipePath(r.slug))
    .filter((path) => ![...(out.get(path) ?? [])].some((to) => guidePaths.has(to)))
    .sort();
}

/** Cook/Learn guides that never link down to a recipe that uses the method. */
export function guidesWithoutRecipeLink(): string[] {
  const out = outMap();
  return GUIDES.filter((g) => g.pillar === "cook" || g.pillar === "learn")
    .filter((g) => ![...(out.get(g.path) ?? [])].some((to) => to.startsWith("/recipes/")))
    .map((g) => g.path)
    .sort();
}

/** Recipes with no sideways link to another recipe. */
export function recipesWithoutSiblingLink(): string[] {
  const out = outMap();
  return RECIPES.map((r) => recipePath(r.slug))
    .filter((path) => ![...(out.get(path) ?? [])].some((to) => to.startsWith("/recipes/")))
    .sort();
}
