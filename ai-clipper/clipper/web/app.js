/* AI Clipper: interfața locală. JavaScript simplu, fără framework și fără pas de build.
   Tot textul venit din exterior (titluri YouTube, nume de fișiere, transcriere) se inserează
   cu textContent, niciodată ca HTML. */
"use strict";

const TOKEN = window.CLIPPER.token;
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stocare indisponibilă */ } },
};

const S = {
  system: null, projects: [], pid: null, project: null, view: null,
  yt: null, ytUrl: "", ytLong: false, rights: false, uploading: null,
  settings: null, sentences: null, filter: "", poll: null,
  params: LS.get("clipper-params", { min: 20, max: 45, count: 8 }),
  model: LS.get("clipper-model", "base"), language: LS.get("clipper-language", "ro"),
};

/* ------------------------------------------------------------------ utilitare DOM */
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k === "style") el.setAttribute("style", v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

const ICONS = {
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  upload: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  link: ["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"],
  folder: ["M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"],
  check: ["M20 6 9 17l-5-5"],
  x: ["M18 6 6 18", "M6 6l12 12"],
  alert: ["M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z", "M12 9v4", "M12 17h.01"],
  info: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 16v-4", "M12 8h.01"],
  sun: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M12 2v2", "M12 20v2", "M4.9 4.9l1.4 1.4", "M17.7 17.7l1.4 1.4", "M2 12h2", "M20 12h2", "M4.9 19.1l1.4-1.4", "M17.7 6.3l1.4-1.4"],
  moon: ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"],
  trash: ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  refresh: ["M21 12a9 9 0 1 1-2.6-6.4L21 8", "M21 3v5h-5"],
  copy: ["M9 9h11v11H9z", "M5 15H4V4h11v1"],
  captions: ["M3 5h18v14H3z", "M7 15h4", "M15 15h2", "M7 11h2", "M13 11h4"],
  scissors: ["M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M20 4 8.1 15.9", "M14.5 14.5 20 20", "M8.1 8.1 12 12"],
  image: ["M3 3h18v18H3z", "M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "M21 15l-5-5L5 21"],
  sparkle: ["M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"],
  text: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8"],
  search: ["M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z", "M21 21l-4.3-4.3"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
};

function icon(name, size = 18) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", size); svg.setAttribute("height", size); svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round"); svg.setAttribute("aria-hidden", "true");
  for (const d of ICONS[name] || []) { const p = document.createElementNS(ns, "path"); p.setAttribute("d", d); svg.append(p); }
  return svg;
}

function ts(sec) {
  sec = Math.max(0, Number(sec) || 0);
  const hh = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60), ss = Math.floor(sec % 60);
  const two = (n) => String(n).padStart(2, "0");
  return hh ? `${hh}:${two(mm)}:${two(ss)}` : `${two(mm)}:${two(ss)}`;
}
function tsFine(sec) { return `${ts(sec)}.${Math.floor(((sec % 1) + 1e-6) * 10)}`; }
function dur(sec) {
  if (!sec && sec !== 0) return "necunoscută";
  sec = Math.round(sec);
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m < 60) return s ? `${m} min ${s} s` : `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
function plural(n, one, many) { return `${n} ${n === 1 ? one : many}`; }

/* ------------------------------------------------------------------ comunicare cu serverul */
async function api(method, path, body) {
  const opt = { method, headers: {} };
  if (method !== "GET") opt.headers["X-Clipper-Token"] = TOKEN;
  if (body !== undefined) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
  let r;
  try { r = await fetch(path, opt); } catch (e) { throw new Error("Aplicația nu răspunde. Repornește AI Clipper."); }
  const raw = await r.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch (e) { /* răspuns care nu e JSON */ }
  if (!r.ok) {
    const msg = (data && (data.error || (typeof data.detail === "string" ? data.detail : null))) || `Cerere eșuată (${r.status}).`;
    throw new Error(msg);
  }
  return data;
}

function toast(msg, kind = "ok") {
  const el = h("div", { class: `toast ${kind}` }, icon(kind === "error" ? "alert" : kind === "info" ? "info" : "check"), h("div", { text: msg }));
  document.getElementById("toasts").append(el);
  setTimeout(() => el.remove(), kind === "error" ? 9000 : 4500);
}

async function attempt(fn, btn) {
  if (btn) btn.disabled = true;
  try { return await fn(); } catch (e) { toast(e.message, "error"); return undefined; } finally { if (btn && btn.isConnected) btn.disabled = false; }
}

async function copyText(text, what) {
  try { await navigator.clipboard.writeText(text); toast(`${what} copiat.`); }
  catch (e) {
    const ta = h("textarea", { style: "position:fixed;opacity:0" }); ta.value = text; document.body.append(ta); ta.select();
    try { document.execCommand("copy"); toast(`${what} copiat.`); } catch (err) { toast("Copierea nu este permisă de browser.", "error"); }
    ta.remove();
  }
}

/* ------------------------------------------------------------------ dialoguri */
const dlg = document.getElementById("dialog");
function openDialog(title, body, foot, opts = {}) {
  dlg.replaceChildren(
    h("div", { class: "dlg-head" }, h("h2", { text: title }),
      h("button", { class: "btn ghost icon small", type: "button", "aria-label": "Închide", onclick: () => dlg.close() }, icon("x"))),
    h("div", { class: "dlg-body" }, body),
    foot ? h("div", { class: "dlg-foot" }, foot) : null);
  dlg.style.width = opts.wide ? "min(860px, calc(100vw - 32px))" : "";
  if (!dlg.open) dlg.showModal();
}
dlg.addEventListener("close", () => { if (dlg.onDone) { const f = dlg.onDone; dlg.onDone = null; f(); } });

function confirmDialog(title, text, okLabel, danger = false, extra = null) {
  return new Promise((resolve) => {
    let result = false;
    dlg.onDone = () => resolve(result);
    openDialog(title, [h("p", { text, style: "margin:0 0 12px" }), extra],
      [h("button", { class: "btn", type: "button", onclick: () => dlg.close() }, "Renunță"),
       h("button", { class: `btn ${danger ? "danger" : "primary"}`, type: "button", onclick: () => { result = true; dlg.close(); } }, okLabel)]);
  });
}

/* ------------------------------------------------------------------ navigare */
function go(pid, view) {
  const hash = pid ? `#/p/${encodeURIComponent(pid)}${view ? "/" + view : ""}` : "#/nou";
  if (location.hash !== hash) location.hash = hash; else route();
}
function parseHash() {
  const m = location.hash.match(/^#\/p\/([^/]+)(?:\/(\w+))?/);
  return m ? { pid: decodeURIComponent(m[1]), view: m[2] || null } : { pid: null, view: null };
}
window.addEventListener("hashchange", route);

async function route() {
  const { pid, view } = parseHash();
  if (!pid) { S.pid = null; S.project = null; stopPoll(); renderRail(); renderNew(); return; }
  if (pid !== S.pid) { S.sentences = null; S.filter = ""; S.settings = null; stopPoll(); }
  S.pid = pid;
  try { S.project = await api("GET", `/api/projects/${encodeURIComponent(pid)}`); }
  catch (e) { toast(e.message, "error"); go(null); return; }
  S.view = view || defaultView(S.project);
  if (S.project.job) startPoll(S.project.job.id);
  renderRail();
  renderProject();
}

function defaultView(p) {
  if (p.job) return { download: "source", transcribe: "transcript", render: "export" }[p.job.kind] || "source";
  if (!p.steps.download) return "source";
  if (!p.steps.transcript) return "transcript";
  if (!p.steps.moments) return "moments";
  return Object.keys(p.results || {}).length ? "export" : "moments";
}

async function refreshProjects() {
  try { S.projects = (await api("GET", "/api/projects")).projects; } catch (e) { /* păstrăm lista veche */ }
  renderRail();
}

/* ------------------------------------------------------------------ bara laterală */
function renderRail() {
  const btn = document.getElementById("new-project");
  btn.replaceChildren(icon("plus"), "Proiect nou");
  const list = document.getElementById("projects");
  list.replaceChildren();
  if (!S.projects.length) { list.append(h("li", { class: "rail-empty", text: "Niciun proiect încă." })); return; }
  for (const p of S.projects) {
    let meta;
    if (p.job) meta = h("span", { class: "live" }, `${p.job.label} ${Math.round(p.job.progress * 100)}%`);
    else if (p.clips) meta = plural(p.clips, "clip exportat", "clipuri exportate");
    else if (p.steps.moments) meta = "Momente alese";
    else if (p.steps.transcript) meta = "Transcris";
    else if (p.steps.download) meta = "Importat";
    else meta = "Import neterminat";
    list.append(h("li", {}, h("button", {
      class: "project-item", type: "button", "aria-current": p.id === S.pid ? "true" : "false",
      onclick: () => go(p.id),
    }, h("span", { class: "project-title", text: p.title }), h("span", { class: "project-meta" }, meta, p.duration ? h("span", { text: ts(p.duration) }) : null))));
  }
}

function renderSystemStatus() {
  const ok = S.system && S.system.ready;
  document.getElementById("system-dot").className = `dot ${S.system ? (ok ? "ok" : "bad") : ""}`;
  document.getElementById("system-text").textContent = !S.system ? "Verific sistemul…" : ok ? "Sistem pregătit" : "Lipsesc componente";
}

function showSystem() {
  if (!S.system) return;
  const rows = S.system.checks.map((c) => h("div", { class: "check-row" },
    h("span", { class: `dot ${c.ok ? "ok" : c.required ? "bad" : ""}`, style: "margin-top:6px" }),
    h("div", {}, h("strong", { text: c.name }), h("small", { text: c.detail }))));
  openDialog("Verificare sistem", [
    h("div", { class: "checks" }, rows),
    h("p", { class: "note", style: "margin-top:16px" }, "Clipurile se salvează în: ", h("strong", { text: S.system.paths.output })),
    h("p", { class: "note muted", text: `AI Clipper ${S.system.version}. Totul rulează local, pe procesor; nimic nu este încărcat pe servicii externe.` }),
  ]);
}

/* ------------------------------------------------------------------ proiect nou */
function rightsBox() {
  const cb = h("input", { type: "checkbox", id: "rights" });
  cb.checked = S.rights;
  cb.addEventListener("change", () => { S.rights = cb.checked; renderNew(); });
  return h("div", { class: "rights" }, icon("shield", 20), h("label", { class: "check", for: "rights" }, cb,
    h("span", {}, h("strong", { text: "Am dreptul să descarc, să editez și să public acest material." }),
      h("br"), h("span", { class: "muted", text: "Conținut propriu, licență explicită sau acordul titularului. Aplicația nu ocolește DRM, restricții de vârstă sau conținut privat și nu publică nimic automat." }))));
}

function renderNew() {
  const view = document.getElementById("view");
  const fileInput = h("input", { type: "file", accept: "video/*,.mkv,.mov,.avi,.wmv,.flv,.ts", class: "sr-only", id: "file-input" });
  fileInput.addEventListener("change", () => { if (fileInput.files[0]) uploadFile(fileInput.files[0]); });
  const drop = h("div", {
    class: `drop ${S.rights && !S.uploading ? "" : "disabled"}`, role: "button", tabindex: S.rights ? "0" : "-1",
    "aria-label": "Alege sau trage un fișier video",
    onclick: () => fileInput.click(),
    onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } },
  });
  if (S.uploading) {
    drop.append(h("div", { class: "drop-icon" }, icon("upload", 26)), h("strong", { text: `Se încarcă: ${S.uploading.name}` }),
      h("div", { class: "bar", style: "width:70%" }, h("i", { id: "upload-bar", style: `width:${Math.round(S.uploading.frac * 100)}%` })),
      h("span", { class: "muted", id: "upload-pct", text: `${Math.round(S.uploading.frac * 100)}%` }));
  } else {
    drop.append(h("div", { class: "drop-icon" }, icon("upload", 26)), h("strong", { text: "Trage aici un videoclip" }),
      h("span", { class: "muted", text: "sau apasă pentru a-l alege (MP4, MOV, MKV…, maximum 60 de minute)" }));
  }
  for (const ev of ["dragenter", "dragover"]) drop.addEventListener(ev, (e) => { e.preventDefault(); if (S.rights) drop.classList.add("over"); });
  for (const ev of ["dragleave", "drop"]) drop.addEventListener(ev, () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    if (!S.rights) { toast("Bifează mai întâi confirmarea privind drepturile.", "error"); return; }
    const f = e.dataTransfer.files[0];
    if (f) uploadFile(f);
  });

  const urlInput = h("input", { class: "input", type: "url", id: "yt-url", placeholder: "https://www.youtube.com/watch?v=…", value: S.ytUrl, "aria-label": "Link YouTube" });
  urlInput.addEventListener("input", () => { S.ytUrl = urlInput.value; });
  const checkBtn = h("button", { class: "btn", type: "button", id: "yt-check" }, "Verifică");
  const doCheck = () => attempt(async () => {
    S.yt = null; S.ytLong = false;
    const r = await api("POST", "/api/youtube/info", { url: urlInput.value.trim() });
    S.yt = { ...r, url: urlInput.value.trim() };
    renderNew();
  }, checkBtn);
  checkBtn.addEventListener("click", doCheck);
  urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doCheck(); });

  const ytCard = h("section", { class: "card" }, h("h2", {}, "Link YouTube"),
    h("p", { class: "lead", text: "Mai întâi citim titlul și durata, fără să descărcăm nimic." }),
    h("div", { class: "row" }, h("div", { style: "flex:1;min-width:220px" }, urlInput), checkBtn));
  if (S.yt) ytCard.append(ytInfoCard());

  view.replaceChildren(
    h("div", { class: "head" }, h("div", {}, h("h1", { text: "Proiect nou" }), h("div", { class: "sub", text: "Alege sursa videoclipului din care vrei clipuri." }))),
    rightsBox(),
    h("div", { class: "grid-2" },
      h("section", { class: "card" }, h("h2", {}, "Fișier de pe calculator"),
        h("p", { class: "lead", text: "Fișierul rămâne pe calculatorul tău; este doar copiat în spațiul de lucru al aplicației." }),
        drop, fileInput),
      ytCard));
}

