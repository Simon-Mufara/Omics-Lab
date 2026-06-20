/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Community Protocol Sharing (Prompt 6)
   Browse, fork, remix, and share community-built lab protocols.
   Stored in localStorage — works fully offline.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Protocols = (function () {

  const STORE_KEY = 'omicslab_protocols_v1';
  const MINE_KEY  = 'omicslab_my_protocols_v1';

  /* ─── Seed community protocols ─── */
  const SEED_PROTOCOLS = [
    {
      id: 'p001',
      title: 'H3Africa WGS Library Prep — Low-Input Human Blood',
      author: 'Kwame A. — Noguchi Memorial, Ghana',
      avatar: '',
      institution: 'Noguchi Memorial Institute for Medical Research',
      country: 'Ghana',
      domain: 'Genomics',
      dataType: 'WGS',
      organism: 'Homo sapiens',
      tags: ['H3Africa', 'WGS', 'Low-input', 'Blood', 'NEBNext'],
      forks: 47,
      views: 312,
      rating: 4.8,
      createdAt: '2024-03-15',
      verified: true,
      steps: [
        { n:1, title:'DNA Extraction', detail:'QIAamp DNA Blood Mini Kit. Input: 200 µL EDTA blood. Elute in 200 µL AE buffer. Target: ≥ 200 ng, OD 260/280 ≥ 1.8.' },
        { n:2, title:'Quantification', detail:'Qubit BR dsDNA assay. Measure in duplicate. Accept if CV < 5%. Do NOT use NanoDrop for final library input.' },
        { n:3, title:'Fragmentation', detail:'Covaris LE220 ultrasonicator. Target peak: 550 bp. Settings: 450W, 10% duty factor, 200 cycles/burst, 45 s.' },
        { n:4, title:'Library Prep', detail:'NEBNext Ultra II FS kit. End-repair + A-tailing: 37°C 30 min. Adapter ligation: 20°C 15 min. Input: 100–400 ng. Use NEBNext Multiplex Oligos (96 indexes).' },
        { n:5, title:'Library Amplification', detail:'8 cycles PCR (reduce if input >200 ng to minimise duplicates). Use NEBNext Q5 polymerase. Hold at 4°C.' },
        { n:6, title:'Size Selection', detail:'AMPure XP beads: 0.6× then 0.9× double-sided selection. Elute 20 µL 10 mM Tris pH 8. Target: 400–700 bp.' },
        { n:7, title:'Library QC', detail:'Agilent D1000 tape: check fragment size distribution, no adapter dimer peak. Qubit HS: measure concentration. Accept if ≥ 5 nM and no adapter peak at 160 bp.' },
        { n:8, title:'Sequencing', detail:'Illumina NovaSeq 6000, S4 flow cell, 2×150 bp. Target: 30× coverage per sample. Load at 300 pM + 1% PhiX.' },
      ],
      notes: 'Optimised for low-input samples common in H3Africa field studies. Tested on 500+ samples from Ghana and Kenya. Key tweak: 45-second fragmentation (not 60s) gives cleaner 550bp peaks on the Covaris.',
    },
    {
      id: 'p002',
      title: 'ARTIC v4.1 SARS-CoV-2 Sequencing — Nanopore MinION (Africa CDC)',
      author: 'Nkosi M. — NICD, South Africa',
      avatar: '',
      institution: 'National Institute for Communicable Diseases',
      country: 'South Africa',
      domain: 'Virology',
      dataType: 'WGS',
      organism: 'SARS-CoV-2',
      tags: ['ARTIC', 'Nanopore', 'COVID-19', 'Surveillance', 'Africa CDC'],
      forks: 134,
      views: 891,
      rating: 4.9,
      createdAt: '2023-11-08',
      verified: true,
      steps: [
        { n:1, title:'RNA Extraction', detail:'QIAamp Viral RNA Mini Kit from 140 µL NP swab in VTM. Elute 60 µL. Target Ct < 30 (E gene) for reliable amplification.' },
        { n:2, title:'cDNA Synthesis', detail:'LunaScript RT (NEB). Anneal random hexamers + dNTPs 65°C 5 min. Reverse transcription: 55°C 10 min, 95°C 1 min. Input: 8 µL RNA.' },
        { n:3, title:'ARTIC PCR Pool 1 + 2', detail:'Two separate PCR reactions (Pool 1: 98 primers, Pool 2: 98 primers). ARTIC v4.1 primer set. Q5 polymerase 35 cycles. Anneal 65°C.' },
        { n:4, title:'Pool and Clean', detail:'Combine Pool 1 + 2 equally (5 µL each). AMPure XP 1× beads. Elute 30 µL nuclease-free water.' },
        { n:5, title:'Nanopore Library Prep', detail:'Oxford Nanopore Rapid Barcoding Kit (SQK-RBK114.24). 2.5 µL amplicons + 2.5 µL RAB. Barcode ligation 5 min RT. Pool barcoded samples equally.' },
        { n:6, title:'Sequencing', detail:'Oxford Nanopore R10.4.1 flow cell. MinKNOW sequencing run 12–16 hours. Target: ≥ 500 reads per amplicon per sample. Use Guppy super-accuracy basecalling.' },
        { n:7, title:'Bioinformatics', detail:'ARTIC pipeline: guppyplex filter 400–700 bp → minimap2 alignment to MN908947.3 → medaka variant calling → pangolin lineage assignment → GISAID upload.' },
      ],
      notes: 'This protocol runs in standard BSL-2. Critical: inactivate samples with AVL buffer before extraction. Ct 30–35 samples still produce >75% genome coverage with 35 cycles. Batch 24 samples per MinION run for cost efficiency.',
    },
    {
      id: 'p003',
      title: 'M. tuberculosis WGS — Clinical MGIT Isolates',
      author: 'Abebe T. — AHRI, Ethiopia',
      avatar: '',
      institution: 'Armauer Hansen Research Institute',
      country: 'Ethiopia',
      domain: 'Bacteriology',
      dataType: 'WGS',
      organism: 'Mycobacterium tuberculosis',
      tags: ['TB', 'WGS', 'Drug resistance', 'MGIT', 'Ethiopia'],
      forks: 28,
      views: 187,
      rating: 4.7,
      createdAt: '2024-01-22',
      verified: true,
      steps: [
        { n:1, title:'Bacterial Culture', detail:'MGIT 960 automated liquid culture. Positive MGIT tube: confirm AFB by Ziehl-Neelsen stain before proceeding. Work in BSL-3.' },
        { n:2, title:'Heat Inactivation', detail:'Transfer 1 mL culture to 2 mL tube. 80°C heat block 30 min. Confirm inactivation before moving to BSL-2 workspace.' },
        { n:3, title:'DNA Extraction', detail:'CTAB extraction: add 300 µL TE + 50 µL 10% SDS + 5 µL proteinase K. 37°C 10 min. Freeze-thaw 3× (–80°C/65°C). CTAB + NaCl at 65°C. Chloroform:isoamyl extraction × 2. Isopropanol precipitation.' },
        { n:4, title:'DNA QC', detail:'NanoDrop (OD 260/280 1.8–2.0, OD 260/230 > 1.8). Qubit HS. Target: ≥ 500 ng. 0.8% agarose gel: high molecular weight band, no smear.' },
        { n:5, title:'Library Prep', detail:'Illumina DNA Prep kit (Nextera chemistry). Input: 100 ng in 30 µL. BLT bead incubation 10 min 37°C. Amplify 8 cycles. AMPure XP 0.8×.' },
        { n:6, title:'Sequencing', detail:'Illumina MiSeq 2×250 bp. Target: 100× coverage. For TB WGS, 100× ensures confident detection of mixed infections and minority resistance alleles at >5% frequency.' },
        { n:7, title:'Analysis', detail:'TBProfiler v6: drug resistance profiling, lineage, sublineage. KvarQ: artemisinin screen. MTBseq pipeline: resistance catalogue comparison. Report to FIND/WHO surveillance network.' },
      ],
      notes: 'BSL-3 required for live cultures. After heat-inactivation, can proceed in BSL-2. We use the WHO Catalogue of Resistance-Associated Variants (v2.0) for clinical reporting. Always confirm first-line resistance phenotypically.',
    },
    {
      id: 'p004',
      title: 'Gut Microbiome 16S rRNA Amplicon — Stool (V3-V4)',
      author: 'Fatuma K. — KEMRI, Kenya',
      avatar: '',
      institution: 'KEMRI Wellcome Trust Research Programme',
      country: 'Kenya',
      domain: 'Metagenomics',
      dataType: 'Amplicon',
      organism: 'Gut microbiome',
      tags: ['16S rRNA', 'V3-V4', 'Stool', 'Microbiome', 'KEMRI'],
      forks: 61,
      views: 445,
      rating: 4.6,
      createdAt: '2023-09-14',
      verified: false,
      steps: [
        { n:1, title:'Stool Collection', detail:'Collect into OMNIgene·GUT tube (DNA Genotek) within 15 min of defecation. Mix thoroughly. Store at RT up to 60 days or –80°C long-term. Avoid freeze-thaw cycles.' },
        { n:2, title:'DNA Extraction', detail:'QIAamp PowerFecal DNA Kit. Bead-beat at 5 m/s × 2 min (important for complete bacterial lysis). Elute 100 µL. Target: ≥ 10 ng/µL, OD 260/230 > 1.8.' },
        { n:3, title:'16S V3-V4 PCR', detail:'341F (CCTACGGGNGGCWGCAG) and 805R (GACTACHVGGGTATCTAATCC). 25 µL reaction: 12.5 µL KAPA HiFi, 1 µL each primer (10 µM), 5 µL DNA (~5 ng). 98°C 3 min, 25 cycles (98°C 20s, 55°C 15s, 72°C 15s), 72°C 1 min.' },
        { n:4, title:'Amplicon QC', detail:'2% agarose gel: expect band at 460 bp. Purify with AMPure XP 1×. Measure Qubit HS: target ≥ 2 ng/µL.' },
        { n:5, title:'Index PCR', detail:'Dual-index PCR with Nextera XT Index Kit (8 cycles). Add sample-specific i7 and i5 indices. Purify AMPure XP 1×. Measure Qubit HS.' },
        { n:6, title:'Library Pool + Sequencing', detail:'Normalise each sample to 4 nM. Pool all samples equally. Illumina MiSeq 2×250 bp, Nano v2 kit. Load 8 pM + 20% PhiX. Target: 10,000–50,000 reads/sample.' },
        { n:7, title:'Analysis', detail:'QIIME2: DADA2 denoising, ASV generation, SILVA 138 taxonomy, Faith\'s PD diversity, UniFrac distance, LEfSe differential abundance. Export OTU table for downstream R analysis (vegan, phyloseq).' },
      ],
      notes: 'V3-V4 amplicon (460 bp) works better than V4-only for discriminating African-specific microbiome taxa. Reduce PCR cycles to 20 if you have >20 ng/µL input (reduces chimeras). We include a mock community (ZymoBIOMICS) every 24 samples for QC.',
    },
    {
      id: 'p005',
      title: 'Bulk RNA-seq from PBMC — HIV Immune Profiling',
      author: 'Sipho D. — UCT, South Africa',
      avatar: '',
      institution: 'University of Cape Town',
      country: 'South Africa',
      domain: 'Transcriptomics',
      dataType: 'RNA-seq',
      organism: 'Homo sapiens',
      tags: ['RNA-seq', 'PBMC', 'HIV', 'Immune', 'UCT'],
      forks: 39,
      views: 267,
      rating: 4.5,
      createdAt: '2024-02-03',
      verified: true,
      steps: [
        { n:1, title:'PBMC Isolation', detail:'Ficoll-Paque density gradient from 8–10 mL EDTA blood within 2 hours of collection. Spin 400×g 30 min RT (no brake). Collect buffy coat, wash 2× with PBS. Count and viability check (trypan blue). Target: >90% viability.' },
        { n:2, title:'RNA Extraction', detail:'RNeasy Mini Kit (QIAGEN) from 1–5×10⁶ PBMCs. Lyse in RLT+β-ME. RNA QC: NanoDrop (260/280 ≥ 1.8) + Agilent Bioanalyzer RNA 6000 Nano chip. Target: RIN ≥ 8.' },
        { n:3, title:'rRNA Depletion', detail:'Ribo-Zero Plus (Illumina) for human blood. Use if samples may be degraded (RIN 6–8) — poly-A selection would lose degraded mRNAs. Input: 100–500 ng total RNA.' },
        { n:4, title:'Library Prep', detail:'Illumina Stranded Total RNA Prep (post-depletion). Fragmentation 94°C 8 min. RT + adapter ligation + PCR amplification 10 cycles. AMPure XP 0.9×.' },
        { n:5, title:'Library QC', detail:'Agilent D1000 tape: fragment size peak 300–400 bp. Qubit HS: ≥ 10 nM. Check strand specificity: expect >95% reads mapping to correct strand.' },
        { n:6, title:'Sequencing', detail:'Illumina NovaSeq 6000, SP flow cell 2×100 bp. 30 million read pairs per sample minimum. Pool 8 samples per lane.' },
        { n:7, title:'Analysis', detail:'fastp → STAR alignment (GRCh38+Ensembl107) → featureCounts (--stranded 2) → DESeq2 differential expression → clusterProfiler GO/KEGG enrichment → GSEA. Check PCA for HIV status clustering before DE analysis.' },
      ],
      notes: 'Critical: use Ribo-Zero Plus for HIV PBMC — poly-A selection misses lncRNA and viral RNA. The --stranded 2 parameter in featureCounts is correct for this Illumina Stranded kit. Include ≥3 biological replicates per HIV status group for reliable DE.',
    },
    {
      id: 'p006',
      title: 'Sanger Sequencing for Clinical Resistance Genotyping — Low Resource',
      author: 'Amina F. — INRSP, Senegal',
      avatar: '',
      institution: 'Institut National de Recherche en Santé Publique',
      country: 'Senegal',
      domain: 'Genomics',
      dataType: 'Sanger',
      organism: 'Plasmodium falciparum',
      tags: ['Sanger', 'Low-resource', 'Malaria', 'Drug resistance', 'Senegal'],
      forks: 18,
      views: 142,
      rating: 4.4,
      createdAt: '2024-04-10',
      verified: false,
      steps: [
        { n:1, title:'Blood Collection', detail:'EDTA capillary tube from finger prick. Transfer to 1.5 mL tube, 0°C storage. Can store dried blood spot (DBS) on Whatman 3MM paper for remote sites.' },
        { n:2, title:'DNA Extraction', detail:'QIAamp DNA Micro Kit (for DBS: punch 6mm disk into tube, rehydrate in 200 µL PBS 30 min). Target ≥ 20 ng/µL.' },
        { n:3, title:'PCR Amplification', detail:'For pfcrt (chloroquine resistance): pfcrt-F + pfcrt-R primers. 50 µL GoTaq reaction: 2 min 94°C, 35× (30s 94°C, 30s 55°C, 1 min 72°C), 5 min 72°C. Expected band 148 bp.' },
        { n:4, title:'Gel Electrophoresis', detail:'2% agarose TAE, ethidium bromide. Confirm single band correct size. Exclude ambiguous results. Purify with ExoSAP-IT (20 min 37°C, 15 min 80°C) — no gel extraction needed.' },
        { n:5, title:'Sanger Sequencing', detail:'BigDye Terminator v3.1 cycle sequencing. Send to local sequencing facility (if available) or GATC/Macrogen (courier DBS card). Key codon: pfcrt position 76 (K76T = chloroquine resistant).' },
        { n:6, title:'Sequence Analysis', detail:'Align in BioEdit or Geneious. Call SNP at codon 76. Output binary: sensitive (K) or resistant (T). Tabulate for sample cohort. Calculate prevalence of resistance.' },
      ],
      notes: 'This protocol is optimised for resource-limited settings — DBS cards mean no cold chain needed. Sanger is cost-effective for targeted single-gene resistance genotyping when NGS is not available. Consider upgrading to MiSeq amplicon sequencing if facility accessible.',
    },
    {
      id: 'p007',
      title: 'CRISPR/Cas9 Guide RNA Design for African Crop Improvement (Cassava)',
      author: 'Olumide A. — IITA, Nigeria',
      avatar: '',
      institution: 'International Institute of Tropical Agriculture',
      country: 'Nigeria',
      domain: 'Genomics',
      dataType: 'Other',
      organism: 'Manihot esculenta (Cassava)',
      tags: ['CRISPR', 'Cas9', 'Cassava', 'Crop improvement', 'IITA'],
      forks: 22,
      views: 195,
      rating: 4.3,
      createdAt: '2023-12-05',
      verified: false,
      steps: [
        { n:1, title:'Target Gene Selection', detail:'Use Phytozome v13 cassava genome (Manihot esculenta v8.1). Select gene via blast with rice/Arabidopsis ortholog. Confirm expression in NCBI SRA RNA-seq data.' },
        { n:2, title:'gRNA Design', detail:'CRISPRscan.org or CRISPOR: paste 200bp flanking exon. Select guide with: PAM = NGG, score > 50, no off-targets (0 mismatches within coding exons). Choose guide targeting early exon.' },
        { n:3, title:'Cas9/gRNA Assembly', detail:'In vitro transcription (MEGAscript T7) or order synthetic gRNA (IDT). Assemble RNP: mix Cas9 protein + sgRNA 1:1.5 molar ratio, 25°C 5 min.' },
        { n:4, title:'Protoplast Transformation', detail:'Cassava protoplasts from leaf tissue (type Isp42). PEG-mediated transfection: 20 µg RNP in 200 µL PEG solution. Room temperature 10 min. Wash with W5 solution × 3.' },
        { n:5, title:'Editing Verification', detail:'48–72h post-transformation. Extract DNA, PCR amplify target with HRM primers. T7EI (T7 Endonuclease I) assay or PCR + Sanger sequencing. Calculate editing efficiency (% indels from chromatogram).' },
        { n:6, title:'Plant Regeneration', detail:'Optimised MS media + BAP + NAA. Culture at 28°C, 16h light. Callus after 3–4 weeks. Shoots after 6–8 weeks. Genotype individual plants by PCR. Select biallelic knockouts.' },
      ],
      notes: 'Cassava is Africa\'s most important food security crop. This protocol targets CBSV (Cassava Brown Streak Disease) susceptibility genes. Efficiency is lower than model plants (~15–25%) — increase guide number or use base editing for better outcomes.',
    },
    {
      id: 'p008',
      title: 'Low-Cost Ebola/Lassa Rapid Diagnostics — Field-Deployable PCR',
      author: 'Dr. Olufemi O. — NCDC, Nigeria',
      avatar: '',
      institution: 'Nigeria Centre for Disease Control',
      country: 'Nigeria',
      domain: 'Virology',
      dataType: 'qPCR',
      organism: 'Ebola virus / Lassa virus',
      tags: ['Ebola', 'Lassa', 'qPCR', 'Field diagnostics', 'NCDC', 'Outbreak response'],
      forks: 56,
      views: 534,
      rating: 4.9,
      createdAt: '2024-05-20',
      verified: true,
      steps: [
        { n:1, title:'Sample Inactivation', detail:'BSL-4 pathogens require inactivation before testing. Use AVL lysis buffer (QIAGEN) 1:3 ratio or heat at 56°C 30 min. Work in appropriate PPE (double gloves, Tyvek, face shield). Never open unprotected.' },
        { n:2, title:'RNA Extraction', detail:'QIAamp Viral RNA Mini Kit or EasyMag (Biomerieux). Process in certified BSL-2/3 cabinet only after inactivation. Elute 60 µL.' },
        { n:3, title:'qRT-PCR Assay (Ebola EBOV)', detail:'WHO-approved Altona RealStar Filovirus Screen RT-PCR. FAM = EBOV, VIC = internal control. 45 cycles. Positive: Ct < 35. Interpret with extraction controls and NTC.' },
        { n:4, title:'qRT-PCR Assay (Lassa LASV)', detail:'Altona RealStar Arenavirus RT-PCR v2.0. Run in parallel tube. FAM = LASV, Cy5 = IC. Positive: Ct < 38. Confirm all positives with second target assay.' },
        { n:5, title:'Result Reporting', detail:'Report Ct value + interpretation. Ct < 28 = high viral load (high infectivity). Notify national health authority within 2 hours of positive result per IHR requirement. Submit to NCDC eIDSR system.' },
        { n:6, title:'Sequencing (outbreak cases)', detail:'For confirmed positives: freeze RNA at –80°C, ship on dry ice to reference lab (NCDC National Reference Lab Lagos) for sequencing. Use ARTIC-derived amplicon panels for Ebola and Lassa.' },
      ],
      notes: 'This protocol is for use in authorized government reference laboratories only. BSL-3 minimum required for Ebola samples. For truly resource-limited settings, consider GeneXpert Omni (cartridge-based) — no biosafety cabinet required for the PCR step after inactivation.',
    },
  ];

  /* ─── Load/save helpers ─── */
  function _loadCommunity() {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    /* First visit: seed community protocols */
    localStorage.setItem(STORE_KEY, JSON.stringify(SEED_PROTOCOLS));
    return SEED_PROTOCOLS;
  }

  function _loadMine() {
    try { return JSON.parse(localStorage.getItem(MINE_KEY) || '[]'); } catch { return []; }
  }

  function _saveMine(list) {
    try { localStorage.setItem(MINE_KEY, JSON.stringify(list)); } catch {}
  }

  /* ─── State ─── */
  let _filter = { domain: 'all', query: '' };
  let _view = 'browse'; /* 'browse' | 'detail' | 'editor' */
  let _selectedId = null;
  let _editingProtocol = null;

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('protocols-section');
    if (!section || section.dataset.prReady) return;
    section.dataset.prReady = '1';
    _render(section);
  }

  /* ─── Render shell ─── */
  function _render(section) {
    const community = _loadCommunity();
    const mine = _loadMine();
    const domains = ['all', ...new Set(community.map(p => p.domain))];

    section.innerHTML = `
      <div class="pr-wrap">
        <div class="pr-header">
          <div>
            <div class="pr-badge">COMMUNITY PROTOCOLS</div>
            <h2 class="pr-title">Share, Fork & Remix Lab Protocols</h2>
            <p class="pr-subtitle">Community-contributed protocols from African genomics labs. Fork any protocol to customise it, or contribute your own.</p>
          </div>
          <div class="pr-stats-row">
            <div class="pr-stat"><span class="pr-stat-n">${community.length}</span><span class="pr-stat-l">Protocols</span></div>
            <div class="pr-stat"><span class="pr-stat-n">${community.reduce((s,p) => s+p.forks, 0)}</span><span class="pr-stat-l">Forks</span></div>
            <div class="pr-stat"><span class="pr-stat-n">${mine.length}</span><span class="pr-stat-l">My Protocols</span></div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="pr-toolbar">
          <div class="pr-search-wrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="pr-search-icon" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input class="pr-search" type="search" id="pr-search"
                   placeholder="Search protocols, organisms, techniques…"
                   oninput="OmicsLab.Protocols._onSearch(this.value)"/>
          </div>
          <div class="pr-chips" id="pr-chips">
            ${domains.map(d => `
              <button class="pr-chip${d==='all'?' active':''}" data-val="${d}"
                      onclick="OmicsLab.Protocols._setFilter('${d}')">${d === 'all' ? 'All' : d}</button>`).join('')}
          </div>
          <button class="pr-new-btn" onclick="OmicsLab.Protocols._newProtocol()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Protocol
          </button>
        </div>

        <!-- Tabs -->
        <div class="pr-tabs">
          <button class="pr-tab active" id="pr-tab-community" onclick="OmicsLab.Protocols._switchTab('community')">
            Community (${community.length})
          </button>
          <button class="pr-tab" id="pr-tab-mine" onclick="OmicsLab.Protocols._switchTab('mine')">
            My Protocols (${mine.length})
          </button>
        </div>

        <!-- Content area -->
        <div id="pr-content"></div>
      </div>`;

    _renderBrowse('community');
  }

  /* ─── Render card grid ─── */
  function _renderBrowse(tab) {
    const content = document.getElementById('pr-content');
    if (!content) return;

    const list = tab === 'mine' ? _loadMine() : _loadCommunity();
    const q = _filter.query.toLowerCase();
    const filtered = list.filter(p => {
      if (_filter.domain !== 'all' && p.domain !== _filter.domain) return false;
      if (q && !p.title.toLowerCase().includes(q) &&
               !p.organism.toLowerCase().includes(q) &&
               !p.tags.some(t => t.toLowerCase().includes(q))) return false;
      return true;
    });

    if (!filtered.length) {
      content.innerHTML = `<div class="pr-empty">
        <div class="pr-empty-icon">${OmicsLab.Icons?.svg('microscope', 28) || ''}</div>
        <p class="pr-empty-msg">${tab === 'mine' ? 'No protocols yet — create your first!' : 'No protocols match your filters.'}</p>
        ${tab === 'mine' ? '<button class="pr-empty-cta" onclick="OmicsLab.Protocols._newProtocol()">Create Protocol</button>' : '<button class="pr-empty-cta" onclick="OmicsLab.Protocols._resetFilters()">Clear filters</button>'}
      </div>`;
      return;
    }

    content.innerHTML = `<div class="pr-grid">${filtered.map(p => `
      <div class="pr-card" onclick="OmicsLab.Protocols._viewProtocol('${p.id}','${tab}')">
        <div class="pr-card-top">
          <span class="pr-card-domain">${p.domain}</span>
          <span class="pr-card-type">${p.dataType}</span>
          ${p.verified ? `<span class="pr-verified" title="Verified protocol">${OmicsLab.Icons?.svg('check-circle',12)||''}</span>` : ''}
        </div>
        <div class="pr-card-title">${p.title}</div>
        <div class="pr-card-author"><span class="pr-author-av">${(p.author||'?').charAt(0).toUpperCase()}</span> ${p.author} · ${p.country}</div>
        <div class="pr-card-tags">${p.tags.slice(0,4).map(t => `<span class="pr-tag">${t}</span>`).join('')}</div>
        <div class="pr-card-footer">
          <span class="pr-card-meta">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
            ${p.views}
          </span>
          <span class="pr-card-meta">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
            ${p.forks} forks
          </span>
          <span class="pr-card-meta">${p.steps.length} steps</span>
          ${p.rating ? `<span class="pr-card-rating"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${p.rating}</span>` : ''}
        </div>
      </div>`).join('')}
    </div>`;
  }

  /* ─── View protocol detail ─── */
  function _viewProtocol(id, tab) {
    const list = tab === 'mine' ? _loadMine() : _loadCommunity();
    const p = list.find(x => x.id === id);
    if (!p) return;
    _selectedId = id;

    const content = document.getElementById('pr-content');
    if (!content) return;

    content.innerHTML = `
      <div class="pr-detail">
        <div class="pr-detail-nav">
          <button class="pr-back-btn" onclick="OmicsLab.Protocols._renderBrowse('${tab}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <div class="pr-detail-actions">
            <button class="pr-fork-btn" onclick="OmicsLab.Protocols._forkProtocol('${id}','${tab}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
              Fork
            </button>
            ${tab === 'mine' ? `
              <button class="pr-edit-btn" onclick="OmicsLab.Protocols._editProtocol('${id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>` : ''}
          </div>
        </div>

        <div class="pr-detail-header">
          ${p.verified ? `<span class="pr-verified-badge">${OmicsLab.Icons?.svg('check-circle',12)||''} Verified Protocol</span>` : ''}
          <h3 class="pr-detail-title">${p.title}</h3>
          <div class="pr-detail-meta">
            <span><span class="pr-author-av">${(p.author||'?').charAt(0).toUpperCase()}</span> <strong>${p.author}</strong></span>
            <span>·</span>
            <span>${p.institution}</span>
            <span>·</span>
            <span>${p.country}</span>
            <span>·</span>
            <span>${p.createdAt}</span>
          </div>
          <div class="pr-detail-badges">
            <span class="pr-badge-domain">${p.domain}</span>
            <span class="pr-badge-type">${p.dataType}</span>
            <span class="pr-badge-org">${p.organism}</span>
          </div>
          <div class="pr-detail-tags">${p.tags.map(t => `<span class="pr-tag">${t}</span>`).join('')}</div>
        </div>

        <div class="pr-steps-section">
          <div class="pr-steps-label">Protocol Steps (${p.steps.length})</div>
          <div class="pr-steps">
            ${p.steps.map(s => `
              <div class="pr-step">
                <div class="pr-step-num">${s.n}</div>
                <div class="pr-step-body">
                  <div class="pr-step-title">${s.title}</div>
                  <div class="pr-step-detail">${s.detail}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        ${p.notes ? `
        <div class="pr-notes-section">
          <div class="pr-steps-label">Notes & Tips</div>
          <div class="pr-notes-body">${p.notes}</div>
        </div>` : ''}

        <div class="pr-fork-cta">
          <button class="pr-fork-btn-large" onclick="OmicsLab.Protocols._forkProtocol('${id}','${tab}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
            Fork this protocol to customise it
          </button>
        </div>
      </div>`;
  }

  /* ─── Fork a protocol ─── */
  function _forkProtocol(id, fromTab) {
    const list = fromTab === 'mine' ? _loadMine() : _loadCommunity();
    const original = list.find(p => p.id === id);
    if (!original) return;

    const forked = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'my_' + Date.now(),
      title: 'Fork of: ' + original.title,
      author: 'You (forked from ' + original.author + ')',
      avatar: '',
      institution: 'My Lab',
      country: 'My Country',
      forks: 0,
      views: 0,
      rating: null,
      createdAt: new Date().toISOString().slice(0,10),
      verified: false,
      forkedFrom: id,
    };

    const mine = _loadMine();
    mine.push(forked);
    _saveMine(mine);

    /* Increment fork count in community list */
    if (fromTab === 'community') {
      const community = _loadCommunity();
      const src = community.find(p => p.id === id);
      if (src) {
        src.forks = (src.forks || 0) + 1;
        try { localStorage.setItem(STORE_KEY, JSON.stringify(community)); } catch {}
      }
    }

    _toast('Protocol forked! Find it in My Protocols.');
    _switchTab('mine');
  }

  /* ─── Protocol editor ─── */
  function _newProtocol() {
    _editingProtocol = {
      id: 'my_' + Date.now(),
      title: '',
      author: 'You',
      avatar: '',
      institution: '',
      country: '',
      domain: 'Genomics',
      dataType: 'WGS',
      organism: '',
      tags: [],
      forks: 0, views: 0, rating: null,
      createdAt: new Date().toISOString().slice(0,10),
      verified: false,
      steps: [{ n:1, title:'', detail:'' }],
      notes: '',
    };
    _renderEditor();
  }

  function _editProtocol(id) {
    const mine = _loadMine();
    _editingProtocol = JSON.parse(JSON.stringify(mine.find(p => p.id === id) || {}));
    _renderEditor();
  }

  function _renderEditor() {
    const p = _editingProtocol;
    if (!p) return;
    const content = document.getElementById('pr-content');
    if (!content) return;

    content.innerHTML = `
      <div class="pr-editor">
        <div class="pr-editor-nav">
          <button class="pr-back-btn" onclick="OmicsLab.Protocols._renderBrowse('mine')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Cancel
          </button>
          <button class="pr-save-btn" onclick="OmicsLab.Protocols._saveProtocol()">Save Protocol</button>
        </div>

        <div class="pr-editor-body">
          <div class="pr-field">
            <label class="pr-label">Protocol Title *</label>
            <input class="pr-input" id="pr-ed-title" value="${p.title.replace(/"/g,'&quot;')}" placeholder="e.g. Low-input DNA-seq from dried blood spots"/>
          </div>
          <div class="pr-field-row">
            <div class="pr-field">
              <label class="pr-label">Domain</label>
              <select class="pr-select" id="pr-ed-domain">
                ${['Genomics','Transcriptomics','Metagenomics','Epigenomics','Proteomics','Virology','Bacteriology','Other'].map(d =>
                  `<option${p.domain === d ? ' selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
            <div class="pr-field">
              <label class="pr-label">Data Type</label>
              <select class="pr-select" id="pr-ed-datatype">
                ${['WGS','RNA-seq','Amplicon','Metagenomics','scRNA-seq','ChIP-seq','Sanger','qPCR','Other'].map(d =>
                  `<option${p.dataType === d ? ' selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="pr-field-row">
            <div class="pr-field">
              <label class="pr-label">Organism / Sample Type *</label>
              <input class="pr-input" id="pr-ed-organism" value="${p.organism.replace(/"/g,'&quot;')}" placeholder="e.g. Homo sapiens, SARS-CoV-2"/>
            </div>
            <div class="pr-field">
              <label class="pr-label">Country</label>
              <input class="pr-input" id="pr-ed-country" value="${p.country.replace(/"/g,'&quot;')}" placeholder="e.g. Kenya"/>
            </div>
          </div>
          <div class="pr-field">
            <label class="pr-label">Tags (comma-separated)</label>
            <input class="pr-input" id="pr-ed-tags" value="${p.tags.join(', ')}" placeholder="e.g. WGS, blood, low-input"/>
          </div>

          <div class="pr-steps-editor" id="pr-steps-editor">
            <div class="pr-steps-label">
              Protocol Steps
              <button class="pr-add-step-btn" onclick="OmicsLab.Protocols._addStep()">+ Add Step</button>
            </div>
            <div id="pr-step-list">
              ${p.steps.map((s, i) => _stepEditorHtml(s, i)).join('')}
            </div>
          </div>

          <div class="pr-field">
            <label class="pr-label">Notes & Tips</label>
            <textarea class="pr-textarea" id="pr-ed-notes" rows="3" placeholder="Important notes, optimisations, troubleshooting tips…">${p.notes || ''}</textarea>
          </div>
        </div>
      </div>`;
  }

  function _stepEditorHtml(s, i) {
    return `<div class="pr-step-ed" id="pr-step-ed-${i}">
      <div class="pr-step-ed-num">${i+1}</div>
      <div class="pr-step-ed-fields">
        <input class="pr-input" placeholder="Step title" value="${(s.title||'').replace(/"/g,'&quot;')}" onchange="OmicsLab.Protocols._updateStep(${i},'title',this.value)"/>
        <textarea class="pr-textarea" rows="2" placeholder="Detailed instructions, volumes, temperatures…" onchange="OmicsLab.Protocols._updateStep(${i},'detail',this.value)">${s.detail||''}</textarea>
      </div>
      <button class="pr-step-del" onclick="OmicsLab.Protocols._removeStep(${i})" title="Remove step">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>`;
  }

  function _addStep() {
    if (!_editingProtocol) return;
    _editingProtocol.steps.push({ n: _editingProtocol.steps.length + 1, title: '', detail: '' });
    const list = document.getElementById('pr-step-list');
    if (list) {
      const i = _editingProtocol.steps.length - 1;
      list.insertAdjacentHTML('beforeend', _stepEditorHtml(_editingProtocol.steps[i], i));
    }
  }

  function _removeStep(i) {
    if (!_editingProtocol) return;
    _editingProtocol.steps.splice(i, 1);
    _editingProtocol.steps.forEach((s, j) => { s.n = j + 1; });
    const list = document.getElementById('pr-step-list');
    if (list) list.innerHTML = _editingProtocol.steps.map((s, j) => _stepEditorHtml(s, j)).join('');
  }

  function _updateStep(i, key, val) {
    if (_editingProtocol && _editingProtocol.steps[i]) _editingProtocol.steps[i][key] = val;
  }

  function _saveProtocol() {
    if (!_editingProtocol) return;
    const p = _editingProtocol;
    p.title = document.getElementById('pr-ed-title')?.value?.trim() || p.title;
    p.domain = document.getElementById('pr-ed-domain')?.value || p.domain;
    p.dataType = document.getElementById('pr-ed-datatype')?.value || p.dataType;
    p.organism = document.getElementById('pr-ed-organism')?.value?.trim() || p.organism;
    p.country = document.getElementById('pr-ed-country')?.value?.trim() || p.country;
    p.tags = (document.getElementById('pr-ed-tags')?.value || '').split(',').map(t => t.trim()).filter(Boolean);
    p.notes = document.getElementById('pr-ed-notes')?.value?.trim() || '';
    if (!p.title) { alert('Please add a protocol title.'); return; }

    const mine = _loadMine();
    const idx = mine.findIndex(x => x.id === p.id);
    if (idx >= 0) mine[idx] = p;
    else mine.push(p);
    _saveMine(mine);
    _editingProtocol = null;
    _toast('Protocol saved!');
    _switchTab('mine');
  }

  /* ─── Tab switch ─── */
  function _switchTab(tab) {
    ['community','mine'].forEach(t => {
      const btn = document.getElementById('pr-tab-' + t);
      if (btn) btn.classList.toggle('active', t === tab);
    });
    _renderBrowse(tab);
  }

  function _setFilter(domain) {
    _filter.domain = domain;
    document.querySelectorAll('.pr-chip').forEach(c => c.classList.toggle('active', c.dataset.val === domain));
    /* Re-render current tab */
    const activeTab = document.querySelector('.pr-tab.active')?.id?.replace('pr-tab-','') || 'community';
    _renderBrowse(activeTab);
  }

  function _onSearch(val) {
    _filter.query = val.trim();
    const activeTab = document.querySelector('.pr-tab.active')?.id?.replace('pr-tab-','') || 'community';
    _renderBrowse(activeTab);
  }

  function _resetFilters() {
    _filter = { domain: 'all', query: '' };
    document.querySelectorAll('.pr-chip').forEach(c => c.classList.toggle('active', c.dataset.val === 'all'));
    _renderBrowse('community');
  }

  function _toast(msg) {
    OmicsLab.Notify.success(msg);
  }

  return {
    init,
    _viewProtocol, _forkProtocol, _newProtocol, _editProtocol,
    _addStep, _removeStep, _updateStep, _saveProtocol,
    _switchTab, _setFilter, _onSearch, _resetFilters, _renderBrowse,
  };
})();
