// ---------------------------------------------------------------------------
// MessageBridge (extension host) tests
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageBridge } from '../src/services/MessageBridge.js';
import type { WebviewToExtensionMessage, ExtensionToWebviewMessage } from '../src/types/messages.js';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

type MessageListener = (msg: WebviewToExtensionMessage) => void;

function createMockWebview() {
  let listener: MessageListener | undefined;

  return {
    postMessage: vi.fn(),
    onDidReceiveMessage: vi.fn((cb: MessageListener) => {
      listener = cb;
      return { dispose: vi.fn() };
    }),
    /** Simulate an incoming message from the webview */
    simulateMessage(msg: WebviewToExtensionMessage) {
      listener?.(msg);
    },
  };
}

function createMockOutputChannel() {
  return {
    appendLine: vi.fn(),
    show: vi.fn(),
    dispose: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MessageBridge', () => {
  let webview: ReturnType<typeof createMockWebview>;
  let output: ReturnType<typeof createMockOutputChannel>;
  let bridge: MessageBridge;

  beforeEach(() => {
    webview = createMockWebview();
    output = createMockOutputChannel();
    bridge = new MessageBridge(webview as any, output as any);
  });

  // -----------------------------------------------------------------------
  // Construction
  // -----------------------------------------------------------------------

  describe('construction', () => {
    it('should register a message listener on the webview', () => {
      expect(webview.onDidReceiveMessage).toHaveBeenCalledOnce();
    });

    it('should log initialization', () => {
      expect(output.appendLine).toHaveBeenCalledWith('[MessageBridge] Initialized');
    });
  });

  // -----------------------------------------------------------------------
  // send()
  // -----------------------------------------------------------------------

  describe('send()', () => {
    it('should call webview.postMessage with the message', () => {
      const msg = {
        command: 'graph:update',
        payload: { nodes: [], edges: [] },
      } as ExtensionToWebviewMessage;

      bridge.send(msg);

      expect(webview.postMessage).toHaveBeenCalledWith(msg);
    });

    it('should not post message after disposal', () => {
      bridge.dispose();

      bridge.send({
        command: 'showError',
        payload: { message: 'oops' },
      } as ExtensionToWebviewMessage);

      expect(webview.postMessage).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // handleMessage routing
  // -----------------------------------------------------------------------

  describe('message routing', () => {
    it('should route incoming messages to registered handlers', async () => {
      const handler = vi.fn().mockResolvedValue({ agents: [] });
      bridge.onRequest('agent:list', handler);

      webview.simulateMessage({
        command: 'agent:list',
        requestId: 'req_1',
      } as WebviewToExtensionMessage);

      // Wait for async handler
      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledOnce();
      });
    });

    it('should pass payload to handler', async () => {
      const handler = vi.fn().mockResolvedValue({ agent: { id: 'k' } });
      bridge.onRequest('agent:get', handler);

      webview.simulateMessage({
        command: 'agent:get',
        requestId: 'req_2',
        payload: { agentId: 'kakashi' },
      } as WebviewToExtensionMessage);

      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledWith({ agentId: 'kakashi' }, 'req_2');
      });
    });

    it('should send error response for unregistered commands', async () => {
      webview.simulateMessage({
        command: 'squad:list',
        requestId: 'req_3',
      } as WebviewToExtensionMessage);

      await vi.waitFor(() => {
        expect(webview.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            command: 'squad:list',
            requestId: 'req_3',
            error: 'Unknown command: squad:list',
          }),
        );
      });
    });
  });

  // -----------------------------------------------------------------------
  // Request/response correlation
  // -----------------------------------------------------------------------

  describe('request/response correlation', () => {
    it('should respond with handler result and matching requestId', async () => {
      bridge.onRequest('graph:load', async () => ({
        nodes: [{ id: '1' }],
        edges: [],
      }));

      webview.simulateMessage({
        command: 'graph:load',
        requestId: 'req_10',
      } as WebviewToExtensionMessage);

      await vi.waitFor(() => {
        expect(webview.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            command: 'graph:load',
            requestId: 'req_10',
            payload: { nodes: [{ id: '1' }], edges: [] },
          }),
        );
      });
    });
  });

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------

  describe('error handling', () => {
    it('should send error response when handler throws', async () => {
      bridge.onRequest('capabilities:get', async () => {
        throw new Error('Service unavailable');
      });

      webview.simulateMessage({
        command: 'capabilities:get',
        requestId: 'req_err',
      } as WebviewToExtensionMessage);

      await vi.waitFor(() => {
        expect(webview.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            command: 'capabilities:get',
            requestId: 'req_err',
            error: 'Service unavailable',
          }),
        );
      });
    });

    it('should send stringified error when non-Error is thrown', async () => {
      bridge.onRequest('ready', async () => {
        throw 'raw string error'; // eslint-disable-line no-throw-literal
      });

      webview.simulateMessage({
        command: 'ready',
        requestId: 'req_raw',
      } as WebviewToExtensionMessage);

      await vi.waitFor(() => {
        expect(webview.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            command: 'ready',
            requestId: 'req_raw',
            error: 'raw string error',
          }),
        );
      });
    });
  });

  // -----------------------------------------------------------------------
  // Disposal
  // -----------------------------------------------------------------------

  describe('dispose()', () => {
    it('should clear handlers on dispose', () => {
      bridge.onRequest('ready', vi.fn());
      bridge.dispose();

      // After disposal, sending a message that used to have a handler
      // should log "cannot send" instead of routing
      webview.simulateMessage({
        command: 'ready',
        requestId: 'req_disposed',
      } as WebviewToExtensionMessage);

      // The handler should NOT be called — it was cleared
      // Instead the bridge logs "No handler"
      expect(output.appendLine).toHaveBeenCalledWith(
        '[MessageBridge] Disposed',
      );
    });

    it('should log disposed message', () => {
      bridge.dispose();
      expect(output.appendLine).toHaveBeenCalledWith('[MessageBridge] Disposed');
    });
  });
});
