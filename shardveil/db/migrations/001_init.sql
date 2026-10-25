-- 001_init: accounts, sessions, characters, item instances, item/gold ledger.

CREATE TABLE accounts (
  id             BIGSERIAL PRIMARY KEY,
  username       TEXT NOT NULL CHECK (username ~ '^[A-Za-z0-9_]{3,20}$'),
  password_hash  TEXT NOT NULL,                -- scrypt$N$r$p$salt$hash, never plaintext
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at  TIMESTAMPTZ,
  failed_logins  INT NOT NULL DEFAULT 0,
  locked_until   TIMESTAMPTZ,
  banned         BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX accounts_username_lower ON accounts (lower(username));

CREATE TABLE sessions (
  id            BIGSERIAL PRIMARY KEY,
  account_id    BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  token_hash    BYTEA NOT NULL UNIQUE,         -- sha256 of the bearer token; the token itself is never stored
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip            TEXT
);
CREATE INDEX sessions_account ON sessions (account_id);
CREATE INDEX sessions_expires ON sessions (expires_at);

CREATE TABLE characters (
  id            BIGSERIAL PRIMARY KEY,
  account_id    BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name          TEXT NOT NULL CHECK (name ~ '^[A-Za-z][A-Za-z]{2,15}$'),
  class         TEXT NOT NULL CHECK (class IN ('vanguard', 'shadeblade', 'arcanist', 'wardweaver')),
  level         INT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
  xp            BIGINT NOT NULL DEFAULT 0 CHECK (xp >= 0),
  gold          BIGINT NOT NULL DEFAULT 0 CHECK (gold >= 0),
  hp            INT NOT NULL CHECK (hp >= 0),
  mp            INT NOT NULL CHECK (mp >= 0),
  zone          TEXT NOT NULL DEFAULT 'hollowmere',
  x             REAL NOT NULL DEFAULT 0,
  z             REAL NOT NULL DEFAULT 6,
  ry            REAL NOT NULL DEFAULT 0,
  play_seconds  BIGINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);
-- Names are unique among live characters, case-insensitively.
CREATE UNIQUE INDEX characters_name_lower ON characters (lower(name)) WHERE deleted_at IS NULL;
CREATE INDEX characters_account ON characters (account_id) WHERE deleted_at IS NULL;

-- One row per item instance (a stack counts as one instance).
-- container: 'bag' (slot = 0..N-1), 'equip' (slot = index into EQUIP_SLOTS), 'storage'.
CREATE TABLE items (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  def_id        TEXT NOT NULL,
  qty           INT NOT NULL CHECK (qty > 0),
  container     TEXT NOT NULL CHECK (container IN ('bag', 'equip', 'storage')),
  slot          INT NOT NULL CHECK (slot >= 0),
  rarity        TEXT NOT NULL DEFAULT 'common',
  affixes       JSONB NOT NULL DEFAULT '{}'::jsonb,
  upgrade       INT NOT NULL DEFAULT 0 CHECK (upgrade BETWEEN 0 AND 15),
  bound         BOOLEAN NOT NULL DEFAULT false,
  origin        TEXT,                          -- 'starter', 'loot:<monster>', 'shop', ...
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (character_id, container, slot)
);
CREATE INDEX items_character ON items (character_id);

-- Append-only record of every change to items or gold, for support and
-- exploit investigation. Never updated or deleted by the game server.
CREATE TABLE item_ledger (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,                 -- 'loot', 'use', 'destroy', 'buy', 'sell', 'starter', 'gold_loot', ...
  item_id       BIGINT,
  def_id        TEXT,
  qty           INT,
  gold_delta    BIGINT NOT NULL DEFAULT 0,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX item_ledger_character_time ON item_ledger (character_id, created_at);
