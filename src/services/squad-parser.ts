// ---------------------------------------------------------------------------
// Watchtower — Squad Parser
// Reads .squad/ files and returns structured data.
// Uses vscode.workspace.fs for all file I/O (no Node.js fs).
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import type { AgentStatus, ParsedAgent, ParsedDecision, ParsedSquad } from '../types/index.js';

// ---------------------------------------------------------------------------
// team.md parser
// ---------------------------------------------------------------------------

interface TeamParseResult {
  agents: ParsedAgent[];
  projectContext: Record<string, string>;
}

/**
 * Parse the ## Members table and ## Project Context from team.md content.
 *
 * Expected table format:
 * | Name | Role | Charter | Status |
 * |------|------|---------|--------|
 * | Minato | Lead / Architect | [charter](...) | Active |
 */
export function parseTeamMd(content: string): TeamParseResult {
  const agents: ParsedAgent[] = [];
  const projectContext: Record<string, string> = {};

  // --- Parse Members table ---
  const membersMatch = content.match(/## Members\s*\n([\s\S]*?)(?=\n## |$)/);
  if (membersMatch) {
    const tableBlock = membersMatch[1];
    const lines = tableBlock.split('\n').filter((l) => l.trim().startsWith('|'));

    // Separate header, separator, and data rows
    const tableRows: string[] = [];
    let headerRow: string | undefined;

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip separator rows like |------|------|---------|--------|
      // Must include | in the set since separators have internal pipes
      if (/^\|[-\s:|]+\|$/.test(trimmed)) continue;

      if (!headerRow) {
        headerRow = trimmed;
      } else {
        tableRows.push(trimmed);
      }
    }

    if (!headerRow) return { agents, projectContext };

    const headers = headerRow
      .split('|')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);

    const nameIdx = headers.indexOf('name');
    const roleIdx = headers.indexOf('role');
    const statusIdx = headers.indexOf('status');

    for (const row of tableRows) {
      const cells = row
        .split('|')
        .slice(1, -1) // drop leading/trailing empty segments from |...|
        .map((c) => c.trim());

      const name = nameIdx >= 0 && nameIdx < cells.length ? cells[nameIdx] : '';
      const role = roleIdx >= 0 && roleIdx < cells.length ? cells[roleIdx] : '';
      const rawStatus = statusIdx >= 0 && statusIdx < cells.length ? cells[statusIdx].toLowerCase() : '';

      if (!name) continue;

      // Map status strings to AgentStatus — be lenient with emoji/text
      let status: AgentStatus = 'idle';
      if (rawStatus.includes('active')) status = 'active';
      else if (rawStatus.includes('monitor') || rawStatus.includes('🔄')) status = 'active';
      else if (rawStatus.includes('idle')) status = 'idle';
      else if (rawStatus.includes('offline')) status = 'offline';
      else if (rawStatus.includes('error')) status = 'error';

      agents.push({ name, role, status });
    }
  }

  // --- Parse Project Context ---
  const contextMatch = content.match(/## Project Context\s*\n([\s\S]*?)(?=\n## |$)/);
  if (contextMatch) {
    const contextBlock = contextMatch[1];
    // Parse "- **Key:** Value" or "- **Key**: Value" lines
    const kvPattern = /[-*]\s*\*\*(.+?):?\*\*:?\s+(.+)/g;
    let match;
    while ((match = kvPattern.exec(contextBlock)) !== null) {
      projectContext[match[1].trim()] = match[2].trim();
    }
  }

  return { agents, projectContext };
}

// ---------------------------------------------------------------------------
// charter.md parser
// ---------------------------------------------------------------------------

interface CharterParseResult {
  role: string;
  responsibilities: string[];
}

/**
 * Extract role and responsibilities from a charter.md file.
 *
 * Expected format:
 * # Name — Role
 * ## Responsibilities
 * - Item 1
 * - Item 2
 */
