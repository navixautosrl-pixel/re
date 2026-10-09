// Serve ./out under a base path, like the real subfolder deployment.
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const [port = 4299, base = ""] = process.argv.slice(2);
const root = path.resolve("out");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".avif": "image/avif", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".txt": "text/plain", ".xml": "application/xml" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (base && !p.startsWith(base)) { res.writeHead(404).end(); return; }
  p = p.slice(base.length) || "/";
  let f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404, { "content-type": MIME[".html"] }).end(fs.readFileSync(path.join(root, "404.html"))); return; }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] ?? "application/octet-stream" }).end(fs.readFileSync(f));
}).listen(Number(port), "127.0.0.1", () => console.log(`serving ${root} at http://127.0.0.1:${port}${base}/`));
