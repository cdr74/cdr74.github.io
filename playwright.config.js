import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:8000',
    browserName: 'chromium',
  },
  webServer: {
    command: 'npx http-server . --no-cache -p 8000 -c-1',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
  },
});
