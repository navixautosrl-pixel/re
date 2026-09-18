"""Regenerate the portfolio preview images from the live demo pages.

The portfolio tiles show real screenshots of the demos rather than abstract
colour fields, so they have to be regenerated whenever a demo's design
changes. Run it against a served production build:

    npm run build
    python3 -m http.server 4173 --directory out &
    python3 scripts/generate-previews.py

Writes public/previews/<slug>.webp — commit the results.
"""

import io
import pathlib
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4173"
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "previews"

# Shot at 2x then downscaled, so the result stays crisp on retina panels
# without shipping a 2x-sized file.
SHOT = {"width": 1280, "height": 800}
SCALE = 2
QUALITY = 78

# The portfolio grid alternates wide (col-span-7) and narrow (col-span-5)
# tiles. Cropping to each tile's own aspect here means CSS object-cover has
# almost nothing left to crop — otherwise the narrow tiles lopped the left
# off left-aligned hero headlines. Narrow crops keep the left of the shot,
# which is where those demos put their content.
LAYOUT = {
    "restaurant": {"aspect": 1.53, "anchor": "center", "out": (1150, 752)},
    "fitness": {"aspect": 1.08, "anchor": "left", "out": (880, 815)},
    "shop": {"aspect": 1.08, "anchor": "left", "out": (880, 815)},
    "agency": {"aspect": 1.53, "anchor": "left", "out": (1150, 752)},
}

DEMOS = list(LAYOUT)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
        ctx = browser.new_context(viewport=SHOT, device_scale_factor=SCALE)
        page = ctx.new_page()

        for slug in DEMOS:
            page.goto(f"{BASE}/demo/{slug}/", wait_until="networkidle")
            # let entrance animations settle so nothing is caught mid-reveal
            page.wait_for_timeout(2600)
            # the floating "Demo Pulsar Studio" badge belongs to the parent
            # site, not the demo — it would look like part of the design
            page.evaluate(
                "() => document.querySelectorAll('a[href*=\"#portofoliu\"]').forEach(el => el.remove())"
            )
            page.wait_for_timeout(120)
            raw = page.screenshot(type="png")

            img = Image.open(io.BytesIO(raw)).convert("RGB")

            cfg = LAYOUT[slug]
            w, h = img.size
            target_w = min(w, int(h * cfg["aspect"]))
            left = 0 if cfg["anchor"] == "left" else (w - target_w) // 2
            img = img.crop((left, 0, left + target_w, h))
            img = img.resize(cfg["out"], Image.LANCZOS)
            dest = OUT / f"{slug}.webp"
            img.save(dest, "WEBP", quality=QUALITY, method=6)
            print(f"{dest.relative_to(OUT.parent.parent)}  {dest.stat().st_size // 1024} kB")

        browser.close()


main()
