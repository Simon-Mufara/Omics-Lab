/* OmicsLab VCF v4.2 parser — dual-mode: Web Worker + main thread */

function parseVcfText(text) {
  const lines = text.split('\n');
  const metaLines = [];
  let columns = null;
  const variants = [];
  const MAX_VARS = 500000;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('##')) { metaLines.push(line); continue; }

    if (line.startsWith('#CHROM')) {
      columns = line.replace(/^#/, '').split('\t');
      continue;
    }

    if (!columns || variants.length >= MAX_VARS) continue;

    const f = line.split('\t');
    if (f.length < 8) continue;

    const [chrom, rawPos, id, ref, alt, rawQual, filter, info] = f;
    const pos  = parseInt(rawPos);
    const qual = parseFloat(rawQual);
    const alts = alt.split(',');
    const isSnp = ref.length === 1 && alts.every(a => a.length === 1 && a !== '*');

    /* Pull AF from INFO (handles AF=0.5 and AF=0.3,0.7 multi-allelic) */
    let af = null;
    const afM = info.match(/(?:^|;)AF=([^;]+)/);
    if (afM) af = parseFloat(afM[1].split(',')[0]);

    /* Mutation type */
    let mutType = 'other';
    if (isSnp) {
      const ts = (ref === 'A' && alt === 'G') || (ref === 'G' && alt === 'A') ||
                 (ref === 'C' && alt === 'T') || (ref === 'T' && alt === 'C');
      mutType = ts ? 'transition' : 'transversion';
    } else if (ref.length !== alt.length) {
      mutType = alt.length > ref.length ? 'insertion' : 'deletion';
    }

    variants.push({ chrom, pos, ref, alt, qual, filter: filter || '.', isSnp, mutType, af });
  }

  if (!variants.length) {
    return { error: 'No variant records found. Ensure the VCF includes ## header lines and a #CHROM column line.' };
  }

  const passCount  = variants.filter(v => v.filter === 'PASS' || v.filter === '.').length;
  const snpCount   = variants.filter(v => v.isSnp).length;
  const indelCount = variants.length - snpCount;
  const tsCount    = variants.filter(v => v.mutType === 'transition').length;
  const tvCount    = variants.filter(v => v.mutType === 'transversion').length;
  const tiTv       = tvCount ? +(tsCount / tvCount).toFixed(2) : null;

  const quals = variants.map(v => v.qual).filter(q => !isNaN(q) && q > 0);
  const meanQual = quals.length ? +(quals.reduce((a, b) => a + b, 0) / quals.length).toFixed(1) : null;

  /* Chrom distribution */
  const chromMap = {};
  variants.forEach(v => { chromMap[v.chrom] = (chromMap[v.chrom] || 0) + 1; });
  const chromDistribution = Object.entries(chromMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([chrom, count]) => ({ chrom, count }));

  /* AF histogram: 10 buckets 0-0.1, 0.1-0.2, ... */
  const afBuckets = Array(10).fill(0);
  variants.forEach(v => {
    if (v.af !== null && !isNaN(v.af)) {
      afBuckets[Math.min(9, Math.floor(v.af * 10))]++;
    }
  });

  const fileFormat = metaLines.find(m => m.startsWith('##fileformat'))?.replace('##fileformat=', '') || 'VCF';
  const sampleCount = columns ? Math.max(0, columns.length - 9) : 0;

  return {
    variantCount: variants.length,
    passCount,
    failCount: variants.length - passCount,
    passRate: +(passCount / variants.length * 100).toFixed(1),
    snpCount,
    indelCount,
    snpRate: +(snpCount / variants.length * 100).toFixed(1),
    tiTvRatio: tiTv,
    meanQual,
    chromDistribution,
    afBuckets,
    fileFormat,
    sampleCount,
    metaLineCount: metaLines.length,
    preview: variants.slice(0, 5).map(v => ({
      chrom: v.chrom, pos: v.pos, ref: v.ref, alt: v.alt,
      qual: v.qual, filter: v.filter, af: v.af,
    })),
  };
}

if (typeof window !== 'undefined') {
  window.OmicsLab = window.OmicsLab || {};
  window.OmicsLab.Parsers = window.OmicsLab.Parsers || {};
  window.OmicsLab.Parsers.vcf = parseVcfText;
}
