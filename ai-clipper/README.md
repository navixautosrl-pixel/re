# AI Clipper local (Windows 11, procesare pe CPU)

Aplicația transformă un videoclip lung (de pe YouTube sau de pe calculator) în **5–10 clipuri verticale
1080 × 1920**, cu subtitrări sincronizate integrate în video, plus un **CSV** cu timpii, titlurile și
descrierile sugerate.

Totul rulează local, pe procesor:

- fără CUDA și fără placă video dedicată;
- fără API-uri AI plătite;
- videoclipul nu este încărcat pe niciun serviciu extern;
- nimic nu se publică automat pe vreo platformă.

| Componentă | Rol |
|---|---|
| Python + Streamlit | logica aplicației și interfața locală (doar la `127.0.0.1`) |
| yt-dlp | verificarea linkului și importul de pe YouTube (maximum 720p) |
| faster-whisper (`base` sau `small`, `device=cpu`, `compute_type=int8`) | transcriere locală cu marcaje temporale pe cuvinte |
| FFmpeg | extragere audio, decupare, încadrare 9:16, subtitrări, export MP4 |
| OpenCV (opțional) | detectarea feței pentru încadrare |

---

## Avertisment privind drepturile

Folosește aplicația **doar** pentru materiale pe care ai dreptul să le descarci, să le editezi și să le
publici: conținut propriu, licență explicită sau acordul scris al titularului. Aplicația nu ocolește DRM,
restricțiile de vârstă, conținutul privat sau „doar pentru membri” și nici alte măsuri de acces. Dacă
YouTube raportează o astfel de restricție, importul se oprește. Clipurile nu sunt publicate automat.

---

## Varianta simplă: installer `.exe` (recomandat)

`AI-Clipper-Setup.exe` conține tot ce trebuie: Python, bibliotecile, FFmpeg, Deno și modelul Whisper
`base`. Nu trebuie instalat nimic separat și nu e nevoie de drepturi de administrator.

1. Descarcă installerul: pe GitHub, în repo, deschide **Actions → „AI Clipper - build și test Windows”**,
   alege ultima rulare reușită (bifă verde) și descarcă artefactul **AI-Clipper-Setup** (o arhivă `.zip`
   care conține `AI-Clipper-Setup.exe`).
2. Rulează `AI-Clipper-Setup.exe`. Programul nu este semnat digital, așa că Windows poate afișa
   *„Windows a protejat computerul”*. Apasă **Mai multe informații → Rulează oricum**.
3. Pornește **AI Clipper** din meniul Start sau de pe desktop. Se deschide o fereastră neagră (serverul
   local) și apoi browserul. Închiderea ferestrei negre oprește aplicația.

Unde ajung fișierele în varianta instalată:

