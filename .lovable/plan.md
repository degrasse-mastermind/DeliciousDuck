# Deferred: Named-dish recipe pilot

Status: Backlogged — not scheduled for immediate implementation.

From the 2026-08-18 traffic analysis, the recipe section is the thinnest part of the site (4 named-dish pages) while dish-name searches carry the highest duck-query demand. This plan captures the proposed pilot so it can be picked up later without re-researching the rationale.

## Traffic insight

- "duck recipes" ~60.5k/mo, KD 36
- "roast duck recipe" ~6.6k/mo, KD 27
- "duck a l'orange" ~5.4k/mo
- Current site: 31 guides, only 9 starter recipes, 4 named-dish pages

## Pilot scope

Build one named-dish recipe page at `/recipes/duck-a-lorange`:

- Full Recipe JSON-LD schema
- Editorial voice and SourceMark sourcing
- Internal links to COOK, BUY, GEAR, and existing tools
- Conversion paths (US Wellness duck fat, ThermoWorks thermometer, Amazon gear)
- Seasonal/entertaining tie-in

## Why this is the right first test

- Existing Recipe schema and `/recipes` hub can support it
- Guides already cover the underlying techniques
- Low-risk way to read Search Console impressions before expanding to Peking, roast duck, confit, etc.

## Not in scope

- Bulk recipe expansion
- New tools or components
- Schema changes beyond Recipe JSON-LD

## Next step

When ready, approve this plan and implement the `/recipes/duck-a-lorange` pilot page. Success metric: impressions and clicks in Search Console within 30 days of publish.
