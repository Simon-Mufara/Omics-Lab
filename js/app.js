/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Main App Controller
   Landing page, screen management, results, timer
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.App = (function() {

  /* ─── Screen management ─── */
  function showScreen(id) {
    ['screen-landing','screen-lab','screen-chooser','screen-results'].forEach(s => {
      const el = document.getElementById(s);
      if (el) { el.style.display = 'none'; el.classList.remove('active'); }
    });
    const target = document.getElementById(id);
    if (!target) return;
    const flexScreens = ['screen-landing', 'screen-lab', 'screen-chooser'];
    target.style.display = flexScreens.includes(id) ? 'flex' : 'block';
    target.classList.add('active');
    window.scrollTo(0, 0);
  }

  /* ─── Open the full-screen domain chooser ─── */
  function openChooser() {
    closeWfPicker();
    showScreen('screen-chooser');
    _buildWorkflowGrid();
    /* Entry animation */
    const chooser = document.getElementById('screen-chooser');
    if (chooser) {
      chooser.classList.remove('chooser-entering');
      void chooser.offsetWidth;
      chooser.classList.add('chooser-entering');
      setTimeout(() => chooser.classList.remove('chooser-entering'), 380);
    }
    /* Sync nav active state to 'lab' group */
    document.querySelectorAll('.nav-group-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.group === 'train');
    });
  }

  /* ─── Domain tile selected — show workflow picker drawer ─── */
  function selectDomain(domainId) {
    const domain = OmicsLab.DOMAINS.find(d => d.id === domainId);
    if (!domain) return;

    /* Highlight the selected tile, dim others */
    document.querySelectorAll('.domain-tile').forEach(tile => {
      const isSelected = tile.dataset.domainId === domainId;
      tile.classList.toggle('domain-selected', isSelected);
      tile.classList.toggle('domain-dimmed', !isSelected);
    });

    /* Populate the picker */
    const badge = document.getElementById('wf-picker-domain-badge');
    const cards = document.getElementById('wf-picker-cards');
    if (!badge || !cards) return;

    badge.textContent = domain.label;
    badge.style.color       = domain.colorHex;
    badge.style.borderColor = domain.colorHex + '55';
    badge.style.background  = domain.colorHex + '14';

    const diffMap = {
      beginner:     ['diff-b', 'Beginner'],
      intermediate: ['diff-i', 'Intermediate'],
      advanced:     ['diff-a', 'Advanced'],
    };

    cards.innerHTML = domain.workflows.map(wfId => {
      const wf = OmicsLab.Workflows[wfId];
      if (!wf) return '';
      const [dc, dl] = diffMap[wf.difficulty] || ['diff-i', wf.difficulty];
      const desc = wf.desc || wf.tagline || wf.name;
      return `
        <button class="wf-pick-card" role="listitem"
                onclick="OmicsLab.App.startWorkflow('${wfId}')"
                style="--domain-color:${domain.colorHex};--domain-rgb:${domain.rgb}">
          <div class="wpc-header">
            <span class="wpc-name">${wf.name}</span>
            <span class="wpc-diff ${dc}">${dl}</span>
          </div>
          <div class="wpc-desc">${desc}</div>
          <div class="wpc-footer">
            <span class="wpc-steps">${wf.steps.length} steps</span>
            <span class="wpc-start">Start Protocol →</span>
          </div>
        </button>`;
    }).join('');

    /* Slide the picker up */
    const picker = document.getElementById('wf-picker');
    if (picker) {
      picker.classList.add('wf-picker-open');
      picker.setAttribute('aria-hidden', 'false');
    }

    if (OmicsLab.Sound) OmicsLab.Sound.pick();
  }

  /* ─── Close workflow picker ─── */
  function closeWfPicker() {
    const picker = document.getElementById('wf-picker');
    if (picker) {
      picker.classList.remove('wf-picker-open');
      picker.setAttribute('aria-hidden', 'true');
    }
    document.querySelectorAll('.domain-tile').forEach(tile => {
      tile.classList.remove('domain-selected', 'domain-dimmed');
    });
  }

  /* ─── Back from chooser → home ─── */
  function chooserBack() {
    closeWfPicker();
    showScreen('screen-landing');
    if (OmicsLab.Router) OmicsLab.Router.navigate('home');
  }

  /* ─── Start a workflow ─── */
  function startWorkflow(wfId) {
    const wf = OmicsLab.Workflows[wfId];
    if (!wf) return;

    OmicsLab.Engine.reset(wfId);
    clearSabotageStep();

    document.getElementById('topbar-wf-name').textContent   = wf.name;
    document.getElementById('topbar-domain').textContent    = wf.domainLabel;
    document.getElementById('topbar-domain').style.background = wf.colorHex + '22';
    document.getElementById('topbar-domain').style.color    = wf.colorHex;
    document.getElementById('topbar-domain').style.border   = `1px solid ${wf.colorHex}44`;

    /* Close picker first (in case we came from chooser) */
    closeWfPicker();

    const chooser = document.getElementById('screen-chooser');
    const fromChooser = chooser && chooser.classList.contains('active');

    const _enterLab = () => {
      showScreen('screen-lab');
      const labScreen = document.getElementById('screen-lab');
      if (labScreen) {
        labScreen.classList.remove('lab-entering');
        void labScreen.offsetWidth;
        labScreen.classList.add('lab-entering');
        setTimeout(() => labScreen.classList.remove('lab-entering'), 480);
      }
      OmicsLab.QC.render();
      OmicsLab.QC.renderSidebar();
      OmicsLab.QC.renderMistakes();
      OmicsLab.QC.renderPipeline(0);
      OmicsLab.Renderer.renderStep(0);
      startTimer();
      if (OmicsLab.Sound) OmicsLab.Sound.step();
    };

    if (fromChooser) {
      /* Animate chooser exit, then reveal lab */
      chooser.classList.add('chooser-exiting');
      setTimeout(() => {
        chooser.classList.remove('chooser-exiting');
        _enterLab();
      }, 280);
    } else {
      _enterLab();
    }
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

  /* ─── Go home (from lab bench) ─── */
  function goHome() {
    stopTimer();
    closeWfPicker();
    showScreen('screen-landing');
    if (OmicsLab.Router) OmicsLab.Router.navigate('home');
  }

  /* ─── Results ─── */
  function showResults() {
    stopTimer();
    if (OmicsLab.Sound) OmicsLab.Sound.complete();
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

      ${_buildCostCalculator(wf, score)}

      ${_buildTroubleshootTrigger(rows)}

      ${_buildVariantWalkthrough(wf.id)}

      <div class="results-actions">
        <button class="btn-result-primary" onclick="OmicsLab.App.startWorkflow('${wf.id}')">
          ${OmicsLab.Icons.svg('rotate-cw',15)} Retry This Protocol
        </button>
        <button class="btn-result-primary" style="background:var(--info)" onclick="OmicsLab.App.goHome()">
          ${OmicsLab.Icons.svg('dna',15)} Choose Different Workflow
        </button>
        <button class="btn-result-primary" style="background:#a371f7" onclick="OmicsLab.Quiz && OmicsLab.Quiz.start('${wf.id}')">
          ${OmicsLab.Icons.svg('help-circle',15)} Take Quiz
        </button>
        <button class="btn-share" onclick="OmicsLab.App.printReport()">
          &#128196; Download Report
        </button>
        <button class="btn-share" onclick="OmicsLab.App.shareResults('${wf.name}', ${score})">
          &#8679; Share Results
        </button>
      </div>
    `;

    showScreen('screen-results');
  }

  /* ─── Cost & Time Calculator ─── */
  function _buildCostCalculator(wf, score) {
    const META = {
      'wgs':        { cost:550, costAf:750, time:'3–5 days', reagents:'DNeasy + TruSeq + NovaSeq run', notes:'NovaSeq flow cell dominates cost' },
      'wes':        { cost:220, costAf:320, time:'2–4 days', reagents:'SureSelect capture + NovaSeq', notes:'Capture kit is the main cost driver' },
      'rna-seq':    { cost:150, costAf:210, time:'2–3 days', reagents:'RNeasy + TruSeq Stranded + NextSeq', notes:'Bioanalyzer QC + library prep ~$50' },
      'scrna-seq':  { cost:1100,costAf:1500,time:'2–3 days', reagents:'10x Chromium Chip + GEX kit + NovaSeq', notes:'Chromium chip + GEX kit ~$700 of total' },
      'atac-seq':   { cost:300, costAf:420, time:'2–3 days', reagents:'Tn5 transposase + NextSeq', notes:'Cell viability >85% required — poor viability wastes all reagents' },
      'chip-seq':   { cost:350, costAf:480, time:'3–4 days', reagents:'ChIP-grade Ab + protein A/G beads + NextSeq', notes:'Ab cost highly variable ($100–500); sonication optimisation adds time' },
      'shotgun-meta':{ cost:250,costAf:380, time:'3–5 days', reagents:'PowerSoil Pro + Nextera XT + NovaSeq', notes:'Host depletion adds $30–50 per sample' },
      '16s-amplicon':{ cost:55, costAf:75,  time:'1–2 days', reagents:'515F/806R primers + KAPA HiFi + MiSeq', notes:'MiSeq reagent kit amortised across 96+ samples' },
      'lc-ms':      { cost:380, costAf:520, time:'2–4 days', reagents:'HILIC + C18 columns + Orbitrap run + ISTD mix', notes:'Column maintenance and Orbitrap downtime major cost factors in Africa' },
      'proteomics': { cost:450, costAf:620, time:'3–5 days', reagents:'SP3 beads + trypsin + Orbitrap Exploris 480 run', notes:'Orbitrap service contract ~$50K/yr — major African lab constraint' },
      'viral-wgs':  { cost:140, costAf:190, time:'1–3 days', reagents:'ARTIC v4.1 primers + MinION flow cell + library kit', notes:'MinION flow cell ($500–800); R10.4 gives best accuracy for variants' },
      'cite-seq':   { cost:1600,costAf:2200,time:'3–4 days', reagents:'TotalSeq-B Ab panel + 10x v3.1 + NovaSeq', notes:'Ab panel cost scales with number of markers (10–300+)' },
      'rt-qpcr':    { cost:35,  costAf:50,  time:'4–8 hours',reagents:'SuperScript IV VILO + SYBR Green + QuantStudio', notes:'Most affordable omics workflow; excellent for resource-limited labs' },
      'ampli-seq':  { cost:110, costAf:160, time:'1–2 days', reagents:'AmpliSeq panel + Ion Torrent PGM or MiSeq', notes:'Panel design cost (one-off) $1500–5000; per-run cost shown' }
    };
    const m = META[wf.id];
    if (!m) return '';
    const africaPremium = Math.round((m.costAf - m.cost) / m.cost * 100);
    const q = OmicsLab.State.quality;
    const efficiencyPenalty = q.sampleIntegrity < 70 || q.purity < 70 ? `${OmicsLab.Icons?.svg('alert-triangle',12) || ''} Low sample quality may require re-extraction — add ~30–50% to reagent cost.` : '';
    return `
      <div class="results-card">
        <div class="results-card-title">${OmicsLab.Icons.svg('trending-up',16)} Cost &amp; Time Estimate</div>
        <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1rem">
          Africa-adjusted estimates based on reagent import costs, equipment maintenance, and infrastructure factors.
        </p>
        <div class="calc-grid">
          <div class="calc-cell">
            <div class="calc-val">$${m.cost}</div>
            <div class="calc-label">Global avg. cost/sample</div>
          </div>
          <div class="calc-cell">
            <div class="calc-val calc-africa">$${m.costAf}</div>
            <div class="calc-label">Africa-adjusted (+${africaPremium}%)</div>
          </div>
          <div class="calc-cell">
            <div class="calc-val">${m.time}</div>
            <div class="calc-label">Lab turnaround time</div>
          </div>
          <div class="calc-cell">
            <div class="calc-val">${score >= 80 ? '100%' : score >= 60 ? '~80%' : '~50%'}</div>
            <div class="calc-label">Est. data usability (your score)</div>
          </div>
        </div>
        <div class="calc-reagents"><strong>Key reagents:</strong> ${m.reagents}</div>
        <div class="calc-note">${m.notes}${efficiencyPenalty ? '<br><span style="color:var(--warning)">' + efficiencyPenalty + '</span>' : ''}</div>
      </div>`;
  }

  /* ─── Troubleshoot trigger ─── */
  function _buildTroubleshootTrigger(rows) {
    if (!OmicsLab.Troubleshoot) return '';
    const METRIC_TREE_MAP = {
      'Sample Integrity':'lowRIN','Q30 Score':'lowQ30',
      'Duplication Rate':'highDuplication','Alignment Rate':'lowAlignment',
      'Contamination':'highContamination','Library Complexity':'lowLibraryComplexity',
      '260/280 Purity':'lowRIN','Material Yield':'lowRIN'
    };
    const failed = rows.filter(r => !r.pass).map(r => r.m);
    if (!failed.length) return '';
    const btns = failed.map(m => {
      const key = METRIC_TREE_MAP[m] || 'lowRIN';
      return `<button class="ts-trigger-btn" onclick="OmicsLab.Troubleshoot.open('${key}')">Diagnose: ${m}</button>`;
    }).join('');
    return `<div class="results-card ts-trigger-card">
      <div class="results-card-title">${OmicsLab.Icons.svg('alert-triangle',16)} Troubleshooting Assistant</div>
      <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1rem">Some QC metrics failed. Use the interactive decision tree to find the root cause.</p>
      <div class="ts-trigger-btns">${btns}</div>
    </div>`;
  }

  /* ─── Variant Walkthrough (genomics workflows) ─── */
  const GENOMICS_WFS = new Set(['wgs','wes','ampli-seq','viral-wgs']);
  const VARIANTS = [
    { gene:'BRCA1', chrom:'chr17', pos:43071077, ref:'G', alt:'A', af:'0.00003', cadd:28.4, clinvar:'Pathogenic (8 stars)', acmg:'PVS1_strong, PS1, PM2', verdict:'Pathogenic',
      exp:'Loss-of-function variant in BRCA1 (breast/ovarian cancer suppressor). gnomAD AF <0.0001 (PM2), known pathogenic in ClinVar (PS1), strong loss-of-function evidence (PVS1). ACMG: Pathogenic.' },
    { gene:'TP53',  chrom:'chr17', pos:7674220,  ref:'C', alt:'T', af:'0.00001', cadd:34.2, clinvar:'Pathogenic (12 stars)', acmg:'PVS1, PS1, PS3, PM2', verdict:'Pathogenic',
      exp:'Hotspot missense in TP53 R248W — the most frequently mutated position in human cancer. Functional studies show dominant-negative activity (PS3). ACMG: Pathogenic.' },
    { gene:'APOE',  chrom:'chr19', pos:44908684, ref:'T', alt:'C', af:'0.138',   cadd:10.1, clinvar:'Benign/risk factor', acmg:'BS1, BP4, BA1', verdict:'Benign',
      exp:'APOE ε4 risk allele — population frequency 13.8% (BA1: >5% = stand-alone benign). Associated with Alzheimer\'s risk but is a common variant, not a disease-causing mutation. ACMG: Benign.' },
    { gene:'LMNA',  chrom:'chr1',  pos:156134872,ref:'A', alt:'G', af:'0.000012',cadd:22.6, clinvar:'VUS (conflicting evidence)', acmg:'PM2, PP2, PP3', verdict:'VUS',
      exp:'Rare missense in LMNA (laminopathy gene). Insufficient evidence to classify — rare (PM2) and in-silico pathogenic (PP3), but no functional data (missing PS3). ACMG: Variant of Uncertain Significance.' },
    { gene:'CFTR',  chrom:'chr7',  pos:117548628,ref:'CTT', alt:'C', af:'0.021', cadd:32.5, clinvar:'Pathogenic — F508del (cystic fibrosis)', acmg:'PVS1, PS4, PM3, BA1_not met', verdict:'Pathogenic',
      exp:'F508del — the most common cystic fibrosis variant (66% of CF alleles globally). 3 bp deletion causing ΔF508 — loss of phenylalanine at position 508. ACMG: Pathogenic. Target of CFTR modulators (Trikafta).' }
  ];

  function _buildVariantWalkthrough(wfId) {
    if (!GENOMICS_WFS.has(wfId)) return '';
    const cards = VARIANTS.map((v,i) => `
      <div class="vw-card" id="vw-card-${i}">
        <div class="vw-card-head">
          <span class="vw-gene">${v.gene}</span>
          <span class="vw-pos">${v.chrom}:${v.pos}</span>
          <span class="vw-change">${v.ref}→${v.alt}</span>
        </div>
        <div class="vw-metrics">
          <span class="vw-metric">gnomAD AF: <strong>${v.af}</strong></span>
          <span class="vw-metric">CADD: <strong>${v.cadd}</strong></span>
          <span class="vw-metric">ClinVar: <strong>${v.clinvar}</strong></span>
          <span class="vw-metric">ACMG criteria: <strong>${v.acmg}</strong></span>
        </div>
        <div class="vw-classify">
          <span style="font-size:0.78rem;color:var(--text-muted)">Your classification:</span>
          <button class="vw-btn vw-path"  onclick="OmicsLab.App._classifyVariant(${i},'Pathogenic')">Pathogenic</button>
          <button class="vw-btn vw-vus"   onclick="OmicsLab.App._classifyVariant(${i},'VUS')">VUS</button>
          <button class="vw-btn vw-benign"onclick="OmicsLab.App._classifyVariant(${i},'Benign')">Benign</button>
        </div>
        <div class="vw-feedback" id="vw-fb-${i}"></div>
      </div>`).join('');

    return `<div class="results-card">
      <div class="results-card-title">${OmicsLab.Icons.svg('search',16)} Variant Interpretation Walkthrough</div>
      <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1.2rem">
        Classify each simulated VCF variant using ACMG criteria (gnomAD AF, ClinVar, CADD, functional evidence).
        These are real published variants — apply the criteria and check your reasoning.
      </p>
      <div class="vw-grid">${cards}</div>
    </div>`;
  }

  function _classifyVariant(idx, choice) {
    const v = VARIANTS[idx];
    if (!v) return;
    const fb = document.getElementById('vw-fb-' + idx);
    if (!fb) return;
    const correct = choice === v.verdict;
    fb.className = 'vw-feedback ' + (correct ? 'vw-fb-correct' : 'vw-fb-wrong');
    fb.innerHTML = `<strong style="display:inline-flex;align-items:center;gap:.25rem">${correct ? (OmicsLab.Icons?.svg('check',12)||'') + ' Correct!' : (OmicsLab.Icons?.svg('x',12)||'') + ' Expected: ' + v.verdict}</strong> — ${v.exp}`;
    /* Disable buttons on the card */
    const card = document.getElementById('vw-card-' + idx);
    if (card) card.querySelectorAll('.vw-btn').forEach(b => b.disabled = true);
  }

  /* ─── Print / PDF report ─── */
  function printReport() {
    const wf = OmicsLab.Workflows[OmicsLab.State.workflow];
    const score = OmicsLab.Engine.computeScore();
    const grade = OmicsLab.Engine.getGrade(score);
    const q = OmicsLab.State.quality;
    const E = OmicsLab.Engine;
    const elapsed = OmicsLab.State.elapsed;
    const timeStr = `${Math.floor(elapsed/60)}m ${elapsed%60}s`;

    const rows = [
      { m:'Sample Integrity', v:`${(q.sampleIntegrity/10).toFixed(1)}/10 (RIN)`, pass:q.sampleIntegrity>=80 },
      { m:'260/280 Purity',   v:q.purity>=88?'1.9–2.1':q.purity>=65?'~1.7':'<1.5', pass:q.purity>=80 },
      { m:'Material Yield',   v:`${q.yield}%`, pass:q.yield>=75 },
      { m:'Library Complexity',v:`${q.libraryComplexity}%`, pass:q.libraryComplexity>=75 },
      { m:'Q30 Score',        v:`${q.sequencingQ30}%`, pass:q.sequencingQ30>=75 },
      { m:'Alignment Rate',   v:`${q.alignmentRate}%`, pass:q.alignmentRate>=75 },
      { m:'Duplication Rate', v:`${q.duplication}%`,  pass:q.duplication<=15 },
      { m:'Contamination',    v:`${q.contamination}%`, pass:q.contamination<=10 },
    ];

    const mistakeRows = OmicsLab.State.mistakes.length
      ? OmicsLab.State.mistakes.map(m => `<tr><td>${m.step}</td><td>${m.choice}</td><td>${m.impact}</td></tr>`).join('')
      : '<tr><td colspan="3">No mistakes — perfect execution</td></tr>';

    const reportWin = window.open('', '_blank', 'width=800,height=900');
    reportWin.document.write(`<!DOCTYPE html><html><head>
      <title>OmicsLab Lab Report — ${wf ? wf.name : ''}</title>
      <style>
        body{font-family:Georgia,serif;max-width:750px;margin:2cm auto;color:#1a1a2e;line-height:1.6}
        h1{font-size:1.4rem;border-bottom:2px solid #3fb950;padding-bottom:0.5rem}
        h2{font-size:1.1rem;color:#1a3a5c;margin-top:1.5rem}
        .grade{display:inline-block;font-size:2.5rem;font-weight:bold;color:${grade.cls==='grade-A'?'#3fb950':grade.cls==='grade-B'?'#58a6ff':grade.cls==='grade-C'?'#d29922':'#e5534b'};margin-right:1rem}
        table{width:100%;border-collapse:collapse;margin:1rem 0}
        th{background:#1a3a5c;color:#fff;padding:0.4rem 0.6rem;text-align:left;font-size:0.85rem}
        td{padding:0.35rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.85rem}
        .pass{color:#2d6a4f}.fail{color:#c62828}.warn{color:#e65100}
        .footer{margin-top:2rem;font-size:0.75rem;color:#666;border-top:1px solid #ddd;padding-top:0.5rem}
        @media print{body{margin:1cm}}
      </style></head><body>
      <h1>OmicsLab Simulator — Laboratory Methods Report</h1>
      <p><strong>Workflow:</strong> ${wf ? wf.name : 'Unknown'} &nbsp; <strong>Domain:</strong> ${wf ? wf.domainLabel : ''} &nbsp; <strong>Difficulty:</strong> ${wf ? wf.difficulty : ''}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()} &nbsp; <strong>Time elapsed:</strong> ${timeStr}</p>
      <h2>Grade &amp; Verdict</h2>
      <span class="grade">${grade.letter}</span> <strong>${grade.verdict}</strong> &nbsp; Score: ${score}/100
      <h2>QC Metrics Report</h2>
      <table><thead><tr><th>Metric</th><th>Value</th><th>Status</th></tr></thead><tbody>
        ${rows.map(r=>`<tr><td>${r.m}</td><td>${r.v}</td><td class="${r.pass?'pass':'fail'}">${r.pass?'PASS':'FAIL'}</td></tr>`).join('')}
      </tbody></table>
      <h2>Pipeline Cascade</h2>
      <p>${wf ? wf.pipeline.join(' → ') : ''}</p>
      <h2>Mistakes &amp; Suboptimal Choices</h2>
      <table><thead><tr><th>Step</th><th>Choice Made</th><th>Impact</th></tr></thead><tbody>
        ${mistakeRows}
      </tbody></table>
      <h2>Materials &amp; Methods (Template)</h2>
      <p style="font-style:italic">
        ${wf ? wf.name : 'Workflow'} was performed following standard protocols.
        ${wf ? wf.desc : ''}
        Quality control was assessed at each step using laboratory-grade instrumentation.
        All QC thresholds followed published best practices (ENCODE/GATK/MIQE guidelines where applicable).
      </p>
      <div class="footer">Generated by OmicsLab Simulator — simon-mufara.github.io/Omics-Lab/ — For educational purposes only</div>
    </body></html>`);
    reportWin.document.close();
    setTimeout(() => reportWin.print(), 500);
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

    const learningHtml = OmicsLab.DiseaseLearning
      ? dids.map(did => OmicsLab.DiseaseLearning.renderJourneySummary(did)).join('')
      : '';

    return `<div class="results-card">
      <div class="results-card-title">${OmicsLab.Icons.svg('microscope',16)} Diseases Investigated with This Workflow</div>
      <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1rem">
        The ${OmicsLab.Workflows[wfId] ? OmicsLab.Workflows[wfId].name : 'workflow'} you just completed
        is used to study these real diseases in clinical and research settings.
      </p>
      <div class="res-disease-grid">${cards}</div>
      ${learningHtml ? `<div style="display:grid;gap:0.9rem;margin-top:1rem">${learningHtml}</div>` : ''}
    </div>`;
  }

  /* ─── Build landing page ─── */
  function buildLanding() {
    _buildWorkflowGrid();
    _buildDiseaseExplorer();
    _buildEquipmentGallery();
    _buildToolExplorer();
    _buildBioinformaticsPipeline();
    _buildRepositoryExplorer();
    const _safeInit = (mod) => { try { if (mod && mod.init) mod.init(); } catch(e) { console.error(e); } };
    _safeInit(OmicsLab.DiseaseLearning);
    _safeInit(OmicsLab.ResearchMode);
    _safeInit(OmicsLab.HPCTraining);
    _safeInit(OmicsLab.ReproHub);
    _safeInit(OmicsLab.Curriculum);
    _safeInit(OmicsLab.Badges);
    _safeInit(OmicsLab.AfricaHub);
    _safeInit(OmicsLab.Workshop);
    _safeInit(OmicsLab.I18n);
    _safeInit(OmicsLab.QAEngine);
    _safeInit(OmicsLab.AfricaMap);
    _safeInit(OmicsLab.Sandbox);
  }

  /* ─── Sabotage Mode (Error Injection) ─── */
  OmicsLab.SabotageMode = false;
  function toggleSabotage() {
    OmicsLab.SabotageMode = !OmicsLab.SabotageMode;
    const btn = document.getElementById('sabotage-toggle-btn');
    if (btn) {
      btn.innerHTML = OmicsLab.SabotageMode
        ? `${OmicsLab.Icons?.svg('alert-triangle',13) || ''} Sabotage ON — Find the hidden error!`
        : `${OmicsLab.Icons?.svg('microscope',13) || ''} Sabotage Mode`;
      btn.classList.toggle('sabotage-active', OmicsLab.SabotageMode);
    }
    const hint = document.getElementById('sabotage-hint');
    if (hint) hint.style.display = OmicsLab.SabotageMode ? 'block' : 'none';
  }
  /* Called by bench.js when a step is applied — inject a bad choice at a random step */
  function getSabotageStep(totalSteps) {
    if (!OmicsLab.SabotageMode) return -1;
    if (OmicsLab._sabotageStep === undefined) {
      OmicsLab._sabotageStep = Math.floor(Math.random() * totalSteps);
    }
    return OmicsLab._sabotageStep;
  }
  function clearSabotageStep() { OmicsLab._sabotageStep = undefined; }

  /* ── Domain SVG illustrations (inline, colour-inheriting) ── */
  const _DOMAIN_ILL = {
    genomics: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 8 Q60 26 70 44 Q80 62 50 74 Q20 86 30 104" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M70 8 Q40 26 30 44 Q20 62 50 74 Q80 86 70 104" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".55"/>
      <line x1="36" y1="21" x2="64" y2="21" stroke="currentColor" stroke-width="2" opacity=".4"/><circle cx="36" cy="21" r="3" fill="currentColor" opacity=".7"/><circle cx="64" cy="21" r="3" fill="currentColor" opacity=".7"/>
      <line x1="28" y1="41" x2="72" y2="41" stroke="currentColor" stroke-width="2" opacity=".4"/><circle cx="28" cy="41" r="3" fill="currentColor" opacity=".6"/><circle cx="72" cy="41" r="3" fill="currentColor" opacity=".6"/>
      <line x1="32" y1="61" x2="68" y2="61" stroke="currentColor" stroke-width="2" opacity=".4"/><circle cx="32" cy="61" r="3" fill="currentColor" opacity=".7"/><circle cx="68" cy="61" r="3" fill="currentColor" opacity=".7"/>
      <line x1="38" y1="81" x2="62" y2="81" stroke="currentColor" stroke-width="2" opacity=".4"/><circle cx="38" cy="81" r="3" fill="currentColor" opacity=".5"/><circle cx="62" cy="81" r="3" fill="currentColor" opacity=".5"/>
    </svg>`,
    transcriptomics: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 60 Q22 40 38 55 Q54 70 70 48 Q86 26 96 42" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".55"/>
      <rect x="8"  y="75" width="14" height="42" rx="4" fill="currentColor" opacity=".85"/>
      <rect x="28" y="58" width="14" height="59" rx="4" fill="currentColor" opacity=".75"/>
      <rect x="48" y="88" width="14" height="29" rx="4" fill="currentColor" opacity=".65"/>
      <rect x="68" y="44" width="14" height="73" rx="4" fill="currentColor" opacity=".9"/>
      <line x1="4" y1="72" x2="96" y2="72" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4,3" opacity=".3"/>
      <circle cx="15" cy="66" r="4" fill="currentColor" opacity=".5"/>
      <circle cx="35" cy="48" r="4" fill="currentColor" opacity=".5"/>
      <circle cx="55" cy="80" r="4" fill="currentColor" opacity=".5"/>
      <circle cx="75" cy="35" r="4" fill="currentColor" opacity=".5"/>
    </svg>`,
    epigenomics: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="110" x2="20" y2="15" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".3"/>
      <line x1="44" y1="110" x2="44" y2="15" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".3"/>
      <line x1="20" y1="28" x2="44" y2="28" stroke="currentColor" stroke-width="2.5" opacity=".5"/>
      <line x1="20" y1="50" x2="44" y2="50" stroke="currentColor" stroke-width="2.5" opacity=".5"/>
      <line x1="20" y1="72" x2="44" y2="72" stroke="currentColor" stroke-width="2.5" opacity=".5"/>
      <line x1="20" y1="94" x2="44" y2="94" stroke="currentColor" stroke-width="2.5" opacity=".5"/>
      <circle cx="72" cy="28" r="13" fill="currentColor" opacity=".88"/>
      <text x="72" y="33" text-anchor="middle" font-size="9" fill="#080c10" font-weight="800" font-family="monospace">CH₃</text>
      <circle cx="82" cy="72" r="13" fill="currentColor" opacity=".65"/>
      <text x="82" y="77" text-anchor="middle" font-size="9" fill="#080c10" font-weight="800" font-family="monospace">CH₃</text>
      <line x1="44" y1="28" x2="59" y2="28" stroke="currentColor" stroke-width="1.5" opacity=".4" stroke-dasharray="3,2"/>
      <line x1="44" y1="72" x2="69" y2="72" stroke="currentColor" stroke-width="1.5" opacity=".4" stroke-dasharray="3,2"/>
    </svg>`,
    metagenomics: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="42" cy="58" rx="24" ry="38" stroke="currentColor" stroke-width="3" fill="none" opacity=".9"/>
      <path d="M66 52 Q80 36 90 52 Q100 68 92 80" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>
      <path d="M66 64 Q78 70 82 80" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".4"/>
      <circle cx="22" cy="108" r="11" stroke="currentColor" stroke-width="2.5" fill="none" opacity=".7"/>
      <ellipse cx="85" cy="22" rx="11" ry="19" stroke="currentColor" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M30 48 Q40 40 50 48 Q60 56 50 65 Q40 74 30 65" stroke="currentColor" stroke-width="1.5" fill="none" opacity=".5"/>
      <circle cx="37" cy="58" r="3" fill="currentColor" opacity=".65"/>
      <circle cx="47" cy="67" r="3" fill="currentColor" opacity=".65"/>
      <circle cx="50" cy="50" r="3" fill="currentColor" opacity=".65"/>
    </svg>`,
    metabolomics: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,14 72,27 72,54 50,67 28,54 28,27" stroke="currentColor" stroke-width="2.5" fill="none" opacity=".9"/>
      <polygon points="50,22 64,31 64,47 50,56 36,47 36,31" stroke="currentColor" stroke-width="1" fill="currentColor" opacity=".1"/>
      <line x1="50" y1="67" x2="50" y2="93" stroke="currentColor" stroke-width="2" opacity=".6"/>
      <line x1="50" y1="93" x2="34" y2="107" stroke="currentColor" stroke-width="2" opacity=".55"/>
      <line x1="50" y1="93" x2="66" y2="107" stroke="currentColor" stroke-width="2" opacity=".55"/>
      <circle cx="34" cy="110" r="5.5" fill="currentColor" opacity=".75"/>
      <circle cx="66" cy="110" r="5.5" fill="currentColor" opacity=".75"/>
      <line x1="72" y1="40" x2="91" y2="32" stroke="currentColor" stroke-width="2" opacity=".55"/>
      <circle cx="95" cy="30" r="5.5" fill="currentColor" opacity=".7"/>
      <line x1="28" y1="40" x2="9" y2="32" stroke="currentColor" stroke-width="2" opacity=".45"/>
      <circle cx="5" cy="30" r="5.5" fill="currentColor" opacity=".55"/>
    </svg>`,
    proteomics: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 28 Q34 16 50 28 Q66 40 82 28 Q82 46 66 58 Q50 70 34 58 Q18 46 18 62 Q18 78 34 88 Q50 98 66 88 Q82 78 82 94" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M12 114 L44 102 L44 108 L62 96 L44 90 L44 96 Z" fill="currentColor" opacity=".45"/>
      <circle cx="18" cy="28" r="4.5" fill="currentColor" opacity=".65"/>
      <circle cx="50" cy="28" r="4.5" fill="currentColor" opacity=".65"/>
      <circle cx="82" cy="28" r="4.5" fill="currentColor" opacity=".65"/>
      <circle cx="34" cy="58" r="4.5" fill="currentColor" opacity=".6"/>
      <circle cx="66" cy="58" r="4.5" fill="currentColor" opacity=".6"/>
      <circle cx="50" cy="70" r="3.5" fill="currentColor" opacity=".5"/>
    </svg>`,
    virology: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="62" r="28" stroke="currentColor" stroke-width="2.5" fill="none" opacity=".85"/>
      <circle cx="50" cy="62" r="18" stroke="currentColor" stroke-width="1" fill="none" opacity=".25"/>
      <line x1="50" y1="34" x2="50" y2="18"/><circle cx="50" cy="14" r="5" fill="currentColor" opacity=".8"/>
      <line x1="75" y1="47" x2="88" y2="37"/><circle cx="92" cy="34" r="5" fill="currentColor" opacity=".75"/>
      <line x1="75" y1="77" x2="88" y2="87"/><circle cx="92" cy="90" r="5" fill="currentColor" opacity=".7"/>
      <line x1="50" y1="90" x2="50" y2="106"/><circle cx="50" cy="110" r="5" fill="currentColor" opacity=".75"/>
      <line x1="25" y1="77" x2="12" y2="87"/><circle cx="8" cy="90" r="5" fill="currentColor" opacity=".65"/>
      <line x1="25" y1="47" x2="12" y2="37"/><circle cx="8" cy="34" r="5" fill="currentColor" opacity=".7"/>
      <path d="M36 57 Q46 48 58 60 Q70 72 54 76 Q38 80 36 68 Q34 56 36 57" stroke="currentColor" stroke-width="1.5" fill="none" opacity=".45"/>
      <line x1="50" y1="34" x2="50" y2="18" stroke="currentColor" stroke-width="2" opacity=".7"/>
      <line x1="75" y1="47" x2="88" y2="37" stroke="currentColor" stroke-width="2" opacity=".7"/>
      <line x1="75" y1="77" x2="88" y2="87" stroke="currentColor" stroke-width="2" opacity=".7"/>
      <line x1="50" y1="90" x2="50" y2="106" stroke="currentColor" stroke-width="2" opacity=".7"/>
      <line x1="25" y1="77" x2="12" y2="87" stroke="currentColor" stroke-width="2" opacity=".7"/>
      <line x1="25" y1="47" x2="12" y2="37" stroke="currentColor" stroke-width="2" opacity=".7"/>
    </svg>`,
    multiomics: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="62" r="12" fill="currentColor" opacity=".9"/>
      <circle cx="50" cy="16" r="9" stroke="currentColor" stroke-width="2" fill="none" opacity=".8"/>
      <line x1="50" y1="50" x2="50" y2="25" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,2" opacity=".5"/>
      <circle cx="94" cy="44" r="9" stroke="currentColor" stroke-width="2" fill="none" opacity=".7"/>
      <line x1="61" y1="57" x2="85" y2="49" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,2" opacity=".5"/>
      <circle cx="80" cy="100" r="9" stroke="currentColor" stroke-width="2" fill="none" opacity=".65"/>
      <line x1="58" y1="71" x2="74" y2="93" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,2" opacity=".5"/>
      <circle cx="20" cy="100" r="9" stroke="currentColor" stroke-width="2" fill="none" opacity=".7"/>
      <line x1="42" y1="71" x2="26" y2="93" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,2" opacity=".5"/>
      <circle cx="6"  cy="44" r="9" stroke="currentColor" stroke-width="2" fill="none" opacity=".75"/>
      <line x1="39" y1="57" x2="15" y2="49" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,2" opacity=".5"/>
      <circle cx="50" cy="62" r="20" stroke="currentColor" stroke-width="0.5" fill="none" opacity=".18"/>
      <circle cx="50" cy="62" r="32" stroke="currentColor" stroke-width="0.5" fill="none" opacity=".08"/>
    </svg>`,
  };

  /* ── Full-screen chooser domain tiles (click → selectDomain, no inline wf list) ── */
  function _buildWorkflowGrid() {
    const grid = document.getElementById('domain-grid');
    if (!grid) return;

    grid.innerHTML = OmicsLab.DOMAINS.map((domain, i) => {
      const ill      = _DOMAIN_ILL[domain.id] || _DOMAIN_ILL.multiomics;
      const wfCount  = domain.workflows.length;

      return `
        <button class="domain-tile" role="button"
                style="--domain-color:${domain.colorHex};--domain-rgb:${domain.rgb};animation-delay:${i * 0.04}s"
                data-domain-id="${domain.id}"
                onclick="OmicsLab.App.selectDomain('${domain.id}')"
                aria-label="${domain.label}: ${wfCount} protocol${wfCount !== 1 ? 's' : ''}">
          <div class="dt-illustration" aria-hidden="true">${ill}</div>
          <div class="dt-content">
            <div class="dt-icon-box">${OmicsLab.Icons.svg(domain.icon, 22)}</div>
            <div class="dt-name">${domain.label}</div>
            <div class="dt-desc">${domain.desc}</div>
            <div class="dt-tile-footer">
              <span class="dt-wf-count">${wfCount} protocol${wfCount !== 1 ? 's' : ''}</span>
              <span class="dt-tile-arrow">→</span>
            </div>
          </div>
        </button>`;
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
        <button class="dm-close" onclick="OmicsLab.App._closeDiseaseModal()" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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
      ${OmicsLab.DiseaseLearning ? `<div class="dm-section dm-section-learning">
        <div class="dm-section-label">Disease Learning Layer</div>
        ${OmicsLab.DiseaseLearning.renderJourneySummary(did)}
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
    if (!el) return;
    el.classList.add('visible');
    el.scrollIntoView({ behavior: 'smooth' });
  }

  /* ─── Hamburger nav ─── */
  function toggleMobileNav() {
    const dd = document.getElementById('mobile-nav-dropdown');
    if (dd) dd.classList.toggle('open');
  }

  /* ─── Learn dropdown ─── */
  function toggleLearnMenu() {
    const btn = document.getElementById('nav-learn-btn');
    const menu = document.getElementById('nav-learn-dropdown');
    if (!btn || !menu) return;
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
  }
  function closeLearnMenu() {
    const btn  = document.getElementById('nav-learn-btn');
    const menu = document.getElementById('nav-learn-dropdown');
    if (btn)  btn.classList.remove('open');
    if (menu) menu.classList.remove('open');
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
        <button class="emd-close" onclick="OmicsLab.App._closeEquipmentModal()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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

  const BIOINFO_PIPELINE = {
    stages: [
      {
        step: '1',
        title: 'FastQC + MultiQC',
        tools: 'FastQC, MultiQC',
        meaning: 'Checks base quality, adapter content, GC bias, duplication and overrepresented sequences before you spend sequencing time downstream.',
        output: 'Per-base Q scores, adapter spikes, GC curves, and duplication summaries.',
        interpretation: 'If most bases are Q30 and adapter content is low, the raw reads are usable. Sharp adapter peaks or a falling quality tail mean you should trim or resequence.'
      },
      {
        step: '2',
        title: 'Read trimming',
        tools: 'fastp or Trimmomatic',
        meaning: 'Removes adapters, poly-G tails, and low-quality bases so alignment is not polluted by obvious artefacts.',
        output: 'Cleaner FASTQ files with shorter but higher-confidence reads.',
        interpretation: 'If trimming removes only a small fraction of reads, the library was good. If a lot of data disappears, sample prep or sequencing quality was poor.'
      },
      {
        step: '3',
        title: 'Alignment + sorting',
        tools: 'BWA-MEM2 + SAMtools',
        meaning: 'Maps each read to the reference genome and converts the data into coordinate-sorted BAM files.',
        output: 'Aligned BAM/CRAM files plus mapping metrics.',
        interpretation: 'A high mapping rate usually means the sample matches the reference well. Low mapping often points to contamination, degraded DNA, or the wrong reference build.'
      },
      {
        step: '4',
        title: 'Duplicate marking + BQSR',
        tools: 'Picard MarkDuplicates + GATK BQSR',
        meaning: 'Flags PCR duplicates and recalibrates base qualities so the variant caller can trust the signal it sees.',
        output: 'Deduplicated BAM and recalibrated quality scores.',
        interpretation: 'High duplication suggests too little input or over-amplification. BQSR improves confidence by correcting systematic sequencing error patterns.'
      },
      {
        step: '5',
        title: 'Variant calling + annotation',
        tools: 'GATK HaplotypeCaller + VEP/ANNOVAR',
        meaning: 'Calls SNPs and indels, then adds biological meaning such as gene consequence, frequency, and clinical annotation.',
        output: 'VCF files, annotated TSV tables, and ranked candidate variants.',
        interpretation: 'A strong variant is supported by depth, balance, mapping quality, and consistent annotation. Interpretation turns raw calls into biological or clinical insight.'
      }
    ],
    dryRunScript: `#!/usr/bin/env bash
set -euo pipefail

SAMPLE="sample01"
REF="resources/GRCh38.fa"

echo "[DRY RUN] 1) Quality control"
fastqc "reads/\${SAMPLE}_R1.fastq.gz" "reads/\${SAMPLE}_R2.fastq.gz" -o qc/
multiqc qc/ -o qc/multiqc/

echo "[DRY RUN] 2) Trim adapters and low-quality tails"
fastp \
  -i "reads/\${SAMPLE}_R1.fastq.gz" \
  -I "reads/\${SAMPLE}_R2.fastq.gz" \
  -o "trimmed/\${SAMPLE}_R1.trimmed.fastq.gz" \
  -O "trimmed/\${SAMPLE}_R2.trimmed.fastq.gz"

echo "[DRY RUN] 3) Align reads and sort BAM"
bwa-mem2 mem -t 16 "\$REF" \
  "trimmed/\${SAMPLE}_R1.trimmed.fastq.gz" \
  "trimmed/\${SAMPLE}_R2.trimmed.fastq.gz" \
  | samtools sort -o "bam/\${SAMPLE}.sorted.bam"
samtools index "bam/\${SAMPLE}.sorted.bam"

echo "[DRY RUN] 4) Mark duplicates and recalibrate base qualities"
picard MarkDuplicates \
  I="bam/\${SAMPLE}.sorted.bam" \
  O="bam/\${SAMPLE}.dedup.bam" \
  M="qc/\${SAMPLE}.dup_metrics.txt"
gatk BaseRecalibrator \
  -R "\$REF" \
  -I "bam/\${SAMPLE}.dedup.bam" \
  --known-sites resources/known_sites.vcf.gz \
  -O "bam/\${SAMPLE}.recal.table"
gatk ApplyBQSR \
  -R "\$REF" \
  -I "bam/\${SAMPLE}.dedup.bam" \
  --bqsr-recal-file "bam/\${SAMPLE}.recal.table" \
  -O "bam/\${SAMPLE}.bqsr.bam"

echo "[DRY RUN] 5) Call and annotate variants"
gatk HaplotypeCaller \
  -R "\$REF" \
  -I "bam/\${SAMPLE}.bqsr.bam" \
  -O "vcf/\${SAMPLE}.g.vcf.gz" \
  -ERC GVCF
vep -i "vcf/\${SAMPLE}.g.vcf.gz" -o "report/\${SAMPLE}.vep.tsv" --tab

echo "[DRY RUN] Finished. The script prints the analysis order without running a full production workflow."
`,
    snakefile: `rule all:
    input:
        expand("results/{sample}.annotated.vcf.gz", sample=SAMPLES)

rule fastqc:
    input:
        r1="reads/{sample}_R1.fastq.gz",
        r2="reads/{sample}_R2.fastq.gz"
    output:
        html="qc/{sample}_fastqc.html"
    shell:
        "fastqc {input.r1} {input.r2} -o qc/"

rule trim:
    input:
        r1="reads/{sample}_R1.fastq.gz",
        r2="reads/{sample}_R2.fastq.gz"
    output:
        r1="trimmed/{sample}_R1.trimmed.fastq.gz",
        r2="trimmed/{sample}_R2.trimmed.fastq.gz"
    shell:
        "fastp -i {input.r1} -I {input.r2} -o {output.r1} -O {output.r2}"

rule align:
    input:
        r1="trimmed/{sample}_R1.trimmed.fastq.gz",
        r2="trimmed/{sample}_R2.trimmed.fastq.gz"
    output:
        bam="bam/{sample}.sorted.bam"
    shell:
        "bwa-mem2 mem -t 16 resources/GRCh38.fa {input.r1} {input.r2} | samtools sort -o {output.bam}"

rule annotate:
    input:
        vcf="vcf/{sample}.vcf.gz"
    output:
        ann="results/{sample}.annotated.vcf.gz"
    shell:
        "vep -i {input.vcf} -o {output.ann} --vcf"
`
  };

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

    function _buildBioinformaticsPipeline() {
      const container = document.getElementById('bioinfo-pipeline-content');
      if (!container) return;

      const codeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const stageCards = BIOINFO_PIPELINE.stages.map(stage => `
        <article class="bp-stage-card">
          <div class="bp-stage-kicker">Step ${stage.step}</div>
          <div class="bp-stage-name">${stage.title}</div>
          <div class="bp-stage-tools">${stage.tools}</div>
          <div class="bp-stage-text">${stage.meaning}</div>
          <div class="bp-stage-output"><strong>Output:</strong> ${stage.output}</div>
          <div class="bp-stage-interpretation"><strong>Interpretation:</strong> ${stage.interpretation}</div>
        </article>
      `).join('');

      container.innerHTML = `
        <div class="bp-grid">
          <div class="bp-column bp-overview-card">
            <div class="bp-card-title">Pipeline stages</div>
            <div class="bp-stage-grid">${stageCards}</div>
          </div>

          <div class="bp-column bp-meaning-card">
            <div class="bp-card-title">How to read the outputs</div>
            <div class="bp-meaning-list">
              <div class="bp-meaning-item"><span class="bp-meaning-label">FastQC</span><span class="bp-meaning-text">Base qualities should stay high, adapter content should stay low, and GC distribution should look plausible for your sample type.</span></div>
              <div class="bp-meaning-item"><span class="bp-meaning-label">MultiQC</span><span class="bp-meaning-text">Use it to compare samples; one bad library often stands out immediately as a quality or duplication outlier.</span></div>
              <div class="bp-meaning-item"><span class="bp-meaning-label">Alignment rate</span><span class="bp-meaning-text">High mapping rate means the reads fit the reference and the wet-lab prep worked; low mapping means contamination, damage, or a wrong reference build.</span></div>
              <div class="bp-meaning-item"><span class="bp-meaning-label">Duplication rate</span><span class="bp-meaning-text">High duplication is a library problem, not a sequencing success story; it usually means too little input DNA or too many PCR cycles.</span></div>
              <div class="bp-meaning-item"><span class="bp-meaning-label">VCF / annotated report</span><span class="bp-meaning-text">The final answer is not just a variant list. It is a ranked, explained result with consequence, population frequency, and disease relevance.</span></div>
            </div>
          </div>
        </div>

        <div class="bp-scripts-grid">
          <article class="bp-script-card">
            <div class="bp-card-title">Dry-run shell script</div>
            <p class="bp-card-copy">This version shows the command order and expected file names without hiding what each tool is doing.</p>
            <pre class="bp-code"><code>${codeHtml(BIOINFO_PIPELINE.dryRunScript)}</code></pre>
            <div class="bp-actions">
              <a class="bp-link-btn" href="examples/bioinformatics/dry-run-wgs.sh" download>Download dry-run-wgs.sh</a>
            </div>
          </article>

          <article class="bp-script-card">
            <div class="bp-card-title">Snakemake example</div>
            <p class="bp-card-copy">This is the same idea expressed as a workflow engine, so dependencies are explicit and reproducible.</p>
            <pre class="bp-code"><code>${codeHtml(BIOINFO_PIPELINE.snakefile)}</code></pre>
            <div class="bp-actions">
              <a class="bp-link-btn" href="examples/bioinformatics/Snakefile" download>Download Snakefile</a>
            </div>
          </article>
        </div>

        <div class="bp-africa-card">
          <div class="bp-card-title">Africa deployment notes</div>
          <p class="bp-card-copy">
            The practical model for African genomics is hybrid: do wet-lab work in-country, keep the data under local governance,
            and move analysis to regional HPC or cloud only when policy and bandwidth allow.
            The map below highlights active centres, training hubs, and surveillance labs already doing this work.
          </p>
          <div class="bp-tag-row">
            <span class="bp-tag">H3Africa</span>
            <span class="bp-tag">H3ABioNet</span>
            <span class="bp-tag">Africa CDC</span>
            <span class="bp-tag">APCDR</span>
            <span class="bp-tag">MalariaGEN</span>
            <span class="bp-tag">KEMRI</span>
          </div>
        </div>
      `;
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
    openChooser, selectDomain, closeWfPicker, chooserBack,
    _filterDiseases, _filterEquipment,
    scrollTo, toggleMobileNav, toggleLearnMenu, closeLearnMenu,
    _openEquipmentModal, _closeEquipmentModal,
    _openDiseaseModal, _closeDiseaseModal,
    _filterRepos,
    _searchEquipment, shareResults,
    printReport, _classifyVariant,
    toggleSabotage, getSabotageStep, clearSabotageStep,
    _renderDiseaseCards: null, _renderEquipmentCards: null, _renderRepoCards: null,
  };
})();

/* ─── localStorage Schema Versioning ─── */
(function _migrateSchema() {
  const CURRENT_SCHEMA = 2;
  const key = 'omicslab_schema_v';
  try {
    const stored = parseInt(localStorage.getItem(key) || '0', 10);
    if (stored < 1) {
      /* v0 → v1: no destructive migration needed; just stamp the version */
    }
    if (stored < 2) {
      /* v1 → v2: remove any stale omicslab_sp_note keys with no matching module */
      /* Safe no-op: we only remove keys that are clearly orphaned */
    }
    if (stored !== CURRENT_SCHEMA) {
      localStorage.setItem(key, String(CURRENT_SCHEMA));
    }
  } catch(e) {
    /* localStorage may be blocked in private mode — fail silently */
  }
})();

/* ─── Boot on DOM ready ─── */
document.addEventListener('DOMContentLoaded', () => {
  OmicsLab.App.init();
  if (OmicsLab.Sound) OmicsLab.Sound.init();
  /* Set print date attribute for print.css footer */
  document.body.dataset.printDate = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  window.addEventListener('beforeprint', () => {
    document.body.dataset.printDate = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      OmicsLab.App._closeDiseaseModal();
      OmicsLab.App._closeEquipmentModal();
      OmicsLab.App.closeLearnMenu();
    }
  });
  document.addEventListener('click', e => {
    const wrap = document.getElementById('nav-learn-wrap');
    if (wrap && !wrap.contains(e.target)) OmicsLab.App.closeLearnMenu();
  });
  _startHeroPreviewCycle();
  _initScrollReveal();
});

function _initScrollReveal() {
  const revealAll = () => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    // Safe fallback — stagger rather than flash-reveal everything at once
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 30);
      });
    }, 4000);
  } else {
    revealAll();
  }
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
  if (window._heroInterval) clearInterval(window._heroInterval);
  window._heroInterval = setInterval(() => {
    // Only run when the hero preview widget is in the DOM and visible
    if (!document.getElementById('hero-preview-title')) return;
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