| Ce | Unde |
|---|---|
| clipuri finale și CSV | `Videoclipuri\AI Clipper\<proiect>\` |
| fișiere intermediare | `%LOCALAPPDATA%\AI-Clipper\workspace\` |
| modelul `small`, dacă îl alegi | `%LOCALAPPDATA%\AI-Clipper\models\` (se descarcă la prima folosire) |

Dezinstalarea se face din *Setări → Aplicații*. Clipurile tale din `Videoclipuri` rămân.

Installerul este construit și testat automat pe un Windows real, la fiecare modificare a codului
(`.github/workflows/ai-clipper-windows.yml`): teste unitare, verificarea programului, flux complet cu
transcriere Whisper reală și pornirea interfeței.

## Varianta din codul sursă (install.bat)

1. Copiază folderul `ai-clipper` pe calculator, de exemplu în `C:\AI-Clipper\`.
   Evită folderele sincronizate cu OneDrive: clipurile și modelele ocupă mult spațiu.
2. Dă dublu-clic pe **`install.bat`**. Scriptul:
   - caută Python 3.10+. Dacă lipsește, îți propune instalarea gratuită a Python 3.13 prin `winget`
     (după instalare, închizi fereastra și rulezi din nou `install.bat`);
   - creează mediul virtual `.venv` și instalează pachetele din `requirements.txt`;
   - verifică dacă motorul de transcriere pornește. Dacă lipsește Microsoft Visual C++ Redistributable,
     îți propune instalarea lui gratuită;
   - caută FFmpeg (în `ffmpeg\bin\` din folderul aplicației, apoi în PATH). Dacă lipsește, îți propune
     instalarea prin `winget` (pachetul gratuit `Gyan.FFmpeg`);
   - îți propune instalarea Deno, un runtime JavaScript gratuit pe care yt-dlp îl folosește pentru YouTube
     (opțional, dar recomandat);
   - îți propune descărcarea modelului Whisper `base` (~145 MB). Dacă refuzi acum, modelul se descarcă la
     prima transcriere;
   - rulează o verificare finală și afișează `[OK]`, `[LIPSA]` sau `[AVERT]` pentru fiecare componentă.

**Dacă nu ai `winget`**, instalează manual:
- Python 3.13 de pe <https://www.python.org/downloads/windows/>. La instalare bifează *„Add python.exe to PATH”*.
- FFmpeg: descarcă *„release essentials”* de pe <https://www.gyan.dev/ffmpeg/builds/> și copiază
  `ffmpeg.exe` și `ffprobe.exe` în `ai-clipper\ffmpeg\bin\`.

Ai nevoie de internet doar pentru instalare, pentru descărcarea modelului (o singură dată) și pentru
importul de pe YouTube. Transcrierea și exportul merg și offline.

## Pornire (varianta din codul sursă)

Dă dublu-clic pe **`run.bat`**. Se afișează verificarea sistemului, apoi browserul se deschide singur la
`http://127.0.0.1:8501` (sau la următorul port liber). **Nu închide fereastra neagră** cât timp folosești
aplicația. Pentru oprire, închide fereastra sau apasă `Ctrl+C` în ea.

Aplicația ascultă doar pe `127.0.0.1`, deci nu este accesibilă din rețea.

---

## Utilizare, pas cu pas

1. **Confirmă drepturile.** Bifează caseta de sub avertisment.
2. **Sursa.** Lipește linkul YouTube și apasă *Verifică linkul*. Aplicația validează linkul (un singur
   videoclip, nu o listă de redare) și citește metadatele **fără să descarce nimic**: titlul, canalul,
   durata, data publicării, vizualizările și miniatura.
   - Videoclipurile de peste **60 de minute**, transmisiunile live și materialele cu DRM sau restricții
     sunt refuzate.
   - Peste **30 de minute** apare un avertisment și trebuie să confirmi explicit.
   - Bifează *Confirm descărcarea…* și apasă *Descarcă videoclipul* (maximum 720p, de preferat H.264).
   - Alternativ, alege *Fișier de pe calculator* și scrie calea completă (de exemplu
     `C:\Users\Nume\Videos\interviu.mp4`). Fișierul este copiat în spațiul de lucru.
3. **Transcriere locală.** Apasă *Extrage audio și transcrie*. Bara de progres arată poziția curentă și
   ultima frază recunoscută. Rezultatul poate fi citit sau descărcat ca `.txt`.
4. **Momente candidate.** Apasă *Găsește momentele*. Apare un tabel în care poți debifa momente și
   edita titlurile. Explicația scorurilor este în *De ce au fost alese aceste momente?*.
5. **Clipuri.** Apasă *Generează N clipuri*. Fiecare clip apare cu previzualizare, rezultatul verificării
   (rezoluție, durată, dimensiune), modul de încadrare folosit, descrierea sugerată și butoane de
   descărcare MP4 și SRT. Mai sus găsești *Descarcă CSV* și *Deschide folderul cu clipuri*.
6. **Confirmă exportul.** După ce ai verificat clipurile, poți șterge fișierele intermediare (video sursă,
   audio). Clipurile, CSV-ul și transcrierea rămân.

### Setări (bara din stânga)

