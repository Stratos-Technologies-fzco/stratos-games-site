import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// The finished game is built straight into the box folder (one level up) so stratos.games serves it.
export default defineConfig({
  base: './',
  plugins: [preact()],
  build: { outDir: '..', emptyOutDir: false, target: 'es2020', chunkSizeWarningLimit: 900, rollupOptions: { input: { main: 'index.html', lab: 'anim-lab.html' } } },
});
