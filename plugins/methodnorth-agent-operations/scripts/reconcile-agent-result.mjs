import { appendFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const callbackStatuses = new Set(["completed", "blocked", "failed", "timed-out"]);
const callbackStepOutcomes = new Set(["success", "failure", "cancelled", "skipped"]);

function isValidPullRequestUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      /^\/[^/]+\/[^/]+\/pull\/[1-9][0-9]*$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function resolvePublishingStatus({ workMode, hasChanges, publishResult, pullRequestUrl }) {
  const publishingRequired = workMode === "implement" && hasChanges === true;
  return publishingRequired
    ? publishResult === "success" && isValidPullRequestUrl(pullRequestUrl)
      ? "completed"
      : "failed"
    : "not-required";
}

export function buildPreCallbackResult({
  baseResult,
  codexStatus,
  workMode,
  hasChanges,
  publishResult,
  pullRequestUrl,
  callbackApproved,
}) {
  const normalizedCodexStatus = codexStatus || "unknown";
  const publishingStatus = resolvePublishingStatus({
    workMode,
    hasChanges,
    publishResult,
    pullRequestUrl,
  });
  const callbackStatus = callbackApproved ? "attempting" : "not-approved";
  const overallStatus = callbackApproved
    ? "pending-callback-reconciliation"
    : normalizedCodexStatus === "success" && publishingStatus !== "failed"
      ? "completed"
      : "failed";
  const markdown = `${baseResult.trimEnd()}\n\nPublishing status: **${publishingStatus}**\n\nCallback status: **${callbackStatus}**\n\nOverall status: **${overallStatus}**\n`;
  return { publishingStatus, callbackStatus, overallStatus, markdown };
}

export function reconcileAgentResult({
  baseResult,
  codexStatus,
  workMode,
  hasChanges,
  publishResult,
  pullRequestUrl,
  callbackApproved,
  callbackStatus,
  callbackDetail,
  callbackStepOutcome,
}) {
  const normalizedCodexStatus = codexStatus || "unknown";
  const publishingStatus = resolvePublishingStatus({
    workMode,
    hasChanges,
    publishResult,
    pullRequestUrl,
  });
  const normalizedStepOutcome = callbackStepOutcomes.has(callbackStepOutcome)
    ? callbackStepOutcome
    : "skipped";
  let normalizedCallbackStatus = "not-approved";
  let derivedCallbackDetail = "";
  if (callbackApproved) {
    if (callbackStatuses.has(callbackStatus)) {
      normalizedCallbackStatus = callbackStatus;
    } else if (callbackStatus) {
      normalizedCallbackStatus = "blocked";
      derivedCallbackDetail = "unrecognized-callback-result";
    } else if (normalizedStepOutcome === "failure" || normalizedStepOutcome === "cancelled") {
      normalizedCallbackStatus = "attempted-no-result";
      derivedCallbackDetail = `callback-step-${normalizedStepOutcome}-without-result`;
    } else if (normalizedStepOutcome === "success") {
      normalizedCallbackStatus = "blocked";
      derivedCallbackDetail = "callback-step-success-without-result";
    } else {
      normalizedCallbackStatus = "not-attempted";
      derivedCallbackDetail = "callback-step-skipped";
    }
  }

  let overallStatus =
    normalizedCodexStatus === "success" && publishingStatus !== "failed" ? "completed" : "failed";
  if (overallStatus !== "failed" && callbackApproved && normalizedCallbackStatus !== "completed") {
    overallStatus =
      normalizedCallbackStatus === "failed" || normalizedCallbackStatus === "attempted-no-result"
        ? "failed"
        : "blocked";
  }

  const callbackEvidence =
    typeof callbackDetail === "string" && callbackDetail.trim()
      ? callbackDetail.trim()
      : derivedCallbackDetail;
  const safeDetail = callbackApproved && callbackEvidence ? ` (${callbackEvidence})` : "";
  const markdown = `${baseResult.trimEnd()}\n\nPublishing status: **${publishingStatus}**\n\nCallback status: **${normalizedCallbackStatus}**${safeDetail}\n\nOverall status: **${overallStatus}**\n`;
  return { publishingStatus, callbackStatus: normalizedCallbackStatus, overallStatus, markdown };
}

export async function main(environment = process.env) {
  const resultPath = resolve(environment.RESULT_FILE ?? "");
  const baseResultPath = resolve(environment.BASE_RESULT_FILE ?? environment.RESULT_FILE ?? "");
  const baseResult = await readFile(baseResultPath, "utf8");
  const common = {
    baseResult,
    codexStatus: environment.CODEX_RESULT ?? "",
    workMode: environment.WORK_MODE ?? "",
    hasChanges: String(environment.HAS_CHANGES).toLowerCase() === "true",
    publishResult: environment.PUBLISH_RESULT ?? "",
    pullRequestUrl: environment.PR_URL ?? "",
    callbackApproved: String(environment.CALLBACK_APPROVED).toLowerCase() === "true",
  };
  const phase = environment.RECONCILIATION_PHASE ?? "final";
  const result =
    phase === "pre-callback"
      ? buildPreCallbackResult(common)
      : reconcileAgentResult({
          ...common,
          callbackStatus: environment.CALLBACK_STATUS ?? "",
          callbackDetail: environment.CALLBACK_DETAIL ?? "",
          callbackStepOutcome: environment.CALLBACK_STEP_OUTCOME ?? "",
        });
  await writeFile(resultPath, result.markdown, "utf8");
  if (phase === "final" && environment.GITHUB_STEP_SUMMARY)
    await appendFile(environment.GITHUB_STEP_SUMMARY, result.markdown, "utf8");
  if (environment.GITHUB_OUTPUT) {
    await appendFile(
      environment.GITHUB_OUTPUT,
      `publishing-status=${result.publishingStatus}\noverall-status=${result.overallStatus}\n`,
      "utf8",
    );
  }
  console.log(
    `${phase === "pre-callback" ? "Prepared callback" : "Reconciled task"} result: publishing=${result.publishingStatus}, callback=${result.callbackStatus}, overall=${result.overallStatus}`,
  );
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
