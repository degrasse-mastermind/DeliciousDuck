import { RECIPES } from "@/data/recipes";
import { RECIPE_CONTENT } from "@/data/recipe-content";
import { GUIDES } from "@/data/guides";
import { INGREDIENTS } from "@/data/ingredients";
import { TOOLS } from "@/data/tools";
import { SITE_URL } from "@/data/site";

export type ContentKind = "recipe" | "guide" | "ingredient" | "tool";

export interface ContentItem {
  kind: ContentKind;
  title: string;
  path: string;
  url: string;
  summary: string;
  /** Recipe slug when kind === "recipe". */
  slug?: string;
  tags: string[];
}

const url = (path: string) => `${SITE_URL}${path}`;

export function contentIndex(): ContentItem[] {
  const recipes: ContentItem[] = RECIPES.map((r) => ({
    kind: "recipe",
    title: r.name,
    path: `/recipes/${r.slug}`,
    url: url(`/recipes/${r.slug}`),
    summary: r.description,
    slug: r.slug,
    tags: [r.category, r.difficulty, r.keyTechnique, ...(r.cuisine ? [r.cuisine] : [])],
  }));

  const guides: ContentItem[] = GUIDES.map((g) => ({
    kind: "guide",
    title: g.title,
    path: g.path,
    url: url(g.path),
    summary: g.teaser || g.description,
    tags: [g.pillar, g.cluster, g.kind],
  }));

  const ingredients: ContentItem[] = INGREDIENTS.map((i) => ({
    kind: "ingredient",
    title: i.title,
    path: i.path,
    url: url(i.path),
    summary: i.teaser || i.description,
    tags: [i.cluster],
  }));

  const tools: ContentItem[] = TOOLS.filter((t) => t.status === "live" && t.to).map((t) => ({
    kind: "tool",
    title: t.name,
    path: t.to as string,
    url: url(t.to as string),
    summary: t.summary,
    tags: [t.useCase],
  }));

  return [...recipes, ...guides, ...ingredients, ...tools];
}

export function searchContent(query: string, kind?: ContentKind, limit = 10): ContentItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const pool = kind ? contentIndex().filter((i) => i.kind === kind) : contentIndex();
  if (terms.length === 0) return pool.slice(0, limit);

  const scored = pool
    .map((item) => {
      const haystack = `${item.title} ${item.summary} ${item.tags.join(" ")} ${item.path}`.toLowerCase();
      const score = terms.reduce((acc, term) => {
        if (!haystack.includes(term)) return acc;
        return acc + (item.title.toLowerCase().includes(term) ? 3 : 1);
      }, 0);
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.item);
}

export function recipeDetail(slug: string) {
  const recipe = RECIPES.find((r) => r.slug === slug);
  const content = RECIPE_CONTENT[slug];
  if (!recipe || !content) return undefined;

  return {
    slug: recipe.slug,
    name: recipe.name,
    url: url(`/recipes/${recipe.slug}`),
    description: recipe.description,
    category: recipe.category,
    cuisine: recipe.cuisine ?? null,
    difficulty: recipe.difficulty,
    keyTechnique: recipe.keyTechnique,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    recipeYield: recipe.recipeYield,
    // Editorial trust state — never present a draft recipe as kitchen-tested.
    verification: recipe.verification,
    intro: content.intro,
    confidence: content.confidence,
    ingredientGroups: content.ingredientGroups,
    equipment: content.equipment.map((e) => ({ label: e.label, why: e.why })),
    before: content.before,
    steps: content.steps,
    temperatures: content.temperatures,
    troubleshooting: content.quackFix,
    leftovers: content.leftovers.map((l) => ({ part: l.part, use: l.use })),
    faq: content.faq,
    related: content.related.map((path) => url(path)),
  };
}

export function recipeSlugs(): string[] {
  return RECIPES.filter((r) => RECIPE_CONTENT[r.slug]).map((r) => r.slug);
}
