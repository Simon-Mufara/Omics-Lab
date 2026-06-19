/* ═══════════════════════════════════════════════════════════════
   OmicsLab BioNLP — Prompt 58
   ─ Client-side biomedical entity recognition
   ─ Genes, diseases, variants, organisms, drugs, accessions
   ─ Entity highlighting in pasted text
   ─ Click gene → Gene Lookup, click variant → Variant Interpreter
   ─ Fully offline — no API needed
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.BioNLP = (function () {

  /* ─── Entity dictionaries ─── */

  /* Key human disease genes (Africa-relevant + canonical) */
  const GENES = new Set([
    'HBB','HBA1','HBA2','G6PD','APOL1','BRCA1','BRCA2','TP53','KRAS','EGFR',
    'BRAF','PIK3CA','PTEN','RB1','APC','MLH1','MSH2','VHL','NF1','NF2',
    'CFTR','HEXA','HEXB','LMNA','MYH7','MYBPC3','SCN5A','KCNQ1','KCNH2',
    'RYR2','PKD1','PKD2','TSC1','TSC2','FBN1','FBN2','COL3A1','TGFBR2',
    'CYP2D6','CYP3A4','CYP2C9','CYP2C19','CYP1A2','UGT1A1','DPYD','TPMT',
    'SLCO1B1','VKORC1','F5','F2','PROC','PROS1','SERPINC1',
    'HLA-A','HLA-B','HLA-C','HLA-DRB1','HLA-DQB1','HLA-DPB1',
    'TNF','IL6','IL1B','IL10','IFNG','TLR4','TLR9','NOD2','CARD9',
    'LDLR','APOE','APOB','PCSK9','LPA','CETP','ABCA1',
    'ACE','AGT','AGTR1','ADD1','SLC12A3','CLCNKB',
    'INS','GCK','HNF1A','HNF4A','KCNJ11','ABCC8','TCF7L2','PPARG',
    'BRIP1','PALB2','RAD51C','RAD51D','ATM','CDH1','STK11',
    'MECP2','FMR1','DMD','SMN1','SMN2','HTT','ATXN1','ATXN2','ATXN3',
    'SNCA','LRRK2','PINK1','PRKN','DJ1','GBA','MAPT',
    'APP','PSEN1','PSEN2','APOE','TREM2','CLU','CR1',
    'MRC1','FCGR2B','DARC','FUT2','CR1',
    /* Pathogen genes */
    'rpoB','katG','inhA','embB','rpoC','pfkelch13','crt','dhfr','dhps','pfmdr1',
    'gyrA','gyrB','parC','parE','mecA','vanA','vanB','blaKPC','blaNDM',
  ]);

  /* Common genomic diseases */
  const DISEASES = new Set([
    'sickle cell disease','sickle cell anaemia','sickle cell anemia',
    'thalassemia','thalassaemia','alpha thalassemia','beta thalassemia',
    'malaria','falciparum malaria','vivax malaria','severe malaria','cerebral malaria',
    'tuberculosis','TB','multi-drug resistant TB','MDR-TB','XDR-TB',
    'HIV','HIV-1','HIV-2','AIDS','HIV/AIDS',
    'G6PD deficiency','glucose-6-phosphate dehydrogenase deficiency',
    'chronic kidney disease','CKD','FSGS','nephrotic syndrome',
    'hypertrophic cardiomyopathy','HCM','dilated cardiomyopathy','DCM',
    'breast cancer','ovarian cancer','colorectal cancer','lung cancer',
    'prostate cancer','cervical cancer','Kaposi sarcoma',
    'diabetes mellitus','type 2 diabetes','T2D','gestational diabetes',
    'hypertension','essential hypertension',
    'Lassa fever','Ebola','Marburg','Mpox','monkeypox',
    'COVID-19','SARS-CoV-2','coronavirus',
    'trypanosomiasis','sleeping sickness','leishmaniasis','schistosomiasis',
    'lymphoma','Burkitt lymphoma','Hodgkin lymphoma',
    'meningitis','meningococcal disease','pneumococcal disease',
    'preeclampsia','eclampsia','maternal mortality',
    'autism spectrum disorder','ASD','intellectual disability',
    'Huntington disease','Parkinson disease','Alzheimer disease',
    'cystic fibrosis','spinal muscular atrophy','Duchenne muscular dystrophy',
  ]);

  /* Research organisms */
  const ORGANISMS = new Set([
    'Plasmodium falciparum','P. falciparum','P falciparum',
    'Plasmodium vivax','P. vivax',
    'Mycobacterium tuberculosis','M. tuberculosis','M tuberculosis','Mtb',
    'HIV-1','HIV-2',
    'SARS-CoV-2','SARS-CoV','MERS-CoV',
    'Trypanosoma brucei','Trypanosoma cruzi',
    'Leishmania donovani','Leishmania major',
    'Schistosoma mansoni','Schistosoma haematobium',
    'Ebola virus','Lassa virus','Marburg virus',
    'Homo sapiens','Mus musculus','Rattus norvegicus',
    'Danio rerio','Drosophila melanogaster','Caenorhabditis elegans',
    'Saccharomyces cerevisiae','Escherichia coli','E. coli',
    'Klebsiella pneumoniae','Staphylococcus aureus','MRSA',
    'Vibrio cholerae','Salmonella typhi','Neisseria meningitidis',
  ]);

  /* Africa-relevant drugs */
  const DRUGS = new Set([
    'artemisinin','artesunate','artemether','lumefantrine','chloroquine','mefloquine',
    'quinine','primaquine','atovaquone','proguanil',
    'rifampicin','isoniazid','pyrazinamide','ethambutol','streptomycin',
    'bedaquiline','delamanid','linezolid','clofazimine',
    'tenofovir','emtricitabine','efavirenz','dolutegravir','lopinavir','ritonavir',
    'nevirapine','abacavir','zidovudine','lamivudine',
    'hydroxyurea','voxelotor','crizanlizumab',
    'metformin','glibenclamide','insulin','pioglitazone',
    'amlodipine','lisinopril','enalapril','losartan','hydrochlorothiazide',
    'ivermectin','praziquantel','albendazole','mebendazole',
  ]);

  /* Regex patterns */
  const PATTERNS = {
    variant_hgvs:   /\b(NM_\d+\.?\d*|NP_\d+\.?\d*|NG_\d+\.?\d*|NC_\d+\.?\d*)?[c]\.\d+[+\-]?\d*[A-Z]>[A-Z]\b/g,
    variant_prot:   /\bp\.[A-Z][a-z]{2}\d+[A-Z][a-z]{2}\b/g,
    variant_vcf:    /\b(?:chr)?(?:\d{1,2}|X|Y|MT)\s*:\s*\d+\s*[A-Z]+\s*>\s*[A-Z]+\b/gi,
    snp:            /\brs\d{4,}\b/g,
    sra_acc:        /\b(?:SRR|SRP|SRX|SRS|SRA|ERR|ERP|ERX|ERS|DRR|DRP|DRX)\d{5,}\b/g,
    geo_acc:        /\bGSE\d{4,}|GSM\d{5,}|GDS\d{4,}\b/g,
    uniprot_acc:    /\b[A-NR-Z][0-9][A-Z][A-Z0-9]{2}[0-9]|[OPQ][0-9][A-Z0-9]{3}[0-9]\b/g,
    doi:            /\b10\.\d{4,}\/\S+/g,
    ensembl:        /\bENS[GT]\d{11}\b/g,
    pvalue:         /\bp\s*[<=>]\s*\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/gi,
    affiliation_af: new RegExp('\\b(' + [
      'Nigeria','Kenya','South Africa','Ethiopia','Ghana','Uganda','Tanzania',
      'Rwanda','Zambia','Zimbabwe','Malawi','Cameroon','Senegal','Côte d\'Ivoire',
      'Mali','Burkina Faso','Niger','Somalia','Sudan','South Sudan','DRC',
      'Democratic Republic','Mozambique','Madagascar','Angola','Botswana',
      'Namibia','Lesotho','Eswatini','Swaziland','Eritrea','Djibouti','Comoros',
      'Sierra Leone','Liberia','Guinea','Gambia','Togo','Benin','African',
      'H3Africa','H3ABioNet','AWI-Gen','APCDR','REDD','NHLS','SAMRC',
    ].join('|') + ')\\b', 'gi'),
  };

  let _lastText   = '';
  let _lastResult = null;

  /* ─── Main extraction ─── */
  function _extract(text) {
    const entities = {
      genes:        new Set(),
      diseases:     new Set(),
      organisms:    new Set(),
      drugs:        new Set(),
      variants:     [],
      snps:         [],
      accessions:   [],
      africa_terms: [],
      stats:        [],
    };

    /* Word-level matching for genes/diseases/organisms/drugs */
    const words   = text.split(/\s+/);
    const bigrams = words.map((w, i) => [w, words[i+1] || ''].join(' '));
    const trigrams = words.map((w, i) => [w, words[i+1] || '', words[i+2] || ''].join(' '));
    const quads   = words.map((w, i) => [w, words[i+1]||'', words[i+2]||'', words[i+3]||''].join(' '));

    /* Check genes — single-word */
    words.forEach(w => {
      const clean = w.replace(/[^A-Za-z0-9]/g, '');
      if (GENES.has(clean)) entities.genes.add(clean);
    });

    /* Check diseases — multi-word */
    [bigrams, trigrams, quads, words].forEach(arr => {
      arr.forEach(phrase => {
        const clean = phrase.trim().replace(/[,.;:!?]+$/, '').toLowerCase();
        if (DISEASES.has(clean)) entities.diseases.add(phrase.trim().replace(/[,.;:!?]+$/, ''));
      });
    });

    /* Organisms — multi-word */
    [bigrams, trigrams, words].forEach(arr => {
      arr.forEach(phrase => {
        const clean = phrase.trim().replace(/[,.;:!?]+$/, '');
        if (ORGANISMS.has(clean)) entities.organisms.add(clean);
      });
    });

    /* Drugs — single or bi-gram */
    [words, bigrams].forEach(arr => {
      arr.forEach(w => {
        const clean = w.replace(/[,.;:!?()]+/g, '').toLowerCase();
        if (DRUGS.has(clean)) entities.drugs.add(clean);
      });
    });

    /* Regex patterns */
    const addMatches = (re, arr) => { let m; while ((m = re.exec(text)) !== null) arr.push(m[0]); re.lastIndex = 0; };
    addMatches(PATTERNS.variant_hgvs, entities.variants);
    addMatches(PATTERNS.variant_prot,  entities.variants);
    addMatches(PATTERNS.snp,           entities.snps);
    addMatches(PATTERNS.sra_acc,       entities.accessions);
    addMatches(PATTERNS.geo_acc,       entities.accessions);
    addMatches(PATTERNS.ensembl,       entities.accessions);
    addMatches(PATTERNS.affiliation_af, entities.africa_terms);

    /* Deduplicate */
    entities.variants   = [...new Set(entities.variants)];
    entities.snps       = [...new Set(entities.snps)];
    entities.accessions = [...new Set(entities.accessions)];
    entities.africa_terms = [...new Set(entities.africa_terms.map(s => s.replace(/[,.;:!?]+$/, '')))];

    return {
      genes:        [...entities.genes],
      diseases:     [...entities.diseases],
      organisms:    [...entities.organisms],
      drugs:        [...entities.drugs],
      variants:     entities.variants,
      snps:         entities.snps,
      accessions:   entities.accessions,
      africa_terms: entities.africa_terms,
    };
  }

  /* ─── Highlighted text render ─── */
  function _highlight(text, result) {
    let html = _esc(text);

    const replace = (terms, cls, linkFn) => {
      terms.sort((a, b) => b.length - a.length).forEach(term => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(?<![A-Za-z0-9_-])(${escaped})(?![A-Za-z0-9_-])`, 'gi');
        html = html.replace(re, (m) => {
          const link = linkFn ? ` onclick="${linkFn(term)}"` : '';
          return `<mark class="ent-${cls}"${link} title="${cls}: ${term}">${m}</mark>`;
        });
      });
    };

    replace(result.genes,        'gene',     t => `OmicsLab.BioNLP._navGene('${t.replace(/'/g,"\\'")}')` );
    replace(result.diseases,     'disease',  null);
    replace(result.organisms,    'organism', null);
    replace(result.drugs,        'drug',     null);
    replace(result.variants,     'variant',  t => `OmicsLab.BioNLP._navVariant('${t.replace(/'/g,"\\'")}')` );
    replace(result.snps,         'snp',      t => `OmicsLab.BioNLP._navSNP('${t.replace(/'/g,"\\'")}')` );
    replace(result.accessions,   'accession',null);
    replace(result.africa_terms, 'africa',   null);

    return html;
  }

  function _navGene(gene) {
    if (OmicsLab.Router) OmicsLab.Router.navigate('gene-lookup');
    setTimeout(() => OmicsLab.GeneLookup && OmicsLab.GeneLookup._quickLookup(gene), 400);
  }

  function _navVariant(v) {
    if (OmicsLab.Router) OmicsLab.Router.navigate('variantinterp');
    setTimeout(() => {
      const ta = document.getElementById('vi-input');
      if (ta) { ta.value = v; }
    }, 400);
  }

  function _navSNP(rs) {
    window.open(`https://www.ncbi.nlm.nih.gov/snp/${rs}`, '_blank', 'noopener');
  }

  /* ─── Render results ─── */
  function _renderResults(result, text) {
    const el = document.getElementById('bnlp-output');
    if (!el) return;

    const total = Object.values(result).flat().length;
    if (!total) { el.innerHTML = '<div class="bnlp-empty">No biomedical entities detected. Try pasting a methods section or abstract.</div>'; return; }

    const badge = (label, items, cls) => {
      if (!items.length) return '';
      return `<div class="bnlp-entity-group">
        <div class="bnlp-entity-label">${label} (${items.length})</div>
        <div class="bnlp-entity-tags">
          ${items.map(i => `<span class="ent-${cls} bnlp-tag">${_esc(i)}</span>`).join('')}
        </div>
      </div>`;
    };

    el.innerHTML = `
      <div class="bnlp-stats">
        <span>${total} entities found</span>
        ${result.africa_terms.length ? `<span class="bnlp-africa-badge">${result.africa_terms.length} Africa mentions</span>` : ''}
      </div>

      <div class="bnlp-entities">
        ${badge('Genes', result.genes, 'gene')}
        ${badge('Diseases', result.diseases, 'disease')}
        ${badge('Organisms', result.organisms, 'organism')}
        ${badge('Drugs', result.drugs, 'drug')}
        ${badge('Variants', result.variants, 'variant')}
        ${badge('SNPs / rsIDs', result.snps, 'snp')}
        ${badge('Database Accessions', result.accessions, 'accession')}
        ${badge('Africa mentions', result.africa_terms, 'africa')}
      </div>

      <div class="bnlp-highlighted-section">
        <div class="bnlp-highlighted-label">Highlighted text <span class="bnlp-legend">${['gene','disease','organism','drug','variant','snp','accession','africa'].map(t => `<span class="ent-${t} bnlp-legend-swatch">${t}</span>`).join('')}</span></div>
        <div class="bnlp-highlighted-text">${_highlight(text, result)}</div>
      </div>`;
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('bionlp-section');
    if (!section || section.dataset.bnReady) return;
    section.dataset.bnReady = '1';

    section.innerHTML = `
      <div class="bnlp-wrap">
        <div class="bnlp-header">
          <div class="bnlp-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>
            BioNLP Entity Recogniser
          </div>
          <div class="bnlp-header-sub">Paste any scientific text — extract genes, diseases, variants, organisms, drugs, accessions. Fully offline.</div>
        </div>

        <div class="bnlp-input-panel">
          <div class="bnlp-input-header">
            <span class="bnlp-input-label">Paste text (abstract, methods, results, paper…)</span>
            <span id="bnlp-char-count" class="bnlp-char-count">0 characters</span>
          </div>
          <textarea class="bnlp-textarea" id="bnlp-input"
            placeholder="Paste a PubMed abstract, methods section, or any scientific text here…"
            oninput="OmicsLab.BioNLP._onInput(this.value)"></textarea>
          <div class="bnlp-actions">
            <button class="bnlp-analyse-btn" onclick="OmicsLab.BioNLP.analyse()">Extract entities</button>
            <button class="bnlp-clear-btn" onclick="OmicsLab.BioNLP.clear()">Clear</button>
            <button class="bnlp-example-btn" onclick="OmicsLab.BioNLP.loadExample()">Load example</button>
          </div>
        </div>

        <div id="bnlp-output" class="bnlp-output">
          <div class="bnlp-empty">Paste text above and click "Extract entities" to identify biomedical terms.</div>
        </div>
      </div>`;
  }

  const EXAMPLE_TEXT = `We performed whole-genome sequencing of 1,200 participants from Nigeria (n=400), Kenya (n=400), and South Africa (n=400) enrolled in the H3Africa AWI-Gen cohort. DNA was extracted from venous blood, library preparation performed with Illumina TruSeq, and sequencing conducted on HiSeq X (30× coverage). Reads were aligned to GRCh38 with BWA-MEM2 and variants called using GATK4 HaplotypeCaller in GVCF mode. After applying VQSR filters, we identified 28.4 million SNPs including rs334 (HBB c.20A>T, p.Glu7Val) conferring sickle cell disease in 2.3% of participants. APOL1 G1 (rs73885319) and G2 (rs71785313) risk alleles were found in 18% of West African samples. CYP2D6 metaboliser variants showed significant enrichment compared to European gnomAD. We detected 847 pathogenic variants in BRCA1 and BRCA2 (SRA: SRR1234567, GEO: GSE123456). All participants provided written informed consent per ethics approval. Malaria was a major comorbidity, with Plasmodium falciparum detected in 12% at enrolment. p < 5×10⁻⁸ genome-wide significance threshold was applied.`;

  function loadExample() {
    const ta = document.getElementById('bnlp-input');
    if (ta) { ta.value = EXAMPLE_TEXT; _onInput(EXAMPLE_TEXT); }
  }

  function _onInput(val) {
    const el = document.getElementById('bnlp-char-count');
    if (el) el.textContent = val.length.toLocaleString() + ' characters';
    _lastText = val;
  }

  function analyse() {
    const text = document.getElementById('bnlp-input')?.value || '';
    if (!text.trim()) return;
    _lastText   = text;
    _lastResult = _extract(text);
    _renderResults(_lastResult, text);
  }

  function clear() {
    const ta = document.getElementById('bnlp-input');
    if (ta) ta.value = '';
    _onInput('');
    const out = document.getElementById('bnlp-output');
    if (out) out.innerHTML = '<div class="bnlp-empty">Paste text above and click "Extract entities" to identify biomedical terms.</div>';
    _lastResult = null;
  }

  return { init, analyse, clear, loadExample, _onInput, _navGene, _navVariant, _navSNP };
})();
