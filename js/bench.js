/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Bench Renderer + Drag-and-Drop System
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

/* ─── QC Panel ────────────────────────────────────────────── */
OmicsLab.QC = (function() {
  const GAUGES = [
    { key:'sampleIntegrity',   label:'Sample Integrity',    inv:false, fmt:v=>`${(v/10).toFixed(1)}/10 RIN` },
    { key:'purity',            label:'260/280 Purity',      inv:false, fmt:v=>v>=88?'1.9–2.1':v>=65?'~1.7':'<1.5' },
    { key:'yield',             label:'Material Yield',      inv:false, fmt:v=>`${v}%` },
    { key:'libraryComplexity', label:'Library Complexity',  inv:false, fmt:v=>`${v}%` },
    { key:'sequencingQ30',     label:'Q30 Score',           inv:false, fmt:v=>`${v}%` },
    { key:'alignmentRate',     label:'Alignment Rate',      inv:false, fmt:v=>`${v}%` },
    { key:'duplication',       label:'Duplication Rate',    inv:true,  fmt:v=>`${v}%` },
    { key:'contamination',     label:'Contamination',       inv:true,  fmt:v=>`${v}%` },
  ];

  function render() {
    const q = OmicsLab.State.quality;
    document.getElementById('qc-gauges').innerHTML = GAUGES.map(g => {
      const v = q[g.key];
      const color = OmicsLab.Engine.qualityColor(v, g.inv);
      return `<div class="qc-gauge" id="gauge-${g.key}">
        <div class="qc-gauge-head">
          <span class="qc-gauge-name">${g.label}</span>
          <span class="qc-gauge-val" id="gval-${g.key}" style="color:${color}">${g.fmt(v)}</span>
        </div>
        <div class="qc-track"><div class="qc-fill" id="gbar-${g.key}" style="width:${v}%;background:${color}"></div></div>
      </div>`;
    }).join('');
  }

  function update() {
    const q = OmicsLab.State.quality;
    GAUGES.forEach(g => {
      const v     = q[g.key];
      const color = OmicsLab.Engine.qualityColor(v, g.inv);
      const bar   = document.getElementById(`gbar-${g.key}`);
      const val   = document.getElementById(`gval-${g.key}`);
      if (bar) { bar.style.width = `${v}%`; bar.style.background = color; }
      if (val) { val.textContent = g.fmt(v); val.style.color = color; }
    });
    const sc  = OmicsLab.Engine.computeScore();
    const el  = document.getElementById('score-num');
    if (el) {
      el.textContent = sc;
      el.className = 'score-num ' + (sc >= 70 ? 'ok' : sc >= 50 ? 'warn' : 'bad');
    }
    renderSidebar();
    renderMistakes();
  }

  function renderSidebar() {
    const q   = OmicsLab.State.quality;
    const rows = [
      { key:'sampleIntegrity',   label:'Sample Integrity' },
      { key:'libraryComplexity', label:'Library Complexity' },
      { key:'duplication',       label:'Duplication',     inv:true },
      { key:'contamination',     label:'Contamination',   inv:true },
    ];
    document.getElementById('sidebar-quality').innerHTML = rows.map(r => {
      const v = q[r.key];
      const color = OmicsLab.Engine.qualityColor(v, r.inv);
      return `<div class="sqm-row">
        <div class="sqm-label">
          <span>${r.label}</span>
          <span style="color:${color};font-weight:700">${v}%</span>
        </div>
        <div class="sqm-track">
          <div class="sqm-fill" style="width:${v}%;background:${color}"></div>
        </div>
      </div>`;
    }).join('');
  }

  function renderPipeline(stageIdx) {
    const wf = OmicsLab.Workflows[OmicsLab.State.workflow];
    document.getElementById('pipeline-track').innerHTML = wf.pipeline.map((name, i) => {
      let cls = i < stageIdx ? 'p-done' : i === stageIdx ? 'p-active' : '';
      return `<div class="pipe-node ${cls}">
        <div class="pipe-dot"></div>
        <span>${name}</span>
      </div>`;
    }).join('');
  }

  function renderMistakes() {
    const log = document.getElementById('mistake-log');
    if (!log) return;
    if (OmicsLab.State.mistakes.length === 0) {
      log.innerHTML = '<div class="no-mistakes">✓ No mistakes yet</div>';
    } else {
      log.innerHTML = OmicsLab.State.mistakes.map(m =>
        `<div class="mistake-entry"><strong>Step ${m.step}:</strong> ${m.choice}</div>`
      ).join('');
      log.scrollTop = log.scrollHeight;
    }
  }

  function flashGauge(key, direction) {
    const el = document.getElementById(`gauge-${key}`);
    if (!el) return;
    el.style.transition = 'none';
    el.style.background = direction === 'up' ? 'rgba(63,185,80,0.1)' : 'rgba(229,83,75,0.1)';
    setTimeout(() => { el.style.transition = 'background 0.8s'; el.style.background = ''; }, 50);
  }

  /* Disease context panel — which diseases this workflow investigates */
  function renderDiseaseContext() {
    const panel = document.getElementById('disease-context-panel');
    if (!panel) return;
    const wfId    = OmicsLab.State.workflow;
    const dids    = (OmicsLab.WorkflowDiseases && OmicsLab.WorkflowDiseases[wfId]) || [];
    if (!dids.length || !OmicsLab.DISEASES) {
      panel.innerHTML = '<div style="color:var(--text-muted);font-size:0.78rem;padding:0.5rem 0">No disease context available</div>';
      return;
    }
    panel.innerHTML = dids.map(did => {
      const d = OmicsLab.DISEASES[did];
      if (!d) return '';
      const bm = d.biomarkers ? d.biomarkers.slice(0,3).join(' · ') : '';
      return `<div class="dc-mini-card" style="--dc-color:${d.color}">
        <div class="dc-mini-head">
          <span class="dc-mini-icon">${d.icon}</span>
          <span class="dc-mini-name">${d.name}</span>
          <span class="dc-mini-cat">${d.category}</span>
        </div>
        ${bm ? `<div class="dc-mini-bm">🎯 ${bm}</div>` : ''}
      </div>`;
    }).join('');
  }

  /* Tool flow panel — tools relevant to the current step */
  function renderToolFlow(step) {
    const panel = document.getElementById('tool-flow-panel');
    if (!panel || !step) return;

    const phaseLC = (step.phase || '').toLowerCase();
    const stageTools = _getStepTools(step.id, phaseLC);

    if (!stageTools.length) {
      panel.innerHTML = '<div style="color:var(--text-muted);font-size:0.78rem;padding:0.5rem 0">Wet-lab step — no computational tools</div>';
      return;
    }

    panel.innerHTML = stageTools.map(tid => {
      const t = OmicsLab.TOOLS && OmicsLab.TOOLS[tid];
      if (!t) return '';
      return `<div class="tf-mini-card">
        <div class="tf-mini-name">${t.name}</div>
        <div class="tf-mini-io"><span class="tf-in">${t.input}</span> → <span class="tf-out">${t.output}</span></div>
        <div class="tf-mini-desc">${t.desc.substring(0,100)}${t.desc.length>100?'…':''}</div>
        <div class="tf-mini-cat">${t.category}</div>
      </div>`;
    }).join('');
  }

  /* Map step IDs → relevant tool IDs */
  function _getStepTools(stepId, phase) {
    const stepToolMap = {
      'alignment':       ['bwa-mem2','fastqc','fastp'],
      'aligner-rna':     ['star','fastp','fastqc'],
      'variant-caller':  ['gatk-hc','deepvariant','annovar'],
      'annotation-wes':  ['gatk-hc','vep','annovar'],
      'de-method':       ['deseq2','edger','clusterprofiler'],
      'deseq-method':    ['deseq2','clusterprofiler'],
      'tax-classifier':  ['kraken2','humann3'],
      'functional':      ['humann3','clusterprofiler'],
      'normalization':   ['deseq2','scanpy'],
      'doublet-removal': ['seurat','scanpy'],
      'batch-correction':['harmony','seurat','scanpy'],
      'peak-caller':     ['macs3','homer','deeptools'],
      'motif-analysis':  ['homer','deeptools'],
      'mito-filter':     ['seurat','scanpy'],
      'idr-chip':        ['macs3','deeptools'],
      'asv-otu':         ['dada2','qiime2'],
      'feature-detect':  ['xcms','metaboanalyst'],
      'prot-quant':      ['maxquant','perseus'],
      'lineage':         ['pangolin','nextclade'],
      'cite-integration':['seurat','harmony'],
      'rin-check':       ['fastqc','multiqc'],
      'ct-threshold':    ['fastqc'],
    };
    if (stepToolMap[stepId]) return stepToolMap[stepId];
    if (phase.includes('bioinformatics') || phase.includes('analysis')) {
      return ['fastqc','multiqc'];
    }
    return [];
  }

  return { render, update, renderPipeline, flashGauge, renderSidebar, renderMistakes, renderDiseaseContext, renderToolFlow };
})();

