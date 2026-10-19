"""Punctul de pornire al aplicației (și al AI-Clipper.exe).

    launcher.py                 pornește interfața doar pe 127.0.0.1 și deschide browserul
    launcher.py --selfcheck     verifică Python/FFmpeg/pachetele
    launcher.py --smoke VIDEO   test complet fără interfață (vezi clipper/smoke.py)
    launcher.py --yt-info URL   citește doar metadatele unui link YouTube (fără descărcare)
"""

from __future__ import annotations

import socket
import sys
import threading
import time
import webbrowser
from pathlib import Path

HOST = "127.0.0.1"


def _app_script() -> Path:
    # în AI-Clipper.exe, app.py este despachetat de PyInstaller în sys._MEIPASS
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    return base / "app.py"


def free_port(start: int = 8501) -> int:
    for port in range(start, start + 30):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((HOST, port)) != 0:
                return port
    raise SystemExit("Nu am găsit niciun port liber între 8501 și 8530.")


def _open_when_ready(port: int, open_browser: bool) -> None:
    url = f"http://{HOST}:{port}"
    for _ in range(240):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((HOST, port)) == 0:
                break
        time.sleep(0.5)
    print(f"\nAI Clipper rulează la {url}\nNu închide această fereastră cât timp folosești aplicația.\n", flush=True)
    if open_browser:
        webbrowser.open(url)


def run_ui(open_browser: bool = True) -> None:
    from streamlit.web import bootstrap

    port = free_port()
    flags = {
        "server.address": HOST,
        "server.port": port,
        "server.headless": True,
        "server.fileWatcherType": "none",
        "browser.gatherUsageStats": False,
        # într-un .exe Streamlit s-ar crede altfel „în dezvoltare” și ar refuza portul ales
        "global.developmentMode": False,
        "client.toolbarMode": "minimal",
        "theme.base": "light",
        "theme.primaryColor": "#C2410C",
    }
    bootstrap.load_config_options(flag_options=flags)
    threading.Thread(target=_open_when_ready, args=(port, open_browser), daemon=True).start()
    bootstrap.run(str(_app_script()), False, [], flags)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    args = sys.argv[1:]
    if args[:1] == ["--selfcheck"]:
        from clipper import selfcheck
        return selfcheck.main()
    if args[:1] == ["--smoke"]:
        from clipper import smoke
        return smoke.main(args[1:])
    if args[:1] == ["--yt-info"] and len(args) > 1:
        import json
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
    run_ui(open_browser="--no-browser" not in args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
