import { vi } from 'vitest';

const mockOutputChannel = {
  appendLine: vi.fn(),
  show: vi.fn(),
  dispose: vi.fn(),
};

const mockDisposable = { dispose: vi.fn() };

// Webview mock — shared so tests can spy on it
export const mockWebview = {
  html: '',
  onDidReceiveMessage: vi.fn(() => mockDisposable),
  postMessage: vi.fn(),
  asWebviewUri: vi.fn((uri: { fsPath: string }) => `https://file+.vscode-resource.vscode-cdn.net${uri.fsPath}`),
  cspSource: 'https://file+.vscode-resource.vscode-cdn.net',
  options: {},
};

// Panel mock — returned by createWebviewPanel
export const mockPanel = {
  webview: mockWebview,
  reveal: vi.fn(),
  dispose: vi.fn(),
  visible: true,
  onDidChangeViewState: vi.fn(() => mockDisposable),
  onDidDispose: vi.fn(() => mockDisposable),
};

export const window = {
  createOutputChannel: vi.fn(() => mockOutputChannel),
  createWebviewPanel: vi.fn(() => mockPanel),
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
  fs: {
    readFile: vi.fn(),
    readDirectory: vi.fn(),
    stat: vi.fn(),
    writeFile: vi.fn(),
    delete: vi.fn(),
    createDirectory: vi.fn(),
  },
  createFileSystemWatcher: vi.fn(() => ({
    onDidChange: vi.fn(() => ({ dispose: vi.fn() })),
    onDidCreate: vi.fn(() => ({ dispose: vi.fn() })),
    onDidDelete: vi.fn(() => ({ dispose: vi.fn() })),
    dispose: vi.fn(),
  })),
  getWorkspaceFolder: vi.fn(() => undefined),
};

export const FileType = {
  Unknown: 0,
  File: 1,
  Directory: 2,
  SymbolicLink: 64,
};

export const Uri = {
  file: vi.fn((f: string) => ({ fsPath: f, scheme: 'file' })),
  parse: vi.fn((s: string) => ({ toString: () => s })),
  joinPath: vi.fn((base: { fsPath: string }, ...segments: string[]) => ({
    fsPath: [base.fsPath, ...segments].join('/'),
    scheme: 'file',
  })),
};

export const ViewColumn = {
  One: 1,
  Two: 2,
  Three: 3,
};

export const EventEmitter = vi.fn().mockImplementation(() => ({
  event: vi.fn(),
  fire: vi.fn(),
}));

export type ExtensionContext = {
  subscriptions: { dispose: () => void }[];
};
