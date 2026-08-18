import { Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardCheck, Compass } from "lucide-react";
import type { DecisionGuideMeta } from "@/data/decision-guides";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatUpdated(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
}

/**
 * Byline + last-updated + editorial-review transparency line.
 * Author is the organisation, matching the Organization author used in schema.
 */
export function EditorialByline({ guide }: { guide: DecisionGuideMeta }) {
  return (
    <div className="mt-1 flex flex-col gap-2 border-y border-border py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        By <span className="font-semibold text-foreground">{guide.byline}</span> · {guide.reviewedBy}{" "}
        <Link to="/editorial-standards" className="text-primary underline underline-offset-4">
          Editorial standards
        </Link>
      </p>
      <p className="flex items-center gap-1.5 whitespace-nowrap">
        <CalendarCheck aria-hidden="true" className="size-3.5" />
        Updated{" "}
        <time dateTime={guide.updated} className="font-semibold text-foreground">
          {formatUpdated(guide.updated)}
        </time>
      </p>
    </div>
  );
}

/** Honest methodology / evaluation-standard panel. */
export function MethodologyPanel({ guide }: { guide: DecisionGuideMeta }) {
  return (
    <section
      aria-labelledby="methodology"
      className="mt-10 rounded-sm border border-border bg-cream p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5">
        <ClipboardCheck aria-hidden="true" className="size-4 text-primary" />
        <h2 id="methodology" className="eyebrow text-primary">
          How we made these calls
        </h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/85">{guide.evaluationStandard}</p>
      <h3 className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
        What this is based on
      </h3>
      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
        {guide.methodology.map((m) => (
          <li key={m} className="border-l-2 border-primary/40 pl-3">
            {m}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Evaluation basis. </span>
        {guide.evidenceBasis}
      </p>
    </section>
  );
}

/** Quick decision summary — the scannable answer before the long-form detail. */
export function QuickDecision({ guide }: { guide: DecisionGuideMeta }) {
  return (
    <section aria-labelledby="quick-decision" className="mt-10">
      <div className="flex items-center gap-2.5">
        <Compass aria-hidden="true" className="size-4 text-primary" />
        <h2 id="quick-decision" className="eyebrow text-primary">
          The short answer
        </h2>
      </div>
      <dl className="mt-4 divide-y divide-border border-y border-border">
        {guide.quickPicks.map((pick) => (
          <div key={pick.situation} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-6">
            <dt className="text-sm font-semibold leading-snug text-foreground">{pick.situation}</dt>
            <dd className="text-sm leading-relaxed text-foreground/85">
              <span className="font-display text-lg text-primary">{pick.choice}</span>
              <span className="mt-1 block text-muted-foreground">{pick.why}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Accessible decision matrix. A real <table> with a caption, a row-header
 * column, and column headers so screen readers can associate every cell.
 * Scrolls horizontally on narrow viewports rather than reflowing into mush.
 */
export function DecisionMatrixTable({ guide }: { guide: DecisionGuideMeta }) {
  const { matrix } = guide;
  return (
    <div className="mt-6 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
        <caption className="mb-3 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {matrix.caption}
        </caption>
        <thead>
          <tr className="border-b border-foreground/20">
            <th scope="col" className="py-2.5 pr-4 align-bottom font-semibold text-foreground">
              {matrix.criterionLabel}
            </th>
            {matrix.options.map((opt) => (
              <th
                scope="col"
                key={opt}
                className="py-2.5 pr-4 align-bottom font-display text-base font-normal text-foreground"
              >
                {opt}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.criterion} className="border-b border-border align-top">
              <th
                scope="row"
                className="py-3 pr-4 text-xs font-semibold uppercase tracking-[0.1em] text-primary"
              >
                {row.criterion}
              </th>
              {row.values.map((value, i) => (
                <td key={`${row.criterion}-${matrix.options[i]}`} className="py-3 pr-4 leading-relaxed text-foreground/85">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "Best for" guidance, deliberately unranked. */
export function BestForGrid({ guide }: { guide: DecisionGuideMeta }) {
  return (
    <section aria-labelledby="best-for" className="mt-12">
      <h2 id="best-for" className="font-display text-[1.75rem] leading-tight text-foreground lg:text-4xl">
        Who each option is for
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Listed in no particular order. We don't rank these, because the right answer changes with
        how you cook rather than with any score we could assign.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {guide.bestFor.map((entry) => (
          <li key={entry.option} className="rounded-sm border border-border p-4">
            <h3 className="font-display text-lg text-foreground">{entry.option}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold">Good fit: </span>
              {entry.forWhom}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold">Not for: </span>
              {entry.notFor}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Funnel band: informational technique page → the decision guide that makes the
 * purchase decision, phrased around the cook rather than around a product.
 * Internal links only; merchant destinations stay in the registry-backed
 * CommercialLink components.
 */
export function DecisionNextSteps({
  heading = "If you're deciding what to buy",
  intro,
  items,
}: {
  heading?: string;
  intro?: string;
  items: { to: string; label: string; why: string }[];
}) {
  return (
    <section
      aria-labelledby="decision-next-steps"
      className="mt-14 rounded-sm border border-border bg-cream p-5 sm:p-6"
    >
      <h2 id="decision-next-steps" className="eyebrow text-primary">
        {heading}
      </h2>
      {intro && <p className="mt-2 text-sm leading-relaxed text-foreground/85">{intro}</p>}
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.to} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
            <Link
              to={item.to}
              className="font-display text-lg text-primary underline-offset-4 hover:underline"
            >
              {item.label}
            </Link>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.why}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
