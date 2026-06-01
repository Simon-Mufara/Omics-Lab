/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Disease Learning Layer
   Builds a guided disease journey from the existing disease registry
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.DiseaseLearning = (function() {
  const CATEGORY_DEFAULTS = {
    Oncology: {
      presentation: 'Patients usually present with a new mass, pain, bleeding, weight loss, fatigue, or organ-specific dysfunction.',
      symptoms: 'Red flags often include a palpable lump, unexplained weight loss, anemia, bleeding, and signs of metastatic spread.',
      familyHistory: 'Ask about first-degree relatives with cancer, early onset disease, multiple primaries, and known germline predisposition syndromes.',
      epidemiology: 'Cancer burden varies by subtype, ancestry, screening access, and treatment availability. African cohorts are often underrepresented in precision oncology datasets.',
      sampleType: 'Use tumour tissue where possible, ideally with matched normal blood or saliva.',
      sequencingStrategy: 'Choose WGS for structural variation and signatures, WES for coding drivers, RNA-seq for expression/fusions, and scRNA-seq for heterogeneity.',
      labWorkflow: 'Follow the matching OmicsLab wet-lab workflow, preserve tumour purity, and keep matched normal material for somatic interpretation.',
      bioinformaticsWorkflow: 'After QC and alignment, call variants, fusions, copy-number change, or expression signatures using the disease-linked tools in the record.',
      interpretation: 'Interpret the result using driver status, actionable alterations, pathway context, clonality, and treatment relevance.'
    },
    'Infectious Disease': {
      presentation: 'Patients often present acutely with fever, malaise, organ-specific symptoms, and exposure history.',
      symptoms: 'Common symptoms include fever, chills, cough, diarrhea, rash, bleeding, headache, or respiratory compromise depending on the pathogen.',
      familyHistory: 'Family history is usually less informative than contact tracing, household exposure, travel history, vaccination status, and host susceptibility.',
      epidemiology: 'Transmission patterns, outbreaks, seasonality, and geography are central. African burden is strongly shaped by surveillance gaps and access to diagnostics.',
      sampleType: 'Choose the pathogen-appropriate specimen: blood, swab, sputum, stool, urine, CSF, or tissue.',
      sequencingStrategy: 'Use viral WGS, bacterial WGS, shotgun metagenomics, or host transcriptomics depending on whether you need species ID, resistance, phylogeny, or host response.',
      labWorkflow: 'Prioritise specimen handling, nucleic-acid extraction, contamination control, and multiplexing decisions that preserve outbreak signal.',
      bioinformaticsWorkflow: 'The main analytical questions are species confirmation, phylogeny, AMR, lineage, and transmission.',
      interpretation: 'Interpret results as evidence of transmission, resistance, host response, or outbreak relatedness rather than a single isolated laboratory answer.'
    },
    Haematology: {
      presentation: 'Presentation often includes anemia, pain crises, bleeding, fatigue, infection, or abnormal blood counts.',
      symptoms: 'Look for pallor, bone pain, recurrent infections, bruising, jaundice, or microvascular complications depending on the disorder.',
      familyHistory: 'Family history is important for inherited hematologic disease, ancestry-linked risk, and syndromic clustering.',
      epidemiology: 'Burden is shaped by ancestry, carrier frequency, access to screening, and early diagnosis. African populations carry particularly high inherited hematologic disease burden.',
      sampleType: 'Peripheral blood is the core specimen, often with matched parental or remission samples when inherited or somatic distinction is needed.',
      sequencingStrategy: 'Use WGS or WES for inherited risk and modifying loci, with RNA-seq or single-cell methods when gene expression or cell state matters.',
      labWorkflow: 'Preserve DNA and RNA quality and use matched samples when the biology requires somatic-versus-germline discrimination.',
      bioinformaticsWorkflow: 'Interpret variants in the context of hemoglobin biology, stem-cell state, mutational burden, or gene regulation.',
      interpretation: 'Connect genotype to hematologic phenotype, transfusion need, and disease severity rather than just naming a variant.'
    },
    Neurological: {
      presentation: 'Patients usually present with cognitive, behavioral, motor, or seizure-related changes.',
      symptoms: 'Common symptoms include memory loss, confusion, seizures, weakness, gait disturbance, sensory changes, or speech problems.',
      familyHistory: 'Ask about inherited neurologic disorders, dementia, epilepsy, autoimmune neurologic disease, and early age of onset in relatives.',
      epidemiology: 'Population aging, infection, vascular risk, and ancestry-linked risk alleles all shape disease burden and diagnostic yield.',
      sampleType: 'Blood, CSF, post-mortem tissue, or model systems such as iPSC-derived cells may be needed.',
      sequencingStrategy: 'Use WGS/WES for inherited risk and rare disease, RNA-seq for expression, and proteomics or metabolomics when biomarkers are closer to phenotype than DNA.',
      labWorkflow: 'Minimise degradation, track specimen source carefully, and preserve matched clinical metadata.',
      bioinformaticsWorkflow: 'Prioritise rare variants, expression outliers, proteomic biomarkers, and known disease genes, then integrate them with phenotype terms.',
      interpretation: 'Distinguish inherited risk from age-related disease and avoid overcalling variants with incomplete penetrance.'
    },
    Autoimmune: {
      presentation: 'Patients often present with relapsing inflammatory symptoms, chronic pain, diarrhea, rash, fatigue, or organ-specific dysfunction.',
      symptoms: 'Look for pain, stiffness, diarrhea, abdominal cramping, extra-intestinal manifestations, and inflammatory flares.',
      familyHistory: 'Family clustering of autoimmunity is common, so ask about relatives with IBD, psoriasis, rheumatoid arthritis, lupus, or celiac disease.',
      epidemiology: 'Environmental triggers, microbiome disruption, and urbanisation influence disease onset and flare frequency.',
      sampleType: 'Use blood, stool, tissue biopsy, or other affected tissue so the assay matches the inflamed compartment.',
      sequencingStrategy: 'Pair host genomics with transcriptomics, microbiome sequencing, and epigenomic assays to capture predisposition and active inflammation.',
      labWorkflow: 'Protect nucleic acid integrity from inflamed tissue and avoid delayed processing when microbiome or RNA signal is important.',
      bioinformaticsWorkflow: 'Use differential expression, microbial profiling, and pathway analysis to connect inflammation to tissue and immune state.',
      interpretation: 'Separate susceptibility, active inflammation, microbial dysbiosis, and treatment response.'
    },
    Metabolic: {
      presentation: 'Patients may present with polyuria, polydipsia, weight change, fatigue, or the disease may be found during screening for glucose or lipid abnormalities.',
      symptoms: 'Clues include thirst, nocturia, slow wound healing, neuropathic symptoms, or metabolic syndrome features.',
      familyHistory: 'Premature diabetes, obesity, cardiometabolic disease, and ancestry-specific risk should be documented.',
      epidemiology: 'Metabolic disease burden is rising with urbanisation, diet change, and reduced physical activity, with strong variation across African populations.',
      sampleType: 'Use blood, plasma, urine, stool, and when needed adipose or tissue samples for functional readouts.',
      sequencingStrategy: 'Choose WGS/WES for inherited risk, RNA-seq for pathway activity, metagenomics for microbiome context, and LC-MS/proteomics for metabolic state.',
      labWorkflow: 'Preserve fasting state metadata, collection time, and pre-analytical handling because metabolite readouts are highly sensitive to sample handling.',
      bioinformaticsWorkflow: 'Combine statistical genetics with metabolomics and microbial analysis to connect genotype, environment, and phenotype.',
      interpretation: 'Focus on risk architecture, insulin resistance, beta-cell function, and actionable lifestyle or pharmacogenomic implications.'
    },
    'Rare Disease': {
      presentation: 'Presentation is often early onset, multisystem, syndromic, or unexplained after standard testing.',
      symptoms: 'Symptoms include developmental delay, dysmorphism, growth failure, seizures, organ malformations, and unexplained regression.',
      familyHistory: 'Family history must include consanguinity, recurrent miscarriages, similar childhood deaths, and affected siblings or cousins.',
      epidemiology: 'Rare disease is underdiagnosed everywhere and especially under-recognized in Africa because reference databases and local testing access are limited.',
      sampleType: 'Use trio blood or saliva when possible, with RNA or fibroblasts added if splicing or functional rescue is suspected.',
      sequencingStrategy: 'Trio WES or trio WGS is preferred, with RNA-seq as a rescue layer for unsolved cases and CNV/SV analysis when needed.',
      labWorkflow: 'Build around phenotype-driven prioritisation and careful sample tracking for parent-child comparisons.',
      bioinformaticsWorkflow: 'Use inheritance-aware variant filtering, phenotype matching, splicing prediction, and expression outlier analysis.',
      interpretation: 'Lead to a candidate gene, inheritance model, and next-step validation strategy, not just a variant list.'
    },
    Epigenomics: {
      presentation: 'Presentation usually reflects altered gene regulation rather than a single coding change.',
      symptoms: 'Symptoms reflect the underlying biology, commonly involving dysregulated proliferation, differentiation, or tissue-specific dysfunction.',
      familyHistory: 'Family history is usually indirect and often points to predisposition syndromes or inherited regulatory variation rather than a single Mendelian lesion.',
      epidemiology: 'Epigenetic dysregulation is common across cancers and inflammatory disease, but reference maps are still incomplete for African populations.',
      sampleType: 'Fresh tissue or well-preserved nuclei are ideal because chromatin quality is critical.',
      sequencingStrategy: 'Use ATAC-seq, ChIP-seq, or multiome-style assays when regulatory control, enhancer use, or chromatin accessibility is the main question.',
      labWorkflow: 'Preserve nuclei quality, antibody specificity, and fragmentation control, because these determine peak quality.',
      bioinformaticsWorkflow: 'Follow peak calling, motif analysis, differential accessibility, and integrative interpretation with expression data.',
      interpretation: 'Connect accessibility, histone marks, methylation state, and transcriptional output to regulatory control.'
    },
    'Enteric Disease': {
      presentation: 'Patients usually present with acute diarrhea, dehydration, abdominal pain, vomiting, or outbreak-linked gastrointestinal illness.',
      symptoms: 'Look for stool frequency, dehydration, fever, blood or mucus in stool, and household or community clustering.',
      familyHistory: 'Family history is less important than food, water, sanitation, travel, and exposure to sick contacts.',
      epidemiology: 'Enteric disease burden is driven by sanitation, climate, crowding, and microbiome context.',
      sampleType: 'Stool, rectal swab, or environmental sample is usually the right starting point.',
      sequencingStrategy: 'Use WGS for isolates or metagenomics for direct stool profiling when you need pathogen identification and resistance information.',
      labWorkflow: 'Prioritise rapid processing, stool-safe extraction, and contamination-aware multiplexing because enteric samples are complex.',
      bioinformaticsWorkflow: 'Use classification, resistance detection, and comparative genomics to determine whether this is infection, colonisation, or outbreak transmission.',
      interpretation: 'Connect the organism, toxin or virulence profile, outbreak context, and treatment implications.'
    },
    Arbovirology: {
      presentation: 'Patients typically present with febrile illness after mosquito exposure, sometimes with rash, arthralgia, hemorrhage, or neurologic complications.',
      symptoms: 'Fever, headache, myalgia, rash, arthralgia, bleeding, and travel or vector exposure are key features.',
      familyHistory: 'Family history is less relevant than vector ecology, household clustering, immunity, and prior flavivirus exposure.',
      epidemiology: 'Seasonality, rainfall, vector habitat, and urbanisation strongly influence incidence.',
      sampleType: 'Use acute-phase serum, blood, urine, or tissue depending on the virus and time since symptom onset.',
      sequencingStrategy: 'Use viral WGS or targeted amplicon sequencing for lineage tracing and surveillance, or host RNA-seq when severity biology matters.',
      labWorkflow: 'Handle samples quickly, protect RNA, and keep a clear chain of custody for outbreak surveillance.',
      bioinformaticsWorkflow: 'Interpret serotype, lineage, phylogeny, and immune escape rather than only calling a consensus genome.',
      interpretation: 'Answer whether the virus is locally circulating, newly introduced, or changing in ways that affect control measures.'
    },
    'Viral Hepatitis': {
      presentation: 'Patients can present with jaundice, fatigue, elevated transaminases, chronic liver disease, or incidental viral detection.',
      symptoms: 'Right upper quadrant discomfort, jaundice, dark urine, pruritus, and signs of cirrhosis or hepatocellular carcinoma are important.',
      familyHistory: 'Family history may reflect household exposure, maternal transmission, or inherited predisposition to liver cancer.',
      epidemiology: 'Endemicity varies by region and transmission route. In many African settings, early-life transmission and co-exposures drive chronic disease.',
      sampleType: 'Serum/plasma is central, with liver tissue when cancer or integration biology must be studied.',
      sequencingStrategy: 'Use viral WGS for genotype and resistance, plus host WGS/WES or RNA-seq when liver cancer or host response is the question.',
      labWorkflow: 'Protect viral nucleic acid and, for tissue, preserve tumour or fibrosis context in the metadata.',
      bioinformaticsWorkflow: 'Use phylogeny, resistance calling, and cancer annotation to connect viral persistence to liver outcomes.',
      interpretation: 'Distinguish inactive carriage, chronic replication, resistance, and progression to cancer.'
    },
    'Encephalitis Viruses': {
      presentation: 'Patients often present with acute fever plus neurologic symptoms such as confusion, seizures, coma, or brainstem signs.',
      symptoms: 'Look for altered mental status, headache, neck stiffness, focal deficits, and exposure to animal reservoirs or bites.',
      familyHistory: 'Family history is usually secondary to exposure history, vaccination, and travel or animal-contact risk.',
      epidemiology: 'Incidence is shaped by reservoir ecology, vaccination, outbreak control, and access to rapid diagnostics.',
      sampleType: 'Use serum, CSF, blood, or tissue as appropriate to the pathogen and syndrome.',
      sequencingStrategy: 'Use viral WGS or targeted surveillance sequencing, often alongside host transcriptomics when permitted.',
      labWorkflow: 'Biosafety, sample chain-of-custody, and rapid extraction are critical because the clinical and public-health stakes are high.',
      bioinformaticsWorkflow: 'Focus on lineage, source, and outbreak linkage, with careful QC because low-titer samples are common.',
      interpretation: 'Connect viral genotype, exposure route, and neurologic severity to public-health response.'
    },
    'Respiratory Viruses': {
      presentation: 'Patients commonly present with upper or lower respiratory tract symptoms ranging from mild fever and cough to severe pneumonia.',
      symptoms: 'Cough, sore throat, dyspnea, wheeze, fever, and hypoxia are the main clues.',
      familyHistory: 'Family history is less predictive than exposure history, vaccination status, host comorbidity, and age.',
      epidemiology: 'Transmission is influenced by crowding, seasonality, mobility, and vaccination coverage.',
      sampleType: 'Nasopharyngeal swab, sputum, lower respiratory samples, or blood for host-response studies are the usual starting points.',
      sequencingStrategy: 'Use viral WGS for lineage and surveillance, and host RNA-seq or proteomics when severity biology is the target.',
      labWorkflow: 'Prioritise rapid RNA preservation, contamination control, and parallel metadata capture for outbreak analysis.',
      bioinformaticsWorkflow: 'Interpret consensus sequences, transmission clusters, and immune escape in the context of epidemiology.',
      interpretation: 'Explain whether the case is a local transmission event, a new variant introduction, or a severity-associated host response.'
    },
    'Hemorrhagic Fever': {
      presentation: 'Patients can present with febrile illness, bleeding, shock, liver injury, or rapidly progressive organ failure.',
      symptoms: 'Fever, malaise, bleeding, abdominal pain, vomiting, hypotension, and exposure to wildlife, livestock, or vectors are important.',
      familyHistory: 'Family history is usually less informative than exposure, but household clustering can occur through shared risk environments.',
      epidemiology: 'Outbreak risk is driven by zoonotic spillover, healthcare access, mobility, and surveillance gaps.',
      sampleType: 'Blood, serum, tissue, or swabs should be chosen according to biosafety rules and pathogen abundance.',
      sequencingStrategy: 'Use viral WGS or targeted surveillance sequencing, often alongside host transcriptomics where permitted.',
      labWorkflow: 'Biosafety, sample chain-of-custody, and rapid extraction are critical because the clinical and public-health stakes are high.',
      bioinformaticsWorkflow: 'Focus on lineage, source, and outbreak linkage, with careful QC because low-titer samples are common.',
      interpretation: 'Inform outbreak management, species identification, and geographic spread rather than only molecular classification.'
    },
    Oncoviruses: {
      presentation: 'Presentation can be silent for years and then appear as chronic infection, dysplasia, persistent lesions, lymphadenopathy, or cancer.',
      symptoms: 'Symptoms depend on the affected tissue but may include cervical lesions, jaundice, constitutional symptoms, or lymph node enlargement.',
      familyHistory: 'Ask about cancer history, immunosuppression, vaccination, and exposure-linked persistence in family or partners.',
      epidemiology: 'Burden is linked to viral persistence, vaccination coverage, sexual transmission, immunosuppression, and regional screening access.',
      sampleType: 'Use lesion tissue, swabs, blood, or plasma depending on the virus and the cancer biology being studied.',
      sequencingStrategy: 'Use viral WGS for genotype/integration biology and host WGS/WES/RNA-seq for tumour consequences.',
      labWorkflow: 'Preserve tissue architecture when integration or tumour heterogeneity matters.',
      bioinformaticsWorkflow: 'Interpret integration sites, oncogenic expression, host mutation, and tumour context together.',
      interpretation: 'Explain the viral contribution to persistence, dysplasia, or oncogenesis.'
    },
    'Exanthematous Viruses': {
      presentation: 'Presentation often starts with fever and then progresses to a characteristic rash, sometimes with lymphadenopathy or conjunctivitis.',
      symptoms: 'Typical symptoms include fever, cough or coryza, rash, conjunctivitis, and sometimes oral lesions or arthralgia.',
      familyHistory: 'Family history is usually secondary to vaccination history, household exposure, and outbreak contact tracing.',
      epidemiology: 'Outbreaks are strongly shaped by immunisation gaps, travel, and population susceptibility.',
      sampleType: 'Use swabs, serum, urine, or vesicle material depending on the virus and timing of illness.',
      sequencingStrategy: 'Use viral WGS for lineage and outbreak work, often paired with serology and clinical metadata.',
      labWorkflow: 'Specimen timing matters: early samples maximise RNA yield and improve phylogenetic resolution.',
      bioinformaticsWorkflow: 'Lineage analysis and outbreak tracing are the main goals, with special attention to vaccine strain versus wild-type distinctions.',
      interpretation: 'Identify whether the illness reflects endemic transmission, importation, or vaccine-preventable susceptibility.'
    },
    default: {
      presentation: 'Start from the patient story: what is the dominant clinical phenotype, how severe is it, and what organ system is most affected?',
      symptoms: 'Symptoms should be captured in the same language that clinicians use at the bedside, then mapped to the relevant molecular phenotype.',
      familyHistory: 'Ask whether the pattern suggests inherited risk, shared exposure, or both.',
      epidemiology: 'Burden and geography affect what data are available and what interpretation is appropriate, especially in African cohorts.',
      sampleType: 'Select the sample that best matches the biology you want to measure, not just the easiest sample to collect.',
      sequencingStrategy: 'Choose the sequencing strategy that best matches the biological question and the level of resolution required.',
      labWorkflow: 'Use the existing OmicsLab wet-lab workflow and keep the metadata needed for downstream interpretation.',
      bioinformaticsWorkflow: 'Use the existing OmicsLab computational tools to turn the sample into a result that can be interpreted biologically.',
      interpretation: 'Interpretation should link phenotype, molecular evidence, and clinical meaning, then point to the next action.'
    }
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getWorkflowIds(disease) {
    const direct = Array.isArray(disease.workflows) ? disease.workflows.slice() : [];
    if (direct.length) return direct;
    if (!OmicsLab.WorkflowDiseases) return [];
    const fallback = Object.entries(OmicsLab.WorkflowDiseases).find(([, ids]) => ids.includes(disease.id));
    return fallback ? [fallback[0]] : [];
  }

  function buildJourney(disease) {
    const defaults = CATEGORY_DEFAULTS[disease.category] || CATEGORY_DEFAULTS.default;
    const workflowIds = getWorkflowIds(disease);
    const primaryWorkflow = workflowIds.length && OmicsLab.Workflows ? OmicsLab.Workflows[workflowIds[0]] : null;
    const workflowNameList = workflowIds.map(id => OmicsLab.Workflows && OmicsLab.Workflows[id] ? OmicsLab.Workflows[id].name : id).join(', ');
    const tools = Array.isArray(disease.tools) ? disease.tools.slice(0, 6) : [];
    const repositories = Array.isArray(disease.databases) ? disease.databases.slice(0, 4) : [];

    return {
      id: disease.id,
      name: disease.name,
      category: disease.category,
      icon: disease.icon,
      color: disease.color,
      clinicalPresentation: defaults.presentation,
      symptoms: defaults.symptoms,
      familyHistory: defaults.familyHistory,
      epidemiology: `${defaults.epidemiology} ${disease.africanContext || ''}`.trim(),
      sampleType: (disease.sampleTypes && disease.sampleTypes[0]) || defaults.sampleType,
      sequencingStrategy: primaryWorkflow
        ? `${defaults.sequencingStrategy} Primary workflow: ${primaryWorkflow.name}.`
        : defaults.sequencingStrategy,
      laboratoryWorkflow: `${defaults.labWorkflow} Follow ${workflowNameList || 'the relevant OmicsLab workflow'} from sample handling through interpretation.`,
      bioinformaticsWorkflow: `${defaults.bioinformaticsWorkflow} ${workflowNameList ? `Main workflow(s): ${workflowNameList}.` : ''}`.trim(),
      interpretation: `${defaults.interpretation} ${disease.clinicalImpact || disease.findings || ''}`.trim(),
      workflowIds,
      primaryWorkflow,
      tools,
      repositories,
      africaContext: disease.africanContext || '',
    };
  }

  function tagList(items) {
    if (!items || !items.length) return '<div class="dl-empty">Not specified in the current disease record.</div>';
    return items.map(item => `<span class="dl-tag">${escapeHtml(item)}</span>`).join('');
  }

  function buildJourneyHtml(journey) {
    const wfButtons = journey.workflowIds.map(wfId => {
      const wf = OmicsLab.Workflows && OmicsLab.Workflows[wfId];
      return wf ? `<button class="dl-chip-btn" onclick="OmicsLab.App.startWorkflow('${wfId}')">${escapeHtml(wf.name)}</button>` : '';
    }).join('');

    return `
      <div class="dl-journey">
        <div class="dl-journey-header">
          <div>
            <div class="dl-kicker">Disease learning layer</div>
            <h3 class="dl-title">${escapeHtml(journey.name)}</h3>
            <p class="dl-subtitle">A guided path from bedside presentation to interpretation.</p>
          </div>
          <div class="dl-actions">${wfButtons}</div>
        </div>

        <div class="dl-step-grid">
          <section class="dl-step-card"><div class="dl-step-label">1. Clinical presentation</div><p>${escapeHtml(journey.clinicalPresentation)}</p></section>
          <section class="dl-step-card"><div class="dl-step-label">2. Symptoms</div><p>${escapeHtml(journey.symptoms)}</p></section>
          <section class="dl-step-card"><div class="dl-step-label">3. Family history</div><p>${escapeHtml(journey.familyHistory)}</p></section>
          <section class="dl-step-card"><div class="dl-step-label">4. Epidemiology</div><p>${escapeHtml(journey.epidemiology)}</p></section>
        </div>

        <div class="dl-path-grid">
          <section class="dl-path-card"><div class="dl-section-label">Sample type</div><p>${escapeHtml(journey.sampleType)}</p></section>
          <section class="dl-path-card"><div class="dl-section-label">Sequencing strategy</div><p>${escapeHtml(journey.sequencingStrategy)}</p></section>
          <section class="dl-path-card"><div class="dl-section-label">Laboratory workflow</div><p>${escapeHtml(journey.laboratoryWorkflow)}</p></section>
          <section class="dl-path-card"><div class="dl-section-label">Bioinformatics workflow</div><p>${escapeHtml(journey.bioinformaticsWorkflow)}</p></section>
        </div>

        <section class="dl-interpretation-card">
          <div class="dl-section-label">Interpretation</div>
          <p>${escapeHtml(journey.interpretation)}</p>
        </section>

        ${journey.africaContext ? `<section class="dl-africa-note"><div class="dl-section-label">African research context</div><p>${escapeHtml(journey.africaContext)}</p></section>` : ''}

        <div class="dl-resource-grid">
          <section class="dl-resource-card"><div class="dl-section-label">Linked tools</div><div class="dl-tag-row">${tagList(journey.tools)}</div></section>
          <section class="dl-resource-card"><div class="dl-section-label">Linked repositories</div><div class="dl-tag-row">${tagList(journey.repositories)}</div></section>
        </div>
      </div>`;
  }

  function renderJourney(did) {
    if (!OmicsLab.DISEASES || !OmicsLab.DISEASES[did]) return '';
    return buildJourneyHtml(buildJourney({ ...OmicsLab.DISEASES[did], id: did }));
  }

  function renderJourneySummary(did) {
    if (!OmicsLab.DISEASES || !OmicsLab.DISEASES[did]) return '';
    const journey = buildJourney({ ...OmicsLab.DISEASES[did], id: did });
    const wfId = journey.workflowIds[0];
    const wf = wfId && OmicsLab.Workflows ? OmicsLab.Workflows[wfId] : null;
    return `
      <div class="dl-summary-card">
        <div class="dl-summary-head">
          <div>
            <div class="dl-kicker">Disease learning layer</div>
            <div class="dl-summary-title">${escapeHtml(journey.name)}</div>
          </div>
          ${wfId ? `<button class="dl-chip-btn" onclick="OmicsLab.App.startWorkflow('${wfId}')">${escapeHtml(wf ? wf.name : 'Open workflow')}</button>` : ''}
        </div>
        <div class="dl-summary-body">
          <div><strong>Presentation:</strong> ${escapeHtml(journey.clinicalPresentation)}</div>
          <div><strong>Sample:</strong> ${escapeHtml(journey.sampleType)}</div>
          <div><strong>Sequencing:</strong> ${escapeHtml(journey.sequencingStrategy)}</div>
          <div><strong>Interpretation:</strong> ${escapeHtml(journey.interpretation.slice(0, 240))}${journey.interpretation.length > 240 ? '…' : ''}</div>
        </div>
      </div>`;
  }

  function renderContextSnippet(did) {
    if (!OmicsLab.DISEASES || !OmicsLab.DISEASES[did]) return '';
    const journey = buildJourney({ ...OmicsLab.DISEASES[did], id: did });
    return `
      <div class="dl-snippet">
        <div class="dl-snippet-head">
          <span class="dl-snippet-name">${escapeHtml(journey.name)}</span>
          ${journey.primaryWorkflow ? `<span class="dl-snippet-workflow">${escapeHtml(journey.primaryWorkflow.name)}</span>` : ''}
        </div>
        <div class="dl-snippet-text">${escapeHtml(journey.clinicalPresentation)}</div>
      </div>`;
  }

  function renderSelectorOptions() {
    if (!OmicsLab.DISEASES) return '';
    const grouped = Object.entries(OmicsLab.DISEASES).reduce((acc, [id, disease]) => {
      if (!acc[disease.category]) acc[disease.category] = [];
      acc[disease.category].push({ id, name: disease.name });
      return acc;
    }, {});
    return Object.entries(grouped).map(([category, items]) => `
      <optgroup label="${escapeHtml(category)}">
        ${items.sort((a, b) => a.name.localeCompare(b.name)).map(item => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('')}
      </optgroup>
    `).join('');
  }

  function init(defaultId) {
    if (!OmicsLab.DISEASES) return;
    const select = document.getElementById('disease-learning-select');
    const panel = document.getElementById('disease-learning-panel');
    const diseaseIds = Object.keys(OmicsLab.DISEASES);
    const startId = defaultId && OmicsLab.DISEASES[defaultId] ? defaultId : (diseaseIds.includes('breast-cancer') ? 'breast-cancer' : diseaseIds[0]);

    if (select) {
      select.innerHTML = renderSelectorOptions();
      select.value = startId;
      select.onchange = e => open(e.target.value);
    }
    if (panel) panel.innerHTML = renderJourney(startId);
  }

  function open(did) {
    if (!OmicsLab.DISEASES || !OmicsLab.DISEASES[did]) return;
    const select = document.getElementById('disease-learning-select');
    const panel = document.getElementById('disease-learning-panel');
    if (select) select.value = did;
    if (panel) panel.innerHTML = renderJourney(did);
    const section = document.getElementById('disease-learning-section');
    if (section && section.scrollIntoView) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return {
    buildJourney,
    init,
    open,
    renderJourney,
    renderJourneySummary,
    renderContextSnippet,
  };
})();
