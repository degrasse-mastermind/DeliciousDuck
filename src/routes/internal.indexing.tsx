import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  captureCoverageFn,
  captureIndexingSnapshotFn,
  coverageReportFn,
  indexingDiagnosticsFn,
  indexingReportFn,
  rotateIndexingCronTokenFn,
} from "@/lib/indexing.functions";





/**
 * Internal indexing monitor — owner tool, not site content.
 *
 * noindex/nofollow, disallowed under /internal/ in robots.txt, excluded from the
 * sitemap and site search, and not linked from public navigation.
 *
 * Reads the stored snapshot history only: page views never call Search Console.
 * A scheduled POST to /api/public/indexing-snapshot appends the snapshots.
 */
export const Route = createFileRoute("/internal/indexing")({
  head: () => ({
    meta: [
      { title: "Indexing Monitor (internal) | DeliciousDuck" },
      {
        name: "description",
        content: "Internal Search Console indexing monitor for DeliciousDuck. Not public content.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: IndexingMonitor,
});

type Report = Extract<Awaited<ReturnType<typeof indexingReportFn>>, { ok: true }>["report"];
type Diagnostics = Extract<
  Awaited<ReturnType<typeof indexingDiagnosticsFn>>,
  { ok: true }
>["diagnostics"];
type Coverage = Extract<Awaited<ReturnType<typeof coverageReportFn>>, { ok: true }>["coverage"];



const AUDIENCE_LABEL: Record<"admin" | "cron", string> = {
  admin: "NEWSLETTER_ADMIN_TOKEN",
  cron: "the indexing job token",
};

const VERDICT_LABEL: Record<Diagnostics["scheduledRun"]["status"], string> = {
  ready: "The next scheduled run should succeed",
  stale: "Configured, but recent scheduled runs are not landing",
  blocked: "The next scheduled run would fail",
};

const PROCESSING_LABEL: Record<Report["processing"], string> = {
  processing: "Still processing — Google has not finished reading this submission",
  processed: "Processed — Google downloaded the sitemap at or after the last submission",
  unknown: "Not pending, but Google reports no download time yet",
  no_data: "No snapshots recorded yet",
};

function when(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
}) {
  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function IndexingMonitor() {
  const [token, setToken] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [state, setState] = useState<
    "idle" | "loading" | "capturing" | "inspecting" | "checking" | "rotating" | "denied" | "error"
  >("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);

  async function load() {
    if (!token.trim()) return;
    setState("loading");
    setNotice(null);
    try {
      const [sitemap, cover] = await Promise.all([
        indexingReportFn({ data: { token: token.trim() } }),
        coverageReportFn({ data: { token: token.trim() } }),
      ]);
      if (!sitemap.ok || !cover.ok) {
        setReport(null);
        setCoverage(null);
        setState("denied");
        return;
      }
      setReport(sitemap.report);
      setCoverage(cover.coverage);
      setState("idle");
    } catch {
      setReport(null);
      setState("error");
    }
  }

  /** Inspects the next rotating batch of URLs against Google's index. */
  async function checkCoverageNow() {
    if (!token.trim()) return;
    setState("inspecting");
    setNotice(null);
    try {
      const result = await captureCoverageFn({ data: { token: token.trim() } });
      if (!result.ok) {
        setState("denied");
        return;
      }
      setCoverage(result.coverage);
      const capture = result.capture;
      setNotice(
        capture.status === "ok"
          ? `Inspected ${capture.checked} of ${capture.monitored} sitemap URLs: ${capture.indexed} indexed, ${capture.notIndexed} not indexed${capture.unresolved > 0 ? `, ${capture.unresolved} unresolved` : ""}. ${
              capture.isComplete
                ? "Stored as a full-site snapshot, so it counts towards growth."
                : `Stored for diagnostics only — ${capture.incompleteReason ?? "the run did not cover the whole site"}`
            }`
          : capture.status === "selection_required"
            ? `Several verified properties cover this site (${capture.candidates.join(", ")}). Pick one before coverage can be read.`
            : "No verified Search Console property covers this site.",
      );

      setState("idle");
    } catch {
      setState("error");
    }
  }


  async function runDiagnostics() {
    if (!token.trim()) return;
    setState("checking");
    setNotice(null);
    try {
      const result = await indexingDiagnosticsFn({ data: { token: token.trim() } });
      if (!result.ok) {
        setDiagnostics(null);
        setState("denied");
        return;
      }
      setDiagnostics(result.diagnostics);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  async function rotateToken() {
    if (!token.trim()) return;
    setState("rotating");
    setNotice(null);
    try {
      const result = await rotateIndexingCronTokenFn({ data: { token: token.trim() } });
      if (!result.ok) {
        setState("denied");
        return;
      }
      setDiagnostics(result.diagnostics);
      setNotice(
        "Scheduled job token rotated. The schedule reads it from the database, so nothing needs pasting into SQL.",
      );
      setState("idle");
    } catch {
      setState("error");
    }
  }

  async function captureNow() {
    if (!token.trim()) return;
    setState("capturing");
    setNotice(null);
    try {
      const result = await captureIndexingSnapshotFn({ data: { token: token.trim() } });
      if (!result.ok) {
        setReport(null);
        setState("denied");
        return;
      }
      const capture = result.capture;
      setReport(result.report);
      setNotice(
        capture.status === "ok"
          ? "Snapshot recorded."
          : capture.status === "selection_required"
            ? `Several verified properties cover this site (${capture.candidates.join(", ")}). Pick one before monitoring can continue.`
            : "No verified Search Console property covers this site.",
      );
      setState("idle");
    } catch {
      setState("error");
    }
  }

  const trend = report?.trend;
  const recent = trend ? [...trend.points].reverse().slice(0, 14) : [];
  const coverageHistory = coverage ? [...coverage.trend.points].reverse().slice(0, 14) : [];


  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Internal tool
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        Indexing monitor
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Sitemap processing state and the indexed-URL trend for{" "}
        <code className="text-foreground">{report?.sitemapUrl ?? "/sitemap.xml"}</code>, read from
        stored snapshots. The scheduled job appends one snapshot per run; this page never calls
        Search Console while rendering.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-sm border border-border p-5">
        <label className="min-w-[16rem] flex-1">
          <span className="text-sm font-semibold text-foreground">Owner token</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Either NEWSLETTER_ADMIN_TOKEN or the indexing job token (INDEXING_CRON_TOKEN, or the
            rotating token stored in the database). Not stored in the browser.
          </span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-2 text-base text-foreground"
          />
        </label>
        <button
          onClick={load}
          disabled={state === "loading" || state === "capturing"}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {state === "loading" ? "Loading…" : "Load history"}
        </button>
        <button
          onClick={runDiagnostics}
          disabled={state === "loading" || state === "capturing" || state === "checking"}
          className="rounded-sm border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {state === "checking" ? "Verifying…" : "Verify token & schedule"}
        </button>
        <button
          onClick={captureNow}
          disabled={state === "loading" || state === "capturing"}
          className="rounded-sm border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {state === "capturing" ? "Checking…" : "Check sitemap now"}
        </button>
        <button
          onClick={checkCoverageNow}
          disabled={state === "loading" || state === "capturing" || state === "inspecting"}
          className="rounded-sm border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {state === "inspecting" ? "Inspecting…" : "Check coverage now"}
        </button>

      </div>

      {state === "denied" && (
        <div
          role="status"
          className="mt-4 rounded-sm border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <p className="font-semibold text-destructive">not_authorized — token not accepted</p>
          <p className="mt-1 text-foreground">
            This page accepts <strong>either</strong> of two owner tokens, so you never have to
            duplicate a secret:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <code className="text-foreground">NEWSLETTER_ADMIN_TOKEN</code> — full access,
              including rotating the scheduled job token.
            </li>
            <li>
              <code className="text-foreground">INDEXING_CRON_TOKEN</code> (or the rotating token
              currently stored for the schedule) — same dashboard access.
            </li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            If you rotated the scheduled job token here, the old value stops working immediately —
            use the current one or the admin token.
          </p>
        </div>
      )}
      {state === "error" && (
        <p role="status" className="mt-4 text-sm text-destructive">
          That request failed. Check that the Search Console connection is still linked.
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm text-foreground">
          {notice}
        </p>
      )}

      {diagnostics && (
        <section className="mt-6 rounded-sm border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">Token &amp; schedule check</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Authenticated with <strong className="text-foreground">{AUDIENCE_LABEL[diagnostics.authenticatedAs]}</strong>.
          </p>
          <p
            className={
              "mt-3 text-sm font-semibold " +
              (diagnostics.scheduledRun.status === "ready"
                ? "text-foreground"
                : "text-destructive")
            }
          >
            {VERDICT_LABEL[diagnostics.scheduledRun.status]}
          </p>
          {diagnostics.scheduledRun.findings.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {diagnostics.scheduledRun.findings.map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          )}
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-foreground">Secrets configured</dt>
              <dd className="text-muted-foreground">
                NEWSLETTER_ADMIN_TOKEN: {diagnostics.tokens.adminSecretConfigured ? "yes" : "no"} ·
                INDEXING_CRON_TOKEN: {diagnostics.tokens.cronSecretConfigured ? "yes" : "no"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Rotating schedule token</dt>
              <dd className="text-muted-foreground">
                {diagnostics.tokens.rotatingTokenConfigured
                  ? `In use — rotated ${when(diagnostics.tokens.rotatingTokenRotatedAt)}`
                  : "Not set up yet"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Search Console connection</dt>
              <dd className="text-muted-foreground">
                {diagnostics.searchConsoleConfigured ? "Linked" : "Not linked"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Last scheduled snapshot</dt>
              <dd className="text-muted-foreground">
                {when(diagnostics.lastScheduledSnapshotAt)}
                {diagnostics.scheduledRun.hoursSinceLastRun !== null &&
                  ` (${diagnostics.scheduledRun.hoursSinceLastRun}h ago)`}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={rotateToken}
              disabled={state === "rotating"}
              className="rounded-sm border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
            >
              {state === "rotating" ? "Rotating…" : "Rotate scheduled job token"}
            </button>
            <p className="text-xs text-muted-foreground">
              Mints a new random token in the database. The schedule reads it from there, so no SQL
              edit and no value to copy.
            </p>
          </div>
        </section>
      )}

      {report && (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="URLs submitted"
              value={trend?.latestSubmitted === null ? "—" : String(trend?.latestSubmitted)}
              hint="URLs Google read from the sitemap"
            />
            <Stat
              label="Indexed (API field)"
              value={trend?.latestIndexed === null ? "—" : String(trend?.latestIndexed)}
              hint="Google retired this field — it reports 0 for every sitemap. Use Search Console's Pages report for real coverage."
            />
            <Stat label="Errors" value={String(report.errorCount)} hint="Count only — Google does not expose the cause here" />
            <Stat label="Warnings" value={String(report.warningCount)} />
          </div>



          <dl className="mt-6 grid gap-3 rounded-sm border border-border p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-foreground">Processing state</dt>
              <dd className="text-muted-foreground">{PROCESSING_LABEL[report.processing]}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Property</dt>
              <dd className="text-muted-foreground">{report.siteUrl ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Last submitted to Google</dt>
              <dd className="text-muted-foreground">{when(report.lastSubmitted)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Last downloaded by Google</dt>
              <dd className="text-muted-foreground">{when(report.lastDownloaded)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Snapshot taken</dt>
              <dd className="text-muted-foreground">{when(report.capturedAt)}</dd>
            </div>
          </dl>

          <h2 className="mt-10 text-lg font-semibold text-foreground">Sitemap read history</h2>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No snapshots recorded yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[24rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th scope="col" className="py-2">Snapshot</th>
                    <th scope="col" className="py-2">URLs submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((point) => (
                    <tr key={point.capturedAt} className="border-b border-border/60">
                      <td className="py-2 text-muted-foreground">{when(point.capturedAt)}</td>
                      <td className="py-2 font-semibold text-foreground">{point.submittedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Search Console reports errors and warnings as counts without causes, so a non-zero
            count here means Google flagged something whose exact reason this API does not expose —
            open the sitemap report in Search Console to see it.
          </p>
        </>
      )}

      {coverage && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground">Indexing coverage (real)</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Per-URL indexing state read from Google&apos;s index with URL Inspection — the same
            signal behind the Pages report, and the one that actually tracks growth. Each run checks
            a rotating batch of up to {COVERAGE_BATCH_LIMIT} URLs to stay inside Google&apos;s
            inspection quota, so the site-wide picture fills in over consecutive runs. This is a
            read: nothing here requests indexing or a re-crawl.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Indexed URLs"
              value={String(coverage.indexedCount)}
              hint={
                coverage.coveragePercent === null
                  ? "No URLs checked yet"
                  : `${coverage.coveragePercent}% of the ${coverage.totalMonitored - coverage.neverCheckedCount} URLs checked so far`
              }
            />
            <Stat
              label="Not indexed"
              value={String(coverage.notIndexedCount)}
              hint="Checked, but Google's index does not hold them"
            />
            <Stat
              label="Not yet checked"
              value={String(coverage.neverCheckedCount)}
              hint={`Of ${coverage.totalMonitored} sitemap URLs`}
            />
            <Stat
              label="Growth"
              value={
                coverage.trend.direction === "insufficient_data"
                  ? "Need 2+ checks"
                  : `${(coverage.trend.netChange ?? 0) > 0 ? "+" : ""}${coverage.trend.netChange} (${coverage.trend.direction})`
              }
              hint="Indexed URLs per batch across the stored window"
            />
          </div>

          <dl className="mt-6 grid gap-3 rounded-sm border border-border p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-foreground">Property</dt>
              <dd className="text-muted-foreground">{coverage.siteUrl ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Last coverage check</dt>
              <dd className="text-muted-foreground">{when(coverage.capturedAt)}</dd>
            </div>
          </dl>

          <h3 className="mt-8 text-base font-semibold text-foreground">
            Google&apos;s coverage states
          </h3>
          {coverage.breakdown.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No URLs checked yet — run &ldquo;Check coverage now&rdquo;.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border/60 text-sm">
              {coverage.breakdown.map((row) => (
                <li key={row.state} className="flex items-center justify-between gap-4 py-2">
                  <span className="text-muted-foreground">{row.state}</span>
                  <span className="font-semibold text-foreground">{row.count}</span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-8 text-base font-semibold text-foreground">Not indexed yet</h3>
          {coverage.notIndexedUrls.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Every checked URL is in Google&apos;s index.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th scope="col" className="py-2">URL</th>
                    <th scope="col" className="py-2">Google&apos;s state</th>
                    <th scope="col" className="py-2">Last crawl</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.notIndexedUrls.map((row) => (
                    <tr key={row.url} className="border-b border-border/60">
                      <td className="py-2 text-foreground">
                        {row.url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                      </td>
                      <td className="py-2 text-muted-foreground">{row.coverageState ?? "—"}</td>
                      <td className="py-2 text-muted-foreground">{when(row.lastCrawlTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="mt-8 text-base font-semibold text-foreground">Indexed URLs over time</h3>
          {coverageHistory.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No coverage checks recorded yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th scope="col" className="py-2">Check</th>
                    <th scope="col" className="py-2">Indexed in batch</th>
                    <th scope="col" className="py-2">Change</th>
                    <th scope="col" className="py-2">URLs checked</th>
                  </tr>
                </thead>
                <tbody>
                  {coverageHistory.map((point) => (
                    <tr key={point.capturedAt} className="border-b border-border/60">
                      <td className="py-2 text-muted-foreground">{when(point.capturedAt)}</td>
                      <td className="py-2 font-semibold text-foreground">{point.indexedCount}</td>
                      <td className="py-2 text-muted-foreground">
                        {point.delta === null ? "—" : `${point.delta > 0 ? "+" : ""}${point.delta}`}
                      </td>
                      <td className="py-2 text-muted-foreground">{point.checkedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

    </div>
  );
}
