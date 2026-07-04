/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Global Error Boundary & 404 Handler (Prompt 3)
   ─ Renders a clean error card when a module init() throws
   ─ 404 page for unknown routes
   ─ window.onerror + unhandledrejection global handlers
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Error = (function () {

  function renderPageError(sectionId, moduleName, err) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const msg = err?.message || String(err) || 'Unknown error';
    section.innerHTML = `
      <div class="er-wrap">
        <div class="er-card">
          <div class="er-icon-row">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="er-title">Module failed to load</div>
          <div class="er-module">${_esc(moduleName)}</div>
          <div class="er-msg">${_esc(msg)}</div>
          <div class="er-actions">
            <button class="er-btn er-btn-primary" onclick="window.location.reload()">Reload page</button>
            <a class="er-btn er-btn-ghost" href="https://github.com/Simon-Mufara/Omics-Lab/issues/new?title=Module+error:+${encodeURIComponent(moduleName)}&body=${encodeURIComponent('Module: ' + moduleName + '\nError: ' + msg)}" target="_blank" rel="noopener">Report issue</a>
          </div>
        </div>
      </div>`;
  }

  function render404(page) {
    const main = document.querySelector('.main-content') || document.body;
    /* Show in any currently-visible section placeholder */
    let target = document.querySelector('.reveal:not([style*="display: none"])');
    if (!target) {
      target = document.createElement('div');
      target.className = 'reveal';
      main.appendChild(target);
    }
    target.innerHTML = `
      <div class="er-wrap">
        <div class="er-card er-404-card">
          <div class="er-404-num">404</div>
          <div class="er-title">Page not found</div>
          <div class="er-msg">The route <code class="er-code">#/${_esc(page)}</code> doesn't exist.</div>
          <div class="er-suggest-label">Suggested pages:</div>
          <div class="er-suggest-grid">
            ${[['Home','home'],['Lab','lab'],['Analysis','analysis'],['Variant Interpreter','variantinterp'],['AI Assistant','ai'],['PubMed','pubmed']].map(([label,route]) =>
              `<button class="er-suggest-btn" onclick="OmicsLab.Router.navigate('${route}')">${_esc(label)}</button>`
            ).join('')}
          </div>
        </div>
      </div>`;
  }

  function _esc(s) {
    return String(s || '').replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function _injectStyles() {
    if (document.getElementById('er-styles')) return;
    const s = document.createElement('style');
    s.id = 'er-styles';
    s.textContent = `
      .er-wrap{display:flex;align-items:center;justify-content:center;min-height:60vh;padding:2rem 1rem}
      .er-card{background:#111B2E;border:1px solid #182236;border-radius:14px;padding:2rem 2.25rem;max-width:440px;width:100%;text-align:center}
      .er-icon-row{margin-bottom:.9rem}
      .er-title{font-size:1.05rem;font-weight:700;color:#E4DDD2;margin-bottom:.35rem}
      .er-module{font-size:.78rem;color:#58a6ff;font-family:monospace;background:#0D1524;border-radius:5px;padding:.2rem .55rem;display:inline-block;margin-bottom:.5rem}
      .er-msg{font-size:.8rem;color:#A8A098;line-height:1.6;margin-bottom:1.2rem}
      .er-code{background:#0D1524;border-radius:4px;padding:.1rem .35rem;font-family:monospace;color:#e3b341}
      .er-actions{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap}
      .er-btn{display:inline-block;padding:.42rem 1rem;border-radius:7px;font-size:.82rem;font-weight:600;cursor:pointer;text-decoration:none}
      .er-btn-primary{background:#007A6A;border:1px solid #00C4A0;color:#fff}
      .er-btn-primary:hover{background:#007A6A}
      .er-btn-ghost{background:#182236;border:1px solid #243048;color:#A8A098}
      .er-btn-ghost:hover{background:#2d333b}
      .er-404-num{font-size:5rem;font-weight:800;color:#182236;line-height:1;margin-bottom:.5rem}
      .er-suggest-label{font-size:.72rem;color:#A8A098;margin:1rem 0 .5rem;text-transform:uppercase;letter-spacing:.05em}
      .er-suggest-grid{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center}
      .er-suggest-btn{background:#182236;border:1px solid #243048;border-radius:6px;padding:.32rem .75rem;font-size:.78rem;color:#A8A098;cursor:pointer}
      .er-suggest-btn:hover{background:#2d333b;border-color:#58a6ff;color:#58a6ff}
    `;
    document.head.appendChild(s);
  }

  function init() {
    _injectStyles();
    window.onerror = (msg, src, line, col, err) => {
      console.error('[OmicsLab Error]', msg, src, line, col, err);
      /* Only surface critical errors to notify, not every script error */
      if (src && !src.includes('omicslab') && !src.includes('Omics-Lab')) return false;
      OmicsLab.Notify?.error(`An error occurred. ${err?.message || msg}`, { duration: 0 });
      return false;
    };
    window.onunhandledrejection = e => {
      console.error('[OmicsLab Unhandled Rejection]', e.reason);
      const msg = e.reason?.message || String(e.reason) || 'Unhandled promise rejection';
      if (msg.includes('Network') || msg.includes('fetch') || msg.includes('CORS')) return;
      OmicsLab.Notify?.warning(`Background error: ${msg}`);
    };
  }

  return { renderPageError, render404, init };
})();
