import { describe, expect, it, vi } from "vitest";

import {
  CONFIRMATION_COOLDOWN_MS,
  MAX_CONFIRMATION_SENDS,
  buildConfirmationEmailRequest,
  confirmUrl,
  decideConfirmToken,
  decideConfirmationSend,
  dispatchConfirmationEmail,
  isPlausibleConfirmationToken,
} from "../newsletter-confirmation";
import { runGamePlanDelivery } from "../game-plan-delivery";
import {
  handleResendWebhook,
  mapResendDeliveryEvent,
  mapResendEvent,
} from "../newsletter-webhook";

const TOKEN = "3f2a1b4c-5d6e-4f70-8a9b-0c1d2e3f4a5b";
const KEY = "re_test_key";

describe("confirmation token shape", () => {
  it("accepts a uuid and rejects everything else", () => {
    expect(isPlausibleConfirmationToken(TOKEN)).toBe(true);
    for (const bad of ["", "abc", TOKEN + "x", 42, null, undefined, `${TOKEN} or 1=1`]) {
      expect(isPlausibleConfirmationToken(bad)).toBe(false);
    }
  });

  it("puts the token in the query string and never an address", () => {
    const url = confirmUrl("https://deliciousduck.com/", TOKEN);
    expect(url).toBe(`https://deliciousduck.com/newsletter/confirm?c=${TOKEN}`);
    expect(url).not.toContain("@");
  });
});

describe("decideConfirmationSend", () => {
  const base = { token: TOKEN, apiKey: KEY, now: 1_000_000_000_000 } as const;

  it("sends for a pending address with a token and a key", () => {
    expect(decideConfirmationSend({ ...base, confirmationStatus: "pending" })).toEqual({
      send: true,
      token: TOKEN,
    });
  });

  it("never re-confirms an already confirmed address", () => {
    expect(decideConfirmationSend({ ...base, confirmationStatus: "confirmed" })).toEqual({
      send: false,
      reason: "already_confirmed",
    });
  });

  it("holds inside the cooldown window and sends after it", () => {
    const inside = decideConfirmationSend({
      ...base,
      confirmationStatus: "pending",
      lastSentAt: base.now - (CONFIRMATION_COOLDOWN_MS - 1),
    });
    expect(inside).toEqual({ send: false, reason: "cooldown" });

    const after = decideConfirmationSend({
      ...base,
      confirmationStatus: "pending",
      lastSentAt: base.now - (CONFIRMATION_COOLDOWN_MS + 1),
    });
    expect(after.send).toBe(true);
  });

  it("stops at the lifetime cap, so the endpoint cannot mail-bomb an inbox", () => {
    expect(
      decideConfirmationSend({
        ...base,
        confirmationStatus: "pending",
        sentCount: MAX_CONFIRMATION_SENDS,
      }),
    ).toEqual({ send: false, reason: "capped" });
  });

  it("fails closed without a credential or a token", () => {
    expect(
      decideConfirmationSend({ ...base, apiKey: undefined, confirmationStatus: "pending" }),
    ).toEqual({ send: false, reason: "no_api_key" });
    expect(
      decideConfirmationSend({ ...base, token: "nope", confirmationStatus: "pending" }),
    ).toEqual({ send: false, reason: "no_token" });
  });
});

describe("decideConfirmToken", () => {
  it("confirms a pending, subscribed row", () => {
    expect(
      decideConfirmToken({ status: "subscribed", confirmation_status: "pending" }),
    ).toEqual({ action: "confirm" });
  });

  it("is idempotent for an already confirmed row", () => {
    expect(
      decideConfirmToken({ status: "subscribed", confirmation_status: "confirmed" }),
    ).toEqual({ action: "already" });
  });

  it("never revives a suppressed address, and ignores unknown tokens", () => {
    for (const status of ["unsubscribed", "bounced", "complained", "suppressed"]) {
      expect(decideConfirmToken({ status, confirmation_status: "pending" })).toEqual({
        action: "ignore",
        reason: "suppressed",
      });
    }
    expect(decideConfirmToken(null)).toEqual({ action: "ignore", reason: "unknown" });
  });
});

