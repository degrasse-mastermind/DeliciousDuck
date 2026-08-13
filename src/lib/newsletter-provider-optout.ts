/**
 * Pure request builder for the provider-side global unsubscribe.
 *
 * Kept separate from the `.server` module so the URL selection, encoding, and
 * body shape are testable without network, credentials, or Supabase.
 *
 * Verified against Resend's current Update Contact API: audiences are
 * deprecated, and a global unsubscribe is
 * `PATCH https://api.resend.com/contacts/{id-or-email}` with `{"unsubscribed":true}`.
 * The identifier may be either the contact id or the email address, so we
 * prefer the stored `resend_contact_id` when we have one and fall back to the
 * normalized email.
 */

export interface ProviderOptOutRequest {
  readonly url: string;
  readonly method: "PATCH";
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
}

export interface ProviderOptOutIdentity {
  /** Stored contact id from a prior sync, when we have one. */
  readonly contactId?: string | null;
  /** Normalized address; the documented fallback identifier. */
  readonly email: string;
}

/**
 * Chooses the path identifier. The contact id is preferred because it survives
 * an address change at the provider and keeps the email out of the URL.
 */
export function optOutIdentifier(identity: ProviderOptOutIdentity): string {
  const contactId = identity.contactId?.trim();
  return contactId ? contactId : identity.email.trim();
}

/**
 * Builds the exact HTTP request. `encodeURIComponent` matters for the email
 * fallback: `+` tags and any `/` would otherwise change the path.
 */
export function buildProviderOptOutRequest(
  identity: ProviderOptOutIdentity,
  apiKey: string,
): ProviderOptOutRequest {
  const identifier = optOutIdentifier(identity);
  return {
    url: `https://api.resend.com/contacts/${encodeURIComponent(identifier)}`,
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    // Only the field we intend to change; never resend consent-bearing fields.
    body: JSON.stringify({ unsubscribed: true }),
  };
}

export type ProviderOptOutOutcome = "synced" | "skipped" | "error";

type FetchLike = (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number }>;

/**
 * Best-effort provider opt-out. Never throws, never logs the address, and is
 * always called after the local suppression is already committed.
 */
export async function sendProviderOptOut(
  identity: ProviderOptOutIdentity,
  apiKey: string | undefined,
  fetchImpl: FetchLike,
): Promise<ProviderOptOutOutcome> {
  if (!apiKey) return "skipped";
  const request = buildProviderOptOutRequest(identity, apiKey);
  try {
    const response = await fetchImpl(request.url, {
      method: request.method,
      headers: { ...request.headers },
      body: request.body,
    });
    if (response.ok) return "synced";
    console.warn(`Provider opt-out sync incomplete: status ${response.status}`);
    return "error";
  } catch {
    console.warn("Provider opt-out sync incomplete: request failed");
    return "error";
  }
}
