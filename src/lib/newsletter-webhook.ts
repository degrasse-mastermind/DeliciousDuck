/**
 * Pure, dependency-free Resend webhook rules.
 *
 * Nothing here touches crypto, the network, the database, or secrets. Signature
 * verification and storage are injected, so the whole decision path — header
 * requirements, event mapping, replay idempotency and monotonic suppression —
 * is unit-testable with deterministic fixtures and no real webhook secret.
 */

import { isSubscriberStatus, type SubscriberStatus } from "./newsletter-status";

/** Statuses a verified provider event is allowed to set. */
export type ProviderStatus = Exclude<SubscriberStatus, "subscribed">;

/**
 * Official Resend webhook event names we act on, mapped to local status.
 *
 * Everything else — `email.sent`, `email.delivered`, `email.delivery_delayed`,
 * `email.opened`, `email.clicked`, `contact.created`, `contact.deleted`,
 * `domain.*` — is acknowledged and ignored for subscriber status. We never
 * infer suppression from engagement signals.
 */
export const RESEND_EVENT_STATUS = {
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.suppressed": "suppressed",
  "suppression.created": "suppressed",
  "suppression.added": "suppressed",
} as const satisfies Record<string, ProviderStatus>;

export type ResendEventName = keyof typeof RESEND_EVENT_STATUS;

/**
 * Severity ladder. A verified event may only move a subscriber UP this ladder.
 *
 * Consequences, deliberately: no webhook input can ever return an address to
 * `subscribed`, and a weaker signal (an unsubscribe) can never overwrite a
 * stronger one (a hard bounce or a spam complaint).
 */
const SEVERITY: Record<SubscriberStatus, number> = {
  subscribed: 0,
  unsubscribed: 1,
  suppressed: 2,
  bounced: 3,
  complained: 4,
};

export function statusSeverity(status: string): number {
  return isSubscriberStatus(status) ? SEVERITY[status] : SEVERITY.suppressed;
}

/**
 * Monotonic transition. Returns the status to write, or null to write nothing.
 */
export function nextStatus(current: string, incoming: ProviderStatus): ProviderStatus | null {
  return statusSeverity(incoming) > statusSeverity(current) ? incoming : null;
}

/**
 * Every status strictly weaker than `target`.
 *
 * This is the guard set for the conditional subscriber UPDATE: the write may
 * only match a row still sitting on one of these, so an equal or stronger
 * stored status is never overwritten — including when two deliveries race, or
 * when the row changed between our lookup and our write.
 */
export function weakerStatuses(target: ProviderStatus): SubscriberStatus[] {
  const ceiling = SEVERITY[target];
  return (Object.keys(SEVERITY) as SubscriberStatus[]).filter((s) => SEVERITY[s] < ceiling);
}


/** Conservative RFC-ish shape check; we never construct an address ourselves. */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length < 5 || trimmed.length > 255) return null;
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(trimmed)) return null;
  return trimmed;
}

/** First plausible address from an official payload field. Never a guess. */
function firstEmail(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const email = normalizeEmail(entry);
      if (email) return email;
    }
    return null;
  }
  return normalizeEmail(value);
}

export interface MappedEvent {
  name: string;
  status: ProviderStatus;
  email: string;
  occurredAt: string | null;
  /** Short, non-sensitive classification only. Never the raw payload. */
  detail: string;
}

interface ResendEnvelope {
  type?: unknown;
  created_at?: unknown;
  data?: Record<string, unknown> | null;
}

/**
 * Maps a verified Resend payload onto our rules.
 *
 * Recipient extraction is defensive and field-specific:
 * - `email.*` events carry `data.to` (string or array).
 * - `suppression.*` / `contact.*` events carry `data.email`.
 * We never fall back to unrelated fields, so a payload we do not recognise
 * yields `null` instead of a wrong address being suppressed.
 */
export function mapResendEvent(payload: unknown): MappedEvent | null {
  if (!payload || typeof payload !== "object") return null;
  const envelope = payload as ResendEnvelope;
  const name = typeof envelope.type === "string" ? envelope.type : "";
  const data = (envelope.data ?? {}) as Record<string, unknown>;
  const occurredAt = typeof envelope.created_at === "string" ? envelope.created_at : null;

  let status: ProviderStatus | null = RESEND_EVENT_STATUS[name as ResendEventName] ?? null;
  let detail = name;

  // Explicit provider unsubscribe signal only. `contact.updated` fires for any
  // field change, so the unsubscribed flag must be literally true.
  if (!status && name === "contact.updated" && data["unsubscribed"] === true) {
    status = "unsubscribed";
    detail = "contact.updated:unsubscribed";
  }

  if (!status) return null;

  const email = name.startsWith("email.")
    ? firstEmail(data["to"])
    : firstEmail(data["email"]);
  if (!email) return null;

  return { name, status, email, occurredAt, detail: detail.slice(0, 120) };
}

