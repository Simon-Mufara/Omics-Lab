/* OmicsLab — shared local data intake for browser-based analysis tools. */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.DataWorkspace = (function () {
  const MAX_BYTES = 50 * 1024 * 1024;
  const HISTORY_KEY = 'omicslab-data-history-v1';
  let current = null;

  function _escape(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
  }

  function _format(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function _kind(name, text) {
    const lower = name.toLowerCase();
    if (lower.endsWith('.vcf') || lower.endsWith('.vcf.gz')) return 'VCF';
    if (lower.endsWith('.fastq') || lower.endsWith('.fq') || lower.endsWith('.fastq.gz')) return 'FASTQ';
    if (lower.endsWith('.fasta') || lower.endsWith('.fa') || lower.endsWith('.fas')) return 'FASTA';
    if (lower.endsWith('.csv')) return 'CSV';
    if (lower.endsWith('.tsv') || lower.endsWith('.txt')) return 'TABLE';
    if (lower.endsWith('.json')) return 'JSON';
    if (/^##fileformat=VCF|^#CHROM/m.test(text)) return 'VCF';
    if (/^@[^@\n]+\n[ACGTN]+\n\+\n/m.test(text)) return 'FASTQ';
    return 'TEXT';
  }

  function _history() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (error) {
      console.warn('[DataWorkspace] Could not read file history', error);
      return [];
    }
  }

  function _remember(file, kind, lineCount) {
    const next = [{
      name: file.name, size: file.size, kind, lineCount,
      importedAt: new Date().toISOString(),
    }, ..._history().filter((item) => item.name !== file.name)].slice(0, 10);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch (error) {
      console.warn('[DataWorkspace] Could not persist file history', error);
    }
  }

  async function _load(file, status) {
    if (file.size > MAX_BYTES) {
      status.textContent = `This file is ${_format(file.size)}. Browser analysis accepts files up to 50 MB; use Galaxy or nf-core for larger inputs.`;
      return;
    }
    try {
      const text = await file.text();
      const kind = _kind(file.name, text);
      const lineCount = text ? text.split(/\r?\n/).length : 0;
      current = { name: file.name, size: file.size, kind, text, importedAt: new Date().toISOString() };
      _remember(file, kind, lineCount);
      status.textContent = `${kind} ready: ${file.name} (${_format(file.size)}, ${lineCount.toLocaleString()} lines). Tools can now use this local dataset.`;
      document.dispatchEvent(new CustomEvent('omicslab:data-ready', { detail: current }));
    } catch (error) {
      console.error('[DataWorkspace] File import failed', error);
      status.textContent = 'The file could not be read. Check its encoding and try again.';
    }
  }

  function render(page) {
    const header = document.getElementById('page-route-header');
    if (!header || page === 'home' || page === 'lab') return;
    header.querySelector('.data-workspace-tools')?.remove();
    const wrapper = document.createElement('div');
    wrapper.className = 'data-workspace-tools';
    wrapper.innerHTML = `
      <button class="data-workspace-toggle" type="button" aria-expanded="false">Open local data</button>
      <div class="data-workspace-panel" hidden>
        <strong>Bring your own data</strong>
        <span class="data-workspace-help">Import a local VCF, FASTA, FASTQ, CSV, TSV, JSON, or text file. The file stays in this browser tab and is not uploaded.</span>
        <label class="data-workspace-file">Choose file
          <input type="file" accept=".vcf,.vcf.gz,.fastq,.fastq.gz,.fq,.fasta,.fa,.fas,.csv,.tsv,.txt,.json,text/plain" />
        </label>
        <div class="data-workspace-status" role="status">No local dataset loaded.</div>
        <small>Files up to 50 MB can be inspected here. Larger analyses should use Galaxy or a downloaded nf-core/Snakemake workflow.</small>
      </div>`;
    header.querySelector('.page-route-header')?.appendChild(wrapper);
    const toggle = wrapper.querySelector('.data-workspace-toggle');
    const panel = wrapper.querySelector('.data-workspace-panel');
    const status = wrapper.querySelector('.data-workspace-status');
    toggle?.addEventListener('click', () => {
      const open = panel.hasAttribute('hidden');
      if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(open));
    });
    wrapper.querySelector('input')?.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (file) _load(file, status);
    });
  }

  function getCurrent() {
    return current;
  }

  return { render, getCurrent };
})();
