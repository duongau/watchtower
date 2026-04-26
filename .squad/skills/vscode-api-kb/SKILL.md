---
name: "vscode-api-kb"
description: "How to search and use the VS Code Extension API Knowledge Base (MCP server: vscode-api-kb)"
domain: "vscode-api"
confidence: "high"
source: "earned"
---

## Context

The **VS Code Extension API Knowledge Base** is a complete, production-ready MCP server that provides agents with authoritative information about VS Code's extension API. The KB is built from 1,050 synthesized and raw documentation chunks, organized into 10 wiki categories for maximum signal.

**Location:** `C:\GitHub\knowledge-bases\vscode-api-kb`
**MCP Server:** `vscode-api-kb`
**Status:** Complete and ready for integration into development workflows

## Available Tools

| Tool | Use Case | Signal | When to Use |
|------|----------|--------|-----------|
| `search_vscode_api_wiki` | Synthesized wiki (217 chunks) | 🟢 High | **Default choice** — gives best signal for API concepts, patterns, quick answers |
| `search_vscode_api_docs` | Raw docs KB (833 chunks) | 🟡 Medium | Fallback when wiki doesn't cover it; deeper technical details; API reference lookups |
| `search_vscode_api` | Combined search, wiki boost | 🟢 High | When unsure which to search; the system ranks wiki results higher |
| `list_vscode_api_categories` | Browse all 10 wiki categories | 🟢 High | When exploring what's available without a specific query |
| `get_vscode_api_page` | Retrieve full markdown of a wiki page | 🟢 High | After finding a page via list/search, get complete context |

## Wiki Categories

The knowledge base organizes all content into these 10 categories:

1. **Getting Started** — Extension anatomy, hello world, extension manifest, debugging
2. **AI Extensions** — AI/copilot features, inline completions, chat participation
3. **Webviews & Custom Editors** — WebviewPanel, WebviewView, custom editor API, messaging
4. **Theming** — Theme colors, icon theming, color palette, CSS variables
5. **Language Extensions** — Language server protocol, syntax highlighting, diagnostics
6. **UI Components & Tree Views** — Tree view API, sidebar patterns, command palette, menu registration
7. **UX Guidelines** — Best practices for extension UI/UX, accessibility, dark theme handling
8. **References** — API reference documentation, types, interfaces, deprecations
9. **Testing/Publishing/DevOps** — Unit testing, extension testing, publishing to marketplace, CI/CD
10. **Advanced Topics** — Performance optimization, memory management, security, remote development

## Common CDA Extension Tasks → Search Patterns

### Task: Build a new webview panel or sidebar UI
**Query:** `search_vscode_api_wiki("WebviewPanel creation and messaging")`
- Returns: Webview creation patterns, message passing, CSP/nonce requirements, resource loading
- **Also fetch:** `get_vscode_api_page("Webview Best Practices")` for full guidelines
- **Anti-pattern:** Don't assume VS Code messaging API — always search for current patterns

### Task: Implement custom settings or configuration
**Query:** `search_vscode_api_wiki("extension configuration settings management")`
- Returns: Settings API, read/write, scope (global vs workspace), change listeners
- **Also search:** `search_vscode_api_docs("package.json contributes.configuration")` for schema details

### Task: Add theme color support or dark theme handling
**Query:** `search_vscode_api_wiki("theme colors CSS variables")`
- Returns: Available theme tokens, CSS class naming, dark/light/high-contrast detection
- **Key:** Search wiki first (synthesized patterns), docs second (raw color names)

### Task: Register commands, buttons, menu items
**Query:** `search_vscode_api_wiki("command registration menu integration")`
- Returns: Command API, when/where clauses, menu contexts, keyboard shortcuts
- **Also:** `list_vscode_api_categories()` and browse "UI Components & Tree Views"

### Task: Use Tree View API for hierarchical data
**Query:** `search_vscode_api_wiki("tree view data provider implementation")`
- Returns: TreeDataProvider interface, refresh patterns, icons, right-click menus
- **Note:** Raw docs KB has complete API reference; wiki has "how to implement" patterns

