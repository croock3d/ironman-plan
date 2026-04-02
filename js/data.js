// ============================================================
// DEFAULT DATA
// ============================================================
const DEFAULT_DATA = {
  title: "Ironman 15.08.2026",
  subtitle: "3 dni/tyg · Zaawansowany · FAI mieszany lewe biodro + hipermobilność · v6",
  weekBar: [
    { day:"PN", label:"Dzień A — pośladki", gym:true },
    { day:"WT", label:"rower progowy", gym:false },
    { day:"ŚR", label:"Dzień B — góra", gym:true },
    { day:"CZ", label:"pływanie + bieg", gym:false },
    { day:"PT", label:"Dzień C — kontrola", gym:true },
    { day:"SB", label:"rower długi + bieg", gym:false },
    { day:"ND", label:"bieg długi", gym:false }
  ],
  warmups: {
    nogi: {
      title: "Rozgrzewka — nogi (10 min)",
      items: [
        { text: "Hip CARs lewe biodro — 5 okrążeń w każdą stronę", link: "" },
        { text: "90/90 stretch z aktywną rotacją wewnętrzną lewą — 2×45 sek.", link: "" },
        { text: "Clamshell lewy z gumą — 2×20", link: "" },
        { text: "Single-leg glute bridge lewy — 2×15", link: "" },
        { text: "Monster walk z gumą — 2×12m w każdą stronę", link: "" }
      ],
      note: "Lewa strona zawsze pierwsza. Jeśli biodro klika przy CARs — skróć zakres."
    },
    gora: {
      title: "Rozgrzewka — góra (5–7 min)",
      items: [
        { text: "Rotacje ramion przód/tył — 2×15", link: "" },
        { text: "Band pull-apart — 2×20", link: "" },
        { text: "Face pull z gumą — 2×15", link: "" },
        { text: "Podciąganie z gumą asekurującą — 2×5", link: "" }
      ],
      note: "Środa: siłownia ODDZIELNIE od roweru. Przerwa min. 4–5h."
    }
  },
  phases: [
    {
      label: "Faza 1 — Baza (kwiecień–maj)",
      desc: "<strong>Cel:</strong> Siła pośladków, łańcucha tylnego, stabilizacja bioder pod FAI. 4–8 powt. główne, 10–15 uzupełniające. Tempo ekscentryczne 3–4 sek. Odpoczynek 90–120 sek.",
      days: [
        {
          label: "Dzień A — poniedziałek", focus: "Pośladki wielki + łańcuch tylny — siła",
          warmup: "nogi",
          note: "<em>Priorytet:</em> Łańcuch tylny + pośladek wielki. Lewa noga zawsze pierwsza.",
          warn: null,
          changes: "v6: usunięto wspięcia na łydki. Dodano side-lying hip abduction z hantlem.",
          exercises: [
            { name:"Single-leg RDL ze sztangielką", sets:"4×6/nogę", tempo:"4-1-1-0", note:"Lewa noga pierwsza. Zakres bez bólu biodra.", prog:"Start: 12–14kg. Co 2 tyg. +2kg gdy 6 powt. czysto.", why:"łańcuch tylny w warunkach biegowych", tag:"key", link:"" },
            { name:"Hip thrust ze sztangą", sets:"4×8", tempo:"3-1-2-0", note:"Guma nad kolanami. 3s opuszczasz, 1s pauza, 2s wciskasz.", prog:"Start: 40kg. Co 1–2 tyg. +5kg.", why:"siła pośladka wielkiego", tag:"key", link:"" },
            { name:"Wykroty na skrzynię", sets:"3×8/nogę", tempo:"3-0-1-0", note:"Skrzynia 30–40cm. Lewa noga pierwsza.", prog:"Start: 16kg/hantel. Co 2 tyg. +2kg.", why:"wzorzec biegowy, bezpieczny zakres biodra", tag:"fai", link:"" },
            { name:"Nordics (ekscentryczny)", sets:"3×5", tempo:"4-0-0-0", note:"4 sek. opuszczanie. Kluczowe dla km 35+.", prog:"Start: tylko ekscentryczna. Co 2 tyg. +1 powt. do 8.", why:"wytrzymałość dwugłowych na maraton", tag:"key", link:"" },
            { name:"Side-lying hip abduction z hantlem", sets:"3×12/stronę", tempo:"2-1-2-0", note:"Lewa strona pierwsza + dodatkowa seria.", prog:"Start: 4–6kg. Co 2 tyg. +2kg.", why:"progresywna siła pośladka średniego", tag:"key", link:"" },
            { name:"Copenhagen plank", sets:"3×20 sek./stronę", tempo:"statyczny", note:"Noga oparta na ławce.", prog:"Start: 20 sek. Co 2 tyg. +5 sek. do 40 sek.", why:"przywodziciele + stabilizacja biodra", tag:"fai", link:"" },
            { name:"Pallof press stojąc", sets:"3×10/stronę", tempo:"2-2-1-0", note:"", prog:"Start: 10kg. Co 2 tyg. +2,5kg.", why:"stabilizacja rotacyjna", tag:"core", link:"" }
          ]
        },
        {
          label: "Dzień B — środa", focus: "Góra — siła ciągnąca / pchająca / barki",
          warmup: "gora",
          note: "<em>Priorytet: ciągnięcie > pchanie (2:1).</em> Barki i rotatory kluczowe dla pływania.",
          warn: "Środa: siłownia ODDZIELNIE od roweru. Przerwa minimum 4–5 godzin.",
          changes: null,
          exercises: [
            { name:"Podciąganie na drążku", sets:"4×6–8", tempo:"3-0-1-0", note:"Gdy 8 powt. czysto → +2,5kg pasy.", prog:"Start: masa własna. Co 2 tyg. +2,5kg.", why:"siła ciągnąca do pływania", tag:"key", link:"" },
            { name:"Wiosłowanie sztangą", sets:"4×6–8", tempo:"3-1-1-0", note:"Plecy neutralne.", prog:"Start: 60kg. Co 2 tyg. +2,5–5kg.", why:"pełna siła grzbietu", tag:"", link:"" },
            { name:"Wyciskanie sztangi płasko", sets:"3×6", tempo:"3-0-1-0", note:"", prog:"Start: 72,5kg. Co 2 tyg. +2,5kg.", why:"siła pchająca / balans", tag:"", link:"" },
            { name:"OHP (wyciskanie żołnierskie)", sets:"3×6", tempo:"3-0-1-0", note:"", prog:"Start: 45kg. Co 2 tyg. +2,5kg.", why:"stabilizacja barku dla pływania", tag:"", link:"" },
            { name:"Face pull na wyciągu", sets:"3×15", tempo:"2-1-1-0", note:"Wyciąg góra, łokcie wysoko.", prog:"Start: 12,5kg. Do 20 powt., potem +2,5kg.", why:"rotatory zewnętrzne, prewencja barku", tag:"fai", link:"" },
            { name:"Wspięcia na łydki 1 noga", sets:"3×15/nogę", tempo:"3-0-1-1", note:"Jedyna sesja z łydkami.", prog:"Start: 16kg. Co 2 tyg. +2kg.", why:"podtrzymanie łydek", tag:"", link:"" }
          ]
        },
        {
          label: "Dzień C — piątek (rano)", focus: "Pośladek średni + kontrola biodra — lekki",
          warmup: "nogi",
          note: "<em>Sesja rano.</em> Skupienie na pośladku średnim — słabe ogniwo przy FAI. Mniejsze ciężary, większa precyzja.",
          warn: null,
          changes: "v6: dodano wall-supported hip abduction — czysta izolacja pośladka średniego.",
          exercises: [
            { name:"BSS izometryczny", sets:"3×30 sek./nogę", tempo:"statyczny", note:"Dolna pozycja BSS bez ruchu. Lewa noga pierwsza.", prog:"Start: masa własna. Co 2 tyg. +5 sek. lub +5kg.", why:"kontrola biodra bez dużego zakresu zgięcia", tag:"fai", link:"" },
            { name:"Step-down", sets:"3×8/nogę", tempo:"4-0-0-0", note:"Skrzynia 20–30cm. Kolano nie zawija się.", prog:"Start: masa własna. Co 2 tyg. +2kg.", why:"ekscentryczna kontrola VMO", tag:"new", link:"" },
            { name:"Hip airplane", sets:"3×6/nogę", tempo:"3-2-2-0", note:"Stoisz na jednej nodze, rotacja tułowia.", prog:"Progresja przez jakość, nie ciężar.", why:"stabilizacja bioder w rotacji", tag:"new", link:"" },
            { name:"Wall-supported hip abduction", sets:"3×15/stronę", tempo:"2-1-2-0", note:"Lewa strona pierwsza + dodatkowa seria.", prog:"Start: masa własna. Co 2 tyg. guma lub hantel.", why:"czysta izolacja pośladka średniego stojąco", tag:"key", link:"" },
            { name:"Lateral band walk", sets:"3×15 kroków/stronę", tempo:"kontrolowane", note:"Guma nad kolanami, biodra lekko ugięte.", prog:"Start: lekka guma. Co 2 tyg. mocniejsza.", why:"pośladek średni w ruchu", tag:"new", link:"" },
            { name:"Single-leg bridge podwyższona", sets:"3×12/nogę", tempo:"2-1-2-0", note:"Pięta na ławce. Lewa noga pierwsza.", prog:"Start: masa własna. Co 2 tyg. +5kg.", why:"izolacja pośladka w łańcuchu zamkniętym", tag:"fai", link:"" },
            { name:"Leg curl leżąco", sets:"3×12", tempo:"3-1-1-0", note:"Leżąco = lepsza izolacja.", prog:"Start: 22,5kg. Co 2 tyg. +2,5kg.", why:"dwugłowe", tag:"", link:"" }
          ]
        }
      ]
    },
    {
      label: "Faza 2 — Wytrzymałość (czerwiec–lipiec)",
      desc: "<strong>Cel:</strong> Wytrzymałość pośladka średniego i łańcucha tylnego pod Ironmana. 15–25 powt., przerwy 30–60 sek.",
      days: [
        {
          label: "Dzień A — poniedziałek", focus: "Pośladki + łańcuch tylny — wytrzymałość",
          warmup: "nogi",
          note: "<em>Priorytet posterior chain.</em> Superserie, minimalne przerwy. Lewa noga zawsze pierwsza.",
          warn: null,
          changes: "v6: zastąpiono banded clamshell z progresją.",
          exercises: [
            { name:"Hip thrust ze sztangą — wysoka obj.", sets:"4×20", tempo:"2-1-1-0", note:"Przerwa 45 sek.", prog:"Start: 25–30kg. Co 2 tyg. +5kg.", why:"wytrzymałość pośladka wielkiego", tag:"key", link:"" },
            { name:"Single-leg RDL superseria z BSS 2×10", sets:"3×12/nogę + 2×10/nogę", tempo:"2-0-1-0", note:"BSS zaraz po RDL. Lewa noga pierwsza.", prog:"RDL: start 10kg. BSS: start 12kg. Co 2 tyg. +2kg.", why:"zmęczenie łańcucha tylnego", tag:"key", link:"" },
            { name:"Nordics — wydłużona ekscentryczna", sets:"3×8", tempo:"5-0-0-0", note:"5 sek. opuszczanie.", prog:"Co 2 tyg. +1 powt. do 10.", why:"wytrzymałość dwugłowych na km 30–42", tag:"key", link:"" },
            { name:"Banded clamshell z obciążeniem", sets:"4×20/stronę", tempo:"2-1-2-0", note:"Guma + hantel. Lewa strona pierwsza + dodatkowa seria.", prog:"Start: lekka guma + 2kg. Co 2 tyg. +2kg.", why:"wytrzymałość pośladka średniego", tag:"key", link:"" },
            { name:"Step-down wysoka objętość", sets:"3×12/nogę", tempo:"3-0-0-0", note:"Skrzynia 20–30cm.", prog:"Start: masa własna. Co 2 tyg. +2kg.", why:"kontrola VMO pod zmęczeniem", tag:"new", link:"" },
            { name:"Dead bug z ciężarkiem", sets:"3×12/stronę", tempo:"kontrolowane", note:"2,5–5kg w ręce.", prog:"Start: 2,5kg. Co 2 tyg. +1,25kg.", why:"core pod zmęczeniem", tag:"core", link:"" }
          ]
        },
        {
          label: "Dzień B — środa", focus: "Góra — podtrzymanie siły",
          warmup: "gora",
          note: "<em>Utrzymujemy ciężary z fazy 1.</em> Mniejsza objętość, ta sama intensywność.",
          warn: "Środa: siłownia ODDZIELNIE od roweru. Przerwa minimum 4–5 godzin.",
          changes: null,
          exercises: [
            { name:"Podciąganie + ciężar (5kg pasy)", sets:"3×6", tempo:"3-0-1-0", note:"", prog:"Ciężar z fazy 1 + 5kg pasy.", why:"podtrzymanie siły ciągnącej", tag:"", link:"" },
            { name:"Wiosłowanie sztangą", sets:"3×8", tempo:"3-1-1-0", note:"", prog:"Utrzymaj ciężar z fazy 1.", why:"", tag:"", link:"" },
            { name:"OHP", sets:"3×8", tempo:"3-0-1-0", note:"", prog:"Utrzymaj.", why:"", tag:"", link:"" },
            { name:"Face pull", sets:"3×20", tempo:"kontrolowane", note:"", prog:"Ciężar z fazy 1, powt. wzrosły do 20.", why:"rotatory na długi sezon", tag:"fai", link:"" },
            { name:"Copenhagen plank", sets:"3×25 sek./stronę", tempo:"statyczny", note:"", prog:"Co 2 tyg. +5 sek. do 40 sek.", why:"przywodziciele + core", tag:"fai", link:"" },
            { name:"Wspięcia 1 noga", sets:"3×20/nogę", tempo:"3-0-1-1", note:"", prog:"Utrzymaj ciężar z fazy 1.", why:"podtrzymanie łydek", tag:"", link:"" }
          ]
        },
        {
          label: "Dzień C — piątek (rano)", focus: "Pośladek średni + kontrola biodra — intensywnie",
          warmup: "nogi",
          note: "<em>Sesja rano.</em> Intensywna praca pośladka średniego i pasma bocznego.",
          warn: null,
          changes: "v6: wzmocniono pracę pośladka średniego: wall-supported hip abduction i lateral band walk z większą objętością.",
          exercises: [
            { name:"Wall-supported hip abduction — wysoka obj.", sets:"4×20/stronę", tempo:"2-1-2-0", note:"Lewa strona pierwsza + dodatkowa seria. Przerwa 30 sek.", prog:"Start: masa własna. Co 2 tyg. guma lub hantel.", why:"wytrzymałość pośladka średniego", tag:"key", link:"" },
            { name:"Lateral band walk — wysoka objętość", sets:"4×20 kroków/stronę", tempo:"kontrolowane", note:"Mocniejsza guma niż faza 1.", prog:"Co 2 tyg. mocniejsza guma lub wolniejsze tempo.", why:"pośladek średni w ruchu", tag:"new", link:"" },
            { name:"BSS izometryczny — wydłużony", sets:"3×40 sek./nogę", tempo:"statyczny", note:"Lewa noga pierwsza.", prog:"Start: 5kg/hantel. Co 2 tyg. +5 sek. lub +2,5kg.", why:"kontrola biodra pod zmęczeniem", tag:"fai", link:"" },
            { name:"Hip airplane", sets:"3×8/nogę", tempo:"3-2-2-0", note:"", prog:"Ewentualnie +1–2kg w ręce.", why:"stabilizacja rotacyjna biodra", tag:"new", link:"" },
            { name:"Single-leg bridge podwyższona", sets:"3×15/nogę", tempo:"2-1-2-0", note:"Lewa noga pierwsza.", prog:"Guma lub 5kg talerz na biodro.", why:"izolacja pośladka", tag:"fai", link:"" },
            { name:"Step-down", sets:"3×10/nogę", tempo:"4-0-0-0", note:"Skrzynia 25–30cm.", prog:"Co 2 tyg. +2kg.", why:"ekscentryczna kontrola VMO", tag:"new", link:"" },
            { name:"Leg curl leżąco — podtrzymanie", sets:"3×15", tempo:"2-1-1-0", note:"", prog:"~70% ciężaru z fazy 1 (ok. 16–17kg).", why:"podtrzymanie dwugłowych", tag:"", link:"" }
          ]
        }
      ]
    },
    {
      label: "Faza 3 — Podtrzymanie (21 lip–5 sie)",
      desc: "<strong>Cel:</strong> Utrzymanie adaptacji bez zmęczenia. Objętość –40%, intensywność bez zmian. <strong>Ostatni trening siłowy: 5 sierpnia</strong> (10 dni przed wyścigiem).",
      days: [
        {
          label: "Sesja 1 — poniedziałek", focus: "Nogi + łańcuch tylny + pośladek średni",
          warmup: "nogi",
          note: "<em>Mniej serii, ten sam ciężar.</em> Sygnał do mięśni, nie budowanie.",
          warn: null, changes: null,
          exercises: [
            { name:"Hip thrust ze sztangą", sets:"3×8", tempo:"3-1-2-0", note:"Ciężar z fazy 1.", prog:"Utrzymaj.", why:"", tag:"", link:"" },
            { name:"Single-leg RDL", sets:"2×8/nogę", tempo:"3-1-1-0", note:"Lewa noga pierwsza.", prog:"Utrzymaj.", why:"", tag:"", link:"" },
            { name:"Nordics", sets:"2×5", tempo:"4-0-0-0", note:"Bez forsowania.", prog:"Utrzymaj.", why:"", tag:"", link:"" },
            { name:"Side-lying hip abduction z hantlem", sets:"2×12/stronę", tempo:"2-1-2-0", note:"Lewa strona pierwsza.", prog:"Utrzymaj.", why:"podtrzymanie pośladka średniego przed startem", tag:"key", link:"" },
            { name:"Wall-supported hip abduction", sets:"2×15/stronę", tempo:"2-1-2-0", note:"Lewa strona pierwsza.", prog:"Utrzymaj.", why:"", tag:"", link:"" },
            { name:"Hip airplane + clamshell lewy", sets:"2×6 + 2×15", tempo:"kontrolowane", note:"", prog:"Utrzymaj.", why:"wzorce motoryczne przed startem", tag:"core", link:"" }
          ]
        },
        {
          label: "Sesja 2 — środa/piątek (~5 sie)", focus: "Góra + core — ostatnia sesja",
          warmup: "gora",
          note: "<em>Ostatnia sesja siłowa przed Ironmanem.</em> Lekko i kontrolowanie. Zero DOMS-ów przed wyścigiem.",
          warn: null, changes: null,
          exercises: [
            { name:"Podciąganie (bez dodatkowego ciężaru)", sets:"3×5", tempo:"3-0-1-0", note:"", prog:"Utrzymaj.", why:"", tag:"", link:"" },
            { name:"Wiosłowanie wyciąg dolny", sets:"2×10", tempo:"2-1-1-0", note:"", prog:"Utrzymaj.", why:"", tag:"", link:"" },
            { name:"Face pull", sets:"3×15", tempo:"kontrolowane", note:"", prog:"Utrzymaj.", why:"", tag:"", link:"" },
            { name:"Copenhagen plank", sets:"2×20 sek./stronę", tempo:"statyczny", note:"", prog:"Utrzymaj.", why:"", tag:"", link:"" },
            { name:"Pallof press", sets:"2×10/stronę", tempo:"2-2-1-0", note:"", prog:"Utrzymaj.", why:"", tag:"", link:"" }
          ]
        }
      ]
    }
  ]
};

