/**
 * The duck-breast cluster: one ordered pathway through the pages we already
 * have, expressed as data so the editorial component, the hub's "choose your
 * next answer" section, and the GA4 event builder cannot drift apart.
 *
 * Browser-safe and dependency-free: no network, no storage, no secrets. Every
 * destination is an internal route that already exists in `src/routes`.
 */

export const CLUSTER_GROUPS = ["before", "stove", "troubleshooting", "buying"] as const;

export type ClusterGroup = (typeof CLUSTER_GROUPS)[number];

export const CLUSTER_GROUP_LABELS: Record<ClusterGroup, string> = {
  before: "Before you cook",
  stove: "At the stove",
  troubleshooting: "Troubleshooting",
  buying: "Buying & equipment",
};

export interface ClusterStop {
  path: string;
  label: string;
  /** What the reader actually gets there — never a sales line. */
  note: string;
  group: ClusterGroup;
}

/** Ordered pathway: understand the method, cook it, fix it, then equip it. */
export const DUCK_BREAST_CLUSTER: ClusterStop[] = [
  {
    path: "/cook/how-to-cook-duck-breast",
    label: "How to cook duck breast",
    note: "The cold-pan method and why it works, before you commit to a recipe.",
    group: "before",
  },
  {
    path: "/cook/best-sauces-for-duck-breast",
    label: "Sauces for duck breast",
    note: "Decide the plate first — most sauces want the pan you just rendered in.",
    group: "before",
  },
  {
    path: "/recipes/pan-seared-duck-breast",
    label: "Pan-seared duck breast",
    note: "Quantities, timings and rest in one place, ready to cook from.",
    group: "stove",
  },
  {
    path: "/learn/duck-breast-temperature-doneness",
    label: "Temperature & doneness",
    note: "Pull temperatures, carryover during the rest, and who should cook further.",
    group: "stove",
  },
  {
    path: "/tools/duck-doneness-guide",
    label: "Doneness guide (tool)",
    note: "Pick a target and see the pull temperature to aim for.",
    group: "stove",
  },
  {
    path: "/learn/why-duck-skin-isnt-crispy",
    label: "Why the skin isn't crispy",
    note: "The failure you are most likely mid-way through, and what still fixes it.",
    group: "troubleshooting",
  },
  {
    path: "/gear/best-pan-for-duck-breast",
    label: "Pans for duck breast",
    note: "What thermal mass does through the render stage, and what to look for.",
    group: "buying",
  },
  {
    path: "/gear/best-thermometer-for-duck",
    label: "Thermometers for duck",
    note: "Why a probe beats a clock, and how to place it in a breast.",
    group: "buying",
  },
  {
    path: "/gear/best-knife-for-scoring-duck",
    label: "Knives for scoring",
    note: "Tip control through the fat cap without nicking the meat.",
    group: "buying",
  },
  {
    path: "/buy/where-to-buy-duck-online",
    label: "Where to buy duck online",
    note: "Which suppliers ship skin-on breast, and what to check on arrival.",
    group: "buying",
  },
];

export function clusterStopsByGroup(group: ClusterGroup): ClusterStop[] {
  return DUCK_BREAST_CLUSTER.filter((stop) => stop.group === group);
}

/** The stop a page is itself, so a page never links to itself in the pathway. */
export function clusterStopsExcluding(path?: string): ClusterStop[] {
  if (!path) return DUCK_BREAST_CLUSTER;
  return DUCK_BREAST_CLUSTER.filter((stop) => stop.path !== normalisePath(path));
}

/** Last path segment. Stable, low-cardinality, and never a full URL. */
export function destinationSlug(path: string): string {
  const parts = normalisePath(path).split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1]! : "home";
}

/**
 * Path only — query strings and hashes are stripped before anything reaches
 * analytics, because token-bearing URLs must never leave the page.
 */
export function normalisePath(path: string): string {
  const withoutHash = path.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  return withoutQuery.length > 1 ? withoutQuery.replace(/\/$/, "") : withoutQuery;
}

export const CLUSTER_CLICK_EVENT = "duck_breast_cluster_click";

export interface ClusterClickEvent {
  readonly name: typeof CLUSTER_CLICK_EVENT;
  readonly params: {
    readonly destination_slug: string;
    readonly destination_group: ClusterGroup;
    readonly source_path: string;
    readonly placement: string;
  };
}

/**
 * Pure GA4 event builder for a cluster navigation click. Emits four stable,
 * non-PII parameters only: never an address, token, query string, or full URL.
 */
export function buildClusterClickEvent(input: {
  destinationPath: string;
  destinationGroup: ClusterGroup;
  sourcePath?: string | undefined;
  placement: string;
}): ClusterClickEvent {
  return {
    name: CLUSTER_CLICK_EVENT,
    params: {
      destination_slug: destinationSlug(input.destinationPath),
      destination_group: input.destinationGroup,
      source_path: normalisePath(input.sourcePath ?? ""),
      placement: input.placement,
    },
  };
}
