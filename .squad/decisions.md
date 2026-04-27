# Squad Decisions

> Canonical decision ledger for Watchtower (VS Code Extension)

---

### 2026-04-26T00:00:00Z: Hybrid extension architecture
**By:** Duong + Squad (Coordinator)
**What:** Use hybrid architecture — VS Code WebviewPanels for complex React UI (agent graph, Mission Control dashboard), native VS Code APIs for navigation and commands (tree views, status bar, command palette).
**Why:** Best of both worlds — preserves the rich graph visualization while integrating deeply with VS Code where native APIs are superior.

### 2026-04-26T00:01:00Z: Replace SQLite with JSON files
**By:** Duong + Squad (Coordinator)
**What:** Replace better-sqlite3 database with JSON files stored in `~/.copilot/Watchtower/`. Extension globalState/workspaceState for lightweight persistence.
**Why:** Native modules (better-sqlite3) are painful to bundle in VS Code extensions. JSON files are simpler, portable, and sufficient for the data volumes involved.

### 2026-04-26T00:02:00Z: Drop Express server entirely
**By:** Duong + Squad (Coordinator)
**What:** No HTTP server in the extension. Express routes become extension host message handlers. WebSocket replaced by postMessage protocol.
**Why:** VS Code extension host IS the backend. No ports, no CORS, no auth needed.

### 2026-04-26T00:03:00Z: Drop Electron, Tauri, Remote Access
**By:** Duong + Squad (Coordinator)
**What:** Remove all desktop app infrastructure (Electron, Tauri, QR code remote access). VS Code is the host.
**Why:** VS Code handles windowing, remote access (via SSH/tunnels), and the editor natively. These layers become redundant.

### 2026-04-26T00:04:00Z: Naruto Hokages universe for team casting
**By:** Duong
**What:** Team uses Naruto universe (Hokages theme) for agent naming.
**Why:** User preference.

### 2026-04-26T01:00:00Z: Clean baseline — build incrementally
**By:** Duong
**What:** Don't port everything from the desktop app at once. Start with a clean VS Code extension baseline and add features incrementally. The old Watchtower was a great proof of concept but hasn't been used extensively — rebuild what matters, not everything.
**Why:** Avoids carrying forward desktop-app patterns that don't fit VS Code. Lets us build the right thing for the extension model.

### 2026-04-26T01:01:00Z: Multi-squad discovery across local machine
**By:** Duong
**What:** The extension should discover and monitor ALL `.squad/` directories across the user's local projects — not just the current workspace. Unified dashboard across every squad.
**Why:** Core value proposition — one place to see what every team is doing day-to-day.

### 2026-04-26T01:02:00Z: Reference material — three inspiration projects
**By:** Duong
**What:** ATM (Agent Team Manager), Mission Control (builderz-labs), and Squad (bradygaster) are reference projects. ATM's visual org chart + Mission Control's dashboard depth + Squad's framework = Watchtower's DNA.
**Why:** Establishes design language and feature expectations without copying any single project.

### 2026-04-26T14:00:00Z: Squad-centric sidebar hierarchy
**By:** Hiruzen
**What:** Use squad-centric tree hierarchy (Option B from plan-sidebar-design.md) — squads as top-level expandable nodes, agents nested under each squad, rather than a flat view.
**Why:** Multi-squad discovery is a core decision. Users have many squads across different projects. Grouping agents under their squad creates immediate context — you see where an agent lives, not just that it exists. This matches how VS Code's Explorer groups files under workspaces. The flat view would collapse this critical context.

### 2026-04-26T14:01:00Z: Four sidebar tree sections — Squads, Sessions, Skills, Overview
**By:** Hiruzen
**What:** The sidebar contains four collapsible sections: Squads (primary, always open), Recent Sessions (cross-squad timeline), Skills (collapsed by default), and Overview (compact live stats).
**Why:** Studied CDA Extension's single WebviewView sidebar — it's rich but heavy. For Watchtower, native TreeView sections are faster to render, support keyboard navigation, and feel native. The Overview section provides at-a-glance stats without opening a WebviewPanel — inspired by how GitLens puts key info right in the sidebar. Skills collapsed by default because it's reference data, not daily-driver.

### 2026-04-26T14:02:00Z: TreeView for sidebar, not WebviewView
**By:** Hiruzen
**What:** Use native VS Code TreeView (TreeDataProvider) for the sidebar, not a WebviewView like CDA Extension uses.
**Why:** CDA Extension's WebviewView sidebar is essentially a custom web app running in a narrow column — powerful but complex. For Watchtower's sidebar, the data is hierarchical (squads → agents, sessions by time) which is exactly what TreeView excels at. TreeView gives us: free keyboard navigation, native look/feel, context menus, inline actions, drag-and-drop, and zero bundle size. The cost is no custom HTML — but our sidebar doesn't need it. Reserve WebviewView only if we later need a rich sidebar widget (e.g., mini-graph preview).

