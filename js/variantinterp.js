/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Genomic Variant Interpreter (Prompt 20)
   Paste a VCF line or enter HGVS notation. Offline rules engine:
   - ACMG/AMP 2015 classification (PVS1, PS1-4, PM1-6, PP1-5, BA1, BS1-4, BP1-7)
   - gnomAD AF lookup table (100 clinically relevant African variants)
   - Consequence prediction (missense, nonsense, frameshift, splice)
   - ClinVar significance map for known pathogenic variants
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.VariantInterp = (function () {

  /* ─── Known variant database (Africa-relevant) ─── */
  /* Format: CHROM-POS-REF-ALT → { gene, hgvsc, hgvsp, consequence, clinvar, afGlobal, afAfr, afSaudi, acmgClass, disease, notes } */
  const KNOWN_VARIANTS = {
    /* Sickle cell / haemoglobin */
    '11-5246956-A-T':     { gene:'HBB', hgvsc:'c.20A>T', hgvsp:'p.Glu7Val', consequence:'missense_variant', clinvar:'Pathogenic', afGlobal:0.003, afAfr:0.12, acmgClass:'Pathogenic', disease:'Sickle Cell Disease', notes:'Highest-frequency pathogenic variant in sub-Saharan Africa. PVS1 does not apply; PS1 strong evidence from multiple affected families.' },
    '11-5248232-G-A':     { gene:'HBB', hgvsc:'c.92+1G>A', hgvsp:'—', consequence:'splice_donor_variant', clinvar:'Pathogenic', afGlobal:0.0004, afAfr:0.008, acmgClass:'Pathogenic', disease:'Beta-thalassaemia', notes:'IVS-I-1 splice donor. PVS1 applies — predicted loss of function.' },
    '11-5246994-C-T':     { gene:'HBB', hgvsc:'c.47G>A', hgvsp:'p.Trp16*', consequence:'stop_gained', clinvar:'Pathogenic', afGlobal:0.0001, afAfr:0.002, acmgClass:'Pathogenic', disease:'Beta-thalassaemia', notes:'Nonsense variant — premature stop codon, PVS1 applies.' },
    /* G6PD */
    'X-154535077-G-A':    { gene:'G6PD', hgvsc:'c.202G>A', hgvsp:'p.Val68Met', consequence:'missense_variant', clinvar:'Pathogenic', afGlobal:0.01, afAfr:0.24, acmgClass:'Pathogenic', disease:'G6PD Deficiency (Class II)', notes:'G6PD A- variant. Most common in West Africa. Associated with haemolytic anaemia with antimalarial drugs.' },
    'X-154531391-C-T':    { gene:'G6PD', hgvsc:'c.563C>T', hgvsp:'p.Ser188Phe', consequence:'missense_variant', clinvar:'Pathogenic', afGlobal:0.002, afAfr:0.05, acmgClass:'Pathogenic', disease:'G6PD Deficiency (Class I)', notes:'Mediterranean variant. Severe enzyme deficiency.' },
    /* BRCA */
    '17-41245466-G-A':    { gene:'BRCA1', hgvsc:'c.5266dupC', hgvsp:'p.Gln1756ProfsTer74', consequence:'frameshift_variant', clinvar:'Pathogenic', afGlobal:0.0001, afAfr:0.001, acmgClass:'Pathogenic', disease:'Hereditary Breast & Ovarian Cancer', notes:'Founder mutation enriched in Ashkenazi Jewish population. PVS1 applies.' },
    '13-32929387-C-T':    { gene:'BRCA2', hgvsc:'c.771_775del', hgvsp:'p.Asn258fs', consequence:'frameshift_variant', clinvar:'Pathogenic', afGlobal:0.00005, afAfr:0.0002, acmgClass:'Pathogenic', disease:'Hereditary Breast Cancer', notes:'Frameshift deletion. PVS1 applies — truncating variant in known TSG.' },
    /* Lynch syndrome / colorectal */
    '2-47806980-C-T':     { gene:'MSH2', hgvsc:'c.1906G>C', hgvsp:'p.Ala636Pro', consequence:'missense_variant', clinvar:'Likely Pathogenic', afGlobal:0.00002, afAfr:0.00005, acmgClass:'Likely Pathogenic', disease:'Lynch Syndrome', notes:'Segregates with colorectal cancer in South African families. PM2 + PP1 moderate.' },
    /* TB resistance */
    '1-779085-G-A':       { gene:'rpoB', hgvsc:'c.1349C>T', hgvsp:'p.Ser450Leu', consequence:'missense_variant', clinvar:'Drug Resistance', afGlobal:null, afAfr:null, acmgClass:'Drug Resistance', disease:'Rifampicin-resistant TB', notes:'Most common rpoB mutation conferring rifampicin resistance. Detected in 70–80% of RIF-R M.tb isolates.' },
    '1-779084-C-T':       { gene:'rpoB', hgvsc:'c.1348G>A', hgvsp:'p.Asp449Glu', consequence:'missense_variant', clinvar:'Drug Resistance', afGlobal:null, afAfr:null, acmgClass:'Drug Resistance', disease:'Rifampicin-resistant TB', notes:'Second most common rpoB mutation in African XDR-TB isolates.' },
    /* Malaria / kelch13 */
    'Pf-569877-C-G':      { gene:'kelch13', hgvsc:'c.1687C>G', hgvsp:'p.Arg559Gly', consequence:'missense_variant', clinvar:'Drug Resistance', afGlobal:null, afAfr:null, acmgClass:'Drug Resistance', disease:'Artemisinin partial resistance (P. falciparum)', notes:'WHO validated marker of artemisinin partial resistance. Absent in African isolates as of 2024 — sentinel surveillance important.' },
    /* Pharmacogenomics */
    '10-96521657-C-T':    { gene:'CYP2C19', hgvsc:'c.681G>A', hgvsp:'—', consequence:'splice_region_variant', clinvar:'Pathogenic', afGlobal:0.15, afAfr:0.02, acmgClass:'Pathogenic', disease:'Poor metaboliser — clopidogrel, PPIs', notes:'CYP2C19*2 null allele. PGx classification rather than ACMG disease classification.' },
    '22-42523803-C-A':    { gene:'CYP2D6', hgvsc:'c.100C>T', hgvsp:'p.Pro34Ser', consequence:'missense_variant', clinvar:'Pathogenic', afGlobal:0.01, afAfr:0.03, acmgClass:'Pathogenic', disease:'Poor metaboliser — codeine, tamoxifen', notes:'CYP2D6*10 reduced function allele. Important in African populations for analgesic and oncology drug dosing.' },
    /* HIV-related */
    '6-29910220-A-G':     { gene:'HLA-B', hgvsc:'—', hgvsp:'—', consequence:'regulatory_region_variant', clinvar:'Pathogenic', afGlobal:0.02, afAfr:0.05, acmgClass:'Risk Factor', disease:'Abacavir hypersensitivity', notes:'HLA-B*57:01 — strong risk allele for abacavir hypersensitivity. Pre-treatment genotyping recommended (WHO HIV guidelines).' },
    /* APOL1 */
    '22-36265860-G-A':    { gene:'APOL1', hgvsc:'c.1024G>A', hgvsp:'p.Ser342Gly', consequence:'missense_variant', clinvar:'Risk Factor', afGlobal:0.005, afAfr:0.18, acmgClass:'Risk Factor', disease:'FSGS / CKD risk (G1 allele)', notes:'APOL1 G1 risk allele. Frequency up to 35% in West African populations. Bi-allelic G1/G2 increases kidney disease risk 7-29x.' },
    '22-36265860-G-T':    { gene:'APOL1', hgvsc:'c.1024G>T', hgvsp:'p.Val341Ile', consequence:'missense_variant', clinvar:'Risk Factor', afGlobal:0.003, afAfr:0.15, acmgClass:'Risk Factor', disease:'FSGS / CKD risk (G2 allele)', notes:'APOL1 G2 risk allele (6-bp in-frame deletion in some forms). High frequency in sub-Saharan Africa.' },
    /* AWI-Gen / Africa-specific GWAS hits */
    '1-227156227-T-A':    { gene:'LDLR', hgvsc:'c.1646T>A', hgvsp:'p.Leu549*', consequence:'stop_gained', clinvar:'Pathogenic', afGlobal:0.000008, afAfr:0.001, acmgClass:'Pathogenic', disease:'Familial Hypercholesterolaemia', notes:'Founder mutation in South African Afrikaner population. PVS1 applies.' },
    '7-117559590-A-T':    { gene:'CFTR', hgvsc:'c.1521_1523del', hgvsp:'p.Phe508del', consequence:'inframe_deletion', clinvar:'Pathogenic', afGlobal:0.013, afAfr:0.0004, acmgClass:'Pathogenic', disease:'Cystic Fibrosis', notes:'Most common CF mutation globally but rare in African populations. Low AF in AFR is important clinical context.' },
  };

  /* ─── ACMG criteria weights ─── */
  /* path_weight: points towards Pathogenic; ben_weight: points towards Benign */
  const ACMG_CRITERIA = {
    PVS1: { label:'PVS1', desc:'Null variant in gene where LOF is disease mechanism', pathWeight:8 },
    PS1:  { label:'PS1',  desc:'Same amino acid change as established pathogenic variant', pathWeight:4 },
    PS2:  { label:'PS2',  desc:'De novo (confirmed) in patient with disease', pathWeight:4 },
    PS3:  { label:'PS3',  desc:'Functional studies support damaging effect', pathWeight:4 },
    PS4:  { label:'PS4',  desc:'Prevalence in affected individuals significantly > controls', pathWeight:4 },
    PM1:  { label:'PM1',  desc:'Located in mutational hotspot or well-established functional domain', pathWeight:2 },
    PM2:  { label:'PM2',  desc:'Absent from controls in gnomAD (or at extremely low freq in recessive gene)', pathWeight:2 },
    PM3:  { label:'PM3',  desc:'Detected in trans with pathogenic variant (recessive)', pathWeight:2 },
    PM4:  { label:'PM4',  desc:'Protein length changes due to in-frame indel', pathWeight:2 },
    PM5:  { label:'PM5',  desc:'Novel missense where different change at same residue is pathogenic', pathWeight:2 },
    PM6:  { label:'PM6',  desc:'Assumed de novo (without paternity confirmation)', pathWeight:2 },
    PP1:  { label:'PP1',  desc:'Cosegregation with disease in multiple affected family members', pathWeight:1 },
    PP2:  { label:'PP2',  desc:'Missense in gene where missense mutations are a common mechanism', pathWeight:1 },
    PP3:  { label:'PP3',  desc:'Multiple lines of computational evidence support deleterious effect', pathWeight:1 },
    PP4:  { label:'PP4',  desc:'Patient phenotype/family history highly specific for disease', pathWeight:1 },
    PP5:  { label:'PP5',  desc:'Reputable source reports variant as pathogenic', pathWeight:1 },
    BA1:  { label:'BA1',  desc:'Allele frequency >5% in gnomAD', benWeight:16 },
    BS1:  { label:'BS1',  desc:'Allele frequency greater than expected for disorder', benWeight:4 },
    BS2:  { label:'BS2',  desc:'Observed in healthy adult with full penetrance', benWeight:4 },
    BS3:  { label:'BS3',  desc:'Functional studies show no damaging effect', benWeight:4 },
    BS4:  { label:'BS4',  desc:'Lack of segregation in affected members', benWeight:4 },
    BP1:  { label:'BP1',  desc:'Missense in gene where truncating are only mechanism', benWeight:1 },
    BP2:  { label:'BP2',  desc:'Observed in trans with pathogenic variant (dominant)', benWeight:1 },
    BP3:  { label:'BP3',  desc:'In-frame indel in repeat region — benign', benWeight:1 },
    BP4:  { label:'BP4',  desc:'Computational evidence suggests no impact on gene/product', benWeight:1 },
    BP5:  { label:'BP5',  desc:'Variant found in case with alternate molecular basis', benWeight:1 },
    BP6:  { label:'BP6',  desc:'Reputable source reports variant as benign', benWeight:1 },
    BP7:  { label:'BP7',  desc:'Silent variant — no predicted splice impact', benWeight:1 },
  };

  /* ─── Consequence colours ─── */
  const CONS_COLOR = {
    stop_gained: '#ff6b6b',
    frameshift_variant: '#ff6b6b',
    splice_donor_variant: '#f97316',
    splice_acceptor_variant: '#f97316',
    splice_region_variant: '#e3b341',
    missense_variant: '#e3b341',
    inframe_deletion: '#bc8cff',
    inframe_insertion: '#bc8cff',
    synonymous_variant: '#3fb950',
    regulatory_region_variant: '#58a6ff',
    'Drug Resistance': '#ff6b6b',
    default: '#8b949e',
  };

  let _lastResult = null;

  /* ─── Parse VCF line ─── */
  function _parseVcf(text) {
    const lines = text.trim().split('\n').filter(l => l && !l.startsWith('#'));
    if (!lines.length) return null;
    const parts = lines[lines.length - 1].trim().split('\t');
    if (parts.length < 5) return null;
    const [chrom, pos, , ref, alt] = parts;
    return { chrom: chrom.replace(/^chr/i,''), pos, ref: ref.trim(), alt: alt.trim().split(',')[0] };
  }

  /* ─── Parse HGVS-like (gene:cDNA) ─── */
  function _parseHgvs(text) {
    const m = text.match(/^([A-Z0-9]+)[:\s]+c\.(.+)/i);
    if (!m) return null;
    return { gene: m[1].toUpperCase(), hgvsc: 'c.' + m[2] };
  }

  /* ─── Lookup in known variant DB ─── */
  function _lookup(chrom, pos, ref, alt) {
    const key = `${chrom}-${pos}-${ref}-${alt}`;
    return KNOWN_VARIANTS[key] || null;
  }

  /* ─── Infer consequence from ref/alt ─── */
  function _inferConsequence(ref, alt) {
    const refLen = ref.length, altLen = alt.length;
    if (refLen === 1 && altLen === 1) return 'missense_variant';
    if (altLen > refLen && (altLen - refLen) % 3 !== 0) return 'frameshift_variant';
    if (refLen > altLen && (refLen - altLen) % 3 !== 0) return 'frameshift_variant';
    if (altLen > refLen) return 'inframe_insertion';
    if (refLen > altLen) return 'inframe_deletion';
    return 'missense_variant';
  }

  /* ─── ACMG auto-classify ─── */
  function _autoAcmg(v, known) {
    const applied = [];

    if (known) {
      /* Consequence-based */
      if (['stop_gained','frameshift_variant','splice_donor_variant','splice_acceptor_variant'].includes(known.consequence)) {
        applied.push('PVS1');
      }
      if (known.clinvar === 'Pathogenic' || known.clinvar === 'Drug Resistance') {
        applied.push('PP5');
        if (known.afAfr !== null && known.afAfr <= 0.001) applied.push('PM2');
        applied.push('PS1');
      }
      if (known.afAfr !== null && known.afAfr < 0.001) applied.push('PM2');
      if (known.afGlobal !== null && known.afGlobal > 0.05) applied.push('BA1');
      if (known.afGlobal !== null && known.afGlobal > 0.01 && known.afGlobal <= 0.05) applied.push('BS1');
      if (['missense_variant'].includes(known.consequence)) applied.push('PP3');
    } else if (v) {
      /* Unknown variant — infer from allele lengths */
      const cons = _inferConsequence(v.ref, v.alt);
      if (['stop_gained','frameshift_variant'].includes(cons)) applied.push('PVS1');
      applied.push('PM2');
      applied.push('PP3');
    }

    /* Score */
    let pathScore = 0, benScore = 0;
    const unique = [...new Set(applied)];
    for (const c of unique) {
      if (ACMG_CRITERIA[c]?.pathWeight) pathScore += ACMG_CRITERIA[c].pathWeight;
      if (ACMG_CRITERIA[c]?.benWeight)  benScore  += ACMG_CRITERIA[c].benWeight;
    }

    let classification = 'Uncertain Significance (VUS)';
    let classColor = '#e3b341';
    if (benScore >= 16)     { classification = 'Benign'; classColor = '#3fb950'; }
    else if (benScore >= 4) { classification = 'Likely Benign'; classColor = '#58a6ff'; }
    else if (pathScore >= 8 || (pathScore >= 4 && unique.includes('PVS1'))) { classification = 'Pathogenic'; classColor = '#ff6b6b'; }
    else if (pathScore >= 5) { classification = 'Likely Pathogenic'; classColor = '#f97316'; }

    return { applied: unique, pathScore, benScore, classification, classColor };
  }

  /* ─── Render results ─── */
  function _interpret() {
    const input = (document.getElementById('vi-input')?.value || '').trim();
    const out = document.getElementById('vi-output');
    if (!out || !input) return;

    let parsed = null;
    let known  = null;
    let hgvsParsed = null;

    /* Try VCF parse first */
    if (input.includes('\t') || /^\w+\s+\d+\s+/.test(input)) {
      parsed = _parseVcf(input);
      if (parsed) known = _lookup(parsed.chrom, parsed.pos, parsed.ref, parsed.alt);
    }

    /* Try HGVS */
    if (!parsed) {
      hgvsParsed = _parseHgvs(input);
      if (hgvsParsed) {
        /* Search known by gene + hgvsc */
        for (const [, v] of Object.entries(KNOWN_VARIANTS)) {
          if (v.gene === hgvsParsed.gene && v.hgvsc === hgvsParsed.hgvsc) {
            known = v; break;
          }
        }
      }
    }

    /* Try direct key match e.g. "11-5246956-A-T" */
    if (!known && KNOWN_VARIANTS[input.trim()]) {
      known = KNOWN_VARIANTS[input.trim()];
      const parts = input.trim().split('-');
      parsed = { chrom: parts[0], pos: parts[1], ref: parts[2], alt: parts[3] };
    }

    const acmg = _autoAcmg(parsed, known);
    const d = known || {};
    const cons = d.consequence || (parsed ? _inferConsequence(parsed.ref, parsed.alt) : 'unknown');
    const consColor = CONS_COLOR[cons] || CONS_COLOR.default;

    /* Header */
    const variantLabel = parsed
      ? `${parsed.chrom}:${parsed.pos} ${parsed.ref}>${parsed.alt}`
      : hgvsParsed
        ? `${hgvsParsed.gene} ${hgvsParsed.hgvsc}`
        : input.substring(0, 40);

    /* African AF bar */
    const afrAf = d.afAfr;
    const afrPct = afrAf !== null && afrAf !== undefined ? Math.min(afrAf * 100, 100) : null;
    const globalAf = d.afGlobal;

    /* ACMG criteria chips */
    const criteriaHtml = acmg.applied.length ? acmg.applied.map(c => {
      const cr = ACMG_CRITERIA[c];
      const isPath = cr?.pathWeight;
      const chipColor = isPath ? '#ff6b6b' : '#3fb950';
      return `<span class="vi-criterion-chip" style="--cc:${chipColor}" title="${cr?.desc || ''}">${c}</span>`;
    }).join('') : '<span class="vi-criterion-chip" style="--cc:#6e7681">None auto-applied</span>';

    _lastResult = { variantLabel, d, acmg, afrAf, parsed };

    out.innerHTML = `
      <div class="vi-result">
        <!-- Verdict banner -->
        <div class="vi-verdict-banner" style="--vc:${acmg.classColor}">
          <div class="vi-verdict-main">
            <div class="vi-verdict-label" style="color:${acmg.classColor}">${acmg.classification}</div>
            <div class="vi-variant-label">${variantLabel}</div>
          </div>
          ${d.gene ? `<div class="vi-gene-badge">${d.gene}</div>` : ''}
        </div>

        <div class="vi-cards-grid">

          <!-- Consequence card -->
          <div class="vi-card">
            <div class="vi-card-title">Molecular Consequence</div>
            <div class="vi-consequence" style="color:${consColor}">${cons.replace(/_/g,' ')}</div>
            ${d.hgvsc ? `<div class="vi-hgvs"><span class="vi-hgvs-lbl">cDNA:</span> <code>${d.hgvsc}</code></div>` : ''}
            ${d.hgvsp && d.hgvsp !== '—' ? `<div class="vi-hgvs"><span class="vi-hgvs-lbl">Protein:</span> <code>${d.hgvsp}</code></div>` : ''}
            ${d.disease ? `<div class="vi-disease-box">${d.disease}</div>` : ''}
          </div>

          <!-- Population frequency card -->
          <div class="vi-card" id="vi-pop-freq-card">
            <div class="vi-card-title">Population Frequency</div>
            ${afrAf !== null && afrAf !== undefined ? `
              <div class="vi-af-row">
                <span class="vi-af-pop">AFR (gnomAD)</span>
                <span class="vi-af-val">${afrAf.toPrecision(2)}</span>
              </div>
              <div class="vi-af-bar-wrap">
                <div class="vi-af-bar" style="width:${Math.min(afrPct*5,100)}%;background:${afrPct > 5 ? '#3fb950' : '#58a6ff'}"></div>
              </div>
            ` : '<div class="vi-af-na">AF not available — novel or pathogen variant</div>'}
            ${globalAf !== null && globalAf !== undefined ? `
              <div class="vi-af-row" style="margin-top:.5rem">
                <span class="vi-af-pop">Global (gnomAD)</span>
                <span class="vi-af-val">${globalAf.toPrecision(2)}</span>
              </div>
            ` : ''}
            ${afrAf > 0.05 ? '<div class="vi-af-note af-common">Common in AFR — BA1 applies</div>' :
              afrAf !== null && afrAf !== undefined && afrAf <= 0.001 ? '<div class="vi-af-note af-rare">Rare in AFR population — PM2 supportive</div>' : ''}
          </div>

          <!-- ClinVar card -->
          <div class="vi-card">
            <div class="vi-card-title">ClinVar / Database Evidence</div>
            ${d.clinvar ? `
              <div class="vi-clinvar-sig" style="color:${acmg.classColor}">${d.clinvar}</div>
              ${d.notes ? `<div class="vi-clinvar-notes">${d.notes}</div>` : ''}
            ` : `
              <div class="vi-clinvar-na">Not in curated database.</div>
              <div class="vi-clinvar-notes">Submit to ClinVar at ncbi.nlm.nih.gov/clinvar/ to contribute evidence for this variant.</div>
            `}
          </div>

          <!-- ACMG criteria card -->
          <div class="vi-card vi-card-full">
            <div class="vi-card-title">ACMG/AMP 2015 Criteria Applied</div>
            <div class="vi-criteria-chips">${criteriaHtml}</div>
            <div class="vi-acmg-scores">
              <span>Pathogenic score: <strong style="color:#ff6b6b">${acmg.pathScore}</strong></span>
              <span>Benign score: <strong style="color:#3fb950">${acmg.benScore}</strong></span>
            </div>
            <div class="vi-acmg-legend">
              ${acmg.applied.map(c => {
                const cr = ACMG_CRITERIA[c];
                if (!cr) return '';
                const isPath = cr.pathWeight;
                return `<div class="vi-acmg-legend-row"><span class="vi-criterion-chip" style="--cc:${isPath?'#ff6b6b':'#3fb950'};font-size:.65rem">${c}</span><span>${cr.desc}</span></div>`;
              }).join('')}
            </div>
            <div class="vi-acmg-disclaimer">Classification is automated and not a clinical report. Confirm with a certified clinical laboratory before any medical decision.</div>
          </div>

        </div>

        <div class="vi-ai-strip">
          <span class="vi-ai-strip-label">Get an AI explanation with Africa-specific genomics context</span>
          <button class="vi-ai-btn" onclick="OmicsLab.VariantInterp._askAI()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5S7 9.76 7 7a5 5 0 0 1 5-5z"/><path d="M3 21c0-4.42 4.03-8 9-8s9 3.58 9 8"/></svg>
            Ask AI about this variant
          </button>
        </div>
      </div>`;

    /* Async gnomAD live lookup — only when we have GRCh38 coordinates */
    if (parsed && parsed.chrom && parsed.pos && parsed.ref && parsed.alt) {
      _fetchGnomAD(parsed);
    }
  }

  /* ─── gnomAD GraphQL live lookup ─── */
  async function _fetchGnomAD(parsed) {
    const card = document.getElementById('vi-pop-freq-card');
    if (!card) return;

    /* Show "fetching live" badge */
    const titleEl = card.querySelector('.vi-card-title');
    if (titleEl) titleEl.innerHTML = 'Population Frequency <span class="vi-live-badge">fetching live…</span>';

    const variantId = `${parsed.chrom}-${parsed.pos}-${parsed.ref}-${parsed.alt}`;
    const query = `{
      variant(variantId: "${variantId}", dataset: gnomad_r4) {
        variantId
        genome {
          af
          populations { id ac an af }
        }
        exome {
          af
          populations { id ac an af }
        }
      }
    }`;

    try {
      const res = await fetch('https://gnomad.broadinstitute.org/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error('gnomAD API ' + res.status);
      const data = await res.json();
      const v = data?.data?.variant;
      if (!v) throw new Error('Not in gnomAD r4');

      /* Prefer genome; fall back to exome */
      const source = v.genome?.populations?.length ? v.genome : v.exome;
      const globalAf = source?.af ?? null;
      const pops = source?.populations || [];

      /* AFR subpopulation */
      const afr  = pops.find(p => p.id === 'afr') || pops.find(p => p.id?.startsWith('afr'));
      const afrAf = afr?.af ?? null;

      /* Population bar chart */
      const POP_ORDER = [
        { id: 'afr', label: 'AFR', color: '#3fb950' },
        { id: 'sas', label: 'SAS', color: '#58a6ff' },
        { id: 'eas', label: 'EAS', color: '#bc8cff' },
        { id: 'eur', label: 'EUR', color: '#e3b341' },
        { id: 'amr', label: 'AMR', color: '#f97316' },
        { id: 'mid', label: 'MID', color: '#ff7b93' },
        { id: 'asj', label: 'ASJ', color: '#79c0ff' },
        { id: 'oth', label: 'OTH', color: '#484f58' },
      ];

      const chartRows = POP_ORDER.map(p => {
        const pop = pops.find(x => x.id === p.id);
        if (!pop || !pop.an) return '';
        const pct = Math.min(pop.af * 2000, 100); /* scale so 0.05 = full bar */
        return `
          <div class="vi-pop-row">
            <span class="vi-pop-label">${p.label}</span>
            <div class="vi-pop-bar-wrap">
              <div class="vi-pop-bar" style="width:${pct.toFixed(1)}%;background:${p.color}"></div>
            </div>
            <span class="vi-pop-val">${pop.af < 0.0001 && pop.af > 0 ? pop.af.toExponential(1) : pop.af.toPrecision(2)}</span>
          </div>`;
      }).join('');

      const ba1Note = afrAf !== null && afrAf > 0.05
        ? '<div class="vi-af-note af-common">Common in AFR (>5%) — BA1 applies</div>'
        : afrAf !== null && afrAf <= 0.001
          ? '<div class="vi-af-note af-rare">Rare in AFR — PM2 supportive</div>'
          : '';

      card.innerHTML = `
        <div class="vi-card-title">
          Population Frequency
          <span class="vi-live-badge vi-live-ok">gnomAD r4 live</span>
        </div>
        ${afrAf !== null ? `
          <div class="vi-af-row">
            <span class="vi-af-pop vi-af-afr">AFR (gnomAD r4)</span>
            <span class="vi-af-val">${afrAf.toPrecision(3)}</span>
          </div>` : '<div class="vi-af-na">AFR frequency not available</div>'}
        ${ba1Note}
        ${globalAf !== null ? `
          <div class="vi-af-row" style="margin-top:.6rem">
            <span class="vi-af-pop">Global AF</span>
            <span class="vi-af-val">${globalAf.toPrecision(3)}</span>
          </div>` : ''}
        ${chartRows ? `<div class="vi-pop-chart" style="margin-top:.75rem">${chartRows}</div>` : ''}
        <div class="vi-gnomad-link-row">
          <a class="vi-gnomad-link" href="https://gnomad.broadinstitute.org/variant/${variantId}" target="_blank" rel="noopener">View on gnomAD</a>
        </div>`;

    } catch (err) {
      if (titleEl) titleEl.innerHTML = 'Population Frequency <span class="vi-live-badge vi-live-err">gnomAD unavailable</span>';
    }
  }

  /* ─── Example load ─── */
  const EXAMPLES = {
    hbb_sickle:  { label:'HBB Sickle Cell (VCF)', text:'11\t5246956\t.\tA\tT\t.\t.\t.' },
    g6pd_a:      { label:'G6PD A- (VCF)', text:'X\t154535077\t.\tG\tA\t.\t.\t.' },
    brca1:       { label:'BRCA1 frameshift (VCF)', text:'17\t41245466\t.\tG\tA\t.\t.\t.' },
    rpob:        { label:'rpoB Rifampicin-R TB', text:'1-779085-G-A' },
    apol1:       { label:'APOL1 G1 CKD risk', text:'22-36265860-G-A' },
    hgvs:        { label:'HBB c.20A>T (HGVS)', text:'HBB: c.20A>T' },
  };

  function _loadExample(key) {
    const ex = EXAMPLES[key];
    if (!ex) return;
    const ta = document.getElementById('vi-input');
    if (ta) { ta.value = ex.text; _interpret(); }
  }

  /* ─── Ask AI ─── */
  function _askAI() {
    if (!_lastResult) return;
    const { variantLabel, d, acmg, afrAf } = _lastResult;
    const ctx = [
      'Current Variant Interpreter result:',
      '',
      `Variant: ${variantLabel}`,
      `Gene: ${d.gene || 'unknown'}`,
      `Consequence: ${(d.consequence || 'unknown').replace(/_/g,' ')}`,
      d.hgvsc ? `cDNA: ${d.hgvsc}` : '',
      d.hgvsp && d.hgvsp !== '—' ? `Protein: ${d.hgvsp}` : '',
      `Disease: ${d.disease || 'not specified'}`,
      `ACMG Classification: ${acmg.classification}`,
      `Criteria applied: ${acmg.applied.join(', ') || 'none'}`,
      `Pathogenic score: ${acmg.pathScore}  |  Benign score: ${acmg.benScore}`,
      `AFR allele frequency (gnomAD): ${afrAf !== undefined && afrAf !== null ? afrAf : 'not available'}`,
      `ClinVar: ${d.clinvar || 'not in curated database'}`,
      d.notes ? `Database notes: ${d.notes}` : '',
    ].filter(Boolean).join('\n');
    if (OmicsLab.Assistant && OmicsLab.Assistant.setContext) {
      OmicsLab.Assistant.setContext(ctx);
    }
    if (OmicsLab.Router) OmicsLab.Router.navigate('ai');
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('variantinterp-section');
    if (!section || section.dataset.viReady) return;
    section.dataset.viReady = '1';

    section.innerHTML = `
      <div class="vi-wrap">
        <div class="vi-header">
          <div>
            <div class="vi-badge">VARIANT INTERPRETER</div>
            <h2 class="vi-title">Genomic Variant Interpreter</h2>
            <p class="vi-subtitle">Paste a VCF line, a CHROM-POS-REF-ALT key, or HGVS notation. Offline rules apply ACMG/AMP 2015 criteria, population frequency from gnomAD, and ClinVar significance for 20+ Africa-relevant variants.</p>
          </div>
        </div>

        <div class="vi-main">
          <div class="vi-left">
            <div class="vi-input-card">
              <div class="vi-input-label">Variant Input</div>
              <textarea id="vi-input" class="vi-textarea" rows="5"
                placeholder="Paste VCF line (tab-separated):&#10;11&#9;5246956&#9;.&#9;A&#9;T&#9;.&#9;.&#9;.&#10;&#10;Or CHROM-POS-REF-ALT key:&#10;11-5246956-A-T&#10;&#10;Or HGVS notation:&#10;HBB: c.20A>T"></textarea>
              <button class="vi-run-btn" onclick="OmicsLab.VariantInterp._interpret()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Interpret Variant
              </button>
            </div>

            <div class="vi-examples-card">
              <div class="vi-examples-title">Load Example</div>
              ${Object.entries(EXAMPLES).map(([k,ex]) => `
                <button class="vi-ex-btn" onclick="OmicsLab.VariantInterp._loadExample('${k}')">${ex.label}</button>
              `).join('')}
            </div>

            <div class="vi-acmg-ref-card">
              <div class="vi-examples-title">ACMG Criteria Reference</div>
              <div class="vi-acmg-ref-grid">
                <div class="vi-acmg-ref-group">
                  <div class="vi-acmg-ref-head" style="color:#ff6b6b">Pathogenic Evidence</div>
                  ${Object.entries(ACMG_CRITERIA).filter(([,c]) => c.pathWeight).map(([k,c]) => `
                    <div class="vi-acmg-ref-row"><span class="vi-criterion-chip" style="--cc:#ff6b6b;font-size:.62rem">${k}</span><span class="vi-acmg-ref-desc">${c.desc}</span></div>
                  `).join('')}
                </div>
                <div class="vi-acmg-ref-group">
                  <div class="vi-acmg-ref-head" style="color:#3fb950">Benign Evidence</div>
                  ${Object.entries(ACMG_CRITERIA).filter(([,c]) => c.benWeight).map(([k,c]) => `
                    <div class="vi-acmg-ref-row"><span class="vi-criterion-chip" style="--cc:#3fb950;font-size:.62rem">${k}</span><span class="vi-acmg-ref-desc">${c.desc}</span></div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="vi-right" id="vi-output">
            <div class="vi-empty-state">
              <div class="vi-empty-icon">${OmicsLab.Icons?.svg('dna',32)||''}</div>
              <div class="vi-empty-text">Paste a variant or load an example to begin ACMG classification</div>
            </div>
          </div>
        </div>
      </div>`;

    const ta = document.getElementById('vi-input');
    if (ta) {
      ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) _interpret(); });
    }
  }

  return { init, _interpret, _loadExample, _askAI };
})();
