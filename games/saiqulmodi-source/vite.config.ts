import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5173, strictPort: true, open: true },
  build: { target: 'es2020', outDir: 'dist', chunkSizeWarningLimit: 800 },
});
