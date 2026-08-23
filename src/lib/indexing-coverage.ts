/**
 * Pure coverage-tracking logic for real Google indexing status.
 *
 * The Sitemaps API's `indexed` field is retired and always reports 0, so actual
 * per-URL index status has to come from the URL Inspection API, which reports
 * the state of Google's *indexed* version of a single URL
 * (`inspectionResult.indexStatusResult`). This module holds the deterministic
 * parts: normalising one inspection response, aggregating a run into a snapshot,
 * and turning stored snapshots into a trend — all network- and database-free so
 * they can be unit-tested.
 *
 * Deliberate limits:
 * - URL Inspection READS Google's index. It never requests indexing, a
 *   re-crawl, or a live test. It complements Search Console's Pages/Indexing
 *   report; it is not that report's dataset.
 * - `coverageState` is Google's own wording; we pass it through verbatim rather
 *   than inventing a friendlier cause for a URL that is not indexed.
 * - A missing, malformed, or unrecognised response is `unresolved`. It never
 *   counts as "not indexed", because absent data is not evidence of absence.
 * - A run is only comparable to other runs when it covered the complete
 *   monitored URL set with no unresolved URLs. Partial runs are stored for
 *   diagnostics and excluded from the site-wide growth trend.
 */

import { isSitemapEligiblePath, sitemapPaths, SITEMAP_BASE_URL } from "./sitemap";

/** Tri-state outcome of inspecting one URL. */
export type IndexState = "indexed" | "not_indexed" | "unresolved";

/**
 * Verdicts Google documents for `indexStatusResult`. Anything outside this set
 * (absent, `VERDICT_UNSPECIFIED`, or a value we do not recognise) is
 * `unresolved` rather than a guess in either direction.
 */
const INDEXED_VERDICTS = new Set(["PASS"]);
const NOT_INDEXED_VERDICTS = new Set(["NEUTRAL", "PARTIAL", "FAIL"]);

