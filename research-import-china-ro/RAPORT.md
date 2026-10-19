# Import China → România: cercetare de produs, calcule de profit și plan de test (buget 1.000 €)

**Data cercetării:** 19 octombrie 2026 · **Piață:** România · **Sursă inițială:** AliExpress · **Curs folosit:** BNR 06.10.2026 — 1 € = 5,3527 lei, 1 $ = 4,7616 lei

---

## 0. Cum a fost făcută cercetarea (citește întâi)

- **Ce am putut verifica:** am folosit căutare web indexată. Am găsit prin ea pagini reale de produs și de căutare pe AliExpress, pagini de produs și de căutare pe eMAG, anunțuri OLX, Dedeman, Leroy Merlin, Pescar Expert, plus surse oficiale și de presă pentru taxe.
- **Ce NU am putut verifica:** accesul direct la aliexpress.com, emag.ro, olx.ro și Google Trends este blocat în mediul meu de lucru. Nu am văzut paginile live, deci:
  - **prețurile AliExpress** sunt cele afișate în indexul de căutare. Sunt **indicative**, nu „prețul de azi”. AliExpress schimbă prețul după variantă, cantitate, cupon și țară.
  - **numărul de comenzi/recenzii** de pe AliExpress l-am citat doar acolo unde apărea în index (de ex. „10.000+ vândute” la banda de portieră) și e marcat ca declarație a vânzătorului.
  - **Google Trends, TikTok, Instagram:** **neverificate**. Nu am date de volum de căutare sau de vizualizări. Unde vorbesc de „potențial video”, e o judecată despre cât de demonstrabil e produsul, nu o statistică.
  - **Numărul exact de oferte concurente pe eMAG:** neverificat. Am văzut doar ce era în rezultatele indexate (prețuri și branduri concrete, cu linkuri).
- **Unde dau un link de tip „căutare AliExpress” în loc de produs**, e pentru că indexul nu mi-a dat o pagină de produs credibilă. Alegerea vânzătorului rămâne de făcut. Am marcat asta explicit.
- Toate costurile logistice, de reclamă și ratele de retur sunt **ipoteze explicite** (secțiunea 5.1). Modelul de calcul e în `model/model.py` și îl poți rula cu propriile cifre.

---

## 1. Rezumat executiv

