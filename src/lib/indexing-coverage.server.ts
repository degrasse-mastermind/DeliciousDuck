/**
 * Server-only coverage capture: real indexing status per URL.
 *
 * Uses the URL Inspection API through the connector gateway, which reports the
 * state of Google's indexed version of a URL. It is a READ: it never requests
 * indexing, a re-crawl, or a live test, and it never resubmits the sitemap.
 *
 * The property is always resolved from a live `GET /webmasters/v3/sites` call,
 * never hardcoded or derived from the target URL. Credentials are read from the
 * environment inside the handlers and are never returned or logged.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sitemapPaths, SITEMAP_BASE_URL } from "./sitemap";
import { resolveMonitoredProperty, gatewayRequest } from "./indexing-monitor.server";
import {
  aggregateCoverage,
  coveragePercent,
  coverageTrend,
  failedInspection,
  normalizeInspection,
  selectInspectionBatch,
  type CoverageSnapshotRow,
  type CoverageTrend,
  type UrlCoverage,
} from "./indexing-coverage";

/**
 * URLs inspected per run. URL Inspection is quota-limited per property (a daily
 * cap plus a per-minute cap), so a run checks a bounded slice and later runs
 * rotate through the rest of the site.
 */
export const COVERAGE_BATCH_LIMIT = 40;

/** Requests in flight at once — well under the per-minute ceiling. */
const CONCURRENCY = 4;

function monitoredUrls(): string[] {
  return sitemapPaths().map((path) => `${SITEMAP_BASE_URL}${path}`);
}

async function inspectUrl(siteUrl: string, url: string): Promise<UrlCoverage> {
  try {
    const raw = await gatewayRequest("/v1/urlInspection/index:inspect", {
      method: "POST",
      body: { inspectionUrl: url, siteUrl },
    });
    return normalizeInspection(url, raw);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "inspection_failed";
    return failedInspection(url, reason);
  }
}

/** Where the next run should start, so runs rotate over the whole site. */
async function nextOffset(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("indexing_coverage_snapshots")
    .select("checked_count")
    .order("captured_at", { ascending: false })
    .limit(200);
  const checkedSoFar = (data ?? []).reduce(
    (sum, row) => sum + ((row as { checked_count: number }).checked_count ?? 0),
    0,
  );
  const total = monitoredUrls().length;
  return total === 0 ? 0 : checkedSoFar % total;
}

export type CoverageCaptureResult =
  | {
      status: "ok";
      siteUrl: string;
      checked: number;
      indexed: number;
      notIndexed: number;
      failed: number;
      breakdown: Record<string, number>;
    }
  | { status: "selection_required"; candidates: string[] }
  | { status: "no_property" };

