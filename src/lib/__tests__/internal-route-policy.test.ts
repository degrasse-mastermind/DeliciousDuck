import { describe, expect, it } from "vitest";

import {
  internalNotFoundResponse,
  isInternalPath,
  shouldBlockInternalRequest,
} from "../internal-route-policy";

describe("internal route policy", () => {
  it.each(["/internal", "/internal/", "/internal/growth-dashboard", "/internal/a/b"])(
    "recognizes %s as internal",
    (pathname) => expect(isInternalPath(pathname)).toBe(true),
  );

  it.each(["/", "/internalized", "/buy/where-to-buy-duck-online", "/api/internal"])(
    "does not overmatch %s",
    (pathname) => expect(isInternalPath(pathname)).toBe(false),
  );

  it("fails closed for every internal path in production", () => {
    expect(
      shouldBlockInternalRequest({ pathname: "/internal/illustrations", isProduction: true }),
    ).toBe(true);
    expect(
      shouldBlockInternalRequest({ pathname: "/internal/unknown-tool", isProduction: true }),
    ).toBe(true);
  });

  it("preserves legitimate local-development access", () => {
    expect(
      shouldBlockInternalRequest({ pathname: "/internal/illustrations", isProduction: false }),
    ).toBe(false);
  });

  it("returns a non-cacheable plain 404", async () => {
    const response = internalNotFoundResponse();
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(await response.text()).toBe("Not Found");
  });
});
