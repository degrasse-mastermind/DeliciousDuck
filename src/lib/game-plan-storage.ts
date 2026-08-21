/**
 * Privacy-safe persistence for a Duck Game Plan result.
 *
 * Only the four finite selections are stored, in `sessionStorage`, so a refresh
 * still shows the plan. No email address, no token, no free text, and nothing
 * that leaves the browser. Anything unrecognised is discarded and the planner
 * falls back to question one.
 */

import {
  GAME_PLAN_CONCERNS,
  GAME_PLAN_CUTS,
  GAME_PLAN_METHODS,
  GAME_PLAN_PARTY_SIZES,
  type GamePlanSelection,
} from "@/data/duck-game-plan";

export const GAME_PLAN_STORAGE_KEY = "dd_duck_game_plan";

function isMember(allowed: readonly string[], value: unknown): boolean {
  return typeof value === "string" && allowed.includes(value);
}

/** Accepts only a complete selection built from the four known enums. */
export function parseStoredSelection(raw: unknown): GamePlanSelection | null {
  if (typeof raw !== "string" || raw.length > 500) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const value = parsed as Record<string, unknown>;
  if (
    isMember(GAME_PLAN_CUTS, value["cut"]) &&
    isMember(GAME_PLAN_METHODS, value["method"]) &&
    isMember(GAME_PLAN_CONCERNS, value["concern"]) &&
    isMember(GAME_PLAN_PARTY_SIZES, value["partySize"])
  ) {
    return {
      cut: value["cut"],
      method: value["method"],
      concern: value["concern"],
      partySize: value["partySize"],
    } as GamePlanSelection;
  }
  return null;
}

export function readStoredSelection(): GamePlanSelection | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredSelection(window.sessionStorage.getItem(GAME_PLAN_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeStoredSelection(selection: GamePlanSelection): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      GAME_PLAN_STORAGE_KEY,
      JSON.stringify({
        cut: selection.cut,
        method: selection.method,
        concern: selection.concern,
        partySize: selection.partySize,
      }),
    );
  } catch {
    /* storage unavailable — the plan simply won't survive a refresh */
  }
}

export function clearStoredSelection(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(GAME_PLAN_STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}
