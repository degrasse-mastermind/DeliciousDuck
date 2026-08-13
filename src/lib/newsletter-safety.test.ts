import { describe, expect, it } from "vitest";
import {
  NEWSLETTER_CONSENT,
  KNOWN_CONSENT_VERSIONS,
  isCurrentConsentVersion,
  privacyPolicyUrl,
} from "./newsletter-consent";
import { subscribeSchema } from "./newsletter-schema";
import {
  SUPPRESSED_STATUSES,
  decideSignup,
  isSuppressed,
  providerPlan,
  PROVIDER_EVENT_STATUS,
} from "./newsletter-status";
import { SIGNUP_OUTCOMES, publicSubscribeResponse } from "./newsletter-response";


/**
 * Newsletter safety rules: consent evidence + suppression-safe signup.
 * Pure logic only — no database, no provider, no email.
 */

const base = {
  email: "cook@example.com",
  consentVersion: NEWSLETTER_CONSENT.version,
} as const;

describe("consent versioning", () => {
  it("keeps UI and stored evidence on one version identifier", () => {
    expect(NEWSLETTER_CONSENT.version).toMatch(/^\d{4}-\d{2}-\d{2}\.v\d+$/);
    expect(KNOWN_CONSENT_VERSIONS).toContain(NEWSLETTER_CONSENT.version);
    expect(isCurrentConsentVersion(NEWSLETTER_CONSENT.version)).toBe(true);
    expect(isCurrentConsentVersion("2020-01-01.v1")).toBe(false);
  });

  it("renders consent text that names the emails, the sender, and opt-out", () => {
    expect(NEWSLETTER_CONSENT.text).toContain("Field");
    expect(NEWSLETTER_CONSENT.text).toContain("hello@deliciousduck.com");
    expect(NEWSLETTER_CONSENT.text.toLowerCase()).toContain("unsubscribe");
  });

  it("builds a stable absolute privacy policy reference", () => {
    expect(privacyPolicyUrl("https://deliciousduck.com/")).toBe(
      "https://deliciousduck.com/privacy",
    );
  });

  it("accepts a signup carrying the current consent version", () => {
    const parsed = subscribeSchema.parse({ ...base, sourcePath: "/recipes" });
    expect(parsed.consentVersion).toBe(NEWSLETTER_CONSENT.version);
    expect(parsed.email).toBe("cook@example.com");
  });

  it("rejects a signup with a missing or stale consent version", () => {
    expect(() => subscribeSchema.parse({ email: base.email })).toThrow();
    expect(() =>
      subscribeSchema.parse({ email: base.email, consentVersion: "1999-01-01.v1" }),
    ).toThrow();
  });

  it("rejects a signup that tripped the honeypot", () => {
    expect(() => subscribeSchema.parse({ ...base, trap: "bot" })).toThrow();
  });
});

describe("signup decisions", () => {
  it("new address: creates, records consent, welcome eligible", () => {
    expect(decideSignup(null)).toEqual({
      action: "create",
      recordConsent: true,
      sendWelcome: true,
    });
  });

  it("active duplicate: refreshes idempotently and does not resend the welcome", () => {
    expect(
      decideSignup({
        status: "subscribed",
        consent_record: "explicit",
        welcome_event_status: "sent",
      }),
    ).toEqual({ action: "refresh", recordConsent: true, sendWelcome: false });
  });

  it("active duplicate that never got the welcome: still eligible once", () => {
    expect(
      decideSignup({
        status: "subscribed",
        consent_record: "explicit",
        welcome_event_status: "pending",
      }),
    ).toEqual({ action: "refresh", recordConsent: true, sendWelcome: true });
  });

  it("legacy duplicate (consent unknown, still subscribed): refresh + record consent", () => {
    const decision = decideSignup({
      status: "subscribed",
      consent_record: "unknown_legacy",
      welcome_event_status: "sent",
    });
    expect(decision.action).toBe("refresh");
    expect(decision).toMatchObject({ recordConsent: true, sendWelcome: false });
  });

  it("never reactivates a suppressed address", () => {
    for (const status of SUPPRESSED_STATUSES) {
      expect(isSuppressed(status)).toBe(true);
      expect(decideSignup({ status, welcome_event_status: "sent" })).toEqual({
        action: "blocked",
        reason: "suppressed",
        status,
      });
    }
  });

  it("fails closed on an unrecognised status", () => {
    expect(decideSignup({ status: "weird_state" })).toEqual({
      action: "blocked",
      reason: "suppressed",
      status: "unknown",
    });
  });

  it("maps only verifiable provider events to suppression statuses", () => {
    expect(PROVIDER_EVENT_STATUS["unsubscribed"]).toBe("unsubscribed");
    expect(PROVIDER_EVENT_STATUS["complained"]).toBe("complained");
    expect(PROVIDER_EVENT_STATUS["delivered"]).toBeNull();
    expect(PROVIDER_EVENT_STATUS["opened"]).toBeUndefined();
  });
});

