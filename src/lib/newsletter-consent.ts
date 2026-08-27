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
 * v2 compresses the wording to readable microcopy. Nothing about the actual
 * behaviour changed: the same emails are sent, the same fields are stored, and
 * the extended detail now lives in the privacy policy rather than beside every
 * form.
 *
 * Client-safe: no secrets, no server-only imports.
 */

export const NEWSLETTER_CONSENT = {
  /** Stable identifier stored on every consented row. Bump on any text change. */
  version: "2026-08-27.v3",
  /** Rendered verbatim beside the submit button. */
  text:
    "Get Duck the Fundamentals — the 28-page no-panic playbook — a 6-part starter series, and " +
    "occasional recipes and buying guidance. Unsubscribe anytime. Emails come from " +
    "hello@deliciousduck.com; we store your address and the page you signed up from.",
  /** Stable version of the policy in force when this consent text shipped. */
  privacyPolicyVersion: "2026-08-13",
  privacyPolicyPath: "/privacy",
} as const;

export type NewsletterConsentVersion = typeof NEWSLETTER_CONSENT.version;

/**
 * Every consent version this build can accept. Only the current version may be
 * submitted; older ids exist so stored evidence remains interpretable.
 */
export const KNOWN_CONSENT_VERSIONS = [
  NEWSLETTER_CONSENT.version,
  "2026-08-18.v2",
  "2026-08-13.v1",
] as const;

/** Absolute, stable reference stored alongside the consent record. */
export function privacyPolicyUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}${NEWSLETTER_CONSENT.privacyPolicyPath}`;
}

/** True only for the consent version this build actually renders. */
export function isCurrentConsentVersion(value: unknown): boolean {
  return value === NEWSLETTER_CONSENT.version;
}
