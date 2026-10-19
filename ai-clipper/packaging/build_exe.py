"""Construiește aplicația ca program independent cu PyInstaller (folder dist/AI-Clipper/).

    python packaging/build_exe.py

Rezultatul nu are nevoie de Python instalat. FFmpeg, Deno și modelul Whisper se adaugă
separat în dist/AI-Clipper/{ffmpeg/bin, deno, models} (vezi .github/workflows/ai-clipper-windows.yml),
iar installerul Windows se face cu packaging/installer.iss (Inno Setup).
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import PyInstaller.__main__

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    os.chdir(ROOT)
    args = [
        str(ROOT / "launcher.py"),
        "--noconfirm", "--clean",
        "--name", "AI-Clipper",
        # aplicație de consolă: --selfcheck/--smoke scriu în terminal; la pornirea prin dublu-clic
        # launcher-ul își ascunde singur consola și deschide fereastra aplicației
        "--console",
        "--distpath", str(ROOT / "dist"),
        "--workpath", str(ROOT / "build"),
        "--specpath", str(ROOT / "build"),
        # interfața (clipper/web: HTML, CSS, JS) și toate modulele aplicației
        "--collect-submodules", "clipper",
        "--add-data", f"{ROOT / 'clipper' / 'web'}{os.pathsep}clipper/web",
        # uvicorn își alege implementările (bucla, protocolul HTTP) prin import dinamic
        "--collect-submodules", "uvicorn",
        # faster-whisper: modelul VAD Silero (assets/*.onnx); ctranslate2/onnxruntime: biblioteci native
        "--collect-data", "faster_whisper",
        "--collect-binaries", "ctranslate2",
        "--collect-binaries", "onnxruntime",
        # yt-dlp încarcă extractoarele dinamic; yt-dlp-ejs conține scripturile JS pentru YouTube
        "--collect-submodules", "yt_dlp",
        "--collect-data", "yt_dlp_ejs",
        "--copy-metadata", "yt_dlp_ejs",
        # OpenCV: clasificatorii Haar (cv2/data/*.xml) pentru detectarea feței
        "--collect-data", "cv2",
        "--exclude-module", "tkinter",
        # biblioteci grele care nu sunt folosite (pot fi trase de pachete opționale din mediu)
        "--exclude-module", "pyarrow",
        "--exclude-module", "pandas",
        "--exclude-module", "streamlit",
        "--exclude-module", "matplotlib",
    ]
    icon = ROOT / "packaging" / "icon.ico"
    if icon.exists():
        args += ["--icon", str(icon)]
    PyInstaller.__main__.run(args)
    print(f"\nGata: {ROOT / 'dist' / 'AI-Clipper'}")


if __name__ == "__main__":
    sys.exit(main())
