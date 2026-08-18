import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArticleShell,
  Callout,
  DataTable,
  FaqList,
  Section,
  StepList,
} from "@/components/site/ArticleShell";
import { DisclosureBanner, ShopThisGuide } from "@/components/site/Commerce";
import { CommercialCallout } from "@/components/site/CommercialLink";
import { RecipeConversionPaths } from "@/components/site/ConversionPaths";
import { DuckConfidenceCard } from "@/components/site/DuckConfidenceCard";
import { QuackFix } from "@/components/site/QuackFix";
import { RecipeTrustBox } from "@/components/site/RecipeTrustBox";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceNotes } from "@/components/site/SourceNotes";
import { UseTheWholeDuck } from "@/components/site/UseTheWholeDuck";
import { recipeContentBySlug, recipeBySlug, recipePath } from "@/data/recipe-content";
import { RECIPE_CONVERSION_SLUGS } from "@/data/conversion-paths";
import { formatMinutes, isoDuration, totalTimeMinutes } from "@/data/recipes";
import { DuckBreastJourney } from "@/components/site/DuckBreastJourney";
import {
  breadcrumbSchema,
  faqSchema,
  ldScript,
  pageMeta,
  recipeSchema,
} from "@/lib/seo";

export const Route = createFileRoute("/recipes/$slug")({
  loader: ({ params }) => {
    const recipe = recipeBySlug(params.slug);
    const content = recipeContentBySlug(params.slug);
    if (!recipe || !content) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const recipe = recipeBySlug(params.slug);
    const content = recipeContentBySlug(params.slug);
    if (!recipe || !content) {
      return { meta: [{ title: "Recipe not found" }, { name: "robots", content: "noindex" }] };
    }
    const path = recipePath(recipe.slug);
    const title = `${recipe.name} Recipe: Step by Step | DeliciousDuck`;
    return {
      ...pageMeta({
        title,
        description: recipe.description,
        path,
        ogType: "article",
        image: recipe.image,
      }),
      scripts: [
        ldScript(
          breadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Recipes", item: "/recipes" },
            { name: recipe.name, item: path },
          ]),
        ),
        ldScript(
          recipeSchema({
            name: recipe.name,
            description: recipe.description,
            image: recipe.image,
            category: recipe.category,
            ...(recipe.cuisine ? { cuisine: recipe.cuisine } : {}),
            prepTime: isoDuration(recipe.prepTimeMinutes),
            cookTime: isoDuration(recipe.cookTimeMinutes),
            totalTime: isoDuration(totalTimeMinutes(recipe)),
            recipeYield: recipe.recipeYield,
            url: path,
            keywords: `${recipe.name}, ${recipe.category}, ${recipe.keyTechnique}`,
            ingredients: content.ingredientGroups.flatMap((g) => g.items),
            instructions: content.steps.map((s) => ({ name: s.title, text: s.body })),
          }),
        ),
        ldScript(faqSchema(content.faq)),
      ],
    };
  },
  component: RecipePage,
  notFoundComponent: RecipeNotFound,
});

function RecipeNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 lg:px-8">
      <h1 className="font-display text-4xl text-foreground">Recipe not found</h1>
      <p className="mt-4 text-base text-muted-foreground">
        That recipe isn&apos;t published yet.{" "}
        <Link to="/recipes" className="text-primary underline underline-offset-4">
          Browse all duck recipes
        </Link>
        .
      </p>
    </div>
  );
}

