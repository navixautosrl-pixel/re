"""AI Clipper local — interfața Streamlit (rulează doar pe calculatorul tău, 127.0.0.1)."""

from __future__ import annotations

from pathlib import Path

import streamlit as st

from clipper import pipeline, youtube
from clipper.config import (DEFAULT_WHISPER_MODEL, LANGUAGES, LONG_SOURCE_WARN_MINUTES, MAX_CLIP_SECONDS,
                            MAX_CLIPS, MAX_SOURCE_MINUTES, MIN_CLIP_SECONDS, MIN_CLIPS, OUTPUT_DIR, WHISPER_MODELS)
from clipper.moments import fmt_ts
from clipper.project import STEP_LABELS, STEPS, Project, list_projects
from clipper.tools import ToolError, open_folder, system_checks
from clipper.transcribe import transcript_to_text

st.set_page_config(page_title="AI Clipper local", page_icon="🎬", layout="wide")

FRAMING_OPTIONS = {
    "auto": "Automat: față detectată, altfel fundal blurat",
    "blur": "Fundal blurat (tot cadrul vizibil)",
    "center": "Decupaj vertical centrat",
}


# ---------------------------------------------------------------- utilitare UI

def progress_ui(label: str):
    bar = st.progress(0.0, text=label)

    def update(frac: float, msg: str) -> None:
        bar.progress(max(0.0, min(frac, 1.0)), text=msg[:160])
    return update, bar


def fmt_duration(sec: float | None) -> str:
    if not sec:
        return "necunoscută"
    return fmt_ts(sec) + (" (h:mm:ss)" if sec >= 3600 else " (mm:ss)")


def current_project() -> Project | None:
    pid = st.session_state.get("project_id")
    if not pid:
        return None
    return Project.load_or_create(pid)


def saved_error_slot(proj: Project, *steps: str):
    """Rezervă locul pentru eroarea din încercarea anterioară. Se completează doar dacă butonul
    etapei nu a fost apăsat acum (altfel s-ar afișa și eroarea veche, și cea nouă)."""
    slot = st.empty()

    def fill() -> None:
        errs = [e for s in steps if (e := (proj.state.get("errors") or {}).get(s))]
        if errs:
            slot.error(f"Ultima încercare a eșuat: {errs[-1]}\n\nFișierele intermediare au fost păstrate — "
                       "apasă din nou butonul pentru a relua.")
    return fill


# ---------------------------------------------------------------- bara laterală

with st.sidebar:
    st.header("Setări")
    model = st.selectbox("Model Whisper (local, CPU)", WHISPER_MODELS, index=WHISPER_MODELS.index(DEFAULT_WHISPER_MODEL),
                         help="base: mai rapid. small: mai precis, mai lent (~3x).")
    language = st.selectbox("Limba vorbită în videoclip", list(LANGUAGES), format_func=LANGUAGES.get,
                            help="Subtitrările sunt în limba vorbită. Pentru subtitrări în română, videoclipul "
                                 "trebuie să fie vorbit în română (nu se face traducere).")
    min_d, max_d = st.slider("Durata clipurilor (secunde)", MIN_CLIP_SECONDS, MAX_CLIP_SECONDS, (20, 45), step=1)
    count_max = st.slider("Număr maxim de clipuri", MIN_CLIPS, MAX_CLIPS, 8)
    framing = st.radio("Încadrare verticală", list(FRAMING_OPTIONS), format_func=FRAMING_OPTIONS.get)
    burn = st.checkbox("Integrează subtitrările în video", value=True,
                       help="Se creează oricum și fișiere .srt separate.")

    st.divider()
    with st.expander("Verificare sistem", expanded=False):
        checks = system_checks()
        for c in checks:
            icon = "✅" if c.ok else ("❌" if c.required else "⚠️")
            st.markdown(f"{icon} **{c.name}**  \n<small>{c.detail}</small>", unsafe_allow_html=True)
    missing = [c.name for c in checks if c.required and not c.ok]

    st.divider()
    st.subheader("Proiecte salvate")
    projects = list_projects()
    if projects:
        labels = {p.id: f"{p.title()[:40]} ({sum(p.done(s) for s in STEPS)}/{len(STEPS)} etape)" for p in projects}
        def open_project() -> None:
            if st.session_state.get("resume_pick"):
                st.session_state["project_id"] = st.session_state["resume_pick"]
            st.session_state["resume_pick"] = ""

        st.selectbox("Reia un proiect", [""] + list(labels), format_func=lambda k: labels.get(k, "—"),
                     key="resume_pick", on_change=open_project)
    else:
        st.caption("Niciun proiect încă.")
    if st.button("Proiect nou"):
        st.session_state.pop("project_id", None)
        st.session_state.pop("yt_info", None)
        st.rerun()


