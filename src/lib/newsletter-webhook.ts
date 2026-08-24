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
 * Delivery-outcome events. These never change subscriber status — they are
 * recorded so acquisition performance can be measured on provider facts
 * (attempted -> delivered) instead of on our own optimism about a 200 response.
 *
 * Engagement events (`opened`, `clicked`) are deliberately still ignored: they
 * are unreliable, privacy-noisy, and nothing in this app should act on them.
 */
export const RESEND_DELIVERY_EVENTS = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delivery_delayed",
} as const;

export type DeliveryEventType =
  (typeof RESEND_DELIVERY_EVENTS)[keyof typeof RESEND_DELIVERY_EVENTS];

export interface MappedDeliveryEvent {
  name: string;
  eventType: DeliveryEventType;
  email: string;
  occurredAt: string | null;
  /** Event name plus the send's own `type` tag, when present. No payload. */
  detail: string;
}

/** Reads our own `type` tag off a send, so plan/confirmation mail is separable. */
function sendTag(data: Record<string, unknown>): string | null {
  const tags = data["tags"];
  if (!Array.isArray(tags)) return null;
  for (const tag of tags) {
    if (
      tag &&
      typeof tag === "object" &&
      (tag as { name?: unknown }).name === "type" &&
      typeof (tag as { value?: unknown }).value === "string"
    ) {
      return (tag as { value: string }).value.slice(0, 40);
    }
  }
  return null;
}

/**
 * Maps a verified delivery-outcome payload. Returns null for anything that is
 * not one of the three delivery events, so nothing else can be logged as one.
 */
export function mapResendDeliveryEvent(payload: unknown): MappedDeliveryEvent | null {
  if (!payload || typeof payload !== "object") return null;
  const envelope = payload as ResendEnvelope;
  const name = typeof envelope.type === "string" ? envelope.type : "";
  const eventType = RESEND_DELIVERY_EVENTS[name as keyof typeof RESEND_DELIVERY_EVENTS];
  if (!eventType) return null;
  const data = (envelope.data ?? {}) as Record<string, unknown>;
  const email = firstEmail(data["to"]);
  if (!email) return null;
  const tag = sendTag(data);
  return {
    name,
    eventType,
    email,
    occurredAt: typeof envelope.created_at === "string" ? envelope.created_at : null,
    detail: (tag ? `${name}:${tag}` : name).slice(0, 120),
  };
}

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

  const email = name.startsWith("email.") ? firstEmail(data["to"]) : firstEmail(data["email"]);
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
  /**
   * Optional delivery-outcome log. Must be idempotent on
   * (provider, provider_event_id) exactly like `insertEvent`. Optional so a
   * store that only cares about suppression stays valid.
   */
  insertDeliveryEvent?(event: {
    providerEventId: string;
    eventType: DeliveryEventType;
    email: string;
    subscriberId: string | null;
    occurredAt: string | null;
    receivedAt: string;
    detail: string;
  }): Promise<"inserted" | "duplicate">;
  /**
   * Atomic conditional transition. MUST update the row only while its stored
   * status is one of `fromStatuses`, in a single statement — no read-then-write.
   * Returns "unchanged" when the guard did not match, which is the normal
   * result of a retry or a concurrent delivery, not an error.
   */
  applySuppression(input: {
    id: string;
    status: ProviderStatus;
    fromStatuses: SubscriberStatus[];
    eventName: string;
    at: string;
  }): Promise<"applied" | "unchanged">;
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
    | "delivery_logged"
    | "storage_error";
}

const REQUIRED_HEADERS = ["svix-id", "svix-timestamp", "svix-signature"] as const;

/**
 * The whole webhook decision path.
 *
 * Order matters and is load-bearing:
 * 1. the raw body is verified untouched, before any JSON parsing;
 * 2. the subscriber transition runs FIRST, as one atomic conditional update
 *    guarded on strictly-weaker statuses;
 * 3. only then is the verified event logged.
 *
 * The transition precedes the log deliberately. Logging first would create a
 * retry hole: if the log succeeded and the transition then failed, the
 * redelivery would match the unique event id, be treated as a replay, and
 * return 200 having never applied the suppression. With this order a failure
 * anywhere returns 500 with the event unlogged, so the redelivery re-runs the
 * whole path. Safety rests on the conditional update being idempotent, not on
 * the event log being a lock: re-running it against an already-transitioned row
 * simply does not match and reports "unchanged".
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
    if (!headers[required])
      return { status: 400, body: "bad request", internal: "missing_headers" };
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
  if (!mapped) {
    // Delivery outcomes are logged, never acted on: no status change, no
    // suppression, no effect on any send decision.
    const delivery = mapResendDeliveryEvent(payload);
    const log = input.store.insertDeliveryEvent;
    if (delivery && log) {
      try {
        const subscriber = await input.store.findSubscriber(delivery.email);
        await log.call(input.store, {
          providerEventId: headers["svix-id"]!,
          eventType: delivery.eventType,
          email: delivery.email,
          subscriberId: subscriber?.id ?? null,
          occurredAt: delivery.occurredAt,
          receivedAt: now(),
          detail: delivery.detail,
        });
        return { status: 200, body: "ok", internal: "delivery_logged" };
      } catch {
        // Retryable: a delivery log is worth a redelivery, never a lost event.
        return { status: 500, body: "error", internal: "storage_error" };
      }
    }
    return { status: 200, body: "ok", internal: "ignored_event" };
  }

  const receivedAt = now();
  const providerEventId = headers["svix-id"]!;

  try {
    const subscriber = await input.store.findSubscriber(mapped.email);

    // Transition first. `transition` records what actually happened to the row
    // so the response can distinguish an applied change from a guard refusal,
    // without either being an error.
    let transition: "applied" | "unchanged" = "unchanged";

    if (subscriber) {
      const target = nextStatus(subscriber.status, mapped.status);
      if (target) {
        // The stored status is re-checked inside the write itself. Our earlier
        // read is only a fast path; `fromStatuses` is the real guard, so a row
        // that moved to an equal/stronger status in between is left alone.
        transition = await input.store.applySuppression({
          id: subscriber.id,
          status: target,
          fromStatuses: weakerStatuses(target),
          eventName: mapped.name,
          at: receivedAt,
        });
      }
    }

    // Logged only after the row is known to be in a safe state. If this insert
    // throws we return 500 with nothing logged, and the redelivery re-runs the
    // idempotent update before logging again.
    const insert = await input.store.insertEvent({
      providerEventId,
      eventType: mapped.status,
      email: mapped.email,
      subscriberId: subscriber?.id ?? null,
      occurredAt: mapped.occurredAt,
      receivedAt,
      detail: mapped.detail,
    });

    // Replay/redelivery. The conditional update above already ran and refused,
    // so acknowledging here cannot leave a transition unapplied.
    if (insert === "duplicate") return { status: 200, body: "ok", internal: "replay" };

    // An event for an address we do not hold is still kept as evidence; we never
    // create a subscriber from provider input.
    if (!subscriber) return { status: 200, body: "ok", internal: "no_subscriber" };

    return transition === "applied"
      ? { status: 200, body: "ok", internal: "applied" }
      : { status: 200, body: "ok", internal: "no_transition" };
  } catch {
    // Retryable, and safe to retry: the transition is a guarded idempotent
    // update and the event id is unique.
    return { status: 500, body: "error", internal: "storage_error" };
  }
}