| Setare | Implicit | Explicație |
|---|---|---|
| Model Whisper | `base` | `small` este mai precis, mai ales la română, dar cam de 2–3 ori mai lent și mai mare (~480 MB) |
| Limba vorbită | Română | se poate alege și detectare automată sau engleză |
| Durata clipurilor | 20–45 s | orice interval între 15 și 60 de secunde |
| Număr maxim de clipuri | 8 | între 5 și 10 |
| Încadrare | Automat | față detectată, cu rezervă pe fundal blurat; poți alege și fundal blurat sau decupaj centrat |
| Integrează subtitrările | da | fișierele `.srt` se creează oricum |

---

## Cum funcționează, concret

### Alegerea momentelor (fără AI plătit, fără model de limbaj)

Transcrierea are marcaje temporale pentru fiecare cuvânt. Aplicația:

1. împarte textul în propoziții, după punctuația finală (`.`, `?`, `!`) sau după pauzele mai lungi de 1,2 s;
2. construiește toate ferestrele formate din **propoziții întregi** care se încadrează în durata aleasă.
   Marginile cad în pauza dintre propoziții, cu puțin „aer”, dar fără să intre în cuvintele vecine;
3. acordă fiecărei ferestre un scor din:
   - **densitatea informației**: cuvinte cu conținut pe secundă și diversitate lexicală;
   - **completitudine**: începe la început de propoziție, nu cu „și”, „dar” sau „deci”, și se termină cu
     punctuație finală;
   - **pauzele** de la margini;
   - **acoperirea cu vorbire**, adică fără tăceri lungi în interior;
   - **încrederea** transcrierii;
   - **penalizări** pentru ezitări de tipul „ăă”;
4. alege cele mai bune ferestre care **nu se suprapun** și **nu se repetă ca vocabular**.

Dacă materialul nu permite 5 momente distincte, aplicația îți spune câte a găsit, în loc să taie
propoziții sau să umple cu fragmente slabe.

Scorul nu „înțelege” cât de interesant este un subiect. Este o euristică transparentă, iar tabelul îți
permite să alegi tu momentele finale.

### Titluri și descrieri

Titlurile și descrierile sunt **extrase din replicile reale** ale clipului:

- titlul este cea mai informativă propoziție, fără conectorul de la început;
- descrierea este un fragment citat din transcriere, plus sursa și intervalul;
- cuvintele-cheie sunt cele mai frecvente cuvinte cu conținut din clip.

Nimic nu este inventat sau „înfrumusețat”. Verifică totuși textele înainte de publicare: transcrierea
automată poate greși cuvinte.

### Subtitrări

Subtitrările sunt **în limba vorbită**, exact cum au fost transcrise, fără traducere și fără rescriere.
Pentru subtitrări în română, videoclipul trebuie să fie vorbit în română. Diacriticele cu sedilă (ş, ţ)
sunt corectate automat în forma corectă (ș, ț). Subtitrările apar în bucăți scurte, de cel mult ~24 de
caractere, sincronizate pe cuvinte și poziționate deasupra zonei ocupate de interfața aplicațiilor de
clipuri.

### Încadrarea verticală

Ce face modul **Automat**, exact:

1. citește 24 de cadre din intervalul clipului;
2. detectează fețe frontale cu clasificatorul Haar inclus în OpenCV;
3. dacă fața apare în cel puțin jumătate din cadre și nu se mută mult, clipul este decupat 9:16 **fix**,
   centrat pe poziția mediană a feței;
4. altfel (nicio față, mai multe persoane depărtate, mișcare mare) folosește **fundal blurat**: tot cadrul
   original rămâne vizibil, peste o versiune mărită și blurată a lui.

Limite: **nu este urmărire continuă** a persoanei cadru cu cadru. Dacă vorbitorul se plimbă prin cadru,
aplicația alege fundalul blurat în loc să riște un decupaj greșit. Detectorul Haar găsește fețe frontale,
nu din profil. Modul ales pentru fiecare clip și motivul apar sub previzualizare și în CSV.

### Verificarea exportului

