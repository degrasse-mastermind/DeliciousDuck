/**
 * Pure coverage-tracking logic for real Google indexing status.
 *
 * The Sitemaps API's `indexed` field is retired and always reports 0, so actual
 * coverage has to come from the URL Inspection API, which reports the state of
 * Google's *indexed* version of a single URL (`indexStatusResult`). This module
 * holds the deterministic parts: normalising one inspection response,
 * aggregating a batch into a snapshot, and turning stored snapshots into a
 * trend — all network- and database-free so they can be unit-tested.
 *
 * Deliberate limits:
 * - URL Inspection READS the index. It never requests indexing or a re-crawl.
 * - `coverageState` is Google's own wording; we pass it through verbatim rather
 *   than inventing a friendlier cause for a URL that is not indexed.
 */

export interface UrlCoverage {
  url: string;
  isIndexed: boolean;
  verdict: string | null;
  coverageState: string | null;
  robotsTxtState: string | null;
  indexingState: string | null;
  pageFetchState: string | null;
  googleCanonical: string | null;
  lastCrawlTime: string | null;
  inspectError: string | null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function iso(value: unknown): string | null {
  const raw = str(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * A URL counts as indexed only when Google's verdict for its indexed version is
 * PASS. Anything else — NEUTRAL, FAIL, PARTIAL, absent — is "not indexed", and
 * `coverageState` carries Google's reason.
 */
export function normalizeInspection(url: string, raw: unknown): UrlCoverage {
  const result = ((raw ?? {}) as Record<string, unknown>)["inspectionResult"] as
    | Record<string, unknown>
    | undefined;
  const status = (result?.["indexStatusResult"] ?? {}) as Record<string, unknown>;
  const verdict = str(status["verdict"]);
  return {
    url,
    isIndexed: verdict === "PASS",
    verdict,
    coverageState: str(status["coverageState"]),
    robotsTxtState: str(status["robotsTxtState"]),
    indexingState: str(status["indexingState"]),
    pageFetchState: str(status["pageFetchState"]),
    googleCanonical: str(status["googleCanonical"]),
    lastCrawlTime: iso(status["lastCrawlTime"]),
    inspectError: null,
  };
}

/** A URL we could not inspect: counted separately, never as "not indexed". */
export function failedInspection(url: string, message: string): UrlCoverage {
  return {
    url,
    isIndexed: false,
    verdict: null,
    coverageState: null,
    robotsTxtState: null,
    indexingState: null,
    pageFetchState: null,
    googleCanonical: null,
    lastCrawlTime: null,
    inspectError: message,
  };
}

export interface CoverageAggregate {
  checkedCount: number;
  indexedCount: number;
  notIndexedCount: number;
  failedCount: number;
  /** Google's `coverageState` wording → number of URLs reporting it. */
  breakdown: Record<string, number>;
}

const UNREPORTED = "State not reported by Google";

/** Counts one batch. Failed inspections are excluded from indexed/not-indexed. */
export function aggregateCoverage(rows: UrlCoverage[]): CoverageAggregate {
  const breakdown: Record<string, number> = {};
  let indexedCount = 0;
  let notIndexedCount = 0;
  let failedCount = 0;

  for (const row of rows) {
    if (row.inspectError) {
      failedCount += 1;
      continue;
    }
    if (row.isIndexed) indexedCount += 1;
    else notIndexedCount += 1;
    const key = row.coverageState ?? UNREPORTED;
    breakdown[key] = (breakdown[key] ?? 0) + 1;
  }

  return {
    checkedCount: rows.length,
    indexedCount,
    notIndexedCount,
    failedCount,
    breakdown,
  };
}

export interface CoverageSnapshotRow {
  captured_at: string;
  checked_count: number;
  indexed_count: number;
  not_indexed_count: number;
  failed_count: number;
  breakdown: Record<string, number> | null;
}

export interface CoveragePoint {
  capturedAt: string;
  indexedCount: number;
  checkedCount: number;
  /** Change against the previous chronological snapshot, or null for the first. */
  delta: number | null;
}

export type CoverageDirection = "increasing" | "flat" | "decreasing" | "insufficient_data";

export interface CoverageTrend {
  points: CoveragePoint[];
  direction: CoverageDirection;
  netChange: number | null;
}

/** Oldest-first indexed-URL trend with per-snapshot deltas. */
export function coverageTrend(rows: CoverageSnapshotRow[]): CoverageTrend {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime(),
  );
  const points: CoveragePoint[] = sorted.map((row, i) => ({
    capturedAt: row.captured_at,
    indexedCount: row.indexed_count,
    checkedCount: row.checked_count,
    delta: i === 0 ? null : row.indexed_count - sorted[i - 1]!.indexed_count,
  }));

  const first = points[0] ?? null;
  const last = points.at(-1) ?? null;
  const netChange = first && last && points.length > 1 ? last.indexedCount - first.indexedCount : null;

  let direction: CoverageDirection = "insufficient_data";
  if (netChange !== null) {
    direction = netChange > 0 ? "increasing" : netChange < 0 ? "decreasing" : "flat";
  }

  return { points, direction, netChange };
}

/** Share of checked URLs Google has indexed, to one decimal place. */
export function coveragePercent(indexed: number, checked: number): number | null {
  if (checked <= 0) return null;
  return Math.round((indexed / checked) * 1000) / 10;
}

/**
 * URL Inspection is quota-limited (per-property daily and per-minute caps), so a
 * run checks a bounded slice of the site and rotates through the full list
 * across runs. Deterministic given the same offset, so it is testable.
 */
export function selectInspectionBatch(
  urls: string[],
  limit: number,
  offset: number,
): { batch: string[]; nextOffset: number } {
  if (urls.length === 0 || limit <= 0) return { batch: [], nextOffset: 0 };
  const size = Math.min(limit, urls.length);
  const start = ((offset % urls.length) + urls.length) % urls.length;
  const batch: string[] = [];
  for (let i = 0; i < size; i += 1) batch.push(urls[(start + i) % urls.length]!);
  return { batch, nextOffset: (start + size) % urls.length };
}
