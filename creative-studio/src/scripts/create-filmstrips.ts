import path from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";
import {mkdir} from "node:fs/promises";
import sharp from "sharp";
import {videoSpecs} from "../video/content";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ffmpeg = process.env.FFMPEG_PATH ?? "ffmpeg";
const framesRoot = path.join(root, "output/qa/filmstrip-frames");
const sheets = path.join(root, "output/contact-sheets");
await mkdir(framesRoot, {recursive: true}); await mkdir(sheets, {recursive: true});

for (const video of videoSpecs) {
  const frameDir = path.join(framesRoot, video.id); await mkdir(frameDir, {recursive: true});
  const input = path.join(root, "output/video", `${video.id}.mp4`);
  const duration = video.durationInFrames / 30;
  const timestamps = Array.from({length: 6}, (_, index) => duration * (.07 + index * .172));
  const frames: Buffer[] = [];
  for (let index = 0; index < timestamps.length; index++) {
    const target = path.join(frameDir, `frame-${index + 1}.png`);
    execFileSync(ffmpeg, ["-y", "-ss", timestamps[index]!.toFixed(3), "-i", input, "-frames:v", "1", "-vf", "scale=270:480", target], {stdio: "ignore"});
    frames.push(await sharp(target).png().toBuffer());
  }
  await sharp({create: {width: 6 * 270 + 7 * 20, height: 520, channels: 4, background: "#F3E7D3"}})
    .composite(frames.map((input, index) => ({input, left: 20 + index * 290, top: 20})))
    .png().toFile(path.join(sheets, `${video.id}-filmstrip.png`));
}
process.stdout.write(`Created ${videoSpecs.length} six-frame filmstrips.\n`);
