/* ═══════════════════════════════════════════════════════
   OmicsLab — Kraken2/Bracken Metagenomics Simulator (Part 3)
   Simulates Kraken2 taxonomic classification results for common
   African field samples. Generates realistic abundance tables,
   SVG donut chart, and top-taxa table. Fully offline.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Kraken = (function () {

  /* Sample profiles — realistic African field sample taxa */
  const PROFILES = {
    stool_healthy: {
      label: 'Human stool — healthy adult (East Africa)',
      taxa: [
        { name:'Prevotella copri', rank:'S', pct:22.1, color:'#58a6ff' },
        { name:'Faecalibacterium prausnitzii', rank:'S', pct:14.8, color:'#00C4A0' },
        { name:'Ruminococcus bromii', rank:'S', pct:9.4, color:'#bc8cff' },
        { name:'Bacteroides fragilis', rank:'S', pct:8.2, color:'#e3b341' },
        { name:'Bifidobacterium longum', rank:'S', pct:6.1, color:'#f97316' },
        { name:'Lactobacillus sp.', rank:'S', pct:4.8, color:'#58a6ff' },
        { name:'Eubacterium rectale', rank:'S', pct:4.5, color:'#ff6b6b' },
        { name:'Blautia obeum', rank:'S', pct:3.9, color:'#00C4A0' },
        { name:'Roseburia intestinalis', rank:'S', pct:3.2, color:'#bc8cff' },
        { name:'Unclassified Firmicutes', rank:'P', pct:11.4, color:'#354060' },
        { name:'Unclassified Bacteroidetes', rank:'P', pct:7.3, color:'#243048' },
        { name:'Other', rank:'X', pct:4.3, color:'#182236' },
      ],
      reads: 4250000, classified: 96.2,
      note:'High Prevotella typical of plant-rich East African diet. Compare to Western stool where Bacteroides dominates.'
    },
    stool_malaria: {
      label: 'Human stool — malaria co-infection (West Africa)',
      taxa: [
        { name:'Prevotella copri', rank:'S', pct:18.4, color:'#58a6ff' },
        { name:'Plasmodium falciparum', rank:'S', pct:0.08, color:'#ff6b6b' },
        { name:'Faecalibacterium prausnitzii', rank:'S', pct:8.2, color:'#00C4A0' },
        { name:'Bacteroides fragilis', rank:'S', pct:9.1, color:'#e3b341' },
        { name:'Ruminococcus gnavus', rank:'S', pct:7.8, color:'#bc8cff' },
        { name:'Escherichia coli', rank:'S', pct:6.2, color:'#f97316' },
        { name:'Streptococcus salivarius', rank:'S', pct:4.1, color:'#ff6b6b' },
        { name:'Lactobacillus sp.', rank:'S', pct:3.3, color:'#58a6ff' },
        { name:'Unclassified Firmicutes', rank:'P', pct:19.2, color:'#354060' },
        { name:'Unclassified Bacteroidetes', rank:'P', pct:11.6, color:'#243048' },
        { name:'Other', rank:'X', pct:12.0, color:'#182236' },
      ],
      reads: 3890000, classified: 93.8,
      note:'P. falciparum reads low but detectable in stool. Altered microbiome diversity during acute malaria.'
    },
    np_swab_covid: {
      label: 'NP swab — SARS-CoV-2 positive (Southern Africa)',
      taxa: [
        { name:'SARS-CoV-2 (B.1.351 / Beta)', rank:'S', pct:42.1, color:'#ff6b6b' },
        { name:'Streptococcus pneumoniae', rank:'S', pct:18.4, color:'#f97316' },
        { name:'Haemophilus influenzae', rank:'S', pct:12.3, color:'#e3b341' },
        { name:'Moraxella catarrhalis', rank:'S', pct:8.9, color:'#bc8cff' },
        { name:'Staphylococcus aureus', rank:'S', pct:5.2, color:'#58a6ff' },
        { name:'Rhinovirus A', rank:'S', pct:2.1, color:'#00C4A0' },
        { name:'Human respiratory reads', rank:'X', pct:7.4, color:'#354060' },
        { name:'Other', rank:'X', pct:3.6, color:'#243048' },
      ],
      reads: 2150000, classified: 91.5,
      note:'High SARS-CoV-2 abundance (Ct ~18). Secondary bacterial co-infection pattern typical of severe COVID-19.'
    },
    soil_agricultural: {
      label: 'Agricultural soil — East Africa (rhizosphere)',
      taxa: [
        { name:'Bacillus subtilis complex', rank:'S', pct:9.8, color:'#00C4A0' },
        { name:'Pseudomonas fluorescens', rank:'S', pct:7.4, color:'#58a6ff' },
        { name:'Streptomyces sp.', rank:'G', pct:11.2, color:'#e3b341' },
        { name:'Actinomycetes (mixed)', rank:'C', pct:14.6, color:'#bc8cff' },
        { name:'Nitrobacter sp.', rank:'G', pct:4.3, color:'#00C4A0' },
        { name:'Rhizobium leguminosarum', rank:'S', pct:6.1, color:'#f97316' },
        { name:'Fusarium oxysporum (fungal)', rank:'S', pct:3.2, color:'#ff6b6b' },
        { name:'Glomus irregulare (AMF)', rank:'S', pct:2.8, color:'#bc8cff' },
        { name:'Unclassified Proteobacteria', rank:'P', pct:18.4, color:'#354060' },
        { name:'Unclassified Actinobacteria', rank:'P', pct:10.2, color:'#243048' },
        { name:'Archaea (methanogenic)', rank:'D', pct:5.1, color:'#e3b341' },
        { name:'Other', rank:'X', pct:6.9, color:'#182236' },
      ],
      reads: 8100000, classified: 88.4,
      note:'Rich microbial diversity typical of African agricultural soil. High Actinobacteria = antibiotic producers.'
    },
    blood_sepsis: {
      label: 'Blood — bacteraemia/sepsis (Sub-Saharan Africa)',
      taxa: [
        { name:'Streptococcus pneumoniae', rank:'S', pct:38.2, color:'#ff6b6b' },
        { name:'Non-typhoidal Salmonella (iNTS)', rank:'S', pct:22.1, color:'#f97316' },
        { name:'Klebsiella pneumoniae', rank:'S', pct:14.8, color:'#e3b341' },
        { name:'Staphylococcus aureus (MRSA)', rank:'S', pct:9.3, color:'#bc8cff' },
        { name:'Escherichia coli', rank:'S', pct:6.7, color:'#58a6ff' },
        { name:'Human reads (host)', rank:'X', pct:4.2, color:'#354060' },
        { name:'Other', rank:'X', pct:4.7, color:'#243048' },
      ],
      reads: 1850000, classified: 95.8,
      note:'iNTS (Salmonella Typhimurium ST313) is the second most common bloodstream pathogen in SSA children.'
    },
    water_contam: {
      label: 'Water source — contaminated borehole (Nigeria)',
      taxa: [
        { name:'Escherichia coli', rank:'S', pct:28.4, color:'#ff6b6b' },
        { name:'Vibrio cholerae (O1 El Tor)', rank:'S', pct:4.2, color:'#f97316' },
        { name:'Cryptosporidium parvum', rank:'S', pct:3.1, color:'#e3b341' },
        { name:'Aeromonas hydrophila', rank:'S', pct:12.6, color:'#bc8cff' },
        { name:'Enterococcus faecalis', rank:'S', pct:9.8, color:'#58a6ff' },
        { name:'Pseudomonas aeruginosa', rank:'S', pct:7.3, color:'#00C4A0' },
        { name:'Legionella pneumophila', rank:'S', pct:2.8, color:'#ff6b6b' },
        { name:'Environmental bacteria (non-pathogenic)', rank:'X', pct:21.8, color:'#354060' },
        { name:'Other', rank:'X', pct:10.0, color:'#243048' },
      ],
      reads: 920000, classified: 83.1,
      note:'V. cholerae detected — consistent with contaminated water. E. coli >1% indicates significant fecal contamination.'
    },
  };

  let _current = null;

  function _simulate(profileKey) {
    const profile = PROFILES[profileKey];
    if (!profile) return;
    _current = profile;
    _renderResult(profile);
  }

  function _renderResult(p) {
    const out = document.getElementById('krk-output');
    if (!out) return;
    const topTaxa = p.taxa.slice(0, 8);
    const donut = _buildDonut(topTaxa);
    const tableRows = p.taxa.map(t => `
      <tr>
        <td><span class="krk-color-dot" style="background:${t.color}"></span>${t.name}</td>
        <td class="krk-rank-badge">${t.rank}</td>
        <td class="krk-pct-cell">
          <div class="krk-bar-wrap"><div class="krk-bar" style="width:${Math.min(t.pct/30*100,100)}%;background:${t.color}"></div></div>
          ${t.pct.toFixed(2)}%
        </td>
        <td class="krk-reads">${Math.round(p.reads * t.pct / 100).toLocaleString()}</td>
      </tr>`).join('');

    out.innerHTML = `
      <div class="krk-summary">
        <div class="krk-stat"><span class="krk-stat-val">${p.reads.toLocaleString()}</span><span class="krk-stat-lbl">Total reads</span></div>
        <div class="krk-stat"><span class="krk-stat-val">${p.classified}%</span><span class="krk-stat-lbl">Classified</span></div>
        <div class="krk-stat"><span class="krk-stat-val">${p.taxa.length}</span><span class="krk-stat-lbl">Taxa detected</span></div>
        <button class="krk-export-btn" onclick="OmicsLab.Kraken._exportTsv()">Export TSV</button>
      </div>
      <div class="krk-note">${p.note}</div>
      <div class="krk-viz-row">
        ${donut}
        <div class="krk-legend">${topTaxa.map(t => `<div class="krk-legend-row"><span class="krk-legend-dot" style="background:${t.color}"></span><span class="krk-legend-name">${t.name}</span><span class="krk-legend-pct">${t.pct.toFixed(1)}%</span></div>`).join('')}</div>
      </div>
      <table class="krk-table">
        <thead><tr><th>Taxon</th><th>Rank</th><th>Abundance</th><th>Reads</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>`;
  }

  function _buildDonut(taxa) {
    const cx = 80, cy = 80, r = 64, r2 = 36;
    let angle = -Math.PI / 2;
    const paths = taxa.map(t => {
      const sweep = (t.pct / 100) * Math.PI * 2;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(angle + sweep), y2 = cy + r * Math.sin(angle + sweep);
      const xi1 = cx + r2 * Math.cos(angle + sweep), yi1 = cy + r2 * Math.sin(angle + sweep);
      const xi2 = cx + r2 * Math.cos(angle), yi2 = cy + r2 * Math.sin(angle);
      const large = sweep > Math.PI ? 1 : 0;
      const path = `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${xi1.toFixed(1)},${yi1.toFixed(1)} A${r2},${r2} 0 ${large},0 ${xi2.toFixed(1)},${yi2.toFixed(1)} Z`;
      angle += sweep;
      return `<path d="${path}" fill="${t.color}" opacity="0.9"/>`;
    }).join('');
    return `<svg class="krk-donut" viewBox="0 0 160 160" width="160" height="160">${paths}<circle cx="80" cy="80" r="32" fill="#0D1524"/><text x="80" y="83" text-anchor="middle" font-size="9" fill="#A8A098">${taxa.length} taxa</text></svg>`;
  }

  function _exportTsv() {
    if (!_current) return;
    const rows = [['Taxon','Rank','Abundance_pct','Estimated_reads']];
    _current.taxa.forEach(t => rows.push([t.name, t.rank, t.pct.toFixed(2), Math.round(_current.reads * t.pct / 100)]));
    const tsv = rows.map(r => r.join('\t')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/tab-separated-values,' + encodeURIComponent(tsv);
    a.download = 'kraken2_report.tsv';
    a.click();
  }

  function init() {
    const section = document.getElementById('kraken-section');
    if (!section || section.dataset.krkReady) return;
    section.dataset.krkReady = '1';
    const opts = Object.entries(PROFILES).map(([k, p]) => `<option value="${k}">${p.label}</option>`).join('');
    section.innerHTML = `
      <div class="krk-wrap">
        <div class="krk-header">
          <div class="krk-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Kraken2 / Bracken Metagenomics Simulator
          </div>
          <div class="krk-header-sub">Simulate Kraken2 taxonomic classification for African field samples — stool, NP swab, blood, soil, water</div>
        </div>
        <div class="krk-controls">
          <select class="krk-sample-select" id="krk-sample-sel">
            <option value="">Select a sample type...</option>${opts}
          </select>
          <button class="krk-run-btn" onclick="OmicsLab.Kraken._simulate(document.getElementById('krk-sample-sel').value)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Simulate
          </button>
        </div>
        <div id="krk-output" class="krk-output">
          <div class="krk-empty">Select a sample type to simulate Kraken2 classification</div>
        </div>
      </div>`;
  }

  return { init, _simulate, _exportTsv };
})();
