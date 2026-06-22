> 🗄️ **ARCHIVED — NOT THE CURRENT DIRECTION (2026-06-22).** This explored a wide vision (Venture
> root model, Startup Builder, multi-cloud, marketplace) that was subsequently **rejected**. The
> finalized direction is **Azure-only**, with the repository ZIP as the source of truth and no
> Venture/Startup Builder/marketplace scope. See **`../azure-migration-planning-strategy.md`** and
> **`../stage-1-implementation-plan.md`**. Retained only as a record of the wider exploration.

# RapidMVP — Product & Architecture Transformation Plan

> From a repository-analysis tool into an **Entrepreneur Platform Builder** that helps
> founders transform a Minimum Viable **Product** into a Minimum Viable **Platform**.
> `Idea → Product → Platform → Operational Business`.

This is a product transformation roadmap, not an implementation spec. It contains no code
and prescribes no migrations — it describes the target architecture and the path to it.

---

## 0. The Central Reframe

Today the product is a **funnel**: `Upload ZIP → Inspect → Cloud plan → Handover report`. One
entity (`RepositoryPackage`) is the spine, and everything hangs off a single uploaded artifact.

The new product is a **lifecycle**: `Idea → Product → Platform → Operational Business`. The spine
is no longer "a repository" — it's a **Venture** (the startup itself). A repository becomes *one
input* to a Venture, not the root object. This single shift drives almost every recommendation below.

**Design tension to hold throughout:** the current engine's greatest asset is that it is
*deterministic and evidence-based* — it never invents components, it marks things
"requires_clarification." The new vision adds generative/AI surfaces (Startup Builder). The rule:
**AI proposes, the deterministic engine verifies.** Never let generated scaffolding flow into a
stakeholder report without passing back through evidence-based validation. This is also how the
"never assign blame, never shame developers" promise is kept — findings stay framed as
*known / needed / to-clarify*.

---

## 1. New Product Architecture

Eight product areas map onto three lifecycle stages plus a continuous operations layer:

```
                          ┌─────────────────── VENTURE (new root entity) ───────────────────┐
                          │                                                                   │
   STAGE 1: CREATE        STAGE 2: UNDERSTAND        STAGE 3: BUILD          CONTINUOUS: OPERATE
   ─────────────          ──────────────────         ─────────────          ───────────────────
   1. Startup Builder     2. Repository Intelligence  5. Platform Builder    8. Platform Operations
      (generative)           (deterministic)             (prescriptive)         (telemetry)
                          3. Architecture Overview                              ├ Monitoring
   Journey A entry           (visual)                 9. Azure Reference        ├ Cost
   "Start new startup"    4. Cloud Blueprint             (Entra/ACS/KV/etc)     ├ Security
                             (recommendations)                                  └ Ownership
   Journey B entry        6. Operational Confidence
   "Upload repo"             (validation)
                          7. Stakeholder Handover
                             (trust comms)
```

**Architectural principle:** the eight areas are not eight features — they are **stages of one
state machine on the Venture**. A Venture moves through
`draft → scaffolded → analyzed → blueprinted → provisioned → operational`. Each product area reads
and advances that state. This is what makes Journeys A and B converge: Journey A *generates* the
artifacts that Journey B *uploads*, and from the "analyzed" state onward the two paths are identical code.

**Layering:**
- **Generation layer** (new, AI-assisted): Startup Builder.
- **Analysis layer** (exists, keep): Repository Intelligence + Consistency.
- **Prescription layer** (exists, extend): Cloud Blueprint + Platform Builder + Azure Reference.
- **Communication layer** (exists, extend): Architecture Overview + Stakeholder Handover.
- **Operations layer** (new): Monitoring + Cost + Security ownership.

---

## 2. New Navigation Structure

Replace the flat repo-centric nav with a **Venture workspace** shell. Two-level navigation: a global
bar (marketing + account) and a per-Venture sidebar (the workspace).

