// Runtime configuration from environment variables. Defaults are for local
// development only; production must set DATABASE_URL explicitly.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env loader (KEY=VALUE lines) so local setup needs no extra package.
const envFile = path.join(ROOT, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const env = process.env;
const isProd = env.NODE_ENV === 'production';

export const config = {
  isProd,
  port: Number(env.PORT || 7480),
  host: env.HOST || '127.0.0.1',
  databaseUrl: env.DATABASE_URL || (isProd ? '' : 'postgres://shardveil:shardveil_dev@127.0.0.1:5432/shardveil'),
  serverName: env.SERVER_NAME || 'Emberford-1 (local)',
  migrateOnStart: env.MIGRATE_ON_START !== 'false',
  sessionTtlHours: Number(env.SESSION_TTL_HOURS || 72),
  saveIntervalSec: Number(env.SAVE_INTERVAL_SEC || 15),
  maxPlayers: Number(env.MAX_PLAYERS || 200),
  logLevel: env.LOG_LEVEL || 'info',
};

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL must be set in production');
}
