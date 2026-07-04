/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Personalised Home Dashboard (Prompt 9)
   ─ Shown above marketing content when returning to home
   ─ Continue where you left off, streak, Africa Pulse feed
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Dashboard = (function () {

  const HISTORY_KEY  = 'omicslab_nav_history';
  const STREAK_KEY   = 'omicslab_streak';
  const STREAK_DATE  = 'omicslab_streak_date';

  /* ─── Recent page tracking (called from router.js) ─── */
  function trackPage(page) {
    try {
      const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const filtered = list.filter(p => p !== page).slice(0, 9);
      filtered.unshift(page);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    } catch {}
    _updateStreak();
  }

  function _getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
  }

  /* ─── Streak logic ─── */
  function _updateStreak() {
    const today = new Date().toDateString();
    const last  = localStorage.getItem(STREAK_DATE);
    const streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
    if (last === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = last === yesterday ? streak + 1 : 1;
    localStorage.setItem(STREAK_KEY, newStreak);
    localStorage.setItem(STREAK_DATE, today);
  }

  function _getStreak() {
    return parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
  }

  /* ─── Page metadata (matches PAGES in router.js) ─── */
  const PAGE_META = {
    lab:            { label:'Lab Simulator',        icon:'flask',       color:'#00C4A0', sub:'14 interactive protocols' },
    analysis:       { label:'Analysis Suite',       icon:'bar-chart',   color:'#e3b341', sub:'FASTQ · VCF · MSA · RNA-seq' },
    variantinterp:  { label:'Variant Interpreter',  icon:'dna',         color:'#bc8cff', sub:'ACMG · gnomAD · ClinVar' },
    primerdesign:   { label:'Primer Design',        icon:'scissors',    color:'#00C4A0', sub:'Tm · GC% · dimer checks' },
    phylo:          { label:'Phylo Tree Builder',   icon:'git-branch',  color:'#00C4A0', sub:'NJ · UPGMA · Newick export' },
    heatmap:        { label:'Expression Visualiser',icon:'activity',    color:'#e3b341', sub:'Volcano · heatmap · DE table' },
    qualitypredictor:{label:'Quality Predictor',    icon:'check-circle',color:'#00C4A0', sub:'GATK · H3Africa thresholds' },
    pubmed:         { label:'PubMed',               icon:'file-text',   color:'#58a6ff', sub:'36M citations · Africa filter' },
    'gene-lookup':  { label:'Gene Lookup',          icon:'search',      color:'#00C4A0', sub:'Ensembl · gnomAD · AlphaFold' },
    nexus:          { label:'Nexus Hub',             icon:'brain',       color:'#58a6ff', sub:'Channels · threads · @mentions' },
    alerts:         { label:'Outbreak Alerts',      icon:'alert-triangle', color:'#ff6b6b', sub:'Live Africa surveillance' },
    career:         { label:'Career Quiz',          icon:'target',      color:'#bc8cff', sub:'Personalised roadmap' },
    paperhub:       { label:'PaperHub',             icon:'file-text',   color:'#bc8cff', sub:'Africa genomics library' },
    pathways:       { label:'Pathways',             icon:'activity',    color:'#00C4A0', sub:'KEGG · Reactome · Africa' },
    sra:            { label:'SRA Browser',          icon:'database',    color:'#e3b341', sub:'Africa datasets · download' },
    'knowledge-graph':{label:'Knowledge Graph',    icon:'layers',      color:'#bc8cff', sub:'Diseases · genes · tools' },
    'output-tracker':{label:'Output Tracker',      icon:'clipboard',   color:'#00C4A0', sub:'Publications · grants · talks' },
    settings:       { label:'Settings',            icon:'cpu',         color:'#A8A098', sub:'Appearance · language · keys' },
  };

  /* ─── Recommendation engine ─── */
  function _getRecommendations(history) {
    const role = localStorage.getItem('omicslab_onboarding_role') || 'researcher';
    const roleRecs = {
      student:    ['lab','learn','qualitypredictor','variantinterp','glossary','phylo'],
      researcher: ['variantinterp','gene-lookup','pathways','sra','heatmap','pubmed'],
      instructor: ['learn','curriculum','badges','labnotebook','output-tracker','workshop'],
    };
    const base = roleRecs[role] || roleRecs.researcher;
    /* Filter out recently visited */
    const histSet = new Set(history.slice(0, 4));
    const fresh = base.filter(p => !histSet.has(p));
    return fresh.slice(0, 3);
  }

  /* ─── Render dashboard ─── */
  function render(container) {
    const user = (() => { try { return JSON.parse(localStorage.getItem('omicslab_user') || 'null'); } catch { return null; } })();
    const name = user?.name || localStorage.getItem('omicslab_profile_name') || 'Researcher';
    const inst = user?.institution || localStorage.getItem('omicslab_profile_institution') || '';
    const history = _getHistory().slice(0, 3);
    const streak = _getStreak();
    const recs = _getRecommendations(_getHistory());

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const firstName = name.split(' ')[0];

    container.innerHTML = `
      <div class="db-wrap">
        <div class="db-inner">

          <!-- Greeting row -->
          <div class="db-greeting">
            <div class="db-greeting-text">
              <span class="db-hello">${_esc(greeting)}, ${_esc(firstName)}.</span>
              ${inst ? `<span class="db-inst">${_esc(inst)}</span>` : ''}
            </div>
            ${streak > 0 ? `
              <div class="db-streak">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                ${streak}-day streak
              </div>` : ''}
          </div>

          <div class="db-cols">

            <!-- Continue where you left off -->
            ${history.length ? `
              <div class="db-card">
                <div class="db-card-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  Continue where you left off
                </div>
                <div class="db-continue-list">
                  ${history.map(page => {
                    const meta = PAGE_META[page];
                    if (!meta) return '';
                    return `
                      <button class="db-continue-btn" onclick="OmicsLab.Router.navigate('${page}')">
                        <span class="db-cont-icon">${OmicsLab.Icons?.svg(meta.icon, 16) || ''}</span>
                        <span class="db-cont-body">
                          <span class="db-cont-name" style="color:${meta.color}">${_esc(meta.label)}</span>
                          <span class="db-cont-sub">${_esc(meta.sub)}</span>
                        </span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>`;
                  }).filter(Boolean).join('')}
                </div>
              </div>` : ''}

            <!-- Recommended for you -->
            ${recs.length ? `
              <div class="db-card">
                <div class="db-card-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM12 8v4l3 3"/></svg>
                  Recommended for you
                </div>
                <div class="db-continue-list">
                  ${recs.map(page => {
                    const meta = PAGE_META[page];
                    if (!meta) return '';
                    return `
                      <button class="db-continue-btn" onclick="OmicsLab.Router.navigate('${page}')">
                        <span class="db-cont-icon">${OmicsLab.Icons?.svg(meta.icon, 16) || ''}</span>
                        <span class="db-cont-body">
                          <span class="db-cont-name" style="color:${meta.color}">${_esc(meta.label)}</span>
                          <span class="db-cont-sub">${_esc(meta.sub)}</span>
                        </span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>`;
                  }).filter(Boolean).join('')}
                </div>
              </div>` : ''}

            <!-- Africa Pulse -->
            <div class="db-card db-pulse-card">
              <div class="db-card-title">
                <span class="db-pulse-dot"></span>
                Africa Pulse
                <button class="db-pulse-more" onclick="OmicsLab.Router.navigate('alerts')">View all →</button>
              </div>
              <div class="db-pulse-items" id="db-pulse-items">
                <div class="db-pulse-item">
                  <span class="db-pulse-country">${OmicsLab.Icons?.svg('map-pin',11)||''} DRC</span>
                  <span class="db-pulse-event">Mpox Clade I — active genomic surveillance</span>
                </div>
                <div class="db-pulse-item">
                  <span class="db-pulse-country">${OmicsLab.Icons?.svg('globe',11)||''} East Africa</span>
                  <span class="db-pulse-event">Cholera V. cholerae O1 — El Tor biotype cluster</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>`;

    /* Inject styles once */
    _injectStyles();

    /* Pull live alerts if available */
    setTimeout(_loadPulse, 200);
  }

  function _loadPulse() {
    const container = document.getElementById('db-pulse-items');
    if (!container) return;
    try {
      const alerts = OmicsLab.Alerts?._getLatest?.(2);
      if (alerts && alerts.length) {
        container.innerHTML = alerts.map(a => `
          <div class="db-pulse-item">
            <span class="db-pulse-country">${OmicsLab.Icons?.svg('map-pin',11)||''} ${_esc(a.country || 'Africa')}</span>
            <span class="db-pulse-event">${_esc(a.title || a.name || 'Active surveillance')}</span>
          </div>`).join('');
      }
    } catch {}
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  function _injectStyles() {
    if (document.getElementById('db-styles')) return;
    const s = document.createElement('style');
    s.id = 'db-styles';
    s.textContent = `
      .db-wrap{background:linear-gradient(135deg,rgba(0,196,160,.03),rgba(88,166,255,.02));border-bottom:1px solid var(--border-default,#182236);padding:1rem 1.5rem .85rem;margin-bottom:.5rem}
      .db-inner{max-width:1080px;margin:0 auto}
      .db-greeting{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.4rem;margin-bottom:.85rem}
      .db-hello{font-size:.95rem;font-weight:700;color:var(--text-primary,#E4DDD2)}
      .db-inst{font-size:.75rem;color:var(--text-muted,#A8A098);margin-left:.55rem}
      .db-streak{display:flex;align-items:center;gap:.3rem;font-size:.75rem;font-weight:700;color:#e3b341;background:rgba(227,179,65,.1);border:1px solid rgba(227,179,65,.2);border-radius:99px;padding:.2rem .6rem}
      .db-cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.6rem}
      .db-card{background:var(--bg-surface,#111B2E);border:1px solid var(--border-default,#182236);border-radius:9px;padding:.65rem .75rem}
      .db-card-title{display:flex;align-items:center;gap:.3rem;font-size:.68rem;font-weight:700;color:var(--text-faint,#354060);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.55rem}
      .db-continue-list{display:flex;flex-direction:column;gap:.25rem}
      .db-continue-btn{display:flex;align-items:center;gap:.5rem;background:none;border:1px solid transparent;border-radius:6px;padding:.35rem .45rem;cursor:pointer;text-align:left;width:100%;transition:background .1s,border-color .1s}
      .db-continue-btn:hover{background:var(--bg-overlay,#182236);border-color:var(--border-muted,#243048)}
      .db-cont-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:20px;color:var(--text-muted,#A8A098)}
      .db-cont-body{flex:1;min-width:0}
      .db-cont-name{display:block;font-size:.78rem;font-weight:600;line-height:1.3}
      .db-cont-sub{display:block;font-size:.65rem;color:var(--text-muted,#A8A098);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .db-pulse-dot{width:7px;height:7px;border-radius:50%;background:#ff6b6b;animation:db-pulse 1.5s ease-in-out infinite}
      @keyframes db-pulse{0%,100%{opacity:1}50%{opacity:.4}}
      .db-pulse-more{margin-left:auto;font-size:.65rem;color:var(--text-link,#58a6ff);background:none;border:none;cursor:pointer;padding:0}
      .db-pulse-items{display:flex;flex-direction:column;gap:.3rem}
      .db-pulse-item{font-size:.74rem;display:flex;align-items:flex-start;gap:.35rem}
      .db-pulse-country{font-weight:600;color:var(--text-secondary,#A8A098);flex-shrink:0}
      .db-pulse-event{color:var(--text-muted,#A8A098);line-height:1.4}
    `;
    document.head.appendChild(s);
  }

  return { render, trackPage };
})();
