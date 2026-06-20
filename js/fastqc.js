/* ═══════════════════════════════════════════════════════════════
   OmicsLab — FastQC-style Read Quality Visualizer
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.FastQC = (function () {

  const SAMPLES = [
    {
      id: 'covid', name: 'COVID-19 ARTIC v4', platform: 'Illumina MiSeq 300',
      institution: 'KRISP, KwaZulu-Natal, South Africa', reads: '247,832', length: 150,
      gc_expected: 47, qp: { start: 36, mid: 38, end: 29, dip: true },
      adapter_pct: 1.2, duplication: 42.3,
      modules: { 'Per base quality': 'PASS', 'Per sequence quality': 'PASS', 'GC content': 'PASS', 'Seq length dist.': 'PASS', 'Seq duplication': 'WARN', 'Adapter content': 'PASS' },
      note: 'ARTIC v4 amplicons produce high duplication — expected and can be clipped. Quality is excellent overall.',
    },
    {
      id: 'tb', name: 'M. tuberculosis WGS', platform: 'Illumina HiSeq 2500',
      institution: 'AHRI, Durban, South Africa', reads: '4,218,640', length: 75,
      gc_expected: 65, qp: { start: 30, mid: 33, end: 21, dip: false },
      adapter_pct: 4.8, duplication: 18.6,
      modules: { 'Per base quality': 'WARN', 'Per sequence quality': 'PASS', 'GC content': 'WARN', 'Seq length dist.': 'PASS', 'Seq duplication': 'PASS', 'Adapter content': 'WARN' },
      note: 'High GC content (65.6%) causes GC bias in library prep. 3\' quality drops below Q20 — trim last 15bp.',
    },
    {
      id: 'malaria', name: 'P. falciparum WGS', platform: 'Illumina NextSeq 2000',
      institution: 'KEMRI, Nairobi, Kenya', reads: '12,450,000', length: 100,
      gc_expected: 19, qp: { start: 27, mid: 30, end: 15, dip: true },
      adapter_pct: 8.4, duplication: 27.1,
      modules: { 'Per base quality': 'FAIL', 'Per sequence quality': 'WARN', 'GC content': 'FAIL', 'Seq length dist.': 'PASS', 'Seq duplication': 'PASS', 'Adapter content': 'FAIL' },
      note: 'Very low GC (19.4%) makes Plasmodium AT-rich regions difficult to sequence. High adapter contamination — trim before analysis.',
    },
  ];

  let _sample = SAMPLES[0];
  let _chart = 'quality';

  function _rng(seed) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
  }

  function _genQuality(sample) {
    const r = _rng(sample.id.charCodeAt(0) * 131);
    const { start, mid, end, dip } = sample.qp;
    return Array.from({ length: sample.length }, (_, i) => {
      const t = i / sample.length;
      let base = t < 0.15 ? start + (mid - start) * (t / 0.15) : t > 0.7 ? mid - (mid - end) * ((t - 0.7) / 0.3) : mid;
      if (dip && i < 5) base -= 5;
      base = Math.max(5, Math.min(40, base + (r() - 0.5) * 2.5));
      const sp = 2 + r() * 2;
      return { pos: i + 1, q10: Math.max(0, base - sp * 2.5), q25: Math.max(0, base - sp), median: base, q75: Math.min(40, base + sp * 0.6), q90: Math.min(40, base + sp * 1.3), mean: base + (r() - 0.5) };
    });
  }

  function _qualSVG(sample) {
    const data = _genQuality(sample);
    const W = 660, H = 270, ml = 44, mr = 14, mt = 18, mb = 38;
    const pw = W - ml - mr, ph = H - mt - mb;
    const xs = pos => ml + ((pos - 1) / (sample.length - 1)) * pw;
    const ys = q => mt + ph - (q / 40) * ph;
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">`;
    s += `<rect width="${W}" height="${H}" fill="#0d1117"/>`;
    s += `<rect x="${ml}" y="${ys(40)}" width="${pw}" height="${ys(28)-ys(40)}" fill="rgba(63,185,80,0.07)"/>`;
    s += `<rect x="${ml}" y="${ys(28)}" width="${pw}" height="${ys(20)-ys(28)}" fill="rgba(227,179,65,0.07)"/>`;
    s += `<rect x="${ml}" y="${ys(20)}" width="${pw}" height="${ys(0)-ys(20)}" fill="rgba(248,81,73,0.07)"/>`;
    [10, 20, 28, 30, 40].forEach(q => {
      const y = ys(q);
      s += `<line x1="${ml}" y1="${y}" x2="${W-mr}" y2="${y}" stroke="#21262d" stroke-width="1"/>`;
      s += `<text x="${ml-4}" y="${y+4}" text-anchor="end" fill="#6e7681" font-size="9" font-family="monospace">${q}</text>`;
    });
    const tk = sample.length <= 75 ? 5 : 10;
    for (let i = tk; i <= sample.length; i += tk) {
      const x = xs(Math.min(i, sample.length));
      s += `<line x1="${x}" y1="${mt+ph}" x2="${x}" y2="${mt+ph+4}" stroke="#30363d" stroke-width="1"/>`;
      s += `<text x="${x}" y="${mt+ph+14}" text-anchor="middle" fill="#6e7681" font-size="9" font-family="monospace">${i}</text>`;
    }
    const step = sample.length > 100 ? 3 : 2;
    const bw = Math.max(2, pw / sample.length * step * 0.75);
    data.forEach((d, i) => {
      if (i % step !== 0) return;
      const x = xs(d.pos);
      s += `<line x1="${x}" y1="${ys(d.q10)}" x2="${x}" y2="${ys(d.q90)}" stroke="#e3b341" stroke-width="1" opacity="0.5"/>`;
      s += `<rect x="${x-bw/2}" y="${ys(d.q75)}" width="${bw}" height="${ys(d.q25)-ys(d.q75)}" fill="#e3b341" opacity="0.35" stroke="#e3b341" stroke-width="0.5"/>`;
      s += `<line x1="${x-bw/2}" y1="${ys(d.median)}" x2="${x+bw/2}" y2="${ys(d.median)}" stroke="#f5c842" stroke-width="1.5"/>`;
    });
    const mp = data.map((d, i) => `${i===0?'M':'L'} ${xs(d.pos)} ${ys(d.mean)}`).join(' ');
    s += `<path d="${mp}" fill="none" stroke="#58a6ff" stroke-width="1.5" opacity="0.85"/>`;
    s += `<text x="${ml+pw/2}" y="${H-4}" text-anchor="middle" fill="#6e7681" font-size="10">Position in read (bp)</text>`;
    s += `<text x="9" y="${mt+ph/2}" text-anchor="middle" fill="#6e7681" font-size="10" transform="rotate(-90 9 ${mt+ph/2})">Phred Score</text>`;
    s += '</svg>';
    return s;
  }

  function _gcSVG(sample) {
    const r = _rng(sample.id.charCodeAt(0) * 97);
    const W = 660, H = 270, ml = 44, mr = 14, mt = 18, mb = 38;
    const pw = W - ml - mr, ph = H - mt - mb;
    const gcExp = sample.gc_expected;
    const sp = 7 + r() * 4;
    const obs = Array.from({ length: 101 }, (_, gc) => ({ gc, v: Math.max(0, Math.exp(-0.5*((gc-gcExp)/sp)**2) * (1+(r()-0.5)*0.25)) }));
    const mx = Math.max(...obs.map(d => d.v));
    const xs = gc => ml + (gc / 100) * pw;
    const ys = v => mt + ph - (v / mx) * ph;
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">`;
    s += `<rect width="${W}" height="${H}" fill="#0d1117"/>`;
    [0,25,50,75,100].forEach(gc => {
      const x = xs(gc);
      s += `<line x1="${x}" y1="${mt}" x2="${x}" y2="${mt+ph}" stroke="#21262d" stroke-width="1"/>`;
      s += `<text x="${x}" y="${mt+ph+14}" text-anchor="middle" fill="#6e7681" font-size="9" font-family="monospace">${gc}%</text>`;
    });
    const area = obs.map((d,i) => `${i===0?'M':'L'} ${xs(d.gc)} ${ys(d.v)}`).join(' ') + ` L ${xs(100)} ${ys(0)} L ${xs(0)} ${ys(0)} Z`;
    s += `<path d="${area}" fill="rgba(88,166,255,0.12)" stroke="#58a6ff" stroke-width="1.5"/>`;
    const theoSp = 9;
    let theoPath = '';
    for (let gc = 0; gc <= 100; gc++) {
      const v = mx * Math.exp(-0.5*((gc-gcExp)/theoSp)**2);
      theoPath += `${gc===0?'M':'L'} ${xs(gc)} ${ys(v)} `;
    }
    s += `<path d="${theoPath}" fill="none" stroke="#f85149" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.8"/>`;
    const expX = xs(gcExp);
    s += `<line x1="${expX}" y1="${mt}" x2="${expX}" y2="${mt+ph}" stroke="#e3b341" stroke-width="1" stroke-dasharray="3,2"/>`;
    s += `<text x="${expX+3}" y="${mt+14}" fill="#e3b341" font-size="9">exp ${gcExp}%</text>`;
    s += `<text x="${ml+pw/2}" y="${H-4}" text-anchor="middle" fill="#6e7681" font-size="10">GC Content (%)</text>`;
    s += `<text x="9" y="${mt+ph/2}" text-anchor="middle" fill="#6e7681" font-size="10" transform="rotate(-90 9 ${mt+ph/2})">Count</text>`;
    s += `<line x1="${W-mr-100}" y1="${mt+10}" x2="${W-mr-80}" y2="${mt+10}" stroke="#58a6ff" stroke-width="1.5"/><text x="${W-mr-75}" y="${mt+14}" fill="#6e7681" font-size="9">Observed</text>`;
    s += `<line x1="${W-mr-100}" y1="${mt+24}" x2="${W-mr-80}" y2="${mt+24}" stroke="#f85149" stroke-width="1.5" stroke-dasharray="4,3"/><text x="${W-mr-75}" y="${mt+28}" fill="#6e7681" font-size="9">Theoretical</text>`;
    s += '</svg>';
    return s;
  }

  function _seqQualSVG(sample) {
    const r = _rng(sample.id.charCodeAt(0) * 53);
    const { start, mid } = sample.qp;
    const W = 660, H = 270, ml = 44, mr = 14, mt = 18, mb = 38;
    const pw = W - ml - mr, ph = H - mt - mb;
    const peakQ = Math.round((start + mid * 2) / 3);
    const data = Array.from({ length: 41 }, (_, q) => ({ q, v: Math.max(0, Math.exp(-0.5*((q-peakQ)/4)**2)*(1+(r()-0.5)*0.15)) }));
    const mx = Math.max(...data.map(d => d.v));
    const xs = q => ml + (q / 40) * pw;
    const ys = v => mt + ph - (v / mx) * ph;
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">`;
    s += `<rect width="${W}" height="${H}" fill="#0d1117"/>`;
    s += `<rect x="${xs(0)}" y="${mt}" width="${xs(20)-xs(0)}" height="${ph}" fill="rgba(248,81,73,0.07)"/>`;
    s += `<rect x="${xs(20)}" y="${mt}" width="${xs(28)-xs(20)}" height="${ph}" fill="rgba(227,179,65,0.07)"/>`;
    s += `<rect x="${xs(28)}" y="${mt}" width="${xs(40)-xs(28)}" height="${ph}" fill="rgba(63,185,80,0.07)"/>`;
    data.forEach(d => {
      const x = xs(d.q); const bw = pw / 41 * 0.8;
      const col = d.q >= 28 ? '#3fb950' : d.q >= 20 ? '#e3b341' : '#f85149';
      s += `<rect x="${x}" y="${ys(d.v)}" width="${bw}" height="${mt+ph-ys(d.v)}" fill="${col}" opacity="0.7"/>`;
    });
    [0,10,20,28,30,40].forEach(q => {
      s += `<text x="${xs(q)}" y="${mt+ph+14}" text-anchor="middle" fill="#6e7681" font-size="9" font-family="monospace">${q}</text>`;
    });
    s += `<text x="${ml+pw/2}" y="${H-4}" text-anchor="middle" fill="#6e7681" font-size="10">Mean Sequence Quality (Phred)</text>`;
    s += `<text x="9" y="${mt+ph/2}" text-anchor="middle" fill="#6e7681" font-size="10" transform="rotate(-90 9 ${mt+ph/2})">Reads</text>`;
    s += '</svg>';
    return s;
  }

  function _statusColor(s) { return s === 'PASS' ? '#3fb950' : s === 'WARN' ? '#e3b341' : '#f85149'; }
  function _statusIcon(s) {
    if (s === 'PASS') return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
    if (s === 'WARN') return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  }

  function _renderChart() {
    const el = document.getElementById('fqc-viz');
    if (!el) return;
    if (_chart === 'quality') el.innerHTML = _qualSVG(_sample);
    else if (_chart === 'gc') el.innerHTML = _gcSVG(_sample);
    else el.innerHTML = _seqQualSVG(_sample);
  }

  function _refreshPanel() {
    const s = _sample;
    const infoEl = document.getElementById('fqc-info');
    if (infoEl) infoEl.innerHTML = [
      ['Platform', s.platform], ['Institution', s.institution], ['Total reads', s.reads],
      ['Read length', s.length + ' bp'], ['Duplication', s.duplication + '%'], ['Adapter est.', s.adapter_pct + '%'],
    ].map(([l, v]) => `<div class="fqc-info-row"><span class="fqc-info-label">${l}</span><span class="fqc-info-val">${v}</span></div>`).join('');

    const modEl = document.getElementById('fqc-mods');
    if (modEl) modEl.innerHTML = Object.entries(s.modules).map(([name, status]) => {
      const c = _statusColor(status);
      return `<div class="fqc-mod-item"><span style="color:${c}">${_statusIcon(status)}</span><span class="fqc-mod-name">${name}</span><span class="fqc-mod-badge" style="color:${c};border-color:${c}">${status}</span></div>`;
    }).join('');

    const noteEl = document.getElementById('fqc-note');
    if (noteEl) noteEl.textContent = s.note;

    const INTERP = {
      quality: `Boxes show the interquartile range (IQR) at each base position. A yellow median consistently above Phred Q28 (green zone) is good. 3'-end degradation is normal for Illumina. Status: <strong style="color:${_statusColor(s.modules['Per base quality'])}">${s.modules['Per base quality']}</strong>`,
      gc: `Observed GC (blue) should match the organism theoretical distribution (red dashes, centred on ${s.gc_expected}%). Shifts indicate contamination or library bias. Status: <strong style="color:${_statusColor(s.modules['GC content'])}">${s.modules['GC content']}</strong>`,
      seqqual: `Distribution of mean quality across all reads. Peak should be > Q28. Left-shifted distributions indicate many low-quality reads. Status: <strong style="color:${_statusColor(s.modules['Per sequence quality'])}">${s.modules['Per sequence quality']}</strong>`,
    };
    const interpEl = document.getElementById('fqc-interp');
    if (interpEl) interpEl.innerHTML = INTERP[_chart] || '';
  }

  function init() {
    const container = document.getElementById('fastqc-content');
    if (!container) return;
    if (container.querySelector('.fqc-page')) return;

    container.innerHTML = `
<div class="fqc-page">
  <div class="fqc-header">
    <h1 class="fqc-title">Read Quality Control</h1>
    <p class="fqc-sub">FastQC-style per-base quality, GC distribution, and module summary for African genomics sequencing data — COVID-19 ARTIC, TB whole-genome, and malaria WGS.</p>
  </div>

  <div class="fqc-layout">
    <aside class="fqc-sidebar">
      <div class="fqc-sb-title">Sample</div>
      ${SAMPLES.map(s => `<button class="fqc-sample-btn${s.id===_sample.id?' active':''}" onclick="OmicsLab.FastQC.selectSample('${s.id}')">
        <span class="fqc-sb-name">${s.name}</span>
        <span class="fqc-sb-plat">${s.platform}</span>
      </button>`).join('')}

      <div class="fqc-sb-title" style="margin-top:1.2rem">Sample Info</div>
      <div id="fqc-info" class="fqc-info-block"></div>

      <div class="fqc-sb-title" style="margin-top:1.2rem">Module Summary</div>
      <div id="fqc-mods" class="fqc-mods-block"></div>

      <div class="fqc-note-box"><p id="fqc-note" class="fqc-note"></p></div>
    </aside>

    <div class="fqc-main">
      <div class="fqc-chart-tabs">
        <button class="fqc-tab active" onclick="OmicsLab.FastQC.setChart('quality',this)">Per-base Quality</button>
        <button class="fqc-tab" onclick="OmicsLab.FastQC.setChart('seqqual',this)">Per-sequence Quality</button>
        <button class="fqc-tab" onclick="OmicsLab.FastQC.setChart('gc',this)">GC Content</button>
      </div>
      <div class="fqc-viz-box"><div id="fqc-viz"></div></div>
      <div class="fqc-legend">
        <span><span class="fqc-dot" style="background:#3fb950"></span>Very Good (Q≥28)</span>
        <span><span class="fqc-dot" style="background:#e3b341"></span>Acceptable (Q20–28)</span>
        <span><span class="fqc-dot" style="background:#f85149"></span>Poor (Q&lt;20)</span>
        <span><span class="fqc-line" style="background:#58a6ff"></span>Mean quality</span>
      </div>
      <div class="fqc-interp-box">
        <div class="fqc-interp-title">Interpretation</div>
        <p id="fqc-interp"></p>
      </div>
    </div>
  </div>
</div>`;

    _refreshPanel();
    _renderChart();
  }

  function selectSample(id) {
    _sample = SAMPLES.find(s => s.id === id) || SAMPLES[0];
    document.querySelectorAll('.fqc-sample-btn').forEach((b, i) => b.classList.toggle('active', SAMPLES[i]?.id === id));
    _refreshPanel(); _renderChart();
  }

  function setChart(chart, btn) {
    _chart = chart;
    document.querySelectorAll('.fqc-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _renderChart(); _refreshPanel();
  }

  return { init, selectSample, setChart };
})();
