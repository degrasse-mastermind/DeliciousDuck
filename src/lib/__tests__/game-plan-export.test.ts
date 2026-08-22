import { describe, expect, it } from "vitest";

import { resolveGamePlan } from "@/data/duck-game-plan";
import {
  GAME_PLAN_EVENTS,
  GAME_PLAN_EXPORT_ACTIONS,
  GAME_PLAN_PROPERTY_ALLOWLIST,
  buildGamePlanEvent,
} from "@/lib/game-plan-events";
import { absolutePlanUrl, planFileName, planToText } from "@/lib/game-plan-export";

const plan = resolveGamePlan({
  cut: "duck-breast",
  method: "pan-sear",
  concern: "crispy-skin",
  partySize: "2",
});

describe("planToText", () => {
  const text = planToText(plan);

  it("includes every applicable plan section", () => {
    for (const label of [
      "YOUR DUCK GAME PLAN",
      "BIGGEST RISK",
      "CRITICAL MOVE",
      "TEMPERATURE",
      "TIMING",
      "EQUIPMENT",
      "REST",
      "WHAT TO SERVE",
      "SAVE THE FAT",
      "START HERE",
    ]) {
      expect(text).toContain(label);
    }
    expect(text).toContain(plan.headline);
    expect(text).toContain(plan.summary);
    expect(text).toContain(plan.temperature);
    if (plan.serving) expect(text).toContain("HOW MUCH");
  });

  it("serializes every internal link category as an absolute canonical URL", () => {
    const links = [
      plan.primary,
      plan.equipment,
      ...plan.pairing,
      ...plan.secondary,
      ...(plan.commercial ? [plan.commercial] : []),
    ];
    expect(links.length).toBeGreaterThan(3);
    for (const link of links) {
      if (link.href.startsWith("/")) {
        expect(text).toContain(`https://deliciousduck.com${link.href}`);
      }
    }
    // No bare relative path survives in the file.
    expect(text).not.toMatch(/\n\s{2}\/[a-z]/);
  });

  it("carries no query strings, fragments, emails or tokens", () => {
    expect(text).not.toContain("@");
    expect(text).not.toContain("?");
    expect(text).not.toContain("#");
    expect(text).not.toMatch(/token|api[-_ ]?key/i);
  });

  it("does not claim the plain-text file has embedded links", () => {
    expect(text).not.toContain("every line above links to the full guide behind it");
    expect(text).toContain("use the URLs above to open the full guides");
  });
});

describe("absolutePlanUrl", () => {
  it("preserves already-absolute https URLs", () => {
    expect(absolutePlanUrl("https://www.thermoworks.com/thermapen-one/")).toBe(
      "https://www.thermoworks.com/thermapen-one/",
    );
  });

  it("prefixes relative paths and strips query and hash", () => {
    expect(absolutePlanUrl("/cook/x?a=1#top")).toBe("https://deliciousduck.com/cook/x");
    expect(absolutePlanUrl("gear/y")).toBe("https://deliciousduck.com/gear/y");
  });
});

describe("planFileName", () => {
  it("is stable and sanitized", () => {
    expect(planFileName(plan)).toBe(`duck-game-plan-${plan.recommendationId.replace("_", "-")}.txt`);
    expect(planFileName(plan)).toMatch(/^duck-game-plan-[a-z0-9-]+\.txt$/);
  });
});

describe("duck_game_plan_export contract", () => {
  it("allowlists exactly the permitted properties", () => {
    expect([...GAME_PLAN_PROPERTY_ALLOWLIST[GAME_PLAN_EVENTS.export]].sort()).toEqual([
      "action",
      "placement",
      "recommendation_id",
      "result_type",
      "source_path",
    ]);
  });

  it("emits only finite action values", () => {
    for (const action of GAME_PLAN_EXPORT_ACTIONS) {
      const event = buildGamePlanEvent(GAME_PLAN_EVENTS.export, {
        placement: "game-plan_tool",
        action,
        recommendationId: plan.recommendationId,
        resultType: plan.resultType,
      });
      expect(event.params["action"]).toBe(action);
    }
  });

  it("drops an invalid action and any extraneous property", () => {
    const event = buildGamePlanEvent(GAME_PLAN_EVENTS.export, {
      placement: "game-plan_tool",
      action: "email" as never,
      recommendationId: "not-a-real-id",
      resultType: plan.resultType,
      destinationPath: "/cook/x",
      cut: "duck-breast",
    });
    expect(event.params["action"]).toBeUndefined();
    expect(event.params["recommendation_id"]).toBeUndefined();
    expect(event.params["destination_path"]).toBeUndefined();
    expect(event.params["cut"]).toBeUndefined();
  });
});
