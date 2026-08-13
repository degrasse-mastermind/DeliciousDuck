/**
 * Pure request builder + injectable fetch seam for provider contact creation.
 *
 * Verified against Resend's current Create Contact API: audiences are
 * deprecated, and a contact is created with
 * `POST https://api.resend.com/contacts`.
 *
 * Two hard rules encoded here:
 *  1. The body carries the minimum needed field — `email` only. We never send
 *     `unsubscribed: false`, because that would reactivate a contact the
 *     provider has already suppressed.
 *  2. An existing-contact conflict is an idempotent success. We never follow up
 *     with an update, and if the conflict body cannot safely give us an id we
 *     return `null` and leave the local record as it is.
 *
 * Nothing here logs or returns the address, the API key, or raw provider text.
 */

export interface ProviderContactRequest {
  readonly url: string;
  readonly method: "POST";
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
}

/** Builds the exact HTTP request used to create a contact. */
export function buildProviderContactRequest(
  email: string,
  apiKey: string,
): ProviderContactRequest {
  return {
    url: "https://api.resend.com/contacts",
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    // Email only. Deliberately no `unsubscribed` field in either direction.
    body: JSON.stringify({ email }),
  };
}

/** Extracts a contact id from a provider body, tolerating both shapes. */
export function parseProviderContactId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as { id?: unknown; data?: { id?: unknown } };
  const id = typeof record.id === "string" ? record.id : undefined;
  const nested = typeof record.data?.id === "string" ? record.data.id : undefined;
  const chosen = (id ?? nested ?? "").trim();
  return chosen ? chosen : null;
}

/**
 * Non-PII classification of a provider response. Used for logs and for the
 * caller's sync-status decision; the provider's raw text is never surfaced.
 */
export type ProviderContactOutcome =
  | { readonly status: "created"; readonly contactId: string | null }
  | { readonly status: "exists"; readonly contactId: string | null }
  | { readonly status: "error"; readonly reason: string };

export function classifyProviderContactStatus(httpStatus: number): "created" | "exists" | "error" {
  if (httpStatus === 409) return "exists";
  if (httpStatus >= 200 && httpStatus < 300) return "created";
  return "error";
}

/** Status-only reason code. Never includes email or provider body text. */
export function providerFailureReason(httpStatus: number): string {
  if (httpStatus === 401 || httpStatus === 403) return "provider_unauthorized";
  if (httpStatus === 422) return "provider_rejected_request";
  if (httpStatus === 429) return "provider_rate_limited";
  if (httpStatus >= 500) return "provider_unavailable";
  return `provider_status_${httpStatus}`;
}

type FetchLike = (
  url: string,
  init: RequestInit,
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

/**
 * Creates (or idempotently accepts) the provider contact.
 *
 * Returns `null` for the contact id when the response cannot safely provide
 * one — callers keep the local row and can resync later. Throws only on a
 * genuine provider failure, with a status-classified message.
 */
export async function createProviderContact(
  email: string,
  apiKey: string,
  fetchImpl: FetchLike,
): Promise<ProviderContactOutcome> {
  const request = buildProviderContactRequest(email, apiKey);
  const response = await fetchImpl(request.url, {
    method: request.method,
    headers: { ...request.headers },
    body: request.body,
  });

  const classification = classifyProviderContactStatus(response.status);
  if (classification === "error") {
    return { status: "error", reason: providerFailureReason(response.status) };
  }

  let contactId: string | null = null;
  try {
    contactId = parseProviderContactId(await response.json());
  } catch {
    contactId = null;
  }

  return classification === "exists"
    ? { status: "exists", contactId }
    : { status: "created", contactId };
}
