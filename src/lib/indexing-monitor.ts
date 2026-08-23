/**
 * Pure indexing-monitor logic.
 *
 * Everything here is deterministic and free of network / database access so the
 * Search Console contract can be unit-tested: property resolution, sitemap
 * status normalisation, processing-completion classification, and the indexed
 * count trend the internal dashboard renders.
 *
 * Deliberate limits:
 * - `errors` / `warnings` from Search Console are COUNTS, not causes. We never
 *   invent a reason for them; the dashboard reports the count and says the
 *   cause is not exposed by the API.
 * - A property is only ever used when Google itself returned it as verified.
 */

import { SITE } from "@/data/site";

/** Sitemap we monitor. */
export const MONITORED_SITEMAP_URL = `${SITE.url}/sitemap.xml`;
/** Target the property must cover. */
export const MONITORED_SITE_URL = `${SITE.url}/`;

export interface SiteEntry {
  siteUrl: string;
  permissionLevel?: string;
}

export type SiteResolution =
  | { status: "selected"; siteUrl: string }
  | { status: "selection_required"; candidates: string[] }
  | { status: "no_property" };

/** URL-prefix properties are scheme/host/path specific; domain properties cover subdomains. */
export function coversTarget(siteUrl: string, targetUrl: string): boolean {
  let target: URL;
  try {
    target = new URL(targetUrl);
  } catch {
    return false;
  }
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase();
    const host = target.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  }
  try {
    return target.href.startsWith(new URL(siteUrl).href);
  } catch {
    return false;
  }
}

/**
 * Picks the property to read.
 *
 * Unverified entries are discarded. When several verified properties cover the
 * target we prefer the exact root URL-prefix (the property the sitemap was
 * submitted to); otherwise the caller must choose, and we never guess.
 */
export function resolveSiteUrl(
  entries: SiteEntry[],
  targetUrl: string = MONITORED_SITE_URL,
): SiteResolution {
  const matches = entries.filter(
    (e) => e.permissionLevel !== "siteUnverifiedUser" && coversTarget(e.siteUrl, targetUrl),
  );
  if (matches.length === 0) return { status: "no_property" };
  const exactRoot = matches.find((e) => e.siteUrl === targetUrl);
  if (exactRoot) return { status: "selected", siteUrl: exactRoot.siteUrl };
  if (matches.length === 1) return { status: "selected", siteUrl: matches[0]!.siteUrl };
  return { status: "selection_required", candidates: matches.map((e) => e.siteUrl) };
}

export interface SitemapSnapshot {
  siteUrl: string;
  sitemapUrl: string;
  lastSubmitted: string | null;
  lastDownloaded: string | null;
  isPending: boolean;
  submittedCount: number;
  indexedCount: number;
  errorCount: number;
  warningCount: number;
}

