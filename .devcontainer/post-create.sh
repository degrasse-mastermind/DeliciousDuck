#!/usr/bin/env bash
set -Eeuo pipefail

if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
fi

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

bun install --frozen-lockfile
bun run typecheck
bun run build

printf '\nCodespace ready. Start DeliciousDuck with: bun run dev -- --host 0.0.0.0\n'
