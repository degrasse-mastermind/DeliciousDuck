import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass } from "lucide-react";
import { duckFatDecisionFor } from "@/data/duck-fat-decision";
import { trackConversionPathClick, trackConversionModuleView } from "@/lib/analytics";
import { useModuleImpression } from "@/hooks/useModuleImpression";
import { MODULE_PLACEMENTS } from "@/lib/impression-events";

/**
 * DuckFatDecision — the shared render / buy / substitute fork for the duck-fat
 * cluster.
 *
 * Editorial, not a storefront: three situations, three calls, one internal link
 * each. The buying guide is the primary next step and appears exactly once.
 * There are no outbound merchant links here, so no disclosure belongs on this
 * module — affiliate links and their single per-page disclosure stay on
 * `/buy/duck-fat-buying-guide`.
 *
 * The module also emits one `conversion_module_view` per session when it is
 * meaningfully visible, so the internal clicks below have an honest denominator.
 *
 * Analytics reuses the existing `internal_conversion_click` event with the
 * placement ids from `@/data/duck-fat-decision`. Tracking never blocks
 * navigation.
 */
export function DuckFatDecision({ sourcePath }: { sourcePath: string }) {
  const set = duckFatDecisionFor(sourcePath);
  const ref = useModuleImpression<HTMLElement>(() =>
    trackConversionModuleView({
      placement: MODULE_PLACEMENTS.duckFatDecision,
      moduleType: "decision_fork",
      destinationType: "internal",
      intent: "sourcing",
    }),
  );
  if (!set) return null;

  return (
    <section
      ref={ref}
      data-placement={MODULE_PLACEMENTS.duckFatDecision}
      aria-labelledby="duck-fat-decision"
      className="mt-12 rounded-sm border border-border bg-cream p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5">
        <Compass aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <h2 id="duck-fat-decision" className="eyebrow text-primary">
          {set.heading}
        </h2>
      </div>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/85">{set.intro}</p>

      <ul className="mt-5 grid gap-4 sm:grid-cols-3">
        {set.options.map((option) => (
          <li
            key={option.choice}
            className="flex flex-col border-t border-border pt-4 sm:border-t-0 sm:border-l-2 sm:border-primary/30 sm:pl-4 sm:pt-0"
          >
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {option.when}
            </p>
            <p className="mt-1.5 font-display text-lg leading-snug text-foreground">
              {option.verdict}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{option.why}</p>
            {option.to && option.placement && (
              <Link
                to={option.to}
                data-placement={option.placement}
                onClick={() =>
                  trackConversionPathClick({
                    destination: option.to as string,
                    intent: option.intent ?? "sourcing",
                    placement: option.placement as string,
                  })
                }
                className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                {option.linkLabel}
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
