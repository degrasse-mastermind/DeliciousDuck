import path from "node:path";
import {fileURLToPath} from "node:url";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import sharp from "sharp";
import {mediaLibrary, type MediaSlotId} from "../media/library";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicRoot = path.join(root, "public");
const output = path.join(root, "output/technical-illustrations");

const replacementSlots = [
  "scoringDepthAnatomy",
  "fatFlowPanContact",
  "coldPanMechanism",
  "thermometerReference",
  "carryoverDonenessAnatomy",
] as const satisfies readonly MediaSlotId[];

const blocked = replacementSlots.filter((slot) => {
  const media = mediaLibrary[slot];
  return String(media.approval) !== "approved" || media.path === null;
});

if (blocked.length) {
  throw new Error(
    `Illustration preview blocked: external artwork approval is required for ${blocked.join(", ")}. ` +
    "This command does not draw or substitute production illustrations.",
  );
}

const sources = replacementSlots.map((slot) => [slot, mediaLibrary[slot].path] as const);

await mkdir(output, {recursive: true});
const previews: Buffer[] = [];
for (const [id, relative] of sources) {
  if (relative === null) throw new Error(`${id}: approved source path is missing.`);
  const source = path.join(publicRoot, relative);
  if (path.extname(source).toLowerCase() === ".svg") {
    const svg = await readFile(source, "utf8");
    if (/<text\b|<foreignObject\b|data:/i.test(svg)) throw new Error(`${id}: source contains text, foreignObject or embedded data.`);
  }
  const png = await sharp(source).resize(2400, 3000, {fit: "contain", background: "#FFF9EE"}).png({compressionLevel: 9}).toBuffer();
  await writeFile(path.join(output, `DD-${id}-specimen-2400x3000.png`), png);
  previews.push(await sharp(png).resize(420, 525).png().toBuffer());
}

const probe = await sharp(path.join(publicRoot, "assets/technical-probe-placement-specimen-reference.png"))
  .resize(420, 525, {fit: "contain", background: "#FFF9EE"}).png().toBuffer();
previews.unshift(probe);

const columns = 3;
const cellW = 460;
const cellH = 565;
const gap = 28;
const rows = Math.ceil(previews.length / columns);
await sharp({create: {width: columns * cellW + (columns + 1) * gap, height: rows * cellH + (rows + 1) * gap, channels: 4, background: "#F3E7D3"}})
  .composite(previews.map((input, index) => ({input, left: gap + (index % columns) * (cellW + gap) + 20, top: gap + Math.floor(index / columns) * (cellH + gap) + 20})))
  .png()
  .toFile(path.join(output, "DeliciousDuck-technical-illustration-specimen-sheet.png"));

process.stdout.write(`Rendered ${sources.length} approved external illustration specimens plus the approved probe reference sheet.\n`);
