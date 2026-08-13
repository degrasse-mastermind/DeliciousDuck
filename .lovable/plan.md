# Illustration remediation — from the audit findings

The full read-only audit (all 22 subjects, every render site, desktop + mobile evidence) is delivered as a document. This plan is the fix list, in the order it should be built. Nothing here changes the artistic style — palette, line weight and paper grounding stay exactly as they are.

## P0 — visible defects

1. **Re-export the two grey-ground drawings.** `spices.jpg` (#ededeb) and `wild-vs-farmed.jpg` (#f5f5f5) are the only assets whose baked background is not white, so they multiply into a visible darker rectangle. Regenerate both on pure white using the existing house-style prompt and rebuild their 700/1400 WebP variants. Fixes the box seam across the whole Ingredients pillar.
2. **Fix the responsive-variant name parser.** `sketchNameFromSrc` treats a trailing 6+ character word as a build hash, so `sliced-breast`, `wild-vs-farmed`, `fruit-pairings`, `gear-flatlay` and `ducks-flight` lose their WebP `srcSet` and the header preload href — mobile pulls the 1400px JPEG. Match the real Vite hash shape (or resolve names from the registry) and add a test that every registry entry resolves a 700w and 1400w source.

## P1 — layout treatment

3. **Stop slicing single-subject art.** Short in-body bands crop a 1400x800 drawing to 160-192px with `object-cover`, which cuts the plate off the `sliced-breast` and `sides` drawings. Switch band contexts to an aspect-ratio box with `object-contain` on the cream surface (or widen the short band to 21:9).
4. **No empty framed boxes on fast scroll.** Lazy bands currently render as a blank cream rectangle until decode. Add a faint paper placeholder and let the first in-body band load eagerly.
5. **Mobile backdrops.** The whisper/soft backdrop layer becomes a 244x301 `contain` smudge under `lg`. Hide it on small screens or anchor it as a low-opacity `cover`.

## P2 — consistency

6. **Normalize subject scale and padding** across all 22 assets: trim to the ink bounding box, then pad to a fixed share of the canvas, vertically centered. Removes the "some drawings look tiny, some look huge" effect between pillars.
7. **Replace `object-fit: fill`** on uncropped figures with `object-contain`, so a future off-ratio asset letterboxes instead of stretching.
8. **Photography vs illustration rule.** Recommend: photography keeps the homepage hero and pillar tiles, illustration owns editorial interiors, and recipe cards pick one lane sitewide. Needs your decision before any card work.

## P3 — guardrails

9. Document in the style contract that multiply-on-white is light-surface only; any sketch on a dark surface needs a true alpha export (protects against the dark token set and future dark CTAs).
10. Lock the canonical export path — 1400x800, pure white, 700w + 1400w WebP — so new art cannot reintroduce a coloured ground.

## Technical notes

- Files touched by P0-P2: `src/lib/sketch-sources.ts`, `src/lib/sketch-variants.ts`, `src/components/site/SketchFigure.tsx`, `src/components/site/SketchSlot.tsx`, `src/lib/sketch-style.ts`, plus regenerated assets under `src/assets/sketch/`.
- Homepage recipe cards were verified: all four images load 200 at 1024x768, `width`/`height` match `aspect-[4/3]`, no layout shift. The grey rectangle on mobile is lazy-load timing, addressed by item 4's placeholder pattern applied to `RecipeCard`.
- Item 8 is a brand decision, not an engineering one — tell me which lane you want and I will scope it separately.
