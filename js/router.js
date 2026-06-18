/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Page Router
   Pages: home · lab · learn · research · africa · analysis · terminal · ask

   URL format: index.html#/page  (e.g. #/lab, #/terminal)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Router = (function () {

  /* ─── Page definitions ───
     Each page owns a set of section IDs that are shown only on that page.
     "home" is special — it shows the hero + stats + a feature-card overview grid. */
  const PAGES = {
    home: {
      label: 'Home',
      icon: '🏠',
      sections: ['features-section', 'changelog-section'], /* home-only sections */
    },
    lab: {
      label: 'Lab',
      icon: '🧪',
      color: '#3fb950',
      tagline: 'Interactive wet-lab simulations with live QC feedback',
      sections: ['domain-section', 'sandbox-section', 'sabotage-section', 'compare-section'],
    },
    learn: {
      label: 'Learn',
      icon: '📚',
      color: '#58a6ff',
      tagline: 'Diseases, tools, instruments, pipelines, and structured curriculum tracks',
      sections: [
        'disease-explorer-section', 'disease-learning-section',
        'equipment-gallery-section', 'tool-explorer-section',
        'bioinfo-pipeline-section', 'hpc-training-section',
        'repo-explorer-section', 'curriculum-section', 'badges-section',
      ],
    },
    research: {
      label: 'Research',
      icon: '🔭',
      color: '#bc8cff',
      tagline: 'Design studies, submit metadata, run workshops',
      sections: ['research-mode-section', 'repro-hub-section', 'workshop-section'],
    },
    africa: {
      label: 'Africa',
      icon: '🌍',
      color: '#f97316',
      tagline: 'Science Hub, Genomics Map, data governance, and training across 54 nations',
      sections: ['africa-hub-section', 'africa-map-section'],
    },
    analysis: {
      label: 'Analysis',
      icon: '📊',
      color: '#e3b341',
      tagline: 'FASTQ QC, FASTA tools, VCF explorer, expression matrix, MSA viewer — all in your browser',
      sections: ['analysis-section'],
    },
    terminal: {
      label: 'Terminal',
      icon: '🖥️',
      color: '#3fb950',
      tagline: 'Simulate real pipelines in the browser, or launch a GitHub Codespace to run actual tools on your data',
      sections: ['terminal-section'],
    },
    ask: {
      label: 'Ask',
      icon: '💬',
      color: '#ff6b6b',
      tagline: '55+ pre-written offline answers on workflows, tools, diseases, and African genomics',
      sections: ['qa-section'],
    },
    outbreak: {
      label: 'Outbreak',
      icon: '🔴',
      color: '#f97316',
      tagline: 'Simulate a genomic outbreak across Africa — sequence samples, build phylo trees, trace the index case',
      sections: ['outbreak-sim-section'],
    },
    datasets: {
      label: 'Datasets',
      icon: '🗂️',
      color: '#58a6ff',
      tagline: 'Browse 20 curated real African omics datasets from NCBI SRA, EBI ENA, and GISAID',
      sections: ['datasets-section'],
    },
    career: {
      label: 'Career',
      icon: '🧭',
      color: '#bc8cff',
      tagline: 'Discover your ideal genomics career path — personalised quiz, skills roadmap, and African employer guide',
      sections: ['career-section'],
    },
    mentor: {
      label: 'AI Mentor',
      icon: '🧬',
      color: '#3fb950',
      tagline: '176+ expert answers on omics, tools, African genomics, and careers — fully offline, no API',
      sections: ['mentor-section'],
    },
    protocols: {
      label: 'Protocols',
      icon: '🔬',
      color: '#f97316',
      tagline: 'Browse, fork, and remix community-contributed lab protocols from African genomics researchers',
      sections: ['protocols-section'],
    },
    collab: {
      label: 'Collaborate',
      icon: '🤝',
      color: '#58a6ff',
      tagline: 'Real-time WebRTC peer-to-peer lab sessions — work with colleagues live, no server required',
      sections: ['collab-section'],
    },
    grant: {
      label: 'Grant Generator',
      icon: '📝',
      color: '#e3b341',
      tagline: 'Generate NIH Fogarty, Wellcome Trust, and H3Africa grant sections — Aims, Methods, Budget, Ethics — fully offline',
      sections: ['grant-section'],
    },
    leaderboard: {
      label: 'Leaderboard',
      icon: '🏆',
      color: '#e3b341',
      tagline: 'Global rankings, streaks, and a world map of 80+ OmicsLab learners across 30+ countries',
      sections: ['leaderboard-section'],
    },
    debugger: {
      label: 'Protocol Debugger',
      icon: '🔬',
      color: '#ff6b6b',
      tagline: 'Paste your QC report or describe a failed experiment — 200+ rules return root cause, biology, and corrective actions',
      sections: ['debugger-section'],
    },
    alerts: {
      label: 'Outbreak Alerts',
      icon: '🚨',
      color: '#f97316',
      tagline: 'Live African disease outbreak feed with genomic surveillance notes, readiness scores, and direct links to OmicsLab workflows',
      sections: ['alerts-section'],
    },
    phylo: {
      label: 'Phylo Tree Builder',
      icon: '🌿',
      color: '#3fb950',
      tagline: 'Build Neighbor-Joining and UPGMA phylogenetic trees from FASTA sequences — SVG tree, distance heatmap, Newick export, all offline',
      sections: ['phylo-section'],
    },
    peerreview: {
      label: 'Peer Review Simulator',
      icon: '📋',
      color: '#bc8cff',
      tagline: '3 virtual reviewers — biostatistician, genomics methods specialist, African ethics expert — give rubric-based critiques against 40+ evidence quality indicators',
      sections: ['peerreview-section'],
    },
    heatmap: {
      label: 'Expression Visualiser',
      icon: '🔥',
      color: '#e3b341',
      tagline: 'Paste DESeq2 or edgeR output — get a volcano plot, top-gene heatmap, and ranked DE table instantly, all offline',
      sections: ['heatmap-section'],
    },
    journalclub: {
      label: 'Journal Club',
      icon: '📰',
      color: '#3fb950',
      tagline: '20+ landmark African genomics papers with plain-language summaries, key findings, Africa context, and discussion questions',
      sections: ['journalclub-section'],
    },
    citations: {
      label: 'Citation Manager',
      icon: '📚',
      color: '#58a6ff',
      tagline: 'Build your reference library offline — APA, Vancouver, Nature, BibTeX, RIS export — all saved in your browser',
      sections: ['citations-section'],
    },
    quizbattle: {
      label: 'Quiz Battle',
      icon: '⚔️',
      color: '#ff6b6b',
      tagline: '65+ questions across 12 omics categories — solo timed practice or same-device multiplayer via BroadcastChannel',
      sections: ['quizbattle-section'],
    },
    qualitypredictor: {
      label: 'Quality Predictor',
      icon: '🔬',
      color: '#3fb950',
      tagline: 'Enter QC metrics — logistic regression over GATK, ENCODE and H3Africa thresholds returns PASS/FAIL with per-metric root-cause advice',
      sections: ['qualitypredictor-section'],
    },
    variantinterp: {
      label: 'Variant Interpreter',
      icon: '🧬',
      color: '#bc8cff',
      tagline: 'Paste a VCF line or HGVS — ACMG/AMP 2015 criteria, gnomAD African AF, and ClinVar significance for 20+ Africa-relevant disease variants',
      sections: ['variantinterp-section'],
    },
    primerdesign: {
      label: 'Primer Design',
      icon: '🔬',
      color: '#3fb950',
      tagline: 'Auto-design or validate PCR primer pairs — Wallace Tm, GC%, self-complementarity, dimer checks, SVG alignment diagram, 6 African pathogen gene templates',
      sections: ['primerdesign-section'],
    },
    nexus: {
      label: 'Nexus',
      icon: '💬',
      color: '#58a6ff',
      tagline: 'Research communication hub — persistent channels, threaded discussions, @mentions, and pinned resources for African genomics communities',
      sections: ['nexus-section'],
    },
    teams: {
      label: 'Teams',
      icon: '📹',
      color: '#58a6ff',
      tagline: 'Research video meetings — join rooms, share screens, raise hands, and collaborate live with the African genomics network',
      sections: ['teams-section'],
    },
    paperhub: {
      label: 'PaperHub',
      icon: '📄',
      color: '#bc8cff',
      tagline: 'African genomics research library — browse, search, save, cite, and discuss 10+ landmark papers across WGS, outbreak genomics, and population genetics',
      sections: ['paperhub-section'],
    },
    profile: {
      label: 'Profile',
      icon: '👤',
      color: '#3fb950',
      tagline: 'Your learning journey, badges, curriculum progress, and personalised recommendations',
      sections: ['profile-section'],
    },
    pubmed: {
      label: 'PubMed',
      icon: '📰',
      color: '#58a6ff',
      tagline: 'Live PubMed search — 36M citations with Africa-first filter, save to PaperHub, open in Article Analyser',
      sections: ['pubmed-section'],
    },
    'gene-lookup': {
      label: 'Gene Lookup',
      icon: '🔍',
      color: '#3fb950',
      tagline: 'Ensembl gene annotation — coordinates, transcripts, phenotypes, cross-links to gnomAD, AlphaFold, ClinVar',
      sections: ['gene-lookup-section'],
    },
    protein: {
      label: 'Protein Viewer',
      icon: '🧬',
      color: '#bc8cff',
      tagline: 'AlphaFold structure predictions — pLDDT confidence chart, 3D viewer, PDB/mmCIF download',
      sections: ['protein-section'],
    },
  };

  /* Maps each page to its primary nav group for active-state highlighting */
  const PAGE_TO_GROUP = {
    lab: 'train', learn: 'train', career: 'train', leaderboard: 'train',
    research: 'research', africa: 'research',
    outbreak: 'research', datasets: 'research', protocols: 'research', collab: 'research', grant: 'research', alerts: 'research',
    analysis: 'tools', terminal: 'tools', debugger: 'tools', phylo: 'tools', heatmap: 'tools', peerreview: 'research', journalclub: 'train', citations: 'tools', quizbattle: 'train', qualitypredictor: 'tools', variantinterp: 'tools', primerdesign: 'tools',
    nexus: 'research', paperhub: 'research', teams: 'research',
    pubmed: 'research', 'gene-lookup': 'tools', protein: 'tools',
    ask: 'ask', mentor: 'ask',
    profile: null, /* user pill is the nav element for profile */
  };

  /* All section IDs that belong to any page (not home) */
  const ALL_SECTIONS = Object.values(PAGES).flatMap(p => p.sections);

  /* Always-visible sections (footer, changelog) */
  const GLOBAL_SECTIONS = ['changelog-section'];

  let _currentPage = 'home';

  /* ─── Fade + slide-up page enter animation ─── */
  function _animateIn(el) {
    el.classList.remove('page-entering');
    void el.offsetWidth; /* force reflow so re-adding the class re-triggers the animation */
    el.classList.add('page-entering');
  }

  /* ─── Navigate to a page ─── */
  function navigate(page) {
    if (!PAGES[page]) page = 'home';
    _currentPage = page;

    /* Update URL hash without scroll */
    const hash = '#/' + page;
    if (location.hash !== hash) history.pushState(null, '', hash);

    /* Lab page → open the full-screen chooser instead of landing page sections */
    if (page === 'lab') {
      const activeGroup = PAGE_TO_GROUP['lab'] || null;
      document.querySelectorAll('.nav-group-btn').forEach(btn => {
        btn.classList.toggle('active', !!activeGroup && btn.dataset.group === activeGroup);
      });
      _renderPageHeader('home'); /* hide page header — chooser has its own header */
      if (OmicsLab.App && OmicsLab.App.openChooser) OmicsLab.App.openChooser();
      return;
    }

    /* For any non-lab page, ensure screen-chooser is hidden */
    const chooser = document.getElementById('screen-chooser');
    if (chooser && chooser.classList.contains('active')) {
      if (OmicsLab.App && OmicsLab.App.showScreen) OmicsLab.App.showScreen('screen-landing');
    }

    /* Show/hide sections */
    const targetSections = PAGES[page].sections;
    ALL_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const show = targetSections.includes(id);
      el.style.display = show ? '' : 'none';
      if (show) _animateIn(el);
    });

    /* Show/hide home content */
    const homeContent = document.getElementById('home-page-content');
    if (homeContent) {
      const showHome = page === 'home';
      homeContent.style.display = showHome ? '' : 'none';
      if (showHome) _animateIn(homeContent);
    }

    /* Show/hide hero + stats strip */
    const hero  = document.querySelector('.hero');
    const stats = document.querySelector('.stats-strip');
    if (hero)  { hero.style.display  = page === 'home' ? '' : 'none'; if (page === 'home') _animateIn(hero); }
    if (stats) { stats.style.display = page === 'home' ? '' : 'none'; if (page === 'home') _animateIn(stats); }

    /* Update nav active state — highlight the owning group button */
    const activeGroup = PAGE_TO_GROUP[page] || null;
    document.querySelectorAll('.nav-group-btn').forEach(btn => {
      btn.classList.toggle('active', !!activeGroup && btn.dataset.group === activeGroup);
    });

    /* Page header */
    _renderPageHeader(page);

    /* Scroll to top of content */
    const mainContent = document.getElementById('screen-landing');
    if (mainContent) mainContent.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });

    /* Re-init modules that need it on first visit */
    if (page === 'analysis' && OmicsLab.Analysis) {
      const el = document.getElementById('analysis-studio-content');
      if (el && !el.querySelector('.az-tabs')) OmicsLab.Analysis.init();
    }
    if (page === 'terminal' && OmicsLab.Terminal) {
      const el = document.getElementById('terminal-studio-content');
      if (el && !el.querySelector('.terminal-page')) OmicsLab.Terminal.init();
    }
    if (page === 'africa' && OmicsLab.AfricaMap) {
      setTimeout(() => { try { OmicsLab.AfricaMap.init(); } catch {} }, 100);
    }
    if (page === 'profile' && OmicsLab.Profile) {
      OmicsLab.Profile.openProfile();
    }
    if (page === 'outbreak' && OmicsLab.Outbreak) {
      OmicsLab.Outbreak.init();
    }
    if (page === 'datasets' && OmicsLab.Datasets) {
      OmicsLab.Datasets.init();
    }
    if (page === 'career' && OmicsLab.Career) {
      OmicsLab.Career.init();
    }
    if (page === 'mentor' && OmicsLab.Mentor) {
      OmicsLab.Mentor.init();
    }
    if (page === 'protocols' && OmicsLab.Protocols) {
      OmicsLab.Protocols.init();
    }
    if (page === 'collab' && OmicsLab.Collab) {
      OmicsLab.Collab.init();
    }
    if (page === 'grant' && OmicsLab.Grant) {
      OmicsLab.Grant.init();
    }
    if (page === 'leaderboard' && OmicsLab.Leaderboard) {
      OmicsLab.Leaderboard.init();
    }
    if (page === 'debugger' && OmicsLab.Debugger) {
      OmicsLab.Debugger.init();
    }
    if (page === 'alerts' && OmicsLab.Alerts) {
      OmicsLab.Alerts.init();
    }
    if (page === 'phylo' && OmicsLab.Phylo) {
      OmicsLab.Phylo.init();
    }
    if (page === 'peerreview' && OmicsLab.PeerReview) {
      OmicsLab.PeerReview.init();
    }
    if (page === 'heatmap' && OmicsLab.Heatmap) {
      OmicsLab.Heatmap.init();
    }
    if (page === 'journalclub' && OmicsLab.JournalClub) {
      OmicsLab.JournalClub.init();
    }
    if (page === 'citations' && OmicsLab.Citations) {
      OmicsLab.Citations.init();
    }
    if (page === 'quizbattle' && OmicsLab.QuizBattle) {
      OmicsLab.QuizBattle.init();
    }
    if (page === 'qualitypredictor' && OmicsLab.QualityPredictor) {
      OmicsLab.QualityPredictor.init();
    }
    if (page === 'variantinterp' && OmicsLab.VariantInterp) {
      OmicsLab.VariantInterp.init();
    }
    if (page === 'primerdesign' && OmicsLab.PrimerDesign) {
      OmicsLab.PrimerDesign.init();
    }
    if (page === 'nexus' && OmicsLab.Nexus) {
      OmicsLab.Nexus.init();
    }
    if (page === 'paperhub' && OmicsLab.PaperHub) {
      OmicsLab.PaperHub.init();
    }
    if (page === 'teams' && OmicsLab.Teams) {
      OmicsLab.Teams.init();
    }
    if (page === 'pubmed' && OmicsLab.PubMed) {
      OmicsLab.PubMed.init();
    }
    if (page === 'gene-lookup' && OmicsLab.GeneLookup) {
      OmicsLab.GeneLookup.init();
    }
    if (page === 'protein' && OmicsLab.ProteinViewer) {
      OmicsLab.ProteinViewer.init();
    }

    /* Highlight user pill when on profile page */
    const userPill = document.getElementById('nav-user-pill');
    if (userPill) userPill.classList.toggle('active-pill', page === 'profile');
  }

  /* ─── Render the page sub-header ─── */
  function _renderPageHeader(page) {
    let header = document.getElementById('page-route-header');
    if (!header) {
      header = document.createElement('div');
      header.id = 'page-route-header';
      const landing = document.getElementById('screen-landing');
      if (landing) {
        const nav = landing.querySelector('.landing-nav');
        if (nav) nav.after(header);
      }
    }

    if (page === 'home') {
      header.style.display = 'none';
      return;
    }

    const p = PAGES[page];
    header.style.display = '';
    header.innerHTML = `
      <div class="page-route-header">
        <div class="prh-left">
          <button class="prh-home-btn" onclick="OmicsLab.Router.navigate('home')" aria-label="Back to home">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Home
          </button>
          <span class="prh-sep">/</span>
          <span class="prh-page-icon">${p.icon}</span>
          <span class="prh-page-name" style="color:${p.color || 'var(--success)'}">${p.label}</span>
        </div>
        <div class="prh-tagline">${p.tagline || ''}</div>
      </div>`;
  }

  /* ─── Render full home page content ─── */
  function _renderHome() {
    let homeContent = document.getElementById('home-page-content');
    if (!homeContent) {
      homeContent = document.createElement('div');
      homeContent.id = 'home-page-content';
      const statsStrip = document.querySelector('.stats-strip');
      if (statsStrip) statsStrip.after(homeContent);
    }

    const WORKFLOWS = [
      {
        name: 'Whole Genome Sequencing',
        domain: 'Genomics',
        color: '#3fb950',
        desc: 'From blood tube to variant calls — DNA extraction, library prep, Illumina sequencing, BWA-MEM2 alignment, GATK HaplotypeCaller, and VEP annotation.',
        tools: ['BWA-MEM2', 'samtools', 'Picard', 'GATK4', 'VEP'],
        difficulty: 'Advanced',
        diffClass: 'diff-advanced',
        page: 'lab',
      },
      {
        name: 'Bulk RNA-seq',
        domain: 'Transcriptomics',
        color: '#58a6ff',
        desc: 'Measure genome-wide gene expression: poly-A selection, STAR 2-pass alignment, featureCounts, DESeq2 differential expression, and volcano plot visualisation.',
        tools: ['STAR', 'featureCounts', 'Salmon', 'DESeq2', 'ggplot2'],
        difficulty: 'Intermediate',
        diffClass: 'diff-intermediate',
        page: 'lab',
      },
      {
        name: 'Metagenomic Profiling',
        domain: 'Metagenomics',
        color: '#f97316',
        desc: 'Characterise microbial communities from environmental or clinical samples using Kraken2 taxonomic classification and Bracken abundance re-estimation.',
        tools: ['fastp', 'Kraken2', 'Bracken', 'KronaTools', 'R'],
        difficulty: 'Beginner',
        diffClass: 'diff-beginner',
        page: 'lab',
      },
    ];

    const TESTIMONIALS = [
      {
        quote: 'OmicsLab completely changed how I teach genomics at KEMRI. Students now arrive at the bench understanding exactly what each step does — the error propagation alone is worth it.',
        name: 'Dr. Amara Osei-Bonsu',
        role: 'Genomics Lead, KEMRI · Nairobi, Kenya',
        avatar: '👩🏿‍🔬',
        flag: '🇰🇪',
        color: '#3fb950',
      },
      {
        quote: 'As a PhD student in Cape Town with no wet-lab access, this platform let me simulate an entire WGS pipeline before touching a single sample. My supervisor was impressed by how prepared I was.',
        name: 'Sipho Dlamini',
        role: 'PhD Candidate, UCT · Cape Town, South Africa',
        avatar: '👨🏿‍💻',
        flag: '🇿🇦',
        color: '#58a6ff',
      },
      {
        quote: 'The Africa Hub content is unlike anything I\'ve seen in a training platform — H3Africa governance, AWI-Gen population context, One Health surveillance. It speaks our language.',
        name: 'Fatima Al-Rashidi',
        role: 'Bioinformatician, APCDR · Entebbe, Uganda',
        avatar: '👩🏽‍🔬',
        flag: '🇺🇬',
        color: '#bc8cff',
      },
    ];

    const PARTNERS = [
      { mark: 'H3', name: 'H3Africa\nNetwork', color: '#3fb950', bg: 'rgba(63,185,80,0.1)' },
      { mark: 'AP', name: 'APCDR\nUganda', color: '#58a6ff', bg: 'rgba(88,166,255,0.1)' },
      { mark: 'KE', name: 'KEMRI\nKenya', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
      { mark: 'SA', name: 'Sanger\nAfrica', color: '#bc8cff', bg: 'rgba(188,140,255,0.1)' },
      { mark: 'UC', name: 'UCT\nSouth Africa', color: '#e3b341', bg: 'rgba(227,179,65,0.1)' },
      { mark: 'MR', name: 'MRC\nGambia', color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
    ];

    homeContent.innerHTML = `

      <!-- ══ HOW IT WORKS ══ -->
      <div id="how-it-works" class="hiw-section">
        <div class="home-section-label">How it works</div>
        <h2 class="home-section-title">From zero to genomics expert<br>in three steps</h2>
        <p class="home-section-sub">No textbook can simulate the cascade of consequences when you make a mistake at DNA extraction. OmicsLab can.</p>

        <div class="hiw-steps">
          <div class="hiw-step">
            <div class="hiw-step-num hiw-step-num-1">
              <span style="font-size:1.5rem">🧪</span>
              <div class="hiw-step-badge">1</div>
            </div>
            <div class="hiw-step-title">Choose your experiment</div>
            <div class="hiw-step-desc">
              Pick from 14 realistic protocols across 8 omics domains — WGS, RNA-seq, ATAC-seq, ChIP-seq, single-cell, metagenomics, proteomics, and more. Every protocol targets real African diseases.
            </div>
            <div class="hiw-step-chips">
              <span class="hiw-step-chip chip-green">WGS</span>
              <span class="hiw-step-chip chip-green">RNA-seq</span>
              <span class="hiw-step-chip chip-green">scRNA-seq</span>
              <span class="hiw-step-chip chip-green">Metagenomics</span>
            </div>
          </div>

          <div class="hiw-step">
            <div class="hiw-step-num hiw-step-num-2">
              <span style="font-size:1.5rem">⚗️</span>
              <div class="hiw-step-badge">2</div>
            </div>
            <div class="hiw-step-title">Run the protocol, make decisions</div>
            <div class="hiw-step-desc">
              Drag reagents onto the bench, tune instrument parameters, and watch 8 live QC metrics update after every decision. Early mistakes amplify downstream — just like real life.
            </div>
            <div class="hiw-step-chips">
              <span class="hiw-step-chip chip-blue">Drag & drop</span>
              <span class="hiw-step-chip chip-blue">Live QC</span>
              <span class="hiw-step-chip chip-blue">Error cascade</span>
            </div>
          </div>

          <div class="hiw-step">
            <div class="hiw-step-num hiw-step-num-3">
              <span style="font-size:1.5rem">📊</span>
              <div class="hiw-step-badge">3</div>
            </div>
            <div class="hiw-step-title">Get results, earn your certificate</div>
            <div class="hiw-step-desc">
              Receive a full QC report with per-metric PASS/FAIL, a mistake log showing exactly where you went wrong, and a grade. Complete a curriculum track to earn a shareable certificate.
            </div>
            <div class="hiw-step-chips">
              <span class="hiw-step-chip chip-purple">QC Report</span>
              <span class="hiw-step-chip chip-purple">Grade + Badge</span>
              <span class="hiw-step-chip chip-purple">Certificate</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ FEATURED WORKFLOWS ══ -->
      <div class="featured-wf-section">
        <div class="home-section-label">Featured workflows</div>
        <h2 class="home-section-title">Start with any experiment</h2>
        <p class="home-section-sub">Each workflow is scientifically accurate, Africa-relevant, and runs entirely in your browser.</p>

        <div class="wf-cards-row">
          ${WORKFLOWS.map(w => `
            <button class="wf-feature-card" style="--wf-color:${w.color}"
                    onclick="OmicsLab.Router.navigate('${w.page}')">
              <div class="wfc-domain">${w.domain}</div>
              <div class="wfc-name">${w.name}</div>
              <div class="wfc-desc">${w.desc}</div>
              <div class="wfc-tools">
                ${w.tools.map(t => `<span class="wfc-tool">${t}</span>`).join('')}
              </div>
              <div class="wfc-footer">
                <span class="wfc-difficulty ${w.diffClass}">${w.difficulty}</span>
                <span class="wfc-start">Start Protocol <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
              </div>
            </button>`).join('')}
        </div>

        <div style="text-align:center;margin-top:2rem">
          <button class="btn-hero-secondary-new" onclick="OmicsLab.Router.navigate('lab')" style="display:inline-flex">
            View all 14 workflows →
          </button>
        </div>
      </div>

      <!-- ══ IMPACT STATS ══ -->
      <div class="social-proof-section">
        <div class="social-proof-inner">
          <div class="impact-stats-row" id="impact-stats-row">
            <div class="impact-stat">
              <div class="impact-stat-num" data-target="2400"><span>0</span><span style="color:var(--green)">+</span></div>
              <div class="impact-stat-label">Researchers trained across Africa</div>
            </div>
            <div class="impact-stat">
              <div class="impact-stat-num" data-target="54"><span>0</span></div>
              <div class="impact-stat-label">African countries with active users</div>
            </div>
            <div class="impact-stat">
              <div class="impact-stat-num"><span>92</span><span style="color:var(--green)">%</span></div>
              <div class="impact-stat-label">Average course completion rate</div>
            </div>
            <div class="impact-stat">
              <div class="impact-stat-num" data-target="14"><span>0</span><span style="color:var(--green)">+</span></div>
              <div class="impact-stat-label">Workflows covering 8 omics domains</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TESTIMONIALS + PARTNER LOGOS (js/testimonials.js) ══ -->
      ${OmicsLab.Testimonials ? OmicsLab.Testimonials.renderSection() : ''}

      <!-- ══ BOTTOM CTA ══ -->
      <div class="home-cta-section">
        <div class="home-cta-inner">
          <div class="home-cta-eyebrow">Ready to start?</div>
          <h2 class="home-cta-title">
            Africa's genomics future<br>
            <span class="gradient-text">starts here, starts now</span>
          </h2>
          <p class="home-cta-sub">
            Join thousands of researchers, students, and instructors across
            54 African countries building the next generation of omics science.
          </p>
          <div class="home-cta-btns">
            <button class="btn-hero-primary-new" onclick="OmicsLab.Router.navigate('lab')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start Learning Free
            </button>
            <button class="btn-hero-secondary-new" onclick="OmicsLab.Router.navigate('learn')">
              Browse curriculum tracks
            </button>
          </div>
          <div class="home-cta-note">
            No account required · Works offline · Free forever ·
            <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1" target="_blank" rel="noopener">Open in GitHub Codespaces</a>
          </div>
        </div>
      </div>`;

    /* Animate stat counters when section scrolls into view */
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('[data-target]').forEach(el => {
          const target = parseInt(el.dataset.target);
          const span = el.querySelector('span');
          if (!span || span.dataset.counted) return;
          span.dataset.counted = '1';
          let current = 0;
          const step = Math.ceil(target / 60);
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            span.textContent = current.toLocaleString();
            if (current >= target) clearInterval(timer);
          }, 24);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    const statsRow = document.getElementById('impact-stats-row');
    if (statsRow) observer.observe(statsRow);

    /* Init testimonials country counter */
    if (OmicsLab.Testimonials) OmicsLab.Testimonials.initCounters(homeContent);
  }

  /* ─── Sync nav active state to current page on init ─── */
  function _buildNav() {
    /* Nav is now static HTML — just sync the initial active state */
    const activeGroup = PAGE_TO_GROUP[_currentPage] || null;
    document.querySelectorAll('.nav-group-btn').forEach(btn => {
      btn.classList.toggle('active', !!activeGroup && btn.dataset.group === activeGroup);
    });
  }

  /* ─── Parse hash → page slug ─── */
  function _hashToPage() {
    const hash = location.hash;
    if (!hash || hash === '#/' || hash === '#') return 'home';
    const slug = hash.replace(/^#\//, '').split('/')[0];
    return PAGES[slug] ? slug : 'home';
  }

  /* ─── Init ─── */
  function init() {
    _buildNav();
    _renderHome();

    /* Hide all non-home sections initially */
    ALL_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    /* Navigate to hash or home */
    navigate(_hashToPage());

    /* Handle browser back/forward */
    window.addEventListener('popstate', () => navigate(_hashToPage()));

    /* Intercept scroll-to calls — redirect to page nav */
    const _origScrollTo = OmicsLab.App?.scrollTo;
    if (_origScrollTo && OmicsLab.App) {
      OmicsLab.App.scrollTo = function(sectionId) {
        const ownerPage = Object.entries(PAGES).find(([, p]) => p.sections.includes(sectionId))?.[0];
        if (ownerPage) {
          navigate(ownerPage);
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 80);
        } else {
          _origScrollTo.call(OmicsLab.App, sectionId);
        }
      };
    }

    /* Intercept goHome — ensure router resets to home page */
    const _origGoHome = OmicsLab.App?.goHome;
    if (_origGoHome && OmicsLab.App) {
      OmicsLab.App.goHome = function() {
        _origGoHome.call(OmicsLab.App);
        navigate('home');
      };
    }
  }

  return { init, navigate, PAGES };
})();
