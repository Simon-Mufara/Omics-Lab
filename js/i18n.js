/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Internationalisation (i18n)
   English / French language toggle.
   Translates nav, hero, section headers, and key CTAs.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.I18n = (function () {

  const STORE_KEY = 'omicslab_lang_v1';
  let _current = 'en';

  /* ─── Full translation dictionary ─── */
  const T = {
    en: {
      /* Nav */
      'nav.workflows': 'Workflows', 'nav.learn': 'Learn',
      'nav.learn.diseases': ' Diseases', 'nav.learn.journey': ' Learning Journey',
      'nav.learn.equipment': ' Equipment Gallery', 'nav.learn.tools': ' Tool Explorer',
      'nav.learn.pipeline': ' Pipeline Guide', 'nav.learn.hpc': ' HPC Training',
      'nav.learn.repos': ' Repositories', 'nav.learn.curriculum': ' Curriculum Tracks',
      'nav.learn.badges': ' Badges & Certs',
      'nav.research': 'Research', 'nav.reprohub': 'Repro Hub',
      'nav.africahub': 'Africa Hub', 'nav.workshop': 'Workshop',
      'nav.map': 'Map', 'nav.ask': 'Ask', 'nav.sandbox': 'Sandbox', 'nav.compare': 'Compare',

      /* Hero */
      'hero.tagline': 'Interactive Omics Training Platform',
      'hero.title1': 'Learn Omics', 'hero.title2': 'Workflows by',
      'hero.title3.accent': 'Doing', 'hero.title3.rest': 'Them',
      'hero.desc': 'Drag reagents, set parameters, watch every wet-lab decision cascade through the bioinformatics pipeline in real time. 22 diseases · 14 workflows · 20 real instruments.',
      'hero.cta.start': 'Start a Workflow →', 'hero.cta.howit': 'How it works',

      /* Sections — label | title | desc */
      'sec.domain.label': 'Choose your experiment',
      'sec.domain.title': 'Select an Omics Domain',
      'sec.domain.desc': 'Each domain contains realistic protocols with interactive reagent selection, instrument parameter tuning, and a live quality control dashboard.',

      'sec.curriculum.label': 'Your learning journey',
      'sec.curriculum.title': 'Curriculum Learning Paths',
      'sec.curriculum.desc': 'Three structured tracks — Wet-Lab Scientist, Bioinformatician, and Public Health Researcher. Follow lessons in order, track your progress, and earn a certificate when you complete a track.',

      'sec.disease.label': 'What are we investigating?',
      'sec.disease.title': 'Disease Explorer',
      'sec.disease.desc': 'Every workflow in OmicsLab targets real diseases. Explore which conditions each omics approach investigates, the biomarkers being hunted, and the clinical insights that result.',

      'sec.learning.label': 'Complete learning journey',
      'sec.learning.title': 'Disease Learning Layer',
      'sec.learning.desc': 'Go deep on any disease. Explore its molecular biology, the omics techniques that reveal it, and the African context that shapes how we study it.',

      'sec.research.label': 'Design a study',
      'sec.research.title': 'Research Project Mode',
      'sec.research.desc': 'Orchestrate a reproducible project: pick a disease, choose workflows and a partner lab, then run a simulated study that ties wet-lab choices to analysis and interpretation.',

      'sec.repro.label': 'Reproducible omics science',
      'sec.repro.title': 'Research Metadata & Reproducibility Hub',
      'sec.repro.desc': 'Submit studies with full metadata and get instant Reproducibility, Completeness, and FAIR scores. Browse, fork, validate, and reproduce community submissions.',

      'sec.africa.label': 'African genomics science',
      'sec.africa.title': 'Africa Science Hub',
      'sec.africa.desc': 'Data governance, population genomics, One Health surveillance, grant alignment, and real training opportunities — everything that makes omics research in Africa distinct and important.',

      'sec.workshop.label': 'Train your cohort',
      'sec.workshop.title': 'Workshop & Instructor Mode',
      'sec.workshop.desc': 'Create a workshop session, share the code with students, and track completion across all OmicsLab modules. Export attendance and progress reports for grant reporting.',

      'sec.badges.label': 'Your achievements',
      'sec.badges.title': 'Badges & Certificates',
      'sec.badges.desc': 'Earn badges by completing workflows, learning tracks, and research tasks. Click any earned badge to generate a printable certificate.',

      'sec.equipment.label': 'Real-world instruments',
      'sec.equipment.title': 'Equipment Gallery',
      'sec.equipment.desc': 'Explore the actual instruments used in modern omics labs — real photos, specs, and cost estimates. From pocket-sized nanopore sequencers to room-sized mass spectrometers.',

      'sec.tools.label': 'The bioinformatics toolkit',
      'sec.tools.title': 'Tool Explorer',
      'sec.tools.desc': 'Real bioinformatics tools used in every step — from quality control to variant calling to pathway analysis. Learn what each tool does, what it takes as input, and when to use it.',

      'sec.pipeline.label': 'How the analysis actually works',
      'sec.pipeline.title': 'Bioinformatics Pipeline Guide',
      'sec.pipeline.desc': 'Follow a complete DNA sequencing workflow from raw FASTQ files to biological interpretation. Each stage shows the tools used, what the output means, and a dry-run example you can copy and adapt.',

      'sec.hpc.label': 'Running analysis at scale',
      'sec.hpc.title': 'HPC Training Layer',
      'sec.hpc.desc': 'Learn SLURM job scheduling, resource optimisation, workflow engines, and containerised pipelines — using the same omics steps you already know. Simulate queue delays, memory errors, and runtime trade-offs.',

      'sec.repos.label': 'Where the data lives',
      'sec.repos.title': 'Data Repositories',
      'sec.repos.desc': 'Every omics study deposits its raw data in a public repository. Learn the major archives — from genomic sequencing data to cancer variant databases — and which ones matter most for African research.',

      'sec.map.label': 'Where the science happens',
      'sec.map.title': 'Africa Genomics Lab Map',
      'sec.map.desc': 'Interactive map of active genomics laboratories, sequencing centres, and H3Africa hubs across the continent. Click any site to see its programmes and capabilities.',

      'sec.ask.label': 'Got a question?',
      'sec.ask.title': 'Ask OmicsLab',
      'sec.ask.desc': 'Ask anything about omics workflows, sequencing technologies, African genomics, or the platform itself.',
    },

    fr: {
      /* Nav */
      'nav.workflows': 'Protocoles', 'nav.learn': 'Apprendre',
      'nav.learn.diseases': ' Maladies', 'nav.learn.journey': " Parcours d'apprentissage",
      'nav.learn.equipment': ' Équipements', 'nav.learn.tools': ' Outils bioinformatiques',
      'nav.learn.pipeline': ' Guide pipeline', 'nav.learn.hpc': ' Formation HPC',
      'nav.learn.repos': ' Référentiels', 'nav.learn.curriculum': ' Programme de cours',
      'nav.learn.badges': ' Badges & Certificats',
      'nav.research': 'Recherche', 'nav.reprohub': 'Hub Repro',
      'nav.africahub': 'Hub Afrique', 'nav.workshop': 'Atelier',
      'nav.map': 'Carte', 'nav.ask': 'Demander', 'nav.sandbox': 'Bac à sable', 'nav.compare': 'Comparer',

      /* Hero */
      'hero.tagline': 'Plateforme interactive de formation en omique',
      'hero.title1': 'Apprenez les', 'hero.title2': 'workflows omiques',
      'hero.title3.accent': 'en pratiquant', 'hero.title3.rest': '',
      'hero.desc': "Déposez les réactifs, configurez les paramètres, observez comment chaque décision de laboratoire influe sur le pipeline. 22 maladies · 14 workflows · 20 instruments réels.",
      'hero.cta.start': 'Démarrer un workflow →', 'hero.cta.howit': 'Comment ça marche',

      /* Sections */
      'sec.domain.label': 'Choisissez votre expérience',
      'sec.domain.title': 'Sélectionnez un domaine omique',
      'sec.domain.desc': "Chaque domaine contient des protocoles réalistes avec sélection interactive de réactifs, réglage des paramètres d'instruments et tableau de bord qualité en direct.",

      'sec.curriculum.label': "Votre parcours d'apprentissage",
      'sec.curriculum.title': 'Parcours pédagogiques',
      'sec.curriculum.desc': 'Trois parcours structurés — Scientifique de laboratoire humide, Bioinformaticien et Chercheur en santé publique. Suivez les leçons, suivez vos progrès et obtenez un certificat.',

      'sec.disease.label': "Qu'est-ce qu'on étudie ?",
      'sec.disease.title': 'Explorateur de maladies',
      'sec.disease.desc': 'Chaque workflow OmicsLab cible de vraies maladies. Explorez quelles conditions chaque approche omique étudie, les biomarqueurs recherchés et les résultats cliniques.',

      'sec.learning.label': "Parcours d'apprentissage complet",
      'sec.learning.title': 'Couche d\'apprentissage des maladies',
      'sec.learning.desc': 'Approfondissez n\'importe quelle maladie. Explorez sa biologie moléculaire, les techniques omiques qui la révèlent et le contexte africain qui façonne notre étude.',

      'sec.research.label': 'Concevoir une étude',
      'sec.research.title': 'Mode Projet de Recherche',
      'sec.research.desc': "Orchestrez un projet reproductible : choisissez une maladie, des workflows et un laboratoire partenaire, puis exécutez une étude simulée.",

      'sec.repro.label': 'Science omique reproductible',
      'sec.repro.title': 'Hub de Métadonnées & Reproductibilité',
      'sec.repro.desc': 'Soumettez des études avec des métadonnées complètes et obtenez des scores instantanés de Reproductibilité, Complétude et FAIR.',

      'sec.africa.label': 'Science génomique africaine',
      'sec.africa.title': 'Hub Science Afrique',
      'sec.africa.desc': "Gouvernance des données, génomique des populations, surveillance One Health, alignement sur les financements et opportunités de formation réelles.",

      'sec.workshop.label': 'Former votre cohorte',
      'sec.workshop.title': 'Mode Atelier & Instructeur',
      'sec.workshop.desc': 'Créez une session d\'atelier, partagez le code avec les étudiants et suivez la complétion de tous les modules OmicsLab. Exportez les rapports de présence.',

      'sec.badges.label': 'Vos réalisations',
      'sec.badges.title': 'Badges & Certificats',
      'sec.badges.desc': 'Gagnez des badges en complétant des workflows, des parcours d\'apprentissage et des tâches de recherche. Cliquez sur un badge pour générer un certificat imprimable.',

      'sec.equipment.label': 'Instruments du monde réel',
      'sec.equipment.title': 'Galerie d\'équipements',
      'sec.equipment.desc': 'Explorez les instruments utilisés dans les laboratoires omiques modernes — photos réelles, spécifications et estimations de coûts.',

      'sec.tools.label': 'La boîte à outils bioinformatique',
      'sec.tools.title': 'Explorateur d\'outils',
      'sec.tools.desc': 'Outils bioinformatiques réels utilisés à chaque étape — du contrôle qualité à l\'annotation des variants.',

      'sec.pipeline.label': 'Comment fonctionne l\'analyse',
      'sec.pipeline.title': 'Guide du pipeline bioinformatique',
      'sec.pipeline.desc': 'Suivez un workflow complet de séquençage ADN des fichiers FASTQ bruts jusqu\'à l\'interprétation biologique.',

      'sec.hpc.label': 'Analyser à grande échelle',
      'sec.hpc.title': 'Couche de formation HPC',
      'sec.hpc.desc': 'Apprenez la planification de tâches SLURM, l\'optimisation des ressources, les moteurs de workflow et les pipelines conteneurisés.',

      'sec.repos.label': 'Où vivent les données',
      'sec.repos.title': 'Référentiels de données',
      'sec.repos.desc': 'Chaque étude omique dépose ses données brutes dans un référentiel public. Apprenez les grandes archives et leur pertinence pour la recherche africaine.',

      'sec.map.label': 'Où la science se passe',
      'sec.map.title': 'Carte des laboratoires de génomique africains',
      'sec.map.desc': 'Carte interactive des laboratoires de génomique actifs, centres de séquençage et hubs H3Africa sur le continent.',

      'sec.ask.label': 'Une question ?',
      'sec.ask.title': 'Demandez à OmicsLab',
      'sec.ask.desc': 'Posez toute question sur les workflows omiques, les technologies de séquençage, la génomique africaine ou la plateforme.',
    }
  };

  /* Map section IDs → translation keys */
  const SECTION_MAP = [
    ['domain-section',           'sec.domain'],
    ['curriculum-section',       'sec.curriculum'],
    ['disease-explorer-section', 'sec.disease'],
    ['disease-learning-section', 'sec.learning'],
    ['research-mode-section',    'sec.research'],
    ['repro-hub-section',        'sec.repro'],
    ['africa-hub-section',       'sec.africa'],
    ['workshop-section',         'sec.workshop'],
    ['badges-section',           'sec.badges'],
    ['equipment-gallery-section','sec.equipment'],
    ['tool-explorer-section',    'sec.tools'],
    ['bioinfo-pipeline-section', 'sec.pipeline'],
    ['hpc-training-section',     'sec.hpc'],
    ['repo-explorer-section',    'sec.repos'],
    ['africa-map-section',       'sec.map'],
    ['qa-section',               'sec.ask'],
  ];

  /* ─── Apply translations ─── */
  function apply(lang) {
    _current = lang || 'en';
    try { localStorage.setItem(STORE_KEY, _current); } catch {}

    const dict = T[_current] || T.en;
    document.documentElement.lang = _current;

    /* 1. Translate all [data-i18n] elements */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = dict[el.getAttribute('data-i18n')];
      if (v !== undefined) el.textContent = v;
    });

    /* 2. Translate section labels / titles / descs */
    SECTION_MAP.forEach(([id, key]) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      const label = sec.querySelector('.section-label');
      const title = sec.querySelector('.section-title');
      const desc  = sec.querySelector('.section-desc');
      if (label && dict[key + '.label']) label.textContent = dict[key + '.label'];
      if (title && dict[key + '.title']) title.textContent = dict[key + '.title'];
      if (desc  && dict[key + '.desc'])  desc.textContent  = dict[key + '.desc'];
    });

    /* 3. Update toggle button state */
    document.querySelectorAll('.i18n-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === _current);
    });

    /* 4. Curriculum section has data-i18n on its own label/title — handled above via step 1 */
  }

  function t(key) { return (T[_current] || T.en)[key] || key; }

  /* ─── Init ─── */
  function init() {
    try { _current = localStorage.getItem(STORE_KEY) || 'en'; } catch {}

    /* Inject toggle into nav */
    const nav = document.getElementById('nav-pills-desktop');
    if (nav && !document.getElementById('i18n-toggle')) {
      const wrap = document.createElement('div');
      wrap.id = 'i18n-toggle';
      wrap.className = 'i18n-toggle-wrap';
      wrap.innerHTML = `
        <button class="i18n-btn${_current==='en'?' active':''}" data-lang="en" onclick="OmicsLab.I18n.apply('en')" aria-label="English">EN</button>
        <button class="i18n-btn${_current==='fr'?' active':''}" data-lang="fr" onclick="OmicsLab.I18n.apply('fr')" aria-label="Français">FR</button>`;
      nav.after(wrap);
    }

    apply(_current);
  }

  return { init, apply, t };
})();
