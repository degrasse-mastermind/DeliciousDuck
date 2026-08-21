import { describe, expect, it } from "vitest";

import {
  GAME_PLAN_CONCERNS,
  GAME_PLAN_PARTY_SIZES,
  methodsForCut,
  resolveGamePlan,
  GAME_PLAN_CUTS,
  type GamePlanSelection,
} from "@/data/duck-game-plan";

/**
 * Guards the personalization precedence contract:
 *
 *   cut+method critical move  >  cut+concern override  >  concern  >  cut
 *
 * plus the rule that the concern is never silently discarded — when something
 * more specific wins, the concern rides along as `refinement`.
 */

function plan(partial: Partial<GamePlanSelection>): GamePlanSelection {
  return {
    cut: "duck-breast",
    method: "pan",
    concern: "overcooking",
    partySize: "3-4",
    ...partial,
  };
}

describe("resolveGamePlan precedence", () => {
  it("lets the chosen method outrank the generic concern move", () => {
    const result = resolveGamePlan(plan({ cut: "duck-breast", method: "pan", concern: "overcooking" }));
    expect(result.criticalMoveSource).toBe("method");
    expect(result.criticalMove).toMatch(/cold, dry pan/i);
    // The worry still gets answered, as a modifier.
    expect(result.refinement).toMatch(/carryover/i);
  });

  it("keeps pan guidance for duck breast + pan + crispy skin", () => {
    const result = resolveGamePlan(plan({ concern: "crispy-skin" }));
    expect(result.criticalMoveSource).toBe("method");
    expect(result.criticalMove).toMatch(/cold, dry pan/i);
    expect(result.refinement).toMatch(/dry the skin/i);
  });

  it("makes the method change the most prominent recommendation", () => {
    const pan = resolveGamePlan(plan({ method: "pan", concern: "crispy-skin" }));
    const oven = resolveGamePlan(plan({ method: "oven", concern: "crispy-skin" }));
    const airFryer = resolveGamePlan(plan({ method: "air-fryer", concern: "crispy-skin" }));
    expect(new Set([pan.criticalMove, oven.criticalMove, airFryer.criticalMove]).size).toBe(3);
    expect(oven.criticalMove).toMatch(/oven/i);
    expect(airFryer.criticalMove).toMatch(/render low/i);
  });

  it("gives duck confit + oven + crispy skin a confit-specific final crisping move", () => {
    const result = resolveGamePlan(
      plan({ cut: "duck-confit", method: "oven", concern: "crispy-skin" }),
    );
    expect(result.criticalMoveSource).toBe("cut-concern");
    expect(result.criticalMove).toMatch(/lift the legs from the fat/i);
    // The generic "score through fat only" breast move must not appear.
    expect(result.criticalMove).not.toMatch(/score through fat/i);
    expect(result.refinement).toBeUndefined();
  });

  it("judges whole duck + oven + overcooking at the thigh", () => {
    const result = resolveGamePlan(
      plan({ cut: "whole-duck", method: "oven", concern: "overcooking" }),
    );
    expect(result.criticalMoveSource).toBe("cut-concern");
    expect(result.criticalMove).toMatch(/thigh/i);
    expect(result.criticalMove).not.toMatch(/pull below your finish temperature/i);
  });

  it("never gives duck legs a raw-pan or fast-cook move, for any concern", () => {
    for (const method of ["pan", "air-fryer"] as const) {
      for (const concern of GAME_PLAN_CONCERNS) {
        const result = resolveGamePlan(plan({ cut: "duck-legs", method, concern }));
        expect(result.criticalMoveSource).toBe("method");
        expect(result.criticalMove).toMatch(/slowly/i);
      }
    }
  });

  it("falls back to the cut move when neither method nor concern is specific", () => {
    const result = resolveGamePlan(
      plan({ cut: "not-bought-yet", method: "unsure", concern: "what-to-serve" }),
    );
    expect(result.criticalMoveSource).toBe("concern");
    expect(result.refinement).toBeUndefined();
  });

  it("always produces a non-empty critical move, and a refinement only when earned", () => {
    for (const cut of GAME_PLAN_CUTS) {
      for (const method of methodsForCut(cut)) {
        for (const concern of GAME_PLAN_CONCERNS) {
          for (const partySize of GAME_PLAN_PARTY_SIZES) {
            const result = resolveGamePlan({ cut, method, concern, partySize });
            expect(result.criticalMove.length).toBeGreaterThan(20);
            if (result.criticalMoveSource === "concern" || result.criticalMoveSource === "cut-concern") {
              expect(result.refinement).toBeUndefined();
            } else {
              expect(result.refinement).toBeTruthy();
            }
          }
        }
      }
    }
  });
});

describe("editorial claim guards", () => {
  it("carries no unsupported oven-drift figure or yield anecdote", () => {
    for (const cut of GAME_PLAN_CUTS) {
      for (const method of methodsForCut(cut)) {
        const result = resolveGamePlan({
          cut,
          method,
          concern: "timing",
          partySize: "3-4",
        });
        const text = [result.timing, result.saveTheFat ?? "", result.serving].join(" ");
        expect(text).not.toMatch(/15–25°F off their dial/);
        expect(text).not.toMatch(/enough to roast potatoes in/);
        expect(text).not.toMatch(/gets better with each batch/);
        expect(text).not.toMatch(/we tested|foolproof/i);
      }
    }
  });
});
