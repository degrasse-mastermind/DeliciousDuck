import { BookOpen } from "lucide-react";
import { sourceList } from "@/data/sources";

/**
 * Source notes. Pass the ids of entries in src/data/sources.ts so references
 * can be updated in one place as guidance changes.
 *
 * `id` and `heading` exist so a page can also cite sources inline, next to a
 * safety claim, without emitting a duplicate DOM id.
 */
export function SourceNotes({
  ids,
  extra,
  id = "sources",
  heading = "References",
}: {
  ids: string[];
  extra?: string[];
  id?: string;
  heading?: string;
}) {
  const sources = sourceList(ids);
  if (sources.length === 0 && !extra?.length) return null;

  return (
    <section aria-labelledby={id} className="mt-16 rounded-sm bg-cream p-6 lg:p-7">
      <div className="flex items-center gap-2.5">
        <BookOpen aria-hidden="true" className="size-4 text-primary" />
        <h2 id={id} className="eyebrow text-primary">
          {heading}
        </h2>
      </div>

      <ul className="mt-4 space-y-4 text-sm">
        {sources.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="font-medium text-primary underline underline-offset-4"
            >
              {s.label}
            </a>
            <span className="text-muted-foreground"> — {s.publisher}</span>
            {s.note && (
              <span className="mt-1 block leading-relaxed text-muted-foreground">{s.note}</span>
            )}
            <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground/80">
              Reference checked {s.checked}
            </span>
          </li>
        ))}
        {extra?.map((note) => (
          <li key={note} className="leading-relaxed text-muted-foreground">
            {note}
          </li>
        ))}
      </ul>
    </section>
  );
}
