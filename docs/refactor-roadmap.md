# RapidMVP Refactoring Roadmap
### Repository → Cloud Blueprint Platform

**Framing throughout:** Developers build the **Minimum Viable Product**. → **RapidMVP** analyses it. → It generates the **Minimum Viable Platform** needed to run it securely in the company cloud.

Three sequential phases. Each is independently shippable and leaves the app in a working state. Auth (`src/app/api/auth/*`), `infra/`, and SuperTokens config are **untouched in all phases** (per `CLAUDE.md`).

**Sequencing principle:** Phase 1 *deletes* (lowest risk, no data migration). Phase 2 *restructures ownership* (one focused migration). Phase 3 *adds* (generalisation + new capability).

---

## Roadmap at a glance

| | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| **Theme** | Delete consultancy | Promote repo analysis | Blueprint + report + multi-cloud foundation |
| **DB migration** | None | 1 (destructive — drops 10 models, renames) | 1 (additive + renames via `@map`) |
| **Risk** | Low | Medium | Medium |
| **Effort** | 2–3 d | 4–6 d | 6–9 d |
| **Shippable?** | Yes | Yes | Yes |

**Execution notes for VSCode:** after each deletion group run `npx tsc --noEmit` and watch the Problems panel; do all Prisma migrations against a staging DB and hand the actual `migrate`/`git` operations to the developer (`CLAUDE.md` forbids the assistant running them). Write the engine unit tests in Phase 1 — they de-risk Phases 2 and 3.

---

## Phase 1 — Strip the Consultancy Layer & Simplify Navigation

### Goal
Remove every consultancy/assessment-tool workflow and collapse the 7-tab workspace so the product reads as a single repository-analysis tool. **No data-model changes yet** — this phase is pure deletion and navigation simplification, making Phase 2 safe to reason about.

### User-visible changes
- Workspace sub-tabs (Assessment, Costs & Risks, Build Scripts, Documents, Acceptance, Financial) disappear. Only **Repository analysis** remains inside a blueprint.
- Top nav loses **Architecture Library, Blueprints, Insights**; `/clientbuild` wizard removed.
- "Start Session / Architecture Session" CTAs → **"Analyse a repository"**.
- Marketing home stops showing consultancy showcases (interim: trimmed section list; full rebuild in Phase 3).

### Database changes
**None.** Models stay in `schema.prisma` but become unreferenced by app code. (They're physically dropped in Phase 2's migration, once code no longer reads them — avoids a broken intermediate state.)

### API changes — Remove
- `src/app/api/v1/vision/route.ts`
- `src/app/api/v1/assessment/route.ts`
- `src/app/api/v1/costs-risks/route.ts`
- `src/app/api/v1/scripts/route.ts`
- `src/app/api/v1/acceptance/route.ts`
- `src/app/api/v1/financial/route.ts`
- `src/app/api/v1/documents/[documentId]/analyse/route.ts`
- `src/app/api/v1/documents/[documentId]/parse/route.ts`
- `src/app/api/v1/documents/[documentId]/route.ts`
- `src/app/api/v1/documents/route.ts` (generic list/CRUD)

**Keep (untouched this phase):** `documents/upload-url`, `documents/confirm` (still used by repo ZIP upload), all `repository-assessment/*`, `me/*`, `admin/users/*`, `leads`.

### UI changes — Pages to remove
- `src/app/workspace/blueprints/[id]/{assessment,costs-risks,scripts,documents,acceptance,financial}/page.tsx`
- `src/app/workspace/vision/page.tsx`
- `src/app/clientbuild/page.tsx`
- `src/app/insights/page.tsx`
- `src/app/architecture-library/page.tsx`, `src/app/blueprints/page.tsx`, `src/app/blueprints/[slug]/page.tsx`

### UI changes — Pages to refactor
- `Navigation.tsx` — replace `navItems` (Architecture Library / Blueprints / Insights / Contact) with `How it works / Contact`; CTA label → "Analyse a repository".
- `src/app/page.tsx` — remove `<BlueprintShowcase/> <ArchitectureLibrary/>` and other consultancy sections from the render list (interim trim; not yet rebuilt).
- `BlueprintSubNav.tsx` — reduce to a single item or delete (route table loses 6 tabs). Simplest: delete and have the blueprint page route straight to repository analysis.
- `workspace/blueprints/[id]/page.tsx` (if a redirect index exists) → point at `repository-install`.

