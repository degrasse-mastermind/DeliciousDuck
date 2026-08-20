import { Link } from "@tanstack/react-router";
import { formatMinutes, totalTimeMinutes, type Recipe } from "@/data/recipes";
import { Photograph } from "@/components/site/Photograph";
import { PHOTO_SIZES } from "@/lib/photo-sources";


/**
 * Three small stacked stats instead of one dense micro-caps row: the label sits
 * above its value with real tracking, so Total / Serves / Level scan at a glance
 * on a phone rather than reading as one grey string.
 */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-tight text-foreground/85">{value}</dd>
    </div>
  );
}

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
          <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
            <Stat label="Total" value={formatMinutes(totalTimeMinutes(recipe))} />
            <Stat label="Serves" value={recipe.recipeYield.replace(" servings", "")} />
            <Stat label="Level" value={recipe.difficulty} />
          </dl>
        </div>
      </Link>
    </article>
  );
}
