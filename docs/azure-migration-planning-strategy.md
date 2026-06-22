# RapidMVP — Azure Migration Planning Strategy

> **Guiding question the product answers:**
> *"I have this repository. How do I turn it into a platform I own on Azure?"*

RapidMVP is **Azure-only**. The uploaded repository ZIP is the **source of truth**. The platform
inspects it, validates it, maps every detected component to an Azure equivalent, and produces a
migration plan, deployment blueprint, operational plan, and dual-audience handover — all in neutral,
blame-free language.

This strategy is an extension of the **existing** codebase, not a redesign. The live schema
(`RepositoryPackage → CloudInstallation → HandoverReport`) and the deterministic engine
(`src/lib/repository/*`, incl. `azure-assessor.ts`) are already Azure-first. The work below
*deepens* them — chiefly by introducing an explicit **Migration Mapping** layer that currently does
not exist.

> **Doc note:** `docs/refactor-roadmap.md` is stale (it references `ClientBlueprint` /
> `RepositoryAssessment` / `workspace/blueprints`, which no longer exist). This document supersedes it
> for migration-planning work.

---

## Current-state baseline (what already exists)

| Capability | Where it lives | Status |
|---|---|---|
| ZIP ingest (zip-slip safe, bounded) | `lib/repository/zip-reader.ts` | ✅ keep |
| Stack/runtime/build detection | `lib/repository/stack-detector.ts` | ✅ keep |
| Env var + secret classification (names only) | `lib/repository/env-detector.ts` | ✅ keep |
| Service detection (DB/auth/storage/email/queue/external) | `lib/repository/service-detector.ts` | ✅ keep |
| Consistency / validation (deterministic) | `lib/repository/consistency-checker.ts` | ✅ keep |
| Azure readiness + recommended services | `lib/repository/azure-assessor.ts` | ⬆ extend |
| Provider-neutral architecture graph | `lib/repository/architecture-model.ts` | ⬆ extend (add Azure target view) |
| Dual-audience report (template) | `lib/repository/report-generator.ts` | ⬆ extend |
| Data: package → installation → report | `prisma/schema.prisma` | ⬆ extend |
| Inspect + installations + report APIs | `api/v1/repositories/*` | ⬆ extend |

**The missing layer:** a first-class, per-component **Migration Mapping** (Current → Azure →
Complexity → Notes → Remain/Migrate). Everything else is refinement around it.

**Simplification mandated by the finalized vision:** Azure is the *only* provider. The schema's
`CloudInstallation.provider` ("azure | aws | gcp") and the architecture-model's provider-neutral
abstraction were built for a multi-cloud future that is now explicitly out of scope. **Do not add
AWS/GCP.** Keep `provider` only as a defaulted constant for forward-compat; do not branch on it.

---

## 1. Azure Migration Planning Architecture

A deterministic pipeline. AI is used **only** for narrative phrasing of already-derived facts — never
to invent components, services, or costs (preserves the credibility moat and the no-blame rule).

```
ZIP ──▶ INSPECT ──▶ VALIDATE ──▶ MAP ──▶ PLAN ──▶ BLUEPRINT ──▶ OPERATE ──▶ HANDOVER
        (detect)    (consistency) (NEW)   (steps)  (resources)   (mon/sec/  (engineer +
                                  Current→         + secrets +    cost)       stakeholder)
                                  Azure            assumptions
```

Layer responsibilities:

- **Detection layer** (exists) — facts only: stack, env, services, evidence trails.
- **Validation layer** (exists) — consistency findings, framed `known / needed / to_clarify / risk`.
- **Mapping layer** (**NEW**) — for each detected component emit a `MigrationMapping`
  (current → recommended Azure → complexity → notes → decision: *remain* | *migrate*).
- **Planning layer** (extend `azure-assessor`) — required Azure resources, secrets/config matrix,
  ordered deployment steps, infra dependencies, assumptions, clarifications.
- **Operational layer** (**NEW, recommendation-only**) — monitoring, security, cost guidance derived
  from the resource set.
- **Reporting layer** (extend `report-generator`) — engineer guide, stakeholder report, Azure
  architecture diagram, cloud blueprint.

**Determinism contract:** every line in every output traces back to a detection or a mapping rule.
No figure, service, or claim originates in an LLM call.

---

## 2. Azure Service Mapping Model

The new core. A **rule registry** keyed by detected service category/provider → Azure target. The
`service-detector` already produces the left column; the mapping registry adds the right.

