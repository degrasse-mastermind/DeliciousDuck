# Remove D'Artagnan site-wide

D'Artagnan declined the affiliate application, so every mention of them — editorial copy, comparison rows, registry entries, and CTA slots — comes off the site. Nothing is backfilled: modules simply carry one fewer option.

## What changes for readers

- **Where to Buy Duck Online**: the "Best current options" callout and the sellers comparison table drop from five sellers to four — Culver Duck, TastyDuck (Jurgielewicz), Fossil Farms, Wild Fork. The per-seller detail card for D'Artagnan is removed. Intro copy that says "five sellers" is reworded to match.
- **Duck Fat Buying Guide**: US Wellness (affiliate) stays primary, Culver Duck stays as the unpaid alternative. The D'Artagnan option and its mention in the intro sentence are removed.
- **How to Choose Duck**: the sourcing callout switches from D'Artagnan to Culver Duck, with intro copy adjusted to match the seller named.
- **How to Cook Duck Breast**: the next-steps callout keeps the thermometer step and loses the D'Artagnan sourcing line; instead it points readers to the sourcing guide. Intro copy updated so the "one sourcing step and one measurement step" framing still reads true.
- **Affiliate Disclosure**: the sentence naming D'Artagnan as an unpaid merchant is rewritten to name only merchants still on the site.

## Technical detail

Files to edit:

- `src/data/affiliates.ts` — delete the `dartagnan` merchant record (status, direct URL, Awin publisher-ID history note). The Awin publisher ID is not referenced elsewhere; it goes with the row.
- `src/data/commercial-links.ts` — delete the `dartagnan-duck` link entry and remove its id from the `buy_duck_primary_options`, `duck_fat_sources`, `choose_duck_sources`, and `duck_breast_next_steps` placements. `choose_duck_sources` keeps `culver-duck`; `duck_breast_next_steps` keeps `thermoworks-thermometer`.
- `src/data/comparisons.ts` — remove the `dartagnan` row from `DUCK_MERCHANTS` (table + detail cards both read from it).
- `src/data/revenue.ts` — remove the `sourcing-dartagnan` deep-link entry and the four intent slots that reference `dartagnan` / `sourcing-dartagnan`. Two of those are on `/cook/how-to-cook-duck-breast` and one other technique page where the slot's real purpose is "link to the sourcing guide"; those get repointed to the sourcing guide path rather than a merchant deep link, so the internal switchboard stays accurate.
- Routes: `buy.where-to-buy-duck-online.tsx`, `buy.duck-fat-buying-guide.tsx`, `buy.how-to-choose-duck.tsx`, `cook.how-to-cook-duck-breast.tsx`, `affiliate-disclosure.tsx` — drop the id from `linkIds` and update the surrounding prose.
- Tests: `src/data/__tests__/duck-sourcing-merchants.test.ts`, `src/lib/__tests__/us-wellness-duck-fat.test.ts`, `src/lib/__tests__/amazon-associates.test.ts`, `src/lib/__tests__/commercial-links.test.ts` — replace the current "D'Artagnan is declined/unmonetized" assertions with a guardrail asserting D'Artagnan appears nowhere: no merchant id, no commercial-link id, no `dartagnan.com` URL, and no "D'Artagnan" string in any route or data file.

Amazon equipment monetization, US Wellness duck-fat scope, and the ThermoWorks declined/direct state are untouched.

## Verification

Full test suite and typecheck, then browser QA at desktop and 375px on `/buy/where-to-buy-duck-online`, `/buy/duck-fat-buying-guide`, `/buy/how-to-choose-duck`, `/cook/how-to-cook-duck-breast`, and `/affiliate-disclosure`: zero console errors, no `dartagnan.com` link in the rendered DOM, US Wellness fat CTA still exactly `https://grasslandbeefllc.sjv.io/xJoWgR` with `sponsored nofollow noopener`. No publish until QA is clean.
