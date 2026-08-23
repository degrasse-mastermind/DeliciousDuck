/**
 * Seasonal promotions — one typed source for every scheduled site-wide strip.
 *
 * Not a CMS: a small array of records, evaluated by a pure scheduler. Editing a
 * season means editing this file. The homepage announcement reads whichever
 * promotion is active for "now"; outside every window it renders nothing at all
 * (no wrapper, no blank strip, no layout shift).
 *
 * Timezone handling is deterministic: `startsAt` / `endsAt` are ISO 8601 strings
 * with an explicit UTC offset, compared as absolute instants. There is no
 * reliance on the visitor's local timezone, so the window opens and closes at
 * the same moment for everyone.
 */

import type { ConversionIntent } from "@/data/conversion-paths";
import { MODULE_PLACEMENTS } from "@/lib/impression-events";

export interface SeasonalPromotion {
  /** Stable identifier, for tests and future ordering. */
  id: string;
  /** Master switch. A disabled promotion never renders, in or out of window. */
  enabled: boolean;
  /** Inclusive ISO 8601 instant with explicit offset, e.g. `2026-10-01T00:00:00Z`. */
  startsAt: string;
  /** Exclusive ISO 8601 instant with explicit offset. */
  endsAt: string;
  /** Lower numbers win when several promotions are simultaneously active. */
  priority: number;
  /** Small-caps label above the message. */
  eyebrow: string;
  /** The headline the reader scans. */
  headline: string;
  /** One supporting line saying what they get. */
  supportingText: string;
  /** Visible CTA text. */
  ctaLabel: string;
  /** Accessible name for the single anchor: destination plus benefit. */
  ctaAccessibleName: string;
  /** Internal, same-origin path only — never an external or merchant URL. */
  destination: string;
  /** Stable analytics placement id, shared by click and impression events. */
  placement: string;
  intent: ConversionIntent;
}

/**
 * The active roster. The Thanksgiving strip keeps its approved copy, CTA,
 * destination, and `home_announcement_thanksgiving_hub` placement verbatim.
 */
export const SEASONAL_PROMOTIONS: readonly SeasonalPromotion[] = [
  {
    id: "thanksgiving-duck-dinner-2026",
    enabled: true,
    // Deliberately wide so the approved banner stays visible for review.
    startsAt: "2026-08-01T00:00:00Z",
    endsAt: "2026-12-01T05:00:00Z",
    priority: 1,
    eyebrow: "DUCK FOR THANKSGIVING? ABSOLUTELY.",
    headline: "Menu, timeline, bird count & printable checklist",
    supportingText: "Menu, timeline, bird count & printable checklist",
    ctaLabel: "Plan the feast",
    ctaAccessibleName: "Plan your Thanksgiving duck dinner",
    destination: "/learn/thanksgiving-duck-dinner",
    placement: MODULE_PLACEMENTS.seasonalBanner,
    intent: "technique_validation",
  },
];

/** True when a path is a safe internal destination for a promotion. */
export function isInternalDestination(path: string | undefined | null): boolean {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  return true;
}

/**
 * Rejects malformed records instead of rendering a broken strip: both instants
 * must parse, the window must be ordered, and the destination must be internal.
 */
export function isValidPromotion(promotion: SeasonalPromotion): boolean {
  const start = Date.parse(promotion.startsAt);
  const end = Date.parse(promotion.endsAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  if (end <= start) return false;
  if (!isInternalDestination(promotion.destination)) return false;
  if (!promotion.placement || !promotion.ctaLabel || !promotion.headline) return false;
  return true;
}

/** Window test, using absolute instants: `[startsAt, endsAt)`. */
export function isPromotionActive(promotion: SeasonalPromotion, now: Date = new Date()): boolean {
  if (!promotion.enabled) return false;
  if (!isValidPromotion(promotion)) return false;
  const at = now.getTime();
  return at >= Date.parse(promotion.startsAt) && at < Date.parse(promotion.endsAt);
}

/**
 * The one promotion to render right now, or `null`.
 * Ties break on `priority`, then on declaration order.
 */
export function activeSeasonalPromotion(
  now: Date = new Date(),
  roster: readonly SeasonalPromotion[] = SEASONAL_PROMOTIONS,
): SeasonalPromotion | null {
  const active = roster.filter((promotion) => isPromotionActive(promotion, now));
  if (!active.length) return null;
  return [...active].sort((a, b) => a.priority - b.priority)[0] ?? null;
}

/** Every promotion placement id, for the shared registry and tests. */
export function seasonalPromotionPlacementIds(): string[] {
  return SEASONAL_PROMOTIONS.map((promotion) => promotion.placement);
}
