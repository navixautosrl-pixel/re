-- 003: storage and upgrades reuse the items table (container 'storage',
-- column 'upgrade'). This index keeps vault lookups cheap.
CREATE INDEX items_character_container ON items (character_id, container);
