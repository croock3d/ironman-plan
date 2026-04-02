// ============================================================
// SYNC — GitHub Gist
// ============================================================

function setSyncStatus(s, text) {
  const chip = document.getElementById('sync-status');
  if (!chip) return;
  const icons = { idle: '☁️', syncing: '⏳', ok: '✅', error: '❌' };
  const labels = { idle: 'Sync', syncing: 'Sync...', ok: 'Zsync', error: 'Błąd' };
  const iconEl = document.getElementById('sync-icon');
  const textEl = document.getElementById('sync-text');
  if (iconEl) iconEl.textContent = icons[s];
  if (textEl) textEl.textContent = text || labels[s];
  chip.className = 'sync-chip sync-' + s;
}

async function syncFromGist() {
  setSyncStatus('syncing');
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 'Authorization': `token ${getToken()}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const gist = await res.json();
    const content = gist.files[GIST_FILE]?.content;
    if (content && content.trim() !== '{}') {
      const remote = JSON.parse(content);
      if (remote.data) { data = remote.data; normalizeData(); }
      if (remote.sessionLog) sessionLog = remote.sessionLog;
      if (remote.doneState) doneState = { ...remote.doneState, ...doneState };
      if (remote.breathData) breathData = remote.breathData;
      if (remote.zonesData) zonesData = remote.zonesData;
      saveToStorage();
    }
    setSyncStatus('ok');
    return true;
  } catch(e) {
    setSyncStatus('error');
    console.error(e);
    return false;
  }
}

async function syncToGist() {
  setSyncStatus('syncing');
  try {
    const payload = { data, sessionLog, doneState, breathData, zonesData, updatedAt: new Date().toISOString() };
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${getToken()}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(payload, null, 2) } } })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    setSyncStatus('ok');
  } catch(e) {
    setSyncStatus('error');
    console.error(e);
  }
}

async function manualSync() {
  const ok = await syncFromGist();
  if (ok) {
    renderPlan();
    showToast('📥 Pobrano z chmury');
  } else {
    showToast('❌ Błąd synchronizacji');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ============================================================
// CONFIRM MODAL — zastępuje natywny confirm()
// showConfirm({ title, message, confirmLabel, danger, onConfirm })
// ============================================================
function showConfirm({ title, message, confirmLabel = 'Potwierdź', danger = false, onConfirm }) {
  // Usuń poprzedni modal jeśli istnieje
  const existing = document.getElementById('confirm-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.id = 'confirm-overlay';

  overlay.innerHTML = `
    <div class="confirm-modal" id="confirm-modal">
      <div class="confirm-title">${title}</div>
      ${message ? `<div class="confirm-message">${message}</div>` : ''}
      <div class="confirm-actions">
        <button class="confirm-btn-cancel" id="confirm-cancel">Anuluj</button>
        <button class="confirm-btn-ok${danger ? ' danger' : ''}" id="confirm-ok">${confirmLabel}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animacja wejścia
  requestAnimationFrame(() => overlay.classList.add('open'));

  function close() {
    overlay.classList.remove('open');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  }

  document.getElementById('confirm-cancel').onclick = close;
  document.getElementById('confirm-ok').onclick = () => { close(); onConfirm(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  // Zamknij na Escape
  function onKey(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  }
  document.addEventListener('keydown', onKey);
}