function toInt(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function toIso(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Search Console reports web/image/video content buckets; we sum them. */
export function normalizeSitemapStatus(
  raw: unknown,
  fallback: { siteUrl: string; sitemapUrl: string },
): SitemapSnapshot {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const contents = Array.isArray(obj["contents"])
    ? (obj["contents"] as Array<Record<string, unknown>>)
    : [];
  return {
    siteUrl: fallback.siteUrl,
    sitemapUrl: typeof obj["path"] === "string" ? obj["path"] : fallback.sitemapUrl,
    lastSubmitted: toIso(obj["lastSubmitted"]),
    lastDownloaded: toIso(obj["lastDownloaded"]),
    isPending: obj["isPending"] === true,
    submittedCount: contents.reduce((sum, c) => sum + toInt(c["submitted"]), 0),
    indexedCount: contents.reduce((sum, c) => sum + toInt(c["indexed"]), 0),
    errorCount: toInt(obj["errors"]),
    warningCount: toInt(obj["warnings"]),
  };
}

export type ProcessingState = "processing" | "processed" | "unknown";

/**
 * Processing is complete only when Google says it is no longer pending AND it
 * downloaded the file at or after the moment we last submitted it. A download
 * older than the submission is a stale read, not a completed one.
 */
export function processingState(snapshot: SitemapSnapshot): ProcessingState {
  if (snapshot.isPending) return "processing";
  if (!snapshot.lastDownloaded) return "unknown";
  if (!snapshot.lastSubmitted) return "processed";
  return new Date(snapshot.lastDownloaded) >= new Date(snapshot.lastSubmitted)
    ? "processed"
    : "processing";
}

export interface SnapshotRow {
  captured_at: string;
  indexed_count: number;
  submitted_count: number;
  error_count: number;
  warning_count: number;
  is_pending: boolean;
  last_submitted: string | null;
  last_downloaded: string | null;
}

export interface TrendPoint {
  capturedAt: string;
  indexedCount: number;
  submittedCount: number;
  /** Change against the previous chronological snapshot, or null for the first. */
  delta: number | null;
}

export type TrendDirection = "increasing" | "flat" | "decreasing" | "insufficient_data";

export interface IndexedTrend {
  points: TrendPoint[];
  direction: TrendDirection;
  latestIndexed: number | null;
  latestSubmitted: number | null;
  /** Net change from the first to the most recent snapshot in the window. */
  netChange: number | null;
  coverage: number | null;
}

/** Oldest-first trend with per-snapshot deltas and an overall direction. */
export function indexedTrend(rows: SnapshotRow[]): IndexedTrend {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime(),
  );
  const points: TrendPoint[] = sorted.map((row, i) => ({
    capturedAt: row.captured_at,
    indexedCount: row.indexed_count,
    submittedCount: row.submitted_count,
    delta: i === 0 ? null : row.indexed_count - sorted[i - 1]!.indexed_count,
  }));

  const last = points.at(-1) ?? null;
  const first = points[0] ?? null;
  const netChange = last && first && points.length > 1 ? last.indexedCount - first.indexedCount : null;

  let direction: TrendDirection = "insufficient_data";
  if (netChange !== null) direction = netChange > 0 ? "increasing" : netChange < 0 ? "decreasing" : "flat";

  return {
    points,
    direction,
    latestIndexed: last?.indexedCount ?? null,
    latestSubmitted: last?.submittedCount ?? null,
    netChange,
    coverage:
      last && last.submittedCount > 0
        ? Math.round((last.indexedCount / last.submittedCount) * 1000) / 10
        : null,
  };
}

/** Constant-time-ish bearer token comparison for the cron endpoint. */
export function authorizeCronRequest(
  header: string | null,
  expected: string | undefined,
): boolean {
  if (!expected) return false;
  const provided = header?.startsWith("Bearer ") ? header.slice(7) : header;
  if (!provided || provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/* ------------------------------------------------------------------ *
 * Token audience + scheduled-run diagnostics
 * ------------------------------------------------------------------ */

/** Which secret a supplied internal token matched. */
export type TokenAudience = "admin" | "cron";

export interface ConfiguredTokens {
  admin?: string | undefined;
  cron?: string | undefined;
  /** Rotating token stored in the database, sent by the scheduled job. */
  rotating?: string | undefined;
}

/** Constant-time-ish equality; false for empty/unset expectations. */
export function tokensMatch(provided: string, expected: string | undefined): boolean {
  if (!expected || !provided || provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * The internal indexing page accepts either owner secret, so the cron token
 * never has to be duplicated into a second secret just to read the dashboard.
 * Returns which one matched, or null when neither did.
 */
export function resolveTokenAudience(
  token: string,
  configured: ConfiguredTokens,
): TokenAudience | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  if (tokensMatch(trimmed, configured.admin)) return "admin";
  if (tokensMatch(trimmed, configured.cron) || tokensMatch(trimmed, configured.rotating)) {
    return "cron";
  }
  return null;
}

/** Bearer-header form of the same check, for the scheduled + diagnostics endpoints. */
export function bearerToken(header: string | null): string {
  if (!header) return "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : header.trim();
}

export interface ScheduledRunInputs {
  /** INDEXING_CRON_TOKEN present in the environment. */
  envTokenConfigured: boolean;
  /** A rotating token row exists in the database. */
  rotatingTokenConfigured: boolean;
  /** Search Console connector credentials present. */
  searchConsoleConfigured: boolean;
  /** Newest snapshot written by the scheduled job, if any. */
  lastCronSnapshotAt: string | null;
  now: Date;
}

export type ScheduledRunStatus = "ready" | "blocked" | "stale";

export interface ScheduledRunVerdict {
  status: ScheduledRunStatus;
  /** Plain-language reasons; safe to render — never contains token values. */
  findings: string[];
  hoursSinceLastRun: number | null;
}

/** Hours after which a daily job that has run before is considered stale. */
export const STALE_RUN_HOURS = 30;

/**
 * Would the next scheduled run succeed? Answers from configuration presence and
 * the recency of the last cron-written snapshot — no token values are revealed.
 */
export function scheduledRunVerdict(input: ScheduledRunInputs): ScheduledRunVerdict {
  const findings: string[] = [];
  const hoursSinceLastRun =
    input.lastCronSnapshotAt === null
      ? null
      : Math.max(
          0,
          Math.round(
            ((input.now.getTime() - new Date(input.lastCronSnapshotAt).getTime()) / 3_600_000) * 10,
          ) / 10,
        );

  if (!input.envTokenConfigured && !input.rotatingTokenConfigured) {
    findings.push(
      "No indexing token is configured, so the scheduled request cannot authenticate.",
    );
  }
  if (input.rotatingTokenConfigured) {
    findings.push("The scheduled job reads its token from the database, so rotation needs no SQL edit.");
  } else if (input.envTokenConfigured) {
    findings.push(
      "The scheduled job is still using the INDEXING_CRON_TOKEN secret. Rotate to a database-held token to stop copying values into SQL.",
    );
  }
  if (!input.searchConsoleConfigured) {
    findings.push("The Search Console connection is not linked, so a run would fail before writing a snapshot.");
  }

  let status: ScheduledRunStatus = "ready";
  if ((!input.envTokenConfigured && !input.rotatingTokenConfigured) || !input.searchConsoleConfigured) {
    status = "blocked";
  } else if (hoursSinceLastRun !== null && hoursSinceLastRun > STALE_RUN_HOURS) {
    status = "stale";
    findings.push(
      `The last scheduled snapshot is ${hoursSinceLastRun} hours old, so recent runs are not landing.`,
    );
  } else if (hoursSinceLastRun === null) {
    findings.push("No scheduled snapshot has been recorded yet — expected until the first run after publishing.");
  }

  return { status, findings, hoursSinceLastRun };
}
