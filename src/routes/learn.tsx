import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDES = [
  {
    title: "Duck cuts explained",
    blurb: "Breast, leg quarters, whole birds, crowns, and what each one is good for.",
  },
  {
    title: "Duck doneness and food safety",
    blurb: "Why breast is treated like red meat, why legs are not, and the temperatures that matter.",
  },
  {
    title: "How to render a fat cap",
    blurb: "The cold-pan method, why the skin needs scoring, and how to tell rendering is finished.",
  },
  {
    title: "Duck vs. chicken vs. goose",
    blurb: "Fat content, flavour, cook times, and how recipes translate between birds.",
  },
  {
    title: "Storing, freezing, and thawing duck",
    blurb: "Practical timelines for raw, cooked, and confit duck, plus rendered fat.",
  },
  {
    title: "Carving a whole duck",
    blurb: "A joint-by-joint sequence that keeps the breast intact and the legs presentable.",
  },
];

export const Route = createFileRoute("/learn")({
  head: () => ({
    ...pageMeta({
      title: "Learn Duck: Cuts, Doneness, Fat & Fundamentals | DeliciousDuck",
      description:
        "Plain-language duck guides: how the cuts differ, what internal temperatures to target, how to render fat, and how to store, thaw, and carve duck.",
      path: "/learn",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Learn", item: "/learn" },
        ]),
      ),
      ldScript(
        itemListSchema(
          "Duck fundamentals guides",
          GUIDES.map((g) => ({ name: g.title, url: "/learn" })),
        ),
      ),
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Duck, Explained Properly"
        intro="The reference layer of the site: how duck behaves, why it is cooked differently from chicken, and the answers to the questions people search for before they ever open a recipe."
        trail={[{ name: "Learn", to: "/learn" }]}
      />

      <section aria-labelledby="guides" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <h2 id="guides" className="font-display text-3xl text-foreground">
          Fundamentals
        </h2>
        <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <li key={guide.title} className="border-t border-border pt-5">
              <h3 className="font-display text-xl leading-snug text-foreground">{guide.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guide.blurb}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground/70">
                Guide in progress
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-16 rounded-sm border border-border bg-cream p-6 lg:p-8">
          <h2 className="font-display text-2xl text-foreground">Put it into practice</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Fundamentals are most useful next to a pan. Pair a guide with a recipe or a tool.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Link to="/cook" className="underline-offset-4 hover:underline">
              Duck recipes
            </Link>
            <Link to="/tools" className="underline-offset-4 hover:underline">
              Cooking tools
            </Link>
            <Link to="/ingredients" className="underline-offset-4 hover:underline">
              Ingredients &amp; pairings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
