"""Randarea clipurilor (9:16, 4:5 sau 1:1) cu subtitrări arse, verificarea lor și exportul CSV."""

from __future__ import annotations

import csv
import hashlib
import json
import os
import shutil
from pathlib import Path
from typing import Callable

from .config import DATA_DIR, OUT_FPS
from .framing import Framing, center_framing, detect_face_framing
from .moments import fmt_ts
from .subtitles import POSITIONS, SIZES, STYLES, keep_intervals, remap, write_ass, write_srt
from .tools import ToolError, ffmpeg_path, probe, run
from .transcribe import run_ffmpeg_with_progress

Progress = Callable[[float, str], None]

FORMATS = {
    "9:16": (1080, 1920, "Vertical 9:16 (TikTok, Reels, Shorts)"),
    "4:5": (1080, 1350, "Portret 4:5 (feed Instagram/Facebook)"),
    "1:1": (1080, 1080, "Pătrat 1:1"),
}
FRAMINGS = {
    "auto": "Automat: față detectată, altfel fundal blurat",
    "blur": "Fundal blurat (tot cadrul vizibil)",
    "center": "Decupaj centrat",
}

DEFAULT_SETTINGS = {
    "format": "9:16",
    "framing": "auto",
    "sub_style": "clasic",
    "sub_position": "jos",
    "sub_size": "mediu",
    "loudnorm": True,
    "cut_pauses": False,
    "cover": True,
}

FONTS_DIR = DATA_DIR / "fonts"


def normalize_settings(raw: dict | None) -> dict:
    s = {**DEFAULT_SETTINGS, **(raw or {})}
    checks = {"format": FORMATS, "framing": FRAMINGS, "sub_style": STYLES, "sub_position": POSITIONS,
              "sub_size": SIZES}
    for key, allowed in checks.items():
        if s[key] not in allowed:
            raise ToolError(f"Valoare invalidă pentru {key}: {s[key]!r}")
    for key in ("loudnorm", "cut_pauses", "cover"):
        s[key] = bool(s[key])
    return {k: s[k] for k in DEFAULT_SETTINGS}


def clip_signature(moment: dict, settings: dict) -> str:
    """Amprenta a tot ce influențează fișierul final; un clip se reface doar dacă ea se schimbă."""
    payload = json.dumps({"start": moment["start"], "end": moment["end"], "cues": moment.get("cues"),
                          "settings": settings, "v": 2}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha1(payload.encode("utf-8")).hexdigest()[:16]


def ensure_fonts() -> Path | None:
    """Unele build-uri FFmpeg pentru Windows nu găsesc fonturile sistemului (lipsește configurația
    fontconfig). Copiem doar Arial din fonturile Windows într-un folder local, dat filtrului ass prin
    „fontsdir”, ca subtitrările să aibă mereu fontul corect."""
    if os.name == "nt":
        win_fonts = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"
        FONTS_DIR.mkdir(parents=True, exist_ok=True)
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


def _select_expr(intervals: list[tuple[float, float]]) -> str:
    return "+".join(f"between(t\\,{a:.3f}\\,{b:.3f})" for a, b in intervals)


def build_filter(fr: Framing, w: int, h: int, intervals: list[tuple[float, float]] | None, ass_name: str | None,
                 fonts_rel: str | None, loudnorm: bool) -> str:
    # 1) eliminarea pauzelor: aceleași intervale pentru video și audio, deci sincronizarea se păstrează
    if intervals:
        sel = _select_expr(intervals)
        vsrc = f"[0:v]fps={OUT_FPS},select='{sel}',setpts=N/({OUT_FPS}*TB)[vcut];"
        asrc = f"[0:a]aselect='{sel}',asetpts=N/SR/TB"
        vin = "[vcut]"
    else:
        vsrc, asrc, vin = "", "[0:a]anull", "[0:v]"

    # 2) încadrare
    if fr.mode in ("face", "center"):
        chain = f"{vin}crop={fr.crop_w}:ih:{fr.crop_x}:0,scale={w}:{h}:flags=lanczos,setsar=1"
    else:
        chain = (
            f"{vin}split=2[bgsrc][fgsrc];"
            # fundal: umple cadrul, micșorat înainte de blur (mult mai rapid pe CPU), apoi mărit înapoi
            f"[bgsrc]scale={w // 4}:{h // 4}:force_original_aspect_ratio=increase,crop={w // 4}:{h // 4},"
            f"boxblur=10:2,scale={w}:{h},eq=brightness=-0.08[bg];"
            f"[fgsrc]scale={w}:{h}:force_original_aspect_ratio=decrease[fg];"
            f"[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1"
        )
    # 3) subtitrări — nume relativ (ffmpeg rulează în folderul clipului): fără escaparea căilor C:\\...
    if ass_name:
        chain += f",ass={ass_name}"
        if fonts_rel:
            chain += f":fontsdir={fonts_rel}"
    chain += f",fps={OUT_FPS},format=yuv420p[v]"

    # 4) audio: normalizare la -14 LUFS (nivelul obișnuit al platformelor de clipuri)
    audio = asrc + (",loudnorm=I=-14:TP=-1.5:LRA=11" if loudnorm else "") + ",aresample=48000[a]"
    return vsrc + chain + ";" + audio


def render_clip(source: Path, moment: dict, out_dir: Path, settings: dict,
                progress: Progress | None = None) -> dict:
    settings = normalize_settings(settings)
    out_dir.mkdir(parents=True, exist_ok=True)
    nr = moment["nr"]
    base = f"clip_{nr:02d}"
    mp4, srt, ass = out_dir / f"{base}.mp4", out_dir / f"{base}.srt", out_dir / f"{base}.ass"
    cover = out_dir / f"{base}.jpg"
    start, end = float(moment["start"]), float(moment["end"])
    w, h, _ = FORMATS[settings["format"]]

    info = probe(source)
    if not info.has_audio:
        raise ToolError("Sursa nu are audio.")
    if settings["framing"] == "auto":
        fr = detect_face_framing(source, start, end, info.width, info.height, w, h)
    elif settings["framing"] == "center":
        fr = center_framing(info.width, info.height, w, h)
    else:
        fr = Framing("blur", None, None, "Fundal blurat (ales manual).")

    cues = moment.get("cues") or []
    intervals = None
    expected = end - start
    if settings["cut_pauses"] and cues:
        iv = keep_intervals(cues, end - start)
        if len(iv) > 1 or (iv and (iv[0][0] > 0.05 or iv[0][1] < end - start - 0.05)):
            intervals = iv
            cues = remap(cues, iv)
            expected = sum(b - a for a, b in iv)

    write_srt(cues, srt)
    use_ass = settings["sub_style"] != "fara" and bool(cues)
    if use_ass:
        write_ass(cues, ass, w, h, settings["sub_style"], settings["sub_position"], settings["sub_size"])

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
        "-filter_complex", build_filter(fr, w, h, intervals, ass.name if use_ass else None, fonts_rel,
                                        settings["loudnorm"]),
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-profile:v", "high",
        "-c:a", "aac", "-b:a", "160k",
        "-movflags", "+faststart",
        tmp.name,
    ]
    try:
        run_ffmpeg_with_progress(args, expected, progress, f"Clip {nr}", cwd=out_dir)
        tmp.replace(mp4)
    finally:
        tmp.unlink(missing_ok=True)
        ass.unlink(missing_ok=True)

    if settings["cover"]:
        make_cover(mp4, cover, expected)
    elif cover.exists():
        cover.unlink()

    check = verify_clip(mp4, expected, w, h)
    if settings["cover"] and not cover.exists():
        check["ok"] = False
        check["problems"].append("Coperta nu a putut fi generată.")
    return {
        "nr": nr, "file": mp4.name, "srt": srt.name, "cover": cover.name if cover.exists() else None,
        "framing": fr.mode, "framing_detail": fr.detail, "subtitle_cues": len(cues), "verify": check,
        "duration_cut": round((end - start) - expected, 2), "format": settings["format"],
        "signature": clip_signature(moment, settings), "start": start, "end": end,
    }


