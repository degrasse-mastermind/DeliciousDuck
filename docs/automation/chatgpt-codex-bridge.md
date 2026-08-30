# ChatGPT ↔ Codex task bridge

## What this repository now supports

The repository uses GitHub as the durable handoff and audit layer:

1. ChatGPT or another trusted dispatcher sends a `codex-task` repository dispatch with the complete approved JSON task contract plus matching task ID, revision, accountable business role, delivery mode, GitHub issue, and ChatGPT conversation identifiers.
2. `.github/workflows/codex-task.yml` validates the contract and rejects incomplete, unapproved, malformed, or conflicting inputs before combining the complete contract with the selected business charter and delivery-mode prompt.
3. Planning, review, and QA results are written to the workflow summary and optional issue.
4. Approved implementation changes are packaged as a patch in the unprivileged Codex job, applied in a fresh job, and opened as a pull request. They are never pushed directly to `main`.
5. A stable `conversation_key` does not authorize transmission. Only a contract with a separately approved callback and matching dispatch flag may return the final result. That callback uses its contract-bound idempotency key, requests a trigger run ID, safely classifies HTTP failures, and polls the accepted run to `completed` or `failed` without logging credentials or unrestricted response bodies. The bridge reconciles the callback outcome before commenting on the linked issue, so a blocked, failed, or timed-out callback cannot leave the durable ledger labeled successful.

## Role and permission contract

The business role supplies domain judgment: `coo`, `cmo`, `growth-marketer`, `content-creator`, `product-manager`, `cto`, or `cfo`. The delivery mode independently controls how the role works:

| Delivery mode | Purpose                                          | Repository access | Output                     |
| ------------- | ------------------------------------------------ | ----------------- | -------------------------- |
| `plan`        | Discovery, acceptance criteria, sequencing, risk | Read-only         | Plan                       |
| `implement`   | Focused code, content, or automation change      | Workspace write   | Reviewable PR              |
| `review`      | Regression, security, business, editorial review | Read-only         | Findings                   |
| `qa`          | Independent acceptance validation                | Read-only         | PASS/FAIL/BLOCKED evidence |

Only an explicit owner-approved dispatch runs. This approval does not authorize merge, deploy, publication, spending, external messaging, production-data changes, credential changes, or scope expansion.

## Required GitHub configuration

The bridge is intentionally dormant until credentials are supplied:

- Actions secret `OPENAI_API_KEY`: API key used only by the official Codex Action proxy.
- Optional Actions secret `CHATGPT_AGENT_ACCESS_TOKEN`: a Workspace Agent access token.
- Optional Actions variable `CHATGPT_AGENT_ID`: the published agent API trigger ID (`agtch_...`).

Do not add Supabase service-role keys, Resend keys, admin tokens, webhook secrets, or production data credentials to this general-purpose automation workflow.

## Dispatch payload

Send a trusted GitHub REST request to `POST /repos/degrasse-mastermind/DeliciousDuck/dispatches`:

```json
{
  "event_type": "codex-task",
  "client_payload": {
    "task_id": "DD-2026-001",
    "business_role": "cto",
    "work_mode": "review",
    "approved_revision": 1,
    "approved_by": "repository-owner",
    "approved_at": "2026-08-30T12:23:29Z",
    "task_contract": {
      "schema_version": "1.0",
      "task_id": "DD-2026-001",
      "objective": "Review the current automation against the approved scope and acceptance criteria.",
      "business_role": "deliciousduck-team:cto",
      "work_mode": "review",
      "scope": ["Approved repository automation files"],
      "out_of_scope": ["Implementation", "Merge", "Deploy", "Credential changes"],
      "acceptance_criteria": ["Return evidence-backed findings or explicit residual gaps"],
      "dependencies": [],
      "authority": { "repository": "read-only", "external": "approved-actions" },
      "approval": {
        "status": "approved",
        "revision": 1,
        "approved_by": "repository-owner",
        "approved_at": "2026-08-30T12:23:29Z"
      },
      "callback": {
        "approved": true,
        "idempotency_key": "DD-2026-001-r1-callback"
      },
      "issue_number": 123,
      "conversation_key": "deliciousduck-task-123"
    },
    "owner_approved": true,
    "callback_approved": true,
    "issue_number": "123",
    "conversation_key": "deliciousduck-task-123"
  }
}
```

Every repeated dispatch field must match the contract. The bridge fails before Codex when the task ID, role, mode, approved revision, approval owner, approval timestamp, issue number, conversation key, or callback approval diverges. A callback approval of `false` prevents transmission even when a conversation key and credentials exist. Only a trusted ChatGPT plugin/MCP tool or server-side automation should hold the GitHub credential that sends this request. Do not place a GitHub token in a chat, issue body, client-side app, Codespace image, or repository file.

## Workspace Agent callback outcomes

The callback requests beta run tracking with `OpenAI-Beta: workspace_agent_runs=v1`. A trigger is accepted only on HTTP `202`. The bridge classifies `401` as unauthenticated, `403` as forbidden, `404` as not found, and `409` as not runnable, without printing the response body. Accepted triggers must return a safe ChatGPT conversation URL and an `apirun_...` identifier. The bridge polls that run with bounded retries and marks the workflow successful only when the run reaches `completed`.

The callback step writes only a safe outcome classification for later reconciliation. The final issue result records `not-approved` when no callback external write was authorized, `completed` after a terminal successful run, `blocked` for non-runnable or configuration failures, `timed-out` when polling does not reach a terminal state, and `failed` for a terminal failed run. The overall result is posted after callback handling; an approved callback that does not complete also fails the report job after the reconciled issue comment is written.

Integration configuration and activation evidence are separate. `status` controls whether an integration is operationally enabled, `configuration_status` records whether its required setup exists, and `verification.status` records `not-tested`, `verified`, or `blocked`. A blocked integration must use a non-sensitive `reason_code`; response bodies, credentials, and unrestricted provider diagnostics never belong in this file.

## Important ChatGPT boundary

GitHub settings alone cannot push an asynchronous result into an arbitrary existing ChatGPT conversation. The supported callback target is a published ChatGPT Workspace Agent API channel. Its `conversation_key` continues the same agent conversation and the trigger response provides a ChatGPT conversation URL.

If the exact originating chat must remain the control surface, build or connect a ChatGPT plugin/MCP tool that dispatches the GitHub event, tracks the workflow, and returns the result as its tool response. Until that tool is connected, use the Workspace Agent conversation or the linked GitHub issue as the durable control room.

## Webhook policy

No generic repository webhook is created without a real receiver. When a receiver exists, subscribe only to required events, use HTTPS with certificate verification, store a high-entropy webhook secret at the receiver, validate the signature and event/action, deduplicate with `X-GitHub-Delivery`, and respond quickly before processing asynchronously.

## Safe operating sequence

1. Plan in ChatGPT and create or link a GitHub issue.
2. Approve the exact task contract and dispatch one business role in one delivery mode.
3. Review the GitHub result or implementation PR.
4. Require CI and CodeQL to pass.
5. Merge through the protected path. Lovable remains exempt so its connected-branch sync is not broken.
6. Create a semantic tag such as `v1.2.3` only for an intentional release; the tag workflow validates and creates release notes.
