/**
 * Duck Game Plan email delivery — pure contracts and orchestration.
 *
 * Why this exists separately from the newsletter welcome:
 *
 * The welcome email is a one-time lifecycle message. It is deliberately
 * send-once and provider-idempotent, so an existing subscriber who fills in the
 * planner receives nothing — which is exactly the production bug this module
 * fixes. Requesting a Game Plan is a *transactional* action: the visitor asked
 * for this specific plan now, so it must be delivered every time it is asked
 * for, whether or not the address is already on the list.
 *
 * Guarantees kept intact:
 * - Suppressed/unsubscribed/bounced/complained addresses are never emailed.
 * - The browser receives one constant accepted response for every outcome, so
 *   nothing here can be used to probe list membership or delivery state.
 * - A per-address cooldown stops the endpoint being used as a mail cannon.
 * - Only finite, validated selection enums and site-relative paths travel to the
 *   provider. No quiz free text exists, and the address is never placed in a
 *   URL, an analytics payload, or a log line.
 *
 * Everything in this file is pure or dependency-injected, so all decisions are
 * unit-testable with no network, no database, and no credentials.
 */

import { resolveGamePlan, type GamePlanSelection } from "@/data/duck-game-plan";
import { mailboxLinks, isPlausibleToken } from "./newsletter-links";
import type { SignupOutcome } from "./newsletter-response";

/** Site-relative path of the planner, so the email can lead back to it. */
export const GAME_PLAN_PATH = "/tools/duck-game-plan";

/** One plan email per address per ten minutes. */
export const GAME_PLAN_COOLDOWN_MS = 10 * 60_000;

export interface GamePlanDeliveryInput {
  readonly email: string;
  readonly selection: GamePlanSelection;
  readonly baseUrl: string;
  /** Opaque mailbox token from the subscriber row. */
  readonly token: string;
}

export interface GamePlanEventData {
  readonly recommendation_id: string;
  readonly result_type: string;
  readonly headline: string;
  readonly summary: string;
  readonly critical_move: string;
  readonly temperature: string;
  readonly timing: string;
  readonly cut: string;
  readonly method: string;
  readonly concern: string;
  readonly party_size_bucket: string;
  /** Absolute link to the primary guide for this plan. */
  readonly primary_url: string;
  readonly primary_label: string;
  /** Absolute link back to the planner itself. */
  readonly game_plan_url: string;
  readonly unsubscribe_url: string;
  readonly preferences_url: string;
}

