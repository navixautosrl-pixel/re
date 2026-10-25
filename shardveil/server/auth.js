// Accounts and sessions. Passwords are hashed with scrypt (memory-hard, in
// Node's standard library); session tokens are random 256-bit values of which
// only a SHA-256 digest is stored.
import { scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const SCRYPT = { N: 1 << 15, r: 8, p: 1, keylen: 32, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: SCRYPT.maxmem });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const parts = String(stored).split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scryptAsync(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(N), r: Number(r), p: Number(p), maxmem: SCRYPT.maxmem,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export const sha256 = (s) => createHash('sha256').update(s).digest();

export function validateCredentials(username, password) {
  if (typeof username !== 'string' || !/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return 'Username must be 3–20 letters, digits or underscores.';
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return 'Password must be 8–128 characters.';
  }
  return null;
}

const LOCK_AFTER_FAILURES = 8;
const LOCK_MINUTES = 10;

export function createAuth(pool, { sessionTtlHours }) {
  async function register(username, password) {
    const problem = validateCredentials(username, password);
    if (problem) return { error: problem, status: 400 };
    const hash = await hashPassword(password);
    try {
      const { rows } = await pool.query(
        'INSERT INTO accounts (username, password_hash) VALUES ($1, $2) RETURNING id, username',
        [username, hash],
      );
      return { account: rows[0] };
    } catch (err) {
      if (err.code === '23505') return { error: 'That username is taken.', status: 409 };
      throw err;
    }
  }

  async function login(username, password, ip) {
    if (typeof username !== 'string' || typeof password !== 'string' || password.length > 128) {
      return { error: 'Invalid username or password.', status: 401 };
    }
    const { rows } = await pool.query(
      'SELECT id, username, password_hash, failed_logins, locked_until, banned FROM accounts WHERE lower(username) = lower($1)',
      [username],
    );
    const acc = rows[0];
    if (!acc) {
      // Spend comparable time so response timing doesn't reveal which usernames exist.
      await hashPassword(password);
      return { error: 'Invalid username or password.', status: 401 };
    }
    if (acc.locked_until && new Date(acc.locked_until) > new Date()) {
      return { error: 'Too many failed attempts. Try again in a few minutes.', status: 429 };
    }
    if (acc.banned) return { error: 'This account is suspended.', status: 403 };

    const ok = await verifyPassword(password, acc.password_hash);
    if (!ok) {
      const failures = acc.failed_logins + 1;
      if (failures >= LOCK_AFTER_FAILURES) {
        await pool.query(
          'UPDATE accounts SET failed_logins = 0, locked_until = now() + make_interval(mins => $2) WHERE id = $1',
          [acc.id, LOCK_MINUTES],
        );
      } else {
        await pool.query('UPDATE accounts SET failed_logins = $2 WHERE id = $1', [acc.id, failures]);
      }
      return { error: 'Invalid username or password.', status: 401 };
    }

    const token = randomBytes(32).toString('base64url');
    await pool.query(
      `INSERT INTO sessions (account_id, token_hash, expires_at, ip)
       VALUES ($1, $2, now() + make_interval(hours => $3), $4)`,
      [acc.id, sha256(token), sessionTtlHours, ip || null],
    );
    await pool.query('UPDATE accounts SET failed_logins = 0, locked_until = NULL, last_login_at = now() WHERE id = $1', [acc.id]);
    return { token, account: { id: acc.id, username: acc.username } };
  }

  async function authenticate(token) {
    if (typeof token !== 'string' || token.length < 20 || token.length > 100) return null;
    const { rows } = await pool.query(
      `UPDATE sessions s SET last_seen_at = now()
         FROM accounts a
        WHERE s.token_hash = $1 AND s.expires_at > now() AND a.id = s.account_id AND NOT a.banned
        RETURNING s.account_id AS id, a.username`,
      [sha256(token)],
    );
    return rows[0] || null;
  }

  async function logout(token) {
    if (typeof token !== 'string') return;
    await pool.query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)]);
  }

  async function purgeExpired() {
    await pool.query('DELETE FROM sessions WHERE expires_at < now()');
  }

  return { register, login, authenticate, logout, purgeExpired };
}

// Fixed-window rate limiter keyed by IP (or any string). In-memory is fine:
// it only throttles abuse of one server process, it is not game state.
export function createRateLimiter({ windowMs, max }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }, windowMs).unref();
  return function allow(key) {
    const now = Date.now();
    let h = hits.get(key);
    if (!h || h.reset < now) hits.set(key, (h = { count: 0, reset: now + windowMs }));
    h.count++;
    return h.count <= max;
  };
}
