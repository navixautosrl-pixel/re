# -*- coding: utf-8 -*-
"""Audit în browser: fiecare pagină din export, la fiecare lățime."""
import os, re, sys, json
from playwright.sync_api import sync_playwright

BASE = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else "out"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
WIDTHS = [320, 360, 390, 414, 430, 768, 1024, 1280, 1440, 1920]

# Blocate de proxy-ul din sandbox, nu de site.
SANDBOX_BLOCKED = ("tawk.to", "callmebot", "googletagmanager")

pages = []
for root, _, names in os.walk(OUT):
    for n in names:
        if n != "index.html":
            continue
        rel = os.path.relpath(os.path.join(root, n), OUT)
        pages.append("/" if rel == "index.html" else "/" + rel[: -len("index.html")])
pages.sort()
pages.append("/404.html")

problems = []
def add(m): problems.append(m)

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME)

    for path in pages:
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        p = ctx.new_page()
        console, failed, pageerrors = [], [], []
        p.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
        p.on("pageerror", lambda e: pageerrors.append(str(e)))
        p.on("requestfailed", lambda r: failed.append("%s (%s)" % (r.url, r.failure))
             if r.failure != "net::ERR_ABORTED" else None)
        p.on("response", lambda r: failed.append("%d %s" % (r.status, r.url)) if r.status >= 400 else None)

        p.goto(BASE + path, wait_until="domcontentloaded")
        p.wait_for_timeout(700)
        # Închidem bannerul ca să nu raporteze el overflow-ul.
        p.evaluate("try{localStorage.setItem('cwp-consent',JSON.stringify({v:1,analytics:false,ts:Date.now()}))}catch(e){}")
        p.reload(wait_until="domcontentloaded")
        p.wait_for_timeout(900)

        for c in console:
            if any(s in c for s in SANDBOX_BLOCKED) or "ERR_TUNNEL" in c or "ERR_CERT" in c:
                continue
            add("[%s] consolă: %s" % (path, c[:170]))
        for e in pageerrors:
            add("[%s] eroare JS: %s" % (path, e[:170]))
        for f in failed:
            if any(s in f for s in SANDBOX_BLOCKED):
                continue
            add("[%s] request: %s" % (path, f[:170]))

        for w in WIDTHS:
            p.set_viewport_size({"width": w, "height": 900})
            p.wait_for_timeout(140)
            p.evaluate("window.scrollTo(9999, 0)")
            p.wait_for_timeout(100)
            sx = p.evaluate("window.scrollX")
            if sx:
                who = p.evaluate("""() => {
                    const out = [];
                    document.querySelectorAll('body *').forEach(el => {
                      const r = el.getBoundingClientRect();
                      if (r.right > innerWidth + 2 && r.width > 8)
                        out.push(el.tagName + '.' + (el.className||'').toString().slice(0,40));
                    });
                    return out.slice(0, 2);
                }""")
                add("[%s @%dpx] scroll orizontal %dpx -> %s" % (path, w, sx, who))
            p.evaluate("window.scrollTo(0, 0)")

        # Fiecare pagină trebuie să rămână utilizabilă fără mouse.
        p.set_viewport_size({"width": 1440, "height": 900})
        focusables = p.evaluate("""() => document.querySelectorAll(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ).length""")
        if focusables == 0:
            add("[%s] nu are niciun element focalizabil" % path)

        ctx.close()

    # --- fără animații, totul rămâne vizibil ---
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    p = ctx.new_page()
    for path in ["/", "/creare-site/", "/creare-site/balti-de-pescuit/", "/terms/"]:
        p.goto(BASE + path, wait_until="domcontentloaded")
        p.wait_for_timeout(900)
        hidden = p.evaluate("""() => {
            let n = 0;
            document.querySelectorAll('h1,h2,h3,p,img,footer,header').forEach(el => {
              if (getComputedStyle(el).opacity === '0') n++;
            });
            return n;
        }""")
        if hidden:
            add("[reduced-motion %s] %d elemente invizibile" % (path, hidden))
    ctx.close()

    # --- funcțional ---
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    p = ctx.new_page()
    p.goto(BASE + "/", wait_until="domcontentloaded")
    p.wait_for_timeout(1200)

    if not p.locator('[role="dialog"]', has_text="Cookie-uri").is_visible():
        add("[cookies] bannerul nu apare la prima vizită")
    else:
        p.get_by_role("button", name="Refuz").click()
        p.wait_for_timeout(800)
        if p.locator('[role="dialog"]').count() and p.locator('[role="dialog"]').first.is_visible():
            add("[cookies] bannerul rămâne după refuz")
        p.reload(wait_until="domcontentloaded"); p.wait_for_timeout(900)
        if p.locator('[role="dialog"]', has_text="Cookie-uri").count():
            add("[cookies] bannerul reapare deși există o alegere salvată")
        p.get_by_role("button", name="Preferințe cookie-uri").click()
        p.wait_for_timeout(700)
        if not p.locator('[role="dialog"]', has_text="Cookie-uri").is_visible():
            add("[cookies] butonul din subsol nu redeschide panoul")
        if not p.get_by_text("Analiză de trafic").is_visible():
            add("[cookies] redeschiderea nu arată categoriile")
        p.get_by_role("button", name="Salvează", exact=True).click()
        p.wait_for_timeout(700)

    # formularul trimite spre CallMeBot cu datele completate
    calls = []
    p.on("request", lambda r: calls.append(r.url) if "callmebot" in r.url else None)
    p.locator("#contact").scroll_into_view_if_needed(); p.wait_for_timeout(700)
    p.fill("#name", "Test Audit")
    p.fill("#email", "test@exemplu.ro")
    p.fill("#message", "Mesaj de verificare a formularului.")
    p.get_by_role("button", name="Trimite").first.click()
    p.wait_for_timeout(3000)
    if len(calls) != 1:
        add("[formular] %d cereri CallMeBot (aștept exact 1)" % len(calls))
    elif "apikey=9102404" not in calls[0] or "Test+Audit" not in calls[0].replace("%20", "+"):
        add("[formular] cererea nu conține cheia sau datele: %s" % calls[0][:120])

    # meniul mobil se deschide și duce undeva
    ctx.close()
    ctx = b.new_context(viewport={"width": 390, "height": 844})
    p = ctx.new_page()
    p.goto(BASE + "/", wait_until="domcontentloaded")
    p.evaluate("try{localStorage.setItem('cwp-consent',JSON.stringify({v:1,analytics:false,ts:Date.now()}))}catch(e){}")
    p.reload(wait_until="domcontentloaded"); p.wait_for_timeout(1100)
    p.locator("header button").first.click(); p.wait_for_timeout(800)
    links = p.locator("div.fixed a[href]").count()
    if links < 5:
        add("[meniu mobil] doar %d legături vizibile" % links)
    ctx.close()

    b.close()

print("Pagini verificate: %d × %d lățimi" % (len(pages), len(WIDTHS)))
print()
print("\n".join(problems) if problems else "Nicio problemă găsită.")
print("\n--- probleme: %d ---" % len(problems))
