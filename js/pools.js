// ============================================================
// POOLS — ekran z harmonogramami basenów
// ============================================================

const AGH_META_URL        = 'assets/agh-schedule-meta.json';
const AGH_IMG_URL         = 'assets/agh-schedule.jpg';
const AGH_SITE_URL        = 'https://basen.agh.edu.pl/plywalnia/rezerwacje';
const EISENBERGA_META_URL = 'assets/eisenberga-schedule-meta.json';
const EISENBERGA_SITE_URL = 'https://www.przystannaeisenberga.pl/harmonogram/';

// ============================================================
// LIGHTBOX — zoom + pan dla obrazka AGH
// ============================================================

(function() {
  let _scale = 1;
  let _tx = 0, _ty = 0;       // translate
  let _dragging = false;
  let _startX, _startY, _startTx, _startTy;

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 8;

  function applyTransform(img) {
    img.style.transform = `translate(${_tx}px, ${_ty}px) scale(${_scale})`;
  }

  function clampTranslate(img, tx, ty) {
    // Pozwól na swobodne przesuwanie — bez twardych granic
    return { tx, ty };
  }

  window.openLightbox = function(src, alt) {
    const lb     = document.getElementById('lightbox');
    const img    = document.getElementById('lightbox-img');
    const stage  = document.getElementById('lightbox-stage');
    if (!lb || !img || !stage) return;

    // Reset stanu
    _scale = 1; _tx = 0; _ty = 0;
    img.src = src;
    img.alt = alt || '';
    applyTransform(img);

    lb.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Po załadowaniu wyśrodkuj tak, żeby wypełniał stage
    img.onload = () => {
      const sw = stage.clientWidth, sh = stage.clientHeight;
      const iw = img.naturalWidth,   ih = img.naturalHeight;
      // Dopasuj do wysokości lub szerokości stage
      const fitScale = Math.min(sw / iw, sh / ih);
      _scale = fitScale;
      _tx = (sw - iw * fitScale) / 2;
      _ty = (sh - ih * fitScale) / 2;
      applyTransform(img);
    };
    // Jeśli już załadowany (cache)
    if (img.complete && img.naturalWidth) img.onload();
  };

  window.closeLightbox = function() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.style.display = 'none';
    document.body.style.overflow = '';
  };

  document.addEventListener('DOMContentLoaded', () => {
    const lb    = document.getElementById('lightbox');
    const img   = document.getElementById('lightbox-img');
    const stage = document.getElementById('lightbox-stage');
    const closeBtn = document.getElementById('lightbox-close');
    if (!lb || !img || !stage || !closeBtn) return;

    closeBtn.addEventListener('click', closeLightbox);

    // Klik w tło (nie w obrazek) — zamknij
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target === stage) closeLightbox();
    });

    // ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lb.style.display !== 'none') closeLightbox();
    });

    // ---- Zoom kółkiem myszy ----
    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const delta = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, _scale * delta));
      const ratio = newScale / _scale;

      // Zoom w kierunku kursora
      _tx = mx - ratio * (mx - _tx);
      _ty = my - ratio * (my - _ty);
      _scale = newScale;
      applyTransform(img);
    }, { passive: false });

    // ---- Drag (pan) ----
    stage.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      _dragging = true;
      _startX = e.clientX; _startY = e.clientY;
      _startTx = _tx; _startTy = _ty;
      stage.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!_dragging) return;
      _tx = _startTx + (e.clientX - _startX);
      _ty = _startTy + (e.clientY - _startY);
      applyTransform(img);
    });

    document.addEventListener('mouseup', () => {
      if (!_dragging) return;
      _dragging = false;
      stage.classList.remove('dragging');
    });

    // ---- Pinch-to-zoom (touch) ----
    let _lastDist = null;
    let _lastMidX, _lastMidY;

    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0], t1 = e.touches[1];
        _lastDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        const rect = stage.getBoundingClientRect();
        _lastMidX = ((t0.clientX + t1.clientX) / 2) - rect.left;
        _lastMidY = ((t0.clientY + t1.clientY) / 2) - rect.top;
      } else if (e.touches.length === 1) {
        _dragging = true;
        _startX = e.touches[0].clientX; _startY = e.touches[0].clientY;
        _startTx = _tx; _startTy = _ty;
      }
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && _lastDist !== null) {
        e.preventDefault();
        const t0 = e.touches[0], t1 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        const rect = stage.getBoundingClientRect();
        const midX = ((t0.clientX + t1.clientX) / 2) - rect.left;
        const midY = ((t0.clientY + t1.clientY) / 2) - rect.top;

        const ratio = dist / _lastDist;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, _scale * ratio));
        const sr = newScale / _scale;
        _tx = midX - sr * (midX - _tx);
        _ty = midY - sr * (midY - _ty);
        _scale = newScale;
        _lastDist = dist;
        applyTransform(img);
      } else if (e.touches.length === 1 && _dragging) {
        _tx = _startTx + (e.touches[0].clientX - _startX);
        _ty = _startTy + (e.touches[0].clientY - _startY);
        applyTransform(img);
      }
    }, { passive: false });

    stage.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) _lastDist = null;
      if (e.touches.length === 0) _dragging = false;
    }, { passive: true });
  });
})();

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
  wrap.innerHTML = buildEisIframeHtml(s.pdf_url, idx);
  setupEisIframeFallback(idx);
}

function buildEisIframeHtml(pdfUrl, idx) {
  return `
    <iframe
      id="eis-iframe-${idx}"
      class="pool-iframe"
      src="${pdfUrl}"
      title="Harmonogram Eisenberga"
      loading="lazy"
      allowfullscreen>
    </iframe>
    <div class="pool-pdf-fallback" id="eis-fallback-${idx}" style="display:none;">
      <div class="pool-pdf-fallback-inner">
        <div class="pool-pdf-fallback-icon">📄</div>
        <div class="pool-pdf-fallback-text">Podgląd PDF niedostępny w tej przeglądarce</div>
        <a class="pool-pdf-fallback-btn" href="${pdfUrl}" target="_blank" rel="noopener">
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
    aghImgEl.style.cursor = 'zoom-in';
    aghImgEl.addEventListener('click', () => {
      openLightbox(aghImgEl.src, 'Harmonogram Basen AGH');
    });
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

    _eisSchedules = schedules;
    _eisCurrentIdx = 0;

    const date = formatPoolDate(meta.fetched_at);
    const tabsHtml = schedules.map((s, i) =>
      `<button class="pool-tab${i === 0 ? ' active' : ''}" onclick="switchEisenbergaTab(${i})">${s.title}</button>`
    ).join('');

    document.getElementById('eisenberga-body').innerHTML = `
      <div class="pool-meta">
        <div class="pool-tabs">${tabsHtml}</div>
        ${date ? `<span class="pool-meta-updated">Zaktualizowano: ${date}</span>` : ''}
      </div>
      <div class="pool-iframe-wrap" id="eis-iframe-wrap">
        ${buildEisIframeHtml(schedules[0].pdf_url, 0)}
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
