import { describe, expect, it } from "vitest";
import { reconcileAgentResult } from "../scripts/reconcile-agent-result.mjs";

const base = {
  baseResult: "## DD-2026-002\n\nCodex task status: **success**\n",
  codexStatus: "success",
};

describe("final task-ledger reconciliation", () => {
  it("records no callback approval without transmitting or downgrading a successful task", () => {
    const result = reconcileAgentResult({ ...base, callbackApproved: false });
    expect(result.callbackStatus).toBe("not-approved");
    expect(result.overallStatus).toBe("completed");
    expect(result.markdown).toContain("Callback status: **not-approved**");
    expect(result.markdown).toContain("Overall status: **completed**");
  });

  it.each([
    ["completed", "completed"],
    ["blocked", "blocked"],
    ["timed-out", "blocked"],
    ["failed", "failed"],
  ])("reconciles callback %s to overall %s", (callbackStatus, overallStatus) => {
    const result = reconcileAgentResult({
      ...base,
      callbackApproved: true,
      callbackStatus,
      callbackDetail: "safe-classification",
    });
    expect(result.callbackStatus).toBe(callbackStatus);
    expect(result.overallStatus).toBe(overallStatus);
    expect(result.markdown).toContain(`Callback status: **${callbackStatus}**`);
    expect(result.markdown).toContain(`Overall status: **${overallStatus}**`);
  });

  it("fails closed when an approved callback has no recognized result", () => {
    const result = reconcileAgentResult({
      ...base,
      callbackApproved: true,
      callbackStatus: "",
    });
    expect(result.callbackStatus).toBe("blocked");
    expect(result.overallStatus).toBe("blocked");
  });

  it("never masks a failed Codex task as completed", () => {
    const result = reconcileAgentResult({
      ...base,
      codexStatus: "failure",
      callbackApproved: false,
    });
    expect(result.overallStatus).toBe("failed");
  });
});
