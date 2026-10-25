// WebSocket gateway: handshake (token + character), per-connection rate
// limiting, heartbeats, and handing authenticated players to the World.
import { WebSocketServer, WebSocket } from 'ws';
import { PROTOCOL_VERSION, S, C } from '../shared/protocol.js';
import * as repo from './repo/characters.js';
import { log } from './log.js';

const HELLO_TIMEOUT_MS = 10_000;
const MAX_BUFFERED = 2 * 1024 * 1024;
const MSG_RATE = 50;  // sustained client messages per second
const MSG_BURST = 100;

export function attachGateway(server, { pool, auth, world, config }) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 4096 });
  const loadingAccounts = new Set();

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = new URL(req.url, 'http://x');
    if (pathname !== '/ws') { socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws.isAlive === false) { ws.terminate(); continue; }
      ws.isAlive = false;
      ws.ping();
    }
  }, 15_000);

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    let player = null;
    let handshaking = false;
    let tokens = MSG_BURST;
    let lastRefill = Date.now();
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    const send = (msg) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      if (ws.bufferedAmount > MAX_BUFFERED) { ws.terminate(); return; }
      ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    };
    const fail = (code, message) => {
      send({ t: S.ERROR, code, message });
      ws.close(4001, code);
    };
    const helloTimer = setTimeout(() => { if (!player) ws.close(4000, 'hello timeout'); }, HELLO_TIMEOUT_MS);

    ws.on('message', async (data, isBinary) => {
      const now = Date.now();
      tokens = Math.min(MSG_BURST, tokens + ((now - lastRefill) / 1000) * MSG_RATE);
      lastRefill = now;
      if (--tokens < 0) { log.warn('client flooding, disconnecting', { ip }); ws.terminate(); return; }
      if (isBinary) return;
      let msg;
      try { msg = JSON.parse(data.toString('utf8')); } catch { return; }
      if (!msg || typeof msg !== 'object') return;

      if (player) { world.handle(player, msg); return; }
      if (handshaking || msg.t !== C.HELLO) return;
      handshaking = true;

      try {
        if (msg.v !== PROTOCOL_VERSION) return fail('VERSION', 'Your client is out of date. Please update.');
        const account = await auth.authenticate(msg.token);
        if (!account) return fail('AUTH', 'Your session has expired. Please log in again.');
        if (!Number.isInteger(msg.characterId)) return fail('BAD_CHARACTER', 'Pick a character.');
        if (loadingAccounts.has(account.id)) return fail('BUSY', 'Already connecting. Please wait.');
        if (world.players.size >= config.maxPlayers) return fail('FULL', 'The server is full. Try again shortly.');
        loadingAccounts.add(account.id);
        try {
          // One live character per account: an older session is closed and
          // fully saved before the new one loads, so state can't fork.
          const existing = world.playerByAccount(account.id);
          if (existing) {
            existing.send({ t: S.KICK, reason: 'Logged in from another location.' });
            existing.close();
            await world.removePlayer(existing);
          }
          const ch = await repo.loadCharacter(pool, account.id, msg.characterId);
          if (!ch) return fail('BAD_CHARACTER', 'Character not found.');
          if (ws.readyState !== WebSocket.OPEN) return;
          clearTimeout(helloTimer);
          player = world.addPlayer(ch, send, () => ws.close(4002, 'kicked'));
        } finally {
          loadingAccounts.delete(account.id);
        }
      } catch (err) {
        log.error('handshake failed', { err: err.message });
        fail('SERVER', 'Could not enter the world. Please try again.');
      } finally {
        handshaking = false;
      }
    });

    ws.on('close', () => {
      clearTimeout(helloTimer);
      if (player) world.removePlayer(player);
    });
    ws.on('error', (err) => log.warn('socket error', { err: err.message }));
  });

  return {
    close() {
      clearInterval(heartbeat);
      for (const ws of wss.clients) ws.terminate();
      wss.close();
    },
  };
}
