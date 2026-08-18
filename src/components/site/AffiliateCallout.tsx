import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { AffiliateItem } from "@/data/products";
import { COMMERCE_PANEL, CTA, DECISION_LABELS } from "@/lib/cta";

/**
 * Scannable commercial callout for buying/gear sections.
 *
 * Uses the shared pale-warm commerce panel so recommendations read as decisions
 * rather than article copy, with the site-wide decision labels. The action here
 * is an internal editorial link, so it uses the tertiary link treatment — the
 * page-level affiliate disclosure lives beside real affiliate links only.
 */
export function AffiliateCallout({ item }: { item: AffiliateItem }) {
  return (
    <article className={`flex h-full flex-col ${COMMERCE_PANEL}`}>
      <span className="eyebrow text-primary">{item.category}</span>
      <h3 className="mt-3 font-display text-2xl leading-snug text-foreground">{item.name}</h3>
      <p className="mt-3 rounded-sm bg-card p-3 text-sm leading-relaxed text-foreground/85">
        <span className="font-semibold text-foreground">{DECISION_LABELS.bestFor}: </span>
        {item.whatItIs}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-foreground/85">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
          {DECISION_LABELS.standsOut}
        </span>
        <br />
        {item.whyItMatters}
      </p>
      <div className="mt-auto pt-5">
        <Link to={item.href ?? "/buy"} className={CTA.tertiarySmall}>
          {item.ctaLabel}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
