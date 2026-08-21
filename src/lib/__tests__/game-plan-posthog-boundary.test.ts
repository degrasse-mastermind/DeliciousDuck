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
  const mod = await import("@/lib/posthog");
  mod.resetPostHogStateForTests();
  mod.initPostHog("/tools/duck-game-plan");
  return mod;
}

describe("Game Plan events reach the PostHog boundary", () => {
  beforeEach(() => {
    capture.mockClear();
  });

  it("captures all six Game Plan events", async () => {
    const { captureEvent } = await loadPostHog();
    const names = Object.values(GAME_PLAN_EVENTS);
    expect(names).toHaveLength(6);
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