export function parseCharterMd(content: string): CharterParseResult {
  let role = '';
  const responsibilities: string[] = [];

  // Extract role from h1: "# Name — Role" or "## Identity" → "**Role:** value"
  const h1Match = content.match(/^#\s+.+?\s*[—–-]\s*(.+)/m);
  if (h1Match) {
    role = h1Match[1].trim();
  }

  // Fallback: look for **Role:** in Identity section
  if (!role) {
    const roleMatch = content.match(/\*\*Role:?\*\*:?\s+(.+)/);
    if (roleMatch) {
      role = roleMatch[1].trim();
    }
  }

  // Parse Responsibilities section
  const respMatch = content.match(/## Responsibilities\s*\n([\s\S]*?)(?=\n## |$)/);
  if (respMatch) {
    const lines = respMatch[1].split('\n');
    for (const line of lines) {
      const itemMatch = line.match(/^[-*]\s+(.+)/);
      if (itemMatch) {
        responsibilities.push(itemMatch[1].trim());
      }
    }
  }

  return { role, responsibilities };
}

// ---------------------------------------------------------------------------
// decisions.md parser
// ---------------------------------------------------------------------------

/**
 * Parse decision entries from decisions.md.
 *
 * Expected format:
 * ### 2026-04-26T00:00:00Z: Title
 * **By:** Author
 * **What:** Summary text...
 * **Why:** Reasoning...
 */
export function parseDecisionsMd(content: string): ParsedDecision[] {
  const decisions: ParsedDecision[] = [];

  // Split content into decision blocks by ### headers
  const headerPattern = /^### (\S+):\s+(.+)/gm;
  const headers: { timestamp: string; title: string; index: number }[] = [];
  let match;

  while ((match = headerPattern.exec(content)) !== null) {
    headers.push({
      timestamp: match[1].trim(),
      title: match[2].trim(),
      index: match.index + match[0].length,
    });
  }

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = i + 1 < headers.length
      ? content.lastIndexOf('\n###', headers[i + 1].index)
      : content.length;
    const body = content.slice(start, end);

    const byMatch = body.match(/\*\*By:?\*\*:?\s+(.+)/);
    const whatMatch = body.match(/\*\*What:?\*\*:?\s+(.+)/);

    decisions.push({
      timestamp: headers[i].timestamp,
      title: headers[i].title,
      by: byMatch ? byMatch[1].trim() : 'Unknown',
      summary: whatMatch ? whatMatch[1].trim() : '',
    });
  }

  return decisions;
}

// ---------------------------------------------------------------------------
// Full squad loader
// ---------------------------------------------------------------------------

/**
 * Read all .squad/ files from a project root and combine into a ParsedSquad.
 * Uses vscode.workspace.fs for all file I/O.
 *
 * @param squadPath - Absolute path to the project root containing .squad/
 */
export async function loadSquadFromPath(squadPath: string): Promise<ParsedSquad> {
  const rootUri = vscode.Uri.file(squadPath);
  const squadUri = vscode.Uri.joinPath(rootUri, '.squad');

  const squad: ParsedSquad = {
    name: squadPath.split(/[/\\]/).filter(Boolean).pop() ?? 'Unknown',
    path: squadPath,
    agents: [],
    decisions: [],
    skills: [],
  };

  // --- Read team.md ---
  try {
    const teamUri = vscode.Uri.joinPath(squadUri, 'team.md');
    const teamBytes = await vscode.workspace.fs.readFile(teamUri);
    const teamContent = new TextDecoder().decode(teamBytes);
    const { agents, projectContext } = parseTeamMd(teamContent);
    squad.agents = agents;

    // Extract universe from project context
    if (projectContext['Source universe']) {
      squad.universe = projectContext['Source universe'];
    }

    // Extract project name if available
    if (projectContext['Project']) {
      const projectName = projectContext['Project'].split(/\s*[—–-]\s*/)[0].trim();
      if (projectName) {
        squad.name = projectName;
      }
    }
  } catch {
    // team.md not found — squad.agents stays empty
  }

  // --- Read config.json for model overrides ---
  try {
    const configUri = vscode.Uri.joinPath(squadUri, 'config.json');
    const configBytes = await vscode.workspace.fs.readFile(configUri);
    const configContent = new TextDecoder().decode(configBytes);
    const config = JSON.parse(configContent) as {
      agentModelOverrides?: Record<string, string>;
    };

    if (config.agentModelOverrides) {
      for (const agent of squad.agents) {
        const key = agent.name.toLowerCase();
        if (config.agentModelOverrides[key]) {
          agent.model = config.agentModelOverrides[key];
        }
      }
    }
  } catch {
    // config.json not found or invalid — skip model overrides
  }

  // --- Read charter.md for each agent ---
  for (const agent of squad.agents) {
    try {
      const charterUri = vscode.Uri.joinPath(
        squadUri,
        'agents',
        agent.name.toLowerCase(),
        'charter.md',
      );
      await vscode.workspace.fs.stat(charterUri);
      agent.charterPath = charterUri.fsPath;
    } catch {
      // No charter file for this agent
    }
  }

  // --- Read decisions.md ---
  try {
    const decisionsUri = vscode.Uri.joinPath(squadUri, 'decisions.md');
    const decisionsBytes = await vscode.workspace.fs.readFile(decisionsUri);
    const decisionsContent = new TextDecoder().decode(decisionsBytes);
    squad.decisions = parseDecisionsMd(decisionsContent);
  } catch {
    // decisions.md not found
  }

  // --- List skills directories ---
  try {
    const skillsUri = vscode.Uri.joinPath(squadUri, 'skills');
    const entries = await vscode.workspace.fs.readDirectory(skillsUri);
    squad.skills = entries
      .filter(([, type]) => type === vscode.FileType.Directory)
      .map(([name]) => name);
  } catch {
    // skills/ not found
  }

  return squad;
}
