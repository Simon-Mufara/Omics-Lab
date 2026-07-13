-- ═══════════════════════════════════════════════════════════════
-- OmicsLab — Learning integration seed data (Prompt 3)
-- Run AFTER db/schema.sql's Prompt 3 section and AFTER db/seed_datasets.sql.
-- Idempotent — safe to re-run (delete+reinsert by dataset slug).
--
-- recommended_workflow_ids reference REAL ids from js/workflows.js
-- (wgs, wes, rna-seq, scrna-seq, atac-seq, chip-seq, shotgun-meta,
-- 16s-amplicon, lc-ms, proteomics, viral-wgs, cite-seq, rt-qpcr,
-- ampli-seq) — verified against that file, not invented. Datasets that
-- don't map to any real wet-lab workflow (heart-disease-clinical is a
-- plain clinical tabular set; africa-awigen-cohort-summary is cohort
-- summary stats, not a sequencing run) deliberately have NO
-- dataset_learning row rather than a forced/fake recommendation.
-- ═══════════════════════════════════════════════════════════════

-- 1) TB Blood Gene Expression → Bulk RNA-seq ──────────────────────
delete from public.dataset_learning where dataset_id = (select id from public.datasets where slug = 'gene-expression-tb-blood');
delete from public.dataset_exercises where dataset_id = (select id from public.datasets where slug = 'gene-expression-tb-blood');

insert into public.dataset_learning (dataset_id, learning_objectives, recommended_workflow_ids, recommended_tool_ids, prerequisite_skill_tags, estimated_minutes)
select id,
  array['Distinguish active-TB from healthy-control expression signatures','Run a basic differential expression comparison between two phenotype groups','Interpret a small genes × samples matrix alongside its phenotype table'],
  array['rna-seq'],
  array['R/limma','DESeq2','pandas'],
  array['statistics-101','python-basics'],
  45
from public.datasets where slug = 'gene-expression-tb-blood';

insert into public.dataset_exercises (dataset_id, title, prompt_md, starter_config, solution_hint_md, difficulty, points)
select id, c.title, c.prompt_md, c.starter_config, c.solution_hint_md, c.difficulty, c.points
from public.datasets d
cross join lateral (values
  (
    'Load and inspect the expression matrix',
    E'Open **expression_matrix.csv** and **phenotype.csv** in the Bulk RNA-seq workflow bench. Confirm the sample columns in both files line up (`sample_01`…`sample_08`), and note how many active-TB vs healthy-control samples you have.',
    '{"workflowId":"rna-seq","datasetSlug":"gene-expression-tb-blood","focusFiles":["expression_matrix.csv","phenotype.csv"]}'::jsonb,
    'phenotype.csv''s `tb_status` column is your grouping variable — 4 active_tb, 4 healthy_control in the preview subset.',
    'beginner', 10
  ),
  (
    'Find the top differentially expressed genes',
    E'Using the two groups from `tb_status`, rank genes by the difference in mean expression between active-TB and healthy-control samples. Do the top genes (e.g. `IFI44L`, `GBP5`) match what''s known about the interferon-response signature in active TB?',
    '{"workflowId":"rna-seq","datasetSlug":"gene-expression-tb-blood","focusFiles":["expression_matrix.csv","phenotype.csv"],"focusColumns":["gene_symbol"]}'::jsonb,
    'A simple mean-difference or t-statistic ranking is enough here — this is a teaching-scale matrix, not a full DESeq2 pipeline.',
    'intermediate', 20
  )
) as c(title, prompt_md, starter_config, solution_hint_md, difficulty, points)
where d.slug = 'gene-expression-tb-blood';

-- 2) 1000 Genomes Variant Calls → Whole Genome Sequencing ─────────
delete from public.dataset_learning where dataset_id = (select id from public.datasets where slug = 'variant-calls-1000g-subset');
delete from public.dataset_exercises where dataset_id = (select id from public.datasets where slug = 'variant-calls-1000g-subset');

