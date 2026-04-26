---
name: "pipeline-07-verify"
description: "Final Verification — pre-merge checklist, full test suite, build verification, smoke testing, and post-merge monitoring for the CDA Extension."
domain: "pipeline"
confidence: "high"
source: "manual"
owner: "Lee (Verifier)"
step: 7
pipeline_position: "LAST — the merge gate"
prev_step: "pipeline-06-document"
---

## Context

Final verification is the last gate before merge. Lee independently validates that all 7 pipeline steps are complete, the build is clean, tests pass, and the feature works end-to-end. Nothing merges without Lee's sign-off.

**When this step runs:** After Iruka confirms documentation is complete (Step 6).

**Output:** Merge approval with verification report, or rejection with specific failures.

## Verification Philosophy

> **Trust, but verify.** Each prior step has an owner who confirms their work. Lee's job is to independently re-verify — not to redo their work, but to catch anything that slipped through.

Lee does NOT:
- Rewrite code (that's Step 2)
- Write new tests (that's Step 3)
- Do code review (that's Step 4)
- Redesign UI (that's Step 5)
- Update docs (that's Step 6)

Lee DOES:
- Run the full build and test suite
- Verify each pipeline step was completed
- Perform manual smoke testing
- Check for regressions
- Give final merge approval

## Patterns

### 1. Pre-Merge Checklist

Run through this checklist for EVERY merge:

**Pipeline Completeness:**
- [ ] **Step 1 (Plan):** Plan document exists with acceptance criteria
- [ ] **Step 2 (Build):** Code on feature branch, conventional commits, Co-authored-by trailers
- [ ] **Step 3 (Test):** All tests pass, coverage maintained, edge cases covered
- [ ] **Step 4 (Code Review):** Sasuke approved (no outstanding rejections)
- [ ] **Step 5 (UX Review):** Ino approved OR confirmed no-op (no UI changes)
- [ ] **Step 6 (Docs):** Documentation updated, package.json descriptions synced
- [ ] **Step 7 (Verify):** This checklist completed ✅

**Build Verification:**
```bash
# Clean build from scratch
npm run build
# Expected: exit code 0, no errors, no warnings
# Build time: ~5 seconds

# Full test suite
npm test
# Expected: All tests pass, zero failures
# Check: No skipped tests that should be running
```

- [ ] `npm run build` exits with code 0
- [ ] No build warnings (esbuild output clean)
- [ ] `npm test` — all tests pass
- [ ] No new skipped/pending tests without justification
- [ ] Coverage baseline maintained (no decrease)

**Code Hygiene:**
- [ ] No `console.log` in production code
- [ ] No `TODO` or `FIXME` without linked issue
- [ ] No commented-out code blocks
- [ ] No debug flags or test backdoors
- [ ] Branch is up to date with `main` (no merge conflicts)

### 2. Manual Smoke Testing

After automated tests pass, manually verify critical paths:

**Extension activation:**
1. Open VS Code with the extension loaded
2. Verify the CDA sidebar icon appears
3. Click the sidebar — verify it opens without errors
4. Check the Output panel for any activation errors

**Feature-specific smoke test:**
Based on what changed, manually verify the new feature:
- If new command: Run it from Command Palette
- If new setting: Change it and verify behavior updates
- If new UI: View it in sidebar, check dark and light themes
- If new MCP tool: Invoke it and verify output

**Regression smoke test:**
Verify these always-critical paths still work:
- [ ] Sidebar loads and shows 3 tabs
- [ ] Session tab displays data (or appropriate empty state)
- [ ] Settings tab allows configuration changes
- [ ] Settings persist after VS Code restart
- [ ] MCP server configuration writes correctly

### 3. Coverage Baseline Verification

```bash
# Run with coverage report
npm test -- --coverage

# Check the summary line:
# Statements: XX% (must be ≥ baseline)
# Branches:   XX% (must be ≥ baseline)
# Functions:  XX% (must be ≥ baseline)
# Lines:      XX% (must be ≥ baseline)
```

**If coverage decreased:**
- Identify which new code is uncovered
- Send back to Step 3 (Neji) for additional tests
- Do NOT approve merge with decreased coverage

### 4. Verification Report Template

```markdown
## Verification Report
**Feature:** {title}
**Branch:** squad/{issue}-{slug}
**Date:** {YYYY-MM-DD}
**Verifier:** Lee

### Pipeline Steps
| Step | Owner   | Status |
|------|---------|--------|
| 1 Plan       | Naruto    | ✅ Complete |
| 2 Build      | Sakura    | ✅ Complete |
| 3 Test       | Neji      | ✅ Complete |
| 4 Code Review| Sasuke    | ✅ Approved |
| 5 UX Review  | Ino       | ✅ Approved / ⏭️ Skipped (no UI) |
| 6 Docs       | Iruka     | ✅ Complete |
| 7 Verify     | Lee       | ✅ Approved |

### Build & Test
- Build: ✅ Clean (0 errors, 0 warnings)
- Tests: ✅ {N} passed, 0 failed, 0 skipped
- Coverage: ✅ {X}% (baseline: {Y}%)

### Smoke Test
- Extension activates: ✅
- Feature works as specified: ✅
- No regressions in critical paths: ✅

### Verdict: ✅ APPROVED FOR MERGE
```

### 5. Special Cases

**Hotfix (production bug):**
- Skip: Step 5 (UX Review) — unless the fix changes UI
- Skip: Step 6 (Docs) — unless the fix changes behavior
- Required: Steps 1 (abbreviated plan), 2, 3, 4, 7
- Fast-track: Lee can verify immediately after code review

**Docs-only change:**
- Skip: Steps 3, 4, 5 (no code to test/review/UX-check)
- Required: Steps 1 (brief plan), 2 (commit docs), 6 (self-review), 7 (verify links)
- Lee verifies: Links work, formatting correct, content accurate

**Backend-only (no UI):**
- Skip: Step 5 (UX Review)
- All other steps required
- Lee focuses: Build, tests, and regression verification

**Config/build change:**
- Required: Steps 1, 2, 4, 7
- Lee verifies: Build still works, package installs, no new vulnerabilities
- Extra check: `npm run build` output unchanged (same bundle size ± 10%)

### 6. Post-Merge Monitoring

After merge, monitor for issues:

**Immediate (within 1 hour):**
- [ ] `main` branch builds cleanly after merge
- [ ] No test failures on `main`
- [ ] Extension still activates correctly

**Short-term (24 hours):**
- [ ] No user-reported issues related to the change
- [ ] Extension marketplace version (if published) works correctly
- [ ] No unexpected error telemetry

**If post-merge issues found:**
1. Assess severity (P0 = extension broken, P1 = feature broken, P2 = minor issue)
2. P0: Revert immediately, then fix forward
3. P1: Hotfix through pipeline (fast-track)
4. P2: File issue for next sprint

### 7. Rejection Workflow

If verification fails:

1. **Identify the failing step** — which pipeline step has the gap?
2. **Route to the correct owner** — don't fix it yourself
3. **Provide specific failure details** — exact error, exact command, exact expectation
4. **The fix re-enters the pipeline at the failing step** — not from scratch

```
Example:
  Failure: npm test shows 2 failing tests in SkillManager.test.ts
  Route to: Step 3 (Neji) — fix tests
  After fix: Re-enter at Step 3, then 4, then 5/6/7 as needed
```

## Anti-Patterns

1. **Rubber-stamp verification.** Running `npm test` and immediately approving without checking the output. Read the results.

2. **Skipping smoke tests.** Automated tests don't catch everything. Manual verification catches integration issues that unit tests miss.

3. **Fixing issues yourself.** Lee is the verifier, not the fixer. Send issues back to the responsible step owner.

4. **Merging with known issues.** "We'll fix it later" creates tech debt. If the checklist has unchecked items, don't merge.

5. **Forgetting post-merge.** The job isn't done at merge. Monitor for at least an hour after merging.

6. **Skipping the pipeline completeness check.** Every step must be confirmed complete. A missing Step 6 (docs) means the feature is incomplete.

## Handoff

**This is the final step.** After verification approval:
- ✅ Merge the feature branch to `main`
- ✅ Delete the feature branch
- ✅ Close the linked issue
- ✅ Monitor post-merge (see section 6)

**See also:** pipeline-06-document, pipeline-01-plan (for the next feature)
