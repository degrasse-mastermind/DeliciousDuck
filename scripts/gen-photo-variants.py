#!/usr/bin/env python3
"""Responsive WebP variants + load-in tones for the photography collection.

The colored-pencil illustrations already ship 700w/1400w WebP through
src/lib/sketch-sources.ts. The photographs did not: a 1536x1024 JPEG was being
painted into a 384px card. This script gives every photo the same treatment.

For each src/assets/*.jpg photo it writes:
  <name>-700.webp   crop-normalised to 4:3, up to 700px wide
  <name>-1400.webp  crop-normalised to 4:3, up to 1400px wide (never upscaled)
and records the real pixel width of each variant plus an average tone per photo
in src/assets/photo-manifest.json, so srcset descriptors stay honest (several
originals are only 1024px wide) and a card can paint a warm placeholder instead
of flashing empty paper.

Run: python3 scripts/gen-photo-variants.py
"""

import json
import pathlib

from PIL import Image, ImageStat

ASSETS = pathlib.Path(__file__).resolve().parent.parent / "src" / "assets"
RATIO = 4 / 3  # one card/hero ratio for the whole collection
WIDTHS = (700, 1400)

manifest: dict[str, dict] = {}

for jpg in sorted(ASSETS.glob("*.jpg")):
    name = jpg.stem
    with Image.open(jpg) as im:
        im = im.convert("RGB")
        w, h = im.size
        # Centre-crop to the shared ratio so mixed 3:2 and 4:3 originals stop
        # losing different parts of the plate to CSS object-cover.
        if w / h > RATIO:
            new_w = round(h * RATIO)
            box = ((w - new_w) // 2, 0, (w - new_w) // 2 + new_w, h)
        else:
            new_h = round(w / RATIO)
            box = (0, (h - new_h) // 2, w, (h - new_h) // 2 + new_h)
        cropped = im.crop(box)

        r, g, b = (round(v) for v in ImageStat.Stat(cropped.resize((16, 12))).mean[:3])
        entry: dict = {"tone": f"#{r:02x}{g:02x}{b:02x}", "variants": {}}

        for width in WIDTHS:
            # Never upscale: a 1024px original keeps its own width in the large
            # slot, and the manifest records that real width for the descriptor.
            target_w = min(width, cropped.width)
            target_h = round(target_w / RATIO)
            if entry["variants"].get(str(WIDTHS[0])) == target_w and width != WIDTHS[0]:
                continue  # large variant would duplicate the small one
            out = cropped.resize((target_w, target_h), Image.LANCZOS)
            dest = ASSETS / f"{name}-{width}.webp"
            out.save(dest, "WEBP", quality=82, method=6)
            entry["variants"][str(width)] = target_w
            print(f"{dest.name}  {out.width}x{out.height}  {dest.stat().st_size // 1024}kB")

        manifest[name] = entry

(ASSETS / "photo-manifest.json").write_text(
    json.dumps(dict(sorted(manifest.items())), indent=2) + "\n"
)
print(f"\nwrote photo-manifest.json ({len(manifest)} photos)")
