"""Încadrare verticală: decupaj fix pe fața detectată, cu rezervă pe fundal blurat.

Ce face, concret: eșantionează cadre din intervalul clipului, detectează fețe frontale
cu clasificatorul Haar inclus în OpenCV și calculează poziția orizontală mediană a celei
mai mari fețe. Dacă fața apare în suficiente cadre și nu se deplasează mult, clipul se
decupează 9:16 FIX în jurul acelei poziții. NU este urmărire continuă cadru cu cadru.
Dacă detectarea eșuează (fără față, mai multe persoane depărtate, mișcare mare),
se folosește fundalul blurat — nu se ghicește o poziție.
"""

from __future__ import annotations

import statistics
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Framing:
    mode: str              # "face" | "blur" | "center"
    crop_x: int | None     # coloana din stânga a decupajului (în pixeli sursă), doar pentru face/center
    crop_w: int | None
    detail: str


def detect_face_framing(video: Path, start: float, end: float, src_w: int, src_h: int,
                        samples: int = 24, min_hit_ratio: float = 0.5) -> Framing:
    crop_w = int(round(src_h * 9 / 16)) // 2 * 2
    if src_w <= crop_w:
        return Framing("blur", None, None, "Sursa este deja verticală/îngustă — se folosește încadrare cu fundal.")
    try:
        import cv2
    except ImportError:
        return Framing("blur", None, None, "OpenCV nu este instalat — fundal blurat.")

    cascade_path = Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml"
    cascade = cv2.CascadeClassifier(str(cascade_path))
    if cascade.empty():
        return Framing("blur", None, None, "Clasificatorul de fețe nu a putut fi încărcat — fundal blurat.")

    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        return Framing("blur", None, None, "Videoclipul nu a putut fi deschis cu OpenCV — fundal blurat.")

    centers: list[float] = []
    checked = 0
    dur = max(end - start, 0.1)
    try:
        for k in range(samples):
            t = start + dur * (k + 0.5) / samples
            cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
            ok, frame = cap.read()
            if not ok or frame is None:
                continue
            checked += 1
            scale = 640 / frame.shape[1] if frame.shape[1] > 640 else 1.0
            small = cv2.resize(frame, None, fx=scale, fy=scale) if scale != 1.0 else frame
            gray = cv2.equalizeHist(cv2.cvtColor(small, cv2.COLOR_BGR2GRAY))
            min_side = max(24, int(small.shape[0] * 0.08))
            faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=(min_side, min_side))
            if len(faces):
                x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
                centers.append((x + w / 2) / scale)
    finally:
        cap.release()

    if checked == 0:
        return Framing("blur", None, None, "Nu s-au putut citi cadre — fundal blurat.")
    ratio = len(centers) / checked
    if ratio < min_hit_ratio:
        return Framing("blur", None, None,
                       f"Față detectată doar în {len(centers)}/{checked} cadre — fundal blurat.")
    median_x = statistics.median(centers)
    spread = statistics.pstdev(centers) if len(centers) > 1 else 0.0
    if spread > crop_w * 0.22:
        return Framing("blur", None, None,
                       f"Fața/fețele se mută mult în cadru (abatere {spread:.0f}px) — fundal blurat.")
    crop_x = int(round(median_x - crop_w / 2))
    crop_x = max(0, min(src_w - crop_w, crop_x)) // 2 * 2
    return Framing("face", crop_x, crop_w,
                   f"Față detectată în {len(centers)}/{checked} cadre; decupaj fix centrat pe x≈{median_x:.0f}px.")


def center_framing(src_w: int, src_h: int) -> Framing:
    crop_w = int(round(src_h * 9 / 16)) // 2 * 2
    if src_w <= crop_w:
        return Framing("blur", None, None, "Sursa este deja verticală — încadrare cu fundal.")
    return Framing("center", (src_w - crop_w) // 2 // 2 * 2, crop_w, "Decupaj vertical centrat.")
