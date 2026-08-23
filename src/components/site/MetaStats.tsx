/**
 * Three small stacked stats — label above value, real tracking — shared by
 * recipe cards and article headers so a detail page and its card read the same.
 */
export type MetaStat = { label: string; value: string };

export function MetaStats({
  stats,
  className,
}: {
  stats: readonly MetaStat[];
  className?: string;
}) {
  return (
    <dl className={className}>
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0">
          <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
            {stat.label}
          </dt>
          <dd className="mt-1 text-sm leading-tight text-foreground/85">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
