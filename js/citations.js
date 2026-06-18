/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Citation & Reference Manager (Prompt 17)
   DOI/manual entry → localStorage library → APA/Vancouver/Nature
   export. Fully offline. No API required for manual entries.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Citations = (function () {

  const STORE_KEY = 'omicslab_citations';
  const FORMATS = ['APA 7th', 'Vancouver', 'Nature', 'BibTeX', 'RIS'];

  /* ─── Pre-loaded African genomics classics ─── */
  const PRELOADED = [
    { id: 'pre1', doi: '10.1038/s41586-022-04411-y', title: 'Emergence of SARS-CoV-2 Omicron', authors: 'Viana R, Moyo S, Amoako DG, et al.', journal: 'Nature', year: 2021, volume: '603', pages: '679–686', url: '', tags: ['COVID-19','Omicron','WGS'] },
    { id: 'pre2', doi: '10.1038/ng.2744', title: 'The genomic and phenotypic diversity of Schizosaccharomyces pombe', authors: 'Comas I, Coscolla M, Luo T, et al.', journal: 'Nature Genetics', year: 2013, volume: '45', pages: '1176–1182', url: '', tags: ['TB','Phylogenomics'] },
    { id: 'pre3', doi: '10.1186/s13059-014-0550-8', title: 'Moderated estimation of fold change and dispersion for RNA-seq data with DESeq2', authors: 'Love MI, Huber W, Anders S.', journal: 'Genome Biology', year: 2014, volume: '15', pages: '550', url: '', tags: ['DESeq2','RNA-seq','Methods'] },
    { id: 'pre4', doi: '10.1093/bioinformatics/btp324', title: 'Fast and accurate short read alignment with Burrows-Wheeler Aligner', authors: 'Li H, Durbin R.', journal: 'Bioinformatics', year: 2009, volume: '25', pages: '1754–1760', url: '', tags: ['BWA','Alignment','Methods'] },
    { id: 'pre5', doi: '10.1038/nmeth.1474', title: 'A framework for variant discovery using next-generation DNA sequencing data', authors: 'DePristo MA, Banks E, Poplin R, et al.', journal: 'Nature Methods', year: 2011, volume: '8', pages: '398–404', url: '', tags: ['GATK','Variant calling','Methods'] },
  ];

  /* ─── Load / save ─── */
  function _load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return PRELOADED.map(p => ({ ...p }));
      const saved = JSON.parse(raw);
      return saved;
    } catch { return PRELOADED.map(p => ({ ...p })); }
  }

  function _save(refs) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(refs)); } catch {}
  }

  /* ─── Format one reference ─── */
  function _format(ref, style) {
    const authors = ref.authors || 'Unknown author';
    const year    = ref.year    || 'n.d.';
    const title   = ref.title   || 'Untitled';
    const journal = ref.journal || '';
    const vol     = ref.volume  ? `${ref.volume}` : '';
    const pages   = ref.pages   || '';
    const doi     = ref.doi     ? `https://doi.org/${ref.doi}` : (ref.url || '');

    if (style === 'APA 7th') {
      const pg = pages ? `, ${pages}` : '';
      const vl = vol ? `(${vol})` : '';
      const doiPart = doi ? ` ${doi}` : '';
      return `${authors} (${year}). ${title}. *${journal}*, *${vl}*${pg}.${doiPart}`;
    }
    if (style === 'Vancouver') {
      const pg = pages ? `:${pages}` : '';
      const vl = vol ? `;${vol}` : '';
      const doiPart = doi ? ` doi:${ref.doi || doi}` : '';
      return `${authors} ${title}. ${journal}. ${year}${vl}${pg}.${doiPart}`;
    }
    if (style === 'Nature') {
      const pg = pages ? `, ${pages}` : '';
      const doiPart = doi ? ` https://doi.org/${ref.doi}` : '';
      return `${authors} ${title}. *${journal}* **${vol}**${pg} (${year}).${doiPart}`;
    }
    if (style === 'BibTeX') {
      const key = (authors.split(',')[0].trim().replace(/\s/g,'') + year).replace(/[^a-zA-Z0-9]/g,'');
      return `@article{${key},\n  author={${authors}},\n  title={${title}},\n  journal={${journal}},\n  year={${year}},\n  volume={${vol}},\n  pages={${pages}}${doi ? `,\n  doi={${ref.doi}}` : ''}\n}`;
    }
    if (style === 'RIS') {
      return `TY  - JOUR\nAU  - ${authors}\nTI  - ${title}\nJO  - ${journal}\nPY  - ${year}\nVL  - ${vol}\nSP  - ${(pages.split('–')[0]||'').trim()}\nEP  - ${(pages.split('–')[1]||'').trim()}${doi ? `\nDO  - ${ref.doi}` : ''}\nER  -`;
    }
    return title;
  }

  /* ─── Add reference ─── */
  function _add() {
    const refs = _load();
    const title   = document.getElementById('cit-title')?.value?.trim();
    const authors = document.getElementById('cit-authors')?.value?.trim();
    const journal = document.getElementById('cit-journal')?.value?.trim();
    const year    = document.getElementById('cit-year')?.value?.trim();
    const vol     = document.getElementById('cit-volume')?.value?.trim();
    const pages   = document.getElementById('cit-pages')?.value?.trim();
    const doi     = document.getElementById('cit-doi')?.value?.trim().replace(/^https?:\/\/doi\.org\//,'');
    const url     = document.getElementById('cit-url')?.value?.trim();
    const tagsRaw = document.getElementById('cit-tags')?.value?.trim();
    const tags    = tagsRaw ? tagsRaw.split(',').map(t=>t.trim()).filter(Boolean) : [];

    if (!title || !authors) {
      const s = document.getElementById('cit-add-status');
      if (s) s.textContent = 'Title and authors are required.';
      return;
    }

    const ref = { id: Date.now().toString(), title, authors, journal: journal||'', year: year||'', volume: vol||'', pages: pages||'', doi: doi||'', url: url||'', tags, addedAt: new Date().toISOString() };
    refs.push(ref);
    _save(refs);

    /* Clear form */
    ['cit-title','cit-authors','cit-journal','cit-year','cit-volume','cit-pages','cit-doi','cit-url','cit-tags'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    const s = document.getElementById('cit-add-status');
    if (s) { s.textContent = `✓ Added: ${title.slice(0,50)}`; s.style.color = '#3fb950'; setTimeout(() => { s.textContent=''; }, 3000); }

    _refreshLibrary();
  }

  /* ─── Delete reference ─── */
  function _delete(id) {
    const refs = _load().filter(r => r.id !== id);
    _save(refs);
    _refreshLibrary();
  }

  /* ─── Export all in selected format ─── */
  function _export() {
    const refs = _load();
    const style = document.querySelector('input[name="cit-format"]:checked')?.value || 'APA 7th';
    const sep = style === 'BibTeX' || style === 'RIS' ? '\n\n' : '\n\n';
    const text = refs.map((r,i) => {
      const n = style === 'BibTeX' || style === 'RIS' ? '' : `[${i+1}] `;
      return n + _format(r, style);
    }).join(sep);

    const ext = { APA: 'txt', Vancouver: 'txt', Nature: 'txt', BibTeX: 'bib', RIS: 'ris' }[style.split(' ')[0]] || 'txt';
    const blob = new Blob([text], { type: 'text/plain' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `omicslab_references.${ext}` });
    a.click();

    const s = document.getElementById('cit-export-status');
    if (s) { s.textContent = `✓ Exported ${refs.length} references as ${style}`; setTimeout(() => { s.textContent=''; }, 3000); }
  }

  /* ─── Copy all in selected format ─── */
  function _copyAll() {
    const refs = _load();
    const style = document.querySelector('input[name="cit-format"]:checked')?.value || 'APA 7th';
    const text = refs.map((r,i) => `[${i+1}] ` + _format(r, style)).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      const s = document.getElementById('cit-export-status');
      if (s) { s.textContent = `✓ Copied ${refs.length} references to clipboard`; setTimeout(() => { s.textContent=''; }, 3000); }
    });
  }

  /* ─── Refresh library list ─── */
  function _refreshLibrary() {
    const refs = _load();
    const list = document.getElementById('cit-library');
    if (!list) return;
    const style = document.querySelector('input[name="cit-format"]:checked')?.value || 'APA 7th';
    const count = document.getElementById('cit-lib-count');
    if (count) count.textContent = `${refs.length} references`;

    if (!refs.length) {
      list.innerHTML = '<div class="cit-empty">No references yet. Add your first reference above.</div>';
      return;
    }

    list.innerHTML = refs.map((ref, i) => `
      <div class="cit-ref-card" id="cit-ref-${ref.id}">
        <div class="cit-ref-num">[${i+1}]</div>
        <div class="cit-ref-body">
          <div class="cit-ref-title">${ref.title}</div>
          <div class="cit-ref-authors">${ref.authors}</div>
          <div class="cit-ref-meta">
            ${ref.journal ? `<span class="cit-journal">${ref.journal}</span>` : ''}
            ${ref.year ? `<span class="cit-year">${ref.year}</span>` : ''}
            ${ref.volume ? `<span class="cit-vol">Vol. ${ref.volume}</span>` : ''}
            ${ref.pages ? `<span class="cit-pages">pp. ${ref.pages}</span>` : ''}
            ${ref.doi ? `<a href="https://doi.org/${ref.doi}" target="_blank" rel="noopener" class="cit-doi">doi:${ref.doi}</a>` : ''}
          </div>
          ${ref.tags?.length ? `<div class="cit-ref-tags">${ref.tags.map(t=>`<span class="cit-tag">${t}</span>`).join('')}</div>` : ''}
          <div class="cit-ref-formatted">${_format(ref, style)}</div>
        </div>
        <div class="cit-ref-actions">
          <button class="cit-copy-btn" title="Copy formatted" onclick="OmicsLab.Citations._copySingle('${ref.id}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="cit-del-btn" title="Delete" onclick="OmicsLab.Citations._delete('${ref.id}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>`).join('');
  }

  function _copySingle(id) {
    const refs = _load();
    const ref = refs.find(r => r.id === id);
    if (!ref) return;
    const style = document.querySelector('input[name="cit-format"]:checked')?.value || 'APA 7th';
    navigator.clipboard.writeText(_format(ref, style));
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('citations-section');
    if (!section || section.dataset.citReady) return;
    section.dataset.citReady = '1';

    section.innerHTML = `
      <div class="cit-wrap">
        <div class="cit-header">
          <div>
            <div class="cit-badge">REFERENCE MANAGER</div>
            <h2 class="cit-title">Citation & Reference Manager</h2>
            <p class="cit-subtitle">Build your reference library offline. Export as APA, Vancouver, Nature, BibTeX, or RIS. All references stored in your browser — survives offline.</p>
          </div>
        </div>

        <div class="cit-main">
          <!-- ADD FORM -->
          <div class="cit-card">
            <div class="cit-card-title">Add Reference</div>
            <div class="cit-form-grid">
              <label class="cit-lbl cit-span2">Title *<input type="text" id="cit-title" class="cit-inp" placeholder="Full article title"></label>
              <label class="cit-lbl cit-span2">Authors *<input type="text" id="cit-authors" class="cit-inp" placeholder="Smith J, Jones A, et al."></label>
              <label class="cit-lbl">Journal<input type="text" id="cit-journal" class="cit-inp" placeholder="Nature Genetics"></label>
              <label class="cit-lbl">Year<input type="number" id="cit-year" class="cit-inp" placeholder="2024" min="1900" max="2099"></label>
              <label class="cit-lbl">Volume<input type="text" id="cit-volume" class="cit-inp" placeholder="15"></label>
              <label class="cit-lbl">Pages<input type="text" id="cit-pages" class="cit-inp" placeholder="123–145"></label>
              <label class="cit-lbl">DOI<input type="text" id="cit-doi" class="cit-inp" placeholder="10.1038/s41586-022-04411-y"></label>
              <label class="cit-lbl">URL (if no DOI)<input type="url" id="cit-url" class="cit-inp" placeholder="https://..."></label>
              <label class="cit-lbl cit-span2">Tags (comma-separated)<input type="text" id="cit-tags" class="cit-inp" placeholder="TB, WGS, Africa, Methods"></label>
            </div>
            <div class="cit-form-footer">
              <button class="cit-add-btn" onclick="OmicsLab.Citations._add()">+ Add to Library</button>
              <div id="cit-add-status" class="cit-status"></div>
            </div>
          </div>

          <!-- LIBRARY -->
          <div class="cit-card">
            <div class="cit-card-title">
              <span>My Library <span id="cit-lib-count" class="cit-lib-count"></span></span>
              <div class="cit-export-row">
                ${FORMATS.map(f => `<label class="cit-fmt-opt"><input type="radio" name="cit-format" value="${f}"${f==='APA 7th'?' checked':''}> ${f}</label>`).join('')}
              </div>
            </div>
            <div class="cit-export-actions">
              <button class="cit-export-btn" onclick="OmicsLab.Citations._export()">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </button>
              <button class="cit-copy-all-btn" onclick="OmicsLab.Citations._copyAll()">Copy All</button>
              <div id="cit-export-status" class="cit-status"></div>
            </div>
            <div id="cit-library" class="cit-library"></div>
          </div>
        </div>

        <div class="cit-formats-info">
          <div class="cit-info-title">Citation format guide</div>
          <div class="cit-info-grid">
            ${[
              { f:'APA 7th', u:'Psychology, Education, Social Science, WHO reports', ex:'Smith J, Jones A. (2021). Title. *Journal*, *12*(3), 45–67.' },
              { f:'Vancouver', u:'Medicine, Public Health, Clinical genomics, Lancet', ex:'Smith J, Jones A. Title. Journal. 2021;12:45–67.' },
              { f:'Nature', u:'Nature journals, basic science, genomics papers', ex:'Smith, J. & Jones, A. Title. *Journal* **12**, 45–67 (2021).' },
              { f:'BibTeX', u:'LaTeX documents, thesis writing, Overleaf', ex:'@article{Smith2021, author={Smith J...}, ...}' },
              { f:'RIS', u:'Zotero, Mendeley, EndNote, RefWorks import', ex:'TY  - JOUR\\nAU  - Smith J\\n...' },
            ].map(c => `<div class="cit-fmt-card"><div class="cit-fmt-name">${c.f}</div><div class="cit-fmt-use">Used in: ${c.u}</div><div class="cit-fmt-ex">${c.ex}</div></div>`).join('')}
          </div>
        </div>
      </div>`;

    /* Refresh on format change */
    document.querySelectorAll('input[name="cit-format"]').forEach(r => r.addEventListener('change', _refreshLibrary));
    _refreshLibrary();
  }

  return { init, _add, _delete, _export, _copyAll, _copySingle };
})();
