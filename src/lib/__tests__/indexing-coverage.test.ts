import { describe, expect, it } from "vitest";
import {
  aggregateCoverage,
  coveragePercent,
  coverageTrend,
  failedInspection,
  normalizeInspection,
  selectInspectionBatch,
} from "../indexing-coverage";

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
    const pass = normalizeInspection("https://deliciousduck.com/cook", inspection("PASS", "Submitted and indexed"));
    expect(pass.isIndexed).toBe(true);
    expect(pass.coverageState).toBe("Submitted and indexed");
    expect(pass.lastCrawlTime).toBe("2026-08-20T10:00:00.000Z");

    const neutral = normalizeInspection("https://deliciousduck.com/buy", inspection("NEUTRAL", "Discovered — currently not indexed"));
    expect(neutral.isIndexed).toBe(false);
    expect(neutral.coverageState).toBe("Discovered — currently not indexed");
  });

  it("survives an empty or unexpected response without inventing state", () => {
    const row = normalizeInspection("https://deliciousduck.com/", {});
    expect(row.isIndexed).toBe(false);
    expect(row.verdict).toBeNull();
    expect(row.coverageState).toBeNull();
    expect(row.inspectError).toBeNull();
  });
});

describe("aggregateCoverage", () => {
  it("counts indexed, not indexed, and failed checks separately", () => {
    const totals = aggregateCoverage([
      normalizeInspection("a", inspection("PASS", "Submitted and indexed")),
      normalizeInspection("b", inspection("PASS", "Submitted and indexed")),
      normalizeInspection("c", inspection("NEUTRAL", "Crawled — currently not indexed")),
      failedInspection("d", "search_console_request_failed_429"),
    ]);
    expect(totals).toMatchObject({
      checkedCount: 4,
      indexedCount: 2,
      notIndexedCount: 1,
      failedCount: 1,
    });
    expect(totals.breakdown).toEqual({
      "Submitted and indexed": 2,
      "Crawled — currently not indexed": 1,
    });
  });
});

describe("coverageTrend", () => {
  const row = (captured_at: string, indexed_count: number) => ({
    captured_at,
    indexed_count,
    checked_count: 40,
    not_indexed_count: 40 - indexed_count,
    failed_count: 0,
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

  it("reports insufficient data for a single snapshot", () => {
    expect(coverageTrend([row("2026-08-21T06:00:00Z", 4)]).direction).toBe("insufficient_data");
    expect(coverageTrend([]).netChange).toBeNull();
  });
});

describe("coveragePercent", () => {
  it("is null with nothing checked and rounded to one decimal otherwise", () => {
    expect(coveragePercent(0, 0)).toBeNull();
    expect(coveragePercent(1, 3)).toBe(33.3);
  });
});

describe("selectInspectionBatch", () => {
  const urls = ["a", "b", "c", "d", "e"];

  it("takes a bounded slice and reports where the next run resumes", () => {
    expect(selectInspectionBatch(urls, 2, 0)).toEqual({ batch: ["a", "b"], nextOffset: 2 });
    expect(selectInspectionBatch(urls, 2, 2)).toEqual({ batch: ["c", "d"], nextOffset: 4 });
  });

  it("wraps around the list so every URL is eventually checked", () => {
    expect(selectInspectionBatch(urls, 3, 4)).toEqual({ batch: ["e", "a", "b"], nextOffset: 2 });
    expect(selectInspectionBatch(urls, 10, 0).batch).toHaveLength(5);
  });

  it("handles empty input", () => {
    expect(selectInspectionBatch([], 10, 0)).toEqual({ batch: [], nextOffset: 0 });
  });
});
