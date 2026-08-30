import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateIntegrationPolicy } from "../scripts/validate-integration-policy.mjs";

const configured = {
  schema_version: "1.0",
  integrations: [
    {
      id: "chatgpt-coo-callback",
      type: "chatgpt-workspace-agent",
      status: "enabled",
      configuration_status: "configured",
      verification: { status: "blocked", reason_code: "agent-not-runnable" },
      allowed_actions: ["return-result"],
      prohibited_actions: ["publish-agent"],
    },
  ],
};

describe("integration configuration and verification states", () => {
  it("accepts a configured but safely blocked callback", () => {
    expect(validateIntegrationPolicy(configured)).toEqual([]);
  });

  it("rejects blocked state without a safe reason code", () => {
    const invalid = structuredClone(configured);
    invalid.integrations[0].verification = { status: "blocked" };
    expect(validateIntegrationPolicy(invalid)).toContain(
      "blocked integration requires a safe reason code: chatgpt-coo-callback",
    );
  });

  it("rejects reason codes on states that are not blocked", () => {
    const invalid = structuredClone(configured);
    invalid.integrations[0].verification = {
      status: "verified",
      reason_code: "stale-blocker",
    };
    expect(validateIntegrationPolicy(invalid)).toContain(
      "unblocked integration must not define a reason code: chatgpt-coo-callback",
    );
  });

  it("rejects verified integrations that are disabled or unconfigured", () => {
    const invalid = structuredClone(configured);
    invalid.integrations[0].status = "disabled";
    invalid.integrations[0].verification = { status: "verified" };
    expect(validateIntegrationPolicy(invalid)).toContain(
      "verified integration must be configured and enabled: chatgpt-coo-callback",
    );
  });

  it("keeps the repository policy and JSON Schema aligned", async () => {
    const [policy, schema] = await Promise.all([
      readFile(join(process.cwd(), ".github/agent-operations/integrations.json"), "utf8"),
      readFile(
        join(
          process.cwd(),
          "plugins/methodnorth-agent-operations/assets/schemas/integration-policy.schema.json",
        ),
        "utf8",
      ),
    ]);
    expect(validateIntegrationPolicy(JSON.parse(policy))).toEqual([]);
    const parsedSchema = JSON.parse(schema);
    const itemSchema = parsedSchema.properties.integrations.items;
    expect(itemSchema.required).toContain("configuration_status");
    expect(itemSchema.required).toContain("verification");
    expect(itemSchema.properties.verification.properties.status.enum).toEqual([
      "not-tested",
      "verified",
      "blocked",
    ]);
  });
});
