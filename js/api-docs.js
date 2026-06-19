/* ═══════════════════════════════════════════════════════
   OmicsLab — Developer API Documentation (Part 7)
   Documents the public OmicsLab JavaScript API so
   developers can embed modules or build extensions.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.APIDocs = (function () {

  const SECTIONS = [
    {
      id: 'overview',
      title: 'Overview',
      content: `
OmicsLab exposes a global \`window.OmicsLab\` namespace. All modules are IIFEs that attach to this object. The platform is a pure HTML/CSS/JS SPA with no build step — modules can be consumed directly by including the relevant \`<script>\` tag.

\`\`\`js
// Verify OmicsLab is loaded
console.log(Object.keys(window.OmicsLab));
// → ["Router", "Assistant", "VariantInterp", "CodonUsage", ...]
\`\`\`

All modules follow the same pattern:
1. Register on \`window.OmicsLab\` as an IIFE.
2. Expose an \`init()\` function that renders HTML into a section element.
3. Expose any other public methods needed for interactivity.
      `},
    {
      id: 'router',
      title: 'OmicsLab.Router',
      content: `
The router drives the single-page application via hash-based routing (\`#/page-id\`).

\`\`\`js
// Navigate to a page programmatically
OmicsLab.Router.navigate('ai');        // → #/ai
OmicsLab.Router.navigate('variants');  // → #/variants

// Read the current page
OmicsLab.Router.currentPage(); // → 'ai'

// PAGES registry (read-only reference)
OmicsLab.Router.PAGES;
// {
//   variants: { label:'Variant Interpreter', icon:'🧬', color:'#ff6b6b', ... },
//   ai:       { label:'AI Assistant',        icon:'🤖', color:'#58a6ff', ... },
//   ...
// }
\`\`\`
      `},
    {
      id: 'assistant',
      title: 'OmicsLab.Assistant',
      content: `
The AI assistant wraps Claude API with SSE streaming. It can be given context from any other module.

\`\`\`js
// Set a context string before navigating to the AI page
// Context appears as a collapsible block above the user's first message
OmicsLab.Assistant.setContext(
  'Current Variant: HBB p.Glu7Val\\nACMG Class: Pathogenic\\nAFR AF: 0.062'
);

// Clear previously set context
OmicsLab.Assistant.clearContext();

// Programmatically init (called by router, rarely needed directly)
OmicsLab.Assistant.init();
\`\`\`

**API key**: stored only in \`localStorage.getItem('omicslab_anthropic_key')\`. Never sent to any server other than \`api.anthropic.com\`.
      `},
    {
      id: 'variantinterp',
      title: 'OmicsLab.VariantInterp',
      content: `
Variant interpretation and ACMG classification.

\`\`\`js
// Interpret a variant by rsID or gene-based notation
OmicsLab.VariantInterp._interpret('rs334');
OmicsLab.VariantInterp._interpret('HBB:p.Glu7Val');

// Load an example into the input field
OmicsLab.VariantInterp._loadExample();

// Send the last interpreted variant to the AI assistant with full context
OmicsLab.VariantInterp._askAI();
// → navigates to #/ai with ACMG context pre-loaded
\`\`\`
      `},
    {
      id: 'idb',
      title: 'OmicsLab.IDB',
      content: `
IndexedDB utility for storing large genomic files (FASTQ, BAM, VCF) in the browser.

\`\`\`js
// Store a File or ArrayBuffer
const file = document.querySelector('#my-input').files[0];
const buf = await file.arrayBuffer();
await OmicsLab.IDB.put('my-file-id', file.name, 'FASTQ', buf);

// Retrieve it
const entry = await OmicsLab.IDB.get('my-file-id');
// entry.data → ArrayBuffer

// List all stored files (metadata only, no data)
const files = await OmicsLab.IDB.list();
// [{ id, name, type, size, savedAt }, ...]

// Delete a file
await OmicsLab.IDB.remove('my-file-id');

// Clear everything
await OmicsLab.IDB.clearAll();

// Estimate storage usage
const { used, quota, pct } = await OmicsLab.IDB.estimateUsage();
console.log(\`Using \${pct}% of quota (\${(used/1e6).toFixed(1)} MB)\`);
\`\`\`
      `},
    {
      id: 'grants',
      title: 'OmicsLab.Grant',
      content: `
Grant writing assistant with 35 African research grants database.

\`\`\`js
// Search the grants database programmatically
OmicsLab.Grant._filterGrants();

// Auto-fill the form with a profile from localStorage
OmicsLab.Grant._autoFill();

// Generate grant text (requires form to be filled)
OmicsLab.Grant._generate();

// Polish generated text with Claude AI (navigates to #/ai)
OmicsLab.Grant._aiPolish();
\`\`\`
      `},
    {
      id: 'glossary',
      title: 'OmicsLab.Glossary',
      content: `
Multilingual bioinformatics glossary (English + Swahili + Hausa + Yoruba + Amharic + French).

\`\`\`js
// Filter the glossary (reads from the DOM search/filter inputs)
OmicsLab.Glossary._filter();

// Toggle a language column
OmicsLab.Glossary._toggleLang('yo'); // show/hide Yoruba
OmicsLab.Glossary._toggleLang('am'); // show/hide Amharic
\`\`\`
      `},
    {
      id: 'events',
      title: 'Custom Events',
      content: `
OmicsLab fires custom DOM events on \`window\` that external scripts can listen to.

\`\`\`js
// Fired when the router navigates to a new page
window.addEventListener('omicslab:navigate', e => {
  console.log('Navigated to:', e.detail.page);
});

// Fired when the AI assistant receives the first token of a response
window.addEventListener('omicslab:ai-start', e => {
  console.log('AI response started');
});

// Fired when the AI assistant stream completes
window.addEventListener('omicslab:ai-done', e => {
  console.log('AI response complete:', e.detail.text.substring(0, 80));
});
\`\`\`
      `},
    {
      id: 'embedding',
      title: 'Embedding OmicsLab',
      content: `
To embed a single OmicsLab module in an external page:

\`\`\`html
<!-- 1. Add the CSS -->
<link rel="stylesheet" href="https://your-host/css/variantinterp.css">

<!-- 2. Add a container matching the module's section ID -->
<div id="vi-section"></div>

<!-- 3. Add the script -->
<script src="https://your-host/js/variantinterp.js"></script>

<!-- 4. Init the module -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    OmicsLab.VariantInterp.init();
  });
</script>
\`\`\`

All modules are self-contained and will render into their designated section element. There are no peer dependencies beyond the modules themselves.
      `},
  ];

  let _activeSection = 'overview';

  function _selectSection(id) {
    _activeSection = id;
    document.querySelectorAll('.ad-nav-item').forEach(el => el.classList.toggle('ad-nav-active', el.dataset.sid === id));
    const content = SECTIONS.find(s => s.id === id);
    const el = document.getElementById('ad-content');
    if (!el || !content) return;
    el.innerHTML = `<h2 class="ad-content-title">${content.title}</h2><div class="ad-content-body">${_renderMd(content.content)}</div>`;
    el.querySelectorAll('pre code, pre').forEach(block => block.classList.add('ad-code-block'));
  }

  function _renderMd(text) {
    return text
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="ad-code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="ad-inline-code">$1</code>')
      .replace(/^## (.+)$/gm, '<h3 class="ad-h3">$1</h3>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p class="ad-p">')
      .replace(/^/, '<p class="ad-p">')
      .replace(/$/, '</p>');
  }

  function init() {
    const section = document.getElementById('api-docs-section');
    if (!section || section.dataset.adReady) return;
    section.dataset.adReady = '1';
    section.innerHTML = `
      <div class="ad-wrap">
        <div class="ad-header">
          <div class="ad-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Developer API
          </div>
          <div class="ad-header-sub">Public JavaScript API for OmicsLab modules — embed, extend, or build on top</div>
        </div>
        <div class="ad-layout">
          <nav class="ad-nav">
            ${SECTIONS.map(s => `<button class="ad-nav-item${s.id===_activeSection?' ad-nav-active':''}" data-sid="${s.id}" onclick="OmicsLab.APIDocs._selectSection('${s.id}')">${s.title}</button>`).join('')}
          </nav>
          <div id="ad-content" class="ad-content"></div>
        </div>
      </div>`;
    _selectSection(_activeSection);
  }

  return { init, _selectSection };
})();