function ytInfoCard() {
  const { info, problems } = S.yt;
  const lim = S.system ? S.system.options.limits : { long_warn_minutes: 30 };
  const long = info.duration && info.duration > lim.long_warn_minutes * 60;
  const d = info.upload_date;
  const box = h("div", {},
    h("div", { class: "yt-info" },
      info.thumbnail ? h("img", { src: info.thumbnail, alt: "", referrerpolicy: "no-referrer" }) : h("div"),
      h("div", {}, h("h3", { text: info.title }),
        h("dl", { class: "kv" },
          h("dt", { text: "Canal" }), h("dd", { text: info.channel || "–" }),
          h("dt", { text: "Durată" }), h("dd", { text: dur(info.duration) }),
          d ? h("dt", { text: "Publicat" }) : null, d ? h("dd", { text: `${d.slice(6, 8)}.${d.slice(4, 6)}.${d.slice(0, 4)}` }) : null,
          info.view_count != null ? h("dt", { text: "Vizualizări" }) : null,
          info.view_count != null ? h("dd", { text: Number(info.view_count).toLocaleString("ro-RO") }) : null))));
  if (problems.length) {
    box.append(h("div", { class: "alert error", style: "margin-top:14px" }, icon("alert"), h("div", {}, problems.map((p) => h("div", { text: p })))));
    return box;
  }
  if (long) {
    const cb = h("input", { type: "checkbox", id: "yt-long" }); cb.checked = S.ytLong;
    cb.addEventListener("change", () => { S.ytLong = cb.checked; renderNew(); });
    box.append(h("div", { class: "alert warn", style: "margin-top:14px" }, icon("alert"),
      h("label", { class: "check", for: "yt-long" }, cb, h("span", { text: `Material lung (${dur(info.duration)}). Pe procesor, transcrierea poate dura mult. Vreau să continui.` }))));
  }
  const go_ = h("button", { class: "btn primary", type: "button", id: "yt-download" }, icon("download"), "Descarcă și creează proiectul");
  go_.disabled = !S.rights || (long && !S.ytLong);
  go_.addEventListener("click", () => attempt(async () => {
    const r = await api("POST", "/api/projects/youtube", { url: S.yt.url, rights_confirmed: true });
    S.yt = null; S.ytUrl = "";
    await refreshProjects();
    go(r.project, "source");
  }, go_));
  box.append(h("div", { class: "row", style: "margin-top:14px" }, go_, !S.rights ? h("span", { class: "muted", text: "Bifează confirmarea privind drepturile." }) : null));
  return box;
}

