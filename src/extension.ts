import * as vscode from 'vscode';
import { GraphPanelProvider } from './providers/GraphPanelProvider.js';
import { AgentTreeProvider } from './providers/AgentTreeProvider.js';
import { SessionTreeProvider } from './providers/SessionTreeProvider.js';
import { SkillsTreeProvider } from './providers/SkillsTreeProvider.js';
import { StatusBarProvider } from './providers/StatusBarProvider.js';
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

  // Tree view providers
  const agentTreeProvider = new AgentTreeProvider(graphService);
  const sessionTreeProvider = new SessionTreeProvider(sessionService, graphService);
  const skillsTreeProvider = new SkillsTreeProvider(graphService);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('watchtower.agents', agentTreeProvider),
  );
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('watchtower.sessions', sessionTreeProvider),
  );
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('watchtower.skills', skillsTreeProvider),
  );

  // Status bar
  const statusBarProvider = new StatusBarProvider();
  context.subscriptions.push(statusBarProvider);

  // Initial status bar update
  graphService.getSquads().then((squads) => statusBarProvider.update(squads));

  // File system watchers for .squad/ directories
  const squadWatcher = new SquadWatcher(outputChannel);
  squadWatcher.start();
  context.subscriptions.push(squadWatcher);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.openGraph', () => {
      GraphPanelProvider.createOrShow(context, outputChannel, graphService, sessionService);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.openMissionControl', () => {
      vscode.window.showInformationMessage('Watchtower: Mission Control coming soon');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.refreshAgents', () => {
      agentTreeProvider.refresh();
      sessionTreeProvider.refresh();
      graphService.getSquads().then((squads) => statusBarProvider.update(squads));
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.openCharter', (charterPath: string) => {
      const uri = vscode.Uri.file(charterPath);
      vscode.window.showTextDocument(uri);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.refreshAll', () => {
      agentTreeProvider.refresh();
      sessionTreeProvider.refresh();
      skillsTreeProvider.refresh();
      graphService.getSquads().then((squads) => statusBarProvider.update(squads));
      const panel = GraphPanelProvider.getInstance();
      if (panel) {
        panel.refresh();
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.scanSquads', () => {
      graphService.getSquads().then((squads) => {
        agentTreeProvider.refresh();
        sessionTreeProvider.refresh();
        skillsTreeProvider.refresh();
        statusBarProvider.update(squads);
        const panel = GraphPanelProvider.getInstance();
        if (panel) {
          panel.refresh();
        }
      });
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.openDecisions', async () => {
      const squads = await graphService.getSquads();
      if (squads.length === 0) {
        vscode.window.showWarningMessage('Watchtower: No squads discovered');
        return;
      }
      const decisionsPath = vscode.Uri.joinPath(
        vscode.Uri.file(squads[0].path),
        '.squad',
        'decisions.md',
      );
      vscode.window.showTextDocument(decisionsPath);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.focusAgents', () => {
      vscode.commands.executeCommand('watchtower.agents.focus');
    }),
  );

  // Wire watcher to refresh all providers when squad files change
  squadWatcher.onChange(() => {
    agentTreeProvider.refresh();
    sessionTreeProvider.refresh();
    skillsTreeProvider.refresh();
    graphService.getSquads().then((squads) => statusBarProvider.update(squads));
    const panel = GraphPanelProvider.getInstance();
    if (panel) {
      panel.refresh();
    }
  });

  outputChannel.appendLine('Watchtower activated — 8 commands registered');
}

export function deactivate() {
  outputChannel?.appendLine('Watchtower deactivated');
}
