import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ClipboardCopy, X } from "lucide-react";
import {
  DUCK_DROP,
  EMPTY_ISSUE,
  INTEREST_LABELS,
  ISSUE_QUEUE,
  LIFECYCLE_PLAN,
  LIFECYCLE_POLICY,
  FUTURE_BRANCHES,
  LINK_CONVENTIONS,
  MONETIZATION_LABEL,
  MONETIZATION_RULES,
  QUALITY_GATE,
  REVENUE_ROLE_LABEL,
  SELECTABLE_INTERESTS,
  queueSummary,
  taggedEmailUrl,
  type IssueDraft,
  type MonetizationIntent,
  type RevenueRole,
} from "@/data/duck-drop";
import { DEEP_LINKS, deepLinkById } from "@/data/revenue";
import { HAS_ACTIVE_AFFILIATE_PROGRAM, resolveCommerceLink } from "@/data/affiliates";
import { SITE } from "@/data/site";

/**
 * The Duck Drop Studio — internal editorial + revenue workbench.
 *
 * noindex/nofollow, disallowed under /internal/ in robots.txt, excluded from the
 * sitemap and site search, and not linked from public navigation.
 *
 * Nothing here is persisted and nothing here sends email. It composes an issue,
 * runs the pre-send quality gate, and produces copy-paste fields for the Resend
 * template. Commerce destinations are resolved from the affiliate registry, so a
 * pending program can only ever produce a plain, non-affiliate link.
 */