function uploadFile(file) {
  if (!S.rights) { toast("Bifează mai întâi confirmarea privind drepturile.", "error"); return; }
  if (S.uploading) return;
  S.uploading = { name: file.name, frac: 0 };
  renderNew();
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `/api/upload?name=${encodeURIComponent(file.name)}&rights=1`);
  xhr.setRequestHeader("X-Clipper-Token", TOKEN);
  xhr.upload.onprogress = (e) => {
    if (!e.lengthComputable) return;
    S.uploading.frac = e.loaded / e.total;
    const bar = document.getElementById("upload-bar"), pct = document.getElementById("upload-pct");
    if (bar) bar.style.width = `${Math.round(S.uploading.frac * 100)}%`;
    if (pct) pct.textContent = `${Math.round(S.uploading.frac * 100)}%`;
  };
  xhr.onload = async () => {
    S.uploading = null;
    let data = null; try { data = JSON.parse(xhr.responseText); } catch (e) { /* ignorăm */ }
    if (xhr.status !== 200) { toast((data && (data.error || data.detail)) || "Încărcarea a eșuat.", "error"); renderNew(); return; }
    await refreshProjects();
    go(data.project, "source");
  };
  xhr.onerror = () => { S.uploading = null; toast("Încărcarea a eșuat.", "error"); renderNew(); };
  xhr.send(file);
}

/* ------------------------------------------------------------------ proiect */
const STEPS = [
  ["source", "Sursă", (p) => p.steps.download],
  ["transcript", "Transcriere", (p) => p.steps.transcript],
  ["moments", "Momente", (p) => p.steps.moments],
  ["export", "Export", (p) => p.steps.clips],
];

function renderProject() {
  const p = S.project;
  const view = document.getElementById("view");
  const del = h("button", { class: "btn ghost small danger", type: "button" }, icon("trash", 16), "Șterge proiectul");
  del.addEventListener("click", async () => {
    const cb = h("input", { type: "checkbox", id: "del-exports" });
    const ok = await confirmDialog("Ștergi proiectul?", "Se șterg fișierele de lucru (video sursă, audio, transcriere).", "Șterge", true,
      h("label", { class: "check", for: "del-exports" }, cb, h("span", { text: "Șterge și clipurile exportate" })));
    if (!ok) return;
    attempt(async () => {
      await api("DELETE", `/api/projects/${encodeURIComponent(p.id)}?exports=${cb.checked ? "true" : "false"}`);
      toast("Proiect șters.");
      await refreshProjects();
      go(null);
    });
  });
  const info = p.info || {};
  const head = h("div", { class: "head" },
    h("div", { style: "min-width:0" }, h("h1", { text: p.title }),
      h("div", { class: "sub" }, `${p.source_type === "youtube" ? "YouTube" : "Fișier local"}, ${dur(info.duration)}`)),
    del);

  const steps = h("ol", { class: "steps" });
  STEPS.forEach(([key, label, done], i) => {
    const prevDone = i === 0 || STEPS[i - 1][2](p);
    const b = h("button", {
      class: `step ${done(p) ? "done" : ""}`, type: "button", "aria-current": S.view === key ? "step" : null,
      disabled: !prevDone && !done(p), onclick: () => go(p.id, key),
    }, h("span", { class: "n" }, done(p) ? icon("check", 13) : String(i + 1)), label);
    steps.append(h("li", {}, b));
  });

  const body = h("div", { id: "step-body" });
  view.replaceChildren(head, steps, h("div", { id: "job-slot" }), body);
  renderJob();
  ({ source: viewSource, transcript: viewTranscript, moments: viewMoments, export: viewExport }[S.view] || viewSource)(body);
}

function stepError(step) {
  const err = S.project.errors && S.project.errors[step];
  if (!err || S.project.job) return null;
  return h("div", { class: "alert error" }, icon("alert"), h("div", {}, h("strong", { text: "Ultima încercare nu a reușit. " }), h("span", { text: err })));
}

/* ------------------------------------------------------------------ lucrarea în curs */
function startPoll(jobId) {
  stopPoll();
  S.poll = { jobId, timer: setInterval(() => pollJob(jobId), 800) };
}
function stopPoll() { if (S.poll) clearInterval(S.poll.timer); S.poll = null; }

