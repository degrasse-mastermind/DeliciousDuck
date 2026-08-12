import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-duck-breast.jpg";
import { PILLARS } from "@/data/site";
import { RECIPES } from "@/data/recipes";
import { TOOLS } from "@/data/tools";
import { BUYING_GUIDE, KITCHEN_GEAR } from "@/data/products";
import { CategoryTile } from "@/components/site/CategoryTile";
import { RecipeCard } from "@/components/site/RecipeCard";
import { ToolListItem } from "@/components/site/ToolListItem";
import {
  AffiliateCallout,
  AffiliateDisclosureNote,
} from "@/components/site/AffiliateCallout";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ldScript, pageMeta, websiteSchema } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageMeta({
      title: "DeliciousDuck — Duck Recipes, Guides, Gear & Cooking Tools",
      description:
        "Expert duck recipes, step-by-step guides, buying advice, gear reviews, and practical tools—everything you need to cook, buy, and enjoy amazing duck.",
      path: "/",
    }),
    scripts: [ldScript(websiteSchema())],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <JourneySection />
      <PopularRecipes />
      <ToolsSection />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <NewsletterSignup />
      </section>
      <Monetization />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-forest-deep">
      <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-16 text-forest-foreground lg:px-8 lg:py-28">
          <span className="eyebrow text-accent">The duck authority</span>
          <h1 className="mt-5 max-w-xl font-display text-[2.75rem] leading-[1.03] lg:text-[4.25rem]">
            Better Duck.
            <br />
            A More Delicious World.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-forest-foreground/80 lg:text-lg">
            Expert recipes, step-by-step guides, buying advice, gear reviews, and practical
            tools—everything you need to cook, buy, and enjoy amazing duck.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/cook"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-accent px-6 text-xs font-semibold uppercase tracking-[0.14em] text-gold-foreground transition-colors hover:bg-gold-soft"
            >
              Explore the Recipes
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              to="/tools"
              className="inline-flex h-12 items-center rounded-sm border border-forest-foreground/40 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-forest-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Try a Cooking Tool
            </Link>
          </div>
          <p className="mt-10 max-w-md border-t border-forest-foreground/15 pt-6 text-sm text-forest-foreground/60">
            Six pillars: cook it, learn it, buy it, equip for it, season it, and time it right.
          </p>
        </div>

        <div className="relative min-h-[22rem] lg:min-h-[38rem]">
          <img
            src={heroImg}
            alt="Roasted duck breast, sliced to show a rosy interior and crisp golden skin"
            width={1280}
            height={1600}
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  const [cook, learn, buy, gear, ingredients, tools] = PILLARS;
  return (
    <section aria-labelledby="journey-heading" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <SectionHeader
        eyebrow="Start anywhere"
        title="Your Duck Journey Starts Here"
        intro="Six routes into duck, whether you are searching for a technique, comparing where to buy, or working out how much to cook tonight."
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CategoryTile pillar={cook} featured />
        </div>
        <CategoryTile pillar={learn} />
        <CategoryTile pillar={buy} />
        <CategoryTile pillar={gear} />
        <CategoryTile pillar={ingredients} />
        <div className="lg:col-span-3">
          <CategoryTile pillar={tools} />
        </div>
      </div>
      <h2 id="journey-heading" className="sr-only">
        Your duck journey starts here
      </h2>
    </section>
  );
}

function PopularRecipes() {
  return (
    <section aria-labelledby="popular-heading" className="border-y border-border bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow text-primary">Most cooked</span>
            <h2
              id="popular-heading"
              className="mt-3 font-display text-3xl leading-tight text-foreground lg:text-[2.75rem]"
            >
              Popular Duck Recipes
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The four recipes worth learning first. Each one teaches a technique that carries over
              to every other duck dish.
            </p>
          </div>
          <Link
            to="/cook"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
          >
            All recipes
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {RECIPES.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section aria-labelledby="tools-heading" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="eyebrow text-primary">Useful tools</span>
          <h2
            id="tools-heading"
            className="mt-3 font-display text-3xl leading-tight text-foreground lg:text-[2.75rem]"
          >
            Answer the question, then cook
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Small, focused calculators and references for the moments when you need a number, not
            an essay.
          </p>
          <Link
            to="/tools"
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
          >
            See all tools
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
        <ul className="border-t border-border">
          {TOOLS.map((tool) => (
            <ToolListItem key={tool.slug} tool={tool} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Monetization() {
  return (
    <section aria-labelledby="shop-heading" className="border-t border-border bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <SectionHeader
          eyebrow="Buy well"
          title="Where to Buy Duck Online & The Duck Kitchen"
          intro="Two practical questions we answer without hype: where good duck actually comes from, and the small set of equipment that makes cooking it straightforward."
        />
        <div className="mt-8 max-w-3xl">
          <AffiliateDisclosureNote />
        </div>

        <h3 id="shop-heading" className="sr-only">
          Buying duck and kitchen gear
        </h3>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="rule-gold font-display text-2xl text-foreground">
              Where to Buy Duck Online
            </h3>
            <div className="mt-6 grid gap-4">
              {BUYING_GUIDE.map((item) => (
                <AffiliateCallout key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="rule-gold font-display text-2xl text-foreground">
              The Duck Kitchen
            </h3>
            <div className="mt-6 grid gap-4">
              {KITCHEN_GEAR.map((item) => (
                <AffiliateCallout key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
