/* ═══════════════════════════════════════════════════════
   OmicsLab — H3Africa Portal (Part 5)
   Catalogue of H3Africa projects, tools, datasets and
   training resources. All offline; no external API.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.H3Africa = (function () {

  const PROJECTS = [
    { id:'awigen', name:'AWI-Gen', fullName:'African Wits-INDEPTH Partnership for Genomic Research', country:'Multi-site (Ghana, Kenya, South Africa, Tanzania)', status:'active', focus:'GWAS, Cardiometabolic diseases', pi:'Prof. Shane Norris (Wits)', desc:'Multi-site African GWAS cohort studying determinants of cardiometabolic disease across sub-Saharan Africa. Over 11,000 participants.', pubs:47, participants:11000, link:'https://awigen.org' },
    { id:'h3a-bm', name:'H3ABioNet', fullName:'Pan-African Bioinformatics Network for H3Africa', country:'Pan-African (21 countries)', status:'active', focus:'Bioinformatics capacity building, training', pi:'Prof. Nicola Mulder (UCT)', desc:'Pan-African bioinformatics network providing training, infrastructure and analysis support for H3Africa research.', pubs:30, participants:null, link:'https://www.h3abionet.org' },
    { id:'apcdr', name:'APCDR', fullName:'African Partnership for Chronic Disease Research', country:'Uganda, Ghana, Nigeria', status:'active', focus:'Non-communicable diseases, GWAS', pi:'Prof. Segun Fatumo (MRC/UVRI)', desc:'Studying genetic risk factors for hypertension, type 2 diabetes and other NCDs in African populations.', pubs:22, participants:6500, link:'https://www.apcdr.org' },
    { id:'hgs', name:'H3Africa SCD', fullName:'H3Africa Sickle Cell Disease Study', country:'Nigeria, Ghana, Tanzania, Ethiopia', status:'active', focus:'Sickle cell disease, clinical genomics', pi:'Dr. Ambroise Wonkam (Johns Hopkins)', desc:'Genomic and clinical characterisation of sickle cell disease in African populations to identify modifiers.', pubs:18, participants:3000, link:'https://www.h3africa.org' },
    { id:'tbgs', name:'TBGSuite', fullName:'Tuberculosis Genomics Suite (H3Africa)', country:'South Africa, Ethiopia, Nigeria', status:'active', focus:'TB genomics, phylogenetics', pi:'Dr. Ebrahim Variava (UW)', desc:'WGS of M. tuberculosis clinical isolates across sub-Saharan Africa to study transmission and drug resistance.', pubs:12, participants:null, link:'https://www.h3africa.org' },
    { id:'mal', name:'MalariaGEN-H3A', fullName:'MalariaGEN / H3Africa Partnership', country:'West Africa, East Africa, Central Africa', status:'active', focus:'Malaria genomics, drug resistance', pi:'Dr. Kwadwo Asante (Noguchi)', desc:'Genomic surveillance of P. falciparum and A. gambiae in sub-Saharan Africa. Key datasets in Pf7.', pubs:55, participants:null, link:'https://www.malariagen.net' },
    { id:'acpg', name:'ACPG', fullName:'African COVID-19 Pandemic Genomics Initiative', country:'23 African countries', status:'completed', focus:'SARS-CoV-2 genomic surveillance', pi:'Dr. Christian Happi (ACEGID)', desc:'Coordinated SARS-CoV-2 whole-genome sequencing across Africa, establishing the backbone for continent-wide pathogen surveillance.', pubs:8, participants:null, link:'https://africacdc.org' },
    { id:'trypgen', name:'TrypanoGEN', fullName:'Pan-African Trypanosome Genomics Consortium', country:'DRC, Uganda, Cameroon, Chad', status:'active', focus:'Sleeping sickness, NTDs genomics', pi:'Dr. Annette MacLeod (Glasgow)', desc:'Genomic epidemiology of Trypanosoma brucei and human genetic susceptibility to sleeping sickness.', pubs:14, participants:2400, link:'https://trypanogen.net' },
    { id:'hkvp', name:'H3Africa Kidney', fullName:'H3Africa Kidney Disease Consortium', country:'Nigeria, South Africa, Ghana', status:'active', focus:'CKD, APOL1 variants', pi:'Dr. Adesola Ogunniyi (UI)', desc:'Study of APOL1 G1/G2 risk variants and chronic kidney disease in African populations.', pubs:9, participants:1800, link:'https://www.h3africa.org' },
    { id:'waarc', name:'WAARC', fullName:'West African ARTumour Research Consortium', country:'Ghana, Nigeria, Côte d\'Ivoire, Senegal', status:'active', focus:'Cancer genomics, breast cancer', pi:'Dr. Chukwuemeka Nwobi (LUTH)', desc:'Molecular characterisation of breast cancer in West African women, focusing on triple-negative subtype prevalence.', pubs:7, participants:900, link:'https://www.h3africa.org' },
  ];

  const DATASETS = [
    { name:'AWI-Gen Genotype Data (Phase 1)', type:'GWAS Array', size:'11,045 samples, ~2.5M SNPs', access:'Controlled (DACO)', format:'PLINK BED/BIM/FAM', link:'https://ega-archive.org' },
    { name:'MalariaGEN Pf7 VCF', type:'WGS Variants', size:'16,203 samples, 70+ countries', access:'Open', format:'VCF/BCF + TSV metadata', link:'https://www.malariagen.net/data/pf7' },
    { name:'H3ABioNet GWAS QC Pipeline', type:'Pipeline', size:'Nextflow + Docker', access:'Open (GitHub)', format:'Nextflow DSL2', link:'https://github.com/h3abionet' },
    { name:'Pan-African Ancestry Panel (PAAP)', type:'Reference Panel', size:'7,652 samples, 43 African populations', access:'Controlled', format:'VCF (GRCh38)', link:'https://ega-archive.org' },
    { name:'H3Africa SCD WGS Pilot', type:'WGS', size:'450 samples (Nigeria + Ghana)', access:'Controlled (DACO)', format:'CRAM + VCF', link:'https://ega-archive.org' },
  ];

  const TOOLS = [
    { name:'H3ABioNet GWAS Pipeline', lang:'Nextflow', desc:'Complete quality-controlled GWAS pipeline designed for African cohorts, including AFR-specific QC thresholds.', link:'https://github.com/h3abionet/h3agwas' },
    { name:'PAISA (PCA-ancestry inference)', lang:'Python/R', desc:'Tool for inferring population structure using the Pan-African ancestry reference panel.', link:'https://github.com/h3abionet' },
    { name:'AfricaFreq', lang:'R', desc:'R package for querying allele frequencies from African reference populations (AWI-Gen, AGVP, gnomAD AFR).', link:'https://github.com/h3abionet' },
    { name:'H3Africa Consent Tracker', lang:'REDCap', desc:'Standardised electronic consent management system compliant with H3Africa data governance policies.', link:'https://redcap.h3africa.org' },
  ];

  function _switchTab(tab) {
    document.querySelectorAll('.h3-tab-btn').forEach(b => b.classList.toggle('h3-tab-active', b.dataset.tab === tab));
    document.querySelectorAll('.h3-panel').forEach(p => p.style.display = p.dataset.panel === tab ? '' : 'none');
  }

  function _filter() {
    const q = (document.getElementById('h3-q')?.value || '').toLowerCase();
    document.querySelectorAll('.h3-proj-card').forEach(card => {
      const txt = card.dataset.txt || '';
      card.style.display = txt.includes(q) ? '' : 'none';
    });
  }

  function init() {
    const section = document.getElementById('h3africa-section');
    if (!section || section.dataset.h3Ready) return;
    section.dataset.h3Ready = '1';
    section.innerHTML = `
      <div class="h3-wrap">
        <div class="h3-header">
          <div class="h3-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            H3Africa Research Portal
          </div>
          <div class="h3-header-sub">Human Heredity and Health in Africa — Projects, Datasets, Tools &amp; Training</div>
        </div>
        <div class="h3-stats-row">
          <div class="h3-stat-chip"><span class="h3-stat-n">${PROJECTS.length}</span><span class="h3-stat-label">Projects</span></div>
          <div class="h3-stat-chip"><span class="h3-stat-n">${DATASETS.length}</span><span class="h3-stat-label">Datasets</span></div>
          <div class="h3-stat-chip"><span class="h3-stat-n">${TOOLS.length}</span><span class="h3-stat-label">Tools</span></div>
          <div class="h3-stat-chip"><span class="h3-stat-n">54</span><span class="h3-stat-label">African countries reached</span></div>
        </div>
        <div class="h3-tabs">
          <button class="h3-tab-btn h3-tab-active" data-tab="projects" onclick="OmicsLab.H3Africa._switchTab('projects')">Projects</button>
          <button class="h3-tab-btn" data-tab="datasets" onclick="OmicsLab.H3Africa._switchTab('datasets')">Datasets</button>
          <button class="h3-tab-btn" data-tab="tools" onclick="OmicsLab.H3Africa._switchTab('tools')">Tools &amp; Pipelines</button>
        </div>
        <!-- Projects panel -->
        <div class="h3-panel" data-panel="projects">
          <input class="h3-search" id="h3-q" placeholder="Search projects..." oninput="OmicsLab.H3Africa._filter()">
          <div class="h3-proj-list">
            ${PROJECTS.map(p => `<div class="h3-proj-card" data-txt="${[p.name,p.fullName,p.country,p.focus,p.desc].join(' ').toLowerCase()}">
              <div class="h3-proj-hdr">
                <div>
                  <span class="h3-proj-name">${p.name}</span>
                  <span class="h3-proj-status h3-status-${p.status}">${p.status}</span>
                </div>
                <a class="h3-ext-link" href="${p.link}" target="_blank" rel="noopener">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Visit
                </a>
              </div>
              <div class="h3-proj-full">${p.fullName}</div>
              <div class="h3-proj-meta">
                <span class="h3-meta-chip h3-focus">${p.focus}</span>
                <span class="h3-meta-chip">${p.country}</span>
                ${p.participants ? `<span class="h3-meta-chip">n=${p.participants.toLocaleString()}</span>` : ''}
                <span class="h3-meta-chip">${p.pubs} pubs</span>
              </div>
              <div class="h3-proj-desc">${p.desc}</div>
              <div class="h3-proj-pi">PI: ${p.pi}</div>
            </div>`).join('')}
          </div>
        </div>
        <!-- Datasets panel -->
        <div class="h3-panel" data-panel="datasets" style="display:none">
          <div class="h3-dataset-list">
            ${DATASETS.map(d => `<div class="h3-dataset-card">
              <div class="h3-dataset-hdr">
                <span class="h3-dataset-name">${d.name}</span>
                <span class="h3-access-badge h3-access-${d.access.includes('Open')?'open':'ctrl'}">${d.access}</span>
              </div>
              <div class="h3-dataset-meta">
                <span class="h3-meta-chip">${d.type}</span>
                <span class="h3-meta-chip">${d.format}</span>
                <span class="h3-meta-chip">${d.size}</span>
              </div>
              <a class="h3-dataset-link" href="${d.link}" target="_blank" rel="noopener">Access / Request</a>
            </div>`).join('')}
          </div>
        </div>
        <!-- Tools panel -->
        <div class="h3-panel" data-panel="tools" style="display:none">
          <div class="h3-tools-list">
            ${TOOLS.map(t => `<div class="h3-tool-card">
              <div class="h3-tool-hdr">
                <span class="h3-tool-name">${t.name}</span>
                <span class="h3-tool-lang">${t.lang}</span>
              </div>
              <div class="h3-tool-desc">${t.desc}</div>
              <a class="h3-tool-link" href="${t.link}" target="_blank" rel="noopener">View on GitHub / Docs</a>
            </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  return { init, _switchTab, _filter };
})();
