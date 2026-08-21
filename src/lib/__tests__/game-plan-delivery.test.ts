import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import {
  GAME_PLAN_COOLDOWN_MS,
  GAME_PLAN_EVENT_NAME,
  buildGamePlanEventData,
  decideGamePlanDelivery,
  dispatchGamePlanEvent,
  runGamePlanDelivery,
  withinCooldown,
  type GamePlanDeliveryDeps,
} from "@/lib/game-plan-delivery";
import type { GamePlanSelection } from "@/data/duck-game-plan";
import type { SignupOutcome } from "@/lib/newsletter-response";

/**
 * Duck Game Plan email delivery.
 *
 * The production failure these tests lock down: the planner rode the newsletter
 * signup path, whose welcome email is deliberately send-once, so a returning
 * subscriber saw a plan on screen and received nothing — and no provider call
 * was made at all.
 */

const SELECTION: GamePlanSelection = {
  cut: "whole-duck",
  method: "roast",
  concern: "crispy-skin",
  partySize: "4-6",
};

const TOKEN = "a".repeat(32);

function deps(overrides: Partial<GamePlanDeliveryDeps> = {}): {
  deps: GamePlanDeliveryDeps;
  dispatch: ReturnType<typeof vi.fn>;
  recordDelivery: ReturnType<typeof vi.fn>;
} {
  const dispatch = vi.fn(async () => {});
  const recordDelivery = vi.fn(async () => {});
  return {
    dispatch,
    recordDelivery,
    deps: {
      email: "cook@example.com",
      selection: SELECTION,
      baseUrl: "https://deliciousduck.com",
      apiKey: "re_test_key",
      persist: async () => ({ outcome: "created" as SignupOutcome }),
      loadDeliveryState: async () => ({ token: TOKEN, lastRequestedAt: null }),
      recordDelivery,
      dispatch,
      now: () => 1_700_000_000_000,
      ...overrides,
    },
  };
}

describe("Game Plan delivery decisions", () => {
  it("delivers for a brand new subscriber", async () => {
    const h = deps();
    const result = await runGamePlanDelivery(h.deps);
    expect(result.delivery).toBe("requested");
    expect(h.dispatch).toHaveBeenCalledTimes(1);
  });

  it("delivers for an existing active subscriber, unlike the send-once welcome", async () => {
    const h = deps({ persist: async () => ({ outcome: "active_duplicate" }) });
    const result = await runGamePlanDelivery(h.deps);
    expect(result.delivery).toBe("requested");
    expect(h.dispatch).toHaveBeenCalledTimes(1);
  });

  it("also delivers for a resubscribed address", async () => {
    const h = deps({ persist: async () => ({ outcome: "resubscribed" }) });
    expect((await runGamePlanDelivery(h.deps)).delivery).toBe("requested");
  });

  it("never emails a suppressed address, and never reads its delivery state", async () => {
    const loadDeliveryState = vi.fn(async () => ({ token: TOKEN, lastRequestedAt: null }));
    const h = deps({ persist: async () => ({ outcome: "blocked_suppressed" }), loadDeliveryState });
    const result = await runGamePlanDelivery(h.deps);
    expect(result.delivery).toBe("skipped_suppressed");
    expect(h.dispatch).not.toHaveBeenCalled();
    expect(loadDeliveryState).not.toHaveBeenCalled();
  });

  it("sends nothing again inside the cooldown window", async () => {
    const now = 1_700_000_000_000;
    const h = deps({
      now: () => now,
      loadDeliveryState: async () => ({
        token: TOKEN,
        lastRequestedAt: now - GAME_PLAN_COOLDOWN_MS + 1_000,
      }),
    });
    const result = await runGamePlanDelivery(h.deps);
    expect(result.delivery).toBe("skipped_cooldown");
    expect(h.dispatch).not.toHaveBeenCalled();
  });

  it("sends again once the cooldown has elapsed", async () => {
    const now = 1_700_000_000_000;
    const h = deps({
      now: () => now,
      loadDeliveryState: async () => ({
        token: TOKEN,
        lastRequestedAt: now - GAME_PLAN_COOLDOWN_MS - 1,
      }),
    });
    expect((await runGamePlanDelivery(h.deps)).delivery).toBe("requested");
  });

  it("records the delivery only after the provider accepted it", async () => {
    const ok = deps();
    await runGamePlanDelivery(ok.deps);
    expect(ok.recordDelivery).toHaveBeenCalledTimes(1);

    const bad = deps({
      dispatch: vi.fn(async () => {
        throw new Error("game_plan_event_provider_unavailable");
      }),
    });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await runGamePlanDelivery(bad.deps);
    spy.mockRestore();
    expect(result.delivery).toBe("error");
    expect(bad.recordDelivery).not.toHaveBeenCalled();
  });

  it("fails closed without a credential or a mailbox token", async () => {
    const noKey = deps({ apiKey: undefined });
    expect((await runGamePlanDelivery(noKey.deps)).delivery).toBe("skipped_no_api_key");
    expect(noKey.dispatch).not.toHaveBeenCalled();

    const noToken = deps({ loadDeliveryState: async () => ({ token: null, lastRequestedAt: null }) });
    expect((await runGamePlanDelivery(noToken.deps)).delivery).toBe("skipped_no_token");
    expect(noToken.dispatch).not.toHaveBeenCalled();
  });

  it("treats an unparseable or absent timestamp as no cooldown", () => {
    expect(withinCooldown(null, Date.now())).toBe(false);
    expect(withinCooldown("not-a-date", Date.now())).toBe(false);
  });

  it("suppression outranks every other gate", () => {
    const decision = decideGamePlanDelivery({
      outcome: "blocked_suppressed",
      token: TOKEN,
      lastRequestedAt: null,
      now: 0,
      apiKey: "re_test_key",
    });
    expect(decision).toEqual({ dispatch: false, reason: "suppressed" });
  });
});