**Public / marketing nav** (unauthenticated):
```
Home  ·  Product ▾ (Startup Builder, Repository Intelligence, Platform Builder, Operations)
      ·  Azure Reference  ·  Pricing  ·  Docs  ·  Sign in / Start free
```

**Authenticated app shell** — global rail:
```
◇ Ventures (workspace switcher)   ⚙ Account   🔔   ?Help
```

**Per-Venture workspace sidebar** (the core IA — mirrors the lifecycle, not the database):
```
VENTURE: "MovieShaker"                    [status: Blueprinted]
─────────────────────────────────────────
  ▸ Overview              (venture dashboard / lifecycle map)
  CREATE
  ▸ Startup Builder       (scaffold site, pages, docs, app skeleton)
  UNDERSTAND
  ▸ Repositories          (uploads + generated, inspection results)
  ▸ Architecture          (visual diagram)
  ▸ Consistency           (validation & readiness)
  BUILD
  ▸ Cloud Blueprint       (Azure resource plan)
  ▸ Platform Builder      (infra / deploy / security guidance)
  OPERATE
  ▸ Monitoring            (App Insights views)
  ▸ Costs                 (budgets, tagging, spend)
  ▸ Security              (Defender posture, WAF)
  SHARE
  ▸ Handover Reports      (stakeholder + engineer)
  ▸ Stakeholders          (invite, share, comment)
```

The sidebar **is** the lifecycle. A founder always sees the whole journey and where they are in it —
that is the confidence-building, educational UX the vision demands. Sections that aren't reachable
yet are visible-but-locked with a "what unlocks this" hint (never greyed-out-and-silent).

---

## 3. New Information Architecture

Three planes:

1. **Marketing plane** (`/`, `/product/*`, `/azure-reference`, `/pricing`, `/docs`) — public,
   SEO-driven, educational. This is where the dual MVP/MVP message lives.
2. **Workspace plane** (`/v/[ventureSlug]/*`) — the authenticated product, organized by lifecycle
   stage (section 2).
3. **Share plane** (`/share/[token]`) — read-only, tokenized stakeholder views of handover reports
   and architecture diagrams. No login required for a stakeholder to receive trust.

**Content taxonomy** (every object a founder sees is one of):
- **Artifact** — something RapidMVP produced (scaffold, diagram, blueprint, report).
- **Finding** — an observation, always typed as `known | needed | to_clarify | risk`
  (never `error`/`failure`).
- **Recommendation** — a prescriptive next step tied to a finding.
- **Resource** — a concrete Azure (or external) service to be owned.

This four-type vocabulary should be enforced in the UI and the schema. It is the mechanism that
operationalizes "never assign blame": there is literally no UI state called "your code is broken" —
only "this needs clarification" or "this is a risk to address."

---

## 4. New Domain Model (conceptual)

Promote **Venture** to the aggregate root. Everything else becomes a child or a typed artifact of a Venture.

```
Venture (root)
 ├─ owned by Account/Org; has slug, stage, industry, oneLiner
 ├─ Origin: { type: "new_startup" | "uploaded_repo" }   ← unifies Journey A & B
 │
 ├─ Artifacts (polymorphic)
 │    ├─ ScaffoldArtifact      (from Startup Builder: site, pages, docs, app skeleton)
 │    ├─ RepositoryPackage     (existing — now a child of Venture, not root)
 │    ├─ ArchitectureModel     (existing — persisted, versioned)
 │    ├─ CloudBlueprint        (was CloudInstallation's plan half)
 │    └─ HandoverReport        (existing)
 │
 ├─ Findings[]   (typed known/needed/to_clarify/risk — replaces scattered JSON)
 ├─ Resources[]  (planned + provisioned Azure resources, with tags + cost)
 ├─ Environments[] (dev/staging/prod)
 ├─ Stakeholders[] (people invited to a Venture, with share scopes)
 └─ Operations
      ├─ MonitoringConfig   (App Insights connection, dashboards)
      ├─ CostSnapshot[]     (budget vs spend over time)
      └─ SecurityPosture    (Defender findings, WAF status)
```

