"""Selectarea momentelor pentru clipuri, pornind exclusiv de la transcriere.

Fără model de limbaj și fără API: fiecare fereastră candidată este formată din propoziții
întregi și primește un scor explicabil din:
  * densitatea informației (cuvinte cu conținut / secundă, diversitate lexicală)
  * completitudinea (începe la început de propoziție, se termină cu punctuație finală,
    nu începe cu un conector de tip „și”, „dar”, „deci” care depinde de context)
  * pauzele de la margini (tăieturi naturale)
  * acoperirea cu vorbire (fără tăceri lungi în interior)
  * încrederea transcrierii (cuvinte recunoscute cu probabilitate mare)

Titlurile și descrierile sunt extrase din replicile reale ale clipului — nu se inventează nimic.
"""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass, field

STOPWORDS_RO = set("""
a abia acea aceasta această aceea aceeasi aceeași acei aceia acel acela acele acelea acest acesta aceste acestea acestei
acestui acestia aceștia acolo acum adica adică ai aia aibă aici al ala ale alea ălea alt alta altceva altcineva alte altfel
alti alții altul am anume apoi ar are as aș asa așa asta astazi astăzi astea ăsta ăstea ăștia asupra atare atat atât atata
atâta atatea atâtea atatia atâția ati ați atit atît atunci au avea avem aveți avut azi ba bine bucur buna bună ca că caci
căci cand când care careia căreia carora cărora caruia căruia cat cât catre către ce cea ceea cei ceilalti ceilalți cel cele
celor ceva chiar ci cind cînd cine cineva cit cît cita cîte cât câte cu cum cumva da daca dacă dar dat de deasupra deci
decat decât deja desi deși despre din dintr dintre doar doi doilea două drept dupa după e ea ei el ele era eram este esti
ești eu exact face fara fără fata față fel fi fie fiecare fii fim fiu fiti fiți foarte fost frumos ha hai i ia iar ieri ii îi
il îl imi îmi in în inainte înainte inapoi înapoi inca încă incit încît intre între isi își iti îți la le li lor lui m ma mă
mai mare mea mei mele mereu meu mi mie mine mod mult multa multă multe multi mulți n ne nici nimeni nimic niste niște noi
nostru nouă nu numai o ori oricare orice oricum pai păi parca parcă pe pentru peste pina pînă până plus poate pot prea
prin printr putea putem puteți puțin s sa să sai sale sau său se si și sint sînt sunt suntem sunteți sus ta tale te ti ți
tine toata toată toate tocmai tot toti toți totul tu tuturor un una unde undeva unei unele uneori unor unui unul va vă vi
voi vom vor vreo vreun
the a an and or but so to of in on at for with is are was were be been it this that i you he she we they not do does did
have has had my your our their as by from just like really very
""".split())

CONNECTORS_START = {
    "și", "si", "dar", "iar", "deci", "că", "ca", "adică", "adica", "sau", "ori", "însă", "insa", "apoi", "atunci",
    "pentru", "fiindcă", "deoarece", "care", "așa", "asa", "plus", "or",
    "and", "but", "so", "because", "or", "then", "which",
}
FILLERS = {"ăă", "ăăă", "ăăăă", "îî", "îîî", "mmm", "mm", "hmm", "eee", "ee", "aaa", "uh", "um", "uhm", "ăm", "gen"}

TOKEN_RE = re.compile(r"[\wăâîșțĂÂÎȘȚşţŞŢ'-]+", re.UNICODE)
END_PUNCT = (".", "?", "!", "…")


def tokens(text: str) -> list[str]:
    return [t.lower() for t in TOKEN_RE.findall(text)]


def content_words(text: str) -> list[str]:
    return [t for t in tokens(text) if len(t) > 2 and t not in STOPWORDS_RO and not t.isdigit() and t not in FILLERS]


@dataclass
class Word:
    start: float
    end: float
    text: str
    prob: float = 1.0


@dataclass
class Sentence:
    words: list[Word] = field(default_factory=list)
    pause_before: float = 0.0
    pause_after: float = 0.0

    @property
    def start(self) -> float:
        return self.words[0].start

    @property
    def end(self) -> float:
        return self.words[-1].end

    @property
    def text(self) -> str:
        return "".join(w.text for w in self.words).strip()

    @property
    def ends_cleanly(self) -> bool:
        return self.text.rstrip().rstrip("\"'”»)").endswith(END_PUNCT)


