/* OmicsLab Research Workspace
   Structured paper drafting with local-first autosave and research shortcuts. */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.ResearchWorkspace = (function () {
  const KEY = 'omicslab_research_workspace_v1';
  const DRAFT_KEY = 'omicslab_research_draft_v1';
  const SHARED_KEY = 'omicslab_shared_papers_v1';
  const AUTOSAVE_MS = 700;
  let saveTimer = null;
  let activeId = null;
  let activeSection = 'abstract';

  const SECTIONS = [
    ['introduction', 'Introduction'],
    ['methods', 'Methods'],
    ['results', 'Results'],
    ['discussion', 'Discussion'],
    ['conclusion', 'Conclusion'],
  ];
  const WRITING_SECTIONS = [['abstract', 'Abstract'], ...SECTIONS, ['references', 'References']];

  const WRITING_GUIDANCE = {
    abstract: {
      title: 'Abstract',
      focus: 'A strong abstract gives the reader the core story in 150–250 words.',
      checklist: ['State the problem or knowledge gap.', 'Name the study aim or question.', 'Summarise the methods briefly.', 'Highlight the main results with key numbers.', 'End with why the findings matter.'],
    },
    introduction: {
      title: 'Introduction',
      focus: 'Set the scene, explain the gap, and guide the reader toward your study question.',
      checklist: ['Start with the disease, population, or biological problem.', 'Summarise what is already known.', 'Identify the gap or unanswered question.', 'State the aim, hypothesis, and why the work matters.', 'Link the study to African health or omics context.'],
    },
    methods: {
      title: 'Methods',
      focus: 'Tell another researcher exactly how the study was done.',
      checklist: ['Describe the cohort, samples, or organisms.', 'List the tools, platforms, and versions used.', 'Explain quality control and analysis steps.', 'State statistical tests, thresholds, and reproducibility details.', 'Include data/code availability and environment details.'],
    },
    results: {
      title: 'Results',
      focus: 'Report the actual findings without over-interpreting them.',
      checklist: ['Lead with the main finding.', 'Use clear, evidence-based statements and key numbers.', 'Reference figures, tables, or QC summaries.', 'Show patterns, variation, and significance where relevant.', 'Keep the text distinct from the discussion.'],
    },
    discussion: {
      title: 'Discussion',
      focus: 'Interpret the results in context and explain their meaning, strengths, and limits.',
      checklist: ['Compare your findings with prior literature.', 'Explain what the results mean biologically or clinically.', 'Discuss limitations and biases honestly.', 'Consider implications for policy, practice, or future work.', 'Give a balanced, evidence-based conclusion.'],
    },
    conclusion: {
      title: 'Conclusion',
      focus: 'Finish with a short, confident message that answers the study question.',
      checklist: ['Restate the main answer in one paragraph.', 'State why the finding matters.', 'Mention the next step or implication.', 'Keep it clear and concise.'],
    },
    references: {
      title: 'References',
      focus: 'Use reliable, traceable sources that support your arguments and methods.',
      checklist: ['Prefer peer-reviewed literature and trusted repositories.', 'Include study accession IDs, datasets, and protocols where relevant.', 'Make sure citations match the text.', 'Track versions of software, workflows, and references.'],
    },
  };

  const TEMPLATES = {
    'RNA-seq study': {
      title: 'Differential gene expression in an African disease cohort',
      keywords: 'RNA-seq, differential expression, African cohort',
      abstract: 'We investigated transcriptomic differences between affected and control samples using a reproducible RNA-seq workflow.',
      sections: {
        introduction: 'State the disease context, knowledge gap, and study hypothesis.',
        methods: 'Describe cohort design, RNA extraction, sequencing platform, FastQC, alignment, quantification, and statistical model.',
        results: 'Report quality-control outcomes, significant genes, effect sizes, and pathway enrichment.',
        discussion: 'Interpret the biological meaning, compare with prior work, and discuss African population context.',
        conclusion: 'Summarise the main finding and the next validation step.',
      },
    },
    'WGS variant study': {
      title: 'Whole-genome sequencing and variant interpretation in an African cohort',
      keywords: 'WGS, variant calling, population genomics, Africa',
      abstract: 'We used whole-genome sequencing and a reproducible variant-calling workflow to characterise genomic variation in an African cohort.',
      sections: {
        introduction: 'Explain the disease or population question and why African genomic diversity matters.',
        methods: 'Describe sample preparation, sequencing, read QC, alignment, duplicate marking, GATK calling, filtering, and annotation.',
        results: 'Report coverage, callable genome, variant counts, allele frequencies, and clinically relevant findings.',
        discussion: 'Interpret population structure, limitations, ethical considerations, and opportunities for follow-up.',
        conclusion: 'State the contribution to genomic medicine or population genetics.',
      },
    },
    'Metagenomics study': {
      title: 'Metagenomic profiling of a field-collected African sample set',
      keywords: 'metagenomics, microbiome, taxonomy, Africa',
      abstract: 'We profiled microbial composition and functional potential using a quality-controlled metagenomic workflow.',
      sections: {
        introduction: 'Describe the ecological or clinical problem and the value of culture-independent sequencing.',
        methods: 'Describe collection, DNA extraction, library preparation, read QC, host depletion, taxonomic classification, and controls.',
        results: 'Report read retention, dominant taxa, diversity, functional pathways, and contamination checks.',
        discussion: 'Interpret the community profile, compare sites or groups, and note sampling limitations.',
        conclusion: 'Summarise the public-health or ecological significance of the findings.',
      },
    },
  };

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value ?? fallback;
    } catch (error) {
      console.warn('[ResearchWorkspace] Could not read local data', error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('[ResearchWorkspace] Autosave failed', error);
      OmicsLab.Toast?.show('Autosave failed. Please export a backup.', 'error');
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value || '').replace(
      /[&<>"']/g,
      (character) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]
    );
  }

  function emptyPaper() {
    return {
      id: `paper_${Date.now()}`,
      title: 'Untitled research paper',
      authors: '',
      keywords: '',
      studyType: 'Original research',
      journalTarget: '',
      preregistration: '',
      dataAvailability: '',
      codeAvailability: '',
      shareStatus: 'private',
      abstract: '',
      sections: Object.fromEntries(SECTIONS.map(([id]) => [id, ''])),
      references: '',
      updatedAt: Date.now(),
    };
  }

  function fromTemplate(name) {
    const template = TEMPLATES[name];
    if (!template) return;
    const paper = { ...emptyPaper(), ...template, sections: { ...emptyPaper().sections, ...template.sections } };
    activeId = paper.id;
    persist(paper, false);
    renderEditor(paper);
    renderList();
    renderSectionList();
  }

  function papers() {
    return read(KEY, []);
  }

  function sharedPapers() { return read(SHARED_KEY, []); }

  function updateSharing(paper, status) {
    paper.shareStatus = status;
    const shared = sharedPapers().filter((item) => item.id !== paper.id);
    if (status === 'shared') write(SHARED_KEY, [paper, ...shared]);
    else write(SHARED_KEY, shared);
  }

  function currentDraft() {
    return read(DRAFT_KEY, null);
  }

  async function hydrateFromCloud(user) {
    if (!user?.id || !OmicsLab.DB?.getNotebookEntries) return;
    try {
      const result = await OmicsLab.DB.getNotebookEntries(user.id);
      if (!result?.ok) return;
      const cloudPapers = (result.data || [])
        .filter((entry) => entry.type === 'research_paper')
        .map((entry) => {
          try {
            return JSON.parse(entry.content);
          } catch (error) {
            console.warn('[ResearchWorkspace] Ignoring invalid cloud paper', error);
            return null;
          }
        })
        .filter(Boolean);
      if (!cloudPapers.length) return;
      const merged = new Map(papers().map((paper) => [paper.id, paper]));
      cloudPapers.forEach((paper) => {
        const local = merged.get(paper.id);
        if (!local || (paper.updatedAt || 0) >= (local.updatedAt || 0)) merged.set(paper.id, paper);
      });
      write(KEY, [...merged.values()].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
      if (activeId) {
        const active = [...merged.values()].find((paper) => paper.id === activeId);
        if (active) renderEditor(active);
      }
      renderList();
    } catch (error) {
      console.error('[ResearchWorkspace] Cloud hydration failed; local papers retained', error);
    }
  }

  function persist(paper, announce = true) {
    const list = papers().filter((item) => item.id !== paper.id);
    paper.updatedAt = Date.now();
    write(KEY, [paper, ...list]);
    write(DRAFT_KEY, paper);
    syncToCloud(paper);
    if (announce) {
      const status = document.getElementById('rw-save-status');
      if (status) status.textContent = `Saved locally · ${new Date().toLocaleTimeString()}`;
    }

    async function syncToCloud(paper) {
      const user = OmicsLab.AuthClerk?.getUser?.() || OmicsLab.Auth?.currentUser?.();
      if (!user?.id || !OmicsLab.DB?.saveNotebookEntry) return;
      try {
        const result = await OmicsLab.DB.saveNotebookEntry(user.id, {
          id: `research_${paper.id}`,
          title: paper.title || 'Untitled research paper',
          content: JSON.stringify(paper),
          type: 'research_paper',
          tags: ['research-workspace'],
          date: new Date(paper.updatedAt).toISOString().slice(0, 10),
        });
        if (result?.ok && result.source === 'cloud') {
          const status = document.getElementById('rw-save-status');
          if (status) status.textContent = `Saved locally and synced · ${new Date().toLocaleTimeString()}`;
        }
      } catch (error) {
        console.error('[ResearchWorkspace] Cloud sync failed; local copy retained', error);
      }
    }

  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    const form = document.getElementById('rw-editor');
    if (!form || !activeId) return;
    saveTimer = setTimeout(() => {
      const paper = collect(form);
      persist(paper);
      renderList();
      renderSectionList();
    }, AUTOSAVE_MS);
    const status = document.getElementById('rw-save-status');
    if (status) status.textContent = 'Saving…';
  }

  function collect(form) {
    const existing = papers().find((item) => item.id === activeId) || currentDraft() || emptyPaper();
    const paper = {
      ...existing,
      id: activeId,
      title: existing.title || '',
      authors: existing.authors || '',
      keywords: existing.keywords || '',
      studyType: existing.studyType || 'Original research',
      journalTarget: existing.journalTarget || '',
      preregistration: existing.preregistration || '',
      dataAvailability: existing.dataAvailability || '',
      codeAvailability: existing.codeAvailability || '',
      shareStatus: existing.shareStatus || 'private',
      sections: { ...(existing.sections || {}) },
      references: existing.references || '',
    };
    form.querySelectorAll('[data-rw-field]').forEach((field) => {
      const key = field.dataset.rwField;
      if (key.startsWith('section.')) paper.sections[key.slice(8)] = field.value;
      else paper[key] = field.value;
    });
    return { ...emptyPaper(), ...paper, sections: { ...emptyPaper().sections, ...paper.sections } };
  }

  function renderList() {
    const list = document.getElementById('rw-documents');
    if (!list) return;
    const items = papers();
    list.innerHTML = items.length
      ? items
          .map(
            (paper) => `
              <button class="rw-document ${paper.id === activeId ? 'is-active' : ''}" data-rw-open="${escapeHtml(paper.id)}">
                <strong>${escapeHtml(paper.title || 'Untitled paper')}</strong>
                <small>${new Date(paper.updatedAt || Date.now()).toLocaleString()}</small>
              </button>`
          )
          .join('')
      : '<p class="rw-muted">Your saved papers will appear here.</p>';
    list.querySelectorAll('[data-rw-open]').forEach((button) => {
      button.addEventListener('click', () => openPaper(button.dataset.rwOpen));
    });
  }

  function renderEditor(paper) {
    const editor = document.getElementById('rw-editor');
    if (!editor) return;
    const current = WRITING_SECTIONS.find(([id]) => id === activeSection) || WRITING_SECTIONS[0];
    const currentValue = current[0] === 'abstract' || current[0] === 'references'
      ? paper[current[0]]
      : paper.sections?.[current[0]];
    const currentLabel = current[1];
    const guidance = WRITING_GUIDANCE[current[0]] || WRITING_GUIDANCE.introduction;
    const completedCount = WRITING_SECTIONS.filter(([id]) => {
      const value = id === 'abstract' || id === 'references' ? paper[id] : paper.sections?.[id];
      return value?.trim();
    }).length;
    editor.innerHTML = `
      <div class="rw-editor-toolbar">
        <div><span class="rw-eyebrow">Research workspace</span><h2>${escapeHtml(paper.title || 'Untitled research paper')}</h2><span id="rw-save-status">Saved locally</span><span id="rw-writing-stats">0 words</span></div>
        <div class="rw-actions">
          <select class="rw-template" id="rw-template" aria-label="Start from an example"><option value="">Start from example…</option>${Object.keys(TEMPLATES).map((name) => `<option>${escapeHtml(name)}</option>`).join('')}</select>
          <button type="button" class="rw-secondary" id="rw-export">Export Markdown</button>
          <button type="button" class="rw-secondary" id="rw-print">Print / PDF</button>
          <button type="button" class="rw-primary" id="rw-new">New paper</button>
        </div>
      </div>
      <div class="rw-paper-details">
        <label class="rw-label">Title<input data-rw-field="title" value="${escapeHtml(paper.title)}" placeholder="Working title"></label>
        <div class="rw-grid-two">
          <label class="rw-label">Authors<input data-rw-field="authors" value="${escapeHtml(paper.authors)}" placeholder="Names and affiliations"></label>
          <label class="rw-label">Keywords<input data-rw-field="keywords" value="${escapeHtml(paper.keywords)}" placeholder="omics, genomics, Africa"></label>
        </div>
        <details class="rw-metadata"><summary>Study metadata & reproducibility</summary>
          <div class="rw-grid-two">
            <label class="rw-label">Study type<select data-rw-field="studyType"><option ${paper.studyType === 'Original research' ? 'selected' : ''}>Original research</option><option ${paper.studyType === 'Systematic review' ? 'selected' : ''}>Systematic review</option><option ${paper.studyType === 'Meta-analysis' ? 'selected' : ''}>Meta-analysis</option><option ${paper.studyType === 'Methods paper' ? 'selected' : ''}>Methods paper</option><option ${paper.studyType === 'Case study' ? 'selected' : ''}>Case study</option></select></label>
            <label class="rw-label">Target journal<input data-rw-field="journalTarget" value="${escapeHtml(paper.journalTarget)}" placeholder="Optional journal or style"></label>
          </div>
          <div class="rw-grid-two">
            <label class="rw-label">Preregistration / protocol<input data-rw-field="preregistration" value="${escapeHtml(paper.preregistration)}" placeholder="OSF, PROSPERO, protocol DOI"></label>
            <label class="rw-label">Data availability<input data-rw-field="dataAvailability" value="${escapeHtml(paper.dataAvailability)}" placeholder="Accession, repository, or access note"></label>
          </div>
          <label class="rw-label">Code and workflow availability<input data-rw-field="codeAvailability" value="${escapeHtml(paper.codeAvailability)}" placeholder="GitHub, workflow version, container or notebook"></label>
        </details>
      </div>
      <div class="rw-guidance-panel" aria-live="polite">
        <div class="rw-guidance-header">
          <span class="rw-eyebrow">Writing coach</span>
          <strong>${guidance.title}</strong>
        </div>
        <p>${escapeHtml(guidance.focus)}</p>
        <ul>${guidance.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div class="rw-format-toolbar" role="toolbar" aria-label="Document formatting">
        <button type="button" class="rw-tool-icon" data-rw-command="undo" title="Undo">↶</button>
        <button type="button" class="rw-tool-icon" data-rw-command="redo" title="Redo">↷</button>
        <span class="rw-toolbar-divider"></span>
        <select class="rw-style-select" data-rw-style aria-label="Text style">
          <option value="normal">Normal text</option><option value="heading">Heading</option><option value="subheading">Subheading</option>
        </select>
        <select class="rw-style-select rw-font-select" data-rw-font aria-label="Font">
          <option value="Georgia">Georgia</option><option value="Arial">Arial</option><option value="Verdana">Verdana</option><option value="monospace">Monospace</option>
        </select>
        <select class="rw-style-select rw-size-select" data-rw-size aria-label="Font size">
          <option value="1rem">11</option><option value="1.1rem" selected>12</option><option value="1.25rem">14</option><option value="1.45rem">16</option><option value="1.8rem">20</option>
        </select>
        <span class="rw-toolbar-divider"></span>
        <button type="button" data-rw-format="heading" title="Insert heading">H</button>
        <button type="button" data-rw-format="bold" title="Bold text"><strong>B</strong></button>
        <button type="button" data-rw-format="italic" title="Italic text"><em>I</em></button>
        <button type="button" data-rw-format="bullet" title="Bullet list">• List</button>
        <button type="button" data-rw-format="checklist" title="Checklist">☑ List</button>
        <button type="button" data-rw-format="quote" title="Quote">“ Quote</button>
        <span class="rw-toolbar-divider"></span>
        <button type="button" class="rw-tool-icon" data-rw-align="left" title="Align left">≡</button>
        <button type="button" class="rw-tool-icon" data-rw-align="center" title="Center">≡</button>
        <button type="button" class="rw-tool-icon" data-rw-align="right" title="Align right">≡</button>
        <button type="button" class="rw-tool-icon" data-rw-command="fullscreen" title="Focus mode">⛶</button>
        <span class="rw-page-mode">Academic document · autosaved locally</span>
      </div>
      <div class="rw-ruler" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>
      <div class="rw-writing-heading"><div><span class="rw-eyebrow">Write in any order</span><h3>${currentLabel}</h3></div><span class="rw-progress">${completedCount}/${WRITING_SECTIONS.length} sections drafted</span></div>
      <div class="rw-share-row"><span>${paper.shareStatus === 'shared' ? 'Shared with the OmicsLab community' : 'Private draft'}</span><button type="button" class="rw-secondary" id="rw-share">${paper.shareStatus === 'shared' ? 'Stop sharing' : 'Share paper'}</button></div>
      <label class="rw-label rw-focus-field">${currentLabel}<textarea data-rw-field="${current[0] === 'abstract' || current[0] === 'references' ? current[0] : `section.${current[0]}`}" rows="18" autofocus placeholder="Write your ${currentLabel.toLowerCase()} here...">${escapeHtml(currentValue)}</textarea></label>
      <div class="rw-section-actions">
        <button type="button" class="rw-secondary" id="rw-prev">← Previous</button>
        <button type="button" class="rw-secondary" id="rw-next">Next section →</button>
      </div>`;
    editor.querySelectorAll('[data-rw-field]').forEach((field) => field.addEventListener('input', scheduleSave));
    editor.querySelectorAll('[data-rw-field]').forEach((field) => field.addEventListener('input', updateWritingStats));
    editor.querySelector('#rw-new').addEventListener('click', () => openPaper());
    editor.querySelector('#rw-export').addEventListener('click', exportMarkdown);
    editor.querySelector('#rw-print').addEventListener('click', () => window.print());
    editor.querySelector('#rw-share').addEventListener('click', () => {
      const next = collect(editor);
      updateSharing(next, next.shareStatus === 'shared' ? 'private' : 'shared');
      persist(next);
      renderEditor(next);
      OmicsLab.Toast?.show(next.shareStatus === 'shared' ? 'Paper shared with the community' : 'Paper is private again', 'success');
    });
    editor.querySelector('#rw-template').addEventListener('change', (event) => {
      if (event.target.value) fromTemplate(event.target.value);
    });
    editor.querySelector('#rw-prev').addEventListener('click', () => moveSection(-1));
    editor.querySelector('#rw-next').addEventListener('click', () => moveSection(1));
    editor.querySelectorAll('[data-rw-format]').forEach((button) => {
      button.addEventListener('click', () => formatSelection(button.dataset.rwFormat));
    });
    editor.querySelector('[data-rw-style]').addEventListener('change', (event) => applyTextStyle(event.target.value));
    editor.querySelector('[data-rw-font]').addEventListener('change', (event) => applyEditorStyle('fontFamily', event.target.value));
    editor.querySelector('[data-rw-size]').addEventListener('change', (event) => applyEditorStyle('fontSize', event.target.value));
    editor.querySelectorAll('[data-rw-align]').forEach((button) => button.addEventListener('click', () => applyEditorStyle('textAlign', button.dataset.rwAlign)));
    editor.querySelectorAll('[data-rw-command]').forEach((button) => button.addEventListener('click', () => runEditorCommand(button.dataset.rwCommand)));
    updateWritingStats();
  }

  function getEditorField() {
    return document.querySelector('.rw-focus-field textarea');
  }

  function applyEditorStyle(property, value) {
    const field = getEditorField();
    if (!field) return;
    field.style[property] = value;
    field.focus();
  }

  function applyTextStyle(style) {
    const field = getEditorField();
    if (!field) return;
    field.classList.toggle('rw-text-heading', style === 'heading');
    field.classList.toggle('rw-text-subheading', style === 'subheading');
    field.focus();
  }

  function runEditorCommand(command) {
    const field = getEditorField();
    if (command === 'undo') document.execCommand('undo');
    if (command === 'redo') document.execCommand('redo');
    if (command === 'fullscreen') document.getElementById('rw-editor')?.classList.toggle('rw-editor-focus-mode');
    field?.focus();
  }

  function formatSelection(format) {
    const field = getEditorField();
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = field.value.slice(start, end) || 'your text';
    const wrappers = {
      heading: `## ${selected}`,
      bold: `**${selected}**`,
      italic: `*${selected}*`,
      bullet: selected.split('\n').map((line) => `- ${line}`).join('\n'),
      checklist: selected.split('\n').map((line) => `- [ ] ${line}`).join('\n'),
      quote: selected.split('\n').map((line) => `> ${line}`).join('\n'),
    };
    const replacement = wrappers[format];
    if (!replacement) return;
    field.setRangeText(replacement, start, end, 'select');
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.focus();
  }

  function moveSection(delta) {
    const form = document.getElementById('rw-editor');
    const paper = form ? collect(form) : papers().find((item) => item.id === activeId);
    if (!paper) return;
    const currentIndex = WRITING_SECTIONS.findIndex(([id]) => id === activeSection);
    activeSection = WRITING_SECTIONS[(currentIndex + delta + WRITING_SECTIONS.length) % WRITING_SECTIONS.length][0];
    renderEditor(paper);
    document.querySelector('.rw-focus-field textarea')?.focus();
  }

  function updateWritingStats() {
    const form = document.getElementById('rw-editor');
    const stats = document.getElementById('rw-writing-stats');
    if (!form || !stats) return;
    const text = Array.from(form.querySelectorAll('textarea, input[data-rw-field]'))
      .map((field) => field.value)
      .join(' ')
      .trim();
    const words = text ? text.split(/\s+/).length : 0;
    stats.textContent = `${words.toLocaleString()} words`;
  }

  function openPaper(id) {
    const saved = id ? (papers().find((paper) => paper.id === id) || sharedPapers().find((paper) => paper.id === id)) : null;
    const draft = !id && currentDraft();
    const paper = saved || draft || emptyPaper();
    activeId = paper.id;
    if (!saved) persist(paper, false);
    renderEditor(paper);
    renderList();
    renderSectionList();
  }

  function exportMarkdown() {
    const form = document.getElementById('rw-editor');
    if (!form) return;
    const paper = collect(form);
    persist(paper);
    const body = [
      `# ${paper.title || 'Untitled research paper'}`,
      `**Authors:** ${paper.authors || 'Not specified'}`,
      `**Keywords:** ${paper.keywords || 'Not specified'}`,
      '',
      '## Abstract',
      paper.abstract,
      ...SECTIONS.flatMap(([id, label]) => ['', `## ${label}`, paper.sections[id] || '']),
      '',
      '## References',
      paper.references || 'No references added.',
    ].join('\n');
    const blob = new Blob([body], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(paper.title || 'research-paper').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    OmicsLab.Toast?.show('Paper exported as Markdown', 'success');
  }

  function openSearch(provider) {
    const query = document.getElementById('rw-search-query')?.value.trim();
    if (!query) return;
    if (provider !== 'pubmed') {
      renderSearchResults([{ title: `${provider === 'google' ? 'Scholar' : 'Web'} search`, summary: 'External search providers cannot be embedded safely. Use PubMed inside OmicsLab or save this query to your paper.', url: `https://www.google.com/search?q=${encodeURIComponent(query)}` }]);
      return;
    }
    const panel = document.getElementById('rw-search-results');
    if (panel) panel.innerHTML = '<p class="rw-muted">Searching PubMed…</p>';
    fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=6&term=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        const ids = data?.esearchresult?.idlist || [];
        if (!ids.length) return renderSearchResults([{ title: 'No PubMed results', summary: 'Try a broader topic, gene, disease, or population term.' }]);
        return fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`)
          .then((response) => response.json())
          .then((summary) => renderSearchResults(ids.map((id) => ({ title: summary.result?.[id]?.title || `PubMed article ${id}`, summary: summary.result?.[id]?.sortfirstauthor || 'PubMed record', url: `https://pubmed.ncbi.nlm.nih.gov/${id}/` }))));
      })
      .catch(() => renderSearchResults([{ title: 'PubMed is temporarily unavailable', summary: 'Your draft is safe. Try the search again shortly.' }]));
  }

  function renderSearchResults(results) {
    const panel = document.getElementById('rw-search-results');
    if (!panel) return;
    panel.innerHTML = results.map((item) => `<article class="rw-result"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.summary || '')}</small>${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Open record</a>` : ''}</article>`).join('');
  }

  function init() {
    const section = document.getElementById('research-workspace-section');
    if (!section || section.dataset.ready) return;
    section.dataset.ready = 'true';
    const signedIn = !!(OmicsLab.AuthClerk?.getUser?.() || OmicsLab.Auth?.currentUser?.());
    section.innerHTML = `
      <div class="rw-shell">
        <header class="rw-header">
          <div><span class="rw-eyebrow">Integrated research room</span><h1>Write, search, and analyse without losing your place</h1><p>Draft locally, jump to OmicsLab tools, and keep your work available between sessions.</p></div>
          <div class="rw-cloud-note">${signedIn ? 'Cloud sync ready' : 'Local-first autosave'}<br><small>${signedIn ? 'Your signed-in workspace syncs to Supabase' : 'Sign in to sync across devices'}</small>${signedIn ? '' : '<button class="rw-login-link" id="rw-login">Sign in for cloud sync</button>'}<span id="rw-data-attachment" class="rw-data-attachment" role="status"></span></div>
        </header>
        <div class="rw-search-bar">
          <input id="rw-search-query" placeholder="Search PubMed inside your workspace" aria-label="Literature search query">
          <button data-rw-search="pubmed">PubMed</button><button data-rw-search="google">Scholar</button><button data-rw-search="web">Web</button>
          <div id="rw-search-results" class="rw-search-results" aria-live="polite"><p class="rw-muted">Search results will appear here without replacing your paper.</p></div>
        </div>
        <div class="rw-layout">
          <aside class="rw-sidebar"><div class="rw-sidebar-title">My papers <button id="rw-new-side" aria-label="Create new paper">+</button></div><div id="rw-documents"></div><div class="rw-section-nav"><strong>Paper sections</strong><div id="rw-section-list"></div></div><div class="rw-shortcuts"><strong>Research room</strong><button type="button" id="rw-guide-toggle">Research structures & publishing guide</button><button type="button" id="rw-shared-toggle">Community papers</button><button onclick="OmicsLab.Router.navigate('labnotebook')">Lab notebook</button><button onclick="OmicsLab.Router.navigate('datasets')">Datasets</button></div><div id="rw-resource-panel" class="rw-resource-panel"></div></aside>
          <main id="rw-editor" class="rw-editor" aria-live="polite"></main>
        </div>
      </div>`;
    section.querySelector('#rw-new-side').addEventListener('click', () => openPaper());
    section.querySelector('#rw-guide-toggle').addEventListener('click', () => {
      const panel = section.querySelector('#rw-resource-panel');
      panel.innerHTML = `
        <strong>Research writing guide</strong>
        <p><b>Abstract:</b> State the problem, aim, key methods, main result, and why it matters in 150–250 words.</p>
        <p><b>Introduction:</b> Explain the context, what is known, what is missing, and your hypothesis or objective.</p>
        <p><b>Methods:</b> Describe the design, samples, platforms, tools, versions, analysis settings, and reproducibility steps.</p>
        <p><b>Results:</b> Present the data clearly, with key numbers, patterns, and figures or tables.</p>
        <p><b>Discussion:</b> Interpret the findings, compare to prior work, address limitations, and explain the impact.</p>
        <p><b>Conclusion:</b> End with the main takeaway and the next research step.</p>
        <p><b>Best practice:</b> keep a versioned dataset, workflow script, environment details, accession IDs, and a clear data/code availability statement.</p>
      `;
    });
    section.querySelector('#rw-shared-toggle').addEventListener('click', () => {
      const panel = section.querySelector('#rw-resource-panel');
      const items = sharedPapers();
      panel.innerHTML = `<strong>Community papers</strong>${items.length ? items.map((item) => `<button type="button" class="rw-community-paper" data-rw-community="${escapeHtml(item.id)}">${escapeHtml(item.title)}</button>`).join('') : '<p class="rw-muted">No papers have been shared yet.</p>'}`;
      panel.querySelectorAll('[data-rw-community]').forEach((button) => button.addEventListener('click', () => openPaper(button.dataset.rwCommunity)));
    });
    section.querySelector('#rw-login')?.addEventListener('click', () => {
      if (OmicsLab.AuthClerk?.signIn) OmicsLab.AuthClerk.signIn();
      else OmicsLab.Auth?.openModal?.('signin');
    });
    section.querySelectorAll('[data-rw-search]').forEach((button) => {
      button.addEventListener('click', () => openSearch(button.dataset.rwSearch));
    });
    document.addEventListener('omicslab:data-ready', (event) => {
      const detail = event.detail;
      const status = section.querySelector('#rw-data-attachment');
      if (!detail || !status) return;
      status.textContent = `Dataset ready for analysis: ${detail.name} (${detail.kind})`;
    });
    renderSectionList();
    OmicsLab.AuthClerk?.onAuthChange?.(hydrateFromCloud);
    OmicsLab.Auth?.onAuthStateChange?.(hydrateFromCloud);
    OmicsLab.DB?.onReady?.(() => hydrateFromCloud(OmicsLab.AuthClerk?.getUser?.() || OmicsLab.Auth?.currentUser?.()));
    openPaper();
  }

  function renderSectionList() {
    const list = document.getElementById('rw-section-list');
    const paper = papers().find((item) => item.id === activeId) || currentDraft() || emptyPaper();
    if (!list) return;
    list.innerHTML = WRITING_SECTIONS.map(([id, label]) => {
      const value = id === 'abstract' || id === 'references' ? paper[id] : paper.sections?.[id];
      return `<button type="button" class="rw-section-link ${id === activeSection ? 'is-active' : ''}" data-rw-section="${id}"><span>${escapeHtml(label)}</span><small>${value?.trim() ? 'Drafted' : 'Start'}</small></button>`;
    }).join('');
    list.querySelectorAll('[data-rw-section]').forEach((button) => {
      button.addEventListener('click', () => {
        const form = document.getElementById('rw-editor');
        const paperNow = form ? collect(form) : paper;
        activeSection = button.dataset.rwSection;
        renderEditor(paperNow);
        renderSectionList();
        document.querySelector('.rw-focus-field textarea')?.focus();
      });
    });
  }

  return { init };
})();
