# RapidMvᵖ.io

Next.js App Router + TypeScript + Tailwind landing site with first-stage authentication via SuperTokens.

## Development

1. Copy envs: `cp .env.example .env.local`
2. Fill in `SUPERTOKENS_CONNECTION_URI` and domain values.
3. Start local SuperTokens Core (required for sign in / sign up):
   - `docker compose -f docker-compose.supertokens.yml up -d`
4. Start app: `npm run dev`
5. Build and run production mode:
   - `npm run build`
   - `npm run start`

## Chatbot iframe quick win

`rapidmvp-v2` can render the standalone chatbot as a floating iframe control (SharePoint-compatible approach).

1. Set these vars in `.env.local`:
   - `NEXT_PUBLIC_CHATBOT_IFRAME_SRC` (example: `https://chat.yourdomain.com/chatbot/embed/insolvency`)
   - `NEXT_PUBLIC_CHATBOT_IFRAME_TITLE` (optional)
   - `NEXT_PUBLIC_CHATBOT_IFRAME_WIDTH` (optional, default `380`)
   - `NEXT_PUBLIC_CHATBOT_IFRAME_HEIGHT` (optional, default `560`)
   - `NEXT_PUBLIC_CHATBOT_IFRAME_INITIAL_OPEN` (optional, `true` or `false`)
2. Restart `npm run dev`.
3. Open any page in the app and use the chat button in the bottom-right corner.

If `NEXT_PUBLIC_CHATBOT_IFRAME_SRC` is empty, the iframe control is hidden.

## Auth Architecture (MVP)

- Frontend: `rapidmvp.io`
- Auth API routes: `auth.rapidmvp.io` (this Next.js app under `/api/auth/*`)
- SuperTokens Core: self-hosted service (Docker/VM/container)
- Session transport: HTTP-only cookies with secure production settings

### MovieShaker pattern (centralized auth + separate CRUD)

- Auth service domain: `https://auth.rapidmvp.io`
- MovieShaker CRUD API domain: `https://api.movieshaker.com`
- Keep auth first-party for MovieShaker by proxying:
  - `https://api.movieshaker.com/auth/*` -> `https://auth.rapidmvp.io/auth/*`
- Keep CRUD endpoints on `api.movieshaker.com` (do not move them).
- Reference Caddy config: `infra/Caddyfile.movieshaker`

### RapidMVP domain setup

- Web: `https://rapidmvp.io`
- API (recommended): `https://api.rapidmvp.io`
- Central identity/auth domain: `https://auth.rapidmvp.io`
- Proxy rule: `https://api.rapidmvp.io/auth/*` -> `https://auth.rapidmvp.io/auth/*`
- Remaining API paths stay on RapidMVP backend.

## Environment Variables

See `.env.example` for all required values:

- `SUPERTOKENS_CONNECTION_URI`
- `SUPERTOKENS_API_KEY`
- `APP_DOMAIN`
- `API_DOMAIN`
- `NEXT_PUBLIC_APP_DOMAIN`
- `NEXT_PUBLIC_API_DOMAIN`
- `SUPERTOKENS_COOKIE_DOMAIN`
- `AUTH_API_DOMAIN`
- `AUTH_API_BASE_PATH` (use `/auth` with API proxy, `/api/auth` for direct in-app route)
- `NEXT_PUBLIC_API_URL` (CRUD API base URL)
- `NEXT_PUBLIC_AUTH_API_URL` (optional auth API override)
- `NEXT_PUBLIC_WEBSITE_DOMAIN`
- `NEXT_PUBLIC_AUTH_API_BASE_PATH` (same meaning as `AUTH_API_BASE_PATH`)
- `NEXT_PUBLIC_CHATBOT_IFRAME_SRC` (standalone chatbot URL for iframe embed)

Recommended MovieShaker frontend env setup:

- `NEXT_PUBLIC_API_URL=https://api.movieshaker.com`
- `NEXT_PUBLIC_AUTH_API_URL` unset (or `https://api.movieshaker.com`) to keep auth first-party through `/auth` proxy

Recommended RapidMVP frontend env setup:

- `NEXT_PUBLIC_WEBSITE_DOMAIN=https://rapidmvp.io`
- `NEXT_PUBLIC_API_URL=https://api.rapidmvp.io`
- `NEXT_PUBLIC_AUTH_API_URL=https://api.rapidmvp.io`
- `NEXT_PUBLIC_AUTH_API_BASE_PATH=/auth`

Recommended RapidMVP backend env setup:

- `APP_DOMAIN=https://rapidmvp.io`
- `API_DOMAIN=https://api.rapidmvp.io`
- `AUTH_API_DOMAIN=https://auth.rapidmvp.io`
- `AUTH_API_BASE_PATH=/auth`
- `SUPERTOKENS_CONNECTION_URI=<core-endpoint>`
- `CORS_ALLOWED_ORIGINS=https://rapidmvp.io,https://www.rapidmvp.io`
- `SUPERTOKENS_COOKIE_DOMAIN=.rapidmvp.io`

For all app domains (MovieShaker, RapidMVP, FilmInABox, ReelInvesting, OOOCreatives), use:
- `/auth/*` -> `https://auth.rapidmvp.io/auth/*`
- non-auth routes -> app-specific backend
- global Caddy template: `infra/Caddyfile.global-auth`

## Auth Routes and Pages

- Auth API handler: `/api/auth/[...path]`
- Auth UI entry page: `/auth`
- Protected example page: `/account`
- Health endpoint for monitoring auth API uptime: `/api/auth/health`

### Local auth troubleshooting

- `POST /api/auth/session/refresh` returning `401` before login is expected (no refresh token yet).
- `POST /api/auth/signin` returning `503` means SuperTokens Core is unreachable; start Docker services above.
- Verify Core health directly: [http://localhost:3567/hello](http://localhost:3567/hello)

## Validation Commands

Run these checks in staging/production:

- `curl -i https://auth.rapidmvp.io/health`
- `curl -i -X OPTIONS "https://auth.rapidmvp.io/auth/session/refresh" -H "Origin: https://movieshaker.com" -H "Access-Control-Request-Method: POST"`
- `curl -i -X OPTIONS "https://api.movieshaker.com/auth/session/refresh" -H "Origin: https://movieshaker.com" -H "Access-Control-Request-Method: POST"`

## Production Hardening Notes

- Auth POST endpoints include in-app request throttling.
- Basic bot mitigation rejects malformed/missing user agent on critical auth endpoints.
- Blocked requests are logged as structured JSON for easier ingestion into log tools.
- Add external monitoring checks for:
  - Auth API uptime (`/api/auth/health`)
  - SuperTokens Core uptime
  - Session creation and refresh failure rates
