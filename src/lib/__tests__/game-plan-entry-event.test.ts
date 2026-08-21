import { describe, expect, it } from "vitest";

import {
  GAME_PLAN_EVENTS,
  GAME_PLAN_PROPERTY_ALLOWLIST,
  buildGamePlanEvent,
} from "@/lib/game-plan-events";

/**
 * Entry clicks happen before any question is answered, so they must not carry
 * (or invent) a recommendation id. This guards the split between the entry
 * event and the result-level internal-click event.
 */
describe("duck_game_plan_entry_click", () => {
  it("allows only placement, source path and destination path", () => {
    expect(GAME_PLAN_PROPERTY_ALLOWLIST[GAME_PLAN_EVENTS.entryClick]).toEqual([
      "placement",
      "source_path",
      "destination_path",
    ]);
  });

  it("drops a recommendation id and result type even if a caller passes them", () => {
    const event = buildGamePlanEvent(GAME_PLAN_EVENTS.entryClick, {
      placement: "home_game-plan",
      sourcePath: "/",
      destinationPath: "/tools/duck-game-plan",
      recommendationId: "duck-breast_pan",
      resultType: "exact",
    });
    expect(event.name).toBe("duck_game_plan_entry_click");
    expect(event.params).toEqual({
      placement: "home_game-plan",
      source_path: "/",
      destination_path: "/tools/duck-game-plan",
    });
    expect(event.params).not.toHaveProperty("recommendation_id");
    expect(event.params).not.toHaveProperty("result_type");
  });

  it("normalizes the destination to a bare same-origin path", () => {
    const event = buildGamePlanEvent(GAME_PLAN_EVENTS.entryClick, {
      placement: "starter-guide_game-plan",
      destinationPath: "/tools/duck-game-plan?email=a@b.com#top",
    });
    expect(event.params["destination_path"]).toBe("/tools/duck-game-plan");
    expect(JSON.stringify(event.params)).not.toContain("@");
  });

  it("still requires a valid recommendation id on result-level internal clicks", () => {
    const event = buildGamePlanEvent(GAME_PLAN_EVENTS.internalClick, {
      placement: "game-plan_tool",
      destinationPath: "/recipes/pan-seared-duck-breast",
      recommendationId: "not-a-real-id",
      resultType: "exact",
    });
    expect(event.params).not.toHaveProperty("recommendation_id");
  });
});

describe("entry CTA wiring", () => {
  it("no component sends a synthetic recommendation id from an entry CTA", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/components/site/GamePlanCta.tsx", "utf8"),
    );
    expect(source).toContain("trackGamePlanEntryClick");
    expect(source).not.toContain("not-bought-yet_unsure");
    expect(source).not.toContain("trackGamePlanInternalClick");
  });
});
