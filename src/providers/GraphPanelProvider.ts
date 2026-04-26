// ---------------------------------------------------------------------------
// Watchtower — Graph Panel Provider
// Singleton WebviewPanel host for the agent graph React app.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import { MessageBridge } from '../services/MessageBridge.js';
import { getWebviewContent } from './getWebviewContent.js';

export class GraphPanelProvider implements vscode.Disposable {
  public static readonly viewType = 'watchtower.graph';

  private static instance: GraphPanelProvider | undefined;
  private panel: vscode.WebviewPanel | undefined;
  private bridge: MessageBridge | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  // -----------------------------------------------------------------------
  // Singleton access
  // -----------------------------------------------------------------------

  public static createOrShow(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel,
  ): GraphPanelProvider {
    if (GraphPanelProvider.instance?.panel) {
      GraphPanelProvider.instance.panel.reveal(vscode.ViewColumn.One);
      return GraphPanelProvider.instance;
    }

    const provider = GraphPanelProvider.instance ?? new GraphPanelProvider(context, outputChannel);
    GraphPanelProvider.instance = provider;
    provider.createPanel();
    return provider;
  }

  // -----------------------------------------------------------------------
  // Constructor (private — use createOrShow)
  // -----------------------------------------------------------------------

  private constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly outputChannel: vscode.OutputChannel,
  ) {}

  // -----------------------------------------------------------------------
  // Panel lifecycle
  // -----------------------------------------------------------------------

  private createPanel(): void {
    this.panel = vscode.window.createWebviewPanel(
      GraphPanelProvider.viewType,
      'Agent Graph',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview'),
          vscode.Uri.joinPath(this.context.extensionUri, 'resources'),
        ],
      },
    );

    this.panel.webview.html = getWebviewContent(
      this.panel.webview,
      this.context.extensionUri,
    );

    // Wire up MessageBridge
    this.bridge = new MessageBridge(this.panel.webview, this.outputChannel);
    this.registerHandlers();

    // Track visibility changes
    this.panel.onDidChangeViewState(
      (e) => {
        this.outputChannel.appendLine(
          `[GraphPanel] Visibility changed: ${e.webviewPanel.visible ? 'visible' : 'hidden'}`,
        );
      },
      null,
      this.disposables,
    );

    // Clean up on close
    this.panel.onDidDispose(
      () => this.onPanelDisposed(),
      null,
      this.disposables,
    );

    this.outputChannel.appendLine('[GraphPanel] Panel created');
  }

  private registerHandlers(): void {
    if (!this.bridge) { return; }

    this.bridge.onRequest('ready', () => {
      this.outputChannel.appendLine('[GraphPanel] Webview ready');
      return undefined;
    });

    this.bridge.onRequest('agent:list', () => {
      return { agents: [] };
    });

    this.bridge.onRequest('squad:list', () => {
      return { squads: [] };
    });
  }

  private onPanelDisposed(): void {
    this.outputChannel.appendLine('[GraphPanel] Panel disposed');
    this.bridge?.dispose();
    this.bridge = undefined;
    this.panel = undefined;
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables.length = 0;
    GraphPanelProvider.instance = undefined;
  }

  // -----------------------------------------------------------------------
  // Disposable
  // -----------------------------------------------------------------------

  public dispose(): void {
    this.panel?.dispose();
  }
}
