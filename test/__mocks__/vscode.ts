import { vi } from 'vitest';

const mockOutputChannel = {
  appendLine: vi.fn(),
  show: vi.fn(),
  dispose: vi.fn(),
};

const mockDisposable = { dispose: vi.fn() };

export const window = {
  createOutputChannel: vi.fn(() => mockOutputChannel),
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  showWarningMessage: vi.fn(),
};

export const commands = {
  registerCommand: vi.fn(() => mockDisposable),
  executeCommand: vi.fn(),
};

export const workspace = {
  getConfiguration: vi.fn(() => ({
    get: vi.fn(),
    update: vi.fn(),
  })),
  workspaceFolders: [],
};

export const Uri = {
  file: vi.fn((f: string) => ({ fsPath: f, scheme: 'file' })),
  parse: vi.fn((s: string) => ({ toString: () => s })),
};

export const EventEmitter = vi.fn().mockImplementation(() => ({
  event: vi.fn(),
  fire: vi.fn(),
}));

export type ExtensionContext = {
  subscriptions: { dispose: () => void }[];
};
