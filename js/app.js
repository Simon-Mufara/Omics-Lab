/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Main App Controller
   Landing page, screen management, results, timer
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.App = (function() {

  /* ─── Screen management ─── */
  function showScreen(id) {
    ['screen-landing','screen-lab','screen-results'].forEach(s => {
      const el = document.getElementById(s);
      if (el) { el.style.display = 'none'; el.classList.remove('active'); }
    });
    const target = document.getElementById(id);
    if (!target) return;
    target.style.display = 'block';
    target.classList.add('active');
    if (id === 'screen-lab') target.style.display = 'flex';
    window.scrollTo(0, 0);
  }

  /* ─── Start a workflow ─── */
  function startWorkflow(wfId) {
    const wf = OmicsLab.Workflows[wfId];
    if (!wf) return;

    OmicsLab.Engine.reset(wfId);

    document.getElementById('topbar-wf-name').textContent   = wf.name;
    document.getElementById('topbar-domain').textContent    = wf.domainLabel;
    document.getElementById('topbar-domain').style.background = wf.colorHex + '22';
    document.getElementById('topbar-domain').style.color    = wf.colorHex;
    document.getElementById('topbar-domain').style.border   = `1px solid ${wf.colorHex}44`;

    showScreen('screen-lab');
    OmicsLab.QC.render();
    OmicsLab.QC.renderSidebar();
    OmicsLab.QC.renderMistakes();
    OmicsLab.Renderer.renderStep(0);
    startTimer();
  }

  /* ─── Timer ─── */
  let _timerInterval = null;
  function startTimer() {
    OmicsLab.State.timerStart = Date.now();
    clearInterval(_timerInterval);
    _timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - OmicsLab.State.timerStart) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      const el = document.getElementById('timer-val');
      if (el) el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    }, 1000);
  }
  function stopTimer() {
    clearInterval(_timerInterval);
    OmicsLab.State.elapsed = Math.floor((Date.now() - OmicsLab.State.timerStart) / 1000);
  }

  /* ─── Go home ─── */
  function goHome() {
    stopTimer();
    showScreen('screen-landing');
  }

  /* ─── Results ─── */
  function showResults() {
    stopTimer();
    const wf    = OmicsLab.Workflows[OmicsLab.State.workflow];
    const score = OmicsLab.Engine.computeScore();
    const grade = OmicsLab.Engine.getGrade(score);
    const q     = OmicsLab.State.quality;
    const E     = OmicsLab.Engine;

    const cascadeHtml = wf.pipeline.map((name, i) => {
      const stageQ = Math.round(E.clamp(score - i * (100 - score) * 0.08, 0, 100));
      const col    = E.qualityColor(stageQ, false);
      return `<div class="cascade-node">
        <span style="font-size:0.72rem">${name}</span>
        <span class="cascade-node-q" style="color:${col}">${stageQ}%</span>
      </div>`;
    }).join('');

    const rows = [
      { m:'Sample Integrity', v:`${(q.sampleIntegrity/10).toFixed(1)}/10 (RIN)`, pass:q.sampleIntegrity>=80, margin:q.sampleIntegrity>=60 },
      { m:'260/280 Purity',   v:q.purity>=88?'1.9–2.1':q.purity>=65?'~1.7':'<1.5', pass:q.purity>=80, margin:q.purity>=60 },
      { m:'Material Yield',   v:`${q.yield}%`, pass:q.yield>=75, margin:q.yield>=50 },
      { m:'Library Complexity',v:`${q.libraryComplexity}%`, pass:q.libraryComplexity>=75, margin:q.libraryComplexity>=50 },
      { m:'Q30 Score',        v:`${q.sequencingQ30}%`, pass:q.sequencingQ30>=75, margin:q.sequencingQ30>=60 },
      { m:'Alignment Rate',   v:`${q.alignmentRate}%`, pass:q.alignmentRate>=75, margin:q.alignmentRate>=50 },
      { m:'Duplication Rate', v:`${q.duplication}%`,  pass:q.duplication<=15, margin:q.duplication<=35, inv:true },
      { m:'Contamination',    v:`${q.contamination}%`, pass:q.contamination<=10, margin:q.contamination<=25, inv:true },
    ];

    const mistakesHtml = OmicsLab.State.mistakes.length
      ? OmicsLab.State.mistakes.map(m =>
          `<li><strong>${m.step}:</strong> ${m.choice} <em>(${m.impact})</em></li>`).join('')
      : '<li style="color:var(--success)">No mistakes — perfect execution!</li>';

    const elapsed = OmicsLab.State.elapsed;
    const timeStr = `${Math.floor(elapsed/60)}m ${elapsed%60}s`;

    /* Disease context for results */
    const diseaseHtml = _buildResultsDiseaseBlock(wf.id);

    document.getElementById('results-content').innerHTML = `
      <a href="#" onclick="OmicsLab.App.goHome();return false;" class="btn-result-secondary" style="margin-bottom:2rem;display:inline-flex">
        ← Back to Lab Menu
      </a>

      <div class="results-hero">
        <div class="grade-ring ${grade.cls}">${grade.letter}</div>
        <div class="results-title">${OmicsLab.Icons.svg(grade.icon, 18)} ${grade.verdict}</div>
        <div class="results-sub">${wf.name} &nbsp;·&nbsp; Score: <strong>${score}/100</strong> &nbsp;·&nbsp; Time: ${timeStr}</div>
      </div>

      <div class="results-metrics">
        <div class="r-metric">
          <div class="r-metric-val" style="color:${E.qualityColor(q.sampleIntegrity,false)}">${(q.sampleIntegrity/10).toFixed(1)}</div>
          <div class="r-metric-name">RIN Score</div>
        </div>
        <div class="r-metric">
          <div class="r-metric-val" style="color:${E.qualityColor(q.libraryComplexity,false)}">${q.libraryComplexity}%</div>
          <div class="r-metric-name">Library Complexity</div>
        </div>
        <div class="r-metric">
          <div class="r-metric-val" style="color:${E.qualityColor(q.alignmentRate,false)}">${q.alignmentRate}%</div>
          <div class="r-metric-name">Alignment Rate</div>
        </div>
        <div class="r-metric">
          <div class="r-metric-val" style="color:${E.qualityColor(q.duplication,true)}">${q.duplication}%</div>
          <div class="r-metric-name">Duplication Rate</div>
        </div>
        <div class="r-metric">
          <div class="r-metric-val" style="color:${E.qualityColor(q.contamination,true)}">${q.contamination}%</div>
          <div class="r-metric-name">Contamination</div>
        </div>
      </div>

      <div class="results-card">
        <div class="results-card-title">${OmicsLab.Icons.svg('link',16)} Error Propagation Through Pipeline</div>
        <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1rem">Your wet-lab decisions cascade through every analysis stage. Each node shows the effective data quality at that point.</p>
        <div class="cascade">${cascadeHtml}</div>
      </div>

      ${diseaseHtml}

      <div class="results-card">
        <div class="results-card-title">${OmicsLab.Icons.svg('clipboard',16)} Full QC Report</div>
        <table class="qc-table">
          <thead><tr><th>Metric</th><th>Value</th><th>Standard</th><th>Status</th></tr></thead>
          <tbody>
            ${rows.map(r => {
              const passLabel = r.pass ? 'PASS' : r.margin ? 'MARGINAL' : 'FAIL';
              const pillCls = r.pass ? 'pill-pass' : r.margin ? 'pill-warn' : 'pill-fail';
              const std = r.inv
                ? (r.m==='Duplication Rate'?'< 15%':'< 10%')
                : (r.m==='Sample Integrity'?'> 8.0 RIN':r.m==='260/280 Purity'?'1.8–2.1':r.m==='Q30 Score'?'> 75%':'> 75%');
              return `<tr><td>${r.m}</td><td class="text-mono">${r.v}</td><td class="text-mono" style="color:var(--text-muted)">${std}</td><td><span class="pill ${pillCls}">${passLabel}</span></td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="results-card">
        <div class="results-card-title">${OmicsLab.Icons.svg('file-text',16)} Mistakes &amp; Suboptimal Choices</div>
        <ul style="padding-left:1.5rem;color:var(--text-muted);font-size:0.85rem;line-height:2">
          ${mistakesHtml}
        </ul>
      </div>

      <div class="results-actions">
        <button class="btn-result-primary" onclick="OmicsLab.App.startWorkflow('${wf.id}')">
          ${OmicsLab.Icons.svg('rotate-cw',15)} Retry This Protocol
        </button>
        <button class="btn-result-primary" style="background:var(--info)" onclick="OmicsLab.App.goHome()">
          ${OmicsLab.Icons.svg('dna',15)} Choose Different Workflow
        </button>
        <button class="btn-share" onclick="OmicsLab.App.shareResults('${wf.name}', ${score})">
          &#8679; Share Results
        </button>
      </div>
    `;

    showScreen('screen-results');
  }

  function _buildResultsDiseaseBlock(wfId) {
    if (!OmicsLab.WorkflowDiseases || !OmicsLab.DISEASES) return '';
    const dids = OmicsLab.WorkflowDiseases[wfId] || [];
    if (!dids.length) return '';

    const cards = dids.map(did => {
      const d = OmicsLab.DISEASES[did];
      if (!d) return '';
      const bms     = d.biomarkers ? d.biomarkers.map(b => `<li>${b}</li>`).join('') : '';
      const tools   = d.tools ? d.tools.map(t => `<span class="rdc-tool-tag">${t}</span>`).join('') : '';
      const samples = d.sampleTypes ? d.sampleTypes.map(s => `<span class="rdc-tool-tag">${OmicsLab.Icons.svg('droplet',12)} ${s}</span>`).join('') : '';
      const statsHtml = d.stats ? `<div class="rdc-stats-row">
        <span class="rdc-stat">${OmicsLab.Icons.svg('globe',12)} ${d.stats.global}</span>
        ${d.stats.africa ? `<span class="rdc-stat rdc-stat-africa">${OmicsLab.Icons.svg('map-pin',12)} ${d.stats.africa}</span>` : ''}
      </div>` : '';
      return `<div class="res-disease-card" style="--dc:${d.color}">
        <div class="rdc-head">
          <span class="rdc-icon">${OmicsLab.Icons.svg(d.icon,22)}</span>
          <div>
            <div class="rdc-name">${d.name}</div>
            <div class="rdc-cat">${d.category}</div>
          </div>
        </div>
        ${statsHtml}
        <div class="rdc-desc">${d.description}</div>
        ${d.clinicalImpact ? `<div class="rdc-section-label" style="color:var(--warning)">Clinical Impact of Omics</div><div class="rdc-findings rdc-impact">${d.clinicalImpact}</div>` : ''}
        <div class="rdc-section-label">Key Biomarkers Detected</div>
        <ul class="rdc-bm-list">${bms}</ul>
        <div class="rdc-section-label">Expected Findings</div>
        <div class="rdc-findings">${d.findings}</div>
        ${samples ? `<div class="rdc-section-label">Sample Types</div><div class="rdc-tools">${samples}</div>` : ''}
        ${tools ? `<div class="rdc-section-label">Analysis Tools</div><div class="rdc-tools">${tools}</div>` : ''}
        ${d.africanContext ? `<div class="rdc-african">${OmicsLab.Icons.svg('map-pin',13)} ${d.africanContext}</div>` : ''}
      </div>`;
    }).join('');

    return `<div class="results-card">
      <div class="results-card-title">${OmicsLab.Icons.svg('microscope',16)} Diseases Investigated with This Workflow</div>
      <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1rem">
        The ${OmicsLab.Workflows[wfId] ? OmicsLab.Workflows[wfId].name : 'workflow'} you just completed
        is used to study these real diseases in clinical and research settings.
      </p>
      <div class="res-disease-grid">${cards}</div>
    </div>`;
  }

  /* ─── Build landing page ─── */
  function buildLanding() {
    _buildWorkflowGrid();
    _buildDiseaseExplorer();
    _buildEquipmentGallery();
    _buildToolExplorer();
    _buildRepositoryExplorer();
  }

  function _buildWorkflowGrid() {
    const grid = document.getElementById('domain-grid');
    if (!grid) return;
    grid.innerHTML = OmicsLab.DOMAINS.map(domain => {
      const wfItems = domain.workflows.map(wfId => {
        const wf = OmicsLab.Workflows[wfId];
        if (!wf) return '';
        const diffBadge = { beginner:'badge-green', intermediate:'badge-blue', advanced:'badge-orange' }[wf.difficulty] || 'badge-blue';
        return `<div class="workflow-item" onclick="OmicsLab.App.startWorkflow('${wfId}')">
          <span class="workflow-item-icon">${OmicsLab.Icons.svg(wf.icon,14)}</span>
          <span class="workflow-item-name">${wf.name}</span>
          <span class="domain-badge ${diffBadge}" style="font-size:0.6rem">${wf.difficulty}</span>
          <span class="workflow-item-steps">${wf.steps.length} steps</span>
          <span class="workflow-arrow">→</span>
        </div>`;
      }).join('');

      return `<div class="domain-card" style="--domain-color:${domain.color};--domain-rgb:${domain.rgb}">
        <div class="domain-header">
          <div class="domain-icon" style="--domain-color:${domain.color};color:${domain.colorHex}">${OmicsLab.Icons.svg(domain.icon,24)}</div>
          <span class="domain-badge ${domain.badge}">${domain.label}</span>
        </div>
        <div class="domain-name">${domain.label}</div>
        <div class="domain-desc">${domain.desc}</div>
        <div class="workflow-list">${wfItems}</div>
      </div>`;
    }).join('');
  }

  /* Disease Explorer on landing page */
  function _buildDiseaseExplorer() {
    if (!OmicsLab.DISEASES) return;

    const filterEl = document.getElementById('disease-filter-tabs');
    const cardsEl  = document.getElementById('disease-cards-grid');
    if (!filterEl || !cardsEl) return;

    const diseases  = Object.entries(OmicsLab.DISEASES);
    const categories = ['All', ...new Set(diseases.map(([,d]) => d.category))];

    filterEl.innerHTML = categories.map((cat, i) =>
      `<button class="df-tab ${i===0?'active':''}" onclick="OmicsLab.App._filterDiseases('${cat}',this)">${cat}</button>`
    ).join('');

    function renderCards(filter) {
      const filtered = filter === 'All' ? diseases : diseases.filter(([,d]) => d.category === filter);
      cardsEl.innerHTML = filtered.map(([did, d]) => {
        const bms = (d.biomarkers||[]).slice(0,3).map(b => `<div class="dc-bm-tag">${OmicsLab.Icons.svg('target',11)} ${b}</div>`).join('');
        const statsHtml = d.stats ? `<div class="dc-stats-row">
          <span class="dc-stat-chip">${OmicsLab.Icons.svg('globe',12)} ${d.stats.global}</span>
          ${d.stats.africa ? `<span class="dc-stat-chip dc-stat-africa">${OmicsLab.Icons.svg('map-pin',12)} ${d.stats.africa}</span>` : ''}
        </div>` : '';
        const bmCount  = (d.biomarkers||[]).length;
        const wfCount  = (d.workflows||[]).length;
        return `<div class="disease-card" style="--disease-color:${d.color}" onclick="OmicsLab.App._openDiseaseModal('${did}')">
          <div class="disease-card-head">
            <div class="dc-icon-wrap">${OmicsLab.Icons.svg(d.icon,26)}</div>
            <div>
              <div class="dc-name">${d.name}</div>
              <div class="dc-cat-badge">${d.category}</div>
            </div>
          </div>
          ${statsHtml}
          <div class="dc-description">${d.description}</div>
          <div class="dc-biomarkers">${bms}</div>
          ${d.africanContext ? `<div class="dc-african-tag">${OmicsLab.Icons.svg('map-pin',12)} ${d.africanContext.substring(0,110)}…</div>` : ''}
          <div class="dc-card-footer">
            <span class="dc-meta-pill">${OmicsLab.Icons.svg('target',11)} ${bmCount} biomarker${bmCount!==1?'s':''}</span>
            <span class="dc-meta-pill">${OmicsLab.Icons.svg('flask',11)} ${wfCount} workflow${wfCount!==1?'s':''}</span>
            <span class="dc-detail-btn">Details →</span>
          </div>
        </div>`;
      }).join('');
    }

    renderCards('All');
    OmicsLab.App._renderDiseaseCards = renderCards;
  }

  function _filterDiseases(cat, btn) {
    const section = btn.closest('.disease-filter-tabs');
    if (section) section.querySelectorAll('.df-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    if (OmicsLab.App._renderDiseaseCards) OmicsLab.App._renderDiseaseCards(cat);
  }

  function _openDiseaseModal(did) {
    const d = OmicsLab.DISEASES[did];
    if (!d) return;

    const bms = (d.biomarkers||[]).map(b => `<li>${b}</li>`).join('');
    const tools = (d.tools||[]).map(t => `<span class="dm-tag">${t}</span>`).join('');
    const dbs   = (d.databases||[]).map(t => `<span class="dm-tag dm-tag-db">${t}</span>`).join('');
    const samples = (d.sampleTypes||[]).map(s => `<span class="dm-tag dm-tag-sample">${OmicsLab.Icons.svg('droplet',12)} ${s}</span>`).join('');
    const wfTags = (d.workflows||[]).map(wfId => {
      const wf = OmicsLab.Workflows[wfId];
      return wf ? `<button class="dc-wf-tag dm-wf-btn" onclick="OmicsLab.App._closeDiseaseModal();OmicsLab.App.startWorkflow('${wfId}')">${OmicsLab.Icons.svg(wf.icon,14)} ${wf.name}</button>` : '';
    }).join('');

    const statsHtml = d.stats ? `<div class="dm-stats-row">
      <div class="dm-stat"><div class="dm-stat-val">${d.stats.global}</div><div class="dm-stat-lbl">Global Burden</div></div>
      ${d.stats.africa ? `<div class="dm-stat"><div class="dm-stat-val">${d.stats.africa}</div><div class="dm-stat-lbl">Africa</div></div>` : ''}
      ${d.stats.daly ? `<div class="dm-stat"><div class="dm-stat-val">${d.stats.daly}</div><div class="dm-stat-lbl">DALYs</div></div>` : ''}
    </div>` : '';

    const html = `
    <div class="dm-header" style="--dm-color:${d.color}">
      <div class="dm-title-row">
        <span class="dm-icon">${OmicsLab.Icons.svg(d.icon,32)}</span>
        <div>
          <div class="dm-name">${d.name}</div>
          <div class="dm-cat">${d.category}</div>
        </div>
        <button class="dm-close" onclick="OmicsLab.App._closeDiseaseModal()" aria-label="Close">✕</button>
      </div>
      ${statsHtml}
    </div>
    <div class="dm-body">
      <div class="dm-section">
        <div class="dm-section-label">Overview</div>
        <p class="dm-text">${d.description}</p>
      </div>
      ${d.clinicalImpact ? `<div class="dm-section dm-section-impact">
        <div class="dm-section-label">Clinical Impact of Omics</div>
        <p class="dm-text">${d.clinicalImpact}</p>
      </div>` : ''}
      <div class="dm-section">
        <div class="dm-section-label">Key Biomarkers (${(d.biomarkers||[]).length})</div>
        <ul class="dm-bm-list">${bms}</ul>
      </div>
      <div class="dm-section">
        <div class="dm-section-label">Expected Findings</div>
        <p class="dm-text">${d.findings}</p>
      </div>
      ${samples ? `<div class="dm-section"><div class="dm-section-label">Sample Types</div><div class="dm-tags-row">${samples}</div></div>` : ''}
      ${tools ? `<div class="dm-section"><div class="dm-section-label">Analysis Tools</div><div class="dm-tags-row">${tools}</div></div>` : ''}
      ${dbs ? `<div class="dm-section"><div class="dm-section-label">Key Databases</div><div class="dm-tags-row">${dbs}</div></div>` : ''}
      ${d.africanContext ? `<div class="dm-section dm-section-africa">
        <div class="dm-section-label">${OmicsLab.Icons.svg('map-pin',14)} African Context</div>
        <p class="dm-text">${d.africanContext}</p>
      </div>` : ''}
      ${wfTags ? `<div class="dm-section">
        <div class="dm-section-label">Study With These Workflows</div>
        <div class="dm-tags-row dm-wf-row">${wfTags}</div>
      </div>` : ''}
    </div>`;

    let overlay = document.getElementById('disease-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'disease-modal-overlay';
      overlay.className = 'dm-overlay';
      overlay.innerHTML = `<div class="dm-panel" id="disease-modal-panel"></div>`;
      overlay.addEventListener('click', e => { if (e.target === overlay) OmicsLab.App._closeDiseaseModal(); });
      document.body.appendChild(overlay);
    }
    document.getElementById('disease-modal-panel').innerHTML = html;
    overlay.classList.add('dm-open');
    document.body.classList.add('modal-open');
  }

  function _closeDiseaseModal() {
    const overlay = document.getElementById('disease-modal-overlay');
    if (overlay) overlay.classList.remove('dm-open');
    document.body.classList.remove('modal-open');
  }

  /* Equipment Gallery on landing page */
  function _buildEquipmentGallery() {
    if (!OmicsLab.EQUIPMENT_GALLERY) return;
    const filterEl = document.getElementById('equip-filter-tabs');
    const gridEl   = document.getElementById('equip-gallery-grid');
    if (!filterEl || !gridEl) return;

    const items = OmicsLab.EQUIPMENT_GALLERY;
    const cats  = ['All', ...new Set(items.map(e => e.category))];

    filterEl.innerHTML = cats.map((cat, i) =>
      `<button class="df-tab ${i===0?'active':''}" onclick="OmicsLab.App._filterEquipment('${cat}',this)">${cat}</button>`
    ).join('');

    function renderCards(filterOrItems) {
      const filtered = Array.isArray(filterOrItems)
        ? filterOrItems
        : (filterOrItems === 'All' ? items : items.filter(e => e.category === filterOrItems));

      if (filtered.length === 0) {
        gridEl.innerHTML = `<div class="equip-no-results">${OmicsLab.Icons.svg('search',32)}<span>No instruments found.</span></div>`;
        return;
      }

      gridEl.innerHTML = filtered.map(eq => {
        const cssAnim = OmicsLab.Equipment
          ? OmicsLab.Equipment.render(eq.equipType, eq.equipParams || {})
          : `<div class="equip-visual"><div class="equip-icon-large">${OmicsLab.Icons.svg('microscope',48)}</div></div>`;
        const preview = eq.imageUrl
          ? `<div class="egc-photo-wrap">
               <img class="egc-photo" src="${eq.imageUrl}" alt="${eq.name}" loading="lazy"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <div class="egc-photo-fallback">${cssAnim}</div>
             </div>`
          : cssAnim;

        const specsRows = Object.entries(eq.specs || {}).map(([k,v]) =>
          `<tr><td class="eg-spec-key">${k}</td><td class="eg-spec-val">${v}</td></tr>`
        ).join('');

        const wfTags = (eq.workflows || []).map(wfId => {
          const wf = OmicsLab.Workflows && OmicsLab.Workflows[wfId];
          return wf ? `<span class="eg-wf-tag" onclick="event.stopPropagation();OmicsLab.App.startWorkflow('${wfId}')" title="Launch ${wf.name}">${OmicsLab.Icons.svg(wf.icon,12)} ${wf.name}</span>` : '';
        }).join('');

        const catColor = {
          'Short-Read Sequencers':'#58a6ff',
          'Long-Read Sequencers': '#3fb950',
          'QC Instruments':       '#d2a8ff',
          'Sample Preparation':   '#ffa657',
          'PCR Instruments':      '#f78166',
          'Single-Cell Platforms':'#79c0ff',
          'Mass Spectrometers':   '#e3b341',
          'Automation':           '#79c0ff',
        }[eq.category] || '#8b949e';

        return `<div class="equip-gallery-card" style="--eg-color:${catColor}" onclick="OmicsLab.App._openEquipmentModal('${eq.id}')">
          <div class="egc-preview">${preview}</div>
          <div class="egc-body">
            <div class="egc-maker">${eq.manufacturer}</div>
            <div class="egc-name">${eq.name}</div>
            <span class="egc-cat-badge" style="background:${catColor}22;color:${catColor};border:1px solid ${catColor}44">${eq.category}</span>
            <div class="egc-tagline">${eq.tagline}</div>
            <div class="egc-desc">${eq.desc}</div>
            ${specsRows ? `<table class="eg-specs-table"><tbody>${specsRows}</tbody></table>` : ''}
            ${wfTags ? `<div class="egc-section-label">Use in OmicsLab</div><div class="egc-wf-tags">${wfTags}</div>` : ''}
            <div class="egc-section-label">Cost estimate</div>
            <div class="egc-cost">${eq.cost}</div>
            <button class="egc-details-btn" onclick="event.stopPropagation();OmicsLab.App._openEquipmentModal('${eq.id}')">View Full Specs →</button>
          </div>
        </div>`;
      }).join('');
    }

    renderCards('All');
    OmicsLab.App._renderEquipmentCards = renderCards;
  }

  function _filterEquipment(cat, btn) {
    const section = btn.closest('.equip-filter-tabs');
    if (section) section.querySelectorAll('.df-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    if (OmicsLab.App._renderEquipmentCards) OmicsLab.App._renderEquipmentCards(cat);
  }

  /* ─── Smooth scroll helper ─── */
  function scrollTo(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  /* ─── Hamburger nav ─── */
  function toggleMobileNav() {
    const dd = document.getElementById('mobile-nav-dropdown');
    if (dd) dd.classList.toggle('open');
  }

  /* ─── Equipment modal ─── */
  function _openEquipmentModal(equipId) {
    const eq = (OmicsLab.EQUIPMENT_GALLERY || []).find(e => e.id === equipId);
    if (!eq) return;

    const catColor = {
      'Short-Read Sequencers':'#58a6ff',
      'Long-Read Sequencers': '#3fb950',
      'QC Instruments':       '#d2a8ff',
      'Sample Preparation':   '#ffa657',
      'PCR Instruments':      '#f78166',
      'Single-Cell Platforms':'#79c0ff',
      'Mass Spectrometers':   '#e3b341',
      'Automation':           '#79c0ff',
    }[eq.category] || '#8b949e';

    const cssAnim = OmicsLab.Equipment
      ? OmicsLab.Equipment.render(eq.equipType, eq.equipParams || {})
      : '<div class="equip-icon-large">' + OmicsLab.Icons.svg('microscope',48) + '</div>';

    const photoHtml = eq.imageUrl
      ? `<img class="emd-photo" src="${eq.imageUrl}" alt="${eq.name}"
             onerror="this.style.display='none';document.getElementById('emd-anim-fallback').style.display='flex'">
         <div class="emd-anim-preview" id="emd-anim-fallback" style="display:none">${cssAnim}</div>`
      : `<div class="emd-anim-preview">${cssAnim}</div>`;

    const specsHtml = Object.entries(eq.specs || {}).map(([k, v]) =>
      `<div class="emd-spec"><div class="emd-spec-key">${k}</div><div class="emd-spec-val">${v}</div></div>`
    ).join('');

    const wfTagsHtml = (eq.workflows || []).map(wfId => {
      const wf = OmicsLab.Workflows && OmicsLab.Workflows[wfId];
      return wf ? `<span class="emd-wf-tag eg-wf-tag" onclick="OmicsLab.App.startWorkflow('${wfId}');OmicsLab.App._closeEquipmentModal()">${OmicsLab.Icons.svg(wf.icon,12)} ${wf.name}</span>` : '';
    }).join('');

    const firstWf = (eq.workflows || []).find(id => OmicsLab.Workflows && OmicsLab.Workflows[id]);
    const launchBtn = firstWf
      ? `<button class="emd-launch-btn" onclick="OmicsLab.App.startWorkflow('${firstWf}');OmicsLab.App._closeEquipmentModal()">
           Launch ${OmicsLab.Icons.svg(OmicsLab.Workflows[firstWf].icon,14)} ${OmicsLab.Workflows[firstWf].name} →
         </button>`
      : '';

    const modal = document.getElementById('equip-modal');
    if (!modal) return;
    modal.style.setProperty('--eg-color', catColor);
    modal.innerHTML = `
      <div class="emd-header">
        ${photoHtml}
        <div class="emd-photo-gradient"></div>
        <button class="emd-close" onclick="OmicsLab.App._closeEquipmentModal()">✕</button>
      </div>
      <div class="emd-body">
        <div class="emd-maker">${eq.manufacturer}</div>
        <div class="emd-name">${eq.name}</div>
        <div class="emd-tagline">${eq.tagline}</div>
        <div class="emd-desc">${eq.desc}</div>
        ${specsHtml ? `<div class="emd-section">Key Specifications</div><div class="emd-specs">${specsHtml}</div>` : ''}
        <div class="emd-section">Cost Estimate</div>
        <div class="emd-cost">${eq.cost}</div>
        <div class="emd-section">When to Use</div>
        <div class="emd-when">${eq.whenToUse}</div>
        ${eq.alternatives && eq.alternatives.length ? `<div class="emd-section">Alternatives</div><div class="emd-alts">${eq.alternatives.join(' · ')}</div>` : ''}
        ${wfTagsHtml ? `<div class="emd-section">Use in OmicsLab</div><div class="emd-wf-tags">${wfTagsHtml}</div>` : ''}
      </div>
      ${launchBtn ? `<div class="emd-footer">${launchBtn}</div>` : ''}
    `;

    const overlay = document.getElementById('equip-modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function _closeEquipmentModal(event) {
    if (event && event.target !== document.getElementById('equip-modal-overlay')) return;
    const overlay = document.getElementById('equip-modal-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ─── Equipment search ─── */
  function _searchEquipment(query) {
    if (!OmicsLab.EQUIPMENT_GALLERY) return;
    const q = query.toLowerCase().trim();

    /* Reset category tabs to 'All' */
    const filterEl = document.getElementById('equip-filter-tabs');
    if (filterEl) filterEl.querySelectorAll('.df-tab').forEach((t, i) => t.classList.toggle('active', i === 0));

    if (!q) {
      if (OmicsLab.App._renderEquipmentCards) OmicsLab.App._renderEquipmentCards('All');
      return;
    }

    const filtered = OmicsLab.EQUIPMENT_GALLERY.filter(eq =>
      eq.name.toLowerCase().includes(q) ||
      eq.manufacturer.toLowerCase().includes(q) ||
      eq.category.toLowerCase().includes(q) ||
      eq.tagline.toLowerCase().includes(q) ||
      (eq.desc || '').toLowerCase().includes(q)
    );

    const gridEl = document.getElementById('equip-gallery-grid');
    if (!gridEl) return;
    if (filtered.length === 0) {
      gridEl.innerHTML = `<div class="equip-no-results">${OmicsLab.Icons.svg('search',32)}<span>No instruments match "<em>${query}</em>"</span></div>`;
      return;
    }
    if (OmicsLab.App._renderEquipmentCards) OmicsLab.App._renderEquipmentCards(filtered);
  }

  /* ─── Share results ─── */
  function shareResults(wfName, score) {
    const text = `I just completed the ${wfName} workflow on OmicsLab Simulator and scored ${score}/100!`;
    const url  = 'https://simon-mufara.github.io/Omics-Lab/';
    if (navigator.share) {
      navigator.share({ title: 'OmicsLab Results', text, url }).catch(() => {});
    } else {
      navigator.clipboard
        ? navigator.clipboard.writeText(`${text} ${url}`).then(() => alert('Link copied to clipboard!'))
        : window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
  }

  /* Tool Explorer on landing page */
  function _buildToolExplorer() {
    if (!OmicsLab.TOOLS) return;
    const grid = document.getElementById('tool-category-grid');
    if (!grid) return;

    const tools     = Object.entries(OmicsLab.TOOLS);
    const cats      = {};
    tools.forEach(([tid, t]) => {
      if (!cats[t.category]) cats[t.category] = [];
      cats[t.category].push([tid, t]);
    });

    const catIcons = {
      'Alignment':             'target',
      'Variant Calling':       'search',
      'Quality Control':       'check-circle',
      'Trimming & QC':         'scissors',
      'Single-Cell':           'hexagon',
      'Single-Cell Analysis':  'hexagon',
      'Batch Correction':      'rotate-cw',
      'Differential Expression':'bar-chart',
      'Functional Enrichment': 'git-branch',
      'Peak Calling':          'mountain',
      'Peak Calling & Motif':  'mountain',
      'Visualisation':         'eye',
      'Taxonomic Classification':'git-branch',
      'Functional Profiling':  'activity',
      '16S Analysis':          'rotate-cw',
      'ASV Inference':         'rotate-cw',
      'Metabolomics':          'flask',
      'Metabolomics Statistics':'trending-up',
      'Proteomics':            'layers',
      'Proteomics Statistics': 'bar-chart',
      'Viral Lineage':         'virus',
      'Viral QC & Lineage':    'virus',
      'Variant Annotation':    'tag',
    };

    grid.innerHTML = Object.entries(cats).map(([cat, toolList]) => {
      const iconName = catIcons[cat] || 'flask';
      const toolItems = toolList.map(([tid, t]) =>
        `<div class="tool-item">
          <div class="ti-name">${t.name}</div>
          <div class="ti-io"><span class="ti-in">${t.input}</span> → <span class="ti-out">${t.output}</span></div>
          <div class="ti-desc">${t.desc}</div>
          <div class="ti-use"><strong>Use when:</strong> ${t.use}</div>
          ${t.alternatives && t.alternatives.length ? `<div class="ti-alts">Alternatives: ${t.alternatives.join(' · ')}</div>` : ''}
        </div>`
      ).join('');

      return `<div class="tool-cat-card">
        <div class="tcc-header">
          <span class="tcc-icon">${OmicsLab.Icons.svg(iconName,18)}</span>
          <span class="tcc-name">${cat}</span>
          <span class="tcc-count">${toolList.length} tool${toolList.length>1?'s':''}</span>
        </div>
        <div class="tcc-tools">${toolItems}</div>
      </div>`;
    }).join('');
  }

  /* ─── Repository Explorer ─── */
  function _buildRepositoryExplorer() {
    if (!OmicsLab.REPOSITORIES) return;
    const filterEl = document.getElementById('repo-filter-tabs');
    const cardsEl  = document.getElementById('repo-cards-grid');
    if (!filterEl || !cardsEl) return;

    const repos = Object.entries(OmicsLab.REPOSITORIES);
    const cats  = ['All', ...new Set(repos.map(([,r]) => r.category))];

    filterEl.innerHTML = cats.map((cat, i) =>
      `<button class="df-tab ${i===0?'active':''}" onclick="OmicsLab.App._filterRepos('${cat}',this)">${cat}</button>`
    ).join('');

    function renderRepos(filter) {
      const filtered = filter === 'All' ? repos : repos.filter(([,r]) => r.category === filter);
      cardsEl.innerHTML = filtered.map(([rid, r]) => {
        const africaBadge = r.africanRelevance
          ? `<div class="dc-african-tag repo-africa-note">${OmicsLab.Icons.svg('map-pin',12)} ${r.africanRelevance}</div>` : '';
        return `<div class="repo-card">
          <div class="repo-card-head">
            <span class="repo-icon">${OmicsLab.Icons.svg(r.icon,22)}</span>
            <div>
              <div class="repo-name">${r.name}</div>
              <div class="repo-cat-badge">${r.category}</div>
            </div>
          </div>
          <div class="repo-scope-chip">${OmicsLab.Icons.svg('clipboard',12)} ${r.scope}</div>
          <div class="repo-desc">${r.desc}</div>
          <div class="repo-access"><strong>Access:</strong> ${r.access}</div>
          ${africaBadge}
          <a class="repo-link-btn" href="${r.url}" target="_blank" rel="noopener">Visit →</a>
        </div>`;
      }).join('');
    }

    renderRepos('All');
    OmicsLab.App._renderRepoCards = renderRepos;
  }

  function _filterRepos(cat, btn) {
    const section = btn.closest('.repo-filter-tabs');
    if (section) section.querySelectorAll('.df-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    if (OmicsLab.App._renderRepoCards) OmicsLab.App._renderRepoCards(cat);
  }

  /* ─── Init ─── */
  function init() {
    buildLanding();
    showScreen('screen-landing');
    setTimeout(_initScrollReveal, 50);

    window.addEventListener('scroll', () => {
      const btn = document.getElementById('back-to-top');
      if (btn) btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/Omics-Lab/sw.js').catch(() => {});
      navigator.serviceWorker.addEventListener('message', e => {
        if (e.data && e.data.type === 'SW_UPDATED') window.location.reload();
      });
    }
  }

  return {
    init, startWorkflow, goHome, showResults, showScreen,
    _filterDiseases, _filterEquipment,
    scrollTo, toggleMobileNav,
    _openEquipmentModal, _closeEquipmentModal,
    _openDiseaseModal, _closeDiseaseModal,
    _filterRepos,
    _searchEquipment, shareResults,
    _renderDiseaseCards: null, _renderEquipmentCards: null, _renderRepoCards: null,
  };
})();

/* ─── Boot on DOM ready ─── */
document.addEventListener('DOMContentLoaded', () => {
  OmicsLab.App.init();
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      OmicsLab.App._closeDiseaseModal();
      OmicsLab.App._closeEquipmentModal();
    }
  });
  _startHeroPreviewCycle();
  _initScrollReveal();
});

function _initScrollReveal() {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

function _startHeroPreviewCycle() {
  const STATES = [
    {
      title: 'WGS — Step 3 of 12',
      phase: OmicsLab.Icons.svg('dna',14) + ' DNA Extraction',
      score: 94,
      metrics: [
        { label: 'Sample Integrity',    w: '85%', val: '8.5 RIN', cls: 'green' },
        { label: 'Library Complexity',  w: '78%', val: '78%',     cls: 'blue'  },
        { label: 'Q30 Score',           w: '91%', val: '91%',     cls: 'green' },
        { label: 'Contamination',       w:  '4%', val:  '4%',     cls: 'green' },
      ],
      cmd: 'bwa-mem2 mem -t 16 ref.fa sample.fastq',
      nodes: ['Extract','QC','Align','Variant','Annotate'],
      activeIdx: 2,
    },
    {
      title: 'RNA-seq — Step 5 of 10',
      phase: OmicsLab.Icons.svg('flask',14) + ' Library Preparation',
      score: 88,
      metrics: [
        { label: 'RNA Integrity (RIN)', w: '79%', val: '7.9',     cls: 'blue'  },
        { label: 'Read Duplication',    w: '22%', val: '22%',     cls: 'orange'},
        { label: 'Mapping Rate',        w: '96%', val: '96%',     cls: 'green' },
        { label: 'Splice Junctions',    w: '88%', val: '88k',     cls: 'green' },
      ],
      cmd: 'STAR --runThreadN 8 --genomeDir hg38/ --readFilesIn R1.fq R2.fq',
      nodes: ['Extract','QC','Lib Prep','Sequence','Align'],
      activeIdx: 3,
    },
    {
      title: 'Metagenomic — Step 7 of 14',
      phase: OmicsLab.Icons.svg('git-branch',14) + ' Taxonomic Classification',
      score: 91,
      metrics: [
        { label: 'Host Depletion',      w: '98%', val: '98%',     cls: 'green' },
        { label: 'Species Richness',    w: '73%', val: '312 sp',  cls: 'blue'  },
        { label: 'Shannon Diversity',   w: '82%', val: '3.4 H',   cls: 'green' },
        { label: 'Unknown Reads',       w: '18%', val: '18%',     cls: 'orange'},
      ],
      cmd: 'kraken2 --db k2_standard --paired R1.fq R2.fq --output out.txt',
      nodes: ['Extract','Filter','Assemble','Classify','Report'],
      activeIdx: 3,
    },
    {
      title: 'Proteomics — Step 4 of 9',
      phase: OmicsLab.Icons.svg('flask',14) + ' Protein Digestion',
      score: 96,
      metrics: [
        { label: 'Peptide IDs',         w: '93%', val: '4,821',   cls: 'green' },
        { label: 'Protein Coverage',    w: '68%', val: '68%',     cls: 'blue'  },
        { label: 'FDR',                 w:  '1%', val:  '1%',     cls: 'green' },
        { label: 'Missed Cleavage',     w:  '8%', val:   '8%',    cls: 'green' },
      ],
      cmd: 'maxquant MQ_params.xml && python msfragger.py sample.raw',
      nodes: ['Extract','Digest','LC-MS/MS','Search','Quant'],
      activeIdx: 2,
    },
  ];

  let idx = 0;

  function applyState(s) {
    const $  = id => document.getElementById(id);
    if (!$('spc-title')) return;
    $('spc-title').textContent = s.title;
    $('spc-phase').innerHTML = s.phase;
    $('spc-score').textContent = s.score;
    $('spc-cmd').textContent   = s.cmd;

    const bars = [$('spc-bar1'), $('spc-bar2'), $('spc-bar3'), $('spc-bar4')];
    const vals = [$('spc-v1'),   $('spc-v2'),   $('spc-v3'),   $('spc-v4')];
    s.metrics.forEach((m, i) => {
      if (bars[i]) { bars[i].style.width = m.w; bars[i].className = `spc-bar-fill ${m.cls}`; }
      if (vals[i]) { vals[i].textContent = m.val; vals[i].className = `spc-mval ${m.cls}`; }
    });

    const pipe = document.querySelector('.spc-pipeline');
    if (pipe) {
      pipe.innerHTML = s.nodes.map((n, i) => {
        const cls = i < s.activeIdx ? 'done' : i === s.activeIdx ? 'active' : '';
        const arrow = i < s.nodes.length - 1 ? '<span class="spc-pipe-arrow">→</span>' : '';
        return `<span class="spc-pipe-node ${cls}">${n}</span>${arrow}`;
      }).join('');
    }
  }

  applyState(STATES[0]);
  setInterval(() => {
    idx = (idx + 1) % STATES.length;
    applyState(STATES[idx]);
  }, 4000);
}

/* ─── Mobile panel switcher (lab workspace) ─── */
OmicsLab.Mobile = (function() {
  function showPanel(panel) {
    const panelEls = {
      protocol: document.querySelector('.protocol-sidebar'),
      bench:    document.querySelector('.bench-center'),
      qc:       document.querySelector('.qc-sidebar'),
    };
    const tabEls = {
      protocol: document.getElementById('mtb-protocol'),
      bench:    document.getElementById('mtb-bench'),
      qc:       document.getElementById('mtb-qc'),
    };
    Object.keys(panelEls).forEach(key => {
      const el = panelEls[key];
      if (!el) return;
      el.classList.toggle('mobile-panel-active', key === panel);
      el.classList.toggle('mobile-panel-hidden', key !== panel);
    });
    Object.keys(tabEls).forEach(key => {
      if (tabEls[key]) tabEls[key].classList.toggle('active', key === panel);
    });
  }
  return { showPanel };
})();
