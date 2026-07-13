-- ═══════════════════════════════════════════════════════════════
-- OmicsLab — dataset_columns seed data (Prompt 2)
-- Run AFTER db/schema.sql's Prompt 2 detail-page section and AFTER
-- db/seed_datasets.sql (needs dataset_files rows to exist first).
-- Idempotent — safe to re-run (deletes+reinserts per dataset by slug).
--
-- Populates per-column docs + summary_stats for a representative
-- spread of datasets/dtypes (numeric histograms, categorical top-value
-- bars). Columns that are pure identifiers (isolate_id, SNP rsIDs,
-- site_id) or wide sample-matrix ranges (sample_01…sample_08) are
-- skipped — a per-column card for a unique-per-row identifier or a
-- collapsed multi-column range isn't a meaningful distribution.
-- Aggregate counts are illustrative (teaching-scale data, same spirit
-- as the hand-authored preview_json in seed_datasets.sql) but always
-- sum to each file's row_count so the histograms/bars are internally
-- consistent.
-- ═══════════════════════════════════════════════════════════════

-- 1) Heart Disease Clinical Indicators — heart_disease.csv (303 rows) ─
delete from public.dataset_columns dc
using public.datasets d
where dc.dataset_id = d.id and d.slug = 'heart-disease-clinical';

insert into public.dataset_columns (dataset_id, file_id, name, dtype, description, summary_stats)
select d.id, f.id, c.name, c.dtype, c.description, c.summary_stats
from public.datasets d
join public.dataset_files f on f.dataset_id = d.id and f.filename = 'heart_disease.csv'
cross join lateral (values
  ('age', 'numeric', 'Age in years', '{"min":29,"max":77,"mean":54.4,"histogram":[
    {"bin_start":29,"bin_end":34,"count":8},{"bin_start":34,"bin_end":39,"count":16},
    {"bin_start":39,"bin_end":44,"count":28},{"bin_start":44,"bin_end":49,"count":45},
    {"bin_start":49,"bin_end":54,"count":58},{"bin_start":54,"bin_end":59,"count":62},
    {"bin_start":59,"bin_end":64,"count":49},{"bin_start":64,"bin_end":69,"count":25},
    {"bin_start":69,"bin_end":77,"count":12}
  ]}'::jsonb),
  ('sex', 'categorical', '1 = male, 0 = female', '{"top_values":[{"value":"1 (male)","count":206},{"value":"0 (female)","count":97}],"distinct_count":2}'::jsonb),
  ('cp', 'categorical', 'Chest pain type: 0 typical angina, 1 atypical angina, 2 non-anginal, 3 asymptomatic', '{"top_values":[{"value":"0","count":143},{"value":"2","count":86},{"value":"1","count":50},{"value":"3","count":24}],"distinct_count":4}'::jsonb),
  ('trestbps', 'numeric', 'Resting blood pressure, mm Hg on admission', '{"min":94,"max":200,"mean":131.6,"histogram":[
    {"bin_start":94,"bin_end":112,"count":18},{"bin_start":112,"bin_end":130,"count":132},
    {"bin_start":130,"bin_end":148,"count":110},{"bin_start":148,"bin_end":166,"count":31},
    {"bin_start":166,"bin_end":200,"count":12}
  ]}'::jsonb),
  ('chol', 'numeric', 'Serum cholesterol, mg/dl', '{"min":126,"max":564,"mean":246.3,"histogram":[
    {"bin_start":126,"bin_end":200,"count":42},{"bin_start":200,"bin_end":250,"count":118},
    {"bin_start":250,"bin_end":300,"count":92},{"bin_start":300,"bin_end":400,"count":41},
    {"bin_start":400,"bin_end":564,"count":10}
  ]}'::jsonb),
  ('fbs', 'categorical', 'Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)', '{"top_values":[{"value":"0","count":258},{"value":"1","count":45}],"distinct_count":2}'::jsonb),
  ('restecg', 'categorical', 'Resting ECG results (0-2)', '{"top_values":[{"value":"1","count":152},{"value":"0","count":147},{"value":"2","count":4}],"distinct_count":3}'::jsonb),
  ('thalach', 'numeric', 'Maximum heart rate achieved', '{"min":71,"max":202,"mean":149.6,"histogram":[
    {"bin_start":71,"bin_end":100,"count":14},{"bin_start":100,"bin_end":125,"count":38},
    {"bin_start":125,"bin_end":150,"count":89},{"bin_start":150,"bin_end":175,"count":115},
    {"bin_start":175,"bin_end":202,"count":47}
  ]}'::jsonb),
  ('exang', 'categorical', 'Exercise-induced angina (1 = yes, 0 = no)', '{"top_values":[{"value":"0","count":204},{"value":"1","count":99}],"distinct_count":2}'::jsonb),
  ('oldpeak', 'numeric', 'ST depression induced by exercise relative to rest', '{"min":0,"max":6.2,"mean":1.04,"histogram":[
    {"bin_start":0,"bin_end":1,"count":150},{"bin_start":1,"bin_end":2,"count":80},
    {"bin_start":2,"bin_end":3,"count":42},{"bin_start":3,"bin_end":4,"count":19},
    {"bin_start":4,"bin_end":6.2,"count":12}
  ]}'::jsonb),
  ('slope', 'categorical', 'Slope of the peak exercise ST segment (0-2)', '{"top_values":[{"value":"2","count":142},{"value":"1","count":140},{"value":"0","count":21}],"distinct_count":3}'::jsonb),
  ('ca', 'categorical', 'Number of major vessels (0-3) colored by fluoroscopy', '{"top_values":[{"value":"0","count":175},{"value":"1","count":65},{"value":"2","count":38},{"value":"3","count":25}],"distinct_count":4}'::jsonb),
  ('thal', 'categorical', 'Thalassemia: 1 normal, 2 fixed defect, 3 reversible defect', '{"top_values":[{"value":"2 (fixed defect)","count":166},{"value":"3 (reversible defect)","count":117},{"value":"1 (normal)","count":20}],"distinct_count":3}'::jsonb),
  ('target', 'categorical', '1 = heart disease present, 0 = absent (prediction target)', '{"top_values":[{"value":"0","count":164},{"value":"1","count":139}],"distinct_count":2}'::jsonb)
) as c(name, dtype, description, summary_stats)
where d.slug = 'heart-disease-clinical';

