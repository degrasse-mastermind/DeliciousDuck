import { describe, expect, it } from "vitest";
import {
  handleResendWebhook,
  mapResendEvent,
  nextStatus,
  normalizeEmail,
  type ProviderStatus,
  type WebhookStore,
} from "./newsletter-webhook";

/**
 * Deterministic fixtures only: crypto verification is injected, so these tests
 * exercise the real decision path with no webhook secret and no network.
 */

const HEADERS = {
  "svix-id": "msg_test_1",
  "svix-timestamp": "1755000000",
  "svix-signature": "v1,fake",
};

/**
 * Stateful fake store. It models the one property the real implementation
 * depends on: `applySuppression` is a guarded conditional write, so it mutates
 * the row only while the stored status is still in `fromStatuses`. That makes
 * retries and concurrent-delivery races observable without a database.
 */
function makeStore(
  subscriber: { id: string; status: string } | null,
  opts: {
    duplicate?: boolean;
    throwOnInsert?: boolean;
    throwOnUpdate?: boolean;
    /** Simulates another delivery winning the race after our lookup. */
    beforeUpdate?: (row: { id: string; status: string }) => void;
    /** Event ids already present in the log, for replay simulation. */
    seenEventIds?: Set<string>;
  } = {},
) {
  const row = subscriber ? { ...subscriber } : null;
  const events: { providerEventId: string }[] = [];
  const applied: unknown[] = [];
  const seen = opts.seenEventIds ?? new Set<string>();

  const store: WebhookStore = {
    async findSubscriber() {
      return row ? { ...row } : null;
    },
    async insertEvent(event) {
      if (opts.throwOnInsert) throw new Error("boom");
      if (opts.duplicate || seen.has(event.providerEventId)) return "duplicate";
      seen.add(event.providerEventId);
      events.push(event);
      return "inserted";
    },
    async applySuppression(input) {
      if (opts.throwOnUpdate) throw new Error("boom");
      if (row) opts.beforeUpdate?.(row);
      applied.push(input);
      // The guard is re-evaluated against the CURRENT row, as Postgres would.
      if (!row || !input.fromStatuses.includes(row.status as never)) return "unchanged";
      row.status = input.status;
      return "applied";
    },
  };
  return { store, events, applied, row, seen };
}


const okVerify = (payload: unknown) => async () => payload;
const failVerify = async () => {
  throw new Error("no match");
};

function bounce(to = "reader@example.com") {
  return { type: "email.bounced", created_at: "2026-08-13T03:00:00Z", data: { to: [to] } };
}

describe("event mapping", () => {
  it("maps bounce, complaint and suppression events", () => {
    expect(mapResendEvent(bounce())?.status).toBe("bounced");
    expect(
      mapResendEvent({ type: "email.complained", data: { to: "a@b.com" } })?.status,
    ).toBe("complained");
    expect(
      mapResendEvent({ type: "suppression.created", data: { email: "a@b.com" } })?.status,
    ).toBe("suppressed");
  });

  it("maps contact.updated only with an explicit unsubscribed=true signal", () => {
    expect(
      mapResendEvent({ type: "contact.updated", data: { email: "a@b.com", unsubscribed: true } })
        ?.status,
    ).toBe("unsubscribed");
    expect(
      mapResendEvent({ type: "contact.updated", data: { email: "a@b.com", unsubscribed: false } }),
    ).toBeNull();
    expect(mapResendEvent({ type: "contact.updated", data: { email: "a@b.com" } })).toBeNull();
  });

  it("ignores delivery and engagement events", () => {
    for (const type of ["email.sent", "email.delivered", "email.opened", "email.clicked"]) {
      expect(mapResendEvent({ type, data: { to: ["a@b.com"] } })).toBeNull();
    }
  });

  it("never guesses an address from unrelated fields", () => {
    expect(mapResendEvent({ type: "email.bounced", data: { from: "a@b.com" } })).toBeNull();
    expect(normalizeEmail("not-an-email")).toBeNull();
    expect(normalizeEmail(" READER@Example.COM ")).toBe("reader@example.com");
  });
});

