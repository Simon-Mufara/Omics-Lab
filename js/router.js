/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Page Router
   Converts the single-page scroll site into a proper multi-page app.
   Pages: home · lab · learn · research · africa · analysis · ask

   URL format: index.html#/page  (e.g. #/lab, #/learn)
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
    ask: {
      label: 'Ask',
      icon: '💬',
      color: '#ff6b6b',
      tagline: '55+ pre-written offline answers on workflows, tools, diseases, and African genomics',
      sections: ['qa-section'],
    },
  };

  /* All section IDs that belong to any page (not home) */
  const ALL_SECTIONS = Object.values(PAGES).flatMap(p => p.sections);

  /* Always-visible sections (footer, changelog) */
  const GLOBAL_SECTIONS = ['changelog-section'];

  let _currentPage = 'home';

  /* ─── Navigate to a page ─── */
  function navigate(page) {
    if (!PAGES[page]) page = 'home';
    _currentPage = page;

    /* Update URL hash without scroll */
    const hash = '#/' + page;
    if (location.hash !== hash) history.pushState(null, '', hash);

    /* Show/hide sections */
    const targetSections = PAGES[page].sections;
    ALL_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const show = targetSections.includes(id);
      el.style.display = show ? '' : 'none';
    });

    /* Show/hide home content */
    const homeContent = document.getElementById('home-page-content');
    if (homeContent) homeContent.style.display = page === 'home' ? '' : 'none';

    /* Show/hide hero + stats strip */
    const hero      = document.querySelector('.hero');
    const stats     = document.querySelector('.stats-strip');
    if (hero)  hero.style.display  = page === 'home' ? '' : 'none';
    if (stats) stats.style.display = page === 'home' ? '' : 'none';

    /* Update nav active state */
    document.querySelectorAll('.page-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
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
    if (page === 'africa' && OmicsLab.AfricaMap) {
      setTimeout(() => { try { OmicsLab.AfricaMap.init(); } catch {} }, 100);
    }
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

  /* ─── Render home page overview grid ─── */
  function _renderHome() {
    let homeContent = document.getElementById('home-page-content');
    if (!homeContent) {
      homeContent = document.createElement('div');
      homeContent.id = 'home-page-content';
      /* Insert after stats-strip */
      const statsStrip = document.querySelector('.stats-strip');
      if (statsStrip) statsStrip.after(homeContent);
      else {
        const landing = document.getElementById('screen-landing');
        if (landing) landing.prepend(homeContent);
      }
    }

    const cards = [
      {
        page: 'lab',
        icon: '🧪',
        color: '#3fb950',
        title: 'Lab Simulations',
        desc: '14 interactive wet-lab workflows across 8 omics domains. Drag reagents, tune parameters, watch QC cascade in real time.',
        chips: ['WGS', 'RNA-seq', 'ATAC-seq', 'ChIP-seq', 'Metagenomics', '+ 9 more'],
        cta: 'Open Lab →',
      },
      {
        page: 'learn',
        icon: '📚',
        color: '#58a6ff',
        title: 'Learn',
        desc: '40+ disease profiles, 50+ bioinformatics tools, 20+ real instruments, structured curriculum tracks and certificates.',
        chips: ['Disease Explorer', 'Tool Explorer', 'HPC Training', 'Certificates'],
        cta: 'Start Learning →',
      },
      {
        page: 'research',
        icon: '🔭',
        color: '#bc8cff',
        title: 'Research',
        desc: 'Design reproducible studies, submit metadata for FAIR scoring, run workshops with instructor mode and cohort tracking.',
        chips: ['Research Mode', 'Repro Hub', 'Workshop', 'FAIR Scoring'],
        cta: 'Design a Study →',
      },
      {
        page: 'africa',
        icon: '🌍',
        color: '#f97316',
        title: 'Africa Hub',
        desc: 'H3Africa data governance, population genomics, One Health, grant alignment, and an interactive map of 20+ active labs.',
        chips: ['H3Africa', 'AWI-Gen', 'APCDR', 'Africa Map'],
        cta: 'Explore Africa →',
      },
      {
        page: 'analysis',
        icon: '📊',
        color: '#e3b341',
        title: 'Analysis Studio',
        desc: 'Upload your own data and get real results. FASTQ QC, FASTA tools, VCF explorer, expression matrices, MSA viewer.',
        chips: ['FASTQ QC', 'FASTA Tools', 'VCF Explorer', 'Expression Matrix'],
        cta: 'Analyse Data →',
        badge: 'NEW',
      },
      {
        page: 'ask',
        icon: '💬',
        color: '#ff6b6b',
        title: 'Ask OmicsLab',
        desc: '55+ pre-written answers on workflows, tools, QC metrics, diseases, and African genomics. Works fully offline.',
        chips: ['Offline', 'No API', 'Instant answers'],
        cta: 'Ask a Question →',
      },
    ];

    homeContent.innerHTML = `
      <div class="home-page-grid-wrap">
        <div class="home-page-section-label">Where would you like to go?</div>
        <div class="home-page-grid">
          ${cards.map(c => `
            <button class="home-page-card" onclick="OmicsLab.Router.navigate('${c.page}')" style="--card-color:${c.color}">
              <div class="hpc-top">
                <span class="hpc-icon">${c.icon}</span>
                ${c.badge ? `<span class="hpc-badge">${c.badge}</span>` : ''}
              </div>
              <div class="hpc-title">${c.title}</div>
              <div class="hpc-desc">${c.desc}</div>
              <div class="hpc-chips">
                ${c.chips.map(ch => `<span class="hpc-chip">${ch}</span>`).join('')}
              </div>
              <div class="hpc-cta">${c.cta}</div>
            </button>`).join('')}
        </div>

        <!-- Quick stats row -->
        <div class="home-trust-row">
          <span class="trust-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Zero install</span>
          <span class="trust-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Works offline</span>
          <span class="trust-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Free forever</span>
          <span class="trust-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> 5 languages</span>
          <span class="trust-chip trust-africa"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Designed for Africa</span>
        </div>
      </div>`;
  }

  /* ─── Rebuild the nav to show page-level buttons ─── */
  function _buildNav() {
    const nav = document.getElementById('nav-pills-desktop');
    if (!nav) return;

    /* Remove all existing nav pills (keep learn dropdown and utility buttons) */
    nav.querySelectorAll('.nav-pill, .nav-learn-wrap').forEach(el => el.remove());

    /* Insert page nav buttons at the start */
    const pageButtons = Object.entries(PAGES).map(([page, p]) => `
      <button class="nav-pill page-nav-btn${page === 'home' ? ' active' : ''}"
              data-page="${page}"
              onclick="OmicsLab.Router.navigate('${page}')"
              aria-label="Go to ${p.label} page">
        ${p.icon} ${p.label}
      </button>`).join('');

    nav.insertAdjacentHTML('afterbegin', pageButtons);
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
