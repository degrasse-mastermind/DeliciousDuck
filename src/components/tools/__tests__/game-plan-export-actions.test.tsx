// @vitest-environment happy-dom
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
import { act } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveGamePlan } from "@/data/duck-game-plan";
import { planFileName, planToText } from "@/lib/game-plan-export";

const trackGamePlanExport = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackGamePlanExport: (...args: unknown[]) => trackGamePlanExport(...args),
}));

const { GamePlanExportActions } = await import("@/components/tools/GamePlanExportActions");

const plan = resolveGamePlan({
  cut: "duck-breast",
  method: "pan",
  concern: "crispy-skin",
  partySize: "1-2",
});

function renderActions() {
  return render(<GamePlanExportActions plan={plan} placement="game-plan_tool" />);
}

beforeEach(() => {
  trackGamePlanExport.mockClear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.classList.remove("dd-print-plan");
});

describe("export controls", () => {
  it("exposes all three actions as accessible buttons inside a print-hidden container", () => {
    const { container } = renderActions();
    for (const name of [/print plan/i, /view as plain text/i, /download \(\.txt\)/i]) {
      expect(screen.getByRole("button", { name })).toBeTruthy();
    }
    expect(container.querySelector("[data-print-hide]")).toBeTruthy();
  });

  it("wires aria-expanded/aria-controls and focuses the revealed text panel", async () => {
    vi.useFakeTimers();
    renderActions();
    const toggle = screen.getByRole("button", { name: /view as plain text/i });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-controls")).toBe("dd-plan-text");

    await act(async () => {
      toggle.click();
    });
    const panel = document.getElementById("dd-plan-text");
    expect(panel?.textContent).toBe(planToText(plan));
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(document.activeElement).toBe(panel);
    expect(screen.getByRole("button", { name: /hide plain text/i }).getAttribute("aria-expanded")).toBe(
      "true",
    );
    vi.useRealTimers();
  });

  it("fires the view event on open only, once per activation", async () => {
    const toggle = renderActions() && screen.getByRole("button", { name: /view as plain text/i });
    await act(async () => {
      toggle.click();
    });
    expect(trackGamePlanExport).toHaveBeenCalledTimes(1);
    expect(trackGamePlanExport.mock.calls[0]?.[0]).toEqual({
      placement: "game-plan_tool",
      action: "view",
      recommendationId: plan.recommendationId,
      resultType: plan.resultType,
    });
    await act(async () => {
      screen.getByRole("button", { name: /hide plain text/i }).click();
    });
    expect(trackGamePlanExport).toHaveBeenCalledTimes(1);
  });

  it("downloads a stable filename, cleans up the anchor and revokes the URL later", async () => {
    vi.useFakeTimers();
    const created: string[] = [];
    const revoked: string[] = [];
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: (blob: Blob) => {
        created.push(String(blob.size));
        return "blob:plan";
      },
      revokeObjectURL: (url: string) => revoked.push(url),
    });
    let downloadName = "";
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function mocked(this: HTMLAnchorElement) {
        downloadName = this.download;
        expect(document.body.contains(this)).toBe(true);
      });

    renderActions();
    await act(async () => {
      screen.getByRole("button", { name: /download \(\.txt\)/i }).click();
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(downloadName).toBe(planFileName(plan));
    expect(created).toHaveLength(1);
    expect(document.querySelectorAll("a[download]")).toHaveLength(0);
    expect(revoked).toEqual([]);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(revoked).toEqual(["blob:plan"]);
    expect(trackGamePlanExport.mock.calls[0]?.[0]).toMatchObject({ action: "download" });
    vi.useRealTimers();
  });

  it("marks the plan for print-only isolation and reports the print action", async () => {
    const printSpy = vi.fn();
    vi.stubGlobal("print", printSpy);
    renderActions();
    await act(async () => {
      screen.getByRole("button", { name: /print plan/i }).click();
    });
    expect(printSpy).toHaveBeenCalledTimes(1);
    expect(document.body.classList.contains("dd-print-plan")).toBe(true);
    expect(trackGamePlanExport.mock.calls[0]?.[0]).toMatchObject({ action: "print" });
  });
});
