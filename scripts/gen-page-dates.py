#!/usr/bin/env python3
"""Generate src/data/page-dates.ts from git history.

Article JSON-LD should carry real dates, not invented ones. For every static
route file we read the date of its first commit (datePublished) and its most
recent content commit (dateModified) straight out of git, so the dates in the
markup are always something that actually happened.

Run after adding or substantially revising a route:
    python3 scripts/gen-page-dates.py
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROUTES = Path("src/routes")
OUT = Path("src/data/page-dates.ts")
SKIP_PREFIXES = ("/api", "/internal", "/newsletter", "/search", "/sitemap")


def route_path(file: Path) -> str | None:
    name = file.name[: -len(file.suffix)]
    if name.startswith("__") or "$" in name or "[" in name:
        return None
    if name == "index":
        return "/"
    segments = name.split(".")
    if segments[-1] == "index":
        segments = segments[:-1]
    path = "/" + "/".join(segments)
    if any(path == p or path.startswith(p + "/") for p in SKIP_PREFIXES):
        return None
    return path


def git_dates(file: Path) -> tuple[str, str] | None:
    out = subprocess.run(
        ["git", "log", "--follow", "--date=short", "--format=%ad", "--", str(file)],
        capture_output=True,
        text=True,
    ).stdout.split()
    if not out:
        return None
    return out[-1], out[0]


def main() -> None:
    entries: dict[str, dict[str, str]] = {}
    for file in sorted(ROUTES.rglob("*.tsx")):
        path = route_path(file)
        if not path:
            continue
        dates = git_dates(file)
        if not dates:
            continue
        published, modified = dates
        entries[path] = {"published": published, "modified": modified}

    body = json.dumps(entries, indent=2, sort_keys=True)
    OUT.write_text(
        "/**\n"
        " * Publication dates per route, generated from git history by\n"
        " * scripts/gen-page-dates.py. Never hand-edit: every date here is the real\n"
        " * date the page was first committed or last revised.\n"
        " */\n"
        "export interface PageDates {\n"
        "  published: string;\n"
        "  modified: string;\n"
        "}\n\n"
        f"export const PAGE_DATES: Record<string, PageDates> = {body} as const;\n\n"
        "export const pageDates = (path: string): PageDates | undefined => PAGE_DATES[path];\n"
    )
    print(f"wrote {OUT} with {len(entries)} routes")


if __name__ == "__main__":
    main()
