/**
 * Duck Game Plan analytics contracts.
 *
 * Pure builders with closed, per-event property allowlists — the same shape the
 * rest of the measurement layer uses. A caller cannot smuggle an email address,
 * a typed value, a query string, or a full URL into GA4 or PostHog: unlisted
 * keys are dropped, and every value must be a member of a finite enum or a
 * normalized same-origin path.
 */

import {
  GAME_PLAN_CONCERNS,
  GAME_PLAN_CUTS,
  GAME_PLAN_METHODS,
  GAME_PLAN_PARTY_SIZES,
  type GamePlanConcern,
  type GamePlanCut,
  type GamePlanMethod,
  type GamePlanPartySize,
} from "@/data/duck-game-plan";

export const GAME_PLAN_EVENTS = {
  start: "duck_game_plan_start",
  stepComplete: "duck_game_plan_step_complete",
  signup: "duck_game_plan_signup",
  resultView: "duck_game_plan_result_view",
  internalClick: "duck_game_plan_internal_click",
  /**
   * A click on an entry CTA (homepage band, starter guide) *before* any
   * selection exists. Deliberately carries no `recommendation_id` and no
   * `result_type`: there is no recommendation yet, and a synthetic one would
   * pollute result-level reporting.
   */
  entryClick: "duck_game_plan_entry_click",
} as const;

export type GamePlanEventName = (typeof GAME_PLAN_EVENTS)[keyof typeof GAME_PLAN_EVENTS];

/** The four answered questions, plus the email step. Low cardinality by design. */
export const GAME_PLAN_STEPS = ["cut", "method", "concern", "party_size", "email"] as const;
export type GamePlanStep = (typeof GAME_PLAN_STEPS)[number];

export const GAME_PLAN_RESULT_TYPES = ["exact", "general"] as const;
export type GamePlanResultType = (typeof GAME_PLAN_RESULT_TYPES)[number];

export const GAME_PLAN_PROPERTY_ALLOWLIST: Readonly<
  Record<GamePlanEventName, readonly string[]>
> = {
  duck_game_plan_start: ["placement", "source_path"],
  duck_game_plan_step_complete: [
    "placement",
    "source_path",
    "step",
    "cut",
    "method",
    "concern",
    "party_size_bucket",
  ],
  duck_game_plan_signup: [
    "placement",
    "source_path",
    "cut",
    "method",
    "concern",
    "party_size_bucket",
    "recommendation_id",
    "result_type",
  ],
  duck_game_plan_result_view: [
    "placement",
    "source_path",
    "cut",
    "method",
    "concern",
    "party_size_bucket",
    "recommendation_id",
    "result_type",
  ],
  duck_game_plan_internal_click: [
    "placement",
    "source_path",
    "destination_path",
    "recommendation_id",
    "result_type",
  ],
};

/** Path-only normalization: no query string, no hash, never a full URL. */
export function safeGamePlanPath(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const bare = (raw.split("#")[0] ?? "").split("?")[0] ?? "";
  if (!bare) return "/";
  if (/^[a-z]+:/i.test(bare)) return undefined;
  return bare.startsWith("/") ? bare : `/${bare}`;
}

function member<T extends string>(allowed: readonly T[], value: unknown): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

export interface GamePlanEventInput {
  placement: string;
  sourcePath?: string | undefined;
  step?: GamePlanStep | undefined;
  cut?: GamePlanCut | undefined;
  method?: GamePlanMethod | undefined;
  concern?: GamePlanConcern | undefined;
  partySize?: GamePlanPartySize | undefined;
  recommendationId?: string | undefined;
  resultType?: GamePlanResultType | undefined;
  destinationPath?: string | undefined;
}

export interface BuiltGamePlanEvent {
  name: GamePlanEventName;
  params: Record<string, string>;
}

/** Recommendation ids are always `<cut>_<method>` — validated, never free text. */
export function isRecommendationId(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const [cut, method] = value.split("_");
  return (
    member(GAME_PLAN_CUTS, cut) !== undefined && member(GAME_PLAN_METHODS, method) !== undefined
  );
}

export function buildGamePlanEvent(
  name: GamePlanEventName,
  input: GamePlanEventInput,
): BuiltGamePlanEvent {
  const candidate: Record<string, string | undefined> = {
    placement: input.placement.slice(0, 64),
    source_path: safeGamePlanPath(input.sourcePath),
    step: member(GAME_PLAN_STEPS, input.step),
    cut: member(GAME_PLAN_CUTS, input.cut),
    method: member(GAME_PLAN_METHODS, input.method),
    concern: member(GAME_PLAN_CONCERNS, input.concern),
    party_size_bucket: member(GAME_PLAN_PARTY_SIZES, input.partySize),
    recommendation_id: isRecommendationId(input.recommendationId)
      ? (input.recommendationId as string)
      : undefined,
    result_type: member(GAME_PLAN_RESULT_TYPES, input.resultType),
    destination_path: safeGamePlanPath(input.destinationPath),
  };

  const allowed = GAME_PLAN_PROPERTY_ALLOWLIST[name];
  const params: Record<string, string> = {};
  for (const key of allowed) {
    const value = candidate[key];
    if (value !== undefined && value !== "") params[key] = value;
  }
  return { name, params };
}
