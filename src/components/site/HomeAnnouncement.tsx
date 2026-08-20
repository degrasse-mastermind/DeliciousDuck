import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { announcementFromPromotion } from "@/data/homepage-announcement";
import { activeSeasonalPromotion } from "@/data/seasonal-promotions";
import { trackConversionPathClick } from "@/lib/analytics";
import { ModuleImpression } from "@/components/site/ModuleImpression";

/**
 * HomeAnnouncement — the seasonal editorial strip between the global header and
 * the homepage hero. Homepage only, in normal document flow, with no close
 * control: it is a deliberate seasonal feature.
 *
 * Scheduling is not decided here. The component asks
 * `activeSeasonalPromotion()` for whichever promotion is in window and renders
 * nothing at all when none is — no wrapper, no empty strip, no layout shift.
 *
 * One semantic anchor (the CTA) and no nested interactive elements. Clicks reuse
 * the shared `internal_conversion_click` helper with the promotion's stable
 * placement id; the impression wrapper emits at most one
 * `conversion_module_view` per session for the same placement, and never
 * reclassifies or replaces the click.
 */
export function HomeAnnouncement({
  promotion = activeSeasonalPromotion(),
}: {
  promotion?: ReturnType<typeof activeSeasonalPromotion>;
}) {
  if (!promotion) return null;
  const announcement = announcementFromPromotion(promotion);

  return (
    <ModuleImpression
      placement={announcement.placement}
      moduleType="seasonal_banner"
      destinationType="internal"
      intent={announcement.intent}
    >
      <aside
        data-home-announcement
        data-print-hide
        className="paper-grain border-b border-accent/30 bg-forest-deep"
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8 lg:px-8">
          <p className="min-w-0 sm:text-right">
            <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cranberry">
              {announcement.eyebrow}
            </span>
            <span className="mt-1 block font-display text-lg font-medium leading-snug text-forest-foreground lg:text-xl">
              {announcement.message}
            </span>
          </p>

          <Link
            to={announcement.to}
            aria-label={announcement.ctaAccessibleName}
            data-placement={announcement.placement}
            onClick={() =>
              trackConversionPathClick({
                destination: announcement.to,
                intent: announcement.intent,
                placement: announcement.placement,
              })
            }
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gold-foreground transition-colors hover:bg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream motion-reduce:transition-none"
          >
            {announcement.ctaLabel}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </aside>
    </ModuleImpression>
  );
}