### Task: Integrate with Language Server Protocol (LSP)
**Query:** `search_vscode_api_wiki("language server protocol client setup")`
- Returns: LSP client creation, message routing, diagnostics, code actions
- **Fallback:** `search_vscode_api_docs("language-server-extension-guide")` for deeper topics

### Task: Test the extension (unit, integration, e2e)
**Query:** `search_vscode_api_wiki("extension testing unit integration")`
- Returns: Test API, mock window/workspace, command execution in tests
- **Also:** Browse category "Testing/Publishing/DevOps" for full testing strategy

### Task: Publish to VS Code Marketplace or set up CI/CD
**Query:** `search_vscode_api_wiki("marketplace publishing automation")`
- Returns: Publishing requirements, versioning, CI/CD examples, release automation
- **Category:** "Testing/Publishing/DevOps"

## How to Interpret Search Results

Each KB result is a **chunk** with these metadata fields:

- **source** — Where the chunk came from (e.g., `webview-best-practices.md` or `api/references/commands.md`)
- **category** — Which of the 10 wiki categories it belongs to (helps you understand depth)
- **relevance** — Similarity score; chunks at the top are best matches
- **content** — The actual text (may be truncated; use `get_vscode_api_page()` to fetch full page)

**Interpretation guide:**
- **Wiki results (high signal):** 3–5 chunks usually enough; concepts already synthesized
- **Docs results (technical depth):** May need 5–10 chunks; organized by API surface
- **Combined search:** Treat first 2–3 wiki results as "quick answer," then explore docs if needed

## Anti-Patterns

🚫 **DON'T:** Guess or assume VS Code API behavior. Always search the KB first.
- ❌ "I think WebviewPanel message passing works like this…"
- ✅ Search: `search_vscode_api_wiki("WebviewPanel message passing")`

🚫 **DON'T:** Look only at raw docs when building patterns. Use wiki first.
- ❌ Search only docs KB for "how to implement webviews"
- ✅ Start with wiki search, fall back to docs for reference details

🚫 **DON'T:** Skip the category context. Categories help you understand whether you have the right result.
- ❌ Get a search result and assume it's the only relevant answer
- ✅ Check the category, then browse others if needed

🚫 **DON'T:** Assume old VS Code API patterns still work. Always verify with KB.
- ❌ "I remember WebviewView worked like this in 2022…"
- ✅ Search the KB for current API surface and examples

🚫 **DON'T:** Build custom settings without checking the schema. Use KB patterns.
- ❌ Hardcode setting types or defaults
- ✅ Search for settings API patterns, check package.json contributes examples

## When to Use Each Search Tool

| Scenario | Tool | Why |
|----------|------|-----|
| "I need to build X" (pattern/approach question) | `search_vscode_api_wiki` | Wiki has synthesized patterns, fewer results, high signal |
| "I need to find the exact API for X" (reference question) | `search_vscode_api_docs` | Docs has full API surface, all types, complete reference |
| "I'm not sure what I'm looking for" | `search_vscode_api` | Combined search ranks wiki results higher; lets you explore |
| "Explore what's available in category Y" | `list_vscode_api_categories()` then `get_vscode_api_page()` | Browse-first approach; good when you have time to explore |

## Handoff to Next Agent

When handing off work related to VS Code API implementation:

1. **Include the KB in MCP TOOLS block** — if spawning another agent for extension code, add `vscode-api-kb` to available tools
2. **Document your search queries** — if you found a key pattern, mention the query (so next agent can verify/extend)
3. **Link KB sources** — if citing API behavior, include the KB source page name (e.g., "per `webview-best-practices.md`")
4. **Flag API gaps** — if the KB doesn't cover something, document what's missing so Sand Squad can add it

## See Also

- `.squad/skills/webview-patterns` — CDA-specific patterns that build on VS Code API KB knowledge
- `.squad/skills/vscode-theme-integration` — CDA theming patterns (uses KB for VS Code theme colors)
- `.squad/skills/pipeline-02-build` — Build phase playbook (references KB when implementing new features)
