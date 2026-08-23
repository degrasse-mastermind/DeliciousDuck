import { describe, expect, it } from "vitest";
import {
  MONITORED_SITE_URL,
  authorizeCronRequest,
  coversTarget,
  indexedTrend,
  normalizeSitemapStatus,
  processingState,
  resolveSiteUrl,
  type SnapshotRow,
} from "../indexing-monitor";

const FALLBACK = { siteUrl: "https://deliciousduck.com/", sitemapUrl: "https://deliciousduck.com/sitemap.xml" };

function row(partial: Partial<SnapshotRow> & { captured_at: string; indexed_count: number }): SnapshotRow {
  return {
    submitted_count: 72,
    error_count: 0,
    warning_count: 0,
    is_pending: false,
    last_submitted: null,
    last_downloaded: null,
    ...partial,
  };
}

describe("coversTarget", () => {
  it("matches a domain property against its subdomains", () => {
    expect(coversTarget("sc-domain:deliciousduck.com", "https://www.deliciousduck.com/")).toBe(true);
    expect(coversTarget("sc-domain:deliciousduck.com", "https://otherduck.com/")).toBe(false);
  });

  it("treats url-prefix properties as scheme and host specific", () => {
    expect(coversTarget("https://deliciousduck.com/", "https://deliciousduck.com/guides")).toBe(true);
    expect(coversTarget("https://deliciousduck.com/", "http://deliciousduck.com/")).toBe(false);
    expect(coversTarget("https://deliciousduck.com/", "https://www.deliciousduck.com/")).toBe(false);
  });
});

describe("resolveSiteUrl", () => {
  it("ignores unverified properties", () => {
    expect(
      resolveSiteUrl([{ siteUrl: MONITORED_SITE_URL, permissionLevel: "siteUnverifiedUser" }]),
    ).toEqual({ status: "no_property" });
  });

  it("prefers the exact root url-prefix when several properties cover the site", () => {
    expect(
      resolveSiteUrl([
        { siteUrl: "sc-domain:deliciousduck.com", permissionLevel: "siteOwner" },
        { siteUrl: MONITORED_SITE_URL, permissionLevel: "siteOwner" },
      ]),
    ).toEqual({ status: "selected", siteUrl: MONITORED_SITE_URL });
  });

  it("asks for a choice rather than guessing between non-exact matches", () => {
    const result = resolveSiteUrl(
      [
        { siteUrl: "sc-domain:deliciousduck.com", permissionLevel: "siteOwner" },
        { siteUrl: "https://deliciousduck.com/", permissionLevel: "siteOwner" },
      ],
      "https://deliciousduck.com/guides/x",
    );
    expect(result.status).toBe("selection_required");
  });
});

describe("normalizeSitemapStatus", () => {
  it("sums content buckets and coerces bad values to zero", () => {
    const snapshot = normalizeSitemapStatus(
      {
        path: "https://deliciousduck.com/sitemap.xml",
        lastSubmitted: "2026-08-23T10:00:00Z",
        lastDownloaded: "2026-08-24T10:00:00Z",
        isPending: false,
        errors: "2",
        warnings: null,
        contents: [
          { type: "web", submitted: "70", indexed: "12" },
          { type: "image", submitted: 2, indexed: 0 },
        ],
      },
      FALLBACK,
    );
    expect(snapshot.submittedCount).toBe(72);
    expect(snapshot.indexedCount).toBe(12);
    expect(snapshot.errorCount).toBe(2);
    expect(snapshot.warningCount).toBe(0);
    expect(snapshot.lastDownloaded).toBe("2026-08-24T10:00:00.000Z");
  });

  it("survives an empty response", () => {
    const snapshot = normalizeSitemapStatus({}, FALLBACK);
    expect(snapshot).toMatchObject({ submittedCount: 0, indexedCount: 0, isPending: false });
    expect(snapshot.lastDownloaded).toBeNull();
  });
});

describe("processingState", () => {
  const base = normalizeSitemapStatus({}, FALLBACK);

  it("reports processing while Google says pending", () => {
    expect(processingState({ ...base, isPending: true })).toBe("processing");
  });

  it("treats a download older than the submission as still processing", () => {
    expect(
      processingState({
        ...base,
        lastSubmitted: "2026-08-24T00:00:00.000Z",
        lastDownloaded: "2026-08-23T00:00:00.000Z",
      }),
    ).toBe("processing");
  });

  it("reports processed once the download is at or after the submission", () => {
    expect(
      processingState({
        ...base,
        lastSubmitted: "2026-08-23T00:00:00.000Z",
        lastDownloaded: "2026-08-24T00:00:00.000Z",
      }),
    ).toBe("processed");
  });

  it("reports unknown when there is no download time at all", () => {
    expect(processingState(base)).toBe("unknown");
  });
});

describe("indexedTrend", () => {
  it("needs two snapshots before claiming a direction", () => {
    const trend = indexedTrend([row({ captured_at: "2026-08-24T00:00:00Z", indexed_count: 0 })]);
    expect(trend.direction).toBe("insufficient_data");
    expect(trend.netChange).toBeNull();
    expect(trend.points[0]?.delta).toBeNull();
  });

  it("orders oldest-first and computes deltas, net change and coverage", () => {
    const trend = indexedTrend([
      row({ captured_at: "2026-08-26T00:00:00Z", indexed_count: 30 }),
      row({ captured_at: "2026-08-24T00:00:00Z", indexed_count: 10 }),
      row({ captured_at: "2026-08-25T00:00:00Z", indexed_count: 18 }),
    ]);
    expect(trend.points.map((p) => p.indexedCount)).toEqual([10, 18, 30]);
    expect(trend.points.map((p) => p.delta)).toEqual([null, 8, 12]);
    expect(trend.direction).toBe("increasing");
    expect(trend.netChange).toBe(20);
    expect(trend.latestIndexed).toBe(30);
    expect(trend.coverage).toBeCloseTo(41.7, 1);
  });

  it("detects a decreasing indexed count", () => {
    const trend = indexedTrend([
      row({ captured_at: "2026-08-24T00:00:00Z", indexed_count: 30 }),
      row({ captured_at: "2026-08-25T00:00:00Z", indexed_count: 21 }),
    ]);
    expect(trend.direction).toBe("decreasing");
    expect(trend.netChange).toBe(-9);
  });
});

describe("authorizeCronRequest", () => {
  it("rejects when no token is configured", () => {
    expect(authorizeCronRequest("Bearer abc", undefined)).toBe(false);
    expect(authorizeCronRequest("Bearer abc", "")).toBe(false);
  });

  it("accepts the bearer token and the bare token", () => {
    expect(authorizeCronRequest("Bearer s3cret", "s3cret")).toBe(true);
    expect(authorizeCronRequest("s3cret", "s3cret")).toBe(true);
  });

  it("rejects a wrong or missing token", () => {
    expect(authorizeCronRequest("Bearer wrong!", "s3cret")).toBe(false);
    expect(authorizeCronRequest(null, "s3cret")).toBe(false);
    expect(authorizeCronRequest("Bearer s3cre", "s3cret")).toBe(false);
  });
});
