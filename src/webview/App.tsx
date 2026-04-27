import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  type NodeTypes,
  type Node,
  type DefaultEdgeOptions,
} from '@xyflow/react';
import { TowerControl, RefreshCw, LayoutGrid, Maximize } from 'lucide-react';
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

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
};

// ---------------------------------------------------------------------------
// Toolbar above the graph
// ---------------------------------------------------------------------------

function Toolbar({ agentCount }: { agentCount: number }) {
  const { fitView } = useReactFlow();
  const loadGraph = useWatchtowerStore((s) => s.loadGraph);

  const handleRefresh = useCallback(() => {
    loadGraph();
  }, [loadGraph]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.15, duration: 300 });
  }, [fitView]);

  return (
    <div className="watchtower-toolbar">
      <div className="watchtower-toolbar__title">
        <TowerControl size={16} />
        Watchtower
      </div>
      {agentCount > 0 && (
        <span className="watchtower-toolbar__count">
          {agentCount} agent{agentCount !== 1 ? 's' : ''}
        </span>
      )}
      <div className="watchtower-toolbar__spacer" />
      <button
        className="watchtower-toolbar__btn"
        onClick={handleRefresh}
        title="Refresh"
        aria-label="Refresh graph"
      >
        <RefreshCw size={14} />
      </button>
      <button
        className="watchtower-toolbar__btn"
        onClick={handleFitView}
        title="Zoom to Fit"
        aria-label="Zoom to fit all nodes"
      >
        <Maximize size={14} />
      </button>
    </div>
  );
}

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

  const agentCount = nodes.filter((n) => n.type === 'agent').length;

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
    <>
      <Toolbar agentCount={agentCount} />
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} position="bottom-left" />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <MiniMap
            nodeColor={minimapNodeColor}
            maskColor="color-mix(in srgb, var(--vscode-editor-background) 70%, transparent)"
            pannable
            zoomable
            position="bottom-right"
          />
        </ReactFlow>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// App — wraps everything in ReactFlowProvider
// ---------------------------------------------------------------------------

export function App() {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <GraphCanvas />
      </div>
    </ReactFlowProvider>
  );
}
