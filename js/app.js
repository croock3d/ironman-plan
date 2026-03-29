// ============================================================
// SCREENS
// ============================================================

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-' + name);
  if (btn) btn.classList.add('active');
  const bar = document.getElementById('save-bar');
  if (bar) bar.classList.toggle('hidden', name !== 'edit');
  if (name === 'plan') renderPlan();
  if (name === 'edit') renderEdit();
  if (name === 'log') renderLog();
  if (name === 'settings') renderSettings();
}

// ============================================================
// INIT
// ============================================================
loadFromStorage();

// Odtwórz niezakończony trening z localStorage (jeśli istnieje)
const _savedActive = loadActiveWorkout();
if (_savedActive) {
  activeWorkout = _savedActive;
}

if (!getToken()) {
  showScreen('settings');
  document.getElementById('btn-settings').classList.add('active');
  showToast('⚙️ Wpisz token GitHub aby włączyć sync');
} else {
  showScreen('plan');
  document.getElementById('btn-plan').classList.add('active');
  syncFromGist().then(ok => { if (ok) renderPlan(); });
}

// ============================================================
// PWA — minimal offline cache via inline blob SW
// ============================================================
if ('serviceWorker' in navigator) {
  const swCode = `
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', e => {
  e.respondWith(caches.open('ironman-v1').then(cache =>
    cache.match(e.request).then(r => r || fetch(e.request).then(res => { cache.put(e.request, res.clone()); return res; }))
  ).catch(() => fetch(e.request)));
});`;
  const blob = new Blob([swCode], { type:'application/javascript' });
  const swUrl = URL.createObjectURL(blob);
  navigator.serviceWorker.register(swUrl).catch(()=>{});
}
