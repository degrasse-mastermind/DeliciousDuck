import path from "node:path";
import {fileURLToPath} from "node:url";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {execFileSync} from "node:child_process";

const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const repoRoot = path.resolve(studioRoot, "..");
const snapshotPath = path.join(studioRoot, "src/content/source-snapshot.json");
const reportPath = path.join(studioRoot, "output/qa/source-refresh-report.json");
const update = process.argv.includes("--update");

const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const sourceRevision = execFileSync("git", ["rev-parse", "HEAD"], {cwd: repoRoot, encoding: "utf8"}).trim();
const canonicalInputs = ["src/lib/distribution-metadata.ts", "src/data/guides.ts", "src/data/recipes.ts", "src/lib/sketch-art.ts"];
const changedInputs = execFileSync("git", ["diff", "--name-only", snapshot.source_commit, "--", ...canonicalInputs], {cwd: repoRoot, encoding: "utf8"})
  .split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
const drift = changedInputs.length > 0;

if (update) {
  snapshot.captured_at = new Date().toISOString();
  snapshot.source_commit = sourceRevision;
  snapshot.source_registry = "src/lib/distribution-metadata.ts";
  if (drift) throw new Error(`Source metadata changed in ${changedInputs.join(", ")}; refresh the frozen values deliberately before updating the revision.`);
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
}

const report = {
  checked_at: new Date().toISOString(),
  source_registry: "src/lib/distribution-metadata.ts",
  source_revision: sourceRevision,
  frozen_revision_before_check: snapshot.source_commit,
  drift_detected: drift,
  snapshot_updated: update,
  entries_checked: (snapshot.distribution_metadata ?? []).length,
  canonical_inputs: canonicalInputs,
  changed_inputs: changedInputs,
  ordinary_render_mutates_snapshot: false,
  note: drift ? (update ? "Canonical distribution metadata was explicitly refreshed." : "Run bun run source:refresh to accept current canonical metadata.") : "Frozen snapshot matches current canonical distribution metadata.",
};
await mkdir(path.dirname(reportPath), {recursive: true});
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (drift && !update) process.exitCode = 2;
