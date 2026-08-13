import { describe, expect, it, vi } from "vitest";
import {
  buildProviderContactRequest,
  classifyProviderContactStatus,
  createProviderContact,
  parseProviderContactId,
  providerFailureReason,
} from "./newsletter-provider-contact";

const KEY = "re_test_key";

function res(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new Error("no body");
      return body;
    },
  };
}

describe("buildProviderContactRequest", () => {
  it("targets the current /contacts route with POST", () => {
    const req = buildProviderContactRequest("duck@example.com", KEY);
    expect(req.url).toBe("https://api.resend.com/contacts");
    expect(req.method).toBe("POST");
    expect(req.url).not.toContain("/audiences/");
  });

  it("sends email only and never unsubscribed:false", () => {
    const req = buildProviderContactRequest("duck@example.com", KEY);
    expect(JSON.parse(req.body)).toEqual({ email: "duck@example.com" });
    expect(req.body).not.toContain("unsubscribed");
  });

  it("authorizes with the bearer key", () => {
    const req = buildProviderContactRequest("duck@example.com", KEY);
    expect(req.headers["authorization"]).toBe(`Bearer ${KEY}`);
    expect(req.headers["content-type"]).toBe("application/json");
  });
});

describe("parseProviderContactId", () => {
  it("reads flat and nested id shapes", () => {
    expect(parseProviderContactId({ id: "c-1" })).toBe("c-1");
    expect(parseProviderContactId({ data: { id: "c-2" } })).toBe("c-2");
  });

  it("returns null when no usable id is present", () => {
    expect(parseProviderContactId({})).toBeNull();
    expect(parseProviderContactId({ id: "  " })).toBeNull();
    expect(parseProviderContactId(null)).toBeNull();
    expect(parseProviderContactId("c-3")).toBeNull();
  });
});

describe("classifyProviderContactStatus / providerFailureReason", () => {
  it("treats 2xx as created and 409 as existing", () => {
    expect(classifyProviderContactStatus(201)).toBe("created");
    expect(classifyProviderContactStatus(200)).toBe("created");
    expect(classifyProviderContactStatus(409)).toBe("exists");
    expect(classifyProviderContactStatus(500)).toBe("error");
  });

  it("classifies failures without provider text", () => {
    expect(providerFailureReason(401)).toBe("provider_unauthorized");
    expect(providerFailureReason(422)).toBe("provider_rejected_request");
    expect(providerFailureReason(429)).toBe("provider_rate_limited");
    expect(providerFailureReason(503)).toBe("provider_unavailable");
    expect(providerFailureReason(418)).toBe("provider_status_418");
  });
});

describe("createProviderContact", () => {
  it("parses the id from a successful creation", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(201, { id: "c-new" }));
    const out = await createProviderContact("duck@example.com", KEY, fetchImpl);
    expect(out).toEqual({ status: "created", contactId: "c-new" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0]![0]).toBe("https://api.resend.com/contacts");
    expect(fetchImpl.mock.calls[0]![1].method).toBe("POST");
  });

  it("handles an existing-contact conflict idempotently with no follow-up call", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(409, { id: "c-old" }));
    const out = await createProviderContact("duck@example.com", KEY, fetchImpl);
    expect(out).toEqual({ status: "exists", contactId: "c-old" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("returns a null id when the conflict body carries no safe id", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(409));
    const out = await createProviderContact("duck@example.com", KEY, fetchImpl);
    expect(out).toEqual({ status: "exists", contactId: null });
  });

  it("returns a status-classified error and no PII on provider failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(500, { message: "duck@example.com blew up" }));
    const out = await createProviderContact("duck@example.com", KEY, fetchImpl);
    expect(out).toEqual({ status: "error", reason: "provider_unavailable" });
    expect(JSON.stringify(out)).not.toContain("duck@example.com");
  });

  it("tolerates an unparseable success body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(201));
    const out = await createProviderContact("duck@example.com", KEY, fetchImpl);
    expect(out).toEqual({ status: "created", contactId: null });
  });
});
