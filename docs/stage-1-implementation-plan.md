# RapidMVP — Stage 1 Implementation Plan

> **Guiding question:** *"How do I take this repository and turn it into an Azure platform that I own?"*
>
> Scope: strengthen and complete the **existing** repository-analysis workflow. Azure-only. The
> repository ZIP is the source of truth. **No** Venture model, **no** Startup Builder, **no**
> Marketplace, **no** AWS/GCP. Four capabilities only:
> **1. Architecture Overview · 2. Azure Migration Plan · 3. Azure Blueprint · 4. Operational Confidence.**

This plan is grounded in the actual code (verified against `prisma/schema.prisma`,
`src/lib/repository/*`, and the existing components). The headline finding: **three of the four
capabilities already have working engines** — this is completion and reframing, not new construction.
Only the **Azure Migration Plan** is net-new.

---

## Readiness snapshot — how much already exists

| Capability | Engine today | Build state | Stage-1 work |
|---|---|---|---|
| 1. Architecture Overview | `lib/repository/architecture-model.ts` + `components/architecture/*` | ~70% | Enrich per-node Azure recommendation + dual stakeholder/infra explanations; persist model |
| 2. Azure Migration Plan | — (none) | 0% | **New** mapping module + UI table |
| 3. Azure Blueprint | `lib/repository/azure-assessor.ts` + `components/repository/AzureServicesPanel.tsx` | ~60% | Add identity/email/security/cost reference services, secrets+env matrix, ownership model |
| 4. Operational Confidence | `lib/repository/consistency-checker.ts` + `components/repository/ConsistencyPanel.tsx` | ~55% | Re-aggregate into 6 categories + 0–100% + neutral language |

---

## 1. Existing components that can be reused

**Architecture (Capability 1) — reuse nearly whole:**
- `components/architecture/ArchitectureOverviewTab.tsx` — the stakeholder layered view.
- `components/architecture/ArchitectureGraphTab.tsx` — relationship/dependency graph.
- `components/architecture/ArchitectureNode.tsx` — node card (title, description, confidence, evidence).
- `components/architecture/ArchitectureHoverCard.tsx` — inspector panel (the hover-card requirement is already met).
- `components/architecture/graphLayout.ts`, `archStyles.ts` — layout + confidence styling
  (`detected`/`likely`/`requires_clarification` already colour-coded).

