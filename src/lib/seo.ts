import { SITE } from "@/data/site";

/**
 * Absolutises an internal path against the production origin.
 *
 * Query strings and hash fragments are stripped and trailing slashes are
 * removed (except for the homepage, which canonicalises to
 * `https://deliciousduck.com/`), so canonical and og:url always point at the
 * one preferred, indexable form of the page.
 *
 * Already-absolute URLs (http/https, protocol-relative, or data URIs)
 * are returned untouched so bundled asset URLs and external links survive.
 */
export function absUrl(pathOrUrl: string): string {
  if (/^(https?:)?\/\//i.test(pathOrUrl) || pathOrUrl.startsWith("data:")) return pathOrUrl;
  const bare = (pathOrUrl.split("#")[0] ?? "").split("?")[0] ?? "";
  const path = bare.startsWith("/") ? bare : `/${bare}`;
  const normalized = path.replace(/\/+$/, "");
  return `${SITE.url}${normalized === "" ? "/" : normalized}`;
}

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  image?: string;
  /** Set for query-driven or otherwise non-indexable pages. */
  noindex?: boolean;
}

/** Builds the meta + links arrays for a route's head() option. */
export function pageMeta({
  title,
  description,
  path,
  ogType = "website",
  image,
  noindex = false,
}: PageMetaInput) {
  const url = absUrl(path);
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (noindex) meta.push({ name: "robots", content: "noindex, follow" });
  if (image) {
    const imageUrl = absUrl(image);
    meta.push({ property: "og:image", content: imageUrl });
    meta.push({ name: "twitter:image", content: imageUrl });
  }
  return { meta, links: noindex ? [] : [{ rel: "canonical", href: url }] };
}

export const titleFor = (page: string) => `${page} | ${SITE.name}`;

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    alternateName: SITE.domain,
    description: SITE.description,
    url: absUrl("/"),
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
      item: absUrl(t.item),
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
      url: absUrl(it.url),
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
  url?: string;
  keywords?: string;
  ingredients?: string[];
  instructions?: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    description: r.description,
    ...(r.image ? { image: absUrl(r.image) } : {}),
    ...(r.url ? { url: absUrl(r.url), mainEntityOfPage: absUrl(r.url) } : {}),
    recipeCategory: r.category,
    ...(r.cuisine ? { recipeCuisine: r.cuisine } : {}),
    ...(r.keywords ? { keywords: r.keywords } : {}),
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    totalTime: r.totalTime,
    recipeYield: r.recipeYield,
    ...(r.ingredients ? { recipeIngredient: r.ingredients } : {}),
    ...(r.instructions
      ? {
          recipeInstructions: r.instructions.map((s) => ({
            "@type": "HowToStep",
            name: s.name,
            text: s.text,
          })),
        }
      : {}),
    author: { "@type": "Organization", name: SITE.name },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/**
 * Article schema for editorial guide pages.
 *
 * Deliberately limited to fields backed by content visible on the page:
 * headline, description, canonical URL, the organisation as author/publisher,
 * and the review date shown in the page's transparency block. No ratings,
 * review counts, or person authors we cannot substantiate.
 */
export function articleSchema(a: {
  headline: string;
  description: string;
  path: string;
  /** ISO date shown to readers as "Updated" / "Reviewed". */
  updated: string;
  image?: string;
}) {
  const url = absUrl(a.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.headline,
    description: a.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    dateModified: a.updated,
    ...(a.image ? { image: absUrl(a.image) } : {}),
    author: { "@type": "Organization", name: SITE.name, url: absUrl("/") },
    publisher: { "@type": "Organization", name: SITE.name, url: absUrl("/") },
  };
}



export const ldScript = (data: unknown) => ({
  type: "application/ld+json",
  children: JSON.stringify(data),
});
