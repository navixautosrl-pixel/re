// HTTP: the JSON account/character API and static hosting of the game client.
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './config.js';
import { createRateLimiter } from './auth.js';
import * as repo from './repo/characters.js';
import { PROTOCOL_VERSION } from '../shared/protocol.js';
import { log } from './log.js';

const STATIC_ROOTS = [
  { prefix: '/shared/', dir: path.join(ROOT, 'shared') },
  { prefix: '/vendor/three/', dir: path.join(ROOT, 'node_modules', 'three', 'build') },
  { prefix: '/vendor/fonts/', dir: path.join(ROOT, 'node_modules', '@fontsource') },
  { prefix: '/', dir: path.join(ROOT, 'client') },
];

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
  '.ogg': 'audio/ogg', '.wav': 'audio/wav',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self' ws: wss:; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...SECURITY_HEADERS });
  res.end(JSON.stringify(body));
}

function readJson(req, limit = 4096) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('Body too large'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://x');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  for (const { prefix, dir } of STATIC_ROOTS) {
    if (!pathname.startsWith(prefix)) continue;
    const file = path.normalize(path.join(dir, pathname.slice(prefix.length)));
    if (!file.startsWith(dir + path.sep)) break; // path traversal attempt
    let st;
    try { st = statSync(file); } catch { continue; }
    if (!st.isFile()) continue;
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': 'no-cache',
      ...SECURITY_HEADERS,
    });
    createReadStream(file).pipe(res);
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
  res.end('Not found');
}

export function createHttpHandler({ pool, auth, world, config, version }) {
  const loginLimit = createRateLimiter({ windowMs: 60_000, max: 12 });
  const registerLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 6 });
  const apiLimit = createRateLimiter({ windowMs: 10_000, max: 60 });

  async function requireAccount(req) {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    return token ? auth.authenticate(token) : null;
  }

  return async function handler(req, res) {
    const ip = req.socket.remoteAddress || 'unknown';
    const url = new URL(req.url, 'http://x');
    const p = url.pathname;
    if (!p.startsWith('/api/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Method not allowed' });
      return serveStatic(req, res);
    }
    if (!apiLimit(ip)) return sendJson(res, 429, { error: 'Too many requests.' });

    try {
      if (p === '/api/health' && req.method === 'GET') {
        await pool.query('SELECT 1');
        return sendJson(res, 200, { ok: true, ...world.stats() });
      }
      if (p === '/api/status' && req.method === 'GET') {
        return sendJson(res, 200, {
          name: config.serverName, version, protocol: PROTOCOL_VERSION,
          online: world.players.size, capacity: config.maxPlayers, status: 'online',
        });
      }
      if (p === '/api/register' && req.method === 'POST') {
        if (!registerLimit(ip)) return sendJson(res, 429, { error: 'Too many accounts created from this address. Try later.' });
        const body = await readJson(req);
        const r = await auth.register(body.username, body.password);
        if (r.error) return sendJson(res, r.status, { error: r.error });
        return sendJson(res, 201, { account: r.account });
      }
      if (p === '/api/login' && req.method === 'POST') {
        if (!loginLimit(ip)) return sendJson(res, 429, { error: 'Too many login attempts. Wait a minute.' });
        const body = await readJson(req);
        const r = await auth.login(body.username, body.password, ip);
        if (r.error) return sendJson(res, r.status, { error: r.error });
        return sendJson(res, 200, { token: r.token, account: r.account });
      }
      if (p === '/api/logout' && req.method === 'POST') {
        const h = req.headers.authorization || '';
        if (h.startsWith('Bearer ')) await auth.logout(h.slice(7));
        return sendJson(res, 200, { ok: true });
      }

      if (p === '/api/characters' || p.startsWith('/api/characters/')) {
        const account = await requireAccount(req);
        if (!account) return sendJson(res, 401, { error: 'Please log in again.' });
        if (p === '/api/characters' && req.method === 'GET') {
          return sendJson(res, 200, { characters: await repo.listCharacters(pool, account.id) });
        }
        if (p === '/api/characters' && req.method === 'POST') {
          const body = await readJson(req);
          const ch = await repo.createCharacter(pool, account.id, body.name, body.cls);
          return sendJson(res, 201, { character: ch });
        }
        const m = p.match(/^\/api\/characters\/(\d+)$/);
        if (m && req.method === 'DELETE') {
          const id = Number(m[1]);
          if (world.byCharacter.has(id)) return sendJson(res, 409, { error: 'That character is online.' });
          const ok = await repo.deleteCharacter(pool, account.id, id);
          return sendJson(res, ok ? 200 : 404, ok ? { ok: true } : { error: 'Character not found.' });
        }
      }
      return sendJson(res, 404, { error: 'Not found' });
    } catch (err) {
      if (err instanceof repo.GameError) return sendJson(res, 400, { error: err.message, code: err.code });
      if (err.status) return sendJson(res, err.status, { error: err.message });
      log.error('http error', { path: p, err: err.message });
      return sendJson(res, 500, { error: 'Server error.' });
    }
  };
}
