import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-duck-breast.jpg";
import { PILLARS } from "@/data/site";
import { RECIPES } from "@/data/recipes";
import { TOOLS } from "@/data/tools";
import { CategoryTile } from "@/components/site/CategoryTile";
import { HomeAnnouncement } from "@/components/site/HomeAnnouncement";
import { HomeCommerceCards, HomeIntentRouter } from "@/components/site/HomeIntentRouter";
import { RecipeCard } from "@/components/site/RecipeCard";
import { ToolListItem } from "@/components/site/ToolListItem";

import { GamePlanCta } from "@/components/site/GamePlanCta";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ModuleImpression } from "@/components/site/ModuleImpression";
import { MODULE_PLACEMENTS } from "@/lib/impression-events";
import { ldScript, pageMeta, websiteSchema } from "@/lib/seo";
import { CTA } from "@/lib/cta";
import { photoSrcSet } from "@/lib/photo-sources";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageMeta({
      title: "Duck Recipes, Cooking Guides & Buying Advice | DeliciousDuck",
      description:
        "Cook duck breast with crisp skin, roast a whole duck, use the rendered fat, pick the right pan, and find out where to buy good duck.",
      path: "/",
    }),

    scripts: [ldScript(websiteSchema())],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <HomeAnnouncement />
      <Hero />
      <ModuleImpression
        placement={MODULE_PLACEMENTS.homeIntentSelector}
        moduleType="intent_selector"
        destinationType="internal"
      >
        <HomeIntentRouter />
      </ModuleImpression>
      <JourneySection />
      <PopularRecipes />
      <ToolsSection />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        {/*
          The primary acquisition module. The Duck Game Plan replaced the
          playbook PDF as the signup promise here: it is a conversion module
          as well as a newsletter offer, so `newsletter_offer_view` measures the
          funnel while `conversion_module_view` keeps the homepage module
          inventory complete and comparable with the intent selector and the
          buying/gear module. The `starter-guide` id is kept so existing
          in-content anchors to this module still land.
        */}
        <ModuleImpression
          placement={MODULE_PLACEMENTS.homeNewsletterOffer}
          moduleType="newsletter_offer"
          destinationType="internal"
        >
          <GamePlanCta id="starter-guide" />
        </ModuleImpression>
      </section>

      <Monetization />
    </>
  );
}

function Hero() {
  const heroSrcSet = photoSrcSet(heroImg);

  return (
    <section className="bg-forest-deep">
      <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-2">
        <div className="order-last flex flex-col justify-center px-5 py-16 text-forest-foreground lg:order-none lg:px-8 lg:py-28">
          <span className="eyebrow text-accent">The duck authority</span>
          <h1 className="mt-5 max-w-xl font-display text-[2.5rem] leading-[1.05] lg:text-[3.75rem]">
            Duck Recipes, Cooking Guides &amp; Buying Advice
          </h1>
          <p className="mt-5 max-w-xl font-display text-xl leading-snug text-accent lg:text-2xl">
            Better Duck. A More Delicious World.
          </p>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-forest-foreground/80 lg:text-lg">
            Duck breast with crackling crisp skin, whole roast duck for the table, what to do with
            all that rendered duck fat, the equipment that actually earns its space, and where to
            buy duck you'll be glad you paid for.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/recipes"
              className={CTA.primary}
            >
              Explore the Recipes
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              to="/tools"
              className={CTA.secondaryOnDark}
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
            {...(heroSrcSet ? { srcSet: heroSrcSet, sizes: "(min-width: 1024px) 50vw, 100vw" } : {})}
            alt="Roasted duck breast, sliced to show a rosy interior and crisp golden skin"
            width={1280}
            height={1600}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <SectionHeader
        eyebrow="Start anywhere"
        title="Your Duck Journey Starts Here"
        intro="Six routes into duck, whether you are searching for a technique, comparing where to buy, or working out how much to cook tonight."
        align="center"
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <div
            key={pillar.key}
            className={i === 0 ? "lg:col-span-2" : i === 5 ? "lg:col-span-3" : undefined}
          >
            <CategoryTile
              pillar={pillar}
              featured={i === 0}
              span={i === 0 ? 2 : i === 5 ? 3 : 1}
            />
          </div>
        ))}
      </div>
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
              The recipes worth learning first. Cooking duck comes down to three of them:{" "}
              <Link
                to="/recipes/$slug"
                params={{ slug: "pan-seared-duck-breast" }}
                className="text-primary underline underline-offset-4"
              >
                pan-seared duck breast
              </Link>{" "}
              for crisp skin,{" "}
              <Link
                to="/recipes/$slug"
                params={{ slug: "roasted-whole-duck" }}
                className="text-primary underline underline-offset-4"
              >
                roasting a whole duck
              </Link>{" "}
              for the table, and knowing{" "}

              <Link
                to="/learn/duck-breast-temperature-doneness"
                className="text-primary underline underline-offset-4"
              >
                what internal temperature duck is done at
              </Link>
              . Each one teaches a technique that carries over to every other duck dish.
            </p>

          </div>
          <Link
            to="/recipes"
            className={CTA.tertiarySmall}
          >
            All recipes
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {RECIPES.slice(0, 6).map((recipe, index) => (
            <RecipeCard key={recipe.slug} recipe={recipe} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section aria-labelledby="tools-heading" className="paper-grain border-y border-border bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28">
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
            className={`mt-6 ${CTA.tertiarySmall}`}
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
        {/*
          One heading for this section. The visible H2 now names both halves of
          the job — buying the bird and equipping the kitchen — so the section's
          accessible name is the text sighted readers see, and the duplicated
          screen-reader-only H2 is gone.
        */}
        <SectionHeader
          id="shop-heading"
          eyebrow="Buy well"
          title={"Buying Duck & Equipping the Duck Kitchen"}
          intro="Three decisions worth getting right before you cook: how you will know the bird is done, what you will sear breast in, and whether to render duck fat or buy it."
        />

        <ModuleImpression
          placement={MODULE_PLACEMENTS.homeCommerceCards}
          moduleType="commerce_cards"
          destinationType="merchant"
          className="mt-12"
        >
          <HomeCommerceCards />
        </ModuleImpression>
      </div>
    </section>
  );
}