def make_cover(mp4: Path, cover: Path, duration: float) -> None:
    """Copertă JPG dintr-un cadru al clipului final (la ~1/3 din durată)."""
    res = run([ffmpeg_path(), "-hide_banner", "-y", "-ss", f"{max(duration / 3, 0):.2f}", "-i", str(mp4),
               "-frames:v", "1", "-q:v", "3", str(cover)], timeout=120)
    if res.returncode != 0:
        cover.unlink(missing_ok=True)


def verify_clip(path: Path, expected: float, w: int, h: int, tolerance: float = 0.5) -> dict:
    problems = []
    if not path.exists() or path.stat().st_size < 10_000:
        return {"ok": False, "problems": ["Fișierul lipsește sau este gol."], "duration": 0}
    try:
        info = probe(path)
    except ToolError as exc:
        return {"ok": False, "problems": [str(exc)], "duration": 0}
    if (info.width, info.height) != (w, h):
        problems.append(f"Rezoluție {info.width}x{info.height}, așteptat {w}x{h}.")
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
        wr.writerow(["nr", "fisier", "coperta", "format", "start", "sfarsit", "start_sec", "sfarsit_sec",
                     "durata_sec", "pauze_eliminate_sec", "titlu_sugerat", "descriere_sugerata", "cuvinte_cheie",
                     "scor", "incadrare", "verificare", "text_transcris", "sursa", "url_sursa"])
        for m in moments:
            r = results.get(m["nr"])
            if not r:
                continue
            v = r["verify"]
            wr.writerow([
                m["nr"], r["file"], r.get("cover") or "", r.get("format", ""), fmt_ts(m["start"]), fmt_ts(m["end"]),
                f"{m['start']:.2f}", f"{m['end']:.2f}", f"{v.get('duration', 0):.2f}",
                f"{r.get('duration_cut', 0):.2f}", m["title"], m["description"], ", ".join(m.get("keywords", [])),
                "" if m.get("score") is None else m["score"], r["framing"],
                "OK" if v["ok"] else "; ".join(v["problems"]),
                " ".join(c["text"] for c in m.get("cues", [])) or m["text"], source_title, source_url,
            ])
    return path
