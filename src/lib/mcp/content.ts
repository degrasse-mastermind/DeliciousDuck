/**
 * Shared, dependency-light view of DeliciousDuck's published content for the
 * MCP tools. Everything here is already public on deliciousduck.com.
 */
import { SITE_URL } from "@/data/site";
import { GUIDES } from "@/data/guides";
import { INGREDIENTS } from "@/data/ingredients";
import { TOOLS } from "@/data/tools";
import { RECIPES, formatMinutes, totalTimeMinutes } from "@/data/recipes";
import { RECIPE_CONTENT } from "@/data/recipe-content";

export type ContentKind = "recipe" | "guide" | "ingredient" | "tool";

export interface ContentItem {
  kind: ContentKind;
  title: string;
  summary: string;
  path: string;
  url: string;
  slug?: string;
}

const absolute = (path: string) => `${SITE_URL}${path}`;

export function allContent(): ContentItem[] {
  const recipes: ContentItem[] = RECIPES.map((r) => ({
    kind: "recipe" as const,
    title: r.name,
    summary: r.description,
    path: `/recipes/${r.slug}`,
    url: absolute(`/recipes/${r.slug}`),
    slug: r.slug,
  }));

  const guides: ContentItem[] = GUIDES.map((g) => ({
    kind: "guide" as const,
    title: g.title,
    summary: g.teaser || g.description,
    path: g.path,
    url: absolute(g.path),
  }));

  const ingredients: ContentItem[] = INGREDIENTS.map((i) => ({
    kind: "ingredient" as const,
    title: i.title,
    summary: i.teaser || i.description,
    path: i.path,
    url: absolute(i.path),
  }));

  const tools: ContentItem[] = TOOLS.filter((t) => t.status === "live" && t.to).map((t) => ({
    kind: "tool" as const,
    title: t.name,
    summary: t.summary,
    path: t.to as string,
    url: absolute(t.to as string),
    slug: t.slug,
  }));

  return [...recipes, ...guides, ...ingredients, ...tools];
}

export function searchContent(query: string, limit = 10): ContentItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return allContent()
    .map((item) => {
      const haystack = `${item.title} ${item.summary} ${item.path}`.toLowerCase();
      const score = terms.reduce((total, term) => {
        if (!haystack.includes(term)) return total;
        return total + (item.title.toLowerCase().includes(term) ? 3 : 1);
      }, 0);
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.item);
}

export function recipeDetail(slug: string) {
  const recipe = RECIPES.find((r) => r.slug === slug);
  const content = RECIPE_CONTENT[slug];
  if (!recipe) return null;

  return {
    slug: recipe.slug,
    name: recipe.name,
    description: recipe.description,
    url: absolute(`/recipes/${recipe.slug}`),
    category: recipe.category,
    cuisine: recipe.cuisine ?? null,
    difficulty: recipe.difficulty,
    keyTechnique: recipe.keyTechnique,
    yield: recipe.recipeYield,
    prepTime: formatMinutes(recipe.prepTimeMinutes),
    cookTime: formatMinutes(recipe.cookTimeMinutes),
    totalTime: formatMinutes(totalTimeMinutes(recipe)),
    intro: content?.intro ?? null,
    answerFirst: content?.answerFirst ?? null,
    ingredientGroups: content?.ingredientGroups ?? [],
    equipment: (content?.equipment ?? []).map((e) => ({ label: e.label, why: e.why })),
    before: content?.before ?? [],
    steps: (content?.steps ?? []).map((s) => ({
      title: s.title,
      body: s.body,
      watchFor: s.watchFor ?? null,
    })),
    temperatures: content?.temperatures ?? null,
    troubleshooting: content?.quackFix ?? [],
    leftovers: (content?.leftovers ?? []).map((l) => ({ part: l.part, use: l.use })),
    faq: content?.faq ?? [],
    related: (content?.related ?? []).map((path) => ({ path, url: absolute(path) })),
  };
}

export function recipeSlugs(): string[] {
  return RECIPES.map((r) => r.slug);
}
