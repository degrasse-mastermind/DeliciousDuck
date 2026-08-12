import { Link } from "@tanstack/react-router";
import { formatMinutes, totalTimeMinutes, type Recipe } from "@/data/recipes";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="group">
      <Link to="/cook" className="block">
        <div className="overflow-hidden rounded-sm bg-muted">
          <img
            src={recipe.image}
            alt={recipe.name}
            loading="lazy"
            width={1024}
            height={768}
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="mt-4">
          <span className="eyebrow text-primary">{recipe.category}</span>
          <h3 className="mt-2 font-display text-2xl leading-snug text-foreground transition-colors group-hover:text-primary">
            {recipe.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {recipe.description}
          </p>
          <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex gap-1.5">
              <dt className="font-semibold uppercase tracking-wider">Total</dt>
              <dd>{formatMinutes(totalTimeMinutes(recipe))}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="font-semibold uppercase tracking-wider">Serves</dt>
              <dd>{recipe.recipeYield.replace(" servings", "")}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="font-semibold uppercase tracking-wider">Level</dt>
              <dd>{recipe.difficulty}</dd>
            </div>
          </dl>
        </div>
      </Link>
    </article>
  );
}
