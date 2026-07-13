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

  /* OmicsLab dark theme for Clerk modals */
  const _appearance = {
    layout: {
      showOptionalFields: false,
      socialButtonsVariant: 'blockButton',
    },
    variables: {
      colorBackground:      '#0D1524',
      colorText:            '#E4DDD2',
      colorTextSecondary:   '#A8A098',
      colorPrimary:         '#00C4A0',
      colorDanger:          '#f85149',
      colorInputBackground: '#111B2E',
      colorInputText:       '#E4DDD2',
      borderRadius:         '10px',
      fontFamily:           'inherit',
    },
  };

  /* Branded copy for Clerk modals — overrides Clerk's generic English strings */
  const _localization = {
    signIn: {
      start: {
        title:    'Welcome back',
        subtitle: 'Sign in to continue your omics training',
      },
    },
    signUp: {
      start: {
        title:      'Join OmicsLab — it\'s free',
        subtitle:   'Build real genomics skills. No lab. No cost.',
        actionText: 'Already training with us?',
        actionLink: 'Sign in',
      },
    },
  };

  /* ── Init ────────────────────────────────────────────────────── */
  function _showSkeleton() {
    const skel = document.getElementById('nav-auth-skeleton');
    const btn  = document.getElementById('nav-signin-btn');
    if (skel) skel.style.display = '';
    if (btn)  btn.style.display  = 'none';
  }

  function init() {
    const key = window.OMICSLAB_CONFIG?.clerkPublishableKey;
    if (!key) {
      console.warn('[AuthClerk] No publishable key in config — Clerk disabled');
      return;
    }
    console.log('[AuthClerk] Starting with key:', key.slice(0, 20) + '…');
    _loading = true;
    _showSkeleton();
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
      await _clerk.load({ captchaWidgetType: 'invisible' });
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
        _clerk.openSignUp({ appearance: _appearance, localization: _localization });
      } else {
        _clerk.openSignIn({ appearance: _appearance, localization: _localization });
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
      _stopIdleGuard();
      try {
        localStorage.removeItem('omicslab_user_profile');
        localStorage.removeItem('omicslab_auth_token');
        localStorage.removeItem('omicslab_session_v2'); /* clear local auth.js session so it doesn't resurrect on reload */
      } catch {}
      _updateNav(null);
      return;
    }
    /* Clerk keeps linked OAuth providers on the user object regardless
       of which method was used to sign in this session — a GitHub
       username here means GitHub is linked, not necessarily how they
       just authenticated. */
    const githubAccount = clerkUser.externalAccounts?.find(a => a.provider === 'oauth_github');

    _user = {
      id:            clerkUser.id,
      email:         clerkUser.primaryEmailAddress?.emailAddress || '',
      name:          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'OmicsLab User',
      avatarUrl:     clerkUser.imageUrl || '',
      role:          clerkUser.publicMetadata?.role || 'student',
      plan:          clerkUser.publicMetadata?.plan || 'free',
      githubUsername: githubAccount?.username || null,
    };
    try {
      localStorage.setItem('omicslab_user_profile', JSON.stringify(_user));
      localStorage.setItem('omicslab_auth_token', 'clerk_managed');
    } catch {}
    _updateNav(_user);
    _startIdleGuard();

    /* First-time sign-in → take user straight to the Guide */
    const isNewUser = !localStorage.getItem(`omicslab_guide_seen_${_user.id}`);
    if (isNewUser) {
      localStorage.setItem(`omicslab_guide_seen_${_user.id}`, '1');
      setTimeout(() => {
        if (OmicsLab.Router?.navigate) OmicsLab.Router.navigate('guide');
      }, 600);
    }

    if (OmicsLab.DB?.isReady) {
      /* Supabase RLS requires a Clerk JWT — gate sync on token availability.
         Configure a "supabase" JWT template in Clerk dashboard to enable cloud sync. */
      getToken().then(jwt => {
        if (!jwt) return;
        OmicsLab.DB.setSession?.(jwt);
        OmicsLab.DB.upsertUser({
          clerk_id: _user.id, email: _user.email, name: _user.name, avatar_url: _user.avatarUrl,
          role: _user.role, plan: _user.plan,
          /* Only ever set, never clear — omitting the key (rather than
             sending null) means a sign-in with no linked GitHub account
             doesn't wipe out a previously-linked one. */
          ...(_user.githubUsername ? { github_username: _user.githubUsername } : {}),
        });
        OmicsLab.DB.syncOnSignIn(_user.id);
      }).catch(() => {});
    }
    OmicsLab.Analytics?.identify?.(_user.id, { email: _user.email, name: _user.name, plan: _user.plan });
    const sentKey = `omicslab_welcome_sent_${_user.id}`;
    if (!localStorage.getItem(sentKey) && _user.email) {
      localStorage.setItem(sentKey, '1');
      /* /api/send-email now requires the caller's Clerk session token —
         it was previously wide open to anyone on the internet. */
      _clerk.session?.getToken().then(token => {
        fetch('/api/send-email', {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ type: 'welcome', to: _user.email, data: { name: _user.name } }),
        }).catch(() => {});
      }).catch(() => {});
    }
  }

  /* ── Nav pill + mobile auth update ──────────────────────────── */
  function _updateNav(user) {
    /* Hide skeleton now that Clerk has resolved */
    const skel = document.getElementById('nav-auth-skeleton');
    if (skel) skel.style.display = 'none';
    /* Desktop nav */
    const pillWrap  = document.getElementById('nav-account-wrap');
    const pill      = document.getElementById('nav-user-pill');
    const avatar    = document.getElementById('nav-user-avatar');
    const nameEl    = document.getElementById('nav-user-name');
    const signinBtn  = document.getElementById('nav-signin-btn');
    const startBtn   = document.getElementById('nav-start-btn');
    /* Mobile overlay */
    const mobSignin  = document.getElementById('mob-auth-signin');
    const mobAccount = document.getElementById('mob-auth-account');
    const mobSignout = document.getElementById('mob-auth-signout');
    const mobName    = document.getElementById('mob-auth-username');

    if (user) {
      if (signinBtn) signinBtn.style.display = 'none';
      if (startBtn)  startBtn.style.display  = 'none';
      if (pillWrap) pillWrap.style.display = '';
      /* js/auth.js's own _updateNavUI() also toggles pill.style.display
         directly (it hides the pill when its own legacy session is null,
         which it always is once Clerk is the active provider) — clear
         that here too or the inner button stays display:none even
         though the wrapper around it is now visible. */
      if (pill) { pill.style.display = ''; pill.setAttribute('aria-label', `${user.name} — Account menu`); }
      if (avatar) {
        if (user.avatarUrl) { avatar.innerHTML = `<img src="${user.avatarUrl}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`; }
        else { avatar.textContent = user.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
      }
      if (nameEl) { const p = user.name.trim().split(/\s+/); nameEl.textContent = p[0] + (p[1] ? ' '+p[1][0]+'.' : ''); }
      /* Mobile */
      if (mobSignin)  mobSignin.style.display  = 'none';
      if (mobAccount) mobAccount.style.display = '';
      if (mobSignout) mobSignout.style.display = '';
      if (mobName)    mobName.textContent = user.name.trim().split(/\s+/)[0];
      /* Hero welcome badge for signed-in users */
      const welcome = document.getElementById('hero-welcome');
      if (welcome) {
        const firstName = user.name.trim().split(/\s+/)[0];
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        welcome.innerHTML = `<span class="hero-welcome-text">${greeting}, ${firstName}</span>`;
        welcome.style.display = '';
      }
    } else {
      if (pillWrap)  pillWrap.style.display = 'none';
      if (signinBtn) signinBtn.style.display = '';
      if (startBtn)  startBtn.style.display  = '';
      if (avatar)    avatar.textContent = '';
      if (nameEl)    nameEl.textContent  = '';
      /* Mobile */
      if (mobSignin)  mobSignin.style.display  = '';
      if (mobAccount) mobAccount.style.display = 'none';
      if (mobSignout) mobSignout.style.display = 'none';
      /* Hide hero-welcome for guests */
      const welcome = document.getElementById('hero-welcome');
      if (welcome) welcome.style.display = 'none';
    }
  }

  /* ── Inactivity session guard ───────────────────────────────── */
  /* Auto sign-out after 15 min of no user interaction.
     Warning modal appears at 14 min; staying active resets the clock. */
  const _IDLE_WARN_MS  = 14 * 60 * 1000;  /* show warning after 14 min */
  const _IDLE_GRACE_MS =      60 * 1000;  /* sign out 60 s after warning */
  let _idleTimer  = null;
  let _graceTimer = null;
  let _idleLastActivity = Date.now();

  function _resetIdleTimer() {
    if (!_user) return;
    _idleLastActivity = Date.now();
    clearTimeout(_idleTimer);
    clearTimeout(_graceTimer);
    _dismissIdleWarning();
    _idleTimer = setTimeout(_onIdleWarn, _IDLE_WARN_MS);
  }

  function _onIdleWarn() {
    if (!_user) return;
    if (document.getElementById('ol-idle-modal')) return;

    let secs = 60;
    const overlay = document.createElement('div');
    overlay.id = 'ol-idle-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(6,10,20,.75);backdrop-filter:blur(4px)';
    overlay.innerHTML = `
      <div style="background:var(--bg-surface,#111B2E);border:1px solid var(--border-default,#182236);border-radius:14px;padding:2rem 2.25rem;max-width:380px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,.5);text-align:center">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(227,179,65,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <h2 style="font-size:1.05rem;font-weight:700;color:var(--text-primary,#E4DDD2);margin:0 0 .5rem">Still there?</h2>
        <p style="font-size:.85rem;color:var(--text-secondary,#A8A098);margin:0 0 1.25rem;line-height:1.55">
          You've been inactive for 14 minutes. For your security, you'll be signed out in <strong id="ol-idle-secs" style="color:#e3b341">60</strong> seconds.
        </p>
        <div style="display:flex;gap:.6rem;justify-content:center">
          <button id="ol-idle-stay" style="flex:1;background:var(--accent,#00C4A0);color:#060A14;border:none;border-radius:8px;padding:.65rem 1rem;font-weight:700;font-size:.85rem;cursor:pointer">
            Stay signed in
          </button>
          <button id="ol-idle-signout" style="flex:1;background:transparent;color:var(--text-secondary,#A8A098);border:1px solid var(--border-default,#182236);border-radius:8px;padding:.65rem 1rem;font-size:.85rem;cursor:pointer">
            Sign out now
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    overlay.querySelector('#ol-idle-stay').onclick    = _resetIdleTimer;
    overlay.querySelector('#ol-idle-signout').onclick = () => { _dismissIdleWarning(); signOut(); };

    const tick = setInterval(() => {
      secs--;
      const el = document.getElementById('ol-idle-secs');
      if (el) el.textContent = secs;
      if (secs <= 0) clearInterval(tick);
    }, 1000);

    _graceTimer = setTimeout(() => {
      _dismissIdleWarning();
      if (_user) signOut().then(() => {
        OmicsLab.Toast?.show('Signed out after 15 minutes of inactivity', 'info');
      });
    }, _IDLE_GRACE_MS);
  }

  function _dismissIdleWarning() {
    document.getElementById('ol-idle-modal')?.remove();
  }

  function _startIdleGuard() {
    const events = ['click','keydown','mousemove','scroll','touchstart','pointerdown'];
    events.forEach(ev => document.addEventListener(ev, _resetIdleTimer, { passive: true }));
    _resetIdleTimer();
  }

  function _stopIdleGuard() {
    clearTimeout(_idleTimer);
    clearTimeout(_graceTimer);
    _dismissIdleWarning();
    _idleTimer = null;
  }

  /* ── Public API ─────────────────────────────────────────────── */

  /* Recover previous user email to pre-fill Clerk sign-in */
  function _prevEmail() {
    try { return JSON.parse(localStorage.getItem('omicslab_user_profile') || 'null')?.email || ''; } catch { return ''; }
  }

  /* signIn waits up to 6s for Clerk to load before giving up */
  function signIn() {
    const opts = { appearance: _appearance, localization: _localization };
    const email = _prevEmail();
    if (email) opts.initialValues = { emailAddress: email };
    if (_ready) { _clerk.openSignIn(opts); return; }
    if (!_loading) { OmicsLab.Auth?.openModal?.('signin'); return; }
    console.log('[AuthClerk] Waiting for Clerk to load…');
    let waited = 0;
    const poll = setInterval(() => {
      waited += 200;
      if (_ready) { clearInterval(poll); _clerk.openSignIn(opts); }
      else if (!_loading || waited >= 6000) { clearInterval(poll); OmicsLab.Auth?.openModal?.('signin'); }
    }, 200);
  }

  function signUp() {
    const opts = { appearance: _appearance, localization: _localization };
    if (_ready) { _clerk.openSignUp(opts); return; }
    if (!_loading) { OmicsLab.Auth?.openModal?.('register'); return; }
    let waited = 0;
    const poll = setInterval(() => {
      waited += 200;
      if (_ready) { clearInterval(poll); _clerk.openSignUp(opts); }
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
    else _clerk.openSignIn({ appearance: _appearance, localization: _localization });
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
