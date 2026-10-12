# Harta cuvintelor cheie (SEO)

O singură pagină pentru fiecare grup de căutări, ca paginile să nu concureze între ele
(canibalizare). Cuvintele apar natural în titlu, H1, prima frază, subtitluri, texte de link și
FAQ — nu înghesuite. `meta keywords` nu e folosit: Google îl ignoră din 2009.

| Pagină | Cuvânt principal | Variante acoperite în pagină |
|---|---|---|
| `/` | tractări auto București | tractare auto București, platformă auto București, tractări București Ilfov, tractare mașină București preț |
| `/tractari-centura-bucuresti/` | tractări Centura București | tractare Centură, DNCB, tractări Chitila, Otopeni, Voluntari, Pantelimon, Popești-Leordeni, Jilava, Bragadiru, Chiajna |
| `/tractari-autostrada-bucuresti-pitesti/` | tractări A1 București–Pitești | tractare autostrada A1, tractări autostrada București Pitești, tractare Bolintin, Găești, Pitești, mașină defectă A1 |
| `/tractari-ilfov/` | tractări auto Ilfov | tractare Otopeni, Voluntari, Chiajna, Bragadiru, Buftea, Măgurele, Mogoșoaia, Domnești, Snagov, Corbeanca… |
| `/tractari-sectoare-bucuresti/` | tractări auto sector 1–6 | tractare sector 1/2/3/4/5/6, Militari, Drumul Taberei, Berceni, Titan, Colentina, Rahova, Pipera, Băneasa |
| `/tarife-tractari/` | preț tractare auto / tarife tractări | cât costă o tractare, preț tractare pe km, tarif platformă auto, preț tractare București |
| `/calculator/` | calculator preț tractare | calculator tractare auto, calcul preț platformă |
| `/transport-auto-pe-platforma/` | transport auto pe platformă | transport mașină pe platformă București, transport auto București Cluj, transport mașină cumpărată |
| `/tractari-moto-bucuresti/` | tractări moto București | transport motociclete, tractare scuter, platformă moto |
| `/tractari-masini-avariate/` | tractări mașini avariate | tractare roți blocate, tractare după accident, mașină avariată |
| `/tractari-microbuze-autoutilitare/` | tractări autoutilitare / microbuze | tractare dubă, tractare 3,5 t, 7,5 t, transport microbuz |
| `/ghid/masina-defecta-pe-autostrada/` | mașină defectă pe autostradă ce faci | pană pe autostradă, bandă de urgență, triunghi, 112 |

Fiecare pagină are: titlu ≤ 65 caractere, descriere 70–160, un singur H1, canonical propriu,
Open Graph, BreadcrumbList și Service în JSON-LD, linkuri interne către 3–4 pagini înrudite și
calculatorul cu vehiculul potrivit preselectat. Toate sunt verificate automat
(`tests/seo.spec.ts`).

## Ce lipsește pentru „non-stop”, „ieftin”, „rapid”

Sunt căutări mari, dar pe site apar doar dacă sunt adevărate. Puneți programul real în
`site.hours` (ex. „Non-stop”) și acesta apare automat în hero, contact și datele structurate.
