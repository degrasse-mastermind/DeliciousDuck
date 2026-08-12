import { Heart } from "lucide-react";

/**
 * Duck Matchmaker — method/cut → sauce → sides → occasion pairings.
 */
export interface MatchmakerRow {
  starting: string;
  sauce: string;
  sides: string;
  occasion: string;
}

export function DuckMatchmaker({
  rows,
  startingLabel = "Method or cut",
  intro,
}: {
  rows: MatchmakerRow[];
  startingLabel?: string;
  intro?: string;
}) {
  return (
    <section aria-labelledby="matchmaker" className="mt-16">
      <div className="flex items-center gap-2.5">
        <Heart aria-hidden="true" className="size-4 text-primary" />
        <h2 id="matchmaker" className="eyebrow text-primary">
          Duck Matchmaker
        </h2>
      </div>
      {intro && (
        <p className="mt-3 max-w-2xl text-base leading-[1.75] text-foreground/85">{intro}</p>
      )}

      {/* Desktop: matrix */}
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-y border-border bg-cream">
              <th scope="col" className="px-3 py-3 font-semibold text-foreground">
                {startingLabel}
              </th>
              <th scope="col" className="px-3 py-3 font-semibold text-foreground">
                Sauce
              </th>
              <th scope="col" className="px-3 py-3 font-semibold text-foreground">
                Sides
              </th>
              <th scope="col" className="px-3 py-3 font-semibold text-foreground">
                Occasion
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.starting} className="border-b border-border align-top">
                <th scope="row" className="px-3 py-4 text-left font-medium text-foreground">
                  {r.starting}
                </th>
                <td className="px-3 py-4 text-muted-foreground">{r.sauce}</td>
                <td className="px-3 py-4 text-muted-foreground">{r.sides}</td>
                <td className="px-3 py-4 text-muted-foreground">{r.occasion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="mt-6 space-y-4 md:hidden">
        {rows.map((r) => (
          <li key={r.starting} className="rounded-sm border border-border bg-card p-5">
            <h3 className="font-display text-lg text-foreground">{r.starting}</h3>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Sauce", r.sauce],
                ["Sides", r.sides],
                ["Occasion", r.occasion],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[5rem_1fr] gap-3">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-foreground/85">{value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
