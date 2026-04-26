---
name: "pipeline-01-plan"
description: "Planning & Architecture — how to break features into phased plans, map dependencies, assign ownership, and size work for the CDA Extension."
domain: "pipeline"
confidence: "high"
source: "manual"
owner: "Naruto (Lead)"
step: 1
pipeline_position: "FIRST — all work starts here"
next_step: "pipeline-02-build"
---

## Context

Every feature, bugfix, or refactor in the CDA Extension starts with a plan. This step produces the blueprint that all downstream steps follow. Skip planning → rework, scope creep, and blocked agents.

**When this step runs:** At the start of every new issue, feature request, or bug report.

**Who owns it:** Naruto (Lead/Architect).

**Output:** A phased plan document with acceptance criteria, file ownership, dependency map, and parallel execution slots.

## CDA Extension Architecture Overview

Before planning, understand the key layers:

```
src/
├── extension.ts          — Activation, command registration, tool registration
├── panels/
│   ├── wizard-html.ts    — Webview HTML/CSS/JS (sidebar UI)
│   └── sidebarProvider.ts — Webview provider, message handling, state
├── tools/                — MCP tool implementations
├── managers/             — Business logic (PlanManager, SkillManager, etc.)
├── parsers/              — Data parsing (ChatSessionParser, etc.)
└── utils/                — Shared utilities
```

**Key constraints:**
- **esbuild** bundles to `dist/extension.js` (format: `'cjs'`, external: `['vscode']`)
- **Settings** always use `cda.*` prefix — never `contentDeveloper.*`
- **Webview** communicates via `postMessage` / `onDidReceiveMessage`
- **Build time:** ~5 seconds (`npm run build`)
- **Test runner:** Jest (not vitest)

## Patterns

### 1. Feature Decomposition

Break every feature into **phases** (max 3-5 per plan). Each phase must be independently shippable:

```
Phase 1: Data layer (manager/parser changes)
Phase 2: Extension host wiring (extension.ts, commands, tools)
Phase 3: UI layer (wizard-html.ts, sidebarProvider.ts)
Phase 4: Polish (edge cases, error handling, settings)
```

**Rule of thumb:** If a phase touches more than 3 files, split it.

### 2. Dependency Mapping

Map file-level dependencies before assigning work:

```
Feature: "Add skill filtering"

Dependencies:
  SkillManager.ts ──→ extension.ts ──→ sidebarProvider.ts ──→ wizard-html.ts
  (data)              (wiring)         (handler)              (UI)

Parallel slots:
  Slot A: SkillManager.ts (Sakura)
  Slot B: wizard-html.ts UI scaffold (Shikamaru) — can start with mock data
  
Sequential:
  extension.ts wiring (after Slot A)
  sidebarProvider.ts (after both slots)
```

### 3. Phase Sizing

| Size    | Description                          | Files | Time    |
|---------|--------------------------------------|-------|---------|
| **XS**  | One-line fix, trivial                | 1     | < 5 min |
| **S**   | Single-file change, clear scope     | 1-2   | < 30 min|
| **M**   | Multi-file, one layer               | 2-4   | 1-2 hrs |
| **L**   | Cross-layer, integration needed     | 4-6   | 2-4 hrs |
| **XL**  | Architecture change, refactor        | 6+    | Split!  |

**XL phases must be split.** No single phase should touch 6+ files.

### 4. Acceptance Criteria Template

Every phase needs explicit acceptance criteria:

```markdown
### Phase N: {Title}
**Owner:** {Agent name}
**Size:** S/M/L
**Files:**
- `src/managers/SkillManager.ts` — Add filter method
- `src/extension.ts` — Register new command

**Acceptance Criteria:**
- [ ] `SkillManager.filterByCategory(category)` returns filtered skills
- [ ] Command `cda.filterSkills` registered and functional
- [ ] `npm run build` passes
- [ ] `npm test` passes (no regressions)

**Dependencies:** None (can start immediately)
**Parallel with:** Phase 2 UI scaffold
```

### 5. Plan Document Template

```markdown
# Plan: {Feature/Bug Title}
**Issue:** #{number}
**Date:** {YYYY-MM-DD}
**Lead:** Naruto

## Problem
{What's broken or missing — 2-3 sentences}

## Approach
{High-level strategy — which layers change and why}

## Phases

### Phase 1: {Data Layer}
**Owner:** {Agent}  **Size:** {S/M/L}
**Files:** {list}
**Criteria:** {checkboxes}
**Dependencies:** None

### Phase 2: {Wiring}
**Owner:** {Agent}  **Size:** {S/M/L}
**Files:** {list}
**Criteria:** {checkboxes}
**Dependencies:** Phase 1

## Parallel Execution Map
| Slot | Phase | Owner     | Can Start |
|------|-------|-----------|-----------|
| A    | 1     | Sakura    | Immediately |
| B    | 2-UI  | Shikamaru | Immediately (mock data) |
| C    | 2-Wire| Sakura    | After Phase 1 |

## Risk & Rollback
{What could go wrong, how to detect, how to revert}
```

### 6. File Ownership Rules

- **extension.ts:** Sakura (activation, commands, tools)
- **wizard-html.ts:** Sakura (HTML/CSS/JS generation)
- **sidebarProvider.ts:** Sakura (message handling, state)
- **MCP tools (tools/*.ts):** Shikamaru (integration layer)
- **Managers (managers/*.ts):** Whoever owns the feature
- **Tests:** Neji (but feature owner writes first draft)

### 7. Parallel Execution Slots

The CDA Extension supports **2 parallel slots** safely:

- **Slot A:** Extension host code (managers, tools, extension.ts)
- **Slot B:** Webview code (wizard-html.ts UI scaffolding with mock data)

**Never parallel:** Two agents editing the same file. Use sequential phases instead.

## Anti-Patterns

1. **Planning without reading the code.** Always `view` the files you plan to change before writing the plan. The codebase evolves — assumptions from history.md may be stale.

2. **Monolithic phases.** A phase that says "implement the feature" is not a plan. Break it into data → wiring → UI → polish.

3. **Missing acceptance criteria.** "It works" is not acceptance criteria. Be specific: what methods exist, what commands register, what UI elements render.

4. **Ignoring the build.** Every phase must end with `npm run build` passing. Don't plan phases that leave the build broken.

5. **Over-planning.** A bug fix doesn't need a 5-phase plan. XS/S issues get a single phase with clear criteria.

6. **Forgetting the pipeline.** Your plan must account for ALL 7 pipeline steps. If Phase 3 adds UI, that triggers UX Review (Step 5). If Phase 2 adds a setting, that triggers Docs (Step 6).

## Common Planning Mistakes (CDA-Specific)

- **Namespace mismatch:** Planning to use `contentDeveloper.*` settings instead of `cda.*`
- **Missing package.json:** Adding a setting in code but forgetting to declare it in `contributes.configuration`
- **Webview data pipeline gaps:** Adding data to the manager but not threading it through `extension.ts → sidebarProvider.ts → wizard-html.ts`
- **esbuild externals:** Planning to import a node module that isn't in esbuild's `external` list
- **Test file structure:** Planning tests in the wrong location (should mirror `src/` structure in test files)

## Handoff to Next Step

**What pipeline-02-build needs from this step:**
- ✅ Complete plan document with all phases
- ✅ File ownership assignments per phase
- ✅ Acceptance criteria (checkboxes) per phase
- ✅ Dependency map showing what can run in parallel
- ✅ Branch name: `squad/{issue}-{slug}`

**See also:** pipeline-02-build, pipeline-03-test
