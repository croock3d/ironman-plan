// ============================================================
// ZONES — Strefy intensywności (pływanie, kolarstwo, bieganie)
// ============================================================

// ---- ZONE RULES ----

const ZONE_RULES = {
  swim: {
    label: 'Pływanie',
    icon: '🏊',
    // Próg: tempo s/100m (im wyżej = wolniej)
    // Każda strefa: zakres od szybszego tempa do wolniejszego
    // Mnożnik S(n) = dolna granica S(n) (szybsza), mnożnik S(n-1) = górna (wolniejsza)
    zones: [
      { name: 'S1', label: 'Regeneracja', mult: 1.30 },
      { name: 'S2', label: '70–75%',      mult: 1.15 },
      { name: 'S3', label: '80%',          mult: 1.06 },
      { name: 'S4', label: '85%',          mult: 1.02 },
      { name: 'S5', label: '90%+',         mult: 0.96 },
    ],
  },
  bike: {
    label: 'Kolarstwo',
    icon: '🚴',
    zones: [
      { name: 'S1',  label: 'Aktywna regeneracja', hrMult: null, pwrMult: null  },
      { name: 'S2',  label: 'Aerobowa',             hrMult: 0.68, pwrMult: 0.55 },
      { name: 'S3',  label: 'Tempo',                hrMult: 0.83, pwrMult: 0.75 },
      { name: 'S4',  label: 'Próg',                 hrMult: 0.93, pwrMult: 0.90 },
      { name: 'S5a', label: 'VO2max',               hrMult: 0.99, pwrMult: 1.05 },
      { name: 'S5b', label: 'Beztlenowa',           hrMult: null, pwrMult: 1.20 },
      { name: 'S5c', label: 'Neuromuskularna',      hrMult: null, pwrMult: 1.50 },
    ],
  },
  run: {
    label: 'Bieganie',
    icon: '🏃',
    zones: [
      { name: 'S1',  label: 'Aktywna regeneracja', hrMult: null, paceMult: 1.50 },
      { name: 'S2',  label: 'Aerobowa',             hrMult: 0.80, paceMult: 1.29 },
      { name: 'S3',  label: 'Tempo',                hrMult: 0.89, paceMult: 1.13 },
      { name: 'S4',  label: 'Próg',                 hrMult: 0.94, paceMult: 1.06 },
      { name: 'S5a', label: 'VO2max',               hrMult: 0.99, paceMult: 0.99 },
      { name: 'S5b', label: 'Beztlenowa',           hrMult: null, paceMult: 0.97 },
      { name: 'S5c', label: 'Neuromuskularna',      hrMult: null, paceMult: 0.90 },
    ],
  },
};

