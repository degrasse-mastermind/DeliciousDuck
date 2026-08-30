<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# DeliciousDuck agent operating contract

## Preserve the publishing path

- Lovable owns its published commit history. Never force-push, rebase, amend, or squash commits that already exist on GitHub.
- Work on a focused branch. Keep unrelated inherited changes intact and create a reviewable pull request unless the user explicitly authorizes a different path.
- Do not deploy, publish, change production data, rotate credentials, or alter provider-side settings without explicit authorization.

## Role routing

When a task or handoff explicitly declares `Role: planner`, `Role: implementer`, `Role: reviewer`, or `Role: qa`, delegate the task to exactly that project-scoped custom agent under `.codex/agents/`. Use the same mapping for GitHub labels named `agent:<role>`.

- `planner`: evidence-first discovery, task shaping, acceptance criteria, dependencies, and risk analysis; no edits.
- `implementer`: focused product or automation changes with proportional verification.
- `reviewer`: read-only regression, security, privacy, editorial-truth, and maintainability review.
- `qa`: independent validation of the requested acceptance criteria; do not repair failures unless separately asked.

For an ordinary single-scope task without an explicit role or delegation request, keep the work in the primary agent. For a multi-role task, delegate only when the user asks for parallel agents or the task explicitly requests more than one role, and wait for every requested role before reporting.

## Required evidence

- Use Bun and the committed `bun.lock`; install with `bun install --frozen-lockfile`.
- The default quality gate is `bun run typecheck`, `bun run test`, and `bun run build`.
- `bun run lint` currently exposes inherited formatting debt. Report it separately until the formatting backlog is deliberately fixed; never hide or mislabel its result.
- Treat local build/test results as local evidence, not proof of production behavior.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, provider API keys, webhook secrets, admin tokens, or user data. Frontend Supabase publishable keys are not authorization; RLS remains mandatory.
- For public culinary copy or media, preserve source fidelity, food-safety accuracy, provenance, and DeliciousDuck's editorial standards.
