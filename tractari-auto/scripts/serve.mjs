// Minimal static server for the export, for QA and tests: node scripts/serve.mjs [port] [dir=out]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const port = Number(process.argv[2] || 3300);
const root = path.resolve(import.meta.dirname, "..", process.argv[3] || "out");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".json": "application/json" };
http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!f.startsWith(root)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404, { "content-type": MIME[".html"] }).end(fs.readFileSync(path.join(root, "404.html"))); return; }
  const type = MIME[path.extname(f)] || "application/octet-stream";
  const body = fs.readFileSync(f);
  // gzip like any real host, so Lighthouse measures realistic transfer sizes
  if (/gzip/.test(req.headers["accept-encoding"] || "") && /text|javascript|json|xml|svg/.test(type)) {
    res.writeHead(200, { "content-type": type, "content-encoding": "gzip", vary: "Accept-Encoding" }).end(zlib.gzipSync(body));
  } else res.writeHead(200, { "content-type": type }).end(body);
}).listen(port, () => console.log(`http://localhost:${port}`));
