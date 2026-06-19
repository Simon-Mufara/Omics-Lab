/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Research Output Tracker (Prompt 39)
   ─ Track publications, datasets, talks, preprints, posters
   ─ Stats dashboard, timeline, CSV/BibTeX export
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.OutputTracker = (function () {

  const STORE_KEY = 'omicslab_outputs';
  const TYPES = ['publication','preprint','dataset','talk','poster','grant','award','other'];
  const TYPE_COLOR = {
    publication:'#3fb950', preprint:'#58a6ff', dataset:'#e3b341',
    talk:'#f97316', poster:'#bc8cff', grant:'#ff6b6b', award:'#e3b341', other:'#8b949e',
  };
  const TYPE_ICON = {
    publication:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    preprint:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    dataset:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    talk:       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    poster:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
    grant:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    award:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
    other:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };

  /* ─── SEED data ─── */
  const SEED_OUTPUTS = [
    { id:'o1', type:'publication', title:'Population genomics of sickle cell disease in West Africa', journal:'Nature Genetics', year:2023, doi:'10.1038/s41588-023-01234-5', authors:'Mufara S, et al.', tags:['SCD','Africa','WGS'], notes:'H3Africa funded', cited:0 },
    { id:'o2', type:'dataset', title:'African SCD whole-genome sequencing dataset (n=450)', journal:'European Nucleotide Archive', year:2023, doi:'ERP145678', authors:'Mufara S, et al.', tags:['SCD','WGS','open'], notes:'Open access ENA deposit', cited:0 },
    { id:'o3', type:'talk', title:'Genomic architecture of haemoglobin disorders in 54 African nations', journal:'H3Africa Annual Congress, Accra', year:2023, doi:'', authors:'Mufara S', tags:['invited','keynote'], notes:'50-min keynote slot', cited:0 },
  ];

  /* ─── Storage ─── */
  function _load() {
    try { const r = localStorage.getItem(STORE_KEY); if (r) return JSON.parse(r); } catch {}
    const d = JSON.parse(JSON.stringify(SEED_OUTPUTS));
    _persist(d); return d;
  }
  function _persist(items) { try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); } catch {} }

  /* ─── State ─── */
  let _view = 'list'; /* list | add | edit | stats */
  let _editId = null;
  let _filterType = 'all';
  let _filterYear = 'all';

  /* ─── Init ─── */
  function init() {
    const sec = document.getElementById('output-tracker-section');
    if (!sec) return;
    if (sec.dataset.otReady) { _render(); return; }
    sec.dataset.otReady = '1';
    _render();
  }

  function _render() {
    const sec = document.getElementById('output-tracker-section');
    if (!sec) return;
    const items = _load();
    const years = [...new Set(items.map(i => i.year))].sort((a,b)=>b-a);

    sec.innerHTML = `
      <div class="ot-wrap">
        <div class="ot-header">
          <div class="ot-header-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            Research Output Tracker
          </div>
          <div class="ot-header-actions">
            <button class="ot-btn ot-btn-ghost" onclick="OmicsLab.OutputTracker._setView('stats')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Dashboard
            </button>
            <button class="ot-btn ot-btn-primary" onclick="OmicsLab.OutputTracker._setView('add')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Output
            </button>
          </div>
        </div>

        ${_view === 'stats' ? _renderStats(items) :
          _view === 'add' || _view === 'edit' ? _renderForm() :
          _renderList(items, years)}
      </div>`;
  }

  function _renderList(items, years) {
    const filtered = items.filter(i =>
      (_filterType === 'all' || i.type === _filterType) &&
      (_filterYear === 'all' || String(i.year) === _filterYear)
    );
    return `
      <div class="ot-filters">
        <div class="ot-filter-row">
          ${['all',...TYPES].map(t => `
            <button class="ot-filter-btn${_filterType===t?' ot-filter-active':''}"
              onclick="OmicsLab.OutputTracker._setFilter('type','${t}')">
              ${t === 'all' ? 'All' : t}
            </button>`).join('')}
        </div>
        <select class="ot-year-sel" onchange="OmicsLab.OutputTracker._setFilter('year',this.value)">
          <option value="all">All years</option>
          ${years.map(y=>`<option value="${y}"${_filterYear===String(y)?' selected':''}>${y}</option>`).join('')}
        </select>
        <div class="ot-export-btns">
          <button class="ot-btn ot-btn-ghost" onclick="OmicsLab.OutputTracker._exportCSV()">CSV</button>
          <button class="ot-btn ot-btn-ghost" onclick="OmicsLab.OutputTracker._exportBibtex()">BibTeX</button>
        </div>
      </div>
      <div class="ot-summary-row">
        ${TYPES.map(t => {
          const cnt = items.filter(i=>i.type===t).length;
          if (!cnt) return '';
          return `<div class="ot-summary-chip" style="border-color:${TYPE_COLOR[t]}22;color:${TYPE_COLOR[t]}">${TYPE_ICON[t]}&nbsp;${cnt} ${t}</div>`;
        }).join('')}
      </div>
      ${filtered.length === 0 ? `<div class="ot-empty">No outputs match the current filter.</div>` :
        `<div class="ot-list">
          ${filtered.map(item => `
            <div class="ot-item">
              <div class="ot-item-type-dot" style="background:${TYPE_COLOR[item.type]}" title="${item.type}"></div>
              <div class="ot-item-body">
                <div class="ot-item-title">${_esc(item.title)}</div>
                <div class="ot-item-meta">
                  <span class="ot-item-type-badge" style="color:${TYPE_COLOR[item.type]};background:${TYPE_COLOR[item.type]}18">${TYPE_ICON[item.type]}&nbsp;${item.type}</span>
                  ${item.journal ? `<span class="ot-item-journal">${_esc(item.journal)}</span>` : ''}
                  <span class="ot-item-year">${item.year}</span>
                  ${item.doi ? `<a class="ot-item-doi" href="https://doi.org/${_esc(item.doi)}" target="_blank" rel="noopener">${_esc(item.doi.slice(0,30))}…</a>` : ''}
                </div>
                ${item.tags?.length ? `<div class="ot-item-tags">${item.tags.map(t=>`<span class="ot-tag">${_esc(t)}</span>`).join('')}</div>` : ''}
              </div>
              <div class="ot-item-actions">
                <button class="ot-item-btn" onclick="OmicsLab.OutputTracker._edit('${item.id}')" title="Edit">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="ot-item-btn ot-item-btn-del" onclick="OmicsLab.OutputTracker._delete('${item.id}')" title="Delete">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>`).join('')}
        </div>`}`;
  }

  function _renderForm() {
    const items = _load();
    const item = _editId ? items.find(i=>i.id===_editId) : null;
    const v = item || { type:'publication', title:'', journal:'', year:new Date().getFullYear(), doi:'', authors:'', tags:'', notes:'' };
    return `
      <div class="ot-form">
        <div class="ot-form-header">
          <button class="ot-btn ot-btn-ghost" onclick="OmicsLab.OutputTracker._setView('list')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <span class="ot-form-title">${_editId ? 'Edit Output' : 'Add New Output'}</span>
        </div>
        <div class="ot-form-body">
          <div class="ot-form-row">
            <label class="ot-label">Type</label>
            <select class="ot-input" id="ot-f-type">
              ${TYPES.map(t=>`<option value="${t}"${v.type===t?' selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
            </select>
          </div>
          <div class="ot-form-row">
            <label class="ot-label">Title *</label>
            <input class="ot-input" id="ot-f-title" value="${_esc(v.title)}" placeholder="Full title of the output">
          </div>
          <div class="ot-form-row">
            <label class="ot-label">Journal / Venue</label>
            <input class="ot-input" id="ot-f-journal" value="${_esc(v.journal)}" placeholder="Journal, conference, or repository">
          </div>
          <div class="ot-form-row-2">
            <div>
              <label class="ot-label">Year *</label>
              <input class="ot-input" id="ot-f-year" type="number" min="1990" max="2035" value="${v.year}">
            </div>
            <div>
              <label class="ot-label">DOI / Accession</label>
              <input class="ot-input" id="ot-f-doi" value="${_esc(v.doi)}" placeholder="10.1038/... or ERP...">
            </div>
          </div>
          <div class="ot-form-row">
            <label class="ot-label">Authors</label>
            <input class="ot-input" id="ot-f-authors" value="${_esc(v.authors)}" placeholder="Author list">
          </div>
          <div class="ot-form-row">
            <label class="ot-label">Tags <span class="ot-hint">(comma-separated)</span></label>
            <input class="ot-input" id="ot-f-tags" value="${Array.isArray(v.tags)?v.tags.join(', '):_esc(v.tags||'')}" placeholder="Africa, SCD, WGS">
          </div>
          <div class="ot-form-row">
            <label class="ot-label">Notes</label>
            <textarea class="ot-input ot-textarea" id="ot-f-notes" placeholder="Internal notes...">${_esc(v.notes)}</textarea>
          </div>
          <div class="ot-form-actions">
            <button class="ot-btn ot-btn-primary" onclick="OmicsLab.OutputTracker._save()">
              ${_editId ? 'Save Changes' : 'Add Output'}
            </button>
            <button class="ot-btn ot-btn-ghost" onclick="OmicsLab.OutputTracker._setView('list')">Cancel</button>
          </div>
        </div>
      </div>`;
  }

  function _renderStats(items) {
    const byType = {};
    TYPES.forEach(t => { byType[t] = items.filter(i=>i.type===t).length; });
    const byYear = {};
    items.forEach(i => { byYear[i.year] = (byYear[i.year]||0)+1; });
    const years = Object.keys(byYear).sort((a,b)=>a-b);
    const maxY = Math.max(...Object.values(byYear), 1);
    return `
      <div class="ot-stats">
        <button class="ot-btn ot-btn-ghost ot-back-btn" onclick="OmicsLab.OutputTracker._setView('list')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to list
        </button>
        <div class="ot-stats-title">Research Output Dashboard</div>
        <div class="ot-kpi-row">
          <div class="ot-kpi"><div class="ot-kpi-num">${items.length}</div><div class="ot-kpi-label">Total Outputs</div></div>
          <div class="ot-kpi"><div class="ot-kpi-num">${byType.publication||0}</div><div class="ot-kpi-label">Publications</div></div>
          <div class="ot-kpi"><div class="ot-kpi-num">${byType.dataset||0}</div><div class="ot-kpi-label">Datasets</div></div>
          <div class="ot-kpi"><div class="ot-kpi-num">${(byType.talk||0)+(byType.poster||0)}</div><div class="ot-kpi-label">Presentations</div></div>
        </div>
        <div class="ot-stats-section-title">By Type</div>
        <div class="ot-type-bars">
          ${TYPES.filter(t=>byType[t]>0).map(t => `
            <div class="ot-type-bar-row">
              <div class="ot-type-bar-label" style="color:${TYPE_COLOR[t]}">${TYPE_ICON[t]}&nbsp;${t}</div>
              <div class="ot-type-bar-track">
                <div class="ot-type-bar-fill" style="width:${Math.round(byType[t]/items.length*100)}%;background:${TYPE_COLOR[t]}"></div>
              </div>
              <div class="ot-type-bar-num">${byType[t]}</div>
            </div>`).join('')}
        </div>
        <div class="ot-stats-section-title">By Year</div>
        <div class="ot-year-chart">
          ${years.map(y => `
            <div class="ot-year-col">
              <div class="ot-year-bar-wrap">
                <div class="ot-year-bar" style="height:${Math.round(byYear[y]/maxY*80)+10}px" title="${byYear[y]} outputs in ${y}"></div>
              </div>
              <div class="ot-year-label">${y}</div>
              <div class="ot-year-val">${byYear[y]}</div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ─── Actions ─── */
  function _setView(v) { _view = v; if (v !== 'edit') _editId = null; _render(); }
  function _setFilter(key, val) { if (key==='type') _filterType=val; else _filterYear=val; _render(); }

  function _edit(id) { _editId = id; _view = 'edit'; _render(); }

  function _delete(id) {
    if (!confirm('Delete this output?')) return;
    _persist(_load().filter(i=>i.id!==id));
    OmicsLab.Notify?.success('Output deleted.');
    _render();
  }

  function _save() {
    const title = document.getElementById('ot-f-title')?.value.trim();
    if (!title) { OmicsLab.Notify?.warning('Title is required.'); return; }
    const items = _load();
    const rawTags = document.getElementById('ot-f-tags')?.value || '';
    const item = {
      id: _editId || ('o'+Date.now()),
      type: document.getElementById('ot-f-type')?.value || 'publication',
      title,
      journal: document.getElementById('ot-f-journal')?.value.trim() || '',
      year: parseInt(document.getElementById('ot-f-year')?.value) || new Date().getFullYear(),
      doi: document.getElementById('ot-f-doi')?.value.trim() || '',
      authors: document.getElementById('ot-f-authors')?.value.trim() || '',
      tags: rawTags.split(',').map(t=>t.trim()).filter(Boolean),
      notes: document.getElementById('ot-f-notes')?.value.trim() || '',
      cited: 0,
    };
    if (_editId) {
      const idx = items.findIndex(i=>i.id===_editId);
      if (idx>=0) items[idx] = { ...items[idx], ...item };
    } else {
      items.unshift(item);
    }
    _persist(items);
    OmicsLab.Notify?.success(_editId ? 'Output updated.' : 'Output added.');
    _setView('list');
  }

  function _exportCSV() {
    const items = _load();
    const header = 'Type,Title,Journal/Venue,Year,DOI,Authors,Tags,Notes';
    const rows = items.map(i =>
      [i.type,i.title,i.journal,i.year,i.doi,i.authors,(i.tags||[]).join(';'),i.notes]
        .map(v => `"${String(v||'').replace(/"/g,'""')}"`)
        .join(',')
    );
    const blob = new Blob([header+'\n'+rows.join('\n')], { type:'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'research-outputs.csv';
    a.click();
    OmicsLab.Notify?.success('CSV downloaded.');
  }

  function _exportBibtex() {
    const items = _load().filter(i=>i.type==='publication'||i.type==='preprint');
    if (!items.length) { OmicsLab.Notify?.info('No publications or preprints to export.'); return; }
    const bib = items.map(i => {
      const key = (i.authors.split(',')[0].trim().replace(/\s+/g,'') || 'Author') + i.year;
      return `@article{${key},\n  title={${i.title}},\n  author={${i.authors}},\n  journal={${i.journal}},\n  year={${i.year}},\n  doi={${i.doi}}\n}`;
    }).join('\n\n');
    const blob = new Blob([bib], { type:'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'research-outputs.bib';
    a.click();
    OmicsLab.Notify?.success('BibTeX downloaded.');
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  return { init, _setView, _setFilter, _edit, _delete, _save, _exportCSV, _exportBibtex };
})();
