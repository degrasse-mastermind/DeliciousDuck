import { Wrench } from "lucide-react";

/**
 * Quack Fix — compact troubleshooting diagnostic.
 * symptom → likely cause → fix now → prevent next time
 */
export interface QuackFixItem {
  symptom: string;
  cause: string;
  fixNow: string;
  prevent: string;
}

export function QuackFix({
  items,
  title = "Quack Fix",
  intro,
}: {
  items: QuackFixItem[];
  title?: string;
  intro?: string;
}) {
  return (
    <section aria-labelledby="quack-fix" className="mt-16">
      <div className="flex items-center gap-2.5">
        <Wrench aria-hidden="true" className="size-4 text-primary" />
        <h2 id="quack-fix" className="eyebrow text-primary">
          {title}
        </h2>
      </div>
      {intro && (
        <p className="mt-3 max-w-2xl text-base leading-[1.75] text-foreground/85">{intro}</p>
      )}
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item.symptom} className="rounded-sm border border-border bg-card p-5">
            <h3 className="font-display text-lg leading-snug text-foreground">{item.symptom}</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Likely cause
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground/85">{item.cause}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
                  Fix now
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground/85">{item.fixNow}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-foreground">
                  Prevent next time
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground/85">{item.prevent}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
