import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";
import {
  THANKSGIVING_STAGE_LABELS,
  thanksgivingStepsFor,
  type ThanksgivingStage,
} from "@/data/thanksgiving-hub";
import { trackConversionPathClick } from "@/lib/analytics";

const STAGES: ThanksgivingStage[] = ["decide", "order", "cook", "serve"];

/**
 * The holiday plan, as a measured set of internal hand-offs.
 *
 * Editorial, not a storefront: each row is a dated task with one internal link
 * to the page that finishes it. There are no outbound merchant links here, so
 * no disclosure belongs on this module — merchant links and their per-page
 * disclosure stay on the gear and sourcing guides.
 *
 * Analytics reuses the existing `internal_conversion_click` event with the
 * placement ids from `@/data/thanksgiving-hub`. Tracking never blocks
 * navigation.
 */
export function ThanksgivingPlan({
  sourcePath,
  heading = "The plan, from ordering to carving",
  intro = "Nine decisions in the order a holiday actually makes them. Each one links to the page that finishes it.",
}: {
  sourcePath: string;
  heading?: string;
  intro?: string;
}) {
  return (
    <section
      aria-labelledby="thanksgiving-plan"
      data-source-path={sourcePath}
      className="mt-12 rounded-sm border border-border bg-cream p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5">
        <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <h2 id="thanksgiving-plan" className="eyebrow text-primary">
          {heading}
        </h2>
      </div>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/85">{intro}</p>

      <div className="mt-6 space-y-7">
        {STAGES.map((stage) => (
          <div key={stage} data-print-block>
            <h3 className="font-display text-lg text-foreground">
              {THANKSGIVING_STAGE_LABELS[stage]}
            </h3>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2">
              {thanksgivingStepsFor(stage).map((step) => (
                <li
                  key={step.placement}
                  className="flex flex-col rounded-sm bg-card p-4 ring-1 ring-border"
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {step.when}
                  </p>
                  <p className="mt-1.5 font-display text-base leading-snug text-foreground">
                    {step.task}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.why}</p>
                  <Link
                    to={step.to}
                    data-placement={step.placement}
                    onClick={() =>
                      trackConversionPathClick({
                        destination: step.to,
                        intent: step.intent,
                        placement: step.placement,
                      })
                    }
                    className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {step.linkLabel}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
