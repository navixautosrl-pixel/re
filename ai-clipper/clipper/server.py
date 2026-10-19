"""Serverul local al interfeței (FastAPI), ascultă doar pe 127.0.0.1.

Protecții, deși serverul nu e accesibil din rețea:
* antetul Host trebuie să fie 127.0.0.1/localhost (blochează atacurile de tip DNS rebinding);
* orice modificare (POST/PUT/DELETE) cere token-ul generat la pornire și injectat doar în
  pagina aplicației, deci alte site-uri deschise în browser nu pot comanda aplicația;
* fișierele media se servesc doar din folderele proiectului, după nume validate.
"""

from __future__ import annotations

import logging
import re
import shutil
import tempfile
import threading
import time
import uuid
import zipfile
from pathlib import Path

from fastapi import Body, FastAPI, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, PlainTextResponse, Response
from starlette.background import BackgroundTask

from . import __version__, editing, pipeline, render, youtube
from .config import (DATA_DIR, LANGUAGES, LONG_SOURCE_WARN_MINUTES, MAX_CLIP_SECONDS, MAX_CLIPS,
                     MAX_SOURCE_MINUTES, MIN_CLIP_SECONDS, MIN_CLIPS, OUTPUT_DIR, UPLOADS_DIR,
                     WHISPER_MODELS)
from .jobs import JobManager
from .project import STEP_LABELS, STEPS, Project, list_projects
from .subtitles import POSITIONS, SIZES, STYLES
from .tools import ToolError, ffmpeg_path, open_folder, run, system_checks
from .transcribe import transcript_to_text

log = logging.getLogger("clipper")
WEB_DIR = Path(__file__).resolve().parent / "web"
PROJECT_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,120}$")
MEDIA_NAME_RE = re.compile(r"^clip_\d{2}\.(mp4|srt|jpg)$|^clipuri\.csv$")
VIDEO_EXT = {".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v", ".mpg", ".mpeg", ".wmv", ".flv", ".ts"}
MAX_UPLOAD_BYTES = 8 * 1024**3


class Heartbeat:
    def __init__(self) -> None:
        self.last = time.time()
        self.seen = False
        self.bye_at: float | None = None

    def beat(self) -> None:
        self.last, self.seen, self.bye_at = time.time(), True, None


