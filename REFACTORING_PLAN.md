# Codebase Refactoring Plan

This plan provides a structured, low-risk path to clean and stabilize the entire codebase while preserving feature delivery.

## Objectives

- Improve maintainability and consistency across frontend, microservices, and Python backend.
- Reduce duplication and dead code.
- Strengthen typing, test reliability, and operational observability.
- Make architecture boundaries explicit to speed onboarding and future changes.

## Guiding Principles

1. **Behavior-preserving first**: prioritize structural changes without changing business logic.
2. **Small, reversible batches**: short-lived branches and incremental merges by domain.
3. **Automated guardrails**: lint/type/test checks become mandatory before broad rewrites.
4. **Single source of truth**: remove parallel implementations that drift.
5. **Platform boundaries**: separate browser-only, server-only, and shared modules.

## Phase 0: Baseline & Guardrails (Week 1)

### Deliverables

- Repo-wide baseline report:
  - type errors/warnings
  - lint violations
  - test pass rate and coverage snapshot
  - large-file inventory and dependency hotspots
- Engineering standards document for naming, folder ownership, and import direction.
- CI quality gates (non-blocking first, then blocking by phase).

### Work Items

1. Add/normalize scripts for `lint`, `typecheck`, `test`, and dead-code analysis at root and service scopes.
2. Enable stricter linting incrementally (`no-explicit-any`, `no-console` allowlist, import ordering).
3. Add file-size and complexity checks for new/modified files.
4. Create architecture decision records (ADRs) for major boundary decisions.

## Phase 1: Repository Structure & Ownership (Week 1-2)

### Deliverables

- Clear workspace structure and ownership boundaries.
- Reduced root-level clutter from ad-hoc docs/scripts.

### Work Items

1. Introduce a workspace layout (example):
   - `apps/web`
   - `services/<name>`
   - `apps/python-backend`
   - `packages/shared` (types/utilities)
2. Move operational docs into `docs/` with sections (`architecture`, `deployment`, `runbooks`).
3. Move one-off scripts into `scripts/` and add usage index.
4. Add `CODEOWNERS` and per-workspace README files.

## Phase 2: Service Consolidation & Duplication Removal (Week 2-3)

### Deliverables

- Each microservice has one canonical implementation path.
- Dead/empty modules removed.

### Work Items

1. For each microservice, choose one source language/runtime (prefer TypeScript where already present).
2. Merge behavior from duplicate files (`src/index.ts` vs `index.js`) into canonical entrypoint.
3. Remove stale/empty modules (e.g., empty engine files) and update import graph.
4. Standardize service bootstrap patterns:
   - env validation
   - health/readiness endpoints
   - centralized error handling
   - logging middleware

## Phase 3: Domain-Oriented Decomposition (Week 3-5)

### Deliverables

- Oversized files split into focused modules.
- Better separation between orchestration, domain logic, and UI composition.

### Work Items

1. Split large audit and AI modules into feature slices:
   - `domain/` (pure logic)
   - `application/` (use cases/orchestration)
   - `infrastructure/` (DB, APIs, queues)
   - `ui/` (components/hooks)
2. Refactor large React components into container/presentational patterns.
3. Extract shared constants/types into dedicated modules to reduce circular imports.
4. Introduce internal APIs/interfaces at module boundaries.

## Phase 4: Type Safety & Runtime Contracts (Week 4-6)

### Deliverables

- Significant reduction in `any` usage and implicit contracts.
- Safer API boundaries.

### Work Items

1. Replace `any` in high-risk paths first (detection, reporting, audit workflow, auth/session).
2. Add runtime schemas (e.g., Zod) for external inputs and service payloads.
3. Introduce discriminated unions for job/result status models.
4. Move browser-only helpers out of shared server imports.

## Phase 5: Observability, Error Handling, and Resilience (Week 5-6)

### Deliverables

- Unified structured logging and error taxonomy.
- Consistent retry/fallback behavior for async jobs.

### Work Items

1. Introduce shared logger with structured context (`requestId`, `userId`, `jobId`, `module`).
2. Replace scattered console usage with logger abstraction.
3. Standardize error categories/severity and map to recovery strategies.
4. Add metrics for queues, model inference latency, and failure rates.
5. Add tracing hooks for cross-service operations.

## Phase 6: Test Strategy Hardening (Week 6-7)

### Deliverables

- Balanced unit/integration tests across critical domains.
- Reliable CI with fast feedback.

### Work Items

1. Add missing unit tests for extracted pure logic modules.
2. Add integration tests for core workflows:
   - upload -> detect -> persist -> report
   - auth -> session verify -> logout
   - audit submission -> review -> analytics
3. Introduce contract tests between frontend and API/microservices.
4. Stabilize flaky tests and isolate environment-dependent suites.

## Phase 7: Performance & Delivery Optimization (Week 7-8)

### Deliverables

- Faster local dev and CI.
- Reduced bundle/runtime overhead.

### Work Items

1. Analyze bundle size and remove unused dependencies.
2. Apply route/component lazy loading where appropriate.
3. Optimize hot paths in image/video processing and report generation.
4. Add caching policy and queue backpressure protections.

## Prioritization Matrix

### P0 (Immediate)

- Guardrails in CI (lint/type/test)
- Duplicate implementation removal in microservices
- Empty/dead module cleanup
- Runtime env/config validation

### P1 (Next)

- Large-file decomposition in audit and AI domains
- Type safety upgrades on critical paths
- Shared logging/error model

### P2 (After core cleanup)

- Performance tuning and deeper architecture extraction
- Optional monorepo tooling optimizations

## Risk Management

- Use feature flags/adapters when replacing core engines.
- Keep refactors behavior-preserving and ship in slices.
- Add migration checklists per phase with rollback paths.
- Track refactor metrics weekly:
  - avg file size
  - `any` count
  - test coverage
  - build time
  - defect escape rate

## Suggested Execution Cadence

- **Weekly planning**: choose 1-2 domains only.
- **Daily PR size target**: keep under ~400 changed lines when possible.
- **Definition of done for each slice**:
  - tests pass
  - lint/type checks pass
  - docs updated
  - no new architectural violations

## Success Criteria

- 50%+ reduction in oversized files (>400 LOC).
- 70%+ reduction in `any` in critical modules.
- Zero dual-implementation service entrypoints.
- Stable CI and reduced mean time to understand/modify key flows.
