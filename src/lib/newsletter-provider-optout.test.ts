import { describe, expect, it, vi } from "vitest";
import {
  buildProviderOptOutRequest,
  optOutIdentifier,
  sendProviderOptOut,
} from "./newsletter-provider-optout";

const KEY = "re_test_key";

describe("optOutIdentifier", () => {
  it("prefers the stored contact id over the email", () => {
    expect(optOutIdentifier({ contactId: "c-123", email: "duck@example.com" })).toBe("c-123");
  });

  it("falls back to the email when no contact id is stored", () => {
    expect(optOutIdentifier({ contactId: null, email: "duck@example.com" })).toBe(
      "duck@example.com",
    );
  });

  it("falls back when the stored contact id is blank or whitespace", () => {
    expect(optOutIdentifier({ contactId: "   ", email: "duck@example.com" })).toBe(
      "duck@example.com",
    );
    expect(optOutIdentifier({ email: "duck@example.com" })).toBe("duck@example.com");
  });
});

describe("buildProviderOptOutRequest", () => {
  it("targets the current /contacts/:id-or-email route, not the deprecated audience route", () => {
    const req = buildProviderOptOutRequest({ contactId: "c-123", email: "duck@example.com" }, KEY);
    expect(req.url).toBe("https://api.resend.com/contacts/c-123");
    expect(req.url).not.toContain("/audiences/");
    expect(req.method).toBe("PATCH");
  });

  it("percent-encodes the email fallback so @ and + survive the path", () => {
    const req = buildProviderOptOutRequest(
      { contactId: null, email: "duck+drop@example.com" },
      KEY,
    );
    expect(req.url).toBe("https://api.resend.com/contacts/duck%2Bdrop%40example.com");
  });

  it("encodes a slash so it cannot open a different path segment", () => {
    const req = buildProviderOptOutRequest({ contactId: "c/../contacts", email: "x@y.com" }, KEY);
    expect(req.url).toBe("https://api.resend.com/contacts/c%2F..%2Fcontacts");
  });

  it("sends only { unsubscribed: true } and never the address in the body", () => {
    const req = buildProviderOptOutRequest({ contactId: null, email: "duck@example.com" }, KEY);
    expect(JSON.parse(req.body)).toEqual({ unsubscribed: true });
    expect(req.body).not.toContain("duck@example.com");
  });

  it("carries the bearer key and JSON content type", () => {
    const req = buildProviderOptOutRequest({ contactId: "c-1", email: "a@b.com" }, KEY);
    expect(req.headers).toEqual({
      "content-type": "application/json",
      authorization: `Bearer ${KEY}`,
    });
  });
});

describe("sendProviderOptOut", () => {
  it("skips entirely with no API key and performs no request", async () => {
    const fetchImpl = vi.fn();
    const out = await sendProviderOptOut({ email: "a@b.com" }, undefined, fetchImpl);
    expect(out).toBe("skipped");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("issues exactly one PATCH with the built shape", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const out = await sendProviderOptOut({ contactId: "c-9", email: "a@b.com" }, KEY, fetchImpl);
    expect(out).toBe("synced");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/contacts/c-9");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ unsubscribed: true });
  });

  it("reports error on a provider rejection without throwing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(sendProviderOptOut({ email: "a@b.com" }, KEY, fetchImpl)).resolves.toBe("error");
  });

  it("reports error on a network failure without throwing", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("socket hang up"));
    await expect(sendProviderOptOut({ email: "a@b.com" }, KEY, fetchImpl)).resolves.toBe("error");
  });
});
