// ============================================================
// LOG SCREEN
// ============================================================

function renderLog() {
  const cont = document.getElementById('log-container');
  cont.innerHTML = '';

  // Quick log form
  const form = document.createElement('div');
  form.className = 'log-day-select';
  form.innerHTML = `
    <label>Dodaj wpis treningowy</label>
    <div class="field-group">
      <div class="field-label">Sesja</div>
      <select class="field-select" id="log-phase-select" onchange="updateLogDaySelect()">
        ${data.phases.map((p,i) => `<option value="${i}">${p.label}</option>`).join('')}
      </select>
    </div>
    <div class="field-group">
      <div class="field-label">Dzień</div>
      <select class="field-select" id="log-day-select"></select>
    </div>
    <div class="field-group">
      <div class="field-label">Notatka / komentarz do sesji</div>
      <textarea class="field-textarea" id="log-note" placeholder="np. hip thrust 60kg, czulem sie dobrze..."></textarea>
    </div>
    <button class="btn-small success" style="margin-top:8px;" onclick="addLogEntry()">+ Dodaj wpis</button>
  `;
  cont.appendChild(form);

  // History
  if (sessionLog.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'no-logs';
    empty.textContent = 'Brak wpisów. Dodaj pierwszy po treningu!';
    cont.appendChild(empty);
  } else {
    const histTitle = document.createElement('div');
    histTitle.className = 'section-title';
    histTitle.style.padding = '8px 0 8px';
    histTitle.textContent = `Historia (${sessionLog.length} sesji)`;
    cont.appendChild(histTitle);

    [...sessionLog].reverse().forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'log-entry';
      card.innerHTML = `
        <div class="log-entry-header">
          <span>${entry.phase} — ${entry.day}</span>
          <span class="log-entry-date">${entry.date}</span>
        </div>
        <div class="log-entry-body">
          ${entry.note ? `<div style="font-size:12px;color:var(--text2);margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border);">${entry.note}</div>` : ''}
          <div style="font-size:11px;color:var(--text3);">Zaznaczone serie: ${entry.doneCount} / ${entry.totalCount}</div>
        </div>
      `;
      cont.appendChild(card);
    });
  }

  updateLogDaySelect();
}

function updateLogDaySelect() {
  const pi = parseInt(document.getElementById('log-phase-select').value);
  const sel = document.getElementById('log-day-select');
  if (!sel) return;
  sel.innerHTML = data.phases[pi].days.map((d,i) => `<option value="${i}">${d.label}</option>`).join('');
}

function addLogEntry() {
  const pi = parseInt(document.getElementById('log-phase-select').value);
  const di = parseInt(document.getElementById('log-day-select').value);
  const note = document.getElementById('log-note').value.trim();
  const phase = data.phases[pi];
  const day = phase.days[di];
  const total = day.exercises.length;
  let done = 0;
  day.exercises.forEach((_,ei) => { if (doneState[`${pi}-${di}-${ei}`]) done++; });

  sessionLog.push({
    date: new Date().toLocaleDateString('pl-PL'),
    phase: phase.label,
    day: day.label,
    note,
    doneCount: done,
    totalCount: total
  });
  saveToStorage();
  syncToGist();
  document.getElementById('log-note').value = '';
  renderLog();
  showToast('✅ Sesja zapisana + sync!');
}
