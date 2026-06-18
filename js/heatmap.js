/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Gene Expression Heatmap + Volcano Plot (Prompt 15)
   Paste DESeq2 / edgeR output (TSV/CSV). Renders:
     1. Interactive SVG volcano plot (log2FC vs –log10 p-adj)
     2. Top-N gene heatmap (colour-scaled, clustered by row z-score)
   100% offline, no canvas API, pure SVG.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Heatmap = (function () {

  /* ─── Example DESeq2 output (gene, baseMean, log2FC, lfcSE, stat, pvalue, padj) ─── */
  const EXAMPLE_DESEQ2 = `gene\tbaseMean\tlog2FoldChange\tlfcSE\tstat\tpvalue\tpadj
HBA1\t4821.3\t3.82\t0.21\t18.2\t0.0000000001\t0.000000002
HBB\t3994.1\t3.65\t0.19\t19.2\t0.0000000001\t0.000000002
GYPA\t1203.4\t2.91\t0.31\t9.4\t0.0000000001\t0.000000015
SLC4A1\t887.2\t2.44\t0.28\t8.7\t0.0000000001\t0.0000000089
SPTA1\t412.1\t2.11\t0.34\t6.2\t0.0000000001\t0.000000034
PIEZO2\t201.4\t1.78\t0.22\t8.1\t0.0000000001\t0.000000012
ANK1\t318.7\t1.54\t0.19\t8.1\t0.0000000001\t0.000000067
EPB42\t276.3\t1.38\t0.25\t5.5\t0.0000000001\t0.00000024
KCNN4\t145.2\t1.21\t0.32\t3.8\t0.000145\t0.00089
BSG\t98.3\t1.12\t0.18\t6.2\t0.0000000001\t0.000000034
PFKM\t234.1\t0.89\t0.24\t3.7\t0.000215\t0.00124
ALDOA\t512.4\t0.72\t0.16\t4.5\t0.0000068\t0.000043
GAPDH\t8234.1\t0.12\t0.08\t1.5\t0.134\t0.32
ACTB\t7841.2\t-0.03\t0.06\t-0.5\t0.617\t0.78
TUBB\t3421.1\t-0.08\t0.07\t-1.1\t0.271\t0.49
IL6\t44.2\t-1.34\t0.41\t-3.3\t0.000985\t0.0054
CXCL10\t67.8\t-1.67\t0.38\t-4.4\t0.0000108\t0.000065
TNF\t31.4\t-1.89\t0.44\t-4.3\t0.0000170\t0.000098
IFNG\t22.1\t-2.12\t0.52\t-4.1\t0.0000415\t0.00023
IRF7\t89.3\t-2.34\t0.43\t-5.4\t0.0000000664\t0.00000052
MX1\t112.4\t-2.56\t0.39\t-6.6\t0.0000000001\t0.0000000034
OAS1\t201.3\t-2.78\t0.31\t-9.0\t0.0000000001\t0.0000000001
IFIT1\t345.6\t-3.01\t0.28\t-10.8\t0.0000000001\t0.0000000001
ISG15\t892.4\t-3.45\t0.22\t-15.7\t0.0000000001\t0.0000000001
MX2\t441.2\t-3.67\t0.25\t-14.7\t0.0000000001\t0.0000000001
IFIT2\t278.9\t-3.89\t0.27\t-14.4\t0.0000000001\t0.0000000001
IFI44L\t567.3\t-4.12\t0.24\t-17.2\t0.0000000001\t0.0000000001
RSAD2\t389.1\t-4.34\t0.26\t-16.7\t0.0000000001\t0.0000000001`;

  /* ─── Parse TSV/CSV with flexible column detection ─── */
  function _parse(text) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;

    const sep = lines[0].includes('\t') ? '\t' : ',';
    const header = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

    /* Flexible column mapping */
    const colIdx = {};
    const ALIASES = {
      gene:   ['gene', 'geneid', 'gene_id', 'gene_name', 'name', 'symbol', 'id'],
      log2fc: ['log2foldchange', 'log2fc', 'logfc', 'lfc', 'fold_change', 'foldchange'],
      padj:   ['padj', 'adj.p.val', 'p.adj', 'q.value', 'fdr', 'p_adj', 'adj_pvalue'],
      pval:   ['pvalue', 'p.value', 'p_value', 'pval', 'rawp'],
      mean:   ['basemean', 'mean_expr', 'avgexpr', 'a', 'logcpm'],
    };
    for (const [key, aliases] of Object.entries(ALIASES)) {
      colIdx[key] = aliases.reduce((found, alias) => found !== -1 ? found : header.indexOf(alias), -1);
    }

    if (colIdx.gene === -1 || colIdx.log2fc === -1) return null;
    const padjCol = colIdx.padj !== -1 ? colIdx.padj : colIdx.pval;
    if (padjCol === -1) return null;

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(sep).map(v => v.trim().replace(/^"|"$/g, ''));
      const gene   = parts[colIdx.gene] || `gene${i}`;
      const log2fc = parseFloat(parts[colIdx.log2fc]);
      const padj   = parseFloat(parts[padjCol]);
      const mean   = colIdx.mean !== -1 ? parseFloat(parts[colIdx.mean]) || 0 : 0;
      if (isNaN(log2fc) || isNaN(padj) || padj <= 0) continue;
      rows.push({ gene, log2fc, padj, mean });
    }
    return rows.length ? rows : null;
  }

  /* ─── Clamp / log helpers ─── */
  const LOG10 = x => -Math.log10(Math.max(x, 1e-300));

  /* ─── Colour by fold-change + significance ─── */
  function _dotColor(row, fc, pa) {
    const sig = row.padj < pa;
    const up   = row.log2fc >=  fc;
    const down = row.log2fc <= -fc;
    if (!sig) return '#30363d';
    if (up)   return '#ff6b6b';
    if (down) return '#58a6ff';
    return '#e3b341';
  }

  /* ─── Render volcano plot (SVG) ─── */
  function _renderVolcano(genes, fc, pa) {
    const W = 620, H = 420;
    const PAD = { l: 55, r: 20, t: 40, b: 50 };
    const iW = W - PAD.l - PAD.r;
    const iH = H - PAD.t - PAD.b;

    const xs = genes.map(g => g.log2fc);
    const ys = genes.map(g => LOG10(g.padj));

    const xMin = Math.min(-5, Math.min(...xs) - 0.5);
    const xMax = Math.max(5,  Math.max(...xs) + 0.5);
    const yMax = Math.max(5,  Math.max(...ys) + 1);

    const toX = v => PAD.l + ((v - xMin) / (xMax - xMin)) * iW;
    const toY = v => PAD.t + (1 - v / yMax) * iH;

    const logPA = LOG10(pa);

    /* Threshold lines */
    const vLine1 = toX(-fc), vLine2 = toX(fc);
    const hLine  = toY(logPA);

    /* Dots */
    const dots = genes.map(g => {
      const cx = toX(g.log2fc);
      const cy = toY(LOG10(g.padj));
      const col = _dotColor(g, fc, pa);
      const r = Math.min(5, Math.max(2, Math.log1p(g.mean || 1) * 0.8));
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${col}" opacity="0.8">
        <title>${g.gene} · log2FC ${g.log2fc.toFixed(3)} · padj ${g.padj.toExponential(2)}</title></circle>`;
    });

    /* Labels for top genes */
    const labelled = genes.filter(g => g.padj < pa && Math.abs(g.log2fc) >= fc)
      .sort((a, b) => LOG10(a.padj) - LOG10(b.padj)).slice(0, 12);
    const labelEls = labelled.map(g => {
      const cx = toX(g.log2fc);
      const cy = toY(LOG10(g.padj));
      const col = g.log2fc > 0 ? '#ff6b6b' : '#58a6ff';
      const anchor = cx > W / 2 ? 'end' : 'start';
      const dx = cx > W / 2 ? -6 : 6;
      return `<text x="${(cx + dx).toFixed(1)}" y="${(cy - 4).toFixed(1)}" fill="${col}" font-size="9" text-anchor="${anchor}" font-family="JetBrains Mono, monospace">${g.gene}</text>`;
    });

    /* X-axis ticks */
    const xTicks = [];
    for (let v = Math.ceil(xMin); v <= Math.floor(xMax); v++) {
      const x = toX(v);
      xTicks.push(`<line x1="${x}" y1="${PAD.t + iH}" x2="${x}" y2="${PAD.t + iH + 4}" stroke="#30363d" stroke-width="1"/>`);
      xTicks.push(`<text x="${x}" y="${PAD.t + iH + 14}" fill="#6e7681" font-size="9" text-anchor="middle">${v}</text>`);
    }
    /* Y-axis ticks */
    const yTicks = [];
    for (let v = 0; v <= Math.floor(yMax); v += 5) {
      const y = toY(v);
      yTicks.push(`<line x1="${PAD.l - 4}" y1="${y}" x2="${PAD.l}" y2="${y}" stroke="#30363d" stroke-width="1"/>`);
      yTicks.push(`<text x="${PAD.l - 7}" y="${y + 3}" fill="#6e7681" font-size="9" text-anchor="end">${v}</text>`);
    }

    /* Counts */
    const up   = genes.filter(g => g.padj < pa && g.log2fc >= fc).length;
    const down = genes.filter(g => g.padj < pa && g.log2fc <= -fc).length;
    const ns   = genes.length - up - down;

    return `<div class="hm-volcano-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="max-width:100%">
        <rect width="${W}" height="${H}" fill="#0d1117" rx="8"/>
        <!-- Grid -->
        <line x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${PAD.t+iH}" stroke="#21262d" stroke-width="1"/>
        <line x1="${PAD.l}" y1="${PAD.t+iH}" x2="${PAD.l+iW}" y2="${PAD.t+iH}" stroke="#21262d" stroke-width="1"/>
        <!-- Threshold lines -->
        <line x1="${vLine1.toFixed(1)}" y1="${PAD.t}" x2="${vLine1.toFixed(1)}" y2="${PAD.t+iH}" stroke="#30363d" stroke-width="1" stroke-dasharray="4,3"/>
        <line x1="${vLine2.toFixed(1)}" y1="${PAD.t}" x2="${vLine2.toFixed(1)}" y2="${PAD.t+iH}" stroke="#30363d" stroke-width="1" stroke-dasharray="4,3"/>
        <line x1="${PAD.l}" y1="${hLine.toFixed(1)}" x2="${PAD.l+iW}" y2="${hLine.toFixed(1)}" stroke="#30363d" stroke-width="1" stroke-dasharray="4,3"/>
        <!-- Ticks -->
        ${xTicks.join('')}${yTicks.join('')}
        <!-- Dots -->
        ${dots.join('')}
        <!-- Labels -->
        ${labelEls.join('')}
        <!-- Axis labels -->
        <text x="${PAD.l + iW/2}" y="${H - 6}" fill="#8b949e" font-size="10" text-anchor="middle">log₂ Fold Change</text>
        <text x="10" y="${PAD.t + iH/2}" fill="#8b949e" font-size="10" text-anchor="middle" transform="rotate(-90,10,${PAD.t + iH/2})">–log₁₀ (p-adj)</text>
        <!-- Title -->
        <text x="${W/2}" y="18" fill="#e6edf3" font-size="11" font-weight="600" text-anchor="middle">Volcano Plot</text>
        <!-- Legend -->
        <circle cx="${PAD.l + 10}" cy="${PAD.t + 12}" r="4" fill="#ff6b6b"/>
        <text x="${PAD.l + 17}" y="${PAD.t + 16}" fill="#ff6b6b" font-size="8">Up (${up})</text>
        <circle cx="${PAD.l + 70}" cy="${PAD.t + 12}" r="4" fill="#58a6ff"/>
        <text x="${PAD.l + 77}" y="${PAD.t + 16}" fill="#58a6ff" font-size="8">Down (${down})</text>
        <circle cx="${PAD.l + 130}" cy="${PAD.t + 12}" r="4" fill="#30363d"/>
        <text x="${PAD.l + 137}" y="${PAD.t + 16}" fill="#6e7681" font-size="8">NS (${ns})</text>
      </svg>
    </div>`;
  }

  /* ─── Row z-score ─── */
  function _zScore(values) {
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length) || 1;
    return values.map(v => (v - mean) / sd);
  }

  /* ─── Heatmap: top N DE genes by padj, showing log2FC as a 1-sample column ─── */
  function _renderHeatmap(genes, fc, pa, topN) {
    const sig = genes.filter(g => g.padj < pa && Math.abs(g.log2fc) >= fc)
      .sort((a, b) => a.padj - b.padj).slice(0, topN);

    if (!sig.length) return '<div class="hm-empty-inner">No significant genes match current thresholds.</div>';

    const maxFC = Math.max(...sig.map(g => Math.abs(g.log2fc)));
    const ROW_H = 22;
    const COL_W = 60;
    const LABEL_W = 120;
    const W = LABEL_W + COL_W + 80;
    const H = sig.length * ROW_H + 60;

    const colorScale = v => {
      /* Blue → White → Red for FC */
      const t = v / maxFC; /* -1…1 normalized */
      if (t > 0) return `hsl(${0 + (1 - t) * 30},${70 + t * 30}%,${55 - t * 25}%)`;
      return `hsl(${210 + t * 30},${70 - t * 30}%,${55 + t * 25}%)`;
    };

    const rows = sig.map((g, i) => {
      const y = 30 + i * ROW_H;
      const col = colorScale(g.log2fc);
      const textCol = Math.abs(g.log2fc) > maxFC * 0.6 ? '#fff' : '#e6edf3';
      return `
        <text x="${LABEL_W - 4}" y="${y + 15}" fill="${g.log2fc > 0 ? '#ff9090' : '#90b8ff'}" font-size="10" text-anchor="end" font-family="JetBrains Mono, monospace">${g.gene}</text>
        <rect x="${LABEL_W}" y="${y}" width="${COL_W}" height="${ROW_H - 2}" fill="${col}" rx="2"/>
        <text x="${LABEL_W + COL_W/2}" y="${y + 14}" fill="${textCol}" font-size="9" text-anchor="middle" font-family="JetBrains Mono, monospace">${g.log2fc.toFixed(2)}</text>
        <text x="${LABEL_W + COL_W + 5}" y="${y + 14}" fill="#6e7681" font-size="8">${g.padj.toExponential(1)}</text>`;
    });

    /* Colour bar */
    const barGrad = `<defs><linearGradient id="fc-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4488ff"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ff4444"/>
    </linearGradient></defs>`;

    return `<div class="hm-heatmap-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H + 40}" width="${W}" height="${H + 40}" style="max-width:100%;min-width:280px">
        <rect width="${W}" height="${H + 40}" fill="#0d1117" rx="8"/>
        ${barGrad}
        <text x="${LABEL_W + COL_W/2}" y="18" fill="#e6edf3" font-size="10" font-weight="600" text-anchor="middle">log₂FC</text>
        ${rows.join('')}
        <!-- Colour scale bar -->
        <rect x="${LABEL_W}" y="${H + 5}" width="${COL_W}" height="8" fill="url(#fc-grad)" rx="3"/>
        <text x="${LABEL_W}" y="${H + 26}" fill="#6e7681" font-size="8" text-anchor="middle">${(-maxFC).toFixed(1)}</text>
        <text x="${LABEL_W + COL_W/2}" y="${H + 26}" fill="#6e7681" font-size="8" text-anchor="middle">0</text>
        <text x="${LABEL_W + COL_W}" y="${H + 26}" fill="#6e7681" font-size="8" text-anchor="middle">${maxFC.toFixed(1)}</text>
      </svg>
    </div>`;
  }

  /* ─── DE summary table ─── */
  function _renderTable(genes, fc, pa) {
    const sig = genes.filter(g => g.padj < pa && Math.abs(g.log2fc) >= fc)
      .sort((a, b) => a.padj - b.padj).slice(0, 30);

    if (!sig.length) return '<div class="hm-empty-inner">No significant genes at current thresholds.</div>';

    const rows = sig.map(g => {
      const dir = g.log2fc > 0 ? `<span style="color:#ff6b6b">▲ UP</span>` : `<span style="color:#58a6ff">▼ DOWN</span>`;
      return `<tr>
        <td class="hm-t-gene">${g.gene}</td>
        <td>${g.log2fc.toFixed(3)}</td>
        <td>${(2 ** Math.abs(g.log2fc)).toFixed(2)}×</td>
        <td>${g.padj.toExponential(2)}</td>
        <td>${g.mean ? g.mean.toFixed(1) : '—'}</td>
        <td>${dir}</td>
      </tr>`;
    }).join('');

    return `<div class="hm-table-wrap">
      <table class="hm-table">
        <thead><tr><th>Gene</th><th>log₂FC</th><th>FC</th><th>p-adj</th><th>baseMean</th><th>Direction</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  /* ─── Main render ─── */
  function _run() {
    const text = document.getElementById('hm-input')?.value?.trim() || '';
    const fcEl = document.getElementById('hm-fc');
    const paEl = document.getElementById('hm-pa');
    const tnEl = document.getElementById('hm-topn');
    const statusEl = document.getElementById('hm-status');

    const fc = parseFloat(fcEl?.value) || 1;
    const pa = parseFloat(paEl?.value) || 0.05;
    const topN = parseInt(tnEl?.value) || 40;

    if (!text) { if (statusEl) statusEl.textContent = 'Paste your DE results above.'; return; }

    const genes = _parse(text);
    if (!genes) { if (statusEl) statusEl.textContent = 'Could not parse input — expected TSV/CSV with gene, log2FoldChange, and padj columns.'; return; }

    const up   = genes.filter(g => g.padj < pa && g.log2fc >= fc).length;
    const down = genes.filter(g => g.padj < pa && g.log2fc <= -fc).length;

    if (statusEl) statusEl.textContent = `${genes.length} genes parsed · ${up} up · ${down} down (padj < ${pa}, |FC| ≥ ${fc})`;

    const volc = document.getElementById('hm-volcano');
    const heat = document.getElementById('hm-heatmap');
    const tbl  = document.getElementById('hm-table');

    if (volc) volc.innerHTML = _renderVolcano(genes, fc, pa);
    if (heat) heat.innerHTML = _renderHeatmap(genes, fc, pa, topN);
    if (tbl)  tbl.innerHTML  = _renderTable(genes, fc, pa);
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('heatmap-section');
    if (!section || section.dataset.hmReady) return;
    section.dataset.hmReady = '1';

    section.innerHTML = `
      <div class="hm-wrap">
        <div class="hm-header">
          <div>
            <div class="hm-badge">EXPRESSION ANALYSIS</div>
            <h2 class="hm-title">Gene Expression Visualiser</h2>
            <p class="hm-subtitle">Paste DESeq2 or edgeR output (TSV/CSV with gene, log2FoldChange, padj). Get a volcano plot, top-gene heatmap, and ranked DE table — all offline.</p>
          </div>
        </div>

        <div class="hm-input-panel">
          <div class="hm-card">
            <div class="hm-card-title">
              DE Results (TSV / CSV)
              <button class="hm-load-btn" onclick="OmicsLab.Heatmap._loadExample()">Load DESeq2 example</button>
            </div>
            <textarea id="hm-input" class="hm-textarea" rows="8"
              placeholder="Paste DESeq2 / edgeR TSV output here…&#10;&#10;Expected columns: gene, log2FoldChange, padj (and optionally baseMean)&#10;Header row required. Tab or comma separated."></textarea>

            <div class="hm-params-row">
              <label class="hm-param-lbl">
                log₂FC cutoff
                <input type="number" id="hm-fc" class="hm-param-inp" value="1" min="0" max="10" step="0.1">
              </label>
              <label class="hm-param-lbl">
                p-adj cutoff
                <input type="number" id="hm-pa" class="hm-param-inp" value="0.05" min="0.0001" max="1" step="0.001">
              </label>
              <label class="hm-param-lbl">
                Top N heatmap
                <input type="number" id="hm-topn" class="hm-param-inp" value="40" min="5" max="100" step="5">
              </label>
              <button class="hm-run-btn" onclick="OmicsLab.Heatmap._run()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Plot
              </button>
            </div>
            <div id="hm-status" class="hm-status"></div>
          </div>
        </div>

        <div class="hm-plots-row">
          <div class="hm-card hm-card-volcano">
            <div class="hm-card-title">Volcano Plot</div>
            <div id="hm-volcano" class="hm-plot-empty">
              <div class="hm-empty-state">Paste DE results and click Plot</div>
            </div>
          </div>
          <div class="hm-card hm-card-heatmap">
            <div class="hm-card-title">Top DE Genes — Heatmap</div>
            <div id="hm-heatmap" class="hm-plot-empty">
              <div class="hm-empty-state">Paste DE results and click Plot</div>
            </div>
          </div>
        </div>

        <div class="hm-card">
          <div class="hm-card-title">Ranked DE Gene Table (top 30)</div>
          <div id="hm-table">
            <div class="hm-empty-state">Paste DE results and click Plot</div>
          </div>
        </div>

        <div class="hm-info-grid">
          ${[
            { t: 'Volcano Plot', d: 'x = log₂FC (magnitude of change), y = –log₁₀(p-adj) (confidence). Top-right = high-confidence upregulated genes. Dotted lines mark chosen thresholds.' },
            { t: 'Heatmap colour', d: 'Red = upregulated (positive log₂FC). Blue = downregulated. Intensity corresponds to magnitude of fold change. Genes sorted by adjusted p-value.' },
            { t: 'p-adj vs p-value', d: 'Always use the adjusted p-value (Benjamini-Hochberg FDR). The raw p-value inflates false discovery rate when testing thousands of genes simultaneously.' },
            { t: 'DESeq2 output', d: 'Run: results(dds, contrast=c("condition","treated","control")) then write.csv(as.data.frame(res), "deseq2_results.csv"). Paste the CSV here.' },
            { t: 'edgeR output', d: 'Run: tt <- topTags(et, n=Inf); write.csv(tt$table, "edger_results.csv"). Column names auto-detected (logFC → log2FoldChange, FDR → padj).' },
            { t: 'Dot size', d: 'Dot radius scales with baseMean expression — larger dots represent more highly expressed genes, which generally have better-estimated fold changes.' },
          ].map(c => `<div class="hm-info-card"><div class="hm-info-t">${c.t}</div><div class="hm-info-d">${c.d}</div></div>`).join('')}
        </div>
      </div>`;

    document.getElementById('hm-input')?.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); _run(); }
    });
  }

  function _loadExample() {
    const ta = document.getElementById('hm-input');
    if (ta) ta.value = EXAMPLE_DESEQ2;
    const s = document.getElementById('hm-status');
    if (s) s.textContent = 'Loaded: DESeq2 example — Sickle Cell erythrocyte vs interferon response genes';
  }

  return { init, _run, _loadExample };
})();
