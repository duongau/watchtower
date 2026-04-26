// ---------------------------------------------------------------------------
// Webview bridge tests (DOM-side code)
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock globals BEFORE importing the bridge module
// ---------------------------------------------------------------------------

const mockVsCodeApi = {
  postMessage: vi.fn(),
  getState: vi.fn(),
  setState: vi.fn(),
};

// acquireVsCodeApi is a global in VS Code webviews
vi.stubGlobal('acquireVsCodeApi', () => mockVsCodeApi);

// Capture message listeners registered via window.addEventListener
type MessageHandler = (event: MessageEvent) => void;
let messageListeners: MessageHandler[] = [];

const originalAddEventListener = globalThis.window?.addEventListener;
vi.stubGlobal('window', {
  addEventListener: vi.fn((type: string, handler: MessageHandler) => {
    if (type === 'message') {
      messageListeners.push(handler);
    }
  }),
  removeEventListener: vi.fn(),
});

// ---------------------------------------------------------------------------
// Import the module under test (AFTER stubs are in place)
// ---------------------------------------------------------------------------

// We need a fresh module for each test to reset internal state.
// Use dynamic import inside each describe block, or accept shared state.
// For simplicity, we'll import once and work with the module-level state.

let bridge: typeof import('../src/webview/services/bridge.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simulate extension → webview message */
function simulateIncoming(data: Record<string, unknown>) {
  const event = { data } as MessageEvent;
  for (const listener of messageListeners) {
    listener(event);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Webview Bridge', () => {
  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    messageListeners = [];

    // Reset module-level state by re-importing with cache bust
    vi.resetModules();
    bridge = await import('../src/webview/services/bridge.js');
  });

  afterEach(() => {
    // Cancel any pending requests to avoid timer leaks
    bridge.cancelAllPending();
  });

  // -----------------------------------------------------------------------
  // request() — Promise resolution
  // -----------------------------------------------------------------------

  describe('request()', () => {
    it('should resolve when a matching response arrives', async () => {
      const promise = bridge.request<{ agents: string[] }>('agent:list');

      // Simulate the extension sending back a response
      simulateIncoming({
        command: 'agent:list',
        requestId: getLastRequestId(),
        payload: { agents: ['kakashi'] },
      });

      const result = await promise;
      expect(result).toEqual({ agents: ['kakashi'] });
    });

    it('should reject when the response has an error field', async () => {
      const promise = bridge.request('agent:get', { agentId: 'missing' });

      simulateIncoming({
        command: 'agent:get',
        requestId: getLastRequestId(),
        error: 'Agent not found',
      });

      await expect(promise).rejects.toThrow('Agent not found');
    });

    it('should post the request message via vscode API', () => {
      // Catch to prevent unhandled rejection when cancelAllPending runs
      bridge.request('graph:load').catch(() => {});

      expect(mockVsCodeApi.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'graph:load',
          requestId: expect.any(String),
        }),
      );
    });

    it('should include payload in the request message', () => {
      bridge.request('agent:get', { agentId: 'kakashi' }).catch(() => {});

      expect(mockVsCodeApi.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'agent:get',
          payload: { agentId: 'kakashi' },
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // request() — timeout
  // -----------------------------------------------------------------------

  describe('request() timeout', () => {
    it('should reject after timeout if no response arrives', async () => {
      vi.useFakeTimers();

      const promise = bridge.request('squad:list', undefined, 100);

      vi.advanceTimersByTime(101);

      await expect(promise).rejects.toThrow('timed out');

      vi.useRealTimers();
    });
  });

  // -----------------------------------------------------------------------
  // onPush()
  // -----------------------------------------------------------------------

  describe('onPush()', () => {
    it('should invoke handler when a push message arrives', () => {
      const handler = vi.fn();
      bridge.onPush('theme:changed', handler);

      simulateIncoming({
        command: 'theme:changed',
        payload: { kind: 'dark' },
      });

      expect(handler).toHaveBeenCalledWith({ kind: 'dark' });
    });

    it('should not invoke handler for different commands', () => {
      const handler = vi.fn();
      bridge.onPush('theme:changed', handler);

      simulateIncoming({
        command: 'graph:update',
        payload: { nodes: [], edges: [] },
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple handlers for the same command', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bridge.onPush('showError', handler1);
      bridge.onPush('showError', handler2);

      simulateIncoming({
        command: 'showError',
        payload: { message: 'oops' },
      });

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
    });

    it('should return an unsubscribe function', () => {
      const handler = vi.fn();
      const unsub = bridge.onPush('navigate', handler);

      unsub();

      simulateIncoming({
        command: 'navigate',
        payload: { route: '/dashboard' },
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // cancelAllPending()
  // -----------------------------------------------------------------------

  describe('cancelAllPending()', () => {
    it('should reject all outstanding requests', async () => {
      const p1 = bridge.request('agent:list');
      const p2 = bridge.request('squad:list');

      bridge.cancelAllPending();

      await expect(p1).rejects.toThrow('cancelled');
      await expect(p2).rejects.toThrow('cancelled');
    });
  });

  // -----------------------------------------------------------------------
  // postMessage (fire-and-forget)
  // -----------------------------------------------------------------------

  describe('postMessage()', () => {
    it('should send message via vscode API without expecting response', () => {
      bridge.postMessage({
        command: 'ready',
        requestId: 'req_fire',
      } as any);

      expect(mockVsCodeApi.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ command: 'ready' }),
      );
    });
  });
});

// ---------------------------------------------------------------------------
// Helper: extract the requestId from the last postMessage call
// ---------------------------------------------------------------------------

function getLastRequestId(): string {
  const calls = mockVsCodeApi.postMessage.mock.calls;
  const lastCall = calls[calls.length - 1];
  return lastCall?.[0]?.requestId ?? '';
}
