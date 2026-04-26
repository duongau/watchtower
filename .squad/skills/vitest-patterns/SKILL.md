---
name: vitest-patterns
description: Vitest test patterns and setup for the content-developer-mcp project. Use when setting up Vitest, writing handler tests, service unit tests, or outputSchema contract tests. Includes install commands, test file structure, Tier 1/2/3 priority guidance, and mock patterns.
confidence: medium
owner: tester
---

## Overview

Test framework setup and patterns for `content-developer-mcp`. Covers initial Vitest bootstrap, file structure conventions, and a three-tier priority guide for writing high-value tests.

---

## Test Framework

**Vitest** — preferred over Jest for this project because:
- Native ESM support (no transform config needed for `.js` imports)
- Matches the project's TypeScript + Node setup
- Fast, watch mode built in
- Compatible with existing `tsconfig.json`

Install when bootstrapping:
```
cd mcp-server && npm install --save-dev vitest @vitest/coverage-v8
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

---

## Test File Structure

```
mcp-server/src/__tests__/
├── services/
│   ├── completion-calculator.test.ts   ← Pure logic, no mocks needed
│   ├── work-item-manager.test.ts
│   └── git-workflow.test.ts
├── handlers/
│   ├── calculate-work-item-completion.test.ts
│   ├── create-work-item-template.test.ts
│   ├── generate-git-workflow-context.test.ts
│   ├── generate-pr-description.test.ts
│   └── check-agent-version.test.ts
└── contracts/
    └── output-schema.test.ts           ← Verify outputSchema matches handler returns
```

---

## Priority: What to Test First

### Tier 1 — Pure logic (no mocks, high value)

`completion-calculator.ts` — `calculateCompletionData()` is pure logic with many edge cases:
- Merge time at 9am PST → next slot is 10am same day
- Merge time at 11am PST → next slot is 3pm same day
- Merge time at 4pm PST Friday → next slot is 10am Monday
- Weekend merge → pushed to Monday 10am
- `azure-docs-pr` repo uses different publish schedule

### Tier 2 — Handler contract tests (mock services)

For each handler, verify:
- Valid inputs → `content[0].type === 'text'`, `structuredContent` present (for structured tools)
- Invalid inputs → Zod parse error caught, returns `isError: true`
- Service throws → returns `isError: true` with recovery hint (not a thrown exception)

Mock pattern:
```typescript
import { vi } from 'vitest';
const mockCalculator = {
    calculateCompletionData: vi.fn().mockReturnValue({ publish_date: '2026-04-09T18:00:00Z', ... })
};
```

### Tier 3 — outputSchema contract tests

For tools with `outputSchema`, parse the declared schema and validate the actual handler output against it:
```typescript
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile(tool.outputSchema);
const result = await handleTool(args, mockService);
const parsed = JSON.parse(result.content[0].text);
expect(validate(parsed)).toBe(true);
expect(result.structuredContent).toEqual(parsed);
```

Tools with `outputSchema` (as of 2026-04-07):
- `create_work_item_template`
- `calculate_work_item_completion`
- `generate_git_workflow_context`
- `generate_pr_review`
