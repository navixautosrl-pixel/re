// Starts a real server on a random port against a freshly reset test database.
import pg from 'pg';
import { startServer } from '../../server/index.js';

export const TEST_DB = process.env.TEST_DATABASE_URL || 'postgres://shardveil:shardveil_dev@127.0.0.1:5432/shardveil_test';

export async function resetTestDatabase() {
  if (!/_test\b/.test(TEST_DB)) throw new Error('Refusing to reset a database whose name does not end in _test');
  const c = new pg.Client({ connectionString: TEST_DB });
  await c.connect();
  await c.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await c.end();
}

export async function startTestServer(overrides = {}) {
  await resetTestDatabase();
  const srv = await startServer({ port: 0, host: '127.0.0.1', databaseUrl: TEST_DB, saveIntervalSec: 2, seed: 42, ...overrides });
  return { ...srv, base: `http://127.0.0.1:${srv.port}` };
}

export async function query(sql, params) {
  const c = new pg.Client({ connectionString: TEST_DB });
  await c.connect();
  try { return (await c.query(sql, params)).rows; } finally { await c.end(); }
}
