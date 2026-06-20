/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Genome Assembly Quality Evaluator
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Assembly = (function () {

  const ASSEMBLIES = [
    {
      id: 'illumina-tb', name: 'Short-read Assembly', tag: 'Illumina',
      organism: 'M. tuberculosis H37Ra', tool: 'SPAdes v3.15.5',
      institution: 'AHRI, Durban, South Africa', accession: 'ERR552797',
      stats: { total: 4411532, contigs: 287, n50: 48234, l50: 38, largest: 198743, gc: 65.6, completeness: 92.4, mismatches: 1.2 },
      nx: [198743, 112432, 87234, 65432, 48234, 36421, 24341, 14234, 7432, 2100],
      contigs_dist: [2, 5, 12, 28, 45, 52, 60, 43, 24, 16],
      note: 'SPAdes short-read assembly of clinical M. tuberculosis. 287 contigs reflect the highly repetitive IS6110 insertion sequences that break short reads into fragments.',
    },
    {
      id: 'nanopore-tb', name: 'Long-read Assembly', tag: 'Nanopore',
      organism: 'M. tuberculosis H37Ra', tool: 'Flye v2.9 + Medaka v1.8',
      institution: 'AHRI, Durban, South Africa', accession: 'SRR24139201',
      stats: { total: 4418234, contigs: 12, n50: 892341, l50: 2, largest: 2134892, gc: 65.4, completeness: 99.1, mismatches: 0.3 },
      nx: [2134892, 1832123, 1434567, 1123456, 892341, 723456, 523456, 302345, 152345, 62000],
      contigs_dist: [0, 1, 2, 3, 2, 1, 1, 1, 1, 0],
      note: 'Nanopore ONT sequencing resolves repetitive IS6110 elements, yielding only 12 contigs. N50 of 892 kb shows dramatically improved contiguity vs short-read.',
    },
    {
      id: 'hybrid-covid', name: 'SARS-CoV-2 Hybrid', tag: 'Hybrid',
      organism: 'SARS-CoV-2 (Delta B.1.617.2)', tool: 'Unicycler v0.5.0',
      institution: 'KRISP, KwaZulu-Natal, South Africa', accession: 'EPI_ISL_2693254',
      stats: { total: 29891, contigs: 1, n50: 29891, l50: 1, largest: 29891, gc: 37.9, completeness: 99.8, mismatches: 0.0 },
      nx: [29891, 29891, 29891, 29891, 29891, 29891, 29891, 29891, 29891, 29891],
      contigs_dist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      note: 'Perfect hybrid assembly of SARS-CoV-2 using ARTIC Illumina + Nanopore reads. Single contig of 29,891 bp — close to the reference genome (29,903 bp).',
    },
  ];

  let _assembly = ASSEMBLIES[0];

  function _fmtBp(n) {
    if (n >= 1e6) return (n/1e6).toFixed(2) + ' Mb';
    if (n >= 1e3) return (n/1e3).toFixed(1) + ' kb';
    return n + ' bp';
  }

  function _nxSVG(assembly) {
    const data = assembly.nx;
    const W = 480, H = 240, ml = 52, mr = 16, mt = 20, mb = 36;
    const pw = W - ml - mr, ph = H - mt - mb;
    const xs = i => ml + (i / (data.length - 1)) * pw;
    const ys = v => mt + ph - (v / data[0]) * ph;
    const labels = ['N10','N20','N30','N40','N50','N60','N70','N80','N90','N99'];

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">`;
    svg += `<rect width="${W}" height="${H}" fill="#0d1117"/>`;

    [0.25, 0.5, 0.75, 1.0].forEach(f => {
      const y = ys(data[0] * f);
      svg += `<line x1="${ml}" y1="${y}" x2="${W-mr}" y2="${y}" stroke="#21262d" stroke-width="1"/>`;
      svg += `<text x="${ml-4}" y="${y+4}" text-anchor="end" fill="#6e7681" font-size="8" font-family="monospace">${_fmtBp(Math.round(data[0]*f))}</text>`;
    });

    const path = data.map((v, i) => `${i===0?'M':'L'} ${xs(i)} ${ys(v)}`).join(' ');
    svg += `<path d="${path}" fill="none" stroke="#58a6ff" stroke-width="2"/>`;
    data.forEach((v, i) => {
      svg += `<circle cx="${xs(i)}" cy="${ys(v)}" r="4" fill="#58a6ff"/>`;
    });

    const n50idx = 4;
    const n50x = xs(n50idx), n50y = ys(data[n50idx]);
    svg += `<line x1="${n50x}" y1="${mt}" x2="${n50x}" y2="${mt+ph}" stroke="#e3b341" stroke-width="1" stroke-dasharray="3,2"/>`;
    svg += `<text x="${n50x+3}" y="${mt+14}" fill="#e3b341" font-size="8.5">N50=${_fmtBp(data[n50idx])}</text>`;

    labels.forEach((l, i) => {
      svg += `<text x="${xs(i)}" y="${mt+ph+14}" text-anchor="middle" fill="#6e7681" font-size="8" font-family="monospace">${l}</text>`;
    });

    svg += `<text x="${ml+pw/2}" y="${H-4}" text-anchor="middle" fill="#6e7681" font-size="9">Assembly percentage</text>`;
    svg += `<text x="10" y="${mt+ph/2}" text-anchor="middle" fill="#6e7681" font-size="9" transform="rotate(-90 10 ${mt+ph/2})">Contig length</text>`;
    svg += '</svg>';
    return svg;
  }

  function _contigDistSVG(assembly) {
    const data = assembly.contigs_dist;
    const bins = ['<5k','5-10k','10-20k','20-50k','50-100k','100-200k','200-500k','500k-1M','1-2M','>2M'];
    const W = 480, H = 200, ml = 36, mr = 16, mt = 16, mb = 46;
    const pw = W - ml - mr, ph = H - mt - mb;
    const mx = Math.max(...data, 1);
    const barW = pw / data.length;
    const ys = v => mt + ph - (v / mx) * ph;

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">`;
    svg += `<rect width="${W}" height="${H}" fill="#0d1117"/>`;

    data.forEach((v, i) => {
      if (v === 0) return;
      const x = ml + i * barW;
      svg += `<rect x="${x+2}" y="${ys(v)}" width="${barW-4}" height="${mt+ph-ys(v)}" fill="#3fb950" opacity="0.7" rx="2"/>`;
      if (v > 0) svg += `<text x="${x+barW/2}" y="${ys(v)-4}" text-anchor="middle" fill="#3fb950" font-size="9" font-weight="600">${v}</text>`;
      svg += `<text x="${x+barW/2}" y="${mt+ph+16}" text-anchor="middle" fill="#6e7681" font-size="7.5" transform="rotate(-35 ${x+barW/2} ${mt+ph+16})">${bins[i]}</text>`;
    });

    svg += `<text x="${ml+pw/2}" y="${H-2}" text-anchor="middle" fill="#6e7681" font-size="9">Contig Size</text>`;
    svg += `<text x="8" y="${mt+ph/2}" text-anchor="middle" fill="#6e7681" font-size="9" transform="rotate(-90 8 ${mt+ph/2})">Count</text>`;
    svg += '</svg>';
    return svg;
  }

  function _compareRow(label, vals, fmt) {
    const best = Math.max(...vals.map(v => typeof v === 'number' ? v : 0));
    const worst = Math.min(...vals.map(v => typeof v === 'number' ? v : Infinity));
    return `<tr><td class="asm-compare-label">${label}</td>${vals.map((v, i) => {
      let cls = '';
      if (typeof v === 'number') {
        if (v === best && best !== worst) cls = ' class="asm-best"';
        else if (v === worst && best !== worst) cls = ' class="asm-worst"';
      }
      return `<td${cls}>${fmt ? fmt(v) : v}</td>`;
    }).join('')}</tr>`;
  }

  function _renderStats() {
    const a = _assembly;
    const s = a.stats;
    document.getElementById('asm-stats-table').innerHTML = `
      <table class="asm-stats-tbl">
        <tr><td>Total assembly size</td><td class="asm-val">${_fmtBp(s.total)}</td></tr>
        <tr><td>Number of contigs</td><td class="asm-val">${s.contigs.toLocaleString()}</td></tr>
        <tr><td>N50</td><td class="asm-val">${_fmtBp(s.n50)}</td></tr>
        <tr><td>L50</td><td class="asm-val">${s.l50} contigs</td></tr>
        <tr><td>Largest contig</td><td class="asm-val">${_fmtBp(s.largest)}</td></tr>
        <tr><td>GC content</td><td class="asm-val">${s.gc}%</td></tr>
        <tr><td>BUSCO completeness</td><td class="asm-val ${s.completeness>=98?'asm-best':s.completeness>=90?'asm-ok':'asm-worst'}">${s.completeness}%</td></tr>
        <tr><td>Mismatch rate</td><td class="asm-val">${s.mismatches}/kb</td></tr>
      </table>`;
    document.getElementById('asm-nx').innerHTML = _nxSVG(a);
    document.getElementById('asm-dist').innerHTML = _contigDistSVG(a);
    document.getElementById('asm-note').textContent = a.note;
  }

  function init() {
    const container = document.getElementById('assembly-content');
    if (!container) return;
    if (container.querySelector('.asm-page')) return;

    const compareStats = ASSEMBLIES.map(a => a.stats);

    container.innerHTML = `
<div class="asm-page">
  <div class="asm-header">
    <h1 class="asm-title">Genome Assembly Evaluator</h1>
    <p class="asm-sub">Compare short-read, long-read, and hybrid de novo assemblies using N50, contig distribution, and BUSCO completeness — illustrated with African pathogen data.</p>
  </div>

  <div class="asm-assembly-tabs">
    ${ASSEMBLIES.map(a => `<button class="asm-tab${a.id===_assembly.id?' active':''}" onclick="OmicsLab.Assembly.select('${a.id}')">
      <span class="asm-tab-name">${a.name}</span>
      <span class="asm-tab-tag ${a.tag.toLowerCase()}">${a.tag}</span>
    </button>`).join('')}
  </div>

  <div class="asm-organism-bar">
    <span id="asm-org-name"></span>
    <span class="asm-org-sep">·</span>
    <span id="asm-org-tool"></span>
    <span class="asm-org-sep">·</span>
    <span id="asm-org-inst"></span>
  </div>

  <div class="asm-layout">
    <div class="asm-left">
      <div class="asm-card">
        <div class="asm-card-title">Assembly Statistics</div>
        <div id="asm-stats-table"></div>
      </div>
      <div class="asm-card">
        <div class="asm-card-title">Compare All Assemblies</div>
        <table class="asm-compare-tbl">
          <thead><tr><th>Metric</th>${ASSEMBLIES.map(a=>`<th style="color:var(--${a.tag==='Illumina'?'blue':a.tag==='Nanopore'?'green':'purple'})">${a.tag}</th>`).join('')}</tr></thead>
          <tbody>
            ${_compareRow('Total size', compareStats.map(s=>s.total), _fmtBp)}
            ${_compareRow('Contigs', compareStats.map(s=>s.contigs))}
            ${_compareRow('N50', compareStats.map(s=>s.n50), _fmtBp)}
            ${_compareRow('Largest contig', compareStats.map(s=>s.largest), _fmtBp)}
            ${_compareRow('BUSCO %', compareStats.map(s=>s.completeness), v=>v+'%')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="asm-right">
      <div class="asm-card">
        <div class="asm-card-title">Nx Plot</div>
        <div class="asm-card-sub">Each point shows the shortest contig needed to cover N% of the assembly</div>
        <div id="asm-nx"></div>
      </div>
      <div class="asm-card">
        <div class="asm-card-title">Contig Size Distribution</div>
        <div id="asm-dist"></div>
      </div>
      <div class="asm-note-box"><p id="asm-note"></p></div>
    </div>
  </div>
</div>`;

    _updateMeta();
    _renderStats();
  }

  function _updateMeta() {
    const a = _assembly;
    const orgEl = document.getElementById('asm-org-name');
    const toolEl = document.getElementById('asm-org-tool');
    const instEl = document.getElementById('asm-org-inst');
    if (orgEl) orgEl.textContent = a.organism;
    if (toolEl) toolEl.textContent = a.tool;
    if (instEl) instEl.textContent = a.institution;
  }

  function select(id) {
    _assembly = ASSEMBLIES.find(a => a.id === id) || ASSEMBLIES[0];
    document.querySelectorAll('.asm-tab').forEach((b, i) => b.classList.toggle('active', ASSEMBLIES[i]?.id === id));
    _updateMeta();
    _renderStats();
  }

  return { init, select };
})();
