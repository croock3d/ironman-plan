// ============================================================
// LOG SCREEN — v2
// Stany: 'idle' | 'active' (trening) | 'editing' (edycja historycznego wpisu)
// ============================================================

// ---- Stan aktywnego treningu ----
// Persystuje w localStorage ('ironman_active') przy każdej zmianie.
// Odtwarzany przy starcie jeśli sesja była niezakończona.
let activeWorkout = null;
// Struktura activeWorkout:
// {
//   phaseIdx: number,
//   dayIdx:   number,
//   startedAt: string (ISO),
//   warmupChecked: Set<number>,   // indeksy zaznaczonych ćw. rozgrzewki
//   sets: {
//     [exIdx]: [ { kg: string, reps: string, done: bool }, ... ]
//   }
// }

// ---- Stan edycji historycznego wpisu ----
let editingEntryIdx = null;  // indeks w sessionLog[]

// ============================================================
// AUTOSAVE — zapis/odczyt aktywnego treningu w localStorage
// ============================================================
function persistActiveWorkout() {
  if (activeWorkout) {
    const toSave = {
      ...activeWorkout,
      warmupChecked: [...activeWorkout.warmupChecked]  // Set → Array
    };
    localStorage.setItem('ironman_active', JSON.stringify(toSave));
  } else {
    localStorage.removeItem('ironman_active');
  }
}

function loadActiveWorkout() {
  try {
    const raw = localStorage.getItem('ironman_active');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    parsed.warmupChecked = new Set(parsed.warmupChecked || []);
    return parsed;
  } catch (e) {
    localStorage.removeItem('ironman_active');
    return null;
  }
}

// ============================================================
// MAIN RENDER
// ============================================================
function renderLog() {
  const screen = document.getElementById('screen-log');
  if (!screen) return;
  screen.innerHTML = '';

  if (activeWorkout) {
    renderActiveWorkout(screen);
  } else if (editingEntryIdx !== null) {
    renderEditEntry(screen, editingEntryIdx);
  } else {
    renderIdleLog(screen);
  }
}

// ============================================================
// IDLE — ekran startowy
// ============================================================
function renderIdleLog(container) {
  const wrap = document.createElement('div');
  wrap.className = 'log-screen';

  // --- Baner odzyskiwania niezakończonego treningu ---
  const recovered = loadActiveWorkout();
  if (recovered) {
    wrap.appendChild(buildRecoveryBanner(recovered));
    wrap.appendChild(buildHistory());
    container.appendChild(wrap);
    return;
  }

  // --- Dzień tygodnia ---
  const todayData = getTodayTraining();
  const dayNames = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
  const jsDay = new Date().getDay(); // 0=ND
  const todayName = dayNames[jsDay];

  const todayBar = document.createElement('div');
  todayBar.className = 'log-today-bar';
  todayBar.innerHTML = `
    <span class="log-today-label">Dzisiaj</span>
    <span class="log-today-day">${todayName.toUpperCase()}</span>
  `;
  wrap.appendChild(todayBar);

  // --- Karta sugestii lub karta odpoczynku ---
  if (todayData) {
    wrap.appendChild(buildSuggestCard(todayData));
  } else {
    wrap.appendChild(buildRestCard());
  }

  // --- Picker "wybierz inny trening" ---
  wrap.appendChild(buildPicker());

  // --- Historia sesji ---
  wrap.appendChild(buildHistory());

  container.appendChild(wrap);
}

// Znajdź dzisiejszy trening na podstawie weekBar i aktywnej fazy
function getTodayTraining() {
  const jsDay = new Date().getDay(); // 0=ND,1=PN,...,6=SB
  // weekBar jest [PN,WT,ŚR,CZ,PT,SB,ND] → indeks 0..6
  const barIdx = (jsDay + 6) % 7;
  const barEntry = data.weekBar[barIdx];

  if (!barEntry || !barEntry.gym) return null;

  // Szukaj pasującego dnia w aktywnej fazie
  const phase = data.phases[currentPhase];
  if (!phase) return null;

  // Dopasowanie: środa → "środa", poniedziałek → "poniedzia", piątek → "piątek"
  const dayKeywords = {
    0: ['poniedzia', 'dzień a', 'sesja 1'],
    1: ['wtorek', 'dzień b'],
    2: ['środa', 'dzień b', 'sesja 2'],
    3: ['czwartek'],
    4: ['piątek', 'pt', 'dzień c', 'sesja 2'],
    5: ['sobota'],
    6: ['niedziela']
  };
  const barIdxForSearch = barIdx; // 0=PN...
  const keywords = dayKeywords[barIdxForSearch] || [];

  let matchedDayIdx = -1;
  for (let i = 0; i < phase.days.length; i++) {
    const lbl = phase.days[i].label.toLowerCase();
    if (keywords.some(k => lbl.includes(k))) {
      matchedDayIdx = i;
      break;
    }
  }

  if (matchedDayIdx === -1) {
    // Fallback: pierwsze ćwiczenie fazy
    matchedDayIdx = 0;
  }

  return {
    phaseIdx: currentPhase,
    dayIdx: matchedDayIdx,
    phase,
    day: phase.days[matchedDayIdx],
    barLabel: barEntry.label
  };
}

