import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { captureIndexingSnapshotFn, indexingReportFn } from "@/lib/indexing.functions";

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

type Report = Awaited<ReturnType<typeof indexingReportFn>>;

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
  const [state, setState] = useState<"idle" | "loading" | "capturing" | "error">("idle");
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    if (!token.trim()) return;
    setState("loading");
    setNotice(null);
    try {
      setReport(await indexingReportFn({ data: { token: token.trim() } }));
      setState("idle");
    } catch {
      setReport(null);
      setState("error");
    }
  }

  async function captureNow() {
    if (!token.trim()) return;
    setState("capturing");
    setNotice(null);
    try {
      const result = await captureIndexingSnapshotFn({ data: { token: token.trim() } });
      setReport(result.report);
      setNotice(
        result.capture.status === "ok"
          ? "Snapshot recorded."
          : result.capture.status === "selection_required"
            ? `Several verified properties cover this site (${result.capture.candidates.join(", ")}). Pick one before monitoring can continue.`
            : "No verified Search Console property covers this site.",
      );
      setState("idle");
    } catch {
      setState("error");
    }
  }

  const trend = report?.trend;
  const recent = trend ? [...trend.points].reverse().slice(0, 14) : [];

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
            NEWSLETTER_ADMIN_TOKEN from the project&apos;s secrets. Not stored in the browser.
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
          onClick={captureNow}
          disabled={state === "loading" || state === "capturing"}
          className="rounded-sm border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {state === "capturing" ? "Checking…" : "Check now"}
        </button>
      </div>

      {state === "error" && (
        <p role="status" className="mt-4 text-sm text-destructive">
          That request failed. Check the token, and that the Search Console connection is still
          linked.
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm text-foreground">
          {notice}
        </p>
      )}

      {report && (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Indexed URLs"
              value={trend?.latestIndexed === null ? "—" : String(trend?.latestIndexed)}
              hint={
                trend?.coverage === null
                  ? undefined
                  : `${trend?.coverage}% of ${trend?.latestSubmitted} submitted`
              }
            />
            <Stat
              label="Trend"
              value={
                trend?.direction === "insufficient_data"
                  ? "Need 2+ snapshots"
                  : `${(trend?.netChange ?? 0) > 0 ? "+" : ""}${trend?.netChange} (${trend?.direction})`
              }
              hint="Net change across the stored window"
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

          <h2 className="mt-10 text-lg font-semibold text-foreground">Indexed count over time</h2>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No snapshots recorded yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th scope="col" className="py-2">Snapshot</th>
                    <th scope="col" className="py-2">Indexed</th>
                    <th scope="col" className="py-2">Change</th>
                    <th scope="col" className="py-2">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((point) => (
                    <tr key={point.capturedAt} className="border-b border-border/60">
                      <td className="py-2 text-muted-foreground">{when(point.capturedAt)}</td>
                      <td className="py-2 font-semibold text-foreground">{point.indexedCount}</td>
                      <td className="py-2 text-muted-foreground">
                        {point.delta === null ? "—" : `${point.delta > 0 ? "+" : ""}${point.delta}`}
                      </td>
                      <td className="py-2 text-muted-foreground">{point.submittedCount}</td>
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
    </div>
  );
}
