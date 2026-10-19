"""Punctul de pornire al aplicației (și al AI-Clipper.exe).

    launcher.py                 pornește serverul local și deschide fereastra aplicației
    launcher.py --no-browser    doar serverul (pentru teste)
    launcher.py --selfcheck     verifică Python/FFmpeg/pachetele
    launcher.py --smoke VIDEO   test complet fără interfață (vezi clipper/smoke.py)
    launcher.py --yt-info URL   citește doar metadatele unui link YouTube (fără descărcare)
"""

from __future__ import annotations

import json
import logging
import os
import secrets
import shutil
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser
from logging.handlers import RotatingFileHandler
from pathlib import Path

HOST = "127.0.0.1"


def free_port(start: int = 8501) -> int:
    for port in range(start, start + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((HOST, port)) != 0:
                return port
    raise SystemExit("Nu am găsit niciun port liber între 8501 și 8550.")


def setup_logging() -> None:
    from clipper.config import LOGS_DIR
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    handler = RotatingFileHandler(LOGS_DIR / "app.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger = logging.getLogger("clipper")
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)
    if sys.stdout:
        logger.addHandler(logging.StreamHandler(sys.stdout))


def instance_file() -> Path:
    from clipper.config import DATA_DIR
    return DATA_DIR / "instance.json"


def running_instance() -> str | None:
    """Dacă aplicația rulează deja, întoarce adresa ei (pornire a doua oară = aceeași fereastră)."""
    try:
        data = json.loads(instance_file().read_text(encoding="utf-8"))
        url = f"http://{HOST}:{int(data['port'])}"
        with urllib.request.urlopen(url + "/api/ping", timeout=2) as r:
            if json.loads(r.read()).get("app") == "ai-clipper":
                return url
    except (OSError, ValueError, KeyError):
        pass
    return None


def find_edge() -> str | None:
    if os.name != "nt":
        return None
    for base in (os.environ.get("ProgramFiles(x86)"), os.environ.get("ProgramFiles"), os.environ.get("LOCALAPPDATA")):
        if base:
            exe = Path(base) / "Microsoft" / "Edge" / "Application" / "msedge.exe"
            if exe.is_file():
                return str(exe)
    return shutil.which("msedge")


def open_window(url: str) -> None:
    """Fereastră de aplicație Edge (fără bara de adrese); altfel browserul implicit."""
    edge = find_edge()
    if edge:
        try:
            subprocess.Popen([edge, f"--app={url}", "--window-size=1440,920", "--no-first-run"],
                             creationflags=0x00000008 if os.name == "nt" else 0)  # DETACHED_PROCESS
            return
        except OSError:
            pass
    webbrowser.open(url)


def hide_own_console() -> None:
    """Ascunde consola doar dacă a fost creată pentru noi (pornire prin dublu-clic), nu și când
    aplicația e pornită dintr-un terminal deschis de utilizator."""
    if os.name != "nt" or os.environ.get("AI_CLIPPER_SHOW_CONSOLE"):
        return
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        procs = (ctypes.c_uint * 4)()
        if kernel32.GetConsoleProcessList(procs, 4) == 1:
            hwnd = kernel32.GetConsoleWindow()
            if hwnd:
                ctypes.windll.user32.ShowWindow(hwnd, 0)
    except Exception:  # noqa: BLE001 - doar cosmetic
        pass


def run_ui(open_browser: bool = True, port: int | None = None) -> int:
    import uvicorn

    from clipper.jobs import JobManager
    from clipper.server import Heartbeat, create_app, idle_watchdog

    setup_logging()
    log = logging.getLogger("clipper")
    existing = running_instance()
    if existing:
        print(f"AI Clipper rulează deja la {existing}; deschid fereastra.")
        if open_browser:
            open_window(existing)
        return 0

    port = port or free_port()
    token = secrets.token_urlsafe(24)
    jobs, hb = JobManager(), Heartbeat()
    app = create_app(token, jobs, hb)
    server = uvicorn.Server(uvicorn.Config(app, host=HOST, port=port, log_level="warning", access_log=False))
    url = f"http://{HOST}:{port}"

    def when_ready() -> None:
        for _ in range(200):
            if server.started:
                break
            time.sleep(0.1)
        instance_file().parent.mkdir(parents=True, exist_ok=True)
        instance_file().write_text(json.dumps({"port": port, "pid": os.getpid()}), encoding="utf-8")
        print(f"\nAI Clipper rulează la {url}\nÎnchide fereastra aplicației pentru a o opri.\n", flush=True)
        log.info("Pornit la %s", url)
        if open_browser:
            open_window(url)
            hide_own_console()

    threading.Thread(target=when_ready, daemon=True).start()
    if open_browser:  # în modul de test (--no-browser) serverul nu se oprește singur
        idle_watchdog(server, jobs, hb)
    try:
        server.run()
    finally:
        jobs.shutdown()
        try:
            data = json.loads(instance_file().read_text(encoding="utf-8"))
            if data.get("pid") == os.getpid():
                instance_file().unlink()
        except (OSError, ValueError):
            pass
        log.info("Oprit.")
    return 0


def main() -> int:
    if sys.stdout and hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    args = sys.argv[1:]
    if args[:1] == ["--selfcheck"]:
        from clipper import selfcheck
        return selfcheck.main()
    if args[:1] == ["--smoke"]:
        from clipper import smoke
        return smoke.main(args[1:])
    if args[:1] == ["--yt-info"] and len(args) > 1:
        from clipper import youtube
        from clipper.tools import ToolError
        try:
            info = youtube.fetch_info(args[1])
        except ToolError as exc:
            print(f"EROARE: {exc}")
            return 1
        print(json.dumps({k: info.get(k) for k in ("id", "title", "channel", "duration", "live_status")},
                         ensure_ascii=False))
        print("Probleme:", youtube.validate_info(info) or "niciuna")
        return 0
    port = None
    if "--port" in args:
        port = int(args[args.index("--port") + 1])
    return run_ui(open_browser="--no-browser" not in args, port=port)


if __name__ == "__main__":
    sys.exit(main())
