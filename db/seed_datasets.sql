-- ═══════════════════════════════════════════════════════════════
-- OmicsLab — Dataset Hub seed data
-- Run AFTER the Dataset Hub section of schema.sql. Idempotent
-- (on conflict do nothing keyed on slug) — safe to re-run.
--
-- owner_id is left NULL for all of these: they're OmicsLab-curated
-- reference datasets, not uploaded by a specific user. The Hub UI
-- shows a "OmicsLab Team" badge instead of a @username/avatar when
-- owner_id is null.
--
-- usability_score/usability_components are NOT set here — they're
-- computed automatically by the triggers in schema.sql the moment
-- each dataset_files row is inserted below.
-- ═══════════════════════════════════════════════════════════════

-- 1) Tabular / intro ML — the gentle on-ramp ─────────────────────
insert into public.datasets
  (title, slug, subtitle, description_md, tags, license, category, difficulty, update_frequency)
values (
  'Heart Disease Clinical Indicators',
  'heart-disease-clinical',
  'Classic clinical CSV for a first classification project — predict presence of heart disease from routine measurements.',
  E'# Heart Disease Clinical Indicators\n\nA cleaned, beginner-friendly clinical dataset (based on the classic Cleveland Heart Disease collection) for practicing binary classification end to end: load → explore → train → evaluate.\n\n**Suggested first exercise:** predict `target` (1 = disease present) from the other 13 features using logistic regression, then a random forest, and compare AUC.\n\nNo missing values, no PII — safe to use in a tutorial setting.',
  array['clinical','cardiology','classification','beginner','tabular'],
  'CC BY 4.0',
  'tabular',
  'beginner',
  'static'
)
on conflict (slug) do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'heart_disease.csv', 14210, null, 303, 14,
  '[
    {"name":"age","type":"integer","description":"Age in years"},
    {"name":"sex","type":"integer","description":"1 = male, 0 = female"},
    {"name":"cp","type":"integer","description":"Chest pain type (0-3): 0 typical angina, 1 atypical angina, 2 non-anginal, 3 asymptomatic"},
    {"name":"trestbps","type":"integer","description":"Resting blood pressure, mm Hg on admission"},
    {"name":"chol","type":"integer","description":"Serum cholesterol, mg/dl"},
    {"name":"fbs","type":"integer","description":"Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)"},
    {"name":"restecg","type":"integer","description":"Resting ECG results (0-2)"},
    {"name":"thalach","type":"integer","description":"Maximum heart rate achieved"},
    {"name":"exang","type":"integer","description":"Exercise-induced angina (1 = yes, 0 = no)"},
    {"name":"oldpeak","type":"numeric","description":"ST depression induced by exercise relative to rest"},
    {"name":"slope","type":"integer","description":"Slope of the peak exercise ST segment (0-2)"},
    {"name":"ca","type":"integer","description":"Number of major vessels (0-3) colored by fluoroscopy"},
    {"name":"thal","type":"integer","description":"Thalassemia: 1 normal, 2 fixed defect, 3 reversible defect"},
    {"name":"target","type":"integer","description":"1 = heart disease present, 0 = absent (prediction target)"}
  ]'::jsonb,
  '[
    {"age":63,"sex":1,"cp":3,"trestbps":145,"chol":233,"fbs":1,"restecg":0,"thalach":150,"exang":0,"oldpeak":2.3,"slope":0,"ca":0,"thal":1,"target":1},
    {"age":37,"sex":1,"cp":2,"trestbps":130,"chol":250,"fbs":0,"restecg":1,"thalach":187,"exang":0,"oldpeak":3.5,"slope":0,"ca":0,"thal":2,"target":1},
    {"age":41,"sex":0,"cp":1,"trestbps":130,"chol":204,"fbs":0,"restecg":0,"thalach":172,"exang":0,"oldpeak":1.4,"slope":2,"ca":0,"thal":2,"target":1},
    {"age":56,"sex":1,"cp":1,"trestbps":120,"chol":236,"fbs":0,"restecg":1,"thalach":178,"exang":0,"oldpeak":0.8,"slope":2,"ca":0,"thal":2,"target":1},
    {"age":57,"sex":0,"cp":0,"trestbps":120,"chol":354,"fbs":0,"restecg":1,"thalach":163,"exang":1,"oldpeak":0.6,"slope":2,"ca":0,"thal":2,"target":1},
    {"age":63,"sex":0,"cp":2,"trestbps":140,"chol":195,"fbs":0,"restecg":1,"thalach":179,"exang":0,"oldpeak":0.0,"slope":2,"ca":2,"thal":2,"target":0}
  ]'::jsonb,
  true
