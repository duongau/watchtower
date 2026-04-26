import { describe, it, expect, vi } from 'vitest';
import { getWebviewContent } from '../src/providers/getWebviewContent';

// Build a minimal webview mock for getWebviewContent
function makeMockWebview() {
  return {
    asWebviewUri: vi.fn((uri: { fsPath: string }) =>
      `https://file+.vscode-resource.vscode-cdn.net${uri.fsPath}`,
    ),
    cspSource: 'https://file+.vscode-resource.vscode-cdn.net',
  };
}

const extensionUri = { fsPath: '/ext', scheme: 'file' };

describe('getWebviewContent()', () => {
  describe('HTML structure', () => {
    it('returns valid HTML with DOCTYPE, html, head, and body', () => {
      const html = getWebviewContent(makeMockWebview() as any, extensionUri as any);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
    });

    it('includes a root mount point div', () => {
      const html = getWebviewContent(makeMockWebview() as any, extensionUri as any);
      expect(html).toContain('<div id="root">');
    });

    it('references index.js in a script tag', () => {
      const html = getWebviewContent(makeMockWebview() as any, extensionUri as any);
      expect(html).toMatch(/src="[^"]*index\.js"/);
    });
  });

  describe('CSP (Content Security Policy)', () => {
    it('includes a CSP meta tag with nonce', () => {
      const html = getWebviewContent(makeMockWebview() as any, extensionUri as any);
      expect(html).toContain('Content-Security-Policy');
      expect(html).toMatch(/nonce-[A-Za-z0-9+/=]+/);
    });

    it('does not contain unsafe-inline in CSP', () => {
      const html = getWebviewContent(makeMockWebview() as any, extensionUri as any);
      // Extract just the CSP meta tag content
      const cspMatch = html.match(/content="([^"]*)"/);
      expect(cspMatch).not.toBeNull();
      const csp = cspMatch![1];
      expect(csp).not.toContain('unsafe-inline');
    });

    it('does not contain unsafe-eval in CSP', () => {
      const html = getWebviewContent(makeMockWebview() as any, extensionUri as any);
      const cspMatch = html.match(/content="([^"]*)"/);
      expect(cspMatch).not.toBeNull();
      const csp = cspMatch![1];
      expect(csp).not.toContain('unsafe-eval');
    });
  });

  describe('nonce uniqueness', () => {
    it('generates a unique nonce per call', () => {
      const webview = makeMockWebview();
      const html1 = getWebviewContent(webview as any, extensionUri as any);
      const html2 = getWebviewContent(webview as any, extensionUri as any);

      // Extract nonces from both outputs
      const noncePattern = /nonce-([A-Za-z0-9+/=]+)/g;

      const nonces1 = [...html1.matchAll(noncePattern)].map((m) => m[1]);
      const nonces2 = [...html2.matchAll(noncePattern)].map((m) => m[1]);

      // Each call should have at least one nonce
      expect(nonces1.length).toBeGreaterThan(0);
      expect(nonces2.length).toBeGreaterThan(0);

      // Nonces from separate calls should differ
      expect(nonces1[0]).not.toBe(nonces2[0]);
    });

    it('uses the same nonce for script and CSP within a single call', () => {
      const html = getWebviewContent(makeMockWebview() as any, extensionUri as any);
      const noncePattern = /nonce-([A-Za-z0-9+/=]+)/g;
      const allNonces = [...html.matchAll(noncePattern)].map((m) => m[1]);

      // Should have multiple nonce references (CSP + script + style), all the same value
      expect(allNonces.length).toBeGreaterThanOrEqual(2);
      const unique = new Set(allNonces);
      expect(unique.size).toBe(1);
    });
  });
});