insert into public.dataset_learning (dataset_id, learning_objectives, recommended_workflow_ids, recommended_tool_ids, prerequisite_skill_tags, estimated_minutes)
select id,
  array['Go from a raw VCF to a tidy, analysis-ready variant table','Filter variants by consequence and allele frequency','Cross-reference a variant''s gene against a region of interest'],
  array['wgs'],
  array['bcftools','GATK','pandas'],
  array['genomics-basics'],
  40
from public.datasets where slug = 'variant-calls-1000g-subset';

insert into public.dataset_exercises (dataset_id, title, prompt_md, starter_config, solution_hint_md, difficulty, points)
select id, c.title, c.prompt_md, c.starter_config, c.solution_hint_md, c.difficulty, c.points
from public.datasets d
cross join lateral (values
  (
    'Parse the raw VCF',
    E'Open `subset.vcf` in the WGS workflow bench. Identify the `INFO` field''s `AF`, `GENE`, and `CSQ` sub-fields for the first 5 variants, and confirm they match the flattened `variants_flat.csv`.',
    '{"workflowId":"wgs","datasetSlug":"variant-calls-1000g-subset","focusFiles":["subset.vcf"]}'::jsonb,
    'INFO fields are semicolon-delimited key=value pairs — split on `;` then `=`.',
    'beginner', 10
  ),
  (
    'Find rare missense variants',
    E'Filter `variants_flat.csv` to `consequence = missense_variant` and `AF < 0.01`. How many rare coding variants remain, and which genes do they fall in?',
    '{"workflowId":"wgs","datasetSlug":"variant-calls-1000g-subset","focusFiles":["variants_flat.csv"],"focusColumns":["consequence","AF","gene"]}'::jsonb,
    'This is a two-condition filter on a flat table — no VCF parsing needed for this step.',
    'intermediate', 15
  )
) as c(title, prompt_md, starter_config, solution_hint_md, difficulty, points)
where d.slug = 'variant-calls-1000g-subset';

-- 3) PBMC scRNA-seq → scRNA-seq (10x Chromium) ────────────────────
delete from public.dataset_learning where dataset_id = (select id from public.datasets where slug = 'scrna-pbmc-mini');
delete from public.dataset_exercises where dataset_id = (select id from public.datasets where slug = 'scrna-pbmc-mini');

insert into public.dataset_learning (dataset_id, learning_objectives, recommended_workflow_ids, recommended_tool_ids, prerequisite_skill_tags, estimated_minutes)
select id,
  array['Normalize a small single-cell count matrix','Cluster cells and identify marker genes per cluster','Check clusters against known PBMC cell-type markers'],
  array['scrna-seq'],
  array['Seurat','Scanpy'],
  array['python-basics','statistics-101'],
  60
from public.datasets where slug = 'scrna-pbmc-mini';

insert into public.dataset_exercises (dataset_id, title, prompt_md, starter_config, solution_hint_md, difficulty, points)
select id, c.title, c.prompt_md, c.starter_config, c.solution_hint_md, c.difficulty, c.points
from public.datasets d
cross join lateral (values
  (
    'Normalize and inspect per-cell counts',
    E'Load `counts_mini.csv` and `cell_metadata.csv` in the scRNA-seq workflow bench. Compare `total_counts` across cells — do any look like outliers worth excluding before clustering?',
    '{"workflowId":"scrna-seq","datasetSlug":"scrna-pbmc-mini","focusFiles":["counts_mini.csv","cell_metadata.csv"]}'::jsonb,
    'Cells with unusually low `n_genes`/`total_counts` are the typical quality-control exclusions.',
    'intermediate', 15
  ),
  (
    'Check clusters against marker genes',
    E'Using the 40 marker genes provided, see whether cells with high `CD3D` (T cell), `MS4A1` (B cell), or `LYZ` (monocyte) expression line up with the `likely_type` reference label in `cell_metadata.csv`.',
    '{"workflowId":"scrna-seq","datasetSlug":"scrna-pbmc-mini","focusFiles":["counts_mini.csv","cell_metadata.csv"],"focusColumns":["gene_symbol","likely_type"]}'::jsonb,
    '`likely_type` is provided for checking your own clustering, not as a training feature — don''t feed it into the clustering step itself.',
    'advanced', 25
  )
) as c(title, prompt_md, starter_config, solution_hint_md, difficulty, points)
where d.slug = 'scrna-pbmc-mini';

