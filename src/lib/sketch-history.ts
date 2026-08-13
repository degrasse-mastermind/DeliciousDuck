/**
 * Session history for studio runs.
 *
 * Only *metadata* is persisted (settings, prompt, model, seed, timestamp, source
 * asset and a short blob id). Image bytes never go into sessionStorage — a
 * single 1400x800 data URL is ~1.5 MB and would blow the quota after two runs.
 * Bytes live in the dev-only temp blob store (`/api/sketch-blob`) which prunes
 * itself, so history entries older than the retention window resolve to
 * "expired — rerun these settings" rather than to a broken image.
 */

import type { StudioSettings } from "./sketch-studio";

export const HISTORY_KEY = "dd.sketch.studio.history.v1";
export const HISTORY_LIMIT = 40;
/** Blobs and history entries are dropped after this long. */
export const RETENTION_MS = 6 * 60 * 60 * 1000;

export type HistoryEntry = {
  id: string;
  at: number;
  asset: string;
  subject: string;
  settings: StudioSettings;
  prompt: string;
  model: string;
  seed?: number;
  /** Temp-store id for the winning render, if it was stashed. */
  blobId?: string;
  alpha?: boolean;
  pinned?: boolean;
};

export type HistoryState = { entries: HistoryEntry[] };

export function pruneHistory(
  entries: readonly HistoryEntry[],
  now: number,
  limit = HISTORY_LIMIT,
): HistoryEntry[] {
  const fresh = entries.filter((e) => e.pinned || now - e.at <= RETENTION_MS);
  const sorted = [...fresh].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return b.at - a.at;
  });
  const pinned = sorted.filter((e) => e.pinned);
  const rest = sorted.filter((e) => !e.pinned);
  return [...pinned, ...rest].slice(0, Math.max(limit, pinned.length));
}

export function addHistoryEntry(
  entries: readonly HistoryEntry[],
  entry: HistoryEntry,
  now = entry.at,
): HistoryEntry[] {
  return pruneHistory([entry, ...entries.filter((e) => e.id !== entry.id)], now);
}

export function togglePinned(
  entries: readonly HistoryEntry[],
  id: string,
): HistoryEntry[] {
  return entries.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e));
}

export function discardEntry(
  entries: readonly HistoryEntry[],
  id: string,
): HistoryEntry[] {
  return entries.filter((e) => e.id !== id);
}

/** Guard: metadata only. Throws if someone tries to persist image bytes. */
export function assertNoImageBytes(entry: HistoryEntry): void {
  const json = JSON.stringify(entry);
  if (json.includes("data:image/")) {
    throw new Error("History entries must not contain image data URLs");
  }
  if (json.length > 8000) {
    throw new Error("History entry too large to persist");
  }
}

export function loadHistory(storage: Storage | undefined, now = Date.now()): HistoryEntry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { entries?: HistoryEntry[] };
    return pruneHistory(parsed.entries ?? [], now);
  } catch {
    return [];
  }
}

export function saveHistory(
  storage: Storage | undefined,
  entries: readonly HistoryEntry[],
  now = Date.now(),
): HistoryEntry[] {
  const pruned = pruneHistory(entries, now);
  if (!storage) return pruned;
  for (const entry of pruned) assertNoImageBytes(entry);
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify({ entries: pruned }));
  } catch {
    // Quota or private mode: history is a convenience, never a hard failure.
  }
  return pruned;
}

export function retentionMessage(): string {
  const hours = Math.round(RETENTION_MS / 3_600_000);
  return `Settings history is kept in this browser tab for ${hours} hours; the rendered files are kept in a temporary server folder for the same window and then deleted. Nothing here is published.`;
}
