/**
 * Double opt-in — pure contracts and decisions.
 *
 * A signup is now two steps. Step one stores the row with
 * `confirmation_status = "pending"` and emails a single tokenised confirmation
 * link. Step two happens when the reader presses the confirm button on
 * `/newsletter/confirm`: only then is the address treated as a real subscriber,
 * pushed to the delivery provider, and sent the guide, welcome, or Game Plan.
 *
 * Guarantees this module exists to keep:
 * - A pending address receives exactly one kind of mail: the confirmation.
 *   No welcome, no plan, no provider contact, no segment write.
 * - Confirmation mail is rate-limited per address (cooldown + hard cap), so the
 *   endpoint cannot be used to mail-bomb someone else's inbox.
 * - The confirmation token is a UUID delivered only to the mailbox itself. It is
 *   never rendered in the app, never logged, and never returned to a browser
 *   that did not already have it in the URL.
 * - Every decision here is pure, so the whole gate is unit-testable with no
 *   network, database, or credential.
 */

import { unsubscribeUrl } from "./newsletter-links";

/** Confirmation page path and the query key carrying the opaque token. */
export const CONFIRM_PATH = "/newsletter/confirm";
export const CONFIRM_TOKEN_PARAM = "c";

/** Stored confirmation states. Nothing else is a valid value. */
export const CONFIRMATION_STATUSES = ["pending", "confirmed"] as const;
export type ConfirmationStatus = (typeof CONFIRMATION_STATUSES)[number];

/** One confirmation email per address per ten minutes. */
export const CONFIRMATION_COOLDOWN_MS = 10 * 60_000;

/** Hard ceiling on confirmation emails per address, ever. */
export const MAX_CONFIRMATION_SENDS = 5;

/**
 * Confirmation links do not expire on a timer, but a link older than this is
 * treated as stale by the UI copy so a reader knows to request a new one.
 */
export const CONFIRMATION_FRESH_MS = 30 * 24 * 60 * 60_000;

export function isConfirmationStatus(value: unknown): value is ConfirmationStatus {
  return typeof value === "string" && (CONFIRMATION_STATUSES as readonly string[]).includes(value);
}

/** A row is only a deliverable subscriber once it has confirmed. */
export function isConfirmed(status: unknown): boolean {
  return status === "confirmed";
}

/**
 * Shape gate for the emailed confirmation token before it reaches the database.
 * UUID v4 shape only — the column is a uuid, so anything else cannot match a row
 * and must never be sent as a query parameter.
 */
export function isPlausibleConfirmationToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

