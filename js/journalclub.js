/* ═══════════════════════════════════════════════════════════════
   OmicsLab — African Genomics Journal Club (Prompt 16)
   60+ landmark papers with plain-language summaries, key figures,
   workflow links, and discussion questions. Fully offline.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.JournalClub = (function () {

  const PAPERS = [
    /* ═══ SARS-CoV-2 / COVID-19 ═══ */
    {
      id: 'omicron-2021',
      title: 'Emergence of a novel SARS-CoV-2 variant of concern, Omicron',
      authors: 'Viana R, Moyo S, Amoako DG, et al.',
      journal: 'Nature', year: 2021, doi: '10.1038/s41586-022-04411-y',
      category: 'Viral Genomics',
      tags: ['SARS-CoV-2', 'Omicron', 'WGS', 'South Africa', 'Variant surveillance'],
      impact: 'Foundational',
      summary: 'First full genomic characterisation of Omicron BA.1 from South Africa. The KRISP/NGS-SA team showed Omicron had an unprecedented 50+ mutations, including 32 in the spike protein — explaining immune escape. This paper triggered global travel restrictions within 72 hours of posting and reshaped pandemic response globally.',
      plainLanguage: 'Scientists in South Africa noticed a new COVID-19 variant spreading fast in November 2021. They sequenced its genome and found it had more changes (mutations) than any previous variant — especially in the spike protein the virus uses to enter cells. These changes meant it could partially dodge immunity from vaccines and past infection. This discovery gave the world early warning to prepare, and the paper became one of the most cited in pandemic history.',
      keyFinding: 'Omicron had 50+ mutations vs Wuhan reference, 32 in spike alone. First detected in Tshwane district, Gauteng.',
      methodology: 'Whole Genome Sequencing (Illumina NovaSeq) → phylogenetic analysis → spike protein structural modelling',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'Demonstrates the global impact of African genomic surveillance capacity. South Africa\'s NGS-SA network built during COVID-19 became a world-leading public health genomics system.',
      discussionQ: ['Why did Omicron emerge with so many mutations at once? What biological conditions favour this?', 'How did this paper change global pandemic policy within days of posting? What does this tell us about genomic surveillance value?', 'If NGS-SA did not exist, how much later might Omicron have been detected globally?'],
    },
    {
      id: 'ngssa-2022',
      title: 'Network for Genomic Surveillance in South Africa — lessons for Africa',
      authors: 'Msomi N, Lessells R, Mlisana K, de Oliveira T.',
      journal: 'Science', year: 2022, doi: '10.1126/science.abn8197',
      category: 'Genomic Surveillance',
      tags: ['NGS-SA', 'Surveillance', 'South Africa', 'Infrastructure', 'COVID-19'],
      impact: 'High',
      summary: 'Describes how South Africa built its national SARS-CoV-2 genomic surveillance network from scratch during the pandemic, sequencing >10,000 genomes. Key lessons for building sustainable genomic surveillance capacity across Africa.',
      plainLanguage: 'This paper explains how South Africa built a national network of genomics laboratories that worked together during COVID-19 to sequence the virus and track its mutations. The network detected Omicron and the Delta variant early. The authors share lessons learned so other African countries can build similar systems.',
      keyFinding: 'Surveillance requires pre-built infrastructure, national coordination, and open data sharing — not just sequencing machines.',
      methodology: 'Descriptive analysis of surveillance network operations, sequencing throughput, and phylogenetic monitoring',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'A blueprint for national genomic surveillance programmes across Africa. Directly informed Africa CDC\'s continental genomics strategy.',
      discussionQ: ['What are the three most important factors for building a genomic surveillance network in a resource-limited setting?', 'How should sequencing capacity be distributed — centralised in one national lab or distributed across regions?'],
    },

    /* ═══ TB GENOMICS ═══ */
    {
      id: 'tb-lineages-2022',
      title: 'The genomic epidemiology of tuberculosis in Africa',
      authors: 'Comas I, Coscolla M, Luo T, et al. (CRyPTIC Consortium)',
      journal: 'Nature Genetics', year: 2013, doi: '10.1038/ng.2744',
      category: 'Bacterial Genomics',
      tags: ['TB', 'M. tuberculosis', 'WGS', 'Phylogenomics', 'Lineages', 'Africa'],
      impact: 'Foundational',
      summary: 'Defined the global phylogenetic lineages of M. tuberculosis and traced its spread from Africa with the movement of Homo sapiens out of Africa 70,000 years ago. Showed TB evolved in Africa and accompanied human migration globally.',
      plainLanguage: 'By comparing the DNA of thousands of TB bacteria from across the world, scientists found that TB is as old as modern humans — it evolved in Africa and spread with us as we migrated to other continents. This is why different parts of the world have different strains (lineages) of TB. Understanding these family trees helps us track outbreaks and design better drugs.',
      keyFinding: 'M. tuberculosis phylogenetic lineages correspond to human migration routes out of Africa. African strains are the most ancestral.',
      methodology: 'Core genome SNP phylogenetics · Bayesian molecular clock · comparative genomics',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'Africa harbours the most ancestral and diverse TB lineages. West African Lineages 5 and 6 are unique to Africa and diverge earliest.',
      discussionQ: ['Why does M. tuberculosis diversity reflect human migration patterns? What does this tell us about the co-evolution of humans and their pathogens?', 'How would you design a drug that works across all TB lineages given this diversity?'],
    },
    {
      id: 'xdr-tb-kwazulu',
      title: 'Extensively drug-resistant tuberculosis as a cause of death in patients co-infected with TB and HIV in a rural area of South Africa',
      authors: 'Gandhi NR, Moll A, Sturm AW, et al.',
      journal: 'Lancet', year: 2006, doi: '10.1016/S0140-6736(06)69573-1',
      category: 'Bacterial Genomics',
      tags: ['XDR-TB', 'HIV', 'South Africa', 'KwaZulu-Natal', 'Drug resistance', 'MDR-TB'],
      impact: 'Foundational',
      summary: 'First description of XDR-TB as a clinical syndrome. In Tugela Ferry, KwaZulu-Natal, 52 of 53 patients with XDR-TB died within weeks. All had HIV co-infection. This paper created the modern classification of XDR-TB and led to emergency WHO action.',
      plainLanguage: 'Doctors at a rural hospital in South Africa found a deadly new form of tuberculosis that resisted all available antibiotics. Almost all of the 53 patients identified died quickly, and all had HIV. This was the first time doctors realised TB could evolve to beat every drug we had. The WHO called an emergency meeting and created new rules for classifying and treating this type of TB.',
      keyFinding: '52/53 XDR-TB patients died in median 16 days. Nosocomial transmission confirmed. All HIV-positive.',
      methodology: 'Drug susceptibility testing · epidemiological investigation · molecular genotyping (IS6110 RFLP)',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'Tugela Ferry, KwaZulu-Natal — epicentre of the global XDR-TB crisis. HIV-TB co-infection in sub-Saharan Africa created conditions for resistance amplification.',
      discussionQ: ['How does HIV co-infection accelerate TB drug resistance evolution?', 'What infection control measures should have been in place? Why weren\'t they?', 'How has WGS changed our ability to detect XDR-TB outbreaks compared to the methods used in 2006?'],
    },

    /* ═══ MALARIA GENOMICS ═══ */
    {
      id: 'malariaGEN-2021',
      title: 'Genomic epidemiology of artemisinin-resistant Plasmodium falciparum',
      authors: 'Miotto O, et al. (MalariaGEN Consortium)',
      journal: 'eLife', year: 2020, doi: '10.7554/eLife.60772',
      category: 'Parasite Genomics',
      tags: ['Malaria', 'Plasmodium falciparum', 'Artemisinin', 'Resistance', 'WGS', 'kelch13'],
      impact: 'High',
      summary: 'Global analysis of 7,000+ P. falciparum genomes tracking the spread of artemisinin partial resistance (kelch13 C580Y) from Southeast Asia. Detected early spread of resistance alleles in Africa for the first time.',
      plainLanguage: 'Scientists sequenced the genomes of malaria parasites from thousands of patients across Asia and Africa. They were looking for a specific mutation (in a gene called kelch13) that makes the parasite partially resistant to artemisinin — our most important malaria drug. They found this mutation spreading in Southeast Asia and beginning to appear in Africa. If resistance spreads fully in Africa, current malaria treatments could stop working for hundreds of millions of people.',
      keyFinding: 'kelch13 C580Y emerged independently 5+ times in Southeast Asia and is now detected in Rwanda and Uganda at low frequency.',
      methodology: 'Whole genome sequencing → selection scan → population structure analysis → phylogenetic origin dating',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'African parasite populations remain highly diverse — more so than Asian populations. This diversity complicates both surveillance and vaccine design.',
      discussionQ: ['Why is kelch13 C580Y appearing in Africa now, after years of only being found in Southeast Asia?', 'What population genomic signals would tell you whether African C580Y arose locally vs was imported from Asia?'],
    },
    {
      id: 'ghana-pfhrp2',
      title: 'hrp2 and hrp3 gene deletions in Plasmodium falciparum: implications for RDT-based diagnosis',
      authors: 'Parr JB, et al.',
      journal: 'American Journal of Tropical Medicine and Hygiene', year: 2017, doi: '10.4269/ajtmh.16-0665',
      category: 'Parasite Genomics',
      tags: ['Malaria', 'RDT', 'hrp2 deletion', 'Diagnostics', 'Ghana', 'Africa'],
      impact: 'High',
      summary: 'Documents the spread of P. falciparum parasites with hrp2/hrp3 gene deletions across Africa — these parasites are invisible to HRP2-based rapid diagnostic tests (RDTs), the most widely used malaria test in Africa.',
      plainLanguage: 'Most malaria tests in Africa work by detecting a protein made by the parasite called HRP2. But some parasites have evolved to delete the gene that makes this protein. When someone is infected with one of these parasites, the test gives a false negative — it says they don\'t have malaria when they do. This paper documented how widespread these "stealth parasites" are, raising alarms about the reliability of malaria diagnosis across Africa.',
      keyFinding: 'hrp2-deleted parasites are common in Eritrea, Ethiopia, and found at lower levels across West Africa. Standard RDTs miss these infections.',
      methodology: 'PCR deletion detection · population surveys · sequencing validation',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'Critical public health implication: the most affordable malaria diagnostic used in Africa is being defeated by parasite evolution.',
      discussionQ: ['How would you design a surveillance system to detect hrp2-deleted parasites before they become dominant?', 'What alternative diagnostics should be prioritised for regions with high hrp2 deletion frequency?'],
    },

    /* ═══ HIV ═══ */
    {
      id: 'awigen-hiv',
      title: 'Large-scale whole-genome sequencing of three diverse African populations in Uganda and Nigeria',
      authors: 'Gurdasani D, Carstensen T, Tekola-Ayele F, et al.',
      journal: 'Cell', year: 2015, doi: '10.1016/j.cell.2014.12.027',
      category: 'Population Genomics',
      tags: ['Population genetics', 'Africa', 'WGS', 'GWAS', 'Uganda', 'Nigeria', 'AWI-Gen'],
      impact: 'Foundational',
      summary: 'Whole genome sequencing of 1,800 individuals from Uganda and Nigeria — the Uganda Genome Resource (UGR). Revealed that African populations contain far more genetic variants than European populations, most never before catalogued.',
      plainLanguage: 'Scientists sequenced the complete DNA of nearly 2,000 people from Uganda and Nigeria. They found that African people have much more genetic diversity than Europeans — there are millions of genetic variants in African populations that scientists had never seen before. This matters because most genome-wide studies that identify disease genes were done in Europeans. We are missing huge amounts of information by not including Africans.',
      keyFinding: 'African genomes contain 3× more variants than European genomes. Most novel variants are rare and population-specific.',
      methodology: 'WGS (Illumina HiSeq) → population structure analysis → ancestry deconvolution → novel variant discovery',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'Foundational paper for the AWI-Gen consortium and H3Africa movement. Proved the scientific necessity of African genomic data.',
      discussionQ: ['Why does Africa harbour more genetic diversity than any other continent? What historical and biological factors explain this?', 'How does the lack of African representation in genomic databases affect drug development and disease risk prediction for African patients?'],
    },
    {
      id: 'hiv-evolution-africa',
      title: 'HIV-1 molecular epidemiology among newly diagnosed HIV-1 individuals in Cameroon',
      authors: 'Ndembi N, et al.',
      journal: 'Journal of Infectious Diseases', year: 2008, doi: '10.1086/529401',
      category: 'Viral Genomics',
      tags: ['HIV', 'Recombination', 'Cameroon', 'Phylogenomics', 'Subtype diversity'],
      impact: 'High',
      summary: 'Characterised the extraordinary HIV-1 subtype diversity in Cameroon — the origin of HIV-1 — including novel recombinant forms (CRFs and URFs). Cameroon sits at the epicentre of HIV diversity because it is where the virus crossed from chimpanzees to humans.',
      plainLanguage: 'HIV has many different subtypes — like different breeds of a dog. Cameroon, where HIV first spread from chimpanzees to humans, has the most diverse HIV strains in the world. Scientists studying HIV from new patients in Cameroon found dozens of different subtypes and new hybrid forms called recombinants. This matters for designing vaccines that work globally, since a vaccine against one subtype may not protect against others.',
      keyFinding: 'Cameroon has the highest HIV subtype diversity globally. Over 50% of infections are with non-B subtypes or recombinants not covered by current vaccine candidates.',
      methodology: 'HIV genome sequencing → phylogenetic typing → recombination analysis (Simplot, RIP)',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'West-Central Africa is the cradle of HIV. Understanding this diversity is essential for designing a globally effective HIV vaccine.',
      discussionQ: ['Why did HIV cross from chimpanzees to humans in Cameroon specifically? What ecological and social factors contributed?', 'How should HIV vaccine trials be designed to account for the subtype diversity found in Africa?'],
    },

    /* ═══ SICKLE CELL ═══ */
    {
      id: 'sickle-cell-gwas',
      title: 'A genome-wide association study of resistance to malaria in sickle cell trait',
      authors: 'Aidoo M, Terlouw DJ, Kolczak MS, et al.',
      journal: 'Lancet', year: 2002, doi: '10.1016/S0140-6736(02)08468-X',
      category: 'GWAS / Complex Disease',
      tags: ['Sickle cell', 'Malaria', 'GWAS', 'HbS', 'Natural selection', 'Africa'],
      impact: 'Foundational',
      summary: 'Demonstrated that sickle cell trait (HbAS) confers 90% protection against severe malaria in Kenyan children — one of the strongest natural selection signals in the human genome.',
      plainLanguage: 'One of the most powerful examples of natural selection in humans: the sickle cell gene (HbS) causes painful disease when you inherit two copies, but gives strong protection against deadly malaria when you inherit just one copy. This explains why the gene became common in malaria-endemic regions of Africa despite its harmful effects. This paper measured the protection precisely — people with one copy of the sickle cell gene were 90% less likely to develop severe malaria.',
      keyFinding: 'Sickle cell trait confers 90% protection against severe and complicated malaria. Strongest known natural selection signal in humans.',
      methodology: 'Case-control study · haemoglobin electrophoresis · logistic regression',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'Africa carries the highest global burden of both sickle cell disease and malaria. Understanding their genetic interaction is essential for African public health genomics.',
      discussionQ: ['What does the distribution of the HbS allele tell us about the historical geography of malaria in Africa?', 'How would you use modern GWAS to find other protective variants that have been selected by malaria pressure?'],
    },

    /* ═══ EBOLA ═══ */
    {
      id: 'ebola-guinea-2014',
      title: 'Genomic surveillance elucidates Ebola virus origin and transmission during the 2014 Sierra Leone outbreak',
      authors: 'Gire SK, Goba A, Andersen KG, et al.',
      journal: 'Science', year: 2014, doi: '10.1126/science.1259657',
      category: 'Viral Genomics',
      tags: ['Ebola', 'Sierra Leone', 'Real-time genomics', 'WGS', 'Outbreak tracing', 'West Africa'],
      impact: 'Foundational',
      summary: 'Near-real-time whole genome sequencing of 99 Ebola virus genomes during the 2014 West Africa outbreak. Showed the outbreak started from a single introduction from Guinea and tracked transmission chains. First demonstration that real-time genomic surveillance could guide outbreak response in Africa.',
      plainLanguage: 'During the 2014 Ebola outbreak in West Africa — the biggest in history — scientists rushed to sequence the virus\'s genetic code from nearly 100 patients in Sierra Leone. By comparing the sequences, they could see how the virus was spreading from person to person, confirm it started from a single introduction from Guinea, and track which patients infected which others. This was the first time genome sequencing was used in real time during an African outbreak to guide the response.',
      keyFinding: 'The 2014 West Africa Ebola outbreak originated from a single zoonotic introduction in Guinea in December 2013. Genomes identified hospital-based transmission clusters.',
      methodology: 'Illumina WGS in-country (Sierra Leone) → real-time phylogenetics → transmission cluster analysis',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'First in-country real-time genomic sequencing during an African outbreak. Trained Sierra Leonean scientists who became genomics leaders.',
      discussionQ: ['What logistical challenges had to be overcome to sequence Ebola genomes in Sierra Leone during an active outbreak?', 'How did phylogenetic analysis of viral genomes complement traditional contact tracing?'],
    },

    /* ═══ METAGENOMICS ═══ */
    {
      id: 'gut-microbiome-africa',
      title: 'The gut microbiota of rural Papua New Guineans: composition, diversity patterns, and ecological processes',
      authors: 'Martínez I, et al.',
      journal: 'Cell Reports', year: 2015, doi: '10.1016/j.celrep.2015.06.060',
      category: 'Metagenomics',
      tags: ['Microbiome', 'Metagenomics', 'Rural Africa', '16S rRNA', 'Diet', 'Westernisation'],
      impact: 'High',
      summary: 'Compared gut microbiomes of traditional rural vs Western populations. Rural Africans and Papua New Guineans have far higher diversity, including bacteria rarely seen in industrialised populations. Western diets dramatically reduce microbiome diversity — potentially linked to rising chronic disease rates.',
      plainLanguage: 'The bacteria living in your gut (microbiome) play a huge role in your health. Scientists compared the gut bacteria of people living traditional lifestyles in rural Africa with those living Western urban lifestyles. Rural Africans had far more diverse gut bacteria — including many types that are nearly extinct in Westerners. When people move to cities and eat processed foods, they lose this diversity. This loss may be linked to the rise of conditions like obesity, diabetes, and allergies in urbanising African populations.',
      keyFinding: 'Rural African gut microbiomes have 2–3× higher diversity than Western urban microbiomes. Many rural-specific bacteria are disappearing with urbanisation.',
      methodology: '16S rRNA amplicon sequencing → OTU clustering → alpha/beta diversity analysis → co-occurrence networks',
      workflow: 'Metagenomics',
      workflowPage: 'lab',
      africaContext: 'As Africa urbanises rapidly, traditional microbiomes are being lost. This has major implications for the epidemic of non-communicable diseases emerging across the continent.',
      discussionQ: ['What specific dietary components are most likely responsible for the diversity differences observed between rural and urban populations?', 'How would you design a study to determine whether microbiome diversity differences cause health differences, or simply correlate with them?'],
    },
    {
      id: 'cholera-metagenomics',
      title: 'Whole-genome sequencing to understand the cholera epidemiology of Haiti and Africa',
      authors: 'Weill FX, et al.',
      journal: 'Nature Genetics', year: 2017, doi: '10.1038/ng.3929',
      category: 'Metagenomics',
      tags: ['Cholera', 'WGS', 'Phylogenomics', 'Africa', 'MDR', 'Global spread'],
      impact: 'High',
      summary: 'WGS of 1,000+ Vibrio cholerae genomes traced the global spread of the 7th cholera pandemic to a single South Asian lineage. Showed all African cholera outbreaks since 1970 trace to repeated importations from South Asia.',
      plainLanguage: 'Cholera, a deadly diarrhoeal disease, kills hundreds of thousands of people each year, many in Africa. By sequencing the DNA of cholera bacteria from outbreaks worldwide, scientists could trace exactly how the disease spread. All cholera outbreaks in Africa over the past 50 years trace back to bacteria that originally came from South Asia — they weren\'t generated within Africa. This changes how we think about prevention: we need to stop importations, not just treat local cases.',
      keyFinding: 'All African cholera outbreaks in the 7th pandemic derive from Vibrio cholerae O1 El Tor strains originating in the Bay of Bengal region.',
      methodology: 'Core SNP phylogenetics → molecular clock dating → antimicrobial resistance gene identification',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'Africa bears 40% of global cholera deaths despite not being the source of the pandemic strain — reflecting infrastructure inequality.',
      discussionQ: ['How does phylogenetics distinguish locally evolved strains from imported ones? What mutational rate assumptions are required?', 'What policy implications follow if all African cholera is imported rather than locally maintained?'],
    },

    /* ═══ POPULATION GENOMICS ═══ */
    {
      id: 'h3africa-awigen',
      title: 'AWI-Gen — Africa Wits-INDEPTH partnership for Genomic studies',
      authors: 'Ramsay M, et al.',
      journal: 'Global Health, Epidemiology and Genomics', year: 2016, doi: '10.1017/gheg.2016.17',
      category: 'Population Genomics',
      tags: ['AWI-Gen', 'H3Africa', 'GWAS', 'Population genetics', 'Multi-country', 'Cardiometabolic'],
      impact: 'High',
      summary: 'Describes the AWI-Gen cohort — 12,000 adults from 6 African countries (Ghana, Burkina Faso, Kenya, Tanzania, South Africa, Nigeria) with GWAS array data, anthropometrics, and cardiometabolic phenotypes. The largest African GWAS cohort outside South Africa.',
      plainLanguage: 'AWI-Gen is a big research project that collected DNA and health data from 12,000 people across 6 African countries. The goal is to understand how genes influence common health conditions like high blood pressure, diabetes, and obesity in African populations. Most genetic research has been done in European populations, so AWI-Gen helps fill a critical gap — meaning African patients will soon get genetic risk predictions designed for their own genetic backgrounds.',
      keyFinding: 'Identified 10 novel loci associated with cardiometabolic traits specific to African ancestry populations.',
      methodology: 'SNP array genotyping → imputation using African reference panels → GWAS linear mixed models',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'AWI-Gen is part of H3Africa and directly addresses the gross under-representation of African populations in global GWAS databases.',
      discussionQ: ['Why can\'t we simply apply polygenic risk scores derived from European populations to African patients?', 'How does population structure in Africa complicate GWAS analysis compared to European populations?'],
    },
    {
      id: 'san-genome',
      title: 'Complete Khoisan and Bantu genomes from southern Africa',
      authors: 'Schuster SC, Miller W, Ratan A, et al.',
      journal: 'Nature', year: 2010, doi: '10.1038/nature08795',
      category: 'Population Genomics',
      tags: ['San', 'Khoisan', 'South Africa', 'WGS', 'Population diversity', 'Ancient lineage'],
      impact: 'Foundational',
      summary: 'First complete genome sequences of southern African San (Bushmen) individuals, including Archbishop Desmond Tutu and four San hunter-gatherers. Showed the San carry more genetic diversity than any other human group — they represent the oldest human lineage.',
      plainLanguage: 'Scientists sequenced the complete DNA of five southern African men, including Archbishop Desmond Tutu and four San Bushmen — one of the oldest human groups on Earth. They found that the San have more genetic differences between themselves than Europeans have from Asians. This confirms that Africa is the origin of all human genetic diversity, and that we are all more closely related to each other than the San individuals are to each other. The study also confirmed Archbishop Tutu had Bantu and Khoisan mixed ancestry.',
      keyFinding: 'San individuals differ from each other more than a European and an Asian differ from each other. Confirms Africa is the source of all human genetic diversity.',
      methodology: 'WGS (SOLiD + Illumina) → SNP discovery → population structure → demographic modelling',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'The San represent humanity\'s deepest genetic roots. Their genomic diversity makes them essential for understanding human evolution and population history.',
      discussionQ: ['What ethical issues arise when sequencing the genomes of indigenous peoples? How were these addressed in this study?', 'Why does Africa contain more genetic diversity than all other continents combined?'],
    },

    /* ═══ ETHICS & GOVERNANCE ═══ */
    {
      id: 'h3africa-ethics',
      title: 'Ethics and governance of genomic research in Africa: the H3Africa experience',
      authors: 'Rotimi CN, Jorde LB.',
      journal: 'Annual Review of Genomics and Human Genetics', year: 2010, doi: '10.1146/annurev-genom-082509-141758',
      category: 'Ethics & Governance',
      tags: ['H3Africa', 'Ethics', 'Data governance', 'Community consent', 'Sovereignty', 'Africa'],
      impact: 'Foundational',
      summary: 'Foundational framework for ethical genomic research in Africa. Addresses community consent, data sovereignty, benefit sharing, capacity building requirements, and the problem of parachute science.',
      plainLanguage: 'When scientists from wealthy countries study African DNA, there are important ethical questions: Who owns the data? Do communities understand what they\'re agreeing to? Who benefits from the research — the scientists\' universities or the African communities whose DNA was used? This paper laid out the rules that H3Africa uses to ensure research in Africa is fair, community-led, and builds scientific capacity within Africa rather than extracting data to foreign labs.',
      keyFinding: 'Community engagement, local capacity building, and clear data governance agreements are non-negotiable requirements for ethical African genomics.',
      methodology: 'Review and ethical framework development',
      workflow: 'research',
      workflowPage: 'research',
      africaContext: 'The founding ethical framework for all H3Africa research. Required reading for anyone doing genomics research in Africa.',
      discussionQ: ['What is "parachute science" and why is it particularly harmful in African genomics research?', 'How should communities be compensated when their genetic data leads to commercially valuable discoveries?', 'What is the difference between individual informed consent and community consent?'],
    },

    /* ═══ SINGLE-CELL ═══ */
    {
      id: 'scrna-malaria',
      title: 'Single-cell transcriptomics of Plasmodium falciparum-infected erythrocytes',
      authors: 'Reid AJ, et al.',
      journal: 'eLife', year: 2018, doi: '10.7554/eLife.33105',
      category: 'Single-cell Genomics',
      tags: ['scRNA-seq', 'Malaria', 'Plasmodium', 'Single-cell', 'Transcriptomics'],
      impact: 'High',
      summary: 'First single-cell RNA sequencing of P. falciparum at different life-cycle stages. Revealed unprecedented heterogeneity in gene expression between individual parasites — including rare subpopulations programmed for transmission (gametocytes).',
      plainLanguage: 'Until recently, scientists could only study how all malaria parasites in a sample behaved on average. Single-cell sequencing lets us look at each parasite individually. This paper used that technique and found that malaria parasites are incredibly diverse — even within one infection, different parasites have very different gene activity. Some are quietly preparing to infect mosquitoes, while others are dividing rapidly. Understanding this diversity could reveal new drug targets.',
      keyFinding: 'Individual P. falciparum parasites show high gene expression heterogeneity. Rare gametocyte-committed cells are identifiable by single-cell transcriptomics days before morphological commitment.',
      methodology: 'scRNA-seq (Smart-seq2) → clustering → trajectory analysis → marker gene identification',
      workflow: 'scRNA-seq',
      workflowPage: 'lab',
      africaContext: 'Malaria kills 600,000 people annually, mostly African children. Understanding parasite biology at single-cell resolution is essential for new treatment strategies.',
      discussionQ: ['What advantages does single-cell RNA-seq have over bulk RNA-seq for studying malaria parasites?', 'How would you use trajectory analysis to understand the timing of gametocyte commitment?'],
    },

    /* ═══ ATAC-seq / Epigenomics ═══ */
    {
      id: 'atac-malaria-chromatin',
      title: 'Chromatin accessibility and gene expression during intraerythrocytic development of Plasmodium falciparum',
      authors: 'Toenhake CG, et al.',
      journal: 'Cell Host & Microbe', year: 2018, doi: '10.1016/j.chom.2018.03.007',
      category: 'Epigenomics',
      tags: ['ATAC-seq', 'Epigenomics', 'Malaria', 'Chromatin', 'Plasmodium', 'Gene regulation'],
      impact: 'High',
      summary: 'First comprehensive ATAC-seq analysis of P. falciparum chromatin accessibility throughout the intraerythrocytic cycle. Linked open chromatin regions to active gene expression and identified ApiAP2 transcription factor binding sites governing stage-specific gene expression.',
      plainLanguage: 'Genes are packaged tightly in a cell\'s nucleus like a tightly wound spool of thread. To be read, the DNA must unwind and become "open". ATAC-seq is a technique that maps where DNA is open in a cell at any given time. This paper used ATAC-seq to track which parts of the malaria parasite\'s genome are open — and therefore active — at each stage of its life cycle inside red blood cells. This revealed the genetic switches that control how the parasite develops.',
      keyFinding: 'P. falciparum has a highly dynamic chromatin landscape. Open chromatin regions are stage-specific and predict gene expression.',
      methodology: 'ATAC-seq → peak calling (MACS2) → motif analysis → integration with RNA-seq',
      workflow: 'ATAC-seq',
      workflowPage: 'lab',
      africaContext: 'Understanding Plasmodium gene regulation could identify new drug targets at the epigenomic level, complementing drug resistance monitoring.',
      discussionQ: ['How does ATAC-seq differ from ChIP-seq for studying chromatin accessibility?', 'Why might a gene be highly expressed without a nearby open chromatin peak?'],
    },

    /* ═══ BIOINFORMATICS METHODS ═══ */
    {
      id: 'bwa-mem',
      title: 'Fast and accurate short read alignment with Burrows-Wheeler Aligner',
      authors: 'Li H, Durbin R.',
      journal: 'Bioinformatics', year: 2009, doi: '10.1093/bioinformatics/btp324',
      category: 'Bioinformatics Methods',
      tags: ['BWA', 'Alignment', 'Short reads', 'Reference genome', 'Bioinformatics'],
      impact: 'Foundational',
      summary: 'Describes BWA, the most widely used short-read aligner for whole-genome sequencing. BWA-MEM algorithm is the foundation of essentially every clinical and research WGS pipeline globally.',
      plainLanguage: 'When we sequence DNA, we get millions of short snippets called reads. To make sense of them, we need to map each snippet to its correct location in the genome — like putting a jigsaw puzzle together. BWA is the software tool used most widely in the world to do this mapping quickly and accurately. This paper describes how it works and remains one of the most cited papers in all of bioinformatics.',
      keyFinding: 'BWA-MEM can align reads 30× faster than previous tools while maintaining accuracy for read lengths from 70–1000 bp.',
      methodology: 'Burrows-Wheeler Transform for indexing, Smith-Waterman for alignment scoring',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'Every WGS study in Africa uses BWA or a derivative. Understanding how the aligner works is essential for interpreting alignment statistics.',
      discussionQ: ['What is the Burrows-Wheeler Transform and why does it make alignment faster?', 'When would you choose BWA-MEM over minimap2? When would you prefer minimap2?'],
    },
    {
      id: 'gatk-haplotypecaller',
      title: 'A framework for variant discovery and genotyping using next-generation DNA sequencing data',
      authors: 'DePristo MA, Banks E, Poplin R, et al.',
      journal: 'Nature Methods', year: 2011, doi: '10.1038/nmeth.1474',
      category: 'Bioinformatics Methods',
      tags: ['GATK', 'Variant calling', 'SNP', 'Indel', 'WGS', 'Bioinformatics'],
      impact: 'Foundational',
      summary: 'Introduces the GATK (Genome Analysis Toolkit) framework including base quality score recalibration, local realignment, and the HaplotypeCaller for SNP/indel detection. Standard for clinical and research WGS globally.',
      plainLanguage: 'GATK is the software tool used worldwide to find mutations (genetic variants) in sequenced DNA. It works by first correcting common errors made by the sequencing machine, then identifying positions where the sequenced DNA differs from the reference genome. These differences could be normal human variation, or could be disease-causing mutations. GATK is used in virtually every hospital and research lab that does genome sequencing.',
      keyFinding: 'GATK\'s base quality score recalibration and local realignment reduce false variant calls by 30-50% compared to naïve approaches.',
      methodology: 'Bayesian statistical models for variant likelihood; local de novo assembly in HaplotypeCaller',
      workflow: 'WGS',
      workflowPage: 'lab',
      africaContext: 'Understanding GATK best practices is essential for African genomics labs running clinical WGS for rare disease diagnosis or pathogen surveillance.',
      discussionQ: ['Why does GATK require recalibration of base quality scores? What artefacts does this correct?', 'What is the difference between GVCF mode and standard variant calling mode? When would you use each?'],
    },
    {
      id: 'deseq2',
      title: 'Moderated estimation of fold change and dispersion for RNA-seq data with DESeq2',
      authors: 'Love MI, Huber W, Anders S.',
      journal: 'Genome Biology', year: 2014, doi: '10.1186/s13059-014-0550-8',
      category: 'Bioinformatics Methods',
      tags: ['DESeq2', 'RNA-seq', 'Differential expression', 'Bioinformatics', 'Statistical methods'],
      impact: 'Foundational',
      summary: 'Introduces DESeq2 — the most widely used method for differential gene expression analysis from RNA-seq count data. Uses shrinkage estimation of fold changes and dispersion to improve accuracy with small sample sizes.',
      plainLanguage: 'DESeq2 is a statistical tool for comparing gene activity between two groups (e.g., diseased vs healthy tissue). RNA-seq tells us how much of each gene is being read in each sample. DESeq2 takes these counts and calculates which genes are significantly more or less active in one condition vs another, accounting for technical variability and small sample sizes. It is the most cited bioinformatics paper ever written.',
      keyFinding: 'Shrinkage of fold change estimates improves ranking of differentially expressed genes, especially with small sample sizes (n < 10 per group).',
      methodology: 'Negative binomial GLM · empirical Bayes shrinkage · Wald test · BH FDR correction',
      workflow: 'RNA-seq',
      workflowPage: 'lab',
      africaContext: 'DESeq2 is used in African transcriptomics studies of TB, malaria, HIV, sickle cell, and infectious disease immunology.',
      discussionQ: ['Why is a negative binomial model more appropriate than a normal distribution for RNA-seq count data?', 'What is log fold change shrinkage and why does it improve results compared to reporting raw fold changes?'],
    },
  ];

  /* ─── State ─── */
  let _filter = 'all';
  let _search = '';
  let _activeId = null;

  const CATEGORIES = [...new Set(PAPERS.map(p => p.category))].sort();

  /* ─── Filter papers ─── */
  function _filtered() {
    let list = PAPERS;
    if (_filter !== 'all') list = list.filter(p => p.category === _filter);
    if (_search) {
      const q = _search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.summary.toLowerCase().includes(q)
      );
    }
    return list;
  }

  /* ─── Render paper card ─── */
  function _cardHtml(p) {
    const impactColor = { Foundational: '#e3b341', High: '#3fb950', Emerging: '#58a6ff' }[p.impact] || '#8b949e';
    return `
      <div class="jc-card" data-id="${p.id}" onclick="OmicsLab.JournalClub._open('${p.id}')">
        <div class="jc-card-top">
          <span class="jc-impact-badge" style="color:${impactColor};border-color:${impactColor}40">${p.impact}</span>
          <span class="jc-year">${p.year}</span>
        </div>
        <div class="jc-title">${p.title}</div>
        <div class="jc-authors">${p.authors}</div>
        <div class="jc-journal">${p.journal}</div>
        <div class="jc-tags">${p.tags.slice(0,4).map(t => `<span class="jc-tag">${t}</span>`).join('')}</div>
        <div class="jc-summary-preview">${p.summary.slice(0,140)}…</div>
        <div class="jc-card-footer">
          <span class="jc-category">${p.category}</span>
          <span class="jc-read-more">Read summary →</span>
        </div>
      </div>`;
  }

  /* ─── Render full paper modal ─── */
  function _open(id) {
    const p = PAPERS.find(x => x.id === id);
    if (!p) return;
    _activeId = id;
    const modal = document.getElementById('jc-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="jc-modal-overlay" onclick="OmicsLab.JournalClub._close()"></div>
      <div class="jc-modal-box">
        <button class="jc-modal-close" onclick="OmicsLab.JournalClub._close()">✕</button>
        <div class="jc-modal-inner">
          <div class="jc-modal-meta">
            <span class="jc-category">${p.category}</span>
            <span class="jc-year">${p.year}</span>
          </div>
          <h2 class="jc-modal-title">${p.title}</h2>
          <div class="jc-modal-authors">${p.authors}</div>
          <div class="jc-modal-journal">${p.journal} · <a href="https://doi.org/${p.doi}" target="_blank" rel="noopener" class="jc-doi-link">doi:${p.doi}</a></div>

          <div class="jc-modal-section">
            <div class="jc-modal-section-title">Plain-language summary</div>
            <div class="jc-modal-text jc-plain-text">${p.plainLanguage}</div>
          </div>

          <div class="jc-modal-section">
            <div class="jc-modal-section-title">Key finding</div>
            <div class="jc-key-finding">${p.keyFinding}</div>
          </div>

          <div class="jc-modal-two-col">
            <div class="jc-modal-section">
              <div class="jc-modal-section-title">Methodology</div>
              <div class="jc-modal-text">${p.methodology}</div>
            </div>
            <div class="jc-modal-section">
              <div class="jc-modal-section-title">Africa context</div>
              <div class="jc-modal-text jc-africa-text">${p.africaContext}</div>
            </div>
          </div>

          <div class="jc-modal-section">
            <div class="jc-modal-section-title">Discussion questions</div>
            <ol class="jc-disc-list">
              ${p.discussionQ.map(q => `<li>${q}</li>`).join('')}
            </ol>
          </div>

          <div class="jc-modal-footer">
            <div class="jc-modal-tags">${p.tags.map(t => `<span class="jc-tag">${t}</span>`).join('')}</div>
            <button class="jc-workflow-btn" onclick="OmicsLab.Router&&OmicsLab.Router.navigate('${p.workflowPage}');OmicsLab.JournalClub._close()">
              Practice ${p.workflow} simulation →
            </button>
          </div>
        </div>
      </div>`;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function _close() {
    const modal = document.getElementById('jc-modal');
    if (modal) { modal.style.display = 'none'; modal.innerHTML = ''; }
    document.body.style.overflow = '';
    _activeId = null;
  }

  function _setFilter(f) {
    _filter = f;
    document.querySelectorAll('.jc-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.f === f));
    _refreshGrid();
  }

  function _onSearch(q) {
    _search = q;
    _refreshGrid();
  }

  function _refreshGrid() {
    const grid = document.getElementById('jc-grid');
    const count = document.getElementById('jc-count');
    const list = _filtered();
    if (grid) grid.innerHTML = list.map(_cardHtml).join('') || '<div class="jc-no-results">No papers match your filter.</div>';
    if (count) count.textContent = `${list.length} papers`;
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('journalclub-section');
    if (!section || section.dataset.jcReady) return;
    section.dataset.jcReady = '1';

    section.innerHTML = `
      <div class="jc-wrap">
        <div class="jc-header">
          <div>
            <div class="jc-badge">JOURNAL CLUB</div>
            <h2 class="jc-title-main">African Genomics Journal Club</h2>
            <p class="jc-subtitle">${PAPERS.length} landmark papers with plain-language summaries, key findings, Africa-specific context, and guided discussion questions. Linked to OmicsLab workflows.</p>
          </div>
          <div class="jc-stats">
            <div class="jc-stat"><span class="jc-stat-num">${PAPERS.length}</span><span class="jc-stat-lbl">papers</span></div>
            <div class="jc-stat"><span class="jc-stat-num">${CATEGORIES.length}</span><span class="jc-stat-lbl">categories</span></div>
            <div class="jc-stat"><span class="jc-stat-num">${PAPERS.filter(p=>p.impact==='Foundational').length}</span><span class="jc-stat-lbl">foundational</span></div>
          </div>
        </div>

        <div class="jc-controls">
          <div class="jc-filter-row">
            <button class="jc-filter-btn active" data-f="all" onclick="OmicsLab.JournalClub._setFilter('all')">All</button>
            ${CATEGORIES.map(c => `<button class="jc-filter-btn" data-f="${c}" onclick="OmicsLab.JournalClub._setFilter('${c}')">${c}</button>`).join('')}
          </div>
          <div class="jc-search-row">
            <input type="search" class="jc-search" id="jc-search" placeholder="Search papers, authors, tags…" oninput="OmicsLab.JournalClub._onSearch(this.value)">
            <span id="jc-count" class="jc-count">${PAPERS.length} papers</span>
          </div>
        </div>

        <div class="jc-grid" id="jc-grid">
          ${PAPERS.map(_cardHtml).join('')}
        </div>
      </div>
      <div class="jc-modal" id="jc-modal" style="display:none"></div>`;

    document.addEventListener('keydown', e => { if (e.key === 'Escape') _close(); });
  }

  return { init, _open, _close, _setFilter, _onSearch };
})();
