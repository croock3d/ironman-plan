// ============================================================
// BREATH SCREEN — PowerBreathe+ Training Tracker
// Protokół 3-fazowy: Kalibracja → Siła → Utrzymanie
// ============================================================

// ---- Konfiguracja protokołu ----
const BREATH_PROTOCOL = {
  phases: [
    {
      label: 'Faza 1',
      name: 'Kalibracja',
      weeks: '1–2',
      daysRequired: 14,       // dni z min. 1 sesją
      sessionsPerDay: 2,      // rano + wieczór
      resistanceMin: 2,
      resistanceMax: 3,
      breathsTarget: 30,
      desc: 'Nauka techniki i kalibracja oporu. Skup się na mocnym, szybkim wdechu.',
      tip: 'Jeśli nie możesz zrobić 30 naraz — dziel na serie po 10–15.',
    },
    {
      label: 'Faza 2',
      name: 'Budowanie siły',
      weeks: '3–6',
      daysRequired: 28,       // dni z min. 1 sesją
      sessionsPerDay: 2,
      resistanceMin: 3,
      resistanceMax: 7,
      breathsTarget: 30,
      desc: 'Główna praca siłowa. Co 3–4 dni gdy idzie swobodnie — dokręć o ¼ obrotu.',
      tip: 'Cel: poziom 6–7 do końca tej fazy.',
    },
    {
      label: 'Faza 3',
      name: 'Utrzymanie',
      weeks: '7–12',
      daysRequired: null,     // brak sztywnego wymogu
      sessionsPerDay: null,   // 3–4×/tydzień
      resistanceMin: 7,
      resistanceMax: 9,
      breathsTarget: 30,
      desc: 'Mięśnie oddechowe są silne. 3–4 sesje/tydz, utrzymaj opór 7–9.',
      tip: 'Zostaw 1–2 dni bez PowerBreathe przed kluczowymi treningami biegowymi.',
    },
  ],
};

// ---- Stan rozwinięcia formularza ----
let breathFormOpen = null;   // null | 'morning' | 'evening' | 'free'

// ---- Stan przeglądanej fazy (null = aktywna) ----
let breathViewPhase = null;  // null | 0 | 1 | 2

// ============================================================
// HELPERS
// ============================================================

function breathTodayStr() {
  return new Date().toLocaleDateString('pl-PL');
}

