/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Changelog / What's New
   Version history rendered in the changelog section.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Changelog = (function () {

  const ENTRIES = [
    {
      version: '4.0',
      date: 'June 2026',
      badge: 'latest',
      title: 'Five Languages, Global Search & Progress Portability',
      highlights: [
        { icon: 'globe',       text: 'Five language support: English, Français, Kiswahili, Português, العربية — covering all of Africa' },
        { icon: 'search',      text: 'Global Search (Ctrl+K) — instantly find any workflow, disease, tool, or equipment across the platform' },
        { icon: 'database',    text: 'Progress Export/Import — back up and restore all badges, curriculum progress, and settings across devices' },
        { icon: 'tag',         text: 'Changelog section — see the full history of platform improvements' },
        { icon: 'zap',         text: 'Mobile navigation rebuilt — fixed duplicate menus, cleaner structure' },
        { icon: 'eye',         text: 'Rich Open Graph image — when sharing OmicsLab on WhatsApp, Twitter, or LinkedIn, a beautiful preview card now appears' },
        { icon: 'search',      text: 'Full SEO: favicon, robots.txt, sitemap.xml, Twitter Card — OmicsLab is now discoverable on Google' },
        { icon: 'shield',      text: 'Accessibility improvements: ARIA labels, keyboard navigation for search, focus management for modals' },
      ],
    },
    {
      version: '3.0',
      date: 'May 2026',
      badge: '',
      title: 'Curriculum, Badges, Africa Hub, Workshop & HPC Training',
      highlights: [
        { icon: 'award',       text: '3 structured curriculum tracks: Wet-Lab Scientist, Bioinformatician, Public Health Researcher' },
        { icon: 'ribbon',      text: '17 badges across 5 categories with printable PDF certificates (community-driven)' },
        { icon: 'globe',       text: 'Africa Science Hub: data governance, population genomics (H3Africa, AWI-Gen, APCDR), One Health, grant alignment' },
        { icon: 'layers',      text: 'Workshop & Instructor Mode: 6-char session codes, cohort tracking, CSV export for grant reporting' },
        { icon: 'cpu',         text: 'HPC Training Layer: SLURM job builder, queue simulator, Snakemake/Nextflow/WDL/Singularity comparison' },
        { icon: 'microscope',  text: 'Equipment Gallery: 20+ real instruments with photos, specs, and African market pricing' },
        { icon: 'map-pin',     text: 'Interactive Africa Genomics Map: 20+ active labs, H3Africa hubs, surveillance centres' },
        { icon: 'globe',       text: 'English/French (EN/FR) language toggle across the full platform' },
      ],
    },
    {
      version: '2.0',
      date: 'April 2026',
      badge: '',
      title: 'Comparison Modal, Quiz Mode, Troubleshoot Tree & Pipeline Sandbox',
      highlights: [
        { icon: 'scale',       text: 'Workflow Comparison Modal: cost, time, instruments, and sample requirements side-by-side' },
        { icon: 'check-circle',text: 'Quiz Mode: per-workflow knowledge checks with scored results' },
        { icon: 'heart-pulse', text: 'Troubleshooting Decision Tree: interactive wet-lab failure diagnosis' },
        { icon: 'trending-up', text: 'Cost Calculator: per-step cost estimation calibrated for African lab contexts' },
        { icon: 'hexagon',     text: 'Pipeline Sandbox: drag-and-drop bioinformatics tool builder with input/output validation' },
        { icon: 'target',      text: 'Sabotage / Error Injection Mode: teaching tool with hidden step errors for students to find' },
        { icon: 'dna',         text: 'Variant Walkthrough: step-by-step genomic variant interpretation guide' },
        { icon: 'rotate-cw',   text: 'Reproducibility Hub: submit studies, get FAIR/Completeness/Reproducibility scores, browse community work' },
      ],
    },
    {
      version: '1.0',
      date: 'March 2026',
      badge: '',
      title: 'Core Platform Launch',
      highlights: [
        { icon: 'flask',       text: '14 interactive workflow simulations across 8 omics domains (WGS, WES, RNA-seq, scRNA-seq, ATAC-seq, ChIP-seq, Metagenomics, Metabolomics, Proteomics, Virology, CITE-seq)' },
        { icon: 'virus',       text: '40+ disease profiles with African-specific epidemiology and clinical context' },
        { icon: 'bar-chart',   text: '8 live QC metrics with realistic error propagation (RIN, purity, library complexity, Q30, duplication)' },
        { icon: 'dna',         text: 'Bioinformatics Pipeline Guide: complete WGS FASTQ → variant annotation walkthrough' },
        { icon: 'layers',      text: '50+ bioinformatics tools organized by category with input/output specs' },
        { icon: 'database',    text: '16 major data repositories with African research relevance notes' },
        { icon: 'brain',       text: 'Ask OmicsLab: rule-based Q&A engine with 55+ offline answers' },
        { icon: 'zap',         text: 'PWA: install on any device, works fully offline after first load' },
      ],
    },
  ];

  /* Only the latest release shows on the homepage — the full history isn't
     something a visitor needs to see; it's an internal note, not a feature. */
  function render() {
    const container = document.getElementById('changelog-content');
    if (!container) return;

    const entry = ENTRIES[0];
    container.innerHTML = `
      <div class="cl-entry cl-entry-latest">
        <div class="cl-version-col">
          <div class="cl-date">${entry.date}</div>
          <div class="cl-badge-chip">Latest</div>
        </div>
        <div class="cl-content">
          <div class="cl-title">${entry.title}</div>
          <ul class="cl-list">
            ${entry.highlights.slice(0, 4).map(h => `
              <li class="cl-item">
                <span class="cl-item-icon">${OmicsLab.Icons?.svg(h.icon, 14) || ''}</span>
                <span class="cl-item-text">${h.text}</span>
              </li>`).join('')}
          </ul>
        </div>
      </div>`;
  }

  function init() {
    render();
  }

  return { init, render };
})();