from public.datasets where slug = 'heart-disease-clinical'
on conflict do nothing;

-- 2) Gene expression — GEO-derived matrix + phenotype table ──────
insert into public.datasets
  (title, slug, subtitle, description_md, tags, license, category, difficulty, update_frequency)
values (
  'Tuberculosis Blood Gene Expression (GEO subset)',
  'gene-expression-tb-blood',
  'Small whole-blood microarray expression matrix (genes × samples) with matched phenotype metadata, subset from a public GEO TB study.',
  E'# TB Blood Gene Expression\n\nA trimmed-down expression matrix derived from a public GEO tuberculosis whole-blood microarray study, paired with a phenotype table (TB status, treatment day, age, sex).\n\n**Suggested exercise:** differential expression between active TB and healthy controls, then a simple classifier on the top DE genes. Good first exposure to genes × samples matrices before moving to full RNA-seq counts.\n\nGene IDs are HGNC symbols for readability.',
  array['transcriptomics','microarray','tuberculosis','geo','gene-expression'],
  'CC0 1.0 (GEO public data)',
  'gene-expression',
  'intermediate',
  'static'
)
on conflict (slug) do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'expression_matrix.csv', 48200, null, 50, 9,
  '[
    {"name":"gene_symbol","type":"text","description":"HGNC gene symbol (row identifier)"},
    {"name":"sample_01 – sample_08","type":"numeric","description":"log2-normalized expression value; one column per sample, 8 total, matching phenotype.csv sample_id"}
  ]'::jsonb,
  '[
    {"gene_symbol":"IFI44L","sample_01":9.8,"sample_02":9.6,"sample_03":6.1,"sample_04":6.4},
    {"gene_symbol":"FCGR1A","sample_01":8.9,"sample_02":8.7,"sample_03":5.9,"sample_04":6.0},
    {"gene_symbol":"GBP5","sample_01":10.1,"sample_02":9.9,"sample_03":6.5,"sample_04":6.3},
    {"gene_symbol":"STAT1","sample_01":7.4,"sample_02":7.5,"sample_03":6.8,"sample_04":6.7}
  ]'::jsonb,
  true
from public.datasets where slug = 'gene-expression-tb-blood'
on conflict do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'phenotype.csv', 1120, null, 8, 5,
  '[
    {"name":"sample_id","type":"text","description":"Matches expression_matrix.csv column headers"},
    {"name":"tb_status","type":"text","description":"active_tb or healthy_control"},
    {"name":"age","type":"integer","description":"Age in years at sample collection"},
    {"name":"sex","type":"text","description":"M or F"},
    {"name":"treatment_day","type":"integer","description":"Days since treatment start (0 = baseline, healthy controls = NA)"}
  ]'::jsonb,
  '[
    {"sample_id":"sample_01","tb_status":"active_tb","age":34,"sex":"M","treatment_day":0},
    {"sample_id":"sample_02","tb_status":"active_tb","age":29,"sex":"F","treatment_day":0},
    {"sample_id":"sample_03","tb_status":"healthy_control","age":31,"sex":"M","treatment_day":null},
    {"sample_id":"sample_04","tb_status":"healthy_control","age":27,"sex":"F","treatment_day":null}
  ]'::jsonb,
  true
from public.datasets where slug = 'gene-expression-tb-blood'
on conflict do nothing;

-- 3) Variant data — VCF subset + flattened CSV ────────────────────
insert into public.datasets
  (title, slug, subtitle, description_md, tags, license, category, difficulty, update_frequency)
