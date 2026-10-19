"""Subtitrări per clip, construite din marcajele temporale ale cuvintelor din transcriere.

Un „cue” este un dicționar {"s", "e", "text", "words": [{"s", "e", "w"}]} cu timpi relativi la
începutul clipului. Textul vine din transcriere; utilizatorul îl poate corecta în editor.
Nu se traduce și nu se rescrie nimic automat.
"""

from __future__ import annotations

from pathlib import Path

from .moments import Word, flatten_words

MAX_CHARS = 24
MAX_SECONDS = 3.2
MIN_DISPLAY = 0.7

# culori ASS: &HAABBGGRR
WHITE = "&H00FFFFFF"
BLACK = "&H00000000"
YELLOW = "&H0000E5FF"

STYLES = {
    "clasic": "Clasic: alb cu contur",
    "galben": "Galben, majuscule",
    "cutie": "Alb pe fundal închis",
    "karaoke": "Karaoke: cuvântul rostit colorat",
    "fara": "Fără subtitrări în video",
}
POSITIONS = {"jos": "Jos", "mijloc": "Mijloc", "sus": "Sus"}
SIZES = {"mic": 64, "mediu": 80, "mare": 96}


def words_in_range(transcript: dict, start: float, end: float) -> list[Word]:
    out = []
    for w in flatten_words(transcript):
        mid = (w.start + w.end) / 2
        if start - 0.05 <= mid <= end + 0.05:
            out.append(Word(max(w.start - start, 0.0), min(w.end, end) - start, w.text.strip(), w.prob))
    return out


def build_cues(words: list[Word]) -> list[dict]:
    groups: list[list[Word]] = []
    cur: list[Word] = []
    for w in words:
        if not w.text:
            continue
        if cur:
            text_len = len(" ".join(x.text for x in cur)) + 1 + len(w.text)
            gap = w.start - cur[-1].end
            if text_len > MAX_CHARS or w.end - cur[0].start > MAX_SECONDS or gap > 0.8:
                groups.append(cur)
                cur = []
        cur.append(w)
        if w.text.endswith((".", "?", "!", "…", ",", ";", ":")):
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)

    cues = []
    for k, g in enumerate(groups):
        s, e = g[0].start, g[-1].end
        nxt = groups[k + 1][0].start if k + 1 < len(groups) else None
        # fără pâlpâire: prelungim până la următorul subtitlu dacă pauza e scurtă; durată minimă de afișare
        if nxt is not None and nxt - e < 0.5:
            e = nxt
        if e - s < MIN_DISPLAY:
            e = min(s + MIN_DISPLAY, nxt) if nxt is not None else s + MIN_DISPLAY
        e = max(e, s + 0.1)
        cues.append({
            "s": round(s, 3), "e": round(e, 3), "text": " ".join(w.text for w in g),
            "words": [{"s": round(w.start, 3), "e": round(w.end, 3), "w": w.text} for w in g],
        })
    return cues


def cues_for_range(transcript: dict, start: float, end: float) -> list[dict]:
    return build_cues(words_in_range(transcript, start, end))


def set_cue_text(cue: dict, text: str) -> dict:
    """Textul corectat de utilizator. Dacă s-a schimbat, timpii cuvintelor (folosiți la karaoke)
    se redistribuie în intervalul cue-ului proporțional cu lungimea cuvintelor."""
    text = " ".join(text.split())
    if text == cue["text"]:
        return cue
    words = text.split(" ") if text else []
    s, e = cue["s"], cue["e"]
    if cue.get("words"):
        s, e = cue["words"][0]["s"], cue["words"][-1]["e"]
    total = sum(len(w) + 1 for w in words) or 1
    out, t = [], s
    for w in words:
        d = (e - s) * (len(w) + 1) / total
        out.append({"s": round(t, 3), "e": round(t + d, 3), "w": w})
        t += d
    return {**cue, "text": text, "words": out, "edited": True}


# ---------------------------------------------------------------- eliminarea pauzelor

