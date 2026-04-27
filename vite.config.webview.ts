import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/webview',
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/webview/index.tsx',
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index[extname]',
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  css: {
    // Force CSS to be extracted to a separate file (not inlined in JS)
    // This is required for VS Code webview CSP compliance
  },
});
