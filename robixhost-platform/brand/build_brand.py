#!/usr/bin/env python3
"""
RobixHost brand asset generator.

Produces every SVG from code (single source of truth) and converts the wordmark text to real vector outlines
using Inter (SIL Open Font License 1.1), so the logo files do not depend on any installed font.

    python3 brand/build_brand.py            # writes brand/svg/*.svg
    node brand/render_png.js                # writes brand/png/*.png, brand/ico/*.ico, brand/favicon/*

The symbol: a geometric "R" drawn as a single connected stroke, ending in a network node.
Stem = the host, bowl = the virtualised workload on it, leg = the uplink ending at a node.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "svg"
OUT.mkdir(parents=True, exist_ok=True)
FONT_DIR = Path("/usr/share/fonts/opentype/inter")

# ---------- palette (kept in sync with desktop/RobixHost.ControlCenter/Themes/Tokens.xaml) ----------
NAVY_950 = "#060B1A"
NAVY_900 = "#0A1128"
NAVY_800 = "#101B3D"
BLUE = "#2F6BFF"        # electric blue
CYAN = "#22D3EE"        # cyan accent
WHITE = "#F4F7FC"
INK = "#0B1533"         # text on light backgrounds
GRAY = "#9AA7C2"


def defs(prefix: str, stroke_dir=("0", "0", "1", "1")) -> str:
    x1, y1, x2, y2 = stroke_dir
    return f"""<defs>
  <linearGradient id="{prefix}-g" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">
    <stop offset="0" stop-color="{CYAN}"/><stop offset="1" stop-color="{BLUE}"/>
  </linearGradient>
  <linearGradient id="{prefix}-tile" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{NAVY_800}"/><stop offset="1" stop-color="{NAVY_950}"/>
  </linearGradient>
