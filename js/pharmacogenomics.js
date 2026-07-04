/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Pharmacogenomics Africa
   Drug-gene interactions relevant to African populations.
   CYP variants, star alleles, clinical recommendations.
   Data from PharmGKB, PharmVar, CPIC, published literature.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PGx = (function () {

  /* ── Key CYP / pharmacogene variants in African populations ── */
  const GENES = [
    {
      gene: 'CYP2B6',
      fullname: 'Cytochrome P450 2B6',
      function: 'HIV antiretroviral metabolism',
      color: '#f97316',
      summary: 'CYP2B6*6 (516G>T) causes up to 4× higher efavirenz plasma levels — 20–35% frequency in Sub-Saharan Africa vs 5–8% in Europeans. Leads to CNS toxicity. Dose reduction recommended for homozygotes.',
      alleles: [
        { name:'*1',  function:'Normal',           raf_afr:0.40, raf_eur:0.62, raf_eas:0.70 },
        { name:'*6',  function:'Poor metaboliser',  raf_afr:0.30, raf_eur:0.07, raf_eas:0.13 },
        { name:'*18', function:'Poor metaboliser',  raf_afr:0.10, raf_eur:0.00, raf_eas:0.00 },
      ],
      drugs: [
        { name:'Efavirenz',    category:'HIV',      recommendation:'Reduce dose 400→200mg in *6/*6 or *6/*18; TDM monitoring', level:'CPIC A' },
        { name:'Nevirapine',   category:'HIV',      recommendation:'Monitor for hepatotoxicity in poor metabolisers', level:'CPIC B' },
        { name:'Cyclophosphamide', category:'Cancer', recommendation:'Reduced activation; consider alternative alkylating agents', level:'Informative' },
      ],
      africa_note: 'CYP2B6*18 is almost exclusively found in Sub-Saharan Africans and dramatically reduces enzyme activity. Routine genotyping before efavirenz initiation is cost-effective at African HIV treatment scales.'
    },
    {
      gene: 'CYP2D6',
      fullname: 'Cytochrome P450 2D6',
      function: 'Opioid & antidepressant metabolism',
      color: '#bc8cff',
      summary: 'Ultra-rapid metabolisers (UM) are 3–5× more common in East and North Africa (CYP2D6*2xN duplication). UMs activate codeine too rapidly → fatal morphine accumulation. WHO has withdrawn codeine for children in many African countries partly for this reason.',
      alleles: [
        { name:'*1',   function:'Normal',             raf_afr:0.28, raf_eur:0.38, raf_eas:0.35 },
        { name:'*2xN', function:'Ultra-rapid (UM)',   raf_afr:0.10, raf_eur:0.04, raf_eas:0.02 },
        { name:'*4',   function:'Poor metaboliser',   raf_afr:0.04, raf_eur:0.21, raf_eas:0.01 },
        { name:'*17',  function:'Intermediate',       raf_afr:0.20, raf_eur:0.00, raf_eas:0.00 },
        { name:'*29',  function:'Intermediate',       raf_afr:0.08, raf_eur:0.00, raf_eas:0.00 },
      ],
      drugs: [
        { name:'Codeine',     category:'Pain',       recommendation:'Contraindicated in UMs (children) — use non-opioid alternatives', level:'CPIC A' },
        { name:'Tramadol',    category:'Pain',       recommendation:'Avoid in UMs — risk of seizures and respiratory depression', level:'CPIC A' },
        { name:'Tamoxifen',   category:'Cancer',     recommendation:'UMs have better outcomes; PMs may need aromatase inhibitors instead', level:'CPIC A' },
        { name:'Risperidone', category:'Psychiatry', recommendation:'Increase dose in UMs; reduce in PMs to avoid extrapyramidal side effects', level:'CPIC B' },
      ],
      africa_note: 'CYP2D6*17 and *29 are found almost exclusively in African populations and both reduce activity. Combined with *2xN duplication prevalence, the African CYP2D6 pharmacogenetic landscape is unique and requires African-specific guidelines.'
    },
    {
      gene: 'CYP3A5',
      fullname: 'Cytochrome P450 3A5',
      function: 'Immunosuppressant & steroid metabolism',
      color: '#00C4A0',
      summary: 'CYP3A5*1 (expressors) are ~70–80% in Africans vs 10–15% in Europeans. Tacrolimus (post-transplant) requires 2× higher doses in African expressors to achieve therapeutic concentrations — dramatically affects transplant outcomes.',
      alleles: [
        { name:'*1', function:'Expressor (high activity)', raf_afr:0.73, raf_eur:0.10, raf_eas:0.27 },
        { name:'*3', function:'Non-expressor',              raf_afr:0.27, raf_eur:0.90, raf_eas:0.73 },
      ],
      drugs: [
        { name:'Tacrolimus',    category:'Transplant', recommendation:'Start at 0.3 mg/kg/day in expressors (*1 carriers) vs 0.15 mg/kg/day in non-expressors', level:'CPIC A' },
        { name:'Cyclosporine',  category:'Transplant', recommendation:'Minor effect; TDM-guided dosing adequate', level:'Informative' },
        { name:'Budesonide',    category:'Respiratory',recommendation:'Higher clearance in expressors; may need higher doses', level:'Informative' },
      ],
      africa_note: 'African expressors who receive European-standard tacrolimus doses face 2× higher rejection risk. CPIC A-level guidance exists. Essential for South African, Nigerian, and Kenyan transplant programmes.'
    },
    {
      gene: 'NAT2',
      fullname: 'N-Acetyltransferase 2',
      function: 'Isoniazid (TB) metabolism',
      color: '#e3b341',
      summary: 'NAT2 slow acetylators accumulate isoniazid → peripheral neuropathy and hepatotoxicity. Slow acetylator prevalence is ~45–55% in Africa but varies by country (Ethiopia 42%, Nigeria 57%, East Africa 50%). Fast acetylators have sub-therapeutic drug levels and higher TB relapse risk.',
      alleles: [
        { name:'*4',  function:'Fast acetylator',     raf_afr:0.28, raf_eur:0.26, raf_eas:0.55 },
        { name:'*5',  function:'Slow acetylator',     raf_afr:0.28, raf_eur:0.46, raf_eas:0.11 },
        { name:'*6',  function:'Slow acetylator',     raf_afr:0.15, raf_eur:0.27, raf_eas:0.16 },
        { name:'*7',  function:'Slow acetylator',     raf_afr:0.02, raf_eur:0.02, raf_eas:0.18 },
        { name:'*14', function:'Slow acetylator',     raf_afr:0.09, raf_eur:0.00, raf_eas:0.00 },
      ],
      drugs: [
        { name:'Isoniazid (INH)', category:'TB',    recommendation:'Slow acetylators: add B6 prophylaxis (25mg/day); monitor LFTs. Fast: consider higher dose for cavity TB', level:'CPIC B' },
        { name:'Pyrazinamide',    category:'TB',    recommendation:'Not a NAT2 substrate but co-prescribed; combined toxicity risk', level:'Informative' },
        { name:'Sulfamethoxazole',category:'HIV/TB',recommendation:'Increased toxicity in slow acetylators — watch for rash and hepatotoxicity', level:'Informative' },
      ],
      africa_note: 'NAT2 genotyping before TB treatment could prevent thousands of cases of peripheral neuropathy annually across Africa. The WHO strongly recommends B6 supplementation — NAT2 status would allow targeted prophylaxis.'
    },
    {
      gene: 'G6PD',
      fullname: 'Glucose-6-Phosphate Dehydrogenase',
      function: 'Malaria drug safety (primaquine, rasburicase)',
      color: '#58a6ff',
      summary: 'G6PD deficiency (Mediterranean/A− variants) affects 10–25% of Africans, protecting against falciparum malaria. Primaquine (8-aminoquinoline) causes fatal haemolytic anaemia in deficient individuals. WHO mandates G6PD testing before primaquine treatment for vivax malaria clearance.',
      alleles: [
        { name:'A−  (202A>G + 376A>G)', function:'Severe deficiency', raf_afr:0.15, raf_eur:0.001, raf_eas:0.00 },
        { name:'A   (376A>G only)',      function:'Mild deficiency',   raf_afr:0.10, raf_eur:0.00,  raf_eas:0.00 },
        { name:'Mediterranean',          function:'Severe deficiency', raf_afr:0.01, raf_eur:0.04,  raf_eas:0.00 },
      ],
      drugs: [
        { name:'Primaquine',    category:'Malaria',recommendation:'Contraindicated in severe deficiency; single-dose (0.25mg/kg) may be tolerated in mild A− with haematologic monitoring', level:'WHO mandatory' },
        { name:'Rasburicase',   category:'Oncology',recommendation:'Absolute contraindication in G6PD deficiency — life-threatening haemolysis', level:'FDA Black Box' },
        { name:'Dapsone',       category:'HIV/Leprosy',recommendation:'Avoid in severe deficiency; causes methaemoglobinaemia', level:'CPIC B' },
        { name:'Chloroquine',   category:'Malaria', recommendation:'Generally safe; mild oxidative stress — monitor in severe deficiency', level:'Informative' },
      ],
      africa_note: 'P. vivax malaria expansion in Africa makes G6PD testing critical. Affordable point-of-care G6PD tests (CareStart, BinaxNOW) are now WHO-prequalified. Roll-out is ongoing across Africa CDC programmes.'
    },
    {
      gene: 'SLCO1B1',
      fullname: 'Solute Carrier Organic Anion Transporter 1B1',
      function: 'Statin uptake into liver',
      color: '#ff6b6b',
      summary: 'SLCO1B1*5 (rs4149056) causes simvastatin-induced myopathy — 10× higher risk in *5 homozygotes. Variant frequency is ~5% in Africans vs 15% in Europeans. Non-communicable disease burden in Africa is driving statin use, making pharmacogenomics guidance increasingly important.',
      alleles: [
        { name:'*1a', function:'Normal function',  raf_afr:0.84, raf_eur:0.72, raf_eas:0.72 },
        { name:'*5',  function:'Decreased uptake', raf_afr:0.05, raf_eur:0.15, raf_eas:0.11 },
        { name:'*15', function:'Decreased uptake', raf_afr:0.03, raf_eur:0.05, raf_eas:0.13 },
      ],
      drugs: [
        { name:'Simvastatin',   category:'Cardiovascular', recommendation:'Switch to pravastatin or rosuvastatin in *5 carriers — lower myopathy risk', level:'CPIC A' },
        { name:'Atorvastatin',  category:'Cardiovascular', recommendation:'Preferred alternative — not SLCO1B1 substrate', level:'CPIC B' },
        { name:'Metformin',     category:'Diabetes',       recommendation:'SLCO1B1 modulates metformin pharmacokinetics; minor clinical effect', level:'Informative' },
      ],
      africa_note: 'As hypertension and cardiovascular disease rise across Sub-Saharan Africa, statin prescribing is increasing rapidly. SLCO1B1 genotyping would reduce hospitalisation for drug-induced myopathy — high cost-effectiveness in high-volume settings.'
    },
    {
      gene: 'HLA-B*57:01',
      fullname: 'HLA-B allele *57:01',
      function: 'Abacavir hypersensitivity (HIV)',
      color: '#a371f7',
      summary: 'HLA-B*57:01 causes severe hypersensitivity reaction (HSR) to abacavir in ~5–8% of Europeans carrying the allele. Critically, frequency is only 1–2% in African populations. Routine screening (as done in Europe/USA) has lower yield in Africa — but Abacavir/3TC/DTG is now preferred first-line in PEPFAR programmes.',
      alleles: [
        { name:'HLA-B*57:01', function:'Abacavir HSR risk', raf_afr:0.01, raf_eur:0.06, raf_eas:0.02 },
        { name:'Other HLA-B', function:'No HSR risk',        raf_afr:0.99, raf_eur:0.94, raf_eas:0.98 },
      ],
      drugs: [
        { name:'Abacavir (ABC)', category:'HIV', recommendation:'Screen before prescribing — even low AFR frequency (1%) translates to thousands of preventable HSRs at PEPFAR scale', level:'FDA / CPIC A' },
        { name:'ABC/3TC/DTG',    category:'HIV', recommendation:'Preferred PEPFAR first-line 2024; HLA-B*57:01 screening integrated in national guidelines (Botswana, South Africa)', level:'WHO' },
      ],
      africa_note: 'At 15 million people on ART in Africa, HLA-B*57:01 testing prevents ~75,000-150,000 severe hypersensitivity reactions annually if universally applied. Cost-effectiveness evidence supports routine screening in all African national HIV programmes.'
    },
  ];

  /* ── Drug category filter ── */
  const CATEGORIES = ['All', 'HIV', 'TB', 'Malaria', 'Pain', 'Cancer', 'Transplant', 'Cardiovascular'];

  let _activeGene   = null;
  let _activeCat    = 'All';

  /* ── Frequency bar SVG ── */
  function _freqBar(afr, eur, eas, color) {
    const W = 120, H = 36, barH = 9, gap = 3;
    const labels = ['AFR','EUR','EAS'];
    const vals   = [afr, eur, eas];
    const cols   = [color, '#A8A098', '#58a6ff'];
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
      ${vals.map((v, i) => `
        <rect x="26" y="${i*(barH+gap)}" width="${v*80}" height="${barH}" rx="2" fill="${cols[i]}" opacity="0.85"/>
        <text x="24" y="${i*(barH+gap)+barH-1}" font-size="6.5" fill="#A8A098" text-anchor="end" font-family="monospace">${labels[i]}</text>
        <text x="${26+v*80+3}" y="${i*(barH+gap)+barH-1}" font-size="6.5" fill="${cols[i]}" font-family="monospace">${(v*100).toFixed(0)}%</text>
      `).join('')}
    </svg>`;
  }

  function _renderGeneList() {
    const list = document.getElementById('pgx-gene-list');
    if (!list) return;
    list.innerHTML = GENES.map(g => `
      <button class="pgx-gene-btn ${_activeGene === g.gene ? 'active' : ''}"
        style="border-color:${g.color}40;${_activeGene === g.gene ? `background:${g.color}18;border-color:${g.color}` : ''}"
        onclick="OmicsLab.PGx.selectGene('${g.gene}')">
        <div class="pgx-gene-name" style="color:${g.color}">${g.gene}</div>
        <div class="pgx-gene-func">${g.function}</div>
      </button>
    `).join('');
  }

  function selectGene(geneId) {
    _activeGene = geneId;
    _renderGeneList();
    _renderGeneDetail();
  }

  function _renderGeneDetail() {
    const panel = document.getElementById('pgx-detail');
    if (!panel) return;
    if (!_activeGene) {
      panel.innerHTML = `<div class="pgx-empty">Select a gene from the list to see pharmacogenomics details, African allele frequencies, and clinical recommendations.</div>`;
      return;
    }
    const g = GENES.find(x => x.gene === _activeGene);
    if (!g) return;

    const alleleRows = g.alleles.map(a => `
      <tr>
        <td><b style="color:${g.color}">${a.name}</b></td>
        <td style="color:#A8A098">${a.function}</td>
        <td>${_freqBar(a.raf_afr, a.raf_eur, a.raf_eas, g.color)}</td>
      </tr>
    `).join('');

    const drugRows = g.drugs.map(d => {
      const catColors = { HIV:'#f97316', TB:'#e3b341', Malaria:'#58a6ff', Pain:'#bc8cff', Cancer:'#ff6b6b', Transplant:'#00C4A0', Cardiovascular:'#58a6ff', Oncology:'#ff6b6b', Psychiatry:'#a371f7', Respiratory:'#00C4A0', Diabetes:'#e3b341', Leprosy:'#A8A098' };
      const catCol = catColors[d.category] || '#A8A098';
      return `<tr>
        <td><b style="color:#A8A098">${d.name}</b></td>
        <td><span class="pgx-cat-badge" style="background:${catCol}20;color:${catCol}">${d.category}</span></td>
        <td style="font-size:0.77rem;color:#A8A098">${d.recommendation}</td>
        <td><span class="pgx-level" style="color:${d.level.startsWith('CPIC A') || d.level.startsWith('FDA') || d.level.startsWith('WHO') ? '#f85149' : '#e3b341'}">${d.level}</span></td>
      </tr>`;
    }).join('');

    panel.innerHTML = `
      <div class="pgx-detail-header" style="border-color:${g.color}">
        <div>
          <div class="pgx-detail-gene" style="color:${g.color}">${g.gene}</div>
          <div class="pgx-detail-fullname">${g.fullname}</div>
          <div class="pgx-detail-function">${g.function}</div>
        </div>
      </div>

      <div class="pgx-summary-box" style="border-color:${g.color}40">
        ${g.summary}
      </div>

      <div class="pgx-section-title">Star Alleles &amp; Frequency in African vs Global Populations</div>
      <div class="pgx-table-wrap">
        <table class="pgx-table">
          <thead><tr><th>Allele</th><th>Function</th><th>Allele Frequency (bar = 100%)</th></tr></thead>
          <tbody>${alleleRows}</tbody>
        </table>
      </div>

      <div class="pgx-section-title" style="margin-top:1.25rem">Clinical Drug Recommendations (CPIC / WHO / FDA)</div>
      <div class="pgx-table-wrap">
        <table class="pgx-table">
          <thead><tr><th>Drug</th><th>Category</th><th>Recommendation</th><th>Evidence Level</th></tr></thead>
          <tbody>${drugRows}</tbody>
        </table>
      </div>

      <div class="pgx-africa-note">
        <div class="pgx-africa-note-title">African Context</div>
        ${g.africa_note}
      </div>
    `;
  }

  function filterCategory(cat, btn) {
    _activeCat = cat;
    document.querySelectorAll('.pgx-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function init() {
    const container = document.getElementById('pgx-content');
    if (!container || container.querySelector('.pgx-page')) return;

    const catBtns = CATEGORIES.map(c =>
      `<button class="pgx-cat-btn ${c === 'All' ? 'active' : ''}" onclick="OmicsLab.PGx.filterCategory('${c}',this)">${c}</button>`
    ).join('');

    const summaryCards = [
      { stat:'73%', label:'of Africans express CYP3A5', note:'2× higher tacrolimus dose needed', color:'#00C4A0' },
      { stat:'30%', label:'carry CYP2B6*6 (EFV toxicity)', note:'5× higher efavirenz plasma levels', color:'#f97316' },
      { stat:'15%', label:'G6PD A− deficiency (Sub-Saharan)', note:'Primaquine contraindicated', color:'#58a6ff' },
      { stat:'50%', label:'NAT2 slow acetylators', note:'INH peripheral neuropathy risk', color:'#e3b341' },
    ];

    container.innerHTML = `
      <div class="pgx-page">
        <div class="pgx-header">
          <h1 class="pgx-title">Pharmacogenomics Africa</h1>
          <p class="pgx-subtitle">Drug-gene interactions in African populations — CYP variants, star alleles, CPIC/WHO clinical recommendations for HIV, TB, malaria, and NCDs</p>
        </div>

        <div class="pgx-summary-row">
          ${summaryCards.map(s => `
            <div class="pgx-summary-card" style="border-top-color:${s.color}">
              <div class="pgx-summary-stat" style="color:${s.color}">${s.stat}</div>
              <div class="pgx-summary-label">${s.label}</div>
              <div class="pgx-summary-note">${s.note}</div>
            </div>
          `).join('')}
        </div>

        <div class="pgx-filter-row">
          <span class="pgx-filter-label">Filter by drug category:</span>
          ${catBtns}
        </div>

        <div class="pgx-layout">
          <div class="pgx-gene-sidebar">
            <div class="pgx-sidebar-title">Pharmacogenes</div>
            <div id="pgx-gene-list"></div>
          </div>
          <div class="pgx-detail-panel" id="pgx-detail">
            <div class="pgx-empty">Select a pharmacogene from the left panel to view African allele frequencies, clinical significance, and drug recommendations.</div>
          </div>
        </div>

        <div class="pgx-resources">
          <div class="pgx-resources-title">Key Resources</div>
          <div class="pgx-resource-grid">
            ${[
              { name:'CPIC Guidelines',    url:'https://cpicpgx.org/guidelines/', desc:'Clinical Pharmacogenomics Implementation Consortium'},
              { name:'PharmGKB',           url:'https://www.pharmgkb.org/',       desc:'Pharmacogenomics knowledge base' },
              { name:'PharmVar (CYP2D6)',  url:'https://www.pharmvar.org/',       desc:'Pharmacogene Variation Consortium — star alleles' },
              { name:'H3Africa PGx',       url:'https://h3africa.org/',           desc:'African pharmacogenomics research consortium' },
              { name:'DPWG Guidelines',    url:'https://www.pharmgkb.org/page/dpwg', desc:'Dutch Pharmacogenomics Working Group' },
              { name:'African PGx Network',url:'https://apgxn.org/',              desc:'African pharmacogenomics network' },
            ].map(r => `
              <div class="pgx-resource-card">
                <div class="pgx-resource-name">${r.name}</div>
                <div class="pgx-resource-desc">${r.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    _renderGeneList();
    selectGene('CYP2B6');
  }

  return { init, selectGene, filterCategory };
})();
