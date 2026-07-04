/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Africa Science Hub
   Data sovereignty, population genomics, One Health, active
   consortia, training opportunities, and impact metrics.
   The most grant-critical content block in the platform.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.AfricaHub = (function () {

  /* ─── Tab content data ─── */

  const DATA_GOVERNANCE = {
    principles: [
      { letter: 'C', color: '#00C4A0', title: 'Community Engagement',
        body: 'Research must be conducted with and for African communities — not on them. Free, prior, and informed consent is required at individual and community level. Results must be returned to communities in accessible formats.' },
      { letter: 'O', color: '#58a6ff', title: 'Open Science by Default',
        body: 'Data should be shared under the most permissive licence the community permits. Raw sequence data should be deposited in ENA/SRA within 6 months. Analysis code and workflows must be publicly available.' },
      { letter: 'N', color: '#d29922', title: 'National Data Sovereignty',
        body: 'African nations have the right to govern their genomic data. Material Transfer Agreements (MTAs) must not transfer exclusive control of data to non-African institutions. The AU Model Law on Data Protection (2018) provides the legal framework.' },
      { letter: 'T', color: '#d2a8ff', title: 'Triangular Collaboration',
        body: 'Equitable authorship and leadership for African researchers is mandatory. H3Africa requires that African PIs lead all projects. Sample export must be paired with capacity building that keeps analytical expertise on the continent.' },
      { letter: 'E', color: '#f85149', title: 'Ethical Review',
        body: 'All studies require IRB/ethics review from the country of origin — not just the funder\'s country. WHO-CIOMS guidelines apply. Re-use of biobank samples requires secondary consent where required by national law.' },
      { letter: 'X', color: '#58a6ff', title: 'Cross-Border Data Flows',
        body: 'The AU Data Policy Framework (2022) governs cross-border data transfer. Cloud storage must comply with national data residency laws. H3ABioNet operates regional data nodes to enable analysis without raw data export.' }
    ],
    frameworks: [
      { name: 'H3Africa Data Policy', year: '2013 (rev. 2021)', scope: 'All H3Africa-funded studies',
        key: 'Data access through DAC; 12-month exclusivity window for generating team; 6-month deposition deadline' },
      { name: 'AU Data Policy Framework', year: '2022', scope: 'All 55 AU member states',
        key: 'Establishes national data sovereignty, cross-border transfer rules, and the African Data Market' },
      { name: 'WHO CIOMS Guidelines', year: '2016', scope: 'International biomedical research',
        key: 'Community engagement, benefit sharing, post-trial access obligations' },
      { name: 'Nagoya Protocol', year: '2014', scope: 'Biological materials (organisms, samples)',
        key: 'Access and benefit sharing for genetic resources; requires PIC and MAT for sample export' },
      { name: 'GDPR (applies to EU-funded)', year: '2018', scope: 'Data of EU data subjects',
        key: 'Transfers to Africa require adequacy decision or standard contractual clauses' }
    ]
  };

  const POPULATION_GENOMICS = {
    why: 'Africa is the birthplace of modern humans and contains more genetic diversity than the rest of the world combined. Yet 78% of genome-wide association study participants are of European ancestry. This creates a systematic bias: variants common in Africa are under-discovered, drug targets are missed, and polygenic risk scores perform poorly in African populations.',
    initiatives: [
      { name: 'H3Africa', icon: 'globe', size: '53+ cohorts · 500K+ samples',
        desc: 'The Human Heredity and Health in Africa consortium — the largest African genomics programme. Covers 30+ countries, 53+ cohorts spanning CVD, kidney disease, T2D, HIV, malaria, and mental health.',
        url: 'h3africa.org', colour: '#00C4A0' },
      { name: 'AWI-Gen', icon: 'dna', size: '12,000 participants · 6 African sites',
        desc: 'Africa-Wits INDEPTH partnership for genomic studies. Six sites across sub-Saharan Africa studying cardiometabolic disease, body composition, and genetic ancestry.',
        url: 'awigen.org', colour: '#58a6ff' },
      { name: 'APCDR', icon: 'thermometer', size: '100K+ participants',
        desc: 'African Partnership for Chronic Disease Research. Focuses on non-communicable diseases under-studied in Africa — type 2 diabetes, hypertension, stroke.',
        url: 'apcdr.org', colour: '#d2a8ff' },
      { name: 'MalariaGEN', icon: 'virus', size: '20,000+ P. falciparum genomes',
        desc: 'The Malaria Genomic Epidemiology Network. Tracks drug resistance, transmission, and population structure of Plasmodium falciparum across Africa.',
        url: 'malariagen.net', colour: '#d29922' },
      { name: 'H3ABioNet', icon: 'cpu', size: '32 nodes · 27 African countries',
        desc: 'The Pan-African Bioinformatics Network for H3Africa. Provides HPC infrastructure, training, and analytical pipelines specifically for African genomics data.',
        url: 'h3abionet.org', colour: '#58a6ff' },
      { name: 'PANDORA-ID-NET', icon: 'microscope', size: '9 African countries',
        desc: 'Pandemic preparedness and outbreak response network. Focuses on diagnostics and pathogen genomics for emerging infections.',
        url: 'pandora-id.net', colour: '#f85149' }
    ],
    diversity: [
      { label: 'Distinct ethnic groups in Africa', value: '3,000+', color: '#00C4A0' },
      { label: 'Languages spoken on the continent', value: '2,000+', color: '#58a6ff' },
      { label: 'Of global genetic variation found in Africa', value: '90%', color: '#d29922' },
      { label: 'GWAS participants of African ancestry (2021)', value: '<3%', color: '#f85149' },
      { label: 'African sequences in major biobanks', value: '<1%', color: '#f85149' },
      { label: 'Potential new drug targets from African data', value: '100s', color: '#d2a8ff' }
    ]
  };

  const ONE_HEALTH = {
    intro: 'One Health recognises that human, animal, and environmental health are inseparable. 75% of emerging infectious diseases in humans are zoonotic — originating in animals. In Africa, the human-wildlife interface, livestock dependence, and climate change make One Health surveillance essential.',
    domains: [
      { icon: 'heart-pulse', title: 'Human Health', color: '#58a6ff',
        points: ['Clinical surveillance networks (WHO GOARN)', 'SARS-CoV-2, Mpox, Ebola sequencing', 'Antimicrobial resistance monitoring', 'H3Africa cohort studies'] },
      { icon: 'tag', title: 'Animal Health', color: '#00C4A0',
        points: ['Zoonotic spillover surveillance (bats, rodents)', 'Livestock pathogen genomics (ILRI)', 'Rift Valley Fever, Brucellosis, Leptospirosis', 'Wildlife-domestic animal interface'] },
      { icon: 'mountain', title: 'Environmental Health', color: '#d29922',
        points: ['Environmental DNA (eDNA) surveillance', 'Water-borne pathogen monitoring', 'Antimicrobial residues in soil/water', 'Climate change & vector range expansion'] }
    ],
    platforms: [
      { name: 'PREDICT Project', scope: 'Wildlife virus discovery, 31 African countries' },
      { name: 'APSED', scope: 'Asia-Pacific + Africa surveillance capacity' },
      { name: 'Africa CDC ECHO', scope: 'Emergency Centre for Outbreak Control' },
      { name: 'FAO EMPRES-i', scope: 'Animal disease surveillance, global' },
      { name: 'Global Virome Project', scope: 'Unknown zoonotic virus discovery' }
    ]
  };

  const IMPACT = {
    platform: [
      { icon: 'flask',     label: 'Workflows Available', value: '14+' },
      { icon: 'virus',     label: 'Diseases Covered', value: '40+' },
      { icon: 'globe',     label: 'African Lab Centres', value: '20+' },
      { icon: 'layers',    label: 'Bioinformatics Tools', value: '50+' },
      { icon: 'clipboard', label: 'Training Modules', value: '15' },
      { icon: 'award',     label: 'Learning Tracks', value: '3' }
    ],
    problem: 'Sub-Saharan Africa has fewer than 1 bioinformatician per 1,000,000 people. A single H3Africa study can generate terabytes of data that nobody in the country can analyse. OmicsLab bridges this gap with zero-cost, zero-install, browser-based training.',
    grantRelevance: [
      { funder: 'NIH Fogarty International', relevance: 'Directly addresses Fogarty capacity-building mandate for LMIC research training. Aligns with D43 and R25 funding mechanisms.' },
      { funder: 'Wellcome Trust', relevance: 'Supports Wellcome\'s Africa programme focus on local data use, analytical capacity, and open science.' },
      { funder: 'Gates Foundation', relevance: 'Aligns with BMGF Global Health programme — infectious disease surveillance, malaria, TB, and HIV genomics capacity.' },
      { funder: 'H3Africa Supplement', relevance: 'H3ABioNet training mandate explicitly requires computational training tools for African researchers.' },
      { funder: 'Africa CDC / AU', relevance: 'Africa CDC NPHI capacity-building initiative requires standardised surveillance and sequencing training across all 55 AU member states.' },
      { funder: 'EU Horizon Africa', relevance: 'Horizon Africa partnerships fund open-source capacity tools with explicit equity and open-science alignment criteria.' }
    ]
  };

  const TRAINING_OPPORTUNITIES = [
    { name: 'H3ABioNet Bioinformatics Training', type: 'Online + In-person', deadline: 'Rolling',
      desc: 'Annual 16-week online course in biostatistics and bioinformatics for African researchers. Certificate upon completion.',
      url: 'h3abionet.org/training' },
    { name: 'EMBL-EBI Training', type: 'Online', deadline: 'Rolling',
      desc: 'Free online courses in genomics, transcriptomics, and proteomics. Many specifically designed for Global South researchers.',
      url: 'training.ebi.ac.uk' },
    { name: 'Africa CDC Genomics Academy', type: 'Hybrid', deadline: 'Quarterly',
      desc: 'Pathogen genomics training for National Public Health Institutes across Africa. Focus on SARS-CoV-2, Mpox, and AMR.',
      url: 'africacdc.org/genomics-academy' },
    { name: 'AIBST (African Institute for Biomedical Science and Technology)', type: 'In-person (Zimbabwe)', deadline: 'Annual',
      desc: 'Intensive bioinformatics bootcamps focused on African disease genomics.',
      url: 'aibst.org' },
    { name: 'WACCBIP Training', type: 'In-person (Ghana)', deadline: 'Annual',
      desc: 'West African Centre for Cell Biology of Infectious Pathogens — MSc and short courses in genomics.',
      url: 'waccbip.edu.gh' },
    { name: 'KEMRI Training Programme', type: 'In-person (Kenya)', deadline: 'Rolling',
      desc: 'Kenya Medical Research Institute offers bioinformatics training within the H3ABioNet network.',
      url: 'kemri.org' }
  ];

  /* ─── Render panels ─── */

  function _buildGovernancePanel() {
    const principles = DATA_GOVERNANCE.principles.map(p => `
      <div class="ah-principle-card" style="border-left-color:${p.color}">
        <div class="ah-principle-letter" style="color:${p.color}">${p.letter}</div>
        <div>
          <div class="ah-principle-title">${p.title}</div>
          <div class="ah-principle-body">${p.body}</div>
        </div>
      </div>`).join('');

    const frameworks = DATA_GOVERNANCE.frameworks.map(f => `
      <tr>
        <td class="ah-fw-name">${f.name}</td>
        <td class="ah-fw-year">${f.year}</td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${f.key}</td>
      </tr>`).join('');

    return `
      <h3 class="ah-sub-head">Core Principles of African Genomics Data Governance</h3>
      <p class="ah-intro">Africa's genomic data has enormous scientific and economic value. These six principles — anchored in H3Africa policy and the AU Data Governance Framework — protect that value for African communities.</p>
      <div class="ah-principles-grid">${principles}</div>

      <h3 class="ah-sub-head" style="margin-top:2rem">Key Regulatory Frameworks</h3>
      <div style="overflow-x:auto">
        <table class="ah-fw-table">
          <thead><tr><th>Framework</th><th>Year</th><th>Key Provisions</th></tr></thead>
          <tbody>${frameworks}</tbody>
        </table>
      </div>
      <div class="ah-callout" onclick="OmicsLab.Badges&&OmicsLab.Badges.unlock('data-sovereign')">
        <span class="ah-callout-icon">${OmicsLab.Icons?.svg('scale', 18) || ''}</span>
        <div><strong>Mark as read to earn the Data Sovereignty Advocate badge.</strong> Click here to confirm you've reviewed these principles.</div>
      </div>`;
  }

  function _buildPopGenPanel() {
    const stats = POPULATION_GENOMICS.diversity.map(s => `
      <div class="ah-stat-card">
        <div class="ah-stat-value" style="color:${s.color}">${s.value}</div>
        <div class="ah-stat-label">${s.label}</div>
      </div>`).join('');

    const initiatives = POPULATION_GENOMICS.initiatives.map(i => `
      <div class="ah-initiative-card" style="border-top-color:${i.colour}">
        <div class="ah-init-head">
          <span class="ah-init-icon">${OmicsLab.Icons?.svg(i.icon, 18) || ''}</span>
          <div>
            <div class="ah-init-name">${i.name}</div>
            <div class="ah-init-size">${i.size}</div>
          </div>
        </div>
        <div class="ah-init-desc">${i.desc}</div>
        <div class="ah-init-url">${i.url}</div>
      </div>`).join('');

    return `
      <div class="ah-why-box">
        <div class="ah-why-icon">${OmicsLab.Icons?.svg('globe', 22) || ''}</div>
        <div class="ah-why-text">${POPULATION_GENOMICS.why}</div>
      </div>
      <div class="ah-stats-grid">${stats}</div>
      <h3 class="ah-sub-head" style="margin-top:1.5rem">Active African Genomics Consortia</h3>
      <div class="ah-initiatives-grid">${initiatives}</div>`;
  }

  function _buildOneHealthPanel() {
    const domains = ONE_HEALTH.domains.map(d => `
      <div class="ah-oh-domain" style="border-top-color:${d.color}">
        <div class="ah-oh-icon">${OmicsLab.Icons?.svg(d.icon, 22) || ''}</div>
        <div class="ah-oh-title" style="color:${d.color}">${d.title}</div>
        <ul class="ah-oh-list">
          ${d.points.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>`).join('');

    const platforms = ONE_HEALTH.platforms.map(p => `
      <div class="ah-oh-platform"><strong>${p.name}</strong> — ${p.scope}</div>`).join('');

    return `
      <div class="ah-why-box" style="border-left-color:#00C4A0">
        <div class="ah-why-icon">${OmicsLab.Icons?.svg('link', 22) || ''}</div>
        <div class="ah-why-text">${ONE_HEALTH.intro}</div>
      </div>
      <div class="ah-oh-grid">${domains}</div>
      <h3 class="ah-sub-head" style="margin-top:1.5rem">One Health Surveillance Platforms</h3>
      <div class="ah-oh-platforms">${platforms}</div>
      <div class="ah-workflow-note">
        <strong>OmicsLab connection:</strong> The Disease Explorer covers zoonotic diseases (Ebola, Rift Valley Fever, Mpox, Dengue, Avian Influenza) with African outbreak context. The Africa Map shows laboratory sites conducting One Health surveillance.
      </div>`;
  }

  function _buildImpactPanel() {
    const stats = IMPACT.platform.map(s => `
      <div class="ah-impact-stat">
        <div class="ah-impact-icon">${OmicsLab.Icons?.svg(s.icon, 22) || ''}</div>
        <div class="ah-impact-value">${s.value}</div>
        <div class="ah-impact-label">${s.label}</div>
      </div>`).join('');

    const grants = IMPACT.grantRelevance.map(g => `
      <div class="ah-grant-row">
        <div class="ah-grant-funder">${g.funder}</div>
        <div class="ah-grant-rel">${g.relevance}</div>
      </div>`).join('');

    return `
      <div class="ah-problem-box">
        <div class="ah-why-icon">${OmicsLab.Icons?.svg('alert-triangle', 22) || ''}</div>
        <div class="ah-why-text"><strong>The Problem OmicsLab Solves:</strong> ${IMPACT.problem}</div>
      </div>
      <div class="ah-impact-grid">${stats}</div>
      <h3 class="ah-sub-head" style="margin-top:1.5rem">Grant Relevance by Funder</h3>
      <div class="ah-grant-table">${grants}</div>
      <div class="ah-sustainability-box">
        <strong>Sustainability model:</strong> OmicsLab runs entirely on GitHub Pages — zero server costs, zero infrastructure dependencies. It works offline as a Progressive Web App. It can be deployed by any African institution at zero cost, forked and customised for local curricula, and extended by the community via pull requests.
      </div>`;
  }

  function _buildTrainingPanel() {
    const opps = TRAINING_OPPORTUNITIES.map(t => `
      <div class="ah-training-card">
        <div class="ah-training-name">${t.name}</div>
        <div class="ah-training-meta">
          <span class="ah-training-type">${t.type}</span>
          <span class="ah-training-deadline">${OmicsLab.Icons?.svg('clock', 12) || ''} ${t.deadline}</span>
        </div>
        <div class="ah-training-desc">${t.desc}</div>
        <div class="ah-training-url">${OmicsLab.Icons?.svg('link', 12) || ''} ${t.url}</div>
      </div>`).join('');

    return `
      <p class="ah-intro">Real training programmes available to African researchers right now. Use OmicsLab to prepare for these courses or as standalone preparation.</p>
      <div class="ah-training-grid">${opps}</div>
      <div class="ah-workflow-note" style="margin-top:1.5rem">
        <strong>Deploy OmicsLab in your workshop:</strong> OmicsLab is designed to run in low-bandwidth environments (no internet required after first load). Instructors can use Workshop Mode to track cohort progress. See the Workshop section in the nav.
      </div>`;
  }

  /* ─── Tab switching ─── */
  function switchTab(id) {
    document.querySelectorAll('.ah-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    document.querySelectorAll('.ah-panel').forEach(p => p.classList.toggle('active', p.id === 'ah-panel-' + id));
  }

  /* ─── Init ─── */
  function init() {
    const container = document.getElementById('africa-hub-content');
    if (!container) return;

    const tabs = [
      { id: 'governance', label: 'Data Governance' },
      { id: 'popgen',     label: 'Population Genomics' },
      { id: 'onehealth',  label: 'One Health' },
      { id: 'impact',     label: 'Impact & Grants' },
      { id: 'training',   label: 'Training Opportunities' }
    ];

    const panels = [
      { id: 'governance', html: _buildGovernancePanel() },
      { id: 'popgen',     html: _buildPopGenPanel() },
      { id: 'onehealth',  html: _buildOneHealthPanel() },
      { id: 'impact',     html: _buildImpactPanel() },
      { id: 'training',   html: _buildTrainingPanel() }
    ];

    const tabBar = tabs.map(t =>
      `<button class="ah-tab${t.id==='governance'?' active':''}" data-tab="${t.id}"
         onclick="OmicsLab.AfricaHub.switchTab('${t.id}')">${t.label}</button>`
    ).join('');

    const panelHtml = panels.map(p =>
      `<div id="ah-panel-${p.id}" class="ah-panel${p.id==='governance'?' active':''}">${p.html}</div>`
    ).join('');

    container.innerHTML = `<div class="ah-tab-bar">${tabBar}</div>${panelHtml}`;
  }

  return { init, switchTab };
})();