### Components to remove
- `components/assessment/*`, `components/risks/*`, `components/scripts/*`, `components/documents/*`, `components/acceptance/*`, `components/financial/*`, `components/vision/*`, `components/scaffold/*`
- `components/blueprints/*` (BlueprintShowcase, BlueprintDetail, BlueprintArchitectureDiagram, BlueprintServiceStack, BlueprintWorkflowPreview)
- `components/ArchitectureLibrary.tsx`, `BlueprintShowcase.tsx`
- `lib/acceptance/*`, `lib/financial/*`, `lib/vision/*`, `lib/parsers/*`, `lib/ai/analysis-client.ts`
- `lib/scaffoldEngine.ts`, `lib/scaffoldConfig.ts`, `types/scaffold.ts`
- `data/blueprints.ts`, `constants/portfolio.ts`

### Components to refactor
- `Navigation.tsx`, `src/app/page.tsx` (interim trim only).
- `components/workspace/WorkspaceDashboard.tsx` / `BlueprintSubNav.tsx` — remove links to deleted tabs.

### Migration risk — Low
- No DB migration. Risk is **dangling imports / broken build** after deletion.
- Mitigation: delete leaf components first, then routes, then pages; run `tsc --noEmit` (or VSCode "Problems" panel) after each group. `RepositoryAssessment` still depends on `DocumentUpload` + `ClientBlueprint` — **do not delete those models or `repository-assessment/*`**.
- `lib/parsers` removal may let you drop heavy deps (pdf/docx) — defer `package.json` pruning to end of phase to avoid lockfile churn mid-work.

### Estimated effort
**2–3 days.** Mostly mechanical deletion + import cleanup + nav edits. Add 0.5 day to write unit tests for the three pure engine functions (`detectStack`, `detectEnv`, `assessAzureReadiness`) **before** Phase 2 touches them.

---

## Phase 2 — Promote Repository Assessment to the Primary Workflow

### Goal
Invert data ownership so **the analysed repository is the top-level object**, not a sub-resource of an artificially-created `ClientBlueprint`. Rename "Workspace/Blueprint" to "Projects". Deliver the single-page analysis journey (Upload → Analyze → Stack → Config → Checks) replacing the old tabbed shell.

### User-visible changes
- `/workspace` → **`/projects`**: a list of analysed repositories showing readiness score, status, last run; primary CTA **"+ New analysis"**.
- A project is now **one analysed repo** on a single scrollable page with a progress stepper — no tabs.
- Uploading a repo no longer silently creates a "blueprint"; users see a **Project** they own directly.

### Database changes
*(One Prisma migration: `promote_repository_assessment`.)*
- **Rename** `ClientProfile` → `Account` (keep 1:1 to `User`).
- **Slim** `ClientBlueprint` → **`Project`**: drop relations to all Phase-1-removed models (`vision`, `assessments`, `risks`, `costs`, `scripts`, `architectureFindings`, `acceptanceReport`, `financialAssessment`). Keep `id, accountId, title, status, createdAt, updatedAt, repositoryAssessments`.
- **Drop** the now-orphaned models: `VisionWorkflow, BuildAssessment, EvidenceItem, CostEstimate, RiskItem, BuildScript, DocumentFinding, ArchitectureFinding, AcceptanceReport, FinancialAssessment`.
- **Fold** `DocumentUpload` into `RepositoryAssessment` as `sourceZipKey` / `sourceFileName` / `sizeBytes` fields, then drop `DocumentUpload` (it now only ever held the repo ZIP). *Optional but recommended — removes a join.*
- `RepositoryAssessment.clientBlueprintId` → `projectId`.
- Decide cardinality: **Project 1:1 RepositoryAssessment** (simplest) vs 1:many (keep history). Recommend 1:many, surface latest.

