/* OmicsLab — real-data and real-pipeline links shared by tool pages. */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.RealData = (function () {
  const COMMON = [
    { label: 'NCBI SRA', description: 'Raw FASTQ sequencing reads', url: 'https://www.ncbi.nlm.nih.gov/sra' },
    { label: 'ENA Browser', description: 'European Nucleotide Archive reads', url: 'https://www.ebi.ac.uk/ena/browser/home' },
    { label: 'NCBI GEO', description: 'Expression matrices and phenotypes', url: 'https://www.ncbi.nlm.nih.gov/geo/' },
    { label: 'Galaxy Training', description: 'Run real workflows in a hosted workspace', url: 'https://usegalaxy.org/' },
    { label: 'nf-core', description: 'Production Nextflow pipelines', url: 'https://nf-co.re/pipelines' },
    { label: 'Galaxy tutorials', description: 'Guided real-data analyses', url: 'https://training.galaxyproject.org/training-material/' },
  ];

  const PAGE_LINKS = {
    variantinterp: [
      { label: 'gnomAD', description: 'Population allele frequencies', url: 'https://gnomad.broadinstitute.org/' },
      { label: 'ClinVar', description: 'Clinical variant submissions', url: 'https://www.ncbi.nlm.nih.gov/clinvar/' },
      { label: 'Ensembl VEP', description: 'Run consequence annotation', url: 'https://www.ensembl.org/info/docs/tools/vep/index.html' },
      { label: 'ClinGen', description: 'Gene and variant curation', url: 'https://clinicalgenome.org/' },
    ],
    metaanalysis: [
      { label: 'GWAS Catalog', description: 'Download association summary data', url: 'https://www.ebi.ac.uk/gwas/' },
      { label: 'PubMed', description: 'Find studies and effect estimates', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
      { label: 'Cochrane Library', description: 'Systematic review evidence', url: 'https://www.cochranelibrary.com/' },
      { label: 'OpenGWAS', description: 'Open harmonised GWAS datasets', url: 'https://gwas.mrcieu.ac.uk/' },
    ],
    analysis: [
      { label: 'SRA Run Selector', description: 'Choose runs and download metadata', url: 'https://www.ncbi.nlm.nih.gov/Traces/study/' },
      { label: 'Galaxy FASTQ QC', description: 'Run FastQC and MultiQC on real reads', url: 'https://usegalaxy.org/' },
    ],
    'genome-browser': [
      { label: 'Ensembl Region', description: 'Inspect reference sequence and annotations', url: 'https://www.ensembl.org/index.html' },
      { label: 'ClinVar', description: 'Compare variants with public submissions', url: 'https://www.ncbi.nlm.nih.gov/clinvar/' },
      { label: 'gnomAD', description: 'Review population frequencies', url: 'https://gnomad.broadinstitute.org/' },
    ],
    datasets: [
      { label: 'NCBI SRA', description: 'Public sequencing studies and runs', url: 'https://www.ncbi.nlm.nih.gov/sra' },
      { label: 'ENA Browser', description: 'Public reads with downloadable metadata', url: 'https://www.ebi.ac.uk/ena/browser/home' },
      { label: 'GEO', description: 'Public expression studies', url: 'https://www.ncbi.nlm.nih.gov/geo/' },
    ],
    'pipeline-gen': [
      { label: 'nf-core pipelines', description: 'Download tested Nextflow workflows', url: 'https://nf-co.re/pipelines' },
      { label: 'Snakemake workflows', description: 'Reusable workflow catalog', url: 'https://snakemake.github.io/snakemake-workflow-catalog/' },
    ],
    sandbox: [
      { label: 'Galaxy', description: 'Run imported FASTQ, BAM, VCF, and count data', url: 'https://usegalaxy.org/' },
      { label: 'Terra', description: 'Cloud workspaces for reproducible genomics', url: 'https://terra.bio/' },
    ],
    gwas: [
      { label: 'GWAS Catalog', description: 'Public associations and summary statistics', url: 'https://www.ebi.ac.uk/gwas/' },
      { label: 'H3Africa', description: 'African genomics research network', url: 'https://h3africa.org/' },
    ],
    fastqc: [
      { label: 'ENA Browser', description: 'Select public FASTQ runs for QC', url: 'https://www.ebi.ac.uk/ena/browser/home' },
      { label: 'MultiQC', description: 'Aggregate reports from real tools', url: 'https://multiqc.info/' },
    ],
    proteomics: [
      { label: 'ProteomeXchange', description: 'Public mass-spectrometry datasets', url: 'https://www.ebi.ac.uk/pride/' },
      { label: 'UniProt', description: 'Reference protein sequences and annotations', url: 'https://www.uniprot.org/' },
    ],
    'single-cell': [
      { label: 'cellxgene', description: 'Explore public single-cell datasets', url: 'https://cellxgene.cziscience.com/' },
      { label: 'ArrayExpress', description: 'Download expression experiments', url: 'https://www.ebi.ac.uk/biostudies/arrayexpress/' },
    ],
    phylo: [
      { label: 'NCBI Virus', description: 'Public pathogen sequences', url: 'https://www.ncbi.nlm.nih.gov/labs/virus/vssi/' },
      { label: 'Nextstrain', description: 'Real-time pathogen phylogenetics', url: 'https://nextstrain.org/' },
    ],
    'clinical-decision': [
      { label: 'ClinGen', description: 'Clinical gene and variant validity', url: 'https://clinicalgenome.org/' },
      { label: 'CPIC', description: 'Pharmacogenomics guidelines', url: 'https://cpicpgx.org/' },
    ],
  };

  function linksFor(page) {
    return [...(PAGE_LINKS[page] || []), ...COMMON];
  }

  function _escape(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
  }

  function render(page) {
    const header = document.getElementById('page-route-header');
    if (!header || page === 'home' || page === 'lab') return;
    const links = linksFor(page);
    let panel = header.querySelector('.real-data-panel');
    if (panel) panel.remove();
    const wrapper = document.createElement('div');
    wrapper.className = 'real-data-tools';
    wrapper.innerHTML = `
      <button class="real-data-toggle" type="button" aria-expanded="false">
        Real data &amp; pipelines
      </button>
      <div class="real-data-panel" hidden>
        <div class="real-data-panel-heading">
          <strong>Use real samples</strong>
          <span>Download data or run a production workflow outside the demo.</span>
        </div>
        <div class="real-data-links">
          ${links.map((link) => `
            <a href="${_escape(link.url)}" target="_blank" rel="noopener noreferrer">
              <strong>${_escape(link.label)}</strong>
              <span>${_escape(link.description)}</span>
            </a>`).join('')}
        </div>
        <p class="real-data-note">Check each source's access terms and cite the dataset accession in your work. For full pipelines, download the data, then use Galaxy or an nf-core workflow.</p>
      </div>`;
    header.querySelector('.page-route-header')?.appendChild(wrapper);
    const toggle = wrapper.querySelector('.real-data-toggle');
    panel = wrapper.querySelector('.real-data-panel');
    toggle?.addEventListener('click', () => {
      const open = panel?.hasAttribute('hidden');
      if (!panel || !toggle) return;
      if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  return { render, linksFor };
})();
