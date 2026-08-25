import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/site/PageHeader";
import { GUIDES } from "@/data/guides";
import { STARTER_GUIDE } from "@/data/starter-guide";
import { INGREDIENTS } from "@/data/ingredients";
import { RECIPES } from "@/data/recipes";
import { TOOLS } from "@/data/tools";
import { PILLARS } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export interface SearchDoc {
  path: string;
  title: string;
  type: string;
  summary: string;
  /** Extra terms folded into matching but not displayed. */
  keywords: string;
}

/** Deterministic, build-time index over every published surface. */
export const SEARCH_INDEX: SearchDoc[] = [
  ...RECIPES.map((r) => ({
    path: `/recipes/${r.slug}`,
    title: r.name,
    type: "Recipe",
    summary: r.description,
    keywords: [r.category, r.cuisine ?? "", r.keyTechnique, r.difficulty].join(" "),
  })),
  {
    path: STARTER_GUIDE.path,
    title: STARTER_GUIDE.title,
    type: "Guide",
    summary: STARTER_GUIDE.teaser,
    keywords: "starter guide beginner first duck checklist temperature technique",
  },
  ...GUIDES.map((g) => ({
    path: g.path,
    title: g.title,
    type: g.kind === "money" ? "Buying guide" : "Guide",
    summary: g.teaser,
    keywords: [g.pillar, g.cluster, g.kind, g.description].join(" "),
  })),
  ...INGREDIENTS.map((i) => ({
    path: i.path,
    title: i.title,
    type: "Ingredients",
    summary: i.teaser,
    keywords: [i.cluster.replace(/-/g, " "), i.description].join(" "),
  })),
  ...TOOLS.filter((t) => t.status === "live" && t.to).map((t) => ({
    path: t.to!,
    title: t.name,
    type: "Tool",
    summary: t.summary,
    keywords: [t.useCase, t.slug.replace(/-/g, " ")].join(" "),
  })),
  ...PILLARS.map((p) => ({
    path: p.to,
    title: p.headline,
    type: "Section",
    summary: p.blurb,
    keywords: [p.kicker, p.key].join(" "),
  })),
  {
    path: "/recipes",
    title: "All duck recipes",
    type: "Section",
    summary: "Every published DeliciousDuck recipe, with times, yields, and difficulty.",
    keywords: "recipes directory index",
  },
];

const tokenize = (q: string) =>
  q
    .toLowerCase()
    .replace(/[^a-z0-9\s°]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

/** Scored, stable ordering: title hits beat summary hits, ties break by title. */
export function searchSite(query: string): SearchDoc[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  return SEARCH_INDEX.map((doc) => {
    const title = doc.title.toLowerCase();
    const body = `${doc.summary} ${doc.keywords}`.toLowerCase();
    let score = 0;
    let matchedAll = true;
    for (const t of tokens) {
      const inTitle = title.includes(t);
      const inBody = body.includes(t);
      if (!inTitle && !inBody) matchedAll = false;
      if (inTitle) score += title.startsWith(t) ? 6 : 4;
      if (inBody) score += 1;
    }
    if (title.includes(tokens.join(" "))) score += 5;
    return { doc, score, matchedAll };
  })
    .filter((r) => r.matchedAll && r.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .map((r) => r.doc);
}

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional().catch(undefined) }),
  head: () => ({
    ...pageMeta({
      title: "Search | DeliciousDuck",
      description:
        "Search DeliciousDuck recipes, technique guides, buying guides, and duck cooking calculators.",
      path: "/search",
      noindex: true,
    }),
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const query = (q ?? "").trim();
  const results = searchSite(query);

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={query ? `Results for “${query}”` : "Search DeliciousDuck"}
        intro={
          query
            ? `${results.length} ${results.length === 1 ? "page" : "pages"} match your search across recipes, guides, buying guides, and tools.`
            : "Search across every recipe, technique guide, buying guide, and calculator on the site."
        }
        trail={[{ name: "Search", to: "/search" }]}
      />

      <section className="mx-auto max-w-3xl px-5 py-14 lg:px-8 lg:py-20">
        <form role="search" method="get" action="/search" className="flex gap-3">
          <label htmlFor="search-q" className="sr-only">
            Search DeliciousDuck
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="duck breast, confit, thermometer…"
            className="h-12 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep"
          >
            Search
          </button>
        </form>

        {query && results.length === 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl text-foreground">No matches</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Nothing on the site matches “{query}” yet. Try a cut (breast, legs, whole duck), a
              technique (confit, rendering, scoring), or a piece of gear (thermometer, pan).
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["duck breast", "confit", "whole roast duck", "duck fat", "thermometer"].map((s) => (
                <li key={s}>
                  <Link
                    to="/search"
                    search={{ q: s }}
                    className="inline-block rounded-sm border border-border bg-cream px-3 py-1.5 text-sm text-foreground hover:text-primary"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.length > 0 && (
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {results.map((doc) => (
              <li key={doc.path} className="py-5">
                <span className="eyebrow text-primary">{doc.type}</span>
                <h2 className="mt-2 font-display text-xl text-foreground">
                  <a href={doc.path} className="hover:text-primary">
                    {doc.title}
                  </a>
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {doc.summary}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">{doc.path}</p>
              </li>
            ))}
          </ul>
        )}

        {!query && (
          <p className="mt-10 text-sm text-muted-foreground">
            Or browse by section:{" "}
            {PILLARS.map((p, i) => (
              <span key={p.to}>
                {i > 0 && " · "}
                <Link to={p.to} className="text-primary underline underline-offset-4">
                  {p.label}
                </Link>
              </span>
            ))}
          </p>
        )}

        <HubOrientation
          heading="How search works here"
          paragraphs={[
            "This searches a fixed index of every published page — recipes, technique guides, buying guides, ingredient pairings, and calculators. It runs in your browser against titles, summaries, and a short list of related terms, so results appear instantly and nothing you type is sent anywhere or stored.",
            "Short, concrete queries work best. A cut (breast, legs, whole duck), a technique (confit, scoring, rendering), a number (165°F, cooking time), or a piece of gear (thermometer, roasting pan) will land on the page that answers it. Long questions match fewer pages because every word has to appear somewhere in the entry.",
            "If a search comes back empty, drop a word rather than rephrasing the whole thing — \"duck fat storage\" narrows to nothing where \"duck fat\" reaches the rendering and buying guides that cover it. Section browsing is often faster when you are still deciding what to cook: the cooking hub sorts pages by method, and the tools hub answers how long, how hot, and how much.",
          ]}
        />
      </section>

    </>
  );
}
