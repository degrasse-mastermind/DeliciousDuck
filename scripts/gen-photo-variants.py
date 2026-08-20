#!/usr/bin/env python3
"""Responsive WebP variants + load-in tones for the photography collection.

The colored-pencil illustrations already ship 700w/1400w WebP through
src/lib/sketch-sources.ts. The photographs did not: a 1536x1024 JPEG was being
painted into a 384px card. This script gives every photo the same treatment.

For each src/assets/*.jpg photo it writes:
  <name>-700.webp   crop-normalised to 4:3, 700px wide
  <name>-1400.webp  crop-normalised to 4:3, 1400px wide
and records an average tone per photo in src/assets/photo-tones.json so a card
can paint a warm placeholder instead of flashing empty paper.

Run: python3 scripts/gen-photo-variants.py
"""

import json
import pathlib

from PIL import Image, ImageStat

ASSETS = pathlib.Path(__file__).resolve().parent.parent / "src" / "assets"
RATIO = 4 / 3  # one card/hero ratio for the whole collection
WIDTHS = (700, 1400)

tones: dict[str, str] = {}

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
        tones[name] = f"#{r:02x}{g:02x}{b:02x}"

        for width in WIDTHS:
            if cropped.width < width and width != WIDTHS[0]:
                # Never upscale past the original beyond the small variant.
                continue
            target_w = min(width, cropped.width) if width != WIDTHS[0] else width
            target_h = round(target_w / RATIO)
            out = cropped.resize((target_w, target_h), Image.LANCZOS)
            dest = ASSETS / f"{name}-{width}.webp"
            out.save(dest, "WEBP", quality=82, method=6)
            print(f"{dest.name}  {out.width}x{out.height}  {dest.stat().st_size // 1024}kB")

(ASSETS / "photo-tones.json").write_text(json.dumps(dict(sorted(tones.items())), indent=2) + "\n")
print(f"\nwrote photo-tones.json ({len(tones)} photos)")