def flatten_words(transcript: dict) -> list[Word]:
    words: list[Word] = []
    for seg in transcript.get("segments", []):
        ws = seg.get("words") or []
        if ws:
            for w in ws:
                if w["word"].strip():
                    words.append(Word(float(w["start"]), float(w["end"]), w["word"], float(w.get("probability", 1.0))))
        else:
            # fără marcaje pe cuvinte: distribuim uniform cuvintele segmentului
            parts = seg["text"].split()
            if not parts:
                continue
            step = (seg["end"] - seg["start"]) / len(parts)
            for k, p in enumerate(parts):
                s = seg["start"] + k * step
                words.append(Word(s, s + step, " " + p, 0.7))
    words.sort(key=lambda w: w.start)
    # marcaje monotone (Whisper produce ocazional suprapuneri minuscule)
    for a, b in zip(words, words[1:]):
        if b.start < a.end:
            a.end = max(a.start, b.start)
    return words


def split_sentences(words: list[Word], gap_split: float = 1.2, max_sentence: float = 25.0) -> list[Sentence]:
    sentences: list[Sentence] = []
    cur: list[Word] = []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        gap = (nxt.start - w.end) if nxt else 99.0
        ends = w.text.strip().rstrip("\"'”»)").endswith(END_PUNCT)
        if ends or gap >= gap_split or nxt is None:
            sentences.append(Sentence(cur))
            cur = []
    # propoziții foarte lungi fără punctuație: împărțim la cea mai mare pauză internă/virgulă
    result: list[Sentence] = []
    stack = list(reversed(sentences))
    while stack:
        s = stack.pop()
        if s.end - s.start <= max_sentence or len(s.words) < 4:
            result.append(s)
            continue
        best_k, best_v = None, -1.0
        for k in range(1, len(s.words) - 1):
            gap = s.words[k + 1].start - s.words[k].end
            v = gap + (0.5 if s.words[k].text.strip().endswith((",", ";", ":")) else 0.0)
            if v > best_v:
                best_k, best_v = k, v
        stack.append(Sentence(s.words[best_k + 1:]))
        stack.append(Sentence(s.words[: best_k + 1]))
    for i, s in enumerate(result):
        s.pause_before = s.start - result[i - 1].end if i > 0 else s.start
        s.pause_after = result[i + 1].start - s.end if i + 1 < len(result) else 5.0
    return result


def _clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


@dataclass
class Candidate:
    i: int
    j: int
    start: float
    end: float
    text: str
    score: float
    parts: dict

    @property
    def duration(self) -> float:
        return self.end - self.start


def _bounds(sents: list[Sentence], i: int, j: int, total: float) -> tuple[float, float]:
    """Margini cu puțin „aer”, fără să intre în cuvintele vecine."""
    first, last = sents[i], sents[j]
    pad_start = min(0.25, max(first.pause_before, 0) * 0.5)
    pad_end = min(0.45, max(last.pause_after, 0) * 0.5)
    return max(0.0, first.start - pad_start), min(total, last.end + pad_end)


def score_window(sents: list[Sentence], i: int, j: int, start: float, end: float) -> tuple[float, dict]:
    words = [w for s in sents[i: j + 1] for w in s.words]
    text = " ".join(s.text for s in sents[i: j + 1])
    dur = max(end - start, 0.1)
    cw = content_words(text)
    toks = tokens(text)

    density = _clamp((len(cw) / dur) / 1.4)
    diversity = len(set(cw)) / len(cw) if cw else 0.0
    info = 0.7 * density + 0.3 * diversity

    first_tok = toks[0] if toks else ""
    prev_clean = i == 0 or sents[i - 1].ends_cleanly
    start_ok = 1.0 if prev_clean else 0.5
    if first_tok in CONNECTORS_START:
        start_ok *= 0.4
    end_ok = 1.0 if sents[j].ends_cleanly else 0.45
    completeness = 0.5 * start_ok + 0.5 * end_ok

    pauses = 0.5 * _clamp(sents[i].pause_before / 0.7) + 0.5 * _clamp(sents[j].pause_after / 0.7)

    spoken = sum(w.end - w.start for w in words)
    coverage = _clamp(spoken / dur / 0.75)
    max_gap = max((b.start - a.end for a, b in zip(words, words[1:])), default=0.0)
    gap_penalty = _clamp((max_gap - 2.0) / 3.0) * 15

    confidence = sum(w.prob for w in words) / len(words) if words else 0.0
    filler_ratio = sum(1 for t in toks if t in FILLERS) / max(len(toks), 1)
    filler_penalty = _clamp(filler_ratio / 0.08) * 10

    score = 100 * (0.32 * info + 0.28 * completeness + 0.14 * pauses + 0.12 * coverage + 0.14 * confidence)
    score -= gap_penalty + filler_penalty
    parts = {
        "densitate": round(info, 2), "completitudine": round(completeness, 2), "pauze": round(pauses, 2),
        "acoperire": round(coverage, 2), "încredere": round(confidence, 2),
    }
    return round(score, 1), parts