const ZONE_PROTOCOLS = {
  swim: [
    {
      id: '400/200m',
      label: '400/200m',
      desc: 'Test polega na przepłynięciu maksymalnie mocno dwóch odcinków 400m i 200m. Bardzo ważne jest aby odcinki były faktycznie na maksymalnej intensywności i żeby pomiędzy odcinkami była przerwa pozwalająca na pełny wypoczynek. Ważne jest, żebyś zanotował wynik 400m i 200m. Następnie od wyniku na 400m odejmujesz wynik na 200m i dzielisz przez 2. Otrzymany wynik jest Twoim wynikiem progowym.',
      steps: [
        '200 rozpł',
        '200 (25 kr/25 inny styl)',
        '100 (25 properel/25 pięści/25 palce szeroko/25 kr)',
        '2x50 (25 kr rozp/25 luz)',
        '100 luz',
        '400kr MAX! (mierzysz czas)',
        '100 totalny luz',
        'p. 3\'',
        '200 kr luz',
        'p. 2\'',
        '100 kr luz',
        'p. 1-3\'',
        '200 kr MAX! (mierzysz czas)',
        '100 totalny luz',
        'p. 3\'',
        '400 kr RR rozpływanie',
        '— całość 2200m',
      ],
    },
    {
      id: '1000m',
      label: '1000m',
      desc: 'Test polega na przepłynięciu maksymalnie mocno odcinka 1000m. Wynikiem progowym jest średnie tempo z 1000m. Trudność tego protokołu polega na odpowiednim wyczuciu tempa, tak aby nie zacząć zbyt mocno.',
      steps: [
        '200 rozpł',
        '200 (25 kr/25 inny styl)',
        '100 (25 properel/25 pięści/25 palce szeroko/25 kr)',
        '2x50 (25 kr rozp/25 luz)',
        '100 luz',
        '1000kr MAX! (mierzysz czas)',
        '100 totalny luz',
        '400 kr RR rozpływanie',
        '— całość 2200m',
      ],
    },
  ],
  bike: [
    {
      id: 'Ramp test',
      label: 'Ramp test',
      desc: 'Test razem z 2x8\' zalecany bardziej początkującym triathlonistom ze względu na to, że jest mniej wymagający niż klasyczny test 5\'+20\'. Jest to test, który bardzo ciężko zepsuć :) więc ryzyko powtórki jest naprawdę małe. Test polega na krótkiej rozgrzewce (dłuższa nie jest wymagana, bo intensywność jest stopniowo zwiększana) i zaczynając od rozgrzewkowej spokojnej mocy co 1\' zwiększasz moc o 20W. Aby obliczyć wynik FTP wyciągasz średnią (korzystam ze znormalizowanej) ostatniej minuty i 75% tej mocy to moc FTP.',
      steps: [
        '10\' S2',
        'RAMP TEST (co 1\' +20W aż do odmowy)',
        '15\' S1',
      ],
    },
    {
      id: "2x8'",
      label: "2x8'",
      desc: 'Test zalecany bardziej początkującym triathlonistom ze względu na to, że jest mniej wymagający niż klasyczny test 5\'+20\'. Dużo łatwiej w nim rozłożyć odpowiednio siły i uzyskać tym samym bardziej miarodajny wynik. Jest to też test mniej obciążający i można go częściej wykonywać. Jednak ma on jedną sporą wadę, nie jest tak dokładny i ma tendencje do zawyżania wyniku FTP. Aby obliczyć wynik FTP wyciągasz średnią (korzystam ze znormalizowanej) z dwóch prób ośmiominutowych i następnie bierzesz 90% z tej średniej i otrzymujesz wynik FTP. Średnie tętno z dwóch prób jest tętnem progowym.',
      steps: [
        '20\' S2',
        '3x1\' moc (S5b) / 2\' S1',
        '5\' S1',
        '2x8\' MAX (startujesz z zatrzymania, rozpędzasz się pierwszą minutę) p. 10\' miekko, recovery!',
        '15\' S1',
      ],
    },
    {
      id: "5'+20'",
      label: "5'+20'",
      desc: 'Test bardziej wymagający, ale dokładniejszy i wiarygodniejszy. Zalecam ten protokół testowy bardziej zaawansowanym triathlonistom, którzy już mają świadomość treningową i wiedzą jak rozłożyć siły przy takim wysiłku. Ważne w tym teście jest pojechanie 5\' przed naprawdę na maxa, aby cały protokół się zgadzał. Pierwsze 5\' pomoże też określić VO2max. Wynik FTP to 95% mocy z 20\'. Jeśli ktoś pojedzie tylko 20\' max bez 5\' wcześniej, to wtedy wynik FTP wyniesie 92-93% tych 20\'. Średnie tętno z 20\' jest tętnem progowym.',
      steps: [
        '5\' naprawdę spokojnego kręcenia S1',
        'progresja 2\' S2 / 2\' S2/3 / 2\' S3/4 / 2\' S4',
        '8\' S1/S2',
        '5\' MAX!!!',
        '5\' regeneracja',
        '20\' S1/S2',
        '20\' MAX!!! ważna jest równa jazda!',
        '10\' S1',
      ],
    },
  ],
  run: [
    {
      id: '5KM',
      label: '5KM',
      desc: 'Najlepiej wystartować na płaskiej, wymierzonej szybkiej trasie. Ważne, żeby przed takim startem odpowiednio wypocząć i najlepiej zrobić wcześniej przynajmniej kilka treningów ukierunkowanych pod ten start. Czas z zawodów wpisz poniżej do kalkulatora aby otrzymać tempo progowe.',
      steps: [
        'Start na płaskiej, wymierzonej trasie',
        '5KM MAX (mierzysz czas)',
        'Próg = czas / 5',
      ],
    },
    {
      id: '10KM',
      label: '10KM',
      desc: 'Najlepiej wystartować na płaskiej, wymierzonej szybkiej trasie. Kalkulator najlepiej działa przy wyniku na 10km między 30-50\'. Przy wynikach około godziny wystarczy wziąć średnie tempo z 10km.',
      steps: [
        'Start na płaskiej, wymierzonej trasie',
        '10KM MAX (mierzysz czas)',
        'Próg = czas / 10',
      ],
    },
    {
      id: "Test 30'",
      label: "Test 30'",
      desc: 'Naprawdę wymagający protokół testowy, ale przy prawidłowym wykonaniu nie ma obawy o przeszacowanie tempa progowego :) Kluczowe, aby wynik był miarodajny, jest aby pierwsze 10\' nie było za szybkie, serio na kolejnych 20\' idzie się porządnie zmęczyć :) Średnie tempo z 30\' to tempo progowe, a w przypadku tętna to średnie tętno od 10 do 30\'!',
      steps: [
        '20\' S2',
        'KGR',
        'rytmy 3x100m moc / powrót truchtem',
        '30\' ciągłego biegu bardzo mocno (mierzysz tempo)',
        'p. 3\'',
        '10\' S1/2',
      ],
    },
  ],
};

