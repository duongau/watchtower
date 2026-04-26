---
title: "Extension Host Services"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-2, data-layer, services]
---

# Extension Host Services

## Context

The Watchtower Express server has 25 route modules handling everything from graph CRUD to session export. In the VS Code extension, these become service classes running in the extension host process, invoked via the postMessage protocol or VS Code commands — no HTTP involved.

## Phases

- [ ] Phase 1: Service architecture — base service class, lifecycle, dependency injection
- [ ] Phase 2: Core services — GraphService, AgentService, SessionService
- [ ] Phase 3: Data services — TokenService, EventService, TaskService
- [ ] Phase 4: Feature services — SkillDiscoveryService, SearchService, DeployService
- [ ] Phase 5: Integration services — MCAdapterService, GitHubSyncService

## Details

### Phase 1: Service architecture
- `src/services/base-service.ts` — lifecycle (init/dispose), output channel logging
- Service registry — singleton instances, lazy initialization
- Dependency injection pattern (constructor params, not global state)
- All services get `ExtensionContext` for state persistence (globalState/workspaceState)

### Phase 2: Core services

| Express Route | Extension Service | Method Mapping |
|--------------|-------------------|----------------|
| `routes/graph.ts` | `GraphService` | loadGraph(), saveGraph(), scanSquadDir() |
| `routes/agents.ts` | `AgentService` | list(), get(), update(), watchStatus() |
| `routes/sessions.ts` | `SessionService` | list(), get(), ingest(), export() |

### Phase 3: Data services

| Express Route | Extension Service | Method Mapping |
|--------------|-------------------|----------------|
| `routes/settings.ts` | VS Code settings API | Use `contributes.configuration` |
| `routes/logs.ts` | `LogService` → OutputChannel | VS Code native logging |
| `routes/audit.ts` | Drop — OutputChannel | Extension events sufficient |
| `routes/search.ts` | `SearchService` | fullText search over JSON files |
| `routes/backup.ts` | `BackupService` | Export/import JSON data dir |

### Phase 4: Feature services

| Express Route | Extension Service | Notes |
|--------------|-------------------|-------|
| `routes/skills.ts` | `SkillDiscoveryService` | Port from server/services/ |
| `routes/deploy.ts` | `DeployService` | Terminal API for agent launch |
| `routes/suggestions.ts` | `SuggestionService` | Quick actions |
| `routes/file-context.ts` | Drop — VS Code workspace API | Native file access |
| `routes/files.ts` | Drop — VS Code workspace API | Native file access |
| `routes/capabilities.ts` | `CapabilityService` | Detect copilot CLI, agents |

### Phase 5: Integration services

| Express Route | Extension Service | Notes |
|--------------|-------------------|-------|
| `routes/mc.ts` | `MCAdapterService` | Mission Control connection |
| `routes/github-sync.ts` | `GitHubSyncService` | Uses gh CLI or GitHub MCP |
| `routes/agent-comms.ts` | `AgentCommsService` | Inter-agent communication |
| `routes/alerts.ts` | `AlertService` | VS Code notifications |
| `routes/webhooks.ts` | Drop or rethink | No HTTP server to receive hooks |
| `routes/auth.ts` | Drop | No HTTP server, no auth needed |
| `routes/mcp-servers.ts` | `MCPService` | MCP server discovery |

## Reference Files (from Watchtower)
- `watchtower/server/routes/` — all 25 route modules
- `watchtower/server/services/` — 8 service implementations
- `watchtower/src/adapter/` — adapter layer
