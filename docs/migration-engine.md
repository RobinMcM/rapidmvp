# Azure Migration Planning Engine

> The deterministic layer between **Repository Detection** and **Azure Blueprint Generation**.
> It answers, per detected component: *Current State → Recommended Azure State → Complexity →
> Decision → Notes*. It is **100% rule-based — no AI is ever used to determine a mapping.**

Flow:

```
Upload → Detect → Validate → Migration Mapping → Azure Blueprint → Operational Confidence → Handover
                              └──────────── this engine ────────────┘
```

---

## Modules

| File | Responsibility |
|---|---|
| `src/lib/repository/migration-mapper.ts` | The mapping engine + registry. Single source of Azure recommendations. |
| `src/lib/repository/operational-confidence.ts` | Re-aggregates engine signals into a 0–100% operational readiness score across 6 categories, in neutral language. |
| `src/lib/repository/architecture-model.ts` | Consumes `mapService()` for per-node Azure recommendations (no duplicate logic). |

The mapper consumes the **existing** detectors (`service-detector`, `stack-detector`) and feeds the
**existing** blueprint UI. Nothing was rewritten.

---

## Migration Mapper

### Public API

- `mapService(service: DetectedService): MigrationMapping` — map one detected service.
- `buildMigrationPlan(services, stack): MigrationPlan` — full plan, including the application-hosting
  row, grouped into `remain` / `migrate` / `clarify`.
- `buildOwnershipModel(plan, azureServices): OwnershipModel` — the "what you own" model.
- `buildAssumptions(plan)` / `buildClarifications(plan)` — derived blueprint artefacts.
- Presentation maps: `COMPLEXITY_LABEL`, `DECISION_LABEL`, `CATEGORY_LABEL`.

### `MigrationMapping` shape

```ts
{
  category, currentState, azureState, azureResource,
  complexity: 'none' | 'low' | 'medium' | 'high',
  decision:   'remain' | 'migrate' | 'requires_clarification',
  notes, detectedFrom, confidence,
}
```

### The registry (extension point)

`MIGRATION_REGISTRY` is an ordered list of rules. **The first rule whose `category` and `match`
(tested against the detected provider string) apply, wins.** To support a new technology, add a rule —
nothing else changes.

```ts
{
  category: 'database',
  match: /^postgres/i,
  azureState: 'Azure Database for PostgreSQL Flexible Server',
  azureResource: 'Azure Database for PostgreSQL Flexible Server',
  complexity: 'low',
  decision: 'migrate',
  notes: 'Same engine. Move the connection string to Key Vault…',
}
```

Current coverage: PostgreSQL, MySQL, SQLite, MongoDB, Redis, SQL Server, generic SQL (→ clarify);
all auth providers → Entra External ID; S3/Spaces/GCS → Blob (Azure Blob → remain); email → ACS;
Kafka/RabbitMQ/BullMQ/SQS/PubSub → Service Bus / Event Hubs; Stripe & AI providers → remain;
unmapped external integrations → remain; application hosting → App Service.

### Honor incumbents

`decision: 'remain'` is first-class. The engine **recommends** Azure; it never **forces** a
migration. Stripe and AI providers stay external by design; unmapped third-party APIs remain.

---

## Operational Confidence

`assessOperationalConfidence({ consistency, azure, stack, migrationPlan })` returns an
`OperationalConfidence` with an overall 0–100% score and six categories:

`Repository Structure · Dependency Validation · Environment Validation · Installation Validation ·
Build Validation · Cloud Readiness`

Each category has a status — **Validated / Partially Validated / Requires Clarification / Not Yet
Validated** — and neutral, blame-free signals. This is an **operational readiness** assessment, *not*
a code-quality or developer score. Language rule (enforced by test): never *Failed / Broken /
Incorrect / Developer Error*. Findings are reframed via a neutral phrase map.

Overall score = weighted blend (Cloud Readiness 30, Build 20, Installation 15, Environment 15,
Dependency 12, Structure 8).

---

## Data model (additive — no destructive migration)

New nullable columns on `CloudInstallation` (`prisma/schema.prisma`):

```
migrationMappingJson      // MigrationPlan
assumptionsJson           // Assumption[]
clarificationsJson        // Clarification[]
operationalConfidenceJson // OperationalConfidence
```

Existing rows and columns are untouched. Each JSON field has a strict shared TypeScript type imported
by both the engine and the UI.

### ⚠️ Required developer step (git/Prisma owned by the developer per `CLAUDE.md`)

The Prisma client must be regenerated and the migration applied before the app type-checks/builds:

```bash
npx prisma generate
npx prisma migrate dev --name add_migration_planning
```

Note: the generated client in this repo is currently behind the committed schema (it predates the
`RepositoryPackage`/`CloudInstallation` models), so `prisma generate` was already pending — these
columns fold into that same regeneration.

---

## Where it's wired

- **Inspect route** (`api/v1/repositories/[id]/inspect`): builds the plan, assumptions,
  clarifications and operational confidence; persists them; returns them.
- **Detail page** (`repositories/[id]/page.tsx`): parses the persisted JSON and hydrates the view.
- **UI** (`components/repository/`):
  - `MigrationPlanPanel` — *Migration Plan* tab (What Can Remain / Should Migrate / Requires Clarification).
  - `OwnershipModelPanel` — the ownership model, in the *Azure Blueprint* tab.
  - `OperationalConfidencePanel` — the *Operational Confidence* tab.
  - The *Azure Blueprint* tab also gained the deployment sequence, environment-variable matrix,
    Key Vault secret mapping, assumptions and clarifications.

---

## Tests

- `__tests__/migration-mapper.test.ts` — registry mappings, plan grouping, ownership, assumptions/clarifications.
- `__tests__/operational-confidence.test.ts` — six categories, score bounds, **neutral-language guard**, approved status labels.

Run: `npx vitest run src/lib/repository/__tests__/`
