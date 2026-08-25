# DeliciousDuck Distribution Playbook

This console organizes approved Creative Studio work for manual publishing. It never posts, schedules, uploads, or changes an external account.

1. Generate creative in the existing Creative Studio.
2. Run Creative Studio QA and visually inspect final crops, contact sheets, covers, and filmstrips.
3. Approve only source-current creative using approved media and provenance.
4. Add an asset to the typed launch manifest; keep its canonical URL unchanged.
5. Review the platform-specific title, caption, hashtags, CTA, cover, alt text, destination, and deterministic UTM URL.
6. Complete every applicable pre-publish check. An item cannot be `approved`, `scheduled`, or `published` with a failed mandatory check.
7. Publish manually in the platform. Record the external post ID, public URL, and actual publication time.
8. Import only metrics the platform or site actually provides. Leave unavailable values `null`.
9. Compare like with like: outcome Pins by outbound CTR, reference Pins by clicks and saves, shorts by retention and completion, and carousels by saves and shares.
10. Export `data/performance-summary.json` and feed observed learning—not assumptions—into the next Creative Studio batch.

## Manual performance import

Match rows on `distribution_id`. The initial JSON adapter runs with `npm run distribution:import -- <validated-export.json>`, validates non-negative counts and 0–1 rates, retains `null` for unavailable metrics, and records the source/export date. A future CSV adapter can normalize into the same input contract. Never infer missing platform metrics. Site metrics should join on the four UTM fields.

## Local console

From `creative-studio/distribution`, run `npx serve .` and open the displayed local URL. Use the queue, calendar, and detail panel for handoff; copy controls only place text on the clipboard.
