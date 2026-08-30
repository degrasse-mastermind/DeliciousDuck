import { appendFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const callbackStatuses = new Set(["completed", "blocked", "failed", "timed-out"]);

export function reconcileAgentResult({
  baseResult,
  codexStatus,
  callbackApproved,
  callbackStatus,
  callbackDetail,
}) {
  const normalizedCodexStatus = codexStatus || "unknown";
  let normalizedCallbackStatus = "not-approved";
  if (callbackApproved) {
    normalizedCallbackStatus = callbackStatuses.has(callbackStatus) ? callbackStatus : "blocked";
  }

  let overallStatus = normalizedCodexStatus === "success" ? "completed" : "failed";
  if (callbackApproved && normalizedCallbackStatus !== "completed") {
    overallStatus = normalizedCallbackStatus === "failed" ? "failed" : "blocked";
  }

  const safeDetail =
    callbackApproved && typeof callbackDetail === "string" && callbackDetail.trim()
      ? ` (${callbackDetail.trim()})`
      : "";
  const markdown = `${baseResult.trimEnd()}\n\nCallback status: **${normalizedCallbackStatus}**${safeDetail}\n\nOverall status: **${overallStatus}**\n`;
  return { callbackStatus: normalizedCallbackStatus, overallStatus, markdown };
}

export async function main(environment = process.env) {
  const resultPath = resolve(environment.RESULT_FILE ?? "");
  const baseResult = await readFile(resultPath, "utf8");
  const result = reconcileAgentResult({
    baseResult,
    codexStatus: environment.CODEX_RESULT ?? "",
    callbackApproved: String(environment.CALLBACK_APPROVED).toLowerCase() === "true",
    callbackStatus: environment.CALLBACK_STATUS ?? "",
    callbackDetail: environment.CALLBACK_DETAIL ?? "",
  });
  await writeFile(resultPath, result.markdown, "utf8");
  if (environment.GITHUB_STEP_SUMMARY)
    await appendFile(environment.GITHUB_STEP_SUMMARY, result.markdown, "utf8");
  console.log(
    `Reconciled task result: callback=${result.callbackStatus}, overall=${result.overallStatus}`,
  );
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