După fiecare clip, `ffprobe` verifică:

- rezoluția 1080 × 1920;
- prezența fluxurilor video și audio;
- durata (toleranță ±0,5 s față de intervalul ales).

Rezultatul apare în interfață și în coloana `verificare` din CSV.

### Fișierele generate

```
ai-clipper\
  workspace\<proiect>\   fișiere intermediare: source.mp4, audio_16k.wav, transcript.json,
                         moments.json, state.json (starea etapelor, pentru reluare)
  export\<proiect>\      clip_01.mp4, clip_01.srt, ..., clipuri.csv
  models\                modelele Whisper descărcate
```

`clipuri.csv` folosește separatorul `;` și codificarea UTF-8 cu BOM, ca să se deschidă corect, cu
diacritice, în Excel cu setări românești. Coloane: `nr`, `fisier`, `start`, `sfarsit`, `durata_sec`,
`titlu_sugerat`, `descriere_sugerata`, `cuvinte_cheie`, `scor`, `incadrare`, `verificare`,
`text_transcris`, `sursa`, `url_sursa`.

### Reluarea după o eroare

- Fiecare etapă își salvează rezultatul pe disc. Dacă apare o eroare, mesajul rămâne afișat la etapa
  respectivă, iar fișierele intermediare sunt păstrate.
- Apasă din nou butonul etapei pentru reluare.
- **Transcrierea** se salvează segment cu segment. După o întrerupere (eroare, aplicație închisă, PC
  repornit), continuă de la ultimul segment salvat, dacă modelul și limba sunt aceleași.
- **Descărcarea** de pe YouTube continuă fișierul parțial.
- La **export**, clipurile deja verificate nu se refac. Se generează doar cele lipsă sau modificate.
- Proiectele anterioare se redeschid din bara laterală, la *Proiecte salvate*.

### Folosire fără internet (model copiat manual)

