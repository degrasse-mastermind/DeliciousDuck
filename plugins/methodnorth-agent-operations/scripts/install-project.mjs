import { mkdir, writeFile } from "node:fs/promises";
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
const identifierPattern = /^[a-z][a-z0-9-]{1,62}$/;

function normalizeDefaultIdentifier(value) {
  let normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!/^[a-z]/.test(normalized)) normalized = `project-${normalized || "installation"}`;
  normalized = normalized.slice(0, 63).replace(/-+$/g, "");
  return normalized.length >= 2 ? normalized : `${normalized}-project`;
}

const projectId = args.get("project-id") ?? normalizeDefaultIdentifier(basename(target));
const projectName = args.get("project-name") ?? basename(target);
const taskPrefix = (args.get("task-prefix") ?? "TASK").toUpperCase();
const roleNamespace = args.get("role-namespace") ?? normalizeDefaultIdentifier(`${projectId}-team`);
const force = args.get("force") === "true";

if (!identifierPattern.test(projectId))
  throw new Error(
    "project-id must start with a letter and contain 2-63 lowercase letters, digits, or hyphens",
  );
if (!identifierPattern.test(roleNamespace))
  throw new Error(
    "role-namespace must start with a letter and contain 2-63 lowercase letters, digits, or hyphens",
  );
if (!/^[A-Z][A-Z0-9]{1,9}$/.test(taskPrefix))
  throw new Error(
    "task-prefix must start with a letter and contain 2-10 uppercase letters or digits",
  );
const configDir = resolve(target, ".github/agent-operations");
const rolesDir = resolve(configDir, "roles");
const configPath = resolve(configDir, "project.json");
const integrationsPath = resolve(configDir, "integrations.json");

async function writeGenerated(path, content, { skipExisting = false } = {}) {
  try {
    await writeFile(path, content, { encoding: "utf8", flag: force ? "w" : "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    if (skipExisting) return false;
    throw new Error(`${path} already exists; review it or rerun with --force true`);
  }
  return true;
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
await writeGenerated(configPath, `${JSON.stringify(config, null, 2)}\n`);
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
      configuration_status: "configured",
      verification: { status: "verified" },
      allowed_actions: ["create-task", "comment-result", "open-review-pull-request"],
      prohibited_actions: ["merge", "deploy", "rewrite-history"],
    },
    {
      id: "chatgpt-coo-callback",
      type: "chatgpt-workspace-agent",
      status: "pending-credentials",
      configuration_status: "not-configured",
      verification: { status: "not-tested" },
      allowed_actions: ["return-result"],
      prohibited_actions: ["publish-agent", "change-agent-settings"],
    },
    {
      id: "zapier-operations-courier",
      type: "zapier",
      status: "disabled",
      configuration_status: "not-configured",
      verification: { status: "not-tested" },
      allowed_actions: [
        "create-approved-task",
        "create-approved-draft",
        "send-approved-notification",
      ],
      prohibited_actions: ["publish", "spend", "send-unapproved-message", "change-credentials"],
    },
  ],
};
await writeGenerated(integrationsPath, `${JSON.stringify(integrations, null, 2)}\n`);

for (const [slug, name] of roleDefinitions) {
  const path = resolve(rolesDir, `${slug}.md`);
  const content = `# ${name}\n\nYou are the ${name} for ${projectName}. Work only within the approved task contract and the repository's instructions.\n\n## Project-specific charter\n\nReplace this section with the role's responsibilities, decision rights, source requirements, quality bar, and prohibited actions before dispatching work.\n\n## Reporting\n\nReturn status, summary, deliverables, validation evidence, risks, blockers, owner decisions, and links to the COO through the durable task ledger.\n`;
  await writeGenerated(path, content, { skipExisting: true });
}

console.log(`Installed agent-operations configuration for ${projectName} at ${target}`);
console.log(
  "Next: customize every role charter, add the workflow, run validate-project.mjs, then configure project-specific credentials.",
);