-- 4) Malaria GWAS Summary Statistics → Whole Genome Sequencing ────
delete from public.dataset_learning where dataset_id = (select id from public.datasets where slug = 'gwas-summary-stats-malaria');
delete from public.dataset_exercises where dataset_id = (select id from public.datasets where slug = 'gwas-summary-stats-malaria');

insert into public.dataset_learning (dataset_id, learning_objectives, recommended_workflow_ids, recommended_tool_ids, prerequisite_skill_tags, estimated_minutes)
select id,
  array['Build a Manhattan plot from SNP-level summary statistics','Apply a genome-wide significance threshold','Connect a lead SNP to a known malaria-resistance locus'],
  array['wgs'],
  array['PLINK','R/qqman'],
  array['statistics-101','genomics-basics'],
  50
from public.datasets where slug = 'gwas-summary-stats-malaria';

insert into public.dataset_exercises (dataset_id, title, prompt_md, starter_config, solution_hint_md, difficulty, points)
select id, c.title, c.prompt_md, c.starter_config, c.solution_hint_md, c.difficulty, c.points
from public.datasets d
cross join lateral (values
  (
    'Build a Manhattan plot',
    E'Plot `-log10(p)` against genomic position across all chromosomes in `gwas_sumstats.csv`. Which chromosome shows the strongest signal?',
    '{"workflowId":"wgs","datasetSlug":"gwas-summary-stats-malaria","focusFiles":["gwas_sumstats.csv"],"focusColumns":["chrom","pos","p"]}'::jsonb,
    'Chromosome 11 carries the strongest signal here — that''s the HBB/sickle-cell region.',
    'intermediate', 15
  ),
  (
    'Apply genome-wide significance',
    E'Filter to `p < 5e-8` and list the surviving lead SNPs with their nearest gene. Do any sit near known malaria-resistance loci?',
    '{"workflowId":"wgs","datasetSlug":"gwas-summary-stats-malaria","focusFiles":["gwas_sumstats.csv"],"focusColumns":["SNP","p","beta"]}'::jsonb,
    'rs334 (the HbS sickle-cell variant) is the classic example to look for in this region.',
    'advanced', 20
  )
) as c(title, prompt_md, starter_config, solution_hint_md, difficulty, points)
where d.slug = 'gwas-summary-stats-malaria';

-- 5) HBB Variant Sequences → Shotgun Proteomics ───────────────────
delete from public.dataset_learning where dataset_id = (select id from public.datasets where slug = 'protein-sequences-hbb-variants');
delete from public.dataset_exercises where dataset_id = (select id from public.datasets where slug = 'protein-sequences-hbb-variants');

insert into public.dataset_learning (dataset_id, learning_objectives, recommended_workflow_ids, recommended_tool_ids, prerequisite_skill_tags, estimated_minutes)
select id,
  array['Align variant protein sequences against a wild-type reference','Confirm a described amino-acid substitution lands at the right position','Connect a substitution to its clinical variant name'],
  array['proteomics'],
  array['Clustal Omega','BLAST'],
  array['molecular-biology-basics'],
  30
from public.datasets where slug = 'protein-sequences-hbb-variants';