Dacă modelul nu se poate descărca automat, copiază fișierele modelului (`model.bin`, `config.json`,
`tokenizer.json`, `vocabulary.txt`) de pe <https://huggingface.co/Systran/faster-whisper-base> în
`ai-clipper\models\faster-whisper-base\`. Pentru modelul `small`, folosește
<https://huggingface.co/Systran/faster-whisper-small> și folderul `models\faster-whisper-small\`.

---

## Probleme frecvente

| Mesaj | Ce faci |
|---|---|
| `FFmpeg nu a fost găsit` | Rulează `install.bat` sau pune `ffmpeg.exe` și `ffprobe.exe` în `ffmpeg\bin\`. După o instalare prin winget, închide și redeschide `run.bat`. |
| `Nu există conexiune la YouTube` | Verifică internetul, firewall-ul sau proxy-ul. |
| `YouTube cere confirmarea că nu ești robot` | Încearcă mai târziu. Actualizează yt-dlp rulând din nou `install.bat`. |
| `restricție de vârstă`, `privat`, `doar pentru membri`, `DRM` | Aplicația nu ocolește aceste restricții, intenționat. |
| `Modelul Whisper … nu a putut fi încărcat` | Verifică internetul la prima rulare sau copiază modelul manual (vezi mai sus). |
| `DLL load failed` la transcriere | Instalează Microsoft Visual C++ Redistributable: <https://aka.ms/vs/17/release/vc_redist.x64.exe>. |
| `Nu a fost detectată vorbire` | Videoclipul nu are vorbire clară. Clipurile se bazează pe transcriere. |
| Transcrierea pare greșită | Alege modelul `small` și limba corectă, apoi apasă *Refă transcrierea*. |
| Previzualizarea nu pornește în browser | Folosește Edge sau Chrome. Clipurile sunt MP4 H.264/AAC, formatul acceptat de platformele de clipuri. |

## Teste (pentru dezvoltatori)

```
.venv\Scripts\python -m pip install pytest
.venv\Scripts\python -m pytest tests -q
.venv\Scripts\python tests\make_test_media.py test_media
.venv\Scripts\python tests\e2e.py test_media\test_face.mp4 --model base --language ro
```

`make_test_media.py` generează un videoclip de test autorizat, creat integral local:

- vorbire sintetică prin filtrul `flite` din FFmpeg (doar în build-urile FFmpeg care îl includ, de
  exemplu cele de pe Linux);
- fotografia NASA a astronautei Eileen Collins, aflată în domeniul public și inclusă în scikit-image
  (`pip install scikit-image`).

`e2e.py` rulează tot fluxul fără interfață. Opțiunea `--ground-truth` înlocuiește transcrierea Whisper
cu o transcriere de referință și este afișată explicit în raport.

## Stadiul testării

Testat în mediul de dezvoltare (Linux, Python 3.13, FFmpeg 6.1, 4 nuclee CPU, fără GPU):

- **18 teste unitare trec**: validarea linkurilor YouTube, limitele de durată/live/DRM, mesajele de
  eroare yt-dlp, selecția momentelor (fără suprapuneri, propoziții întregi, durate în interval),
  subtitrările, diacriticele, **reluarea transcrierii după o întrerupere simulată**;
- **flux complet pe videoclipuri de test autorizate** de 2:32: import local, extragere audio, selecția
  momentelor, export 1080 × 1920 cu subtitrări, verificare ffprobe, CSV;
- **încadrare pe față verificată**: fața a fost detectată în 24/24 cadre, iar decupajul a fost centrat
  la x≈808–829 px față de poziția reală ≈815 px;
- **rezerva cu fundal blurat**, pe un videoclip fără fețe (0/24 cadre);
- reluarea exportului (se refac doar clipurile lipsă) și confirmarea exportului;
- interfața Streamlit într-un browser real (Chromium, Playwright): link invalid, eroare de rețea,
  import, generarea clipurilor, butoanele de descărcare, layout pe mobil fără depășire orizontală.

Testat pe **Windows (GitHub Actions, `windows-latest`)**, cu programul `AI-Clipper.exe` împachetat, la
fiecare modificare a codului:

- testele unitare trec și pe Windows;
- verificarea sistemului din `.exe` găsește FFmpeg, Deno și modelul incluse;
- **flux complet cu transcriere faster-whisper reală** (model `base`, CPU, int8) pe un videoclip de 2:19
  cu voce sintetică Windows în engleză: 27 de segmente transcrise în 9,7 s pe runner-ul GitHub,
  6 momente, 6 clipuri 1080 × 1920 verificate, CSV. Transcrierea a avut o greșeală reală („Bear walls”
  în loc de „Bare walls”), deci verifică textele înainte de publicare;
- interfața pornește din `.exe` și răspunde la `127.0.0.1:8501`;
- installerul `AI-Clipper-Setup.exe` (~350 MB) se construiește cu Inno Setup.

Testul pe Windows a găsit un bug pe care mediul de dezvoltare nu îl putea găsi: faster-whisper 1.2.1
este incompatibil cu PyAV 17+ la decodarea audio. Bugul a fost corectat: aplicația citește direct
fișierul WAV extras cu FFmpeg.

**Ce rămâne netestat:**

- **descărcarea de pe YouTube**: din mediul de dezvoltare, YouTube era blocat; de pe serverele GitHub,
  YouTube a cerut confirmarea „nu ești robot”, cum face des cu adresele IP din centre de date. Pe o
  conexiune de acasă, de obicei nu se întâmplă, dar nu am putut verifica;
- **transcrierea în limba română** cu Whisper real: vocea sintetică de pe Windows e doar în engleză. Pentru
  română, modelul `small` este de obicei vizibil mai precis decât `base`;
- **instalarea efectivă** a `AI-Clipper-Setup.exe` printr-un dublu-clic pe un PC Windows 11 obișnuit și
  scripturile `install.bat`/`run.bat` (varianta din codul sursă).

**Primul test pe calculatorul tău**: un videoclip propriu, scurt (2–5 minute), vorbit în română, cu
modelul `base`, apoi același videoclip cu `small`, ca să compari.
