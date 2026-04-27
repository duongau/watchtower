// ---------------------------------------------------------------------------
// Watchtower — Graph Panel Provider
// Singleton WebviewPanel host for the agent graph React app.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import { MessageBridge } from '../services/MessageBridge.js';
import { getWebviewContent } from './getWebviewContent.js';
import { GraphService } from '../services/graph-service.js';
import { SessionService } from '../services/session-service.js';
import type { ExtensionToWebviewMessage } from '../types/messages.js';

export class GraphPanelProvider implements vscode.Disposable {
  public static readonly viewType = 'watchtower.graph';

  private static instance: GraphPanelProvider | undefined;
  private panel: vscode.WebviewPanel | undefined;
  private bridge: MessageBridge | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  // -----------------------------------------------------------------------
  // Singleton access
  // -----------------------------------------------------------------------

  /** Get the existing instance (if any) without creating a new panel */
  public static getInstance(): GraphPanelProvider | undefined {
    return GraphPanelProvider.instance;
  }

  public static createOrShow(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel,
    graphService: GraphService,
    sessionService: SessionService,
  ): GraphPanelProvider {
    if (GraphPanelProvider.instance?.panel) {
      GraphPanelProvider.instance.panel.reveal(vscode.ViewColumn.One);
      return GraphPanelProvider.instance;
    }

    const provider = GraphPanelProvider.instance ?? new GraphPanelProvider(context, outputChannel, graphService, sessionService);
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
    private readonly graphService: GraphService,
    private readonly sessionService: SessionService,
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

    this.bridge.onRequest('agent:list', async () => {
      const agents = await this.graphService.getAgents();
      return { agents };
    });

    this.bridge.onRequest('squad:list', async () => {
      const squads = await this.graphService.getSquadList();
      return { squads };
    });

    this.bridge.onRequest('graph:load', async () => {
      try {
        const { nodes, edges } = await this.graphService.loadGraph();
        return { nodes, edges };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.outputChannel.appendLine(`[GraphPanel] Error building graph: ${msg}`);
        return { nodes: [], edges: [] };
      }
    });

    this.bridge.onRequest('session:list', async () => {
      try {
        const squads = await this.graphService.getSquads();
        const squadPaths = squads.map((s) => s.path);
        const sessions = await this.sessionService.listSessions(squadPaths);
        return { sessions };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.outputChannel.appendLine(`[GraphPanel] Error listing sessions: ${msg}`);
        return { sessions: [] };
      }
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
  // Refresh — re-read squad data and push to webview
  // -----------------------------------------------------------------------

  public async refresh(): Promise<void> {
    if (!this.panel || !this.bridge) {
      return;
    }

    try {
      const { nodes, edges } = await this.graphService.loadGraph();
      this.bridge.push({
        command: 'graph:update',
        payload: { nodes, edges },
      } as ExtensionToWebviewMessage);
      this.outputChannel.appendLine(
        `[GraphPanel] Graph updated: ${nodes.length} nodes, ${edges.length} edges`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.outputChannel.appendLine(`[GraphPanel] Error refreshing graph: ${msg}`);
    }
  }

  // -----------------------------------------------------------------------
  // Disposable
  // -----------------------------------------------------------------------

  public dispose(): void {
    this.panel?.dispose();
  }
}