function breathDateToISO(plDate) {
  // "31.03.2026" → "2026-03-31"
  const [d, m, y] = plDate.split('.');
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

function breathISOToDisplay(iso) {
  // "2026-03-31" → "31.03.2026"
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function breathDayName(plDate) {
  const iso = breathDateToISO(plDate);
  const d = new Date(iso);
  const names = ['ND','PN','WT','ŚR','CZ','PT','SB'];
  return names[d.getDay()];
}

function breathGetTodaySessions() {
  const today = breathTodayStr();
  return breathData.sessions.filter(s => s.date === today);
}

// ---- Oblicz postęp protokołu ----
function breathGetPhaseInfo() {
  if (!breathData.startDate || breathData.sessions.length === 0) {
    return {
      phaseIdx: 0,
      phase: BREATH_PROTOCOL.phases[0],
      completedDays: 0,
      daysRequired: BREATH_PROTOCOL.phases[0].daysRequired,
      weekNumber: 1,
      totalSessions: 0,
      recommendedResistance: BREATH_PROTOCOL.phases[0].resistanceMin,
      shouldIncrease: false,
    };
  }

  // Zbierz unikalne dni z sesjami, posortowane
  const allDates = [...new Set(breathData.sessions.map(s => s.date))].sort((a, b) => {
    return breathDateToISO(a).localeCompare(breathDateToISO(b));
  });

  // Faza 1: pierwsze 14 dni z sesjami
  const phase1Days = allDates.slice(0, BREATH_PROTOCOL.phases[0].daysRequired);
  const phase1Done = phase1Days.length;

  let phaseIdx = 0;
  let completedDays = phase1Done;

  if (phase1Done >= BREATH_PROTOCOL.phases[0].daysRequired) {
    phaseIdx = 1;
    // Dni w fazie 2 = kolejne 28 zaliczonych dni
    const phase2Days = allDates.slice(BREATH_PROTOCOL.phases[0].daysRequired,
      BREATH_PROTOCOL.phases[0].daysRequired + BREATH_PROTOCOL.phases[1].daysRequired);
    completedDays = phase2Days.length;

    if (phase2Days.length >= BREATH_PROTOCOL.phases[1].daysRequired) {
      phaseIdx = 2;
      completedDays = allDates.length - BREATH_PROTOCOL.phases[0].daysRequired
        - BREATH_PROTOCOL.phases[1].daysRequired;
    }
  }

  const phase = BREATH_PROTOCOL.phases[phaseIdx];
  const weekNumber = Math.min(Math.floor(completedDays / 7) + 1, phaseIdx === 2 ? 6 : phase.weeks.split('–').map(Number)[1] - phase.weeks.split('–').map(Number)[0] + 1);

  // Zalecany opór — na podstawie ostatnich sesji
  const last5 = breathData.sessions.slice(-5);
  const lastResistance = last5.length > 0 ? last5[last5.length - 1].resistance : phase.resistanceMin;

  let recommendedResistance = Math.max(phase.resistanceMin, Math.min(lastResistance, phase.resistanceMax));
  let shouldIncrease = false;

  if (phaseIdx === 1) {
    // Faza 2: jeśli ostatnie 3 sesje miały ≥30 oddechów, zasugeruj +1
    const last3 = breathData.sessions.slice(-3);
    if (last3.length === 3 && last3.every(s => s.breaths >= 30)) {
      const nextRes = Math.min(lastResistance + 1, phase.resistanceMax);
      if (nextRes > lastResistance) {
        recommendedResistance = nextRes;
        shouldIncrease = true;
      }
    }
  }

  return {
    phaseIdx,
    phase,
    completedDays: Math.max(0, completedDays),
    daysRequired: phase.daysRequired,
    weekNumber,
    totalSessions: breathData.sessions.length,
    recommendedResistance,
    shouldIncrease,
    lastResistance,
  };
}

// ---- Sprawdź czy dana pora już zalogowana dzisiaj ----
function breathIsTimeDone(time) {
  return breathGetTodaySessions().some(s => s.time === time);
}

// ---- Pobierz sesję z danej pory z dziś ----
function breathGetTodaySession(time) {
  return breathGetTodaySessions().find(s => s.time === time) || null;
}

// ============================================================
// SAVE / DELETE
// ============================================================

function saveBreathSession(session) {
  if (!breathData.startDate) {
    breathData.startDate = breathDateToISO(session.date);
  }
  breathData.sessions.push(session);
  saveToStorage();
  syncToGist();
  breathFormOpen = null;
  renderBreath();
  showToast('💨 Sesja zapisana');
}

function deleteBreathSession(idx) {
  showConfirm({
    title: 'Usuń sesję?',
    message: 'Tej operacji nie można cofnąć.',
    confirmLabel: 'Usuń',
    danger: true,
    onConfirm: () => {
      breathData.sessions.splice(idx, 1);
      // Zresetuj startDate jeśli brak sesji
      if (breathData.sessions.length === 0) {
        breathData.startDate = null;
      }
      saveToStorage();
      syncToGist();
      renderBreath();
      showToast('🗑️ Sesja usunięta');
    }
  });
}

// ============================================================
// MAIN RENDER
// ============================================================

function renderBreath() {
  const screen = document.getElementById('screen-breath');
  if (!screen) return;
  screen.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'breath-screen';

  const info = breathGetPhaseInfo();
  const activePhaseIdx = info.phaseIdx;

  // Jeśli breathViewPhase nie ustawione — pokaż aktywną
  const viewIdx = breathViewPhase !== null ? breathViewPhase : activePhaseIdx;

  // Tabs fazowe
  wrap.appendChild(buildBreathPhaseTabs(viewIdx, activePhaseIdx));

  // Info-box z opisem wybranej fazy
  wrap.appendChild(buildBreathPhaseInfo(viewIdx, activePhaseIdx, info));

  // Dashboard + checklista + historia — tylko dla aktywnej fazy
  if (viewIdx === activePhaseIdx) {
    wrap.appendChild(buildBreathDashboard());
    wrap.appendChild(buildBreathChecklist());
    wrap.appendChild(buildBreathHistory());
  } else {
    wrap.appendChild(buildBreathPhasePreview(viewIdx, activePhaseIdx));
  }

  screen.appendChild(wrap);
}

// ============================================================
// PHASE TABS
// ============================================================

function buildBreathPhaseTabs(viewIdx, activePhaseIdx) {
  const tabs = document.createElement('div');
  tabs.className = 'phase-tabs';

  BREATH_PROTOCOL.phases.forEach((p, i) => {
    const btn = document.createElement('button');
    const isActive = i === activePhaseIdx;
    const isViewing = i === viewIdx;

    btn.className = 'phase-tab' + (isViewing ? ' active' : '');

    // Jeśli to aktywna faza — dodaj znacznik
    const marker = isActive ? ' ✦' : '';
    btn.textContent = `${p.label} · ${p.name}${marker}`;

    btn.addEventListener('click', () => {
      breathViewPhase = i;
      breathFormOpen = null;
      renderBreath();
    });

    tabs.appendChild(btn);
  });

  return tabs;
}

// ============================================================
// PHASE INFO BOX
// ============================================================

function buildBreathPhaseInfo(viewIdx, activePhaseIdx, activeInfo) {
  const p = BREATH_PROTOCOL.phases[viewIdx];
  const isActive = viewIdx === activePhaseIdx;

  const box = document.createElement('div');
  box.className = 'phase-info breath-phase-info';

  const sessionsLabel = p.sessionsPerDay
    ? `${p.sessionsPerDay}× dziennie`
    : '3–4× tygodniowo';

  const resistanceLabel = `${p.resistanceMin}–${p.resistanceMax}`;

  let statusHtml = '';
  if (isActive) {
    statusHtml = `<span class="breath-pi-status active">▶ aktywna</span>`;
  } else if (viewIdx < activePhaseIdx) {
    statusHtml = `<span class="breath-pi-status done">✓ ukończona</span>`;
  } else {
    statusHtml = `<span class="breath-pi-status upcoming">○ nadchodząca</span>`;
  }

  box.innerHTML = `
    <div class="breath-pi-header">
      <strong>${p.label} — ${p.name}</strong>
      <span class="breath-pi-weeks">Tygodnie ${p.weeks}</span>
      ${statusHtml}
    </div>
    <div class="breath-pi-desc">${p.desc}</div>
    <div class="breath-pi-chips">
      <span class="breath-pi-chip">🕐 ${sessionsLabel}</span>
      <span class="breath-pi-chip">⚙️ Opór ${resistanceLabel}</span>
      <span class="breath-pi-chip">💨 ${p.breathsTarget} oddechów</span>
      ${p.daysRequired ? `<span class="breath-pi-chip">📅 ${p.daysRequired} dni</span>` : ''}
    </div>
    <div class="breath-pi-tip">💡 ${p.tip}</div>
  `;

  return box;
}

// ============================================================
// PODGLĄD FAZY (nieaktywnej)
// ============================================================

function buildBreathPhasePreview(viewIdx, activePhaseIdx) {
  const wrap = document.createElement('div');
  wrap.className = 'breath-preview-wrap';

  if (viewIdx < activePhaseIdx) {
    // Faza ukończona — pokaż statystyki z tego okresu
    const allDates = [...new Set(breathData.sessions.map(s => s.date))].sort((a, b) =>
      breathDateToISO(a).localeCompare(breathDateToISO(b))
    );

    let phaseDates = [];
    if (viewIdx === 0) {
      phaseDates = allDates.slice(0, BREATH_PROTOCOL.phases[0].daysRequired);
    } else if (viewIdx === 1) {
      phaseDates = allDates.slice(
        BREATH_PROTOCOL.phases[0].daysRequired,
        BREATH_PROTOCOL.phases[0].daysRequired + BREATH_PROTOCOL.phases[1].daysRequired
      );
    }

    const phaseSessions = breathData.sessions.filter(s => phaseDates.includes(s.date));
    const totalBreaths = phaseSessions.reduce((acc, s) => acc + s.breaths, 0);
    const maxResist = phaseSessions.length > 0 ? Math.max(...phaseSessions.map(s => s.resistance)) : '—';
    const firstDate = phaseDates[0] || '—';
    const lastDate  = phaseDates[phaseDates.length - 1] || '—';

    const statsEl = document.createElement('div');
    statsEl.className = 'breath-preview-stats';
    statsEl.innerHTML = `
      <div class="breath-preview-label">Statystyki ukończonej fazy</div>
      <div class="breath-preview-grid">
        <div class="breath-prev-stat">
          <div class="breath-prev-val">${phaseSessions.length}</div>
          <div class="breath-prev-key">sesji</div>
        </div>
        <div class="breath-prev-stat">
          <div class="breath-prev-val">${phaseDates.length}</div>
          <div class="breath-prev-key">dni</div>
        </div>
        <div class="breath-prev-stat">
          <div class="breath-prev-val">${maxResist}</div>
          <div class="breath-prev-key">max opór</div>
        </div>
        <div class="breath-prev-stat">
          <div class="breath-prev-val">${totalBreaths}</div>
          <div class="breath-prev-key">oddechów</div>
        </div>
      </div>
      ${firstDate !== '—' ? `<div class="breath-prev-range">${firstDate} — ${lastDate}</div>` : ''}
    `;
    wrap.appendChild(statsEl);

    // Historia sesji z tej fazy
    if (phaseSessions.length > 0) {
      const histLabel = document.createElement('div');
      histLabel.className = 'breath-section-header';
      histLabel.style.marginTop = '4px';
      histLabel.innerHTML = `<span class="breath-section-title">Sesje z tej fazy</span><span class="breath-history-count">${phaseSessions.length}</span>`;
      wrap.appendChild(histLabel);

      const sorted = phaseSessions
        .map((s, _) => ({ ...s, _origIdx: breathData.sessions.indexOf(s) }))
        .reverse();

      const byDate = {};
      sorted.forEach(s => {
        if (!byDate[s.date]) byDate[s.date] = [];
        byDate[s.date].push(s);
      });

      const histWrap = document.createElement('div');
      histWrap.className = 'breath-history-section';
      histWrap.style.gap = '8px';

      Object.entries(byDate).forEach(([date, sessions]) => {
        const dayGroup = document.createElement('div');
        dayGroup.className = 'breath-history-day';
        const dayHeader = document.createElement('div');
        dayHeader.className = 'breath-history-day-header';
        dayHeader.textContent = `${breathDayName(date)}, ${date}`;
        dayGroup.appendChild(dayHeader);
        sessions.forEach(s => dayGroup.appendChild(buildHistoryItem(s, s._origIdx)));
        histWrap.appendChild(dayGroup);
      });

      wrap.appendChild(histWrap);
    }

  } else {
    // Faza nadchodząca
    const upcoming = document.createElement('div');
    upcoming.className = 'breath-preview-upcoming';
    const prevPhase = BREATH_PROTOCOL.phases[viewIdx - 1];
    upcoming.innerHTML = `
      <div class="breath-upcoming-icon">🔒</div>
      <div class="breath-upcoming-title">Faza jeszcze nieaktywna</div>
      <div class="breath-upcoming-desc">
        Ukończ ${prevPhase ? prevPhase.label + ' (' + prevPhase.name + ')' : 'poprzednią fazę'} aby odblokować tę fazę.
      </div>
    `;
    wrap.appendChild(upcoming);
  }

  return wrap;
}

// ============================================================
// DASHBOARD — karta statusu fazy
// ============================================================

function buildBreathDashboard() {
  const info = breathGetPhaseInfo();
  const { phase, phaseIdx, completedDays, daysRequired, weekNumber, totalSessions, recommendedResistance, shouldIncrease, lastResistance } = info;

  const card = document.createElement('div');
  card.className = 'breath-dashboard';

  // Nagłówek: tydzień
  const header = document.createElement('div');
  header.className = 'breath-dash-header';

  const weekBadge = document.createElement('div');
  weekBadge.className = 'breath-week-badge';
  weekBadge.textContent = `TYDZIEŃ ${weekNumber}`;

  const todayLabel = document.createElement('div');
  todayLabel.className = 'breath-dash-today';
  todayLabel.textContent = breathTodayStr();

  header.appendChild(weekBadge);
  header.appendChild(todayLabel);
  card.appendChild(header);

  // Pasek postępu (tylko dla faz 1 i 2)
  if (daysRequired !== null) {
    const progressWrap = document.createElement('div');
    progressWrap.className = 'breath-progress-wrap';

    const progressLabel = document.createElement('div');
    progressLabel.className = 'breath-progress-label';
    progressLabel.innerHTML = `<span>Postęp fazy</span><span class="breath-progress-count">${completedDays} / ${daysRequired} dni</span>`;

    const progressTrack = document.createElement('div');
    progressTrack.className = 'breath-progress-track';

    const progressFill = document.createElement('div');
    progressFill.className = 'breath-progress-fill';
    const pct = daysRequired > 0 ? Math.min(100, Math.round((completedDays / daysRequired) * 100)) : 100;
    progressFill.style.width = pct + '%';

    progressTrack.appendChild(progressFill);
    progressWrap.appendChild(progressLabel);
    progressWrap.appendChild(progressTrack);
    card.appendChild(progressWrap);
  } else {
    // Faza 3 — licznik sesji ogółem
    const progressWrap = document.createElement('div');
    progressWrap.className = 'breath-progress-wrap';
    const progressLabel = document.createElement('div');
    progressLabel.className = 'breath-progress-label';
    progressLabel.innerHTML = `<span>Sesje łącznie</span><span class="breath-progress-count">${totalSessions}</span>`;
    progressWrap.appendChild(progressLabel);
    card.appendChild(progressWrap);
  }

  // Dolna sekcja: opór + ostatnia sesja
  const statsRow = document.createElement('div');
  statsRow.className = 'breath-stats-row';

  // Kołko z oporem
  const resistCol = document.createElement('div');
  resistCol.className = 'breath-resist-col';

  const resistCircle = document.createElement('div');
  resistCircle.className = 'breath-resist-circle';
  resistCircle.textContent = recommendedResistance;

  const resistLabel = document.createElement('div');
  resistLabel.className = 'breath-resist-label';

  if (shouldIncrease) {
    resistCircle.classList.add('increase');
    resistLabel.innerHTML = `Zwiększ do <strong>${recommendedResistance}</strong>`;
  } else {
    resistLabel.textContent = 'Zalecany opór';
  }

  resistCol.appendChild(resistCircle);
  resistCol.appendChild(resistLabel);
  statsRow.appendChild(resistCol);

  // Ostatnia sesja
  const lastCol = document.createElement('div');
  lastCol.className = 'breath-last-col';

  if (breathData.sessions.length > 0) {
    const last = breathData.sessions[breathData.sessions.length - 1];
    const timeLabel = last.time === 'morning' ? 'Rano' : last.time === 'evening' ? 'Wieczór' : 'Sesja';
    const isToday = last.date === breathTodayStr();
    const dayStr = isToday ? 'dzisiaj' : `${breathDayName(last.date)} ${last.date}`;

    lastCol.innerHTML = `
      <div class="breath-last-title">Ostatnia sesja</div>
      <div class="breath-last-stats">
        <span class="breath-last-resistance">Opór ${last.resistance}</span>
        <span class="breath-last-dot">·</span>
        <span class="breath-last-breaths">${last.breaths} oddechów</span>
      </div>
      <div class="breath-last-when">${dayStr} · ${timeLabel}</div>
      ${last.note ? `<div class="breath-last-note">"${last.note}"</div>` : ''}
    `;
  } else {
    lastCol.innerHTML = `
      <div class="breath-last-title">Ostatnia sesja</div>
      <div class="breath-last-empty">Brak sesji — zacznij dziś!</div>
    `;
  }

  statsRow.appendChild(lastCol);
  card.appendChild(statsRow);

  // Wskazówka
  const tip = document.createElement('div');
  tip.className = 'breath-tip';
  tip.innerHTML = `<span class="breath-tip-icon">💡</span>${phase.tip}`;
  card.appendChild(tip);

  return card;
}

// ============================================================
// CHECKLISTA DNIA
// ============================================================

function buildBreathChecklist() {
  const info = breathGetPhaseInfo();
  const { phaseIdx } = info;

  const section = document.createElement('div');
  section.className = 'breath-checklist-section';

  // Nagłówek sekcji z dniem tygodnia
  const dayNames = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
  const today = new Date();
  const todayName = dayNames[today.getDay()];

  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'breath-section-header';
  sectionHeader.innerHTML = `<span class="breath-section-title">Dzisiaj</span><span class="breath-section-day">${todayName.toUpperCase()}</span>`;
  section.appendChild(sectionHeader);

  const checklist = document.createElement('div');
  checklist.className = 'breath-checklist';

  if (phaseIdx < 2) {
    // Faza 1 i 2: rano + wieczór
    checklist.appendChild(buildCheckItem('morning', 'Rano', '🌅'));
    checklist.appendChild(buildCheckItem('evening', 'Wieczór', '🌙'));
  } else {
    // Faza 3: luźna — jeden przycisk "Dodaj sesję"
    const freeItem = buildCheckItem('free', 'Sesja', '💨');
    checklist.appendChild(freeItem);
  }

  section.appendChild(checklist);
  return section;
}

function buildCheckItem(time, label, icon) {
  const todaySession = breathGetTodaySession(time);
  const isDone = !!todaySession;
  const isOpen = breathFormOpen === time;

  const item = document.createElement('div');
  item.className = 'breath-check-item' + (isDone ? ' done' : '') + (isOpen ? ' open' : '');

  // Górna linia: checkbox + status
  const topRow = document.createElement('div');
  topRow.className = 'breath-check-top';

  const checkBtn = document.createElement('button');
  checkBtn.className = 'breath-check-btn' + (isDone ? ' checked' : '');
  checkBtn.setAttribute('aria-label', isDone ? `${label} - wykonano` : `${label} - dodaj sesję`);

  const checkInner = document.createElement('span');
  checkInner.className = 'breath-check-inner';
  checkInner.textContent = isDone ? '✓' : '';
  checkBtn.appendChild(checkInner);

  const checkInfo = document.createElement('div');
  checkInfo.className = 'breath-check-info';

  const checkLabel = document.createElement('div');
  checkLabel.className = 'breath-check-label';
  checkLabel.innerHTML = `<span class="breath-check-icon">${icon}</span>${label}`;

  checkInfo.appendChild(checkLabel);

  if (isDone) {
    const checkMeta = document.createElement('div');
    checkMeta.className = 'breath-check-meta';
    checkMeta.innerHTML = `<span class="breath-meta-resist">Opór ${todaySession.resistance}</span><span class="breath-meta-dot">·</span><span class="breath-meta-breaths">${todaySession.breaths} oddechów</span>${todaySession.note ? `<span class="breath-meta-dot">·</span><span class="breath-meta-note">${todaySession.note}</span>` : ''}`;
    checkInfo.appendChild(checkMeta);
  } else {
    const checkHint = document.createElement('div');
    checkHint.className = 'breath-check-hint';
    checkHint.textContent = 'Dotknij aby zalogować';
    checkInfo.appendChild(checkHint);
  }

  const chevron = document.createElement('span');
  chevron.className = 'breath-check-chevron';
  chevron.textContent = isOpen ? '▲' : (isDone ? '▼' : '▶');

  topRow.appendChild(checkBtn);
  topRow.appendChild(checkInfo);
  topRow.appendChild(chevron);
  item.appendChild(topRow);

  // Kliknięcie w całą górną linię — otwiera/zamyka formularz
  topRow.style.cursor = 'pointer';
  topRow.addEventListener('click', () => {
    breathFormOpen = isOpen ? null : time;
    renderBreath();
  });

  // Formularz (rozwinięty)
  if (isOpen) {
    item.appendChild(buildBreathLogForm(time));
  }

  return item;
}

// ============================================================
// FORMULARZ LOGOWANIA
// ============================================================

function buildBreathLogForm(time) {
  const info = breathGetPhaseInfo();
  const { recommendedResistance, phase } = info;

  // Predefaultuj na zalecany opór lub ostatnio użyty
  const todaySessions = breathGetTodaySessions();
  const lastSession = breathData.sessions.length > 0
    ? breathData.sessions[breathData.sessions.length - 1]
    : null;
  const defaultResistance = lastSession ? lastSession.resistance : recommendedResistance;
  const defaultBreaths = phase.breathsTarget || 30;

  const form = document.createElement('div');
  form.className = 'breath-log-form';
  form.id = 'breath-form-' + time;

  // ---- Opór ----
  const resistSection = document.createElement('div');
  resistSection.className = 'breath-form-section';

  const resistLabel = document.createElement('div');
  resistLabel.className = 'breath-form-label';
  resistLabel.textContent = 'Opór (1–10)';
  resistSection.appendChild(resistLabel);

  const resistPicker = document.createElement('div');
  resistPicker.className = 'breath-resist-picker';
  resistPicker.id = 'resist-picker-' + time;

  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className = 'breath-resist-btn' + (i === defaultResistance ? ' selected' : '');
    btn.textContent = i;
    btn.dataset.value = i;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      resistPicker.querySelectorAll('.breath-resist-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    resistPicker.appendChild(btn);
  }

  resistSection.appendChild(resistPicker);
  form.appendChild(resistSection);

  // ---- Oddechy ----
  const breathsSection = document.createElement('div');
  breathsSection.className = 'breath-form-section';

  const breathsLabel = document.createElement('div');
  breathsLabel.className = 'breath-form-label';
  breathsLabel.textContent = 'Liczba oddechów';
  breathsSection.appendChild(breathsLabel);

  const breathsControl = document.createElement('div');
  breathsControl.className = 'breath-breaths-control';

  const minusBtn = document.createElement('button');
  minusBtn.className = 'breath-stepper-btn';
  minusBtn.textContent = '−';
  minusBtn.setAttribute('aria-label', 'Mniej oddechów');

  const breathsInput = document.createElement('input');
  breathsInput.type = 'number';
  breathsInput.className = 'breath-breaths-input';
  breathsInput.id = 'breaths-input-' + time;
  breathsInput.value = defaultBreaths;
  breathsInput.min = 1;
  breathsInput.max = 100;

  const plusBtn = document.createElement('button');
  plusBtn.className = 'breath-stepper-btn';
  plusBtn.textContent = '+';
  plusBtn.setAttribute('aria-label', 'Więcej oddechów');

  minusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const v = parseInt(breathsInput.value) || 30;
    if (v > 1) breathsInput.value = v - 1;
  });

  plusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const v = parseInt(breathsInput.value) || 30;
    if (v < 100) breathsInput.value = v + 1;
  });

  breathsControl.appendChild(minusBtn);
  breathsControl.appendChild(breathsInput);
  breathsControl.appendChild(plusBtn);
  breathsSection.appendChild(breathsControl);
  form.appendChild(breathsSection);

  // ---- Notatka ----
  const noteSection = document.createElement('div');
  noteSection.className = 'breath-form-section';

  const noteLabel = document.createElement('div');
  noteLabel.className = 'breath-form-label';
  noteLabel.textContent = 'Notatka (opcjonalnie)';
  noteSection.appendChild(noteLabel);

  const noteInput = document.createElement('textarea');
  noteInput.className = 'breath-note-input field-textarea';
  noteInput.id = 'note-input-' + time;
  noteInput.placeholder = 'Jak poszło? Zmiany, odczucia...';
  noteInput.rows = 2;
  noteSection.appendChild(noteInput);
  form.appendChild(noteSection);

  // ---- Przyciski ----
  const formActions = document.createElement('div');
  formActions.className = 'breath-form-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-small';
  cancelBtn.textContent = 'Anuluj';
  cancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    breathFormOpen = null;
    renderBreath();
  });

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-small success';
  saveBtn.textContent = '💾 Zapisz sesję';
  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    const selectedResist = resistPicker.querySelector('.breath-resist-btn.selected');
    const resistance = selectedResist ? parseInt(selectedResist.dataset.value) : defaultResistance;
    const breaths = parseInt(breathsInput.value) || defaultBreaths;
    const note = noteInput.value.trim();

    const session = {
      date: breathTodayStr(),
      time,
      resistance,
      breaths,
      note,
    };

    saveBreathSession(session);
  });

  formActions.appendChild(cancelBtn);
  formActions.appendChild(saveBtn);
  form.appendChild(formActions);

  // Zapobiegaj propagacji kliknięć z formularza
  form.addEventListener('click', e => e.stopPropagation());

  return form;
}

