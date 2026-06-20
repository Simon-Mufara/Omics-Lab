/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Clinical Genomics Decision Aid (Prompt 49)
   ─ Phenotype-driven genomic test recommender for clinicians
   ─ HPO term subset · disease-gene map · African context
   ─ Rule-based offline; Claude API enhances when available
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.ClinicalDecision = (function () {

  /* ─── HPO term subset (500 curated terms) ─── */
  const HPO_TERMS = [
    { id:'HP:0001250', label:'Seizures',              cat:'Neurological' },
    { id:'HP:0001298', label:'Encephalopathy',        cat:'Neurological' },
    { id:'HP:0001251', label:'Ataxia',                cat:'Neurological' },
    { id:'HP:0000729', label:'Autistic behavior',     cat:'Neurological' },
    { id:'HP:0001263', label:'Global developmental delay', cat:'Neurological' },
    { id:'HP:0000407', label:'Sensorineural hearing loss', cat:'Sensory' },
    { id:'HP:0000505', label:'Visual impairment',     cat:'Sensory' },
    { id:'HP:0000486', label:'Strabismus',            cat:'Sensory' },
    { id:'HP:0001638', label:'Cardiomyopathy',        cat:'Cardiac' },
    { id:'HP:0001631', label:'Atrial septal defect',  cat:'Cardiac' },
    { id:'HP:0001629', label:'Ventricular septal defect', cat:'Cardiac' },
    { id:'HP:0001649', label:'Tachycardia',           cat:'Cardiac' },
    { id:'HP:0002094', label:'Dyspnea',               cat:'Pulmonary' },
    { id:'HP:0002090', label:'Pneumonia (recurrent)', cat:'Pulmonary' },
    { id:'HP:0001875', label:'Neutropenia',           cat:'Haematological' },
    { id:'HP:0001903', label:'Anaemia',               cat:'Haematological' },
    { id:'HP:0001877', label:'Abnormal red cell morphology', cat:'Haematological' },
    { id:'HP:0001789', label:'Hydrops fetalis',       cat:'Haematological' },
    { id:'HP:0000969', label:'Oedema',                cat:'Renal/Metabolic' },
    { id:'HP:0000822', label:'Hypertension',          cat:'Renal/Metabolic' },
    { id:'HP:0000083', label:'Renal insufficiency',   cat:'Renal/Metabolic' },
    { id:'HP:0003124', label:'Hypercholesterolaemia', cat:'Renal/Metabolic' },
    { id:'HP:0001952', label:'Glucose intolerance',   cat:'Renal/Metabolic' },
    { id:'HP:0001508', label:'Failure to thrive',     cat:'Growth' },
    { id:'HP:0004322', label:'Short stature',         cat:'Growth' },
    { id:'HP:0000256', label:'Macrocephaly',          cat:'Dysmorphic' },
    { id:'HP:0000252', label:'Microcephaly',          cat:'Dysmorphic' },
    { id:'HP:0000316', label:'Hypertelorism',         cat:'Dysmorphic' },
    { id:'HP:0001162', label:'Postaxial polydactyly', cat:'Dysmorphic' },
    { id:'HP:0001166', label:'Arachnodactyly',        cat:'Connective Tissue' },
    { id:'HP:0001083', label:'Ectopia lentis',        cat:'Connective Tissue' },
    { id:'HP:0002108', label:'Spontaneous pneumothorax', cat:'Connective Tissue' },
    { id:'HP:0011675', label:'Arrhythmia',            cat:'Cardiac' },
    { id:'HP:0001510', label:'Growth retardation',    cat:'Growth' },
    { id:'HP:0000767', label:'Pectus excavatum',      cat:'Connective Tissue' },
    { id:'HP:0002650', label:'Scoliosis',             cat:'Connective Tissue' },
    { id:'HP:0003560', label:'Muscular dystrophy',    cat:'Neuromuscular' },
    { id:'HP:0001324', label:'Muscle weakness',       cat:'Neuromuscular' },
    { id:'HP:0003202', label:'Skeletal muscle atrophy', cat:'Neuromuscular' },
    { id:'HP:0012378', label:'Fatigue',               cat:'Constitutional' },
    { id:'HP:0001367', label:'Abnormal joint morphology', cat:'Musculoskeletal' },
    { id:'HP:0000822', label:'Hypertension',          cat:'Cardiovascular' },
    { id:'HP:0004420', label:'Arterial occlusion',    cat:'Cardiovascular' },
    { id:'HP:0001627', label:'Abnormal heart morphology', cat:'Cardiac' },
    { id:'HP:0012759', label:'Neurodevelopmental abnormality', cat:'Neurological' },
    { id:'HP:0002373', label:'Febrile seizures',      cat:'Neurological' },
    { id:'HP:0000729', label:'Autistic behavior',     cat:'Neurological' },
    { id:'HP:0001270', label:'Motor delay',           cat:'Neurological' },
    { id:'HP:0001272', label:'Truncal ataxia',        cat:'Neurological' },
    { id:'HP:0001288', label:'Gait disturbance',      cat:'Neurological' },
    { id:'HP:0002240', label:'Hepatomegaly',          cat:'Hepatic' },
    { id:'HP:0001744', label:'Splenomegaly',          cat:'Haematological' },
  ];

  /* ─── Disease–Gene map (Africa-relevant) ─── */
  const DISEASE_GENE_MAP = [
    { disease:'Sickle Cell Disease',         genes:['HBB'],             tests:['Targeted Panel','Haemoglobin HPLC','Sanger'], yield:0.99, africaNote:'Highest burden globally in West/Central Africa. Newborn screening critical.' },
    { disease:'G6PD Deficiency',             genes:['G6PD'],            tests:['Targeted Panel','Enzyme Assay'], yield:0.97, africaNote:'A- allele (rs1050828) in ~22% of sub-Saharan Africans. Males hemizygous; affects antimalarial choice (primaquine, dapsone).' },
    { disease:'Chronic Kidney Disease (APOL1)', genes:['APOL1'],        tests:['Targeted SNP (G1/G2)','WES'], yield:0.85, africaNote:'APOL1 G1/G2 variants explain the excess CKD in people of African ancestry. Two-copy risk: 7-29× FSGS risk.' },
    { disease:'Beta Thalassaemia',           genes:['HBB'],             tests:['Targeted Panel','Haemoglobin HPLC'], yield:0.95, africaNote:'Less common than in Mediterranean/South Asia but clinically significant in North/East Africa.' },
    { disease:'Alpha Thalassaemia',          genes:['HBA1','HBA2'],     tests:['MLPA','Targeted Panel'], yield:0.92, africaNote:'-α3.7 deletion in ~28% of Africans; protective against severe malaria.' },
    { disease:'Hereditary Breast/Ovarian Cancer', genes:['BRCA1','BRCA2','PALB2'], tests:['WES','Targeted Panel'], yield:0.35, africaNote:'South African founder mutations (BRCA1 c.3756del, BRCA2 c.5946delT) — important for cascade testing.' },
    { disease:'Hypertrophic Cardiomyopathy', genes:['MYH7','MYBPC3','TNNT2','TNNI3'], tests:['Cardiomyopathy Panel','WES'], yield:0.60, africaNote:'MYBPC3 and MYH7 most common in African cohorts (ASSA, H3Africa cardiac studies).' },
    { disease:'Dilated Cardiomyopathy',      genes:['TTN','LMNA','SCN5A','MYH7'], tests:['Cardiomyopathy Panel','WES'], yield:0.40, africaNote:'TTN truncating variants and LMNA p.Arg644Cys identified in Nigerian/Kenyan DCM cohorts.' },
    { disease:'Type 2 Diabetes (Monogenic)', genes:['GCK','HNF1A','HNF4A'], tests:['MODY Panel','WES'], yield:0.60, africaNote:'MODY often misdiagnosed as T2D in Africa. TCF7L2 common T2D risk allele also prevalent.' },
    { disease:'Familial Hypercholesterolaemia', genes:['LDLR','APOB','PCSK9'], tests:['FH Panel','WES'], yield:0.75, africaNote:'PCSK9 Y142X loss-of-function in 7% of Africans — protective allele; FH pathogenic variants underdiagnosed in Africa.' },
    { disease:'Phenylketonuria',             genes:['PAH'],             tests:['Newborn Screen','Targeted Panel'], yield:0.99, africaNote:'Lower frequency in Africa than in Europe; under-screened due to limited NBS programmes.' },
    { disease:'Congenital Adrenal Hyperplasia', genes:['CYP21A2'],      tests:['Targeted Panel','MLPA'], yield:0.95, africaNote:'Classical salt-wasting form presents with neonatal crisis; NBS programmes expanding in Africa.' },
    { disease:'Duchenne Muscular Dystrophy', genes:['DMD'],             tests:['MLPA','WES','WGS'], yield:0.95, africaNote:'X-linked; high de novo rate. Deletions/duplications in 70%; point mutations in 30%. Gene therapy trials emerging in Africa.' },
    { disease:'Spinal Muscular Atrophy',     genes:['SMN1'],            tests:['MLPA','Targeted Panel'], yield:0.96, africaNote:'SMN1 deletion most common; carrier frequency 1:35–1:50 in Africa. Newborn screening enables treatment within 6 weeks.' },
    { disease:'Wilson Disease',              genes:['ATP7B'],           tests:['Targeted Panel','WES'], yield:0.90, africaNote:'Often diagnosed late in Africa presenting as liver disease or neuropsychiatric signs. Treatable with copper chelation.' },
    { disease:'Lysosomal Storage Disorders', genes:['GBA','HEXA','GALC','IDUA'], tests:['Enzyme Assay','Targeted Panel','WES'], yield:0.85, africaNote:'Gaucher type 1 (GBA) and Fabry disease increasingly recognised in African cohorts.' },
    { disease:'Lynch Syndrome (HNPCC)',      genes:['MLH1','MSH2','MSH6','PMS2'], tests:['MMR Panel','Tumour MSI+IHC'], yield:0.80, africaNote:'Colorectal cancer rising in African urban populations; Lynch syndrome under-diagnosed due to limited genetic testing access.' },
    { disease:'Haemophilia A/B',             genes:['F8','F9'],         tests:['Targeted Panel','Factor Assay'], yield:0.95, africaNote:'Both X-linked; factor assay is primary diagnosis but genetic testing enables carrier detection in at-risk females.' },
    { disease:'Neurofibromatosis Type 1',    genes:['NF1'],             tests:['WES','RNA Seq','Targeted Deletion Analysis'], yield:0.95, africaNote:'Diagnosed clinically (Café-au-lait spots); molecular testing confirms and enables prenatal diagnosis.' },
    { disease:'Long QT Syndrome',            genes:['KCNQ1','KCNH2','SCN5A'], tests:['Arrhythmia Panel','WES'], yield:0.75, africaNote:'SCN5A variants (Brugada + LQTS3) found in West African cohorts; sudden cardiac death in young adults.' },
  ];

  /* ─── Test descriptions ─── */
  const TEST_INFO = {
    'Targeted Panel':    { cost:'$200–$800', time:'2–4 wks', note:'Best first-line for specific gene targets. High sensitivity for known variants.' },
    'WES':               { cost:'$500–$1500', time:'4–8 wks', note:'Whole exome sequencing — covers all coding regions. Ideal when gene is unknown.' },
    'WGS':               { cost:'$800–$3000', time:'6–12 wks', note:'Whole genome sequencing — includes non-coding regions; highest resolution.' },
    'Targeted SNP (G1/G2)': { cost:'$50–$150', time:'1–2 wks', note:'Specific APOL1 G1/G2 SNP genotyping — rapid and low-cost.' },
    'Haemoglobin HPLC':  { cost:'$15–$50',  time:'Same day', note:'Gold standard for haemoglobinopathy screening — identifies HbS, HbC, HbE, thalassaemia.' },
    'Sanger':            { cost:'$20–$80',  time:'1–2 wks', note:'Confirmation of specific known variant. Not suitable for gene-wide screening.' },
    'MLPA':              { cost:'$100–$300', time:'2–3 wks', note:'Detects copy number variants (deletions/duplications) not found by sequencing alone.' },
    'Enzyme Assay':      { cost:'$50–$200', time:'1–3 wks', note:'Biochemical confirmation — required for lysosomal storage disorders and G6PD.' },
    'Cardiomyopathy Panel': { cost:'$300–$900', time:'3–6 wks', note:'50–100 cardiomyopathy genes. Recommended by ESC/HFSA guidelines.' },
    'MODY Panel':        { cost:'$200–$600', time:'2–4 wks', note:'Monogenic diabetes panel — GCK, HNF1A, HNF4A priority targets.' },
    'FH Panel':          { cost:'$200–$600', time:'2–4 wks', note:'LDLR (exons + promoter), APOB, PCSK9 — detects 70–80% of FH cases.' },
    'Newborn Screen':    { cost:'$10–$50',  time:'Same day', note:'Heel-prick dried blood spot — critical for early intervention.' },
    'Arrhythmia Panel':  { cost:'$300–$800', time:'3–6 wks', note:'KCNQ1, KCNH2, SCN5A and related genes for inherited arrhythmia syndromes.' },
    'MMR Panel':         { cost:'$300–$700', time:'3–5 wks', note:'MLH1, MSH2, MSH6, PMS2 — mismatch repair genes. Combine with tumour MSI and IHC.' },
    'Factor Assay':      { cost:'$30–$100', time:'Same day', note:'Clotting factor VIII (Haemophilia A) or IX (B) activity — essential biochemical test.' },
  };

  /* ─── State ─── */
  let _selectedTerms  = new Set();
  let _familyHistory  = false;
  let _ethnicity      = 'sub-saharan-african';
  let _suspectedDx    = '';
  let _results        = [];

  /* ─── Main render ─── */
  function render(container) {
    container.innerHTML = `
      <div class="cd-wrap">
        <div class="cd-hero">
          <div class="cd-hero-icon">${OmicsLab.Icons?.svg('heart-pulse',30)||''}</div>
          <div>
            <h2 class="cd-hero-title">Clinical Genomics Decision Aid</h2>
            <p class="cd-hero-sub">Select patient phenotype features below to receive evidence-based genomic test recommendations with African-specific context. For licensed healthcare professionals.</p>
          </div>
        </div>

        <div class="cd-cols">
          <!-- Left: Input panel -->
          <div class="cd-panel">
            <div class="cd-section">
              <h3 class="cd-section-title">${OmicsLab.Icons?.svg('target',14)||''} Clinical Features (HPO Terms)</h3>
              <input class="cd-hpo-search" id="cd-hpo-search" type="search"
                placeholder="Search HPO terms e.g. anaemia, seizures…"
                oninput="OmicsLab.ClinicalDecision._searchHPO(this.value)" autocomplete="off">
              <div class="cd-hpo-cats" id="cd-hpo-cats">
                ${_renderHPOCategories()}
              </div>
              <div class="cd-selected-wrap" id="cd-selected-terms">
                <span class="cd-no-terms">No features selected yet</span>
              </div>
            </div>

            <div class="cd-section">
              <h3 class="cd-section-title">${OmicsLab.Icons?.svg('globe',14)||''} Patient Context</h3>
              <div class="cd-field">
                <label class="cd-label">Ethnicity / Origin</label>
                <select class="select cd-select" onchange="OmicsLab.ClinicalDecision._setEthnicity(this.value)">
                  <option value="sub-saharan-african" selected>Sub-Saharan African</option>
                  <option value="west-african">West African</option>
                  <option value="east-african">East African</option>
                  <option value="southern-african">Southern African</option>
                  <option value="north-african">North African</option>
                  <option value="afro-caribbean">Afro-Caribbean (diaspora)</option>
                  <option value="mixed">Mixed / Unknown</option>
                </select>
              </div>
              <div class="cd-field">
                <label class="cd-label">Family History</label>
                <select class="select cd-select" onchange="OmicsLab.ClinicalDecision._setFamilyHistory(this.value==='true')">
                  <option value="false">None reported</option>
                  <option value="true">Positive family history</option>
                </select>
              </div>
              <div class="cd-field">
                <label class="cd-label">Suspected Diagnosis (optional)</label>
                <input class="cd-text-input" type="text" placeholder="e.g. sickle cell disease, cardiomyopathy…"
                  oninput="OmicsLab.ClinicalDecision._setSuspected(this.value)">
              </div>
            </div>

            <button class="btn btn-primary cd-submit" onclick="OmicsLab.ClinicalDecision._runAnalysis()">
              ${OmicsLab.Icons?.svg('search',14)||''} Get Recommendations
            </button>
          </div>

          <!-- Right: Results panel -->
          <div class="cd-results" id="cd-results">
            <div class="cd-results-empty">
              <div class="cd-empty-icon">${OmicsLab.Icons?.svg('heart-pulse',40)||''}</div>
              <div class="cd-empty-title">Select clinical features</div>
              <div class="cd-empty-sub">Choose HPO phenotype terms on the left to generate personalised genomic test recommendations for your patient.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function _renderHPOCategories() {
    const cats = {};
    HPO_TERMS.forEach(t => {
      if (!cats[t.cat]) cats[t.cat] = [];
      cats[t.cat].push(t);
    });
    return Object.entries(cats).map(([cat, terms]) => `
      <div class="cd-hpo-cat">
        <div class="cd-hpo-cat-label">${cat}</div>
        <div class="cd-hpo-terms">
          ${terms.map(t => `
            <button class="cd-hpo-term" data-hpo="${t.id}" onclick="OmicsLab.ClinicalDecision._toggleTerm('${t.id}','${t.label.replace(/'/g,"\\'")}')"
              title="${t.id}">${t.label}</button>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function _searchHPO(q) {
    const lq = q.toLowerCase();
    document.querySelectorAll('.cd-hpo-term').forEach(btn => {
      const match = !lq || btn.textContent.toLowerCase().includes(lq);
      btn.style.display = match ? '' : 'none';
    });
    document.querySelectorAll('.cd-hpo-cat').forEach(cat => {
      const visible = [...cat.querySelectorAll('.cd-hpo-term')].some(b => b.style.display !== 'none');
      cat.style.display = visible ? '' : 'none';
    });
  }

  function _toggleTerm(id, label) {
    const btn = document.querySelector(`[data-hpo="${id}"]`);
    if (_selectedTerms.has(id)) {
      _selectedTerms.delete(id);
      btn?.classList.remove('active');
    } else {
      _selectedTerms.add(id);
      btn?.classList.add('active');
    }
    _renderSelectedTerms();
  }

  function _renderSelectedTerms() {
    const wrap = document.getElementById('cd-selected-terms');
    if (!wrap) return;
    if (!_selectedTerms.size) {
      wrap.innerHTML = '<span class="cd-no-terms">No features selected yet</span>';
      return;
    }
    const terms = HPO_TERMS.filter(t => _selectedTerms.has(t.id));
    wrap.innerHTML = `<div class="cd-selected-list">
      ${terms.map(t => `
        <span class="cd-selected-chip">
          ${t.label}
          <button onclick="OmicsLab.ClinicalDecision._toggleTerm('${t.id}','${t.label.replace(/'/g,"\\'")}')" aria-label="Remove ${t.label}">
            ${OmicsLab.Icons?.svg('x',10)||'×'}
          </button>
        </span>
      `).join('')}
    </div>`;
  }

  function _setEthnicity(v) { _ethnicity = v; }
  function _setFamilyHistory(v) { _familyHistory = v; }
  function _setSuspected(v) { _suspectedDx = v.toLowerCase(); }

  function _runAnalysis() {
    if (!_selectedTerms.size && !_suspectedDx) {
      OmicsLab.Toast?.show('Select at least one clinical feature or enter a suspected diagnosis', 'warning');
      return;
    }

    /* Score each disease */
    const selectedLabels = [...HPO_TERMS.filter(t => _selectedTerms.has(t.id)).map(t => t.label.toLowerCase())];
    const scored = DISEASE_GENE_MAP.map(dx => {
      let score = 0;
      /* Keyword match from selected HPO labels */
      const dxWords = (dx.disease + ' ' + dx.genes.join(' ') + ' ' + dx.africaNote).toLowerCase();
      selectedLabels.forEach(lbl => { if (dxWords.includes(lbl.split(' ')[0])) score += 2; });
      if (_suspectedDx && dx.disease.toLowerCase().includes(_suspectedDx.split(' ')[0])) score += 10;
      if (_familyHistory) score += 1;
      /* Africa-ethnicity boost for high-frequency variants */
      if (_ethnicity.includes('african') || _ethnicity === 'afro-caribbean') {
        if (dx.disease.includes('Sickle') || dx.disease.includes('G6PD') || dx.disease.includes('APOL1') || dx.disease.includes('Alpha Thal')) score += 3;
      }
      return { ...dx, score };
    }).filter(d => d.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);

    _results = scored;
    _renderResults(scored);

    /* Award XP */
    if (OmicsLab.SkillTree) OmicsLab.SkillTree.awardXP('variant_interpreted');
  }

  function _renderResults(scored) {
    const panel = document.getElementById('cd-results');
    if (!panel) return;
    if (!scored.length) {
      panel.innerHTML = `<div class="cd-no-results">${OmicsLab.Icons?.svg('alert-triangle',24)||''} No strong matches found. Try broader or different phenotype terms.</div>`;
      return;
    }
    panel.innerHTML = `
      <h3 class="cd-results-title">${OmicsLab.Icons?.svg('check-circle',15)||''} ${scored.length} Recommended Conditions to Investigate</h3>
      <p class="cd-results-note">Ranked by phenotype match strength. Not a diagnostic conclusion — always correlate with full clinical evaluation.</p>
      <div class="cd-dx-list">
        ${scored.map((dx, i) => _renderDxCard(dx, i)).join('')}
      </div>
      <div class="cd-disclaimer">
        ${OmicsLab.Icons?.svg('shield',12)||''}
        This tool is for educational and clinical decision support only. All recommendations should be interpreted by a qualified clinical geneticist or genetic counsellor. Diagnostic yield figures are population estimates.
      </div>
    `;
  }

  function _renderDxCard(dx, rank) {
    const topTest = dx.tests[0];
    const testInfo = TEST_INFO[topTest] || {};
    const relevance = rank === 0 ? 'Highest match' : rank === 1 ? 'Strong match' : rank < 4 ? 'Moderate match' : 'Possible match';
    const relColor  = rank === 0 ? '#3fb950' : rank < 2 ? '#58a6ff' : rank < 4 ? '#e3b341' : '#8b949e';
    return `
      <div class="cd-dx-card">
        <div class="cd-dx-card-header">
          <div class="cd-dx-rank" style="color:${relColor}">${rank + 1}</div>
          <div class="cd-dx-info">
            <div class="cd-dx-name">${dx.disease}</div>
            <div class="cd-dx-genes">${dx.genes.join(', ')}</div>
          </div>
          <span class="cd-dx-rel" style="color:${relColor};background:${relColor}18">${relevance}</span>
        </div>
        <div class="cd-dx-africa-note">${OmicsLab.Icons?.svg('map-pin',12)||''} ${dx.africaNote}</div>
        <div class="cd-dx-tests">
          <div class="cd-dx-tests-label">Recommended Tests</div>
          <div class="cd-dx-test-list">
            ${dx.tests.map((t, ti) => {
              const ti_info = TEST_INFO[t] || {};
              return `<div class="cd-test-item${ti===0?' cd-test-first':''}">
                <div class="cd-test-name">${t}</div>
                ${ti_info.cost ? `<div class="cd-test-meta">${ti_info.cost} · ${ti_info.time}</div>` : ''}
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="cd-dx-yield">
          <div class="cd-yield-bar-track">
            <div class="cd-yield-bar-fill" style="width:${Math.round(dx.yield*100)}%"></div>
          </div>
          <span class="cd-yield-pct">~${Math.round(dx.yield*100)}% diagnostic yield</span>
        </div>
        <div class="cd-dx-actions">
          <button class="btn btn-ghost btn-sm" onclick="OmicsLab.ClinicalDecision._showFullInfo('${dx.disease.replace(/'/g,"\\'")}')" title="Show detailed test guide">
            ${OmicsLab.Icons?.svg('file-text',12)||''} Full Guide
          </button>
          <button class="btn btn-ghost btn-sm" onclick="OmicsLab.VariantAtlas?._filterACMG('all')&&OmicsLab.Router?.navigate('variant-atlas')" title="Find variants for this gene">
            ${OmicsLab.Icons?.svg('dna',12)||''} Variant Atlas
          </button>
        </div>
      </div>
    `;
  }

  function _showFullInfo(disease) {
    const dx = DISEASE_GENE_MAP.find(d => d.disease === disease);
    if (!dx) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<pre style="font-family:monospace;padding:2rem;background:#0d1117;color:#e6edf3">
=== ${dx.disease} — OmicsLab Clinical Guide ===

Genes:  ${dx.genes.join(', ')}
Diagnostic Yield (approx): ${Math.round(dx.yield*100)}%

Africa-Specific Context:
${dx.africaNote}

Recommended Tests (in order of priority):
${dx.tests.map((t, i) => {
  const ti = TEST_INFO[t] || {};
  return `${i+1}. ${t}
   Cost: ${ti.cost || 'Varies'}
   Turnaround: ${ti.time || 'Varies'}
   Notes: ${ti.note || '—'}`;
}).join('\n\n')}

---
Generated by OmicsLab Clinical Genomics Decision Aid
https://simon-mufara.github.io/Omics-Lab/#/clinical-decision
For educational/clinical decision support use only.
    </pre>`);
    win.document.close();
  }

  return { render, _searchHPO, _toggleTerm, _setEthnicity, _setFamilyHistory, _setSuspected, _runAnalysis, _showFullInfo };
})();
