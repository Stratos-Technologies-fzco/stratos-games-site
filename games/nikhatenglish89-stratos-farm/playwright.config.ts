import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'e2e',
  timeout: 60000,
  use: { baseURL: 'http://localhost:5173', viewport: { width: 1280, height: 720 } },
  webServer: { command: 'npx vite --port 5173 --strictPort', url: 'http://localhost:5173/app.html', reuseExistingServer: true, timeout: 60000 },
});
