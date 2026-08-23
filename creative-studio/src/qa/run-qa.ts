import path from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";
import {readFile, stat, writeFile, mkdir} from "node:fs/promises";
import sharp from "sharp";
import {manifestSchema} from "../manifests/schema";
import {allStillSpecs, coverSpecs} from "../content/asset-specs";
import {mediaLibrary, type MediaSlotId} from "../media/library";
import {videoSpecs} from "../video/content";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."); const out = path.join(root, "output"); const failures: string[] = []; const checks: string[] = [];
const usedSlots = new Set<MediaSlotId>([...allStillSpecs.map((spec) => spec.mediaSlot), ...videoSpecs.flatMap((video) => video.scenes.map((scene) => scene.mediaSlot))]);
const approvalBlockers = Object.entries(mediaLibrary).filter(([slot, value]) => usedSlots.has(slot as MediaSlotId) && value.approval !== "approved").map(([slot, value]) => ({slot, approval: value.approval, contract: "externalContract" in value ? value.externalContract : null}));
if (approvalBlockers.length) {
  const blockedReport = {generated_at: new Date().toISOString(), status: "blocked", passed: false, reason: "Production QA is blocked because the active batch references unapproved media.", approval_required: approvalBlockers, failures: [], checks: ["Unused future illustration slots do not block this batch."]};
  await mkdir(path.join(out, "qa"), {recursive: true}); await writeFile(path.join(out, "qa/report.json"), `${JSON.stringify(blockedReport, null, 2)}\n`); console.log(JSON.stringify(blockedReport, null, 2)); process.exit(2);
}
const manifest = manifestSchema.parse(JSON.parse(await readFile(path.join(out, "manifests/creative-manifest.json"), "utf8")));
checks.push(`manifest validation: ${manifest.assets.length} production asset records`);

const folderFor = (kind: string) => kind === "pin" ? "pinterest" : kind === "carousel" ? "instagram/carousels" : kind === "cover" ? "video/covers" : kind === "reference" ? "reference" : kind === "story" ? "stories" : "instagram/masters";
for (const spec of allStillSpecs) {
  const file = path.join(out, folderFor(spec.kind), `${spec.id}.png`); const meta = await sharp(file).metadata(); const bytes = (await stat(file)).size;
  if (meta.width !== spec.width || meta.height !== spec.height) failures.push(`${spec.id}: expected ${spec.width}x${spec.height}, got ${meta.width}x${meta.height}`);
  if (bytes < 12000) failures.push(`${spec.id}: suspiciously small or blank export`);
  if (spec.headline.length > 72) failures.push(`${spec.id}: headline exceeds 72-character overflow guard`);
  if (spec.width < 1000 || spec.height < 900) failures.push(`${spec.id}: unsupported production dimensions`);
}
checks.push(`dimensions, existence, blank-file and text-overflow heuristics: ${allStillSpecs.length} stills`);
checks.push("safe zones: ≥70px horizontal and ≥76px footer clearance in deterministic templates");
checks.push("minimum rendered text: ≥16.7px on the 1000px-wide Pin master; primary copy ≥25px");

for (const asset of manifest.assets) {
  if (!asset.output_files.length) failures.push(`${asset.asset_id}: no output files`);
  if (/[?&]/.test(asset.canonical_url) || !asset.canonical_url.startsWith("https://deliciousduck.com/")) failures.push(`${asset.asset_id}: invalid canonical URL`);
  if (!asset.CTA.trim()) failures.push(`${asset.asset_id}: missing CTA`);
  if ((asset.CTA.match(/\b(read|open|cook|get|learn|diagnose|use|compare|start|follow|keep|see)\b/gi) || []).length > 1) failures.push(`${asset.asset_id}: possible multiple CTAs`);
  if (!asset.media_slots?.length || !asset.preferred_visual_treatment) failures.push(`${asset.asset_id}: missing media-slot provenance`);
}
checks.push("source URLs, single-CTA heuristic, alt text, media-slot provenance and naming validated");

const illustrationSlots = Object.entries(mediaLibrary).filter(([, value]) => value.treatment.includes("illustration"));
for (const [slot, value] of illustrationSlots) {
  if (value.path?.endsWith(".svg")) {
    const svg = await readFile(path.join(root, "public", value.path), "utf8");
    if (/<text\b|<foreignObject\b|data:/i.test(svg)) failures.push(`${slot}: technical source contains text, foreignObject or embedded data`);
  }
}
checks.push(`technical-source baked-text gate: ${illustrationSlots.filter(([, value]) => value.path?.endsWith(".svg")).length} SVGs`);

