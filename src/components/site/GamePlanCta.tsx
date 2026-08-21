import { ArrowRight, Check } from "lucide-react";

import { trackGamePlanInternalClick } from "@/lib/analytics";
import { useModuleImpression } from "@/hooks/useModuleImpression";
import { trackNewsletterOfferView } from "@/lib/analytics";
import { DUCK_DROP } from "@/data/duck-drop";
import { cn } from "@/lib/utils";

/**
 * The primary acquisition CTA: a utility-first hook for the Duck Game Plan.
 *
 * Replaces the PDF-first promise on the surfaces where signup is the point. The
 * Duck Drop is still the newsletter people join — the Game Plan is what they get
 * for joining, and what makes joining worth it while dinner is on the counter.
 *
 * Measurement reuses the existing taxonomy: one `newsletter_offer_view` per
 * session per placement when the module is genuinely visible, and a Game Plan
 * internal click on the CTA. Nothing here touches an email address.
 */

const GAME_PLAN_PATH = "/tools/duck-game-plan";

const BULLETS = [
  "Temperature and resting for your exact cut",
  "The one move that decides crispy skin",
  "Timing, portions, and what to serve with it",
] as const;

export function GamePlanCta({
  id = "game-plan-cta",
  tone = "forest",
  className,
}: {
  /** Placement id: unique per surface, low cardinality. */
  id?: string;
  /** `forest` for a full-width band, `quiet` for inside an article. */
  tone?: "forest" | "quiet";
  className?: string;
}) {
  const ref = useModuleImpression<HTMLElement>(() => trackNewsletterOfferView({ placement: id }));

  const dark = tone === "forest";

  return (
    <section
      ref={ref}
      id={id}
      data-placement={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "scroll-mt-24 overflow-hidden rounded-sm",
        dark ? "bg-forest text-forest-foreground" : "border border-border bg-cream",
        className,
      )}
    >
      <div className={cn("p-8 lg:p-12", dark ? "" : "lg:p-8")}>
        <span className={cn("eyebrow", dark ? "text-accent" : "text-primary")}>
          Duck the Fundamentals
        </span>
        <h2
          id={`${id}-heading`}
          className="mt-3 max-w-xl font-display text-3xl leading-tight lg:text-[2.5rem]"
        >
          Cooking duck tonight? Don&apos;t guess.
        </h2>
        <p
          className={cn(
            "mt-4 max-w-lg text-sm leading-relaxed",
            dark ? "text-forest-foreground/80" : "text-muted-foreground",
          )}
        >
          Tell us what you&apos;re cooking and we&apos;ll build your temperature, timing,
          crispy-skin and serving game plan — then send it to you with {DUCK_DROP.name}, our short
          course on the fundamentals.
        </p>

        <ul
          className={cn(
            "mt-6 space-y-2 text-sm",
            dark ? "text-forest-foreground/80" : "text-foreground/85",
          )}
        >
          {BULLETS.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <Check
                aria-hidden="true"
                className={cn("mt-0.5 size-4 shrink-0", dark ? "text-accent" : "text-primary")}
              />
              {point}
            </li>
          ))}
        </ul>

        <a
          href={GAME_PLAN_PATH}
          onClick={() =>
            trackGamePlanInternalClick({
              placement: id,
              destinationPath: GAME_PLAN_PATH,
              // The CTA precedes any selection, so the id records the entry only.
              recommendationId: "not-bought-yet_unsure",
              resultType: "general",
            })
          }
          className={cn(
            "mt-7 inline-flex min-h-12 items-center gap-2 rounded-sm px-6 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            dark
              ? "bg-accent text-accent-foreground focus-visible:ring-accent"
              : "bg-primary text-primary-foreground focus-visible:ring-ring",
          )}
        >
          Build My Duck Game Plan
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </section>
  );
}
