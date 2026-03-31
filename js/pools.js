// ============================================================
// POOLS — ekran z harmonogramami basenów
// ============================================================

const AGH_META_URL        = 'assets/agh-schedule-meta.json';
const AGH_IMG_URL         = 'assets/agh-schedule.webp';
const AGH_SITE_URL        = 'https://basen.agh.edu.pl/plywalnia/rezerwacje';
const EISENBERGA_META_URL = 'assets/eisenberga-schedule-meta.json';
const EISENBERGA_SITE_URL = 'https://www.przystannaeisenberga.pl/harmonogram/';

function formatPoolDate(isoStr) {
  if (!isoStr) return null;
  try {
    return new Date(isoStr).toLocaleString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw'
    });
  } catch (e) { return null; }
}

// Absolutny URL do assetu — działa poprawnie w PWA z blob service worker
function assetUrl(path) {
  return location.origin + location.pathname.replace(/\/[^/]*$/, '/') + path;
}

// ============================================================
// EISENBERGA — tab switcher + iframe z PDF
// ============================================================

let _eisSchedules = [];
let _eisCurrentIdx = 0;

function switchEisenbergaTab(idx) {
  _eisCurrentIdx = idx;

  document.querySelectorAll('.pool-tab').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });

  const s = _eisSchedules[idx];
  if (!s) return;

  // Zastąp iframe nowym (reset src przez clone eliminuje problem z cache iOS)
  const wrap = document.getElementById('eis-iframe-wrap');
  if (!wrap) return;
  wrap.innerHTML = buildEisIframeHtml(s._resolvedUrl, idx, s.pdf_url);
  setupEisIframeFallback(idx);
}

function buildEisIframeHtml(localUrl, idx, externalUrl) {
  const fallbackHref = externalUrl || localUrl;
  return `
    <iframe
      id="eis-iframe-${idx}"
      class="pool-iframe"
      src="${localUrl}"
      title="Harmonogram Eisenberga"
      loading="lazy"
      allowfullscreen>
    </iframe>
    <div class="pool-pdf-fallback" id="eis-fallback-${idx}" style="display:none;">
      <div class="pool-pdf-fallback-inner">
        <div class="pool-pdf-fallback-icon">📄</div>
        <div class="pool-pdf-fallback-text">Podgląd PDF niedostępny w tej przeglądarce</div>
        <a class="pool-pdf-fallback-btn" href="${fallbackHref}" target="_blank" rel="noopener">
          Otwórz PDF ↗
        </a>
      </div>
    </div>
  `;
}

function setupEisIframeFallback(idx) {
  const iframe = document.getElementById(`eis-iframe-${idx}`);
  const fallback = document.getElementById(`eis-fallback-${idx}`);
  if (!iframe || !fallback) return;

  // Timeout — jeśli iframe nie załaduje się w 6s, pokaż fallback
  const timer = setTimeout(() => {
    if (fallback) {
      iframe.style.display = 'none';
      fallback.style.display = 'flex';
    }
  }, 6000);

  iframe.addEventListener('load', () => {
    clearTimeout(timer);
    // Sprawdź czy iframe nie jest pusty (iOS często ładuje pusty dokument)
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc && (doc.body?.innerHTML === '' || doc.title === '')) {
        iframe.style.display = 'none';
        fallback.style.display = 'flex';
      }
    } catch (_) {
      // Cross-origin — nie możemy sprawdzić, zakładamy że OK
      clearTimeout(timer);
    }
  });

  iframe.addEventListener('error', () => {
    clearTimeout(timer);
    iframe.style.display = 'none';
    fallback.style.display = 'flex';
  });
}

// ============================================================
// MAIN RENDER
// ============================================================

