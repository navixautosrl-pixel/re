#!/usr/bin/env node
/*
 * Generatorul site-ului FILIP GEOTEHNIC: node build.mjs  →  dist/
 *
 * Datele de contact și domeniul se dau prin variabile de mediu (sau se scriu în CONFIG):
 *   SITE_URL=https://domeniul-vostru.ro PHONE=+40722123456 PHONE_DISPLAY="0722 123 456" EMAIL=office@... node build.mjs
 *
 * Fără SITE_URL, site-ul se generează ca previzualizare: toate paginile au „noindex”, robots.txt
 * blochează indexarea și nu se generează sitemap, ca să nu ajungă în Google cu adrese greșite.
 */
import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { COMPANY, SERVICES, AREAS, GUIDES, FAQ } from "./content.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "dist");

const CONFIG = {
  siteUrl: (process.env.SITE_URL || "").replace(/\/$/, ""),
  phone: process.env.PHONE || "",
  phoneDisplay: process.env.PHONE_DISPLAY || process.env.PHONE || "",
  email: process.env.EMAIL || "",
  updated: "2026-10-26",
};
const INDEXABLE = Boolean(CONFIG.siteUrl);
const abs = (path) => (CONFIG.siteUrl || "") + path;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/* ---------- Assets with content hash (safe 1-year caching) ---------- */
const cssSrc = await readFile(join(ROOT, "assets/style.css"), "utf8");
const jsSrc = await readFile(join(ROOT, "assets/site.js"), "utf8");
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 10);
const CSS_PATH = `/assets/style.${hash(cssSrc)}.css`;
const JS_PATH = `/assets/site.${hash(jsSrc)}.js`;

const partial = async (name) => readFile(join(ROOT, "partials", name), "utf8");

/* ---------- Structured data ---------- */
const ORG_ID = abs("/#firma");
const orgLd = () => {
  const node = {
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": ORG_ID,
    name: COMPANY.name,
    legalName: COMPANY.name,
    taxID: COMPANY.cui,
    identifier: [
      { "@type": "PropertyValue", propertyID: "CUI", value: COMPANY.cui },
      { "@type": "PropertyValue", propertyID: "Nr. Reg. Com.", value: COMPANY.regCom },
    ],
    description: "Studii geotehnice, foraje geotehnice, consultanță tehnică și monitorizare pentru construcții în București și județul Ilfov.",
    address: { "@type": "PostalAddress", addressLocality: COMPANY.locality, addressRegion: COMPANY.region, addressCountry: "RO" },
    areaServed: [
      { "@type": "City", name: "București" },
      { "@type": "AdministrativeArea", name: "Județul Ilfov" },
      ...AREAS.filter((a) => !["București", "Ilfov"].includes(a.name)).map((a) => ({ "@type": "Place", name: a.name })),
    ],
    knowsAbout: ["Studii geotehnice", "Foraje geotehnice", "Investigații geotehnice", "Fundații", "Monitorizare geotehnică"],
  };
  if (CONFIG.siteUrl) node.url = abs("/");
  if (CONFIG.phone) node.telephone = CONFIG.phone;
  if (CONFIG.email) node.email = CONFIG.email;
  return node;
};
const crumbsLd = (crumbs) => ({
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, ...(CONFIG.siteUrl ? { item: abs(c.path) } : {}) })),
});
const faqLd = (faq) => ({
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
});

/* ---------- Shared fragments ---------- */
const brandSvg = `<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="10" fill="#23272c"/><rect x="10" y="11" width="28" height="6" rx="1" fill="#f2b705"/><rect x="10" y="20" width="28" height="6" rx="1" fill="#a9b0b8"/><rect x="10" y="29" width="28" height="9" rx="1" fill="#e8772e"/><rect x="22.5" y="6" width="3" height="36" rx="1.5" fill="#ffffff"/></svg>`;

const NAV = [
  { href: "/#servicii", label: "Servicii" },
  { href: "/studii-geotehnice/", label: "Studii geotehnice" },
  { href: "/zone-deservite/", label: "Zone" },
  { href: "/ghid/", label: "Ghiduri" },
  { href: "/contact/", label: "Contact" },
];

