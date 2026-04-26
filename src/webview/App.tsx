import { useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import dagre from 'dagre';
import { AgentNode } from './components/AgentNode';
import { RootNode } from './components/RootNode';
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
// Sample Hokages data
// ---------------------------------------------------------------------------

interface SampleAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  model: string;
}

const SAMPLE_AGENTS: SampleAgent[] = [
  { id: 'minato', name: 'Minato', role: 'Lead / Architect', status: 'active', model: 'Opus 4.6' },
  { id: 'tobirama', name: 'Tobirama', role: 'Extension API', status: 'active', model: 'Opus 4.6' },
  { id: 'hiruzen', name: 'Hiruzen', role: 'UX Designer', status: 'active', model: 'Opus 4.6' },
  { id: 'hashirama', name: 'Hashirama', role: 'Frontend Dev', status: 'idle', model: 'Opus 4.6' },
  { id: 'tsunade', name: 'Tsunade', role: 'Data Engineer', status: 'idle', model: 'GPT 5.3' },
  { id: 'kakashi', name: 'Kakashi', role: 'Tester', status: 'idle', model: 'GPT 5.3' },
];

// ---------------------------------------------------------------------------
// Dagre layout helper
// ---------------------------------------------------------------------------

function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    const width = node.type === 'root' ? 200 : 180;
    const height = node.type === 'root' ? 60 : 80;
    g.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const width = node.type === 'root' ? 200 : 180;
    const height = node.type === 'root' ? 60 : 80;
    return {
      ...node,
      position: { x: pos.x - width / 2, y: pos.y - height / 2 },
    };
  });
}

// ---------------------------------------------------------------------------
// Build initial nodes & edges
// ---------------------------------------------------------------------------

function buildInitialData() {
  const rootNode: Node = {
    id: 'root',
    type: 'root',
    position: { x: 0, y: 0 },
    data: { label: 'Watchtower', agentCount: SAMPLE_AGENTS.length },
  };

  const agentNodes: Node[] = SAMPLE_AGENTS.map((agent) => ({
    id: agent.id,
    type: 'agent',
    position: { x: 0, y: 0 },
    data: {
      name: agent.name,
      role: agent.role,
      status: agent.status,
      model: agent.model,
    },
  }));

  const edges: Edge[] = SAMPLE_AGENTS.map((agent) => ({
    id: `root-${agent.id}`,
    source: 'root',
    target: agent.id,
  }));

  const allNodes = [rootNode, ...agentNodes];
  const laidOut = applyDagreLayout(allNodes, edges);
  return { nodes: laidOut, edges };
}

// ---------------------------------------------------------------------------
// Inner graph component (must be inside ReactFlowProvider)
// ---------------------------------------------------------------------------

function GraphCanvas() {
  const fallback = useMemo(() => buildInitialData(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(fallback.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(fallback.edges);

  // Signal ready to extension host on mount
  useEffect(() => {
    bridge.postMessage({ command: 'ready', requestId: 'init' });
  }, []);

  // Request live graph data from extension host
  useEffect(() => {
    let cancelled = false;

    bridge
      .request<{ nodes: Node[]; edges: Edge[] }>('graph:load')
      .then((data) => {
        if (cancelled) return;
        if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
        // If empty or invalid, keep the hardcoded fallback
      })
      .catch(() => {
        // Request failed or timed out — keep hardcoded fallback
      });

    return () => {
      cancelled = true;
    };
  }, [setNodes, setEdges]);

  // Wire up push handler for future real data
  useEffect(() => {
    const unsub = bridge.onPush('agent:update', (_payload: unknown) => {
      // Phase 2 Data Layer will populate real agent data here
      // For now, keep sample data
    });
    return unsub;
  }, []);

  const minimapNodeColor = useCallback((node: Node) => {
    if (node.type === 'root') return 'var(--vscode-focusBorder)';
    const status = (node.data as { status?: AgentStatus }).status;
    if (status === 'active') return 'var(--vscode-testing-iconPassed)';
    if (status === 'idle') return 'var(--vscode-editorWarning-foreground)';
    return 'var(--vscode-descriptionForeground)';
  }, []);

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
