/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Disease & Application Context
   Maps every disease to the workflows that study it,
   the biomarkers being hunted, and the expected findings
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.DISEASES = {

  /* ── ONCOLOGY ─────────────────────────────────────────────── */
  'breast-cancer': {
    name: 'Breast Cancer', category: 'Oncology', icon: 'ribbon',
    color: '#ff7b9c',
    stats: { global: '2.3M new cases/yr · #1 cancer in women', africa: 'High TNBC rate; rising incidence', daly: '17.1M DALYs/yr' },
    sampleTypes: ['FFPE tumour tissue','Fresh-frozen biopsies','Peripheral blood (ctDNA)','Bone marrow aspirate'],
    description: 'The most common cancer in women globally. TNBC and HER2+ subtypes have poor prognosis. African women have higher rates of aggressive TNBC.',
    clinicalImpact: 'WGS-guided homologous recombination deficiency (HRD) scoring directs PARP inhibitor eligibility. RNA-seq subtyping replaces immunohistochemistry for Oncotype DX-equivalent risk stratification.',
    workflows: ['wgs','rna-seq','scrna-seq','atac-seq','chip-seq','proteomics','lc-ms'],
    biomarkers: ['BRCA1/BRCA2 germline mutations','HER2 amplification (ERBB2)','ESR1 LBD mutations (resistance)','PIK3CA H1047R','AKT1 E17K','PTEN loss','Ki-67 proliferation index','ctDNA (liquid biopsy)','HRD score','PAM50 subtype signature'],
    findings: 'WGS identifies somatic driver mutations and homologous recombination deficiency (HRD score). RNA-seq classifies intrinsic subtypes (Luminal A/B, HER2-enriched, Basal-like). scRNA-seq maps the tumour microenvironment and immune infiltrate. Proteomics reveals post-translational phosphorylation events not captured by RNA.',
    tools: ['GATK HaplotypeCaller','MutSig2CV','STAR-Fusion','InferCNV','clusterProfiler','scarHRD','STAR','DESeq2'],
    databases: ['TCGA BRCA','COSMIC','ClinVar','METABRIC','CPTAC Breast Cancer'],
    africanContext: 'High TNBC frequency in sub-Saharan Africa linked to BRCA1/2 germline variants and unique somatic mutational signatures. The AMBCARE study is building the first large-scale African breast cancer genomic biobank.'
  },

  'lung-cancer': {
    name: 'Lung Cancer (NSCLC)', category: 'Oncology', icon: 'activity',
    color: '#87ceeb',
    stats: { global: '2.2M new cases/yr · #1 cancer killer', africa: 'Rising with urbanisation & tobacco', daly: '26.9M DALYs/yr' },
    sampleTypes: ['FFPE biopsy (primary/metastasis)','Peripheral blood (ctDNA/CTCs)','Bronchoalveolar lavage','Pleural effusion'],
    description: 'Leading cause of cancer death worldwide. NSCLC accounts for ~85% of cases. EGFR, KRAS, and ALK mutations drive targeted therapy selection.',
    clinicalImpact: 'Comprehensive genomic profiling (CGP) by WGS/WES is now standard of care for metastatic NSCLC to identify actionable alterations (EGFR, ALK, ROS1, MET, KRAS G12C) and select targeted therapy or immunotherapy.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','lc-ms'],
    biomarkers: ['EGFR exon 19 del / L858R / T790M','KRAS G12C (sotorasib)','ALK fusion (EML4-ALK)','ROS1 fusion','MET exon 14 skip','NTRK fusion','PD-L1 TPS (immunotherapy)','STK11 (immunotherapy resistance)','KEAP1','Tumour mutational burden (TMB)'],
    findings: 'WGS detects copy number alterations and structural rearrangements (ALK/ROS1 fusions). scRNA-seq resolves treatment-resistant cell sub-populations and epithelial-mesenchymal transition states. LC-MS identifies metabolic reprogramming markers including TCA cycle disruption.',
    tools: ['GATK','Arriba (fusions)','DESeq2','Seurat','MetaboAnalyst','STAR','Delly (SVs)'],
    databases: ['TCGA LUAD/LUSC','COSMIC','OncoKB','GENIE','LCGA (Lung Cancer Genomics Africa)'],
    africanContext: 'Lower smoking rates in Africa but increasing urban air pollution and biomass fuel exposure drives different mutational spectra. Under-representation in global NSCLC genomic datasets limits targeted therapy access.'
  },

  'colorectal-cancer': {
    name: 'Colorectal Cancer (CRC)', category: 'Oncology', icon: 'target',
    color: '#e74c3c',
    stats: { global: '1.9M new cases/yr · #3 most common', africa: 'Rapidly rising with urbanisation', daly: '19.6M DALYs/yr' },
    sampleTypes: ['FFPE tumour','Matched normal blood','Stool (metagenomics)','Plasma (liquid biopsy)'],
    description: 'Third most common cancer. Characterised by chromosomal instability (CIN) or microsatellite instability (MSI). MSI-high tumours respond to immunotherapy.',
    clinicalImpact: 'MSI/MMR status by WGS or panel sequencing determines eligibility for pembrolizumab (first-line for MSI-H metastatic CRC). RAS/RAF mutation status guides EGFR inhibitor eligibility.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','shotgun-meta','lc-ms'],
    biomarkers: ['KRAS G12/G13 mutations','NRAS exon 2/3 mutations','BRAF V600E','APC truncation (initiating event)','MSI status (MMR protein loss)','CpG island methylator phenotype (CIMP)','CEA serum marker','PIK3CA mutations','Fusobacterium nucleatum abundance'],
    findings: 'WGS identifies the 4 consensus molecular subtypes (CMS1-4) with prognostic significance. Metagenomics links gut dysbiosis (Fusobacterium nucleatum) to tumour stage and survival. Metabolomics reveals altered bile acid and tryptophan metabolism as early diagnostic markers.',
    tools: ['GATK','MSIsensor-pro','STAR','HUMAnN3','XCMS','Kraken2','COMPASS (CMS subtyping)'],
    databases: ['TCGA COAD/READ','COSMIC','KEGG','HMDB','SYSCOL'],
    africanContext: 'Rising CRC incidence in urban Africa linked to dietary westernisation and reduced fibre intake. Unique gut microbiome compositions in South African cohorts differ markedly from European reference populations. The AWI-Gen study tracks CRC risk factors across 5 African countries.'
  },

  'leukemia': {
    name: 'Acute Myeloid Leukaemia (AML)', category: 'Oncology', icon: 'droplet',
    color: '#c0392b',
    stats: { global: '200K new cases/yr · 5-yr survival 30%', africa: 'Data scarce; late-stage diagnosis common', daly: '4.8M DALYs/yr' },
    sampleTypes: ['Bone marrow aspirate','Peripheral blood','Matched remission sample (for somatic calling)'],
    description: 'Aggressive blood cancer of myeloid progenitor cells. FLT3, NPM1, DNMT3A, and IDH1/2 mutations define treatment-relevant subgroups.',
    clinicalImpact: 'FLT3-ITD status mandates midostaurin addition to induction chemotherapy. IDH1/2 mutations are targetable with ivosidenib/enasidenib. MRD monitoring by NGS identifies patients needing allogeneic SCT in CR1.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','atac-seq','chip-seq'],
    biomarkers: ['FLT3-ITD (allelic ratio)','NPM1 exon 12 insertion','IDH1 R132 / IDH2 R140/R172','DNMT3A R882','WT1 overexpression (MRD)','CEBPA biallelic mutation','TP53','RUNX1-RUNX1T1 fusion (t8;21)','PML-RARA (t15;17)','MRD by ddPCR'],
    findings: 'scRNA-seq identifies leukaemic stem cell populations that survive induction and drive relapse. ATAC-seq maps open chromatin changes during myeloid differentiation arrest. ChIP-seq profiles abnormal PRC2-mediated silencing of differentiation gene programmes.',
    tools: ['GATK','Cell Ranger','Seurat','MACS3','ChIPseeker','Harmony','MRDseq pipeline'],
    databases: ['TCGA LAML','BEAT AML','BloodSpot','ENCODE','ELN 2022 Classification'],
    africanContext: 'Limited genomic data from African AML patients. The H3Africa consortium and AMLSG Africa collaboration are initiating continent-wide AML biobanking and sequencing programmes.'
  },

  /* ── ONCOLOGY — ADDITIONAL ────────────────────────────────── */
  'cervical-cancer': {
    name: 'Cervical Cancer', category: 'Oncology', icon: 'shield',
    color: '#fd79a8',
    stats: { global: '604K new cases/yr · 342K deaths/yr', africa: '#1 cancer killer in women in sub-Saharan Africa', daly: '8.5M DALYs/yr' },
    sampleTypes: ['Cervical biopsy (FFPE)','Cervical swab','Peripheral blood','Plasma (ctDNA)'],
    description: 'Caused by persistent infection with high-risk HPV (HPV16/18 cause 70% of cases). Nearly 100% preventable through vaccination. Sub-Saharan Africa bears the highest global burden.',
    clinicalImpact: 'HPV genotyping by WGS directs triage of cervical intraepithelial neoplasia. Somatic TP53 and PIK3CA status guides immunotherapy eligibility in recurrent/metastatic disease. Methylation profiling identifies high-grade lesions from self-collected swabs.',
    workflows: ['viral-wgs','wgs','wes','rna-seq','atac-seq','lc-ms'],
    biomarkers: ['HPV genotype (16, 18, 31, 45, 52, 58)','HPV viral load and integration site','TP53 mutation','PIK3CA mutation','PTEN loss','CDKN2A (p16) methylation','CD274 (PD-L1) expression','APOBEC mutational signature (SBS2/SBS13)','ctDNA (treatment response)','SCCs serum marker'],
    findings: 'Viral WGS detects HPV integration sites that disrupt tumour suppressors (DNER, TP63). RNA-seq reveals E6/E7 oncogene expression driving p53 and Rb degradation. ATAC-seq maps enhancer remodelling at integration loci. Metabolomics identifies folate and one-carbon metabolism disruption.',
    tools: ['BWA-MEM2','GATK','ViralIntegrationFinder','DESeq2','STAR','XCMS','Pangolin (HPV typing)'],
    databases: ['TCGA CESC','COSMIC','PaVE (Papillomavirus Episteme)','IARC HPV Genome Atlas','ClinVar'],
    africanContext: 'Sub-Saharan Africa accounts for >50% of global cervical cancer deaths. Low screening coverage and HIV co-infection (5× higher risk) drive the epidemic. The PAVE-Africa study is building an African HPV genomic atlas to improve vaccines and diagnostics.'
  },

  'prostate-cancer': {
    name: 'Prostate Cancer', category: 'Oncology', icon: 'dna',
    color: '#00b4d8',
    stats: { global: '1.4M new cases/yr · #2 cancer in men', africa: 'Highest incidence rates in men of African ancestry', daly: '9.4M DALYs/yr' },
    sampleTypes: ['FFPE biopsy (12-core)','Liquid biopsy (ctDNA / AR-V7 in CTCs)','Urine (for DNA)','Bone marrow biopsy (metastatic)'],
    description: 'The most common cancer in men. Men of African ancestry have 2× higher incidence and mortality than European-ancestry men — a genomic disparity with biological and systemic drivers.',
    clinicalImpact: 'Germline BRCA2 testing now standard (guides olaparib eligibility in mCRPC). AR splice variant 7 (AR-V7) in CTCs predicts resistance to enzalutamide/abiraterone. DNA damage repair (DDR) gene mutations determine PARP inhibitor and pembrolizumab eligibility.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','chip-seq','atac-seq','lc-ms'],
    biomarkers: ['PSA (screening)','BRCA1/BRCA2 germline mutations','CDK12 mutation (tandem duplicator)','AR amplification/splice variants (AR-V7)','PTEN homozygous deletion','SPOP mutation','ERG/ETV1/ETV4 fusions','RB1 loss','TP53','Androgen receptor enhancer amplification'],
    findings: 'WGS reveals CDK12-mutant prostate cancer as an immunotherapy-responsive subgroup. scRNA-seq maps the castration-resistant prostate cancer (CRPC) transcriptional landscape including neuroendocrine transdifferentiation. ChIP-seq and ATAC-seq profile AR-binding site reprogramming driving resistance.',
    tools: ['GATK','STAR','DESeq2','Seurat','Manta (SVs)','Delly','cisFEM (AR enhancer)','deepTools'],
    databases: ['TCGA PRAD','SU2C metastatic CRPC','PCAWG','gnomAD','ClinVar','OncoKB'],
    africanContext: 'Men of West African ancestry have distinct somatic mutational profiles with higher ERG-fusion rates and unique germline variant spectra. The APCAD consortium and PRACTICAL Africa-specific GWAS are identifying loci underlying the African ancestry disparity.'
  },

  /* ── INFECTIOUS DISEASE ───────────────────────────────────── */
  'tuberculosis': {
    name: 'Tuberculosis (TB)', category: 'Infectious Disease', icon: 'virus',
    color: '#f39c12',
    stats: { global: '10.6M new cases/yr · 1.3M deaths/yr', africa: '23% of global TB cases; SA: 520/100,000', daly: '47.6M DALYs/yr' },
    sampleTypes: ['Sputum (direct WGS)','BALF (bronchoscopy)','Tissue biopsy (extrapulmonary)','Blood (host transcriptomics)'],
    description: 'Global leading infectious disease killer. M. tuberculosis H37Rv has a 4.4 Mb genome. Drug resistance (MDR-TB, XDR-TB) is driven by specific SNPs in rpoB, katG, inhA.',
    clinicalImpact: 'WGS-based DST provides complete resistance profiles in <48h, replacing 6-week culture methods. Phylogenomic cluster analysis identifies outbreak chains within hours of result, enabling immediate contact tracing. Host RNA signatures can distinguish active TB from latent infection and viral pneumonia.',
    workflows: ['wgs','rna-seq','shotgun-meta'],
    biomarkers: ['rpoB S450L (rifampicin resistance)','katG S315T (isoniazid)','inhA promoter -15C/T','embB M306V (ethambutol)','pncA variants (pyrazinamide)','gyrA D94G (fluoroquinolones)','eis promoter (aminoglycosides)','Beijing lineage (hypervirulent)','PGRS/PE-PGRS (antigenic variation)','Host IFN-γ gene signature (RISK6)'],
    findings: 'WGS provides full DST profile in <48h vs weeks for culture-based DST. Whole-genome phylogeny traces outbreak transmission chains at the single-SNP level. RNA-seq reveals 6-gene host immune signatures (RISK6) distinguishing active vs latent TB with 85% sensitivity and specificity.',
    tools: ['MTBseq','TBProfiler','KvarQ','BEAST2','DESeq2','TB-Profiler CLI','PhyML'],
    databases: ['CRyPTIC (>15,000 genomes)','ReSeqTB','PATRIC','NCBI RefSeq H37Rv (NC_000962.3)','WHO TB mutation catalogue'],
    africanContext: 'South Africa has one of the world\'s highest TB burdens (520/100,000). H3Africa and DTHF driving African genomic TB surveillance. The CRYPTIC consortium includes the largest collection of African M. tb genomes with phenotypic DST data.'
  },

  'sars-cov2': {
    name: 'SARS-CoV-2 / COVID-19', category: 'Infectious Disease', icon: 'virus',
    color: '#8e44ad',
    stats: { global: '776M confirmed cases · 7M+ deaths (WHO)', africa: 'Africa CDC sequenced >150K genomes', daly: 'Pandemic-scale; long COVID adds chronic burden' },
    sampleTypes: ['Nasopharyngeal swab','BAL fluid','Serum/plasma','Peripheral blood (host response)','Stool (microbiome)'],
    description: 'The betacoronavirus responsible for the COVID-19 pandemic. A 30 kb positive-sense RNA genome. Spike protein mutations drive immune evasion and increased transmissibility.',
    clinicalImpact: 'Real-time WGS enables Variant of Concern (VOC) classification within 24h, informing public health measures and vaccine reformulation. Host transcriptomics (RNA-seq) identifies WHO severity-associated gene signatures guiding ICU escalation decisions.',
    workflows: ['viral-wgs','rna-seq','scrna-seq','lc-ms','proteomics','shotgun-meta'],
    biomarkers: ['Spike S protein mutations (BA.2.86, XBB.1.5, JN.1)','Furin cleavage site (PRRA insert)','N501Y, E484K, K417N (immune evasion)','ACE2 binding affinity score','Ct value (viral load proxy)','Variant of Concern (VOC) classification','IFN-I suppression signature','Tryptophan/kynurenine ratio (long COVID)','Antibody neutralisation titre','IFNAR1/TLR7 loss-of-function (severe COVID risk)'],
    findings: 'ARTIC amplicon WGS provides variant classification and phylogenetic placement in real time. RNA-seq reveals interferon suppression signatures correlating with severity. scRNA-seq maps cell-type tropism and cytokine storm transcriptomics across lung, blood and gut. Metabolomics identifies tryptophan pathway disruption in long COVID patients.',
    tools: ['iVar','Pangolin','Nextclade','BEAST2','STAR','Seurat','Viralrecon (nf-core)'],
    databases: ['GISAID (>15M genomes)','NCBI SRA','NCBI RefSeq NC_045512.2','EpiCoV','COVID-19 Data Portal'],
    africanContext: 'Africa CDC SARS-CoV-2 surveillance network sequenced >150K genomes. NICD South Africa first sequenced Omicron (BA.1) genomes in November 2021 — triggering the global VOC alert within 72h of detection.'
  },

  'hiv': {
    name: 'HIV-1', category: 'Infectious Disease', icon: 'shield',
    color: '#e74c3c',
    stats: { global: '39M people living with HIV · 1.3M new infections/yr', africa: 'Africa carries 67% of global burden; SA 8.2M PLHIV', daly: '38.7M DALYs/yr' },
    sampleTypes: ['Peripheral blood (PBMC)','Plasma (viral RNA)','Rectal/cervical swabs','CSF (neurological HIV)'],
    description: 'A 9.7 kb RNA retrovirus causing AIDS. Africa carries >70% of the global burden. Drug resistance profiling and host genetics determine treatment outcomes.',
    clinicalImpact: 'Population-based HIV sequencing (PBS) identifies transmitted drug resistance (TDR) and guides first-line ART selection at national level. Host GWAS identifies HLA-B*57:01 for abacavir pharmacogenomics screening, now standard of care. CCR5 tropism testing determines maraviroc eligibility.',
    workflows: ['viral-wgs','rna-seq','scrna-seq','shotgun-meta','lc-ms'],
    biomarkers: ['RT mutations (M184V, K65R, K103N)','Protease mutations (D30N, I50V, L90M)','Integrase mutations (Q148H/R/K, N155H)','CD4+ T cell count','Viral load (plasma HIV RNA)','HLA-B*57:01 (abacavir hypersensitivity)','CCR5 tropism (X4 vs R5)','HIV-1 subtype (A1, B, C, D, G, CRF01_AE)','Reservoir size (CA-RNA)','Immune activation markers (IP-10, sCD14)'],
    findings: 'WGS of HIV-1 pol/env genes provides drug resistance genotyping and phylogenetic clustering. scRNA-seq maps CD4+ T cell depletion dynamics and TCF7+ stem-cell-like reservoir cells. Metagenomics characterises gut dysbiosis (Prevotella dominance) associated with disease progression and immune activation.',
    tools: ['HIV-GRADE','Stanford HIVdb','DESeq2','Kraken2','STAR','BEAST2','PHYLOSCANNER (transmission)'],
    databases: ['Los Alamos HIV Database (LANL)','Stanford HIVdb','GISAID','CAPRISA (SA cohort)','SHIMS3'],
    africanContext: 'South Africa: 8.2M people living with HIV — the world\'s largest epidemic. HIV subtype C dominates in southern Africa. H3Africa GWAS identified African-specific host genetic variants influencing viral load set-point and CD4 decline that are absent from European reference panels.'
  },

  'malaria': {
    name: 'Malaria (P. falciparum)', category: 'Infectious Disease', icon: 'zap',
    color: '#27ae60',
    stats: { global: '249M cases/yr · 608K deaths/yr (2022)', africa: 'Africa: 94% of global malaria deaths', daly: '66.4M DALYs/yr' },
    sampleTypes: ['Dried blood spot (DBS)','Whole blood','Bone marrow (severe malaria)','Mosquito midgut (vector surveillance)'],
    description: 'A 23 Mb genome parasite transmitted by Anopheles mosquitoes. Artemisinin resistance is expanding globally. Africa bears >90% of global malaria deaths.',
    clinicalImpact: 'WGS-based kelch13 mutation surveillance guides WHO artemisinin resistance alert systems. Parasite genetic identity-by-descent (IBD) analysis maps transmission networks for targeted vector control. MalariaGEN community data sharing enables near-real-time drug resistance monitoring across 40 countries.',
    workflows: ['wgs','rna-seq','lc-ms'],
    biomarkers: ['kelch13 C580Y/R539T (artemisinin resistance)','pfcrt K76T (chloroquine resistance)','pfmdr1 N86Y (lumefantrine)','pfkelch13 partial resistance mutations','Plasmodium species (PCR/WGS)','Multiplicity of infection (MOI)','var gene expression (severe malaria)','Pfhrp2/3 deletion (RDT false-negatives)','Cytokine storm markers (TNF-α, IL-6)'],
    findings: 'WGS identifies drug resistance mutations and parasite relatedness for transmission mapping. RNA-seq profiles stage-specific transcriptomes (ring, trophozoite, schizont, gametocyte). Metabolomics identifies haemozoin-driven oxidative stress and altered BCAA metabolism as potential drug targets.',
    tools: ['GATK','SnpEff','DESeq2','Artemis','MalariaGEN pipeline','pf7 analysis toolkit','PopLDdecay'],
    databases: ['MalariaGEN Pf7 (20,000+ genomes)','PlasmoDB','WHO malaria resistance report','ClinEpiDB'],
    africanContext: 'Africa CDC and WWARN coordinating African artemisinin resistance monitoring in response to emerging Partial Artemisinin Resistance (PARR) signals in East Africa. The MalariaGEN Pf7 release includes the largest collection of African P. falciparum genomes enabling continent-wide resistance surveillance.'
  },

  /* ── INFECTIOUS DISEASE — ADDITIONAL ─────────────────────── */
  'hepatitis-b': {
    name: 'Hepatitis B (HBV) & HCC', category: 'Infectious Disease', icon: 'virus',
    color: '#fdcb6e',
    stats: { global: '296M chronically infected · 820K deaths/yr', africa: 'West/Central Africa: 8–20% HBsAg prevalence (highest globally)', daly: '21.1M DALYs/yr' },
    sampleTypes: ['Serum/plasma (HBV DNA)','Liver biopsy (FFPE)','PBMCs','Tumour tissue (HCC)'],
    description: 'A 3.2 kb partially double-stranded DNA virus. Perinatal transmission drives the African epidemic. Chronic HBV is the #1 cause of hepatocellular carcinoma (HCC) in Africa.',
    clinicalImpact: 'WGS of HBV genotype determines treatment response (genotype A responds better to IFN-α). Integration site mapping predicts HCC risk and informs liver transplant decisions. HCC somatic profiling (TP53, CTNNB1) guides systemic therapy selection.',
    workflows: ['viral-wgs','wgs','wes','rna-seq','lc-ms'],
    biomarkers: ['HBsAg (surface antigen)','HBeAg/anti-HBe seroconversion','HBV DNA viral load','HBV genotype (A–J; A dominant in Africa)','Precore/BCP mutations (HBeAg-negative disease)','HBV integration sites','TP53 R249S (aflatoxin-associated HCC)','CTNNB1 mutations (HCC)','AFP (HCC biomarker)','TERT promoter mutations (HCC)'],
    findings: 'WGS of HBV genome tracks genotype evolution and identifies drug-resistance mutations (rtM204I/V for lamivudine resistance). HBV integration site analysis by WGS identifies disruption of tumour suppressor genes and oncogenic activation. Hepatocellular carcinoma WGS reveals the TP53 R249S hotspot — a direct aflatoxin B1 mutational signature unique to Africa.',
    tools: ['HBVouroboros (assembly)','BWA-MEM2','GATK','VirusSeq','DESeq2','STAR','XCMS'],
    databases: ['HBVdb','NCBI RefSeq NC_003977','ICGC LIHC','TCGA LIHC','MitoMap'],
    africanContext: 'West and Central Africa have among the highest HBV prevalence globally (8–20%). Perinatal and early childhood horizontal transmission routes dominate. The AfricaHBV consortium is conducting the first large-scale African HBV WGS study to understand genotype A2 diversity and HCC risk. The aflatoxin B1 × HBV synergistic HCC risk creates a unique African HCC molecular subtype.'
  },

  'sickle-cell': {
    name: 'Sickle Cell Disease (SCD)', category: 'Haematology', icon: 'heart-pulse',
    color: '#e17055',
    stats: { global: '300K births/yr affected · 100M carriers globally', africa: 'Nigeria: 100K SCD births/yr — highest globally; 50% of global burden', daly: '5.0M DALYs/yr' },
    sampleTypes: ['Peripheral blood (EDTA)','Cord blood (neonatal screening)','Bone marrow (stem cell studies)','Reticulocyte-enriched blood'],
    description: 'A monogenic haemoglobinopathy caused by HBB p.Glu6Val (rs334). Despite being Mendelian, severe clinical heterogeneity is driven by hundreds of modifier genes, HbF levels, and co-inheritance with α-thalassaemia.',
    clinicalImpact: 'WGS identifies HbF-inducing modifier variants (BCL11A, HMIP loci) predicting hydroxyurea response. The first curative gene therapy (Casgevy — CRISPR-based BCL11A disruption) relies on genomic characterisation. Neonatal WGS enables comprehensive haematological risk stratification beyond the sickle mutation.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','chip-seq','atac-seq'],
    biomarkers: ['HBB p.Glu6Val (rs334) — sickle mutation','HBB p.Glu6Lys (rs33950507) — HbC (mild)','BCL11A enhancer variants (HbF induction)','HMIP (MYB-HBS1L) variants (HbF)','α-thalassaemia co-inheritance (α3.7 deletion)','HbF percentage (protective)','LDH (haemolysis)','Transcranial Doppler (stroke risk proxy)','Reticulocyte count','G6PD deficiency (common co-morbidity in Africa)'],
    findings: 'WGS identifies genome-wide modifiers of HbF expression and SCD severity across African populations. scRNA-seq reveals erythroid differentiation trajectories and the HbF induction window in BFU-E to CFU-E transition. ATAC-seq and ChIP-seq define BCL11A enhancer accessibility as the key regulatory node for γ-globin silencing — the target of curative gene therapy.',
    tools: ['GATK','PLINK','REGENIE','DESeq2','Seurat','MACS3','HOMER','bcftools'],
    databases: ['CSSCD (Cooperative Study of SCD)','GlobeGen SCD GWAS','gnomAD AFR','ClinVar','GeneReviews','BRINDABELLA (African SCD cohort)'],
    africanContext: 'Africa carries the highest global SCD burden — Nigeria alone has 100K affected births/year. Yet >90% of SCD genomic studies use non-African samples, severely limiting modifier gene discovery for African patients. The Sickle Cell Africa Consortium (SPARCO/H3Africa) is conducting the first multi-country African SCD WGS study across 11 sites in 8 countries.'
  },

  /* ── NEUROLOGICAL ─────────────────────────────────────────── */
  'alzheimers': {
    name: 'Alzheimer\'s Disease', category: 'Neurological', icon: 'brain',
    color: '#9b59b6',
    stats: { global: '55M people with dementia · 10M new cases/yr', africa: 'Rapidly growing; APOE ε4 more common yet lower AD risk', daly: '27.1M DALYs/yr' },
    sampleTypes: ['Blood (PBMC for GWAS)','CSF (protein biomarkers)','Post-mortem brain tissue','Induced pluripotent stem cells (iPSC models)'],
    description: 'Most common neurodegenerative disease. APOE ε4 is the strongest genetic risk factor. Amyloid-β and tau pathology drive neuronal loss.',
    clinicalImpact: 'APOE ε4 genotyping is incorporated into lecanemab/donanemab anti-amyloid therapy safety monitoring (ARIA risk). WGS rare variant discovery enables carrier testing in familial AD (PSEN1, PSEN2, APP). CSF and plasma proteomics (Aβ42/40, p-tau 217) now enable Alzheimer\'s staging without PET.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','proteomics','lc-ms'],
    biomarkers: ['APOE ε4 allele (risk × 3–4)','APP V717I/K670N (familial AD)','PSEN1/PSEN2 mutations (familial AD)','CSF Aβ42/40 ratio (amyloid)','CSF phospho-tau 181/217 (tangle pathology)','NfL (neurofilament light — neurodegeneration)','TREM2 R47H variant (microglia)','SORL1 rare variants','ABCA7 loss-of-function (enriched in African ancestry)','Synaptotagmin-1 (synaptic loss marker)'],
    findings: 'WGS/WES identifies rare coding variants in SORL1, ABCA7 (enriched in African-ancestry), CLU, and PLCG2. scRNA-seq reveals disease-associated microglia (DAM) activation states and oligodendrocyte dysfunction preceding neuronal loss. CSF proteomics identifies synaptic and inflammatory markers (SNAP25, YKL-40) preceding symptoms by 10–20 years.',
    tools: ['GATK','MAGMA','STAR','Seurat','MaxQuant','MetaboAnalyst','FUMA GWAS','LDSC'],
    databases: ['ADNI','ROSMAP','UK Biobank (500K)','AlzGene','AMP-AD Knowledge Portal','EADB (European AD Biobank)'],
    africanContext: 'APOE ε4 allele frequency is 2–3× higher in populations of West African ancestry compared to Europeans, yet paradoxically confers lower AD risk — a major unresolved question potentially related to cardiovascular risk factors. ABCA7 loss-of-function variants are enriched in African ancestry and represent the most significant African-specific AD risk gene.'
  },

  /* ── AUTOIMMUNE & INFLAMMATORY ────────────────────────────── */
  'ibd': {
    name: 'Inflammatory Bowel Disease (IBD)', category: 'Autoimmune', icon: 'flame',
    color: '#e67e22',
    stats: { global: '6.8M cases globally · incidence rising worldwide', africa: 'Low traditional prevalence but rising sharply with urbanisation', daly: '4.7M DALYs/yr' },
    sampleTypes: ['Colonic biopsy (inflamed and non-inflamed)','Stool (metagenomics)','Peripheral blood (PBMC)','Plasma'],
    description: 'Chronic relapsing inflammation of the GI tract. Crohn\'s disease and ulcerative colitis. Driven by genetic susceptibility + gut microbiome dysbiosis.',
    clinicalImpact: 'NOD2 genotyping guides anti-TNF vs anti-IL-12/23 therapy selection. Faecal microbiome transplant (FMT) efficacy prediction uses metagenomic donor profiling. scRNA-seq fibroblast activation state classification predicts corticosteroid response.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','shotgun-meta','16s-amplicon','lc-ms','atac-seq'],
    biomarkers: ['NOD2 R702W/G908R/1007fs (Crohn\'s)','IL23R Arg381Gln (protective)','IL10/IL10RA loss-of-function (very early onset)','CARD9 S12N','Faecalibacterium prausnitzii depletion','Calprotectin (inflammation)','CRP / ESR','Tight junction proteins (claudin-2)','Short-chain fatty acids (SCFA — butyrate)','CXCL10 (anti-TNF non-response)'],
    findings: 'Metagenomics identifies loss of Firmicutes (Faecalibacterium, Roseburia) and expansion of Proteobacteria and Fusobacteria. scRNA-seq maps PDPN+ inflammatory fibroblast and FOLR2+ macrophage activation driving tissue remodelling. ATAC-seq reveals regulatory remodelling at >200 IBD GWAS loci in intestinal epithelial cells, connecting SNPs to gene regulation.',
    tools: ['GATK','PLINK','DESeq2','Seurat','QIIME2','LEfSe','XCMS','MetaPhAn4'],
    databases: ['NIDDK IBDGC','iHMP / HMP2','gutMEGA','IMG/HMP','IBD Exomes Consortium'],
    africanContext: 'Traditionally low IBD prevalence in rural Africa (protective microbiome hypothesis) vs rapidly rising incidence with urbanisation and westernised diet — making African cohorts an ideal natural experiment for microbiome-disease causality. The INDIGO-IBD consortium is characterising the African urban gut microbiome transition.'
  },

  /* ── METABOLIC ────────────────────────────────────────────── */
  'diabetes-t2': {
    name: 'Type 2 Diabetes (T2D)', category: 'Metabolic', icon: 'droplet',
    color: '#3498db',
    stats: { global: '537M people with T2D · doubling by 2045', africa: 'Africa fastest-growing region; projected 55M by 2045', daly: '52.3M DALYs/yr' },
    sampleTypes: ['Peripheral blood (GWAS / RNA)','Stool (metagenomics)','Urine / plasma (metabolomics)','Adipose biopsy','Pancreatic islets (functional genomics)'],
    description: 'A metabolic disorder of insulin resistance and beta-cell dysfunction. 537 million cases globally. African populations have unique genetic architecture and risk factors.',
    clinicalImpact: 'Population-specific GWAS loci (e.g., African TCF7L2 haplotypes) improve T2D polygenic risk scores (PRS) in African ancestry individuals. Metagenomic Akkermansia muciniphila abundance predicts metformin response. Plasma BCAA metabolomics enables T2D prediction 5 years before diagnosis.',
    workflows: ['wgs','wes','rna-seq','shotgun-meta','16s-amplicon','lc-ms','proteomics'],
    biomarkers: ['TCF7L2 rs7903146 (strongest common variant)','KCNJ11 E23K / ABCC8 variants','SLC16A11 (high frequency in African populations)','HbA1c (glycaemic control)','Fasting glucose and 2-h OGTT','HOMA-IR (insulin resistance)','Akkermansia muciniphila abundance','Branched-chain amino acids (BCAAs)','Acylcarnitines (mitochondrial dysfunction)','Ceramide species (lipotoxicity)'],
    findings: 'GWAS finds >400 T2D loci, with population-specific alleles at higher frequency in African ancestry (SLC16A11). Metagenomics shows Akkermansia muciniphila depletion and increased Clostridium bolteae. Metabolomics identifies BCAA elevation (leucine, isoleucine, valine) as early T2D biomarker predicting disease 5 years before diagnosis.',
    tools: ['PLINK2','REGENIE','METAL','GATK','HUMAnN3','XCMS','MetaboAnalyst','PRSice-2'],
    databases: ['DIAGRAM Consortium (>250K cases)','UK Biobank','AWI-Gen (Africa-specific)','HMDB','T2DKP (T2D Knowledge Portal)','APCDR'],
    africanContext: 'Africa Wits-INDEPTH partnership (AWI-Gen) — the largest African T2D GWAS across 5 African countries. SLC16A11 is present at higher frequency in West African populations. African-specific PRS models outperform European-derived PRS by 2–3 fold in African-ancestry individuals, underscoring the urgent need for African-based genetic studies.'
  },

  /* ── RARE DISEASE ─────────────────────────────────────────── */
  'rare-mendelian': {
    name: 'Rare Mendelian Disorders', category: 'Rare Disease', icon: 'dna',
    color: '#1abc9c',
    stats: { global: '>7,000 rare diseases · 300M affected people', africa: 'Underdiagnosed; consanguinity amplifies homozygous burden', daly: 'Substantial lifetime DALYs; most untreated in Africa' },
    sampleTypes: ['Peripheral blood (proband + parents for trio)','Saliva (germline DNA)','Fibroblasts (functional assays)','RNA from accessible tissue'],
    description: 'Over 7,000 rare diseases, 80% genetic. Exome sequencing has transformed diagnosis — ~35-40% diagnostic yield for unsolved cases.',
    clinicalImpact: 'Trio WGS (proband + parents) increases diagnostic yield to 50%+ by detecting de novo variants. RNA-seq from accessible tissues (blood, fibroblasts) rescues up to 35% of previously unsolved exome cases by identifying splicing variants causing aberrant transcripts. Rapid WGS in ICU neonates achieves diagnosis in <24h, directly changing management in 30–40% of cases.',
    workflows: ['wes','wgs'],
    biomarkers: ['De novo loss-of-function variants (dominant)','Homozygous rare variants (consanguinity → recessive)','Copy number variants (CNVs / >1kb deletions)','Compound heterozygosity (trans rare variants)','Splicing-disrupting variants (SpliceAI score >0.5)','Mitochondrial heteroplasmy variants','Repeat expansions (STRs)','Structural variants (inversions, translocations)','RNA aberrant splicing events','Aberrant expression outliers (RNA-seq)'],
    findings: 'WES identifies causal variants in 35-40% of unsolved rare disease cases. Trio sequencing increases yield to 50%+ via de novo variant detection. Combined WGS + RNA-seq in matched accessible tissues (RNA-seq rescue) solves an additional 10–15% of exome-negative cases through splicing and expression outlier analysis.',
    tools: ['GATK HC','ANNOVAR','VEP (Ensembl)','Phenolyzer','PhenoTips','Franklin (Genoox)','CADD','SpliceAI','ExpansionHunter','OUTRIDER (expression outliers)','FRASER (splicing outliers)'],
    databases: ['ClinVar','OMIM','gnomAD v4 (830K exomes)','HGMD Professional','ClinGen','Matchmaker Exchange','DECIPHER'],
    africanContext: 'High consanguinity rates in North and East African communities increase the prior probability of autosomal recessive disease, enabling shorter variant prioritisation pipelines. Founder effects create unique pathogenic variant spectra absent from European reference databases (gnomAD has <2% African representation). H3Africa rare disease working groups are building the first African variant frequency resource.'
  },

  /* ── EPIGENETICS & DEVELOPMENT ────────────────────────────── */
  'cancer-epigenetics': {
    name: 'Cancer Epigenetics', category: 'Epigenomics', icon: 'lock-open',
    color: '#d2a8ff',
    stats: { global: 'Relevant to >60% of all cancers', africa: 'African epigenome reference maps nearly absent', daly: 'Embedded across all cancer DALYs' },
    sampleTypes: ['FFPE tumour tissue (ATAC-seq with modifications)','Fresh-frozen tumour','Cell lines','Primary patient-derived organoids'],
    description: 'Aberrant DNA methylation, histone modifications, and chromatin remodelling drive cancer gene expression changes independent of DNA sequence mutations.',
    clinicalImpact: 'H3K27ac super-enhancer profiling identifies cancer-specific transcriptional dependencies (BRD4 inhibitors — JQ1, ABBV-075). EZH2 gain-of-function mutations (Y641F in DLBCL) are targeted by tazemetostat. Methylation-based liquid biopsy (EPIC sequencing of cfDNA) enables tissue-of-origin cancer detection from a blood draw.',
    workflows: ['atac-seq','chip-seq','rna-seq','scrna-seq'],
    biomarkers: ['H3K27ac super-enhancers (oncogene activation)','EZH2/PRC2 gain-of-function (Y641, A677, A687)','CpG island methylator phenotype (CIMP)','CTCF binding loss (TAD boundary disruption)','BRD4 occupancy at oncogene promoters','Pioneer TF binding (FOXA1, GATA3)','H3K4me3 at promoters (active TSSs)','H3K27me3 (Polycomb silencing)','ATAC-seq NFR peaks (nucleosome-free regions)','DNA methylation age (epigenetic clock acceleration)'],
    findings: 'ATAC-seq maps cis-regulatory elements hijacked by oncogenic TFs. ChIP-seq identifies H3K27ac super-enhancers driving MYC and other oncogene expression. Combined ATAC+RNA-seq in the same cell (multiome) directly links enhancer accessibility to gene expression at single-cell resolution. DNA methylation profiling of cfDNA enables multi-cancer early detection.',
    tools: ['MACS3','deepTools2','GREAT','HOMER','ChIPseeker','diffBind','ArchR (scATAC)','Signac','ChromVAR'],
    databases: ['ENCODE (>6,000 experiments)','Roadmap Epigenomics','GEO','4D Nucleome','BLUEPRINT Epigenome','IHEC'],
    africanContext: 'African samples are severely under-represented in global reference epigenome maps (ENCODE: <2% African). This creates a critical gap in regulatory variant interpretation for African cancer patients, as enhancer-promoter contact maps used for variant prioritisation are derived almost entirely from European and East Asian cell lines.'
  },

  /* ── ENTERIC DISEASE ─────────────────────────────────────── */
  'cholera': {
    name: 'Cholera (V. cholerae)', category: 'Enteric Disease', icon: 'droplet',
    color: '#0984e3',
    stats: { global: '1.3–4M cases/yr · 21–143K deaths/yr (WHO)', africa: 'DRC, Mozambique, Somalia, Zimbabwe — ongoing outbreaks', daly: '3.6M DALYs/yr' },
    sampleTypes: ['Stool (direct culture + WGS)','Rectal swabs','Environmental water samples','Vibrio isolates'],
    description: 'Severe watery diarrhoea caused by toxigenic Vibrio cholerae O1/O139. The ctxAB-encoded cholera toxin triggers massive intestinal fluid loss — up to 20 L/day. Genomics drives real-time outbreak surveillance.',
    clinicalImpact: 'WGS of V. cholerae isolates provides outbreak strain identification and AMR genotyping in <72h, guiding antibiotic choice (doxycycline vs azithromycin) during active outbreaks. Environmental metagenomics from water sources predicts epidemic risk before clinical cases appear.',
    workflows: ['wgs','shotgun-meta','16s-amplicon','rna-seq'],
    biomarkers: ['ctxAB (cholera toxin genes — virulence)','tcpA (toxin-co-regulated pilus)','O1 vs O139 serogroup','El Tor biotype variants (altered El Tor)','Antimicrobial resistance genes (SXT/ICE integrative element)','Quinolone resistance (gyrA, parC mutations)','ace/zot accessory toxins','VPI-1/VPI-2 pathogenicity islands','7th pandemic lineage (7PET) sublineage','CTX prophage integration site'],
    findings: 'WGS resolves 7th pandemic El Tor transmission waves and identifies multi-drug resistant SXT ICE elements. Phylogenomics traces inter-country spread in real time (e.g., Haiti 2010 traced to South Asian O1 El Tor). RNA-seq of host intestinal epithelial response reveals CFTR-mediated chloride secretion and innate immune activation patterns. Metagenomics of water sources detects pre-epidemic V. cholerae blooms before clinical cases peak.',
    tools: ['Snippy (SNP calling)','Roary (pan-genome)','BEAST2 (phylodynamics)','CARD/RGI (AMR)','Kraken2','BWA-MEM2','PlasmidFinder'],
    databases: ['GenomeTrakr (NCBI)','EnteroBase','PATRIC','ResFinder','WHO GLASS AMR database','VibrioWatch'],
    africanContext: 'Sub-Saharan Africa accounts for the majority of recent cholera deaths. The DRC has had near-continuous outbreaks since 1994. The Africa CDC ICOSASUR network uses WGS for real-time cholera surveillance across 14 countries. Climate change (flooding, cyclones) is dramatically expanding the cholera belt across East and Southern Africa.'
  },

  'typhoid': {
    name: 'Typhoid Fever (S. Typhi)', category: 'Enteric Disease', icon: 'thermometer',
    color: '#fdcb6e',
    stats: { global: '9–11M cases/yr · 128K deaths/yr', africa: 'Sub-Saharan Africa and South Asia highest burden', daly: '11.9M DALYs/yr' },
    sampleTypes: ['Blood culture (gold standard)','Bone marrow aspirate','Stool','S. Typhi isolates (WGS)'],
    description: 'Systemic infection caused by Salmonella enterica serovar Typhi. The emergence of extensively drug-resistant (XDR) Typhi (H58/4.3.1) with plasmid-encoded resistance to ampicillin, chloramphenicol, trimethoprim-sulfamethoxazole, fluoroquinolones, and 3rd-generation cephalosporins is a global public health emergency.',
    clinicalImpact: 'WGS of S. Typhi isolates defines XDR status in <48h, directly determining whether azithromycin or carbapenems are required — critical when empirical cephalosporins fail. Phylogenomic surveillance identifies transmission chains linking travel-imported and locally acquired cases for targeted vaccination campaigns.',
    workflows: ['wgs','rna-seq','shotgun-meta'],
    biomarkers: ['Vi capsular antigen (virulence + vaccine target)','H58 / 4.3.1 lineage (dominant global clone)','IncY plasmid (XDR cassette)','gyrA/gyrB mutations (quinolone resistance)','blaCTX-M-15 (3GC resistance)','qnr genes (plasmid quinolone resistance)','hlyE (cytolysin)','typhoid toxin (cdtB-pltA)','Widal test serology','Nested PCR Ty2 IS200 element'],
    findings: 'WGS resolves the single H58 clade responsible for the XDR typhoid pandemic in Pakistan and its spread to Africa and the UK. Pan-genome analysis identifies horizontally acquired pathogenicity islands (SPI-7, Vi) and AMR elements. RNA-seq of S. Typhi in macrophages reveals intracellular survival strategies (Salmonella pathogenicity island 2 effectors) and host immune suppression mechanisms.',
    tools: ['Snippy','Roary','BEAST2','CARD/RGI','Pathogenwatch (web)','BWA-MEM2','MLST (mlst tool)'],
    databases: ['EnteroBase (S. Typhi)','Centre for Genomic Pathogen Surveillance / Pathogenwatch','PATRIC','NCBI RefSeq CT18','ResFinder','GenomeTrakr'],
    africanContext: 'Sub-Saharan Africa is one of the highest-burden regions for typhoid. XDR Typhi is now established in multiple African countries following importation from Pakistan. The Typhoid Vaccine Acceleration Consortium (TyVAC) is coordinating genomic surveillance alongside vaccine trials across Africa. The STRATAA study generated the largest African S. Typhi WGS dataset from Malawi, Nepal, and Bangladesh.'
  },

  'e-coli-diarrhea': {
    name: 'Diarrhoeagenic E. coli (DEC)', category: 'Enteric Disease', icon: 'microscope',
    color: '#00b894',
    stats: { global: '220M diarrhoeal episodes/yr in children (ETEC/EPEC)', africa: 'Leading cause of childhood diarrhoea in Africa; ETEC dominates', daly: 'Cholera + E. coli: ~25% of global diarrhoeal DALYs' },
    sampleTypes: ['Stool (fresh or preserved in Cary-Blair)','Rectal swabs','E. coli isolates','Environmental samples'],
    description: 'A diverse group of E. coli pathotypes — ETEC, EPEC, STEC/EHEC, EIEC, EAEC, DAEC — each defined by distinct virulence gene combinations. ETEC is the leading bacterial cause of childhood diarrhoea and traveller\'s diarrhoea in Africa and Asia.',
    clinicalImpact: 'Whole metagenome sequencing (WMS) directly from stool classifies pathotype (ETEC, STEC, etc.) and AMR gene burden without culture in <24h, critical in LMICs where culture capacity is limited. STEC O157:H7 and O104:H4 WGS enables urgent outbreak tracking and school/food-source attribution. ETEC colonisation factor antigen typing guides next-generation vaccine formulation.',
    workflows: ['wgs','shotgun-meta','16s-amplicon','rna-seq'],
    biomarkers: ['Heat-labile toxin (LT — eltAB)','Heat-stable toxins (ST-h/ST-p — estA/estB)','Intimin (eae) — EPEC/EHEC attachment','Shiga toxins (stx1, stx2) — STEC/EHEC','Aggregative adherence fimbriae (aaf/II — EAEC)','Bundle-forming pili (bfpA — EPEC)','Invasion plasmid antigen (ipaH — EIEC)','O157:H7 serotype (EHEC)','blaCTX-M ESBL genes','ColV plasmid virulence (ExPEC)'],
    findings: 'WGS pan-genome analysis resolves pathotype definition and resistance island content. Phylogenomics of STEC O157:H7 outbreaks traces contaminated food sources to hours of farm-to-fork chain. Metagenomics reveals the broader gut microbiome context of DEC infection — Proteobacteria blooms and Bifidobacterium depletion that precede clinical illness. RNA-seq of infected enterocytes reveals EPEC effector-mediated actin pedestal formation and tight junction disruption pathways.',
    tools: ['Abricate (virulence genes)','CARD/RGI','PathoFact','MLST','Roary','Snippy','EnteroBase web tool'],
    databases: ['EnteroBase (E. coli; >500,000 genomes)','NCBI RefSeq O157:H7 EDL933','VirulenceFinder (CGE)','ResFinder','VFDB (Virulence Factor Database)','EcMLST'],
    africanContext: 'ETEC is the dominant DEC pathotype causing childhood diarrhoea in Africa, responsible for ~157,000 child deaths annually. The Global Enteric Multicenter Study (GEMS) identified ETEC and Cryptosporidium as leading attributable causes of moderate-to-severe diarrhoea in African children <5 years. The MALED study generated longitudinal metagenomic data from African children tracking gut microbiome development and pathogen carriage.'
  },

  'cryptosporidiosis': {
    name: 'Cryptosporidiosis', category: 'Enteric Disease', icon: 'virus',
    color: '#6c5ce7',
    stats: { global: '48M cases/yr · 57K child deaths/yr', africa: '#2 cause of moderate-to-severe diarrhoea in African children <2 yrs', daly: '4.2M DALYs/yr' },
    sampleTypes: ['Stool (oocysts)','Intestinal biopsy (immunocompromised)','Environmental water samples','Cryptosporidium isolates / oocysts'],
    description: 'Intestinal protozoan parasite (Cryptosporidium parvum and C. hominis) causing profuse watery diarrhoea. In malnourished African children it drives linear growth stunting, cognitive impairment, and increased mortality even after clearance. There is no licensed vaccine and only one partially effective drug (nitazoxanide).',
    clinicalImpact: 'WGS-based gp60 subtype typing distinguishes zoonotic (C. parvum IIa — cattle-driven) from anthroponotic (C. hominis Ib — human-to-human) transmission, directly informing outbreak control strategies. Genomic surveillance identifies drug-resistance mutations in dihydrofolate reductase emerging in African clinical isolates.',
    workflows: ['wgs','shotgun-meta','rna-seq','lc-ms'],
    biomarkers: ['gp60 subtype (Ia/Ib/IIa/IIc — transmission route)','Cryptosporidium species (C. parvum vs C. hominis)','Oocyst shedding density','COWP (oocyst wall protein — diagnostic target)','HSP70 gene (species ID)','Dihydrofolate reductase mutations (drug resistance)','TRAP-C2 (invasion ligand — vaccine target)','CP15/60 glycoprotein (gp15 + gp40 — invasion)','Serum IFN-γ / IL-12 response','ELF-3 intestinal transcription factor (host damage marker)'],
    findings: 'WGS of Cryptosporidium reveals highly variable surface antigens (gp60, gp15) under immune selection — explaining why natural immunity is slow to develop. Comparative genomics identifies a near-complete loss of the de novo purine synthesis pathway, revealing the parasite\'s absolute host dependence as a drug target. RNA-seq of infected intestinal organoids maps CFTR-independent chloride secretion pathways and the invasion-triggered transcriptomic cascade.',
    tools: ['CryptoGO (subtyping)','Snippy','BWA-MEM2','GATK','DESeq2','CryptoDB tools','MEGAN (metagenomics)'],
    databases: ['CryptoDB (CryptosporidiumDB)','GenBank gp60 subtype database','GEMS/MALED study datasets','ENA/SRA','ClinEpiDB'],
    africanContext: 'The GEMS study identified Cryptosporidium as the second most important pathogen causing moderate-to-severe diarrhoea in African children <2 years, yet it remains severely under-resourced. In HIV-positive adults in Africa, disseminated cryptosporidiosis (biliary, respiratory) causes significant mortality. The first large-scale African Cryptosporidium WGS dataset was generated from the MAL-ED birth cohort studies in Tanzania and South Africa.'
  },

  'rotavirus': {
    name: 'Rotavirus Gastroenteritis', category: 'Enteric Disease', icon: 'rotate-cw',
    color: '#e17055',
    stats: { global: '128M cases/yr · 128K child deaths/yr', africa: 'Africa + South Asia: 70% of global rotavirus deaths', daly: '18.3M DALYs/yr' },
    sampleTypes: ['Stool (fresh or -80°C frozen)','Rotavirus isolates / dsRNA','Serum (antibody titres)'],
    description: 'Segmented dsRNA virus (11 segments) causing the leading cause of severe childhood diarrhoea globally. G and P genotype combinations determine strain diversity and vaccine-strain match. African strains show unusual diversity (G1–G4, G8, G9, G12; P[6], P[8]) that reduces vaccine efficacy.',
    clinicalImpact: 'Whole-genome sequencing of rotavirus strains defines G/P genotype constellations and detects vaccine-escape mutations in VP7 and VP4. Vaccine effectiveness monitoring by strain surveillance guides WHO pre-qualification decisions for new-generation vaccines (Rotavac, Rotasiil) formulated for African strain diversity.',
    workflows: ['viral-wgs','rna-seq','shotgun-meta'],
    biomarkers: ['VP7 genotype (G type — 1–4, 8, 9, 12)','VP4 genotype (P type — P[4], P[6], P[8])','Genome constellation (Wa-like vs DS-1-like)','NSP4 (enterotoxin)','VP6 (group antigen — ELISA target)','Reassortant strains (novel constellations)','Serum IgA rotavirus-specific','Vaccine-strain match score','P[6] non-trypsin-cleavable VP4 (affects Rotarix efficacy)','Innate IFN-β suppression signature (NSP1 antagonism)'],
    findings: 'WGS of full 11-segment rotavirus genomes reveals extensive reassortment between human, animal (bovine, porcine), and vaccine strains in Africa. G8P[8] and G12P[6] strains — rare elsewhere — dominate in sub-Saharan Africa. Genomic surveillance shows Rotarix vaccine strains recombining with circulating human strains. RNA-seq of infected intestinal organoids maps NSP4-triggered calcium signalling and the cAMP-independent secretory diarrhoea mechanism.',
    tools: ['RotaVLP (genotyping)','ViPR (viral database tools)','Geneious (manual assembly)','BEAST2','iVar','MAFFT','RAxML (phylogeny)'],
    databases: ['NCBI GenBank Rotavirus division','ViPR (Virus Pathogen Resource)','WHO rotavirus strain surveillance reports','RVGE global burden database','ENA'],
    africanContext: 'Despite rotavirus vaccines being introduced in >40 African countries, efficacy is lower than in high-income countries (50–64% vs 90%+) — partly explained by the higher prevalence of P[6] strains not covered by current vaccines, and by concurrent enteric infections affecting intestinal immune responses. The MORDOR and GEMS studies have built the largest African rotavirus genomic surveillance datasets.'
  },

  /* ══════════════════════════════════════════════════════════
     VIRAL SURVEILLANCE PANEL v2 — ARTHROPOD-TRANSMITTED
     ══════════════════════════════════════════════════════════ */
  'dengue': {
    name: 'Dengue Fever (DENV 1–4)', category: 'Arbovirology', icon: 'virus',
    color: '#ff7b9c',
    stats: { global: '400M infections/yr · 100 countries endemic', africa: 'Emerging; East Africa most affected', daly: '1.1M DALYs/yr' },
    sampleTypes: ['Serum (acute phase — day 1–5)','EDTA whole blood','Urine (late acute)'],
    description: 'Dengue is the most prevalent arboviral disease globally, caused by four antigenically distinct serotypes (DENV 1–4) transmitted by Aedes aegypti and Ae. albopictus mosquitoes. Secondary infection with a different serotype dramatically increases the risk of severe dengue (dengue haemorrhagic fever) through antibody-dependent enhancement (ADE). Clinical spectrum ranges from undifferentiated fever to plasma leakage, haemorrhage, and organ failure.',
    clinicalImpact: 'Viral WGS defines serotype, genotype, and tracks lineage introductions. RNA-seq of dengue-infected cells maps the interferon antagonism by NS5 and the metabolic reprogramming that drives viraemia. Serotype-specific vaccine efficacy (Dengvaxia) depends on prior seroprevalence — genomic surveillance informs vaccination strategy.',
    workflows: ['viral-wgs','rna-seq','shotgun-meta'],
    biomarkers: ['NS1 antigen (acute diagnosis)','Serotype (1–4) by RT-PCR','IgM/IgG seroconversion','Platelet count (thrombocytopaenia)','Haematocrit (haemoconcentration)','Dengue viraemia titre','Genotype cluster (DENV2 Asian-1 vs Cosmopolitan)'],
    findings: 'WGS enables real-time surveillance of serotype shifts (introduction of new genotypes), correlates phylogeographic spread to travel patterns, and identifies amino acid changes in E protein associated with immune evasion. Outbreak genomics have tracked DENV2 Asian-1 genotype explosive spread across Asia and Latin America.',
    tools: ['MAFFT','IQ-TREE','NextStrain','iVar','Minimap2','Geneious'],
    databases: ['NCBI GenBank','ViPR (Virus Pathogen Resource)','WHO APSED dengue reports','DengueMap'],
    africanContext: 'Dengue is endemic in East Africa (Kenya, Tanzania, Djibouti) with underdiagnosis due to co-circulation of malaria and other febrile illnesses. DENV3 dominated the 2019 Tanzania outbreak; Aedes aegypti vector range is expanding with urbanisation. Africa CDC Arboviral Disease Programme supports integrated surveillance.'
  },

  'chikungunya': {
    name: 'Chikungunya (CHIKV)', category: 'Arbovirology', icon: 'virus',
    color: '#ffa657',
    stats: { global: 'Epidemic cycles across Asia, Americas, Africa', africa: 'Recurrent outbreaks East Africa, Indian Ocean islands', daly: '150K DALYs/yr (under-estimated)' },
    sampleTypes: ['Serum (acute phase)','Synovial fluid (arthralgic phase)','EDTA blood'],
    description: 'Chikungunya virus (CHIKV, family Togaviridae, genus Alphavirus) causes a febrile illness with severe debilitating polyarthralgia that can persist for months to years (post-chikungunya chronic arthritis). The 2004–2007 Indian Ocean epidemic — linked to a single E1 A226V mutation enabling Aedes albopictus transmission — illustrates how a single adaptive mutation can transform epidemic potential. Three genotypes: West African (WA), East/Central/South African (ECSA), and Asian.',
    clinicalImpact: 'WGS tracks ECSA vs Asian genotype spread, identifies envelope protein mutations (E1, E2) that affect vector competence, and monitors emergence of new lineages. Arthralgia burden quantification guides healthcare planning. No licensed antiviral; vaccine candidates (mRNA and live-attenuated) are in phase 3 trials as of 2025.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['RT-PCR (acute: days 1–6)','IgM seroconversion','E1 A226V mutation (albopictus-adapted)','Viraemia titre','IL-6/IL-1β (chronic arthritis marker)','Joint ultrasound tenosynovitis score'],
    findings: 'Phylogenomics revealed a single introduction from Africa to La Réunion in 2005, with subsequent global spread of the E1 A226V variant. WGS of patients with chronic arthritis vs acute-only identifies immunogenomic correlates of persistence. NSP1 macrodomain (ADP-ribosylhydrolase) is a therapeutic target.',
    tools: ['BEAST2','IQ-TREE','NextStrain','MAFFT','iVar','Prism 3D (structure)'],
    databases: ['NCBI GenBank','ViPR','WHO CHIKV reports'],
    africanContext: 'The ECSA genotype originated in sub-Saharan Africa and has driven multiple Indian Ocean and Asian epidemics. Kenya, Tanzania, Cameroon, and DRC experience endemic and epidemic CHIKV. Lack of reliable diagnostics and misclassification as malaria leads to chronic arthritis mismanagement in Africa.'
  },

  'zika': {
    name: 'Zika Virus (ZIKV)', category: 'Arbovirology', icon: 'virus',
    color: '#79c0ff',
    stats: { global: '1M+ cases 2015–2016 Americas epidemic', africa: 'Sporadic; ancestral clade circulates silently', daly: 'Significant due to microcephaly burden' },
    sampleTypes: ['Serum (acute)','Urine (higher and longer viraemia than serum)','Semen (sexual transmission)','Amniotic fluid (foetal infection)'],
    description: 'Zika virus (Flaviviridae, genus Flavivirus) gained global attention during the 2015–2016 Brazilian epidemic when it was linked to foetal microcephaly and Guillain-Barré syndrome — the first mosquito-borne virus proven to cause congenital brain malformations. ZIKV is primarily Aedes-transmitted but can also spread sexually and vertically. Two lineages: African (ancestral) and Asian (epidemic). The NS4A/NS4B viral proteins disrupt Akt-mTOR signalling in neural progenitor cells, causing cell cycle arrest.',
    clinicalImpact: 'Genomic surveillance distinguishes Asian vs African lineage, tracks inter-country spread, and identifies antigenic variation that causes DENV cross-reactive serology problems. Congenital Zika syndrome diagnosis combines neonatal brain imaging with maternal ZIKV RT-PCR/serology. Primate animal model studies use WGS + scRNA-seq of foetal brain organoids to map pathogenesis.',
    workflows: ['viral-wgs','rna-seq','scrna-seq'],
    biomarkers: ['RT-PCR serum/urine','PRNT90 (plaque reduction neutralisation — distinguishes ZIKV from DENV)','IgM (cross-reactive with DENV/YFV — difficult)','Brain ultrasound (foetal microcephaly)','Amniotic fluid RT-PCR','Semen ZIKV RNA (up to 6 months)'],
    findings: 'WGS of Brazilian epidemic strains identified unique mutations in NS1 and NS4A vs ancestral African strains, linked to enhanced neurovirulence. Phylogeographic analyses tracked ZIKV introduction to Brazil from French Polynesia via the 2014 Va\'a canoe sprint world championship in Rio. African lineage circulates enzootically in primates across sub-Saharan Africa with limited human spillover.',
    tools: ['BEAST2','IQ-TREE','NextStrain','Minimap2','iVar','RAxML'],
    databases: ['NCBI GenBank','ViPR','ZikaHub','PAHO Zika case counts'],
    africanContext: 'The African lineage of ZIKV has circulated in sub-Saharan Africa (Uganda — first isolated at Zika Forest in 1947 in Rhesus macaques) for decades. Sporadic human cases occur across West and East Africa. The epidemic Asian lineage has not yet caused large African outbreaks, likely due to prior population immunity from cross-reactive flaviviruses (dengue, YFV vaccination).'
  },

  'yellow-fever': {
    name: 'Yellow Fever (YFV)', category: 'Arbovirology', icon: 'virus',
    color: '#e3b341',
    stats: { global: '200,000 cases/yr · 30,000 deaths', africa: '90% of cases; unvaccinated populations at risk', daly: 'Major preventable burden' },
    sampleTypes: ['Serum (acute)','Liver biopsy (fatal cases — midzonal necrosis)','Whole blood'],
    description: 'Yellow fever virus (Flaviviridae) causes a haemorrhagic fever with a pathognomonic biphasic illness: initial febrile phase, brief remission, then toxic phase with jaundice (hence "yellow"), renal failure, haemorrhage, and case fatality rates of 20–50% in toxic phase. Transmitted by Aedes aegypti (urban cycle) and Haemagogus/Aedes (jungle/sylvatic cycle). A safe, effective live-attenuated vaccine (17D) confers lifelong immunity — yet large outbreaks continue due to vaccination gaps.',
    clinicalImpact: 'WGS tracks outbreak origins (Angola 2016 — 965 cases, spread to DRC and China via unvaccinated migrant workers), identifies vaccine-escape variants, and monitors lineage turnover. Liver biopsy histopathology (Councilman bodies) is pathognomonic for YFV. RNA-seq of infected hepatocytes maps the NS5 methyltransferase-mediated IFN antagonism that enables hepatotropic replication.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['RT-PCR (acute phase < 7 days)','YFV IgM ELISA','PRNT (definitive serology)','ALT/AST (hepatitis marker)','Bilirubin (jaundice severity)','Prothrombin time (coagulopathy)','Albuminuria (renal involvement)'],
    findings: 'Phylogenomics of the 2016 Angola-DRC epidemic traced spread from Luanda urban cycle to multiple provinces, with imported cases to China highlighting air-travel amplification risk. WGS identified the E protein genetic determinants of 17D vaccine attenuation and confirmed stability across 40+ years of vaccine production.',
    tools: ['BEAST2','IQ-TREE','NextStrain','iVar','Minimap2','FastTree'],
    databases: ['NCBI GenBank','WHO YFV situation reports','Africa CDC arboviral dashboard','YFV Reference Lab Network (WHO)'],
    africanContext: 'Africa accounts for >90% of global YFV cases. The YF-EPIDEMICS project (Wellcome) provides rapid response genomic sequencing during outbreaks. Major outbreaks: Nigeria 2017–2020 (Africa\'s largest in decades), Angola-DRC 2016. Vaccination campaigns led by Africa CDC and Gavi use genomic data to prioritise geographic targeting.'
  },

  'west-nile': {
    name: 'West Nile Virus (WNV)', category: 'Arbovirology', icon: 'virus',
    color: '#79c0ff',
    stats: { global: 'Endemic across Africa, Europe, Americas, Asia', africa: 'Ancestral — multiple African lineages', daly: 'Rising neuroinvasive disease burden (>2,000 neuroinvasive/yr in USA)' },
    sampleTypes: ['Serum (acute)','CSF (neuroinvasive cases)','Urine','Mosquito pool extractions'],
    description: 'West Nile Virus (Flaviviridae), maintained in a bird-mosquito (Culex spp.) enzootic cycle with humans and horses as dead-end hosts. Most human infections (80%) are asymptomatic; ~20% develop West Nile fever; <1% develop neuroinvasive disease (encephalitis, meningitis, acute flaccid paralysis). Lineage 2 (African origin) caused unexpected outbreaks in Europe (Greece 2010, Hungary). The 1999 USA introduction (Lineage 1) spread coast-to-coast within 4 years.',
    clinicalImpact: 'WGS of WNV strains from blood donors (asymptomatic viraemia risk — major transfusion safety concern) and neuroinvasive patients identifies neurovirulence determinants. NAT screening of blood donations for WNV is mandatory in USA and Europe. CSF PCR + IgM serology for neuroinvasive diagnosis.',
    workflows: ['viral-wgs','shotgun-meta'],
    biomarkers: ['IgM CSF or serum (neuroinvasive)','WNV IgG','RT-PCR (low viraemia — often negative at clinical presentation)','Neutralisation titre (PRNT)','CSF pleocytosis pattern'],
    findings: 'Phylogeographic analysis traced the 1999 NY strain to Israel (Lineage 1), likely via imported birds or infected mosquitoes on cargo. African Lineage 2 strains show distinct phylogeographic patterns with ongoing diversification. Neurovirulence determinants mapped to NS3 helicase and E protein domain III.',
    tools: ['BEAST2','IQ-TREE','NextStrain','Whole-genome sequencing + Geneious','Mosquito surveillance trap networks'],
    databases: ['NCBI GenBank','ArboNET (USA CDC)','WHO WNV reports','European ECDC WNV maps'],
    africanContext: 'WNV is ancestrally African — the first isolate came from Uganda in 1937. Multiple distinct lineages (1, 2, 7, 8) circulate across Africa. Serological evidence shows widespread human exposure across sub-Saharan Africa. Lack of systematic surveillance means true African disease burden is markedly underestimated.'
  },

  'oropouche': {
    name: 'Oropouche Orthobunyavirus (OROV)', category: 'Arbovirology', icon: 'virus',
    color: '#ffa657',
    stats: { global: '500,000+ cases (Americas); emerging in Africa', africa: 'Novel Pan-African lineage detected 2024', daly: 'Underestimated — high attack rates in outbreaks' },
    sampleTypes: ['Serum (acute phase)','EDTA blood','Cerebrospinal fluid (neuroinvasive cases)'],
    description: 'Oropouche virus (Peribunyaviridae) causes Oropouche fever — an acute febrile illness with headache, myalgia, and rash — transmitted by Culicoides paraensis midges and Culex quinquefasciatus. 2024 marked a major epidemiological shift: a novel reassortant lineage emerged in the Amazon, spread to Cuba and Europe via travel, caused vertical transmission with foetal death/microcephaly, and a Pan-African lineage was simultaneously identified.',
    clinicalImpact: 'Whole-genome sequencing of the novel 2024 reassortant reveals segment exchange between the M (medium, encoding glycoproteins) and S (small, encoding nucleocapsid and NSs) segments with a bat virus, explaining the increased virulence. The identification of vertical transmission in 2024 dramatically elevated OROV\'s public health priority. RT-PCR and PRNT are required for diagnosis.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['RT-PCR (acute phase)','OROV IgM/IgG','Reassortant segment genotyping (M/S segment)','Foetal ultrasound (vertical transmission)','CSF OROV RNA (neuroinvasive)'],
    findings: '2024 outbreak genomics showed intercontinental spread from Brazil through 13 countries via travel. Reassortant genome architecture (novel M + L segments from bat reservoir) explained expanded tissue tropism. African isolates form a distinct Pan-African clade, suggesting independent emergence rather than American introduction.',
    tools: ['BEAST2','IQ-TREE','Geneious','iVar','Snippy','Nextstrain'],
    databases: ['NCBI GenBank','ProMED','PAHO epidemiological alerts','Africa CDC emerging threat reports'],
    africanContext: 'A novel Pan-African OROV lineage, genetically distinct from the American lineage, was detected in bat surveillance samples across West and Central Africa in 2024. This suggests OROV or a closely related virus circulates in African wildlife reservoirs. Urgent surveillance is needed to characterise human spillover risk in Africa.'
  },

  /* ══════════════════════════════════════════════════════════
     BLOODBORNE VIRUSES
     ══════════════════════════════════════════════════════════ */
  'hepatitis-b': {
    name: 'Hepatitis B Virus (HBV)', category: 'Viral Hepatitis', icon: 'activity',
    color: '#ff7b72',
    stats: { global: '296M chronic infections · 820,000 deaths/yr', africa: 'Highest global prevalence (≥8% HBsAg in West Africa)', daly: '21M DALYs/yr' },
    sampleTypes: ['Serum','EDTA whole blood','Liver biopsy (fibrosis staging)'],
    description: 'Hepatitis B virus (Hepadnaviridae) is a partially double-stranded DNA virus that causes acute and chronic liver disease, cirrhosis, and hepatocellular carcinoma (HCC). Chronic HBV affects 296 million people — predominantly acquired perinatally or in early childhood. Africa has the highest burden: West Africa (Senegal, Nigeria, Gambia) has HBsAg prevalence >8%. 10 genotypes (A–J) show distinct geographic distribution; genotype A dominates Southern Africa, E dominates West Africa.',
    clinicalImpact: 'HBV sequencing identifies genotype (determines response to pegylated interferon), detects drug resistance mutations (YMDD motif mutations for lamivudine resistance, rtA181T for tenofovir), and quantifies viral load for treatment decisions. HCC surveillance by HBV core promoter mutations (T1762A1764) predicts HCC risk. Covalently closed circular DNA (cccDNA) in hepatocyte nuclei is the viral persistence reservoir — not detected by current antivirals.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['HBsAg (surface antigen — chronic infection marker)','HBeAg/anti-HBe (replication phase marker)','HBV DNA viral load (IU/mL)','Genotype A–J','Drug resistance mutations (YMDD, rtA181T, rtN236T)','Core promoter mutations (BCP: T1762A1764)','HBcrAg (hepatitis B core-related antigen — cccDNA proxy)','Anti-HBc total','Liver fibrosis stage (FIB-4 score)'],
    findings: 'Genomic phylogenomics reveals distinct African HBV clades reflecting ancient African human migration patterns. Genotype E (West African origin) shows lowest response rates to interferon therapy. Intra-host diversity analysis by deep sequencing identifies minor resistance variants before treatment failure. Recombinant HBV strains (genotype A/E) with unusual serological profiles complicate diagnosis in Africa.',
    tools: ['HBVdb (genotyping)','Geno2Pheno HBV','BEAST2','PhyML','Stanford HBV Drug Resistance Database'],
    databases: ['HBVdb','NCBI GenBank','WHO HBV situation reports','African Cancer Registry (HCC link)'],
    africanContext: 'Sub-Saharan Africa has the highest HBV-attributable HCC rates globally. Perinatal transmission remains common despite birth-dose vaccination programs (coverage gap in many African countries). The Africa Hepatitis B Collaborative (AHEPB) leads African HBV genomics. In Africa, Hepatitis B accounts for 60–70% of HCC — the leading cancer in many countries. Tenofovir is WHO-recommended but access in Africa remains a challenge.'
  },

  'hepatitis-c': {
    name: 'Hepatitis C Virus (HCV)', category: 'Viral Hepatitis', icon: 'activity',
    color: '#d2a8ff',
    stats: { global: '58M chronic infections · 290,000 deaths/yr', africa: 'Egypt historically highest (genotype 4 — medical injection campaigns)', daly: '13M DALYs/yr' },
    sampleTypes: ['Serum','EDTA whole blood (for genotyping)','Liver biopsy (pre-treatment staging)'],
    description: 'Hepatitis C virus (Flaviviridae) is a positive-sense single-stranded RNA virus causing chronic liver disease in 58 million people. HCV has no vaccine but is curable with 8–12 week direct-acting antiviral (DAA) regimens (sofosbuvir + daclatasvir, ledipasvir/sofosbuvir). Seven genotypes (1–7) with distinct geographic distributions: genotype 1 (North America, Europe), genotype 4 (Africa, Middle East), genotype 5/6 (Southern Africa, Southeast Asia). The HCV RNA-dependent RNA polymerase (NS5B) has no proofreading, generating enormous quasispecies diversity.',
    clinicalImpact: 'HCV genotyping directs DAA regimen selection (genotype 1–6) and identifies resistance-associated substitutions (RAS) in NS3/NS5A/NS5B. Viral load monitoring (HCV RNA IU/mL) assesses treatment response (SVR12 — sustained virological response at 12 weeks post-treatment = cure). Deep sequencing detects minor RAS variants below Sanger detection threshold. WHO 2030 elimination target requires ≥80% treatment coverage.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['HCV antibody (anti-HCV — past or current exposure)','HCV RNA (active infection)','Genotype 1–7','NS5A RAS (L31, Y93 — daclatasvir resistance)','NS5B RAS (S282T — sofosbuvir resistance)','SVR12 (cure endpoint)','Liver fibrosis (FIB-4, APRI)','Cryoglobulins (extra-hepatic manifestation)'],
    findings: 'HCV quasispecies diversity (intra-host sequence heterogeneity) predicts treatment response and immune evasion. Phylogenomics traced Egypt genotype 4 epidemic to parenteral anti-schistosomal therapy campaigns (1950s–1980s). African genotype 7 (identified in Canada in an immigrant from Central Africa) represents a rare ancient lineage from DRC.',
    tools: ['Geno2Pheno HCV','BLAST','Phylogenetic tools (IQ-TREE, BEAST)','DeepSeq for RAS detection','HCV GLUE (genotyping platform)'],
    databases: ['NCBI GenBank HCV','HCV Genetic Feature Database (NCBI)','EuroHep','WHO HCV reports'],
    africanContext: 'Egypt had the highest HCV prevalence globally (10–15%) due to iatrogenic transmission via intravenous antischistosomal campaigns — declining since the 1990s birth cohort following mass DAA treatment campaigns. West Africa (Cameroon, DRC) has unique genotypes 4 and rare genotype 7. Pan-genotypic DAA regimens (sofosbuvir/velpatasvir) cover all African genotypes — but access and affordability remain barriers despite generic manufacturing.'
  },

  /* ══════════════════════════════════════════════════════════
     ENCEPHALITIS VIRUSES
     ══════════════════════════════════════════════════════════ */
  'nipah': {
    name: 'Nipah Virus (NiV)', category: 'Encephalitis Viruses', icon: 'brain',
    color: '#ff7b72',
    stats: { global: 'Sporadic high-CFR outbreaks (40–75% CFR) — Bangladesh, India, Malaysia', africa: 'African fruit bats reservoir; spillover risk identified', daly: 'Critical biosafety level 4 priority pathogen' },
    sampleTypes: ['CSF (neurological cases)','Serum','Respiratory secretions (BSL-4 required)','Throat swab'],
    description: 'Nipah virus (Paramyxoviridae, genus Henipavirus) is a BSL-4 pathogen causing fatal encephalitis (CFR 40–75%) with human-to-human transmission capacity — making it a priority pandemic-threat pathogen. Reservoir: Pteropus fruit bats (Asia) and African Eidolon helvum bats. Routes of spillover: contaminated date palm sap (Bangladesh), pig-to-human (Malaysia 1998–1999 origin outbreak), and nosocomial. No approved antiviral; monoclonal antibody m102.4 and remdesivir show experimental efficacy.',
    clinicalImpact: 'Whole-genome sequencing of NiV strains distinguishes Bangladesh (NiV-B) from Malaysia (NiV-M) genotypes — critical for vaccine design as they differ significantly in F and G glycoproteins. MRVP-based sequencing from BSL-4 facilities supports outbreak response genomics. RNA-seq of patient samples defines the cytokine storm profile. Serosurveys using pseudotyped virus neutralisation assays assess bat-to-human exposure rates safely.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['NiV RT-PCR (respiratory/CSF)','NiV IgG/IgM (ELISA, PRNT under BSL-4)','Seroneutralisation (pseudotyped NiV)','MRI brain (encephalitic lesions)','EEG (encephalitis pattern)','CSF pleocytosis','G/F glycoprotein genotype (B vs M)'],
    findings: 'African Eidolon helvum bats carry Eidolon helvum henipavirus (EhV) — serologically cross-reactive with NiV, suggesting continent-wide bat reservoir risk. Genomic surveillance in African fruit bats (Ghana, Cameroon, Nigeria) has detected Nipah-related paramyxoviruses. The WHO R&D Blueprint prioritises NiV; mRNA vaccine (Moderna mRNA-1215) entered phase 1 clinical trials in 2023.',
    tools: ['BSL-4-compliant sequencing protocols','BEAST2','IQ-TREE','Pseudotyped virus assay platforms','Bat surveillance GPS tracking'],
    databases: ['NCBI GenBank','PRE-EMPT (NiV surveillance)','PREDICT project database','WHO NiV situation reports'],
    africanContext: 'While NiV outbreaks have not occurred in Africa, African fruit bat serosurveys detect neutralising antibodies against NiV-related henipaviruses. Ghana and Nigeria have detected novel henipaviruses in bats (e.g., Kumasi virus, Ghana bat virus). With Africa\'s expanding fruit bat-human interface, NiV spillover risk is considered a priority by Africa CDC\'s Emerging & Re-emerging Disease Unit.'
  },

  'rabies': {
    name: 'Rabies Lyssavirus (RABV)', category: 'Encephalitis Viruses', icon: 'brain',
    color: '#A8A098',
    stats: { global: '59,000 deaths/yr (99% dog-mediated)', africa: '36% of global deaths — highest burden in Africa & Asia', daly: '3.7M DALYs/yr' },
    sampleTypes: ['Brain tissue (post-mortem — gold standard)','Nuchal skin biopsy (antemortem)','CSF','Saliva (RT-PCR)','Serum (virus-neutralising antibody titre)'],
    description: 'Rabies is caused by Rabies lyssavirus (Rhabdoviridae, genus Lyssavirus), one of 16 lyssavirus species that collectively cause rabies encephalitis. Once clinical symptoms appear, rabies is virtually 100% fatal. Dogs are responsible for 99% of human deaths globally. Lyssavirus species 2–16 include bat-associated viruses: European Bat Lyssavirus (EBLV) 1&2, Duvenhage (Africa), Lagos Bat Virus (West Africa), Mokola (Africa), and Australian Bat Lyssavirus.',
    clinicalImpact: 'WGS of rabies virus strains traces transmission networks (dog bites → human cases → phylogeographic cluster), identifies cross-boundary dog-mediated transmission between countries, and differentiates lyssavirus species (critical because standard post-exposure prophylaxis may be ineffective against some bat lyssaviruses). Mass dog vaccination is the proven strategy to eliminate dog-mediated rabies — genomic data confirms elimination.',
    workflows: ['viral-wgs'],
    biomarkers: ['Direct Fluorescent Antibody (DFA) — brain gold standard','RT-PCR (nuchal biopsy, saliva)','RFFIT (rapid fluorescent focus inhibition — VNA titre ≥ 0.5 IU/mL for PEP adequacy)','Lyssavirus species identification (N gene phylogeny)','Negri bodies (histopathology)'],
    findings: 'Whole N gene or full-genome phylogeny reveals that African dog rabies forms distinct lineages reflecting historical trading routes and dog movement. The African rabies cosmopolitan lineage spread globally with Portuguese colonisation. Bat lyssaviruses (Lagos Bat, Duvenhage, Mokola) circulate in African wildlife with rare human spillover — all fatal. Phylogenomics supports One Health approaches integrating dog vaccination campaigns and human post-exposure prophylaxis access.',
    tools: ['BEAST2','IQ-TREE','RAxML','DFA-Direct Fluorescent Antibody (diagnostics)','RFFIT (VNA)','Geneious'],
    databases: ['NCBI GenBank','RABV-GLUE (phylotyping web tool)','WHO rabies situation reports','Global Alliance for Rabies Control (GARC)'],
    africanContext: 'Africa accounts for 36% of global rabies deaths (estimated 21,000/yr) — concentrated in rural communities with high dog density and limited PEP access. Democratic Republic of Congo, Ethiopia, Nigeria, and Tanzania have the highest burdens. The Zero by 30 initiative (WHO/OIE/FAO/GARC) aims to eliminate dog-mediated human rabies globally by 2030 through coordinated dog vaccination and PEP access. Africa CDC supports national rabies elimination programs.'
  },

  /* ══════════════════════════════════════════════════════════
     RESPIRATORY VIRUSES
     ══════════════════════════════════════════════════════════ */
  'influenza': {
    name: 'Influenza A/B/C Viruses', category: 'Respiratory Viruses', icon: 'activity',
    color: '#58a6ff',
    stats: { global: '1B cases/yr · 3–5M severe · 290–650K deaths/yr', africa: 'Significant burden; influenza seasons vary by hemisphere zone', daly: '34.4M DALYs/yr (est.)' },
    sampleTypes: ['Nasopharyngeal swab (NPS)','Nasal wash','Bronchoalveolar lavage (ICU patients)','EDTA blood (for host genetics)'],
    description: 'Influenza viruses (Orthomyxoviridae) have segmented RNA genomes enabling rapid reassortment — the mechanism behind pandemic emergence. Influenza A is the most clinically significant: classified by H (haemagglutinin, 18 types) and N (neuraminidase, 11 types). Circulating seasonal strains: H1N1pdm09 (2009 pandemic origin), H3N2. Influenza B (Victoria and Yamagata lineages). Influenza C: mild. Of 22 Influenza A subtypes in birds, H5N1 and H5N2 caused the unprecedented 2024 USA cattle/dairy outbreak with human infections.',
    clinicalImpact: 'WGS is essential for vaccine strain selection (WHO biannual recommendations), antiviral resistance surveillance (oseltamivir-resistant N1: H275Y mutation), pandemic preparedness, and nosocomial outbreak investigation. GISAID platform coordinates global influenza genomic surveillance. Next-generation influenza vaccines (mRNA, universal) use WGS data to target conserved HA stalk or M2e epitopes.',
    workflows: ['viral-wgs','rna-seq','shotgun-meta'],
    biomarkers: ['RT-PCR (rapid Ag test or RT-PCR)','H subtype (H1, H3, H5, H7)','N subtype (N1, N2)','Oseltamivir resistance (N1 H275Y, N2 E119V)','Baloxavir resistance (PA I38T)','HA phylogenetic clade (3C.2a, 1A)','PB2 627K (mammalian adaptation of avian strains)','HA receptor binding domain mutations'],
    findings: 'The 2009 H1N1 pandemic strain was a triple reassortant (human H3N2 + classic swine H1N1 + Eurasian avian-like swine H1N1), identified within weeks using WGS. GISAID contains >7 million influenza genomes enabling real-time global surveillance. 2024 H5N1 clade 2.3.4.4b cattle outbreak WGS identified PB2 E627K mammalian adaptation mutations in some human cases.',
    tools: ['NextStrain (flu.nextstrain.org)','BEAST2','FluSurver (GISAID mutation mapper)','Augur (NextStrain pipeline)','IRMA (influenza reference-based mapping)','LABEL (lineage assignment)'],
    databases: ['GISAID EpiFlu','NCBI Influenza Virus Resource','WHO FluNet','CDC flu surveillance'],
    africanContext: 'Africa participates in WHO GISRS (Global Influenza Surveillance Response System) through 22 national influenza centres. The Africa Centre for Disease Control supports African Influenza Surveillance. Seasonal influenza in Africa peaks differently by sub-region (bimodal in equatorial regions; austral winter in Southern Africa; boreal winter in Northern Africa). Influenza vaccination coverage in Africa remains the lowest globally (<5% in most countries). The Africa mRNA Technology Transfer Hub (WHO/BioNTech — South Africa) will produce mRNA influenza vaccines for Africa by 2026.'
  },

  'rsv': {
    name: 'Respiratory Syncytial Virus (RSV A & B)', category: 'Respiratory Viruses', icon: 'activity',
    color: '#00C4A0',
    stats: { global: '33M lower respiratory infections in children < 5/yr · 100K deaths', africa: 'Highest infant mortality from RSV globally', daly: '2.6M DALYs/yr' },
    sampleTypes: ['Nasopharyngeal swab','Nasal wash','BAL (ICU)','Serum (serology)'],
    description: 'RSV (Pneumoviridae) is the leading cause of bronchiolitis and viral pneumonia in infants and young children globally — the single most important cause of paediatric hospitalisation in the first 2 years of life. Two antigenic groups (A and B) co-circulate with alternating dominance. Major recent advance: RSVpreF vaccine (Pfizer Abrysvo) and RSVpreF3 (GSK Arexvy) approved 2023 for adults ≥60 years and maternal vaccination (protecting infants via transferred antibodies). Nirsevimab (Sanofi/AZ) monoclonal antibody approved for infants.',
    clinicalImpact: 'WGS defines RSV A and B genotypes (ON1, BA9 dominant since 2012), tracks vaccine-escape G protein mutations, and enables outbreak investigation in neonatal units. RNA-seq of RSV-infected airway epithelium maps the NS1/NS2-mediated IFN suppression causing susceptibility to secondary bacterial pneumonia. Maternal vaccine immunogenicity correlates with neonatal neutralising antibody titres protecting against severe disease in first 6 months of life.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['Rapid RSV antigen test (NPS)','RT-PCR (group A vs B)','G gene genotype (ON1, BA9)','Serum neutralising antibody titre','Nirsevimab binding site mutations (site II of F protein)','Oxygen saturation (severity marker)'],
    findings: 'WGS revealed that the RSV A ON1 genotype (with a 72-nucleotide duplication in the G gene) emerged around 2010 and has become globally dominant, displacing GA2. Similarly, BA genotype (60-nucleotide G duplication) now dominates RSV B. Post-nirsevimab deployment surveillance must monitor for site II F protein escape mutations.',
    tools: ['RSV-GLUE (genotyping)','NextStrain RSV','Geneious','IQ-TREE','BEAST2'],
    databases: ['NCBI GenBank RSV','GISAID (RSV module)','WHO RSV reports','PERCH study database (African RSV burden)'],
    africanContext: 'Sub-Saharan Africa has the highest RSV-attributable infant mortality globally. The PERCH (Pneumonia Etiology Research for Child Health) study, conducted in 7 African/Asian countries, demonstrated RSV as the second most common pneumonia pathogen (after Streptococcus pneumoniae) in hospitalised African children. RSV surveillance in Africa is led by the SARI (Severe Acute Respiratory Infection) network. Maternal RSV vaccination is prioritised for Africa where healthcare access for sick infants is limited.'
  },

  'mers-cov': {
    name: 'MERS-CoV', category: 'Respiratory Viruses', icon: 'activity',
    color: '#d2a8ff',
    stats: { global: '2,600 cases since 2012 · 35% CFR', africa: 'Dromedary camels across Africa are reservoir — spillover risk', daly: 'High CFR — disproportionate severe burden' },
    sampleTypes: ['Lower respiratory (BAL, tracheal aspirate)','NPS/NPA','Serum','Camel nasal swabs (zoonotic surveillance)'],
    description: 'MERS-CoV (Middle East Respiratory Syndrome Coronavirus) is a betacoronavirus that emerged in Saudi Arabia in 2012, using DPP4 (dipeptidyl peptidase-4) as its cell entry receptor. Dromedary camels are the zoonotic reservoir; human-to-human transmission occurs mainly in hospital settings (37% CFR in secondary cases). The 2015 South Korea nosocomial outbreak (186 cases from a single imported case) demonstrates the healthcare amplification risk. Despite its geographic name, African dromedaries carry MERS-CoV strains.',
    clinicalImpact: 'WGS defines spike protein sequence for vaccine design (targeting receptor-binding domain), identifies recombinant lineages, and detects hospital-acquired transmission chains (phylogenetic clustering within outbreak). RNA-seq shows MERS-CoV uniquely inhibits STAT1/STAT2 nuclear import (complete IFN evasion), explaining extreme lethality. No approved antiviral; remdesivir shows in vitro efficacy.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['RT-PCR lower respiratory (higher sensitivity than NPS)','MERS-CoV serology (surrogate neutralisation)','Spike RBD sequence','DPP4 receptor binding domain contacts','Camel seroprevalence (anti-MERS IgG)','Bat lineage (ancestral coronavirus identification)'],
    findings: 'Phylogeographic analysis shows a single zoonotic origin of all human MERS-CoV lineages from African/Middle Eastern camels approximately 20–30 years ago. African camel strains (Ethiopia, Egypt, Nigeria, Kenya) cluster as outgroups to Middle Eastern epidemic strains, confirming Africa as the ancestral reservoir. WHO Joint External Evaluation recommends African countries with dromedary populations develop MERS preparedness plans.',
    tools: ['BEAST2','IQ-TREE','NextStrain','Geneious','MAFFT'],
    databases: ['NCBI GenBank MERS','WHO MERS situation reports','PREDICT project (camel surveillance)','GISAID (coronavirus section)'],
    africanContext: 'African dromedaries from Ethiopia, Nigeria, Egypt, Morocco, Sudan, and Kenya carry MERS-CoV seroprevalence rates of 80–100% — much higher than Saudi camels. Despite high camel-human contact in Africa (camel pastoralists, abattoir workers), documented human MERS cases in Africa are very rare — possibly due to distinct African clades with reduced spillover potential or under-detection. Africa CDC\'s Integrated Disease Surveillance and Response (IDSR) includes MERS preparedness.'
  },

  /* ══════════════════════════════════════════════════════════
     HEMORRHAGIC FEVER VIRUSES
     ══════════════════════════════════════════════════════════ */
  'ebola': {
    name: 'Ebola Virus (EBOV) & Filovirus Family', category: 'Hemorrhagic Fever', icon: 'flame',
    color: '#e5534b',
    stats: { global: '35,000+ cases in 2013–2016 West Africa epidemic · ~50% CFR', africa: 'Endemic to sub-Saharan Africa', daly: 'High per-case burden' },
    sampleTypes: ['Whole blood (BSL-4 required)','Serum (inactivated for serology)','Urine (safer persistence)','Semen (immune-privileged persistence)'],
    description: 'Ebola virus disease (EVD) is caused by six species in the genus Ebolavirus (Zaire/EBOV, Sudan/SUDV, Bundibugyo/BDBV, Tai Forest/TAFV, Reston/RESTV, Bombali/BOMV). The 2013–2016 West Africa epidemic (Guinea, Sierra Leone, Liberia) — the largest in history (28,000 cases, 11,000 deaths) — transformed the Ebola response. Two licensed vaccines (rVSV-ZEBOV/Ervebo; Ad26.ZEBOV+MVA-BN-Filo) and two monoclonal antibodies (atoltivimab/maftivimab/odesivimab/Inmazeb; ansuvimab/Ebanga) are now approved.',
    clinicalImpact: 'WGS of EBOV strains during the 2013–2016 epidemic enabled real-time tracking of transmission chains (1,000+ genomes sequenced within 12 months), identified human-to-human adaptation mutations (GP A82V — increased infectivity for human cells), and detected semen-mediated sexual transmission causing late flare-ups. scRNA-seq of EBOV-infected monocytes maps the cytokine storm mechanism. Point-of-care sequencing (Nanopore MinION in mobile BSL-4 labs) was deployed in DRC 2018–2020 outbreak.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['RT-PCR (EBOV NP gene — diagnostic)','Rapid antigen test (OraQuick Ebola — point of care)','IgG (survivor/vaccine response)','GP A82V adaptive mutation','Species identification (Zaire vs Sudan vs Bundibugyo)','Viral load (correlates with CFR)','Fibrin D-dimer (DIC marker)','ALT/AST (hepatitis severity)'],
    findings: 'The 2021 Guinea re-emergence genomics showed the new outbreak derived from a survivor of the 2014–2016 epidemic — RNA-seq confirmed long-term EBOV persistence in immune-privileged sites (testes, eye, CNS). DRC 2018–2020 outbreak WGS identified early transmission chains enabling targeted ring vaccination. Bombali virus (BOMV), detected in Molossus bats in Sierra Leone and Guinea, is the first ebolavirus found in common domestic bats — ongoing surveillance assesses spillover risk.',
    tools: ['Minimap2 (Nanopore reads)','Geneious','BEAST2','IQ-TREE','NextStrain Ebola','iVar'],
    databases: ['NCBI GenBank Filoviridae','GISAID Ebola','WHO Ebola situation reports','Africa CDC Ebola dashboard'],
    africanContext: 'All Ebola outbreaks have occurred in Africa (except one accidental Reston EBOV exposure in the Philippines). DRC has had the most outbreaks (15+). The H3Africa and Wellcome Sanger Institute led real-time genomic surveillance during the 2018–2020 DRC North Kivu outbreak in a conflict zone — demonstrating feasibility of outbreak genomics under challenging conditions. Africa CDC\'s Regional Integrated Surveillance and Laboratory Network (RISLNET) maintains EBOV response capacity.'
  },

  'marburg': {
    name: 'Marburg Virus (MARV)', category: 'Hemorrhagic Fever', icon: 'flame',
    color: '#ff7b72',
    stats: { global: 'Rare but highly lethal outbreaks (24–88% CFR)', africa: 'Central and East Africa; bat reservoir in African caves', daly: 'Extreme per-case burden — BSL-4 pathogen' },
    sampleTypes: ['Blood (BSL-4)','Serum (inactivated)','Urine','Egyptian fruit bat samples (surveillance)'],
    description: 'Marburg virus (Filoviridae, genus Marburgvirus) causes Marburg virus disease (MVD) with case fatality rates of 24–88%. Natural reservoir: Egyptian fruit bat (Rousettus aegyptiacus) in caves across Africa. Human outbreaks associated with cave exposure (mining, tourism). Notable outbreaks: Angola 2005 (252 cases, 90% CFR — largest ever); Equatorial Guinea 2023; Rwanda 2024. No licensed vaccine or antiviral; rVSVΔG-MARV-GP vaccine in Phase 2 efficacy trials.',
    clinicalImpact: 'WGS of MARV strains differentiates Ravn virus (RAVV) from Marburg virus species, traces outbreak origins to bat caves, and identifies human adaptation mutations in GP and NP. Real-time genomic surveillance (Rwanda 2024) used Nanopore sequencing to confirm the outbreak and guide contact tracing within 48h. VP35 interferon antagonism makes MARV exquisitely lethal.',
    workflows: ['viral-wgs'],
    biomarkers: ['RT-PCR (MARV NP/VP40 gene)','Species (MARV vs RAVV by genome sequencing)','Rapid antigen (in development)','IgG serology (survivors)','Bat seroprevalence (Rousettus aegyptiacus)','Viral load (correlates with CFR)'],
    findings: 'Phylogenomics of Marburg virus strains from different outbreaks and Rousettus bat populations reveals deep evolutionary divergence, with bat virus diversity far exceeding what has been seen in human outbreaks. Rwanda 2024 genomic analysis rapidly confirmed the strain was Marburg (not Ebola) and revealed it was a novel lineage distinct from previous outbreaks, reshaping the contact tracing and response priorities.',
    tools: ['Geneious','BEAST2','IQ-TREE','Nanopore MinION (field deployment)','iVar'],
    databases: ['NCBI GenBank Filoviridae','WHO MARV situation reports','Africa CDC emerging threats','PREDICT bat surveillance database'],
    africanContext: 'All Marburg outbreaks have occurred in Africa (excluding the original 1967 Frankfurt/Belgrade laboratory exposure). African cave bats serve as the natural reservoir. Uganda, DRC, Kenya, Angola, Equatorial Guinea, and Rwanda have all reported outbreaks. Africa CDC supports MARV rapid response capacity and partners with WHO for ring vaccination trials using the rVSV-MARV vaccine during outbreaks.'
  },

  'lassa': {
    name: 'Lassa Fever Virus (LASV)', category: 'Hemorrhagic Fever', icon: 'flame',
    color: '#ffa657',
    stats: { global: '100,000–300,000 infections/yr · 5,000 deaths · West Africa endemic', africa: 'Nigeria, Sierra Leone, Guinea, Liberia — meomeric endemic zone', daly: '650,000+ DALYs/yr' },
    sampleTypes: ['Serum (BSL-3 or 4 depending on viral load)','Urine (high viral shedding)','Throat swab','Mastomys rodent samples'],
    description: 'Lassa virus (Arenaviridae) is endemic in West Africa with an estimated 100,000–300,000 human infections annually. Reservoir: Mastomys natalensis (multimammate rat) — chronically infected without disease. Human transmission via rodent urine/feces contamination of food. 80% of human infections are mild or asymptomatic; 20% develop severe multisystem haemorrhagic fever. Ribavirin (antiviral) reduces mortality if started within 6 days of onset. No licensed vaccine; multiple candidates in clinical trials (rVSV-LASV, mRNA, ChAd).',
    clinicalImpact: 'WGS distinguishes the four main LASV lineages (I–IV) correlating with geographic distribution. Lineage II/III (Nigeria) dominate current outbreaks; Lineage IV (Sierra Leone/Guinea) was responsible for the 2014–2015 Sierra Leone epidemic during the Ebola crisis. Viral load >10⁶ copies/mL correlates with severe disease and fatal outcome. Sensorineural hearing loss is the most common sequela — occurs in 30% of survivors.',
    workflows: ['viral-wgs','rna-seq'],
    biomarkers: ['RT-PCR (diagnostic — NP or GP targets)','LASV IgG/IgM (serology)','Antigen RDT (in development — WHO-validated)','Lineage (I–IV by phylogeny)','Viral load (IU/mL — prognostic)','SGPT/ALT','Sensorineural hearing loss assessment (audiometry)','Mastomys seroprevalence in community surveillance'],
    findings: 'LASV genomics reveals ongoing diversification within lineages and evidence of bat-independent rodent population structuring driving lineage geography. The Irrua Specialist Teaching Hospital (Nigeria) has built the largest African Lassa genomic surveillance dataset. Ribavirin treatment response correlates with viral load kinetics captured by serial RT-PCR. Lineage-specific vaccine efficacy is a concern — current vaccines designed against Sierra Leone strains may have reduced efficacy against Nigerian lineages.',
    tools: ['BEAST2','IQ-TREE','Geneious','iVar','Snippy','Nextstrain Lassa'],
    databases: ['NCBI GenBank Arenaviridae','ViPR','WHO Lassa fever situation reports','Africa CDC Lassa dashboard'],
    africanContext: 'Lassa fever is the most important viral haemorrhagic fever in terms of public health burden in West Africa. Nigeria alone reports 1,000–5,000 confirmed cases annually. Sierra Leone and Guinea have the highest seroprevalence (up to 50% in endemic areas). The Kenema Government Hospital (Sierra Leone) and Irrua Specialist Teaching Hospital (Nigeria) are globally important Lassa surveillance and treatment centres. The H3Africa consortium has generated important West African Lassa genomic datasets.'
  },

  'rift-valley-fever': {
    name: 'Rift Valley Fever Virus (RVFV)', category: 'Hemorrhagic Fever', icon: 'flame',
    color: '#e3b341',
    stats: { global: 'Africa and Arabian Peninsula; epizootics every 5–15 years', africa: 'Kills hundreds of thousands of livestock; human fatalities during epizootics', daly: 'Major One Health — animal + human burden' },
    sampleTypes: ['Serum','EDTA blood (PCR)','Liver biopsy (post-mortem)','Mosquito pools','Animal blood (One Health surveillance)'],
    description: 'Rift Valley Fever virus (Phenuiviridae, genus Phlebovirus) is a three-segment RNA virus (L, M, S segments) causing acute febrile illness in humans with occasional ocular, haemorrhagic, and encephalitic complications (1–2% of cases but high lethality). RVFV causes devastating epizootics in livestock (abortion storms, massive neonatal death) across Africa. Transmitted by Aedes and Culex mosquitoes; also by direct contact with infected animal fluids (veterinarians, abattoir workers, farmers at high risk). No licensed human vaccine.',
    clinicalImpact: 'WGS of RVFV strains during outbreaks tracks spread between animal and human populations (One Health genomics), identifies reassortant strains, and monitors evolution. RNA-seq defines the NSs protein-mediated IFN-β suppression as the major virulence determinant. Veterinary surveillance (animal abortion rates, insect trapping after heavy rainfall) enables early warning before human cases occur.',
    workflows: ['viral-wgs','rna-seq','shotgun-meta'],
    biomarkers: ['RT-PCR (acute phase — L segment)','RVFV IgM/IgG ELISA','Rapid antigen (in development)','Lineage A–H by phylogeny','Aedes seroprevalence (entomological surveillance)','Livestock abortion rate (syndromic surveillance)','Liver enzyme elevation (hepatic involvement)'],
    findings: 'RVFV phylogeographic analysis of the 2006–2007 Kenya, Somalia, Tanzania outbreak traced spread along livestock trading routes and identified multiple introduction events from a Central African source population. Reassortment between RVFV strains generates genetic diversity rapidly. Mathematical models incorporating WGS data and climate drivers (El Niño rainfall — mosquito breeding) improve outbreak prediction.',
    tools: ['BEAST2','IQ-TREE','Geneious','iVar','Mosquito surveillance platforms','RVF RISK (EMPRES-i FAO)'],
    databases: ['NCBI GenBank','WHO RVFV situation reports','EMPRES-i (FAO animal disease database)','Africa CDC One Health dashboard'],
    africanContext: 'RVFV is endemic across sub-Saharan Africa (Kenya, Tanzania, Sudan, Egypt, South Africa, Zimbabwe, Senegal, Mauritania) with major human and livestock epizootics following heavy rainfall (El Niño events — 2006–2007 East Africa; 1997–1998 East Africa; 2000 Arabian Peninsula). The virus poses a significant risk to pastoralist communities and the livestock economy. Africa CDC and FAO coordinate the One Health RVFV response. The veterinary RVF vaccine (Clone 13) is widely used in Africa.'
  },

  'cchf': {
    name: 'Crimean-Congo Hemorrhagic Fever (CCHF)', category: 'Hemorrhagic Fever', icon: 'flame',
    color: '#d2a8ff',
    stats: { global: 'Endemic across Africa, Middle East, Asia, Europe · 30% CFR', africa: 'Sub-Saharan Africa — major tick-endemic zone', daly: 'High — especially in healthcare workers' },
    sampleTypes: ['Serum (BSL-3/4)','EDTA blood','Tick pools (Hyalomma spp. surveillance)'],
    description: 'Crimean-Congo Hemorrhagic Fever virus (CCHFV, Nairoviridae, genus Orthonairovirus) is a tick-borne BSL-4 pathogen transmitted primarily by Hyalomma ticks. Causes severe haemorrhagic fever with a 3-phase illness: incubation → haemorrhagic → convalescence. CFR 10–40% without treatment; ribavirin reduces mortality. Nosocomial transmission via blood/bodily fluids is a major risk for healthcare workers — PPE adherence is critical. CCHFV has the widest geographic range of any tick-borne haemorrhagic fever virus.',
    clinicalImpact: 'WGS defines CCHFV lineages (I–VII, Asia1–3), tracks Hyalomma tick population movements with livestock, and identifies recombinant strains (L, M, S segment reassortment). Spike (GP) phylogeny correlates with geographic lineage and informs vaccine design. WHO R&D Blueprint-listed; vaccine candidates (Modified Vaccinia Ankara MVA-CCHFV) are in phase 1 trials.',
    workflows: ['viral-wgs'],
    biomarkers: ['RT-PCR (acute phase)','CCHFV IgM/IgG (survivors)','Lineage (I–VII)','Tick burden and Hyalomma species identification','Platelet count (thrombocytopaenia)','ALT/AST','Prothrombin time (DIC)'],
    findings: 'African CCHFV strains form distinct lineages (Africa 1–3) reflecting the diversity of African Hyalomma tick species. The South African lineage (Lineage 2) is associated with ostrich farming — ostriches are highly effective tick hosts amplifying Hyalomma populations. Whole-genome phylogeny reveals extensive African diversity suggesting Africa as an ancestral reservoir with multiple subsequent global spread events.',
    tools: ['BEAST2','IQ-TREE','Geneious','Snippy','Tick surveillance identification tools'],
    databases: ['NCBI GenBank Nairoviridae','WHO CCHF situation reports','EMPRES-i FAO','Africa CDC VHF dashboard'],
    africanContext: 'CCHF is endemic across sub-Saharan Africa (South Africa, Uganda, Tanzania, Mauritania, Senegal, DRC) and North Africa (Egypt). South Africa has the most well-characterised African CCHFV surveillance system. Livestock movement between countries drives tick (and CCHFV lineage) spread. Africa CDC supports national capacity for CCHF diagnosis and nosocomial prevention (healthcare worker training and PPE protocols).'
  },

  /* ══════════════════════════════════════════════════════════
     ONCOVIRUSES
     ══════════════════════════════════════════════════════════ */
  'hpv': {
    name: 'Human Papillomavirus (HPV)', category: 'Oncoviruses', icon: 'ribbon',
    color: '#ff7b9c',
    stats: { global: '#1 sexually transmitted infection · >100 types · 99% of cervical cancers', africa: 'Highest cervical cancer mortality globally', daly: '7.2M DALYs/yr (cervical cancer alone)' },
    sampleTypes: ['Cervical swab (for HPV genotyping)','Tissue biopsy (CIN, cancer)','Oral swab (head/neck)','Self-collected vaginal swab (for screening programs)'],
    description: 'HPV is a diverse family of dsDNA viruses (Papillomaviridae) with 200+ types. High-risk genotypes (HPV 16, 18, 31, 33, 45, 52, 58) integrate into host genomes, inactivating tumour suppressors p53 (via E6) and Rb (via E7) — the molecular mechanism of cervical, oropharyngeal, anal, vulvar, and penile cancers. HPV 16 and 18 cause 70% of cervical cancers. Three licensed vaccines (Gardasil 4, Gardasil 9, Cervarix) are highly effective if given before sexual debut. WHO Cervical Cancer Elimination Strategy targets 90% HPV vaccination coverage globally.',
    clinicalImpact: 'HPV genotyping by PCR (Linear Array, CLART HPVScreen, or NGS) identifies high-risk types for triage of abnormal cytology and post-treatment follow-up. WGS-based HPV genotyping from tumour tissue detects viral integration sites, characterises viral load, and identifies co-infection patterns. RNA-seq of HPV+ vs HPV− tumours reveals distinct immune infiltrate signatures — HPV+ oropharyngeal cancers respond far better to immunotherapy.',
    workflows: ['viral-wgs','rna-seq','wgs'],
    biomarkers: ['HPV genotype (high-risk: 16/18/31/33/45/52/58)','Viral load (integrated vs episomal)','E6/E7 oncogene expression (RNA-seq)','p16INK4a overexpression (IHC surrogate for high-risk HPV)','CIN grade (cytology/histology)','Integration site (chr8q24/MYC — poor prognosis)'],
    findings: 'NGS-based HPV genotyping reveals partial genotype mixtures (multiple high-risk types in a single cervical sample) that linear probes miss. WGS integration site analysis shows HPV integration near oncogenes (MYC, ERBB2) accelerates tumourigenesis. African cohort studies (SANPREDICT, CERVICATE) show unique HPV genotype distributions in sub-Saharan Africa with higher HPV 45 and 52 proportions than in Europe — relevant for vaccine coverage assessment.',
    tools: ['HPVTyper','CLC Genomics','Geneious','DNAML','BWA for HPV integration site detection','STAR-Fusion (E6/E7 transcripts)'],
    databases: ['PaVE (Papillomavirus Episteme)','NCBI GenBank','IARC HPV database','WHO HPV classification'],
    africanContext: 'Sub-Saharan Africa has the highest cervical cancer incidence and mortality globally (>90% of deaths in low-income countries, predominantly Africa). WHO elimination target requires 90% HPV vaccination, 70% cervical screening, and 90% treatment coverage by 2030. African countries have introduced Gardasil 4 and Cervarix nationally; Gardasil 9 adoption is limited by cost. CERVARIX was used in the Kenya national program. HPV self-sampling programs (SWAT — Self-sampling for Women and Their Health) are scaling in South Africa and Kenya to reach unscreened rural women.'
  },

  'ebv': {
    name: 'Epstein-Barr Virus (EBV/HHV-4)', category: 'Oncoviruses', icon: 'ribbon',
    color: '#79c0ff',
    stats: { global: '95% seroprevalence in adults globally · causal in 6 cancers', africa: 'Higher Burkitt lymphoma incidence (Equatorial Africa)', daly: 'EBV-associated cancers: 200,000 cases/yr' },
    sampleTypes: ['Peripheral blood (PBMC for EBV load)','Throat wash','Tissue biopsy (lymphoma, NPC)','Saliva'],
    description: 'Epstein-Barr virus (Gammaherpesviridae) infects >95% of adults globally, establishing life-long latency in memory B cells. EBV causes infectious mononucleosis (primary infection) and is aetiologically linked to six malignancies: Burkitt lymphoma (Africa — "African Burkitt"), Hodgkin lymphoma (EBV-mixed cellularity subtype), nasopharyngeal carcinoma (NPC — Southeast Asia, North Africa), EBV-positive diffuse large B cell lymphoma (post-transplant), primary CNS lymphoma (HIV-associated), and gastric carcinoma (EBV-associated, 10% of all gastric cancers).',
    clinicalImpact: 'EBV WGS characterises latency gene patterns (EBNA-1, LMP-1, LMP-2 variants) associated with different malignancies, identifies EBV strain diversity contributing to geographic cancer patterns, and enables monitoring of EBV reactivation by viral load in immunocompromised patients. RNA-seq of EBV-infected B cells maps the 9 latency programs (I–III) and viral miRNAs (>40 BART miRNAs) that silence immune recognition. EBV VCA and EBNA antibody patterns distinguish primary infection from reactivation and NPC risk.',
    workflows: ['viral-wgs','rna-seq','wgs'],
    biomarkers: ['EBV DNA viral load (PBMC — reactivation marker)','VCA IgA (NPC screening)','EBNA IgG (past infection)','EBV LMP-1 genotype (A vs B strains)','EBER in situ hybridisation (tumour tissue — EBV+ lymphoma diagnosis)','EBV miRNA profiling (serum exosomes for NPC)'],
    findings: 'African Burkitt lymphoma (equatorial belt — Uganda, Kenya, Tanzania, Nigeria) has the unique combination of EBV + holoendemic malaria + MYC chromosomal translocation t(8;14). WGS of Burkitt lymphoma tumours shows EBV integration and somatic ID3/CCND3 mutations. scRNA-seq of Burkitt tumours maps the germinal centre B cell origin and immune evasion via B7-H1 expression.',
    tools: ['BWA (EBV WGS)','Geneious','STAR (RNA-seq EBV latency)','IQ-TREE','EBVfamilyDB'],
    databases: ['NCBI GenBank EBV','EBVdb','TCGA EBV+ tumour datasets','Africa Burkitt Lymphoma Consortium'],
    africanContext: 'The African Burkitt lymphoma belt (equatorial Africa 0–5° latitude on each side of the equator) has the highest EBV-associated cancer incidence. Denis Burkitt\'s original observations in Uganda in the 1950s established the geographic clustering linked to malaria endemicity. The Lymphoma Africa consortium and H3Africa-associated projects are characterising EBV genomics in sub-Saharan Africa. HIV immunosuppression dramatically increases EBV-associated lymphoma risk — a major complication in high HIV-prevalence African settings.'
  },

  /* ══════════════════════════════════════════════════════════
     RASH / LESION VIRUSES
     ══════════════════════════════════════════════════════════ */
  'mpox': {
    name: 'Mpox Virus (MPXV)', category: 'Exanthematous Viruses', icon: 'virus',
    color: '#e3b341',
    stats: { global: '>95,000 cases across 120 countries in 2022 outbreak', africa: 'Clade I (DRC) causes more severe disease; clade I-b drove 2024 Africa emergency', daly: 'Emerging — rising burden with HIV co-infection' },
    sampleTypes: ['Lesion swab (pustule/vesicle roof/swab — highest sensitivity)','Lesion crust','Blood (EDTA — low sensitivity)','Respiratory swab (symptomatic cases)'],
    description: 'Mpox (formerly monkeypox) is caused by Mpox virus (Poxviridae, genus Orthopoxvirus), closely related to smallpox. Two major clades: Clade I (Central African — higher CFR, 1–10%) and Clade II (West African — lower CFR, <1%). Clade II caused the 2022 global outbreak primarily affecting MSM networks. Clade I-b (a novel sub-clade of Clade I) drove the 2024 DRC outbreak and regional spread — declared a PHEIC by WHO in August 2024. Smallpox vaccines (MVA-BN/Jynneos and ACAM2000) confer ~85% cross-protection. Tecovirimat (TPOXX) is the approved antiviral with uncertain clinical efficacy.',
    clinicalImpact: 'WGS distinguishes Clade I vs Clade II (critical for severity prognosis and response), identifies sub-lineages within the 2022 global outbreak (B.1 lineage rapidly accumulated mutations via APOBEC3 editing — >50 mutations in 2 years vs expected ~1/yr), and tracks sexual network transmission chains. RNA-seq of infected keratinocytes maps E3L-mediated IFN suppression. HIV co-infection significantly worsens outcomes (immunosuppression + impaired smallpox vaccine response).',
    workflows: ['viral-wgs'],
    biomarkers: ['PCR (lesion swab — VP35 or OPV-specific primer sets)','Clade identification by WGS','APOBEC3 mutation signature (Clade IIb epidemic hallmark)','Orthopoxvirus IgG (vaccination/exposure history)','HIV status (critical comorbidity)','Lesion distribution (facial/genital pattern)'],
    findings: '2022 outbreak WGS revealed the fastest-known viral diversification for any DNA virus in an acute outbreak — attributed to APOBEC3 host genome editing during sustained human transmission. Clade I-b phylogenomics suggests a separate emergence from the animal reservoir (not imported from West Africa) in eastern DRC. The 2024 Africa outbreak spread via sexual transmission networks (Clade I-b — previously thought to spread only via direct lesion contact) — changing the epidemiological paradigm.',
    tools: ['Geneious','BEAST2','IQ-TREE','Nextclade (Mpox module)','NextStrain Mpox','iVar','Minimap2'],
    databases: ['NCBI GenBank Poxviridae','GISAID (Mpox section)','WHO Mpox situation reports','Africa CDC Mpox dashboard'],
    africanContext: 'Mpox is endemic in DRC, which has the highest global burden (>50,000 suspected cases/yr, including Clade I). The 2024 Clade I-b outbreak spread from DRC to Burundi, Rwanda, Uganda, and Kenya — the first confirmed Clade I spread beyond Central Africa in decades. Africa CDC declared a continental public health emergency in August 2024. MVA-BN vaccine delivery in DRC and neighboring countries is a public health priority; vaccine availability for Africa remains a challenge despite WHO PHEIC declaration.'
  },

  'measles': {
    name: 'Measles Morbillivirus (MeV)', category: 'Exanthematous Viruses', icon: 'virus',
    color: '#ffa657',
    stats: { global: '9M cases · 136,000 deaths in 2022 (resurgence)', africa: 'Africa accounts for >70% of measles deaths globally', daly: '10.4M DALYs/yr' },
    sampleTypes: ['Nasopharyngeal swab (first 3 days of rash — best)','Urine (1–2 weeks of illness)','Oral fluid','Serum (IgM — 3+ days after rash onset)'],
    description: 'Measles morbillivirus (Paramyxoviridae) is one of the most contagious human pathogens (R0 = 12–18) with 24 genotypes (A–H, labelled 1–24). Measles causes acute febrile respiratory illness (Koplik spots + maculopapular rash) with complications: otitis media, pneumonia, encephalitis, and subacute sclerosing panencephalitis (SSPE — rare fatal late sequel). A highly effective live-attenuated vaccine (MMR) requires 95% coverage for herd immunity. COVID-19 pandemic disrupted immunisation programs, causing the 2022–2024 global resurgence.',
    clinicalImpact: 'WGS of MeV strains (especially H1 and D genotypes in Africa) tracks importation events, identifies genotype shifts in circulation, and monitors vaccine-genotype mismatch (current vaccines are genotype A — cross-protective against all wild-type strains, but molecular epidemiology confirms this). Immune amnesia post-measles (measles erases 20–73% of pre-existing immune memory antibodies) is documented by proteomics of pre/post-measles serum samples.',
    workflows: ['viral-wgs'],
    biomarkers: ['Measles IgM (serum, 3–28 days after rash)','RT-PCR (NP or H gene — NPS/urine)','Genotype (B3, D4, D8, H1 dominant globally)','MMR vaccine-strain vs wild-type (Edmonston vs non-Edmonston phylogeny)','Avidity index IgG (primary vs secondary response)'],
    findings: 'The 2018–2019 DRC outbreak (>310,000 cases — the largest in 20 years) was driven by genotype B3, with phylogenomics showing multiple co-circulating lineages and importation from multiple countries. Measles immune amnesia demonstrated by VirScan proteomics of survivor serum — 11–73% reduction in antibody diversity 2 months post-measles. WHO/UNICEF call for measles elimination requires genotyping surveillance to certify interruption of endemic transmission.',
    tools: ['IQ-TREE','BEAST2','Geneious','NextStrain Measles','WHO MeaNS (Measles Nucleotide Surveillance) database'],
    databases: ['WHO MeaNS','NCBI GenBank','WHO-UNICEF immunisation coverage database','AFRO measles SIAs calendar'],
    africanContext: 'Africa accounts for >70% of measles deaths globally — concentrated in DRC, Nigeria, Ethiopia, and Angola where vaccination coverage gaps exist (SIA = supplementary immunisation activities). The 2022–2024 post-COVID measles resurgence has been severe in West and Central Africa. DRC has the world\'s largest ongoing measles epidemic. Africa CDC Expanded Programme on Immunisation supports national vaccination campaigns and measles genomic surveillance through the Africa RISLNET.'
  }
};

