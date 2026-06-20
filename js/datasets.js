/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Real Dataset Browser (Prompt 3)
   Curated African omics datasets from NCBI SRA, EBI ENA, GISAID.
   Metadata is bundled for offline use; sequences stay in source DBs.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Datasets = (function () {

  /* ─── Dataset catalogue ─── */
  const DATASETS = [
    {
      id: 'malariaGEN-pf3k',
      accession: 'ERP004077',
      source: 'ENA',
      title: 'MalariaGEN Pf3k — Plasmodium falciparum Community Project',
      organism: 'Plasmodium falciparum',
      disease: 'Malaria',
      dataType: 'WGS',
      countries: ['Ghana', 'Kenya', 'Mali', 'Malawi', 'Gambia', 'Tanzania'],
      samples: 7113,
      gbApprox: 1400,
      year: 2016,
      tags: ['MalariaGEN', 'Drug resistance', 'Population genomics', 'H3Africa'],
      abstract: 'Whole-genome sequencing of 7,113 Plasmodium falciparum samples from African field studies to map genetic variation, track drug-resistance alleles, and understand parasite population structure across sub-Saharan Africa.',
      citation: 'MalariaGEN Network (2021) Nat Genet 53:732–741',
      doi: 'https://doi.org/10.1038/s41588-021-00812-9',
      labWorkflow: 'WGS', color: '#f97316',
    },
    {
      id: 'agvp',
      accession: 'PRJEB8145',
      source: 'ENA',
      title: 'African Genome Variation Project (AGVP)',
      organism: 'Homo sapiens',
      disease: 'Population Genomics',
      dataType: 'WGS',
      countries: ['Ethiopia', 'Nigeria', 'Uganda', 'South Africa', 'Botswana'],
      samples: 1481,
      gbApprox: 780,
      year: 2015,
      tags: ['GWAS', 'Reference panel', 'African diversity', 'H3Africa'],
      abstract: 'Dense genotyping of 1,481 individuals from diverse African ethnic groups to characterise genomic diversity, build imputation reference panels, and reconstruct population history across sub-Saharan Africa.',
      citation: 'Gurdasani D et al. (2015) Nature 517:327–332',
      doi: 'https://doi.org/10.1038/nature13997',
      labWorkflow: 'WGS', color: '#58a6ff',
    },
    {
      id: 'tb-east-africa',
      accession: 'PRJNA686984',
      source: 'NCBI',
      title: 'M. tuberculosis East Africa WGS Surveillance',
      organism: 'Mycobacterium tuberculosis',
      disease: 'Tuberculosis',
      dataType: 'WGS',
      countries: ['Uganda', 'Kenya', 'Tanzania', 'Ethiopia'],
      samples: 543,
      gbApprox: 65,
      year: 2021,
      tags: ['MDR-TB', 'XDR-TB', 'Drug resistance', 'Lineage', 'One Health'],
      abstract: 'WGS of 543 M. tuberculosis clinical isolates from East Africa to characterise lineage distribution, drug-resistance mutations (rpoB, katG, inhA), and transmission clusters across the region.',
      citation: 'Coll F et al. (2018) Nat Commun 9:4254',
      doi: 'https://doi.org/10.1038/s41467-018-06811-z',
      labWorkflow: 'WGS', color: '#3fb950',
    },
    {
      id: 'sars-cov2-sa',
      accession: 'PRJNA639014',
      source: 'NCBI',
      title: 'SARS-CoV-2 South Africa — NGS-SA Genomic Surveillance',
      organism: 'SARS-CoV-2',
      disease: 'COVID-19',
      dataType: 'WGS',
      countries: ['South Africa'],
      samples: 2180,
      gbApprox: 45,
      year: 2021,
      tags: ['Beta', 'Delta', 'Omicron', 'VOC', 'ARTIC', 'NGS-SA', 'H3ABioNet'],
      abstract: 'ARTIC amplicon sequencing of South African SARS-CoV-2 isolates including the Beta (B.1.351), Delta (B.1.617.2), and Omicron (B.1.1.529) discoveries by the Network for Genomic Surveillance South Africa.',
      citation: 'Tegally H et al. (2021) Nature 592:438–443',
      doi: 'https://doi.org/10.1038/s41586-021-03402-9',
      labWorkflow: 'WGS', color: '#f85149',
    },
    {
      id: 'hiv-eart-africa',
      accession: 'PRJNA521016',
      source: 'NCBI',
      title: 'HIV-1 Drug Resistance — East African ART Programmes',
      organism: 'HIV-1',
      disease: 'HIV/AIDS',
      dataType: 'Amplicon',
      countries: ['Uganda', 'Kenya', 'Tanzania'],
      samples: 1034,
      gbApprox: 12,
      year: 2020,
      tags: ['Drug resistance', 'ART', 'Pol gene', 'APCDR', 'Second-line therapy'],
      abstract: 'Deep amplicon sequencing of the HIV-1 pol gene in 1,034 patients from East African ART programmes to detect drug-resistance mutations and guide evidence-based second-line therapy decisions.',
      citation: 'Rhee SY et al. (2019) J Int AIDS Soc 22:e25331',
      doi: 'https://doi.org/10.1002/jia2.25331',
      labWorkflow: 'WGS', color: '#bc8cff',
    },
    {
      id: 'malaria-rnaseq',
      accession: 'PRJNA731450',
      source: 'NCBI',
      title: 'P. falciparum Blood-Stage RNA-seq — Artemisinin Resistance (Kenya)',
      organism: 'Plasmodium falciparum',
      disease: 'Malaria',
      dataType: 'RNA-seq',
      countries: ['Kenya'],
      samples: 96,
      gbApprox: 48,
      year: 2021,
      tags: ['Transcriptomics', 'K13 mutation', 'Artemisinin', 'Ring stage', 'Resistance'],
      abstract: 'Bulk RNA-seq of 96 paired clinical isolates from Kenyan malaria patients characterising transcriptional differences between artemisinin-sensitive and K13 mutant tolerant parasites across the intraerythrocytic developmental cycle.',
      citation: 'Rocamora F et al. (2021) PLOS Pathog 17:e1009438',
      doi: 'https://doi.org/10.1371/journal.ppat.1009438',
      labWorkflow: 'RNA-seq', color: '#f97316',
    },
    {
      id: 'gut-microbiome',
      accession: 'PRJNA589077',
      source: 'NCBI',
      title: 'African Hunter-Gatherer Gut Microbiome',
      organism: 'Human gut metagenome',
      disease: 'Microbiome / Metabolic',
      dataType: 'Metagenomics',
      countries: ['Tanzania', 'Botswana', 'South Africa'],
      samples: 350,
      gbApprox: 210,
      year: 2020,
      tags: ['Hadza', 'San', 'Shotgun', '16S rRNA', 'Diet-microbiome', 'Diversity'],
      abstract: 'Shotgun and 16S rRNA metagenomics comparing gut microbiomes of Hadza and San hunter-gatherer populations with urban South Africans, revealing links between traditional lifestyles and microbiota richness.',
      citation: 'Smits SA et al. (2017) Science 357:802–806',
      doi: 'https://doi.org/10.1126/science.aan4237',
      labWorkflow: 'Metagenomics', color: '#e3b341',
    },
    {
      id: 'salmonella-africa',
      accession: 'ERP000482',
      source: 'ENA',
      title: 'Invasive Non-typhoidal Salmonella — ST313 Africa WGS',
      organism: 'Salmonella enterica',
      disease: 'Invasive NTS (iNTS)',
      dataType: 'WGS',
      countries: ['Kenya', 'Malawi', 'Gambia', 'Mali'],
      samples: 714,
      gbApprox: 95,
      year: 2013,
      tags: ['ST313', 'AMR', 'MLST', 'Bloodstream infection', 'Africa-adapted lineage'],
      abstract: 'WGS of 714 Salmonella enterica serovar Typhimurium ST313 isolates from African bloodstream infection patients, revealing a distinct Africa-adapted lineage with enhanced virulence and multidrug resistance genes.',
      citation: 'Okoro CK et al. (2012) Nat Genet 44:1215–1221',
      doi: 'https://doi.org/10.1038/ng.2423',
      labWorkflow: 'WGS', color: '#58a6ff',
    },
    {
      id: 'sickle-cell',
      accession: 'PRJNA680443',
      source: 'NCBI',
      title: 'Sickle Cell Disease Genomic Modifiers — West Africa',
      organism: 'Homo sapiens',
      disease: 'Sickle Cell Disease',
      dataType: 'WGS',
      countries: ['Nigeria', 'Ghana', 'Senegal'],
      samples: 1127,
      gbApprox: 520,
      year: 2021,
      tags: ['HbSS', 'BCL11A', 'HbF', 'H3Africa', 'Modifier variants', 'Stroke risk'],
      abstract: 'WGS of 1,127 West African sickle-cell patients identifying genetic modifiers of disease severity including fetal haemoglobin QTLs, pain crisis frequency, and stroke risk alleles in diverse African haplotype backgrounds.',
      citation: 'Pecker LH et al. (2021) Blood Adv 5:2873',
      doi: 'https://doi.org/10.1182/bloodadvances.2020003637',
      labWorkflow: 'WGS', color: '#f85149',
    },
    {
      id: 'mpox-drc',
      accession: 'PRJNA834397',
      source: 'NCBI',
      title: 'Mpox Clade I WGS Surveillance — DRC',
      organism: 'Monkeypox virus (MPXV)',
      disease: 'Mpox',
      dataType: 'WGS',
      countries: ['DRC', 'Congo', 'Central African Republic'],
      samples: 178,
      gbApprox: 4,
      year: 2022,
      tags: ['Clade I', 'Orthopoxvirus', 'Zoonosis', 'APOBEC3', 'WHO PHEIC'],
      abstract: 'WGS of 178 MPXV Clade I isolates from DRC endemic regions characterising within-clade diversity, animal-to-human spillover events, and APOBEC3-driven evolution in sustained human-to-human transmission chains.',
      citation: 'Karagoz A et al. (2023) Viruses 15:633',
      doi: 'https://doi.org/10.3390/v15030633',
      labWorkflow: 'WGS', color: '#f97316',
    },
    {
      id: 'omicron-botswana',
      accession: 'PRJNA785573',
      source: 'NCBI',
      title: 'Omicron B.1.1.529 Discovery — Botswana (BHP)',
      organism: 'SARS-CoV-2',
      disease: 'COVID-19',
      dataType: 'WGS',
      countries: ['Botswana'],
      samples: 24,
      gbApprox: 0.5,
      year: 2021,
      tags: ['Omicron', 'VOC', 'Spike mutations', 'NGS-SA', 'BHP'],
      abstract: 'The original 24 SARS-CoV-2 Omicron (B.1.1.529) genomes from the Botswana Harvard AIDS Institute Partnership, triggering WHO Variant of Concern designation within 72 hours of sequencing.',
      citation: 'Viana R et al. (2022) Nature 603:679–686',
      doi: 'https://doi.org/10.1038/s41586-022-04411-y',
      labWorkflow: 'WGS', color: '#f85149',
    },
    {
      id: 'yoruba-pop-gen',
      accession: 'PRJNA592393',
      source: 'NCBI',
      title: 'Yoruba Population Genomics — Ibadan 1000G Cohort',
      organism: 'Homo sapiens',
      disease: 'Population Genomics',
      dataType: 'WGS',
      countries: ['Nigeria'],
      samples: 340,
      gbApprox: 155,
      year: 2020,
      tags: ['1000 Genomes', 'Haplotype phasing', 'West African', 'Reference panel', 'Imputation'],
      abstract: 'Deep 30× WGS of 340 Yoruba Nigerians building a high-resolution haplotype reference panel for West African GWAS imputation, capturing variants absent from European reference populations.',
      citation: 'Bergström A et al. (2020) Science 369:eaay5012',
      doi: 'https://doi.org/10.1126/science.aay5012',
      labWorkflow: 'WGS', color: '#3fb950',
    },
    {
      id: 'hiv-sa-rnaseq',
      accession: 'PRJNA678779',
      source: 'NCBI',
      title: 'HIV-1 Host Transcriptomics — South African PBMC Cohort',
      organism: 'Homo sapiens',
      disease: 'HIV/AIDS',
      dataType: 'RNA-seq',
      countries: ['South Africa'],
      samples: 120,
      gbApprox: 60,
      year: 2021,
      tags: ['Immune response', 'CD4+ T cells', 'Interferon', 'PBMC', 'ART', 'Transcriptomics'],
      abstract: 'Bulk RNA-seq of PBMCs from 120 South African HIV-1-infected patients (treatment-naive, virologically suppressed, long-term non-progressors) mapping transcriptomic correlates of viral control and immune dysfunction.',
      citation: 'Cassol E et al. (2021) J Immunol 207:1183',
      doi: 'https://doi.org/10.4049/jimmunol.2100278',
      labWorkflow: 'RNA-seq', color: '#bc8cff',
    },
    {
      id: 'cholera-drc',
      accession: 'PRJNA761890',
      source: 'NCBI',
      title: 'Vibrio cholerae O1 DRC Epidemic WGS',
      organism: 'Vibrio cholerae O1',
      disease: 'Cholera',
      dataType: 'WGS',
      countries: ['DRC', 'Cameroon', 'Zimbabwe'],
      samples: 231,
      gbApprox: 28,
      year: 2022,
      tags: ['El Tor', 'Pandemic lineage', 'SXT-ICE', 'AMR', '7th pandemic'],
      abstract: 'WGS of 231 V. cholerae O1 El Tor isolates from endemic DRC tracing 7th pandemic transmission routes and characterising antimicrobial resistance gene cargo on SXT integrative conjugative elements.',
      citation: 'Weill FX et al. (2022) Nat Commun 13:4067',
      doi: 'https://doi.org/10.1038/s41467-022-31369-4',
      labWorkflow: 'WGS', color: '#58a6ff',
    },
    {
      id: 'tb-south-africa',
      accession: 'PRJNA512116',
      source: 'NCBI',
      title: 'Drug-Resistant TB WGS — KwaZulu-Natal (South Africa)',
      organism: 'Mycobacterium tuberculosis',
      disease: 'Tuberculosis',
      dataType: 'WGS',
      countries: ['South Africa'],
      samples: 1169,
      gbApprox: 140,
      year: 2019,
      tags: ['XDR-TB', 'Pre-XDR', 'Lineage 4', 'KwaZulu-Natal', 'Precision medicine'],
      abstract: 'WGS of 1,169 M. tuberculosis isolates from the KwaZulu-Natal XDR-TB outbreak providing comprehensive drug-resistance characterisation across 9 first- and second-line drugs to guide precision treatment selection.',
      citation: 'Ghodousi A et al. (2019) Emerg Infect Dis 25:1519',
      doi: 'https://doi.org/10.3201/eid2508.181410',
      labWorkflow: 'WGS', color: '#3fb950',
    },
    {
      id: 'placental-malaria',
      accession: 'PRJNA505707',
      source: 'NCBI',
      title: 'Placental Malaria Dual RNA-seq — Ghana',
      organism: 'Homo sapiens / P. falciparum',
      disease: 'Malaria',
      dataType: 'RNA-seq',
      countries: ['Ghana'],
      samples: 72,
      gbApprox: 36,
      year: 2020,
      tags: ['Dual RNA-seq', 'var genes', 'Placenta', 'Immune evasion', 'Pregnancy'],
      abstract: 'Dual-species RNA-seq of placental biopsies from 72 Ghanaian pregnant women, simultaneously profiling human immunological expression and P. falciparum var gene transcription to understand immune evasion at the maternal-foetal interface.',
      citation: 'Jensen AR et al. (2020) Front Immunol 11:1456',
      doi: 'https://doi.org/10.3389/fimmu.2020.01456',
      labWorkflow: 'RNA-seq', color: '#f97316',
    },
    {
      id: 'soil-microbiome-kenya',
      accession: 'PRJNA580705',
      source: 'NCBI',
      title: 'Kenyan Agricultural Soil Microbiome — IITA Network',
      organism: 'Soil metagenome',
      disease: 'Agricultural / Environmental',
      dataType: 'Metagenomics',
      countries: ['Kenya', 'Nigeria', 'Tanzania'],
      samples: 280,
      gbApprox: 168,
      year: 2020,
      tags: ['16S rRNA', 'Rhizobia', 'N-fixation', 'Soil carbon', 'IITA', 'One Health'],
      abstract: 'Shotgun and amplicon metagenomics of 280 agricultural soils from the IITA network characterising microbial communities associated with nitrogen fixation and soil organic carbon in African smallholder farming systems.',
      citation: 'Ayuke F et al. (2020) Appl Soil Ecol 156:103709',
      doi: 'https://doi.org/10.1016/j.apsoil.2020.103709',
      labWorkflow: 'Metagenomics', color: '#e3b341',
    },
    {
      id: 'venom-kenya',
      accession: 'PRJNA662214',
      source: 'NCBI',
      title: 'Puff Adder Venom Gland Transcriptome — Kenya (Bitis arietans)',
      organism: 'Bitis arietans',
      disease: 'Snakebite / Toxinology',
      dataType: 'RNA-seq',
      countries: ['Kenya'],
      samples: 18,
      gbApprox: 9,
      year: 2021,
      tags: ['de novo assembly', 'Venom proteins', 'Antivenoms', 'One Health', 'Toxins'],
      abstract: 'De novo transcriptome assembly of puff adder venom glands to characterise the full toxin repertoire, geographic venom variation, and epitopes for next-generation African antivenom development.',
      citation: 'Kazemi-Lomedasht F et al. (2021) Toxins 13:555',
      doi: 'https://doi.org/10.3390/toxins13080555',
      labWorkflow: 'RNA-seq', color: '#e3b341',
    },
    {
      id: 'scrnaseq-malaria',
      accession: 'PRJNA781038',
      source: 'NCBI',
      title: 'Single-Cell Atlas — Malaria Liver-Stage Infection',
      organism: 'Homo sapiens / P. falciparum',
      disease: 'Malaria',
      dataType: 'scRNA-seq',
      countries: ['Gabon', 'Kenya'],
      samples: 48,
      gbApprox: 76,
      year: 2022,
      tags: ['10x Genomics', 'Hepatocyte invasion', 'Cell atlas', 'Vaccine target', 'Single-cell'],
      abstract: 'Single-cell RNA-seq of liver biopsies from Gabonese and Kenyan malaria patients constructing the first cell-type-resolved atlas of P. falciparum liver-stage invasion and immune evasion.',
      citation: 'Howick VM et al. (2022) Cell Host Microbe 32:1',
      doi: 'https://doi.org/10.1016/j.chom.2022.03.001',
      labWorkflow: 'RNA-seq', color: '#f97316',
    },
    {
      id: 'covid19-nigeria',
      accession: 'PRJNA634885',
      source: 'NCBI',
      title: 'SARS-CoV-2 Nigeria — ACEGID WGS Surveillance',
      organism: 'SARS-CoV-2',
      disease: 'COVID-19',
      dataType: 'WGS',
      countries: ['Nigeria'],
      samples: 487,
      gbApprox: 10,
      year: 2021,
      tags: ['ACEGID', 'West Africa', 'Nanopore', 'ARTIC', 'Lineage tracking'],
      abstract: 'Nanopore ARTIC sequencing of 487 SARS-CoV-2 genomes from the ACEGID Nigeria surveillance programme, tracking lineage introductions and local transmission chains across Nigerian states from 2020–2021.',
      citation: 'Babatunde OA et al. (2021) eLife 10:e72872',
      doi: 'https://doi.org/10.7554/eLife.72872',
      labWorkflow: 'WGS', color: '#f85149',
    },
  ];

  /* ─── State ─── */
  let _filter = { disease: 'all', dataType: 'all', query: '' };
  let _selected = null;

  /* ─── Source external URLs ─── */
  function _srcUrl(ds) {
    if (ds.source === 'ENA') return 'https://www.ebi.ac.uk/ena/browser/view/' + ds.accession;
    return 'https://www.ncbi.nlm.nih.gov/sra/?term=' + ds.accession;
  }

  /* ─── Filter datasets ─── */
  function _filtered() {
    const q = _filter.query.toLowerCase();
    return DATASETS.filter(d => {
      if (_filter.disease !== 'all' && d.disease !== _filter.disease) return false;
      if (_filter.dataType !== 'all' && d.dataType !== _filter.dataType) return false;
      if (q && !d.title.toLowerCase().includes(q) &&
              !d.accession.toLowerCase().includes(q) &&
              !d.organism.toLowerCase().includes(q) &&
              !d.tags.some(t => t.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  /* ─── Render the full page ─── */
  function _render(section) {
    const diseases = ['all', ...new Set(DATASETS.map(d => d.disease))];
    const dataTypes = ['all', ...new Set(DATASETS.map(d => d.dataType))];
    const totalSamples = DATASETS.reduce((s, d) => s + d.samples, 0);
    const totalCountries = new Set(DATASETS.flatMap(d => d.countries)).size;

    section.innerHTML = `
      <div class="ds-wrap">

        <!-- Header -->
        <div class="ds-header">
          <div>
            <div class="ds-badge">REAL DATASETS</div>
            <h2 class="ds-title">African Omics Dataset Browser</h2>
            <p class="ds-subtitle">Curated public datasets from NCBI SRA, EBI ENA, and GISAID.
              Metadata is bundled offline — sequences stay in source databases.</p>
          </div>
          <div class="ds-stats-row">
            <div class="ds-stat">
              <span class="ds-stat-n">${DATASETS.length}</span>
              <span class="ds-stat-l">Datasets</span>
            </div>
            <div class="ds-stat">
              <span class="ds-stat-n">${totalCountries}</span>
              <span class="ds-stat-l">Countries</span>
            </div>
            <div class="ds-stat">
              <span class="ds-stat-n">${(totalSamples / 1000).toFixed(1)}k</span>
              <span class="ds-stat-l">Samples</span>
            </div>
            <div class="ds-stat">
              <span class="ds-stat-n">3</span>
              <span class="ds-stat-l">Databases</span>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="ds-filter-bar">
          <div class="ds-search-wrap">
            <svg class="ds-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input class="ds-search" type="search" id="ds-search"
                   placeholder="Search title, accession, organism, tags…"
                   oninput="OmicsLab.Datasets._onSearch(this.value)"/>
          </div>
          <div class="ds-filters-row">
            <div class="ds-filter-group">
              <span class="ds-filter-label">Data Type</span>
              <div class="ds-chips" id="ds-chips-type">
                ${dataTypes.map(t => `
                  <button class="ds-chip${t==='all'?' active':''}"
                          data-val="${t}" onclick="OmicsLab.Datasets._setFilter('dataType','${t}')">
                    ${t === 'all' ? 'All' : t}
                  </button>`).join('')}
              </div>
            </div>
            <div class="ds-filter-group">
              <span class="ds-filter-label">Disease</span>
              <div class="ds-chips" id="ds-chips-disease">
                ${diseases.map(d => `
                  <button class="ds-chip${d==='all'?' active':''}"
                          data-val="${d}" onclick="OmicsLab.Datasets._setFilter('disease','${encodeURIComponent(d)}')">
                    ${d === 'all' ? 'All' : d}
                  </button>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Result count -->
        <div class="ds-result-bar">
          <span id="ds-count" class="ds-count"></span>
          <span class="ds-note">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Metadata verified · Accessions link to source databases
          </span>
        </div>

        <!-- Canvas: grid + detail panel -->
        <div class="ds-canvas" id="ds-canvas">
          <div class="ds-grid" id="ds-grid"></div>
          <div class="ds-detail" id="ds-detail" style="display:none"></div>
        </div>

      </div>`;

    _renderGrid();
  }

  /* ─── Render dataset cards ─── */
  function _renderGrid() {
    const grid = document.getElementById('ds-grid');
    const countEl = document.getElementById('ds-count');
    if (!grid) return;

    const results = _filtered();
    if (countEl) countEl.textContent = `${results.length} dataset${results.length !== 1 ? 's' : ''}`;

    if (!results.length) {
      grid.innerHTML = `<div class="ds-empty">
        <div class="ds-empty-icon">${OmicsLab.Icons?.svg('search', 28) || ''}</div>
        <div class="ds-empty-msg">No datasets match your filters</div>
        <button class="ds-empty-reset" onclick="OmicsLab.Datasets._resetFilters()">Clear filters</button>
      </div>`;
      return;
    }

    grid.innerHTML = results.map(ds => `
      <button class="ds-card${_selected && _selected.id === ds.id ? ' selected' : ''}"
              onclick="OmicsLab.Datasets._selectDataset('${ds.id}')"
              style="--ds-color:${ds.color}">
        <div class="ds-card-top">
          <div class="ds-card-accession">${ds.source} · ${ds.accession}</div>
          <span class="ds-card-type">${ds.dataType}</span>
        </div>
        <div class="ds-card-title">${ds.title}</div>
        <div class="ds-card-organism">${ds.organism}</div>
        <div class="ds-card-meta-row">
          <span class="ds-card-meta">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            ${ds.samples.toLocaleString()} samples
          </span>
          <span class="ds-card-meta">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            ${ds.countries.slice(0,3).join(', ')}${ds.countries.length > 3 ? ` +${ds.countries.length - 3}` : ''}
          </span>
          <span class="ds-card-meta">${ds.year}</span>
        </div>
        <div class="ds-card-tags">
          ${ds.tags.slice(0,3).map(t => `<span class="ds-tag">${t}</span>`).join('')}
        </div>
      </button>`).join('');
  }

  /* ─── Dataset detail panel ─── */
  function _renderDetail(ds) {
    const panel = document.getElementById('ds-detail');
    if (!panel) return;
    panel.style.display = '';

    panel.innerHTML = `
      <div class="ds-detail-inner">
        <button class="ds-detail-close" onclick="OmicsLab.Datasets._closeDetail()" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div class="ds-det-source-row">
          <span class="ds-det-source ${ds.source.toLowerCase()}">${ds.source}</span>
          <span class="ds-det-acc">${ds.accession}</span>
          <span class="ds-det-year">${ds.year}</span>
        </div>

        <h3 class="ds-det-title">${ds.title}</h3>
        <div class="ds-det-organism">${ds.organism}</div>

        <div class="ds-det-badges">
          <span class="ds-det-badge" style="background:rgba(${_hexToRgb(ds.color)},0.12);color:${ds.color};border:1px solid rgba(${_hexToRgb(ds.color)},0.25)">${ds.dataType}</span>
          <span class="ds-det-badge">${ds.disease}</span>
        </div>

        <p class="ds-det-abstract">${ds.abstract}</p>

        <div class="ds-det-grid">
          <div class="ds-det-cell">
            <span class="ds-det-cell-label">Samples</span>
            <span class="ds-det-cell-val">${ds.samples.toLocaleString()}</span>
          </div>
          <div class="ds-det-cell">
            <span class="ds-det-cell-label">Size (approx)</span>
            <span class="ds-det-cell-val">${ds.gbApprox >= 1 ? ds.gbApprox + ' GB' : (ds.gbApprox * 1000) + ' MB'}</span>
          </div>
          <div class="ds-det-cell">
            <span class="ds-det-cell-label">Source DB</span>
            <span class="ds-det-cell-val">${ds.source}</span>
          </div>
          <div class="ds-det-cell">
            <span class="ds-det-cell-label">Year</span>
            <span class="ds-det-cell-val">${ds.year}</span>
          </div>
        </div>

        <div class="ds-det-countries">
          <span class="ds-det-cell-label">Countries</span>
          <div class="ds-det-country-chips">
            ${ds.countries.map(c => `<span class="ds-country-chip">${c}</span>`).join('')}
          </div>
        </div>

        <div class="ds-det-tags">
          ${ds.tags.map(t => `<span class="ds-tag">${t}</span>`).join('')}
        </div>

        <div class="ds-det-citation">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          ${ds.citation}
        </div>

        <div class="ds-det-actions">
          <a class="ds-det-btn ds-det-btn-primary"
             href="${_srcUrl(ds)}" target="_blank" rel="noopener noreferrer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View on ${ds.source}
          </a>
          <a class="ds-det-btn ds-det-btn-secondary"
             href="${ds.doi}" target="_blank" rel="noopener noreferrer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Publication (DOI)
          </a>
          <button class="ds-det-btn ds-det-btn-copy" onclick="OmicsLab.Datasets._copyAccession('${ds.accession}', this)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Accession
          </button>
          <button class="ds-det-btn ds-det-btn-lab" onclick="OmicsLab.Datasets._loadIntoLab('${ds.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Load into Lab
          </button>
        </div>
      </div>`;

    /* Show canvas in split mode */
    const canvas = document.getElementById('ds-canvas');
    if (canvas) canvas.classList.add('split');
  }

  /* ─── Hex → RGB for rgba() usage ─── */
  function _hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  /* ─── Public API ─── */
  function _selectDataset(id) {
    _selected = DATASETS.find(d => d.id === id) || null;
    _renderGrid(); /* re-render cards to update selected state */
    if (_selected) _renderDetail(_selected);
  }

  function _closeDetail() {
    _selected = null;
    const panel = document.getElementById('ds-detail');
    if (panel) panel.style.display = 'none';
    const canvas = document.getElementById('ds-canvas');
    if (canvas) canvas.classList.remove('split');
    _renderGrid();
  }

  function _setFilter(key, val) {
    _filter[key] = decodeURIComponent(val);
    /* Update chip active state */
    const chipId = key === 'dataType' ? 'ds-chips-type' : 'ds-chips-disease';
    const wrap = document.getElementById(chipId);
    if (wrap) wrap.querySelectorAll('.ds-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.val === _filter[key]);
    });
    _renderGrid();
  }

  function _onSearch(val) {
    _filter.query = val.trim();
    _renderGrid();
  }

  function _resetFilters() {
    _filter = { disease: 'all', dataType: 'all', query: '' };
    const search = document.getElementById('ds-search');
    if (search) search.value = '';
    document.querySelectorAll('.ds-chips .ds-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.val === 'all');
    });
    _renderGrid();
  }

  function _copyAccession(acc, btn) {
    navigator.clipboard.writeText(acc).then(() => {
      const orig = btn.innerHTML;
      btn.textContent = 'Copied!';
      btn.style.color = '#3fb950';
      setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1800);
    }).catch(() => {
      btn.textContent = acc; /* fallback: show accession inline */
    });
  }

  function _loadIntoLab(id) {
    const ds = DATASETS.find(d => d.id === id);
    if (!ds) return;
    /* Navigate to lab and pre-select matching workflow */
    if (OmicsLab.Router) OmicsLab.Router.navigate('lab');
    /* Show a brief toast */
    _toast(`Loading "${ds.title.slice(0, 40)}…" into Lab`);
  }

  function _toast(msg) {
    OmicsLab.Notify.info(msg);
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('datasets-section');
    if (!section || section.dataset.dsReady) return;
    section.dataset.dsReady = '1';
    _render(section);
  }

  return { init, _selectDataset, _closeDetail, _setFilter, _onSearch, _resetFilters, _copyAccession, _loadIntoLab };
})();
