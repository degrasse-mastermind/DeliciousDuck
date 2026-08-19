import { ExternalLink, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  commercialLinkById,
  destinationHost,
  isAffiliateActive,
  relForLink,
  type CommercialLinkEntry,
} from "@/data/commercial-links";
import { trackCommercialClick } from "@/lib/analytics";
import { withAffiliateTracking } from "@/lib/affiliate-tracking";
import { COMMERCE_PANEL, CTA, DECISION_LABELS } from "@/lib/cta";

/**
 * Accessible outbound commercial link.
 *
 * Consumes a registry id (never a raw URL), opens external destinations safely,
 * and uses the shared commercial CTA treatment so purchase actions are easy to
 * spot. `rel` is derived from the registry: "sponsored nofollow noopener" for
 * genuinely active affiliate links, plain "noopener" for ordinary direct links.
 * Tracking is fire-and-forget and can never block navigation.
 *
 * Affiliate status is disclosed once per page, before the first affiliate link —
 * never re-stated on every button, and never labelled on links that pay nothing.
 *
 * Tracking implementation details are never described in visitor-facing prose.
 */
export function CommercialLink({
  id,
  placement,
  label,
  variant = "button",
  className = "",
}: {
  id: string;
  placement: string;
  label?: string;
  variant?: "button" | "inline";
  className?: string;
}) {
  const pathname = useLocation({ select: (l) => l.pathname });
  const link = commercialLinkById(id);
  if (!link) return null;

  const href = withAffiliateTracking(link.url, { placement, sourcePath: pathname });
  const text = label ?? link.ctaLabel ?? `Shop at ${link.merchant}`;
  const host = destinationHost(link.url);
  const base = variant === "button" ? CTA.commercial : CTA.tertiary;
  const Icon = variant === "button" ? ShoppingBag : ExternalLink;

  return (
    <a
      href={href}
      target="_blank"
      rel={relForLink(link)}
      onClick={() => trackCommercialClick({ link, placement })}
      className={`${base} ${className}`}
      aria-label={`${text} — opens ${host} in a new tab.`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {text}
    </a>
  );
}

/**
 * Accurate, compact per-link relationship label, derived from the registry.
 *
 * Only two states are ever shown: a genuinely monetized link says so, and
 * everything else says plainly that no money changes hands. Never a commission
 * claim for a link that pays nothing.
 */
export function relationshipLabel(link: CommercialLinkEntry): string {
  return isAffiliateActive(link)
    ? "Affiliate link · we may earn a commission"
    : "Editorial link · no paid relationship";
}

/**
 * Neutral destination note rendered beside a commercial option.
 *
 * States only facts a buyer can use: where the link goes and when we last
 * checked it. Pass `showRelationship` on pages where the present status of each
 * individual seller link should be unambiguous; the site-wide disclosure
 * component stays in place for future-proofing either way.
 */
export function RelationshipNote({
  link,
  showRelationship = false,
}: {
  link: CommercialLinkEntry;
  showRelationship?: boolean;
}) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      {destinationHost(link.url)} · checked {link.lastVerified}
      {showRelationship && <> · {relationshipLabel(link)}</>}
    </p>
  );
}

/**
 * Product/merchant callout.
 *
 * One option per registry id, with what it is genuinely useful for and an
 * optional next step back into a technique page. No prices, ratings, discounts,
 * or merchant claims beyond `useFor`.
 */
export function CommercialCallout({
  heading,
  intro,
  linkIds,
  placement,
  criteria,
  footnote,
  showRelationship = false,
  useForById,
}: {
  heading: string;
  intro?: string;
  linkIds: string[];
  placement: string;
  criteria?: string[];
  footnote?: React.ReactNode;
  /** Show the compact per-link relationship label from the registry. */
  showRelationship?: boolean;
  /**
   * Page-specific "best for" copy, keyed by registry id. Used where a page reads
   * a seller for one cut and the registry's site-wide summary would be broader
   * than the comparison scope on this page.
   */
  useForById?: Record<string, string>;
}) {
  const links = linkIds.map(commercialLinkById).filter(Boolean) as CommercialLinkEntry[];
  if (links.length === 0) return null;

  return (
    <aside aria-label={heading} className={`mt-8 ${COMMERCE_PANEL}`}>
      <h2 className="font-display text-2xl leading-snug text-foreground">{heading}</h2>
      {intro && <p className="mt-2 text-sm leading-relaxed text-foreground/85">{intro}</p>}

      {criteria && criteria.length > 0 && (
        <>
          <h3 className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
            {DECISION_LABELS.check}
          </h3>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-foreground/85">
            {criteria.map((c) => (
              <li key={c} className="border-l-2 border-primary/40 pl-3">
                {c}
              </li>
            ))}
          </ul>
        </>
      )}

      <ul className="mt-5 space-y-5">
        {links.map((link) => (
          <li
            key={link.id}
            className="rounded-sm bg-card p-4 ring-1 ring-border first:mt-0"
          >
            <p className="font-display text-lg text-foreground">{link.merchant}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold">{DECISION_LABELS.bestFor}: </span>
              {useForById?.[link.id] ?? link.useFor}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CommercialLink id={link.id} placement={placement} />
            </div>
            <div className="mt-2">
              <RelationshipNote link={link} showRelationship={showRelationship} />
            </div>
          </li>
        ))}
      </ul>

      {footnote && (
        <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          {footnote}
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        <Link to="/editorial-standards" className="text-primary underline underline-offset-4">
          How we choose recommendations
        </Link>
      </p>
    </aside>
  );
}

/** Exported for callers that need to branch on live monetization state. */
export { isAffiliateActive };