/* ─── Protocol Step List ─────────────────────────────────── */
OmicsLab.ProtocolPanel = (function() {
  function render(currentIdx) {
    const wf    = OmicsLab.Workflows[OmicsLab.State.workflow];
    const total = wf.steps.length;
    document.getElementById('step-dots').innerHTML = wf.steps.map((_, i) => {
      const cls = i < currentIdx ? 'done' : i === currentIdx ? 'active' : '';
      return `<div class="step-dot ${cls}"></div>`;
    }).join('');
    document.getElementById('step-counter').textContent = `Step ${currentIdx + 1} of ${total}`;

    document.getElementById('protocol-steps').innerHTML = wf.steps.map((step, i) => {
      let cls = 'locked';
      if (i < currentIdx) cls = 'done';
      else if (i === currentIdx) cls = 'active';
      const num = i < currentIdx ? '✓' : (i + 1);
      return `<div class="proto-step ${cls}">
        <div class="proto-num">${num}</div>
        <div class="proto-info">
          <div class="proto-step-name">${step.title}</div>
          <div class="proto-step-phase">${step.phase}${cls === 'done' ? ' · done' : cls === 'active' ? ' · in progress' : ''}</div>
        </div>
      </div>`;
    }).join('');
  }
  return { render };
})();

/* ─── Drag-and-Drop System ───────────────────────────────── */
OmicsLab.DragDrop = (function() {
  let _dragging = null;
  let _ghost    = null;

  function buildShelf(reagentIds) {
    const items = reagentIds.map(id => {
      const r = OmicsLab.REAGENTS[id];
      if (!r) return '';
      return `<div class="reagent-item" draggable="true"
                   data-rid="${id}"
                   data-cat="${r.cat}"
                   id="reagent-${id}">
        <div class="reagent-emoji">${r.emoji}</div>
        <div class="reagent-name">${r.label}</div>
        <div class="reagent-cat">${r.cat}</div>
      </div>`;
    }).join('');
    return `<div class="reagent-shelf">
      <div class="shelf-label">Reagent Shelf</div>
      ${items}
    </div>`;
  }

  function buildDropZone(step) {
    return `<div class="equipment-area">
      <div class="drop-zone" id="main-drop-zone" data-step-id="${step.id}">
        <div class="reaction-overlay" id="reaction-overlay"></div>
        <div class="equip-icon" id="equip-icon">${step.equipIcon || '🔬'}</div>
        <div class="equip-name">${step.equipName || 'Equipment'}</div>
        <div class="equip-hint">${step.dropHint || 'Drag reagent here'}</div>
        <div class="equip-status" id="equip-status">✓ Reagent Added</div>
      </div>
    </div>`;
  }

  function attachEvents(step, onDrop) {
    const zone = document.getElementById('main-drop-zone');
    if (!zone) return;

    document.querySelectorAll('.reagent-item').forEach(el => {
      el.addEventListener('dragstart', e => {
        _dragging = el.dataset.rid;
        el.classList.add('dragging');
        e.dataTransfer.setData('text/plain', _dragging);
        e.dataTransfer.effectAllowed = 'move';

        const r = OmicsLab.REAGENTS[_dragging];
        if (r) {
          _ghost = document.createElement('div');
          _ghost.className = 'drag-ghost';
          _ghost.textContent = `${r.emoji} ${r.label}`;
          document.body.appendChild(_ghost);
          e.dataTransfer.setDragImage(new Image(), 0, 0);
        }
      });

      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        _dragging = null;
        if (_ghost) { _ghost.remove(); _ghost = null; }
      });
    });

    document.addEventListener('dragover', positionGhost);

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      if (!zone.classList.contains('filled')) {
        const valid = step.reagentIds.includes(_dragging);
        zone.classList.toggle('drag-over-valid',   valid);
        zone.classList.toggle('drag-over-invalid', !valid);
      }
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over-valid', 'drag-over-invalid');
    });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over-valid', 'drag-over-invalid');
      const rid = e.dataTransfer.getData('text/plain') || _dragging;
      document.removeEventListener('dragover', positionGhost);
      if (rid && !zone.classList.contains('filled')) {
        handleDrop(rid, step, zone, onDrop);
      }
    });

    attachTouchEvents(step, zone, onDrop);
  }

  function positionGhost(e) {
    if (_ghost) {
      _ghost.style.left = e.clientX + 'px';
      _ghost.style.top  = e.clientY + 'px';
    }
  }

  function handleDrop(rid, step, zone, onDrop) {
    const opt = step.optionMap[rid];
    const r   = OmicsLab.REAGENTS[rid];
    if (!opt || !r) return;

    zone.classList.add('filled', 'animate-drop');
    const icon = document.getElementById('equip-icon');
    if (icon) icon.textContent = r.emoji;

    const reagentEl = document.getElementById(`reagent-${rid}`);
    if (reagentEl) reagentEl.classList.add('used');

    OmicsLab.Engine.applyOption(opt, step.id);
    OmicsLab.QC.update();

    spawnBubbles(zone, opt.impact);
    onDrop(rid, opt, r);
  }

  function spawnBubbles(zone, impact) {
    const colors = { good:'#3fb950', bad:'#e5534b', warn:'#d29922' };
    const color  = colors[impact] || '#8b949e';
    const overlay = document.getElementById('reaction-overlay');
    if (!overlay) return;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const b = document.createElement('div');
        b.className = 'bubble';
        b.style.cssText = `left:${20+Math.random()*60}%;bottom:${10+Math.random()*40}%;background:${color}88;animation-delay:${Math.random()*0.3}s`;
        overlay.appendChild(b);
        setTimeout(() => b.remove(), 1000);
      }, i * 60);
    }
  }

  function attachTouchEvents(step, zone, onDrop) {
    let touchItem = null;
    let touchGhost = null;

    document.querySelectorAll('.reagent-item').forEach(el => {
      el.addEventListener('touchstart', e => {
        touchItem = el;
        const r = OmicsLab.REAGENTS[el.dataset.rid];
        touchGhost = document.createElement('div');
        touchGhost.className = 'drag-ghost';
        touchGhost.textContent = `${r.emoji} ${r.label}`;
        document.body.appendChild(touchGhost);
        e.preventDefault();
      }, { passive: false });

      el.addEventListener('touchmove', e => {
        const t = e.touches[0];
        if (touchGhost) {
          touchGhost.style.left = t.clientX + 'px';
          touchGhost.style.top  = t.clientY + 'px';
        }
        const rect = zone.getBoundingClientRect();
        const over = t.clientX >= rect.left && t.clientX <= rect.right &&
                     t.clientY >= rect.top  && t.clientY <= rect.bottom;
        zone.classList.toggle('drag-over-valid', over);
        e.preventDefault();
      }, { passive: false });

      el.addEventListener('touchend', e => {
        if (touchGhost) { touchGhost.remove(); touchGhost = null; }
        zone.classList.remove('drag-over-valid', 'drag-over-invalid');
        const t = e.changedTouches[0];
        const rect = zone.getBoundingClientRect();
        const over = t.clientX >= rect.left && t.clientX <= rect.right &&
                     t.clientY >= rect.top  && t.clientY <= rect.bottom;
        if (over && touchItem && !zone.classList.contains('filled')) {
          handleDrop(touchItem.dataset.rid, step, zone, onDrop);
        }
        touchItem = null;
      });
    });
  }

  return { buildShelf, buildDropZone, attachEvents };
})();