/* ── Tool reference database ─────────────────────────────── */
OmicsLab.TOOLS = {

  /* ─── ALIGNMENT & MAPPING ─── */
  'bwa-mem2': {
    name:'BWA-MEM2', category:'Alignment', stage:'bioinformatics',
    input:'FASTQ', output:'BAM/CRAM',
    desc:'Burrows-Wheeler Aligner — gold standard for DNA short-read alignment to a reference genome. 2× faster than BWA-MEM with identical results.',
    use:'Whole genome and exome sequencing alignment.',
    alternatives:['Bowtie2 (for ChIP-seq/ATAC-seq)','STAR (RNA-seq)'],
    url:'https://github.com/bwa-mem2/bwa-mem2'
  },
  'star': {
    name:'STAR', category:'Alignment', stage:'bioinformatics',
    input:'FASTQ', output:'BAM + splice junction BED',
    desc:'Spliced Transcripts Alignment to a Reference. Handles intron-spanning reads essential for RNA-seq. Detects novel splice junctions.',
    use:'RNA-seq and spatial transcriptomics alignment.',
    alternatives:['HISAT2','Salmon (quasi-mapping)'],
    url:'https://github.com/alexdobin/STAR'
  },
  'hisat2': {
    name:'HISAT2', category:'Alignment', stage:'bioinformatics',
    input:'FASTQ', output:'BAM',
    desc:'Hierarchical Indexing for Spliced Alignment of Transcripts. Graph-based aligner with lower memory than STAR.',
    use:'RNA-seq on memory-constrained systems.',
    alternatives:['STAR'],
    url:'https://daehwankimlab.github.io/hisat2'
  },
  'bowtie2': {
    name:'Bowtie2', category:'Alignment', stage:'bioinformatics',
    input:'FASTQ', output:'BAM',
    desc:'Fast and sensitive short-read aligner for DNA. Does NOT support splicing — use STAR for RNA-seq.',
    use:'ChIP-seq, ATAC-seq, targeted amplicon alignment.',
    alternatives:['BWA-MEM2'],
    url:'https://bowtie-bio.sourceforge.net/bowtie2'
  },

  /* ─── VARIANT CALLING ─── */
  'gatk-hc': {
    name:'GATK HaplotypeCaller', category:'Variant Calling', stage:'bioinformatics',
    input:'BAM + Reference FASTA', output:'VCF/GVCF',
    desc:'GATK Best Practices germline short variant discovery. Locally re-assembles reads in active regions to call SNPs and indels with high sensitivity.',
    use:'Germline WGS and WES variant calling.',
    alternatives:['DeepVariant','FreeBayes'],
    url:'https://gatk.broadinstitute.org'
  },
  'deepvariant': {
    name:'DeepVariant (Google)', category:'Variant Calling', stage:'bioinformatics',
    input:'BAM + Reference', output:'VCF',
    desc:'CNN-based variant caller treating pileup images as image classification. Outperforms GATK on substitution accuracy, especially on Illumina and PacBio HiFi data.',
    use:'WGS, WES, long-read variant calling.',
    alternatives:['GATK HaplotypeCaller'],
    url:'https://github.com/google/deepvariant'
  },
  'ivar': {
    name:'iVar', category:'Variant Calling', stage:'bioinformatics',
    input:'BAM (amplicon)', output:'TSV + consensus FASTA',
    desc:'Intrahost variant calling and consensus genome generation for amplicon sequencing. Essential for ARTIC/tiled amplicon viral WGS.',
    use:'Viral amplicon sequencing (SARS-CoV-2, Influenza).',
    alternatives:['Medaka (ONT)'],
    url:'https://andersen-lab.github.io/ivar'
  },
  'tbprofiler': {
    name:'TBProfiler', category:'Variant Calling', stage:'bioinformatics',
    input:'FASTQ', output:'JSON resistance report',
    desc:'End-to-end M. tuberculosis resistance profiling pipeline. Aligns, calls variants, and annotates resistance-conferring mutations from FASTQ in one command.',
    use:'TB drug resistance surveillance.',
    alternatives:['MTBseq','KvarQ'],
    url:'https://github.com/jodyphelan/TBProfiler'
  },

  /* ─── QC ─── */
  'fastqc': {
    name:'FastQC', category:'Quality Control', stage:'preprocessing',
    input:'FASTQ', output:'HTML QC report',
    desc:'Per-sequence quality scores, GC content, adapter content, sequence duplication — 12 QC modules in one HTML report.',
    use:'First-pass QC of any FASTQ file.',
    alternatives:['fastp (combined QC + trimming)','MultiQC (aggregating many FastQC reports)'],
    url:'https://www.bioinformatics.babraham.ac.uk/projects/fastqc'
  },
  'multiqc': {
    name:'MultiQC', category:'Quality Control', stage:'preprocessing',
    input:'FastQC/STAR/GATK logs', output:'Aggregated HTML report',
    desc:'Aggregates QC reports from 100+ tools into one interactive report. Identifies outlier samples across a cohort.',
    use:'Cohort-level QC before analysis.',
    alternatives:['Custom R scripts'],
    url:'https://multiqc.info'
  },
  'fastp': {
    name:'fastp', category:'Trimming & QC', stage:'preprocessing',
    input:'FASTQ', output:'Trimmed FASTQ + JSON QC',
    desc:'Ultra-fast all-in-one FASTQ preprocessor — quality trimming, adapter removal, polyG tail trimming, QC report generation in one pass.',
    use:'Pre-processing before any alignment step.',
    alternatives:['Trimmomatic','Cutadapt'],
    url:'https://github.com/OpenGene/fastp'
  },

  /* ─── SINGLE-CELL ─── */
  'cellranger': {
    name:'Cell Ranger', category:'Single-Cell', stage:'primary',
    input:'BCL/FASTQ', output:'Feature-barcode matrix + BAM',
    desc:'10x Genomics official pipeline: demultiplexing, barcode correction, UMI counting, secondary analysis. Required for 10x Chromium data.',
    use:'scRNA-seq, scATAC-seq, CITE-seq, Visium data processing.',
    alternatives:['STARsolo (faster, open-source)','Alevin-fry'],
    url:'https://support.10xgenomics.com/single-cell-gene-expression/software/pipelines/latest/what-is-cell-ranger'
  },
  'seurat': {
    name:'Seurat', category:'Single-Cell Analysis', stage:'bioinformatics',
    input:'Feature-barcode matrix', output:'R object + plots',
    desc:'The most widely used R package for scRNA-seq analysis. Normalisation, PCA, UMAP, clustering, marker gene identification, integration.',
    use:'scRNA-seq, scATAC-seq, CITE-seq analysis.',
    alternatives:['Scanpy (Python)','SingleCellExperiment (Bioconductor)'],
    url:'https://satijalab.org/seurat'
  },
  'scanpy': {
    name:'Scanpy', category:'Single-Cell Analysis', stage:'bioinformatics',
    input:'AnnData (h5ad)', output:'h5ad + plots',
    desc:'Python counterpart to Seurat. Faster for very large datasets (>1M cells). Full UMAP, Leiden clustering, trajectory analysis ecosystem.',
    use:'Large-scale scRNA-seq analysis, multi-sample integration.',
    alternatives:['Seurat (R)'],
    url:'https://scanpy.readthedocs.io'
  },
  'harmony': {
    name:'Harmony', category:'Batch Correction', stage:'bioinformatics',
    input:'PCA embedding + metadata', output:'Corrected PCA',
    desc:'Iterative PCA-space batch correction. Extremely fast (seconds for 100K cells). Works for sample, batch, and technology correction.',
    use:'Multi-sample scRNA-seq integration.',
    alternatives:['Scanorama','BBKNN','scVI'],
    url:'https://github.com/immunogenomics/harmony'
  },

  /* ─── DIFFERENTIAL EXPRESSION ─── */
  'deseq2': {
    name:'DESeq2', category:'Differential Expression', stage:'bioinformatics',
    input:'Raw count matrix', output:'DE gene table + plots',
    desc:'Negative binomial GLM with empirical Bayes shrinkage of fold changes. Gold standard for bulk RNA-seq DE with small n (3–10 per group).',
    use:'Bulk RNA-seq differential expression.',
    alternatives:['edgeR','limma-voom'],
    url:'https://bioconductor.org/packages/DESeq2'
  },
  'edger': {
    name:'edgeR', category:'Differential Expression', stage:'bioinformatics',
    input:'Raw count matrix', output:'DE gene table',
    desc:'Empirical analysis of Digital Gene Expression. Negative binomial model with tagwise dispersion estimation.',
    use:'RNA-seq DE, metagenomics differential abundance.',
    alternatives:['DESeq2'],
    url:'https://bioconductor.org/packages/edgeR'
  },
  'clusterprofiler': {
    name:'clusterProfiler', category:'Functional Enrichment', stage:'bioinformatics',
    input:'Gene list + background', output:'GO/KEGG enrichment table',
    desc:'The most comprehensive R package for gene ontology (GO), KEGG pathway, Reactome, and WikiPathways enrichment analysis.',
    use:'Interpreting DE gene lists from any omics experiment.',
    alternatives:['fgsea (GSEA)','g:Profiler'],
    url:'https://bioconductor.org/packages/clusterProfiler'
  },

  /* ─── PEAK CALLING ─── */
  'macs3': {
    name:'MACS3', category:'Peak Calling', stage:'bioinformatics',
    input:'BAM', output:'narrowPeak / broadPeak BED',
    desc:'Model-based Analysis of ChIP-Seq. The standard peak caller for ChIP-seq and ATAC-seq. Models local background to identify enriched regions.',
    use:'ChIP-seq transcription factor peaks, ATAC-seq NFR peaks.',
    alternatives:['HOMER','F-seq2 (ATAC-specific)'],
    url:'https://github.com/macs3-project/MACS'
  },
  'homer': {
    name:'HOMER', category:'Peak Calling & Motif', stage:'bioinformatics',
    input:'BAM / tag directories', output:'Peaks + motif HTML',
    desc:'Hypergeometric Optimization of Motif EnRichment. Peak calling plus integrated de novo and known motif analysis with JASPAR database.',
    use:'ChIP-seq, ATAC-seq peaks and motif enrichment.',
    alternatives:['MACS3 + FIMO','chromVAR'],
    url:'http://homer.ucsd.edu/homer'
  },
  'deeptools': {
    name:'deepTools2', category:'Visualisation', stage:'bioinformatics',
    input:'BAM/bigWig', output:'Heatmaps, profiles, bigWig',
    desc:'Suite for normalising and visualising deep sequencing data. bamCoverage, computeMatrix, plotHeatmap, plotProfile, bamCompare (log2 ChIP/Input).',
    use:'ChIP-seq, ATAC-seq, RNA-seq visualisation tracks.',
    alternatives:['IGV (interactive browser)','UCSC Genome Browser'],
    url:'https://deeptools.readthedocs.io'
  },

  /* ─── METAGENOMICS ─── */
  'kraken2': {
    name:'Kraken2', category:'Taxonomic Classification', stage:'bioinformatics',
    input:'FASTQ', output:'Kraken report + classified reads',
    desc:'k-mer exact-match taxonomic classifier. Classifies 1M reads/minute against databases of thousands of reference genomes.',
    use:'Shotgun metagenomics taxonomic profiling.',
    alternatives:['MetaPhlAn4','mOTUs3','Centrifuge'],
    url:'https://github.com/DerrickWood/kraken2'
  },
  'humann3': {
    name:'HUMAnN3', category:'Functional Profiling', stage:'bioinformatics',
    input:'FASTQ', output:'Gene families + pathway abundances',
    desc:'Human Microbiome Project Unified Metabolic Analysis Network. Maps reads to UniRef90 genes, then reconstructs MetaCyc pathways stratified by species.',
    use:'Shotgun metagenomics functional profiling.',
    alternatives:['SUPER-FOCUS','KEGG via Diamond'],
    url:'https://huttenhower.sph.harvard.edu/humann'
  },
  'qiime2': {
    name:'QIIME2', category:'16S Analysis', stage:'bioinformatics',
    input:'FASTQ (demuxed)', output:'Feature table + diversity plots',
    desc:'Quantitative Insights Into Microbial Ecology. Full 16S amplicon pipeline: denoising, taxonomy classification, alpha/beta diversity, differential abundance.',
    use:'16S rRNA amplicon community analysis.',
    alternatives:['mothur (older)'],
    url:'https://qiime2.org'
  },
  'dada2': {
    name:'DADA2', category:'ASV Inference', stage:'bioinformatics',
    input:'FASTQ', output:'ASV table + representative sequences',
    desc:'Divisive Amplicon Denoising Algorithm. Learns sequencing error models and corrects them to produce exact amplicon sequence variants (ASVs) at single-nucleotide resolution.',
    use:'16S, ITS, 18S amplicon denoising.',
    alternatives:['Deblur'],
    url:'https://benjjneb.github.io/dada2'
  },

  /* ─── METABOLOMICS ─── */
  'xcms': {
    name:'XCMS', category:'Metabolomics', stage:'bioinformatics',
    input:'mzML/mzXML raw MS files', output:'Feature matrix (m/z × RT × samples)',
    desc:'eXtensible Computational Mass Spectrometry. Peak detection (centWave), retention time alignment (obiwarp), gap filling, and isotope/adduct annotation.',
    use:'LC-MS untargeted metabolomics feature detection.',
    alternatives:['MZmine3','MS-DIAL'],
    url:'https://bioconductor.org/packages/xcms'
  },
  'metaboanalyst': {
    name:'MetaboAnalyst', category:'Metabolomics Statistics', stage:'bioinformatics',
    input:'Feature matrix (CSV)', output:'PCA, heatmaps, pathway maps',
    desc:'Comprehensive web-based platform for metabolomics statistical analysis: normalisation, PCA, PLS-DA, biomarker analysis, pathway enrichment.',
    use:'Metabolomics data interpretation and visualisation.',
    alternatives:['POMA (R)','MetaX'],
    url:'https://www.metaboanalyst.ca'
  },

  /* ─── PROTEOMICS ─── */
  'maxquant': {
    name:'MaxQuant', category:'Proteomics', stage:'bioinformatics',
    input:'Thermo RAW / mzML files', output:'proteinGroups.txt + peptides.txt',
    desc:'Quantitative proteomics software combining database searching (Andromeda) with label-free quantification (LFQ) and MaxLFQ normalisation.',
    use:'LC-MS/MS label-free quantification proteomics.',
    alternatives:['Proteome Discoverer (commercial)','DIA-NN (DIA)'],
    url:'https://www.maxquant.org'
  },
  'perseus': {
    name:'Perseus', category:'Proteomics Statistics', stage:'bioinformatics',
    input:'MaxQuant output tables', output:'Statistical analysis plots',
    desc:'Statistical analysis platform designed for MaxQuant output. Filtering, imputation, volcano plots, hierarchical clustering, GO enrichment.',
    use:'Downstream statistical analysis of proteomics data.',
    alternatives:['DEP (R Bioconductor)'],
    url:'https://maxquant.net/perseus'
  },

  /* ─── LINEAGE ASSIGNMENT ─── */
  'pangolin': {
    name:'Pangolin', category:'Viral Lineage', stage:'bioinformatics',
    input:'FASTA consensus genome', output:'Lineage CSV',
    desc:'Phylogenetic Assignment of Named Global Outbreak LINeages. The WHO-endorsed tool for SARS-CoV-2 Pango nomenclature assignment.',
    use:'SARS-CoV-2 variant classification and surveillance.',
    alternatives:['Nextclade','UShER'],
    url:'https://cov-lineages.org/resources/pangolin.html'
  },
  'nextclade': {
    name:'Nextclade', category:'Viral QC & Lineage', stage:'bioinformatics',
    input:'FASTA', output:'QC report + Nextstrain clade',
    desc:'Viral sequence quality control, mutation calling, and Nextstrain clade assignment. Runs in the browser — no installation needed.',
    use:'SARS-CoV-2 and other viral genome QC.',
    alternatives:['Pangolin'],
    url:'https://clades.nextstrain.org'
  },

  /* ─── GENOME BROWSERS & ANNOTATION ─── */
  'igv': {
    name:'IGV (Integrative Genomics Viewer)', category:'Visualisation', stage:'bioinformatics',
    input:'BAM/BED/VCF/bigWig', output:'Interactive genome browser',
    desc:'The standard desktop tool for visualising aligned reads, called variants, and genomic tracks across any genome build.',
    use:'Manual inspection of variants, peaks, and splice junctions.',
    alternatives:['UCSC Genome Browser','JBrowse2'],
    url:'https://igv.org'
  },
  'annovar': {
    name:'ANNOVAR', category:'Variant Annotation', stage:'bioinformatics',
    input:'VCF', output:'Annotated text table',
    desc:'Annotate Variation. Integrates dbSNP, ClinVar, gnomAD, SIFT, PolyPhen-2, CADD, SpliceAI, and 50+ other annotation databases.',
    use:'Clinical exome/genome variant interpretation.',
    alternatives:['VEP','Franklin'],
    url:'https://annovar.openbioinformatics.org'
  },
  'vep': {
    name:'VEP (Ensembl)', category:'Variant Annotation', stage:'bioinformatics',
    input:'VCF', output:'Annotated VCF + tabular report',
    desc:'Variant Effect Predictor. Annotates consequences against Ensembl gene models. Open-source, clinically validated, updated quarterly.',
    use:'Variant functional annotation for any organism with an Ensembl genome.',
    alternatives:['ANNOVAR'],
    url:'https://www.ensembl.org/vep'
  }
};