**Blueprint (Capability 3):**
- `components/repository/AzureServicesPanel.tsx` — renders recommended services + tiers (extend, don't replace).
- `components/repository/EnvVarsTable.tsx` — already renders classified env vars (required/secret/public/optional) → reuse for the blueprint's secrets/config matrix.
- `components/repository/StackSummaryCard.tsx` — detected stack summary header.

**Operational Confidence (Capability 4):**
- `components/repository/ConsistencyPanel.tsx` — score + categorized findings (reframe into the 6-category confidence view).

**Shell / shared (all capabilities):**
- `components/repository/RepositoryDetailView.tsx` — the tabbed container that hosts all four surfaces.
- `components/repository/RepositoryListView.tsx`, `RepositoryCard.tsx` — list + readiness summary.
- `components/repository/HandoverReportPanel.tsx` — report viewer (copy/download).
- `components/ui/{Card,Section,Button}.tsx` — primitives.
- `components/platform-architecture/*` — the curated diagram + icon set (`icons.tsx`) — reuse icons/legend styling for the new Migration Plan and Ownership panels.

**Net-new components (minimal):** `MigrationPlanTable`, `OwnershipModelPanel`, `OperationalConfidencePanel` (or refactor `ConsistencyPanel` into it).

---

## 2. Existing services (engine modules) that can be reused

All of `src/lib/repository/*` is deterministic and directly reusable:

| Module | Provides | Used by capability |
|---|---|---|
| `zip-reader.ts` | Safe bounded file map `Map<path,content>` | all (input) |
| `stack-detector.ts` | `StackResult` (framework, runtime, build/start, pm, Prisma, Docker, appRoot) | 1, 3, 4 |
| `env-detector.ts` | `EnvVariable[]` (name + classification, names only) | 3, 4 |
| `service-detector.ts` | `DetectedService[]` (category, provider, confidence, detectedFrom) | 1, **2**, 3 |
| `consistency-checker.ts` | `ConsistencyReport` (findings, counts, score 0–100, partial) | **4** |
| `azure-assessor.ts` | `AzureAssessment` (services[required], installSteps, governance, risks, blockers, suitability, readinessScore, buildScripts) | **3**, 4 |
| `architecture-model.ts` | `ArchitectureModel` (nodes/edges/groups + `confidenceExplanation`) | **1** |
| `report-generator.ts` | stakeholder + engineer markdown (the AI seam) | reporting |

**Key reuse insight for Capability 2:** `service-detector.ts` already produces the *left column* of
the migration table (detected provider + evidence). The new mapping module only adds the *right
column* (Azure target + complexity + notes). It consumes existing output; it does not re-detect.

---

## 3. Existing data models that can be reused

From `prisma/schema.prisma` (no structural redesign needed):

- **`RepositoryPackage`** — holds detection results: `detectedStack`, `runtime`, `packageManager`,
  `buildCommand`, `startCommand`, `appType`, `summary`, `detectedServicesJson`, `envVariablesJson`,
  `consistencyScore`, `consistencyFindingsJson`. Version chain (`supersedesId`) reusable for re-uploads.
- **`CloudInstallation`** (`provider` defaults `"azure"`) — holds Azure-target output:
  `readinessScore`, `cloudResourcesJson`, `secretsMappingJson`, `installStepsJson`, `risksJson`,
  `recommendationsJson`. This is where blueprint + migration-plan + confidence snapshots belong.
- **`HandoverReport`** — `stakeholderMarkdown` + `engineerMarkdown` (dual audience already modeled).
- **`DocumentUpload`** — the ZIP artefact in storage.
- **`AccountProfile`** — ownership/scoping of packages.

> **Do not branch on `CloudInstallation.provider`.** Treat Azure as the only target; keep the field
> as a defaulted constant for schema stability.

---

## 4. Required data model changes (additive only — no destructive migration)

All changes are nullable `*Json String?` columns; existing rows keep working. No migration of
existing data required.

**On `RepositoryPackage`:**
- `architectureModelJson String?` — persist the `ArchitectureModel` (today it is computed in
  `inspect` and thrown away, so re-viewing requires re-inspection). Persisting makes the Architecture
  Overview presentation-ready and re-loadable. *(Capability 1)*

**On `CloudInstallation`:**
- `migrationPlanJson String?` — the new detected→Azure mapping array. *(Capability 2)*
- `operationalConfidenceJson String?` — the 6-category confidence snapshot + overall %. *(Capability 4)*
- *(Optional)* `envMatrixJson String?` — assembled secrets+config matrix for the blueprint, if not
  derived at render time from `RepositoryPackage.envVariablesJson`. *(Capability 3)*

That's it — **2 required new columns + 2 optional.** The blueprint's required/optional service split,
deployment sequence, and ownership model are all *derivable at render time* from existing
`AzureAssessment` output, so they need no new storage.

Each persisted JSON field must have a **strict shared TypeScript type** (engine + UI import the same
definition) so the JSON-column approach stays type-safe.

---

## 5. Required API changes

Extend the existing surface under `api/v1/repositories/*`; **do not touch** `api/auth/*` or `infra/`.

**`[id]/inspect/route.ts`** (the orchestrator — already runs stack/env/service/consistency/azure +
builds the architecture model). Extend to:
1. Call the **new migration-mapping module** (Capability 2) with `DetectedService[]` + `StackResult`
   + `EnvVariable[]` → persist `migrationPlanJson`.
2. Enrich the architecture model's per-node `deploymentRecommendation` using the migration map
   (currently only application/database/storage get a note — see §7), then persist `architectureModelJson`.
3. Compute the **operational confidence aggregate** (Capability 4) from `ConsistencyReport` +
   `AzureAssessment` → persist `operationalConfidenceJson`.
   Keep the endpoint **idempotent** (re-inspect overwrites cleanly).

**`[id]/installations/[installId]/report/route.ts`** — extend the generated markdown to include the
Migration Plan table, the Ownership Model, and the Operational Confidence summary (both audiences).

**No new endpoints strictly required for Stage 1** — `inspect` produces everything and `report`
renders it. (A future `…/plan` regenerate endpoint is optional and out of Stage-1 scope.)

---

## 6. Required UI changes

Re-map the existing `RepositoryDetailView` tabs onto the four capabilities (the tab shell already exists):

| New tab | From | Change |
|---|---|---|
| **Architecture Overview** | existing Architecture Overview/Graph tabs | enrich nodes with Azure recommendation; add stakeholder vs infra detail toggle |
| **Migration Plan** | — (new) | `MigrationPlanTable` (Current → Azure → Complexity → Notes; remain/migrate/clarify groupings) |
| **Azure Blueprint** | existing "Cloud Installation" tab | required vs optional services, deployment sequence, secrets+env matrix, `OwnershipModelPanel` |
| **Operational Confidence** | existing "Consistency" tab | `OperationalConfidencePanel`: overall %, 6 categories, neutral status labels, know/need/clarify |

Reuse `ArchitectureOverviewTab`, `ArchitectureNode`, `ArchitectureHoverCard`, `AzureServicesPanel`,
`EnvVarsTable`. The list view (`RepositoryListView`/`RepositoryCard`) should surface **Operational
Confidence %** as the headline metric per repository.

---

## 7. Architecture Overview design (Capability 1)

**Already met by `architecture-model.ts`:** every `ArchNode` carries `title`, `description`,
`purpose`, `detectedFrom` (detection source), `confidence`, and `deploymentRecommendation`; plus
`confidenceExplanation()` for stakeholder phrasing, and explicit `requires_clarification` placeholders
for core layers (database/auth/storage) when nothing is detected — it never invents architecture.

**The required node shape** maps cleanly:

| Requirement | Existing field |
|---|---|
| Name | `title` |
| Description | `description` / `purpose` |
| Detection source | `detectedFrom[]` |
| Confidence level | `confidence` + `CONFIDENCE_LABEL` |
| Azure recommendation | `deploymentRecommendation` *(gap — see below)* |

**Gaps to close:**
1. **Per-node Azure recommendation is incomplete.** `azureNoteFor()` only populates
   `deploymentRecommendation` for `application`, `database`, `storage`. Extend it so `authentication`
   → Entra External ID, `email` → Azure Communication Services, `queue` → Service Bus, etc. — sourced
   from the **same migration map** built in Capability 2 (single source of truth).
2. **Dual explanation (stakeholder vs infrastructure).** `confidenceExplanation()` gives the
   stakeholder line; add an infra-oriented detail (evidence files + the exact Azure target + tier) in
   the hover card. Same data, two altitudes.
3. **Persistence** (`architectureModelJson`) so the view is presentation-ready without re-inspecting,
   and exportable into the report/diagram.

**Output:** the existing layered overview + relationship graph, now annotated with the Azure target
per node and a clean stakeholder/infra toggle. Confidence styling and "requires clarification"
placeholders stay — they *are* the no-blame, evidence-only contract.

---

## 8. Azure Migration Plan design (Capability 2 — the net-new module)

A deterministic **mapping registry** keyed by `ServiceCategory` + provider → Azure target. Consumes
`DetectedService[]` (and env-derived signals); emits a `MigrationPlan`.

**Per-item shape:**
```
MigrationItem {
  currentState:   string        // detected provider (from service-detector)
  azureState:     string        // recommended Azure equivalent
  complexity:     'low' | 'medium' | 'high' | 'none'
  decision:       'remain' | 'migrate' | 'requires_clarification'
  notes:          string        // required actions, neutral language
  detectedFrom:   string[]      // evidence (reused from DetectedService)
  confidence:     ArchConfidence
}
```

**Mapping table (initial registry):**

| Detected (current) | Azure (recommended) | Complexity | Decision |
|---|---|---|---|
| PostgreSQL / Supabase | Azure PostgreSQL Flexible Server | Low | migrate |
| MySQL | Azure DB for MySQL Flexible Server | Low | migrate |
| SQLite | Azure PostgreSQL Flexible Server | Medium | migrate |
| MongoDB | Azure Cosmos DB (Mongo API) | Medium | migrate |
| Redis | Azure Cache for Redis | Low | migrate |
| S3 / DigitalOcean Spaces / GCS | Azure Blob Storage | Medium | migrate |
| Azure Blob (already) | Azure Blob Storage | None | remain |
| SuperTokens / Auth0 / Clerk / NextAuth / Firebase Auth | Microsoft Entra External ID | High | migrate* |
| SendGrid / Resend / Postmark / Mailgun / SMTP | Azure Communication Services Email | Medium | migrate |
| BullMQ (Redis queue) | Azure Service Bus / Azure Cache for Redis | Medium | migrate |
| RabbitMQ / Kafka | Azure Service Bus / Event Hubs | High | migrate |
| Stripe | Stripe (remain by design) | None | remain |
| AI provider (OpenAI/Anthropic) | Remain (note: Azure OpenAI available) | None | remain |
| Unmapped / unknown | — | — | requires_clarification |

**Complexity heuristic:** *None* = already Azure / external by design; *Low* = config/SDK swap;
*Medium* = data movement; *High* = identity/user-data or messaging-semantics change.

**Output groups** the UI requires: **What can remain · What should migrate · What requires
clarification.** *Honor incumbents* — `remain` is first-class; the platform recommends, never forces
(\*Entra migration allowed to `remain` if impractical). **Never assign blame** — notes describe
*required actions*, not faults.

> This registry is the **single source of Azure recommendations**, also feeding the architecture
> nodes (§7) and the blueprint (§9). Build it once.

---

## 9. Azure Blueprint design (Capability 3)

**Already met by `azure-assessor.ts`:** `services[]` with `required: boolean` (→ required vs optional
split), `installSteps[]` (→ deployment sequence), `governanceFindings`, `risks`, `blockers`,
`suitability`, `azureReadinessScore`, plus Key Vault recommendation when secrets are detected and
buildScripts for App Service / Prisma / GitHub Actions.

**Gaps to close against the reference architecture:**
1. **Add reference services not yet emitted:** Microsoft Entra External ID (identity), Azure
   Communication Services (email — when email service detected), Azure Front Door + WAF + Microsoft
   Defender for Cloud (security), Azure Cost Management (cost). Mark these `required: false` /
   recommended unless a corresponding need is detected. App Service, App Insights, PostgreSQL, Key
   Vault, Storage, Container Registry are already covered.
2. **Required Secrets list + Environment Variables matrix.** Assemble from
   `RepositoryPackage.envVariablesJson` (env-detector already classifies secret/required/public/
   optional, names only). Render with the existing `EnvVarsTable`; map each secret → a Key Vault
   reference (the assessor already generates the `@Microsoft.KeyVault(...)` pattern in its config
   script — surface it as data).
3. **Estimated Dependencies.** A resource dependency ordering (e.g. PostgreSQL + Key Vault before App
   Service; Container Registry before App Service when Docker detected). Derivable from the service
   set + `installSteps`.
4. **Infrastructure Ownership Model** (`OwnershipModelPanel`) — each claim backed by a provisioned
   resource:

| You own… | Backed by |
|---|---|
| The tenant | Subscription + resource group |
| The users | Microsoft Entra External ID |
| The data | Azure PostgreSQL Flexible Server + Blob Storage |
| The monitoring | Application Insights + Log Analytics |
| The costs | Azure Cost Management |

**Output sections:** Required Resources · Optional Resources · Estimated Dependencies · Required
Secrets · Environment Variables · Deployment Sequence · Ownership Model. Reinforces *ownership over
convenience*.

---

## 10. Operational Confidence design (Capability 4)

**This is an operational-readiness score — not a code-quality or developer score.** The
`consistency-checker.ts` engine produces the raw signals; Stage 1 **re-aggregates and re-frames** them
into six operational categories, blended with `azure-assessor` cloud signals.

**Category → existing signal mapping:**

| Category | Sourced from |
|---|---|
| Repository Structure | `orphaned_module`, entrypoint/appRoot detection, `filesAnalysed`, `partial` |
| Dependency Validation | `missing_dependency`, `unused_dependency`, `circular_dependency`, `broken_import`, `package_manager` |
| Environment Validation | `missing_env_var`, `unreferenced_env_example`, env classification, `.env` presence |
| Installation Validation | `.env.example` presence, lockfile present, package-manager consistency, install command derivable |
| Build Validation | `missing_script` (build/start), `buildCommand`/`startCommand` detected |
| Cloud Readiness | `azure-assessor`: `blockers`, `suitability`, health-check, `azureReadinessScore` |

**Each category resolves to a status:** `Validated` · `Partially Validated` · `Requires
Clarification` · `Not Yet Validated`. **Overall Operational Confidence = 0–100%** — a weighted blend
(suggest Cloud Readiness + Build + Installation weighted highest, since they gate deployment).

**Neutral-language reframing (mandatory).** The internal finding titles use words the UI must not
surface verbatim ("Broken relative import", "Missing dependency", "stale", "Orphaned"). Map them to
neutral operational language at the confidence layer:

| Internal finding | Operational presentation |
|---|---|
| Broken relative import | Import path requires clarification |
| Missing dependency | Dependency requires clarification |
| Missing start/build script | Build configuration requires clarification |
| .env committed | Configuration requires review before deployment |
| Orphaned module | Module usage not yet validated |
| Multiple lockfiles | Install method requires clarification |

**Output framework — three questions:** *What do we know?* (Validated) · *What do we need?*
(Recommended next steps) · *What still requires clarification?* (the gaps). **Never** "Failed /
Broken / Incorrect / Developer Error."

---

## 11. Report integration strategy

`report-generator.ts` already emits dual-audience markdown and is the **designated AI seam**
(`summariseConsistencyForStakeholders()`), with the Anthropic SDK installed. Strategy:

- **Engineer report** gains: Migration Plan table, full blueprint (resources, secrets/env matrix,
  deployment sequence, dependencies), Operational Confidence by category, governance findings.
- **Stakeholder report** gains: plain-English architecture summary, "what can remain / should
  migrate / needs clarification," Ownership Model, Operational Confidence % framed as progress, and
  the three-question framework.
- **AI usage is narration-only** — Claude rephrases already-derived deterministic findings into
  blame-free prose; it never originates findings, services, or scores. The detection/assessment core
  stays 100% deterministic (the credibility moat). Default to the latest Claude models; a small/cheap
  model suffices for phrasing.

---

## 12. Security considerations

- **Secrets are names-only, everywhere.** `env-detector` never stores values; the blueprint's secret
  matrix and any report must preserve this. Verify renderers never echo a value.
- **`.env`-in-ZIP handling** stays a *review* finding (neutral), and a Key Vault recommendation — not
  a blame statement. The assessor already flags it; keep the language neutral in the UI.
- **Do not touch** `app/api/auth/*`, `infra/`, or SuperTokens config (per `CLAUDE.md`).
- **Uploaded ZIP safety** is already handled by `zip-reader` (zip-slip safe, size/file bounded,
  binaries skipped) — no change.
- No public share surface is in Stage-1 scope, so no new unauthenticated attack surface is introduced.

---

## 13. Performance considerations

- **One-pass inspection.** `inspect` already loads the file map once and runs all detectors; the new
  migration-mapping + confidence-aggregation steps are pure transforms over already-computed output
  (no extra file I/O) — negligible cost.
- **Persist derived artifacts** (`architectureModelJson`, `migrationPlanJson`,
  `operationalConfidenceJson`) so detail-view loads are reads, not recomputations.
- **`partial` flag awareness.** `consistency-checker` truncates at the `zip-reader` 400-file budget
  and sets `partial`; absence-based categories must surface as *Partially Validated*, never as a hard
  negative, when `partial` is true.
- **AI calls are async and optional** — generated lazily on report request, never blocking inspection.

---

## 14. Testing strategy

- **Engine unit tests (highest value):** there is already a `lib/repository/__tests__` dir (Vitest).
  Add deterministic fixture-repo tests for the **new migration-mapping module** (each detected
  provider → expected Azure target/complexity/decision) and the **operational-confidence aggregator**
  (signal sets → category statuses + overall %).
- **Snapshot tests** on `architecture-model` after the per-node Azure-recommendation enrichment, to
  prove existing nodes/confidence are unchanged.
- **Neutral-language guard test:** assert no UI-facing confidence/migration string contains the
  forbidden words (Failed/Broken/Incorrect/Error/Fault) — enforces the brand rule mechanically.
- **Secrets-safety test:** assert reports/matrix render env var *names* only, never values.
- **Fixture corpus:** a handful of representative ZIPs (Next.js+Prisma+Postgres+S3; Express+Mongo;
  Python+Supabase; unknown-stack) to exercise remain/migrate/clarify paths end-to-end.

---

## 15. Implementation order

1. **Migration-mapping module (Capability 2)** — net-new, and the single source of Azure
   recommendations the other capabilities consume. Build + unit-test first.
2. **Architecture Overview enrichment (Capability 1)** — wire per-node Azure recommendation from the
   map; add infra/stakeholder dual detail; persist `architectureModelJson`.
3. **Blueprint completion (Capability 3)** — add identity/email/security/cost reference services,
   secrets+env matrix, dependency ordering, Ownership Model panel.
4. **Operational Confidence (Capability 4)** — aggregate the 6 categories, overall %, neutral-language
   mapping; reframe `ConsistencyPanel`.
5. **Inspect orchestration + persistence** — wire 1–4 into `inspect`, persist the new JSON columns
   (additive migration handed to the developer).
6. **Report integration (§11)** — extend engineer + stakeholder markdown; add AI narration seam.
7. **List-view + polish** — surface Operational Confidence % per repository; presentation pass.

Sequence rationale: build the shared mapping source first (1) so 2–4 don't duplicate Azure logic;
persistence (5) lands after the producers exist; reporting (6) consumes the finished artifacts.

---

## 16. Estimated effort

| Step | Scope | Effort |
|---|---|---|
| 1 | Migration-mapping module + registry + tests | **3–4 days** |
| 2 | Architecture Overview enrichment + persistence | **2–3 days** |
| 3 | Blueprint completion (services, matrix, dependencies, ownership) | **3–4 days** |
| 4 | Operational Confidence aggregation + neutral language + panel | **3–4 days** |
| 5 | Inspect orchestration + additive schema + persistence | **1.5–2 days** |
| 6 | Report integration + AI narration | **2–3 days** |
| 7 | List view + presentation polish | **1.5–2 days** |
| | **Total** | **~16–22 days (3.5–4.5 weeks)** |

**Risk: low–medium throughout** — every change is additive to engines and a schema that are already
Azure-first. The highest-leverage first move is the **migration-mapping module (step 1)**: it closes
the one true gap, and feeds the Azure recommendations that complete Capabilities 1 and 3.

---

## Anchor

> Every output presents **observations, requirements, clarifications, and recommendations** — never
> faults, mistakes, or criticism — answering: *What do we know? What do we need? What still requires
> clarification?* All in service of the one question: **"How do I take this repository and turn it
> into an Azure platform that I own?"**