function base(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

export function confirmUrl(baseUrl: string, token: string): string {
  return `${base(baseUrl)}${CONFIRM_PATH}?${CONFIRM_TOKEN_PARAM}=${encodeURIComponent(token)}`;
}

/* ------------------------------------------------------------------ *
 * Decision: may we send a confirmation email right now?
 * ------------------------------------------------------------------ */

export type ConfirmationSendDecision =
  | { readonly send: true; readonly token: string }
  | {
      readonly send: false;
      readonly reason: "already_confirmed" | "no_token" | "no_api_key" | "cooldown" | "capped";
    };

export function decideConfirmationSend(input: {
  readonly confirmationStatus: unknown;
  readonly token: unknown;
  readonly apiKey?: unknown;
  readonly sentCount?: number | null | undefined;
  readonly lastSentAt?: string | number | null | undefined;
  readonly now: number;
  readonly cooldownMs?: number;
}): ConfirmationSendDecision {
  if (isConfirmed(input.confirmationStatus)) return { send: false, reason: "already_confirmed" };
  if (typeof input.apiKey !== "string" || input.apiKey.trim() === "") {
    return { send: false, reason: "no_api_key" };
  }
  if (!isPlausibleConfirmationToken(input.token)) return { send: false, reason: "no_token" };
  if ((input.sentCount ?? 0) >= MAX_CONFIRMATION_SENDS) return { send: false, reason: "capped" };

  const last = input.lastSentAt;
  if (last !== null && last !== undefined) {
    const at = typeof last === "number" ? last : Date.parse(last);
    if (Number.isFinite(at) && input.now - at < (input.cooldownMs ?? CONFIRMATION_COOLDOWN_MS)) {
      return { send: false, reason: "cooldown" };
    }
  }
  return { send: true, token: input.token };
}

/** Internal-only result of a confirmation-send attempt. Never sent to a browser. */
export type ConfirmationSendResult =
  | "sent"
  | "skipped_already_confirmed"
  | "skipped_cooldown"
  | "skipped_capped"
  | "skipped_no_token"
  | "skipped_no_api_key"
  | "error";

export function confirmationSkipResult(
  reason: Exclude<ConfirmationSendDecision, { send: true }>["reason"],
): ConfirmationSendResult {
  switch (reason) {
    case "already_confirmed":
      return "skipped_already_confirmed";
    case "cooldown":
      return "skipped_cooldown";
    case "capped":
      return "skipped_capped";
    case "no_token":
      return "skipped_no_token";
    default:
      return "skipped_no_api_key";
  }
}

/* ------------------------------------------------------------------ *
 * Decision: what happens when a token is presented?
 * ------------------------------------------------------------------ */

export type ConfirmTokenDecision =
  | { readonly action: "confirm" }
  /** Already confirmed: idempotent success, nothing written, nothing emailed. */
  | { readonly action: "already" }
  /** Unknown token, or a row that must never be reactivated by a link click. */
  | { readonly action: "ignore"; readonly reason: "unknown" | "suppressed" };

export function decideConfirmToken(
  row: { readonly status: string; readonly confirmation_status: string } | null,
): ConfirmTokenDecision {
  if (!row) return { action: "ignore", reason: "unknown" };
  // Monotonic and suppression-safe: an unsubscribed, bounced, complained or
  // suppressed address is never revived by presenting a confirmation link.
  if (row.status !== "subscribed") return { action: "ignore", reason: "suppressed" };
  if (isConfirmed(row.confirmation_status)) return { action: "already" };
  return { action: "confirm" };
}

/* ------------------------------------------------------------------ *
 * The confirmation email
 * ------------------------------------------------------------------ */

export const CONFIRMATION_FROM = "DeliciousDuck <hello@deliciousduck.com>";
export const CONFIRMATION_SUBJECT = "Confirm your email to get your Duck Game Plan";
export const CONFIRMATION_SEND_URL = "https://api.resend.com/emails";

export interface ConfirmationEmailInput {
  readonly email: string;
  readonly baseUrl: string;
  /** Opaque confirmation token from the subscriber row. */
  readonly token: string;
  /** Opaque mailbox token, so the footer carries a working opt-out. */
  readonly preferenceToken: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildConfirmationEmailHtml(input: {
  confirmLink: string;
  unsubscribeLink: string;
}): string {
  const e = escapeHtml;
  return [
    `<div style="font-family:Georgia,'Times New Roman',serif;color:#1c1c1a;max-width:560px">`,
    `<p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#5b6b57;margin:0 0 8px">One quick step</p>`,
    `<h1 style="font-size:24px;line-height:1.25;margin:0 0 12px">Confirm your email</h1>`,
    `<p style="font-size:16px;line-height:1.6;margin:0 0 18px">You asked for your Duck Game Plan on deliciousduck.com. Press the button below and we&rsquo;ll send it straight over, along with The Duck Drop &mdash; six short emails on the fundamentals.</p>`,
    `<p style="margin:0 0 20px"><a href="${e(input.confirmLink)}" style="background:#2f4531;color:#fdfbf6;padding:12px 18px;text-decoration:none;display:inline-block">Confirm and send my plan</a></p>`,
    `<p style="font-size:15px;line-height:1.6;margin:0 0 24px">If the button doesn&rsquo;t work, open this link:<br><a href="${e(input.confirmLink)}" style="color:#2f4531">${e(input.confirmLink)}</a></p>`,
    `<hr style="border:none;border-top:1px solid #e2ddd2;margin:0 0 14px">`,
    `<p style="font-size:12px;line-height:1.6;color:#6b6b64;margin:0">Didn&rsquo;t ask for this? Ignore this email and nothing else will be sent &mdash; we only add confirmed addresses. You can also <a href="${e(input.unsubscribeLink)}" style="color:#6b6b64">opt out permanently</a>.</p>`,
    `</div>`,
  ].join("");
}

export function buildConfirmationEmailText(input: {
  confirmLink: string;
  unsubscribeLink: string;
}): string {
  return [
    `Confirm your email`,
    ``,
    `You asked for your Duck Game Plan on deliciousduck.com. Open the link below`,
    `and we'll send it straight over, along with The Duck Drop.`,
    ``,
    input.confirmLink,
    ``,
    `Didn't ask for this? Ignore this email and nothing else will be sent.`,
    `Opt out permanently: ${input.unsubscribeLink}`,
  ].join("\n");
}

export interface ProviderJsonRequest {
  readonly url: string;
  readonly method: "POST";
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
}

/**
 * The single provider call that sends a confirmation.
 *
 * Deliberate deliverability choices: a plain-text alternative alongside the HTML,
 * a `List-Unsubscribe` header plus `List-Unsubscribe=One-Click`, and no image,
 * tracking pixel, or redirect domain in the body. Those are the parts of
 * spam-folder resilience the application controls; domain authentication (SPF,
 * DKIM, DMARC) is DNS-side.
 */
export function buildConfirmationEmailRequest(
  input: ConfirmationEmailInput,
  apiKey: string,
): ProviderJsonRequest {
  const confirmLink = confirmUrl(input.baseUrl, input.token);
  const unsubscribeLink = unsubscribeUrl(input.baseUrl, input.preferenceToken);
  return {
    url: CONFIRMATION_SEND_URL,
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: CONFIRMATION_FROM,
      to: [input.email],
      subject: CONFIRMATION_SUBJECT,
      html: buildConfirmationEmailHtml({ confirmLink, unsubscribeLink }),
      text: buildConfirmationEmailText({ confirmLink, unsubscribeLink }),
      headers: {
        "List-Unsubscribe": `<${unsubscribeLink}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [{ name: "type", value: "confirmation" }],
    }),
  };
}

/** Status-only classification: a provider body can echo the address. */
export function confirmationEmailFailureReason(httpStatus: number): string {
  if (httpStatus === 401 || httpStatus === 403) return "confirmation_email_unauthorized";
  if (httpStatus === 422) return "confirmation_email_rejected_request";
  if (httpStatus === 429) return "confirmation_email_rate_limited";
  if (httpStatus >= 500) return "confirmation_email_provider_unavailable";
  return `confirmation_email_status_${httpStatus}`;
}

export type JsonFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number }>;

/** Sends the confirmation email. Throws a status classification only. */
export async function dispatchConfirmationEmail(
  input: ConfirmationEmailInput,
  apiKey: string,
  fetchImpl: JsonFetch,
): Promise<void> {
  const request = buildConfirmationEmailRequest(input, apiKey);
  const response = await fetchImpl(request.url, {
    method: request.method,
    headers: { ...request.headers },
    body: request.body,
  });
  if (!response.ok) throw new Error(confirmationEmailFailureReason(response.status));
}
