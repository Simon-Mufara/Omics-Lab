# OmicsLab Backend API Specification

This document defines every backend endpoint the OmicsLab frontend expects.
Implement this API to enable OAuth social login, cross-device sessions,
meeting signaling, and cloud data sync. Without the backend, the app
runs fully offline using `localStorage` for email/password auth only.

---

## Stack Recommendation

| Layer | Recommended | Alternatives |
|---|---|---|
| Runtime | Node.js 20 / Bun | Python (FastAPI), Go |
| Framework | Express + Helmet | Fastify, Hono |
| Database | PostgreSQL 16 | MySQL 8, SQLite (dev only) |
| Auth tokens | JWT (RS256, 24h TTL) | Paseto |
| OAuth state | Redis (15min TTL) | In-memory (single process) |
| Real-time | WebSocket (ws) | Socket.io, Bun WS |
| Object storage | Cloudflare R2 / S3 | Local disk (dev only) |
| Email | Resend / SendGrid | SMTP |
| Hosting | Railway / Fly.io | AWS, GCP, Azure |

Base URL: `https://api.omicslab.africa/v1`  
Set `OmicsLab.Auth.CFG.API_BASE` in `js/auth.js` to this URL.

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

JWT payload:
```json
{
  "sub": "user_id",
  "email": "user@institution.ac.za",
  "iat": 1718000000,
  "exp": 1718086400
}
```

---

## 1. User Registration

### `POST /auth/register`

Creates a new account with email and password.

**Request body:**
```json
{
  "name": "Dr. Amara Osei",
  "email": "amara.osei@kemri.go.ke",
  "password": "StrongPassword123",
  "institution": "KEMRI",
  "country": "Kenya",
  "role": "researcher"
}
```

**Validation rules:**
- `name`: 2–120 characters, required
- `email`: valid RFC 5322, unique in database, required
- `password`: minimum 10 characters, required (hash with bcrypt cost ≥ 12)
- `institution`, `country`, `role`: optional strings

**Success response `201`:**
```json
{
  "user": {
    "id": "usr_01jab3k...",
    "name": "Dr. Amara Osei",
    "email": "amara.osei@kemri.go.ke",
    "institution": "KEMRI",
    "country": "Kenya",
    "role": "researcher",
    "avatar": null,
    "linkedAccounts": {},
    "badges": [],
    "createdAt": 1718000000000
  },
  "token": "<jwt>",
  "expiresAt": 1718086400000
}
```

**Error responses:**
- `400` — missing or invalid fields
- `409` — email already registered

---

## 2. Sign In (Email + Password)

### `POST /auth/signin`

**Request body:**
```json
{
  "email": "amara.osei@kemri.go.ke",
  "password": "StrongPassword123"
}
```

**Success response `200`:** same shape as `/auth/register`

**Error responses:**
- `401` — invalid credentials (do NOT distinguish wrong email vs wrong password)
- `429` — rate limited (5 failed attempts → 15 min lockout)

---

## 3. OAuth — Social Sign-In

The frontend redirects the user's browser to the provider's OAuth URL.
The provider redirects back to the frontend with `?code=...`.
The frontend then sends the code to this endpoint.

### `POST /auth/oauth/:provider`

`:provider` is one of: `github` | `google` | `linkedin`

**Request body:**
```json
{
  "code": "abc123xyz",
  "redirectUri": "https://simon-mufara.github.io/Omics-Lab/#/auth/callback/github"
}
```

**Server must:**
1. Exchange `code` for access token using provider's token endpoint
2. Fetch user profile from provider's API
3. Look up existing user by provider email or provider user ID
4. Create account if new, otherwise return existing account
5. Merge `linkedAccounts` if user already exists with a different auth method
6. Return JWT

**Success response `200`:** same shape as `/auth/register`

**Error responses:**
- `400` — invalid or expired code
- `502` — provider API unreachable

### Provider OAuth App Setup

**GitHub:**
1. Go to https://github.com/settings/developers → New OAuth App
2. Homepage URL: `https://simon-mufara.github.io/Omics-Lab/`
3. Callback URL: `https://simon-mufara.github.io/Omics-Lab/#/auth/callback/github`
4. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in server env
5. Token exchange: `POST https://github.com/login/oauth/access_token`
6. User profile: `GET https://api.github.com/user`
7. User email: `GET https://api.github.com/user/emails` (if not public)

