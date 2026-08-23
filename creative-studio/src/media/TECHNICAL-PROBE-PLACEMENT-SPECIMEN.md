# Technical Probe Placement — Specimen Intake Contract

This is an art-direction specimen, not approved production artwork. Slot ID: `technicalProbePlacement`. Specimen ID: `DD-ILL-technical-probe-placement-SPECIMEN-v01`.

## Expected files

Required:

- `public/media/illustrations/technical-probe-placement/DD-technical-probe-placement-source-2400x3000.png`

Optional layered source:

- `public/media/illustrations/technical-probe-placement/DD-technical-probe-placement-layers.svg`

The PNG is a 2400 × 3000 px, 4:5, sRGB master. It contains only the breast and probe on an ivory ground or transparency. It contains no substantive typography, logo, temperature, measurement, label, callout, arrow or explanatory copy.

The optional SVG uses `viewBox="0 0 2400 3000"` and preserves the named groups `breast`, `probe`, `probe-path-registration`, and `target-registration`. Registration groups are non-visible alignment guides; Creative Studio owns every visible path, target, arrow and label.

## Composition and geometry

- The breast occupies the right 55–60% of the 4:5 master.
- The left 42% (0–1008 px) and upper-left quadrant remain visually uninterrupted.
- The expected subject bounds are x 1008–2400 px and y 600–2400 px.
- The registered horizontal probe line uses entry anchor `(2256, 1680)` and target anchor `(1776, 1680)`.
- The target anchor must land in the geometric centre of the thickest muscle, below the fat cap and clear of any board or pan.
- Creative Studio applies the ivory field and responsive positioning so the same source remains safe in a 9:16 extension and centred square crop. No second artist-composed layout is required.

## Specimen review checklist

- [ ] Anatomical accuracy: skin, fat cap and muscle are distinct, plausible and proportionally consistent.
- [ ] Probe path: the probe enters horizontally from the side and terminates at the registered centre of the thickest muscle.
- [ ] Negative space: the left 42% and upper-left quadrant are uninterrupted by subject, props or texture.
- [ ] Crop safety: breast and probe remain legible in 4:5, the studio-controlled 9:16 extension and centred square crop.
- [ ] Palette: ivory, forest/charcoal, restrained gold and muted cranberry only; no muddy wash.
- [ ] Line weight: primary contour and anatomical separators remain controlled and consistent; hatch is limited to cut surfaces.
- [ ] No baked-in text: no letters, numbers, marks resembling labels, logo, arrows, temperatures or explanatory copy.
- [ ] Motion readiness: breast and probe are independently selectable; optional registration groups align with the declared anchors.
- [ ] Technical review: a qualified culinary reviewer confirms anatomy and probe placement before slot approval changes from `legacy-placeholder` to `approved`.

## Acceptance behavior

Installing a file does not approve it. After review passes, update only the slot path and approval state in `src/media/library.ts`; existing templates continue to reference `technicalProbePlacement`. Until approval, normal render commands remain blocked.
