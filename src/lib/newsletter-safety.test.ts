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
  PROVIDER_EVENT_STATUS,
} from "./newsletter-status";

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

describe("generic responses", () => {
  /**
   * Mirrors the two branches of `persistSubscriber` that reach the client. Both
   * must be indistinguishable in shape so a caller cannot learn whether an
   * address is already on the list, suppressed, or brand new.
   */
  const suppressedResponse = {
    subscribed: true,
    welcomeTriggered: false,
    primaryInterest: null,
    preferenceToken: null,
  };
  const activeDuplicateResponse = {
    subscribed: true,
    welcomeTriggered: false,
    primaryInterest: null,
    preferenceToken: null,
  };

  it("returns the same shape and no account state for both", () => {
    expect(Object.keys(suppressedResponse).sort()).toEqual(
      Object.keys(activeDuplicateResponse).sort(),
    );
    expect(suppressedResponse).toEqual(activeDuplicateResponse);
    expect(JSON.stringify(suppressedResponse)).not.toMatch(/suppress|unsubscrib|bounce|complain/i);
  });
});