def keep_intervals(cues: list[dict], duration: float, max_gap: float = 0.6, pad: float = 0.12) -> list[tuple[float, float]]:
    """Intervalele păstrate când se elimină pauzele lungi: fiecare pauză dintre cuvinte mai lungă
    de max_gap se scurtează la ~2*pad. Cuvintele rămân întregi."""
    words = sorted((w for c in cues for w in c.get("words", [])), key=lambda w: w["s"])
    if not words:
        return [(0.0, duration)]
    first = words[0]["s"]
    intervals: list[list[float]] = [[max(0.0, first - pad) if first > max_gap else 0.0, 0.0]]
    prev_end = words[0]["e"]
    for w in words[1:]:
        if w["s"] - prev_end > max_gap:
            intervals[-1][1] = prev_end + pad
            intervals.append([w["s"] - pad, 0.0])
        prev_end = max(prev_end, w["e"])
    intervals[-1][1] = min(duration, prev_end + 0.35)
    return [(round(a, 3), round(b, 3)) for a, b in intervals if b - a > 0.05]


def remap(cues: list[dict], intervals: list[tuple[float, float]]) -> list[dict]:
    """Recalculează timpii subtitrărilor pe axa de timp de după eliminarea pauzelor."""
    offsets, acc = [], 0.0
    for a, b in intervals:
        offsets.append((a, b, acc))
        acc += b - a

    def m(t: float) -> float:
        for a, b, off in offsets:
            if t < a:
                return round(off, 3)
            if t <= b:
                return round(off + t - a, 3)
        return round(acc, 3)

    out = []
    for c in cues:
        out.append({**c, "s": m(c["s"]), "e": m(c["e"]),
                    "words": [{**w, "s": m(w["s"]), "e": m(w["e"])} for w in c.get("words", [])]})
    return [c for c in out if c["e"] > c["s"]]


# ---------------------------------------------------------------- scriere fișiere

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


def write_srt(cues: list[dict], path: Path) -> None:
    blocks = [f"{k}\n{_srt_time(c['s'])} --> {_srt_time(c['e'])}\n{c['text']}\n" for k, c in enumerate(cues, 1)]
    path.write_text("\n".join(blocks), encoding="utf-8")


def write_ass(cues: list[dict], path: Path, width: int, height: int, style: str = "clasic",
              position: str = "jos", size: str = "mediu", font: str = "Arial") -> None:
    scale = width / 1080
    fs = round(SIZES.get(size, 80) * scale)
    upper = style == "galben"
    primary = YELLOW if style == "galben" else WHITE
    border_style, outline, shadow, back = 1, round(5 * scale), 1, "&H80000000"
    if style == "galben":
        outline = round(6 * scale)
    if style == "cutie":
        border_style, outline, shadow, back = 3, round(14 * scale), 0, "&H50000000"
    tall = height / width >= 1.5
    if position == "sus":
        align, margin_v = 8, round(height * (0.12 if tall else 0.07))
    elif position == "mijloc":
        align, margin_v = 5, 0
    else:
        align, margin_v = 2, round(height * (0.22 if tall else 0.1))
    margin_lr = round(90 * scale)
    outline_colour = back if style == "cutie" else BLACK

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font},{fs},{primary},{primary},{outline_colour},{back},-1,0,0,0,100,100,0,0,{border_style},{outline},{shadow},{align},{margin_lr},{margin_lr},{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    def fmt(text: str) -> str:
        text = _ass_escape(text)
        return text.upper() if upper else text

    lines = []
    for c in cues:
        words = c.get("words") or []
        if style == "karaoke" and words:
            # câte un eveniment pentru fiecare cuvânt: tot textul, cu cuvântul rostit în galben
            for k, w in enumerate(words):
                t0 = c["s"] if k == 0 else w["s"]
                t1 = words[k + 1]["s"] if k + 1 < len(words) else c["e"]
                if t1 <= t0:
                    continue
                parts = [fmt(x["w"]) if j != k else f"{{\\1c{YELLOW}&}}{fmt(x['w'])}{{\\r}}"
                         for j, x in enumerate(words)]
                lines.append(f"Dialogue: 0,{_ass_time(t0)},{_ass_time(t1)},Default,,0,0,0,,{' '.join(parts)}")
        else:
            lines.append(f"Dialogue: 0,{_ass_time(c['s'])},{_ass_time(c['e'])},Default,,0,0,0,,{fmt(c['text'])}")
    path.write_text(header + "\n".join(lines) + "\n", encoding="utf-8")
