/* ═══════════════════════════════════════════════════════════════
   OmicsLab PaperHub — Research Paper Repository (Prompt 23)
   ResearchGate-inspired: browse, search, upload metadata, read
   abstracts, track citations, and request full-text — all offline.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PaperHub = (function () {

  const STORE = 'omicslab_paperhub_v1';

  /* ─── Curated paper database ─── */
  const SEED_PAPERS = [
    {
      id: 'p001',
      title: 'The African Genome Variation Project shapes medical genetics in Africa',
      authors: ['Gurdasani D', 'Carstensen T', 'Tekola-Ayele F', '+53 others'],
      journal: 'Nature', year: 2015, volume: '517', pages: '327–332',
      doi: '10.1038/nature13997',
      tags: ['Population genomics', 'Africa', 'GWAS', 'Medical genetics'],
      abstract: 'Given the importance of Africa to studies of human origins and disease, the African Genome Variation Project (AGVP) genotyped over 1,800 individuals from 18 ethno-linguistic groups from sub-Saharan Africa. We identified an extraordinary breadth of allelic diversity and population differentiation, and found that African populations hold the highest genetic diversity of any continent. We identified 14.7 million previously uncharacterised variants and new loci under selection. Our analyses highlight how African population structure shapes the design and interpretation of genomic studies in Africa, with implications for global genomic medicine.',
      citations: 1847, reads: 42300, type: 'research', open: true,
      region: 'Pan-Africa', pinned: true, savedBy: [],
    },
    {
      id: 'p002',
      title: 'H3Africa: current perspectives',
      authors: ['Mulder N', 'Abimiku A', 'Adebamowo SN', '+22 others'],
      journal: 'Pharmacogenomics J', year: 2018, volume: '18', pages: '315–320',
      doi: '10.1038/tpj.2017.drake',
      tags: ['H3Africa', 'Genomics', 'Africa', 'Consortium'],
      abstract: 'The Human Heredity and Health in Africa (H3Africa) Consortium aims to facilitate a contemporary research approach to the study of genomics and environmental determinants of common diseases with the goal of improving the health of African people. This review outlines the consortium structure, the range of disease areas studied across 30+ projects, the bioinformatics infrastructure being developed, and the ethical, legal, and social issues (ELSI) framework. The consortium has generated substantial genomic data and trained over 200 PhD-level scientists across the continent.',
      citations: 312, reads: 9800, type: 'review', open: true,
      region: 'Pan-Africa', pinned: false, savedBy: [],
    },
    {
      id: 'p003',
      title: 'Genomic epidemiology of Ebola virus disease outbreak in West Africa 2013–2016',
      authors: ['Gire SK', 'Goba A', 'Andersen KG', '+57 others'],
      journal: 'Science', year: 2014, volume: '345', pages: '1369–1372',
      doi: '10.1126/science.1259657',
      tags: ['Ebola', 'Outbreak', 'Phylogenomics', 'West Africa', 'Epidemiology'],
      abstract: 'We sequenced 99 Ebola virus genomes from 78 patients in Sierra Leone in the first 24 days of the EBOV epidemic in Sierra Leone. We observed a rapid accumulation of inter- and intra-host genetic variation, allowing us to characterise two distinct lineages, and to estimate substitution rates and phylogenetic origins. The analyses suggest the 2014 West African Ebola epidemic had a single zoonotic transmission event with subsequent human-to-human spread. Genome data provided actionable results for the response in real-time.',
      citations: 2230, reads: 61000, type: 'research', open: true,
      region: 'West Africa', pinned: true, savedBy: [],
    },
    {
      id: 'p004',
      title: 'A whole-genome association study of major determinants for host control of HIV-1',
      authors: ['Fellay J', 'Shianna KV', 'Ge D', '+19 others'],
      journal: 'Science', year: 2007, volume: '317', pages: '944–947',
      doi: '10.1126/science.1143767',
      tags: ['HIV', 'GWAS', 'HLA', 'Africa', 'Immunogenetics'],
      abstract: 'We performed a genome-wide association study (GWAS) of HIV-1 control in 2,554 individuals from North America and Europe. We identified three loci — all within the major histocompatibility complex (MHC) — that together explain 14.5% of the variation in viral set-point. HLA-B alleles, including HLA-B*5701 (associated with protective immunity and abacavir hypersensitivity), showed the strongest signal. The findings have direct implications for vaccine design and understanding natural immunity, with particular relevance for high-burden African settings.',
      citations: 1654, reads: 38900, type: 'research', open: false,
      region: 'Pan-Africa', pinned: false, savedBy: [],
    },
    {
      id: 'p005',
      title: 'Whole genome sequencing of Mycobacterium tuberculosis for drug-resistance prediction and treatment: a multisite prospective study',
      authors: ['Battaglia S', 'Spitaleri A', 'Cabibbe AM', '+41 others'],
      journal: 'Lancet Infect Dis', year: 2021, volume: '21', pages: '1394–1406',
      doi: '10.1016/S1473-3099(21)00035-6',
      tags: ['Tuberculosis', 'WGS', 'Drug resistance', 'Southern Africa'],
      abstract: 'We prospectively evaluated WGS-based drug resistance prediction for Mycobacterium tuberculosis across four countries: Italy, South Africa, Vietnam, and Belarus. WGS reached 97.1% sensitivity and 99.5% specificity for isoniazid, outperforming phenotypic DST turnaround time by 21 days on average. For rifampicin, sensitivity was 98.2%. In South Africa, where MDR-TB prevalence is highest, WGS-guided treatment led to significantly better outcomes at 6 months. We identified 23 novel candidate resistance mutations specific to the South African strain lineage.',
      citations: 489, reads: 14200, type: 'research', open: false,
      region: 'Southern Africa', pinned: false, savedBy: [],
    },
    {
      id: 'p006',
      title: 'APOL1 kidney risk alleles: population genetics and disease associations',
      authors: ['Genovese G', 'Friedman DJ', 'Pollak MR'],
      journal: 'Adv Chronic Kidney Dis', year: 2013, volume: '20', pages: '203–210',
      doi: '10.1053/j.ackd.2013.02.005',
      tags: ['APOL1', 'CKD', 'Africa', 'Population genetics', 'G1', 'G2'],
      abstract: 'Two coding variants in APOL1 — G1 (S342G/I384M) and G2 (del388-389) — are African-specific and confer striking risk for non-diabetic kidney disease. The G1/G2 risk genotype is present in 13% of African Americans and accounts for ~35% of excess kidney disease risk compared to European Americans. These variants are maintained at high frequency likely due to positive selection for resistance to Trypanosoma brucei rhodesiense. The APOL1 story provides a paradigm for how population-specific variants affect disease burden in Africa.',
      citations: 921, reads: 27400, type: 'review', open: true,
      region: 'West Africa', pinned: false, savedBy: [],
    },
    {
      id: 'p007',
      title: 'Population structure of Plasmodium falciparum in sub-Saharan Africa and implications for artemisinin resistance surveillance',
      authors: ['Amambua-Ngwa A', 'Amenga-Etego L', 'Awandare GA', '+48 others'],
      journal: 'Nat Genet', year: 2019, volume: '51', pages: '1254–1263',
      doi: '10.1038/s41588-019-0453-x',
      tags: ['Malaria', 'Plasmodium', 'Drug resistance', 'Genomics', 'Africa'],
      abstract: 'Using whole-genome sequencing of 3,346 Plasmodium falciparum isolates from 26 African countries, we characterise continental population structure and identify sweeps consistent with drug selection. We observe strong differentiation between East and West African parasite populations. The Kelch13 C580Y mutation, associated with partial artemisinin resistance in Southeast Asia, was identified at low frequency in Uganda and Rwanda — raising urgent surveillance needs. Our data establish a genomic baseline for continental drug resistance monitoring.',
      citations: 673, reads: 19800, type: 'research', open: true,
      region: 'Sub-Saharan Africa', pinned: true, savedBy: [],
    },
    {
      id: 'p008',
      title: 'AWI-Gen Collaborative Centre: a resource to study cardiovascular disease risk factors in sub-Saharan Africa',
      authors: ['Hazelhurst S', 'Mashinya F', 'Mamun R', '+67 others'],
      journal: 'Glob Health Epidemiol Genom', year: 2017, volume: '2', pages: 'e5',
      doi: '10.1017/gheg.2017.4',
      tags: ['AWI-Gen', 'Cardiovascular disease', 'GWAS', 'Multi-site', 'Africa'],
      abstract: 'The AWI-Gen Collaborative Centre enrolled over 12,000 participants from six sites in Burkina Faso, Ghana, Kenya, Nigeria, South Africa, and Tanzania. We describe the cohort design, phenotypic characterisation, and genomic data generation. Genome-wide genotyping (∼2.5 million SNPs) was performed using the H3Africa array. Site-specific allele frequency differences were substantial, highlighting the genetic diversity across sub-Saharan Africa. This resource is openly accessible for cardiometabolic research.',
      citations: 204, reads: 7600, type: 'research', open: true,
      region: 'Pan-Africa', pinned: false, savedBy: [],
    },
    {
      id: 'p009',
      title: 'Sickle cell disease in Africa: a neglected cause of early childhood mortality',
      authors: ['Piel FB', 'Hay SI', 'Gupta S', 'Weatherall DJ', 'Williams TN'],
      journal: 'PLoS Med', year: 2013, volume: '10', pages: 'e1001484',
      doi: '10.1371/journal.pmed.1001484',
      tags: ['Sickle cell disease', 'HBB', 'Africa', 'Childhood mortality', 'Epidemiology'],
      abstract: 'We estimated the global burden of sickle cell disease (SCD) at birth for 2010 using a validated geographic model of HbS gene frequency. An estimated 312,000 infants were born with SCD globally in 2010, of whom 79.4% were in sub-Saharan Africa. Nigeria (97,200), DRC (39,700), and Cameroon (14,600) had the highest national estimates. Without comprehensive newborn screening and penicillin prophylaxis, approximately 50–90% of children with SCD in Africa die before their fifth birthday. These findings call for urgent scale-up of affordable interventions.',
      citations: 1032, reads: 31900, type: 'research', open: true,
      region: 'Sub-Saharan Africa', pinned: false, savedBy: [],
    },
    {
      id: 'p010',
      title: 'Real-time genomic surveillance of SARS-CoV-2 in Africa using nanopore sequencing',
      authors: ['Msomi N', 'Lessells R', 'Mlisana K', '+31 others'],
      journal: 'Science', year: 2022, volume: '375', pages: 'eabj4418',
      doi: '10.1126/science.abj4418',
      tags: ['SARS-CoV-2', 'Omicron', 'Genomic surveillance', 'Africa', 'Nanopore'],
      abstract: 'Africa has rapidly built sequencing capacity throughout the COVID-19 pandemic. We describe the SARS-CoV-2 genomic epidemiology across 54 African countries, with particular focus on the emergence and spread of the Omicron variant (B.1.1.529) first identified in Southern Africa. Using Oxford Nanopore sequencing deployed at 16 African laboratories, we generated 23,000+ genomes from 30 countries. The Omicron lineage shows a 38-fold increase in immune escape mutations relative to Delta. Our findings highlight the importance of sustained African genomic surveillance capacity.',
      citations: 1421, reads: 53000, type: 'research', open: true,
      region: 'Pan-Africa', pinned: true, savedBy: [],
    },
  ];

  /* ─── State ─── */
  let _state = {
    papers: [],
    activeId: null,
    filter: { query: '', tag: '', region: '', type: '', open: false },
    saved: [],
  };

  /* ─── Storage ─── */
  function _load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw);
        _state.saved = s.saved || [];
        if (s.papers && s.papers.length) { _state.papers = s.papers; return; }
      }
    } catch {}
    _state.papers = SEED_PAPERS.map(p => ({
      ...p,
      savedBy: _state.saved.includes(p.id) ? ['You'] : [],
    }));
  }

  function _save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ papers: _state.papers, saved: _state.saved }));
    } catch {}
  }

  /* ─── Filter ─── */
  function _filtered() {
    const { query, tag, region, type, open } = _state.filter;
    return _state.papers.filter(p => {
      if (open && !p.open) return false;
      if (type && p.type !== type) return false;
      if (region && p.region !== region) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (query) {
        const q = query.toLowerCase();
        const haystack = `${p.title} ${p.authors.join(' ')} ${p.abstract} ${p.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  /* ─── All unique tags / regions ─── */
  function _allTags() {
    const s = new Set();
    _state.papers.forEach(p => p.tags.forEach(t => s.add(t)));
    return [...s].sort();
  }

  function _allRegions() {
    const s = new Set(_state.papers.map(p => p.region));
    return [...s].sort();
  }

  /* ─── Citation badge ─── */
  function _citBadge(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  /* ─── Paper card HTML ─── */
  function _cardHtml(p) {
    const saved = _state.saved.includes(p.id);
    const isActive = p.id === _state.activeId;
    return `
      <article class="ph-card ${isActive ? 'ph-card-active' : ''} ${p.pinned ? 'ph-card-pinned' : ''}"
               onclick="OmicsLab.PaperHub._open('${p.id}')">
        <div class="ph-card-header">
          <span class="ph-type-badge ph-type-${p.type}">${p.type}</span>
          ${p.open ? '<span class="ph-oa-badge">Open Access</span>' : ''}
          ${p.pinned ? '<span class="ph-pin-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>' : ''}
        </div>
        <h3 class="ph-card-title">${p.title}</h3>
        <div class="ph-card-authors">${p.authors.slice(0, 3).join(', ')}${p.authors.length > 3 ? ' …' : ''}</div>
        <div class="ph-card-meta">
          <span class="ph-journal">${p.journal} ${p.year}</span>
          <span class="ph-region-tag">${p.region}</span>
        </div>
        <div class="ph-card-tags">${p.tags.slice(0, 4).map(t => `<span class="ph-tag">${t}</span>`).join('')}</div>
        <div class="ph-card-stats">
          <span class="ph-stat">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            ${_citBadge(p.citations)} citations
          </span>
          <span class="ph-stat">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ${(p.reads / 1000).toFixed(1)}k reads
          </span>
          <button class="ph-save-btn ${saved ? 'ph-saved' : ''}"
                  onclick="event.stopPropagation(); OmicsLab.PaperHub._toggleSave('${p.id}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            ${saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </article>`;
  }

  /* ─── Paper detail HTML ─── */
  function _detailHtml(p) {
    if (!p) return '<div class="ph-detail-empty">Select a paper to read its abstract.</div>';
    const saved = _state.saved.includes(p.id);
    return `
      <div class="ph-detail-inner">
        <div class="ph-detail-top">
          <div class="ph-detail-badges">
            <span class="ph-type-badge ph-type-${p.type}">${p.type}</span>
            ${p.open ? '<span class="ph-oa-badge">Open Access</span>' : ''}
          </div>
          <h2 class="ph-detail-title">${p.title}</h2>
          <div class="ph-detail-authors">${p.authors.join(', ')}</div>
          <div class="ph-detail-citation">
            <em>${p.journal}</em> ${p.year}; <strong>${p.volume}</strong>: ${p.pages}
            · DOI: <span class="ph-doi">${p.doi}</span>
          </div>
          <div class="ph-detail-region">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            ${p.region}
          </div>
        </div>

        <div class="ph-detail-abstract">
          <div class="ph-section-label">Abstract</div>
          <p>${p.abstract}</p>
        </div>

        <div class="ph-detail-tags">
          ${p.tags.map(t => `<span class="ph-tag ph-tag-lg" onclick="OmicsLab.PaperHub._filterTag('${t}')">${t}</span>`).join('')}
        </div>

        <div class="ph-detail-stats">
          <div class="ph-stat-card">
            <div class="ph-stat-val">${p.citations.toLocaleString()}</div>
            <div class="ph-stat-lbl">Citations</div>
          </div>
          <div class="ph-stat-card">
            <div class="ph-stat-val">${p.reads.toLocaleString()}</div>
            <div class="ph-stat-lbl">Reads</div>
          </div>
          <div class="ph-stat-card">
            <div class="ph-stat-val">${p.year}</div>
            <div class="ph-stat-lbl">Published</div>
          </div>
        </div>

        <div class="ph-detail-actions">
          <button class="ph-action-btn ph-action-primary" onclick="OmicsLab.PaperHub._toggleSave('${p.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            ${saved ? 'Saved to Library' : 'Save to Library'}
          </button>
          <button class="ph-action-btn" onclick="OmicsLab.PaperHub._cite('${p.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            Cite
          </button>
          ${p.open ? `<button class="ph-action-btn" onclick="OmicsLab.PaperHub._copyDoi('${p.doi}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            DOI Link
          </button>` : `<button class="ph-action-btn" onclick="OmicsLab.PaperHub._requestAccess('${p.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Request Access
          </button>`}
        </div>

        <div class="ph-cite-box" id="ph-cite-${p.id}" style="display:none">
          <div class="ph-section-label">Citation (APA)</div>
          <code class="ph-cite-text">${p.authors.slice(0, 3).join(', ')}${p.authors.length > 3 ? ', et al.' : ''}. (${p.year}). ${p.title}. <em>${p.journal}</em>, <strong>${p.volume}</strong>, ${p.pages}. https://doi.org/${p.doi}</code>
          <button class="ph-copy-cite" onclick="OmicsLab.PaperHub._copyCite('${p.id}')">Copy</button>
        </div>
      </div>`;
  }

  /* ─── Actions ─── */
  function _open(id) {
    _state.activeId = id;
    const paper = _state.papers.find(p => p.id === id);
    if (paper) paper.reads++;
    _save();
    _renderList();
    _renderDetail();
  }

  function _toggleSave(id) {
    const idx = _state.saved.indexOf(id);
    if (idx === -1) _state.saved.push(id);
    else _state.saved.splice(idx, 1);
    _save();
    _renderList();
    _renderDetail();
  }

  function _cite(id) {
    const el = document.getElementById(`ph-cite-${id}`);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }

  function _copyCite(id) {
    const p = _state.papers.find(x => x.id === id);
    if (!p) return;
    const text = `${p.authors.slice(0, 3).join(', ')}${p.authors.length > 3 ? ', et al.' : ''}. (${p.year}). ${p.title}. ${p.journal}, ${p.volume}, ${p.pages}. https://doi.org/${p.doi}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    const btn = document.querySelector(`#ph-cite-${id} .ph-copy-cite`);
    if (btn) { btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
  }

  function _copyDoi(doi) {
    navigator.clipboard?.writeText(`https://doi.org/${doi}`).catch(() => {});
  }

  function _requestAccess(id) {
    const el = document.querySelector(`.ph-detail-actions .ph-action-btn:last-child`);
    if (el) { el.textContent = 'Request Sent'; el.disabled = true; }
  }

  function _filterTag(tag) {
    _state.filter.tag = tag;
    _renderFilters();
    _renderList();
  }

  /* ─── Render ─── */
  function _renderFilters() {
    const filt = document.getElementById('ph-filters');
    if (!filt) return;
    const { query, tag, region, type, open } = _state.filter;
    filt.innerHTML = `
      <input class="ph-search" type="search" placeholder="Search papers, authors, topics…"
             value="${query}" oninput="OmicsLab.PaperHub._setFilter('query', this.value)"/>
      <select class="ph-select" onchange="OmicsLab.PaperHub._setFilter('type', this.value)">
        <option value="">All types</option>
        <option value="research" ${type === 'research' ? 'selected' : ''}>Research article</option>
        <option value="review" ${type === 'review' ? 'selected' : ''}>Review</option>
      </select>
      <select class="ph-select" onchange="OmicsLab.PaperHub._setFilter('region', this.value)">
        <option value="">All regions</option>
        ${_allRegions().map(r => `<option value="${r}" ${region === r ? 'selected' : ''}>${r}</option>`).join('')}
      </select>
      <label class="ph-oa-toggle">
        <input type="checkbox" ${open ? 'checked' : ''} onchange="OmicsLab.PaperHub._setFilter('open', this.checked)"/>
        Open Access only
      </label>
      ${tag ? `<button class="ph-tag-clear" onclick="OmicsLab.PaperHub._setFilter('tag','')">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ${tag}
      </button>` : ''}`;
  }

  function _setFilter(key, val) {
    _state.filter[key] = val;
    _renderFilters();
    _renderList();
  }

  function _renderList() {
    const list = document.getElementById('ph-list');
    if (!list) return;
    const papers = _filtered();
    if (!papers.length) {
      list.innerHTML = '<div class="ph-empty">No papers match your filters.</div>';
      return;
    }
    list.innerHTML = papers.map(p => _cardHtml(p)).join('');
  }

  function _renderDetail() {
    const det = document.getElementById('ph-detail');
    if (!det) return;
    const p = _state.papers.find(x => x.id === _state.activeId);
    det.innerHTML = _detailHtml(p || null);
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('paperhub-section');
    if (!section || section.dataset.phReady) return;
    section.dataset.phReady = '1';

    _load();

    section.innerHTML = `
      <div class="ph-wrap">
        <div class="ph-header">
          <div class="ph-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            PaperHub
          </div>
          <div class="ph-header-sub">African Genomics Research Library — ${_state.papers.length} curated papers</div>
        </div>

        <div id="ph-filters" class="ph-filters"></div>

        <div class="ph-layout">
          <div id="ph-list" class="ph-list"></div>
          <div id="ph-detail" class="ph-detail"></div>
        </div>
      </div>`;

    _renderFilters();
    _renderList();
    _renderDetail();
  }

  return { init, _open, _toggleSave, _cite, _copyCite, _copyDoi, _requestAccess, _filterTag, _setFilter };
})();
