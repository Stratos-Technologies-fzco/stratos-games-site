/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Source entry is app.html; the build goes to ./build and scripts/finalize.mjs
// turns build/app.html into the folder's index.html (the site plays index.html).
export default defineConfig({
  base: './',
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'build',
    assetsDir: '.',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: { input: 'app.html', output: { manualChunks: { phaser: ['phaser'], react: ['react', 'react-dom'] } } },
  },
  server: { open: '/app.html' },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
