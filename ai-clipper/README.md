# AI Clipper local (Windows 11, procesare pe CPU)

Aplicația transformă un videoclip lung (de pe YouTube sau de pe calculator) în **5–10 clipuri scurte**
(vertical 1080 × 1920, portret 4:5 sau pătrat), cu subtitrări sincronizate integrate în video, copertă
și un **CSV** cu timpii, titlurile și descrierile sugerate.

Ce poți face în aplicație:

- **încarci** un fișier trăgându-l în fereastră sau imporți un link YouTube;
- **transcrii** local, cu progres, timp estimat și buton de anulare. Poți închide fereastra; lucrarea continuă;
- **primești automat momentele** potrivite pentru clipuri (propoziții întregi, fără suprapuneri), apoi:
  - editezi titlurile;
  - extinzi sau scurtezi fiecare clip cu câte o propoziție;
  - adaugi clipuri alese manual din transcriere;
  - **corectezi textul subtitrărilor** acolo unde transcrierea a greșit;
- **alegi stilul subtitrărilor**, cu previzualizare imediată:
  - clasic, galben cu majuscule, pe fundal închis sau **karaoke** (cuvântul rostit colorat);
  - 3 poziții și 3 mărimi;
- **elimini pauzele lungi** din clipuri: video, audio și subtitrări rămân sincronizate;
- **normalizezi volumul** la nivelul platformelor (-14 LUFS);
- **exporți și verifici** fiecare clip automat:
  - descarci MP4, SRT, copertă sau totul ca **ZIP**;
  - copiezi titlul și descrierea cu un clic;
  - refaci un singur clip; la reexport se refac doar clipurile modificate.

Totul rulează local, pe procesor:

- fără CUDA și fără placă video dedicată;
- fără API-uri AI plătite;
- videoclipul nu este încărcat pe niciun serviciu extern;
- nimic nu se publică automat pe vreo platformă.

| Componentă | Rol |
|---|---|
| Python + FastAPI | logica aplicației și serverul local al interfeței (doar la `127.0.0.1`) |
| HTML/CSS/JavaScript | interfața, deschisă ca fereastră de aplicație Edge; funcționează offline |
| yt-dlp | verificarea linkului și importul de pe YouTube (maximum 720p) |
| faster-whisper (`base` sau `small`, `device=cpu`, `compute_type=int8`) | transcriere locală cu marcaje temporale pe cuvinte |
| FFmpeg | extragere audio, decupare, încadrare, subtitrări, eliminarea pauzelor, normalizare, export MP4 |
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
3. Pornește **AI Clipper** din meniul Start sau de pe desktop. Se deschide fereastra aplicației: o
   fereastră Edge fără bară de adrese, sau browserul implicit, dacă Edge lipsește. Aplicația se oprește
   singură la scurt timp după ce închizi fereastra, dacă nu rulează nicio lucrare. Repornirea ei redeschide
   aceeași sesiune, inclusiv o lucrare care încă rulează.

Unde ajung fișierele în varianta instalată:

