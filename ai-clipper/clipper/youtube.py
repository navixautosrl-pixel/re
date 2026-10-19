"""Verificarea și importul videoclipurilor YouTube cu yt-dlp.

Nu ocolește DRM, restricții de vârstă, conținut privat/membri sau alte măsuri de acces:
dacă yt-dlp raportează astfel de restricții, importul se oprește cu un mesaj clar.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Callable
from urllib.parse import parse_qs, urlparse

from .config import DOWNLOAD_MAX_HEIGHT, MAX_SOURCE_MINUTES
from .tools import Cancelled, ToolError, find_executable, js_runtimes

YOUTUBE_HOSTS = {
    "youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com",
    "youtu.be", "www.youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com",
}
VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")


def extract_video_id(url: str) -> str | None:
    """Întoarce ID-ul de 11 caractere dacă URL-ul este un link YouTube valid către un singur video."""
    url = url.strip()
    if not url:
        return None
    if not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    try:
        parsed = urlparse(url)
    except ValueError:
        return None
    host = (parsed.hostname or "").lower()
    if host not in YOUTUBE_HOSTS:
        return None
    path = parsed.path.rstrip("/")
    candidate = None
    if host.endswith("youtu.be"):
        candidate = path.lstrip("/").split("/")[0]
    elif path == "/watch":
        candidate = (parse_qs(parsed.query).get("v") or [None])[0]
    else:
        m = re.match(r"^/(shorts|embed|live|v)/([^/?#]+)", path)
        if m:
            candidate = m.group(2)
    if candidate and VIDEO_ID_RE.match(candidate):
        return candidate
    return None


class _QuietLogger:
    """Erorile ajung la utilizator ca excepții traduse; nu le mai dublăm în consolă."""

    def debug(self, msg: str) -> None: pass
    def info(self, msg: str) -> None: pass
    def warning(self, msg: str) -> None: pass
    def error(self, msg: str) -> None: pass


def _ydl_base_opts() -> dict:
    opts: dict = {
        "logger": _QuietLogger(),
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "socket_timeout": 30,
        "retries": 3,
    }
    # yt-dlp folosește un runtime JavaScript pentru unele videoclipuri YouTube.
    runtimes = js_runtimes()
    if runtimes:
        opts["js_runtimes"] = runtimes
    ff = find_executable("ffmpeg")
    if ff:
        opts["ffmpeg_location"] = str(Path(ff).parent)
    return opts


def _friendly_error(exc: Exception) -> str:
    msg = str(exc)
    low = msg.lower()
    if "private video" in low:
        return "Videoclipul este privat. Nu poate fi importat."
    if "sign in to confirm your age" in low or "age-restricted" in low or "inappropriate for some users" in low:
        return "Videoclipul are restricție de vârstă. Aplicația nu ocolește restricțiile de acces."
    if "members-only" in low or "join this channel" in low:
        return "Videoclipul este disponibil doar pentru membri. Aplicația nu ocolește restricțiile de acces."
    if "drm" in low:
        return "Videoclipul este protejat prin DRM. Aplicația nu ocolește protecția DRM."
    if "not available in your country" in low or "geo" in low and "restrict" in low:
        return "Videoclipul nu este disponibil în regiunea ta."
    if "video unavailable" in low or "has been removed" in low:
        return "Videoclipul nu este disponibil (șters sau indisponibil)."
    if "sign in to confirm you" in low and "bot" in low:
        return ("YouTube cere confirmarea că nu ești robot pentru această conexiune. "
                "Încearcă mai târziu sau actualizează yt-dlp (rulează install.bat din nou).")
    if "unable to connect" in low or "proxy" in low or "timed out" in low or "getaddrinfo" in low \
            or "name resolution" in low or "network is unreachable" in low:
        return "Nu există conexiune la YouTube. Verifică internetul și încearcă din nou."
    return f"yt-dlp a raportat o eroare: {msg[-500:]}"


def fetch_info(url: str) -> dict:
    """Citește metadatele fără să descarce videoclipul."""
    import yt_dlp  # import întârziat: aplicația pornește și fără yt-dlp, cu mesaj de eroare clar

    if not extract_video_id(url):
        raise ToolError("Link invalid. Folosește un link YouTube către un singur videoclip "
                        "(ex.: https://www.youtube.com/watch?v=XXXXXXXXXXX sau https://youtu.be/XXXXXXXXXXX).")
    opts = _ydl_base_opts() | {"skip_download": True}
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except yt_dlp.utils.DownloadError as exc:
        raise ToolError(_friendly_error(exc)) from exc

    if info.get("_type") == "playlist":
        raise ToolError("Linkul indică o listă de redare. Introdu linkul unui singur videoclip.")

    duration = info.get("duration")
    live = info.get("live_status")
    summary = {
        "id": info.get("id"),
        "title": info.get("title") or "(fără titlu)",
        "channel": info.get("channel") or info.get("uploader") or "",
        "duration": float(duration) if duration else None,
        "upload_date": info.get("upload_date"),
        "view_count": info.get("view_count"),
        "thumbnail": info.get("thumbnail"),
        "description": (info.get("description") or "")[:600],
        "live_status": live,
        "availability": info.get("availability"),
        "webpage_url": info.get("webpage_url") or url,
        "language": info.get("language"),
        "has_drm": bool(info.get("_has_drm")),
    }
    return summary


def validate_info(info: dict) -> list[str]:
    """Întoarce lista motivelor pentru care importul trebuie blocat (goală = OK)."""
    problems = []
    if info.get("live_status") in ("is_live", "is_upcoming", "post_live"):
        problems.append("Transmisiunile live sau programate nu pot fi importate. Așteaptă finalizarea și procesarea lor.")
    if info.get("has_drm"):
        problems.append("Videoclipul este protejat prin DRM. Aplicația nu ocolește protecția DRM.")
    if info.get("availability") in ("private", "premium_only", "subscriber_only", "needs_auth"):
        problems.append("Videoclipul necesită autentificare sau abonament. Aplicația nu ocolește restricțiile de acces.")
    dur = info.get("duration")
    if not dur:
        problems.append("Durata videoclipului nu poate fi determinată.")
    elif dur > MAX_SOURCE_MINUTES * 60:
        problems.append(f"Videoclipul are {dur/60:.0f} minute. Limita este de {MAX_SOURCE_MINUTES} de minute.")
    return problems


def download(url: str, dest_dir: Path, progress: Callable[[float, str], None] | None = None) -> Path:
    """Descarcă la maximum DOWNLOAD_MAX_HEIGHT p, preferând MP4/H.264 (decodare ușoară pe CPU)."""
    import yt_dlp

    dest_dir.mkdir(parents=True, exist_ok=True)
    h = DOWNLOAD_MAX_HEIGHT

    cancelled: list[BaseException] = []

    def hook(d: dict) -> None:
        if not progress:
            return
        try:
            _report(d)
        except Cancelled as exc:  # yt-dlp poate împacheta excepția; o ținem minte ca s-o recunoaștem
            cancelled.append(exc)
            raise

    def _report(d: dict) -> None:
        if d.get("status") == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
            done = d.get("downloaded_bytes") or 0
            frac = done / total if total else 0.0
            speed = d.get("speed") or 0
            progress(min(frac, 1.0), f"Descărcare: {done/1e6:.1f} / {total/1e6:.1f} MB ({speed/1e6:.1f} MB/s)")
        elif d.get("status") == "finished":
            progress(1.0, "Descărcare terminată, se combină fluxurile audio/video…")

    opts = _ydl_base_opts() | {
        "format": (
            f"bv*[height<={h}][vcodec^=avc1]+ba[ext=m4a]/"
            f"bv*[height<={h}]+ba/"
            f"b[height<={h}]/b"
        ),
        "merge_output_format": "mp4",
        "outtmpl": str(dest_dir / "source.%(ext)s"),
        "progress_hooks": [hook],
        "continuedl": True,          # reia descărcările întrerupte
        "overwrites": False,
        "max_filesize": 4 * 1024**3,
    }
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=True)
            path = Path(ydl.prepare_filename(info)).with_suffix(".mp4")
    except yt_dlp.utils.DownloadError as exc:
        if cancelled:
            raise Cancelled() from exc
        raise ToolError(_friendly_error(exc)) from exc

    if not path.exists():
        found = sorted(dest_dir.glob("source.*"), key=lambda p: p.stat().st_size, reverse=True)
        found = [p for p in found if p.suffix not in (".part", ".ytdl", ".json")]
        if not found:
            raise ToolError("Descărcarea s-a terminat, dar fișierul video nu a fost găsit.")
        path = found[0]
    return path