def create_app(token: str, jobs: JobManager | None = None, heartbeat: Heartbeat | None = None) -> FastAPI:
    app = FastAPI(title="AI Clipper", docs_url=None, redoc_url=None, openapi_url=None)
    jobs = jobs or JobManager()
    hb = heartbeat or Heartbeat()
    app.state.jobs, app.state.heartbeat, app.state.token = jobs, hb, token

    # ---------------------------------------------------------------- securitate
    @app.middleware("http")
    async def guard(request: Request, call_next):
        host = (request.headers.get("host") or "").split(":")[0].lower()
        if host not in ("127.0.0.1", "localhost"):
            return PlainTextResponse("Host nepermis.", status_code=403)
        path = request.url.path
        if path.startswith("/api/") and request.method not in ("GET", "HEAD", "OPTIONS") and path != "/api/bye":
            if request.headers.get("x-clipper-token") != token:
                return JSONResponse({"error": "Token lipsă sau invalid."}, status_code=403)
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Cache-Control", "no-store")
        return response

    @app.exception_handler(ToolError)
    async def tool_error(_: Request, exc: ToolError):
        return JSONResponse({"error": str(exc)}, status_code=400)

    def project_or_404(pid: str) -> Project:
        if not PROJECT_ID_RE.match(pid):
            raise HTTPException(404, "Proiect inexistent.")
        proj = Project(pid)
        if not proj.state_file.exists():
            raise HTTPException(404, "Proiect inexistent.")
        return Project.load_or_create(pid)

    # ---------------------------------------------------------------- pagina
    @app.get("/", response_class=HTMLResponse)
    def index():
        html = (WEB_DIR / "index.html").read_text(encoding="utf-8")
        return HTMLResponse(html.replace("__CLIPPER_TOKEN__", token).replace("__VERSION__", __version__))

    @app.get("/static/{name}")
    def static(name: str):
        if not re.match(r"^[a-z0-9_-]+\.(css|js|svg|ico|png)$", name):
            raise HTTPException(404)
        path = WEB_DIR / name
        if not path.is_file():
            raise HTTPException(404)
        return FileResponse(path)

    # ---------------------------------------------------------------- sistem
    @app.get("/api/ping")
    def ping():
        return {"app": "ai-clipper", "version": __version__}

    @app.post("/api/heartbeat")
    def heartbeat_():
        hb.beat()
        return {"ok": True}

    @app.post("/api/bye")
    def bye(t: str = ""):
        # trimis cu navigator.sendBeacon la închiderea ferestrei (nu poate trimite antete)
        if t == token:
            hb.bye_at = time.time()
        return {"ok": True}

    @app.get("/api/system")
    def system():
        checks = system_checks()
        return {
            "version": __version__,
            "checks": [{"name": c.name, "ok": c.ok, "detail": c.detail, "required": c.required} for c in checks],
            "ready": all(c.ok for c in checks if c.required),
            "options": {
                "models": list(WHISPER_MODELS), "languages": LANGUAGES,
                "formats": {k: v[2] for k, v in render.FORMATS.items()}, "framings": render.FRAMINGS,
                "styles": STYLES, "positions": POSITIONS, "sizes": list(SIZES),
                "defaults": render.DEFAULT_SETTINGS,
                "limits": {"min_clip": MIN_CLIP_SECONDS, "max_clip": MAX_CLIP_SECONDS, "min_clips": MIN_CLIPS,
                           "max_clips": MAX_CLIPS, "max_source_minutes": MAX_SOURCE_MINUTES,
                           "long_warn_minutes": LONG_SOURCE_WARN_MINUTES},
            },
            "paths": {"output": str(OUTPUT_DIR), "data": str(DATA_DIR)},
            "busy": jobs.busy(),
        }

    # ---------------------------------------------------------------- proiecte
    def summary(p: Project) -> dict:
        info = p.state.get("info") or {}
        results = p.state.get("render_results") or {}
        job = jobs.active_for(p.id)
        return {
            "id": p.id, "title": p.title(), "source_type": p.state.get("source_type"),
            "duration": info.get("duration"), "created": p.state.get("created"),
            "steps": {s: p.done(s) for s in STEPS}, "clips": len(results),
            "job": job.public() if job else None,
        }

    @app.get("/api/projects")
    def projects():
        return {"projects": [summary(p) for p in list_projects()]}

    @app.get("/api/projects/{pid}")
    def project(pid: str):
        p = project_or_404(pid)
        data = summary(p)
        moments = None
        if p.done("moments") and p.moments_path.exists():
            moments = pipeline.load_moments(p)
        last = jobs.last_for(p.id)
        src = p.source_path
        results = p.state.get("render_results") or {}
        if moments and results:
            # clipurile modificate (interval, subtitrări) după ultimul export
            current = render.normalize_settings(p.state.get("render_settings"))
            by_nr = {m["nr"]: m for m in moments["moments"]}
            for nr, r in results.items():
                m = by_nr.get(int(nr))
                r["stale"] = bool(m) and r.get("signature") != render.clip_signature(m, current)
        data.update({
            "info": p.state.get("info"),
            "errors": p.state.get("errors") or {},
            "step_labels": STEP_LABELS,
            "transcript_meta": p.state.get("transcript_meta"),
            "moments": moments,
            "results": results,
            "render_settings": p.state.get("render_settings") or render.DEFAULT_SETTINGS,
            "source_available": bool(src and src.exists()),
            "source_media": p.state.get("source_media"),
            "out_dir": str(p.out_dir),
            "last_job": last.public() if last else None,
        })
        return data

    @app.delete("/api/projects/{pid}")
    def delete_project(pid: str, exports: bool = False):
        p = project_or_404(pid)
        if jobs.active_for(p.id):
            raise ToolError("Proiectul are o lucrare în curs; anuleaz-o mai întâi.")
        shutil.rmtree(p.dir, ignore_errors=True)
        if exports:
            shutil.rmtree(p.out_dir, ignore_errors=True)
        return {"ok": True}

    # ---------------------------------------------------------------- surse
    @app.post("/api/youtube/info")
    def youtube_info(data: dict = Body(default_factory=dict)):
        info = youtube.fetch_info(str(data.get("url", "")))
        return {"info": info, "problems": youtube.validate_info(info)}

    @app.post("/api/projects/youtube")
    def create_youtube(data: dict = Body(default_factory=dict)):
        if not data.get("rights_confirmed"):
            raise ToolError("Confirmă că ai dreptul să descarci și să folosești materialul.")
        # metadatele se citesc din nou pe server: nu ne bazăm pe ce trimite pagina
        info = youtube.fetch_info(str(data.get("url", "")))
        problems = youtube.validate_info(info)
        if problems:
            raise ToolError(" ".join(problems))
        p = pipeline.project_for_youtube(info)
        job = jobs.submit(p.id, "download", lambda prog: pipeline.step_download(p, prog))
        return {"project": p.id, "job": job.public()}

    @app.post("/api/upload")
    async def upload(request: Request, name: str = "video.mp4", rights: str = ""):
        if rights != "1":
            raise ToolError("Confirmă că ai dreptul să folosești materialul.")
        original = Path(name).name
        ext = Path(original).suffix.lower()
        if ext not in VIDEO_EXT:
            raise ToolError(f"Format nesuportat ({ext or 'fără extensie'}). Folosește un fișier video (MP4, MOV, MKV…).")
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        dest = UPLOADS_DIR / f"{uuid.uuid4().hex[:10]}{ext}"
        size = 0
        try:
            with dest.open("wb") as fh:
                async for chunk in request.stream():
                    size += len(chunk)
                    if size > MAX_UPLOAD_BYTES:
                        raise ToolError("Fișierul depășește 8 GB.")
                    fh.write(chunk)
            if size == 0:
                raise ToolError("Fișierul este gol.")
            title = Path(original).stem[:120] or "Video"
            p = await run_in_threadpool(pipeline.project_for_local_file, dest, title)
            p.state["info"]["webpage_url"] = original  # în CSV: numele fișierului, nu calea internă
            p.save()
        except BaseException:
            dest.unlink(missing_ok=True)
            raise
        job = jobs.submit(p.id, "download", lambda prog: pipeline.step_download(p, prog))
        return {"project": p.id, "job": job.public()}

    @app.post("/api/projects/{pid}/import")
    def reimport(pid: str):
        p = project_or_404(pid)
        if p.done("download"):
            raise ToolError("Videoclipul este deja importat.")
        job = jobs.submit(p.id, "download", lambda prog: pipeline.step_download(p, prog))
        return {"job": job.public()}

    # ---------------------------------------------------------------- etape
    @app.post("/api/projects/{pid}/transcribe")
    def transcribe_(pid: str, data: dict = Body(default_factory=dict)):
        p = project_or_404(pid)
        model = data.get("model", "base")
        language = data.get("language", "ro")
        if model not in WHISPER_MODELS or language not in LANGUAGES:
            raise ToolError("Model sau limbă necunoscută.")
        if not p.done("download"):
            raise ToolError("Videoclipul nu a fost importat încă.")

        def work(prog):
            if not p.done("audio") or not p.audio_path.exists():
                pipeline.step_audio(p, lambda f, m: prog(f * 0.08, m))
            pipeline.step_transcribe(p, model, language, lambda f, m: prog(0.08 + f * 0.92, m))
        if data.get("redo"):
            p.transcript_path.unlink(missing_ok=True)
            p.partial_transcript_path.unlink(missing_ok=True)
            p.mark("transcript", False)
        job = jobs.submit(p.id, "transcribe", work)
        return {"job": job.public()}

    @app.get("/api/projects/{pid}/transcript")
    def transcript(pid: str):
        p = project_or_404(pid)
        if not p.transcript_path.exists():
            raise HTTPException(404, "Transcrierea nu există încă.")
        return {"sentences": editing.sentence_list(pipeline.load_transcript(p))}

    @app.get("/api/projects/{pid}/transcript.txt")
    def transcript_txt(pid: str):
        p = project_or_404(pid)
        if not p.transcript_path.exists():
            raise HTTPException(404)
        text = transcript_to_text(pipeline.load_transcript(p))
        return Response(text, media_type="text/plain; charset=utf-8",
                        headers={"Content-Disposition": f'attachment; filename="{p.id}_transcriere.txt"'})

    @app.post("/api/projects/{pid}/moments")
    def moments(pid: str, data: dict = Body(default_factory=dict)):
        p = project_or_404(pid)
        try:
            min_d = float(data.get("min", 20))
            max_d = float(data.get("max", 45))
            count = int(data.get("count", 8))
        except (TypeError, ValueError):
            raise ToolError("Valori numerice invalide.")
        if not (MIN_CLIP_SECONDS <= min_d < max_d <= MAX_CLIP_SECONDS) or not (MIN_CLIPS <= count <= MAX_CLIPS):
            raise ToolError(f"Durata trebuie să fie între {MIN_CLIP_SECONDS} și {MAX_CLIP_SECONDS} s, "
                            f"iar numărul de clipuri între {MIN_CLIPS} și {MAX_CLIPS}.")
        if jobs.active_for(p.id):
            raise ToolError("Așteaptă terminarea lucrării în curs.")
        if not p.done("transcript"):
            raise ToolError("Transcrierea nu este gata.")
        return pipeline.step_moments(p, min_d, max_d, count)

    edit_lock = threading.Lock()

    def edit_moments(p: Project, fn):
        with edit_lock:  # citire-modificare-scriere: o singură editare odată
            if jobs.active_for(p.id):
                raise ToolError("Așteaptă terminarea lucrării în curs.")
            data = pipeline.load_moments(p)
            result = fn(data)
            pipeline.save_moments(p, data)
            return result if result is not None else data

    @app.put("/api/projects/{pid}/moments/{nr}")
    def update_moment(pid: str, nr: int, patch: dict = Body(default_factory=dict)):
        p = project_or_404(pid)

        def apply(data):
            m = pipeline.find_moment(data, nr)
            if "selected" in patch:
                m["selected"] = bool(patch["selected"])
            if "title" in patch:
                title = " ".join(str(patch["title"]).split())[:120]
                if not title:
                    raise ToolError("Titlul nu poate fi gol.")
                m["title"], m["title_edited"] = title, True
            if "description" in patch:
                m["description"] = str(patch["description"]).strip()[:2000]
            if "cue" in patch:
                cue = patch["cue"]
                editing.edit_cue(m, int(cue.get("index", -1)), str(cue.get("text", "")))
            return m
        return edit_moments(p, apply)

    @app.post("/api/projects/{pid}/moments/{nr}/adjust")
    def adjust_moment(pid: str, nr: int, data_in: dict = Body(default_factory=dict)):
        p = project_or_404(pid)
        edge, delta = data_in.get("edge"), int(data_in.get("delta", 0))
        if delta not in (-1, 1):
            raise ToolError("Pasul trebuie să fie de o propoziție.")
        transcript = pipeline.load_transcript(p)

        def apply(data):
            idx = next((k for k, m in enumerate(data["moments"]) if m["nr"] == nr), None)
            if idx is None:
                raise ToolError(f"Clipul {nr} nu există.")
            data["moments"][idx] = editing.adjust(data["moments"][idx], transcript, p.title(), edge, delta)
            return data["moments"][idx]
        return edit_moments(p, apply)

    @app.post("/api/projects/{pid}/moments/manual")
    def manual_moment(pid: str, data_in: dict = Body(default_factory=dict)):
        p = project_or_404(pid)
        transcript = pipeline.load_transcript(p)

        def apply(data):
            nr = max((m["nr"] for m in data["moments"]), default=0) + 1
            if nr > 99:
                raise ToolError("Prea multe clipuri într-un proiect.")
            m = editing.manual(transcript, p.title(), int(data_in.get("i", 0)), int(data_in.get("j", 0)), nr)
            data["moments"].append(m)
            return m
        return edit_moments(p, apply)

    @app.delete("/api/projects/{pid}/moments/{nr}")
    def delete_moment(pid: str, nr: int):
        p = project_or_404(pid)

        def apply(data):
            pipeline.find_moment(data, nr)
            data["moments"] = [m for m in data["moments"] if m["nr"] != nr]
            return {"ok": True}
        return edit_moments(p, apply)

    @app.post("/api/projects/{pid}/render")
    def render_(pid: str, data: dict = Body(default_factory=dict)):
        p = project_or_404(pid)
        settings = render.normalize_settings(data.get("settings"))
        only = data.get("only")
        only = int(only) if only is not None else None
        if not p.done("moments"):
            raise ToolError("Alege mai întâi momentele.")
        p.state["render_settings"] = settings
        p.save()
        job = jobs.submit(p.id, "render", lambda prog: pipeline.step_render(p, settings, prog, only=only))
        return {"job": job.public()}

    @app.post("/api/projects/{pid}/confirm")
    def confirm(pid: str):
        p = project_or_404(pid)
        if jobs.active_for(p.id):
            raise ToolError("Așteaptă terminarea lucrării în curs.")
        if not p.done("clips"):
            raise ToolError("Exportul nu este complet.")
        return {"removed": pipeline.step_confirm(p)}

    @app.post("/api/projects/{pid}/open-folder")
    def open_dir(pid: str):
        p = project_or_404(pid)
        target = p.out_dir if p.out_dir.exists() else OUTPUT_DIR
        target.mkdir(parents=True, exist_ok=True)
        return {"opened": open_folder(target), "path": str(target)}

    # ---------------------------------------------------------------- lucrări
    @app.get("/api/jobs/{job_id}")
    def job(job_id: str):
        j = jobs.get(job_id)
        if not j:
            raise HTTPException(404, "Lucrare inexistentă.")
        return j.public()

    @app.post("/api/jobs/{job_id}/cancel")
    def cancel(job_id: str):
        return jobs.cancel(job_id).public()

    # ---------------------------------------------------------------- media
    @app.get("/media/{pid}/source")
    def source_media(pid: str):
        p = project_or_404(pid)
        src = p.source_path
        if not src or not src.exists():
            raise HTTPException(404)
        return FileResponse(src, media_type="video/mp4")

    @app.get("/media/{pid}/thumb/{nr}.jpg")
    def thumb(pid: str, nr: int, t: float = 0.0):
        """Cadru din sursă pentru lista de momente (generat o singură dată, păstrat în cache)."""
        p = project_or_404(pid)
        src = p.source_path
        t = max(0.0, float(t))
        cache = p.dir / "thumbs" / f"{t:.2f}.jpg"
        if not cache.exists():
            if not src or not src.exists():  # după confirmarea exportului rămân doar miniaturile din cache
                raise HTTPException(404)
            cache.parent.mkdir(parents=True, exist_ok=True)
            res = run([ffmpeg_path(), "-hide_banner", "-y", "-ss", f"{t:.2f}", "-i", str(src), "-frames:v", "1",
                       "-vf", "scale=480:-2", "-q:v", "4", str(cache)], timeout=60)
            if res.returncode != 0 or not cache.exists():
                raise HTTPException(404)
        return FileResponse(cache, media_type="image/jpeg", headers={"Cache-Control": "max-age=3600"})

    @app.get("/media/{pid}/export/{name}")
    def export_file(pid: str, name: str, download: int = 0):
        p = project_or_404(pid)
        if not MEDIA_NAME_RE.match(name):
            raise HTTPException(404)
        path = p.out_dir / name
        if not path.is_file():
            raise HTTPException(404)
        headers = {"Content-Disposition": f'attachment; filename="{p.id}_{name}"'} if download else {}
        return FileResponse(path, headers=headers)

    @app.get("/api/projects/{pid}/export.zip")
    def export_zip(pid: str):
        p = project_or_404(pid)
        files = [f for f in sorted(p.out_dir.glob("*")) if f.is_file() and MEDIA_NAME_RE.match(f.name)]
        if not files:
            raise HTTPException(404, "Nu există fișiere exportate.")
        tmp_dir = DATA_DIR / "tmp"
        tmp_dir.mkdir(parents=True, exist_ok=True)
        fd, tmp_name = tempfile.mkstemp(suffix=".zip", dir=tmp_dir)
        tmp = Path(tmp_name)
        with open(fd, "wb") as fh, zipfile.ZipFile(fh, "w") as z:
            for f in files:
                # MP4/JPG sunt deja comprimate: stocare simplă, mult mai rapid
                z.write(f, f.name, compress_type=zipfile.ZIP_DEFLATED if f.suffix in (".srt", ".csv") else zipfile.ZIP_STORED)
        return FileResponse(tmp, media_type="application/zip", filename=f"{p.id}_clipuri.zip",
                            background=BackgroundTask(lambda: tmp.unlink(missing_ok=True)))

    return app


def idle_watchdog(server, jobs: JobManager, hb: Heartbeat, idle_seconds: float = 150, bye_grace: float = 8) -> None:
    """Oprește serverul când fereastra aplicației a fost închisă (nu mai trimite semnal de viață)
    și nu rulează nicio lucrare."""
    def loop():
        while not server.should_exit:
            time.sleep(2)
            if not hb.seen or jobs.busy():
                continue
            now = time.time()
            if (hb.bye_at and now - hb.bye_at > bye_grace) or now - hb.last > idle_seconds:
                log.info("Fereastra a fost închisă; opresc serverul.")
                server.should_exit = True
    threading.Thread(target=loop, name="clipper-watchdog", daemon=True).start()