# ---------------------------------------------------------------- antet

st.title("🎬 AI Clipper local")
st.caption("Transformă un videoclip lung în clipuri verticale cu subtitrări. Totul rulează pe calculatorul tău, "
           "pe procesor — nimic nu este încărcat pe servicii externe și nimic nu este publicat automat.")

st.warning(
    "**Drepturi de autor.** Folosește doar materiale pe care ai dreptul să le descarci, să le editezi și să le "
    "publici (conținut propriu, licență explicită sau acordul titularului). Aplicația nu ocolește DRM, "
    "restricții de vârstă, conținut privat sau alte măsuri de protecție."
)
rights_ok = st.checkbox("Confirm că am dreptul să descarc, să editez și să public materialul pe care îl procesez.",
                        key="rights_ok")

if missing:
    st.error("Lipsesc componente obligatorii: " + ", ".join(missing) + ". Rulează **install.bat**, apoi repornește "
             "aplicația. Detalii în bara laterală → Verificare sistem.")
    st.stop()

proj = current_project()

# ---------------------------------------------------------------- 1. sursa

st.header("1. Sursa")
if proj is None:
    src_type = st.radio("De unde vine videoclipul?", ["YouTube", "Fișier de pe calculator"], horizontal=True)
    if src_type == "YouTube":
        url = st.text_input("Link YouTube", placeholder="https://www.youtube.com/watch?v=...")
        if st.button("Verifică linkul", type="primary", disabled=not url):
            if not youtube.extract_video_id(url):
                st.error("Link invalid. Folosește un link YouTube către un singur videoclip.")
            else:
                with st.spinner("Se citesc informațiile videoclipului (fără descărcare)…"):
                    try:
                        st.session_state["yt_info"] = youtube.fetch_info(url)
                    except ToolError as exc:
                        st.session_state.pop("yt_info", None)
                        st.error(str(exc))

        info = st.session_state.get("yt_info")
        if info:
            c1, c2 = st.columns([1, 2])
            with c1:
                if info.get("thumbnail"):
                    st.image(info["thumbnail"], width="stretch")
            with c2:
                st.subheader(info["title"])
                st.write(f"**Canal:** {info.get('channel') or '—'}")
                st.write(f"**Durată:** {fmt_duration(info.get('duration'))}")
                if info.get("upload_date"):
                    d = info["upload_date"]
                    st.write(f"**Publicat:** {d[6:8]}.{d[4:6]}.{d[0:4]}")
                if info.get("view_count") is not None:
                    st.write(f"**Vizualizări:** {info['view_count']:,}".replace(",", "."))
            problems = youtube.validate_info(info)
            for p in problems:
                st.error(p)
            if not problems:
                long_ok = True
                if info["duration"] > LONG_SOURCE_WARN_MINUTES * 60:
                    st.warning(f"Videoclip lung ({info['duration']/60:.0f} min). Pe un procesor obișnuit, transcrierea "
                               "poate dura de la câteva minute până la peste o oră, în funcție de model.")
                    long_ok = st.checkbox("Înțeleg și vreau să continui cu un material lung.")
                confirm = st.checkbox("Confirm descărcarea acestui videoclip (max. 720p) pe calculatorul meu.")
                if st.button("Descarcă videoclipul", type="primary",
                             disabled=not (confirm and long_ok and rights_ok)):
                    p = pipeline.project_for_youtube(info)
                    st.session_state["project_id"] = p.id
                    upd, _ = progress_ui("Pornire descărcare…")
                    try:
                        pipeline.step_download(p, upd)
                        st.success("Videoclip importat.")
                    except ToolError as exc:
                        st.error(str(exc))
                    st.rerun()
                if not rights_ok:
                    st.caption("Bifează confirmarea privind drepturile (mai sus) pentru a putea descărca.")
    else:
        path_txt = st.text_input("Calea completă către fișierul video",
                                 placeholder=r"C:\Users\Nume\Videos\interviu.mp4")
        if st.button("Importă fișierul", type="primary", disabled=not (path_txt and rights_ok)):
            try:
                p = pipeline.project_for_local_file(Path(path_txt.strip().strip('"')))
                st.session_state["project_id"] = p.id
                upd, _ = progress_ui("Import…")
                pipeline.step_download(p, upd)
                st.rerun()
            except ToolError as exc:
                st.error(str(exc))
        if not rights_ok:
            st.caption("Bifează confirmarea privind drepturile (mai sus) pentru a putea importa.")
    st.stop()

