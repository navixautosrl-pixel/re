"""Extragere audio cu FFmpeg și transcriere locală cu faster-whisper (CPU, int8).

Transcrierea se scrie incremental în transcript.partial.jsonl. Dacă procesul se oprește,
la reluare se transcrie doar audio rămas, pornind de la ultimul segment salvat.
"""

from __future__ import annotations

import gc
import json
import os
import re
import subprocess
import wave
from pathlib import Path
from typing import Callable

from .config import BUNDLE_DIR, MODELS_DIR
from .tools import CREATE_NO_WINDOW, Cancelled, ToolError, ffmpeg_path, probe

Progress = Callable[[float, str], None]

_DIACRITICS = str.maketrans({"ş": "ș", "Ş": "Ș", "ţ": "ț", "Ţ": "Ț"})


def normalize_ro(text: str) -> str:
    """Whisper scrie uneori ş/ţ cu sedilă; forma corectă în română este cu virgulă (ș/ț)."""
    return text.translate(_DIACRITICS)


def run_ffmpeg_with_progress(args: list[str], total_seconds: float, progress: Progress | None,
                             label: str, cwd: str | Path | None = None) -> None:
    """Rulează ffmpeg cu -progress pipe:1 și raportează procentul. Ridică ToolError la eșec."""
    cmd = [ffmpeg_path(), "-hide_banner", "-nostdin", "-y", "-progress", "pipe:1", "-nostats", *args]
    proc = subprocess.Popen(
        cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, encoding="utf-8", errors="replace", creationflags=CREATE_NO_WINDOW,
    )
    stderr_lines: list[str] = []

    # stderr se citește pe un fir separat ca să nu blocheze procesul când bufferul se umple
    import threading

    def drain() -> None:
        assert proc.stderr is not None
        for line in proc.stderr:
            stderr_lines.append(line)
            if len(stderr_lines) > 200:
                del stderr_lines[:100]

    t = threading.Thread(target=drain, daemon=True)
    t.start()
    assert proc.stdout is not None
    try:
        for line in proc.stdout:
            if line.startswith("out_time_us=") or line.startswith("out_time_ms="):
                try:
                    secs = int(line.split("=", 1)[1]) / 1_000_000
                except ValueError:
                    continue
                if progress and total_seconds > 0:
                    progress(min(secs / total_seconds, 1.0), f"{label}: {secs:.0f}s / {total_seconds:.0f}s")
    except BaseException:
        proc.kill()  # anulare sau eroare în callback: nu lăsăm ffmpeg să ruleze în fundal
        proc.wait()
        raise
    proc.wait()
    t.join(timeout=5)
    if proc.returncode != 0:
        tail = "".join(stderr_lines[-15:]).strip()
        raise ToolError(f"FFmpeg a eșuat ({label}). Detalii:\n{tail[-1500:]}")


def extract_audio(video: Path, out_wav: Path, progress: Progress | None = None,
                  start: float = 0.0) -> Path:
    """Audio mono 16 kHz WAV — formatul pe care Whisper îl folosește intern."""
    info = probe(video)
    if not info.has_audio:
        raise ToolError("Videoclipul nu conține pistă audio, deci nu poate fi transcris.")
    tmp = out_wav.with_name(out_wav.stem + ".tmp.wav")
    args = []
    if start > 0:
        args += ["-ss", f"{start:.3f}"]
    args += ["-i", str(video), "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(tmp)]
    run_ffmpeg_with_progress(args, max(info.duration - start, 0.1), progress, "Extragere audio")
    tmp.replace(out_wav)
    return out_wav


def load_wav_16k(path: Path):
    """Citește WAV-ul mono 16 kHz produs de extract_audio ca float32 în [-1, 1].

    Îl dăm direct modelului: faster-whisper 1.2.1 decodează altfel cu PyAV și apelează
    av.open(..., metadata_errors=...), parametru eliminat în PyAV 17+ (transcrierea ar eșua)."""
    import numpy as np

    with wave.open(str(path), "rb") as w:
        if w.getframerate() != 16000 or w.getnchannels() != 1 or w.getsampwidth() != 2:
            raise ToolError(f"Format audio neașteptat în {path.name}; reia etapa de extragere audio.")
        data = w.readframes(w.getnframes())
    return np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0


def _local_model_dir(model_name: str) -> Path | None:
    """Permite folosirea offline: models/faster-whisper-base/ cu model.bin, config.json etc."""
    for root in (MODELS_DIR, BUNDLE_DIR / "models"):  # descărcat de utilizator sau livrat în installer
        for cand in (root / f"faster-whisper-{model_name}", root / model_name):
            if (cand / "model.bin").is_file():
                return cand
    return None


def load_model(model_name: str):
    from faster_whisper import WhisperModel

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    local = _local_model_dir(model_name)
    threads = max(1, (os.cpu_count() or 2))
    try:
        if local:
            return WhisperModel(str(local), device="cpu", compute_type="int8", cpu_threads=threads)
        return WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=threads,
                            download_root=str(MODELS_DIR))
    except Exception as exc:  # huggingface_hub ridică mai multe tipuri de excepții de rețea
        raise ToolError(
            f"Modelul Whisper „{model_name}” nu a putut fi încărcat. La prima rulare modelul se descarcă "
            f"(base ≈ 145 MB, small ≈ 480 MB) de pe huggingface.co — verifică conexiunea la internet. "
            f"Alternativ, copiază manual modelul în folderul models\\faster-whisper-{model_name}\\. "
            f"Detalii: {exc}"
        ) from exc


