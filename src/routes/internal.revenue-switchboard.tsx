import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Printer } from "lucide-react";
import {
  ACTIVATION_FLAG_LABELS,
  MERCHANTS,
  activationReadiness,
  isMonetized,
  type Merchant,
  type ReadinessLevel,
} from "@/data/affiliates";
import {
  ACTIVATION_WORKFLOW,
  DEEP_LINKS,
  HANDS_ON_LABEL,
  MONEY_PAGES,
  PAGE_REVENUE_MAP,
  REVENUE_METRICS,
  describeSlot,
  revenueSummary,
} from "@/data/revenue";

/**
 * Internal revenue switchboard — owner tool, not site content.
 *
 * noindex/nofollow, disallowed in robots.txt under /internal/, excluded from the
 * sitemap and the site search index, and not linked from public navigation.
 *
 * Nothing on this page is persisted: checkboxes are scratch marks for a printed
 * run-through. The real switches live in src/data/affiliates.ts.
 */
export const Route = createFileRoute("/internal/revenue-switchboard")({
  head: () => ({
    meta: [
      { title: "Revenue Switchboard (internal) | DeliciousDuck" },
      {
        name: "description",
        content:
          "Internal affiliate activation and revenue operating switchboard for DeliciousDuck. Not public content.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: RevenueSwitchboard,
});

const READINESS_TONE: Record<ReadinessLevel, string> = {
  blocked: "border-destructive/40 bg-destructive/5",
  "in-progress": "border-accent/50 bg-accent/10",
  "ready-to-activate": "border-primary/40 bg-primary/5",
  live: "border-primary bg-primary/10",
};

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl text-foreground">{title}</h2>
    </>
  );
}

function MerchantCard({ merchant }: { merchant: Merchant }) {
  const readiness = activationReadiness(merchant);
  const flags = {
    ...merchant.activation,
    trackingUrlPresent: Boolean(merchant.affiliateUrl),
  };
  const verified = ACTIVATION_FLAG_LABELS.filter((f) => flags[f.key]).length;

  return (
    <article
      className={`break-inside-avoid rounded-sm border p-5 ${READINESS_TONE[readiness.level]}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl text-foreground">
          {merchant.name}
          {merchant.program ? <span className="text-muted-foreground"> · {merchant.program}</span> : null}
        </h3>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
          {readiness.label}
        </span>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {[
          ["Registry status", merchant.status],
          ["Monetized right now", isMonetized(merchant) ? "Yes" : "No"],
          ["Tracking URL", merchant.affiliateUrl ? "Present" : "Not set"],
          ["Direct URL", merchant.directUrl ?? "Not set"],
          ["Publisher ID", merchant.publisherId ?? "—"],
          ["Approval date", merchant.approvalDate ?? "Not approved yet"],
          ["Terms last reviewed", merchant.termsReviewedDate ?? "Never"],
          ["Activation date", merchant.activationDate ?? "—"],
          ["Link last checked", merchant.lastCheckedDate ?? "—"],
          ["Status reviewed", merchant.statusReviewed],
          ["Commission terms (internal)", merchant.commissionSummary ?? "Unknown — not entered"],
          ["Gates verified", `${verified} of ${ACTIVATION_FLAG_LABELS.length}`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 leading-relaxed text-foreground/85">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 rounded-sm bg-card p-3 text-sm leading-relaxed text-foreground/85">
        <strong className="text-foreground">Next action. </strong>
        {readiness.nextAction}
      </p>

      {merchant.internalNote && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{merchant.internalNote}</p>
      )}

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
        Activation gates
      </h4>
      <ul className="mt-3 space-y-2">
        {ACTIVATION_FLAG_LABELS.map((f) => (
          <li key={f.key} className="flex items-start gap-2 text-sm">
            <span
              aria-hidden="true"
              className={`mt-1 size-3 shrink-0 rounded-full border ${
                flags[f.key] ? "border-primary bg-primary" : "border-border bg-card"
              }`}
            />
            <span className={flags[f.key] ? "text-foreground" : "text-muted-foreground"}>
              {f.label}
              <span className="sr-only">{flags[f.key] ? " — verified" : " — not verified"}</span>
            </span>
          </li>
        ))}
      </ul>

      {(merchant.allowedCategories?.length ||
        merchant.excludedCategories?.length ||
        merchant.termsNotes) && (
        <div className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
          {merchant.allowedCategories?.length ? (
            <p>Allowed categories: {merchant.allowedCategories.join(", ")}</p>
          ) : null}
          {merchant.excludedCategories?.length ? (
            <p>Excluded: {merchant.excludedCategories.join(", ")}</p>
          ) : null}
          {merchant.termsNotes ? <p className="mt-1">{merchant.termsNotes}</p> : null}
        </div>
      )}
    </article>
  );
}

function RevenueSwitchboard() {
  const summary = revenueSummary();

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <header>
        <p className="eyebrow text-primary print:hidden">Internal tool · not public content</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground lg:text-5xl">
          Revenue Switchboard
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          One place to see merchant status, activation readiness, every deep-link slot, and which
          page each slot serves. Activation itself happens in{" "}
          <code>src/data/affiliates.ts</code> — this page only shows what that file currently says.
        </p>

        <aside
          className="mt-5 flex items-start gap-3 rounded-sm border border-destructive/40 bg-destructive/5 p-4 text-sm leading-relaxed text-foreground/85"
          aria-label="Current monetization state"
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <strong className="text-foreground">
              {summary.anyActive
                ? `${summary.activeMerchants.length} active affiliate program(s).`
                : "No active affiliate programs. Nothing on this site is monetized."}
            </strong>{" "}
            {summary.anyActive
              ? `Active: ${summary.activeMerchants.join(", ")}.`
              : `Pending or unapplied: ${summary.pendingMerchants.join(", ")}. Every public CTA resolves to a plain merchant link or to no link at all, and GA4 reports affiliate=false.`}{" "}
            {summary.activeDeepLinkCount} of {summary.deepLinkCount} deep-link slots hold a real
            tracking URL.
          </div>
        </aside>

        <aside className="mt-4 rounded-sm border border-border bg-cream p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Nothing here is saved.</strong> There is no database
          behind this page and no reporting connection to Awin or Impact. Checkboxes below are
          scratch marks for a printed run-through; real state lives in the registry files.
        </aside>

        <button
          type="button"
          onClick={() => window.print()}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep print:hidden"
        >
          <Printer aria-hidden="true" className="size-4" />
          Print switchboard
        </button>
      </header>

      {/* 1 — Merchant status */}
      <section className="mt-12 border-t border-border pt-8">
        <SectionHeading eyebrow="1 · Merchants" title="Merchant status and activation readiness" />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Readiness is derived, not typed: a merchant can only read “ready to activate” when the
          registry holds a real tracking URL and every gate is verified. Pending programs are
          always shown as not monetized so they can never be mistaken for a live relationship.
        </p>
        <div className="mt-6 space-y-5">
          {MERCHANTS.map((m) => (
            <MerchantCard key={m.id} merchant={m} />
          ))}
        </div>
      </section>

      {/* 2 — Activation workflow */}
      <section className="mt-12 border-t border-border pt-8">
        <SectionHeading eyebrow="2 · Workflow" title="Activation workflow, in order" />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Run A → G for each merchant. Each step names the mechanism that stops it being skipped
          quietly. If a step fails, roll the status back rather than shipping the link.
        </p>
        <ol className="mt-6 space-y-4">
          {ACTIVATION_WORKFLOW.map((s) => (
            <li key={s.key} className="break-inside-avoid rounded-sm border border-border bg-card p-4">
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  aria-label={`Done: ${s.step}`}
                  className="mt-1 size-4 shrink-0 rounded-sm border-input accent-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {s.key}. {s.step}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/85">{s.detail}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Safeguard: {s.gate}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 3 — Deep-link registry */}
      <section className="mt-12 border-t border-border pt-8">
        <SectionHeading eyebrow="3 · Slots" title="Product and deep-link registry" />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Category slots, not invented products. No SKUs, prices, or model claims. Hands-on status
          is honest: everything is untested until the kitchen test sheet produces evidence.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th scope="col" className="py-2 pr-4 font-semibold">Slot</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Merchant</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Use case</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Destination</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Status</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Hands-on</th>
                <th scope="col" className="py-2 font-semibold">Owns</th>
              </tr>
            </thead>
            <tbody>
              {DEEP_LINKS.map((d) => (
                <tr key={d.id} className="border-b border-border align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-medium text-foreground">
                    {d.name}
                    {d.note && (
                      <p className="mt-1 text-xs font-normal leading-relaxed text-muted-foreground">
                        {d.note}
                      </p>
                    )}
                  </th>
                  <td className="py-3 pr-4 text-muted-foreground">{d.merchantId ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{d.useCase}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {d.affiliateUrl ? "Affiliate deep link" : d.directUrl ? "Direct only" : "None"}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{d.status}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{HANDS_ON_LABEL[d.handsOn]}</td>
                  <td className="py-3 text-muted-foreground">
                    {d.editorialRelationship}
                    <br />
                    <span className="text-xs">Checked {d.lastVerified}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4 — Page-to-revenue map */}
      <section className="mt-12 border-t border-border pt-8">
        <SectionHeading eyebrow="4 · Map" title="Page-to-revenue map" />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Each slot carries a role and a placement intent, so activation is a decision about where a
          link belongs rather than a URL dump. Money pages:{" "}
          {MONEY_PAGES.map((p) => (
            <code key={p} className="mr-1">
              {p}
            </code>
          ))}
        </p>
        <div className="mt-6 space-y-5">
          {PAGE_REVENUE_MAP.map((page) => (
            <div key={page.path} className="break-inside-avoid rounded-sm border border-border bg-card p-4">
              <h3 className="font-display text-lg text-foreground">{page.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                <code>{page.path}</code>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{page.readerState}</p>
              <ul className="mt-4 space-y-3">
                {page.slots.map((slot, i) => {
                  const info = describeSlot(slot);
                  return (
                    <li key={`${page.path}-${i}`} className="border-t border-border pt-3 text-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold uppercase tracking-[0.12em] text-primary">
                          {slot.role}
                        </span>
                        <span
                          className={`text-xs font-semibold uppercase tracking-[0.1em] ${
                            info.monetized ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {info.stateLabel}
                        </span>
                      </div>
                      <p className="mt-1 leading-relaxed text-foreground/85">
                        <strong className="text-foreground">Intent. </strong>
                        {slot.intent}
                      </p>
                      <p className="mt-1 leading-relaxed text-muted-foreground">
                        <strong className="text-foreground">Placement. </strong>
                        {slot.placement}
                      </p>
                      {info.deepLink && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Slot: <code>{info.deepLink.id}</code> · {info.deepLink.status}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 5 — Metrics framework */}
      <section className="mt-12 break-inside-avoid border-t border-border pt-8">
        <SectionHeading eyebrow="5 · Measurement" title="Revenue metrics framework" />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          What we can measure today from GA4, and what genuinely requires network reporting. There
          is no Awin or Impact API integration in this project, so those rows are read by hand from
          the network dashboards once a program is live.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th scope="col" className="py-2 pr-4 font-semibold">Metric</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Definition</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Source</th>
                <th scope="col" className="py-2 font-semibold">Available now</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE_METRICS.map((m) => (
                <tr key={m.metric} className="border-b border-border align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-medium text-foreground">
                    {m.metric}
                  </th>
                  <td className="py-3 pr-4 text-muted-foreground">{m.definition}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{m.source}</td>
                  <td className="py-3 text-muted-foreground">
                    {m.availableNow ? "Yes — GA4" : "No — needs network reporting"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          No personally identifying data is sent to GA4 anywhere on this site: commercial events
          carry merchant, placement, page path, destination kind, link type, and an affiliate
          boolean only. Email addresses are never included in any event.
        </p>
      </section>
    </div>
  );
}
