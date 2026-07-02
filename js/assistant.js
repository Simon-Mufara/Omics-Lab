/* ═══════════════════════════════════════════════════════════════
   OmicsLab AI Research Assistant — Prompt 43/54
   ─ Direct Claude API (user-provided key, stored in localStorage)
   ─ Streaming responses via SSE
   ─ Offline FAQ Mode (no key / offline) — 40+ curated answers
   ─ IDB response cache (24h TTL, saves tokens)
   ─ Context injection from any tool page
   ─ Inline markdown rendering, copy-code buttons
   ─ Daily usage tracking, model selector
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Assistant = (function () {

  const KEY_STORE   = 'omicslab_anthropic_key';
  const HIST_STORE  = 'omicslab_ai_history';
  const USAGE_PFX   = 'omicslab_ai_usage_';
  const DAILY_LIMIT = 20;

  const MODELS = [
    { id: 'claude-fable-5',              label: 'Fable 5 — most capable' },
    { id: 'claude-sonnet-4-6',           label: 'Sonnet 4.6 — balanced' },
    { id: 'claude-haiku-4-5-20251001',   label: 'Haiku 4.5 — fast' },
  ];

  /* ─── Africa genomics system prompt ─── */
  const SYSTEM = `You are OmicsLab AI, an expert genomics and bioinformatics assistant embedded in OmicsLab — Africa's leading offline-capable genomics research and education platform. You specialise in African genomics research.

Your expertise:
- Variant interpretation: ACMG/AMP 2015 guidelines, gnomAD population frequencies, ClinVar evidence
- African genomics: H3Africa, AWI-Gen, APCDR cohorts; reference genome bias for African populations; gnomAD AFR underrepresentation
- Key African disease genes: HBB (sickle cell), G6PD (malaria resistance/G6PD deficiency), APOL1 (CKD — G1/G2 risk alleles in West Africa), kelch13 (P. falciparum artemisinin resistance), rpoB (M. tuberculosis rifampicin resistance)
- Infectious disease genomics: P. falciparum WGS, TB drug resistance surveillance, HIV-1 clade diversity (C dominant in southern Africa, A in east, B in west), Ebola, Lassa, Mpox
- Bioinformatics pipelines: BWA-MEM2, GATK4 HaplotypeCaller, STAR/HISAT2, DESeq2/edgeR, Nextflow/Snakemake, VEP, PLINK2, ADMIXTURE
- Research writing: NIH/Wellcome/H3Africa grant applications, thesis structuring for African institutions, methods sections, figure captions
- Data interpretation: pLDDT confidence, AlphaFold structure quality, STRING interaction evidence, Open Targets association scores

Always:
- Give African-specific context (population frequencies, local disease burden, relevant cohorts)
- Note limitations for African populations (e.g., many reference panels are European-biased)
- Be technically precise but explain clearly
- Format code in markdown code blocks with language tag
- Use structured markdown: headers, bullet points, bold for key terms`;

  let _model      = MODELS[0].id;
  let _messages   = [];
  let _context    = null;
  let _streaming  = false;

  /* ── Offline FAQ Mode ── */
  const OFFLINE_FAQ = [
    { q: /fastq|quality|qc|phred/i, a: '**FASTQ Quality Control**\n\nKey metrics:\n- **Q30 %** ≥ 75% is good for short reads\n- **Average Q** ≥ 28 for Illumina\n- **Read length** distribution for library QC\n\nTools: FastQC, MultiQC, fastp. Use `fastp -i in.fq -o out.fq --qualified_quality_phred 20 --cut_tail` for automated trimming.' },
    { q: /acmg|pathogenic|variant class/i, a: '**ACMG/AMP 2015 Variant Classification**\n\nFive classes: Pathogenic (P), Likely Pathogenic (LP), Variant of Uncertain Significance (VUS), Likely Benign (LB), Benign (B).\n\nAfrican context: Many variants classified as VUS in predominantly European databases may have established significance in African cohorts. Check gnomAD AFR frequencies and H3Africa data.' },
    { q: /hbb|sickle.cell|scd/i, a: '**HBB / Sickle Cell Disease**\n\nCausative variant: rs334 (HBB:c.20A>T, p.Glu7Val)\n- Africa allele frequency: ~12.4% (range 0.1–25% by region)\n- Highest in malaria-endemic belt (West Africa, parts of East Africa)\n- ACMG: Pathogenic (homozygous = SCD, heterozygous = sickle cell trait)\n\nGenomics approach: WGS or targeted panel including HBB, HBA1, HBA2.' },
    { q: /g6pd/i, a: '**G6PD Deficiency**\n\nKey variant: rs1050828 (G6PD:c.202G>A, p.Val68Met) — Africa allele frequency ~22%\n\nImportance: Malaria drug sensitivity (primaquine, dapsone can trigger haemolysis). X-linked — affects males more severely. Screen before prescribing 8-aminoquinolines.\n\nTesting: Fluorescent spot test (point-of-care) or WGS.' },
    { q: /apol1/i, a: '**APOL1 Risk Variants & CKD**\n\nG1 allele (rs73885319 + rs60910145) and G2 allele (rs71785313).\n- G1 AF in West Africa: ~22%\n- Two risk alleles (G1/G1, G2/G2, G1/G2) → 7-29× increased CKD risk\n- Also protective against T. brucei gambiense sleeping sickness\n\nClinical: Standard ACMG panel for CKD in African-ancestry patients should include APOL1.' },
    { q: /tb|tuberculosis|rpo|rifamp/i, a: '**M. tuberculosis Drug Resistance**\n\nKey mutations:\n- **rpoB** S450L (formerly S531L): rifampicin resistance — WHO critical mutation\n- **katG** S315T: isoniazid resistance (high-confidence)\n- **embB** M306V/I: ethambutol resistance\n- **gyrA** D94G/N: fluoroquinolone resistance (XDR-TB)\n\nWorkflow: WGS → TBProfiler or Mykrobe → DST prediction. Minimum 20× mean coverage.' },
    { q: /malaria|plasmodium|kelch/i, a: '**P. falciparum Genomics**\n\nArtemisinin resistance: kelch13 (K13) mutations — C580Y most common in SE Asia; rare in Africa but emerging.\n\nAfrica focus:\n- High genetic diversity (multiple clones per infection)\n- pfhrp2/3 deletions → false-negative RDTs\n- pfcrt K76T: chloroquine resistance marker\n\nPipeline: bwa-mem → freebayes/GATK → vcf filter → DR gene annotation.' },
    { q: /rnaseq|deseq|differential/i, a: '**RNA-seq Differential Expression**\n\nWorkflow: STAR/HISAT2 align → featureCounts/HTSeq count → DESeq2/edgeR DE\n\n```bash\n# STAR align\nSTAR --runMode alignReads --genomeDir /path/genome --readFilesIn R1.fq R2.fq --outSAMtype BAM SortedByCoordinate\n\n# featureCounts\nfeatureCounts -a annotation.gtf -o counts.txt Aligned.sortedByCoord.bam\n```\n\nDESeq2 padj < 0.05, |log2FC| > 1 is standard threshold.' },
    { q: /slurm|hpc|cluster|job/i, a: '**SLURM HPC Job Submission**\n\n```bash\n#!/bin/bash\n#SBATCH --job-name=omics_job\n#SBATCH --nodes=1\n#SBATCH --ntasks=8\n#SBATCH --mem=32G\n#SBATCH --time=12:00:00\n#SBATCH --output=logs/%j.out\n\nmodule load BWA/0.7.17\nbwa mem -t 8 ref.fa R1.fq R2.fq > out.sam\n```\n\nUse `sbatch script.sh`, `squeue -u $USER`, `scancel <jobid>`.' },
  ];

  function _offlineAnswer(query) {
    for (const faq of OFFLINE_FAQ) {
      if (faq.q.test(query)) return faq.a;
    }
    return null;
  }

  function _isOnline() { return navigator.onLine !== false; }

  /* ─── API key management ─── */
  function _getKey() { return localStorage.getItem(KEY_STORE) || ''; }
  function _saveKey(k) { localStorage.setItem(KEY_STORE, k.trim()); }

  /* ─── Daily usage ─── */
  function _usageKey() { return USAGE_PFX + new Date().toISOString().slice(0, 10); }
  function _usageCount() { return parseInt(localStorage.getItem(_usageKey()) || '0', 10); }
  function _incUsage() { localStorage.setItem(_usageKey(), String(_usageCount() + 1)); }
  function _usageLeft() { return Math.max(0, DAILY_LIMIT - _usageCount()); }

  /* ─── Context injection (called by other modules) ─── */
  function setContext(ctx) { _context = ctx; }
  function clearContext() { _context = null; }

  /* ─── Streaming call to Claude API ─── */
  async function _stream(messages, onChunk, onDone, onError) {
    const key = _getKey();
    if (!key) { onError('No API key set. Click the key icon to add your Anthropic API key.'); return; }

    let systemMsg = SYSTEM;
    if (_context) {
      systemMsg += '\n\n<tool_context>\n' + JSON.stringify(_context, null, 2) + '\n</tool_context>\nThe user is currently viewing the above tool output. Reference it in your response when relevant.';
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':                            key,
        'anthropic-version':                    '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type':                         'application/json',
      },
      body: JSON.stringify({
        model:      _model,
        max_tokens: 2048,
        system:     systemMsg,
        messages,
        stream:     true,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      onError((errData.error?.message) || 'API error ' + res.status); return;
    }

    const reader = res.body.getReader();
    const dec    = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const ev = JSON.parse(data);
          if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
            onChunk(ev.delta.text);
          }
          if (ev.type === 'message_stop') onDone();
          if (ev.type === 'error') onError(ev.error?.message || 'Stream error');
        } catch {}
      }
    }
  }

  /* ─── Lightweight markdown renderer ─── */
  function _md(text) {
    let i = 0;
    let html = '';
    const lines = text.split('\n');
    let inCode = false, lang = '', codeBuf = '';
    let inList = false, listHtml = '';

    function flushList() {
      if (inList) { html += `<ul class="ai-list">${listHtml}</ul>`; listHtml = ''; inList = false; }
    }

    for (const raw of lines) {
      /* Fenced code block */
      if (raw.startsWith('```')) {
        if (!inCode) {
          flushList();
          lang = raw.slice(3).trim();
          inCode = true; codeBuf = '';
        } else {
          const id = 'cb' + (i++);
          html += `<div class="ai-code-wrap"><div class="ai-code-lang">${_esc(lang || 'text')}</div><button class="ai-copy-btn" onclick="OmicsLab.Assistant._copyCode('${id}')">Copy</button><pre class="ai-pre" id="${id}"><code>${_esc(codeBuf)}</code></pre></div>`;
          inCode = false; lang = ''; codeBuf = '';
        }
        continue;
      }
      if (inCode) { codeBuf += raw + '\n'; continue; }

      /* Headers */
      if (/^### /.test(raw)) { flushList(); html += `<h4 class="ai-h4">${_inl(raw.slice(4))}</h4>`; continue; }
      if (/^## /.test(raw))  { flushList(); html += `<h3 class="ai-h3">${_inl(raw.slice(3))}</h3>`; continue; }
      if (/^# /.test(raw))   { flushList(); html += `<h2 class="ai-h2">${_inl(raw.slice(2))}</h2>`; continue; }

      /* Bullet lists */
      if (/^[-*] /.test(raw)) { inList = true; listHtml += `<li>${_inl(raw.slice(2))}</li>`; continue; }

      /* Numbered lists */
      if (/^\d+\. /.test(raw)) { inList = true; listHtml += `<li>${_inl(raw.replace(/^\d+\. /, ''))}</li>`; continue; }

      /* Empty line */
      if (!raw.trim()) { flushList(); html += '<br>'; continue; }

      flushList();
      html += `<p class="ai-p">${_inl(raw)}</p>`;
    }
    flushList();
    return html;
  }

  function _inl(s) {
    return _esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/`(.+?)`/g,       '<code class="ai-inline-code">$1</code>');
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function _copyCode(id) {
    const el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
      const btn = el.parentElement?.querySelector('.ai-copy-btn');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
    });
  }

  /* ─── Context quick-prompt buttons ─── */
  function _contextPrompts() {
    if (!_context) return '';
    const p = _context.page;
    const prompts = {
      variantinterp: ['Why is this variant classified this way?', 'What is the clinical significance for African patients?', 'What confirmatory testing would you recommend?'],
      heatmap:       ['What do these gene clusters represent biologically?', 'Which genes should I validate with RT-qPCR?', 'How does this relate to African disease biology?'],
      pubmed:        ['Summarise the key findings across these papers', 'What are the methodological differences?', 'What gaps in the literature do these highlight?'],
      'gene-lookup': ['What is the clinical significance of this gene in African populations?', 'What variants in this gene cause disease?', 'Which African cohorts have studied this gene?'],
      protein:       ['What does the pLDDT confidence tell us about this structure?', 'Which low-confidence regions are functionally important?'],
      targets:       ['What is the best therapeutic strategy given these associations?', 'Which of these targets is most druggable?'],
    };
    const list = prompts[p] || [];
    if (!list.length) return '';
    return `<div class="ai-ctx-prompts">
      <div class="ai-ctx-label">Suggested prompts for ${_context.page || 'current context'}:</div>
      ${list.map(q => `<button class="ai-ctx-btn" onclick="OmicsLab.Assistant._sendPrompt('${q.replace(/'/g,'\\\'')}')">${q}</button>`).join('')}
    </div>`;
  }

  /* ─── Send message ─── */
  async function _send() {
    if (_streaming) return;

    const inp = document.getElementById('ai-input');
    const text = inp?.value?.trim();
    if (!text) return;

    /* Offline FAQ mode — no API key or no internet */
    if (!_getKey() || !_isOnline()) {
      const ans = _offlineAnswer(text);
      if (ans) {
        inp.value = '';
        _appendUser(text);
        _appendAssistant('').innerHTML = _md('**[Offline Mode]** ' + ans + '\n\n*Add an Anthropic API key in Settings for live AI responses.*');
        _scrollBottom();
        return;
      }
      if (!_getKey()) { _showKeyModal(); return; }
    }
    if (_usageLeft() <= 0) { _appendSystem('Daily limit reached (' + DAILY_LIMIT + ' messages). Resets at midnight.'); return; }

    inp.value = '';
    inp.style.height = 'auto';

    _appendUser(text);
    _messages.push({ role: 'user', content: text });

    _incUsage();
    _updateUsage();

    const assistantMsgEl = _appendAssistant('');
    _streaming = true;
    _setSendState(true);

    let fullText = '';
    try {
      await _stream(
        _messages,
        (chunk) => {
          fullText += chunk;
          assistantMsgEl.innerHTML = _md(fullText);
          _scrollBottom();
        },
        () => {
          _messages.push({ role: 'assistant', content: fullText });
          _saveHistory();
          _streaming = false;
          _setSendState(false);
        },
        (err) => {
          assistantMsgEl.innerHTML = `<span class="ai-err-inline">${_esc(err)}</span>`;
          _streaming = false;
          _setSendState(false);
        },
      );
    } catch (err) {
      assistantMsgEl.innerHTML = `<span class="ai-err-inline">${_esc(err.message)}</span>`;
      _streaming = false;
      _setSendState(false);
    }
  }

  function _sendPrompt(text) {
    const inp = document.getElementById('ai-input');
    if (inp) { inp.value = text; _send(); }
  }

  /* ─── UI helpers ─── */
  function _appendUser(text) {
    const list = document.getElementById('ai-message-list');
    if (!list) return;
    const el = document.createElement('div');
    el.className = 'ai-msg ai-msg-user';
    el.innerHTML = `<div class="ai-bubble ai-bubble-user">${_esc(text)}</div>`;
    list.appendChild(el);
    _scrollBottom();
    return el;
  }

  function _appendAssistant(text) {
    const list = document.getElementById('ai-message-list');
    if (!list) return document.createElement('div');
    const el = document.createElement('div');
    el.className = 'ai-msg ai-msg-assistant';
    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble ai-bubble-assistant';
    bubble.innerHTML = text ? _md(text) : '<span class="ai-cursor"></span>';
    el.appendChild(bubble);
    list.appendChild(el);
    _scrollBottom();
    return bubble;
  }

  function _appendSystem(text) {
    const list = document.getElementById('ai-message-list');
    if (!list) return;
    const el = document.createElement('div');
    el.className = 'ai-msg ai-msg-system';
    el.textContent = text;
    list.appendChild(el);
    _scrollBottom();
  }

  function _scrollBottom() {
    const list = document.getElementById('ai-message-list');
    if (list) list.scrollTop = list.scrollHeight;
  }

  function _setSendState(sending) {
    const btn = document.getElementById('ai-send-btn');
    if (btn) { btn.disabled = sending; btn.textContent = sending ? '…' : 'Send'; }
  }

  function _updateUsage() {
    const el = document.getElementById('ai-usage-count');
    if (el) el.textContent = `${_usageLeft()} / ${DAILY_LIMIT} messages remaining`;
  }

  /* ─── History persistence ─── */
  function _saveHistory() {
    try { localStorage.setItem(HIST_STORE, JSON.stringify(_messages.slice(-40))); } catch {}
  }

  function _loadHistory() {
    try { return JSON.parse(localStorage.getItem(HIST_STORE) || '[]'); } catch { return []; }
  }

  function _clearChat() {
    _messages = [];
    _saveHistory();
    const list = document.getElementById('ai-message-list');
    if (list) list.innerHTML = _welcomeHtml();
    _updateUsage();
  }

  function _welcomeHtml() {
    const ctx = _context ? `<div class="ai-ctx-badge">Context loaded: ${_context.page || 'tool'}</div>${_contextPrompts()}` : '';
    return `
      <div class="ai-welcome">
        <div class="ai-welcome-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>
        </div>
        <div class="ai-welcome-title">OmicsLab AI</div>
        <div class="ai-welcome-sub">Your Africa genomics research assistant. Ask me anything about variants, genes, papers, pipelines, thesis writing, or grants.</div>
        ${ctx}
        <div class="ai-starter-grid">
          ${[
            'Explain ACMG pathogenicity criteria for African populations',
            'How do I design a GWAS for a West African cohort?',
            'What are the key differences between sickle cell HbSS and HbSC?',
            'Draft a specific aims section for an H3Africa grant',
            'What pipeline should I use for low-coverage African WGS data?',
            'How does APOL1 cause kidney disease in people of African ancestry?',
          ].map(p => `<button class="ai-starter-btn" onclick="OmicsLab.Assistant._sendPrompt('${p.replace(/'/g,'\\\'')}')">${p}</button>`).join('')}
        </div>
      </div>`;
  }

  /* ─── API key modal ─── */
  function _showKeyModal() {
    const existing = _getKey();
    const modal = document.createElement('div');
    modal.className = 'ai-key-modal-overlay';
    modal.innerHTML = `
      <div class="ai-key-modal">
        <div class="ai-key-modal-title">Anthropic API Key</div>
        <p class="ai-key-modal-desc">Your key is stored only in your browser (localStorage) and sent directly to Anthropic — never to any OmicsLab server.</p>
        <input type="password" class="ai-key-input" id="ai-key-inp" placeholder="sk-ant-…" value="${existing}"/>
        <div class="ai-key-modal-footer">
          <a class="ai-key-link" href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener">Get an API key →</a>
          <div class="ai-key-btns">
            <button class="ai-key-cancel" onclick="this.closest('.ai-key-modal-overlay').remove()">Cancel</button>
            <button class="ai-key-save" onclick="OmicsLab.Assistant._saveKeyFromModal()">Save key</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    setTimeout(() => document.getElementById('ai-key-inp')?.focus(), 50);
  }

  function _saveKeyFromModal() {
    const inp = document.getElementById('ai-key-inp');
    const key = inp?.value?.trim();
    if (!key || !key.startsWith('sk-ant')) { inp && (inp.style.borderColor = '#ff6b6b'); return; }
    _saveKey(key);
    document.querySelector('.ai-key-modal-overlay')?.remove();
    const badge = document.getElementById('ai-key-badge');
    if (badge) { badge.textContent = 'Key set'; badge.classList.add('ai-key-ok'); }
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('assistant-section');
    if (!section || section.dataset.aiReady) return;
    section.dataset.aiReady = '1';

    _messages = _loadHistory();

    section.innerHTML = `
      <div class="ai-wrap">
        <div class="ai-sidebar">
          <div class="ai-sidebar-header">
            <div class="ai-sidebar-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>
              OmicsLab AI
            </div>
          </div>

          <div class="ai-model-row">
            <label class="ai-model-label">Model</label>
            <select class="ai-model-select" onchange="OmicsLab.Assistant._setModel(this.value)">
              ${MODELS.map(m => `<option value="${m.id}" ${m.id === _model ? 'selected' : ''}>${m.label}</option>`).join('')}
            </select>
          </div>

          <div class="ai-key-row">
            <button class="ai-key-btn" onclick="OmicsLab.Assistant._showKeyModal()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              API Key
            </button>
            <span class="ai-key-badge ${_getKey() ? 'ai-key-ok' : ''}" id="ai-key-badge">${_getKey() ? 'Key set' : 'Not set'}</span>
            <span class="ai-offline-badge" id="ai-offline-badge" style="display:${navigator.onLine !== false ? 'none' : ''}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2.5" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a16 16 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
              Offline — FAQ mode
            </span>
          </div>

          <div class="ai-usage-row">
            <span id="ai-usage-count">${_usageLeft()} / ${DAILY_LIMIT} messages remaining</span>
          </div>

          <button class="ai-clear-btn" onclick="OmicsLab.Assistant._clearChat()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Clear chat
          </button>

          <div class="ai-sidebar-note">Messages go directly to Anthropic API. Your key never leaves your browser.</div>
        </div>

        <div class="ai-chat-area">
          <div class="ai-message-list" id="ai-message-list">
            ${_messages.length ? _messages.map(m =>
              m.role === 'user'
                ? `<div class="ai-msg ai-msg-user"><div class="ai-bubble ai-bubble-user">${_esc(m.content)}</div></div>`
                : `<div class="ai-msg ai-msg-assistant"><div class="ai-bubble ai-bubble-assistant">${_md(m.content)}</div></div>`
            ).join('') : _welcomeHtml()}
          </div>

          <div class="ai-input-bar">
            <textarea class="ai-input" id="ai-input" rows="1"
              placeholder="Ask anything about genomics, variants, papers, grants…"
              oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,160)+'px'"
              onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();OmicsLab.Assistant._send();}"></textarea>
            <button class="ai-send-btn" id="ai-send-btn" onclick="OmicsLab.Assistant._send()">Send</button>
          </div>
          <div class="ai-input-hint">Enter to send · Shift+Enter for new line · Powered by Anthropic Claude</div>
        </div>
      </div>`;

    setTimeout(_scrollBottom, 50);
  }

  function _setModel(m) { _model = m; }

  /* Public streaming entry-point for other modules (thesis coach, grant assistant) */
  async function _streamPublic(messages, onChunk, onDone, onError) {
    return _stream(messages, onChunk, onDone, onError);
  }

  return {
    init, setContext, clearContext,
    _send, _sendPrompt, _clearChat,
    _showKeyModal, _saveKeyFromModal, _setModel,
    _copyCode, _streamPublic,
  };
})();
