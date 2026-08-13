/**
 * Client-side helper that turns a generated preview into the three files every
 * sketch ships as (1400x800 JPEG original plus 700w/1400w WebP variants) and
 * writes them over the existing asset through /api/save-sketch.
 *
 * Encoding happens in the browser via canvas so the dev server never needs a
 * native image library.
 */

import { SKETCH_DIMENSIONS } from "@/lib/sketch-style";

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode the generated image"));
    img.src = src;
  });
}

function encode(
  img: HTMLImageElement,
  width: number,
  type: string,
  quality: number,
): Promise<string> {
  const height = Math.round((width / SKETCH_DIMENSIONS.width) * SKETCH_DIMENSIONS.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Letterbox-free fit: scale to cover the target box, centered.
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Encoding failed"));
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("Encoding failed"));
        reader.readAsDataURL(blob);
      },
      type,
      quality,
    );
  });
}

/** Overwrite `src/assets/sketch/<name>.*` with the generated render. */
export async function replaceSketchAsset(name: string, dataUrl: string): Promise<string[]> {
  const img = await loadImage(dataUrl);
  const files = [
    { suffix: ".jpg", base64: await encode(img, SKETCH_DIMENSIONS.width, "image/jpeg", 0.9) },
    { suffix: "-1400.webp", base64: await encode(img, 1400, "image/webp", 0.85) },
    { suffix: "-700.webp", base64: await encode(img, 700, "image/webp", 0.85) },
  ];

  const res = await fetch("/api/save-sketch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, files }),
  });
  if (!res.ok) throw new Error((await res.text()) || "Could not save the image");
  const json = (await res.json()) as { written?: string[] };
  return json.written ?? [];
}
