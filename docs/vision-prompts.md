# OmicsLab — Vision Prompts: The World's Leading Bioinformatics Hub
## 55 Prompts across API Integration · AI · Real-time Data · Advanced Tools · Africa Platform

**Goal:** Make OmicsLab the definitive global platform for bioinformatics — where any researcher,
student, or clinician on the African continent (and globally) can access the full stack of genomic
knowledge, tools, data, and community in one place. No platform in the world currently does this.

> Build on the foundation prompts (docs/roadmap-prompts.md). These prompts advance from
> "good platform" to "legacy institution."

Priority tiers: **[P0]** Core · **[P1]** High-impact · **[P2]** Differentiating · **[P3]** Visionary

---

# PART 1 — LIVE API INTEGRATIONS
*Connect OmicsLab to every major authoritative data source in real-time*

## Prompt 41 [P0] — NCBI Entrez / PubMed Live Integration

**Why:** PubMed has 36 million citations. Every researcher needs it. Building it into the platform
removes context-switching and connects literature directly to OmicsLab tools.

**APIs used:**
- `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` — search any NCBI database
- `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi` — fetch full records
- `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi` — get article summaries

**Build:** `js/pubmed.js` — route `#/pubmed`

**Features:**
1. **Live search bar** — as-you-type NCBI search with 300ms debounce. Results show: title, authors,
   journal, year, PMID, abstract snippet. Filter by: date range, article type (Review, Clinical Trial,
   Meta-Analysis), free full text only.

2. **Gene search mode** — search by gene symbol (e.g. `HBB[Gene Name]`) → returns all papers
   mentioning that gene across NCBI databases.

3. **Africa filter** — pre-built query modifier: `AND ("Africa"[tiab] OR "sub-Saharan"[tiab] OR
   "Kenya"[tiab] OR "Nigeria"[tiab])` — surfaces Africa-relevant literature automatically.

4. **Save to PaperHub** — "Save" button on any result pushes it into `OmicsLab.PaperHub` library.

5. **Open in Article Analyser** — "Analyse" button on any result fetches the abstract, populates
   the Teams Article Analyser, runs `OmicsLab.Teams._artAnalyse()`.

6. **Export** — download results as CSV (PMID, title, authors, year, abstract).

**Rate limit:** NCBI allows 3 req/sec without API key, 10 req/sec with key.
Store NCBI API key in `js/config.js` (user can set their own in Settings).

```javascript
// Example query construction
const query = encodeURIComponent(`${term} AND ("Africa"[tiab] OR "Nigeria"[tiab])&datetype=pdat&mindate=2010`);
const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=20&retmode=json`;
```

---

## Prompt 42 [P0] — Ensembl REST API — Live Gene Annotation

**Why:** Ensembl is the canonical source for gene models, variant annotation, and comparative
genomics. Every variant interpreter and gene lookup tool needs it.

**API base:** `https://rest.ensembl.org`
**Headers required:** `Content-Type: application/json`

**Build:** Wire into existing tools + standalone gene lookup at `#/gene-lookup`

**Endpoints to integrate:**

```javascript
// Gene summary by symbol
GET /lookup/symbol/homo_sapiens/HBB?expand=1

// Variant consequence prediction (VEP)
GET /vep/human/hgvs/HBB%3Ac.20A%3ET

// Homologues in other African organisms (Plasmodium, M.tb)
GET /homology/symbol/homo_sapiens/HBB?target_species=plasmodium_falciparum

// Regulatory features at a locus
GET /regulatory/species/homo_sapiens/microarray?

// Population allele frequencies (1000 Genomes)
GET /variation/homo_sapiens/rs334?pops=1
```

**Wire into Variant Interpreter:** When a user submits a variant in `#/variantinterp`, after local
ACMG classification, make a background call to VEP and append:
- Ensembl consequence (missense_variant, stop_gained, etc.)
- ExAC/gnomAD population frequencies from Ensembl
- Regulatory impact (if in promoter, enhancer, CTCF binding site)
- Splice site prediction (SpliceAI score from Ensembl VEP plugins)

**Wire into PrimerDesign:** Auto-fetch gene coordinates from Ensembl when user types a gene name
instead of manually pasting a sequence.

**Standalone gene card:** Search any human/mouse/zebrafish/Plasmodium/Mtb gene →
Display: biotype, chromosome, coordinates, transcript count, GO terms, phenotypes, linked drugs.

---

## Prompt 43 [P0] — gnomAD API — Population Variant Frequencies

**Why:** gnomAD v4 has 807,162 genomes including expanded African representation. Critical for
determining variant pathogenicity (ACMG criterion PM2/BS1) and understanding African population
allele frequencies.

**API:** `https://gnomad.broadinstitute.org/api` (GraphQL)

**Build:** Integrate into `js/variantinterp.js` + standalone lookup

**GraphQL queries:**

```javascript
// Variant frequency lookup
const VARIANT_QUERY = `
  query VariantQuery($variantId: String!, $dataset: DatasetId!) {
    variant(variantId: $variantId, dataset: $dataset) {
      variantId
      chrom pos ref alt
      genome { af ac an homozygote_count
        populations { id ac an homozygote_count }
      }
      clinvar { clinical_significance }
      transcript_consequences { gene_symbol hgvsc hgvsp consequence_terms }
    }
  }`;

// African subpopulation IDs in gnomAD v4
// afr = African/African American
// amr = Admixed American (includes Afro-Caribbean)
```

**Variant Interpreter integration:**
When interpreting a variant, auto-query gnomAD and display:
- Global AF with colour coding (red > 5% → likely benign, green < 0.1% → rare)
- **Africa-specific AF** (afr subpopulation) — this is the clinically critical value for African patients
- Visual bar chart: AF across all gnomAD subpopulations
- Auto-apply ACMG BA1 (AF > 5%), BS1 (AF > expected), PM2 (absent in gnomAD) criteria

---

## Prompt 44 [P0] — AlphaFold API — Protein Structure Viewer

**Why:** AlphaFold has predicted structures for 200+ million proteins. For African disease proteins
(HBB, G6PD, APOL1, KCNJ11), structure directly informs understanding of pathogenic mechanisms.

**API:** `https://alphafold.ebi.ac.uk/api`

**Build:** `js/protein-viewer.js`, `css/protein-viewer.css`, route `#/protein`

**Endpoints:**
```javascript
// Get structure for a UniProt accession
GET https://alphafold.ebi.ac.uk/api/prediction/P68871  // Hemoglobin beta (HBB)
// Returns: pdbUrl, cifUrl, plddt (confidence), uniprotAccession, taxId

// Fetch PDB format structure
GET https://alphafold.ebi.ac.uk/files/AF-P68871-F1-model_v4.pdb
```

**3D Viewer:** Implement using `mol*` (Mol-star) viewer embedded as an iframe to
`https://molstar.org/viewer/?url=...` with the AlphaFold PDB URL.
No JavaScript library install needed — just the iframe with URL parameter.

**pLDDT confidence heatmap:** Render a linear pLDDT score chart (per-residue confidence)
alongside the 3D viewer. Colour-code: >90 (dark blue, very high), 70-90 (blue, confident),
50-70 (yellow, low), <50 (orange, very low — disordered regions).

**Disease variants on structure:** If user came from Variant Interpreter with a specific variant,
highlight that residue position on the 3D structure. Show surrounding amino acids within 5Å.