describe("monotonic status rules", () => {
  it("upgrades severity only", () => {
    expect(nextStatus("subscribed", "unsubscribed")).toBe("unsubscribed");
    expect(nextStatus("unsubscribed", "bounced")).toBe("bounced");
    expect(nextStatus("bounced", "complained")).toBe("complained");
  });

  it("never downgrades or reactivates", () => {
    const weaker: ProviderStatus[] = ["unsubscribed", "suppressed", "bounced"];
    for (const status of weaker) expect(nextStatus("complained", status)).toBeNull();
    expect(nextStatus("bounced", "unsubscribed")).toBeNull();
    expect(nextStatus("unsubscribed", "unsubscribed")).toBeNull();
  });
});

describe("webhook handler", () => {
  it("fails closed with no configured secret and mutates nothing", async () => {
    const { store, events, applied } = makeStore({ id: "1", status: "subscribed" });
    const out = await handleResendWebhook({
      raw: JSON.stringify(bounce()),
      headers: HEADERS,
      hasSecret: false,
      verify: okVerify(bounce()),
      store,
    });
    expect(out.internal).toBe("no_secret");
    expect(out.status).toBe(503);

    expect(events).toHaveLength(0);
    expect(applied).toHaveLength(0);
  });

  it("rejects missing svix headers", async () => {
    const { store, events } = makeStore({ id: "1", status: "subscribed" });
    const out = await handleResendWebhook({
      raw: "{}",
      headers: { "svix-id": "a", "svix-timestamp": "1" },
      hasSecret: true,
      verify: okVerify(bounce()),
      store,
    });
    expect(out.internal).toBe("missing_headers");
    expect(out.status).toBe(400);
    expect(events).toHaveLength(0);
  });

  it("rejects an invalid signature without mutating data", async () => {
    const { store, events, applied } = makeStore({ id: "1", status: "subscribed" });
    const out = await handleResendWebhook({
      raw: JSON.stringify(bounce()),
      headers: HEADERS,
      hasSecret: true,
      verify: failVerify,
      store,
    });
    expect(out.internal).toBe("invalid_signature");
    expect(out.status).toBe(401);
    expect(events).toHaveLength(0);
    expect(applied).toHaveLength(0);
  });

  it("applies a verified bounce: guarded suppression, then the event log", async () => {
    const { store, events, applied } = makeStore({ id: "sub-1", status: "subscribed" });
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify(bounce()),
      store,
      now: () => "2026-08-13T03:05:00.000Z",
    });
    expect(out.internal).toBe("applied");
    expect(events[0]).toMatchObject({
      providerEventId: "msg_test_1",
      eventType: "bounced",
      email: "reader@example.com",
      subscriberId: "sub-1",
      detail: "email.bounced",
    });
    expect(applied[0]).toMatchObject({ id: "sub-1", status: "bounced" });
  });

  it("applies a verified complaint", async () => {
    const { store, applied } = makeStore({ id: "sub-1", status: "subscribed" });
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify({ type: "email.complained", data: { to: "reader@example.com" } }),
      store,
    });
    expect(out.internal).toBe("applied");
    expect(applied[0]).toMatchObject({ status: "complained" });
  });

  it("applies a verified provider suppression", async () => {
    const { store, applied } = makeStore({ id: "sub-1", status: "subscribed" });
    await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify({ type: "suppression.added", data: { email: "reader@example.com" } }),
      store,
    });
    expect(applied[0]).toMatchObject({ status: "suppressed" });
  });

  it("applies an explicit provider contact unsubscribe", async () => {
    const { store, applied } = makeStore({ id: "sub-1", status: "subscribed" });
    await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify({
        type: "contact.updated",
        data: { email: "reader@example.com", unsubscribed: true },
      }),
      store,
    });
    expect(applied[0]).toMatchObject({ status: "unsubscribed" });
  });

  it("treats a replay as success with no second transition", async () => {
    const { store, applied } = makeStore({ id: "sub-1", status: "subscribed" }, { duplicate: true });
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify(bounce()),
      store,
    });
    expect(out.internal).toBe("replay");
    expect(out.status).toBe(200);
    expect(applied).toHaveLength(0);
  });

  it("acknowledges an unknown event type without touching the subscriber", async () => {
    const { store, events, applied } = makeStore({ id: "sub-1", status: "subscribed" });
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify({ type: "domain.created", data: { name: "example.com" } }),
      store,
    });
    expect(out.internal).toBe("ignored_event");
    expect(out.status).toBe(200);
    expect(events).toHaveLength(0);
    expect(applied).toHaveLength(0);
  });

  it("stores the event but creates nothing when no subscriber matches", async () => {
    const { store, events, applied } = makeStore(null);
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify(bounce("stranger@example.com")),
      store,
    });
    expect(out.internal).toBe("no_subscriber");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ subscriberId: null });
    expect(applied).toHaveLength(0);
  });

  it("never reactivates: a weaker verified event leaves a stronger state alone", async () => {
    const { store, applied } = makeStore({ id: "sub-1", status: "complained" });
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify({
        type: "contact.updated",
        data: { email: "reader@example.com", unsubscribed: true },
      }),
      store,
    });
    expect(out.internal).toBe("no_transition");
    expect(applied).toHaveLength(0);
  });

  it("returns a retryable generic error when the event log fails", async () => {
    const { store } = makeStore({ id: "sub-1", status: "subscribed" }, { throwOnInsert: true });
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify(bounce()),
      store,
    });
    expect(out.internal).toBe("storage_error");
    expect(out.status).toBe(500);
    expect(out.body).toBe("error");
  });
});

