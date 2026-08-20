/**
 * Impression and newsletter-funnel events (measurement closure sprint).
 *
 * Everything here is pure and browser-independent apart from the session
 * dedupe store at the bottom, so the event contracts are unit-testable.
 *
 * Privacy contract, enforced by `buildImpressionEvent`:
 *  - every payload is filtered through a per-event property allowlist;
 *  - paths are normalized to path-only values (no query string, no hash);
 *  - `error_type` is a closed categorical enum — raw messages, response
 *    bodies, typed values, stack traces, and email addresses can never be
 *    represented in this module's types, let alone emitted.
 */

/** Stable event names. */
export const IMPRESSION_EVENTS = {
  newsletterOfferView: "newsletter_offer_view",
  newsletterFormStart: "newsletter_form_start",
  newsletterFormError: "newsletter_form_error",
  conversionModuleView: "conversion_module_view",
} as const;

export type ImpressionEventName =
  (typeof IMPRESSION_EVENTS)[keyof typeof IMPRESSION_EVENTS];

/** Closed categorical allowlist for newsletter form failures. */
export const NEWSLETTER_ERROR_TYPES = [
  "required",
  "invalid_format",
  "network",
  "server",
  "unknown",
] as const;
export type NewsletterErrorType = (typeof NEWSLETTER_ERROR_TYPES)[number];

/** Coarse module taxonomy for `conversion_module_view`. */
export const MODULE_TYPES = [
  "intent_selector",
  "newsletter_offer",
  "commerce_cards",
  "decision_fork",
  "recipe_equipment",
  "offer_group",
  "seasonal_banner",
] as const;
export type ModuleType = (typeof MODULE_TYPES)[number];

/** Where the module's primary calls send the reader. */
export const DESTINATION_TYPES = ["internal", "merchant", "onsite_form"] as const;
export type DestinationType = (typeof DESTINATION_TYPES)[number];

/** Strict per-event property allowlists. Nothing else is ever emitted. */
export const IMPRESSION_PROPERTY_ALLOWLIST: Readonly<
  Record<ImpressionEventName, readonly string[]>
> = {
  newsletter_offer_view: ["placement", "source_path", "content_type", "content_slug"],
  newsletter_form_start: ["placement", "source_path", "content_type", "content_slug"],
  newsletter_form_error: [
    "placement",
    "source_path",
    "content_type",
    "content_slug",
    "error_type",
  ],
  conversion_module_view: [
    "placement",
    "source_path",
    "content_type",
    "content_slug",
    "intent",
    "module_type",
    "destination_type",
  ],
};

/** Path-only normalization. Duplicated intentionally so this module is pure. */
export function normalizeEventPath(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const bare = (raw.split("#")[0] ?? "").split("?")[0] ?? "";
  if (!bare) return "/";
  return bare.startsWith("/") ? bare : `/${bare}`;
}

/** Coarse content type from the first path segment. */
export function contentTypeFromPath(raw: string | undefined | null): string | undefined {
  const path = normalizeEventPath(raw);
  if (!path) return undefined;
  if (path === "/") return "home";
  const first = path.split("/").filter(Boolean)[0];
  return first ?? "home";
}

/** Last path segment, `"home"` at the root. */
export function contentSlugFrom(raw: string | undefined | null): string | undefined {
  const path = normalizeEventPath(raw);
  if (!path) return undefined;
  const parts = path.split("/").filter(Boolean);
  return parts.length ? (parts[parts.length - 1] as string) : "home";
}

export interface ImpressionEventInput {
  placement: string;
  sourcePath?: string | undefined;
  intent?: string | undefined;
  moduleType?: ModuleType | undefined;
  destinationType?: DestinationType | undefined;
  errorType?: NewsletterErrorType | undefined;
}

export interface BuiltEvent {
  name: ImpressionEventName;
  params: Record<string, string>;
}

/**
 * Builds an allowlisted payload for one of the four events.
 * Unknown or empty values are dropped; unlisted keys cannot be produced.
 */
