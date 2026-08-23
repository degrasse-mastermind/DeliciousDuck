import { describe, expect, it } from "vitest";
import {
  bearerToken,
  resolveTokenAudience,
  scheduledRunVerdict,
  tokensMatch,
} from "../indexing-monitor";

describe("resolveTokenAudience", () => {
  const configured = { admin: "admin-token-value", cron: "cron-token-value" };

  it("accepts either owner secret, so no secret needs duplicating", () => {
    expect(resolveTokenAudience("admin-token-value", configured)).toBe("admin");
    expect(resolveTokenAudience("cron-token-value", configured)).toBe("cron");
  });

  it("accepts the rotating database-held token as the cron audience", () => {
    expect(
      resolveTokenAudience("rotating-value", { admin: "a".repeat(20), rotating: "rotating-value" }),
    ).toBe("cron");
  });

  it("rejects wrong, empty, and unconfigured tokens", () => {
    expect(resolveTokenAudience("nope", configured)).toBeNull();
    expect(resolveTokenAudience("   ", configured)).toBeNull();
    expect(resolveTokenAudience("", {})).toBeNull();
    expect(tokensMatch("x", undefined)).toBe(false);
  });
});

describe("bearerToken", () => {
  it("unwraps bearer headers and raw values", () => {
    expect(bearerToken("Bearer abc")).toBe("abc");
    expect(bearerToken("abc")).toBe("abc");
    expect(bearerToken(null)).toBe("");
  });
});

describe("scheduledRunVerdict", () => {
  const now = new Date("2026-08-23T12:00:00Z");

  it("is blocked with no token configured", () => {
    const verdict = scheduledRunVerdict({
      envTokenConfigured: false,
      rotatingTokenConfigured: false,
      searchConsoleConfigured: true,
      lastCronSnapshotAt: null,
      now,
    });
    expect(verdict.status).toBe("blocked");
    expect(verdict.findings.join(" ")).toContain("cannot authenticate");
  });

  it("is blocked when Search Console is not linked", () => {
    expect(
      scheduledRunVerdict({
        envTokenConfigured: true,
        rotatingTokenConfigured: true,
        searchConsoleConfigured: false,
        lastCronSnapshotAt: now.toISOString(),
        now,
      }).status,
    ).toBe("blocked");
  });

  it("is ready with a rotating token and a recent run", () => {
    const verdict = scheduledRunVerdict({
      envTokenConfigured: false,
      rotatingTokenConfigured: true,
      searchConsoleConfigured: true,
      lastCronSnapshotAt: "2026-08-23T06:15:00Z",
      now,
    });
    expect(verdict.status).toBe("ready");
    expect(verdict.hoursSinceLastRun).toBeCloseTo(5.8, 1);
  });

  it("flags a stale schedule when runs stop landing", () => {
    const verdict = scheduledRunVerdict({
      envTokenConfigured: true,
      rotatingTokenConfigured: true,
      searchConsoleConfigured: true,
      lastCronSnapshotAt: "2026-08-20T06:15:00Z",
      now,
    });
    expect(verdict.status).toBe("stale");
    expect(verdict.findings.join(" ")).toContain("not landing");
  });

  it("never leaks token values in findings", () => {
    const verdict = scheduledRunVerdict({
      envTokenConfigured: true,
      rotatingTokenConfigured: false,
      searchConsoleConfigured: true,
      lastCronSnapshotAt: null,
      now,
    });
    expect(verdict.findings.join(" ")).toMatch(/INDEXING_CRON_TOKEN secret/);
  });
});
