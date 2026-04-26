---
title: "Extension ↔ Webview Message Protocol"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-1, foundation, message-protocol]
---

# Extension ↔ Webview Message Protocol

## Context

In the standalone app, the React frontend talks to the Express backend via HTTP (fetch) and WebSocket. In the VS Code extension, the webview communicates with the extension host via `postMessage`. This plan designs and implements that protocol.

## Phases

- [ ] Phase 1: Protocol design — message types, request/response patterns
- [ ] Phase 2: Extension host bridge — message handler in extension host
- [ ] Phase 3: Webview bridge — message handler in React app (replaces fetch/WS)
- [ ] Phase 4: Type safety — shared TypeScript types for all messages
- [ ] Phase 5: Error handling — timeouts, retries, error propagation

## Details

### Phase 1: Protocol design
Define the message contract:
```typescript
interface VsCodeMessage {
  type: string;          // message type (e.g., 'graph:load', 'agent:update')
  requestId?: string;    // for request/response correlation
  payload?: unknown;     // message data
  error?: string;        // error message (response only)
}
```

Message patterns:
- **Request/Response** — webview sends request, extension host replies (replaces HTTP)
- **Push notification** — extension host pushes updates (replaces WebSocket/SSE)
- **Command** — webview triggers VS Code command (replaces custom REST endpoints)

### Phase 2: Extension host bridge
- `src/services/WebviewBridge.ts`
- `webview.onDidReceiveMessage()` handler
- Route messages to appropriate service by type prefix
- Send responses back via `webview.postMessage()`
- Push updates when FileSystemWatcher detects changes

### Phase 3: Webview bridge
- `src/webview/services/bridge.ts`
- `window.addEventListener('message', handler)` for incoming
- `vscode.postMessage()` for outgoing (acquireVsCodeApi)
- Promise-based request/response wrapper:
  ```typescript
  async function request<T>(type: string, payload?: unknown): Promise<T>
  ```
- Replace all `fetch('/api/...')` calls with `request()` calls

### Phase 4: Type safety
- `src/types/messages.ts` — shared between extension host and webview
- Discriminated union for message types
- Zod schemas for runtime validation (optional, for development)
- Type-safe event emitter pattern

### Phase 5: Error handling
- Request timeout (5s default, configurable)
- Automatic retry for transient failures
- Error propagation from extension host to webview
- Webview reconnection after panel becomes visible again

## Message Type Catalog (Initial)

| Type | Direction | Replaces | Description |
|------|-----------|----------|-------------|
| `graph:load` | request/response | `GET /api/graph` | Load full graph data |
| `graph:update` | push | WebSocket `graphUpdated` | Graph changed notification |
| `agent:list` | request/response | `GET /api/agents` | List all agents |
| `agent:update` | push | WebSocket `agentUpdated` | Agent status change |
| `capabilities:get` | request/response | `GET /api/capabilities` | CLI capabilities |
| `command:execute` | command | custom REST | Trigger VS Code command |
| `theme:changed` | push | — | VS Code theme changed |

## Reference Files (from Watchtower)
- `watchtower/server/index.ts` — WebSocket message handling
- `watchtower/src/store/data-slice.ts` — current fetch() calls to server
- `watchtower/src/store/mc-slice.ts` — SSE event handling

## Success Criteria
1. Webview can request data from extension host and receive typed responses
2. Extension host can push real-time updates to webview
3. All message types are TypeScript-typed with no `any`
4. Request timeouts prevent hung UI
5. Message flow works after webview is hidden and re-shown