export function buildImpressionEvent(
  name: ImpressionEventName,
  input: ImpressionEventInput,
): BuiltEvent {
  const path = normalizeEventPath(input.sourcePath);
  const candidate: Record<string, string | undefined> = {
    placement: input.placement,
    source_path: path,
    content_type: contentTypeFromPath(path),
    content_slug: contentSlugFrom(path),
    intent: input.intent,
    module_type: input.moduleType,
    destination_type: input.destinationType,
    error_type:
      input.errorType && NEWSLETTER_ERROR_TYPES.includes(input.errorType)
        ? input.errorType
        : undefined,
  };

  const allowed = new Set(IMPRESSION_PROPERTY_ALLOWLIST[name]);
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (!allowed.has(key)) continue;
    if (typeof value !== "string" || value === "") continue;
    params[key] = value;
  }
  return { name, params };
}

/** Dedupe key: event + placement + normalized path. */
export function impressionDedupeKey(name: string, placement: string, path?: string): string {
  return `${name}|${placement}|${normalizeEventPath(path) ?? "/"}`;
}

/* ------------------------------------------------------------------ *
 * Session-scoped, once-only emission
 * ------------------------------------------------------------------ */

const SESSION_STORE_KEY = "dd_impressions_sent";
/** In-memory mirror: survives storage failures and covers SSR-free tests. */
const memorySent = new Set<string>();

function readSessionSet(): Set<string> {
  if (typeof window === "undefined") return memorySent;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORE_KEY);
    if (!raw) return memorySent;
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) for (const key of parsed) if (typeof key === "string") memorySent.add(key);
  } catch {
    /* storage unavailable — in-memory dedupe still applies */
  }
  return memorySent;
}

function persistSessionSet(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_STORE_KEY, JSON.stringify([...memorySent]));
  } catch {
    /* best-effort only */
  }
}

/**
 * True exactly once per key per browser session. Re-renders, hydration,
 * repeated IntersectionObserver callbacks, and route transitions back to the
 * same page therefore cannot inflate impression counts.
 */
export function markImpressionOnce(key: string): boolean {
  const sent = readSessionSet();
  if (sent.has(key)) return false;
  sent.add(key);
  persistSessionSet();
  return true;
}

/** Test-only reset of the dedupe state. */
export function resetImpressionDedupeForTests(): void {
  memorySent.clear();
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_STORE_KEY);
  } catch {
    /* nothing to clear */
  }
}

/* ------------------------------------------------------------------ *
 * Visibility rule
 * ------------------------------------------------------------------ */

/** Minimum visible fraction for a module that fits in the viewport. */
export const VISIBILITY_RATIO = 0.35;
/** Minimum visible pixels for a module taller than the viewport. */
export const VISIBILITY_MIN_PX = 180;

/**
 * "Meaningfully visible" rule, pure so it is testable without a browser:
 * either a third of the module is on screen, or — for modules taller than the
 * viewport, which can never reach that ratio — a substantial band of it is.
 */
export function isMeaningfullyVisible(input: {
  intersectionRatio: number;
  visibleHeight: number;
  elementHeight: number;
  viewportHeight: number;
}): boolean {
  if (input.elementHeight <= 0) return false;
  if (input.intersectionRatio >= VISIBILITY_RATIO) return true;
  const tallerThanViewport = input.elementHeight > input.viewportHeight;
  return tallerThanViewport && input.visibleHeight >= VISIBILITY_MIN_PX;
}

/* ------------------------------------------------------------------ *
 * Documented placement ids
 * ------------------------------------------------------------------ */

/**
 * Stable placement ids for the modules instrumented with
 * `conversion_module_view`. Click events keep their own existing placements.
 */
export const MODULE_PLACEMENTS = {
  homeIntentSelector: "home_intent_selector_module",
  homeNewsletterOffer: "home_field_guide_module",
  homeCommerceCards: "home_buying_and_gear_module",
  duckFatDecision: "duck_fat_decision_module",
  recipeEquipment: "recipe_equipment_module",
  guideOfferGroup: "commercial_offer_group_module",
  seasonalBanner: "home_announcement_thanksgiving_hub",
} as const;

export type ModulePlacement = (typeof MODULE_PLACEMENTS)[keyof typeof MODULE_PLACEMENTS];