describe("confirmation email", () => {
  const request = buildConfirmationEmailRequest(
    {
      email: "reader@example.com",
      baseUrl: "https://deliciousduck.com",
      token: TOKEN,
      preferenceToken: "abcdefghijklmnop",
    },
    KEY,
  );
  const body = JSON.parse(request.body) as {
    to: string[];
    html: string;
    text: string;
    headers: Record<string, string>;
  };

  it("carries the confirm link in both a text and an HTML alternative", () => {
    const link = confirmUrl("https://deliciousduck.com", TOKEN);
    expect(body.html).toContain(link);
    expect(body.text).toContain(link);
  });

  it("ships the one-click unsubscribe headers spam filters look for", () => {
    expect(body.headers["List-Unsubscribe"]).toContain("/newsletter/unsubscribe?t=");
    expect(body.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });

  it("contains no tracking pixel or image", () => {
    expect(body.html).not.toMatch(/<img/i);
  });

  it("classifies a provider failure by status without echoing the body", async () => {
    await expect(
      dispatchConfirmationEmail(
        {
          email: "reader@example.com",
          baseUrl: "https://deliciousduck.com",
          token: TOKEN,
          preferenceToken: "abcdefghijklmnop",
        },
        KEY,
        async () => ({ ok: false, status: 429 }),
      ),
    ).rejects.toThrow("confirmation_email_rate_limited");
  });
});

describe("Game Plan delivery is gated on confirmation", () => {
  const deps = (confirmed: boolean | undefined) => {
    const dispatch = vi.fn(async () => {});
    return {
      dispatch,
      deps: {
        persist: async () => ({ outcome: "created" as const, ...(confirmed === undefined ? {} : { confirmed }) }),
        loadDeliveryState: async () => ({ token: "abcdefghijklmnop", lastRequestedAt: null }),
        recordDelivery: async () => {},
        dispatch,
        apiKey: KEY,
        baseUrl: "https://deliciousduck.com",
        email: "reader@example.com",
        selection: {
          cut: "breast",
          method: "pan",
          concern: "crispy_skin",
          partySize: "1_2",
        } as never,
      },
    };
  };

  it("sends nothing to an unconfirmed address", async () => {
    const { deps: d, dispatch } = deps(false);
    await expect(runGamePlanDelivery(d)).resolves.toEqual({
      outcome: "created",
      delivery: "skipped_unconfirmed",
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("fails closed when confirmation state is unknown", async () => {
    const { deps: d, dispatch } = deps(undefined);
    const result = await runGamePlanDelivery(d);
    expect(result.delivery).toBe("skipped_unconfirmed");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("delivers once the address is confirmed", async () => {
    const { deps: d, dispatch } = deps(true);
    await expect(runGamePlanDelivery(d)).resolves.toEqual({
      outcome: "created",
      delivery: "requested",
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe("delivery-outcome events", () => {
  it("maps the three delivery events and keeps our own send tag", () => {
    expect(
      mapResendDeliveryEvent({
        type: "email.delivered",
        created_at: "2026-08-24T10:00:00Z",
        data: { to: ["reader@example.com"], tags: [{ name: "type", value: "game_plan" }] },
      }),
    ).toEqual({
      name: "email.delivered",
      eventType: "delivered",
      email: "reader@example.com",
      occurredAt: "2026-08-24T10:00:00Z",
      detail: "email.delivered:game_plan",
    });
    expect(mapResendDeliveryEvent({ type: "email.sent", data: { to: "a@b.co" } })?.eventType).toBe(
      "sent",
    );
    expect(
      mapResendDeliveryEvent({ type: "email.delivery_delayed", data: { to: "a@b.co" } })?.eventType,
    ).toBe("delivery_delayed");
  });

  it("ignores engagement events entirely", () => {
    for (const type of ["email.opened", "email.clicked"]) {
      expect(mapResendDeliveryEvent({ type, data: { to: "a@b.co" } })).toBeNull();
    }
  });

  it("never treats a delivery event as a suppression signal", () => {
    expect(mapResendEvent({ type: "email.delivered", data: { to: "a@b.co" } })).toBeNull();
  });

  it("logs a verified delivery event without touching subscriber status", async () => {
    const insertDeliveryEvent = vi.fn(async () => "inserted" as const);
    const applySuppression = vi.fn(async () => "applied" as const);
    const outcome = await handleResendWebhook({
      raw: "{}",
      headers: { "svix-id": "evt_1", "svix-timestamp": "1", "svix-signature": "v1,x" },
      hasSecret: true,
      verify: async () => ({ type: "email.delivered", data: { to: ["reader@example.com"] } }),
      store: {
        insertEvent: vi.fn(async () => "inserted" as const),
        findSubscriber: async () => ({ id: "row-1", status: "subscribed" }),
        applySuppression,
        insertDeliveryEvent,
      },
    });

    expect(outcome.status).toBe(200);
    expect(outcome.internal).toBe("delivery_logged");
    expect(insertDeliveryEvent).toHaveBeenCalledTimes(1);
    expect(applySuppression).not.toHaveBeenCalled();
  });
});
