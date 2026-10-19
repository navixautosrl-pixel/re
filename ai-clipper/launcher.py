"""Pornește interfața Streamlit doar pe 127.0.0.1 și deschide browserul când serverul e gata."""

from __future__ import annotations

import socket
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
HOST = "127.0.0.1"


def free_port(start: int = 8501) -> int:
    for port in range(start, start + 30):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((HOST, port)) != 0:
                return port
    raise SystemExit("Nu am găsit niciun port liber între 8501 și 8530.")


def main() -> int:
    port = free_port()
    cmd = [sys.executable, "-m", "streamlit", "run", str(APP_DIR / "app.py"),
           "--server.address", HOST, "--server.port", str(port), "--server.headless", "true",
           "--browser.gatherUsageStats", "false"]
    proc = subprocess.Popen(cmd, cwd=APP_DIR)
    url = f"http://{HOST}:{port}"
    for _ in range(120):
        if proc.poll() is not None:
            print("Streamlit s-a oprit neașteptat. Verifică mesajele de mai sus.")
            return proc.returncode or 1
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((HOST, port)) == 0:
                break
        time.sleep(0.5)
    print(f"\nAI Clipper rulează la {url}\nNu închide această fereastră cât timp folosești aplicația.\n")
    webbrowser.open(url)
    try:
        return proc.wait()
    except KeyboardInterrupt:
        proc.terminate()
        return 0


if __name__ == "__main__":
    sys.exit(main())
