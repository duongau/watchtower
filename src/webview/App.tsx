import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  type NodeTypes,
  type Node,
} from '@xyflow/react';
import { AgentNode } from './components/AgentNode';
import { RootNode } from './components/RootNode';
import { useWatchtowerStore } from './store';
import * as bridge from './services/bridge';
import type { AgentStatus } from '../types/index.js';
import './App.css';

// ---------------------------------------------------------------------------
// Custom node types
// ---------------------------------------------------------------------------

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  root: RootNode,
};

// ---------------------------------------------------------------------------
// Inner graph component (must be inside ReactFlowProvider)
// ---------------------------------------------------------------------------

function GraphCanvas() {
  // Individual selectors — React 19 safe (no object destructuring)
  const nodes = useWatchtowerStore((s) => s.nodes);
  const edges = useWatchtowerStore((s) => s.edges);
  const isLoading = useWatchtowerStore((s) => s.isLoading);
  const error = useWatchtowerStore((s) => s.error);
  const onNodesChange = useWatchtowerStore((s) => s.onNodesChange);
  const onEdgesChange = useWatchtowerStore((s) => s.onEdgesChange);
  const loadGraph = useWatchtowerStore((s) => s.loadGraph);

  // Signal ready to extension host and load graph on mount
  useEffect(() => {
    bridge.postMessage({ command: 'ready', requestId: 'init' });
    loadGraph();
  }, [loadGraph]);

  const minimapNodeColor = useCallback((node: Node) => {
    if (node.type === 'root') return 'var(--vscode-focusBorder)';
    const status = (node.data as { status?: AgentStatus }).status;
    if (status === 'active') return 'var(--vscode-testing-iconPassed)';
    if (status === 'idle') return 'var(--vscode-editorWarning-foreground)';
    return 'var(--vscode-descriptionForeground)';
  }, []);

  // Loading state — no data yet
  if (isLoading && nodes.length === 0) {
    return (
      <div className="graph-message">
        <span className="graph-message-text">Loading agent graph…</span>
      </div>
    );
  }

  // Error state — no data available
  if (error && nodes.length === 0) {
    return (
      <div className="graph-message graph-message--error">
        <span className="graph-message-text">{error}</span>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Controls showInteractive={false} />
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <MiniMap
        nodeColor={minimapNodeColor}
        maskColor="color-mix(in srgb, var(--vscode-editor-background) 70%, transparent)"
        pannable
        zoomable
      />
    </ReactFlow>
  );
}

// ---------------------------------------------------------------------------
// App — wraps everything in ReactFlowProvider
// ---------------------------------------------------------------------------

export function App() {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100vh' }}>
        <GraphCanvas />
      </div>
    </ReactFlowProvider>
  );
}