| Detected (current state) | Recommended Azure state | Complexity | Decision | Notes |
|---|---|---|---|---|
| PostgreSQL | Azure PostgreSQL Flexible Server | Low | migrate | Same engine; connection-string + firewall/VNet change |
| MySQL | Azure DB for MySQL Flexible Server | Low | migrate | Same engine swap |
| SQLite | Azure PostgreSQL Flexible Server | Medium | migrate | File DB → managed; schema port + data load |
| MongoDB | Azure Cosmos DB (Mongo API) | Medium | migrate | API-compatible; verify driver/version + indexes |
| Redis | Azure Cache for Redis | Low | migrate | Drop-in; sizing decision |
| S3 / DO Spaces / GCS | Azure Blob Storage | Medium | migrate | SDK swap + data copy; presigned-URL pattern differs |
| Azure Blob (already) | Azure Blob Storage | None | remain | Already Azure-native |
| SuperTokens / Auth0 / Clerk / NextAuth / Firebase Auth | Microsoft Entra External ID | High | migrate* | User store + flows change; *allow remain if migration impractical |
| SendGrid / Resend / Postmark / Mailgun / SMTP | Azure Communication Services Email | Medium | migrate | Domain verification + template port |
| BullMQ / Redis queue | Azure Service Bus (or Redis-backed) | Medium | migrate | Map to Service Bus queues, or keep on Azure Cache for Redis |
| RabbitMQ / Kafka | Azure Service Bus / Event Hubs | High | migrate | Protocol/semantics differ; assess throughput needs |
| Stripe | Stripe (recommended default) | None | remain | Payments stay external by design |
| AI provider (OpenAI/Anthropic) | Remain (note: Azure OpenAI available) | None/Low | remain | Keep unless tenant policy requires Azure OpenAI |
| Analytics (3rd-party) | Remain | None | remain | Optional Application Insights complement |
| App hosting (Node/Next/etc.) | Azure App Service | Low | migrate | From `stack-detector` build/start commands |

**Mapping rule shape (conceptual):**
`{ matcher (category+provider+evidence), azureService, defaultComplexity, decision, notesTemplate, requiredSecrets[], requiredResources[] }`.

**Complexity heuristic:**
- *None* — already Azure / stays external by design.
- *Low* — same protocol, config/SDK change only.
- *Medium* — data movement or moderate semantic change.
- *High* — identity/user-data migration or messaging-semantics change.

**Honor incumbents:** `decision: remain` is first-class. The platform *recommends* Azure; it never
*forces* a migration. Stripe, AI providers, and any service the founder prefers can remain — the plan
simply records the decision and any integration notes.

---

## 3. Azure Blueprint Data Model

Extend the existing `CloudInstallation` rather than replace it — it already carries
`cloudResourcesJson / secretsMappingJson / installStepsJson / risksJson / recommendationsJson`. Add
the migration-mapping and assumptions/clarifications dimensions it lacks.

Conceptually, a **Blueprint** answers the nine required questions:

```
Blueprint (per CloudInstallation)
 1. Required Azure resources      → AzureResource[]   (type, sku/tier, purpose, dependsOn[])
 2. Services that can remain      → MigrationMapping[] where decision = remain
 3. Services that should migrate  → MigrationMapping[] where decision = migrate (+ complexity)
 4. Required secrets              → SecretRequirement[] (name, sourceEnvVar, → Key Vault, owner)
 5. Required env / config         → ConfigRequirement[] (name, classification, target)
 6. Deployment steps              → DeploymentStep[]   (ordered, dependsOn[], category)
 7. Infrastructure dependencies   → resource dependency edges
 8. Assumptions made              → Assumption[]       (text, basis/evidence)
 9. Requires clarification        → Clarification[]    (question, why it matters)
```

**Storage decision:** keep the JSON-column approach for the blueprint payload (it already exists and
suits read-mostly, render-as-a-document data), **but** define and version a strict TypeScript shape
for each JSON field so the engine and UI share one contract. Promote to relational tables only if/when
findings need cross-project querying (not required for the migration-planning MVP).

New/extended fields on `CloudInstallation` (additive, no destructive migration):
`migrationMappingJson`, `assumptionsJson`, `clarificationsJson`, `estimatedCostJson`, and (if share
links ship) `shareToken` / `sharedAt`. Existing fields keep their meaning.

---

## 4. Repository-to-Azure Workflow

Map the eight product steps to a single state machine on `RepositoryPackage` + `CloudInstallation`.

