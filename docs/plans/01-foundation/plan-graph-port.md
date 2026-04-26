---
title: "Port Agent Graph to Webview"
status: not-started
created: 2026-04-26T00:00:00
tags: [phase-1, foundation, graph]
---

# Port Agent Graph to Webview

## Context

The heart of Watchtower is the @xyflow/react graph visualization. It shows agents as interactive nodes with edges representing relationships. The graph supports 13 layout algorithms, undo/redo, drag/drop, grouping, collapsing, and a minimap. This plan ports the graph into the VS Code webview.

## Phases

- [ ] Phase 1: Core graph — ReactFlow canvas with basic node rendering
- [ ] Phase 2: Node types — Port AgentNode, SkillNode, GroupNode, RootNode, etc.
- [ ] Phase 3: Edge types — Port InsertEdge and standard edges
- [ ] Phase 4: Layout engine — Port dagre-layout utility with all 13 directions
- [ ] Phase 5: Interactions — Drag/drop, selection, context menu
- [ ] Phase 6: Undo/redo — Port history-slice from Zustand store
- [ ] Phase 7: MiniMap & controls — ReactFlow built-in components

## Details

### Phase 1: Core graph
- Port `App.tsx` ReactFlow setup into webview React app
- `ReactFlowProvider` wrapper
- `Controls`, `Background`, `MiniMap` components
- Basic node/edge rendering with hardcoded sample data
- Verify @xyflow/react works inside VS Code webview (CSP compatibility)

### Phase 2: Node types
Port these custom node components from `src/components/nodes/`:
- `AgentNode.tsx` — agent status, role, model info
- `SkillNode.tsx` — skill metadata
- `GroupNode.tsx` — collapsible group container
- `NoteNode.tsx` — freeform notes
- `RootNode.tsx` — project root node
- `CharterNode.tsx` — charter display
- `PipelineNode.tsx` — pipeline visualization
- Adapt CSS to use VS Code theme variables instead of hardcoded colors

### Phase 3: Edge types
- Port `InsertEdge.tsx` — custom edge with insert button
- Standard edges with labels and animations
- Edge styling with CSS variables

### Phase 4: Layout engine
- Port `src/utils/dagre-layout.ts`
- All 13 layout directions: TB, LR, BT, RL, Radial, Grid, Clustered, Swimlane, Mindmap, Compact, Timeline, Squad, Spread
- Spacing adjustment (30%–400%)
- `LayoutsDropdown.tsx` component adaptation

### Phase 5: Interactions
- Node dragging with position persistence
- Multi-selection (Shift+click, box select)
- Context menu (`ContextMenu.tsx` port)
- Node creation dialog (`CreateNodeDialog.tsx`)
- Delete confirmation (`DeleteConfirmDialog.tsx`)

### Phase 6: Undo/redo
- Port `history-slice.ts` from Zustand store
- Keyboard shortcuts: Ctrl+Z / Ctrl+Y
- 50-action history depth
- structuredClone-based state snapshots

### Phase 7: MiniMap & controls
- ReactFlow `<MiniMap>` component
- ReactFlow `<Controls>` component (zoom in/out/fit)
- Custom toolbar buttons for layout, save, export

## Reference Files (from Watchtower)
- `watchtower/src/App.tsx` — main ReactFlow setup
- `watchtower/src/components/nodes/` — all 7 node types
- `watchtower/src/components/InsertEdge.tsx` — custom edge
- `watchtower/src/utils/dagre-layout.ts` — layout algorithms
- `watchtower/src/store/graph-slice.ts` — graph state management
- `watchtower/src/store/history-slice.ts` — undo/redo
- `watchtower/src/types/graph.ts` — graph type definitions

## Key Constraints
- @xyflow/react must work inside webview CSP (verify first)
- All data comes from extension host via postMessage (no fetch/HTTP)
- CSS must use VS Code theme variables (not hardcoded hex)
- Performance: handle 100+ nodes smoothly in webview

## Success Criteria
1. Agent graph renders with all 7 node types
2. All 13 layout algorithms work correctly
3. Drag/drop, zoom, pan work smoothly
4. Undo/redo works with keyboard shortcuts
5. MiniMap shows graph overview
6. Context menu provides node operations
7. Graph styling matches VS Code theme (dark/light)