**Key modeling decisions:**
- **Venture-as-root** lets Journey A (generate) and Journey B (upload) write into the *same*
  container. The Startup Builder produces a `ScaffoldArtifact`; that scaffold can then be inspected
  by the existing engine exactly as an uploaded ZIP would be. Convergence is achieved by construction.
- **Findings become first-class rows** instead of JSON blobs (`consistencyFindingsJson`, `risksJson`,
  `governanceFindings`). This is the single highest-value refactor — it makes findings queryable,
  filterable, trackable-over-time, and renderable consistently across analysis, blueprint, and reports.
- **Environments** are promoted out of a string field, because operations (monitoring/cost/security)
  are per-environment.

---

## 5. New User Journey Design

**Journey A — Start a New Startup (generative entry):**
```
1. "What are you building?" → one-liner + industry + audience  (creates Venture, stage=draft)
2. Startup Builder proposes: site structure, landing pages, docs skeleton, app skeleton
   → founder edits/approves                                     (stage=scaffolded)
3. Engine inspects the generated scaffold (same pipeline as uploads)
   → Architecture Overview + Consistency                       (stage=analyzed)
4. Cloud Blueprint: "here's your Azure platform"                (stage=blueprinted)
5. Platform Builder: infra/deploy/security guidance
6. Handover report + invite stakeholders                        (stage=ready to operate)
```

**Journey B — Upload Existing Repository (analytical entry):**
```
1. Create Venture, upload ZIP                                   (stage=draft)
2. Inspect (existing engine)                                    (stage=analyzed)
3. ── converges with Journey A at step 3 ──
4. Cloud Blueprint → Platform Builder → Handover → Operate
```

**Convergence point:** the moment a Venture reaches `analyzed`, both journeys share one codepath.
Journey A's only extra surface is the generation step; Journey B's only extra surface is the upload
step. Everything downstream — architecture, blueprint, platform, operations, handover — is built once.

**The continuous loop (the "Platform" payoff):** after `operational`, the founder re-enters at
Operations. New repo version uploaded → re-inspect → diff architecture → update blueprint → new
handover. The `supersedesId` versioning already in `RepositoryPackage` is the seed of this; promote
it to Venture-level "platform evolution timeline."

---

## 6. Startup Builder Architecture

This is the major *new* subsystem. It is generative, so it must be sandboxed from the
deterministic engine.

```
Intent Capture  →  Generation Planner  →  Generators  →  Assembler  →  Validation Gate  →  ScaffoldArtifact
 (founder Q&A)      (AI: structure)        (templated +    (writes a      (existing engine
                                            AI-filled)      virtual repo)   inspects the result)
```

- **Intent Capture:** structured Q&A (product type, audience, key entities, monetization). Cheap,
  deterministic form — *not* a freeform chat, to keep outputs scoped.
- **Generation Planner (AI):** Claude produces a *plan* (sitemap, page list, doc outline, app
  module list, suggested data entities) as **structured JSON against a schema** — never raw files
  first. This mirrors the existing engine's structured-output discipline.
- **Generators:** deterministic templates (Next.js + Tailwind, matching the house stack) with
  AI-filled slots for copy and entity-specific structure. Output is a **virtual repository** (the
  same `Map<path, content>` shape the `zip-reader` already produces).
- **Validation Gate:** the generated virtual repo is fed straight into
  `stack-detector`/`service-detector`/`consistency-checker`. **A scaffold a founder receives has
  already passed the same consistency bar as an uploaded repo.** This is the trust mechanism and it
  reuses 100% of existing code.
- **Output:** a `ScaffoldArtifact` + a downloadable ZIP + (later) a GitHub push.