-- 2) 1000 Genomes Variant Calls — variants_flat.csv (412 rows) ────────
delete from public.dataset_columns dc
using public.datasets d
where dc.dataset_id = d.id and d.slug = 'variant-calls-1000g-subset';

insert into public.dataset_columns (dataset_id, file_id, name, dtype, description, summary_stats)
select d.id, f.id, c.name, c.dtype, c.description, c.summary_stats
from public.datasets d
join public.dataset_files f on f.dataset_id = d.id and f.filename = 'variants_flat.csv'
cross join lateral (values
  ('pos', 'numeric', '1-based genomic position', '{"min":16050075,"max":21334924,"mean":18492310,"histogram":[
    {"bin_start":16050075,"bin_end":17150075,"count":61},{"bin_start":17150075,"bin_end":18250075,"count":88},
    {"bin_start":18250075,"bin_end":19350075,"count":97},{"bin_start":19350075,"bin_end":20450075,"count":94},
    {"bin_start":20450075,"bin_end":21334924,"count":72}
  ]}'::jsonb),
  ('ref', 'categorical', 'Reference allele', '{"top_values":[{"value":"A","count":118},{"value":"C","count":102},{"value":"G","count":99},{"value":"T","count":93}],"distinct_count":4}'::jsonb),
  ('alt', 'categorical', 'Alternate allele', '{"top_values":[{"value":"G","count":112},{"value":"T","count":106},{"value":"A","count":98},{"value":"C","count":96}],"distinct_count":4}'::jsonb),
  ('gene', 'categorical', 'Overlapping gene symbol', '{"top_values":[{"value":"CECR1","count":94},{"value":"TBX1","count":81},{"value":"COMT","count":67},{"value":"DGCR8","count":54},{"value":"other","count":116}],"distinct_count":15}'::jsonb),
  ('consequence', 'categorical', 'VEP-style consequence term', '{"top_values":[{"value":"intron_variant","count":198},{"value":"missense_variant","count":89},{"value":"synonymous_variant","count":76},{"value":"other","count":49}],"distinct_count":6}'::jsonb),
  ('AF', 'numeric', 'Alternate allele frequency in the 1000 Genomes panel', '{"min":0.001,"max":0.49,"mean":0.14,"histogram":[
    {"bin_start":0,"bin_end":0.05,"count":176},{"bin_start":0.05,"bin_end":0.15,"count":98},
    {"bin_start":0.15,"bin_end":0.25,"count":62},{"bin_start":0.25,"bin_end":0.35,"count":44},
    {"bin_start":0.35,"bin_end":0.49,"count":32}
  ]}'::jsonb)
) as c(name, dtype, description, summary_stats)
where d.slug = 'variant-calls-1000g-subset';