| Ce | Unde |
|---|---|
| clipuri finale și CSV | `Videoclipuri\AI Clipper\<proiect>\` |
| fișiere intermediare | `%LOCALAPPDATA%\AI-Clipper\workspace\` |
| modelul `small`, dacă îl alegi | `%LOCALAPPDATA%\AI-Clipper\models\` (se descarcă la prima folosire) |

Dezinstalarea se face din *Setări → Aplicații*. Clipurile tale din `Videoclipuri` rămân.

Installerul este construit și testat automat pe un Windows real, la fiecare modificare a codului
(`.github/workflows/ai-clipper-windows.yml`): teste unitare și de API, verificarea programului, flux
complet cu transcriere Whisper reală și un robot care folosește toată interfața în Edge.

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

Dă dublu-clic pe **`run.bat`**. Se afișează verificarea sistemului, apoi se deschide fereastra aplicației.
Serverul local ascultă doar pe `127.0.0.1`, deci nu este accesibil din rețea. Fiecare modificare cere un
cod generat la pornire, deci nici alte site-uri deschise în browser nu pot comanda aplicația.

---

## Utilizare, pas cu pas

Bara din stânga listează proiectele, cu starea fiecăruia. În partea de sus a unui proiect sunt cei
4 pași, pe care poți naviga oricând înapoi.

1. **Proiect nou.** Bifează confirmarea privind drepturile, apoi:
   - **trage un videoclip** în zona punctată (sau apasă pe ea ca să-l alegi). Formatele acceptate sunt
     MP4, MOV, MKV, AVI, WMV și altele, cu durata de maximum 60 de minute; sau
   - **lipește un link YouTube** și apasă *Verifică*. Vezi titlul, canalul, durata și miniatura **fără
     să se descarce nimic**:
     - linkurile spre liste de redare, transmisiunile live, materialele de peste 60 de minute și cele
       cu DRM sau restricții sunt refuzate;
     - peste 30 de minute trebuie să confirmi explicit;
     - apoi *Descarcă și creează proiectul* (maximum 720p).
2. **Transcriere.** Alege modelul (`base`, rapid, sau `small`, mai precis) și limba, apoi *Pornește
   transcrierea*. Cardul de progres arată ultima frază recunoscută, timpul scurs și timpul rămas, cu
   buton *Anulează*. La final poți căuta în transcriere și o poți descărca ca `.txt`.
3. **Momente.** Se aleg automat după transcriere, cu ultimele setări de durată (implicit 20–45 s,
   8 clipuri). Pentru fiecare clip poți:
   - edita titlul: se salvează la Enter sau când părăsești câmpul;
   - **Început/Sfârșit +/−**: adaugi sau scoți câte o propoziție întreagă;
   - **Subtitrări**: corectezi textul fiecărei subtitrări, cu timpii păstrați;
   - debifa **În export**, sau șterge clipul;
   - **Clip manual**: apeși pe prima și pe ultima propoziție din transcriere.
4. **Export.** Alegi formatul, încadrarea, stilul, poziția și mărimea subtitrărilor. Previzualizarea arată
   aproximativ rezultatul. Mai alegi normalizarea volumului, eliminarea pauzelor și coperta, apoi
   *Exportă*. Fiecare clip apare cu:
   - player și rezultatul verificării (rezoluție, durată, dimensiune, pauzele scoase);
   - modul de încadrare folosit;
   - butoanele *MP4*, *SRT*, *Copertă*, *Titlu* și *Descriere* (copiere), *Refă*.

   Deasupra găsești *Descarcă tot (ZIP)*, *CSV*, *Deschide folderul* și *Confirmă exportul*. Confirmarea
   șterge videoclipul sursă și audio-ul; clipurile rămân.

Dacă modifici ceva după export (un interval, o subtitrare), clipul apare marcat „modificat după export”.
*Actualizează exportul* reface doar clipurile modificate sau cele cu setări schimbate.

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

Subtitrările sunt **în limba vorbită**, exact cum au fost transcrise, fără traducere. Singurele
modificări de text sunt cele pe care le faci tu în editor. Pentru subtitrări în română, videoclipul
trebuie să fie vorbit în română. Diacriticele cu sedilă (ş, ţ) sunt corectate automat în forma corectă
(ș, ț). Subtitrările apar în bucăți scurte, de cel mult ~24 de caractere, sincronizate pe cuvinte.
Poziția *Jos* le pune deasupra zonei ocupate de butoanele aplicațiilor de clipuri.

- **Karaoke** colorează în galben cuvântul rostit, folosind timpii reali ai fiecărui cuvânt din transcriere.
  Dacă ai corectat textul unei subtitrări, timpii cuvintelor din ea se împart proporțional cu lungimea lor.
- **Eliminarea pauzelor** scurtează orice tăcere de peste 0,6 s dintre cuvinte la ~0,25 s. Aceleași
  intervale se taie din video și din audio, iar subtitrările sunt recalculate pe noua axă de timp.
  Cuvintele nu sunt tăiate niciodată.

### Încadrarea

Ce face modul **Automat**, exact:

1. citește 24 de cadre din intervalul clipului;
2. detectează fețe frontale cu clasificatorul Haar inclus în OpenCV;
3. dacă fața apare în cel puțin jumătate din cadre și nu se mută mult, clipul este decupat în formatul ales
   (9:16, 4:5 sau 1:1), **fix**,
   centrat pe poziția mediană a feței;
4. altfel (nicio față, mai multe persoane depărtate, mișcare mare) folosește **fundal blurat**: tot cadrul
   original rămâne vizibil, peste o versiune mărită și blurată a lui.

Limite: **nu este urmărire continuă** a persoanei cadru cu cadru. Dacă vorbitorul se plimbă prin cadru,
aplicația alege fundalul blurat în loc să riște un decupaj greșit. Detectorul Haar găsește fețe frontale,
nu din profil. Modul ales pentru fiecare clip și motivul apar sub previzualizare și în CSV.

### Verificarea exportului

După fiecare clip, `ffprobe` verifică:

- rezoluția formatului ales (1080 × 1920, 1080 × 1350 sau 1080 × 1080);
- prezența fluxurilor video și audio;
- durata (toleranță ±0,5 s față de intervalul ales, minus pauzele eliminate);
- existența copertei, dacă ai cerut-o.

Rezultatul apare în interfață și în coloana `verificare` din CSV.

### Fișierele generate

În varianta instalată, clipurile sunt în `Videoclipuri\AI Clipper\<proiect>\`, iar restul în
`%LOCALAPPDATA%\AI-Clipper\`. În varianta din codul sursă, totul este în folderul aplicației:

```
workspace\<proiect>\   fișiere intermediare: source.mp4, audio_16k.wav, transcript.json,
                       moments.json (cu subtitrările editate), state.json, thumbs\
