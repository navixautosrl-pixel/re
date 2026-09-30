# -*- coding: utf-8 -*-
"""
Audit static complet al exportului din `out/`.

Nu deschide browserul: citește fișierele livrate, exact cum le va citi
serverul și crawlerul. Verifică lucrurile pe care un pas prin browser le
ratează — legături care duc într-un fișier inexistent, ancore către id-uri
care nu există, fișiere lipsă, legături absolute către domeniul propriu,
sitemap-ul, canonical-ul, symlink-uri, majuscule în nume de fișiere.
"""
import io, json, os, re, sys, collections

OUT = sys.argv[1] if len(sys.argv) > 1 else "out"
DOMAIN = "crearewebsitepro.ro"

problems = []
notes = []


def add(msg):
    problems.append(msg)


# --------------------------------------------------------------------------
# Inventarul fișierelor livrate
# --------------------------------------------------------------------------
files = set()
symlinks = []
upper = []
for root, dirs, names in os.walk(OUT):
    for n in names:
        full = os.path.join(root, n)
        rel = os.path.relpath(full, OUT)
        if os.path.islink(full):
            symlinks.append(rel)
        files.add(rel.replace(os.sep, "/"))
        if rel != rel.lower():
            upper.append(rel)
    for d in dirs:
        full = os.path.join(root, d)
        if os.path.islink(full):
            symlinks.append(os.path.relpath(full, OUT) + "/")

html_pages = sorted(f for f in files if f.endswith(".html"))

print("Fișiere livrate: %d   (pagini HTML: %d)" % (len(files), len(html_pages)))

# Symlink-urile se rup la dezarhivare pe multe găzduiri partajate și pot
# ieși din rădăcina site-ului. Într-un export static nu au ce căuta.
if symlinks:
    add("[symlink] %d symlink-uri în export: %s" % (len(symlinks), symlinks[:5]))
else:
    notes.append("symlink-uri: 0")

# Serverele Linux sunt sensibile la majuscule; Windows și macOS nu. Un fișier
# cu majusculă merge la tine și dă 404 pe găzduire.
if upper:
    notes.append("fișiere cu majuscule (verifică referințele): %s" % upper[:6])


# --------------------------------------------------------------------------
# Parsare
# --------------------------------------------------------------------------
def read(rel):
    return io.open(os.path.join(OUT, rel), encoding="utf-8", errors="replace").read()


def strip_scripts(html):
    html = re.sub(r"<script.*?</script>", " ", html, flags=re.S)
    return re.sub(r"<style.*?</style>", " ", html, flags=re.S)


def text_of(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", strip_scripts(html))).strip()


def url_for(page):
    """Calea publică a unei pagini: creare-site/x/index.html -> /creare-site/x/"""
    if page == "index.html":
        return "/"
    if page.endswith("/index.html"):
        return "/" + page[: -len("index.html")]
    return "/" + page


def resolve(href, from_page):
    """Fișierul din export către care duce un href intern, sau None."""
    path = href.split("#")[0].split("?")[0]
    if not path:
        return from_page
    if path.startswith("/"):
        p = path.lstrip("/")
    else:
        base = os.path.dirname(from_page)
        p = os.path.normpath(os.path.join(base, path)).replace(os.sep, "/")
    if p == "" or p.endswith("/"):
        cand = (p + "index.html").lstrip("/")
    elif (p + "/index.html") in files:
        cand = p + "/index.html"
    else:
        cand = p
    return cand if cand in files else None


ids_by_page = {}
meta_by_page = {}
internal_links = 0
external = collections.Counter()

for page in html_pages:
    html = read(page)
    body = html.split("<body", 1)[1] if "<body" in html else html
    ids_by_page[page] = set(re.findall(r'\bid="([^"]+)"', body))

    def meta(name, attr="name"):
        m = re.search(r'<meta %s="%s" content="([^"]*)"' % (attr, name), html)
        return m.group(1) if m else None

    t = re.search(r"<title>(.*?)</title>", html, re.S)
    meta_by_page[page] = {
        "url": url_for(page),
        "title": (t.group(1).strip() if t else None),
        "desc": meta("description"),
        "robots": meta("robots"),
        "canonical": (re.search(r'<link rel="canonical" href="([^"]*)"', html) or [None, None])[1],
        "og_title": meta("og:title", "property"),
        "og_image": meta("og:image", "property"),
        "lang": (re.search(r'<html lang="([^"]*)"', html) or [None, None])[1],
        "h1": [re.sub(r"<[^>]+>", "", h).strip() for h in re.findall(r"<h1[^>]*>(.*?)</h1>", body, re.S)],
        "headings": re.findall(r"<(h[1-6])[^>]*>", body),
        "words": len(text_of(body).split()),
        "ld": re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S),
        "imgs": re.findall(r"<img\b([^>]*)>", body),
    }

