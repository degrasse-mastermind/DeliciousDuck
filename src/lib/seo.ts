import { SITE } from "@/data/site";

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  image?: string;
}

/** Builds the meta + links arrays for a route's head() option. */
export function pageMeta({
  title,
  description,
  path,
  ogType = "website",
  image,
}: PageMetaInput) {
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: path },
    { property: "og:site_name", content: SITE.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }
  return { meta, links: [{ rel: "canonical", href: path }] };
}

export const titleFor = (page: string) => `${page} | ${SITE.name}`;

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    alternateName: SITE.domain,
    description: SITE.description,
    url: "/",
    publisher: { "@type": "Organization", name: SITE.name },
  };
}

export function breadcrumbSchema(trail: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: t.item,
    })),
  };
}

export function itemListSchema(name: string, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

/** Recipe schema builder — used by recipe routes as they are published. */
export function recipeSchema(r: {
  name: string;
  description: string;
  image?: string;
  category: string;
  cuisine?: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  recipeYield: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    description: r.description,
    ...(r.image ? { image: r.image } : {}),
    recipeCategory: r.category,
    ...(r.cuisine ? { recipeCuisine: r.cuisine } : {}),
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    totalTime: r.totalTime,
    recipeYield: r.recipeYield,
    author: { "@type": "Organization", name: SITE.name },
  };
}

export const ldScript = (data: unknown) => ({
  type: "application/ld+json",
  children: JSON.stringify(data),
});
