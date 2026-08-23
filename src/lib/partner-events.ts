/**
 * Pure event builder for the single B2B partnership event, `partner_inquiry_click`.
 *
 * Deliberately minimal: the only property is a stable `placement` label drawn
 * from a closed allowlist. No brand name, contact address, message content,
 * full URL, or query string can ever reach analytics through this path — the
 * builder takes no free-form parameter bag.
 */

export const PARTNER_EVENTS = {
  inquiryClick: "partner_inquiry_click",
} as const;

export type PartnerEventName = (typeof PARTNER_EVENTS)[keyof typeof PARTNER_EVENTS];

/** Every placement allowed to emit the event. Anything else is dropped. */
export const PARTNER_PLACEMENTS = ["partners_hero", "partners_offer", "partners_final"] as const;

export type PartnerPlacement = (typeof PARTNER_PLACEMENTS)[number];

export function isPartnerPlacement(value: unknown): value is PartnerPlacement {
  return typeof value === "string" && (PARTNER_PLACEMENTS as readonly string[]).includes(value);
}

/** The only parameter allowed on `partner_inquiry_click`. */
export const PARTNER_INQUIRY_CLICK_PARAMS = ["placement"] as const;

export interface PartnerInquiryClickEvent {
  name: typeof PARTNER_EVENTS.inquiryClick;
  params: { placement: PartnerPlacement };
}

/** Returns `null` for an unrecognised placement, so nothing untyped is sent. */
export function buildPartnerInquiryClickEvent(input: {
  placement: string;
}): PartnerInquiryClickEvent | null {
  if (!isPartnerPlacement(input.placement)) return null;
  return { name: PARTNER_EVENTS.inquiryClick, params: { placement: input.placement } };
}

/** Per-event PostHog allowlist, mirroring the GA4 parameter set exactly. */
export const PARTNER_PROPERTY_ALLOWLIST: Readonly<Record<string, readonly string[]>> = {
  [PARTNER_EVENTS.inquiryClick]: PARTNER_INQUIRY_CLICK_PARAMS,
};
