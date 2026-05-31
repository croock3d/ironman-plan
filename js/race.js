// ============================================================
// race.js — Kalkulator intensywności startowych
// Formuły na podstawie arkusza Excel (Google Sheets)
// ============================================================

// ---- Helpers ------------------------------------------------

function paceToSec(paceStr) {
  // "4:38" lub "1:44" → sekundy
  if (!paceStr) return 0;
  const parts = paceStr.trim().split(':');
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  return 0;
}

function secToPace(sec) {
  // sekundy → "m:ss"
  sec = Math.round(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function secToTime(sec) {
  // sekundy → "h:mm:ss" lub "m:ss" jeśli < 1h
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function tempMult(temp, mults) {
  // mults: [poniżej20, 20-25, 25-30, 30-35, powyżej35]
  const idx = { 'poniżej 20 stopni': 0, '20-25 stopni': 1, '25-30 stopni': 2, '30-35 stopni': 3, 'powyżej 35 stopni': 4 };
  return mults[idx[temp] ?? 0];
}

// ---- Formuły (Excel → JS) -----------------------------------

function calcRace(p) {
  // p.runPace   = tempo progowe bieg [s/km]
  // p.runHR     = tętno progowe bieg [bpm]
  // p.ftp       = moc progowa rower [W]
  // p.bikeHR    = tętno progowe rower [bpm]
  // p.swimPace  = tempo progowe pływanie [s/100m]
  // p.runFTP    = moc progowa bieg [W] (opcja)
  // p.time18    = czas 1/8IM
  // p.time14    = czas 1/4IM
  // p.time12    = czas 1/2IM
  // p.timeIM    = czas IM
  // p.temp      = temperatura

  const G4 = p.runPace;
  const I4 = p.runHR;
  const G5 = p.ftp;
  const I5 = p.bikeHR;
  const G6 = p.swimPace;
  const I6 = p.runFTP || 0;
  const t18 = p.time18;
  const t14 = p.time14;
  const t12 = p.time12;
  const tIM = p.timeIM;
  const temp = p.temp;

  const rows = [];

  // ---- 5km ----
  const G14 = G4 * 0.92, H14 = G4 * 0.95;
  const I14 = Math.round(I4 * 1.005), J14 = Math.round(I4 * 1.05);
  const L14 = ((G14 + H14) / 2) * 5;
  const G15 = G14 * tempMult(temp, [1, 1, 1, 1.02, 1.04]);
  const H15 = H14 * tempMult(temp, [1, 1, 1, 1.02, 1.04]);

  rows.push({
    dist: '5 km', sport: 'bieg', icon: '🏃',
    paceFrom: secToPace(G14), paceTo: secToPace(H14),
    hrFrom: I14, hrTo: J14,
    intensity: '8–9,5',
    time: secToTime(L14),
    tempPaceFrom: secToPace(G15), tempPaceTo: secToPace(H15),
    paceLabel: 'tempo', isTriathlon: false,
  });

  // ---- 10km ----
  const G17 = G4 * 0.96, H17 = G4 * 0.98;
  const I17 = Math.round(I4 * 0.97), J17 = Math.round(I4 * 1.02);
  const L17 = ((G17 + H17) / 2) * 10;
  const G18 = G17 * tempMult(temp, [1, 1.01, 1.03, 1.06, 1.09]);
  const H18 = H17 * tempMult(temp, [1, 1.01, 1.03, 1.06, 1.09]);

  rows.push({
    dist: '10 km', sport: 'bieg', icon: '🏃',
    paceFrom: secToPace(G17), paceTo: secToPace(H17),
    hrFrom: I17, hrTo: J17,
    intensity: '7,5–8,5',
    time: secToTime(L17),
    tempPaceFrom: secToPace(G18), tempPaceTo: secToPace(H18),
    paceLabel: 'tempo', isTriathlon: false,
  });

  // ---- 21,1km ----
  const G20 = G4 * 1.01, H20 = G4 * 1.03;
  const I20 = Math.round(I4 * 0.915), J20 = Math.round(I4 * 0.96);
  const L20 = ((G20 + H20) / 2) * 21.1;
  const G21 = G20 * tempMult(temp, [1, 1.02, 1.04, 1.08, 1.11]);
  const H21 = H20 * tempMult(temp, [1, 1.02, 1.04, 1.08, 1.11]);

  rows.push({
    dist: '21,1 km', sport: 'bieg', icon: '🏃',
    paceFrom: secToPace(G20), paceTo: secToPace(H20),
    hrFrom: I20, hrTo: J20,
    intensity: '6–7',
    time: secToTime(L20),
    tempPaceFrom: secToPace(G21), tempPaceTo: secToPace(H21),
    paceLabel: 'tempo', isTriathlon: false,
  });

  // ---- 42,2km ----
  const G23 = G4 * 1.05, H23 = G4 * 1.07;
  const I23 = Math.round(I4 * 0.87), J23 = Math.round(I4 * 0.93);
  const L23 = ((G23 + H23) / 2) * 42.2;
  const G24 = G23 * tempMult(temp, [1, 1.03, 1.08, 1.12, 1.15]);
  const H24 = H23 * tempMult(temp, [1, 1.03, 1.08, 1.12, 1.15]);

  rows.push({
    dist: '42,2 km', sport: 'bieg', icon: '🏃',
    paceFrom: secToPace(G23), paceTo: secToPace(H23),
    hrFrom: I23, hrTo: J23,
    intensity: '3,5–5',
    time: secToTime(L23),
    tempPaceFrom: secToPace(G24), tempPaceTo: secToPace(H24),
    paceLabel: 'tempo', isTriathlon: false,
  });

  // ---- 1/8 IM ----
  const G26 = G6 * 0.99, H26 = G6 * 1.04;
  const L26 = ((G26 + H26) / 2) * 4.75;
  rows.push({
    dist: '1/8 IM', sport: 'pływanie', icon: '🏊',
    paceFrom: secToPace(G26) + '/100m', paceTo: secToPace(H26) + '/100m',
    hrFrom: '—', hrTo: '—',
    intensity: '8 (8,5–9 pierwsze 200m)',
    time: secToTime(L26),
    tempPaceFrom: null, tempPaceTo: null,
    paceLabel: 'tempo', isTriathlon: true,
  });

  const ifs18 = (a, b) => t18 === "poniżej 1h20'" ? a : b;
  const G27 = Math.round(ifs18(G5 * 0.95, G5 * 0.90));
  const H27 = Math.round(ifs18(G5 * 1.04, G5 * 0.97));
  const I27 = Math.round(ifs18(I5 * 1.00, I5 * 0.98));
  const J27 = Math.round(ifs18(I5 * 1.03, I5 * 1.02));
  const K27 = ifs18(8, 7);
  const G28 = Math.round(G27 * tempMult(temp, [1, 1, 0.99, 0.98, 0.96]));
  rows.push({
    dist: '1/8 IM', sport: 'rower', icon: '🚴',
    paceFrom: G27 + ' W', paceTo: H27 + ' W',
    hrFrom: I27, hrTo: J27,
    intensity: String(K27),
    time: 'Best Bike Split',
    tempPaceFrom: G28 + ' W', tempPaceTo: null,
    paceLabel: 'moc', isTriathlon: true,
  });

  const G29 = ifs18(G4 * 0.96, G4 * 0.99);
  const H29 = ifs18(G4 * 1.03, G4 * 1.05);
  const I29 = Math.round(ifs18(I4 * 1.00, I4 * 0.98));
  const J29 = Math.round(ifs18(I4 * 1.03, I4 * 1.02));
  const K29 = ifs18('8–9', '8');
  const L29 = ((G29 + H29) / 2) * 5.27;
  const G30 = G29 * tempMult(temp, [1, 1.01, 1.02, 1.05, 1.08]);
  const H30 = H29 * tempMult(temp, [1, 1.01, 1.02, 1.05, 1.08]);
  rows.push({
    dist: '1/8 IM', sport: 'bieg', icon: '🏃',
    paceFrom: secToPace(G29), paceTo: secToPace(H29),
    hrFrom: I29, hrTo: J29,
    intensity: K29,
    time: secToTime(L29),
    tempPaceFrom: secToPace(G30), tempPaceTo: secToPace(H30),
    paceLabel: 'tempo', isTriathlon: true,
  });

  // ---- 1/4 IM ----
  const G32 = G6 * 1.03, H32 = G6 * 1.08;
  const L32 = ((G32 + H32) / 2) * 9.5;
  rows.push({
    dist: '1/4 IM', sport: 'pływanie', icon: '🏊',
    paceFrom: secToPace(G32) + '/100m', paceTo: secToPace(H32) + '/100m',
    hrFrom: '—', hrTo: '—',
    intensity: '7,5 (8,5 pierwsze 300m)',
    time: secToTime(L32),
    tempPaceFrom: null, tempPaceTo: null,
    paceLabel: 'tempo', isTriathlon: true,
  });

  const ifs14 = (a, b) => t14 === "poniżej 2h30'" ? a : b;
  const G33 = Math.round(ifs14(G5 * 0.88, G5 * 0.85));
  const H33 = Math.round(ifs14(G5 * 0.95, G5 * 0.91));
  const I33 = Math.round(ifs14(I5 * 0.97, I5 * 0.95));
  const J33 = Math.round(ifs14(I5 * 1.01, I5 * 0.99));
  const K33 = ifs14('6–7', '6');
  const G34 = Math.round(G33 * tempMult(temp, [1, 0.99, 0.98, 0.96, 0.94]));
  rows.push({
    dist: '1/4 IM', sport: 'rower', icon: '🚴',
    paceFrom: G33 + ' W', paceTo: H33 + ' W',
    hrFrom: I33, hrTo: J33,
    intensity: K33,
    time: 'Best Bike Split',
    tempPaceFrom: G34 + ' W', tempPaceTo: null,
    paceLabel: 'moc', isTriathlon: true,
  });

  const G35 = ifs14(G4 * 1.01, G4 * 1.04);
  const H35 = ifs14(G4 * 1.07, G4 * 1.09);
  const I35 = Math.round(ifs14(I4 * 0.95, I4 * 0.95));
  const J35 = Math.round(ifs14(I4 * 1.01, I4 * 0.99));
  const K35 = ifs14('7–7,5', '6–6,5');
  const L35 = ((G35 + H35) / 2) * 10.55;
  const G36 = G35 * tempMult(temp, [1, 1.02, 1.04, 1.07, 1.10]);
  const H36 = H35 * tempMult(temp, [1, 1.02, 1.04, 1.07, 1.10]);
  rows.push({
    dist: '1/4 IM', sport: 'bieg', icon: '🏃',
    paceFrom: secToPace(G35), paceTo: secToPace(H35),
    hrFrom: I35, hrTo: J35,
    intensity: K35,
    time: secToTime(L35),
    tempPaceFrom: secToPace(G36), tempPaceTo: secToPace(H36),
    paceLabel: 'tempo', isTriathlon: true,
  });

  // ---- 1/2 IM ----
  const G38 = G6 * 1.06, H38 = G6 * 1.14;
  const L38 = ((G38 + H38) / 2) * 19;
  rows.push({
    dist: '1/2 IM', sport: 'pływanie', icon: '🏊',
    paceFrom: secToPace(G38) + '/100m', paceTo: secToPace(H38) + '/100m',
    hrFrom: '—', hrTo: '—',
    intensity: '6 (8 pierwsze 300m)',
    time: secToTime(L38),
    tempPaceFrom: null, tempPaceTo: null,
    paceLabel: 'tempo', isTriathlon: true,
  });

  const ifs12 = (a, b, c, d) => {
    if (t12 === 'poniżej 4h') return a;
    if (t12 === '4-5h') return b;
    if (t12 === '5-6h') return c;
    return d; // powyżej 6h
  };
  const G39 = Math.round(ifs12(G5 * 0.83, G5 * 0.81, G5 * 0.79, G5 * 0.75));
  const H39 = Math.round(ifs12(G5 * 0.87, G5 * 0.84, G5 * 0.81, G5 * 0.79));
  const I39 = Math.round(ifs12(I5 * 0.90, I5 * 0.88, I5 * 0.84, I5 * 0.81));
  const J39 = Math.round(ifs12(I5 * 0.94, I5 * 0.92, I5 * 0.88, I5 * 0.85));
  const K39 = ifs12('6,5–7', '6', '5,5', '4,5–5');
  const G40 = Math.round(G39 * tempMult(temp, [1, 0.99, 0.97, 0.94, 0.92]));
  rows.push({
    dist: '1/2 IM', sport: 'rower', icon: '🚴',
    paceFrom: G39 + ' W', paceTo: H39 + ' W',
    hrFrom: I39, hrTo: J39,
    intensity: K39,
    time: 'Best Bike Split',
    tempPaceFrom: G40 + ' W', tempPaceTo: null,
    paceLabel: 'moc', isTriathlon: true,
  });

  const G41 = ifs12(G4 * 1.07, G4 * 1.10, G4 * 1.13, G4 * 1.14);
  const H41 = ifs12(G4 * 1.10, G4 * 1.12, G4 * 1.14, G4 * 1.16);
  const I41 = Math.round(ifs12(I4 * 0.92, I4 * 0.90, I4 * 0.87, I4 * 0.85));
  const J41 = Math.round(ifs12(I4 * 0.95, I4 * 0.92, I4 * 0.89, I4 * 0.87));
  const K41 = ifs12('6–6,5', '5,5', '5', '4');
  const L41 = ((G41 + H41) / 2) * 21.1;
  const G42 = G41 * tempMult(temp, [1, 1.02, 1.06, 1.10, 1.13]);
  const H42 = H41 * tempMult(temp, [1, 1.02, 1.06, 1.10, 1.13]);
  rows.push({
    dist: '1/2 IM', sport: 'bieg', icon: '🏃',
    paceFrom: secToPace(G41), paceTo: secToPace(H41),
    hrFrom: I41, hrTo: J41,
    intensity: K41,
    time: secToTime(L41),
    tempPaceFrom: secToPace(G42), tempPaceTo: secToPace(H42),
    paceLabel: 'tempo', isTriathlon: true,
  });

  // ---- IM ----
  const G44 = G6 * 1.13, H44 = G6 * 1.25;
  const L44 = ((G44 + H44) / 2) * 38;
  rows.push({
    dist: 'IM', sport: 'pływanie', icon: '🏊',
    paceFrom: secToPace(G44) + '/100m', paceTo: secToPace(H44) + '/100m',
    hrFrom: '—', hrTo: '—',
    intensity: '5 (6 pierwsze 400m)',
    time: secToTime(L44),
    tempPaceFrom: null, tempPaceTo: null,
    paceLabel: 'tempo', isTriathlon: true,
  });

  const ifsIM = (a, b, c, d, e) => {
    if (tIM === 'poniżej 9h') return a;
    if (tIM === '9-10h') return b;
    if (tIM === '10-11h') return c;
    if (tIM === '11-12h') return d;
    return e; // powyżej 12h
  };
  const G45 = Math.round(ifsIM(G5 * 0.78, G5 * 0.76, G5 * 0.74, G5 * 0.72, G5 * 0.66));
  const H45 = Math.round(ifsIM(G5 * 0.80, G5 * 0.78, G5 * 0.76, G5 * 0.74, G5 * 0.72));
  const I45 = Math.round(ifsIM(I5 * 0.88, I5 * 0.86, I5 * 0.84, I5 * 0.81, I5 * 0.75));
  const J45 = Math.round(ifsIM(I5 * 0.90, I5 * 0.88, I5 * 0.86, I5 * 0.84, I5 * 0.81));
  const K45 = ifsIM(5.5, 5, 4.5, 4, 3.5);
  const G46 = Math.round(G45 * tempMult(temp, [1, 0.98, 0.96, 0.92, 0.88]));
  const H46 = Math.round(H45 * tempMult(temp, [1, 0.98, 0.96, 0.94, 0.90]));
  rows.push({
    dist: 'IM', sport: 'rower', icon: '🚴',
    paceFrom: G45 + ' W', paceTo: H45 + ' W',
    hrFrom: I45, hrTo: J45,
    intensity: String(K45),
    time: 'Best Bike Split',
    tempPaceFrom: G46 + ' W', tempPaceTo: H46 + ' W',
    paceLabel: 'moc', isTriathlon: true,
  });

  const G47 = ifsIM(G4 * 1.14, G4 * 1.17, G4 * 1.20, G4 * 1.23, G4 * 1.27);
  const H47 = ifsIM(G4 * 1.17, G4 * 1.20, G4 * 1.23, G4 * 1.27, G4 * 1.31);
  const I47 = Math.round(ifsIM(I4 * 0.88, I4 * 0.87, I4 * 0.86, I4 * 0.85, I4 * 0.83));
  const J47 = Math.round(ifsIM(I4 * 0.90, I4 * 0.89, I4 * 0.88, I4 * 0.87, I4 * 0.86));
  const K47 = ifsIM(5.5, 5, 4.5, 4, 3.5);
  const L47 = ((G47 + H47) / 2) * 42.2;
  const G48 = G47 * tempMult(temp, [1, 1.03, 1.08, 1.12, 1.15]);
  const H48 = H47 * tempMult(temp, [1, 1.03, 1.08, 1.12, 1.15]);
  rows.push({
    dist: 'IM', sport: 'bieg', icon: '🏃',
    paceFrom: secToPace(G47), paceTo: secToPace(H47),
    hrFrom: I47, hrTo: J47,
    intensity: String(K47),
    time: secToTime(L47),
    tempPaceFrom: secToPace(G48), tempPaceTo: secToPace(H48),
    paceLabel: 'tempo', isTriathlon: true,
  });

  return rows;
}

// ---- Render -------------------------------------------------

function getLatestRaceParams() {
  const run  = (zonesData.run  || []).filter(t => t.thresholdPace).slice(-1)[0];
  const bike = (zonesData.bike || []).filter(t => t.ftp).slice(-1)[0];
  const swim = (zonesData.swim || []).filter(t => t.thresholdPace).slice(-1)[0];

  return {
    runPace:  run  ? paceToSec(run.thresholdPace)  : paceToSec('5:00'),
    runHR:    run  ? (run.hr  || 170)               : 170,
    ftp:      bike ? (bike.ftp || 200)              : 200,
    bikeHR:   bike ? (bike.hr || 160)               : 160,
    swimPace: swim ? paceToSec(swim.thresholdPace)  : paceToSec('2:00'),
    runFTP:   0,
    time18:   "poniżej 1h20'",
    time14:   "poniżej 2h30'",
    time12:   '5-6h',
    timeIM:   'powyżej 12h',
    temp:     'poniżej 20 stopni',
  };
}

function renderRace() {
  const container = document.getElementById('screen-race');
  const p = getLatestRaceParams();

  const distColors = {
    '5 km':    { bg: '#1a1a2e', accent: '#818cf8' },
    '10 km':   { bg: '#1a1a2e', accent: '#818cf8' },
    '21,1 km': { bg: '#1a2e1a', accent: '#4ade80' },
    '42,2 km': { bg: '#1a2e1a', accent: '#4ade80' },
    '1/8 IM':  { bg: '#2e1a1a', accent: '#fb923c' },
    '1/4 IM':  { bg: '#2e1a1a', accent: '#fb923c' },
    '1/2 IM':  { bg: '#1a2a2e', accent: '#38bdf8' },
    'IM':      { bg: '#2e1a2a', accent: '#e879f9' },
  };

  container.innerHTML = `
    <div class="race-screen">
      <div class="race-header">
        <div class="race-title">Kalkulator startowy</div>
        <div class="race-subtitle">Intensywności na podstawie parametrów progowych</div>
      </div>

      <div class="race-params" id="race-params">
        <div class="race-params-toggle" onclick="toggleRaceParams()">
          <span class="race-params-toggle-label">⚙️ Parametry progowe</span>
          <span class="race-params-toggle-icon" id="race-params-icon">▲</span>
        </div>
        <div class="race-params-body" id="race-params-body">

        <div class="race-params-row">
          <div class="race-params-row-label">🏃 Bieg</div>
          <div class="race-params-row-fields">
            <div class="race-param-group">
              <div class="race-param-label">Tempo progowe</div>
              <div class="race-param-input-row">
                <input class="race-input" id="rp-runPace" type="text" value="${secToPace(p.runPace)}" placeholder="4:38">
                <span class="race-input-unit">/km</span>
              </div>
              <div class="race-param-source" id="rps-run"></div>
            </div>
            <div class="race-param-group">
              <div class="race-param-label">Tętno progowe</div>
              <div class="race-param-input-row">
                <input class="race-input" id="rp-runHR" type="number" value="${p.runHR}" min="100" max="220">
                <span class="race-input-unit">bpm</span>
              </div>
            </div>
          </div>
        </div>

        <div class="race-params-row">
          <div class="race-params-row-label">🚴 Rower</div>
          <div class="race-params-row-fields">
            <div class="race-param-group">
              <div class="race-param-label">FTP</div>
              <div class="race-param-input-row">
                <input class="race-input" id="rp-ftp" type="number" value="${p.ftp}" min="50" max="500">
                <span class="race-input-unit">W</span>
              </div>
              <div class="race-param-source" id="rps-bike"></div>
            </div>
            <div class="race-param-group">
              <div class="race-param-label">Tętno progowe</div>
              <div class="race-param-input-row">
                <input class="race-input" id="rp-bikeHR" type="number" value="${p.bikeHR}" min="100" max="220">
                <span class="race-input-unit">bpm</span>
              </div>
            </div>
          </div>
        </div>

        <div class="race-params-row">
          <div class="race-params-row-label">🏊 Pływanie</div>
          <div class="race-params-row-fields">
            <div class="race-param-group">
              <div class="race-param-label">Tempo progowe</div>
              <div class="race-param-input-row">
                <input class="race-input" id="rp-swimPace" type="text" value="${secToPace(p.swimPace)}" placeholder="1:44">
                <span class="race-input-unit">/100m</span>
              </div>
              <div class="race-param-source" id="rps-swim"></div>
            </div>
          </div>
        </div>

        <div class="race-params-row">
          <div class="race-params-row-label">🌡 Temperatura</div>
          <div class="race-params-row-fields">
            <div class="race-param-group race-param-group--wide">
              <div class="race-param-label">Temperatura startu</div>
              <select class="race-select" id="rp-temp">
                ${['poniżej 20 stopni','20-25 stopni','25-30 stopni','30-35 stopni','powyżej 35 stopni']
                  .map(v => `<option value="${v}"${v===p.temp?' selected':''}>${v}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="race-params-grid race-params-grid--times">
          <div class="race-param-group">
            <div class="race-param-label">Planowany czas 1/8 IM</div>
            <select class="race-select" id="rp-time18">
              ${["poniżej 1h20'","powyżej 1h20'"]
                .map(v => `<option value="${v}"${v===p.time18?' selected':''}>${v}</option>`).join('')}
            </select>
          </div>
          <div class="race-param-group">
            <div class="race-param-label">Planowany czas 1/4 IM</div>
            <select class="race-select" id="rp-time14">
              ${["poniżej 2h30'","powyżej 2h30'"]
                .map(v => `<option value="${v}"${v===p.time14?' selected':''}>${v}</option>`).join('')}
            </select>
          </div>
          <div class="race-param-group">
            <div class="race-param-label">Planowany czas 1/2 IM</div>
            <select class="race-select" id="rp-time12">
              ${['poniżej 4h','4-5h','5-6h','powyżej 6h']
                .map(v => `<option value="${v}"${v===p.time12?' selected':''}>${v}</option>`).join('')}
            </select>
          </div>
          <div class="race-param-group">
            <div class="race-param-label">Planowany czas IM</div>
            <select class="race-select" id="rp-timeIM">
              ${['poniżej 9h','9-10h','10-11h','11-12h','powyżej 12h']
                .map(v => `<option value="${v}"${v===p.timeIM?' selected':''}>${v}</option>`).join('')}
            </select>
          </div>
        </div>
        </div><!-- /race-params-body -->
      </div>

      <div id="race-results"></div>
    </div>
  `;

  // Pokaż źródła danych
  const run  = (zonesData.run  || []).filter(t => t.thresholdPace).slice(-1)[0];
  const bike = (zonesData.bike || []).filter(t => t.ftp).slice(-1)[0];
  const swim = (zonesData.swim || []).filter(t => t.thresholdPace).slice(-1)[0];
  if (run?.date)  document.getElementById('rps-run').textContent  = `z testu ${run.date}`;
  if (bike?.date) document.getElementById('rps-bike').textContent = `z testu ${bike.date}`;
  if (swim?.date) document.getElementById('rps-swim').textContent = `z testu ${swim.date}`;

  updateRaceResults();

  // Bind events
  const ids = ['rp-runPace','rp-runHR','rp-ftp','rp-bikeHR','rp-swimPace','rp-temp','rp-time18','rp-time14','rp-time12','rp-timeIM'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateRaceResults);
  });
}

function getRaceParamsFromForm() {
  const val = id => document.getElementById(id)?.value || '';
  return {
    runPace:  paceToSec(val('rp-runPace'))  || 278,
    runHR:    parseInt(val('rp-runHR'))      || 173,
    ftp:      parseInt(val('rp-ftp'))        || 260,
    bikeHR:   parseInt(val('rp-bikeHR'))     || 163,
    swimPace: paceToSec(val('rp-swimPace'))  || 104,
    runFTP:   0,
    time18:   val('rp-time18'),
    time14:   val('rp-time14'),
    time12:   val('rp-time12'),
    timeIM:   val('rp-timeIM'),
    temp:     val('rp-temp'),
  };
}

function updateRaceResults() {
  const p = getRaceParamsFromForm();
  const rows = calcRace(p);
  const container = document.getElementById('race-results');
  if (!container) return;

  const distOrder = ['5 km','10 km','21,1 km','42,2 km','1/8 IM','1/4 IM','1/2 IM','IM'];
  const distColors = {
    '5 km':    '#818cf8',
    '10 km':   '#818cf8',
    '21,1 km': '#4ade80',
    '42,2 km': '#4ade80',
    '1/8 IM':  '#fb923c',
    '1/4 IM':  '#fb923c',
    '1/2 IM':  '#38bdf8',
    'IM':      '#e879f9',
  };

  // Grupuj wiersze po dystansie
  const grouped = {};
  rows.forEach(r => {
    if (!grouped[r.dist]) grouped[r.dist] = [];
    grouped[r.dist].push(r);
  });

  let html = '';
  distOrder.forEach(dist => {
    if (!grouped[dist]) return;
    const color = distColors[dist] || '#999';
    const distRows = grouped[dist];

    html += `<div class="race-dist-block">
      <div class="race-dist-header" style="border-left-color:${color}">
        <span class="race-dist-name">${dist}</span>
      </div>
      <div class="race-rows">`;

    distRows.forEach(r => {
      const hasTemp = r.tempPaceFrom && r.sport !== 'pływanie';
      const tempLabel = p.temp === 'poniżej 20 stopni' ? '' : ` (${p.temp})`;

      html += `<div class="race-row">
        <div class="race-row-sport">
          <span class="race-row-icon">${r.icon}</span>
          <span class="race-row-sport-name">${r.sport}</span>
        </div>
        <div class="race-row-data">
          <div class="race-row-item">
            <span class="race-row-lbl">${r.paceLabel}</span>
            <span class="race-row-val">${r.paceFrom} – ${r.paceTo}</span>
          </div>
          <div class="race-row-item">
            <span class="race-row-lbl">tętno</span>
            <span class="race-row-val">${r.hrFrom} – ${r.hrTo} bpm</span>
          </div>
          <div class="race-row-item">
            <span class="race-row-lbl">intensywność</span>
            <span class="race-row-val race-intensity" style="color:${color}">${r.intensity}</span>
          </div>
          <div class="race-row-item">
            <span class="race-row-lbl">czas</span>
            <span class="race-row-val">${r.time}</span>
          </div>
        </div>
        ${hasTemp && p.temp !== 'poniżej 20 stopni' ? `
        <div class="race-row-temp">
          <span class="race-row-temp-label">🌡 temp${tempLabel}</span>
          <span class="race-row-temp-val">${r.tempPaceFrom}${r.tempPaceTo ? ' – ' + r.tempPaceTo : ''}</span>
        </div>` : ''}
      </div>`;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html;
}

function toggleRaceParams() {
  const body = document.getElementById('race-params-body');
  const icon = document.getElementById('race-params-icon');
  if (!body) return;
  const collapsed = body.classList.toggle('race-params-body--collapsed');
  icon.textContent = collapsed ? '▼' : '▲';
}

function initRace() {
  renderRace();
}
