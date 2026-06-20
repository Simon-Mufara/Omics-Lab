# OmicsLab — Technical Documentation

This document covers the internal architecture, module system, design conventions, and operational requirements for OmicsLab. It is intended for contributors, institution administrators deploying the app, and researchers extending it with new modules or content.

For a feature overview and getting started guide, see [README.md](README.md).

---

## Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Router and Navigation](#2-router-and-navigation)
3. [Module System](#3-module-system)
4. [Design System and CSS](#4-design-system-and-css)
5. [Data Layer](#5-data-layer)
6. [Service Worker and Offline Strategy](#6-service-worker-and-offline-strategy)
7. [Internationalisation](#7-internationalisation)
8. [Authentication](#8-authentication)
9. [AI Assistant Integration](#9-ai-assistant-integration)
10. [Analytics](#10-analytics)
11. [Accessibility](#11-accessibility)
12. [Error Handling](#12-error-handling)
13. [Module Reference](#13-module-reference)
14. [Adding a New Module — Step-by-Step](#14-adding-a-new-module--step-by-step)
15. [Workflow Engine](#15-workflow-engine)
16. [Deployment](#16-deployment)
17. [Security Model](#17-security-model)
18. [Known Constraints](#18-known-constraints)

---

## 1. Architecture Overview

OmicsLab is a single-page application (SPA) with no build step, no package manager, and no server-side runtime.

```text
Browser
  └── index.html  (one file, loads all CSS and JS)
        ├── css/app.css        Design system
        ├── css/[module].css   Per-module styles
        ├── js/router.js       Hash-based navigation
        ├── js/app.js          Bootstrap and landing page
        ├── js/[module].js     Feature modules (IIFEs)
        └── sw.js              Service Worker (offline caching)
```

The entire application is served as static files. GitHub Pages, Netlify, Cloudflare Pages, or a local Python HTTP server all work identically.

### Request lifecycle

1. Browser fetches `index.html`.
2. Service Worker intercepts all subsequent asset requests, serving from cache where possible.
3. The hash portion of the URL (`#/route`) is read by `router.js`.
4. The router shows the correct section, hides all others, and calls the module's `init()` function.
5. All module state is read from and written to `localStorage`.

---

## 2. Router and Navigation

File: `js/router.js`

### PAGES object

Every navigable route is registered in the `PAGES` object:

```javascript
const PAGES = {
  'terminal':          { section: 'terminal-section',       group: 'tools' },
  'gwas':              { section: 'gwas-section',           group: 'tools' },
  'pharmacogenomics':  { section: 'pgx-section',            group: 'tools' },
  // ...
};
```

Fields:

- `section` — the `id` of the `<div>` in `index.html` that the router shows/hides.
- `group` — the nav menu group (`tools`, `learn`, `research`, `community`, `africa`). Used to highlight the correct nav item.

### PAGE\_TO\_GROUP

A flat map of `route → group` string, used for nav highlighting. Must match the `group` field in `PAGES`.

### \_dispatch(page)

Called by the router whenever the hash changes. This function contains the `if/else if` chain that calls each module's `init()`:

```javascript
if (page === 'gwas') {
  if (OmicsLab.GWAS) OmicsLab.GWAS.init();
}
```

Each `init()` should be idempotent — safe to call multiple times. Modules typically guard with:

```javascript
function init() {
  const el = document.getElementById('my-content');
  if (!el || el.querySelector('.my-root-class')) return;
  // render...
}
```

### \_animateIn(el)

Adds `page-entering` and `visible` classes to the section element, triggering the CSS entrance animation. Routed sections must **not** have the `reveal` class — that is for scroll-triggered animations only and starts with `opacity: 0`.

### ALL\_SECTIONS

An array of all section element IDs. The router iterates this to hide all sections before showing the active one.

---

## 3. Module System

Every feature module follows the same IIFE pattern:

```javascript
window.OmicsLab = window.OmicsLab || {};

OmicsLab.MyModule = (function () {

  // Private state
  let _data = null;

  // Private helpers
  function _render(container) { /* ... */ }

  // Public init (idempotent)
  function init() {
    const container = document.getElementById('my-module-content');
    if (!container || container.querySelector('.my-root')) return;
    _render(container);
  }

  // Public API
  return { init };

})();
```

### Conventions

- Module names use PascalCase: `OmicsLab.GWAS`, `OmicsLab.VirtualLab`, `OmicsLab.NetworkHub`.
- Private helpers are prefixed with `_`.
- The public API object is returned at the bottom and should expose only what the router or other modules need to call.
- `init()` must be synchronous (no top-level `await`). Async work is triggered inside after the DOM is rendered.
- Never use `document.write()`, `eval()`, or `innerHTML` with unsanitised user input.
- Template literal HTML in `innerHTML` assignments must not interpolate raw user-supplied strings. Use `textContent` for user data.

---

## 4. Design System and CSS

File: `css/app.css`

### Custom properties (tokens)

All modules inherit these from `:root`:

```css
--bg-primary:    #0d1117   /* Page background */
--bg-secondary:  #161b22   /* Section background */
--bg-card:       #161b22   /* Card/panel background */
--border:        #21262d   /* Default border */
--text-primary:  #c9d1d9   /* Primary text */
--text-muted:    #8b949e   /* Secondary/label text */
--accent-green:  #3fb950   /* Success, Africa brand accent */
--accent-blue:   #58a6ff   /* Links, info, Illumina accent */
--accent-purple: #bc8cff   /* Badges, highlight */
--accent-orange: #f97316   /* Nanopore, warnings */
--accent-red:    #f85149   /* Errors, critical */
--font-mono:     'JetBrains Mono', monospace
```

### Component classes

Commonly used utility classes defined in `app.css`:

| Class | Purpose |
| --- | --- |
| `.card` | Standard dark card with border |
| `.btn` | Primary action button |
| `.btn-ghost` | Borderless button |
| `.badge` | Inline status chip |
| `.tag` | Small label pill |
| `.section-title` | `h2` sized heading with gradient treatment |
| `.mono` | Monospace text span |
| `.reveal` | Scroll-triggered fade-in (do **not** use on routed sections) |

### Theming

Light mode and high-contrast mode are applied via `[data-theme="light"]` and `[data-theme="high-contrast"]` attributes on `<html>`. The theme module (`js/theme.js`) reads the user's preference from `localStorage` and sets the attribute on load.

### Per-module CSS

Each module has its own stylesheet (`css/modulename.css`) linked in `index.html`. Module styles use a module-specific class prefix (e.g., `.gwas-`, `.vl-`, `.nh-`, `.pgx-`) to avoid collisions with the global design system.

---

## 5. Data Layer

OmicsLab has no database. All persistence uses the Web Storage API.

### localStorage keys

| Key | Type | Contents |
| --- | --- | --- |
| `omicslab_user` | JSON | Name, email, institution, country, research interests |
| `omicslab_progress` | JSON | Module completion flags, per-workflow step progress |
| `omicslab_badges` | JSON | Earned badge IDs and unlock timestamps |
| `omicslab_notebook` | JSON | Lab notebook entries array |
| `omicslab_settings` | JSON | Theme, language, notification preferences |
| `omicslab_anthropic_key` | String | Claude API key (never logged or transmitted to OmicsLab) |
| `omicslab_reproducibility` | JSON | Community reproducibility hub submissions |
| `omicslab_collab_projects` | JSON | Collaboration project metadata |

### Reading and writing

There is no central store manager. Each module reads and writes its own keys directly:

```javascript
const prefs = JSON.parse(localStorage.getItem('omicslab_settings') || '{}');
prefs.theme = 'dark';
localStorage.setItem('omicslab_settings', JSON.stringify(prefs));
```

### Capacity

`localStorage` is limited to approximately 5 MB per origin in most browsers. The lab notebook, collaboration data, and reproducibility submissions are the heaviest writers. The `js/offline-data.js` module provides an IDB (IndexedDB) fallback for larger datasets.

---

## 6. Service Worker and Offline Strategy

File: `sw.js`

### Cache names

```javascript
const STATIC_CACHE = 'ol-static-v13';  // JS, CSS, JSON, images
const PAGES_CACHE  = 'ol-pages-v1';    // index.html
const FONTS_CACHE  = 'ol-fonts-v1';    // Google Fonts (365-day TTL)
```

Bump `STATIC_CACHE` version on every deployment that modifies JS or CSS files. The activate handler deletes all caches not in the current set, forcing clients to fetch fresh assets.

### Strategies by resource type

| Resource | Strategy | Rationale |
| --- | --- | --- |
| `index.html` | Network-first (3s timeout) | Always try to get the latest shell |
| `*.js`, `*.css`, `*.json` | Stale-while-revalidate | Serve fast, update in background |
| Images, fonts, SVG, WOFF2 | Cache-first | Static assets; rarely change |
| Cross-origin (CDN, APIs) | Pass-through (no cache) | Cannot cache third-party responses |
| Auth/API paths | Network-only | Never cache credentials |

### Update notification

On activate, the Service Worker posts `{ type: 'SW_UPDATED' }` to all open windows. `js/pwa.js` listens for this and shows a banner prompting the user to reload for the latest version.

---

## 7. Internationalisation

File: `js/i18n.js` and `js/locales/`

### Adding strings

All translatable strings are keyed in `js/locales/en.js`:

```javascript
window.OmicsLab.Locales.en = {
  nav_learn: 'Learn',
  hero_title: 'Train. Simulate. Discover.',
  // ...
};
```

To translate: copy `en.js` to `xx.js`, update the string values, leave the keys unchanged.

### Using strings in modules

```javascript
const t = OmicsLab.i18n.t;
element.textContent = t('nav_learn');
```

### Language switching

`OmicsLab.i18n.setLanguage('fr')` re-renders all elements that have a `data-i18n` attribute. Dynamic content rendered by modules must call `t()` at render time (not at page load) so that language changes take effect on re-render.

---

## 8. Authentication

File: `js/auth.js`

OmicsLab does not implement server-side authentication. The auth module stores a hashed profile in `localStorage` under `omicslab_user`. This is sufficient for progress tracking and personalisation within a single device.

There is no session token, no JWT, no cookie, and no server call on login. A user who clears `localStorage` starts fresh.

For institutional deployment requiring real accounts, the auth module provides hooks (`OmicsLab.Auth.onLogin`, `OmicsLab.Auth.onLogout`) that an institution can wire to their own identity provider by extending `auth.js`.

---

## 9. AI Assistant Integration

The Claude API is called directly from the browser. This requires the `anthropic-dangerous-direct-browser-access: true` header, which Anthropic provides for browser-side use cases where the API key is user-supplied.

```javascript
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': localStorage.getItem('omicslab_anthropic_key'),
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
    'content-type': 'application/json'
  },
  body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1024, messages: [...] })
});
```

The API key is:

- Stored only in `localStorage` on the user's device.
- Never sent to any OmicsLab server (there are no OmicsLab servers).
- Sent only to `api.anthropic.com` when the user invokes the assistant.
- Never logged, proxied, or persisted anywhere other than the user's own browser.

Users must obtain their own API key from <https://console.anthropic.com>. The free tier is sufficient for typical usage.

---

## 10. Analytics

File: `js/analytics.js`

OmicsLab uses a privacy-first, self-contained analytics stub. No third-party scripts (Google Analytics, Mixpanel, etc.) are loaded.

Events are queued in `localStorage` and flushed via Background Sync when connectivity is available. In the current implementation, the flush handler sends events to the same static host (a no-op for GitHub Pages). Institutions self-hosting can wire the flush to their own analytics endpoint by modifying `_flushAnalytics()` in `sw.js`.

No personally identifiable information is included in events. Events are of the form `{ type: 'PAGE_VIEW', route: '/gwas', ts: 1234567890 }`.

---

## 11. Accessibility

OmicsLab follows WCAG 2.1 AA guidelines:

- All interactive elements have `aria-label` or visible label text.
- Modals use `role="dialog"` with `aria-modal="true"` and `aria-labelledby`.
- Focus is trapped inside open modals (`js/focus-trap.js`).
- A skip-to-content link is present at the top of `index.html`.
- Dynamic content updates announce to screen readers via `aria-live="polite"` regions.
- The high-contrast theme (`[data-theme="high-contrast"]`) increases contrast ratios above 7:1 for all text.
- The app is fully keyboard-navigable. Tab order follows DOM order.

---

## 12. Error Handling

File: `js/error.js`

A global error boundary catches uncaught exceptions and unhandled promise rejections. On error, it renders a visible error panel in the active section rather than leaving a blank page:

```javascript
window.addEventListener('unhandledrejection', e => {
  OmicsLab.Error.renderPageError(document.querySelector('.active-section'), e.reason);
});
```

Each module's `init()` should wrap its body in a `try/catch` and fall back to a descriptive error message rather than a silent blank. This is especially important for the terminal and analysis modules where template literals can throw at parse time.

---

## 13. Module Reference

### Scientific simulation

| Module | File | Public API |
| --- | --- | --- |
| Workflow engine | `js/engine.js` | `Engine.run(workflowId)`, `Engine.step()`, `Engine.reset()` |
| Lab bench UI | `js/bench.js` | `Bench.init(workflowId)` |
| Variant interpretation | `js/variantinterp.js` | `VariantInterp.init()` |
| Quality predictor | `js/qualitypredictor.js` | `QualityPredictor.init()` |
| GWAS suite | `js/gwas.js` | `GWAS.init()`, `GWAS.switchTab(tab)`, `GWAS.copyCmd(idx)` |
| Pharmacogenomics | `js/pharmacogenomics.js` | `PGx.init()`, `PGx.selectGene(id)`, `PGx.filterCategory(cat)` |
| Virtual Lab | `js/virtual-lab.js` | `VirtualLab.init()`, `VirtualLab.goTo(idx)`, `VirtualLab.select(id)` |
| RNA Atlas | `js/rna-atlas.js` | `RNAAtlas.init()`, `RNAAtlas.loadStudy(id)`, `RNAAtlas.switchView(view)` |
| GWAS Network | `js/network-hub.js` | `NetworkHub.init()`, `NetworkHub.select(id)` |

### Education

| Module | File | Public API |
| --- | --- | --- |
| Learning paths | `js/curriculum.js` | `Curriculum.init()`, `Curriculum.completeLesson(id)` |
| Badges | `js/badges.js` | `Badges.award(id)`, `Badges.list()`, `Badges.generateCertificate(id)` |
| HPC training | `js/hpc-training.js` | `HPCTraining.init()` |
| Skill tree | `js/skill-tree.js` | `SkillTree.init()`, `SkillTree.unlock(nodeId)` |
| Career paths | `js/career.js` | `Career.init()` |

### Research tools

| Module | File | Public API |
| --- | --- | --- |
| Lab notebook | `js/labnotebook.js` | `Notebook.init()`, `Notebook.save(entry)`, `Notebook.export()` |
| Reproducibility hub | `js/repro-hub.js` | `ReproHub.init()`, `ReproHub.submit(metadata)` |
| Grant writing | `js/grant.js` | `Grant.init()` |
| Pipeline generator | `js/pipeline-gen.js` | `PipelineGen.init()`, `PipelineGen.generate(options)` |
| Meta-analysis | `js/metaanalysis.js` | `MetaAnalysis.init()` |

---

## 14. Adding a New Module — Step-by-Step

This example adds a hypothetical `RibosomeProfiler` module at route `#/ribo`.

**Step 1 — JS module**

Create `js/ribo-profiler.js`:

```javascript
window.OmicsLab = window.OmicsLab || {};

OmicsLab.RiboProfiler = (function () {

  function init() {
    const container = document.getElementById('ribo-content');
    if (!container || container.querySelector('.ribo-page')) return;
    try {
      container.innerHTML = `<div class="ribo-page"> ... </div>`;
      _bindEvents(container);
    } catch (err) {
      container.innerHTML = `<div style="padding:2rem;color:#f85149">${err}</div>`;
    }
  }

  function _bindEvents(el) { /* event wiring */ }

  return { init };

})();
```

**Step 2 — CSS**

Create `css/ribo-profiler.css` with `.ribo-` prefixed selectors.

**Step 3 — HTML container**

In `index.html`, add before the closing `</main>`:

```html
<div id="ribo-section">
  <div id="ribo-content"></div>
</div>
```

**Step 4 — Router registration**

In `js/router.js`:

```javascript
// In PAGES object:
'ribo': { section: 'ribo-section', group: 'tools' },

// In PAGE_TO_GROUP:
'ribo': 'tools',

// In _dispatch():
if (page === 'ribo') {
  if (OmicsLab.RiboProfiler) OmicsLab.RiboProfiler.init();
}
```

**Step 5 — Nav item**

Add to the appropriate dropdown in `index.html`:

```html
<a href="#/ribo" class="mega-link">Ribosome Profiler</a>
```

**Step 6 — Asset links**

In `index.html` `<head>`:

```html
<link rel="stylesheet" href="css/ribo-profiler.css">
```

Before closing `</body>`:

```html
<script src="js/ribo-profiler.js"></script>
```

**Step 7 — Sitemap**

Add to `sitemap.xml`:

```xml
<url><loc>https://simon-mufara.github.io/Omics-Lab/#/ribo</loc>
<changefreq>monthly</changefreq><priority>0.8</priority></url>
```

**Step 8 — Service Worker**

Bump `STATIC_CACHE` in `sw.js`:

```javascript
const STATIC_CACHE = 'ol-static-v14';
```

---

## 15. Workflow Engine

File: `js/engine.js`

The engine drives all 14 workflow simulations. It reads workflow definitions from `js/workflows.js` and manages step state, parameter validation, QC score calculation, and sabotage mode.

### Workflow definition structure

```javascript
{
  id: 'wgs',
  name: 'Whole-Genome Sequencing',
  domain: 'Genomics',
  duration: '2–3 days',
  cost: { zar: 4500, usd: 250 },
  steps: [
    {
      id: 'extraction',
      name: 'DNA Extraction',
      desc: 'Extract high-molecular-weight DNA from sample.',
      params: [
        { id: 'input_mg', label: 'Input tissue (mg)', type: 'range', min: 5, max: 200, default: 50 },
        { id: 'kit', label: 'Extraction kit', type: 'select', options: ['Qiagen DNeasy', 'Promega Maxwell'] }
      ],
      checks: [
        { id: 'yield', label: 'DNA yield > 500 ng', fn: (p) => p.input_mg * 8 > 500 },
        { id: 'purity', label: 'A260/A280 between 1.8–2.0', fn: (p) => true }
      ],
      sabotage: { param: 'input_mg', bad_value: 3, error: 'Insufficient input — DNA yield too low for library prep.' }
    },
    // ...
  ],
  quiz: [
    { q: 'What does A260/A280 ratio measure?', options: ['DNA purity', 'DNA length', 'DNA concentration', 'GC content'], answer: 0 }
  ]
}
```

### Engine state

```javascript
OmicsLab.Engine.run('wgs')   // Load and start a workflow
OmicsLab.Engine.step()       // Advance to the next step
OmicsLab.Engine.setParam(id, value)  // Update a parameter
OmicsLab.Engine.getScore()   // Return current QC score (0–100)
OmicsLab.Engine.isSabotaged()  // Return whether sabotage mode is active
OmicsLab.Engine.reset()      // Clear state and return to step 1
```

---

## 16. Deployment

### GitHub Pages (recommended)

1. Fork the repository on GitHub.
2. Go to Settings → Pages → Source: Deploy from branch `main`, folder `/`.
3. The site is live at `https://USERNAME.github.io/Omics-Lab/`.
4. Push to `main` triggers an automatic redeploy within 60 seconds.

### Local development

```bash
python -m http.server 3000
# or
npx serve .
# or
ruby -run -e httpd . -p 3000
```

Any HTTP server works. The app does not use ES modules (`import`/`export`), so CORS and module mode restrictions do not apply.

### Institutional self-hosting

Upload the repository root to any static host. For HTTPS (required for PWA install and push notifications), obtain a certificate via Let's Encrypt or your institution's CA.

Set the correct `start_url` and `scope` in `manifest.json` if hosting under a subdirectory:

```json
{
  "start_url": "/genomics-training/",
  "scope": "/genomics-training/"
}
```

Update `sw.js` path checks accordingly:

```javascript
if (path === '/' || path === '/genomics-training/' || path.endsWith('/index.html')) {
  e.respondWith(_networkFirst(e.request, PAGES_CACHE, 3000));
}
```

---

## 17. Security Model

OmicsLab has a minimal attack surface by design.

**No server side.** There are no endpoints to attack, no database to inject, and no session tokens to steal.

**User data stays local.** All data in `localStorage` is scoped to the origin and not accessible to other sites. Clearing browser data removes it entirely.

**API key safety.** The Claude API key is read from `localStorage` and sent only to `api.anthropic.com`. It is never included in analytics events, log output, or URLs. Developers must not add logging of `localStorage.getItem('omicslab_anthropic_key')`.

**innerHTML safety.** Module HTML templates use template literals with hardcoded or pre-validated data. Never interpolate raw user strings into `innerHTML`. For any user-facing content rendered dynamically (notebook entries, user names), always use `textContent` or sanitise with `DOMPurify` before inserting into DOM.

**Content Security Policy.** For institutional deployment, add a `Content-Security-Policy` header:

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  connect-src 'self' https://api.anthropic.com https://fonts.googleapis.com;
  img-src 'self' data:;
```

Note: `unsafe-inline` is required because all JS and CSS is inline-via-file (no nonce/hash infrastructure). Future versions should migrate to a nonce-based CSP.

---

## 18. Known Constraints

**No real data execution.** The pipeline terminal, GWAS suite, and other analysis tools simulate outputs. They do not run actual bioinformatics tools. PLINK2 commands shown are real and correct but execute in a simulated environment only.

**localStorage limits.** The 5 MB cap may be reached by heavy users of the lab notebook or collaboration module. The IDB fallback in `js/idb-manager.js` handles overflow for supported browsers.

**Offline font loading.** Google Fonts are cached on first load via the Service Worker. On a truly offline first load (never connected), fonts fall back to system sans-serif and monospace. All content remains readable.

**No real-time collaboration.** The Teams and Collaboration modules store data locally per user. There is no WebSocket or WebRTC layer for live multi-user collaboration. Shared work requires manual export/import.

**Print/PDF certificates.** Certificate generation uses the browser's `window.print()`. On mobile browsers or in some kiosk/restricted environments, the print dialog may not open. There is no server-side PDF renderer.

**PWA install.** PWA install prompts require HTTPS and a valid `manifest.json`. Local `http://localhost` development also triggers the prompt in Chromium-based browsers. Safari requires manual "Add to Home Screen" from the share sheet.

---

*OmicsLab is independently developed by Simon Mufara. Not affiliated with H3Africa, H3ABioNet, or Africa CDC. Built in admiration of their work.*
