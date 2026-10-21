// Renders brand SVGs to PNG at multiple resolutions and assembles the Windows .ico and favicon set.
// Usage: node brand/render_png.js        (requires `sharp`; ICO assembly uses ImageMagick `convert`)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = __dirname;
const svg = (n) => path.join(root, 'svg', n);
const out = (...p) => { const f = path.join(root, ...p); fs.mkdirSync(path.dirname(f), { recursive: true }); return f; };

async function png(src, dest, width, height) {
  await sharp(src, { density: 384 }).resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(dest);
}

(async () => {
  const sizes = [16, 24, 32, 48, 64, 96, 128, 180, 256, 512, 1024];
  for (const s of sizes) {
    await png(svg('app-icon.svg'), out('png', `app-icon-${s}.png`), s, s);
    await png(svg('symbol.svg'), out('png', `symbol-${s}.png`), s, s);
  }
  for (const s of [16, 32, 48, 180, 192, 512]) await png(svg('favicon.svg'), out('favicon', `favicon-${s}.png`), s, s);
  for (const v of ['dark', 'light', 'mono']) {
    const m = await sharp(svg(`logo-primary-${v}.svg`)).metadata();
    for (const w of [280, 560, 1120]) await png(svg(`logo-primary-${v}.svg`), out('png', `logo-primary-${v}-${w}w.png`), w, Math.round(w * m.height / m.width));
  }
  for (const v of ['dark', 'light', 'mono-white', 'mono-ink']) {
    const meta = await sharp(svg(`logo-horizontal-${v}.svg`)).metadata();
    for (const h of [48, 96, 192]) await png(svg(`logo-horizontal-${v}.svg`), out('png', `logo-horizontal-${v}-${h}h.png`), Math.round(h * meta.width / meta.height), h);
  }
  // Windows .ico: 16,24,32,48,64,128,256 (PNG-compressed 256 entry, as Windows Vista+ expects)
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  // <=32px entries use the heavier-stroke favicon glyph: the detailed app icon loses its node ring at 16px.
  for (const s of [16, 24, 32]) await png(svg('favicon.svg'), out('png', `icon-small-${s}.png`), s, s);
  const icoInputs = icoSizes.map((s) => out('png', s <= 32 ? `icon-small-${s}.png` : `app-icon-${s}.png`));
  fs.mkdirSync(path.join(root, 'ico'), { recursive: true });
  execFileSync('convert', [...icoInputs, path.join(root, 'ico', 'RobixHost.ico')]);
  execFileSync('convert', [out('favicon', 'favicon-16.png'), out('favicon', 'favicon-32.png'), out('favicon', 'favicon-48.png'), path.join(root, 'favicon', 'favicon.ico')]);
  // Installer branding (Inno Setup wizard images: BMP, 164x314 side panel + 55x58 small)
  const bg = '#060B1A';
  const side = await sharp({ create: { width: 164, height: 314, channels: 4, background: bg } })
    .composite([{ input: await sharp(svg('app-icon.svg'), { density: 384 }).resize(112, 112).png().toBuffer(), left: 26, top: 30 }]).png().toBuffer();
  const sidePath = out('installer', 'wizard-side.png'); fs.writeFileSync(sidePath, side);
  execFileSync('convert', [sidePath, '-background', bg, '-alpha', 'remove', 'BMP3:' + path.join(root, 'installer', 'wizard-side.bmp')]);
  const smallPath = out('installer', 'wizard-small.png'); await png(svg('app-icon.svg'), smallPath, 55, 55);
  execFileSync('convert', [smallPath, '-background', bg, '-alpha', 'remove', 'BMP3:' + path.join(root, 'installer', 'wizard-small.bmp')]);
  console.log('PNG, ICO, favicon and installer images written under', root);
})().catch((e) => { console.error(e); process.exit(1); });
