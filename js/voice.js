/* ═══════════════════════════════════════════════════════════════
   OmicsLab Voice — Part 1: TTS for African languages
                    Part 2: Speech-to-Command navigation (Prompt 8)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

/* ─────────────────────────────────────────────────────────────
   PART 1 — Text-to-Speech (existing, unchanged)
   ───────────────────────────────────────────────────────────── */
OmicsLab.Voice = (function () {

  const TTS_LANGS = {
    zu: ['zu-ZA', 'zu'],
    xh: ['xh-ZA', 'xh'],
  };

  let _current = 'en';
  let _voice = null;
  let _speaking = false;

  function _findVoice(code) {
    if (!window.speechSynthesis) return null;
    const tags = TTS_LANGS[code];
    if (!tags) return null;
    const voices = speechSynthesis.getVoices();
    for (const tag of tags) {
      const match = voices.find(v => v.lang.toLowerCase().startsWith(tag.toLowerCase()));
      if (match) return match;
    }
    return null;
  }

  function _resolveVoice(code) {
    _voice = _findVoice(code);
    if (!_voice && window.speechSynthesis) {
      speechSynthesis.onvoiceschanged = () => {
        _voice = _findVoice(code);
        _updateSpeakerIcon();
        speechSynthesis.onvoiceschanged = null;
      };
    }
    _updateSpeakerIcon();
  }

  function _updateSpeakerIcon() {
    const titleEl = document.getElementById('step-title');
    if (!titleEl) return;
    let btn = document.getElementById('voice-speak-btn');
    if (!_voice) { if (btn) btn.remove(); return; }
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'voice-speak-btn';
      btn.className = 'voice-speak-btn';
      btn.setAttribute('aria-label', 'Read step aloud');
      btn.title = 'Read step aloud';
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
      btn.onclick = () => speak(titleEl.textContent);
      titleEl.parentElement.insertBefore(btn, titleEl.nextSibling);
    }
  }

  function speak(text) {
    if (!_voice || !text || !window.speechSynthesis) return;
    if (_speaking) speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.trim());
    utt.voice = _voice;
    utt.lang  = _voice.lang;
    utt.rate  = 0.9;
    utt.onstart = () => { _speaking = true; };
    utt.onend   = () => { _speaking = false; };
    utt.onerror = () => { _speaking = false; };
    speechSynthesis.speak(utt);
  }

  function onLangChange(code) {
    if (_speaking) speechSynthesis.cancel();
    _current = code;
    _voice = null;
    if (TTS_LANGS[code]) {
      _resolveVoice(code);
    } else {
      _updateSpeakerIcon();
    }
  }

  function announceStep(text) {
    if (!_voice || !text) return;
    speak(text);
  }

  return { speak, announceStep, onLangChange };
})();


/* ─────────────────────────────────────────────────────────────
   PART 2 — Voice Command Control (Prompt 8)
   Uses Web Speech API SpeechRecognition for STT.
   Maps spoken phrases → OmicsLab.Router.navigate() or actions.
   ───────────────────────────────────────────────────────────── */
