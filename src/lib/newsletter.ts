/**
 * Newsletter integration boundary.
 *
 * This module is the single seam between the signup UI and whatever email
 * provider is eventually connected. Nothing else in the app should know how
 * subscription works.
 *
 * CURRENT STATE: no provider is connected, so `subscribeToNewsletter` is
 * undefined and the UI renders an honest "not open yet" panel. No address is
 * collected, stored, or transmitted anywhere.
 *
 * TO ACTIVATE (see docs/newsletter-setup.md for the full checklist):
 * 1. Enable Lovable Cloud so a `newsletter_subscribers` table and secrets exist.
 * 2. Add a server function (e.g. `src/lib/newsletter.functions.ts`) that
 *    validates the email with zod, inserts the row, and calls the provider API
 *    (Resend audiences, Buttondown, etc.) with a server-side API key.
 * 3. Import that server function here and assign it to `subscribeToNewsletter`.
 *    It MUST throw on failure — the UI only shows success and only fires the
 *    GA4 subscription conversion when this promise resolves.
 */

export type NewsletterProvider = "resend" | "buttondown" | "supabase-only";

export interface NewsletterConfig {
  /** Null until a real provider is wired up. */
  provider: NewsletterProvider | null;
  status: "not_configured" | "configured";
  /** What the list actually delivers, used in UI copy. */
  leadMagnet: string;
}

export const NEWSLETTER_CONFIG: NewsletterConfig = {
  provider: null,
  status: "not_configured",
  leadMagnet: "The Duck Cooking Starter Guide",
};

/**
 * Assign a real implementation to open the list. Must reject on failure.
 * Signature intentionally matches `NewsletterSignup`'s `onSubscribe` prop.
 */
export const subscribeToNewsletter: ((email: string) => Promise<void>) | undefined = undefined;

/** True only when a real delivery path exists. */
export function isNewsletterEnabled(): boolean {
  return NEWSLETTER_CONFIG.status === "configured" && typeof subscribeToNewsletter === "function";
}
