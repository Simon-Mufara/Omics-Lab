/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Clerk Auth Layer
   When Clerk is configured:
     • Overrides OmicsLab.Auth.openModal → opens Clerk modal
     • Shows Google / GitHub / LinkedIn in Clerk's UI
     • Updates nav pill after sign-in / sign-out
   When Clerk is NOT configured:
     • Does nothing — existing auth.js handles everything
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.AuthClerk = (function () {
  'use strict';

  let _clerk    = null;
  let _ready    = false;
  let _user     = null;
  let _callbacks = [];

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    const key = window.OMICSLAB_CONFIG?.clerkPublishableKey;
    if (!key) return;
    _injectClerkScript(key);
  }

  function _injectClerkScript(publishableKey) {
    if (document.getElementById('clerk-cdn')) return;
    const script = document.createElement('script');
    script.id    = 'clerk-cdn';
    script.src   = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js';
    script.async = true;
    script.dataset.clerkPublishableKey = publishableKey;
    script.onload  = () => _bootClerk(publishableKey);
    script.onerror = () => console.warn('[AuthClerk] CDN unavailable — local auth active');
    document.head.appendChild(script);
  }

  async function _bootClerk(publishableKey) {
    try {
      _clerk = new window.Clerk(publishableKey);
      await _clerk.load();
      _ready = true;

      /* Override the old auth modal so all existing callers use Clerk */
      _patchAuthModal();

      /* Sync current session (page reload while logged in) */
      if (_clerk.user) _syncUser(_clerk.user);

      /* Listen for auth state changes */
      _clerk.addListener(({ user }) => {
        _syncUser(user);
        _callbacks.forEach(cb => cb(_user));
      });

    } catch (err) {
      console.error('[AuthClerk] Boot failed:', err);
    }
  }

  /* ── Override OmicsLab.Auth.openModal and signOut with Clerk ─── */
  function _patchAuthModal() {
    if (!OmicsLab.Auth) return;

    OmicsLab.Auth.openModal = function (tab) {
      if (tab === 'account') {
        /* Clerk's own profile UI — shows connected accounts, sessions, etc. */
        _clerk.openUserProfile({});
        return;
      }
      if (tab === 'register') {
        _clerk.openSignUp({});
      } else {
        _clerk.openSignIn({});
      }
    };

    /* Keep internal _showModal in sync */
    OmicsLab.Auth._showModal = OmicsLab.Auth.openModal;

    /* Patch signOut so the account modal "Sign out" button hits Clerk */
    OmicsLab.Auth.signOut = async function () {
      if (_ready && _clerk) await _clerk.signOut();
      _syncUser(null);
      if (OmicsLab.Analytics?.reset) OmicsLab.Analytics.reset();
      _callbacks.forEach(cb => cb(null));
      OmicsLab.Auth.closeModal?.();
    };
  }

  /* ── Sync Clerk user into OmicsLab state ─────────────────────── */
  function _syncUser(clerkUser) {
    if (!clerkUser) {
      _user = null;
      try {
        localStorage.removeItem('omicslab_user_profile');
        localStorage.removeItem('omicslab_auth_token');
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

    /* Push to Supabase */
    if (OmicsLab.DB?.isReady) {
      OmicsLab.DB.upsertUser({
        clerk_id:   _user.id,
        email:      _user.email,
        name:       _user.name,
        avatar_url: _user.avatarUrl,
        role:       _user.role,
        plan:       _user.plan,
      });
      OmicsLab.DB.syncOnSignIn(_user.id);
    }

    /* Identify in PostHog */
    if (OmicsLab.Analytics?.identify) {
      OmicsLab.Analytics.identify(_user.id, {
        email: _user.email,
        name:  _user.name,
        plan:  _user.plan,
        role:  _user.role,
      });
    }

    /* Welcome email — once per user */
    const sentKey = `omicslab_welcome_sent_${_user.id}`;
    if (!localStorage.getItem(sentKey) && _user.email) {
      localStorage.setItem(sentKey, '1');
      fetch('/api/send-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type: 'welcome',
          to:   _user.email,
          data: { name: _user.name },
        }),
      }).catch(() => {});
    }
  }

  /* ── Update nav pill directly (auth.js _user stays null) ─────── */
  function _updateNav(user) {
    const pill      = document.getElementById('nav-user-pill');
    const avatar    = document.getElementById('nav-user-avatar');
    const nameEl    = document.getElementById('nav-user-name');
    const signinBtn = document.getElementById('nav-signin-btn');

    if (user) {
      if (signinBtn) signinBtn.style.display = 'none';
      if (pill) {
        pill.style.display = '';
        pill.setAttribute('aria-label', `${user.name} — Account settings`);
      }
      if (avatar) {
        if (user.avatarUrl) {
          avatar.innerHTML = `<img src="${user.avatarUrl}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
        } else {
          const initials = user.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
          avatar.textContent = initials;
        }
      }
      if (nameEl) {
        const parts = user.name.trim().split(/\s+/);
        nameEl.textContent = parts[0] + (parts[1] ? ' ' + parts[1][0] + '.' : '');
      }
    } else {
      if (pill)      pill.style.display = 'none';
      if (signinBtn) signinBtn.style.display = '';
      if (avatar)    avatar.textContent = '';
      if (nameEl)    nameEl.textContent  = '';
    }
  }

  /* ── Public API ─────────────────────────────────────────────── */
  function signIn()  { _ready ? _clerk.openSignIn({})  : OmicsLab.Auth?.openModal?.('signin');   }
  function signUp()  { _ready ? _clerk.openSignUp({})  : OmicsLab.Auth?.openModal?.('register'); }

  async function signOut() {
    if (_ready && _clerk) await _clerk.signOut();
    _syncUser(null);
    if (OmicsLab.Analytics?.reset) OmicsLab.Analytics.reset();
    _callbacks.forEach(cb => cb(null));
  }

  function getUser()    { return _ready ? _user : null; }
  function isSignedIn() { return _ready ? !!_user : false; }
  function onAuthChange(cb) { if (typeof cb === 'function') _callbacks.push(cb); }

  async function getToken() {
    if (!_ready || !_clerk?.session) return null;
    try { return await _clerk.session.getToken({ template: 'supabase' }); }
    catch { return null; }
  }

  return { init, signIn, signUp, signOut, getUser, isSignedIn, onAuthChange, getToken };

})();
