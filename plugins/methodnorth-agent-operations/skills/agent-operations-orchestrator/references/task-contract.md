# Task contract

Every orchestrated task needs one durable identifier and one authoritative ledger record.

Required fields:

- `task_id`: stable project-prefixed identifier.
- `objective`: the outcome that should become true.
- `business_role`: accountable project role alias.
- `work_mode`: `plan`, `implement`, `review`, or `qa`.
- `scope` and `out_of_scope`: explicit boundaries.
- `acceptance_criteria`: independently verifiable statements.
- `dependencies`: task IDs that must complete first.
- `authority`: allowed repository and external actions.
- `approval`: owner identity, status, timestamp, and approved revision.
- `conversation_key`: stable callback thread identifier when configured.

Task states:

`draft -> awaiting_owner_approval -> approved -> dispatched -> in_progress -> specialist_review -> executive_synthesis -> owner_review -> completed`

`blocked` is a non-terminal state that requires a concrete reason and next decision. `failed` and `cancelled` are terminal states.

Specialist results must identify the task, role, work mode, status, summary, deliverables, validation evidence, risks, blockers, and requested owner decisions. Do not mark acceptance criteria complete without evidence.

Use one idempotency key per task revision and action. Never reuse it for a materially changed request.
