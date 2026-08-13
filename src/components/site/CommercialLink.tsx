import { ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  commercialLinkById,
  destinationHost,
  isAffiliateActive,
  relForLink,
  type CommercialLinkEntry,
} from "@/data/commercial-links";
import { trackCommercialClick } from "@/lib/analytics";

/**
 * Accessible outbound commercial link.
 *
 * Consumes a registry id (never a raw URL), opens external destinations safely,
 * and visibly discloses the relationship next to the link. `rel` is derived from
 * the registry: "sponsored nofollow noopener" for genuinely active affiliate
 * links, plain "noopener" for ordinary direct links. Tracking is fire-and-forget
 * and can never block navigation.
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
  const link = commercialLinkById(id);
  if (!link) return null;

  const text = label ?? `Visit ${link.merchant}`;
  const host = destinationHost(link.url);
  const base =
    variant === "button"
      ? "inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep"
      : "inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline";

  return (
    <a
      href={link.url}
      target="_blank"
      rel={relForLink(link)}
      onClick={() => trackCommercialClick({ link, placement })}
      className={`${base} ${className}`}
      aria-label={`${text} — opens ${host} in a new tab. ${link.disclosureLabel}.`}
    >
      {text}
      <ExternalLink aria-hidden="true" className="size-3.5" />
    </a>
  );
}

/** Small, honest relationship badge rendered beside every commercial option. */
export function RelationshipNote({ link }: { link: CommercialLinkEntry }) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      <span
        className={`mr-2 inline-block rounded-sm px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${
          isAffiliateActive(link)
            ? "bg-accent/20 text-gold-foreground"
            : "bg-cream text-muted-foreground"
        }`}
      >
        {isAffiliateActive(link) ? "Affiliate" : "No commission"}
      </span>
      {link.disclosureLabel} · {destinationHost(link.url)} · checked {link.lastVerified}
    </p>
  );
}

/**
 * Product/merchant callout.
 *
 * One option per registry id, with what it is genuinely useful for, the
 * relationship state, and an optional next step back into a technique page.
 * No prices, ratings, discounts, or merchant claims beyond `useFor`.
 */
export function CommercialCallout({
  heading,
  intro,
  linkIds,
  placement,
  criteria,
  footnote,
}: {
  heading: string;
  intro?: string;
  linkIds: string[];
  placement: string;
  criteria?: string[];
  footnote?: React.ReactNode;
}) {
  const links = linkIds.map(commercialLinkById).filter(Boolean) as CommercialLinkEntry[];
  if (links.length === 0) return null;

  return (
    <aside
      aria-label={heading}
      className="mt-8 rounded-sm border border-border bg-card p-5 sm:p-6"
    >
      <h2 className="font-display text-2xl leading-snug text-foreground">{heading}</h2>
      {intro && <p className="mt-2 text-sm leading-relaxed text-foreground/85">{intro}</p>}

      {criteria && criteria.length > 0 && (
        <>
          <h3 className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
            What to look for
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

      <ul className="mt-5 space-y-4">
        {links.map((link) => (
          <li key={link.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
            <p className="text-sm font-semibold text-foreground">{link.merchant}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/85">{link.useFor}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CommercialLink id={link.id} placement={placement} variant="inline" />
            </div>
            <div className="mt-2">
              <RelationshipNote link={link} />
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
        How we choose what to mention is described in our{" "}
        <Link to="/editorial-standards" className="text-primary underline underline-offset-4">
          editorial standards
        </Link>{" "}
        and{" "}
        <Link to="/affiliate-disclosure" className="text-primary underline underline-offset-4">
          affiliate disclosure
        </Link>
        .
      </p>
    </aside>
  );
}