OmicsLab.VoiceControl = (function () {

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SpeechRecognition;

  let _recognition = null;
  let _listening = false;
  let _toastTimer = null;
  let _helpOpen = false;

  /* ─── Command map: phrase fragments → action ─── */
  const COMMANDS = [
    { phrases: ['home', 'go home', 'back home', 'main menu', 'start'],           action: () => _nav('home') },
    { phrases: ['lab', 'go to lab', 'open lab', 'simulation', 'experiment'],     action: () => _nav('lab') },
    { phrases: ['learn', 'learning', 'curriculum', 'disease explorer', 'tool explorer'], action: () => _nav('learn') },
    { phrases: ['research', 'research mode', 'study'],                            action: () => _nav('research') },
    { phrases: ['africa', 'africa hub', 'genomics map', 'africa science'],        action: () => _nav('africa') },
    { phrases: ['analysis', 'analysis studio', 'fastq', 'vcf'],                   action: () => _nav('analysis') },
    { phrases: ['terminal', 'pipeline terminal', 'command line'],                  action: () => _nav('terminal') },
    { phrases: ['ask', 'question', 'q and a', 'q&a'],                             action: () => _nav('ask') },
    { phrases: ['mentor', 'ai mentor', 'expert'],                                  action: () => _nav('mentor') },
    { phrases: ['outbreak', 'outbreak simulator', 'epidemic'],                     action: () => _nav('outbreak') },
    { phrases: ['datasets', 'data browser', 'dataset browser', 'sra', 'ena'],     action: () => _nav('datasets') },
    { phrases: ['career', 'career pathfinder', 'career quiz', 'job'],             action: () => _nav('career') },
    { phrases: ['protocols', 'protocol sharing', 'community protocol'],            action: () => _nav('protocols') },
    { phrases: ['collaborate', 'collaboration', 'collab', 'live session', 'webrtc'], action: () => _nav('collab') },
    { phrases: ['grant', 'grant generator', 'grant writing', 'funding', 'application'], action: () => _nav('grant') },
    { phrases: ['leaderboard', 'rankings', 'rank', 'scores', 'competition', 'cohort map'], action: () => _nav('leaderboard') },
    { phrases: ['search', 'find', 'look up'],                                     action: (t) => _openSearch(t) },
    { phrases: ['help', 'what can i say', 'commands', 'voice commands'],          action: () => _toggleHelp() },
    { phrases: ['stop listening', 'stop', 'cancel', 'quiet', 'off'],              action: () => stop() },
    { phrases: ['scroll down', 'page down'],                                      action: () => window.scrollBy({top:400,behavior:'smooth'}) },
    { phrases: ['scroll up', 'page up', 'top'],                                   action: () => window.scrollTo({top:0,behavior:'smooth'}) },
    { phrases: ['profile', 'my profile', 'my progress'],                          action: () => _nav('profile') },
  ];

  function _nav(page) {
    if (OmicsLab.Router) OmicsLab.Router.navigate(page);
    _toast('Navigating to ' + page);
  }

  function _openSearch(transcript) {
    const query = transcript.replace(/^(search|find|look up)\s*/i, '').trim();
    if (OmicsLab.Search) OmicsLab.Search.open();
    if (query) {
      setTimeout(() => {
        const input = document.getElementById('search-input');
        if (input) { input.value = query; input.dispatchEvent(new Event('input')); }
      }, 300);
    }
    _toast(query ? 'Searching for: ' + query : 'Opening search');
  }

  /* ─── Match transcript to a command ─── */
  function _match(transcript) {
    const t = transcript.toLowerCase().trim();
    for (const cmd of COMMANDS) {
      for (const phrase of cmd.phrases) {
        if (t === phrase || t.includes(phrase)) {
          return { cmd, transcript: t };
        }
      }
    }
    return null;
  }

  /* ─── Toast notification ─── */
  function _toast(msg, isError) {
    clearTimeout(_toastTimer);
    let el = document.getElementById('vc-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'vc-toast';
      el.className = 'vc-toast';
      document.body.appendChild(el);
    }
    el.className = 'vc-toast' + (isError ? ' vc-toast-error' : '');
    el.innerHTML = `<span class="vc-toast-icon">${isError ? '⚠️' : '🎤'}</span><span>${msg}</span>`;
    el.classList.add('visible');
    _toastTimer = setTimeout(() => el.classList.remove('visible'), 3200);
  }

  /* ─── Update mic button state ─── */
  function _updateMicBtn() {
    const btn = document.getElementById('vc-mic-btn');
    if (!btn) return;
    btn.classList.toggle('listening', _listening);
    btn.setAttribute('aria-pressed', _listening ? 'true' : 'false');
    btn.title = _listening ? 'Voice control: listening… (click to stop)' : 'Voice control (click to start)';
  }

  /* ─── Inject mic button into nav ─── */
  function _injectMicBtn() {
    if (document.getElementById('vc-mic-btn')) return;
    const navRight = document.getElementById('nav-right');
    if (!navRight) return;

    const btn = document.createElement('button');
    btn.id = 'vc-mic-btn';
    btn.className = 'vc-mic-btn';
    btn.setAttribute('aria-label', 'Voice control');
    btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Voice control (click to start)';
    btn.innerHTML = `
      <svg class="vc-mic-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="8" y1="22" x2="16" y2="22"/>
      </svg>
      <span class="vc-mic-label">Voice</span>
      <span class="vc-mic-ring" aria-hidden="true"></span>`;

    btn.onclick = () => _listening ? stop() : start();

    const searchBtn = navRight.querySelector('.nav-search-btn');
    if (searchBtn) navRight.insertBefore(btn, searchBtn);
    else navRight.prepend(btn);

    /* Keyboard shortcut: Ctrl+Shift+V */
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        _listening ? stop() : start();
      }
    });
  }

  /* ─── Build speech recognition instance ─── */
  function _buildRecognition() {
    const r = new SpeechRecognition();
    r.lang = 'en-US';
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 3;

    /* Show interim transcript in mic btn */
    r.onresult = e => {
      const results = e.results;
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < results.length; i++) {
        const t = results[i][0].transcript;
        if (results[i].isFinal) final += t;
        else interim += t;
      }
      _updateTranscript(interim || final);
      if (final) _processCommand(final);
    };

    r.onerror = e => {
      const msg = e.error === 'no-speech' ? 'No speech detected' :
                  e.error === 'not-allowed' ? 'Microphone access denied' :
                  'Voice error: ' + e.error;
      _toast(msg, true);
      _setListening(false);
    };

    r.onend = () => {
      /* Restart automatically if still in listening mode (continuous simulation) */
      if (_listening) {
        try { _recognition.start(); } catch {}
      }
    };

    return r;
  }

  function _updateTranscript(text) {
    const el = document.getElementById('vc-transcript');
    if (el) el.textContent = text ? '"' + text + '"' : '';
  }

  function _processCommand(transcript) {
    const match = _match(transcript);
    if (match) {
      _updateTranscript('');
      match.cmd.action(match.transcript);
    } else {
      _toast('Command not recognised: "' + transcript + '" — say "help" for a list', true);
    }
  }

  /* ─── Start / stop ─── */
  function start() {
    if (!supported) {
      _toast('Voice control not supported in this browser (use Chrome or Edge)', true);
      return;
    }
    if (_listening) return;
    if (!_recognition) _recognition = _buildRecognition();
    try {
      _recognition.start();
      _setListening(true);
      _toast('Listening… say a command or "help"');
      _injectTranscriptBubble();
    } catch (e) {
      _toast('Could not start microphone: ' + e.message, true);
    }
  }

  function stop() {
    if (!_listening) return;
    _setListening(false);
    if (_recognition) { try { _recognition.stop(); } catch {} }
    _removeTranscriptBubble();
    _toast('Voice control stopped');
  }

  function _setListening(val) {
    _listening = val;
    _updateMicBtn();
  }

  /* ─── Transcript bubble (shows interim text below mic btn) ─── */
  function _injectTranscriptBubble() {
    if (document.getElementById('vc-transcript')) return;
    const el = document.createElement('div');
    el.id = 'vc-transcript';
    el.className = 'vc-transcript';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }

  function _removeTranscriptBubble() {
    const el = document.getElementById('vc-transcript');
    if (el) el.remove();
  }

  /* ─── Help overlay ─── */
  function _toggleHelp() {
    _helpOpen ? _closeHelp() : _openHelp();
  }

  function _openHelp() {
    if (document.getElementById('vc-help-overlay')) { _closeHelp(); return; }
    _helpOpen = true;
    const overlay = document.createElement('div');
    overlay.id = 'vc-help-overlay';
    overlay.className = 'vc-help-overlay';
    overlay.onclick = e => { if (e.target === overlay) _closeHelp(); };

    const GROUPED = [
      { label: 'Navigation', commands: [
        '"go home" / "home"', '"open lab" / "lab"', '"learn" / "curriculum"',
        '"research" / "research mode"', '"africa" / "africa hub"',
        '"analysis" / "analysis studio"', '"terminal"', '"outbreak"',
        '"datasets" / "data browser"', '"career" / "career quiz"',
        '"protocols" / "protocol sharing"', '"collaborate" / "collab"',
        '"mentor" / "ai mentor"', '"ask" / "q and a"', '"profile"',
      ]},
      { label: 'Actions', commands: [
        '"search [query]" — open search with a term',
        '"scroll down" / "scroll up"',
        '"help" / "commands" — show this panel',
        '"stop listening" / "stop"',
      ]},
    ];

    overlay.innerHTML = `
      <div class="vc-help-panel">
        <div class="vc-help-header">
          <div class="vc-help-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            Voice Commands
          </div>
          <div style="display:flex;gap:.6rem;align-items:center">
            <kbd class="vc-kbd">Ctrl+Shift+V</kbd>
            <button class="vc-help-close" onclick="OmicsLab.VoiceControl._closeHelp()">✕</button>
          </div>
        </div>
        <div class="vc-help-desc">Speak any phrase — partial matches work (e.g. "datasets" or "career"). Commands are case-insensitive.</div>
        ${GROUPED.map(g => `
          <div class="vc-help-group">
            <div class="vc-help-group-label">${g.label}</div>
            <div class="vc-help-commands">
              ${g.commands.map(c => `<div class="vc-help-cmd">${c}</div>`).join('')}
            </div>
          </div>`).join('')}
        <div class="vc-help-footer">
          <div class="vc-help-compat">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            Requires Chrome, Edge, or Safari 15+ with microphone permission
          </div>
          <div class="vc-help-btns">
            ${_listening
              ? `<button class="vc-help-action-btn vc-stop-btn" onclick="OmicsLab.VoiceControl.stop();OmicsLab.VoiceControl._closeHelp()">Stop Listening</button>`
              : `<button class="vc-help-action-btn vc-start-btn" onclick="OmicsLab.VoiceControl.start();OmicsLab.VoiceControl._closeHelp()">Start Voice Control</button>`}
          </div>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
  }

  function _closeHelp() {
    _helpOpen = false;
    const el = document.getElementById('vc-help-overlay');
    if (!el) return;
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 220);
  }

  /* ─── Init ─── */
  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      _injectMicBtn();
      _injectStyles();
    });
  }

  /* ─── Inject all voice-control CSS inline (no extra CSS file needed) ─── */
  function _injectStyles() {
    if (document.getElementById('vc-styles')) return;
    const style = document.createElement('style');
    style.id = 'vc-styles';
    style.textContent = `
/* ─── Mic button in nav ─── */
.vc-mic-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  background: transparent;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #8b949e;
  font-size: .75rem;
  font-weight: 500;
  padding: .35rem .65rem;
  cursor: pointer;
  transition: color .2s, border-color .2s, background .2s;
  font-family: inherit;
  overflow: hidden;
}
.vc-mic-btn:hover { color: #e6edf3; border-color: #58a6ff; background: rgba(88,166,255,.06); }
.vc-mic-btn.listening {
  color: #3fb950;
  border-color: #3fb950;
  background: rgba(63,185,80,.08);
}
.vc-mic-label { display: none; }
@media (min-width: 900px) { .vc-mic-label { display: inline; } }

/* Pulsing ring when listening */
.vc-mic-ring {
  position: absolute;
  inset: 0;
  border-radius: 6px;
  opacity: 0;
  pointer-events: none;
}
.vc-mic-btn.listening .vc-mic-ring {
  opacity: 1;
  animation: vc-ring-pulse 1.4s ease-in-out infinite;
  box-shadow: 0 0 0 2px rgba(63,185,80,.4);
}
@keyframes vc-ring-pulse {
  0%,100% { box-shadow: 0 0 0 2px rgba(63,185,80,.4); }
  50%      { box-shadow: 0 0 0 5px rgba(63,185,80,.0); }
}

/* ─── Toast ─── */
.vc-toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #e6edf3;
  font-size: .82rem;
  padding: .6rem 1.1rem;
  display: flex;
  align-items: center;
  gap: .5rem;
  white-space: nowrap;
  max-width: 90vw;
  box-shadow: 0 4px 16px rgba(0,0,0,.5);
  opacity: 0;
  transition: opacity .22s, transform .22s;
  pointer-events: none;
  z-index: 9999;
}
.vc-toast.visible { opacity: 1; transform: translateX(-50%) translateY(0); }
.vc-toast-error { border-color: rgba(255,107,107,.4); color: #ff6b6b; }

/* ─── Transcript bubble ─── */
.vc-transcript {
  position: fixed;
  bottom: 4.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(13,17,23,.92);
  border: 1px solid #3fb950;
  border-radius: 6px;
  color: #3fb950;
  font-size: .8rem;
  font-style: italic;
  padding: .4rem .9rem;
  min-width: 120px;
  text-align: center;
  pointer-events: none;
  z-index: 9998;
  opacity: 0.9;
}
.vc-transcript:empty { display: none; }

/* ─── Help overlay ─── */
.vc-help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  transition: opacity .22s;
}
.vc-help-overlay.visible { opacity: 1; }
.vc-help-panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: 0 8px 40px rgba(0,0,0,.7);
}
.vc-help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .75rem;
  gap: .5rem;
}
.vc-help-title {
  font-size: 1rem;
  font-weight: 700;
  color: #e6edf3;
  display: flex;
  align-items: center;
  gap: .45rem;
}
.vc-help-close {
  background: none;
  border: none;
  color: #6e7681;
  font-size: .9rem;
  cursor: pointer;
  padding: .2rem .4rem;
  border-radius: 4px;
}
.vc-help-close:hover { color: #e6edf3; background: #21262d; }
.vc-help-desc {
  font-size: .78rem;
  color: #8b949e;
  line-height: 1.5;
  margin-bottom: 1rem;
  padding-bottom: .75rem;
  border-bottom: 1px solid #21262d;
}
.vc-help-group { margin-bottom: 1rem; }
.vc-help-group-label {
  font-size: .7rem;
  font-weight: 700;
  color: #58a6ff;
  text-transform: uppercase;
  letter-spacing: .1em;
  margin-bottom: .5rem;
}
.vc-help-commands {
  display: flex;
  flex-direction: column;
  gap: .3rem;
}
.vc-help-cmd {
  font-size: .8rem;
  color: #8b949e;
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 5px;
  padding: .3rem .6rem;
  font-family: 'JetBrains Mono', monospace;
}
.vc-help-footer {
  border-top: 1px solid #21262d;
  padding-top: .75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.vc-help-compat {
  font-size: .72rem;
  color: #6e7681;
  display: flex;
  align-items: center;
  gap: .3rem;
}
.vc-help-btns { display: flex; gap: .5rem; }
.vc-help-action-btn {
  padding: .45rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity .2s;
}
.vc-help-action-btn:hover { opacity: .85; }
.vc-start-btn { background: #238636; color: #fff; }
.vc-stop-btn  { background: #21262d; color: #f97316; border: 1px solid #f97316; }
.vc-kbd {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #8b949e;
  font-size: .68rem;
  padding: .15rem .4rem;
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
}
    `;
    document.head.appendChild(style);
  }

  /* Public API */
  init();
  return { start, stop, _closeHelp, supported };
})();
