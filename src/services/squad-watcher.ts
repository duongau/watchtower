// ---------------------------------------------------------------------------
// Watchtower — Squad Watcher
// Monitors .squad/ directories for changes and triggers graph rebuilds.
// Uses vscode.workspace.createFileSystemWatcher with 300ms debouncing.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';

const DEBOUNCE_MS = 300;

/** Watch patterns for squad-related files */
const WATCH_PATTERNS = [
  '**/.squad/team.md',
  '**/.squad/agents/*/charter.md',
  '**/.squad/agents/*/history.md',
  '**/.squad/decisions.md',
  '**/.squad/decisions/inbox/*.md',
  '**/.squad/skills/*/SKILL.md',
  '**/.squad/config.json',
  '**/.squad/routing.md',
];

export class SquadWatcher implements vscode.Disposable {
  private readonly watchers: vscode.FileSystemWatcher[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  private onChangeCallback: (() => void) | undefined;

  constructor(private readonly outputChannel: vscode.OutputChannel) {}

  /** Start watching .squad/ in all workspace folders */
  start(): void {
    for (const pattern of WATCH_PATTERNS) {
      const watcher = vscode.workspace.createFileSystemWatcher(pattern);

      watcher.onDidChange((uri) => this.onFileEvent(uri));
      watcher.onDidCreate((uri) => this.onFileEvent(uri));
      watcher.onDidDelete((uri) => this.onFileEvent(uri));

      this.watchers.push(watcher);
    }

    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
      for (const folder of folders) {
        this.outputChannel.appendLine(`[SquadWatcher] Watching .squad/ in ${folder.uri.fsPath}`);
      }
    } else {
      this.outputChannel.appendLine('[SquadWatcher] Watching .squad/ (no workspace folders open)');
    }
  }

  /** Register callback for when squad files change */
  onChange(callback: () => void): void {
    this.onChangeCallback = callback;
  }

  /** Stop all watchers */
  dispose(): void {
    if (this.debounceTimer !== undefined) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    for (const watcher of this.watchers) {
      watcher.dispose();
    }
    this.watchers.length = 0;

    this.outputChannel.appendLine('[SquadWatcher] Disposed');
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private onFileEvent(uri: vscode.Uri): void {
    // Compute relative path for logging
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    const relativePath = folder
      ? uri.fsPath.slice(folder.uri.fsPath.length + 1).replace(/\\/g, '/')
      : uri.fsPath;

    this.outputChannel.appendLine(`[SquadWatcher] File changed: ${relativePath}`);

    // Reset debounce timer
    if (this.debounceTimer !== undefined) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = undefined;
      this.outputChannel.appendLine('[SquadWatcher] Rebuilding graph...');
      this.onChangeCallback?.();
    }, DEBOUNCE_MS);
  }
}
