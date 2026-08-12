/**
 * Newsletter integration boundary.
 *
 * This module is the single seam between the signup UI and the email provider.
 * Nothing else in the app should know how subscription works.
 *
 * CURRENT STATE: connected to Resend. deliciousduck.com is verified there and
 * subscribers are written to the "DeliciousDuck Subscribers" audience/segment.
 * The Resend token lives only in the server secret `RESEND_API_KEY` and is read
 * inside the server function handler — never in client code or the bundle.
 *
 * If `RESEND_API_KEY` is missing on the server, the server function throws and
 * the UI shows an error instead of a fake success (fail closed).
 */

import { subscribeToNewsletterFn } from "./newsletter.functions";

export type NewsletterProvider = "resend" | "buttondown" | "supabase-only";

export interface NewsletterConfig {
  provider: NewsletterProvider | null;
  status: "not_configured" | "configured";
  /** What the list actually delivers, used in UI copy. */
  leadMagnet: string;
  /** Visible sender identity configured in Resend. */
  senderIdentity: string;
  /** Resend audience/segment that receives new contacts. */
  segmentId: string;
}

export const NEWSLETTER_CONFIG: NewsletterConfig = {
  provider: "resend",
  status: "configured",
  leadMagnet: "The Duck Cooking Starter Guide",
  senderIdentity: "DeliciousDuck <hello@deliciousduck.com>",
  segmentId: "0a4c8912-f401-400b-b230-2a993f0ec516",
};

export interface SubscribeInput {
  email: string;
  source?: string;
  placement?: string;
  /** Honeypot value; must be empty for a real submission. */
  trap?: string;
}

/** Rejects on any failure. The UI only shows success when this resolves. */
export const subscribeToNewsletter: ((input: SubscribeInput) => Promise<void>) | undefined = async (
  input,
) => {
  await subscribeToNewsletterFn({ data: input });
};

/** True only when a real delivery path exists. */
export function isNewsletterEnabled(): boolean {
  return NEWSLETTER_CONFIG.status === "configured" && typeof subscribeToNewsletter === "function";
}
