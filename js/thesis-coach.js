/* ═══════════════════════════════════════════════════════════════
   OmicsLab Thesis Coach — Prompt 56
   ─ Project setup, 5-chapter progress tracker
   ─ AI drafting per section (uses OmicsLab.Assistant API)
   ─ Abstract generator, export to .txt
   ─ Works offline; AI features require Anthropic key
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.ThesisCoach = (function () {

  const STORE = 'omicslab_thesis_v1';

  /* Default chapter structure */
  const CHAPTERS = [
    { id: 'intro',       title: 'Chapter 1: Introduction',          target: 6000,  subsections: ['Background & rationale', 'Problem statement', 'Research questions & objectives', 'Significance', 'Thesis overview'] },
    { id: 'lit',         title: 'Chapter 2: Literature Review',      target: 8000,  subsections: ['Genomic landscape of [topic]', 'African population genetics', 'Current tools & methods', 'Gaps in knowledge', 'Theoretical framework'] },
    { id: 'methods',     title: 'Chapter 3: Materials & Methods',    target: 5000,  subsections: ['Study design & cohort', 'Sample collection & ethics', 'Sequencing & QC', 'Bioinformatics pipeline', 'Statistical analysis'] },
    { id: 'results',     title: 'Chapter 4: Results',                target: 7000,  subsections: ['Quality metrics', 'Primary findings', 'Population analysis', 'Variant/expression landscape', 'Comparative analysis'] },
    { id: 'discussion',  title: 'Chapter 5: Discussion & Conclusion', target: 5000, subsections: ['Interpretation of findings', 'African-specific context', 'Limitations', 'Future directions', 'Conclusion'] },
  ];

  /* Research areas for context */
  const RESEARCH_AREAS = ['Genomics / WGS', 'Transcriptomics / RNA-Seq', 'Epigenomics', 'Metagenomics', 'Population genetics', 'Clinical genomics', 'Infectious disease genomics', 'Cancer genomics', 'Pharmacogenomics'];

  let _project = null;
  let _activeChapter = null;
  let _activeTab = 'progress';

  /* ─── State management ─── */
  function _load() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch { return null; }
  }
  function _save() {
    if (_project) try { localStorage.setItem(STORE, JSON.stringify(_project)); } catch {}
  }

  function _newProject(form) {
    _project = {
      title:       form.title,
      degree:      form.degree,
      institution: form.institution,
      area:        form.area,
      question:    form.question,
      supervisor:  form.supervisor,
      deadline:    form.deadline,
      created:     new Date().toISOString(),
      chapters:    CHAPTERS.map(c => ({ ...c, words: 0, text: '', notes: '' })),
      abstract:    '',
    };
    _save();
    _renderMain();
  }

  /* ─── Render ─── */
  function _section() { return document.getElementById('thesis-section'); }

  function _renderSetup() {
    const s = _section();
    if (!s) return;
    s.innerHTML = `
      <div class="tc-wrap">
        <div class="tc-header">
          <div class="tc-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Thesis Coach
          </div>
          <div class="tc-header-sub">AI-powered thesis writing assistant for African genomics researchers</div>
        </div>

        <div class="tc-setup-card">
          <div class="tc-setup-title">Set up your thesis project</div>
          <div class="tc-form">
            <div class="tc-field"><label class="tc-label">Thesis title *</label><input type="text" class="tc-input" id="tc-title" placeholder="e.g. Whole-genome sequencing reveals population structure of sickle cell disease in West Africa"/></div>
            <div class="tc-field-row">
              <div class="tc-field"><label class="tc-label">Degree</label>
                <select class="tc-input" id="tc-degree">
                  <option>MSc</option><option>MPhil</option><option>PhD</option><option>MBChB Research</option>
                </select>
              </div>
              <div class="tc-field"><label class="tc-label">Research area</label>
                <select class="tc-input" id="tc-area">
                  ${RESEARCH_AREAS.map(a => `<option>${a}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="tc-field-row">
              <div class="tc-field"><label class="tc-label">Institution</label><input type="text" class="tc-input" id="tc-inst" placeholder="University of Cape Town…"/></div>
              <div class="tc-field"><label class="tc-label">Supervisor</label><input type="text" class="tc-input" id="tc-sup" placeholder="Prof. …"/></div>
            </div>
            <div class="tc-field"><label class="tc-label">Research question</label><textarea class="tc-input tc-textarea-sm" id="tc-q" placeholder="What is the primary question your thesis answers?"></textarea></div>
            <div class="tc-field"><label class="tc-label">Submission deadline</label><input type="date" class="tc-input" id="tc-deadline"/></div>
          </div>
          <button class="tc-start-btn" onclick="OmicsLab.ThesisCoach._submitSetup()">Start my thesis project</button>
        </div>
      </div>`;
  }

  function _submitSetup() {
    const title = document.getElementById('tc-title')?.value.trim();
    if (!title) { document.getElementById('tc-title').style.borderColor = '#ff6b6b'; return; }
    _newProject({
      title,
      degree:      document.getElementById('tc-degree')?.value,
      area:        document.getElementById('tc-area')?.value,
      institution: document.getElementById('tc-inst')?.value.trim(),
      supervisor:  document.getElementById('tc-sup')?.value.trim(),
      question:    document.getElementById('tc-q')?.value.trim(),
      deadline:    document.getElementById('tc-deadline')?.value,
    });
  }

  function _renderMain() {
    const s = _section();
    if (!s || !_project) return;

    const totalTarget = _project.chapters.reduce((a, c) => a + c.target, 0);
    const totalWords  = _project.chapters.reduce((a, c) => a + (c.words || 0), 0);
    const pct = Math.min(Math.round((totalWords / totalTarget) * 100), 100);

    /* Days to deadline */
    let deadlineStr = '';
    if (_project.deadline) {
      const days = Math.ceil((new Date(_project.deadline) - Date.now()) / 86400000);
      deadlineStr = days > 0 ? `${days} days to deadline` : 'Deadline passed';
    }

    s.innerHTML = `
      <div class="tc-wrap">
        <div class="tc-main-header">
          <div>
            <div class="tc-project-title">${_esc(_project.title)}</div>
            <div class="tc-project-meta">${_project.degree} · ${_esc(_project.institution || '')} ${_project.supervisor ? '· ' + _esc(_project.supervisor) : ''} ${deadlineStr ? '· ' + deadlineStr : ''}</div>
          </div>
          <div class="tc-header-actions">
            <button class="tc-export-btn" onclick="OmicsLab.ThesisCoach._exportThesis()">Export .txt</button>
            <button class="tc-reset-btn" onclick="OmicsLab.ThesisCoach._resetProject()">New project</button>
          </div>
        </div>

        <div class="tc-overall-progress">
          <div class="tc-progress-label">
            <span>Overall progress</span>
            <span>${totalWords.toLocaleString()} / ${totalTarget.toLocaleString()} words (${pct}%)</span>
          </div>
          <div class="tc-progress-bar-wrap"><div class="tc-progress-bar" style="width:${pct}%"></div></div>
        </div>

        <div class="tc-tab-bar">
          <button class="tc-tab ${_activeTab === 'progress' ? 'tc-tab-active' : ''}" onclick="OmicsLab.ThesisCoach._setTab('progress')">Chapter Progress</button>
          <button class="tc-tab ${_activeTab === 'write' ? 'tc-tab-active' : ''}" onclick="OmicsLab.ThesisCoach._setTab('write')">Write</button>
          <button class="tc-tab ${_activeTab === 'abstract' ? 'tc-tab-active' : ''}" onclick="OmicsLab.ThesisCoach._setTab('abstract')">Abstract</button>
        </div>

        <div id="tc-tab-content" class="tc-tab-content">
          ${_tabContent()}
        </div>
      </div>`;
  }

  function _tabContent() {
    if (_activeTab === 'progress') return _progressTab();
    if (_activeTab === 'write')    return _writeTab();
    if (_activeTab === 'abstract') return _abstractTab();
    return '';
  }

  function _progressTab() {
    return `<div class="tc-chapter-grid">
      ${_project.chapters.map(ch => {
        const pct = ch.target ? Math.min(Math.round(((ch.words || 0) / ch.target) * 100), 100) : 0;
        const col  = pct >= 80 ? '#3fb950' : pct >= 40 ? '#e3b341' : '#58a6ff';
        return `
          <div class="tc-chapter-card">
            <div class="tc-ch-title">${_esc(ch.title)}</div>
            <div class="tc-ch-meta">${(ch.words || 0).toLocaleString()} / ${ch.target.toLocaleString()} words · ${pct}%</div>
            <div class="tc-ch-bar-wrap"><div class="tc-ch-bar" style="width:${pct}%;background:${col}"></div></div>
            <div class="tc-subsections">
              ${ch.subsections.map(sub => `<div class="tc-sub">${_esc(sub)}</div>`).join('')}
            </div>
            <button class="tc-write-ch-btn" onclick="OmicsLab.ThesisCoach._openChapter('${ch.id}')">Open in Write</button>
          </div>`;
      }).join('')}
    </div>`;
  }

  function _writeTab() {
    const ch = _activeChapter ? _project.chapters.find(c => c.id === _activeChapter) : _project.chapters[0];
    if (!ch) return '<div class="tc-empty">No chapter selected.</div>';

    return `
      <div class="tc-write-layout">
        <div class="tc-chapter-selector">
          ${_project.chapters.map(c =>
            `<button class="tc-ch-sel-btn ${c.id === ch.id ? 'tc-ch-sel-active' : ''}" onclick="OmicsLab.ThesisCoach._openChapter('${c.id}')">${_esc(c.title.slice(0, 30))}</button>`
          ).join('')}
        </div>

        <div class="tc-write-panel">
          <div class="tc-write-header">
            <div class="tc-write-title">${_esc(ch.title)}</div>
            <div class="tc-write-actions">
              <button class="tc-ai-btn" onclick="OmicsLab.ThesisCoach._aiDraft('${ch.id}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>
                AI Draft
              </button>
              <button class="tc-save-ch-btn" onclick="OmicsLab.ThesisCoach._saveChapter('${ch.id}')">Save</button>
            </div>
          </div>

          <div class="tc-subsection-hints">
            ${ch.subsections.map(sub => `<span class="tc-sub-hint">${_esc(sub)}</span>`).join('')}
          </div>

          <textarea class="tc-chapter-textarea" id="tc-ch-text-${ch.id}"
            placeholder="Start writing ${ch.title}…\nSuggested sections: ${ch.subsections.join(' · ')}"
            oninput="OmicsLab.ThesisCoach._countWords('${ch.id}', this.value)">${_esc(ch.text || '')}</textarea>

          <div class="tc-word-count" id="tc-wc-${ch.id}">${(ch.words || 0).toLocaleString()} / ${ch.target.toLocaleString()} words</div>

          <div class="tc-notes-section">
            <label class="tc-label">Chapter notes (not exported)</label>
            <textarea class="tc-notes-textarea" id="tc-ch-notes-${ch.id}"
              placeholder="Supervisor feedback, ideas, references to add…">${_esc(ch.notes || '')}</textarea>
          </div>

          <div id="tc-ai-output-${ch.id}" class="tc-ai-output"></div>
        </div>
      </div>`;
  }

  function _abstractTab() {
    return `
      <div class="tc-abstract-panel">
        <div class="tc-abstract-header">
          <div class="tc-abstract-title">Abstract</div>
          <div class="tc-abstract-actions">
            <button class="tc-ai-btn" onclick="OmicsLab.ThesisCoach._aiAbstract()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>
              Generate with AI
            </button>
          </div>
        </div>
        <div class="tc-abstract-hint">Target: 250–350 words · Background · Methods · Results · Conclusions</div>
        <textarea class="tc-abstract-textarea" id="tc-abstract-text"
          placeholder="Write or generate your abstract here…"
          oninput="OmicsLab.ThesisCoach._countAbstract(this.value)">${_esc(_project.abstract || '')}</textarea>
        <div class="tc-word-count" id="tc-abstract-wc">${_project.abstract ? _wc(_project.abstract) : 0} / 350 words</div>
        <button class="tc-save-ch-btn" style="margin-top:.5rem" onclick="OmicsLab.ThesisCoach._saveAbstract()">Save abstract</button>
        <div id="tc-ai-abstract-output" class="tc-ai-output"></div>
      </div>`;
  }

  /* ─── Chapter actions ─── */
  function _openChapter(id) {
    _activeChapter = id;
    _activeTab = 'write';
    _renderMain();
  }

  function _setTab(tab) {
    _activeTab = tab;
    const el = document.getElementById('tc-tab-content');
    if (el) el.innerHTML = _tabContent();
    /* Update tab active state */
    document.querySelectorAll('.tc-tab').forEach(btn => {
      btn.classList.toggle('tc-tab-active', btn.textContent.toLowerCase().includes(tab === 'progress' ? 'chapter' : tab));
    });
  }

  function _saveChapter(id) {
    const ch = _project.chapters.find(c => c.id === id);
    if (!ch) return;
    const ta = document.getElementById(`tc-ch-text-${id}`);
    const notes = document.getElementById(`tc-ch-notes-${id}`);
    if (ta) { ch.text = ta.value; ch.words = _wc(ta.value); }
    if (notes) ch.notes = notes.value;
    _save();
    _toast('Saved');
    /* Update progress bar */
    const wc = document.getElementById(`tc-wc-${id}`);
    if (wc) wc.textContent = `${ch.words.toLocaleString()} / ${ch.target.toLocaleString()} words`;
  }

  function _saveAbstract() {
    const ta = document.getElementById('tc-abstract-text');
    if (ta) { _project.abstract = ta.value; _save(); _toast('Abstract saved'); }
  }

  function _countWords(id, text) {
    const wc = document.getElementById(`tc-wc-${id}`);
    const ch = _project.chapters.find(c => c.id === id);
    if (wc && ch) wc.textContent = `${_wc(text).toLocaleString()} / ${ch.target.toLocaleString()} words`;
  }

  function _countAbstract(text) {
    const el = document.getElementById('tc-abstract-wc');
    if (el) el.textContent = `${_wc(text)} / 350 words`;
  }

  function _wc(text) { return (text.trim().match(/\S+/g) || []).length; }

  /* ─── AI drafting ─── */
  async function _aiDraft(chapterId) {
    const ch = _project.chapters.find(c => c.id === chapterId);
    if (!ch) return;

    const out = document.getElementById(`tc-ai-output-${chapterId}`);
    if (!out) return;

    const existingText = document.getElementById(`tc-ch-text-${chapterId}`)?.value || '';
    const prompt = `You are helping a ${_project.degree} student write their thesis titled: "${_project.title}".
Research area: ${_project.area}
Research question: ${_project.question || 'not specified'}
Institution: ${_project.institution || 'African university'}

Task: Generate a detailed outline and draft for **${ch.title}** with these subsections: ${ch.subsections.join(', ')}.
${existingText ? `The student has already written: "${existingText.slice(0, 500)}…"\nBuild on and complement what is already written.` : ''}

Target: ${ch.target} words total. Provide:
1. A detailed outline with bullet points for each subsection
2. Draft opening paragraph for each subsection
3. Key references to search for (African cohorts, seminal papers)
4. Suggested figures/tables for this chapter`;

    out.innerHTML = '<div class="tc-ai-loading"><div class="tc-spinner"></div> Drafting with AI…</div>';

    /* Inject context and use Assistant */
    OmicsLab.Assistant.setContext({ page: 'thesis', chapter: ch.title, project: _project.title });

    let fullText = '';
    try {
      await OmicsLab.Assistant._streamDirect(prompt, (chunk) => {
        fullText += chunk;
        out.innerHTML = `<div class="tc-ai-result"><div class="tc-ai-result-header">AI Draft for ${_esc(ch.title)}<button class="tc-insert-btn" onclick="OmicsLab.ThesisCoach._insertDraft('${chapterId}')">Insert into editor</button></div><div id="tc-ai-text-${chapterId}" class="tc-ai-md">${_simplemd(fullText)}</div></div>`;
      }, () => {}, (err) => {
        out.innerHTML = `<div class="tc-ai-error">${_esc(err)}</div>`;
      });
    } catch (err) {
      out.innerHTML = `<div class="tc-ai-error">${_esc(err.message)}</div>`;
    }
  }

  async function _aiAbstract() {
    const out = document.getElementById('tc-ai-abstract-output');
    if (!out) return;

    const findings = _project.chapters
      .filter(c => c.text)
      .map(c => `${c.title}: ${c.text.slice(0, 200)}`)
      .join('\n');

    const prompt = `Write a structured abstract (250–350 words) for this thesis:

Title: ${_project.title}
Degree: ${_project.degree}
Research area: ${_project.area}
Research question: ${_project.question || 'not specified'}
${findings ? 'Key content from chapters:\n' + findings : ''}

Structure the abstract with these sections: Background, Methods, Results, Conclusions.
Make it suitable for African genomics research. Be specific and avoid vague statements.`;

    out.innerHTML = '<div class="tc-ai-loading"><div class="tc-spinner"></div> Generating abstract…</div>';

    let fullText = '';
    try {
      await OmicsLab.Assistant._streamDirect(prompt, (chunk) => {
        fullText += chunk;
        out.innerHTML = `<div class="tc-ai-result"><div class="tc-ai-result-header">AI Abstract Draft<button class="tc-insert-btn" onclick="OmicsLab.ThesisCoach._insertAbstract()">Insert</button></div><div id="tc-ai-abstract-text" class="tc-ai-md">${_simplemd(fullText)}</div></div>`;
      }, () => {}, (err) => { out.innerHTML = `<div class="tc-ai-error">${_esc(err)}</div>`; });
    } catch (err) { out.innerHTML = `<div class="tc-ai-error">${_esc(err.message)}</div>`; }
  }

  function _insertDraft(chId) {
    const src = document.getElementById(`tc-ai-text-${chId}`)?.innerText || '';
    const ta = document.getElementById(`tc-ch-text-${chId}`);
    if (ta && src) { ta.value = (ta.value ? ta.value + '\n\n' : '') + src; _countWords(chId, ta.value); }
  }

  function _insertAbstract() {
    const src = document.getElementById('tc-ai-abstract-text')?.innerText || '';
    const ta = document.getElementById('tc-abstract-text');
    if (ta && src) { ta.value = src; _countAbstract(src); }
  }

  /* ─── Export ─── */
  function _exportThesis() {
    if (!_project) return;
    let text = `${_project.title}\n${'='.repeat(60)}\n`;
    text += `${_project.degree} · ${_project.institution || ''} · ${_project.supervisor || ''}\n\n`;
    if (_project.abstract) text += `ABSTRACT\n${'-'.repeat(40)}\n${_project.abstract}\n\n`;
    _project.chapters.forEach(ch => {
      text += `\n${'='.repeat(60)}\n${ch.title.toUpperCase()}\n${'='.repeat(60)}\n\n`;
      text += ch.text || '[Not yet written]\n';
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'thesis-draft.txt'; a.click();
    URL.revokeObjectURL(url);
  }

  function _resetProject() {
    if (!confirm('Delete this project and start a new one?')) return;
    localStorage.removeItem(STORE);
    _project = null; _activeChapter = null; _activeTab = 'progress';
    _renderSetup();
  }

  /* ─── Utils ─── */
  function _toast(msg) {
    const t = document.createElement('div');
    t.className = 'tc-toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }

  function _simplemd(text) {
    return _esc(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('thesis-section');
    if (!section) return;
    section.dataset.tcReady = '1';
    _project = _load();
    _project ? _renderMain() : _renderSetup();
  }

  /* Expose stream helper for AI calls from within thesis module */
  OmicsLab.Assistant._streamDirect = async function(prompt, onChunk, onDone, onError) {
    const msgs = [{ role: 'user', content: prompt }];
    await OmicsLab.Assistant._streamPublic(msgs, onChunk, onDone, onError);
  };

  /* We need to expose the stream function publicly */
  return { init, _submitSetup, _openChapter, _setTab, _saveChapter, _saveAbstract, _countWords, _countAbstract, _aiDraft, _aiAbstract, _insertDraft, _insertAbstract, _exportThesis, _resetProject };
})();
