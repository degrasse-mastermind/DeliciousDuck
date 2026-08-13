/**
 * Single source of truth for newsletter consent language and versioning.
 *
 * The UI renders `NEWSLETTER_CONSENT.text` verbatim next to every submission
 * control, and the browser sends `NEWSLETTER_CONSENT.version` with the signup.
 * The server rejects any version it does not recognise and stores the version it
 * accepted, so the wording a subscriber actually saw and the evidence we keep
 * can never silently diverge.
 *
 * Changing the wording REQUIRES bumping `version` (and adding the old id to
 * `KNOWN_CONSENT_VERSIONS` so historical rows stay interpretable). Never edit
 * the text of an already-shipped version in place.
 *
 * Client-safe: no secrets, no server-only imports.
 */

export const NEWSLETTER_CONSENT = {
  /** Stable identifier stored on every consented row. Bump on any text change. */
  version: "2026-08-13.v1",
  /** Rendered verbatim beside the submit button. */
  text:
    "By subscribing you agree to receive DeliciousDuck emails: Duck Fundamentals: The Field " +
    "Guide (printable 16-page PDF), a six-part welcome series over about two weeks, and " +
    "occasional cooking guides, recipes, and buying guidance. We store your email address and " +
    "the page you signed up from so the emails match what you were reading. Sent from " +
    "hello@deliciousduck.com via Resend. You can unsubscribe from any email. See our privacy " +
    "policy for how we handle your data.",
  /** Stable version of the policy in force when this consent text shipped. */
  privacyPolicyVersion: "2026-08-13",
  privacyPolicyPath: "/privacy",
} as const;

export type NewsletterConsentVersion = typeof NEWSLETTER_CONSENT.version;

/**
 * Every consent version this build can accept. Only the current version may be
 * submitted; older ids exist so stored evidence remains interpretable.
 */
export const KNOWN_CONSENT_VERSIONS = [NEWSLETTER_CONSENT.version] as const;

/** Absolute, stable reference stored alongside the consent record. */
export function privacyPolicyUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}${NEWSLETTER_CONSENT.privacyPolicyPath}`;
}

/** True only for the consent version this build actually renders. */
export function isCurrentConsentVersion(value: unknown): boolean {
  return value === NEWSLETTER_CONSENT.version;
}
