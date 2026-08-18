import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, ShoppingBag } from "lucide-react";
import { AFFILIATE_DISCLOSURE_SENTENCE, type ComparisonRow } from "@/data/comparisons";
import { trackAffiliateClick } from "@/lib/analytics";
import { HAS_ACTIVE_AFFILIATE_PROGRAM, resolveCommerceLink } from "@/data/affiliates";
import { COMMERCE_PANEL, CTA, DECISION_LABELS } from "@/lib/cta";

/**
 * Commercial modules for money pages.
 *
 * CTA policy: the destination is resolved by `resolveCommerceLink` against the
 * merchant registry (src/data/affiliates.ts). A sponsored affiliate CTA renders
 * only when that registry says the program is active AND holds a real tracking
 * URL. Otherwise the row falls back to a neutral direct seller link, and to no
 * link at all when there is no legitimate destination. Placeholder "#" links
 * are never rendered, and a merchant is never treated as monetized just because
 * an application was filed.
 *
 * Disclosure policy: exactly ONE plain-language disclosure per page, placed
 * before the first affiliate link, and only on pages that actually carry one.
 * Non-affiliate links get no status label at all — readers do not need a running
 * ledger of which links do not pay us.
 */
export function DisclosureBanner({ compact = false }: { compact?: boolean }) {
  // No active program means no affiliate link on any page, so no page-level
  // disclosure is shown. Never claim a relationship that is not live.
  if (!HAS_ACTIVE_AFFILIATE_PROGRAM) return null;

  return (
    <aside
      aria-label="Affiliate disclosure"
      className={`rounded-sm border-l-2 border-accent bg-cream/70 text-sm leading-relaxed text-foreground/85 ${
        compact ? "px-4 py-3" : "px-5 py-4"
      }`}
    >
      <p>
        {AFFILIATE_DISCLOSURE_SENTENCE}{" "}
        <Link to="/editorial-standards" className="text-primary underline underline-offset-4">
          How we choose recommendations
        </Link>
        .
      </p>
    </aside>
  );
}


/**
 * Outbound seller CTA for a comparison row.
 *
 * Label is specific and action-oriented ("Shop duck at Culver Duck") rather than
 * a vague generic seller label. Affiliate and direct destinations share the same
 * commercial treatment — affiliate status is disclosed once per page, not
 * re-stated on every button.
 */
function RowCta({
  row,
  placement = "comparison_card",
  shopNoun,
}: {
  row: ComparisonRow;
  placement?: string;
  shopNoun?: string;
}) {
  const link = resolveCommerceLink({
    merchantId: row.merchantId,
    affiliateUrl: row.affiliateStatus === "active" ? row.affiliateUrl : undefined,
    directUrl: row.directUrl,
    name: row.name,
  });

  const label = shopNoun ? `Shop ${shopNoun} at ${row.name}` : `Shop at ${row.name}`;

  if (link.kind === "affiliate" && link.href) {
    return (
      <a
        href={link.href}
        rel="sponsored noopener noreferrer"
        target="_blank"
        onClick={() =>
          trackAffiliateClick({
            linkUrl: link.href!,
            linkText: label,
            merchant: link.merchantName ?? row.name,
            merchantId: link.merchantId,
            placement,
            linkType: "affiliate",
            destinationType: "affiliate_tracking",
          })
        }
        className={CTA.commercial}
      >
        <ShoppingBag aria-hidden="true" className="size-3.5" />
        {label}
      </a>
    );
  }

  if (link.kind === "direct" && link.href) {
    return (
      <a
        href={link.href}
        rel="noopener noreferrer nofollow"
        target="_blank"
        onClick={() =>
          trackAffiliateClick({
            linkUrl: link.href!,
            linkText: label,
            merchant: link.merchantName ?? row.name,
            merchantId: link.merchantId,
            placement,
            linkType: "direct_seller",
            destinationType: "merchant_direct",
          })
        }
        className={CTA.commercial}
      >
        <ExternalLink aria-hidden="true" className="size-3.5" />
        {label}
      </a>
    );
  }

  return (
    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
      No verified seller link yet
    </p>
  );
}


/**
 * Evaluation-methodology trust statement for commercial pages.
 *
 * States plainly how recommendations are formed today: desk research against
 * published specifications and technique, not hands-on testing.
 */
export function EvaluationNote({ scope }: { scope: string }) {
  return (
    <aside
      aria-label="How we evaluate"
      className="mt-6 rounded-sm border border-border bg-cream p-5"
    >
      <h2 className="eyebrow text-primary">How we evaluate {scope}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        These recommendations are editorial. They come from published
        specifications, manufacturer and merchant documentation, and duck-cooking
        technique — not from hands-on testing in our kitchen. We do not publish
        prices, star ratings, review counts, or test results we have not produced
        ourselves, and we do not accept payment for placement. Where a category
        matters more than a brand, we say so and let you shop the category. Once
        we test equipment or place orders ourselves, those pages will say exactly
        what was tested and when.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Read our{" "}
        <Link to="/editorial-standards" className="text-primary underline underline-offset-4">
          editorial standards
        </Link>
        .
      </p>
    </aside>
  );
}

