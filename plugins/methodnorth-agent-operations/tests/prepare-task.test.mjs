import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildTaskPrompt, prepareTask, validateTaskContract } from "../scripts/prepare-task.mjs";

const temporaryDirectories = [];
const contract = {
  schema_version: "1.0",
  task_id: "DD-2026-002",
  objective: "Harden the approved agent task bridge without expanding its authority.",
  business_role: "deliciousduck-team:cto",
  work_mode: "implement",
  scope: ["Agent task bridge"],
  out_of_scope: ["Merge", "Deploy", "Credential changes"],
  acceptance_criteria: ["The complete contract reaches Codex"],
  dependencies: ["DD-2026-001"],
  authority: { repository: "pull-request", external: "approved-actions" },
  approval: {
    status: "approved",
    revision: 1,
    approved_by: "repository-owner",
    approved_at: "2026-08-30T12:50:03Z",
  },
  callback: { approved: false },
  conversation_key: "dd-2026-002",
  issue_number: 18,
};
const expected = {
  taskId: "DD-2026-002",
  roleId: "deliciousduck-team:cto",
  workMode: "implement",
  approvedRevision: 1,
  approvedBy: "repository-owner",
  approvedAt: "2026-08-30T12:50:03Z",
  issueNumber: "18",
  conversationKey: "dd-2026-002",
  callbackApproved: false,
  taskIdPattern: /^DD-[0-9]{4}-[0-9]{3,}$/,
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("task contract validation", () => {
  it("accepts the complete matching approved contract", () => {
    expect(validateTaskContract(structuredClone(contract), expected)).toEqual(contract);
  });

  it.each([
    ["task_id", "DD-2026-999", "task_id does not match"],
    ["business_role", "deliciousduck-team:cmo", "business_role does not match"],
    ["work_mode", "review", "work_mode does not match"],
    ["conversation_key", "another-thread", "conversation_key does not match"],
    ["issue_number", 19, "issue_number does not match"],
  ])("rejects a mismatched %s", (field, value, message) => {
    expect(() => validateTaskContract({ ...contract, [field]: value }, expected)).toThrow(message);
  });

  it("requires callback approval to match as a separate external-write gate", () => {
    expect(() =>
      validateTaskContract(
        { ...contract, callback: { approved: true, idempotency_key: "DD-2026-002-r1-callback" } },
        expected,
      ),
    ).toThrow("callback approval does not match");
    expect(() =>
      validateTaskContract(
        { ...contract, callback: { approved: false, idempotency_key: "not-authorized" } },
        expected,
      ),
    ).toThrow("Unapproved callback must not define");
  });

  it("rejects an unapproved or mismatched revision", () => {
    expect(() =>
      validateTaskContract(
        { ...contract, approval: { ...contract.approval, status: "draft" } },
        expected,
      ),
    ).toThrow("approval status must be approved");
    expect(() =>
      validateTaskContract(
        { ...contract, approval: { ...contract.approval, revision: 2 } },
        expected,
      ),
    ).toThrow("approval revision does not match");
  });

  it("requires approval identity and timestamp to match the dispatch", () => {
    expect(() =>
      validateTaskContract(
        {
          ...contract,
          approval: { ...contract.approval, approved_by: "different-owner" },
        },
        expected,
      ),
    ).toThrow("approval owner does not match");
    expect(() =>
      validateTaskContract(
        {
          ...contract,
          approval: { ...contract.approval, approved_at: "2026-08-30T12:51:00Z" },
        },
        expected,
      ),
    ).toThrow("approval timestamp does not match");
  });

  it("rejects incomplete and unsupported contract fields", () => {
    const missingScope = structuredClone(contract);
    delete missingScope.scope;
    expect(() => validateTaskContract(missingScope, expected)).toThrow("scope is invalid");
    expect(() => validateTaskContract({ ...contract, unapproved_extra: true }, expected)).toThrow(
      "unsupported fields",
    );
  });
});

describe("task prompt preparation", () => {
  it("renders the complete validated contract into the prompt", () => {
    const prompt = buildTaskPrompt({
      rolePrompt: "# CTO\n\nOwn the architecture.",
      deliveryPrompt: "Role: implementer\n\nWork only in scope.",
      contract,
    });
    expect(prompt).toContain("## Validated approved task contract");
    expect(prompt).toContain(JSON.stringify(contract, null, 2));
    expect(prompt).toContain('"out_of_scope"');
    expect(prompt).toContain('"acceptance_criteria"');
    expect(prompt).toContain('"approved_by": "repository-owner"');
    expect(prompt).toContain('"issue_number": 18');
  });

  it("keeps callback transmission behind the separate validated approval output", async () => {
    const workflow = await readFile(
      join(process.cwd(), ".github/workflows/codex-task.yml"),
      "utf8",
    );
    expect(workflow).toContain("CALLBACK_APPROVED:");
    expect(workflow).toContain("if: needs.codex.outputs.callback-approved == 'true'");
    expect(workflow).toContain(
      "IDEMPOTENCY_KEY: ${{ needs.codex.outputs.callback-idempotency-key }}",
    );
    expect(workflow).toContain("return-workspace-agent-result.mjs");
    expect(workflow).toContain("continue-on-error: true");
    expect(workflow).toContain("reconcile-agent-result.mjs");
    expect(workflow.indexOf("Reconcile final result")).toBeLessThan(
      workflow.indexOf("Comment final result on linked issue"),
    );
    expect(workflow).toContain("steps.callback.outcome != 'success'");
  });

  it("writes a prompt only after the approval gate and dispatch fields match", async () => {
    const directory = await mkdtemp(join(tmpdir(), "dd-agent-ops-"));
    temporaryDirectories.push(directory);
    const promptPath = join(directory, "prompt.md");
    const outputPath = join(directory, "github-output.txt");
    const environment = {
      GITHUB_WORKSPACE: process.cwd(),
      BUSINESS_ROLE: "cto",
      WORK_MODE: "implement",
      TASK_ID: "DD-2026-002",
      APPROVED_REVISION: "1",
      APPROVED_BY: "repository-owner",
      APPROVED_AT: "2026-08-30T12:50:03Z",
      TASK_CONTRACT: JSON.stringify(contract),
      OWNER_APPROVED: "true",
      CALLBACK_APPROVED: "false",
      ISSUE_NUMBER: "18",
      CONVERSATION_KEY: "dd-2026-002",
      PROMPT_OUTPUT: promptPath,
      GITHUB_OUTPUT: outputPath,
    };

    await prepareTask(environment);
    expect(await readFile(promptPath, "utf8")).toContain(JSON.stringify(contract, null, 2));
    expect(await readFile(outputPath, "utf8")).toContain("task-revision=1");

    await expect(prepareTask({ ...environment, OWNER_APPROVED: "false" })).rejects.toThrow(
      "Owner approval is required",
    );
    await expect(prepareTask({ ...environment, TASK_CONTRACT: "{" })).rejects.toThrow("valid JSON");
  });
});