/** Inspects one rotating batch of site URLs and stores the results. */
export async function captureCoverageSnapshot(source: string): Promise<CoverageCaptureResult> {
  const resolution = await resolveMonitoredProperty();
  if (resolution.status !== "selected") return resolution;
  const siteUrl = resolution.siteUrl;

  const { batch } = selectInspectionBatch(
    monitoredUrls(),
    COVERAGE_BATCH_LIMIT,
    await nextOffset(),
  );
  if (batch.length === 0) {
    return { status: "ok", siteUrl, checked: 0, indexed: 0, notIndexed: 0, failed: 0, breakdown: {} };
  }

  const rows: UrlCoverage[] = [];
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const slice = batch.slice(i, i + CONCURRENCY);
    rows.push(...(await Promise.all(slice.map((url) => inspectUrl(siteUrl, url)))));
  }

  const totals = aggregateCoverage(rows);

  const { data: inserted, error } = await supabaseAdmin
    .from("indexing_coverage_snapshots")
    .insert({
      site_url: siteUrl,
      source,
      checked_count: totals.checkedCount,
      indexed_count: totals.indexedCount,
      not_indexed_count: totals.notIndexedCount,
      failed_count: totals.failedCount,
      breakdown: totals.breakdown,
    })
    .select("id")
    .single();
  if (error || !inserted) {
    console.error(`[indexing] coverage snapshot insert failed: ${error?.message ?? "no row"}`);
    throw new Error("coverage_persist_failed");
  }

  const snapshotId = (inserted as { id: string }).id;
  const { error: detailError } = await supabaseAdmin.from("indexing_url_coverage").insert(
    rows.map((row) => ({
      snapshot_id: snapshotId,
      site_url: siteUrl,
      url: row.url,
      is_indexed: row.isIndexed,
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
  }

  return {
    status: "ok",
    siteUrl,
    checked: totals.checkedCount,
    indexed: totals.indexedCount,
    notIndexed: totals.notIndexedCount,
    failed: totals.failedCount,
    breakdown: totals.breakdown,
  };
}

export interface CoverageUrlRow {
  url: string;
  isIndexed: boolean;
  coverageState: string | null;
  lastCrawlTime: string | null;
  checkedAt: string;
  inspectError: string | null;
}

export interface CoverageReport {
  siteUrl: string | null;
  capturedAt: string | null;
  totalMonitored: number;
  /** Latest known state per URL, across snapshots — the site-wide picture. */
  indexedCount: number;
  notIndexedCount: number;
  neverCheckedCount: number;
  coveragePercent: number | null;
  breakdown: Array<{ state: string; count: number }>;
  trend: CoverageTrend;
  notIndexedUrls: CoverageUrlRow[];
}

/** Stored history only — the dashboard never calls Google during a page view. */
export async function coverageReport(snapshotLimit = 60): Promise<CoverageReport> {
  const [{ data: snapshots, error: snapshotError }, { data: urlRows, error: urlError }] =
    await Promise.all([
      supabaseAdmin
        .from("indexing_coverage_snapshots")
        .select(
          "captured_at, site_url, checked_count, indexed_count, not_indexed_count, failed_count, breakdown",
        )
        .order("captured_at", { ascending: false })
        .limit(snapshotLimit),
      supabaseAdmin
        .from("indexing_url_coverage")
        .select("url, is_indexed, coverage_state, last_crawl_time, captured_at, inspect_error")
        .order("captured_at", { ascending: false })
        .limit(2000),
    ]);

  if (snapshotError || urlError) {
    console.error(
      `[indexing] coverage read failed: ${snapshotError?.message ?? urlError?.message ?? "unknown"}`,
    );
    throw new Error("coverage_read_failed");
  }

  const rows = (snapshots ?? []) as Array<CoverageSnapshotRow & { site_url: string }>;
  const latest = rows[0] ?? null;

  // Newest row per URL wins; the query is already newest-first.
  const latestByUrl = new Map<string, CoverageUrlRow>();
  for (const raw of (urlRows ?? []) as Array<{
    url: string;
    is_indexed: boolean;
    coverage_state: string | null;
    last_crawl_time: string | null;
    captured_at: string;
    inspect_error: string | null;
  }>) {
    if (latestByUrl.has(raw.url)) continue;
    latestByUrl.set(raw.url, {
      url: raw.url,
      isIndexed: raw.is_indexed,
      coverageState: raw.coverage_state,
      lastCrawlTime: raw.last_crawl_time,
      checkedAt: raw.captured_at,
      inspectError: raw.inspect_error,
    });
  }

  const monitored = monitoredUrls();
  const checked = monitored.map((url) => latestByUrl.get(url)).filter(Boolean) as CoverageUrlRow[];
  const indexedCount = checked.filter((r) => r.isIndexed && !r.inspectError).length;
  const notIndexed = checked.filter((r) => !r.isIndexed && !r.inspectError);

  const breakdownTally = new Map<string, number>();
  for (const row of checked) {
    if (row.inspectError) continue;
    const key = row.coverageState ?? "State not reported by Google";
    breakdownTally.set(key, (breakdownTally.get(key) ?? 0) + 1);
  }

  return {
    siteUrl: latest?.site_url ?? null,
    capturedAt: latest?.captured_at ?? null,
    totalMonitored: monitored.length,
    indexedCount,
    notIndexedCount: notIndexed.length,
    neverCheckedCount: monitored.length - checked.length,
    coveragePercent: coveragePercent(indexedCount, checked.length),
    breakdown: [...breakdownTally.entries()]
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count),
    trend: coverageTrend(rows),
    notIndexedUrls: notIndexed.slice(0, 50),
  };
}
