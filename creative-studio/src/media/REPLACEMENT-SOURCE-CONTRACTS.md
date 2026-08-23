# External Illustration Replacement Contracts

## Common contract

Each replacement must be externally supplied and explicitly approved before its registry state changes from `approval-required` to `approved`.

- Accepted source formats: high-resolution PNG, WebP or SVG.
- Minimum raster master: 2400 × 3000 px, sRGB.
- Optional layered delivery: SVG with meaningful, stable layer/group IDs for subject, tool, mechanism and registration targets where practical.
- Source art contains no factual typography, temperatures, measurements, labels, callouts, arrows, explanatory copy, CTA copy or logo.
- Creative Studio owns factual overlays, arrows, labels, titles, CTA and branding deterministically.
- Preserve transparent alpha or a true warm-ivory background; do not bake a simulated card or layout into the art.
- Artwork must satisfy the matching brief in `REPLACEMENT-BRIEFS.md` and pass technical/editorial review.

## Slot files

| Slot | Approved base filename | Optional layered filename | Intended intake directory |
|---|---|---|---|
| `scoringDepthAnatomy` | `DD-scoring-depth-anatomy-approved.png`, `.webp` or `.svg` | `DD-scoring-depth-anatomy-approved-layers.svg` | `public/media/approved/scoring-depth-anatomy/` |
| `fatFlowPanContact` | `DD-fat-flow-pan-contact-approved.png`, `.webp` or `.svg` | `DD-fat-flow-pan-contact-approved-layers.svg` | `public/media/approved/fat-flow-pan-contact/` |
| `coldPanMechanism` | `DD-cold-pan-mechanism-approved.png`, `.webp` or `.svg` | `DD-cold-pan-mechanism-approved-layers.svg` | `public/media/approved/cold-pan-mechanism/` |
| `thermometerReference` | `DD-thermometer-reference-approved.png`, `.webp` or `.svg` | `DD-thermometer-reference-approved-layers.svg` | `public/media/approved/thermometer-reference/` |
| `carryoverDonenessAnatomy` | `DD-carryover-doneness-anatomy-approved.png`, `.webp` or `.svg` | `DD-carryover-doneness-anatomy-approved-layers.svg` | `public/media/approved/carryover-doneness-anatomy/` |

Installing a file alone is insufficient: the slot path and approval state must be changed together after review. Until then, production rendering and QA remain fail-closed.
