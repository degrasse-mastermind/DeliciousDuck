import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import {
  AFFILIATE_ACTIVATION_CHECKLIST,
  CONTENT_QUEUE,
  DECISION_FRAMEWORK,
  EVENT_REFERENCE,
  NO_PII_NOTE,
  WEEKLY_CHECKLIST,
  WEEKLY_METRIC_FIELDS,
  type TrustState,
} from "@/data/growth-ops";
import { MERCHANTS, isMonetized } from "@/data/affiliates";

/**
 * Internal growth operating dashboard — owner tool, not site content.
 *
 * noindex/nofollow, disallowed in robots.txt under /internal/, excluded from
 * the sitemap and the site search index, and not linked from public nav.
 *
 * There is NO Search Console API connection. Every metric on this page is
 * typed in by hand and is not persisted anywhere.
 */
export const Route = createFileRoute("/internal/growth-dashboard")({
  head: () => ({
    meta: [
      { title: "Growth Dashboard (internal) | DeliciousDuck" },
      {
        name: "description",
        content:
          "Internal weekly growth operating dashboard for DeliciousDuck. Not public content.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: GrowthDashboard;
});

const TRUST_LABEL: Record<TrustState, string> = {
  "working-draft": "Editorial working draft",
  informational: "Informational",
  money: "Money page",
};

function Field({ label, hint, wide }: { label: string; hint?: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      {wide ? (
        <textarea
          rows={4}
          className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-2 text-base text-foreground"
        />
      ) : (
        <input
          type="text"
          className="mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground"
        />
      )}
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl text-foreground">{title}</h2>
    </>
  );
}

function GrowthDashboard() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <header>
        <p className="eyebrow text-primary print:hidden">Internal tool · not public content</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground lg:text-5xl">
          Growth Dashboard
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          A weekly operating sheet for search performance, the editorial update queue, affiliate
          approval progress, and conversion measurement. Work through it once a week.
        </p>
        <aside className="mt-5 rounded-sm border border-border bg-cream p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">No live data connection.</strong> This page does not
          query Search Console or GA4. Every number below is typed in by hand from those dashboards,
          and nothing entered here is saved — there is no database or storage behind this form, so
          values are lost on reload. Print it, or keep the numbers in your own spreadsheet.
        </aside>
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep print:hidden"
        >
          <Printer aria-hidden="true" className="size-4" />
          Print dashboard
        </button>
      </header>

      {/* 1 — Weekly metrics, manual entry */}
      <section className="mt-12 break-inside-avoid border-t border-border pt-8">
        <SectionHeading eyebrow="1 · Record" title="Weekly metrics (manual entry)" />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Pull these from Search Console (Performance, last 7 days) and GA4. Enter what the
          dashboards actually show — leave a field blank rather than estimating it.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {WEEKLY_METRIC_FIELDS.map((f) => (
            <Field key={f.label} label={f.label} hint={f.hint} wide={f.wide} />
          ))}
        </div>
      </section>

      {/* 2 — Decision framework */}
      <section className="mt-12 break-inside-avoid border-t border-border pt-8">
        <SectionHeading eyebrow="2 · Decide" title="Weekly decision framework" />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This is our own editorial policy for turning observed data into one concrete action. It is
          not Google documentation, and none of it is a guarantee of ranking movement.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  What the data shows
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What we do about it
                </th>
              </tr>
            </thead>
            <tbody>
              {DECISION_FRAMEWORK.map((rule) => (
                <tr key={rule.signal} className="border-b border-border align-top">
                  <th
                    scope="row"
                    className="w-56 py-3 pr-4 text-left font-semibold text-foreground"
                  >
                    {rule.signal}
                  </th>
                  <td className="py-3 leading-relaxed text-foreground/85">{rule.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3 — Content update queue */}
      <section className="mt-12 border-t border-border pt-8">
        <SectionHeading eyebrow="3 · Queue" title="Content update queue" />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Our highest-leverage existing pages, grouped by cluster. No keyword volumes appear here —
          we have no verified source for them. Update a page when the trigger in the last column
          actually happens, not on a schedule.
        </p>
        {CONTENT_QUEUE.map((group) => (
          <div key={group.cluster} className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
              {group.cluster}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{group.note}</p>
            <ul className="mt-4 space-y-4">
              {group.items.map((item) => (
                <li
                  key={item.path}
                  className="break-inside-avoid rounded-sm border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                      {TRUST_LABEL[item.trust]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <code>{item.path}</code>
                  </p>
                  <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    {[
                      ["Intent", item.intent],
                      ["Role", item.role],
                      ["Next evidence needed", item.evidenceNeeded],
                      ["Update trigger", item.updateTrigger],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="mt-0.5 leading-relaxed text-foreground/85">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* 4 — Affiliate approval control panel */}
      <section className="mt-12 break-inside-avoid border-t border-border pt-8">
        <SectionHeading eyebrow="4 · Monetization" title="Affiliate approval control panel" />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Read-only mirror of <code>src/data/affiliates.ts</code>, which is the only place a
          merchant becomes monetized. Statuses are never rendered on public pages. Never mark a
          program active from an assumption — read the approval in the network dashboard.
        </p>
        <div className="mt-6 space-y-4">
          {MERCHANTS.map((m) => (
            <div
              key={m.id}
              className="break-inside-avoid rounded-sm border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-foreground">
                  {m.name}
                  {m.program ? ` · ${m.program}` : ""}
                </p>
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                  {m.status}
                  {isMonetized(m) ? " · monetized" : " · not monetized"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Status reviewed {m.statusReviewed} · tracking URL{" "}
                {m.affiliateUrl ? "present" : "not set"}
              </p>
              {m.internalNote && (
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{m.internalNote}</p>
              )}
            </div>
          ))}
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
          Activation checklist — all steps required, in order
        </h3>
        <ul className="mt-4 space-y-3">
          {AFFILIATE_ACTIVATION_CHECKLIST.map((s) => (
            <li key={s.step} className="flex gap-3">
              <input
                type="checkbox"
                aria-label={`Done: ${s.step}`}
                className="mt-1 size-4 shrink-0 rounded-sm border-input accent-primary"
              />
              <div>
                <span className="text-sm font-semibold text-foreground">{s.step}</span>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 — GA4 event reference */}
      <section className="mt-12 break-inside-avoid border-t border-border pt-8">
        <SectionHeading eyebrow="5 · Measurement" title="GA4 event reference" />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Event
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  What it means
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  When it fires
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Dedupe
                </th>
              </tr>
            </thead>
            <tbody>
              {EVENT_REFERENCE.map((e) => (
                <tr key={e.name} className="border-b border-border align-top">
                  <th scope="row" className="w-40 py-3 pr-4 text-left font-semibold text-foreground">
                    <code>{e.name}</code>
                  </th>
                  <td className="py-3 pr-4 leading-relaxed text-foreground/85">{e.meaning}</td>
                  <td className="py-3 pr-4 leading-relaxed text-foreground/85">{e.fires}</td>
                  <td className="py-3 leading-relaxed text-muted-foreground">{e.dedupe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 rounded-sm border border-border bg-cream p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">No PII.</strong> {NO_PII_NOTE}
        </p>
      </section>

      {/* 6 — Weekly checklist */}
      <section className="mt-12 break-inside-avoid border-t border-border pt-8">
        <SectionHeading eyebrow="6 · Cadence" title="Owner weekly checklist" />
        <ul className="mt-6 space-y-3">
          {WEEKLY_CHECKLIST.map((item) => (
            <li key={item} className="flex gap-3">
              <input
                type="checkbox"
                aria-label={`Done: ${item}`}
                className="mt-1 size-4 shrink-0 rounded-sm border-input accent-primary"
              />
              <span className="text-sm leading-relaxed text-foreground/85">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-sm border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Evidence before status.</strong> No recipe moves to
          Kitchen Verified without a completed test sheet, and no merchant becomes active without a
          confirmed approval and a real tracking URL. Neither is a weekly-cadence decision.
        </p>
      </section>
    </div>
  );
}
