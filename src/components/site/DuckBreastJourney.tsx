import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  CLUSTER_GROUPS,
  CLUSTER_GROUP_LABELS,
  clusterStopsExcluding,
  type ClusterGroup,
  type ClusterStop,
} from "@/lib/duck-breast-cluster";
import { trackDuckBreastClusterClick } from "@/lib/analytics";

/**
 * DuckBreastJourney — editorial wayfinding for the duck-breast cluster.
 *
 * This is a reading pathway, not a sales widget: every row says what the reader
 * gets at that page. Markup is a semantic `nav` with an accessible heading and
 * real `ul`/`li` anchors, so the links are crawlable and keyboard-navigable.
 *
 * Analytics: one stable `duck_breast_cluster_click` event with
 * destination_slug, destination_group, source_path and placement. No address,
 * token, query string, or full URL. `affiliate_click` is untouched, and none of
 * these links are affiliate links.
 */
export function DuckBreastJourney({
  id = "duck-breast-journey",
  title = "The duck-breast pathway",
  intro = "Ten pages, in the order most cooks actually need them: understand the method, cook it, fix what went wrong, then buy sensibly.",
  placement,
  variant = "pathway",
  groups = CLUSTER_GROUPS as readonly ClusterGroup[] as ClusterGroup[],
  excludePath,
  className,
}: {
  id?: string;
  title?: string;
  intro?: string;
  /** Stable analytics placement label for this instance. */
  placement: string;
  /** `pathway` = one ordered list; `grouped` = subheaded by stage. */
  variant?: "pathway" | "grouped";
  groups?: ClusterGroup[];
  /** The current page's own path, so it never links to itself. */
  excludePath?: string;
  className?: string;
}) {
  const stops = clusterStopsExcluding(excludePath).filter((stop) => groups.includes(stop.group));
  if (stops.length === 0) return null;

  return (
    <nav
      aria-labelledby={id}
      className={`mt-14 border-y border-border bg-secondary/30 px-5 py-8 sm:px-7 ${className ?? ""}`}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Keep going</p>
      <h2 id={id} className="mt-2 font-display text-2xl text-foreground lg:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{intro}</p>

      {variant === "grouped" ? (
        <div className="mt-6 space-y-7">
          {groups
            .map((group) => [group, stops.filter((stop) => stop.group === group)] as const)
            .filter(([, items]) => items.length > 0)
            .map(([group, items]) => (
              <div key={group}>
                <h3 className="font-display text-lg text-foreground">
                  {CLUSTER_GROUP_LABELS[group]}
                </h3>
                <StopList stops={items} placement={placement} />
              </div>
            ))}
        </div>
      ) : (
        <StopList stops={stops} placement={placement} />
      )}
    </nav>
  );
}

function StopList({ stops, placement }: { stops: ClusterStop[]; placement: string }) {
  return (
    <ul className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
      {stops.map((stop) => (
        <li key={stop.path}>
          <Link
            to={stop.path}
            onClick={() =>
              trackDuckBreastClusterClick({
                destinationPath: stop.path,
                destinationGroup: stop.group,
                placement,
              })
            }
            className="group flex items-start justify-between gap-4 border-t border-border/70 py-3 transition-colors hover:text-primary"
          >
            <span>
              <span className="block font-display text-base leading-snug text-foreground group-hover:text-primary">
                {stop.label}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {stop.note}
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