</defs>"""


# ---------- the symbol, on a 256x256 grid ----------
def r_mark(stroke: str, node_fill: str, node_ring: str, width: int = 28) -> str:
    """The 'R'. One stroke: stem, bowl, leg. Round joins keep it legible at 16px."""
    return f"""<g fill="none" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M94 192V64H150a32 32 0 0 1 0 64H94"/>
    <path d="M140 128 L176 190"/>
  </g>
  <circle cx="182" cy="198" r="19" fill="{node_fill}" stroke="{node_ring}" stroke-width="{max(width - 14, 8)}"/>"""


def symbol_svg(*, tile: bool, mode: str = "color") -> str:
    """mode: color | white | ink  (white/ink are the monochrome versions)"""
    if mode == "color":
        stroke, node_fill, ring = "url(#s-g)", WHITE, "url(#s-g)"
    elif mode == "white":
        stroke, node_fill, ring = WHITE, "none", WHITE
    else:
        stroke, node_fill, ring = INK, "none", INK
    bg = ""
    if tile:
        edge = f'<rect x="8" y="8" width="240" height="240" rx="60" fill="none" stroke="{BLUE}" stroke-opacity=".35" stroke-width="2"/>'
        bg = f'<rect x="8" y="8" width="240" height="240" rx="60" fill="url(#s-tile)"/>{edge}'
    body = f'{bg}\n  {r_mark(stroke, node_fill, ring)}'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="RobixHost">\n'
            f'  {defs("s")}\n  {body}\n</svg>\n')


# ---------- wordmark as outlines ----------
class Face:
    def __init__(self, file: str):
        self.font = TTFont(FONT_DIR / file)
        self.gs = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()
        self.upm = self.font["head"].unitsPerEm
        self.hmtx = self.font["hmtx"]

    def path(self, text: str, size: float, x0: float, baseline: float, tracking: float = 0.0):
        """Return (svg path d, end x). tracking in em."""
        scale = size / self.upm
        x = x0
        d = []
        for ch in text:
            gn = self.cmap[ord(ch)]
            pen = SVGPathPen(self.gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
            self.gs[gn].draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
            d.append(pen.getCommands())
            x += self.hmtx[gn][0] * scale + tracking * size
        return " ".join(d), x


BOLD = Face("Inter-Bold.otf")
LIGHT = Face("Inter-Regular.otf")


def wordmark_paths(size: float, x0: float, baseline: float, c1: str, c2: str):
    d1, xe = BOLD.path("Robix", size, x0, baseline, tracking=-0.015)
    d2, xe2 = LIGHT.path("Host", size, xe + size * 0.01, baseline, tracking=-0.01)
    return f'<path d="{d1}" fill="{c1}"/><path d="{d2}" fill="{c2}"/>', xe2


def horizontal_svg(theme: str, mono: bool = False) -> str:
    """Compact horizontal logo: symbol (no tile) + wordmark."""
    dark = theme == "dark"
    if mono:
        stroke, nf, ring = (WHITE, "none", WHITE) if dark else (INK, "none", INK)
        c1 = c2 = WHITE if dark else INK
    else:
        stroke, nf, ring = "url(#h-g)", (WHITE if dark else "#FFFFFF"), "url(#h-g)"
        c1, c2 = (WHITE, CYAN) if dark else (INK, BLUE)
    size = 120
    mark = f'<g transform="translate(0,0) scale(0.9375)">{r_mark(stroke, nf, ring)}</g>'   # 256*0.9375 = 240
    wm, end = wordmark_paths(size, 250, 168, c1, c2)
    w = int(end + 8)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} 240" role="img" aria-label="RobixHost">\n'
            f'  {defs("h")}\n  {mark}\n  {wm}\n</svg>\n')


def primary_svg(theme: str) -> str:
    """Primary (stacked) logo: tile symbol above the wordmark. Canvas width follows the wordmark (no clipping)."""
    dark = theme == "dark"
    c1, c2 = (WHITE, CYAN) if dark else (INK, BLUE)
    _, width = wordmark_paths(104, 0, 0, c1, c2)
    W, H = int(width + 96), 470
    ox = (W - width) / 2
    wm, _ = wordmark_paths(104, ox, 410, c1, c2)
    bgrect = f'<rect width="{W}" height="{H}" fill="{NAVY_950}"/>' if dark else f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>'
    sym_inner = symbol_svg(tile=True).split("</defs>")[1].replace("</svg>", "").strip()
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="RobixHost">\n'
            f'  {defs("s")}\n  {bgrect}\n  <g transform="translate({(W-256)/2},40)">{sym_inner}</g>\n  {wm}\n</svg>\n')


def mono_primary_svg() -> str:
    c = INK
    _, width = wordmark_paths(104, 0, 0, c, c)
    W, H = int(width + 96), 470
    wm, _ = wordmark_paths(104, (W - width) / 2, 410, c, c)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="RobixHost">\n'
            f'  <rect width="{W}" height="{H}" fill="#FFFFFF"/>\n'
            f'  <g transform="translate({(W-256)/2},40)">{r_mark(c, "none", c)}</g>\n  {wm}\n</svg>\n')


def app_icon_svg() -> str:
    """Square app icon; full-bleed rounded tile with a little glow, tuned for 16..1024px."""
    glow = f"""<radialGradient id="a-glow" cx=".72" cy=".78" r=".6">
    <stop offset="0" stop-color="{CYAN}" stop-opacity=".28"/><stop offset="1" stop-color="{CYAN}" stop-opacity="0"/>
  </radialGradient>"""
    inner = symbol_svg(tile=True).split("</defs>")[1].replace("</svg>", "").strip()
    inner = inner.replace('</g>', '</g>', 1)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="RobixHost">\n'
            f'  {defs("s")}<defs>{glow}</defs>\n'
            f'  <rect x="8" y="8" width="240" height="240" rx="60" fill="url(#s-tile)"/>\n'
            f'  <rect x="8" y="8" width="240" height="240" rx="60" fill="url(#a-glow)"/>\n'
            f'  <rect x="8" y="8" width="240" height="240" rx="60" fill="none" stroke="{BLUE}" stroke-opacity=".4" stroke-width="2"/>\n'
            f'  {r_mark("url(#s-g)", WHITE, "url(#s-g)")}\n</svg>\n')


def favicon_svg() -> str:
    """Favicon: heavier stroke, no ring detail, so it survives 16x16."""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">\n  {defs("f")}\n'
            f'  <rect x="4" y="4" width="248" height="248" rx="56" fill="{NAVY_900}"/>\n'
            f'  <g fill="none" stroke="url(#f-g)" stroke-width="40" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M92 196V62H150a34 34 0 0 1 0 68H92"/><path d="M142 130 L184 196"/></g>\n</svg>\n')


# ---------- empty-state illustrations (simple, on-brand, 320x200) ----------
def empty_state(kind: str) -> str:
    stroke = "#2A3A6B"
    base = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" role="img" aria-label="{kind}">
  {defs("e")}
  <ellipse cx="160" cy="176" rx="104" ry="10" fill="{NAVY_800}"/>"""
    if kind == "no-vms":     # a server rack with empty slots
        body = "".join(
            f'<rect x="92" y="{34 + i*36}" width="136" height="28" rx="8" fill="{NAVY_900}" stroke="{stroke}" stroke-width="2"/>'
            f'<circle cx="{108}" cy="{48 + i*36}" r="4" fill="{"url(#e-g)" if i == 0 else stroke}"/>'
            f'<rect x="124" y="{44 + i*36}" width="{70 if i == 0 else 48}" height="8" rx="4" fill="{stroke}"/>'
            for i in range(4))
    elif kind == "no-networks":   # nodes with dashed links
        body = (f'<g stroke="{stroke}" stroke-width="2" stroke-dasharray="6 6" fill="none">'
                f'<path d="M96 100 L160 56 L224 100 M96 100 L160 148 L224 100 M160 56 V148"/></g>'
                + "".join(f'<circle cx="{x}" cy="{y}" r="14" fill="{NAVY_900}" stroke="url(#e-g)" stroke-width="3"/>'
                          for x, y in [(96, 100), (160, 56), (224, 100), (160, 148)]))
    elif kind == "no-backups":    # a cylinder (storage) with a clock hand
        body = (f'<path d="M104 70 v62 c0 14 25 24 56 24 s56-10 56-24 V70" fill="{NAVY_900}" stroke="{stroke}" stroke-width="2"/>'
                f'<ellipse cx="160" cy="70" rx="56" ry="20" fill="{NAVY_800}" stroke="url(#e-g)" stroke-width="3"/>'
                f'<path d="M160 100 v22 l14 8" fill="none" stroke="url(#e-g)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>')
    else:                          # no-alerts: a shield with a check
        body = (f'<path d="M160 36 L216 56 V104 c0 34-24 52-56 64 c-32-12-56-30-56-64 V56 Z" fill="{NAVY_900}" stroke="url(#e-g)" stroke-width="3"/>'
                f'<path d="M136 104 l18 18 l32-36" fill="none" stroke="url(#e-g)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>')
    return base + body + "\n</svg>\n"


