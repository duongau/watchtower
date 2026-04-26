import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{ padding: '20px', color: 'var(--vscode-editor-foreground)' }}>
      <h1>Watchtower</h1>
      <p>Agent graph will render here.</p>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
