---
name: "pipeline-05-ux-review"
description: "UX Review — when to review UI changes, usability and accessibility checklists, VS Code theme compliance, and CDA sidebar/webview patterns."
domain: "pipeline"
confidence: "high"
source: "manual"
owner: "Ino (UX Reviewer)"
step: 5
pipeline_position: "After code review, before documentation"
prev_step: "pipeline-04-code-review"
next_step: "pipeline-06-document"
---

## Context

UX review ensures that user-facing changes are usable, accessible, and consistent with VS Code design patterns. Not every change needs UX review — this step is a no-op for backend-only changes.

**When this step runs:** After Sasuke approves the code review (Step 4) AND the change includes user-facing UI.

**When to SKIP (no-op):** Backend-only changes, MCP tool logic, parser updates, test-only changes, config/build changes.

**Output:** UX approval (proceed to Step 6) or feedback with specific UI issues.

## Deciding: Review or Skip?

| Change Type                          | UX Review? |
|--------------------------------------|-----------|
| New webview section/panel            | ✅ Required |
| Modified wizard-html.ts (visible UI) | ✅ Required |
| New VS Code command (user-invoked)   | ✅ Required |
| New/changed settings UI              | ✅ Required |
| Changed notification messages        | ✅ Required |
| New QuickPick/InputBox               | ✅ Required |
| MCP tool internals                   | ❌ Skip     |
| Manager/parser logic                 | ❌ Skip     |
| Test files                           | ❌ Skip     |
| esbuild/config changes              | ❌ Skip     |
| Bug fix (no UI change)              | ❌ Skip     |

## Patterns

### 1. VS Code Extension UX Principles

- **Familiar:** Follow VS Code's native patterns. Users shouldn't learn new interaction models.
- **Non-intrusive:** Don't pop modals or notifications unnecessarily. Use the sidebar, status bar, or output channel.
- **Discoverable:** Features should be findable via Command Palette (`Ctrl+Shift+P`), settings search, or sidebar navigation.
- **Responsive:** UI must work in narrow sidebar widths (240px minimum).

### 2. Usability Checklist

For every user-facing change:

- [ ] **User flow:** Can the user complete the task without confusion?
- [ ] **Feedback:** Does the UI show loading states, success, and errors?
- [ ] **Discoverability:** Can users find this feature without documentation?
- [ ] **Reversibility:** Can users undo or change their action?
- [ ] **Empty states:** What does the UI show when there's no data?
- [ ] **Error states:** What does the UI show when something fails?
- [ ] **Responsive width:** Does it work in a narrow sidebar (240px)?
- [ ] **State persistence:** Does the UI remember state across sessions?
- [ ] **Loading indicators:** Does long-running work show progress?
- [ ] **Tooltips:** Do interactive elements have descriptive tooltips?

### 3. Accessibility Checklist

VS Code extensions must be accessible:

- [ ] **Keyboard navigation:** All interactive elements reachable via Tab/Shift+Tab
- [ ] **Focus indicators:** Focused elements have visible outlines
- [ ] **Screen reader:** Semantic HTML used (buttons, headings, lists, labels)
- [ ] **ARIA labels:** Non-text elements have `aria-label` or `aria-labelledby`
- [ ] **Color contrast:** Minimum 4.5:1 for text, 3:1 for large text
- [ ] **No color-only information:** Don't rely solely on color to convey status
- [ ] **Focus management:** Focus moves logically after UI updates
- [ ] **Text sizing:** Uses relative units (em, rem) not fixed px for text

### 4. CDA Sidebar Design Patterns

The CDA sidebar uses a webview with 3 tabs:

```
┌─────────────────────────┐
│ [Session] [Tools] [Settings] │  ← Tab bar
├─────────────────────────┤
│                         │
│  Content area           │  ← Scrollable, tab-specific
│                         │
├─────────────────────────┤
│  [Refresh] [Actions]    │  ← Footer actions
└─────────────────────────┘
```

**Tab content patterns:**
- **Session tab:** Activity summary, WI/PR badges, plans list, meetings
- **Tools tab:** MCP server status, skills list, installed tools
- **Settings tab:** Configuration inputs, theme picker, author info

