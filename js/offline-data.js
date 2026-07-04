/* ═══════════════════════════════════════════════════════
   OmicsLab — Offline Data Packages (Part 5)
   Curated reference panels, databases and example
   datasets packaged for offline / low-bandwidth use.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.OfflineData = (function () {

  const PACKAGES = [
    {
      id:'h3a-qc',
      name:'H3Africa GWAS QC Reference',
      tag:'GWAS',
      size:'~240 MB',
      color:'#f97316',
      desc:'Pre-computed African ancestry PCA loadings, HWE filters and SNP frequency tables from AWI-Gen for rapid GWAS quality control.',
      contents:['1000G AFR phase 3 LD pruned SNPs (VCF)','AWI-Gen QC-passed SNP list','Population stratification PCA eigenvectors (k=10)','R script: run_h3a_qc.R'],
      formats:['VCF.gz','BED/BIM/FAM','TSV','R'],
      useCase:'GWAS quality control, population stratification, ancestry inference',
      status:'available',
      downloadNote:'Access via H3ABioNet portal (DACO approval required)',
      link:'https://h3abionet.org/categories/data-sharing',
    },
    {
      id:'malaria-ref',
      name:'Malaria Genomics Reference Pack',
      tag:'Malaria',
      size:'~380 MB',
      color:'#00C4A0',
      desc:'P. falciparum 3D7 reference genome, resistance marker VCF, and Anopheles gambiae genome for Africa-focused malaria genomics work.',
      contents:['Pf3D7 genome GRCh38-compatible (FASTA)','kelch13 / pfhrp2/3 known variants (VCF)','Pf7 sample metadata (TSV)','A. gambiae PEST genome (FASTA)'],
      formats:['FASTA','VCF','TSV'],
      useCase:'Variant calling, resistance profiling, mosquito population genomics',
      status:'available',
      downloadNote:'Open access — MalariaGEN website',
      link:'https://www.malariagen.net/data/pf7',
    },
    {
      id:'tb-ref',
      name:'M. tuberculosis WGS Pack',
      tag:'TB',
      size:'~120 MB',
      color:'#e3b341',
      desc:'MTB H37Rv reference genome, WHO-validated drug resistance mutations (v2 catalogue), and lineage-defining SNPs for African isolates.',
      contents:['MTB H37Rv NC_000962.3 (FASTA + GFF3)','WHO catalogue resistance mutations (TSV)','Lineage-defining SNPs — Coll 2014 + extended','Sample Snippy config files'],
      formats:['FASTA','GFF3','TSV'],
      useCase:'TB drug resistance prediction, lineage typing, phylogenetics',
      status:'available',
      downloadNote:'Open access — NCBI / WHO',
      link:'https://www.who.int/publications/i/item/9789240082410',
    },
    {
      id:'scd-ref',
      name:'Sickle Cell Disease Genomics Pack',
      tag:'SCD',
      size:'~85 MB',
      color:'#ff6b6b',
      desc:'HBB reference sequences, known SCD and β-thalassemia variants for African populations, ACMG-classified pathogenic variant list.',
      contents:['HBB gene reference (GRCh38 chr11 region)','H3Africa SCD known variants (VCF)','ClinVar pathogenic HBB variants (TSV)','Sickle cell ACMG classification table'],
      formats:['VCF','TSV','FASTA'],
      useCase:'SCD variant calling, carrier screening, clinical genomics',
      status:'available',
      downloadNote:'Open access — ClinVar + H3Africa',
      link:'https://www.ncbi.nlm.nih.gov/clinvar/?term=HBB',
    },
    {
      id:'ancestry-panel',
      name:'Pan-African Ancestry Reference Panel',
      tag:'Population Genetics',
      size:'~1.2 GB',
      color:'#bc8cff',
      desc:'High-density SNP reference panel covering 43 African populations for accurate ancestry inference in continental datasets.',
      contents:['PAAP VCF (GRCh38, ~5M SNPs)','Population labels and metadata (TSV)','STRUCTURE / ADMIXTURE pre-run Q matrices','README with usage guidelines'],
      formats:['VCF.gz','TSV','TXT'],
      useCase:'Ancestry inference, admixture analysis, population stratification correction',
      status:'controlled',
      downloadNote:'Requires DACO data access approval',
      link:'https://ega-archive.org',
    },
    {
      id:'example-fastqs',
      name:'OmicsLab Example Datasets',
      tag:'Teaching',
      size:'~50 MB',
      color:'#58a6ff',
      desc:'Curated small example FASTQ, BAM and VCF files for practising the OmicsLab tools — pre-loaded in each module.',
      contents:['HBB region FASTQ (downsampled, 100x)','APOL1 region BAM + VCF','Pf3D7 kelch13 region BAM','MTB H37Rv snippy output VCF'],
      formats:['FASTQ','BAM','VCF'],
      useCase:'Learning, tool testing, workshop exercises',
      status:'bundled',
      downloadNote:'Bundled with OmicsLab — no download needed',
      link:'',
    },
  ];

  function init() {
    const section = document.getElementById('offline-data-section');
    if (!section || section.dataset.odReady) return;
    section.dataset.odReady = '1';
    const totalSize = '~2.1 GB all packages';
    section.innerHTML = `
      <div class="od-wrap">
        <div class="od-header">
          <div class="od-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Offline Data Packages
          </div>
          <div class="od-header-sub">Curated genomic reference data for offline African genomics research</div>
        </div>
        <div class="od-info-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          OmicsLab is designed for low-bandwidth environments. These packages can be downloaded once and used entirely offline. Total uncompressed: ${totalSize}.
        </div>
        <div class="od-package-list">
          ${PACKAGES.map(p => `<div class="od-pkg-card" style="border-left-color:${p.color}">
            <div class="od-pkg-hdr">
              <div>
                <span class="od-pkg-name">${p.name}</span>
                <span class="od-pkg-tag" style="color:${p.color};border-color:${p.color}30">${p.tag}</span>
              </div>
              <div class="od-pkg-right">
                <span class="od-pkg-size">${p.size}</span>
                <span class="od-pkg-status od-status-${p.status}">${p.status}</span>
              </div>
            </div>
            <div class="od-pkg-desc">${p.desc}</div>
            <div class="od-pkg-contents">
              ${p.contents.map(c => `<div class="od-content-item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#354060" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                ${c}
              </div>`).join('')}
            </div>
            <div class="od-pkg-formats">${p.formats.map(f => `<span class="od-fmt">${f}</span>`).join('')}</div>
            <div class="od-pkg-usecase">Use case: ${p.useCase}</div>
            <div class="od-pkg-actions">
              <div class="od-dl-note">${p.downloadNote}</div>
              ${p.link ? `<a class="od-access-btn" href="${p.link}" target="_blank" rel="noopener">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Access Data
              </a>` : `<span class="od-bundled-label">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                Already bundled
              </span>`}
            </div>
          </div>`).join('')}
        </div>
      </div>`;
  }

  return { init };
})();
