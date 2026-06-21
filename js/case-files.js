/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Genomics Case Files
   Real-world African clinical genomics investigations
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.CaseFiles = (function () {

  const CASES = [
    {
      id: 'tb-mdr',
      title: 'The Silent Epidemic',
      subtitle: 'MDR-TB in Mozambique',
      specialty: 'Pathogen Genomics',
      color: '#f97316',
      location: 'Beira Central Hospital, Mozambique',
      difficulty: 'Intermediate',
      duration: '15 min',
      summary: 'A 34-year-old patient on first-line TB therapy continues to deteriorate. WGS of the M. tuberculosis isolate has arrived. You must assess quality, identify resistance mutations, and recommend a regimen.',
      background: 'Mozambique has one of the highest MDR-TB burdens in sub-Saharan Africa, with ~5.4% of new TB cases being drug resistant (WHO 2023). First-line treatment (HRZE) is failing. The local clinical team has sent an M. tuberculosis culture for whole-genome sequencing. Your task is to interpret the results and guide treatment.',
      steps: [
        {
          title: 'Assess Raw Data Quality',
          situation: 'The WGS FASTQ files have arrived from the sequencing center (Illumina HiSeq 2500, 2×75bp, 4.2M reads). Before doing anything else, you open FastQC.',
          data: [
            { label: 'Mean quality score', value: 'Q33', flag: 'good' },
            { label: 'Adapter contamination', value: '11.4%', flag: 'warn' },
            { label: 'GC content', value: '65.4%', flag: 'good' },
            { label: 'Estimated coverage', value: '72×', flag: 'good' },
          ],
          question: 'What is your next step based on these QC results?',
          options: [
            { text: 'Trim adapters with Trimmomatic, then align to H37Rv reference', correct: true, xp: 50, explanation: 'Correct. 11.4% adapter contamination must be removed before alignment — it will cause mismatches and false variant calls. Coverage of 72× exceeds the WHO-recommended minimum of 50× for drug-resistance profiling. GC% of 65.4% matches M. tuberculosis exactly.' },
            { text: 'Proceed directly to alignment — coverage is sufficient to overcome adapter contamination', correct: false, xp: 0, explanation: 'Incorrect. Adapter sequences are not part of the bacterial genome. If they align, they create artefactual variants near read ends. Always trim before aligning.' },
            { text: 'Request a re-sequencing — adapter contamination >10% means the library has failed', correct: false, xp: 0, explanation: 'Incorrect. 11% adapter contamination is common and completely correctable with Trimmomatic or fastp. Re-sequencing would waste weeks in a patient who is deteriorating.' },
          ],
        },
        {
          title: 'Interpret the VCF Variants',
          situation: 'After trimming, alignment to H37Rv (NC_000962.3), and GATK variant calling, your VCF contains three high-confidence variants:',
          data: [
            { label: 'rpoB p.Ser450Leu', value: 'AF 0.94 | Depth 87×', flag: 'fail' },
            { label: 'katG p.Ser315Thr', value: 'AF 0.89 | Depth 81×', flag: 'fail' },
            { label: 'embB p.Met306Val', value: 'AF 0.78 | Depth 90×', flag: 'warn' },
          ],
          question: 'What do these variants indicate clinically?',
          options: [
            { text: 'MDR-TB (rifampicin + isoniazid resistance) plus additional ethambutol resistance', correct: true, xp: 75, explanation: 'Correct. rpoB p.Ser450Leu is the most common rifampicin-resistance mutation (64% of rif-R globally; WHO Catalogue Group 1 = high confidence resistance). katG p.Ser315Thr causes high-level isoniazid resistance (50–90% of INH-R strains). MDR-TB = resistant to at least rifampicin + isoniazid. embB p.Met306Val confers ethambutol resistance, meaning 3 of 4 first-line drugs are compromised.' },
            { text: 'Borderline variants — repeat the sequencing to confirm', correct: false, xp: 0, explanation: 'Incorrect. AF >0.75 with depth >80× makes these high-confidence true variants, not sequencing noise. Both rpoB S450L and katG S315T are in the WHO Mutation Catalogue as definitive resistance markers.' },
            { text: 'Possible mixed infection with a resistant and sensitive strain', correct: false, xp: 0, explanation: 'Partially correct thinking, but AF >0.75 across all three variants is more consistent with a single resistant strain than a mixed infection (which typically shows AF ~0.5 for each strain\'s variants).' },
          ],
        },
        {
          title: 'Treatment Decision',
          situation: 'You confirm MDR-TB + ethambutol resistance. The pharmacist asks whether you can treat based on WGS alone, or whether phenotypic drug susceptibility testing (DST) is required first.',
          data: [
            { label: 'Phenotypic DST turnaround', value: '6–8 weeks', flag: 'warn' },
            { label: 'WHO Catalogue coverage', value: 'rpoB/katG/embB: confirmed', flag: 'good' },
            { label: 'WHO 2022 guideline', value: 'WGS endorsed for regimen selection', flag: 'good' },
          ],
          question: 'What is the correct clinical response?',
          options: [
            { text: 'Start a WHO-recommended MDR-TB regimen based on WGS results — phenotypic DST is not required', correct: true, xp: 100, explanation: 'Correct. WHO 2022 rapid communications update explicitly endorses WGS-based genotypic DST for guiding MDR-TB treatment. The 6-8 week delay for phenotypic DST is clinically unacceptable for a deteriorating patient. For confirmed rpoB + katG mutations, begin BPaLC regimen (Bedaquiline + Pretomanid + Linezolid + Clofazimine) per WHO MDR-TB treatment guidelines 2022.' },
            { text: 'Wait for phenotypic DST before starting MDR-TB treatment', correct: false, xp: 0, explanation: 'Incorrect per current guidelines. Waiting 6-8 weeks causes further organ damage and increases transmission risk. WHO 2022 guidelines allow WGS results from validated databases (WHO Mutation Catalogue, CRyPTIC) to directly guide MDR-TB treatment.' },
          ],
        },
        {
          title: 'Reporting and Surveillance',
          situation: 'The treatment is started. You now need to submit the genome sequence and epidemiological data.',
          data: [
            { label: 'Lineage (Mykrobe)', value: '4.3.3 (European lineage, common in SE Africa)', flag: 'info' },
            { label: 'Cluster match', value: '3 similar genomes in national database', flag: 'warn' },
          ],
          question: 'What is the most important public health action based on the clustering data?',
          options: [
            { text: 'Initiate a contact tracing investigation — clustered genomes suggest recent transmission chain', correct: true, xp: 75, explanation: 'Correct. Clustering of ≥2 genomes with <5 SNP difference suggests recent transmission (not independent acquisition). Mozambique National TB Program should be notified to trace close contacts of all 4 clustered patients. This is how WGS transforms TB control from reactive to proactive interruption of transmission chains.' },
            { text: 'The clustering is coincidental — proceed with routine reporting only', correct: false, xp: 0, explanation: 'Incorrect. <5 SNP distance between M. tuberculosis genomes is the international threshold for defining a transmission cluster. This finding mandates contact tracing in national TB programs using genomic surveillance.' },
          ],
        },
      ],
    },
    {
      id: 'sickle-cell',
      title: 'A Founder Variant',
      subtitle: 'Sickle cell family study, Ghana',
      specialty: 'Clinical Genetics',
      color: '#f85149',
      location: 'Korle Bu Teaching Hospital, Accra, Ghana',
      difficulty: 'Beginner',
      duration: '12 min',
      summary: 'A 24-year-old woman planning a family wants to know her sickle cell status. Her father had sickle cell disease. Interpret the WGS variant and counsel appropriately.',
      background: 'Ghana has one of the highest sickle cell disease (SCD) burdens globally, with ~2% of newborns affected and ~25% of the population carrying the sickle cell trait (HbAS). HBB p.Glu6Val (rs334) is the causative variant for sickle cell anaemia. This case covers variant interpretation, clinical classification, and reproductive counselling.',
      steps: [
        {
          title: 'Identify the Variant',
          situation: 'WGS data is processed. The variant caller reports: HBB c.20A>T (chr11:5,227,002 A>T, GRCh38). You look up the variant.',
          data: [
            { label: 'HGVS protein', value: 'HBB p.Glu6Val', flag: 'info' },
            { label: 'gnomAD-AFR allele frequency', value: '0.037 (3.7%)', flag: 'info' },
            { label: 'ClinVar significance', value: 'Pathogenic (sickle cell)', flag: 'fail' },
            { label: 'Zygosity', value: 'Heterozygous (1/2)', flag: 'info' },
          ],
          question: 'What is this individual\'s genotype and phenotype?',
          options: [
            { text: 'HbAS — sickle cell trait (carrier). Will not develop SCD but can pass the variant to children.', correct: true, xp: 50, explanation: 'Correct. Heterozygous HBB p.Glu6Val = HbAS genotype (one Hb A allele, one Hb S allele) = sickle cell trait. Carriers are generally healthy, though they can have complications under severe hypoxia. They have a 50% chance of transmitting the variant to each child.' },
            { text: 'HbSS — sickle cell disease. She requires hydroxyurea immediately.', correct: false, xp: 0, explanation: 'Incorrect. HbSS requires two copies of the variant (homozygous). This individual is heterozygous (one copy). HbSS causes severe haemolytic anaemia; HbAS causes sickle cell trait with minimal clinical impact.' },
            { text: 'Normal — the variant is a benign African-specific polymorphism at 3.7% AF', correct: false, xp: 0, explanation: 'Incorrect. AF of 3.7% in gnomAD-AFR reflects the high carrier frequency in West African populations — this is expected for a disease-causing variant that provides malaria protection. ClinVar pathogenic classification definitively identifies this as the sickle cell mutation.' },
          ],
        },
        {
          title: 'Reproductive Counselling',
          situation: 'The patient\'s partner is also tested and is found to be HbAS (sickle cell trait). They ask about their chances of having an affected child.',
          data: [
            { label: 'Patient genotype', value: 'HbAS (carrier)', flag: 'info' },
            { label: 'Partner genotype', value: 'HbAS (carrier)', flag: 'info' },
          ],
          question: 'What is the probability that each pregnancy produces a child with sickle cell disease (HbSS)?',
          options: [
            { text: '25% — one in four pregnancies will result in HbSS (sickle cell disease)', correct: true, xp: 75, explanation: 'Correct. Autosomal recessive inheritance: HbAS × HbAS = 25% HbAA (normal), 50% HbAS (trait), 25% HbSS (SCD). This is the fundamental teaching of Mendelian genetics applied to the most common monogenic disease in Africa.' },
            { text: '50% — because both parents carry the variant', correct: false, xp: 0, explanation: 'Incorrect. 50% is the probability of inheriting the HbS allele, but two HbS alleles are required for SCD. The probability of inheriting HbS from BOTH parents simultaneously is 0.5 × 0.5 = 25%.' },
            { text: '100% — both parents carry the mutation so all children will be affected', correct: false, xp: 0, explanation: 'Incorrect. Each parent can transmit either their HbA or HbS allele to each child. A child must inherit HbS from BOTH parents to have SCD.' },
          ],
        },
        {
          title: 'Population Context',
          situation: 'The couple asks why the sickle cell mutation is so common in Ghana (25% carrier frequency) when it causes such a severe disease.',
          data: [
            { label: 'Plasmodium falciparum malaria endemicity', value: 'Holoendemic in coastal Ghana', flag: 'warn' },
            { label: 'HbAS protection against severe malaria', value: '50% reduction in mortality', flag: 'good' },
          ],
          question: 'What explains the high HbS allele frequency in West African populations?',
          options: [
            { text: 'Heterozygous advantage (balancing selection): HbAS carriers are protected against severe malaria', correct: true, xp: 75, explanation: 'Correct. This is the classic example of heterozygous advantage (overdominance). HbAS carriers have ~50% lower mortality from severe P. falciparum malaria. In malaria-endemic West Africa, the survival advantage of being HbAS outweighs the 25% chance of having an HbSS child. This explains why HBB p.Glu6Val has reached 25% carrier frequency in Ghana despite causing severe disease in homozygotes. Similar reasoning explains why G6PD deficiency and alpha-thalassaemia are also common in Africa.' },
            { text: 'Random genetic drift — the mutation increased by chance in a small founding population', correct: false, xp: 0, explanation: 'Incorrect. While drift can explain some variant frequency increases, 25% carrier frequency requires positive selection. The geographic correlation between sickle cell trait frequency and malaria endemicity across Africa, Southeast Asia, and the Mediterranean is definitive evidence for selection.' },
          ],
        },
      ],
    },
    {
      id: 'outbreak-meta',
      title: 'Unknown Origin',
      subtitle: 'Novel pathogen outbreak, DRC',
      specialty: 'Outbreak Genomics',
      color: '#ff79c6',
      location: 'North Kivu Province, Democratic Republic of Congo',
      difficulty: 'Advanced',
      duration: '20 min',
      summary: 'Seventeen patients present with acute haemorrhagic fever at a rural health post. The local team collects samples and sends them for metagenomic sequencing to identify the causative agent.',
      background: 'North Kivu has historically seen Ebola, Marburg, and Crimean-Congo haemorrhagic fever outbreaks. A cluster of 17 patients shows fever, headache, myalgia, and haemorrhagic manifestations. Initial RDTs for Ebola, Marburg, and malaria are negative. Blood samples are sent for unbiased metagenomic NGS as the only remaining diagnostic option.',
      steps: [
        {
          title: 'Choose the Metagenomic Strategy',
          situation: 'You have 5 blood samples and limited laboratory capacity. You must choose the right sequencing approach for pathogen identification from a haemorrhagic fever cluster.',
          data: [
            { label: 'Sample type', value: 'EDTA blood, stored at -80°C', flag: 'good' },
            { label: 'Available platform', value: 'Illumina MiSeq (in Kinshasa, 2 days transit)', flag: 'warn' },
            { label: 'Alternative platform', value: 'Nanopore MinION (on-site, 4 hrs to result)', flag: 'good' },
            { label: 'Clinical urgency', value: 'High — 2 deaths in 48 hours', flag: 'fail' },
          ],
          question: 'Which sequencing approach is most appropriate given the urgency?',
          options: [
            { text: 'Nanopore MinION metagenomics on-site — accept lower accuracy for speed in an outbreak', correct: true, xp: 75, explanation: 'Correct. In outbreak response, speed saves lives. Nanopore gives a preliminary pathogen ID in 4-6 hours, enabling containment decisions while Illumina data is pending. Nanopore accuracy for RNA viruses is sufficient for species-level classification with Kraken2. This is exactly what KEMRI and INRB did during the 2018-2020 DRC Ebola outbreak.' },
            { text: 'Wait for Illumina MiSeq in Kinshasa — the data quality is needed for accurate identification', correct: false, xp: 0, explanation: 'Incorrect. 2 days waiting during an active haemorrhagic fever cluster with 2 deaths is unacceptable. With Ebola response, every 24h delay doubles the outbreak size on average. Speed of identification is more important than read quality for initial pathogen identification.' },
          ],
        },
        {
          title: 'Classify the Pathogen',
          situation: 'Nanopore sequencing completes. Kraken2 with a viral database reports:',
          data: [
            { label: 'Top hit', value: 'Lujo virus (Arenaviridae, 68% reads)', flag: 'fail' },
            { label: 'Second hit', value: 'Human (28% reads)', flag: 'good' },
            { label: 'Ebola/Marburg', value: '0 reads', flag: 'good' },
            { label: 'Assembly coverage', value: '23× (complete genome possible)', flag: 'info' },
          ],
          question: 'What is your immediate action upon identifying Lujo virus?',
          options: [
            { text: 'Activate BSL-4 protocols, alert WHO and Africa CDC, contact ribavirin treatment experts', correct: true, xp: 100, explanation: 'Correct. Lujo virus is a newly discovered arenavirus (South Africa, 2008) with ~80% case fatality rate — higher than Ebola. It requires BSL-4 containment. There are only 5 known human cases in history. WHO and Africa CDC must be notified immediately. Ribavirin may reduce mortality (as with other arenaviruses). Genomic sequence enables real-time phylogenetic tracking of spread.' },
            { text: 'This may be a database misclassification — confirm with RT-PCR before alerting authorities', correct: false, xp: 0, explanation: 'Partially correct thinking (confirmation is needed), but INCORRECT to delay alert. In haemorrhagic fever clusters with deaths, you notify authorities WHILE confirming — not after. The Lujo virus Kraken2 hit with 68% reads is strong preliminary evidence. Contact WHO and begin isolation immediately; confirmation can happen in parallel.' },
          ],
        },
        {
          title: 'Phylogenetic Analysis',
          situation: 'The assembled Lujo genome is 95.4% complete. You build a phylogenetic tree placing this isolate relative to the 2008 South African outbreak.',
          data: [
            { label: 'SNP distance from 2008 index case', value: '142 SNPs (genome-wide)', flag: 'info' },
            { label: 'Nucleotide identity', value: '97.8% to LUJV/H.sapiens/ZAF/2008', flag: 'info' },
            { label: 'NPC2 protein mutations', value: '3 novel mutations in receptor binding domain', flag: 'warn' },
          ],
          question: 'What do 142 SNPs and 97.8% identity suggest about this outbreak compared to 2008?',
          options: [
            { text: 'This is an independent spillover from a rodent reservoir in DRC — 15 years of reservoir evolution accounts for the divergence', correct: true, xp: 75, explanation: 'Correct. 142 SNPs over 15 years is consistent with the known RNA virus mutation rate (~2-5 SNPs/year for arenaviruses). 97.8% identity is too distant to represent a direct chain from 2008. The most parsimonious interpretation is independent spillover from the same or related Zambian multimammate rat (Mastomys natalensis) reservoir that harbors Lujo virus across Central-Southern Africa. The novel NPC2 mutations may indicate host adaptation.' },
            { text: 'This is the same outbreak as 2008 — the virus spread from South Africa to DRC over 15 years', correct: false, xp: 0, explanation: 'Incorrect. 142 SNPs of divergence over 15 years is far too many for a continuous human-to-human transmission chain. Arenaviruses mutate in rodent reservoirs. Epidemiological data also does not support a 15-year human transmission chain.' },
          ],
        },
      ],
    },
    {
      id: 'gwas-t2d',
      title: 'The Missing Heritability',
      subtitle: 'Type 2 diabetes GWAS, AWI-Gen cohort',
      specialty: 'Population Genomics',
      color: '#3fb950',
      location: 'AWI-Gen Collaborative Centre, South Africa',
      difficulty: 'Advanced',
      duration: '18 min',
      summary: 'You are a bioinformatician analyzing a GWAS of type 2 diabetes in the AWI-Gen cohort of 10,000 sub-Saharan Africans. A genome-wide significant hit does not replicate in European cohorts. Understand why and what it means.',
      background: 'The Africa Wits INDEPTH partnership for Genomic Studies (AWI-Gen) genotyped 11,000 adults across 6 African sites (Nairobi, Nanoro, Soweto, Agincourt, Nanoro, Navrongo). This GWAS study of type 2 diabetes (T2D) identifies novel African-specific signals not found in large European meta-analyses.',
      steps: [
        {
          title: 'Interpret the Manhattan Plot',
          situation: 'Your GWAS Manhattan plot shows a genome-wide significant peak at chr2:161Mb (p = 3.2×10⁻⁹, exceeding the GW significance threshold of 5×10⁻⁸).',
          data: [
            { label: 'Lead variant', value: 'rs2237892 (KCNQ1 locus)', flag: 'info' },
            { label: 'Risk allele frequency (AWI-Gen)', value: '0.22 (22%)', flag: 'info' },
            { label: 'Risk allele frequency (gnomAD-EUR)', value: '0.04 (4%)', flag: 'info' },
            { label: 'GWAS catalog', value: 'Novel: not in European T2D catalog', flag: 'warn' },
          ],
          question: 'Why would this variant be detected in AWI-Gen but missed in large European GWAS?',
          options: [
            { text: 'The variant is far more common in African populations (22% vs 4%), giving AWI-Gen much higher statistical power to detect it', correct: true, xp: 100, explanation: 'Correct. Statistical power in GWAS is proportional to allele frequency and effect size. At 4% MAF in Europeans, this variant would need >200,000 samples to reach genome-wide significance. At 22% MAF in AWI-Gen, 10,000 samples may be sufficient. This illustrates why studying African populations reveals biology missed by European-centric genomics — and why African GWAS results should not be dismissed if they don\'t replicate in Europeans.' },
            { text: 'The variant is a false positive in AWI-Gen due to population stratification', correct: false, xp: 0, explanation: 'Population stratification is a valid concern, but the correct response is to test for it (check genomic inflation factor λ and PCA) rather than assume it. If PCA control was applied (standard practice) and λ <1.05, the finding is likely real. A frequency difference between populations does not indicate a false positive.' },
          ],
        },
        {
          title: 'Fine-Mapping the Signal',
          situation: 'You fine-map the KCNQ1 locus using African linkage disequilibrium (LD) patterns. The European LD block spanning 250kb collapses to a 40kb region in African populations.',
          data: [
            { label: 'EUR LD block size', value: '250 kb (96 variants in r² > 0.5)', flag: 'info' },
            { label: 'AFR LD block size', value: '40 kb (12 variants in r² > 0.5)', flag: 'info' },
            { label: 'Credible set (fine-mapped)', value: '3 variants (95% posterior probability)', flag: 'good' },
          ],
          question: 'Why is the African LD block 6× smaller than the European one?',
          options: [
            { text: 'African populations have higher genetic diversity and more ancient recombination events that break down LD blocks', correct: true, xp: 75, explanation: 'Correct. African populations are evolutionarily older (~300,000 years of human history in Africa vs. ~70,000 years since the Out of Africa bottleneck). More generations of meiotic recombination have broken up linkage disequilibrium into shorter blocks. This is actually an ADVANTAGE for fine-mapping: African LD patterns localize causal variants 6× more precisely, reducing the fine-mapping credible set from 96 to 12 variants. This is why African populations are invaluable for functional genomics.' },
            { text: 'The African samples have lower sequencing quality, creating more apparent recombination breakpoints', correct: false, xp: 0, explanation: 'Incorrect. LD block size is a population genetics property determined by evolutionary history, not sequencing quality. AWI-Gen used the same Illumina H3Africa custom array as European biobanks with equivalent quality metrics.' },
          ],
        },
        {
          title: 'Functional Interpretation',
          situation: 'The 3 fine-mapped variants fall in an enhancer region active in pancreatic beta cells. The lead variant disrupts a binding site for the transcription factor FOXA2, which regulates KCNQ1 expression.',
          data: [
            { label: 'Regulatory annotation', value: 'H3K27ac+ enhancer in INS-1 cells (pancreatic beta cells)', flag: 'info' },
            { label: 'eQTL effect', value: 'rs2237892 reduces KCNQ1 expression 0.4-fold in islets', flag: 'info' },
            { label: 'KCNQ1 function', value: 'K+ channel — regulates insulin secretion rhythm', flag: 'info' },
          ],
          question: 'What is the proposed biological mechanism linking this variant to T2D risk?',
          options: [
            { text: 'Reduced KCNQ1 expression disrupts K+ channel function in beta cells, impairing the electrical rhythm of insulin secretion', correct: true, xp: 100, explanation: 'Correct. KCNQ1 encodes a voltage-gated K+ channel that controls membrane repolarization after insulin secretion. Reduced KCNQ1 expression (shown by eQTL) would impair the rhythmic insulin secretory bursts needed to maintain glucose homeostasis. This mechanistic insight — derived from an African GWAS — provides a drug target: KCNQ1 activators could be tested as novel T2D treatments. This exemplifies how African genomics discovers new biology for global medicine.' },
            { text: 'The variant increases inflammation that destroys beta cells (Type 1 mechanism)', correct: false, xp: 0, explanation: 'Incorrect. The variant is in a beta-cell enhancer affecting a K+ channel gene — this is a Type 2 diabetes insulin secretion mechanism. T1D involves autoimmune beta cell destruction and different genetic loci (HLA, PTPN22, INS). KCNQ1 is also implicated in T2D in East Asian populations, supporting the insulin secretion mechanism.' },
          ],
        },
      ],
    },
    {
      id: 'covid-variant',
      title: 'Variant Under Surveillance',
      subtitle: 'Novel SARS-CoV-2 emergence, South Africa',
      specialty: 'Viral Genomics',
      color: '#58a6ff',
      location: 'KRISP, Durban, South Africa',
      difficulty: 'Intermediate',
      duration: '15 min',
      summary: 'A cluster of COVID-19 cases shows unusual clinical severity at a Durban clinic. ARTIC amplicon sequencing reveals unexpected spike protein mutations. You must assess the variant and its implications.',
      background: 'South Africa has a robust SARS-CoV-2 genomic surveillance network built during the pandemic (KRISP, NICD, NHLS). Beta (B.1.351), Delta (B.1.617.2), and Omicron (B.1.1.529) were all identified in South Africa first or co-first. This case simulates the early-alert process used to detect and characterize new variants.',
      steps: [
        {
          title: 'Assess Genome Completeness',
          situation: 'You process 12 ARTIC amplicon Nanopore sequences from the cluster. Nextclade QC results:',
          data: [
            { label: 'Mean genome completeness', value: '97.8%', flag: 'good' },
            { label: 'Failed amplicons', value: '2/98 amplicons per sample (<2%)', flag: 'good' },
            { label: 'Mean coverage', value: '1,240× (ARTIC v4)', flag: 'good' },
            { label: 'Nextclade QC score', value: '94/100', flag: 'good' },
          ],
          question: 'Are these genomes suitable for variant characterization and submission to GISAID?',
          options: [
            { text: 'Yes — >95% completeness, high coverage, and Nextclade QC >90 meet all submission requirements', correct: true, xp: 50, explanation: 'Correct. GISAID requires >90% complete genome; WHO recommends >95% for variant characterization. 97.8% completeness, 1240× coverage, and QC score 94 are all excellent. These genomes are high quality and should be submitted to GISAID and shared with WHO/Africa CDC immediately for global surveillance.' },
            { text: 'No — the 2 failed amplicons mean the sequences are incomplete and unreliable', correct: false, xp: 0, explanation: 'Incorrect. 2 of 98 amplicons failing (2%) is within the acceptable range and accounts for the missing <2.2% of the genome. These failures typically occur at amplicon dropout-prone regions (such as amplicons 18 and 76 which consistently underperform in Omicron sublineages). 97.8% completeness far exceeds GISAID submission requirements.' },
          ],
        },
        {
          title: 'Characterize the Spike Mutations',
          situation: 'Nextclade reports these spike mutations relative to the Wuhan-Hu-1 reference:',
          data: [
            { label: 'K417T', value: 'Neutralization escape (ACE2 RBD)', flag: 'fail' },
            { label: 'E484K', value: 'Immune evasion (known Beta/Gamma mutation)', flag: 'fail' },
            { label: 'N501Y', value: 'Increased ACE2 affinity (Alpha/Beta/Gamma)', flag: 'warn' },
            { label: 'D614G', value: 'Background dominant mutation since 2020', flag: 'info' },
          ],
          question: 'Based on these mutations, what clinical and public health implications should you communicate immediately?',
          options: [
            { text: 'This variant has known immune evasion mutations (K417T, E484K, N501Y) — alert NICD, submit to WHO, and flag for enhanced surveillance', correct: true, xp: 100, explanation: 'Correct. K417T + E484K + N501Y is exactly the signature of the Beta (B.1.351) variant identified by KRISP in 2020. These three mutations together dramatically reduce neutralization by most vaccines and convalescent sera. This combination triggered the redesign of second-generation COVID vaccines. In a novel context, this mutation set requires immediate escalation: NICD notification, WHO IHR reporting, GISAID submission within 24h, and evaluation of whether existing PCR S-gene dropout assays will detect this variant.' },
            { text: 'These are well-known mutations from existing variants — no new action needed beyond routine reporting', correct: false, xp: 0, explanation: 'Incorrect. While these individual mutations are known, their combination in a novel cluster requires investigation. Is this Beta re-emergence? A recombinant? A convergent variant? Any novel clustering of immune-evasion mutations in a clinical severity cluster warrants urgent genomic investigation, not routine reporting.' },
          ],
        },
        {
          title: 'Public Communication',
          situation: 'You confirm this is Beta variant re-emergence in a sub-population with Beta-naive immune history. A journalist contacts KRISP asking for comment. How should you respond?',
          data: [
            { label: 'Vaccine coverage in cluster', value: '78% (all received Pfizer BNT162b2)', flag: 'info' },
            { label: 'Pfizer neutralization vs Beta', value: '6-fold reduction vs wild-type', flag: 'warn' },
            { label: 'Hospitalisation rate in cluster', value: '4/17 (24%) vs background 8%', flag: 'fail' },
          ],
          question: 'What is the most appropriate public communication for this finding?',
          options: [
            { text: 'Transparent science communication: describe the finding, current investigations, and what is known about Beta immune evasion — without causing undue panic', correct: true, xp: 75, explanation: 'Correct. Transparent, timely scientific communication is the ethical standard established during COVID-19. South Africa (KRISP/NICD) was praised globally for rapidly publishing Beta and Omicron data despite initial economic consequences. Communication should state: Beta variant confirmed, investigating severity signal, vaccines still reduce severe disease even if less effective, no need for public action change while monitoring continues. Withholding data to avoid economic harm was rejected as unethical by the global genomics community.' },
            { text: 'Decline to comment until full analysis is complete to avoid panic', correct: false, xp: 0, explanation: 'Incorrect. Delaying transparent communication during a potential outbreak is both ethically problematic and practically counterproductive. The scientific community and public health authorities need real-time data to respond appropriately. Information vacuum leads to misinformation. Early transparent sharing is what made South Africa a global leader in COVID genomic surveillance.' },
          ],
        },
      ],
    },
  ];

  let _activeCase = null;
  let _step = 0;
  let _scores = {};
  let _answered = {};

  const _totalXP = (cas) => cas.steps.reduce((s, st) => s + Math.max(...st.options.map(o => o.xp)), 0);

  function init() {
    const container = document.getElementById('case-files-content');
    if (!container) return;
    if (container.querySelector('.cf-page')) return;

    container.innerHTML = `
<div class="cf-page">
  <div class="cf-header">
    <h1 class="cf-title">Genomics Case Files</h1>
    <p class="cf-sub">Work through real African clinical and research genomics cases — make decisions, interpret data, and see expert reasoning. Each case teaches skills you will use in the field.</p>
  </div>

  <div class="cf-case-grid" id="cf-case-grid"></div>
  <div id="cf-case-view" class="cf-case-view" style="display:none"></div>
</div>`;

    _renderGrid();
  }

  function _renderGrid() {
    const el = document.getElementById('cf-case-grid');
    if (!el) return;
    el.style.display = '';
    const caseView = document.getElementById('cf-case-view');
    if (caseView) caseView.style.display = 'none';

    el.innerHTML = CASES.map(c => {
      const score = _scores[c.id] || 0;
      const maxScore = _totalXP(c);
      const done = score > 0;
      return `
      <div class="cf-case-card" style="border-top-color:${c.color}" onclick="OmicsLab.CaseFiles.openCase('${c.id}')">
        <div class="cf-card-header">
          <div>
            <div class="cf-card-specialty" style="color:${c.color}">${c.specialty}</div>
            <div class="cf-card-title">${c.title}</div>
            <div class="cf-card-subtitle">${c.subtitle}</div>
          </div>
          ${done ? `<div class="cf-card-score" style="color:${c.color}">${score}/${maxScore} XP</div>` : ''}
        </div>
        <p class="cf-card-summary">${c.summary}</p>
        <div class="cf-card-meta">
          <span class="cf-card-loc">${c.location}</span>
          <span class="cf-card-meta-row">
            <span class="cf-diff cf-diff-${c.difficulty.toLowerCase()}">${c.difficulty}</span>
            <span class="cf-dur">${c.duration}</span>
            <span class="cf-steps">${c.steps.length} steps</span>
          </span>
        </div>
        ${done ? '<div class="cf-card-done">Completed — click to review</div>' : '<div class="cf-card-cta">Begin investigation →</div>'}
      </div>`;
    }).join('');
  }

  function openCase(id) {
    _activeCase = CASES.find(c => c.id === id);
    if (!_activeCase) return;
    _step = 0;
    _answered = {};
    _renderCaseView();
    document.getElementById('cf-case-grid').style.display = 'none';
    document.getElementById('cf-case-view').style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function _renderCaseView() {
    const el = document.getElementById('cf-case-view');
    if (!el || !_activeCase) return;
    const c = _activeCase;
    const st = c.steps[_step];
    const maxXP = _totalXP(c);
    const earnedXP = _scores[c.id] || 0;
    const progress = (_step / c.steps.length) * 100;

    el.innerHTML = `
      <div class="cf-view-header" style="border-left-color:${c.color}">
        <button class="cf-back-btn" onclick="OmicsLab.CaseFiles.backToGrid()">← All Cases</button>
        <div class="cf-view-meta">
          <span class="cf-view-specialty" style="color:${c.color}">${c.specialty}</span>
          <span class="cf-view-title">${c.title}</span>
          <span class="cf-view-loc">${c.location}</span>
        </div>
        <div class="cf-xp-pill">${earnedXP} / ${maxXP} XP</div>
      </div>

      <div class="cf-progress-bar"><div class="cf-progress-fill" style="width:${progress}%;background:${c.color}"></div></div>

      <div class="cf-step-indicator">Step ${_step + 1} of ${c.steps.length} — ${st.title}</div>

      ${_step === 0 ? `<div class="cf-background-box"><div class="cf-bg-title">Background</div><p class="cf-bg-text">${c.background}</p></div>` : ''}

      <div class="cf-step-card">
        <div class="cf-step-title">${st.title}</div>
        <p class="cf-situation">${st.situation}</p>

        ${st.data ? `<div class="cf-data-panel">
          ${st.data.map(d => `<div class="cf-data-row">
            <span class="cf-data-label">${d.label}</span>
            <span class="cf-data-value cf-flag-${d.flag}">${d.value}</span>
          </div>`).join('')}
        </div>` : ''}

        <div class="cf-question">${st.question}</div>

        <div class="cf-options" id="cf-opts">
          ${st.options.map((opt, oi) => `
            <button class="cf-option-btn" data-idx="${oi}" onclick="OmicsLab.CaseFiles.answer(${oi})">
              <span class="cf-opt-letter">${String.fromCharCode(65 + oi)}</span>
              <span class="cf-opt-text">${opt.text}</span>
            </button>`).join('')}
        </div>

        <div id="cf-feedback" class="cf-feedback" style="display:none"></div>
      </div>

      <div class="cf-nav-row" id="cf-nav-row" style="display:none">
        ${_step < c.steps.length - 1
          ? `<button class="cf-next-btn" onclick="OmicsLab.CaseFiles.nextStep()">Next Step →</button>`
          : `<button class="cf-next-btn cf-finish-btn" onclick="OmicsLab.CaseFiles.finishCase()" style="background:${c.color}">Complete Case</button>`}
      </div>`;

    // Re-apply answered state if revisiting
    if (_answered[_step] !== undefined) {
      setTimeout(() => _showAnswer(_answered[_step], false), 50);
    }
  }

  function answer(optIdx) {
    if (_answered[_step] !== undefined) return;
    _answered[_step] = optIdx;
    _showAnswer(optIdx, true);
  }

  function _showAnswer(optIdx, addScore) {
    const st = _activeCase.steps[_step];
    const opt = st.options[optIdx];
    const btns = document.querySelectorAll('.cf-option-btn');
    const feedbackEl = document.getElementById('cf-feedback');
    const navEl = document.getElementById('cf-nav-row');

    btns.forEach((btn, i) => {
      btn.disabled = true;
      const o = st.options[i];
      btn.classList.add(o.correct ? 'cf-correct' : 'cf-wrong');
      if (i === optIdx && !o.correct) btn.classList.add('cf-selected-wrong');
    });

    if (feedbackEl) {
      feedbackEl.style.display = '';
      feedbackEl.className = `cf-feedback cf-feedback-${opt.correct ? 'correct' : 'incorrect'}`;
      feedbackEl.innerHTML = `
        <div class="cf-feedback-header">
          ${opt.correct ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Correct' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Incorrect'}
          ${opt.xp > 0 && addScore ? `<span class="cf-xp-earn">+${opt.xp} XP</span>` : ''}
        </div>
        <p class="cf-feedback-text">${opt.explanation}</p>`;
      if (addScore && opt.xp > 0) {
        _scores[_activeCase.id] = (_scores[_activeCase.id] || 0) + opt.xp;
        const xpPill = document.querySelector('.cf-xp-pill');
        if (xpPill) xpPill.textContent = `${_scores[_activeCase.id]} / ${_totalXP(_activeCase)} XP`;
        OmicsLab.Progress?.awardXP?.(opt.xp, _activeCase.specialty);
      }
    }
    if (navEl) navEl.style.display = '';
  }

  function nextStep() {
    _step++;
    _renderCaseView();
  }

  function finishCase() {
    const c = _activeCase;
    const earned = _scores[c.id] || 0;
    const max = _totalXP(c);
    const pct = Math.round(earned / max * 100);
    const grade = pct >= 90 ? 'Excellent' : pct >= 70 ? 'Good' : pct >= 50 ? 'Satisfactory' : 'Needs Review';
    const gradeColor = pct >= 90 ? '#3fb950' : pct >= 70 ? '#58a6ff' : pct >= 50 ? '#e3b341' : '#f85149';

    document.getElementById('cf-case-view').innerHTML = `
      <div class="cf-complete">
        <div class="cf-complete-icon" style="color:${gradeColor}">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>
        </div>
        <div class="cf-complete-grade" style="color:${gradeColor}">${grade}</div>
        <div class="cf-complete-score">${earned} / ${max} XP · ${pct}%</div>
        <div class="cf-complete-case">${c.title} — ${c.specialty}</div>
        <p class="cf-complete-note">You have completed this case. Your score is saved. Review any step by reopening the case.</p>
        <div class="cf-complete-btns">
          <button class="cf-next-btn" onclick="OmicsLab.CaseFiles.backToGrid()">← All Case Files</button>
          <button class="cf-next-btn" style="background:${c.color};border-color:${c.color}" onclick="OmicsLab.CaseFiles.openCase('${c.id}')">Review Case</button>
        </div>
      </div>`;
  }

  function backToGrid() {
    _activeCase = null;
    _renderGrid();
  }

  return { init, openCase, answer, nextStep, finishCase, backToGrid };
})();
