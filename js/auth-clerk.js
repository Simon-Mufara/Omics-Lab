/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Clerk Auth Overlay
   Wraps the existing OmicsLab.Auth module with Clerk when a
   publishable key is configured. Falls back to localStorage auth
   transparently if Clerk is not configured.

   Public API mirrors OmicsLab.Auth so callers need no changes:
   { init, signIn, signUp, signOut, getUser, isSignedIn, onAuthChange }
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.AuthClerk = (function () {
  'use strict';

  let _clerk       = null;
  let _clerkLoaded = false;
  let _callbacks   = [];
  let _user        = null;

  /* ── Init: inject Clerk SDK if key is configured ────────────── */
  function init() {
    const key = window.OMICSLAB_CONFIG?.clerkPublishableKey;
    if (!key) return; /* No key — existing auth.js handles everything */

    _injectClerkScript(key);
  }

  function _injectClerkScript(publishableKey) {
    if (document.getElementById('clerk-cdn')) return;

    const script = document.createElement('script');
    script.id    = 'clerk-cdn';
    script.src   = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;
    script.async = true;
    script.dataset.clerkPublishableKey = publishableKey;

    script.onload = () => _bootClerk(publishableKey);
    script.onerror = () => console.warn('[OmicsLab AuthClerk] Clerk CDN unavailable — falling back to local auth');

    document.head.appendChild(script);
  }

  async function _bootClerk(publishableKey) {
    try {
      _clerk = new window.Clerk(publishableKey);
      await _clerk.load();
      _clerkLoaded = true;

      /* Sync Clerk user into OmicsLab's user model */
      _syncUser(_clerk.user);

      /* Wire Clerk sign-in modal to existing auth buttons */
      _patchExistingAuthButtons();

      /* Listen for Clerk auth state changes */
      _clerk.addListener(({ user }) => {
        _syncUser(user);
        _callbacks.forEach(cb => cb(_user));
      });

      /* Update nav pill immediately */
      if (OmicsLab.Nav?._initUserPill) OmicsLab.Nav._initUserPill?.();

    } catch (err) {
      console.error('[OmicsLab AuthClerk] Boot error:', err);
    }
  }

  function _syncUser(clerkUser) {
    if (!clerkUser) {
      _user = null;
      return;
    }

    _user = {
      id:        clerkUser.id,
      email:     clerkUser.primaryEmailAddress?.emailAddress || '',
      name:      `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      avatarUrl: clerkUser.imageUrl || '',
      role:      clerkUser.publicMetadata?.role || 'student',
      plan:      clerkUser.publicMetadata?.plan || 'free',
    };

    /* Write to localStorage so rest of app can read it */
    try {
      localStorage.setItem('omicslab_user_profile', JSON.stringify(_user));
      localStorage.setItem('omicslab_auth_token', 'clerk_managed');
    } catch {}

    /* Push to Supabase DB layer if available */
    if (OmicsLab.DB?.isReady) {
      OmicsLab.DB.upsertUser({
        clerk_id:   _user.id,
        email:      _user.email,
        name:       _user.name,
        avatar_url: _user.avatarUrl,
        role:       _user.role,
        plan:       _user.plan,
      });

      /* Sync offline data to cloud */
      OmicsLab.DB.syncOnSignIn(_user.id);
    }

    /* PostHog identify */
    if (OmicsLab.Analytics?.identify) {
      OmicsLab.Analytics.identify(_user.id, {
        email:       _user.email,
        name:        _user.name,
        plan:        _user.plan,
        role:        _user.role,
      });
    }

    /* Send welcome email on first sign-in */
    const welcomeSentKey = `omicslab_welcome_sent_${_user.id}`;
    if (!localStorage.getItem(welcomeSentKey)) {
      localStorage.setItem(welcomeSentKey, '1');
      fetch('/api/send-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type: 'welcome', to: _user.email, data: { name: _user.name } }),
      }).catch(() => {});
    }
  }

  /* Patch existing sign-in/sign-up button click handlers to open Clerk modal */
  function _patchExistingAuthButtons() {
    /* Sign in buttons */
    document.querySelectorAll('[data-action="sign-in"], #nav-sign-in, .sign-in-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        signIn();
      });
    });

    /* Sign up buttons */
    document.querySelectorAll('[data-action="sign-up"], #nav-sign-up, .sign-up-btn, .cta-primary[href*="sign"], .hero-cta').forEach(btn => {
      /* Only patch buttons that trigger auth, not nav links */
      if (btn.dataset.clerkPatched) return;
      btn.dataset.clerkPatched = '1';
      btn.addEventListener('click', (e) => {
        if (btn.href && !btn.href.includes('sign')) return; /* let non-auth links pass through */
        e.preventDefault();
        e.stopPropagation();
        signUp();
      });
    });

    /* Sign out buttons */
    document.querySelectorAll('[data-action="sign-out"], #nav-sign-out, .sign-out-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        signOut();
      });
    });
  }

  /* ── Public API ─────────────────────────────────────────────── */

  function signIn() {
    if (_clerkLoaded && _clerk) {
      _clerk.openSignIn({});
    } else {
      /* Fallback: existing auth modal */
      OmicsLab.Auth?.showModal?.('login');
    }
  }

  function signUp() {
    if (_clerkLoaded && _clerk) {
      _clerk.openSignUp({});
    } else {
      OmicsLab.Auth?.showModal?.('register');
    }
  }

  async function signOut() {
    if (_clerkLoaded && _clerk) {
      await _clerk.signOut();
    }
    _user = null;
    try {
      localStorage.removeItem('omicslab_user_profile');
      localStorage.removeItem('omicslab_auth_token');
    } catch {}
    if (OmicsLab.Analytics?.reset) OmicsLab.Analytics.reset();
    OmicsLab.Auth?.signOut?.();
    _callbacks.forEach(cb => cb(null));
  }

  function getUser() {
    if (_clerkLoaded) return _user;
    /* Fallback to existing auth */
    return OmicsLab.Auth?.getUser?.() || null;
  }

  function isSignedIn() {
    if (_clerkLoaded) return !!_user;
    return OmicsLab.Auth?.isLoggedIn?.() || false;
  }

  function onAuthChange(callback) {
    if (typeof callback === 'function') _callbacks.push(callback);
  }

  /* Get a fresh Clerk JWT for Supabase */
  async function getToken() {
    if (!_clerkLoaded || !_clerk?.session) return null;
    try {
      return await _clerk.session.getToken({ template: 'supabase' });
    } catch { return null; }
  }

  return { init, signIn, signUp, signOut, getUser, isSignedIn, onAuthChange, getToken };

})();