// ============================================================
// DEFAULT ZONES DATA (seed z historycznych testów)
// ============================================================
const DEFAULT_ZONES_DATA = {
  swim: [
    { id: 'sw1', date: '2024-11-21', protocol: '400/200m', thresholdPace: '1:53', time400: '7:08', time200: '3:21', note: '' },
    { id: 'sw2', date: '2025-05-10', protocol: '400/200m', thresholdPace: '1:44', time400: '6:43', time200: '3:14', note: '' },
    { id: 'sw3', date: '2026-01-13', protocol: '400/200m', thresholdPace: '1:49', time400: '6:47', time200: '3:08', note: '' },
  ],
  bike: [
    { id: 'bk1', date: '2024-11-14', protocol: "2x8'", ftp: 230, hr: 156, weight: 82, note: 'trenażer + pedały' },
    { id: 'bk2', date: '2025-05-03', protocol: "2x8'", ftp: 245, hr: 162, weight: 82, note: 'trenażer po kalibracji' },
    { id: 'bk3', date: '2026-01-07', protocol: "2x8'", ftp: 235, hr: 163, weight: 87, note: 'trenażer po kalibracji' },
  ],
  run: [
    { id: 'rn1', date: null,         protocol: '5KM', hr: 172, thresholdPace: '5:08', note: 'park, z przerwą' },
    { id: 'rn2', date: '2025-05-14', protocol: '5KM', hr: 169, thresholdPace: '4:57', note: 'park, bez przerw' },
    { id: 'rn3', date: '2025-08-23', protocol: '5KM', hr: 178, thresholdPace: '4:53', note: 'Parkrun' },
  ],
};

