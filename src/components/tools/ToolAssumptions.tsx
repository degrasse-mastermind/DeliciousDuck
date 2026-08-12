/**
 * Shared, explicit assumptions block for every calculator.
 *
 * Every tool on this site is a planning aid, not a doneness or safety test.
 * Stating the numbers a tool assumes lets a reader decide whether the output
 * applies to their bird, oven, and kitchen.
 */
export function ToolAssumptions({
  items,
  note,
}: {
  items: { label: string; value: string }[];
  note?: string;
}) {
  return (
    <section
      aria-labelledby="tool-assumptions"
      className="rounded-sm border border-border bg-cream p-5 lg:p-6"
    >
      <p className="eyebrow text-primary">How this is calculated</p>
      <h2 id="tool-assumptions" className="mt-2 font-display text-xl text-foreground">
        Assumptions behind these numbers
      </h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        {items.map((item) => (
          <div key={item.label} className="sm:flex sm:gap-3">
            <dt className="font-semibold text-foreground sm:w-56 sm:shrink-0">{item.label}</dt>
            <dd className="text-muted-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
        {note ??
          "These are planning estimates, not a doneness or food-safety test. Verify with a calibrated instant-read thermometer and follow your local food-safety guidance."}
      </p>
    </section>
  );
}