def _read_partial(path: Path, model_name: str, language: str) -> tuple[dict | None, list[dict]]:
    if not path.exists():
        return None, []
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines:
        return None, []
    try:
        header = json.loads(lines[0]).get("_header")
    except json.JSONDecodeError:
        return None, []
    if not header or header.get("model") != model_name or header.get("requested_language") != language:
        return None, []
    segments = []
    for line in lines[1:]:
        try:
            segments.append(json.loads(line))
        except json.JSONDecodeError:
            break  # ultima linie poate fi incompletă dacă procesul a fost oprit brusc
    return header, segments


def transcribe(audio_wav: Path, transcript_path: Path, partial_path: Path, model_name: str,
               language: str, progress: Progress | None = None) -> dict:
    """language: cod ISO („ro”, „en”) sau „auto”."""
    if transcript_path.exists():
        data = json.loads(transcript_path.read_text(encoding="utf-8"))
        if data.get("model") == model_name and data.get("requested_language") == language:
            return data

    total = probe(audio_wav).duration
    header, segments = _read_partial(partial_path, model_name, language)
    offset = segments[-1]["end"] if segments else 0.0
    # Dacă a rămas foarte puțin audio netranscris, considerăm transcrierea completă.
    remaining = total - offset

    if header is None:
        segments, offset = [], 0.0
        header = {"model": model_name, "requested_language": language, "detected_language": None,
                  "language_probability": None}
        partial_path.write_text(json.dumps({"_header": header}, ensure_ascii=False) + "\n", encoding="utf-8")

    if remaining > 1.0:
        work_audio = audio_wav
        if offset > 0:
            work_audio = audio_wav.with_name("audio_resume.wav")
            if progress:
                progress(offset / total, f"Reluare de la {offset:.0f}s…")
            extract_audio(audio_wav, work_audio, None, start=offset)

        if progress:
            progress(offset / total, f"Se încarcă modelul Whisper „{model_name}” (CPU, int8)…")
        model = load_model(model_name)
        lang = header.get("detected_language") if language == "auto" else language
        try:
            seg_iter, info = model.transcribe(
                load_wav_16k(work_audio),
                language=lang,
                task="transcribe",
                beam_size=5,
                word_timestamps=True,
                vad_filter=True,
                vad_parameters={"min_silence_duration_ms": 500},
                condition_on_previous_text=False,  # reduce buclele de repetiție („halucinații”)
            )
            if header.get("detected_language") is None:
                header["detected_language"] = info.language
                header["language_probability"] = round(float(info.language_probability), 3)
                lines = partial_path.read_text(encoding="utf-8").splitlines()
                lines[0] = json.dumps({"_header": header}, ensure_ascii=False)
                partial_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

            with partial_path.open("a", encoding="utf-8") as fh:
                for seg in seg_iter:
                    # segmente cu probabilitate mare de „fără vorbire” și încredere mică = probabil halucinații
                    if seg.no_speech_prob > 0.6 and seg.avg_logprob < -1.0:
                        continue
                    text = normalize_ro(seg.text.strip())
                    if not text:
                        continue
                    words = [
                        {"start": round(w.start + offset, 3), "end": round(w.end + offset, 3),
                         "word": normalize_ro(w.word), "probability": round(float(w.probability), 3)}
                        for w in (seg.words or [])
                    ]
                    item = {"start": round(seg.start + offset, 3), "end": round(seg.end + offset, 3),
                            "text": text, "words": words}
                    segments.append(item)
                    fh.write(json.dumps(item, ensure_ascii=False) + "\n")
                    fh.flush()
                    if progress:
                        progress(min(item["end"] / total, 1.0),
                                 f"Transcriere: {item['end']:.0f}s / {total:.0f}s — „{text[:70]}”")
        except (ToolError, Cancelled):
            raise
        except Exception as exc:
            raise ToolError(f"Transcrierea a eșuat: {exc}. Apasă din nou pe buton pentru a relua.") from exc
        finally:
            del model
            gc.collect()
            if work_audio != audio_wav and work_audio.exists():
                work_audio.unlink()

    data = {
        "model": model_name,
        "requested_language": language,
        "language": header.get("detected_language") or language,
        "language_probability": header.get("language_probability"),
        "duration": total,
        "segments": segments,
    }
    transcript_path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    return data


def transcript_to_text(data: dict) -> str:
    def ts(s: float) -> str:
        return f"{int(s // 60):02d}:{int(s % 60):02d}"
    return "\n".join(f"[{ts(s['start'])}] {s['text']}" for s in data.get("segments", []))


_WS = re.compile(r"\s+")


def clean_text(text: str) -> str:
    return _WS.sub(" ", text).strip()
