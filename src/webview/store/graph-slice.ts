// ---------------------------------------------------------------------------
// Watchtower — Graph Slice (Zustand)
// Manages graph nodes, edges, loading state, and bridge-based data fetching.
// ---------------------------------------------------------------------------

import type { StateCreator } from 'zustand';
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import dagre from 'dagre';
import * as bridge from '../services/bridge';
import type { AgentStatus } from '../../types/index.js';

// ---------------------------------------------------------------------------
// Sample Hokages data (fallback while extension host is unavailable)
// ---------------------------------------------------------------------------

interface SampleAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  model: string;
  initials: string;
  avatarColor: string;
}

const SAMPLE_AGENTS: SampleAgent[] = [
  { id: 'minato', name: 'Minato', role: 'Lead / Architect', status: 'active', model: 'Opus 4.6', initials: 'MI', avatarColor: '#c0392b' },
  { id: 'tobirama', name: 'Tobirama', role: 'Extension API', status: 'active', model: 'Opus 4.6', initials: 'TO', avatarColor: '#c0392b' },
  { id: 'hiruzen', name: 'Hiruzen', role: 'UX Designer', status: 'active', model: 'Opus 4.6', initials: 'HI', avatarColor: '#c0392b' },
  { id: 'hashirama', name: 'Hashirama', role: 'Frontend Dev', status: 'idle', model: 'Opus 4.6', initials: 'HA', avatarColor: '#c0392b' },
  { id: 'tsunade', name: 'Tsunade', role: 'Data Engineer', status: 'idle', model: 'GPT 5.3', initials: 'TS', avatarColor: '#c0392b' },
  { id: 'kakashi', name: 'Kakashi', role: 'Tester', status: 'idle', model: 'Haiku 4.5', initials: 'KA', avatarColor: '#c0392b' },
];

// ---------------------------------------------------------------------------
// Dagre layout helper
// ---------------------------------------------------------------------------

function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    const width = node.type === 'root' ? 220 : 200;
    const height = node.type === 'root' ? 70 : 100;
    g.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const width = node.type === 'root' ? 220 : 200;
    const height = node.type === 'root' ? 70 : 100;
    return {
      ...node,
      position: { x: pos.x - width / 2, y: pos.y - height / 2 },
    };
  });
}

// ---------------------------------------------------------------------------
// Build initial fallback graph
// ---------------------------------------------------------------------------

function buildFallbackData(): { nodes: Node[]; edges: Edge[] } {
  const rootNode: Node = {
    id: 'root',
    type: 'root',
    position: { x: 0, y: 0 },
    data: { label: 'Watchtower', agentCount: SAMPLE_AGENTS.length, universe: 'Hokages' },
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
      initials: agent.initials,
      avatarColor: agent.avatarColor,
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
// GraphSlice interface
// ---------------------------------------------------------------------------

export interface GraphSlice {
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  error: string | null;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setGraph: (nodes: Node[], edges: Edge[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  /** Apply ReactFlow node interaction changes (drag, select, resize) */
  onNodesChange: (changes: NodeChange[]) => void;
  /** Apply ReactFlow edge interaction changes (select, remove) */
  onEdgesChange: (changes: EdgeChange[]) => void;

  /** Load graph from extension host via bridge */
  loadGraph: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Slice creator
// ---------------------------------------------------------------------------

const fallbackData = buildFallbackData();

export const createGraphSlice: StateCreator<GraphSlice> = (set, get) => ({
  nodes: fallbackData.nodes,
  edges: fallbackData.edges,
  isLoading: false,
  error: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setGraph: (nodes, edges) => set({ nodes, edges }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  loadGraph: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await bridge.request<{ nodes: Node[]; edges: Edge[] }>('graph:load');
      if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
        set({ nodes: data.nodes, edges: data.edges, isLoading: false });
      } else {
        // Empty or invalid response — keep existing nodes as fallback
        set({ isLoading: false });
      }
    } catch (err) {
      // Error — keep existing nodes as fallback
      set({
        error: err instanceof Error ? err.message : 'Failed to load graph',
        isLoading: false,
      });
    }
  },
});
