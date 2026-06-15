/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Global Search
   Full-text search across workflows, diseases, tools, equipment,
   and Q&A answers. Keyboard accessible. Offline-ready.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Search = (function () {

  let _index = null;
  let _open  = false;

  /* ─── Build the search index from existing data ─── */
  function _buildIndex() {
    if (_index) return _index;
    _index = [];

    /* Workflows */
    try {
      Object.values(OmicsLab.Workflows || {}).forEach(domain => {
        if (!domain || !domain.workflows) return;
        domain.workflows.forEach(wf => {
          _index.push({
            type: 'workflow',
            icon: '🧪',
            title: wf.name || wf.id,
            desc: wf.desc || wf.description || domain.label || '',
            tags: [domain.label, wf.disease, wf.id].filter(Boolean).join(' '),
            action: () => {
              document.getElementById('domain-section')?.scrollIntoView({ behavior: 'smooth' });
            },
            section: 'Workflows',
          });
        });
      });
    } catch {}

    /* Diseases */
    try {
      const diseases = OmicsLab.DISEASES || [];
      (Array.isArray(diseases) ? diseases : Object.values(diseases)).forEach(d => {
        if (!d || !d.name) return;
        _index.push({
          type: 'disease',
          icon: '🦠',
          title: d.name,
          desc: d.category ? `${d.category} · ${d.stats || ''}` : (d.stats || ''),
          tags: [d.category, d.name, ...(d.biomarkers || []), ...(d.workflows || [])].filter(Boolean).join(' '),
          action: () => {
            document.getElementById('disease-explorer-section')?.scrollIntoView({ behavior: 'smooth' });
          },
          section: 'Disease Explorer',
        });
      });
    } catch {}

    /* Tools */
    try {
      const tools = OmicsLab.TOOLS || [];
      (Array.isArray(tools) ? tools : Object.values(tools)).forEach(t => {
        if (!t || !t.name) return;
        _index.push({
          type: 'tool',
          icon: '🛠️',
          title: t.name,
          desc: t.desc || t.description || t.category || '',
          tags: [t.name, t.category, t.input, t.output, t.use].filter(Boolean).join(' '),
          action: () => {
            document.getElementById('tool-explorer-section')?.scrollIntoView({ behavior: 'smooth' });
          },
          section: 'Tool Explorer',
        });
      });
    } catch {}

    /* Equipment / Gallery */
    try {
      const equip = OmicsLab.EQUIPMENT || OmicsLab.Gallery || [];
      (Array.isArray(equip) ? equip : Object.values(equip)).forEach(e => {
        if (!e || !e.name) return;
        _index.push({
          type: 'equipment',
          icon: '🔬',
          title: e.name,
          desc: e.manufacturer ? `${e.manufacturer} · ${e.type || ''}` : (e.type || e.category || ''),
          tags: [e.name, e.manufacturer, e.type, e.category, ...(e.applications || [])].filter(Boolean).join(' '),
          action: () => {
            document.getElementById('equipment-gallery-section')?.scrollIntoView({ behavior: 'smooth' });
          },
          section: 'Equipment Gallery',
        });
      });
    } catch {}

    /* Q&A entries */
    try {
      const qa = OmicsLab.QAEngine?._entries || OmicsLab.QA_DATA || [];
      (Array.isArray(qa) ? qa : Object.values(qa)).forEach(q => {
        if (!q || !q.q) return;
        _index.push({
          type: 'qa',
          icon: '💬',
          title: q.q,
          desc: typeof q.a === 'string' ? q.a.slice(0, 120) + (q.a.length > 120 ? '…' : '') : '',
          tags: [q.q, q.category, ...(q.tags || [])].filter(Boolean).join(' '),
          action: () => {
            const qaInput = document.getElementById('qa-input');
            document.getElementById('qa-section')?.scrollIntoView({ behavior: 'smooth' });
            if (qaInput) { qaInput.value = q.q; qaInput.dispatchEvent(new Event('input')); }
          },
          section: 'Ask OmicsLab',
        });
      });
    } catch {}

    /* Repositories */
    try {
      const repos = OmicsLab.REPOSITORIES || [];
      (Array.isArray(repos) ? repos : Object.values(repos)).forEach(r => {
        if (!r || !r.name) return;
        _index.push({
          type: 'repo',
          icon: '🗄️',
          title: r.name,
          desc: r.desc || r.description || '',
          tags: [r.name, r.category, r.url].filter(Boolean).join(' '),
          action: () => {
            document.getElementById('repo-explorer-section')?.scrollIntoView({ behavior: 'smooth' });
          },
          section: 'Data Repositories',
        });
      });
    } catch {}

    /* Static section entries for navigation */
    const staticEntries = [
      { icon: '🧬', title: 'Bioinformatics Pipeline Guide', desc: 'Follow a complete WGS pipeline from FASTQ to variant annotation', section: 'Learn', sectionId: 'bioinfo-pipeline-section' },
      { icon: '⚙️', title: 'HPC Training', desc: 'SLURM job builder, queue simulator, workflow engines', section: 'Learn', sectionId: 'hpc-training-section' },
      { icon: '🎓', title: 'Curriculum Learning Paths', desc: 'Wet-Lab, Bioinformatician, and Public Health tracks', section: 'Learn', sectionId: 'curriculum-section' },
      { icon: '🏆', title: 'Badges & Certificates', desc: '17 achievements with printable PDF certificates', section: 'Learn', sectionId: 'badges-section' },
      { icon: '🌍', title: 'Africa Science Hub', desc: 'H3Africa, data governance, population genomics, One Health', section: 'Africa', sectionId: 'africa-hub-section' },
      { icon: '🗺️', title: 'Africa Genomics Map', desc: 'Interactive map of 20+ active genomics labs across Africa', section: 'Africa', sectionId: 'africa-map-section' },
      { icon: '♻️', title: 'Reproducibility Hub', desc: 'Submit studies, get FAIR scores, browse community research', section: 'Research', sectionId: 'repro-hub-section' },
      { icon: '🔭', title: 'Research Project Mode', desc: 'Design a reproducible omics study from scratch', section: 'Research', sectionId: 'research-mode-section' },
      { icon: '🏫', title: 'Workshop & Instructor Mode', desc: 'Create sessions, track student progress, export reports', section: 'Research', sectionId: 'workshop-section' },
      { icon: '⚖️', title: 'Compare Workflows', desc: 'Side-by-side cost, time, and instrument comparison', section: 'Lab', sectionId: 'compare-section' },
      { icon: '🔧', title: 'Pipeline Sandbox', desc: 'Drag-and-drop bioinformatics pipeline builder', section: 'Lab', sectionId: 'sandbox-section' },
      { icon: '🎯', title: 'Error Injection / Sabotage Mode', desc: 'Find hidden errors in wet-lab steps — teaching mode', section: 'Lab', sectionId: 'sabotage-section' },
    ];

    staticEntries.forEach(e => {
      _index.push({
        type: 'section',
        icon: e.icon,
        title: e.title,
        desc: e.desc,
        tags: e.title + ' ' + e.desc,
        action: () => document.getElementById(e.sectionId)?.scrollIntoView({ behavior: 'smooth' }),
        section: e.section,
      });
    });

    return _index;
  }

  /* ─── Score a query against an entry ─── */
  function _score(entry, query) {
    const q = query.toLowerCase();
    const titleLow = (entry.title || '').toLowerCase();
    const tagsLow  = (entry.tags  || '').toLowerCase();
    const descLow  = (entry.desc  || '').toLowerCase();
    if (titleLow.startsWith(q)) return 100;
    if (titleLow.includes(q)) return 80;
    if (tagsLow.includes(q)) return 60;
    if (descLow.includes(q)) return 40;
    /* Word-by-word fuzzy */
    const words = q.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      const allMatch = words.every(w => tagsLow.includes(w) || descLow.includes(w));
      if (allMatch) return 50;
      const anyMatch = words.some(w => titleLow.includes(w) || tagsLow.includes(w));
      if (anyMatch) return 30;
    }
    return 0;
  }

  /* ─── Run search ─── */
  function _search(query) {
    if (!query || query.trim().length < 2) return [];
    const idx = _buildIndex();
    return idx
      .map(entry => ({ entry, score: _score(entry, query.trim()) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24)
      .map(x => x.entry);
  }

  /* ─── Render results ─── */
  function _renderResults(results, query) {
    const box = document.getElementById('search-results-box');
    if (!box) return;

    if (!query || query.trim().length < 2) {
      box.innerHTML = `
        <div class="search-empty">
          <div class="search-empty-icon">🔍</div>
          <div>Type to search across workflows, diseases, tools, equipment, and more</div>
          <div class="search-hints">
            <span class="search-hint-chip" onclick="document.getElementById('search-input').value='malaria';OmicsLab.Search._triggerSearch()">malaria</span>
            <span class="search-hint-chip" onclick="document.getElementById('search-input').value='RNA-seq';OmicsLab.Search._triggerSearch()">RNA-seq</span>
            <span class="search-hint-chip" onclick="document.getElementById('search-input').value='GATK';OmicsLab.Search._triggerSearch()">GATK</span>
            <span class="search-hint-chip" onclick="document.getElementById('search-input').value='H3Africa';OmicsLab.Search._triggerSearch()">H3Africa</span>
            <span class="search-hint-chip" onclick="document.getElementById('search-input').value='SLURM';OmicsLab.Search._triggerSearch()">SLURM</span>
            <span class="search-hint-chip" onclick="document.getElementById('search-input').value='NovaSeq';OmicsLab.Search._triggerSearch()">NovaSeq</span>
          </div>
        </div>`;
      return;
    }

    if (results.length === 0) {
      box.innerHTML = `
        <div class="search-empty">
          <div class="search-empty-icon">😕</div>
          <div>No results for "<strong>${_esc(query)}</strong>"</div>
          <div style="margin-top:.5rem;color:var(--text-muted);font-size:.85rem">Try searching for a disease name, workflow type, or tool name</div>
        </div>`;
      return;
    }

    /* Group by section */
    const groups = {};
    results.forEach(r => {
      if (!groups[r.section]) groups[r.section] = [];
      groups[r.section].push(r);
    });

    const html = Object.entries(groups).map(([section, items]) => `
      <div class="search-group">
        <div class="search-group-label">${_esc(section)}</div>
        ${items.map((item, i) => `
          <button class="search-result-item" data-result-idx="${i}" onclick="OmicsLab.Search._pickResult(${_index ? _index.indexOf(item) : 0})">
            <span class="sri-icon">${item.icon}</span>
            <div class="sri-text">
              <div class="sri-title">${_highlight(item.title, query)}</div>
              ${item.desc ? `<div class="sri-desc">${_highlight(item.desc.slice(0, 100) + (item.desc.length > 100 ? '…' : ''), query)}</div>` : ''}
            </div>
            <span class="sri-arrow">→</span>
          </button>`).join('')}
      </div>`).join('');

    box.innerHTML = `<div class="search-count">${results.length} result${results.length !== 1 ? 's' : ''} for "<strong>${_esc(query)}</strong>"</div>${html}`;
  }

  /* ─── Highlight matching text ─── */
  function _highlight(text, query) {
    if (!text || !query) return _esc(text || '');
    const words = query.trim().split(/\s+/).filter(Boolean);
    let escaped = _esc(text);
    words.forEach(w => {
      const re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      escaped = escaped.replace(re, '<mark class="search-mark">$1</mark>');
    });
    return escaped;
  }

  function _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ─── Pick a result ─── */
  function _pickResult(idx) {
    const entry = _index && _index[idx];
    if (!entry) return;
    close();
    setTimeout(() => { try { entry.action(); } catch {} }, 120);
  }

  /* ─── Trigger search from hint chips ─── */
  function _triggerSearch() {
    const inp = document.getElementById('search-input');
    if (inp) inp.dispatchEvent(new Event('input'));
  }

  /* ─── Open ─── */
  function open() {
    let overlay = document.getElementById('search-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'search-overlay';
      overlay.className = 'search-overlay';
      overlay.innerHTML = `
        <div class="search-modal" role="search">
          <div class="search-topbar">
            <svg class="search-icon-left" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input id="search-input" class="search-input" type="search" autocomplete="off" spellcheck="false"
                   placeholder="Search workflows, diseases, tools, equipment…"
                   oninput="OmicsLab.Search._onInput(this.value)"
                   onkeydown="OmicsLab.Search._onKey(event)">
            <button class="search-close-btn" onclick="OmicsLab.Search.close()" aria-label="Close search">✕</button>
          </div>
          <div id="search-results-box" class="search-results-box"></div>
          <div class="search-footer">
            <span>↑↓ navigate</span>
            <span>Enter to select</span>
            <span>Esc to close</span>
          </div>
        </div>`;

      overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
      });
      document.body.appendChild(overlay);
    }

    overlay.classList.add('open');
    _open = true;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const inp = document.getElementById('search-input');
      if (inp) { inp.focus(); inp.select(); }
      /* Pre-render empty state */
      _renderResults([], '');
    }, 50);
  }

  /* ─── Close ─── */
  function close() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) overlay.classList.remove('open');
    _open = false;
    document.body.style.overflow = '';
  }

  /* ─── Input handler ─── */
  let _debounce = null;
  function _onInput(val) {
    clearTimeout(_debounce);
    _debounce = setTimeout(() => {
      const results = _search(val);
      _renderResults(results, val);
    }, 80);
  }

  /* ─── Keyboard navigation ─── */
  function _onKey(e) {
    const box = document.getElementById('search-results-box');
    if (!box) return;
    const items = Array.from(box.querySelectorAll('.search-result-item'));
    const current = box.querySelector('.search-result-item.focused');
    let idx = items.indexOf(current);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (current) current.classList.remove('focused');
      idx = Math.min(idx + 1, items.length - 1);
      if (items[idx]) { items[idx].classList.add('focused'); items[idx].scrollIntoView({ block: 'nearest' }); }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (current) current.classList.remove('focused');
      idx = Math.max(idx - 1, 0);
      if (items[idx]) { items[idx].classList.add('focused'); items[idx].scrollIntoView({ block: 'nearest' }); }
    } else if (e.key === 'Enter') {
      if (current) current.click();
    } else if (e.key === 'Escape') {
      close();
    }
  }

  /* ─── Keyboard shortcut (Ctrl+K / Cmd+K) ─── */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      _open ? close() : open();
    }
    if (e.key === 'Escape' && _open) close();
  });

  return { open, close, _onInput, _onKey, _pickResult, _triggerSearch };
})();
