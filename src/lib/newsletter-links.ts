/**
 * Mailbox-token link helpers.
 *
 * These build the absolute URLs a future welcome/broadcast template will use.
 * The only identifier in the URL is the opaque `preference_token` — never an
 * email address, never a numeric id, never list state.
 *
 * Client-safe: no secrets, no server-only imports. Nothing here activates any
 * Resend template or automation.
 */

export const UNSUBSCRIBE_PATH = "/newsletter/unsubscribe";
export const PREFERENCES_PATH = "/newsletter/preferences";

/** Query key carrying the opaque token. Deliberately short and meaningless. */
export const TOKEN_PARAM = "t";

function base(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

export function unsubscribeUrl(baseUrl: string, token: string): string {
  return `${base(baseUrl)}${UNSUBSCRIBE_PATH}?${TOKEN_PARAM}=${encodeURIComponent(token)}`;
}

export function preferencesUrl(baseUrl: string, token: string): string {
  return `${base(baseUrl)}${PREFERENCES_PATH}?${TOKEN_PARAM}=${encodeURIComponent(token)}`;
}

/**
 * Both links for one subscriber, for use in an email template.
 * Not wired into any template in this sprint — see docs for activation steps.
 */
export function mailboxLinks(baseUrl: string, token: string) {
  return {
    unsubscribe: unsubscribeUrl(baseUrl, token),
    preferences: preferencesUrl(baseUrl, token),
  } as const;
}

/** Basic shape gate for an opaque token before it reaches the database. */
export function isPlausibleToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9-]{16,64}$/.test(value);
}