**Google:**
1. Go to https://console.cloud.google.com → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID → Web application
3. Authorized redirect: `https://simon-mufara.github.io/Omics-Lab/#/auth/callback/google`
4. Token exchange: `POST https://oauth2.googleapis.com/token`
5. User profile: `GET https://www.googleapis.com/oauth2/v2/userinfo`

**LinkedIn:**
1. Go to https://developer.linkedin.com → Create App
2. Redirect URL: `https://simon-mufara.github.io/Omics-Lab/#/auth/callback/linkedin`
3. Token exchange: `POST https://www.linkedin.com/oauth/v2/accessToken`
4. Profile: `GET https://api.linkedin.com/v2/me`
5. Email: `GET https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))`

---

## 4. Session Refresh

### `POST /auth/refresh`

Extends an expiring JWT without requiring re-login.

**Request body:**
```json
{ "token": "<existing_jwt>" }
```

**Success `200`:**
```json
{ "token": "<new_jwt>", "expiresAt": 1718172800000 }
```

**Error `401`:** token invalid or already expired

---

## 5. User Profile

### `GET /auth/me` *(protected)*

Returns the current user's full profile.

**Success `200`:** returns `user` object (same shape as register response)

### `PATCH /auth/me` *(protected)*

Update profile fields.

**Request body (all fields optional):**
```json
{
  "name": "Dr. Amara Osei-Bonsu",
  "institution": "KEMRI-Wellcome Trust",
  "country": "Kenya",
  "role": "researcher",
  "avatar": "data:image/jpeg;base64,/9j/..."
}
```

Avatar: accept base64 data URI, decode and store to object storage (R2/S3),
replace `avatar` field with the public CDN URL before saving.

**Success `200`:** returns updated `user` object

### `POST /auth/me/change-password` *(protected)*

**Request body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Success `204`:** no body
**Error `401`:** wrong current password

---

## 6. Account Linking

### `POST /auth/link/:provider` *(protected)*

Links a social provider to an existing account.
Use the same OAuth flow as `/auth/oauth/:provider` but attach to the
authenticated user instead of creating a new account.

**Request body:**
```json
{
  "code": "...",
  "redirectUri": "..."
}
```

**Success `200`:**
```json
{
  "linkedAccounts": {
    "github": { "id": "12345", "username": "amara-osei" },
    "google": null,
    "linkedin": null
  }
}
```

**Error `409`:** provider account already linked to a different user

### `DELETE /auth/link/:provider` *(protected)*

Unlinks a social provider. Only allowed if the user has a password set
or at least one other linked provider (must not lock themselves out).

**Success `204`:** no body
**Error `400`:** cannot unlink last auth method (no password set)

---

## 7. Teams — WebSocket Signaling

For cross-device video meetings, clients connect to the signaling server
via WebSocket. Same-device meetings work without this via BroadcastChannel.

### `GET /teams/signal` → WebSocket upgrade

Connection URL: `wss://api.omicslab.africa/v1/teams/signal?room=<roomId>&token=<jwt>`

The server validates the JWT before upgrading the connection.

**Messages (JSON frames):**

Client → Server:
```json
// Join a room
{ "type": "JOIN", "room": "rm-genomics", "name": "Dr. Amara Osei" }

// WebRTC offer (sent to all peers in room)
{ "type": "OFFER", "to": "peer_session_id", "sdp": "<SDP offer string>" }

// WebRTC answer
{ "type": "ANSWER", "to": "peer_session_id", "sdp": "<SDP answer string>" }

// ICE candidate
{ "type": "ICE", "to": "peer_session_id", "candidate": { ... } }

// Leave
{ "type": "LEAVE" }
```

Server → Client:
```json
// Welcome (sent on join, includes current room peers)
{ "type": "WELCOME", "sessionId": "sess_abc", "peers": [{ "sessionId": "...", "name": "..." }] }

// Peer joined
{ "type": "PEER_JOINED", "sessionId": "sess_xyz", "name": "Sipho Dlamini" }

// Relayed offer/answer/ICE
{ "type": "OFFER",  "from": "sess_xyz", "sdp": "..." }
{ "type": "ANSWER", "from": "sess_xyz", "sdp": "..." }
{ "type": "ICE",    "from": "sess_xyz", "candidate": { ... } }

// Peer left
{ "type": "PEER_LEFT", "sessionId": "sess_xyz" }
```

