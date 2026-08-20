import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { relatedItems } from "@/lib/related-items";

/**
 * Related Guides — driven by the structured `related` field in the guide,
 * ingredient and recipe registries, never by random recirculation.
 *
 * Resolution lives in `@/lib/related-items` so guides, ingredients, recipes and
 * tools all render, and so the link-graph tests measure the same edges the HTML
 * actually publishes.
 */
export function RelatedGuides({
  paths,
  title = "Related guides",
  intro,
}: {
  paths: string[];
  title?: string;
  intro?: string;
}) {
  const items = relatedItems(paths);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-guides" className="mt-16 border-t border-border pt-10">
      <h2 id="related-guides" className="font-display text-2xl text-foreground lg:text-3xl">
        {title}
      </h2>
      {intro && <p className="mt-2 text-sm text-muted-foreground">{intro}</p>}
      <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="group flex items-start justify-between gap-4 border-t border-border py-4 transition-colors hover:text-primary"
            >
              <span>
                <span className="block font-display text-lg leading-snug text-foreground group-hover:text-primary">
                  {item.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {item.teaser}
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
    </section>
  );
}
