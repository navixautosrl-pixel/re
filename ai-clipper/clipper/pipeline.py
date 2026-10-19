"""Etapele procesării, rulate secvențial. Fiecare etapă își salvează rezultatul pe disc și
poate fi reluată independent; o etapă deja finalizată nu se reface decât la cerere."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Callable

from . import moments as moments_mod
from . import editing, render, transcribe, youtube
from .config import MAX_SOURCE_MINUTES, UPLOADS_DIR
from .project import Project, id_for_local_file, safe_id
from .tools import Cancelled, ToolError, probe

Progress = Callable[[float, str], None]


def _guard(project: Project, step: str, fn):
    """Rulează o etapă: șterge eroarea veche, salvează eroarea nouă (pentru reluare) și o propagă."""
    project.set_error(step, None)
    project.mark(step, False)  # rezultatele etapelor ulterioare nu mai sunt valabile
    try:
        result = fn()
    except Cancelled:
        project.set_error(step, "Anulat. Fișierele intermediare au fost păstrate; poți relua oricând.")
        raise
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


def project_for_local_file(path: Path, title: str | None = None) -> Project:
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
    proj.state["info"] = {"id": proj.id, "title": title or path.stem, "channel": "", "duration": info.duration,
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
            if dest.exists() and (not src.exists() or dest.stat().st_size == src.stat().st_size):
                pass  # deja în spațiul de lucru (reluare după o eroare ulterioară)
            elif not src.exists():
                raise ToolError(f"Fișierul original nu mai există: {src}")
            elif UPLOADS_DIR in src.resolve().parents:
                # fișier încărcat prin interfață: îl mutăm (fără a ocupa de două ori spațiul pe disc)
                if progress:
                    progress(0.1, "Se mută fișierul în spațiul de lucru…")
                shutil.move(str(src), dest)
            else:
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
        transcript = load_transcript(project)
        data = moments_mod.build_moments(transcript, project.title(), min_d, max_d, count_max=count_max)
        for m in data["moments"]:
            editing.attach_cues(m, transcript)
        save_moments(project, data)
        return data
    return _guard(project, "moments", run)


def load_moments(project: Project) -> dict:
    data = json.loads(project.moments_path.read_text(encoding="utf-8"))
    # momente salvate de versiunea 0.1 nu aveau subtitrări editabile atașate
    if any("cues" not in m for m in data.get("moments", [])):
        transcript = load_transcript(project)
        for m in data["moments"]:
            if "cues" not in m:
                editing.attach_cues(m, transcript)
    return data


def save_moments(project: Project, data: dict) -> None:
    data["moments"].sort(key=lambda m: m["start"])
    tmp = project.moments_path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(project.moments_path)


def find_moment(data: dict, nr: int) -> dict:
    for m in data["moments"]:
        if m["nr"] == nr:
            return m
    raise ToolError(f"Clipul {nr} nu există.")


def render_results(project: Project) -> dict[int, dict]:
    return {int(k): v for k, v in (project.state.get("render_results") or {}).items()}


def step_render(project: Project, settings: dict | None = None, progress: Progress | None = None,
                only: int | None = None) -> dict:
    """Randează clipurile bifate, unul câte unul. Un clip deja exportat și verificat nu se reface
    dacă nu s-a schimbat nimic din ce îl influențează (interval, subtitrări, setări)."""
    settings = render.normalize_settings(settings)

    def run() -> dict:
        src = project.source_path
        if not src or not src.exists():
            raise ToolError("Videoclipul sursă lipsește (poate a fost șters după confirmarea exportului).")
        data = load_moments(project)
        selected = [m for m in data["moments"] if m.get("selected", True)]
        if only is not None:
            selected = [m for m in selected if m["nr"] == only]
        if not selected:
            raise ToolError("Niciun clip selectat pentru export.")
        out = project.out_dir
        out.mkdir(parents=True, exist_ok=True)
        results = render_results(project)
        for idx, m in enumerate(selected):
            prev = results.get(m["nr"])
            if (only is None and prev and prev["verify"]["ok"] and (out / prev["file"]).exists()
                    and prev.get("signature") == render.clip_signature(m, settings)):
                continue

            def sub_progress(frac: float, msg: str, idx=idx) -> None:
                if progress:
                    progress((idx + frac) / len(selected), f"Clip {idx + 1} din {len(selected)}: {msg}")

            results[m["nr"]] = render.render_clip(src, m, out, settings, sub_progress)
            project.state["render_results"] = {str(k): v for k, v in results.items()}
            project.save()

        # fișierele clipurilor care nu mai fac parte din export
        keep = {m["nr"] for m in data["moments"] if m.get("selected", True)}
        results = {k: v for k, v in results.items() if k in keep}
        for f in out.glob("clip_*.*"):
            num = f.stem.split("_")[1].split(".")[0]
            if num.isdigit() and int(num) not in keep:
                f.unlink(missing_ok=True)
        project.state["render_results"] = {str(k): v for k, v in results.items()}
        project.state["render_settings"] = settings
        project.save()
        info = project.state.get("info", {})
        exported = [m for m in data["moments"] if m["nr"] in results]
        csv_path = render.write_csv(exported, results, out / "clipuri.csv", project.title(),
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