/* ─── Step Renderer ──────────────────────────────────────── */
OmicsLab.Renderer = (function() {

  function renderStep(stepIndex) {
    const wf   = OmicsLab.Workflows[OmicsLab.State.workflow];
    const step = wf.steps[stepIndex];
    if (!step) { OmicsLab.App.showResults(); return; }

    OmicsLab.State.currentStep = stepIndex;
    OmicsLab.ProtocolPanel.render(stepIndex);
    OmicsLab.QC.renderPipeline(step.pipelineStage || 0);
    OmicsLab.QC.renderDiseaseContext();
    OmicsLab.QC.renderToolFlow(step);

    document.getElementById('step-phase-tag').textContent = step.phase;
    document.getElementById('step-title').textContent     = step.title;
    document.getElementById('step-desc').textContent      = step.desc;

    const bench = document.getElementById('bench-workspace');
    if (step.type === 'drag')        renderDragStep(step, bench);
    else if (step.type === 'choice') renderChoiceStep(step, bench);
    else if (step.type === 'slider') renderSliderStep(step, bench);

    bench.classList.add('animate-in');
    setTimeout(() => bench.classList.remove('animate-in'), 400);
    setTimeout(() => startEquipTimer(bench), 80);
  }

  function eduNote(text) {
    if (!text) return '';
    return `<div class="edu-note"><span class="edu-note-icon">💡</span><span>${text}</span></div>`;
  }

  function equipVisual(step) {
    if (!OmicsLab.Equipment) return '';
    const type = OmicsLab.Equipment.resolveType(step.id, step.phase);
    return OmicsLab.Equipment.render(type, {});
  }

  /* Drives the equipment progress bar and fires a completion state */
  function startEquipTimer(bench) {
    const equipEl = bench.querySelector('.equip-visual');
    if (!equipEl) return;
    const simMs = parseInt(equipEl.dataset.simDuration) || 0;
    if (!simMs) return;

    // Inject real-world sim-time chip next to the name label
    const label = equipEl.querySelector('.equip-name-label');
    if (label && !equipEl.querySelector('.equip-simtime')) {
      const chip = document.createElement('div');
      chip.className = 'equip-simtime';
      const realLabels = {
        3500:'real: ~10 min · 12,000 × g · 4°C',
        3000:'real: ~10–30 min',
        4000:'real: ~30–90 min',
        4500:'real: ~18 min – 2 h',
        5000:'real: ~24–48 h',
        2000:'real: ~2–5 min',
        2500:'real: ~5–30 min',
      };
      chip.textContent = realLabels[simMs] || `sim: ${(simMs/1000).toFixed(1)}s`;
      label.after(chip);
    }

    // Inject and animate progress bar
    const bar = document.createElement('div');
    bar.className = 'equip-progress-bar';
    equipEl.appendChild(bar);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.style.transition = `width ${simMs}ms linear`;
      bar.style.width = '100%';
    }));

    // On completion: stop animations, show done badge
    setTimeout(() => {
      equipEl.classList.add('equip-complete');

      const dot = equipEl.querySelector('.panel-dot');
      if (dot) { dot.classList.remove('running'); dot.classList.add('done'); }

      const cycles = equipEl.querySelector('.tc-cycles');
      if (cycles) cycles.textContent = cycles.textContent.replace('Running', '✓ Complete');

      const typing = equipEl.querySelector('.term-line.typing');
      if (typing) typing.innerHTML = 'Processing reads ██████████ 100% <span style="color:var(--success)">✓ done</span>';

      const nameLabel = equipEl.querySelector('.equip-name-label');
      if (nameLabel && !equipEl.querySelector('.equip-done-badge')) {
        const badge = document.createElement('span');
        badge.className = 'equip-done-badge';
        badge.textContent = '✓ Run complete';
        nameLabel.after(badge);
      }
    }, simMs);
  }

  function showFeedback(impact, title, body) {
    const box = document.getElementById('feedback-box');
    if (!box) return;
    const cls = impact === 'good' ? 'feedback-good' : impact === 'bad' ? 'feedback-bad' : 'feedback-warn';
    box.className = `feedback-box ${cls}`;
    box.innerHTML = `<div class="feedback-title">${title}</div>${body}`;
    box.style.display = 'block';
  }

  /* ── Drag step ── */
  function renderDragStep(step, bench) {
    bench.innerHTML = `
      ${equipVisual(step)}
      ${eduNote(step.edu)}
      <div class="dnd-area">
        ${OmicsLab.DragDrop.buildShelf(step.reagentIds)}
        ${OmicsLab.DragDrop.buildDropZone(step)}
      </div>
      <div class="feedback-box" id="feedback-box" style="display:none"></div>
      <button class="btn-advance" id="btn-advance" disabled>Drop a reagent to continue →</button>
    `;

    OmicsLab.DragDrop.attachEvents(step, (rid, opt, reagent) => {
      const titles = { good:'✓ Correct Choice', bad:'✗ Problematic Choice', warn:'⚠ Suboptimal Choice' };
      const bodies = {
        good:`<strong>${reagent.label}</strong> is the optimal reagent here. Quality metrics maintained.`,
        bad: `<strong>${reagent.label}</strong> will cause significant downstream problems. Check the QC panel for the impact.`,
        warn:`<strong>${reagent.label}</strong> works but isn't ideal. Minor quality penalty applied.`
      };
      showFeedback(opt.impact, titles[opt.impact], bodies[opt.impact]);

      const btn = document.getElementById('btn-advance');
      btn.disabled = false;
      btn.textContent = 'Continue →';
      btn.onclick = () => renderStep(OmicsLab.State.currentStep + 1);
    });
  }

  /* ── Choice step ── */
  function renderChoiceStep(step, bench) {
    const opts = step.options;
    bench.innerHTML = `
      ${equipVisual(step)}
      ${eduNote(step.edu)}
      <div class="choice-grid" id="choice-grid">
        ${opts.map((o, i) => {
          const badgeCls = o.impact === 'good' ? 'badge-green' : o.impact === 'bad' ? 'badge-red' : 'badge-orange';
          const badgeLbl = o.impact === 'good' ? '✓ Optimal' : o.impact === 'bad' ? '✗ Avoid' : '⚠ Suboptimal';
          return `<button class="choice-btn" data-idx="${i}">
            <div class="cb-title">${o.label}</div>
            <div class="cb-desc">${o.desc}</div>
            <div class="cb-badge domain-badge ${badgeCls}" style="margin-top:0.5rem">${badgeLbl}</div>
          </button>`;
        }).join('')}
      </div>
      <div class="feedback-box" id="feedback-box" style="display:none"></div>
      <button class="btn-advance" id="btn-advance" disabled>Select an option to continue →</button>
    `;

    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('cb-locked')) return;
        const idx = parseInt(btn.dataset.idx);
        const opt = opts[idx];

        document.querySelectorAll('.choice-btn').forEach(b => b.classList.add('cb-locked'));
        btn.classList.add(opt.impact === 'bad' ? 'cb-wrong' : 'cb-selected');

        OmicsLab.Engine.applyOption(opt, step.id);
        OmicsLab.QC.update();

        const titles = { good:'✓ Excellent', bad:'✗ Poor choice', warn:'⚠ Suboptimal' };
        const bodies = {
          good:`<strong>${opt.label}</strong> — optimal for this step. No quality penalty.`,
          bad: `<strong>${opt.label}</strong> causes significant problems. Your QC metrics have dropped.`,
          warn:`<strong>${opt.label}</strong> introduces minor issues. Small quality penalty applied.`
        };
        showFeedback(opt.impact, titles[opt.impact], bodies[opt.impact]);

        const advance = document.getElementById('btn-advance');
        advance.disabled = false;
        advance.textContent = 'Continue →';
        advance.onclick = () => renderStep(OmicsLab.State.currentStep + 1);
      });
    });
  }

  /* ── Slider step ── */
  function renderSliderStep(step, bench) {
    const initVal = step.optimal;
    bench.innerHTML = `
      ${equipVisual(step)}
      ${eduNote(step.edu)}
      <div class="param-controls">
        <div class="param-title">Set Parameter</div>
        <div class="param-row">
          <div class="param-label">${step.label}</div>
          <div class="param-slider-wrap">
            <input type="range" id="main-slider"
              min="${step.min}" max="${step.max}"
              step="${step.max <= 5 ? 0.1 : step.max <= 25 ? 0.5 : 1}"
              value="${initVal}">
            <div class="optimal-bar"></div>
            <div class="param-optimal">Optimal: ~${step.optimal} ${step.unit} &nbsp;|&nbsp; Range: ${step.min}–${step.max} ${step.unit}</div>
          </div>
          <div class="param-value-box" id="slider-val">${initVal} ${step.unit}</div>
        </div>
      </div>
      <div class="feedback-box" id="feedback-box" style="display:none"></div>
      <button class="btn-advance" id="btn-advance" onclick="OmicsLab.Renderer._submitSlider()">
        Set & Continue →
      </button>
    `;

    const slider = document.getElementById('main-slider');
    const valBox = document.getElementById('slider-val');
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      valBox.textContent = `${v} ${step.unit}`;
      const d = Math.abs(v - step.optimal);
      const range = step.max - step.min;
      const color = d > range*0.3 ? '#e5534b' : d > range*0.12 ? '#d29922' : '#3fb950';
      valBox.style.color = color;
    });

    OmicsLab.Renderer._currentSliderStep = step;
  }

  function _submitSlider() {
    const step   = OmicsLab.Renderer._currentSliderStep;
    const slider = document.getElementById('main-slider');
    if (!step || !slider) return;

    const v      = parseFloat(slider.value);
    const impact = OmicsLab.Engine.applySlider(step, v);
    OmicsLab.QC.update();

    slider.disabled = true;

    const titles = { good:'✓ On target', bad:'✗ Out of range', warn:'⚠ Off-optimal' };
    const bodies  = {
      good: `${v} ${step.unit} is within the optimal range (~${step.optimal} ${step.unit}).`,
      warn: `${v} ${step.unit} is somewhat off from optimal (~${step.optimal} ${step.unit}). Minor penalty applied.`,
      bad:  `${v} ${step.unit} is significantly off from optimal (~${step.optimal} ${step.unit}). Quality has dropped.`
    };
    showFeedback(impact, titles[impact], bodies[impact]);

    const btn = document.getElementById('btn-advance');
    btn.textContent = 'Continue →';
    btn.onclick = () => renderStep(OmicsLab.State.currentStep + 1);
  }

  return { renderStep, _submitSlider, _currentSliderStep: null };
})();