> This is the one destructive migration. The dropped tables are consultancy data with no production value, but **confirm with the developer before running** (they own all git/DB ops per `CLAUDE.md`).

### API changes
- **Refactor** `repository-assessment/start/route.ts` — create a `Project` (owned by `Account`) directly; stop the `status: 'repository_analysis'` blueprint hack.
- **Move/rename** under a clearer namespace (keep `repository-assessment` or alias to `projects`):
  - `repository-assessment` (list) → scope to `accountId`.
  - `repository-assessment/[id]/inspect` → keep (the detect→assess pipeline).
  - `documents/upload-url` + `documents/confirm` → **move to** `repository-assessment/[id]/upload-url` + `/confirm`, writing ZIP metadata onto the assessment.
- **Update** `lib/server/workspace-access.ts` → `account-access.ts`: `requireWorkspaceUser`→`requireAccountUser`, `requireBlueprintOwnership`→`requireProjectOwnership`.

### UI changes
- New `src/app/projects/page.tsx` (was `workspace/page.tsx`) — project list.
- New `src/app/projects/[id]/page.tsx` (was `workspace/blueprints/[id]/repository-install/page.tsx`) — full journey page.
- Promote `RepositoryAssessmentView` from sub-panel to the **project dashboard**, adding a stepper for `status: pending → analyzing → analyzed`.
- Update all internal links/redirects (`/workspace`, `/auth?redirectTo=…`) to `/projects`.

### Components to remove
- `components/workspace/BlueprintSubNav.tsx` (if it survived Phase 1), `BlueprintStatusCard.tsx`.
- `components/repository/SoftwareProjectAnalysisSection.tsx` (the vision-page embed) — its upload entry point moves into the project flow.

### Components to refactor
- `components/workspace/WorkspaceDashboard.tsx` → `ProjectsDashboard` (list of projects, not blueprints).
- `components/repository/RepositoryAssessmentView.tsx` → full-page project view with stepper sections (Stack / Config & Secrets / Cloud Resources / Checks).
- `components/repository/{RepositoryUploadPanel, StackSummaryCard, EnvVarsTable, AzureServicesPanel, AdminDocumentPanel}` — keep, restyle as journey sections.
- `lib/repository/*` — rename folder to `lib/analysis/*` (detection) + leave Azure assessor in place for Phase 3 to generalise.

### Migration risk — Medium
- Destructive table drops + column renames. Renames in Prisma are emitted as drop+add unless `@@map`/`@map` is used — **use `@map` to preserve data** on `ClientProfile→Account`, `ClientBlueprint→Project`, `clientBlueprintId→projectId`.
- FK from `RepositoryAssessment`/`DocumentUpload` must be re-pointed before parent renames.
- Mitigation: write the migration manually after `prisma migrate diff`; back up DB first; run against a staging copy. Existing `repo-analysis-*` blueprints carry real `RepositoryAssessment` rows — preserve them by mapping, not recreating.

### Estimated effort
**4–6 days.** ~1.5 days schema + migration (careful, destructive), ~2 days API/ownership refactor, ~2 days the single-page project UI + stepper, plus link/redirect sweep and regression test of the upload→inspect pipeline.

---

## Phase 3 — Cloud Blueprint Generation, Stakeholder Reporting & Multi-Cloud Foundations

### Goal
Turn the Azure-specific assessment into a **provider-agnostic Cloud Blueprint engine**, add **monetary cost estimation**, and ship the **dual-audience deployment report** (technical appendix + stakeholder decision document). Lay the multi-cloud abstraction so AWS/GCP are additive.

### User-visible changes
- Each project gains a **Cloud Blueprint** (required resources, deployment assets) and a **Deployment Report** — a shareable, dual-audience document with a plain-English app summary, **estimated monthly cost range (£/$)**, readiness verdict, risks, and security checks.
- A **provider selector** (Azure enabled; AWS/GCP "coming soon").
- Marketing home fully rebuilt around the product (Hero → How it works → Two audiences → Example report → Multi-cloud roadmap → Lead capture).
- Stakeholder share link (read-only) for the report.

