import {
  Ban,
  CalendarClock,
  Citrus,
  ClipboardCheck,
  Droplets,
  Feather,
  Flame,
  Grape,
  Drumstick,
  Network,
  ShoppingBasket,
  Thermometer,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Editorial section marks.
 *
 * Every major hub section gets its own line-art mark so the departments read as
 * distinct at a glance. One mark per section id — never reuse an id across two
 * sections on the same page.
 */
export const HUB_SECTION_MARKS = {
  // Cook
  "cook-breast": Flame,
  "cook-whole": Drumstick,
  "cook-fat": Droplets,
  "cook-wild": Feather,
  // Learn
  "learn-breast": Thermometer,
  "learn-whole": CalendarClock,
  "learn-fat": Droplets,
  "learn-wild": Feather,
  // Buy
  "buy-guides": ShoppingBasket,
  "buy-checks": ClipboardCheck,
  // Gear
  "gear-guides": Wrench,
  "gear-skip": Ban,
  // Ingredients
  "ingredients-seasoning-prep": Flame,
  "ingredients-fat-medium": Droplets,
  "ingredients-fruit-acid": Citrus,
  "ingredients-pairing-logic": Network,
  "ingredients-fruit": Grape,
} satisfies Record<string, LucideIcon>;

export type HubSectionMarkId = keyof typeof HUB_SECTION_MARKS;

/** Small framed mark that opens a hub section. Decorative only. */
export function HubSectionMark({ mark }: { mark: HubSectionMarkId }) {
  const Icon = HUB_SECTION_MARKS[mark];
  return (
    <span
      aria-hidden="true"
      className="mb-4 inline-flex size-11 items-center justify-center rounded-sm border border-gold/60 bg-cream text-primary"
    >
      <Icon className="size-5" strokeWidth={1.5} />
    </span>
  );
}
