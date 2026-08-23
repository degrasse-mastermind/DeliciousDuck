/**
 * Server-only coverage capture: real per-URL index status.
 *
 * Reads Google's index through the URL Inspection API via the connector
 * gateway. It is a READ: it never requests indexing, a re-crawl, or a live
 * test, and it never resubmits the sitemap. It complements Search Console's
 * Pages/Indexing report rather than reproducing that report's dataset.
 *
 * Every run inspects the complete monitored set — the canonical, indexable
 * production URLs in the live sitemap registry — so successive snapshots cover
 * the same URLs and their indexed counts are genuinely comparable. A run that
 * cannot resolve every URL is stored as partial for diagnostics and excluded
 * from the site-wide growth trend.
 *
 * The property is always resolved from a live `GET /webmasters/v3/sites` call,
 * never hardcoded or derived from the target URL. Credentials are read from the
 * environment inside the handlers and are never returned or logged.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveMonitoredProperty, gatewayRequest } from "./indexing-monitor.server";
import {
  aggregateCoverage,
  coveragePercent,
  coverageTrend,
  monitoredCoverageUrls,
  normalizeInspection,
  runCompleteness,
  unresolvedCoverage,
  type CoverageSnapshotRow,
  type CoverageTrend,
  type IndexState,
  type UrlCoverage,
} from "./indexing-coverage";

/**
 * Requests in flight at once. The monitored set is ~70 URLs against a daily
 * per-property quota an order of magnitude larger, so the whole site fits in one
 * run; concurrency stays low to sit well under the per-minute ceiling.
 */
const CONCURRENCY = 4;

async function inspectUrl(siteUrl: string, url: string): Promise<UrlCoverage> {
  try {
    const raw = await gatewayRequest("/v1/urlInspection/index:inspect", {
      method: "POST",
      body: { inspectionUrl: url, siteUrl },
    });
    return normalizeInspection(url, raw);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "inspection_failed";
    return unresolvedCoverage(url, reason);
  }
}

export type CoverageCaptureResult =
  | {
      status: "ok";
      siteUrl: string;
      monitored: number;
      checked: number;
      indexed: number;
      notIndexed: number;
      unresolved: number;
      /** True only when this run is a comparable full-site snapshot. */
      isComplete: boolean;
      incompleteReason: string | null;
      breakdown: Record<string, number>;
    }
  | { status: "selection_required"; candidates: string[] }
  | { status: "no_property" };

/** Inspects the complete monitored URL set and stores the run. */
export async function captureCoverageSnapshot(source: string): Promise<CoverageCaptureResult> {
  const resolution = await resolveMonitoredProperty();
  if (resolution.status !== "selected") return resolution;
  const siteUrl = resolution.siteUrl;

  const monitored = monitoredCoverageUrls();
  if (monitored.length === 0) {
    return {
      status: "ok",
      siteUrl,
      monitored: 0,
      checked: 0,
      indexed: 0,
      notIndexed: 0,
      unresolved: 0,
      isComplete: false,
      incompleteReason: "No monitored URLs to inspect.",
      breakdown: {},
    };
  }

  const rows: UrlCoverage[] = [];
  for (let i = 0; i < monitored.length; i += CONCURRENCY) {
    const slice = monitored.slice(i, i + CONCURRENCY);
    rows.push(...(await Promise.all(slice.map((url: string) => inspectUrl(siteUrl, url)))));
  }

  const totals = aggregateCoverage(rows);
  const { isComplete, incompleteReason } = runCompleteness(monitored.length, totals);

  const { data: inserted, error } = await supabaseAdmin
    .from("indexing_coverage_snapshots")
    .insert({
      site_url: siteUrl,
      source,
      monitored_count: monitored.length,
      checked_count: totals.checkedCount,
      indexed_count: totals.indexedCount,
      not_indexed_count: totals.notIndexedCount,
      unresolved_count: totals.unresolvedCount,
      // Legacy column retained for older rows; mirrors unresolved.
      failed_count: totals.unresolvedCount,
      is_complete: isComplete,
      incomplete_reason: incompleteReason,
      breakdown: totals.breakdown,
    })
    .select("id")
    .single();
  if (error || !inserted) {
    console.error(`[indexing] coverage snapshot insert failed: ${error?.message ?? "no row"}`);
    throw new Error("coverage_persist_failed");
  }

  const snapshotId = (inserted as { id: string }).id;

  // The aggregate must never outlive its evidence: if the per-URL rows do not
  // land, the snapshot is removed so no run can look complete without them.
  const { error: detailError } = await supabaseAdmin.from("indexing_url_coverage").insert(
    rows.map((row) => ({
      snapshot_id: snapshotId,
      site_url: siteUrl,
      url: row.url,
      index_state: row.state,
      is_indexed: row.state === "indexed",
      verdict: row.verdict,
      coverage_state: row.coverageState,
      robots_txt_state: row.robotsTxtState,
      indexing_state: row.indexingState,
      page_fetch_state: row.pageFetchState,
      google_canonical: row.googleCanonical,
      last_crawl_time: row.lastCrawlTime,
      inspect_error: row.inspectError,
    })),
  );
  if (detailError) {
    console.error(`[indexing] coverage detail insert failed: ${detailError.message}`);
    const { error: cleanupError } = await supabaseAdmin
      .from("indexing_coverage_snapshots")
      .delete()
      .eq("id", snapshotId);
    if (cleanupError) {
      console.error(`[indexing] coverage snapshot rollback failed: ${cleanupError.message}`);
    }
    throw new Error("coverage_persist_failed");
  }

  return {
    status: "ok",
    siteUrl,
    monitored: monitored.length,
    checked: totals.checkedCount,
    indexed: totals.indexedCount,
    notIndexed: totals.notIndexedCount,
    unresolved: totals.unresolvedCount,
    isComplete,
    incompleteReason,
    breakdown: totals.breakdown,
  };
}

