// ---------------------------------------------------------------------------
// Watchtower — Extension Host Message Bridge
// Routes webview messages to registered handlers, sends typed responses/pushes.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import type {
  WebviewToExtensionMessage,
  ExtensionToWebviewMessage,
  RequestHandler,
  WebviewCommand,
} from '../types/messages.js';

export class MessageBridge implements vscode.Disposable {
  private readonly _handlers = new Map<string, RequestHandler>();
  private readonly _disposables: vscode.Disposable[] = [];
  private _isDisposed = false;

  constructor(
    private readonly _webview: vscode.Webview,
    private readonly _output: vscode.OutputChannel,
  ) {
    // Listen for messages from webview
    this._disposables.push(
      _webview.onDidReceiveMessage(
        (msg: WebviewToExtensionMessage) => this._handleMessage(msg),
      ),
    );
    this._output.appendLine('[MessageBridge] Initialized');
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Register a typed handler for a specific request command */
  onRequest<TReq = unknown, TRes = unknown>(
    command: WebviewCommand,
    handler: RequestHandler<TReq, TRes>,
  ): void {
    if (this._handlers.has(command)) {
      this._output.appendLine(`[MessageBridge] Warning: overwriting handler for "${command}"`);
    }
    this._handlers.set(command, handler as RequestHandler);
    this._output.appendLine(`[MessageBridge] Handler registered: ${command}`);
  }

  /** Send a message (response or push) to the webview */
  send(message: ExtensionToWebviewMessage): void {
    if (this._isDisposed) {
      this._output.appendLine('[MessageBridge] Cannot send — bridge disposed');
      return;
    }
    this._logMessage('→ webview', message);
    this._webview.postMessage(message);
  }

  /** Send an error response for a specific request */
  sendError(command: string, requestId: string, error: string): void {
    this.send({ command, requestId, error } as ExtensionToWebviewMessage);
  }

  /** Send a push notification (no requestId) */
  push(message: ExtensionToWebviewMessage): void {
    this.send(message);
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private async _handleMessage(message: WebviewToExtensionMessage): Promise<void> {
    this._logMessage('← webview', message);

    const { command } = message;
    const requestId = 'requestId' in message ? (message as { requestId: string }).requestId : undefined;

    const handler = this._handlers.get(command);
    if (!handler) {
      this._output.appendLine(`[MessageBridge] No handler for command: ${command}`);
      if (requestId) {
        this.sendError(command, requestId, `Unknown command: ${command}`);
      }
      return;
    }

    try {
      const payload = 'payload' in message ? (message as { payload?: unknown }).payload : undefined;
      const result = await handler(payload, requestId ?? '');
      if (requestId) {
        this.send({ command, requestId, payload: result } as ExtensionToWebviewMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._output.appendLine(`[MessageBridge] Error handling "${command}": ${errorMessage}`);
      if (requestId) {
        this.sendError(command, requestId, errorMessage);
      }
    }
  }

  private _logMessage(direction: string, message: { command: string }): void {
    const requestId = 'requestId' in message ? ` [${(message as { requestId?: string }).requestId}]` : '';
    this._output.appendLine(`[MessageBridge] ${direction} ${message.command}${requestId}`);
  }

  // -----------------------------------------------------------------------
  // Disposal
  // -----------------------------------------------------------------------

  dispose(): void {
    this._isDisposed = true;
    this._handlers.clear();
    for (const d of this._disposables) {
      d.dispose();
    }
    this._disposables.length = 0;
    this._output.appendLine('[MessageBridge] Disposed');
  }
}
