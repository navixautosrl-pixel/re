"""Teste unitare: python -m pytest tests -q   (necesită pytest, nu face parte din requirements.txt)."""

from __future__ import annotations

import json
import subprocess
import sys
import types
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from clipper import moments, subtitles, transcribe, youtube  # noqa: E402
from clipper.tools import ToolError, find_executable  # noqa: E402


# ---------------------------------------------------------------- URL / metadate

@pytest.mark.parametrize("url,vid", [
    ("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"),
    ("youtube.com/watch?v=dQw4w9WgXcQ&t=42s", "dQw4w9WgXcQ"),
    ("https://youtu.be/dQw4w9WgXcQ?si=abc", "dQw4w9WgXcQ"),
    ("https://m.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"),
    ("https://www.youtube.com/live/dQw4w9WgXcQ", "dQw4w9WgXcQ"),
    ("https://www.youtube.com/playlist?list=PL123", None),
    ("https://vimeo.com/123456", None),
    ("https://www.youtube.com.evil.com/watch?v=dQw4w9WgXcQ", None),
    ("not a url", None),
    ("", None),
])
def test_extract_video_id(url, vid):
    assert youtube.extract_video_id(url) == vid


def test_validate_info_limits():
    ok = {"duration": 1200, "live_status": "not_live"}
    assert youtube.validate_info(ok) == []
    assert youtube.validate_info({"duration": 61 * 60})
    assert youtube.validate_info({"duration": 600, "live_status": "is_live"})
    assert youtube.validate_info({"duration": 600, "has_drm": True})
    assert youtube.validate_info({"duration": None})


def test_fetch_info_friendly_error(monkeypatch):
    import yt_dlp

    class Boom:
        def __init__(self, *a, **k): pass
        def __enter__(self): return self
        def __exit__(self, *a): return False
        def extract_info(self, *a, **k):
            raise yt_dlp.utils.DownloadError("ERROR: [youtube] x: Private video. Sign in if you've been granted access")

    monkeypatch.setattr(yt_dlp, "YoutubeDL", Boom)
    with pytest.raises(ToolError, match="privat"):
        youtube.fetch_info("https://youtu.be/dQw4w9WgXcQ")
    with pytest.raises(ToolError, match="Link invalid"):
        youtube.fetch_info("https://vimeo.com/1")


# ---------------------------------------------------------------- momente

def make_transcript(sentences: list[tuple[str, float]], gap: float = 0.6, wps: float = 2.5) -> dict:
    segs, t = [], 0.5
    for text, extra_gap in sentences:
        words = text.split()
        wl = []
        for w in words:
            wl.append({"start": round(t, 3), "end": round(t + 0.9 / wps, 3), "word": " " + w, "probability": 0.9})
            t += 1 / wps
        segs.append({"start": wl[0]["start"], "end": wl[-1]["end"], "text": text, "words": wl})
        t += gap + extra_gap
    return {"duration": t + 1, "segments": segs}


# ~150 de „cuvinte” distincte: ca în vorbirea reală, ferestre diferite au în mare parte vocabular diferit
_VOCAB = [a + b for a in ("mar", "tel", "sor", "dun", "pal", "ves", "cor", "lum", "gan", "rit", "ban", "fel")
          for b in ("ina", "oru", "esc", "ata", "imi", "ură", "ean", "olu", "aru", "ețe", "ici", "ost")]


def _sentence(i: int) -> str:
    import random
    rnd = random.Random(i)
    words = rnd.sample(_VOCAB, 6)
    return f"Despre {words[0]} și {words[1]} am învățat că {words[2]} contează pentru {words[3]}, {words[4]} și {words[5]}."


SAMPLE = [(_sentence(i), 1.5 if i % 4 == 3 else 0.0) for i in range(40)]


def test_moments_respect_duration_overlap_and_sentences():
    tr = make_transcript(SAMPLE)
    data = moments.build_moments(tr, "Test", 15, 30, count_max=10)
    ms = data["moments"]
    assert 5 <= len(ms) <= 10
    sents = moments.split_sentences(moments.flatten_words(tr))
    starts = [s.start for s in sents]
    ends = [s.end for s in sents]
    for m in ms:
        assert 15 <= m["duration"] <= 30 + 1e-6
        # marginile cad în pauza dintre propoziții, nu în mijlocul unui cuvânt
        assert any(0 <= st - m["start"] <= 0.26 for st in starts), m
        assert any(0 <= m["end"] - en <= 0.46 for en in ends), m
        assert m["text"].rstrip().endswith(".")
        # titlul provine din textul real al clipului
        assert m["title"].rstrip("…").lower()[:20] in m["text"].lower()
    for a, b in zip(ms, ms[1:]):
        assert a["end"] <= b["start"], "momentele nu au voie să se suprapună"


