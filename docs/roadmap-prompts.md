# OmicsLab — Complete Improvement Roadmap
## 40 Prompts across UX/UI · Frontend · Backend MVP · Performance · Accessibility · Mobile

Each prompt is self-contained and executable in order.
Priority tiers: **[P0]** = Critical path · **[P1]** = High value · **[P2]** = Polish · **[P3]** = Future

---

# TIER 1 — DESIGN SYSTEM & FOUNDATION

## Prompt 1 [P0] — Design Token System & Component Library

**Problem:** Buttons, badges, spacing, and colours are defined ad-hoc across 36 CSS files. Changing brand green (#3fb950) requires touching dozens of files. Inconsistent padding on action buttons (some 0.45rem, some 0.6rem).

**Build:** Create `css/tokens.css` as a single source of truth for all design decisions.

```css
:root {
  /* Colour palette */
  --green:      #3fb950;
  --green-dim:  #238636;
  --green-glow: rgba(63,185,80,0.15);
  --blue:       #58a6ff;
  --blue-dim:   rgba(88,166,255,0.12);
  --purple:     #bc8cff;
  --orange:     #f97316;
  --red:        #ff6b6b;
  --yellow:     #e3b341;

  /* Surfaces */
  --bg-base:    #010409;
  --bg-canvas:  #0d1117;
  --bg-surface: #161b22;
  --bg-overlay: #21262d;

  /* Text */
  --text-primary:   #e6edf3;
  --text-secondary: #c9d1d9;
  --text-muted:     #8b949e;
  --text-faint:     #484f58;

  /* Borders */
  --border-default: #21262d;
  --border-muted:   #30363d;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-xl: 14px;
  --radius-pill: 999px;

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Shadows */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.4);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:  0 12px 40px rgba(0,0,0,0.5);
  --shadow-xl:  0 24px 64px rgba(0,0,0,0.6);

  /* Motion */
  --ease-out:  cubic-bezier(0.16,1,0.3,1);
  --duration-fast:   120ms;
  --duration-normal: 200ms;
  --duration-slow:   350ms;
}
```

Create `css/components.css` with reusable atoms:
- `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger` — consistent padding, font-size, border-radius
- `.badge`, `.badge-green`, `.badge-blue`, `.badge-red`, `.badge-yellow`
- `.card` — base card surface with border + border-radius
- `.tag` — small label chip
- `.input`, `.select`, `.textarea` — unified form control
- `.divider` — horizontal rule with optional label
- `.avatar` — initials or image, sizes: sm/md/lg
- `.spinner` — loading indicator
- `.skeleton` — animated loading placeholder

Load `tokens.css` first in `index.html` before all other stylesheets.
Audit each of the 36 CSS files and replace hardcoded hex values with token variables.

---

## Prompt 2 [P0] — Global Notification & Toast System

**Problem:** Every module has its own toast implementation (`_toast()` in voice.js, `_showToast()` in auth.js, inline notifications elsewhere). They have different positions, durations, and styles.

**Build:** `js/notify.js` — a single notification system used by every module.

```javascript
OmicsLab.Notify = {
  // Types: 'success' | 'error' | 'warning' | 'info' | 'loading'
  show(message, type = 'info', options = {}) {
    // options: { duration, actions: [{label, onClick}], id, persist }
  },
  dismiss(id),
  dismissAll(),
  loading(message),     // returns id, auto-switches to success/error
  success(message),
  error(message),
  warning(message),
}
```

Notification stack appears top-right (desktop) / top-centre (mobile).
Each notification: slide-in animation, progress bar for countdown, dismiss X.
`persist: true` keeps it until explicitly dismissed (for errors, warnings).
`actions` array renders inline buttons (e.g. "Undo", "View", "Retry").
Maximum 4 visible at once — oldest auto-dismiss first.
Remove all other toast implementations and replace with `OmicsLab.Notify`.

---

## Prompt 3 [P0] — Global Error Boundary & 404 Handler

**Problem:** If any module throws during `init()`, the whole page silently breaks. No 404 page exists — navigating to `#/invalid` shows a blank screen.

**Build:** Wrap all `navigate()` init calls in try/catch. Create `js/error.js`:

```javascript
OmicsLab.Error = {
  // Shown when a module fails to load
  renderPageError(sectionId, moduleName, err),
  // Shown for unknown routes
  render404(page),
  // Global uncaught error handler
  init(),
}
```

`renderPageError` injects a clean error card into the section with:
- Error title, affected module name
- Sanitised error message (no stack trace in production)
- "Reload page" button
- "Report issue" link (opens GitHub issues with pre-filled title)

`render404` renders a styled "Page not found" view with:
- Large "404" text
- Suggested pages (Home, Lab, Learn, Tools)
- Recent navigation history

In `router.js` `navigate()`: wrap each `OmicsLab.X.init()` call in try/catch, call `OmicsLab.Error.renderPageError()` on failure.
Add `window.onerror` and `window.onunhandledrejection` handlers in `init()`.

---

## Prompt 4 [P1] — Skeleton Loading States

**Problem:** Pages load instantly from localStorage but tools that need heavy JS initialisation (phylo tree, heatmap) show nothing while computing. Users don't know if the page is loading or broken.

**Build:** Add skeleton placeholder HTML to each tool section in `index.html`:

```html
<div class="reveal" id="phylo-section">
  <div class="skeleton-page" id="phylo-skeleton">
    <div class="skeleton-header">
      <div class="sk-line sk-w-40 sk-h-lg"></div>
      <div class="sk-line sk-w-20 sk-h-sm"></div>
    </div>
    <div class="skeleton-two-col">
      <div class="sk-block sk-h-300"></div>
      <div class="sk-block sk-h-300"></div>
    </div>
  </div>
</div>
```

Each module's `init()` hides its skeleton (`#module-skeleton`) and reveals real content.
Add CSS animation: shimmer sweep left→right using `@keyframes sk-shimmer`.
Cover: phylo, heatmap, journalclub, qualitypredictor, variantinterp, primerdesign, paperhub, nexus, teams, datasets, leaderboard, career.

---

## Prompt 5 [P1] — Page Transition System

**Problem:** Navigation between pages is instant but abrupt. There's no visual continuity. The router shows/hides sections with `display: none/''` — no fade, no slide.

**Build:** Replace the current `.page-entering` class approach in `router.js` with a proper transition system:

1. Outgoing page: fade-out + translate(-8px, 0) over 150ms
2. Incoming page: fade-in + translate(0) from translate(8px, 0) over 200ms
3. Use `requestAnimationFrame` scheduling — never use `setTimeout(0)`
4. Respect `prefers-reduced-motion` — skip transform, keep opacity only
5. Track in-flight transitions and cancel if user navigates again mid-animation

Also add a slim progress bar (like GitHub's top bar) that fills 0→100% over the estimated transition time.

```css
.nav-progress-bar {
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  background: var(--green);
  z-index: 9999;
  transition: width var(--duration-normal) var(--ease-out);
  box-shadow: 0 0 8px var(--green);
}
```

---

# TIER 2 — UX / UI IMPROVEMENTS

## Prompt 6 [P0] — Complete Mobile Experience

**Problem:** Mobile nav exists but several pages are not usable on phones. Tool panels use `340px 1fr` grid layouts that collapse badly. The Teams controls bar overflows on small screens.

**Build:**

**Bottom navigation bar** (mobile only, `≤700px`):
```html
<nav class="mob-bottom-nav">
  <!-- Home | Lab | Tools | Research | Profile -->
</nav>
```
5 tabs with SVG icons. Active state: green dot below icon + label. Replaces the hamburger menu on mobile.

**Tool panel mobile layout:** Each `340px 1fr` tool splits into:
- Tab bar at top: "Input" | "Results"
- Active tab controls which panel is visible (not both)
- Touch-friendly: min tap target 48×48px

**Mobile-specific fixes:**
- Nexus: hide sidebar by default; swipe-right opens it (touch events)
- PaperHub: list only, open detail as bottom sheet (slides up)
- Teams meeting: full-screen, camera grid stacks vertically, controls as floating bottom bar
- All modals: slide up from bottom on mobile instead of centred overlay
- Forms: `inputmode="email"`, `inputmode="decimal"` on number fields
- Font sizes: minimum 16px on inputs to prevent iOS zoom

---

## Prompt 7 [P1] — Onboarding Flow

**Problem:** New users land on the home page with no guidance. The tour.js exists but is not triggered on first visit. Users don't know where to start.

**Build:** `js/onboarding.js` — a 5-step progressive onboarding sequence triggered once on first visit (localStorage flag `omicslab_onboarded`):

**Step 1 — Welcome modal:**
- Large hero card: "Welcome to OmicsLab"
- 3 choice cards: "I'm a student" | "I'm a researcher" | "I'm an instructor"
- Selection sets `role` in profile and tailors subsequent steps

**Step 2 — Pick your first workflow:**
- Filtered to role: student → WGS beginner; researcher → analysis tools; instructor → curriculum
- One-click to start, or "Explore on my own"

**Step 3 — Feature spotlight (4 hotspots):**
- Highlight: Lab (animated pulsing ring), Tools, Nexus, Africa Hub
- Click each to get a 1-sentence explainer tooltip
- "Got it" advances

**Step 4 — Create account nudge:**
- If not signed in: "Save your progress across devices — takes 30 seconds"
- Skip or "Create free account" → auth modal

**Step 5 — Start:**
- "You're ready" screen
- Confetti burst (CSS-only canvas-free animation)
- Redirect to chosen starting page

---

## Prompt 8 [P1] — Search Overhaul

**Problem:** `search.js` exists but search is shallow — it only matches page names. Users can't search for a gene name, disease, tool, or paper and find the right section.

**Build:** Full-text indexed search across all content:

**Search index** (built in `js/search.js` at init):
```javascript
const INDEX = [
  { type: 'page',    id: 'variantinterp', title: 'Variant Interpreter', keywords: ['ACMG','gnomAD','ClinVar','VCF','HGVS','sickle cell','HBB'] },
  { type: 'disease', id: 'malaria',       title: 'Plasmodium falciparum — Malaria', keywords: ['kelch13','artemisinin','blood smear','RDT'] },
  { type: 'paper',   id: 'p001',          title: 'African Genome Variation Project', keywords: ['AGVP','H3Africa','population genomics'] },
  { type: 'tool',    id: 'bwa',           title: 'BWA-MEM2', keywords: ['alignment','WGS','SAM','BAM'] },
  // ... 200+ entries
];
```

**Command palette UI** (triggered by `⌘K` / `Ctrl+K`):
- Full-screen backdrop blur overlay
- Top: recent searches (localStorage)
- Results: grouped by type (Pages · Diseases · Tools · Papers · Channels)
- Keyboard: ↑↓ navigate, Enter opens, Esc closes
- Each result shows: icon, title, subtitle (page/section), keyboard hint
- Fuzzy matching: score by token overlap + prefix bonus

---

## Prompt 9 [P1] — Dashboard & Personalised Home

**Problem:** The home page is a static marketing page. Returning signed-in users see the same hero every time with no reflection of their progress, recent activity, or recommendations.

**Build:** When signed in, the home page renders a personalised dashboard *above* the marketing content:

```
┌─────────────────────────────────────────────────┐
│  Good morning, Dr. Amara.  ·  KEMRI · Kenya      │
│  Streak: 12 days ████████████░░░░░░░  60% WGS   │
├─────────────────────────────────────────────────┤
│  Continue where you left off                     │
│  [Variant Interpreter] [Phylo Tree Builder]      │
├─────────────────────────────────────────────────┤
│  Recommended for you              ┌─ Nexus live  │
│  • Paper: AWI-Gen GWAS hits       │ 3 unread     │
│  • Quiz: ACMG criteria challenge  └──────────    │
│  • Tool: Primer Design — new pathogen template   │
├─────────────────────────────────────────────────┤
│  Africa Pulse  (live outbreak feed + 2 items)    │
└─────────────────────────────────────────────────┘
```

**Recommendation engine** (pure JS, no ML):
- Weighted score: tool usage frequency × recency × role match
- "Continue where you left off": last 3 visited pages (router tracks via localStorage)
- "Unread" badge on Nexus in dashboard if new messages since last visit
- Pulse feed: top 2 Outbreak Alerts, injected from `OmicsLab.Alerts`

---

## Prompt 10 [P1] — Settings Page

**Problem:** There is no centralised settings page. Users can't change language, toggle sounds, set notification preferences, manage their data, or clear caches from a single place.

**Build:** Route `#/settings` → `js/settings.js`, `css/settings.css`

**Sections:**

1. **Profile** — name, institution, country, role, avatar (links to auth modal)

2. **Appearance**
   - Theme: Dark (default) | Light | System
   - Accent colour: Green (default) | Blue | Purple | Orange (applies to `--green` token)
   - Font size: Default | Large | X-Large
   - Reduce motion: checkbox (sets `prefers-reduced-motion` override)

3. **Language** — dropdown of 21 locales + English, with flag icons

4. **Notifications**
   - Browser notifications: toggle + "Request permission" button
   - Outbreak alerts: email frequency (none/daily/weekly)
   - Nexus: notify on @mention (toggle)
   - Sound effects: toggle (wires to `OmicsLab.Sound`)

5. **Privacy & Data**
   - "Export all my data" → JSON download of all localStorage keys
   - "Clear learning progress" → confirm → wipes quiz/progress stores
   - "Delete account" → confirm modal → wipes all OmicsLab localStorage

6. **About**
   - App version, cache version, last sync time
   - "Check for updates" → triggers SW check
   - "Install as app" → `beforeinstallprompt` API (PWA install)

---

## Prompt 11 [P2] — Accessibility Audit & Fix

**Problem:** WCAG 2.1 AA compliance is partial. Specific failures:
- Focus rings removed in `app.css` (`outline: none` on buttons)
- Many SVG icons lack `aria-label` or use incorrect `aria-hidden`
- Modal dialogs don't trap focus
- Toast notifications not announced to screen readers
- Colour contrast: `#8b949e` on `#161b22` = 3.7:1 (fails AA for body text)
- `<div>` elements used for interactive buttons in some modules

**Build:**

**Focus system:**
```css
:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

**Focus trap utility** `js/focus-trap.js`:
```javascript
OmicsLab.FocusTrap = {
  activate(container),  // trap Tab/Shift+Tab inside container
  deactivate(),
}
```
Wire to: auth modal, Teams dialog, onboarding modal, search palette.

**Screen reader announcements:**
```javascript
OmicsLab.A11y = {
  announce(msg, politeness = 'polite'), // writes to aria-live region
}
```
Announce: page navigation, toast messages, form errors, quiz results.

**Colour fixes:**
- Muted text on surfaces: use `#a0a8b3` (4.7:1 on `#161b22`)
- All buttons: verify minimum 3:1 contrast ratio
- Links: underline or colour + underline on hover

**Markup fixes:**
- Replace `<div onclick>` with `<button>` throughout
- Add `role="dialog" aria-modal="true" aria-labelledby` to all modals
- Add `aria-live="polite"` region for dynamic announcements
- Add `aria-expanded` to all dropdown triggers
- Ensure all form inputs have associated `<label>`

---

## Prompt 12 [P2] — Print & Export Styles

**Problem:** Researchers need to print QC reports, primer designs, and variant interpretations to share with wet-lab colleagues. Printing any page currently gives a raw dark-background dump.

**Build:** `css/print.css` loaded with `media="print"`:

- White background, black text across all pages
- Hide: nav, sidebars, modals, controls, chat, footer, hero
- Show and expand: tool results panels, tables, charts (as SVG static renders)
- Page breaks: `break-before: page` before each major section
- Footer on each printed page: "OmicsLab · Generated [date] · omicslab.africa"
- Table borders visible in print

**PDF export button** on tool result panels:
- Uses `window.print()` after injecting a `<title>` with the tool name
- Each tool's result section gets class `.print-section` for targeted print CSS
- Tools to cover: QualityPredictor report, VariantInterp verdict, PrimerDesign pair stats, Phylo tree SVG, Heatmap, PeerReview feedback

---

# TIER 3 — NEW FRONTEND FEATURES

## Prompt 13 [P0] — In-App Notification Centre

**Problem:** There is no way for the app to surface time-sensitive information (new papers, outbreak alerts, @mentions in Nexus, badge achievements) without the user actively navigating to each section.

**Build:** `js/notifications.js`, `css/notifications.css`

**Bell icon** in nav (between Search and Sign-In):
```html
<button class="nav-bell" id="nav-bell">
  <svg><!-- bell icon --></svg>
  <span class="nav-bell-count" id="nav-bell-count">0</span>
</button>
```

**Notification panel** (dropdown, 320px wide):
- Groups: Today, This week, Older
- Each notification: icon (type-specific SVG) + title + subtitle + time ago + "Mark read" X
- Types: `outbreak` (red), `nexus_mention` (blue), `badge_earned` (yellow), `paper_added` (purple), `system` (grey)
- "Mark all read" button at top
- "Notification settings" link → `#/settings`

**Generation logic:**
- On `OmicsLab.Alerts.init()`: if new outbreak since last visit → add notification
- On `OmicsLab.Nexus` message containing `@You` → add notification
- On badge earned in any module → add notification
- On new PaperHub paper added → add notification
- Store in localStorage: `omicslab_notifications_v1`

**Browser push** (if permission granted via Settings → Notifications):
- Use `ServiceWorkerRegistration.showNotification()` for outbreak alerts
- Send from SW `push` event handler when backend sends Web Push payload

---

## Prompt 14 [P0] — Offline Indicator & Sync Status

**Problem:** The app is offline-first but users don't know when they're offline or when data will sync. If the network drops mid-meeting in Teams, there's no indicator.

**Build:**

**Offline banner:**
```html
<div class="offline-banner" id="offline-banner" aria-live="assertive">
  <svg><!-- wifi-off icon --></svg>
  You're offline — OmicsLab continues to work. Changes will sync when reconnected.
  <span class="offline-banner-close">×</span>
</div>
```
Shown on `window.addEventListener('offline')`, hidden on `'online'`.
Yellow background, full-width, below nav.

**SW update banner:**
```html
<div class="update-banner" id="update-banner">
  OmicsLab has been updated.
  <button onclick="OmicsLab.SW.reload()">Reload to apply</button>
</div>
```
Shown when SW `SW_UPDATED` message received from service worker.
Green background. "Reload" button triggers `window.location.reload()`.

**Sync status indicator** in nav (small dot):
- Grey dot = offline, syncing paused
- Green pulse = syncing with backend
- Green solid = synced
- Only shown if user is signed in

---

## Prompt 15 [P1] — Calendar & Scheduling for Teams

**Problem:** Teams meeting rooms show "Mondays 10:00 WAT" as static text. There is no way to schedule a meeting, send invites, or see upcoming meetings.

**Build:** `js/calendar.js`, `css/calendar.css`

**Meeting scheduler modal** (opened from Teams room card → "Schedule"):
- Date picker: custom mini-calendar (no external library)
- Time input + timezone selector (list of African timezone codes: WAT, EAT, CAT, SAST)
- Recurring: Once / Daily / Weekly / Custom
- Invite list: type email or name → add chip
- Description + agenda textarea
- "Save to calendar" → creates `omicslab_calendar_v1` localStorage entry
- "Download .ics" → generates RFC 5545 iCalendar file for Google Calendar / Outlook import

**Upcoming meetings strip** on Teams page (top of rooms grid):
```
┌─── Upcoming this week ─────────────────────────────┐
│  Mon 24 Jun · 10:00 WAT  African Genomics Lab     │
│  Fri 28 Jun · 15:00 SAST Journal Club             │
└────────────────────────────────────────────────────┘
```
Clicking a scheduled meeting auto-joins the room and pre-fills the meeting title.

---

## Prompt 16 [P1] — File Attachments in Nexus

**Problem:** Researchers share VCF files, FASTQ QC reports, and images in channels but can only paste text. This breaks the workflow — they have to use external services.

**Build:** Extend `js/nexus.js` with file attachment support:

**Supported types:** Images (PNG, JPG, GIF), Text files (.txt, .csv, .vcf, .fasta, .fastq), PDFs (preview only)

**Attachment flow:**
1. Paperclip button in composer opens file picker
2. File read as base64 DataURL (images) or plain text (text files)
3. Stored in message object: `{ file: { name, type, data, size } }`
4. Size limit: 2MB (soft) with warning; 5MB (hard) rejected

**Rendering:**
- Images: inline thumbnail (max 300×200px), click to open full-size lightbox
- Text/VCF/FASTA: collapsible code block with syntax class, "Copy" button
- PDF: file name + size badge with "Download" button (triggers base64 → Blob → URL download)
- Size warning banner if localStorage usage > 80% of 5MB quota

**Drag-and-drop** onto the chat area → same attachment flow.

---

## Prompt 17 [P1] — Progress Tracker & Learning Path Visualiser

**Problem:** `progress.js` and `badges.js` exist but the Profile page shows a flat list. There is no visual "roadmap" showing where the user is in their learning journey and what to do next.

**Build:** New section on the Profile page: "Learning Path"

**Visual roadmap** (horizontal scroll on desktop, vertical on mobile):
```
[WGS Foundations] ─── [RNA-seq Intermediate] ─── [Variant Calling] ─ [GATK Expert]
       ✓ Complete            ⟳ In progress              ○ Not started      🔒 Locked
```

**Rendered as SVG:** nodes (circles) + connecting lines; green fill = complete, blue pulsing ring = in-progress, grey = locked.

**Each node** on click: expand card showing:
- Module title, description, estimated time
- Pre-requisites (grey nodes with lock if not met)
- Progress bar (X/Y exercises complete)
- "Continue" or "Start" button → navigates to relevant page
- Badges earned in this module

**Completion certificate download:** When all nodes in a track are complete, offer a printable PDF certificate with:
- User name, track name, completion date
- OmicsLab logo, QR code linking to verification URL
- Built with CSS print styles + `window.print()`

---

## Prompt 18 [P2] — Collaborative Whiteboard in Teams

**Problem:** During meetings, researchers need to draw diagrams (phylo trees, experimental designs, pathway maps) together in real-time. The current Teams implementation has only chat.

**Build:** Whiteboard panel (toggle from Teams meeting sidebar):

**Canvas tools:**
- Pen tool (freehand, adjustable stroke width + colour)
- Shapes: rectangle, circle, arrow, line
- Text tool (click to place text box)
- Eraser
- Select + move/resize elements
- Clear canvas button

**Implementation:** HTML5 `<canvas>` element, no external library. All drawing commands stored as JSON objects (`{ tool, points, color, width }`). BroadcastChannel broadcasts each draw event to same-device participants.

**Export:** "Download as PNG" button — `canvas.toDataURL('image/png')`.

**Preloaded templates:**
- Blank
- Experimental design grid
- Phylogenetic tree scaffold
- DNA double helix guide marks

---

## Prompt 19 [P2] — Voice-to-Text in Nexus & Teams Chat

**Problem:** Researchers in the field using mobile devices find it hard to type long messages. Voice input would dramatically improve the mobile experience for Nexus and Teams chat.

**Build:** Add voice compose button to Nexus and Teams chat composers:

```html
<button class="chat-voice-btn" id="chat-voice-btn" title="Speak message">
  <svg><!-- mic icon --></svg>
</button>
```

On click:
1. Requests microphone permission (uses same permission handler from Teams — shows the panel if denied)
2. Shows live transcript in the input field as user speaks (interim results)
3. On silence (1.5s) or "stop" button: finalises transcript in text area
4. User can edit before sending

Uses `OmicsLab.Voice`'s existing `_buildRecognition()` infrastructure — reuse `SpeechRecognition` setup.
Language follows current `OmicsLab.i18n` locale.

---

## Prompt 20 [P2] — Dark / Light / System Theme Toggle

**Problem:** The app is dark-only. Many users in bright labs or those with visual sensitivities need a light theme. Several African universities have strict IT policies that default to light-mode browsers.

**Build:**

**Light theme:** Add `[data-theme="light"]` attribute variants for all CSS token values:
```css
[data-theme="light"] {
  --bg-base:    #ffffff;
  --bg-canvas:  #f6f8fa;
  --bg-surface: #ffffff;
  --bg-overlay: #f1f3f5;
  --text-primary:   #24292f;
  --text-secondary: #57606a;
  --text-muted:     #6e7781;
  --border-default: #d0d7de;
  --border-muted:   #e1e4e8;
}
```

**Theme application:** `document.documentElement.dataset.theme = 'light'|'dark'`.

**System detection:** `window.matchMedia('(prefers-color-scheme: dark)')` on init.

**Persistence:** `localStorage.omicslab_theme` → 'dark' | 'light' | 'system'.

**Toggle:** In Settings (Prompt 10) AND a quick-access icon in nav (sun/moon SVG).

**Nav item:** Replace no-op space in nav-actions with `<button class="theme-toggle">` between search and bell.

**Audit:** Every hardcoded `#0d1117`, `#161b22`, `#e6edf3` in 36 CSS files replaced with token variables so theme switching works across all modules.

---

# TIER 4 — BACKEND MVP

## Prompt 21 [P0] — Backend Project Scaffold

**Build:** Node.js + Express backend at `backend/` directory:

```
backend/
├── src/
│   ├── server.js          # Express app factory
│   ├── config.js          # Env vars validation (zod)
│   ├── db/
│   │   ├── client.js      # postgres (pg) pool
│   │   ├── migrate.js     # Run migrations on startup
│   │   └── migrations/    # 001_users.sql, 002_rooms.sql …
│   ├── middleware/
│   │   ├── auth.js        # JWT verification → req.user
│   │   ├── rateLimit.js   # express-rate-limit
│   │   ├── validate.js    # Zod schema validation factory
│   │   └── errors.js      # Error handler middleware
│   ├── routes/
│   │   ├── auth.js        # /auth/* endpoints
│   │   ├── teams.js       # /teams/* + WS upgrade
│   │   └── sync.js        # /sync/* endpoints
│   └── services/
│       ├── authService.js
│       ├── oauthService.js
│       ├── tokenService.js
│       └── storageService.js
├── .env.example
├── Dockerfile
├── docker-compose.yml     # app + postgres + redis
└── package.json
```

**Core dependencies:**
- `express`, `helmet`, `cors`, `compression`
- `pg` (postgres), `redis` (ioredis)
- `bcryptjs` (password hashing)
- `jsonwebtoken` (JWT RS256)
- `zod` (validation)
- `express-rate-limit`, `express-validator`
- `multer` + `@aws-sdk/client-s3` (avatar uploads)
- `ws` (WebSocket)

**docker-compose.yml:** postgres 16, redis 7, app service with health checks.

---

## Prompt 22 [P0] — Auth API Implementation

Implement all endpoints from `docs/backend-api.md`:

**`POST /auth/register`**
- Zod validation: name (2-120), email (valid + lowercase), password (10+ chars)
- `bcrypt.hash(password, 12)`
- INSERT into `users`, return JWT + user object
- Send welcome email via Resend (template: welcome.html)
- Rate limit: 3 registrations per IP per hour

**`POST /auth/signin`**
- Constant-time password comparison (`bcrypt.compare`)
- On failure: increment `login_attempts` counter in Redis; lock after 5 failures for 15min
- On success: reset counter, return JWT (24h) + refresh token (30d) in httpOnly cookie

**`POST /auth/oauth/:provider`**
- Exchange code → access token (fetch to provider token endpoint)
- Fetch user profile from provider API
- Upsert user (find by provider_id or email)
- Return same JWT shape

**`POST /auth/refresh`**
- Validate refresh token from httpOnly cookie
- Issue new JWT + rotate refresh token (old one invalidated in Redis blocklist)

**`GET /auth/me`** *(JWT protected)*
**`PATCH /auth/me`** *(JWT protected)* — handle avatar upload → R2 upload → return CDN URL
**`POST /auth/me/change-password`** *(JWT protected)*
**`POST /auth/link/:provider`** *(JWT protected)*
**`DELETE /auth/link/:provider`** *(JWT protected)*

All endpoints: structured JSON error responses `{ error: { code, message, field? } }`.

---

## Prompt 23 [P0] — WebSocket Signaling Server for Teams

**Build:** WebSocket server at `wss://api.omicslab.africa/v1/teams/signal`

**Connection:** `GET /teams/signal?room=<roomId>&token=<jwt>` — upgrade to WS
- Validate JWT before upgrade (401 if invalid)
- Assign `sessionId` (uuid)
- Add to in-memory room map `rooms[roomId].add(session)`

**Relay pattern:** Server does NOT inspect SDP/ICE — it only routes `to` messages to the correct peer session.

**Room management:**
- `JOIN`: broadcast `PEER_JOINED` to all existing peers; send `WELCOME` with peer list to joiner
- `LEAVE` / connection close: broadcast `PEER_LEFT`, clean up room map
- `OFFER`, `ANSWER`, `ICE`: relay to `to` session only

**Heartbeat:** server sends `PING` every 30s; client must respond with `PONG` within 10s or session is dropped.

**Persistence:** Room metadata (name, locked) read from PostgreSQL. Participant counts stored in Redis (TTL = 1h, reset on last peer leave).

**Scale note:** For multi-server deployment, replace in-memory room map with Redis Pub/Sub — subscribe to room channel, publish relay messages.

---

## Prompt 24 [P0] — Database Migrations System

**Build:** `backend/src/db/migrate.js` — runs SQL files in order on startup:

```
migrations/
  001_users.sql
  002_linked_accounts.sql
  003_meeting_rooms.sql
  004_sync_store.sql
  005_notifications.sql
  006_calendar_events.sql
  007_audit_log.sql
```

Each migration file: pure SQL, idempotent (`IF NOT EXISTS`).
Migration table `_migrations(id, name, applied_at)` tracks what has run.
`migrate.js` reads directory, sorts by prefix number, skips already-applied.
Runs automatically on `server.js` startup before accepting connections.

**Rollback:** Each migration has a companion `001_users.down.sql` for rollback in development. Never run `.down` in production automatically.

**`007_audit_log.sql`:**
```sql
CREATE TABLE audit_log (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT REFERENCES users(id),
  action      TEXT NOT NULL,  -- 'password_change' | 'account_link' | 'account_delete'
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## Prompt 25 [P1] — Email System & Templates

**Build:** `backend/src/services/emailService.js` using Resend SDK:

**Email templates** (HTML + text, stored in `backend/src/emails/`):

1. **welcome.html** — Welcome to OmicsLab
   - User's name, institution
   - 3 quick-start cards (Lab, Learn, Tools)
   - "Set up your profile" CTA

2. **verify-email.html** — Confirm your email address
   - 6-digit OTP (not a link) — valid 10 minutes
   - "Didn't sign up?" footer

3. **password-reset.html** — Reset your password
   - Reset link (24h expiry, one-time-use token in Redis)
   - Security notice: "If you didn't request this, ignore this email"

4. **outbreak-alert.html** — Weekly Africa Outbreak Digest
   - Top 3 active outbreaks from alerts data
   - "Genomic readiness score" for each
   - Unsubscribe link (one-click, no login required)

5. **badge-earned.html** — You earned a badge
   - Badge SVG image + name + description
   - "Share on LinkedIn" link (pre-filled post text)

**`POST /auth/verify-email`** endpoint: accepts OTP, marks user.email_verified = true.
Send OTP on registration; resend endpoint `POST /auth/resend-verification`.

---

## Prompt 26 [P1] — Rate Limiting & Security Hardening

**Build:** Production-ready security layer:

**Helmet.js** configuration:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://avatars.omicslab.africa"],
      connectSrc: ["'self'", "wss://api.omicslab.africa"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
```

**Rate limiting** (express-rate-limit + Redis store):
- `/auth/signin`: 5 req / 15 min / IP
- `/auth/register`: 3 req / 1 hour / IP
- `/auth/oauth/*`: 10 req / 1 min / IP
- `/auth/resend-verification`: 2 req / 10 min / IP
- Global: 200 req / 1 min / IP (all routes)

**CORS**: exact origin whitelist `['https://simon-mufara.github.io']` (add localhost for dev).

**Input sanitisation**: `xss` library on all `text` fields before database insert.

**SQL injection**: all queries use parameterised `pg.query('SELECT * FROM users WHERE id = $1', [id])`.

**Secret scanning**: `npm audit`, `dotenv-linter`, GitHub secret scanning enabled on repo.

---

## Prompt 27 [P1] — Analytics & Usage Tracking (Privacy-First)

**Problem:** No visibility into which tools are used, where users drop off in onboarding, or which African countries have the most active users. Without this, it's impossible to prioritise improvements.

**Build:** Self-hosted, privacy-first analytics — **no cookies, no personal data**:

**`backend/src/routes/analytics.js`:**

`POST /analytics/event` — accepts:
```json
{
  "event": "page_view",
  "page": "variantinterp",
  "country": "ZA",          // from CF-IPCountry header or GeoIP lookup
  "sessionId": "anon_hash", // SHA256(IP + UserAgent) — no reverse lookup possible
  "duration": 42,
  "props": { "tool_used": true }
}
```

Store in `analytics_events` table. Aggregate hourly via cron job into `analytics_daily` summary table.

**Dashboard** `GET /analytics/summary` *(admin JWT only)*:
```json
{
  "activeUsers7d": 342,
  "topPages": [{"page":"variantinterp","views":1240}, ...],
  "topCountries": [{"country":"ZA","users":89}, ...],
  "toolUsageByDay": { "2024-06-01": 230, ... }
}
```

**Frontend instrumentation** `js/analytics.js`:
- Fire `page_view` on every `navigate()` call
- Fire `tool_used` when a tool runs its analysis function
- Fire `quiz_completed`, `badge_earned`, `meeting_joined`
- No personal data, no fingerprinting beyond anonymised session hash
- `fetch('/analytics/event', ...)` with `navigator.sendBeacon()` on page unload

---

## Prompt 28 [P1] — CI/CD Pipeline & Deployment

**Build:** GitHub Actions workflows:

**`.github/workflows/backend-ci.yml`:**
1. `npm ci` — install deps
2. `npm run lint` — ESLint (airbnb-base config)
3. `npm test` — Jest unit tests (auth service, token service, validation)
4. `docker build` — ensure Dockerfile builds
5. Deploy to Railway on push to `main` (Railway GitHub integration)

**`.github/workflows/frontend-ci.yml`:**
1. HTML validation: `html-validator-cli index.html`
2. CSS lint: `stylelint css/*.css`
3. Link check: `lychee --offline` on all `href` values
4. Lighthouse CI: `@lhci/cli` — fail if Performance < 80, Accessibility < 90
5. Auto-deploy: GitHub Pages deploys automatically on push to `main`

**Environments:** `dev` (Railway preview deploys per PR), `prod` (Railway production).

**Secrets management:** GitHub Actions secrets for `DATABASE_URL`, `JWT_PRIVATE_KEY`, OAuth secrets. Never in code.

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
EXPOSE 3001
CMD ["node", "src/server.js"]
```

---

# TIER 5 — PERFORMANCE & PWA

## Prompt 29 [P0] — Reduce index.html & Module Load Time

**Problem:** `index.html` is 1775 lines and loads 60+ `<script>` tags synchronously. On a slow 3G connection (common in rural Africa), this blocks rendering for ~8 seconds.

**Build:**

**Module bundling:** Without a build step, use ES modules with dynamic import:
```html
<script type="module" src="js/main.js"></script>
```

`js/main.js`:
```javascript
import './icons.js';
import './auth.js';
import './router.js';
import './app.js';

// Lazy-load heavy modules only when route is first visited
OmicsLab.Router.onNavigate('variantinterp', () => import('./variantinterp.js'));
OmicsLab.Router.onNavigate('phylo',         () => import('./phylo.js'));
OmicsLab.Router.onNavigate('heatmap',       () => import('./heatmap.js'));
// ... etc for all 40+ non-critical modules
```

This splits one 60-file synchronous load into: immediate bundle (~8 files) + deferred loads on navigation. First-page load drops from 60 HTTP requests to 8.

**Critical CSS:** Move the 200 lines of above-the-fold CSS (nav, hero, stats strip) into `<style>` in `<head>`. Load non-critical CSS with `media="print" onload="this.media='all'"` pattern.

**Resource hints:**
```html
<link rel="preload" href="js/icons.js" as="script">
<link rel="preload" href="css/tokens.css" as="style">
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
```

**Target:** Lighthouse Performance score ≥ 85 on 3G emulation.

---

## Prompt 30 [P1] — Service Worker Cache Strategy Overhaul

**Problem:** Current SW (`sw.js`) uses "network first, cache fallback" for everything. This means a slow network makes the app slow even for cached content. The cache version bump strategy also forces re-downloading everything on any update.

**Build:** Rewrite `sw.js` with Workbox-style strategies (implemented manually — no library):

**Strategy per resource type:**
- `css/`, `js/`: **Stale-While-Revalidate** — serve cache instantly, refresh in background
- `index.html`: **Network-First** with 3s timeout — fall back to cache if network slow
- API calls `/auth/*`, `/analytics/*`: **Network-Only** — never cache auth data
- Google Fonts: **Cache-First** with 365-day expiry — fonts never change
- `manifest.json`: **Cache-First** with 24-hour expiry

**Versioned caches:**
```javascript
const CACHES = {
  static:  'ol-static-v1',   // cleared only when static files change
  pages:   'ol-pages-v1',    // index.html
  fonts:   'ol-fonts-v1',    // Google Fonts — long-lived
};
```

**Background sync:** Register a sync event for analytics events sent while offline:
```javascript
self.addEventListener('sync', e => {
  if (e.tag === 'analytics-flush') e.waitUntil(flushAnalyticsQueue());
});
```

**Periodic background sync** (where supported): check for outbreak alerts every 4 hours.

---

## Prompt 31 [P2] — PWA Install & Native Features

**Build:** Full PWA native experience:

**Install prompt** (Settings page + home page banner):
```javascript
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  document.getElementById('install-banner')?.style.removeProperty('display');
});
```
Install banner: "Add OmicsLab to your home screen for the full offline experience."

**App shortcuts** (in `manifest.json`):
```json
"shortcuts": [
  { "name": "Lab",        "url": "/Omics-Lab/#/lab",    "icons": [...] },
  { "name": "Nexus",      "url": "/Omics-Lab/#/nexus",  "icons": [...] },
  { "name": "Alerts",     "url": "/Omics-Lab/#/alerts", "icons": [...] }
]
```
Long-press on home screen icon → context menu with shortcuts.

**Share target** (add to manifest):
```json
"share_target": {
  "action": "/Omics-Lab/#/share",
  "method": "GET",
  "params": { "title": "title", "text": "text", "url": "url" }
}
```
Enables: "Share with OmicsLab" from Android share sheet → opens Nexus composer pre-filled with shared content.

**Web Share API** — "Share" button on tool result pages:
```javascript
navigator.share({ title, text, url: location.href });
```

**Badging API** — unread notification count on app icon:
```javascript
navigator.setAppBadge(unreadCount);
```

---

## Prompt 32 [P2] — Internationalisation Completion

**Problem:** 21 locale files exist (`js/locales/`) but only ~30% of UI strings are translated. Key UI elements (nav, auth, Teams, Nexus) are English-only.

**Build:**

**String extraction:** Audit all 70 JS files and `index.html`. Create a canonical `js/locales/en.js` with every UI string (estimated 400+ strings). Format:
```javascript
window.OmicsLab_Locale_en = {
  'auth.signin.title':    'Sign in',
  'auth.register.email':  'Email address',
  'teams.join':           'Join room',
  'nexus.send':           'Send message',
  // ...
};
```

**Translation function:**
```javascript
OmicsLab.i18n.t('auth.signin.title') // → 'Sign in' or translated string
```

**Priority locales** (largest OmicsLab user bases): Swahili (sw), French (fr), Arabic (ar), Zulu (zu), Yoruba (yo), Amharic (am).

**RTL support** for Arabic:
- `document.dir = 'rtl'` when Arabic locale selected
- CSS logical properties (`margin-inline-start` instead of `margin-left`)
- RTL-aware flexbox and grid layouts

**Language detection:** Auto-detect from `navigator.language`, fall back to `localStorage.omicslab_lang`, fall back to `'en'`.

---

# TIER 6 — QUALITY & TESTING

## Prompt 33 [P0] — Frontend Unit & Integration Tests

**Build:** Test suite using Vitest + jsdom (no build step required — run via `npx vitest`):

**Test files** (`tests/` directory):

`tests/auth.test.js`:
- Register with valid data → returns user object
- Register with duplicate email → returns error
- Sign in with correct credentials → returns JWT
- Sign in with wrong password → returns 401
- OAuth state: signed-in user shows in nav

`tests/qualitypredictor.test.js`:
- WGS preset → PASS result
- Poor sample preset → FAIL result
- Individual metric thresholds (ratio260_280 < 1.7 → fail)

`tests/variantinterp.test.js`:
- HBB sickle cell variant → Pathogenic classification
- Known benign variant → Benign classification
- Invalid VCF input → graceful error, not crash

`tests/router.test.js`:
- navigate('lab') → shows chooser, hides sections
- navigate('invalid') → renders 404
- navigate('variantinterp') → shows variantinterp-section, hides others

`tests/primerdesign.test.js`:
- Valid template → returns 3 primer pairs
- GC% calculation on known sequence
- Tm calculation (Wallace rule) spot-checks

**Coverage target:** ≥ 80% for auth.js, qualitypredictor.js, variantinterp.js, primerdesign.js, router.js.

---

## Prompt 34 [P1] — Backend Integration Tests

**Build:** Test suite for the backend API using Jest + Supertest + test database:

`backend/tests/auth.integration.test.js`:
- POST /auth/register → 201 with user + JWT
- POST /auth/register (duplicate email) → 409
- POST /auth/signin (valid) → 200
- POST /auth/signin (wrong password) → 401
- POST /auth/signin (5× fail) → 429
- GET /auth/me (with valid JWT) → 200 with user
- GET /auth/me (no JWT) → 401
- PATCH /auth/me → updates name, returns updated user
- POST /auth/me/change-password → 204
- POST /auth/link/github (with mock provider) → 200
- DELETE /auth/link/github → 204

**Test database:** spin up a real PostgreSQL in Docker (testcontainers-node), run migrations, seed test users, teardown after suite.

**Mock OAuth providers:** `nock` intercepts GitHub/Google/LinkedIn HTTP requests; return fixture responses.

**CI gate:** Tests must pass before any deploy (see Prompt 28).

---

## Prompt 35 [P2] — End-to-End Tests

**Build:** Playwright E2E test suite (`e2e/` directory):

`e2e/auth.spec.js`:
- Open app → click "Sign in" → modal opens
- Fill in register form → submit → modal closes, nav shows name
- Reload → session persisted, still signed in
- Account settings → change name → saved

`e2e/variantinterp.spec.js`:
- Navigate to Variant Interpreter
- Click "Load HBB sickle cell example"
- Click "Interpret Variant"
- Verdict banner shows "Pathogenic"
- ACMG criteria chips visible

`e2e/teams.spec.js`:
- Navigate to Teams
- Click "Join room" on first room
- Mic permission dialog appears (Playwright grants it automatically)
- Meeting view renders with local video tile
- Type in chat → message appears
- Click Leave → returns to rooms

`e2e/nexus.spec.js`:
- Navigate to Nexus
- Click #wgs-genomics channel
- Type a message → Enter → message appears in list
- Switch to #general → switch back → message still there

Run on Chromium + Firefox + Mobile Safari (Playwright built-in devices).
Run nightly via GitHub Actions cron.

---

# TIER 7 — ADVANCED FEATURES

## Prompt 36 [P1] — AI Research Assistant Integration

**Build:** `js/assistant.js` — a floating AI assistant panel integrated with Claude API via the backend:

**UI:** Floating button bottom-right (separate from voice control). Opens a 360px wide side panel:
- Chat interface (same design language as Nexus)
- Suggested prompts contextual to current page:
  - On `/variantinterp`: "Explain the ACMG criteria shown above"
  - On `/phylo`: "What does this tree topology tell me?"
  - On `/paperhub`: "Summarise this paper in 3 bullet points"

**Backend endpoint** `POST /ai/chat`:
```json
{
  "message": "Explain ACMG PVS1 criteria",
  "context": { "page": "variantinterp", "variant": "HBB c.20A>T" }
}
```
Streams response via Server-Sent Events (`text/event-stream`).

**Offline fallback:** `OmicsLab.Mentor` serves pre-written answers when offline.

**Rate limit:** 20 AI requests per user per day (free tier). Display remaining count.

**Privacy:** No conversation history stored on backend — each request is stateless. User can clear local chat history.

---

## Prompt 37 [P1] — Genomics Data Import & FASTQ Analysis

**Problem:** Users can't bring their own data. All analysis uses built-in examples. Real researchers have FASTQ files, VCF files, and CSV expression matrices they need to visualise.

**Build:** File import system for the Analysis section:

**Supported inputs:**
- FASTQ/FASTA: parse first 1000 reads, compute QC metrics (read length distribution, per-base quality, adapter contamination estimate)
- VCF: parse up to 10,000 variants, route to Variant Interpreter in batch mode
- CSV/TSV: detect expression matrix format (genes × samples), route to Heatmap/Volcano

**Parser modules** (pure JS, no server needed):
- `js/parsers/fastq-parser.js`: PHRED score decoding, per-base quality
- `js/parsers/vcf-parser.js`: VCF v4.2 INFO/FORMAT parsing
- `js/parsers/matrix-parser.js`: TSV/CSV with header detection

**File size limits:** 10MB max (browser processing). Warn at 5MB.

**Processing in Web Worker** (separate thread to avoid UI freeze):
```javascript
const worker = new Worker('./js/parsers/worker.js');
worker.postMessage({ type: 'PARSE_FASTQ', data: fileText });
worker.onmessage = e => renderQCReport(e.data);
```

**Progress bar** during parsing. "Analysis complete" → route user to relevant tool with pre-filled results.

---

## Prompt 38 [P2] — Africa Genomics Knowledge Graph

**Build:** Interactive graph visualisation (`js/knowledge-graph.js`) at route `#/knowledge-graph`:

**Graph data** (hardcoded JSON, no server):
- ~200 nodes: diseases, genes, variants, tools, organisms, interventions, African populations
- ~400 edges: "is_associated_with", "is_treated_by", "is_caused_by", "is_prevalent_in", "is_detected_by"

**Node types & colours:**
- Disease (red): Malaria, TB, Sickle Cell, HIV, Ebola, Monkeypox
- Gene (green): HBB, G6PD, APOL1, kelch13, rpoB, HLA-B
- Tool (blue): GATK, BWA, DESeq2, Kraken2, IQ-TREE
- Population (orange): Yoruba, Bantu, Nilotic, Berber, Khoisan
- Country (purple): Nigeria, Kenya, South Africa, Ethiopia, DRC

**Rendering:** Force-directed layout using D3-force algorithm (implement manually — no CDN). SVG canvas with zoom+pan.

**Interactions:**
- Click node: expand sidebar with node details, linked papers (from PaperHub), related OmicsLab tools
- Double-click: expand 1 hop of neighbours
- Search nodes: filter with highlight
- "Find path" between two nodes: BFS shortest path, highlighted in red

**Export:** SVG download, JSON (selected subgraph) download.

---

## Prompt 39 [P2] — Research Output Tracker

**Build:** `js/output-tracker.js`, route `#/outputs`

Allow researchers to log and track their research outputs directly attributed to OmicsLab training:

**Output types:**
- Publication (journal article, preprint, conference paper)
- Grant awarded
- Dataset deposited (NCBI SRA, EBI ENA)
- Training event delivered
- Student supervised
- Policy brief submitted

**Log form:**
- Title, type, date, journal/funder/repository
- DOI/URL (auto-fetches metadata from Crossref API if online)
- "OmicsLab contributed to this by…" — text field
- Impact: countries affected, number of beneficiaries

**Impact dashboard:**
```
┌───────────────────────────────────────────┐
│  Your OmicsLab Impact                     │
│  3 papers · 1 grant · 2 datasets · 5 students│
│                                           │
│  H-index trajectory ▓▓▓▓▓░░░░             │
│  Countries reached: 🇳🇬 🇿🇦 🇰🇪 🇬🇭 🇪🇹       │
└───────────────────────────────────────────┘
```

**Export to PDF** (using print CSS) — "OmicsLab Impact Report" formatted document.

Aggregate (anonymised) data sent to backend analytics: total publications attributed to OmicsLab platform globally.

---

## Prompt 40 [P0] — Production Readiness Checklist

Before going live at `omicslab.africa`, verify and fix all of:

**Security:**
- [ ] All secrets in environment variables (never in code)
- [ ] HTTPS enforced (HSTS header)
- [ ] CSP headers preventing XSS
- [ ] OAuth state parameter validated (CSRF)
- [ ] Input validation on every endpoint
- [ ] Rate limiting on auth endpoints
- [ ] Password hashed with bcrypt (cost ≥ 12)
- [ ] JWT uses RS256 (asymmetric keys)
- [ ] DB connection via SSL (`ssl: { rejectUnauthorized: true }`)

**Performance:**
- [ ] Lighthouse score ≥ 85 Performance on mobile 3G
- [ ] Lighthouse score ≥ 90 Accessibility
- [ ] First Contentful Paint ≤ 2.5s on 3G
- [ ] All images have `width`/`height` attributes (prevent layout shift)

**Reliability:**
- [ ] Backend has health endpoint `GET /health` returning `{ status: 'ok' }`
- [ ] Process manager (Railway handles this)
- [ ] DB connection pool sized for expected load
- [ ] Error monitoring (Sentry free tier — `Sentry.init({ dsn })` in both frontend and backend)

**Legal & Ethics:**
- [ ] Privacy Policy page at `#/privacy` (explains data storage, no third-party selling)
- [ ] Terms of Use page at `#/terms`
- [ ] Cookie consent banner (only if cookies added — current app uses none)
- [ ] GDPR "Delete all my data" path works end-to-end

**SEO:**
- [ ] Each route updates `<title>` and `<meta name="description">` dynamically
- [ ] `sitemap.xml` lists all routes
- [ ] `robots.txt` allows all crawlers
- [ ] Open Graph `og:image` renders correctly (test with Social Share Preview tool)

**Monitoring:**
- [ ] Uptime monitoring (UptimeRobot free tier — alert on 5-minute downtime)
- [ ] Error rate alert (Sentry → Slack webhook)
- [ ] DB disk usage alert (Railway dashboard threshold)

---

## Execution Order

**Month 1 (Foundation):** Prompts 1, 2, 3, 4, 5, 21, 22, 29
**Month 2 (UX + Backend):** Prompts 6, 7, 8, 10, 23, 24, 25, 26, 30
**Month 3 (Features):** Prompts 9, 11, 13, 14, 15, 27, 28, 31, 33
**Month 4 (Polish + Mobile):** Prompts 12, 16, 17, 18, 19, 20, 32, 34, 35
**Month 5+ (Advanced):** Prompts 36, 37, 38, 39, 40