### 2026-04-26T14:03:00Z: Activity bar icon with badge count
**By:** Hiruzen
**What:** Register a dedicated Activity Bar icon for Watchtower with a badge showing active agent count.
**Why:** Every serious VS Code extension owns an activity bar slot — it's the primary entry point. The badge (e.g., "14" for 14 agents) gives at-a-glance awareness even when the sidebar is closed. CDA Extension does this well with its CDA Cortex icon. We use a telescope/radar motif to evoke "watching over" squads.

### 2026-04-26T14:04:00Z: Dashboard as WebviewPanel, not sidebar
**By:** Hiruzen
**What:** The overview dashboard (fleet status, token usage, agent cards, squad health) is a WebviewPanel that opens in the editor area as a tab, not squeezed into the sidebar.
**Why:** The original Watchtower app had a full-screen Mission Control panel with widget grids, stat bars, and agent cards. This kind of rich layout needs horizontal space and React rendering — a sidebar WebviewView would be too narrow (280px). A WebviewPanel opens like a document tab, can be split/moved, and gets the full editor width. This matches how Thunder Client and MongoDB extensions handle their complex UIs.

### 2026-04-26T14:05:00Z: Status bar shows squad count, active agents, tokens, cost
**By:** Hiruzen
**What:** Four status bar items on the left side: squad count, active agent count, token usage today, and estimated cost today.
**Why:** Status bar is always visible and costs nothing in terms of UI complexity. These four metrics are the "vitals" that a squad manager glances at constantly. CDA Extension does this with a single status bar item — we expand it because Watchtower monitors multiple squads simultaneously. Clicking any item opens the dashboard for detail.

### 2026-04-26T14:06:00Z: Agent status indicators — active/idle/offline with color dots
**By:** Hiruzen
**What:** Three agent states: active (green dot), idle (yellow dot), offline (gray dot). Consistent across tree view, dashboard cards, and status bar.
**Why:** The original Watchtower desktop app used colored accent strips on AgentNode cards. In VS Code's tighter UI, simple colored dots (8px circles) are more legible at small sizes. Green/yellow/gray is universally understood and works well with VS Code's existing semantic colors (`--vscode-testing-iconPassed`, `--vscode-editorWarning-foreground`, `--vscode-descriptionForeground`).

### 2026-04-26T16:00:00Z: Code Review — Extension Scaffold → APPROVE
**By:** Minato (Lead / Architect)
**What:** Reviewed extension scaffold (extension.ts, types, esbuild, package.json, tsconfig, launch.json, vitest config, 26 tests). All VS Code extension best practices followed — specific activation events, proper disposable management, dual tsconfig strategy, discriminated union message types.
**Why:** Clean baseline for incremental feature development. No blockers. Nits: redundant onCommand activation events (auto-registered since VS Code 1.74+), dependencies vs devDependencies for vsix size.

### 2026-04-26T17:00:00Z: Code Review — Message Protocol → APPROVE
**By:** Minato (Lead / Architect)
**What:** Reviewed message protocol (messages.ts, MessageBridge.ts, webview bridge.ts, 35 tests). Three-shape design (Request, Response, Push) with discriminated unions, request/response correlation via requestId, proper timeout and cancellation handling.
**Why:** Architecturally sound. Clean separation between extension bridge (vscode APIs) and webview bridge (DOM APIs). No cross-boundary leaks. Suggestions: GenericResponse weakens the union, push() is redundant wrapper around send().

### 2026-04-26T17:30:00Z: Code Review — Webview Infrastructure → APPROVE
**By:** Minato (Lead / Architect)
**What:** Reviewed webview infrastructure (GraphPanelProvider, getWebviewContent, Vite config, webview stub). CSP is strict (nonce-based, no unsafe-inline/eval), resource URIs correct via asWebviewUri(), singleton lifecycle clean, retainContextWhenHidden justified for graph state.
**Why:** Solid, secure, well-tested. Bridge architecture is an improvement over raw postMessage switch patterns. Nit: push GraphPanelProvider into context.subscriptions for explicit cleanup on deactivation.

### 2026-04-26T19:00:00Z: Code Review — Graph Port → APPROVE with nits
**By:** Minato (Lead / Architect)
**What:** Reviewed graph port (AgentNode, RootNode, GraphCanvas, App, dagre layout, 48 tests). Architecturally sound — clean component design, proper ReactFlow wrapping, correct bridge integration, near-perfect theme compliance. Two hardcoded colors (selection box rgba, MiniMap maskColor) and one withdrawn nit.
**Why:** Graph port delivers the core visualization. 100% VS Code CSS variables in all CSS files. No Zustand yet (raw useNodesState/useEdgesState) so no React 19 risks. CSP-compatible — Vite bundles @xyflow styles at build time, no runtime external requests. dagre layout is a pure function via useMemo. Nits fixed by Tsunade before merge.

