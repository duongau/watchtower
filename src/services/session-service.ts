// ---------------------------------------------------------------------------
// Watchtower — Session Service
// Reads session data from .squad/log/ and .squad/orchestration-log/.
// Uses vscode.workspace.fs for all file I/O (no Node.js fs).
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';

export interface Session {
  id: string;
  timestamp: string;
  agent: string;
  title: string;
  /** Absolute file path to the session log */
  path: string;
}

export class SessionService implements vscode.Disposable {
  constructor(private readonly outputChannel: vscode.OutputChannel) {}

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** List recent sessions across all provided squad paths, sorted newest first. */
  async listSessions(squadPaths: string[]): Promise<Session[]> {
    const sessions: Session[] = [];

    for (const squadPath of squadPaths) {
      const rootUri = vscode.Uri.file(squadPath);
      const squadUri = vscode.Uri.joinPath(rootUri, '.squad');

      // Read from .squad/log/
      const logSessions = await this.readSessionDir(
        vscode.Uri.joinPath(squadUri, 'log'),
      );
      sessions.push(...logSessions);

      // Read from .squad/orchestration-log/
      const orchSessions = await this.readSessionDir(
        vscode.Uri.joinPath(squadUri, 'orchestration-log'),
      );
      sessions.push(...orchSessions);
    }

    // Sort by timestamp descending (most recent first)
    sessions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    this.outputChannel.appendLine(
      `[SessionService] Found ${sessions.length} sessions across ${squadPaths.length} squad(s)`,
    );

    return sessions;
  }

  /** Get the full text content of a session file. */
  async getSession(sessionPath: string): Promise<string> {
    const uri = vscode.Uri.file(sessionPath);
    const bytes = await vscode.workspace.fs.readFile(uri);
    return new TextDecoder().decode(bytes);
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private async readSessionDir(dirUri: vscode.Uri): Promise<Session[]> {
    const sessions: Session[] = [];

    let entries: [string, vscode.FileType][];
    try {
      entries = await vscode.workspace.fs.readDirectory(dirUri);
    } catch {
      // Directory doesn't exist — not an error
      return sessions;
    }

    const mdFiles = entries.filter(
      ([name, type]) => type === vscode.FileType.File && name.endsWith('.md'),
    );

    for (const [filename] of mdFiles) {
      const parsed = this.parseSessionFilename(filename);
      if (!parsed) { continue; }

      const fileUri = vscode.Uri.joinPath(dirUri, filename);
      sessions.push({
        id: filename.replace(/\.md$/, ''),
        timestamp: parsed.timestamp,
        agent: parsed.agent,
        title: parsed.title,
        path: fileUri.fsPath,
      });
    }

    return sessions;
  }

  /**
   * Parse session metadata from the filename.
   *
   * Real-world patterns from our .squad/:
   *   Log:              `2026-04-26-phase0-and-phase1.md`
   *   Orchestration:    `2026-04-26-hiruzen-design.md`
   *   ISO timestamp:    `2026-04-26T14-00-00Z-hiruzen-sidebar-design.md`
   */
  private parseSessionFilename(
    filename: string,
  ): { timestamp: string; agent: string; title: string } | undefined {
    const stem = filename.replace(/\.md$/, '');

    // Pattern 1: ISO-ish timestamp prefix with T separator
    // e.g. 2026-04-26T14-00-00Z-hiruzen-sidebar-design
    const isoMatch = stem.match(
      /^(\d{4}-\d{2}-\d{2}T[\d-]+Z?)-(.+)$/,
    );
    if (isoMatch) {
      const rawTs = isoMatch[1];
      const timestamp = this.normalizeTimestamp(rawTs);
      const remainder = isoMatch[2];

      const parts = remainder.split('-');
      const agent = this.capitalizeFirst(parts[0] || 'unknown');
      const title = parts.slice(1).map(w => this.capitalizeFirst(w)).join(' ') || remainder;

      return { timestamp, agent, title };
    }

    // Pattern 2: Date prefix without T separator
    // e.g. 2026-04-26-hiruzen-design or 2026-04-26-phase0-and-phase1
    const dateMatch = stem.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    if (dateMatch) {
      const timestamp = dateMatch[1];
      const remainder = dateMatch[2];
      const parts = remainder.split('-');

      // Heuristic: if first word looks like an agent name (lowercase, not a common word)
      const commonWords = ['phase', 'session', 'summary', 'report', 'all', 'full'];
      const firstWord = parts[0]?.toLowerCase() || '';
      const isAgentName = firstWord.length > 0 && !commonWords.includes(firstWord) && !/^\d/.test(firstWord);

      if (isAgentName) {
        const agent = this.capitalizeFirst(parts[0]);
        const title = parts.slice(1).map(w => this.capitalizeFirst(w)).join(' ') || remainder;
        return { timestamp, agent, title };
      } else {
        const title = parts.map(w => this.capitalizeFirst(w)).join(' ');
        return { timestamp, agent: 'Team', title };
      }
    }

    // Fallback — use filename as title, no timestamp
    return {
      timestamp: '',
      agent: 'unknown',
      title: stem.replace(/-/g, ' '),
    };
  }

  /** Convert filename-safe timestamp (hyphens) back to ISO 8601 (colons). */
  private normalizeTimestamp(raw: string): string {
    // 2026-04-26T14-00-00Z → 2026-04-26T14:00:00Z
    // Match the T then groups of NN-NN-NN and replace second/third hyphens with colons
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})(Z?)$/);
    if (match) {
      return `${match[1]}T${match[2]}:${match[3]}:${match[4]}${match[5] || 'Z'}`;
    }
    return raw;
  }

  private capitalizeFirst(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // -----------------------------------------------------------------------
  // Disposable
  // -----------------------------------------------------------------------

  dispose(): void {
    // No resources to release
  }
}