def find_candidates(sents: list[Sentence], total: float, min_d: float, max_d: float) -> list[Candidate]:
    cands: list[Candidate] = []
    for i in range(len(sents)):
        for j in range(i, len(sents)):
            start, end = _bounds(sents, i, j, total)
            dur = end - start
            if dur > max_d:
                break
            if dur < min_d:
                continue
            score, parts = score_window(sents, i, j, start, end)
            text = " ".join(s.text for s in sents[i: j + 1])
            cands.append(Candidate(i, j, round(start, 3), round(end, 3), text, score, parts))
    return cands


def _jaccard(a: set, b: set) -> float:
    return len(a & b) / len(a | b) if a and b else 0.0


def select(cands: list[Candidate], max_count: int, min_gap: float = 1.0, max_similarity: float = 0.45) -> list[Candidate]:
    chosen: list[Candidate] = []
    chosen_words: list[set] = []
    for c in sorted(cands, key=lambda c: c.score, reverse=True):
        if len(chosen) >= max_count:
            break
        if any(c.start < o.end + min_gap and o.start < c.end + min_gap for o in chosen):
            continue
        cw = set(content_words(c.text))
        if any(_jaccard(cw, ow) > max_similarity for ow in chosen_words):
            continue
        chosen.append(c)
        chosen_words.append(cw)
    return sorted(chosen, key=lambda c: c.start)


def fmt_ts(sec: float) -> str:
    sec = max(sec, 0)
    h, rem = divmod(int(sec), 3600)
    m, s = divmod(rem, 60)
    return f"{h:d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def _truncate(text: str, limit: int) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",;:—-")
    return cut + "…"


def suggest_title(sents: list[Sentence]) -> str:
    """Titlu extras din cea mai informativă propoziție a clipului (cuvintele vorbitorului, nu inventate)."""
    def strip_lead(t: str) -> str:
        toks = t.split()
        while toks and toks[0].lower().strip(",.") in (CONNECTORS_START | FILLERS):
            toks.pop(0)
        return " ".join(toks)

    ranked = sorted(
        sents,
        key=lambda s: (4 <= len(s.text.split()) <= 16, len(set(content_words(s.text)))),
        reverse=True,
    )
    base = strip_lead(ranked[0].text) if ranked else ""
    base = base or (ranked[0].text if ranked else "Fragment")
    base = base.rstrip(".…!,;: ")
    title = _truncate(base, 70)
    return title[:1].upper() + title[1:] if title else "Fragment"


def suggest_description(text: str, source_title: str, start: float, end: float) -> tuple[str, list[str]]:
    counts = Counter(w for w in content_words(text) if len(w) >= 4)
    keywords = [w for w, _ in counts.most_common(5)]
    excerpt = _truncate(text, 180)
    desc = f"Fragment din „{source_title}” ({fmt_ts(start)}–{fmt_ts(end)}). Extras din transcriere: „{excerpt}”"
    return desc, keywords


def sentences_of(transcript: dict) -> tuple[list[Sentence], float]:
    words = flatten_words(transcript)
    if not words:
        return [], float(transcript.get("duration") or 0)
    return split_sentences(words), float(transcript.get("duration") or words[-1].end)


def moment_from_span(sents: list[Sentence], i: int, j: int, total: float, source_title: str, nr: int,
                     score: float | None = None, parts: dict | None = None) -> dict:
    """Un moment format din propozițiile i..j (inclusiv), cu marginile în pauzele vecine."""
    start, end = _bounds(sents, i, j, total)
    if score is None:
        score, parts = score_window(sents, i, j, start, end)
    text = " ".join(s.text for s in sents[i: j + 1])
    desc, kw = suggest_description(text, source_title, start, end)
    return {
        "nr": nr, "i": i, "j": j,
        "start": round(start, 3), "end": round(end, 3), "duration": round(end - start, 2),
        "text": text, "title": suggest_title(sents[i: j + 1]), "description": desc, "keywords": kw,
        "score": score, "parts": parts or {}, "selected": True,
    }


def build_moments(transcript: dict, source_title: str, min_d: float, max_d: float,
                  count_min: int = 5, count_max: int = 10) -> dict:
    sents, total = sentences_of(transcript)
    if not sents:
        return {"moments": [], "candidates_total": 0, "note": "Transcrierea nu conține vorbire detectată."}
    cands = find_candidates(sents, total, min_d, max_d)
    picked = select(cands, count_max)
    moments = [moment_from_span(sents, c.i, c.j, total, source_title, n, c.score, c.parts)
               for n, c in enumerate(picked, 1)]
    note = None
    if len(moments) < count_min:
        note = (f"Materialul permite doar {len(moments)} momente distincte cu propoziții complete între "
                f"{min_d:.0f} și {max_d:.0f} secunde. Poți reduce durata minimă a clipurilor.")
    return {"moments": moments, "candidates_total": len(cands), "sentences": len(sents), "note": note,
            "min_d": min_d, "max_d": max_d}
