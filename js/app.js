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
        <div class="results-title">${grade.emoji} ${grade.verdict}</div>
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
        <div class="results-card-title">🔗 Error Propagation Through Pipeline</div>
        <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1rem">Your wet-lab decisions cascade through every analysis stage. Each node shows the effective data quality at that point.</p>
        <div class="cascade">${cascadeHtml}</div>
      </div>

      ${diseaseHtml}

      <div class="results-card">
        <div class="results-card-title">📋 Full QC Report</div>
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
        <div class="results-card-title">📝 Mistakes & Suboptimal Choices</div>
        <ul style="padding-left:1.5rem;color:var(--text-muted);font-size:0.85rem;line-height:2">
          ${mistakesHtml}
        </ul>
      </div>

      <div class="results-actions">
        <button class="btn-result-primary" onclick="OmicsLab.App.startWorkflow('${wf.id}')">
          🔄 Retry This Protocol
        </button>
        <button class="btn-result-primary" style="background:var(--info)" onclick="OmicsLab.App.goHome()">
          🧬 Choose Different Workflow
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
      const bms = d.biomarkers ? d.biomarkers.map(b => `<li>${b}</li>`).join('') : '';
      const tools = d.tools ? d.tools.join(' · ') : '';
      return `<div class="res-disease-card" style="--dc:${d.color}">
        <div class="rdc-head">
          <span class="rdc-icon">${d.icon}</span>
          <div>
            <div class="rdc-name">${d.name}</div>
            <div class="rdc-cat">${d.category}</div>
          </div>
        </div>
        <div class="rdc-desc">${d.description}</div>
        <div class="rdc-section-label">Key Biomarkers Detected</div>
        <ul class="rdc-bm-list">${bms}</ul>
        <div class="rdc-section-label">Expected Findings</div>
        <div class="rdc-findings">${d.findings}</div>
        ${tools ? `<div class="rdc-section-label">Analysis Tools</div><div class="rdc-tools">${tools}</div>` : ''}
        ${d.africanContext ? `<div class="rdc-african"><span>🌍</span> ${d.africanContext}</div>` : ''}
      </div>`;
    }).join('');

    return `<div class="results-card">
      <div class="results-card-title">🔬 Diseases Investigated with This Workflow</div>
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
          <span class="workflow-item-icon">${wf.icon}</span>
          <span class="workflow-item-name">${wf.name}</span>
          <span class="domain-badge ${diffBadge}" style="font-size:0.6rem">${wf.difficulty}</span>
          <span class="workflow-item-steps">${wf.steps.length} steps</span>
          <span class="workflow-arrow">→</span>
        </div>`;
      }).join('');

      return `<div class="domain-card" style="--domain-color:${domain.color};--domain-rgb:${domain.rgb}">
        <div class="domain-header">
          <div class="domain-icon" style="--domain-color:${domain.color}">${domain.icon}</div>
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
        const wfTags = (d.workflows||[]).map(wfId => {
          const wf = OmicsLab.Workflows[wfId];
          return wf ? `<span class="dc-wf-tag" onclick="OmicsLab.App.startWorkflow('${wfId}')" title="Launch ${wf.name}">${wf.icon} ${wf.name}</span>` : '';
        }).join('');
        const bms = (d.biomarkers||[]).slice(0,4).map(b => `<div class="dc-bm-tag">🎯 ${b}</div>`).join('');
        return `<div class="disease-card" style="--disease-color:${d.color}">
          <div class="disease-card-head">
            <div class="dc-icon-wrap">${d.icon}</div>
            <div>
              <div class="dc-name">${d.name}</div>
              <div class="dc-cat-badge">${d.category}</div>
            </div>
          </div>
          <div class="dc-description">${d.description}</div>
          <div class="dc-biomarkers">${bms}</div>
          <div class="dc-findings-preview">${d.findings.substring(0,160)}…</div>
          ${d.africanContext ? `<div class="dc-african-tag">🌍 ${d.africanContext.substring(0,100)}…</div>` : ''}
          <div class="dc-wf-section">
            <div class="dc-wf-label">Study with:</div>
            <div class="dc-wf-tags">${wfTags}</div>
          </div>
        </div>`;
      }).join('');
    }

    renderCards('All');
    /* Store renderCards reference for filter buttons */
    OmicsLab.App._renderDiseaseCards = renderCards;
  }

  function _filterDiseases(cat, btn) {
    const section = btn.closest('.disease-filter-tabs');
    if (section) section.querySelectorAll('.df-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    if (OmicsLab.App._renderDiseaseCards) OmicsLab.App._renderDiseaseCards(cat);
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

    function renderCards(filter) {
      const filtered = filter === 'All' ? items : items.filter(e => e.category === filter);

      gridEl.innerHTML = filtered.map(eq => {
        const visual = OmicsLab.Equipment
          ? OmicsLab.Equipment.render(eq.equipType, eq.equipParams || {})
          : `<div class="equip-visual"><div class="equip-icon-large">🔬</div></div>`;

        const specsRows = Object.entries(eq.specs || {}).map(([k,v]) =>
          `<tr><td class="eg-spec-key">${k}</td><td class="eg-spec-val">${v}</td></tr>`
        ).join('');

        const wfTags = (eq.workflows || []).map(wfId => {
          const wf = OmicsLab.Workflows && OmicsLab.Workflows[wfId];
          return wf ? `<span class="eg-wf-tag" onclick="OmicsLab.App.startWorkflow('${wfId}')" title="Launch ${wf.name}">${wf.icon} ${wf.name}</span>` : '';
        }).join('');

        const catColor = {
          'Short-Read Sequencers':'#58a6ff',
          'Long-Read Sequencers': '#3fb950',
          'QC Instruments':       '#d2a8ff',
          'Sample Preparation':   '#ffa657',
          'PCR Instruments':      '#f78166',
          'Single-Cell Platforms':'#79c0ff',
          'Mass Spectrometers':   '#e3b341',
        }[eq.category] || '#8b949e';

        return `<div class="equip-gallery-card" style="--eg-color:${catColor}">
          <div class="egc-preview">${visual}</div>
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
            <div class="egc-section-label">When to use</div>
            <div class="egc-when">${eq.whenToUse}</div>
            ${eq.alternatives && eq.alternatives.length ? `<div class="egc-alts">Alternatives: ${eq.alternatives.join(' · ')}</div>` : ''}
          </div>
        </div>`;
      }).join('');
    }

    renderCards('All');
    OmicsLab.App._renderEquipmentCards = renderCards;
  }

  function _filterEquipment(cat, btn) {
    /* Handle both disease and equipment filter tabs */
    const section = btn.closest('.equip-filter-tabs, .disease-filter-tabs');
    if (section) section.querySelectorAll('.df-tab').forEach(t => t.classList.remove('active'));
    else document.querySelectorAll('.df-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    if (OmicsLab.App._renderEquipmentCards) OmicsLab.App._renderEquipmentCards(cat);
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
      'Alignment':'🎯', 'Variant Calling':'🔍', 'Quality Control':'✅',
      'Trimming & QC':'✂️', 'Single-Cell':'🔬', 'Single-Cell Analysis':'🧫',
      'Batch Correction':'🔄', 'Differential Expression':'📊',
      'Functional Enrichment':'🌿', 'Peak Calling':'⛰️',
      'Peak Calling & Motif':'🔣', 'Visualisation':'👁️',
      'Taxonomic Classification':'🌳', 'Functional Profiling':'🔬',
      '16S Analysis':'🧫', 'ASV Inference':'🔬',
      'Metabolomics':'⚗️', 'Metabolomics Statistics':'📈',
      'Proteomics':'🧬', 'Proteomics Statistics':'📊',
      'Viral Lineage':'🦠', 'Viral QC & Lineage':'🧬',
      'Variant Annotation':'🏷️',
    };

    grid.innerHTML = Object.entries(cats).map(([cat, toolList]) => {
      const icon = catIcons[cat] || '🔬';
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
          <span class="tcc-icon">${icon}</span>
          <span class="tcc-name">${cat}</span>
          <span class="tcc-count">${toolList.length} tool${toolList.length>1?'s':''}</span>
        </div>
        <div class="tcc-tools">${toolItems}</div>
      </div>`;
    }).join('');
  }

  /* ─── Init ─── */
  function init() {
    buildLanding();
    showScreen('screen-landing');
  }

  return { init, startWorkflow, goHome, showResults, showScreen, _filterDiseases, _filterEquipment, _renderDiseaseCards: null, _renderEquipmentCards: null };
})();

/* ─── Boot on DOM ready ─── */
document.addEventListener('DOMContentLoaded', () => OmicsLab.App.init());
