# DeliciousDuck Creative Studio

An isolated, deterministic production package for DeliciousDuck social visuals and short-form video. It is intentionally excluded from the production application build, runtime dependencies, and root lint.

## Commands

```powershell
bun install --frozen-lockfile
bun run typecheck
bun run render:visuals
bun run render:videos
bun run qa
bun run source:check
bun run source:refresh
bun run studio
```

Generated assets live under `output/` and remain untracked. Approved source media is copied into `public/assets/` with provenance recorded in `src/content/source-snapshot.json`.

## Editorial contract

- Exact claims and safety language come from the repository source snapshot.
- Photography and illustrations are approved repository assets; no synthetic food footage is presented as tested cooking.
- Videos are intentionally narration-optional and use still-image editorial motion until real clips replace the documented media slots.
- One asset has one primary promise and one CTA.

## Locked systems

- Recipe post: 1080×1350
- Educational carousel: 1080×1350, seven-slide default
- Pinterest: 1000×1500, outcome/reference/decision variants
- Story: 1080×1920, native-interaction space reserved
- Short-form cover: 1080×1920, text and clean exports
- Video: 1080×1920 at 30 fps

Review `output/contact-sheets/` before approving any template or batch.

`source:check` compares canonical repository distribution metadata with the frozen Studio snapshot and writes a drift report. Only the explicit `source:refresh` command updates the snapshot and records the current repository revision and timestamp; ordinary renders never refresh source truth.
