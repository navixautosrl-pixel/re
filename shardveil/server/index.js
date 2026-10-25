// Dedicated server entry point. One process = one zone instance:
// HTTP API + static client + WebSocket gateway + world simulation.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, ROOT } from './config.js';
import { createPool, migrate } from './db.js';
import { createAuth } from './auth.js';
import { World } from './world/World.js';
import { createHttpHandler } from './http.js';
import { attachGateway } from './gateway.js';
import { log } from './log.js';

const VERSION = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

export async function startServer(overrides = {}) {
  const cfg = { ...config, ...overrides };
  const pool = createPool(cfg.databaseUrl);
  if (cfg.migrateOnStart) await migrate(pool);

  const auth = createAuth(pool, cfg);
  const world = new World({ pool, saveIntervalSec: cfg.saveIntervalSec, seed: cfg.seed });
  const server = http.createServer(createHttpHandler({ pool, auth, world, config: cfg, version: VERSION }));
  const gateway = attachGateway(server, { pool, auth, world, config: cfg });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(cfg.port, cfg.host, resolve);
  });
  world.start();
  const port = server.address().port;
  const purge = setInterval(() => auth.purgeExpired().catch(() => {}), 3600_000);
  purge.unref();
  log.info('server listening', { url: `http://${cfg.host}:${port}`, name: cfg.serverName, version: VERSION });

  let closing = null;
  async function close() {
    if (closing) return closing;
    closing = (async () => {
      log.info('shutting down: saving all players');
      clearInterval(purge);
      await world.stop();       // kicks and saves every player
      gateway.close();
      await new Promise((r) => server.close(r));
      await pool.end();
      log.info('shutdown complete');
    })();
    return closing;
  }
  return { port, url: `http://${cfg.host}:${port}`, world, pool, close };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const srv = await startServer();
  const shutdown = (signal) => {
    log.info('signal received', { signal });
    const force = setTimeout(() => { log.error('forced exit after timeout'); process.exit(1); }, 15_000);
    srv.close().then(() => { clearTimeout(force); process.exit(0); });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
