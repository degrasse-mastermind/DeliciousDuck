# DeliciousDuck GitHub configuration

Verified on August 30, 2026.

## Active safeguards

- `main` is protected from deletion and non-fast-forward updates, requires a pull request with resolved review threads, and requires the `quality` and CodeQL `analyze` checks.
- Lovable's integration has the existing bypass needed to preserve connected-project synchronization.
- Semantic version tags matching `v*.*.*` cannot be deleted or moved.
- Actions are limited to GitHub-owned actions plus the allowlisted Codex and Bun actions; SHA pinning is required.
- Default workflow permissions are read-only, and workflows cannot approve pull requests.
- Secret scanning, push protection, and Dependabot security updates are enabled.
- Preview and Production environments exist. Production requires owner review and protected branches; administrators cannot bypass it.
- Codespaces detects `.devcontainer/devcontainer.json`, installs with Bun's frozen lockfile, and runs typecheck and build during setup.
- Role and delivery-mode labels exist alongside the existing task labels.

## Configured but not fully activated

- The Workspace Agent callback credentials and API channel are configured, but end-to-end activation is not yet verified. Machine-readable integration state records `configuration_status: configured` and `verification.status: blocked` with the non-sensitive reason code `agent-not-runnable`. The first controlled callback delivered its input and returned `409`. After bridge hardening merged, the next read-only review timed out in Codex before the approved callback or issue result comment could run because their routing metadata was tied to the cancelled job. Do not retry until the timeout-reconciliation change is reviewed and merged and a new callback action is explicitly approved.

## Intentionally not configured yet

- No generic repository webhook exists because there is no approved receiver. Add one only with a concrete HTTPS endpoint, signature verification, delivery deduplication, and a narrow event list.
- Zapier remains disabled in the integration policy until the private operations plugin, action allowlist, destination allowlist, and approval receipt are ready.
- No Codespaces API key is stored. Create a separate project-scoped key for Codespaces rather than copying the local-development key.
- No release tag exists yet. Create a semantic tag only for an intentional, validated release.

## Cleanup decision

Both `OPENAI_API_KEY` and the obsolete `OPEN_API_KEY` secret names currently exist. The workflow uses only `OPENAI_API_KEY`. Delete `OPEN_API_KEY` after the owner explicitly approves destructive secret cleanup; its value cannot be recovered after deletion.
