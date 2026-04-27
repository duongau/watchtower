import * as vscode from 'vscode';
import { GraphPanelProvider } from './providers/GraphPanelProvider.js';
import { SquadWatcher } from './services/squad-watcher.js';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Watchtower');
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine('Watchtower activating...');

  // File system watchers for .squad/ directories
  const squadWatcher = new SquadWatcher(outputChannel);
  squadWatcher.start();
  context.subscriptions.push(squadWatcher);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.openGraph', () => {
      GraphPanelProvider.createOrShow(context, outputChannel);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.openMissionControl', () => {
      vscode.window.showInformationMessage('Watchtower: Mission Control coming soon');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.refreshAgents', () => {
      vscode.window.showInformationMessage('Watchtower: Refreshing agents...');
    })
  );

  // Wire watcher to refresh the graph panel when squad files change
  squadWatcher.onChange(() => {
    const provider = GraphPanelProvider.getInstance();
    if (provider) {
      provider.refresh();
    }
  });

  outputChannel.appendLine('Watchtower activated — 3 commands registered');
}

export function deactivate() {
  outputChannel?.appendLine('Watchtower deactivated');
}