/* ══════════════════════════════════════════════════════════════
   OMICS REPOSITORIES — key data repositories by domain
   ══════════════════════════════════════════════════════════════ */
OmicsLab.REPOSITORIES = {

  /* ── SEQUENCE ARCHIVES ──────────────────────────────────── */
  'sra': {
    name: 'NCBI Sequence Read Archive (SRA)', category: 'Sequence Archive',
    icon: 'database', url: 'https://www.ncbi.nlm.nih.gov/sra',
    scope: 'All NGS data types',
    desc: 'World\'s largest public repository of next-generation sequencing data. Stores raw FASTQ/SRA files. Free submission and access. >30 petabases of data.',
    access: 'Free · FTP / AWS / GCP · fasterq-dump CLI',
    africanRelevance: 'H3Africa Consortium deposits all African genomic data here. Africa-specific projects searchable by BioProject ID.'
  },
  'ena': {
    name: 'European Nucleotide Archive (ENA)', category: 'Sequence Archive',
    icon: 'database', url: 'https://www.ebi.ac.uk/ena',
    scope: 'All sequence types',
    desc: 'EMBL-EBI mirror of SRA. Identical data, often faster access from Europe and Africa. Provides secondary accession numbers. Excellent API.',
    access: 'Free · FTP / Aspera · REST API',
    africanRelevance: 'Many African collaborative studies (CRyPTIC TB, MalariaGEN) use ENA as the primary submission archive.'
  },
  'gisaid': {
    name: 'GISAID EpiCoV', category: 'Viral Genomics',
    icon: 'virus', url: 'https://gisaid.org',
    scope: 'Influenza, SARS-CoV-2, RSV, Ebola',
    desc: 'Global initiative on sharing all influenza data. Now hosts >15M SARS-CoV-2 genomes. Requires registration and data-sharing agreement. Essential for pandemic surveillance.',
    access: 'Free (registration) · Web + API',
    africanRelevance: 'NICD South Africa, Africa CDC, and national public health institutes deposit surveillance sequences. Omicron BA.1 first uploaded here from South Africa Nov 2021.'
  },

  /* ── CANCER GENOMICS ────────────────────────────────────── */
  'tcga': {
    name: 'TCGA (The Cancer Genome Atlas)', category: 'Cancer Genomics',
    icon: 'ribbon', url: 'https://portal.gdc.cancer.gov',
    scope: '33 cancer types · WGS/WES/RNA-seq/methylation/proteomics',
    desc: 'The foundational cancer multi-omics atlas. >20,000 tumour/normal pairs across 33 cancers. Includes WGS, WES, RNA-seq, miRNA-seq, SNP arrays, RPPA proteomics.',
    access: 'Open (tier 1) + Controlled access (tier 2) · GDC Data Portal',
    africanRelevance: 'Critical limitation: <1% of TCGA samples are of African ancestry, severely limiting applicability to African cancer patients.'
  },
  'icgc': {
    name: 'ICGC / PCAWG', category: 'Cancer Genomics',
    icon: 'dna', url: 'https://dcc.icgc.org',
    scope: 'Pan-cancer WGS · 38 tumour types · 2,658 donors',
    desc: 'International Cancer Genome Consortium. PCAWG (Pan-Cancer Analysis of Whole Genomes) is the definitive WGS cancer resource — structural variants, mutational signatures, driver discovery, non-coding mutations.',
    access: 'Open + Controlled access · ICGC Data Portal + EGA',
    africanRelevance: 'Minimal African representation. The AORTIC (African Organisation for Research and Training in Cancer) is advocating for an African Cancer Genome Atlas.'
  },
  'cosmic': {
    name: 'COSMIC (Catalogue of Somatic Mutations in Cancer)', category: 'Variant Database',
    icon: 'zap', url: 'https://cancer.sanger.ac.uk/cosmic',
    scope: 'Somatic mutations · Cancer census genes · Mutational signatures',
    desc: 'The definitive somatic mutation database. Cancer Gene Census (>700 genes), mutational signatures (SBS/DBS/ID), fusion genes, drug resistance mutations. Updated quarterly by Sanger Institute.',
    access: 'Free (academic) · Web + VCF downloads',
    africanRelevance: 'Primary reference for variant pathogenicity interpretation. TP53 R249S (aflatoxin-HBV HCC, dominant in Africa) is a COSMIC signature mutation.'
  },

  /* ── INFECTIOUS DISEASE ─────────────────────────────────── */
  'patric': {
    name: 'BV-BRC (formerly PATRIC)', category: 'Pathogen Genomics',
    icon: 'server', url: 'https://www.bv-brc.org',
    scope: 'All bacterial and viral pathogens',
    desc: 'NIAID-funded comprehensive bacterial bioinformatics resource. >800,000 genomes, integrated annotation, comparative genomics, AMR prediction, phylogenetics tools — all in one platform.',
    access: 'Free · Web + CLI workspace',
    africanRelevance: 'Largest public resource for African pathogen genomes. TB, Vibrio cholerae, Salmonella, and P. falciparum datasets well represented.'
  },
  'enterobase': {
    name: 'EnteroBase', category: 'Enteric Pathogen Genomics',
    icon: 'server', url: 'https://enterobase.warwick.ac.uk',
    scope: 'Salmonella, E. coli/Shigella, Clostridioides difficile, Yersinia, Helicobacter',
    desc: 'Community resource for enteric pathogen genomics. Automated MLST/cgMLST typing, phylogenetic trees, and metadata integration for >500,000 E. coli and >350,000 Salmonella genomes.',
    access: 'Free (registration) · Web + API',
    africanRelevance: 'Critical for tracking XDR Salmonella Typhi and ESBL E. coli spread in Africa. Contains East and West African outbreak isolates from cholera and typhoid surveillance programmes.'
  },
  'malariagen': {
    name: 'MalariaGEN', category: 'Parasite Genomics',
    icon: 'globe', url: 'https://www.malariagen.net',
    scope: 'P. falciparum · P. vivax · Anopheles mosquito',
    desc: 'Global network for malaria genomic epidemiology. Pf7 release: 20,000+ P. falciparum genomes from 40 countries. Drug resistance surveillance, transmission network analysis, population genomics.',
    access: 'Free · MalariaGEN data portal',
    africanRelevance: 'Majority of Pf7 genomes are from sub-Saharan Africa. The Ag1000G project sequenced 1,000 Anopheles gambiae mosquitoes from Africa for vector control target identification.'
  },
  'cryptodb': {
    name: 'CryptoDB (VEuPathDB)', category: 'Parasite Genomics',
    icon: 'server', url: 'https://cryptodb.org',
    scope: 'Cryptosporidium species · related coccidians',
    desc: 'Part of the VEuPathDB bioinformatics resource network. Reference genomes, annotated gene models, comparative genomics, expression data, and population genomics tools for Cryptosporidium.',
    access: 'Free · Web + download',
    africanRelevance: 'C. hominis and C. parvum reference genomes used for African gp60 subtyping studies and drug target identification relevant to African childhood diarrhoea burden.'
  },

  /* ── POPULATION & GWAS ──────────────────────────────────── */
  'uk-biobank': {
    name: 'UK Biobank', category: 'Population Genomics',
    icon: 'database', url: 'https://www.ukbiobank.ac.uk',
    scope: '500K participants · WES/WGS + phenome · UK-based',
    desc: 'Half-million participant prospective cohort with genotyping, WES (all 500K), WGS (200K), metabolomics, proteomics, imaging. The most powerful GWAS resource globally for common disease.',
    access: 'Controlled access (application) · Research Analysis Platform (RAP)',
    africanRelevance: 'Only ~2% of participants are non-white British. African-ancestry findings have limited transferability. Contrast with AWI-Gen and H3Africa below.'
  },
  'h3africa': {
    name: 'H3Africa Consortium', category: 'African Genomics',
    icon: 'map-pin', url: 'https://h3africa.org',
    scope: 'African-specific WGS/GWAS · 25+ studies · 50,000+ participants',
    desc: 'NIH-funded Human Heredity and Health in Africa initiative. The largest coordinated African genomics programme. Studies span T2D, hypertension, TB, HIV, stroke, kidney disease, and rare disease across 30+ countries.',
    access: 'Controlled access · H3ABioNet data portal',
    africanRelevance: 'The primary source of Africa-specific genomic data. Critical for any omics study in African populations. H3ABioNet provides the bioinformatics training and analysis infrastructure.'
  },
  'awi-gen': {
    name: 'AWI-Gen (Africa Wits-INDEPTH)', category: 'African Genomics',
    icon: 'map-pin', url: 'https://awigen.org',
    scope: 'T2D · CVD · BMI · GWAS · 10,000 Africans across 6 sites',
    desc: 'Africa Wits-INDEPTH partnership for Genomic studies. Multi-country African GWAS for cardio-metabolic disease. Identified novel African-specific loci for T2D, BMI, and blood pressure not found in European cohorts.',
    access: 'Controlled access (application)',
    africanRelevance: 'Foundational African-specific GWAS resource. Demonstrated that African-derived PRS models outperform European ones in African-ancestry individuals 2–3 fold.'
  },
  'apcdr': {
    name: 'APCDR (African Partnership for Chronic Disease Research)', category: 'African Genomics',
    icon: 'map-pin', url: 'https://apcdr.org',
    scope: 'Cardiometabolic · Infectious disease · African-ancestry populations',
    desc: 'Cross-institutional African genomics partnership integrating GWAS, WGS, and multi-omics for chronic and infectious disease in African-ancestry populations across Africa and the diaspora.',
    access: 'Controlled access',
    africanRelevance: 'Explicitly designed to ensure African populations benefit from genomic medicine advances. Partners with H3Africa, AWI-Gen, and SPARCO.'
  },

  /* ── MICROBIOME ─────────────────────────────────────────── */
  'hmp': {
    name: 'Human Microbiome Project (HMP/iHMP)', category: 'Microbiome',
    icon: 'git-branch', url: 'https://hmpdacc.org',
    scope: '16S rRNA · WGS metagenomics · metabolomics · multi-body sites',
    desc: 'NIH Common Fund initiative defining the normal human microbiome across 300 participants (HMP1) and disease states — IBD, pregnancy, T2D (iHMP/HMP2). Reference baseline for all microbiome studies.',
    access: 'Open · HMPDACC portal + SRA',
    africanRelevance: 'Major limitation: all participants are US-based. African microbiomes differ substantially due to diet, geography, and infection exposure. The MALED study provides comparable African data.'
  },
  'curatedmgd': {
    name: 'curatedMetagenomicData', category: 'Microbiome',
    icon: 'layers', url: 'https://bioconductor.org/packages/curatedMetagenomicData',
    scope: '>20,000 uniformly processed metagenomes · 100+ studies',
    desc: 'Bioconductor resource of uniformly processed shotgun metagenomics datasets. Consistent preprocessing (MetaPhlAn4 + HUMAnN3) enables cross-study comparisons. Covers IBD, T2D, colorectal cancer, and more.',
    access: 'Free · R/Bioconductor package',
    africanRelevance: 'Includes MALED study data from African cohorts (Tanzania, South Africa). Enables comparison of African vs non-African microbiome signatures for disease association.'
  },

  /* ── VARIANT & CLINICAL ─────────────────────────────────── */
  'clinvar': {
    name: 'ClinVar', category: 'Clinical Variants',
    icon: 'check-circle', url: 'https://www.ncbi.nlm.nih.gov/clinvar',
    scope: 'Germline + somatic pathogenic variants · Clinical significance',
    desc: 'NCBI curated archive of variant-disease relationships with clinical significance classifications (Pathogenic/Likely Pathogenic/VUS/Benign). Updated weekly. >2M variants.',
    access: 'Free · Web + VCF download + API',
    africanRelevance: 'Critical limitation: >80% of ClinVar submissions come from US/European labs. African-specific pathogenic variants (BRCA2, BRCA1 founder variants from sub-Saharan Africa) are severely underrepresented, causing disproportionate VUS rates in African patients.'
  },
  'gnomad': {
    name: 'gnomAD v4', category: 'Population Allele Frequencies',
    icon: 'bar-chart', url: 'https://gnomad.broadinstitute.org',
    scope: '807,162 exomes + 76,215 genomes · Multi-ancestry',
    desc: 'Genome Aggregation Database. The gold standard reference for variant population frequencies used to filter rare disease candidates and assess pathogenicity. v4 includes 807K exomes — the largest allele frequency resource.',
    access: 'Free · Web + BigQuery + VCF download',
    africanRelevance: 'Despite 807K exomes, African/African-American representation is only ~12% (~97K individuals). African-ancestry rare variant frequencies remain poorly characterised — the primary cause of excess VUS rates in African patients undergoing clinical genomic testing.'
  },
  'africdr': {
    name: 'AfroDB / AWI-Gen Variant Database', category: 'African Variant Resource',
    icon: 'map-pin', url: 'https://h3africa.org',
    scope: 'African population allele frequencies · H3Africa cohorts',
    desc: 'Emerging African-specific allele frequency databases generated through the H3Africa and AWI-Gen programmes. Critical for correct pathogenicity classification in African patients — variants that appear rare in gnomAD may be common in specific African populations.',
    access: 'Controlled access · H3ABioNet',
    africanRelevance: 'The most important under-resourced gap in clinical genomics for Africa. Without African-specific reference allele frequencies, pathogenic variant interpretation is severely compromised for African patients.'
  }
};