// ============================================================
// HISTORIA SESJI
// ============================================================

function buildBreathHistory() {
  const section = document.createElement('div');
  section.className = 'breath-history-section';

  const header = document.createElement('div');
  header.className = 'breath-section-header';
  header.innerHTML = `<span class="breath-section-title">Historia</span><span class="breath-history-count">${breathData.sessions.length} sesji</span>`;
  section.appendChild(header);

  if (breathData.sessions.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'breath-history-empty';
    empty.innerHTML = `<span>Brak sesji — zacznij trenować!</span>`;
    section.appendChild(empty);
    return section;
  }

  // Posortowane malejąco: najnowsze na górze
  const sorted = breathData.sessions
    .map((s, idx) => ({ ...s, _origIdx: idx }))
    .slice()
    .reverse();

  // Grupuj po dacie
  const byDate = {};
  sorted.forEach(s => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  Object.entries(byDate).forEach(([date, sessions]) => {
    const dayGroup = document.createElement('div');
    dayGroup.className = 'breath-history-day';

    const dayHeader = document.createElement('div');
    dayHeader.className = 'breath-history-day-header';
    dayHeader.textContent = `${breathDayName(date)}, ${date}`;
    dayGroup.appendChild(dayHeader);

    sessions.forEach(s => {
      dayGroup.appendChild(buildHistoryItem(s, s._origIdx));
    });

    section.appendChild(dayGroup);
  });

  return section;
}

function buildHistoryItem(session, origIdx) {
  const timeLabel = session.time === 'morning' ? 'Rano' : session.time === 'evening' ? 'Wieczór' : 'Sesja';
  const timeClass = session.time === 'morning' ? 'morning' : session.time === 'evening' ? 'evening' : 'free';

  const item = document.createElement('div');
  item.className = 'breath-history-item';

  const left = document.createElement('div');
  left.className = 'breath-history-left';

  const timeBadge = document.createElement('span');
  timeBadge.className = `breath-time-badge ${timeClass}`;
  timeBadge.textContent = timeLabel;
  left.appendChild(timeBadge);

  const stats = document.createElement('div');
  stats.className = 'breath-history-stats';

  const resistStat = document.createElement('span');
  resistStat.className = 'breath-hist-resist';
  resistStat.textContent = `Opór ${session.resistance}`;

  const sep = document.createElement('span');
  sep.className = 'breath-hist-sep';
  sep.textContent = '·';

  const breathsStat = document.createElement('span');
  breathsStat.className = 'breath-hist-breaths';
  breathsStat.textContent = `${session.breaths} oddechów`;

  stats.appendChild(resistStat);
  stats.appendChild(sep);
  stats.appendChild(breathsStat);
  left.appendChild(stats);

  if (session.note) {
    const noteLine = document.createElement('div');
    noteLine.className = 'breath-hist-note';
    noteLine.textContent = session.note;
    left.appendChild(noteLine);
  }

  const right = document.createElement('div');
  right.className = 'breath-history-right';

  const delBtn = document.createElement('button');
  delBtn.className = 'breath-del-btn';
  delBtn.setAttribute('aria-label', 'Usuń sesję');
  delBtn.textContent = '🗑';
  delBtn.addEventListener('click', () => deleteBreathSession(origIdx));
  right.appendChild(delBtn);

  item.appendChild(left);
  item.appendChild(right);

  return item;
}