values (
  '1000 Genomes Variant Calls (chr22 subset)',
  'variant-calls-1000g-subset',
  'A small chr22 VCF subset plus a flattened, analysis-ready CSV — practice going from raw variant calls to a tidy table.',
  E'# 1000 Genomes chr22 Variant Subset\n\nA few hundred variant calls from chromosome 22, taken from the public 1000 Genomes Project, provided two ways:\n\n1. `subset.vcf` — the raw VCF, for practicing parsing (INFO fields, genotypes, multi-allelic sites)\n2. `variants_flat.csv` — the same variants already flattened to one row per variant with gene/consequence/allele-frequency annotation, for analysis without a VCF parser\n\n**Suggested exercise:** filter to `consequence = missense_variant` and `AF < 0.01` to find rare coding variants, then cross-reference `gene` against a disease gene panel.',
  array['vcf','variant-calling','population-genetics','1000-genomes','chr22'],
  'CC0 1.0 (1000 Genomes public data)',
  'variant',
  'intermediate',
  'static'
)
on conflict (slug) do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'subset.vcf', 62400, null, 412, 8,
  '[
    {"name":"CHROM","type":"text","description":"Chromosome (all rows: 22)"},
    {"name":"POS","type":"integer","description":"1-based position on the reference"},
    {"name":"ID","type":"text","description":"dbSNP rsID when known, otherwise ."},
    {"name":"REF","type":"text","description":"Reference allele"},
    {"name":"ALT","type":"text","description":"Alternate allele(s), comma-separated if multi-allelic"},
    {"name":"QUAL","type":"numeric","description":"Phred-scaled call quality"},
    {"name":"FILTER","type":"text","description":"PASS or a filter flag"},
    {"name":"INFO","type":"text","description":"Semicolon-delimited annotations (AF, gene, consequence, etc.)"}
  ]'::jsonb,
  '[
    {"CHROM":"22","POS":17058356,"ID":"rs131767","REF":"A","ALT":"G","QUAL":228,"FILTER":"PASS","INFO":"AF=0.42;GENE=CECR1;CSQ=missense_variant"},
    {"CHROM":"22","POS":17059427,"ID":".","REF":"C","ALT":"T","QUAL":190,"FILTER":"PASS","INFO":"AF=0.008;GENE=CECR1;CSQ=synonymous_variant"},
    {"CHROM":"22","POS":19710402,"ID":"rs5746136","REF":"G","ALT":"A","QUAL":250,"FILTER":"PASS","INFO":"AF=0.31;GENE=TBX1;CSQ=intron_variant"}
  ]'::jsonb,
  true
from public.datasets where slug = 'variant-calls-1000g-subset'
on conflict do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'variants_flat.csv', 38900, null, 412, 7,
  '[
    {"name":"chrom","type":"text","description":"Chromosome"},
    {"name":"pos","type":"integer","description":"1-based genomic position"},
    {"name":"ref","type":"text","description":"Reference allele"},
    {"name":"alt","type":"text","description":"Alternate allele"},
    {"name":"gene","type":"text","description":"Overlapping gene symbol"},
    {"name":"consequence","type":"text","description":"VEP-style consequence term (missense_variant, synonymous_variant, intron_variant, etc.)"},
    {"name":"AF","type":"numeric","description":"Alternate allele frequency in the 1000 Genomes panel"}
  ]'::jsonb,
  '[
    {"chrom":"22","pos":17058356,"ref":"A","alt":"G","gene":"CECR1","consequence":"missense_variant","AF":0.42},
    {"chrom":"22","pos":17059427,"ref":"C","alt":"T","gene":"CECR1","consequence":"synonymous_variant","AF":0.008},
    {"chrom":"22","pos":19710402,"ref":"G","alt":"A","gene":"TBX1","consequence":"intron_variant","AF":0.31},
    {"chrom":"22","pos":21334924,"ref":"T","alt":"C","gene":"COMT","consequence":"missense_variant","AF":0.15}
  ]'::jsonb,
  true
from public.datasets where slug = 'variant-calls-1000g-subset'
on conflict do nothing;