function RecipePage() {
  const { slug } = Route.useLoaderData();
  const recipe = recipeBySlug(slug)!;
  const content = recipeContentBySlug(slug)!;
  const path = recipePath(slug);

  return (
    <ArticleShell
      eyebrow={`Recipe · ${recipe.category}`}
      title={recipe.name}
      intro={content.intro}
      trail={[
        { name: "Recipes", to: "/recipes" },
        { name: recipe.name, to: path },
      ]}
      meta={`Prep ${formatMinutes(recipe.prepTimeMinutes)} · Cook ${formatMinutes(
        recipe.cookTimeMinutes,
      )} · Total ${formatMinutes(totalTimeMinutes(recipe))} · ${recipe.recipeYield} · ${
        recipe.difficulty
      }`}
      sidebar={
        <DuckConfidenceCard
          data={{ ...content.confidence, difficulty: recipe.difficulty }}
        />
      }
    >
      <img
        src={recipe.image}
        alt={`${recipe.name}, finished and sliced`}
        width={1024}
        height={768}
        className="aspect-[4/3] w-full rounded-sm object-cover"
      />

      <RecipeTrustBox recipe={recipe} />

      <Section id="ingredients" heading="Ingredients">
        {content.ingredientGroups.map((group) => (
          <div key={group.heading}>
            <h3 className="font-display text-lg text-foreground">{group.heading}</h3>
            <ul className="mt-3 space-y-2 border-l-2 border-primary/20 pl-5">
              {group.items.map((item) => (
                <li key={item} className="text-base leading-[1.7] text-foreground/85">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="text-sm text-muted-foreground">
          Cooking for a different number?{" "}
          <Link to="/tools/recipe-scaler" className="text-primary underline underline-offset-4">
            Scale the quantities
          </Link>{" "}
          rather than guessing — fat and salt do not scale linearly with guest count.
        </p>
      </Section>

      <Section id="equipment" heading="Equipment that matters">
        <ul className="space-y-4">
          {content.equipment.map((item) => (
            <li key={item.label} className="border-t border-border pt-4">
              <h3 className="font-display text-lg text-foreground">{item.label}</h3>
              <p className="mt-1 text-base leading-[1.7] text-foreground/85">{item.why}</p>
              {item.to && (
                <Link
                  to={item.to}
                  className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
                >
                  {item.linkLabel ?? "Read the buying guide"}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {(RECIPE_CONVERSION_SLUGS as readonly string[]).includes(slug) && (
        <RecipeConversionPaths
          slug={slug}
          equipment={content.equipment}
          sourcing={content.sourcing}
        />
      )}

      <Section id="before-you-start" heading="Before you start">
        {content.before.map((block) => (
          <div key={block.heading}>
            <h3 className="font-display text-lg text-foreground">{block.heading}</h3>
            <p className="mt-1.5 text-base leading-[1.75] text-foreground/85">{block.body}</p>
          </div>
        ))}
      </Section>

      <Section id="method" heading="Method, step by step">
        <StepList steps={content.steps} />
      </Section>

      <Section id="temperatures" heading="Temperatures and timings">
        <DataTable
          caption={content.temperatures.caption}
          columns={content.temperatures.columns}
          rows={content.temperatures.rows}
        />
        <Callout label="Verify, don't trust" tone="gold">
          <p>
            Every number here is a starting range, not a guarantee. Bird size, oven calibration and
            starting temperature all move the finish line — a thermometer is the only thing that
            tells you where you actually are.
          </p>
        </Callout>
      </Section>

      <div className="mt-16">
        <SafetyNote />
      </div>

      <QuackFix
        items={content.quackFix}
        intro="The four ways this recipe usually goes wrong, what to do about it mid-cook, and how to stop it happening again."
      />

      {slug === "pan-seared-duck-breast" && (
        <DuckBreastJourney
          id="cluster-from-the-recipe"
          title="The pages behind this recipe"
          intro="Everything that explains, troubleshoots, or equips this cook — in the order it usually matters."
          placement="recipe_pathway"
          variant="grouped"
          excludePath="/recipes/pan-seared-duck-breast"
        />
      )}

      <UseTheWholeDuck items={content.leftovers} />

      <ShopThisGuide items={content.sourcing} intro="Where to source what this recipe needs." />

      <div className="mt-8">
        <DisclosureBanner compact />
      </div>

      <CommercialCallout
        heading="Buy what this recipe needs"
        intro={
          needsDuckFat
            ? "A mail-order seller whose catalogue lists duck by the cut, plus rendered duck fat by the quart for the volume this recipe needs. Neither has been ordered from for a hands-on review, and each link's relationship is labelled beneath it."
            : "A mail-order seller whose public catalogue lists duck by the cut. We have not ordered from them for a hands-on review, and this link earns us nothing."
        }
        placement={`recipe_sourcing_${slug.replace(/[^a-z0-9]+/gi, "_")}`}
        linkIds={
          needsDuckFat ? ["dartagnan-duck", "us-wellness-duck-fat"] : ["dartagnan-duck"]
        }
        footnote="We publish no prices, stock, or shipping claims. Check the seller's own page for current availability and terms."
      />


      <FaqList items={content.faq} />

      <RelatedGuides
        paths={content.related}
        intro="The technique guides and calculators behind this recipe."
      />

      <SourceNotes ids={content.sourceIds} />
    </ArticleShell>
  );
}
