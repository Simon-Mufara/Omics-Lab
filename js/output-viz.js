/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Post-simulation "Visualize this in Python" panel
   Bridges the results screen (real QC numbers, computed live by
   engine.js) to the real Pyodide notebook in js/terminal.js, so
   users leave a simulation knowing the concrete next step: how to
   load and plot their own output in Python.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.OutputViz = (function () {

  /* Workflow domain → illustrative output shape. Keyed by workflow id
     (js/workflows.js). Grouped by the shape of data that workflow
     family actually produces, not 1:1 per workflow. */
  const CATEGORY_BY_WF = {
    'wgs':'variants', 'wes':'variants', 'viral-wgs':'variants', 'ampli-seq':'variants',
    'rna-seq':'counts', 'rt-qpcr':'qpcr',
    'scrna-seq':'single-cell', 'cite-seq':'single-cell',
    'atac-seq':'peaks', 'chip-seq':'peaks',
    'shotgun-meta':'microbiome', '16s-amplicon':'microbiome',
    'lc-ms':'massspec', 'proteomics':'massspec',
  };

  const CATEGORY_SNIPPETS = {
    variants: {
      label: 'Variant table',
      code:
`import pandas as pd

# Illustrative shape of a variant table (VCF-derived) for this workflow —
# the simulator scores wet-lab/pipeline quality rather than emitting real
# reads, so treat the values below as a template for your own VCF export.
variants = pd.DataFrame({
    "chrom":  ["chr1", "chr3", "chr7", "chr17"],
    "pos":    [925952, 41266136, 140453136, 7577120],
    "gene":   ["SAMD11", "BRCA1", "BRAF", "TP53"],
    "ref":    ["C", "G", "T", "C"],
    "alt":    ["T", "A", "A", "T"],
    "depth":  [42, 38, 55, 61],
    "vaf":    [0.51, 0.09, 0.34, 0.48],
})
print(variants)
print()
print("VAF by variant:")
print(variants.set_index("gene")["vaf"])`,
    },
    counts: {
      label: 'Expression count matrix',
      code:
`import pandas as pd

# Illustrative bulk RNA-seq count matrix shape — swap this for your own
# featureCounts / salmon output (genes x samples).
counts = pd.DataFrame({
    "gene":       ["GAPDH", "ACTB", "IL6", "TNF", "IFNG"],
    "control_1":  [15230, 22110, 340, 512, 88],
    "control_2":  [14980, 21870, 355, 498, 91],
    "treated_1":  [15410, 22400, 1820, 2210, 640],
    "treated_2":  [15100, 22050, 1755, 2090, 611],
}).set_index("gene")
print(counts)
print()
print("Fold change (treated vs control, mean):")
fc = counts[["treated_1","treated_2"]].mean(axis=1) / counts[["control_1","control_2"]].mean(axis=1)
print(fc.round(2))`,
    },
    'single-cell': {
      label: 'Cell x gene matrix (sparse)',
      code:
`import pandas as pd

# Illustrative single-cell shape — a tiny dense slice of what would
# normally be a large sparse cell x gene matrix from Cell Ranger / STARsolo.
cells = pd.DataFrame({
    "cell_id":    [f"cell_{i}" for i in range(6)],
    "n_genes":    [2140, 1980, 2350, 210, 2200, 1890],
    "pct_mito":   [4.2, 3.8, 5.1, 41.0, 4.6, 3.9],
    "cluster":    [0, 0, 1, None, 1, 0],
})
print(cells)
print()
print("Cells failing QC (high mito%, likely dying/broken):")
print(cells[cells["pct_mito"] > 20])`,
    },
    peaks: {
      label: 'Peak / bin table (BED-like)',
      code:
`import pandas as pd

# Illustrative peak-calling output shape (ATAC-seq / ChIP-seq) —
# swap for your own MACS2 narrowPeak / broadPeak export.
peaks = pd.DataFrame({
    "chrom":     ["chr1", "chr1", "chr2", "chr5"],
    "start":     [1000500, 2400100, 550300, 9981200],
    "end":       [1000900, 2400650, 550900, 9981800],
    "score":     [182, 64, 310, 45],
    "nearest_gene": ["DDX11L1", "OR4F5", "SOX2", "GATA1"],
})
print(peaks)
print()
print("High-confidence peaks (score > 100):")
print(peaks[peaks["score"] > 100])`,
    },
    microbiome: {
      label: 'Taxa abundance table',
      code:
`import pandas as pd

# Illustrative taxonomic abundance table (16S / shotgun metagenomics) —
# swap for your own Kraken2/QIIME2 relative-abundance export.
taxa = pd.DataFrame({
    "taxon": ["Bacteroides", "Prevotella", "Firmicutes_sp", "E. coli", "Lactobacillus"],
    "sample_A": [0.31, 0.22, 0.18, 0.04, 0.09],
    "sample_B": [0.12, 0.41, 0.15, 0.02, 0.14],
}).set_index("taxon")
print(taxa)
print()
print("Shannon diversity (sample_A):")
import math
p = taxa["sample_A"]
p = p[p > 0]
shannon = -sum(p * p.apply(math.log))
print(round(shannon, 3))`,
    },
    massspec: {
      label: 'Feature intensity table',
      code:
`import pandas as pd

# Illustrative LC-MS / proteomics feature table — swap for your own
# MaxQuant / MZmine export (features or proteins x samples).
features = pd.DataFrame({
    "id":       ["Protein_A", "Protein_B", "Protein_C", "Metabolite_X"],
    "mz":       [812.4, 455.2, 601.9, 180.1],
    "sample_1": [4.2e6, 1.1e6, 3.8e5, 9.9e5],
    "sample_2": [4.0e6, 2.4e6, 4.1e5, 5.2e5],
})
print(features)
print()
print("Log2 fold change (sample_2 / sample_1):")
import math
features["log2fc"] = (features["sample_2"] / features["sample_1"]).apply(lambda x: round(math.log2(x), 2))
print(features[["id","log2fc"]])`,
    },
    qpcr: {
      label: 'Ct value table (ΔΔCt)',
      code:
`import pandas as pd

# Illustrative RT-qPCR Ct table — swap for your own instrument export.
ct = pd.DataFrame({
    "sample":  ["control_1", "control_2", "treated_1", "treated_2"],
    "target_ct":     [24.1, 24.4, 19.8, 20.1],
    "housekeeping_ct": [18.0, 18.1, 18.0, 18.2],
})
ct["delta_ct"] = ct["target_ct"] - ct["housekeeping_ct"]
control_mean = ct.loc[ct["sample"].str.startswith("control"), "delta_ct"].mean()
ct["ddct"] = ct["delta_ct"] - control_mean
ct["fold_change"] = 2 ** (-ct["ddct"])
print(ct)`,
    },
  };

  /* Tier 1 — always available: the run's REAL QC numbers (computed live
     by engine.js) as a bar chart. This works identically for all 14
     workflows since showResults() always computes these 8 metrics. */
  function _tier1Cell(wf, q, score) {
    const metrics = [
      ['Sample Integrity (RIN x10)', q.sampleIntegrity],
      ['Purity', q.purity],
      ['Yield', q.yield],
      ['Library Complexity', q.libraryComplexity],
      ['Q30 Score', q.sequencingQ30],
      ['Alignment Rate', q.alignmentRate],
      ['Duplication Rate', q.duplication],
      ['Contamination', q.contamination],
    ];
    const dictLines = metrics.map(([k, v]) => `    "${k}": ${v},`).join('\n');
    const code =
`import pandas as pd
import matplotlib.pyplot as plt

# Your actual QC results from this "${wf.name}" run (score: ${score}/100)
qc = pd.Series({
${dictLines}
})
print(qc)

qc.plot(kind="barh", figsize=(7,4), color="#00C4A0")
plt.title("${wf.name} — QC metrics (score ${score}/100)")
plt.xlabel("%")
plt.tight_layout()
plt.show()`;
    return { title: 'Your run — QC metrics', code };
  }

  function _tier2Cell(wf) {
    const cat = CATEGORY_BY_WF[wf.id] || 'counts';
    const snip = CATEGORY_SNIPPETS[cat];
    return { title: `Illustrative ${snip.label}`, code: snip.code };
  }

  function _escAttr(s) {
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }

  function panelHTML(wf, q, score) {
    const cells = [_tier1Cell(wf, q, score), _tier2Cell(wf)];
    /* Stash on the module rather than serialising into onclick= — code
       strings contain quotes/newlines that would break inline HTML attrs. */
    _pending = cells;
    const preview = cells.map(c =>
      `<div class="oviz-cell">
        <div class="oviz-cell-title">${_escAttr(c.title)}</div>
        <pre class="oviz-code">${_escAttr(c.code)}</pre>
        <button class="oviz-copy-btn" data-code-idx="${cells.indexOf(c)}" onclick="OmicsLab.OutputViz._copy(${cells.indexOf(c)})">
          ${OmicsLab.Icons?.svg('clipboard',12) || ''} Copy code
        </button>
      </div>`
    ).join('');

    return `
      <div class="results-card oviz-card">
        <div class="results-card-title">${OmicsLab.Icons?.svg('bar-chart',16) || ''} Next step: visualize this in Python</div>
        <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1rem">
          This platform scores your wet-lab and pipeline decisions rather than generating raw reads — but the numbers above are real.
          Here's how you'd load and plot them (and a typical ${(CATEGORY_SNIPPETS[CATEGORY_BY_WF[wf.id]||'counts']||{}).label || 'output'} table for this workflow family) in actual Python, right in your browser.
        </p>
        ${preview}
        <button class="btn-result-primary" style="margin-top:.75rem" onclick="OmicsLab.OutputViz.openInNotebook()">
          ${OmicsLab.Icons?.svg('cpu',15) || ''} Open in the real Python Notebook
        </button>
      </div>`;
  }

  let _pending = [];

  function _copy(idx) {
    const cell = _pending[idx];
    if (!cell) return;
    navigator.clipboard?.writeText(cell.code).then(() => {
      OmicsLab.Notify?.success('Code copied');
    }).catch(() => {});
  }

  function openInNotebook() {
    const cells = _pending.slice();
    /* The results screen is a separate top-level "screen" (js/app.js's
       showScreen state machine) layered outside the router's own
       page/section system — Router.navigate() alone leaves the results
       screen visibly on top since it doesn't know to dismiss it. Show
       the landing shell first (same fix router.js already applies to
       App.goHome) so the terminal page actually becomes visible. */
    OmicsLab.App?.showScreen?.('screen-landing');
    OmicsLab.Router?.navigate('terminal');
    setTimeout(() => {
      OmicsLab.Terminal?.openStarterSnippet(cells);
    }, 200);
  }

  return { panelHTML, openInNotebook, _copy };
})();
