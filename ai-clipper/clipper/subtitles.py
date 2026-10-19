"""Subtitrări per clip, construite din marcajele temporale ale cuvintelor din transcriere.

Textul este exact cel transcris — nu se adaugă, traduce sau rescrie nimic.
"""

from __future__ import annotations

from pathlib import Path

from .config import OUT_HEIGHT, OUT_WIDTH
from .moments import Word, flatten_words

MAX_CHARS = 24
MAX_SECONDS = 3.2
MIN_DISPLAY = 0.7


def words_in_range(transcript: dict, start: float, end: float) -> list[Word]:
    out = []
    for w in flatten_words(transcript):
        mid = (w.start + w.end) / 2
        if start - 0.05 <= mid <= end + 0.05:
            out.append(Word(max(w.start - start, 0.0), min(w.end, end) - start, w.text.strip(), w.prob))
    return out


def group_cues(words: list[Word]) -> list[tuple[float, float, str]]:
    cues: list[tuple[float, float, str]] = []
    cur: list[Word] = []

    def flush() -> None:
        if cur:
            cues.append((cur[0].start, cur[-1].end, " ".join(w.text for w in cur)))
            cur.clear()

    for w in words:
        if not w.text:
            continue
        if cur:
            text_len = len(" ".join(x.text for x in cur)) + 1 + len(w.text)
            gap = w.start - cur[-1].end
            if text_len > MAX_CHARS or w.end - cur[0].start > MAX_SECONDS or gap > 0.8:
                flush()
        cur.append(w)
        if w.text.endswith((".", "?", "!", "…", ",", ";", ":")):
            flush()
    flush()

    # fără pâlpâire: prelungim până la următorul subtitlu dacă pauza e scurtă; durată minimă de afișare
    fixed = []
    for k, (s, e, t) in enumerate(cues):
        nxt = cues[k + 1][0] if k + 1 < len(cues) else None
        if nxt is not None and nxt - e < 0.5:
            e = nxt
        if e - s < MIN_DISPLAY:
            e = min(s + MIN_DISPLAY, nxt) if nxt is not None else s + MIN_DISPLAY
        fixed.append((s, max(e, s + 0.1), t))
    return fixed


def _ass_time(t: float) -> str:
    cs = int(round(max(t, 0) * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"


def _srt_time(t: float) -> str:
    ms = int(round(max(t, 0) * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _ass_escape(text: str) -> str:
    return text.replace("\\", "/").replace("{", "(").replace("}", ")").replace("\n", " ")


def write_ass(cues: list[tuple[float, float, str]], path: Path, font: str = "Arial") -> None:
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {OUT_WIDTH}
PlayResY: {OUT_HEIGHT}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font},80,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,5,1,2,90,90,430,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = [f"Dialogue: 0,{_ass_time(s)},{_ass_time(e)},Default,,0,0,0,,{_ass_escape(t)}" for s, e, t in cues]
    path.write_text(header + "\n".join(lines) + "\n", encoding="utf-8")


def write_srt(cues: list[tuple[float, float, str]], path: Path) -> None:
    blocks = [f"{k}\n{_srt_time(s)} --> {_srt_time(e)}\n{t}\n" for k, (s, e, t) in enumerate(cues, 1)]
    path.write_text("\n".join(blocks), encoding="utf-8")