### Database changes
*(Migration: `multi_cloud_and_report`.)*
- `RepositoryAssessment`: add `cloudProvider String @default("azure")`; **rename** `azureReadinessScore→cloudReadinessScore`, `azureServicesJson→cloudResourcesJson` (`@map` to preserve); add `estimatedMonthlyCostJson String?`; rename `adminDocumentMarkdown→deploymentReportMarkdown`.
- *(If share links ship)* add `shareToken String? @unique`, `sharedAt DateTime?`.

### API changes
- **Refactor** `repository-assessment/[id]/inspect` → emit provider-neutral `CloudAssessment` via the new registry (selected by `cloudProvider`).
- **Rename** `repository-assessment/[id]/generate-document` → `…/report`; produce the dual-audience report (calls cost model + AI summary).
- **New** `repository-assessment/[id]/share` (POST create/revoke token) + a public `app/r/[token]/page.tsx` read-only report route.
- **Consolidate** AI into one `lib/ai/client.ts` (Sonnet 4.6 for narrative summary / cost rationale, Haiku 4.5 for cheap classification) — replace the removed `analysis-client.ts`.

### UI changes
- New `components/report/*` — stakeholder report view (summary, cost band, readiness, risks, security, next steps) + technical appendix.
- New `components/project/CloudProviderSelector.tsx`.
- New marketing components under `components/marketing/*`; rebuild `src/app/page.tsx` (Hero, HowItWorks reframed, "Two audiences" split, example report, roadmap).
- New `app/how-it-works/page.tsx`; refactor `contact/page.tsx` (drop "two pathways" consultancy framing).

### Components to remove
- `AIArchitectPreview.tsx`, `ArchitectureFirst.tsx`, `TechnologyPillars.tsx`, `WhatYouReceive.tsx`, `WhyRapidMVP.tsx` — only if replaced by the new marketing set (audit each for reusable copy first).
- `components/repository/AdminDocumentPanel.tsx` → superseded by `components/report/*`.

### Components to refactor
- `lib/repository/azure-assessor.ts` → `lib/cloud/azure/assessor.ts` implementing a `CloudProvider` interface; extract service/tier/asset logic.
- `lib/repository/document-generator.ts` → `lib/report/deployment-report.ts` (dual-audience, consumes `CloudAssessment` + cost model + AI summary).
- New `lib/cloud/provider.ts` (interface), `lib/cloud/index.ts` (registry), `lib/cloud/azure/cost-model.ts` (**new** — tier→£/$ bands; this fills the biggest gap: there are currently *no* monetary figures, only SKU strings).
- `RepositoryAssessmentView` → consume provider-neutral shape + render report section.

### Migration risk — Medium
- Column renames (use `@map` to preserve data). The **abstraction refactor is the real risk**: moving Azure logic behind an interface can change output shape consumed by the UI and stored JSON.
- Mitigation: keep `CloudAssessment` a superset of today's `AzureAssessment`; snapshot-test `assessAzureReadiness` output before/after the refactor (tests written in Phase 1 pay off here). Ship cost model + report behind the existing Azure path first; add the interface as a non-breaking wrapper.
- Public share route adds an **auth-boundary surface** — ensure tokenised read-only access never exposes secret *values* (env-detector already stores names only; verify the report renderer honours this).

### Estimated effort
**6–9 days.** ~2 days cloud abstraction + Azure refactor (test-guarded), ~1.5 days cost model, ~2 days dual-audience report + share link, ~2.5 days marketing rebuild. AWS/GCP implementations are explicitly **out of scope** here — the phase only proves the abstraction with Azure.

---

## Target end-state vocabulary

| Old (consultancy) | New (product) |
|---|---|
| Architecture Session | Repository analysis |
| Client / Client Blueprint | Project / Account |
| Workspace | Projects / Dashboard |
| Assessment / Governance findings | Security & deployment checks |
| Build Scripts | Deployment assets |
| Azure Installation Document | Deployment Report |
| Azure readiness | Cloud readiness |

Anchor everything to: **Minimum Viable Product → RapidMVP → Minimum Viable Platform.**
