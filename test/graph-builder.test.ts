import { describe, it, expect } from 'vitest';
import { buildGraph } from '../src/services/graph-builder';
import type { ParsedSquad } from '../src/types/index';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

function makeSquad(overrides: Partial<ParsedSquad> = {}): ParsedSquad {
  return {
    name: 'Watchtower',
    path: '/projects/watchtower',
    universe: 'naruto-hokages',
    agents: [
      { name: 'Minato', role: 'Lead / Architect', status: 'active' },
      { name: 'Tsunade', role: 'Data Engineer', status: 'idle', model: 'gpt-5.3' },
      { name: 'Kakashi', role: 'Tester', status: 'offline' },
    ],
    decisions: [],
    skills: ['pipeline-01-plan', 'pipeline-02-build'],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildGraph', () => {
  it('returns empty graph for empty squads array', () => {
    const { nodes, edges } = buildGraph([]);
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });

  it('creates a root node + agent nodes for a single squad', () => {
    const { nodes, edges } = buildGraph([makeSquad()]);

    // 1 root + 3 agents = 4 nodes
    expect(nodes).toHaveLength(4);

    const rootNodes = nodes.filter((n) => n.type === 'root');
    expect(rootNodes).toHaveLength(1);
    expect(rootNodes[0].data.label).toBe('Watchtower');
    expect(rootNodes[0].data.agentCount).toBe(3);

    const agentNodes = nodes.filter((n) => n.type === 'agent');
    expect(agentNodes).toHaveLength(3);

    // 3 edges (root → each agent)
    expect(edges).toHaveLength(3);
  });

  it('includes agent data in node data fields', () => {
    const { nodes } = buildGraph([makeSquad()]);
    const tsunade = nodes.find((n) => n.data.name === 'Tsunade');
    expect(tsunade).toBeDefined();
    expect(tsunade!.data.role).toBe('Data Engineer');
    expect(tsunade!.data.status).toBe('idle');
    expect(tsunade!.data.model).toBe('gpt-5.3');
  });

  it('generates unique IDs for nodes and edges', () => {
    const { nodes, edges } = buildGraph([makeSquad()]);
    const nodeIds = nodes.map((n) => n.id);
    const edgeIds = edges.map((e) => e.id);

    // All IDs unique
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
    expect(new Set(edgeIds).size).toBe(edgeIds.length);
  });

  it('applies dagre layout — all nodes have valid positions', () => {
    const { nodes } = buildGraph([makeSquad()]);
    for (const node of nodes) {
      expect(typeof node.position.x).toBe('number');
      expect(typeof node.position.y).toBe('number');
      expect(Number.isFinite(node.position.x)).toBe(true);
      expect(Number.isFinite(node.position.y)).toBe(true);
    }
  });

  it('root node is above agent nodes (TB layout)', () => {
    const { nodes } = buildGraph([makeSquad()]);
    const root = nodes.find((n) => n.type === 'root')!;
    const agents = nodes.filter((n) => n.type === 'agent');

    for (const agent of agents) {
      expect(agent.position.y).toBeGreaterThan(root.position.y);
    }
  });

  it('handles squad with zero agents', () => {
    const { nodes, edges } = buildGraph([makeSquad({ agents: [] })]);
    expect(nodes).toHaveLength(1); // just root
    expect(edges).toHaveLength(0);
    expect(nodes[0].type).toBe('root');
  });

  it('handles multiple squads side by side', () => {
    const squad1 = makeSquad({ name: 'Alpha' });
    const squad2 = makeSquad({
      name: 'Beta',
      agents: [{ name: 'Agent-B', role: 'Builder', status: 'active' }],
    });

    const { nodes, edges } = buildGraph([squad1, squad2]);

    // Alpha: 1 root + 3 agents = 4. Beta: 1 root + 1 agent = 2. Total: 6
    expect(nodes).toHaveLength(6);
    // Alpha: 3 edges. Beta: 1 edge. Total: 4
    expect(edges).toHaveLength(4);

    // Root nodes for both squads
    const roots = nodes.filter((n) => n.type === 'root');
    expect(roots).toHaveLength(2);
    expect(roots.map((r) => r.data.label).sort()).toEqual(['Alpha', 'Beta']);
  });

  it('lays out 3+ squads without overlap (xOffset accumulates)', () => {
    const squad1 = makeSquad({ name: 'Alpha' });
    const squad2 = makeSquad({
      name: 'Beta',
      agents: [{ name: 'Agent-B', role: 'Builder', status: 'active' }],
    });
    const squad3 = makeSquad({
      name: 'Gamma',
      agents: [{ name: 'Agent-G', role: 'Tester', status: 'idle' }],
    });

    const { nodes } = buildGraph([squad1, squad2, squad3]);

    // Get rightmost x of each squad's nodes
    const alphaNodes = nodes.filter((n) => n.id.includes('alpha'));
    const betaNodes = nodes.filter((n) => n.id.includes('beta'));
    const gammaNodes = nodes.filter((n) => n.id.includes('gamma'));

    const alphaMaxX = Math.max(...alphaNodes.map((n) => n.position.x));
    const betaMinX = Math.min(...betaNodes.map((n) => n.position.x));
    const betaMaxX = Math.max(...betaNodes.map((n) => n.position.x));
    const gammaMinX = Math.min(...gammaNodes.map((n) => n.position.x));

    // Beta must start to the right of Alpha
    expect(betaMinX).toBeGreaterThan(alphaMaxX);
    // Gamma must start to the right of Beta (the bug made Gamma overlap Beta)
    expect(gammaMinX).toBeGreaterThan(betaMaxX);
  });

  it('edges connect root to its own agents only', () => {
    const { nodes, edges } = buildGraph([makeSquad()]);
    const root = nodes.find((n) => n.type === 'root')!;
    const agentIds = nodes.filter((n) => n.type === 'agent').map((n) => n.id);

    for (const edge of edges) {
      expect(edge.source).toBe(root.id);
      expect(agentIds).toContain(edge.target);
    }
  });

  it('sanitizes IDs to be lowercase with no special chars', () => {
    const squad = makeSquad({
      name: 'My Awesome Squad!',
      agents: [{ name: 'Agent Smith', role: 'Builder', status: 'active' }],
    });
    const { nodes } = buildGraph([squad]);
    for (const node of nodes) {
      expect(node.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