function absolute(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

/**
 * The `data` block the Game Plan template renders. Built from the resolver, so
 * every string is one the site already publishes; nothing is invented here.
 */
export function buildGamePlanEventData(input: GamePlanDeliveryInput): GamePlanEventData {
  const plan = resolveGamePlan(input.selection);
  const links = mailboxLinks(input.baseUrl, input.token);
  return {
    recommendation_id: plan.recommendationId,
    result_type: plan.resultType,
    headline: plan.headline,
    summary: plan.summary,
    critical_move: plan.refinement
      ? `${plan.criticalMove} ${plan.refinement}`
      : plan.criticalMove,
    temperature: plan.temperature,
    timing: plan.timing,
    cut: input.selection.cut,
    method: input.selection.method,
    concern: input.selection.concern,
    party_size_bucket: input.selection.partySize,
    primary_url: absolute(input.baseUrl, plan.primary.href),
    primary_label: plan.primary.label,
    game_plan_url: absolute(input.baseUrl, GAME_PLAN_PATH),
    unsubscribe_url: links.unsubscribe,
    preferences_url: links.preferences,
  };
}

export interface ProviderJsonRequest {
  readonly url: string;
  readonly method: "POST";
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
}

function headers(apiKey: string): Record<string, string> {
  return { "content-type": "application/json", authorization: `Bearer ${apiKey}` };
}

/** Visible sender identity, matching the verified newsletter sender. */
export const GAME_PLAN_FROM = "DeliciousDuck <hello@deliciousduck.com>";
export const GAME_PLAN_EMAIL_SEND_URL = "https://api.resend.com/emails";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The plan email body. Rendered here and sent directly, rather than handed to a
 * provider automation: the earlier automation-triggered event was accepted by
 * the provider but no automation was listening, so nothing was ever delivered
 * and no send appeared in the provider's logs.
 */
export function buildGamePlanEmailHtml(data: GamePlanEventData): string {
  const e = escapeHtml;
  return [
    `<div style="font-family:Georgia,'Times New Roman',serif;color:#1c1c1a;max-width:560px">`,
    `<p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#5b6b57;margin:0 0 8px">Your Duck Game Plan</p>`,
    `<h1 style="font-size:24px;line-height:1.25;margin:0 0 12px">${e(data.headline)}</h1>`,
    `<p style="font-size:16px;line-height:1.6;margin:0 0 18px">${e(data.summary)}</p>`,
    `<p style="font-size:16px;line-height:1.6;margin:0 0 6px"><strong>Do this first:</strong> ${e(data.critical_move)}</p>`,
    `<p style="font-size:16px;line-height:1.6;margin:0 0 6px"><strong>Temperature:</strong> ${e(data.temperature)}</p>`,
    `<p style="font-size:16px;line-height:1.6;margin:0 0 20px"><strong>Timing:</strong> ${e(data.timing)}</p>`,
    `<p style="margin:0 0 20px"><a href="${e(data.primary_url)}" style="background:#2f4531;color:#fdfbf6;padding:12px 18px;text-decoration:none;display:inline-block">${e(data.primary_label)}</a></p>`,
    `<p style="font-size:15px;line-height:1.6;margin:0 0 24px">Want to change an answer or plan a different bird? <a href="${e(data.game_plan_url)}" style="color:#2f4531">Rebuild your plan</a>.</p>`,
    `<hr style="border:none;border-top:1px solid #e2ddd2;margin:0 0 14px">`,
    `<p style="font-size:12px;line-height:1.6;color:#6b6b64;margin:0">You asked for this plan on deliciousduck.com. <a href="${e(data.preferences_url)}" style="color:#6b6b64">Email preferences</a> &middot; <a href="${e(data.unsubscribe_url)}" style="color:#6b6b64">Unsubscribe</a></p>`,
    `</div>`,
  ].join("");
}

export function buildGamePlanEmailText(data: GamePlanEventData): string {
  return [
    `Your Duck Game Plan`,
    ``,
    data.headline,
    ``,
    data.summary,
    ``,
    `Do this first: ${data.critical_move}`,
    `Temperature: ${data.temperature}`,
    `Timing: ${data.timing}`,
    ``,
    `${data.primary_label}: ${data.primary_url}`,
    `Rebuild your plan: ${data.game_plan_url}`,
    ``,
    `Email preferences: ${data.preferences_url}`,
    `Unsubscribe: ${data.unsubscribe_url}`,
  ].join("\n");
}

/** The single provider call that delivers the plan. */
export function buildGamePlanEmailRequest(
  input: GamePlanDeliveryInput,
  apiKey: string,
): ProviderJsonRequest {
  const data = buildGamePlanEventData(input);
  return {
    url: GAME_PLAN_EMAIL_SEND_URL,
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      from: GAME_PLAN_FROM,
      to: [input.email],
      subject: `Your duck game plan: ${data.headline}`,
      html: buildGamePlanEmailHtml(data),
      text: buildGamePlanEmailText(data),
      headers: { "List-Unsubscribe": `<${data.unsubscribe_url}>` },
      tags: [
        { name: "type", value: "game_plan" },
        { name: "recommendation", value: data.recommendation_id },
      ],
    }),
  };
}

/** Status-only classification: a provider body can echo the address. */
export function gamePlanEmailFailureReason(httpStatus: number): string {
  if (httpStatus === 401 || httpStatus === 403) return "game_plan_email_unauthorized";
  if (httpStatus === 422) return "game_plan_email_rejected_request";
  if (httpStatus === 429) return "game_plan_email_rate_limited";
  if (httpStatus >= 500) return "game_plan_email_provider_unavailable";
  return `game_plan_email_status_${httpStatus}`;
}

export type JsonFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number }>;

/** Sends the plan email. Throws a status classification only. */
export async function dispatchGamePlanEmail(
  input: GamePlanDeliveryInput,
  apiKey: string,
  fetchImpl: JsonFetch,
): Promise<void> {
  const request = buildGamePlanEmailRequest(input, apiKey);
  const response = await fetchImpl(request.url, {
    method: request.method,
    headers: { ...request.headers },
    body: request.body,
  });
  if (!response.ok) throw new Error(gamePlanEmailFailureReason(response.status));
}


