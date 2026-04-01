// ============================================================
// POOLS — ekran z harmonogramami basenów
// ============================================================

const AGH_META_URL        = 'assets/agh-schedule-meta.json';
const AGH_IMG_URL         = 'assets/agh-schedule.webp';
const AGH_SITE_URL        = 'https://basen.agh.edu.pl/plywalnia/rezerwacje';
const EISENBERGA_META_URL = 'assets/eisenberga-schedule-meta.json';
const EISENBERGA_SITE_URL = 'https://www.przystannaeisenberga.pl/harmonogram/';

const PDFJS_CDN = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
const PDFJS_WORKER = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

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
// PDF.js — leniwe ładowanie biblioteki
// ============================================================

let _pdfjsLoaded = false;
let _pdfjsLoading = null;

function loadPdfJs() {
  if (_pdfjsLoaded) return Promise.resolve();
  if (_pdfjsLoading) return _pdfjsLoading;

  _pdfjsLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PDFJS_CDN;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      _pdfjsLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return _pdfjsLoading;
}

// ============================================================
// EISENBERGA — PDF.js viewer
// ============================================================

let _eisSchedules  = [];
let _eisCurrentIdx = 0;
let _eisPdfDocs    = {};   // idx → PDFDocumentProxy

async function switchEisenbergaTab(idx) {
  _eisCurrentIdx = idx;

  document.querySelectorAll('.pool-tab').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });

  const s = _eisSchedules[idx];
  if (!s) return;

  const wrap = document.getElementById('eis-pdf-wrap');
  if (!wrap) return;

  renderEisPdfViewer(wrap, s, idx);
}

function renderEisPdfViewer(wrap, schedule, idx) {
  const externalUrl = schedule.pdf_url;
  wrap.innerHTML = `
    <div class="eis-pdf-viewer" id="eis-viewer-${idx}">
      <div class="eis-pdf-toolbar" id="eis-toolbar-${idx}">
        <button class="eis-nav-btn" id="eis-prev-${idx}" onclick="eisPdfPrev(${idx})" disabled>◀</button>
        <span class="eis-page-info" id="eis-pageinfo-${idx}">…</span>
        <button class="eis-nav-btn" id="eis-next-${idx}" onclick="eisPdfNext(${idx})">▶</button>
        <a class="eis-open-btn" href="${externalUrl}" target="_blank" rel="noopener">Otwórz ↗</a>
      </div>
      <div class="eis-pdf-canvas-wrap" id="eis-canvas-wrap-${idx}">
        <div class="eis-pdf-loading" id="eis-loading-${idx}">Ładuję PDF…</div>
      </div>
    </div>
  `;

  loadEisPdf(schedule, idx);
}

async function loadEisPdf(schedule, idx) {
  const loadingEl = document.getElementById(`eis-loading-${idx}`);
  const canvasWrap = document.getElementById(`eis-canvas-wrap-${idx}`);

  try {
    await loadPdfJs();

    const url = schedule.local_path ? assetUrl(schedule.local_path) : schedule.pdf_url;
    const pdf = await window.pdfjsLib.getDocument(url).promise;
    _eisPdfDocs[idx] = { doc: pdf, page: 1, total: pdf.numPages };

    updateEisPageInfo(idx);
    await renderEisPdfPage(idx, 1);

  } catch (e) {
    console.error('PDF.js error:', e);
    if (canvasWrap) {
      canvasWrap.innerHTML = `
        <div class="pool-pdf-fallback" style="display:flex;">
          <div class="pool-pdf-fallback-inner">
            <div class="pool-pdf-fallback-icon">📄</div>
            <div class="pool-pdf-fallback-text">Nie udało się załadować podglądu PDF</div>
            <a class="pool-pdf-fallback-btn" href="${schedule.pdf_url}" target="_blank" rel="noopener">Otwórz PDF ↗</a>
          </div>
        </div>`;
    }
  }
}

async function renderEisPdfPage(idx, pageNum) {
  const state = _eisPdfDocs[idx];
  if (!state) return;

  const canvasWrap = document.getElementById(`eis-canvas-wrap-${idx}`);
  if (!canvasWrap) return;

  // Pokaż spinner podczas renderowania
  const existingCanvas = canvasWrap.querySelector('canvas');
  if (!existingCanvas) {
    canvasWrap.innerHTML = '<div class="eis-pdf-loading">Renderuję stronę…</div>';
  }

  try {
    const page = await state.doc.getPage(pageNum);
    const containerWidth = canvasWrap.clientWidth || 340;
    const viewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.className = 'eis-pdf-canvas';
    canvas.width  = scaledViewport.width;
    canvas.height = scaledViewport.height;

    canvasWrap.innerHTML = '';
    canvasWrap.appendChild(canvas);

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport: scaledViewport,
    }).promise;

    state.page = pageNum;
    updateEisPageInfo(idx);
    updateEisNavButtons(idx);

  } catch (e) {
    console.error('Page render error:', e);
  }
}

function updateEisPageInfo(idx) {
  const state = _eisPdfDocs[idx];
  const el = document.getElementById(`eis-pageinfo-${idx}`);
  if (el && state) el.textContent = `${state.page} / ${state.total}`;
}

function updateEisNavButtons(idx) {
  const state = _eisPdfDocs[idx];
  if (!state) return;
  const prev = document.getElementById(`eis-prev-${idx}`);
  const next = document.getElementById(`eis-next-${idx}`);
  if (prev) prev.disabled = state.page <= 1;
  if (next) next.disabled = state.page >= state.total;
}

function eisPdfPrev(idx) {
  const state = _eisPdfDocs[idx];
  if (!state || state.page <= 1) return;
  renderEisPdfPage(idx, state.page - 1);
}

function eisPdfNext(idx) {
  const state = _eisPdfDocs[idx];
  if (!state || state.page >= state.total) return;
  renderEisPdfPage(idx, state.page + 1);
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

  // ---- Eisenberga — PDF.js viewer ----
  try {
    const res = await fetch(assetUrl(EISENBERGA_META_URL) + '?_=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const meta = await res.json();
    const schedules = meta.schedules || [];
    if (!schedules.length) throw new Error('No schedules');

    _eisSchedules  = schedules;
    _eisCurrentIdx = 0;
    _eisPdfDocs    = {};

    const date = formatPoolDate(meta.fetched_at);
    const tabsHtml = schedules.map((s, i) =>
      `<button class="pool-tab${i === 0 ? ' active' : ''}" onclick="switchEisenbergaTab(${i})">${s.title}</button>`
    ).join('');

    document.getElementById('eisenberga-body').innerHTML = `
      <div class="pool-meta">
        <div class="pool-tabs">${tabsHtml}</div>
        ${date ? `<span class="pool-meta-updated">Zaktualizowano: ${date}</span>` : ''}
      </div>
      <div id="eis-pdf-wrap"></div>
    `;

    const wrap = document.getElementById('eis-pdf-wrap');
    renderEisPdfViewer(wrap, schedules[0], 0);

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
