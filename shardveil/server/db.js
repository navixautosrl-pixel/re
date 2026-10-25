// PostgreSQL pool + migration runner + transaction helper.
import pg from 'pg';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './config.js';
import { log } from './log.js';

// BIGINT columns come back as strings by default; our values (ids, gold, xp)
// stay far below 2^53, so parse them as numbers.
pg.types.setTypeParser(20, (v) => Number(v));

export function createPool(databaseUrl) {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });
  pool.on('error', (err) => log.error('pg pool error', { err: err.message }));
  return pool;
}

export async function tx(pool, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function migrate(pool) {
  const dir = path.join(ROOT, 'db', 'migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const { rows } = await pool.query('SELECT version FROM schema_migrations');
  const done = new Set(rows.map((r) => r.version));
  const applied = [];
  for (const file of files) {
    const version = file.replace(/\.sql$/, '');
    if (done.has(version)) continue;
    const sql = readFileSync(path.join(dir, file), 'utf8');
    await tx(pool, async (c) => {
      // Serialise concurrent migrators (e.g. two servers starting at once).
      await c.query('SELECT pg_advisory_xact_lock(74801)');
      const again = await c.query('SELECT 1 FROM schema_migrations WHERE version = $1', [version]);
      if (again.rowCount) return;
      await c.query(sql);
      await c.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
      applied.push(version);
    });
  }
  if (applied.length) log.info('migrations applied', { applied });
  return applied;
}