**Build modules** (per the vision): Website framework · Landing pages · Startup page structure ·
Documentation structure · Initial application structure. Model each as a **Generator plugin** behind
a common interface so the marketplace (section 19) can add more later.

---

## 7. Repository Intelligence Architecture (evolution of what exists)

Keep the engine almost as-is — it's the crown jewel. Changes are about *reach* and *persistence*,
not rewriting detection:

- **Persist the `ArchitectureModel`** (currently computed and thrown away each request) as a
  versioned artifact, so architecture can be diffed across repo versions.
- **Normalize findings** out of JSON blobs into the `Findings[]` table (section 4) so consistency
  findings, Azure governance findings, and risks share one type and one renderer.
- **Add ingestion sources** beyond ZIP: GitHub/GitLab connect (read-only), and the in-platform
  `ScaffoldArtifact`. Abstract the `zip-reader` into a `SourceReader` interface (`ZipReader`,
  `GitReader`, `VirtualReader`) all returning the same file map. Low effort, high leverage.
- **AI seam already designed:** `summariseConsistencyForStakeholders()` is the intended Claude
  insertion point. Use Claude there to turn deterministic findings into plain-language narrative —
  *summarizing facts, never generating them.* This respects the "AI proposes, engine verifies" rule
  because here AI only *describes* already-verified output.

---

## 8. Platform Builder Architecture (prescriptive layer)

This sits between Cloud Blueprint (what to provision) and Operations (running it). It produces
**guidance artifacts**, not live infrastructure (RapidMVP guides ownership; it doesn't become the
founder's control plane on day one).

```
CloudBlueprint + Findings  →  Platform Builder  →  three guidance tracks:
                                                    ├ Infrastructure (IaC outline: Bicep/Terraform skeleton, resource graph)
                                                    ├ Deployment (CI/CD outline, environments, migration/runbook steps)
                                                    └ Security (Entra setup, Key Vault secret mapping, WAF/Front Door, Defender enablement)
```

The existing `azure-assessor` already emits recommended services, blockers, risks, and *build
scripts* — Platform Builder is the productized, multi-track presentation of that, plus security and
deployment tracks it doesn't yet cover. Output stays in the "guidance + checklist" register
(educational, confidence-building), with each step linked to the Azure Reference (section 9) and to
a Finding that justifies it.

---

## 9. Azure Reference Architecture

Codify the "own the platform" stack as a **canonical reference model** that every Venture's blueprint
is measured against. Make it a first-class, versioned data structure (a "reference platform") so
blueprints become *"your stack vs. the recommended owned-platform stack."*

| Concern | RapidMVP-recommended (owned) | Detected-but-external (flag for migration) |
|---|---|---|
| Identity | **Microsoft Entra External ID** | SuperTokens/Auth0/Clerk/Firebase |
| Email | **Azure Communication Services Email** | SendGrid/Resend/Postmark |
| App | Next.js / React / TypeScript | — |
| Styling | Tailwind | — |
| Database | **Azure PostgreSQL Flexible Server** | RDS/Supabase/PlanetScale |
| Storage | **Azure Blob Storage** | S3/DO Spaces/GCS |
| Secrets | **Azure Key Vault** | .env in repo (existing detector already flags this) |
| Monitoring | **App Insights + Log Analytics** | none/3rd-party |
| Edge/Security | **Front Door + WAF + Defender for Cloud** | Cloudflare |
| Payments | **Stripe** (default; honor incumbent) | — |
| Cost | **Cost Management + Budgets + tagging** | — |

The `service-detector` *already identifies* the external providers in the right column. The new work
is the **gap-and-migration view**: for each detected external service, show the owned Azure
equivalent, the ownership benefit, and a migration note. This directly delivers "own the users / own
the email / own the monitoring." Crucially, frame migrations as *recommendations*, never as "you did
it wrong" — honor incumbents (e.g., Stripe stays, existing payment providers are respected).

**Note on RapidMVP's own auth:** the platform currently runs on SuperTokens (CLAUDE.md marks
`app/api/auth/` and `infra/` as do-not-touch). The Azure-native recommendation is for *customer*
ventures; RapidMVP's own auth migration is a separate, later, explicitly-confirmed decision — out of
scope for this plan.

