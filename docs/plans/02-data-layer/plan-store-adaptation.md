---
title: "Store Adaptation"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-2, data-layer, zustand, store]
---

# Store Adaptation

## Context

Watchtower has 8 Zustand slices (graph, UI, history, chat, context-hub, MC, data, deploy) managing all frontend state. In the extension, the React webview still uses Zustand, but data fetching changes: instead of HTTP requests to Express, the webview receives data via postMessage from the extension host.

## Phases

- [ ] Phase 1: Audit slices — inventory all 8 slices, mark keep/adapt/drop
- [ ] Phase 2: Data slice rewrite — replace fetch() calls with postMessage bridge
- [ ] Phase 3: Chat slice — adapt or drop (may use VS Code Chat API instead)
- [ ] Phase 4: MC slice — adapt SSE streaming to postMessage events
- [ ] Phase 5: Deploy slice — adapt to Terminal API integration

## Details

### Phase 1: Audit slices

| Slice | Status | Action |
|-------|--------|--------|
| `graph-slice.ts` | Keep | Core functionality — nodes, edges, layouts |
| `ui-slice.ts` | Keep | Panel visibility, toasts, selections |
| `history-slice.ts` | Keep | Undo/redo, autosave |
| `chat-slice.ts` | Evaluate | May drop if using VS Code Chat API |
| `context-hub-slice.ts` | Drop | VS Code explorer replaces this |
| `mc-slice.ts` | Adapt | SSE → postMessage for MC events |
| `data-slice.ts` | Rewrite | All HTTP fetch → postMessage requests |
| `deploy-slice.ts` | Adapt | HTTP deploy → Terminal API |

### Phase 2: Data slice rewrite
Current pattern:
```typescript
// Desktop (HTTP)
const res = await fetch('/api/graph');
const data = await res.json();
```

New pattern:
```typescript
// Extension webview (postMessage)
vscode.postMessage({ type: 'request', command: 'graph.load' });
// Response comes async via message handler
window.addEventListener('message', (e) => {
  if (e.data.type === 'response' && e.data.command === 'graph.load') {
    setNodes(e.data.payload.nodes);
  }
});
```

### Phase 3: Chat slice
- If keeping custom chat: adapt WebSocket to postMessage
- If using VS Code Chat API: drop the slice entirely, register a ChatParticipant
- Decision needed: custom chat gives more control, VS Code Chat integrates better

### Phase 4: MC slice
- Replace EventSource (SSE) with postMessage event streaming
- Extension host manages MC connection, pushes events to webview
- Webview store receives and renders same widget data

### Phase 5: Deploy slice
- Replace `POST /api/deploy/launch` with Terminal API
- Extension creates terminal, runs copilot CLI command
- Status tracked via terminal output parsing or callback

## Reference Files (from Watchtower)
- `watchtower/src/store/` — all 8 slice files
- `watchtower/src/store/types.ts` — WatchtowerStore interface
- `watchtower/src/store/helpers.ts` — node/edge conversion utilities