/* Choice button + context panel styles */
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    .choice-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.75rem; margin-bottom: 1rem;
    }
    .choice-btn {
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 1rem 1.1rem;
      cursor: pointer; text-align: left; color: var(--text);
      transition: all 0.2s; display: flex; flex-direction: column; gap: 0.25rem;
    }
    .choice-btn:hover:not(.cb-locked) { border-color: var(--info); background: rgba(88,166,255,0.07); }
    .choice-btn.cb-selected { border-color: var(--success); background: rgba(63,185,80,0.08); }
    .choice-btn.cb-wrong    { border-color: var(--danger);  background: rgba(229,83,75,0.08); animation: shake 0.35s; }
    .choice-btn.cb-locked   { opacity: 0.5; cursor: not-allowed; }
    .cb-title { font-weight: 700; font-size: 0.88rem; }
    .cb-desc  { font-size: 0.78rem; color: var(--text-muted); line-height: 1.5; }
    @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

    /* Disease context mini-cards */
    .dc-mini-card {
      background: color-mix(in srgb, var(--dc-color, #58a6ff) 8%, var(--surface-2));
      border: 1px solid color-mix(in srgb, var(--dc-color, #58a6ff) 30%, transparent);
      border-radius: 6px; padding: 0.55rem 0.7rem; margin-bottom: 0.4rem;
    }
    .dc-mini-head { display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; }
    .dc-mini-icon { font-size:1rem; }
    .dc-mini-name { font-size:0.78rem; font-weight:700; color:var(--dc-color,var(--text)); flex:1; }
    .dc-mini-cat  { font-size:0.65rem; color:var(--text-muted); background:var(--surface-3);
                    padding:1px 5px; border-radius:3px; }
    .dc-mini-bm   { font-size:0.68rem; color:var(--text-muted); margin-top:0.25rem; line-height:1.4; }

    /* Tool flow mini-cards */
    .tf-mini-card {
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: 6px; padding: 0.55rem 0.7rem; margin-bottom: 0.4rem;
    }
    .tf-mini-name { font-size:0.8rem; font-weight:700; color:var(--info); margin-bottom:0.2rem; }
    .tf-mini-io   { font-size:0.68rem; color:var(--text-muted); margin-bottom:0.2rem; font-family:monospace; }
    .tf-in        { color:var(--warning); }
    .tf-out       { color:var(--success); }
    .tf-mini-desc { font-size:0.7rem; color:var(--text-muted); line-height:1.4; margin-bottom:0.2rem; }
    .tf-mini-cat  { font-size:0.62rem; color:var(--text-muted); background:var(--surface-3);
                    padding:1px 5px; border-radius:3px; display:inline-block; }
  `;
  document.head.appendChild(s);
})();
