/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Nexus File Attachments (Prompt 16)
   ─ Paperclip button in composer
   ─ Drag-drop onto chat area
   ─ Images, text/VCF/FASTA/CSV, PDF
   ─ 2MB soft warning, 5MB hard limit
   ─ Image lightbox, collapsible code blocks
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.NexusAttachments = (function () {

  const MAX_HARD = 5 * 1024 * 1024;   /* 5MB */
  const MAX_SOFT = 2 * 1024 * 1024;   /* 2MB */

  /* File types */
  const IMAGE_TYPES  = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
  const TEXT_EXTS    = ['.txt', '.csv', '.vcf', '.fasta', '.fa', '.fastq', '.fq', '.tsv', '.bed', '.gff'];
  const PDF_TYPE     = 'application/pdf';

  let _pending = null;   /* { name, type, data, size } — staged for next send */
  let _observer = null;

  /* ─── Init: monkey-patch _send + watch for composer ─── */
  function init() {
    _injectStyles();
    _patchSend();
    _watchComposer();
    _watchMessages();
  }

  /* ─── Wrap OmicsLab.Nexus._send to include file ─── */
  function _patchSend() {
    const nx = OmicsLab.Nexus;
    if (!nx || nx._sendPatched) return;
    const orig = nx._send.bind(nx);
    nx._send = function () {
      /* If there's a pending file and no text, allow file-only sends */
      if (_pending) {
        const ta = document.getElementById('nx-composer-input');
        /* Temporarily ensure there's at least a space so orig's text check passes */
        if (ta && !ta.value.trim()) ta.value = ' ';
      }
      orig();
      /* After orig() runs, patch last message to include file data */
      if (_pending) {
        try {
          const state = nx._getState ? nx._getState() : null;
          const ch = state ? state.channels?.find(c => c.id === state.activeChannel) : null;
          if (ch && ch.messages.length) {
            const last = ch.messages[ch.messages.length - 1];
            last.file = _pending;
            last.text = last.text.trim() || ''; /* clean the space */
            nx._save?.();
            /* Refresh message list to show attachment */
            nx._renderMessages?.();
          }
        } catch {}
        _pending = null;
        _clearPreview();
      }
    };
    nx._sendPatched = true;
  }

  /* ─── Watch for composer element (rebuilt on channel switch) ─── */
  function _watchComposer() {
    const section = document.getElementById('nexus-section');
    if (!section) return;
    _injectComposerButtons();
    _setupDragDrop();

    if (_observer) _observer.disconnect();
    _observer = new MutationObserver(() => {
      _injectComposerButtons();
      _setupDragDrop();
    });
    _observer.observe(section, { childList: true, subtree: true });
  }

  function _injectComposerButtons() {
    const actions = document.querySelector('.nx-composer-actions');
    if (!actions || actions.querySelector('.nx-attach-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'nx-attach-btn nx-msg-action';
    btn.type = 'button';
    btn.title = 'Attach file (images, text, VCF, FASTA, PDF)';
    btn.setAttribute('aria-label', 'Attach file');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`;
    btn.onclick = () => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = IMAGE_TYPES.join(',') + ',' + TEXT_EXTS.join(',') + ',' + PDF_TYPE;
      inp.onchange = e => _handleFile(e.target.files[0]);
      inp.click();
    };

    /* Insert before send button */
    const sendBtn = actions.querySelector('.nx-send-btn');
    if (sendBtn) actions.insertBefore(btn, sendBtn);
    else actions.prepend(btn);
  }

  /* ─── Drag-drop ─── */
  function _setupDragDrop() {
    const msgList = document.getElementById('nx-messages-list');
    if (!msgList || msgList._dropWired) return;
    msgList._dropWired = true;

    msgList.addEventListener('dragover', e => {
      e.preventDefault();
      msgList.classList.add('nx-drop-active');
    });
    msgList.addEventListener('dragleave', () => msgList.classList.remove('nx-drop-active'));
    msgList.addEventListener('drop', e => {
      e.preventDefault();
      msgList.classList.remove('nx-drop-active');
      const file = e.dataTransfer.files[0];
      if (file) _handleFile(file);
    });
  }

  /* ─── Handle a picked/dropped file ─── */
  function _handleFile(file) {
    if (!file) return;

    if (file.size > MAX_HARD) {
      OmicsLab.Notify?.error(`File too large (${_fmtSize(file.size)}). Maximum is 5MB.`);
      return;
    }

    if (file.size > MAX_SOFT) {
      OmicsLab.Notify?.warning(`Large file (${_fmtSize(file.size)}) — may affect localStorage storage`);
    }

    const reader = new FileReader();

    if (IMAGE_TYPES.includes(file.type)) {
      reader.onload = e => {
        _pending = { name: file.name, type: file.type, data: e.target.result, size: file.size, kind: 'image' };
        _showPreview();
      };
      reader.readAsDataURL(file);

    } else if (file.type === PDF_TYPE) {
      reader.onload = e => {
        _pending = { name: file.name, type: file.type, data: e.target.result, size: file.size, kind: 'pdf' };
        _showPreview();
      };
      reader.readAsDataURL(file);

    } else {
      /* Text-based file */
      reader.onload = e => {
        _pending = { name: file.name, type: 'text/plain', data: e.target.result, size: file.size, kind: 'text' };
        _showPreview();
      };
      reader.readAsText(file);
    }
  }

  /* ─── Preview bar above composer ─── */
  function _showPreview() {
    _clearPreview();
    const composer = document.querySelector('.nx-composer');
    if (!composer || !_pending) return;

    const bar = document.createElement('div');
    bar.id = 'nx-attach-preview';
    bar.className = 'nx-attach-preview';

    let thumb = '';
    if (_pending.kind === 'image') {
      thumb = `<img src="${_pending.data}" alt="" style="height:40px;width:auto;border-radius:4px;object-fit:cover">`;
    } else if (_pending.kind === 'pdf') {
      thumb = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
    } else {
      thumb = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    }

    bar.innerHTML = `
      ${thumb}
      <span class="nx-attach-name">${_esc(_pending.name)}</span>
      <span class="nx-attach-size">${_fmtSize(_pending.size)}</span>
      <button class="nx-attach-remove" type="button" aria-label="Remove attachment" onclick="OmicsLab.NexusAttachments._cancelAttach()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    composer.insertBefore(bar, composer.firstChild);
  }

  function _clearPreview() {
    document.getElementById('nx-attach-preview')?.remove();
  }

  function _cancelAttach() {
    _pending = null;
    _clearPreview();
  }

  /* ─── Watch messages list to render attachment HTML ─── */
  function _watchMessages() {
    /* Use event delegation — attachment rendering is triggered by Nexus rebuilding the list */
    document.addEventListener('click', e => {
      /* Lightbox */
      const img = e.target.closest('.nx-attach-img');
      if (img) { _openLightbox(img.src, img.alt); return; }
      /* Code block toggle */
      const toggle = e.target.closest('.nx-code-toggle');
      if (toggle) {
        const block = toggle.closest('.nx-code-wrap')?.querySelector('.nx-code-pre');
        if (block) {
          const collapsed = block.style.display === 'none';
          block.style.display = collapsed ? '' : 'none';
          toggle.textContent = collapsed ? 'Collapse' : 'Expand';
        }
        return;
      }
      /* PDF / text download */
      const dl = e.target.closest('.nx-attach-download');
      if (dl) {
        const data = dl.dataset.data;
        const name = dl.dataset.name;
        const type = dl.dataset.type;
        if (!data) return;
        const blob = type === PDF_TYPE
          ? _b64ToBlob(data.split(',')[1], PDF_TYPE)
          : new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
        return;
      }
    });

    /* MutationObserver to post-process messages with file data */
    const section = document.getElementById('nexus-section');
    if (!section) return;
    const msgObs = new MutationObserver(() => _renderAttachments());
    msgObs.observe(section, { childList: true, subtree: true });
  }

  /* ─── Post-process messages list to inject attachment HTML ─── */
  function _renderAttachments() {
    const nx = OmicsLab.Nexus;
    if (!nx) return;
    /* Walk message elements looking for data-msgid, check if message has file */
    try {
      const state = nx._getState ? nx._getState() : null;
      if (!state) return;
      const ch = state.channels?.find(c => c.id === state.activeChannel);
      if (!ch) return;
      ch.messages.forEach(msg => {
        if (!msg.file) return;
        const el = document.querySelector(`[data-msgid="${msg.id}"] .nx-msg-text`);
        if (!el || el.dataset.attachRendered) return;
        el.dataset.attachRendered = '1';
        const attachEl = document.createElement('div');
        attachEl.className = 'nx-attachment';
        attachEl.innerHTML = _attachHtml(msg.file);
        el.after(attachEl);
      });
    } catch {}
  }

  function _attachHtml(file) {
    if (!file) return '';
    if (file.kind === 'image') {
      return `<img class="nx-attach-img" src="${file.data}" alt="${_esc(file.name)}" style="max-width:300px;max-height:200px;border-radius:6px;cursor:zoom-in;display:block;margin-top:.35rem">`;
    }
    if (file.kind === 'pdf') {
      return `
        <div class="nx-attach-file">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span class="nx-attach-fname">${_esc(file.name)}</span>
          <span class="nx-attach-sz">${_fmtSize(file.size)}</span>
          <button class="btn btn-ghost btn-sm nx-attach-download" data-data="${file.data}" data-name="${_esc(file.name)}" data-type="${PDF_TYPE}" type="button">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download
          </button>
        </div>`;
    }
    /* text/code */
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const langClass = ['vcf','fasta','fa','fastq','fq'].includes(ext) ? `language-${ext}` : 'language-text';
    const preview = (file.data || '').slice(0, 800);
    const truncated = (file.data || '').length > 800;
    return `
      <div class="nx-code-wrap">
        <div class="nx-code-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span class="nx-code-fname">${_esc(file.name)}</span>
          <span class="nx-code-sz">${_fmtSize(file.size)}</span>
          <button class="nx-code-copy btn btn-ghost btn-sm" type="button" onclick="navigator.clipboard.writeText(${JSON.stringify(file.data || '')}).then(()=>OmicsLab.Notify?.success('Copied'))">Copy</button>
          <button class="nx-code-toggle btn btn-ghost btn-sm" type="button">Collapse</button>
          <button class="btn btn-ghost btn-sm nx-attach-download" data-data="${_esc(file.data||'')}" data-name="${_esc(file.name)}" data-type="text/plain" type="button">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
        <pre class="nx-code-pre ${langClass}" style="max-height:220px;overflow-y:auto">${_esc(preview)}${truncated ? '\n… (truncated)' : ''}</pre>
      </div>`;
  }

  /* ─── Image lightbox ─── */
  function _openLightbox(src, alt) {
    const overlay = document.createElement('div');
    overlay.id = 'nx-lightbox';
    overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9000;display:flex;align-items:center;justify-content:center;cursor:zoom-out`;
    overlay.innerHTML = `<img src="${_esc(src)}" alt="${_esc(alt||'')}" style="max-width:92vw;max-height:88vh;border-radius:8px;box-shadow:0 16px 48px rgba(0,0,0,.7)">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
    });
  }

  /* ─── Helpers ─── */
  function _fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function _b64ToBlob(b64, type) {
    const binary = atob(b64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type });
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  function _injectStyles() {
    if (document.getElementById('nx-attach-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-attach-styles';
    s.textContent = `
      .nx-attach-preview{display:flex;align-items:center;gap:.5rem;padding:.4rem .65rem;background:var(--bg-overlay,#21262d);border-bottom:1px solid var(--border-default,#21262d);font-size:.75rem;color:var(--text-secondary,#c9d1d9)}
      .nx-attach-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
      .nx-attach-size{color:var(--text-muted,#8b949e);flex-shrink:0}
      .nx-attach-remove{background:none;border:none;cursor:pointer;color:var(--text-muted,#8b949e);display:flex;padding:2px}
      .nx-drop-active{outline:2px dashed var(--green,#3fb950) !important;outline-offset:-4px}
      .nx-attachment{margin-top:.3rem}
      .nx-attach-file{display:flex;align-items:center;gap:.4rem;padding:.4rem .55rem;background:var(--bg-overlay,#21262d);border:1px solid var(--border-default,#21262d);border-radius:6px;font-size:.75rem}
      .nx-attach-fname,.nx-code-fname{font-weight:600;color:var(--text-primary,#e6edf3);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .nx-attach-sz,.nx-code-sz{color:var(--text-muted,#8b949e);font-size:.68rem;flex-shrink:0}
      .nx-attach-download{padding:.15rem .35rem !important;font-size:.68rem !important;min-height:auto !important}
      .nx-code-wrap{border:1px solid var(--border-default,#21262d);border-radius:6px;overflow:hidden;margin-top:.35rem;font-size:.72rem}
      .nx-code-header{display:flex;align-items:center;gap:.35rem;padding:.3rem .5rem;background:var(--bg-overlay,#21262d);border-bottom:1px solid var(--border-default,#21262d)}
      .nx-code-copy,.nx-code-toggle{font-size:.65rem !important;padding:.1rem .3rem !important;min-height:auto !important}
      .nx-code-pre{margin:0;padding:.55rem .65rem;font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text-secondary,#c9d1d9);background:var(--bg-canvas,#0d1117);white-space:pre-wrap;word-break:break-word}
    `;
    document.head.appendChild(s);
  }

  return { init, _cancelAttach };
})();
