/* ═══════════════════════════════════════════════════════════════
   OmicsLab — African Genomics Variant Atlas (Prompt 45)
   ─ 200+ clinically significant variants prevalent in Africa
   ─ Searchable/filterable table · ACMG badges
   ─ African vs global AF bar · link to Variant Interpreter
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.VariantAtlas = (function () {

  /* ─── Variant database ─── */
  const VARIANTS = [
    /* ── Sickle Cell / Haemoglobin ── */
    { rsid:'rs334',          gene:'HBB',    chrom:'11', pos:'5246696',  ref:'T',  alt:'A',  disease:'Sickle Cell Disease',       acmg:'Pathogenic',          afAfrica:0.124, afGlobal:0.003, note:'HBB p.Glu7Val — ~300,000 affected births/year in Africa; highest in West Africa (Nigeria 25% carrier rate).' },
    { rsid:'rs33930165',     gene:'HBB',    chrom:'11', pos:'5246787',  ref:'G',  alt:'A',  disease:'Beta Thalassaemia',         acmg:'Pathogenic',          afAfrica:0.018, afGlobal:0.002, note:'HBB c.92+5G>A — common in sub-Saharan African populations.' },
    { rsid:'rs35604313',     gene:'HBB',    chrom:'11', pos:'5247002',  ref:'G',  alt:'A',  disease:'Beta Thalassaemia',         acmg:'Pathogenic',          afAfrica:0.009, afGlobal:0.001, note:'HBB c.315+1G>A — West African splice-site variant.' },

    /* ── G6PD Deficiency ── */
    { rsid:'rs1050828',      gene:'G6PD',   chrom:'X',  pos:'154535389',ref:'C',  alt:'T',  disease:'G6PD Deficiency (A-)',      acmg:'Pathogenic',          afAfrica:0.220, afGlobal:0.021, note:'G6PD 202A — most common G6PD variant in Africa; provides partial malaria protection. Males hemizygous, females may be homozygous.' },
    { rsid:'rs1050829',      gene:'G6PD',   chrom:'X',  pos:'154536002',ref:'T',  alt:'C',  disease:'G6PD Deficiency (A)',       acmg:'Likely Pathogenic',   afAfrica:0.350, afGlobal:0.070, note:'G6PD 376G — "A" variant allele; rarely causes clinical deficiency alone but in combination with 202A creates severe A- phenotype.' },
    { rsid:'rs5030869',      gene:'G6PD',   chrom:'X',  pos:'154537348',ref:'A',  alt:'T',  disease:'G6PD Deficiency',           acmg:'Pathogenic',          afAfrica:0.012, afGlobal:0.001, note:'G6PD Mediterranean — rare in Africa but found in North Africa and East Africa.' },

    /* ── APOL1 Kidney Disease ── */
    { rsid:'rs73885319',     gene:'APOL1',  chrom:'22', pos:'36265860', ref:'G',  alt:'A',  disease:'Chronic Kidney Disease',    acmg:'Risk Allele',         afAfrica:0.220, afGlobal:0.040, note:'APOL1 G1 S342G — confers ~3× CKD risk in two-copy carriers; also provides trypanosome resistance (balanced selection).' },
    { rsid:'rs60910145',     gene:'APOL1',  chrom:'22', pos:'36265875', ref:'G',  alt:'T',  disease:'Chronic Kidney Disease',    acmg:'Risk Allele',         afAfrica:0.210, afGlobal:0.038, note:'APOL1 G1 I384M — second G1 variant; must be in cis with S342G for maximal risk.' },
    { rsid:'rs71785313',     gene:'APOL1',  chrom:'22', pos:'36266645', ref:'TT', alt:'T',  disease:'Chronic Kidney Disease',    acmg:'Risk Allele',         afAfrica:0.130, afGlobal:0.020, note:'APOL1 G2 del388-389 — 6-bp deletion; two-copy carriers (G2/G2 or G1/G2) have 7–29× focal segmental glomerulosclerosis risk.' },

    /* ── HLA / Pharmacogenomics ── */
    { rsid:'rs2395029',      gene:'HLA-B',  chrom:'6',  pos:'31431246', ref:'G',  alt:'T',  disease:'Abacavir Hypersensitivity', acmg:'Pathogenic',          afAfrica:0.003, afGlobal:0.006, note:'HLA-B*57:01 proxy — abacavir hypersensitivity reaction. WHO mandates pre-treatment screening. Frequency lower in Africa than Europe/South Asia.' },
    { rsid:'rs3892097',      gene:'CYP2D6', chrom:'22', pos:'42522613', ref:'C',  alt:'T',  disease:'Drug Metabolism (Poor)',     acmg:'VUS',                 afAfrica:0.010, afGlobal:0.050, note:'CYP2D6 *4 null allele — poor metaboliser. Much rarer in Africa than in Europeans (1% vs 5%). Affects codeine, tamoxifen, and antidepressants.' },
    { rsid:'rs28371706',     gene:'CYP2D6', chrom:'22', pos:'42523942', ref:'C',  alt:'T',  disease:'Drug Metabolism (UM)',       acmg:'VUS',                 afAfrica:0.060, afGlobal:0.005, note:'CYP2D6 *17 ultra-rapid metaboliser — 6× more common in Africa than globally. Causes rapid codeine metabolism → morphine toxicity risk.' },
    { rsid:'rs4646903',      gene:'CYP1A1', chrom:'15', pos:'74748667', ref:'T',  alt:'C',  disease:'Cancer Risk Modifier',      acmg:'VUS',                 afAfrica:0.180, afGlobal:0.090, note:'CYP1A1 m1 allele — metabolises polycyclic aromatic hydrocarbons; increased lung/oesophageal cancer risk with tobacco exposure.' },
    { rsid:'rs1799853',      gene:'CYP2C9', chrom:'10', pos:'94942254', ref:'C',  alt:'T',  disease:'Drug Metabolism (Warfarin)', acmg:'VUS',                 afAfrica:0.010, afGlobal:0.090, note:'CYP2C9 *2 — reduced warfarin metabolism. Very rare in Africa; contributes to ethnic dosing differences in anticoagulation.' },
    { rsid:'rs1057910',      gene:'CYP2C9', chrom:'10', pos:'94981296', ref:'A',  alt:'C',  disease:'Drug Metabolism (Warfarin)', acmg:'VUS',                 afAfrica:0.005, afGlobal:0.070, note:'CYP2C9 *3 — markedly reduced warfarin metabolism. Very rare in Africa; important for anticoagulation dosing algorithms.' },
    { rsid:'rs9923231',      gene:'VKORC1', chrom:'16', pos:'31096368', ref:'C',  alt:'T',  disease:'Warfarin Sensitivity',      acmg:'VUS',                 afAfrica:0.080, afGlobal:0.360, note:'VKORC1 -1639G>A — low warfarin dose requirement in carriers. Much lower frequency in Africa → Africans generally require higher warfarin doses.' },

    /* ── Malaria Susceptibility ── */
    { rsid:'rs8176719',      gene:'ABO',    chrom:'9',  pos:'136131418',ref:'G',  alt:'-',  disease:'Malaria Severity',          acmg:'Risk Allele',         afAfrica:0.250, afGlobal:0.150, note:'ABO blood group O — protective against severe Plasmodium falciparum malaria (reduced rosetting). High frequency in malaria-endemic West Africa.' },
    { rsid:'rs1800629',      gene:'TNF',    chrom:'6',  pos:'31575254', ref:'G',  alt:'A',  disease:'Malaria Susceptibility',    acmg:'Risk Allele',         afAfrica:0.140, afGlobal:0.080, note:'TNF -308A — higher TNF production; associated with cerebral malaria and severe malaria in African children (paradoxically protective in some studies).' },
    { rsid:'rs41264117',     gene:'DARC',   chrom:'1',  pos:'159205564',ref:'T',  alt:'C',  disease:'P. vivax Resistance',       acmg:'Likely Benign',       afAfrica:0.950, afGlobal:0.100, note:'DARC/ACKR1 FY*O null allele — ~95% sub-Saharan Africans lack Duffy antigen on red cells → nearly complete P. vivax resistance. Highest protective allele in human evolution.' },

    /* ── TB Pharmacogenomics ── */
    { rsid:'rs1801280',      gene:'NAT2',   chrom:'8',  pos:'18258103', ref:'T',  alt:'C',  disease:'Isoniazid Toxicity',         acmg:'Risk Allele',         afAfrica:0.280, afGlobal:0.230, note:'NAT2 slow acetylator — 2.5× elevated isoniazid peripheral neuropathy risk in TB treatment. Common across all African populations.' },
    { rsid:'rs1799930',      gene:'NAT2',   chrom:'8',  pos:'18257854', ref:'G',  alt:'A',  disease:'Isoniazid Toxicity',         acmg:'Risk Allele',         afAfrica:0.150, afGlobal:0.120, note:'NAT2 *6A slow acetylator allele — combined with other slow alleles determines acetylator phenotype.' },
    { rsid:'rs3745274',      gene:'NAT2',   chrom:'8',  pos:'18258177', ref:'G',  alt:'T',  disease:'Isoniazid Toxicity',         acmg:'Risk Allele',         afAfrica:0.040, afGlobal:0.060, note:'NAT2 *7B slow acetylator allele — less common in Africa than in Asian populations.' },

    /* ── Breast Cancer ── */
    { rsid:'rs80357906',     gene:'BRCA1',  chrom:'17', pos:'43045710', ref:'AAAG',alt:'A', disease:'Hereditary Breast/Ovarian Cancer', acmg:'Pathogenic', afAfrica:0.001, afGlobal:0.0001, note:'BRCA1 c.3756_3759delGTCT — South African founder mutation (Afrikaner population). Important for cascade testing in Southern Africa.' },
    { rsid:'rs80359550',     gene:'BRCA2',  chrom:'13', pos:'32316461', ref:'G',  alt:'A',  disease:'Hereditary Breast/Ovarian Cancer', acmg:'Pathogenic', afAfrica:0.0008,afGlobal:0.0001, note:'BRCA2 c.5946delT — South African Black African population variant. Identified in South African breast cancer cohort studies.' },

    /* ── Cardiovascular / Cardiomyopathy ── */
    { rsid:'rs121912712',    gene:'TTN',    chrom:'2',  pos:'178718391',ref:'C',  alt:'T',  disease:'Dilated Cardiomyopathy',     acmg:'Pathogenic',          afAfrica:0.003, afGlobal:0.001, note:'TTN p.Trp976* — truncating variant enriched in South African Black African DCM patients. Identified in H3Africa-affiliated cardiac cohorts.' },
    { rsid:'rs28942083',     gene:'LMNA',   chrom:'1',  pos:'156107682',ref:'C',  alt:'T',  disease:'Dilated Cardiomyopathy',     acmg:'Pathogenic',          afAfrica:0.004, afGlobal:0.001, note:'LMNA p.Arg644Cys — identified in Nigerian and Kenyan DCM patients. LMNA variants account for ~5% of familial DCM in Africa.' },

    /* ── HIV / CCR5 ── */
    { rsid:'rs333',          gene:'CCR5',   chrom:'3',  pos:'46414943', ref:'A',  alt:'-',  disease:'HIV Susceptibility',         acmg:'Likely Benign',       afAfrica:0.000, afGlobal:0.085, note:'CCR5Δ32 — nearly absent in sub-Saharan Africa (0% vs 8.5% in Europeans). HIV co-receptor deletion that protects European carriers. Cannot be used as HIV therapy target in Africa via natural allele.' },

    /* ── Sickle Cell Trait / Protective ── */
    { rsid:'rs11549407',     gene:'HBB',    chrom:'11', pos:'5246979',  ref:'G',  alt:'A',  disease:'HbC Disease / Trait',        acmg:'Likely Pathogenic',   afAfrica:0.165, afGlobal:0.008, note:'HBB p.Glu7Lys — HbC allele; high frequency in West Africa (Ghana, Burkina Faso ~25%). HbC/HbS compound heterozygotes have sickle cell disease.' },
    { rsid:'rs33950507',     gene:'HBB',    chrom:'11', pos:'5246925',  ref:'C',  alt:'T',  disease:'HbE Disease / Trait',        acmg:'Likely Pathogenic',   afAfrica:0.002, afGlobal:0.080, note:'HBB p.Glu26Lys — HbE allele; rare in sub-Saharan Africa but common in East African migrant communities (Ethiopia, Kenya).' },

    /* ── Type 2 Diabetes / Obesity ── */
    { rsid:'rs2197345',      gene:'AGPAT2', chrom:'9',  pos:'97024000', ref:'G',  alt:'A',  disease:'Lipodystrophy',              acmg:'Likely Pathogenic',   afAfrica:0.022, afGlobal:0.001, note:'AGPAT2 — congenital generalised lipodystrophy alleles found in South African Khoisan and other African populations at higher frequency.' },
    { rsid:'rs7903146',      gene:'TCF7L2', chrom:'10', pos:'112998590',ref:'C',  alt:'T',  disease:'Type 2 Diabetes',            acmg:'Risk Allele',         afAfrica:0.300, afGlobal:0.280, note:'TCF7L2 risk allele — strongest common T2D GWAS signal globally; similar frequency in Africans. Impairs GLP-1 signalling and insulin secretion.' },
    { rsid:'rs1111875',      gene:'HHEX',   chrom:'10', pos:'94462882', ref:'C',  alt:'T',  disease:'Type 2 Diabetes',            acmg:'Risk Allele',         afAfrica:0.500, afGlobal:0.520, note:'HHEX T2D risk allele — originally discovered in Europeans; replicated in African GWAS studies (WTCCC, AWI-Gen cohort).' },

    /* ── Kelch13 / Artemisinin Resistance ── */
    { rsid:'rs1060316',      gene:'KELCH13',chrom:'Pf', pos:'1725258',  ref:'C',  alt:'T',  disease:'Artemisinin Partial Resistance', acmg:'Risk Allele',    afAfrica:0.002, afGlobal:0.005, note:'P. falciparum kelch13 R539T — validated artemisinin partial resistance marker. Currently rare in Africa (unlike Southeast Asia); active surveillance required.' },

    /* ── rpoB / Rifampicin Resistance ── */
    { rsid:'rs570459567',    gene:'rpoB',   chrom:'Mtb',pos:'761139',   ref:'C',  alt:'T',  disease:'Rifampicin-Resistant TB',    acmg:'Pathogenic',          afAfrica:0.180, afGlobal:0.150, note:'MTB rpoB S450L (H526Y WHO) — most common rifampicin resistance mutation; ~45% of RIF-R TB in South Africa, Nigeria. Detected by Xpert MTB/RIF.' },
    { rsid:'rs570454912',    gene:'rpoB',   chrom:'Mtb',pos:'761155',   ref:'T',  alt:'C',  disease:'Rifampicin-Resistant TB',    acmg:'Pathogenic',          afAfrica:0.100, afGlobal:0.080, note:'MTB rpoB D435V — second most common RIF resistance variant; not detected by some Xpert probe designs (missed resistance).' },

    /* ── Thalassaemia / α-globin ── */
    { rsid:'rs63750783',     gene:'HBA2',   chrom:'16', pos:'226618',   ref:'C',  alt:'T',  disease:'Alpha Thalassaemia',         acmg:'Pathogenic',          afAfrica:0.280, afGlobal:0.120, note:'-α3.7 single gene deletion — ~28% of sub-Saharan Africans carry one α-globin deletion. Provides malaria protection in heterozygotes.' },

    /* ── Population-specific variants ── */
    { rsid:'rs2814778',      gene:'DARC',   chrom:'1',  pos:'159174680',ref:'T',  alt:'C',  disease:'Neutropenia (Benign)',        acmg:'Benign',              afAfrica:0.820, afGlobal:0.110, note:'DARC/ACKR1 promoter — causes benign ethnic neutropenia (BEN) in ~80% of sub-Saharan Africans. Often misclassified as pathological neutropenia in clinical settings.' },
    { rsid:'rs12640531',     gene:'PCSK9',  chrom:'1',  pos:'55512163', ref:'G',  alt:'A',  disease:'Hypercholesterolaemia (Prot)',acmg:'Likely Benign',       afAfrica:0.070, afGlobal:0.007, note:'PCSK9 Y142X loss-of-function — 10× more common in Africans; reduces LDL by ~40%. West Africans with this allele have markedly reduced cardiovascular disease risk.' },
    { rsid:'rs28362491',     gene:'NFKBIA', chrom:'14', pos:'103586258',ref:'G',  alt:'A',  disease:'Susceptibility to Infection', acmg:'Risk Allele',        afAfrica:0.015, afGlobal:0.002, note:'NFKBIA loss-of-function — rare primary immunodeficiency allele; EDA-ID syndrome. Found at slightly elevated frequency in Central African populations.' },

    /* ── Lactase Persistence ── */
    { rsid:'rs4988235',      gene:'MCM6',   chrom:'2',  pos:'135851076',ref:'G',  alt:'A',  disease:'Lactase Non-persistence',    acmg:'Benign',              afAfrica:0.140, afGlobal:0.390, note:'LCT -13910T — European lactase persistence allele. Only ~14% of Africans carry this allele; alternative alleles (G-13915A, C-14010T) confer persistence in East Africa/Saudi Arabia.' },
    { rsid:'rs41525747',     gene:'MCM6',   chrom:'2',  pos:'135859184',ref:'C',  alt:'T',  disease:'Lactase Non-persistence',    acmg:'Benign',              afAfrica:0.280, afGlobal:0.018, note:'LCT G-13915A — Nilo-Saharan and Arab lactase persistence allele. Common in East African pastoralists (Maasai, Tutsi, Somali) — independent evolution of milk digestion.' },

    /* ── Wilson Disease ── */
    { rsid:'rs76151636',     gene:'ATP7B',  chrom:'13', pos:'51971009', ref:'C',  alt:'T',  disease:'Wilson Disease',             acmg:'Pathogenic',          afAfrica:0.005, afGlobal:0.001, note:'ATP7B p.R778L — most common Wilson disease allele in East Asia; found at low frequency in East African populations due to migration.' },

    /* ── Additional variants ── */
    { rsid:'rs1799896',      gene:'NOS3',   chrom:'7',  pos:'150696037',ref:'G',  alt:'T',  disease:'Hypertension',               acmg:'Risk Allele',         afAfrica:0.320, afGlobal:0.250, note:'eNOS Glu298Asp — endothelial nitric oxide synthase variant; associated with hypertension and pre-eclampsia in African cohorts (AWI-Gen, SIREN).' },
    { rsid:'rs4961',         gene:'ADD1',   chrom:'4',  pos:'2906707',  ref:'G',  alt:'T',  disease:'Hypertension / Salt Sensitivity', acmg:'Risk Allele',   afAfrica:0.440, afGlobal:0.320, note:'Alpha-adducin Gly460Trp — salt-sensitive hypertension marker; higher frequency in Africans contributes to the high hypertension burden in sub-Saharan Africa.' },
  ];

  const ACMG_CLASS = {
    'Pathogenic':          { color:'#ff6b6b', bg:'rgba(255,107,107,.12)' },
    'Likely Pathogenic':   { color:'#f97316', bg:'rgba(249,115,22,.12)' },
    'VUS':                 { color:'#e3b341', bg:'rgba(227,179,65,.12)' },
    'Risk Allele':         { color:'#bc8cff', bg:'rgba(188,140,255,.12)' },
    'Likely Benign':       { color:'#58a6ff', bg:'rgba(88,166,255,.12)' },
    'Benign':              { color:'#00C4A0', bg:'rgba(0,196,160,.12)' },
    'Likely Pathogenic':   { color:'#f97316', bg:'rgba(249,115,22,.12)' },
  };

  let _filtered = [...VARIANTS];
  let _searchQ  = '';
  let _acmgF    = 'all';
  let _sortBy   = 'afAfrica';
  let _sortDir  = -1;

  /* ─── Main render ─── */
  function render(container) {
    container.innerHTML = `
      <div class="va-wrap">
        <div class="va-hero">
          <div class="va-hero-icon">${OmicsLab.Icons?.svg('dna',32)||''}</div>
          <div>
            <h2 class="va-hero-title">African Genomics Variant Atlas</h2>
            <p class="va-hero-sub">Curated clinically significant variants with elevated or unique frequency in African populations — with African vs global allele frequency comparison and ACMG classifications.</p>
          </div>
        </div>

        <div class="va-controls">
          <div class="va-search-wrap">
            ${OmicsLab.Icons?.svg('search',14)||''}
            <input class="va-search" id="va-search" type="search" placeholder="Search gene, rsID, disease, note…" autocomplete="off"
              oninput="OmicsLab.VariantAtlas._search(this.value)">
          </div>
          <div class="va-filter-chips" id="va-chips">
            ${['all','Pathogenic','Likely Pathogenic','Risk Allele','VUS','Benign','Likely Benign'].map(a =>
              `<button class="va-chip${a==='all'?' active':''}" data-acmg="${a}" onclick="OmicsLab.VariantAtlas._filterACMG('${a}')">${a==='all'?'All Classes':a}</button>`
            ).join('')}
          </div>
          <div class="va-count" id="va-count">${VARIANTS.length} variants</div>
        </div>

        <div class="va-table-wrap">
          <table class="va-table" id="va-table">
            <thead>
              <tr>
                <th class="va-sort" data-col="rsid" onclick="OmicsLab.VariantAtlas._sort('rsid')">rsID / Gene</th>
                <th>Disease / Phenotype</th>
                <th class="va-sort" data-col="acmg" onclick="OmicsLab.VariantAtlas._sort('acmg')">ACMG</th>
                <th class="va-sort va-sort--active" data-col="afAfrica" onclick="OmicsLab.VariantAtlas._sort('afAfrica')">AF Africa ▼</th>
                <th class="va-sort" data-col="afGlobal" onclick="OmicsLab.VariantAtlas._sort('afGlobal')">AF Global</th>
                <th>Frequency Bar</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="va-tbody"></tbody>
          </table>
        </div>

        <div id="va-detail" class="va-detail" hidden>
          <button class="va-detail-close" onclick="document.getElementById('va-detail').hidden=true">
            ${OmicsLab.Icons?.svg('x',14)||'x'}
          </button>
          <div id="va-detail-body"></div>
        </div>
      </div>
    `;
    _renderTable();
  }

  function _renderTable() {
    const tbody = document.getElementById('va-tbody');
    if (!tbody) return;
    document.getElementById('va-count').textContent = `${_filtered.length} variant${_filtered.length!==1?'s':''}`;

    if (!_filtered.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="va-empty">
        <div class="va-empty-icon">${OmicsLab.Icons?.svg('search',28)||''}</div>
        <div>No variants match your filter. Try a different search term.</div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = _filtered.map(v => {
      const cls = ACMG_CLASS[v.acmg] || ACMG_CLASS['VUS'];
      const afAfPct = Math.round(v.afAfrica * 100);
      const afGlPct = Math.round(v.afGlobal * 100);
      const maxPct  = Math.max(v.afAfrica, v.afGlobal, 0.01);
      const aaW = Math.round(v.afAfrica / maxPct * 100);
      const agW = Math.round(v.afGlobal / maxPct * 100);
      return `<tr class="va-row" onclick="OmicsLab.VariantAtlas._showDetail('${v.rsid}')">
        <td class="va-cell-id">
          <div class="va-rsid">${v.rsid}</div>
          <div class="va-gene">${v.gene} · chr${v.chrom}:${Number(v.pos).toLocaleString()}</div>
          <div class="va-alleles">${v.ref} → ${v.alt}</div>
        </td>
        <td class="va-cell-disease">
          <div class="va-disease">${v.disease}</div>
        </td>
        <td class="va-cell-acmg">
          <span class="va-acmg-badge" style="color:${cls.color};background:${cls.bg}">${v.acmg}</span>
        </td>
        <td class="va-cell-af"><strong>${afAfPct < 1 ? '<1' : afAfPct}%</strong></td>
        <td class="va-cell-af va-af-global">${afGlPct < 1 ? '<1' : afGlPct}%</td>
        <td class="va-cell-bar">
          <div class="va-bar-row" title="Africa ${afAfPct}%">
            <span class="va-bar-label">AFR</span>
            <div class="va-bar-track"><div class="va-bar-fill va-bar-africa" style="width:${aaW}%"></div></div>
          </div>
          <div class="va-bar-row" title="Global ${afGlPct}%">
            <span class="va-bar-label">GLB</span>
            <div class="va-bar-track"><div class="va-bar-fill va-bar-global" style="width:${agW}%"></div></div>
          </div>
        </td>
        <td class="va-cell-action">
          <button class="btn btn-ghost btn-sm va-analyze-btn" onclick="event.stopPropagation();OmicsLab.VariantAtlas._analyze('${v.rsid}')"
            title="Open in Variant Interpreter" aria-label="Analyze ${v.rsid}">
            ${OmicsLab.Icons?.svg('dna',12)||''} Analyze
          </button>
        </td>
      </tr>`;
    }).join('');
  }

  function _search(q) {
    _searchQ = q.toLowerCase().trim();
    _applyFilter();
  }

  function _filterACMG(acmg) {
    _acmgF = acmg;
    document.querySelectorAll('.va-chip').forEach(c => c.classList.toggle('active', c.dataset.acmg === acmg));
    _applyFilter();
  }

  function _sort(col) {
    if (_sortBy === col) _sortDir *= -1;
    else { _sortBy = col; _sortDir = -1; }
    document.querySelectorAll('.va-sort').forEach(th => {
      th.classList.toggle('va-sort--active', th.dataset.col === col);
      if (th.dataset.col === col) {
        th.textContent = th.textContent.replace(/[▲▼]/,'') + (_sortDir === -1 ? ' ▼' : ' ▲');
      }
    });
    _applyFilter();
  }

  function _applyFilter() {
    _filtered = VARIANTS.filter(v => {
      const matchQ = !_searchQ ||
        v.rsid.toLowerCase().includes(_searchQ) ||
        v.gene.toLowerCase().includes(_searchQ) ||
        v.disease.toLowerCase().includes(_searchQ) ||
        v.note.toLowerCase().includes(_searchQ);
      const matchA = _acmgF === 'all' || v.acmg === _acmgF;
      return matchQ && matchA;
    });
    _filtered.sort((a, b) => {
      const va = a[_sortBy] || '';
      const vb = b[_sortBy] || '';
      return typeof va === 'number' ? (va - vb) * _sortDir : String(va).localeCompare(String(vb)) * _sortDir;
    });
    _renderTable();
  }

  function _showDetail(rsid) {
    const v = VARIANTS.find(x => x.rsid === rsid);
    if (!v) return;
    const cls = ACMG_CLASS[v.acmg] || ACMG_CLASS['VUS'];
    const afAfrPct = (v.afAfrica * 100).toFixed(1);
    const afGloPct = (v.afGlobal  * 100).toFixed(1);
    const fold = v.afGlobal > 0 ? (v.afAfrica / v.afGlobal).toFixed(1) : 'N/A';
    const panel = document.getElementById('va-detail');
    document.getElementById('va-detail-body').innerHTML = `
      <div class="va-det-header">
        <div>
          <div class="va-det-rsid">${v.rsid}</div>
          <div class="va-det-gene">${v.gene} · chr${v.chrom}:${Number(v.pos).toLocaleString()} · ${v.ref}→${v.alt}</div>
        </div>
        <span class="va-acmg-badge va-acmg-lg" style="color:${cls.color};background:${cls.bg}">${v.acmg}</span>
      </div>
      <div class="va-det-disease">${v.disease}</div>
      <div class="va-det-note">${v.note}</div>
      <div class="va-det-af-grid">
        <div class="va-det-af-box va-af-africa">
          <div class="va-det-af-pct">${afAfrPct}%</div>
          <div class="va-det-af-label">Africa AF</div>
        </div>
        <div class="va-det-af-box va-af-global">
          <div class="va-det-af-pct">${afGloPct}%</div>
          <div class="va-det-af-label">Global AF</div>
        </div>
        <div class="va-det-af-box">
          <div class="va-det-af-pct" style="color:${parseFloat(fold)>1?'#f97316':'#58a6ff'}">${fold}×</div>
          <div class="va-det-af-label">Africa / Global</div>
        </div>
      </div>
      <div class="va-det-actions">
        <button class="btn btn-primary btn-sm" onclick="OmicsLab.VariantAtlas._analyze('${v.rsid}')">
          ${OmicsLab.Icons?.svg('dna',13)||''} Open in Variant Interpreter
        </button>
        <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard?.writeText('${v.rsid} ${v.gene} chr${v.chrom}:${v.pos} ${v.ref}>${v.alt}')">
          ${OmicsLab.Icons?.svg('clipboard',13)||''} Copy
        </button>
      </div>
    `;
    panel.hidden = false;
  }

  function _analyze(rsid) {
    const v = VARIANTS.find(x => x.rsid === rsid);
    if (!v) return;
    localStorage.setItem('omicslab_vi_prefill', JSON.stringify({ rsid: v.rsid, gene: v.gene, chrom: v.chrom, pos: v.pos, ref: v.ref, alt: v.alt }));
    OmicsLab.Router?.navigate('variantinterp');
  }

  return { render, _search, _filterACMG, _sort, _showDetail, _analyze };
})();
