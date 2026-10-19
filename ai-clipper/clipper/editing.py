"""Editarea momentelor înainte de export.

Toate tăieturile rămân pe granițe de propoziție: un clip se poate extinde sau scurta doar
cu propoziții întregi, iar un clip manual se alege tot din propoziții întregi.
"""

from __future__ import annotations

from .config import MAX_CLIP_SECONDS
from .moments import moment_from_span, sentences_of
from .subtitles import cues_for_range, set_cue_text
from .tools import ToolError

MIN_EDIT_SECONDS = 3.0   # sub această durată un clip nu mai are sens


def attach_cues(moment: dict, transcript: dict) -> dict:
    moment["cues"] = cues_for_range(transcript, moment["start"], moment["end"])
    return moment


def sentence_list(transcript: dict) -> list[dict]:
    sents, _ = sentences_of(transcript)
    return [{"i": k, "start": round(s.start, 2), "end": round(s.end, 2), "text": s.text} for k, s in enumerate(sents)]


def _rebuild(moment: dict, transcript: dict, source_title: str, i: int, j: int) -> dict:
    sents, total = sentences_of(transcript)
    if not (0 <= i <= j < len(sents)):
        raise ToolError("Nu mai există propoziții în acea direcție.")
    new = moment_from_span(sents, i, j, total, source_title, moment["nr"])
    if new["duration"] > MAX_CLIP_SECONDS + 0.01:
        raise ToolError(f"Clipul ar avea {new['duration']:.0f} s; maximum este {MAX_CLIP_SECONDS} s.")
    if new["duration"] < MIN_EDIT_SECONDS:
        raise ToolError("Clipul ar deveni prea scurt.")
    if moment.get("title_edited"):
        new["title"], new["title_edited"] = moment["title"], True
    new["selected"] = moment.get("selected", True)
    new["manual"] = moment.get("manual", False)
    attach_cues(new, transcript)
    carry_edited_cues(moment, new)
    return new


def carry_edited_cues(old: dict, new: dict) -> None:
    """Subtitrările corectate de utilizator care rămân în clip după extindere/scurtare își
    păstrează textul (recunoscute după timpii absoluți de început și sfârșit)."""
    if "start" not in old:
        return
    shift = old["start"] - new["start"]
    # cheia: începutul absolut al primului cuvânt (set_cue_text îl păstrează la editare)
    edited = {round(old["start"] + c["words"][0]["s"], 2): c
              for c in old.get("cues", []) if c.get("edited") and c.get("words")}
    if not edited:
        return
    for k, c in enumerate(new["cues"]):
        if not c.get("words"):
            continue
        prev = edited.get(round(new["start"] + c["words"][0]["s"], 2))
        if prev:
            new["cues"][k] = {**prev, "s": c["s"], "e": c["e"],
                              "words": [{**w, "s": round(w["s"] + shift, 3), "e": round(w["e"] + shift, 3)}
                                        for w in prev["words"]]}


def adjust(moment: dict, transcript: dict, source_title: str, edge: str, delta: int) -> dict:
    """edge: „start” sau „end”; delta: +1 adaugă o propoziție în acea parte, -1 scoate una."""
    if "i" not in moment:
        raise ToolError("Acest clip a fost creat de o versiune mai veche; recalculează momentele.")
    i, j = moment["i"], moment["j"]
    if edge == "start":
        i -= delta
    elif edge == "end":
        j += delta
    else:
        raise ToolError("Margine necunoscută.")
    if i > j:
        raise ToolError("Clipul trebuie să conțină cel puțin o propoziție.")
    return _rebuild(moment, transcript, source_title, i, j)


def manual(transcript: dict, source_title: str, i: int, j: int, nr: int) -> dict:
    if i > j:
        i, j = j, i
    m = _rebuild({"nr": nr, "manual": True}, transcript, source_title, i, j)
    m["manual"] = True
    m["score"] = None
    return m


def edit_cue(moment: dict, index: int, text: str) -> dict:
    cues = moment.get("cues") or []
    if not 0 <= index < len(cues):
        raise ToolError("Subtitrare inexistentă.")
    if not text.strip():
        raise ToolError("Textul subtitrării nu poate fi gol. Pentru a o elimina, scurtează clipul.")
    cues[index] = set_cue_text(cues[index], text)
    moment["cues"] = cues
    return moment
