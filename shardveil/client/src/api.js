// REST calls to the account/character API. The session token lives in
// sessionStorage: it survives a page reload but not closing the browser.

const TOKEN_KEY = 'shardveil.token';

export function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode: token only lives in memory for this page */ }
  memoryToken = token;
}
let memoryToken = getToken();

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function call(method, path, body) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(memoryToken ? { Authorization: `Bearer ${memoryToken}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is it running?');
  }
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new ApiError(res.status, data.error || `Request failed (${res.status})`, data.code);
  return data;
}

export const api = {
  status: () => call('GET', '/api/status'),
  register: (username, password) => call('POST', '/api/register', { username, password }),
  login: async (username, password) => {
    const r = await call('POST', '/api/login', { username, password });
    setToken(r.token);
    return r;
  },
  logout: async () => {
    try { await call('POST', '/api/logout'); } finally { setToken(null); }
  },
  characters: () => call('GET', '/api/characters'),
  createCharacter: (name, cls) => call('POST', '/api/characters', { name, cls }),
  deleteCharacter: (id) => call('DELETE', `/api/characters/${id}`),
  token: () => memoryToken,
};
