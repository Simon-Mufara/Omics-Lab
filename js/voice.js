/* OmicsLab Voice — Web Speech API TTS for African languages
   Speaker icon appears next to step titles only when a matching voice exists.
   Currently activated for isiZulu (zu) and isiXhosa (xh). */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Voice = (function () {

  /* Languages with TTS support (BCP-47 tags tried in order) */
  const TTS_LANGS = {
    zu: ['zu-ZA', 'zu'],
    xh: ['xh-ZA', 'xh'],
  };

  let _current = 'en';   // active language code
  let _voice = null;     // matched SpeechSynthesisVoice or null
  let _speaking = false;

  /* ─── Find a matching voice for a lang code ─── */
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

  /* ─── Try to resolve voice; voices may load asynchronously ─── */
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

  /* ─── Inject / remove the speaker icon next to #step-title ─── */
  function _updateSpeakerIcon() {
    const titleEl = document.getElementById('step-title');
    if (!titleEl) return;

    let btn = document.getElementById('voice-speak-btn');

    if (!_voice) {
      if (btn) btn.remove();
      return;
    }

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

  /* ─── Speak text using the matched voice ─── */
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

  /* ─── Called by i18n.js whenever language changes ─── */
  function onLangChange(code) {
    if (_speaking) speechSynthesis.cancel();
    _current = code;
    _voice = null;
    if (TTS_LANGS[code]) {
      _resolveVoice(code);
    } else {
      _updateSpeakerIcon(); // removes icon for non-TTS languages
    }
  }

  /* ─── Read a step title aloud when a step loads (called by bench.js) ─── */
  function announceStep(text) {
    if (!_voice || !text) return;
    speak(text);
  }

  return { speak, announceStep, onLangChange };
})();
