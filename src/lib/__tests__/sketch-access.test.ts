import { describe, expect, it } from "vitest";
import { studioAccessDenied } from "@/lib/sketch-request";

describe("studioAccessDenied", () => {
  it("allows preview traffic when no token is configured", () => {
    expect(studioAccessDenied(null, { token: undefined, production: false })).toBeNull();
  });

  it("hides the endpoint in production when no token is configured", () => {
    const res = studioAccessDenied(null, { token: undefined, production: true });
    expect(res?.status).toBe(404);
  });

  it("requires a matching token when one is configured", () => {
    const env = { token: "s3cret-token", production: true };
    expect(studioAccessDenied(null, env)?.status).toBe(401);
    expect(studioAccessDenied("wrong-token!!", env)?.status).toBe(401);
    expect(studioAccessDenied("s3cret-token", env)).toBeNull();
  });
});
