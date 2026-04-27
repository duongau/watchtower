// ---------------------------------------------------------------------------
// Watchtower — Squad Discovery
// Finds all .squad/ directories across workspace folders.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';

/**
 * Discover all .squad/ directories in the current VS Code workspace.
 * Returns absolute paths to the project roots that contain a .squad/ dir.
 */
export async function discoverSquads(): Promise<string[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return [];
  }

  const discovered: string[] = [];

  for (const folder of workspaceFolders) {
    const squadUri = vscode.Uri.joinPath(folder.uri, '.squad');
    try {
      const stat = await vscode.workspace.fs.stat(squadUri);
      if (stat.type & vscode.FileType.Directory) {
        discovered.push(folder.uri.fsPath);
      }
    } catch {
      // .squad/ doesn't exist in this workspace folder — skip
    }
  }

  return discovered;
}
