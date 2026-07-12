/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Settings Page (Prompt 10)
   ─ Profile · Appearance (theme/accent/font) · Language
   ─ Notifications · Privacy & Data · About
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Settings = (function () {

  const SECTIONS = ['profile','appearance','language','notifications','privacy','about'];
  let _activeSection = 'profile';

  const LANGUAGES = [
    { code:'en', name:'English', flag:'🇬🇧' },
    { code:'sw', name:'Kiswahili', flag:'🇰🇪' },
    { code:'ha', name:'Hausa', flag:'🇳🇬' },
    { code:'yo', name:'Yorùbá', flag:'🇳🇬' },
    { code:'am', name:'አማርኛ (Amharic)', flag:'🇪🇹' },
    { code:'fr', name:'Français', flag:'🇫🇷' },
    { code:'ar', name:'العربية', flag:'🇲🇦' },
    { code:'pt', name:'Português', flag:'🇲🇿' },
    { code:'zu', name:'isiZulu', flag:'🇿🇦' },
    { code:'xh', name:'isiXhosa', flag:'🇿🇦' },
    { code:'so', name:'Soomaali', flag:'🇸🇴' },
    { code:'rw', name:'Ikinyarwanda', flag:'🇷🇼' },
    { code:'mg', name:'Malagasy', flag:'🇲🇬' },
    { code:'ln', name:'Lingála', flag:'🇨🇩' },
    { code:'ti', name:'ትግርኛ (Tigrinya)', flag:'🇪🇷' },
    { code:'af', name:'Afrikaans', flag:'🇿🇦' },
    { code:'de', name:'Deutsch', flag:'🇩🇪' },
    { code:'es', name:'Español', flag:'🇪🇸' },
    { code:'zh', name:'中文', flag:'🇨🇳' },
    { code:'hi', name:'हिन्दी', flag:'🇮🇳' },
    { code:'ru', name:'Русский', flag:'🇷🇺' },
  ];

  const ACCENT_COLORS = [
    { key:'green',  label:'Green (default)', val:'#00C4A0' },
    { key:'blue',   label:'Blue',            val:'#58a6ff' },
    { key:'purple', label:'Purple',           val:'#bc8cff' },
    { key:'orange', label:'Orange',           val:'#f97316' },
    { key:'red',    label:'Red',              val:'#ff6b6b' },
  ];

  function _readSettings() {
    return {
      theme:        localStorage.getItem('omicslab_theme')     || 'dark',
      accent:       localStorage.getItem('omicslab_accent')    || 'green',
      fontSize:     localStorage.getItem('omicslab_fontsize')  || 'default',
      reducedMotion:localStorage.getItem('omicslab_reducedmotion') === '1',
      language:     localStorage.getItem('omicslab_lang')      || 'en',
      soundOn:      localStorage.getItem('omicslab_sound')     !== '0',
      notifOutbreak:localStorage.getItem('omicslab_notif_outbreak') || 'weekly',
      disgenetKey:  localStorage.getItem('omicslab_disgenet_key')   || '',
    };
  }

  function _save(key, val) { localStorage.setItem(key, val); }

  /* ─── Theme application ─── */
  function _applyTheme(theme) {
    const pref = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : theme;
    document.documentElement.dataset.theme = pref;
  }

  function _applyAccent(key) {
    const color = ACCENT_COLORS.find(c => c.key === key)?.val || '#00C4A0';
    document.documentElement.style.setProperty('--accent', color);
    /* Also update CSS vars used widely */
    document.documentElement.style.setProperty('--ol-green', color);
  }

  function _applyFontSize(size) {
    const map = { default: '14px', large: '15.5px', xlarge: '17px' };
    document.documentElement.style.setProperty('--base-font', map[size] || '14px');
  }

  /* ─── Switch section ─── */
  function _switchSection(id) {
    _activeSection = id;
    document.querySelectorAll('.st-nav-item').forEach(el =>
      el.classList.toggle('st-nav-active', el.dataset.sec === id));
    document.querySelectorAll('.st-section').forEach(el =>
      el.style.display = el.id === `st-sec-${id}` ? '' : 'none');
  }

  /* ─── Export all data ─── */
  function _exportData() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('omicslab'));
    const data = {};
    keys.forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); } });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `omicslab-data-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    OmicsLab.Notify?.success('Data exported as JSON');
  }

  function _clearProgress() {
    if (!confirm('Clear all learning progress, quiz scores, and badge data? This cannot be undone.')) return;
    ['omicslab_progress','omicslab_badges','omicslab_quiz_','omicslab_certification','omicslab_xp']
      .forEach(prefix => {
        Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k));
      });
    OmicsLab.Notify?.success('Learning progress cleared');
    setTimeout(() => window.location.reload(), 800);
  }

  async function _deleteAccount() {
    if (!confirm('DELETE ALL OmicsLab data from this device? All progress, notes, and settings will be permanently erased.')) return;
    if (!confirm('Are you absolutely sure? This is irreversible.')) return;
    /* Sign out first — an active Clerk/local session otherwise survives the
       localStorage wipe and re-populates the same profile on next load. */
    try { await OmicsLab.Auth?.signOut?.(); } catch {}
    Object.keys(localStorage).filter(k => k.startsWith('omicslab')).forEach(k => localStorage.removeItem(k));
    OmicsLab.Notify?.info('All data cleared. Reloading…');
    setTimeout(() => window.location.reload(), 1000);
  }

  /* ─── Build section HTML ─── */
  function _buildProfileSection(s) {
    const user = OmicsLab.Utils?.safeParse('omicslab_user', {}) || {};
    return `
      <div class="st-section" id="st-sec-profile">
        <div class="st-section-title">Profile</div>
        <div class="st-form-group">
          <label class="st-label">Name</label>
          <input class="st-input" id="st-name" value="${_esc(user.name||'')}" placeholder="Your full name">
        </div>
        <div class="st-form-group">
          <label class="st-label">Institution</label>
          <input class="st-input" id="st-inst" value="${_esc(user.institution||'')}" placeholder="University / research institute">
        </div>
        <div class="st-form-group">
          <label class="st-label">Country</label>
          <input class="st-input" id="st-country" value="${_esc(user.country||'')}" placeholder="Country">
        </div>
        <div class="st-form-group">
          <label class="st-label">Role</label>
          <select class="st-select" id="st-role">
            ${['Student','Researcher','Clinician','Educator','Bioinformatician','Public Health Officer','Other'].map(r =>
              `<option value="${r}"${(user.role||'Student')===r?' selected':''}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="st-form-group">
          <label class="st-label">API Keys</label>
          <input class="st-input" id="st-disgenet-key" value="${_esc(s.disgenetKey)}" placeholder="DisGeNET API key (optional — for live gene-disease data)">
          <div class="st-help">Register free at <a href="https://www.disgenet.com/signin" target="_blank" rel="noopener" class="st-link">disgenet.com</a></div>
        </div>
        <button class="st-btn-primary" onclick="OmicsLab.Settings._saveProfile()">Save Profile</button>
      </div>`;
  }

  function _saveProfile() {
    const user = OmicsLab.Utils?.safeParse('omicslab_user', {}) || {};
    user.name = document.getElementById('st-name')?.value || user.name;
    user.institution = document.getElementById('st-inst')?.value || user.institution;
    user.country = document.getElementById('st-country')?.value || user.country;
    user.role = document.getElementById('st-role')?.value || user.role;
    (OmicsLab.Utils?.safeSet || function(k,v){localStorage.setItem(k, JSON.stringify(v));})('omicslab_user', user);
    const dgnKey = document.getElementById('st-disgenet-key')?.value?.trim();
    if (dgnKey !== undefined) localStorage.setItem('omicslab_disgenet_key', dgnKey);
    OmicsLab.Notify?.success('Profile saved');
  }

  function _buildAppearanceSection(s) {
    const accent = ACCENT_COLORS.find(c => c.key === s.accent) || ACCENT_COLORS[0];
    return `
      <div class="st-section" id="st-sec-appearance" style="display:none">
        <div class="st-section-title">Appearance</div>

        <div class="st-pref-group">
          <div class="st-pref-label">Theme</div>
          <div class="st-radio-row">
            ${['dark','light','system'].map(t => `
              <label class="st-radio-opt">
                <input type="radio" name="st-theme" value="${t}"${s.theme===t?' checked':''} onchange="OmicsLab.Settings._onTheme('${t}')">
                <span class="st-radio-box">${t.charAt(0).toUpperCase()+t.slice(1)}</span>
              </label>`).join('')}
          </div>
        </div>

        <div class="st-pref-group">
          <div class="st-pref-label">Accent colour</div>
          <div class="st-color-row">
            ${ACCENT_COLORS.map(c => `
              <button class="st-color-btn${s.accent===c.key?' st-color-active':''}" title="${c.label}"
                style="background:${c.val}" onclick="OmicsLab.Settings._onAccent('${c.key}')"></button>`).join('')}
          </div>
        </div>

        <div class="st-pref-group">
          <div class="st-pref-label">Font size</div>
          <div class="st-radio-row">
            ${[['default','Default'],['large','Large'],['xlarge','X-Large']].map(([v,l]) => `
              <label class="st-radio-opt">
                <input type="radio" name="st-fontsize" value="${v}"${s.fontSize===v?' checked':''} onchange="OmicsLab.Settings._onFontSize('${v}')">
                <span class="st-radio-box">${l}</span>
              </label>`).join('')}
          </div>
        </div>

        <div class="st-pref-group">
          <label class="st-toggle-row">
            <span class="st-toggle-label">Reduce motion</span>
            <input type="checkbox" class="st-toggle" id="st-reduced-motion"${s.reducedMotion?' checked':''} onchange="OmicsLab.Settings._onReducedMotion(this.checked)">
          </label>
        </div>
      </div>`;
  }

  function _onTheme(t) { _save('omicslab_theme', t); _applyTheme(t); OmicsLab.Notify?.info(`Theme: ${t}`); }
  function _onAccent(k) {
    _save('omicslab_accent', k);
    _applyAccent(k);
    document.querySelectorAll('.st-color-btn').forEach((btn,i) => btn.classList.toggle('st-color-active', ACCENT_COLORS[i]?.key === k));
    OmicsLab.Notify?.info(`Accent: ${ACCENT_COLORS.find(c=>c.key===k)?.label || k}`);
  }
  function _onFontSize(v) { _save('omicslab_fontsize', v); _applyFontSize(v); OmicsLab.Notify?.info(`Font size: ${v}`); }
  function _onReducedMotion(on) { _save('omicslab_reducedmotion', on ? '1' : '0'); OmicsLab.Notify?.info(`Reduced motion: ${on ? 'on' : 'off'}`); }

  function _buildLanguageSection(s) {
    return `
      <div class="st-section" id="st-sec-language" style="display:none">
        <div class="st-section-title">Language</div>
        <div class="st-lang-grid">
          ${LANGUAGES.map(l => `
            <button class="st-lang-item${s.language===l.code?' st-lang-active':''}"
              onclick="OmicsLab.Settings._onLang('${l.code}')">
              <span class="st-lang-flag">${l.flag}</span>
              <span class="st-lang-name">${_esc(l.name)}</span>
              ${s.language===l.code?'<span class="st-lang-check">[OK]</span>':''}
            </button>`).join('')}
        </div>
        <div class="st-help" style="margin-top:.75rem">Changing language reloads the interface. Some tools may remain in English until fully translated.</div>
      </div>`;
  }

  function _onLang(code) {
    _save('omicslab_lang', code);
    if (OmicsLab.i18n?.setLocale) { OmicsLab.i18n.setLocale(code); }
    OmicsLab.Notify?.success(`Language changed to ${LANGUAGES.find(l=>l.code===code)?.name || code}. Reload to apply.`, {
      actions: [{ label:'Reload now', onClick: () => window.location.reload() }],
    });
  }

  function _buildNotificationsSection(s) {
    return `
      <div class="st-section" id="st-sec-notifications" style="display:none">
        <div class="st-section-title">Notifications</div>
        <div class="st-pref-group">
          <label class="st-toggle-row">
            <span>
              <span class="st-toggle-label">Sound effects</span>
              <span class="st-toggle-desc">Audio feedback for interactions</span>
            </span>
            <input type="checkbox" class="st-toggle" id="st-sound"${s.soundOn?' checked':''} onchange="OmicsLab.Settings._onSound(this.checked)">
          </label>
        </div>
        <div class="st-pref-group">
          <div class="st-pref-label">Outbreak alert digest</div>
          <select class="st-select" onchange="OmicsLab.Settings._save('omicslab_notif_outbreak',this.value);OmicsLab.Notify.info('Preference saved')">
            ${[['none','None'],['daily','Daily'],['weekly','Weekly (default)']].map(([v,l]) =>
              `<option value="${v}"${s.notifOutbreak===v?' selected':''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="st-pref-group">
          <label class="st-toggle-row">
            <span>
              <span class="st-toggle-label">Browser notifications</span>
              <span class="st-toggle-desc">Outbreak alerts as push notifications</span>
            </span>
            <button class="st-btn-ghost" id="st-push-btn" onclick="OmicsLab.Settings._requestPush()">Request permission</button>
          </label>
        </div>
      </div>`;
  }

  function _onSound(on) { _save('omicslab_sound', on ? '1' : '0'); if (OmicsLab.Sound) OmicsLab.Sound.enabled = on; OmicsLab.Notify?.info(`Sound ${on ? 'on' : 'off'}`); }
  function _requestPush() {
    if (!('Notification' in window)) { OmicsLab.Notify?.warning('Browser notifications not supported'); return; }
    Notification.requestPermission().then(p => {
      OmicsLab.Notify?.[p === 'granted' ? 'success' : 'info'](`Notifications ${p}`);
      document.getElementById('st-push-btn').textContent = p.charAt(0).toUpperCase() + p.slice(1);
    });
  }

  function _buildPrivacySection() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('omicslab'));
    const sizeEstimate = keys.reduce((t,k) => t + (localStorage.getItem(k)?.length || 0), 0);
    const kb = (sizeEstimate / 1024).toFixed(1);
    return `
      <div class="st-section" id="st-sec-privacy" style="display:none">
        <div class="st-section-title">Privacy &amp; Data</div>
        <div class="st-data-stat">
          <div class="st-data-stat-num">${keys.length}</div>
          <div class="st-data-stat-label">data keys stored locally</div>
          <div class="st-data-stat-size">~${kb} KB</div>
        </div>
        <div class="st-privacy-note">All OmicsLab data is stored exclusively on your device (localStorage). No personal data is sent to any server unless you are signed in. Your Claude API key is stored locally and sent directly to Anthropic only.</div>
        <div class="st-danger-zone">
          <div class="st-danger-title">Data Management</div>
          <div class="st-danger-actions">
            <button class="st-btn-primary" onclick="OmicsLab.Settings._exportData()">Export all data (JSON)</button>
            <button class="st-btn-ghost" onclick="OmicsLab.Settings._clearProgress()">Clear learning progress</button>
            <button class="st-btn-danger" onclick="OmicsLab.Settings._deleteAccount()">Delete all data</button>
          </div>
        </div>
      </div>`;
  }

  function _buildAboutSection() {
    const cacheVer = 'v45';
    return `
      <div class="st-section" id="st-sec-about" style="display:none">
        <div class="st-section-title">About</div>
        <div class="st-about-row"><span class="st-about-label">App version</span><span class="st-about-val">2026.06</span></div>
        <div class="st-about-row"><span class="st-about-label">Cache version</span><span class="st-about-val">${cacheVer}</span></div>
        <div class="st-about-row"><span class="st-about-label">AI model</span><span class="st-about-val">Claude Fable 5 (Anthropic)</span></div>
        <div class="st-about-row"><span class="st-about-label">Licence</span><span class="st-about-val">MIT</span></div>
        <div class="st-about-row"><span class="st-about-label">Built by</span><span class="st-about-val">Simon Mufara · UCT · South Africa</span></div>
        <div class="st-about-actions">
          <button class="st-btn-ghost" onclick="OmicsLab.Settings._checkUpdate()">Check for updates</button>
          <button class="st-btn-ghost" id="st-install-btn" style="display:none" onclick="OmicsLab.Settings._install()">Install as app</button>
          <a class="st-btn-ghost" href="https://github.com/Simon-Mufara/Omics-Lab" target="_blank" rel="noopener">GitHub</a>
        </div>
        <div class="st-about-mission">
          <div class="st-about-mission-title">The Mission</div>
          <div class="st-about-mission-text">Make cutting-edge bioinformatics tools freely available to every researcher in Africa — online, offline, and in every major African language. No platform on Earth currently does this. Build it, and it becomes infrastructure.</div>
        </div>
      </div>`;
  }

  function _checkUpdate() {
    navigator.serviceWorker?.getRegistration().then(reg => {
      if (reg) { reg.update(); OmicsLab.Notify?.info('Checking for updates…'); }
      else OmicsLab.Notify?.info('No service worker registered');
    });
  }

  let _installPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _installPrompt = e;
    document.getElementById('st-install-btn')?.style.removeProperty('display');
  });

  function _install() {
    _installPrompt?.prompt();
    _installPrompt?.userChoice.then(c => { OmicsLab.Notify?.info(`Install: ${c.outcome}`); _installPrompt = null; });
  }

  function _esc(s) {
    return String(s || '').replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('settings-section');
    if (!section || section.dataset.stReady) return;
    section.dataset.stReady = '1';
    const s = _readSettings();

    section.innerHTML = `
      <div class="st-wrap">
        <div class="st-header">
          <div class="st-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8A098" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </div>
        </div>
        <div class="st-layout">
          <nav class="st-nav" aria-label="Settings sections">
            ${SECTIONS.map(sec => `
              <button class="st-nav-item${sec===_activeSection?' st-nav-active':''}" data-sec="${sec}"
                onclick="OmicsLab.Settings._switchSection('${sec}')">
                ${_secIcon(sec)}
                ${_secLabel(sec)}
              </button>`).join('')}
          </nav>
          <div class="st-content">
            ${_buildProfileSection(s)}
            ${_buildAppearanceSection(s)}
            ${_buildLanguageSection(s)}
            ${_buildNotificationsSection(s)}
            ${_buildPrivacySection()}
            ${_buildAboutSection()}
          </div>
        </div>
      </div>`;
  }

  function _secLabel(sec) {
    return { profile:'Profile', appearance:'Appearance', language:'Language', notifications:'Notifications', privacy:'Privacy & Data', about:'About' }[sec] || sec;
  }

  function _secIcon(sec) {
    const icons = {
      profile: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      appearance: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
      language: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
      notifications: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
      privacy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
      about: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    return icons[sec] || '';
  }

  /* Apply saved settings on module load */
  const _s = _readSettings();
  _applyTheme(_s.theme);
  _applyAccent(_s.accent);
  _applyFontSize(_s.fontSize);

  return { init, _switchSection, _saveProfile, _onTheme, _onAccent, _onFontSize, _onReducedMotion, _onLang, _onSound, _requestPush, _exportData, _clearProgress, _deleteAccount, _checkUpdate, _install, _save };
})();
