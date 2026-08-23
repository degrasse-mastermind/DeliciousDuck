/**
 * Short orientation block for a pillar hub.
 *
 * Hubs are mostly navigation, which leaves them thin on actual prose. This
 * gives each one a couple of paragraphs that answer the question a reader
 * arrives with — where do I start, and what does this section decide for me —
 * rather than padding word count.
 */
export function HubOrientation({
  heading,
  paragraphs,
  sections,
}: {
  heading: string;
  paragraphs: string[];
  /** Optional deeper subsections, each answering one common question. */
  sections?: { heading: string; paragraphs: string[] }[];
}) {
  return (
    <section
      aria-labelledby="hub-orientation"
      className="mt-16 max-w-3xl border-t border-border pt-8"
    >
      <h2 id="hub-orientation" className="font-display text-2xl text-foreground">
        {heading}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 32)}>{p}</p>
        ))}
      </div>
      {sections?.length ? (
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h3 className="font-display text-xl text-foreground">{s.heading}</h3>
              <div className="mt-3 space-y-4 text-base leading-relaxed text-muted-foreground">
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

