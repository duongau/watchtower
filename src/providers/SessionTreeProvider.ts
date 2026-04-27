// ---------------------------------------------------------------------------
// Watchtower — Session Tree Provider
// Flat list of recent sessions, most recent first.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import type { Session } from '../types/index.js';
import { SessionService } from '../services/session-service.js';
import { GraphService } from '../services/graph-service.js';

const MAX_SESSIONS = 20;

// ---------------------------------------------------------------------------
// Tree item
// ---------------------------------------------------------------------------

class SessionItem extends vscode.TreeItem {
  readonly contextValue = 'session';

  constructor(session: Session) {
    super(`${session.agent} — ${session.title}`, vscode.TreeItemCollapsibleState.None);
    this.description = relativeTime(session.timestamp);
    this.iconPath = new vscode.ThemeIcon('clock');
    this.tooltip = new vscode.MarkdownString(
      `**${session.agent}** — ${session.title}\n\n${session.timestamp || 'unknown time'}`,
    );

    // Click opens the session log file
    this.command = {
      command: 'vscode.open',
      title: 'Open Session Log',
      arguments: [vscode.Uri.file(session.path)],
    };
  }
}

function relativeTime(timestamp: string): string {
  if (!timestamp) { return ''; }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) { return timestamp; }

  const now = Date.now();
  const diff = now - date.getTime();

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) { return 'just now'; }
  if (minutes < 60) { return `${minutes}m ago`; }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) { return `${hours}h ago`; }

  const days = Math.floor(hours / 24);
  if (days === 1) { return 'yesterday'; }
  if (days < 7) { return `${days}d ago`; }

  return date.toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export class SessionTreeProvider implements vscode.TreeDataProvider<SessionItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SessionItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private readonly sessionService: SessionService,
    private readonly graphService: GraphService,
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SessionItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<SessionItem[]> {
    const squads = await this.graphService.getSquads();
    const squadPaths = squads.map((s) => s.path);
    const sessions = await this.sessionService.listSessions(squadPaths);

    return sessions
      .slice(0, MAX_SESSIONS)
      .map((s) => new SessionItem(s));
  }
}
