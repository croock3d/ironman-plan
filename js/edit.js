// ============================================================
// EDIT RENDER
// ============================================================

function renderEdit() {
  const cont = document.getElementById('edit-container');
  cont.innerHTML = '';

  // Week bar editor
  const wbSec = makeEditSection('📅 Tygodniowy harmonogram', `${data.weekBar.length} dni`);
  const wbBody = wbSec.querySelector('.edit-section-body');
  wbBody.innerHTML = data.weekBar.map((w, i) => `
    <div style="display:grid; grid-template-columns:60px 1fr auto; gap:8px; align-items:center; margin-bottom:8px;">
      <input class="field-input" style="text-align:center;font-weight:700;" value="${w.day}" onchange="data.weekBar[${i}].day=this.value">
      <input class="field-input" value="${w.label}" onchange="data.weekBar[${i}].label=this.value">
      <button class="btn-small ${w.gym?'success':''}" onclick="data.weekBar[${i}].gym=!data.weekBar[${i}].gym; renderEdit();">${w.gym?'💪 Siłownia':'—'}</button>
    </div>
  `).join('');
  cont.appendChild(wbSec);

  // Warmup editor
  const warmupSec = makeEditSection('🔥 Rozgrzewki', '2 bloki');
  const warmupBody = warmupSec.querySelector('.edit-section-body');
  ['nogi', 'gora'].forEach(key => {
    const wu = data.warmups[key];
    const wuDiv = document.createElement('div');
    wuDiv.className = 'day-editor';
    wuDiv.innerHTML = `
      <div class="day-editor-title"><span>${wu.title}</span></div>
      <div class="field-group">
        <div class="field-label">Tytuł bloku</div>
        <input class="field-input" value="${escHtml(wu.title)}" onchange="data.warmups['${key}'].title=this.value">
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:10px 0 6px;font-family:var(--mono);">Elementy</div>
      <div id="warmup-items-${key}"></div>
      <div class="field-group" style="margin-top:10px;">
        <div class="field-label">Notatka</div>
        <input class="field-input" value="${escHtml(wu.note||'')}" onchange="data.warmups['${key}'].note=this.value">
      </div>
    `;
    const itemsContainer = wuDiv.querySelector(`#warmup-items-${key}`);
    wu.items.forEach((item, ii) => {
      const text = typeof item === 'string' ? item : item.text;
      const link = typeof item === 'object' ? (item.link || '') : '';
      const itemDiv = document.createElement('div');
      itemDiv.className = 'ex-editor';
      itemDiv.innerHTML = `
        <div class="ex-editor-num">Element ${ii + 1}</div>
        <div class="field-group">
          <div class="field-label">Opis</div>
          <input class="field-input" value="${escHtml(text)}" onchange="data.warmups['${key}'].items[${ii}]={text:this.value,link:data.warmups['${key}'].items[${ii}]?.link||''}">
        </div>
        <div class="field-group">
          <div class="field-label">Link (YouTube, artykuł — opcjonalne)</div>
          <input class="field-input" type="url" placeholder="https://..." value="${escHtml(link)}" onchange="data.warmups['${key}'].items[${ii}]={text:data.warmups['${key}'].items[${ii}]?.text||'',link:this.value}">
        </div>
      `;
      itemsContainer.appendChild(itemDiv);
    });
    warmupBody.appendChild(wuDiv);
  });
  cont.appendChild(warmupSec);

  // Phases editor
  data.phases.forEach((phase, pi) => {
    const sec = makeEditSection(`Faza ${pi+1}: ${phase.label}`, `${phase.days.length} dni`);
    const body = sec.querySelector('.edit-section-body');

    // Phase label + desc
    body.innerHTML = `
      <div class="field-group">
        <div class="field-label">Nazwa fazy</div>
        <input class="field-input" value="${escHtml(phase.label)}" onchange="data.phases[${pi}].label=this.value">
      </div>
      <div class="field-group">
        <div class="field-label">Opis fazy (HTML dozwolony)</div>
        <textarea class="field-textarea" onchange="data.phases[${pi}].desc=this.value">${escHtml(phase.desc)}</textarea>
      </div>
    `;

    // Days
    phase.days.forEach((day, di) => {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day-editor';
      dayDiv.innerHTML = `
        <div class="day-editor-title">
          <span>📋 ${day.label}</span>
          <button class="btn-small danger" onclick="removeDay(${pi},${di})">Usuń dzień</button>
        </div>
        <div class="field-group">
          <div class="field-label">Etykieta dnia</div>
          <input class="field-input" value="${escHtml(day.label)}" onchange="data.phases[${pi}].days[${di}].label=this.value">
        </div>
        <div class="field-group">
          <div class="field-label">Focus / tytuł</div>
          <input class="field-input" value="${escHtml(day.focus)}" onchange="data.phases[${pi}].days[${di}].focus=this.value">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div class="field-group">
            <div class="field-label">Rozgrzewka</div>
            <select class="field-select" onchange="data.phases[${pi}].days[${di}].warmup=this.value">
              <option value="nogi" ${day.warmup==='nogi'?'selected':''}>Nogi</option>
              <option value="gora" ${day.warmup==='gora'?'selected':''}>Góra</option>
            </select>
          </div>
        </div>
        <div class="field-group">
          <div class="field-label">Notatka (HTML)</div>
          <textarea class="field-textarea" onchange="data.phases[${pi}].days[${di}].note=this.value">${escHtml(day.note||'')}</textarea>
        </div>
        <div class="field-group">
          <div class="field-label">Ostrzeżenie (puste = brak)</div>
          <input class="field-input" value="${escHtml(day.warn||'')}" onchange="data.phases[${pi}].days[${di}].warn=this.value||null">
        </div>
        <div class="field-group">
          <div class="field-label">Zmiany v6 (puste = brak)</div>
          <input class="field-input" value="${escHtml(day.changes||'')}" onchange="data.phases[${pi}].days[${di}].changes=this.value||null">
        </div>
        <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:10px 0 6px;font-family:var(--mono);">Ćwiczenia</div>
        <div id="ex-list-${pi}-${di}"></div>
        <div class="btn-row">
          <button class="btn-small success" onclick="addExercise(${pi},${di})">+ Dodaj ćwiczenie</button>
        </div>
      `;
      body.appendChild(dayDiv);

      // Exercises
      const exList = dayDiv.querySelector(`#ex-list-${pi}-${di}`);
      day.exercises.forEach((ex, ei) => {
        exList.appendChild(makeExEditor(pi, di, ei, ex));
      });
    });

    // Add day button
    const addDayBtn = document.createElement('div');
    addDayBtn.className = 'btn-row';
    addDayBtn.innerHTML = `<button class="btn-small success" onclick="addDay(${pi})">+ Dodaj dzień treningowy</button>`;
    body.appendChild(addDayBtn);

    cont.appendChild(sec);
  });

  // Add phase button
  const addPhaseDiv = document.createElement('div');
  addPhaseDiv.className = 'btn-row';
  addPhaseDiv.style.padding = '0 0 10px';
  addPhaseDiv.innerHTML = `<button class="btn-small success" onclick="addPhase()">+ Dodaj fazę</button>`;
  cont.appendChild(addPhaseDiv);
}

