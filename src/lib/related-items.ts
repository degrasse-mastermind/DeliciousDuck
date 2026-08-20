/**
 * Resolver for editorial "related" links.
 *
 * `related` arrays in the guide, ingredient, and recipe registries are the
 * site's internal-link graph. A path that cannot be resolved to a title and a
 * teaser is silently dropped when the module renders, so the declared edge
 * exists in data and nowhere in the crawlable HTML. This module is the single
 * resolver used by both the rendering component and the link-graph tests, so
 * "declared" and "rendered" can never drift apart again.
 */

import { guideByPath } from "@/data/guides";
import { ingredientByPath } from "@/data/ingredients";
import { RECIPES } from "@/data/recipes";
import { TOOLS } from "@/data/tools";

export interface RelatedItem {
  path: string;
  title: string;
  teaser: string;
}

const recipeItems: Record<string, RelatedItem> = Object.fromEntries(
  RECIPES.map((r) => [
    `/recipes/${r.slug}`,
    { path: `/recipes/${r.slug}`, title: r.name, teaser: r.description },
  ]),
);

const toolItems: Record<string, RelatedItem> = Object.fromEntries(
  TOOLS.filter((t) => t.status === "live" && t.to).map((t) => [
    t.to!,
    { path: t.to!, title: t.name, teaser: t.promise },
  ]),
);

/** Resolves one related path, or `undefined` when nothing can render it. */
export function relatedItem(path: string): RelatedItem | undefined {
  const guide = guideByPath(path);
  if (guide) return { path: guide.path, title: guide.title, teaser: guide.teaser };
  const ingredient = ingredientByPath(path);
  if (ingredient) {
    return { path: ingredient.path, title: ingredient.title, teaser: ingredient.teaser };
  }
  return recipeItems[path] ?? toolItems[path];
}

/** Resolves a related list, dropping nothing that a page actually publishes. */
export function relatedItems(paths: readonly string[]): RelatedItem[] {
  return paths.map(relatedItem).filter((item): item is RelatedItem => Boolean(item));
}

/** Related paths that no registry can render. Should always be empty. */
export function unresolvableRelatedPaths(paths: readonly string[]): string[] {
  return paths.filter((p) => !relatedItem(p));
}
