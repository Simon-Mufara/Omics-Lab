/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Embedded External Apps
   Full-height iframe wrapper for Streamlit tools built by Simon Mufara
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.EmbeddedApps = (function () {

  const APPS = {
    'scrna-explorer': {
      name: 'scRNA-seq Clinical Explorer',
      badge: 'SINGLE-CELL',
      badgeColor: '#bc8cff',
      url: 'https://scrna-analysis.streamlit.app/?embed=true',
      urlFull: 'https://scrna-analysis.streamlit.app',
      desc: 'Interactive single-cell RNA-seq analysis — UMAP visualization, clustering, differential expression, and cell-type annotation built for clinical and research cohorts.',
      features: ['UMAP / PCA dimensionality reduction', 'Leiden/Louvain clustering', 'Differential expression (DESeq2/Wilcoxon)', 'Cell-type annotation', 'Marker gene dotplots'],
      color: '#bc8cff',
      bgColor: 'rgba(188,140,255,0.06)',
      borderColor: 'rgba(188,140,255,0.2)',
      related: 'single-cell',
    },
    'variants-explorer': {
      name: 'Variant Analysis Suite',
      badge: 'VARIANT CALLING',
      badgeColor: '#58a6ff',
      url: 'https://simon-variants.streamlit.app/?embed=true',
      urlFull: 'https://simon-variants.streamlit.app',
      desc: 'Clinical-grade genomic variant analysis — VCF ingestion, variant annotation, population frequency lookup, ACMG classification, and interactive filtering for NGS data.',
      features: ['VCF upload & parsing', 'Variant annotation (SnpEff/VEP)', 'gnomAD population frequencies', 'ACMG pathogenicity scoring', 'Filterable variant table & export'],
      color: '#58a6ff',
      bgColor: 'rgba(88,166,255,0.06)',
      borderColor: 'rgba(88,166,255,0.2)',
      related: 'variantinterp',
    },
  };

  function init(appKey) {
    const sectionId = appKey + '-section';
    const section = document.getElementById(sectionId);
    if (!section) return;
    if (section.dataset.eaReady) return;
    section.dataset.eaReady = '1';
    _render(section, APPS[appKey]);
  }

  function _render(section, app) {
    if (!app) return;
    section.innerHTML = `
    <div class="ea-page">
      <div class="ea-topbar" style="border-bottom-color:${app.borderColor}">
        <div class="ea-topbar-left">
          <span class="ea-badge" style="color:${app.badgeColor};border-color:${app.badgeColor}40;background:${app.badgeColor}0f">${app.badge}</span>
          <div>
            <div class="ea-app-name">${app.name}</div>
            <div class="ea-app-desc">${app.desc}</div>
          </div>
        </div>
        <div class="ea-topbar-right">
          <a class="ea-open-btn" href="${app.urlFull}" target="_blank" rel="noopener noreferrer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open full screen
          </a>
        </div>
      </div>

      <div class="ea-features-bar">
        ${app.features.map(f => `<span class="ea-feature-chip" style="border-color:${app.borderColor};color:${app.badgeColor}">${f}</span>`).join('')}
      </div>

      <div class="ea-frame-wrap" id="ea-frame-wrap-${app.badge.replace(/\s/g,'-')}">
        <div class="ea-loading" id="ea-loading-${app.badge.replace(/\s/g,'-')}">
          <div class="ea-spinner" style="border-top-color:${app.color}"></div>
          <div class="ea-loading-msg">Loading ${app.name}…</div>
        </div>
        <div class="ea-fallback" id="ea-fallback-${app.badge.replace(/\s/g,'-')}" style="display:none">
          <div class="ea-fallback-icon" style="border-color:${app.borderColor};background:${app.bgColor}">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${app.color}" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div class="ea-fallback-title">Open in a new tab</div>
          <p class="ea-fallback-msg">Some browsers block embedded apps from external sites. The app works perfectly when opened directly.</p>
          <a class="ea-fallback-btn" href="${app.urlFull}" target="_blank" rel="noopener noreferrer" style="background:${app.bgColor};border-color:${app.borderColor};color:${app.color}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open ${app.name}
          </a>
        </div>
        <iframe
          class="ea-iframe"
          id="ea-iframe-${app.badge.replace(/\s/g,'-')}"
          src="${app.url}"
          title="${app.name}"
          allow="camera; microphone; clipboard-write; fullscreen"
          loading="lazy"
          onload="OmicsLab.EmbeddedApps._onLoad('${app.badge.replace(/\s/g,'-')}')"
          onerror="OmicsLab.EmbeddedApps._onError('${app.badge.replace(/\s/g,'-')}')"
          style="display:none">
        </iframe>
      </div>
    </div>`;

    /* Timeout fallback — if iframe hasn't loaded in 12s, show fallback */
    setTimeout(() => {
      const iframe = document.getElementById(`ea-iframe-${app.badge.replace(/\s/g,'-')}`);
      if (iframe && iframe.style.display === 'none') {
        _onError(app.badge.replace(/\s/g,'-'));
      }
    }, 12000);
  }

  function _onLoad(key) {
    const loading = document.getElementById(`ea-loading-${key}`);
    const iframe  = document.getElementById(`ea-iframe-${key}`);
    const fallback = document.getElementById(`ea-fallback-${key}`);
    if (!loading || !iframe) return;

    /* Try to detect X-Frame-Options block — if blocked, contentDocument is null */
    try {
      const blocked = !iframe.contentWindow || !iframe.contentWindow.location;
      if (blocked) { _onError(key); return; }
    } catch { /* cross-origin — assume it loaded fine */ }

    loading.style.display = 'none';
    if (fallback) fallback.style.display = 'none';
    iframe.style.display = '';
  }

  function _onError(key) {
    const loading  = document.getElementById(`ea-loading-${key}`);
    const iframe   = document.getElementById(`ea-iframe-${key}`);
    const fallback = document.getElementById(`ea-fallback-${key}`);
    if (loading)  loading.style.display = 'none';
    if (iframe)   iframe.style.display = 'none';
    if (fallback) fallback.style.display = '';
  }

  return { init, _onLoad, _onError };
})();
