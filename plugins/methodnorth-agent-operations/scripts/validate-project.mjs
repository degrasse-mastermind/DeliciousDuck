import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateIntegrationPolicy } from "./validate-integration-policy.mjs";

const root = resolve(process.argv[2] ?? process.cwd());
const configPath = resolve(root, ".github/agent-operations/project.json");
const config = JSON.parse(await readFile(configPath, "utf8"));
const integrations = JSON.parse(
  await readFile(resolve(root, ".github/agent-operations/integrations.json"), "utf8"),
);
const errors = [];

if (config.schema_version !== "1.0") errors.push("schema_version must be 1.0");
if (!/^[a-z][a-z0-9-]{1,62}$/.test(config.project?.id ?? "")) errors.push("project.id is invalid");
if (!/^[A-Z][A-Z0-9]{1,9}$/.test(config.project?.task_prefix ?? ""))
  errors.push("project.task_prefix is invalid");
if (!/^[a-z][a-z0-9-]{1,62}$/.test(config.project?.role_namespace ?? ""))
  errors.push("project.role_namespace is invalid");
if (!Array.isArray(config.roles) || config.roles.length === 0)
  errors.push("at least one role is required");
if (integrations.schema_version !== "1.0")
  errors.push("integration policy schema_version must be 1.0");
if (integrations.policy?.direct_role_credentials !== false)
  errors.push("roles must not hold direct integration credentials");
if (integrations.policy?.external_writes_require_separate_owner_approval !== true)
  errors.push("external writes must require separate owner approval");
if (integrations.policy?.executive_dispatch_role !== config.project?.executive_role)
  errors.push("integration executive role must match project executive role");
errors.push(...validateIntegrationPolicy(integrations));

const ids = new Set();
const slugs = new Set();
for (const role of config.roles ?? []) {
  if (ids.has(role.id)) errors.push(`duplicate role id: ${role.id}`);
  if (slugs.has(role.slug)) errors.push(`duplicate role slug: ${role.slug}`);
  ids.add(role.id);
  slugs.add(role.slug);
  if (role.id !== `${config.project.role_namespace}:${role.slug}`)
    errors.push(`role id does not match namespace: ${role.id}`);
  if (!Array.isArray(role.allowed_modes) || role.allowed_modes.length === 0)
    errors.push(`role has no allowed modes: ${role.id}`);
  const promptPath = resolve(root, role.prompt_file ?? "");
  try {
    const prompt = await readFile(promptPath, "utf8");
    if (prompt.trim().length < 80) errors.push(`role prompt is too short: ${role.id}`);
  } catch {
    errors.push(`role prompt is missing: ${role.prompt_file}`);
  }
}

if (!ids.has(config.project?.executive_role))
  errors.push("project.executive_role must identify a configured role");
if (config.approval_policy?.dispatch_requires_owner_approval !== true)
  errors.push("owner approval must be required for dispatch");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Agent operations configuration valid: ${config.project.name} (${config.roles.length} roles)`,
);