/** True while a previous plan email is still inside the cooldown window. */
export function withinCooldown(
  lastRequestedAt: string | number | null | undefined,
  now: number,
  cooldownMs: number = GAME_PLAN_COOLDOWN_MS,
): boolean {
  if (lastRequestedAt === null || lastRequestedAt === undefined) return false;
  const at = typeof lastRequestedAt === "number" ? lastRequestedAt : Date.parse(lastRequestedAt);
  if (!Number.isFinite(at)) return false;
  return now - at < cooldownMs;
}

export type GamePlanDeliveryDecision =
  | { readonly dispatch: true; readonly token: string }
  | {
      readonly dispatch: false;
      readonly reason: "suppressed" | "cooldown" | "no_token" | "no_api_key";
    };

/**
 * One gate in front of every provider call. Fails closed: a suppressed address,
 * a cooldown hit, a missing mailbox token (which would mean dead unsubscribe
 * links) or a missing credential all send nothing.
 */
export function decideGamePlanDelivery(input: {
  readonly outcome: SignupOutcome;
  readonly token: unknown;
  readonly lastRequestedAt?: string | number | null | undefined;
  readonly now: number;
  readonly apiKey?: unknown;
  readonly cooldownMs?: number;
}): GamePlanDeliveryDecision {
  if (input.outcome === "blocked_suppressed") return { dispatch: false, reason: "suppressed" };
  if (typeof input.apiKey !== "string" || input.apiKey.trim() === "") {
    return { dispatch: false, reason: "no_api_key" };
  }
  if (withinCooldown(input.lastRequestedAt, input.now, input.cooldownMs)) {
    return { dispatch: false, reason: "cooldown" };
  }
  if (!isPlausibleToken(input.token)) return { dispatch: false, reason: "no_token" };
  return { dispatch: true, token: input.token };
}

/** Internal-only result of a delivery attempt. Never returned to the browser. */
export type GamePlanDeliveryResult =
  | "requested"
  | "skipped_suppressed"
  | "skipped_cooldown"
  | "skipped_no_token"
  | "skipped_no_api_key"
  | "error";

export interface GamePlanDeliveryDeps {
  /** Stores/refreshes the subscriber using the existing newsletter rules. */
  readonly persist: () => Promise<{ outcome: SignupOutcome }>;
  /** Mailbox token + last plan-email timestamp for this address. */
  readonly loadDeliveryState: () => Promise<{
    token: unknown;
    lastRequestedAt: string | number | null;
  } | null>;
  readonly recordDelivery: (at: string) => Promise<void>;
  readonly dispatch: (input: GamePlanDeliveryInput) => Promise<void>;
  readonly apiKey: string | undefined;
  readonly baseUrl: string;
  readonly email: string;
  readonly selection: GamePlanSelection;
  readonly now?: () => number;
  readonly cooldownMs?: number;
}

/**
 * Full server-side flow for one Game Plan request, with every side effect
 * injected. The caller always returns the same accepted response to the browser
 * regardless of what this reports.
 */
export async function runGamePlanDelivery(
  deps: GamePlanDeliveryDeps,
): Promise<{ outcome: SignupOutcome; delivery: GamePlanDeliveryResult }> {
  const { outcome } = await deps.persist();
  const nowMs = (deps.now ?? Date.now)();

  if (outcome === "blocked_suppressed") {
    return { outcome, delivery: "skipped_suppressed" };
  }

  const state = await deps.loadDeliveryState();
  const decision = decideGamePlanDelivery({
    outcome,
    token: state?.token,
    lastRequestedAt: state?.lastRequestedAt ?? null,
    now: nowMs,
    apiKey: deps.apiKey,
    ...(deps.cooldownMs === undefined ? {} : { cooldownMs: deps.cooldownMs }),
  });

  if (!decision.dispatch) {
    return {
      outcome,
      delivery:
        decision.reason === "cooldown"
          ? "skipped_cooldown"
          : decision.reason === "no_token"
            ? "skipped_no_token"
            : decision.reason === "suppressed"
              ? "skipped_suppressed"
              : "skipped_no_api_key",
    };
  }

  try {
    await deps.dispatch({
      email: deps.email,
      selection: deps.selection,
      baseUrl: deps.baseUrl,
      token: decision.token,
    });
  } catch (cause) {
    // Reason classification only — never the address, token, or provider body.
    console.error(
      `Game Plan delivery failed: ${cause instanceof Error ? cause.message : "unknown"}`,
    );
    return { outcome, delivery: "error" };
  }

  await deps.recordDelivery(new Date(nowMs).toISOString());
  return { outcome, delivery: "requested" };
}