---

## 10. Monitoring Architecture

New operations subsystem. RapidMVP doesn't replace App Insights — it **configures, connects to, and
curates** it for non-DevOps founders.

```
Venture → MonitoringConfig (App Insights resource id + Log Analytics workspace)
        → Curated Dashboards (founder-readable): "Is it up?", "Is it fast?", "Are users hitting errors?"
        → Alert Recipes (templated): availability, error-rate, latency, dependency failures
        → AI narrator: weekly "health in plain English" summary (Claude over telemetry, read-only)
```

- **Founder view:** three traffic-light questions, not 40 charts. Confidence-building, educational.
- **Engineer view:** deep links into the real App Insights/Log Analytics so RapidMVP never becomes a
  lock-in (ownership principle).
- **Setup track:** Platform Builder emits the App Insights wiring; Monitoring consumes it. The
  hand-off is the `MonitoringConfig` artifact.

---

## 11. Security Architecture

Two layers: securing *RapidMVP itself*, and the *security guidance RapidMVP gives ventures*.

**Venture-facing security posture** (new):
```
SecurityPosture per Venture/Environment, aggregating:
  ├ Identity:   Entra External ID configured? MFA? (recommendation if SuperTokens/etc detected)
  ├ Secrets:    .env-in-repo findings (engine already detects) → Key Vault migration
  ├ Edge:       Front Door + WAF enabled?
  ├ Defender:   Defender for Cloud secure-score ingestion
  └ Findings → typed as `risk`, never `failure`; each with a remediation recommendation
```

**RapidMVP-platform security** (ongoing): the existing boundaries in CLAUDE.md (per-app first-party
sessions, no cross-domain cookies, auth core isolation) stay sacrosanct. The share plane
(`/share/[token]`) needs careful scoping — tokenized, read-only, expiring, scope-limited to specific
artifacts — since it exposes Venture data without login.

Security language stays in the brand register: "here's what to strengthen," never "here's what's
wrong with you."

---

## 12. Cost Management Architecture

The "own your costs" pillar. Founders fear surprise cloud bills; this is a major trust surface.

```
Venture → Resources[] (each tagged: venture, environment, owner, costCenter)
        → CostSnapshot[] (periodic pull from Azure Cost Management API)
        → Budgets (founder sets a monthly ceiling per environment)
        → Projections (blueprint-time estimate → actual-spend reconciliation)
        → Alerts (approaching budget; anomaly)
```

- **Blueprint-time estimate → runtime actual:** the Cloud Blueprint already recommends service
  *tiers*; attach indicative costs there, then reconcile against real `CostSnapshot` data once
  operational. The gap between "estimated" and "actual" is a powerful founder-trust artifact.
- **Tagging discipline** is enforced at Resource creation in Platform Builder so Cost Management can
  slice by venture/environment from day one.

---

## 13. Stakeholder Experience Design

Stakeholders (investors, co-founders, clients) are non-technical and need **trust, not detail**.

- **Share plane (`/share/[token]`):** no-login, read-only, beautiful. Shows: what the platform *is*
  (architecture diagram), what's *done*, what's *needed*, what's *to clarify* — the four-type
  vocabulary, visualized.
- **Tone engine:** the `HandoverReport.stakeholderMarkdown` already separates stakeholder vs.
  engineer audiences. Extend with the AI narrator (Claude) to render findings in plain, blame-free
  language: *"Three items need clarification before launch"* not *"3 critical errors."*
- **Confidence dashboard:** a single readiness gauge (the existing
  `readinessScore`/`consistencyScore`) framed as progress, with the explicit three-question framing:
  **What do we know? What do we need? What still requires clarification?**
