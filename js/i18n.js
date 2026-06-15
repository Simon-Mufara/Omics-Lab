/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Internationalisation (i18n)
   5-language support: English · Français · Kiswahili · Português · العربية
   RTL support for Arabic (dir="rtl" on <html>).
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.I18n = (function () {

  const STORE_KEY = 'omicslab_lang_v2';
  let _current = 'en';

  const LANGS = [
    { code: 'en', label: 'English',    flag: '🇬🇧', dir: 'ltr' },
    { code: 'fr', label: 'Français',   flag: '🇫🇷', dir: 'ltr' },
    { code: 'sw', label: 'Kiswahili',  flag: '🇰🇪', dir: 'ltr' },
    { code: 'pt', label: 'Português',  flag: '🇲🇿', dir: 'ltr' },
    { code: 'ar', label: 'العربية',    flag: '🇪🇬', dir: 'rtl' },
  ];

  /* ─── Full translation dictionary ─── */
  const T = {

    /* ════════════════════════════════ ENGLISH ════════════════════════════════ */
    en: {
      /* Nav */
      'nav.workflows': 'Workflows', 'nav.learn': 'Learn',
      'nav.learn.diseases': 'Diseases', 'nav.learn.journey': 'Learning Journey',
      'nav.learn.equipment': 'Equipment Gallery', 'nav.learn.tools': 'Tool Explorer',
      'nav.learn.pipeline': 'Pipeline Guide', 'nav.learn.hpc': 'HPC Training',
      'nav.learn.repos': 'Repositories', 'nav.learn.curriculum': 'Curriculum Tracks',
      'nav.learn.badges': 'Badges & Certs',
      'nav.research': 'Research', 'nav.reprohub': 'Repro Hub',
      'nav.africahub': 'Africa Hub', 'nav.workshop': 'Workshop',
      'nav.map': 'Map', 'nav.ask': 'Ask', 'nav.sandbox': 'Sandbox', 'nav.compare': 'Compare',
      'nav.search': 'Search', 'nav.progress': 'My Progress', 'nav.whats_new': "What's New",

      /* Hero */
      'hero.tagline': 'Interactive Omics Training Platform',
      'hero.title1': 'Learn Omics', 'hero.title2': 'Workflows by',
      'hero.title3.accent': 'Doing', 'hero.title3.rest': 'Them',
      'hero.desc': 'Drag reagents, set parameters, watch every wet-lab decision cascade through the bioinformatics pipeline in real time. 40+ diseases · 14 workflows · 20 real instruments.',
      'hero.cta.start': 'Start a Workflow →', 'hero.cta.howit': 'How it works',

      /* Sections */
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
      'sec.learning.desc': 'Choose a disease and follow it from clinical presentation through sample type, sequencing strategy, bioinformatics pipeline, and interpretation.',

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
      'sec.pipeline.desc': 'Follow a complete DNA sequencing workflow from raw FASTQ files to biological interpretation. Each stage shows the tools used, what the output means, and a dry-run example you can copy.',

      'sec.hpc.label': 'Running analysis at scale',
      'sec.hpc.title': 'HPC Training Layer',
      'sec.hpc.desc': 'Learn SLURM job scheduling, resource optimisation, workflow engines, and containerised pipelines — using the same omics steps you already know.',

      'sec.repos.label': 'Where the data lives',
      'sec.repos.title': 'Data Repositories',
      'sec.repos.desc': 'Every omics study deposits its raw data in a public repository. Learn the major archives and which ones matter most for African research.',

      'sec.map.label': 'Where the science happens',
      'sec.map.title': 'Africa Genomics Lab Map',
      'sec.map.desc': 'Explore the genomics centres, H3Africa network nodes, and sequencing hubs across Africa. Click any dot to see the institute and its focus areas.',

      'sec.ask.label': 'Got a question?',
      'sec.ask.title': 'Ask OmicsLab',
      'sec.ask.desc': 'Search 55+ pre-written answers about workflows, tools, QC metrics, diseases, and African genomics. Works completely offline — no AI API needed.',

      'sec.changelog.label': 'Platform updates',
      'sec.changelog.title': "What's New in OmicsLab",
      'sec.changelog.desc': 'See the latest features, improvements, and content added to the platform. OmicsLab is always evolving.',
    },

    /* ════════════════════════════════ FRANÇAIS ════════════════════════════════ */
    fr: {
      /* Nav */
      'nav.workflows': 'Protocoles', 'nav.learn': 'Apprendre',
      'nav.learn.diseases': 'Maladies', 'nav.learn.journey': "Parcours d'apprentissage",
      'nav.learn.equipment': 'Équipements', 'nav.learn.tools': 'Outils bioinformatiques',
      'nav.learn.pipeline': 'Guide pipeline', 'nav.learn.hpc': 'Formation HPC',
      'nav.learn.repos': 'Référentiels', 'nav.learn.curriculum': 'Programme de cours',
      'nav.learn.badges': 'Badges & Certificats',
      'nav.research': 'Recherche', 'nav.reprohub': 'Hub Repro',
      'nav.africahub': 'Hub Afrique', 'nav.workshop': 'Atelier',
      'nav.map': 'Carte', 'nav.ask': 'Demander', 'nav.sandbox': 'Bac à sable', 'nav.compare': 'Comparer',
      'nav.search': 'Rechercher', 'nav.progress': 'Mes progrès', 'nav.whats_new': 'Nouveautés',

      /* Hero */
      'hero.tagline': 'Plateforme interactive de formation en omique',
      'hero.title1': 'Apprenez les', 'hero.title2': 'workflows omiques',
      'hero.title3.accent': 'en pratiquant', 'hero.title3.rest': '',
      'hero.desc': "Déposez les réactifs, configurez les paramètres, observez comment chaque décision de laboratoire influe sur le pipeline. 40+ maladies · 14 workflows · 20 instruments réels.",
      'hero.cta.start': 'Démarrer un workflow →', 'hero.cta.howit': 'Comment ça marche',

      /* Sections */
      'sec.domain.label': 'Choisissez votre expérience',
      'sec.domain.title': 'Sélectionnez un domaine omique',
      'sec.domain.desc': "Chaque domaine contient des protocoles réalistes avec sélection interactive de réactifs, réglage des paramètres et tableau de bord qualité en direct.",

      'sec.curriculum.label': "Votre parcours d'apprentissage",
      'sec.curriculum.title': 'Parcours pédagogiques',
      'sec.curriculum.desc': 'Trois parcours structurés — Scientifique de laboratoire humide, Bioinformaticien et Chercheur en santé publique. Suivez les leçons et obtenez un certificat.',

      'sec.disease.label': "Qu'est-ce qu'on étudie ?",
      'sec.disease.title': 'Explorateur de maladies',
      'sec.disease.desc': 'Chaque workflow OmicsLab cible de vraies maladies. Explorez les biomarqueurs recherchés et les résultats cliniques.',

      'sec.learning.label': "Parcours d'apprentissage complet",
      'sec.learning.title': "Couche d'apprentissage des maladies",
      'sec.learning.desc': "Choisissez une maladie et suivez-la de la présentation clinique jusqu'à l'interprétation bioinformatique.",

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
      'sec.workshop.desc': "Créez une session d'atelier, partagez le code avec les étudiants et suivez la complétion de tous les modules OmicsLab.",

      'sec.badges.label': 'Vos réalisations',
      'sec.badges.title': 'Badges & Certificats',
      'sec.badges.desc': "Gagnez des badges en complétant des workflows, des parcours d'apprentissage et des tâches de recherche.",

      'sec.equipment.label': 'Instruments du monde réel',
      'sec.equipment.title': "Galerie d'équipements",
      'sec.equipment.desc': 'Explorez les instruments utilisés dans les laboratoires omiques modernes — photos réelles, spécifications et estimations de coûts.',

      'sec.tools.label': 'La boîte à outils bioinformatique',
      'sec.tools.title': "Explorateur d'outils",
      'sec.tools.desc': "Outils bioinformatiques réels utilisés à chaque étape — du contrôle qualité à l'annotation des variants.",

      'sec.pipeline.label': "Comment fonctionne l'analyse",
      'sec.pipeline.title': 'Guide du pipeline bioinformatique',
      'sec.pipeline.desc': "Suivez un workflow complet de séquençage ADN des fichiers FASTQ bruts jusqu'à l'interprétation biologique.",

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

      'sec.changelog.label': 'Mises à jour de la plateforme',
      'sec.changelog.title': "Quoi de neuf dans OmicsLab",
      'sec.changelog.desc': 'Découvrez les dernières fonctionnalités, améliorations et contenus ajoutés à la plateforme.',
    },

    /* ════════════════════════════════ KISWAHILI ════════════════════════════════ */
    sw: {
      /* Nav */
      'nav.workflows': 'Mifumo ya Kazi', 'nav.learn': 'Jifunze',
      'nav.learn.diseases': 'Magonjwa', 'nav.learn.journey': 'Safari ya Kujifunza',
      'nav.learn.equipment': 'Vifaa vya Lab', 'nav.learn.tools': 'Zana za Bioinformatics',
      'nav.learn.pipeline': 'Mwongozo wa Pipeline', 'nav.learn.hpc': 'Mafunzo ya HPC',
      'nav.learn.repos': 'Hazina za Data', 'nav.learn.curriculum': 'Njia za Mtaala',
      'nav.learn.badges': 'Beji & Vyeti',
      'nav.research': 'Utafiti', 'nav.reprohub': 'Hub ya Uzazi',
      'nav.africahub': 'Hub ya Afrika', 'nav.workshop': 'Warsha',
      'nav.map': 'Ramani', 'nav.ask': 'Uliza', 'nav.sandbox': 'Sanduku la Mchanga', 'nav.compare': 'Linganisha',
      'nav.search': 'Tafuta', 'nav.progress': 'Maendeleo Yangu', 'nav.whats_new': 'Mambo Mapya',

      /* Hero */
      'hero.tagline': 'Jukwaa la Mafunzo ya Omics la Maingiliano',
      'hero.title1': 'Jifunza Mifumo', 'hero.title2': 'ya Omics kwa',
      'hero.title3.accent': 'Vitendo', 'hero.title3.rest': '',
      'hero.desc': 'Buruta vitendanishi, weka vigezo, angalia jinsi kila uamuzi wa maabara unavyoathiri mnyororo wa uchambuzi. Magonjwa 40+ · Mifumo 14 · Vifaa 20 vya kweli.',
      'hero.cta.start': 'Anza Mfumo wa Kazi →', 'hero.cta.howit': 'Inavyofanya kazi',

      /* Sections */
      'sec.domain.label': 'Chagua jaribio lako',
      'sec.domain.title': 'Chagua Uwanja wa Omics',
      'sec.domain.desc': 'Kila uwanja una itifaki halisi zenye uchaguzi wa vitendanishi wa maingiliano, urekebishaji wa vigezo vya vifaa, na dashibodi ya udhibiti wa ubora wa wakati halisi.',

      'sec.curriculum.label': 'Safari yako ya kujifunza',
      'sec.curriculum.title': 'Njia za Mtaala wa Masomo',
      'sec.curriculum.desc': 'Njia tatu zilizopangwa — Mtaalamu wa Maabara ya Unyevu, Mbioinformatiki, na Mtafiti wa Afya ya Umma. Fuata masomo kwa mpangilio na pata cheti ukikamilisha.',

      'sec.disease.label': 'Tunachunguza nini?',
      'sec.disease.title': 'Mchunguzi wa Magonjwa',
      'sec.disease.desc': 'Kila mfumo wa kazi katika OmicsLab unalenga magonjwa halisi. Chunguza biomarkers zinazotafutwa na maarifa ya kliniki yanayotokana.',

      'sec.learning.label': 'Safari kamili ya kujifunza',
      'sec.learning.title': 'Safu ya Kujifunza Magonjwa',
      'sec.learning.desc': 'Chagua ugonjwa na ufuatilie kutoka uwasilishaji wa kliniki hadi aina ya sampuli, mkakati wa mpangilio, na tafsiri.',

      'sec.research.label': 'Buni utafiti',
      'sec.research.title': 'Hali ya Mradi wa Utafiti',
      'sec.research.desc': 'Panga mradi unaoweza kurudiwa: chagua ugonjwa, mifumo ya kazi na maabara ya mshirika, kisha endesha utafiti wa mfano.',

      'sec.repro.label': 'Sayansi ya omics inayoweza kurudiwa',
      'sec.repro.title': 'Hub ya Metadata ya Utafiti & Uigaji',
      'sec.repro.desc': 'Wasilisha tafiti na metadata kamili na pata alama za papo hapo za Uigaji, Ukamilifu, na FAIR.',

      'sec.africa.label': 'Sayansi ya jeni ya Afrika',
      'sec.africa.title': 'Hub ya Sayansi ya Afrika',
      'sec.africa.desc': 'Utawala wa data, genomics ya idadi ya watu, ufuatiliaji wa Afya Moja, ulinganifu wa ruzuku, na fursa halisi za mafunzo.',

      'sec.workshop.label': 'Funza kikundi chako',
      'sec.workshop.title': 'Hali ya Warsha & Mwalimu',
      'sec.workshop.desc': 'Tengeneza kikao cha warsha, shiriki nambari na wanafunzi, na ufuatilie ukamilishaji wa moduli zote za OmicsLab.',

      'sec.badges.label': 'Mafanikio yako',
      'sec.badges.title': 'Beji & Vyeti',
      'sec.badges.desc': 'Pata beji kwa kukamilisha mifumo ya kazi, njia za kujifunza, na kazi za utafiti. Bonyeza beji yoyote iliyopatikana ili kuzalisha cheti.',

      'sec.equipment.label': 'Vifaa vya ulimwengu wa kweli',
      'sec.equipment.title': 'Jumba la Vifaa',
      'sec.equipment.desc': 'Chunguza vifaa vinavyotumika katika maabara ya kisasa ya omics — picha halisi, vipimo, na makadirio ya gharama.',

      'sec.tools.label': 'Zana za bioinformatics',
      'sec.tools.title': 'Mchunguzi wa Zana',
      'sec.tools.desc': 'Zana halisi za bioinformatics zinazotumika katika kila hatua — kutoka udhibiti wa ubora hadi mwito wa tofauti.',

      'sec.pipeline.label': 'Jinsi uchambuzi unavyofanya kazi',
      'sec.pipeline.title': 'Mwongozo wa Pipeline ya Bioinformatics',
      'sec.pipeline.desc': 'Fuata mchakato kamili wa mpangilio wa DNA kutoka faili ghafi za FASTQ hadi tafsiri ya kibiolojia.',

      'sec.hpc.label': 'Kuendesha uchambuzi kwa kiwango',
      'sec.hpc.title': 'Safu ya Mafunzo ya HPC',
      'sec.hpc.desc': 'Jifunze kupanga kazi za SLURM, uboreshaji wa rasilimali, injini za mchakato wa kazi, na mabomba yaliyowekwa kwenye kontena.',

      'sec.repos.label': 'Ambapo data inaishi',
      'sec.repos.title': 'Hazina za Data',
      'sec.repos.desc': 'Kila utafiti wa omics huweka data yake ghafi katika hazina ya umma. Jifunze nyaraka kubwa na ni zipi zinazohusika zaidi na utafiti wa Afrika.',

      'sec.map.label': 'Ambapo sayansi inafanyika',
      'sec.map.title': 'Ramani ya Maabara ya Genomics ya Afrika',
      'sec.map.desc': 'Ramani ya maingiliano ya maabara ya genomics inayofanya kazi, vituo vya mpangilio, na hubs za H3Africa barani.',

      'sec.ask.label': 'Una swali?',
      'sec.ask.title': 'Uliza OmicsLab',
      'sec.ask.desc': 'Uliza chochote kuhusu mifumo ya kazi ya omics, teknolojia za mpangilio, genomics ya Afrika, au jukwaa lenyewe.',

      'sec.changelog.label': 'Masasisho ya jukwaa',
      'sec.changelog.title': 'Mambo Mapya katika OmicsLab',
      'sec.changelog.desc': 'Angalia vipengele vipya, maboresho, na maudhui yaliyoongezwa kwenye jukwaa.',
    },

    /* ════════════════════════════════ PORTUGUÊS ════════════════════════════════ */
    pt: {
      /* Nav */
      'nav.workflows': 'Fluxos de Trabalho', 'nav.learn': 'Aprender',
      'nav.learn.diseases': 'Doenças', 'nav.learn.journey': 'Jornada de Aprendizagem',
      'nav.learn.equipment': 'Galeria de Equipamentos', 'nav.learn.tools': 'Explorador de Ferramentas',
      'nav.learn.pipeline': 'Guia de Pipeline', 'nav.learn.hpc': 'Treinamento HPC',
      'nav.learn.repos': 'Repositórios', 'nav.learn.curriculum': 'Trilhas de Currículo',
      'nav.learn.badges': 'Medalhas & Certificados',
      'nav.research': 'Pesquisa', 'nav.reprohub': 'Hub Repro',
      'nav.africahub': 'Hub África', 'nav.workshop': 'Oficina',
      'nav.map': 'Mapa', 'nav.ask': 'Perguntar', 'nav.sandbox': 'Sandbox', 'nav.compare': 'Comparar',
      'nav.search': 'Pesquisar', 'nav.progress': 'Meu Progresso', 'nav.whats_new': 'Novidades',

      /* Hero */
      'hero.tagline': 'Plataforma Interativa de Treinamento em Ômicas',
      'hero.title1': 'Aprenda Fluxos', 'hero.title2': 'de Trabalho em',
      'hero.title3.accent': 'Ômicas', 'hero.title3.rest': 'na Prática',
      'hero.desc': 'Arraste reagentes, defina parâmetros, observe como cada decisão de laboratório afeta o pipeline de bioinformática em tempo real. 40+ doenças · 14 fluxos · 20 instrumentos reais.',
      'hero.cta.start': 'Iniciar um Fluxo de Trabalho →', 'hero.cta.howit': 'Como funciona',

      /* Sections */
      'sec.domain.label': 'Escolha seu experimento',
      'sec.domain.title': 'Selecione um Domínio de Ômicas',
      'sec.domain.desc': 'Cada domínio contém protocolos realistas com seleção interativa de reagentes, ajuste de parâmetros de instrumentos e painel de controle de qualidade ao vivo.',

      'sec.curriculum.label': 'Sua jornada de aprendizagem',
      'sec.curriculum.title': 'Trilhas de Currículo',
      'sec.curriculum.desc': 'Três trilhas estruturadas — Cientista de Laboratório Úmido, Bioinformata e Pesquisador de Saúde Pública. Siga as lições em ordem e ganhe um certificado ao completar.',

      'sec.disease.label': 'O que estamos investigando?',
      'sec.disease.title': 'Explorador de Doenças',
      'sec.disease.desc': 'Cada fluxo de trabalho no OmicsLab tem como alvo doenças reais. Explore os biomarcadores pesquisados e os insights clínicos que resultam.',

      'sec.learning.label': 'Jornada de aprendizagem completa',
      'sec.learning.title': 'Camada de Aprendizagem de Doenças',
      'sec.learning.desc': 'Escolha uma doença e siga desde a apresentação clínica até o tipo de amostra, pipeline de bioinformática e interpretação.',

      'sec.research.label': 'Projete um estudo',
      'sec.research.title': 'Modo Projeto de Pesquisa',
      'sec.research.desc': 'Orquestre um projeto reproduzível: escolha uma doença, fluxos de trabalho e um laboratório parceiro, depois execute um estudo simulado.',

      'sec.repro.label': 'Ciência ômica reproduzível',
      'sec.repro.title': 'Hub de Metadados de Pesquisa & Reprodutibilidade',
      'sec.repro.desc': 'Envie estudos com metadados completos e obtenha pontuações instantâneas de Reprodutibilidade, Completude e FAIR.',

      'sec.africa.label': 'Ciência genômica africana',
      'sec.africa.title': 'Hub de Ciência da África',
      'sec.africa.desc': 'Governança de dados, genômica populacional, vigilância One Health, alinhamento de financiamentos e oportunidades reais de formação.',

      'sec.workshop.label': 'Treine sua coorte',
      'sec.workshop.title': 'Modo Oficina & Instrutor',
      'sec.workshop.desc': 'Crie uma sessão de oficina, compartilhe o código com os alunos e acompanhe a conclusão de todos os módulos OmicsLab.',

      'sec.badges.label': 'Suas conquistas',
      'sec.badges.title': 'Medalhas & Certificados',
      'sec.badges.desc': 'Ganhe medalhas completando fluxos de trabalho, trilhas de aprendizagem e tarefas de pesquisa. Clique em qualquer medalha para gerar um certificado imprimível.',

      'sec.equipment.label': 'Instrumentos do mundo real',
      'sec.equipment.title': 'Galeria de Equipamentos',
      'sec.equipment.desc': 'Explore os instrumentos usados em laboratórios de ômicas modernos — fotos reais, especificações e estimativas de custo.',

      'sec.tools.label': 'O conjunto de ferramentas de bioinformática',
      'sec.tools.title': 'Explorador de Ferramentas',
      'sec.tools.desc': 'Ferramentas reais de bioinformática usadas em cada etapa — do controle de qualidade à anotação de variantes.',

      'sec.pipeline.label': 'Como a análise realmente funciona',
      'sec.pipeline.title': 'Guia de Pipeline de Bioinformática',
      'sec.pipeline.desc': 'Siga um fluxo de trabalho completo de sequenciamento de DNA desde arquivos FASTQ brutos até a interpretação biológica.',

      'sec.hpc.label': 'Executando análises em escala',
      'sec.hpc.title': 'Camada de Treinamento HPC',
      'sec.hpc.desc': 'Aprenda agendamento de trabalhos SLURM, otimização de recursos, motores de fluxo de trabalho e pipelines conteinerizados.',

      'sec.repos.label': 'Onde os dados vivem',
      'sec.repos.title': 'Repositórios de Dados',
      'sec.repos.desc': 'Cada estudo ômico deposita seus dados brutos em um repositório público. Aprenda os principais arquivos e quais são mais relevantes para a pesquisa africana.',

      'sec.map.label': 'Onde a ciência acontece',
      'sec.map.title': 'Mapa de Laboratórios de Genômica da África',
      'sec.map.desc': 'Mapa interativo de laboratórios de genômica ativos, centros de sequenciamento e hubs H3Africa em todo o continente.',

      'sec.ask.label': 'Tem uma pergunta?',
      'sec.ask.title': 'Pergunte ao OmicsLab',
      'sec.ask.desc': 'Pergunte qualquer coisa sobre fluxos de trabalho de ômicas, tecnologias de sequenciamento, genômica africana ou a própria plataforma.',

      'sec.changelog.label': 'Atualizações da plataforma',
      'sec.changelog.title': 'O que há de novo no OmicsLab',
      'sec.changelog.desc': 'Veja os últimos recursos, melhorias e conteúdos adicionados à plataforma.',
    },

    /* ════════════════════════════════ ARABIC (RTL) ════════════════════════════════ */
    ar: {
      /* Nav */
      'nav.workflows': 'سير العمل', 'nav.learn': 'تعلم',
      'nav.learn.diseases': 'الأمراض', 'nav.learn.journey': 'رحلة التعلم',
      'nav.learn.equipment': 'معرض المعدات', 'nav.learn.tools': 'مستكشف الأدوات',
      'nav.learn.pipeline': 'دليل المسار', 'nav.learn.hpc': 'تدريب الحوسبة الفائقة',
      'nav.learn.repos': 'المستودعات', 'nav.learn.curriculum': 'مسارات المنهج',
      'nav.learn.badges': 'الشارات والشهادات',
      'nav.research': 'البحث', 'nav.reprohub': 'مركز الاستنساخ',
      'nav.africahub': 'مركز أفريقيا', 'nav.workshop': 'ورشة عمل',
      'nav.map': 'خريطة', 'nav.ask': 'اسأل', 'nav.sandbox': 'البيئة التجريبية', 'nav.compare': 'قارن',
      'nav.search': 'بحث', 'nav.progress': 'تقدمي', 'nav.whats_new': 'ما الجديد',

      /* Hero */
      'hero.tagline': 'منصة تفاعلية للتدريب على علم الأوميكس',
      'hero.title1': 'تعلم سير', 'hero.title2': 'عمل الأوميكس',
      'hero.title3.accent': 'بالتطبيق', 'hero.title3.rest': '',
      'hero.desc': 'اسحب الكواشف، اضبط المعلمات، شاهد كيف يؤثر كل قرار مختبري على المسار في الوقت الفعلي. أكثر من 40 مرضًا · 14 سير عمل · 20 جهازًا حقيقيًا.',
      'hero.cta.start': '← ابدأ سير العمل', 'hero.cta.howit': 'كيف يعمل',

      /* Sections */
      'sec.domain.label': 'اختر تجربتك',
      'sec.domain.title': 'اختر مجال الأوميكس',
      'sec.domain.desc': 'يحتوي كل مجال على بروتوكولات واقعية مع اختيار تفاعلي للكواشف وضبط معلمات الأجهزة ولوحة تحكم في الجودة.',

      'sec.curriculum.label': 'رحلة تعلمك',
      'sec.curriculum.title': 'مسارات المنهج الدراسي',
      'sec.curriculum.desc': 'ثلاثة مسارات منظمة — عالم المختبر الرطب، عالم المعلوماتية الحيوية، وباحث الصحة العامة. اتبع الدروس بالترتيب واحصل على شهادة عند الإتمام.',

      'sec.disease.label': 'ماذا ندرس؟',
      'sec.disease.title': 'مستكشف الأمراض',
      'sec.disease.desc': 'يستهدف كل سير عمل في OmicsLab أمراضًا حقيقية. استكشف العلامات الحيوية المبحوث عنها والرؤى السريرية الناتجة.',

      'sec.learning.label': 'رحلة تعليمية كاملة',
      'sec.learning.title': 'طبقة تعلم الأمراض',
      'sec.learning.desc': 'اختر مرضًا وتابعه من العرض السريري إلى نوع العينة وخط أنابيب المعلوماتية الحيوية والتفسير.',

      'sec.research.label': 'صمم دراسة',
      'sec.research.title': 'وضع مشروع البحث',
      'sec.research.desc': 'نظّم مشروعًا قابلاً للتكرار: اختر مرضًا وسير عمل ومختبرًا شريكًا، ثم أجرِ دراسة محاكاة.',

      'sec.repro.label': 'علم الأوميكس القابل للتكرار',
      'sec.repro.title': 'مركز بيانات البحث وقابلية التكرار',
      'sec.repro.desc': 'قدِّم الدراسات مع البيانات الوصفية الكاملة واحصل على درجات فورية للتكرار والاكتمال وFAIR.',

      'sec.africa.label': 'علم الجينوم الأفريقي',
      'sec.africa.title': 'مركز العلوم الأفريقية',
      'sec.africa.desc': 'حوكمة البيانات، جينوميات السكان، مراقبة الصحة الواحدة، مواءمة المنح، وفرص التدريب الحقيقية.',

      'sec.workshop.label': 'درِّب مجموعتك',
      'sec.workshop.title': 'وضع ورشة العمل والمدرب',
      'sec.workshop.desc': 'أنشئ جلسة ورشة عمل، وشارك الرمز مع الطلاب، وتتبع إتمام جميع وحدات OmicsLab.',

      'sec.badges.label': 'إنجازاتك',
      'sec.badges.title': 'الشارات والشهادات',
      'sec.badges.desc': 'احصل على شارات بإكمال سير العمل ومسارات التعلم ومهام البحث. انقر على أي شارة محققة لإنشاء شهادة.',

      'sec.equipment.label': 'أجهزة العالم الحقيقي',
      'sec.equipment.title': 'معرض المعدات',
      'sec.equipment.desc': 'استكشف الأجهزة المستخدمة في مختبرات الأوميكس الحديثة — صور حقيقية ومواصفات وتقديرات تكلفة.',

      'sec.tools.label': 'مجموعة أدوات المعلوماتية الحيوية',
      'sec.tools.title': 'مستكشف الأدوات',
      'sec.tools.desc': 'أدوات معلوماتية حيوية حقيقية تُستخدم في كل خطوة — من ضبط الجودة إلى الإشراح.',

      'sec.pipeline.label': 'كيف يعمل التحليل فعلاً',
      'sec.pipeline.title': 'دليل خط أنابيب المعلوماتية الحيوية',
      'sec.pipeline.desc': 'اتبع سير عمل تسلسل DNA الكامل من ملفات FASTQ الخام إلى التفسير البيولوجي.',

      'sec.hpc.label': 'تشغيل التحليل على نطاق واسع',
      'sec.hpc.title': 'طبقة تدريب الحوسبة الفائقة الأداء',
      'sec.hpc.desc': 'تعلم جدولة وظائف SLURM وتحسين الموارد ومحركات سير العمل وخطوط الأنابيب المعبأة.',

      'sec.repos.label': 'أين تعيش البيانات',
      'sec.repos.title': 'مستودعات البيانات',
      'sec.repos.desc': 'تودع كل دراسة أوميكس بياناتها الخام في مستودع عام. تعرف على الأرشيفات الرئيسية وأيها أكثر أهمية للبحث الأفريقي.',

      'sec.map.label': 'أين يحدث العلم',
      'sec.map.title': 'خريطة مختبرات الجينوميات الأفريقية',
      'sec.map.desc': 'خريطة تفاعلية للمختبرات الجينومية النشطة ومراكز التسلسل وعقد H3Africa عبر القارة.',

      'sec.ask.label': 'لديك سؤال؟',
      'sec.ask.title': 'اسأل OmicsLab',
      'sec.ask.desc': 'اسأل أي شيء عن سير عمل الأوميكس وتقنيات التسلسل والجينوميات الأفريقية أو المنصة نفسها.',

      'sec.changelog.label': 'تحديثات المنصة',
      'sec.changelog.title': 'ما الجديد في OmicsLab',
      'sec.changelog.desc': 'شاهد أحدث الميزات والتحسينات والمحتوى المضاف إلى المنصة.',
    },
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
    ['changelog-section',        'sec.changelog'],
  ];

  /* ─── Apply translations ─── */
  function apply(lang) {
    _current = lang || 'en';
    try { localStorage.setItem(STORE_KEY, _current); } catch {}

    const dict = T[_current] || T.en;
    const langMeta = LANGS.find(l => l.code === _current) || LANGS[0];

    /* Set document language and direction */
    document.documentElement.lang = _current;
    document.documentElement.dir = langMeta.dir;

    /* Add/remove RTL class for CSS hooks */
    document.body.classList.toggle('lang-rtl', langMeta.dir === 'rtl');

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

    /* 3. Update dropdown state */
    const toggle = document.getElementById('i18n-toggle');
    if (toggle) {
      const btn = toggle.querySelector('.i18n-current');
      if (btn) btn.innerHTML = `${langMeta.flag} <span>${langMeta.label}</span> <span class="i18n-caret">▾</span>`;
      toggle.querySelectorAll('.i18n-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === _current);
      });
    }
  }

  function t(key) { return (T[_current] || T.en)[key] || key; }
  function current() { return _current; }

  /* ─── Init ─── */
  function init() {
    try { _current = localStorage.getItem(STORE_KEY) || 'en'; } catch {}

    /* Inject dropdown toggle into nav */
    const nav = document.getElementById('nav-pills-desktop');
    if (nav && !document.getElementById('i18n-toggle')) {
      const langMeta = LANGS.find(l => l.code === _current) || LANGS[0];
      const wrap = document.createElement('div');
      wrap.id = 'i18n-toggle';
      wrap.className = 'i18n-toggle-wrap';

      const options = LANGS.map(l =>
        `<button class="i18n-option${l.code === _current ? ' active' : ''}" data-lang="${l.code}"
           onclick="OmicsLab.I18n.apply('${l.code}');document.getElementById('i18n-toggle').classList.remove('open')"
           aria-label="${l.label}">
           <span class="i18n-opt-flag">${l.flag}</span>
           <span class="i18n-opt-label">${l.label}</span>
           ${l.code === _current ? '<span class="i18n-opt-check">✓</span>' : ''}
         </button>`
      ).join('');

      wrap.innerHTML = `
        <button class="i18n-current" aria-label="Language selector" aria-haspopup="listbox"
                onclick="this.closest('.i18n-toggle-wrap').classList.toggle('open')">
          ${langMeta.flag} <span>${langMeta.label}</span> <span class="i18n-caret">▾</span>
        </button>
        <div class="i18n-dropdown" role="listbox">${options}</div>`;

      /* Close on outside click */
      document.addEventListener('click', e => {
        if (!wrap.contains(e.target)) wrap.classList.remove('open');
      });

      nav.after(wrap);
    }

    apply(_current);
  }

  return { init, apply, t, current, LANGS };
})();