async function renderPools() {
  const container = document.getElementById('screen-pools');

  container.innerHTML = `
    <div class="pools-screen">
      <h2 class="pools-heading">Baseny</h2>

      <!-- AGH -->
      <div class="pool-card">
        <div class="pool-card-header">
          <div>
            <div class="pool-name">Basen AGH</div>
            <div class="pool-address">ul. Jana Buszka 4, Kraków</div>
          </div>
          <a class="pool-ext-link" href="${AGH_SITE_URL}" target="_blank" rel="noopener">Otwórz stronę ↗</a>
        </div>
        <div class="pool-meta" id="agh-meta">
          <span class="pool-meta-loading">Ładuję harmonogram…</span>
        </div>
        <div class="pool-schedule-wrap" id="agh-schedule-wrap">
          <img class="pool-schedule-img" id="agh-img" src="" alt="Harmonogram Basen AGH">
        </div>
      </div>

      <!-- Eisenberga -->
      <div class="pool-card" id="pool-eisenberga-card">
        <div class="pool-card-header">
          <div>
            <div class="pool-name">Przystań na Eisenberga</div>
            <div class="pool-address">ul. Filipa Eisenberga 4, Kraków</div>
          </div>
          <a class="pool-ext-link" href="${EISENBERGA_SITE_URL}" target="_blank" rel="noopener">Otwórz stronę ↗</a>
        </div>
        <div id="eisenberga-body">
          <div class="pool-meta"><span class="pool-meta-loading">Ładuję harmonogram…</span></div>
        </div>
      </div>
    </div>
  `;

  // ---- AGH — obrazek przez absolutny URL ----
  const aghImgEl  = document.getElementById('agh-img');
  const aghWrapEl = document.getElementById('agh-schedule-wrap');

  if (aghImgEl) {
    aghImgEl.onerror = () => {
      if (aghWrapEl) aghWrapEl.innerHTML = '<div class="pool-no-schedule">Brak obrazka — zostanie pobrany o 8:00.</div>';
    };
    aghImgEl.src = assetUrl(AGH_IMG_URL);
  }

  try {
    const res = await fetch(assetUrl(AGH_META_URL) + '?_=' + Date.now());
    if (res.ok) {
      const meta = await res.json();
      const el = document.getElementById('agh-meta');
      if (el) {
        const date = formatPoolDate(meta.fetched_at);
        el.innerHTML = `
          <span class="pool-meta-title">${meta.title || 'Harmonogram'}</span>
          ${date ? `<span class="pool-meta-updated">Zaktualizowano: ${date}</span>` : ''}
        `;
      }
      if (aghImgEl && meta.fetched_at) {
        aghImgEl.src = assetUrl(AGH_IMG_URL) + '?_=' + new Date(meta.fetched_at).getTime();
      }
    }
  } catch (e) {
    const el = document.getElementById('agh-meta');
    if (el) el.innerHTML = '<span class="pool-meta-updated">Aktualizowany codziennie o 8:00</span>';
  }

  // ---- Eisenberga — iframe z bezpośrednim URL do PDF + fallback ----
  try {
    const res = await fetch(assetUrl(EISENBERGA_META_URL) + '?_=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const meta = await res.json();
    const schedules = meta.schedules || [];
    if (!schedules.length) throw new Error('No schedules');

    _eisSchedules = schedules.map(s => ({
      ...s,
      // Użyj lokalnego assetu jeśli dostępny, fallback na zewnętrzny URL
      _resolvedUrl: s.local_path ? assetUrl(s.local_path) : s.pdf_url,
    }));
    _eisCurrentIdx = 0;

    const date = formatPoolDate(meta.fetched_at);
    const tabsHtml = _eisSchedules.map((s, i) =>
      `<button class="pool-tab${i === 0 ? ' active' : ''}" onclick="switchEisenbergaTab(${i})">${s.title}</button>`
    ).join('');

    document.getElementById('eisenberga-body').innerHTML = `
      <div class="pool-meta">
        <div class="pool-tabs">${tabsHtml}</div>
        ${date ? `<span class="pool-meta-updated">Zaktualizowano: ${date}</span>` : ''}
      </div>
      <div class="pool-iframe-wrap" id="eis-iframe-wrap">
        ${buildEisIframeHtml(_eisSchedules[0]._resolvedUrl, 0, _eisSchedules[0].pdf_url)}
      </div>
    `;

    setupEisIframeFallback(0);

  } catch (e) {
    document.getElementById('eisenberga-body').innerHTML = `
      <div class="pool-meta">
        <span class="pool-meta-updated">Brak danych — spróbuj odświeżyć stronę</span>
      </div>
      <div class="pool-schedule-wrap">
        <div class="pool-no-schedule">
          Harmonogram niedostępny.<br>
          <a class="pool-ext-link" href="${EISENBERGA_SITE_URL}" target="_blank" rel="noopener" style="display:inline-block;margin-top:12px;">Otwórz stronę Eisenberga ↗</a>
        </div>
      </div>
    `;
  }
}
