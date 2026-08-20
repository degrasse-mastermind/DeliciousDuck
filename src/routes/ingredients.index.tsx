import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { HUB_SECTION_DIVIDER } from "@/components/site/HubDivider";
import { HubSectionMark, type HubSectionMarkId } from "@/components/site/HubSectionMark";
import { PageHeader } from "@/components/site/PageHeader";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import {
  INGREDIENTS,
  INGREDIENT_CLUSTER_INTROS,
  INGREDIENT_CLUSTER_LABELS,
  INGREDIENT_CLUSTER_ORDER,
  ingredientsByCluster,
} from "@/data/ingredients";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const CROSS_LINKS = [
  {
    to: "/learn/how-to-render-duck-fat",
    label: "How to render, strain and store duck fat",
    note: "The technique that turns trimmings into your best cooking fat.",
  },
  {
    to: "/cook/ways-to-use-duck-fat",
    label: "Smart ways to cook with duck fat",
    note: "Where a jar of rendered fat actually changes the result.",
  },
  {
    to: "/cook/best-sauces-for-duck-breast",
    label: "Best sauces for duck breast",
    note: "Five sauce families matched to method and occasion.",
  },
  {
    to: "/cook/what-to-serve-with-duck-breast",
    label: "What to serve with duck breast",
    note: "Starches, greens and pickles that balance the plate.",
  },
  {
    to: "/buy/duck-fat-buying-guide",
    label: "Duck fat buying guide",
    note: "Packaging, labels and how much you actually need.",
  },
  {
    to: "/tools/duck-fat-substitution-calculator",
    label: "Duck-fat substitution calculator",
    note: "Convert butter, oil or lard into a practical duck-fat amount.",
  },
] as const;

export const Route = createFileRoute("/ingredients/")({
  head: () => ({
    ...pageMeta({
      title: "Duck Ingredients: Seasoning, Fat, Fruit & Acid | DeliciousDuck",
      description:
        "The pantry side of duck cooking: herbs and spices, seasoning and dry brining, duck fat versus butter and oil, orange and stone fruit pairings, and the best acids for rich duck.",
      path: "/ingredients",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Ingredients", item: "/ingredients" },
        ]),
      ),
      ldScript(
        itemListSchema(
          "Duck ingredient and pairing guides",
          INGREDIENTS.map((i) => ({ name: i.title, url: i.path })),
        ),
      ),
    ],
  }),
  component: IngredientsPage,
});

function IngredientsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ingredients"
        title="What Goes With Duck"
        intro="Duck is rich, savoury and slightly gamey. Almost everything that makes a duck dinner taste finished is doing one of three jobs: seasoning the meat properly, using the fat well, or bringing in enough acid to reset the palate. These pages cover all three."
        trail={[{ name: "Ingredients", to: "/ingredients" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="rounded-sm border border-accent/40 bg-accent/10 p-6 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-8">
          <div className="max-w-2xl">
            <p className="eyebrow text-primary">Start here</p>
            <h2 className="mt-2 font-display text-2xl text-foreground lg:text-3xl">
              Duck Pairing Finder
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              Pick your cut, the flavour direction you're after and the occasion, and get a
              transparent, rule-based pairing plan: sauce and acid family, starch, greens, and two
              seasoning ideas — each linked to the guide behind it.
            </p>
          </div>
          <Link
            to="/tools/duck-pairing-finder"
            className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-sm bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep lg:mt-0"
          >
            Open the pairing finder
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {INGREDIENT_CLUSTER_ORDER.map((cluster) => {
          const items = ingredientsByCluster(cluster);
          if (!items.length) return null;
          return (
            <div key={cluster} className={`${HUB_SECTION_DIVIDER} mt-20`}>
              <HubSectionMark mark={`ingredients-${cluster}` as HubSectionMarkId} />
              <h2 className="font-display text-3xl text-foreground">
                {INGREDIENT_CLUSTER_LABELS[cluster]}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {INGREDIENT_CLUSTER_INTROS[cluster]}
              </p>
              <ul className="mt-8 grid gap-x-10 gap-y-2 md:grid-cols-2">
                {items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="group flex items-start justify-between gap-4 border-t border-border py-5 transition-colors hover:text-primary"
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-xl leading-snug text-foreground group-hover:text-primary">
                          {item.title}
                        </span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                          {item.teaser}
                        </span>
                        <span className="mt-2 block text-xs uppercase tracking-[0.14em] text-muted-foreground/80">
                          {item.minutes} min read
                        </span>
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="mt-1.5 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <div className="mt-16 rounded-sm border border-border bg-cream p-6 lg:p-8">
          <h2 className="font-display text-2xl text-foreground">Go deeper</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The technique, sauce and shopping pages these pairings feed into.
          </p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {CROSS_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {link.label}
                </Link>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                  {link.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <NewsletterSignup />
      </section>
    </>
  );
}