### 2026-04-26T20:00:00Z: Code Review — Graph Data Loading → APPROVE with nits
**By:** Minato (Lead / Architect)
**What:** Reviewed graph data loading layer (squad-parser.ts, graph-builder.ts, squad-discovery.ts, GraphPanelProvider.ts, App.tsx, types/index.ts, 33 new tests). Clean separation between pure parsers, pure graph construction, VS Code API discovery, and orchestration in the provider. All file operations use `vscode.workspace.fs`. Parsers handle malformed/missing data gracefully. 157 tests pass, TypeScript compiles clean. One major bug found: multi-squad xOffset accumulation in graph-builder.ts causes 3+ squads to overlap. Security note: agent names from team.md used in path construction — sanitize before charter content loading is added.
**Why:** Well-architected data layer. Every dimension passes — vscode.workspace.fs usage, parser robustness, type safety, multi-squad support, fallback behavior, test coverage. The xOffset bug is real but only affects 3+ squads (2-squad tests pass). Fix is one-line: use absolute right edge (`maxX + 120`) instead of relative width.

### 2026-04-26T20:45:00Z: Code Review — File System Watchers → APPROVE with nits
**By:** Minato (Lead / Architect)
**What:** Reviewed squad-watcher.ts, extension.ts wiring, GraphPanelProvider refresh, App.tsx push handling, and 225 lines of watcher tests. Debouncing is correct, dispose cleans up everything, watcher-to-graph pipeline works end-to-end. Two minor issues: race condition in `refresh()` where `this.bridge` can become undefined after async `loadSquads()` if panel closes mid-flight; event listener disposables from `onDid*` calls silently discarded (acceptable since parent watcher dispose handles it).
**Why:** Watcher implementation is well-structured. Tests cover critical paths including timer-cancel-on-dispose. Minor fixes recommended but non-blocking.

### 2026-04-26T21:15:00Z: Code Review — Extension Host Services → APPROVE with nits
**By:** Minato (Lead / Architect)
**What:** Reviewed service-registry.ts, graph-service.ts, session-service.ts, extension.ts wiring, GraphPanelProvider delegation, protocol extensions, 22 new tests. Clean separation — GraphService orchestrates, SessionService reads, provider delegates. Lifecycle with reverse-order disposal. Two major items: Session type defined in service file instead of types/ (fragile cross-boundary import chain), and registry dispose doesn't catch individual failures (one throw leaks remaining services). Minor: session:list re-parses all squads just to extract paths; GenericResponse still weakens the union.
**Why:** Architecture is sound. Service layer cleanly separates concerns. Type safety maintained throughout protocol. Major items should be addressed soon but don't block forward progress.

### 2026-04-26T21:45:00Z: Code Review — Store Adaptation → APPROVE
**By:** Minato (Lead / Architect)
**What:** Reviewed graph-slice.ts, ui-slice.ts, store/index.ts composition, App.tsx refactor, index.tsx push handlers. React 19 safety verified — all seven useWatchtowerStore() calls use individual selectors, no object destructuring. Bridge integration correct: request/response for graph:load, push handlers wired at module scope using getState() outside React. Zustand v5 slice composition with StateCreator spread pattern is correct TypeScript. Error handling solid — loading states cleared in both paths, fallback data always available, UI shows cached data during errors.
**Why:** Store adaptation is clean, React 19-safe, and follows all Zustand best practices. No vscode imports in webview code. Zero blocking issues.

### 2026-04-26T22:15:00Z: Code Review — Navigation (Tree Views, Status Bar, Activity Bar) → APPROVE
**By:** Minato (Lead / Architect)
**What:** Reviewed navigation layer — AgentTreeProvider (squad-centric hierarchy), SessionTreeProvider (flat list, 20-cap), StatusBarProvider (squad count, active agents), activity bar icon (telescope SVG, currentColor), five commands with proper when-clauses, 27 tests across 3 suites. All VS Code API patterns correct: TreeItem subclasses, ThemeIcon/ThemeColor, StatusBarAlignment.Left with priority ordering, codicons, MarkdownString tooltips. Disposable management clean — all registrations pushed to context.subscriptions. Skills view declared but no provider yet (future work).
**Why:** Navigation layer follows all VS Code extension patterns correctly and aligns with architecture decisions. Four nits: EventEmitter dispose on tree providers, Skills view placeholder needs visibility gate, redundant onCommand activation events, GraphPanelProvider still not in subscriptions. All non-blocking.
