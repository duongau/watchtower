import { createRoot } from 'react-dom/client';
import type { Node, Edge } from '@xyflow/react';
import { App } from './App';
import { useWatchtowerStore } from './store';
import * as bridge from './services/bridge';

// ---------------------------------------------------------------------------
// Bridge → Store: push message handlers (runs once at module load)
// ---------------------------------------------------------------------------

bridge.onPush<{ nodes: Node[]; edges: Edge[] }>('graph:update', (data) => {
  if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
    useWatchtowerStore.getState().setGraph(data.nodes, data.edges);
  }
});

bridge.onPush('agent:update', (_payload: unknown) => {
  // Phase 2 Data Layer will wire individual agent updates here
});

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