export interface UrlCoverage {
  url: string;
  state: IndexState;
  /** Convenience mirror of `state === "indexed"`; never true when unresolved. */
  isIndexed: boolean;
  verdict: string | null;
  coverageState: string | null;
  robotsTxtState: string | null;
  indexingState: string | null;
  pageFetchState: string | null;
  googleCanonical: string | null;
  lastCrawlTime: string | null;
  /** Why the URL is unresolved: a transport failure or an unusable response. */
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Classifies one inspection response.
 *
 * `PASS` means Google holds an indexed version of the URL. `NEUTRAL`,
 * `PARTIAL`, and `FAIL` are real negative answers and enter the not-indexed
 * count with Google's own `coverageState` as the reason. Everything else — no
 * `inspectionResult`, no `indexStatusResult`, no verdict, or a verdict string we
 * do not recognise — is `unresolved`, so incomplete data can never be reported
 * as a URL dropping out of the index.
 */
export function normalizeInspection(url: string, raw: unknown): UrlCoverage {
  if (!isRecord(raw)) return unresolvedCoverage(url, "inspection_response_not_an_object");

  const result = raw["inspectionResult"];
  if (!isRecord(result)) return unresolvedCoverage(url, "missing_inspection_result");

  const status = result["indexStatusResult"];
  if (!isRecord(status)) return unresolvedCoverage(url, "missing_index_status_result");


  const verdict = str(status["verdict"]);
  const shared = {
    url,
    verdict,
    coverageState: str(status["coverageState"]),
    robotsTxtState: str(status["robotsTxtState"]),
    indexingState: str(status["indexingState"]),
    pageFetchState: str(status["pageFetchState"]),
    googleCanonical: str(status["googleCanonical"]),
    lastCrawlTime: iso(status["lastCrawlTime"]),
  };

  if (verdict === null) {
    return { ...shared, state: "unresolved", isIndexed: false, inspectError: "missing_verdict" };
  }
  if (INDEXED_VERDICTS.has(verdict)) {
    return { ...shared, state: "indexed", isIndexed: true, inspectError: null };
  }
  if (NOT_INDEXED_VERDICTS.has(verdict)) {
    return { ...shared, state: "not_indexed", isIndexed: false, inspectError: null };
  }
  return {
    ...shared,
    state: "unresolved",
    isIndexed: false,
    inspectError: `unrecognized_verdict_${verdict}`,
  };
}

/** A URL we could not resolve: never counted as indexed or as not indexed. */
export function unresolvedCoverage(url: string, message: string): UrlCoverage {
  return {
    url,
    state: "unresolved",
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

/** Back-compat alias — a transport/quota failure is one kind of unresolved. */
export const failedInspection = unresolvedCoverage;

export interface CoverageAggregate {
  checkedCount: number;
  indexedCount: number;
  notIndexedCount: number;
  /** Attempted but not answered usably: transport failures and unusable bodies. */
  unresolvedCount: number;
  /** Google's `coverageState` wording → number of resolved URLs reporting it. */
  breakdown: Record<string, number>;
}

const UNREPORTED = "State not reported by Google";

/** Counts one run. Unresolved URLs are excluded from indexed and not-indexed. */
export function aggregateCoverage(rows: UrlCoverage[]): CoverageAggregate {
  const breakdown: Record<string, number> = {};
  let indexedCount = 0;
  let notIndexedCount = 0;
  let unresolvedCount = 0;

  for (const row of rows) {
    if (row.state === "unresolved") {
      unresolvedCount += 1;
      continue;
    }
    if (row.state === "indexed") indexedCount += 1;
    else notIndexedCount += 1;
    const key = row.coverageState ?? UNREPORTED;
    breakdown[key] = (breakdown[key] ?? 0) + 1;
  }

  return { checkedCount: rows.length, indexedCount, notIndexedCount, unresolvedCount, breakdown };
}

export interface RunCompleteness {
  isComplete: boolean;
  /** Plain reason a run is not a comparable full-site snapshot, else null. */
  incompleteReason: string | null;
}

/**
 * A run is a comparable full-site snapshot only when every monitored URL was
 * inspected and every one of them returned a usable answer.
 */
export function runCompleteness(
  monitoredCount: number,
  totals: Pick<CoverageAggregate, "checkedCount" | "unresolvedCount">,
): RunCompleteness {
  if (monitoredCount <= 0) {
    return { isComplete: false, incompleteReason: "No monitored URLs to inspect." };
  }
  if (totals.checkedCount < monitoredCount) {
    return {
      isComplete: false,
      incompleteReason: `Only ${totals.checkedCount} of ${monitoredCount} monitored URLs were inspected.`,
    };
  }
  if (totals.unresolvedCount > 0) {
    return {
      isComplete: false,
      incompleteReason: `${totals.unresolvedCount} of ${monitoredCount} URLs could not be resolved, so this run is not comparable.`,
    };
  }
  return { isComplete: true, incompleteReason: null };
}

export interface CoverageSnapshotRow {
  captured_at: string;
  checked_count: number;
  indexed_count: number;
  not_indexed_count: number;
  unresolved_count?: number | null;
  monitored_count?: number | null;
  is_complete?: boolean | null;
  incomplete_reason?: string | null;
  breakdown: Record<string, number> | null;
}

export interface CoveragePoint {
  capturedAt: string;
  indexedCount: number;
  checkedCount: number;
  monitoredCount: number;
  /** Change against the previous chronological full-site snapshot. */
  delta: number | null;
}

export type CoverageDirection = "increasing" | "flat" | "decreasing" | "insufficient_data";

export interface CoverageTrend {
  /** Complete, comparable full-site snapshots only, oldest first. */
  points: CoveragePoint[];
  direction: CoverageDirection;
  netChange: number | null;
  /** Stored runs excluded from the trend because they were partial. */
  excludedPartialRuns: number;
}

/**
 * Oldest-first indexed-URL trend across full-site snapshots.
 *
 * Partial runs are dropped: their indexed counts cover a different URL set and
 * comparing them would fabricate growth or loss that never happened.
 */
export function coverageTrend(rows: CoverageSnapshotRow[]): CoverageTrend {
  const complete = rows.filter((row) => row.is_complete === true);
  const sorted = [...complete].sort(
    (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime(),
  );
  const points: CoveragePoint[] = sorted.map((row, i) => ({
    capturedAt: row.captured_at,
    indexedCount: row.indexed_count,
    checkedCount: row.checked_count,
    monitoredCount: row.monitored_count ?? row.checked_count,
    delta: i === 0 ? null : row.indexed_count - sorted[i - 1]!.indexed_count,
  }));

  const first = points[0] ?? null;
  const last = points.at(-1) ?? null;
  const netChange =
    first && last && points.length > 1 ? last.indexedCount - first.indexedCount : null;

  let direction: CoverageDirection = "insufficient_data";
  if (netChange !== null) {
    direction = netChange > 0 ? "increasing" : netChange < 0 ? "decreasing" : "flat";
  }

  return {
    points,
    direction,
    netChange,
    excludedPartialRuns: rows.length - complete.length,
  };
}

/** Share of resolved URLs Google has indexed, to one decimal place. */
export function coveragePercent(indexed: number, resolved: number): number | null {
  if (resolved <= 0) return null;
  return Math.round((indexed / resolved) * 1000) / 10;
}

/**
 * The monitored set: exactly the canonical, indexable production URLs in the
 * live sitemap registry, deduplicated and absolute.
 *
 * Derived from `sitemapEntries()` so every existing exclusion (`/internal`,
 * `/api`, `/newsletter`, `/search`, non-canonical aliases, `$param` routes)
 * applies here automatically and cannot drift from what Google was given.
 */
export function monitoredCoverageUrls(baseUrl: string = SITEMAP_BASE_URL): string[] {
  const seen = new Set<string>();
  for (const path of sitemapPaths()) {
    if (!isSitemapEligiblePath(path)) continue;
    seen.add(`${baseUrl}${path}`);
  }
  return [...seen];
}
