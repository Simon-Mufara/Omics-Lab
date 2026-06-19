/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Voice-to-Text Compose (Prompt 19)
   ─ Mic button in Nexus + Teams chat composers
   ─ Web Speech API: live transcript in textarea
   ─ Auto-finalise after 1.5s silence
   ─ Follows OmicsLab.i18n locale
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.VoiceCompose = (function () {

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  let _recognition = null;
  let _active      = false;
  let _silenceTimer = null;
  let _targetInput = null;   /* the textarea being dictated to */
  let _activeBtnId = null;

  /* ─── Build recognition instance ─── */
  function _buildRecognition(lang) {
    if (!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.continuous      = true;
    r.interimResults  = true;
    r.lang            = lang || _getLang();
    r.maxAlternatives = 1;

    r.onstart = () => {
      _active = true;
      _setBtnState(true);
      OmicsLab.Notify?.info('Listening… speak now', { ttl: 2000 });
    };

    r.onresult = e => {
      let interim = ''; let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (_targetInput) {
        /* Append final text, show interim in brackets */
        const cur = _targetInput.dataset.voiceBase || '';
        if (final) {
          const appended = (cur + (cur ? ' ' : '') + final).trim();
          _targetInput.value = appended;
          _targetInput.dataset.voiceBase = appended;
        }
        if (interim) {
          _targetInput.value = (_targetInput.dataset.voiceBase || '') + ' [' + interim.trim() + ']';
        }
        _targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      /* Reset silence timer */
      clearTimeout(_silenceTimer);
      if (final) {
        _silenceTimer = setTimeout(() => _stop(), 1500);
      }
    };

    r.onerror = e => {
      if (e.error === 'not-allowed') {
        OmicsLab.Notify?.error('Microphone permission denied');
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        OmicsLab.Notify?.warning('Voice recognition error: ' + e.error);
      }
      _cleanup();
    };

    r.onend = () => _cleanup();

    return r;
  }

  function _getLang() {
    try {
      const stored = localStorage.getItem('omicslab_lang') || navigator.language || 'en-US';
      /* Normalise common codes */
      const map = { en: 'en-US', sw: 'sw-KE', fr: 'fr-FR', ar: 'ar-SA', zu: 'zu-ZA', yo: 'yo-NG', am: 'am-ET' };
      return map[stored.slice(0,2)] || stored;
    } catch { return 'en-US'; }
  }

  /* ─── Start ─── */
  function start(inputId, btnId) {
    if (!SpeechRecognition) {
      OmicsLab.Notify?.warning('Voice input is not supported in this browser (try Chrome or Edge)');
      return;
    }

    if (_active) { _stop(); return; }

    const input = document.getElementById(inputId);
    if (!input) return;

    _targetInput = input;
    _activeBtnId = btnId;
    _targetInput.dataset.voiceBase = _targetInput.value;

    _recognition = _buildRecognition();
    if (!_recognition) return;

    try {
      _recognition.start();
    } catch (e) {
      OmicsLab.Notify?.error('Could not start microphone: ' + e.message);
    }
  }

  /* ─── Stop ─── */
  function _stop() {
    clearTimeout(_silenceTimer);
    if (_recognition) {
      try { _recognition.stop(); } catch {}
    }
    _cleanup();
  }

  function _cleanup() {
    _active = false;
    _setBtnState(false);
    if (_targetInput) {
      /* Clean up interim brackets */
      _targetInput.value = _targetInput.dataset.voiceBase || _targetInput.value.replace(/\s*\[.*?\]$/, '');
      delete _targetInput.dataset.voiceBase;
      _targetInput = null;
    }
    _activeBtnId = null;
    _recognition = null;
  }

  function _setBtnState(active) {
    if (!_activeBtnId) return;
    const btn = document.getElementById(_activeBtnId);
    if (!btn) return;
    btn.classList.toggle('voice-active', active);
    btn.setAttribute('aria-pressed', active.toString());
    btn.title = active ? 'Stop recording' : 'Dictate message (voice-to-text)';
    btn.setAttribute('aria-label', btn.title);
    /* Pulse animation */
    btn.innerHTML = active ? _stopIcon() : _micIcon();
  }

  /* ─── Inject mic button into a composer ─── */
  function _injectButton(actionsEl, inputId, btnId) {
    if (document.getElementById(btnId)) return;
    if (!SpeechRecognition) return; /* Don't show button if unsupported */

    const btn = document.createElement('button');
    btn.id = btnId;
    btn.type = 'button';
    btn.className = 'nx-msg-action voice-compose-btn';
    btn.innerHTML = _micIcon();
    btn.title = 'Dictate message (voice-to-text)';
    btn.setAttribute('aria-label', 'Dictate message');
    btn.setAttribute('aria-pressed', 'false');
    btn.onclick = () => start(inputId, btnId);

    /* Insert before send button */
    const sendBtn = actionsEl.querySelector('.nx-send-btn');
    if (sendBtn) actionsEl.insertBefore(btn, sendBtn);
    else actionsEl.appendChild(btn);
  }

  function _micIcon() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
  }

  function _stopIcon() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="#ff6b6b" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;
  }

  /* ─── Auto-inject into Nexus + Teams on DOM change ─── */
  function _watchComposers() {
    const obs = new MutationObserver(() => {
      /* Nexus main composer */
      const nxActions = document.querySelector('.nx-composer-actions');
      if (nxActions && !document.getElementById('voice-nx-btn')) {
        _injectButton(nxActions, 'nx-composer-input', 'voice-nx-btn');
      }
      /* Nexus thread composer */
      const nxThread = document.querySelector('.nx-thread-composer');
      if (nxThread) {
        const threadActions = nxThread.querySelector('button');
        if (threadActions && !document.getElementById('voice-nx-thread-btn')) {
          const wrap = document.createElement('div');
          wrap.style.display = 'contents';
          nxThread.insertBefore(wrap, threadActions);
          _injectButton(nxThread, 'nx-thread-input', 'voice-nx-thread-btn');
        }
      }
      /* Teams chat */
      const teamsActions = document.querySelector('.teams-chat-actions, .teams-composer-actions');
      if (teamsActions && !document.getElementById('voice-teams-btn')) {
        const inputEl = document.querySelector('.teams-chat-input, #teams-chat-input');
        if (inputEl) {
          if (!inputEl.id) inputEl.id = 'teams-chat-input';
          _injectButton(teamsActions, inputEl.id, 'voice-teams-btn');
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function _injectStyles() {
    if (document.getElementById('voice-compose-styles')) return;
    const s = document.createElement('style');
    s.id = 'voice-compose-styles';
    s.textContent = `
      .voice-compose-btn{transition:color .15s}
      .voice-compose-btn.voice-active{color:var(--red,#ff6b6b) !important;animation:voice-pulse .8s ease-in-out infinite}
      @keyframes voice-pulse{0%,100%{opacity:1}50%{opacity:.4}}
    `;
    document.head.appendChild(s);
  }

  /* ─── Init ─── */
  function init() {
    if (!SpeechRecognition) return; /* graceful degradation */
    _injectStyles();
    _watchComposers();
  }

  return { init, start, stop: _stop };
})();