1. **Adaosul „de 3 ori” nu e problema. Problema e costul fix pe comandă.** O comandă mică din România costă ~22–25 lei înainte de produs: livrare ~17 lei (ipoteză), ambalaj, manipulare, plată, retururi/refuzuri ramburs. La un produs vândut cu 29–45 lei, asta mănâncă tot profitul. În modelul meu, **20 din 30 de produse au profit de contribuție negativ deja din vânzarea organică**, dacă oferi livrare gratuită. Concluzia practică: **vinzi pachete/kituri cu valoare de coș de 79–139 lei, nu bucăți de 19 lei.**
2. **eMAG e deja plin de vânzători chinezi care vând sub prețul tău de aterizare.** Exemple verificate: 4 cârlige de tetieră la 8,11 lei, colector de praf KWB la 9,68 lei, sită de scurgere la 2,94 lei, perie de șine la 4,24 lei, 6 capace de silicon la 11 lei. Pe aceste produse nu ai cum să câștigi cu un import din AliExpress. **Le-am inclus în tabel tocmai ca dovadă și le-am respins.**
3. **Fiscalitate 2026 pentru coletele mici din afara UE:** TVA 21% la import, plus **taxa vamală UE de 3 € pe linie tarifară** (din 1 iulie 2026, pentru colete sub 150 €), plus **taxa logistică națională de 25 lei/colet** (din 1 ianuarie 2026). Pentru teste cumpără **un singur produs în cantitate mare pe colet**, nu 10 produse diferite. Fiecare linie tarifară în plus costă 3 €.
4. **Crampoanele antiderapante păreau câștigătorul sezonier**: cerere clară în noiembrie–februarie, prețuri eMAG de 35–66 lei. Dar **dispozitivele antiderapante intră sub Regulamentul (UE) 2016/425 privind EIP și cer certificare de la un organism notificat și marcaj CE** ([SGS](https://www.sgs.com/en-se/news/2026/02/ppe-for-winter-outdoors)). Le-am scos din TOP până nu ai un furnizor cu certificat de examinare UE de tip verificabil.
5. **TOP 3 pentru test:**
   - **Kit de montaje pentru crap, asamblat în România, fără plumb.** Scor 72,5/100. Cea mai bună marjă din modelul meu și o nișă în care tu ai deja expertiză (boilies).
   - **Covoraș de lins pentru câini/pisici, vândut în pachet.** Scor 70,5/100. Concurența vizibilă pe eMAG e la ~44–45 lei bucata, iar costul de aterizare e ~14 lei.
   - **Set de perii pentru detailing auto cu păr natural.** Scor 64/100. Se demonstrează foarte ușor video, iar concurența e la 50–79 lei.
6. **Primul produs pe care l-aș testa:** **covorașul de lins** (detalii în secțiunea 10). Motivul: risc mic, nu e sezonier, se demonstrează în 10 secunde, are pachet natural de 2–3 bucăți și un preț de piață verificat care lasă loc de marjă. Kitul de crap are marjă mai bună, dar sezonul mare e primăvara. Îl pregătesc acum și îl lansez complet în februarie–martie, cu un mic test de cadou în decembrie.
7. **Bugetul de 1.000 € nu se cheltuie din prima zi.** În primele 2 săptămâni folosești ~190 € (mostre, setup, conținut). Stocul și reclamele se deblochează în tranșe, numai dacă indicatorii trec pragurile din secțiunea 6.

---

## 2. Tabel cu 30 de produse concrete

### 2A. Aprovizionare și prețuri

Prețul AliExpress e cel din indexul de căutare, **indicativ**. „Cost aterizat” = cost estimat per unitate ajuns în România, în regim de test (comandă AliExpress ≤150 €, TVA 21% plătit la checkout și presupus nerecuperabil, transport, 3 € + 25 lei pe colet împărțit la 50 de unități, +5% marjă de siguranță). Detalii în 5.1.

| # | Produs | Link AliExpress | Preț observat (index) | Cost aterizat/unit. (lei) | Preț realist RO al ofertei | Concurență RO verificată (exemple) |
|---|---|---|---|---|---|---|
| 1 | Umplutură spațiu dintre scaune, PU, 2 buc | [produs](https://www.aliexpress.com/item/1005009075326334.html) | ~1–3 $/pereche („basic pairs about a dollar to a few dollars”); calcul cu 2 $ | 15,46 | 49 lei / 2 buc | [eMAG: organizator Edibazzar 37–49 lei](https://www.emag.ro/search/suport+depozitare+auto+pt+scaun+aut); [OLX 36–50 lei](https://www.olx.ro/oferte/q-organizator-scaun-auto/) |
| 2 | Cârlige tetieră, set 4 | [căutare](https://www.aliexpress.com/w/wholesale-car-headrest-hook.html) — de ales vânzătorul | 0,33–1,09 $/set de 4 | 7,66 | 29 lei / 8 buc | [eMAG: 4 buc de la 8,11 lei; 19–42 lei](https://www.emag.ro/search/carlig+tetiera) |
| 3 | Bandă protecție margine portieră, 5 m | [produs](https://www.aliexpress.com/i/2261799829562084.html) | 1,33 $ (listă 6,79 $), „10.000+ vândute” (declarat) | 11,41 | 45 lei / 2 role | [eMAG: 17–31 lei / 5 m](https://www.emag.ro/search/banda+protectie+portiera+auto) |
| 4 | Buzunar/plasă elastică portbagaj cu velcro | [căutare](https://www.aliexpress.com/w/wholesale-universal-elastic-mesh-net-trunk-bag-holder-pocket.html) | ~1–20 $ după tip; calcul cu 1,5 $ | 12,44 | 39 lei / 2 buc | [eMAG: 17–19 lei/buc, 24 lei/2](https://www.emag.ro/search/plasa+elastica+portbagaj); [Edibazzar 60×110: 44,91 lei](https://www.emag.ro/plasa-portbagaj-auto-edibazzar-tip-organizator-elastica-si-universala-60x110-cm-pentru-fixare-si-securizare-bagaje-cu-set-complet-de-montaj-inclus-4-carlige-4-carabiniere-pentru-masina-suv-break-moto-/pd/D2K6VC3BM/) |
| 5 | Răzuitor de gheață cu mănușă | [căutare](https://www.aliexpress.com/w/wholesale-ice-scraper-glove.html) | ~1–6 $; calcul cu 2,5 $ | 18,49 | 39 lei | [Dedeman VGT cu mănușă: 26,08 lei](https://www.dedeman.ro/ro/racleta-gheata-vgt-cu-perie-si-manusa-46-cm/p/1043733); [eMAG 19–40 lei](https://www.emag.ro/search/R%C4%83zuitor%20ghea%C8%9B%C4%83) |
| 6 | Set 5 perii detailing auto, păr de porc | [produs 4,93 $](https://www.aliexpress.com/item/4000245372739.html) · [alt vânzător](https://www.aliexpress.com/item/1005012555566526.html) | 4,93 $ (−36%); al doilea afișează 1,09 $ cu preț tăiat neclar | 33,19 | 79 lei | [eMAG: set păr natural Excitat 78,99 lei; 3 perii 69,68 lei](https://www.emag.ro/search/set+perii+detailing+auto); [OLX 40–55 lei](https://www.olx.ro/oferte/q-set-perii-detailing/) |
| 7 | Crampoane antiderapante pentru încălțăminte | [căutare](https://www.aliexpress.com/w/wholesale-ice-cleats.html) | ~1–5 $ modelele simple | 21,51 | 69 lei / 2 perechi | [eMAG: 39,93–66,55 lei; Veriga 99–189 lei](https://www.emag.ro/search/crampoane+pt+gheata); [OLX 25–35 lei](https://www.olx.ro/oferte/q-crampoane-gheata/) |
| 8 | Perie pentru șinele ferestrelor | [produs](https://www.aliexpress.com/i/3256805759442224.html) | ~1 $ | 7,66 | 25 lei / 3 buc | [eMAG: de la 4,24 lei; set 2 la 8,47 lei](https://www.emag.ro/search/perie+etansare+usa+glisanta) |
| 9 | Sită de silicon pentru păr, scurgere | [produs](https://www.aliexpress.com/i/3256805407203272.html) | ~1,09 $ | 8,21 | 29 lei / 4 buc | [eMAG: de la 2,94 lei; Zenai 11,43 lei](https://www.emag.ro/search/sita+silicon+baie) |
| 10 | Capace extensibile din silicon, set 6 | [produs](https://www.aliexpress.com/i/3256801543029347.html) | 0,33–5 $/set; calcul cu 2 $ | 15,46 | 39 lei | [eMAG: Maxx 11 lei; 17,85 lei; CCmax 29–42 lei](https://www.emag.ro/capace-flexibile-silicon-set-de-6-extensibile-inlocuitor-folie-strech-alimentara-6-x-capac-silicon-flexibil-pentru-vase-recipiente-capace-silicon-elastic-pentru-mentinerea-prospetimii-capace-elastice-/pd/DSFCGCBBM/) |
| 11 | Separatoare extensibile pentru sertar | [produs](https://www.aliexpress.com/item/1005006448473250.html) | **preț neafișat în index**; calcul cu 3 $/buc (neverificat) | 26,51 | 119 lei / 4 buc | [eMAG Elindor: 129,99 lei/5; 139,99 lei/8; DIVISERINO 49,99 lei/1](https://www.emag.ro/search/separator+sertar) |
| 12 | Cleme autoadezive pentru cabluri | [produs](https://aliexpress.com/item/1005004848227575.html) | ~0,99 $ / 16–20 buc | 7,60 | 29 lei / 40 buc | [eMAG: 10 buc 9,15 lei; 40 buc ~25 lei](https://www.emag.ro/search/cleme+autoadezive+pentru+cabluri) |
| 13 | Saci vidați + pompă manuală | [căutare](https://www.aliexpress.com/w/wholesale-vacuum-pump-manual-with-bags-for-storage.html) | variabil; calcul cu 8 $/set de 8 (neverificat) | 56,76 | 79 lei | [eMAG: 6 saci 45,74 lei; 12 saci 60–130 lei](https://www.emag.ro/search/saci+vidat+cu+pompa) |
| 14 | Covoraș de silicon pentru robinet (anti-stropi) | [produs](https://aliexpress.com/item/1005004849551648.html) | ~1–5 $; calcul cu 3 $ | 21,51 | 49 lei | [eMAG: 20–45 lei; model 18" 44,96 lei](https://www.emag.ro/search/protectie+antistropi+chiuveta) |
| 15 | Șnur telefon crossbody cu patch | [căutare](https://www.aliexpress.com/w/wholesale-cell-phone-strap.html) | ~1,33–6,70 $ | 10,69 | 49 lei / 2 buc | [eMAG: 14–30 lei; set 2 cu patch 29,90 lei](https://www.emag.ro/search/snur+pentru+telefon) |
| 16 | Protecții spiralate pentru cablul de încărcare | [căutare](https://www.aliexpress.com/w/wholesale-spiral-cable-protectors.html) | ~1 $/set | 7,66 | 25 lei / 10 buc | [eMAG: 10 buc 19,18 lei; 4 buc 11,92–15 lei](https://www.emag.ro/search/protectie+cabluri+spirala) |
| 17 | Brățară magnetică pentru șuruburi | [produs](https://www.aliexpress.com/item/1005006047319863.html) | ~1–8 $; calcul cu 3 $ | 21,51 | 49 lei | [eMAG: Topmaster 9,60 lei; Ultimar 17,69 lei; 25–90 lei](https://www.emag.ro/bratara-magnetica-pentru-suruburi-ultimar-32x9cm-16-magneti-neagra-5907152908312/pd/DBT5NH3BM/) |
| 18 | Colector de praf pentru burghiu | [produs](https://www.aliexpress.com/i/3256802067619153.html) | ~1–2 $ | 8,87 | 29 lei / 2 buc | [eMAG: KWB 9,68 lei](https://www.emag.ro/dispozitiv-colectare-praf-pentru-burghie-de-la-4-la-10-mm-kwb-high-quality-49045400/pd/DF2N03MBM/) |
| 19 | Șablon de copiere contur 25 cm, cu blocare | [5"/10" 4,98 $](https://www.aliexpress.com/item/1005002871976914.html) · [10" 17,14 $](https://www.aliexpress.com/item/1005003531239783.html) | 4,98 $ e probabil varianta de 5"; varianta de 10" poate costa mult mai mult | 33,61 (cu 5 $, optimist) | 69 lei | [eMAG: Geko 25 cm 28,08 lei](https://www.emag.ro/search/sablon+pentru+contur); [OLX 70 lei](https://www.olx.ro/oferte/q-sablon-contur/) |
| 20 | Rolă reutilizabilă pentru păr de animale | [produs](https://www.aliexpress.com/i/3256804294902679.html) | ~2 $ | 15,46 | 49 lei | [eMAG: 7–47 lei](https://www.emag.ro/search/role+par+animale) |
| 21 | Covoraș de lins pentru câini/pisici, silicon, ventuze | [căutare](https://www.aliexpress.com/w/wholesale-dog-licking-mat.html) · [exemplu video produs](https://www.aliexpress.com/s/video-ssr/detail/1005007365645559) | ~1–16 $; calcul cu 1,8 $ | 14,25 | 69 lei / 2 buc | [eMAG: 43,99 lei](https://www.emag.ro/covoras-hranire-lick-mat-pentru-caini-pisic-cu-ventuze-de-aspiratie-silikon-negru-1140570288/pd/D9568KYBM/); slow feeder 45 lei |
| 22 | Dispenser pungi câini + role | [căutare](https://www.aliexpress.com/w/wholesale-dog-waste-bag.html) | prețuri inconsecvente în index; calcul cu 3,5 $ | 29,54 | 59 lei | [eMAG: 150 pungi + dispenser ~38 lei; 300 pungi ~56–60 lei](https://www.emag.ro/search/suport+pungi+caini) |
| 23 | Mănușă de toaletaj pentru animale | [produs](https://www.aliexpress.com/item/1005009354531044.html) | ~1,5 $ | 10,69 | 45 lei / pereche | [eMAG: 7,22–37,27 lei](https://www.emag.ro/manusa-perie-pentru-caini-my-pet-petter-f167/pd/D1PM90BBM/) |
| 24 | Clopoței de avertizare pentru pescuit | [produs](https://www.aliexpress.com/i/3256812162045661.html) · [5 buc](https://www.aliexpress.com/i/3256812219363562.html) | 0,20–1,50 $ | 4,03 | 25 lei / 6 buc | [eMAG: 6 clopoței 14,90 lei; 3 la 8,98 lei](https://www.emag.ro/search/clopotel+fir+pescuit) |
| 25 | Kit montaje crap (vârtejuri, clipsuri plumb, tuburi anti-încâlcire, stopere, ace boilies, cutie) | [kit Hirisi](https://www.aliexpress.com/item/1005010069471820.html) + componente vrac | un kit de ~187 piese apare la 11,99 $ (fără link de produs în index). Calcul: kit propriu din componente ≈ 5,5 $ | 36,63 | 99 lei | [eMAG: Chod Heli 143 piese 82,50 lei; FishingBox 180 piese 99 lei](https://www.emag.ro/search/pescuit+monturi+crap); [Pescar Expert: componente de la 3–8 lei](https://www.pescar-expert.ro/catalog/accesorii-monturi-crap-423629/carp-expert-1104381) |
| 26 | Benzi neopren/velcro pentru lansete, set 10 | [produs](https://www.aliexpress.com/i/32964487696.html) | ~3,74 $ / 10 buc | 24,24 | 45 lei | **neverificat** — nu am găsit listări RO relevante |
| 27 | Manșon neopren cu fermoar pentru cabluri | [produs 2,87 $](https://www.aliexpress.com/item/4000332129057.html) | 2,87 $ | 20,72 | 59 lei / 2 buc | [eMAG: Wobell 4 buc 75,01 lei; JENUOS 4 buc 42,96 lei](https://www.emag.ro/search/mascare+cabluri) |
| 28 | Țepi de irigare din teracotă | [produs (2 buc)](https://ja.aliexpress.com/item/1005006070552191.html) | preț neclar în index; calcul cu 1 $/buc | 9,41 | 69 lei / 4 buc | [eMAG: 54,73 lei/buc; țepi plastic 10 buc 28,77 lei](https://www.emag.ro/search/teracota+irigare) |
| 29 | Șireturi elastice fără legare, cu blocare | [capsule blocare](https://www.aliexpress.com/i/3256804227925312.html) · [căutare](https://www.aliexpress.com/w/wholesale-lazy-shoelace.html) | 0,33–5 $/pereche; calcul cu 0,8 $ | 6,45 | 45 lei / 3 perechi | [eMAG: 2 perechi 28,97 lei; 5 buc 29,52–41,88 lei](https://www.emag.ro/set-sireturi-elastice-cu-blocare-albastre-2-perechi-secbca/pd/D3Q4VY3BM/); [OLX 15–26 lei](https://www.olx.ro/oferte/q-sireturi-elastice/) |
| 30 | Bandă autoadezivă de etanșare uși/geamuri | [căutare](https://www.aliexpress.com/w/wholesale-door-gap-seal.html) | variabil; calcul cu 1,5 $ / 6 m | 12,44 | 49 lei / 2 role | [eMAG: 5,90–56,99 lei](https://www.emag.ro/search/banda+etansare+usa); [Dedeman 1 m 50 lei](https://www.dedeman.ro/ro/banda-adeziva-pentru-usa-ellen-profil-pds-b-zk-maro-1-m/p/5005351) |

**Condiții de livrare AliExpress:** indexul nu arată în mod fiabil costul livrării per variantă. Pentru toate produsele am folosit o ipoteză de transport per unitate: 0,15 $ pentru produse ușoare, 0,50 $ pentru medii, 1,50 $ pentru grele. **De verificat în coș, la cantitatea reală, înainte de comandă.**

### 2B. Problemă, client, concurență, potențial video, seturi

| # | Problema rezolvată | Client ideal / de ce cumpără | Concurență (dovadă) | Video 10–30 s | Seturi |
|---|---|---|---|---|---|
| 1 | Telefon/chei căzute între scaune | Șoferi zilnici; frustrare cunoscută | **Medie–ridicată**: multe organizatoare pe eMAG/OLX, 20–100 lei | Bun (scapi telefonul → nu mai cade) | 2 buc natural (stânga/dreapta) |
| 2 | Pungi pe podeaua mașinii | Mame, cumpărături | **Ridicată**: de la 8,11 lei/4 pe eMAG | Slab–mediu | Da, dar ticket mic |
| 3 | Lovituri ale portierei în parcare | Proprietari de mașini noi | **Ridicată**: 17–31 lei pe eMAG | Mediu | 2 role |
| 4 | Obiecte care se rostogolesc în portbagaj | Familii, SUV | **Ridicată**: 17–19 lei | Mediu | 2 buc |
| 5 | Mâini înghețate la răzuit | Șoferi fără garaj | **Medie**: Dedeman 26 lei, eMAG 19–40 lei | Bun (iarnă, ger) | Upsell la kit iarnă |
| 6 | Murdărie în guri de ventilație, embleme, jante | Pasionați auto, detailing DIY | **Medie**: 50–79 lei, puține seturi cu păr natural | **Foarte bun** (înainte/după) | Set + lavete microfibră |
| 7 | Alunecare pe gheață | Vârstnici, pietoni, câini la plimbare | **Medie**: 39–66 lei, branduri 99–189 lei | Foarte bun | 2 perechi (cuplu) |
| 8 | Murdărie în șine | Gospodării | **Saturată**: de la 4,24 lei | Bun, dar prețul e la sol | — |
| 9 | Scurgeri înfundate cu păr | Gospodării | **Saturată**: de la 2,94 lei | Bun | — |
| 10 | Folie alimentară de unică folosință | Gospodării | **Saturată**: de la 11 lei | Mediu | — |
| 11 | Sertare dezordonate | Gospodării, dressing | **Medie** la seturi: Elindor 130–140 lei | Bun (înainte/după) | 4–8 buc |
| 12 | Cabluri care cad de pe birou | Birou acasă | **Ridicată**: 9–25 lei | Slab | — |
| 13 | Lipsă spațiu în dulap | Gospodării | **Ridicată**: 45–130 lei | Bun | Seturi pe mărimi |
| 14 | Apă în jurul robinetului | Gospodării | **Medie**: 20–45 lei | Bun | 1 + upsell |
| 15 | Mâinile libere, telefonul la îndemână | Tineri, festivaluri, turiști | **Ridicată**: 14–30 lei, branduri 100+ | Bun (modă) | 2 culori |
| 16 | Cablu rupt la mufă | Toți | **Ridicată**: 10–20 lei | Slab | — |
| 17 | Șuruburi pierdute | Meșteri, cadou bărbați | **Ridicată**: sute de modele, 9,60–90 lei | Bun | Cadou |
| 18 | Praf la găurit | DIY | **Saturată**: KWB 9,68 lei | Bun | — |
| 19 | Tăieturi precise la gresie/parchet | DIY, renovare | **Medie**: Geko 28 lei | **Foarte bun** (viral clasic) | — |
| 20 | Păr de animale pe haine/canapea | Stăpâni de animale | **Ridicată**: 7–47 lei | Bun | — |
| 21 | Câine agitat la baie, unghii, singur acasă; mănâncă prea repede | Stăpâni de câini/pisici | **Medie–redusă la vedere**: listări eMAG la 43,99–45 lei (număr total de oferte neverificat) | **Foarte bun** (câinele calm cât timp e spălat) | 2–3 buc, mărimi/culori |
| 22 | Pungi la plimbare | Stăpâni de câini | **Ridicată**: 38–60 lei la 150–300 pungi | Slab | Consumabil recurent |
| 23 | Năpârlire | Stăpâni de animale | **Ridicată**: 7–37 lei | Bun | Pereche |
| 24 | Semnalizare trăsătură | Pescari de feeder/plută | **Saturată**: 6 buc 14,90 lei | Slab | — |
| 25 | Monturi încurcate, componente greu de găsit într-un singur loc | Pescari de crap începători și intermediari | **Medie**: kituri generice 82–99 lei pe eMAG; magazine de specialitate care vând componente separat | Bun (montaj în 20 s) | Kit + rezerve (consumabil) |
| 26 | Lansete încâlcite la transport | Pescari | Neverificat | Slab | Add-on |
| 27 | Cabluri vizibile sub birou | Setup gaming/birou | **Medie**: 43–81 lei / 4 buc | Bun (înainte/după) | 2–4 buc |
| 28 | Plante uscate în concediu | Iubitori de plante | **Redusă la teracotă** (54,73 lei/buc pe eMAG) | Bun | 4–8 buc |
| 29 | Copii/vârstnici care nu își leagă șireturile; alergători | Părinți, vârstnici, sportivi | **Medie**: 15–44 lei | Bun | 3 perechi |
| 30 | Curent rece pe la uși/geamuri | Gospodării, iarnă | **Ridicată**: 6–57 lei | Mediu | 2 role |

### 2C. Riscuri, conformitate, sezonalitate, estimarea cererii

„Cerere” = estimarea mea calitativă. **Nicio cifră de volum nu e verificată** (Google Trends și TikTok nu au fost accesibile). Încrederea reflectă cât de solide sunt dovezile indirecte (câte oferte și prețuri concrete există pe piața RO).

| # | Riscuri comerciale | Conformitate de verificat (UE/RO) | Sezon | Cerere estimată (încredere) |
|---|---|---|---|---|
| 1 | Nu se potrivește la toate mașinile → retururi | GPSR; date importator pe ambalaj; instrucțiuni RO | Tot anul | Medie (medie) |
| 2 | Război de preț | GPSR | Tot anul | Medie (medie) |
| 3 | Adeziv slab, culoare | GPSR | Tot anul | Medie (medie) |
| 4 | Ticket mic | GPSR | Tot anul | Medie (medie) |
| 5 | Stoc blocat după februarie | GPSR. Mănușa de iarnă pentru uz privat e de regulă exclusă din EIP, dar **nu face afirmații de „protecție”** | Nov–feb | Ridicată sezonier (medie) |
| 6 | Păr care cade (calitate) | GPSR; REACH pentru mâner/plastic (declarația furnizorului) | Tot anul, vârf primăvară | Medie (medie) |
| 7 | Mărimi greșite, ținte care se desprind | **Regulamentul EIP 2016/425: certificare de la un organism notificat + CE** ([SGS](https://www.sgs.com/en-se/news/2026/02/ppe-for-winter-outdoors)); fără certificat, **nu vinde** | Nov–feb | Ridicată sezonier (medie) |
| 8–10 | Preț la sol | GPSR; la nr. 10 contact alimentar (Reg. 1935/2004, declarație de conformitate) | Tot anul | — |
| 11 | Volum, transport scump | GPSR | Tot anul | Medie (scăzută) |
| 12, 16 | Preț la sol | GPSR | Tot anul | — |
| 13 | Greutate, saci care pierd aer | GPSR | Vârf primăvară/toamnă | Medie (medie) |
| 14 | Dimensiuni | GPSR; contact alimentar dacă e în bucătărie | Tot anul | Medie (scăzută) |
| 15 | Modă: multe culori = stoc fragmentat | GPSR; **fără logo-uri de brand** | Vară, festivaluri | Medie (medie) |
| 17 | Concurență mare | GPSR; avertizare magneți (stimulatoare cardiace) | Vârf cadouri decembrie, Ziua Tatălui | Medie (medie) |
| 18 | Preț la sol | GPSR | — | — |
| 19 | Varianta de 25 cm e mai scumpă decât pare | GPSR | Tot anul (renovări) | Medie (scăzută) |
| 20 | **Risc de design protejat** (rolele de tip „ChomChom” au designuri brevetate în unele piețe) | Verificare desen/model industrial UE (EUIPO) | Tot anul | Medie (medie) |
| 21 | Ventuze care nu țin; câinii care rod silicon | GPSR; silicon declarat „food grade” (rapoarte LFGB/FDA ale furnizorului ca dovadă de calitate); avertizare „sub supraveghere” | Tot anul | Medie (medie) |
| 22 | Afirmații „biodegradabil/compostabil” | **Afirmațiile de mediu trebuie dovedite** (certificat EN 13432 / OK compost); altfel nu le folosi | Tot anul (recurent) | Ridicată (medie) |
| 23 | Concurență | GPSR | Primăvară/toamnă (năpârlire) | Medie (medie) |
| 24 | Ticket mic; variantele LED au **baterii** (evită-le) | GPSR; baterii (Reg. 2023/1542) dacă au LED | Mar–oct | — |
| 25 | **Plumb**: UE pregătește o restricție REACH pentru plumbul din plumbi și năluci ≤50 g ([document Consiliu, 2026](https://data.consilium.europa.eu/doc/document/ST-9232-2026-INIT/en/pdf)). Kitul trebuie să fie **fără plumb**. Cârlige ascuțite = ambalaj sigur | GPSR; REACH; instrucțiuni RO | Mar–nov (+ cadouri în decembrie) | Medie în nișă (medie) |
| 26 | Ticket mic | GPSR | Mar–nov | Scăzută (scăzută) |
| 27 | Cost unitar prea mare față de eMAG | GPSR | Tot anul | Medie (scăzută) |
| 28 | **Fragil** (teracotă) → spargeri | GPSR | Apr–aug (concedii) | Medie sezonier (scăzută) |
| 29 | Elastic care se lasă | GPSR | Tot anul, vârf septembrie (școală) | Medie (medie) |
| 30 | Adeziv slab la frig | GPSR | Oct–ian | Ridicată sezonier (medie) |

**Obligatoriu pentru toate:** dacă imporți tu în UE, **devii importator** în sensul GPSR (Reg. 2023/988, aplicabil din 13.12.2024). Asta înseamnă:
- numele și adresa ta pe produs sau pe ambalaj;
- o analiză internă de risc și documentația tehnică păstrate;
- instrucțiuni și avertizări în română;
- trasabilitate (lot);
- păstrarea datelor din lanțul de aprovizionare (sursele indică 6 ani);
- datele producătorului și ale tale afișate în anunțul online ([Base.com, GPSR](https://base.com/ro-RO/blog/regulament-gpsr-modificari-semnificative-pentru-comertul-electronic-din-13-decembrie); [Comisia Europeană, Q&A](https://webgate.ec.europa.eu/safety/consumers/consumers_safety_gate/obligationsForBusinesses/documents/Q&A.pdf)).

În plus, în România se aplică dreptul de retragere de 14 zile la vânzarea la distanță și informarea consumatorului în limba română.

---

## 3. TOP 10 — clasament

**Ponderi** (total 100):
- cerere probabilă 20;
- marjă potențială 20;
- concurență 15 (10 = concurență redusă);
- ușurința promovării 10;
- transport 10;
- risc de retur 10 (10 = risc mic);
- diferențiere 10;
- vânzare repetată 5.

Scor final = Σ(notă × pondere) / 10. Marja are pondere mare pentru că modelul arată că ea e factorul care elimină cele mai multe produse. Cererea are pondere mare pentru că e indicatorul cel mai puțin verificat, deci trebuie testată prima.

| Loc | Produs | Cerere | Concur. | Marjă | Promov. | Transp. | Retur | Dif. | Repet. | **Scor** | Argument principal |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Kit montaje crap (fără plumb)** | 6 | 6 | 8 | 7 | 8 | 8 | 9 | 7 | **72,5** | Singurul produs cu contribuție pozitivă și la reclamă moderată, cu livrare gratuită. Kiturile generice de pe eMAG costă 82–99 lei. Un kit „gândit pentru lacurile din RO” cu instrucțiuni RO e diferențiere reală. Consumabil. |
| 2 | **Covoraș de lins (2–3 buc)** | 6 | 7 | 7 | 9 | 9 | 8 | 6 | 4 | **70,5** | Concurența vizibilă e la 44–45 lei bucata, iar costul aterizat e ~14 lei. Video foarte ușor de făcut, produs ușor și greu de stricat. |
| 3 | **Set perii detailing (păr natural)** | 6 | 5 | 6 | 9 | 8 | 8 | 6 | 3 | **64,0** | Piața e la 50–79 lei. Înainte/după în 10 s. Marjă bună doar în pachet sau cu livrarea plătită de client. |
| 4 | Șnur crossbody cu patch | 6 | 4 | 5 | 8 | 10 | 7 | 5 | 2 | 59,0 | Foarte ușor de transportat, dar concurență mare și risc de modă. |
| 5 | Șireturi elastice cu blocare | 5 | 5 | 5 | 7 | 10 | 7 | 5 | 3 | 58,0 | Ieftin de trimis; vinzi un pachet de 3 perechi „pentru toată familia”. |
| 6 | Rolă reutilizabilă păr animale | 7 | 4 | 5 | 8 | 8 | 7 | 3 | 1 | 56,5 | Cerere clară, dar concurență de 7–47 lei și **risc de design protejat** — verifică EUIPO. |
| 7 | Țepi de irigare din teracotă | 5 | 6 | 6 | 7 | 5 | 5 | 5 | 3 | 54,5 | Preț RO surprinzător de mare (54,73 lei/buc), dar fragil și sezonier (aprilie–august). |
| 8 | Brățară magnetică | 5 | 4 | 5 | 8 | 8 | 8 | 4 | 1 | 54,5 | Bun ca piesă de pachet cadou, slab ca produs singur. |
| 9 | Covoraș silicon robinet | 5 | 5 | 5 | 7 | 8 | 7 | 4 | 1 | 54,0 | Marjă doar dacă clientul plătește livrarea. |
| 10 | Șablon contur 25 cm | 5 | 5 | 3 | 9 | 8 | 7 | 4 | 1 | 52,0 | Viral, dar Geko e la 28 lei pe eMAG, iar varianta de 25 cm din China probabil costă mai mult decât am presupus. |

**Excluse cu motiv:**
- **Crampoanele** (#7) ar fi avut ~60 de puncte, dar intră sub regulamentul EIP și cer certificare.
- **Produsele 8, 9, 12, 16, 18, 24** sunt deja la 3–15 lei pe eMAG.
- **Saci vidați** și **separatoare de sertar**: cost aterizat prea mare și, la separatoare, preț AliExpress neverificat.

---

## 4. Analiză detaliată TOP 3

### 4.1 Kit montaje crap „asamblat în RO”, fără plumb

- **Ce e:** o cutie cu compartimente (~1,5 $) cu componentele cumpărate vrac de pe AliExpress:
  - vârtejuri cu inel și rapide;
  - clipsuri de siguranță pentru plumb;
  - tuburi anti-încâlcire;
  - stopere pentru boilies;
  - inele și tub silicon;
  - ac și burghiu pentru boilies;
  - **fără plumbi, fără cârlige de calitate îndoielnică**. Cârligele sunt cel mai sensibil punct de calitate, deci le poți vinde separat, de la un brand cunoscut din comerțul RO.
  
  Se adaugă un card plastifiat în română cu 3 monturi desenate (hair rig, helicopter, chod), adaptate la ce se pescuiește în RO.
- **De ce acum:** sezonul mare de crap e martie–noiembrie. Decembrie e o fereastră de cadou. Ianuarie–februarie e perioada de pregătire.
- **Dovezi de piață:**
  - eMAG are kituri generice la 82,50 lei (Chod Heli, 143 piese) și 99 lei (FishingBox, 180 piese);
  - magazinele de specialitate vând componentele separat, la 3–8 lei pachetul ([Pescar Expert](https://www.pescar-expert.ro/catalog/accesorii-monturi-crap-423629/carp-expert-1104381));
  - pe AliExpress există kituri gata făcute ([Hirisi](https://www.aliexpress.com/item/1005010069471820.html)), iar un kit de ~187 de piese apare la 11,99 $.
- **Avantaj necopiabil ușor:** expertiza ta (lucrezi deja cu boilies). Un kit curatoriat cu instrucțiuni RO se compară greu pe preț cu un „kit de 420 de piese”.
- **Riscuri:**
  - piese de proastă calitate (vârtejuri care cedează). Le testezi tu la tracțiune înainte;
  - restricția UE pentru plumb. Kitul nu conține plumb;
  - un ambalaj care se deschide la transport.

### 4.2 Covoraș de lins pentru câini/pisici

- **Ce e:** un covoraș de silicon cu ventuze și texturi. Se întinde pe el iaurt, pateu sau unt de arahide, iar câinele linge minute întregi. Se folosește la baie, la tăiatul unghiilor, la artificii sau ca hrănire lentă.
- **Dovezi:**
  - pe eMAG apare [la 43,99 lei](https://www.emag.ro/covoras-hranire-lick-mat-pentru-caini-pisic-cu-ventuze-de-aspiratie-silikon-negru-1140570288/pd/D9568KYBM/), iar un slow feeder la 45 lei;
  - pe AliExpress prețurile încep de la ~1 $ ([căutare](https://www.aliexpress.com/w/wholesale-dog-licking-mat.html)).
  
  Numărul total de oferte RO și volumul de căutări: **neverificate**.
- **De ce el primul:**
  - nu e sezonier, deși are un vârf natural de Revelion (artificii — câini speriați);
  - e ușor (~80–120 g) și nu se sparge;
  - beneficiul se vede în 10 s, fără explicații;
  - pachetul de 2–3 bucăți e natural: unul pentru baie, unul pentru acasă, mărimi diferite.
- **Riscuri:**
  - câinii mari pot roade siliconul. Afișezi o avertizare clară „se folosește sub supraveghere” și dai recomandări de mărime;
  - ventuzele nu țin pe faianță poroasă;
  - mirosul siliconului ieftin. Asta e criteriul principal de eliminare la mostre.
- **Nu afirma** „reduce anxietatea” sau „recomandat de veterinari”. Spune doar ce se vede: „îl ține ocupat cât îl speli”.

### 4.3 Set perii detailing auto, păr natural

- **Ce e:** 5 perii de diferite mărimi, cu păr de porc, pentru guri de ventilație, embleme, cusături și jante.
- **Dovezi:**
  - eMAG are seturi la 69,68–78,99 lei (Excitat, păr natural, 78,99 lei), iar OLX la 40–55 lei;
  - pe AliExpress e la 4,93 $ ([produs](https://www.aliexpress.com/item/4000245372739.html)).
- **Diferențiere:** pachet „Interior curat în 15 minute” cu 5 perii + 2 lavete microfibră + un card cu ordinea pașilor. Poți face și un parteneriat de conținut cu un atelier de detailing local (în acest repo există proiecte autospa-detailing — dacă e un client sau partener real, e un canal natural).
- **Riscuri:**
  - părul cade la seturile ieftine. Asta e criteriul de eliminare la mostre;
  - un recenzent menționează peri „foarte tari” la un set de pe AliExpress. Testează pe plastic lucios înainte să cumperi stocul.

---

## 5. Calcule de profit

### 5.1 Ipoteze (toate ajustabile în `model/model.py`)

| Element | Valoare | Sursă / statut |
|---|---|---|
| Curs | 1 $ = 4,7616 lei; 1 € = 5,3527 lei | [BNR 06.10.2026 via cursbnr](https://cursbnr.nxm.ro/data/03-10-2026) |
| TVA la import (regim test, ≤150 €/colet) | 21%, plătit la AliExpress prin IOSS, **presupus nerecuperabil** | Cota de 21% din 1.08.2025 ([Avalara](https://www.avalara.com/blog/en/europe/2025/07/blog-romania-vat-rate-changes-2025.html)). IOSS e un regim B2C, iar TVA-ul plătit acolo de un revânzător e greu de recuperat ([discuție](https://community.shopify.com/t/does-aliexpress-handle-ioss-and-vat-for-dropshipping-in-the-eu-and-usa/236782/8)) — **confirmă cu contabilul** |
| Taxa vamală UE pentru colete <150 € | 3 € pe linie tarifară, din 1.07.2026 | [Comisia Europeană](https://commission.europa.eu/news-and-media/news/ensuring-fairness-and-safety-eur3-customs-duty-low-value-parcels-2026-06-29_en), [Consiliu](https://www.consilium.europa.eu/en/press/press-releases/2025/12/12/customs-council-agrees-to-levy-customs-duty-on-small-parcels-as-of-1-july-2026/) |
| Taxa logistică RO | 25 lei/colet extra-UE <150 € | Legea 239/2025 ([Forbes](https://www.forbes.ro/parlamentul-a-adoptat-taxa-fixa-de-25-de-lei-pentru-coletele-sub-150-de-euro-din-afara-ue-masura-se-aplica-din-1-ianuarie-2026-475391), [Digi24](https://www.digi24.ro/stiri/economie/ministerul-finantelor-explica-noua-taxa-de-25-de-lei-pentru-coletele-din-afara-ue-nu-e-taxa-vamala-ci-o-obligatie-fiscala-interna-3614117)). Se mai vorbește de o taxă UE de manipulare de 2 € din noiembrie 2026 — **neconfirmat oficial** |
| Unități pe colet de test | 50 (un singur produs pe colet) | Ipoteză |
| Transport China→RO | 0,15 / 0,50 / 1,50 $ pe unitate (ușor/mediu/greu) | Ipoteză — verifică în coș |
| Variație preț/curs | +5% | Ipoteză |
| Statut fiscal | SRL microîntreprindere, **neplătitoare de TVA** (plafon 395.000 lei, [fiscalitatea.ro](https://www.fiscalitatea.ro/plafoane-fiscale-2026-24595/)) → nu colectezi TVA la vânzare, dar nu deduci TVA-ul de import | Impozit pe venit micro 1% din încasări — **cota pentru 2026 de confirmat cu contabilul** |
| Ambalaj / manipulare | 2,0 / 1,5 lei pe comandă | Ipoteză |
| Livrare la client | **A:** comerciantul plătește 17 lei (livrare „gratuită”). **B:** clientul plătește livrarea | Ipoteză. Sameday a scumpit tarifele cu 9,7% din 1.04.2026 ([gadget.ro](https://gadget.ro/vestea-buna-este-ca-sameday-a-ajuns-la-o-retea-de-peste-6000-de-easybox-uri-in-toata-tara-iar-vestea-rea-este-ca-de-la-1-aprilie-se-scumpesc-serviciile-de-livrare/)). Cere ofertă contractuală |
| Platformă (magazin propriu) | 2 lei/comandă (abonament amortizat) | Ipoteză |
| Plată (card/ramburs) | 2,5% din preț | Ipoteză |
| Retururi + refuzuri ramburs | 6% din comenzi × (17 lei retur + 50% din cost produs pierdut) | Ipoteză. **Refuzul coletelor ramburs e riscul specific RO** |
| Defecte | 3% × (înlocuire produs + 17 lei) | Ipoteză |
| Cost de achiziție client (CAC) | organic 3 lei · moderat 20 lei · scump 40 lei pe comandă | **Ipoteze neverificate.** Se măsoară în test |
| Costuri fixe de lansare/produs | 250 lei (mostre, foto/video, listare) | Ipoteză |
| eMAG Marketplace | **Nu e inclus**. Comisionul diferă pe categorii; procentele exacte pentru 2026 nu le-am putut verifica ([Eurosender](https://www.eurosender.com/ro/ghid-vanzare/emag)). Vânzătorii locali noi au primit 50% reducere la comision în primele 12 luni (sursă de presă) | Calculează separat după tabelul oficial de comisioane |

**Recuperare investiție** = costurile fixe de lansare (250 lei) / contribuția per comandă. Stocul se recuperează separat, prin costul produsului inclus în fiecare comandă.

### 5.2 Toate cele 30 de produse — contribuție / marjă / comenzi pentru recuperarea celor 250 lei

Format celulă: **contribuție per comandă (lei) / marjă % / comenzi de recuperare** („—” = nu se recuperează niciodată). **A** = livrare plătită de tine. **B** = livrare plătită de client.

| # | Produs (ofertă) | Cost aterizat/unit. | Preț ofertă | A organic | A moderat | A scump | B organic | B moderat | B scump |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Umplutură spațiu scaune PU (2 buc) | 15.46 | 49 | +3.9 / 8% / 65 | -13.1 / -27% / — | -33.1 / -68% / — | +20.9 / 43% / 12 | +3.9 / 8% / 65 | -16.1 / -33% / — |
| 2 | Cârlige tetieră (set 8 = 2x4) | 7.66 | 29 | -15.1 / -52% / — | -32.1 / -110% / — | -52.1 / -180% / — | +1.9 / 7% / 129 | -15.1 / -52% / — | -35.1 / -121% / — |
| 3 | Bandă protecție portieră 5 m (2 role) | 11.41 | 45 | -7.5 / -17% / — | -24.5 / -54% / — | -44.5 / -99% / — | +9.5 / 21% / 27 | -7.5 / -17% / — | -27.5 / -61% / — |
| 4 | Plasă/buzunar portbagaj velcro (2 buc) | 12.44 | 39 | -15.4 / -40% / — | -32.4 / -83% / — | -52.4 / -134% / — | +1.6 / 4% / 156 | -15.4 / -40% / — | -35.4 / -91% / — |
| 5 | Răzuitor gheață cu mănușă | 18.49 | 39 | -9.0 / -23% / — | -26.0 / -67% / — | -46.0 / -118% / — | +8.0 / 20% / 32 | -9.0 / -23% / — | -29.0 / -74% / — |
| 6 | Set 5 perii detailing păr natural | 33.19 | 79 | +14.0 / 18% / 18 | -3.0 / -4% / — | -23.0 / -29% / — | +31.0 / 39% / 9 | +14.0 / 18% / 18 | -6.0 / -8% / — |
| 7 | Crampoane antiderapante (2 perechi) | 21.51 | 69 | -5.4 / -8% / — | -22.4 / -32% / — | -42.4 / -62% / — | +11.6 / 17% / 22 | -5.4 / -8% / — | -25.4 / -37% / — |
| 8 | Perie șine geam (set 3) | 7.66 | 25 | -26.8 / -107% / — | -43.8 / -175% / — | -63.8 / -255% / — | -9.8 / -39% / — | -26.8 / -107% / — | -46.8 / -187% / — |
| 9 | Sită silicon păr scurgere (set 4) | 8.21 | 29 | -33.1 / -114% / — | -50.1 / -173% / — | -70.1 / -242% / — | -16.1 / -56% / — | -33.1 / -114% / — | -53.1 / -183% / — |
| 10 | Capace silicon extensibile set 6 | 15.46 | 39 | -5.8 / -15% / — | -22.8 / -58% / — | -42.8 / -110% / — | +11.2 / 29% / 23 | -5.8 / -15% / — | -25.8 / -66% / — |
| 11 | Separatoare sertar extensibile (set 4) | 26.51 | 119 | -22.2 / -19% / — | -39.2 / -33% / — | -59.2 / -50% / — | -5.2 / -4% / — | -22.2 / -19% / — | -42.2 / -36% / — |
| 12 | Cleme cabluri autoadezive (set 40) | 7.60 | 29 | -14.9 / -52% / — | -31.9 / -110% / — | -51.9 / -179% / — | +2.1 / 7% / 121 | -14.9 / -52% / — | -34.9 / -120% / — |
| 13 | Saci vidați + pompă (set 8) | 56.76 | 79 | -11.0 / -14% / — | -28.0 / -35% / — | -48.0 / -61% / — | +6.0 / 8% / 42 | -11.0 / -14% / — | -31.0 / -39% / — |
| 14 | Covoraș silicon robinet | 21.51 | 49 | -2.5 / -5% / — | -19.5 / -40% / — | -39.5 / -81% / — | +14.5 / 30% / 18 | -2.5 / -5% / — | -22.5 / -46% / — |
| 15 | Șnur telefon crossbody + patch (2 buc) | 10.69 | 49 | -2.1 / -4% / — | -19.1 / -39% / — | -39.1 / -80% / — | +14.9 / 30% / 17 | -2.1 / -4% / — | -22.1 / -45% / — |
| 16 | Protecții spirală cablu (set 10) | 7.66 | 25 | -11.0 / -44% / — | -28.0 / -112% / — | -48.0 / -192% / — | +6.0 / 24% / 42 | -11.0 / -44% / — | -31.0 / -124% / — |
| 17 | Brățară magnetică șuruburi | 21.51 | 49 | -2.5 / -5% / — | -19.5 / -40% / — | -39.5 / -81% / — | +14.5 / 30% / 18 | -2.5 / -5% / — | -22.5 / -46% / — |
| 18 | Colector praf burghiu (set 2) | 8.87 | 29 | -17.6 / -61% / — | -34.6 / -119% / — | -54.6 / -188% / — | -0.6 / -2% / — | -17.6 / -61% / — | -37.6 / -130% / — |
| 19 | Șablon contur 25 cm cu blocare | 33.61 | 69 | +3.9 / 6% / 64 | -13.1 / -19% / — | -33.1 / -48% / — | +20.9 / 30% / 12 | +3.9 / 6% / 64 | -16.1 / -23% / — |
| 20 | Rolă reutilizabilă păr animale | 15.46 | 49 | +3.9 / 8% / 65 | -13.1 / -27% / — | -33.1 / -68% / — | +20.9 / 43% / 12 | +3.9 / 8% / 65 | -16.1 / -33% / — |
| 21 | Covoraș de lins câini/pisici (2 buc) | 14.25 | 69 | +9.8 / 14% / 26 | -7.2 / -10% / — | -27.2 / -40% / — | +26.8 / 39% / 10 | +9.8 / 14% / 26 | -10.2 / -15% / — |
| 22 | Dispenser pungi + 20 role | 29.54 | 59 | -1.4 / -2% / — | -18.4 / -31% / — | -38.4 / -65% / — | +15.6 / 26% / 17 | -1.4 / -2% / — | -21.4 / -36% / — |
| 23 | Mănușă toaletaj (pereche) | 10.69 | 45 | -5.9 / -13% / — | -22.9 / -51% / — | -42.9 / -95% / — | +11.1 / 25% / 23 | -5.9 / -13% / — | -25.9 / -58% / — |
| 24 | Clopoței avertizare pescuit (set 6) | 4.03 | 25 | -27.9 / -112% / — | -44.9 / -180% / — | -64.9 / -260% / — | -10.9 / -44% / — | -27.9 / -112% / — | -47.9 / -192% / — |
| 25 | Kit montaje crap asamblat (fără plumb) | 36.63 | 99 | +29.7 / 30% / 9 | +12.7 / 13% / 20 | -7.3 / -7% / — | +46.7 / 47% / 6 | +29.7 / 30% / 9 | +9.7 / 10% / 26 |
| 26 | Benzi neopren lansete (set 10) | 24.24 | 45 | -9.3 / -21% / — | -26.3 / -58% / — | -46.3 / -103% / — | +7.7 / 17% / 33 | -9.3 / -21% / — | -29.3 / -65% / — |
| 27 | Manșon neopren cabluri (set 2) | 20.72 | 59 | -13.4 / -23% / — | -30.4 / -52% / — | -50.4 / -85% / — | +3.6 / 6% / 70 | -13.4 / -23% / — | -33.4 / -57% / — |
| 28 | Țepi irigare teracotă (set 4) | 9.41 | 69 | +0.5 / 1% / 497 | -16.5 / -24% / — | -36.5 / -53% / — | +17.5 / 25% / 15 | +0.5 / 1% / 497 | -19.5 / -28% / — |
| 29 | Șireturi elastice cu blocare (3 perechi) | 6.45 | 45 | -3.7 / -8% / — | -20.7 / -46% / — | -40.7 / -90% / — | +13.3 / 30% / 19 | -3.7 / -8% / — | -23.7 / -53% / — |
| 30 | Bandă etanșare uși/geam 6 m (2 role) | 12.44 | 49 | -5.7 / -12% / — | -22.7 / -46% / — | -42.7 / -87% / — | +11.3 / 23% / 23 | -5.7 / -12% / — | -25.7 / -52% / — |

**Cum citești tabelul:**
- Doar **kitul de crap** rămâne pozitiv la reclamă moderată cu livrare gratuită.
- Doar kitul de crap rămâne pozitiv la reclamă scumpă, și acolo numai dacă livrarea o plătește clientul.
- Majoritatea produselor ieftine funcționează **doar organic (TikTok/OLX) și doar cu livrarea plătită de client**. Asta e o afacere de volum mic, nu una scalabilă prin reclame.

### 5.3 TOP 3 — cele trei scenarii, pe ofertă și regim de aprovizionare

**Regim test** = AliExpress, colet ≤150 €. **Regim comercial** = furnizor B2B (Alibaba sau direct), 300–500 de bucăți, preț unitar estimat 50–65% din cel de pe AliExpress, taxă vamală ~4% (de confirmat pe codul tarifar), TVA 21% nerecuperabil (ești neplătitor de TVA), comisionar vamal ~400 lei pe transport. **Prețurile B2B sunt estimări** până primești oferte reale.

Format: cost total per comandă → contribuție / marjă / comenzi pentru recuperarea celor 250 lei.

**Covoraș de lins** (cost aterizat: test 14,25 lei/buc, comercial ~8,25 lei/buc):

| Ofertă | Regim | Livrare | Organic | Moderat (CAC 20) | Scump (CAC 40) |
|---|---|---|---|---|---|
| 1 buc · 49 lei | test | client | 26,9 → **+22,1 / 45% / 12** | 43,9 → +5,1 / 10% / 49 | 63,9 → −14,9 |
| 2 buc · 79 lei | test | comerciant | 59,6 → +19,4 / 25% / 13 | 76,6 → +2,4 / 3% / 104 | 96,6 → −17,6 |
| 2 buc · 79 lei | test | client | 42,6 → **+36,4 / 46% / 7** | 59,6 → **+19,4 / 25% / 13** | 79,6 → −0,6 |
| 3 buc · 99 lei | test | client | 58,0 → +41,0 / 41% / 7 | 75,0 → +24,0 / 24% / 11 | 95,0 → +4,0 / 4% / 62 |
| 3 buc · 99 lei | comercial | comerciant | 56,2 → +42,8 / 43% / 6 | 73,2 → **+25,8 / 26% / 10** | 93,2 → +5,8 / 6% / 44 |
| 2 buc · 79 lei | comercial | client | 30,0 → +49,0 / 62% / 6 | 47,0 → +32,0 / 41% / 8 | 67,0 → **+12,0 / 15% / 21** |

**Kit montaje crap** (test 36,63 lei/kit, comercial ~24,86 lei/kit):

| Ofertă | Regim | Livrare | Organic | Moderat | Scump |
|---|---|---|---|---|---|
| Kit · 99 lei | test | comerciant | 69,3 → **+29,7 / 30% / 9** | 86,3 → +12,7 / 13% / 20 | 106,3 → −7,3 |
| Kit · 99 lei | test | client | 52,3 → +46,7 / 47% / 6 | 69,3 → +29,7 / 30% / 9 | 89,3 → +9,7 / 10% / 26 |
| Kit + rezerve · 139 lei | test | comerciant | 93,4 → +45,6 / 33% / 6 | 110,4 → **+28,6 / 21% / 9** | 130,4 → +8,6 / 6% / 29 |
| Kit + rezerve · 139 lei | comercial | comerciant | 73,6 → +65,4 / 47% / 4 | 90,6 → +48,4 / 35% / 6 | 110,6 → **+28,4 / 20% / 9** |

**Set perii detailing** (test 33,19 lei/set, comercial ~20,20 lei/set):

| Ofertă | Regim | Livrare | Organic | Moderat | Scump |
|---|---|---|---|---|---|
| Set · 79 lei | test | comerciant | 65,0 → +14,0 / 18% / 18 | 82,0 → −3,0 | 102,0 → −23,0 |
| Set · 79 lei | test | client | 48,0 → +31,0 / 39% / 9 | 65,0 → +14,0 / 18% / 18 | 85,0 → −6,0 |
| Set + 2 microfibre · 99 lei | test | client | 57,2 → +41,8 / 42% / 6 | 74,2 → **+24,8 / 25% / 11** | 94,2 → +4,8 / 5% / 53 |
| Set + 2 microfibre · 99 lei | comercial | comerciant | 57,1 → +41,9 / 42% / 6 | 74,1 → +24,9 / 25% / 11 | 94,1 → +4,9 / 5% / 52 |

**CPA maxim suportabil** (contribuția înainte de reclamă — dacă plătești mai mult per comandă, pierzi bani):

| Produs | CPA maxim |
|---|---|
| Covoraș de lins, 2 buc · 79 lei, clientul plătește livrarea, regim test | ~39 lei |
| Kit crap · 99 lei, livrare gratuită, regim test | ~33 lei |
| Kit crap + rezerve · 139 lei, livrare gratuită | ~49 lei |
| Perii + microfibre · 99 lei, clientul plătește livrarea | ~45 lei |

**Ținta de lucru:** un CPA de cel mult 50–60% din aceste valori.

**TVA:** în acest model nu există TVA recuperabil, pentru că presupun că ești neplătitor de TVA. Dacă devii plătitor (voluntar sau peste 395.000 lei), recuperezi TVA-ul de import, dar **colectezi 21% din fiecare preț de vânzare**. La aceste produse, regimul de plătitor e de regulă mai scump, pentru că marja e mare față de costul produsului. Decizia se ia cu contabilul.

---

## 6. Plan de lansare cu 1.000 € (5.353 lei)

### 6.1 Alocare

| Destinație | € | lei | Când se cheltuie |
|---|---|---|---|
| Mostre: 3 furnizori × 3 produse + 2 rezerve (șireturi, șnur) | 120 | 642 | Săptămâna 1 |
| Setup: domeniu, magazin (plan de bază sau WooCommerce + hosting), etichete GPSR, promovări OLX | 50 | 268 | Săptămâna 1–2 |
| Prima comandă comercială — **în tranșe** | 345 | 1.847 | Doar după validarea mostrelor |
| — covoraș de lins: 50 buc (~14,25 lei) | 133 | 713 | Săptămâna 3 |
| — kit crap: componente pentru 20 de kituri + cutii (~36,6 lei) | 137 | 733 | Săptămâna 3–4 (stoc pentru cadouri de decembrie) |
| — perii detailing: 12 seturi (~33,2 lei) | 75 | 398 | Săptămâna 4, doar dacă testul de reclamă dă CTR bun |
| Ambalaje și logistică: plicuri cu bule, cutii kit, card instrucțiuni RO, imprimantă de etichete termică (opțional) | 70 | 375 | Săptămâna 2–3 |
| Teste de reclamă (Meta + TikTok), în tranșe de ~80 € pe produs | 250 | 1.338 | Săptămânile 3–8 |
| Rezervă: retururi, refuzuri ramburs, mostre de înlocuire, taxe neprevăzute | 165 | 883 | Nu se atinge fără motiv |
| **Total** | **1.000** | **5.353** | |

**Neincluse:** înființarea și contabilitatea firmei (SRL ~ câteva sute de lei la înființare, plus contabil lunar), plus EORI (gratuit, necesar la importul comercial).

### 6.2 Cum testezi cererea înainte să blochezi bani în stoc

1. **Testul cu mostre (săptămâna 1–2):** filmezi 3–5 videoclipuri cu mostrele. Le postezi organic pe TikTok/Reels și publici un anunț OLX la prețul țintă. Măsori mesajele, salvările și întrebările de preț. Cost: aproape zero.
2. **Pre-comandă sau listă de așteptare:** pe pagina de produs pui „livrare în 10–14 zile” pentru primele 20 de comenzi. Asta e legal dacă anunți clar termenul, iar contractul la distanță permite un termen de până la 30 de zile, dacă nu se convine altfel.
3. **Reclamă mică:** 10–15 €/zi timp de 5 zile pe produs, cu 2–3 variante de creative. Decizia se ia pe CTR și pe costul pe adăugare în coș, nu pe impresii.
4. **Stoc în tranșe:** prima comandă acoperă 2–3 săptămâni de vânzări estimate. Recomanzi abia când stocul scade la 40%.

### 6.3 Indicatori și praguri

| Moment | Indicator | Prag „continuă” | Prag „schimbă oferta” | Prag „abandonează” |
|---|---|---|---|---|
| Ziua 7 | CTR al reclamei | ≥1,2% | 0,6–1,2% → schimbă hook-ul sau creativul | <0,6% după 3 creative |
| Ziua 7 | Cost per click | ≤1 leu | 1–2 lei | >2 lei |
| Ziua 7 | Video organic: rată de vizionare 3 s și salvări | Salvări >1% din vizualizări | — | — |
| Ziua 14 | CPA real față de CPA maxim | ≤60% din maxim | 60–100% → pachet mai mare, preț, pagină | >100% după 80 € cheltuiți |
| Ziua 14 | Conversie pagină produs | ≥1,5% | 0,8–1,5% | <0,8% |
| Ziua 30 | Contribuție totală după reclamă | Pozitivă și ≥15% | 0–15% | Negativă |
| Ziua 30 | Refuzuri ramburs + retururi | ≤8% | 8–12% → cere avans la card, confirmă telefonic | >12% |
| Ziua 30 | Defecte raportate | ≤3% | 3–5% → schimbă furnizorul | >5% |
| Ziua 30 | Valoare medie a coșului (AOV) | ≥ prețul pachetului de 2 | — | — |

---

## 7. Reclame și oferte gata de testat

### 7.1 Covoraș de lins — „LinguLiniște” (nume de lucru; verifică disponibilitatea mărcii la OSIM/EUIPO)

- **Ofertă:**
  - 1 buc 49 lei;
  - **Pachet „Baie fără stres” 2 buc 79 lei** (mic + mare);
  - pachet 3 buc 99 lei;
  - în pachet: un card cu 6 rețete sigure de umplere (iaurt simplu, dovleac, pateu). Ce alimente sunt periculoase pentru câini (xilitol, ciocolată, struguri) se verifică cu un medic veterinar înainte de tipărire.
- **TikTok 15–20 s:**
  - **0–3 s:** câine ud care se zbate la baie. Text: „Baia de duminică, varianta grea”;
  - **3–8 s:** lipești covorașul pe faianță și întinzi iaurt;
  - **8–15 s:** același câine linge calm, iar tu îl clătești;
  - **15–20 s:** „Se lipește pe faianță. Se spală în mașina de vase. 2 bucăți – 79 lei.”
- **Al doilea scenariu:** tăiatul unghiilor. Al treilea scenariu: Revelion și artificii, de lansat în ultima săptămână din decembrie.
- **Titlu OLX:** „Covoraș de lins pentru câini și pisici, silicon cu ventuze – set 2 buc (mic + mare)”.
- **Descriere OLX (scurt):** „Îl lipești pe faianță, întinzi iaurt sau pateu, iar câinele stă liniștit cât îl speli sau îi tai unghiile. Silicon flexibil, se spală ușor. Folosiți doar sub supraveghere; dacă animalul roade siliconul, retrageți covorașul. Livrare easybox/curier. Ridicare personală în [oraș].”
- **Pagina de produs:**
  1. video sus;
  2. 3 utilizări (baie, unghii, hrănire lentă);
  3. ghid de mărimi după greutatea câinelui;
  4. avertizare de siguranță;
  5. pachete;
  6. FAQ (ventuze, curățare, retur 14 zile);
  7. datele producătorului și ale importatorului (GPSR).
- **Upsell:** mănușă de toaletaj (#23) sau pungi pentru plimbare (#22).
- **Cum eviți concurența pe preț:** vinzi pachetul „baie fără stres”, cardul de rețete și conținutul video. Nu vinzi „covoraș de silicon”.

### 7.2 Kit crap — „Kit Monturi Crap · ediția lacurilor din RO” (nume de lucru)

- **Ofertă:**
  - kit 99 lei (componente pentru ~15–20 de monturi + card cu 3 monturi + cod QR către videoclipuri de montaj în română);
  - **Kit + rezerve 139 lei** (dublezi consumabilele care se termină primele: tuburi, stopere, vârtejuri);
  - abonament informal de reaprovizionare („pachet rezerve” la 49 lei, livrare la comanda următoare).
- **TikTok 15–20 s:**
  - **0–3 s:** mâini care desfac un ghem de fir încurcat. Text: „Montura asta m-a costat un crap de 12 kg”;
  - **3–12 s:** montezi un hair rig cu componentele din cutie, în timp real, accelerat;
  - **12–20 s:** cutia deschisă, toate compartimentele vizibile. „Tot ce-ți trebuie într-o cutie. Fără plumb. Instrucțiuni în română.”
- **Titlu OLX:** „Kit accesorii monturi crap – vârtejuri, clipsuri, tub anti-încâlcire, stopere boilies – cu instrucțiuni RO”.
- **Pagina de produs:**
  1. lista exactă a pieselor (cantități reale numărate);
  2. ce monturi poți face;
  3. pentru ce fel de apă și pește;
  4. ce NU conține (plumb, fir, cârlige — sau cârlige numai dacă sunt de calitate verificată);
  5. video;
  6. FAQ.
- **Upsell:** boilies sau aditivi, dacă ai deja o sursă — e domeniul tău; un set de ace pentru boilies; o geantă pentru accesorii.
- **Cum eviți concurența pe preț:** expertiza. Faci un video săptămânal „montura săptămânii”. Nimeni nu compară un kit cu suport video în română cu un kit generic de 420 de piese.

### 7.3 Perii detailing — „Set Detailing Interior 15 min” (nume de lucru)

- **Ofertă:**
  - set 5 perii 79 lei;
  - **set + 2 lavete microfibră 99 lei**;
  - card cu ordinea pașilor (praf → ventilație → cusături → console → lavetă).
- **TikTok 15–20 s:**
  - **0–3 s:** prim-plan cu praful din gura de ventilație. Text: „Asta respiri în fiecare dimineață”. **Nu face afirmații despre sănătate** — mai sigur e „Asta e în mașina ta acum”;
  - **3–12 s:** o singură trecere cu peria, unde praful iese vizibil;
  - **12–20 s:** înainte/după cu split-screen și pachetul.
- **Titlu OLX:** „Set 5 perii detailing auto păr natural + 2 lavete microfibră – guri de aerisire, embleme, jante”.
- **Pagina de produs:**
  1. video;
  2. ce perie la ce zonă (foto);
  3. „nu zgârie plasticul lucios” — **doar dacă ai testat**;
  4. întreținerea periilor;
  5. pachete.
- **Upsell:** lavete suplimentare, o perie de jante.
- **Cum eviți concurența pe preț:** vinzi pachetul cu metoda (cardul și videoul). Poți colabora cu un atelier de detailing local pentru conținut.

---

## 8. Riscuri, conformitate și verificări înainte de import

### 8.1 Lista de verificare per lot

1. **Statut de importator:** EORI. Pentru importul comercial, un comisionar vamal și încadrarea tarifară corectă (codul HS al fiecărui produs).
2. **GPSR:**
   - analiză de risc scrisă (1–2 pagini per produs);
   - etichetă cu producătorul și importatorul (nume, adresă poștală și electronică);
   - număr de lot;
   - instrucțiuni și avertizări în română.
3. **Declarații de la furnizor:**
   - REACH (fără substanțe din lista SVHC peste 0,1%, ftalați în PVC);
   - pentru silicon, raport de test LFGB sau FDA (ca dovadă de calitate, chiar dacă produsul nu e strict pentru contact alimentar uman);
   - **verifică pe raport numele laboratorului și numărul raportului, și caută-le pe site-ul laboratorului** (SGS, Intertek, TÜV, BV au pagini de verificare).
4. **Produse care cer certificare dedicată — evită-le până nu ai documente:**
   - dispozitive antiderapante (EIP);
   - orice cu baterii (clopoțeii cu LED);
   - jucării;
   - orice cu fir de 230 V.
5. **Proprietate intelectuală:** fără logo-uri și branduri pe produse (de ex. șnururi „Apple/Karl Lagerfeld”). Verificare EUIPO/DesignView pentru designuri cunoscute (rola de tip ChomChom).
6. **Afirmații:**
   - fără „antistres”, „recomandat de veterinari”, „biodegradabil” fără certificat;
   - fără „protecție” la mănuși sau crampoane fără certificare.
7. **Consumator RO:** retur 14 zile, preț total afișat (inclusiv livrarea), date firmă, ANPC/SAL/SOL în subsol.

### 8.2 Riscuri comerciale principale

| Risc | Probabilitate | Cum îl reduci |
|---|---|---|
| Refuz la ramburs | Ridicată în RO | Confirmare telefonică/SMS, reducere la plata cu cardul, livrare la easybox |
| Furnizorul livrează altă calitate decât mostra | Medie | Golden sample sigilat, foto/video înainte de expediere, plată parțială |
| Creșterea taxelor pe colete mici (taxa UE de manipulare, noi reguli la 1.07.2028) | Ridicată pe termen mediu | Treci pe import comercial consolidat de îndată ce un produs dovedește vânzări |
| Copiere de către vânzătorii chinezi de pe eMAG | Ridicată pe produsele câștigătoare | Brand, pachet, conținut. Nu concura pe produsul simplu |
| Dependența de o singură platformă de reclame | Medie | OLX + organic + magazin + eMAG ca al doilea canal |

---

## 9. Strategia de aprovizionare

**AliExpress e potrivit pentru:**
- mostre;
- primele 50–100 de bucăți per produs;
- produse cu cerere încă nedovedită.

Prețul unitar e mai mare, dar riști puțin, plătești TVA-ul la checkout și ai protecția cumpărătorului.

**Alibaba sau furnizor direct e potrivit când:**
- ai vândut ≥100 de unități dintr-un produs în ≤30 de zile cu CPA sub prag; sau
- vrei personalizare (logo pe cutie, culoare, card inclus); sau
- coletul ar trece de 150 €, oricum.

**Cantitate pentru cererea de ofertă (RFQ):**
- covoraș de lins: 300–500 buc;
- componente pentru kitul de crap: 1.000–2.000 buc per componentă (sunt ieftine), cu cutii goale separat;
- perii: 200–300 de seturi.

Cere prețuri pe trepte (MOQ, ×2, ×5).

**Întrebări pentru furnizor:**
1. Ești producător sau comerciant? Adresa fabricii? (Cere video live din fabrică.)
2. Preț pe trepte de cantitate, EXW și DDP România; ce include DDP (TVA? taxă vamală? taxa de 25 lei?).
3. Material exact (silicon platinum sau peroxid; păr de porc real sau sintetic; oțel și finisaj la vârtejuri).
4. Rapoarte de test existente (LFGB/FDA/REACH): nume laborator, număr raport, dată, pentru ACEST model.
5. Poți pune numele meu, adresa și numărul de lot pe ambalaj? Instrucțiuni în română?
6. Timp de producție, timp de transport, Incoterms, cine plătește pentru unitățile defecte (AQL 2,5?).
7. Golden sample: trimiți 2 bucăți din producția de serie, nu din showroom?
8. Termeni de plată (30% avans, 70% după inspecție foto/video sau a unei terțe părți).

**Verificarea mostrelor:**
- **covoraș de lins:** test de miros, 10 cicluri de mașină de spălat vase, ventuza pe faianță 24 h, tragere de margini;
- **kit crap:** test de tracțiune pe vârtejuri și clipsuri (cântar de mână, comparat cu un brand cunoscut), clipsul de siguranță chiar eliberează plumbul la tracțiune;
- **perii:** 20 de treceri pe plastic lucios negru (zgârieturi?), părul care cade după 5 spălări.

**Cum eviți ofertele înșelătoare:**
- un preț cu 40% sub media furnizorilor = altă calitate. Cere aceeași specificație scrisă de la toți;
- plătești doar prin platformă (Trade Assurance / protecția cumpărătorului AliExpress), nu prin transfer direct;
- vânzătorii nou-apăruți cu recenzii foarte multe în puține zile sunt un semnal de alarmă;
- „DDP” fără detalii scrise e un risc de taxe ascunse la livrare.

**Verificarea documentelor de conformitate:**
- numărul raportului se verifică pe site-ul laboratorului;
- raportul trebuie să numească exact modelul sau materialul tău;
- „certificatele CE” emise de firme necunoscute, pentru produse care nu cer CE, sunt un semnal de alarmă, nu o garanție;
- la EIP, certificatul de examinare UE de tip vine de la un organism notificat, verificabil în baza de date NANDO a Comisiei.

**Costul real până în depozitul tău (importul comercial):**

`Cost = preț FOB × cantitate + transport internațional + asigurare + taxă vamală (după cod HS × valoare CIF) + TVA 21% × (CIF + taxă vamală) + comisionar vamal + transport intern + inspecție + ambalaj suplimentar + o marjă de 5–10% pentru curs și neprevăzute`

TVA-ul se recuperează doar dacă ești plătitor de TVA. Pentru coletele mici ≤150 € se adaugă 3 € pe linie tarifară și 25 lei pe colet.

---

## 10. Plan de acțiune pentru primele 30 de zile

| Zile | Acțiuni |
|---|---|
| 1–3 | Confirmi statutul fiscal cu un contabil (neplătitor de TVA, cota micro, EORI). Comanzi mostre: 3 furnizori de covoraș de lins, 3 truse de componente pentru crap, 2 seturi de perii. Cauți furnizorii pe paginile din tabelul 2A și compari prețul în coș. |
| 3–7 | Setup magazin (o pagină de produs pe produs), politici de retur, date GPSR. Scrii analiza de risc pentru cele 3 produse. Pregătești cardurile în română. |
| 7–12 | Mostrele sosesc → teste de calitate (secțiunea 9). Elimini furnizorii care pică. Filmezi 3 videoclipuri pentru fiecare produs care a trecut. |
| 12–14 | Postezi organic (TikTok/Reels/grupuri de pescari și de stăpâni de câini, respectând regulile grupurilor). Publici anunțuri OLX. Măsori. |
| 14–16 | Comanda 1: 50 de covorașe de lins + componente pentru 20 de kituri de crap. Primele reclame: 10–15 €/zi pe covorașul de lins, 3 creative. |
| 16–21 | Ziua 7 a reclamelor: CTR și CPC. Schimbi creativele slabe. Începi un test cu kitul de crap ca idee de cadou (decembrie). |
| 21–25 | Ziua 14: CPA comparat cu CPA maxim. Dacă perii au CTR ≥1,2% la un test mic de 5 zile, comanzi 12 seturi. |
| 25–30 | Ziua 30: contribuție, refuzuri, defecte. Decizia per produs: continui (recomanzi în regim test, ceri RFQ B2B), schimbi oferta sau abandonezi. Pregătești conținutul de Revelion pentru covorașul de lins. |

---

## Concluzie: primul produs pe care l-aș testa

**Covorașul de lins pentru câini/pisici, vândut ca pachet „baie fără stres” de 2 bucăți la 79 lei.**

**De ce:**
- **Prețul de piață verificat lasă loc de marjă.** Concurența vizibilă pe eMAG e la 43,99 lei bucata ([link](https://www.emag.ro/covoras-hranire-lick-mat-pentru-caini-pisic-cu-ventuze-de-aspiratie-silikon-negru-1140570288/pd/D9568KYBM/)) și 45 lei pentru un slow feeder. Costul meu estimat de aterizare e ~14 lei/buc în regim de test și ~8 lei în regim comercial.
- **Risc mic de produs:** e ușor, nu se sparge, nu are mărimi de încălțăminte, nu e electric și nu cere certificare dedicată (doar GPSR).
- **Se demonstrează în 10 secunde, fără explicații.** Asta reduce costul de reclamă — o ipoteză pe care testul o confirmă sau o infirmă.
- **Nu e sezonier**, dar are un vârf natural (artificiile de Revelion) chiar în fereastra de test.

**Ce nu am putut dovedi:**
- volumul de căutări sau de vizualizări (Google Trends/TikTok au fost inaccesibile);
- numărul total de vânzători RO;
- prețul exact din coș la AliExpress pentru 50 de bucăți.

Exact acestea sunt lucrurile pe care le măsoară primele 14 zile.

**Ce rezultat justifică o investiție mai mare:**
- în primele **30 de zile**, **≥40 de comenzi** cu **CPA ≤20 lei** (~50% din maximul de ~39 lei) la pachetul de 2, **refuzuri + retururi ≤8%** și **defecte ≤3%**. Asta înseamnă o contribuție de ~19 lei/comandă după reclamă (scenariul moderat), deci ~750 lei contribuție pe lună dintr-un singur produs, la buget mic;
- dacă ținta e atinsă, următorul pas e un RFQ la 300–500 de bucăți (cost estimat ~8 lei/buc), ambalaj cu marca proprie și eMAG ca al doilea canal;
- dacă după 80 € de reclamă și 3 creative CPA-ul rămâne peste 39 lei, abandonezi produsul la reclame și îl păstrezi doar pentru vânzare organică/OLX.

În paralel, **pregătește kitul de crap**. Are cea mai bună economie din tot raportul (singurul pozitiv la reclamă moderată și cu livrare gratuită), dar sezonul lui mare începe în martie. Cu expertiza pe care o ai deja, e candidatul cel mai probabil să devină brandul pe termen lung.

---

*Fișierul `model/model.py` + `model/products.json` reproduc toate cifrele din secțiunea 5. Schimbă prețurile din coș, costul real de curierat și CPA-ul măsurat, apoi rulează `python3 model.py`.*
