/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Protocol Comparison Module
   Side-by-side comparison of any two workflows
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Compare = (function() {

  const META = {
    'wgs':         { cost:'$300–600',   costAfrica:'$400–800',   time:'3–5 days',   throughput:'30× genome',        sampleMin:'500 ng gDNA',          instruments:['Covaris S220','NovaSeq X Plus'],            choose:'Constitutional variant discovery, population genomics, structural variants' },
    'wes':         { cost:'$150–300',   costAfrica:'$200–400',   time:'2–4 days',   throughput:'100× exome',        sampleMin:'100 ng gDNA',          instruments:['NovaSeq 6000','NextSeq 2000','Capture station'], choose:'Rare disease gene discovery, clinical diagnosis, constrained budget' },
    'rna-seq':     { cost:'$100–200',   costAfrica:'$150–280',   time:'2–3 days',   throughput:'50 M reads/sample', sampleMin:'200 ng RNA (RIN ≥ 7)', instruments:['Bioanalyzer','NextSeq 2000'],               choose:'Differential expression, splice variants, transcriptome assembly' },
    'scrna-seq':   { cost:'$600–1500',  costAfrica:'$900–2000',  time:'2–3 days',   throughput:'5 000–10 000 cells',sampleMin:'~500 viable cells/µL', instruments:['10x Chromium','NovaSeq 6000'],              choose:'Cell-type heterogeneity, trajectory analysis, rare cell populations' },
    'atac-seq':    { cost:'$200–400',   costAfrica:'$300–550',   time:'2–3 days',   throughput:'25 M reads',        sampleMin:'50 K–500 K cells',     instruments:['Covaris','NextSeq'],                        choose:'Open-chromatin mapping, TF binding, epigenetic regulation' },
    'chip-seq':    { cost:'$200–450',   costAfrica:'$300–600',   time:'3–4 days',   throughput:'30 M reads',        sampleMin:'10 M cells + Ab',      instruments:['Bioruptor','NextSeq'],                     choose:'Histone mark mapping, TF occupancy, regulatory element discovery' },
    'shotgun-meta':{ cost:'$150–350',   costAfrica:'$200–500',   time:'3–5 days',   throughput:'10 Gb/sample',      sampleMin:'250 mg stool/swab',    instruments:['PowerLyzer Pro','NovaSeq'],                 choose:'Functional microbiome profiling, AMR gene discovery, novel species' },
    '16s-amplicon':{ cost:'$30–80',     costAfrica:'$40–100',    time:'1–2 days',   throughput:'50 K reads/sample', sampleMin:'Any biomass',          instruments:['PCR cycler','MiSeq','MinION'],              choose:'Community profiling on a budget, large cohorts, field studies' },
    'lc-ms':       { cost:'$200–500',   costAfrica:'$300–700',   time:'2–4 days',   throughput:'200+ metabolites',  sampleMin:'200 µL serum/plasma',  instruments:['Agilent 1290 UPLC','Thermo Q Exactive'],   choose:'Metabolic phenotyping, biomarker discovery, drug metabolism' },
    'proteomics':  { cost:'$250–600',   costAfrica:'$350–800',   time:'3–5 days',   throughput:'3 000–5 000 proteins',sampleMin:'50–100 µg protein',  instruments:['SpeedVac','Orbitrap Exploris 480'],         choose:'Protein expression, PTM discovery, drug-target validation' },
    'viral-wgs':   { cost:'$80–200',    costAfrica:'$100–280',   time:'1–3 days',   throughput:'500× viral genome', sampleMin:'Ct < 30 (PCR)',        instruments:['ARTIC PCR cycler','MinION','MiSeq'],        choose:'Outbreak genomics, variant surveillance, field phylogenetics' },
    'cite-seq':    { cost:'$800–2000',  costAfrica:'$1200–2800', time:'3–4 days',   throughput:'5 000+ cells + proteome',sampleMin:'1 M viable cells',instruments:['10x Chromium v3.1','NovaSeq'],            choose:'Simultaneous RNA + protein single-cell resolution, immune profiling' },
    'rt-qpcr':     { cost:'$15–50',     costAfrica:'$20–70',     time:'4–8 hours',  throughput:'48–96 targets',     sampleMin:'10 ng RNA or cDNA',    instruments:['QuantStudio 7','CFX Opus 96'],              choose:'Rapid targeted quantification, clinical diagnostics, resource-limited labs' },
    'ampli-seq':   { cost:'$50–150',    costAfrica:'$70–200',    time:'1–2 days',   throughput:'Targeted panels',   sampleMin:'10 ng FFPE DNA',       instruments:['Ion Torrent PGM','MiSeq'],                  choose:'Oncology gene panels, hotspot mutation screening, liquid biopsy' }
  };

  let _wf1 = null, _wf2 = null;

  function open() {
    const ov = document.getElementById('compare-modal-overlay');
    if (!ov) return;
    ov.classList.add('active');
    _populateSelects();
    _renderComparison();
  }

  function close() {
    const ov = document.getElementById('compare-modal-overlay');
    if (ov) ov.classList.remove('active');
  }

  function _populateSelects() {
    const wfs = Object.values(OmicsLab.Workflows || {});
    const opts = wfs.map(w => `<option value="${w.id}">${w.name} (${w.domainLabel})</option>`).join('');
    ['compare-sel-1','compare-sel-2'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const prev = el.value;
      el.innerHTML = `<option value="">— Select workflow —</option>${opts}`;
      if (prev) { el.value = prev; } else if (i === 0) { el.value = wfs[0]?.id || ''; _wf1 = el.value; }
      else        { el.value = wfs[1]?.id || ''; _wf2 = el.value; }
    });
  }

  function selectWf(slot, val) {
    if (slot === 1) _wf1 = val;
    else            _wf2 = val;
    _renderComparison();
  }

  function _renderComparison() {
    const box = document.getElementById('compare-table-box');
    if (!box) return;
    if (!_wf1 || !_wf2) {
      box.innerHTML = '<p class="cmp-empty">Select two workflows above to see the comparison.</p>';
      return;
    }
    const w1 = OmicsLab.Workflows[_wf1];
    const w2 = OmicsLab.Workflows[_wf2];
    const m1 = META[_wf1] || {};
    const m2 = META[_wf2] || {};
    if (!w1 || !w2) { box.innerHTML = ''; return; }

    const rows = [
      ['Domain',                    w1.domainLabel,                                  w2.domainLabel],
      ['Difficulty',                w1.difficulty,                                   w2.difficulty],
      ['Pipeline',                  w1.pipeline.join(' → '),                         w2.pipeline.join(' → ')],
      ['Cost (Global)',             m1.cost       || '—',                            m2.cost       || '—'],
      ['Cost (Africa-adjusted)',    m1.costAfrica  || '—',                           m2.costAfrica  || '—'],
      ['Turnaround',                m1.time        || '—',                           m2.time        || '—'],
      ['Throughput',                m1.throughput  || '—',                           m2.throughput  || '—'],
      ['Minimum Input',             m1.sampleMin   || '—',                           m2.sampleMin   || '—'],
      ['Key Instruments',           (m1.instruments||[]).join(', ')  || '—',         (m2.instruments||[]).join(', ')  || '—'],
      ['When to Choose',            m1.choose      || '—',                           m2.choose      || '—'],
      ['Description',              w1.desc,                                         w2.desc],
    ];

    box.innerHTML = `
      <div class="cmp-headers">
        <div class="cmp-head-cell" style="color:${w1.colorHex}">${w1.name}</div>
        <div class="cmp-head-cell" style="color:${w2.colorHex}">${w2.name}</div>
      </div>
      <table class="cmp-table">
        <tbody>
          ${rows.map(([label, v1, v2]) => `
            <tr>
              <td class="cmp-label">${label}</td>
              <td>${v1}</td>
              <td>${v2}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="cmp-start-btns">
        <button class="btn-result-primary" style="background:${w1.colorHex}"
                onclick="OmicsLab.Compare.close();OmicsLab.App.startWorkflow('${w1.id}')">
          Start ${w1.name} →
        </button>
        <button class="btn-result-primary" style="background:${w2.colorHex}"
                onclick="OmicsLab.Compare.close();OmicsLab.App.startWorkflow('${w2.id}')">
          Start ${w2.name} →
        </button>
      </div>
    `;
  }

  return { open, close, selectWf };
})();