const header = (current) => `
  <header class="header" id="header">
    <div class="wrap header-row">
      <a class="brand" href="/" aria-label="${COMPANY.name}, pagina principală">
        ${brandSvg}
        <span class="brand-name">${COMPANY.short}<small>Popești-Leordeni, Ilfov</small></span>
      </a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Deschide meniul"><span></span></button>
      <nav class="nav" id="nav" aria-label="Navigare principală">
        <ul class="nav-list">
${NAV.map((n) => `          <li><a href="${n.href}"${current === n.href ? ' aria-current="page"' : ""}>${n.label}</a></li>`).join("\n")}
          <li><a class="btn btn-primary nav-cta" href="/contact/">Cere ofertă</a></li>
        </ul>
      </nav>
    </div>
  </header>`;

const footer = () => `
  <footer class="footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="brand" href="/">${brandSvg}<span class="brand-name">${COMPANY.short}<small>S.R.L.</small></span></a>
          <p style="margin-top: 1rem; max-width: 36ch">Studii geotehnice, foraje, consultanță tehnică și monitorizare în București și Ilfov.</p>
          ${CONFIG.phone ? `<p style="margin-top: 0.8rem"><a href="tel:${esc(CONFIG.phone)}">${esc(CONFIG.phoneDisplay)}</a></p>` : ""}
          ${CONFIG.email ? `<p><a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a></p>` : ""}
        </div>
        <nav aria-label="Servicii">
          <h2>Servicii</h2>
          <ul>
${SERVICES.map((s) => `            <li><a href="/${s.slug}/">${s.nav}</a></li>`).join("\n")}
            <li><a href="/intrebari-frecvente/">Întrebări frecvente</a></li>
          </ul>
        </nav>
        <nav aria-label="Zone">
          <h2>Zone</h2>
          <ul>
${AREAS.map((a) => `            <li><a href="/${a.slug}/">Studiu geotehnic ${a.name}</a></li>`).join("\n")}
          </ul>
        </nav>
        <div>
          <h2>Firmă</h2>
          <ul>
            <li>${COMPANY.name}</li>
            <li>CUI ${COMPANY.cui}</li>
            <li>${COMPANY.regCom}</li>
            <li>${COMPANY.locality}, ${COMPANY.region}</li>
            <li><a href="/contact/">Contact</a></li>
            <li><a href="/politica-de-confidentialitate/">Confidențialitate</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© <span id="an">2026</span> ${COMPANY.name} Toate drepturile rezervate.</p>
        <p><a href="https://anpc.ro/" target="_blank" rel="noopener">ANPC</a></p>
      </div>
    </div>
  </footer>`;

const contactValue = (key) => {
  if (key === "phone") return CONFIG.phone ? `<a href="tel:${esc(CONFIG.phone)}">${esc(CONFIG.phoneDisplay)}</a>` : `<span class="pending">de completat</span>`;
  if (key === "email") return CONFIG.email ? `<a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a>` : `<span class="pending">de completat</span>`;
  return "";
};
const formHtml = async () =>
  (await partial("form.html")).replace('<form class="form" id="form" novalidate data-reveal>', `<form class="form" id="form" novalidate data-reveal data-email="${esc(CONFIG.email)}">`);
const sideHtml = async () =>
  (await partial("contact-side.html"))
    .replace('<b data-contact="phone"></b>', `<b>${contactValue("phone")}</b>`)
    .replace('<b data-contact="email"></b>', `<b>${contactValue("email")}</b>`)
    .replace(' id="contact-list"', "");

const faqBlock = (faq, title = "Întrebări frecvente") =>
  !faq.length
    ? ""
    : `
<h2 id="intrebari">${title}</h2>
<div class="faq">
${faq.map((f) => `  <details><summary>${esc(f.q)}</summary><div class="answer"><p>${f.a}</p></div></details>`).join("\n")}
</div>`;

const crumbsHtml = (crumbs) => `
        <nav class="crumbs" aria-label="Breadcrumb"><ol>
${crumbs.map((c, i) => (i === crumbs.length - 1 ? `          <li><span aria-current="page">${esc(c.name)}</span></li>` : `          <li><a href="${c.path}">${esc(c.name)}</a></li>`)).join("\n")}
        </ol></nav>`;

const linkCards = (items) => `
<div class="link-grid">
${items.map((i) => `  <a class="link-card" href="${i.href}"><b>${esc(i.title)}</b><span>${esc(i.text)}</span><em>Citește</em></a>`).join("\n")}
</div>`;

