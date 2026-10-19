"""Test complet, fără interfață, pe un videoclip local autorizat — inclus și în AI-Clipper.exe:

    AI-Clipper.exe --smoke video.mp4 [--language ro] [--model base]

Rulează import → audio → transcriere faster-whisper REALĂ → momente → export → verificare → CSV,
afișează un raport și întoarce cod 0 doar dacă toate clipurile au trecut verificarea.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import time
from pathlib import Path

from . import pipeline
from .tools import ToolError


def run(video: str, language: str = "ro", model: str = "base", min_d: float = 15, max_d: float = 30,
        count: int = 10, framing: str = "auto", transcript_file: str | None = None,
        cut_pauses: bool = False, sub_style: str = "clasic") -> int:
    t0 = time.time()
    last = {"t": 0.0}

    def progress(frac: float, msg: str) -> None:
        if time.time() - last["t"] > 3 or frac >= 1.0:
            print(f"  {frac:6.1%} {msg[:110]}", flush=True)
            last["t"] = time.time()

    report: dict = {"video": video, "model": model, "language": language,
                    "transcript_source": "referință (NU Whisper)" if transcript_file else "faster-whisper"}
    try:
        proj = pipeline.project_for_local_file(Path(video))
        shutil.rmtree(proj.dir, ignore_errors=True)
        shutil.rmtree(proj.out_dir, ignore_errors=True)
        proj = pipeline.project_for_local_file(Path(video))
        pipeline.step_download(proj, progress)
        pipeline.step_audio(proj, progress)
        if transcript_file:  # doar pentru testarea etapelor de după transcriere
            ref = json.loads(Path(transcript_file).read_text(encoding="utf-8"))
            ref["model"], ref["requested_language"] = model, language
            proj.transcript_path.write_text(json.dumps(ref, ensure_ascii=False), encoding="utf-8")
        t1 = time.time()
        data = pipeline.step_transcribe(proj, model, language, progress)
        report["transcript"] = {"segments": len(data["segments"]), "language": data["language"],
                                "seconds": round(time.time() - t1, 1),
                                "first_lines": [s["text"] for s in data["segments"][:3]]}
        md = pipeline.step_moments(proj, min_d, max_d, count)
        report["moments"] = [{"nr": m["nr"], "start": m["start"], "end": m["end"], "title": m["title"]}
                             for m in md["moments"]]
        res = pipeline.step_render(proj, {"framing": framing, "cut_pauses": cut_pauses, "sub_style": sub_style}, progress)
        report["clips"] = [{"file": r["file"], **r["verify"], "framing": r["framing"],
                            "subtitles": r["subtitle_cues"], "cover": r.get("cover"),
                            "pauses_removed_s": r.get("duration_cut")}
                           for r in sorted(res["results"].values(), key=lambda r: r["nr"])]
        report["csv"] = res["csv"]
        report["ok"] = bool(report["clips"]) and all(c["ok"] for c in report["clips"])
    except ToolError as exc:
        report["ok"] = False
        report["error"] = str(exc)
    report["total_seconds"] = round(time.time() - t0, 1)
    print("RAPORT " + json.dumps(report, ensure_ascii=False, indent=1), flush=True)
    return 0 if report["ok"] else 1


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="AI-Clipper --smoke")
    ap.add_argument("video")
    ap.add_argument("--language", default="ro")
    ap.add_argument("--model", default="base")
    ap.add_argument("--min", type=float, default=15)
    ap.add_argument("--max", type=float, default=30)
    ap.add_argument("--cut-pauses", action="store_true")
    ap.add_argument("--style", default="clasic")
    ap.add_argument("--transcript", help="transcriere de referință în loc de Whisper (doar pentru dezvoltare)")
    a = ap.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    return run(a.video, a.language, a.model, a.min, a.max, transcript_file=a.transcript,
               cut_pauses=a.cut_pauses, sub_style=a.style)


if __name__ == "__main__":
    sys.exit(main())
