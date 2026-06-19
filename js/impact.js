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
      { name:'Nigeria', count:3200, color:'#3fb950' },
      { name:'South Africa', count:2800, color:'#58a6ff' },
      { name:'Kenya', count:2100, color:'#e3b341' },
      { name:'Ethiopia', count:1500, color:'#f97316' },
      { name:'Ghana', count:1400, color:'#bc8cff' },
      { name:'Cameroon', count:780, color:'#79c0ff' },
      { name:'Uganda', count:720, color:'#ff6b6b' },
      { name:'Tanzania', count:650, color:'#58a6ff' },
      { name:'Senegal', count:540, color:'#3fb950' },
      { name:'Rwanda', count:410, color:'#e3b341' },
    ],
    toolUsage: [
      { tool:'Variant Interpreter', uses:51200, color:'#ff6b6b' },
      { tool:'AI Assistant', uses:38900, color:'#58a6ff' },
      { tool:'Grant Generator', uses:22400, color:'#3fb950' },
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
      svg += `<text x="${x}" y="${H - 8}" text-anchor="middle" font-size="9" fill="#8b949e">${d.month.split(' ')[0]}</text>`;
    });
    svg += `<text x="${pad.l - 4}" y="${pad.t + 4}" text-anchor="end" font-size="9" fill="#8b949e">${(maxU/1000).toFixed(0)}k</text>`;
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
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
          <div class="im-hero-card"><span class="im-hero-n" style="color:#3fb950">${A.mentorConnections.toLocaleString()}</span><span class="im-hero-l">Mentor connections</span></div>
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
      </div>`;
  }

  return { init };
})();
