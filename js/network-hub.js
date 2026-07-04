/* ═══════════════════════════════════════════════════════════════
   OmicsLab — African Genomics Network Hub
   Directory of institutions, consortia, initiatives, and
   research programmes active in African genomics.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.NetworkHub = (function () {

  /* ── Institutions ── */
  const INSTITUTIONS = [
    {
      id:'h3africa', name:'H3Africa Consortium', short:'H3Africa',
      country:'Pan-African', region:'all', flag:'🌍',
      type:'consortium', focus:['Genomics','Population Genetics','Ethics'],
      members:51, countries:30, datasets:'54,000+ samples',
      pi:'Prof. Neil Hanchard / Secretariat Nairobi',
      tools:['PLINK2','GATK4','REGENIE','R/Bioconductor'],
      highlight:'The Human Heredity and Health in Africa consortium — largest coordinated genomics initiative on the continent. Covers sickle cell, TB, HIV, cancer, stroke, diabetes.',
      color:'#00C4A0',
      website:'h3africa.org'
    },
    {
      id:'sanbi', name:'South African National Bioinformatics Institute', short:'SANBI',
      country:'South Africa', region:'southern', flag:'🇿🇦',
      type:'institute', focus:['Bioinformatics','Training','Databases'],
      members:80, countries:1, datasets:'Galaxy Africa workflows',
      pi:'Prof. Alan Christoffels',
      tools:['Galaxy','Nextflow','Python','R'],
      highlight:'Leading bioinformatics training institute in Africa. Houses the Galaxy Africa server and H3ABioNet training node. Trains >500 researchers/year.',
      color:'#007b5e',
      website:'sanbi.ac.za'
    },
    {
      id:'kemri', name:'Kenya Medical Research Institute', short:'KEMRI',
      country:'Kenya', region:'eastern', flag:'🇰🇪',
      type:'institute', focus:['Malaria','HIV','TB','Genomics'],
      members:2800, countries:1, datasets:'Malaria genomics, KEMRI-Wellcome cohorts',
      pi:'Director General Dr. Pius Masibo',
      tools:['GATK4','BWA-MEM2','STAR','Picard'],
      highlight:'One of Africa\'s largest medical research institutes. KEMRI-Wellcome trust site in Kilifi has published landmark malaria genomics and vaccine studies.',
      color:'#006600',
      website:'kemri.go.ke'
    },
    {
      id:'waccbip', name:'West African Centre for Cell Biology of Infectious Pathogens', short:'WACCBIP',
      country:'Ghana', region:'western', flag:'🇬🇭',
      type:'centre', focus:['Malaria','COVID-19','GWAS','Cell Biology'],
      members:150, countries:5, datasets:'AWI-Gen sub-cohort, Ghana SARS-CoV-2',
      pi:'Prof. Gordon Awandare',
      tools:['PLINK2','Nanopore','GATK4','Python'],
      highlight:'University of Ghana centre combining genomics, cell biology, and epidemiology. Key AWI-Gen partner. Leads malaria P. falciparum WGS in West Africa.',
      color:'#006b3f',
      website:'waccbip.org'
    },
    {
      id:'ahri', name:'Africa Health Research Institute', short:'AHRI',
      country:'South Africa', region:'southern', flag:'🇿🇦',
      type:'institute', focus:['HIV','TB','Genomics','Clinical'],
      members:450, countries:1, datasets:'FRESH cohort, Zibula cohort',
      pi:'Prof. Alex Sigal / Prof. Quarraisha Abdool Karim',
      tools:['Illumina','Nanopore','STAR','DESeq2'],
      highlight:'KwaZulu-Natal institute specialising in HIV, TB co-infection, and single-cell genomics of immune responses. FRESH cohort follows HIV acquisition in young women.',
      color:'#c8102e',
      website:'ahri.ac.za'
    },
    {
      id:'ihvn', name:'Institute of Human Virology Nigeria', short:'IHVN',
      country:'Nigeria', region:'western', flag:'🇳🇬',
      type:'institute', focus:['HIV','Genomics','Clinical Trials'],
      members:2000, countries:1, datasets:'Nigeria HIV genome cohort, PEPFAR data',
      pi:'Prof. Patrick Dakum',
      tools:['GATK4','VEP','ClinVar','PLINK'],
      highlight:'Nigeria\'s leading HIV research institute. Manages one of Africa\'s largest ART programmes (500,000+ patients) and conducts HIV genomics to understand treatment outcomes.',
      color:'#008751',
      website:'ihvnigeria.org'
    },
    {
      id:'uvri', name:'Uganda Virus Research Institute', short:'UVRI',
      country:'Uganda', region:'eastern', flag:'🇺🇬',
      type:'institute', focus:['HIV','Ebola','Arbovirus','Genomics'],
      members:600, countries:1, datasets:'MRC Uganda cohorts, Ebola WGS',
      pi:'Director Dr. Pontiano Kaleebu',
      tools:['Illumina','Oxford Nanopore','BWA','GATK'],
      highlight:'Established 1936. Historic role in HIV discovery. Now leads Ebola, arbovirus, and COVID-19 genomic surveillance in East Africa. Key role in Africa CDC pathogen networks.',
      color:'#fcdc04',
      website:'uvri.go.ug'
    },
    {
      id:'awigen', name:'AWI-Gen / H3Africa GWAS', short:'AWI-Gen',
      country:'Multi-country', region:'all', flag:'🌍',
      type:'consortium', focus:['GWAS','Cardiometabolic','Population Genetics'],
      members:12000, countries:4, datasets:'12,000 adults — Ghana, Kenya, Nigeria, South Africa',
      pi:'Prof. Michèle Ramsay (WITS)',
      tools:['PLINK2','REGENIE','SHAPEIT4','Minimac4'],
      highlight:'Africa-Wits-INDEPTH Partnership for Genomic Studies. The largest cardiometabolic GWAS in Africa. Produced Africa-specific reference panel for genotype imputation.',
      color:'#4a90e2',
      website:'awigehn.org'
    },
    {
      id:'pasteur', name:'Institut Pasteur de Dakar', short:'IPD',
      country:'Senegal', region:'western', flag:'🇸🇳',
      type:'institute', focus:['Arboviruses','Outbreak Response','Genomics'],
      members:300, countries:1, datasets:'Yellow fever, dengue, Ebola WGS',
      pi:'Dr. Amadou Alpha Sall',
      tools:['Nanopore','ARTIC','Nextstrain','BEAST'],
      highlight:'Francophone Africa\'s leading infectious disease institute. Critical role in WHO-coordinated outbreak response. Produces WHO-prequalified yellow fever vaccines.',
      color:'#003189',
      website:'pasteur.sn'
    },
    {
      id:'cema', name:'Centre for Epidemic and Microbiology Africa', short:'CEMA',
      country:'Botswana', region:'southern', flag:'🇧🇼',
      type:'centre', focus:['COVID-19','Pathogen Genomics','One Health'],
      members:80, countries:1, datasets:'Botswana SARS-CoV-2 genomic surveillance',
      pi:'Dr. Sikhulile Moyo',
      tools:['ARTIC','Illumina COVIDSeq','Nextstrain','Galaxy'],
      highlight:'Led Botswana\'s discovery of the Omicron variant (B.1.1.529) in November 2021. Now operates national pathogen genomic surveillance system.',
      color:'#75AADB',
      website:'botswana.harvard.edu'
    },
    {
      id:'mrcg', name:'MRC Unit The Gambia', short:'MRCG',
      country:'Gambia', region:'western', flag:'🇬🇲',
      type:'institute', focus:['Malaria','TB','Child Health','Genomics'],
      members:700, countries:1, datasets:'Gambia child cohorts, malaria WGS',
      pi:'Prof. Umberto D\'Alessandro',
      tools:['Illumina','BWA','GATK4','Salmon'],
      highlight:'50+ year record of landmark tropical disease research. MalariaCare trial, vaccine trials (RTS,S, R21), and malaria genetic studies shape global policy.',
      color:'#3A7D44',
      website:'mrc.gm'
    },
    {
      id:'nimr', name:'Nigerian Institute of Medical Research', short:'NIMR',
      country:'Nigeria', region:'western', flag:'🇳🇬',
      type:'institute', focus:['HIV','Tuberculosis','Malaria','Genomics'],
      members:400, countries:1, datasets:'Lagos HIV cohort, malaria drug resistance',
      pi:'Director Prof. Babatunde Salako',
      tools:['GATK','BWA','Picard','R'],
      highlight:'Federal institute conducting research across HIV, TB, malaria, and tropical diseases. Houses Nigeria\'s national reference laboratory for pathogen sequencing.',
      color:'#008751',
      website:'nimr.gov.ng'
    },
    {
      id:'apcdr', name:'African Partnership for Chronic Disease Research', short:'APCDR',
      country:'Uganda / South Africa', region:'all', flag:'🌍',
      type:'consortium', focus:['NCD','GWAS','Bioinformatics Training'],
      members:3000, countries:8, datasets:'6,000+ NCD samples, Uganda/SA cohorts',
      pi:'Prof. Pontiano Kaleebu / Prof. Raj Ramesar',
      tools:['PLINK2','RegSNPs','PolyPhen','SIFT'],
      highlight:'Focuses on non-communicable disease genetics: hypertension, type 2 diabetes, stroke, and renal disease across African populations.',
      color:'#a371f7',
      website:'apcdr.org'
    },
    {
      id:'pandora', name:'PANDORA-ID-NET', short:'PANDORA',
      country:'Pan-African', region:'all', flag:'🌍',
      type:'network', focus:['COVID-19','Pathogen Surveillance','AMR'],
      members:200, countries:13, datasets:'SARS-CoV-2, TB, malaria AMR WGS',
      pi:'Prof. Alimuddin Zumla (UCL)',
      tools:['Nanopore','ARTIC','Kraken2','FastQC'],
      highlight:'Pan-African Network for Rapid Research, Response and Preparedness for Infectious Disease Epidemics. Real-time genomic surveillance across 13 African countries.',
      color:'#ff6b6b',
      website:'pandora-id.net'
    },
    {
      id:'africacdc', name:'Africa CDC Pathogen Genomics Initiative', short:'Africa CDC',
      country:'Pan-African', region:'all', flag:'🌍',
      type:'consortium', focus:['Surveillance','AMR','Outbreak Response','Training'],
      members:500, countries:55, datasets:'PGI national sequencing programmes',
      pi:'Dr. John Nkengasong (founded) / Dr. Jean Kaseya (current DG)',
      tools:['Nanopore','Illumina COVIDSeq','ARTIC','Nextstrain'],
      highlight:'Africa CDC Pathogen Genomics Initiative (Africa PGI) — continental genomic surveillance covering all 55 African Union member states. Launched post-COVID-19 to build sovereign sequencing capacity.',
      color:'#007bff',
      website:'africacdc.org'
    },
    {
      id:'h3abionet', name:'H3ABioNet', short:'H3ABioNet',
      country:'Pan-African', region:'all', flag:'🌍',
      type:'network', focus:['Bioinformatics','Training','Infrastructure'],
      members:300, countries:25, datasets:'Bioinformatics training datasets, Galaxy flows',
      pi:'Prof. Nicola Mulder (UCT)',
      tools:['Galaxy','Nextflow','GATK','Python','R'],
      highlight:'Pan-African bioinformatics network. Runs annual bioinformatics training across 25 countries, maintains Galaxy Africa server, and develops African genomics pipelines.',
      color:'#00bcd4',
      website:'h3abionet.org'
    },
    {
      id:'cermel', name:'Centre de Recherches Médicales de Lambaréné', short:'CERMEL',
      country:'Gabon', region:'central', flag:'🇬🇦',
      type:'centre', focus:['Malaria','Ebola','Clinical Trials','Genomics'],
      members:250, countries:1, datasets:'Lambaréné malaria cohort, Ebola immune response',
      pi:'Prof. Benjamin Mordmüller',
      tools:['Illumina','BWA','GATK4','DESeq2'],
      highlight:'Central African research centre in Lambaréné, Gabon. Famous for Albert Schweitzer Hospital. Now leads malaria vaccine trials and Ebola immune profiling.',
      color:'#009e60',
      website:'cermel.org'
    },
    {
      id:'ircad', name:'Infectious Disease Institute Addis Ababa', short:'IDI Ethiopia',
      country:'Ethiopia', region:'eastern', flag:'🇪🇹',
      type:'institute', focus:['HIV','TB','Malaria','NCD Genomics'],
      members:350, countries:1, datasets:'Ethiopia HIV genome, NAT2 pharmacogenomics',
      pi:'Director Prof. Tizita Tilahun',
      tools:['GATK4','BWA','VEP','R/CRAN'],
      highlight:'Leads East African HIV/TB co-infection genomics and is a key node for Ethiopian pharmacogenomics (NAT2 studies for isoniazid personalisation).',
      color:'#078930',
      website:'isg.uwo.ca/IDI'
    },
  ];

  /* ── Initiatives / Programmes ── */
  const INITIATIVES = [
    {
      name:'H3Africa Biorepository', type:'Biobank',
      desc:'Centralised biobank for H3Africa samples — 250,000+ biospecimens from 30 countries stored at -80°C. Governed by H3Africa ethics framework.',
      link:'h3africa.org/resources/biorepository', color:'#00C4A0'
    },
    {
      name:'Africa PGI Sequencing Network', type:'Surveillance',
      desc:'54-country national sequencing programme under Africa CDC. Each member state has ≥1 ISO-accredited sequencing facility. Targets: AMR, COVID-19, mpox, Ebola.',
      link:'africacdc.org/pgi', color:'#007bff'
    },
    {
      name:'AWI-Gen Reference Panel', type:'Imputation',
      desc:'Africa-specific genotype imputation reference panel — 14.5M variants from 11,876 participants across 4 countries. Best accuracy for GWAS in African cohorts.',
      link:'awigehn.org/data', color:'#4a90e2'
    },
    {
      name:'PANDORA Genomic Surveillance', type:'Outbreak Response',
      desc:'Real-time SARS-CoV-2, mpox, and AMR WGS surveillance across 13 African countries. Data shared via GISAID and open-access pre-prints.',
      link:'pandora-id.net/genomics', color:'#ff6b6b'
    },
    {
      name:'Africa Bioethics Network', type:'Ethics',
      desc:'Cross-continental ethics network ensuring community benefit, data sovereignty, and equitable authorship in African genomics research.',
      link:'h3africa.org/ethics', color:'#bc8cff'
    },
    {
      name:'Galaxy Africa Server', type:'Infrastructure',
      desc:'Free cloud bioinformatics platform for African researchers. 200+ tools, 50TB storage per user. Hosted by SANBI/H3ABioNet.',
      link:'africa.usegalaxy.eu', color:'#00bcd4'
    },
  ];

  /* ── Active filters ── */
  let _regionFilter = 'all';
  let _focusFilter  = 'all';
  let _activeInst   = null;

  const REGIONS = { all:'All Regions', western:'West Africa', eastern:'East Africa', southern:'Southern Africa', northern:'North Africa', central:'Central Africa' };
  const FOCUS_AREAS = ['all','Genomics','HIV','Malaria','TB','Training','Bioinformatics','GWAS','Surveillance'];

  function _filteredInsts() {
    return INSTITUTIONS.filter(i => {
      if (_regionFilter !== 'all' && i.region !== 'all' && i.region !== _regionFilter) return false;
      if (_focusFilter !== 'all' && !i.focus.some(f => f.toLowerCase().includes(_focusFilter.toLowerCase()))) return false;
      return true;
    });
  }

  function _renderList() {
    const list = document.getElementById('nh-inst-list');
    if (!list) return;
    const insts = _filteredInsts();
    list.innerHTML = insts.length === 0 ? `<div class="nh-empty">No institutions match the current filters.</div>` :
      insts.map(inst => `
        <button class="nh-inst-card ${_activeInst === inst.id ? 'active' : ''}"
          style="border-color:${_activeInst === inst.id ? inst.color : inst.color + '30'}"
          onclick="OmicsLab.NetworkHub.select('${inst.id}')">
          <div class="nh-inst-top">
            <span class="nh-inst-short" style="color:${inst.color}">${inst.short}</span>
            <span class="nh-inst-country">${inst.country}</span>
          </div>
          <div class="nh-inst-name">${inst.name}</div>
          <div class="nh-inst-focus">
            ${inst.focus.slice(0,3).map(f => `<span class="nh-focus-tag">${f}</span>`).join('')}
          </div>
        </button>
      `).join('');
  }

  function select(id) {
    _activeInst = id;
    _renderList();
    const inst = INSTITUTIONS.find(i => i.id === id);
    const detail = document.getElementById('nh-detail');
    if (!inst || !detail) return;

    detail.innerHTML = `
      <div class="nh-detail-header" style="border-color:${inst.color}">
        <div class="nh-detail-name">${inst.name}</div>
        <div class="nh-detail-meta">
          <span>${inst.country}</span>
          <span class="nh-detail-type" style="color:${inst.color}">${inst.type}</span>
        </div>
      </div>

      <p class="nh-detail-highlight">${inst.highlight}</p>

      <div class="nh-detail-stats">
        ${inst.members ? `<div class="nh-detail-stat"><div class="nh-ds-n">${inst.members >= 1000 ? (inst.members/1000).toFixed(0)+'K+' : inst.members+'+'}</div><div class="nh-ds-l">Staff / Members</div></div>` : ''}
        ${inst.countries > 1 ? `<div class="nh-detail-stat"><div class="nh-ds-n">${inst.countries}</div><div class="nh-ds-l">Countries</div></div>` : ''}
        <div class="nh-detail-stat"><div class="nh-ds-n" style="font-size:0.8rem">${inst.datasets}</div><div class="nh-ds-l">Key Datasets</div></div>
      </div>

      <div class="nh-detail-row">
        <div>
          <div class="nh-detail-section-title">Research Focus</div>
          <div class="nh-focus-tags">${inst.focus.map(f => `<span class="nh-focus-tag-lg" style="background:${inst.color}18;color:${inst.color}">${f}</span>`).join('')}</div>
        </div>
        <div>
          <div class="nh-detail-section-title">Common Tools</div>
          <div class="nh-tools">${inst.tools.map(t => `<span class="nh-tool">${t}</span>`).join('')}</div>
        </div>
      </div>

      ${inst.pi ? `<div class="nh-detail-pi">Principal Investigator / Director: <b>${inst.pi}</b></div>` : ''}
      <div class="nh-detail-website">Website: <a href="https://${inst.website}" target="_blank" rel="noopener" style="color:${inst.color}">${inst.website}</a></div>
    `;
  }

  function setRegion(r, btn) {
    _regionFilter = r;
    document.querySelectorAll('.nh-region-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _renderList();
  }

  function setFocus(f, btn) {
    _focusFilter = f;
    document.querySelectorAll('.nh-focus-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _renderList();
  }

  function init() {
    const container = document.getElementById('network-hub-content');
    if (!container || container.querySelector('.nh-page')) return;

    const regionBtns = Object.entries(REGIONS).map(([k,v]) =>
      `<button class="nh-region-btn ${k==='all'?'active':''}" onclick="OmicsLab.NetworkHub.setRegion('${k}',this)">${v}</button>`
    ).join('');

    const focusBtns = FOCUS_AREAS.map(f =>
      `<button class="nh-focus-btn ${f==='all'?'active':''}" onclick="OmicsLab.NetworkHub.setFocus('${f}',this)">${f === 'all' ? 'All Focus Areas' : f}</button>`
    ).join('');

    const initiativeCards = INITIATIVES.map(ini => `
      <div class="nh-initiative-card" style="border-top-color:${ini.color}">
        <div class="nh-ini-type" style="color:${ini.color}">${ini.type}</div>
        <div class="nh-ini-name">${ini.name}</div>
        <div class="nh-ini-desc">${ini.desc}</div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="nh-page">
        <div class="nh-header">
          <h1 class="nh-title">African Genomics Network</h1>
          <p class="nh-subtitle">${INSTITUTIONS.length} institutions &amp; research groups · ${INITIATIVES.length} major initiatives · Pan-African genomics ecosystem</p>
        </div>

        <div class="nh-map-strip">
          <div class="nh-map-stat"><span class="nh-map-n">54</span><span>AU Member States</span></div>
          <div class="nh-map-stat"><span class="nh-map-n">${INSTITUTIONS.length}+</span><span>Research Institutions</span></div>
          <div class="nh-map-stat"><span class="nh-map-n">250K+</span><span>Biospecimens (H3Africa)</span></div>
          <div class="nh-map-stat"><span class="nh-map-n">12,000+</span><span>Trained Bioinformaticians</span></div>
          <div class="nh-map-stat"><span class="nh-map-n">$2.5B</span><span>Research Investment (2010-2025)</span></div>
        </div>

        <!-- Filters -->
        <div class="nh-filters">
          <div class="nh-filter-row">
            <span class="nh-filter-label">Region:</span>
            ${regionBtns}
          </div>
          <div class="nh-filter-row">
            <span class="nh-filter-label">Focus:</span>
            ${focusBtns}
          </div>
        </div>

        <!-- Institution browser -->
        <div class="nh-layout">
          <div class="nh-inst-sidebar">
            <div class="nh-sidebar-title">Institutions &amp; Consortia</div>
            <div id="nh-inst-list" class="nh-inst-list"></div>
          </div>
          <div class="nh-detail-panel" id="nh-detail">
            <div class="nh-empty">Select an institution from the list to see details, research focus, datasets, and tools.</div>
          </div>
        </div>

        <!-- Initiatives -->
        <div class="nh-initiatives">
          <div class="nh-section-title">Major Programmes &amp; Initiatives</div>
          <div class="nh-initiatives-grid">${initiativeCards}</div>
        </div>

        <!-- Training resources -->
        <div class="nh-training">
          <div class="nh-section-title">Training &amp; Capacity Building</div>
          <div class="nh-training-grid">
            ${[
              { name:'H3ABioNet Online Courses',     url:'training.h3abionet.org',  desc:'Free online bioinformatics courses — GWAS, RNA-seq, metagenomics, Python', color:'#00bcd4' },
              { name:'SANBI Bioinformatics Training', url:'sanbi.ac.za/training',    desc:'In-person and virtual workshops for African researchers', color:'#007b5e' },
              { name:'EMBL-EBI African Fellowship',   url:'ebi.ac.uk/training',      desc:'Annual research fellowships for African bioinformaticians at Hinxton', color:'#4a90e2' },
              { name:'Wellcome Genome Campus Africa', url:'wellcomeconnectingscience.org', desc:'Genomics and bioinformatics courses held in Africa', color:'#e3b341' },
              { name:'ASBCB Bioinformatics',          url:'asbcb.org',               desc:'African Society for Bioinformatics and Computational Biology', color:'#f97316' },
              { name:'Galaxy Training Network',       url:'training.galaxyproject.org', desc:'Free Galaxy tutorials in genomics, proteomics, metabolomics', color:'#00C4A0' },
            ].map(t => `
              <div class="nh-training-card" style="border-left-color:${t.color}">
                <div class="nh-training-name" style="color:${t.color}">${t.name}</div>
                <div class="nh-training-desc">${t.desc}</div>
                <div class="nh-training-url">${t.url}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    _renderList();
    select('h3africa');
  }

  return { init, select, setRegion, setFocus };
})();
