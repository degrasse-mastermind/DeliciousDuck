import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.env.GITHUB_WORKSPACE ?? process.cwd());
const config = JSON.parse(
  await readFile(resolve(root, ".github/agent-operations/project.json"), "utf8"),
);
const requestedRole = process.env.BUSINESS_ROLE ?? "";
const workMode = process.env.WORK_MODE ?? "";
const objective = process.env.TASK_OBJECTIVE ?? "";
const taskId = process.env.TASK_ID ?? "";
const issueNumber = process.env.ISSUE_NUMBER ?? "";
const conversationKey = process.env.CONVERSATION_KEY ?? "";
const approved = String(process.env.OWNER_APPROVED ?? "").toLowerCase() === "true";
const role = config.roles.find(
  (candidate) => candidate.id === requestedRole || candidate.slug === requestedRole,
);
const roleId = role?.id ?? requestedRole;

if (!role) throw new Error(`Unsupported business role: ${roleId}`);
if (!role.allowed_modes.includes(workMode))
  throw new Error(`Work mode ${workMode} is not allowed for ${roleId}`);
if (!new RegExp(`^${config.project.task_prefix}-[0-9]{4}-[0-9]{3,}$`).test(taskId))
  throw new Error(`Invalid task id: ${taskId}`);
if (objective.trim().length < 10) throw new Error("Task objective must be at least 10 characters");
if (config.approval_policy.dispatch_requires_owner_approval && !approved)
  throw new Error("Owner approval is required before dispatch");
if (issueNumber && !/^[0-9]+$/.test(issueNumber))
  throw new Error("Issue number must contain digits only");
if (conversationKey.includes("\n") || conversationKey.includes("\r"))
  throw new Error("Conversation key must be a single line");

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

const prompt = `${rolePrompt.trim()}\n\n${deliveryPrompt.trim()}\n\n## Approved task contract\n\nTask ID: ${taskId}\nBusiness role: ${roleId}\nWork mode: ${workMode}\nOwner approved: yes\n\n### Objective\n\n${objective.trim()}\n\n## Required result\n\nReturn a concise report with status, summary, deliverables, validation evidence, risks, blockers, owner decisions, and links. Do not claim an external action, deployment, publication, or production verification without direct evidence.\n`;

const outputPath =
  process.env.PROMPT_OUTPUT ??
  resolve(process.env.RUNNER_TEMP ?? root, "agent-operations-prompt.md");
await writeFile(outputPath, prompt, "utf8");

if (process.env.GITHUB_OUTPUT) {
  await writeFile(
    process.env.GITHUB_OUTPUT,
    `business-role=${roleId}\nwork-mode=${workMode}\ntask-id=${taskId}\nissue-number=${issueNumber}\nconversation-key=${conversationKey}\n`,
    { flag: "a" },
  );
}

console.log(`Prepared ${taskId} for ${roleId} (${workMode})`);
