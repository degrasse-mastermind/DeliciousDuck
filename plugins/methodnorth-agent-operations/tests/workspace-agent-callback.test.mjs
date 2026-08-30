import { describe, expect, it, vi } from "vitest";
import {
  classifyHttpStatus,
  triggerWorkspaceAgent,
} from "../scripts/return-workspace-agent-result.mjs";

const baseOptions = {
  token: "test-token",
  agentId: "agtch_Test123",
  conversationKey: "dd-2026-002",
  idempotencyKey: "33311365943",
  input: "Approved result payload",
  pollIntervalMs: 0,
};

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sequenceFetch(...responses) {
  return vi.fn(async () => {
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return response;
  });
}

describe("Workspace Agent callback", () => {
  it("requests a run ID, preserves idempotency, and polls to completed", async () => {
    const fetchImpl = sequenceFetch(
      jsonResponse(
        {
          conversation_url: "https://chatgpt.com/c/test-conversation",
          agent_trigger_run_id: "apirun_Test123",
        },
        202,
      ),
      jsonResponse({ status: "queued" }, 200),
      jsonResponse({ status: "completed" }, 200),
    );
    const result = await triggerWorkspaceAgent({
      ...baseOptions,
      fetchImpl,
      sleep: vi.fn(),
    });

    expect(result).toEqual({
      classification: "accepted",
      conversationUrl: "https://chatgpt.com/c/test-conversation",
      runId: "apirun_Test123",
      status: "completed",
    });
    const triggerHeaders = fetchImpl.mock.calls[0][1].headers;
    expect(triggerHeaders["OpenAI-Beta"]).toBe("workspace_agent_runs=v1");
    expect(triggerHeaders["Idempotency-Key"]).toBe(baseOptions.idempotencyKey);
    expect(fetchImpl.mock.calls[1][0]).toContain("/runs/apirun_Test123");
  });

  it.each([
    [401, "unauthenticated"],
    [403, "forbidden"],
    [404, "not-found"],
    [409, "not-runnable"],
    [500, "http-500"],
  ])("classifies HTTP %s without exposing a response body", async (status, classification) => {
    const fetchImpl = sequenceFetch(jsonResponse({ unsafe_detail: "do not print" }, status));
    await expect(triggerWorkspaceAgent({ ...baseOptions, fetchImpl })).rejects.toThrow(
      `${classification}; HTTP ${status}`,
    );
    expect(classifyHttpStatus(status)).toBe(classification);
  });

  it("classifies transport failures", async () => {
    const fetchImpl = sequenceFetch(new Error("private network detail"));
    await expect(triggerWorkspaceAgent({ ...baseOptions, fetchImpl })).rejects.toThrow(
      "transport-failure",
    );
  });

  it("applies a bounded timeout signal to every request", async () => {
    const fetchImpl = sequenceFetch(
      jsonResponse(
        {
          conversation_url: "https://chatgpt.com/c/test-conversation",
          agent_trigger_run_id: "apirun_Test123",
        },
        202,
      ),
      jsonResponse({ status: "completed" }, 200),
    );
    await triggerWorkspaceAgent({ ...baseOptions, fetchImpl, requestTimeoutMs: 25 });
    expect(fetchImpl.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(fetchImpl.mock.calls[1][1].signal).toBeInstanceOf(AbortSignal);
  });

  it("reports a safe failed-run code", async () => {
    const fetchImpl = sequenceFetch(
      jsonResponse(
        {
          conversation_url: "https://chatgpt.com/c/test-conversation",
          agent_trigger_run_id: "apirun_Test123",
        },
        202,
      ),
      jsonResponse({ status: "failed", error: { code: "run_failed", detail: "private" } }, 200),
    );
    await expect(triggerWorkspaceAgent({ ...baseOptions, fetchImpl })).rejects.toThrow(
      "Workspace Agent run failed (run_failed)",
    );
  });

  it("fails closed when polling times out", async () => {
    const fetchImpl = sequenceFetch(
      jsonResponse(
        {
          conversation_url: "https://chatgpt.com/c/test-conversation",
          agent_trigger_run_id: "apirun_Test123",
        },
        202,
      ),
      jsonResponse({ status: "in_progress" }, 200),
      jsonResponse({ status: "suspended" }, 200),
    );
    await expect(
      triggerWorkspaceAgent({
        ...baseOptions,
        fetchImpl,
        sleep: vi.fn(),
        pollAttempts: 2,
      }),
    ).rejects.toThrow("timed out");
  });

  it("fails closed on run-status HTTP errors and unknown states", async () => {
    const accepted = () =>
      jsonResponse(
        {
          conversation_url: "https://chatgpt.com/c/test-conversation",
          agent_trigger_run_id: "apirun_Test123",
        },
        202,
      );
    await expect(
      triggerWorkspaceAgent({
        ...baseOptions,
        fetchImpl: sequenceFetch(accepted(), jsonResponse({}, 404)),
      }),
    ).rejects.toThrow("not-found; HTTP 404");
    await expect(
      triggerWorkspaceAgent({
        ...baseOptions,
        fetchImpl: sequenceFetch(accepted(), jsonResponse({ status: "mystery" }, 200)),
      }),
    ).rejects.toThrow("unknown status");
  });
});
