/**
 * Homepage seasonal announcement — compatibility view over the single typed
 * seasonal-promotion source in `@/data/seasonal-promotions`.
 *
 * The scheduling, copy, destination and placement now live there. This module
 * keeps the older `HomeAnnouncement` shape (used by the component's props and
 * by the shared placement registry) so nothing downstream had to change when
 * the roster gained windows and priorities.
 */

import type { ConversionIntent } from "@/data/conversion-paths";
import {
  SEASONAL_PROMOTIONS,
  seasonalPromotionPlacementIds,
  type SeasonalPromotion,
} from "@/data/seasonal-promotions";

export interface HomeAnnouncement {
  /** Stable analytics placement id, shared with the conversion registry. */
  placement: string;
  /** Small caps label above the message. */
  eyebrow: string;
  /** One line saying what the reader gets. */
  message: string;
  /** Visible CTA text. */
  ctaLabel: string;
  /** Accessible name for the single anchor: destination plus benefit. */
  ctaAccessibleName: string;
  /** Internal route only. */
  to: string;
  intent: ConversionIntent;
}

/** Projects a scheduled promotion onto the announcement shape. */
export function announcementFromPromotion(promotion: SeasonalPromotion): HomeAnnouncement {
  return {
    placement: promotion.placement,
    eyebrow: promotion.eyebrow,
    message: promotion.headline,
    ctaLabel: promotion.ctaLabel,
    ctaAccessibleName: promotion.ctaAccessibleName,
    to: promotion.destination,
    intent: promotion.intent,
  };
}

/** The currently configured Thanksgiving strip, independent of its window. */
export const HOME_ANNOUNCEMENT: HomeAnnouncement = announcementFromPromotion(
  SEASONAL_PROMOTIONS[0] as SeasonalPromotion,
);

/** Every announcement placement id, for the shared registry and tests. */
export function homeAnnouncementPlacementIds(): string[] {
  return seasonalPromotionPlacementIds();
}
