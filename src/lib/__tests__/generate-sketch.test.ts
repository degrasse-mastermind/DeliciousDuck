import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { handleGenerateSketch } from "@/routes/api/generate-sketch";

function post(body: BodyInit | null, headers?: Record<string, string>) {
  return handleGenerateSketch({
    request: new Request("http://localhost:8080/api/generate-sketch", {
      method: "POST",
      body,
      headers,
    }),
  });
}

describe("POST /api/generate-sketch", () => {
  const originalEnv = process.env["NODE_ENV"];

  beforeEach(() => {
    process.env["NODE_ENV"] = "development";
    process.env["LOVABLE_API_KEY"] = "test-key";
  });

  afterEach(() => {
    process.env["NODE_ENV"] = originalEnv;
    vi.unstubAllGlobals();
  });

  it("returns 403 Disabled in production before parsing or calling the gateway", async () => {
    process.env["NODE_ENV"] = "production";
    const fetchSpy = vi.fn().mockResolvedValue(new Response("should not reach", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    const res = await post("not valid json", { "Content-Type": "application/json" });

    expect(res.status).toBe(403);
    expect(await res.text()).toBe("Disabled");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reaches normal validation in development and returns a 400 for malformed JSON", async () => {
    const res = await post("not valid json", { "Content-Type": "application/json" });

    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Malformed request body");
  });

  it("forwards a valid non-streaming request to the AI gateway in development", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: [{ b64_json: "abc123" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const res = await post(
      JSON.stringify({ prompt: "a hand-drawn roast duck for a recipe article", stream: false }),
      { "Content-Type": "application/json" },
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("abc123");
  });
});
