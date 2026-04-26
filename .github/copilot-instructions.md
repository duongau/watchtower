# Watchtower — Copilot Instructions

## Project Context
Watchtower is a VS Code extension for monitoring AI agent squads.
Migrated from a standalone desktop app (Electron/React/Express/SQLite).
Stack: TypeScript, VS Code Extension API, React 19 (webviews), @xyflow/react, Zustand, Vitest.

## Conventions
- Extension host code in `src/` — uses `vscode` module, Node.js APIs
- Webview React code in `src/webview/` — uses DOM APIs, no `vscode` module
- Shared types in `src/types/` — imported by both sides
- Use VS Code theme CSS variables in webviews (never hardcoded colors)
- Individual Zustand selectors (never object pattern — causes React 19 infinite loops)
- All extension → webview communication via typed postMessage protocol
- Tests use vitest. Run with `npm test`.
- Type check with `npm run lint` (tsc --noEmit)
- Compile with `npm run compile`

## VS Code Extension Rules
- Register all disposables via `context.subscriptions.push()`
- Use `vscode.workspace.fs` for file operations (not Node.js `fs`)
- Webviews get data ONLY via postMessage — never import Node.js modules
- Use `vscode.Uri` for all path handling
- Activation events should be as specific as possible (not `*`)
- Bundle with esbuild for production (tree-shake unused code)

## VS Code Extension API Knowledge Base
When building or reviewing VS Code extension code, use the `vscode-api-kb` MCP server — a RAG knowledge base with 1,050 chunks covering all VS Code Extension APIs.
- `search_vscode_api_wiki(query)` — curated, high-signal (start here)
- `search_vscode_api_docs(query)` — deeper coverage from raw source
- `search_vscode_api(query)` — combined search, wiki results boosted
- `list_vscode_api_categories()` — browse all 10 API areas
- `get_vscode_api_page(page)` — full wiki page content
Location: `C:\GitHub\knowledge-bases\vscode-api-kb`

## Skills Reference
The team has earned skills in `.squad/skills/` — read before implementing:
- `vscode-api-kb` — how to search the VS Code API knowledge base
- `webview-patterns` — message passing, CSP/nonce, state persistence, lifecycle
- `vscode-theme-integration` — CSS variables, dark/light/HC theme support
- `vitest-patterns` — testing patterns and conventions
- `pipeline-01 through 07` — full dev pipeline (plan → build → test → review → document → verify)

## Source Reference
Original desktop app at `C:\GitHub\squad-tools\watchtower` — use as reference for porting features.
See `docs/plans/` for the full migration plan hierarchy (6 phases, 31 sub-plans).
