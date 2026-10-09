#!/usr/bin/env node
// Generate responsive AVIF + WebP (+ optional JPEG fallback) variants with sharp and print
// ready-to-paste <picture> markup with width/height. Never upscales; strips metadata.
//
// Usage:
//   node optimize_images.mjs <input file or dir> --out public/img [--widths 480,960,1440,1920]
//        [--avif-q 50] [--webp-q 72] [--jpeg] [--sizes "(min-width: 900px) 50vw, 100vw"]
// Needs `sharp` installed in the project (npm i -D sharp) — resolved from cwd.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const input = argv.find((a, i) => !a.startsWith("--") && !(argv[i - 1] || "").startsWith("--"));
if (!input) { console.error("Usage: optimize_images.mjs <file|dir> --out <dir> [--widths 480,960,1440] [--jpeg]"); process.exit(2); }
let sharp;
try { sharp = createRequire(path.join(process.cwd(), "x.js"))("sharp"); }
catch { console.error("sharp not found in this project — run: npm i -D sharp"); process.exit(2); }

const out = path.resolve(opt("out", "optimized"));
const widths = opt("widths", "480,960,1440,1920").split(",").map(Number).sort((a, b) => a - b);
const avifQ = Number(opt("avif-q", 50)), webpQ = Number(opt("webp-q", 72));
const jpeg = argv.includes("--jpeg");
const sizes = opt("sizes", "100vw");
const publicPrefix = opt("public-prefix", "/" + path.relative(path.resolve("public"), out).split(path.sep).join("/"));
fs.mkdirSync(out, { recursive: true });

const files = fs.statSync(input).isDirectory()
  ? fs.readdirSync(input).filter((f) => /\.(jpe?g|png|webp|tiff?|avif)$/i.test(f)).map((f) => path.join(input, f))
  : [input];

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
let before = 0, after = 0;
for (const file of files) {
  const base = path.basename(file).replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const meta = await sharp(file).metadata();
  const srcBytes = fs.statSync(file).size; before += srcBytes;
  const use = widths.filter((w) => w <= meta.width);
  if (!use.length || use.at(-1) < meta.width && meta.width < widths.at(-1)) use.push(meta.width); // keep native max if between steps
  const made = { avif: [], webp: [], jpg: [] };
  for (const w of [...new Set(use)]) {
    const pipeline = () => sharp(file).rotate().resize({ width: w, withoutEnlargement: true });
    const targets = [["avif", (p) => p.avif({ quality: avifQ, effort: 5 })], ["webp", (p) => p.webp({ quality: webpQ, effort: 5 })]];
    if (jpeg) targets.push(["jpg", (p) => p.jpeg({ quality: 78, mozjpeg: true, progressive: true })]);
    for (const [ext, enc] of targets) {
      const dest = path.join(out, `${base}-${w}.${ext}`);
      const info = await enc(pipeline()).toFile(dest);
      after += info.size; made[ext].push({ w, size: info.size, h: info.height });
    }
  }
  const largest = made.webp.at(-1);
  const ratioH = Math.round((largest.h / largest.w) * 1000) / 1000;
  const srcset = (ext) => made[ext].map((v) => `${publicPrefix}/${base}-${v.w}.${ext} ${v.w}w`).join(", ");
  const fallbackExt = jpeg ? "jpg" : "webp";
  const fb = made[fallbackExt].at(-1);
  console.log(`\n${path.basename(file)} ${meta.width}×${meta.height} ${kb(srcBytes)} → ` +
    Object.entries(made).filter(([, v]) => v.length).map(([ext, v]) => `${ext}: ${v.map((x) => `${x.w}w ${kb(x.size)}`).join(", ")}`).join(" | "));
  console.log(`<picture>
  <source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}">
  ${jpeg ? `<source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">\n  ` : ""}<img src="${publicPrefix}/${base}-${fb.w}.${fallbackExt}" srcset="${srcset(fallbackExt)}" sizes="${sizes}"
       width="${fb.w}" height="${Math.round(fb.w * ratioH)}" alt="TODO: describe the image" loading="lazy" decoding="async">
</picture>`);
}
console.log(`\n${files.length} image(s): ${kb(before)} source → ${kb(after)} total across all variants (a browser downloads one).`);
console.log('Set alt text, and on the LCP image use loading="eager" fetchpriority="high" instead of lazy.');
