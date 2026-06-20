/* ═══════════════════════════════════════════════════════
   OmicsLab — Digital Lab Notebook (Part 6)
   Structured electronic lab notebook for bioinformatics
   experiments. Entries stored in localStorage. Supports
   markdown-ish formatting, tags, export.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.LabNotebook = (function () {

  const KEY = 'omicslab_labnotebook_entries';
  let _editingId = null;

  function _getEntries() { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function _saveEntries(e) { localStorage.setItem(KEY, JSON.stringify(e)); }

  const ENTRY_TYPES = [
    { value:'experiment', label:'Experiment', color:'#58a6ff' },
    { value:'analysis', label:'Analysis', color:'#3fb950' },
    { value:'result', label:'Result', color:'#e3b341' },
    { value:'protocol', label:'Protocol', color:'#bc8cff' },
    { value:'meeting', label:'Meeting', color:'#f97316' },
    { value:'idea', label:'Idea', color:'#79c0ff' },
  ];

  function _typeColor(type) { return ENTRY_TYPES.find(t => t.value === type)?.color || '#8b949e'; }

  function _renderList(q = '', tag = '', type = '') {
    const entries = _getEntries().filter(e => {
      const txt = [e.title, e.content, ...(e.tags || [])].join(' ').toLowerCase();
      return (!q || txt.includes(q.toLowerCase()))
        && (!tag || (e.tags || []).includes(tag))
        && (!type || e.type === type);
    }).sort((a, b) => b.date.localeCompare(a.date));
    const el = document.getElementById('ln-list');
    if (!el) return;
    if (!entries.length) { el.innerHTML = '<div class="ln-empty">No entries yet. Click "New Entry" to start.</div>'; return; }
    el.innerHTML = entries.map(e => {
      const col = _typeColor(e.type);
      const preview = e.content.replace(/[#*`]/g,'').slice(0,140) + (e.content.length > 140 ? '…' : '');
      return `<div class="ln-card" style="border-left-color:${col}" onclick="OmicsLab.LabNotebook._viewEntry('${e.id}')">
        <div class="ln-card-hdr">
          <span class="ln-card-title">${e.title || 'Untitled'}</span>
          <div class="ln-card-meta">
            <span class="ln-type-badge" style="color:${col};border-color:${col}30">${e.type || 'note'}</span>
            <span class="ln-date">${e.date}</span>
          </div>
        </div>
        <div class="ln-card-preview">${preview}</div>
        ${e.tags?.length ? `<div class="ln-card-tags">${e.tags.map(t => `<span class="ln-tag">${t}</span>`).join('')}</div>` : ''}
      </div>`;
    }).join('');
  }

  function _filter() {
    const q = document.getElementById('ln-q')?.value || '';
    const tag = document.getElementById('ln-tag-filter')?.value || '';
    const type = document.getElementById('ln-type-filter')?.value || '';
    _renderList(q, tag, type);
  }

  function _getAllTags() { return [...new Set(_getEntries().flatMap(e => e.tags || []))].sort(); }

  function _showEditor(id = null) {
    _editingId = id;
    const entry = id ? _getEntries().find(e => e.id === id) : null;
    const overlay = document.createElement('div');
    overlay.className = 'ln-editor-overlay';
    overlay.id = 'ln-editor-overlay';
    overlay.innerHTML = `
      <div class="ln-editor">
        <div class="ln-editor-hdr">
          <span class="ln-editor-title">${id ? 'Edit Entry' : 'New Lab Notebook Entry'}</span>
          <button class="ln-editor-close" onclick="document.getElementById('ln-editor-overlay')?.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="ln-editor-row">
          <input class="ln-editor-input" id="ln-e-title" placeholder="Entry title" value="${entry?.title || ''}">
          <select class="ln-editor-sel" id="ln-e-type">
            ${ENTRY_TYPES.map(t => `<option value="${t.value}" ${entry?.type===t.value?'selected':''}>${t.label}</option>`).join('')}
          </select>
        </div>
        <textarea class="ln-editor-textarea" id="ln-e-content" placeholder="Write your notes here. Supports plain markdown formatting.">${entry?.content || ''}</textarea>
        <div class="ln-editor-row">
          <input class="ln-editor-input" id="ln-e-tags" placeholder="Tags (comma-separated)" value="${(entry?.tags || []).join(', ')}">
          <input class="ln-editor-input" id="ln-e-date" type="date" value="${entry?.date || new Date().toISOString().slice(0,10)}">
        </div>
        <div class="ln-editor-actions">
          ${id ? `<button class="ln-delete-btn" onclick="OmicsLab.LabNotebook._deleteEntry('${id}')">Delete</button>` : '<span></span>'}
          <div style="display:flex;gap:.5rem">
            <button class="ln-cancel-btn" onclick="document.getElementById('ln-editor-overlay')?.remove()">Cancel</button>
            <button class="ln-save-btn" onclick="OmicsLab.LabNotebook._saveEntry()">Save Entry</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('ln-e-content')?.focus();
  }

  function _saveEntry() {
    const title = document.getElementById('ln-e-title')?.value.trim() || 'Untitled';
    const content = document.getElementById('ln-e-content')?.value.trim() || '';
    const type = document.getElementById('ln-e-type')?.value || 'experiment';
    const tags = (document.getElementById('ln-e-tags')?.value || '').split(',').map(t => t.trim()).filter(Boolean);
    const date = document.getElementById('ln-e-date')?.value || new Date().toISOString().slice(0,10);
    const entries = _getEntries();
    if (_editingId) {
      const idx = entries.findIndex(e => e.id === _editingId);
      if (idx >= 0) entries[idx] = { ...entries[idx], title, content, type, tags, date, updatedAt: new Date().toISOString() };
    } else {
      entries.push({ id: 'ln_' + Date.now(), title, content, type, tags, date, createdAt: new Date().toISOString() });
    }
    _saveEntries(entries);
    document.getElementById('ln-editor-overlay')?.remove();
    _refreshTagFilter();
    _filter();
  }

  function _viewEntry(id) {
    _showEditor(id);
  }

  function _deleteEntry(id) {
    if (!confirm('Delete this entry?')) return;
    const entries = _getEntries().filter(e => e.id !== id);
    _saveEntries(entries);
    document.getElementById('ln-editor-overlay')?.remove();
    _refreshTagFilter();
    _filter();
  }

  function _refreshTagFilter() {
    const sel = document.getElementById('ln-tag-filter');
    if (!sel) return;
    const cur = sel.value;
    const tags = _getAllTags();
    sel.innerHTML = `<option value="">All tags</option>` + tags.map(t => `<option ${t===cur?'selected':''}>${t}</option>`).join('');
  }

  /* ── FAIR / ISA-Tab JSON Export (Prompt 47) ── */
  function _exportISATab() {
    const entries = _getEntries().sort((a, b) => b.date.localeCompare(a.date));
    if (!entries.length) { OmicsLab.Toast?.show('No entries to export', 'info'); return; }

    const isa = {
      '@context': 'https://schema.org/',
      '@type': 'Dataset',
      name: 'OmicsLab Lab Notebook',
      description: 'Lab notebook entries exported from OmicsLab Simulator in ISA-Tab/JSON-LD format',
      creator: { '@type': 'Person', name: 'OmicsLab User' },
      dateCreated: new Date().toISOString(),
      license: 'https://creativecommons.org/licenses/by/4.0/',
      isAccessibleForFree: true,
      hasPart: entries.map(e => ({
        '@type': 'CreativeWork',
        identifier: e.id,
        name: e.title,
        dateCreated: e.date,
        genre: e.type,
        keywords: (e.tags || []).join(', '),
        text: e.content,
        encodingFormat: 'text/plain',
      })),
      /* ISA-Tab style investigation block */
      investigation: {
        title: 'OmicsLab Research Log',
        description: 'Exported from OmicsLab Lab Notebook',
        submissionDate: new Date().toISOString().slice(0, 10),
        publicReleaseDate: new Date().toISOString().slice(0, 10),
        studies: entries.filter(e => e.type === 'experiment').map(e => ({
          identifier: e.id,
          title: e.title,
          description: e.content,
          studyDesignDescriptor: { term: e.type, termAccessionNumber: '', termSourceRef: 'OBO' },
        })),
      },
    };

    const blob = new Blob([JSON.stringify(isa, null, 2)], { type: 'application/ld+json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lab-notebook-isa.jsonld'; a.click();
    OmicsLab.Toast?.show('Exported ISA-Tab JSON-LD', 'success');
  }

  function _exportMarkdown() {
    const entries = _getEntries().sort((a, b) => b.date.localeCompare(a.date));
    if (!entries.length) return;
    const md = entries.map(e => `## ${e.date} — ${e.title} (${e.type})\n\n${e.content}\n\n${e.tags?.length ? '_Tags: ' + e.tags.join(', ') + '_' : ''}`).join('\n\n---\n\n');
    const blob = new Blob([`# OmicsLab Lab Notebook Export\nExported: ${new Date().toLocaleString()}\n\n---\n\n` + md], { type:'text/markdown' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lab-notebook.md'; a.click();
  }

  function init() {
    const section = document.getElementById('labnotebook-section');
    if (!section || section.dataset.lnReady) return;
    section.dataset.lnReady = '1';
    section.innerHTML = `
      <div class="ln-wrap">
        <div class="ln-header">
          <div class="ln-header-left">
            <div class="ln-header-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Digital Lab Notebook
            </div>
            <div class="ln-header-sub">Structured notes for experiments, analyses, results — stored offline in your browser</div>
          </div>
          <div class="ln-header-actions">
            <button class="ln-export-btn" onclick="OmicsLab.LabNotebook._exportMarkdown()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export MD
            </button>
            <button class="ln-export-btn" onclick="OmicsLab.LabNotebook._exportISATab()" title="Export as FAIR ISA-Tab JSON-LD">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              FAIR Export
            </button>
            <button class="ln-new-btn" onclick="OmicsLab.LabNotebook._showEditor()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Entry
            </button>
          </div>
        </div>
        <div class="ln-filters">
          <input class="ln-search" id="ln-q" placeholder="Search entries..." oninput="OmicsLab.LabNotebook._filter()">
          <select class="ln-filter-sel" id="ln-type-filter" onchange="OmicsLab.LabNotebook._filter()">
            <option value="">All types</option>
            ${ENTRY_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
          <select class="ln-filter-sel" id="ln-tag-filter" onchange="OmicsLab.LabNotebook._filter()">
            <option value="">All tags</option>
          </select>
        </div>
        <div id="ln-list" class="ln-list"></div>
      </div>`;
    _refreshTagFilter();
    _renderList();
  }

  return { init, _showEditor, _saveEntry, _deleteEntry, _viewEntry, _exportMarkdown, _exportISATab, _filter };
})();
