import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  COMMERCIAL_LINKS,
  COMMERCIAL_PLACEMENTS,
  auditCommercialLinks,
  destinationHost,
  isAffiliateActive,
  placementsForLink,
  relForLink,
  STALE_AFTER_MONTHS,
  type AuditIssue,
} from "@/data/commercial-links";
import { buildCommercialClickEvent } from "@/lib/commercial-events";

/**
 * Internal commercial-link QA route — development only.
 *
 * Rendered content is gated on `import.meta.env.DEV`, marked
 * noindex/nofollow/noarchive, disallowed under /internal/ in robots.txt, absent
 * from the sitemap, the site search index and every public navigation surface.
 *
 * The event preview builds the exact payload that would be sent and prints it
 * locally. It never navigates and never calls gtag.
 */
export const Route = createFileRoute("/internal/commercial-links")({
  head: () => ({
    meta: [
      { title: "Commercial Link QA (internal) | DeliciousDuck" },
      {
        name: "description",
        content:
          "Internal QA view of the DeliciousDuck commercial-link registry. Development only, not public content.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: CommercialLinkQa,
});

function IssueList({ issues }: { issues: AuditIssue[] }) {
  if (issues.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle2 aria-hidden="true" className="size-4" /> No issues found.
      </p>
    );
  }
  return (
    <ul className="space-y-2 text-sm">
      {issues.map((issue, index) => (
        <li
          key={`${issue.code}-${issue.linkId ?? index}`}
          className={`flex items-start gap-2 rounded-sm border p-3 ${
            issue.severity === "error"
              ? "border-destructive/50 bg-destructive/5"
              : "border-accent/50 bg-accent/10"
          }`}
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong className="uppercase tracking-[0.1em]">{issue.severity}</strong>{" "}
            <code>{issue.code}</code>
            {issue.linkId ? ` · ${issue.linkId}` : ""} — {issue.detail}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CommercialLinkQa() {
  const issues = useMemo(() => auditCommercialLinks(), []);
  const [preview, setPreview] = useState<string | null>(null);

  if (!import.meta.env.DEV) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24">
        <h1 className="font-display text-3xl text-foreground">Not available</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This internal QA view runs in development only.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <p className="eyebrow text-primary">Internal · development only</p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-foreground">
        Commercial link QA
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Every outbound merchant destination the site renders, with its relationship state,
        disclosure behaviour, <code>rel</code> attributes, discovered placements, and the exact
        analytics payload that would be sent. Verification older than {STALE_AFTER_MONTHS} months is
        flagged as stale.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-foreground">Audit</h2>
        <div className="mt-3">
          <IssueList issues={issues} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-foreground">Registry</h2>
        <ul className="mt-4 space-y-4">
          {COMMERCIAL_LINKS.map((link) => {
            const placements = placementsForLink(link.id);
            return (
              <li key={link.id} className="rounded-sm border border-border bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl text-foreground">{link.merchant}</h3>
                  <code className="text-xs text-muted-foreground">{link.id}</code>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[11rem_1fr]">
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Relationship
                  </dt>
                  <dd className="text-foreground/85">
                    {link.relationship}
                    {isAffiliateActive(link) ? " (monetized)" : " (no commission)"}
                  </dd>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Destination
                  </dt>
                  <dd className="break-all text-foreground/85">
                    {link.url} · host {destinationHost(link.url)}
                  </dd>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Category
                  </dt>
                  <dd className="text-foreground/85">{link.category}</dd>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Disclosure shown
                  </dt>
                  <dd className="text-foreground/85">{link.disclosureLabel}</dd>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    rel
                  </dt>
                  <dd className="text-foreground/85">
                    <code>{relForLink(link)}</code>
                  </dd>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Last verified
                  </dt>
                  <dd className="text-foreground/85">{link.lastVerified}</dd>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Placements
                  </dt>
                  <dd className="text-foreground/85">
                    {placements.length === 0
                      ? "none"
                      : placements.map((p) => `${p.path} (${p.placement})`).join(", ")}
                  </dd>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(placements.length > 0
                    ? placements
                    : [{ path: "(unplaced)", placement: "preview", linkIds: [link.id] }]
                  ).map((p) => (
                    <button
                      key={p.placement}
                      type="button"
                      onClick={() =>
                        setPreview(
                          JSON.stringify(
                            buildCommercialClickEvent({
                              link,
                              placement: p.placement,
                              sourcePath: p.path,
                            }),
                            null,
                            2,
                          ),
                        )
                      }
                      className="rounded-sm border border-border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:bg-cream"
                    >
                      Preview event · {p.placement}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-foreground">Event preview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Built locally. Nothing is sent to analytics and no navigation occurs.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-sm border border-border bg-cream p-4 text-xs text-foreground/85">
          {preview ?? "Select a placement above."}
        </pre>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-foreground">Placement map</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/85">
          {COMMERCIAL_PLACEMENTS.map((p) => (
            <li key={`${p.path}-${p.placement}`} className="rounded-sm border border-border p-3">
              <code>{p.path}</code> · {p.placement} · {p.linkIds.join(", ")}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
