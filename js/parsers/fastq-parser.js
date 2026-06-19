/* OmicsLab FASTQ parser — dual-mode: Web Worker + main thread */

function parseFastqText(text) {
  const lines = text.split('\n');
  let readCount = 0, totalBases = 0, totalQ = 0;
  let q20 = 0, q30 = 0, gcCount = 0, nCount = 0;
  const lenBuckets = {};
  const posQ = [];   /* sum of quality per position */
  const posN = [];   /* read count per position */
  const MAX_READS = 200000;

  let i = 0;
  while (i + 3 < lines.length && readCount < MAX_READS) {
    if (lines[i][0] !== '@') { i++; continue; }
    const seq  = lines[i + 1] || '';
    const qual = lines[i + 3] || '';
    if (!seq.length || seq.length !== qual.length) { i += 4; continue; }

    readCount++;
    const L = seq.length;
    totalBases += L;
    lenBuckets[L] = (lenBuckets[L] || 0) + 1;

    for (let j = 0; j < L; j++) {
      const q = qual.charCodeAt(j) - 33;
      totalQ += q;
      if (q >= 20) q20++;
      if (q >= 30) q30++;
      if (j < 250) {
        posQ[j] = (posQ[j] || 0) + q;
        posN[j] = (posN[j] || 0) + 1;
      }
      const b = seq[j];
      if (b === 'G' || b === 'C' || b === 'g' || b === 'c') gcCount++;
      if (b === 'N' || b === 'n') nCount++;
    }
    i += 4;
  }

  if (!readCount) return { error: 'No valid FASTQ reads found. Check the file format (@HEADER / SEQ / + / QUAL).' };

  const meanQ   = totalQ / totalBases;
  const q30Pct  = +(q30  / totalBases * 100).toFixed(1);
  const q20Pct  = +(q20  / totalBases * 100).toFixed(1);
  const gcPct   = +(gcCount / totalBases * 100).toFixed(1);
  const nPct    = +(nCount  / totalBases * 100).toFixed(2);

  /* median read length */
  const lenEntries = Object.entries(lenBuckets)
    .map(([k, v]) => ({ len: +k, count: v }))
    .sort((a, b) => a.len - b.len);
  let cumLen = 0, medianLen = 0;
  for (const { len, count } of lenEntries) {
    cumLen += count;
    if (cumLen >= readCount / 2) { medianLen = len; break; }
  }

  /* per-position mean quality (down-sampled to 150 points if longer) */
  const rawPosQ = posQ.map((s, j) => posN[j] ? +(s / posN[j]).toFixed(1) : null).filter(v => v !== null);
  const perBaseQ = rawPosQ.length > 150
    ? rawPosQ.filter((_, j) => j % Math.ceil(rawPosQ.length / 150) === 0).slice(0, 150)
    : rawPosQ;

  const pass = meanQ >= 28 && q30Pct >= 75 && gcPct >= 35 && gcPct <= 70 && nPct < 5;

  const issues = [];
  if (meanQ < 28)          issues.push(`Mean quality Q${meanQ.toFixed(1)} is below Q28 (target ≥Q28)`);
  if (q30Pct < 75)         issues.push(`Only ${q30Pct}% bases ≥Q30 (target ≥75%)`);
  if (gcPct < 35 || gcPct > 70) issues.push(`GC content ${gcPct}% outside expected range (35–70%)`);
  if (nPct >= 5)           issues.push(`High N base rate ${nPct}% — possible sequencing failure`);

  return {
    readCount,
    totalBases,
    meanQuality: +meanQ.toFixed(2),
    q20Pct,
    q30Pct,
    gcPct,
    nPct,
    medianReadLength: medianLen,
    lengthDistribution: lenEntries.slice(0, 20),
    perBaseQ,
    pass,
    issues,
  };
}

/* Export for main thread */
if (typeof window !== 'undefined') {
  window.OmicsLab = window.OmicsLab || {};
  window.OmicsLab.Parsers = window.OmicsLab.Parsers || {};
  window.OmicsLab.Parsers.fastq = parseFastqText;
}