insert into public.dataset_exercises (dataset_id, title, prompt_md, starter_config, solution_hint_md, difficulty, points)
select id, c.title, c.prompt_md, c.starter_config, c.solution_hint_md, c.difficulty, c.points
from public.datasets d
cross join lateral (values
  (
    'Align HbS against wild-type',
    E'Align `HBB_HbS` against `HBB_WT` from `sequences.fasta`. Confirm the substitution lands at residue 6, matching `features.csv`''s `E6V` entry.',
    '{"workflowId":"proteomics","datasetSlug":"protein-sequences-hbb-variants","focusFiles":["sequences.fasta","features.csv"]}'::jsonb,
    'A simple position-by-position diff of the two sequences is enough for a 147-residue protein.',
    'beginner', 10
  )
) as c(title, prompt_md, starter_config, solution_hint_md, difficulty, points)
where d.slug = 'protein-sequences-hbb-variants';

-- 6) Challenge: Predict Antimalarial Drug Response → Ion AmpliSeq ─
-- (targeted marker panel — pfcrt/pfmdr1/pfkelch13 — is exactly what
-- Ion AmpliSeq's targeted-panel workflow simulates)
delete from public.dataset_learning where dataset_id = (select id from public.datasets where slug = 'challenge-predict-drug-response');
delete from public.dataset_exercises where dataset_id = (select id from public.datasets where slug = 'challenge-predict-drug-response');
delete from public.challenges where dataset_id = (select id from public.datasets where slug = 'challenge-predict-drug-response');

insert into public.dataset_learning (dataset_id, learning_objectives, recommended_workflow_ids, recommended_tool_ids, prerequisite_skill_tags, estimated_minutes)
select id,
  array['Build a genotype-to-phenotype classifier from a small marker panel','Evaluate a classifier with held-out test data','Submit predictions and interpret a leaderboard score'],
  array['ampli-seq'],
  array['scikit-learn','pandas'],
  array['python-basics','statistics-101'],
  75
from public.datasets where slug = 'challenge-predict-drug-response';

insert into public.dataset_exercises (dataset_id, title, prompt_md, starter_config, solution_hint_md, difficulty, points)
select id, c.title, c.prompt_md, c.starter_config, c.solution_hint_md, c.difficulty, c.points
from public.datasets d
cross join lateral (values
  (
    'Train a baseline classifier',
    E'Using `train.csv`, train a classifier to predict `resistant` from the three marker columns and `parasitemia_pct`. A simple logistic regression or decision tree is a fine baseline.',
    '{"workflowId":"ampli-seq","datasetSlug":"challenge-predict-drug-response","focusFiles":["train.csv"],"focusColumns":["pfcrt_k76t","pfmdr1_n86y","pfkelch13_mutant","resistant"]}'::jsonb,
    'pfcrt_k76t and pfkelch13_mutant are the two markers most strongly associated with resistance in this teaching set.',
    'intermediate', 20
  ),
  (
    'Submit predictions to the challenge',
    E'Generate predictions for `test.csv` and submit them via the Challenge panel on this dataset''s page to get a real leaderboard score.',
    '{"workflowId":"ampli-seq","datasetSlug":"challenge-predict-drug-response","focusFiles":["test.csv"]}'::jsonb,
    'Your submission CSV needs an `isolate_id` column matching test.csv, plus your predicted label as the last column.',
    'advanced', 30
  )
) as c(title, prompt_md, starter_config, solution_hint_md, difficulty, points)
where d.slug = 'challenge-predict-drug-response';

-- Demo challenge row. NOTE: held_out_answer_path points at a file that
-- still needs to be uploaded to the private `challenge-answers` Storage
-- bucket (service-role only — see db/schema.sql) before scoring will
-- actually work; api/score-challenge.js returns a clear 503 until then.
insert into public.challenges (dataset_id, title, description_md, metric, held_out_answer_path, is_active)
select id,
  'Predict Antimalarial Drug Response',
  'Predict in-vitro resistance (`resistant`: 1/0) for the 50 held-out isolates in test.csv from their genomic markers. Scored on accuracy against the held-out labels.',
  'accuracy',
  'challenge-predict-drug-response/test_answers.csv',
  true
from public.datasets where slug = 'challenge-predict-drug-response';
