// ============================================================
// PLAN RENDER
// ============================================================

function renderPlan() {
  // Plan switcher (PLAN 1 / PLAN 2)
  const planNames = [
    plans[0].title || 'PLAN 1',
    plans[1].title || 'PLAN 2'
  ];
  const planSwitcher = document.getElementById('plan-switcher');
  if (planSwitcher) {
    planSwitcher.innerHTML = planNames.map((name, i) =>
      `<button class="plan-tab ${i === currentPlan ? 'active' : ''}" onclick="setPlan(${i})">${name}</button>`
    ).join('');
  }

  // Phase tabs + Edytuj plan button w jednej linii
  const tabs = document.getElementById('phase-tabs');
  tabs.innerHTML = data.phases.map((p,i) => `
    <button class="phase-tab ${i===currentPhase?'active':''}" onclick="setPhase(${i})">${p.label}</button>
  `).join('') + `<button class="phase-tab-edit" onclick="showScreen('edit')">✏️ Edytuj</button>`;

  // Phase info
  document.getElementById('phase-info').innerHTML = data.phases[currentPhase].desc;

  // Week bar — tylko jeśli plan ma weekBar
  const weekSection = document.getElementById('week-section');
  const wb = document.getElementById('week-bar');
  if (data.weekBar) {
    if (weekSection) weekSection.style.display = '';
    wb.innerHTML = data.weekBar.map((w, wi) => {
      const phase = data.phases[currentPhase];
      const matchedDi = phase.days.findIndex(d =>
        w.label && (d.label.toLowerCase().includes(w.label.toLowerCase().split('—')[0].trim()) ||
        w.label.toLowerCase().includes(d.label.toLowerCase().split('—')[0].trim()) ||
        (w.gym && (
          (w.day==='PN' && d.label.toLowerCase().includes('poniedzia')) ||
          (w.day==='ŚR' && d.label.toLowerCase().includes('środa')) ||
          (w.day==='PT' && d.label.toLowerCase().includes('piątek')) ||
          (w.day==='PN' && d.label.toLowerCase().includes('sesja 1')) ||
          (w.day==='ŚR' && d.label.toLowerCase().includes('sesja 2'))
        ))
      ));
      const clickable = w.gym && matchedDi >= 0;
      return `<div class="wday ${w.gym ? 'gym-day' : 'off'} ${clickable ? 'clickable-day' : ''}"
        ${clickable ? `onclick="openDay(${matchedDi})"` : ''}>
        <div class="dn">${w.day}</div>
        <div class="dl">${w.label}</div>
        ${clickable ? '<div class="dl" style="margin-top:2px;font-size:9px;opacity:.7;">▼ otwórz</div>' : ''}
      </div>`;
    }).join('');
  } else {
    if (weekSection) weekSection.style.display = 'none';
  }

  // Days
  const cont = document.getElementById('days-container');
  cont.innerHTML = '';
  const phase = data.phases[currentPhase];
  phase.days.forEach((day, di) => {
    const card = document.createElement('div');
    card.className = 'day-card' + (di === 0 ? ' open' : '');
    card.id = `day-card-${currentPhase}-${di}`;

    // Warmup — tylko jeśli plan ma warmups i dzień ma warmup key
    let warmupHtml = '';
    if (data.warmups && day.warmup && data.warmups[day.warmup]) {
      const wu = data.warmups[day.warmup];
      warmupHtml = `<div class="warmup-block">
        <div class="warmup-title">${wu.title}</div>
        ${wu.items.map(it => {
          const text = typeof it === 'string' ? it : it.text;
          const link = typeof it === 'object' && it.link ? it.link : '';
          return `<div class="warmup-item">${text}${link ? `<a href="${link}" target="_blank" rel="noopener" class="ex-link" title="Zobacz wideo">▶</a>` : ''}</div>`;
        }).join('')}
        <div class="warmup-note">${wu.note}</div>
      </div>`;
    }

    const tagLabel = t => t==='key'?'kluczowe':t==='fai'?'FAI':t==='new'?'nowe':t==='core'?'core':'';
    const tagHtml = t => t ? `<span class="tag tag-${t}">${tagLabel(t)}</span> ` : '';

    const rows = day.exercises.map((e, ei) => {
      const doneKey = `${currentPlan}-${currentPhase}-${di}-${ei}`;
      const isDone = doneState[doneKey];
      return `<tr id="ex-row-${currentPlan}-${currentPhase}-${di}-${ei}" class="${isDone ? 'ex-done' : ''}">
        <td>
          <div class="ex-name">${e.name}${e.link ? `<a href="${e.link}" target="_blank" rel="noopener" class="ex-link" title="Zobacz wideo">▶</a>` : ''}</div>
          ${e.note ? `<div class="ex-sub">${e.note}</div>` : ''}
          ${e.prog ? `<div class="ex-prog-inline">↗ ${e.prog}</div>` : ''}
          ${e.why ? `<div class="ex-why">∵ ${e.why} ${tagHtml(e.tag)}</div>` : tagHtml(e.tag) ? `<div class="ex-why">${tagHtml(e.tag)}</div>` : ''}
        </td>
        <td class="ex-sets">${e.sets}</td>
        <td class="col-prog">${e.prog ? `<div class="ex-prog-cell">↗ ${e.prog}</div>` : ''}</td>
        <td class="ex-tempo col-tempo">${e.tempo || ''}</td>
      </tr>`;
    }).join('');

    card.innerHTML = `
      <div class="day-header" onclick="this.parentElement.classList.toggle('open')">
        <span class="day-badge">${day.label}</span>
        <span class="day-focus">${day.focus}</span>
        <span class="chevron">▼</span>
      </div>
      <div class="day-body">
        ${warmupHtml}
        ${day.warn ? `<div class="warn-box">⚠️ ${day.warn}</div>` : ''}
        ${day.changes ? `<div class="change-box"><strong>Zmiany:</strong> ${day.changes}</div>` : ''}
        <div class="note-box">${day.note}</div>
        <table class="ex-table">
          <thead><tr><th>Ćwiczenie</th><th>Serie</th><th class="col-prog">Progresja</th><th class="col-tempo">Tempo</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    cont.appendChild(card);
  });
}

function setPlan(i) {
  currentPlan = i;
  data = plans[i];
  currentPhase = 0;
  renderPlan();
}

function setPhase(i) {
  currentPhase = i;
  renderPlan();
}

function openDay(di) {
  document.querySelectorAll('.day-card').forEach((c, i) => {
    c.classList.toggle('open', i === di);
  });
  document.getElementById(`day-card-${currentPhase}-${di}`);
}

function toggleDone(pi, di, ei) {
  const key = `${currentPlan}-${pi}-${di}-${ei}`;
  doneState[key] = !doneState[key];
  saveToStorage();
  const row = document.getElementById(`ex-row-${currentPlan}-${pi}-${di}-${ei}`);
  const btn = row.querySelector('.done-btn');
  row.classList.toggle('ex-done', doneState[key]);
  if (btn) btn.classList.toggle('done', doneState[key]);
}
