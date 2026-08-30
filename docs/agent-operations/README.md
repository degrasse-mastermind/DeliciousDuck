# MethodNorth Agent Operations

This repository is the first project installation of a reusable, COO-led operations engine. GitHub is the durable task ledger; ChatGPT is the planning and approval surface; Codex performs approved repository work; Zapier and other services are restricted delivery adapters.

## Operating flow

1. Discuss an objective with the COO in ChatGPT.
2. The COO drafts a stable task contract with a task ID, accountable business role, delivery mode, scope, acceptance criteria, dependencies, and prohibited actions.
3. The owner approves the exact contract.
4. GitHub dispatches the task to the selected role. The workflow combines that role's charter with a delivery prompt for `plan`, `implement`, `review`, or `qa`.
5. Codex returns evidence to the linked GitHub issue. Implementation mode may open a review branch and pull request, but it never merges or deploys.
6. Specialist work returns to the COO. When all dependencies are complete, the COO produces the final synthesis and requests any next owner decision.

Business accountability and delivery permissions are separate. A CTO can plan, implement, review, or test; selecting the CTO does not itself grant write access. Only an owner-approved `implement` task receives a writable Codex sandbox.

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

## Configuration still requiring the owner

- Publish the COO Workspace Agent and record its channel ID.
- Create a Workspace Agent access token and save it as the GitHub Actions secret `CHATGPT_AGENT_ACCESS_TOKEN`.
- Add the published channel ID as the GitHub Actions variable `CHATGPT_AGENT_ID`.
- Configure the private operations plugin and Zapier connections with minimum permissions and destination allowlists.
- Add GitHub environment protections and rulesets after reviewing the proposed branch and deployment policy.

The local OpenAI development key is already stored in the ignored `.env.local` file. It is not copied into GitHub automatically.
