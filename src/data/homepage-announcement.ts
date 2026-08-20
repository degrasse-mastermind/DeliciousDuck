/**
 * Homepage seasonal announcement — a single, swappable editorial strip that
 * sits between the global header and the homepage hero.
 *
 * Deliberately tiny: one record, one internal destination, one stable placement
 * id. Swapping the season means editing this object (or passing a different one
 * to the component), not building a campaign system.
 */

import type { ConversionIntent } from "@/data/conversion-paths";

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

export const HOME_ANNOUNCEMENT: HomeAnnouncement = {
  placement: "home_announcement_thanksgiving_hub",
  eyebrow: "DUCK FOR THANKSGIVING? ABSOLUTELY.",
  message: "Menu, timeline, bird count & printable checklist",
  ctaLabel: "Plan the feast",
  ctaAccessibleName: "Plan your Thanksgiving duck dinner",
  to: "/learn/thanksgiving-duck-dinner",
  intent: "technique_validation",
  art: "thanksgivingPlan",
};

/** Every announcement placement id, for the shared registry and tests. */
export function homeAnnouncementPlacementIds(): string[] {
  return [HOME_ANNOUNCEMENT.placement];
}
