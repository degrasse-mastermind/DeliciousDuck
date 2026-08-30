---
name: agent-operations-orchestrator
description: Coordinate approved multi-role work through a configured project task ledger, dependency-aware handoffs, specialist evidence, and final executive synthesis. Use for operating reviews, sprint dispatch, role routing, status reconciliation, or reusable agent-team setup; do not use for ordinary single-scope work that needs no orchestration.
---

# Agent Operations Orchestrator

Treat the project task ledger as authoritative. Conversation context may propose work, but it does not replace a task contract or owner approval.

## Operating model

- Use one executive role as the conversational front door, task owner, blocker escalator, and final synthesizer.
- Separate the business role from the delivery mode. Business roles express accountable judgment; delivery modes express plan, implement, review, or QA behavior.
- Give each specialist a bounded work order with scope, dependencies, authority, acceptance criteria, and a required evidence format.
- Run independent work concurrently only when outputs cannot conflict. Sequence dependent or write-capable work.
- Return every specialist result to the same task ledger before executive synthesis.

## Approval boundary

Planning and read-only inspection may proceed within the declared scope. Require explicit owner approval recorded in the task contract before dispatching implementation or any external write.

Approval for one action does not authorize publishing, deployment, merging, spending, sending external messages, production-data changes, credential operations, or scope expansion. Stop and request a new decision when one of those becomes necessary.

## Workflow

1. Resolve the project configuration and requested role alias.
2. Validate the task contract and declared approval.
3. Confirm dependencies and decide which work is parallel-safe.
4. Dispatch bounded work using the configured delivery mode.
5. Collect structured results, evidence, blockers, and artifact links.
6. Fail closed when a required result is missing or unverifiable.
7. Produce one executive synthesis only after all required work reaches a terminal state.

Read [references/task-contract.md](references/task-contract.md) when drafting, validating, dispatching, or reconciling a task. Read [references/installation.md](references/installation.md) only when installing or cloning the engine for another project.
