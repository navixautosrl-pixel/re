// Game socket with automatic reconnection. On an unexpected drop it retries
// with backoff and re-sends the same hello, so the player lands back in the
// world where the server last saved them.
import { PROTOCOL_VERSION } from '/shared/protocol.js';

const FATAL = new Set(['AUTH', 'VERSION', 'BAD_CHARACTER', 'FULL']);

export class Connection {
  constructor({ token, characterId, onMessage, onState }) {
    this.token = token;
    this.characterId = characterId;
    this.onMessage = onMessage;
    this.onState = onState; // ('connecting'|'online'|'reconnecting'|'closed', detail)
    this.attempt = 0;
    this.closedByUs = false;
    this.fatal = null;
    this.rtt = 0;
  }

  open() {
    const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
    this.onState(this.attempt ? 'reconnecting' : 'connecting', { attempt: this.attempt });
    const ws = new WebSocket(url);
    this.ws = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ t: 'hello', v: PROTOCOL_VERSION, token: this.token, characterId: this.characterId }));
    };
    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.t === 'welcome') {
        this.attempt = 0;
        this.onState('online');
        clearInterval(this.pingTimer);
        this.pingTimer = setInterval(() => this.send({ t: 'ping', t0: performance.now() }), 5000);
      } else if (msg.t === 'pong') {
        this.rtt = performance.now() - msg.t0;
      } else if (msg.t === 'error' && FATAL.has(msg.code)) {
        this.fatal = msg;
      } else if (msg.t === 'kick') {
        this.fatal = { code: 'KICK', message: msg.reason };
      }
      this.onMessage(msg);
    };
    ws.onclose = () => {
      clearInterval(this.pingTimer);
      if (this.closedByUs) return;
      if (this.fatal) { this.onState('closed', this.fatal); return; }
      this.attempt++;
      if (this.attempt > 8) { this.onState('closed', { code: 'LOST', message: 'Could not reconnect to the server.' }); return; }
      const delay = Math.min(8000, 500 * 2 ** (this.attempt - 1));
      this.onState('reconnecting', { attempt: this.attempt, delay });
      this.retryTimer = setTimeout(() => this.open(), delay);
    };
  }

  send(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  close() {
    this.closedByUs = true;
    clearTimeout(this.retryTimer);
    clearInterval(this.pingTimer);
    if (this.ws) this.ws.close();
  }
}
