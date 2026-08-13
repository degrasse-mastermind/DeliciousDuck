/**
 * Promotion rules: turning a session candidate into a real repository asset.
 *
 * Promotion is the only destructive action in the studio, so the rules live in
 * one pure module: which files get written, what the backup is called, what
 * version label comes next, and what the confirmation phrase has to be. The UI
 * and the server route both read these helpers, so neither can drift into
 * silently overwriting art.
 */

export type PromoteMode = "replace" | "add";

export type PromoteTarget = {
  /** Asset basename, e.g. "confit". Registry-safe kebab-case. */
  name: string;
  mode: PromoteMode;
  /** True when the render carries genuine alpha (adds a .png variant). */
  alpha: boolean;
};

export const ASSET_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidAssetName(name: string): boolean {
  return ASSET_NAME_PATTERN.test(name) && name.length <= 48;
}

/** Files a promotion writes, in write order. */
export function promotionFiles(target: PromoteTarget): string[] {
  const files = [`${target.name}.jpg`, `${target.name}-1400.webp`, `${target.name}-700.webp`];
  if (target.alpha) files.push(`${target.name}.png`);
  return files;
}

/** v1, v2, v3… from whatever versions already exist for this asset. */
export function nextVersionLabel(existing: readonly string[]): string {
  let max = 0;
  for (const label of existing) {
    const match = /^v(\d+)$/.exec(label.trim());
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `v${max + 1}`;
}

/** Backup filename for the file being displaced. */
export function backupFilename(file: string, version: string, at: Date): string {
  const stamp = at.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
  const dot = file.lastIndexOf(".");
  const base = dot === -1 ? file : file.slice(0, dot);
  const ext = dot === -1 ? "" : file.slice(dot);
  return `${base}__${version}__${stamp}${ext}`;
}

export type VersionRecord = {
  version: string;
  at: string;
  asset: string;
  mode: PromoteMode;
  files: string[];
  backups: string[];
  prompt: string;
  settings: unknown;
  model: string;
  alpha: boolean;
  note?: string;
};

export function buildVersionRecord(args: {
  target: PromoteTarget;
  version: string;
  at: Date;
  files: string[];
  backups: string[];
  prompt: string;
  settings: unknown;
  model: string;
  note?: string;
}): VersionRecord {
  const record: VersionRecord = {
    version: args.version,
    at: args.at.toISOString(),
    asset: args.target.name,
    mode: args.target.mode,
    files: args.files,
    backups: args.backups,
    prompt: args.prompt,
    settings: args.settings,
    model: args.model,
    alpha: args.target.alpha,
  };
  if (args.note?.trim()) record.note = args.note.trim();
  return record;
}

/** The phrase the editor has to type to confirm a destructive promotion. */
export function confirmationPhrase(target: PromoteTarget): string {
  return target.mode === "replace" ? `replace ${target.name}` : `add ${target.name}`;
}

export function isConfirmed(target: PromoteTarget, typed: string): boolean {
  return typed.trim().toLowerCase() === confirmationPhrase(target);
}

/** Human-readable plan shown in the confirmation dialog. */
export function promotionPlan(target: PromoteTarget, existingFiles: readonly string[]) {
  const files = promotionFiles(target);
  const overwrites = files.filter((f) => existingFiles.includes(f));
  return {
    files,
    overwrites,
    creates: files.filter((f) => !existingFiles.includes(f)),
    destructive: overwrites.length > 0,
    registryUpdateNeeded: target.mode === "add",
  };
}
