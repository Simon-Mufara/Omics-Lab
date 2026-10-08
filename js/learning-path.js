/* ═════════════════════════════════════════════════════════════════
   OmicsLab — Enhanced Learning Path Visualiser
   ─ SVG horizontal roadmap on Profile page
   ─ 4 tracks × nodes: complete / in-progress / locked
   ─ Certificate download when track complete
   ─ Enhanced with detailed learning objectives, interactive elements,
     achievement system, and social learning features
   ═════════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.LearningPath = (function () {
  const PROGRESS_KEY = 'omicslab_learning_progress';
  const ACHIEVEMENTS_KEY = 'omicslab_learning_achievements';
  const STUDY_GROUPS_KEY = 'omicslab_study_groups';

  /* ─── Enhanced Track Definitions ─── */
  const TRACKS = [
    {
      id: 'wgs',
      label: 'WGS Foundations',
      color: '#00C4A0',
      description: 'Whole-genome sequencing from sample to variant calls',
      icon: 'dna',
      cert: 'WGS Fundamentals Certificate',
      // Enhanced metadata
      difficulty: 'Beginner to Intermediate',
      estimatedHours: '4 hours',
      prerequisites: ['Basic molecular biology knowledge'],
      learningObjectives: [
        'Understand DNA extraction principles and quality assessment',
        'Learn library preparation techniques for Illumina sequencing',
        'Interpret QC metrics and apply GATK/H3Africa standards',
        'Perform BWA-MEM2 alignment and analyze results',
        'Apply GATK HaplotypeCaller for variant calling',
        'Classify variants using ACMG/AMP guidelines',
        'Create comprehensive analysis reports'
      ],
      nodes: [
        {
          id: 'dna-extraction',
          label: 'DNA Extraction',
          page: 'lab',
          time: '30 min',
          desc: 'Buffer chemistry, yield and purity metrics',
          objectives: [
            'Understand different DNA extraction methods',
            'Learn to assess DNA quality and quantity',
            'Recognize common extraction inhibitors'
          ],
          resources: [
            { type: 'video', title: 'DNA Extraction Techniques', url: '#' },
            { type: 'article', title: 'QC Metrics for DNA Samples', url: '#' }
          ],
          quizQuestions: [
            {
              question: 'What is the typical A260/A280 ratio for pure DNA?',
              options: ['1.8', '2.0', '2.2', '2.5'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'library-prep',
          label: 'Library Prep',
          page: 'lab',
          time: '45 min',
          desc: 'End-repair, A-tailing, adapter ligation',
          objectives: [
            'Understand the purpose of DNA library preparation',
            'Learn end-repair, A-tailing, and adapter ligation steps',
            'Recognize different adapter types and their applications'
          ],
          resources: [
            { type: 'simulation', title: 'Interactive Library Prep Lab', url: 'lab' }
          ],
          quizQuestions: [
            {
              question: 'What enzyme is used for A-tailing in library preparation?',
              options: ['DNA polymerase I', 'Taq polymerase', 'Klenow fragment', 'Terminal transferase'],
              correctAnswer: 3
            }
          ]
        },
        {
          id: 'qc-metrics',
          label: 'QC Metrics',
          page: 'qualitypredictor',
          time: '20 min',
          desc: 'GATK thresholds, H3Africa standards',
          objectives: [
            'Understand key QC metrics in sequencing',
            'Learn to interpret GATK QC reports',
            'Apply H3Africa-specific QC standards'
          ],
          resources: [
            { type: 'tool', title: 'Quality Predictor Tool', url: 'qualitypredictor' }
          ],
          quizQuestions: [
            {
              question: 'What does %>Q30 represent in sequencing QC?',
              options: ['Percentage of reads >30 bases long', 'Percentage of bases with Q-score >30', 'Average read quality score', 'Number of reads passing filter'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'alignment',
          label: 'BWA Alignment',
          page: 'analysis',
          time: '30 min',
          desc: 'BWA-MEM2, samtools flagstat',
          objectives: [
            'Understand the BWA-MEM2 alignment algorithm',
            'Learn to generate and interpret SAM/BAM files',
            'Use samtools flagstat for alignment QC'
          ],
          resources: [
            { type: 'tool', title: 'Analysis Studio', url: 'analysis' }
          ],
          quizQuestions: [
            {
              question: 'What does a high percentage of unmapped reads indicate?',
              options: ['Poor DNA quality', 'Contamination', 'Incorrect reference genome', 'All of the above'],
              correctAnswer: 3
            }
          ]
        },
        {
          id: 'variant-calling',
          label: 'Variant Calling',
          page: 'variantinterp',
          time: '40 min',
          desc: 'GATK HaplotypeCaller, ACMG criteria',
          objectives: [
            'Understand the GATK HaplotypeCaller algorithm',
            'Learn to generate and interpret VCF files',
            'Apply ACMG/AMP guidelines for variant classification'
          ],
          resources: [
            { type: 'tool', title: 'Variant Interpreter', url: 'variantinterp' }
          ],
          quizQuestions: [
            {
              question: 'What does ACMG stand for in variant classification?',
              options: ['American College of Medical Genetics', 'Association for Clinical Microbiology', 'American Council for Medical Genomics', 'African Centre for Medical Genetics'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'wgs-report',
          label: 'Final Report',
          page: 'output-tracker',
          time: '15 min',
          desc: 'Archive your WGS analysis output',
          objectives: [
            'Learn to organize and document analysis workflows',
            'Understand FAIR data principles',
            'Create reproducible analysis reports'
          ],
          resources: [
            { type: 'tool', title: 'Output Tracker', url: 'output-tracker' }
          ],
          quizQuestions: [
            {
              question: 'What does FAIR stand for in data management?',
              options: ['Findable, Accessible, Interoperable, Reusable', 'Fast, Accurate, Integrated, Reliable', 'Fractionated, Amplified, Integrated, Replicated', 'None of the above'],
              correctAnswer: 0
            }
          ]
        },
      ],
    },
    {
      id: 'rnaseq',
      label: 'RNA-seq Analysis',
      color: '#58a6ff',
      description: 'Differential gene expression from FASTQ to biological insight',
      icon: 'activity',
      cert: 'RNA-seq Analysis Certificate',
      // Enhanced metadata
      difficulty: 'Intermediate',
      estimatedHours: '3.5 hours',
      prerequisites: ['Basic molecular biology', 'NGS fundamentals'],
      learningObjectives: [
        'Perform quality control on RNA-seq data',
        'Align RNA-seq reads using STAR aligner',
        'Conduct differential expression analysis with DESeq2',
        'Create publication-ready visualizations',
        'Perform functional enrichment analysis'
      ],
      nodes: [
        {
          id: 'rnaseq-qc',
          label: 'FASTQ QC',
          page: 'analysis',
          time: '25 min',
          desc: 'FastQC interpretation, adapter trimming',
          objectives: [
            'Interpret FastQC reports for RNA-seq data',
            'Identify common RNA-seq artifacts',
            'Perform adapter trimming when necessary'
          ],
          resources: [
            { type: 'tool', title: 'Analysis Studio', url: 'analysis' }
          ],
          quizQuestions: [
            {
              question: 'What is a common cause of overrepresented sequences in RNA-seq data?',
              options: ['Ribosomal RNA contamination', 'Adapter dimers', 'PCR duplicates', 'All of the above'],
              correctAnswer: 3
            }
          ]
        },
        {
          id: 'star-align',
          label: 'STAR Alignment',
          page: 'analysis',
          time: '30 min',
          desc: '2-pass alignment, splice junctions',
          objectives: [
            'Understand the STAR 2-pass alignment strategy',
            'Learn to align RNA-seq reads to a reference genome',
            'Identify and characterize splice junctions'
          ],
          resources: [
            { type: 'tool', title: 'Analysis Studio', url: 'analysis' }
          ],
          quizQuestions: [
            {
              question: 'What is the main advantage of 2-pass STAR alignment?',
              options: ['Faster alignment time', 'Better detection of novel splice junctions', 'Lower memory usage', 'Improved mapping quality scores'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'deseq2',
          label: 'DESeq2 DE',
          page: 'heatmap',
          time: '35 min',
          desc: 'Normalisation, DE testing, shrinkage',
          objectives: [
            'Understand DESeq2 normalization methods',
            'Perform differential expression analysis',
            'Interpret log2 fold changes and p-values'
          ],
          resources: [
            { type: 'tool', title: 'Heatmap Tool', url: 'heatmap' }
          ],
          quizQuestions: [
            {
              question: 'What does log2 fold change > 1 indicate?',
              options: ['Gene is upregulated', 'Gene is downregulated', 'No significant change', 'Insufficient data'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'volcano',
          label: 'Volcano Plot',
          page: 'heatmap',
          time: '20 min',
          desc: 'Fold-change vs p-value visualisation',
          objectives: [
            'Create and interpret volcano plots',
            'Identify significantly differentially expressed genes',
            'Apply multiple testing correction'
          ],
          resources: [
            { type: 'tool', title: 'Heatmap Tool', url: 'heatmap' }
          ],
          quizQuestions: [
            {
              question: 'In a volcano plot, what does the x-axis represent?',
              options: ['Statistical significance', 'Fold change', 'Expression level', 'Sample variance'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'pathway-enrich',
          label: 'Pathway Enrichment',
          page: 'pathways',
          time: '30 min',
          desc: 'KEGG, Reactome — Africa disease focus',
          objectives: [
            'Perform functional enrichment analysis',
            'Interpret KEGG and Reactome pathway results',
            'Focus on Africa-relevant disease pathways'
          ],
          resources: [
            { type: 'tool', title: 'Pathways Tool', url: 'pathways' }
          ],
          quizQuestions: [
            {
              question: 'What is the main purpose of pathway enrichment analysis?',
              options: ['To identify individual differentially expressed genes', 'To understand biological functions of gene sets', 'To visualize gene expression patterns', 'To normalize expression data'],
              correctAnswer: 1
            }
          ]
        },
      ],
    },
    {
      id: 'phylo',
      label: 'Phylogenomics',
      color: '#bc8cff',
      description: 'Reconstruct evolutionary histories and trace outbreak clades',
      icon: 'git-branch',
      cert: 'Phylogenomics Certificate',
      // Enhanced metadata
      difficulty: 'Intermediate to Advanced',
      estimatedHours: '3 hours',
      prerequisites: ['Basic genetics', 'Sequence alignment fundamentals'],
      learningObjectives: [
        'Perform multiple sequence alignment',
        'Build phylogenetic trees using various methods',
        'Interpret phylogenetic trees and bootstrap values',
        'Apply phylogenetic methods to outbreak investigation',
        'Explore Africa genomics knowledge networks'
      ],
      nodes: [
        {
          id: 'msa',
          label: 'Multiple Alignment',
          page: 'analysis',
          time: '25 min',
          desc: 'MUSCLE · MAFFT · gapped alignment',
          objectives: [
            'Understand different MSA algorithms',
            'Perform sequence alignment with MUSCLE and MAFFT',
            'Evaluate alignment quality'
          ],
          resources: [
            { type: 'tool', title: 'Analysis Studio', url: 'analysis' }
          ],
          quizQuestions: [
            {
              question: 'What is a key difference between MUSCLE and MAFFT?',
              options: ['MUSCLE is faster, MAFFT is more accurate', 'MAFFT is faster, MUSCLE is more accurate', 'They produce identical results', 'MAFFT only works with nucleotide sequences'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'tree-build',
          label: 'Tree Building',
          page: 'phylo',
          time: '40 min',
          desc: 'NJ, UPGMA algorithms, bootstrapping',
          objectives: [
            'Understand Neighbor-Joining and UPGMA algorithms',
            'Build phylogenetic trees with bootstrap support',
            'Interpret tree topology and branch lengths'
          ],
          resources: [
            { type: 'tool', title: 'Phylo Tree Builder', url: 'phylo' }
          ],
          quizQuestions: [
            {
              question: 'What does bootstrap support value > 70% indicate?',
              options: ['Weak branch support', 'Moderate branch support', 'Strong branch support', 'Inconclusive result'],
              correctAnswer: 2
            }
          ]
        },
        {
          id: 'tree-interpret',
          label: 'Tree Interpretation',
          page: 'phylo',
          time: '30 min',
          desc: 'Clades, monophyly, bootstrap support',
          objectives: [
            'Identify clades and monophyletic groups',
            'Interpret evolutionary relationships',
            'Assess confidence in phylogenetic inferences'
          ],
          resources: [
            { type: 'tool', title: 'Phylo Tree Builder', url: 'phylo' }
          ],
          quizQuestions: [
            {
              question: 'What is a monophyletic group?',
              options: ['Group with recent common ancestor', 'Group sharing a similar trait', 'Randomly selected species', 'Paraphyletic assemblage'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'outbreak-phylo',
          label: 'Outbreak Phylo',
          page: 'outbreak',
          time: '35 min',
          desc: 'Mpox Clade I — trace the index case',
          objectives: [
            'Apply phylogenetic methods to outbreak investigation',
            'Trace transmission pathways of infectious diseases',
            'Understand genomic epidemiology principles'
          ],
          resources: [
            { type: 'tool', title: 'Outbreak Simulator', url: 'outbreak' }
          ],
          quizQuestions: [
            {
              question: 'What is the index case in an outbreak?',
              options: ['The first identified case', 'The most severe case', 'The case that spread the disease most', 'The last case in the outbreak'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'knowledge-net',
          label: 'Knowledge Network',
          page: 'knowledge-graph',
          time: '20 min',
          desc: 'Africa genomics disease-gene graph',
          objectives: [
            'Explore Africa-specific genomics knowledge networks',
            'Understand disease-gene associations in African populations',
            'Apply network thinking to genomic research'
          ],
          resources: [
            { type: 'tool', title: 'Knowledge Graph', url: 'knowledge-graph' }
          ],
          quizQuestions: [
            {
              question: 'What type of biological relationships can be represented in a knowledge graph?',
              options: ['Protein-protein interactions only', 'Disease-gene associations only', 'Various biological entities and their relationships', 'Geographical locations only'],
              correctAnswer: 2
            }
          ]
        },
      ],
    },
    {
      id: 'africa',
      label: 'Africa Genomics',
      color: '#f97316',
      description: 'Population genetics, governance, and field sequencing for Africa',
      icon: 'globe',
      cert: 'Africa Genomics Specialist Certificate',
      // Enhanced metadata
      difficulty: 'Intermediate',
      estimatedHours: '3.5 hours',
      prerequisites: ['Basic genetics', 'Awareness of African genomic diversity'],
      learningObjectives: [
        'Understand African genomic diversity and population structure',
        'Learn about H3Africa and other African genomics initiatives',
        'Perform field sequencing quality control',
        'Understand antimicrobial resistance in African contexts',
        'Apply pathogen genomics for disease surveillance'
      ],
      nodes: [
        {
          id: 'africa-map',
          label: 'Africa Genome Map',
          page: 'africa',
          time: '20 min',
          desc: 'AWI-Gen, H3Africa project landscape',
          objectives: [
            'Understand the geographical distribution of African genomic studies',
            'Learn about major African genomics initiatives',
            'Appreciate the diversity of African populations'
          ],
          resources: [
            { type: 'tool', title: 'Africa Map', url: 'africa' }
          ],
          quizQuestions: [
            {
              question: 'What does H3Africa stand for?',
              options: ['Human Heredity and Health in Africa', 'Horizontally Transmitted Hemorrhagic Agents in Africa', 'Human Genome Project for Africa', 'None of the above'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'pop-struct',
          label: 'Pop Structure',
          page: 'popstruct',
          time: '35 min',
          desc: 'ADMIXTURE, PCA for African cohorts',
          objectives: [
            'Understand population structure analysis methods',
            'Interpret ADMIXTURE and PCA plots',
            'Apply findings to disease association studies'
          ],
          resources: [
            { type: 'tool', title: 'Pop Structure Tool', url: 'popstruct' }
          ],
          quizQuestions: [
            {
              question: 'What does PCA stand for in population genetics?',
              options: ['Principal Component Analysis', 'Population Cluster Assignment', 'Pedigree Complexity Assessment', 'None of the above'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'sra-data',
          label: 'African Datasets',
          page: 'sra',
          time: '25 min',
          desc: 'NCBI SRA, EBI ENA — Africa cohorts',
          objectives: [
            'Learn to access and use African genomic datasets',
            'Understand data access protocols and regulations',
            'Apply datasets to research questions'
          ],
          resources: [
            { type: 'tool', title: 'SRA Browser', url: 'sra' }
          ],
          quizQuestions: [
            {
              question: 'What is the main purpose of the Sequence Read Archive (SRA)?',
              options: ['To store assembled genomes', 'To store raw sequencing reads', 'To store gene annotations', 'To store protein sequences'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'nanopore-field',
          label: 'Nanopore Field QC',
          page: 'nanopore',
          time: '25 min',
          desc: 'ONT MinION field sequencing standards',
          objectives: [
            'Understand Nanopore sequencing technology',
            'Learn field sequencing best practices',
            'Apply QC standards for field-generated data'
          ],
          resources: [
            { type: 'tool', title: 'Nanopore QC', url: 'nanopore' }
          ],
          quizQuestions: [
            {
              question: 'What is a key advantage of Nanopore sequencing for field applications?',
              options: ['Higher accuracy than Illumina', 'Real-time sequencing capability', 'Lower cost per gigabase', 'Simpler sample preparation'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'amr-africa',
          label: 'AMR in Africa',
          page: 'amr',
          time: '30 min',
          desc: 'MDR-TB, CRE resistance profiling',
          objectives: [
            'Understand antimicrobial resistance mechanisms',
            'Learn about AMR prevalence in African populations',
            'Apply genomic methods for AMR surveillance'
          ],
          resources: [
            { type: 'tool', title: 'AMR Profiler', url: 'amr' }
          ],
          quizQuestions: [
            {
              question: 'What does MDR-TB stand for?',
              options: ['Multi-Drug Resistant Tuberculosis', 'Mild Drug-Resistant Tuberculosis', 'Metabolically Deficient Resistant Tuberculosis', 'None of the above'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'africa-pathogen',
          label: 'Pathogen Tracking',
          page: 'pathogen-tracker',
          time: '20 min',
          desc: 'Mpox, cholera, malaria surveillance',
          objectives: [
            'Understand genomic surveillance of pathogens',
            'Learn to track outbreaks using genomic data',
            'Apply pathogen genomics to public health responses'
          ],
          resources: [
            { type: 'tool', title: 'Pathogen Tracker', url: 'pathogen-tracker' }
          ],
          quizQuestions: [
            {
              question: 'What genomic characteristic is most useful for tracking cholera outbreaks?',
              options: ['Antibiotic resistance genes', 'Virulence factors', 'Core genome SNPs', 'Plasmid content'],
              correctAnswer: 2
            }
          ]
        },
      ],
    },
  ];

  /* ─── Get / set progress ─── */
  function _getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function _markComplete(nodeId) {
    const p = _getProgress();
    p[nodeId] = { done: true, at: Date.now() };
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
      // Check for achievements
      _checkAchievements();
    } catch {}
  }

  function _getAchievements() {
    try {
      return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function _addAchievement(achievementId) {
    const achievements = _getAchievements();
    if (!achievements.includes(achievementId)) {
      achievements.push(achievementId);
      try {
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
        // Show notification
        OmicsLab.Notify?.success(`Achievement unlocked: ${achievementId}`);
      } catch {}
    }
  }

  function _checkAchievements() {
    const progress = _getProgress();

    // First node completed
    const firstNodes = TRACKS.map(t => t.nodes[0].id);
    if (firstNodes.some(nodeId => progress[nodeId]?.done)) {
      _addAchievement('first_steps');
    }

    // Complete a track
    TRACKS.forEach(track => {
      const allDone = track.nodes.every(node => progress[node.id]?.done);
      if (allDone) {
        _addAchievement(`track_${track.id}_complete`);
      }
    });

    // All tracks complete
    const allTracksDone = TRACKS.every(track =>
      track.nodes.every(node => progress[node.id]?.done)
    );
    if (allTracksDone) {
      _addAchievement('omicslab_master');
    }

    // Streak achievements (simplified)
    const completedCount = Object.values(progress).filter(p => p.done).length;
    if (completedCount >= 5) {
      _addAchievement('learning_enthusiast');
    }
    if (completedCount >= 10) {
      _addAchievement('dedicated_learner');
    }
    if (completedCount >= 15) {
      _addAchievement('bioinformatics_expert');
    }
  }

  function _nodeState(nodeId, trackNodes, progress) {
    if (progress[nodeId]?.done) return 'complete';
    /* A node is available if it's the first OR the previous node is complete */
    const idx = trackNodes.findIndex((n) => n.id === nodeId);
    if (idx === 0) return 'available';
    const prevId = trackNodes[idx - 1].id;
    if (progress[prevId]?.done) return 'available';
    return 'locked';
  }

  /* ─── Render into container ─── */
  function render(container) {
    _injectStyles();
    const progress = _getProgress();
    const achievements = _getAchievements();

    container.innerHTML = `
      <div class="lp-wrap">
        <div class="lp-header">
          <div class="lp-title">Your Learning Path</div>
          <div class="lp-sub">Complete modules in order to unlock certificates and achievements</div>
        </div>
        <div class="lp-achievements">
          ${achievements.map(ach => `<span class="lp-achievement-badge" title="${ach}">🏆</span>`).join('')}
          <span class="lp-achievements-count">${achievements.length} achievements unlocked</span>
        </div>
        ${TRACKS.map((track) => _renderTrack(track, progress)).join('')}
      </div>`;

    /* Wire node clicks */
    container.querySelectorAll('[data-lp-node]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nodeId = btn.dataset.lpNode;
        const page = btn.dataset.lpPage;
        const state = btn.dataset.lpState;
        if (state === 'locked') {
          OmicsLab.Notify?.warning('Complete the previous module first');
          return;
        }
        if (state === 'available') _markComplete(nodeId); /* simulate progress */
        OmicsLab.Router?.navigate(page);
      });
    });

    /* Wire cert buttons */
    container.querySelectorAll('[data-lp-cert]').forEach((btn) => {
      btn.addEventListener('click', () => _downloadCert(btn.dataset.lpCert, btn.dataset.lpTrack));
    });
  }

  function _renderTrack(track, progress) {
    const nodes = track.nodes;
    const completedCount = nodes.filter((n) => progress[n.id]?.done).length;
    const isTrackDone = completedCount === nodes.length;
    const percent = Math.round((completedCount / nodes.length) * 100);

    return `
      <div class="lp-track" style="--track-color:${track.color}">
        <div class="lp-track-header">
          <div class="lp-track-info">
            <div class="lp-track-icon">${OmicsLab.Icons?.svg(track.icon, 20) || ''}</div>
            <div>
              <span class="lp-track-name">${_esc(track.label)}</span>
              <span class="lp-track-difficulty">${track.difficulty}</span>
            </div>
          </div>
          <div class="lp-track-meta">
            <div class="lp-track-progress">${completedCount}/${nodes.length} nodes (${percent}%)</div>
            ${
              isTrackDone
                ? `<button class="btn btn-primary btn-sm lp-cert-btn" data-lp-cert="${_esc(track.cert)}" data-lp-track="${track.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              View Certificate
            </button>`
                : `
              <button class="btn btn-outline btn-sm lp-progress-btn" data-lp-track="${track.id}">
                Track Progress
              </button>`
            }
          </div>
        </div>
        <div class="lp-objectives">
          <h4 class="lp-objectives-title">Learning Objectives</h4>
          <ul class="lp-objectives-list">
            ${track.learningObjectives.map(obj => `<li>${_esc(obj)}</li>`).join('')}
          </ul>
        </div>
        <div class="lp-progress-bar"><div class="lp-progress-fill" style="width:${percent}%"></div></div>
        <div class="lp-nodes-row">
          ${_renderSVGTrack(nodes, progress)}
        </div>
        <div class="lp-nodes-labels">
          ${nodes
            .map((node, i) => {
              const state = _nodeState(node.id, nodes, progress);
              return `
              <button class="lp-node-label lp-node-label-${state} lp-node-interactive" type="button"
                data-lp-node="${node.id}" data-lp-page="${node.page}" data-lp-state="${state}"
                title="${_esc(node.desc)} · ${_esc(node.time)}"
                data-node-index="${i}"
                data-track-id="${track.id}">
                <span class="lp-node-label-text">${_esc(node.label)}</span>
                <span class="lp-node-label-time">${_esc(node.time)}</span>
                ${state === 'complete' ? '<span class="lp-node-check">✓</span>' : ''}
                ${state === 'available' && progress[node.id]?.done ? '<span class="lp-node-new">!</span>' : ''}
              </button>`;
            })
            .join('')}
        </div>
        <div class="lp-node-details" id="lp-node-details-${track.id}"></div>
      </div>`;
  }

  function _renderSVGTrack(nodes, progress) {
    const W = 80; /* Increased node pitch for better spacing */
    const CX = 40; /* node centre x within slot */
    const R = 20; /* Increased node radius */
    const Y = 40;
    const total = nodes.length;
    const svgW = total * W;

    let circles = '';
    let lines = '';

    nodes.forEach((node, i) => {
      const state = _nodeState(node.id, nodes, progress);
      const cx = i * W + CX;

      /* Connector line to next node */
      if (i < total - 1) {
        const nextCx = (i + 1) * W + CX;
        const nextState = _nodeState(nodes[i + 1].id, nodes, progress);
        const lineColor = state === 'complete' ? 'var(--track-color,#00C4A0)' : '#243048';
        lines += `<line x1="${cx + R}" y1="${Y}" x2="${nextCx - R}" y2="${Y}" stroke="${lineColor}" stroke-width="3" stroke-dasharray="${nextState === 'locked' ? '6,4' : 'none'}"/>`;
      }

      /* Node circle */
      if (state === 'complete') {
        circles += `
          <circle cx="${cx}" cy="${Y}" r="${R}" fill="var(--track-color,#00C4A0)" stroke="var(--track-color,#00C4A0)" stroke-width="3"/>
          <path d="M${cx - 9} ${Y} l7 7 12-12" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      } else if (state === 'available') {
        circles += `
          <circle cx="${cx}" cy="${Y}" r="${R}" fill="var(--bg-surface,#111B2E)" stroke="var(--track-color,#00C4A0)" stroke-width="3.5"/>
          <circle cx="${cx}" cy="${Y}" r="8" fill="var(--track-color,#00C4A0)"/>`;
      } else {
        circles += `
          <circle cx="${cx}" cy="${Y}" r="${R}" fill="var(--bg-surface,#111B2E)" stroke="#243048" stroke-width="3"/>
          <path d="M${cx - 7} ${Y - 3} a7 7 0 0 1 14 0 v4 H${cx - 7}z M${cx - 9} ${Y + 1.5} h18 v8 a3 3 0 0 1-3 3 H${cx - 9} a3 3 0 0 1-3-3z" fill="#354060"/>`;
      }
    });

    return `
      <div class="lp-svg-track-wrap" style="overflow-x:auto;-webkit-overflow-scrolling:touch">
        <svg width="${svgW}" height="${Y * 2}" viewBox="0 0 ${svgW} ${Y * 2}" fill="none" xmlns="http://www.w3.org/2000/svg">
          ${lines}${circles}
        </svg>
      </div>`;
  }

  /* ─── Enhanced Node Details Panel ─── */
  function _showNodeDetails(trackId, nodeId, progress) {
    const track = TRACKS.find(t => t.id === trackId);
    if (!track) return;

    const node = track.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const state = _nodeState(nodeId, track.nodes, progress);

    let detailsHTML = `
      <div class="lp-node-details-content">
        <div class="lp-node-details-header">
          <h3>${_esc(node.label)}</h3>
          <span class="lp-node-details-state lp-node-details-state-${state}">${state.toUpperCase()}</span>
        </div>
        <div class="lp-node-details-body">
          <p class="lp-node-details-desc">${_esc(node.desc)}</p>
          <p class="lp-node-details-time"><strong>Estimated time:</strong> ${node.time}</p>
        </div>
    `;

    if (node.objectives && node.objectives.length > 0) {
      detailsHTML += `
        <div class="lp-node-details-section">
          <h4>Learning Objectives</h4>
          <ul>
            ${node.objectives.map(obj => `<li>${_esc(obj)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (node.resources && node.resources.length > 0) {
      detailsHTML += `
        <div class="lp-node-details-section">
          <h4>Resources</h4>
          <div class="lp-node-details-resources">
            ${node.resources.map(res => `
              <div class="lp-node-details-resource-item lp-node-details-resource-${res.type}" onclick="OmicsLab.Router?.navigate('${res.url}')">
                <span class="lp-node-details-resource-icon">${res.type === 'video' ? '▶️' : res.type === 'article' ? '📄' : res.type === 'simulation' ? '🎮' : res.type === 'tool' ? '🔧' : '🔗'}</span>
                <span class="lp-node-details-resource-title">${_esc(res.title)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (node.quizQuestions && node.quizQuestions.length > 0) {
      detailsHTML += `
        <div class="lp-node-details-section">
          <h4>Knowledge Check</h4>
          <div class="lp-node-details-quiz" data-node-id="${nodeId}" data-track-id="${trackId}">
            <!-- Quiz will be rendered dynamically -->
          </div>
          <button class="btn btn-outline btn-sm lp-quiz-toggle" onclick="OmicsLab.LearningPath._toggleQuiz('${trackId}', '${nodeId}')">
            Take Quiz
          </button>
        </div>
      `;
    }

    detailsHTML += `</div>`;

    const detailsContainer = document.getElementById(`lp-node-details-${trackId}`);
    if (detailsContainer) {
      detailsContainer.innerHTML = detailsHTML;

      // Initialize quiz if present
      if (node.quizQuestions && node.quizQuestions.length > 0) {
        const quizContainer = detailsContainer.querySelector('.lp-node-details-quiz');
        if (quizContainer) {
          _renderQuiz(quizContainer, node, progress);
        }
      }
    }
  }

  function _renderQuiz(container, node, progress) {
    if (!node.quizQuestions || node.quizQuestions.length === 0) return;

    // Simple implementation - show first quiz question
    const question = node.quizQuestions[0];
    container.innerHTML = `
      <div class="lp-quiz-question">
        <p>${_esc(question.question)}</p>
        <div class="lp-quiz-options">
          ${question.options.map((opt, idx) => `
            <label class="lp-quiz-option">
              <input type="radio" name="quiz-${node.id}" value="${idx}">
              ${_esc(opt)}
            </label>
          `).join('')}
        </div>
        <button class="btn btn-primary btn-sm lp-quiz-submit" onclick="OmicsLab.LearningPath._submitQuiz('${node.id}', '${node.page}')">
          Submit Answer
        </button>
        <div class="lp-quiz-feedback" style="margin-top: 10px; min-height: 20px;"></div>
      </div>
    `;
  }

  function _submitQuiz(nodeId, page) {
    const quizContainer = document.querySelector(`[data-node-id="${nodeId}"] .lp-quiz-feedback`);
    if (!quizContainer) return;

    const selectedOption = document.querySelector(`input[name="quiz-${nodeId}"]:checked`);
    if (!selectedOption) {
      quizContainer.innerHTML = '<p style="color: #f97316;">Please select an answer</p>';
      return;
    }

    const track = TRACKS.find(t => t.nodes.some(n => n.id === nodeId));
    if (!track) return;

    const node = track.nodes.find(n => n.id === nodeId);
    if (!node || !node.quizQuestions || node.quizQuestions.length === 0) return;

    const question = node.quizQuestions[0];
    const selectedIndex = parseInt(selectedOption.value);
    const isCorrect = selectedIndex === question.correctAnswer;

    if (isCorrect) {
      quizContainer.innerHTML = '<p style="color: #00C4A0;">Correct! Well done.</p>';
      // Award points for correct answer
      _addAchievement(`quiz_${nodeId}`);
    } else {
      quizContainer.innerHTML = `<p style="color: #f97316;">Incorrect. The correct answer is: ${question.options[question.correctAnswer]}</p>`;
    }

    // Disable further submissions
    const options = document.querySelectorAll(`input[name="quiz-${nodeId}"]`);
    options.forEach(opt => opt.disabled = true);
    document.querySelector(`.lp-quiz-submit`).disabled = true;
  }

  function _toggleQuiz(trackId, nodeId) {
    const quizContainer = document.querySelector(`[data-node-id="${nodeId}"] .lp-node-details-quiz`);
    const toggleBtn = document.querySelector(`[data-node-id="${nodeId}"] .lp-quiz-toggle`);
    if (!quizContainer || !toggleBtn) return;

    const isHidden = quizContainer.style.display === 'none';
    quizContainer.style.display = isHidden ? 'block' : 'none';
    toggleBtn.textContent = isHidden ? 'Hide Quiz' : 'Take Quiz';
  }

  /* ─── Certificate download ─── */
  function _downloadCert(certName, trackId) {
    const track = TRACKS.find((t) => t.id === trackId);
    if (!track) return;
    const name = localStorage.getItem('omicslab_profile_name') || 'OmicsLab Learner';
    const date = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>OmicsLab Certificate — ${certName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=Inter:wght@400;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;background:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
  .cert{width:800px;border:3px solid ${track.color};border-radius:16px;padding:4rem;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.12)}
  .cert-logo{font-family:'Sora',sans-serif;font-size:1.4rem;font-weight:800;color:#1f2328;margin-bottom:2rem}
  .cert-logo span{color:${track.color}}
  .cert-eyebrow{font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:#656d76;margin-bottom:.5rem}
  .cert-title{font-family:'Sora',sans-serif;font-size:2.2rem;font-weight:800;color:#1f2328;line-height:1.2;margin-bottom:1.5rem}
  .cert-name{font-size:1.6rem;font-weight:700;color:${track.color};margin-bottom:.5rem;border-bottom:2px solid ${track.color};display:inline-block;padding-bottom:.25rem}
  .cert-for{font-size:.9rem;color:#57606a;margin:.75rem 0}
  .cert-track{font-size:1.2rem;font-weight:700;color:#1f2328;margin-bottom:1.5rem}
  .cert-details{font-size:1rem;color:#57606a;margin:1.5rem 0;line-height:1.6}
  .cert-date{font-size:.85rem;color:#656d76;margin-top:2rem}
  .cert-footer{font-size:.75rem;color:#8c959f;margin-top:1.5rem;border-top:1px solid #e1e4e8;padding-top:1rem}
  @media print{body{padding:0}.cert{border:3px solid ${track.color};box-shadow:none;width:100%}}
</style>
</head>
<body>
<div class="cert">
  <div class="cert-logo">Omics<span>Lab</span></div>
  <div class="cert-eyebrow">Certificate of Completion</div>
  <div class="cert-title">${_esc(certName)}</div>
  <div class="cert-for">This certifies that</div>
  <div class="cert-name">${_esc(name)}</div>
  <div class="cert-for">has successfully completed the</div>
  <div class="cert-track">${_esc(track.label)} Track</div>
  <div class="cert-details">
    <p><strong>Learning Objectives Achieved:</strong></p>
    <ul>
      ${track.learningObjectives.map(obj => `<li>${_esc(obj)}</li>`).join('')}
    </ul>
    <p><strong>Modules Completed:</strong> ${track.nodes.map(node => `_esc(node.label)`).join(', ')}</p>
  </div>
  <div class="cert-date">Awarded on ${date}</div>
  <div class="cert-footer">OmicsLab · Africa's Omics Training Platform · omicslab.africa</div>
</div>
<script>window.print();</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omicslab-${trackId}-certificate.html`;
    a.click();
    URL.revokeObjectURL(url);
    OmicsLab.Notify?.success('Certificate downloaded — open in browser and print to PDF');
  }

  function _esc(s) {
    return String(s || '').replace(
      /[<>&"']/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c]
    );
  }

  function _injectStyles() {
    if (document.getElementById('lp-styles')) return;
    const s = document.createElement('style');
    s.id = 'lp-styles';
    s.textContent = `
      .lp-wrap{padding:1.5rem 2rem}
      .lp-header{margin-bottom:2rem;text-align:center}
      .lp-title{font-size:1.5rem;font-weight:800;color:var(--text-primary,#E4DDD2);margin-bottom:.5rem}
      .lp-sub{font-size:.95rem;color:var(--text-muted,#A8A098)}
      .lp-achievements{display:flex;align-items:center;gap:.5rem;justify-content:center;margin-bottom:1.5rem;flex-wrap:wrap}
      .lp-achievement-badge{font-size:1.2rem;background:rgba(0,196,160,0.2);border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center}
      .lp-achievements-count{font-size:.9rem;color:var(--text-faint,#354060)}
      .lp-track{background:var(--bg-surface,#111B2E);border:1px solid var(--border-default,#182236);border-radius:12px;padding:1.5rem;margin-bottom:2rem;--track-color:#00C4A0;transition:transform .2s var(--ease-out,ease)}
      .lp-track:hover{transform:translateY(-4px)}
      .lp-track-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}
      .lp-track-info{display:flex;align-items:center;gap:1rem;flex:1;min-width:0}
      .lp-track-icon{background:var(--track-color,#00C4A0);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center}
      .lp-track-name{font-size:1.1rem;font-weight:700;color:var(--track-color,#00C4A0);display:block;margin-bottom:.25rem}
      .lp-track-difficulty{font-size:.8rem;color:var(--track-color,#00C4A0);background:rgba(0,196,160,0.2);padding:.2rem .5rem;border-radius:4px}
      .lp-track-meta{display:flex;align-items:center;gap:1rem;flex-shrink:0}
      .lp-track-progress{font-size:.9rem;font-weight:600;color:var(--text-faint,#354060)}
      .lp-cert-btn,.lp-progress-btn{font-size:.85rem !important;padding:.5rem 1rem !important;border-radius:6px}
      .lp-progress-btn{border:1px solid var(--border-default,#182236);color:var(--text-primary,#E4DDD2);background:transparent}
      .lp-progress-btn:hover{background:var(--bg-overlay,#182236)}
      .lp-objectives{margin-bottom:1.5rem}
      .lp-objectives-title{font-size:1rem;font-weight:700;color:var(--text-primary,#E4DDD2);margin-bottom:.5rem}
      .lp-objectives-list{list-style:none;padding:0}
      .lp-objectives-list li{padding:.3rem 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:.85rem;color:var(--text-secondary,#A8A098)}
      .lp-objectives-list li:last-child{border-bottom:none}
      .lp-progress-bar{height:6px;background:var(--bg-overlay,#182236);border-radius:3px;margin-bottom:1.5rem;overflow:hidden}
      .lp-progress-fill{height:100%;background:var(--track-color,#00C4A0);border-radius:3px;transition:width .6s var(--ease-out,ease)}
      .lp-svg-track-wrap{margin-bottom:1.5rem}
      .lp-nodes-labels{display:flex;gap:0}
      .lp-node-label{
        flex:1;min-width:0;
        display:flex;flex-direction:column;align-items:center;gap:.25rem;
        background:none;border:2px solid transparent;border-radius:8px;
        padding:.5rem .3rem;cursor:pointer;
        transition:all .2s var(--ease-out,ease);
        text-align:center;
        position:relative;
      }
      .lp-node-label:hover:not(.lp-node-label-locked){background:var(--bg-overlay,#182236);border-color:var(--track-color,#00C4A0);transform:scale(1.05)}
      .lp-node-label-locked{cursor:not-allowed;opacity:.6;transform:scale(0.95)}
      .lp-node-label-text{font-size:.9rem;font-weight:600;color:var(--text-secondary,#A8A098);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
      .lp-node-label-complete .lp-node-label-text{color:var(--track-color,#00C4A0)}
      .lp-node-label-time{font-size:.75rem;color:var(--text-faint,#354060)}
      .lp-node-check{position:absolute;top:-8px;right:-8px;background:var(--track-color,#00C4A0);color:white;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:bold}
      .lp-node-new{position:absolute;top:-8px;left:-8px;background:#f97316;color:white;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:bold;animation:pulse 2s infinite}
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      .lp-node-details{margin-top:1.5rem;border-top:1px solid var(--border-default,#182236);padding-top:1.5rem}
      .lp-node-details-content{max-width:600px}
      .lp-node-details-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:.5rem;border-bottom:1px solid var(--border-muted,#243048)}
      .lp-node-details-header h3{font-size:1.2rem;font-weight:700;color:var(--text-primary,#E4DDD2);margin:0}
      .lp-node-details-state{font-size:.8rem;font-weight:600;padding:.2rem .6rem;border-radius:4px;text-transform:uppercase}
      .lp-node-details-state-available{background:rgba(0,196,160,0.2);color:#00C4A0}
      .lp-node-details-state-locked{background:rgba(36,48,72,0.3);color:#A8A098}
      .lp-node-details-state-complete{background:rgba(0,196,160,0.2);color:#00C4A0}
      .lp-node-details-body{margin-bottom:1.5rem}
      .lp-node-details-desc{font-size:.9rem;color:var(--text-secondary,#A8A098);margin-bottom:.75rem}
      .lp-node-details-time{font-size:.85rem;color:var(--text-faint,#354060);margin-bottom:.75rem}
      .lp-node-details-section{margin-bottom:1.5rem}
      .lp-node-details-section h4{font-size:1rem;font-weight:700;color:var(--text-primary,#E4DDD2);margin-bottom:.75rem}
      .lp-node-details-resources{display:flex;flex-wrap:wrap;gap:.75rem}
      .lp-node-details-resource-item{border:1px solid var(--border-default,#182236);border-radius:6px;padding:.75rem 1rem;cursor:pointer;transition:all .2s;flex:1;min-width:150px}
      .lp-node-details-resource-item:hover{background:var(--bg-overlay,#182236);transform:translateY(-2px)}
      .lp-node-details-resource-icon{font-size:1.2rem;margin-right:.5rem}
      .lp-node-details-resource-title{font-size:.9rem;color:var(--text-primary,#E4DDD2)}
      .lp-node-details-resource-video{border-left:3px solid #ff6b6b}
      .lp-node-details-resource-article{border-left:3px solid #58a6ff}
      .lp-node-details-resource-simulation{border-left:3px solid #00C4A0}
      .lp-node-details-resource-tool{border-left:3px solid #bc8cff}
      .lp-node-details-quiz{margin-top:1rem;padding:1rem;background:var(--bg-overlay,#182236);border-radius:6px}
      .lp-quiz-question{margin-bottom:1rem}
      .lp-quiz-options{margin-bottom:1rem}
      .lp-quiz-option{display:block;margin-bottom:.5rem;cursor:pointer}
      .lp-quiz-option input{margin-right:.5rem}
      .lp-quiz-feedback{font-size:.85rem;min-height:2rem}
      .lp-quiz-toggle{font-size:.85rem !important;padding:.3rem .75rem !important;margin-top:.5rem}
      @media (max-width: 768px) {
        .lp-wrap{padding:1rem}
        .lp-track{padding:1rem}
        .lp-track-header{flex-direction:column;align-items:center;text-align:center}
        .lp-track-info{flex-direction:column;align-items:center}
        .lp-track-meta{margin-top:1rem}
        .lp-nodes-labels{flex-wrap:wrap}
        .lp-node-label{flex:0 0 45%;margin-bottom:1rem}
        .lp-node-details-content{width:100%}
      }
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════════════
     ENHANCED STUDY PLAN GENERATOR (Enhanced from Prompt 55)
     ─ User inputs goal, hours/week, level → generates a week-by-week plan
     ─ AI-powered suggestions with OmicsLab integration
     ─ Enhanced with social learning features and progress tracking
     ════════════════════════════════════════════════════════════════ */
  const PLAN_KEY = 'omicslab_study_plan_v2';
  const STUDY_GROUP_KEY = 'omicslab_study_group_v1';

  const PLAN_TEMPLATES = {
    wgs: {
      title: 'Whole-Genome Sequencing — Sample to Variant',
      icon: 'dna',
      color: '#00C4A0',
      weeks: [
        {
          title: 'Lab & QC Foundations',
          modules: ['lab', 'qualitypredictor'],
          goal: 'Complete DNA extraction + interpret QC report',
          description: 'Master the fundamentals of sample preparation and quality control essential for reliable genomic analysis',
          reading: [
            { title: 'Andrews et al. FastQC documentation', url: '#' },
            { title: 'Broad GATK best practices', url: '#' }
          ],
          handsOn: ['DNA extraction simulation', 'QC metric interpretation'],
          estimatedHours: 3
        },
        {
          title: 'Read Alignment',
          modules: ['analysis'],
          goal: 'Run BWA alignment · interpret flagstat',
          description: 'Learn to align sequencing reads to a reference genome and assess alignment quality',
          reading: [
            { title: 'Li & Durbin (2009) BWA paper', url: '#' },
            { title: 'samtools manual', url: '#' }
          ],
          handsOn: ['BWA-MEM2 alignment practice', 'samtools flagstat exercises'],
          estimatedHours: 2.5
        },
        {
          title: 'Variant Calling',
          modules: ['variantinterp'],
          goal: 'HaplotypeCaller on example data · review GVCF',
          description: 'Identify genetic variants using industry-standard tools and understand variant call formats',
          reading: [
            { title: 'McKenna et al. (2010) GATK', url: '#' },
            { title: 'GATK4 documentation', url: '#' }
          ],
          handsOn: ['GATK HaplotypeCaller exercises', 'VCF file exploration'],
          estimatedHours: 3
        },
        {
          title: 'ACMG Classification',
          modules: ['variantinterp', 'variant-atlas'],
          goal: 'Classify 5 Africa-relevant variants with ACMG criteria',
          description: 'Learn to clinically interpret genetic variants using established guidelines',
          reading: [
            { title: 'Richards et al. (2015) ACMG guidelines', url: '#' }
          ],
          handsOn: ['Variant classification practice', 'ClinVar database exploration'],
          estimatedHours: 2.5
        },
        {
          title: 'Population Context',
          modules: ['popstruct', 'h3africa'],
          goal: 'Run PCA on African samples · explore H3Africa',
          description: 'Understand African genomic diversity and how it impacts variant interpretation',
          reading: [
            { title: 'H3Africa consortium publications', url: '#' }
          ],
          handsOn: ['PCA analysis practice', 'H3Africa portal exploration'],
          estimatedHours: 3
        },
        {
          title: 'Reporting & Documentation',
          modules: ['labnotebook', 'output-tracker'],
          goal: 'Write complete analysis notebook entry',
          description: 'Learn to document your analysis workflow for reproducibility and collaboration',
          reading: [
            { title: 'FAIR data principles — Wilkinson et al. (2016)', url: '#' }
          ],
          handsOn: ['Electronic lab notebook practice', 'Analysis report generation'],
          estimatedHours: 2
        },
      ],
    },
    rnaseq: {
      title: 'RNA-seq Analysis — Expression to Pathways',
      icon: 'activity',
      color: '#58a6ff',
      weeks: [
        {
          title: 'RNA Quality & QC',
          modules: ['analysis', 'qualitypredictor'],
          goal: 'FastQC on RNA-seq data · assess RIN score criteria',
          description: 'Ensure your RNA-seq data is of sufficient quality for downstream analysis',
          reading: [
            { title: 'ENCODE RNA-seq standards', url: '#' },
            { title: 'Conesa et al. (2016)', url: '#' }
          ],
          handsOn: ['FastQC practice', 'RNA integrity assessment'],
          estimatedHours: 2.5
        },
        {
          title: 'Alignment & Counting',
          modules: ['analysis'],
          goal: 'STAR 2-pass · featureCounts',
          description: 'Align RNA-seq reads and quantify gene expression levels',
          reading: [
            { title: 'Dobin et al. (2013) STAR paper', url: '#' },
            { title: 'Anders et al. featureCounts', url: '#' }
          ],
          handsOn: ['STAR alignment practice', 'Gene quantification exercises'],
          estimatedHours: 3
        },
        {
          title: 'Differential Expression',
          modules: ['heatmap'],
          goal: 'DESeq2 analysis · volcano plot interpretation',
          description: 'Identify significantly differentially expressed genes and visualize results',
          reading: [
            { title: 'Love, Huber & Anders (2014) DESeq2', url: '#' }
          ],
          handsOn: ['DESeq2 analysis practice', 'Volcano plot creation'],
          estimatedHours: 3
        },
        {
          title: 'Pathway Enrichment',
          modules: ['pathways'],
          goal: 'KEGG + Reactome enrichment · Africa disease focus',
          description: 'Understand the biological functions and pathways associated with your gene expression changes',
          reading: [
            { title: 'Kanehisa & Goto KEGG', url: '#' },
            { title: 'GSEA methodology', url: '#' }
          ],
          handsOn: ['Pathway enrichment analysis', 'Africa-focused pathway exploration'],
          estimatedHours: 2.5
        },
        {
          title: 'Publication Figure',
          modules: ['heatmap', 'citations'],
          goal: 'Create publication-quality heatmap + citation list',
          description: 'Prepare your results for publication with professional visualizations and proper attribution',
          reading: [
            { title: 'Ten simple rules for better figures — Rougier et al.', url: '#' }
          ],
          handsOn: ['Heatmap creation practice', 'Reference management exercises'],
          estimatedHours: 2
        },
      ],
    },
    phylo: {
      title: 'Phylogenomics & Outbreak Investigation',
      icon: 'git-branch',
      color: '#bc8cff',
      weeks: [
        {
          title: 'Sequence Alignment',
          modules: ['analysis'],
          goal: 'Run MUSCLE/MAFFT on example sequences',
          description: 'Prepare your sequences for phylogenetic analysis through accurate alignment',
          reading: [
            { title: 'Edgar (2004) MUSCLE', url: '#' },
            { title: 'Katoh (2002) MAFFT', url: '#' }
          ],
          handsOn: ['Multiple sequence alignment practice', 'Alignment quality assessment'],
          estimatedHours: 2.5
        },
        {
          title: 'Tree Building',
          modules: ['phylo'],
          goal: 'Build NJ and UPGMA trees · interpret bootstrap values',
          description: 'Construct phylogenetic trees and assess confidence in your evolutionary inferences',
          reading: [
            { title: 'Saitou & Nei (1987) NJ', url: '#' },
            { title: 'Studier & Keppler UPGMA', url: '#' }
          ],
          handsOn: ['Neighbor-Joining tree building', 'Bootstrap analysis practice'],
          estimatedHours: 3
        },
        {
          title: 'Outbreak Simulation',
          modules: ['outbreak'],
          goal: 'Run Mpox Clade I simulation to completion',
          description: 'Apply phylogenetic methods to real-world outbreak investigation scenarios',
          reading: [
            { title: 'Mbala-Kingebeni et al. (2023) mpox Africa', url: '#' }
          ],
          handsOn: ['Outbreak simulation exercises', 'Phylogenetic outbreak analysis'],
          estimatedHours: 3
        },
        {
          title: 'Africa Genomic Epi',
          modules: ['h3africa', 'alerts'],
          goal: 'Explore H3Africa surveillance + interpret 3 outbreak alerts',
          description: 'Understand genomic epidemiology in African contexts and respond to public health threats',
          reading: [
            { title: 'H3Africa consortium overview', url: '#' }
          ],
          handsOn: ['H3Africa portal exploration', 'Outbreak alert interpretation'],
          estimatedHours: 2.5
        },
        {
          title: 'Final Case Study',
          modules: ['phylo', 'peerreview'],
          goal: 'Peer review a phylogenomics paper · present findings',
          description: 'Synthesize your learning by critically evaluating research and communicating findings',
          reading: [
            { title: 'Murray et al. (2022) genomic epi methods', url: '#' }
          ],
          handsOn: ['Peer review practice', 'Scientific presentation preparation'],
          estimatedHours: 3
        },
      ],
    },
    africa: {
      title: 'Africa Genomics Specialist',
      icon: 'globe',
      color: '#f97316',
      weeks: [
        {
          title: 'Africa Genomics Landscape',
          modules: ['africa', 'h3africa'],
          goal: 'Map key African genomics institutions and initiatives',
          description: 'Understand the current state and future directions of genomic research in Africa',
          reading: [
            { title: 'Nembaware et al. H3ABioNet', url: '#' },
            { title: 'Mulder et al. (2016)', url: '#' }
          ],
          handsOn: ['Institution mapping exercises', 'H3Africa portal navigation'],
          estimatedHours: 3
        },
        {
          title: 'Population Genomics',
          modules: ['popstruct'],
          goal: 'Interpret ADMIXTURE plots for African populations',
          description: 'Understand the genetic structure and diversity of African populations',
          reading: [
            { title: 'Gurdasani et al. (2019) Uganda cohort', url: '#' },
            { title: 'Choudhury et al. (2017)', url: '#' }
          ],
          handsOn: ['ADMIXTURE analysis practice', 'PCA interpretation exercises'],
          estimatedHours: 3
        },
        {
          title: 'Africa-Specific Variants',
          modules: ['variant-atlas'],
          goal: 'Study 10 variants unique to African populations',
          description: 'Learn about genetic variants that are particularly relevant to African populations',
          reading: [
            { title: 'African Genome Variation Project (Gurdasani 2015)', url: '#' }
          ],
          handsOn: ['Variant annotation practice', 'ClinVar Africa-specific exploration'],
          estimatedHours: 2.5
        },
        {
          title: 'Pathogen Genomics',
          modules: ['outbreak', 'pathogen-tracker'],
          goal: 'Complete outbreak + review 5 pathogen genomes',
          description: 'Apply genomic methods to track and respond to infectious disease outbreaks in Africa',
          reading: [
            { title: 'Happi et al. (2022) Africa genomics capacity', url: '#' }
          ],
          handsOn: ['Outbreak simulation practice', 'Pathogen genome analysis'],
          estimatedHours: 3
        },
        {
          title: 'One Health & AMR',
          modules: ['one-health', 'amr'],
          goal: 'Map 3 zoonotic transmission chains · profile AMR gene',
          description: 'Understand the interconnectedness of human, animal, and environmental health in the context of antimicrobial resistance',
          reading: [
            { title: 'WHO AMR Global Action Plan', url: '#' }
          ],
          handsOn: ['Transmission chain mapping exercises', 'AMR gene profiling practice'],
          estimatedHours: 2.5
        },
        {
          title: 'Data Governance',
          modules: ['research'],
          goal: 'Complete FAIR scoring on a real African dataset',
          description: 'Ensure African genomic data is handled ethically, legally, and according to international standards',
          reading: [
            { title: 'H3Africa Data Access Policy', url: '#' },
            { title: 'Abayomi et al. ethics', url: '#' }
          ],
          handsOn: ['FAIR data assessment practice', 'Ethical considerations workshop'],
          estimatedHours: 3
        },
      ],
    },
  };

  function renderStudyPlan(container) {
    const plan = _loadPlan();
    if (!plan) {
      _renderPlanBuilder(container);
    } else {
      _renderPlanView(container, plan);
    }
  }

  function _loadPlan() {
    try {
      return JSON.parse(localStorage.getItem(PLAN_KEY));
    } catch {
      return null;
    }
  }
  function _savePlan(p) {
    localStorage.setItem(PLAN_KEY, JSON.stringify(p));
  }

  function _renderPlanBuilder(container) {
    // Get user's learning progress to suggest relevant plans
    const progress = _getProgress();
    const completedTracks = TRACKS.filter(track =>
      track.nodes.every(node => progress[node.id]?.done)
    ).map(t => t.id);

    let suggestedTrack = 'wgs'; // Default
    if (completedTracks.length > 0) {
      // Suggest next track based on what's completed
      const trackOrder = ['wgs', 'rnaseq', 'phylo', 'africa'];
      const lastCompletedIndex = trackOrder.findIndex(t => completedTracks.includes(t));
      if (lastCompletedIndex >= 0 && lastCompletedIndex < trackOrder.length - 1) {
        suggestedTrack = trackOrder[lastCompletedIndex + 1];
      } else if (completedTracks.length === TRACKS.length) {
        suggestedTrack = 'wgs'; // All done, suggest restart or advanced topics
      }
    }

    container.innerHTML = `
      <div class="sp-wrap">
        <div class="sp-hero">
          <div class="sp-hero-icon">${OmicsLab.Icons?.svg('target', 32) || ''}</div>
          <div>
            <h3 class="sp-hero-title">AI Study Plan Generator</h3>
            <p class="sp-hero-sub">Create a personalized learning journey with AI-powered recommendations, hands-on practice, and community support.</p>
            ${completedTracks.length > 0 ?
              `<div class="sp-progress-badge">You've completed ${completedTracks.length}/${TRACKS.length} tracks!</div>` :
              ''}
          </div>
        </div>
        <div class="sp-form">
          <div class="sp-field">
            <label class="sp-label">What do you want to learn?</label>
            <textarea class="sp-textarea" id="sp-goal" rows="3" placeholder="e.g. I want to analyse Nanopore sequencing data from TB samples in South Africa…"></textarea>
          </div>
          <div class="sp-row">
            <div class="sp-field">
              <label class="sp-label">Current level</label>
              <select class="select sp-select" id="sp-level">
                <option value="beginner">Beginner (new to bioinformatics)</option>
                <option value="intermediate" selected>Intermediate (some experience)</option>
                <option value="advanced">Advanced (researcher/clinician)</option>
              </select>
            </div>
            <div class="sp-field">
              <label class="sp-label">Available hours per week</label>
              <select class="select sp-select" id="sp-hours">
                <option value="2">2 hours/week</option>
                <option value="5" selected>5 hours/week</option>
                <option value="10">10 hours/week</option>
                <option value="20">20+ hours/week</option>
              </select>
            </div>
          </div>
          <div class="sp-field">
            <label class="sp-label">Learning focus</label>
            <select class="select sp-select" id="sp-focus">
              <option value="${suggestedTrack}" selected>Suggested: ${PLAN_TEMPLATES[suggestedTrack]?.title || 'Whole-Genome Sequencing'}</option>
              <option value="wgs">Whole-Genome Sequencing</option>
              <option value="rnaseq">RNA-seq Analysis</option>
              <option value="phylo">Phylogenomics & Outbreak Investigation</option>
              <option value="africa">Africa Genomics Specialist</option>
              <option value="custom">Custom Combination</option>
            </select>
          </div>
          <div class="sp-field">
            <label class="sp-label">Include social learning?</label>
            <select class="select sp-select" id="sp-social">
              <option value="none" selected>Individual learning</option>
              <option value="study-group">Join or create a study group</option>
              <option value="peer-review">Include peer review exercises</option>
              <option value="both">Study group + peer review</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="OmicsLab.LearningPath.generatePlan()" style="gap:.5rem">
            ${OmicsLab.Icons?.svg('zap', 16) || ''} Generate My Learning Plan
          </button>
        </div>
      </div>
    `;
  }

  function generatePlan() {
    const goal = document.getElementById('sp-goal')?.value.trim() || '';
    const level = document.getElementById('sp-level')?.value || 'intermediate';
    const hours = parseInt(document.getElementById('sp-hours')?.value || '5');
    const focus = document.getElementById('sp-focus')?.value || 'wgs';
    const social = document.getElementById('sp-social')?.value || 'none';

    // Determine template based on focus or goal analysis
    let template = PLAN_TEMPLATES.wgs;
    if (focus !== 'custom') {
      template = PLAN_TEMPLATES[focus] || PLAN_TEMPLATES.wgs;
    } else {
      // Analyze goal for custom selection (same logic as before)
      const lgoal = goal.toLowerCase();
      if (lgoal.includes('rna') || lgoal.includes('expression') || lgoal.includes('deseq'))
        template = PLAN_TEMPLATES.rnaseq;
      else if (lgoal.includes('phylo') || lgoal.includes('outbreak') || lgoal.includes('tree'))
        template = PLAN_TEMPLATES.phylo;
      else if (lgoal.includes('africa') || lgoal.includes('population') || lgoal.includes('gwas'))
        template = PLAN_TEMPLATES.africa;
    }

    // Adjust plan based on social learning preference
    let adjustedWeeks = template.weeks.map(week => ({ ...week }));

    if (social === 'study-group' || social === 'both') {
      // Add collaboration elements to each week
      adjustedWeeks = adjustedWeeks.map(week => ({
        ...week,
        collaboration: [
          { type: 'discussion', title: 'Weekly study group discussion', description: 'Discuss challenges and insights with peers' },
          { type: 'resource-sharing', title: 'Share useful resources', description: 'Post helpful articles, tools, or tips you discovered' }
        ]
      }));
    }

    if (social === 'peer-review' || social === 'both') {
      // Add peer review to appropriate weeks (typically later weeks)
      adjustedWeeks = adjustedWeeks.map((week, index) => {
        // Add peer review to weeks 3 and later for most tracks
        if (index >= 2) {
          return {
            ...week,
            peerReview: {
              title: 'Peer Review Exercise',
              description: 'Review a peer\'s work or have yours reviewed for quality improvement',
              resources: [
                { title: 'Peer review guidelines', url: '#' }
              ]
            }
          };
        }
        return week;
      });
    }

    // Adjust week count based on hours and level
    const weeksPerModule = hours >= 10 ? 0.4 : hours >= 5 ? 0.7 : 1.2;
    const baseWeeks = template.weeks.length;
    const totalWeeks = Math.ceil(
      baseWeeks * weeksPerModule *
        (level === 'beginner' ? 1.3 : level === 'advanced' ? 0.8 : 1)
    );

    const plan = {
      title: template.title,
      icon: template.icon,
      color: template.color,
      goal,
      level,
      hours,
      focus,
      social,
      createdAt: Date.now(),
      totalWeeks: Math.max(totalWeeks, baseWeeks),
      weeks: adjustedWeeks.map((w, i) => ({
        ...w,
        weekNum: i + 1,
        startDate: new Date(Date.now() + i * 7 * 86400000).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        }),
        endDate: new Date(Date.now() + (i + 1) * 7 * 86400000 - 1).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        }),
        done: false,
        // Enhanced metadata
        estimatedHours: w.estimatedHours || 2,
        completionCriteria: [
          { type: 'time', description: `Spend approximately ${w.estimatedHours || 2} hours on this week's activities` },
          { type: 'activity', description: `Complete all hands-on exercises` },
          ...(w.collaboration ? [{ type: 'collaboration', description: 'Participate in study group activities' }] : []),
          ...(w.peerReview ? [{ type: 'peer-review', description: 'Complete peer review exercise' }] : [])
        ]
      })),
    };

    _savePlan(plan);
    const wrap = document.querySelector('.sp-wrap')?.parentElement;
    if (wrap) renderStudyPlan(wrap);
    OmicsLab.Toast?.show('Learning plan generated!', 'success');
    OmicsLab.SkillTree?.awardXP('lab_step_complete', 10);

    // Suggest creating or joining a study group if social learning selected
    if (social !== 'none') {
      setTimeout(() => {
        OmicsLab.Notify?.info('Consider joining or creating a study group to enhance your learning experience!');
      }, 1500);
    }
  }

  function _renderPlanView(container, plan) {
    const doneCount = plan.weeks.filter((w) => w.done).length;
    const pct = Math.round((doneCount / plan.weeks.length) * 100);
    const estHoursDone = plan.weeks
      .filter(w => w.done)
      .reduce((sum, w) => sum + (w.estimatedHours || 2), 0);
    const estHoursTotal = plan.weeks
      .reduce((sum, w) => sum + (w.estimatedHours || 2), 0);

    container.innerHTML = `
      <div class="sp-wrap">
        <div class="sp-plan-header">
          <div class="sp-plan-icon">
            ${OmicsLab.Icons?.svg(plan.icon, 36) || ''}
          </div>
          <div>
            <h3 class="sp-plan-title">${plan.title}</h3>
            <div class="sp-plan-meta">${plan.level} · ${plan.hours}h/week · ${plan.social !== 'none' ? `Social: ${plan.social}` : 'Individual'}</div>
            <div class="sp-plan-goal">Goal: ${_esc(plan.goal)}</div>
          </div>
          <div class="sp-plan-actions">
            <button class="btn btn-outline btn-sm" onclick="localStorage.removeItem('${PLAN_KEY}');OmicsLab.LearningPath.renderStudyPlan(this.closest('.sp-wrap').parentElement)">
              New Plan
            </button>
            <button class="btn btn-outline btn-sm" onclick="OmicsLab.LearningPath.exportPlan()">
              Export Plan
            </button>
          </div>
        </div>
        <div class="sp-plan-stats">
          <div class="sp-stat">
            <div class="sp-stat-value">${pct}%</div>
            <div class="sp-stat-label">Progress</div>
          </div>
          <div class="sp-stat">
            <div class="sp-stat-value">${doneCount}/${plan.weeks.length}</div>
            <div class="sp-stat-label">Weeks</div>
          </div>
          <div class="sp-stat">
            <div class="sp-stat-value">${estHoursDone}h / ${estHoursTotal}h</div>
            <div class="sp-stat-label">Time Invested</div>
          </div>
        </div>
        <div class="sp-plan-progress">
          <div class="sp-prog-track"><div class="sp-prog-fill" style="width:${pct}%"></div></div>
          <span class="sp-prog-label">${doneCount}/${plan.weeks.length} weeks complete · ${pct}%</span>
        </div>
        <div class="sp-week-list">
          ${plan.weeks
            .map(
              (w, i) => `
            <div class="sp-week${w.done ? ' sp-week-done' : ''}">
              <div class="sp-week-header">
                <div class="sp-week-num">Week ${w.weekNum}</div>
                <div class="sp-week-date">${w.startDate} — ${w.endDate}</div>
                ${w.done ? '<span class="sp-week-complete-badge">✓</span>' : ''}
              </div>
              <div class="sp-week-body">
                <div class="sp-week-title">${w.title}</div>
                <div class="sp-week-goal">${OmicsLab.Icons?.svg('target', 12) || ''} ${w.goal}</div>
                <div class="sp-week-description">${w.description}</div>
                <div class="sp-week-meta">
                  <span class="sp-week-hours">${w.estimatedHours}h estimated</span>
                  ${w.collaboration ? `<span class="sp-week-collab">👥 Collaboration</span>` : ''}
                  ${w.peerReview ? `<span class="sp-week-peer">👁️ Peer Review</span>` : ''}
                </div>
                <div class="sp-week-modules">${w.modules
                  .map(
                    (m) => `
                  <button class="btn btn-ghost btn-xs" onclick="OmicsLab.Router?.navigate('${m}')">${m.replace(/-/g, ' ')}</button>
                `
                  )
                  .join('')}</div>
                ${w.resources && w.resources.length > 0 ? `
                <div class="sp-week-reading">${OmicsLab.Icons?.svg('file-text', 12) || ''}
                  <div class="sp-week-resources">
                    ${w.resources.map(r => `
                      <span class="sp-week-resource-item" title="${_esc(r.title)}">
                        ${r.type === 'article' ? '📄' : r.type === 'video' ? '▶️' : '🔗'}
                      </span>
                    `).join('')}
                  </div>
                </div>` : ''}
                ${w.handsOn && w.handsOn.length > 0 ? `
                <div class="sp-week-hands-on">
                  <strong>Hands-on Activities:</strong>
                  <ul>
                    ${w.handsOn.map(activity => `<li>${_esc(activity)}</li>`).join('')}
                  </ul>
                </div>` : ''}
                ${w.collaboration && w.collaboration.length > 0 ? `
                <div class="sp-week-collab-section">
                  <strong>Collaboration Activities:</strong>
                  <ul>
                    ${w.collaboration.map(collab => `
                      <li>
                        <strong>${_esc(collab.title)}</strong>: ${_esc(collab.description)}
                      </li>
                    `).join('')}
                </div>` : ''}
                ${w.peerReview ? `
                <div class="sp-week-peer-review">
                  <strong>Peer Review:</strong> ${_esc(w.peerReview.description)}
                  ${w.peerReview.resources && w.peerReview.resources.length > 0 ? `
                  <div class="sp-week-peer-resources">
                    ${w.peerReview.resources.map(r => `
                      <span class="sp-week-peer-resource-item" title="${_esc(r.title)}">
                        ${r.type === 'article' ? '📄' : r.type === 'video' ? '▶️' : '🔗'}
                      </span>
                    `).join('')}
                  </div>` : ''}
                </div>` : ''}
                <div class="sp-week-actions">
                  <button class="sp-week-check${w.done ? ' sp-check-done' : ''}"
                    onclick="OmicsLab.LearningPath.toggleWeekDone(${i})"
                    title="${w.done ? 'Mark incomplete' : 'Mark complete'}"
                    aria-label="Mark week ${w.weekNum} ${w.done ? 'incomplete' : 'complete'}">
                    ${w.done ? OmicsLab.Icons?.svg('check-circle', 18) || '[OK]' : OmicsLab.Icons?.svg('check', 18) || '○'}
                  </button>
                  ${!w.done && i > 0 && plan.weeks[i-1].done ? '' :
                    `<button class="btn btn-outline btn-sm sp-week-start"
                      onclick="OmicsLab.LearningPath.startWeek(${i})">
                      Start Week
                    </button>`}
                </div>
                <div class="sp-week-feedback${w.done ? ' sp-week-feedback-done' : ''}" style="margin-top: 1rem; min-height: 3rem;"></div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        ${plan.social !== 'none' ? `
        <div class="sp-social-section">
          <h4>${plan.social === 'study-group' || plan.social === 'both' ? 'Study Group' : 'Peer Learning'}</h4>
          <p>Enhance your learning by connecting with others who share your goals.</p>
          <div class="sp-social-actions">
            <button class="btn btn-outline" onclick="OmicsLab.LearningPath._showStudyGroupModal()">
              ${plan.social === 'study-group' || plan.social === 'both' ? 'Join/Create Study Group' : 'Find Peer Review Partners'}
            </button>
            <button class="btn btn-outline" onclick="OmicsLab.LearningPath._showLearningCommunity()">
              View Learning Community
            </button>
          </div>
        </div>
        ` : ''}
        <div class="sp-notes-section">
          <h4>Learning Notes & Reflections</h4>
          <textarea class="sp-notes-textarea" placeholder="Document your learning journey, insights, and questions here..." rows="4"></div>
          <div class="sp-notes-actions">
            <button class="btn btn-outline btn-sm" onclick="OmicsLab.LearningPath._saveLearningNotes()">Save Notes</button>
            <button class="btn btn-outline btn-sm" onclick="OmicsLab.LearningPath._exportLearningNotes()">Export Notes</button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners for week start buttons
    container.querySelectorAll('.sp-week-start').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        OmicsLab.LearningPath.startWeek(index);
      });
    });

    // Add event listener for notes textarea
    const notesTextarea = container.querySelector('.sp-notes-textarea');
    if (notesTextarea) {
      notesTextarea.addEventListener('blur', () => {
        OmicsLab.LearningPath._saveLearningNotes(notesTextarea.value);
      });
    }
  }

  function startWeek(weekIndex) {
    const plan = _loadPlan();
    if (!plan || !plan.weeks[weekIndex]) return;

    const week = plan.weeks[weekIndex];
    const feedbackContainer = document.querySelector(`.sp-week${weekIndex + 1} .sp-week-feedback`);

    if (!feedbackContainer) return;

    // Show week-specific guidance
    feedbackContainer.innerHTML = `
      <div class="sp-week-guidance">
        <h4>Getting Started with Week ${week.weekNum}</h4>
        <p><strong>Goal:</strong> ${week.goal}</p>
        <p><strong>Estimated Time:</strong> ${week.estimatedHours} hours</p>
        <div class="sp-week-checklist">
          <strong>This week you will:</strong>
          <ul>
            ${week.modules.map(module => `<li>Complete the ${module.replace(/-/g, ' ')} module</li>`).join('')}
            ${week.resources && week.resources.length > 0 ? `
            <li>Review the recommended reading materials</li>` : ''}
            ${week.handsOn && week.handsOn.length > 0 ? `
            <li>Complete the hands-on activities</li>` : ''}
            ${week.collaboration && week.collaboration.length > 0 ? `
            <li>Engage in collaboration activities</li>` : ''}
            ${week.peerReview ? `<li>Participate in peer review exercise</li>` : ''}
          </ul>
        </div>
        <div class="sp-week-tips">
          <strong>Tips for success:</strong>
          <ul>
            <li>Schedule your learning time in advance</li>
            <li>Take breaks to maintain focus</li>
            <li>Apply what you learn immediately</li>
            <li>Connect concepts to your research or interests</li>
          </ul>
        </div>
        <button class="btn btn-primary btn-sm" onclick="OmicsLab.LearningPath.completeWeekActivity(${weekIndex})">
          I've Completed This Week's Activities
        </button>
      </div>
    `;
  }

  function completeWeekActivity(weekIndex) {
    const plan = _loadPlan();
    if (!plan || !plan.weeks[weekIndex]) return;

    // Simple completion - in reality, this would check specific criteria
    plan.weeks[weekIndex].done = true;
    _savePlan(plan);

    // Award points for completion
    OmicsLab.SkillTree?.awardXP('lab_step_complete', 15 * (weekIndex + 1));

    // Check for streak achievements
    const completedCount = plan.weeks.filter(w => w.done).length;
    if (completedCount >= 3 && weekIndex >= 2) {
      // Check if last 3 weeks are consecutive
      const lastThreeDone = plan.weeks.slice(Math.max(0, weekIndex - 2), weekIndex + 1).every(w => w.done);
      if (lastThreeDone) {
        _addAchievement(`weekly_streak_${completedCount}`);
      }
    }

    const wrap = document.querySelector('.sp-wrap')?.parentElement;
    if (wrap) renderStudyPlan(wrap);

    OmicsLab.Toast?.show(`Week ${plan.weeks[weekIndex].weekNum} completed!`, 'success');

    // Show celebration
    const feedbackContainer = document.querySelector(`.sp-week${weekIndex + 1} .sp-week-feedback`);
    if (feedbackContainer) {
      feedbackContainer.innerHTML = `
        <div class="sp-week-celebration">
          <h3>🎉 Week Completed!</h3>
          <p>You've successfully finished Week ${plan.weeks[weekIndex].weekNum}: ${plan.weeks[weekIndex].title}</p>
          <p>Keep up the great work!</p>
          <button class="btn btn-outline" onclick="OmicsLab.LearningPath.startWeek(${weekIndex + 1})">
            ${weekIndex + 1 < plan.weeks.length ? 'Start Next Week' : 'Review Completed Week'}
          </button>
        </div>
      `;
    }
  }

  function toggleWeekDone(index) {
    const plan = _loadPlan();
    if (!plan || !plan.weeks[index]) return;
    plan.weeks[index].done = !plan.weeks[index].done;
    _savePlan(plan);
    if (plan.weeks[index].done) OmicsLab.SkillTree?.awardXP('lab_step_complete', 5);
    const wrap = document.querySelector('.sp-wrap')?.parentElement;
    if (wrap) renderStudyPlan(wrap);
  }

  function exportPlan() {
    const plan = _loadPlan();
    if (!plan) return;

    const lines = [
      `OmicsLab Learning Plan — ${plan.title}`,
      `========================================`,
      `Goal: ${plan.goal}`,
      `Level: ${plan.level} · ${plan.hours}h/week`,
      `Focus: ${plan.focus}`,
      `Social Learning: ${plan.social}`,
      `Created: ${new Date(plan.createdAt).toLocaleDateString()}`,
      '',
      `Weekly Breakdown:`,
      ``
    ];

    plan.weeks.forEach((week, i) => {
      lines.push(
        `Week ${week.weekNum}: ${week.title}`,
        `  Period: ${week.startDate} - ${week.endDate}`,
        `  Goal: ${week.goal}`,
        `  Description: ${week.description}`,
        `  Estimated Hours: ${week.estimatedHours || 2}`,
        `  Modules: ${week.modules.join(', ')}`,
        week.resources && week.resources.length > 0 ?
          `  Resources: ${week.resources.map(r => r.title).join(', ')}` : '',
        week.handsOn && week.handsOn.length > 0 ?
          `  Hands-on: ${week.handsOn.join(', ')}` : '',
        week.collaboration && week.collaboration.length > 0 ?
          `  Collaboration: ${week.collaboration.map(c => c.title).join(', ')}` : '',
        week.peerReview ?
          `  Peer Review: ${week.peerReview.description}` : '',
        week.done ? `  Status: COMPLETED` : `  Status: PENDING`,
        ``
      );
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `omicslab-learning-plan-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function _showStudyGroupModal() {
    // Simple implementation - in reality, this would connect to backend
    const modalHTML = `
      <div class="lp-modal-backdrop" id="lp-study-group-modal">
        <div class="lp-modal-content">
          <div class="lp-modal-header">
            <h3>Study Groups</h3>
            <button class="lp-modal-close" onclick="OmicsLab.LearningPath._closeModal('lp-study-group-modal')">&times;</button>
          </div>
          <div class="lp-modal-body">
            <p>Study groups allow you to learn collaboratively with peers who share similar goals.</p>
            <div class="lp-social-options">
              <button class="btn btn-outline" onclick="OmicsLab.LearningPath._createStudyGroup()">
                Create New Study Group
              </button>
              <button class="btn btn-outline" onclick="OmicsLab.LearningPath._joinStudyGroup()">
                Join Existing Study Group
              </button>
            </div>
            <div class="lp-study-group-info" id="lp-study-group-info">
              <!-- Study group info will be loaded here -->
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('lp-study-group-modal');
    if (existingModal) existingModal.remove();

    // Add new modal
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv);

    // Load study group info
    setTimeout(() => {
      OmicsLab.LearningPath._loadStudyGroupInfo();
    }, 100);
  }

  function _loadStudyGroupInfo() {
    const infoContainer = document.getElementById('lp-study-group-info');
    if (!infoContainer) return;

    // Get saved study groups or show empty state
    const studyGroups = JSON.parse(localStorage.getItem(STUDY_GROUP_KEY) || '[]');

    if (studyGroups.length === 0) {
      infoContainer.innerHTML = `
        <div class="lp-empty-state">
          <h4>No Study Groups Yet</h4>
          <p>Be the first to create a study group for your learning journey!</p>
          <p>Study groups help you:</p>
          <ul>
            <li>Stay motivated and accountable</li>
            <li>Share insights and resources</li>
            <li>Learn from different perspectives</li>
            <li>Tackle challenging concepts together</li>
          </ul>
        </div>
      `;
    } else {
      infoContainer.innerHTML = `
        <h4>Your Study Groups</h4>
        <div class="lp-study-group-list">
          ${studyGroups.map(group => `
            <div class="lp-study-group-item">
              <h5>${_esc(group.name)}</h5>
              <p>${_esc(group.description)}</p>
              <div class="lp-study-group-meta">
                <span>${group.memberCount} members</span>
                <span>${group.focus}</span>
              </div>
              <div class="lp-study-group-actions">
                <button class="btn btn-outline btn-sm" onclick="OmicsLab.LearningPath._viewStudyGroup(${group.id})">
                  View Group
                </button>
                <button class="btn btn-outline btn-sm" onclick="OmicsLab.LearningPath._leaveStudyGroup(${group.id})">
                  Leave Group
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  function _createStudyGroup() {
    // Simple implementation
    const groupName = prompt('Enter a name for your study group:');
    if (!groupName || groupName.trim() === '') return;

    const groupDescription = prompt('Enter a description for your study group:');
    const focus = prompt('What is the main focus of your study group? (e.g., WGS, RNA-seq, etc.)');

    const studyGroups = JSON.parse(localStorage.getItem(STUDY_GROUP_KEY) || '[]');
    const newGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      description: groupDescription || '',
      focus: focus || 'General',
      memberCount: 1,
      createdAt: Date.now(),
      members: [localStorage.getItem('omicslab_profile_name') || 'Anonymous']
    };

    studyGroups.push(newGroup);
    localStorage.setItem(STUDY_GROUP_KEY, JSON.stringify(studyGroups));

    OmicsLab.Notify?.success(`Study group "${groupName}" created!`);
    OmicsLab.LearningPath._loadStudyGroupInfo();
  }

  function _joinStudyGroup() {
    OmicsLab.Notify?.info('Join study group functionality would connect to our community platform in a full implementation.');
  }

  function _viewStudyGroup(groupId) {
    OmicsLab.Notify?.info('View study group functionality would show detailed group information and activities.');
  }

  function _leaveStudyGroup(groupId) {
    const studyGroups = JSON.parse(localStorage.getItem(STUDY_GROUP_KEY) || '[]');
    const updatedGroups = studyGroups.filter(group => group.id !== groupId);
    localStorage.setItem(STUDY_GROUP_KEY, JSON.stringify(updatedGroups));
    OmicsLab.Notify?.info('You have left the study group.');
    OmicsLab.LearningPath._loadStudyGroupInfo();
  }

  function _closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
  }

  function _showLearningCommunity() {
    OmicsLab.Notify?.info('Learning community functionality would connect to our global network of learners.');
  }

  function _saveLearningNotes(notes) {
    const plan = _loadPlan();
    if (!plan) return;

    const notesKey = `omicslab_learning_notes_${plan.createdAt}`;
    localStorage.setItem(notesKey, notes || '');
    OmicsLab.Notify?.success('Learning notes saved!');
  }

  function _exportLearningNotes() {
    const plan = _loadPlan();
    if (!plan) return;

    const notesKey = `omicslab_learning_notes_${plan.createdAt}`;
    const notes = localStorage.getItem(notesKey) || '';

    if (!notes || notes.trim() === '') {
      OmicsLab.Notify?.warning('No notes to export.');
      return;
    }

    const blob = new Blob([notes], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `omicslab-learning-notes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ─── Init — called from router on profile page ─── */
  function init(container) {
    if (!container) {
      let wrap = document.getElementById('lp-section');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'lp-section';
        const profileContent = document.getElementById('profile-page-content');
        if (profileContent) profileContent.appendChild(wrap);
        else return;
      }
      render(wrap);
    } else {
      render(container);
    }

    // Check for achievements on init
    setTimeout(() => {
      _checkAchievements();
    }, 500);
  }

  return {
    init,
    render,
    renderStudyPlan,
    generatePlan,
    toggleWeekDone,
    exportPlan,
    startWeek,
    completeWeekActivity,
    _markComplete,
    _getProgress,
    _showNodeDetails,
    _checkAchievements,
    _addAchievement
  };
})();