export interface CoverageUrlRow {
  url: string;
  state: IndexState;
  isIndexed: boolean;
  coverageState: string | null;
  lastCrawlTime: string | null;
  checkedAt: string;
  inspectError: string | null;
}

export interface CoverageReport {
  siteUrl: string | null;
  capturedAt: string | null;
  /** Captured_at of the newest comparable full-site snapshot, if any. */
  lastCompleteAt: string | null;
  lastRunWasComplete: boolean;
  lastIncompleteReason: string | null;
  totalMonitored: number;
  /** Latest known state per URL, across runs — the site-wide picture. */
  indexedCount: number;
  notIndexedCount: number;
  unresolvedCount: number;
  neverCheckedCount: number;
  coveragePercent: number | null;
  breakdown: Array<{ state: string; count: number }>;
  trend: CoverageTrend;
  notIndexedUrls: CoverageUrlRow[];
  unresolvedUrls: CoverageUrlRow[];
}

/** Stored history only — the dashboard never calls Google during a page view. */
export async function coverageReport(snapshotLimit = 60): Promise<CoverageReport> {
  const [{ data: snapshots, error: snapshotError }, { data: urlRows, error: urlError }] =
    await Promise.all([
      supabaseAdmin
        .from("indexing_coverage_snapshots")
        .select(
          "captured_at, site_url, monitored_count, checked_count, indexed_count, not_indexed_count, unresolved_count, is_complete, incomplete_reason, breakdown",
        )
        .order("captured_at", { ascending: false })
        .limit(snapshotLimit),
      supabaseAdmin
        .from("indexing_url_coverage")
        .select(
          "url, index_state, is_indexed, coverage_state, last_crawl_time, captured_at, inspect_error",
        )
        .order("captured_at", { ascending: false })
        .limit(4000),
    ]);

  if (snapshotError || urlError) {
    console.error(
      `[indexing] coverage read failed: ${snapshotError?.message ?? urlError?.message ?? "unknown"}`,
    );
    throw new Error("coverage_read_failed");
  }

  const rows = (snapshots ?? []) as Array<CoverageSnapshotRow & { site_url: string }>;
  const latest = rows[0] ?? null;
  const latestComplete = rows.find((row) => row.is_complete === true) ?? null;

  // Newest row per URL wins; the query is already newest-first.
  const latestByUrl = new Map<string, CoverageUrlRow>();
  for (const raw of (urlRows ?? []) as Array<{
    url: string;
    index_state: string | null;
    is_indexed: boolean;
    coverage_state: string | null;
    last_crawl_time: string | null;
    captured_at: string;
    inspect_error: string | null;
  }>) {
    if (latestByUrl.has(raw.url)) continue;
    const state: IndexState =
      raw.index_state === "indexed" || raw.index_state === "not_indexed"
        ? raw.index_state
        : raw.index_state === "unresolved"
          ? "unresolved"
          : raw.inspect_error
            ? "unresolved"
            : raw.is_indexed
              ? "indexed"
              : "unresolved";
    latestByUrl.set(raw.url, {
      url: raw.url,
      state,
      isIndexed: state === "indexed",
      coverageState: raw.coverage_state,
      lastCrawlTime: raw.last_crawl_time,
      checkedAt: raw.captured_at,
      inspectError: raw.inspect_error,
    });
  }

  const monitored = monitoredCoverageUrls();
  const checked = monitored
    .map((url: string) => latestByUrl.get(url))
    .filter(Boolean) as CoverageUrlRow[];
  const indexed = checked.filter((r) => r.state === "indexed");
  const notIndexed = checked.filter((r) => r.state === "not_indexed");
  const unresolved = checked.filter((r) => r.state === "unresolved");

  const breakdownTally = new Map<string, number>();
  for (const row of checked) {
    if (row.state === "unresolved") continue;
    const key = row.coverageState ?? "State not reported by Google";
    breakdownTally.set(key, (breakdownTally.get(key) ?? 0) + 1);
  }

  return {
    siteUrl: latest?.site_url ?? null,
    capturedAt: latest?.captured_at ?? null,
    lastCompleteAt: latestComplete?.captured_at ?? null,
    lastRunWasComplete: latest?.is_complete === true,
    lastIncompleteReason: latest?.is_complete === true ? null : (latest?.incomplete_reason ?? null),
    totalMonitored: monitored.length,
    indexedCount: indexed.length,
    notIndexedCount: notIndexed.length,
    unresolvedCount: unresolved.length,
    neverCheckedCount: monitored.length - checked.length,
    coveragePercent: coveragePercent(indexed.length, indexed.length + notIndexed.length),
    breakdown: [...breakdownTally.entries()]
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count),
    trend: coverageTrend(rows),
    notIndexedUrls: notIndexed.slice(0, 50),
    unresolvedUrls: unresolved.slice(0, 50),
  };
}
