/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Learning Path Visualiser (Prompt 17)
   ─ SVG horizontal roadmap on Profile page
   ─ 4 tracks × nodes: complete / in-progress / locked
   ─ Certificate download when track complete
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.LearningPath = (function () {

  const PROGRESS_KEY = 'omicslab_learning_progress';

  /* ─── Track definitions ─── */
  const TRACKS = [
    {
      id: 'wgs',
      label: 'WGS Foundations',
      color: '#3fb950',
      description: 'Whole-genome sequencing from sample to variant calls',
      cert: 'WGS Fundamentals Certificate',
      nodes: [
        { id: 'dna-extraction',   label: 'DNA Extraction',     page: 'lab',              time: '30 min', desc: 'Buffer chemistry, yield and purity metrics' },
        { id: 'library-prep',     label: 'Library Prep',       page: 'lab',              time: '45 min', desc: 'End-repair, A-tailing, adapter ligation' },
        { id: 'qc-metrics',       label: 'QC Metrics',         page: 'qualitypredictor', time: '20 min', desc: 'GATK thresholds, H3Africa standards' },
        { id: 'alignment',        label: 'BWA Alignment',      page: 'analysis',         time: '30 min', desc: 'BWA-MEM2, samtools flagstat' },
        { id: 'variant-calling',  label: 'Variant Calling',    page: 'variantinterp',    time: '40 min', desc: 'GATK HaplotypeCaller, ACMG criteria' },
        { id: 'wgs-report',       label: 'Final Report',       page: 'output-tracker',   time: '15 min', desc: 'Archive your WGS analysis output' },
      ],
    },
    {
      id: 'rnaseq',
      label: 'RNA-seq Analysis',
      color: '#58a6ff',
      description: 'Differential gene expression from FASTQ to biological insight',
      cert: 'RNA-seq Analysis Certificate',
      nodes: [
        { id: 'rnaseq-qc',        label: 'FASTQ QC',           page: 'analysis',         time: '25 min', desc: 'FastQC interpretation, adapter trimming' },
        { id: 'star-align',       label: 'STAR Alignment',     page: 'analysis',         time: '30 min', desc: '2-pass alignment, splice junctions' },
        { id: 'deseq2',           label: 'DESeq2 DE',          page: 'heatmap',          time: '35 min', desc: 'Normalisation, DE testing, shrinkage' },
        { id: 'volcano',          label: 'Volcano Plot',       page: 'heatmap',          time: '20 min', desc: 'Fold-change vs p-value visualisation' },
        { id: 'pathway-enrich',   label: 'Pathway Enrichment', page: 'pathways',         time: '30 min', desc: 'KEGG, Reactome — Africa disease focus' },
      ],
    },
    {
      id: 'phylo',
      label: 'Phylogenomics',
      color: '#bc8cff',
      description: 'Reconstruct evolutionary histories and trace outbreak clades',
      cert: 'Phylogenomics Certificate',
      nodes: [
        { id: 'msa',              label: 'Multiple Alignment', page: 'analysis',         time: '25 min', desc: 'MUSCLE · MAFFT · gapped alignment' },
        { id: 'tree-build',       label: 'Tree Building',      page: 'phylo',            time: '40 min', desc: 'NJ, UPGMA algorithms, bootstrapping' },
        { id: 'tree-interpret',   label: 'Tree Interpretation',page: 'phylo',            time: '30 min', desc: 'Clades, monophyly, bootstrap support' },
        { id: 'outbreak-phylo',   label: 'Outbreak Phylo',     page: 'outbreak',         time: '35 min', desc: 'Mpox Clade I — trace the index case' },
        { id: 'knowledge-net',    label: 'Knowledge Network',  page: 'knowledge-graph',  time: '20 min', desc: 'Africa genomics disease-gene graph' },
      ],
    },
    {
      id: 'africa',
      label: 'Africa Genomics',
      color: '#f97316',
      description: 'Population genetics, governance, and field sequencing for Africa',
      cert: 'Africa Genomics Specialist Certificate',
      nodes: [
        { id: 'africa-map',       label: 'Africa Genome Map',  page: 'africa',           time: '20 min', desc: 'AWI-Gen, H3Africa project landscape' },
        { id: 'pop-struct',       label: 'Pop Structure',      page: 'popstruct',        time: '35 min', desc: 'ADMIXTURE, PCA for African cohorts' },
        { id: 'sra-data',         label: 'African Datasets',   page: 'sra',              time: '25 min', desc: 'NCBI SRA, EBI ENA — Africa cohorts' },
        { id: 'nanopore-field',   label: 'Nanopore Field QC',  page: 'nanopore',         time: '25 min', desc: 'ONT MinION field sequencing standards' },
        { id: 'amr-africa',       label: 'AMR in Africa',      page: 'amr',              time: '30 min', desc: 'MDR-TB, CRE resistance profiling' },
        { id: 'africa-pathogen',  label: 'Pathogen Tracking',  page: 'pathogen-tracker', time: '20 min', desc: 'Mpox, cholera, malaria surveillance' },
      ],
    },
  ];

  /* ─── Get / set progress ─── */
  function _getProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch { return {}; }
  }

  function _markComplete(nodeId) {
    const p = _getProgress();
    p[nodeId] = { done: true, at: Date.now() };
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {}
  }

  function _nodeState(nodeId, trackNodes, progress) {
    if (progress[nodeId]?.done) return 'complete';
    /* A node is available if it's the first OR the previous node is complete */
    const idx = trackNodes.findIndex(n => n.id === nodeId);
    if (idx === 0) return 'available';
    const prevId = trackNodes[idx - 1].id;
    if (progress[prevId]?.done) return 'available';
    return 'locked';
  }

  /* ─── Render into container ─── */
  function render(container) {
    _injectStyles();
    const progress = _getProgress();

    container.innerHTML = `
      <div class="lp-wrap">
        <div class="lp-header">
          <div class="lp-title">Your Learning Path</div>
          <div class="lp-sub">Complete modules in order to unlock certificates</div>
        </div>
        ${TRACKS.map(track => _renderTrack(track, progress)).join('')}
      </div>`;

    /* Wire node clicks */
    container.querySelectorAll('[data-lp-node]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nodeId = btn.dataset.lpNode;
        const page   = btn.dataset.lpPage;
        const state  = btn.dataset.lpState;
        if (state === 'locked') {
          OmicsLab.Notify?.warning('Complete the previous module first');
          return;
        }
        if (state === 'available') _markComplete(nodeId); /* simulate progress */
        OmicsLab.Router?.navigate(page);
      });
    });

    /* Wire cert buttons */
    container.querySelectorAll('[data-lp-cert]').forEach(btn => {
      btn.addEventListener('click', () => _downloadCert(btn.dataset.lpCert, btn.dataset.lpTrack));
    });
  }

  function _renderTrack(track, progress) {
    const nodes = track.nodes;
    const completedCount = nodes.filter(n => progress[n.id]?.done).length;
    const isTrackDone = completedCount === nodes.length;
    const percent = Math.round((completedCount / nodes.length) * 100);

    return `
      <div class="lp-track" style="--track-color:${track.color}">
        <div class="lp-track-header">
          <div class="lp-track-info">
            <span class="lp-track-name">${_esc(track.label)}</span>
            <span class="lp-track-desc">${_esc(track.description)}</span>
          </div>
          <div class="lp-track-meta">
            <span class="lp-track-progress">${completedCount}/${nodes.length}</span>
            ${isTrackDone ? `<button class="btn btn-primary btn-sm lp-cert-btn" data-lp-cert="${_esc(track.cert)}" data-lp-track="${track.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Certificate
            </button>` : ''}
          </div>
        </div>
        <div class="lp-progress-bar"><div class="lp-progress-fill" style="width:${percent}%"></div></div>
        <div class="lp-nodes-row">
          ${_renderSVGTrack(nodes, progress)}
        </div>
        <div class="lp-nodes-labels">
          ${nodes.map((node, i) => {
            const state = _nodeState(node.id, nodes, progress);
            return `
              <button class="lp-node-label lp-node-label-${state}" type="button"
                data-lp-node="${node.id}" data-lp-page="${node.page}" data-lp-state="${state}"
                title="${_esc(node.desc)} · ${_esc(node.time)}">
                <span class="lp-node-label-text">${_esc(node.label)}</span>
                <span class="lp-node-label-time">${_esc(node.time)}</span>
              </button>`;
          }).join('')}
        </div>
      </div>`;
  }

  function _renderSVGTrack(nodes, progress) {
    const W  = 72;   /* node pitch */
    const CX = 32;   /* node centre x within slot */
    const R  = 16;   /* node radius */
    const Y  = 28;
    const total = nodes.length;
    const svgW = total * W;

    let circles = '';
    let lines   = '';

    nodes.forEach((node, i) => {
      const state = _nodeState(node.id, nodes, progress);
      const cx = i * W + CX;

      /* Connector line to next node */
      if (i < total - 1) {
        const nextCx = (i + 1) * W + CX;
        const nextState = _nodeState(nodes[i+1].id, nodes, progress);
        const lineColor = (state === 'complete') ? 'var(--track-color,#3fb950)' : '#30363d';
        lines += `<line x1="${cx + R}" y1="${Y}" x2="${nextCx - R}" y2="${Y}" stroke="${lineColor}" stroke-width="2" stroke-dasharray="${nextState==='locked'?'4,3':'none'}"/>`;
      }

      /* Node circle */
      if (state === 'complete') {
        circles += `
          <circle cx="${cx}" cy="${Y}" r="${R}" fill="var(--track-color,#3fb950)" stroke="var(--track-color,#3fb950)" stroke-width="2"/>
          <path d="M${cx-7} ${Y} l5 5 9-9" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      } else if (state === 'available') {
        circles += `
          <circle cx="${cx}" cy="${Y}" r="${R}" fill="var(--bg-surface,#161b22)" stroke="var(--track-color,#3fb950)" stroke-width="2.5"/>
          <circle cx="${cx}" cy="${Y}" r="6" fill="var(--track-color,#3fb950)"/>`;
      } else {
        circles += `
          <circle cx="${cx}" cy="${Y}" r="${R}" fill="var(--bg-surface,#161b22)" stroke="#30363d" stroke-width="2"/>
          <path d="M${cx-5} ${Y-2} a5 5 0 0 1 10 0 v3 H${cx-5}z M${cx-7} ${Y+1} h14 v6 a2 2 0 0 1-2 2 H${cx-5} a2 2 0 0 1-2-2z" fill="#484f58"/>`;
      }
    });

    return `
      <div class="lp-svg-track-wrap" style="overflow-x:auto;-webkit-overflow-scrolling:touch">
        <svg width="${svgW}" height="${Y * 2}" viewBox="0 0 ${svgW} ${Y * 2}" fill="none" xmlns="http://www.w3.org/2000/svg">
          ${lines}${circles}
        </svg>
      </div>`;
  }

  /* ─── Certificate download ─── */
  function _downloadCert(certName, trackId) {
    const track = TRACKS.find(t => t.id === trackId);
    if (!track) return;
    const name = localStorage.getItem('omicslab_profile_name') || 'OmicsLab Learner';
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>OmicsLab Certificate — ${certName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=Inter:wght@400;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;background:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
  .cert{width:800px;border:3px solid ${track.color};border-radius:16px;padding:4rem;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.12)}
  .cert-logo{font-family:'Sora',sans-serif;font-size:1.4rem;font-weight:800;color:#1f2328;margin-bottom:2rem}
  .cert-logo span{color:${track.color}}
  .cert-eyebrow{font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:#656d76;margin-bottom:.5rem}
  .cert-title{font-family:'Sora',sans-serif;font-size:2.2rem;font-weight:800;color:#1f2328;line-height:1.2;margin-bottom:1.5rem}
  .cert-name{font-size:1.6rem;font-weight:700;color:${track.color};margin-bottom:.5rem;border-bottom:2px solid ${track.color};display:inline-block;padding-bottom:.25rem}
  .cert-for{font-size:.9rem;color:#57606a;margin:.75rem 0}
  .cert-track{font-size:1.2rem;font-weight:700;color:#1f2328;margin-bottom:1.5rem}
  .cert-date{font-size:.85rem;color:#656d76;margin-top:2rem}
  .cert-footer{font-size:.75rem;color:#8c959f;margin-top:1.5rem;border-top:1px solid #e1e4e8;padding-top:1rem}
  @media print{body{padding:0}.cert{border:3px solid ${track.color};box-shadow:none;width:100%}}
</style>
</head>
<body>
<div class="cert">
  <div class="cert-logo">Omics<span>Lab</span></div>
  <div class="cert-eyebrow">Certificate of Completion</div>
  <div class="cert-title">${_esc(certName)}</div>
  <div class="cert-for">This certifies that</div>
  <div class="cert-name">${_esc(name)}</div>
  <div class="cert-for">has successfully completed the</div>
  <div class="cert-track">${_esc(track.label)} Track</div>
  <div style="font-size:.85rem;color:#57606a;max-width:480px;margin:0 auto">${_esc(track.description)}</div>
  <div class="cert-date">Awarded on ${date}</div>
  <div class="cert-footer">OmicsLab · Africa's Omics Training Platform · omicslab.africa</div>
</div>
<script>window.print();</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `omicslab-${trackId}-certificate.html`;
    a.click();
    URL.revokeObjectURL(url);
    OmicsLab.Notify?.success('Certificate downloaded — open in browser and print to PDF');
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  function _injectStyles() {
    if (document.getElementById('lp-styles')) return;
    const s = document.createElement('style');
    s.id = 'lp-styles';
    s.textContent = `
      .lp-wrap{padding:1.25rem 1.5rem}
      .lp-header{margin-bottom:1.5rem}
      .lp-title{font-size:1.05rem;font-weight:700;color:var(--text-primary,#e6edf3);margin-bottom:.25rem}
      .lp-sub{font-size:.78rem;color:var(--text-muted,#8b949e)}
      .lp-track{background:var(--bg-surface,#161b22);border:1px solid var(--border-default,#21262d);border-radius:10px;padding:1rem 1.1rem;margin-bottom:1rem;--track-color:#3fb950}
      .lp-track-header{display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;margin-bottom:.6rem;flex-wrap:wrap}
      .lp-track-info{flex:1}
      .lp-track-name{font-size:.88rem;font-weight:700;color:var(--track-color,#3fb950);display:block;margin-bottom:.15rem}
      .lp-track-desc{font-size:.72rem;color:var(--text-muted,#8b949e)}
      .lp-track-meta{display:flex;align-items:center;gap:.5rem;flex-shrink:0}
      .lp-track-progress{font-size:.72rem;font-weight:600;color:var(--text-faint,#484f58)}
      .lp-cert-btn{font-size:.7rem !important;padding:.25rem .5rem !important}
      .lp-progress-bar{height:3px;background:var(--bg-overlay,#21262d);border-radius:2px;margin-bottom:.85rem;overflow:hidden}
      .lp-progress-fill{height:100%;background:var(--track-color,#3fb950);border-radius:2px;transition:width .4s var(--ease-out,ease)}
      .lp-svg-track-wrap{margin-bottom:.65rem}
      .lp-nodes-labels{display:flex;gap:0}
      .lp-node-label{
        flex:1;min-width:0;
        display:flex;flex-direction:column;align-items:center;gap:.15rem;
        background:none;border:1px solid transparent;border-radius:6px;
        padding:.3rem .2rem;cursor:pointer;
        transition:background .1s,border-color .1s;
        text-align:center;
      }
      .lp-node-label:hover:not(.lp-node-label-locked){background:var(--bg-overlay,#21262d);border-color:var(--border-muted,#30363d)}
      .lp-node-label-locked{cursor:not-allowed;opacity:.5}
      .lp-node-label-text{font-size:.65rem;font-weight:600;color:var(--text-secondary,#c9d1d9);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
      .lp-node-label-complete .lp-node-label-text{color:var(--track-color,#3fb950)}
      .lp-node-label-time{font-size:.58rem;color:var(--text-faint,#484f58)}
    `;
    document.head.appendChild(s);
  }

  /* ─── Init — called from router on profile page ─── */
  function init(container) {
    if (!container) {
      /* Try to find or create the container in profile page */
      let wrap = document.getElementById('lp-section');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'lp-section';
        const profileContent = document.getElementById('profile-page-content');
        if (profileContent) profileContent.appendChild(wrap);
        else return;
      }
      render(wrap);
    } else {
      render(container);
    }
  }

  return { init, render, _markComplete, _getProgress };
})();