**Pre-loaded African disease proteins:**
- HBB (P68871) — Sickle cell / beta-thalassaemia
- G6PD (P11413) — G6PD deficiency (antimalarial drug sensitivity)
- APOL1 (O14791) — Kidney disease (G1/G2 variants)
- kelch13 (Q8IJE5) — Artemisinin resistance in P. falciparum
- rpoB (P0A7Y6) — Rifampicin resistance in M. tuberculosis
- HLA-B*57:01 — Abacavir hypersensitivity

---

## Prompt 45 [P1] — UniProt API — Protein Function & Disease Database

**Why:** UniProt is the authoritative source for protein function, disease associations, and
drug targets. The Africa disease burden (malaria, TB, HIV, SCD) has rich UniProt coverage.

**API:** `https://rest.uniprot.org/uniprotkb`

**Build:** Integrate into protein viewer + gene lookup

**Key endpoints:**
```javascript
// Search by gene name
GET https://rest.uniprot.org/uniprotkb/search?query=gene:HBB+AND+organism_id:9606&format=json

// Full entry
GET https://rest.uniprot.org/uniprotkb/P68871.json

// Returns: function, subcellular location, disease variants, GO terms,
// interactions, tissue expression, drug targets, pathways
```

**Display card:**
- Protein name, gene name, organism
- Function paragraph (UniProt curated)
- Disease section: list of conditions caused by variants in this protein
- Drugs that target this protein (from DrugBank cross-refs)
- GO biological processes (top 5)
- Subcellular location (nucleus / cytoplasm / membrane / extracellular)
- Cross-links: Ensembl · AlphaFold · PDB · OMIM · MIM

---

## Prompt 46 [P1] — Open Targets Platform API — Drug Targets for African Diseases

**Why:** Open Targets links genes to diseases using genetic evidence, expression, and drug data.
This is the most powerful tool for identifying which African disease genes are druggable.

**API:** `https://api.platform.opentargets.org/api/v4/graphql` (GraphQL)

**Build:** `js/drug-targets.js`, route `#/drug-targets`

**Key query:**
```javascript
// Disease-gene associations for malaria
const DISEASE_ASSOC_QUERY = `
  query DiseaseAssociations($diseaseId: String!, $size: Int!) {
    disease(efoId: $diseaseId) {
      name
      associatedTargets(page: {size: $size}) {
        rows {
          target { approvedSymbol approvedName }
          score
          datatypeScores { id score }
        }
      }
    }
  }`;

// African disease EFO IDs:
const DISEASES = {
  malaria:       'EFO_0001068',
  tuberculosis:  'MONDO_0018076',
  sickle_cell:   'MONDO_0011382',
  hiv:           'EFO_0000764',
  g6pd_defic:    'EFO_0000544',
  sleeping_sick: 'EFO_0000508',
};
```

**Display:** Ranked table of gene targets for selected disease, with:
- Genetic association score (GWAS, rare variants)
- Expression evidence score (GTEx, RNA-seq)
- Drug evidence: approved drugs, clinical trial drugs, preclinical compounds
- Colour-coded evidence heatmap (like Open Targets website)

**"Find drugs" mode:** User selects a variant from Variant Interpreter → Open Targets
shows existing drugs targeting that gene → shows clinical trial status for Africa

---

## Prompt 47 [P1] — KEGG Pathway API — Metabolic & Disease Pathway Visualisation

**Why:** KEGG maps genes to biological pathways. Essential for understanding what a differentially
expressed gene or a disease-associated variant actually does mechanistically.

**API:** `https://rest.kegg.jp`

**Build:** `js/pathways.js`, route `#/pathways`

**Endpoints:**
```javascript
// Get pathways for a gene
GET https://rest.kegg.jp/link/pathway/hsa:3043  // HBB gene (NCBI ID 3043)

// Get pathway details
GET https://rest.kegg.jp/get/hsa05144           // Malaria pathway

// Get pathway image
GET https://rest.kegg.jp/get/hsa05144/image     // PNG diagram

// Find pathways by disease keyword
GET https://rest.kegg.jp/find/pathway/malaria
```

**Pathway viewer:**
- Display KEGG pathway PNG image in a pannable/zoomable container
- Overlay user's gene list on the pathway (colour-code: red=upregulated, blue=downregulated)
- This enables DESeq2 results from Expression Analyser to be visualised on biological pathways

**Africa disease pathways pre-loaded:**
- hsa05144: Malaria
- hsa05152: Tuberculosis
- hsa05170: HIV infection
- hsa05020: Prion diseases
- hsa00480: Glutathione metabolism (G6PD deficiency)
- hsa00030: Pentose phosphate pathway (G6PD)

---

## Prompt 48 [P1] — STRING API — Protein-Protein Interaction Networks

**Why:** STRING has interaction data for 67+ million proteins. When a GWAS hit or variant is
identified, the first question is "what does this protein interact with?"

**API:** `https://string-db.org/api`

**Build:** Integrated into gene lookup + protein viewer as "Interaction Network" panel

**Key endpoints:**
```javascript
// Get interaction partners for HBB
GET https://string-db.org/api/json/interaction_partners?identifiers=HBB&species=9606&required_score=700&limit=20

// Get network image
GET https://string-db.org/api/image/network?identifiers=HBB&species=9606&required_score=700

// Response includes: stringId, preferredName, score, ncbiTaxonId
```

**Interactive network:** Render interaction network as SVG force-directed graph
(same D3-force implementation from Knowledge Graph — Prompt 38).
Node size = confidence score. Edge thickness = interaction strength.
Hover: show interaction evidence types (experimental, co-expression, text-mining, database).

**Enrichment panel:** Given a gene set, fetch STRING enrichment:
- Over-represented GO terms
- KEGG pathways
- Reactome pathways
- Show as horizontal bar chart

---

## Prompt 49 [P1] — bioRxiv / medRxiv Live Preprint Feed

**Why:** 60-70% of genomics findings appear on bioRxiv 6-12 months before journal publication.
The fastest-moving African genomics research (COVID variants, outbreak genomics) is on preprint
servers first. OmicsLab should surface this before any other platform.

**API:** `https://api.biorxiv.org/details/biorxiv/` (no key required)

**Build:** `js/preprints.js` integrated into PaperHub + home page feed

**Endpoints:**
```javascript
// Latest preprints in genomics category (last 30 days)
GET https://api.biorxiv.org/details/biorxiv/2024-05-01/2024-05-31/0/json

// medRxiv clinical/health preprints
GET https://api.biorxiv.org/details/medrxiv/2024-05-01/2024-05-31/0/json

// Returns: doi, title, authors, abstract, date, category, jatsxml
```

**Africa filter:** Post-process results: keep only preprints where abstract or author
affiliation contains African country/institution keywords.

**PaperHub integration:** "Live Preprints" tab in PaperHub — auto-refreshes daily,
sorted by "Africa relevance" score (weighted keyword match). "Track topic" button
saves a search term; new matching preprints trigger notifications.

**Home page feed:** Top 3 Africa-relevant preprints from last 7 days shown in the
home page "Africa Pulse" section alongside outbreak alerts.

---

## Prompt 50 [P1] — WHO Disease Surveillance API — Real-time Outbreak Data

**Why:** The WHO publishes weekly epidemiological reports and outbreak news. OmicsLab's Alerts
module should pull from authoritative WHO sources, not hardcoded data.

**Sources:**
- WHO Disease Outbreak News RSS: `https://www.who.int/feeds/entity/csr/don/en/rss.xml`
- WHO Epidemic Intelligence Information System (not public API — use RSS)
- Africa CDC Outbreak feed (available via Africa CDC website)
- ReliefWeb API: `https://api.reliefweb.int/v1/reports` (disasters and outbreaks)

**Build:** Extend `js/alerts.js` to pull from live feeds:

