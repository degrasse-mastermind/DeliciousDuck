/**
 * Subscriber status model and suppression-safe signup decisions.
 *
 * Pure functions only — no database, no provider, no secrets — so the rules can
 * be unit-tested directly and reused by a future (authenticated) provider
 * webhook without duplicating logic.
 *
 * Statuses are limited to states this app can actually verify from its own data
 * or from a verified provider event. We never invent provider state.
 */

export const SUBSCRIBER_STATUSES = [
  "subscribed",
  "unsubscribed",
  "bounced",
  "complained",
  "suppressed",
] as const;

export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];

/**
 * States that must never be reactivated by a website form submission. Coming
 * back from any of these requires a deliberate, verified action (a signed
 * provider event, or an explicit opt-in we can prove) — never a duplicate
 * signup, which anyone could perform on someone else's address.
 */
export const SUPPRESSED_STATUSES = [
  "unsubscribed",
  "bounced",
  "complained",
  "suppressed",
] as const satisfies readonly SubscriberStatus[];

export type SuppressedStatus = (typeof SUPPRESSED_STATUSES)[number];

export type ConsentRecord = "explicit" | "unknown_legacy";

export function isSubscriberStatus(value: unknown): value is SubscriberStatus {
  return typeof value === "string" && (SUBSCRIBER_STATUSES as readonly string[]).includes(value);
}

export function isSuppressed(status: unknown): boolean {
  return typeof status === "string" && (SUPPRESSED_STATUSES as readonly string[]).includes(status);
}

/** The minimal row shape the decision needs. */
export interface ExistingSubscriberState {
  status: string;
  consent_record?: string | null;
  welcome_event_status?: string | null;
}

export type SignupDecision =
  | { action: "create"; recordConsent: true; sendWelcome: true }
  | { action: "refresh"; recordConsent: true; sendWelcome: boolean }
  | { action: "blocked"; reason: "suppressed"; status: SubscriberStatus | "unknown" };

/**
 * Decides what a form signup may do, given the current stored state.
 *
 * - no row              → create, record consent, welcome eligible
 * - status "subscribed" → refresh attribution + consent, welcome only if never sent
 * - suppressed states   → blocked: nothing is written, nothing is sent
 *
 * An unknown/unexpected status is treated as blocked (fail closed).
 */
export function decideSignup(existing: ExistingSubscriberState | null): SignupDecision {
  if (!existing) return { action: "create", recordConsent: true, sendWelcome: true };

  if (existing.status === "subscribed") {
    return {
      action: "refresh",
      recordConsent: true,
      sendWelcome: existing.welcome_event_status !== "sent",
    };
  }

  return {
    action: "blocked",
    reason: "suppressed",
    status: isSubscriberStatus(existing.status) ? existing.status : "unknown",
  };
}

/**
 * What a signup may do at the email provider.
 *
 * Only a genuinely new local row may touch Resend. Every submission against an
 * existing row — active duplicate or legacy active duplicate — performs zero
 * provider calls: no contact upsert, no segment write, no custom event.
 *
 * Why: our local `status` can be stale, because no authenticated provider
 * webhook exists yet, so Resend-side unsubscribes are not reflected here. The
 * contact upsert sends `unsubscribed: false`, which would silently re-enable a
 * contact the subscriber had already opted out of at the provider. A duplicate
 * website form submission is not evidence strong enough to change provider
 * contact state, so it changes nothing there.
 */
export interface ProviderPlan {
  syncContact: boolean;
  syncSegment: boolean;
  sendWelcome: boolean;
}

export function providerPlan(decision: SignupDecision): ProviderPlan {
  if (decision.action === "create") {
    return { syncContact: true, syncSegment: true, sendWelcome: true };
  }
  // refresh (active/legacy duplicate) and blocked (suppressed) are both
  // provider no-ops. Blocked additionally writes nothing locally.
  return { syncContact: false, syncSegment: false, sendWelcome: false };
}

/**
 * Status a verified provider event maps to. Used by the future authenticated
 * webhook; no unauthenticated endpoint calls this in the current build.
 */
export const PROVIDER_EVENT_STATUS: Record<string, SuppressedStatus | null> = {
  unsubscribed: "unsubscribed",
  bounced: "bounced",
  complained: "complained",
  suppressed: "suppressed",
  delivered: null,
};