**Existing UI components to reuse:**
- Activity tiles (`.act-tile`) — small stats with icon + number
- Badge rows (`.wi-row`, `.pr-row`) — item with status badge
- Collapsible sections (`.section-header` with toggle)
- Settings inputs (`.sett-row` with `autoSaveField` binding)
- Card containers (`.card`) — bordered content groups

### 5. VS Code Theme CSS Variables

Always use VS Code's CSS variables for theme compliance:

```css
/* Text colors */
var(--vscode-foreground)                    /* Primary text */
var(--vscode-descriptionForeground)         /* Secondary/muted text */
var(--vscode-errorForeground)               /* Error text */
var(--vscode-textLink-foreground)           /* Link text */

/* Backgrounds */
var(--vscode-sideBar-background)            /* Sidebar bg */
var(--vscode-editor-background)             /* Content area bg */
var(--vscode-input-background)              /* Input field bg */
var(--vscode-button-background)             /* Button bg */

/* Borders */
var(--vscode-panel-border)                  /* Section dividers */
var(--vscode-input-border)                  /* Input borders */
var(--vscode-focusBorder)                   /* Focus ring */

/* State colors */
var(--vscode-testing-iconPassed)            /* Green/success */
var(--vscode-testing-iconFailed)            /* Red/error */
var(--vscode-editorWarning-foreground)      /* Yellow/warning */
```

**Dark and light theme testing:**
Every UI change must look correct in both VS Code Dark+ and Light+ themes. The CSS variables handle this automatically IF you use them consistently.

### 6. Common UX Patterns to Follow

**Status badges:**
```html
<!-- Active state -->
<span class="badge badge-active">Active</span>

<!-- Merged state -->
<span class="badge badge-merged">Merged</span>

<!-- Use semantic colors from VS Code variables -->
```

**Empty states:**
```html
<div class="empty-state">
    <svg class="lc-lg"><!-- relevant icon --></svg>
    <p>No plans yet. Create one to get started.</p>
</div>
```

**Loading states:**
```html
<div class="loading-indicator">
    <span class="spinner"></span>
    Loading session data...
</div>
```

**Error states:**
```html
<div class="error-state">
    <svg class="lc-lg"><!-- alert-triangle icon --></svg>
    <p>Failed to load data. <a href="#" onclick="retry()">Retry</a></p>
</div>
```

### 7. Design Consistency Rules

- **Typography:** Use VS Code's default font stack. Don't import custom fonts.
- **Spacing:** Use multiples of 4px (4, 8, 12, 16, 20, 24px).
- **Border radius:** Match VS Code's input radius (use `var(--vscode-input-border)` patterns).
- **Icons:** Lucide SVGs at 16px (`.lc-lg` class), stroke-width 2, `currentColor`.
- **Interactive elements:** Buttons use `var(--vscode-button-*)`, links use `var(--vscode-textLink-*)`.
- **Hover states:** Subtle background change, never color-only.

## Anti-Patterns

1. **Custom design systems.** Don't invent new button styles, color palettes, or icon sets. Use VS Code's existing patterns.

2. **Fixed-width layouts.** The sidebar width is user-controlled. Use `width: 100%`, `max-width`, and `min-width` — never `width: 350px`.

3. **Color-only status.** A red dot to mean "error" is not accessible. Add text, icon, or aria-label.

4. **Missing empty states.** A blank screen when there's no data is confusing. Always show a message explaining what the user can do.

5. **Modal dialogs for non-critical actions.** VS Code users hate modals. Use inline UI, notifications, or QuickPick instead.

6. **Ignoring dark theme.** If it looks good in dark mode but broken in light mode (or vice versa), it's not ready.

7. **Pixel-perfect designs.** VS Code webviews render differently across platforms. Design for flexibility, not exact pixel positions.

## Handoff to Next Step

**What pipeline-06-document needs from this step:**
- ✅ UX approval (or skip confirmation for non-UI changes)
- ✅ Final UI screenshots/descriptions of user-facing changes
- ✅ List of new commands, settings, or UI elements to document
- ✅ Any user-facing text changes (labels, tooltips, messages)

**See also:** pipeline-04-code-review, pipeline-06-document
