// @vitest-environment happy-dom
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/analytics", () => ({
  trackGamePlanExport: vi.fn(),
  trackGamePlanResultView: vi.fn(),
  trackGamePlanInternalClick: vi.fn(),
  trackGamePlanStart: vi.fn(),
  trackGamePlanStepComplete: vi.fn(),
  trackGamePlanSignup: vi.fn(),
}));

const { DuckGamePlanResult } = await import("@/components/tools/DuckGamePlanFlow");

afterEach(cleanup);

/** Everything inside `[data-print-hide]` is dropped by the print stylesheet. */
function printedText(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-print-hide]").forEach((node) => node.remove());
  const card = clone.querySelector("[data-plan-print]");
  return (card?.textContent ?? "").replace(/\s+/g, " ");
}

describe("Game Plan print contract", () => {
  const { container } = { container: document.createElement("div") };
  void container;

  it("prints the kitchen card and excludes export and restart controls", () => {
    const { container: root } = render(
      <DuckGamePlanResult
        selection={{
          cut: "duck-breast",
          method: "pan",
          concern: "crispy-skin",
          partySize: "1-2",
        }}
        placement="game-plan_tool"
        onRestart={() => {}}
      />,
    );

    const printed = printedText(root);
    // Kitchen content survives.
    for (const label of [
      "Biggest risk",
      "Critical move",
      "Temperature",
      "Timing",
      "Equipment",
      "Start here",
    ]) {
      expect(printed).toContain(label);
    }

    // Controls do not.
    for (const control of [
      "Build a plan for something else",
      "Print plan",
      "View as plain text",
      "Download (.txt)",
      "Take it to the kitchen",
    ]) {
      expect(printed).not.toContain(control);
    }

    // The restart control is explicitly marked, not merely absent by accident.
    const restart = [...root.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Build a plan for something else"),
    );
    expect(restart?.hasAttribute("data-print-hide")).toBe(true);
  });
});
