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

import { subscribeToNewsletterFn } from "./newsletter.functions";
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
  /** Honeypot value; must be empty for a real submission. */
  trap?: string;
}

export interface SubscribeResult {
  /** True only when a welcome email was actually triggered for this address. */
  welcomeTriggered: boolean;
}

/** Rejects on any failure. The UI only shows success when this resolves. */
export const subscribeToNewsletter:
  | ((input: SubscribeInput) => Promise<SubscribeResult>)
  | undefined = async (input) => {
  const result = await subscribeToNewsletterFn({ data: input });
  return { welcomeTriggered: Boolean(result.welcomeTriggered) };
};

/** True only when a real delivery path exists. */
export function isNewsletterEnabled(): boolean {
  return NEWSLETTER_CONFIG.status === "configured" && typeof subscribeToNewsletter === "function";
}