- **Stakeholder comments:** lightweight threaded clarification per finding, so the "help
  stakeholders, developers and infra engineers work together" goal becomes a real collaboration surface.

---

## 14. Entrepreneur Experience Design

The founder is the primary user. Their experience principles:

- **One lifecycle map, always visible** (the sidebar). The founder is never lost about "what's next."
- **Progressive disclosure:** founder-readable summaries on top, "show me the detail" expands to
  engineer view. Same data, two altitudes.
- **Educational by default:** every recommendation answers *why* (links to Azure Reference, explains
  the ownership benefit). The product teaches platform-thinking, converting an MVP-builder into a
  platform-owner.
- **Momentum > completeness:** the UX celebrates advancing a stage, and frames gaps as "next steps,"
  never "blockers/failures." This is the anti-consultancy, anti-audit tone the vision mandates.
- **No DevOps required:** every operational concept (monitoring, cost, security) is presented as a
  guided, opinionated, owned-by-default recipe.

---

## 15. Suggested Prisma Refactor (design sketch — not a migration)

Direction, not DDL. The migration history shows prior models (ClientBlueprint, VisionWorkflow, etc.)
were tried and removed; this refactor is deliberately incremental and additive so the working
pipeline never breaks.

**Phase 1 — introduce the root without breaking the pipeline:**
- Add `Venture` (id, slug, accountId, oneLiner, industry, stage enum, originType enum, timestamps).
- Add nullable `ventureId` to `RepositoryPackage`. Backfill: one Venture per existing package. The
  current `AccountProfile → RepositoryPackage` chain keeps working throughout.

**Phase 2 — normalize findings (highest-value change):**
- Add `Finding` (id, ventureId, sourceArtifactId, category, type `known|needed|to_clarify|risk`,
  severity, title, detail, recommendation, status). Migrate `consistencyFindingsJson`, `risksJson`,
  governance findings into rows. Keep JSON columns as a transitional fallback, then drop.

**Phase 3 — model new subsystems:**
- `ScaffoldArtifact`, `Environment`, `Resource` (with tags + cost fields), `Stakeholder` +
  `ShareToken`, `MonitoringConfig`, `CostSnapshot`, `SecurityPosture`.
- Split `CloudInstallation` into `CloudBlueprint` (the plan) and `Provisioning`/`Resource` (the
  actuals) — today one model conflates "recommended" and "installed."
- Persist `ArchitectureModel` as a versioned row (currently ephemeral).

**Enums to add:** `VentureStage`, `VentureOrigin`, `FindingType`, `FindingStatus`, `ResourceState`.
Keep existing `SiteRole`/`AccessStatus`.

**Non-negotiables:** every change additive-then-subtractive; no destructive migration on
`RepositoryPackage`/`CloudInstallation`/`HandoverReport` until the Venture root is proven in production.

---

## 16. Suggested Route Structure

Move from flat to **Venture-scoped** under a workspace segment, preserving existing routes during transition.

```
app/
  (marketing)/
    page.tsx                      /                    home (dual-MVP message)
    product/[area]/page.tsx       /product/startup-builder, /product/repository-intelligence …
    azure-reference/page.tsx      /azure-reference
    pricing/ docs/
  (workspace)/
    v/page.tsx                    /v                   venture list / switcher
    v/new/page.tsx                /v/new               Journey A vs B fork
    v/[venture]/
      page.tsx                    overview / lifecycle map
      builder/                    Startup Builder
      repositories/[repoId]/      (existing detail view, re-homed under venture)
      architecture/
      consistency/
      blueprint/
      platform/
      monitoring/  costs/  security/
      handover/  stakeholders/
  (share)/
    share/[token]/page.tsx        /share/...           public stakeholder view
  account/  auth/                  (unchanged)
  api/
    auth/[...path]                 (UNCHANGED — do-not-touch core)
    v1/
      ventures/                    CRUD + stage transitions
      ventures/[id]/scaffold       Startup Builder generation
      ventures/[id]/repositories/  (existing repo routes re-homed)
      ventures/[id]/findings/
      ventures/[id]/blueprint/  /platform/  /monitoring/  /costs/  /security/
      ventures/[id]/share/         token issue/revoke
      me/  admin/  leads/          (unchanged)
```