```javascript
async function _fetchWHOFeed() {
  // Proxy through a CORS-friendly RSS-to-JSON service (no backend needed)
  const url = 'https://api.rss2json.com/v1/api.json?rss_url=' +
    encodeURIComponent('https://www.who.int/feeds/entity/csr/don/en/rss.xml');
  const res = await fetch(url);
  const data = await res.json();
  return data.items.map(item => ({
    title: item.title,
    date: new Date(item.pubDate),
    link: item.link,
    summary: item.description.replace(/<[^>]+>/g, '').slice(0, 200),
    source: 'WHO DON',
  }));
}
```

**Outbreak classification:** Run Africa keyword detection on each WHO report title/summary.
Only surface Africa-relevant outbreaks in the main alert feed. Global outbreaks (non-Africa)
shown in a separate "Global Watch" panel.

**Genomic readiness score:** For each outbreak, OmicsLab calculates a "Genomic Readiness
Score" based on: (1) whether WGS protocols exist for the pathogen, (2) whether reference
genomes are in NCBI, (3) whether Africa has sequencing capacity for this pathogen.

---

## Prompt 51 [P2] — NCBI SRA Browser — African Sequencing Data Discovery

**Why:** The SRA has petabytes of sequencing data. Africa-origin datasets are growing rapidly
(H3Africa, MalariaGEN, AWI-Gen). Researchers need to find, preview, and download these datasets.

**API:** NCBI E-utilities SRA database

**Build:** `js/sra-browser.js`, route `#/data`

**Search interface:**
```javascript
// Search SRA for Africa WGS studies
const query = 'Africa[All Fields] AND "whole genome sequencing"[All Fields] AND "Homo sapiens"[Organism]';
const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=sra&term=${encodeURIComponent(query)}&retmax=50&retmode=json`;
```

**Dataset cards:**
- Study accession (SRP/ERP/DRP), title, organism, platform (Illumina/Nanopore)
- Sample count, run count, total bases (formatted: "234 Gb")
- Country of origin (parsed from sample attributes)
- "Download instructions" — generates the exact SRA Toolkit command: `prefetch SRP123456 && fasterq-dump SRP123456`
- "Open in Analysis Studio" — for small datasets, offers to load demo data in `#/analysis`

**Curated Africa datasets** (pinned at top):
- H3Africa consortium studies
- AWI-Gen (Wits African Ageing study)
- MalariaGEN Plasmodium falciparum community project
- WHO SARS-CoV-2 Africa sequences
- TB Portals database (Africa sites)
- Nigerian 100K Genome reference panel

---

## Prompt 52 [P2] — Reactome Pathway API — Systems Biology View

**API:** `https://reactome.org/ContentService`

**Build:** Complement KEGG Pathways (Prompt 47) with Reactome for human-curated pathways

**Key endpoint:**
```javascript
// Pathway hierarchy for a gene
GET https://reactome.org/ContentService/data/pathways/low/entity/P68871/allForms?species=9606

// Pathway details
GET https://reactome.org/ContentService/data/query/R-HSA-1280215

// Enrichment analysis: POST a list of gene IDs
POST https://reactome.org/AnalysisService/identifiers/
Body: HBB\nAPOL1\nG6PD\nKELCH13
```

**Reactome Pathway Browser integration:** Instead of reimplementing the viewer,
embed Reactome's own pathway browser:
```html
<iframe src="https://reactome.org/PathwayBrowser/#/R-HSA-1280215"
        style="width:100%;height:600px;border:none"></iframe>
```

With URL parameter support for gene highlighting: `?DTAB=AN&ANALYSIS=...`

---

## Prompt 53 [P2] — DisGeNET API — Gene-Disease Associations for Africa

**Why:** DisGeNET has 1.2 million gene-disease associations. Critical for understanding the
genetic basis of African diseases.

**API:** `https://www.disgenet.org/api` (free registration required for API key)

**Build:** Integrated into gene lookup

```javascript
// Get diseases associated with a gene
GET https://www.disgenet.org/api/gda/gene/3043?limit=20&format=json
// Headers: Authorization: Bearer <API_KEY>
// Returns: disease name, score, EI (evidence index), YI (year index), source count
```

**Africa disease filter:** Sort results by whether disease appears in African burden of disease
data. Highlight diseases with high DALYs in Africa.

---

# PART 2 — AI-POWERED FEATURES
*Integrate large language models to make OmicsLab the world's smartest bioinformatics assistant*

## Prompt 54 [P0] — OmicsLab AI Research Assistant (Full Integration)

**Why:** A context-aware AI assistant that understands genomics, knows the user's current tool
output, and can explain, interpret, recommend, and draft — is the single feature that no other
bioinformatics platform currently offers at this depth.

**Build:** `js/assistant.js` (full implementation), `css/assistant.css`

**Backend endpoint:** `POST /ai/chat` — streams via Server-Sent Events

**Context injection system:**
Each page injects its current state into the AI context when the assistant is opened:
```javascript
// In variantinterp.js, after analysis:
OmicsLab.Assistant.setContext({
  page: 'variantinterp',
  variant: { hgvs: 'HBB:c.20A>T', classification: 'Pathogenic', criteria: ['PVS1','PM2'] },
  gnomad_af: 0.00002,
});

// In heatmap.js:
OmicsLab.Assistant.setContext({
  page: 'heatmap',
  topGenes: ['APOL1','HBB','G6PD'],
  clusters: 3,
  differentialGenes: 247,
});
```

**Suggested prompts per page context:**
- Variant Interpreter: "Why is this variant classified as Pathogenic?", "What is the mechanism of HBB:c.20A>T?", "What clinical management is recommended?"
- Heatmap: "What biological processes do these gene clusters represent?", "Which genes should I validate with RT-qPCR?"
- PubMed: "Summarise the key findings from these papers", "What are the methodological differences between these studies?"
- Article Analyser: "What are the limitations of this study?", "How would I design a follow-up study in Nigeria?"
- Phylo Tree: "What does this clustering pattern suggest about outbreak spread?", "Is this consistent with a single introduction event?"

**Streaming UI:**
- Text streams token-by-token (Server-Sent Events)
- Code blocks automatically syntax-highlighted
- Markdown rendered (bold, lists, headers)
- "Copy" button on every code block
- "Insert into tool" button: pastes code directly into the relevant tool's input field

**Usage tiers:**
- Free: 10 AI messages/day (counted in localStorage, reset midnight)
- Signed-in: 30 AI messages/day (tracked in backend)
- Researcher badge: 100 AI messages/day
- Educator: unlimited

---

## Prompt 55 [P1] — AI-Powered Variant Interpretation Enhancement

**Why:** Current ACMG classification is rule-based. AI can provide nuanced interpretation
combining gnomAD frequencies, literature evidence, protein structure, and functional data.

**Build:** Extend `js/variantinterp.js` with AI interpretation layer

**After standard ACMG classification:**
```javascript
async function _aiInterpret(variant, acmgResult, gnomadData, ensemblData) {
  const context = `
    Variant: ${variant.hgvs}
    Gene: ${variant.gene}
    ACMG classification: ${acmgResult.classification}
    Applied criteria: ${acmgResult.criteria.join(', ')}
    gnomAD African AF: ${gnomadData.afr_af}
    Protein consequence: ${ensemblData.consequence}
    Patient context: African ancestry
  `;
  // Stream AI interpretation to a collapsible panel below the ACMG verdict
}
```

**AI output sections:**
1. Plain-English explanation of the classification
2. Clinical significance for African patients specifically (different AFs, different disease context)
3. Recommended confirmatory testing (Sanger, functional assay)
4. Family counselling implications
5. Literature summary: key papers about this variant in African cohorts