export\<proiect>\      clip_01.mp4, clip_01.srt, clip_01.jpg (copertă), ..., clipuri.csv
models\                modelele Whisper descărcate
logs\app.log           jurnalul aplicației (util când raportezi o problemă)
```

`clipuri.csv` folosește separatorul `;` și codificarea UTF-8 cu BOM, ca să se deschidă corect, cu
diacritice, în Excel cu setări românești. Coloane: `nr`, `fisier`, `coperta`, `format`, `start`, `sfarsit`,
`durata_sec`, `pauze_eliminate_sec`, `titlu_sugerat`, `descriere_sugerata`, `cuvinte_cheie`, `scor`,
`incadrare`, `verificare`, `text_transcris` (cu corecturile tale), `sursa`, `url_sursa`.

### Reluarea după o eroare

- Fiecare etapă își salvează rezultatul pe disc. Dacă apare o eroare sau anulezi, mesajul rămâne afișat
  la etapa respectivă, iar fișierele intermediare sunt păstrate.
- Apasă din nou butonul etapei pentru reluare (la un import neterminat: *Reia importul*).
- **Transcrierea** se salvează segment cu segment. După o întrerupere (eroare, aplicație închisă, PC
  repornit), continuă de la ultimul segment salvat, dacă modelul și limba sunt aceleași.
- **Descărcarea** de pe YouTube continuă fișierul parțial.
- La **export**, clipurile deja verificate nu se refac. Se generează doar cele lipsă sau modificate.
- Proiectele anterioare se redeschid din bara laterală. Pot fi șterse din antetul proiectului, cu sau fără
  clipurile exportate.

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
| Previzualizarea nu pornește | Aplicația se deschide în Edge, care redă MP4 H.264/AAC (formatul platformelor de clipuri). Dacă s-a deschis alt browser fără H.264, folosește Edge sau Chrome. |
| Fereastra nu s-a deschis | Deschide `http://127.0.0.1:8501` (sau portul afișat). Jurnalul este în `%LOCALAPPDATA%\AI-Clipper\logs\app.log`. |

## Teste (pentru dezvoltatori)

```
.venv\Scripts\python -m pip install pytest httpx playwright
.venv\Scripts\python -m pytest tests -q
.venv\Scripts\python tests\make_test_media.py test_media
.venv\Scripts\python tests\e2e.py test_media\test_face.mp4 --model base --language ro
.venv\Scripts\python launcher.py --no-browser --port 8600
.venv\Scripts\python tests\ui_flow.py --url http://127.0.0.1:8600 --video video.mp4 --channel msedge
```

- `tests/test_units.py`: selecția momentelor, subtitrările, editarea, eliminarea pauzelor, setările,
  reluarea transcrierii;
- `tests/test_api.py`: serverul real, prin HTTP: securitate (Host, token), încărcare, tot fluxul,
  editări, export cu karaoke și pauze eliminate, ZIP, anulare și reluare, ștergere;
- `tests/ui_flow.py`: un robot Playwright care folosește interfața cap-coadă, ca un utilizator.

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
