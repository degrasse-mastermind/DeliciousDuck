import { beforeEach, describe, expect, it } from "vitest";
import {
  WELCOME_EVENT_DEFINE_URL,
  WELCOME_EVENT_NAME,
  WELCOME_EVENT_SCHEMA,
  WELCOME_EVENT_SEND_URL,
  buildWelcomeEventData,
  buildWelcomeEventDefinitionRequest,
  buildWelcomeEventRequest,
  decideWelcomeDispatch,
  dispatchWelcomeEvent,
  welcomeEventFailureReason,
} from "./newsletter-welcome-event";
import { isPlausibleToken } from "./newsletter-links";

const KEY = "re_test_key";
const TOKEN = "9f8c1d2e-3a4b-4c5d-8e9f-0a1b2c3d4e5f";

const INPUT = {
  email: "duck@example.com",
  guideUrl: "https://deliciousduck.com/downloads/duck-fundamentals-field-guide.pdf",
  baseUrl: "https://deliciousduck.com",
  token: TOKEN,
  interest: "duck-breast",
  sourcePath: "/guides/pan-seared-duck-breast",
};

describe("buildWelcomeEventData", () => {
  it("includes absolute unsubscribe and preferences URLs built from the token", () => {
    const data = buildWelcomeEventData(INPUT);
    expect(data.unsubscribe_url).toBe(
      `https://deliciousduck.com/newsletter/unsubscribe?t=${TOKEN}`,
    );
    expect(data.preferences_url).toBe(
      `https://deliciousduck.com/newsletter/preferences?t=${TOKEN}`,
    );
    expect(data.unsubscribe_url.startsWith("https://")).toBe(true);
    expect(data.preferences_url.startsWith("https://")).toBe(true);
  });

  it("keeps the address out of the link URLs", () => {
    const data = buildWelcomeEventData(INPUT);
    expect(data.unsubscribe_url).not.toContain("duck@example.com");
    expect(data.preferences_url).not.toContain("duck@example.com");
  });

  it("carries the guide URL and falls back for missing metadata", () => {
    const data = buildWelcomeEventData({ ...INPUT, interest: undefined, sourcePath: undefined });
    expect(data.guide_url).toBe(INPUT.guideUrl);
    expect(data.interest).toBe("general");
    expect(data.source_path).toBe("");
  });

  it("does not double a trailing slash on the base URL", () => {
    const data = buildWelcomeEventData({ ...INPUT, baseUrl: "https://deliciousduck.com/" });
    expect(data.unsubscribe_url).toBe(
      `https://deliciousduck.com/newsletter/unsubscribe?t=${TOKEN}`,
    );
  });

  it("uses a token the preference route will accept", () => {
    expect(isPlausibleToken(TOKEN)).toBe(true);
  });
});

describe("buildWelcomeEventRequest", () => {
  it("POSTs the event to the exact send URL", () => {
    const req = buildWelcomeEventRequest(INPUT, KEY);
    expect(req.url).toBe(WELCOME_EVENT_SEND_URL);
    expect(req.url).toBe("https://api.resend.com/events/send");
    expect(req.method).toBe("POST");
    expect(req.headers["authorization"]).toBe(`Bearer ${KEY}`);
  });

  it("names the event and includes both link fields in data", () => {
    const body = JSON.parse(buildWelcomeEventRequest(INPUT, KEY).body);
    expect(body.event).toBe(WELCOME_EVENT_NAME);
    expect(body.email).toBe("duck@example.com");
    expect(body.data).toBeUndefined();
    expect(Object.keys(body).sort()).toEqual(["email", "event", "payload"]);
    expect(Object.keys(body.payload).sort()).toEqual([
      "guide_url",
      "interest",
      "preferences_url",
      "source_path",
      "unsubscribe_url",
    ]);
  });
});

describe("buildWelcomeEventDefinitionRequest", () => {
  it("registers the link fields so the provider cannot drop them silently", () => {
    const req = buildWelcomeEventDefinitionRequest(KEY);
    expect(req.url).toBe(WELCOME_EVENT_DEFINE_URL);
    expect(req.method).toBe("POST");
    const body = JSON.parse(req.body);
    expect(body.name).toBe(WELCOME_EVENT_NAME);
    expect(body.schema).toEqual(WELCOME_EVENT_SCHEMA);
    expect(body.schema.unsubscribe_url).toBe("string");
    expect(body.schema.preferences_url).toBe("string");
  });
});

