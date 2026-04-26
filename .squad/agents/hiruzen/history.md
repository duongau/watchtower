# Hiruzen — History

## Project Context
Watchtower is a VS Code extension for monitoring AI agent squads. Migrated from a standalone desktop app. Hiruzen joined the team to handle UX design and mockups before implementation begins.

## Key Knowledge
- The extension uses a hybrid architecture: webview panels for complex React UI (graph, dashboard), native VS Code APIs for navigation (tree views, commands, status bar)
- Three inspiration projects: ATM (visual org chart), Mission Control (32-panel dashboard), Squad (the framework itself)
- CDA Extension at `C:\GitHub\cda-platform\cda-extension` is a reference for VS Code extension UX patterns
- Original desktop app at `C:\GitHub\squad-tools\watchtower` (being renamed to watchtower-legacy) has the feature set we're drawing from
- Duong wants to start from a clean baseline with mockups first, not port everything at once
- The goal is a unified dashboard across ALL local squads, not just the current workspace

## Phase 0 Reference Study — Key Learnings (2026-04-26)

### CDA Extension Patterns (Adopt)
- **WebviewView sidebar** (`CdaSidebarProvider`): Registers as `type: "webview"` in package.json views. Full HTML/CSS rendered in sidebar. Powerful but heavy — the wizard-html.ts is 300+ lines of CSS alone. Good for complex UIs (setup wizard, session dashboard) but overkill for hierarchical data.
- **Activity bar with dedicated icon**: Single SVG icon, viewsContainers.activitybar registration. Badge support via VS Code API. Clean entry point.
- **Theme CSS variable discipline**: wizard-html.ts uses `var(--vscode-*)` for every color. No exceptions. This is the gold standard.
- **Polling manager pattern** (`SidebarPollingManager`): Periodically refreshes data while view is visible. Avoids flicker by keeping stale data visible until fresh data arrives.
- **getNonce + escapeHtml utilities**: CSP nonce for webview security, HTML escaping for dynamic content. Essential for any webview.
- **State persistence**: Uses `retainContextWhenHidden` and postMessage to preserve webview state across hide/show cycles.

### CDA Extension Patterns (Avoid)
- **Single monolithic sidebar webview**: CDA puts everything (wizard steps, session view, settings) into one WebviewView. Gets complex fast. Better to use multiple native tree views for hierarchical data.
- **Heavy CSS-in-JS in HTML template strings**: wizard-html.ts embeds massive CSS blocks as template strings. Works but hard to maintain. For Watchtower webviews, consider separate CSS files or a build step.

### Original Watchtower Desktop App (Patterns to Port)
- **AgentNode card design**: Left accent strip (status color), icon, name, type chip, description, footer with model/tools badges. This translates well to both tree items (simplified) and dashboard cards (full).
- **MissionControlPanel layout**: Header with status badge → briefing bar → stats bar → widget grid → system health strip. The widget grid (`MCWidgetGrid`) uses configurable/draggable panels. For VS Code, simplify to a static responsive grid.
- **Toolbar pattern**: Desktop app has a rich toolbar with undo/redo, create, layout, export, schedule, remote, MC, chat, settings. Most of these become VS Code commands. Key insight: the toolbar IS the command palette.
- **Zustand store with individual selectors**: `useWatchtowerStore((s) => s.specificField)` — never destructure. Prevents React 19 infinite loops. This carries forward.
- **Status bar component**: Shows connection status dot + version + agent/skill counts. Maps directly to VS Code StatusBarItems.

### VS Code Surface Audit Summary
| Surface | Watchtower Use | Priority | Cost |
|---------|---------------|----------|------|
| Activity Bar | Watchtower icon with badge | Must-have | Low |
| TreeView (sidebar) | Squads, Sessions, Skills, Overview | Must-have | Medium |
| WebviewPanel | Dashboard, Agent Graph | Must-have | High |
| StatusBar | Squad count, active agents, tokens, cost | Must-have | Low |
| Commands | All actions (open dashboard, scan, navigate) | Must-have | Low |
| QuickPick | Agent selector, squad switcher | Nice-to-have | Low |
| Notifications | Squad discovered, agent error | Nice-to-have | Low |
| OutputChannel | Watchtower diagnostic logs | Nice-to-have | Low |
| Walkthrough | First-time onboarding | Nice-to-have | Medium |
| WebviewView (sidebar) | NOT used initially — TreeView preferred | Deferred | High |
| Editor Decorations | NOT applicable | Skip | — |
| SCM/Debug views | NOT applicable | Skip | — |

### Anti-Patterns to Avoid
- Don't try to recreate the desktop toolbar — use VS Code's command palette and tree view inline actions instead
- Don't use WebviewView for hierarchical data — TreeView is faster, native, and keyboard-accessible
- Don't hardcode any colors — always use `var(--vscode-*)` theme variables
- Don't auto-connect to external services on activate — let the user trigger scans
- Don't put complex forms in the sidebar — use QuickPick or a WebviewPanel dialog instead
