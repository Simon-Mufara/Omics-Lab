/* ═══════════════════════════════════════════════════════════════
   OmicsLab — African Genomics Bioethics Hub
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Bioethics = (function () {

  const CONTEST = [
    { letter: 'C', word: 'Community Engagement', color: '#00C4A0', icon: 'users',
      summary: 'Genomics research must engage communities before, during, and after the study — not merely recruit participants.',
      detail: 'African genomics often involves populations with historically exploitative research experiences. Community Advisory Boards (CABs), community meetings, and vernacular-language consent must be part of the study design, not afterthoughts. H3Africa requires documented community engagement plans for all funded projects.',
      example: 'The MalariaGEN consortium conducted village-level meetings in rural Kenya before sample collection, explaining how genetic data would be used and ensuring community leaders understood the study goals.',
    },
    { letter: 'O', word: 'Oversight', color: '#58a6ff', icon: 'clipboard',
      summary: 'All human genomics research must receive approval from national and institutional ethics committees.',
      detail: 'Every African country has national ethics frameworks. South Africa uses the National Health Research Ethics Council (NHREC). Nigeria uses the National Health Research Ethics Committee (NHREC). Kenya uses KEMRI and NACOSTI. Data access committees (DACs) govern secondary use of genomic data. Federated IRB review is emerging for multi-site African studies.',
      example: 'The H3Africa Consortium requires dual IRB approval — from the country of data collection AND the data analysis institution — before any data transfer can occur.',
    },
    { letter: 'N', word: 'Non-maleficence', color: '#f85149', icon: 'shield',
      summary: 'Genomic data can stigmatise populations, violate privacy, and have insurance or employment consequences.',
      detail: 'African genomics carries unique risks: population-level stigma (e.g., linking genetic variants to specific ethnic groups), re-identification risk even from summary statistics, paternity disclosure, insurance discrimination, and use by law enforcement. Differential privacy techniques and controlled-access repositories mitigate these risks. The H3Africa Data Access Committee uses tiered access.',
      example: 'A 2018 study linking G6PD-deficiency variants to specific Nigerian ethnic groups led to stigma concerns. Researchers now avoid ethnic-level allele reporting without explicit community consent.',
    },
    { letter: 'T', word: 'Transparency', color: '#e3b341', icon: 'eye',
      summary: 'Participants have the right to understand how their data will be used, including secondary use and international sharing.',
      detail: 'Broad consent allows future use but requires honest disclosure of what "future use" may involve — commercial partnerships, AI model training, international collaborations. Pre-publication data sharing through EGA, dbGaP, or H3Africa Data Management platform must be disclosed at consent. Annual reports to communities close the transparency loop.',
      example: 'Uganda\'s National Council for Science and Technology requires researchers to disclose all planned data sharing destinations in the consent form, including whether data may go to non-African institutions.',
    },
    { letter: 'E', word: 'Equity', color: '#bc8cff', icon: 'bar-chart',
      summary: 'African participants should benefit from African genomics research — not merely contribute data for global benefit.',
      detail: 'The exploitative model — African samples flow north, benefits flow back slowly if at all — is being actively challenged. The Nagoya Protocol on access and benefit sharing, African Union Malabo Convention, and H3Africa policies all require that research capacity is built in Africa, results are returned to communities, and intellectual property is shared. Collaborative authorship and training are non-negotiable.',
      example: 'AWI-Gen explicitly required that analysis was led by African scientists, data stayed on African servers, and policy briefs were presented to local health ministries before international publication.',
    },
    { letter: 'S', word: 'Sustainability', color: '#f97316', icon: 'trending-up',
      summary: 'Research must build lasting African genomics capacity — infrastructure, personnel, and institutions.',
      detail: 'Every international collaboration should leave behind trained personnel, working equipment, data management systems, and local publications. Short-term "helicopter research" — where foreign scientists visit, collect, and depart — is ethically problematic. H3Africa, the West African Genetic Epidemiology Network (WAGEN), and the African Academy of Sciences all require documented sustainability plans.',
      example: 'SANBI (South African National Bioinformatics Institute) grew from a single WHO collaboration requirement for local data analysis capacity into a continental hub serving 54 countries.',
    },
    { letter: 'T', word: 'Trust', color: '#ff79c6', icon: 'heart',
      summary: 'Trust is earned through consistent, respectful, and reciprocal engagement with African communities and institutions.',
      detail: 'Historical abuses — Tuskegee, HeLa cells, the Havasupai case — and contemporary concerns (patenting of African medicinal plants, sickle-cell discrimination) make trust-building essential and slow. Trust requires keeping promises: returning results, publishing in open-access journals, ensuring benefit flows. Regular engagement, honest updates about setbacks, and genuine power-sharing build trust over years.',
      example: 'The KEMRI community engagement team in Kilifi, Kenya has maintained relationships with local communities for 30+ years, involving community members in research design and reporting back findings annually.',
    },
  ];

  const CONSENT_TYPES = [
    {
      type: 'Specific Consent', color: '#00C4A0',
      description: 'Participant consents to a defined, specific study only.',
      when: 'Clinical trial with clear outcomes',
      advantages: 'Most protective; clear expectations',
      limitations: 'Data cannot be reused; expensive',
      african_use: 'Vaccine trials, pharmacogenomics studies',
    },
    {
      type: 'Broad Consent', color: '#58a6ff',
      description: 'Participant consents to future, unspecified genomics research within defined boundaries.',
      when: 'Biobank / large cohort studies',
      advantages: 'Data reuse; cost-efficient; H3Africa compliant',
      limitations: 'Participant cannot anticipate all future uses',
      african_use: 'AWI-Gen, H3Africa biobanks, population studies',
    },
    {
      type: 'Dynamic Consent', color: '#bc8cff',
      description: 'Participants can update consent preferences digitally as the study evolves.',
      when: 'Longitudinal digital health studies',
      advantages: 'Participant control; respects autonomy',
      limitations: 'Requires digital access; complex implementation',
      african_use: 'Emerging in South African and Kenyan digital health programs',
    },
    {
      type: 'Tiered Consent', color: '#f97316',
      description: 'Participants choose which specific uses they consent to from a menu of options.',
      when: 'Multi-purpose biobanks',
      advantages: 'Granular control; high participant satisfaction',
      limitations: 'Complex to administer and track',
      african_use: 'Nigerian biobank consortium (Lagos, Ibadan)',
    },
  ];

  const CASE_STUDIES = [
    {
      id: 'hbb', title: 'Sickle Cell Trait Disclosure', country: 'Nigeria / Kenya',
      colour: '#f85149',
      scenario: 'A large WGS study in Lagos identifies HBB p.Glu6Val (sickle cell trait, HbAS) in 28% of participants. The research protocol used broad consent but did not specify return of individual variant results.',
      dilemma: 'Should researchers return individual HBB results to participants? The finding is actionable (reproductive counselling, avoidance of altitude hypoxia) but participants did not expect individual results. Returning results could also stigmatise carriers in the community.',
      framework: ['Autonomy: Participants arguably have a right to know medically actionable findings.', 'Non-maleficence: Disclosure without genetic counselling could cause anxiety or discrimination.', 'Community context: Sickle cell stigma is well-documented in Nigeria — disclosing without community engagement first could cause harm.'],
      resolution: 'H3Africa recommends a policy of returning "actionable, analytic-grade findings" with mandatory pre-disclosure genetic counselling and community-level communication first. In this case, community workshops preceded individual disclosure.',
    },
    {
      id: 'nagoya', title: 'Sample Export and the Nagoya Protocol', country: 'Ethiopia / USA',
      colour: '#e3b341',
      scenario: 'A US university requests transfer of 2,000 plasma samples from an Ethiopian TB cohort for metabolomics analysis. The samples were collected under a 2009 ethics approval that predates the Nagoya Protocol (2014). The US lab will publish findings and file patents on any biomarker discoveries.',
      dilemma: 'Ethiopia ratified the Nagoya Protocol in 2014. Can 2009-collected samples be exported under the old approval? Who owns rights to any patentable biomarkers discovered?',
      framework: ['Nagoya Protocol Art. 3: Applies to genetic resources AND associated traditional knowledge.', 'AU Malabo Convention: Requires material transfer agreements (MTAs) and benefit sharing.', 'Ethiopian BPRAO 2009: National legislation requires a Material Transfer Agreement for all sample exports.'],
      resolution: 'An MTA was negotiated requiring co-authorship for Ethiopian scientists, data sharing back to AHRI (Ethiopia), 25% of any patent licensing revenue to Ethiopian institutions, and capacity building (one Ethiopian scientist trained in metabolomics in the US for 12 months).',
    },
    {
      id: 'gwas', title: 'GWAS Population Stigma', country: 'South Africa (AWI-Gen)',
      colour: '#bc8cff',
      scenario: 'A GWAS of type 2 diabetes in the AWI-Gen cohort identifies a variant at 2q24 that is significantly more frequent in Zulu-speaking participants (MAF 18%) vs Sotho-speaking participants (MAF 3%). A journalist requests permission to publish this finding with ethnic group labels.',
      dilemma: 'Publishing ethnic-specific allele frequencies could reinforce race-based thinking, contribute to insurance discrimination, and stigmatise a cultural group. But suppressing population stratification findings removes scientifically important context.',
      framework: ['H3Africa Data Sharing Policy: Discourages ethnic-level data reporting without community approval.', 'ASHG Guidance 2018: "Population labels are social constructs, not biological categories — report population structure, not ethnic labels."', 'PNAS editorial policy: Recommends ancestry-based (not ethnic-label-based) allele frequency reporting.'],
      resolution: 'Results were reported as ancestral population components (K=3 AWI-Gen clusters) rather than ethnic group labels. Community representatives reviewed the manuscript. Ethnic labels were used only in supplementary material after community advisory board approval.',
    },
  ];

  let _activeCase = 0;
  let _checklist = new Array(10).fill(false);

  const CHECKLIST_ITEMS = [
    'IRB/ethics committee approval obtained from country of sample collection',
    'Consent form translated into local languages (e.g., Swahili, Zulu, Hausa)',
    'Community Advisory Board (CAB) consulted before study launch',
    'Participant right to withdraw without penalty clearly stated',
    'Data sharing plan disclosed to participants in consent form',
    'Material Transfer Agreement (MTA) in place for any sample export',
    'Benefit-sharing plan documented (training, co-authorship, data return)',
    'Individual results return policy defined (including pathogenic variants)',
    'Publication plan includes African co-authors and open-access',
    'Community feedback session planned after publication',
  ];

  function init() {
    const container = document.getElementById('bioethics-content');
    if (!container) return;
    if (container.querySelector('.be-page')) return;

    container.innerHTML = `
<div class="be-page">
  <div class="be-header">
    <h1 class="be-title">African Genomics Bioethics Hub</h1>
    <p class="be-sub">Ethical frameworks, consent standards, data sovereignty, and case studies for human genomics research in Africa — grounded in H3Africa, the Nagoya Protocol, and the CONTEST principles.</p>
  </div>

  <div class="be-tabs-bar">
    <button class="be-nav-tab active" onclick="OmicsLab.Bioethics.showSection('contest',this)">CONTEST Principles</button>
    <button class="be-nav-tab" onclick="OmicsLab.Bioethics.showSection('consent',this)">Consent Types</button>
    <button class="be-nav-tab" onclick="OmicsLab.Bioethics.showSection('cases',this)">Case Studies</button>
    <button class="be-nav-tab" onclick="OmicsLab.Bioethics.showSection('checklist',this)">Ethics Checklist</button>
  </div>

  <div id="be-contest" class="be-section be-section-active">
    <div class="be-section-intro">The CONTEST framework (H3Africa Consortium) defines seven principles for ethical African genomics research. Each card below is interactive — expand for examples.</div>
    <div class="be-contest-grid">
      ${CONTEST.map((c, i) => `
        <div class="be-contest-card" style="--cc:${c.color}" onclick="OmicsLab.Bioethics.toggleContest(${i})">
          <div class="be-cc-header">
            <span class="be-cc-letter" style="color:${c.color}">${c.letter}</span>
            <div class="be-cc-word">${c.word}</div>
          </div>
          <p class="be-cc-summary">${c.summary}</p>
          <div class="be-cc-expand" id="be-cc-${i}">
            <p class="be-cc-detail">${c.detail}</p>
            <div class="be-cc-example"><strong>Example:</strong> ${c.example}</div>
          </div>
          <span class="be-cc-toggle">Expand ▾</span>
        </div>`).join('')}
    </div>
  </div>

  <div id="be-consent" class="be-section">
    <div class="be-section-intro">Four consent models are used in African genomics. The choice depends on study design, data reuse plans, and community expectations.</div>
    <div class="be-consent-grid">
      ${CONSENT_TYPES.map(ct => `
        <div class="be-consent-card" style="--cc:${ct.color}">
          <div class="be-consent-type" style="color:${ct.color}">${ct.type}</div>
          <p class="be-consent-desc">${ct.description}</p>
          <div class="be-consent-row"><span class="be-consent-key">When to use</span><span>${ct.when}</span></div>
          <div class="be-consent-row"><span class="be-consent-key be-pro">Advantages</span><span>${ct.advantages}</span></div>
          <div class="be-consent-row"><span class="be-consent-key be-con">Limitations</span><span>${ct.limitations}</span></div>
          <div class="be-consent-row"><span class="be-consent-key">African use</span><span>${ct.african_use}</span></div>
        </div>`).join('')}
    </div>
  </div>

  <div id="be-cases" class="be-section">
    <div class="be-section-intro">Real-world ethical dilemmas from African genomics research — with frameworks and resolutions.</div>
    <div class="be-case-tabs">
      ${CASE_STUDIES.map((cs, i) => `<button class="be-case-tab${i===_activeCase?' active':''}" style="${i===_activeCase?`border-color:${cs.colour}`:''}" onclick="OmicsLab.Bioethics.showCase(${i})">${cs.title}</button>`).join('')}
    </div>
    <div id="be-case-content"></div>
  </div>

  <div id="be-checklist" class="be-section">
    <div class="be-section-intro">Use this checklist before submitting your ethics application or starting data collection. Check each item as your study design meets the requirement.</div>
    <div class="be-checklist-list" id="be-cl-list"></div>
    <div class="be-cl-progress">
      <div class="be-cl-prog-bar"><div id="be-cl-prog-fill" class="be-cl-prog-fill"></div></div>
      <span id="be-cl-prog-label">0 / ${CHECKLIST_ITEMS.length} complete</span>
    </div>
    <div class="be-cl-note">Completing all 10 items does not guarantee ethics approval, but addresses the most common deficiencies cited by African ethics committees.</div>
  </div>
</div>`;

    _renderCase();
    _renderChecklist();
  }

  function showSection(id, btn) {
    document.querySelectorAll('.be-section').forEach(s => s.classList.remove('be-section-active'));
    document.querySelectorAll('.be-nav-tab').forEach(b => b.classList.remove('active'));
    const el = document.getElementById('be-' + id);
    if (el) el.classList.add('be-section-active');
    btn.classList.add('active');
  }

  function toggleContest(i) {
    const el = document.getElementById(`be-cc-${i}`);
    if (el) el.classList.toggle('expanded');
  }

  function showCase(i) {
    _activeCase = i;
    document.querySelectorAll('.be-case-tab').forEach((b, bi) => {
      b.classList.toggle('active', bi === i);
      b.style.borderColor = bi === i ? CASE_STUDIES[i].colour : '';
    });
    _renderCase();
  }

  function _renderCase() {
    const el = document.getElementById('be-case-content');
    if (!el) return;
    const cs = CASE_STUDIES[_activeCase];
    el.innerHTML = `
      <div class="be-case-card" style="border-color:${cs.colour}">
        <div class="be-case-header">
          <div>
            <div class="be-case-title" style="color:${cs.colour}">${cs.title}</div>
            <div class="be-case-country">${cs.country}</div>
          </div>
        </div>
        <div class="be-case-section">Scenario</div>
        <p class="be-case-text">${cs.scenario}</p>
        <div class="be-case-section">Ethical Dilemma</div>
        <p class="be-case-text">${cs.dilemma}</p>
        <div class="be-case-section">Applicable Frameworks</div>
        <ul class="be-case-list">${cs.framework.map(f=>`<li>${f}</li>`).join('')}</ul>
        <div class="be-case-section">Resolution</div>
        <p class="be-case-text be-case-resolution">${cs.resolution}</p>
      </div>`;
  }

  function _renderChecklist() {
    const el = document.getElementById('be-cl-list');
    if (!el) return;
    el.innerHTML = CHECKLIST_ITEMS.map((item, i) => `
      <label class="be-cl-item${_checklist[i]?' checked':''}">
        <input type="checkbox" ${_checklist[i]?'checked':''} onchange="OmicsLab.Bioethics.toggleCheck(${i})">
        <span class="be-cl-check-icon"></span>
        <span class="be-cl-text">${item}</span>
      </label>`).join('');
    _updateProgress();
  }

  function toggleCheck(i) {
    _checklist[i] = !_checklist[i];
    const items = document.querySelectorAll('.be-cl-item');
    if (items[i]) items[i].classList.toggle('checked', _checklist[i]);
    _updateProgress();
  }

  function _updateProgress() {
    const done = _checklist.filter(Boolean).length;
    const pct = done / CHECKLIST_ITEMS.length * 100;
    const fill = document.getElementById('be-cl-prog-fill');
    const label = document.getElementById('be-cl-prog-label');
    if (fill) { fill.style.width = pct + '%'; fill.style.background = pct >= 100 ? '#00C4A0' : pct >= 60 ? '#e3b341' : '#f85149'; }
    if (label) label.textContent = `${done} / ${CHECKLIST_ITEMS.length} complete`;
  }

  return { init, showSection, toggleContest, showCase, toggleCheck };
})();