| # | Step | Engine module | Persisted state |
|---|---|---|---|
| 1 | Upload Repository ZIP | `documents/upload-url` + `confirm`, `zip-reader` | `RepositoryPackage.status = uploaded` |
| 2 | Inspect Repository | `stack/env/service-detector` | `inspecting → inspected`; detection fields populated |
| 3 | Validate Repository | `consistency-checker` | `consistencyScore`, `consistencyFindingsJson` |
| 4 | Identify Azure Requirements | **mapping registry (NEW)** + `azure-assessor` | `CloudInstallation` created; `migrationMappingJson` |
| 5 | Generate Azure Migration Plan | mapping → ordered actions | `installStepsJson` (migration actions) |
| 6 | Generate Deployment Blueprint | `azure-assessor` | `cloudResourcesJson`, `secretsMappingJson`, `assumptionsJson`, `clarificationsJson` |
| 7 | Generate Operational Plan | **operational layer (NEW)** | monitoring/security/cost in `recommendationsJson` + `estimatedCostJson` |
| 8 | Generate Stakeholder Handover | `report-generator` | `HandoverReport.{engineer,stakeholder}Markdown` |

`CloudInstallation.status`: `draft → configuring → ready → installing → installed → failed` already
models this; steps 4–7 occupy `draft → configuring → ready`. Steps 2–7 are **deterministic**; step 8
adds AI narration on top of the deterministic payload.

---

## 5. Operational Ownership Model

The product's emotional payoff. Render ownership as **structured assertions**, each tied to a concrete
Azure resource the plan provisions — so "you own it" is demonstrable, not a slogan.

```
You own…            backed by…
─────────           ──────────────────────────────
The Azure tenant    Subscription + resource group (tagged)
The users           Microsoft Entra External ID directory
The data            Azure PostgreSQL Flexible Server + Blob Storage
The monitoring      Application Insights + Log Analytics workspace
The security        Front Door + WAF + Defender for Cloud
The costs           Cost Management + Budgets on the resource group
```

Each ownership claim links to: the resource that backs it, the migration mapping that produced it, and
any clarification still open. Framing throughout: *"RapidMVP promotes ownership over convenience."*

---

## 6. Engineer Guide Structure

Technical deployment guide (extends `report-generator.ts` engineer output):

1. **Executive technical summary** — stack, app type, target Azure shape (one paragraph).
2. **Detected architecture** — what was delivered (facts + evidence).
3. **Migration mapping table** — Current → Azure → Complexity → Notes (from §2).
4. **Required Azure resources** — type, SKU/tier, purpose, dependencies.
5. **Secrets & configuration matrix** — env var → classification → Azure Key Vault entry (names only).
6. **Deployment steps** — ordered, with dependencies (provision → configure → migrate data → deploy → verify).
7. **Infrastructure dependencies** — resource graph / ordering constraints.
8. **Operational setup** — App Insights wiring, WAF/Front Door, Defender enablement.
9. **Assumptions** — what was inferred and on what basis.
10. **Requires clarification** — open questions blocking a clean cutover.
11. **Verification checklist** — health checks, smoke tests post-deploy.

---

## 7. Stakeholder Report Structure

Operational ownership report (non-technical; extends stakeholder markdown). Deliberately framed around
the three questions the brand promises:

1. **What was delivered** — plain-English description of the application.
2. **What it needs to run on Azure** — resources as outcomes, not SKUs.
3. **What you will own** — the ownership model from §5.
4. **Estimated monthly cost range** — £/$ band (from §9), with the drivers.
5. **Readiness** — a confidence verdict, framed as progress, never as pass/fail blame.
6. **Decisions required** — what stays vs migrates, in business terms.
7. **What still requires clarification** — neutral open questions.
8. **Recommended next steps** — momentum-oriented.

**Tone rules (enforced):** present *findings, requirements, clarifications, decisions* — never *fault,
errors by developers, criticism*. No state called "broken"; only "needs clarification" or "is a risk
to address."

---

## 8. Architecture Diagram Strategy

Two views from the existing `architecture-model.ts` graph (nodes + edges + confidence already exist):

