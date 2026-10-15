# Thermometer experiment implementation plan

**Goal:** Prepare the approved 30-day experiment for review, without launching it.
**Architecture:** Keep registered commercial destinations, existing page components, disclosures and click tracking. Add two verified product destinations and improve the three existing reader paths.
**Tech stack:** React, TanStack Start, TypeScript, Bun, Vitest.
**Spec:** User-approved delegation of October 15, 2026, with parent-supplied product and USDA facts.

## Constraints

Start at main 4ec167b (merged PR #30). No merge, publication, email delivery, campaign scheduling, purchases or credentials. No price, stock, speed or hands-on testing claims. Preserve newsletter and analytics behavior. Email audience is unknown.

## Tasks

- [ ] Add regression coverage for canonical TP19H / TP16 URLs, one existing Amazon tag, affiliate state and disclosure; run red, implement central product URL builder and registry seeds, run green.
- [ ] Test measured 165°F safety copy and absence of fixed carryover promises; correct the temperature guide and relevant Thanksgiving safety locations. Add one recommendation beside the temperature guidance, linking to the existing gear guide so Amazon placements remain on gear pages.
- [ ] Add the two specification-based product choices to the gear guide; reuse existing Thanksgiving guide for equipment checks. Preserve layout and disclosure components.
- [ ] Prepare standalone plain-text email drafts and experiment brief with launch prerequisites.
- [ ] Run frozen-lockfile tests, typecheck, build and lint; independent whole-branch review; create draft PR.

## Review focus

Canonical model identity; tags and disclosure before merchant links; below-minimum temperatures never presented as safe equivalents; whole-bird readings include breast, wing and thigh; emails contain only site links and no assumption of a sendable audience.

## Execution ledger

- Isolation: fresh clone and dedicated branch; native worktree tool rejected the execution environment. No existing checkout modified.
- Ruling: execute approved bounded design without an additional plan approval; user explicitly authorized preparation and requested completion.
- Ruling: retain Amazon links on gear pages; temperature and Thanksgiving recommendations route through the guide, preserving the existing placement contract.
