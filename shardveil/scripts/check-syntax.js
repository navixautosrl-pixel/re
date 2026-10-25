// Parse-check every JavaScript module in the project: `npm run check`
import { readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const roots = ['server', 'shared', 'client/src', 'scripts', 'tests', 'launcher'];
const files = [];
const walk = (dir) => {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    const p = path.join(dir, name);
    if (name === 'node_modules') continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(m?js)$/.test(name)) files.push(p);
  }
};
roots.forEach(walk);
let failed = 0;
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (err) { failed++; console.error(`✗ ${f}\n${err.stderr}`); }
}
console.log(`${files.length - failed}/${files.length} files parse cleanly`);
process.exit(failed ? 1 : 0);