export const Route = createFileRoute("/internal/duck-drop-studio")({
  head: () => ({
    meta: [
      { title: "Duck Drop Studio (internal) | DeliciousDuck" },
      {
        name: "description",
        content:
          "Internal editorial workbench for The Duck Drop weekly newsletter. Not public content.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: DuckDropStudio,
});

/* ------------------------------------------------------------------ *
 * Small internal-only primitives (no public design impact)
 * ------------------------------------------------------------------ */

function Panel({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 border-t border-border pt-10">
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl text-foreground">{title}</h2>
      {intro && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TextField({
  label,
  hint,
  value,
  onChange,
  rows,
  maxLength,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-2 text-base text-foreground"
        />
      ) : (
        <input
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground"
        />
      )}
    </label>
  );
}

function GateRow({ ok, label, detail }: { ok: boolean | null; label: string; detail: string }) {
  return (
    <li className="flex gap-3 border-b border-border py-3 last:border-b-0">
      <span aria-hidden="true" className="mt-0.5 shrink-0">
        {ok === null ? (
          <span className="inline-block size-4 rounded-sm border border-input" />
        ) : ok ? (
          <Check className="size-4 text-primary" />
        ) : (
          <X className="size-4 text-destructive" />
        )}
      </span>
      <span>
        <span className="text-sm font-semibold text-foreground">
          {label}
          {ok === null && (
            <span className="ml-2 text-xs font-normal uppercase tracking-[0.12em] text-muted-foreground">
              manual check
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{detail}</span>
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Studio
 * ------------------------------------------------------------------ */

function DuckDropStudio() {
  const [draft, setDraft] = useState<IssueDraft>(EMPTY_ISSUE);
  const [deepLinkId, setDeepLinkId] = useState("");
  const [copied, setCopied] = useState(false);
  const summary = queueSummary();

  const set = <K extends keyof IssueDraft>(key: K, value: IssueDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));
  const setModule = (
    key: "technique" | "mistake" | "worthOpening",
    field: "title" | "body" | "url",
    value: string,
  ) => setDraft((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  /** Resolved commerce destination — registry-driven, never hand-pasted. */
  const commerce = useMemo(() => {
    const entry = deepLinkById(deepLinkId);
    if (!entry) return null;
    const link = resolveCommerceLink({
      merchantId: entry.merchantId,
      affiliateUrl: entry.affiliateUrl,
      directUrl: entry.directUrl,
      name: entry.name,
    });
    return { entry, link };
  }, [deepLinkId]);

  const bodyWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const urlOk = (url: string) => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url, SITE.baseUrl);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  /** Automated portion of the quality gate. Manual items stay unchecked. */
  const checks = useMemo<Record<string, boolean>>(() => {
    const modules = [draft.technique, draft.mistake, draft.worthOpening];
    const usesAffiliate = commerce?.link.isAffiliate === true;
    const subject = draft.subject.trim();
    const longest = Math.max(...modules.map((m) => bodyWords(m.body)), 0);
    return {
      "one-commercial": draft.monetization !== "commercial" || Boolean(commerce),
      disclosure: !usesAffiliate || HAS_ACTIVE_AFFILIATE_PROGRAM,
      urls: modules.every((m) => urlOk(m.url)),
      subject:
        subject.length >= 20 &&
        subject.length <= 65 &&
        subject === subject.replace(/\s{2,}/g, " ") &&
        !/!{2,}|\bFREE\b|\bURGENT\b|\bLAST CHANCE\b/.test(subject) &&
        subject !== subject.toUpperCase(),
      length: longest > 0 && longest <= 120,
      "no-pii": !/@/.test(
        [...modules.map((m) => m.url), commerce?.link.href ?? ""].join(" "),
      ),
    };
  }, [draft, commerce]);

  const automatedFailures = QUALITY_GATE.filter(
    (item) => item.automated && checks[item.id] === false,
  ).length;

  /** Copy-paste field block for the Resend template. */
  const exportBlock = useMemo(() => {
    const n = draft.issueNumber;
    const lines = [
      `template: ${DUCK_DROP.templateAlias} (${DUCK_DROP.templateId})`,
      `segment: ${DUCK_DROP.mainSegmentName} (${DUCK_DROP.mainSegmentId})`,
      `issue_number: ${n}`,
      `issue_date: ${draft.issueDate}`,
      `subject: ${draft.subject}`,
      `preview_text: ${draft.previewText}`,
      `issue_title: ${draft.issueTitle}`,
      "",
      `technique_title: ${draft.technique.title}`,
      `technique_body: ${draft.technique.body}`,
      `technique_url: ${taggedEmailUrl(draft.technique.url, "technique", n, SITE.baseUrl)}`,
      "",
      `mistake_title: ${draft.mistake.title}`,
      `mistake_body: ${draft.mistake.body}`,
      `mistake_url: ${taggedEmailUrl(draft.mistake.url, "mistake", n, SITE.baseUrl)}`,
      "",
      `feature_title: ${draft.worthOpening.title}`,
      `feature_body: ${draft.worthOpening.body}`,
      `feature_url: ${taggedEmailUrl(draft.worthOpening.url, "feature", n, SITE.baseUrl)}`,
      "",
      commerce
        ? [
            `commerce_name: ${commerce.entry.name}`,
            `commerce_use_case: ${commerce.entry.useCase}`,
            `commerce_url: ${commerce.link.href ?? ""}`,
            `commerce_link_kind: ${commerce.link.kind}`,
            `commerce_disclosure_required: ${commerce.link.isAffiliate ? "yes" : "no"}`,
          ].join("\n")
        : "commerce: none this issue",
      "",
      `signoff: ${draft.signoff}`,
      `audience_lead: ${INTEREST_LABELS[draft.audience]}`,
      `monetization: ${MONETIZATION_LABEL[draft.monetization]}`,
      `revenue_role: ${REVENUE_ROLE_LABEL[draft.revenueRole]}`,
      `status: ${draft.status}`,
    ];
    return lines.join("\n");
  }, [draft, commerce]);

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportBlock);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <header>
        <p className="eyebrow text-primary">Internal tool · not public content</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground lg:text-5xl">
          The Duck Drop Studio
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {DUCK_DROP.promise} This page composes one weekly issue, runs the pre-send gate, and
          hands you clean fields for the <strong>{DUCK_DROP.templateName}</strong> template in
          Resend.
        </p>
        <div className="mt-6 rounded-sm border border-border bg-secondary/40 p-5 text-sm leading-relaxed text-foreground">
          <p className="font-semibold">What this page does and doesn&apos;t do</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>
              Nothing typed here is saved or sent. Copy the field block into Resend when the issue
              passes the gate.
            </li>
            <li>
              Commerce links resolve from the affiliate registry.{" "}
              {HAS_ACTIVE_AFFILIATE_PROGRAM
                ? "At least one program is active, so disclosure is required above the first affiliate link."
                : "Every program is still pending, so every destination resolves to a plain, non-affiliate link and no disclosure is claimed."}
            </li>
            <li>
              Subscriber counts and mix live on the growth dashboard. Send, delivery, and click
              numbers come from Resend — there is no live sync.
            </li>
          </ul>
        </div>
      </header>

      {/* ---------------- Issue composer ---------------- */}
      <Panel
        eyebrow="Compose"
        title="This week's issue"
        intro="Three blocks plus an optional commerce slot. Every block must be useful inside the email, even if nobody clicks."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Issue number</span>
            <input
              type="number"
              min={1}
              value={draft.issueNumber}
              onChange={(e) => set("issueNumber", Number(e.target.value) || 1)}
              className="mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Send date</span>
            <input
              type="date"
              value={draft.issueDate}
              onChange={(e) => set("issueDate", e.target.value)}
              className="mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground"
            />
          </label>
          <TextField
            label="Subject"
            hint="Specific, not clickbait. 20–65 characters."
            value={draft.subject}
            maxLength={90}
            onChange={(v) => set("subject", v)}
          />
          <TextField
            label="Preview text"
            hint="One line that adds to the subject rather than repeating it."
            value={draft.previewText}
            maxLength={140}
            onChange={(v) => set("previewText", v)}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Issue title (inside the email)"
              value={draft.issueTitle}
              maxLength={120}
              onChange={(v) => set("issueTitle", v)}
            />
          </div>
        </div>

        {(
          [
            ["technique", "One technique", "The standalone takeaway. Usable without clicking."],
            ["mistake", "One mistake", "The failure mode and the fix, in plain language."],
            ["worthOpening", "One thing worth opening", "The single primary click target."],
          ] as const
        ).map(([key, title, hint]) => (
          <div key={key} className="mt-8 rounded-sm border border-border p-5">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
            <div className="mt-4 grid gap-4">
              <TextField
                label="Block heading"
                value={draft[key].title}
                maxLength={120}
                onChange={(v) => setModule(key, "title", v)}
              />
              <TextField
                label="Body"
                hint={`Under 120 words on a phone. Currently ${bodyWords(draft[key].body)}.`}
                rows={4}
                value={draft[key].body}
                onChange={(v) => setModule(key, "body", v)}
              />
              <TextField
                label="Destination"
                hint="Site path or absolute https URL. Tracking parameters are added automatically in the export."
                value={draft[key].url}
                onChange={(v) => setModule(key, "url", v)}
              />
            </div>
          </div>
        ))}

        {/* Commerce slot — resolved, never pasted */}
        <div className="mt-8 rounded-sm border border-border p-5">
          <p className="text-sm font-semibold text-foreground">
            Worth considering (optional commerce slot)
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pick a registry slot. The destination is resolved for you, so an unapproved program can
            never produce a fake tracking link.
          </p>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-foreground">Registry slot</span>
            <select
              value={deepLinkId}
              onChange={(e) => setDeepLinkId(e.target.value)}
              className="mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground"
            >
              <option value="">No commerce module this issue</option>
              {DEEP_LINKS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name} — {entry.useCase}
                </option>
              ))}
            </select>
          </label>

          {commerce && (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Resolved link type
                </dt>
                <dd className="mt-1 font-semibold text-foreground">
                  {commerce.link.kind === "affiliate"
                    ? "Affiliate tracking link"
                    : commerce.link.kind === "direct"
                      ? "Plain merchant link (no commission)"
                      : "No usable destination — leave the slot out"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Disclosure required
                </dt>
                <dd className="mt-1 font-semibold text-foreground">
                  {commerce.link.isAffiliate
                    ? "Yes — above the first affiliate link"
                    : "No — nothing is earned on this link"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Destination
                </dt>
                <dd className="mt-1 break-all text-foreground">
                  {commerce.link.href ?? "none available yet"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Editorial owner · last verified
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  {commerce.entry.editorialRelationship} · {commerce.entry.lastVerified}
                </dd>
              </div>
            </dl>
          )}
        </div>

        {/* Framing */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Lead audience</span>
            <select
              value={draft.audience}
              onChange={(e) => set("audience", e.target.value as IssueDraft["audience"])}
              className="mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground"
            >
              {SELECTABLE_INTERESTS.map((option) => (
                <option key={option} value={option}>
                  {INTEREST_LABELS[option]}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-muted-foreground">
              Changes which examples lead. The issue still goes to the whole list.
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Monetization intent</span>
            <select
              value={draft.monetization}
              onChange={(e) => set("monetization", e.target.value as MonetizationIntent)}
              className="mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground"
            >
              {(Object.keys(MONETIZATION_LABEL) as MonetizationIntent[]).map((key) => (
                <option key={key} value={key}>
                  {MONETIZATION_LABEL[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Revenue role</span>
            <select
              value={draft.revenueRole}
              onChange={(e) => set("revenueRole", e.target.value as RevenueRole)}
              className="mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground"
            >
              {(Object.keys(REVENUE_ROLE_LABEL) as RevenueRole[]).map((key) => (
                <option key={key} value={key}>
                  {REVENUE_ROLE_LABEL[key]}
                </option>
              ))}
            </select>
          </label>
          <div className="block">
            <TextField
              label="Sign-off"
              rows={3}
              value={draft.signoff}
              onChange={(v) => set("signoff", v)}
            />
          </div>
        </div>
      </Panel>

      {/* ---------------- Quality gate ---------------- */}
      <Panel
        eyebrow="Pre-send gate"
        title="Every issue clears this before it sends"
        intro={
          automatedFailures === 0
            ? "No automated check is failing. The manual items still need a human read."
            : `${automatedFailures} automated check${automatedFailures === 1 ? "" : "s"} failing. Fix before sending.`
        }
      >
        <ul>
          {QUALITY_GATE.map((item) => (
            <GateRow
              key={item.id}
              ok={item.automated ? (checks[item.id] ?? false) : null}
              label={item.label}
              detail={item.detail}
            />
          ))}
        </ul>
      </Panel>

      {/* ---------------- Export ---------------- */}
      <Panel
        eyebrow="Hand off"
        title="Field block for Resend"
        intro="Site links are tagged for GA4; affiliate destinations are deliberately left untagged so network attribution isn't broken."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">{LINK_CONVENTIONS.rule}</p>
        <button
          type="button"
          onClick={copyExport}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground"
        >
          <ClipboardCopy aria-hidden="true" className="size-4" />
          {copied ? "Copied" : "Copy field block"}
        </button>
        <pre className="mt-4 overflow-x-auto rounded-sm border border-border bg-card p-4 text-xs leading-relaxed text-foreground">
          {exportBlock}
        </pre>
      </Panel>

      {/* ---------------- Editorial queue ---------------- */}
      <Panel
        eyebrow="Editorial calendar"
        title={`${summary.total} issues, built only from pages that already exist`}
        intro={`${summary.editorialOnly} editorial-only, ${summary.soft} with a single soft mention, ${summary.commercial} deliberately commercial.${
          summary.monetizableToday
            ? ""
            : " No issue can carry a real affiliate link yet — every program is pending."
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th className="py-2 pr-3">Wk</th>
                <th className="py-2 pr-3">Pillar</th>
                <th className="py-2 pr-3">Lead audience</th>
                <th className="py-2 pr-3">Blocks</th>
                <th className="py-2 pr-3">Commercial pressure</th>
              </tr>
            </thead>
            <tbody>
              {ISSUE_QUEUE.map((issue) => (
                <tr key={issue.week} className="border-b border-border align-top">
                  <td className="py-3 pr-3 font-semibold text-foreground">{issue.week}</td>
                  <td className="py-3 pr-3 text-foreground">{issue.pillar}</td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {INTEREST_LABELS[issue.audience]}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    <span className="block">
                      Technique: {issue.technique.angle}{" "}
                      <a className="underline underline-offset-4" href={issue.technique.url}>
                        {issue.technique.url}
                      </a>
                    </span>
                    <span className="mt-1.5 block">
                      Mistake: {issue.mistake.angle}{" "}
                      <a className="underline underline-offset-4" href={issue.mistake.url}>
                        {issue.mistake.url}
                      </a>
                    </span>
                    <span className="mt-1.5 block">
                      Feature: {issue.feature.angle}{" "}
                      <a className="underline underline-offset-4" href={issue.feature.url}>
                        {issue.feature.url}
                      </a>
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    <span className="block font-semibold text-foreground">
                      {MONETIZATION_LABEL[issue.monetization]}
                    </span>
                    <span className="mt-1 block">{REVENUE_ROLE_LABEL[issue.revenueRole]}</span>
                    <span className="mt-1 block text-xs">{issue.note}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ---------------- Lifecycle ---------------- */}
      <Panel
        eyebrow="Retention"
        title="Subscriber lifecycle"
        intro="Stages are recorded in our own database and advanced deliberately. Opens are treated as a weak signal, never as truth."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {LIFECYCLE_PLAN.map((phase) => (
            <div key={phase.stage} className="rounded-sm border border-border p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-primary">{phase.stage}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{phase.window}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {phase.whatHappens}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Basis: {phase.dataBasis}
              </p>
            </div>
          ))}
        </div>

        <h3 className="mt-8 text-sm font-semibold text-foreground">Standing policy</h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {LIFECYCLE_POLICY.map((rule) => (
            <li key={rule} className="flex gap-2.5">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              {rule}
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-sm font-semibold text-foreground">
          Branches we have deliberately not built yet
        </h3>
        <dl className="mt-3 space-y-3 text-sm">
          {FUTURE_BRANCHES.map((branch) => (
            <div key={branch.branch} className="rounded-sm border border-border p-4">
              <dt className="font-semibold text-foreground">{branch.branch}</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                Requires: {branch.requires}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      {/* ---------------- Monetization rules ---------------- */}
      <Panel
        eyebrow="Standards"
        title="Monetization rules for the newsletter"
        intro="These are the rules the gate above enforces. They do not change when a program goes live — only the link type does."
      >
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          {MONETIZATION_RULES.map((rule) => (
            <li key={rule} className="flex gap-2.5">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              {rule}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          Weekly numbers and list health live on the{" "}
          <a href="/internal/growth-dashboard" className="text-primary underline underline-offset-4">
            growth dashboard
          </a>
          ; program status lives on the{" "}
          <a
            href="/internal/revenue-switchboard"
            className="text-primary underline underline-offset-4"
          >
            revenue switchboard
          </a>
          .
        </p>
      </Panel>
    </div>
  );
}