/** Storage seam. Implemented for real by the server module, faked in tests. */
export interface WebhookStore {
  /** Must be idempotent on (provider, provider_event_id). */
  insertEvent(event: {
    providerEventId: string;
    eventType: ProviderStatus;
    email: string;
    subscriberId: string | null;
    occurredAt: string | null;
    receivedAt: string;
    detail: string;
  }): Promise<"inserted" | "duplicate">;
  findSubscriber(email: string): Promise<{ id: string; status: string } | null>;
  applySuppression(input: {
    id: string;
    status: ProviderStatus;
    eventName: string;
    at: string;
  }): Promise<void>;
}

/** Verification seam. Throws on any invalid signature. */
export type WebhookVerifier = (raw: string, headers: Record<string, string>) => Promise<unknown>;

export interface WebhookOutcome {
  /** HTTP status the route should return. */
  status: number;
  /** Generic, non-revealing body text. */
  body: string;
  /** Internal only, for tests and internal logging. Never sent to the caller. */
  internal:
    | "no_secret"
    | "missing_headers"
    | "invalid_signature"
    | "ignored_event"
    | "no_subscriber"
    | "replay"
    | "applied"
    | "no_transition"
    | "storage_error";
}

const REQUIRED_HEADERS = ["svix-id", "svix-timestamp", "svix-signature"] as const;

/**
 * The whole webhook decision path.
 *
 * Order matters and is load-bearing: the raw body is verified untouched before
 * any JSON parsing; the verified event is logged before any subscriber write;
 * and a duplicate delivery stops at the log, so a replay can never produce a
 * second status transition.
 */
export async function handleResendWebhook(input: {
  raw: string;
  headers: Record<string, string>;
  hasSecret: boolean;
  verify: WebhookVerifier;
  store: WebhookStore;
  now?: () => string;
}): Promise<WebhookOutcome> {
  const now = input.now ?? (() => new Date().toISOString());

  // Fail closed: no configured secret means we cannot verify anything, so we
  // refuse rather than trust the body.
  // 503, not 500: the endpoint is simply not configured yet. It is a deliberate
  // fail-closed refusal, not an application fault, and Svix retries 503 too.
  if (!input.hasSecret) return { status: 503, body: "unavailable", internal: "no_secret" };


  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(input.headers)) headers[key.toLowerCase()] = value;
  for (const required of REQUIRED_HEADERS) {
    if (!headers[required]) return { status: 400, body: "bad request", internal: "missing_headers" };
  }

  let payload: unknown;
  try {
    payload = await input.verify(input.raw, headers);
  } catch {
    // No data is mutated on an unverified body, and nothing about the payload
    // is echoed back or logged.
    return { status: 401, body: "unauthorized", internal: "invalid_signature" };
  }

  const mapped = mapResendEvent(payload);
  if (!mapped) return { status: 200, body: "ok", internal: "ignored_event" };

  const receivedAt = now();
  const providerEventId = headers["svix-id"]!;

  try {
    const subscriber = await input.store.findSubscriber(mapped.email);

    const insert = await input.store.insertEvent({
      providerEventId,
      eventType: mapped.status,
      email: mapped.email,
      subscriberId: subscriber?.id ?? null,
      occurredAt: mapped.occurredAt,
      receivedAt,
      detail: mapped.detail,
    });

    // Replay/redelivery: the event log already holds this delivery, so the
    // status transition must not run a second time.
    if (insert === "duplicate") return { status: 200, body: "ok", internal: "replay" };

    // An event for an address we do not hold is still kept as evidence; we never
    // create a subscriber from provider input.
    if (!subscriber) return { status: 200, body: "ok", internal: "no_subscriber" };

    const target = nextStatus(subscriber.status, mapped.status);
    if (!target) return { status: 200, body: "ok", internal: "no_transition" };

    await input.store.applySuppression({
      id: subscriber.id,
      status: target,
      eventName: mapped.name,
      at: receivedAt,
    });
    return { status: 200, body: "ok", internal: "applied" };
  } catch {
    // Retryable: Resend redelivers, and the unique event id keeps that safe.
    return { status: 500, body: "error", internal: "storage_error" };
  }
}
