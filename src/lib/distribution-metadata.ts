/**
 * One reliable distribution-metadata source per page.
 *
 * Canonical URL, cluster name, social copy, Pinterest copy, primary image and a
 * share-safe page URL all resolve from the registries that already exist
 * (`GUIDES`, `RECIPES`, the sketch art map). Nothing here renders UI: it exists
 * so future Pinterest, social and newsletter assets read the same values the
 * pages themselves publish, instead of re-deriving copy that then drifts.
 *
 * Browser-safe, pure, and dependency-free. Every URL is absolutised through
 * `absUrl`, which strips query strings and hashes — so a share URL can never
 * carry a mailbox token or campaign parameter.
 */

import { GUIDES } from "@/data/guides";
import { RECIPES } from "@/data/recipes";
import { absUrl } from "@/lib/seo";
import { sketchForPath } from "@/lib/sketch-art";

/** Named content clusters that distribution assets are built around. */
export const DISTRIBUTION_CLUSTERS = ["duck-breast"] as const;

export type DistributionCluster = (typeof DISTRIBUTION_CLUSTERS)[number];

/**
 * The duck-breast search cluster, in reading order: cornerstone, the two
 * support intents, and the recipe execution page.
 */
export const DUCK_BREAST_CLUSTER_PATHS = [
  "/cook/how-to-cook-duck-breast",
  "/learn/duck-breast-temperature-doneness",
  "/learn/why-duck-skin-isnt-crispy",
  "/recipes/pan-seared-duck-breast",
] as const;

export interface DistributionMetadata {
  path: string;
  /** Self-referencing canonical URL, absolute and normalised. */
  canonicalUrl: string;
  /** Same value, named for share/embed use so callers never build their own. */
  shareUrl: string;
  cluster: DistributionCluster;
  title: string;
  description: string;
  /** Shorter, hook-first headline for social cards. */
  socialTitle: string;
  socialDescription: string;
  /** Pinterest reads longer, benefit-led copy than Open Graph. */
  pinterestTitle: string;
  pinterestDescription: string;
  /** Absolute URL of the page's primary image. */
  primaryImage: string;
  primaryImageAlt: string;
}

interface Override {
  socialTitle: string;
  socialDescription: string;
  pinterestTitle: string;
  pinterestDescription: string;
}

const OVERRIDES: Record<string, Override> = {
  "/cook/how-to-cook-duck-breast": {
    socialTitle: "Duck breast, cooked in a cold pan",
    socialDescription:
      "Start it cold, raise the heat slowly, pour off the fat: the method that renders the fat cap before the skin can burn.",
    pinterestTitle: "How to Cook Duck Breast with Crispy Skin (Cold-Pan Method)",
    pinterestDescription:
      "Scoring, gradual rendering, when to flip, the pull temperature to aim for, and how long to rest it — plus the five ways duck breast usually goes wrong.",
  },
  "/learn/duck-breast-temperature-doneness": {
    socialTitle: "What temperature should duck breast be?",
    socialDescription:
      "Pull temperatures by doneness, how much carryover to expect during the rest, and where the 165°F poultry minimum applies.",
    pinterestTitle: "Duck Breast Temperature Chart: Pull Temps, Carryover & Doneness",
    pinterestDescription:
      "The numbers that matter for duck breast, legs and whole birds, with probe placement and the difference between kitchen convention and the official minimum.",
  },
  "/learn/why-duck-skin-isnt-crispy": {
    socialTitle: "Why your duck skin isn't crispy",
    socialDescription:
      "Wet skin, a hot start, a crowded pan, fat left in the pan, or a flip too early — and what still fixes it mid-cook.",
    pinterestTitle: "Why Duck Skin Isn't Crispy — 5 Causes and the Fix for Each",
    pinterestDescription:
      "Diagnose the failure you are mid-way through: what each cause looks and sounds like, what still rescues the cook, and what to change next time.",
  },
  "/recipes/pan-seared-duck-breast": {
    socialTitle: "Pan-seared duck breast",
    socialDescription:
      "Quantities, timings and rest in one place: render cold, finish hot, rest before slicing.",
    pinterestTitle: "Pan-Seared Duck Breast Recipe (Crispy Skin, Rosy Centre)",
    pinterestDescription:
      "A two-serving duck breast recipe with cold-pan rendering, thermometer targets, resting time and what to pour over the pan afterwards.",
  },
};

const CLUSTER_FOR_PATH: Record<string, DistributionCluster> = Object.fromEntries(
  DUCK_BREAST_CLUSTER_PATHS.map((p) => [p, "duck-breast" as const]),
);

function base(path: string): { title: string; description: string; image?: string; alt?: string } | null {
  const guide = GUIDES.find((g) => g.path === path);
  if (guide) {
    const art = sketchForPath(path);
    return {
      title: guide.seoTitle,
      description: guide.description,
      ...(art ? { image: art.src, alt: art.alt } : {}),
    };
  }
  const recipe = RECIPES.find((r) => `/recipes/${r.slug}` === path);
  if (recipe) {
    return {
      title: recipe.name,
      description: recipe.description,
      image: recipe.image,
      ...(recipe.imageAlt ? { alt: recipe.imageAlt } : { alt: `${recipe.name}, finished and sliced` }),
    };
  }
  return null;
}

/** Full distribution metadata for a page, or `null` when it is not registered. */
export function distributionMetadata(path: string): DistributionMetadata | null {
  const cluster = CLUSTER_FOR_PATH[path];
  const source = base(path);
  const override = OVERRIDES[path];
  if (!cluster || !source || !override || !source.image) return null;
  const url = absUrl(path);
  return {
    path,
    canonicalUrl: url,
    shareUrl: url,
    cluster,
    title: source.title,
    description: source.description,
    socialTitle: override.socialTitle,
    socialDescription: override.socialDescription,
    pinterestTitle: override.pinterestTitle,
    pinterestDescription: override.pinterestDescription,
    primaryImage: absUrl(source.image),
    primaryImageAlt: source.alt ?? source.title,
  };
}

/** Every registered page in one cluster, in reading order. */
export function clusterDistributionMetadata(
  cluster: DistributionCluster,
): DistributionMetadata[] {
  return DUCK_BREAST_CLUSTER_PATHS.filter((p) => CLUSTER_FOR_PATH[p] === cluster)
    .map((p) => distributionMetadata(p))
    .filter((m): m is DistributionMetadata => m !== null);
}