function buildSuggestCard(todayData) {
  const { phase, day, phaseIdx, dayIdx } = todayData;
  const warmupKey = day.warmup;
  const warmupTitle = data.warmups[warmupKey] ? data.warmups[warmupKey].title : '';
  const exCount = day.exercises.length;

  const card = document.createElement('div');
  card.className = 'log-suggest-card';
  card.innerHTML = `
    <div class="log-suggest-eyebrow">Sugerowany trening na dzis</div>
    <div class="log-suggest-name">${day.label}</div>
    <div class="log-suggest-focus">${day.focus}</div>
    <div class="log-suggest-meta">
      <span class="log-meta-chip">${exCount} ćwiczeń</span>
      ${warmupTitle ? `<span class="log-meta-chip">${warmupTitle}</span>` : ''}
      <span class="log-meta-chip">${phase.label}</span>
    </div>
    <button class="btn-start-workout" onclick="startWorkout(${phaseIdx}, ${dayIdx})">
      Rozpocznij trening
    </button>
    <button class="btn-pick-other" onclick="toggleLogPicker()">
      Wybierz inny trening
    </button>
  `;
  return card;
}

function buildRestCard() {
  const jsDay = new Date().getDay();
  const barIdx = (jsDay + 6) % 7;
  const barEntry = data.weekBar[barIdx];
  const actLabel = barEntry ? barEntry.label : 'odpoczynek';

  const card = document.createElement('div');
  card.className = 'log-rest-card';
  card.innerHTML = `
    <div class="log-rest-icon">🏊</div>
    <div class="log-rest-title">Dzisiaj: ${actLabel}</div>
    <div class="log-rest-sub">To nie jest dzień siłowni w planie.<br>Możesz jednak zalogować dowolny trening.</div>
    <button class="btn-pick-other" onclick="toggleLogPicker()">
      Wybierz trening ▾
    </button>
  `;
  return card;
}

