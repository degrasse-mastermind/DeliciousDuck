import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";
import type { Crumb } from "./Breadcrumbs";
import { SketchAutoLayout } from "./SketchAutoLayout";

/**
 * Long-form article shell: editorial page header, a readable single measure
 * for body content, and an optional sticky sidebar for callouts.
 */
export function ArticleShell({
  eyebrow,
  title,
  intro,
  trail,
  meta,
  children,
  sidebar,
  autoSketch = true,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  trail: Crumb[];
  meta?: string;
  children: ReactNode;
  sidebar?: ReactNode;
  /** Opt out of automatic in-body illustrations for this page. */
  autoSketch?: boolean;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} trail={trail} />
      {meta && (
        <div className="border-b border-border bg-background">
          <p className="mx-auto max-w-7xl px-5 py-3 text-xs uppercase tracking-[0.14em] text-muted-foreground lg:px-8">
            {meta}
          </p>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        {sidebar ? (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
            <article className="min-w-0 max-w-[46rem]">
              <SketchAutoLayout column="narrow" disabled={!autoSketch}>
                {children}
              </SketchAutoLayout>
            </article>
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">{sidebar}</aside>
          </div>
        ) : (
          <article className="mx-auto max-w-[46rem]">
            <SketchAutoLayout column="wide" disabled={!autoSketch}>
              {children}
            </SketchAutoLayout>
          </article>
        )}
      </div>
    </>
  );
}

/** A titled body section with consistent heading rhythm. */
export function Section({
  id,
  heading,
  level = 2,
  children,
}: {
  id: string;
  heading: string;
  level?: 2 | 3;
  children: ReactNode;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby={id} className="mt-14 first:mt-0 scroll-mt-24">
      <Heading
        id={id}
        className={
          level === 2
            ? "font-display text-[1.75rem] leading-tight text-foreground lg:text-4xl"
            : "font-display text-xl text-foreground lg:text-2xl"
        }
      >
        {heading}
      </Heading>
      <div className="mt-5 space-y-5 text-base leading-[1.75] text-foreground/85">{children}</div>
    </section>
  );
}

export function Callout({
  label,
  children,
  tone = "default",
}: {
  label: string;
  children: ReactNode;
  tone?: "default" | "gold";
}) {
  return (
    <aside
      className={`rounded-sm border-l-2 p-5 text-sm leading-relaxed ${
        tone === "gold"
          ? "border-accent bg-accent/10 text-foreground/90"
          : "border-primary bg-cream text-foreground/90"
      }`}
    >
      <p className="eyebrow text-primary">{label}</p>
      <div className="mt-2 space-y-3">{children}</div>
    </aside>
  );
}

/** Numbered, kitchen-ordered steps. */
export function StepList({
  steps,
}: {
  steps: { title: string; body: string; watchFor?: string }[];
}) {
  return (
    <ol className="mt-2 space-y-6">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 font-display text-sm text-primary"
          >
            {i + 1}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg text-foreground">{step.title}</h3>
            <p className="mt-1.5 text-base leading-[1.75] text-foreground/85">{step.body}</p>
            {step.watchFor && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold uppercase tracking-[0.12em] text-primary">
                  Watch for
                </span>{" "}
                {step.watchFor}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function FaqList({ items, title = "Common questions" }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <section aria-labelledby="faq" className="mt-16">
      <h2 id="faq" className="font-display text-[1.75rem] text-foreground lg:text-4xl">
        {title}
      </h2>
      <dl className="mt-6 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <div key={item.q} className="py-5">
            <dt className="font-display text-lg text-foreground">{item.q}</dt>
            <dd className="mt-2 text-base leading-[1.7] text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Comparison table with a real mobile scroll affordance.
 *
 * The table stays a semantic `<table>` at every width — row headers, column
 * headers and caption intact — because a stacked-card rewrite loses the
 * cell/header association screen readers rely on. What narrow viewports get
 * instead is an honest affordance: a "Scroll to compare" hint and a right-edge
 * fade, both of which disappear once the reader reaches the end of the track.
 *
 * Accessibility notes:
 * - the scroll container is focusable (`tabIndex={0}`) with a group role and an
 *   accessible name, so keyboard users can scroll it with the arrow keys;
 * - the hint is plain text tied to the table via `aria-describedby`, not a
 *   live region, so it is announced in context and never chatters;
 * - the fade is `aria-hidden` and purely decorative, and its transition is
 *   wrapped in `motion-safe:` so reduced-motion users get an instant change;
 * - the container clips its own overflow, so the page itself never scrolls
 *   sideways.
 */
export function DataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: string[][];
}) {
  const uid = useId();
  const hintId = `${uid}-scroll-hint`;
  const scroller = useRef<HTMLDivElement | null>(null);
  const [scrollable, setScrollable] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const measure = () => {
      const overflow = el.scrollWidth - el.clientWidth;
      setScrollable(overflow > 8);
      setAtEnd(overflow <= 8 || el.scrollLeft >= overflow - 8);
    };

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [rows.length, columns.length]);

  const showHint = scrollable && !atEnd;

  return (
    <div className="mt-2">
      <div className="relative">
        <div
          ref={scroller}
          role="group"
          aria-label={caption}
          tabIndex={0}
          className="overflow-x-auto rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <table
            className="w-full min-w-[34rem] border-collapse text-left text-sm"
            {...(scrollable ? { "aria-describedby": hintId } : {})}
          >
            <caption className="mb-3 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {caption}
            </caption>
            <thead>
              <tr className="border-y border-border bg-cream">
                {columns.map((c) => (
                  <th key={c} scope="col" className="px-3 py-3 font-semibold text-foreground">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-border align-top">
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th
                        key={i}
                        scope="row"
                        className="px-3 py-3 text-left font-medium text-foreground"
                      >
                        {cell}
                      </th>
                    ) : (
                      <td key={i} className="px-3 py-3 text-muted-foreground">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent motion-safe:transition-opacity motion-safe:duration-200 ${
            showHint ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <p
        id={hintId}
        data-table-scroll-hint
        className={`mt-2 text-xs text-muted-foreground ${showHint ? "" : "hidden"}`}
      >
        {showHint ? "Scroll to compare \u2192" : "End of table"}
      </p>
    </div>
  );
}

