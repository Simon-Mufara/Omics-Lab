/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Multiplayer Quiz Battle (Prompt 18)
   Two players compete via BroadcastChannel (same device) or
   single-player mode. 10-question timed rounds, 100+ question bank.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.QuizBattle = (function () {

  /* ─── 100+ question bank ─── */
  const QUESTIONS = [
    /* ══ DNA Extraction ══ */
    { q:'What does CTAB stand for in plant and fungal DNA extraction?', options:['Cetyl Trimethyl Ammonium Bromide','Chloroform Tris Ammonium Buffer','Cation Transfer Amine Buffer','Centrifuge Tris Acid Buffer'], answer:0, cat:'Lab Techniques', pts:10 },
    { q:'Which enzyme degrades RNA contaminants after DNA extraction?', options:['DNase I','Proteinase K','RNase A','Lysozyme'], answer:2, cat:'Lab Techniques', pts:10 },
    { q:'The Nanodrop 260/280 ratio for pure DNA should be approximately:', options:['1.5','1.8','2.0','1.2'], answer:1, cat:'QC Metrics', pts:10 },
    { q:'What does a 260/230 ratio below 1.8 indicate?', options:['RNA contamination','Protein contamination','Salt/guanidinium contamination','Degraded DNA'], answer:2, cat:'QC Metrics', pts:10 },
    { q:'Agarose gel electrophoresis runs DNA from:', options:['Positive to negative pole','Negative to positive pole','Both directions simultaneously','Direction depends on buffer'], answer:1, cat:'Lab Techniques', pts:10 },

    /* ══ Library Preparation ══ */
    { q:'What is the purpose of end-repair in Illumina library preparation?', options:['Add A-tails to fragments','Convert 5\' overhangs to blunt ends','Ligate sequencing adapters','Size-select fragments'], answer:1, cat:'Library Prep', pts:10 },
    { q:'In Nextera library prep, tagmentation performs which two steps simultaneously?', options:['PCR amplification and ligation','Fragmentation and adapter ligation','Size selection and quantification','Denaturation and hybridisation'], answer:1, cat:'Library Prep', pts:15 },
    { q:'PCR duplicates in sequencing libraries arise from:', options:['Index hopping','Adapter dimer formation','Amplification of identical fragments','GC bias in sequencing'], answer:2, cat:'Library Prep', pts:10 },
    { q:'What is the recommended minimum insert size for paired-end Illumina sequencing?', options:['50 bp','100 bp','150 bp','300 bp'], answer:2, cat:'Library Prep', pts:10 },

    /* ══ Sequencing ══ */
    { q:'Illumina sequencing uses which chemistry?', options:['Pyrosequencing','Sequencing by synthesis (SBS)','Nanopore translocation','Single molecule real-time (SMRT)'], answer:1, cat:'Sequencing', pts:10 },
    { q:'Oxford Nanopore sequencing has which major advantage over Illumina?', options:['Lower error rate','Higher throughput','Ultra-long reads (>100 kb)','Lower cost per Gb'], answer:2, cat:'Sequencing', pts:10 },
    { q:'PacBio HiFi reads achieve ~99.9% accuracy through:', options:['Error correction with short reads','Circular consensus sequencing (CCS)','Higher optical resolution','Real-time error correction'], answer:1, cat:'Sequencing', pts:15 },
    { q:'A FASTQ quality score of Q30 means one error per:', options:['100 bases','1,000 bases','10,000 bases','100,000 bases'], answer:1, cat:'QC Metrics', pts:10 },
    { q:'Which FASTQ quality score is the minimum threshold recommended for variant calling?', options:['Q10','Q20','Q30','Q40'], answer:2, cat:'QC Metrics', pts:10 },

    /* ══ Alignment ══ */
    { q:'BWA-MEM is optimised for reads of which length?', options:['< 50 bp','70–1000 bp','> 1 kb','Any length'], answer:1, cat:'Bioinformatics', pts:10 },
    { q:'What does MAPQ 0 in a SAM/BAM file indicate?', options:['Perfect alignment','Multi-mapping read','Unmapped read','Low quality base'], answer:1, cat:'Bioinformatics', pts:15 },
    { q:'The SAM flag 0x4 indicates:', options:['Read is reverse complemented','Read is unmapped','Mate is unmapped','Read failed quality filter'], answer:1, cat:'Bioinformatics', pts:15 },
    { q:'STAR aligner was specifically designed for:', options:['DNA read alignment','RNA-seq spliced alignment','Long-read alignment','Metagenomic classification'], answer:1, cat:'Bioinformatics', pts:10 },
    { q:'Duplicate marking tools (e.g., Picard MarkDuplicates) primarily address duplicates arising from:', options:['PCR amplification during library prep','Optical clustering on flowcell','Index hopping','Alignment ambiguity'], answer:0, cat:'Bioinformatics', pts:10 },

    /* ══ Variant Calling ══ */
    { q:'GATK HaplotypeCaller performs variant calling by:', options:['Direct comparison to reference','Local de novo assembly at candidate sites','Hidden Markov Model across whole chromosome','k-mer counting'], answer:1, cat:'Variant Calling', pts:15 },
    { q:'What is a VCF file?', options:['Variant Call Format — stores genotype and variant information','Virtual Chromosome File — stores alignment data','Variant Confidence File — stores quality metrics','Validated Coding File — stores annotated variants'], answer:0, cat:'Bioinformatics', pts:10 },
    { q:'The VQSR (Variant Quality Score Recalibration) step in GATK requires:', options:['A VCF of known variants for training','At least 1000 samples','A specific read depth threshold','Matched normal sample'], answer:0, cat:'Variant Calling', pts:15 },
    { q:'Which annotation tool predicts the functional impact of missense variants?', options:['BWA-MEM','SnpEff / VEP','MultiQC','Trimmomatic'], answer:1, cat:'Variant Calling', pts:10 },
    { q:'Transition/Transversion ratio (Ti/Tv) for whole exome sequencing in humans should be approximately:', options:['1.5–2.0','2.5–3.0','0.5–1.0','4.0–5.0'], answer:1, cat:'QC Metrics', pts:15 },

    /* ══ RNA-seq ══ */
    { q:'Which DESeq2 input is required?', options:['RPKM-normalised expression matrix','Raw count matrix','Log2-transformed TPM values','Normalised read depth per base'], answer:1, cat:'RNA-seq', pts:10 },
    { q:'What is the main advantage of salmon/kallisto over alignment-based quantification?', options:['Higher accuracy','Orders of magnitude faster (pseudo-alignment)','Works with long reads','Accounts for splicing'], answer:1, cat:'RNA-seq', pts:10 },
    { q:'A volcano plot x-axis represents:', options:['p-value','log2 Fold Change','–log10(p-adj)','Mean expression'], answer:1, cat:'RNA-seq', pts:10 },
    { q:'Batch effects in RNA-seq are best corrected using:', options:['Additional PCR cycles','ComBat or limma removeBatchEffect','Higher sequencing depth','Longer read length'], answer:1, cat:'RNA-seq', pts:10 },
    { q:'TPM (Transcripts Per Million) differs from RPKM/FPKM because:', options:['It accounts for strand bias','TPM values sum to 1 million per sample, enabling cross-sample comparison','It uses insert size for normalisation','It corrects for GC content'], answer:1, cat:'RNA-seq', pts:15 },

    /* ══ Metagenomics ══ */
    { q:'Kraken2 classifies metagenomic reads using:', options:['BLAST alignment','k-mer exact matching to a taxonomic database','Hidden Markov Models','Protein-level alignment'], answer:1, cat:'Metagenomics', pts:10 },
    { q:'16S rRNA gene metagenomics targets which hypervariable regions for diversity assessment?', options:['V1–V2','V3–V4','V6–V8','Any region works equally'], answer:1, cat:'Metagenomics', pts:10 },
    { q:'Alpha diversity measures:', options:['Diversity within a single sample','Diversity between samples','Phylogenetic distance to reference','Relative abundance of dominant species'], answer:0, cat:'Metagenomics', pts:10 },
    { q:'Shotgun metagenomics vs 16S amplicon sequencing: shotgun provides:', options:['Lower cost','Higher sensitivity for rare taxa','Functional gene information and species-level resolution','Simpler bioinformatics pipeline'], answer:2, cat:'Metagenomics', pts:15 },

    /* ══ ATAC-seq ══ */
    { q:'ATAC-seq measures:', options:['Histone modifications','Transcription factor binding','Chromatin accessibility (open chromatin regions)','mRNA abundance'], answer:2, cat:'ATAC-seq', pts:10 },
    { q:'The Tn5 transposase in ATAC-seq preferentially inserts at:', options:['Repetitive elements','Transcription start sites','Open chromatin regions','Centromeres'], answer:2, cat:'ATAC-seq', pts:10 },
    { q:'The nucleosome-free region (NFR) in ATAC-seq corresponds to fragments of:', options:['< 100 bp','147–200 bp (mono-nucleosome)','> 400 bp','200–300 bp (di-nucleosome)'], answer:0, cat:'ATAC-seq', pts:15 },
    { q:'MACS2 is used in ATAC-seq to:', options:['Align reads to genome','Call peaks of open chromatin','Annotate transcription factor motifs','Remove PCR duplicates'], answer:1, cat:'ATAC-seq', pts:10 },

    /* ══ African Genomics ══ */
    { q:'H3Africa stands for:', options:['Human Heredity and Health in Africa','Hereditary Haematological Health in Africa','Helminth, Hepatitis and HIV in Africa','Human Genome Health Hub Africa'], answer:0, cat:'African Genomics', pts:10 },
    { q:'The AWI-Gen study collected data from how many African countries?', options:['3','6','9','12'], answer:1, cat:'African Genomics', pts:10 },
    { q:'Which country has the world\'s highest burden of XDR-TB?', options:['India','Russia','South Africa','China'], answer:2, cat:'African Genomics', pts:10 },
    { q:'Omicron was first characterised by scientists at which institution?', options:['Wellcome Sanger Institute','KEMRI Kenya','KRISP / NGS-SA, South Africa','ACEGID Nigeria'], answer:2, cat:'African Genomics', pts:10 },
    { q:'The kelch13 C580Y mutation in Plasmodium falciparum confers resistance to:', options:['Chloroquine','Artemisinin','Lumefantrine','Pyrimethamine'], answer:1, cat:'African Genomics', pts:15 },
    { q:'Sickle cell trait (HbAS) provides approximately what percentage protection against severe malaria?', options:['30%','60%','90%','50%'], answer:2, cat:'African Genomics', pts:15 },
    { q:'The San people of southern Africa are significant in genomics because:', options:['They have the lowest disease burden in Africa','They represent the oldest diverging human lineage with the highest known human genetic diversity','They pioneered community consent frameworks','They have resistance to HIV'], answer:1, cat:'African Genomics', pts:15 },
    { q:'Which African country first described XDR-TB as a clinical syndrome in 2006?', options:['Nigeria','Kenya','South Africa','Ethiopia'], answer:2, cat:'African Genomics', pts:10 },
    { q:'MalariaGEN is a global consortium focused on:', options:['Malaria drug development','Genomic surveillance of Plasmodium and Anopheles populations','Malaria vaccine trials','Malaria elimination in Africa'], answer:1, cat:'African Genomics', pts:10 },
    { q:'The concept of "parachute science" in African genomics refers to:', options:['Rapid data upload to cloud servers','Foreign researchers collecting data in Africa without capacity building or community benefit','Drone-based sample collection in remote areas','Satellite communication for genomic data transfer'], answer:1, cat:'Ethics', pts:10 },

    /* ══ Bioinformatics ══ */
    { q:'What does FAIR data stand for?', options:['Fast, Accurate, Indexed, Reproducible','Findable, Accessible, Interoperable, Reusable','Formatted, Annotated, Integrated, Referenced','Free, Archived, Imputed, Reliable'], answer:1, cat:'Bioinformatics', pts:10 },
    { q:'A Snakemake workflow provides:', options:['Graphical pipeline builder','Reproducible, provenance-tracked bioinformatics workflows','Cloud computing integration only','Variant annotation'], answer:1, cat:'Bioinformatics', pts:10 },
    { q:'The Phred quality score Q20 represents an error probability of:', options:['1 in 100','1 in 1,000','1 in 10,000','1 in 20'], answer:0, cat:'QC Metrics', pts:10 },
    { q:'What is the purpose of fastp in a WGS pipeline?', options:['Variant annotation','Read trimming and QC','Genome assembly','Taxonomic classification'], answer:1, cat:'Bioinformatics', pts:10 },
    { q:'Which reference genome build is currently recommended for human WGS analysis?', options:['hg19 (GRCh37)','hg38 (GRCh38/GRCh38.p14)','GRCh36','T2T-CHM13 only'], answer:1, cat:'Bioinformatics', pts:10 },
    { q:'BEDTools is used for:', options:['Sequence alignment','Genomic interval operations (intersect, merge, coverage)','Variant calling','Sequence assembly'], answer:1, cat:'Bioinformatics', pts:10 },
    { q:'What does the N50 statistic measure in genome assembly?', options:['Average contig length','Contig length at which 50% of the assembly is in contigs of that length or longer','Number of contigs','Percentage of genome assembled'], answer:1, cat:'Bioinformatics', pts:15 },
    { q:'The NCBI SRA accession format for a project is:', options:['ERR','SRR','PRJNA/PRJEB','GSE'], answer:2, cat:'Bioinformatics', pts:10 },

    /* ══ Statistics ══ */
    { q:'The Benjamini-Hochberg procedure controls for:', options:['Type I error (family-wise)','False Discovery Rate (FDR)','Statistical power','Effect size inflation'], answer:1, cat:'Statistics', pts:10 },
    { q:'A GWAS p-value threshold of 5×10⁻⁸ accounts for approximately how many independent tests?', options:['100,000','500,000 (1 million / ~2 for LD)','10,000,000','1,000'], answer:1, cat:'Statistics', pts:15 },
    { q:'Principal Component Analysis (PCA) in genomics is used to:', options:['Call variants','Visualise and correct for population stratification','Measure alpha diversity','Calculate read depth'], answer:1, cat:'Statistics', pts:10 },
    { q:'A Manhattan plot visualises:', options:['RNA expression across chromosomes','GWAS p-values by genomic position','Phylogenetic tree layout','Chromatin accessibility peaks'], answer:1, cat:'Statistics', pts:10 },
  ];

  /* ─── State ─── */
  let _state = {
    mode: null,        /* 'solo' | 'host' | 'guest' */
    questions: [],     /* shuffled subset */
    currentQ: 0,
    scores: { p1: 0, p2: 0 },
    names: { p1: 'Player 1', p2: 'Player 2' },
    answered: false,
    timer: null,
    timeLeft: 20,
    p2Answered: false,
    p2Answer: null,
    bc: null,
    sessionId: null,
  };

  const N_QUESTIONS = 10;
  const TIME_PER_Q  = 20;

  /* ─── Shuffle ─── */
  function _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ─── Pick balanced question set (max 2 per category) ─── */
  function _pickQuestions() {
    const cats = {};
    const selected = [];
    const shuffled = _shuffle(QUESTIONS);
    for (const q of shuffled) {
      if (selected.length >= N_QUESTIONS) break;
      cats[q.cat] = (cats[q.cat] || 0);
      if (cats[q.cat] < 2) { selected.push(q); cats[q.cat]++; }
    }
    /* Fill remaining spots if not enough categories */
    if (selected.length < N_QUESTIONS) {
      for (const q of shuffled) {
        if (!selected.includes(q)) { selected.push(q); if (selected.length >= N_QUESTIONS) break; }
      }
    }
    return selected.slice(0, N_QUESTIONS);
  }

  /* ─── Render current question ─── */
  function _renderQuestion() {
    const q = _state.questions[_state.currentQ];
    if (!q) return;
    const qEl    = document.getElementById('qb-question');
    const optEl  = document.getElementById('qb-options');
    const numEl  = document.getElementById('qb-qnum');
    const timerEl = document.getElementById('qb-timer');
    const catEl  = document.getElementById('qb-cat');

    if (numEl) numEl.textContent = `Question ${_state.currentQ + 1} / ${N_QUESTIONS}`;
    if (catEl) catEl.textContent = q.cat;
    if (qEl)  qEl.textContent = q.q;
    if (timerEl) { timerEl.textContent = _state.timeLeft; timerEl.style.color = _state.timeLeft <= 5 ? '#ff6b6b' : '#e6edf3'; }

    if (optEl) {
      optEl.innerHTML = q.options.map((opt, i) => `
        <button class="qb-opt" data-idx="${i}" onclick="OmicsLab.QuizBattle._answer(${i})">
          <span class="qb-opt-letter">${'ABCD'[i]}</span>
          <span class="qb-opt-text">${opt}</span>
        </button>`).join('');
    }

    _state.answered = false;
    _state.p2Answered = false;
    _state.p2Answer = null;

    /* Broadcast question to P2 if host */
    if (_state.mode === 'host' && _state.bc) {
      _state.bc.postMessage({ type: 'QUESTION', qIdx: _state.currentQ });
    }

    /* Start timer */
    clearInterval(_state.timer);
    _state.timeLeft = TIME_PER_Q;
    _state.timer = setInterval(() => {
      _state.timeLeft--;
      const te = document.getElementById('qb-timer');
      if (te) { te.textContent = _state.timeLeft; te.style.color = _state.timeLeft <= 5 ? '#ff6b6b' : '#e6edf3'; }
      if (_state.timeLeft <= 0) {
        clearInterval(_state.timer);
        if (!_state.answered) _revealAnswer(-1);
      }
    }, 1000);
  }

  /* ─── Answer ─── */
  function _answer(idx) {
    if (_state.answered) return;
    _state.answered = true;
    clearInterval(_state.timer);
    const q = _state.questions[_state.currentQ];
    const correct = idx === q.answer;
    const pts = correct ? q.pts : 0;

    if (_state.mode !== 'guest') _state.scores.p1 += pts;

    /* Broadcast P1 answer if host */
    if (_state.mode === 'host' && _state.bc) {
      _state.bc.postMessage({ type: 'P1_ANSWER', idx, correct });
    }
    /* If guest, send answer to host */
    if (_state.mode === 'guest' && _state.bc) {
      _state.bc.postMessage({ type: 'P2_ANSWER', idx, correct, pts });
      _state.scores.p2 += pts;
    }

    _revealAnswer(idx);
  }

  function _revealAnswer(chosen) {
    const q = _state.questions[_state.currentQ];
    const opts = document.querySelectorAll('.qb-opt');
    opts.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.answer) btn.classList.add('qb-opt-correct');
      else if (i === chosen) btn.classList.add('qb-opt-wrong');
    });

    const fb = document.getElementById('qb-feedback');
    if (fb) {
      const correct = chosen === q.answer;
      fb.textContent = chosen === -1 ? `⏱ Time up! Answer: ${q.options[q.answer]}` : correct ? `[OK] Correct! +${q.pts} pts` : `[FAIL] Wrong. Answer: ${q.options[q.answer]}`;
      fb.style.color = chosen === -1 ? '#e3b341' : correct ? '#3fb950' : '#ff6b6b';
    }

    _updateScoreboard();
    setTimeout(_nextQuestion, 1800);
  }

  /* ─── Next question ─── */
  function _nextQuestion() {
    _state.currentQ++;
    const fb = document.getElementById('qb-feedback');
    if (fb) fb.textContent = '';
    if (_state.currentQ >= N_QUESTIONS) {
      _endGame();
    } else {
      _renderQuestion();
    }
  }

  /* ─── Update scoreboard ─── */
  function _updateScoreboard() {
    const p1El = document.getElementById('qb-score-p1');
    const p2El = document.getElementById('qb-score-p2');
    if (p1El) p1El.textContent = _state.scores.p1;
    if (p2El) p2El.textContent = _state.scores.p2;
  }

  /* ─── End game ─── */
  function _endGame() {
    clearInterval(_state.timer);
    const gameEl = document.getElementById('qb-game');
    if (!gameEl) return;
    const p1 = _state.scores.p1, p2 = _state.scores.p2;
    const winner = p1 > p2 ? _state.names.p1 : p2 > p1 ? _state.names.p2 : 'Tie!';
    const solo = _state.mode === 'solo';
    const pct = Math.round((p1 / (N_QUESTIONS * 15)) * 100);

    gameEl.innerHTML = `
      <div class="qb-end-screen">
        <div class="qb-end-title">${solo ? 'Quiz Complete!' : `${OmicsLab.Icons?.svg('award',20)||''} Game Over!`}</div>
        ${solo ? `
          <div class="qb-end-score">${p1} <span class="qb-end-max">/ ${N_QUESTIONS * 15} pts</span></div>
          <div class="qb-end-pct">${pct}% correct</div>
          <div class="qb-end-grade" style="color:${pct>=80?'#3fb950':pct>=60?'#e3b341':'#ff6b6b'}">${pct>=80?'Excellent — Expert level!':pct>=60?'Good — Keep practising!':'Needs work — Try again!'}</div>
        ` : `
          <div class="qb-end-dual">
            <div class="qb-end-player ${p1>p2?'qb-end-winner':''}"><div>${_state.names.p1}</div><div class="qb-end-pscore">${p1}</div></div>
            <div class="qb-end-vs">vs</div>
            <div class="qb-end-player ${p2>p1?'qb-end-winner':''}"><div>${_state.names.p2}</div><div class="qb-end-pscore">${p2}</div></div>
          </div>
          <div class="qb-end-winner-lbl">${winner === 'Tie!' ? `${OmicsLab.Icons?.svg('check-circle',16)||''} It's a Tie!` : `${OmicsLab.Icons?.svg('award',16)||''} ${winner} wins!`}</div>
        `}
        <button class="qb-restart-btn" onclick="OmicsLab.QuizBattle._restart()">Play Again</button>
      </div>`;
  }

  function _restart() {
    if (_state.bc) { try { _state.bc.close(); } catch {} _state.bc = null; }
    _render(document.getElementById('quizbattle-section'));
  }

  /* ─── Start solo ─── */
  function _startSolo() {
    const name = document.getElementById('qb-p1-name')?.value?.trim() || 'Player 1';
    _state = { ..._state, mode: 'solo', questions: _pickQuestions(), currentQ: 0, scores: { p1: 0, p2: 0 }, names: { p1: name, p2: '' }, answered: false, bc: null };
    _renderGame(false);
    _renderQuestion();
  }

  /* ─── Start multiplayer (BroadcastChannel) ─── */
  function _startMulti() {
    const p1name = document.getElementById('qb-p1-name')?.value?.trim() || 'Player 1';
    const p2name = document.getElementById('qb-p2-name')?.value?.trim() || 'Player 2';
    const sid = 'qb_' + Math.random().toString(36).slice(2, 8);
    _state = { ..._state, mode: 'host', questions: _pickQuestions(), currentQ: 0, scores: { p1: 0, p2: 0 }, names: { p1: p1name, p2: p2name }, answered: false, sessionId: sid };

    _state.bc = new BroadcastChannel(sid);
    _state.bc.onmessage = e => {
      const msg = e.data;
      if (msg.type === 'P2_ANSWER') {
        _state.scores.p2 += (msg.pts || 0);
        _updateScoreboard();
      }
      if (msg.type === 'GUEST_READY') {
        const s = document.getElementById('qb-multi-status');
        if (s) s.textContent = `[OK] ${p2name} connected!`;
      }
    };

    _renderGame(true);
    /* Show session ID for P2 to join in another tab */
    const sessEl = document.getElementById('qb-session-info');
    if (sessEl) sessEl.innerHTML = `<div class="qb-session-box">Share this code with Player 2 (same device, other tab): <strong class="qb-session-code">${sid}</strong> · P2 tab: open OmicsLab → Quiz Battle → Join as Guest → paste code</div>`;
    _renderQuestion();
  }

  function _joinAsGuest() {
    const code = document.getElementById('qb-guest-code')?.value?.trim();
    const p2name = document.getElementById('qb-p2-name-guest')?.value?.trim() || 'Player 2';
    if (!code) return;
    _state = { ..._state, mode: 'guest', questions: _pickQuestions(), currentQ: 0, scores: { p1: 0, p2: 0 }, names: { p1: 'Host', p2: p2name }, answered: false, sessionId: code };

    _state.bc = new BroadcastChannel(code);
    _state.bc.postMessage({ type: 'GUEST_READY' });
    _state.bc.onmessage = e => {
      const msg = e.data;
      if (msg.type === 'QUESTION') {
        _state.currentQ = msg.qIdx;
        _renderQuestion();
      }
      if (msg.type === 'P1_ANSWER') {
        _state.scores.p1 += msg.correct ? (_state.questions[_state.currentQ]?.pts || 10) : 0;
        _updateScoreboard();
      }
    };
    _renderGame(true);
  }

  /* ─── Render game board ─── */
  function _renderGame(dual) {
    const section = document.getElementById('quizbattle-section');
    if (!section) return;
    section.innerHTML = `
      <div class="qb-wrap">
        <div class="qb-scoreboard">
          <div class="qb-player-card qb-p1">
            <div class="qb-player-name">${_state.names.p1}</div>
            <div class="qb-player-score" id="qb-score-p1">0</div>
          </div>
          <div class="qb-vs-mid">
            <div class="qb-qnum" id="qb-qnum">Question 1 / ${N_QUESTIONS}</div>
            <div class="qb-timer-ring"><div class="qb-timer" id="qb-timer">${TIME_PER_Q}</div></div>
          </div>
          ${dual ? `<div class="qb-player-card qb-p2">
            <div class="qb-player-name">${_state.names.p2}</div>
            <div class="qb-player-score" id="qb-score-p2">0</div>
          </div>` : '<div class="qb-player-card qb-p2" style="opacity:0"></div>'}
        </div>
        <div id="qb-session-info"></div>
        <div id="qb-game" class="qb-game">
          <div class="qb-cat-badge" id="qb-cat"></div>
          <div class="qb-question" id="qb-question"></div>
          <div class="qb-options" id="qb-options"></div>
          <div class="qb-feedback" id="qb-feedback"></div>
        </div>
      </div>`;
  }

  /* ─── Main init / lobby ─── */
  function _render(section) {
    section.innerHTML = `
      <div class="qb-wrap">
        <div class="qb-header">
          <div class="qb-badge">QUIZ BATTLE</div>
          <h2 class="qb-title">Multiplayer Quiz Battle</h2>
          <p class="qb-subtitle">${QUESTIONS.length}+ questions across 12 categories. Solo practice or same-device multiplayer via BroadcastChannel. ${TIME_PER_Q} seconds per question.</p>
        </div>

        <div class="qb-lobby">
          <!-- Solo -->
          <div class="qb-mode-card">
            <div class="qb-mode-icon">${OmicsLab.Icons?.svg('dna',28)||''}</div>
            <div class="qb-mode-title">Solo Practice</div>
            <div class="qb-mode-desc">${N_QUESTIONS} questions · timed · scored</div>
            <input type="text" id="qb-p1-name" class="qb-name-inp" placeholder="Your name" value="Researcher">
            <button class="qb-start-btn" onclick="OmicsLab.QuizBattle._startSolo()">Start Solo →</button>
          </div>

          <!-- Multiplayer Host -->
          <div class="qb-mode-card">
            <div class="qb-mode-icon">${OmicsLab.Icons?.svg('zap',28)||''}</div>
            <div class="qb-mode-title">Host Battle</div>
            <div class="qb-mode-desc">Play vs a friend in another browser tab on the same device</div>
            <input type="text" id="qb-p1-name" class="qb-name-inp" placeholder="Your name (P1)">
            <input type="text" id="qb-p2-name" class="qb-name-inp" placeholder="Opponent name (P2)">
            <button class="qb-start-btn qb-host-btn" onclick="OmicsLab.QuizBattle._startMulti()">Host Game →</button>
            <div id="qb-multi-status" class="qb-multi-status"></div>
          </div>

          <!-- Join Guest -->
          <div class="qb-mode-card">
            <div class="qb-mode-icon">${OmicsLab.Icons?.svg('link',28)||''}</div>
            <div class="qb-mode-title">Join as Guest</div>
            <div class="qb-mode-desc">Enter the session code from your opponent's tab</div>
            <input type="text" id="qb-p2-name-guest" class="qb-name-inp" placeholder="Your name (P2)">
            <input type="text" id="qb-guest-code" class="qb-name-inp" placeholder="Session code (e.g. qb_a1b2c3)">
            <button class="qb-start-btn qb-guest-btn" onclick="OmicsLab.QuizBattle._joinAsGuest()">Join Game →</button>
          </div>
        </div>

        <!-- Category breakdown -->
        <div class="qb-cats-section">
          <div class="qb-cats-title">Question categories (${QUESTIONS.length} total)</div>
          <div class="qb-cats-grid">
            ${Object.entries(QUESTIONS.reduce((a,q)=>{a[q.cat]=(a[q.cat]||0)+1;return a},{}))
              .sort((a,b)=>b[1]-a[1])
              .map(([cat,n])=>`<div class="qb-cat-chip"><span class="qb-cat-name">${cat}</span><span class="qb-cat-n">${n}</span></div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function init() {
    const section = document.getElementById('quizbattle-section');
    if (!section || section.dataset.qbReady) return;
    section.dataset.qbReady = '1';
    _render(section);
  }

  return { init, _startSolo, _startMulti, _joinAsGuest, _answer, _restart };
})();
