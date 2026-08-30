import { access, mkdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (!key?.startsWith("--") || !value)
    throw new Error(`Expected --name value, received ${key ?? "nothing"}`);
  args.set(key.slice(2), value);
}

const target = resolve(args.get("target") ?? process.cwd());
const projectId =
  args.get("project-id") ??
  basename(target)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
const projectName = args.get("project-name") ?? basename(target);
const taskPrefix = (args.get("task-prefix") ?? "TASK").toUpperCase();
const roleNamespace = args.get("role-namespace") ?? `${projectId}-team`;
const force = args.get("force") === "true";
const configDir = resolve(target, ".github/agent-operations");
const rolesDir = resolve(configDir, "roles");
const configPath = resolve(configDir, "project.json");
const integrationsPath = resolve(configDir, "integrations.json");

for (const protectedPath of [configPath, integrationsPath]) {
  try {
    await access(protectedPath);
    if (!force)
      throw new Error(`${protectedPath} already exists; review it or rerun with --force true`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const roleDefinitions = [
  ["coo", "COO", ["plan", "review"]],
  ["cmo", "CMO", ["plan", "implement", "review"]],
  ["growth-marketer", "Growth/Digital Marketer", ["plan", "implement", "review", "qa"]],
  ["content-creator", "Content Creator", ["plan", "implement", "review", "qa"]],
  ["product-manager", "Product Manager", ["plan", "implement", "review", "qa"]],
  ["cto", "CTO", ["plan", "implement", "review", "qa"]],
  ["cfo", "CFO", ["plan", "implement", "review"]],
];

const config = {
  schema_version: "1.0",
  project: {
    id: projectId,
    name: projectName,
    task_prefix: taskPrefix,
    role_namespace: roleNamespace,
    executive_role: `${roleNamespace}:coo`,
  },
  approval_policy: {
    dispatch_requires_owner_approval: true,
    blocked_actions: [
      "merge",
      "deploy",
      "publish",
      "spend",
      "send-external-message",
      "change-production-data",
      "change-credentials",
      "rewrite-published-history",
    ],
  },
  roles: roleDefinitions.map(([slug, name, modes]) => ({
    id: `${roleNamespace}:${slug}`,
    slug,
    name,
    prompt_file: `.github/agent-operations/roles/${slug}.md`,
    allowed_modes: modes,
  })),
};

await mkdir(rolesDir, { recursive: true });
await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
const integrations = {
  schema_version: "1.0",
  policy: {
    direct_role_credentials: false,
    executive_dispatch_role: `${roleNamespace}:coo`,
    external_writes_require_separate_owner_approval: true,
  },
  integrations: [
    {
      id: "github-ledger",
      type: "github",
      status: "enabled",
      allowed_actions: ["create-task", "comment-result", "open-review-pull-request"],
      prohibited_actions: ["merge", "deploy", "rewrite-history"],
    },
    {
      id: "chatgpt-coo-callback",
      type: "chatgpt-workspace-agent",
      status: "pending-credentials",
      allowed_actions: ["return-result"],
      prohibited_actions: ["publish-agent", "change-agent-settings"],
    },
    {
      id: "zapier-operations-courier",
      type: "zapier",
      status: "disabled",
      allowed_actions: [
        "create-approved-task",
        "create-approved-draft",
        "send-approved-notification",
      ],
      prohibited_actions: ["publish", "spend", "send-unapproved-message", "change-credentials"],
    },
  ],
};
await writeFile(integrationsPath, `${JSON.stringify(integrations, null, 2)}\n`, "utf8");

for (const [slug, name] of roleDefinitions) {
  const path = resolve(rolesDir, `${slug}.md`);
  try {
    await access(path);
    if (!force) continue;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const content = `# ${name}\n\nYou are the ${name} for ${projectName}. Work only within the approved task contract and the repository's instructions.\n\n## Project-specific charter\n\nReplace this section with the role's responsibilities, decision rights, source requirements, quality bar, and prohibited actions before dispatching work.\n\n## Reporting\n\nReturn status, summary, deliverables, validation evidence, risks, blockers, owner decisions, and links to the COO through the durable task ledger.\n`;
  await writeFile(path, content, "utf8");
}

console.log(`Installed agent-operations configuration for ${projectName} at ${target}`);
console.log(
  "Next: customize every role charter, add the workflow, run validate-project.mjs, then configure project-specific credentials.",
);
