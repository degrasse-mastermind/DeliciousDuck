import { describe, expect, it } from "vitest";
import {
  buildPreCallbackResult,
  reconcileAgentResult,
} from "../scripts/reconcile-agent-result.mjs";

const base = {
  baseResult: "## DD-2026-002\n\nCodex task status: **success**\n",
  codexStatus: "success",
  workMode: "review",
  hasChanges: false,
  publishResult: "skipped",
  pullRequestUrl: "",
};

describe("final task-ledger reconciliation", () => {
  it("builds a truthful pending callback payload with known execution and publishing results", () => {
    const result = buildPreCallbackResult({ ...base, callbackApproved: true });
    expect(result.publishingStatus).toBe("not-required");
    expect(result.taskStatus).toBe("completed");
    expect(result.callbackStatus).toBe("attempting");
    expect(result.reconciliationStatus).toBe("pending-callback-reconciliation");
    expect(result.markdown).toContain("Codex task status: **success**");
    expect(result.markdown).toContain("Publishing status: **not-required**");
    expect(result.markdown).toContain("Task status: **completed**");
    expect(result.markdown).toContain("Callback status: **attempting**");
    expect(result.markdown).toContain("Reconciliation status: **pending-callback-reconciliation**");
    expect(result.markdown).not.toContain("Overall status:");
    expect(result.markdown).not.toContain("Callback status: **completed**");
  });

  it("renders a terminal task result with no reconciliation when no callback was approved", () => {
    const result = buildPreCallbackResult({ ...base, callbackApproved: false });
    expect(result.taskStatus).toBe("completed");
    expect(result.callbackStatus).toBe("not-approved");
    expect(result.reconciliationStatus).toBe("not-required");
  });

  it.each(["failure", "cancelled", "timed-out"])(
    "preserves terminal Codex %s while callback reconciliation remains pending",
    (codexStatus) => {
      const result = buildPreCallbackResult({
        ...base,
        codexStatus,
        callbackApproved: true,
      });
      expect(result.taskStatus).toBe("failed");
      expect(result.callbackStatus).toBe("attempting");
      expect(result.reconciliationStatus).toBe("pending-callback-reconciliation");
      expect(result.markdown).toContain("Task status: **failed**");
      expect(result.markdown).not.toContain("Callback status: **failed**");
    },
  );

  it("preserves a required publishing failure while callback reconciliation remains pending", () => {
    const result = buildPreCallbackResult({
      ...base,
      workMode: "implement",
      hasChanges: true,
      publishResult: "failure",
      callbackApproved: true,
    });
    expect(result.publishingStatus).toBe("failed");
    expect(result.taskStatus).toBe("failed");
    expect(result.callbackStatus).toBe("attempting");
    expect(result.reconciliationStatus).toBe("pending-callback-reconciliation");
  });

  it("records no callback approval without transmitting or downgrading a successful task", () => {
    const result = reconcileAgentResult({ ...base, callbackApproved: false });
    expect(result.callbackStatus).toBe("not-approved");
    expect(result.publishingStatus).toBe("not-required");
    expect(result.overallStatus).toBe("completed");
    expect(result.markdown).toContain("Publishing status: **not-required**");
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
      callbackStepOutcome: "failure",
    });
    expect(result.callbackStatus).toBe(callbackStatus);
    expect(result.overallStatus).toBe(overallStatus);
    expect(result.markdown).toContain(`Callback status: **${callbackStatus}**`);
    expect(result.markdown).toContain(`Overall status: **${overallStatus}**`);
  });

  it("records not-attempted only when the approved callback step was skipped", () => {
    const result = reconcileAgentResult({
      ...base,
      callbackApproved: true,
      callbackStatus: "",
      callbackStepOutcome: "skipped",
    });
    expect(result.callbackStatus).toBe("not-attempted");
    expect(result.overallStatus).toBe("blocked");
    expect(result.markdown).toContain("Callback status: **not-attempted**");
  });

  it.each(["failure", "cancelled"])(
    "records attempted-no-result when the callback step ends %s without outputs",
    (callbackStepOutcome) => {
      const result = reconcileAgentResult({
        ...base,
        callbackApproved: true,
        callbackStatus: "",
        callbackStepOutcome,
      });
      expect(result.callbackStatus).toBe("attempted-no-result");
      expect(result.overallStatus).toBe("failed");
      expect(result.markdown).toContain(`callback-step-${callbackStepOutcome}-without-result`);
    },
  );

  it("fails closed when a successful callback step has no structured result", () => {
    const result = reconcileAgentResult({
      ...base,
      callbackApproved: true,
      callbackStatus: "",
      callbackStepOutcome: "success",
    });
    expect(result.callbackStatus).toBe("blocked");
    expect(result.overallStatus).toBe("blocked");
    expect(result.markdown).toContain("callback-step-success-without-result");
  });

  it("fails closed when an approved callback has an unrecognized result", () => {
    const result = reconcileAgentResult({
      ...base,
      callbackApproved: true,
      callbackStatus: "unexpected",
      callbackStepOutcome: "failure",
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

  it.each(["cancelled", "timed-out", "failure"])(
    "keeps an approved callback attempt distinct when Codex is %s and no callback output exists",
    (codexStatus) => {
      const result = reconcileAgentResult({
        ...base,
        codexStatus,
        callbackApproved: true,
        callbackStatus: "",
        callbackStepOutcome: "failure",
      });
      expect(result.callbackStatus).toBe("attempted-no-result");
      expect(result.overallStatus).toBe("failed");
    },
  );

  it("completes required implementation publishing only with a successful job and valid PR URL", () => {
    const result = reconcileAgentResult({
      ...base,
      workMode: "implement",
      hasChanges: true,
      publishResult: "success",
      pullRequestUrl: "https://github.com/degrasse-mastermind/DeliciousDuck/pull/19",
      callbackApproved: false,
    });
    expect(result.publishingStatus).toBe("completed");
    expect(result.overallStatus).toBe("completed");
  });

  it.each([
    ["failure", "https://github.com/degrasse-mastermind/DeliciousDuck/pull/19"],
    ["success", ""],
    ["success", "https://example.com/degrasse-mastermind/DeliciousDuck/pull/19"],
  ])("fails required publishing for result %s and URL %s", (publishResult, pullRequestUrl) => {
    const result = reconcileAgentResult({
      ...base,
      workMode: "implement",
      hasChanges: true,
      publishResult,
      pullRequestUrl,
      callbackApproved: false,
    });
    expect(result.publishingStatus).toBe("failed");
    expect(result.overallStatus).toBe("failed");
  });

  it("does not require publishing when implementation produced no changes", () => {
    const result = reconcileAgentResult({
      ...base,
      workMode: "implement",
      hasChanges: false,
      callbackApproved: false,
    });
    expect(result.publishingStatus).toBe("not-required");
    expect(result.overallStatus).toBe("completed");
  });

  it("does not downgrade a publishing failure to blocked", () => {
    const result = reconcileAgentResult({
      ...base,
      workMode: "implement",
      hasChanges: true,
      publishResult: "failure",
      pullRequestUrl: "",
      callbackApproved: true,
      callbackStatus: "blocked",
    });
    expect(result.publishingStatus).toBe("failed");
    expect(result.overallStatus).toBe("failed");
  });
});