---

## Prompt 56 [P1] — AI Thesis Writing Coach

**Why:** African PhD students and MSc students in bioinformatics often lack access to expert
supervisors who understand both the science and the writing. OmicsLab can fill this gap.

**Build:** `js/thesis-coach.js`, route `#/thesis`

**Full thesis management system:**

1. **Project setup:** User enters thesis title, degree (MSc/PhD), institution, supervisor,
   submission date, research question.

2. **Chapter tracker:** Visual progress board with 5 chapters (Introduction, Methods, Results,
   Discussion, Conclusion). Each chapter: % written, last edited, word count target vs actual.

3. **AI chapter assistant:** Open any chapter → AI writes an outline, suggests subsections,
   drafts topic sentences, reviews what the user has written.

4. **Reference manager:** PubMed search → cite button → auto-generates reference in APA/Vancouver.
   Export bibliography as .bib (BibTeX) or Word .docx reference list.

5. **Plagiarism pre-check:** Basic trigram overlap check against the user's own previous text
   (flags self-plagiarism from previously pasted text).

6. **Figure suggestions:** Based on the methods section, AI suggests which figures to include
   (Manhattan plot, volcano plot, phylogenetic tree, heatmap) and how to caption them.

7. **Abstract generator:** Feed in key findings → AI drafts a structured abstract with
   Background, Methods, Results, Conclusions within target word count.

---

## Prompt 57 [P1] — AI Grant Writing Assistant

**Why:** Securing funding is the #1 barrier for African researchers. Grant writing is a learnable
skill, but most African institutions don't teach it. OmicsLab makes it teachable.

**Build:** `js/grant-assistant.js`, route `#/grants`

**Grant intelligence database** (curated, updated quarterly):
```javascript
const GRANTS = [
  { name: 'H3Africa Catalyst Grant', funder: 'NIH Fogarty', amount: '$150,000', deadline: 'Rolling', eligibility: 'African PI, African institution', url: '...', fields: ['genomics','epidemiology'] },
  { name: 'Wellcome Trust African Institutions Initiative', funder: 'Wellcome', amount: '£500,000', deadline: 'Annual', eligibility: 'Sub-Saharan Africa', url: '...', fields: ['any health research'] },
  { name: 'MasterCard Foundation Scholars Program', funder: 'MasterCard Foundation', amount: 'Full scholarship', deadline: 'Annual', eligibility: 'African students', url: '...', fields: ['STEM'] },
  { name: 'TWAS Research Grant', funder: 'TWAS/UNESCO', amount: '$15,000', deadline: 'March', eligibility: 'Africa, Asia, LAC', url: '...', fields: ['basic sciences'] },
  { name: 'African Academy of Sciences LEAP', funder: 'AAS/AESA', amount: '$50,000', deadline: 'Annual', eligibility: 'African researchers', url: '...', fields: ['health','agriculture','environment'] },
  { name: 'NIH K43 Emerging Global Leader Award', funder: 'NIH', amount: '$250,000/5yr', deadline: 'February/June', eligibility: 'African institutions', url: '...', fields: ['biomedical'] },
  // ... 30+ grants
];
```

**AI grant writer:**
- User selects a grant → AI generates a tailored specific aims page (1 page NIH format)
- AI adapts OmicsLab research data (publications, badge achievements, tool usage) into a CV
- Significance, Innovation, Approach sections drafted with AI, user edits
- Budget narrative template per grant type
- Common reviewer mistakes: AI flags weak sentences, vague aims, missing justification

---

## Prompt 58 [P2] — BioNLP Entity Recognition — Scientific Text Mining

**Why:** When researchers paste text into Article Analyser or thesis coach, detecting biomedical
named entities (genes, diseases, organisms, chemicals, variants) adds structured intelligence.

**Build:** Client-side implementation using curated dictionaries + regex

**Entity types to detect:**
- Genes: HGNC-approved symbols (curated list of 45,000+, stored as compact trie)
- Diseases: MeSH disease terms (top 5000 by publication count)
- Organisms: NCBI taxonomy common names (Plasmodium falciparum, M. tuberculosis, etc.)
- Variants: HGVS notation patterns (`c.\d+[A-Z]>[A-Z]`, `p\.[A-Z][a-z]{2}\d+[A-Z][a-z]{2}`)
- Drugs: WHO Essential Medicines List (sub-Saharan Africa specific list)
- SNPs: rs\d+ pattern
- Accessions: SRR/SRP/ERR/GEO patterns

**Highlight entities in text:** When article text is analysed, re-render it with
`<mark class="ent-gene">HBB</mark>` spans. Clicking a gene entity → opens gene lookup panel.

---

# PART 3 — ADVANCED ANALYSIS TOOLS
*Tools that no browser-based platform currently offers*

## Prompt 59 [P0] — Interactive Genome Browser (IGV.js Integration)

**Why:** IGV (Integrative Genomics Viewer) is the gold standard for viewing BAM, VCF, and BED files.
Making it run in the browser means field researchers can view their alignments without a server.

**Build:** `js/genome-browser.js`, route `#/browser`

**Integration approach:**
```html
<!-- IGV.js is CDN-available and works entirely client-side -->
<script src="https://cdn.jsdelivr.net/npm/igv@2.15.11/dist/igv.min.js"></script>
```

```javascript
const browser = await igv.createBrowser(container, {
  genome: 'hg38',
  locus: 'chr11:5,225,464-5,227,071',  // HBB locus
  tracks: [
    {
      name: 'H3Africa Variants',
      type: 'variant',
      format: 'vcf',
      url: './data/h3africa-sample.vcf.gz',
      indexURL: './data/h3africa-sample.vcf.gz.tbi',
    },
    {
      name: 'gnomAD AFR',
      type: 'variant',
      format: 'vcf',
      url: 'https://gnomad.broadinstitute.org/...',
    }
  ],
});
```

**Pre-configured loci (Africa disease relevant):**
- HBB locus chr11:5.22-5.23 Mb (sickle cell, beta-thal)
- G6PD locus chrX:154.53-154.54 Mb (G6PD deficiency)
- APOL1 locus chr22:36.24-36.27 Mb (kidney disease)
- kelch13 chr13 in Pf3D7 reference genome (artemisinin resistance)
- rpoB in Mtb H37Rv reference (rifampicin resistance)

**User data loading:**
- Load local VCF/BAM from file upload
- Load from SRA accession (stream BAM via NCBI HTTPS BAM endpoint)
- Export visible region as SVG/PNG

---

## Prompt 60 [P1] — Kraken2 Metagenomics Simulator

**Why:** Metagenomics is exploding in African research (gut microbiome, environmental surveillance,
pathogen detection). No browser-based Kraken2 simulator exists.

**Build:** `js/kraken.js`, route `#/kraken`

**Simulated Kraken2 classification:**
- Use a pre-built in-memory k-mer database covering: 50 bacterial species common in African clinical
  and environmental samples, 10 viral species (SARS-CoV-2, Influenza, Ebola, Dengue),
  5 Plasmodium species, M. tuberculosis complex.
- User uploads/pastes FASTQ reads (≤10,000 reads processed in browser)
- Run sliding 31-mer classification: each read scored against k-mer signatures
- Output: taxonomic classification table + Krona-style pie chart

**Bracken abundance estimation:** Re-estimate species abundances from classified reads using
a simplified EM algorithm.

