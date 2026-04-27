// ---------------------------------------------------------------------------
// Watchtower — Status Bar Provider
// Shows squad count and active agent count in the VS Code status bar.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import type { ParsedSquad } from '../types/index.js';

export class StatusBarProvider implements vscode.Disposable {
  private readonly squadItem: vscode.StatusBarItem;
  private readonly agentItem: vscode.StatusBarItem;

  constructor() {
    this.squadItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.agentItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  }

  update(squads: ParsedSquad[]): void {
    const totalAgents = squads.reduce((sum, s) => sum + s.agents.length, 0);
    const activeAgents = squads.reduce(
      (sum, s) => sum + s.agents.filter((a) => a.status === 'active').length,
      0,
    );

    this.squadItem.text = `$(telescope) ${squads.length} squad${squads.length === 1 ? '' : 's'}`;
    this.squadItem.tooltip = `${squads.length} squad${squads.length === 1 ? '' : 's'} discovered`;
    this.squadItem.command = 'watchtower.openGraph';
    this.squadItem.show();

    this.agentItem.text = `$(person) ${activeAgents} active`;
    this.agentItem.tooltip = `${totalAgents} agents total across ${squads.length} squad${squads.length === 1 ? '' : 's'}`;
    this.agentItem.show();
  }

  dispose(): void {
    this.squadItem.dispose();
    this.agentItem.dispose();
  }
}
