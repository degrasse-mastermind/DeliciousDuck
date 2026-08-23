/**
 * Server-only Search Console reads and snapshot persistence.
 *
 * The connector gateway is the only path to Google: `LOVABLE_API_KEY`
 * authenticates us to the gateway and `GOOGLE_SEARCH_CONSOLE_API_KEY` tells it
 * which connection's OAuth token to forward. Neither value is ever returned,
 * logged, or exposed to the browser.
 *
 * The property is always resolved from a live `GET /webmasters/v3/sites` call —
 * never hardcoded — and only exactly the value Google returned is used in the
 * per-site path.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  MONITORED_SITEMAP_URL,
  MONITORED_SITE_URL,
  indexedTrend,
  normalizeSitemapStatus,
  processingState,
  resolveSiteUrl,
  type IndexedTrend,
  type SiteEntry,
  type SitemapSnapshot,
  type SnapshotRow,
} from "./indexing-monitor";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

function gatewayHeaders(): Record<string, string> {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const connectionApiKey = process.env["GOOGLE_SEARCH_CONSOLE_API_KEY"];
  if (!lovableApiKey || !connectionApiKey) {
    throw new Error("search_console_not_configured");
  }
  return {
    Authorization: `Bearer ${lovableApiKey}`,
    "X-Connection-Api-Key": connectionApiKey,
  };
}

async function gatewayGet(path: string): Promise<unknown> {
  const res = await fetch(`${GATEWAY}${path}`, { headers: gatewayHeaders() });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[indexing] Search Console request failed [${res.status}]: ${body}`);
    throw new Error(`search_console_request_failed_${res.status}`);
  }
  return await res.json();
}

async function listVerifiedProperties(): Promise<SiteEntry[]> {
  const json = (await gatewayGet("/webmasters/v3/sites")) as { siteEntry?: SiteEntry[] };
  return json.siteEntry ?? [];
}

export type CaptureResult =
  | { status: "ok"; snapshot: SitemapSnapshot; processing: ReturnType<typeof processingState> }
  | { status: "selection_required"; candidates: string[] }
  | { status: "no_property" };

/**
 * Reads the live sitemap status and appends one snapshot row.
 *
 * Read-only against Google: the sitemap is NOT resubmitted, because monitoring
 * must not mutate Search Console state.
 */
export async function captureIndexingSnapshot(source: string): Promise<CaptureResult> {
  const resolution = resolveSiteUrl(await listVerifiedProperties(), MONITORED_SITE_URL);
  if (resolution.status !== "selected") return resolution;

  const raw = await gatewayGet(
    `/webmasters/v3/sites/${encodeURIComponent(resolution.siteUrl)}/sitemaps/${encodeURIComponent(
      MONITORED_SITEMAP_URL,
    )}`,
  );
  const snapshot = normalizeSitemapStatus(raw, {
    siteUrl: resolution.siteUrl,
    sitemapUrl: MONITORED_SITEMAP_URL,
  });

  const { error } = await supabaseAdmin.from("indexing_snapshots").insert({
    site_url: snapshot.siteUrl,
    sitemap_url: snapshot.sitemapUrl,
    last_submitted: snapshot.lastSubmitted,
    last_downloaded: snapshot.lastDownloaded,
    is_pending: snapshot.isPending,
    submitted_count: snapshot.submittedCount,
    indexed_count: snapshot.indexedCount,
    error_count: snapshot.errorCount,
    warning_count: snapshot.warningCount,
    source,
  });
  if (error) {
    console.error(`[indexing] snapshot insert failed: ${error.message}`);
    throw new Error("snapshot_persist_failed");
  }

  return { status: "ok", snapshot, processing: processingState(snapshot) };
}

export interface IndexingReport {
  sitemapUrl: string;
  siteUrl: string | null;
  capturedAt: string | null;
  processing: "processing" | "processed" | "unknown" | "no_data";
  lastSubmitted: string | null;
  lastDownloaded: string | null;
  errorCount: number;
  warningCount: number;
  trend: IndexedTrend;
}

/** Stored history only — the dashboard never calls Google during a page view. */
export async function indexingReport(limit = 60): Promise<IndexingReport> {
  const { data, error } = await supabaseAdmin
    .from("indexing_snapshots")
    .select(
      "captured_at, site_url, sitemap_url, indexed_count, submitted_count, error_count, warning_count, is_pending, last_submitted, last_downloaded",
    )
    .eq("sitemap_url", MONITORED_SITEMAP_URL)
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error(`[indexing] snapshot read failed: ${error.message}`);
    throw new Error("snapshot_read_failed");
  }

  const rows = (data ?? []) as Array<SnapshotRow & { site_url: string }>;
  const latest = rows[0] ?? null;

  return {
    sitemapUrl: MONITORED_SITEMAP_URL,
    siteUrl: latest?.site_url ?? null,
    capturedAt: latest?.captured_at ?? null,
    processing: latest
      ? processingState({
          siteUrl: latest.site_url,
          sitemapUrl: MONITORED_SITEMAP_URL,
          lastSubmitted: latest.last_submitted,
          lastDownloaded: latest.last_downloaded,
          isPending: latest.is_pending,
          submittedCount: latest.submitted_count,
          indexedCount: latest.indexed_count,
          errorCount: latest.error_count,
          warningCount: latest.warning_count,
        })
      : "no_data",
    lastSubmitted: latest?.last_submitted ?? null,
    lastDownloaded: latest?.last_downloaded ?? null,
    errorCount: latest?.error_count ?? 0,
    warningCount: latest?.warning_count ?? 0,
    trend: indexedTrend(rows),
  };
}
