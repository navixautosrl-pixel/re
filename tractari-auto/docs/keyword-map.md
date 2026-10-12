# Harta cuvintelor cheie (SEO)

★ = zonele principale ale clientului (Chiajna, Militari, A1 București–Pitești, Centura București):
apar primele în meniu, pe prima pagină, în pagina de zone și în footer, și primesc cele mai multe
linkuri interne.

O singură pagină pentru fiecare grup de căutări, ca paginile să nu concureze între ele
(canibalizare). Cuvintele apar natural în titlu, H1, prima frază, subtitluri, texte de link și
FAQ — nu înghesuite. `meta keywords` nu e folosit: Google îl ignoră din 2009.

| Pagină | Cuvânt principal | Variante acoperite în pagină |
|---|---|---|
| `/` | tractări auto Chiajna, Militari, A1, Centura (non-stop) | tractare auto București, platformă auto București, tractări București Ilfov, tractare mașină București preț |
| `/tractari-non-stop-bucuresti/` | tractări non-stop București | tractări 24/7, tractare noaptea, tractare weekend, tractare de sărbători |
| `/tractari-centura-bucuresti/` | tractări Centura București | tractare Centură, DNCB, tractări Chitila, Otopeni, Voluntari, Pantelimon, Popești-Leordeni, Jilava, Bragadiru, Chiajna |
| `/tractari-autostrada-bucuresti-pitesti/` | tractări A1 București–Pitești | tractare autostrada A1, tractări autostrada București Pitești, tractare Bolintin, Găești, Pitești, mașină defectă A1 |
| `/tractari-ilfov/` | tractări auto Ilfov | tractare Otopeni, Voluntari, Chiajna, Bragadiru, Buftea, Măgurele, Mogoșoaia, Domnești, Snagov, Corbeanca… |
| `/tractari-otopeni/` | tractări Otopeni | tractare DN1, tractare aeroport Henri Coandă, Tunari, Corbeanca |
| `/tractari-voluntari/` | tractări Voluntari / Pipera | tractare Pipera, Bulevardul Pipera, A3, DN2 Afumați |
| `/tractari-chiajna/` ★ | tractări Chiajna | tractare Militari Residence, Roșu, Dudu, strada Rezervelor, intrare A1, Centura vest |
| `/tractari-militari/` ★ | tractări Militari | tractare Iuliu Maniu, Preciziei, Pacii, Gorjului, Lujerului, Apusului, Uverturii, Valea Cascadelor |
| `/tractari-dragomiresti-vale/` | tractări Dragomirești-Vale | tractare vest București, lângă Chiajna |
| `/tractari-ciorogarla/` | tractări Ciorogârla | tractare primii km A1 |
| `/tractari-domnesti/` | tractări Domnești | tractare între A1 și Centură |
| `/tractari-bragadiru/` | tractări Bragadiru | tractare DN6, Șoseaua Alexandriei, Măgurele, Domnești |
| `/tractari-popesti-leordeni/` | tractări Popești-Leordeni | tractare Calea Olteniței, DN4, Berceni |
| `/tractari-pantelimon/` | tractări Pantelimon | tractare DN3, tractare A2, Cernica |
| `/tractari-jilava/` | tractări Jilava | tractare DN5, Șoseaua Giurgiului |
| `/tractari-buftea/` | tractări Buftea | tractare DN1A, Mogoșoaia, Chitila |
| `/tractari-sector-1/` … `/tractari-sector-6/` | tractări sector 1 … sector 6 | cartierele și arterele fiecărui sector (Băneasa, Colentina, Titan, Berceni, Rahova, Militari…) |
| `/tractari-sectoare-bucuresti/` | tractări auto sector 1–6 | tractare sector 1/2/3/4/5/6, Militari, Drumul Taberei, Berceni, Titan, Colentina, Rahova, Pipera, Băneasa |
| `/tarife-tractari/` | preț tractare auto / tarife tractări | cât costă o tractare, preț tractare pe km, tarif platformă auto, preț tractare București |
| `/calculator/` | calculator preț tractare | calculator tractare auto, calcul preț platformă |
| `/transport-auto-pe-platforma/` | transport auto pe platformă | transport mașină pe platformă București, transport auto București Cluj, transport mașină cumpărată |
| `/tractari-moto-bucuresti/` | tractări moto București | transport motociclete, tractare scuter, platformă moto |
| `/tractari-masini-avariate/` | tractări mașini avariate | tractare roți blocate, tractare după accident, mașină avariată |
| `/tractari-microbuze-autoutilitare/` | tractări autoutilitare / microbuze | tractare dubă, tractare 3,5 t, 7,5 t, transport microbuz |
| `/ghid/accident-ce-faci/` | ce faci după un accident | constatare amiabilă, accident tractare, 112 |
| `/ghid/masina-nu-porneste/` | mașina nu pornește | baterie descărcată, demaror, pornire cu cabluri |
| `/ghid/tractare-cutie-automata/` | tractare cutie automată | tractare mașină automată, mașină electrică pe platformă |
| `/ghid/masina-defecta-pe-autostrada/` | mașină defectă pe autostradă ce faci | pană pe autostradă, bandă de urgență, triunghi, 112 |

Fiecare pagină are: titlu ≤ 65 caractere, descriere 70–160, un singur H1, canonical propriu,
Open Graph, BreadcrumbList și Service în JSON-LD, linkuri interne către 3–4 pagini înrudite și
calculatorul cu vehiculul potrivit preselectat. Toate sunt verificate automat
(`tests/seo.spec.ts`).

## „Non-stop”

Confirmat de client: apare în titluri, H1, hero, FAQ și în `openingHours` (Mo-Su 00:00-23:59)
din datele structurate, odată ce telefonul și adresa sunt completate. „Ieftin” și „rapid” nu sunt
folosite ca promisiuni: fără timpi de sosire reali nu se pot susține.
