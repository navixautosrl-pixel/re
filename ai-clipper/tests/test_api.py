"""Testele serverului local: securitate, tot fluxul prin HTTP, editări, export, anulare.

python -m pytest tests/test_api.py -q   (necesită pytest și httpx; FFmpeg în PATH sau în ffmpeg/bin)
Transcrierea este injectată (fără model Whisper); transcrierea reală este testată în CI pe Windows.
"""

from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from clipper import config  # noqa: E402
from clipper.tools import find_executable  # noqa: E402

pytestmark = pytest.mark.skipif(find_executable("ffmpeg") is None, reason="necesită ffmpeg")

TOKEN = "test-token"


@pytest.fixture()
def env(tmp_path, monkeypatch):
    """Server izolat: toate folderele de date într-un director temporar."""
    from clipper import pipeline, project, render, server
    data = tmp_path / "data"
    for mod in (config, project, pipeline, server, render):
        for name, value in (("WORKSPACE_DIR", data / "workspace"), ("OUTPUT_DIR", data / "export"),
                            ("UPLOADS_DIR", data / "uploads"), ("DATA_DIR", data)):
            if hasattr(mod, name):
                monkeypatch.setattr(mod, name, value)
    from fastapi.testclient import TestClient
    from clipper.jobs import JobManager
    jobs = JobManager()
    app = server.create_app(TOKEN, jobs)
    client = TestClient(app, base_url="http://127.0.0.1")
    yield client, jobs, tmp_path
    jobs.shutdown()


def make_video(path: Path, seconds: float = 70.0) -> None:
    subprocess.run([find_executable("ffmpeg"), "-v", "error", "-y",
                    "-f", "lavfi", "-i", f"testsrc2=size=640x360:rate=25:duration={seconds}",
                    "-f", "lavfi", "-i", f"sine=frequency=330:duration={seconds}",
                    "-shortest", "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", str(path)], check=True)


def transcript(seconds: float = 70.0) -> dict:
    """Propoziții de ~5 s cu o pauză lungă (1,6 s) din 3 în 3, ca în vorbirea reală."""
    vocab = ("microfon cameră editare sunet lumină subtitrări ritm public poveste exemplu greșeală "
             "soluție buget client produs întrebare răspuns strategie rezultat echipă calitate").split()
    segs, t, k = [], 0.6, 0
    while t < seconds - 6:
        words = [vocab[(k * 3 + n) % len(vocab)] for n in range(8)]
        words[0] = words[0].capitalize()
        wl = []
        for n, w in enumerate(words):
            wl.append({"start": round(t, 3), "end": round(t + 0.45, 3), "word": " " + w + ("." if n == 7 else ""),
                       "probability": 0.9})
            t += 0.6
        segs.append({"start": wl[0]["start"], "end": wl[-1]["end"], "text": " ".join(w["word"].strip() for w in wl),
                     "words": wl})
        t += 1.6 if k % 3 == 2 else 0.5
        k += 1
    return {"model": "base", "requested_language": "ro", "language": "ro", "language_probability": 1.0,
            "duration": seconds, "segments": segs}


def H(extra=None):
    return {"X-Clipper-Token": TOKEN, **(extra or {})}


def wait_job(client, job_id, timeout=300):
    t0 = time.time()
    while time.time() - t0 < timeout:
        j = client.get(f"/api/jobs/{job_id}").json()
        if j["status"] in ("done", "error", "cancelled"):
            return j
        time.sleep(0.3)
    raise AssertionError("lucrarea nu s-a terminat")


def upload(client, tmp_path) -> str:
    video = tmp_path / "Interviu de test.mp4"
    make_video(video)
    r = client.post("/api/upload?name=Interviu%20de%20test.mp4&rights=1", content=video.read_bytes(), headers=H())
    assert r.status_code == 200, r.text
    job = wait_job(client, r.json()["job"]["id"])
    assert job["status"] == "done", job
    return r.json()["project"]


def inject_transcript(pid: str) -> None:
    from clipper.project import Project
    p = Project.load_or_create(pid)
    p.transcript_path.write_text(json.dumps(transcript(), ensure_ascii=False), encoding="utf-8")
    p.state["transcript_meta"] = {"model": "base", "language": "ro", "segments": 1}
    p.save()
    for step in ("audio", "transcript"):
        p.mark(step)