async function pollJob(jobId) {
  let j;
  try { j = await api("GET", `/api/jobs/${jobId}`); } catch (e) { return; }
  if (!S.project || !S.poll || S.poll.jobId !== jobId) return;
  S.project.job = ["queued", "running"].includes(j.status) ? j : null;
  const rp = S.projects.find((x) => x.id === j.project_id);
  if (rp) { rp.job = S.project.job; }
  renderJob(j);
  if (rp) renderRail();
  if (!["queued", "running"].includes(j.status)) {
    stopPoll();
    if (j.status === "done") toast(`${j.label}: gata.`);
    else if (j.status === "cancelled") toast(`${j.label}: anulat.`, "info");
    else toast(`${j.label}: ${j.error || "eroare"}`, "error");
    const pid = S.project.id;
    if (j.status === "done" && j.kind === "transcribe") {
      // după transcriere alegem direct momentele cu ultimele setări, ca să ajungi imediat la clipuri
      await attempt(() => api("POST", `/api/projects/${encodeURIComponent(pid)}/moments`, S.params));
      go(pid, "moments");
    } else if (j.status === "done") {
      go(pid, { download: "transcript", render: "export" }[j.kind]);
    } else {
      route();
    }
    refreshProjects();
  }
}

function renderJob(j) {
  const slot = document.getElementById("job-slot");
  if (!slot) return;
  j = j || S.project.job;
  if (!j || !["queued", "running"].includes(j.status)) { slot.replaceChildren(); return; }
  const pct = Math.round(j.progress * 100);
  const existing = document.getElementById("job-card");
  if (existing && existing.dataset.id === j.id) {
    existing.querySelector(".job-msg").textContent = j.message;
    existing.querySelector(".bar > i").style.width = `${pct}%`;
    existing.querySelector(".bar").setAttribute("aria-valuenow", String(pct));
    existing.querySelector(".job-pct").textContent = `${pct}%`;
    existing.querySelector(".job-time").textContent = `Timp scurs: ${dur(j.elapsed_seconds)}`;
    existing.querySelector(".job-eta").textContent = j.eta_seconds != null ? `Rămas aproximativ: ${dur(j.eta_seconds)}` : "";
    existing.querySelector(".job-cancel").disabled = j.cancel_requested;
    return;
  }
  const cancel = h("button", { class: "btn small job-cancel", type: "button" }, icon("x", 16), "Anulează");
  cancel.disabled = j.cancel_requested;
  cancel.addEventListener("click", () => attempt(async () => { await api("POST", `/api/jobs/${j.id}/cancel`); }, cancel));
  slot.replaceChildren(h("section", { class: "card job", id: "job-card", dataset: { id: j.id }, style: "margin-bottom:16px" },
    h("div", { class: "job-top" }, h("div", { class: "spin", "aria-hidden": "true" }), h("div", { class: "job-title", text: j.label }),
      h("span", { class: "job-pct num muted", text: `${pct}%` }), h("span", { class: "spacer" }), cancel),
    h("div", { class: "job-msg", text: j.message }),
    h("div", { class: "bar", role: "progressbar", "aria-label": j.label, "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) },
      h("i", { style: `width:${pct}%` })),
    h("div", { class: "job-meta" }, h("span", { class: "job-time num", text: `Timp scurs: ${dur(j.elapsed_seconds)}` }),
      h("span", { class: "job-eta num", text: j.eta_seconds != null ? `Rămas aproximativ: ${dur(j.eta_seconds)}` : "" }),
      h("span", { text: "Poți închide fereastra; lucrarea continuă și o regăsești aici." }))));
}

/* ------------------------------------------------------------------ pasul 1: sursa */
function viewSource(body) {
  const p = S.project;
  body.append(stepError("download") || "");
  if (p.steps.download) {
    const sm = p.source_media || {};
    body.append(h("section", { class: "card" }, h("h2", {}, "Video importat"),
      h("p", { class: "lead" }, `${sm.width || "?"}×${sm.height || "?"}, ${dur(sm.duration)}`),
      p.source_available ? h("video", { src: `/media/${encodeURIComponent(p.id)}/source`, controls: true, preload: "metadata", style: "max-height:420px;border-radius:10px;background:#000;margin:0 auto" })
        : h("p", { class: "muted", text: "Fișierul sursă a fost șters după confirmarea exportului." }),
      h("div", { class: "row end", style: "margin-top:14px" },
        h("button", { class: "btn primary", type: "button", onclick: () => go(p.id, "transcript") }, "Continuă la transcriere"))));
  } else if (!p.job) {
    const retry = h("button", { class: "btn primary", type: "button" }, icon("refresh"), "Reia importul");
    retry.addEventListener("click", () => attempt(async () => {
      const r = await api("POST", `/api/projects/${encodeURIComponent(p.id)}/import`);
      S.project.job = r.job; startPoll(r.job.id); renderJob(r.job);
    }, retry));
    body.append(h("section", { class: "card" }, h("h2", {}, "Importul nu s-a terminat"),
      h("p", { class: "lead", text: "Fișierele descărcate parțial sunt păstrate; importul continuă de unde a rămas." }), retry));
  }
}

/* ------------------------------------------------------------------ pasul 2: transcriere */
function viewTranscript(body) {
  const p = S.project;
  if (!p.steps.download) { body.append(h("div", { class: "alert info" }, icon("info"), "Importă mai întâi videoclipul.")); return; }
  body.append(stepError("audio") || "", stepError("transcript") || "");
  const opts = S.system.options;
  const seg = h("div", { class: "seg", role: "group", "aria-label": "Model Whisper" });
  const desc = { base: "Rapid. Bun pentru vorbire clară.", small: "Mai precis, mai ales pentru română; cam de 3 ori mai lent." };
  const descEl = h("p", { class: "note", text: desc[S.model] || "" });
  for (const m of opts.models) {
    seg.append(h("button", { type: "button", "aria-pressed": String(S.model === m), onclick: () => { S.model = m; LS.set("clipper-model", m); renderProject(); } }, m));
  }
  const lang = h("select", { class: "select", id: "lang", "aria-label": "Limba vorbită" });
  for (const [k, v] of Object.entries(opts.languages)) lang.append(h("option", { value: k, selected: S.language === k }, v));
  lang.addEventListener("change", () => { S.language = lang.value; LS.set("clipper-language", lang.value); });
  const done = p.steps.transcript;
  const start = h("button", { class: "btn primary big", type: "button", id: "start-transcribe", disabled: !!p.job }, icon("captions"), done ? "Refă transcrierea" : "Pornește transcrierea");
  start.addEventListener("click", async () => {
    if (done && !(await confirmDialog("Refaci transcrierea?", "Transcrierea și momentele actuale se înlocuiesc. Clipurile exportate rămân în folder.", "Refă"))) return;
    attempt(async () => {
      const r = await api("POST", `/api/projects/${encodeURIComponent(p.id)}/transcribe`, { model: S.model, language: S.language, redo: done });
      S.project.job = r.job; startPoll(r.job.id); renderJob(r.job);
    }, start);
  });
  body.append(h("section", { class: "card" }, h("h2", {}, "Transcriere locală"),
    h("p", { class: "lead", text: "Vorbirea este transcrisă pe calculatorul tău, cu marcaje de timp pentru fiecare cuvânt. Subtitrările vor fi în limba vorbită (fără traducere)." }),
    h("div", { class: "row", style: "gap:24px;align-items:flex-end" },
      h("div", { class: "field" }, h("span", { text: "Model" }), seg),
      h("label", { class: "field", style: "width:220px" }, h("span", { text: "Limba vorbită" }), lang),
      h("span", { class: "spacer" }), start),
    descEl));

  if (done) {
    const tm = p.transcript_meta || {};
    const search = h("input", { class: "input", type: "search", placeholder: "Caută în transcriere…", value: S.filter, "aria-label": "Caută în transcriere" });
    const list = h("div", { class: "transcript", id: "transcript-list" });
    const fill = () => {
      const q = S.filter.trim().toLowerCase();
      list.replaceChildren();
      const sents = S.sentences || [];
      let shown = 0;
      for (const s of sents) {
        if (q && !s.text.toLowerCase().includes(q)) continue;
        shown++;
        const txt = h("div");
        if (q) {
          const lo = s.text.toLowerCase(); let i = 0, k;
          while ((k = lo.indexOf(q, i)) >= 0) { txt.append(s.text.slice(i, k), h("mark", { text: s.text.slice(k, k + q.length) })); i = k + q.length; }
          txt.append(s.text.slice(i));
        } else txt.textContent = s.text;
        list.append(h("div", { class: "sent" }, h("time", { text: ts(s.start) }), txt));
      }
      if (!shown) list.append(h("div", { class: "empty", text: S.sentences ? "Nimic găsit." : "Se încarcă…" }));
    };
    search.addEventListener("input", () => { S.filter = search.value; fill(); });
    body.append(h("section", { class: "card" },
      h("div", { class: "row" }, h("h2", { style: "margin:0" }, "Transcriere"), h("span", { class: "spacer" }),
        h("a", { class: "btn small", href: `/api/projects/${encodeURIComponent(p.id)}/transcript.txt`, download: "" }, icon("download", 16), "Descarcă .txt"),
        h("button", { class: "btn primary small", type: "button", onclick: () => go(p.id, "moments") }, "Continuă la momente")),
      h("p", { class: "note", text: `Model ${tm.model || "?"}, limba ${tm.language || "?"}${tm.language_probability ? ` (${Math.round(tm.language_probability * 100)}%)` : ""}. Transcrierea automată poate greși cuvinte: le poți corecta la fiecare clip, în editorul de subtitrări.` }),
      h("div", { style: "margin:10px 0" }, search), list));
    fill();
    if (!S.sentences) loadSentences().then(fill);
  }
}

async function loadSentences() {
  try { S.sentences = (await api("GET", `/api/projects/${encodeURIComponent(S.pid)}/transcript`)).sentences; }
  catch (e) { S.sentences = []; toast(e.message, "error"); }
}

/* ------------------------------------------------------------------ pasul 3: momente */
function viewMoments(body) {
  const p = S.project;
  if (!p.steps.transcript) { body.append(h("div", { class: "alert info" }, icon("info"), "Transcrie mai întâi videoclipul.")); return; }
  body.append(stepError("moments") || "");
  const lim = S.system.options.limits;
  const num = (id, label, val, min, max) => {
    const inp = h("input", { class: "input num", type: "number", id, min, max, value: val, style: "width:110px" });
    return [h("label", { class: "field" }, h("span", { text: label }), inp), inp];
  };
  const [fMin, iMin] = num("p-min", "Durată minimă (s)", S.params.min, lim.min_clip, lim.max_clip);
  const [fMax, iMax] = num("p-max", "Durată maximă (s)", S.params.max, lim.min_clip, lim.max_clip);
  const [fCnt, iCnt] = num("p-count", "Număr de clipuri", S.params.count, lim.min_clips, lim.max_clips);
  const find = h("button", { class: `btn ${p.steps.moments ? "" : "primary"}`, type: "button", id: "find-moments", disabled: !!p.job }, icon("sparkle"), p.steps.moments ? "Recalculează" : "Găsește momentele");
  find.addEventListener("click", async () => {
    const params = { min: Number(iMin.value), max: Number(iMax.value), count: Number(iCnt.value) };
    if (p.steps.moments && !(await confirmDialog("Recalculezi momentele?", "Lista actuală, cu titlurile și subtitrările editate, se înlocuiește.", "Recalculează"))) return;
    attempt(async () => {
      await api("POST", `/api/projects/${encodeURIComponent(p.id)}/moments`, params);
      S.params = params; LS.set("clipper-params", params);
      route();
    }, find);
  });
  const manualBtn = h("button", { class: "btn", type: "button", id: "add-manual", disabled: !p.steps.moments || !!p.job }, icon("plus"), "Clip manual");
  manualBtn.addEventListener("click", openManual);
  body.append(h("section", { class: "card" }, h("h2", {}, "Momente din transcriere"),
    h("p", { class: "lead", text: "Fiecare moment începe și se termină la granița unei propoziții, fără suprapuneri. Titlurile sunt extrase din replicile reale; verifică-le înainte de publicare." }),
    h("div", { class: "toolbar" }, fMin, fMax, fCnt, find, h("span", { class: "spacer" }), manualBtn)));

  if (!p.moments) return;
  if (p.moments.note) body.append(h("div", { class: "alert warn", style: "margin-top:16px" }, icon("alert"), h("span", { text: p.moments.note })));
  const ms = p.moments.moments;
  if (!ms.length) { body.append(h("div", { class: "empty" }, "Niciun moment găsit. Încearcă un interval de durată mai larg sau adaugă un clip manual.")); return; }
  const list = h("div", { class: "clips" });
  for (const m of ms) list.append(clipCard(m));
  const nSel = ms.filter((m) => m.selected !== false).length;
  body.append(list, h("div", { class: "row end", style: "margin-top:16px" },
    h("span", { class: "muted", id: "sel-count", text: `${plural(nSel, "clip selectat", "clipuri selectate")} din ${ms.length}` }),
    h("button", { class: "btn primary big", type: "button", id: "to-export", disabled: !nSel, onclick: () => go(p.id, "export") }, "Continuă la export")));
}

function clipCard(m) {
  const p = S.project;
  const pid = encodeURIComponent(p.id);
  const update = async (patch, btn) => attempt(async () => {
    const r = await api("PUT", `/api/projects/${pid}/moments/${m.nr}`, patch);
    Object.assign(m, r);
    return r;
  }, btn);
  const title = h("input", { class: "input inline", value: m.title, "aria-label": `Titlul clipului ${m.nr}`, maxlength: "120" });
  title.addEventListener("change", async () => { if ((await update({ title: title.value })) !== undefined) toast("Titlu salvat."); else title.value = m.title; });
  title.addEventListener("keydown", (e) => { if (e.key === "Enter") title.blur(); });

  const sel = h("input", { type: "checkbox", id: `sel-${m.nr}` }); sel.checked = m.selected !== false;
  sel.addEventListener("change", async () => {
    const r = await update({ selected: sel.checked });
    if (r === undefined) { sel.checked = !sel.checked; return; }
    card.classList.toggle("off", !sel.checked);
    const nSel = p.moments.moments.filter((x) => x.selected !== false).length;
    const btn = document.getElementById("to-export"), count = document.getElementById("sel-count");
    if (btn) btn.disabled = !nSel;
    if (count) count.textContent = `${plural(nSel, "clip selectat", "clipuri selectate")} din ${p.moments.moments.length}`;
  });
  const adj = (edge, delta, label, iconName) => {
    const b = h("button", { class: "btn small icon", type: "button", "aria-label": label, title: label }, icon(iconName, 15));
    b.addEventListener("click", () => attempt(async () => {
      await api("POST", `/api/projects/${pid}/moments/${m.nr}/adjust`, { edge, delta });
      route();
    }, b));
    return b;
  };
  const edited = (m.cues || []).some((c) => c.edited);
  const thumbT = (m.start + Math.min(1, m.duration / 2)).toFixed(2);
  const card = h("article", { class: `clip ${m.selected === false ? "off" : ""}`, id: `clip-${m.nr}` },
    h("div", { class: "thumb" },
      h("img", { src: `/media/${pid}/thumb/${m.nr}.jpg?t=${thumbT}`, alt: "", loading: "lazy", onerror: (e) => e.target.remove() }),
      h("span", { class: "badge num", text: dur(m.duration) }),
      m.manual ? h("span", { class: "badge left", text: "manual" }) : null),
    h("div", { class: "clip-body" }, title,
      h("div", { class: "clip-time" }, h("span", { class: "num", text: `${ts(m.start)} – ${ts(m.end)}` }),
        m.score != null ? h("span", { class: "score", title: "Scor: densitate, propoziții complete, pauze, încredere" }, h("i", { style: `--v:${Math.max(0, Math.min(100, m.score))}%` }), `scor ${Math.round(m.score)}`) : null,
        edited ? h("span", { class: "tag", text: "subtitrări corectate" }) : null),
      h("div", { class: "clip-text", text: m.text })),
    h("div", { class: "clip-actions" },
      h("label", { class: "check", for: `sel-${m.nr}` }, sel, h("span", { text: "În export" })),
      h("div", { class: "trim" }, h("span", { text: "Început" }), adj("start", 1, "Adaugă o propoziție la început", "plus"), adj("start", -1, "Scoate prima propoziție", "minus")),
      h("div", { class: "trim" }, h("span", { text: "Sfârșit" }), adj("end", -1, "Scoate ultima propoziție", "minus"), adj("end", 1, "Adaugă o propoziție la sfârșit", "plus")),
      h("div", { class: "row" },
        h("button", { class: "btn small", type: "button", onclick: () => openCues(m) }, icon("captions", 15), "Subtitrări"),
        h("button", { class: "btn small ghost danger icon", type: "button", "aria-label": `Șterge clipul ${m.nr}`, title: "Șterge clipul", onclick: async () => {
          if (!(await confirmDialog("Ștergi clipul?", `„${m.title}” dispare din listă.`, "Șterge", true))) return;
          attempt(async () => { await api("DELETE", `/api/projects/${pid}/moments/${m.nr}`); route(); });
        } }, icon("trash", 15)))));
  return card;
}

function openCues(m) {
  const pid = encodeURIComponent(S.project.id);
  const rows = (m.cues || []).map((c, k) => {
    const inp = h("input", { class: "input", value: c.text, "aria-label": `Subtitrarea ${k + 1}` });
    const mark = h("span", { class: "edited", text: c.edited ? "corectat" : "" });
    inp.addEventListener("change", () => attempt(async () => {
      const r = await api("PUT", `/api/projects/${pid}/moments/${m.nr}`, { cue: { index: k, text: inp.value } });
      Object.assign(m, r); inp.value = m.cues[k].text; mark.textContent = "corectat";
    }));
    return h("div", { class: "cue" }, h("div", {}, h("time", { text: `${tsFine(c.s)} – ${tsFine(c.e)}` }), h("div", {}, mark)), inp);
  });
  dlg.onDone = () => route();
  openDialog(`Subtitrări: ${m.title}`, [
    h("p", { class: "note", style: "margin-top:0", text: "Corectează doar ce a fost transcris greșit; timpii rămân sincronizați cu vorbirea. Modificările se salvează automat." }),
    rows.length ? rows : h("p", { class: "muted", text: "Clipul nu are subtitrări (nu s-a detectat vorbire)." }),
  ], [h("button", { class: "btn primary", type: "button", onclick: () => dlg.close() }, "Gata")], { wide: true });
}

async function openManual() {
  if (!S.sentences) await loadSentences();
  const sents = S.sentences || [];
  const lim = S.system.options.limits;
  let a = null, b = null;
  const list = h("div", { class: "transcript", style: "max-height:52vh" });
  const info = h("span", { class: "muted" });
  const add = h("button", { class: "btn primary", type: "button", disabled: true }, icon("plus"), "Adaugă clipul");
  const paint = () => {
    const lo = a === null ? null : Math.min(a, b ?? a), hi = a === null ? null : Math.max(a, b ?? a);
    list.querySelectorAll("button.sent").forEach((el) => {
      const i = Number(el.dataset.i);
      el.classList.toggle("picked", lo !== null && i >= lo && i <= hi);
      el.classList.toggle("edge", i === lo || i === hi);
    });
    if (lo === null) { info.textContent = "Alege prima propoziție a clipului."; add.disabled = true; return; }
    const d = sents[hi].end - sents[lo].start;
    const okLen = d <= lim.max_clip && d >= 3;
    info.textContent = b === null ? "Alege ultima propoziție." : `${ts(sents[lo].start)} – ${ts(sents[hi].end)}, aproximativ ${dur(d)}${okLen ? "" : ` (trebuie între 3 și ${lim.max_clip} s)`}`;
    add.disabled = b === null || !okLen;
  };
  sents.forEach((s, i) => list.append(h("button", { class: "sent", type: "button", dataset: { i: String(i) }, onclick: () => {
    if (a === null || b !== null) { a = i; b = null; } else { b = i; }
    paint();
  } }, h("time", { text: ts(s.start) }), h("div", { text: s.text }))));
  add.addEventListener("click", () => attempt(async () => {
    await api("POST", `/api/projects/${encodeURIComponent(S.pid)}/moments/manual`, { i: Math.min(a, b), j: Math.max(a, b) });
    dlg.close(); toast("Clip adăugat."); route();
  }, add));
  openDialog("Clip manual din transcriere", [h("p", { class: "note", style: "margin-top:0", text: "Apasă pe prima și apoi pe ultima propoziție. Clipul păstrează propozițiile întregi." }), list],
    [info, h("span", { class: "spacer" }), h("button", { class: "btn", type: "button", onclick: () => dlg.close() }, "Renunță"), add], { wide: true });
  paint();
}

/* ------------------------------------------------------------------ pasul 4: export */
function viewExport(body) {
  const p = S.project;
  if (!p.steps.moments || !p.moments) { body.append(h("div", { class: "alert info" }, icon("info"), "Alege mai întâi momentele.")); return; }
  if (!S.settings) S.settings = { ...S.system.options.defaults, ...(p.render_settings || {}) };
  body.append(stepError("clips") || "");
  const settingsBox = h("section", { class: "card", id: "export-settings" });
  body.append(settingsBox, h("div", { id: "results-box" }));
  renderSettings();
  renderResults();
}

function renderSettings() {
  const box = document.getElementById("export-settings");
  if (!box) return;
  const p = S.project, o = S.system.options, st = S.settings;
  const set = (k, v) => { st[k] = v; renderSettings(); };
  const seg = (key, entries, label) => h("div", { class: "seg", role: "group", "aria-label": label },
    entries.map(([k, v]) => h("button", { type: "button", "aria-pressed": String(st[key] === k), onclick: () => set(key, k) }, v)));
  const sw = (key, title, sub) => {
    const cb = h("input", { type: "checkbox", id: `sw-${key}` }); cb.checked = !!st[key];
    cb.addEventListener("change", () => { st[key] = cb.checked; });
    return h("label", { class: "switch", for: `sw-${key}` }, h("span", { class: "switch-text" }, h("span", { text: title }), h("small", { text: sub })), cb);
  };
  const framing = h("select", { class: "select", "aria-label": "Încadrare" });
  for (const [k, v] of Object.entries(o.framings)) framing.append(h("option", { value: k, selected: st.framing === k }, v));
  framing.addEventListener("change", () => set("framing", framing.value));

  const styles = h("div", { class: "styles" });
  for (const [k, v] of Object.entries(o.styles)) {
    styles.append(h("button", { class: "style-card", type: "button", "aria-pressed": String(st.sub_style === k), onclick: () => set("sub_style", k) },
      h("div", { class: "style-sample" }, k === "fara" ? h("span", { class: "muted", text: "fără text" }) : capSample(k, 15)),
      h("span", { class: "style-name", text: v })));
  }
  const ms = p.moments.moments.filter((m) => m.selected !== false);
  const hasResults = Object.keys(p.results || {}).length > 0;
  const run_ = h("button", { class: "btn primary big", type: "button", id: "run-export", disabled: !ms.length || !!p.job || p.steps.confirmed },
    icon("scissors"), hasResults ? "Actualizează exportul" : `Exportă ${plural(ms.length, "clip", "clipuri")}`);
  run_.addEventListener("click", () => attempt(async () => {
    const r = await api("POST", `/api/projects/${encodeURIComponent(p.id)}/render`, { settings: st });
    S.project.job = r.job; startPoll(r.job.id); renderJob(r.job);
  }, run_));
  const subOpts = st.sub_style === "fara" ? null : h("div", { class: "row", style: "gap:22px" },
    h("div", { class: "field" }, h("span", { text: "Poziție" }), seg("sub_position", Object.entries(o.positions), "Poziția subtitrărilor")),
    h("div", { class: "field" }, h("span", { text: "Mărime" }), seg("sub_size", o.sizes.map((s) => [s, s[0].toUpperCase() + s.slice(1)]), "Mărimea subtitrărilor")));

  box.replaceChildren(h("div", { class: "export" },
    h("div", { class: "opts" },
      h("div", {}, h("h2", {}, "Setări export"), h("p", { class: "lead", style: "margin:0", text: "Previzualizarea din dreapta arată aproximativ cum vor arăta clipurile." })),
      h("div", {}, h("div", { class: "opt-title", text: "Format" }), seg("format", Object.entries(o.formats).map(([k, v]) => [k, v.split(" (")[0]]), "Format")),
      h("label", { class: "field" }, h("span", { text: "Încadrare" }), framing),
      h("div", {}, h("div", { class: "opt-title", text: "Subtitrări" }), styles),
      subOpts,
      h("div", {},
        sw("loudnorm", "Normalizează volumul", "Nivel constant (-14 LUFS), ca pe platformele de clipuri."),
        sw("cut_pauses", "Elimină pauzele lungi", "Taie tăcerile de peste 0,6 s dintre cuvinte; subtitrările rămân sincronizate."),
        sw("cover", "Generează copertă", "O imagine JPG din clip, pentru miniatura postării.")),
      p.steps.confirmed ? h("div", { class: "alert info" }, icon("info"), "Exportul a fost confirmat și sursa ștearsă. Pentru clipuri noi, importă din nou videoclipul.") : null,
      h("div", { class: "row" }, run_)),
    preview()));
}

function capSample(style, px, wordIdx = 1) {
  const words = ["Așa arată", "subtitrarea"];
  const cap = h("div", { class: `cap cap-${style}`, style: `position:static;font-size:${px}px` });
  if (style === "karaoke") { cap.append(words[0] + " ", h("b", { text: words[1] })); }
  else if (style === "cutie") cap.append(h("span", { text: words.join(" ") }));
  else cap.textContent = words.join(" ");
  return cap;
}

function preview() {
  const p = S.project, st = S.settings;
  const ratios = { "9:16": "9 / 16", "4:5": "4 / 5", "1:1": "1 / 1" };
  const first = p.moments.moments.find((m) => m.selected !== false) || p.moments.moments[0];
  const src = first ? `/media/${encodeURIComponent(p.id)}/thumb/${first.nr}.jpg?t=${(first.start + Math.min(1, first.duration / 2)).toFixed(2)}` : null;
  const frame = h("div", { class: "preview", style: `aspect-ratio:${ratios[st.format]}` });
  if (src) {
    if (st.framing === "blur") frame.append(h("div", { class: "bg", style: `background-image:url("${src}")` }), h("img", { class: "fg contain", src, alt: "" }));
    else frame.append(h("img", { class: "fg cover", src, alt: "" }));
  }
  if (st.sub_style !== "fara") {
    const firstCue = first && first.cues && first.cues[0] ? first.cues[0].text : "Așa arată subtitrarea";
    const words = firstCue.split(" ");
    const cap = h("div", { class: `cap cap-${st.sub_style}` });
    if (st.sub_style === "karaoke") words.forEach((w, i) => cap.append(i === 0 ? h("b", { text: w }) : w, i < words.length - 1 ? " " : ""));
    else if (st.sub_style === "cutie") cap.append(h("span", { text: firstCue }));
    else cap.textContent = firstCue;
    const sizes = { mic: 64, mediu: 80, mare: 96 };
    cap.style.fontSize = `${(sizes[st.sub_size] / 1080) * 100}cqw`;
    const tall = st.format !== "1:1";
    if (st.sub_position === "jos") cap.style.bottom = tall ? "20%" : "9%";
    else if (st.sub_position === "sus") cap.style.top = tall ? "11%" : "6%";
    else { cap.style.top = "50%"; cap.style.transform = "translateY(-50%)"; }
    frame.append(cap);
  }
  const note = st.framing === "auto" ? "Încadrarea automată se decide la export, pentru fiecare clip (față detectată sau fundal blurat)." : "";
  return h("div", { class: "preview-wrap" }, frame, note ? h("p", { class: "note muted", style: "margin:0;text-align:center", text: note }) : null);
}

function renderResults() {
  const box = document.getElementById("results-box");
  if (!box) return;
  const p = S.project, pid = encodeURIComponent(p.id);
  const results = p.results || {};
  const byNr = Object.fromEntries(p.moments.moments.map((m) => [m.nr, m]));
  const items = Object.values(results).filter((r) => byNr[r.nr]).sort((a, b) => byNr[a.nr].start - byNr[b.nr].start);
  if (!items.length) { box.replaceChildren(); return; }
  const openBtn = h("button", { class: "btn small", type: "button" }, icon("folder", 16), "Deschide folderul");
  openBtn.addEventListener("click", () => attempt(async () => {
    const r = await api("POST", `/api/projects/${pid}/open-folder`);
    if (!r.opened) toast(`Folderul: ${r.path}`, "info");
  }, openBtn));
  const confirmBtn = h("button", { class: "btn small", type: "button", disabled: !p.steps.clips || p.steps.confirmed || !!p.job }, icon("check", 16), "Confirmă exportul");
  confirmBtn.addEventListener("click", async () => {
    if (!(await confirmDialog("Confirmi exportul?", "Se șterg videoclipul sursă și fișierul audio din spațiul de lucru. Clipurile, coperțile, subtitrările, CSV-ul și transcrierea rămân. Nu vei mai putea reexporta din această sursă.", "Confirmă și șterge sursa"))) return;
    attempt(async () => { const r = await api("POST", `/api/projects/${pid}/confirm`); toast(`Șterse: ${r.removed.join(", ") || "nimic"}`); route(); });
  });
  const grid = h("div", { class: "results" });
  for (const r of items) {
    const m = byNr[r.nr], v = r.verify || {};
    const ratio = { "9:16": "9 / 16", "4:5": "4 / 5", "1:1": "1 / 1" }[r.format] || "9 / 16";
    const redo = h("button", { class: "btn small ghost", type: "button", title: "Refă doar acest clip", disabled: !p.source_available || !!p.job }, icon("refresh", 15), "Refă");
    redo.addEventListener("click", () => attempt(async () => {
      const res = await api("POST", `/api/projects/${pid}/render`, { settings: S.settings, only: r.nr });
      S.project.job = res.job; startPoll(res.job.id); renderJob(res.job);
    }, redo));
    const ver = Date.now();
    grid.append(h("article", { class: "result", id: `result-${r.nr}` },
      h("video", { src: `/media/${pid}/export/${r.file}?v=${ver}`, poster: r.cover ? `/media/${pid}/export/${r.cover}?v=${ver}` : null, controls: true, preload: "none", style: `aspect-ratio:${ratio}` }),
      h("div", { class: "result-body" },
        h("div", { class: "result-title", text: m.title }),
        h("div", { class: "chips" },
          h("span", { class: `chip ${v.ok ? "ok" : "bad"}`, text: v.ok ? "Verificat" : "Verificare eșuată" }),
          v.width ? h("span", { class: "chip", text: `${v.width}×${v.height}` }) : null,
          v.duration ? h("span", { class: "chip", text: `${v.duration.toFixed(1)} s` }) : null,
          v.size_mb ? h("span", { class: "chip", text: `${v.size_mb} MB` }) : null,
          r.duration_cut > 0.05 ? h("span", { class: "chip", text: `pauze scoase: ${r.duration_cut.toFixed(1)} s` }) : null,
          r.stale ? h("span", { class: "chip bad", text: "modificat după export" }) : null),
        !v.ok ? h("div", { class: "note", style: "color:var(--danger)", text: (v.problems || []).join(" ") }) : null,
        h("div", { class: "note muted", text: r.framing_detail }),
        h("div", { class: "result-actions" },
          h("a", { class: "btn small primary", href: `/media/${pid}/export/${r.file}?download=1` }, icon("download", 15), "MP4"),
          h("a", { class: "btn small", href: `/media/${pid}/export/${r.srt}?download=1` }, "SRT"),
          r.cover ? h("a", { class: "btn small", href: `/media/${pid}/export/${r.cover}?download=1` }, icon("image", 15), "Copertă") : null,
          h("button", { class: "btn small ghost", type: "button", onclick: () => copyText(m.title, "Titlul") }, icon("copy", 15), "Titlu"),
          h("button", { class: "btn small ghost", type: "button", onclick: () => copyText(`${m.description}${m.keywords && m.keywords.length ? "\n\n" + m.keywords.map((k) => "#" + k).join(" ") : ""}`, "Descrierea") }, icon("copy", 15), "Descriere"),
          redo))));
  }
  box.replaceChildren(
    h("div", { class: "results-head" }, h("h2", {}, "Clipuri exportate"), h("span", { class: "muted", text: p.out_dir }), h("span", { class: "spacer" }),
      h("a", { class: "btn small primary", href: `/api/projects/${pid}/export.zip` }, icon("download", 16), "Descarcă tot (ZIP)"),
      h("a", { class: "btn small", href: `/media/${pid}/export/clipuri.csv?download=1` }, icon("text", 16), "CSV"),
      openBtn, confirmBtn),
    grid);
}

/* ------------------------------------------------------------------ pornire */
function applyThemeButton() {
  const dark = document.documentElement.dataset.theme !== "light";
  const b = document.getElementById("theme-btn");
  b.replaceChildren(icon(dark ? "sun" : "moon"));
  b.setAttribute("aria-label", dark ? "Temă luminoasă" : "Temă întunecată");
  b.title = b.getAttribute("aria-label");
}

async function boot() {
  document.getElementById("new-project").addEventListener("click", () => go(null));
  document.getElementById("system-btn").addEventListener("click", showSystem);
  document.getElementById("theme-btn").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("clipper-theme", next); } catch (e) { /* stocare indisponibilă */ }
    applyThemeButton();
  });
  applyThemeButton();
  renderRail();
  try { S.system = await api("GET", "/api/system"); } catch (e) { toast(e.message, "error"); }
  renderSystemStatus();
  if (S.system && !S.system.ready) showSystem();
  await refreshProjects();
  route();
  // semnal de viață: când fereastra se închide, serverul local se oprește singur
  const beat = () => api("POST", "/api/heartbeat").catch(() => {});
  beat(); setInterval(beat, 20000);
  window.addEventListener("pagehide", () => { try { navigator.sendBeacon(`/api/bye?t=${encodeURIComponent(TOKEN)}`); } catch (e) { /* ignorăm */ } });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") beat(); });
}

if (!S.system) boot();