// ============================================================
// GIST CONFIG — token z localStorage, nie z kodu
// ============================================================
const GIST_ID   = 'db261a815c6e41a502c2271f27b13798';
const GIST_FILE = 'ironman_plan.json';
function getToken() { return localStorage.getItem('ironman_token') || ''; }

// ============================================================
// STATE
// ============================================================
let data = JSON.parse(JSON.stringify(DEFAULT_DATA));
let currentPhase = 0;
let sessionLog = [];
let doneState = {};
let breathData = {
  startDate: null,   // "YYYY-MM-DD" — data pierwszej sesji (ustawiana automatycznie)
  sessions: []       // [ { date, time, resistance, breaths, note } ]
};
let zonesData = JSON.parse(JSON.stringify(DEFAULT_ZONES_DATA));

// Migracja: konwertuje stare items rozgrzewki (stringi) na obiekty {text, link}
function normalizeData() {
  Object.values(data.warmups).forEach(wu => {
    wu.items = wu.items.map(item =>
      typeof item === 'string' ? { text: item, link: '' } : item
    );
  });
}

function loadFromStorage() {
  try {
    const d = localStorage.getItem('ironman_data');
    if (d) data = JSON.parse(d);
    const l = localStorage.getItem('ironman_log');
    if (l) sessionLog = JSON.parse(l);
    const s = localStorage.getItem('ironman_done');
    if (s) doneState = JSON.parse(s);
    const b = localStorage.getItem('ironman_breath');
    if (b) breathData = JSON.parse(b);
    const z = localStorage.getItem('ironman_zones');
    if (z) {
      const parsed = JSON.parse(z);
      // Merge: zachowaj seed dla sportów których brak w localStorage
      if (parsed && typeof parsed === 'object') {
        zonesData = {
          swim: parsed.swim || zonesData.swim,
          bike: parsed.bike || zonesData.bike,
          run:  parsed.run  || zonesData.run,
        };
      }
    }
  } catch(e) { console.warn('load error', e); }
  normalizeData();
}

function saveToStorage() {
  localStorage.setItem('ironman_data', JSON.stringify(data));
  localStorage.setItem('ironman_log', JSON.stringify(sessionLog));
  localStorage.setItem('ironman_done', JSON.stringify(doneState));
  localStorage.setItem('ironman_breath', JSON.stringify(breathData));
  saveZonesToStorage();
}

function saveZonesToStorage() {
  localStorage.setItem('ironman_zones', JSON.stringify(zonesData));
}
