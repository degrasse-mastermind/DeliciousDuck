import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ConversionIntent } from "@/data/conversion-paths";
import { trackConversionPathClick } from "@/lib/analytics";

/**
 * VerdictChoice — the one decisive next step directly under a verdict.
 *
 * Two honest internal routes, side by side, so a reader who has just made the
 * call can act on it without scrolling past FAQs first. Everything here is an
 * internal anchor: no merchant links, no prices, no availability claims and no
 * guest-count thresholds we cannot support.
 *
 * Analytics reuses the existing `internal_conversion_click` event, one stable
 * unique placement id per link, so these clicks join the same reporting as the
 * page's other internal conversion paths.
 */

export interface VerdictOption {
  /** Short label for the branch, e.g. "Going with duck". */
  label: string;
  /** One line on who this branch is for. */
  summary: string;
  links: Array<{
    placement: string;
    to: string;
    intent: ConversionIntent;
    anchor: string;
    why: string;
  }>;
  tone?: "primary" | "muted";
}

export function VerdictChoice({
  id,
  heading,
  options,
}: {
  id: string;
  heading: string;
  options: VerdictOption[];
}) {
  return (
    <section
      aria-labelledby={id}
      className="mt-8 rounded-sm border border-border bg-card p-5 sm:p-6"
    >
      <h3 id={id} className="eyebrow text-primary">
        {heading}
      </h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-6">
        {options.map((option) => (
          <div
            key={option.label}
            className={`border-l-2 pl-4 ${
              option.tone === "muted" ? "border-border" : "border-primary"
            }`}
          >
            <p className="font-display text-lg leading-snug text-foreground">{option.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{option.summary}</p>
            <ul className="mt-3 space-y-2">
              {option.links.map((link) => (
                <li key={link.placement}>
                  <Link
                    to={link.to}
                    data-placement={link.placement}
                    onClick={() =>
                      trackConversionPathClick({
                        destination: link.to,
                        intent: link.intent,
                        placement: link.placement,
                      })
                    }
                    className="group flex min-h-11 items-start gap-2 text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span>
                      {link.anchor}
                      <span className="mt-0.5 block text-xs font-normal not-italic text-muted-foreground no-underline">
                        {link.why}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