# --------------------------------------------------------------------------
# 1. Legături
# --------------------------------------------------------------------------
for page in html_pages:
    html = read(page)
    body = strip_scripts(html.split("<body", 1)[1] if "<body" in html else html)
    for href in re.findall(r'<a\b[^>]*?\bhref="([^"]*)"', body):
        href = href.strip()
        if not href or href.startswith(("mailto:", "tel:", "javascript:", "data:")):
            continue
        if href.startswith(("http://", "https://")):
            external[href.split("/")[2]] += 1
            if DOMAIN in href:
                add("[link] %s trimite absolut către propriul domeniu: %s" % (url_for(page), href))
            continue
        internal_links += 1
        target = resolve(href, page)
        if target is None:
            add("[link rupt] %s -> %s" % (url_for(page), href))
            continue
        if "#" in href:
            anchor = href.split("#", 1)[1]
            if anchor and anchor not in ids_by_page.get(target, set()):
                add("[ancoră lipsă] %s -> %s (id inexistent în %s)" % (url_for(page), href, url_for(target)))
        # trailingSlash: true — o legătură fără / finală provoacă o redirecționare
        p = href.split("#")[0]
        if p and not p.endswith("/") and "." not in os.path.basename(p):
            add("[trailing slash] %s -> %s (lipsește / final; next.config are trailingSlash: true)" % (url_for(page), href))

print("Legături interne verificate: %d" % internal_links)
print("Domenii externe legate: %s" % dict(external))

# --------------------------------------------------------------------------
# 2. Resurse (css, js, imagini, fonturi, icon-uri)
# --------------------------------------------------------------------------
assets = 0
for page in html_pages:
    html = read(page)
    refs = re.findall(r'<(?:link|script|img|source)\b[^>]*?\b(?:href|src)="([^"]*)"', html)
    for ref in refs:
        if ref.startswith(("http", "data:", "mailto:", "#")) or not ref:
            continue
        assets += 1
        if resolve(ref, page) is None:
            add("[resursă lipsă] %s -> %s" % (url_for(page), ref))
print("Resurse verificate: %d" % assets)

# --------------------------------------------------------------------------
# 3. SEO pe fiecare pagină
# --------------------------------------------------------------------------
titles = collections.Counter()
descs = collections.Counter()

