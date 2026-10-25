// Wire protocol. JSON text frames over a single WebSocket per player.
// Documented in docs/PROTOCOL.md; bump PROTOCOL_VERSION on breaking changes so
// stale clients get a clear "please update" instead of undefined behaviour.

export const PROTOCOL_VERSION = 1;

export const TICK_RATE = 20;      // server simulation steps per second
export const SNAPSHOT_RATE = 10;  // world snapshots per second sent to clients
export const INTEREST_RADIUS = 90; // metres; entities further away aren't sent

// Client -> server message types
export const C = {
  HELLO: 'hello',         // { v, token, characterId }
  MOVE: 'move',           // { x, z, ry, seq }
  ATTACK: 'attack',       // { target }
  SKILL: 'skill',         // { skill, target? }
  PICKUP: 'pickup',       // { id }
  EQUIP: 'equip',         // { slot }          bag slot index
  UNEQUIP: 'unequip',     // { slot }          equip slot name
  USE: 'use',             // { slot }          bag slot index
  MOVE_ITEM: 'moveItem',  // { from, to }      bag slot indices
  DROP: 'drop',           // { slot }          destroy item (confirmed client-side)
  CHAT: 'chat',           // { channel, text }
  REVIVE: 'revive',       // {}
  PING: 'ping',           // { t }
};

// Server -> client message types
export const S = {
  WELCOME: 'welcome',     // { you, character, inventory, serverTime, zone }
  SNAPSHOT: 'snap',       // { t, p:[...], m:[...], l:[...] }
  EVENT: 'ev',            // { e: [...] } combat / fx events
  SELF: 'self',           // { ... } own stats, hp/mp/xp/gold
  INVENTORY: 'inv',       // { bag:[...], equip:{...} }
  CORRECT: 'correct',     // { x, z } authoritative position fix
  CHAT: 'chat',           // { channel, from, text }
  NOTICE: 'notice',       // { text, kind }
  ERROR: 'error',         // { code, message }
  PONG: 'pong',           // { t, serverTime }
  KICK: 'kick',           // { reason }
};