**African microbiome reference panel:**
- Gut microbiome baseline: healthy adults from Nigeria, Kenya, South Africa (H3Africa data)
- Environmental: water sources in sub-Saharan Africa (cholera surveillance context)
- Clinical: bloodstream infections in African hospitals (Klebsiella, Salmonella, Staph aureus)

**Visualisation:** Krona-style interactive sunburst chart. Sankey diagram of kingdom → phylum →
genus → species flow.

---

## Prompt 61 [P1] — Codon Usage Analyser + Rare Codon Visualiser

**Build:** `js/codon.js`, route `#/codon`

**Analysis suite:**
1. **RSCU** (Relative Synonymous Codon Usage) — deviation from uniform codon use
2. **CAI** (Codon Adaptation Index) — how optimised for an expression host the sequence is
3. **Rare codon plot** — bar chart highlighting codons with tRNA availability < 20% in the
   expression host (E. coli, S. cerevisiae, P. pastoris, HEK293)
4. **GC content per codon position** — GC1, GC2, GC3 (parity analysis)

**African pathogen codon databases:**
- P. falciparum: ~80% AT-biased genome (unusual codon usage — critical for expression studies)
- M. tuberculosis: ~65% GC-biased genome
- Pre-loaded reference codon tables for both organisms

**Practical output:**
- "Codon harmonisation" button: suggest synonymous mutations to improve expression
  in a selected host (changes rare codons to common ones without changing protein)
- Generate harmonised DNA sequence as FASTA

---

## Prompt 62 [P1] — Oxford Nanopore Real-time QC Simulator

**Why:** Nanopore sequencing is transforming African genomics (portable, no cold chain).
MinION devices are deployed in African field labs. OmicsLab should speak Nanopore fluently.

**Build:** Extension of `js/analysis.js` Analysis Studio — Nanopore-specific module

**Differences from Illumina QC:**
- Read lengths: N50 instead of mean read length (Nanopore reads vary 100bp-1Mb)
- Quality score: mean Q ≥ 8 (Nanopore) vs Q ≥ 30 (Illumina) — different thresholds
- Pore occupancy: number of active pores over time
- Basecalling mode: fast vs high-accuracy (HAC) has different Q thresholds

**Specific outputs:**
- Read length N50 distribution histogram
- Quality score distribution (Q8, Q10, Q15, Q20 bands)
- Estimated genome coverage given input bases and genome size
- **Adaptive sampling efficiency** — what % of reads were from the target region if using selective enrichment
- **Contamination detection** — estimated % human/bacterial/viral reads from k-mer screening

**Reference context:** Pre-populate with Nanopore-specific presets:
- Field sequencing (MinION), mobile lab (Flongle), core facility (PromethION)
- Each preset has realistic yield and quality expectations

---

## Prompt 63 [P2] — Population Structure Visualiser (ADMIXTURE / PCA)

**Why:** Every African GWAS paper includes a PCA or ADMIXTURE plot. Students need to understand
what these mean and be able to create them. No interactive browser tool exists.

**Build:** `js/popstruct.js`, route `#/popstruct`

**1000 Genomes Africa Data** (pre-loaded, reduced):
- 504 African samples: Yoruba (YRI), Esan (ESN), Mende (MSL), Gambian (GWD), Luhya (LWK)
- 100 European (CEU), 100 East Asian (CHB) as reference
- Pre-computed PC scores (PC1–PC10) for fast rendering

**PCA plot:**
- Scatter plot: PC1 vs PC2, PC2 vs PC3, any two PCs
- Colour-coded by population
- User can upload their own PCA output (PLINK .eigenvec format) → overlay on reference
- Zoom, pan, click sample to see metadata

**ADMIXTURE bars:**
- Animated stacked bar chart (K=2 through K=10)
- "Animate K" button cycles through K values, bars transition smoothly
- User can upload PLINK ADMIXTURE .Q file → display their own data

**Interpretation guide:** Below the plot, contextualised explanation:
- What PC1 represents in African populations (Nilo-Saharan to Bantu cline)
- How to detect population stratification in your GWAS
- Why African populations have more PC axes needed to capture structure

---

## Prompt 64 [P2] — Antimicrobial Resistance (AMR) Profiler

**Build:** `js/amr.js`, route `#/amr`

**Resistance gene database** (pre-built from CARD/ResFinder public databases):
- 500 resistance determinants: beta-lactamases, aminoglycoside enzymes, efflux pumps,
  target modifications
- Organised by drug class: beta-lactams, fluoroquinolones, aminoglycosides,
  tetracyclines, carbapenems, colistin (MCR genes)
- Africa-priority pathogens: Klebsiella pneumoniae, E. coli, Salmonella typhi,
  Neisseria gonorrhoeae, Staphylococcus aureus

**Input:** Paste DNA sequence or protein sequence

**Analysis:**
1. **Deterministic matching:** Exact k-mer match against resistance gene sequences
2. **Similarity scoring:** Smith-Waterman alignment against closest reference
3. **Output:** Resistance profile table: gene name → drug class → predicted phenotype (R/I/S)
4. **MLST typing:** Detect sequence type using PubMLST scheme patterns

**AMR surveillance context:**
- Show Africa AMR surveillance data: WHO GLASS Africa data (where available)
- Map predicted resistance to WHO priority pathogen list
- "Upload to CARD" button — generates submission-ready data for CARD database

---

# PART 4 — COMMUNITY & COLLABORATION PLATFORM

## Prompt 65 [P0] — OmicsLab Research Network — Researcher Directory

**Why:** Africa has thousands of genomics researchers who don't know each other exist.
A researcher directory with skills, publications, and collaboration interests is foundational.

**Build:** `js/network.js`, `css/network.css`, route `#/network`

**Researcher profile** (built from Auth account + manual additions):
```json
{
  "id": "usr_abc",
  "name": "Dr. Amara Osei",
  "role": "researcher",
  "institution": "KEMRI",
  "country": "Kenya",
  "expertise": ["WGS", "malaria genomics", "population genetics"],
  "tools": ["GATK", "PLINK", "R"],
  "languages": ["English", "Swahili"],
  "lookingFor": ["collaboration", "funding", "mentorship"],
  "openSource": ["github.com/amara-osei"],
  "publications": 8
}
```

**Directory features:**
- Filter by: country, expertise, tool skills, institution type, career stage
- Search by expertise keywords
- "Collaborate" button → opens Nexus DM thread (one-to-one channel)
- "Invite to Teams room" → sends meeting link via Nexus
- Privacy: users control what's visible; minimum is name + country

**Skill endorsement:** Other researchers can endorse your skills (like LinkedIn).
Endorsements appear as numbered badges next to skill tags.

**Research matching:** "Find collaborators for my project" — user describes their project
in text → OmicsLab ranks researchers by relevance (keyword overlap on expertise + location).

---

## Prompt 66 [P1] — Live Journal Club — Structured Paper Discussion

**Why:** Journal clubs are the mechanism by which research becomes understood in a lab.
Online journal clubs for African researchers don't currently have a dedicated platform.

**Build:** Extend `js/journalclub.js` — transform it from quiz-only to full live discussion

**Scheduled sessions:**
- Create a journal club event: paper DOI, date/time, discussion leader, pre-reading questions
- Calendar integration (Prompt 15) — shows up in Teams upcoming strip
- Reminder notifications 24h and 1h before session

**Live session view (linked to Teams meeting):**
- Left: embedded paper PDF viewer (if open access) or abstract
- Right: structured discussion with pre-populated questions:
  1. What is the main finding?
  2. What is the study's strongest evidence?
  3. What are the limitations?
  4. How relevant is this to African populations?
  5. What would you do differently?