-- 4) scRNA-seq — 10x-style count matrix + cell metadata ───────────
insert into public.datasets
  (title, slug, subtitle, description_md, tags, license, category, difficulty, update_frequency)
values (
  'PBMC Single-Cell RNA-seq (mini 10x panel)',
  'scrna-pbmc-mini',
  'A trimmed 10x-style gene × cell count matrix from peripheral blood mononuclear cells, with per-cell metadata for clustering practice.',
  E'# PBMC scRNA-seq Mini Panel\n\nA small, teaching-scale subset (40 marker genes × 30 cells) of a public 10x Genomics PBMC dataset — full enough to practice normalization, clustering, and marker-gene identification without needing a cluster to run it.\n\n**Suggested exercise:** normalize counts, run PCA + Leiden/Louvain clustering, then check whether clusters separate by the classic PBMC markers (CD3D = T cells, MS4A1 = B cells, LYZ = monocytes) in `cell_metadata.csv`.\n\nThis is deliberately small — for the full-size dataset, see the external download link.',
  array['single-cell','10x-genomics','pbmc','scrna-seq','clustering'],
  'CC BY 4.0',
  'single-cell',
  'advanced',
  'static'
)
on conflict (slug) do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'counts_mini.csv', 15600, null, 40, 31,
  '[
    {"name":"gene_symbol","type":"text","description":"Marker gene symbol (row identifier, 40 curated PBMC markers)"},
    {"name":"cell_0001 – cell_0030","type":"integer","description":"Raw UMI count; one column per cell, 30 total, matching cell_metadata.csv cell_id"}
  ]'::jsonb,
  '[
    {"gene_symbol":"CD3D","cell_0001":5,"cell_0002":0,"cell_0003":8,"cell_0004":0},
    {"gene_symbol":"MS4A1","cell_0001":0,"cell_0002":12,"cell_0003":0,"cell_0004":9},
    {"gene_symbol":"LYZ","cell_0001":0,"cell_0002":0,"cell_0003":0,"cell_0004":0},
    {"gene_symbol":"NKG7","cell_0001":0,"cell_0002":0,"cell_0003":3,"cell_0004":0}
  ]'::jsonb,
  true
from public.datasets where slug = 'scrna-pbmc-mini'
on conflict do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'cell_metadata.csv', 2340, null, 30, 4,
  '[
    {"name":"cell_id","type":"text","description":"Matches counts_mini.csv column headers"},
    {"name":"n_genes","type":"integer","description":"Number of genes detected in this cell (of the 40-gene panel)"},
    {"name":"total_counts","type":"integer","description":"Total UMI counts for this cell"},
    {"name":"likely_type","type":"text","description":"Reference cell-type label from the source study (for checking your own clustering against), not for use as a training feature"}
  ]'::jsonb,
  '[
    {"cell_id":"cell_0001","n_genes":6,"total_counts":41,"likely_type":"T cell"},
    {"cell_id":"cell_0002","n_genes":8,"total_counts":63,"likely_type":"B cell"},
    {"cell_id":"cell_0003","n_genes":5,"total_counts":29,"likely_type":"NK cell"},
    {"cell_id":"cell_0004","n_genes":7,"total_counts":52,"likely_type":"B cell"}
  ]'::jsonb,
  true
from public.datasets where slug = 'scrna-pbmc-mini'
on conflict do nothing;

-- 5) GWAS summary statistics ───────────────────────────────────────
insert into public.datasets
  (title, slug, subtitle, description_md, tags, license, category, difficulty, update_frequency)
