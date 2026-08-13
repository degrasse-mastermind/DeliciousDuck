import { CalendarCheck, ClipboardCheck, Compass } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { AcquisitionPageMeta } from "@/data/acquisition-cluster";

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
 * First-viewport answer for an informational cluster page.
 *
 * The reader gets the complete short answer before any long-form detail, which
 * is also the text the page's description and schema are written against.
 */
export function AnswerFirst({ page }: { page: AcquisitionPageMeta }) {
  return (
    <section aria-labelledby="short-answer" className="mt-2">
      <div className="flex items-center gap-2.5">
        <Compass aria-hidden="true" className="size-4 text-primary" />
        <h2 id="short-answer" className="eyebrow text-primary">
          The short answer
        </h2>
      </div>
      <p className="mt-3 border-l-2 border-primary/40 pl-4 text-lg leading-relaxed text-foreground/90">
        {page.answer}
      </p>
    </section>
  );
}

/** Byline, review date, and editorial-standards link. */
export function ArticleByline({ page }: { page: AcquisitionPageMeta }) {
  return (
    <div className="mt-1 flex flex-col gap-2 border-y border-border py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        By <span className="font-semibold text-foreground">{page.byline}</span> · {page.reviewedBy}{" "}
        <Link to="/editorial-standards" className="text-primary underline underline-offset-4">
          Editorial standards
        </Link>
      </p>
      <p className="flex items-center gap-1.5 whitespace-nowrap">
        <CalendarCheck aria-hidden="true" className="size-3.5" />
        Updated{" "}
        <time dateTime={page.updated} className="font-semibold text-foreground">
          {formatUpdated(page.updated)}
        </time>
      </p>
    </div>
  );
}

/** What the page is based on, and what has explicitly not been done. */
export function ArticleBasis({ page }: { page: AcquisitionPageMeta }) {
  return (
    <section
      aria-labelledby="article-basis"
      className="mt-10 rounded-sm border border-border bg-cream p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5">
        <ClipboardCheck aria-hidden="true" className="size-4 text-primary" />
        <h2 id="article-basis" className="eyebrow text-primary">
          What this page is based on
        </h2>
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
        {page.basedOn.map((b) => (
          <li key={b} className="border-l-2 border-primary/40 pl-3">
            {b}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">What we haven't done. </span>
        {page.notTested}
      </p>
    </section>
  );
}