describe("Game Plan email payload", () => {
  const data = buildGamePlanEventData({
    email: "cook@example.com",
    selection: SELECTION,
    baseUrl: "https://deliciousduck.com",
    token: TOKEN,
  });

  it("carries the plan headline and a route back into the workflow", () => {
    expect(data.headline.length).toBeGreaterThan(3);
    expect(data.recommendation_id).toBeTruthy();
    expect(data.game_plan_url).toBe("https://deliciousduck.com/tools/duck-game-plan");
    expect(data.primary_url.startsWith("https://deliciousduck.com/")).toBe(true);
    expect(data.primary_label.length).toBeGreaterThan(3);
  });

  it("puts no email address anywhere in the payload data", () => {
    expect(JSON.stringify(data)).not.toContain("cook@example.com");
    expect(JSON.stringify(data)).not.toContain("@example.com");
  });

  it("carries only the finite selection enums", () => {
    expect(data.cut).toBe("whole-duck");
    expect(data.method).toBe("roast");
    expect(data.concern).toBe("crispy-skin");
    expect(data.party_size_bucket).toBe("4-6");
  });

  it("registers the event definition once when the provider does not know it", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    let first = true;
    const fetchImpl = vi.fn(async (url: string, init: { body: string }) => {
      calls.push({ url, body: init.body });
      if (url.endsWith("/events/send") && first) {
        first = false;
        return { ok: false, status: 404 };
      }
      return { ok: true, status: 200 };
    });

    await dispatchGamePlanEvent(
      { email: "cook@example.com", selection: SELECTION, baseUrl: "https://deliciousduck.com", token: TOKEN },
      "re_test_key",
      fetchImpl as never,
    );

    expect(calls.map((c) => c.url)).toEqual([
      "https://api.resend.com/events/send",
      "https://api.resend.com/events",
      "https://api.resend.com/events/send",
    ]);
    expect(calls[0]?.body).toContain(GAME_PLAN_EVENT_NAME);
  });

  it("throws a status classification, never a provider body", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 429 }));
    await expect(
      dispatchGamePlanEvent(
        { email: "cook@example.com", selection: SELECTION, baseUrl: "https://deliciousduck.com", token: TOKEN },
        "re_test_key",
        fetchImpl as never,
      ),
    ).rejects.toThrow("game_plan_event_rate_limited");
  });
});

describe("planner submission UI contract", () => {
  const source = readFileSync("src/components/tools/DuckGamePlanFlow.tsx", "utf8");

  it("uses the Game Plan delivery action rather than the plain signup", () => {
    expect(source).toContain("onSubscribe = requestGamePlanEmail");
    expect(source).not.toContain("subscribeToNewsletter");
  });

  it("announces delivery in a live region and moves focus to it", () => {
    expect(source).toContain('role="status"');
    expect(source).toContain("Plan ready — check your inbox");
    expect(source).toContain("if (justDelivered) deliveredRef.current?.focus()");
    expect(source).toContain("tabIndex={-1}");
  });

  it("still renders the plan after an accepted submission", () => {
    expect(source).toContain("<DuckGamePlanResult selection={confirmed}");
  });

  it("fires conversion analytics only after the server request resolves", () => {
    const submit = source.slice(source.indexOf("async function handleSubmit"));
    const awaited = submit.indexOf("await onSubscribe(");
    const signup = submit.indexOf("trackNewsletterSignup({");
    const planSignup = submit.indexOf("trackGamePlanSignup({");
    expect(awaited).toBeGreaterThan(-1);
    expect(signup).toBeGreaterThan(awaited);
    expect(planSignup).toBeGreaterThan(awaited);

    // The failure branch keeps the entered address, shows retry, restores focus,
    // and emits no success or conversion event.
    const failure = submit.slice(submit.indexOf("} catch (cause) {"));
    expect(failure).toContain("emailRef.current?.focus()");
    expect(failure).toContain("trackNewsletterFormError");
    expect(failure).not.toContain("trackNewsletterSignup");
    expect(failure).not.toContain("trackGamePlanSignup");
    expect(failure).not.toContain("setConfirmed");
    expect(failure).not.toContain("setEmail(");
  });

  it("does not replay the acknowledgement for a plan restored from storage", () => {
    expect(source).toContain("const [justDelivered, setJustDelivered] = useState(false);");
    expect(source).toContain("{justDelivered && (");
  });
});
