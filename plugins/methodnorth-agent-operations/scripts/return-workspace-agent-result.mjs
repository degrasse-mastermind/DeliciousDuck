import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const terminalStatuses = new Set(["completed", "failed"]);
const activeStatuses = new Set(["queued", "in_progress", "suspended"]);

export function classifyHttpStatus(status) {
  const classifications = new Map([
    [202, "accepted"],
    [401, "unauthenticated"],
    [403, "forbidden"],
    [404, "not-found"],
    [409, "not-runnable"],
  ]);
  return classifications.get(status) ?? `http-${status}`;
}

function assertSafeConfiguration({ agentId, conversationKey, idempotencyKey, input }) {
  if (!/^agtch_[A-Za-z0-9]+$/.test(agentId))
    throw new Error("Workspace Agent trigger ID is invalid");
  if (!/^[A-Za-z0-9._:-]{1,160}$/.test(conversationKey))
    throw new Error("Workspace Agent conversation key is invalid");
  if (!/^[A-Za-z0-9._:-]{1,200}$/.test(idempotencyKey))
    throw new Error("Workspace Agent idempotency key is invalid");
  if (typeof input !== "string" || input.trim().length === 0)
    throw new Error("Workspace Agent callback input is empty");
}

async function parseJson(response, phase) {
  try {
    return await response.json();
  } catch {
    throw new Error(`Workspace Agent ${phase} returned invalid JSON`);
  }
}

async function request(fetchImpl, url, options, phase, requestTimeoutMs) {
  try {
    return await fetchImpl(url, {
      ...options,
      signal: options.signal ?? AbortSignal.timeout(requestTimeoutMs),
    });
  } catch {
    throw new Error(`Workspace Agent ${phase} failed (transport-failure)`);
  }
}

export async function triggerWorkspaceAgent({
  token,
  agentId,
  conversationKey,
  idempotencyKey,
  input,
  fetchImpl = fetch,
  sleep = (milliseconds) => new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds)),
  pollAttempts = 30,
  pollIntervalMs = 5_000,
  requestTimeoutMs = 15_000,
}) {
  if (typeof token !== "string" || token.length === 0)
    throw new Error("Workspace Agent access token is not configured");
  assertSafeConfiguration({ agentId, conversationKey, idempotencyKey, input });

  const endpoint = `https://api.chatgpt.com/v1/workspace_agents/${agentId}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
    "OpenAI-Beta": "workspace_agent_runs=v1",
  };
  const triggerResponse = await request(
    fetchImpl,
    `${endpoint}/trigger`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ conversation_key: conversationKey, input }),
    },
    "trigger",
    requestTimeoutMs,
  );
  const triggerClassification = classifyHttpStatus(triggerResponse.status);
  if (triggerResponse.status !== 202)
    throw new Error(
      `Workspace Agent trigger failed (${triggerClassification}; HTTP ${triggerResponse.status})`,
    );

  const trigger = await parseJson(triggerResponse, "trigger");
  if (
    typeof trigger.conversation_url !== "string" ||
    !trigger.conversation_url.startsWith("https://chatgpt.com/")
  )
    throw new Error("Workspace Agent trigger response has an invalid conversation URL");
  if (
    typeof trigger.agent_trigger_run_id !== "string" ||
    !/^apirun_[A-Za-z0-9]+$/.test(trigger.agent_trigger_run_id)
  )
    throw new Error("Workspace Agent trigger response has an invalid run ID");

  for (let attempt = 1; attempt <= pollAttempts; attempt += 1) {
    const runResponse = await request(
      fetchImpl,
      `${endpoint}/runs/${trigger.agent_trigger_run_id}`,
      { method: "GET", headers: { Authorization: `Bearer ${token}` } },
      "run-status request",
      requestTimeoutMs,
    );
    if (runResponse.status !== 200)
      throw new Error(
        `Workspace Agent run-status request failed (${classifyHttpStatus(runResponse.status)}; HTTP ${runResponse.status})`,
      );
    const run = await parseJson(runResponse, "run-status request");
    if (terminalStatuses.has(run.status)) {
      if (run.status === "failed") {
        const code = ["dispatch_failed", "run_failed"].includes(run.error?.code)
          ? run.error.code
          : "unknown";
        throw new Error(`Workspace Agent run failed (${code})`);
      }
      return {
        classification: triggerClassification,
        conversationUrl: trigger.conversation_url,
        runId: trigger.agent_trigger_run_id,
        status: run.status,
      };
    }
    if (!activeStatuses.has(run.status))
      throw new Error("Workspace Agent run returned an unknown status");
    if (attempt < pollAttempts) await sleep(pollIntervalMs);
  }

  throw new Error("Workspace Agent run timed out before reaching a terminal state");
}

async function appendSummary(path, message) {
  if (path) await appendFile(path, `${message}\n`, "utf8");
}

export async function main(environment = process.env) {
  const input = await readFile(resolve(environment.CALLBACK_INPUT_FILE ?? ""), "utf8");
  try {
    const result = await triggerWorkspaceAgent({
      token: environment.CHATGPT_AGENT_ACCESS_TOKEN ?? "",
      agentId: environment.CHATGPT_AGENT_ID ?? "",
      conversationKey: environment.CONVERSATION_KEY ?? "",
      idempotencyKey: environment.IDEMPOTENCY_KEY ?? "",
      input,
    });
    await appendSummary(
      environment.GITHUB_STEP_SUMMARY,
      `ChatGPT callback completed: ${result.conversationUrl} (run ${result.runId})`,
    );
    console.log(`Workspace Agent callback completed (run ${result.runId})`);
  } catch (error) {
    await appendSummary(
      environment.GITHUB_STEP_SUMMARY,
      `ChatGPT callback blocked: ${error.message}`,
    );
    throw error;
  }
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
