import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { HOME_ANNOUNCEMENT, type HomeAnnouncement } from "@/data/homepage-announcement";
import { SKETCH } from "@/lib/sketch-art";
import { trackConversionPathClick } from "@/lib/analytics";

/**
 * HomeAnnouncement — the seasonal editorial strip between the global header and
 * the homepage hero. Homepage only, never sticky, never dismissible.
 *
 * One semantic anchor (the CTA), no nested interactive elements, and the
 * illustration is purely decorative so it adds no screen-reader content. Clicks
 * reuse the shared `internal_conversion_click` helper with the stable placement
 * id from `@/data/homepage-announcement`; nothing fires on render.
 */
export function HomeAnnouncement({
  announcement = HOME_ANNOUNCEMENT,
}: {
  announcement?: HomeAnnouncement;
}) {
  const art = SKETCH[announcement.art];

  return (
    <aside
      data-home-announcement
      data-print-hide
      className="paper-grain border-b border-accent/30 bg-forest-deep"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <img
            src={art.src}
            alt=""
            aria-hidden="true"
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            className="hidden size-14 shrink-0 rounded-sm object-cover object-center ring-1 ring-forest-foreground/20 sm:block"
          />
          <p className="min-w-0">
            <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cranberry">
              {announcement.eyebrow}
            </span>
            <span className="mt-1 block font-display text-lg leading-snug text-forest-foreground">
              {announcement.message}
            </span>
          </p>
        </div>

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
  );
}
