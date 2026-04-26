// ---------------------------------------------------------------------------
// Protocol type tests — verify discriminators, type narrowing, structure
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest';
import type {
  RequestMessage,
  ResponseMessage,
  PushMessage,
  WebviewToExtensionMessage,
  ExtensionToWebviewMessage,
  WebviewCommand,
  ExtensionCommand,
} from '../src/types/messages.js';

// ---------------------------------------------------------------------------
// Helpers — build concrete message values for runtime checks
// ---------------------------------------------------------------------------

function makeRequest<C extends string>(command: C, requestId: string, payload?: unknown): RequestMessage<C> {
  return { command, requestId, ...(payload !== undefined ? { payload } : {}) };
}

function makeResponse<C extends string>(command: C, requestId: string, payload?: unknown, error?: string): ResponseMessage<C> {
  return { command, requestId, ...(payload !== undefined ? { payload } : {}), ...(error ? { error } : {}) };
}

function makePush<C extends string>(command: C, payload?: unknown): PushMessage<C> {
  return { command, ...(payload !== undefined ? { payload } : {}) };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Message Protocol Types', () => {
  // -----------------------------------------------------------------------
  // Discriminator uniqueness
  // -----------------------------------------------------------------------

  describe('discriminator uniqueness', () => {
    it('WebviewToExtensionMessage commands should be unique strings', () => {
      // Build one message per command in the union
      const webviewCommands: WebviewCommand[] = [
        'ready',
        'refreshAll',
        'graph:load',
        'agent:list',
        'agent:get',
        'squad:list',
        'capabilities:get',
        'command:execute',
        'openAgent',
      ];

      const unique = new Set(webviewCommands);
      expect(unique.size).toBe(webviewCommands.length);
    });

    it('ExtensionToWebviewMessage push commands should be unique strings', () => {
      const pushCommands = [
        'graph:update',
        'agent:update',
        'squad:update',
        'theme:changed',
        'showError',
        'navigate',
      ];

      const unique = new Set(pushCommands);
      expect(unique.size).toBe(pushCommands.length);
    });
  });

  // -----------------------------------------------------------------------
  // Request messages have requestId
  // -----------------------------------------------------------------------

  describe('request messages', () => {
    it('should have a requestId field', () => {
      const msg = makeRequest('agent:list', 'req_1');
      expect(msg).toHaveProperty('requestId');
      expect(typeof msg.requestId).toBe('string');
    });

    it('should carry optional payload', () => {
      const msg = makeRequest('agent:get', 'req_2', { agentId: 'kakashi' });
      expect(msg.payload).toEqual({ agentId: 'kakashi' });
    });
  });

  // -----------------------------------------------------------------------
  // Response messages
  // -----------------------------------------------------------------------

  describe('response messages', () => {
    it('should have command and requestId', () => {
      const msg = makeResponse('agent:list', 'req_1', { agents: [] });
      expect(msg.command).toBe('agent:list');
      expect(msg.requestId).toBe('req_1');
    });

    it('should carry error field when present', () => {
      const msg = makeResponse('agent:get', 'req_2', undefined, 'Not found');
      expect(msg.error).toBe('Not found');
    });
  });

  // -----------------------------------------------------------------------
  // Push messages have no requestId
  // -----------------------------------------------------------------------

  describe('push messages', () => {
    it('should not have a requestId field', () => {
      const msg = makePush('graph:update', { nodes: [], edges: [] });
      expect(msg).not.toHaveProperty('requestId');
      expect(msg.command).toBe('graph:update');
    });
  });

  // -----------------------------------------------------------------------
  // Type narrowing via switch on command
  // -----------------------------------------------------------------------

  describe('type narrowing', () => {
    it('should narrow WebviewToExtensionMessage by command', () => {
      const msg: WebviewToExtensionMessage = {
        command: 'agent:get',
        requestId: 'req_99',
        payload: { agentId: 'kakashi' },
      };

      // Runtime switch — proves the discriminated union works
      switch (msg.command) {
        case 'agent:get':
          expect(msg.requestId).toBe('req_99');
          expect(msg.payload).toEqual({ agentId: 'kakashi' });
          break;
        default:
          throw new Error('Should have matched agent:get');
      }
    });

    it('should narrow ExtensionToWebviewMessage for push messages', () => {
      const msg: ExtensionToWebviewMessage = {
        command: 'theme:changed',
        payload: { kind: 'dark' },
      } as ExtensionToWebviewMessage;

      switch (msg.command) {
        case 'theme:changed':
          expect((msg as { payload: { kind: string } }).payload.kind).toBe('dark');
          break;
        default:
          throw new Error('Should have matched theme:changed');
      }
    });

    it('should narrow ExtensionToWebviewMessage for response messages', () => {
      const msg: ExtensionToWebviewMessage = {
        command: 'agent:list',
        requestId: 'req_5',
        payload: { agents: [] },
      } as ExtensionToWebviewMessage;

      switch (msg.command) {
        case 'agent:list':
          expect((msg as { requestId: string }).requestId).toBe('req_5');
          break;
        default:
          throw new Error('Should have matched agent:list');
      }
    });
  });

  // -----------------------------------------------------------------------
  // Compile-time type assertions (no runtime effect, but proves types work)
  // -----------------------------------------------------------------------

  describe('type compilation', () => {
    it('WebviewCommand should accept valid command strings', () => {
      const cmd: WebviewCommand = 'ready';
      expect(cmd).toBe('ready');
    });

    it('ExtensionCommand should accept valid command strings', () => {
      const cmd: ExtensionCommand = 'graph:update';
      expect(cmd).toBe('graph:update');
    });
  });
});
