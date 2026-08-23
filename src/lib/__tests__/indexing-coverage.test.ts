import { describe, expect, it } from "vitest";
import {
  aggregateCoverage,
  coveragePercent,
  coverageTrend,
  monitoredCoverageUrls,
  normalizeInspection,
  runCompleteness,
  unresolvedCoverage,
} from "../indexing-coverage";
import { isSitemapEligiblePath } from "../sitemap";

const inspection = (verdict: string, coverageState: string) => ({
  inspectionResult: {
    indexStatusResult: {
      verdict,
      coverageState,
      robotsTxtState: "ALLOWED",
      indexingState: "INDEXING_ALLOWED",
      pageFetchState: "SUCCESSFUL",
      googleCanonical: "https://deliciousduck.com/cook",
      lastCrawlTime: "2026-08-20T10:00:00Z",
    },
  },
});

describe("normalizeInspection", () => {
  it("treats only a PASS verdict as indexed", () => {
    const pass = normalizeInspection(
      "https://deliciousduck.com/cook",
      inspection("PASS", "Submitted and indexed"),
    );
    expect(pass.state).toBe("indexed");
    expect(pass.isIndexed).toBe(true);
    expect(pass.coverageState).toBe("Submitted and indexed");
    expect(pass.lastCrawlTime).toBe("2026-08-20T10:00:00.000Z");
  });

  it("counts documented negative verdicts as not indexed, with Google's reason", () => {
    for (const verdict of ["NEUTRAL", "PARTIAL", "FAIL"]) {
      const row = normalizeInspection(
        "https://deliciousduck.com/buy",
        inspection(verdict, "Discovered — currently not indexed"),
      );
      expect(row.state).toBe("not_indexed");
      expect(row.isIndexed).toBe(false);
      expect(row.inspectError).toBeNull();
      expect(row.coverageState).toBe("Discovered — currently not indexed");
    }
  });

  it("marks a missing inspectionResult unresolved rather than not indexed", () => {
    const row = normalizeInspection("https://deliciousduck.com/", {});
    expect(row.state).toBe("unresolved");
    expect(row.isIndexed).toBe(false);
    expect(row.inspectError).toBe("missing_inspection_result");
  });

  it("marks a missing indexStatusResult unresolved", () => {
    const row = normalizeInspection("https://deliciousduck.com/", {
      inspectionResult: { mobileUsabilityResult: { verdict: "PASS" } },
    });
    expect(row.state).toBe("unresolved");
    expect(row.inspectError).toBe("missing_index_status_result");
  });

  it("marks a missing verdict unresolved but keeps the fields Google did send", () => {
    const row = normalizeInspection("https://deliciousduck.com/", {
      inspectionResult: { indexStatusResult: { coverageState: "URL is unknown to Google" } },
    });
    expect(row.state).toBe("unresolved");
    expect(row.inspectError).toBe("missing_verdict");
    expect(row.coverageState).toBe("URL is unknown to Google");
  });

  it("marks an unrecognised verdict unresolved and names it", () => {
    const row = normalizeInspection(
      "https://deliciousduck.com/",
      inspection("VERDICT_UNSPECIFIED", "Unknown"),
    );
    expect(row.state).toBe("unresolved");
    expect(row.inspectError).toBe("unrecognized_verdict_VERDICT_UNSPECIFIED");
  });

  it("survives a non-object response", () => {
    for (const raw of [null, undefined, "boom", 42, []]) {
      expect(normalizeInspection("https://deliciousduck.com/", raw).state).toBe("unresolved");
    }
  });
});

describe("aggregateCoverage", () => {
  it("counts indexed, not indexed, and unresolved separately", () => {
    const totals = aggregateCoverage([
      normalizeInspection("a", inspection("PASS", "Submitted and indexed")),
      normalizeInspection("b", inspection("PASS", "Submitted and indexed")),
      normalizeInspection("c", inspection("NEUTRAL", "Crawled — currently not indexed")),
      unresolvedCoverage("d", "search_console_request_failed_429"),
      normalizeInspection("e", {}),
    ]);
    expect(totals).toMatchObject({
      checkedCount: 5,
      indexedCount: 2,
      notIndexedCount: 1,
      unresolvedCount: 2,
    });
    expect(totals.breakdown).toEqual({
      "Submitted and indexed": 2,
      "Crawled — currently not indexed": 1,
    });
  });
});

describe("runCompleteness", () => {
  it("is complete only when every monitored URL resolved", () => {
    expect(runCompleteness(3, { checkedCount: 3, unresolvedCount: 0 })).toEqual({
      isComplete: true,
      incompleteReason: null,
    });
    expect(runCompleteness(3, { checkedCount: 2, unresolvedCount: 0 }).isComplete).toBe(false);
    expect(runCompleteness(3, { checkedCount: 3, unresolvedCount: 1 }).isComplete).toBe(false);
    expect(runCompleteness(0, { checkedCount: 0, unresolvedCount: 0 }).isComplete).toBe(false);
  });
});

describe("coverageTrend", () => {
  const row = (captured_at: string, indexed_count: number, is_complete = true) => ({
    captured_at,
    indexed_count,
    checked_count: 40,
    monitored_count: 40,
    not_indexed_count: 40 - indexed_count,
    unresolved_count: 0,
    is_complete,
    incomplete_reason: null,
    breakdown: null,
  });

  it("orders oldest-first with deltas and a direction", () => {
    const trend = coverageTrend([
      row("2026-08-23T06:00:00Z", 12),
      row("2026-08-21T06:00:00Z", 4),
      row("2026-08-22T06:00:00Z", 9),
    ]);
    expect(trend.points.map((p) => p.indexedCount)).toEqual([4, 9, 12]);
    expect(trend.points.map((p) => p.delta)).toEqual([null, 5, 3]);
    expect(trend.netChange).toBe(8);
    expect(trend.direction).toBe("increasing");
  });

  it("excludes partial runs so growth compares like with like", () => {
    const trend = coverageTrend([
      row("2026-08-21T06:00:00Z", 10),
      row("2026-08-22T06:00:00Z", 3, false),
      row("2026-08-23T06:00:00Z", 14),
    ]);
    expect(trend.points.map((p) => p.indexedCount)).toEqual([10, 14]);
    expect(trend.netChange).toBe(4);
    expect(trend.excludedPartialRuns).toBe(1);
  });

  it("reports insufficient data for a single comparable snapshot", () => {
    expect(coverageTrend([row("2026-08-21T06:00:00Z", 4)]).direction).toBe("insufficient_data");
    expect(coverageTrend([row("2026-08-21T06:00:00Z", 4, false)]).points).toHaveLength(0);
    expect(coverageTrend([]).netChange).toBeNull();
  });
});

describe("coveragePercent", () => {
  it("is null with nothing resolved and rounded to one decimal otherwise", () => {
    expect(coveragePercent(0, 0)).toBeNull();
    expect(coveragePercent(1, 3)).toBe(33.3);
  });
});

describe("monitoredCoverageUrls", () => {
  const urls = monitoredCoverageUrls();

  it("covers the canonical production sitemap set with absolute, deduplicated URLs", () => {
    expect(urls.length).toBeGreaterThan(50);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain("https://deliciousduck.com/");
    for (const url of urls) expect(url.startsWith("https://deliciousduck.com/")).toBe(true);
  });

  it("preserves every existing non-indexable exclusion", () => {
    for (const url of urls) {
      const path = url.replace("https://deliciousduck.com", "");
      expect(isSitemapEligiblePath(path)).toBe(true);
      expect(path).not.toMatch(/^\/(internal|api)\b/);
      expect(path).not.toContain("$");
    }
  });
});
