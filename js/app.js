// ============================================================
// SCREENS
// ============================================================

const VALID_SCREENS = ['plan', 'edit', 'log', 'pools', 'settings', 'breath', 'zones'];

// Mapowanie screen → id przycisku w bottom nav (tylko główne ekrany)
const BOTTOM_NAV_MAP = {
  plan: 'bnav-plan',
  log: 'bnav-log',
  pools: 'bnav-pools',
  breath: 'bnav-breath',
  zones: 'bnav-zones',
  settings: 'bnav-settings',
};

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');

  // Top nav active state
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-' + name);
  if (btn) btn.classList.add('active');

  // Bottom nav active state
  document.querySelectorAll('.bottom-nav-btn').forEach(b => b.classList.remove('active'));
  const bnavId = BOTTOM_NAV_MAP[name];
  if (bnavId) {
    const bnBtn = document.getElementById(bnavId);
    if (bnBtn) bnBtn.classList.add('active');
  }

  const bar = document.getElementById('save-bar');
  if (bar) bar.classList.toggle('hidden', name !== 'edit');
  if (name === 'plan') renderPlan();
  if (name === 'edit') renderEdit();
  if (name === 'log') renderLog();
  if (name === 'pools') renderPools();
  if (name === 'settings') renderSettings();
  if (name === 'breath') renderBreath();
  if (name === 'zones') renderZones();
  history.replaceState(null, '', '#' + name);
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

// Ustal ekran startowy: hash z URL → fallback na plan/settings
const _hashScreen = window.location.hash.replace('#', '');
const _startScreen = VALID_SCREENS.includes(_hashScreen) ? _hashScreen : null;

if (!getToken()) {
  showScreen('settings');
  showToast('⚙️ Wpisz token GitHub aby włączyć sync');
} else if (_startScreen) {
  showScreen(_startScreen);
  if (_startScreen === 'plan') syncFromGist().then(ok => { if (ok) renderPlan(); });
} else {
  showScreen('plan');
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
