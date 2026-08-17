import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { Route } from "@/routes/api/generate-sketch";

function post(body: BodyInit | null, headers?: Record<string, string>) {
  return Route.server.handlers.POST({
    request: new Request("http://localhost:8080/api/generate-sketch", {
      method: "POST",
      body,
      headers,
    }),
  });
}

describe("POST /api/generate-sketch", () => {
  const originalEnv = process.env["NODE_ENV"];
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env["NODE_ENV"] = "development";
    process.env["LOVABLE_API_KEY"] = "test-key";
  });

  afterEach(() => {
    process.env["NODE_ENV"] = originalEnv;
    if (originalFetch) globalThis.fetch = originalFetch;
    else delete (globalThis as Record<string, unknown>).fetch;
  });

  it("returns 403 Disabled in production before parsing or calling the gateway", async () => {
    process.env["NODE_ENV"] = "production";
    let fetchCalled = false;
    globalThis.fetch = async () => {
      fetchCalled = true;
      return new Response("should not reach", { status: 200 });
    };

    const res = await post("not valid json", { "Content-Type": "application/json" });

    expect(res.status).toBe(403);
    expect(await res.text()).toBe("Disabled");
    expect(fetchCalled).toBe(false);
  });

  it("reaches normal validation in development and returns a 400 for malformed JSON", async () => {
    const res = await post("not valid json", { "Content-Type": "application/json" });

    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Malformed request body");
  });

  it("forwards a valid non-streaming request to the AI gateway in development", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ data: [{ b64_json: "abc123" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    const res = await post(
      JSON.stringify({ prompt: "a hand-drawn roast duck for a recipe article", stream: false }),
      { "Content-Type": "application/json" },
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("abc123");
  });
});
