# Remove the illustration from the homepage announcement banner

The seasonal Thanksgiving strip below the header keeps its copy, gold CTA, colors and texture — only the decorative artwork crop comes out, so the banner becomes a clean text + button strip on all screen sizes.

## Changes

1. `src/components/site/HomeAnnouncement.tsx` — delete the decorative `<span aria-hidden>` wrapper and its `<img>`, drop the now-unused `SKETCH` import and `art` variable. Layout keeps the flex row (message left, CTA right); no other styling changes.
2. `src/data/homepage-announcement.ts` — remove the `art` field and its `SketchKey` import from the `HomeAnnouncement` type and the `HOME_ANNOUNCEMENT` record.
3. `src/lib/__tests__/homepage-announcement.test.ts` — replace the illustration test block (crop sizing, `alt=""`, `h-16 w-24`, `w-[203%]`, art key) with an assertion that the banner renders no `<img>` and no `SKETCH` reference. Keep all other assertions (copy, single anchor, tracking, tokens, print/focus rules) unchanged.

## Verification

Run the full test suite and a typecheck; check the homepage at desktop and 393px for no leftover gap or overflow.
