// ============================================================
// SYNC — GitHub Gist
// ============================================================

function setSyncStatus(s, msg) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  const icons = { idle:'☁️', syncing:'⏳', ok:'✅', error:'❌' };
  el.textContent = icons[s] + ' ' + (msg || { idle:'Zsynchronizowano', syncing:'Synchronizuję...', ok:'Zapisano w chmurze', error:'Błąd sync' }[s]);
  el.className = 'sync-badge sync-' + s;
}

async function syncFromGist() {
  setSyncStatus('syncing', 'Pobieranie z chmury...');
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 'Authorization': `token ${getToken()}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const gist = await res.json();
    const content = gist.files[GIST_FILE]?.content;
    if (content && content.trim() !== '{}') {
      const remote = JSON.parse(content);
      if (remote.data) data = remote.data;
      if (remote.sessionLog) sessionLog = remote.sessionLog;
      if (remote.doneState) doneState = { ...remote.doneState, ...doneState };
      saveToStorage();
    }
    setSyncStatus('ok', 'zsync ☁️');
    return true;
  } catch(e) {
    setSyncStatus('error', 'błąd pobierania');
    console.error(e);
    return false;
  }
}

async function syncToGist() {
  setSyncStatus('syncing', 'zapis...');
  try {
    const payload = { data, sessionLog, doneState, updatedAt: new Date().toISOString() };
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
    setSyncStatus('ok', 'zapisano ☁️');
  } catch(e) {
    setSyncStatus('error', 'błąd zapisu');
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
