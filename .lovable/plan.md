# Site-wide SEO sprint

Preview only. Five workstreams: internal-link graph, on-page copy, schema depth,
crawl/Core Web Vitals, and four demand-validated new pages.

The technical base is already sound (self-referencing canonicals, per-route titles
and descriptions, Article/Recipe/FAQ/Breadcrumb schema, generated sitemap, tuned
robots.txt, responsive WebP pipeline). So this sprint deepens rather than rebuilds.

## 1. Internal-link graph

The site links mostly through modules (Related Guides, Conversion Paths). That is
consistent but shallow — recipes and ingredient pages receive far fewer links than
the guide cluster.

- Build a link-graph audit: every indexable page's inbound links, counted from the
  guide registry, hub routes, and in-body links.
- Fix the three failure classes it finds: pages with fewer than three inbound
  links, one-way pairs that should be reciprocal, and clusters that never link
  sideways (recipes to recipes, ingredients to recipes).
- Add contextual in-body links, not more modules: each guide gets two to four links
  inside the prose where the reader actually needs the next page.
- Diversify anchor text — today many links reuse the exact page title. Anchors
  should read as sentences ("the cold-pan method", "check the breast temperature").
- Every recipe links up to its technique guide and its ingredient page; every
  technique guide links down to at least one recipe that uses it.

## 2. On-page copy and answer-first structure

Aimed at both classic snippets and AI Overviews / assistant citation.

- Add a short answer block at the top of every question-shaped guide: two to three
  sentences that answer the query outright before the article develops it. Keeps the
  editorial voice — lead with the useful answer, no throat-clearing.
- Audit every title for front-loaded intent and pixel length; trim the brand suffix
  where it pushes the keyword out of view.
- Verify one H1 per page and that H2s match how people phrase the question, without
  keyword stuffing.
- Convert the temperature, timing, and quantity answers that currently live in
  prose into small tables — the format Google and assistants quote.
- Re-check visible FAQs against FAQ schema so they stay identical.

## 3. Schema depth

- Add `datePublished` alongside the existing `dateModified` on Article, and surface
  the same date visibly on the page.
- Complete Recipe schema: `recipeYield`, `prepTime`/`cookTime`/`totalTime`,
  `recipeCategory`, `recipeCuisine`, `keywords`, and the hero image in the required
  aspect ratios. No ratings or nutrition invented — nutrition only where a primary
  source supports it.
- Add `ItemList` to hub pages that currently lack it, so Cook, Learn, Buy, Gear,
  Ingredients, Recipes and Tools all expose their collection.
- Enrich the sitewide Organization/WebSite node: `sameAs`, logo, and a `SearchAction`
  pointing at the existing /search route.
- Add `HowTo`-adjacent step markup only where it is accurate; skip it where the page
  is not a linear procedure.

## 4. Crawl efficiency and Core Web Vitals

- Confirm every sitemap URL returns 200 and self-canonicalises; catch any alias or
  redirect that slipped in.
- Preload the LCP hero image per template and confirm width/height are always set so
  nothing shifts.
- Check font loading strategy and defer anything non-critical below the fold.
- Verify analytics and third-party scripts stay off the critical path.
- Confirm the 404 route returns a real 404 status, not a soft 200.

## 5. Four new pages (Semrush-validated, US)

| Page | Target | Volume | Difficulty |
|---|---|---|---|
| /recipes/peking-duck-at-home | peking duck recipe | 14,800/mo (head term 49,500/mo) | 18 easy |
| /recipes/oven-roasted-duck-breast | how to cook duck breast in the oven | ~700/mo across the oven cluster | 15 easy |
| /learn/what-does-duck-taste-like | what does duck taste like | ~400/mo, top-of-funnel entry | low |
| /learn/is-duck-healthy | is duck breast healthy / good for you | ~700/mo combined | low |

Peking duck is the single biggest unclaimed term on the site. It gets an honest
home-kitchen treatment: what the restaurant method actually requires, what a home
oven can reproduce, and where shortcuts change the result — no invented testing.

The nutrition page sources its numbers from primary nutrient data with quiet
attribution via the existing SourceMark and source-notes system, and links into the
duck-fat cluster rather than dead-ending.

Each new page ships with a unique illustration or photograph following the existing
rule (recipes get photography, learn pages get illustration), full schema, and
inbound links from the relevant hub and two related pages.

## Technical details

- Link graph and audit rules live in a new `src/lib/internal-links.ts`, with a
  vitest suite asserting minimum inbound links, reciprocity, and no orphans.
- New pages register in `src/data/guides.ts` / `src/data/recipes.ts` +
  `src/data/recipe-content.ts`, so hubs, related modules and the sitemap pick them
  up automatically.
- Schema changes extend `src/lib/seo.ts` helpers so every route inherits them.
- Answer blocks use a shared component so the pattern stays consistent.
- Regression tests cover schema required fields, title lengths, FAQ/schema parity,
  and the link-graph rules.
- Verification: full vitest run plus a Playwright pass over the new and changed
  routes at mobile and desktop widths.

## Not in scope

No publish. No sitemap mechanism change, no `lastmod` invention, no new tracking,
no changes to the visual system beyond the new pages' own art.
