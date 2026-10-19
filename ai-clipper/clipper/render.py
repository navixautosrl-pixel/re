"""Randarea clipurilor verticale 1080x1920 cu subtitrări arse, verificarea lor și exportul CSV."""

from __future__ import annotations

import csv
import os
import shutil
from pathlib import Path
from typing import Callable

from .config import DATA_DIR, OUT_FPS, OUT_HEIGHT, OUT_WIDTH
from .framing import Framing, center_framing, detect_face_framing
from .moments import fmt_ts
from .subtitles import group_cues, words_in_range, write_ass, write_srt
from .tools import ToolError, probe
from .transcribe import run_ffmpeg_with_progress

Progress = Callable[[float, str], None]

W, H = OUT_WIDTH, OUT_HEIGHT
FONTS_DIR = DATA_DIR / "fonts"


def ensure_fonts() -> Path | None:
    """Unele build-uri FFmpeg pentru Windows nu găsesc fonturile sistemului (lipsește configurația
    fontconfig). Copiem doar Arial din fonturile Windows într-un folder local, dat filtrului ass prin
    „fontsdir”, ca subtitrările să aibă mereu fontul corect."""
    if os.name == "nt":
        win_fonts = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"
        FONTS_DIR.mkdir(exist_ok=True)
        for name in ("arial.ttf", "arialbd.ttf"):
            src, dest = win_fonts / name, FONTS_DIR / name
            if src.exists() and not dest.exists():
                try:
                    shutil.copy2(src, dest)
                except OSError:
                    pass
    if FONTS_DIR.is_dir() and any(FONTS_DIR.glob("*.tt[fc]")):
        return FONTS_DIR
    return None


def video_filter(fr: Framing, ass_name: str | None, fonts_rel: str | None = None) -> str:
    if fr.mode in ("face", "center"):
        chain = f"[0:v]crop={fr.crop_w}:ih:{fr.crop_x}:0,scale={W}:{H}:flags=lanczos,setsar=1"
    else:
        chain = (
            f"[0:v]split=2[bgsrc][fgsrc];"
            # fundal: umple 9:16, micșorat înainte de blur (mult mai rapid pe CPU), apoi mărit înapoi
            f"[bgsrc]scale={W // 4}:{H // 4}:force_original_aspect_ratio=increase,crop={W // 4}:{H // 4},"
            f"boxblur=10:2,scale={W}:{H},eq=brightness=-0.08[bg];"
            f"[fgsrc]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];"
            f"[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1"
        )
    if ass_name:
        # numele relativ (ffmpeg rulează în folderul clipului) evită problemele de escapare a căilor Windows C:\...
        chain += f",ass={ass_name}"
        if fonts_rel:
            chain += f":fontsdir={fonts_rel}"
    return chain + f",fps={OUT_FPS},format=yuv420p[v]"


def render_clip(source: Path, moment: dict, transcript: dict, out_dir: Path, framing_mode: str,
                burn_subtitles: bool = True, progress: Progress | None = None) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    nr = moment["nr"]
    base = f"clip_{nr:02d}"
    mp4 = out_dir / f"{base}.mp4"
    srt = out_dir / f"{base}.srt"
    ass = out_dir / f"{base}.ass"
    start, end = float(moment["start"]), float(moment["end"])
    expected = end - start

    info = probe(source)
    if framing_mode == "auto":
        fr = detect_face_framing(source, start, end, info.width, info.height)
    elif framing_mode == "center":
        fr = center_framing(info.width, info.height)
    else:
        fr = Framing("blur", None, None, "Fundal blurat (ales manual).")

    cues = group_cues(words_in_range(transcript, start, end))
    write_srt(cues, srt)
    use_ass = burn_subtitles and bool(cues)
    if use_ass:
        write_ass(cues, ass)

    fonts_rel = None
    fonts = ensure_fonts() if use_ass else None
    if fonts:
        try:
            # cale relativă cu „/”: fără „C:”, care ar trebui escapat în sintaxa filtrelor FFmpeg
            fonts_rel = os.path.relpath(fonts, out_dir).replace("\\", "/")
        except ValueError:  # alt disc decât folderul de export
            fonts_rel = None
    tmp = out_dir / f"{base}.tmp.mp4"
    args = [
        "-ss", f"{start:.3f}", "-to", f"{end:.3f}", "-i", str(source),
        "-filter_complex", video_filter(fr, ass.name if use_ass else None, fonts_rel),
        "-map", "[v]", "-map", "0:a:0?",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-profile:v", "high",
        "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
        "-movflags", "+faststart", "-shortest",
        tmp.name,
    ]
    run_ffmpeg_with_progress(args, expected, progress, f"Clip {nr}", cwd=out_dir)
    tmp.replace(mp4)
    if ass.exists():
        ass.unlink()

    check = verify_clip(mp4, expected)
    return {
        "nr": nr, "file": mp4.name, "srt": srt.name, "framing": fr.mode, "framing_detail": fr.detail,
        "subtitle_cues": len(cues), "verify": check,
    }


def verify_clip(path: Path, expected: float, tolerance: float = 0.5) -> dict:
    problems = []
    if not path.exists() or path.stat().st_size < 10_000:
        return {"ok": False, "problems": ["Fișierul lipsește sau este gol."], "duration": 0}
    try:
        info = probe(path)
    except ToolError as exc:
        return {"ok": False, "problems": [str(exc)], "duration": 0}
    if (info.width, info.height) != (W, H):
        problems.append(f"Rezoluție {info.width}x{info.height}, așteptat {W}x{H}.")
    if not info.has_video:
        problems.append("Lipsește fluxul video.")
    if not info.has_audio:
        problems.append("Lipsește fluxul audio.")
    if abs(info.duration - expected) > tolerance:
        problems.append(f"Durată {info.duration:.2f}s, așteptat {expected:.2f}s.")
    return {"ok": not problems, "problems": problems, "duration": round(info.duration, 2),
            "width": info.width, "height": info.height, "size_mb": round(path.stat().st_size / 1e6, 2)}


def write_csv(moments: list[dict], results: dict[int, dict], path: Path, source_title: str, source_url: str) -> Path:
    # utf-8-sig: Excel pe Windows afișează corect diacriticele; „;” = separatorul implicit în Excel cu setări românești
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        wr = csv.writer(fh, delimiter=";")
        wr.writerow(["nr", "fisier", "start", "sfarsit", "start_sec", "sfarsit_sec", "durata_sec",
                     "titlu_sugerat", "descriere_sugerata", "cuvinte_cheie", "scor", "incadrare",
                     "verificare", "text_transcris", "sursa", "url_sursa"])
        for m in moments:
            r = results.get(m["nr"])
            if not r:
                continue
            v = r["verify"]
            wr.writerow([
                m["nr"], r["file"], fmt_ts(m["start"]), fmt_ts(m["end"]), f"{m['start']:.2f}", f"{m['end']:.2f}",
                f"{v.get('duration', 0):.2f}", m["title"], m["description"], ", ".join(m.get("keywords", [])),
                m["score"], r["framing"], "OK" if v["ok"] else "; ".join(v["problems"]), m["text"],
                source_title, source_url,
            ])
    return path
