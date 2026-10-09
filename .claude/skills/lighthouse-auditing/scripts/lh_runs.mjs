#!/usr/bin/env node
// Run Lighthouse N times per form factor and report medians honestly.
// - sets CHROME_PATH (Lighthouse 13 ignores --chrome-path)
// - reports simulated (Lantern) metrics AND observed timings, flagging when they diverge
// - lists failing audits from the median run
//
// Usage: node lh_runs.mjs <url> [--runs 3] [--form mobile,desktop] [--devtools] [--out dir]
// --devtools uses real applied throttling (--throttling-method=devtools) instead of simulation.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const url = argv.find((a) => /^https?:\/\//.test(a));
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
if (!url) { console.error("Usage: lh_runs.mjs <url> [--runs 3] [--form mobile,desktop] [--devtools] [--out dir]"); process.exit(2); }
const runs = Number(opt("runs", 3));
const forms = opt("form", "mobile,desktop").split(",");
const devtools = argv.includes("--devtools");
const out = path.resolve(opt("out", "lighthouse"));
fs.mkdirSync(out, { recursive: true });
const env = { ...process.env, CHROME_PATH: process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" };

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor((s.length - 1) / 2)]; };
const summary = [];

for (const form of forms) {
  const results = [];
  for (let i = 1; i <= runs; i++) {
    const file = path.join(out, `lh-${form}${devtools ? "-devtools" : ""}-${i}.json`);
    const args = ["--yes", "lighthouse@13", url, "--output=json", `--output-path=${file}`, "--quiet",
      '--chrome-flags=--headless=new --no-sandbox', ...(form === "desktop" ? ["--preset=desktop"] : []),
      ...(devtools ? ["--throttling-method=devtools"] : [])];
    const r = spawnSync("npx", args, { env, encoding: "utf8", timeout: 240000 });
    if (r.status !== 0 || !fs.existsSync(file)) { console.error(`run ${form} #${i} failed:\n${(r.stderr || "").split("\n").slice(-5).join("\n")}`); continue; }
    const j = JSON.parse(fs.readFileSync(file, "utf8"));
    const a = j.audits, m = a.metrics?.details?.items?.[0] ?? {};
    results.push({
      file,
      scores: Object.fromEntries(Object.entries(j.categories).map(([k, v]) => [k, Math.round(v.score * 100)])),
      lcp: a["largest-contentful-paint"].numericValue, fcp: a["first-contentful-paint"].numericValue,
      cls: a["cumulative-layout-shift"].numericValue, tbt: a["total-blocking-time"].numericValue,
      obsLcp: m.observedLargestContentfulPaint, obsFcp: m.observedFirstContentfulPaint,
      failing: Object.entries(a).filter(([, v]) => v.score !== null && v.score < 0.9 && ["binary", "numeric", "metricSavings"].includes(v.scoreDisplayMode))
        .map(([k, v]) => `${k}${v.displayValue ? ` (${v.displayValue})` : ""}`),
    });
  }
  if (!results.length) continue;
  const med = (k) => median(results.map((r) => r[k]));
  const perfs = results.map((r) => r.scores.performance);
  const mid = results.find((r) => r.scores.performance === median(perfs)) ?? results[0];
  const row = {
    form, runs: results.length, mode: devtools ? "devtools throttling" : "simulated (Lantern)",
    performance: `${median(perfs)} (range ${Math.min(...perfs)}–${Math.max(...perfs)})`,
    accessibility: mid.scores.accessibility, "best-practices": mid.scores["best-practices"], seo: mid.scores.seo,
    LCP_s: (med("lcp") / 1000).toFixed(2), CLS: med("cls").toFixed(3), TBT_ms: Math.round(med("tbt")), FCP_s: (med("fcp") / 1000).toFixed(2),
    observedLCP_ms: Math.round(med("obsLcp")), failing: mid.failing,
  };
  if (!devtools && row.observedLCP_ms && med("lcp") > 2 * Math.max(med("obsLcp"), 1) && med("lcp") - med("obsLcp") > 1000)
    row.note = "Simulated LCP far above observed LCP — re-run with --devtools and report both (common against fast local servers).";
  summary.push(row);
}

fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify(summary, null, 2));
for (const r of summary) {
  console.log(`\n## ${r.form} — ${r.runs} runs, ${r.mode}`);
  console.log(`Performance ${r.performance} | A11y ${r.accessibility} | BP ${r["best-practices"]} | SEO ${r.seo}`);
  console.log(`LCP ${r.LCP_s}s (observed ${r.observedLCP_ms}ms) | CLS ${r.CLS} | TBT ${r.TBT_ms}ms | FCP ${r.FCP_s}s`);
  if (r.note) console.log(`NOTE: ${r.note}`);
  console.log(`Failing audits (median run): ${r.failing.join(", ") || "none"}`);
}
console.log(`\nJSON reports + summary.json → ${out}\nLab data only — not field/real-user performance.`);
