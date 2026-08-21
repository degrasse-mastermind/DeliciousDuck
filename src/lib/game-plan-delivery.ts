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

export const GAME_PLAN_EVENT_NAME = "duck.game_plan.requested";
export const GAME_PLAN_EVENT_SEND_URL = "https://api.resend.com/events/send";
export const GAME_PLAN_EVENT_DEFINE_URL = "https://api.resend.com/events";

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

/** The dispatch request that triggers the Game Plan delivery automation. */
export function buildGamePlanEventRequest(
  input: GamePlanDeliveryInput,
  apiKey: string,
): ProviderJsonRequest {
  return {
    url: GAME_PLAN_EVENT_SEND_URL,
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      event: GAME_PLAN_EVENT_NAME,
      email: input.email,
      // Resend Automations reference custom event fields as `event.<field>`,
      // which are sent under `payload`.
      payload: buildGamePlanEventData(input),
    }),
  };
}

/** Field types for the one-time event-definition registration. */
export const GAME_PLAN_EVENT_SCHEMA = {
  recommendation_id: "string",
  result_type: "string",
  headline: "string",
  summary: "string",
  critical_move: "string",
  temperature: "string",
  timing: "string",
  cut: "string",
  method: "string",
  concern: "string",
  party_size_bucket: "string",
  primary_url: "string",
  primary_label: "string",
  game_plan_url: "string",
  unsubscribe_url: "string",
  preferences_url: "string",
} as const;

export function buildGamePlanEventDefinitionRequest(apiKey: string): ProviderJsonRequest {
  return {
    url: GAME_PLAN_EVENT_DEFINE_URL,
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ name: GAME_PLAN_EVENT_NAME, schema: GAME_PLAN_EVENT_SCHEMA }),
  };
}

/** Status-only classification: a provider body can echo the address. */
export function gamePlanEventFailureReason(httpStatus: number): string {
  if (httpStatus === 401 || httpStatus === 403) return "game_plan_event_unauthorized";
  if (httpStatus === 404) return "game_plan_event_not_registered";
  if (httpStatus === 422) return "game_plan_event_rejected_request";
  if (httpStatus === 429) return "game_plan_event_rate_limited";
  if (httpStatus >= 500) return "game_plan_event_provider_unavailable";
  return `game_plan_event_status_${httpStatus}`;
}

export type JsonFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number }>;

/**
 * Dispatches the Game Plan event, registering the event definition once if the
 * provider reports it is unknown. Throws a status classification only.
 */
export async function dispatchGamePlanEvent(
  input: GamePlanDeliveryInput,
  apiKey: string,
  fetchImpl: JsonFetch,
): Promise<void> {
  const send = () => {
    const request = buildGamePlanEventRequest(input, apiKey);
    return fetchImpl(request.url, {
      method: request.method,
      headers: { ...request.headers },
      body: request.body,
    });
  };

  let response = await send();
  if (response.status === 404 || response.status === 422) {
    const definition = buildGamePlanEventDefinitionRequest(apiKey);
    await fetchImpl(definition.url, {
      method: definition.method,
      headers: { ...definition.headers },
      body: definition.body,
    });
    response = await send();
  }
  if (!response.ok) throw new Error(gamePlanEventFailureReason(response.status));
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
