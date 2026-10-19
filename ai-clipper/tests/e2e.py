"""Test complet al fluxului pe un fișier video autorizat (fără interfață).

  python tests/e2e.py <video.mp4> [--model base] [--language ro] [--framing auto]
                     [--ground-truth transcript.json] [--min 15 --max 30 --count 10]

Implicit, transcrierea se face cu faster-whisper (CPU, int8). --ground-truth folosește în loc
o transcriere de referință (doar pentru testarea etapelor de după transcriere, când modelul
Whisper nu poate fi descărcat). Raportul afișat spune explicit ce variantă s-a folosit.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from clipper import pipeline  # noqa: E402
from clipper.moments import fmt_ts  # noqa: E402
from clipper.tools import ToolError  # noqa: E402


def progress(label: str):
    last = {"t": 0.0}

    def cb(frac: float, msg: str) -> None:
        now = time.time()
        if now - last["t"] > 2 or frac >= 1.0:
            print(f"  [{label}] {frac:6.1%} {msg[:110]}", flush=True)
            last["t"] = now
    return cb


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--model", default="base")
    ap.add_argument("--language", default="ro")
    ap.add_argument("--framing", default="auto", choices=["auto", "blur", "center"])
    ap.add_argument("--ground-truth")
    ap.add_argument("--min", type=float, default=15)
    ap.add_argument("--max", type=float, default=30)
    ap.add_argument("--count", type=int, default=10)
    ap.add_argument("--fresh", action="store_true", help="șterge proiectul existent înainte")
    args = ap.parse_args()

    t0 = time.time()
    proj = pipeline.project_for_local_file(Path(args.video))
    if args.fresh:
        shutil.rmtree(proj.dir, ignore_errors=True)
        shutil.rmtree(proj.out_dir, ignore_errors=True)
        proj = pipeline.project_for_local_file(Path(args.video))
    print(f"Proiect: {proj.id}")

    pipeline.step_download(proj, progress("import"))
    pipeline.step_audio(proj, progress("audio"))
    if args.ground_truth:
        print("ATENȚIE: se folosește transcrierea de referință, NU faster-whisper.")
        data = json.loads(Path(args.ground_truth).read_text(encoding="utf-8"))
        data["model"], data["requested_language"] = args.model, args.language
        proj.transcript_path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    t1 = time.time()
    data = pipeline.step_transcribe(proj, args.model, args.language, progress("transcriere"))
    print(f"Transcriere: {len(data['segments'])} segmente, limba {data['language']}, {time.time() - t1:.1f}s")

    md = pipeline.step_moments(proj, args.min, args.max, args.count)
    print(f"Momente: {len(md['moments'])} (din {md['candidates_total']} candidate). {md.get('note') or ''}")
    for m in md["moments"]:
        print(f"  {m['nr']:2d}. {fmt_ts(m['start'])}–{fmt_ts(m['end'])} ({m['duration']:.1f}s) scor {m['score']}: {m['title']}")

    try:
        res = pipeline.step_render(proj, {"framing": args.framing}, progress("export"))
    except ToolError as exc:
        print(f"EȘEC export: {exc}")
        return 1
    print(f"Export în {proj.out_dir}")
    ok = True
    for r in sorted(res["results"].values(), key=lambda r: r["nr"]):
        v = r["verify"]
        ok &= v["ok"]
        print(f"  {r['file']}: {'OK' if v['ok'] else 'EȘEC'} {v.get('width')}x{v.get('height')} "
              f"{v.get('duration')}s, {v.get('size_mb')} MB, încadrare={r['framing']} ({r['framing_detail']}), "
              f"{r['subtitle_cues']} subtitrări")
    print(f"CSV: {res['csv']}")
    print(f"Timp total: {time.time() - t0:.1f}s")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
