import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/webview',
    rollupOptions: {
      input: 'src/webview/index.tsx',
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index[extname]',
        format: 'iife',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
