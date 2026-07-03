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

  /* OmicsLab dark theme for Clerk modals — variables only (most stable API) */
  const _appearance = {
    variables: {
      colorBackground:      '#0d1117',
      colorText:            '#c9d1d9',
      colorTextSecondary:   '#8b949e',
      colorPrimary:         '#3fb950',
      colorDanger:          '#f85149',
      colorInputBackground: '#161b22',
      colorInputText:       '#c9d1d9',
      borderRadius:         '10px',
      fontFamily:           'inherit',
    },
  };

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
    const existing = document.getElementById('clerk-sdk');
    if (existing) {
      /* Static tag already in HTML — script may have already fired its load event.
         Poll for window.Clerk rather than relying on the event. */
      _pollForClerk(publishableKey);
      return;
    }
    /* Dynamic injection fallback (no static tag) */
    const s = document.createElement('script');
    s.id  = 'clerk-sdk';
    s.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js';
    s.dataset.clerkPublishableKey = publishableKey;
    s.async = true;
    s.onload  = () => _pollForClerk(publishableKey);
    s.onerror = () => { _loading = false; console.error('[AuthClerk] CDN failed'); };
    document.head.appendChild(s);
    console.log('[AuthClerk] Injecting Clerk SDK from CDN…');
  }

  function _pollForClerk(publishableKey) {
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (window.Clerk) {
        clearInterval(poll);
        _boot(publishableKey);
      } else if (attempts > 50) {   // 10 s timeout
        clearInterval(poll);
        _loading = false;
        console.error('[AuthClerk] Timed out waiting for window.Clerk');
      }
    }, 200);
  }

  async function _boot(publishableKey) {
    try {
      const C = window.Clerk;
      console.log('[AuthClerk] window.Clerk type:', typeof C, !!C);
      /* Clerk v5 CDN: with data-clerk-publishable-key the script pre-initializes
         an instance and exposes it as window.Clerk (has .load / .addListener).
         Without the key attr it exports the class constructor (typeof === 'function'). */
      if (typeof C === 'function') {
        _clerk = new C(publishableKey);
      } else if (C && typeof C.load === 'function') {
        _clerk = C;   // already an initialized instance
      } else {
        throw new Error('Unexpected window.Clerk: ' + typeof C);
      }
      await _clerk.load();
      _ready   = true;
      _loading = false;
      console.log('[AuthClerk] Ready ✓');

      _patchAuthModal();

      /* Sync immediately — this also clears any stale local auth.js session
         when Clerk reports no user, so the Sign In button appears right away */
      _syncUser(_clerk.user || null);

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

    const _originalOpenModal = OmicsLab.Auth.openModal?.bind?.(OmicsLab.Auth);

    OmicsLab.Auth.openModal = function (tab) {
      if (tab === 'account') {
        if (_clerk.user) {
          _clerk.openUserProfile({ appearance: _appearance });
        } else {
          _originalOpenModal?.('account');
        }
        return;
      }
      if (tab === 'register') {
        _clerk.openSignUp({ appearance: _appearance });
      } else {
        _clerk.openSignIn({ appearance: _appearance });
      }
    };

    const _originalSignOut = OmicsLab.Auth.signOut?.bind?.(OmicsLab.Auth);
    OmicsLab.Auth.signOut = async function () {
      /* Sign out of Clerk (no-op if no Clerk session) */
      if (_clerk) await _clerk.signOut().catch(() => {});
      /* Also clear auth.js local session so it doesn't restore on reload */
      _originalSignOut?.();
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
      try {
        localStorage.removeItem('omicslab_user_profile');
        localStorage.removeItem('omicslab_auth_token');
        localStorage.removeItem('omicslab_session_v2'); /* clear local auth.js session so it doesn't resurrect on reload */
      } catch {}
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

    /* First-time sign-in → take user straight to the Guide */
    const isNewUser = !localStorage.getItem(`omicslab_guide_seen_${_user.id}`);
    if (isNewUser) {
      localStorage.setItem(`omicslab_guide_seen_${_user.id}`, '1');
      setTimeout(() => {
        if (OmicsLab.Router?.navigate) OmicsLab.Router.navigate('guide');
      }, 600);
    }

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

  /* ── Nav pill + mobile auth update ──────────────────────────── */
  function _updateNav(user) {
    /* Desktop nav */
    const pill      = document.getElementById('nav-user-pill');
    const avatar    = document.getElementById('nav-user-avatar');
    const nameEl    = document.getElementById('nav-user-name');
    const signinBtn = document.getElementById('nav-signin-btn');
    /* Mobile overlay */
    const mobSignin  = document.getElementById('mob-auth-signin');
    const mobAccount = document.getElementById('mob-auth-account');
    const mobSignout = document.getElementById('mob-auth-signout');
    const mobName    = document.getElementById('mob-auth-username');

    if (user) {
      if (signinBtn) signinBtn.style.display = 'none';
      if (pill) { pill.style.display = ''; pill.setAttribute('aria-label', `${user.name} — Account settings`); }
      if (avatar) {
        if (user.avatarUrl) { avatar.innerHTML = `<img src="${user.avatarUrl}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`; }
        else { avatar.textContent = user.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
      }
      if (nameEl) { const p = user.name.trim().split(/\s+/); nameEl.textContent = p[0] + (p[1] ? ' '+p[1][0]+'.' : ''); }
      /* Mobile */
      if (mobSignin)  mobSignin.style.display  = 'none';
      if (mobAccount) mobAccount.style.display = '';
      if (mobSignout) mobSignout.style.display = '';
      if (mobName)    mobName.textContent = user.name.trim().split(/\s+/)[0] + '’s Account';
    } else {
      if (pill)      pill.style.display = 'none';
      if (signinBtn) signinBtn.style.display = '';
      if (avatar)    avatar.textContent = '';
      if (nameEl)    nameEl.textContent  = '';
      /* Mobile */
      if (mobSignin)  mobSignin.style.display  = '';
      if (mobAccount) mobAccount.style.display = 'none';
      if (mobSignout) mobSignout.style.display = 'none';
    }
  }

  /* ── Public API ─────────────────────────────────────────────── */

  /* signIn waits up to 6s for Clerk to load before giving up */
  function signIn() {
    if (_ready) { _clerk.openSignIn({ appearance: _appearance }); return; }
    if (!_loading) { OmicsLab.Auth?.openModal?.('signin'); return; }
    console.log('[AuthClerk] Waiting for Clerk to load…');
    let waited = 0;
    const poll = setInterval(() => {
      waited += 200;
      if (_ready) { clearInterval(poll); _clerk.openSignIn({ appearance: _appearance }); }
      else if (!_loading || waited >= 6000) { clearInterval(poll); OmicsLab.Auth?.openModal?.('signin'); }
    }, 200);
  }

  function signUp() {
    if (_ready) { _clerk.openSignUp({ appearance: _appearance }); return; }
    if (!_loading) { OmicsLab.Auth?.openModal?.('register'); return; }
    let waited = 0;
    const poll = setInterval(() => {
      waited += 200;
      if (_ready) { clearInterval(poll); _clerk.openSignUp({ appearance: _appearance }); }
      else if (!_loading || waited >= 6000) { clearInterval(poll); OmicsLab.Auth?.openModal?.('register'); }
    }, 200);
  }

  async function signOut() {
    if (_ready && _clerk) await _clerk.signOut();
    _syncUser(null);
    OmicsLab.Analytics?.reset?.();
    _callbacks.forEach(cb => cb(null));
  }

  function openAccount() {
    if (!_ready) { signIn(); return; }
    if (_clerk.user) _clerk.openUserProfile({ appearance: _appearance });
    else _clerk.openSignIn({ appearance: _appearance });
  }

  function getUser()    { return _user; }
  function isSignedIn() { return _ready && !!_user; }
  function onAuthChange(cb) { if (typeof cb === 'function') _callbacks.push(cb); }
  async function getToken() {
    if (!_ready || !_clerk?.session) return null;
    try { return await _clerk.session.getToken({ template: 'supabase' }); } catch { return null; }
  }

  return { init, signIn, signUp, signOut, openAccount, getUser, isSignedIn, onAuthChange, getToken };
})();
