import * as vscode from 'vscode';
import { MessageBridge } from './services/MessageBridge.js';

let outputChannel: vscode.OutputChannel;

/**
 * Create a MessageBridge for a webview panel.
 * Called by WebviewPanelProvider (sub-plan 3) — not wired yet.
 */
export function createMessageBridge(
  webview: vscode.Webview,
  output: vscode.OutputChannel,
): MessageBridge {
  return new MessageBridge(webview, output);
}

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Watchtower');
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine('Watchtower activating...');

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('watchtower.openGraph', () => {
      vscode.window.showInformationMessage('Watchtower: Agent Graph coming soon');
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

  outputChannel.appendLine('Watchtower activated — 3 commands registered');
}

export function deactivate() {
  outputChannel?.appendLine('Watchtower deactivated');
}