values (
  'Malaria Susceptibility GWAS Summary Statistics',
  'gwas-summary-stats-malaria',
  'Compact SNP-level summary statistics (beta, SE, p-value) from a malaria susceptibility GWAS — practice Manhattan/QQ plots and lead-SNP triage.',
  E'# Malaria GWAS Summary Statistics\n\nA compact summary-statistics table in the standard GWAS format (one row per SNP: effect size, standard error, p-value), modeled on published malaria susceptibility GWAS from African cohorts.\n\n**Suggested exercise:** build a Manhattan plot and a QQ plot, apply genome-wide significance (p < 5e-8), and pull out candidate genes near the top hits — several sit near known malaria-resistance loci (e.g. the HBB / sickle-cell region).\n\nSummary stats only — no individual-level genotypes, so no consent/privacy concerns for teaching use.',
  array['gwas','summary-statistics','malaria','africa','population-genetics'],
  null,
  'gwas',
  'intermediate',
  'static'
)
on conflict (slug) do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'gwas_sumstats.csv', 21500, null, 500, 7,
  '[
    {"name":"SNP","type":"text","description":"dbSNP rsID"},
    {"name":"chrom","type":"text","description":"Chromosome"},
    {"name":"pos","type":"integer","description":"1-based genomic position (GRCh38)"},
    {"name":"effect_allele","type":"text","description":"Allele the beta is measured against"},
    {"name":"beta","type":"numeric","description":"Effect size (log-odds scale) for the effect allele"},
    {"name":"se","type":"numeric","description":"Standard error of beta"},
    {"name":"p","type":"numeric","description":"Association p-value"}
  ]'::jsonb,
  '[
    {"SNP":"rs334","chrom":"11","pos":5227002,"effect_allele":"T","beta":-0.61,"se":0.09,"p":2.1e-11},
    {"SNP":"rs2814778","chrom":"1","pos":159205564,"effect_allele":"C","beta":-0.34,"se":0.07,"p":6.4e-7},
    {"SNP":"rs61028892","chrom":"11","pos":5248234,"effect_allele":"A","beta":0.12,"se":0.05,"p":0.014},
    {"SNP":"rs11036238","chrom":"11","pos":5209431,"effect_allele":"G","beta":-0.08,"se":0.06,"p":0.19}
  ]'::jsonb,
  true
from public.datasets where slug = 'gwas-summary-stats-malaria'
on conflict do nothing;

-- 6) Protein / sequence — FASTA + features table ──────────────────
insert into public.datasets
  (title, slug, subtitle, description_md, tags, license, category, difficulty, update_frequency)
values (
  'Hemoglobin Beta-Chain Variant Sequences',
  'protein-sequences-hbb-variants',
  'FASTA sequences for HBB (beta-globin) and common disease variants (incl. sickle-cell HbS), paired with a features table.',
  E'# HBB Variant Sequences\n\nProtein sequences (FASTA) for wild-type human beta-globin (HBB) and several clinically important variants, including HbS (sickle-cell), HbC, and HbE, paired with a features table describing each variant''s substitution and known clinical significance.\n\n**Suggested exercise:** align the variant sequences against wild-type, confirm each described substitution lands where the features table says it should, and practice writing a simple pairwise-alignment or diff script.',
  array['protein','fasta','hemoglobin','sickle-cell','sequence-analysis'],
  'CC BY 4.0',
  'protein',
  'intermediate',
  'static'
)
on conflict (slug) do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'sequences.fasta', 3200, null, 5, null,
  '[
    {"name":"header","type":"text","description":"FASTA header: >id description"},
    {"name":"sequence","type":"text","description":"Single-letter amino acid sequence, 147 residues for HBB"}
  ]'::jsonb,
  '[
    {"header":">HBB_WT wild-type beta-globin","sequence":"MVHLTPEEKSAVTALWGKV...VNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFGKEFTPPVQAAYQKVVAGVANALAHKYH"},
    {"header":">HBB_HbS sickle-cell (E6V)","sequence":"MVHLTPEEKSAVTALWGKV...VNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFGKEFTPPVQAAYQKVVAGVANALAHKYH (V at position 6, was E)"}
  ]'::jsonb,
  true
