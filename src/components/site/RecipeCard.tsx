import { Link } from "@tanstack/react-router";
import { formatMinutes, totalTimeMinutes, type Recipe } from "@/data/recipes";
import { Photograph } from "@/components/site/Photograph";
import { MetaStats } from "@/components/site/MetaStats";
import { PHOTO_SIZES } from "@/lib/photo-sources";


export function RecipeCard({ recipe, priority = false }: { recipe: Recipe; priority?: boolean }) {
  return (
    <article className="group">
      <Link to="/recipes/$slug" params={{ slug: recipe.slug }} className="block">
        <Photograph
          src={recipe.cardImage ?? recipe.image}
          alt={recipe.imageAlt ?? `${recipe.name} being prepared in the kitchen`}
          sizes={PHOTO_SIZES.card}
          priority={priority}
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />


        <div className="mt-4">
          {/* Gold rule reveals on hover so the grid feels interactive. */}
          <span
            aria-hidden="true"
            className="block h-[2px] w-8 origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
          />
          <span className="mt-3 block eyebrow text-primary">{recipe.category}</span>
          <h3 className="mt-2 font-display text-2xl leading-snug text-foreground transition-colors group-hover:text-primary">
            {recipe.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {recipe.description}
          </p>
          <MetaStats
            className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4"
            stats={[
              { label: "Total", value: formatMinutes(totalTimeMinutes(recipe)) },
              { label: "Serves", value: recipe.recipeYield.replace(" servings", "") },
              { label: "Level", value: recipe.difficulty },
            ]}
          />
        </div>
      </Link>
    </article>
  );
}
