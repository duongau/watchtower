// ---------------------------------------------------------------------------
// Watchtower — Graph Builder
// Converts ParsedSquad data into @xyflow/react Node[] and Edge[] format
// with dagre-computed layout positions.
// ---------------------------------------------------------------------------

import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { AgentStatus, ParsedSquad } from '../types/index.js';

// ---------------------------------------------------------------------------
// Node sizes — must match the CSS dimensions of custom node components
// ---------------------------------------------------------------------------

const ROOT_WIDTH = 220;
const ROOT_HEIGHT = 70;
const AGENT_WIDTH = 200;
const AGENT_HEIGHT = 100;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    const width = node.type === 'root' ? ROOT_WIDTH : AGENT_WIDTH;
    const height = node.type === 'root' ? ROOT_HEIGHT : AGENT_HEIGHT;
    g.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const width = node.type === 'root' ? ROOT_WIDTH : AGENT_WIDTH;
    const height = node.type === 'root' ? ROOT_HEIGHT : AGENT_HEIGHT;
    return {
      ...node,
      position: { x: pos.x - width / 2, y: pos.y - height / 2 },
    };
  });
}

// ---------------------------------------------------------------------------
// Graph builder
// ---------------------------------------------------------------------------

/**
 * Convert an array of parsed squads into @xyflow/react nodes and edges.
 *
 * For each squad:
 *  1. Create a root node (type: 'root')
 *  2. Create agent nodes (type: 'agent')
 *  3. Create edges root → agent
 *  4. Apply dagre TB layout
 *
 * Multiple squads are laid out side by side with an offset.
 */
export function buildGraph(squads: ParsedSquad[]): { nodes: Node[]; edges: Edge[] } {
  if (squads.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Single squad — simple root + agents
  if (squads.length === 1) {
    return buildSingleSquadGraph(squads[0]);
  }

  // Multiple squads — lay out side by side
  const allNodes: Node[] = [];
  const allEdges: Edge[] = [];
  let xOffset = 0;

  for (const squad of squads) {
    const { nodes, edges } = buildSingleSquadGraph(squad);

    // Offset all positions for this squad
    for (const node of nodes) {
      node.position.x += xOffset;
    }

    allNodes.push(...nodes);
    allEdges.push(...edges);

    // Advance xOffset past this squad's rightmost edge + gap
    const maxX = Math.max(...nodes.map((n) => n.position.x + (n.type === 'root' ? ROOT_WIDTH : AGENT_WIDTH)));
    xOffset = maxX + 120; // gap between squads
  }

  return { nodes: allNodes, edges: allEdges };
}

function buildSingleSquadGraph(squad: ParsedSquad): { nodes: Node[]; edges: Edge[] } {
  const squadId = sanitizeId(squad.name);

  // Root node
  const rootNode: Node = {
    id: `root-${squadId}`,
    type: 'root',
    position: { x: 0, y: 0 },
    style: { width: ROOT_WIDTH },
    data: {
      label: squad.name,
      agentCount: squad.agents.length,
      universe: squad.universe,
    },
  };

  // Agent nodes
  const agentNodes: Node[] = squad.agents.map((agent) => ({
    id: `agent-${squadId}-${sanitizeId(agent.name)}`,
    type: 'agent',
    position: { x: 0, y: 0 },
    style: { width: AGENT_WIDTH },
    data: {
      name: agent.name,
      role: agent.role,
      status: agent.status as AgentStatus,
      model: agent.model ?? '',
    },
  }));

  // Edges: root → each agent
  const edges: Edge[] = agentNodes.map((agentNode) => ({
    id: `edge-${rootNode.id}-${agentNode.id}`,
    source: rootNode.id,
    target: agentNode.id,
  }));

  const allNodes = [rootNode, ...agentNodes];
  const laidOut = applyDagreLayout(allNodes, edges);

  return { nodes: laidOut, edges };
}

/** Sanitize a string for use as a node ID (lowercase, no spaces/special chars) */
function sanitizeId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
