import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Read CSS files as raw text for static analysis — no DOM needed.
// ---------------------------------------------------------------------------

const CSS_FILES = [
  { name: 'App.css', path: resolve(__dirname, '../src/webview/App.css') },
  { name: 'AgentNode.css', path: resolve(__dirname, '../src/webview/components/AgentNode.css') },
  { name: 'RootNode.css', path: resolve(__dirname, '../src/webview/components/RootNode.css') },
];

function readCss(filePath: string): string {
  return readFileSync(filePath, 'utf-8');
}

/** Strip CSS comments (/* ... * /) so we don't flag hex colors inside comments. */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

// ---------------------------------------------------------------------------
// Test 1: No hardcoded hex colors
// ---------------------------------------------------------------------------

describe('CSS theme compliance — no hardcoded hex colors', () => {
  // Matches #rgb, #rrggbb, #rrggbbaa (3, 4, 6, or 8 hex digits)
  const HEX_COLOR_RE = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;

  // Intentional brand/identity colors that cannot come from VS Code theme
  const ALLOWED_HEX = new Set(['#ffffff']); // Avatar text on colored backgrounds

  for (const file of CSS_FILES) {
    it(`${file.name} has no hardcoded hex colors`, () => {
      const raw = readCss(file.path);
      const clean = stripComments(raw);
      const matches = (clean.match(HEX_COLOR_RE) ?? []).filter(c => !ALLOWED_HEX.has(c.toLowerCase()));
      expect(matches, `Found hardcoded hex colors: ${matches.join(', ')}`).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// Test 2: All color-related values use var(--vscode- prefix
// ---------------------------------------------------------------------------

describe('CSS theme compliance — color values use VS Code theme variables', () => {
  // Match common color properties and their values
  const COLOR_PROPS_RE =
    /(?:^|;|\{)\s*(?:color|background|background-color|border-color|border|fill|stroke|outline|box-shadow)\s*:\s*([^;{}]+)/gm;

  // Values that are OK without var(--vscode-): inherit, transparent, none, currentColor,
  // numeric-only values, simple layout keywords, rgba with low alpha for overlays
  const ALLOWED_RAW = /^(?:inherit|transparent|none|currentColor|0|unset|initial|\d+px|rgba?\(\s*0|#ffffff)/i;

  for (const file of CSS_FILES) {
    it(`${file.name} uses var(--vscode-) for all color values`, () => {
      const raw = readCss(file.path);
      const clean = stripComments(raw);
      const violations: string[] = [];
      let match: RegExpExecArray | null;

      while ((match = COLOR_PROPS_RE.exec(clean)) !== null) {
        const value = match[1].trim();
        // Skip values that don't set a color
        if (ALLOWED_RAW.test(value)) continue;
        // Skip values using CSS variables
        if (value.includes('var(--vscode-')) continue;
        // Skip shorthand with only sizes (e.g. border-width)
        if (/^\d+(\.\d+)?px\s*(solid|dashed|dotted)?\s*$/.test(value)) continue;
        // If it has var(--vscode-) anywhere in a compound value, that's fine
        if (/var\(--vscode-/.test(value)) continue;
        violations.push(`"${value}"`);
      }

      expect(violations, `Non-themed color values: ${violations.join(', ')}`).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// Test 3: Required CSS classes exist
// ---------------------------------------------------------------------------

describe('CSS theme compliance — required CSS classes exist', () => {
  const REQUIRED_AGENT_CLASSES = [
    'agent-node',
    'agent-node--active',
    'agent-node--idle',
    'agent-node--offline',
    'agent-node--selected',
    'agent-node__dot',
    'agent-node__name',
    'agent-node__role',
    'agent-node__badge',
    'agent-node__handle',
    'agent-node__accent',
    'agent-node__body',
    'agent-node__header',
    'agent-node__footer',
  ];

  const REQUIRED_ROOT_CLASSES = [
    'root-node',
    'root-node--selected',
    'root-node__body',
    'root-node__name',
    'root-node__meta',
    'root-node__handle',
  ];

  const agentCss = readCss(CSS_FILES[1].path);
  const rootCss = readCss(CSS_FILES[2].path);

  it.each(REQUIRED_AGENT_CLASSES)('AgentNode.css defines .%s', (cls) => {
    // Check for the class as a selector (with dot prefix)
    expect(agentCss).toContain(`.${cls}`);
  });

  it.each(REQUIRED_ROOT_CLASSES)('RootNode.css defines .%s', (cls) => {
    expect(rootCss).toContain(`.${cls}`);
  });
});
