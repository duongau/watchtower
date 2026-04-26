# Test Coverage Audit

> Systematic 5-phase process for verifying all features have automated test coverage, finding untested code paths, and identifying integration gaps.

## Confidence
low (validated once on Watchtower — discovered 42% line coverage, 52 untested features)

## Trigger Phrases
- "audit test coverage"
- "check if tests cover everything"
- "are all features tested"
- "test gaps"
- "what's untested"

## Process

### Phase 1: Coverage Baseline (Coordinator — direct)
Run automated coverage tools to establish numbers:
```bash
npm test                    # verify baseline passes
npx vitest --coverage       # generate line/branch/function coverage
```
Output: per-file coverage percentages, files with 0% coverage.

### Phase 2: Deep Test Gap Analysis (3 agents in parallel)

#### 2A: Feature-to-Test Mapping — Banner (QA)
Cross-reference the feature inventory (from docs audit) against test files:
- For each of the 156 features: which test file covers it?
- Count `it(` blocks per feature
- Categorize: ✅ well-tested, ⚠️ partial (happy path only), ❌ untested
- Output: `docs/audit/test-feature-mapping.md`

#### 2B: Untested Code Paths — Tony (Backend)
Analyze low-coverage server files:
- Grep for untested route handlers (compare `router.get/post` vs test assertions)
- Grep for untested `catch` blocks (error paths no test exercises)
- Grep for untested `process.env` branches (env-var-gated behavior)
- Check persistence layer: DB init failures, adapter error paths, schema-missing scenarios
- Output: `docs/audit/untested-code-paths.md`

#### 2C: Integration Gaps — Strange (Lead/Architect)
Assess cross-module boundaries:
- Does any test boot the actual Express server?
- Are adapter factory switches tested end-to-end?
- Are WebSocket/SSE handlers tested with real connections?
- What would break between units that no unit test catches?
- Output: `docs/audit/integration-gaps.md`

### Phase 3: Write Missing Tests (Banner + Tony fleet — parallel)
Batch by domain to avoid file conflicts:
- Banner-A: Frontend component tests
- Banner-B: Backend route/service error paths
- Tony: Integration tests (server boot, adapter switching, DB lifecycle)

### Phase 4: Runtime Smoke Test (Tony — sync)
Start actual server and verify end-to-end:
```
MC_MODE=local npm start (background)
curl /api/health → 200
curl POST /api/mc/agents → 201
curl GET /api/mc/agents → returns agent
Shut down → clean exit
```
Output: `docs/audit/smoke-test-results.md`

### Phase 5: Final Report (Banner — verification)
- Run full suite, compare before/after
- Calculate feature coverage %
- Output: `docs/audit/test-coverage-report.md`

## Key Learnings (Watchtower)
- 1801 tests passing but only 42% line coverage — heavily mocked unit tests
- 52 of 156 features had zero test coverage
- Auth middleware was completely untested (security risk)
- Zero integration tests — no test boots the server
- Same lesson as docs audit: having test FILES ≠ having coverage

## Output Files
- docs/audit/test-feature-mapping.md
- docs/audit/untested-code-paths.md
- docs/audit/integration-gaps.md
- docs/audit/smoke-test-results.md
- docs/audit/test-coverage-report.md
