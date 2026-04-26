---
name: "pipeline-02-build"
description: "Implementation — how to write code, manage branches, follow commit conventions, and ship quality code for the CDA Extension."
domain: "pipeline"
confidence: "high"
source: "manual"
owner: "Sakura (Extension Dev) + Shikamaru (Integration Dev)"
step: 2
pipeline_position: "After plan, before test"
prev_step: "pipeline-01-plan"
next_step: "pipeline-03-test"
---

## Context

This step takes a plan from Step 1 and produces working code. Two agents share ownership: Sakura handles extension host + UI code, Shikamaru handles MCP tool integrations. Both must follow the same conventions.

**When this step runs:** After Naruto produces an approved plan with phases and file assignments.

**Output:** Working code on a feature branch, passing `npm run build`, ready for testing.

## CDA Extension Build System

```
Build:    npm run build        → esbuild → dist/extension.js (~5s)
Test:     npm test             → Jest → unit + integration tests
Lint:     (no separate linter configured — rely on TypeScript compiler)
Package:  vsce package         → .vsix file
```

**esbuild configuration** (esbuild.js):
- Format: `'cjs'` (CommonJS — VS Code requirement)
- External: `['vscode']` (provided by VS Code runtime)
- Platform: `'node'`
- Bundle: `true` (single output file)
- Sourcemap: `true`

## Patterns

### 1. Branch Naming

```
squad/{issue-number}-{short-slug}

Examples:
  squad/42-skill-filtering
  squad/87-fix-poll-timer
  squad/103-sidebar-redesign
```

**Rules:**
- Always branch from `main`
- One branch per issue
- Delete branch after merge

### 2. Commit Message Format

Use conventional commits with Co-authored-by trailer:

```
type(scope): short description

Longer description if needed. Explain WHY, not WHAT
(the diff shows WHAT).

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

**Types:**
| Type       | When                                    |
|------------|-----------------------------------------|
| `feat`     | New feature or capability               |
| `fix`      | Bug fix                                 |
| `refactor` | Code change that doesn't fix/add        |
| `test`     | Adding or updating tests                |
| `docs`     | Documentation only                      |
| `chore`    | Build, config, tooling changes          |
| `style`    | Formatting, whitespace (no logic change)|

**Scopes** (CDA-specific):
| Scope      | Files                                   |
|------------|-----------------------------------------|
| `sidebar`  | wizard-html.ts, sidebarProvider.ts      |
| `tools`    | tools/*.ts, MCP tool implementations    |
| `settings` | package.json contributes, settings reads|
| `manager`  | managers/*.ts                           |
| `parser`   | parsers/*.ts                            |
| `ext`      | extension.ts                            |

### 3. Parallel Work Patterns

Sakura and Shikamaru can work in parallel when editing different files:

```
SAFE parallel:
  Sakura: wizard-html.ts (UI)  |  Shikamaru: tools/NewTool.ts (MCP)
  Sakura: sidebarProvider.ts   |  Shikamaru: managers/NewManager.ts

UNSAFE — serialize:
  Both need extension.ts → Sakura goes first (she owns activation)
  Both need sidebarProvider.ts → Sakura (she owns the provider)
```

**Interface contract pattern:** When parallel work needs to converge:
1. Define the interface/type first (shared agreement)
2. Both agents code to that interface independently
3. Integration phase wires them together in extension.ts

### 4. CDA Coding Conventions

**Settings access:**
```typescript
// ✅ CORRECT — always use 'cda' prefix
const value = vscode.workspace.getConfiguration('cda').get<string>('pollInterval');

// ❌ WRONG — old namespace
const value = vscode.workspace.getConfiguration('contentDeveloper').get<string>('pollInterval');
```

**Webview messaging:**
```typescript
// Extension → Webview
panel.webview.postMessage({ command: 'updateData', data: payload });

// Webview → Extension (in wizard-html.ts JS)
vscode.postMessage({ command: 'saveField', field: 'pollInterval', value: 60 });

// Handler in sidebarProvider.ts
case 'saveField':
    await vscode.workspace.getConfiguration('cda').update(msg.field, msg.value, true);
    break;