/**
 * The retry hole this ordering exists to close: with the event logged first, a
 * failure in between left a logged-but-unapplied suppression that every
 * redelivery then dismissed as a replay.
 */
describe("crash-safety between the transition and the event log", () => {
  it("persists the event on retry after an event-log failure, with no unsafe second mutation", async () => {
    const seen = new Set<string>();
    const row = { id: "sub-1", status: "subscribed" };

    // Delivery 1: the guarded update lands, then the log write fails.
    const first = makeStore(row, { throwOnInsert: true, seenEventIds: seen });
    const out1 = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify(bounce()),
      store: first.store,
    });
    expect(out1.status).toBe(500);
    expect(first.applied).toHaveLength(1);
    expect(first.row?.status).toBe("bounced"); // suppression really is in effect
    expect(seen.size).toBe(0); // nothing logged, so nothing can look like a replay

    // Delivery 2 (Resend retry): same event id, row already suppressed.
    const second = makeStore(first.row!, { seenEventIds: seen });
    const out2 = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify(bounce()),
      store: second.store,
    });
    expect(out2.status).toBe(200);
    expect(out2.internal).toBe("no_transition"); // guard refused; no double write
    expect(second.row?.status).toBe("bounced"); // unchanged, not downgraded
    expect(second.events).toHaveLength(1); // the event is finally persisted
    expect(seen.has("msg_test_1")).toBe(true);
  });

  it("logs no event and returns 500 when the subscriber update fails", async () => {
    const { store, events, applied, row } = makeStore(
      { id: "sub-1", status: "subscribed" },
      { throwOnUpdate: true },
    );
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify(bounce()),
      store,
    });
    expect(out.status).toBe(500);
    expect(out.internal).toBe("storage_error");
    expect(applied).toHaveLength(0);
    expect(events).toHaveLength(0); // no logged-but-unapplied event
    expect(row?.status).toBe("subscribed");
  });

  it("refuses a downgrade when the stored status changed after the lookup", async () => {
    // Our read saw `subscribed`; a concurrent complaint lands before our write.
    const { store, events, applied, row } = makeStore(
      { id: "sub-1", status: "subscribed" },
      { beforeUpdate: (r) => void (r.status = "complained") },
    );
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify({
        type: "contact.updated",
        data: { email: "reader@example.com", unsubscribed: true },
      }),
      store,
    });
    expect(out.status).toBe(200);
    expect(out.internal).toBe("no_transition");
    expect(applied).toHaveLength(1); // the write was attempted...
    expect(row?.status).toBe("complained"); // ...and the guard rejected it
    expect(events).toHaveLength(1); // still recorded as evidence
  });

  it("keeps a duplicate delivery at 200 with the row untouched", async () => {
    const seen = new Set(["msg_test_1"]);
    const { store, applied, row } = makeStore(
      { id: "sub-1", status: "bounced" },
      { seenEventIds: seen },
    );
    const out = await handleResendWebhook({
      raw: "raw",
      headers: HEADERS,
      hasSecret: true,
      verify: okVerify(bounce()),
      store,
    });
    expect(out.status).toBe(200);
    expect(out.internal).toBe("replay");
    expect(applied).toHaveLength(0); // equal status: no transition even attempted
    expect(row?.status).toBe("bounced");
  });
});