Existing `/repositories/*` routes get 301-redirected to `/v/[venture]/repositories/*` after backfill.
`app/api/auth` and `infra/` untouched per CLAUDE.md.

---

## 17. Suggested Component Structure

Reorganize `src/components/` from flat-by-name to **feature-by-lifecycle**, reusing existing
components in place:

```
components/
  shell/            VentureSidebar, WorkspaceHeader, LifecycleMap, StageBadge
  builder/          IntentForm, GenerationPlanView, ScaffoldPreview, GeneratorPluginCard   (NEW)
  repository/       (existing — RepositoryDetailView, StackSummaryCard, EnvVarsTable …)    keep
  architecture/     (existing — ArchitectureOverviewTab, ArchitectureNode, graphLayout …) keep
  findings/         FindingsList, FindingCard, FindingTypeBadge (known/needed/clarify/risk) (NEW, replaces ConsistencyPanel internals)
  blueprint/        (evolve AzureServicesPanel) + AzureReferenceGap, MigrationSuggestion
  platform/         InfraTrack, DeploymentTrack, SecurityTrack                              (NEW)
  operations/       MonitoringDashboard, CostPanel, BudgetGauge, SecurityPosture           (NEW)
  handover/         (existing HandoverReportPanel) + ConfidenceGauge, ShareControls
  stakeholder/      ShareView, FindingComment, KnowNeedClarifyPanel                        (NEW)
  ui/               (existing primitives) + extend
```

**Reuse note:** the existing `platform-architecture/` components (the curated 7-stage pipeline
diagram) become the engine for the **LifecycleMap** in `shell/` — they already model "live vs
planned" stages, which is exactly the Venture lifecycle visualization.

---

## 18. Suggested AI Integration Points

Use Claude (the installed SDK) surgically, always honoring **"AI proposes/describes, deterministic
engine verifies."** Default to the latest Claude models.

| # | Surface | AI role | Guardrail |
|---|---|---|---|
| 1 | Startup Builder — Generation Planner | Propose sitemap/pages/docs/app structure as structured JSON | Schema-constrained output; result inspected by the deterministic engine before delivery |
| 2 | Startup Builder — copy/content fill | Generate landing/doc copy into templated slots | Templates fixed; AI fills slots only |
| 3 | Consistency summarization (`summariseConsistencyForStakeholders`) | Plain-language narrative of *already-found* findings | Describes facts only; cannot create findings (existing designed seam) |
| 4 | Stakeholder report tone | Render findings blame-free for non-technical readers | Operates on typed findings, not raw analysis |
| 5 | Monitoring narrator | Weekly "health in plain English" over App Insights telemetry | Read-only; links to source dashboards |
| 6 | Architecture explainer | Hover/chat "what is this component and why" | Grounded in the persisted ArchitectureModel |
| 7 | Migration advisor | Explain detected-external → Azure-owned trade-offs | Grounded in service-detector evidence |

The detection/analysis core stays **100% deterministic** — that is the product's credibility moat.
AI lives at the edges: generation (front) and narration (back).

---

## 19. Suggested Future Marketplace / Module Architecture

Make extensibility a first-class concept once the lifecycle is stable.

- **Generator plugins** (Startup Builder): each scaffold type (SaaS, marketplace, content site,
  mobile-backend) is a plugin behind a common `Generator` interface. Third parties (or RapidMVP) add verticals.
- **Reference Platform packs:** the Azure Reference (section 9) is one "platform pack." Future packs:
  AWS-owned, GCP-owned, EU-data-residency, HIPAA-leaning. A Venture picks a pack;
  blueprint/gap analysis re-targets.
