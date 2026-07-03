/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Clerk Auth Layer
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.AuthClerk = (function () {
  'use strict';

  let _clerk     = null;
  let _ready     = false;
  let _loading   = false;
  let _user      = null;
  let _callbacks = [];

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    const key = window.OMICSLAB_CONFIG?.clerkPublishableKey;
    if (!key) {
      console.warn('[AuthClerk] No publishable key in config — Clerk disabled');
      return;
    }
    console.log('[AuthClerk] Starting with key:', key.slice(0, 20) + '…');
    _loading = true;
    _loadScript(key);
  }

  function _loadScript(publishableKey) {
    /* If the static <script id="clerk-sdk"> tag already exists in HTML */
    const existing = document.getElementById('clerk-sdk');
    if (existing) {
      if (window.Clerk) {
        _boot(publishableKey);
      } else {
        existing.addEventListener('load',  () => _boot(publishableKey));
        existing.addEventListener('error', () => {
          _loading = false;
          console.error('[AuthClerk] Clerk CDN script failed to load');
        });
      }
      return;
    }
    /* Dynamic injection fallback */
    const s = document.createElement('script');
    s.id  = 'clerk-sdk';
    s.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js';
    s.async = true;
    s.onload  = () => _boot(publishableKey);
    s.onerror = () => {
      _loading = false;
      console.error('[AuthClerk] Clerk CDN failed to load — local auth only');
    };
    document.head.appendChild(s);
    console.log('[AuthClerk] Injecting Clerk SDK from CDN…');
  }

  async function _boot(publishableKey) {
    try {
      console.log('[AuthClerk] window.Clerk available, booting…');
      _clerk = new window.Clerk(publishableKey);
      await _clerk.load();
      _ready   = true;
      _loading = false;
      console.log('[AuthClerk] Ready ✓');

      _patchAuthModal();

      if (_clerk.user) _syncUser(_clerk.user);

      _clerk.addListener(({ user }) => {
        _syncUser(user);
        _callbacks.forEach(cb => cb(_user));
      });

    } catch (err) {
      _loading = false;
      console.error('[AuthClerk] Boot failed:', err);
    }
  }

  /* ── Patch auth.js so all existing callers use Clerk ─────────── */
  function _patchAuthModal() {
    if (!OmicsLab.Auth) return;

    OmicsLab.Auth.openModal = function (tab) {
      if (tab === 'account') { _clerk.openUserProfile({}); return; }
      if (tab === 'register') { _clerk.openSignUp({}); } else { _clerk.openSignIn({}); }
    };
    OmicsLab.Auth._showModal = OmicsLab.Auth.openModal;

    OmicsLab.Auth.signOut = async function () {
      if (_clerk) await _clerk.signOut();
      _syncUser(null);
      OmicsLab.Analytics?.reset?.();
      _callbacks.forEach(cb => cb(null));
      OmicsLab.Auth.closeModal?.();
    };
    console.log('[AuthClerk] Auth.openModal patched ✓');
  }

  /* ── Sync Clerk user → localStorage + nav ────────────────────── */
  function _syncUser(clerkUser) {
    if (!clerkUser) {
      _user = null;
      try { localStorage.removeItem('omicslab_user_profile'); localStorage.removeItem('omicslab_auth_token'); } catch {}
      _updateNav(null);
      return;
    }
    _user = {
      id:        clerkUser.id,
      email:     clerkUser.primaryEmailAddress?.emailAddress || '',
      name:      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'OmicsLab User',
      avatarUrl: clerkUser.imageUrl || '',
      role:      clerkUser.publicMetadata?.role || 'student',
      plan:      clerkUser.publicMetadata?.plan || 'free',
    };
    try {
      localStorage.setItem('omicslab_user_profile', JSON.stringify(_user));
      localStorage.setItem('omicslab_auth_token', 'clerk_managed');
    } catch {}
    _updateNav(_user);
    if (OmicsLab.DB?.isReady) {
      OmicsLab.DB.upsertUser({ clerk_id: _user.id, email: _user.email, name: _user.name, avatar_url: _user.avatarUrl, role: _user.role, plan: _user.plan });
      OmicsLab.DB.syncOnSignIn(_user.id);
    }
    OmicsLab.Analytics?.identify?.(_user.id, { email: _user.email, name: _user.name, plan: _user.plan });
    const sentKey = `omicslab_welcome_sent_${_user.id}`;
    if (!localStorage.getItem(sentKey) && _user.email) {
      localStorage.setItem(sentKey, '1');
      fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'welcome', to: _user.email, data: { name: _user.name } }) }).catch(() => {});
    }
  }

  /* ── Nav pill update ─────────────────────────────────────────── */
  function _updateNav(user) {
    const pill      = document.getElementById('nav-user-pill');
    const avatar    = document.getElementById('nav-user-avatar');
    const nameEl    = document.getElementById('nav-user-name');
    const signinBtn = document.getElementById('nav-signin-btn');
    if (user) {
      if (signinBtn) signinBtn.style.display = 'none';
      if (pill) { pill.style.display = ''; pill.setAttribute('aria-label', `${user.name} — Account settings`); }
      if (avatar) {
        if (user.avatarUrl) { avatar.innerHTML = `<img src="${user.avatarUrl}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`; }
        else { avatar.textContent = user.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
      }
      if (nameEl) { const p = user.name.trim().split(/\s+/); nameEl.textContent = p[0] + (p[1] ? ' '+p[1][0]+'.' : ''); }
    } else {
      if (pill)      pill.style.display = 'none';
      if (signinBtn) signinBtn.style.display = '';
      if (avatar)    avatar.textContent = '';
      if (nameEl)    nameEl.textContent  = '';
    }
  }

  /* ── Public API ─────────────────────────────────────────────── */

  /* signIn waits up to 6s for Clerk to load before giving up */
  function signIn() {
    if (_ready) { _clerk.openSignIn({}); return; }
    if (!_loading) { OmicsLab.Auth?.openModal?.('signin'); return; }
    console.log('[AuthClerk] Waiting for Clerk to load…');
    let waited = 0;
    const poll = setInterval(() => {
      waited += 200;
      if (_ready) { clearInterval(poll); _clerk.openSignIn({}); }
      else if (!_loading || waited >= 6000) { clearInterval(poll); OmicsLab.Auth?.openModal?.('signin'); }
    }, 200);
  }

  function signUp() {
    if (_ready) { _clerk.openSignUp({}); return; }
    if (!_loading) { OmicsLab.Auth?.openModal?.('register'); return; }
    let waited = 0;
    const poll = setInterval(() => {
      waited += 200;
      if (_ready) { clearInterval(poll); _clerk.openSignUp({}); }
      else if (!_loading || waited >= 6000) { clearInterval(poll); OmicsLab.Auth?.openModal?.('register'); }
    }, 200);
  }

  async function signOut() {
    if (_ready && _clerk) await _clerk.signOut();
    _syncUser(null);
    OmicsLab.Analytics?.reset?.();
    _callbacks.forEach(cb => cb(null));
  }

  function getUser()    { return _user; }
  function isSignedIn() { return _ready && !!_user; }
  function onAuthChange(cb) { if (typeof cb === 'function') _callbacks.push(cb); }
  async function getToken() {
    if (!_ready || !_clerk?.session) return null;
    try { return await _clerk.session.getToken({ template: 'supabase' }); } catch { return null; }
  }

  return { init, signIn, signUp, signOut, getUser, isSignedIn, onAuthChange, getToken };
})();
