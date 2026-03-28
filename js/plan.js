// ============================================================
// PLAN RENDER
// ============================================================

function renderPlan() {
  // Phase tabs
  const tabs = document.getElementById('phase-tabs');
  tabs.innerHTML = data.phases.map((p,i) => `
    <button class="phase-tab ${i===currentPhase?'active':''}" onclick="setPhase(${i})">${p.label}</button>
  `).join('');

  // Phase info
  document.getElementById('phase-info').innerHTML = data.phases[currentPhase].desc;

  // Week bar
  const wb = document.getElementById('week-bar');
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

  // Days
  const cont = document.getElementById('days-container');
  cont.innerHTML = '';
  const phase = data.phases[currentPhase];
  phase.days.forEach((day, di) => {
    const card = document.createElement('div');
    card.className = 'day-card' + (di === 0 ? ' open' : '');
    card.id = `day-card-${currentPhase}-${di}`;

    const wu = data.warmups[day.warmup] || { title:'Rozgrzewka', items:[], note:'' };
    const warmupHtml = `<div class="warmup-block">
      <div class="warmup-title">${wu.title}</div>
      ${wu.items.map(it => {
        const text = typeof it === 'string' ? it : it.text;
        const link = typeof it === 'object' && it.link ? it.link : '';
        return `<div class="warmup-item">${text}${link ? `<a href="${link}" target="_blank" rel="noopener" class="ex-link">🔗</a>` : ''}</div>`;
      }).join('')}
      <div class="warmup-note">${wu.note}</div>
    </div>`;

    const tagLabel = t => t==='key'?'kluczowe':t==='fai'?'FAI':t==='new'?'nowe':t==='core'?'core':'';
    const tagHtml = t => t ? `<span class="tag tag-${t}">${tagLabel(t)}</span> ` : '';

    const rows = day.exercises.map((e, ei) => {
      const doneKey = `${currentPhase}-${di}-${ei}`;
      const isDone = doneState[doneKey];
      return `<tr class="${isDone?'ex-done':''}" id="ex-row-${currentPhase}-${di}-${ei}">
        <td>
          <div class="ex-name">${e.name}${e.link ? `<a href="${e.link}" target="_blank" rel="noopener" class="ex-link">🔗</a>` : ''}</div>
          ${e.note ? `<div class="ex-sub">${e.note}</div>` : ''}
          ${e.prog ? `<div class="ex-prog">↗ ${e.prog}</div>` : ''}
          ${e.why ? `<div class="ex-why">∵ ${e.why} ${tagHtml(e.tag)}</div>` : tagHtml(e.tag) ? `<div class="ex-why">${tagHtml(e.tag)}</div>` : ''}
        </td>
        <td class="ex-sets">${e.sets}</td>
        <td class="ex-tempo col-tempo">${e.tempo}</td>
        <td><button class="done-btn ${isDone?'done':''}" onclick="toggleDone(${currentPhase},${di},${ei})">✓</button></td>
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
          <thead><tr><th>Ćwiczenie</th><th>Serie</th><th class="col-tempo">Tempo</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    cont.appendChild(card);
  });
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
  const key = `${pi}-${di}-${ei}`;
  doneState[key] = !doneState[key];
  saveToStorage();
  const row = document.getElementById(`ex-row-${pi}-${di}-${ei}`);
  const btn = row.querySelector('.done-btn');
  row.classList.toggle('ex-done', doneState[key]);
  btn.classList.toggle('done', doneState[key]);
}
