import { describe, expect, it } from "vitest";
import {
  WELCOME_EVENT_DEFINE_URL,
  WELCOME_EVENT_NAME,
  WELCOME_EVENT_SCHEMA,
  WELCOME_EVENT_SEND_URL,
  buildWelcomeEventData,
  buildWelcomeEventDefinitionRequest,
  buildWelcomeEventRequest,
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
    expect(Object.keys(body.data).sort()).toEqual([
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
