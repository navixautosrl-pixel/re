"""Test de interfață cap-coadă: un browser real folosește aplicația ca un utilizator.

    python tests/ui_flow.py --url http://127.0.0.1:8600 --video test.mp4 --mode real --language en
    python tests/ui_flow.py ... --mode inject --app-dir .   (fără model Whisper: transcriere injectată)

Opțiuni browser: --browser-path (Chromium) sau --channel msedge (Windows: redă și H.264).
Ieșire: cod 0 doar dacă toți pașii au trecut; capturi de ecran în --out.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import zipfile
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

STEP_TIMEOUT = 15 * 60 * 1000


class Flow:
    def __init__(self, page: Page, out: Path):
        self.page, self.out = page, out
        self.errors: list[str] = []
        self.n = 0
        page.on("pageerror", lambda e: self.errors.append(f"pageerror: {e}"))
        page.on("console", lambda m: m.type == "error" and self.errors.append(f"console: {m.text}"))

    def shot(self, name: str) -> None:
        self.n += 1
        self.page.screenshot(path=str(self.out / f"{self.n:02d}_{name}.png"))

    def step(self, msg: str) -> None:
        print(f"[UI] {msg}", flush=True)

    def wait_job_done(self, expect: str = "gata") -> str:
        """Așteaptă dispariția cardului de lucrare și întoarce mesajul notificării."""
        pg = self.page
        pg.wait_for_selector("#job-card", timeout=30_000)
        pg.wait_for_selector("#job-card", state="detached", timeout=STEP_TIMEOUT)
        toast = pg.locator(".toast").last
        toast.wait_for(timeout=10_000)
        text = toast.inner_text()
        if expect not in text:
            raise AssertionError(f"Lucrarea nu s-a terminat cum trebuia: {text}")
        return text


def run(args) -> int:
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    video = Path(args.video).resolve()
    with sync_playwright() as p:
        launch = {"executable_path": args.browser_path} if args.browser_path else {"channel": args.channel} if args.channel else {}
        browser = p.chromium.launch(**launch)
        ctx = browser.new_context(viewport={"width": 1440, "height": 920}, accept_downloads=True)
        page = ctx.new_page()
        f = Flow(page, out)
        page.set_default_timeout(30_000)
        page.goto(args.url)
        page.wait_for_selector("#system-text:has-text('Sistem pregătit')")
        f.shot("start")

        f.step("1. Drepturi + încărcare fișier")
        drop = page.locator(".drop")
        assert "disabled" in (drop.get_attribute("class") or ""), "încărcarea trebuie blocată fără confirmarea drepturilor"
        page.locator("#rights").check()
        page.locator("#file-input").set_input_files(str(video))
        # după import aplicația trece singură la transcriere; pasul „Sursă” apare bifat
        page.wait_for_selector("button.step.done:has-text('Sursă')", timeout=STEP_TIMEOUT)
        page.wait_for_selector("#start-transcribe")
        f.shot("importat")

        f.step("2. Transcriere")
        page.locator("button.step:has-text('Transcriere')").click()
        if args.mode == "real":
            page.locator("#lang").select_option(args.language)
            page.locator("#start-transcribe").click()
            f.wait_job_done()
            page.wait_for_selector(".clip", timeout=60_000)  # momentele se aleg automat după transcriere
        else:
            sys.path.insert(0, str(Path(args.app_dir).resolve()))
            from clipper.project import Project
            pid = page.evaluate("() => S.pid")
            proj = Project.load_or_create(pid)
            proj.transcript_path.write_text(Path(args.transcript).read_text(encoding="utf-8"), encoding="utf-8")
            data = json.loads(proj.transcript_path.read_text(encoding="utf-8"))
            proj.state["transcript_meta"] = {"model": "referință", "language": data.get("language"), "segments": len(data["segments"])}
            proj.save()
            proj.mark("audio")
            proj.mark("transcript")
            page.reload()
            page.locator("button.step:has-text('Momente')").click()
            page.locator("#p-min").fill("15")
            page.locator("#p-max").fill("30")
            page.locator("#find-moments").click()
            page.wait_for_selector(".clip", timeout=60_000)
        n_auto = page.locator(".clip").count()
        assert n_auto >= 1, "niciun moment găsit"
        f.shot("momente")

        f.step("3. Editări: titlu, subtitrare, propoziție în plus, clip manual, scoatere din export")
        first = page.locator(".clip").first
        title = first.locator("input.inline")
        title.fill("Titlul meu de test")
        title.press("Enter")
        page.wait_for_selector(".toast:has-text('Titlu salvat')")
        first.locator("button:has-text('Subtitrări')").click()
        cue = page.locator("dialog .cue input").first
        cue.fill("Text corectat în test")
        cue.press("Tab")
        page.wait_for_selector("dialog .edited:has-text('corectat')")
        f.shot("subtitrari")
        page.locator("dialog button:has-text('Gata')").click()
        page.wait_for_selector(".clip .tag:has-text('subtitrări corectate')")
        end_before = first.locator(".clip-time .num").inner_text()
        first.locator("button[aria-label='Adaugă o propoziție la sfârșit']").click()
        time.sleep(1.5)
        end_after = page.locator(".clip").first.locator(".clip-time .num").inner_text()
        f.step(f"   interval: {end_before} -> {end_after}")
        assert page.locator(".clip").first.locator("input.inline").input_value() == "Titlul meu de test"
        page.locator("#add-manual").click()
        sents = page.locator("dialog button.sent")
        sents.nth(1).click()
        sents.nth(3).click()
        page.locator("dialog button:has-text('Adaugă clipul')").click()
        page.wait_for_selector(".toast:has-text('Clip adăugat')")
        page.wait_for_function(f"() => document.querySelectorAll('.clip').length === {n_auto + 1}")
        assert page.locator(".clip .badge.left:has-text('manual')").count() == 1
        if n_auto >= 2:
            last = page.locator(".clip").last
            last.locator("input[type=checkbox]").uncheck()
            page.wait_for_function("() => document.querySelectorAll('.clip.off').length === 1")
            assert page.locator("#sel-count").inner_text().startswith(f"{n_auto} clipuri selectate"), page.locator("#sel-count").inner_text()
        n_export = page.locator(".clip:not(.off)").count()
        f.shot("editari")

        f.step(f"4. Export: karaoke + eliminare pauze, {n_export} clipuri")
        page.locator("#to-export").click()
        page.locator(".seg button:has-text('Vertical 9:16')").click()
        page.locator(".style-card:has-text('Karaoke')").click()
        page.locator("#sw-cut_pauses").check()
        page.wait_for_selector(".preview .cap-karaoke b")
        f.shot("setari_export")
        page.locator("#run-export").click()
        f.wait_job_done()
        page.wait_for_selector(".result")
        assert page.locator(".result").count() == n_export, "numărul de clipuri exportate diferă de selecție"
        assert page.locator(".result .chip.ok:has-text('Verificat')").count() == n_export, "un clip nu a trecut verificarea"
        assert page.locator(".result .chip:has-text('1080×1920')").count() == n_export
        f.shot("rezultate")

        f.step("5. Redare video în browser")
        can = page.evaluate("() => document.createElement('video').canPlayType('video/mp4; codecs=\"avc1.640028, mp4a.40.2\"')")
        if can:
            ok = page.evaluate("""async () => {
                const v = document.querySelector('.result video');
                v.preload = 'auto'; v.muted = true; v.load();
                await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error('eroare video')); setTimeout(() => rej(new Error('timeout')), 20000); });
                await v.play(); await new Promise(r => setTimeout(r, 1200)); v.pause();
                return { t: v.currentTime, d: v.duration, w: v.videoWidth, h: v.videoHeight };
            }""")
            f.step(f"   redare: {ok}")
            assert ok["t"] > 0.3 and ok["w"] == 1080 and ok["h"] == 1920, ok
        else:
            f.step("   browserul nu are H.264 (Chromium open-source); redarea nu poate fi verificată aici")

        f.step("6. Descărcări: ZIP și CSV")
        with page.expect_download() as d:
            page.locator("a:has-text('Descarcă tot (ZIP)')").click()
        zpath = out / "export.zip"
        d.value.save_as(zpath)
        names = zipfile.ZipFile(zpath).namelist()
        assert sum(n.endswith(".mp4") for n in names) == n_export and "clipuri.csv" in names, names
        assert sum(n.endswith(".jpg") for n in names) == n_export, "lipsesc coperți"
        with page.expect_download() as d:
            page.locator("a.btn:has-text('CSV')").click()
        csv_path = out / "clipuri.csv"
        d.value.save_as(csv_path)
        csv_text = csv_path.read_text(encoding="utf-8-sig")
        assert "Titlul meu de test" in csv_text
        cut = page.locator(".result .chip:has-text('pauze scoase')").count()
        f.step(f"   ZIP: {len(names)} fișiere; clipuri cu pauze scoase: {cut}")

        f.step("7. Anulare + reluare (export 1:1)")
        page.locator(".seg button:has-text('Pătrat 1:1')").click()
        page.locator("#run-export").click()
        page.wait_for_selector("#job-card")
        page.wait_for_function("() => (S.project.job && S.project.job.progress > 0.02)", timeout=120_000)
        page.locator("#job-card button:has-text('Anulează')").click()
        f.wait_job_done(expect="anulat")
        page.locator("#run-export").click()
        f.wait_job_done()
        page.wait_for_function(f"() => document.querySelectorAll('.result .chip').length && [...document.querySelectorAll('.result .chip')].filter(c => c.textContent === '1080×1080').length === {n_export}")
        f.shot("dupa_reluare")

        f.step("8. Confirmarea exportului")
        page.locator("button:has-text('Confirmă exportul')").click()
        page.locator("dialog button:has-text('Confirmă și șterge sursa')").click()
        page.wait_for_selector(".toast:has-text('Șterse')")
        page.wait_for_selector(".alert:has-text('Exportul a fost confirmat')")
        f.shot("confirmat")

        browser.close()
    real_errors = [e for e in f.errors if "Video source error" not in e or can]
    if real_errors:
        print("[UI] Erori în pagină:\n" + "\n".join(real_errors))
        return 1
    print("[UI] TOATE VERIFICĂRILE AU TRECUT", flush=True)
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--video", required=True)
    ap.add_argument("--mode", choices=["real", "inject"], default="real")
    ap.add_argument("--language", default="ro")
    ap.add_argument("--transcript")
    ap.add_argument("--app-dir", default=".")
    ap.add_argument("--browser-path")
    ap.add_argument("--channel")
    ap.add_argument("--out", default="ui-shots")
    return run(ap.parse_args())


if __name__ == "__main__":
    sys.exit(main())
