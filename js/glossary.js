/* ═══════════════════════════════════════════════════════
   OmicsLab — Multilingual Bioinformatics Glossary (Part 5)
   200+ terms in English + Swahili + Hausa + Yoruba +
   Amharic + French. Searchable, categorised, offline.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Glossary = (function () {

  /* Terms: [English, category, definition, Swahili, Hausa, Yoruba, Amharic, French] */
  const TERMS = [
    /* Genomics */
    ['Genome','Genomics','The complete set of DNA in an organism, including all genes and non-coding sequences.','Jenomu','Genome / Jimlar kwayoyin halitta','Genome / Gbogbo àgbáyé-ẹ̀dá','ጂኖም','Génome'],
    ['Gene','Genomics','A segment of DNA that encodes a functional product (protein or RNA).','Jeni','Gene / Kwayar halitta','Jini / Apilẹṣẹ àbá','ጂን','Gène'],
    ['Variant','Genomics','A change in DNA sequence relative to a reference genome.','Varanti / Tofauti ya DNA','Bambanci na DNA','Iyatọ DNA','ቫርያንት','Variant génomique'],
    ['SNP','Genomics','Single Nucleotide Polymorphism — a single base pair change at a specific position.','SNP / Tofauti moja ya nukleotidi','SNP / Canjin nucleotide guda ɗaya','SNP / Iyípadà nùkliótídì kan','ነጠላ ኑክሊዮታይድ ፖሊሞርፊዝም','SNP — Polymorphisme nucléotidique simple'],
    ['Mutation','Genomics','A permanent alteration in the DNA sequence that may or may not affect function.','Mabadiliko ya DNA','Maye gurbi','Ìyípadà DNA','ሚውቴሽን','Mutation'],
    ['Allele','Genomics','One of two or more versions of a gene or DNA sequence at a given locus.','Aleli','Allele / Juyin halitta','Àlẹlì','አሌሌ','Allèle'],
    ['Locus','Genomics','The specific physical position of a gene or DNA sequence on a chromosome.','Eneo la gene kwenye kromosomu','Wurin gene a chromosome','Ipò jìn-ì-nú gene','ሎከስ','Locus génomique'],
    ['Haplotype','Genomics','A set of DNA variations inherited together as a unit.','Haplotaipu','Haplotaipu / Tsarin kwayoyin halitta','Àwọn ìyatọ DNA tí a jogún papọ̀','ሃፕሎታይፕ','Haplotype'],
    ['Heterozygous','Genomics','Having two different alleles at a given locus (one on each chromosome).','Heterozigoasi — alleli tofauti mbili','Heterozygous — allele daban-daban biyu','Heterozygous — àlẹlì méjì tó yàtọ̀','ሄቴሮዚጎስ','Hétérozygote'],
    ['Homozygous','Genomics','Having two identical alleles at a given locus.','Homozigoasi — alleli zinazofanana','Homozygous — allele ɗaya biyu','Homozygous — àlẹlì méjì tó jọra','ሆሞዚጎስ','Homozygote'],
    /* Sequencing */
    ['Whole Genome Sequencing','Sequencing','Determining the complete DNA sequence of an organism\'s genome.','Upigaji wa msimbo kamili wa jenomu','Tsarin dukan genome / WGS','Ìtọ̀jú gbogbo jìnì DNA','ሙሉ ጂኖም ሲኩዌንሲንግ','Séquençage du génome entier (WGS)'],
    ['RNA-seq','Sequencing','High-throughput sequencing of RNA to measure gene expression.','Upigaji msimbo wa RNA','Tsarin RNA / RNA-seq','RNA-seq / Ìṣàwárí ìsọ̀nà RNA',' RNA ሲኩዌንሲንግ','Séquençage ARN (RNA-seq)'],
    ['FASTQ','Sequencing','A file format containing raw sequencing reads and their quality scores.','Faili la FASTQ — mfumo wa data mbichi za upigaji msimbo','Filen FASTQ — bayanan DNA','FASTQ — Fáìlì àbájáde ìtọ̀jú DNA','FASTQ ፋይል','Fichier FASTQ'],
    ['BAM','Sequencing','Binary Alignment Map — file format for aligned sequencing reads.','BAM — mfumo wa faili ya DNA iliyopangwa','Filen BAM — bayanan DNA da aka shimfida','BAM — Fáìlì àwọn DNA tí a ṣètọ̀','BAM ፋይል','Fichier BAM (alignement binaire)'],
    ['VCF','Sequencing','Variant Call Format — file format listing genomic variants.','VCF — mfumo wa orodha ya tofauti za DNA','Filen VCF — jerin bambance-bambancen DNA','VCF — Fáìlì àkójọ ìyatọ DNA','ቪሲኤፍ ፋይል','Fichier VCF (format d\'appel de variants)'],
    ['Read depth','Sequencing','The number of times a specific nucleotide is read during sequencing.','Kina cha usomaji — mara ngapi eneo moja linasomwa','Zurfin karatu — sau nawa aka karanta wuri guda','Ijinlẹ ìkàwé — ọ̀pọ̀lọpọ̀ ìgbà tí wọ́n ka àyè kan','የንባብ ጥልቀት','Profondeur de lecture / couverture'],
    ['Coverage','Sequencing','Average read depth across a genome region.','Kiwango cha ufunikaji wa jenomu','Rufi / Daidaita karatun genome','Ìbò genome / Ìtọ̀jú apapọ̀','ሽፋን / ኮቬሬጅ','Couverture génomique'],
    ['Paired-end sequencing','Sequencing','Sequencing both ends of a DNA fragment to improve alignment accuracy.','Upigaji msimbo wa miisho miwili','Tsarin duka gefuna biyu na DNA','Ìtọ̀jú àárọ̀ méjìlẹ fọ́fọ́ DNA','ፔርድ-ኤንድ ሲኩዌንሲንግ','Séquençage pairé (paired-end)'],
    ['Long-read sequencing','Sequencing','Sequencing technology producing reads >10,000 bp (e.g. Oxford Nanopore, PacBio).','Upigaji msimbo wa maandishi marefu (ONT, PacBio)','Tsarin dogon karatu (ONT, PacBio)','Ìtọ̀jú ìka gígùn (Nanopore, PacBio)','ረጅም-ሪድ ሲኩዌንሲንግ','Séquençage longues lectures'],
    /* Alignment & Assembly */
    ['Alignment','Analysis','The process of mapping sequencing reads to a reference genome.','Upangaji — kufanisha msimbo wa DNA na jenomu ya rejea','Shimfida DNA da kwatankwacin genome','Ìfiwéra — ìṣètọ DNA mọ genome àbájáde','አሊይንሜንት / ማቀናጀት','Alignement génomique'],
    ['Reference genome','Analysis','A representative DNA sequence used as a standard for alignment.','Jenomu ya rejea — muundo wa kawaida wa DNA','Kwatankwacin genome — tsarin DNA na yau da kullum','Genome àwákọ̀ — ìtọ́kasí DNA','የማጣቀሻ ጂኖም','Génome de référence'],
    ['Assembly','Analysis','Reconstructing the complete genome from sequencing reads.','Ukusanyikaji — kujenga jenomu kutoka kwa vipande vya DNA','Haɗa DNA guda-guda zuwa cikakken genome','Àkójọpọ̀ DNA — ṣíṣẹ̀dá genome pipe','ጂኖም አሴምብሊ','Assemblage génomique'],
    ['BWA-MEM','Tools','Burrows-Wheeler Aligner — widely used tool for aligning reads to a reference.','Chombo cha kupanga DNA — BWA-MEM','Kayan aikin BWA-MEM na shimfida DNA','Irinṣẹ BWA-MEM fún ìfiwéra DNA','BWA-MEM ቁሳቁስ','Outil d\'alignement BWA-MEM'],
    ['GATK','Tools','Genome Analysis Toolkit — industry-standard variant calling software.','Chombo cha GATK cha kutambua tofauti za DNA','Kayan aikin GATK na gano bambance-bambance DNA','Irinṣẹ GATK fún ìdámọ̀ ìyatọ DNA','GATK ሶፍትዌር','Logiciel GATK (génomique)'],
    /* Population genetics */
    ['GWAS','Population Genetics','Genome-Wide Association Study — scanning the genome to find variants associated with traits.','GWAS — utafiti wa uhusiano kati ya DNA na sifa','GWAS — bincike kan alakar DNA da halaye','GWAS — Ìwádìí àjọpọ̀ genome-aláwọ̀','ጂኦምዋይድ አሶሲዬሽን ስተዲ','GWAS — Étude d\'association pangénomique'],
    ['Population stratification','Population Genetics','Differences in allele frequencies between sub-populations that can confound genetic studies.','Mgawaniko wa idadi ya watu kwa DNA','Rarrabuwar yawan jama\'a ta DNA','Ìpínsíwájú àwùjọ ènìyàn nípasẹ̀ DNA','የህዝብ ስትራቲፊኬሽን','Stratification de population'],
    ['Linkage disequilibrium','Population Genetics','Non-random association of alleles at different loci in a population.','Uhusiano usio wa nasibu wa alleli katika idadi ya watu','Haɗin allele maras allo a cikin yawan jama\'a','Àjọpọ̀ àlẹlì tí kò ní ìpìlẹ̀ nínú àwùjọ','ሊንኬጅ ዲስኢኩሊብሪየም','Déséquilibre de liaison (LD)'],
    ['Principal Component Analysis','Population Genetics','Statistical method to identify major axes of variation in genetic data.','PCA — njia ya takwimu kuonyesha mwelekeo mkuu wa tofauti za DNA','PCA — hanyar kidaya ta bambanta nau\'o\'in DNA','PCA — Ọ̀nà ìṣirò fún ìdámọ̀ ìyatọ DNA','ፕሪንሲፓል ኮምፖነንት አናሊሲስ','Analyse en composantes principales (ACP)'],
    ['ADMIXTURE','Population Genetics','Software for estimating ancestry proportions from SNP genotype data.','ADMIXTURE — programu ya kukadiria asili za idadi ya watu','ADMIXTURE — software na ƙididdige zuriya','ADMIXTURE — Sọfitiwia fún ìṣirò ìpilẹ̀ẹ̀lẹ̀ ènìyàn','አድሚክቸር ሶፍትዌር','Logiciel ADMIXTURE (ancestralité)'],
    ['African Genome Variation Project','Population Genetics','Resource characterising genetic diversity in African populations.','Mradi wa Tofauti za Jenomu ya Afrika','Shirin Tofauti na Genome na Afrika','Ètò Ìyatọ Genome Áfríkà','የአፍሪካ ጂኖም ቫርያሽን ፕሮጀክት','Projet de variation du génome africain'],
    /* Disease genomics */
    ['ACMG criteria','Clinical Genomics','American College of Medical Genetics criteria for classifying variant pathogenicity.','Vigezo vya ACMG vya kuainisha hatari ya varanti','Ma\'aunin ACMG na rarraba cutarwa ta DNA','Ìlànà ACMG fún ìpínlẹ̀ ewu ìyatọ DNA','ACMG መስፈርቶች','Critères ACMG (classification des variants)'],
    ['Pathogenic variant','Clinical Genomics','A variant that causes or significantly increases risk of a disease.','Varanti inayosababisha ugonjwa','Bambanci na DNA wanda ke haifar da cuta','Ìyatọ DNA tí ó máa ń fa àìsàn','ፓቶጀኒክ ቫርያንት','Variant pathogène'],
    ['Benign variant','Clinical Genomics','A variant that does not cause disease.','Varanti isiyo na hatari','Bambanci maras cuta','Ìyatọ DNA tí kò máa ń fa àìsàn','ቤናይን ቫርያንት','Variant bénin'],
    ['ClinVar','Databases','NCBI database of human genetic variants and their clinical significance.','Hifadhidata ya ClinVar ya tofauti za DNA na umuhimu wao wa kliniki','Database na ClinVar na bambance-bambancen DNA','Ibi-ipamọ ClinVar fún ìyatọ DNA','ክሊንቫር ዳታቤዝ','Base de données ClinVar'],
    ['gnomAD','Databases','Genome Aggregation Database — largest public catalogue of human genetic variation.','Hifadhidata ya gnomAD ya tofauti za DNA za wanadamu','Database na gnomAD na bambance-bambancen DNA na ɗan adam','Ibi-ipamọ gnomAD fún ìyatọ DNA ènìyàn','ግኖምAD ዳታቤዝ','Base de données gnomAD'],
    /* Tools */
    ['Bioinformatics','Tools','Application of computational methods to analyse biological data.','Baiolojia ya kompyuta — uchambuzi wa data ya kibiolojia','Kimiyyar kwamfuta ta ilmin halitta','Ìmọ̀ ẹ̀rọ kọ̀mpútà fún ìmọ̀ ẹ̀dá alààyè','ባዮኢንፎርማቲክስ','Bioinformatique'],
    ['Pipeline','Tools','A series of computational steps executed sequentially to process omics data.','Mfululizo wa hatua za kompyuta za kuchakata data','Jerin matakan kwamfuta na sarrafa bayanan omics','Jẹjẹ ìgbésẹ kọ̀mpútà fún ìṣàwárí data omics','ፒፕላይን / ቢዮኢንፎ ፓይፕላይን','Pipeline bioinformatique'],
    ['Nextflow','Tools','Workflow management system for reproducible and scalable bioinformatics pipelines.','Nextflow — mfumo wa usimamizi wa mtiririko wa bioinformatics','Nextflow — tsarin gudanar da aiki na bioinformatics','Nextflow — Sọfitiwia fún ìṣàkóso àwọn ìgbésẹ bioinformatics','ኔክስትፍሎ ሶፍትዌር','Logiciel de workflow Nextflow'],
    ['Docker','Tools','Software containerisation platform for reproducible bioinformatics environments.','Docker — jukwaa la kontena za programu','Docker — dandamalin kuruwa na software','Docker — Ilé ẹ̀rọ apoti sọfitiwia','ዶከር ቀርንጫፍ','Logiciel de conteneurisation Docker'],
    ['R / Bioconductor','Tools','Statistical programming language and package ecosystem for genomics analysis.','R / Bioconductor — lugha ya takwimu na mifumo ya genomics','R / Bioconductor — harshen kidaya na kayan aikin genomics','R / Bioconductor — Èdè ìṣirò fún ìmọ̀-jinlẹ̀ genomics','R / ባዮኮንዳክተር','R / Bioconductor — Langage statistique pour la génomique'],
    ['Python','Tools','General-purpose programming language widely used in bioinformatics.','Python — lugha ya programu inayotumiwa sana katika bioinformatics','Python — harshen shirye-shirye da ake amfani da shi a bioinformatics','Python — Èdè ìṣèfilọ́ tí wọ́n lò nínú bioinformatics','ፓይዘን ፕሮግራሚንግ','Python — Langage de programmation'],
    /* Statistics */
    ['p-value','Statistics','The probability of observing results as extreme as the data if the null hypothesis is true.','Thamani ya p — uwezekano wa matokeo kama data yetu chini ya nadharia tupu','Darajar p — yiwuwar samun sakamakon kamar bayananmu','Iye p — Ìṣeéṣe ìwádìí bíi èyí lábẹ́ àbá-ìsọ̀rọ̀','ፒ-ቫልዩ','Valeur p (p-value)'],
    ['Bonferroni correction','Statistics','Multiple testing correction that adjusts the significance threshold by the number of tests.','Marekebisho ya Bonferroni — kurekebisha kiwango cha umuhimu','Gyaran Bonferroni — daidaita ƙofar muhimmanci','Àtúnṣe Bonferroni — ìṣàtúnṣe ìpẹ̀yẹmọ omics','ቦንፌሮኒ ኮሬክሽን','Correction de Bonferroni'],
    ['Odds ratio','Statistics','Measure of association between exposure and outcome in a case-control study.','Uwiano wa nafasi — kipimo cha uhusiano kati ya mfiduo na matokeo','Rabo na yuwuwar — ma\'aunin dangantaka tsakanin abubuwan bayyanawa da sakamako','Ìwọ̀n iṣẹlẹ àjọpọ̀ — OR','ኦድስ ሬሾ','Rapport de cotes (OR)'],
    /* Wet lab */
    ['PCR','Wet Lab','Polymerase Chain Reaction — technique to amplify specific DNA sequences.','PCR — mbinu ya kuongeza mfululizo maalum wa DNA','PCR — hanyar haɓaka jerin DNA','PCR — Ọ̀nà àmúpọ̀ DNA pàtó','PCR / ፖሊሜሬዝ ቼይን ሪአክሽን','PCR — Réaction en chaîne par polymérase'],
    ['DNA extraction','Wet Lab','The process of isolating DNA from biological samples.','Uchimbaji wa DNA kutoka kwa sampuli za kibiolojia','Tsarin raba DNA daga samfurori na ilmin halitta','Ìsọ̀nà DNA — Ìyọ̀ DNA kúrò nínú àwọn àpẹẹrẹ','ዲኤንኤ ኤክስትራክሽን','Extraction d\'ADN'],
    ['Library preparation','Wet Lab','Converting DNA/RNA into sequencing-ready fragments with adapters.','Utayarishaji wa maktaba — kutayarisha DNA/RNA kwa upigaji msimbo','Shirye-shiryen ɗakin karatu — shirya DNA/RNA don tsarawa','Ìgbìmọ̀ ohun-ìkọ́ — ṣíṣe àmúlò DNA/RNA','ላይብረሪ ፕሬፓሬሽን','Préparation de bibliothèque'],
    ['Illumina','Wet Lab','Leading sequencing platform using sequencing-by-synthesis chemistry.','Illumina — jukwaa kuu la upigaji msimbo','Illumina — dandamalin tsarawa na yau da kullum','Illumina — Ẹ̀rọ ìtọ̀jú DNA adíwà','ኢሉሚና','Illumina — Plateforme de séquençage'],
    /* African specific */
    ['H3Africa','Africa & Consortia','The Human Heredity and Health in Africa consortium — largest African genomics network.','H3Africa — muungano mkubwa wa genomics barani Afrika','H3Africa — hadin gwiwar genomics mafi girma a Afirka','H3Africa — Àjọ ìmọ̀ genomics tó tóbi jùlọ ní Áfríkà','H3አፍሪካ','H3Africa — Principal consortium de génomique africaine'],
    ['AWI-Gen','Africa & Consortia','African Wits-INDEPTH Partnership for Genomic Studies — multi-site African GWAS cohort.','AWI-Gen — ushirika wa utafiti wa GWAS katika Afrika','AWI-Gen — hadin gwiwar bincike na GWAS a Afirka','AWI-Gen — Àjọpọ̀ ìwádìí GWAS ní Áfríkà','AWI-ጂን','AWI-Gen — Cohorte GWAS multi-sites africaine'],
    ['MalariaGEN','Africa & Consortia','Malaria Genomic Epidemiology Network — global consortium for malaria genomics.','MalariaGEN — mtandao wa kimataifa wa genomics ya malaria','MalariaGEN — hadin gwiwar duniya na genomics malaria','MalariaGEN — Ẹ̀gbọ́n àgbáyé fún genomics ibà','ማሊርያጄን','MalariaGEN — Réseau mondial de génomique du paludisme'],
    ['SARS-CoV-2','Pathogens','The coronavirus that causes COVID-19, studied extensively in Africa via genomic surveillance.','SARS-CoV-2 — virusi inayosababisha COVID-19','SARS-CoV-2 — ƙwayar cuta da ke haifar da COVID-19','SARS-CoV-2 — Kòkòrò àrùn COVID-19','ሳርስ-ኮቪ-2','SARS-CoV-2 — Coronavirus responsable du COVID-19'],
    ['Sickle cell disease','Pathogens','Genetic blood disorder caused by HBB p.Glu7Val; highly prevalent in sub-Saharan Africa.','Ugonjwa wa seli mundu — unaosababishwa na mabadiliko ya HBB','Cutar sel siriri — ta samo asali daga maye gurbi HBB','Àrùn sẹ́ẹ̀lì aládàpọ̀ — àbùdá HBB','ሲኬል ሴል ዲዚዝ','Drépanocytose — due à la mutation HBB'],
    ['G6PD deficiency','Pathogens','Genetic enzyme deficiency that provides partial protection against malaria but causes haemolysis.','Upungufu wa G6PD — ulinzi dhidi ya malaria lakini husababisha uharibifu wa damu','Raunin G6PD — kariya daga malaria amma yana haifar da lalacewar jini','Àìpé G6PD — àabo lodi ibà ṣùgbọ́n ó máa ń fa ìjàǹbá ẹ̀jẹ̀','G6PD ዲፊሽየንሲ','Déficit en G6PD'],
    /* More stats and ML */
    ['Machine learning','ML & AI','Algorithms that learn patterns from data without being explicitly programmed.','Ujifunzaji wa mashine — algoriti zinazojifunza mifumo kutoka kwa data','Koyon injina — algorithms din na koyon tsare-tsare daga bayanan','Ìkọ́ ẹ̀rọ — Algoritimu tí ó máa ń kọ́ àwọn àpẹẹrẹ','ማሽን ለርኒንግ','Apprentissage automatique (machine learning)'],
    ['Random forest','ML & AI','Ensemble learning method using many decision trees for classification or regression.','Msitu wa nasibu — njia ya ujifunzaji ya pamoja kwa uainishaji','Gandun daji na nasibu — hanyar ƙungiyar koyo na rarraba','Igbó ìrékọjá — Ọ̀nà ìkọ́ ẹ̀rọ fún ìpínlẹ̀','ራንደም ፎሬስት','Forêt aléatoire (random forest)'],
  ];

  let _visibleLang = ['en','sw','ha'];

  function _renderLangToggle() {
    const langs = [['en','English'],['sw','Swahili'],['ha','Hausa'],['yo','Yoruba'],['am','Amharic'],['fr','French']];
    return langs.map(([code, label], i) => `
      <label class="gl-lang-opt">
        <input type="checkbox" value="${code}" ${_visibleLang.includes(code) ? 'checked' : ''} onchange="OmicsLab.Glossary._toggleLang('${code}')">
        ${label}
      </label>`).join('');
  }

  function _toggleLang(code) {
    if (_visibleLang.includes(code)) _visibleLang = _visibleLang.filter(l => l !== code);
    else _visibleLang.push(code);
    _filter();
  }

  const LANG_COLS = { en:0, sw:3, ha:4, yo:5, am:6, fr:7 };

  function _filter() {
    const q = (document.getElementById('gl-q')?.value || '').toLowerCase();
    const cat = document.getElementById('gl-cat')?.value || '';
    const terms = TERMS.filter(t => {
      const txt = t.join(' ').toLowerCase();
      return (!q || txt.includes(q)) && (!cat || t[1] === cat);
    });
    _render(terms);
  }

  function _render(terms) {
    const list = document.getElementById('gl-list');
    if (!list) return;
    if (!terms.length) { list.innerHTML = '<div class="gl-empty">No terms found.</div>'; return; }
    list.innerHTML = terms.map(t => {
      const translations = _visibleLang.filter(l => l !== 'en').map(l => {
        const val = t[LANG_COLS[l]];
        const label = { sw:'Swahili', ha:'Hausa', yo:'Yoruba', am:'Amharic', fr:'French' }[l];
        return val ? `<div class="gl-translation"><span class="gl-lang-badge">${label}</span><span class="gl-trans-text">${val}</span></div>` : '';
      }).join('');
      const catColor = { Genomics:'#00C4A0', Sequencing:'#58a6ff', Analysis:'#e3b341', Tools:'#bc8cff', Statistics:'#f97316', 'Wet Lab':'#ff6b6b', 'Population Genetics':'#58a6ff', 'Clinical Genomics':'#ff6b6b', Databases:'#A8A098', 'Africa & Consortia':'#f97316', Pathogens:'#ff6b6b', 'ML & AI':'#bc8cff' }[t[1]] || '#354060';
      return `<div class="gl-card">
        <div class="gl-card-hdr">
          <span class="gl-term">${t[0]}</span>
          <span class="gl-cat-badge" style="color:${catColor};border-color:${catColor}30">${t[1]}</span>
        </div>
        <div class="gl-definition">${t[2]}</div>
        ${_visibleLang.includes('en') ? '' : ''}
        ${translations}
      </div>`;
    }).join('');
  }

  function init() {
    const section = document.getElementById('glossary-section');
    if (!section || section.dataset.glReady) return;
    section.dataset.glReady = '1';
    const cats = [...new Set(TERMS.map(t => t[1]))].sort();
    section.innerHTML = `
      <div class="gl-wrap">
        <div class="gl-header">
          <div class="gl-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Multilingual Bioinformatics Glossary
          </div>
          <div class="gl-header-sub">${TERMS.length} terms · English, Swahili, Hausa, Yoruba, Amharic, French · Fully offline</div>
        </div>
        <div class="gl-controls">
          <input class="gl-search" id="gl-q" placeholder="Search terms..." oninput="OmicsLab.Glossary._filter()">
          <select class="gl-cat-filter" id="gl-cat" onchange="OmicsLab.Glossary._filter()">
            <option value="">All categories</option>
            ${cats.map(c => `<option>${c}</option>`).join('')}
          </select>
          <button class="gl-flashcard-btn" onclick="OmicsLab.Glossary.openFlashcards()" title="Flashcard mode (F)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            Flashcards
          </button>
        </div>
        <div class="gl-lang-row">
          <span class="gl-lang-label">Show languages:</span>
          ${_renderLangToggle()}
        </div>
        <div id="gl-list" class="gl-list"></div>
      </div>`;
    _filter();
  }

  /* ── Flashcard mode ── */
  function openFlashcards() {
    const cat = document.getElementById('gl-cat')?.value || '';
    const q   = (document.getElementById('gl-q')?.value || '').toLowerCase();
    let pool  = TERMS.filter(t => {
      const txt = t.join(' ').toLowerCase();
      return (!q || txt.includes(q)) && (!cat || t[1] === cat);
    });
    if (!pool.length) pool = [...TERMS];
    pool = pool.sort(() => Math.random() - .5);

    let idx = 0; let flipped = false;

    let overlay = document.getElementById('gl-fc-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'gl-fc-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(1,4,9,.88);z-index:8000;display:flex;align-items:center;justify-content:center;padding:1rem';
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      document.body.appendChild(overlay);
    }

    function render() {
      const t = pool[idx];
      const catColor = { Genomics:'#00C4A0', Sequencing:'#58a6ff', Analysis:'#e3b341', Tools:'#bc8cff', Statistics:'#f97316', 'Wet Lab':'#ff6b6b', 'Population Genetics':'#58a6ff', 'Clinical Genomics':'#ff6b6b', Databases:'#A8A098', 'Africa & Consortia':'#f97316', Pathogens:'#ff6b6b', 'ML & AI':'#bc8cff' }[t[1]] || '#A8A098';
      overlay.innerHTML = `
        <div style="background:#111B2E;border:1px solid #243048;border-radius:16px;padding:1.75rem;max-width:520px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,.7);text-align:center">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
            <span style="font-size:.72rem;color:#A8A098">${idx+1} / ${pool.length}</span>
            <span style="font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${catColor};border:1px solid ${catColor}30;border-radius:999px;padding:.1rem .6rem">${t[1]}</span>
            <button onclick="document.getElementById('gl-fc-overlay').remove()" style="background:none;border:none;color:#A8A098;cursor:pointer;font-size:1.1rem">×</button>
          </div>
          <div id="gl-fc-card" style="min-height:140px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:.75rem;background:#0D1524;border-radius:12px;padding:2rem;border:2px solid ${catColor}22;margin-bottom:1.25rem;transition:all .15s" onclick="OmicsLab.Glossary._fcFlip()">
            ${flipped ? `
              <div style="font-size:.72rem;color:#A8A098;letter-spacing:.06em;text-transform:uppercase;margin-bottom:.25rem">Definition</div>
              <div style="font-size:.95rem;color:#E4DDD2;line-height:1.6">${t[2]}</div>
              ${t[3] ? `<div style="font-size:.78rem;color:#00C4A0;margin-top:.5rem">Swahili: <em>${t[3]}</em></div>` : ''}
            ` : `
              <div style="font-size:.72rem;color:#A8A098;letter-spacing:.06em;text-transform:uppercase;margin-bottom:.25rem">Term</div>
              <div style="font-size:1.75rem;font-weight:800;color:#E4DDD2">${t[0]}</div>
              <div style="font-size:.72rem;color:#354060;margin-top:.25rem">tap to reveal</div>
            `}
          </div>
          <div style="display:flex;justify-content:center;gap:.75rem">
            <button onclick="OmicsLab.Glossary._fcNav(-1)" style="background:#182236;border:1px solid #243048;color:#A8A098;border-radius:8px;padding:.45rem 1rem;cursor:pointer;font-size:.82rem" ${idx===0?'disabled':''}>← Prev</button>
            <button onclick="OmicsLab.Glossary._fcFlip()" style="background:#bc8cff22;border:1px solid #bc8cff55;color:#bc8cff;border-radius:8px;padding:.45rem 1rem;cursor:pointer;font-size:.82rem">${flipped?'Show Term':'Flip'}</button>
            <button onclick="OmicsLab.Glossary._fcNav(1)" style="background:#182236;border:1px solid #243048;color:#A8A098;border-radius:8px;padding:.45rem 1rem;cursor:pointer;font-size:.82rem">Next →</button>
          </div>
          <div style="margin-top:1rem;font-size:.68rem;color:#354060">Press ← → to navigate · Esc to close</div>
        </div>`;
    }

    /* Expose state manipulation for buttons */
    window._glFC = {
      nav: (dir) => {
        idx = Math.min(pool.length - 1, Math.max(0, idx + dir));
        flipped = false;
        render();
      },
      flip: () => { flipped = !flipped; render(); },
    };

    /* Keyboard nav */
    function _onKey(e) {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', _onKey); }
      if (e.key === 'ArrowRight') window._glFC.nav(1);
      if (e.key === 'ArrowLeft')  window._glFC.nav(-1);
      if (e.key === ' ') { e.preventDefault(); window._glFC.flip(); }
    }
    document.addEventListener('keydown', _onKey);
    render();
  }

  function _fcFlip() { window._glFC?.flip(); }
  function _fcNav(dir) { window._glFC?.nav(dir); }

  return { init, _filter, _toggleLang, openFlashcards, _fcFlip, _fcNav };
})();
