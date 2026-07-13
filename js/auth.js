/* ═══════════════════════════════════════════════════════════════
   OmicsLab Auth — User Account System
   ─ Email/password auth (fully offline via localStorage)
   ─ OAuth: GitHub · Google · LinkedIn (UI-complete; needs backend)
   ─ Account linking, session tokens, profile management
   ─ Emits authStateChange events for other modules
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Auth = (function () {

  /* ─── Configuration ─────────────────────────────────────────
     Set API_BASE to your backend URL in production.
     Leave empty for offline-only (email auth via localStorage).
     Set OAuth client IDs after registering apps with providers. */
  const CFG = {
    API_BASE: '',                         // e.g. 'https://api.omicslab.africa/v1'
    GITHUB_CLIENT_ID:   '',              // github.com/settings/apps → New OAuth App
    GOOGLE_CLIENT_ID:   '',              // console.cloud.google.com → Credentials
    LINKEDIN_CLIENT_ID: '',              // developer.linkedin.com → Create App
    REDIRECT_BASE: location.origin + location.pathname,
  };

  const S_SESSION = 'omicslab_session_v2';
  const S_USERS   = 'omicslab_users_v2';

  let _user    = null;   // { id, name, email, avatar, institution, country, role, linkedAccounts, badges, createdAt }
  let _session = null;   // { token, expires }
  let _cbs     = [];

  /* ─── Persistence ─── */
  function _loadUsers()  { try { return JSON.parse(localStorage.getItem(S_USERS)  || '[]'); } catch { return []; } }
  function _saveUsers(u) { try { localStorage.setItem(S_USERS, JSON.stringify(u)); } catch {} }
  function _loadSession(){ try { return JSON.parse(localStorage.getItem(S_SESSION) || 'null'); } catch { return null; } }
  function _saveSession(s){ try { localStorage.setItem(S_SESSION, JSON.stringify(s)); } catch {} }
  function _clearSession(){ localStorage.removeItem(S_SESSION); }

  function _emit() { _cbs.forEach(cb => { try { cb(_user); } catch {} }); }

  /* ─── Password hashing (demo — use bcrypt on real backend) ─── */
  function _hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return 'h' + Math.abs(h).toString(36);
  }

  /* ─── UUID ─── */
  function _uuid() {
    return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ─── Generate session token ─── */
  function _makeToken(userId) {
    return btoa(userId + ':' + Date.now() + ':' + Math.random().toString(36));
  }

  /* ─── Restore session on load ─── */
  function _restoreSession() {
    /* When Clerk is configured it owns auth — don't restore local sessions */
    if (window.OMICSLAB_CONFIG?.clerkPublishableKey) return;
    const s = _loadSession();
    if (!s || !s.token || !s.userId) return;
    if (s.expires && Date.now() > s.expires) { _clearSession(); return; }
    const users = _loadUsers();
    const user = users.find(u => u.id === s.userId);
    if (user) { _user = user; _session = s; }
  }

  /* ─── Public: register with email ─── */
  function register({ name, email, password, institution = '', country = '', role = 'researcher' }) {
    const users = _loadUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists. Sign in instead.' };
    }
    const user = {
      id: _uuid(), name, email: email.toLowerCase(),
      passwordHash: _hash(password),
      avatar: '', institution, country, role,
      linkedAccounts: {}, badges: [],
      createdAt: Date.now(),
    };
    users.push(user);
    _saveUsers(users);
    _startSession(user);
    _updateNavUI();
    _emit();
    return { ok: true, user };
  }

  /* ─── Public: sign in with email ─── */
  function signIn({ email, password }) {
    const users = _loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: 'No account found with this email. Create one below.' };
    if (user.passwordHash !== _hash(password)) return { ok: false, error: 'Incorrect password.' };
    _startSession(user);
    _updateNavUI();
    _emit();
    return { ok: true, user };
  }

  /* ─── Public: sign out ─── */
  function signOut() {
    _user = null;
    _session = null;
    _clearSession();
    _updateNavUI();
    _emit();
    closeModal();
    _showToast('Signed out successfully');
  }

  /* ─── Public: update profile ─── */
  function updateProfile(updates) {
    if (!_user) return { ok: false, error: 'Not signed in' };
    const users = _loadUsers();
    const idx = users.findIndex(u => u.id === _user.id);
    if (idx === -1) return { ok: false, error: 'User not found' };
    Object.assign(users[idx], updates);
    Object.assign(_user, updates);
    _saveUsers(users);
    _updateNavUI();
    _emit();
    return { ok: true };
  }

  /* ─── Public: change password ─── */
  function changePassword({ currentPassword, newPassword }) {
    if (!_user) return { ok: false, error: 'Not signed in' };
    if (_user.passwordHash !== _hash(currentPassword)) return { ok: false, error: 'Current password incorrect' };
    return updateProfile({ passwordHash: _hash(newPassword) });
  }

  /* ─── Session helper ─── */
  function _startSession(user) {
    _user = user;
    _session = { token: _makeToken(user.id), userId: user.id, expires: Date.now() + 30 * 24 * 3600 * 1000 };
    _saveSession(_session);
  }

  /* ─── OAuth initiation ─── */
  function oauthStart(provider) {
    if (!CFG.API_BASE && !CFG[provider.toUpperCase() + '_CLIENT_ID']) {
      _showOAuthSetup(provider);
      return;
    }
    const redirectUri = encodeURIComponent(CFG.REDIRECT_BASE + '#/auth/callback/' + provider);
    const urls = {
      github: `https://github.com/login/oauth/authorize?client_id=${CFG.GITHUB_CLIENT_ID}&scope=user:email%20read:user&redirect_uri=${redirectUri}&state=${_makeToken('oauth')}`,
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CFG.GOOGLE_CLIENT_ID}&response_type=code&scope=openid%20email%20profile&redirect_uri=${redirectUri}&state=${_makeToken('oauth')}`,
      linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CFG.LINKEDIN_CLIENT_ID}&scope=r_liteprofile%20r_emailaddress&redirect_uri=${redirectUri}&state=${_makeToken('oauth')}`,
    };
    if (urls[provider]) location.href = urls[provider];
  }

  /* ─── Handle OAuth callback (called on page load if hash matches) ─── */
  function _handleOAuthCallback() {
    const hash = location.hash;
    const m = hash.match(/^#\/auth\/callback\/(github|google|linkedin)\?code=([^&]+)/);
    if (!m) return;
    const [, provider, code] = m;
    history.replaceState(null, '', location.pathname);
    if (!CFG.API_BASE) {
      _showOAuthSetup(provider);
      return;
    }
    _showModal('loading');
    fetch(`${CFG.API_BASE}/auth/oauth/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri: CFG.REDIRECT_BASE + '#/auth/callback/' + provider }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.user && data.token) {
          const users = _loadUsers();
          const idx = users.findIndex(u => u.id === data.user.id);
          if (idx === -1) users.push(data.user);
          else Object.assign(users[idx], data.user);
          _saveUsers(users);
          _startSession(data.user);
          _updateNavUI();
          _emit();
          closeModal();
          _showToast('Signed in with ' + _capFirst(provider));
        } else {
          _showModal('signin');
          _setFormError(data.error || 'OAuth sign-in failed');
        }
      })
      .catch(() => {
        _showModal('signin');
        _setFormError('Network error during OAuth sign-in');
      });
  }

  /* ─── Nav UI ─── */
  function _updateNavUI() {
    const pill      = document.getElementById('nav-user-pill');
    const avatar    = document.getElementById('nav-user-avatar');
    const nameEl    = document.getElementById('nav-user-name');
    const signinBtn = document.getElementById('nav-signin-btn');
    const mobSignin  = document.getElementById('mob-auth-signin');
    const mobAccount = document.getElementById('mob-auth-account');
    const mobSignout = document.getElementById('mob-auth-signout');
    const mobName    = document.getElementById('mob-auth-username');

    if (_user) {
      if (pill)      { pill.style.display = ''; pill.setAttribute('aria-label', `${_user.name} — Account settings`); }
      if (signinBtn) signinBtn.style.display = 'none';
      if (avatar) {
        if (_user.avatar) {
          avatar.innerHTML = `<img src="${_user.avatar}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
        } else {
          avatar.textContent = _initials(_user.name);
        }
      }
      if (nameEl) {
        const parts = _user.name.trim().split(/\s+/);
        nameEl.textContent = parts[0] + (parts[1] ? ' ' + parts[1][0] + '.' : '');
      }
      if (mobSignin)  mobSignin.style.display  = 'none';
      if (mobAccount) mobAccount.style.display = '';
      if (mobSignout) mobSignout.style.display = '';
      if (mobName)    mobName.textContent = _user.name.trim().split(/\s+/)[0];
    } else {
      if (pill)      pill.style.display = 'none';
      if (signinBtn) signinBtn.style.display = '';
      if (mobSignin)  mobSignin.style.display  = '';
      if (mobAccount) mobAccount.style.display = 'none';
      if (mobSignout) mobSignout.style.display = 'none';
    }
  }

  /* ─── Modal ─── */
  function openModal(tab = 'signin') { _showModal(tab); }

  function closeModal() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.classList.remove('auth-modal-open');
  }

  function _showModal(tab) {
    /* Delegate to Clerk when available — covers all internal callers */
    const clerk = window.OmicsLab?.AuthClerk;
    if (clerk) {
      if (tab === 'account') { clerk.openAccount(); }
      else if (tab === 'register') { clerk.signUp(); }
      else { clerk.signIn(); }
      return;
    }
    let overlay = document.getElementById('auth-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'auth-modal-overlay';
      overlay.className = 'auth-modal-overlay';
      overlay.onclick = e => { if (e.target === overlay) closeModal(); };
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = _modalHtml(tab);
    overlay.classList.add('auth-modal-open');

    /* Auto-focus first input */
    setTimeout(() => {
      const first = overlay.querySelector('input:not([type=hidden])');
      if (first) first.focus();
    }, 120);
  }

  function _setFormError(msg) {
    const el = document.getElementById('auth-form-error');
    if (el) { el.textContent = msg; el.style.display = msg ? '' : 'none'; }
  }

  function _showOAuthSetup(provider) {
    _showModal('oauth-setup');
    const el = document.getElementById('auth-oauth-provider');
    if (el) el.textContent = _capFirst(provider);
  }

  /* ─── Modal HTML ─── */
  function _modalHtml(tab) {
    if (tab === 'loading') return `<div class="auth-modal"><div class="auth-spinner"></div><p style="color:#A8A098;text-align:center;margin-top:1rem">Signing in…</p></div>`;
    if (tab === 'oauth-setup') return _oauthSetupHtml();
    if (tab === 'account') return _accountHtml();
    return _authFormHtml(tab);
  }

  function _authFormHtml(tab) {
    const isSignIn = tab !== 'register';
    return `
      <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div class="auth-modal-header">
          <div class="auth-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/></svg>
            OmicsLab
          </div>
          <button class="auth-close" onclick="OmicsLab.Auth.closeModal()" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab ${isSignIn ? 'auth-tab-active' : ''}" onclick="OmicsLab.Auth.openModal('signin')">Sign in</button>
          <button class="auth-tab ${!isSignIn ? 'auth-tab-active' : ''}" onclick="OmicsLab.Auth.openModal('register')">Create account</button>
        </div>

        <form class="auth-form" onsubmit="event.preventDefault(); OmicsLab.Auth._submitForm('${isSignIn ? 'signin' : 'register'}')">
          ${!isSignIn ? `
          <div class="auth-field">
            <label class="auth-label" for="auth-name">Full name</label>
            <input class="auth-input" id="auth-name" type="text" placeholder="Dr. Amara Osei" required autocomplete="name"/>
          </div>` : ''}

          <div class="auth-field">
            <label class="auth-label" for="auth-email">Email address <span class="auth-label-hint">(stored locally — no email sent)</span></label>
            <input class="auth-input" id="auth-email" type="email" placeholder="you@institution.ac.za" required autocomplete="email"/>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="auth-password">Password</label>
            <div class="auth-pw-wrap">
              <input class="auth-input" id="auth-password" type="password" placeholder="${isSignIn ? '••••••••' : 'At least 8 characters'}" required autocomplete="${isSignIn ? 'current-password' : 'new-password'}" minlength="8"/>
              <button type="button" class="auth-pw-toggle" onclick="OmicsLab.Auth._togglePw()" aria-label="Toggle password visibility">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div class="auth-error" id="auth-form-error" style="display:none"></div>

          <button class="auth-submit-btn" type="submit" id="auth-submit">
            ${isSignIn ? 'Sign in' : 'Create account'}
          </button>
        </form>

        ${isSignIn ? `<div class="auth-footer-links">
          <button class="auth-link-btn" onclick="OmicsLab.Auth.openModal('register')">New to OmicsLab? Create an account</button>
        </div>` : `<div class="auth-local-notice">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          Account saved locally — no email confirmation needed. You can add your institution and country in your profile later.
        </div>`}
      </div>`;
  }

  function _oauthSetupHtml() {
    return `
      <div class="auth-modal" role="dialog">
        <div class="auth-modal-header">
          <div class="auth-brand">Social Sign-In</div>
          <button class="auth-close" onclick="OmicsLab.Auth.closeModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="padding:1.5rem;text-align:center">
          <div style="width:52px;height:52px;border-radius:50%;background:rgba(88,166,255,0.1);border:1px solid rgba(88,166,255,0.25);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div style="font-size:0.95rem;font-weight:700;color:#E4DDD2;margin-bottom:0.5rem">Social sign-in coming soon</div>
          <p style="color:#A8A098;font-size:0.82rem;line-height:1.6;margin-bottom:1.5rem">
            Sign-in via <strong style="color:#A8A098" id="auth-oauth-provider"></strong> is being integrated into OmicsLab.<br>
            In the meantime, use your email and password — your account and all research data sync across devices.
          </p>
          <button class="auth-submit-btn" onclick="OmicsLab.Auth.openModal('signin')">
            Continue with email
          </button>
          <button class="auth-link-btn" style="margin-top:0.75rem;display:block;width:100%" onclick="OmicsLab.Auth.openModal('register')">
            Create a free account
          </button>
        </div>
      </div>`;
  }

  function _accountHtml() {
    if (!_user) return _authFormHtml('signin');
    const u = _user;
    return `
      <div class="auth-modal auth-modal-wide" role="dialog" aria-labelledby="auth-modal-title">
        <div class="auth-modal-header">
          <div class="auth-brand">Account Settings</div>
          <button class="auth-close" onclick="OmicsLab.Auth.closeModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="auth-account-body">

          <!-- Avatar upload -->
          <div class="auth-avatar-row">
            <div class="auth-avatar-preview" id="auth-av-preview">
              ${u.avatar ? `<img src="${u.avatar}" alt="Avatar">` : `<span>${_initials(u.name)}</span>`}
            </div>
            <div>
              <input type="file" id="auth-av-input" accept="image/*" style="display:none" onchange="OmicsLab.Auth._uploadAvatar(this)"/>
              <button class="auth-link-btn" onclick="document.getElementById('auth-av-input').click()">Change photo</button>
              <div style="font-size:0.68rem;color:#A8A098;margin-top:0.2rem">PNG, JPG, max 1MB</div>
            </div>
          </div>

          <div class="auth-section-label">Profile</div>
          <div class="auth-field-row">
            <div class="auth-field">
              <label class="auth-label">Full name</label>
              <input class="auth-input" id="acc-name" value="${_esc(u.name)}" type="text"/>
            </div>
            <div class="auth-field">
              <label class="auth-label">Role</label>
              <select class="auth-input auth-select" id="acc-role">
                ${['researcher','student','instructor','clinician','bioinformatician','public-health'].map(r =>
                  `<option value="${r}" ${u.role === r ? 'selected' : ''}>${_capFirst(r.replace('-',' '))}</option>`
                ).join('')}
              </select>
            </div>
          </div>
          <div class="auth-field-row">
            <div class="auth-field">
              <label class="auth-label">Institution</label>
              <input class="auth-input" id="acc-institution" value="${_esc(u.institution || '')}" type="text"/>
            </div>
            <div class="auth-field">
              <label class="auth-label">Country</label>
              <select class="auth-input auth-select" id="acc-country">
                ${AFRICAN_COUNTRIES.map(c => `<option value="${c}" ${u.country === c ? 'selected' : ''}>${c}</option>`).join('')}
                <option value="Other" ${u.country === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
          </div>

          <button class="auth-submit-btn" style="margin-bottom:1.5rem" onclick="OmicsLab.Auth._saveAccount()">Save profile</button>

          <div class="auth-section-label">Linked accounts</div>
          <div class="auth-linked-row">
            ${_linkedBtn('github',   u.linkedAccounts?.github)}
            ${_linkedBtn('google',   u.linkedAccounts?.google)}
            ${_linkedBtn('linkedin', u.linkedAccounts?.linkedin)}
          </div>

          <div class="auth-section-label" style="margin-top:1.5rem">Change password</div>
          <div class="auth-field">
            <label class="auth-label">Current password</label>
            <input class="auth-input" id="acc-pw-current" type="password" placeholder="••••••••"/>
          </div>
          <div class="auth-field-row">
            <div class="auth-field">
              <label class="auth-label">New password</label>
              <input class="auth-input" id="acc-pw-new" type="password" placeholder="••••••••"/>
            </div>
            <div class="auth-field">
              <label class="auth-label">Confirm</label>
              <input class="auth-input" id="acc-pw-confirm" type="password" placeholder="••••••••"/>
            </div>
          </div>
          <div class="auth-error" id="auth-pw-error" style="display:none"></div>
          <button class="auth-link-btn" onclick="OmicsLab.Auth._savePassword()">Update password</button>

          <div class="auth-danger-zone">
            <button class="auth-signout-btn" onclick="OmicsLab.Auth.signOut()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>
        </div>
      </div>`;
  }

  function _linkedBtn(provider, linked) {
    const icons = {
      github: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
      google: `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
      linkedin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    };
    return `
      <button class="auth-linked-btn ${linked ? 'auth-linked-connected' : ''}"
              onclick="OmicsLab.Auth.oauthStart('${provider}')">
        ${icons[provider]}
        <span>${_capFirst(provider)}</span>
        ${linked ? `<span class="auth-linked-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></span>` : '<span class="auth-linked-plus">Connect</span>'}
      </button>`;
  }

  /* ─── Form submission ─── */
  function _submitForm(mode) {
    _setFormError('');
    const btn = document.getElementById('auth-submit');
    if (btn) { btn.disabled = true; btn.textContent = mode === 'signin' ? 'Signing in…' : 'Creating account…'; }

    if (mode === 'signin') {
      const email    = document.getElementById('auth-email')?.value?.trim();
      const password = document.getElementById('auth-password')?.value;
      const result = signIn({ email, password });
      if (btn) { btn.disabled = false; btn.textContent = 'Sign in'; }
      if (!result.ok) { _setFormError(result.error); return; }
      closeModal();
      _showToast('Welcome back, ' + result.user.name.split(' ')[0] + '.');
    } else {
      const name        = document.getElementById('auth-name')?.value?.trim();
      const email       = document.getElementById('auth-email')?.value?.trim();
      const password    = document.getElementById('auth-password')?.value;
      if (!name || name.length < 2) { _setFormError('Please enter your full name.'); if (btn) { btn.disabled = false; btn.textContent = 'Create account'; } return; }
      if (password.length < 8) { _setFormError('Password must be at least 8 characters.'); if (btn) { btn.disabled = false; btn.textContent = 'Create account'; } return; }
      const result = register({ name, email, password });
      if (btn) { btn.disabled = false; btn.textContent = 'Create account'; }
      if (!result.ok) { _setFormError(result.error); return; }
      _showRegisterSuccess(result.user);
    }
  }

  /* ─── Registration success screen ─── */
  function _showRegisterSuccess(user) {
    let overlay = document.getElementById('auth-modal-overlay');
    if (!overlay) return;
    overlay.innerHTML = `
      <div class="auth-modal" role="dialog" style="text-align:center;padding:2rem 1.5rem">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(0,196,160,0.12);border:1.5px solid rgba(0,196,160,0.4);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style="font-size:1.1rem;font-weight:700;color:#E4DDD2;margin-bottom:.4rem">Account created!</div>
        <div style="font-size:.85rem;color:#00C4A0;font-weight:600;margin-bottom:.9rem">You are now signed in as ${_esc(user.name.split(' ')[0])}</div>
        <p style="font-size:.78rem;color:#A8A098;line-height:1.65;max-width:300px;margin:0 auto 1.5rem">
          Your account is saved in this browser — no email verification needed. To access OmicsLab on another device, create an account there too.
        </p>
        <button class="auth-submit-btn" onclick="OmicsLab.Auth.closeModal()">Continue to OmicsLab</button>
      </div>`;
  }

  /* ─── Account save ─── */
  function _saveAccount() {
    const result = updateProfile({
      name:        document.getElementById('acc-name')?.value?.trim() || _user.name,
      institution: document.getElementById('acc-institution')?.value?.trim(),
      country:     document.getElementById('acc-country')?.value,
      role:        document.getElementById('acc-role')?.value,
    });
    if (result.ok) _showToast('Profile saved');
  }

  function _savePassword() {
    const cur  = document.getElementById('acc-pw-current')?.value;
    const next = document.getElementById('acc-pw-new')?.value;
    const conf = document.getElementById('acc-pw-confirm')?.value;
    const err  = document.getElementById('auth-pw-error');
    const show = (msg) => { if (err) { err.textContent = msg; err.style.display = ''; } };
    if (!cur || !next) { show('Enter current and new password'); return; }
    if (next.length < 8) { show('New password must be at least 8 characters'); return; }
    if (next !== conf) { show('Passwords do not match'); return; }
    const result = changePassword({ currentPassword: cur, newPassword: next });
    if (!result.ok) { show(result.error); return; }
    if (err) err.style.display = 'none';
    _showToast('Password updated');
    ['acc-pw-current','acc-pw-new','acc-pw-confirm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  /* ─── Avatar upload ─── */
  function _uploadAvatar(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { _showToast('Image must be smaller than 1MB', true); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const avatar = e.target.result;
      updateProfile({ avatar });
      const prev = document.getElementById('auth-av-preview');
      if (prev) prev.innerHTML = `<img src="${avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
    };
    reader.readAsDataURL(file);
  }

  /* ─── Toggle password visibility ─── */
  function _togglePw() {
    const pw = document.getElementById('auth-password');
    if (pw) pw.type = pw.type === 'password' ? 'text' : 'password';
  }

  /* ─── Toast ─── */
  function _showToast(msg, isError) {
    if (OmicsLab.Notify) {
      if (isError) OmicsLab.Notify.error(msg);
      else OmicsLab.Notify.success(msg);
    } else {
      console.log('[OmicsLab Auth]', msg);
    }
  }

  /* ─── Helpers ─── */
  function _initials(name) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  function _capFirst(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

  function _esc(s) { return (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  /* ─── African countries list ─── */
  const AFRICAN_COUNTRIES = [
    'Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cameroon','Cape Verde',
    'Central African Republic','Chad','Comoros','Congo','Côte d\'Ivoire','DRC','Djibouti',
    'Egypt','Equatorial Guinea','Eritrea','Eswatini','Ethiopia','Gabon','Gambia','Ghana',
    'Guinea','Guinea-Bissau','Kenya','Lesotho','Liberia','Libya','Madagascar','Malawi',
    'Mali','Mauritania','Mauritius','Morocco','Mozambique','Namibia','Niger','Nigeria',
    'Rwanda','Sao Tome & Principe','Senegal','Seychelles','Sierra Leone','Somalia',
    'South Africa','South Sudan','Sudan','Tanzania','Togo','Tunisia','Uganda','Zambia','Zimbabwe',
  ];

  /* ─── Init ─── */
  function init() {
    _restoreSession();
    _handleOAuthCallback();
    _injectSignInBtn();
    _updateNavUI();
    _emit();
  }

  function _injectSignInBtn() {
    const pill = document.getElementById('nav-user-pill');
    if (!pill) return;

    /* Inject sign-in button once, before the pill */
    if (!document.getElementById('nav-signin-btn')) {
      const btn = document.createElement('button');
      btn.id        = 'nav-signin-btn';
      btn.className = 'nav-signin-btn';
      btn.setAttribute('aria-label', 'Sign in to OmicsLab');
      btn.onclick = () => openModal('signin');
      btn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        Sign in`;
      pill.parentNode.insertBefore(btn, pill);
    }

    /* Previously re-wired pill.onclick here to force-open the auth modal —
       that silently overwrote the pill's real HTML onclick (which now
       opens the account dropdown with Manage Account / Sign Out) on every
       page load, since a JS .onclick assignment replaces an inline HTML
       onclick attribute rather than adding to it. This was the actual
       reason desktop users could never reach a working sign-out control.
       The pill's own onclick (index.html) is now the single source of
       truth for what clicking it does. */
  }

  /* ─── Public API ─── */
  function onAuthStateChange(cb) { _cbs.push(cb); cb(_user); }
  function currentUser() { return _user; }
  function isSignedIn() { return !!_user; }
  function getToken() { return _session?.token || null; }

  return {
    init, register, signIn, signOut, updateProfile, changePassword,
    openModal, closeModal, oauthStart, currentUser, isSignedIn, getToken,
    onAuthStateChange,
    /* internal (called from inline onclick) */
    _submitForm, _saveAccount, _savePassword, _uploadAvatar, _togglePw,
  };
})();
