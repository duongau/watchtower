import { describe, it, expect } from 'vitest';
import type { AgentStatus } from '../src/types/index';

// ---------------------------------------------------------------------------
// Mirror the sample data and structures from App.tsx to test the data layer
// without requiring DOM/React rendering.
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

const VALID_STATUSES: AgentStatus[] = ['active', 'idle', 'error', 'offline'];

// Build the same node/edge structures App.tsx creates
function buildNodes() {
  const rootNode = {
    id: 'root',
    type: 'root' as const,
    position: { x: 0, y: 0 },
    data: { label: 'Watchtower', agentCount: SAMPLE_AGENTS.length },
  };

  const agentNodes = SAMPLE_AGENTS.map((agent) => ({
    id: agent.id,
    type: 'agent' as const,
    position: { x: 0, y: 0 },
    data: {
      name: agent.name,
      role: agent.role,
      status: agent.status,
      model: agent.model,
    },
  }));

  return [rootNode, ...agentNodes];
}

function buildEdges() {
  return SAMPLE_AGENTS.map((agent) => ({
    id: `root-${agent.id}`,
    source: 'root',
    target: agent.id,
  }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Graph data — node count', () => {
  const nodes = buildNodes();

  it('has exactly 7 nodes (1 root + 6 agents)', () => {
    expect(nodes).toHaveLength(7);
  });

  it('has exactly 1 root node', () => {
    const roots = nodes.filter((n) => n.type === 'root');
    expect(roots).toHaveLength(1);
    expect(roots[0].id).toBe('root');
  });

  it('has exactly 6 agent nodes', () => {
    const agents = nodes.filter((n) => n.type === 'agent');
    expect(agents).toHaveLength(6);
  });
});

describe('Graph data — agent data fields', () => {
  const agentNodes = buildNodes().filter((n) => n.type === 'agent');

  it.each(agentNodes)('agent "$id" has name, role, status, and model', (node) => {
    const d = node.data as { name: string; role: string; status: string; model: string };
    expect(d.name).toBeTruthy();
    expect(d.role).toBeTruthy();
    expect(d.status).toBeTruthy();
    expect(d.model).toBeTruthy();
  });
});

describe('Graph data — edges connect root to each agent', () => {
  const edges = buildEdges();

  it('has 6 edges (one per agent)', () => {
    expect(edges).toHaveLength(6);
  });

  it('every edge originates from root', () => {
    for (const edge of edges) {
      expect(edge.source).toBe('root');
    }
  });

  it('every agent is targeted by an edge', () => {
    const targets = new Set(edges.map((e) => e.target));
    for (const agent of SAMPLE_AGENTS) {
      expect(targets.has(agent.id)).toBe(true);
    }
  });
});

describe('Graph data — node ID uniqueness', () => {
  const nodes = buildNodes();

  it('all node IDs are unique', () => {
    const ids = nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Graph data — valid AgentStatus values', () => {
  it.each(SAMPLE_AGENTS)('agent "$name" has a valid status', (agent) => {
    expect(VALID_STATUSES).toContain(agent.status);
  });
});

describe('Graph data — dagre layout produces valid positions', () => {
  // Import dagre to run the actual layout (same as App.tsx)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dagre = require('dagre');

  function applyDagreLayout(
    nodes: ReturnType<typeof buildNodes>,
    edges: ReturnType<typeof buildEdges>,
  ) {
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

  const nodes = buildNodes();
  const edges = buildEdges();
  const laidOut = applyDagreLayout(nodes, edges);

  it('all nodes have numeric x positions (not NaN)', () => {
    for (const node of laidOut) {
      expect(typeof node.position.x).toBe('number');
      expect(Number.isNaN(node.position.x)).toBe(false);
    }
  });

  it('all nodes have numeric y positions (not NaN)', () => {
    for (const node of laidOut) {
      expect(typeof node.position.y).toBe('number');
      expect(Number.isNaN(node.position.y)).toBe(false);
    }
  });

  it('root node is above all agent nodes (lower y value)', () => {
    const root = laidOut.find((n) => n.id === 'root')!;
    const agents = laidOut.filter((n) => n.type === 'agent');
    for (const agent of agents) {
      expect(root.position.y).toBeLessThan(agent.position.y);
    }
  });
});
