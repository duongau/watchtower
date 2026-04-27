// ---------------------------------------------------------------------------
// Watchtower — Agent Tree Provider
// Squad-centric hierarchy: squads as top-level nodes, agents nested underneath.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import type { ParsedSquad, ParsedAgent, AgentStatus } from '../types/index.js';
import { GraphService } from '../services/graph-service.js';

// ---------------------------------------------------------------------------
// Tree item types
// ---------------------------------------------------------------------------

type AgentTreeItem = SquadItem | AgentItem;

class SquadItem extends vscode.TreeItem {
  readonly contextValue = 'squad';
  readonly agents: ParsedAgent[];
  readonly squadPath: string;

  constructor(squad: ParsedSquad) {
    super(squad.name, vscode.TreeItemCollapsibleState.Expanded);
    this.agents = squad.agents;
    this.squadPath = squad.path;
    this.description = `${squad.agents.length} agent${squad.agents.length === 1 ? '' : 's'}`;
    this.tooltip = new vscode.MarkdownString(
      `**${squad.name}**\n\nUniverse: ${squad.universe ?? 'unknown'}\n\nAgents: ${squad.agents.length}\n\nPath: ${squad.path}`,
    );
    this.iconPath = new vscode.ThemeIcon('folder-library');
  }
}

class AgentItem extends vscode.TreeItem {
  readonly contextValue = 'agent';

  constructor(agent: ParsedAgent, squadPath: string) {
    super(agent.name, vscode.TreeItemCollapsibleState.None);
    this.description = agent.role;
    this.iconPath = new vscode.ThemeIcon(
      roleIcon(agent.role),
      new vscode.ThemeColor(statusColor(agent.status)),
    );
    this.tooltip = new vscode.MarkdownString(
      `**${agent.name}** — ${agent.role}\n\nModel: ${agent.model ?? 'default'}\n\nStatus: ${agent.status}`,
    );

    // Click opens charter.md
    if (agent.charterPath) {
      this.command = {
        command: 'watchtower.openCharter',
        title: 'Open Charter',
        arguments: [agent.charterPath],
      };
    }
  }
}

function statusColor(status: AgentStatus): string {
  switch (status) {
    case 'active':
      return 'testing.iconPassed';
    case 'idle':
      return 'editorWarning.foreground';
    case 'error':
      return 'errorForeground';
    case 'offline':
    default:
      return 'descriptionForeground';
  }
}

function roleIcon(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('lead') || r.includes('architect')) return 'crown';
  if (r.includes('frontend') || r.includes('ui') || r.includes('react')) return 'layout';
  if (r.includes('extension') || r.includes('api') || r.includes('backend')) return 'plug';
  if (r.includes('data') || r.includes('storage') || r.includes('database')) return 'database';
  if (r.includes('test') || r.includes('qa') || r.includes('quality')) return 'shield';
  if (r.includes('ux') || r.includes('design')) return 'symbol-color';
  if (r.includes('devops') || r.includes('release')) return 'rocket';
  if (r.includes('doc') || r.includes('writer')) return 'book';
  if (r.includes('session') || r.includes('scribe') || r.includes('memory')) return 'notebook';
  if (r.includes('monitor') || r.includes('ralph') || r.includes('work')) return 'radio-tower';
  if (r.includes('owner') || r.includes('human')) return 'person';
  return 'person';
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export class AgentTreeProvider implements vscode.TreeDataProvider<AgentTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AgentTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private squads: ParsedSquad[] = [];

  constructor(private readonly graphService: GraphService) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: AgentTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: AgentTreeItem): Promise<AgentTreeItem[]> {
    if (!element) {
      // Root level — squad folders
      this.squads = await this.graphService.getSquads();
      return this.squads.map((s) => new SquadItem(s));
    }

    if (element instanceof SquadItem) {
      return element.agents.map((a) => new AgentItem(a, element.squadPath));
    }

    return [];
  }
}
