-- 002_quests: per-character quest state.
CREATE TABLE quest_progress (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  quest_id      TEXT NOT NULL,
  state         TEXT NOT NULL CHECK (state IN ('active', 'completed')),
  progress      JSONB NOT NULL DEFAULT '{}'::jsonb,   -- { "<objective index>": count }
  accepted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  PRIMARY KEY (character_id, quest_id)
);
