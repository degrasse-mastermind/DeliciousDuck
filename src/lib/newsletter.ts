/**
 * Newsletter integration boundary.
 *
 * This module is the single seam between the signup UI and the backend.
 * Nothing else in the app should know how subscription works.
 *
 * CURRENT STATE: the project database is the durable source of truth for the
 * subscriber list; Resend is the downstream delivery provider (deliciousduck.com
 * is verified there, contacts land in "DeliciousDuck Subscribers"). A signup
 * succeeds once the row is stored. If `RESEND_API_KEY` is absent the row is
 * saved with sync status `pending` and can be resynced later — the visitor is
 * still a real subscriber. Storage failures still fail closed: no success state,
 * no conversion event. The Resend token exists only as a server secret.
 */

import { requestGamePlanEmailFn, subscribeToNewsletterFn } from "./newsletter.functions";
import { RESEND_AUDIENCE_ID } from "./newsletter-schema";

export type NewsletterProvider = "supabase+resend" | "resend" | "supabase-only";

export interface NewsletterConfig {
  provider: NewsletterProvider | null;
  status: "not_configured" | "configured";
  /** Durable record of the list. */
  sourceOfTruth: "database";
  /** What the list actually delivers, used in UI copy. */
  leadMagnet: string;
  /** Visible sender identity configured in Resend. */
  senderIdentity: string;
  /** Resend audience/segment that receives synced contacts. */
  segmentId: string;
}

export const NEWSLETTER_CONFIG: NewsletterConfig = {
  provider: "supabase+resend",
  status: "configured",
  sourceOfTruth: "database",
  leadMagnet: "Duck Fundamentals: The Field Guide (printable 16-page PDF)",
  senderIdentity: "DeliciousDuck <hello@deliciousduck.com>",
  segmentId: RESEND_AUDIENCE_ID,
};

export interface SubscribeInput {
  email: string;
  source?: string;
  placement?: string;
  /** Controlled interest enum from `@/data/newsletter-contexts`. */
  interest?: string;
  /** Path the signup happened on. No query string, no PII. */
  sourcePath?: string;
  /** Consent text version the visitor was shown. Required by the server. */
  consentVersion?: string;
  /**
   * Optional Duck Game Plan acquisition metadata. Finite enum members only —
   * what the visitor is cooking, never anything about who they are.
   */
  acquisitionSource?: "duck_game_plan";
  cut?: string;
  method?: string;
  concern?: string;
  partySizeBucket?: string;
  /** Honeypot value; must be empty for a real submission. */
  trap?: string;
}


/**
 * The only thing the browser learns from a signup.
 *
 * Deliberately one field. Welcome/email state, the stored interest, whether the
 * address was already on the list, whether it is suppressed, and any preference
 * token are all withheld: each is a signal someone could use to test an
 * arbitrary address against our list. The Field Guide download works from a
 * static path and needs none of them.
 */
export interface SubscribeResult {
  subscribed: true;
}

/** Rejects on any failure. The UI only shows success when this resolves. */
export const subscribeToNewsletter:
  | ((input: SubscribeInput) => Promise<SubscribeResult>)
  | undefined = async (input) => {
  await subscribeToNewsletterFn({ data: input });
  return { subscribed: true };
};


export interface GamePlanEmailInput extends SubscribeInput {
  acquisitionSource: "duck_game_plan";
  cut: string;
  method: string;
  concern: string;
  partySizeBucket: string;
}

/**
 * Requests the Duck Game Plan email for this address.
 *
 * Separate from `subscribeToNewsletter` because the plan is a transactional
 * message that must arrive every time it is asked for, whereas the welcome email
 * is send-once. Resolves for every accepted submission — new address, existing
 * subscriber, suppressed address or cooldown all look identical here — and
 * rejects only on a genuine server failure, which is when the UI shows retry.
 */
export const requestGamePlanEmail = async (
  input: GamePlanEmailInput,
): Promise<SubscribeResult> => {
  await requestGamePlanEmailFn({ data: input });
  return { subscribed: true };
};

/** True only when a real delivery path exists. */
export function isNewsletterEnabled(): boolean {
  return NEWSLETTER_CONFIG.status === "configured" && typeof subscribeToNewsletter === "function";
}
