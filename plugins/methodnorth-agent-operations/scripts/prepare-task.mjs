import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const contractFields = new Set([
  "schema_version",
  "task_id",
  "objective",
  "business_role",
  "work_mode",
  "scope",
  "out_of_scope",
  "acceptance_criteria",
  "dependencies",
  "authority",
  "approval",
  "callback",
  "conversation_key",
  "issue_number",
]);
const repositoryAuthorities = new Set(["read-only", "working-tree", "pull-request"]);
const externalAuthorities = new Set(["none", "draft-only", "approved-actions"]);
const workModes = new Set(["plan", "implement", "review", "qa"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertString(value, field, minimum = 1) {
  assert(typeof value === "string" && value.trim().length >= minimum, `${field} is invalid`);
}

function assertStringArray(value, field, minimum = 0) {
  assert(Array.isArray(value) && value.length >= minimum, `${field} is invalid`);
  assert(
    value.every((item) => typeof item === "string" && item.trim()),
    `${field} is invalid`,
  );
}

export function validateTaskContract(contract, expected) {
  assert(
    contract && typeof contract === "object" && !Array.isArray(contract),
    "Task contract must be an object",
  );
  const unknownFields = Object.keys(contract).filter((field) => !contractFields.has(field));
  assert(
    unknownFields.length === 0,
    `Task contract has unsupported fields: ${unknownFields.join(", ")}`,
  );
  assert(contract.schema_version === "1.0", "Task contract schema_version must be 1.0");
  assertString(contract.task_id, "task_id");
  assert(contract.task_id === expected.taskId, "Task contract task_id does not match dispatch");
  assert(expected.taskIdPattern.test(contract.task_id), `Invalid task id: ${contract.task_id}`);
  assertString(contract.objective, "objective", 10);
  assertString(contract.business_role, "business_role", 3);
  assert(
    contract.business_role === expected.roleId,
    "Task contract business_role does not match dispatch",
  );
  assert(workModes.has(contract.work_mode), "Task contract work_mode is invalid");
  assert(
    contract.work_mode === expected.workMode,
    "Task contract work_mode does not match dispatch",
  );
  assertStringArray(contract.scope, "scope", 1);
  assertStringArray(contract.out_of_scope, "out_of_scope");
  assertStringArray(contract.acceptance_criteria, "acceptance_criteria", 1);
  assertStringArray(contract.dependencies, "dependencies");
  assert(
    new Set(contract.dependencies).size === contract.dependencies.length,
    "dependencies must be unique",
  );

  assert(contract.authority && typeof contract.authority === "object", "authority is invalid");
  assert(
    Object.keys(contract.authority).sort().join(",") === "external,repository",
    "authority must contain only repository and external",
  );
  assert(
    repositoryAuthorities.has(contract.authority.repository),
    "authority.repository is invalid",
  );
  assert(externalAuthorities.has(contract.authority.external), "authority.external is invalid");

  assert(contract.approval && typeof contract.approval === "object", "approval is invalid");
  assert(
    Object.keys(contract.approval).sort().join(",") === "approved_at,approved_by,revision,status",
    "approval must contain status, revision, approved_by, and approved_at",
  );
  assert(contract.approval.status === "approved", "Task contract approval status must be approved");
  assert(
    Number.isInteger(contract.approval.revision) && contract.approval.revision >= 1,
    "Task contract approval revision is invalid",
  );
  assert(
    contract.approval.revision === expected.approvedRevision,
    "Task contract approval revision does not match dispatch",
  );
  assertString(contract.approval.approved_by, "approval.approved_by");
  assertString(contract.approval.approved_at, "approval.approved_at");
  assert(
    !Number.isNaN(Date.parse(contract.approval.approved_at)),
    "approval.approved_at is invalid",
  );
  assert(
    contract.approval.approved_by === expected.approvedBy,
    "Task contract approval owner does not match dispatch",
  );
  assert(
    contract.approval.approved_at === expected.approvedAt,
    "Task contract approval timestamp does not match dispatch",
  );

  assert(
    Number.isInteger(contract.issue_number) && contract.issue_number >= 1,
    "issue_number is invalid",
  );
  assert(
    String(contract.issue_number) === expected.issueNumber,
    "Task contract issue_number does not match dispatch",
  );
  assertString(contract.conversation_key, "conversation_key");
  assert(
    /^[A-Za-z0-9._:-]{1,160}$/.test(contract.conversation_key),
    "Task contract conversation_key is invalid",
  );
  assert(
    contract.conversation_key === expected.conversationKey,
    "Task contract conversation_key does not match dispatch",
  );

  assert(contract.callback && typeof contract.callback === "object", "callback is invalid");
  const callbackFields = Object.keys(contract.callback).sort().join(",");
  assert(
    callbackFields === "approved" || callbackFields === "approved,idempotency_key",
    "callback contains unsupported fields",
  );
  assert(typeof contract.callback.approved === "boolean", "callback.approved is invalid");
  assert(
    contract.callback.approved === expected.callbackApproved,
    "Task contract callback approval does not match dispatch",
  );
  if (contract.callback.approved) {
    assertString(contract.callback.idempotency_key, "callback.idempotency_key");
    assert(
      /^[A-Za-z0-9._:-]{1,200}$/.test(contract.callback.idempotency_key),
      "callback.idempotency_key is invalid",
    );
  } else {
    assert(
      contract.callback.idempotency_key === undefined,
      "Unapproved callback must not define an idempotency key",
    );
  }

  return contract;
}

export function buildTaskPrompt({ rolePrompt, deliveryPrompt, contract }) {
  return `${rolePrompt.trim()}\n\n${deliveryPrompt.trim()}\n\n## Validated approved task contract\n\n\`\`\`json\n${JSON.stringify(contract, null, 2)}\n\`\`\`\n\n## Required result\n\nReturn a concise report with status, summary, deliverables, validation evidence, risks, blockers, owner decisions, and links. Do not claim an external action, deployment, publication, or production verification without direct evidence.\n`;
}

export async function prepareTask(environment = process.env) {
  const root = resolve(environment.GITHUB_WORKSPACE ?? process.cwd());
  const config = JSON.parse(
    await readFile(resolve(root, ".github/agent-operations/project.json"), "utf8"),
  );
  const requestedRole = environment.BUSINESS_ROLE ?? "";
  const workMode = environment.WORK_MODE ?? "";
  const taskId = environment.TASK_ID ?? "";
  const issueNumber = environment.ISSUE_NUMBER ?? "";
  const conversationKey = environment.CONVERSATION_KEY ?? "";
  const approvedRevisionText = environment.APPROVED_REVISION ?? "";
  const approvedBy = environment.APPROVED_BY ?? "";
  const approvedAt = environment.APPROVED_AT ?? "";
  const approved = String(environment.OWNER_APPROVED ?? "").toLowerCase() === "true";
  const callbackApproved = String(environment.CALLBACK_APPROVED ?? "").toLowerCase() === "true";
  const role = config.roles.find(
    (candidate) => candidate.id === requestedRole || candidate.slug === requestedRole,
  );
  const roleId = role?.id ?? requestedRole;

  if (!role) throw new Error(`Unsupported business role: ${roleId}`);
  if (!role.allowed_modes.includes(workMode))
    throw new Error(`Work mode ${workMode} is not allowed for ${roleId}`);
  if (config.approval_policy.dispatch_requires_owner_approval && !approved)
    throw new Error("Owner approval is required before dispatch");
  if (!/^[0-9]+$/.test(approvedRevisionText))
    throw new Error("Approved revision must contain digits only");
  if (!/^[0-9]+$/.test(issueNumber)) throw new Error("Issue number must contain digits only");
  if (conversationKey.includes("\n") || conversationKey.includes("\r"))
    throw new Error("Conversation key must be a single line");

  let contract;
  try {
    contract = JSON.parse(environment.TASK_CONTRACT ?? "");
  } catch {
    throw new Error("Task contract must be valid JSON");
  }

  validateTaskContract(contract, {
    taskId,
    roleId,
    workMode,
    approvedRevision: Number(approvedRevisionText),
    approvedBy,
    approvedAt,
    issueNumber,
    conversationKey,
    callbackApproved,
    taskIdPattern: new RegExp(`^${config.project.task_prefix}-[0-9]{4}-[0-9]{3,}$`),
  });

  const deliveryPrompts = {
    plan: ".github/codex/prompts/planner.md",
    implement: ".github/codex/prompts/implementer.md",
    review: ".github/codex/prompts/reviewer.md",
    qa: ".github/codex/prompts/qa.md",
  };
  const [rolePrompt, deliveryPrompt] = await Promise.all([
    readFile(resolve(root, role.prompt_file), "utf8"),
    readFile(resolve(root, deliveryPrompts[workMode]), "utf8"),
  ]);
  const prompt = buildTaskPrompt({ rolePrompt, deliveryPrompt, contract });
  const outputPath =
    environment.PROMPT_OUTPUT ??
    resolve(environment.RUNNER_TEMP ?? root, "agent-operations-prompt.md");
  await writeFile(outputPath, prompt, "utf8");

  if (environment.GITHUB_OUTPUT) {
    await writeFile(
      environment.GITHUB_OUTPUT,
      `business-role=${roleId}\nwork-mode=${workMode}\ntask-id=${taskId}\ntask-revision=${contract.approval.revision}\nissue-number=${issueNumber}\nconversation-key=${conversationKey}\ncallback-approved=${contract.callback.approved}\ncallback-idempotency-key=${contract.callback.idempotency_key ?? ""}\n`,
      { flag: "a" },
    );
  }

  console.log(
    `Prepared ${taskId} revision ${contract.approval.revision} for ${roleId} (${workMode})`,
  );
  return { contract, outputPath, prompt, roleId, workMode };
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  prepareTask().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