# proiect activ
info = proj.state.get("info", {})
st.markdown(f"**{proj.title()}** — durată {fmt_duration(info.get('duration'))}  \n"
            f"<small>Proiect: `{proj.id}`, fișiere intermediare în `{proj.dir}`</small>", unsafe_allow_html=True)
st.markdown(" ".join(f"{'✅' if proj.done(s) else '⬜'} {STEP_LABELS[s]}" for s in STEPS))

if not proj.done("download"):
    show_err = saved_error_slot(proj, "download")
    if not st.button("Reia importul", type="primary", disabled=not rights_ok):
        show_err()
    else:
        upd, _ = progress_ui("Import…")
        try:
            pipeline.step_download(proj, upd)
        except ToolError as exc:
            st.error(str(exc))
        st.rerun()
    st.stop()

src = proj.source_path
if src and src.exists():
    with st.expander("Previzualizare sursă"):
        st.video(str(src))

# ---------------------------------------------------------------- 2. transcriere

st.header("2. Transcriere locală")
if not proj.done("transcript"):
    show_err = saved_error_slot(proj, "audio", "transcript")
    if proj.partial_transcript_path.exists():
        st.info("Există o transcriere parțială salvată — va fi continuată de unde a rămas "
                "(dacă modelul și limba sunt aceleași).")
    if not st.button(f"Extrage audio și transcrie (model {model}, {LANGUAGES[language]})", type="primary"):
        show_err()
    else:
        try:
            if not proj.done("audio"):
                upd, _ = progress_ui("Extragere audio…")
                pipeline.step_audio(proj, upd)
            upd, _ = progress_ui("Transcriere…")
            pipeline.step_transcribe(proj, model, language, upd)
            st.rerun()
        except ToolError as exc:
            st.error(str(exc))
    st.stop()

tm = proj.state.get("transcript_meta", {})
lang_note = f"limba: {tm.get('language')}"
if tm.get("language_probability"):
    lang_note += f" (probabilitate {tm['language_probability']:.0%})"
st.success(f"Transcriere finalizată cu modelul {tm.get('model')} — {tm.get('segments')} segmente, {lang_note}.")
if tm.get("language") not in (None, "ro") and language in ("ro", "auto"):
    st.warning("Limba detectată nu este româna: subtitrările vor fi în limba vorbită, nu traduse.")
transcript = pipeline.load_transcript(proj)
with st.expander("Vezi transcrierea completă"):
    st.text(transcript_to_text(transcript))
c1, c2 = st.columns(2)
c1.download_button("Descarcă transcrierea (.txt)", transcript_to_text(transcript).encode("utf-8"),
                   file_name=f"{proj.id}_transcriere.txt")
if c2.button("Refă transcrierea (alt model/limbă)"):
    proj.transcript_path.unlink(missing_ok=True)
    proj.partial_transcript_path.unlink(missing_ok=True)
    proj.mark("transcript", False)
    st.rerun()

# ---------------------------------------------------------------- 3. momente

st.header("3. Momente candidate")
show_err = saved_error_slot(proj, "moments")
if not st.button(f"{'Recalculează' if proj.done('moments') else 'Găsește'} momentele ({min_d}–{max_d}s, max. {count_max})",
                 type="secondary" if proj.done("moments") else "primary"):
    show_err()
else:
    try:
        pipeline.step_moments(proj, min_d, max_d, count_max)
        st.rerun()
    except ToolError as exc:
        st.error(str(exc))
if not proj.done("moments"):
    st.stop()

mdata = pipeline.load_moments(proj)
if mdata.get("note"):
    st.warning(mdata["note"])
if not mdata["moments"]:
    st.stop()
st.caption(f"{len(mdata['moments'])} momente alese din {mdata['candidates_total']} ferestre candidate "
           f"({mdata.get('sentences')} propoziții). Fiecare moment începe și se termină la granița unei propoziții. "
           "Titlurile și descrierile sunt extrase din replicile reale — verifică-le și editează-le înainte de publicare.")

rows = [{"Export": m.get("selected", True), "Nr": m["nr"], "Start": fmt_ts(m["start"]), "Sfârșit": fmt_ts(m["end"]),
         "Durată (s)": m["duration"], "Scor": m["score"], "Titlu sugerat": m["title"], "Text": m["text"]}
        for m in mdata["moments"]]
