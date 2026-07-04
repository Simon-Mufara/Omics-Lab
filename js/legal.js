/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Legal Pages (Prompt 40)
   ─ #/privacy  — Privacy Policy
   ─ #/terms    — Terms of Use
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Legal = (function () {

  const BASE_URL   = 'https://omicsdatalab.tech/';
  const CONTACT    = 'simon.mufara1@gmail.com';
  const UPDATED_PRIVACY = 'June 2026';
  const UPDATED_TERMS   = 'June 2026';

  /* ─── Privacy Policy ─── */
  function _privacyHtml() {
    return `
      <div class="legal-page" id="privacy-content">
        <div class="legal-header">
          <div class="legal-chip">Privacy Policy</div>
          <h1 class="legal-title">Your Privacy on OmicsLab</h1>
          <p class="legal-sub">Last updated: ${UPDATED_PRIVACY} · <a href="mailto:${CONTACT}" class="legal-link">${CONTACT}</a></p>
        </div>

        <div class="legal-callout legal-callout-green">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <strong>Your data never leaves your device.</strong> OmicsLab is an offline-first Progressive Web App. All platform data — progress, notes, settings, conversations — is stored exclusively in your browser's localStorage. We do not operate any servers that collect, store, or process personal user data.
          </div>
        </div>

        <section class="legal-section">
          <h2 class="legal-h2">1. Data We Do Not Collect</h2>
          <p>OmicsLab collects <strong>no personal data</strong>. We do not collect:</p>
          <ul class="legal-ul">
            <li>Names, email addresses, or contact details</li>
            <li>Learning activity, progress, or scores</li>
            <li>Usage analytics, page views, or session data</li>
            <li>Device identifiers, IP addresses, or browser fingerprints</li>
            <li>Cookies (we set none)</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">2. What Is Stored in Your Browser</h2>
          <p>The following data is stored locally on your device using <code class="legal-code">localStorage</code> and never transmitted to any server:</p>
          <ul class="legal-ul">
            <li><strong>Platform preferences:</strong> language, theme, onboarding completion state</li>
            <li><strong>Learning progress:</strong> completed modules, earned badges, streak counter, quiz scores</li>
            <li><strong>Profile information:</strong> name and institution you optionally enter in the Profile section — stored locally only</li>
            <li><strong>Nexus messages:</strong> channel messages you write in the offline Nexus hub — local only</li>
            <li><strong>Lab notebook, citations, protocols:</strong> content you create in these tools — local only</li>
            <li><strong>Claude API key:</strong> if you choose to provide your Anthropic API key for AI features, it is stored in localStorage and sent <em>only</em> directly to <code class="legal-code">api.anthropic.com</code> — never to OmicsLab servers (which do not exist)</li>
          </ul>
          <p>You can view, export, or delete all locally-stored data at any time via <strong>Settings → Data & Privacy</strong>.</p>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">3. Claude API Key Handling</h2>
          <div class="legal-callout legal-callout-blue">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Your Anthropic API key is used exclusively for browser-to-Anthropic API calls using the <code class="legal-code">anthropic-dangerous-direct-browser-access: true</code> header. It is never sent to OmicsLab's domain. You can remove it at any time from Settings.</span>
          </div>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">4. Third-Party Services</h2>
          <p>OmicsLab loads the following third-party resources:</p>
          <ul class="legal-ul">
            <li><strong>Google Fonts</strong> (fonts.googleapis.com) — fonts are cached by the Service Worker after first load for offline use. Google may log font requests; see <a href="https://policies.google.com/privacy" class="legal-link" target="_blank" rel="noopener">Google's Privacy Policy</a>.</li>
            <li><strong>Anthropic API</strong> (api.anthropic.com) — only contacted when you use the AI Assistant feature and have provided an API key. Subject to <a href="https://www.anthropic.com/legal/privacy" class="legal-link" target="_blank" rel="noopener">Anthropic's Privacy Policy</a>.</li>
            <li><strong>PubMed / NCBI APIs</strong> — only contacted when you use the PubMed search feature. Requests are anonymous with no personal data attached.</li>
            <li><strong>GitHub Pages</strong> — OmicsLab is hosted on GitHub Pages. GitHub may log IP addresses in accordance with their <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" class="legal-link" target="_blank" rel="noopener">Privacy Statement</a>.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">5. Service Worker & Caching</h2>
          <p>OmicsLab registers a Service Worker that caches platform assets (JavaScript, CSS, images) in your browser for offline use. This cache contains only platform code and no personal data. It can be cleared via your browser's developer tools or by uninstalling the PWA.</p>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">6. Your Rights</h2>
          <p>Since all data is local to your device, you have full control:</p>
          <ul class="legal-ul">
            <li><strong>Access:</strong> Open browser DevTools → Application → localStorage to inspect all stored data</li>
            <li><strong>Export:</strong> Use Settings → Data & Privacy → Export all data</li>
            <li><strong>Delete:</strong> Use Settings → Data & Privacy → Clear all data, or clear site data in your browser settings</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">7. Children</h2>
          <p>OmicsLab does not collect personal data from any user, including users under 18. The platform is designed for students, researchers, and educators and has no account registration or data submission mechanism.</p>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">8. Changes to This Policy</h2>
          <p>We will update this page if our practices change materially. The "Last updated" date at the top indicates the current version.</p>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">9. Contact</h2>
          <p>Privacy questions: <a href="mailto:${CONTACT}" class="legal-link">${CONTACT}</a></p>
        </section>
      </div>`;
  }

  /* ─── Terms of Use ─── */
  function _termsHtml() {
    return `
      <div class="legal-page" id="terms-content">
        <div class="legal-header">
          <div class="legal-chip">Terms of Use</div>
          <h1 class="legal-title">OmicsLab Terms of Use</h1>
          <p class="legal-sub">Last updated: ${UPDATED_TERMS} · <a href="mailto:${CONTACT}" class="legal-link">${CONTACT}</a></p>
        </div>

        <div class="legal-callout legal-callout-green">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
          <div>OmicsLab is <strong>free for educational, research, and personal use</strong>. By using this platform you agree to these terms.</div>
        </div>

        <section class="legal-section">
          <h2 class="legal-h2">1. Acceptance</h2>
          <p>By accessing or using OmicsLab at <a href="${BASE_URL}" class="legal-link" target="_blank" rel="noopener">${BASE_URL}</a> or installing it as a PWA, you agree to these Terms of Use. If you do not agree, please do not use the platform.</p>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">2. Permitted Use</h2>
          <p>You may use OmicsLab for:</p>
          <ul class="legal-ul">
            <li>Personal learning and skill development in bioinformatics and genomics</li>
            <li>Academic research and teaching at educational institutions</li>
            <li>Workshops, training programmes, and conference demonstrations</li>
            <li>Non-commercial scientific outreach across Africa and globally</li>
          </ul>
          <p>Commercial use (reselling, white-labelling, paid training delivery based on OmicsLab content) requires written permission. Contact us at <a href="mailto:${CONTACT}" class="legal-link">${CONTACT}</a>.</p>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">3. Intellectual Property</h2>
          <p>The OmicsLab source code is available on <a href="https://github.com/Simon-Mufara/Omics-Lab" class="legal-link" target="_blank" rel="noopener">GitHub</a> under the MIT Licence. You are free to fork, adapt, and redistribute the code with attribution.</p>
          <p>Platform content — disease summaries, workflow descriptions, educational text, and curation — is Copyright © Simon Mufara, 2024–${new Date().getFullYear()}, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" class="legal-link" target="_blank" rel="noopener">CC BY 4.0</a>. Attribution required: <em>"OmicsLab Simulator (Simon Mufara, ${BASE_URL})"</em>.</p>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">4. AI Features and API Keys</h2>
          <ul class="legal-ul">
            <li>AI features use your own Anthropic API key, billed directly to your Anthropic account.</li>
            <li>OmicsLab does not proxy, store, or log any AI queries or responses.</li>
            <li>You are responsible for your API key usage and associated costs.</li>
            <li>AI-generated content is for educational purposes only — it should not be used for clinical diagnosis, medical decision-making, or patient care.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">5. Disclaimer of Warranties</h2>
          <p>OmicsLab is provided <strong>"as is"</strong> without warranties of any kind. Specifically:</p>
          <ul class="legal-ul">
            <li>Simulations are educational approximations — they do not replicate exact laboratory conditions or produce publication-ready results.</li>
            <li>We do not guarantee accuracy of disease information, variant interpretations, or QC thresholds. These are for training purposes only.</li>
            <li>The platform may have bugs, interruptions, or inaccuracies. We are not liable for any errors.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">6. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Simon Mufara and OmicsLab contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.</p>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">7. Open Source Components</h2>
          <p>OmicsLab uses no external JavaScript libraries. The platform is pure HTML/CSS/JS. Fonts are loaded from Google Fonts (<a href="https://fonts.google.com" class="legal-link" target="_blank" rel="noopener">fonts.google.com</a>) under the SIL Open Font Licence.</p>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">8. Citation</h2>
          <p>If you use OmicsLab in a publication, workshop, or grant application, we appreciate citation:</p>
          <div class="legal-cite-block">Mufara, S. (${new Date().getFullYear()}). <em>OmicsLab Simulator: Interactive omics training for Africa</em>. Retrieved from ${BASE_URL}</div>
        </section>

        <section class="legal-section">
          <h2 class="legal-h2">9. Contact</h2>
          <p><a href="mailto:${CONTACT}" class="legal-link">${CONTACT}</a></p>
        </section>
      </div>`;
  }

  /* ─── Render a legal page ─── */
  function render(type) {
    const sectionId = type === 'privacy' ? 'privacy-section' : 'terms-section';
    const el = document.getElementById(sectionId);
    if (!el) return;
    if (el.querySelector('.legal-page')) return; /* already rendered */
    el.innerHTML = type === 'privacy' ? _privacyHtml() : _termsHtml();
    _injectStyles();
  }

  function _injectStyles() {
    if (document.getElementById('legal-styles')) return;
    const s = document.createElement('style');
    s.id = 'legal-styles';
    s.textContent = `
      .legal-page{max-width:760px;margin:0 auto;padding:1.5rem 1rem 4rem}
      .legal-header{margin-bottom:1.75rem}
      .legal-chip{display:inline-flex;padding:.18rem .6rem;background:rgba(88,166,255,.1);border:1px solid rgba(88,166,255,.25);border-radius:20px;font-size:.7rem;font-weight:700;color:#58a6ff;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.65rem}
      .legal-title{font-size:1.6rem;font-weight:800;color:#E4DDD2;margin:0 0 .35rem}
      .legal-sub{font-size:.78rem;color:#A8A098;margin:0}
      .legal-link{color:#58a6ff;text-decoration:none}.legal-link:hover{text-decoration:underline}
      .legal-callout{display:flex;gap:.7rem;padding:.85rem 1rem;border-radius:8px;font-size:.82rem;line-height:1.55;margin-bottom:1.5rem;align-items:flex-start}
      .legal-callout svg{flex-shrink:0;margin-top:.1rem}
      .legal-callout-green{background:rgba(0,196,160,.07);border:1px solid rgba(0,196,160,.25);color:#c8e6c9}.legal-callout-green svg{stroke:#00C4A0}
      .legal-callout-blue{background:rgba(88,166,255,.07);border:1px solid rgba(88,166,255,.25);color:#bbdefb}.legal-callout-blue svg{stroke:#58a6ff}
      .legal-section{margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid #182236}
      .legal-section:last-child{border-bottom:none}
      .legal-h2{font-size:1rem;font-weight:700;color:#E4DDD2;margin:0 0 .6rem}
      .legal-page p{font-size:.84rem;color:#A8A098;line-height:1.65;margin:.5rem 0}
      .legal-ul{margin:.4rem 0 .4rem 1.2rem;padding:0;font-size:.84rem;color:#A8A098;line-height:1.7}
      .legal-ul li{margin:.2rem 0}
      .legal-code{font-family:'JetBrains Mono',monospace;font-size:.78rem;background:#182236;padding:.05rem .3rem;border-radius:3px;color:#e3b341}
      .legal-cite-block{background:#111B2E;border-left:3px solid #58a6ff;padding:.65rem 1rem;border-radius:0 6px 6px 0;font-size:.82rem;color:#A8A098;margin:.5rem 0;font-style:italic}
    `;
    document.head.appendChild(s);
  }

  return { render };
})();