from public.datasets where slug = 'protein-sequences-hbb-variants'
on conflict do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'features.csv', 980, null, 5, 5,
  '[
    {"name":"id","type":"text","description":"Matches the FASTA header id"},
    {"name":"length_aa","type":"integer","description":"Sequence length in amino acids"},
    {"name":"substitution","type":"text","description":"Amino acid substitution vs wild-type, e.g. E6V (Glu6Val)"},
    {"name":"variant_name","type":"text","description":"Common clinical name (HbS, HbC, HbE) or wild_type"},
    {"name":"clinical_significance","type":"text","description":"Short note on the associated condition"}
  ]'::jsonb,
  '[
    {"id":"HBB_WT","length_aa":147,"substitution":null,"variant_name":"wild_type","clinical_significance":"reference sequence"},
    {"id":"HBB_HbS","length_aa":147,"substitution":"E6V","variant_name":"HbS","clinical_significance":"sickle-cell disease/trait"},
    {"id":"HBB_HbC","length_aa":147,"substitution":"E6K","variant_name":"HbC","clinical_significance":"mild hemolytic anemia"}
  ]'::jsonb,
  true
from public.datasets where slug = 'protein-sequences-hbb-variants'
on conflict do nothing;

-- 7) Africa-relevant cohort example ────────────────────────────────
-- Deliberately left without a `license` value below — a realistic
-- example of a dataset that's missing part of the usability rubric,
-- so the detail page's "what's missing" panel has something real to
-- show rather than every seed dataset scoring a flat 10/10.
insert into public.datasets
  (title, slug, subtitle, description_md, tags, license, category, difficulty, update_frequency)
values (
  'AWI-Gen Cohort Summary Statistics (H3Africa-aligned)',
  'africa-awigen-cohort-summary',
  'De-identified summary-level cohort statistics modeled on the AWI-Gen pan-African cardiometabolic study — no individual records.',
  E'# AWI-Gen-style Cohort Summary\n\nSummary-level (not individual-level) statistics modeled on the AWI-Gen study design — a pan-African cohort spanning six sites, studying cardiometabolic risk. This teaching dataset reflects the same variable set (age, sex, BMI, blood pressure, fasting glucose, population group) as aggregated summaries, not real participant records.\n\n**Suggested exercise:** compare cardiometabolic risk markers across `population_group` and `country`, and discuss why population-stratified reference ranges matter for African genomics — one of H3Africa''s core motivations.\n\nLicense pending confirmation with the source consortium — flagged as an example of a dataset with an incomplete usability profile.',
  array['africa','h3africa','cohort','population-health','cardiometabolic'],
  null,
  'africa-cohort',
  'beginner',
  'static'
)
on conflict (slug) do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'cohort_summary.csv', 8600, null, 120, 7,
  '[
    {"name":"site_id","type":"text","description":"Study site code (anonymized)"},
    {"name":"country","type":"text","description":"Country of the study site"},
    {"name":"population_group","type":"text","description":"Self-identified population/ethnolinguistic group, aggregated"},
    {"name":"mean_age","type":"numeric","description":"Mean participant age at this site, years"},
    {"name":"mean_bmi","type":"numeric","description":"Mean body mass index, kg/m²"},
    {"name":"mean_sbp","type":"numeric","description":"Mean systolic blood pressure, mmHg"},
    {"name":"mean_fasting_glucose","type":"numeric","description":"Mean fasting glucose, mmol/L"}
  ]'::jsonb,
  '[
    {"site_id":"site_a","country":"South Africa","population_group":"Sotho-Tswana","mean_age":52.3,"mean_bmi":27.1,"mean_sbp":128.4,"mean_fasting_glucose":5.4},
    {"site_id":"site_b","country":"Kenya","population_group":"Bantu","mean_age":49.8,"mean_bmi":24.6,"mean_sbp":124.1,"mean_fasting_glucose":5.1},
    {"site_id":"site_c","country":"Ghana","population_group":"Akan","mean_age":51.0,"mean_bmi":26.3,"mean_sbp":130.7,"mean_fasting_glucose":5.6},
    {"site_id":"site_d","country":"Burkina Faso","population_group":"Mossi","mean_age":47.5,"mean_bmi":22.9,"mean_sbp":119.8,"mean_fasting_glucose":4.9}
  ]'::jsonb,
  true
from public.datasets where slug = 'africa-awigen-cohort-summary'
on conflict do nothing;

-- 8) Challenge dataset with a held-out target ─────────────────────
insert into public.datasets
  (title, slug, subtitle, description_md, tags, license, category, difficulty, update_frequency, has_starter_exercise)
