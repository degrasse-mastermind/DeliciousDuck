# MethodNorth Agent Operations

This repository is the first project installation of a reusable, COO-led operations engine. GitHub is the durable task ledger; ChatGPT is the planning and approval surface; Codex performs approved repository work; Zapier and other services are restricted delivery adapters.

## Operating flow

1. Discuss an objective with the COO in ChatGPT.
2. The COO drafts a stable task contract with a task ID, accountable business role, delivery mode, scope, acceptance criteria, dependencies, and prohibited actions.
3. The owner approves the exact contract revision in the durable ledger.
4. GitHub dispatches the complete structured contract to the selected role. Before the time-limited Codex job starts, a short preparation job validates the task ID, role, mode, issue, conversation key, callback decision, approval identity, timestamp, and revision against the dispatch inputs and retains the safe routing outputs. Codex revalidates the same contract, then combines it with that role's charter and a delivery prompt for `plan`, `implement`, `review`, or `qa`.
5. Codex returns evidence to the linked GitHub issue. Implementation mode may open a review branch and pull request, but it never merges or deploys.
6. Specialist work returns to the COO. A configured API callback is accepted only when ChatGPT returns `202`; the bridge then polls the returned run ID to a terminal state. The linked issue is updated only after callback handling so its final result distinguishes `not-approved`, `not-attempted`, `completed`, `blocked`, `failed`, and `timed-out` callback outcomes. Because routing comes from the preparation job, a Codex timeout cannot erase an already-approved callback decision or the linked issue destination. When all dependencies are complete, the COO produces the final synthesis and requests any next owner decision.

Business accountability and delivery permissions are separate. A CTO can plan, implement, review, or test; selecting the CTO does not itself grant write access. Only an owner-approved `implement` task receives a writable Codex sandbox. A conversation key does not authorize a callback: the contract and dispatch must separately approve that external write and bind it to an idempotency key.

Roles never receive Zapier or provider credentials directly. They request a permitted operation through the task contract; the COO confirms the approved action, and the courier executes only an allowlisted action against an allowlisted destination. The integration policy remains disabled until those controls and credentials are configured.

## Durable task contract

Task IDs use `DD-YYYY-NNN` for DeliciousDuck. Each task records one accountable role, one delivery mode, desired outcome, scope, acceptance criteria, dependencies, prohibited actions, approval evidence, results, and owner decisions. The issue template is the human-readable ledger; the schemas in the plugin define the portable machine contract.

## Approval and safety

Dispatch requires an explicit owner approval flag. Merge, deploy, publication, spending, external messages, production-data changes, credential changes, and published-history rewrites remain blocked unless the owner separately authorizes that exact action. Secrets live in project-scoped secret stores and never in task bodies, prompts, artifacts, or callbacks.

## Reuse in another project

Keep the shared plugin and schemas versioned, but create a separate installation for every project. From a checkout containing this plugin, run:

```sh
node plugins/methodnorth-agent-operations/scripts/install-project.mjs \
  --target /path/to/project \
  --project-id example \
  --project-name "Example Project" \
  --task-prefix EX \
  --role-namespace example-team
```

Then customize every generated role charter, install the workflow and issue template, run the validator, and provision independent OpenAI, ChatGPT Workspace Agent, GitHub, Zapier, deployment, and data-provider credentials. Never clone `.env` files, tokens, production IDs, task history, or business data.

Fresh installations record the GitHub ledger as configured but `not-tested`. Change its verification state to `verified` only after a controlled project-specific test produces durable evidence; configuration alone is not verification.

## Activation state still requiring the owner

- The private COO Workspace Agent, API channel, access-token secret, and channel variable are configured. The integration policy records configuration separately from verification: the callback is currently `configured` but `blocked` with the safe reason code `agent-not-runnable`. The first callback delivered its input but the agent run did not complete, so activation remains unverified.
- The bridge-hardening pull request is merged. The next controlled review reached the Codex time limit before producing a result, which exposed that issue and callback routing still depended on outputs from the cancelled job; no callback or issue result comment was produced.
- Review and merge the focused timeout-reconciliation change through the protected path before authorizing another activation test. A later test requires a new exact task revision and separate approval for one callback.
- Keep Zapier disabled until the private operations interface, action allowlist, destination allowlist, and separate external-write approval flow are implemented and reviewed.

The local OpenAI development key is already stored in the ignored `.env.local` file. It is not copied into GitHub automatically.