-- 3) Malaria GWAS Summary Statistics — gwas_sumstats.csv (500 rows) ───
delete from public.dataset_columns dc
using public.datasets d
where dc.dataset_id = d.id and d.slug = 'gwas-summary-stats-malaria';

insert into public.dataset_columns (dataset_id, file_id, name, dtype, description, summary_stats)
select d.id, f.id, c.name, c.dtype, c.description, c.summary_stats
from public.datasets d
join public.dataset_files f on f.dataset_id = d.id and f.filename = 'gwas_sumstats.csv'
cross join lateral (values
  ('chrom', 'categorical', 'Chromosome', '{"top_values":[{"value":"11","count":142},{"value":"1","count":98},{"value":"5","count":76},{"value":"other","count":184}],"distinct_count":18}'::jsonb),
  ('effect_allele', 'categorical', 'Allele the beta is measured against', '{"top_values":[{"value":"A","count":138},{"value":"T","count":131},{"value":"C","count":119},{"value":"G","count":112}],"distinct_count":4}'::jsonb),
  ('beta', 'numeric', 'Effect size (log-odds scale) for the effect allele', '{"min":-0.61,"max":0.44,"mean":-0.02,"histogram":[
    {"bin_start":-0.61,"bin_end":-0.35,"count":9},{"bin_start":-0.35,"bin_end":-0.1,"count":78},
    {"bin_start":-0.1,"bin_end":0.1,"count":312},{"bin_start":0.1,"bin_end":0.35,"count":86},
    {"bin_start":0.35,"bin_end":0.44,"count":15}
  ]}'::jsonb),
  ('se', 'numeric', 'Standard error of beta', '{"min":0.02,"max":0.19,"mean":0.07,"histogram":[
    {"bin_start":0.02,"bin_end":0.05,"count":88},{"bin_start":0.05,"bin_end":0.08,"count":214},
    {"bin_start":0.08,"bin_end":0.12,"count":142},{"bin_start":0.12,"bin_end":0.19,"count":56}
  ]}'::jsonb),
  ('p', 'numeric', 'Association p-value', '{"min":2.1e-11,"max":0.98,"mean":0.29,"histogram":[
    {"bin_start":0,"bin_end":0.00000005,"count":6},{"bin_start":0.00000005,"bin_end":0.01,"count":41},
    {"bin_start":0.01,"bin_end":0.2,"count":118},{"bin_start":0.2,"bin_end":0.6,"count":201},
    {"bin_start":0.6,"bin_end":0.98,"count":134}
  ]}'::jsonb)
) as c(name, dtype, description, summary_stats)
where d.slug = 'gwas-summary-stats-malaria';

-- 4) AWI-Gen Cohort Summary — cohort_summary.csv (120 rows) ───────────
delete from public.dataset_columns dc
using public.datasets d
where dc.dataset_id = d.id and d.slug = 'africa-awigen-cohort-summary';

