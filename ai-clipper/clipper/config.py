"""Constante și căi folosite de toată aplicația."""

import os
import sys
from pathlib import Path

FROZEN = bool(getattr(sys, "frozen", False))  # rulează din AI-Clipper.exe (PyInstaller)

if FROZEN:
    # Programul instalat (eventual într-un folder fără drept de scriere) conține doar fișiere fixe:
    # ffmpeg\, deno\, models\ incluse. Datele utilizatorului merg în profilul lui.
    APP_DIR = Path(sys.executable).resolve().parent
    _local = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local")
    DATA_DIR = _local / "AI-Clipper"
    OUTPUT_DIR = Path.home() / "Videos" / "AI Clipper"  # clipuri finale + CSV
else:
    APP_DIR = Path(__file__).resolve().parent.parent
    DATA_DIR = APP_DIR
    OUTPUT_DIR = APP_DIR / "export"

BUNDLE_DIR = APP_DIR                    # unde caută ffmpeg\bin, deno\, models\ livrate cu aplicația
WORKSPACE_DIR = DATA_DIR / "workspace"  # fișiere intermediare (video sursă, audio, transcriere)
MODELS_DIR = DATA_DIR / "models"        # modelele Whisper descărcate o singură dată

# Limite cerute de specificație
MAX_SOURCE_MINUTES = 60          # peste această durată descărcarea este refuzată
LONG_SOURCE_WARN_MINUTES = 30    # peste această durată se afișează avertisment
MIN_CLIP_SECONDS = 15
MAX_CLIP_SECONDS = 60
MIN_CLIPS = 5
MAX_CLIPS = 10

# Calitatea descărcării: suficient pentru un export 1080x1920 decupat, fără să încarce un PC modest.
DOWNLOAD_MAX_HEIGHT = 720

OUT_WIDTH = 1080
OUT_HEIGHT = 1920
OUT_FPS = 30

WHISPER_MODELS = ("base", "small")
DEFAULT_WHISPER_MODEL = "base"

LANGUAGES = {
    "ro": "Română",
    "auto": "Detectare automată",
    "en": "Engleză",
}