```

**Command registration:**
```typescript
// In extension.ts activate()
context.subscriptions.push(
    vscode.commands.registerCommand('cda.myCommand', async () => {
        // implementation
    })
);

// In package.json contributes.commands
{ "command": "cda.myCommand", "title": "My Command", "category": "CDA" }
```

**Settings declaration (package.json):**
```json
{
    "cda.newSetting": {
        "type": "string",
        "default": "",
        "description": "What this setting controls."
    }
}
```

### 5. Webview HTML/CSS/JS Patterns

wizard-html.ts generates the entire webview as a template literal. Key patterns:

**Theme-aware CSS:**
```css
/* ✅ Use VS Code CSS variables */
color: var(--vscode-foreground);
background: var(--vscode-sideBar-background);
border: 1px solid var(--vscode-panel-border);

/* ❌ Never hardcode colors */
color: #ffffff;
```

**Icons — use Lucide (Decision #11):**
```html
<!-- ✅ Lucide SVG with currentColor -->
<svg class="lc-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="..."/>
</svg>

<!-- ❌ No emoji -->
📋
```

**Webview JS validation:**
Since webview JS runs in a browser context (not Node.js):
- No `require()`, no `fs`, no `path`
- Use `vscode.postMessage()` to communicate with extension host
- All data comes from `window.addEventListener('message', ...)`
- Keep JS minimal — logic belongs in the extension host

### 6. Code Quality Checklist (Pre-Review)

Before requesting code review (Step 4), verify:

- [ ] `npm run build` passes with zero errors
- [ ] `npm test` passes with zero failures
- [ ] No `console.log` left in production code (use `outputChannel` for logging)
- [ ] All settings use `cda.*` prefix
- [ ] New settings declared in `package.json` `contributes.configuration`
- [ ] New commands declared in `package.json` `contributes.commands`
- [ ] Webview CSS uses `var(--vscode-*)` — no hardcoded colors
- [ ] Icons use Lucide SVGs — no emoji
- [ ] Co-authored-by trailer on all commits
- [ ] Branch name matches `squad/{issue}-{slug}`
- [ ] Each commit is atomic (one logical change per commit)

### 7. File Creation Patterns

**New MCP Tool:**
```
1. Create src/tools/MyNewTool.ts
2. Export tool handler function
3. Register in extension.ts activate()
4. Add to package.json if it has settings
5. Write tests
```

**New Manager:**
```
1. Create src/managers/MyManager.ts
2. Export class with clear public API
3. Instantiate in extension.ts or sidebarProvider.ts
4. Wire to webview if UI-facing
5. Write tests
```

**New Webview Section:**
```
1. Add HTML in wizard-html.ts (find the right tab)
2. Add CSS in the <style> block
3. Add JS message handler in the <script> block
4. Add extension handler in sidebarProvider.ts
5. Wire data flow from extension.ts
```

## Anti-Patterns

1. **Building without a plan.** Never start coding without a Step 1 plan. Even a quick fix needs acceptance criteria.

2. **Editing files you don't own.** Check the plan's file assignments. If Shikamaru needs to change wizard-html.ts, coordinate with Sakura first.

3. **Mega-commits.** Don't bundle 5 changes in one commit. Each commit should be one logical change that compiles.

4. **Hardcoded values in webview.** Colors, sizes, icons — all must use VS Code theme variables or Lucide.

5. **Forgetting package.json.** Every new setting and command needs a declaration. The extension won't see undeclared settings.

6. **Testing in production code.** Don't add `if (DEBUG)` blocks. Use Jest mocks and test files.

7. **Node.js APIs in webview JS.** The webview runs in a browser sandbox. No `require`, no `fs`, no `path`.

## Handoff to Next Step

**What pipeline-03-test needs from this step:**
- ✅ Working code on feature branch
- ✅ `npm run build` passing
- ✅ List of new/changed public methods (for test coverage)
- ✅ Any test utilities or mocks that were created
- ✅ Description of edge cases discovered during implementation

**See also:** pipeline-01-plan, pipeline-03-test