insert into public.dataset_columns (dataset_id, file_id, name, dtype, description, summary_stats)
select d.id, f.id, c.name, c.dtype, c.description, c.summary_stats
from public.datasets d
join public.dataset_files f on f.dataset_id = d.id and f.filename = 'cohort_summary.csv'
cross join lateral (values
  ('country', 'categorical', 'Country of the study site', '{"top_values":[{"value":"Nigeria","count":24},{"value":"South Africa","count":22},{"value":"Kenya","count":20},{"value":"Cameroon","count":20},{"value":"Ghana","count":18},{"value":"Burkina Faso","count":16}],"distinct_count":6}'::jsonb),
  ('population_group', 'categorical', 'Self-identified population/ethnolinguistic group, aggregated', '{"top_values":[{"value":"Bantu","count":34},{"value":"Sotho-Tswana","count":20},{"value":"Yoruba","count":17},{"value":"Akan","count":18},{"value":"Mossi","count":16},{"value":"Fulani","count":15}],"distinct_count":6}'::jsonb),
  ('mean_age', 'numeric', 'Mean participant age at this site, years', '{"min":44.2,"max":58.1,"mean":50.2,"histogram":[
    {"bin_start":44,"bin_end":47,"count":18},{"bin_start":47,"bin_end":50,"count":34},
    {"bin_start":50,"bin_end":53,"count":38},{"bin_start":53,"bin_end":56,"count":22},
    {"bin_start":56,"bin_end":58.1,"count":8}
  ]}'::jsonb),
  ('mean_bmi', 'numeric', 'Mean body mass index, kg/m²', '{"min":20.4,"max":29.8,"mean":25.5,"histogram":[
    {"bin_start":20.4,"bin_end":22.5,"count":14},{"bin_start":22.5,"bin_end":24.6,"count":29},
    {"bin_start":24.6,"bin_end":26.7,"count":41},{"bin_start":26.7,"bin_end":28.8,"count":26},
    {"bin_start":28.8,"bin_end":29.8,"count":10}
  ]}'::jsonb),
  ('mean_sbp', 'numeric', 'Mean systolic blood pressure, mmHg', '{"min":115.2,"max":134.9,"mean":125.7,"histogram":[
    {"bin_start":115,"bin_end":119,"count":12},{"bin_start":119,"bin_end":123,"count":26},
    {"bin_start":123,"bin_end":127,"count":37},{"bin_start":127,"bin_end":131,"count":31},
    {"bin_start":131,"bin_end":135,"count":14}
  ]}'::jsonb),
  ('mean_fasting_glucose', 'numeric', 'Mean fasting glucose, mmol/L', '{"min":4.6,"max":6.0,"mean":5.25,"histogram":[
    {"bin_start":4.6,"bin_end":4.9,"count":16},{"bin_start":4.9,"bin_end":5.2,"count":38},
    {"bin_start":5.2,"bin_end":5.5,"count":36},{"bin_start":5.5,"bin_end":5.8,"count":22},
    {"bin_start":5.8,"bin_end":6.0,"count":8}
  ]}'::jsonb)
) as c(name, dtype, description, summary_stats)
where d.slug = 'africa-awigen-cohort-summary';

-- 5) Challenge: Predict Antimalarial Drug Response — train.csv (150 rows) ─
delete from public.dataset_columns dc
using public.datasets d
where dc.dataset_id = d.id and d.slug = 'challenge-predict-drug-response';

insert into public.dataset_columns (dataset_id, file_id, name, dtype, description, summary_stats)
select d.id, f.id, c.name, c.dtype, c.description, c.summary_stats
from public.datasets d
join public.dataset_files f on f.dataset_id = d.id and f.filename = 'train.csv'
cross join lateral (values
  ('pfcrt_k76t', 'categorical', '1 if the pfcrt K76T resistance marker is present, else 0', '{"top_values":[{"value":"0","count":88},{"value":"1","count":62}],"distinct_count":2}'::jsonb),
  ('pfmdr1_n86y', 'categorical', '1 if the pfmdr1 N86Y marker is present, else 0', '{"top_values":[{"value":"0","count":97},{"value":"1","count":53}],"distinct_count":2}'::jsonb),
  ('pfkelch13_mutant', 'categorical', '1 if a pfkelch13 propeller-domain mutation is present, else 0', '{"top_values":[{"value":"0","count":121},{"value":"1","count":29}],"distinct_count":2}'::jsonb),
  ('parasitemia_pct', 'numeric', 'Baseline parasitemia, percent of infected red blood cells', '{"min":0.2,"max":6.8,"mean":2.1,"histogram":[
    {"bin_start":0.2,"bin_end":1.5,"count":42},{"bin_start":1.5,"bin_end":2.8,"count":51},
    {"bin_start":2.8,"bin_end":4.1,"count":33},{"bin_start":4.1,"bin_end":5.4,"count":16},
    {"bin_start":5.4,"bin_end":6.8,"count":8}
  ]}'::jsonb),
  ('resistant', 'categorical', 'Training label: 1 = resistant in vitro, 0 = sensitive', '{"top_values":[{"value":"0","count":86},{"value":"1","count":64}],"distinct_count":2}'::jsonb)
) as c(name, dtype, description, summary_stats)
where d.slug = 'challenge-predict-drug-response';