**STUN/TURN servers to configure on client:**
```javascript
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // Add a TURN server for firewall traversal:
  { urls: 'turn:turn.omicslab.africa:3478', username: '...', credential: '...' }
];
```

### `GET /teams/rooms` *(protected)*

Returns all meeting rooms (same data shape as localStorage seed).

### `POST /teams/rooms` *(protected)*

Create a new room.

**Request body:**
```json
{
  "name": "African Genomics Lab Meeting",
  "desc": "Weekly WGS pipeline review",
  "scheduled": "Mondays 10:00 WAT",
  "locked": false
}
```

---

## 8. Data Sync (Optional)

To sync localStorage data (Nexus messages, PaperHub saves, quiz progress)
across devices, implement these generic sync endpoints:

### `POST /sync/push` *(protected)*

**Request body:**
```json
{
  "store": "omicslab_nexus_v1",
  "data": { ... }
}
```

### `GET /sync/pull/:store` *(protected)*

Returns the last pushed value for the given store key.

---

## 9. Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,                    -- NULL for pure OAuth users
  institution   TEXT,
  country       TEXT,
  role          TEXT DEFAULT 'researcher',
  avatar_url    TEXT,
  badges        JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Linked social accounts
CREATE TABLE linked_accounts (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL,             -- 'github' | 'google' | 'linkedin'
  provider_id TEXT NOT NULL,
  username    TEXT,
  UNIQUE (provider, provider_id)
);

-- Meeting rooms
CREATE TABLE meeting_rooms (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  desc       TEXT,
  icon       TEXT DEFAULT 'users',
  color      TEXT DEFAULT '#58a6ff',
  scheduled  TEXT,
  locked     BOOLEAN DEFAULT false,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Session sync store
CREATE TABLE sync_store (
  user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  store_key  TEXT NOT NULL,
  data       JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, store_key)
);
```

---

## 10. Environment Variables

```env
# Server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://simon-mufara.github.io

# JWT
JWT_SECRET_PRIVATE=<RS256 private key PEM>
JWT_SECRET_PUBLIC=<RS256 public key PEM>
JWT_EXPIRES_IN=86400

# Database
DATABASE_URL=postgresql://user:password@host:5432/omicslab

# Redis (for OAuth state + rate limiting)
REDIS_URL=redis://localhost:6379

# OAuth Client IDs and Secrets
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Object Storage (avatar uploads)
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=omicslab-avatars
R2_PUBLIC_URL=https://avatars.omicslab.africa

# Email (password reset, welcome email)
EMAIL_FROM=noreply@omicslab.africa
RESEND_API_KEY=
```

---

## 11. Frontend Configuration

After deploying the backend, set these values in `js/auth.js`:

```javascript
const CFG = {
  API_BASE:           'https://api.omicslab.africa/v1',
  GITHUB_CLIENT_ID:   'your_github_client_id',
  GOOGLE_CLIENT_ID:   'your_google_client_id.apps.googleusercontent.com',
  LINKEDIN_CLIENT_ID: 'your_linkedin_client_id',
  REDIRECT_BASE:      'https://simon-mufara.github.io/Omics-Lab/',
};
```

And in `js/teams.js`, set the WebSocket URL:
```javascript
const WS_URL = 'wss://api.omicslab.africa/v1/teams/signal';
```

---

## 12. Security Checklist

- [ ] All endpoints behind HTTPS (no HTTP in production)
- [ ] CORS restricted to `CORS_ORIGIN` only
- [ ] Rate limiting on `/auth/signin` and `/auth/register` (10 req/min/IP)
- [ ] Passwords hashed with bcrypt (cost factor ≥ 12)
- [ ] JWT signed with RS256 (asymmetric), public key exposed for verification
- [ ] OAuth `state` parameter validated (CSRF protection)
- [ ] Input validation with Zod or Joi on all endpoints
- [ ] SQL queries via parameterised statements only (no string concatenation)
- [ ] Avatar uploads size-limited (max 1MB), MIME-type validated server-side
- [ ] WebSocket connections authenticated via JWT query param (validate before upgrade)
- [ ] Helmet.js headers: HSTS, CSP, X-Frame-Options
- [ ] Audit log for account linking/unlinking and password changes