// ---- PACE UTILS ----

function parsePace(str) {
  // "m:ss" or "mm:ss" → seconds (integer)
  if (!str || typeof str !== 'string') return 0;
  const parts = str.split(':');
  if (parts.length !== 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function formatPace(secs) {
  // seconds → "m:ss"
  if (!secs || secs <= 0) return '–';
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---- ZONE CALCULATORS (od–do) ----

function calcSwimZones(test) {
  // Pływanie: im wyższy s/100m = wolniej
  // mult[n] = GÓRNA (wolniejsza) granica strefy n
  // Dolna (szybsza) granica S(n) = górna S(n+1) = mult[n+1] × thresh
  // S1 (najwolniejsza): dolna = mult[S2]×thresh, górna = mult[S1]×thresh
  // S5 (najszybsza):    dolna = null (brak), górna = mult[S5]×thresh → "od X i szybciej"
  const thresh = parsePace(test.thresholdPace);
  const zones  = ZONE_RULES.swim.zones;
  const toSecs = zones.map(z => Math.round(thresh * z.mult)); // górna granica każdej strefy
  return zones.map((z, i) => ({
    name:  z.name,
    label: z.label,
    from:  i + 1 < zones.length ? formatPace(toSecs[i + 1]) : null, // dolna = górna następnej
    to:    formatPace(toSecs[i]),                                     // górna = własna
  }));
}

function calcBikeZones(test) {
  // HR: dolna granica strefy (od X bpm)
  // Moc: od X do Y W (górna = dolna następnej strefy - 1)
  const zones = ZONE_RULES.bike.zones;
  return zones.map((z, i) => {
    const hrFrom  = z.hrMult  ? Math.round(test.hr  * z.hrMult)  : null;
    const pwrFrom = z.pwrMult ? Math.round(test.ftp * z.pwrMult) : null;

    // Górna granica mocy = dolna granicy następnej strefy - 1
    const nextPwrMult = zones[i + 1]?.pwrMult || null;
    const pwrTo = (nextPwrMult && pwrFrom !== null)
      ? Math.round(test.ftp * nextPwrMult) - 1
      : null;

    // Górna granica HR = dolna granicy następnej strefy - 1
    const nextHrMult = zones[i + 1]?.hrMult || null;
    const hrTo = (nextHrMult && hrFrom !== null)
      ? Math.round(test.hr * nextHrMult) - 1
      : null;

    return { name: z.name, label: z.label, hrFrom, hrTo, pwrFrom, pwrTo };
  });
}

function calcRunZones(test) {
  // HR: dolna granica (od X bpm)
  // Tempo: od X do Y /km (tempo: wyższy s/km = wolniej, więc "od" = szybsza wartość)
  const thresh = parsePace(test.thresholdPace);
  const zones  = ZONE_RULES.run.zones;
  return zones.map((z, i) => {
    const hrFrom    = z.hrMult   ? Math.round(test.hr * z.hrMult)        : null;
    const paceFromS = z.paceMult ? Math.round(thresh  * z.paceMult)      : null;

    // Górna granica tempa = szybsza wartość = następna strefa (mniejszy mnożnik = szybciej)
    const nextPaceMult = zones[i + 1]?.paceMult || null;
    const paceToS = (nextPaceMult && paceFromS !== null)
      ? Math.round(thresh * nextPaceMult)
      : null;

    // Górna granica HR
    const nextHrMult = zones[i + 1]?.hrMult || null;
    const hrTo = (nextHrMult && hrFrom !== null)
      ? Math.round(test.hr * nextHrMult) - 1
      : null;

    return {
      name: z.name,
      label: z.label,
      hrFrom,
      hrTo,
      paceFrom: paceFromS ? formatPace(paceFromS) : null,
      paceTo:   paceToS   ? formatPace(paceToS)   : null,
    };
  });
}

function calculateZones(sport, test) {
  if (sport === 'swim') return calcSwimZones(test);
  if (sport === 'bike') return calcBikeZones(test);
  if (sport === 'run')  return calcRunZones(test);
  return [];
}

// ---- ZONE COLOR ----

const ZONE_COLORS = {
  S1:  { bg: '#0f2340', border: '#1e4080', text: '#60a5fa' },
  S2:  { bg: '#0a2a1a', border: '#145a30', text: '#34d399' },
  S3:  { bg: '#1e2b00', border: '#3d5800', text: '#a3e635' },
  S4:  { bg: '#2a1e00', border: '#5a4000', text: '#fbbf24' },
  S5:  { bg: '#2a0d00', border: '#7c2200', text: '#fb923c' },
  S5a: { bg: '#2a0d00', border: '#7c2200', text: '#fb923c' },
  S5b: { bg: '#2a0500', border: '#7c1000', text: '#f87171' },
  S5c: { bg: '#1e0505', border: '#5a0a0a', text: '#fca5a5' },
};

function zoneColor(name) {
  return ZONE_COLORS[name] || ZONE_COLORS['S3'];
}

// ---- UTILS ----

function formatDate(d) {
  if (!d) return 'brak daty';
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

function rangeStr(from, to, unit) {
  // "X – Y unit" albo "od X unit"
  if (from === null) return '–';
  if (to !== null) return `${from} – ${to} ${unit}`.trim();
  return `od ${from} ${unit}`.trim();
}

// ---- MAIN RENDER ----

let _activeZoneSport = 'swim';

function renderZones() {
  const screen = document.getElementById('screen-zones');
  if (!screen) return;

  screen.innerHTML = `
    <div class="zones-screen">
      <div class="zones-sport-tabs" id="zones-sport-tabs">
        ${['swim', 'bike', 'run'].map(s => `
          <button class="zones-sport-tab${s === _activeZoneSport ? ' active' : ''}"
            onclick="setZonesSport('${s}')">
            ${ZONE_RULES[s].icon} ${ZONE_RULES[s].label}
          </button>
        `).join('')}
      </div>
      <div id="zones-body"></div>
    </div>
  `;

  renderZonesSport(_activeZoneSport);
}

function setZonesSport(sport) {
  _activeZoneSport = sport;
  document.querySelectorAll('.zones-sport-tab').forEach(b => b.classList.remove('active'));
  const tab = document.querySelector(`.zones-sport-tab[onclick="setZonesSport('${sport}')"]`);
  if (tab) tab.classList.add('active');
  renderZonesSport(sport);
}

function renderZonesSport(sport) {
  const body = document.getElementById('zones-body');
  if (!body) return;

  const tests   = zonesData[sport] || [];
  const current = tests.length > 0 ? tests[tests.length - 1] : null;

  body.innerHTML = `
    ${renderCurrentCard(sport, current)}
    ${renderHistory(sport, tests)}
    <div class="zones-add-wrap">
      <button class="zones-add-btn" onclick="toggleZonesForm('${sport}')">+ Dodaj test</button>
      <button class="zones-protocols-btn" onclick="toggleProtocolsPanel('${sport}')">Protokoły — podgląd</button>
    </div>
    <div id="zones-protocols-wrap"></div>
    <div id="zones-form-wrap"></div>
  `;
}

// ---- CURRENT CARD ----

function renderCurrentCard(sport, test) {
  if (!test) {
    return `
      <div class="zones-current-card zones-empty">
        <div class="zones-empty-text">Brak testów. Dodaj pierwszy test.</div>
      </div>
    `;
  }

  const zones      = calculateZones(sport, test);
  const metaChips  = buildMetaChips(sport, test);
  const tableHTML  = buildZonesTable(sport, zones);

  return `
    <div class="zones-current-card">
      <div class="zones-current-header">
        <div class="zones-current-title">Aktualny test</div>
        <div class="zones-current-date">${formatDate(test.date)}</div>
      </div>
      <div class="zones-meta-chips">${metaChips}</div>
      ${tableHTML}
    </div>
  `;
}

// ---- TABLE BUILDERS ----

function buildZonesTable(sport, zones) {
  if (sport === 'swim') return buildSwimTable(zones);
  if (sport === 'bike') return buildBikeTable(zones);
  if (sport === 'run')  return buildRunTable(zones);
  return '';
}

function buildSwimTable(zones) {
  return `
    <table class="zones-table">
      <thead>
        <tr>
          <th>Strefa</th>
          <th>Opis</th>
          <th class="zone-th-center">Tempo / 100m</th>
        </tr>
      </thead>
      <tbody>
        ${zones.map((z, i) => {
          const c = zoneColor(z.name);
          const isFirst = (i === 0);
          const isLast  = (i === zones.length - 1);
          let rangeDisplay;
          if (isFirst) {
            rangeDisplay = `${z.from} – ${z.to}`;
          } else if (isLast) {
            rangeDisplay = `od ${z.to} i szybciej`;
          } else {
            rangeDisplay = `${z.from} – ${z.to}`;
          }
          return `<tr style="--zc-bg:${c.bg};--zc-border:${c.border};--zc-text:${c.text}">
            <td class="zone-name-cell">${z.name}</td>
            <td class="zone-label-cell">${z.label}</td>
            <td class="zone-val-cell zone-val-center">${rangeDisplay}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <div class="zones-table-hint">Zakresy tempa na 100m — wartości progowe między strefami</div>
  `;
}

function buildBikeTable(zones) {
  return `
    <table class="zones-table">
      <thead>
        <tr>
          <th>Strefa</th>
          <th>Opis</th>
          <th class="zone-th-right">Tętno</th>
          <th class="zone-th-right">Moc (W)</th>
        </tr>
      </thead>
      <tbody>
        ${zones.map(z => {
          const c = zoneColor(z.name);
          let hrDisplay, pwrDisplay;

          if (z.hrFrom === null) {
            hrDisplay = '–';
          } else if (z.hrTo) {
            hrDisplay = `${z.hrFrom}–${z.hrTo} bpm`;
          } else {
            hrDisplay = `od ${z.hrFrom} bpm`;
          }

          if (z.pwrFrom === null) {
            pwrDisplay = '–';
          } else if (z.pwrTo) {
            pwrDisplay = `${z.pwrFrom}–${z.pwrTo} W`;
          } else {
            pwrDisplay = `od ${z.pwrFrom} W`;
          }

          return `<tr style="--zc-bg:${c.bg};--zc-border:${c.border};--zc-text:${c.text}">
            <td class="zone-name-cell">${z.name}</td>
            <td class="zone-label-cell">${z.label}</td>
            <td class="zone-val-cell zone-val-right">${hrDisplay}</td>
            <td class="zone-val-cell zone-val-right">${pwrDisplay}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

function buildRunTable(zones) {
  return `
    <table class="zones-table">
      <thead>
        <tr>
          <th>Strefa</th>
          <th>Opis</th>
          <th class="zone-th-right">Tętno</th>
          <th class="zone-th-right">Tempo / km</th>
        </tr>
      </thead>
      <tbody>
        ${zones.map((z, i) => {
          const c = zoneColor(z.name);
          const isLast = i === zones.length - 1;
          let hrDisplay, paceDisplay;

          if (z.hrFrom === null) {
            hrDisplay = '–';
          } else if (z.hrTo) {
            hrDisplay = `${z.hrFrom}–${z.hrTo} bpm`;
          } else {
            hrDisplay = `od ${z.hrFrom} bpm`;
          }

          // paceFrom = wolniejsza granica, paceTo = szybsza granica
          if (z.paceFrom === null) {
            paceDisplay = '–';
          } else if (z.paceTo) {
            paceDisplay = `${z.paceTo} – ${z.paceFrom}`;
          } else if (isLast) {
            // S5c: najszybsza strefa — brak szybszej granicy
            paceDisplay = `od ${z.paceFrom}`;
          } else {
            // S1: najwolniejsza strefa — brak wolniejszej granicy
            paceDisplay = `do ${z.paceFrom}`;
          }

          return `<tr style="--zc-bg:${c.bg};--zc-border:${c.border};--zc-text:${c.text}">
            <td class="zone-name-cell">${z.name}</td>
            <td class="zone-label-cell">${z.label}</td>
            <td class="zone-val-cell zone-val-right">${hrDisplay}</td>
            <td class="zone-val-cell zone-val-right">${paceDisplay}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

// ---- META CHIPS ----

function buildMetaChips(sport, test) {
  const chips = [];
  chips.push(`<span class="zones-chip zones-chip-proto">${test.protocol}</span>`);
  if (sport === 'swim') {
    chips.push(`<span class="zones-chip">Próg: ${test.thresholdPace}/100m</span>`);
    if (test.time400) chips.push(`<span class="zones-chip">400m: ${test.time400}</span>`);
    if (test.time200) chips.push(`<span class="zones-chip">200m: ${test.time200}</span>`);
  } else if (sport === 'bike') {
    chips.push(`<span class="zones-chip">FTP: ${test.ftp} W</span>`);
    chips.push(`<span class="zones-chip">HR: ${test.hr} bpm</span>`);
    chips.push(`<span class="zones-chip">Waga: ${test.weight} kg</span>`);
    chips.push(`<span class="zones-chip">W/kg: ${(test.ftp / test.weight).toFixed(2)}</span>`);
  } else if (sport === 'run') {
    chips.push(`<span class="zones-chip">Próg: ${test.thresholdPace}/km</span>`);
    chips.push(`<span class="zones-chip">HR: ${test.hr} bpm</span>`);
  }
  if (test.note) chips.push(`<span class="zones-chip zones-chip-note">${test.note}</span>`);
  return chips.join('');
}

// ---- HISTORY ----

function renderHistory(sport, tests) {
  if (tests.length <= 1) return '';

  const older = tests.slice(0, tests.length - 1).slice().reverse();

  return `
    <details class="zones-history">
      <summary class="zones-history-summary">
        Historia testów
        <span class="zones-history-count">${older.length}</span>
      </summary>
      <div class="zones-history-list">
        ${older.map(t => renderHistoryItem(sport, t)).join('')}
      </div>
    </details>
  `;
}

function renderHistoryItem(sport, test) {
  const chips = buildMetaChips(sport, test);
  return `
    <div class="zones-hist-item" id="zhist-${test.id}">
      <div class="zones-hist-top">
        <span class="zones-hist-date">${formatDate(test.date)}</span>
        <button class="zones-del-btn" onclick="deleteZonesTest('${sport}', '${test.id}')" title="Usuń">✕</button>
      </div>
      <div class="zones-meta-chips">${chips}</div>
    </div>
  `;
}

// ---- ADD TEST FORM ----

let _zonesFormSport = null;
let _protocolsPanelSport = null;

// ---- PROTOCOLS PANEL ----

function toggleProtocolsPanel(sport) {
  const wrap = document.getElementById('zones-protocols-wrap');
  if (!wrap) return;
  if (_protocolsPanelSport === sport && wrap.innerHTML !== '') {
    wrap.innerHTML = '';
    _protocolsPanelSport = null;
    return;
  }
  _protocolsPanelSport = sport;
  wrap.innerHTML = renderProtocolsPanel(sport);
}

function renderProtocolsPanel(sport) {
  const protocols = ZONE_PROTOCOLS[sport] || [];
  const cards = protocols.map(p => `
    <div class="zp-card">
      <button class="zp-card-header" onclick="toggleProtocolCard(this)">
        <span class="zp-card-title">${p.label}</span>
        <span class="zp-card-chevron">▸</span>
      </button>
      <div class="zp-card-body" hidden>
        <p class="zp-desc">${p.desc}</p>
        <ol class="zp-steps">
          ${p.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>
    </div>
  `).join('');
  return `<div class="zones-protocols-panel">${cards}</div>`;
}

function toggleProtocolCard(btn) {
  const body = btn.nextElementSibling;
  const chevron = btn.querySelector('.zp-card-chevron');
  const isOpen = !body.hidden;
  body.hidden = isOpen;
  chevron.textContent = isOpen ? '▸' : '▾';
}


function toggleZonesForm(sport) {
  const wrap = document.getElementById('zones-form-wrap');
  if (!wrap) return;
  if (_zonesFormSport === sport && wrap.innerHTML !== '') {
    wrap.innerHTML = '';
    _zonesFormSport = null;
    return;
  }
  _zonesFormSport = sport;
  wrap.innerHTML = renderZonesForm(sport);
}

function swimFieldsHtml(protocol) {
  if (protocol === '1000m') {
    return `
      <div class="zones-field-row">
        <div class="zones-field-group">
          <label class="zones-field-label">Wynik 1000m (m:ss)</label>
          <input class="zones-field-input" id="zf-time1000" type="text" placeholder="17:30" inputmode="text">
        </div>
      </div>
    `;
  }
  return `
    <div class="zones-field-row">
      <div class="zones-field-group">
        <label class="zones-field-label">Wynik 400m (m:ss)</label>
        <input class="zones-field-input" id="zf-time400" type="text" placeholder="6:45" inputmode="text">
      </div>
      <div class="zones-field-group">
        <label class="zones-field-label">Wynik 200m (m:ss)</label>
        <input class="zones-field-input" id="zf-time200" type="text" placeholder="3:10" inputmode="text">
      </div>
    </div>
  `;
}

function onSwimProtocolChange(protocol) {
  const el = document.getElementById('zf-swim-fields');
  if (el) el.innerHTML = swimFieldsHtml(protocol);
}

function runFieldsHtml(protocol) {
  const hrField = `
    <div class="zones-field-group">
      <label class="zones-field-label">HR próg (bpm)</label>
      <input class="zones-field-input" id="zf-hr" type="number" placeholder="170" inputmode="numeric">
    </div>`;
    if (protocol === '5KM') {
    return `<div class="zones-field-row">
      <div class="zones-field-group">
        <label class="zones-field-label">Czas na 5km (mm:ss)</label>
        <input class="zones-field-input" id="zf-time5" type="text" placeholder="22:30" inputmode="text">
      </div>${hrField}
    </div>`;
  }
  if (protocol === '10KM') {
    return `<div class="zones-field-row">
      <div class="zones-field-group">
        <label class="zones-field-label">Czas na 10km (mm:ss)</label>
        <input class="zones-field-input" id="zf-time10" type="text" placeholder="46:00" inputmode="text">
      </div>${hrField}
    </div>`;
  }
  // Test 30' — wpisz średnie tempo
  return `<div class="zones-field-row">
    <div class="zones-field-group">
      <label class="zones-field-label">Średnie tempo 30' (m:ss / km)</label>
      <input class="zones-field-input" id="zf-threshold" type="text" placeholder="5:00" inputmode="text">
    </div>${hrField}
  </div>`;
}

function onRunProtocolChange(protocol) {
  const el = document.getElementById('zf-run-fields');
  if (el) el.innerHTML = runFieldsHtml(protocol);
}

function renderZonesForm(sport) {
  const protocols = ZONE_PROTOCOLS[sport] || [];
  const today = new Date().toISOString().slice(0, 10);

  let fields = '';
  if (sport === 'swim') {
    fields = `<div id="zf-swim-fields">${swimFieldsHtml(ZONE_PROTOCOLS.swim[0].id)}</div>`;
  } else if (sport === 'bike') {
    fields = `
      <div class="zones-field-row">
        <div class="zones-field-group">
          <label class="zones-field-label">FTP (W)</label>
          <input class="zones-field-input" id="zf-ftp" type="number" placeholder="240" inputmode="numeric">
        </div>
        <div class="zones-field-group">
          <label class="zones-field-label">HR próg (bpm)</label>
          <input class="zones-field-input" id="zf-hr" type="number" placeholder="160" inputmode="numeric">
        </div>
        <div class="zones-field-group">
          <label class="zones-field-label">Waga (kg)</label>
          <input class="zones-field-input" id="zf-weight" type="number" placeholder="80" inputmode="numeric">
        </div>
      </div>
    `;
  } else if (sport === 'run') {
    fields = `<div id="zf-run-fields">${runFieldsHtml(ZONE_PROTOCOLS.run[0].id)}</div>`;
  }

  return `
    <div class="zones-form">
      <div class="zones-form-title">Nowy test — ${ZONE_RULES[sport].label}</div>
      <div class="zones-field-row">
        <div class="zones-field-group">
          <label class="zones-field-label">Data</label>
          <input class="zones-field-input" id="zf-date" type="date" value="${today}">
        </div>
        <div class="zones-field-group zones-field-grow">
          <label class="zones-field-label">Protokół</label>
          <select class="zones-field-input zones-field-select" id="zf-protocol" ${sport === 'swim' ? 'onchange="onSwimProtocolChange(this.value)"' : sport === 'run' ? 'onchange="onRunProtocolChange(this.value)"' : ''}>
            ${protocols.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
          </select>
        </div>
      </div>
      ${fields}
      <div class="zones-field-group">
        <label class="zones-field-label">Notatka (opcjonalnie)</label>
        <input class="zones-field-input" id="zf-note" type="text" placeholder="">
      </div>
      <div class="zones-form-actions">
        <button class="zones-form-cancel" onclick="toggleZonesForm('${sport}')">Anuluj</button>
        <button class="zones-form-save" onclick="saveZonesTest('${sport}')">Zapisz test</button>
      </div>
    </div>
  `;
}

// ---- SAVE / DELETE ----

function saveZonesTest(sport) {
  const date     = document.getElementById('zf-date')?.value || null;
  const protocol = document.getElementById('zf-protocol')?.value || '';
  const note     = document.getElementById('zf-note')?.value.trim() || '';
  const id       = sport.slice(0, 2) + Date.now();

  let test = { id, date, protocol, note };

  if (sport === 'swim') {
    const protocol = document.getElementById('zf-protocol')?.value;
    if (protocol === '1000m') {
      const t1000 = document.getElementById('zf-time1000')?.value.trim();
      if (!t1000) { showToast('Wpisz wynik 1000m'); return; }
      // próg [s/100m] = floor(czas1000[s] / 10)
      const rawThresh = Math.floor(parsePace(t1000) / 10);
      test.thresholdPace = formatPace(rawThresh);
      test.time1000 = t1000;
    } else {
      const t400 = document.getElementById('zf-time400')?.value.trim();
      const t200 = document.getElementById('zf-time200')?.value.trim();
      if (!t400 || !t200) { showToast('Wpisz wyniki 400m i 200m'); return; }
      // próg [s/100m] = floor((czas400[s] - czas200[s]) / 2)
      const rawThresh = Math.floor((parsePace(t400) - parsePace(t200)) / 2);
      test.thresholdPace = formatPace(rawThresh);
      test.time400 = t400;
      test.time200 = t200;
    }
  } else if (sport === 'bike') {
    const ftp    = parseInt(document.getElementById('zf-ftp')?.value, 10);
    const hr     = parseInt(document.getElementById('zf-hr')?.value, 10);
    const weight = parseInt(document.getElementById('zf-weight')?.value, 10);
    if (!ftp || !hr || !weight) { showToast('Wypełnij FTP, HR i wagę'); return; }
    test.ftp = ftp; test.hr = hr; test.weight = weight;
  } else if (sport === 'run') {
    const protocol = document.getElementById('zf-protocol')?.value;
    const hr = parseInt(document.getElementById('zf-hr')?.value, 10);
    if (!hr) { showToast('Wpisz HR progowe'); return; }
    test.hr = hr;
  if (protocol === '5KM') {
      const t5 = document.getElementById('zf-time5')?.value.trim();
      if (!t5) { showToast('Wpisz czas na 5km'); return; }
      // próg [s/km] = czas5km[s] / 5
      test.thresholdPace = formatPace(Math.round(parsePace(t5) / 5));
      test.time5 = t5;
    } else if (protocol === '10KM') {
      const t10 = document.getElementById('zf-time10')?.value.trim();
      if (!t10) { showToast('Wpisz czas na 10km'); return; }
      // próg [s/km] = czas10km[s] / 10
      test.thresholdPace = formatPace(Math.round(parsePace(t10) / 10));
      test.time10 = t10;
    } else {
      // Test 30' — próg = wpisane tempo bezpośrednio
      const threshold = document.getElementById('zf-threshold')?.value.trim();
      if (!threshold) { showToast('Wpisz średnie tempo'); return; }
      test.thresholdPace = threshold;
    }
  }

  if (!zonesData[sport]) zonesData[sport] = [];
  zonesData[sport].push(test);
  saveZonesToStorage();
  syncToGist();
  _zonesFormSport = null;
  renderZonesSport(sport);
}

function deleteZonesTest(sport, id) {
  showConfirm({
    title: 'Usuń test?',
    message: 'Tej operacji nie można cofnąć.',
    confirmLabel: 'Usuń',
    danger: true,
    onConfirm: () => {
      zonesData[sport] = (zonesData[sport] || []).filter(t => t.id !== id);
      saveZonesToStorage();
      syncToGist();
      renderZonesSport(sport);
    }
  });
}
