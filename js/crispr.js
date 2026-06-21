/* ═══════════════════════════════════════════════════════════════
   OmicsLab — CRISPR Design Lab
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.CRISPR = (function () {

  const SYSTEMS = [
    { name:'SpCas9',     pam:'NGG',    kb:4.2, spec:'Standard',    use:'General KO, HDR, base editing, CRISPRi/a', africa:'BCL11A enhancer deletion for sickle cell HbF reactivation (Casgevy therapy)' },
    { name:'SaCas9',     pam:'NNGRRT', kb:3.2, spec:'High',        use:'AAV delivery (smaller), liver/CNS gene therapy', africa:'TB therapy — targeting host HDAC1 via AAV to modulate macrophage response' },
    { name:'Cas12a',     pam:'TTTV',   kb:3.8, spec:'Very High',   use:'AT-rich genomes · staggered cuts · multiplex', africa:'P. falciparum genome editing (80% AT genome) — far more efficient than SpCas9' },
    { name:'Cas13d',     pam:'None',   kb:2.8, spec:'RNA targets', use:'RNA knockdown · SHERLOCK diagnostics · antiviral', africa:'SHERLOCK-based rapid COVID/Ebola/mpox detection deployed in 8 African countries' },
    { name:'ABE8e',      pam:'NGG',    kb:5.1, spec:'A→G edits',   use:'Precise A→G base edits, no DSB, no donor template', africa:'HBB E6V sickle mutation correctable at 70–90% efficiency in CD34+ HSCs ex vivo' },
    { name:'PEmax',      pam:'NGG',    kb:6.8, spec:'All 12 SNPs', use:'All point mutations + small indels without DSB', africa:'HBB sickle correction at 52% efficiency in primary human HSCs (Leibowitz 2022)' },
  ];

  const OUTCOMES = [
    { name:'NHEJ — Knockout', freq:'60–90%', color:'#f85149', desc:'Error-prone end-joining creates random indels → frameshift → premature stop codon → protein loss-of-function. Fast and efficient but unpredictable sequence outcome.', use:'Disrupting repressors (BCL11A → HbF reactivation), disabling viral receptors (CCR5 for HIV resistance), functional genomic screens' },
    { name:'HDR — Precise Edit', freq:'1–10%', color:'#3fb950', desc:'Homology-directed repair copies sequence from a donor template (ssODN or AAV6) to make exact changes. Requires S/G2 phase. Enriched by small molecule cell cycle synchronisation (nocodazole) or HDR enhancers (RS-1, M3814).', use:'Correcting point mutations (HBB E6V), knock-in reporters, adding protein tags, creating disease models' },
    { name:'Base Editing (CBE/ABE)', freq:'20–80%', color:'#e3b341', desc:'A catalytically impaired Cas9 nickase tethered to a deaminase enzyme edits single bases within a 4–8 nt activity window without creating a DSB. CBE: C→T; ABE: A→G. No donor template needed — dramatically simpler delivery.', use:'All single-nucleotide corrections approachable as C→T or A→G. HBB E6V (A→T in coding strand) correctable by ABE8e targeting non-template strand' },
    { name:'Prime Editing', freq:'5–50%', color:'#bc8cff', desc:'A PEgRNA encodes both the spacer and a reverse transcriptase template. PE2 (Cas9-H840A + MLV-RT) nicks the non-target strand and synthesises a DNA flap from the RT template. Enables all 12 point mutations and small indels (inserts ≤44 bp, deletions ≤80 bp) without DSB.', use:'Complex corrections unreachable by CBE/ABE, insertions/deletions, therapeutic corrections where bystander edits are problematic' },
    { name:'CRISPRi / CRISPRa', freq:'50–99% modulation', color:'#58a6ff', desc:'Dead Cas9 (dCas9) fused to KRAB repressor (CRISPRi) silences target genes transcriptionally without cutting DNA. dCas9-VP64/p65/Rta (CRISPRa) activates gene expression. Reversible — ideal for functional studies without permanent genome alteration.', use:'Essential gene studies, drug target validation, genome-wide screens (Perturb-seq), reactivating silenced tumour suppressors or HbF' },
    { name:'Gene Drive', freq:'99%+ population spread', color:'#f97316', desc:'A homing construct encoding Cas9 + sgRNA copies itself into homologous chromosomes during meiosis via HDR, spreading faster than Mendelian inheritance. Daisy-chain and split-drive designs improve confinement. Requires extensive biosafety review.', use:'Anopheles gambiae sterility for malaria vector control; Aedes aegypti dengue suppression; crop pest control — all requiring international regulatory framework' },
  ];

  const AFRICA = [
    { disease:'Sickle Cell Disease',    gene:'HBB / BCL11A', color:'#f85149', strategy:'ABE8e base editing of HBB E6V codon (A→T on non-template strand) OR Cas9 disruption of BCL11A +62 kb erythroid enhancer to reactivate fetal hemoglobin (HbF). Both achieve >80% HbF in CD34+ HSC models.', status:'Phase III trial (CLIMB-SCD-121, Casgevy) — first African patients enrolled at WITS/Charlotte Maxeke Hospital, Johannesburg 2024. FDA/EMA approved November 2023.' },
    { disease:'Malaria (P. falciparum)', gene:'PfCRT / kelch13 / gene drive', color:'#e3b341', strategy:'Cas12a (preferred over SpCas9 for AT-rich P. falciparum genome, ~80% AT) used for drug resistance gene characterisation. Split gene drives targeting Anopheles gambiae fertility genes (AGAP005958) under field evaluation.', status:'Gene drive field biosafety evaluation ongoing. Phase I contained release planned in Mali and Burkina Faso through Target Malaria consortium (Bill & Melinda Gates funded).' },
    { disease:'HIV-1',                  gene:'CCR5 / CXCR4 / integrated provirus', color:'#bc8cff', strategy:'CCR5Δ32 mimicry in autologous CD34+ HSCs using SpCas9 + AAV6 HDR donor. Dual sgRNA excision of integrated HIV-1 provirus from CD4+ T cells. Functional cure aim — eliminate latent reservoir.', status:'Phase I trial at Johannesburg Wits HIV clinic — 6/12 patients showed sustained CCR5 disruption at 24 weeks with preserved CD4 counts. Scale-up manufacturing challenge for Africa.' },
    { disease:'Cassava Brown Streak',   gene:'eIF4E alleles', color:'#3fb950', strategy:'Knockout of eIF4E susceptibility gene in cassava using SpCas9 — confers broad resistance to CBSV without introducing foreign DNA (regulatory-compliant). Staple food for 800M Africans in sub-Saharan Africa.', status:'Uganda contained field trial 2023: 100% CBSV resistance in T0 knock-out plants. National Biosafety Authority (NBA Uganda) approval pending regulatory review. Kenya and Tanzania trial sites queued.' },
    { disease:'Sleeping Sickness (HAT)',gene:'VSG loci / bloodstream essential genes', color:'#58a6ff', strategy:'DiCre-based conditional knockouts and CRISPR screens in Trypanosoma brucei bloodstream forms for drug target validation. 420 essential genes identified; 3 compounds in hit-to-lead phase for neglected tropical disease pipeline.', status:'Target validation complete (Alsford lab / LSTM / Wellcome). Drug-like hits advancing through DNDI pipeline with African site co-investigators in Uganda and DRC.' },
  ];

  const PRESETS = [
    { label:'HBB — Sickle E6V', seq:'CTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAA' },
    { label:'BCL11A Enhancer (+62 kb)', seq:'GATAAACAGTTCACCTCAGTGGCAGAGGCAGAGCCATCTATTGCTTACATTTGCTTCTGA' },
    { label:'CCR5 Exon 3 — HIV', seq:'AGGAGCTCAAGGGTGATCGAGGAGAGCTTCATCTTTCAGTTCATTGACAGCATCTTCCTC' },
    { label:'PfCRT — Chloroquine (Malaria)', seq:'ATGATTATGGAATAAATAAAACTTTTGCAATAATTTTTGCTGTTTTAATATTTATTTATT' },
  ];

  function init() {
    const container = document.getElementById('crispr-content');
    if (!container) return;
    if (container.querySelector('.crispr-page')) return;
    try {
      container.innerHTML = `
<div class="crispr-page">
  <header class="crispr-header">
    <h1 class="crispr-title">CRISPR Design Lab</h1>
    <p class="crispr-sub">Mechanism · guide RNA design · editing outcomes · CRISPR systems · Africa applications in sickle cell, malaria, HIV and cassava</p>
  </header>
  <div class="crispr-tabs" role="tablist">
    <button class="crispr-tab active" onclick="OmicsLab.CRISPR.setTab('mechanism',this)">Mechanism</button>
    <button class="crispr-tab" onclick="OmicsLab.CRISPR.setTab('guide',this)">Guide Design</button>
    <button class="crispr-tab" onclick="OmicsLab.CRISPR.setTab('outcomes',this)">Outcomes</button>
    <button class="crispr-tab" onclick="OmicsLab.CRISPR.setTab('systems',this)">CRISPR Systems</button>
    <button class="crispr-tab" onclick="OmicsLab.CRISPR.setTab('africa',this)">Africa Applications</button>
  </div>
  <div id="crispr-panel-mechanism">${_mechPanel()}</div>
  <div id="crispr-panel-guide" hidden>${_guidePanel()}</div>
  <div id="crispr-panel-outcomes" hidden>${_outcomesPanel()}</div>
  <div id="crispr-panel-systems" hidden>${_systemsPanel()}</div>
  <div id="crispr-panel-africa" hidden>${_africaPanel()}</div>
</div>`;
    } catch(e) { container.innerHTML = `<p style="color:#f85149;padding:2rem">CRISPR module error: ${e}</p>`; }
  }

  function setTab(id, btn) {
    document.querySelectorAll('.crispr-tab').forEach(t => t.classList.toggle('active', t === btn));
    ['mechanism','guide','outcomes','systems','africa'].forEach(p => {
      const el = document.getElementById('crispr-panel-' + p);
      if (el) el.hidden = (p !== id);
    });
  }

  function designGuide() {
    const raw = document.getElementById('crispr-seq-input')?.value || '';
    const seq = raw.toUpperCase().replace(/[^ATCG]/g,'');
    const out = document.getElementById('crispr-guide-out');
    if (!out) return;
    if (seq.length < 23) {
      out.innerHTML = '<div class="crispr-err">Enter at least 23 bp (20 nt spacer + NGG PAM). Only A/T/C/G characters.</div>';
      return;
    }
    const guides = [];
    for (let i = 0; i <= seq.length - 23; i++) {
      const tri = seq.slice(i+20, i+23);
      if (tri[1]==='G' && tri[2]==='G') {
        const sp = seq.slice(i, i+20);
        const gc = ((sp.match(/[GC]/g)||[]).length / 20 * 100).toFixed(0);
        let score = 50;
        if (+gc >= 40 && +gc <= 70) score += 20;
        if (sp.endsWith('TTTT')) score -= 15;
        if (/AAAA|CCCC|GGGG/.test(sp)) score -= 10;
        if (sp[18]==='G') score += 5;
        if (sp[17]==='C') score += 5;
        if (sp[0]!=='G') score -= 5;
        score = Math.max(10, Math.min(95, score));
        guides.push({ pos:i+1, sp, pam:tri, gc, score });
      }
    }
    if (!guides.length) { out.innerHTML = '<div class="crispr-err">No NGG PAM sites found. Try a longer sequence or different region.</div>'; return; }
    const rows = guides.slice(0,10).map(g => {
      const c = g.score>=70?'#3fb950':g.score>=50?'#e3b341':'#f85149';
      const v = g.score>=70?'Recommended':g.score>=50?'Acceptable':'Poor';
      return `<tr>
        <td>${g.pos}</td>
        <td><code style="color:#c9d1d9">${g.sp}</code> <code style="color:#58a6ff">${g.pam}</code></td>
        <td>${g.gc}%</td>
        <td style="color:${c};font-weight:700">${g.score}</td>
        <td style="color:${c}">${v}</td>
      </tr>`;
    }).join('');
    out.innerHTML = `<div class="crispr-sb-title" style="margin-top:1.25rem">Guide Candidates — SpCas9 / NGG PAM (${guides.length} found, showing first 10)</div>
      <div class="crispr-tbl-wrap"><table class="crispr-tbl">
        <thead><tr><th>Pos</th><th>Spacer + PAM</th><th>GC%</th><th>Score</th><th>Verdict</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p class="crispr-guide-note">Score based on simplified Doench 2016 rules. Run on <strong>CRISPOR</strong> or <strong>Benchling</strong> for full off-target analysis and genome-wide specificity scores.</p>`;
  }

  function _mechPanel() {
    const svgW = 580, svgH = 155;
    const svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="width:100%;max-width:${svgW}px;display:block;margin:0 auto" aria-label="Cas9 cleavage schematic">
      <text x="14" y="57" fill="#6e7681" font-size="9">5'</text>
      <line x1="28" y1="54" x2="375" y2="54" stroke="#3fb950" stroke-width="2"/>
      <text x="378" y="57" fill="#6e7681" font-size="9">3'</text>
      <text x="14" y="80" fill="#6e7681" font-size="9">3'</text>
      <line x1="28" y1="77" x2="375" y2="77" stroke="#3fb950" stroke-width="2"/>
      <text x="378" y="80" fill="#6e7681" font-size="9">5'</text>
      <rect x="115" y="44" width="138" height="42" rx="3" fill="rgba(88,166,255,.1)" stroke="#58a6ff" stroke-width="1" stroke-dasharray="4,2"/>
      <text x="184" y="40" text-anchor="middle" fill="#58a6ff" font-size="9">20-nt spacer target</text>
      <rect x="253" y="44" width="34" height="42" rx="3" fill="rgba(249,115,22,.18)" stroke="#f97316" stroke-width="1"/>
      <text x="270" y="40" text-anchor="middle" fill="#f97316" font-size="9">PAM</text>
      <text x="270" y="69" text-anchor="middle" fill="#f97316" font-size="9" font-weight="700">NGG</text>
      <line x1="251" y1="34" x2="251" y2="96" stroke="#f85149" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="251" y="108" text-anchor="middle" fill="#f85149" font-size="8">DSB (−3 bp)</text>
      <ellipse cx="455" cy="65" rx="76" ry="46" fill="rgba(188,140,255,.12)" stroke="#bc8cff" stroke-width="1.5"/>
      <text x="455" y="63" text-anchor="middle" fill="#bc8cff" font-size="10" font-weight="700">Cas9</text>
      <text x="455" y="76" text-anchor="middle" fill="#6e7681" font-size="8">HNH · RuvC</text>
      <path d="M455,19 Q390,8 295,47" fill="none" stroke="#e3b341" stroke-width="2" stroke-dasharray="6,3"/>
      <text x="430" y="14" fill="#e3b341" font-size="9">sgRNA scaffold</text>
    </svg>`;

    return `
<div class="crispr-concept-box">
  <div class="crispr-concept-title">How CRISPR-Cas9 Works</div>
  <p class="crispr-concept-body">CRISPR (Clustered Regularly Interspaced Short Palindromic Repeats) is a bacterial adaptive immune system repurposed as a precision genome editing tool by Doudna, Charpentier and colleagues (Nobel Prize 2020). A single guide RNA (sgRNA) directs the Cas9 endonuclease to a complementary 20-nt genomic target adjacent to a PAM (Protospacer Adjacent Motif, NGG for SpCas9). Cas9 makes a blunt double-strand break (DSB) 3 bp upstream of the PAM, which the cell repairs by NHEJ (indels) or HDR (precise correction with a donor template).</p>
</div>
<div class="crispr-svg-card">${svg}</div>
<div class="crispr-mech-steps">
  <div class="crispr-mech-step"><span class="crispr-step-n">1</span><div><div class="crispr-step-title">sgRNA Design</div><p class="crispr-step-body">Select a 20-nt spacer complementary to the target DNA strand, immediately 5′ of an NGG PAM. GC content 40–70%; avoid TTTT (RNA Pol III terminator); unique genomic site (minimise seed region off-targets).</p></div></div>
  <div class="crispr-mech-step"><span class="crispr-step-n">2</span><div><div class="crispr-step-title">RNP Complex Assembly</div><p class="crispr-step-body">sgRNA (tracrRNA + crRNA) folds into a stem-loop scaffold bound by Cas9 (SpCas9 = 158 kDa). Delivering as RNP (ribonucleoprotein) complex provides faster on-kinetics and lower off-target activity than plasmid transfection — critical for clinical applications.</p></div></div>
  <div class="crispr-mech-step"><span class="crispr-step-n">3</span><div><div class="crispr-step-title">PAM Recognition &amp; R-Loop Formation</div><p class="crispr-step-body">Cas9 scans DNA by rapid 3D diffusion, recognising NGG PAMs. On PAM binding, the sgRNA unwinds the DNA duplex forming an R-loop from the PAM-proximal seed region (nt 1–12). Full 20-nt complementarity triggers conformational change activating both HNH (complementary strand) and RuvC (non-complementary strand) nuclease domains.</p></div></div>
  <div class="crispr-mech-step"><span class="crispr-step-n">4</span><div><div class="crispr-step-title">DSB &amp; DNA Repair</div><p class="crispr-step-body">Blunt DSB 3 bp upstream of PAM. Repair choice: (1) <strong>NHEJ</strong> — fast, error-prone, creates indels → KO; (2) <strong>HDR</strong> — uses donor template for precise correction; (3) <strong>MMEJ</strong> — predictable deletions using microhomology. Cell cycle phase and chromatin context influence repair pathway choice.</p></div></div>
</div>`;
  }

  function _guidePanel() {
    const presetBtns = PRESETS.map(p =>
      `<button class="crispr-preset-btn" onclick="document.getElementById('crispr-seq-input').value='${p.seq}'">${p.label}</button>`
    ).join('');

    return `
<div class="crispr-concept-box">
  <div class="crispr-concept-title">Guide RNA Design Rules</div>
  <p class="crispr-concept-body">An effective guide RNA requires: 20-nt spacer complementary to the target strand immediately 5′ of an NGG PAM; GC content 40–70% for stable R-loop formation; no TTTT stretch (Pol III terminates transcription); unique target sequence to minimise off-target cleavage. The seed region (nt 1–12 from PAM) is most critical for specificity — even single mismatches here abolish cleavage.</p>
</div>
<div class="crispr-designer">
  <div class="crispr-sb-title">Interactive Guide RNA Finder — SpCas9 / NGG PAM</div>
  <div class="crispr-preset-row">${presetBtns}</div>
  <label class="crispr-lbl" for="crispr-seq-input">Target sequence (min 23 bp, A/T/C/G only)</label>
  <textarea id="crispr-seq-input" class="crispr-seq-input" rows="3" spellcheck="false" placeholder="Paste DNA sequence containing your target region..."></textarea>
  <button class="crispr-design-btn" onclick="OmicsLab.CRISPR.designGuide()">Find Guide RNAs</button>
  <div id="crispr-guide-out"></div>
</div>
<div class="crispr-scoring-card">
  <div class="crispr-sb-title">Scoring Rules (simplified Doench 2016)</div>
  <div class="crispr-score-grid">
    <div class="crispr-sc-item good"><span class="crispr-sc-rule">GC 40–70%</span><span class="crispr-sc-val">+20</span></div>
    <div class="crispr-sc-item good"><span class="crispr-sc-rule">G at position 18</span><span class="crispr-sc-val">+5</span></div>
    <div class="crispr-sc-item good"><span class="crispr-sc-rule">C at position 17</span><span class="crispr-sc-val">+5</span></div>
    <div class="crispr-sc-item bad"><span class="crispr-sc-rule">TTTT run (Pol III stop)</span><span class="crispr-sc-val">−15</span></div>
    <div class="crispr-sc-item bad"><span class="crispr-sc-rule">4× homopolymer (AAAA/CCCC/GGGG)</span><span class="crispr-sc-val">−10</span></div>
    <div class="crispr-sc-item bad"><span class="crispr-sc-rule">No G at position 1</span><span class="crispr-sc-val">−5</span></div>
  </div>
</div>`;
  }

  function _outcomesPanel() {
    return '<div class="crispr-outcomes-grid">' + OUTCOMES.map(o => `
      <div class="crispr-oc-card" style="border-top-color:${o.color}">
        <div class="crispr-oc-title" style="color:${o.color}">${o.name}</div>
        <div class="crispr-oc-freq">Typical frequency: ${o.freq}</div>
        <p class="crispr-oc-desc">${o.desc}</p>
        <div class="crispr-oc-use"><span class="crispr-oc-lbl">Best for</span>${o.use}</div>
      </div>`).join('') + '</div>';
  }

  function _systemsPanel() {
    const rows = SYSTEMS.map(s => `<tr>
      <td style="font-weight:700;color:#c9d1d9;font-family:monospace">${s.name}</td>
      <td><code style="color:#e3b341">${s.pam}</code></td>
      <td>${s.kb} kb</td>
      <td>${s.spec}</td>
      <td style="font-size:0.72rem;color:#8b949e">${s.use}</td>
      <td style="font-size:0.68rem;color:#f97316">${s.africa}</td>
    </tr>`).join('');

    return `
<div class="crispr-concept-box">
  <div class="crispr-concept-title">The Expanding CRISPR Toolkit</div>
  <p class="crispr-concept-body">Beyond SpCas9, a growing family of CRISPR nucleases offer distinct PAM requirements, sizes, specificities, and target modalities (DNA vs RNA). Choosing the right system depends on PAM availability at the target site, delivery method constraints (LNP or AAV size), required editing precision, and whether permanent genome modification is acceptable.</p>
</div>
<div class="crispr-sys-wrap"><table class="crispr-sys-tbl">
  <thead><tr><th>System</th><th>PAM</th><th>Size</th><th>Specificity</th><th>Best Use</th><th>Africa Link</th></tr></thead>
  <tbody>${rows}</tbody>
</table></div>`;
  }

  function _africaPanel() {
    const cards = AFRICA.map(a => `
      <div class="crispr-af-card" style="border-left-color:${a.color}">
        <div class="crispr-af-disease" style="color:${a.color}">${a.disease}</div>
        <div class="crispr-af-gene"><span class="crispr-af-lbl">Target</span>${a.gene}</div>
        <p class="crispr-af-strategy">${a.strategy}</p>
        <div class="crispr-af-status"><span class="crispr-af-lbl">Status</span>${a.status}</div>
      </div>`).join('');

    return `
<div class="crispr-concept-box">
  <div class="crispr-concept-title">CRISPR in Africa — From Lab to Field</div>
  <p class="crispr-concept-body">Africa carries the world's highest burden of diseases amenable to CRISPR intervention: sickle cell disease (300,000 births/year), malaria (600,000 deaths/year), HIV (25M people living with HIV), and agricultural diseases destroying food security for hundreds of millions. African researchers are both applying CRISPR tools developed elsewhere and adapting them to Africa's unique genetic and ecological contexts.</p>
</div>
<div class="crispr-africa-list">${cards}</div>
<div class="crispr-ethics-card">
  <div class="crispr-sb-title">Ethical Dimensions for CRISPR in Africa</div>
  <div class="crispr-ethics-grid">
    <div class="crispr-eth-item"><span class="crispr-eth-lbl">Germline editing</span>Moratorium widely supported — somatic therapeutic editing only; no heritable modifications</div>
    <div class="crispr-eth-item"><span class="crispr-eth-lbl">Gene drives</span>Environmental release requires cross-border regulatory harmonisation — WHO guidance 2022; African Union framework needed</div>
    <div class="crispr-eth-item"><span class="crispr-eth-lbl">Access &amp; equity</span>Casgevy costs $2.2M/patient in the West — Africa-accessible manufacturing and delivery pathways urgently needed</div>
    <div class="crispr-eth-item"><span class="crispr-eth-lbl">Benefit sharing</span>Nagoya Protocol applies to genetic resources used in CRISPR tool development from African biodiversity and patient samples</div>
  </div>
</div>`;
  }

  return { init, setTab, designGuide };
})();
