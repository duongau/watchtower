---
name: "pipeline-03-test"
description: "Testing & QA — how to write and run tests, achieve coverage targets, and catch regressions for the CDA Extension."
domain: "pipeline"
confidence: "high"
source: "manual"
owner: "Neji (Tester)"
step: 3
pipeline_position: "After build, before code review"
prev_step: "pipeline-02-build"
next_step: "pipeline-04-code-review"
---

## Context

Every code change must be tested before review. Neji owns test quality but feature developers should write initial test drafts. This step ensures code works correctly, edge cases are covered, and no regressions slip through.

**When this step runs:** After Sakura/Shikamaru produce working code that passes `npm run build`.

**Output:** Comprehensive test suite covering new/changed code, all tests passing, coverage baseline maintained.

## Test Infrastructure

```
Runner:       Jest (NOT vitest, NOT mocha)
Config:       jest.config.js
Test files:   Adjacent to source or in __tests__/ directories
File naming:  *.test.ts
Command:      npm test
Coverage:     npm test -- --coverage
```

**Jest configuration notes:**
- TypeScript via `ts-jest`
- Module resolution matches esbuild config
- VS Code API is mocked (not available in test runtime)

## Patterns

### 1. Test File Structure

```
src/
├── managers/
│   ├── SkillManager.ts
│   └── SkillManager.test.ts        ← adjacent test file
├── tools/
│   ├── SessionTools.ts
│   └── __tests__/
│       └── SessionTools.test.ts    ← __tests__ directory pattern
```

Both patterns are acceptable. Adjacent is preferred for new files.

### 2. Test Categories

| Category       | What it tests                          | When required        |
|---------------|----------------------------------------|---------------------|
| **Unit**       | Single function/method in isolation    | Always              |
| **Integration**| Multiple modules working together      | Cross-layer changes |
| **Regression** | Previously broken behavior stays fixed | Bug fixes           |
| **Edge Case**  | Boundary conditions, empty inputs      | Always              |

### 3. Writing Tests from Specs

Start with the acceptance criteria from the plan (Step 1):

```typescript
// Plan says: "SkillManager.filterByCategory(category) returns filtered skills"

describe('SkillManager', () => {
    describe('filterByCategory', () => {
        it('should return skills matching the category', () => {
            const manager = new SkillManager();
            manager.addSkill({ name: 'test', category: 'pipeline' });
            manager.addSkill({ name: 'other', category: 'utility' });

            const result = manager.filterByCategory('pipeline');

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('test');
        });

        it('should return empty array for unknown category', () => {
            const manager = new SkillManager();
            const result = manager.filterByCategory('nonexistent');
            expect(result).toEqual([]);
        });

        it('should handle empty skills list', () => {
            const manager = new SkillManager();
            const result = manager.filterByCategory('pipeline');
            expect(result).toEqual([]);
        });
    });
});
```

### 4. Mocking VS Code API

The `vscode` module is not available in Jest. Mock it:

```typescript
// At top of test file or in __mocks__/vscode.ts
jest.mock('vscode', () => ({
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn(),
            update: jest.fn(),
        }),
        workspaceFolders: [],
    },
    window: {
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            show: jest.fn(),
        }),
    },
    commands: {
        registerCommand: jest.fn(),
        executeCommand: jest.fn(),
    },
    Uri: {
        file: jest.fn((f: string) => ({ fsPath: f, scheme: 'file' })),
        parse: jest.fn((s: string) => ({ toString: () => s })),
    },
    EventEmitter: jest.fn().mockImplementation(() => ({
        event: jest.fn(),
        fire: jest.fn(),
    })),
}), { virtual: true });
```

### 5. Testing Webview Messages

Test the message handling pipeline without the actual webview:

```typescript
describe('SidebarProvider message handling', () => {
    it('should handle saveField message', async () => {
        const mockConfig = {
            update: jest.fn().mockResolvedValue(undefined),
        };
        jest.spyOn(vscode.workspace, 'getConfiguration')
            .mockReturnValue(mockConfig as any);

        // Simulate webview message
        await handleMessage({
            command: 'saveField',
            field: 'pollInterval',
            value: 120,
        });

        expect(mockConfig.update).toHaveBeenCalledWith('pollInterval', 120, true);
    });
});
```