def test_moments_never_cut_long_sentence():
    long_sentence = " ".join(["cuvânt"] * 200) + "."
    tr = make_transcript([(long_sentence, 0)])
    data = moments.build_moments(tr, "Test", 15, 30)
    # propoziția (80 s) e împărțită doar la pauze/virgule; fără pauze nu se pot face tăieturi curate
    for m in data["moments"]:
        assert m["duration"] <= 30 + 1e-6


def test_empty_transcript():
    data = moments.build_moments({"segments": [], "duration": 10}, "T", 15, 30)
    assert data["moments"] == [] and data["note"]


# ---------------------------------------------------------------- subtitrări

def test_subtitle_cues_in_range_and_ordered(tmp_path):
    tr = make_transcript(SAMPLE[:10])
    m = moments.build_moments(tr, "T", 15, 30)["moments"][0]
    cues = subtitles.group_cues(subtitles.words_in_range(tr, m["start"], m["end"]))
    assert cues
    prev_end = 0.0
    for s, e, text in cues:
        assert 0 <= s < e <= m["duration"] + 0.8
        assert s >= prev_end - 1e-6
        assert len(text) <= subtitles.MAX_CHARS + 20
        prev_end = e
    spoken = " ".join(t for _, _, t in cues)
    assert spoken.split()[0] in m["text"]
    subtitles.write_srt(cues, tmp_path / "a.srt")
    subtitles.write_ass(cues, tmp_path / "a.ass")
    assert "-->" in (tmp_path / "a.srt").read_text(encoding="utf-8")
    assert "Dialogue:" in (tmp_path / "a.ass").read_text(encoding="utf-8")


def test_normalize_diacritics():
    assert transcribe.normalize_ro("şi ţară Ş Ţ") == "și țară Ș Ț"


# ---------------------------------------------------------------- reluarea transcrierii

class FakeWord:
    def __init__(self, s, e, w):
        self.start, self.end, self.word, self.probability = s, e, w, 0.9


class FakeSeg:
    def __init__(self, s, e, text):
        self.start, self.end, self.text = s, e, text
        self.no_speech_prob, self.avg_logprob = 0.01, -0.2
        self.words = [FakeWord(s, e, " " + text)]


class FakeModel:
    """Produce un segment la fiecare 2 s din audio primit; poate „cădea” după N segmente."""
    calls: list[float] = []

    def __init__(self, fail_after=None):
        self.fail_after = fail_after

    def transcribe(self, path, **kw):
        dur = transcribe.probe(path).duration
        FakeModel.calls.append(dur)

        def gen():
            t, n = 0.0, 0
            while t + 2 <= dur + 1e-6:
                if self.fail_after is not None and n >= self.fail_after:
                    raise RuntimeError("întrerupere simulată")
                yield FakeSeg(t + 0.2, t + 1.8, f"seg{n}")
                t += 2
                n += 1
        return gen(), types.SimpleNamespace(language="ro", language_probability=0.99)


@pytest.mark.skipif(find_executable("ffmpeg") is None, reason="necesită ffmpeg")
def test_transcription_resumes_after_failure(tmp_path, monkeypatch):
    wav = tmp_path / "a.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "sine=f=440:d=20", "-ar", "16000", "-ac", "1",
                    str(wav)], check=True)
    out, part = tmp_path / "t.json", tmp_path / "t.partial.jsonl"
    FakeModel.calls = []
    monkeypatch.setattr(transcribe, "load_model", lambda name: FakeModel(fail_after=4))
    with pytest.raises(ToolError, match="relua"):
        transcribe.transcribe(wav, out, part, "base", "ro")
    assert not out.exists()
    saved = part.read_text(encoding="utf-8").splitlines()
    assert len(saved) == 1 + 4  # antet + 4 segmente salvate înainte de eroare

    monkeypatch.setattr(transcribe, "load_model", lambda name: FakeModel())
    data = transcribe.transcribe(wav, out, part, "base", "ro")
    texts = [s["text"] for s in data["segments"]]
    starts = [s["start"] for s in data["segments"]]
    assert starts == sorted(starts)
    assert len(data["segments"]) == 10  # 4 de la prima rulare + 6 din restul audio
    assert abs(FakeModel.calls[1] - (20 - 7.8)) < 0.2  # a doua rulare a primit doar audio rămas
    assert data["segments"][4]["start"] == pytest.approx(7.8 + 0.2, abs=0.01)
    # rezultatul final e refolosit fără a reîncărca modelul
    monkeypatch.setattr(transcribe, "load_model", lambda name: pytest.fail("nu trebuia reîncărcat"))
    assert transcribe.transcribe(wav, out, part, "base", "ro")["segments"] == data["segments"]
    json.loads(out.read_text(encoding="utf-8"))
