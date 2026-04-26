---
name: "pipeline-04-code-review"
description: "Code Review — what reviewers look for, how to give actionable feedback, the lockout rule, and CDA-specific quality gates."
domain: "pipeline"
confidence: "high"
source: "manual"
owner: "Sasuke (Code Reviewer)"
step: 4
pipeline_position: "After test, before UX review"
prev_step: "pipeline-03-test"
next_step: "pipeline-05-ux-review"
---

## Context

Code review is the quality gate between "it works" and "it's ready." Sasuke reviews every code change for bugs, architecture violations, performance issues, and security concerns. This step catches problems before they reach users.

**When this step runs:** After Neji confirms all tests pass and coverage is maintained.

**Output:** Approval (proceed to Step 5) or rejection with specific, actionable feedback.

## The Lockout Rule

> **If Sasuke rejects code, a DIFFERENT agent must fix it.**

The author cannot fix their own rejected code. This prevents:
- Defensive fixes that address the letter but not spirit of feedback
- Blind spots that caused the issue in the first place
- Confirmation bias in self-review

**Workflow:**
1. Sasuke reviews → finds issue → rejects with specific feedback
2. A different agent (usually the other builder) picks up the fix
3. The fix goes through Steps 2-3 again (build + test)
4. Sasuke re-reviews the fix

**Exception:** Trivial issues (typos, formatting) can be fixed by the original author.

## Patterns

### 1. Review Dimensions

Review every change across these dimensions:

| Dimension       | What to check                                        | Severity |
|----------------|------------------------------------------------------|----------|
| **Correctness** | Does it do what the plan says? Edge cases handled?   | Blocker  |
| **Architecture**| Does it follow CDA patterns? Right layer?            | Blocker  |
| **Performance** | Unnecessary loops? Memory leaks? Blocking calls?     | Major    |
| **Security**    | Input validation? XSS in webview? Secret exposure?   | Blocker  |
| **Readability** | Clear variable names? Reasonable complexity?          | Minor    |
| **Maintainability** | Will this be easy to change later?              | Major    |

### 2. CDA-Specific Review Checks

**Settings namespace:**
```typescript
// ❌ REJECT — wrong namespace
vscode.workspace.getConfiguration('contentDeveloper')

// ✅ APPROVE
vscode.workspace.getConfiguration('cda')
```

**Webview security:**
```typescript
// ❌ REJECT — XSS risk in webview
innerHTML = userInput;

// ✅ APPROVE — escaped or using textContent
element.textContent = userInput;
// or use a sanitizer if HTML is needed
```

**Settings declaration:**
```
Check: Every new cda.* setting in code MUST have a matching entry in
package.json → contributes → configuration → properties
```

**Webview theme compliance:**
```css
/* ❌ REJECT — hardcoded colors */
color: #ffffff;
background: #1e1e1e;

/* ✅ APPROVE — VS Code theme variables */
color: var(--vscode-foreground);
background: var(--vscode-editor-background);
```

**Icons (Decision #11):**
```html
<!-- ❌ REJECT — emoji -->
<span>📋</span>

<!-- ✅ APPROVE — Lucide SVG -->
<svg class="lc-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">...</svg>
```

**esbuild compatibility:**
```typescript
// ❌ REJECT — dynamic require (breaks esbuild)
const mod = require(dynamicPath);

// ❌ REJECT — top-level await (CJS format)
const data = await fetch(url);

// ✅ APPROVE — static import
import { helper } from './utils';
```

### 3. Giving Good Feedback

Every review comment must be:

1. **Specific:** Point to the exact line and explain the problem
2. **Actionable:** Say what should change, not just "this is wrong"
3. **Categorized:** Blocker, Major, Minor, or Nit

**Template:**
```
[BLOCKER] Line 42: `getConfiguration('contentDeveloper')` uses deprecated
namespace. Must use `getConfiguration('cda')` per Decision #16.

[MAJOR] Line 87-95: This loop iterates all skills on every keypress.
Consider debouncing or caching the filtered result.

[MINOR] Line 120: Variable `x` should be renamed to `filteredSkills`
for clarity.

[NIT] Line 5: Import order — group VS Code imports before local imports.
```

### 4. Code Review Checklist

Use this checklist for every review:

**Correctness:**
- [ ] Code matches acceptance criteria from the plan
- [ ] Edge cases handled (null, empty, error states)
- [ ] Async operations properly awaited
- [ ] Error handling doesn't swallow errors silently

**Architecture:**
- [ ] Changes are in the right layer (manager vs provider vs UI)
- [ ] No business logic in webview JS
- [ ] Webview communicates via postMessage only
- [ ] Settings use `cda.*` prefix
- [ ] New settings declared in package.json

**Performance:**
- [ ] No blocking operations in activation path
- [ ] No unnecessary file system reads in hot paths
- [ ] Polling/timers cleaned up in dispose()
- [ ] Large data sets paginated or virtualized

**Security:**
- [ ] No `innerHTML` with user/external data
- [ ] No secrets in source code
- [ ] Webview Content Security Policy maintained
- [ ] File paths validated (no path traversal)

**Quality:**
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] No `console.log` in production code
- [ ] Conventional commit messages with Co-authored-by trailer
- [ ] Branch name matches `squad/{issue}-{slug}`

### 5. Review Verdicts

| Verdict                  | Meaning                                      | Next step        |
|-------------------------|----------------------------------------------|-----------------|
| **APPROVE**             | Code is ready for UX review                  | → Step 5        |
| **APPROVE with nits**   | Minor issues, author can fix before merge     | → Step 5 (fix nits first) |
| **REQUEST CHANGES**     | Issues must be fixed (triggers lockout rule)  | → Step 2 (different agent) |
| **REJECT**              | Fundamental problems, needs replanning        | → Step 1        |

### 6. What NOT to Review

- **Style preferences** that aren't in the project conventions
- **Alternative implementations** that are equivalent in quality
- **Pre-existing issues** in files the PR didn't change
- **Test names** (Neji owns test quality)

Focus on things that matter: bugs, security, architecture, performance.

## Anti-Patterns

1. **Rubber-stamping.** Approving without actually reading the code. Every line matters.

2. **Nitpick-only reviews.** Finding 10 style issues but missing the logic bug. Prioritize correctness over aesthetics.

3. **Vague feedback.** "This could be better" is not actionable. Say exactly what should change and why.

4. **Blocking on opinions.** If the code works correctly and follows conventions, approve it. Don't block because you would have written it differently.

5. **Reviewing your own code.** Sasuke never reviews code he wrote. If Sasuke wrote the fix, another reviewer must step in.

6. **Forgetting the plan.** Review against the acceptance criteria, not your own interpretation of what the feature should do.

## Handoff to Next Step

**What pipeline-05-ux-review needs from this step:**
- ✅ Code review approval (or "approve with nits")
- ✅ Confirmation that no security issues found
- ✅ Note on any UI changes that need UX evaluation
- ✅ If no UI changes → signal to skip UX review (no-op)

**See also:** pipeline-03-test, pipeline-05-ux-review