describe("welcomeEventFailureReason", () => {
  it("classifies by status without any provider text", () => {
    expect(welcomeEventFailureReason(401)).toBe("welcome_event_unauthorized");
    expect(welcomeEventFailureReason(404)).toBe("welcome_event_not_registered");
    expect(welcomeEventFailureReason(422)).toBe("welcome_event_rejected_request");
    expect(welcomeEventFailureReason(429)).toBe("welcome_event_rate_limited");
    expect(welcomeEventFailureReason(502)).toBe("welcome_event_provider_unavailable");
    expect(welcomeEventFailureReason(418)).toBe("welcome_event_status_418");
  });

  it("never echoes an address or a key", () => {
    for (const status of [400, 401, 404, 422, 429, 500]) {
      const reason = welcomeEventFailureReason(status);
      expect(reason).not.toContain("@");
      expect(reason).not.toContain("re_");
    }
  });
});

describe("decideWelcomeDispatch", () => {
  const OK = { sendWelcome: true, welcomeEventStatus: "pending", token: TOKEN };

  it("dispatches only for a new, unwelcomed row with a usable token", () => {
    expect(decideWelcomeDispatch(OK)).toEqual({ dispatch: true, token: TOKEN });
  });

  it("makes zero provider calls for duplicate and suppressed submissions", () => {
    // providerPlan gives sendWelcome=false for every non-new row.
    expect(decideWelcomeDispatch({ ...OK, sendWelcome: false })).toEqual({
      dispatch: false,
      reason: "not_new_row",
    });
  });

  it("never re-sends to an already welcomed row", () => {
    expect(decideWelcomeDispatch({ ...OK, welcomeEventStatus: "sent" })).toEqual({
      dispatch: false,
      reason: "already_sent",
    });
  });

  it("refuses a missing or malformed token", () => {
    for (const token of [null, undefined, "", "  ", "short", "has spaces in it here", 42, {}]) {
      expect(decideWelcomeDispatch({ ...OK, token })).toEqual({
        dispatch: false,
        reason: "no_token",
      });
    }
  });

  it("refuses a missing or blank API key before any token check", () => {
    for (const apiKey of [undefined, null, "", "   ", 42]) {
      expect(decideWelcomeDispatch({ ...OK, apiKey })).toEqual({
        dispatch: false,
        reason: "no_api_key",
      });
    }
    expect(decideWelcomeDispatch({ ...OK, apiKey: KEY })).toEqual({ dispatch: true, token: TOKEN });
  });
});

describe("dispatchWelcomeEvent", () => {
  const calls: Array<{ url: string; method: string; body: string }> = [];
  const fetchImpl = (status: number) => (url: string, init: { method: string; headers: Record<string, string>; body: string }) => {
    calls.push({ url, method: init.method, body: init.body });
    return Promise.resolve({ ok: status >= 200 && status < 300, status });
  };

  beforeEach(() => {
    calls.length = 0;
  });

  it("sends exactly one POST to /events/send on success", async () => {
    await dispatchWelcomeEvent(INPUT, KEY, fetchImpl(200));
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe("https://api.resend.com/events/send");
    expect(calls[0]!.method).toBe("POST");
    const body = JSON.parse(calls[0]!.body);
    expect(body.payload.guide_url).toBe(INPUT.guideUrl);
    expect(body.payload.unsubscribe_url).toContain(`?t=${TOKEN}`);
    expect(body.payload.preferences_url).toContain(`?t=${TOKEN}`);
  });

  it("registers the definition once and retries on 404", async () => {
    await expect(dispatchWelcomeEvent(INPUT, KEY, fetchImpl(404))).rejects.toThrow(
      "welcome_event_not_registered",
    );
    expect(calls.map((c) => c.url)).toEqual([
      "https://api.resend.com/events/send",
      "https://api.resend.com/events",
      "https://api.resend.com/events/send",
    ]);
    expect(JSON.parse(calls[1]!.body).schema.unsubscribe_url).toBe("string");
    expect(JSON.parse(calls[1]!.body).schema.preferences_url).toBe("string");
  });

  it("throws a status classification only, with no body, address, or token", async () => {
    const err = await dispatchWelcomeEvent(INPUT, KEY, fetchImpl(429)).catch((e: Error) => e);
    expect((err as Error).message).toBe("welcome_event_rate_limited");
    expect((err as Error).message).not.toContain(INPUT.email);
    expect((err as Error).message).not.toContain(TOKEN);
    expect((err as Error).message).not.toContain(KEY);
  });

  it("percent-encodes an opaque token that needs it", () => {
    const data = buildWelcomeEventData({ ...INPUT, token: "a b/c?d&e" });
    expect(data.unsubscribe_url).toContain("?t=a%20b%2Fc%3Fd%26e");
    expect(data.preferences_url).toContain("?t=a%20b%2Fc%3Fd%26e");
  });
});