- Each question has a threaded comment section (like Nexus threads)
- Moderator can "spotlight" a comment — shown prominently to all

**Voting:** After discussion — anonymous vote: "Would you change your clinical/research practice based on this paper?" Yes / No / Uncertain.

**Archive:** All past journal club sessions searchable. Export discussion as PDF for CPD portfolios.

---

## Prompt 67 [P1] — Peer Mentorship Network

**Why:** The biggest gap in African genomics training is access to experienced mentors.
OmicsLab can systematically connect junior researchers with senior ones across the continent.

**Build:** `js/mentorship.js`, route `#/mentorship`

**Mentor profiles:**
- Senior researchers opt in as mentors, specifying: areas they mentor (bioinformatics tools,
  grant writing, career advice, wet lab), time availability (hours/month), preferred communication.

**Mentee matching algorithm:**
1. Mentee fills interest form: career stage, goals, tools learning, challenges
2. OmicsLab scores all available mentors on keyword overlap
3. Shows top 5 matches with compatibility explanation
4. Mentee sends connection request → mentor accepts or declines

**Structured mentorship sessions:**
- Monthly 1:1 meeting booked through Teams scheduler
- Pre-session: auto-fill agenda template (what have you worked on, what's blocked, what help is needed)
- Post-session: both parties log notes → stored in mentorship journal
- Milestone tracking: mentee sets 3-month goals → progress checked at each session

**Mentor recognition:** Verified mentors get "OmicsLab Mentor" badge + listed in annual Impact Report.

---

## Prompt 68 [P2] — Africa Bioinformatics Hackathon Platform

**Build:** `js/hackathon.js`, route `#/hackathon`

**Hackathon management:**
- Create hackathon event: name, challenge description, dataset, judging criteria, duration
- Team formation: browse participants, form teams of 2-5
- Submission portal: team submits GitHub repo URL + brief description + results

**Built-in dataset hosting** (using browser cache + IndexedDB for large files):
- Pre-loaded challenge datasets (VCF files, expression matrices, FASTQ samples)
- Challenge descriptions linked to real African health problems

**Judging panel:**
- Judges submit scores (1-5) on: correctness, reproducibility, innovation, Africa relevance
- Automated scoring: does the submitted GitHub repo have a README, Snakemake/Nextflow workflow, Docker environment?

**Live leaderboard:** Real-time team rankings. BroadcastChannel updates across all connected tabs.

**Past challenges archive:**
- SARS-CoV-2 African lineage classification (H3Africa challenge 2021)
- Malaria drug resistance prediction challenge
- TB whole-genome sequencing pipeline optimisation

---

# PART 5 — AFRICA-FIRST PLATFORM

## Prompt 69 [P0] — Offline-First Data Package System

**Why:** Many African research settings have unreliable internet. OmicsLab must work completely
offline for core workflows. The current SW caching is passive. This prompt makes it active.

**Build:** `js/data-packages.js`, route `#/offline-data`

**Data packages** (curated, downloadable, cached in IndexedDB):

| Package | Contents | Size |
|---|---|---|
| WGS Starter | hg38 small reference, GATK example VCF, tool guides | 28 MB |
| Malaria Genomics | Pf3D7 reference, kelch13 variants, resistance DB | 12 MB |
| TB Genomics | Mtb H37Rv reference, rpoB variants, MTBC phylogeny | 8 MB |
| SCD Africa | HBB/HBA variants, African SCD prevalence data | 4 MB |
| RNA-seq Demo | Expression matrix, DESeq2 example output, pathway data | 6 MB |
| AMR Africa | CARD Africa resistance genes, hospital surveillance data | 10 MB |

**Install flow:**
1. User opens `#/offline-data` → sees available packages with descriptions
2. Clicks "Download" → fetch + store in IndexedDB using `IDBObjectStore`
3. Progress bar (using ReadableStream + Response.body for download progress)
4. Installed packages: green checkmark, storage used

**Tool integration:** When a tool needs reference data (e.g. Variant Interpreter needs ClinVar),
it checks IndexedDB first (offline package), then falls back to API (if online).

---

## Prompt 70 [P1] — H3Africa Data Portal Integration

**Why:** H3Africa is the largest African genomics initiative. Their data is the most relevant for
OmicsLab's users. Building a discovery layer for H3Africa studies makes OmicsLab essential for
every African genomics researcher.

**H3Africa resources to surface:**
- H3Africa consortium study list (publicly available on their website)
- AWI-Gen phenotype data dictionary (public)
- H3Africa Biobank network locations
- H3Africa Variant Database (where public data is available)

**Build:** Dedicated panel in `#/data` section

**Curated H3Africa study browser:**
- 54 H3Africa-funded studies across 30 African countries
- Filters: disease area, data type, country, access type (open/controlled)
- Each study card: PI names, institution, countries, disease, data types, access link
- "Request access" button → links to H3Africa Data and Biospecimen Access Committee (DABAC)
- "Find related papers" → auto-queries PubMed for study name + NCT/H3Africa ID

**Community annotation:** Researchers who have used a dataset can leave notes (methodology,
quirks, quality observations) — like GitHub issues for datasets.

---

## Prompt 71 [P1] — Africa Pathogen Genomics Initiative (Africa PGI) Tracker

**Why:** Africa CDC, WHO AFRO, and the Africa PGI are building continental pathogen surveillance.
OmicsLab should be the dashboard that makes this data accessible to researchers.

**Build:** Extend `js/alerts.js` with pathogen genomics surveillance layer

**Data sources:**
- Africa CDC disease bulletin (weekly PDF — parse key numbers)
- GISAID Africa sequences (SARS-CoV-2, Influenza — summary stats available publicly)
- NextStrain phylogenetic builds for Africa (`nextstrain.org/ncov/africa` data)
- WHO GLASS AMR Africa data

**Dashboard widgets on Home page:**
- "Africa Pathogen Surveillance" panel:
  - Active SARS-CoV-2 variant of concern in Africa (from GISAID)
  - Influenza season status (H3N2/H1N1/B prevalence)
  - New mpox sequences from Africa (GISAID)
  - Top 5 countries with active outbreak (WHO DON last 30 days)

---

## Prompt 72 [P2] — Swahili, Hausa, Yoruba, Amharic Science Glossaries

**Why:** African students often understand concepts in their native language first.
A multilingual bioinformatics glossary in African languages does not exist anywhere.

**Build:** Extension of `js/i18n.js` + new `js/glossary.js`, route `#/glossary`

**750+ term glossary** in English + 6 African languages:

| English | Swahili | Hausa | Yoruba | Amharic |
|---|---|---|---|---|
| genome | jenomu | asalin-gado | agbayanu | ጂኖም |
| sequencing | upangaji wa jenomu | jerin-tsarin DNA | ṣíṣe tẹlẹ ti DNA | ቅደም ተከተላዊ ሥራ |
| variant | tofauti | bambance-bambance | iyipada | ልዩነት |
| pathogenic | inayosababisha ugonjwa | mai haddasa cuta | fa ìṣọn | በሽታ አምጪ |

**Glossary features:**
- Browse by category: Sequencing · Variants · Statistics · Tools · Diseases · Ethics
- Search in any language → find the term + all translations
- Audio pronunciation (for terms where audio is available from African language resources)
- "Add to my flashcards" → creates spaced-repetition study deck
- Community contribution: users can suggest translations (moderated)

---

# PART 6 — RESEARCH WORKFLOW MANAGEMENT

## Prompt 73 [P0] — Lab Notebook — Digital Research Journal

**Why:** Most African researchers still use paper notebooks or disconnected Word documents.
A digital lab notebook integrated with OmicsLab tools creates a complete audit trail.

**Build:** `js/notebook.js`, `css/notebook.css`, route `#/notebook`

**Entry types:**
- `experiment` — what you did, samples used, conditions, results
- `analysis` — bioinformatics analysis step (linked to OmicsLab tool output)
- `observation` — qualitative note, image, sketched diagram
- `meeting_note` — from Teams meeting (auto-import from meeting chat)
- `literature_note` — notes on a paper (linked to PaperHub entry)

**Auto-capture from tools:**
When a user runs analysis in any OmicsLab tool, offer "Save to Notebook":
```javascript
// After variant interpretation:
OmicsLab.Notebook.quickEntry({
  type: 'analysis',
  title: 'Variant interpretation: HBB c.20A>T',
  content: JSON.stringify(variantResult),
  linkedTool: 'variantinterp',
  date: new Date().toISOString(),
});
```

**Good Laboratory Practice (GLP) compliance:**
- Every entry timestamped and immutable (append-only, no edit — only add correction notes)
- Export as PDF with date stamps (for regulatory submissions)
- Version history shows all entries with dates

**Search:** Full-text search across all notebook entries + tags.

---

## Prompt 74 [P1] — Snakemake / Nextflow Workflow Generator

**Why:** Every African bioinformatics lab eventually needs to run pipelines on HPC clusters or
cloud. Snakemake and Nextflow are the two dominant workflow managers. OmicsLab should generate
these pipelines from a visual designer.

**Build:** `js/workflow-builder.js`, route `#/workflows`

**Visual pipeline designer:**
- Drag-and-drop blocks: FastQC → Trimmomatic → BWA → Samtools → GATK → VEP → SnpEff
- Each block: configure parameters via form (reference genome, threads, memory)
- Connect blocks with arrows → defines execution order + input/output
- Validate: check for missing required inputs, incompatible output→input types

**Code generation:**
```python
# Auto-generated Snakemake workflow
rule fastqc:
    input:  "data/raw/{sample}.fastq.gz"
    output: "qc/{sample}_fastqc.html"
    params: outdir="qc/"
    shell:  "fastqc {input} --outdir {params.outdir}"

rule trim:
    input:  "data/raw/{sample}.fastq.gz"
    output: "data/trimmed/{sample}.fastq.gz"
    params: adapter="AGATCGGAAGAGC"
    shell:  "trimmomatic SE {input} {output} ILLUMINACLIP:{params.adapter}:2:30:10"
# ... continues for all blocks
```

**Pre-built templates:**
- GATK Best Practices germline WGS pipeline
- RNA-seq DESeq2 pipeline
- Metagenomics Kraken2 → Bracken pipeline
- Nanopore basecalling + assembly pipeline (Guppy → Medaka → Prokka)
- Phylogenomics pipeline (MAFFT → IQ-TREE → FigTree)

**Export:** Download as `.smk` (Snakemake) or `main.nf` + `nextflow.config` + `environment.yml`.

---

## Prompt 75 [P2] — Multi-Study Meta-Analysis Tool

**Build:** `js/meta-analysis.js`, route `#/meta`

**Input:** User uploads 2-10 summary statistics files from GWAS or differential expression studies

**Analysis types:**
1. **Fixed-effects meta-analysis** (inverse-variance weighted)
2. **Random-effects meta-analysis** (DerSimonian-Laird)
3. **Forest plot** — one row per study, diamond for pooled estimate
4. **Funnel plot** — detect publication bias (Egger's test, Begg's test)
5. **Heterogeneity statistics** — I², Cochran's Q, τ²
6. **Leave-one-out sensitivity analysis** — animated: removes each study one by one

**Africa-specific use case:** Combine GWAS summary statistics from multiple African cohorts
(AWI-Gen, H3Africa sites, APCDR) to improve statistical power for African-specific signals.

---

# PART 7 — PLATFORM ARCHITECTURE FOR GLOBAL SCALE

## Prompt 76 [P0] — Progressive Data Architecture — IndexedDB for Large Files

**Why:** localStorage is limited to ~5MB and synchronous. IndexedDB supports gigabytes of
binary data asynchronously. OmicsLab needs this for: large VCF files, downloaded reference
data, saved analysis results.

**Build:** `js/db.js` — unified database layer

```javascript
OmicsLab.DB = {
  async open(),
  async get(store, key),
  async put(store, key, value),
  async delete(store, key),
  async getAll(store),
  async clear(store),
  async quota(),  // Returns { usage, quota, percent }
};
```

**Object stores:**
- `analyses` — saved tool results (VCF interpretations, heatmap data, QC reports)
- `papers` — PaperHub library items (including downloaded PDFs as ArrayBuffer)
- `packages` — offline data packages (reference data, variant databases)
- `notebook` — lab notebook entries
- `nexus` — Nexus channel messages (sync target)
- `settings` — user preferences, API keys

**Quota management panel** (in Settings → Storage):
```
Storage used: 234 MB / 2.0 GB available
  Analyses:    12 MB  ████░░░░░░
  Papers:      45 MB  ████████░░
  Packages:   177 MB  ████████████████████
  Notebook:    0.2 MB ░░░░░░░░░░
```
"Clear Analyses" button. "Clear Packages" button. Never auto-clear user data.

---

## Prompt 77 [P1] — OmicsLab API — Public REST API for Developers

**Why:** Making OmicsLab's analysis engines accessible via API turns it from a platform into
an infrastructure layer. Other African tools can build on OmicsLab's variant interpretation,
QC prediction, and primer design without reimplementing them.

**Build:** Backend routes at `/api/v1/`

**Public endpoints** (rate-limited, key required):

```
POST /api/v1/variant/interpret
Body: { hgvs, gene, population: "AFR" }
→ { classification, criteria, gnomad_af_afr, ensembl_consequence }

POST /api/v1/qc/predict
Body: { ratio260_280, ratio260_230, rin, readDepth, mappingRate, dupRate, meanQ }
→ { verdict, probability, metric_scores, advice }

POST /api/v1/primers/design
Body: { sequence, product_min, product_max, tm_target }
→ { pairs: [{ fwd, rev, product_size, tm_fwd, tm_rev, gc_fwd, gc_rev }] }

POST /api/v1/article/analyse
Body: { text }
→ { study_types, tools, africa_relevance, findings, reproducibility, opportunities }
```

**Developer portal** at `#/developers`:
- API key generation (linked to OmicsLab account)
- Interactive API tester (like Swagger UI)
- Usage dashboard: requests per day, rate limit status
- Code examples: Python, R, JavaScript, curl

---

## Prompt 78 [P2] — Global CDN + Multi-Region Deployment

**Why:** OmicsLab must load fast from Nairobi, Lagos, Cape Town, Accra, and Addis Ababa.
GitHub Pages serves from US/EU only. A CDN with African PoPs makes a measurable difference.

**Deploy strategy:**
1. **Cloudflare Pages** (free tier) — automatic CDN with 300+ PoPs including:
   - Johannesburg (South Africa)
   - Nairobi (Kenya)
   - Lagos (Nigeria)
   - Cairo (Egypt)
   - Mombasa, Kampala, Accra, Dar es Salaam via regional PoPs

2. **Migrate from GitHub Pages:**
   - Add `CNAME` to `omicslab.africa` domain
   - Configure Cloudflare Pages build: just static HTML/CSS/JS, no build step
   - Automatic HTTPS via Cloudflare's Let's Encrypt integration

3. **Cloudflare Workers** for backend API:
   - Free tier: 100,000 requests/day, 10ms CPU time
   - Deploy auth and analytics endpoints as Workers
   - Edge computing: request from Nairobi handled in Nairobi, not London

4. **R2 Object Storage** for avatar images + downloadable packages:
   - Zero egress fees (unlike S3)
   - Automatic CDN distribution

**Performance target:** First Contentful Paint < 1.2s from Nairobi on 4G.

---

## Prompt 79 [P3] — OmicsLab Mobile App (React Native / Capacitor)

**Why:** 70% of internet access in Africa is mobile-first. A native app with proper offline
support, background sync, and push notifications is the end-state for mobile access.

**Build approach:** Use Capacitor (Ionic) to wrap the existing PWA with minimal changes:
- The entire OmicsLab codebase (HTML/CSS/JS) runs inside Capacitor's WebView
- Native features added via Capacitor plugins:
  - `@capacitor/push-notifications` — outbreak alerts, badge earned, @mention
  - `@capacitor/filesystem` — download BAM/VCF to device storage
  - `@capacitor/share` — share analysis results natively
  - `@capacitor/camera` — photograph lab results for notebook
  - `@capacitor/haptics` — vibration feedback for quiz correct/incorrect

**Platforms:** Android first (dominant in Africa), iOS second

**Distribution:**
- Google Play Store (Android, global)
- APK direct download (for devices without Play Store — common in some African markets)
- TestFlight (iOS beta)
- F-Droid (open-source Android store — for privacy-conscious users)

---

# PART 8 — LEGACY FEATURES (Defining the Platform's Lasting Impact)

## Prompt 80 [P0] — OmicsLab Certification Program

**Why:** Certificates from OmicsLab should carry real professional weight.
If universities and employers recognise OmicsLab certificates, the platform becomes infrastructure.

**Build:** `js/certification.js`, route `#/certification`

**Certificate tracks:**

| Track | Modules required | Level | Target |
|---|---|---|---|
| Bioinformatics Foundations | WGS basics, QC, Variant calling | Foundation | Wet-lab scientists transitioning |
| Clinical Genomics | Variant Interpreter, ACMG, Clinical reporting | Intermediate | Clinical lab technologists |
| Population Genomics | GWAS, popstruct, Africa datasets | Advanced | MSc students |
| Pathogen Surveillance | Metagenomics, AMR, Phylogenetics | Intermediate | Public health officers |
| Research Methods | Statistics, study design, grant writing | Applied | PhD students |

**Assessment:**
- Each track: 3 knowledge quizzes (≥80% to pass) + 1 practical assignment
  (run a tool, interpret the output, explain in writing)
- Practical reviewed by AI assistant + optionally by an OmicsLab mentor (Prompt 67)

**Certificate NFT (optional):**
- Optional on-chain certificate using Celo blockchain (solar-powered, built by Africans)
- The certificate hash is stored on-chain → verifiable by any employer
- Not required — traditional PDF certificate available for all

**Employer partnerships:**
- Partner with African Genomics companies and hospitals to recognise the certificates
- NIMR Nigeria, KEMRI Kenya, NICD South Africa, MRC Gambia
- List on the certificate: "Recognised by [partner institutions]"

---

## Prompt 81 [P1] — OmicsLab Impact Observatory

**Why:** OmicsLab needs to track its real-world impact to attract funding and demonstrate
value to funders (Wellcome, NIH Fogarty, Bill & Melinda Gates Foundation).

**Build:** `js/impact.js`, route `#/impact` (public-facing)

**Live impact metrics** (from backend analytics):
```
┌─────────────────────────────────────────────────────────┐
│ OmicsLab Global Impact Dashboard                        │
│                                                         │
│  47,234  researchers trained   across 54 African nations│
│   3,891  analyses run today                             │
│      89  papers citing OmicsLab tools                   │
│      12  PhD theses using OmicsLab                      │
│       4  outbreak responses supported (2024)            │
│                                                         │
│  [Map of Africa with researcher density by country]     │
│  [Growth chart: monthly active users 2023-2025]         │
│  [Tool usage: top 10 most-used tools this week]         │
└─────────────────────────────────────────────────────────┘
```

**Researcher stories:** Curated testimonials with photos (opt-in):
- "Using OmicsLab's ACMG classifier, I correctly reclassified 3 variants in my sickle cell cohort."
  — Dr. Chidimma Eze, UNTH Enugu, Nigeria
- "The Article Analyser helped me design my PhD protocol in one afternoon."
  — Seun Adewale, LUTH, Lagos

**Funder report generator:** One-click PDF report of OmicsLab's impact metrics
formatted for NIH Fogarty, Wellcome Trust, or Gates Foundation reporting requirements.

---

## Prompt 82 [P3] — Open Source Foundation & Community Governance

**Why:** For OmicsLab to become a legacy institution, it cannot be owned by one person.
It must become a community-governed open-source foundation.

**Steps:**
1. Publish all code under MIT License (add `LICENSE` file)
2. Create `CONTRIBUTING.md` — how to submit tool modules, translations, bug fixes
3. Create an OmicsLab Foundation governance document:
   - Technical Steering Committee (5 researchers from 5 African countries)
   - Scientific Advisory Board (pan-African + diaspora experts)
   - Community decisions made by vote in Nexus #governance channel
4. Apply for fiscal sponsorship: NumFOCUS (like NumPy, SciPy, pandas) or Open Collective Africa
5. Formal partnership with:
   - H3Africa Consortium (Africa's largest genomics network)
   - African Society for Bioinformatics and Computational Biology (ASBCB)
   - Pan-African Bioinformatics Network (H3ABioNet)
   - African Academy of Sciences
6. Annual OmicsLab Summit: 3-day virtual event hosted on Teams, combining:
   - Research talks (submitted abstracts)
   - Tool development sprints (Hackathon, Prompt 68)
   - Mentorship speed-rounds
   - Funding pitch competition for African startups using OmicsLab data

---

# Execution Roadmap

## Quarter 1 (Month 1-3) — Data & AI Foundation
**Build:** Prompts 41 (PubMed), 42 (Ensembl), 43 (gnomAD), 44 (AlphaFold), 54 (AI Assistant), 73 (Notebook), 76 (IndexedDB)
**Result:** OmicsLab becomes a connected research platform, not just local tools.

## Quarter 2 (Month 4-6) — Advanced Tools & Community
**Build:** Prompts 45 (UniProt), 46 (Open Targets), 47 (KEGG), 49 (bioRxiv), 50 (WHO API), 59 (IGV), 60 (Kraken2), 65 (Network), 69 (Offline Packages)
**Result:** No other African platform has this depth of tool + data integration.

## Quarter 3 (Month 7-9) — AI Intelligence & Education
**Build:** Prompts 55 (AI Variant), 56 (Thesis Coach), 57 (Grant Writer), 66 (Journal Club), 67 (Mentorship), 74 (Workflows), 77 (Public API), 80 (Certifications)
**Result:** OmicsLab is the most complete bioinformatics education + research platform on Earth.

## Quarter 4 (Month 10-12) — Scale & Legacy
**Build:** Prompts 70 (H3Africa Portal), 71 (Africa PGI), 72 (African Glossaries), 75 (Meta-analysis), 78 (CDN), 81 (Impact Observatory), 82 (Foundation)
**Result:** OmicsLab becomes an institution — recognised, funded, and governed by the African scientific community.

---

## The Vision in One Sentence

> OmicsLab is the platform where African researchers do all their genomics work —
> from literature discovery through data access, analysis, collaboration, education,
> and dissemination — without ever leaving a single, offline-capable, Africa-designed tool.

No platform on Earth currently does this.
Build it, and it becomes infrastructure.
