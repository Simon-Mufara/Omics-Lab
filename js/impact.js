/* ═══════════════════════════════════════════════════════
   OmicsLab — Impact Observatory (Part 8)
   Live-ish metrics of OmicsLab's reach across Africa.
   Uses localStorage for persisted local stats +
   static illustrative aggregate data.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Impact = (function () {

  /* Aggregate illustrative platform metrics */
  const AGGREGATE = {
    users: 14820,
    countries: 38,
    analyses: 192400,
    variants: 48300,
    grants: 2900,
    sequences: 6100,
    mentorConnections: 870,
    certifications: 3200,
    languages: 21,
    topCountries: [
      { name:'Nigeria', count:3200, color:'#00C4A0' },
      { name:'South Africa', count:2800, color:'#58a6ff' },
      { name:'Kenya', count:2100, color:'#e3b341' },
      { name:'Ethiopia', count:1500, color:'#f97316' },
      { name:'Ghana', count:1400, color:'#bc8cff' },
      { name:'Cameroon', count:780, color:'#79c0ff' },
      { name:'Uganda', count:720, color:'#ff6b6b' },
      { name:'Tanzania', count:650, color:'#58a6ff' },
      { name:'Senegal', count:540, color:'#00C4A0' },
      { name:'Rwanda', count:410, color:'#e3b341' },
    ],
    toolUsage: [
      { tool:'Variant Interpreter', uses:51200, color:'#ff6b6b' },
      { tool:'AI Assistant', uses:38900, color:'#58a6ff' },
      { tool:'Grant Generator', uses:22400, color:'#00C4A0' },
      { tool:'Thesis Coach', uses:19100, color:'#bc8cff' },
      { tool:'Genome Browser', uses:17800, color:'#e3b341' },
      { tool:'Population Structure', uses:14600, color:'#f97316' },
      { tool:'Codon Analysis', uses:12300, color:'#79c0ff' },
      { tool:'Nanopore QC', uses:10900, color:'#ff6b6b' },
    ],
    timeSeries: [
      { month:'Jan 2025', users:2100 },
      { month:'Feb 2025', users:3400 },
      { month:'Mar 2025', users:5200 },
      { month:'Apr 2025', users:7800 },
      { month:'May 2025', users:10400 },
      { month:'Jun 2025', users:14820 },
    ],
  };

  /* ── Citation formats ── */
  const _citeFormats = {
    apa: `Mufara, S. (2025). OmicsLab Simulator: An interactive omics training platform for African researchers (Version 2.0) [Software]. https://simon-mufara.github.io/Omics-Lab/`,
    bibtex: `@software{mufara2025omicslab,
  author    = {Mufara, Simon},
  title     = {OmicsLab Simulator},
  year      = {2025},
  version   = {2.0},
  url       = {https://simon-mufara.github.io/Omics-Lab/},
  note      = {Interactive omics training platform for African researchers}
}`,
    mla: `Mufara, Simon. OmicsLab Simulator. Version 2.0, 2025, https://simon-mufara.github.io/Omics-Lab/.`,
  };
  let _citeActive = 'apa';

  function _setCiteFormat(fmt) {
    _citeActive = fmt;
    const pre = document.getElementById('im-cite-text');
    if (pre) pre.textContent = _citeFormats[fmt];
    document.querySelectorAll('.im-cite-tab').forEach(t => t.classList.toggle('im-cite-tab--active', t.dataset.fmt === fmt));
  }

  function _copyCite() {
    navigator.clipboard?.writeText(_citeFormats[_citeActive]).then(() => {
      OmicsLab.Toast?.show('Citation copied', 'success');
    }).catch(() => {
      OmicsLab.Toast?.show(_citeFormats[_citeActive].slice(0, 60) + '…', 'info');
    });
  }

  function _getLocalStats() {
    const keys = ['omicslab_labnotebook_entries','omicslab_hackathon_teams','omicslab_certification','omicslab_my_dir_profile','omicslab_my_mentor_profile'];
    const nbEntries = JSON.parse(localStorage.getItem('omicslab_labnotebook_entries') || '[]').length;
    const certDone = Object.keys(JSON.parse(localStorage.getItem('omicslab_certification') || '{"completed":{}}').completed).length;
    return { nbEntries, certDone };
  }

  function _renderBarChart(items, maxVal) {
    return items.map(item => {
      const pct = (item.uses / maxVal * 100).toFixed(1);
      return `<div class="im-bar-row">
        <span class="im-bar-label">${item.tool || item.name}</span>
        <div class="im-bar-track">
          <div class="im-bar-fill" style="width:${pct}%;background:${item.color}"></div>
        </div>
        <span class="im-bar-val">${(item.uses || item.count).toLocaleString()}</span>
      </div>`;
    }).join('');
  }

  function _renderGrowthChart() {
    const data = AGGREGATE.timeSeries;
    const maxU = Math.max(...data.map(d => d.users));
    const W = 500, H = 120;
    const pad = { l:40, r:10, t:10, b:28 };
    const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    const pts = data.map((d, i) => {
      const x = pad.l + (i / (data.length - 1)) * plotW;
      const y = pad.t + (1 - d.users / maxU) * plotH;
      return `${x},${y}`;
    });
    const areaBase = H - pad.b;
    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px">`;
    svg += `<defs><linearGradient id="im-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#58a6ff" stop-opacity=".25"/><stop offset="100%" stop-color="#58a6ff" stop-opacity="0"/></linearGradient></defs>`;
    const areaPoints = `${pad.l},${areaBase} ${pts.join(' ')} ${pad.l + plotW},${areaBase}`;
    svg += `<polygon points="${areaPoints}" fill="url(#im-grad)"/>`;
    svg += `<polyline points="${pts.join(' ')}" fill="none" stroke="#58a6ff" stroke-width="1.5"/>`;
    data.forEach((d, i) => {
      const [x, y] = pts[i].split(',').map(Number);
      svg += `<circle cx="${x}" cy="${y}" r="3" fill="#58a6ff"/>`;
      svg += `<text x="${x}" y="${H - 8}" text-anchor="middle" font-size="9" fill="#A8A098">${d.month.split(' ')[0]}</text>`;
    });
    svg += `<text x="${pad.l - 4}" y="${pad.t + 4}" text-anchor="end" font-size="9" fill="#A8A098">${(maxU/1000).toFixed(0)}k</text>`;
    svg += '</svg>';
    return svg;
  }

  function init() {
    const section = document.getElementById('impact-section');
    if (!section || section.dataset.imReady) return;
    section.dataset.imReady = '1';
    const local = _getLocalStats();
    const A = AGGREGATE;
    const maxTool = Math.max(...A.toolUsage.map(t => t.uses));
    const maxCountry = Math.max(...A.topCountries.map(t => t.count));
    section.innerHTML = `
      <div class="im-wrap">
        <div class="im-header">
          <div class="im-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            Impact Observatory
          </div>
          <div class="im-header-sub">OmicsLab's reach across Africa — illustrative aggregate platform metrics</div>
        </div>
        <!-- Hero stats -->
        <div class="im-hero-grid">
          <div class="im-hero-card im-hero-primary"><span class="im-hero-n">${A.users.toLocaleString()}</span><span class="im-hero-l">Registered users</span></div>
          <div class="im-hero-card"><span class="im-hero-n" style="color:#f97316">${A.countries}</span><span class="im-hero-l">African countries</span></div>
          <div class="im-hero-card"><span class="im-hero-n" style="color:#58a6ff">${(A.analyses/1000).toFixed(1)}k</span><span class="im-hero-l">Analyses run</span></div>
          <div class="im-hero-card"><span class="im-hero-n" style="color:#bc8cff">${(A.variants/1000).toFixed(0)}k</span><span class="im-hero-l">Variants interpreted</span></div>
          <div class="im-hero-card"><span class="im-hero-n" style="color:#e3b341">${A.grants.toLocaleString()}</span><span class="im-hero-l">Grants drafted</span></div>
          <div class="im-hero-card"><span class="im-hero-n" style="color:#ff6b6b">${A.certifications.toLocaleString()}</span><span class="im-hero-l">Certificates issued</span></div>
          <div class="im-hero-card"><span class="im-hero-n" style="color:#00C4A0">${A.mentorConnections.toLocaleString()}</span><span class="im-hero-l">Mentor connections</span></div>
          <div class="im-hero-card"><span class="im-hero-n" style="color:#79c0ff">${A.languages}</span><span class="im-hero-l">Languages supported</span></div>
        </div>
        <!-- Local stats -->
        <div class="im-section-label">Your local session</div>
        <div class="im-local-row">
          <div class="im-local-chip"><span class="im-local-n">${local.nbEntries}</span><span class="im-local-l">Lab notebook entries</span></div>
          <div class="im-local-chip"><span class="im-local-n">${local.certDone}</span><span class="im-local-l">Modules completed</span></div>
        </div>
        <!-- Growth chart -->
        <div class="im-section-label">User growth (2025)</div>
        <div class="im-chart-card">${_renderGrowthChart()}</div>
        <!-- Two columns: top countries + tool usage -->
        <div class="im-two-col">
          <div>
            <div class="im-section-label">Top countries</div>
            <div class="im-bars">${_renderBarChart(A.topCountries.map(c => ({...c, uses:c.count})), maxCountry)}</div>
          </div>
          <div>
            <div class="im-section-label">Tool usage</div>
            <div class="im-bars">${_renderBarChart(A.toolUsage, maxTool)}</div>
          </div>
        </div>
        <div class="im-disclaimer">Aggregate numbers are illustrative projections for educational purposes. Local session data reflects this browser only.</div>

        <!-- Citation generator -->
        <div class="im-section-label" style="margin-top:2rem">Cite OmicsLab in Your Research</div>
        <div class="im-card" id="im-cite-card">
          <div class="im-cite-tabs" role="tablist">
            <button class="im-cite-tab im-cite-tab--active" role="tab" data-fmt="apa" onclick="OmicsLab.Impact._setCiteFormat('apa')">APA</button>
            <button class="im-cite-tab" role="tab" data-fmt="bibtex" onclick="OmicsLab.Impact._setCiteFormat('bibtex')">BibTeX</button>
            <button class="im-cite-tab" role="tab" data-fmt="mla" onclick="OmicsLab.Impact._setCiteFormat('mla')">MLA</button>
          </div>
          <pre id="im-cite-text" class="im-cite-pre">${_citeFormats['apa']}</pre>
          <button class="btn btn-ghost btn-sm" onclick="OmicsLab.Impact._copyCite()" style="margin-top:.5rem">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Citation
          </button>
        </div>

        <!-- Sustainability -->
        <div class="im-section-label" style="margin-top:2rem">Sustainability &amp; Support</div>
        <div class="im-card im-sustain-card">
          <p style="color:var(--text-secondary,#A8A098);font-size:.9rem;margin:0 0 1rem">OmicsLab is maintained by <strong>Simon Mufara</strong>, a computational biologist at UCT, with the mission to make world-class omics training free and accessible across Africa. It has no institutional funding — it exists through community support.</p>
          <div class="im-sustain-actions">
            <a href="https://github.com/Simon-Mufara/Omics-Lab" target="_blank" rel="noopener" class="im-sustain-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.17 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48A10.019 10.019 0 0 0 22 12c0-5.523-4.477-10-10-10z"/></svg>
              Star on GitHub
            </a>
            <a href="https://github.com/Simon-Mufara/Omics-Lab/issues" target="_blank" rel="noopener" class="im-sustain-btn im-sustain-btn--secondary">Report a Bug</a>
            <button class="im-sustain-btn im-sustain-btn--secondary" onclick="OmicsLab.Router?.navigate('settings')">
              Add Locale Translation
            </button>
          </div>
          <p style="color:var(--text-muted,#6E6860);font-size:.78rem;margin:1rem 0 0">If OmicsLab helped your research or teaching, consider sharing it with your network or citing it in your publications using the citation generator above.</p>
        </div>
      </div>`;
  }

  return { init, _setCiteFormat, _copyCite };
})();
