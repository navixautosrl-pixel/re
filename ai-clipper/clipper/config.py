"""Constante și căi folosite de toată aplicația."""

from pathlib import Path

APP_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = APP_DIR / "workspace"   # fișiere intermediare (video sursă, audio, transcriere)
OUTPUT_DIR = APP_DIR / "export"         # clipuri finale + CSV
MODELS_DIR = APP_DIR / "models"         # modelele Whisper descărcate o singură dată

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
