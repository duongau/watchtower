// ---------------------------------------------------------------------------
// Watchtower — Skills Tree Provider
// Shows skills from .squad/skills/ directories, grouped by squad when
// multiple squads exist, flat list for single squad.
// ---------------------------------------------------------------------------

import * as vscode from 'vscode';
import type { ParsedSquad } from '../types/index.js';
import { GraphService } from '../services/graph-service.js';

// ---------------------------------------------------------------------------
// Tree item types
// ---------------------------------------------------------------------------

type SkillTreeItem = SquadSkillGroup | SkillItem;

class SquadSkillGroup extends vscode.TreeItem {
  readonly contextValue = 'skillGroup';
  readonly skills: string[];
  readonly squadPath: string;

  constructor(squad: ParsedSquad) {
    super(squad.name, vscode.TreeItemCollapsibleState.Expanded);
    this.skills = squad.skills;
    this.squadPath = squad.path;
    this.description = `${squad.skills.length} skill${squad.skills.length === 1 ? '' : 's'}`;
    this.iconPath = new vscode.ThemeIcon('folder');
  }
}

class SkillItem extends vscode.TreeItem {
  readonly contextValue = 'skill';

  constructor(skillName: string, squadPath: string) {
    super(skillName, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('lightbulb');
    this.tooltip = skillName;

    // Click opens SKILL.md
    const skillMdPath = vscode.Uri.joinPath(
      vscode.Uri.file(squadPath),
      '.squad',
      'skills',
      skillName,
      'SKILL.md',
    );
    this.command = {
      command: 'vscode.open',
      title: 'Open Skill',
      arguments: [skillMdPath],
    };
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export class SkillsTreeProvider implements vscode.TreeDataProvider<SkillTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SkillTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private squads: ParsedSquad[] = [];

  constructor(private readonly graphService: GraphService) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SkillTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: SkillTreeItem): Promise<SkillTreeItem[]> {
    if (!element) {
      // Root level
      this.squads = await this.graphService.getSquads();
      const squadsWithSkills = this.squads.filter((s) => s.skills.length > 0);

      if (squadsWithSkills.length === 0) {
        return [];
      }

      // Single squad: flat skill list
      if (squadsWithSkills.length === 1) {
        const squad = squadsWithSkills[0];
        return squad.skills.map((s) => new SkillItem(s, squad.path));
      }

      // Multiple squads: group under squad names
      return squadsWithSkills.map((s) => new SquadSkillGroup(s));
    }

    if (element instanceof SquadSkillGroup) {
      return element.skills.map((s) => new SkillItem(s, element.squadPath));
    }

    return [];
  }
}
