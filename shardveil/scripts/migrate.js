// Apply pending database migrations: `npm run db:migrate`
import { config } from '../server/config.js';
import { createPool, migrate } from '../server/db.js';

const pool = createPool(process.env.DATABASE_URL || config.databaseUrl);
try {
  const applied = await migrate(pool);
  console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'Database is up to date.');
} finally {
  await pool.end();
}