### 6. Test Naming Convention

```typescript
// Pattern: should {expected behavior} when {condition}
it('should return empty array when no skills match category', () => {});
it('should throw error when config file is missing', () => {});
it('should update poll timer when interval setting changes', () => {});
```

### 7. Edge Cases Checklist

For every new method, test these edge cases:

- [ ] **Empty input:** `null`, `undefined`, `''`, `[]`, `{}`
- [ ] **Boundary values:** 0, -1, MAX_SAFE_INTEGER, very long strings
- [ ] **Invalid types:** Wrong types if using `any` parameters
- [ ] **File system:** Missing files, permission errors, empty files
- [ ] **Settings:** Unset settings (returns `undefined`), migration values
- [ ] **Concurrent calls:** Multiple invocations before first resolves
- [ ] **Error propagation:** Errors bubble correctly, don't crash extension

### 8. Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest src/managers/SkillManager.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode (for development)
npx jest --watch

# Run tests matching a pattern
npx jest --testNamePattern="filterByCategory"
```

### 9. Coverage Targets

| Metric      | Baseline | Target  | Hard minimum |
|-------------|----------|---------|--------------|
| Statements  | Current  | +5%     | No decrease  |
| Branches    | Current  | +5%     | No decrease  |
| Functions   | Current  | +5%     | No decrease  |
| Lines       | Current  | +5%     | No decrease  |

**Rule:** Coverage must never decrease from the current baseline. New code should be ≥80% covered.

### 10. Regression Test Pattern

For bug fixes, always write the regression test FIRST:

```typescript
// Step 1: Write test that reproduces the bug (should FAIL initially)
it('should expand tilde in plan path (regression: #42)', () => {
    const result = resolvePlanPath('~/plans/my-plan.md');
    expect(result).toContain(os.homedir());
    expect(result).not.toContain('~');
});

// Step 2: Fix the bug
// Step 3: Verify the test now passes
```

## Anti-Patterns

1. **Testing implementation, not behavior.** Don't test that a private method was called. Test that the public API returns the right result.

2. **Fragile assertions.** Don't assert on exact error messages or object shapes that include timestamps. Use `toContain`, `toMatchObject`, or custom matchers.

3. **Test interdependence.** Each test must be independent. Never rely on test execution order. Use `beforeEach` for setup, not shared mutable state.

4. **Missing async handling.** Always `await` async operations. Missing `await` causes tests to pass falsely.

```typescript
// ❌ WRONG — test passes even if promise rejects
it('should save', () => {
    saveData(data); // forgot await!
});

// ✅ CORRECT
it('should save', async () => {
    await saveData(data);
    expect(readData()).toEqual(data);
});
```

5. **Over-mocking.** If you mock everything, you're testing your mocks, not your code. Mock external boundaries (VS Code API, file system, network), not internal modules.

6. **Skipping edge cases.** "Happy path only" tests miss the bugs that ship. Null, empty, error, and boundary cases are where bugs live.

7. **Using vitest or mocha syntax.** This project uses Jest. Don't use `vi.fn()` or `chai.expect()`.

## Common Test Mistakes (CDA-Specific)

- **Importing vscode without mocking:** Jest can't resolve the `vscode` module. Always mock it.
- **Testing wizard-html.ts JS directly:** The webview JS is embedded in template literals. Extract testable logic into separate functions.
- **Forgetting globalState mocks:** Many features use `context.globalState`. Mock `get` and `update`.
- **Path separators:** Tests may run on different OS. Use `path.join()` not string concatenation.

## Handoff to Next Step

**What pipeline-04-code-review needs from this step:**
- ✅ All tests passing (`npm test` — zero failures)
- ✅ Coverage report showing no regression
- ✅ Test descriptions that document expected behavior
- ✅ Edge cases and error paths covered
- ✅ Regression tests for bug fixes (with issue number in test name)

**See also:** pipeline-02-build, pipeline-04-code-review
