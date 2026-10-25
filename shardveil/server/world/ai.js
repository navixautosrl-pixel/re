// Monster behaviour: idle wandering, aggro, chase, attack, leash and return.
// Runs inside the world tick. Monsters far from every player are put to sleep.

const AGGRO_CHECK_INTERVAL = 0.4;
const SLEEP_DISTANCE = 110;

export function updateMonster(world, m, dt) {
  const now = world.time;
  if (m.dead) return;
  const def = m.def;

  // Status effects (poison ticks, expiry).
  if (m.statuses.length) world.combat.tickStatuses(m, now);
  if (m.dead) return;

  if (def.stationary) return;

  // Sleep when nobody is around: snap home and reset instead of simulating.
  if (now >= m.nextWakeCheck) {
    m.nextWakeCheck = now + 1;
    m.asleep = !world.anyPlayerWithin(m.x, m.z, SLEEP_DISTANCE);
    if (m.asleep && (m.state !== 'idle' || m.hp < m.maxHp)) {
      if (m.temporary) { world.despawnMonster(m); return; }
      resetHome(m);
    }
  }
  if (m.asleep) return;

  const rooted = m.statuses.some((s) => s.id === 'root');
  const slow = m.statuses.reduce((acc, s) => (s.speedMult ? Math.min(acc, s.speedMult) : acc), 1);

  switch (m.state) {
    case 'idle': {
      if (def.aggressive && now >= m.nextAggroCheck) {
        m.nextAggroCheck = now + AGGRO_CHECK_INTERVAL;
        const target = world.nearestAggroTarget(m, def.aggroRadius);
        if (target) { engage(m, target); break; }
      }
      if (now >= m.nextWander) {
        m.nextWander = now + 3 + world.rng() * 6;
        const a = world.rng() * Math.PI * 2;
        const r = world.rng() * m.spawn.radius;
        m.wanderTo = { x: m.spawn.x + Math.cos(a) * r, z: m.spawn.z + Math.sin(a) * r };
      }
      if (m.wanderTo && !rooted) {
        if (stepToward(world, m, m.wanderTo.x, m.wanderTo.z, def.moveSpeed * 0.35 * slow, dt, 0.3)) m.wanderTo = null;
      }
      break;
    }
    case 'chase': {
      const t = world.players.get(m.targetId);
      if (!t || t.dead || world.terrain.inSafeZone(t.x, t.z) || leashed(m)) { startReturn(world, m); break; }
      const d = Math.hypot(t.x - m.x, t.z - m.z);
      const reach = def.attackRange + def.radius + 0.4;
      if (d > reach) {
        if (!rooted) stepToward(world, m, t.x, t.z, def.moveSpeed * slow, dt, reach * 0.85);
      } else {
        m.ry = Math.atan2(t.x - m.x, t.z - m.z);
        if (now >= m.attackReadyAt && !m.casting) {
          m.attackReadyAt = now + def.attackCooldown;
          world.combat.monsterAttack(m, t);
        }
      }
      if (def.special && now >= m.specialReadyAt && !m.casting) world.combat.startMonsterSpecial(m, t);
      break;
    }
    case 'return': {
      // Returning monsters regenerate and ignore damage-based retargeting.
      m.hp = Math.min(m.maxHp, m.hp + m.maxHp * 0.25 * dt);
      // A monster that can't find its way home within a few seconds is reset in place.
      if (stepToward(world, m, m.spawn.homeX, m.spawn.homeZ, def.moveSpeed * 1.4, dt, 1.5) || now - m.returnSince > 8) resetHome(m);
      break;
    }
  }
}

export function engage(m, player) {
  if (m.def.stationary || m.state === 'return') return;
  if (m.state !== 'chase') m.attackReadyAt = Math.max(m.attackReadyAt, 0);
  m.state = 'chase';
  m.targetId = player.id;
}

function leashed(m) {
  return Math.hypot(m.x - m.spawn.x, m.z - m.spawn.z) > m.def.leashRadius;
}

function startReturn(world, m) {
  if (m.temporary) { world.despawnMonster(m); return; }
  m.state = 'return';
  m.returnSince = world.time;
  m.targetId = null;
  m.damageBy.clear();
  m.statuses.length = 0;
  m.casting = null;
}

function resetHome(m) {
  m.state = 'idle';
  m.hp = m.maxHp;
  m.targetId = null;
  m.damageBy.clear();
  m.statuses.length = 0;
  m.casting = null;
  m.x = m.spawn.homeX;
  m.z = m.spawn.homeZ;
}

// Moves toward (tx, tz); returns true once within `stopAt` metres.
function stepToward(world, m, tx, tz, speed, dt, stopAt) {
  const dx = tx - m.x, dz = tz - m.z;
  const d = Math.hypot(dx, dz);
  if (d <= stopAt) return true;
  const step = Math.min(d - stopAt, speed * dt);
  let nx = m.x + (dx / d) * step;
  let nz = m.z + (dz / d) * step;
  const res = world.terrain.resolveCollision(nx, nz, m.def.radius * 0.6);
  nx = res.x; nz = res.z;
  if (!world.terrain.isWalkable(nx, nz) || world.terrain.inSafeZone(nx, nz)) {
    // Blocked: give up on idle wandering targets, otherwise hold position.
    if (m.state === 'idle') m.wanderTo = null;
    return m.state === 'idle';
  }
  m.x = nx;
  m.z = nz;
  m.ry = Math.atan2(dx, dz);
  return false;
}
