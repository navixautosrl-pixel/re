"""Etapele procesării, rulate secvențial. Fiecare etapă își salvează rezultatul pe disc și
poate fi reluată independent; o etapă deja finalizată nu se reface decât la cerere."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Callable

from . import moments as moments_mod
from . import render, transcribe, youtube
from .config import MAX_SOURCE_MINUTES
from .project import Project, id_for_local_file, safe_id
from .tools import ToolError, probe

Progress = Callable[[float, str], None]


def _guard(project: Project, step: str, fn):
    """Rulează o etapă: șterge eroarea veche, salvează eroarea nouă (pentru reluare) și o propagă."""
    project.set_error(step, None)
    project.mark(step, False)  # rezultatele etapelor ulterioare nu mai sunt valabile
    try:
        result = fn()
    except ToolError as exc:
        project.set_error(step, str(exc))
        raise
    except Exception as exc:  # orice eroare neprevăzută devine mesaj afișabil, starea rămâne reluabilă
        project.set_error(step, f"Eroare neașteptată: {exc}")
        raise ToolError(f"Eroare neașteptată în etapa „{step}”: {exc}") from exc
    project.mark(step)
    return result


def project_for_youtube(info: dict) -> Project:
    proj = Project.load_or_create(safe_id(f"yt_{info['id']}"))
    proj.state["source_type"] = "youtube"
    proj.state["info"] = info
    proj.save()
    proj.mark("info")
    return proj


def project_for_local_file(path: Path) -> Project:
    path = path.expanduser()
    if not path.is_file():
        raise ToolError(f"Fișierul nu există: {path}")
    info = probe(path)
    if not info.has_video:
        raise ToolError("Fișierul nu conține video.")
    if info.duration > MAX_SOURCE_MINUTES * 60:
        raise ToolError(f"Fișierul are {info.duration/60:.0f} minute. Limita este de {MAX_SOURCE_MINUTES} de minute.")
    proj = Project.load_or_create(id_for_local_file(path))
    proj.state["source_type"] = "local"
    proj.state["info"] = {"id": proj.id, "title": path.stem, "channel": "", "duration": info.duration,
                          "webpage_url": str(path), "original_path": str(path)}
    proj.save()
    proj.mark("info")
    return proj


def step_download(project: Project, progress: Progress | None = None) -> Path:
    def run() -> Path:
        if project.state.get("source_type") == "local":
            # copiem în workspace ca să nu depindem de fișierul original și ca ștergerea să fie sigură
            src = Path(project.state["info"]["original_path"])
            dest = project.dir / f"source{src.suffix.lower() or '.mp4'}"
            if not dest.exists() or dest.stat().st_size != src.stat().st_size:
                if progress:
                    progress(0.1, "Se copiază fișierul local în spațiul de lucru…")
                shutil.copy2(src, dest)
            path = dest
        else:
            path = youtube.download(project.state["info"]["webpage_url"], project.dir, progress)
        media = probe(path)
        if not media.has_video:
            raise ToolError("Fișierul importat nu conține video.")
        project.state["source_path"] = str(path)
        project.state["source_media"] = {"width": media.width, "height": media.height,
                                         "duration": media.duration, "fps": media.fps, "audio": media.has_audio}
        project.save()
        return path
    return _guard(project, "download", run)


def step_audio(project: Project, progress: Progress | None = None) -> Path:
    def run() -> Path:
        src = project.source_path
        if not src or not src.exists():
            raise ToolError("Videoclipul sursă lipsește. Reia etapa de import.")
        return transcribe.extract_audio(src, project.audio_path, progress)
    return _guard(project, "audio", run)


def step_transcribe(project: Project, model: str, language: str, progress: Progress | None = None) -> dict:
    def run() -> dict:
        if not project.audio_path.exists():
            raise ToolError("Fișierul audio lipsește. Reia etapa de extragere audio.")
        data = transcribe.transcribe(project.audio_path, project.transcript_path, project.partial_transcript_path,
                                     model, language, progress)
        if not data["segments"]:
            raise ToolError("Nu a fost detectată vorbire în videoclip. Clipurile se bazează pe transcriere, "
                            "deci nu pot fi generate.")
        project.state["transcript_meta"] = {"model": model, "language": data["language"],
                                            "language_probability": data.get("language_probability"),
                                            "segments": len(data["segments"])}
        project.save()
        return data
    return _guard(project, "transcript", run)


def load_transcript(project: Project) -> dict:
    return json.loads(project.transcript_path.read_text(encoding="utf-8"))


def step_moments(project: Project, min_d: float, max_d: float, count_max: int) -> dict:
    def run() -> dict:
        data = moments_mod.build_moments(load_transcript(project), project.title(), min_d, max_d,
                                         count_max=count_max)
        project.moments_path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        return data
    return _guard(project, "moments", run)


def load_moments(project: Project) -> dict:
    return json.loads(project.moments_path.read_text(encoding="utf-8"))


def save_moments(project: Project, data: dict) -> None:
    project.moments_path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")


def step_render(project: Project, framing_mode: str, burn_subtitles: bool = True,
                progress: Progress | None = None) -> dict:
    """Randează clipurile bifate, unul câte unul. Clipurile deja verificate OK nu se refac (reluare)."""
    def run() -> dict:
        src = project.source_path
        if not src or not src.exists():
            raise ToolError("Videoclipul sursă lipsește (poate a fost șters după confirmarea exportului).")
        transcript = load_transcript(project)
        data = load_moments(project)
        selected = [m for m in data["moments"] if m.get("selected", True)]
        if not selected:
            raise ToolError("Niciun moment selectat pentru export.")
        out = project.out_dir
        out.mkdir(parents=True, exist_ok=True)
        results: dict[int, dict] = {int(k): v for k, v in project.state.get("render_results", {}).items()}
        settings_key = f"{framing_mode}|{burn_subtitles}"
        if project.state.get("render_settings") != settings_key:
            results = {}
        for idx, m in enumerate(selected):
            prev = results.get(m["nr"])
            if prev and prev["verify"]["ok"] and prev.get("start") == m["start"] and prev.get("end") == m["end"] \
                    and (out / prev["file"]).exists():
                continue

            def sub_progress(frac: float, msg: str, idx=idx) -> None:
                if progress:
                    progress((idx + frac) / len(selected), f"[{idx + 1}/{len(selected)}] {msg}")

            r = render.render_clip(src, m, transcript, out, framing_mode, burn_subtitles, sub_progress)
            r["start"], r["end"] = m["start"], m["end"]
            results[m["nr"]] = r
            project.state["render_results"] = {str(k): v for k, v in results.items()}
            project.state["render_settings"] = settings_key
            project.save()
        # rezultatele momentelor deselectate nu mai fac parte din export
        keep = {m["nr"] for m in selected}
        results = {k: v for k, v in results.items() if k in keep}
        for f in out.glob("clip_*.mp4"):
            n = int(f.stem.split("_")[1]) if f.stem.split("_")[1].isdigit() else None
            if n is not None and n not in keep:
                f.unlink()
                srt = f.with_suffix(".srt")
                if srt.exists():
                    srt.unlink()
        project.state["render_results"] = {str(k): v for k, v in results.items()}
        project.save()
        info = project.state.get("info", {})
        csv_path = render.write_csv(selected, results, out / "clipuri.csv", project.title(),
                                    info.get("webpage_url", ""))
        failed = [r for r in results.values() if not r["verify"]["ok"]]
        if failed:
            raise ToolError("Unele clipuri nu au trecut verificarea: " + "; ".join(
                f"clip {r['nr']}: {', '.join(r['verify']['problems'])}" for r in failed))
        return {"results": results, "csv": str(csv_path)}
    return _guard(project, "clips", run)


def step_confirm(project: Project) -> list[str]:
    removed = project.delete_intermediates()
    project.mark("confirmed")
    return removed