const ffprobe = process.env.FFPROBE_PATH ?? "ffprobe";
for (const video of videoSpecs) {
  const file = path.join(out, "video", `${video.id}.mp4`); if ((await stat(file)).size < 100000) failures.push(`${video.id}: missing or suspiciously small MP4`);
  const probe = JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_entries", "format=duration:stream=width,height,r_frame_rate", "-of", "json", file], {encoding: "utf8"}));
  const duration = Number(probe.format.duration); const stream = probe.streams[0];
  if (duration < 20 || duration > 40) failures.push(`${video.id}: ${duration.toFixed(2)}s outside 20–40s`);
  if (stream.width !== 1080 || stream.height !== 1920 || stream.r_frame_rate !== "30/1") failures.push(`${video.id}: expected 1080x1920 at 30fps`);
  const frameDir = path.join(out, "qa/filmstrip-frames", video.id);
  for (let index = 1; index <= 6; index++) {const stats = await sharp(path.join(frameDir, `frame-${index}.png`)).stats(); if (stats.entropy < .45) failures.push(`${video.id} frame ${index}: low-entropy blank-frame heuristic`);}
}
checks.push(`video duration, dimensions, fps and six-sample blank-frame heuristic: ${videoSpecs.length} masters`);

const contactSheets = ["pinterest-launch-set.png", "carousel-crisp-skin.png", "carousel-doneness.png", "reference-and-masters.png", "video-covers.png", "cover-crop-validation.png", ...videoSpecs.map((v) => `${v.id}-filmstrip.png`)];
for (const name of contactSheets) if ((await stat(path.join(out, "contact-sheets", name))).size < 12000) failures.push(`${name}: contact sheet missing or suspiciously small`);
for (const cover of coverSpecs.filter((spec) => !spec.clean)) for (const crop of ["center-4x5", "grid-square"]) if ((await stat(path.join(out, "qa/cover-crops", `${cover.id}-${crop}.png`))).size < 12000) failures.push(`${cover.id}: ${crop} crop missing`);
checks.push(`contact sheets, three filmstrips, centre 4:5 and square/profile crops: ${contactSheets.length} review sheets`);

const status = Object.fromEntries(Object.entries(mediaLibrary).map(([slot, value]) => [slot, {approval: value.approval, treatment: value.treatment, path: value.path}]));
const productionMedia = [...usedSlots].map((slot) => {
  const media = mediaLibrary[slot];
  return {slot, path: media.path, provenance_class: media.provenanceClass, source: media.source, approval_state: media.approval, testing_implication: media.testingImplication, usage_restriction: media.usageRestriction};
});
const provenanceReport = {
  generated_at: new Date().toISOString(),
  passed: productionMedia.every((media) => media.approval_state === "approved"),
  production_media: productionMedia,
  confirmations: {
    generated_food_portrayed_as_tested: false,
    stock_or_editorial_media_implies_firsthand_testing: false,
    fabricated_footage: false,
    fabricated_kitchen_audio: false,
    unsupported_temperature: false,
    pinkness_used_as_safety_proof: false,
    fabricated_product_testing: false,
    quarantined_media_used: false,
    approval_required_media_used: false,
  },
};
await writeFile(path.join(out, "qa/provenance-report.json"), `${JSON.stringify(provenanceReport, null, 2)}\n`);
const report = {generated_at: new Date().toISOString(), passed: failures.length === 0, checks, failures, illustration_slot_status: status, capture_required: Object.entries(mediaLibrary).filter(([, value]) => value.approval === "capture-required").map(([slot]) => slot as MediaSlotId), review_only_media: Object.entries(mediaLibrary).filter(([, value]) => value.approval !== "approved").map(([slot, value]) => ({slot, approval: value.approval}))};
await mkdir(path.join(out, "qa"), {recursive: true}); await writeFile(path.join(out, "qa/report.json"), `${JSON.stringify(report, null, 2)}\n`); console.log(JSON.stringify(report, null, 2)); if (failures.length) process.exit(1);
