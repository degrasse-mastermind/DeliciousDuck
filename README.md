# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

This repository is Bun-managed. For an exact local setup on Windows, clone the repository and run:

```powershell
.\codex-setup.ps1
bun run dev -- --host 0.0.0.0
```

GitHub Codespaces is configured under `.devcontainer/` and runs the locked install, type-check, and production build when the container is created.

## Development automation

- Pull requests and `main` run type-check, Vitest, and a production build.
- CodeQL scans JavaScript/TypeScript changes and runs weekly.
- Dependabot groups routine npm and GitHub Actions updates.
- Project-scoped Codex roles live in `.codex/agents/`.
- The optional ChatGPT ↔ Codex workflow is documented in [docs/automation/chatgpt-codex-bridge.md](docs/automation/chatgpt-codex-bridge.md).
- Releases use semantic tags (`vMAJOR.MINOR.PATCH`) and are validated before GitHub release notes are created.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Editorial standards for contributors

All public copy on DeliciousDuck follows one voice and sourcing standard:
[docs/editorial-style-guide.md](docs/editorial-style-guide.md). In short — lead with
the useful answer, keep safety facts exact, and keep attribution compact
(`<SourceMark />` plus `<SourceNotes />` rather than "USDA recommends" in body copy).
Automated guardrails: `src/lib/__tests__/editorial-voice.test.ts`.
