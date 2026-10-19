"""Teste unitare: python -m pytest tests -q   (necesită pytest, nu face parte din requirements.txt)."""

from __future__ import annotations

import json
import subprocess
import sys
import types
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from clipper import editing, moments, render, subtitles, transcribe, youtube  # noqa: E402
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
    cues = subtitles.cues_for_range(tr, m["start"], m["end"])
    assert cues
    prev_end = 0.0
    for c in cues:
        assert 0 <= c["s"] < c["e"] <= m["duration"] + 0.8
        assert c["s"] >= prev_end - 1e-6
        assert c["text"] == " ".join(w["w"] for w in c["words"])
        assert all(c["s"] - 1e-6 <= w["s"] <= w["e"] <= c["e"] + 1e-6 for w in c["words"])
        prev_end = c["e"]
    assert cues[0]["text"].split()[0] in m["text"]
    subtitles.write_srt(cues, tmp_path / "a.srt")
    for style in subtitles.STYLES:
        subtitles.write_ass(cues, tmp_path / "a.ass", 1080, 1920, style, "jos", "mediu")
        ass = (tmp_path / "a.ass").read_text(encoding="utf-8")
        assert ass.count("Dialogue:") >= len(cues)
        if style == "karaoke":  # un eveniment pe cuvânt, cuvântul curent colorat
            assert ass.count("Dialogue:") == sum(len(c["words"]) for c in cues)
            assert "\\1c&H0000E5FF&" in ass
        if style == "galben":
            assert cues[0]["text"].upper() in ass
    assert "-->" in (tmp_path / "a.srt").read_text(encoding="utf-8")


def test_cue_text_edit_keeps_timing():
    cue = {"s": 1.0, "e": 3.0, "text": "Bear walls reflect", "words": [
        {"s": 1.0, "e": 1.5, "w": "Bear"}, {"s": 1.6, "e": 2.2, "w": "walls"}, {"s": 2.3, "e": 3.0, "w": "reflect"}]}
    new = subtitles.set_cue_text(cue, "Bare  walls reflect sound")
    assert new["text"] == "Bare walls reflect sound" and new["edited"]
    assert [w["w"] for w in new["words"]] == ["Bare", "walls", "reflect", "sound"]
    assert new["words"][0]["s"] == 1.0 and abs(new["words"][-1]["e"] - 3.0) < 1e-6
    assert all(a["e"] <= b["s"] + 1e-6 for a, b in zip(new["words"], new["words"][1:]))
    assert subtitles.set_cue_text(cue, "Bear walls reflect") is cue  # neschimbat


def test_keep_intervals_and_remap():
    cues = [{"s": 0.5, "e": 2.0, "text": "a b", "words": [{"s": 0.5, "e": 1.0, "w": "a"}, {"s": 1.2, "e": 2.0, "w": "b"}]},
            {"s": 5.0, "e": 6.0, "text": "c", "words": [{"s": 5.0, "e": 6.0, "w": "c"}]}]
    iv = subtitles.keep_intervals(cues, 8.0)
    assert len(iv) == 2  # pauza de 3 s dintre „b” și „c” este scoasă
    assert iv[0] == (0.0, 2.12) and iv[1][0] == 4.88
    kept = sum(b - a for a, b in iv)
    out = subtitles.remap(cues, iv)
    assert out[0]["s"] == 0.5
    assert abs(out[1]["s"] - (2.12 + 0.12)) < 1e-6  # „c” începe imediat după pauza scurtată
    assert out[-1]["e"] <= kept + 1e-6
    # fără pauze lungi: un singur interval, nimic de tăiat
    assert len(subtitles.keep_intervals(cues[:1], 2.5)) == 1


def test_render_settings_validation():
    s = render.normalize_settings({"format": "1:1", "sub_style": "karaoke"})
    assert s["format"] == "1:1" and s["loudnorm"] is True
    with pytest.raises(ToolError):
        render.normalize_settings({"format": "16:9"})
    with pytest.raises(ToolError):
        render.normalize_settings({"sub_style": "<script>"})
    m = {"start": 1.0, "end": 20.0, "cues": [{"s": 0, "e": 1, "text": "x", "words": []}]}
    assert render.clip_signature(m, s) == render.clip_signature(dict(m), dict(s))
    assert render.clip_signature(m, s) != render.clip_signature({**m, "end": 21.0}, s)


def test_editing_adjust_and_manual():
    tr = make_transcript(SAMPLE)
    m = moments.build_moments(tr, "T", 15, 30)["moments"][0]
    editing.attach_cues(m, tr)
    longer = editing.adjust(m, tr, "T", "end", +1)
    assert longer["j"] == m["j"] + 1 and longer["end"] > m["end"] and longer["start"] == m["start"]
    shorter = editing.adjust(longer, tr, "T", "start", -1)
    assert shorter["i"] == m["i"] + 1
    assert shorter["cues"] and shorter["cues"][0]["text"].split()[0] in shorter["text"]
    with pytest.raises(ToolError):
        editing.adjust({**m, "i": 0, "j": 0}, tr, "T", "start", +1)  # nu există propoziție înainte
    with pytest.raises(ToolError):
        editing.adjust(m, tr, "T", "end", +40)  # peste 60 s
    man = editing.manual(tr, "T", 6, 4, nr=99)
    assert (man["i"], man["j"], man["nr"], man["manual"]) == (4, 6, 99, True)
    sl = editing.sentence_list(tr)
    assert abs(man["start"] - sl[4]["start"]) < 0.3 and abs(man["end"] - sl[6]["end"]) < 0.5
    edited = editing.edit_cue(man, 1, "Text corectat")
    assert edited["cues"][1]["text"] == "Text corectat"
    # corectura supraviețuiește extinderii la sfârșit și scurtării la început
    longer = editing.adjust(edited, tr, "T", "end", +1)
    assert "Text corectat" in [c["text"] for c in longer["cues"]]
    trimmed = editing.adjust(longer, tr, "T", "start", -1)
    assert trimmed["start"] > longer["start"]
    kept = [c for c in trimmed["cues"] if c["text"] == "Text corectat"]
    if edited["cues"][1]["words"][0]["s"] + edited["start"] >= trimmed["start"]:
        assert kept and kept[0]["words"][0]["s"] >= 0
    with pytest.raises(ToolError):
        editing.edit_cue(man, 0, "   ")


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

    def transcribe(self, audio, **kw):
        assert audio.dtype.name == "float32" and audio.ndim == 1  # ca la faster-whisper: eșantioane 16 kHz
        dur = len(audio) / 16000
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
    subprocess.run([find_executable("ffmpeg"), "-v", "error", "-f", "lavfi", "-i", "sine=f=440:d=20", "-ar", "16000", "-ac", "1",
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