/* ── Workflow→Disease map (which diseases does this workflow study?) ── */
OmicsLab.WorkflowDiseases = {
  'wgs':          ['breast-cancer','colorectal-cancer','tuberculosis','malaria','rare-mendelian','sickle-cell','prostate-cancer','typhoid','e-coli-diarrhea'],
  'wes':          ['rare-mendelian','breast-cancer','leukemia','diabetes-t2','sickle-cell'],
  'rna-seq':      ['breast-cancer','lung-cancer','tuberculosis','sars-cov2','alzheimers','hepatitis-b','cholera'],
  'scrna-seq':    ['breast-cancer','leukemia','sars-cov2','ibd','cancer-epigenetics','sickle-cell'],
  'atac-seq':     ['leukemia','cancer-epigenetics','ibd','breast-cancer','cervical-cancer','sickle-cell'],
  'chip-seq':     ['cancer-epigenetics','breast-cancer','leukemia','prostate-cancer','sickle-cell'],
  'shotgun-meta': ['ibd','colorectal-cancer','diabetes-t2','sars-cov2','hiv','cholera','e-coli-diarrhea','cryptosporidiosis'],
  '16s-amplicon': ['ibd','diabetes-t2','cholera','typhoid'],
  'lc-ms':        ['diabetes-t2','sars-cov2','alzheimers','colorectal-cancer','malaria','hepatitis-b','cryptosporidiosis'],
  'proteomics':   ['breast-cancer','alzheimers','sars-cov2'],
  'viral-wgs':    ['sars-cov2','hiv','hepatitis-b','cervical-cancer','rotavirus'],
  'cite-seq':     ['breast-cancer','sars-cov2','leukemia']
};
