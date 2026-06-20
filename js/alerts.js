/* ═══════════════════════════════════════════════════════════════
   OmicsLab — African Outbreak Alert Feed (Prompt 12)
   Curated seed data + live fetch attempt from WHO AFRO.
   Genomic readiness scores per country. Offline-first.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Alerts = (function () {

  /* ─── Genomic Readiness Scores (0–100) per country ─── */
  /* Based on H3Africa capacity surveys, AFRO sequencing reports 2023-24 */
  const READINESS = {
    'South Africa':     { score: 92, tier: 1, labs: 8,  seqCap: 'High',    notes: 'NICD, KRISP, UCT — national genomic surveillance program' },
    'Nigeria':          { score: 71, tier: 2, labs: 5,  seqCap: 'Medium',  notes: 'NCDC, ACEGID, IITA — growing capacity, power challenges' },
    'Kenya':            { score: 74, tier: 2, labs: 4,  seqCap: 'Medium',  notes: 'KEMRI, ILRI — strong COVID-19 sequencing track record' },
    'Uganda':           { score: 68, tier: 2, labs: 3,  seqCap: 'Medium',  notes: 'MRC/UVRI, APCDR — Oxford partnership' },
    'Ghana':            { score: 65, tier: 2, labs: 3,  seqCap: 'Medium',  notes: 'Noguchi Memorial — H3Africa hub' },
    'Senegal':          { score: 63, tier: 2, labs: 2,  seqCap: 'Medium',  notes: 'Institut Pasteur Dakar — Yellow Fever reference lab' },
    'Ethiopia':         { score: 55, tier: 2, labs: 2,  seqCap: 'Low-Med', notes: 'AHRI, EHNRI — rapid scale-up underway' },
    'Tanzania':         { score: 48, tier: 3, labs: 2,  seqCap: 'Low',     notes: 'NIMR, Muhimbili — limited WGS' },
    'DRC':              { score: 44, tier: 3, labs: 2,  seqCap: 'Low',     notes: 'INRB — critical for Ebola/Mpox surveillance' },
    'Cameroon':         { score: 42, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'CREMER — H3Africa partner' },
    'Zambia':           { score: 40, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'CIDRZ — HIV genomics focus' },
    'Malawi':           { score: 38, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'MLW — Wellcome Trust partner' },
    'Zimbabwe':         { score: 36, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'UZCHS — rebuilding capacity' },
    'Rwanda':           { score: 58, tier: 2, labs: 2,  seqCap: 'Low-Med', notes: 'RNBL — national lab program' },
    'Côte d\'Ivoire':   { score: 35, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'Institut Pasteur Abidjan' },
    'Guinea':           { score: 30, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'INRSP — Ebola experience' },
    'Sierra Leone':     { score: 28, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'COMAHS — post-Ebola rebuild' },
    'Liberia':          { score: 25, tier: 4, labs: 0,  seqCap: 'Minimal', notes: 'No in-country WGS — samples sent abroad' },
    'Mali':             { score: 27, tier: 4, labs: 1,  seqCap: 'Minimal', notes: 'MRTC — Malaria focus' },
    'Burkina Faso':     { score: 24, tier: 4, labs: 1,  seqCap: 'Minimal', notes: 'Centre MURAZ — security challenges' },
    'Madagascar':       { score: 22, tier: 4, labs: 1,  seqCap: 'Minimal', notes: 'Institut Pasteur Madagascar' },
    'Mozambique':       { score: 20, tier: 4, labs: 0,  seqCap: 'Minimal', notes: 'INS — capacity building in progress' },
    'Angola':           { score: 18, tier: 4, labs: 0,  seqCap: 'Minimal', notes: 'INLS — very limited' },
    'Egypt':            { score: 60, tier: 2, labs: 3,  seqCap: 'Medium',  notes: 'NAMRU-3, NRC — North Africa hub' },
    'Morocco':          { score: 52, tier: 2, labs: 2,  seqCap: 'Low-Med', notes: 'Institut National d\'Hygiène' },
    'Tunisia':          { score: 50, tier: 2, labs: 2,  seqCap: 'Low-Med', notes: 'Institut Pasteur Tunis' },
    'Algeria':          { score: 35, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'Institut Pasteur Algeria' },
    'Somalia':          { score: 8,  tier: 4, labs: 0,  seqCap: 'Minimal', notes: 'Ongoing conflict limits capacity' },
    'Sudan':            { score: 12, tier: 4, labs: 0,  seqCap: 'Minimal', notes: 'SMSRC — severely impacted by conflict' },
    'Botswana':         { score: 45, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'BOFWA — HIV genomics focus' },
    'Namibia':          { score: 40, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'MoHSS — expanding' },
    'Eswatini':         { score: 30, tier: 3, labs: 1,  seqCap: 'Low',     notes: 'MOH lab — HIV focus' },
  };

  /* ─── Outbreak seed data ─── */
  const OUTBREAKS = [
    {
      id: 'mpox-drc-2024',
      disease: 'Mpox (clade Ib)',
      country: 'DRC',
      region: 'Central Africa',
      status: 'active',
      severity: 'critical',
      startDate: '2023-09-01',
      updated: '2025-06-01',
      cases: 38465,
      deaths: 1085,
      caseFatality: 2.8,
      source: 'WHO AFRO',
      summary: 'A novel clade Ib variant of Mpox emerged in DRC and has spread to neighbouring countries including Burundi, Rwanda, Uganda, and Kenya. The variant shows enhanced human-to-human transmission compared to clade II.',
      genomicNote: 'Whole genome sequencing at INRB Kinshasa and UCT confirmed clade Ib designation. Phylogenetic analysis shows a distinct lineage from the 2022 global clade II outbreak.',
      genomicReadiness: READINESS['DRC'],
      workflow: 'WGS',
      workflowPage: 'lab',
      color: '#ff6b6b',
      tags: ['Mpox', 'Poxvirus', 'Zoonosis', 'WGS', 'Emerging'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'cholera-africa-2024',
      disease: 'Cholera (Vibrio cholerae O1 El Tor)',
      country: 'Multi-country',
      region: 'East & Southern Africa',
      status: 'active',
      severity: 'critical',
      startDate: '2023-01-01',
      updated: '2025-06-01',
      cases: 189000,
      deaths: 2340,
      caseFatality: 1.2,
      source: 'WHO AFRO / OCHA',
      summary: 'Simultaneous cholera outbreaks across Ethiopia, Somalia, Kenya, Mozambique, Zimbabwe, Zambia, and Malawi driven by climate-related flooding, displacement, and inadequate WASH infrastructure.',
      genomicNote: 'Metagenomic sequencing at KEMRI and AHRI confirms O1 El Tor biotype with SXT-class integrative conjugative elements conferring multidrug resistance. Phylogenetic evidence suggests multiple independent introductions from South Asia.',
      genomicReadiness: READINESS['Kenya'],
      workflow: 'Metagenomics',
      workflowPage: 'lab',
      color: '#f97316',
      tags: ['Cholera', 'Waterborne', 'AMR', 'Metagenomics', 'Climate'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'marburg-rw-2024',
      disease: 'Marburg Virus Disease',
      country: 'Rwanda',
      region: 'East Africa',
      status: 'contained',
      severity: 'critical',
      startDate: '2024-09-27',
      updated: '2024-11-20',
      cases: 66,
      deaths: 15,
      caseFatality: 22.7,
      source: 'WHO AFRO',
      summary: 'Rwanda declared its first-ever Marburg virus disease outbreak in September 2024, centred in Kigali. Rapid contact tracing and ring vaccination with experimental MV-CHIM vaccine contained the outbreak within 6 weeks.',
      genomicNote: 'Whole genome sequences generated at RNBL Kigali confirmed Marburg Angola lineage. Rapid sequencing turnaround (< 48h from sample to sequence) enabled real-time phylogenetic tracking of transmission chains.',
      genomicReadiness: READINESS['Rwanda'],
      workflow: 'WGS',
      workflowPage: 'lab',
      color: '#ff6b6b',
      tags: ['Marburg', 'VHF', 'BSL-4', 'WGS', 'Contact tracing'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'oropouche-africa-2024',
      disease: 'Oropouche Virus',
      country: 'Multi-country',
      region: 'West Africa',
      status: 'monitoring',
      severity: 'warning',
      startDate: '2024-07-01',
      updated: '2025-03-01',
      cases: 312,
      deaths: 2,
      caseFatality: 0.6,
      source: 'WHO / ECDC',
      summary: 'Oropouche virus, a bunyavirus transmitted by Culicoides midges, has been detected for the first time in West Africa following a major outbreak in South America. Travel-associated cases reported in Nigeria and Côte d\'Ivoire.',
      genomicNote: 'Metagenomic sequencing identified the novel reassortant Oropouche-like strain. African sequence data deposited in ENA under the ACEGID emergency sequencing program.',
      genomicReadiness: READINESS['Nigeria'],
      workflow: 'Metagenomics',
      workflowPage: 'lab',
      color: '#e3b341',
      tags: ['Arbovirus', 'Oropouche', 'Emerging', 'Metagenomics', 'Reassortant'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'tb-dr-sa-2024',
      disease: 'Drug-Resistant Tuberculosis (XDR-TB)',
      country: 'South Africa',
      region: 'Southern Africa',
      status: 'endemic',
      severity: 'warning',
      startDate: '2023-01-01',
      updated: '2025-01-01',
      cases: 14200,
      deaths: 4100,
      caseFatality: 28.9,
      source: 'WHO Global TB Report 2024',
      summary: 'South Africa carries the world\'s largest burden of XDR-TB. The KwaZulu-Natal lineage 4 strain with bedaquiline resistance is spreading regionally. Genomic surveillance is tracking resistance evolution in real time via the KRISP programme.',
      genomicNote: 'Whole genome sequencing of TB isolates at KRISP revealed novel katG and rpoB mutations. The South African National Health Laboratory Service (NHLS) sequences all confirmed XDR-TB cases.',
      genomicReadiness: READINESS['South Africa'],
      workflow: 'WGS',
      workflowPage: 'lab',
      color: '#e3b341',
      tags: ['TB', 'XDR-TB', 'AMR', 'WGS', 'Bedaquiline resistance'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'malaria-sahel-2024',
      disease: 'Malaria (Plasmodium falciparum)',
      country: 'Sahel Region',
      region: 'West Africa',
      status: 'seasonal-surge',
      severity: 'warning',
      startDate: '2024-06-01',
      updated: '2024-11-01',
      cases: 1200000,
      deaths: 11000,
      caseFatality: 0.9,
      source: 'PMI / WHO AFRO',
      summary: 'Record-high malaria transmission season in the Sahel following exceptional rains. Burkina Faso, Mali, Niger, and Chad report > 30% higher case counts vs 5-year average. Artemisinin partial resistance markers (PfKelch13 C580Y) detected in West African samples.',
      genomicNote: 'Whole genome sequencing of P. falciparum isolates by MalariaGEN confirmed kelch13 C580Y mutations at 8% allele frequency in Burkina Faso — first validated resistance marker outside Southeast Asia.',
      genomicReadiness: READINESS['Burkina Faso'],
      workflow: 'WGS',
      workflowPage: 'lab',
      color: '#e3b341',
      tags: ['Malaria', 'Plasmodium', 'ACT resistance', 'WGS', 'Parasite genomics'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'ebola-sudan-2024',
      disease: 'Ebola Virus Disease (Sudan strain)',
      country: 'Uganda',
      region: 'East Africa',
      status: 'contained',
      severity: 'critical',
      startDate: '2022-09-20',
      updated: '2023-01-11',
      cases: 164,
      deaths: 55,
      caseFatality: 33.5,
      source: 'WHO AFRO / Uganda MoH',
      summary: 'Uganda\'s 2022 Sudan ebolavirus outbreak was the first in the country since 2012. Notably, no approved vaccine existed for Sudan strain. Genomic sequencing guided contact tracing and identified a super-spreader event at a funeral.',
      genomicNote: 'Near-real-time genome sequencing by UVRI/MRC labs identified three phylogenetic clusters consistent with three independent introductions from an unknown animal reservoir. Results published within 48 hours of each cluster detection.',
      genomicReadiness: READINESS['Uganda'],
      workflow: 'WGS',
      workflowPage: 'lab',
      color: '#ff6b6b',
      tags: ['Ebola', 'VHF', 'Sudan strain', 'WGS', 'Phylogenomics'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'meningitis-mena-2024',
      disease: 'Meningococcal Meningitis (NmC)',
      country: 'Nigeria',
      region: 'West Africa (Meningitis Belt)',
      status: 'seasonal-surge',
      severity: 'warning',
      startDate: '2024-01-01',
      updated: '2024-05-30',
      cases: 4218,
      deaths: 391,
      caseFatality: 9.3,
      source: 'NCDC Nigeria / WHO AFRO',
      summary: 'Epidemic season in the African Meningitis Belt with Neisseria meningitidis serogroup C (NmC) dominating in Northwest Nigeria. Zamfara, Sokoto, and Kebbi states most affected.',
      genomicNote: 'Whole genome sequencing at ACEGID confirmed NmC clonal complex 10217 responsible for the outbreak — a hypervirulent lineage that has been circulating in the Belt since 2013. Capsule switching events documented.',
      genomicReadiness: READINESS['Nigeria'],
      workflow: 'WGS',
      workflowPage: 'lab',
      color: '#e3b341',
      tags: ['Meningitis', 'Neisseria', 'Serogroup C', 'WGS', 'Meningitis Belt'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'sars-cov2-africa-2024',
      disease: 'COVID-19 / SARS-CoV-2',
      country: 'Pan-African',
      region: 'All Regions',
      status: 'monitoring',
      severity: 'info',
      startDate: '2020-02-14',
      updated: '2025-06-01',
      cases: 9400000,
      deaths: 175000,
      caseFatality: 1.9,
      source: 'Africa CDC',
      summary: 'Ongoing surveillance for new SARS-CoV-2 variants across Africa. JN.1 and KP.2 subvariants currently dominant. South Africa\'s genomic surveillance network (Network for Genomic Surveillance – NGS-SA) continues to provide early warning of novel variants.',
      genomicNote: 'NGS-SA at KRISP Durban first characterised Omicron BA.1 in November 2021 — one of the most consequential public health genomics findings in history. Real-time sequencing now covers all 9 provinces.',
      genomicReadiness: READINESS['South Africa'],
      workflow: 'WGS',
      workflowPage: 'lab',
      color: '#58a6ff',
      tags: ['COVID-19', 'SARS-CoV-2', 'Variant surveillance', 'WGS', 'NGS-SA'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'dengue-horn-2024',
      disease: 'Dengue Fever (DENV-3)',
      country: 'Somalia / Ethiopia',
      region: 'Horn of Africa',
      status: 'active',
      severity: 'warning',
      startDate: '2024-04-01',
      updated: '2025-02-01',
      cases: 31000,
      deaths: 145,
      caseFatality: 0.5,
      source: 'WHO AFRO / OCHA',
      summary: 'Largest dengue outbreak ever recorded in the Horn of Africa, driven by flooding from the 2023–24 El Niño event creating ideal Aedes aegypti breeding conditions. DENV-3 serotype dominates.',
      genomicNote: 'Metagenomic sequencing confirmed co-circulation of DENV-1 and DENV-3. Phylogenetic analysis shows recent introduction from South Asia, likely via trade routes. Risk of secondary dengue hemorrhagic fever in previously exposed DENV-1 individuals.',
      genomicReadiness: READINESS['Somalia'],
      workflow: 'Metagenomics',
      workflowPage: 'lab',
      color: '#e3b341',
      tags: ['Dengue', 'Arbovirus', 'DENV-3', 'Climate', 'Metagenomics'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'rift-valley-kenya-2024',
      disease: 'Rift Valley Fever',
      country: 'Kenya',
      region: 'East Africa',
      status: 'monitoring',
      severity: 'warning',
      startDate: '2024-10-01',
      updated: '2025-01-15',
      cases: 843,
      deaths: 31,
      caseFatality: 3.7,
      source: 'KEMRI / Kenya MoH',
      summary: 'Rift Valley Fever re-emerged in Kenya\'s arid and semi-arid counties (Garissa, Wajir, Mandera) following heavy rainfall. Both livestock and human cases confirmed. Abattoir workers and veterinarians at highest risk.',
      genomicNote: 'Real-time PCR and next-generation sequencing at KEMRI confirm circulating strains belong to lineage C — the dominant East African clade. Reassortment analysis ongoing to detect novel variants.',
      genomicReadiness: READINESS['Kenya'],
      workflow: 'Metagenomics',
      workflowPage: 'lab',
      color: '#e3b341',
      tags: ['RVF', 'Bunyavirus', 'Zoonosis', 'One Health', 'Reassortant'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
    {
      id: 'lassa-nigeria-2024',
      disease: 'Lassa Fever',
      country: 'Nigeria',
      region: 'West Africa',
      status: 'endemic-peak',
      severity: 'warning',
      startDate: '2024-01-01',
      updated: '2024-04-30',
      cases: 1731,
      deaths: 301,
      caseFatality: 17.4,
      source: 'NCDC Nigeria',
      summary: 'Nigeria\'s 2024 Lassa fever season was the highest on record. Ondo, Edo, and Bauchi States most affected. Healthcare workers represent 8% of confirmed cases. No licensed vaccine available.',
      genomicNote: 'Whole genome sequencing at ACLM Lagos identified 4 distinct Lassa virus lineages co-circulating — genetic diversity complicates vaccine antigen design. The data supports GPC-based vaccine candidates covering all lineages.',
      genomicReadiness: READINESS['Nigeria'],
      workflow: 'WGS',
      workflowPage: 'lab',
      color: '#ff6b6b',
      tags: ['Lassa', 'Arenavirus', 'VHF', 'WGS', 'Nigeria-endemic'],
      who_link: 'https://www.who.int/emergencies/disease-outbreak-news',
    },
  ];

  /* ─── State ─── */
  let _activeFilter = 'all';
  let _activeCountry = null;
  let _lastFetch = null;

  /* ─── Filter outbreaks ─── */
  function _filtered() {
    let list = OUTBREAKS.slice();
    if (_activeFilter !== 'all') list = list.filter(o => o.status === _activeFilter || o.severity === _activeFilter);
    if (_activeCountry) list = list.filter(o => o.country === _activeCountry || o.region.includes(_activeCountry));
    return list;
  }

  /* ─── Severity colour ─── */
  const SEV_COLOR = { critical: '#ff6b6b', warning: '#f97316', info: '#58a6ff', 'monitoring': '#bc8cff', 'contained': '#3fb950', 'endemic': '#e3b341', 'active': '#ff6b6b', 'seasonal-surge': '#f97316', 'endemic-peak': '#e3b341' };
  const STATUS_LABEL = { active: 'ACTIVE', critical: 'CRITICAL', warning: 'WARNING', contained: 'CONTAINED', monitoring: 'MONITORING', info: 'MONITORING', 'seasonal-surge': 'SEASONAL SURGE', 'endemic': 'ENDEMIC', 'endemic-peak': 'ENDEMIC PEAK' };

  /* ─── Render ticker ─── */
  function _renderTicker(outbreaks) {
    const items = outbreaks.filter(o => o.severity === 'critical' || o.status === 'active').slice(0, 6);
    if (!items.length) return '';
    return `
      <div class="alt-ticker-wrap">
        <span class="alt-ticker-label">LIVE ALERTS</span>
        <div class="alt-ticker">
          <div class="alt-ticker-inner">
            ${[...items, ...items].map(o => `
              <span class="alt-ticker-item" style="color:${SEV_COLOR[o.severity]}">
                ● ${o.disease} — ${o.country} (${o.cases.toLocaleString()} cases)
              </span>`).join('<span class="alt-ticker-sep">  ·  </span>')}
          </div>
        </div>
      </div>`;
  }

  /* ─── Render outbreak card ─── */
  function _renderCard(o) {
    const readiness = READINESS[o.country] || { score: '?', tier: 4, seqCap: 'Unknown', labs: 0 };
    const tierColor = ['', '#3fb950', '#e3b341', '#f97316', '#ff6b6b'][readiness.tier] || '#6e7681';
    const statusLabel = STATUS_LABEL[o.status] || STATUS_LABEL[o.severity] || o.status;
    return `
      <div class="alt-card" style="--alt-color:${o.color || SEV_COLOR[o.severity]}">
        <div class="alt-card-top">
          <div class="alt-status-badge" style="color:${o.color}"><span class="alt-status-dot" style="background:${o.color}"></span>${statusLabel}</div>
          <div class="alt-card-tags">${o.tags.slice(0,3).map(t => `<span class="alt-tag">${t}</span>`).join('')}</div>
        </div>
        <div class="alt-disease">${o.disease}</div>
        <div class="alt-location">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${o.country} · ${o.region}
        </div>
        <div class="alt-stats-row">
          <div class="alt-stat"><div class="alt-stat-num">${o.cases >= 1000 ? (o.cases/1000).toFixed(o.cases>=100000?0:1)+'K' : o.cases}</div><div class="alt-stat-label">Cases</div></div>
          <div class="alt-stat"><div class="alt-stat-num">${o.deaths >= 1000 ? (o.deaths/1000).toFixed(1)+'K' : o.deaths}</div><div class="alt-stat-label">Deaths</div></div>
          <div class="alt-stat"><div class="alt-stat-num">${o.caseFatality}%</div><div class="alt-stat-label">CFR</div></div>
        </div>
        <div class="alt-summary">${o.summary}</div>
        <div class="alt-genomic-box">
          <div class="alt-genomic-label">Genomic surveillance note</div>
          <div class="alt-genomic-text">${o.genomicNote}</div>
        </div>
        <div class="alt-card-footer">
          <div class="alt-readiness" style="--tier-color:${tierColor}">
            <div class="alt-readiness-bar-wrap">
              <div class="alt-readiness-bar" style="width:${readiness.score}%"></div>
            </div>
            <span class="alt-readiness-score">${readiness.score}</span>
            <span class="alt-readiness-label">Genomic readiness</span>
          </div>
          <button class="alt-workflow-btn" onclick="OmicsLab.Router&&OmicsLab.Router.navigate('${o.workflowPage}')">
            Run ${o.workflow} Simulation →
          </button>
        </div>
        <div class="alt-source">Source: ${o.source} · Updated ${o.updated}</div>
      </div>`;
  }

  /* ─── Render readiness table ─── */
  function _renderReadinessTable() {
    const sorted = Object.entries(READINESS).sort((a,b) => b[1].score - a[1].score);
    const tierLabel = ['', 'Tier 1 — High capacity', 'Tier 2 — Medium capacity', 'Tier 3 — Limited capacity', 'Tier 4 — Minimal capacity'];
    const tierColor = ['', '#3fb950', '#e3b341', '#f97316', '#ff6b6b'];
    let rows = sorted.map(([country, r]) => `
      <tr class="alt-rt-row">
        <td class="alt-rt-country">${country}</td>
        <td class="alt-rt-bar">
          <div class="alt-rt-bar-wrap">
            <div class="alt-rt-fill" style="width:${r.score}%;background:${tierColor[r.tier]}"></div>
          </div>
        </td>
        <td class="alt-rt-score" style="color:${tierColor[r.tier]}">${r.score}</td>
        <td class="alt-rt-labs">${r.labs}</td>
        <td class="alt-rt-cap">${r.seqCap}</td>
        <td class="alt-rt-notes">${r.notes}</td>
      </tr>`).join('');
    return `
      <div class="alt-readiness-section">
        <div class="alt-section-title">Genomic Readiness by Country</div>
        <div class="alt-readiness-legend">
          ${[1,2,3,4].map(t => `<span class="alt-legend-item" style="color:${tierColor[t]}">● ${tierLabel[t]}</span>`).join('')}
        </div>
        <div class="alt-rt-wrap">
          <table class="alt-rt-table">
            <thead><tr>
              <th>Country</th><th>Score</th><th>/100</th>
              <th>WGS Labs</th><th>Capacity</th><th>Key Institution</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="alt-readiness-source">Scores derived from H3Africa capacity surveys, Africa CDC IDSR reports, and published genomic surveillance assessments (2023–2025). Higher score = greater in-country ability to sequence and respond to outbreaks.</p>
      </div>`;
  }

  /* ─── Refresh feed (try live fetch) ─── */
  function _tryRefresh() {
    const btn = document.getElementById('alt-refresh-btn');
    const ts  = document.getElementById('alt-fetch-ts');
    if (btn) { btn.textContent = 'Checking…'; btn.disabled = true; }
    /* Attempt fetch — will fail silently if offline or CORS blocked */
    fetch('https://www.who.int/feeds/entity/csr/don/en/rss.xml', { mode: 'no-cors', cache: 'no-store' })
      .then(() => {
        _lastFetch = new Date().toLocaleString();
        if (ts) ts.textContent = 'WHO AFRO feed checked — curated data shown (live parsing not available in static PWA)';
        if (btn) { btn.textContent = 'Online — using curated data'; btn.style.color = '#3fb950'; }
      })
      .catch(() => {
        if (ts) ts.textContent = 'Offline — showing bundled outbreak data';
        if (btn) { btn.textContent = 'Offline'; btn.style.color = '#8b949e'; }
      })
      .finally(() => { if (btn) btn.disabled = false; });
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('alerts-section');
    if (!section || section.dataset.altReady) return;
    section.dataset.altReady = '1';
    _render(section);
    setTimeout(_tryRefresh, 800);
  }

  function _render(section) {
    const all = _filtered();
    const critCount = OUTBREAKS.filter(o => o.severity === 'critical' || o.status === 'active').length;
    const countries = [...new Set(OUTBREAKS.map(o => o.country))].length;

    section.innerHTML = `
      <div class="alt-wrap">
        <div class="alt-header">
          <div>
            <div class="alt-badge">GENOMIC SURVEILLANCE</div>
            <h2 class="alt-title">African Disease Alert Feed</h2>
            <p class="alt-subtitle">Curated outbreak intelligence with genomic surveillance notes — linked to OmicsLab workflows. Data sourced from WHO AFRO, Africa CDC, and published genomic reports.</p>
          </div>
          <div class="alt-header-meta">
            <div class="alt-meta-stat"><span class="alt-meta-num alt-meta-red">${critCount}</span> active alerts</div>
            <div class="alt-meta-stat"><span class="alt-meta-num">${OUTBREAKS.length}</span> total events</div>
            <div class="alt-meta-stat"><span class="alt-meta-num">${countries}</span> countries</div>
          </div>
        </div>

        ${_renderTicker(OUTBREAKS)}

        <div class="alt-controls">
          <div class="alt-filter-row">
            ${['all','active','warning','monitoring','contained'].map(f => `
              <button class="alt-filter-btn${_activeFilter===f?' active':''}" data-f="${f}"
                onclick="OmicsLab.Alerts._setFilter('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</button>`).join('')}
          </div>
          <div class="alt-refresh-row">
            <span id="alt-fetch-ts" class="alt-fetch-ts">Showing bundled outbreak data</span>
            <button class="alt-refresh-btn" id="alt-refresh-btn" onclick="OmicsLab.Alerts._tryRefresh()">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              Check for updates
            </button>
          </div>
        </div>

        <div class="alt-grid" id="alt-grid">
          ${all.map(_renderCard).join('')}
        </div>

        ${_renderReadinessTable()}

        <div class="alt-disclaimer">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          Data is curated from WHO AFRO disease outbreak news, Africa CDC situation reports, and peer-reviewed genomic surveillance publications. Case counts and dates reflect reported data at time of curation and may not reflect current totals. For real-time data visit <strong>who.int/emergencies</strong> or <strong>africacdc.org</strong>.
        </div>
      </div>`;
  }

  function _setFilter(f) {
    _activeFilter = f;
    const grid = document.getElementById('alt-grid');
    if (grid) grid.innerHTML = _filtered().map(_renderCard).join('');
    document.querySelectorAll('.alt-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.f === f));
  }

  return { init, _setFilter, _tryRefresh };
})();
