import { Link } from "@tanstack/react-router";
import { ExternalLink, Info, ShoppingBag } from "lucide-react";
import { DISCLOSURE_TEXT, type ComparisonRow } from "@/data/comparisons";

/**
 * Commercial modules for money pages.
 *
 * CTA policy: an affiliate CTA renders only when `affiliateUrl` exists and
 * `affiliateStatus === "active"`. Otherwise we fall back to a neutral
 * "Visit seller" link when a legitimate direct URL exists, and to no link at
 * all when it does not. Placeholder "#" links are never rendered.
 */
export function DisclosureBanner({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-label="Affiliate disclosure"
      className={`flex items-start gap-3 rounded-sm border border-accent/40 bg-accent/10 text-sm text-foreground/85 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-foreground" />
      <p>
        <span className="font-semibold">Affiliate disclosure. </span>
        {DISCLOSURE_TEXT}{" "}
        <Link to="/affiliate-disclosure" className="text-primary underline underline-offset-4">
          Full disclosure
        </Link>
        .
      </p>
    </aside>
  );
}

function RowCta({ row }: { row: ComparisonRow }) {
  if (row.affiliateUrl && row.affiliateStatus === "active") {
    return (
      <a
        href={row.affiliateUrl}
        rel="sponsored noopener noreferrer"
        target="_blank"
        className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep"
      >
        Check availability
        <ExternalLink aria-hidden="true" className="size-3.5" />
      </a>
    );
  }
  if (row.directUrl) {
    return (
      <a
        href={row.directUrl}
        rel="noopener noreferrer nofollow"
        target="_blank"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
      >
        Visit seller
        <ExternalLink aria-hidden="true" className="size-3.5" />
      </a>
    );
  }
  return (
    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
      No verified seller link yet
    </p>
  );
}

export function ComparisonCard({
  row,
  factors,
}: {
  row: ComparisonRow;
  factors: readonly { key: string; label: string }[];
}) {
  return (
    <article className="rounded-sm border border-border bg-card p-6">
      <span className="eyebrow text-primary">{row.kind}</span>
      <h3 className="mt-2 font-display text-2xl leading-snug text-foreground">{row.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-foreground/85">
        <span className="font-semibold text-foreground">Best for: </span>
        {row.bestFor}
      </p>

      <dl className="mt-5 divide-y divide-border border-y border-border">
        {factors.map((f) => {
          const value = row.decisionFactors[f.key];
          if (!value) return null;
          return (
            <div key={f.key} className="grid gap-1 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {f.label}
              </dt>
              <dd className="text-sm leading-relaxed text-foreground/85">{value}</dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
            Strengths
          </h4>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-foreground/85">
            {row.pros.map((p) => (
              <li key={p} className="border-l-2 border-primary/40 pl-3">
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Trade-offs
          </h4>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-foreground/85">
            {row.tradeoffs.map((t) => (
              <li key={t} className="border-l-2 border-border pl-3">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {row.note && (
        <p className="mt-5 rounded-sm bg-cream p-3 text-xs leading-relaxed text-muted-foreground">
          {row.note}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <RowCta row={row} />
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Details checked {row.lastVerified}
        </p>
      </div>
    </article>
  );
}

/** Side-by-side factor comparison. Scrolls horizontally on small screens. */
export function ComparisonTable({
  caption,
  rows,
  factors,
}: {
  caption: string;
  rows: ComparisonRow[];
  factors: readonly { key: string; label: string }[];
}) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="mb-3 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {caption}
        </caption>
        <thead>
          <tr className="border-y border-border bg-cream">
            <th scope="col" className="px-3 py-3 font-semibold text-foreground">
              Option
            </th>
            {factors.map((f) => (
              <th key={f.key} scope="col" className="px-3 py-3 font-semibold text-foreground">
                {f.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border align-top">
              <th scope="row" className="px-3 py-4 text-left font-medium text-foreground">
                {row.name}
              </th>
              {factors.map((f) => (
                <td key={f.key} className="px-3 py-4 text-muted-foreground">
                  {row.decisionFactors[f.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "Shop this guide" — a compact recap of what a reader might buy, if anything. */
export function ShopThisGuide({
  items,
  intro = "What this guide actually asks you to own. If you already have a working version, keep it.",
}: {
  items: { label: string; why: string; to?: string; linkLabel?: string }[];
  intro?: string;
}) {
  return (
    <section aria-labelledby="shop-this-guide" className="mt-16 rounded-sm border border-border p-6 lg:p-7">
      <div className="flex items-center gap-2.5">
        <ShoppingBag aria-hidden="true" className="size-4 text-primary" />
        <h2 id="shop-this-guide" className="eyebrow text-primary">
          Shop this guide
        </h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{intro}</p>
      <div className="mt-5">
        <DisclosureBanner compact />
      </div>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item.label} className="border-t border-border pt-4">
            <h3 className="font-display text-lg text-foreground">{item.label}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.why}</p>
            {item.to && (
              <Link
                to={item.to}
                className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
              >
                {item.linkLabel ?? "Read the buying guide"}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