const ctaBand = () => `
    <section class="cta-band" aria-labelledby="cta-titlu">
      <div class="wrap">
        <div>
          <h2 id="cta-titlu">Aveți un teren pe care urmează să construiți?</h2>
          <p>Spuneți-ne unde este și ce construiți. Revenim cu programul de investigare și oferta.</p>
        </div>
        <a class="btn btn-primary" href="/contact/">Cere o ofertă</a>
      </div>
    </section>`;

const sidebar = (currentPath) => `
        <aside class="side" aria-label="Informații utile">
          <div class="side-card cta">
            <h2>Cereți o ofertă</h2>
            <p>Trimiteți adresa terenului și datele construcției. Vă răspundem cu programul de investigare și prețul.</p>
            <a class="btn btn-primary" href="/contact/">Cere ofertă</a>
            ${CONFIG.phone ? `<a class="btn btn-ghost" style="margin-top: 0.6rem" href="tel:${esc(CONFIG.phone)}">Sunați: ${esc(CONFIG.phoneDisplay)}</a>` : ""}
          </div>
          <div class="side-card">
            <h2>Servicii</h2>
            <ul>
${SERVICES.map((s) => `              <li><a href="/${s.slug}/"${currentPath === `/${s.slug}/` ? ' aria-current="page"' : ""}>${s.nav}</a></li>`).join("\n")}
            </ul>
          </div>
          <div class="side-card">
            <h2>Zone</h2>
            <ul>
${AREAS.map((a) => `              <li><a href="/${a.slug}/"${currentPath === `/${a.slug}/` ? ' aria-current="page"' : ""}>${a.name}</a></li>`).join("\n")}
            </ul>
          </div>
        </aside>`;