export function ComparisonCard({
  row,
  factors,
  placement = "comparison_card",
  shopNoun,
}: {
  row: ComparisonRow;
  factors: readonly { key: string; label: string }[];
  placement?: string;
  shopNoun?: string;
}) {
  return (
    <article className={COMMERCE_PANEL}>
      <span className="eyebrow text-primary">{row.kind}</span>
      <h3 className="mt-2 font-display text-2xl leading-snug text-foreground">{row.name}</h3>
      <p className="mt-3 rounded-sm bg-card p-3 text-sm leading-relaxed text-foreground/85">
        <span className="font-semibold text-foreground">{DECISION_LABELS.bestFor}: </span>
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
            {DECISION_LABELS.standsOut}
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
            {DECISION_LABELS.check}
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
        <p className="mt-5 rounded-sm bg-card p-3 text-xs leading-relaxed text-muted-foreground">
          {row.note}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <RowCta row={row} placement={placement} {...(shopNoun ? { shopNoun } : {})} />
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Details checked {row.lastVerified}
        </p>
      </div>
    </article>
  );
}

/**
 * "Best options at a glance" — a compact decision layer near the top of a long
 * commercial page.
 *
 * Built only from rows already published further down the page: the name, who it
 * suits, and the same outbound CTA. No rankings, no prices, no stock claims.
 */
export function QuickPicks({
  rows,
  placement,
  shopNoun,
  heading = "Best options at a glance",
  intro,
}: {
  rows: ComparisonRow[];
  placement: string;
  shopNoun?: string;
  heading?: string;
  intro?: string;
}) {
  // Every row already published below appears here. Rows with a verified seller
  // link also carry the outbound CTA; the rest are decision entries only.
  const pickable = rows;
  if (pickable.length === 0) return null;

  return (
    <section aria-labelledby="quick-picks" className="mt-8">
      <h2 id="quick-picks" className="font-display text-2xl leading-snug text-foreground">
        {heading}
      </h2>
      {intro && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{intro}</p>}
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {pickable.map((row) => (
          <li key={row.id} className={`${COMMERCE_PANEL} flex flex-col`}>
            <h3 className="font-display text-xl leading-snug text-foreground">{row.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold">{DECISION_LABELS.bestFor}: </span>
              {row.bestFor}
            </p>
            {(row.merchantId || row.directUrl) && (
              <div className="mt-4 pt-1">
                <RowCta row={row} placement={placement} {...(shopNoun ? { shopNoun } : {})} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
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
  const uid = useId();
  const hintId = `${uid}-scroll-hint`;
  const scroller = useRef<HTMLDivElement | null>(null);
  const [scrollable, setScrollable] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const measure = () => {
      const overflow = el.scrollWidth - el.clientWidth;
      setScrollable(overflow > 8);
      setAtEnd(overflow <= 8 || el.scrollLeft >= overflow - 8);
    };

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [rows.length, factors.length]);

  const showHint = scrollable && !atEnd;

  return (
    <div className="mt-6">
      <div className="relative">
        <div
          ref={scroller}
          role="group"
          aria-label={caption}
          tabIndex={0}
          className="overflow-x-auto rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <table
            className="w-full min-w-[44rem] border-collapse text-left text-sm"
            {...(scrollable ? { "aria-describedby": hintId } : {})}
          >
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

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent motion-safe:transition-opacity motion-safe:duration-200 ${
            showHint ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <p
        id={hintId}
        data-table-scroll-hint
        className={`mt-2 text-xs text-muted-foreground ${showHint ? "" : "hidden"}`}
      >
        {showHint ? "Scroll to compare \u2192" : "End of table"}
      </p>
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
    <section
      aria-labelledby="shop-this-guide"
      className="mt-16 rounded-sm border border-accent/35 bg-cream/70 p-6 lg:p-7"
    >
      <div className="flex items-center gap-2.5">
        <ShoppingBag aria-hidden="true" className="size-4 text-primary" />
        <h2 id="shop-this-guide" className="eyebrow text-primary">
          Shop this guide
        </h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{intro}</p>
      {/*
        No disclosure block here: the one page-level disclosure is rendered
        above the first affiliate link, and repeating it is exactly the
        duplication this module used to create.
      */}
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item.label} className="border-t border-border pt-4">
            <h3 className="font-display text-lg text-foreground">{item.label}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.why}</p>
            {item.to && (
              <Link to={item.to} className={`mt-2 ${CTA.tertiarySmall}`}>
                {item.linkLabel ?? "Read the buying guide"}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