values (
  'Challenge: Predict Antimalarial Drug Response',
  'challenge-predict-drug-response',
  'Scored challenge — predict in-vitro antimalarial drug response from parasite genomic markers. Test set target is held out.',
  E'# Challenge: Predict Antimalarial Drug Response\n\nA held-out-target challenge: given genomic markers from *Plasmodium falciparum* isolates, predict in-vitro resistance to an antimalarial compound.\n\n- `train.csv` — markers + `resistant` label\n- `test.csv` — markers only; the real `resistant` label is held out for scoring\n\nSubmit predictions for `test.csv` through the starter exercise (see the linked notebook) to get a leaderboard score. Good practice for genotype-to-phenotype prediction with a small, interpretable marker panel rather than full-genome data.',
  array['challenge','pharmacogenomics','malaria','competition','genotype-phenotype'],
  'CC BY-NC 4.0',
  'challenge',
  'advanced',
  'static',
  true
)
on conflict (slug) do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'train.csv', 9400, null, 150, 6,
  '[
    {"name":"isolate_id","type":"text","description":"Anonymized parasite isolate identifier"},
    {"name":"pfcrt_k76t","type":"integer","description":"1 if the pfcrt K76T resistance marker is present, else 0"},
    {"name":"pfmdr1_n86y","type":"integer","description":"1 if the pfmdr1 N86Y marker is present, else 0"},
    {"name":"pfkelch13_mutant","type":"integer","description":"1 if a pfkelch13 propeller-domain mutation is present, else 0"},
    {"name":"parasitemia_pct","type":"numeric","description":"Baseline parasitemia, percent of infected red blood cells"},
    {"name":"resistant","type":"integer","description":"Training label: 1 = resistant in vitro, 0 = sensitive"}
  ]'::jsonb,
  '[
    {"isolate_id":"iso_001","pfcrt_k76t":1,"pfmdr1_n86y":1,"pfkelch13_mutant":0,"parasitemia_pct":2.1,"resistant":1},
    {"isolate_id":"iso_002","pfcrt_k76t":0,"pfmdr1_n86y":0,"pfkelch13_mutant":0,"parasitemia_pct":0.8,"resistant":0},
    {"isolate_id":"iso_003","pfcrt_k76t":1,"pfmdr1_n86y":0,"pfkelch13_mutant":1,"parasitemia_pct":3.4,"resistant":1},
    {"isolate_id":"iso_004","pfcrt_k76t":0,"pfmdr1_n86y":1,"pfkelch13_mutant":0,"parasitemia_pct":1.2,"resistant":0}
  ]'::jsonb,
  true
from public.datasets where slug = 'challenge-predict-drug-response'
on conflict do nothing;

insert into public.dataset_files (dataset_id, filename, size_bytes, storage_path, row_count, column_count, columns_doc, preview_json, parses_cleanly)
select id, 'test.csv', 3100, null, 50, 5,
  '[
    {"name":"isolate_id","type":"text","description":"Anonymized parasite isolate identifier"},
    {"name":"pfcrt_k76t","type":"integer","description":"1 if the pfcrt K76T resistance marker is present, else 0"},
    {"name":"pfmdr1_n86y","type":"integer","description":"1 if the pfmdr1 N86Y marker is present, else 0"},
    {"name":"pfkelch13_mutant","type":"integer","description":"1 if a pfkelch13 propeller-domain mutation is present, else 0"},
    {"name":"parasitemia_pct","type":"numeric","description":"Baseline parasitemia, percent of infected red blood cells (resistant label held out for scoring)"}
  ]'::jsonb,
  '[
    {"isolate_id":"iso_151","pfcrt_k76t":1,"pfmdr1_n86y":0,"pfkelch13_mutant":0,"parasitemia_pct":1.9},
    {"isolate_id":"iso_152","pfcrt_k76t":0,"pfmdr1_n86y":0,"pfkelch13_mutant":1,"parasitemia_pct":2.6}
  ]'::jsonb,
  true
from public.datasets where slug = 'challenge-predict-drug-response'
on conflict do nothing;