# ---------- interface icon set (24px grid, 1.75 stroke, currentColor) ----------
ICONS = {
    "dashboard": '<rect x="3" y="3" width="8" height="10" rx="2"/><rect x="13" y="3" width="8" height="6" rx="2"/><rect x="13" y="11" width="8" height="10" rx="2"/><rect x="3" y="15" width="8" height="6" rx="2"/>',
    "vm": '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "customers": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.900 1.900 6.500 5.500"/><path d="M16 4.800a3.500 3.500 0 0 1 0 6.400M18 14.800c2 .6 3.200 2.300 3.500 5.200"/>',
    "plans": '<path d="M4 7l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4"/>',
    "os": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    "template": '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    "storage": '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.700 3.600 3 8 3s8-1.300 8-3V6M4 12c0 1.700 3.600 3 8 3s8-1.300 8-3"/>',
    "network": '<circle cx="12" cy="5" r="2.500"/><circle cx="5" cy="19" r="2.500"/><circle cx="19" cy="19" r="2.500"/><path d="M12 7.500v4M12 11.500l-6 5.500M12 11.500l6 5.500"/>',
    "ip": '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 11v2M11 11v2M15 11h2"/>',
    "server": '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.500h.01M7 17.500h.01"/>',
    "backup": '<path d="M3 12a9 9 0 1 0 3-6.700L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    "monitoring": '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    "automation": '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.900 4.900l2.100 2.100M17 17l2.100 2.100M19.100 4.900L17 7M7 17l-2.100 2.100"/>',
    "whmcs": '<path d="M4 7h16M4 12h16M4 17h10"/><circle cx="18" cy="17" r="2"/>',
    "security": '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    "audit": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 0 0 .3 1.800l.1.100a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-1.800-.3 1.700 1.700 0 0 0-1 1.500V21a2 2 0 1 1-4 0v-.1a1.700 1.700 0 0 0-1.100-1.500 1.700 1.700 0 0 0-1.800.3l-.1.1a2 2 0 1 1-2.800-2.800l.1-.1a1.700 1.700 0 0 0 .3-1.800 1.700 1.700 0 0 0-1.500-1H3a2 2 0 1 1 0-4h.1a1.700 1.700 0 0 0 1.500-1.100 1.700 1.700 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.100a1.700 1.700 0 0 0 1.800.3H9a1.700 1.700 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.700 1.700 0 0 0 1 1.500 1.700 1.700 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.100a1.700 1.700 0 0 0-.3 1.800V9a1.700 1.700 0 0 0 1.500 1H21a2 2 0 1 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1z"/>',
    "diagnostics": '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
}


def icon_svg(body: str) -> str:
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>\n')


def main():
    files = {
        "symbol.svg": symbol_svg(tile=False),
        "symbol-tile.svg": symbol_svg(tile=True),
        "symbol-mono-white.svg": symbol_svg(tile=False, mode="white"),
        "symbol-mono-ink.svg": symbol_svg(tile=False, mode="ink"),
        "logo-primary-dark.svg": primary_svg("dark"),
        "logo-primary-light.svg": primary_svg("light"),
        "logo-primary-mono.svg": mono_primary_svg(),
        "logo-horizontal-dark.svg": horizontal_svg("dark"),
        "logo-horizontal-light.svg": horizontal_svg("light"),
        "logo-horizontal-mono-white.svg": horizontal_svg("dark", mono=True),
        "logo-horizontal-mono-ink.svg": horizontal_svg("light", mono=True),
        "app-icon.svg": app_icon_svg(),
        "favicon.svg": favicon_svg(),
    }
    for kind in ("no-vms", "no-networks", "no-backups", "no-alerts"):
        files[f"empty-{kind}.svg"] = empty_state(kind)
    for name, body in ICONS.items():
        files[f"icons/{name}.svg"] = icon_svg(body)
    for rel, content in files.items():
        p = OUT / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
    print(f"wrote {len(files)} SVG files to {OUT}")


if __name__ == "__main__":
    main()
