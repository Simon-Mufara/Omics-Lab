/* OmicsLab Expression Matrix parser (CSV / TSV) — dual-mode */

function parseMatrixText(text) {
  const trimmed = text.trim();
  if (!trimmed) return { error: 'Empty file.' };

  /* Detect delimiter */
  const firstLine = trimmed.split('\n')[0];
  const tabCount  = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const sep = tabCount >= commaCount ? '\t' : ',';

  const lines = trimmed.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { error: 'Matrix needs at least one header row and one data row.' };

  /* Parse header */
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''));
  const sampleNames = headers.slice(1);
  const S = sampleNames.length;
  if (S < 1) return { error: 'No sample columns found. Expected: first column = gene names, remaining = samples.' };

  const MAX_GENES = 60000;
  const genes = [];
  let totalZero = 0, totalValues = 0;
  let gMin = Infinity, gMax = -Infinity;
  let sumAll = 0;

  for (let i = 1; i < Math.min(lines.length, MAX_GENES + 1); i++) {
    const parts = lines[i].split(sep);
    const name   = parts[0].trim().replace(/^"|"$/g, '');
    const values = [];
    let rowSum = 0;

    for (let j = 1; j <= S; j++) {
      const v = parseFloat((parts[j] || '').trim());
      const n = isNaN(v) ? 0 : v;
      values.push(n);
      rowSum += n;
      totalValues++;
      if (n === 0) totalZero++;
      if (n < gMin) gMin = n;
      if (n > gMax) gMax = n;
      sumAll += n;
    }
    genes.push({ name, values, sum: rowSum });
  }

  const G = genes.length;
  if (!G) return { error: 'No gene rows parsed.' };

  const zeroFraction = +(totalZero / totalValues * 100).toFixed(1);
  const meanExpr     = +(sumAll / totalValues).toFixed(3);
  const isNormalised = gMax < 30; /* heuristic: log2/CPM usually < 20 */

  /* Top expressed genes */
  const topGenes = [...genes]
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 10)
    .map(g => ({ name: g.name, totalCount: Math.round(g.sum), meanExpr: +(g.sum / S).toFixed(2) }));

  /* Sample totals for coverage check */
  const sampleTotals = [];
  for (let j = 0; j < S; j++) {
    let st = 0;
    genes.forEach(g => { st += g.values[j]; });
    sampleTotals.push({ name: sampleNames[j] || `S${j+1}`, total: Math.round(st) });
  }

  /* Simple bimodal detection: fraction of genes with 0 expression */
  const highZeroWarning = zeroFraction > 80;

  return {
    geneCount: G,
    sampleCount: S,
    sampleNames: sampleNames.slice(0, 12),
    globalMin: isFinite(gMin) ? +gMin.toFixed(3) : 0,
    globalMax: isFinite(gMax) ? +gMax.toFixed(3) : 0,
    meanExpression: meanExpr,
    zeroFraction,
    isNormalised,
    format: sep === '\t' ? 'TSV' : 'CSV',
    topGenes,
    sampleTotals: sampleTotals.slice(0, 10),
    warnings: [
      highZeroWarning ? `${zeroFraction}% zero values — consider filtering low-expression genes` : null,
      isNormalised ? null : 'Data appears to be raw counts. Consider normalisation (CPM, RPKM, VST) before downstream analysis.',
    ].filter(Boolean),
  };
}

if (typeof window !== 'undefined') {
  window.OmicsLab = window.OmicsLab || {};
  window.OmicsLab.Parsers = window.OmicsLab.Parsers || {};
  window.OmicsLab.Parsers.matrix = parseMatrixText;
}
