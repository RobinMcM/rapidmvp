# CLAUDE.md — rapidmvp

## Service Identity
Central authentication and identity service for all RapidMVP platform apps.
MovieShaker is the reference implementation.
- **Framework**: Next.js (App Router) + TypeScript + Tailwind
- **Auth**: SuperTokens (self-hosted core)
- **Database**: PostgreSQL (shared profile/role data)
- **Storage**: DigitalOcean Spaces
- **Deployed at**: `https://rapidmvp.io` / `https://auth.rapidmvp.io`

## Apps Using This Auth Service
- movieshaker.com
- afilminabox.com
- reelinvesting.com
- ooocreatives.com
- rapidmvp.io

## Structure
```
app/                     ← Next.js App Router
  api/
    auth/[...path]/      ← SuperTokens API handler — DO NOT modify without explicit request
    v1/                  ← Shared profile/role APIs
  auth/                  ← Auth UI pages
  account/               ← Protected pages
docs/                    ← Installation and integration docs
infra/                   ← Caddy configs — DO NOT modify without explicit request
```

## Rules — Read Before Every Task

### Scope
- Only modify the file(s) explicitly named in the request
- NEVER modify `app/api/auth/` without explicit confirmation — this is the auth core
- NEVER modify `infra/` without explicit confirmation — this controls routing for all apps
- Do not modify SuperTokens configuration without explicit confirmation

### Git
- Do NOT run any git commands
- Developer handles all git operations

### Running the Service
- Do NOT run npm commands
- Do NOT run docker compose commands
- SuperTokens Core requires Docker — do not start/stop it automatically

### Auth Boundaries — Critical
- Auth API: `auth.rapidmvp.io`
- Each app owns its own first-party session after SSO callback
- Do NOT attempt to share cookies across top-level domains
- Proxy pattern is: `app-domain/auth/*` → `auth.rapidmvp.io/auth/*`
- Do NOT move CRUD routes onto `auth.rapidmvp.io`

## Chatbot Integration
Two modes — iframe and widget. Widget mode takes precedence when
`NEXT_PUBLIC_CHATBOT_WIDGET_EMBED_SRC` is set. Do not mix modes.

## Shared Data API Routes (Phase 2)
- `GET /api/v1/me`
- `PATCH /api/v1/me/profile`
- `POST /api/v1/me/avatar/upload-url`
- `GET /api/v1/admin/users` (admin only)
- `PATCH /api/v1/admin/users/:userId/role`
- `PATCH /api/v1/admin/users/:userId/status`

## If Uncertain
Ask before proceeding. Auth infrastructure affects all connected apps.
A mistake here impacts MovieShaker, FilmInABox, and all other platform apps simultaneously.