edited = st.data_editor(
    rows, hide_index=True, width="stretch", key=f"editor_{proj.id}_{len(rows)}_{mdata['moments'][0]['start']}",
    disabled=["Nr", "Start", "Sfârșit", "Durată (s)", "Scor", "Text"],
    column_config={"Text": st.column_config.TextColumn(width="large"),
                   "Titlu sugerat": st.column_config.TextColumn(width="medium", max_chars=100)},
)
changed = False
for m, row in zip(mdata["moments"], edited):
    title = (row["Titlu sugerat"] or "").strip() or m["title"]
    if m.get("selected", True) != row["Export"] or m["title"] != title:
        m["selected"], m["title"] = bool(row["Export"]), title
        changed = True
if changed:
    pipeline.save_moments(proj, mdata)

with st.expander("De ce au fost alese aceste momente?"):
    for m in mdata["moments"]:
        parts = ", ".join(f"{k} {v:.2f}" for k, v in m["parts"].items())
        st.markdown(f"**{m['nr']}.** scor {m['score']} — {parts}")

# ---------------------------------------------------------------- 4. export

st.header("4. Clipuri verticale 1080 × 1920")
n_sel = sum(1 for m in mdata["moments"] if m.get("selected", True))
show_err = saved_error_slot(proj, "clips")
if not st.button(f"Generează {n_sel} clipuri", type="primary", disabled=n_sel == 0 or proj.done("confirmed")):
    show_err()
else:
    upd, _ = progress_ui("Randare…")
    try:
        pipeline.step_render(proj, framing, burn, upd)
        st.rerun()
    except ToolError as exc:
        st.error(str(exc))
if proj.done("confirmed"):
    st.info("Exportul a fost confirmat și fișierele intermediare au fost șterse. Pentru clipuri noi, importă din nou sursa.")

results = proj.state.get("render_results") or {}
if results:
    out = proj.out_dir
    csv_path = out / "clipuri.csv"
    c1, c2 = st.columns(2)
    if csv_path.exists():
        c1.download_button("Descarcă CSV (timpi, titluri, descrieri)", csv_path.read_bytes(),
                           file_name=f"{proj.id}_clipuri.csv", mime="text/csv")
    if c2.button("Deschide folderul cu clipuri"):
        if not open_folder(out):
            st.info(f"Folderul este: {out}")
    st.caption(f"Folder export: `{out}`")

    by_nr = {m["nr"]: m for m in mdata["moments"]}
    items = sorted(results.values(), key=lambda r: r["nr"])
    cols = st.columns(3)
    for k, r in enumerate(items):
        m = by_nr.get(r["nr"])
        mp4 = out / r["file"]
        with cols[k % 3]:
            st.markdown(f"**{r['nr']}. {m['title'] if m else ''}**")
            if mp4.exists():
                st.video(str(mp4))
            v = r["verify"]
            if v["ok"]:
                st.caption(f"✅ Verificat: {v['width']}×{v['height']}, {v['duration']:.1f}s, {v['size_mb']} MB")
            else:
                st.error("Verificare eșuată: " + "; ".join(v["problems"]))
            st.caption(f"Încadrare: {r['framing_detail']}")
            if m:
                with st.popover("Descriere sugerată"):
                    st.write(m["description"])
                    if m.get("keywords"):
                        st.caption("Cuvinte-cheie din transcriere: " + ", ".join(m["keywords"]))
            b1, b2 = st.columns(2)
            if mp4.exists():
                b1.download_button("MP4", mp4.read_bytes(), file_name=f"{proj.id}_{r['file']}",
                                   mime="video/mp4", key=f"dl_mp4_{r['nr']}")
            srt = out / r["srt"]
            if srt.exists():
                b2.download_button("SRT", srt.read_bytes(), file_name=f"{proj.id}_{r['srt']}",
                                   mime="text/plain", key=f"dl_srt_{r['nr']}")

    if proj.done("clips") and not proj.done("confirmed"):
        st.divider()
        st.subheader("5. Confirmă exportul")
        st.write("După ce ai verificat clipurile, poți șterge fișierele intermediare (video sursă, audio). "
                 "Clipurile, CSV-ul și transcrierea rămân.")
        if st.checkbox("Am verificat clipurile exportate."):
            if st.button("Confirm exportul și șterg fișierele intermediare"):
                removed = pipeline.step_confirm(proj)
                st.success("Șterse: " + (", ".join(removed) or "nimic"))
                st.rerun()

st.divider()
st.caption(f"Limite: sursă de maximum {MAX_SOURCE_MINUTES} de minute, clipuri de {MIN_CLIP_SECONDS}–{MAX_CLIP_SECONDS} "
           f"secunde. Exportul se salvează în {OUTPUT_DIR}")
