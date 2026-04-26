// ---------------------------------------------------------------------------
// Watchtower — Webview Bridge
// Runs inside the webview (DOM context). NO vscode module imports.
// Provides Promise-based request/response and push notification handlers.
// ---------------------------------------------------------------------------

import type {
  ExtensionToWebviewMessage,
  WebviewToExtensionMessage,
  WebviewCommand,
} from '../../types/messages.js';

// ---------------------------------------------------------------------------
// VS Code API acquisition (called once, cached)
// ---------------------------------------------------------------------------

interface VsCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

// Declared globally by VS Code's webview runtime
declare function acquireVsCodeApi(): VsCodeApi;

let _vscodeApi: VsCodeApi | undefined;

function getVsCodeApi(): VsCodeApi {
  if (!_vscodeApi) {
    _vscodeApi = acquireVsCodeApi();
  }
  return _vscodeApi;
}

// ---------------------------------------------------------------------------
// Pending requests (for request/response correlation)
// ---------------------------------------------------------------------------

interface PendingRequest {
  resolve: (payload: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

const _pendingRequests = new Map<string, PendingRequest>();
const _pushHandlers = new Map<string, Set<(payload: unknown) => void>>();

const DEFAULT_TIMEOUT_MS = 5000;

// ---------------------------------------------------------------------------
// Message listener (installed once)
// ---------------------------------------------------------------------------

let _listenerInstalled = false;

function ensureListener(): void {
  if (_listenerInstalled) return;
  _listenerInstalled = true;

  window.addEventListener('message', (event: MessageEvent) => {
    const message = event.data as ExtensionToWebviewMessage;
    if (!message || typeof message.command !== 'string') return;

    // Check if this is a response to a pending request
    if ('requestId' in message && typeof (message as { requestId?: string }).requestId === 'string') {
      const requestId = (message as { requestId: string }).requestId;
      const pending = _pendingRequests.get(requestId);
      if (pending) {
        _pendingRequests.delete(requestId);
        clearTimeout(pending.timer);

        if ('error' in message && (message as { error?: string }).error) {
          pending.reject(new Error((message as { error: string }).error));
        } else {
          pending.resolve('payload' in message ? (message as { payload?: unknown }).payload : undefined);
        }
        return;
      }
    }

    // Otherwise treat as a push notification
    const handlers = _pushHandlers.get(message.command);
    if (handlers) {
      const payload = 'payload' in message ? (message as { payload?: unknown }).payload : undefined;
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[WatchtowerBridge] Push handler error for "${message.command}":`, err);
        }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Request ID generator
// ---------------------------------------------------------------------------

let _requestCounter = 0;

function generateRequestId(): string {
  _requestCounter += 1;
  return `req_${Date.now()}_${_requestCounter}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a fire-and-forget message to the extension host.
 */
export function postMessage(message: WebviewToExtensionMessage): void {
  ensureListener();
  getVsCodeApi().postMessage(message);
}

/**
 * Send a request to the extension host and await a typed response.
 * Rejects on timeout or if the extension returns an error.
 */
export function request<T = unknown>(
  command: WebviewCommand,
  payload?: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  ensureListener();
  const requestId = generateRequestId();

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      _pendingRequests.delete(requestId);
      reject(new Error(`Request "${command}" timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    _pendingRequests.set(requestId, {
      resolve: resolve as (payload: unknown) => void,
      reject,
      timer,
    });

    const message: WebviewToExtensionMessage = {
      command,
      requestId,
      ...(payload !== undefined ? { payload } : {}),
    } as WebviewToExtensionMessage;

    getVsCodeApi().postMessage(message);
  });
}

/**
 * Register a handler for push notifications from the extension host.
 * Returns an unsubscribe function.
 */
export function onPush<T = unknown>(
  command: string,
  handler: (payload: T) => void,
): () => void {
  ensureListener();

  let handlers = _pushHandlers.get(command);
  if (!handlers) {
    handlers = new Set();
    _pushHandlers.set(command, handlers);
  }

  const wrappedHandler = handler as (payload: unknown) => void;
  handlers.add(wrappedHandler);

  return () => {
    handlers!.delete(wrappedHandler);
    if (handlers!.size === 0) {
      _pushHandlers.delete(command);
    }
  };
}

/**
 * Get the cached VS Code API for state persistence.
 */
export function getState<T = unknown>(): T | undefined {
  return getVsCodeApi().getState() as T | undefined;
}

/**
 * Set webview state (survives hide/show, not restart).
 */
export function setState<T = unknown>(state: T): void {
  getVsCodeApi().setState(state);
}

/**
 * Cancel all pending requests (call when webview is about to be disposed).
 */
export function cancelAllPending(): void {
  for (const [id, pending] of _pendingRequests) {
    clearTimeout(pending.timer);
    pending.reject(new Error('Bridge disposed — all pending requests cancelled'));
  }
  _pendingRequests.clear();
}
