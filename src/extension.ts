import * as vscode from 'vscode';
import { GraphPanelProvider } from './providers/GraphPanelProvider.js';
import { SquadWatcher } from './services/squad-watcher.js';
import { ServiceRegistry } from './services/service-registry.js';
import { GraphService } from './services/graph-service.js';
import { SessionService } from './services/session-service.js';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Watchtower');
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine('Watchtower activating...');

  // Service registry — disposes all services on deactivation
  const registry = new ServiceRegistry();
  context.subscriptions.push(registry);

  const graphService = registry.register('graph', new GraphService(outputChannel));
  const sessionService = registry.register('session', new SessionService(outputChannel));

  // File system watchers for .squad/ directories
  const squadWatcher = new SquadWatcher(outputChannel);
  squadWatcher.start();
  context.subscriptions.push(squadWatcher);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.openGraph', () => {
      GraphPanelProvider.createOrShow(context, outputChannel, graphService, sessionService);
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