/* ---------- Page shell ---------- */
const page = ({ path, title, description, body, ld = [], navCurrent = "", ogType = "website" }) => {
  const graph = { "@context": "https://schema.org", "@graph": [orgLd(), { "@type": "WebPage", name: title, description, inLanguage: "ro-RO", ...(CONFIG.siteUrl ? { url: abs(path) } : {}), about: { "@id": ORG_ID } }, ...ld] };
  return `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${INDEXABLE ? "index, follow, max-image-preview:large" : "noindex, nofollow"}">
${CONFIG.siteUrl ? `  <link rel="canonical" href="${abs(path)}">\n` : ""}  <meta name="theme-color" content="#16181b">
  <meta property="og:type" content="${ogType}">
  <meta property="og:locale" content="ro_RO">
  <meta property="og:site_name" content="${COMPANY.name}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
${CONFIG.siteUrl ? `  <meta property="og:url" content="${abs(path)}">\n  <meta property="og:image" content="${abs("/og.png")}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n` : ""}  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${CSS_PATH}">
  <script>document.documentElement.classList.add("js")</script>
  <script src="${JS_PATH}" defer></script>
  <script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body>
  <a class="skip" href="#continut">Sari la conținut</a>
${header(navCurrent)}
  <main id="continut">
${body}
  </main>
${footer()}
</body>
</html>
`;
};

const innerPage = ({ path, title, description, crumbs, h1, lead, content, faq = [], ld = [], navCurrent, related = "", ogType, heroActions = true }) =>
  page({
    path,
    title,
    description,
    navCurrent,
    ogType,
    ld: [crumbsLd(crumbs), ...(faq.length ? [faqLd(faq)] : []), ...ld],
    body: `
    <section class="page-hero" aria-labelledby="h1">
      <div class="wrap">
${crumbsHtml(crumbs)}
        <h1 id="h1">${h1}</h1>
        <p class="lead">${lead}</p>
${heroActions ? `        <div class="hero-actions"><a class="btn btn-primary" href="/contact/">Cere o ofertă</a>${CONFIG.phone ? `<a class="btn btn-ghost" href="tel:${esc(CONFIG.phone)}">Sună: ${esc(CONFIG.phoneDisplay)}</a>` : (faq.length ? `<a class="btn btn-ghost" href="#intrebari">Întrebări frecvente</a>` : "")}</div>` : ""}
      </div>
    </section>
    <div class="page-body">
      <div class="wrap page-grid">
        <article class="prose">
${content}
${faqBlock(faq)}
${related}
        </article>
${sidebar(path)}
      </div>
    </div>
${ctaBand()}`,
  });

/* ---------- Write helpers ---------- */
const pages = [];
const emit = async (path, html, priority = 0.6) => {
  const file = path === "/" ? join(OUT, "index.html") : join(OUT, path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  pages.push({ path, priority });
};

await rm(OUT, { recursive: true, force: true });
await mkdir(join(OUT, "assets"), { recursive: true });
await writeFile(join(OUT, CSS_PATH), cssSrc);
await writeFile(join(OUT, JS_PATH), jsSrc);

/* ---------- Home ---------- */
const homeFaq = FAQ.slice(0, 6);
const homeExtra = `
    <!-- ================= ZONE ================= -->
    <section class="section" id="zone" aria-labelledby="zone-titlu" style="padding-top: 0">
      <div class="wrap">
        <div class="section-head" data-reveal>
          <h2 id="zone-titlu"><span class="bar" aria-hidden="true"></span>Unde lucrăm</h2>
          <p>Studii geotehnice și foraje în București și în localitățile din Ilfov.</p>
        </div>
        <div data-reveal>${linkCards(AREAS.map((a) => ({ href: `/${a.slug}/`, title: `Studiu geotehnic ${a.name}`, text: strip(a.lead) })))}</div>
      </div>
    </section>

    <!-- ================= GHIDURI ================= -->
    <section class="section about" id="ghiduri" aria-labelledby="ghiduri-titlu">
      <div class="wrap">
        <div class="section-head" data-reveal>
          <h2 id="ghiduri-titlu"><span class="bar" aria-hidden="true"></span>Ghiduri</h2>
          <p>Răspunsuri clare la întrebările pe care le are oricine construiește.</p>
        </div>
        <div data-reveal>${linkCards(GUIDES.map((g) => ({ href: `/ghid/${g.slug}/`, title: g.h1, text: strip(g.lead) })))}</div>
      </div>
    </section>

    <!-- ================= ÎNTREBĂRI ================= -->
    <section class="section" id="intrebari" aria-labelledby="faq-titlu">
      <div class="wrap" style="max-width: 860px">
        <div class="section-head" data-reveal>
          <h2 id="faq-titlu"><span class="bar" aria-hidden="true"></span>Întrebări frecvente</h2>
        </div>
        <div class="faq" data-reveal>
${homeFaq.map((f) => `          <details><summary>${esc(f.q)}</summary><div class="answer"><p>${f.a}</p></div></details>`).join("\n")}
        </div>
        <p class="see-more"><a href="/intrebari-frecvente/">Toate întrebările frecvente</a></p>
      </div>
    </section>
`;
const homeMain = (await partial("home-main.html"))
  .replace("{{HOME_EXTRA}}", homeExtra)
  .replace("{{FORM}}", await formHtml())
  .replace("{{CONTACT_SIDE}}", await sideHtml());
await emit(
  "/",
  page({
    path: "/",
    title: "Studii geotehnice București și Ilfov | FILIP GEOTEHNIC S.R.L.",
    description: "Servicii geotehnice în București și Ilfov: studii geotehnice pentru autorizarea construcțiilor, foraje geotehnice, consultanță tehnică și monitorizare.",
    body: homeMain,
    ld: [
      ...SERVICES.map((s) => ({ "@type": "Service", name: s.nav, description: s.card, provider: { "@id": ORG_ID }, areaServed: "București și județul Ilfov", ...(CONFIG.siteUrl ? { url: abs(`/${s.slug}/`) } : {}) })),
      faqLd(homeFaq),
    ],
  }),
  1.0,
);

/* ---------- Services ---------- */
for (const s of SERVICES) {
  const path = `/${s.slug}/`;
  const others = SERVICES.filter((o) => o.slug !== s.slug);
  await emit(
    path,
    innerPage({
      path,
      title: s.title,
      description: s.description,
      navCurrent: s.slug === "studii-geotehnice" ? "/studii-geotehnice/" : "",
      crumbs: [{ name: "Acasă", path: "/" }, { name: "Servicii", path: "/#servicii" }, { name: s.nav, path }],
      h1: s.h1,
      lead: s.lead,
      content: s.body,
      faq: s.faq,
      ld: [{ "@type": "Service", name: s.nav, description: s.description, serviceType: s.nav, provider: { "@id": ORG_ID }, areaServed: [{ "@type": "City", name: "București" }, { "@type": "AdministrativeArea", name: "Județul Ilfov" }] }],
      related: `<h2>Alte servicii</h2>${linkCards(others.map((o) => ({ href: `/${o.slug}/`, title: o.nav, text: o.card })))}`,
    }),
    0.9,
  );
}

/* ---------- Areas ---------- */
for (const a of AREAS) {
  const path = `/${a.slug}/`;
  const content = `
${a.intro}
<h2>Ce facem în ${a.name}</h2>
<ul>
${SERVICES.map((s) => `  <li><a href="/${s.slug}/">${s.nav}</a>: ${s.card.charAt(0).toLowerCase() + s.card.slice(1)}</li>`).join("\n")}
</ul>
${a.specifics}
<h2>Cum obțineți studiul geotehnic</h2>
<ol>
  <li>Ne trimiteți adresa terenului din ${a.name} și datele construcției.</li>
  <li>Stabilim programul de investigare și vă trimitem oferta.</li>
  <li>Executăm forajele și analizele de laborator.</li>
  <li>Predăm studiul geotehnic, gata pentru proiectant și pentru autorizare.</li>
</ol>
<p>Pentru casele individuale, citiți și <a href="/ghid/studiu-geotehnic-pentru-casa/">ghidul studiului geotehnic pentru casă</a>.</p>`;
  const others = AREAS.filter((o) => o.slug !== a.slug);
  await emit(
    path,
    innerPage({
      path,
      title: a.title,
      description: a.description,
      navCurrent: "/zone-deservite/",
      crumbs: [{ name: "Acasă", path: "/" }, { name: "Zone deservite", path: "/zone-deservite/" }, { name: a.name, path }],
      h1: a.h1,
      lead: a.lead,
      content,
      faq: a.faq,
      ld: [{ "@type": "Service", name: `Studiu geotehnic ${a.name}`, serviceType: "Studii geotehnice", provider: { "@id": ORG_ID }, areaServed: { "@type": "Place", name: a.name } }],
      related: `<h2>Lucrăm și în</h2>${linkCards(others.map((o) => ({ href: `/${o.slug}/`, title: `Studiu geotehnic ${o.name}`, text: strip(o.lead) })))}`,
    }),
    0.8,
  );
}

/* ---------- Area hub ---------- */
await emit(
  "/zone-deservite/",
  innerPage({
    path: "/zone-deservite/",
    title: "Zone deservite: București și Ilfov | FILIP GEOTEHNIC",
    description: "Executăm studii geotehnice și foraje în București (toate sectoarele) și în Ilfov: Popești-Leordeni, Voluntari, Otopeni, Chiajna și alte localități.",
    navCurrent: "/zone-deservite/",
    crumbs: [{ name: "Acasă", path: "/" }, { name: "Zone deservite", path: "/zone-deservite/" }],
    h1: "Zone deservite: București și Ilfov",
    lead: "Sediul nostru este în Popești-Leordeni. Lucrăm în toată Capitala și în localitățile din jurul ei.",
    content: `<p>Alegeți zona pentru detalii despre ce contează la terenurile de acolo și cum obțineți studiul geotehnic.</p>${linkCards(AREAS.map((a) => ({ href: `/${a.slug}/`, title: `Studiu geotehnic ${a.name}`, text: strip(a.lead) })))}
<p class="note">Nu vă găsiți localitatea? Lucrăm și în alte localități din Ilfov, cum ar fi Bragadiru, Pantelimon, Berceni, Jilava sau Măgurele. <a href="/contact/">Scrieți-ne</a>.</p>`,
  }),
  0.7,
);

/* ---------- Guides ---------- */
for (const g of GUIDES) {
  const path = `/ghid/${g.slug}/`;
  const others = GUIDES.filter((o) => o.slug !== g.slug);
  await emit(
    path,
    innerPage({
      path,
      title: g.title,
      description: g.description,
      navCurrent: "/ghid/",
      ogType: "article",
      crumbs: [{ name: "Acasă", path: "/" }, { name: "Ghiduri", path: "/ghid/" }, { name: g.nav, path }],
      h1: g.h1,
      lead: g.lead,
      content: g.body,
      faq: g.faq,
      heroActions: false,
      ld: [{ "@type": "Article", headline: g.h1, description: g.description, inLanguage: "ro-RO", datePublished: CONFIG.updated, dateModified: CONFIG.updated, author: { "@id": ORG_ID }, publisher: { "@id": ORG_ID } }],
      related: `<h2>Alte ghiduri</h2>${linkCards(others.map((o) => ({ href: `/ghid/${o.slug}/`, title: o.h1, text: strip(o.lead) })))}`,
    }),
    0.7,
  );
}
await emit(
  "/ghid/",
  innerPage({
    path: "/ghid/",
    title: "Ghiduri despre studiul geotehnic | FILIP GEOTEHNIC",
    description: "Ghiduri despre studiul geotehnic: când este necesar, ce conține, de ce depinde prețul și ce trebuie să știți când vă construiți o casă.",
    navCurrent: "/ghid/",
    crumbs: [{ name: "Acasă", path: "/" }, { name: "Ghiduri", path: "/ghid/" }],
    h1: "Ghiduri despre studiul geotehnic",
    lead: "Explicații pe înțelesul tuturor pentru cei care construiesc, extind sau cumpără un teren.",
    heroActions: false,
    content: linkCards(GUIDES.map((g) => ({ href: `/ghid/${g.slug}/`, title: g.h1, text: strip(g.lead) }))),
  }),
  0.6,
);

/* ---------- FAQ ---------- */
await emit(
  "/intrebari-frecvente/",
  innerPage({
    path: "/intrebari-frecvente/",
    title: "Întrebări frecvente despre studiul geotehnic | FILIP GEOTEHNIC",
    description: "Răspunsuri despre studiul geotehnic: ce este, când e obligatoriu, de ce depinde prețul, cât durează, categoria geotehnică și zonele în care lucrăm.",
    crumbs: [{ name: "Acasă", path: "/" }, { name: "Întrebări frecvente", path: "/intrebari-frecvente/" }],
    h1: "Întrebări frecvente despre studiul geotehnic",
    lead: "Cele mai des întâlnite întrebări de la beneficiari, proiectanți și constructori.",
    heroActions: false,
    content: "",
    faq: FAQ,
  }),
  0.6,
);

/* ---------- Contact ---------- */
await emit(
  "/contact/",
  page({
    path: "/contact/",
    title: "Contact și cerere de ofertă | FILIP GEOTEHNIC S.R.L.",
    description: "Cereți o ofertă pentru studiu geotehnic sau foraje în București și Ilfov. FILIP GEOTEHNIC S.R.L., Popești-Leordeni, CUI 49960856.",
    navCurrent: "/contact/",
    ld: [crumbsLd([{ name: "Acasă", path: "/" }, { name: "Contact", path: "/contact/" }])],
    body: `
    <section class="page-hero" aria-labelledby="h1">
      <div class="wrap">
${crumbsHtml([{ name: "Acasă", path: "/" }, { name: "Contact", path: "/contact/" }])}
        <h1 id="h1">Contact și cerere de ofertă</h1>
        <p class="lead">Spuneți-ne unde este terenul și ce construiți. Revenim cu programul de investigare și prețul.</p>
      </div>
    </section>
    <section class="section" style="padding-top: var(--space-l)" aria-labelledby="form-titlu">
      <div class="wrap">
        <h2 id="form-titlu" class="sr-only">Formular de cerere de ofertă</h2>
        <div class="contact-grid">
${await formHtml()}

${await sideHtml()}
        </div>
      </div>
    </section>
    <section class="section company" aria-labelledby="firma-titlu">
      <div class="wrap">
        <div class="section-head"><h2 id="firma-titlu"><span class="bar" aria-hidden="true"></span>Date companie</h2></div>
        <dl class="facts" style="max-width: 760px">
          <div><dt>Denumire</dt><dd>${COMPANY.name}</dd></div>
          <div><dt>Cod unic de înregistrare (CUI)</dt><dd>${COMPANY.cui}</dd></div>
          <div><dt>Nr. Registrul Comerțului</dt><dd>${COMPANY.regCom}</dd></div>
          <div><dt>Sediu</dt><dd>${COMPANY.locality}, județul ${COMPANY.region}</dd></div>
        </dl>
      </div>
    </section>`,
  }),
  0.8,
);

/* ---------- Privacy ---------- */
await emit(
  "/politica-de-confidentialitate/",
  innerPage({
    path: "/politica-de-confidentialitate/",
    title: "Politica de confidențialitate | FILIP GEOTEHNIC S.R.L.",
    description: "Cum folosește FILIP GEOTEHNIC S.R.L. datele trimise prin formularul de pe site: ce date, în ce scop, cât timp și ce drepturi aveți.",
    crumbs: [{ name: "Acasă", path: "/" }, { name: "Confidențialitate", path: "/politica-de-confidentialitate/" }],
    h1: "Politica de confidențialitate",
    lead: "Ce date folosim când ne cereți o ofertă și ce drepturi aveți, conform Regulamentului (UE) 2016/679 (GDPR).",
    heroActions: false,
    content: `
<h2>Operatorul datelor</h2>
<p>${COMPANY.name}, cu sediul în ${COMPANY.locality}, județul ${COMPANY.region}, CUI ${COMPANY.cui}, Nr. Reg. Com. ${COMPANY.regCom}${CONFIG.email ? `, e-mail <a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a>` : ""}${CONFIG.phone ? `, telefon ${esc(CONFIG.phoneDisplay)}` : ""}.</p>
<h2>Ce date folosim</h2>
<p>Când completați formularul, datele (nume, telefon, e-mail, localitatea amplasamentului și detaliile construcției) <strong>nu sunt trimise automat de site</strong>: formularul deschide aplicația dumneavoastră de e-mail cu mesajul completat, iar datele ajung la noi doar dacă trimiteți e-mailul. La fel, datele primite telefonic.</p>
<h2>Scopul și temeiul</h2>
<p>Folosim datele doar pentru a vă răspunde și pentru a vă face oferta (art. 6 alin. 1 lit. b GDPR, demersuri înainte de încheierea unui contract). Dacă încheiem un contract, documentele fiscale se păstrează conform legislației financiar-contabile (art. 6 alin. 1 lit. c).</p>
<h2>Cât timp le păstrăm</h2>
<p>Cât este necesar pentru ofertă și, dacă lucrăm împreună, pe durata contractului și apoi pe perioadele prevăzute de lege pentru documentele contabile.</p>
<h2>Cookie-uri și servicii externe</h2>
<p>Site-ul nu folosește cookie-uri de analiză sau publicitate. Fonturile sunt încărcate de la Google Fonts, ceea ce înseamnă că browserul dumneavoastră contactează serverele Google.</p>
<h2>Drepturile dumneavoastră</h2>
<p>Aveți dreptul de acces, rectificare, ștergere, restricționare, opoziție și portabilitate, precum și dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (<a href="https://www.dataprotection.ro/" target="_blank" rel="noopener">dataprotection.ro</a>).</p>`,
  }),
  0.2,
);

/* ---------- 404 ---------- */
const notFound = page({
  path: "/404.html",
  title: "Pagina nu există | FILIP GEOTEHNIC",
  description: "Pagina căutată nu există.",
  body: `
    <section class="page-hero" aria-labelledby="h1">
      <div class="wrap">
        <h1 id="h1">Pagina nu există</h1>
        <p class="lead">Adresa poate fi greșită sau pagina a fost mutată.</p>
        <div class="hero-actions"><a class="btn btn-primary" href="/">Pagina principală</a><a class="btn btn-ghost" href="/contact/">Contact</a></div>
      </div>
    </section>`,
}).replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex">').replace(/  <link rel="canonical"[^\n]*\n/, "");
await writeFile(join(OUT, "404.html"), notFound);

/* ---------- favicon, og, robots, sitemap, .htaccess ---------- */
await writeFile(join(OUT, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#16181b"/><rect x="14" y="14" width="36" height="8" fill="#f2b705"/><rect x="14" y="26" width="36" height="8" fill="#a9b0b8"/><rect x="14" y="38" width="36" height="12" fill="#e8772e"/><rect x="30" y="8" width="4" height="48" fill="#fff"/></svg>`);
try { await copyFile(join(ROOT, "og.png"), join(OUT, "og.png")); } catch { /* og.png se generează separat */ }

await writeFile(
  join(OUT, "robots.txt"),
  INDEXABLE ? `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n` : `# Previzualizare: indexarea este oprită până se setează SITE_URL.\nUser-agent: *\nDisallow: /\n`,
);
if (INDEXABLE) {
  await writeFile(
    join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
      .map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${CONFIG.updated}</lastmod><priority>${p.priority.toFixed(1)}</priority></url>`)
      .join("\n")}\n</urlset>\n`,
  );
}
await copyFile(join(ROOT, "assets/.htaccess"), join(OUT, ".htaccess"));

console.log(`${pages.length} pagini + 404 → dist/ (${INDEXABLE ? `indexabil, ${CONFIG.siteUrl}` : "PREVIZUALIZARE noindex: setați SITE_URL"})`);
console.log(`telefon: ${CONFIG.phone || "lipsă"}, e-mail: ${CONFIG.email || "lipsă"}`);