for page, m in meta_by_page.items():
    u = m["url"]
    is404 = page == "404.html" or "_not-found" in page
    noindex = (m["robots"] or "").startswith("noindex")

    if not m["title"]:
        add("[seo] %s nu are <title>" % u)
    elif len(m["title"]) > 70:
        add("[seo] %s titlu de %d caractere" % (u, len(m["title"])))
    if not m["desc"] and not is404:
        add("[seo] %s nu are meta description" % u)
    elif m["desc"] and not (100 <= len(m["desc"]) <= 170) and not is404:
        add("[seo] %s meta description de %d caractere" % (u, len(m["desc"])))
    if m["lang"] != "ro":
        add("[seo] %s lang=%r" % (u, m["lang"]))
    if len(m["h1"]) != 1:
        add("[seo] %s are %d elemente h1" % (u, len(m["h1"])))
    if not is404 and not m["canonical"]:
        add("[seo] %s nu are canonical" % u)
    if m["canonical"] and DOMAIN not in m["canonical"]:
        add("[seo] %s canonical pe alt domeniu: %s" % (u, m["canonical"]))
    if not is404 and not noindex and not m["og_image"]:
        add("[seo] %s nu are og:image" % u)
    if not is404 and not noindex and m["words"] < 250:
        add("[seo] %s are doar %d cuvinte" % (u, m["words"]))

    prev = 0
    for tag in m["headings"]:
        lvl = int(tag[1])
        if prev and lvl > prev + 1:
            add("[seo] %s salt de la h%d la h%d" % (u, prev, lvl))
            break
        prev = lvl

    if not noindex and not is404:
        if m["title"]:
            titles[m["title"]] += 1
        if m["desc"]:
            descs[m["desc"]] += 1

    for attrs in m["imgs"]:
        if 'alt="' not in attrs:
            add("[a11y] %s are un <img> fără alt" % u)
        if "width=" not in attrs or "height=" not in attrs:
            add("[cls] %s are un <img> fără width/height" % u)

    seen_types = []
    for raw in m["ld"]:
        try:
            parsed = json.loads(raw)
        except Exception as e:
            add("[json-ld] %s invalid: %s" % (u, e))
            continue
        for node in parsed if isinstance(parsed, list) else [parsed]:
            seen_types.append(node.get("@type"))
    for t, n in collections.Counter(seen_types).items():
        if n > 1:
            add("[json-ld] %s declară %s de %d ori" % (u, t, n))

for t, n in titles.items():
    if n > 1:
        add("[seo] titlu duplicat pe %d pagini indexabile: %r" % (n, t[:60]))
for d, n in descs.items():
    if n > 1:
        add("[seo] descriere duplicată pe %d pagini indexabile: %r" % (n, d[:60]))

# --------------------------------------------------------------------------
# 4. sitemap.xml + robots.txt
# --------------------------------------------------------------------------
if "sitemap.xml" not in files:
    add("[sitemap] lipsește")
else:
    sm = read("sitemap.xml")
    locs = re.findall(r"<loc>([^<]+)</loc>", sm)
    print("URL-uri în sitemap: %d" % len(locs))
    indexable = {m["url"] for p, m in meta_by_page.items()
                 if not (m["robots"] or "").startswith("noindex")
                 and p != "404.html" and "_not-found" not in p}
    in_sitemap = set()
    for loc in locs:
        if DOMAIN not in loc:
            add("[sitemap] URL pe alt domeniu: %s" % loc)
            continue
        path = loc.split(DOMAIN, 1)[1] or "/"
        in_sitemap.add(path if path.endswith("/") else path + "/")
        page = resolve(path, "index.html")
        if page is None:
            add("[sitemap] URL fără pagină în export: %s" % loc)
        else:
            m = meta_by_page.get(page)
            if m and (m["robots"] or "").startswith("noindex"):
                add("[sitemap] listează o pagină noindex: %s" % loc)
    for u in sorted(indexable - in_sitemap):
        add("[sitemap] pagină indexabilă care lipsește din sitemap: %s" % u)

if "robots.txt" not in files:
    add("[robots] lipsește")
else:
    rb = read("robots.txt")
    if "Sitemap:" not in rb:
        add("[robots] nu indică sitemap-ul")
    if re.search(r"^Disallow: /$", rb, re.M):
        add("[robots] blochează tot site-ul")

if ".htaccess" not in files:
    add("[htaccess] lipsește din export")

print()
print("\n".join(problems) if problems else "Nicio problemă găsită.")
if notes:
    print("\nDe reținut:")
    for n in notes:
        print("  -", n)
print("\n--- probleme: %d ---" % len(problems))
