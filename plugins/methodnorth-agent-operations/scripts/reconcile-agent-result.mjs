import { appendFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const callbackStatuses = new Set(["completed", "blocked", "failed", "timed-out"]);

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
}) {
  const normalizedCodexStatus = codexStatus || "unknown";
  const publishingRequired = workMode === "implement" && hasChanges === true;
  const publishingStatus = publishingRequired
    ? publishResult === "success" && isValidPullRequestUrl(pullRequestUrl)
      ? "completed"
      : "failed"
    : "not-required";
  let normalizedCallbackStatus = "not-approved";
  if (callbackApproved) {
    normalizedCallbackStatus = callbackStatuses.has(callbackStatus) ? callbackStatus : "blocked";
  }

  let overallStatus =
    normalizedCodexStatus === "success" && publishingStatus !== "failed" ? "completed" : "failed";
  if (overallStatus !== "failed" && callbackApproved && normalizedCallbackStatus !== "completed") {
    overallStatus = normalizedCallbackStatus === "failed" ? "failed" : "blocked";
  }

  const safeDetail =
    callbackApproved && typeof callbackDetail === "string" && callbackDetail.trim()
      ? ` (${callbackDetail.trim()})`
      : "";
  const markdown = `${baseResult.trimEnd()}\n\nPublishing status: **${publishingStatus}**\n\nCallback status: **${normalizedCallbackStatus}**${safeDetail}\n\nOverall status: **${overallStatus}**\n`;
  return { publishingStatus, callbackStatus: normalizedCallbackStatus, overallStatus, markdown };
}

export async function main(environment = process.env) {
  const resultPath = resolve(environment.RESULT_FILE ?? "");
  const baseResult = await readFile(resultPath, "utf8");
  const result = reconcileAgentResult({
    baseResult,
    codexStatus: environment.CODEX_RESULT ?? "",
    workMode: environment.WORK_MODE ?? "",
    hasChanges: String(environment.HAS_CHANGES).toLowerCase() === "true",
    publishResult: environment.PUBLISH_RESULT ?? "",
    pullRequestUrl: environment.PR_URL ?? "",
    callbackApproved: String(environment.CALLBACK_APPROVED).toLowerCase() === "true",
    callbackStatus: environment.CALLBACK_STATUS ?? "",
    callbackDetail: environment.CALLBACK_DETAIL ?? "",
  });
  await writeFile(resultPath, result.markdown, "utf8");
  if (environment.GITHUB_STEP_SUMMARY)
    await appendFile(environment.GITHUB_STEP_SUMMARY, result.markdown, "utf8");
  if (environment.GITHUB_OUTPUT) {
    await appendFile(
      environment.GITHUB_OUTPUT,
      `publishing-status=${result.publishingStatus}\noverall-status=${result.overallStatus}\n`,
      "utf8",
    );
  }
  console.log(
    `Reconciled task result: publishing=${result.publishingStatus}, callback=${result.callbackStatus}, overall=${result.overallStatus}`,
  );
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
