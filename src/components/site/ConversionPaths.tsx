import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  conversionPathsForSource,
  recipePlacementId,
  type ConversionIntent,
} from "@/data/conversion-paths";
import { trackConversionPathClick } from "@/lib/analytics";

/**
 * ConversionPaths — internal wayfinding from cornerstone pages to the one
 * commercial guide that matches the reader's intent, and back again.
 *
 * Deliberately not a sales box: a slim, semantic `nav` of real internal
 * anchors with honest, specific link text and a line saying what the reader
 * gets there. No prices, ratings, availability, testing or endorsement claims,
 * and no outbound merchant links — proximate commercial disclosures stay
 * exactly where they already are, on the commercial modules themselves.
 *
 * Analytics: one stable `internal_conversion_click` event carrying the
 * placement id from the DEL-12 placement map, so it joins the existing
 * `commercial_page_view` on the destination route. Tracking never blocks
 * navigation.
 */

interface PathItem {
  placement: string;
  destination: string;
  intent: ConversionIntent;
  anchor: string;
  reason: string;
}

function PathList({ items }: { items: PathItem[] }) {
  return (
    <ul className="mt-4 space-y-1">
      {items.map((item) => (
        <li key={item.placement}>
          <Link
            to={item.destination}
            data-placement={item.placement}
            onClick={() =>
              trackConversionPathClick({
                destination: item.destination,
                intent: item.intent,
                placement: item.placement,
              })
            }
            className="group flex items-start justify-between gap-4 border-t border-border/70 py-3 transition-colors hover:text-primary"
          >
            <span>
              <span className="block font-display text-base leading-snug text-foreground group-hover:text-primary">
                {item.anchor}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {item.reason}
              </span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PathNav({
  id,
  eyebrow,
  heading,
  intro,
  items,
  className,
}: {
  id: string;
  eyebrow: string;
  heading: string;
  intro?: string;
  items: PathItem[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-labelledby={id}
      className={`mt-12 border-l-2 border-primary/40 pl-4 sm:pl-5 ${className ?? ""}`}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
      <h2 id={id} className="mt-2 font-display text-xl text-foreground lg:text-2xl">
        {heading}
      </h2>
      {intro && (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{intro}</p>
      )}
      <PathList items={items} />
    </nav>
  );
}

/** Renders the mapped conversion paths for a route, or nothing. */
export function ConversionPaths({
  sourcePath,
  id = "conversion-paths",
  eyebrow = "Next step",
  heading = "Where this leads next",
  intro,
  className,
}: {
  sourcePath: string;
  id?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  className?: string;
}) {
  const items = conversionPathsForSource(sourcePath).map((p) => ({
    placement: p.placement,
    destination: p.destination,
    intent: p.intent,
    anchor: p.anchor,
    reason: p.reason,
  }));

  return (
    <PathNav
      id={id}
      eyebrow={eyebrow}
      heading={heading}
      {...(intro ? { intro } : {})}
      items={items}
      {...(className ? { className } : {})}
    />
  );
}

/**
 * Recipe pathway, built from the recipe's own `equipment` and `sourcing` data
 * rather than from hardcoded per-recipe copy. Equipment entries that already
 * point at an internal guide become an equipment path; sourcing entries become
 * a sourcing path. Nothing here implies a product was tested or endorsed.
 */
export function RecipeConversionPaths({
  slug,
  equipment,
  sourcing,
  className,
}: {
  slug: string;
  equipment: { label: string; why: string; to?: string; linkLabel?: string }[];
  sourcing: { label: string; why: string; to: string; linkLabel?: string }[];
  className?: string;
}) {
  const items: PathItem[] = [
    ...equipment
      .filter((item) => Boolean(item.to))
      .map((item) => ({
        placement: recipePlacementId(slug, "equipment", item.to as string),
        destination: item.to as string,
        intent: "equipment" as ConversionIntent,
        anchor: item.linkLabel ?? `What to look for: ${item.label.toLowerCase()}`,
        reason: item.why,
      })),
    ...sourcing.map((item) => ({
      placement: recipePlacementId(slug, "sourcing", item.to),
      destination: item.to,
      intent: "sourcing" as ConversionIntent,
      anchor: item.linkLabel ?? item.label,
      reason: item.why,
    })),
  ].filter(
    (item, index, all) => all.findIndex((other) => other.destination === item.destination) === index,
  );

  return (
    <PathNav
      id="recipe-conversion-paths"
      eyebrow="Before you cook this"
      heading="Equipment and sourcing paths for this recipe"
      intro="What each item is doing in this recipe, and the guide that explains how to choose one. The guides work at the level of category and material."
      items={items}
      {...(className ? { className } : {})}
    />
  );
}