describe("public subscribe response", () => {
  /**
   * Exercises the real mapping function the server wrapper returns, for every
   * internal outcome, instead of re-declaring hoped-for objects.
   */
  it("returns one identical response for every accepted-looking outcome", () => {
    const responses = SIGNUP_OUTCOMES.map((outcome) => publicSubscribeResponse(outcome));
    for (const response of responses) {
      expect(response).toEqual(responses[0]);
      expect(JSON.stringify(response)).toBe(JSON.stringify(responses[0]));
      expect(Object.keys(response)).toEqual(["subscribed"]);
    }
  });

  it("exposes no welcome, interest, membership, suppression, or token field", () => {
    for (const outcome of SIGNUP_OUTCOMES) {
      const response = publicSubscribeResponse(outcome) as Record<string, unknown>;
      for (const leak of [
        "welcomeTriggered",
        "welcomeEvent",
        "primaryInterest",
        "interest",
        "preferenceToken",
        "resendSync",
        "suppressed",
        "status",
        "existing",
        "signupCount",
      ]) {
        expect(response[leak]).toBeUndefined();
      }
      expect(JSON.stringify(response)).not.toMatch(
        /suppress|unsubscrib|bounce|complain|welcome|token|interest|duplicate|legacy/i,
      );
    }
  });

  it("covers the suppressed outcome with the same response as a new signup", () => {
    expect(publicSubscribeResponse("blocked_suppressed")).toEqual(
      publicSubscribeResponse("created"),
    );
    expect(publicSubscribeResponse("legacy_active_duplicate")).toEqual(
      publicSubscribeResponse("active_duplicate"),
    );
  });
});

describe("provider idempotency", () => {
  it("only a genuinely new local row may call the provider", () => {
    expect(providerPlan(decideSignup(null))).toEqual({
      syncContact: true,
      syncSegment: true,
      sendWelcome: true,
    });
  });

  it("active duplicates perform zero provider calls, even if never welcomed", () => {
    for (const welcome of ["sent", "pending", "error", null]) {
      const plan = providerPlan(
        decideSignup({
          status: "subscribed",
          consent_record: "explicit",
          welcome_event_status: welcome,
        }),
      );
      expect(plan).toEqual({ syncContact: false, syncSegment: false, sendWelcome: false });
    }
  });

  it("legacy active duplicates perform zero provider calls", () => {
    expect(
      providerPlan(
        decideSignup({
          status: "subscribed",
          consent_record: "unknown_legacy",
          welcome_event_status: "pending",
        }),
      ),
    ).toEqual({ syncContact: false, syncSegment: false, sendWelcome: false });
  });

  it("suppressed and unknown states perform zero provider calls", () => {
    for (const status of [...SUPPRESSED_STATUSES, "weird_state"]) {
      expect(providerPlan(decideSignup({ status }))).toEqual({
        syncContact: false,
        syncSegment: false,
        sendWelcome: false,
      });
    }
  });

  it("no plan ever enables a welcome without a contact sync", () => {
    for (const existing of [
      null,
      { status: "subscribed", welcome_event_status: "pending" },
      { status: "unsubscribed", welcome_event_status: "sent" },
    ]) {
      const plan = providerPlan(decideSignup(existing));
      if (plan.sendWelcome) expect(plan.syncContact).toBe(true);
    }
  });
});

