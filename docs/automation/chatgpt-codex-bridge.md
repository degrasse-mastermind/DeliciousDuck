# ChatGPT ↔ Codex task bridge

## What this repository now supports

The repository uses GitHub as the durable handoff and audit layer:

1. ChatGPT or another trusted dispatcher sends a `codex-task` repository dispatch with a scoped task, one role, and optional GitHub issue and ChatGPT conversation identifiers.
2. `.github/workflows/codex-task.yml` runs the selected Codex role through the official Codex GitHub Action.
3. Planner, reviewer, and QA results are written to the workflow summary and optional issue.
4. Implementer changes are packaged as a patch in the unprivileged Codex job, applied in a fresh job, and opened as a pull request. They are never pushed directly to `main`.
5. If ChatGPT Workspace Agent credentials are configured, the final result is sent to that agent using the stable `conversation_key`.

## Role contract

| Role          | Purpose                                          | Repository access         | Output                     |
| ------------- | ------------------------------------------------ | ------------------------- | -------------------------- |
| `planner`     | Discovery, acceptance criteria, sequencing, risk | Read-only                 | Plan                       |
| `implementer` | Focused code or automation change                | Workspace write           | Reviewable PR              |
| `reviewer`    | Regression, security, privacy, editorial review  | Read-only                 | Findings                   |
| `qa`          | Independent acceptance validation                | No intended product edits | PASS/FAIL/BLOCKED evidence |

The same roles exist locally under `.codex/agents/`. A ChatGPT handoff should include `Role: <role>` so `AGENTS.md` routes it consistently in local Codex.

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
    "role": "planner",
    "task": "Define the outcome, scope, constraints, and acceptance criteria here.",
    "issue_number": "123",
    "conversation_key": "deliciousduck-task-123"
  }
}
```

Only a trusted ChatGPT plugin/MCP tool or server-side automation should hold the GitHub credential that sends this request. Do not place a GitHub token in a chat, issue body, client-side app, Codespace image, or repository file.

## Important ChatGPT boundary

GitHub settings alone cannot push an asynchronous result into an arbitrary existing ChatGPT conversation. The supported callback target is a published ChatGPT Workspace Agent API channel. Its `conversation_key` continues the same agent conversation and the trigger response provides a ChatGPT conversation URL.

If the exact originating chat must remain the control surface, build or connect a ChatGPT plugin/MCP tool that dispatches the GitHub event, tracks the workflow, and returns the result as its tool response. Until that tool is connected, use the Workspace Agent conversation or the linked GitHub issue as the durable control room.

## Webhook policy

No generic repository webhook is created without a real receiver. When a receiver exists, subscribe only to required events, use HTTPS with certificate verification, store a high-entropy webhook secret at the receiver, validate the signature and event/action, deduplicate with `X-GitHub-Delivery`, and respond quickly before processing asynchronously.

## Safe operating sequence

1. Plan in ChatGPT and create or link a GitHub issue.
2. Dispatch one explicit role.
3. Review the GitHub result or implementation PR.
4. Require CI and CodeQL to pass.
5. Merge through the protected path. Lovable remains exempt so its connected-branch sync is not broken.
6. Create a semantic tag such as `v1.2.3` only for an intentional release; the tag workflow validates and creates release notes.
