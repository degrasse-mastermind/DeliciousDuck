export function SectionHeader({
  id,
  eyebrow,
  title,
  intro,
  align = "left",
  as: Heading = "h2",
}: {
  /** Applied to the heading element itself, so `aria-labelledby` can point at
   *  the visible heading instead of a duplicated screen-reader-only copy. */
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <span className="eyebrow text-primary">{eyebrow}</span>}
      <Heading {...(id ? { id } : {})} className="mt-3 font-display text-3xl leading-tight text-foreground lg:text-[2.75rem]">
        {title}
      </Heading>
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>
      )}
    </div>
  );
}
