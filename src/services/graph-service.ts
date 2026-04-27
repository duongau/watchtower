// ---------------------------------------------------------------------------
// Watchtower — Graph Service
// Consolidates squad discovery → parsing → graph building into a single
// service that extension host consumers (providers, commands) delegate to.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import type { Node, Edge } from '@xyflow/react';
import type { Agent, ParsedSquad, Squad } from '../types/index.js';
import { discoverSquads } from './squad-discovery.js';
import { loadSquadFromPath } from './squad-parser.js';
import { buildGraph } from './graph-builder.js';

export class GraphService implements vscode.Disposable {
  constructor(
    private readonly outputChannel: vscode.OutputChannel,
  ) {}

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Load the full graph (nodes + edges) from all discovered squads. */
  async loadGraph(): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const squads = await this.getSquads();
    if (squads.length === 0) {
      this.outputChannel.appendLine('[GraphService] No squads found — returning empty graph');
      return { nodes: [], edges: [] };
    }
    const { nodes, edges } = buildGraph(squads);
    this.outputChannel.appendLine(
      `[GraphService] Graph built: ${nodes.length} nodes, ${edges.length} edges from ${squads.length} squad(s)`,
    );
    return { nodes, edges };
  }

  /** Load graph from a specific squad path. */
  async loadSquadGraph(squadPath: string): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const squad = await loadSquadFromPath(squadPath);
    const { nodes, edges } = buildGraph([squad]);
    this.outputChannel.appendLine(
      `[GraphService] Squad graph built for "${squad.name}": ${nodes.length} nodes, ${edges.length} edges`,
    );
    return { nodes, edges };
  }

  /** Get all discovered squads (parsed). */
  async getSquads(): Promise<ParsedSquad[]> {
    const paths = await discoverSquads();
    const squads = await Promise.all(paths.map((p) => loadSquadFromPath(p)));
    return squads;
  }

  /** Get all agents across all squads, each with a generated id and squadPath. */
  async getAgents(): Promise<Agent[]> {
    const squads = await this.getSquads();
    return squads.flatMap((s) =>
      s.agents.map((a) => ({
        id: `${s.name}-${a.name}`.toLowerCase(),
        name: a.name,
        role: a.role,
        status: a.status,
        model: a.model,
        squadPath: s.path,
      })),
    );
  }

  /** Convert ParsedSquad[] to Squad[] (typed for message protocol). */
  async getSquadList(): Promise<Squad[]> {
    const parsed = await this.getSquads();
    return parsed.map((p) => ({
      name: p.name,
      path: p.path,
      universe: p.universe,
      agents: p.agents.map((a) => ({
        id: `${p.name}-${a.name}`.toLowerCase(),
        name: a.name,
        role: a.role,
        status: a.status,
        model: a.model,
        squadPath: p.path,
      })),
    }));
  }

  // -----------------------------------------------------------------------
  // Disposable
  // -----------------------------------------------------------------------

  dispose(): void {
    // No resources to release — stateless orchestration service
  }
}
