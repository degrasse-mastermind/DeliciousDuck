import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Info } from "lucide-react";
import type { AffiliateItem } from "@/data/products";

export function AffiliateCallout({ item }: { item: AffiliateItem }) {
  return (
    <article className="flex h-full flex-col rounded-sm border border-border bg-card p-6">
      <span className="eyebrow text-primary">{item.category}</span>
      <h3 className="mt-3 font-display text-2xl leading-snug text-foreground">{item.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.whatItIs}</p>
      <p className="mt-3 border-l-2 border-accent pl-3 text-sm leading-relaxed text-foreground/80">
        {item.whyItMatters}
      </p>
      <div className="mt-6 pt-2">
        <Link
          to={item.href ?? "/buy"}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
        >
          {item.ctaLabel}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

/**
 * Site-wide commercial-links note. Only claims commissions when at least one
 * affiliate program is genuinely active in the merchant registry.
 */
export function AffiliateDisclosureNote({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={`flex items-start gap-3 rounded-sm border border-border bg-cream text-sm text-muted-foreground ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
      {HAS_ACTIVE_AFFILIATE_PROGRAM ? (
        <p>
          Some links on DeliciousDuck are affiliate links, which can earn us a commission at no
          extra cost to you. We only describe products we can explain and never publish prices,
          ratings, or claims we have not verified.{" "}
          <Link to="/affiliate-disclosure" className="text-primary underline underline-offset-4">
            Read our full disclosure
          </Link>
          .
        </p>
      ) : (
        <p>
          DeliciousDuck earns no commission today — we have no active affiliate programs, and every
          outbound link goes straight to the seller with no tracking. We only describe products we
          can explain and never publish prices, ratings, or claims we have not verified.{" "}
          <Link to="/affiliate-disclosure" className="text-primary underline underline-offset-4">
            Read our full disclosure
          </Link>
          .
        </p>
      )}
    </aside>
  );
}
