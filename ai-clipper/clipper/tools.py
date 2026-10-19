"""Detectarea Python, FFmpeg și a pachetelor necesare + utilitare pentru rularea FFmpeg."""

from __future__ import annotations

import importlib.util
import json
import os
import platform
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from .config import APP_DIR

# Pe Windows ascundem fereastra de consolă a proceselor copil.
CREATE_NO_WINDOW = 0x08000000 if os.name == "nt" else 0


class ToolError(RuntimeError):
    """Eroare cu mesaj în română, afișabil direct utilizatorului."""


def _local_candidates(name: str) -> list[Path]:
    exe = f"{name}.exe" if os.name == "nt" else name
    cands = [APP_DIR / "ffmpeg" / "bin" / exe, APP_DIR / "ffmpeg" / exe]
    if os.name == "nt" and os.environ.get("LOCALAPPDATA"):
        # winget pune aici legăturile pentru FFmpeg; PATH-ul se actualizează abia într-o consolă nouă
        cands.append(Path(os.environ["LOCALAPPDATA"]) / "Microsoft" / "WinGet" / "Links" / exe)
    return cands


def find_executable(name: str) -> str | None:
    """Caută întâi în folderul aplicației (ffmpeg\\bin), apoi în PATH."""
    for cand in _local_candidates(name):
        if cand.is_file():
            return str(cand)
    return shutil.which(name)


def ffmpeg_path() -> str:
    path = find_executable("ffmpeg")
    if not path:
        raise ToolError(
            "FFmpeg nu a fost găsit. Rulează install.bat sau pune ffmpeg.exe în folderul ffmpeg\\bin al aplicației."
        )
    return path


def ffprobe_path() -> str:
    path = find_executable("ffprobe")
    if not path:
        raise ToolError(
            "FFprobe nu a fost găsit (vine împreună cu FFmpeg). Rulează install.bat sau verifică instalarea FFmpeg."
        )
    return path


def run(cmd: list[str], cwd: str | Path | None = None, timeout: float | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        creationflags=CREATE_NO_WINDOW,
    )


def tool_version(path: str | None) -> str | None:
    if not path:
        return None
    try:
        out = run([path, "-version"], timeout=20).stdout.splitlines()
        return out[0] if out else None
    except (OSError, subprocess.SubprocessError):
        return None


def ffprobe_json(path: str | Path) -> dict:
    res = run(
        [ffprobe_path(), "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)],
        timeout=60,
    )
    if res.returncode != 0:
        raise ToolError(f"FFprobe nu poate citi fișierul {Path(path).name}: {res.stderr.strip()[-400:]}")
    return json.loads(res.stdout)


@dataclass
class MediaInfo:
    duration: float
    width: int
    height: int
    has_audio: bool
    has_video: bool
    fps: float


def probe(path: str | Path) -> MediaInfo:
    data = ffprobe_json(path)
    v = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
    a = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
    duration = float(data.get("format", {}).get("duration") or (v or {}).get("duration") or 0)
    fps = 0.0
    if v and v.get("avg_frame_rate") and v["avg_frame_rate"] != "0/0":
        num, _, den = v["avg_frame_rate"].partition("/")
        fps = float(num) / float(den or 1)
    return MediaInfo(
        duration=duration,
        width=int((v or {}).get("width") or 0),
        height=int((v or {}).get("height") or 0),
        has_audio=a is not None,
        has_video=v is not None,
        fps=fps,
    )


@dataclass
class Check:
    name: str
    ok: bool
    detail: str
    required: bool = True


def system_checks() -> list[Check]:
    checks: list[Check] = []
    py_ok = sys.version_info >= (3, 10)
    checks.append(Check("Python", py_ok, f"{platform.python_version()} ({sys.executable})"))

    ff = find_executable("ffmpeg")
    checks.append(Check("FFmpeg", ff is not None, tool_version(ff) or "negăsit"))
    fp = find_executable("ffprobe")
    checks.append(Check("FFprobe", fp is not None, tool_version(fp) or "negăsit"))

    for mod, label, required in (
        ("yt_dlp", "yt-dlp", True),
        ("faster_whisper", "faster-whisper", True),
        ("cv2", "OpenCV (încadrare pe față)", False),
    ):
        found = importlib.util.find_spec(mod) is not None
        checks.append(Check(label, found, "instalat" if found else "lipsește — rulează install.bat", required))

    js = shutil.which("deno") or shutil.which("node")
    checks.append(
        Check(
            "Runtime JavaScript (Deno/Node) pentru yt-dlp",
            js is not None,
            js or "negăsit — unele videoclipuri YouTube pot avea formate limitate",
            required=False,
        )
    )
    return checks


def open_folder(path: Path) -> bool:
    """Deschide folderul în Explorer (Windows). Întoarce False dacă nu e posibil."""
    try:
        if os.name == "nt":
            os.startfile(str(path))  # type: ignore[attr-defined]
            return True
        opener = shutil.which("xdg-open") or shutil.which("open")
        if opener:
            subprocess.Popen([opener, str(path)])
            return True
    except OSError:
        pass
    return False