function makeEditSection(title, meta) {
  const sec = document.createElement('div');
  sec.className = 'edit-section open';
  sec.innerHTML = `
    <div class="edit-section-header" onclick="this.parentElement.classList.toggle('open')">
      <div class="edit-section-title">${title}</div>
      <div class="edit-section-meta">${meta}</div>
      <div class="chevron" style="font-size:11px;color:var(--text3);">▼</div>
    </div>
    <div class="edit-section-body"></div>
  `;
  return sec;
}

function makeExEditor(pi, di, ei, ex) {
  const div = document.createElement('div');
  div.className = 'ex-editor';
  div.id = `ex-editor-${pi}-${di}-${ei}`;
  div.innerHTML = `
    <div class="ex-editor-num">Ćwiczenie ${ei+1}</div>
    <div class="ex-editor-grid">
      <div class="field-group ex-editor-full">
        <div class="field-label">Nazwa</div>
        <input class="field-input" value="${escHtml(ex.name)}" onchange="data.phases[${pi}].days[${di}].exercises[${ei}].name=this.value">
      </div>
      <div class="field-group">
        <div class="field-label">Serie × powt.</div>
        <input class="field-input" value="${escHtml(ex.sets)}" onchange="data.phases[${pi}].days[${di}].exercises[${ei}].sets=this.value">
      </div>
      <div class="field-group">
        <div class="field-label">Tempo</div>
        <input class="field-input" value="${escHtml(ex.tempo)}" onchange="data.phases[${pi}].days[${di}].exercises[${ei}].tempo=this.value">
      </div>
      <div class="field-group">
        <div class="field-label">Tag</div>
        <select class="field-select" onchange="data.phases[${pi}].days[${di}].exercises[${ei}].tag=this.value">
          <option value="" ${!ex.tag?'selected':''}>—</option>
          <option value="key" ${ex.tag==='key'?'selected':''}>kluczowe</option>
          <option value="fai" ${ex.tag==='fai'?'selected':''}>FAI</option>
          <option value="core" ${ex.tag==='core'?'selected':''}>core</option>
          <option value="new" ${ex.tag==='new'?'selected':''}>nowe</option>
        </select>
      </div>
      <div class="field-group ex-editor-full">
        <div class="field-label">Notatka do wykonania</div>
        <input class="field-input" value="${escHtml(ex.note||'')}" onchange="data.phases[${pi}].days[${di}].exercises[${ei}].note=this.value">
      </div>
      <div class="field-group ex-editor-full">
        <div class="field-label">Progresja</div>
        <input class="field-input" value="${escHtml(ex.prog||'')}" onchange="data.phases[${pi}].days[${di}].exercises[${ei}].prog=this.value">
      </div>
      <div class="field-group ex-editor-full">
        <div class="field-label">Cel ćwiczenia</div>
        <input class="field-input" value="${escHtml(ex.why||'')}" onchange="data.phases[${pi}].days[${di}].exercises[${ei}].why=this.value">
      </div>
      <div class="field-group ex-editor-full">
        <div class="field-label">Link (YouTube, artykuł — opcjonalne)</div>
        <input class="field-input" type="url" placeholder="https://..." value="${escHtml(ex.link||'')}" onchange="data.phases[${pi}].days[${di}].exercises[${ei}].link=this.value">
      </div>
    </div>
    <div class="btn-row">
      <button class="btn-small danger" onclick="removeExercise(${pi},${di},${ei})">Usuń</button>
      ${ei > 0 ? `<button class="btn-small" onclick="moveExercise(${pi},${di},${ei},-1)">↑ Wyżej</button>` : ''}
    </div>
  `;
  return div;
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// EDIT ACTIONS
// ============================================================

function addExercise(pi, di) {
  data.phases[pi].days[di].exercises.push({ name:"Nowe ćwiczenie", sets:"3×10", tempo:"2-0-1-0", note:"", prog:"", why:"", tag:"", link:"" });
  renderEdit();
  showToast('Dodano ćwiczenie');
}

function removeExercise(pi, di, ei) {
  if (!confirm('Usunąć ćwiczenie?')) return;
  data.phases[pi].days[di].exercises.splice(ei, 1);
  renderEdit();
}

function moveExercise(pi, di, ei, dir) {
  const arr = data.phases[pi].days[di].exercises;
  const ni = ei + dir;
  if (ni < 0 || ni >= arr.length) return;
  [arr[ei], arr[ni]] = [arr[ni], arr[ei]];
  renderEdit();
}

function addDay(pi) {
  data.phases[pi].days.push({
    label: "Nowy dzień", focus: "Focus",
    warmup: "nogi", note: "Notatka.", warn: null, changes: null,
    exercises: [{ name:"Ćwiczenie 1", sets:"3×10", tempo:"2-0-1-0", note:"", prog:"", why:"", tag:"", link:"" }]
  });
  renderEdit();
  showToast('Dodano dzień');
}

function removeDay(pi, di) {
  if (!confirm('Usunąć cały dzień?')) return;
  data.phases[pi].days.splice(di, 1);
  renderEdit();
}

function addPhase() {
  data.phases.push({
    label: "Nowa faza", desc: "Opis nowej fazy.",
    days: [{ label:"Dzień 1", focus:"Focus", warmup:"nogi", note:"Notatka.", warn:null, changes:null,
      exercises:[{ name:"Ćwiczenie 1", sets:"3×10", tempo:"2-0-1-0", note:"", prog:"", why:"", tag:"", link:"" }] }]
  });
  renderEdit();
  showToast('Dodano fazę');
}

function saveEdits() {
  saveToStorage();
  syncToGist();
  showToast('✅ Zapisano + sync do chmury');
}

function resetData() {
  if (!confirm('Reset do domyślnych danych? Utracisz wszystkie zmiany!')) return;
  data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  doneState = {};
  saveToStorage();
  renderEdit();
  showToast('Zresetowano do v6');
}
