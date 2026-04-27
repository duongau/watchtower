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
    this.iconPath = new vscode.ThemeIcon('folder');
  }
}

class AgentItem extends vscode.TreeItem {
  readonly contextValue = 'agent';

  constructor(agent: ParsedAgent, squadPath: string) {
    super(agent.name, vscode.TreeItemCollapsibleState.None);
    this.description = agent.role;
    this.iconPath = new vscode.ThemeIcon(
      'circle-filled',
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