# ---------------------------------------------------------------- securitate

def test_security(env):
    client, _, _ = env
    from fastapi.testclient import TestClient
    evil = TestClient(client.app, base_url="http://evil.example")
    assert evil.get("/api/system").status_code == 403          # DNS rebinding
    assert client.get("/api/system").status_code == 200
    r = client.post("/api/youtube/info", json={"url": "x"})   # fără token
    assert r.status_code == 403
    assert client.post("/api/heartbeat").status_code == 403
    assert client.post("/api/heartbeat", headers=H()).json() == {"ok": True}
    assert client.get("/media/..%2f..%2fetc/export/passwd").status_code == 404
    assert client.get("/static/..%2fserver.py").status_code == 404
    page = client.get("/").text
    assert TOKEN in page and "__CLIPPER_TOKEN__" not in page


def test_upload_validation(env):
    client, _, tmp_path = env
    r = client.post("/api/upload?name=a.mp4", content=b"x", headers=H())
    assert r.status_code == 400 and "dreptul" in r.json()["error"]
    r = client.post("/api/upload?name=a.exe&rights=1", content=b"x", headers=H())
    assert r.status_code == 400 and "nesuportat" in r.json()["error"]
    r = client.post("/api/upload?name=a.mp4&rights=1", content=b"not a video", headers=H())
    assert r.status_code == 400
    assert not any((tmp_path / "data" / "uploads").glob("*"))  # fișierul respins a fost șters


# ---------------------------------------------------------------- tot fluxul

def test_full_flow(env):
    client, jobs, tmp_path = env
    pid = upload(client, tmp_path)
    proj = client.get(f"/api/projects/{pid}").json()
    assert proj["title"] == "Interviu de test" and proj["steps"]["download"] and proj["source_available"]
    assert not any((tmp_path / "data" / "uploads").glob("*"))  # mutat, nu copiat

    inject_transcript(pid)
    r = client.post(f"/api/projects/{pid}/moments", json={"min": 15, "max": 30, "count": 6}, headers=H())
    assert r.status_code == 200, r.text
    ms = r.json()["moments"]
    assert 2 <= len(ms) <= 6 and all("cues" in m and m["cues"] for m in ms)
    sents = client.get(f"/api/projects/{pid}/transcript").json()["sentences"]
    assert len(sents) > 5
    assert client.get(f"/media/{pid}/thumb/1.jpg?t={ms[0]['start']}").headers["content-type"] == "image/jpeg"

    # editări
    nr = ms[0]["nr"]
    r = client.put(f"/api/projects/{pid}/moments/{nr}", json={"title": "  Titlul   meu ", "cue": {"index": 0, "text": "Text corectat de mine"}}, headers=H())
    assert r.status_code == 200, r.text
    m = r.json()
    assert m["title"] == "Titlul meu" and m["cues"][0]["text"] == "Text corectat de mine"
    r = client.post(f"/api/projects/{pid}/moments/{nr}/adjust", json={"edge": "end", "delta": -1}, headers=H())
    assert r.status_code in (200, 400)
    if r.status_code == 200:
        assert r.json()["title"] == "Titlul meu"  # titlul editat se păstrează
    r = client.post(f"/api/projects/{pid}/moments/manual", json={"i": 1, "j": 3}, headers=H())
    assert r.status_code == 200, r.text
    manual_nr = r.json()["nr"]
    assert r.json()["manual"] is True
    if len(ms) > 2:
        assert client.delete(f"/api/projects/{pid}/moments/{ms[-1]['nr']}", headers=H()).status_code == 200
    assert client.put(f"/api/projects/{pid}/moments/999", json={"selected": False}, headers=H()).status_code == 400

    # export cu setări „la maximum”
    settings = {"format": "9:16", "sub_style": "karaoke", "cut_pauses": True, "loudnorm": True, "cover": True}
    r = client.post(f"/api/projects/{pid}/render", json={"settings": settings}, headers=H())
    assert r.status_code == 200, r.text
    job = wait_job(client, r.json()["job"]["id"], 600)
    assert job["status"] == "done", job
    proj = client.get(f"/api/projects/{pid}").json()
    results = proj["results"]
    assert str(manual_nr) in results
    for res in results.values():
        assert res["verify"]["ok"], res
        assert (res["verify"]["width"], res["verify"]["height"]) == (1080, 1920)
        assert res["cover"]
    # o pauză lungă (1,6 s) există în fiecare grup de 3 propoziții: cel puțin un clip trebuie scurtat
    assert any(res["duration_cut"] > 0.5 for res in results.values())

    # media: Range (derulare în player), descărcare, ZIP, CSV
    f = results[str(manual_nr)]["file"]
    r = client.get(f"/media/{pid}/export/{f}", headers={"Range": "bytes=0-99"})
    assert r.status_code == 206 and len(r.content) == 100
    r = client.get(f"/media/{pid}/export/{f}?download=1")
    assert "attachment" in r.headers["content-disposition"]
    z = client.get(f"/api/projects/{pid}/export.zip")
    assert z.status_code == 200 and z.content[:2] == b"PK"
    import io
    import zipfile
    names = zipfile.ZipFile(io.BytesIO(z.content)).namelist()
    assert "clipuri.csv" in names and sum(n.endswith(".mp4") for n in names) == len(results)
    csv_text = client.get(f"/media/{pid}/export/clipuri.csv").content.decode("utf-8-sig")
    assert "Titlul meu" in csv_text and "Text corectat de mine" in csv_text

    # al doilea export fără schimbări: nimic nu se refacere (rapid)
    t0 = time.time()
    job = wait_job(client, client.post(f"/api/projects/{pid}/render", json={"settings": settings}, headers=H()).json()["job"]["id"])
    assert job["status"] == "done" and time.time() - t0 < 10

    # alt format: toate clipurile se refac la 1:1
    job = wait_job(client, client.post(f"/api/projects/{pid}/render", json={"settings": {**settings, "format": "1:1", "sub_style": "cutie"}}, headers=H()).json()["job"]["id"], 600)
    assert job["status"] == "done", job
    res = client.get(f"/api/projects/{pid}").json()["results"]
    assert all((r_["verify"]["width"], r_["verify"]["height"]) == (1080, 1080) for r_ in res.values())

    # confirmare: sursa ștearsă, clipurile rămân
    r = client.post(f"/api/projects/{pid}/confirm", headers=H())
    assert r.status_code == 200 and "source.mp4" in r.json()["removed"]
    proj = client.get(f"/api/projects/{pid}").json()
    assert not proj["source_available"] and proj["steps"]["confirmed"]
    assert client.get(f"/media/{pid}/export/{f}").status_code == 200


