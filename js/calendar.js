/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Calendar & Scheduling (Prompt 15)
   ─ Meeting scheduler modal for Teams page
   ─ .ics (RFC 5545) file download
   ─ Upcoming meetings strip at top of Teams page
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Calendar = (function () {

  const STORE_KEY = 'omicslab_calendar_v1';

  const TZ_OPTIONS = [
    { value: 'Africa/Lagos',       label: 'WAT — West Africa Time (Lagos, Accra, Abuja)' },
    { value: 'Africa/Nairobi',     label: 'EAT — East Africa Time (Nairobi, Kampala, Addis Ababa)' },
    { value: 'Africa/Harare',      label: 'CAT — Central Africa Time (Harare, Lusaka, Kinshasa)' },
    { value: 'Africa/Johannesburg',label: 'SAST — South Africa Standard Time (Johannesburg, Cape Town)' },
    { value: 'Africa/Cairo',       label: 'EET — Eastern European Time (Cairo, Khartoum)' },
    { value: 'Africa/Casablanca',  label: 'WET — Western European Time (Casablanca, Dakar)' },
    { value: 'UTC',                label: 'UTC — Coordinated Universal Time' },
  ];

  const RECURRENCE = [
    { value: 'once',   label: 'Once' },
    { value: 'daily',  label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
  ];

  /* ─── Data helpers ─── */
  function _load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
  }

  function _save(events) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(events)); } catch {}
  }

  function _add(event) {
    const events = _load();
    event.id = 'ev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    events.push(event);
    events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    _save(events);
    return event;
  }

  function _getUpcoming(n = 5) {
    const now = Date.now();
    return _load().filter(e => new Date(e.datetime).getTime() >= now - 3600000).slice(0, n);
  }

  /* ─── Upcoming strip (inject above Teams grid) ─── */
  function renderStrip(container) {
    const events = _getUpcoming(3);
    if (!document.getElementById('cal-strip-styles')) _injectStyles();

    let strip = document.getElementById('cal-upcoming-strip');
    if (!strip) {
      strip = document.createElement('div');
      strip.id = 'cal-upcoming-strip';
      container.prepend(strip);
    }

    if (!events.length) {
      strip.innerHTML = `
        <div class="cal-strip">
          <div class="cal-strip-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Upcoming this week
          </div>
          <div class="cal-strip-empty">No meetings scheduled — <button class="cal-link" onclick="OmicsLab.Calendar.openScheduler()">schedule one</button></div>
        </div>`;
      return;
    }

    strip.innerHTML = `
      <div class="cal-strip">
        <div class="cal-strip-header">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Upcoming this week
          <button class="cal-link" style="margin-left:auto" onclick="OmicsLab.Calendar.openScheduler()">+ Schedule</button>
        </div>
        <div class="cal-strip-list">
          ${events.map(e => `
            <div class="cal-strip-item">
              <div class="cal-strip-time">
                <span class="cal-strip-date">${_formatDate(e.datetime)}</span>
                <span class="cal-strip-clock">${_formatTime(e.datetime, e.timezone)}</span>
              </div>
              <div class="cal-strip-info">
                <span class="cal-strip-title">${_esc(e.title)}</span>
                ${e.room ? `<span class="cal-strip-room">${_esc(e.room)}</span>` : ''}
              </div>
              <button class="btn btn-ghost btn-sm cal-ics-btn" onclick="OmicsLab.Calendar.downloadICS('${e.id}')" title="Download .ics">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ─── Scheduler modal ─── */
  function openScheduler(opts = {}) {
    _injectStyles();
    let overlay = document.getElementById('cal-modal-overlay');
    if (overlay) { overlay.remove(); }

    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5);

    overlay = document.createElement('div');
    overlay.id = 'cal-modal-overlay';
    overlay.className = 'cal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cal-modal-title');
    overlay.innerHTML = `
      <div class="cal-modal">
        <div class="cal-modal-header">
          <span id="cal-modal-title" class="cal-modal-title">Schedule Meeting</span>
          <button class="cal-modal-close" type="button" onclick="OmicsLab.Calendar.closeScheduler()" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="cal-modal-body">
          <div class="cal-field">
            <label class="cal-label" for="cal-title">Meeting title</label>
            <input class="input" id="cal-title" type="text" placeholder="e.g. African Genomics Lab" value="${_esc(opts.room||'')}">
          </div>
          <div class="cal-field-row">
            <div class="cal-field">
              <label class="cal-label" for="cal-date">Date</label>
              <input class="input" id="cal-date" type="date" value="${today}" min="${today}">
            </div>
            <div class="cal-field">
              <label class="cal-label" for="cal-time">Time</label>
              <input class="input" id="cal-time" type="time" value="${nowTime}">
            </div>
          </div>
          <div class="cal-field">
            <label class="cal-label" for="cal-tz">Timezone</label>
            <select class="select" id="cal-tz">
              ${TZ_OPTIONS.map(t => `<option value="${t.value}"${t.value==='Africa/Lagos'?' selected':''}>${_esc(t.label)}</option>`).join('')}
            </select>
          </div>
          <div class="cal-field">
            <label class="cal-label" for="cal-recur">Recurrence</label>
            <select class="select" id="cal-recur">
              ${RECURRENCE.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
            </select>
          </div>
          <div class="cal-field">
            <label class="cal-label" for="cal-agenda">Agenda / description</label>
            <textarea class="textarea" id="cal-agenda" rows="3" placeholder="Meeting agenda, topics to discuss…"></textarea>
          </div>
          <div class="cal-field">
            <label class="cal-label" for="cal-invites">Invite list (emails, comma separated)</label>
            <input class="input" id="cal-invites" type="text" placeholder="user@example.com, another@uni.ac.za">
          </div>
        </div>
        <div class="cal-modal-footer">
          <button class="btn btn-ghost" type="button" onclick="OmicsLab.Calendar.closeScheduler()">Cancel</button>
          <button class="btn btn-ghost btn-sm" type="button" id="cal-ics-preview-btn" onclick="OmicsLab.Calendar._saveAndDownload()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download .ics
          </button>
          <button class="btn btn-primary" type="button" onclick="OmicsLab.Calendar._saveEvent()">Save to calendar</button>
        </div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeScheduler(); });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.getElementById('cal-title')?.focus();
    document.addEventListener('keydown', _onKey);
  }

  function closeScheduler() {
    const overlay = document.getElementById('cal-modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 200);
    }
    document.removeEventListener('keydown', _onKey);
  }

  function _onKey(e) { if (e.key === 'Escape') closeScheduler(); }

  function _readForm() {
    return {
      title:    document.getElementById('cal-title')?.value.trim() || 'Meeting',
      date:     document.getElementById('cal-date')?.value || new Date().toISOString().slice(0,10),
      time:     document.getElementById('cal-time')?.value || '10:00',
      timezone: document.getElementById('cal-tz')?.value || 'Africa/Lagos',
      recur:    document.getElementById('cal-recur')?.value || 'once',
      agenda:   document.getElementById('cal-agenda')?.value.trim() || '',
      invites:  (document.getElementById('cal-invites')?.value || '').split(',').map(e=>e.trim()).filter(Boolean),
      datetime: `${document.getElementById('cal-date')?.value || new Date().toISOString().slice(0,10)}T${document.getElementById('cal-time')?.value || '10:00'}`,
    };
  }

  function _saveEvent() {
    const data = _readForm();
    if (!data.title) { OmicsLab.Notify?.warning('Please enter a meeting title'); return; }
    _add(data);
    closeScheduler();
    OmicsLab.Notify?.success('Meeting saved to calendar');
    /* Refresh strip */
    const teamsSection = document.getElementById('teams-section');
    if (teamsSection) {
      const stripContainer = teamsSection.querySelector('.teams-layout, .teams-wrap, section, div');
      if (stripContainer) renderStrip(stripContainer);
    }
  }

  function _saveAndDownload() {
    const data = _readForm();
    if (!data.title) { OmicsLab.Notify?.warning('Please enter a meeting title'); return; }
    const event = _add(data);
    _generateICS(event);
    closeScheduler();
    OmicsLab.Notify?.success('Meeting saved and .ics downloaded');
  }

  /* ─── ICS generation ─── */
  function downloadICS(eventId) {
    const events = _load();
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    _generateICS(event);
  }

  function _generateICS(event) {
    const dt    = new Date(event.datetime);
    const dtEnd = new Date(dt.getTime() + 60 * 60 * 1000); /* default 1h */

    const _pad  = n => String(n).padStart(2, '0');
    const _fmt  = d => `${d.getUTCFullYear()}${_pad(d.getUTCMonth()+1)}${_pad(d.getUTCDate())}T${_pad(d.getUTCHours())}${_pad(d.getUTCMinutes())}00Z`;
    const now   = _fmt(new Date());
    const uid   = (event.id || 'ev') + '@omicslab.africa';

    let rrule = '';
    if (event.recur === 'daily')  rrule = 'RRULE:FREQ=DAILY;COUNT=10\r\n';
    if (event.recur === 'weekly') rrule = 'RRULE:FREQ=WEEKLY;COUNT=8\r\n';

    let attendees = '';
    (event.invites || []).forEach(email => {
      attendees += `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:${email}\r\n`;
    });

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//OmicsLab//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=${event.timezone || 'Africa/Lagos'}:${_fmt(dt).replace('Z','')}`,
      `DTEND;TZID=${event.timezone || 'Africa/Lagos'}:${_fmt(dtEnd).replace('Z','')}`,
      `SUMMARY:${(event.title||'Meeting').replace(/[,;\\]/g, '\\$&')}`,
      event.agenda ? `DESCRIPTION:${event.agenda.replace(/\n/g, '\\n').replace(/[,;\\]/g,'\\$&')}` : '',
      `LOCATION:OmicsLab Teams — omicslab.africa`,
      rrule.trim(),
      attendees.trim(),
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `omicslab-meeting-${(event.title||'meeting').toLowerCase().replace(/\s+/g,'-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ─── Format helpers ─── */
  function _formatDate(isoDatetime) {
    const d = new Date(isoDatetime);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function _formatTime(isoDatetime, tz) {
    const d = new Date(isoDatetime);
    try {
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz || 'UTC' });
    } catch {
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  function _injectStyles() {
    if (document.getElementById('cal-styles')) return;
    const s = document.createElement('style');
    s.id = 'cal-styles';
    s.textContent = `
      /* Upcoming strip */
      .cal-strip{background:var(--bg-surface,#161b22);border:1px solid var(--border-default,#21262d);border-radius:8px;padding:.65rem .85rem;margin-bottom:.85rem}
      .cal-strip-header{display:flex;align-items:center;gap:.35rem;font-size:.7rem;font-weight:700;color:var(--text-faint,#484f58);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.55rem}
      .cal-strip-list{display:flex;flex-direction:column;gap:.35rem}
      .cal-strip-item{display:flex;align-items:center;gap:.65rem}
      .cal-strip-time{flex-shrink:0;text-align:right;min-width:90px}
      .cal-strip-date{font-size:.72rem;font-weight:600;color:var(--text-secondary,#c9d1d9);display:block}
      .cal-strip-clock{font-size:.65rem;color:var(--text-muted,#8b949e)}
      .cal-strip-info{flex:1;min-width:0}
      .cal-strip-title{font-size:.78rem;font-weight:600;color:var(--text-primary,#e6edf3);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .cal-strip-room{font-size:.65rem;color:var(--text-muted,#8b949e)}
      .cal-strip-empty{font-size:.76rem;color:var(--text-muted,#8b949e)}
      .cal-link{background:none;border:none;cursor:pointer;color:var(--blue,#58a6ff);font-size:.72rem;padding:0;text-decoration:underline}
      .cal-ics-btn{padding:.2rem .35rem !important;min-height:auto !important}
      /* Modal */
      .cal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:var(--z-modal,1000);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .18s}
      .cal-overlay.open{opacity:1;pointer-events:auto}
      .cal-modal{background:var(--bg-surface,#161b22);border:1px solid var(--border-default,#21262d);border-radius:12px;width:min(480px,94vw);max-height:90vh;overflow-y:auto;transform:scale(.96) translateY(8px);transition:transform .2s var(--ease-out,ease);box-shadow:0 16px 48px rgba(0,0,0,.5)}
      .cal-overlay.open .cal-modal{transform:scale(1) translateY(0)}
      .cal-modal-header{display:flex;align-items:center;justify-content:space-between;padding:.85rem 1rem .7rem;border-bottom:1px solid var(--border-default,#21262d)}
      .cal-modal-title{font-size:.9rem;font-weight:700;color:var(--text-primary,#e6edf3)}
      .cal-modal-close{background:none;border:none;cursor:pointer;color:var(--text-muted,#8b949e);padding:4px;border-radius:4px}
      .cal-modal-close:hover{color:var(--text-primary,#e6edf3)}
      .cal-modal-body{padding:.85rem 1rem;display:flex;flex-direction:column;gap:.65rem}
      .cal-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;padding:.7rem 1rem .85rem;border-top:1px solid var(--border-default,#21262d)}
      .cal-field{display:flex;flex-direction:column;gap:.3rem}
      .cal-field-row{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
      .cal-label{font-size:.72rem;font-weight:600;color:var(--text-secondary,#c9d1d9)}
    `;
    document.head.appendChild(s);
  }

  /* ─── Init (called from router on teams page) ─── */
  function init() {
    _injectStyles();
    /* Find the Teams section and inject the strip */
    const teamsSection = document.getElementById('teams-section');
    if (!teamsSection) return;
    const target = teamsSection.querySelector('.teams-page-wrap, .teams-layout, .teams-wrap, div');
    if (target) renderStrip(target);
    /* Add "Schedule" button to any "Schedule meeting" links in Teams UI */
    document.querySelectorAll('[data-cal-trigger]').forEach(btn => {
      btn.onclick = () => openScheduler({ room: btn.dataset.calRoom || '' });
    });
  }

  return { init, openScheduler, closeScheduler, renderStrip, downloadICS, _saveEvent, _saveAndDownload };
})();