- **Detector plugins:** the `service-detector`'s evidence-based parsers are already plugin-shaped —
  open them so the ecosystem can add framework/service detectors.
- **Operations integrations:** monitoring/cost/security connectors as modules (App Insights first; others later).
- **Module model:** `Module` (id, kind: generator|platform-pack|detector|integration, version,
  publisher, scopes). Billing/marketplace ride on the existing multi-tenant `Site` infrastructure.

Keep the marketplace *aspirational* until Stages 1–3 are solid — it's an 18–24 month concern, listed
here so today's interfaces (Generator, SourceReader, Platform Pack) are designed plugin-ready from the start.

---

## 20. Suggested 24-Month Product Roadmap

**Q1 (months 1–3) — Foundation & reframe**
- Introduce `Venture` root (Prisma Phase 1); re-home repositories under ventures; redirects.
- New workspace shell + lifecycle sidebar; marketing site reframed to dual-MVP message.
- Normalize `Finding` model (Phase 2). No new capability yet — pure structural enablement.

**Q2 (months 4–6) — Startup Builder v1 (Journey A)**
- Intent capture → Generation Planner (AI, schema-constrained) → templated generators → validation
  gate (reuses engine) → downloadable scaffold.
- Convergence proven: generated scaffold flows through existing inspection.

**Q3 (months 7–9) — Cloud Blueprint + Azure Reference + Platform Builder v1**
- Persist `ArchitectureModel`; Azure Reference gap/migration view; Platform Builder three-track
  guidance (infra/deploy/security).
- GitHub/GitLab read-only ingestion (`SourceReader` abstraction).

**Q4 (months 10–12) — Stakeholder Experience + Share plane**
- Tokenized read-only share views; confidence dashboard; AI narrator for handover tone; stakeholder
  comments. First "trust" milestone shippable to investors/clients.

**Year 2, H1 (months 13–18) — Operations layer (the "Platform" payoff)**
- Monitoring (App Insights config + curated dashboards + narrator).
- Cost Management (tagging, snapshots, budgets, estimate-vs-actual).
- Security posture (Defender/WAF/Key Vault gap view). Ventures can now *operate*, not just deploy.

**Year 2, H2 (months 19–24) — Scale & ecosystem**
- Platform evolution timeline (versioned re-inspection, architecture diff).
- Marketplace/module architecture v1: generator plugins + a second platform pack.
- Provisioning beyond guidance (optional IaC apply) for advanced founders.

**Sequencing logic:** structure first (Q1) so nothing built later fights the schema; then the *new*
front door (Startup Builder, Q2) to realize the dual-MVP identity; then deepen the existing strength
(blueprint/platform, Q3); then trust comms (Q4); then the operational moat (Y2H1) that turns
"Product" into "Platform"; finally ecosystem (Y2H2).

---

## Closing: How the evolution preserves what works

Every existing capability survives and gets *promoted*, not replaced:

| Today | Becomes |
|---|---|
| `RepositoryPackage` as root | A child artifact of `Venture` |
| Deterministic engine (`src/lib/repository/`) | Unchanged core + a new `SourceReader` front and AI narration back |
| `azure-assessor` | The kernel of Cloud Blueprint + Platform Builder + Azure Reference gap analysis |
| JSON findings blobs | First-class typed `Finding` rows (known/needed/to_clarify/risk) |
| `HandoverReport` dual-audience | Stakeholder Experience + Share plane |
| `platform-architecture/` diagram | The Venture LifecycleMap |
| Unused Anthropic SDK | Seven guard-railed AI surfaces, generation-front + narration-back |

The deterministic, blame-free, evidence-based character of the current tool is the foundation the
entire platform vision stands on — the transformation *extends its reach* (a Venture root, a
generative front door, an operations tail) without compromising the credibility that makes it trustworthy.