def test_cancel_and_resume(env):
    client, jobs, tmp_path = env
    pid = upload(client, tmp_path)
    inject_transcript(pid)
    client.post(f"/api/projects/{pid}/moments", json={"min": 15, "max": 30, "count": 6}, headers=H())
    r = client.post(f"/api/projects/{pid}/render", json={"settings": {"framing": "blur"}}, headers=H())
    job_id = r.json()["job"]["id"]
    # a doua lucrare pe același proiect este refuzată cât timp prima rulează
    r2 = client.post(f"/api/projects/{pid}/render", json={"settings": {}}, headers=H())
    assert r2.status_code == 400
    for _ in range(200):
        if client.get(f"/api/jobs/{job_id}").json()["progress"] > 0.05:
            break
        time.sleep(0.05)
    client.post(f"/api/jobs/{job_id}/cancel", headers=H())
    j = wait_job(client, job_id)
    assert j["status"] == "cancelled", j
    proj = client.get(f"/api/projects/{pid}").json()
    assert "Anulat" in proj["errors"].get("clips", "")
    assert not list(Path(proj["out_dir"]).glob("*.tmp.mp4"))  # niciun fișier temporar rămas
    # reluare după anulare
    j = wait_job(client, client.post(f"/api/projects/{pid}/render", json={"settings": {"framing": "blur"}}, headers=H()).json()["job"]["id"], 600)
    assert j["status"] == "done", j
    assert client.get(f"/api/projects/{pid}").json()["steps"]["clips"]


def test_delete_project(env):
    client, _, tmp_path = env
    pid = upload(client, tmp_path)
    assert any(p["id"] == pid for p in client.get("/api/projects").json()["projects"])
    assert client.delete(f"/api/projects/{pid}", headers=H()).status_code == 200
    assert client.get(f"/api/projects/{pid}").status_code == 404
