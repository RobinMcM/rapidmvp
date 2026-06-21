# Phase 0 — Repository Analysis Test Strategy

**Prerequisite to Phase 1.** The repository-analysis engine (`detectStack`, `detectEnvVars`, `assessAzureReadiness`, `generateAdminDocument`) is the one part of the codebase that survives every phase and is *refactored* in Phases 2–3 (folder rename, multi-cloud abstraction, report rewrite). Before any of that, we lock its behaviour behind tests so refactors are provably non-breaking.

These functions are **pure** (input: a `Map<string,string>` of repo files; output: plain data) — no DB, no network, no auth — so they are cheap and fast to test exhaustively.

---

## 1. Tooling

| Concern | Decision |
|---|---|
| Runner | **Vitest** — native ESM + TS, zero-config with the existing `tsconfig`, fast watch mode in VSCode. |
| Why not `node:test` | Node is pinned at **v20** (`node -v` → v20.20.1), which cannot execute `.ts` natively (type-stripping landed in 22.6+). Running TS tests would need a loader anyway, so a real runner is cleaner. |
| Install (developer, one-time) | `npm install -D vitest` — **the assistant cannot run npm** (`CLAUDE.md`), so this single command is done by the developer. Everything else (configs, tests, fixtures) is committed and ready. |
| Run | `npm test` (added to `package.json`), or `npx vitest` for watch mode. |
| Build isolation | `*.test.ts` is added to `tsconfig.json` `exclude` so the app's `tsc --noEmit` / `next build` stays green **before** vitest is installed. Vitest type-checks tests itself. |

---

## 2. What we test (and what we deliberately don't)

**In scope (deterministic, high-value):**
- `lib/repository/stack-detector.ts` → `detectStack`
- `lib/repository/env-detector.ts` → `detectEnvVars`
- `lib/repository/azure-assessor.ts` → `assessAzureReadiness`

**Out of scope for Phase 0:**
- `zip-reader.ts` — thin wrapper over `jszip`; covered indirectly by feeding the engine a `Map` (the same shape `zip-reader` produces). Add a small smoke test only if zip parsing logic grows.
- `document-generator.ts` — string/markdown assembly; will be **rewritten** in Phase 3 (dual-audience report). Snapshot it in Phase 3, not now, to avoid testing throwaway output.
- Routes, React components, AI calls — integration concerns, not Phase 0.

---

## 3. Test matrix

### 3.1 `detectStack`
| Case | Fixture | Asserts |
|---|---|---|
| Next.js fullstack | `package.json` (next dep + scripts) | `language=nodejs`, `framework=nextjs`, `appType=fullstack`, build/start commands captured |
| Package manager | `yarn.lock` / `pnpm-lock.yaml` / `package-lock.json` | `packageManager` = yarn / pnpm / npm |
| Prisma + DB driver | deps incl. `@prisma/client`, `pg` | `hasPrisma=true`, `hasDatabase=true` |
| API frameworks | express / fastify / nestjs deps | correct `framework`, `appType=api` |
| Python FastAPI | `requirements.txt` w/ fastapi | `language=python`, `framework=fastapi` |
| Go / Java | `go.mod` (gin) / `pom.xml` (spring-boot) | correct language + framework |
| Docker | `Dockerfile`, `docker-compose.yml` w/ postgres | `hasDockerfile=true`, `hasDatabase=true` via compose |
| Empty / unknown | `{}` | `language=unknown`, `framework=unknown` |

### 3.2 `detectEnvVars`
| Case | Fixture | Asserts |
|---|---|---|
| Example → required | `.env.example` with `PORT=` | `PORT` classified `required` |
| Secret pattern | `STRIPE_SECRET_KEY`, `JWT_SIGNING_KEY` | classified `secret` |
| Public prefix | `NEXT_PUBLIC_URL`, `VITE_X` | classified `public` |
| Source scan | `.ts` with `process.env.MY_FLAG` | `MY_FLAG` detected |
| Internal vars skipped | `process.env.NODE_ENV/PATH/HOME` | excluded |
| Compose env block | `docker-compose.yml` env keys | detected |
| Classification upgrade | same var seen unknown then secret | ends as `secret` |
| **Secret-value safety (invariant)** | `.env` with `API_SECRET=sk_live_REALVALUE` | `JSON.stringify(output)` **does not contain** the value; objects expose only `name/classification/hasValue/source` |

### 3.3 `assessAzureReadiness`
| Case | Input | Asserts |
|---|---|---|
| Baseline services | any valid Node stack | services include `Azure App Service` + `Application Insights` |
| DB → Postgres | stack `hasDatabase` | service `Azure Database for PostgreSQL Flexible Server` present |
| Secrets → Key Vault | env with a secret | `Azure Key Vault` service + secret risk raised |
| Prisma → migration asset | `hasPrisma` | buildScript `DatabaseMigration` generated |
| Always-on assets | any | `AzureAppServiceDeploy` + `GithubActionsDeploy` scripts present |
| Missing start cmd | no `start`, no Dockerfile | blocker raised, score reduced |
| `.env` committed | files include `.env` | **critical** governance finding, score penalty |
| Unknown language | empty stack | `suitability='unsupported'`, blocker present |
| Score bounds | any | `0 <= cloudReadinessScore <= 100` |
| **No secret leakage** | secret env var | generated scripts use `@Microsoft.KeyVault(...)` references, never a raw value |

---

## 4. Conventions

- Location: `src/lib/repository/__tests__/*.test.ts` (co-located, excluded from app `tsc`).
- Helper: `__tests__/fixtures.ts` exposes `filesFrom(record)` → `Map<string,string>` and small repo presets (`nextjsPrismaRepo()`, etc.). Keep fixtures inline and minimal — one concern per test.
- Style: Arrange/Act/Assert; one behaviour per `it`; describe blocks per function.
- **The two invariants** (no secret values in `detectEnvVars` output; no secret values in generated scripts) are the highest-priority assertions — they protect the product's core security promise across every future refactor.

---

## 5. Coverage targets

- Branch coverage **≥ 90%** on the three engine files (they're pure and small — achievable).
- 100% of the language/framework branches in `detectStack` exercised.
- Both security invariants asserted in dedicated, clearly-named tests so a regression is unmissable in CI output.

---

## 6. CI hook (developer follow-up)

Once vitest is installed, add to CI before build:
```
npm test          # vitest run
npm run lint
npx tsc --noEmit  # app typecheck (tests excluded)
```
Fail the pipeline on any. These tests then act as the **regression gate** for the Phase 2 folder move (`lib/repository` → `lib/analysis`) and the Phase 3 `CloudProvider` abstraction.
