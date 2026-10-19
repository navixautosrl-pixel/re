"""Un „proiect” = un videoclip sursă și tot ce s-a generat din el.

Starea se salvează în workspace/<id>/state.json după fiecare etapă, astfel încât
procesarea poate fi reluată de unde a rămas după o eroare sau după închiderea aplicației.
"""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import time
from dataclasses import dataclass, field
from pathlib import Path

from .config import OUTPUT_DIR, WORKSPACE_DIR

STEPS = ("info", "download", "audio", "transcript", "moments", "clips", "confirmed")

STEP_LABELS = {
    "info": "Informații verificate",
    "download": "Video importat",
    "audio": "Audio extras",
    "transcript": "Transcriere",
    "moments": "Momente selectate",
    "clips": "Clipuri exportate",
    "confirmed": "Export confirmat",
}


def safe_id(text: str) -> str:
    text = re.sub(r"[^A-Za-z0-9_-]+", "_", text).strip("_")
    return text[:60] or "proiect"


def id_for_local_file(path: Path) -> str:
    digest = hashlib.sha1(f"{path.resolve()}|{path.stat().st_size}".encode()).hexdigest()[:8]
    return f"local_{safe_id(path.stem)}_{digest}"


@dataclass
class Project:
    id: str
    state: dict = field(default_factory=dict)

    @property
    def dir(self) -> Path:
        return WORKSPACE_DIR / self.id

    @property
    def out_dir(self) -> Path:
        return OUTPUT_DIR / self.id

    @property
    def state_file(self) -> Path:
        return self.dir / "state.json"

    # Căi standard pentru fișierele intermediare
    @property
    def audio_path(self) -> Path:
        return self.dir / "audio_16k.wav"

    @property
    def transcript_path(self) -> Path:
        return self.dir / "transcript.json"

    @property
    def partial_transcript_path(self) -> Path:
        return self.dir / "transcript.partial.jsonl"

    @property
    def moments_path(self) -> Path:
        return self.dir / "moments.json"

    @property
    def source_path(self) -> Path | None:
        p = self.state.get("source_path")
        return Path(p) if p else None

    @classmethod
    def load_or_create(cls, project_id: str) -> "Project":
        proj = cls(project_id)
        proj.dir.mkdir(parents=True, exist_ok=True)
        if proj.state_file.exists():
            proj.state = json.loads(proj.state_file.read_text(encoding="utf-8"))
        else:
            proj.state = {"id": project_id, "created": time.time(), "steps": {}}
            proj.save()
        return proj

    def save(self) -> None:
        self.dir.mkdir(parents=True, exist_ok=True)
        tmp = self.state_file.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.state, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(self.state_file)

    def done(self, step: str) -> bool:
        return bool(self.state.get("steps", {}).get(step))

    def mark(self, step: str, value: bool = True) -> None:
        self.state.setdefault("steps", {})[step] = value
        if not value:
            # o etapă refăcută invalidează etapele care depind de ea
            for later in STEPS[STEPS.index(step) + 1:]:
                self.state["steps"][later] = False
        self.save()

    def set_error(self, step: str, message: str | None) -> None:
        errors = self.state.setdefault("errors", {})
        if message:
            errors[step] = message
        else:
            errors.pop(step, None)
        self.save()

    def title(self) -> str:
        return (self.state.get("info") or {}).get("title") or self.id

    def delete_intermediates(self) -> list[str]:
        """Șterge video sursă, audio și fișierele parțiale. Păstrează transcrierea, momentele și exportul."""
        removed = []
        for p in [self.source_path, self.audio_path, self.partial_transcript_path]:
            if p and p.exists() and self.dir in p.resolve().parents:
                p.unlink()
                removed.append(p.name)
        tmp_dir = self.dir / "tmp"
        if tmp_dir.exists():
            shutil.rmtree(tmp_dir, ignore_errors=True)
            removed.append("tmp/")
        return removed


def list_projects() -> list[Project]:
    if not WORKSPACE_DIR.exists():
        return []
    projects = []
    for d in WORKSPACE_DIR.iterdir():
        if (d / "state.json").exists():
            try:
                projects.append(Project.load_or_create(d.name))
            except (json.JSONDecodeError, OSError):
                continue
    projects.sort(key=lambda p: p.state.get("created", 0), reverse=True)
    return projects
