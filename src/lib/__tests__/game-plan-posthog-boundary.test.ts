import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  GAME_PLAN_EVENTS,
  GAME_PLAN_PLACEMENTS,
  GAME_PLAN_PROPERTY_ALLOWLIST,
  buildGamePlanEvent,
  safeGamePlanPath,
  safeGamePlanPlacement,
} from "@/lib/game-plan-events";

const capture = vi.fn();
vi.mock("posthog-js", () => ({
  default: {
    capture: (...args: unknown[]) => capture(...args),
    init: vi.fn(),
    set_config: vi.fn(),
    stopSessionRecording: vi.fn(),
  },
}));
vi.mock("@/lib/analytics-gate", () => ({ analyticsEnabled: () => true }));

async function loadPostHog() {
  vi.stubGlobal("window", {
    location: {
      hostname: "www.deliciousduck.com",
      pathname: "/tools/duck-game-plan",
      search: "",
      origin: "https://www.deliciousduck.com",
    },
  });
  vi.resetModules();
  const mod = await import("@/lib/posthog");
  mod.resetPostHogStateForTests();
  mod.initPostHog("/tools/duck-game-plan");
  return mod;
}

describe("Game Plan events reach the PostHog boundary", () => {
  beforeEach(() => {
    capture.mockClear();
  });

  it("captures all seven Game Plan events", async () => {
    const { captureEvent } = await loadPostHog();
    const names = Object.values(GAME_PLAN_EVENTS);
    expect(names).toHaveLength(7);
    for (const name of names) {
      captureEvent(name, { placement: "game-plan_tool" });
    }
    expect(capture.mock.calls.map((c) => c[0])).toEqual(names);
  });

  it("has a PostHog allowlist entry for every Game Plan event", () => {
    for (const name of Object.values(GAME_PLAN_EVENTS)) {
      expect(GAME_PLAN_PROPERTY_ALLOWLIST[name].length).toBeGreaterThan(0);
    }
  });

  it("strips disallowed properties at the capture boundary", async () => {
    const { captureEvent } = await loadPostHog();
    captureEvent(GAME_PLAN_EVENTS.signup, {
      placement: "game-plan_tool",
      cut: "duck-breast",
      email: "a@b.com",
      answer_text: "medium rare please",
      destination_path: "/recipes/pan-seared-duck-breast",
    } as never);
    expect(capture).toHaveBeenCalledTimes(1);
    const props = capture.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(props).toEqual({ placement: "game-plan_tool", cut: "duck-breast" });
    expect(JSON.stringify(props)).not.toContain("@");
  });
});

describe("export event at the capture boundary", () => {
  beforeEach(() => capture.mockClear());

  it("captures duck_game_plan_export with only the four permitted properties", async () => {
    const { captureEvent } = await loadPostHog();
    captureEvent(GAME_PLAN_EVENTS.export, {
      placement: "game-plan_tool",
      action: "download",
      recommendation_id: "duck-breast_pan",
      result_type: "exact",
      source_path: "/tools/duck-game-plan",
      destination_path: "/recipes/pan-seared-duck-breast",
      email: "a@b.com",
      file_name: "duck-game-plan-duck-breast-pan.txt",
      url: "https://deliciousduck.com/tools/duck-game-plan?token=abc",
      headline: "Score the skin, start it cold",
    } as never);
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture.mock.calls[0]?.[0]).toBe("duck_game_plan_export");
    const props = capture.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(props).toEqual({
      placement: "game-plan_tool",
      action: "download",
      recommendation_id: "duck-breast_pan",
      result_type: "exact",
    });
    expect(JSON.stringify(props)).not.toContain("@");
    expect(JSON.stringify(props)).not.toContain("http");
  });

  it("emits exactly the four properties through the GA4 helper", async () => {
    await loadPostHog();
    const { trackGamePlanExport } = await import("@/lib/analytics");
    const calls: unknown[][] = [];
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag = (...a) => calls.push(a);
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
    trackGamePlanExport({
      placement: "game-plan_tool",
      action: "print",
      recommendationId: "duck-breast_pan",
      resultType: "exact",
    });
    const props = (capture.mock.calls.at(-1)?.[1] ?? {}) as Record<string, unknown>;
    expect(Object.keys(props).sort()).toEqual([
      "action",
      "placement",
      "recommendation_id",
      "result_type",
    ]);
    expect(props["action"]).toBe("print");
  });
});


describe("safeGamePlanPath", () => {
  it("accepts ordinary internal paths", () => {
    expect(safeGamePlanPath("/tools/duck-game-plan")).toBe("/tools/duck-game-plan");
    expect(safeGamePlanPath("recipes/confit")).toBe("/recipes/confit");
  });

  it("drops query strings and fragments", () => {
    expect(safeGamePlanPath("/x?email=a@b.com#top")).toBe("/x");
  });

  it("rejects schemed and protocol-relative URLs", () => {
    for (const bad of [
      "https://evil.example/x",
      "javascript:alert(1)",
      "//example.com/path",
      "  //example.com/path",
      "\\\\example.com/path",
    ]) {
      expect(safeGamePlanPath(bad)).toBeUndefined();
    }
  });
});

describe("placement allowlist", () => {
  it("accepts every known placement", () => {
    for (const p of GAME_PLAN_PLACEMENTS) expect(safeGamePlanPlacement(p)).toBe(p);
  });

  it("never emits arbitrary caller text", () => {
    expect(safeGamePlanPlacement("a@b.com")).toBe("other");
    expect(safeGamePlanPlacement(undefined)).toBe("other");
    const event = buildGamePlanEvent(GAME_PLAN_EVENTS.start, {
      placement: "free text with email a@b.com",
    });
    expect(event.params["placement"]).toBe("other");
  });
});
