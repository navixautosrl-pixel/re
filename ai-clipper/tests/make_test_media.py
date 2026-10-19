"""Generează un videoclip de test autorizat, creat integral local (fără drepturi terțe):

* vorbire sintetică cu filtrul FFmpeg „flite” (voce engleză care citește un text românesc
  fără diacritice — pronunția e aproximativă, dar contează sincronizarea);
* imagine: fotografia „astronaut” (Eileen Collins, NASA, domeniu public) din scikit-image,
  mișcată lent pe un fundal 1280x720 — pentru testarea detectării feței;
  sau un model de test FFmpeg fără nicio față — pentru testarea rezervei cu fundal blurat.

Scrie și transcrierea de referință (ground truth) cu timpii reali ai fiecărei propoziții,
utilă pentru a testa etapele de după transcriere acolo unde modelul Whisper nu poate fi descărcat.

Utilizare: python tests/make_test_media.py <folder_iesire> [--no-face]
"""

from __future__ import annotations

import argparse
import json
import random
import subprocess
import sys
import unicodedata
import wave
from pathlib import Path

import numpy as np

SENTENCES = [
    "Bună ziua și bine ați venit la acest episod de test.",
    "Astăzi vorbim despre cum pregătești o înregistrare audio curată.",
    "Primul pas este alegerea unei camere liniștite, fără ecou puternic.",
    "Pereții goi reflectă sunetul, așa că perdelele și covoarele ajută mult.",
    "Al doilea pas este poziționarea microfonului la o distanță constantă.",
    "O distanță de aproximativ o palmă față de gură funcționează bine pentru voce.",
    "Dacă te miști prea mult, volumul vocii se schimbă de la o frază la alta.",
    "Al treilea pas este verificarea nivelului înainte de înregistrare.",
    "Vârfurile nu trebuie să atingă zona roșie a indicatorului.",
    "Este mai ușor să crești volumul după aceea decât să repari distorsiunea.",
    "Acum să vorbim despre editare.",
    "La editare, taie pauzele foarte lungi, dar păstrează ritmul natural al vorbirii.",
    "Respirațiile scurte pot rămâne, pentru că fac vocea să sune omenesc.",
    "Zgomotul de fond constant poate fi redus cu un filtru simplu.",
    "Nu exagera cu filtrul, altfel vocea începe să sune metalic.",
    "De ce contează toate acestea pentru clipurile scurte?",
    "Pentru că oamenii închid un clip în primele secunde dacă sunetul este neplăcut.",
    "Un sunet curat îi ajută să rămână atenți la mesaj.",
    "Subtitrările ajută la fel de mult, mai ales când telefonul este pe silențios.",
    "Multe persoane urmăresc clipuri fără sunet în transportul public.",
    "De aceea, textul trebuie să fie mare, contrastant și sincronizat corect.",
    "Ultimul sfat este să asculți înregistrarea completă înainte de publicare.",
    "Așa descoperi greșelile pe care nu le-ai observat în timpul editării.",
    "Verifică și drepturile pentru muzică sau imagini folosite în material.",
    "Folosește doar conținut pe care ai voie să îl publici.",
    "Pe scurt, cameră liniștită, microfon stabil, nivel corect și editare atentă.",
    "Cu acești pași simpli, orice înregistrare poate suna mult mai profesionist.",
    "Mulțumesc pentru atenție și ne auzim în episodul următor.",
]


def ascii_text(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def run(cmd: list[str]) -> None:
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f"Comanda a eșuat: {' '.join(cmd)}\n{res.stderr[-1500:]}")


def tts(text: str, out: Path) -> None:
    safe = ascii_text(text).replace("'", "").replace(":", " ").replace(",", " ,")
    run(["ffmpeg", "-hide_banner", "-y", "-f", "lavfi", "-i", f"flite=text='{safe}':voice=slt",
         "-ar", "16000", "-ac", "1", str(out)])


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)


def speech_span(samples: np.ndarray, sr: int = 16000) -> tuple[float, float]:
    frame = sr // 100
    energy = np.array([np.abs(samples[i:i + frame]).mean() for i in range(0, len(samples) - frame, frame)])
    active = np.where(energy > max(energy.max() * 0.05, 50))[0]
    if not len(active):
        return 0.0, len(samples) / sr
    return active[0] / 100, (active[-1] + 1) / 100


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("out_dir")
    ap.add_argument("--no-face", action="store_true")
    ap.add_argument("--seed", type=int, default=7)
    args = ap.parse_args()
    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    rnd = random.Random(args.seed)
    sr = 16000

    pieces, segments, t = [], [], 0.0
    lead = np.zeros(int(0.8 * sr), dtype=np.int16)
    pieces.append(lead)
    t += len(lead) / sr
    for k, text in enumerate(SENTENCES):
        wav = out / f"_s{k:02d}.wav"
        tts(text, wav)
        samples = read_wav(wav)
        wav.unlink()
        s0, s1 = speech_span(samples)
        start, end = t + s0, t + s1
        words = text.split()
        weights = [len(w) + 1 for w in words]
        tot = sum(weights)
        wlist, cur = [], start
        for w, wt in zip(words, weights):
            d = (end - start) * wt / tot
            wlist.append({"start": round(cur, 3), "end": round(cur + d * 0.92, 3), "word": " " + w, "probability": 0.95})
            cur += d
        segments.append({"start": round(start, 3), "end": round(end, 3), "text": text, "words": wlist})
        pieces.append(samples)
        t += len(samples) / sr
        gap = rnd.uniform(0.35, 1.3) if not text.endswith("?") else 0.5
        if k in (9, 17, 22):  # câteva pauze mai lungi, ca într-o vorbire reală
            gap = 1.6
        pieces.append(np.zeros(int(gap * sr), dtype=np.int16))
        t += gap

    audio = np.concatenate(pieces)
    audio_path = out / "speech.wav"
    with wave.open(str(audio_path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(audio.tobytes())
    total = len(audio) / sr

    video_path = out / ("test_no_face.mp4" if args.no_face else "test_face.mp4")
    if args.no_face:
        run(["ffmpeg", "-hide_banner", "-y", "-f", "lavfi", "-i", f"testsrc2=size=1280x720:rate=30:duration={total}",
             "-i", str(audio_path), "-shortest", "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
             "-c:a", "aac", str(video_path)])
    else:
        from skimage import data
        import cv2
        img = cv2.cvtColor(data.astronaut(), cv2.COLOR_RGB2BGR)   # 512x512
        img_path = out / "_astronaut.png"
        cv2.imwrite(str(img_path), cv2.resize(img, (600, 600)))
        # fața se află în stânga-sus a imaginii; imaginea oscilează ușor, decalată spre dreapta cadrului
        run(["ffmpeg", "-hide_banner", "-y",
             "-f", "lavfi", "-i", f"color=c=0x2b3a4a:size=1280x720:rate=30:duration={total}",
             "-loop", "1", "-i", str(img_path), "-i", str(audio_path),
             "-filter_complex", "[0:v][1:v]overlay=x='560+25*sin(t/2)':y=60:shortest=1[v]",
             "-map", "[v]", "-map", "2:a", "-t", f"{total:.3f}",
             "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-c:a", "aac", str(video_path)])
        img_path.unlink()
    audio_path.unlink()

    gt = {"model": "ground-truth", "requested_language": "ro", "language": "ro", "language_probability": 1.0,
          "duration": total, "segments": segments}
    (out / "ground_truth_transcript.json").write_text(json.dumps(gt, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({"video": str(video_path), "duration": round(total, 2), "sentences": len(segments)}))


if __name__ == "__main__":
    main()
