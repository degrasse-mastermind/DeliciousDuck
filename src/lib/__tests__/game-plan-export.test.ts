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
  method: "pan",
  concern: "crispy-skin",
  partySize: "1-2",
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

  it("serializes no URL that retains a query string or fragment", () => {
    const urls = text.match(/https?:\/\/\S+/g) ?? [];
    expect(urls.length).toBeGreaterThan(3);
    for (const url of urls) {
      expect(url).not.toContain("?");
      expect(url).not.toContain("#");
    }
  });

  it("does not claim the plain-text file has embedded links", () => {
    expect(text).not.toContain("every line above links to the full guide behind it");
    expect(text).toContain("use the URLs above to open the full guides");
  });
});

describe("absolutePlanUrl", () => {
  it("canonicalizes relative paths and strips query and hash", () => {
    expect(absolutePlanUrl("/cook/x?a=1#top")).toBe("https://deliciousduck.com/cook/x");
    expect(absolutePlanUrl("gear/y")).toBe("https://deliciousduck.com/gear/y");
    expect(absolutePlanUrl("gear/y?utm_source=email#buy")).toBe("https://deliciousduck.com/gear/y");
  });

  it("keeps absolute http(s) URLs absolute but parameter-free", () => {
    expect(absolutePlanUrl("https://www.thermoworks.com/thermapen-one/")).toBe(
      "https://www.thermoworks.com/thermapen-one/",
    );
    expect(absolutePlanUrl("https://deliciousduck.com/cook/x?token=abc#top")).toBe(
      "https://deliciousduck.com/cook/x",
    );
    expect(absolutePlanUrl("https://www.thermoworks.com/thermapen-one/?ref=dd#buy")).toBe(
      "https://www.thermoworks.com/thermapen-one/",
    );
    expect(absolutePlanUrl("http://example.com/a?b=1")).toBe("http://example.com/a");
  });

  it("rejects protocol-relative references instead of rewriting them", () => {
    for (const bad of ["//evil.example/x", "  //evil.example/x", "\\\\evil.example/x"]) {
      expect(absolutePlanUrl(bad)).toBeNull();
    }
  });

  it("rejects non-http(s) schemes", () => {
    for (const bad of [
      "mailto:cook@deliciousduck.com",
      "javascript:alert(1)",
      "data:text/plain;base64,aGk=",
      "ftp://example.com/x",
    ]) {
      expect(absolutePlanUrl(bad)).toBeNull();
    }
  });

  it("rejects malformed, credentialed and blank input", () => {
    for (const bad of [
      "https://",
      "http://",
      "https://user:pass@example.com/x",
      "cook@deliciousduck.com",
      "",
      "   ",
      undefined,
      null,
      42,
    ]) {
      expect(absolutePlanUrl(bad)).toBeNull();
    }
  });
});


describe("planFileName", () => {
  it("is stable and sanitized", () => {
    expect(planFileName(plan)).toBe(
      `duck-game-plan-${plan.recommendationId.replace("_", "-")}.txt`,
    );
    expect(planFileName(plan)).toMatch(/^duck-game-plan-[a-z0-9-]+\.txt$/);
  });
});

describe("duck_game_plan_export contract", () => {
  it("allowlists exactly the four permitted properties", () => {
    expect([...GAME_PLAN_PROPERTY_ALLOWLIST[GAME_PLAN_EVENTS.export]].sort()).toEqual([
      "action",
      "placement",
      "recommendation_id",
      "result_type",
    ]);
  });

  it("builds exactly the four properties and never source_path", () => {
    const event = buildGamePlanEvent(GAME_PLAN_EVENTS.export, {
      placement: "game-plan_tool",
      action: "download",
      recommendationId: plan.recommendationId,
      resultType: plan.resultType,
      sourcePath: "/tools/duck-game-plan",
    });
    expect(Object.keys(event.params).sort()).toEqual([
      "action",
      "placement",
      "recommendation_id",
      "result_type",
    ]);
    expect(event.params["source_path"]).toBeUndefined();
  });

  it("keeps source_path for the other six Game Plan events", () => {
    for (const name of Object.values(GAME_PLAN_EVENTS)) {
      if (name === GAME_PLAN_EVENTS.export) continue;
      const event = buildGamePlanEvent(name, {
        placement: "game-plan_tool",
        sourcePath: "/tools/duck-game-plan",
      });
      expect(event.params["source_path"]).toBe("/tools/duck-game-plan");
    }
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
