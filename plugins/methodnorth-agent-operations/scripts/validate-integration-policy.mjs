const operationalStatuses = new Set(["enabled", "disabled", "pending-credentials"]);
const configurationStatuses = new Set(["configured", "not-configured"]);
const verificationStatuses = new Set(["not-tested", "verified", "blocked"]);

export function validateIntegrationPolicy(integrationPolicy) {
  const errors = [];
  if (!Array.isArray(integrationPolicy?.integrations)) {
    return ["integrations must be an array"];
  }

  const ids = new Set();
  for (const integration of integrationPolicy.integrations) {
    const label = integration?.id || "unknown-integration";
    if (!/^[a-z0-9-]+$/.test(integration?.id ?? ""))
      errors.push(`integration id is invalid: ${label}`);
    if (ids.has(integration?.id)) errors.push(`duplicate integration id: ${label}`);
    ids.add(integration?.id);
    if (!operationalStatuses.has(integration?.status))
      errors.push(`integration operational status is invalid: ${label}`);
    if (!configurationStatuses.has(integration?.configuration_status))
      errors.push(`integration configuration status is invalid: ${label}`);

    const verification = integration?.verification;
    if (!verification || typeof verification !== "object" || Array.isArray(verification)) {
      errors.push(`integration verification is missing: ${label}`);
      continue;
    }
    const verificationFields = Object.keys(verification).sort().join(",");
    if (verificationFields !== "status" && verificationFields !== "reason_code,status")
      errors.push(`integration verification fields are invalid: ${label}`);
    if (!verificationStatuses.has(verification.status))
      errors.push(`integration verification status is invalid: ${label}`);
    if (verification.status === "blocked") {
      if (!/^[a-z0-9-]{1,80}$/.test(verification.reason_code ?? ""))
        errors.push(`blocked integration requires a safe reason code: ${label}`);
    } else if (verification.reason_code !== undefined) {
      errors.push(`unblocked integration must not define a reason code: ${label}`);
    }
    if (
      verification.status === "verified" &&
      (integration.configuration_status !== "configured" || integration.status !== "enabled")
    )
      errors.push(`verified integration must be configured and enabled: ${label}`);
    if (
      integration.configuration_status === "not-configured" &&
      verification.status !== "not-tested"
    )
      errors.push(`unconfigured integration must remain not-tested: ${label}`);
  }

  return errors;
}
