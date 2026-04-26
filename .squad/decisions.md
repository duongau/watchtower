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