function buildRecoveryBanner(recovered) {
  const phase = data.phases[recovered.phaseIdx];
  const day   = phase ? phase.days[recovered.dayIdx] : null;
  if (!phase || !day) {
    // Uszkodzone dane — wyczyść i wróć do normy
    localStorage.removeItem('ironman_active');
    return document.createDocumentFragment();
  }

  // Policz ile serii zaznaczono
  let doneSets = 0, totalSets = 0;
  Object.values(recovered.sets || {}).forEach(sArr => {
    totalSets += sArr.length;
    doneSets  += sArr.filter(s => s.done).length;
  });

  // Kiedy zaczęto
  let whenLabel = '';
  if (recovered.startedAt) {
    const d = new Date(recovered.startedAt);
    whenLabel = d.toLocaleString('pl-PL', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
  }

  const banner = document.createElement('div');
  banner.className = 'log-recovery-banner';
  banner.innerHTML = `
    <div class="log-recovery-icon">⚠️</div>
    <div class="log-recovery-title">Niezakończony trening</div>
    <div class="log-recovery-day">${day.label}</div>
    <div class="log-recovery-meta">
      ${whenLabel ? `<span>Rozpoczęty: ${whenLabel}</span>` : ''}
      <span>${doneSets}/${totalSets} serii zaznaczonych</span>
    </div>
    <div class="log-recovery-btns">
      <button class="btn-start-workout" onclick="resumeWorkout()">Wróć do treningu</button>
      <button class="btn-pick-other" style="color:var(--red);border-color:#4a1515;"
              onclick="discardRecovery()">Odrzuć</button>
    </div>
  `;
  return banner;
}

function buildPicker() {
  const picker = document.createElement('div');
  picker.className = 'log-picker';
  picker.id = 'log-picker';

  const phaseOpts = data.phases.map((p, i) =>
    `<option value="${i}"${i === currentPhase ? ' selected' : ''}>${p.label}</option>`
  ).join('');

  picker.innerHTML = `
    <div class="field-group">
      <div class="field-label">Faza</div>
      <select class="field-select" id="picker-phase" onchange="refreshPickerDays()">
        ${phaseOpts}
      </select>
    </div>
    <div class="field-group" style="margin-bottom:10px;">
      <div class="field-label">Dzień treningowy</div>
      <select class="field-select" id="picker-day"></select>
    </div>
    <button class="btn-start-workout" onclick="startWorkoutFromPicker()">
      Rozpocznij ten trening
    </button>
  `;
  return picker;
}

function buildHistory() {
  const frag = document.createDocumentFragment();

  const title = document.createElement('div');
  title.className = 'log-hist-title';
  title.textContent = sessionLog.length
    ? `Historia (${sessionLog.length} sesji)`
    : 'Historia';
  frag.appendChild(title);

  if (sessionLog.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'no-logs';
    empty.textContent = 'Brak wpisów. Zakończ pierwszy trening żeby zobaczyć historię.';
    frag.appendChild(empty);
    return frag;
  }

  [...sessionLog].reverse().forEach((entry, revIdx) => {
    const origIdx = sessionLog.length - 1 - revIdx;
    frag.appendChild(buildHistoryEntry(entry, origIdx));
  });

  return frag;
}

function buildHistoryEntry(entry, idx) {
  const card = document.createElement('div');
  card.className = 'log-entry';
  card.id = `log-entry-${idx}`;

  // Chipsy statystyk
  const doneRatio = `${entry.doneCount}/${entry.totalCount}`;
  const doneClass = entry.doneCount === entry.totalCount ? 'green' : '';
  let warmupChip = '';
  if (entry.warmupTotal != null) {
    warmupChip = `<span class="log-stat-chip">${entry.warmupDone != null ? entry.warmupDone.length : 0}/${entry.warmupTotal} rozgrzewka</span>`;
  }

  card.innerHTML = `
    <div class="log-entry-header" onclick="toggleHistoryEntry(${idx})">
      <div>
        <div class="log-entry-title">${entry.day}</div>
        <div class="log-entry-sub">${entry.phase}</div>
      </div>
      <div class="log-entry-right">
        <span class="log-entry-date">${entry.date}</span>
        <div class="log-entry-stats">
          ${warmupChip}
          <span class="log-stat-chip ${doneClass}">${doneRatio} ćw.</span>
        </div>
      </div>
    </div>
    <div class="log-entry-body">
      ${buildHistoryBody(entry)}
      <div class="log-entry-actions">
        <button class="btn-small success" onclick="startEditEntry(${idx})">Edytuj</button>
        <button class="btn-small danger" onclick="deleteEntry(${idx})">Usuń</button>
      </div>
    </div>
  `;
  return card;
}

function buildHistoryBody(entry) {
  let html = '';

  if (entry.note) {
    html += `<div class="log-entry-note">"${entry.note}"</div>`;
  }

  if (entry.exercises && entry.exercises.length > 0) {
    entry.exercises.forEach(ex => {
      html += `<div class="log-hist-ex-name">${ex.name}</div>`;
      html += `<div class="log-hist-sets">`;
      ex.sets.forEach((s, si) => {
        const kgLabel = s.kg != null && s.kg !== '' ? `${s.kg}kg` : 'bw';
        const label = `${si + 1}. ${kgLabel}×${s.reps || '—'}`;
        const cls = s.done ? 'done' : 'skipped';
        html += `<span class="log-hist-set-chip ${cls}">${label}</span>`;
      });
      html += `</div>`;
    });
  } else {
    // Stary format — tylko doneCount/totalCount
    html += `<div style="font-size:11px;color:var(--text3);">Ćwiczenia: ${entry.doneCount} / ${entry.totalCount} zaznaczonych</div>`;
  }

  return html;
}

// ============================================================
// PICKER helpers (wywoływane inline)
// ============================================================
function toggleLogPicker() {
  const picker = document.getElementById('log-picker');
  if (!picker) return;
  picker.classList.toggle('open');
  if (picker.classList.contains('open')) {
    refreshPickerDays();
  }
}

function refreshPickerDays() {
  const pi = parseInt(document.getElementById('picker-phase').value);
  const sel = document.getElementById('picker-day');
  if (!sel) return;
  sel.innerHTML = data.phases[pi].days
    .map((d, i) => `<option value="${i}">${d.label}</option>`)
    .join('');
}

function startWorkoutFromPicker() {
  const pi = parseInt(document.getElementById('picker-phase').value);
  const di = parseInt(document.getElementById('picker-day').value);
  startWorkout(pi, di);
}

// ============================================================
// START WORKOUT
// ============================================================
function startWorkout(phaseIdx, dayIdx) {
  const day = data.phases[phaseIdx].days[dayIdx];

  // Buduj strukturę serii na podstawie pola "sets" z danych
  const sets = {};
  day.exercises.forEach((ex, ei) => {
    const count = parseSetsCount(ex.sets);
    sets[ei] = Array.from({ length: count }, () => ({ kg: '', reps: '', done: false }));
  });

  activeWorkout = {
    phaseIdx,
    dayIdx,
    startedAt: new Date().toISOString(),
    warmupChecked: new Set(),
    sets
  };

  persistActiveWorkout();
  renderLog();
  window.scrollTo(0, 0);
}

// Parsuje "4×8", "3×12/stronę", "3×20 sek./stronę" → liczba serii
function parseSetsCount(setsStr) {
  if (!setsStr) return 3;
  const m = setsStr.match(/^(\d+)/);
  return m ? parseInt(m[1]) : 3;
}

// ============================================================
// ACTIVE WORKOUT — render
// ============================================================
function renderActiveWorkout(container) {
  const { phaseIdx, dayIdx } = activeWorkout;
  const phase = data.phases[phaseIdx];
  const day = phase.days[dayIdx];

  const wrap = document.createElement('div');
  wrap.className = 'log-active';

  // --- Sticky header ---
  const header = document.createElement('div');
  header.className = 'log-active-header';
  header.innerHTML = `
    <div class="log-active-info">
      <div class="log-active-name">${day.label}</div>
      <div class="log-active-phase">${phase.label}</div>
    </div>
    <button class="btn-abort" onclick="abortWorkout()">Porzuć</button>
  `;
  wrap.appendChild(header);

  // --- Rozgrzewka ---
  if (day.warmup && data.warmups[day.warmup]) {
    wrap.appendChild(buildActiveWarmup(day.warmup));
  }

  // --- Ostrzeżenie ---
  if (day.warn) {
    const warnBox = document.createElement('div');
    warnBox.className = 'warn-box';
    warnBox.style.marginBottom = '10px';
    warnBox.textContent = day.warn;
    wrap.appendChild(warnBox);
  }

  // --- Ćwiczenia główne ---
  const exTitle = document.createElement('div');
  exTitle.className = 'section-title';
  exTitle.style.padding = '0 0 10px';
  exTitle.textContent = `Ćwiczenia główne (${day.exercises.length})`;
  wrap.appendChild(exTitle);

  day.exercises.forEach((ex, ei) => {
    wrap.appendChild(buildExCard(ex, ei, phaseIdx, dayIdx));
  });

  // --- Notatka + zapis ---
  wrap.appendChild(buildSessionFooter());

  container.appendChild(wrap);
}

// ---- Rozgrzewka ----
function buildActiveWarmup(warmupKey) {
  const warmup = data.warmups[warmupKey];
  const checked = activeWorkout.warmupChecked;
  const total = warmup.items.length;
  const doneCount = checked.size;

  const block = document.createElement('div');
  block.className = 'log-warmup-block' + (doneCount === 0 ? ' open' : '');
  block.id = 'log-warmup-block';

  block.innerHTML = `
    <div class="log-warmup-header" onclick="toggleWarmupBlock()">
      <span class="log-warmup-toggle-icon">›</span>
      <span class="log-warmup-title-text">${warmup.title}</span>
      <span class="log-warmup-progress">${doneCount}/${total}</span>
    </div>
    <div class="log-warmup-items" id="log-warmup-items">
      ${warmup.items.map((item, i) => {
        const isDone = checked.has(i);
        return `
          <div class="log-warmup-item-row">
            <button class="log-warmup-check${isDone ? ' done' : ''}"
                    onclick="toggleWarmupItem(${i})"
                    aria-label="Zaznacz">
              ${isDone ? '✓' : ''}
            </button>
            <span class="log-warmup-item-text${isDone ? ' done' : ''}">
              ${item.text}
              ${item.link ? `<a class="ex-link" href="${item.link}" target="_blank" rel="noopener">YT</a>` : ''}
            </span>
          </div>
        `;
      }).join('')}
      ${warmup.note ? `<div class="warmup-note-text">${warmup.note}</div>` : ''}
    </div>
  `;
  return block;
}

// ---- Ćwiczenie — karta ----
function buildExCard(ex, ei, phaseIdx, dayIdx) {
  const card = document.createElement('div');
  card.className = 'log-ex-card';
  card.id = `log-ex-card-${ei}`;

  const sets = activeWorkout.sets[ei] || [];
  const prevData = getLastSessionSets(phaseIdx, dayIdx, ex.name);
  const tagHtml = ex.tag ? `<span class="tag tag-${ex.tag}">${ex.tag.toUpperCase()}</span>` : '';

  // Nagłówek karty
  let headerHtml = `
    <div class="log-ex-card-header">
      <div class="log-ex-card-top">
        <div class="log-ex-card-name">
          ${ex.name}
          ${ex.link ? `<a class="ex-link" href="${ex.link}" target="_blank" rel="noopener">YT</a>` : ''}
        </div>
        ${tagHtml}
        <span class="log-ex-sets-label">${ex.sets}</span>
      </div>
      ${ex.prog ? `<div class="log-ex-prog-line">↑ ${ex.prog}</div>` : ''}
      ${ex.note ? `<div class="log-ex-note-line">${ex.note}</div>` : ''}
    </div>
  `;

  // Tabela serii
  let tableHtml = `
    <table class="log-sets-table">
      <thead>
        <tr>
          <th>Seria</th>
          <th>Poprzednio</th>
          <th>kg</th>
          <th>powt.</th>
          <th>OK</th>
        </tr>
      </thead>
      <tbody>
        ${sets.map((s, si) => {
          const prev = prevData ? prevData[si] : null;
          const prevLabel = prev
            ? `<span>${prev.kg != null && prev.kg !== '' ? prev.kg + 'kg' : 'bw'}×${prev.reps || '?'}</span>`
            : `<span>—</span>`;
          const rowClass = s.done ? ' class="set-done-row"' : '';
          return `
            <tr id="set-row-${ei}-${si}"${rowClass}>
              <td class="log-set-num">${si + 1}</td>
              <td class="log-set-prev">${prevLabel}</td>
              <td>
                <div class="log-sets-inputs-cell">
                  <input class="log-set-input" type="number" min="0" step="2.5"
                    placeholder="kg"
                    value="${s.kg}"
                    oninput="updateSet(${ei}, ${si}, 'kg', this.value)"
                    inputmode="decimal">
                </div>
              </td>
              <td>
                <div class="log-sets-inputs-cell">
                  <input class="log-set-input reps" type="number" min="0" step="1"
                    placeholder="reps"
                    value="${s.reps}"
                    oninput="updateSet(${ei}, ${si}, 'reps', this.value)"
                    inputmode="numeric">
                </div>
              </td>
              <td class="log-sets-done-cell">
                <button class="log-set-done-btn${s.done ? ' done' : ''}"
                        onclick="toggleSetDone(${ei}, ${si})"
                        aria-label="Seria wykonana">
                  ${s.done ? '✓' : ''}
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  card.innerHTML = headerHtml + tableHtml;
  return card;
}

// ---- Footer sesji ----
function buildSessionFooter() {
  const footer = document.createElement('div');
  footer.className = 'log-session-footer';
  footer.innerHTML = `
    <div class="log-footer-label">Notatka do sesji (opcjonalna)</div>
    <textarea class="log-note-textarea" id="log-session-note"
      placeholder="np. czułem się dobrze, hip thrust poszedł sprawnie..."></textarea>
    <button class="btn-save-session" onclick="saveWorkoutSession()">
      Zapisz sesję
    </button>
  `;
  return footer;
}

// ============================================================
// AKCJE W AKTYWNYM TRENINGU (wywoływane inline)
// ============================================================

function toggleWarmupBlock() {
  const block = document.getElementById('log-warmup-block');
  if (block) block.classList.toggle('open');
}

function toggleWarmupItem(i) {
  if (!activeWorkout) return;
  if (activeWorkout.warmupChecked.has(i)) {
    activeWorkout.warmupChecked.delete(i);
  } else {
    activeWorkout.warmupChecked.add(i);
  }

  // Partial re-render: tylko przycisk + tekst + progress
  const { phaseIdx, dayIdx } = activeWorkout;
  const day = data.phases[phaseIdx].days[dayIdx];
  const warmup = data.warmups[day.warmup];
  const total = warmup.items.length;
  const doneCount = activeWorkout.warmupChecked.size;

  // Update progress counter
  const prog = document.querySelector('.log-warmup-progress');
  if (prog) prog.textContent = `${doneCount}/${total}`;

  // Update clicked item
  const btn = document.querySelector(`#log-warmup-items .log-warmup-item-row:nth-child(${i + 1}) .log-warmup-check`);
  const txt = document.querySelector(`#log-warmup-items .log-warmup-item-row:nth-child(${i + 1}) .log-warmup-item-text`);
  const isDone = activeWorkout.warmupChecked.has(i);
  if (btn) {
    btn.classList.toggle('done', isDone);
    btn.textContent = isDone ? '✓' : '';
  }
  if (txt) {
    txt.classList.toggle('done', isDone);
  }
  persistActiveWorkout();
}

function updateSet(ei, si, field, value) {
  if (!activeWorkout) return;
  if (!activeWorkout.sets[ei]) return;
  if (!activeWorkout.sets[ei][si]) return;
  activeWorkout.sets[ei][si][field] = value;
  persistActiveWorkout();
}

function toggleSetDone(ei, si) {
  if (!activeWorkout) return;
  const s = activeWorkout.sets[ei][si];
  s.done = !s.done;

  const row = document.getElementById(`set-row-${ei}-${si}`);
  const btn = row ? row.querySelector('.log-set-done-btn') : null;
  if (row) row.className = s.done ? 'set-done-row' : '';
  if (btn) {
    btn.classList.toggle('done', s.done);
    btn.textContent = s.done ? '✓' : '';
  }
  persistActiveWorkout();
}

function abortWorkout() {
  showConfirm({
    title: 'Porzucić trening?',
    message: 'Niezapisane dane przepadną.',
    confirmLabel: 'Porzuć',
    danger: true,
    onConfirm: () => {
      activeWorkout = null;
      persistActiveWorkout();
      renderLog();
    }
  });
}

// ============================================================
// ZAPIS SESJI
// ============================================================
function saveWorkoutSession() {
  if (!activeWorkout) return;

  const { phaseIdx, dayIdx, warmupChecked } = activeWorkout;
  const phase = data.phases[phaseIdx];
  const day = phase.days[dayIdx];

  const noteEl = document.getElementById('log-session-note');
  const note = noteEl ? noteEl.value.trim() : '';

  // Zlicz ćwiczenia główne (done = przynajmniej 1 seria zaznaczona)
  let doneCount = 0;
  const exercisesLog = day.exercises.map((ex, ei) => {
    const sets = activeWorkout.sets[ei] || [];
    const anyDone = sets.some(s => s.done);
    if (anyDone) doneCount++;
    return {
      name: ex.name,
      sets: sets.map(s => ({
        kg: s.kg !== '' ? parseFloat(s.kg) : null,
        reps: s.reps !== '' ? parseInt(s.reps) : null,
        done: s.done
      }))
    };
  });

  // Rozgrzewka
  const warmupKey = day.warmup;
  const warmupTotal = warmupKey && data.warmups[warmupKey]
    ? data.warmups[warmupKey].items.length
    : null;
  const warmupDoneArr = [...warmupChecked];

  const entry = {
    date: new Date().toLocaleDateString('pl-PL'),
    phase: phase.label,
    day: day.label,
    note,
    doneCount,
    totalCount: day.exercises.length,
    warmupDone: warmupDoneArr,
    warmupTotal,
    exercises: exercisesLog
  };

  sessionLog.push(entry);
  saveToStorage();
  syncToGist();

  activeWorkout = null;
  persistActiveWorkout();
  renderLog();
  showToast('Sesja zapisana!');
}

// ============================================================
// HISTORIA — toggle expand
// ============================================================
function toggleHistoryEntry(idx) {
  const card = document.getElementById(`log-entry-${idx}`);
  if (!card) return;
  card.classList.toggle('expanded');
}

// ============================================================
// HELPER: znajdź ostatnie serie dla danego ćwiczenia
// ============================================================
function getLastSessionSets(phaseIdx, dayIdx, exName) {
  const phaseLbl = data.phases[phaseIdx].label;
  const dayLbl   = data.phases[phaseIdx].days[dayIdx].label;

  // Szukaj od końca historii
  for (let i = sessionLog.length - 1; i >= 0; i--) {
    const entry = sessionLog[i];
    if (entry.phase !== phaseLbl || entry.day !== dayLbl) continue;
    if (!entry.exercises) continue;
    const found = entry.exercises.find(e => e.name === exName);
    if (found) return found.sets;
  }
  return null;
}

// ============================================================
// EDYCJA HISTORYCZNEGO WPISU
// ============================================================

function startEditEntry(idx) {
  editingEntryIdx = idx;
  renderLog();
  window.scrollTo(0, 0);
}

function cancelEditEntry() {
  _editBuffer = null;
  editingEntryIdx = null;
  renderLog();
}

function renderEditEntry(container, idx) {
  const entry = sessionLog[idx];
  if (!entry) { editingEntryIdx = null; renderLog(); return; }

  const wrap = document.createElement('div');
  wrap.className = 'log-active';  // reużyj stylu aktywnego treningu

  // --- Sticky header ---
  const header = document.createElement('div');
  header.className = 'log-active-header';
  header.innerHTML = `
    <div class="log-active-info">
      <div class="log-active-name">Edycja wpisu</div>
      <div class="log-active-phase">${entry.day} · ${entry.date}</div>
    </div>
    <button class="btn-abort" onclick="cancelEditEntry()">Anuluj</button>
  `;
  wrap.appendChild(header);

  // --- Notatka ---
  const noteSection = document.createElement('div');
  noteSection.className = 'log-session-footer';
  noteSection.style.marginTop = '0';
  noteSection.style.marginBottom = '12px';
  noteSection.innerHTML = `
    <div class="log-footer-label">Notatka do sesji</div>
    <textarea class="log-note-textarea" id="edit-session-note"
      placeholder="np. czułem się dobrze...">${entry.note || ''}</textarea>
  `;
  wrap.appendChild(noteSection);

  // --- Ćwiczenia (tylko jeśli wpis ma dane serii) ---
  if (entry.exercises && entry.exercises.length > 0) {
    const exTitle = document.createElement('div');
    exTitle.className = 'section-title';
    exTitle.style.padding = '0 0 10px';
    exTitle.textContent = `Ćwiczenia (${entry.exercises.length})`;
    wrap.appendChild(exTitle);

    entry.exercises.forEach((ex, ei) => {
      wrap.appendChild(buildEditExCard(ex, ei));
    });
  } else {
    // Stary wpis bez danych serii
    const noData = document.createElement('div');
    noData.className = 'warn-box';
    noData.style.marginBottom = '12px';
    noData.textContent = 'Ten wpis nie zawiera danych o seriach — zapisano go przed aktualizacją aplikacji. Możesz edytować tylko notatkę.';
    wrap.appendChild(noData);
  }

  // --- Przycisk zapisu ---
  const saveBtn = document.createElement('div');
  saveBtn.style.marginTop = '16px';
  saveBtn.innerHTML = `
    <button class="btn-save-session" onclick="saveEntryEdit(${idx})">Zapisz zmiany</button>
  `;
  wrap.appendChild(saveBtn);

  container.appendChild(wrap);
}

function buildEditExCard(ex, ei) {
  const card = document.createElement('div');
  card.className = 'log-ex-card';

  const tagHtml = ex.tag ? `<span class="tag tag-${ex.tag}">${ex.tag.toUpperCase()}</span>` : '';

  let headerHtml = `
    <div class="log-ex-card-header">
      <div class="log-ex-card-top">
        <div class="log-ex-card-name">${ex.name}</div>
        ${tagHtml}
      </div>
    </div>
  `;

  const sets = ex.sets || [];
  let tableHtml = `
    <table class="log-sets-table">
      <thead>
        <tr>
          <th>Seria</th>
          <th>kg</th>
          <th>powt.</th>
          <th>OK</th>
        </tr>
      </thead>
      <tbody>
        ${sets.map((s, si) => {
          const rowClass = s.done ? ' class="set-done-row"' : '';
          return `
            <tr id="edit-row-${ei}-${si}"${rowClass}>
              <td class="log-set-num">${si + 1}</td>
              <td>
                <input class="log-set-input" type="number" min="0" step="2.5"
                  placeholder="kg"
                  value="${s.kg != null ? s.kg : ''}"
                  oninput="updateEditSet(${ei}, ${si}, 'kg', this.value)"
                  inputmode="decimal">
              </td>
              <td>
                <input class="log-set-input reps" type="number" min="0" step="1"
                  placeholder="reps"
                  value="${s.reps != null ? s.reps : ''}"
                  oninput="updateEditSet(${ei}, ${si}, 'reps', this.value)"
                  inputmode="numeric">
              </td>
              <td class="log-sets-done-cell">
                <button class="log-set-done-btn${s.done ? ' done' : ''}"
                        onclick="toggleEditSetDone(${ei}, ${si})"
                        aria-label="Seria wykonana">
                  ${s.done ? '✓' : ''}
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  card.innerHTML = headerHtml + tableHtml;
  return card;
}

// Tymczasowy bufor edycji — kopia entry żeby nie mutować oryginału zanim nie kliknie "Zapisz"
let _editBuffer = null;

function _ensureEditBuffer(idx) {
  if (_editBuffer === null || _editBuffer._idx !== idx) {
    const entry = sessionLog[idx];
    _editBuffer = {
      _idx: idx,
      note: entry.note || '',
      exercises: entry.exercises
        ? entry.exercises.map(ex => ({
            ...ex,
            sets: ex.sets.map(s => ({ ...s }))
          }))
        : null
    };
  }
  return _editBuffer;
}

function updateEditSet(ei, si, field, value) {
  if (editingEntryIdx === null) return;
  const buf = _ensureEditBuffer(editingEntryIdx);
  if (!buf.exercises || !buf.exercises[ei] || !buf.exercises[ei].sets[si]) return;
  buf.exercises[ei].sets[si][field] = value === '' ? null : (field === 'kg' ? parseFloat(value) : parseInt(value));
}

function toggleEditSetDone(ei, si) {
  if (editingEntryIdx === null) return;
  const buf = _ensureEditBuffer(editingEntryIdx);
  if (!buf.exercises || !buf.exercises[ei] || !buf.exercises[ei].sets[si]) return;

  const s = buf.exercises[ei].sets[si];
  s.done = !s.done;

  const row = document.getElementById(`edit-row-${ei}-${si}`);
  const btn = row ? row.querySelector('.log-set-done-btn') : null;
  if (row) row.className = s.done ? 'set-done-row' : '';
  if (btn) { btn.classList.toggle('done', s.done); btn.textContent = s.done ? '✓' : ''; }
}

function saveEntryEdit(idx) {
  const entry = sessionLog[idx];
  if (!entry) return;

  // Pobierz notatkę z DOM
  const noteEl = document.getElementById('edit-session-note');
  const note = noteEl ? noteEl.value.trim() : (entry.note || '');

  // Użyj bufora edycji jeśli był używany, inaczej oryginalne dane
  const buf = _editBuffer && _editBuffer._idx === idx ? _editBuffer : null;
  const exercises = buf && buf.exercises ? buf.exercises : entry.exercises;

  // Przelicz doneCount
  let doneCount = 0;
  if (exercises) {
    exercises.forEach(ex => {
      if (ex.sets && ex.sets.some(s => s.done)) doneCount++;
    });
  } else {
    doneCount = entry.doneCount;
  }

  sessionLog[idx] = { ...entry, note, exercises, doneCount };

  _editBuffer = null;
  editingEntryIdx = null;
  saveToStorage();
  syncToGist();
  renderLog();
  showToast('Wpis zaktualizowany!');
}

function deleteEntry(idx) {
  showConfirm({
    title: 'Usuń wpis',
    message: 'Tej operacji nie można cofnąć.',
    confirmLabel: 'Usuń',
    danger: true,
    onConfirm: () => {
      sessionLog.splice(idx, 1);
      saveToStorage();
      syncToGist();
      renderLog();
      showToast('Wpis usunięty');
    }
  });
}


function resumeWorkout() {
  const recovered = loadActiveWorkout();
  if (!recovered) return;
  activeWorkout = recovered;
  renderLog();
  window.scrollTo(0, 0);
}

function discardRecovery() {
  showConfirm({
    title: 'Odrzucić trening?',
    message: 'Niezakończony trening zostanie usunięty. Danych nie można odzyskać.',
    confirmLabel: 'Odrzuć',
    danger: true,
    onConfirm: () => {
      localStorage.removeItem('ironman_active');
      renderLog();
    }
  });
}

// ============================================================
// LEGACY — updateLogDaySelect (kompatybilność wsteczna)
// ============================================================
function updateLogDaySelect() {
  // no-op — zastąpione przez nowy UI
}
