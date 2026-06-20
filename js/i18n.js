/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Internationalisation (i18n) v2
   19 languages: English inline · 18 locales lazy-loaded from js/locales/
   RTL support for Arabic.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.I18n = (function () {

  const STORE_KEY = 'omicslab_lang_v2';
  let _current = 'en';

  /* ─── Language registry ────────────────────────────────────────
     group: 'za' = South African | 'pan' = Pan-African | 'int' = International
     dir: text direction (only ar is rtl)
  ──────────────────────────────────────────────────────────────── */
  const LANGS = [
    /* South African official languages (Section 6, Constitution of South Africa) */
    { code:'zu',  label:'isiZulu',        flag:'🇿🇦', dir:'ltr', group:'za'  },
    { code:'xh',  label:'isiXhosa',       flag:'🇿🇦', dir:'ltr', group:'za'  },
    { code:'af',  label:'Afrikaans',      flag:'🇿🇦', dir:'ltr', group:'za'  },
    { code:'nso', label:'Sepedi',         flag:'🇿🇦', dir:'ltr', group:'za'  },
    { code:'tn',  label:'Setswana',       flag:'🇿🇦', dir:'ltr', group:'za'  },
    { code:'st',  label:'Sesotho',        flag:'🇿🇦', dir:'ltr', group:'za'  },
    { code:'ts',  label:'Xitsonga',       flag:'🇿🇦', dir:'ltr', group:'za'  },
    { code:'ss',  label:'siSwati',        flag:'🇿🇦', dir:'ltr', group:'za'  },
    { code:'ve',  label:'Tshivenda',      flag:'🇿🇦', dir:'ltr', group:'za'  },
    { code:'nr',  label:'isiNdebele',     flag:'🇿🇦', dir:'ltr', group:'za'  },
    /* Pan-African languages */
    { code:'sw',  label:'Kiswahili',      flag:'🇰🇪', dir:'ltr', group:'pan' },
    { code:'ha',  label:'Hausa',          flag:'🇳🇬', dir:'ltr', group:'pan' },
    { code:'yo',  label:'Yorùbá',         flag:'🇳🇬', dir:'ltr', group:'pan' },
    { code:'ig',  label:'Igbo',           flag:'🇳🇬', dir:'ltr', group:'pan' },
    { code:'am',  label:'አማርኛ',          flag:'🇪🇹', dir:'ltr', group:'pan' },
    { code:'so',  label:'Soomaali',       flag:'🇸🇴', dir:'ltr', group:'pan' },
    { code:'mg',  label:'Malagasy',       flag:'🇲🇬', dir:'ltr', group:'pan' },
    { code:'ln',  label:'Lingala',        flag:'🇨🇩', dir:'ltr', group:'pan' },
    /* International */
    { code:'en',  label:'English',        flag:'🇬🇧', dir:'ltr', group:'int' },
    { code:'fr',  label:'Français',       flag:'🇫🇷', dir:'ltr', group:'int' },
    { code:'pt',  label:'Português',      flag:'🇲🇿', dir:'ltr', group:'int' },
    { code:'ar',  label:'العربية',        flag:'🇪🇬', dir:'rtl', group:'int' },
  ];

  const GROUP_LABELS = {
    za:  'Izilimi Zase-Ningizimu Afrika · South African Languages',
    pan: 'Izilimi Zase-Afrika · Pan-African Languages',
    int: 'International',
  };

  /* ─── Base English dictionary (always loaded — never async) ─── */
  const T = {
    en: {
      'nav.workflows':'Workflows','nav.learn':'Learn',
      'nav.learn.diseases':'Diseases','nav.learn.journey':'Learning Journey',
      'nav.learn.equipment':'Equipment Gallery','nav.learn.tools':'Tool Explorer',
      'nav.learn.pipeline':'Pipeline Guide','nav.learn.hpc':'HPC Training',
      'nav.learn.repos':'Repositories','nav.learn.curriculum':'Curriculum Tracks',
      'nav.learn.badges':'Badges & Certs',
      'nav.research':'Research','nav.reprohub':'Repro Hub',
      'nav.africahub':'Africa Hub','nav.workshop':'Workshop',
      'nav.map':'Map','nav.ask':'Ask','nav.sandbox':'Sandbox','nav.compare':'Compare',
      'nav.search':'Search','nav.progress':'My Progress','nav.whats_new':"What's New",
      'hero.tagline':'Interactive Omics Training Platform',
      'hero.title1':'Learn Omics','hero.title2':'Workflows by',
      'hero.title3.accent':'Doing','hero.title3.rest':'Them',
      'hero.desc':'Drag reagents, set parameters, watch every wet-lab decision cascade through the bioinformatics pipeline in real time. 40+ diseases · 14 workflows · 20 real instruments.',
      'hero.cta.start':'Start a Workflow →','hero.cta.howit':'How it works',
      'sec.domain.label':'Choose your experiment','sec.domain.title':'Select an Omics Domain',
      'sec.domain.desc':'Each domain contains realistic protocols with interactive reagent selection, instrument parameter tuning, and a live quality control dashboard.',
      'sec.curriculum.label':'Your learning journey','sec.curriculum.title':'Curriculum Learning Paths',
      'sec.curriculum.desc':'Three structured tracks — Wet-Lab Scientist, Bioinformatician, and Public Health Researcher. Follow lessons in order, track your progress, and earn a certificate when you complete a track.',
      'sec.disease.label':'What are we investigating?','sec.disease.title':'Disease Explorer',
      'sec.disease.desc':'Every workflow in OmicsLab targets real diseases. Explore which conditions each omics approach investigates, the biomarkers being hunted, and the clinical insights that result.',
      'sec.learning.label':'Complete learning journey','sec.learning.title':'Disease Learning Layer',
      'sec.learning.desc':'Choose a disease and follow it from clinical presentation through sample type, sequencing strategy, bioinformatics pipeline, and interpretation.',
      'sec.research.label':'Design a study','sec.research.title':'Research Project Mode',
      'sec.research.desc':'Orchestrate a reproducible project: pick a disease, choose workflows and a partner lab, then run a simulated study that ties wet-lab choices to analysis and interpretation.',
      'sec.repro.label':'Reproducible omics science','sec.repro.title':'Research Metadata & Reproducibility Hub',
      'sec.repro.desc':'Submit studies with full metadata and get instant Reproducibility, Completeness, and FAIR scores. Browse, fork, validate, and reproduce community submissions.',
      'sec.africa.label':'African genomics science','sec.africa.title':'Africa Science Hub',
      'sec.africa.desc':'Data governance, population genomics, One Health surveillance, grant alignment, and real training opportunities — everything that makes omics research in Africa distinct and important.',
      'sec.workshop.label':'Train your cohort','sec.workshop.title':'Workshop & Instructor Mode',
      'sec.workshop.desc':'Create a workshop session, share the code with students, and track completion across all OmicsLab modules. Export attendance and progress reports for grant reporting.',
      'sec.badges.label':'Your achievements','sec.badges.title':'Badges & Certificates',
      'sec.badges.desc':'Earn badges by completing workflows, learning tracks, and research tasks. Click any earned badge to generate a printable certificate.',
      'sec.equipment.label':'Real-world instruments','sec.equipment.title':'Equipment Gallery',
      'sec.equipment.desc':'Explore the actual instruments used in modern omics labs — real photos, specs, and cost estimates. From pocket-sized nanopore sequencers to room-sized mass spectrometers.',
      'sec.tools.label':'The bioinformatics toolkit','sec.tools.title':'Tool Explorer',
      'sec.tools.desc':'Real bioinformatics tools used in every step — from quality control to variant calling to pathway analysis. Learn what each tool does, what it takes as input, and when to use it.',
      'sec.pipeline.label':'How the analysis actually works','sec.pipeline.title':'Bioinformatics Pipeline Guide',
      'sec.pipeline.desc':'Follow a complete DNA sequencing workflow from raw FASTQ files to biological interpretation. Each stage shows the tools used, what the output means, and a dry-run example you can copy.',
      'sec.hpc.label':'Running analysis at scale','sec.hpc.title':'HPC Training Layer',
      'sec.hpc.desc':'Learn SLURM job scheduling, resource optimisation, workflow engines, and containerised pipelines — using the same omics steps you already know.',
      'sec.repos.label':'Where the data lives','sec.repos.title':'Data Repositories',
      'sec.repos.desc':'Every omics study deposits its raw data in a public repository. Learn the major archives and which ones matter most for African research.',
      'sec.map.label':'Where the science happens','sec.map.title':'Africa Genomics Lab Map',
      'sec.map.desc':'Explore the genomics centres, H3Africa network nodes, and sequencing hubs across Africa. Click any dot to see the institute and its focus areas.',
      'sec.ask.label':'Got a question?','sec.ask.title':'Ask OmicsLab',
      'sec.ask.desc':'Search 55+ pre-written answers about workflows, tools, QC metrics, diseases, and African genomics. Works completely offline — no AI API needed.',
      'sec.changelog.label':'Platform updates','sec.changelog.title':"What's New in OmicsLab",
      'sec.changelog.desc':'See the latest features, improvements, and content added to the platform. OmicsLab is always evolving.',
    }
  };

  /* ─── Locale loading state ─── */
  const _loaded = new Set(['en']);
  const _pending = {};

  /* ─── Register a locale (called by js/locales/*.js) ─── */
  function registerLocale(code, dict) {
    T[code] = dict;
    _loaded.add(code);
    /* If apply() was waiting for this locale, fire it */
    if (_pending[code]) {
      _pending[code].forEach(fn => fn());
      delete _pending[code];
    }
  }

  /* ─── Lazy-load a locale file ─── */
  function _loadLocale(code) {
    return new Promise((resolve, reject) => {
      if (_loaded.has(code)) { resolve(); return; }
      if (!_pending[code]) _pending[code] = [];
      _pending[code].push(resolve);
      /* Only inject the script once */
      if (document.querySelector(`script[data-lang="${code}"]`)) return;
      const s = document.createElement('script');
      s.src = `js/locales/${code}.js`;
      s.dataset.lang = code;
      s.onerror = () => { resolve(); /* fall back to English silently */ };
      document.head.appendChild(s);
    });
  }

  /* ─── Apply translations to the DOM ─── */
  function _applyDict(dict, langMeta) {
    document.documentElement.lang = langMeta.code;
    document.documentElement.dir = langMeta.dir;
    document.body.classList.toggle('lang-rtl', langMeta.dir === 'rtl');

    /* 1. [data-i18n] elements */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = dict[el.getAttribute('data-i18n')];
      if (v !== undefined) el.textContent = v;
    });

    /* 2. Section labels / titles / descs */
    const SECTION_MAP = [
      ['domain-section','sec.domain'],['curriculum-section','sec.curriculum'],
      ['disease-explorer-section','sec.disease'],['disease-learning-section','sec.learning'],
      ['research-mode-section','sec.research'],['repro-hub-section','sec.repro'],
      ['africa-hub-section','sec.africa'],['workshop-section','sec.workshop'],
      ['badges-section','sec.badges'],['equipment-gallery-section','sec.equipment'],
      ['tool-explorer-section','sec.tools'],['bioinfo-pipeline-section','sec.pipeline'],
      ['hpc-training-section','sec.hpc'],['repo-explorer-section','sec.repos'],
      ['africa-map-section','sec.map'],['qa-section','sec.ask'],
      ['changelog-section','sec.changelog'],
    ];
    SECTION_MAP.forEach(([id, key]) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      const label = sec.querySelector('.section-label,.home-section-label');
      const title = sec.querySelector('.section-title,.home-section-title');
      const desc  = sec.querySelector('.section-desc,.home-section-sub');
      if (label && dict[key+'.label']) label.textContent = dict[key+'.label'];
      if (title && dict[key+'.title']) title.textContent = dict[key+'.title'];
      if (desc  && dict[key+'.desc'])  desc.textContent  = dict[key+'.desc'];
    });

    /* 3. Update selector UI */
    _syncSelectorUI(langMeta);

    /* 4. Notify voice module */
    if (OmicsLab.Voice) OmicsLab.Voice.onLangChange(langMeta.code);
  }

  /* ─── Public: apply a language (lazy-loads locale if needed) ─── */
  function apply(lang) {
    const meta = LANGS.find(l => l.code === lang) || LANGS.find(l => l.code === 'en');
    _current = meta.code;
    try { localStorage.setItem(STORE_KEY, _current); } catch {}

    if (_loaded.has(_current)) {
      _applyDict(T[_current] || T.en, meta);
    } else {
      /* Show loading state on selector */
      const btn = document.querySelector('.i18n-current');
      if (btn) btn.classList.add('i18n-loading');
      _loadLocale(_current).then(() => {
        if (btn) btn.classList.remove('i18n-loading');
        _applyDict(T[_current] || T.en, meta);
      });
    }
  }

  /* ─── Build and inject the grouped language selector ─── */
  function _buildSelector() {
    /* Inject into nav-right, before the user pill */
    const navRight = document.getElementById('nav-right');
    if (!navRight || document.getElementById('i18n-toggle')) return;
    const nav = navRight; /* re-use variable name; we insert inside nav-right below */

    const curMeta = LANGS.find(l => l.code === _current) || LANGS[0];
    const wrap = document.createElement('div');
    wrap.id = 'i18n-toggle';
    wrap.className = 'i18n-toggle-wrap';

    /* Group the languages */
    const groups = ['za','pan','int'];
    const groupsHtml = groups.map(g => {
      const langs = LANGS.filter(l => l.group === g);
      const items = langs.map(l => `
        <button class="i18n-option${l.code === _current ? ' active' : ''}"
                data-lang="${l.code}"
                onclick="OmicsLab.I18n.apply('${l.code}');document.getElementById('i18n-toggle').classList.remove('open')"
                aria-label="${l.label}">
          <span class="i18n-opt-flag">${l.flag}</span>
          <span class="i18n-opt-label">${l.label}</span>
          ${l.code === _current ? '<span class="i18n-opt-check">✓</span>' : ''}
        </button>`).join('');
      return `
        <div class="i18n-group">
          <div class="i18n-group-label">${GROUP_LABELS[g]}</div>
          <div class="i18n-group-items">${items}</div>
        </div>`;
    }).join('');

    wrap.innerHTML = `
      <button class="i18n-current" aria-label="Language / Ulimi / Taal"
              aria-haspopup="listbox"
              onclick="this.closest('.i18n-toggle-wrap').classList.toggle('open')">
        <span class="i18n-current-flag">${curMeta.flag}</span>
        <span class="i18n-current-label">${curMeta.label}</span>
        <svg class="i18n-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="i18n-dropdown" role="listbox" aria-label="Select language">
        <div class="i18n-search-wrap">
          <input class="i18n-search" type="search" placeholder="Search languages…"
                 oninput="OmicsLab.I18n._filterLangs(this.value)" autocomplete="off"/>
        </div>
        ${groupsHtml}
      </div>`;

    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) wrap.classList.remove('open');
    });
    /* Insert before the user pill (or append if pill not found) */
    const userPill = document.getElementById('nav-user-pill');
    if (userPill) navRight.insertBefore(wrap, userPill);
    else navRight.appendChild(wrap);
  }

  /* ─── Sync the selector UI to current language ─── */
  function _syncSelectorUI(meta) {
    const wrap = document.getElementById('i18n-toggle');
    if (!wrap) return;
    const btn   = wrap.querySelector('.i18n-current-flag');
    const label = wrap.querySelector('.i18n-current-label');
    if (btn)   btn.textContent   = meta.flag;
    if (label) label.textContent = meta.label;
    wrap.querySelectorAll('.i18n-option').forEach(opt => {
      const isActive = opt.dataset.lang === _current;
      opt.classList.toggle('active', isActive);
      let check = opt.querySelector('.i18n-opt-check');
      if (isActive && !check) {
        check = document.createElement('span');
        check.className = 'i18n-opt-check';
        check.textContent = '✓';
        opt.appendChild(check);
      } else if (!isActive && check) {
        check.remove();
      }
    });
  }

  /* ─── Filter language list by search query ─── */
  function _filterLangs(query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('#i18n-toggle .i18n-option').forEach(opt => {
      const label = opt.querySelector('.i18n-opt-label')?.textContent.toLowerCase() || '';
      const code  = (opt.dataset.lang || '').toLowerCase();
      opt.style.display = (!q || label.includes(q) || code.includes(q)) ? '' : 'none';
    });
    document.querySelectorAll('#i18n-toggle .i18n-group').forEach(group => {
      const anyVisible = [...group.querySelectorAll('.i18n-option')].some(o => o.style.display !== 'none');
      group.style.display = anyVisible ? '' : 'none';
    });
  }

  /* ─── Init ─── */
  function init() {
    try { _current = localStorage.getItem(STORE_KEY) || 'en'; } catch {}
    _buildSelector();
    apply(_current);
  }

  function t(key) { return (T[_current] || T.en)[key] || (T.en[key] || key); }
  function current() { return _current; }

  return { init, apply, t, current, registerLocale, _filterLangs, LANGS };
})();