- **As-delivered view** — what the repo currently uses (today's output; keep).
- **Target Azure view (NEW)** — the same graph re-projected onto Azure services via the mapping
  registry. Nodes carry the migration decision (remain = solid, migrate = highlighted) and complexity.
- **Confidence styling stays** — `detected / likely / requires_clarification`; never invent nodes.

Render in-app interactively (reuse `components/architecture/*`) and as a static export embedded in
both reports. A side-by-side *current → Azure* diptych is the single most persuasive stakeholder
artifact — prioritize it.

---

## 9. Cost Visibility Strategy

Two horizons; ship the first, design for the second.

**Phase A — Estimation (no Azure account needed):**
- A deterministic `azure-cost-model` maps each recommended resource + SKU/tier → an indicative
  monthly **£/$ band** (low–typical–high). Region-aware, updated from Azure retail price data.
- Output a **range**, never a false-precision figure; list the cost drivers.
- Persist in `estimatedCostJson`; surface in both reports.

**Phase B — Actuals (post-provision, later):**
- Once the tenant exists, pull from **Azure Cost Management API** against the tagged resource group;
  reconcile estimate vs actual; wire **Azure Budgets** alerts.
- Enforce **resource tagging** (project, environment, owner) at blueprint generation so cost slicing
  works from day one.

Filling the cost gap is high-value: today the output has SKU strings but **no monetary figures**.

---

## 10. Security Strategy

**Recommended target posture** (derived from the resource set, recommendation-only):
- **Identity** — Microsoft Entra External ID (recommended when a non-Azure auth provider is detected;
  remain allowed).
- **Secrets** — every detected secret env var → **Azure Key Vault** entry (the engine already stores
  *names only*, never values — preserve this invariant everywhere).
- **Edge** — Azure Front Door + WAF in front of App Service.
- **Posture** — Microsoft Defender for Cloud enablement; secure-score as an operational signal.
- Findings typed as `risk` with a remediation recommendation — never `failure`.

**Platform security invariants (per `CLAUDE.md`):** do **not** touch `app/api/auth/*`, `infra/`, or
SuperTokens config. Any future stakeholder **share link** must be tokenized, read-only, expiring, and
scope-limited — and must **never** expose secret *values* (verify the report renderer honors the
names-only rule).

---

## 11. Monitoring Strategy

RapidMVP recommends and wires; it does not replace Azure's tools (ownership principle):

- **Application Insights + Log Analytics workspace** as required resources in every blueprint.
- **Engineer guide** includes the App Insights instrumentation/connection steps for the detected stack.
- **Founder-readable framing** in the stakeholder report: three questions — *Is it up? Is it fast? Are
  users hitting errors?* — rather than raw telemetry.
- Deep-link to the real Azure portal resources so there is no lock-in.
- (Later, optional) an AI "health in plain English" narrator over telemetry — read-only.

---

## 12. Future Extensibility Strategy (Azure-only)

Extensibility stays **inside Azure** — explicitly no AWS/GCP, no template/site builders.

- **Mapping registry growth** — add detected-service → Azure-service rules as new technologies are
  detected. The registry is the natural extension point.
- **Detector plugins** — `service-detector` parsers are already evidence-based and plugin-shaped; open
  them for new frameworks/services.
- **IaC export** — generate Bicep/Terraform from the blueprint resource graph (deterministic; a
  natural next artifact after the deployment steps).
- **Deeper Azure coverage** — Container Apps / AKS as alternative hosting when containerization is
  detected; Azure OpenAI mapping when AI providers are present and policy requires it.
- **Provisioning** — from guidance → optional one-click apply against the user's tenant (advanced).
- **Re-inspection / drift** — leverage the existing `supersedesId` version chain to diff
  architecture and blueprint across repo versions.

Keep `CloudInstallation.provider` as a defaulted constant; **do not branch on it** — this avoids
re-introducing the multi-cloud complexity the vision removed.

---

## 13. Recommended UI Flow

Single-object, single-page journey (no tabs sprawl). A repository package is the top-level object the
user owns.

```
/repositories                  → list: name, readiness, status, last run; CTA "+ New analysis"
/repositories/new              → upload ZIP
/repositories/[id]             → one scrollable page with a progress stepper:
     ① Delivered        (detected stack + summary)
     ② Validation       (consistency findings — neutral framing)
     ③ Migration Plan   (Current → Azure mapping table; remain vs migrate)   ← NEW
     ④ Cloud Blueprint  (Azure resources, secrets matrix, deployment steps)
     ⑤ Operations       (monitoring / security / cost band)                   ← NEW
     ⑥ Architecture     (current ↔ Azure diptych)
     ⑦ Handover         (engineer + stakeholder reports; share link)
```

Stepper communicates progress and "what's next"; locked steps show what unlocks them. Reuse existing
`components/repository/*` and `components/architecture/*`; add `MigrationPlanTable`, `OperationsPanel`,
`CostBand`, and the Azure-target diagram.

---

## 14. Recommended Data Models

Additive only — no destructive migration; existing rows keep working.

**Extend `CloudInstallation`:**
- `migrationMappingJson` — the §2 mapping array (typed shape).
- `assumptionsJson`, `clarificationsJson` — blueprint questions 8 & 9.
- `estimatedCostJson` — §9 cost band.
- `shareToken? @unique`, `sharedAt?` — if/when stakeholder share ships.

**Keep as-is:** `RepositoryPackage` (detection + version chain), `HandoverReport`, `DocumentUpload`,
all auth/account models.

**Typed contracts (in code, not DB):** `MigrationMapping`, `AzureResource`, `SecretRequirement`,
`DeploymentStep`, `Assumption`, `Clarification`, `CostBand` — one shared definition consumed by engine
and UI.

**Do not** add provider-discriminated tables or AWS/GCP fields.

---

## 15. Recommended Route Structure

Extend the existing `api/v1/repositories/*` surface; keep auth/admin/me/leads untouched.

```
api/v1/repositories
  ├ route.ts                                  (list / create — exists)
  ├ [id]/inspect                              (detect + validate — exists; extend to emit mapping)
  ├ [id]/installations                        (create/list Azure blueprint — exists)
  ├ [id]/installations/[installId]/plan       NEW — migration mapping + steps (idempotent regenerate)
  ├ [id]/installations/[installId]/cost       NEW — compute/refresh cost band
  ├ [id]/installations/[installId]/report     (engineer + stakeholder — exists; extend)
  └ [id]/installations/[installId]/share      NEW — issue/revoke read-only token

app/r/[token]/page.tsx                        NEW — public, read-only stakeholder report
```

`documents/upload-url` + `documents/confirm` stay as the ZIP ingest path.
**Untouched:** `api/auth/*`, `infra/`, SuperTokens config.

---

## 16. Recommended Implementation Phases

Each phase is independently shippable and leaves the app working. The developer runs all
git/Prisma/npm operations (per `CLAUDE.md`); the assistant prepares migrations against staging only.

**Phase 1 — Migration Mapping layer (the core gap).**
- Build the mapping registry (§2) consuming `service-detector` output.
- Add `migrationMappingJson` to `CloudInstallation` (additive migration).
- Surface the Current → Azure table in `/repositories/[id]` (step ③) and the engineer guide.
- Snapshot-test the registry against representative repos.

**Phase 2 — Blueprint completeness.**
- Extend `azure-assessor` to emit assumptions + clarifications; add the secrets/config matrix view.
- Add `assumptionsJson` / `clarificationsJson`; render blueprint step ④ fully.

**Phase 3 — Cost visibility.**
- Build `azure-cost-model` (tier → £/$ band); add `estimatedCostJson`; render `CostBand` + put the
  range in the stakeholder report.

**Phase 4 — Operational plan + Azure architecture view.**
- Operational layer (monitoring/security recommendations) into step ⑤.
- Target-Azure diagram projection (§8) — current ↔ Azure diptych.

**Phase 5 — Reporting polish + stakeholder share.**
- Extend `report-generator` to the full §6/§7 structures; add AI narration over the deterministic
  payload (Sonnet/Haiku for phrasing only).
- Share link route + public read-only page (verify secret-value safety + auth boundary).

**Cross-cutting:** retire/replace stale `docs/refactor-roadmap.md`; keep `provider` un-branched.

---

## 17. Estimated Effort

| Phase | Scope | Effort |
|---|---|---|
| 1 | Migration Mapping registry + UI + tests | **4–6 days** |
| 2 | Blueprint assumptions/clarifications + secrets matrix | **3–4 days** |
| 3 | Azure cost model + cost band UI | **3–5 days** |
| 4 | Operational plan + Azure target diagram | **4–6 days** |
| 5 | Report structures + AI narration + share link | **5–7 days** |
| | **Total** | **~19–28 days (4–6 weeks)** |

Risk is **low–medium throughout**: every change is additive to a schema and engine that are already
Azure-first. The highest-value, lowest-risk first move is **Phase 1** — it closes the one true gap
(per-component migration mapping) and immediately makes the product answer its guiding question.

---

## Guiding principle (anchor for every decision)

> RapidMVP exists to answer: **"I have this repository. How do I turn it into a platform I own on
> Azure?"** — by presenting findings, requirements, clarifications, and decisions in neutral language,
> and by promoting **ownership over convenience**.
