# -*- coding: utf-8 -*-
"""Generează favicon-ul și imaginea Open Graph din aceeași siglă ca site-ul.

Marca e desenată o singură dată, aici, ca să nu ajungă favicon-ul și logo-ul
din pagină să difere după prima modificare. Rulare:

    python3 scripts/generate-brand.py
"""
import os
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONTS = ROOT / "node_modules" / "@fontsource"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

# Aceleași arce și același nucleu ca în src/components/shared/Logo.tsx.
MARK = """
<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="4" y1="30" x2="28" y2="2">
      <stop offset="0%" stop-color="#3b6eff"/>
      <stop offset="55%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <path d="M15.02 11.69 A7 7 0 0 1 15.02 20.31" stroke="url(#g)" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M16.58 6.94 A11.5 11.5 0 0 1 16.58 25.06" stroke="url(#g)" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M16.08 2.52 A15 15 0 0 1 16.08 29.48" stroke="url(#g)" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="9.5" cy="16" r="3.6" fill="url(#g)"/>
</svg>
"""


def font_face(family, weight, path):
    return """@font-face {
      font-family: '%s';
      font-weight: %s;
      font-display: block;
      src: url('file://%s') format('woff2');
    }""" % (family, weight, path)


FONT_CSS = "\n".join([
    font_face("Space Grotesk", 700, FONTS / "space-grotesk/files/space-grotesk-latin-700-normal.woff2"),
    font_face("DM Sans", 400, FONTS / "dm-sans/files/dm-sans-latin-400-normal.woff2"),
])

FAVICON_HTML = """<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:512px;height:512px}
  body{background:#050816;display:flex;align-items:center;justify-content:center}
  /* Colțuri rotunjite: multe platforme afișează favicon-ul pe fundal alb,
     iar un pătrat negru perfect arată ca o gaură în interfață. */
  .plate{width:512px;height:512px;border-radius:112px;background:
    radial-gradient(120%% 120%% at 25%% 15%%, #141c3d 0%%, #050816 62%%);
    display:flex;align-items:center;justify-content:center}
  /* Arcele trag greutatea vizuala spre dreapta, deci marca se aseaza
     putin la stanga de centrul geometric ca sa para centrata. */
  svg{width:352px;height:352px;margin-left:-16px}
</style></head><body><div class="plate">%s</div></body></html>""" % MARK

OG_HTML = """<!doctype html><html lang="ro"><head><meta charset="utf-8"><style>
  %s
  html,body{margin:0;width:1200px;height:630px}
  body{
    background:#050816;
    color:#f4f6ff;
    font-family:'DM Sans',system-ui,sans-serif;
    position:relative;
    overflow:hidden;
  }
  /* Aceeași lumină difuză ca pe fundalul site-ului, ca previzualizarea din
     Facebook/WhatsApp să semene cu pagina în care duce. */
  .glow-a{position:absolute;width:820px;height:820px;left:-180px;top:-320px;border-radius:50%%;
    background:radial-gradient(circle,rgba(59,110,255,.38),transparent 68%%)}
  .glow-b{position:absolute;width:700px;height:700px;right:-160px;bottom:-300px;border-radius:50%%;
    background:radial-gradient(circle,rgba(139,92,246,.34),transparent 68%%)}
  .wrap{position:relative;height:100%%;display:flex;flex-direction:column;justify-content:center;
    padding:0 90px;box-sizing:border-box}
  .row{display:flex;align-items:center;gap:22px}
  svg{width:96px;height:96px}
  .name{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:58px;letter-spacing:-.02em}
  .name em{font-style:normal;background:linear-gradient(135deg,#3b6eff,#8b5cf6);
    -webkit-background-clip:text;background-clip:text;color:transparent}
  h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:76px;line-height:1.04;
    letter-spacing:-.03em;margin:48px 0 0;max-width:15ch}
  p{font-size:28px;line-height:1.45;color:#9aa6c8;margin:26px 0 0;max-width:38ch}
  .foot{position:absolute;left:90px;bottom:56px;font-size:24px;color:#22d3ee;letter-spacing:.02em}
</style></head><body>
  <div class="glow-a"></div><div class="glow-b"></div>
  <div class="wrap">
    <div class="row">%s<span class="name">CreareWebsite<em>Pro</em></span></div>
    <h1>Site-uri care îți cresc afacerea.</h1>
    <p>Creare website, magazine online și optimizare SEO.</p>
    <div class="foot">crearewebsitepro.ro</div>
  </div>
</body></html>""" % (FONT_CSS, MARK)

# Favicon-ul SVG: scalabil, fără fundal, pentru browserele care îl preferă.
SVG_FAVICON = MARK.strip()


def shoot(page, html, path, width, height):
    page.set_viewport_size({"width": width, "height": height})
    tmp = PUBLIC.parent / ".brand-tmp.html"
    tmp.write_text(html, encoding="utf-8")
    page.goto(tmp.as_uri(), wait_until="load")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(600)
    page.screenshot(path=str(path), omit_background=False)
    tmp.unlink(missing_ok=True)
    print("scris", path.relative_to(ROOT))


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
    page = browser.new_page()
    shoot(page, FAVICON_HTML, PUBLIC / "favicon.png", 512, 512)
    shoot(page, OG_HTML, PUBLIC / "og.png", 1200, 630)
    browser.close()

(PUBLIC / "favicon.svg").write_text(SVG_FAVICON + "\n", encoding="utf-8")
print("scris public/favicon.svg")
