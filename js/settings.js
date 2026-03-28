// ============================================================
// SETTINGS
// ============================================================

function saveToken() {
  const val = document.getElementById('token-input').value.trim();
  if (!val) { showToast('❌ Wpisz token'); return; }
  localStorage.setItem('ironman_token', val);
  document.getElementById('token-status').innerHTML = '<span style="color:var(--green)">✅ Token zapisany na tym urządzeniu</span>';
  showToast('✅ Token zapisany');
}

function clearToken() {
  localStorage.removeItem('ironman_token');
  document.getElementById('token-input').value = '';
  document.getElementById('token-status').innerHTML = '<span style="color:var(--red)">Token usunięty</span>';
  showToast('Token usunięty');
}

function toggleTokenVisibility() {
  const inp = document.getElementById('token-input');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

async function testConnection() {
  const res = document.getElementById('test-result');
  if (!getToken()) {
    res.innerHTML = '<span style="color:var(--red)">❌ Brak tokena — wpisz token powyżej i zapisz</span>';
    return;
  }
  res.innerHTML = '<span style="color:var(--amber)">⏳ Testuję...</span>';
  try {
    const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 'Authorization': `token ${getToken()}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (r.ok) {
      res.innerHTML = '<span style="color:var(--green)">✅ Połączenie działa! Gist dostępny.</span>';
    } else {
      const j = await r.json();
      res.innerHTML = `<span style="color:var(--red)">❌ Błąd ${r.status}: ${j.message}</span><br><span style="color:var(--text3)">Wygeneruj nowy token na github.com/settings/tokens</span>`;
    }
  } catch(e) {
    res.innerHTML = '<span style="color:var(--red)">❌ Brak internetu lub błąd sieci</span>';
  }
}

function renderSettings() {
  const inp = document.getElementById('token-input');
  const status = document.getElementById('token-status');
  const token = getToken();
  if (token) {
    inp.value = token;
    status.innerHTML = '<span style="color:var(--green)">✅ Token zapisany na tym urządzeniu</span>';
  } else {
    inp.value = '';
    status.innerHTML = '<span style="color:var(--amber)">⚠️ Brak tokena — synchronizacja nie działa</span>';
  }
  document.getElementById('test-result').innerHTML = '';
}
