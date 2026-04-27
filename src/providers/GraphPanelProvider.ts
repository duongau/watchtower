// ---------------------------------------------------------------------------
// Watchtower — Graph Panel Provider
// Singleton WebviewPanel host for the agent graph React app.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import { MessageBridge } from '../services/MessageBridge.js';
import { getWebviewContent } from './getWebviewContent.js';
import { loadSquadFromPath } from '../services/squad-parser.js';
import { buildGraph } from '../services/graph-builder.js';
import { discoverSquads } from '../services/squad-discovery.js';
import type { Agent, Squad } from '../types/index.js';
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

    this.bridge.onRequest('agent:list', async () => {
      const squads = await this.loadSquads();
      const agents: Agent[] = squads.flatMap((s) =>
        s.agents.map((a) => ({ ...a, id: `${s.name}-${a.name}`.toLowerCase(), squadPath: s.path })),
      );
      return { agents };
    });

    this.bridge.onRequest('squad:list', async () => {
      const parsed = await this.loadSquads();
      const squads: Squad[] = parsed.map((p) => ({
        name: p.name,
        path: p.path,
        universe: p.universe,
        agents: p.agents.map((a) => ({
          id: `${p.name}-${a.name}`.toLowerCase(),
          name: a.name,
          role: a.role,
          status: a.status,
          model: a.model,
          squadPath: p.path,
        })),
      }));
      return { squads };
    });

    this.bridge.onRequest('graph:load', async () => {
      try {
        const squads = await this.loadSquads();
        if (squads.length === 0) {
          this.outputChannel.appendLine('[GraphPanel] No squads found — sending empty graph');
          return { nodes: [], edges: [] };
        }
        const { nodes, edges } = buildGraph(squads);
        this.outputChannel.appendLine(
          `[GraphPanel] Graph built: ${nodes.length} nodes, ${edges.length} edges from ${squads.length} squad(s)`,
        );
        return { nodes, edges };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.outputChannel.appendLine(`[GraphPanel] Error building graph: ${msg}`);
        return { nodes: [], edges: [] };
      }
    });
  }

  private async loadSquads() {
    const paths = await discoverSquads();
    const squads = await Promise.all(paths.map((p) => loadSquadFromPath(p)));
    return squads;
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
      const squads = await this.loadSquads();
      const { nodes, edges } = buildGraph(squads);
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
